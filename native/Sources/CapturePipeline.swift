import AppKit
import AVFoundation
import ScreenCaptureKit
import CoreMedia

private let emitLock = NSLock()
func emit(_ object: [String: Any]) {
    guard let data = try? JSONSerialization.data(withJSONObject: object, options: [.sortedKeys]) else { return }
    emitLock.lock(); defer { emitLock.unlock() }
    do { try FileHandle.standardOutput.write(contentsOf: data + Data([10])) } catch { }
}
func permissions() -> [String: Any] { ["type": "permissions", "system": CGPreflightScreenCaptureAccess(), "microphone": AVCaptureDevice.authorizationStatus(for: .audio) == .authorized] }

final class CapturePipeline: NSObject, SCStreamOutput, SCStreamDelegate {
    let root: URL
    let queue = DispatchQueue(label: "io.dsh.meeting.audio")
    // Engine lifecycle is owned by MainActor, never the tap/notification queue.
    var engine: AVAudioEngine?
    var configurationObserver: NSObjectProtocol?
    var microphoneGeneration = 0
    var microphoneHealth = MicrophoneRecovery()
    var stream: SCStream?
    var files: [String: AVAudioFile] = [:]
    var mixer: AudioTimeline!
    var active = false, paused = false, stopping = false, tapInstalled = false
    var timer: DispatchSourceTimer?
    var pending: [Float] = []
    var streamPCM = false
    func setStreamPCM(_ enabled: Bool) { queue.sync { streamPCM = enabled } }
    var written = 0, segmentIndex = 0
    var levels: [String: Float] = ["microphone": 0, "system": 0]
    var last: [String: Double] = [:]
    var frames: [String: Int] = ["microphone": 0, "system": 0]
    var failure: String?
    let systemOnly: Bool
    let microphoneOnly: Bool
    var statusChanged: (([String: Any]) -> Void)?
    var ended: (() -> Void)?
    init(root: URL, systemOnly: Bool = false, microphoneOnly: Bool = false) { self.root = root; self.systemOnly = systemOnly; self.microphoneOnly = microphoneOnly; super.init(); mixer = AudioTimeline { [weak self] samples in self?.writeMixed(samples) } }
    var now: Double { ProcessInfo.processInfo.systemUptime }
    func makeFile(_ name: String) throws -> AVAudioFile {
        try AVAudioFile(forWriting: root.appendingPathComponent(name + ".m4a"), settings: [AVFormatIDKey: kAudioFormatMPEG4AAC, AVSampleRateKey: 16000, AVNumberOfChannelsKey: 1, AVEncoderBitRateKey: 48000], commonFormat: .pcmFormatFloat32, interleaved: false)
    }
    @MainActor func start() async throws {
        guard !active, !stopping else { throw audioError("录音已经开始") }
        guard microphoneOnly || CGPreflightScreenCaptureAccess() || CGRequestScreenCaptureAccess() else { throw audioError("电脑声音未授权。请在系统设置 → 隐私与安全性 → 屏幕录制中允许“DSH 会议音频”，再重新开始记录。") }
        if !systemOnly {
            let allowed = await AVCaptureDevice.requestAccess(for: .audio)
            guard allowed else { throw audioError("麦克风未授权。请在系统设置 → 隐私与安全性 → 麦克风中允许“DSH 会议音频”。") }
        }
        if !microphoneOnly {
        let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: true)
        guard let display = content.displays.first else { throw audioError("没有可用的显示器，无法采集电脑声音") }
        let config = SCStreamConfiguration()
        config.capturesAudio = true; config.excludesCurrentProcessAudio = true
        config.sampleRate = 48000; config.channelCount = 2
        config.width = 2; config.height = 2; config.minimumFrameInterval = CMTime(seconds: 1, preferredTimescale: 1); config.showsCursor = false
        let capture = SCStream(filter: SCContentFilter(display: display, excludingWindows: []), configuration: config, delegate: self)
        try capture.addStreamOutput(self, type: .audio, sampleHandlerQueue: queue)
        // Screen buffers are discarded immediately; no screen image is read or saved.
        try capture.addStreamOutput(self, type: .screen, sampleHandlerQueue: queue)
        stream = capture
        }
        try FileManager.default.createDirectory(at: root.appendingPathComponent("segments"), withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
        files["mixed"] = try makeFile("mixed")
        // ScreenCaptureKit can change the audio hardware configuration during startup.
        // Start it first, then construct the microphone engine against the settled route.
        try await stream?.startCapture()
        if !systemOnly {
            queue.sync { microphoneHealth.start(at: now) }
            do { try rebuildMicrophone() }
            catch { queue.sync { microphoneHealth.configurationChanged(at: now) } }
        }
        queue.sync {
            mixer.start(at: now); active = true
            let clock = DispatchSource.makeTimerSource(queue: queue); clock.schedule(deadline: .now() + 0.5, repeating: 0.1)
            var ticks = 0
            clock.setEventHandler { [weak self] in
                guard let self = self, self.active, !self.stopping else { return }
                self.mixer.drain(now: self.now); ticks += 1
                if ticks % 5 == 0 { self.status() }
                if ticks % 5 == 0 && !self.systemOnly { Task { @MainActor in self.checkMicrophone() } }
            }
            clock.resume(); timer = clock; emit(["type": "started", "system": !microphoneOnly, "microphone": !systemOnly]); status()
        }
    }
    @MainActor func rebuildMicrophone() throws {
        // Do not hold the audio queue while removing a tap: its callback synchronizes there.
        queue.sync { microphoneGeneration += 1; mixer.converters.removeValue(forKey: "microphone") }
        if let observer = configurationObserver { NotificationCenter.default.removeObserver(observer); configurationObserver = nil }
        if tapInstalled { engine?.inputNode.removeTap(onBus: 0); tapInstalled = false }
        engine?.stop()
        let replacement = AVAudioEngine(); engine = replacement
        let generation = queue.sync { microphoneGeneration }
        configurationObserver = NotificationCenter.default.addObserver(forName: .AVAudioEngineConfigurationChange, object: replacement, queue: nil) { [weak self] _ in
            // Apple's callback runs on an internal queue. Defer teardown to MainActor.
            self?.queue.async { [weak self] in
                guard let self = self, generation == self.microphoneGeneration else { return }
                self.microphoneHealth.configurationChanged(at: self.now)
            }
        }
        let input = replacement.inputNode, format = input.outputFormat(forBus: 0)
        guard format.sampleRate > 0, format.channelCount > 0 else { throw audioError("麦克风输入暂不可用") }
        input.installTap(onBus: 0, bufferSize: 4096, format: format) { [weak self] buffer, when in
            guard let self = self else { return }
            self.queue.sync {
                guard generation == self.microphoneGeneration else { return }
                self.consume(buffer, source: "microphone", timestamp: when.isHostTimeValid ? AVAudioTime.seconds(forHostTime: when.hostTime) : self.now - Double(buffer.frameLength) / format.sampleRate)
            }
        }
        tapInstalled = true; replacement.prepare(); try replacement.start()
    }
    @MainActor func checkMicrophone() {
        let action = queue.sync { () -> MicrophoneRecovery.Action in
            guard active, !stopping, failure == nil else { return .none }
            let action = microphoneHealth.tick(at: now, running: engine?.isRunning == true,
                authorized: AVCaptureDevice.authorizationStatus(for: .audio) == .authorized)
            if action == .restart || action == .recovered { status() }
            return action
        }
        switch action {
        case .restart:
            // No await between the state check and rebuild, so pause/stop cannot interleave.
            do { try rebuildMicrophone() } catch { /* Next bounded attempt retries the current route. */ }
        case .failed:
            queue.sync { fail(AVCaptureDevice.authorizationStatus(for: .audio) == .authorized
                ? "麦克风重连失败，录音已停止并保留已采集内容。请检查输入设备后重新开始。"
                : "麦克风权限已关闭，录音已停止并保留已采集内容。") }
        default: break
        }
    }
    func consume(_ input: AVAudioPCMBuffer, source: String, timestamp: Double) {
        guard active, !paused, !stopping, input.frameLength > 0 else { return }
        do {
            let converted = try mixer.converted(input, source: source)
            guard let samples = converted.floatChannelData?[0], converted.frameLength > 0 else { return }
            if source == "microphone" { microphoneHealth.received(at: now) }
            let data = Array(UnsafeBufferPointer(start: samples, count: Int(converted.frameLength)))
            var energy: Float = 0; for x in data { energy += x * x }
            levels[source] = sqrt(energy / Float(data.count)); frames[source, default: 0] += data.count; last[source] = now
            let time = timestamp.isFinite && abs(timestamp - now) < 30 ? timestamp : now - Double(data.count) / 16000
            mixer.append(data, at: time)
        } catch { fail("\(source == "system" ? "电脑声音" : "麦克风")保存失败：\(error.localizedDescription)") }
    }
    func writeMixed(_ samples: [Float]) {
        do {
            let format = AVAudioFormat(standardFormatWithSampleRate: 16000, channels: 1)!
            guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(samples.count)), let channel = buffer.floatChannelData?[0] else { throw audioError("混合音频缓冲区不可用") }
            buffer.frameLength = AVAudioFrameCount(samples.count); channel.update(from: samples, count: samples.count)
            try files["mixed"]?.write(from: buffer)
            if streamPCM {
                let data = pcmWave(samples).dropFirst(44)
                emit(["type":"pcm", "data":data.base64EncodedString(), "seconds":Double(written) / 16000])
            }
            pending.append(contentsOf: samples); written += samples.count
            if pending.count >= 96000 { flushSegment() }
        } catch { fail("混合录音保存失败：\(error.localizedDescription)") }
    }
    func flushSegment() {
        guard !pending.isEmpty else { return }
        let samples = pending; pending.removeAll(keepingCapacity: true)
        let wave = pcmWave(samples), name = String(format: "%06d.wav", segmentIndex)
        do { try wave.write(to: root.appendingPathComponent("segments").appendingPathComponent(name), options: .atomic) }
        catch { fail("音频分段保存失败：\(error.localizedDescription)"); return }
        let seconds = Double(written - samples.count) / 16000
        emit(["type": "audio", "sequence": segmentIndex, "seconds": seconds, "wav": wave.base64EncodedString()]); segmentIndex += 1
    }
    func status() {
        let mic: Float = paused || now - (last["microphone"] ?? 0) > 1 ? 0 : levels["microphone"] ?? 0
        let sys: Float = paused || now - (last["system"] ?? 0) > 1 ? 0 : levels["system"] ?? 0
        let value: [String: Any] = ["type": "status", "seconds": Double(written) / 16000, "paused": paused, "microphoneLevel": mic, "systemLevel": sys, "microphoneFrames": frames["microphone"] ?? 0, "systemFrames": frames["system"] ?? 0, "droppedSamples": mixer.droppedSamples, "microphoneRecovering": microphoneHealth.recovering, "microphoneRecoveries": microphoneHealth.recoveries, "microphoneInterruptions": microphoneHealth.interruptions, "microphoneGapSeconds": microphoneHealth.gapSeconds, "microphoneRestartAttempts": microphoneHealth.totalAttempts]
        emit(value); var display = value
        if microphoneHealth.recovering && !paused { display["status"] = microphoneOnly ? "麦克风连接中，暂未采集到声音…" : "麦克风重连中，电脑声音继续保存…" }
        else if microphoneHealth.recoveries > 0 { display["status"] = "麦克风已恢复，连接中断期间可能缺少麦克风声音" }
        statusChanged?(display)
    }
    @MainActor func setPaused(_ value: Bool) {
        queue.sync { guard active, !stopping else { return }; if value { microphoneHealth.pause(); mixer.pause(now: now); flushSegment(); if streamPCM { emit(["type":"stream-boundary"]) } } else { microphoneHealth.resume(at: now); mixer.resume(now: now) }; paused = value; status() }
    }
    func fail(_ message: String) {
        guard failure == nil else { return }; failure = message; emit(["type": "error", "message": message]); Task { @MainActor in await self.stop() }
    }
    func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .audio, active, !paused, !stopping, CMSampleBufferDataIsReady(sampleBuffer), let desc = CMSampleBufferGetFormatDescription(sampleBuffer), let asbd = CMAudioFormatDescriptionGetStreamBasicDescription(desc), let format = AVAudioFormat(streamDescription: asbd) else { return }
        let count = CMSampleBufferGetNumSamples(sampleBuffer)
        guard count > 0, let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(count)) else { return }
        buffer.frameLength = AVAudioFrameCount(count)
        guard CMSampleBufferCopyPCMDataIntoAudioBufferList(sampleBuffer, at: 0, frameCount: Int32(count), into: buffer.mutableAudioBufferList) == noErr else { fail("电脑声音采样解码失败"); return }
        consume(buffer, source: "system", timestamp: CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(sampleBuffer)))
    }
    func stream(_ stream: SCStream, didStopWithError error: Error) { queue.async { self.fail("电脑声音采集已中断：" + error.localizedDescription) } }
    @MainActor func stop() async {
        let shouldStop = queue.sync { () -> Bool in if stopping { return false }; stopping = true; microphoneHealth.stop(); microphoneGeneration += 1; return true }
        guard shouldStop else { return }
        if let observer = configurationObserver { NotificationCenter.default.removeObserver(observer); configurationObserver = nil }
        if tapInstalled { engine?.inputNode.removeTap(onBus: 0); tapInstalled = false }; engine?.stop()
        try? await stream?.stopCapture()
        queue.sync {
            timer?.cancel(); timer = nil
            if active { mixer.finish(now: now); flushSegment() }
            active = false; files.removeAll()
            let result: [String: Any] = ["type": "stopped", "seconds": Double(written) / 16000, "failed": failure != nil, "microphoneFrames": frames["microphone"] ?? 0, "systemFrames": frames["system"] ?? 0, "microphoneRecoveries": microphoneHealth.recoveries, "microphoneInterruptions": microphoneHealth.interruptions, "microphoneGapSeconds": microphoneHealth.gapSeconds, "microphoneRestartAttempts": microphoneHealth.totalAttempts]
            if let data = try? JSONSerialization.data(withJSONObject: result) { try? data.write(to: root.appendingPathComponent("completed.json"), options: .atomic) }
            emit(result)
        }
        ended?()
    }
}
