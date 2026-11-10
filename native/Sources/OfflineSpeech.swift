import AppKit
import AVFoundation
import SoundAnalysis

final class SpeechObserver: NSObject, SNResultsObserving {
    var emitResult: ((Double) -> Void)?
    func request(_ request: SNRequest, didProduce result: SNResult) {
        guard let result = result as? SNClassificationResult else { return }
        let speech = result.classifications.filter { ["speech", "conversation", "narration", "monologue"].contains($0.identifier) }.map { $0.confidence }.max() ?? 0
        emitResult?(speech)
    }
    func request(_ request: SNRequest, didFailWithError error: Error) { emit(["type": "offline-error", "message": "本机人声分类暂不可用，请重新开启线下会议提醒"]) }
    func requestDidComplete(_ request: SNRequest) {}
}
final class SpeechBufferGate: @unchecked Sendable {
    private let lock = NSLock(); private var pending = false
    func acquire() -> Bool { lock.lock(); defer { lock.unlock() }; if pending { return false }; pending = true; return true }
    func release() { lock.lock(); pending = false; lock.unlock() }
}
@MainActor final class OfflineSpeechWatcher {
    let engine = AVAudioEngine(), observer = SpeechObserver()
    let queue = DispatchQueue(label: "io.dsh.offline-speech", qos: .utility)
    var analyzer: SNAudioStreamAnalyzer?
    let gate = SpeechBufferGate()
    func start() async {
        var allowed = AVCaptureDevice.authorizationStatus(for: .audio) == .authorized
        if AVCaptureDevice.authorizationStatus(for: .audio) == .notDetermined { allowed = await AVCaptureDevice.requestAccess(for: .audio) }
        guard allowed else { emit(["type": "offline-permission", "message": "麦克风未授权，请在系统设置中允许后重新开启线下会议提醒"]); NSApp.terminate(nil); return }
        do {
            let node = engine.inputNode, format = node.outputFormat(forBus: 0)
            guard format.sampleRate > 0 && format.channelCount > 0 else { throw NSError(domain: "microphone", code: 1) }
            let analyzer = SNAudioStreamAnalyzer(format: format), request = try SNClassifySoundRequest(classifierIdentifier: .version1)
            guard request.knownClassifications.contains("speech") else { throw NSError(domain: "classifier", code: 1) }
            request.overlapFactor = 0.5; self.analyzer = analyzer
            observer.emitResult = { confidence in emit(["type": "speech-activity", "confidence": confidence]) }
            try analyzer.add(request, withObserver: observer)
            let gate = self.gate, queue = self.queue
            node.installTap(onBus: 0, bufferSize: 8192, format: format) { buffer, time in
                guard gate.acquire() else { return }
                // The one queued in-memory buffer is released after classification. No file or ASR path exists.
                guard let copy = AVAudioPCMBuffer(pcmFormat: buffer.format, frameCapacity: buffer.frameLength) else { gate.release(); return }
                copy.frameLength = buffer.frameLength
                let source = UnsafeMutableAudioBufferListPointer(buffer.mutableAudioBufferList), target = UnsafeMutableAudioBufferListPointer(copy.mutableAudioBufferList)
                for index in 0..<min(source.count, target.count) { if let src = source[index].mData, let dst = target[index].mData { memcpy(dst, src, Int(source[index].mDataByteSize)) } }
                queue.async { analyzer.analyze(copy, atAudioFramePosition: time.sampleTime); gate.release() }
            }
            engine.prepare(); try engine.start(); emit(["type": "offline-ready", "classifier": "Apple SoundAnalysis version1", "savesAudio": false, "transcribes": false, "uploads": false])
        } catch { emit(["type": "offline-error", "message": "无法启动本机人声检测，请检查默认麦克风并重新开启提醒"]); NSApp.terminate(nil) }
    }
    func stop() { engine.inputNode.removeTap(onBus: 0); engine.stop(); analyzer?.removeAllRequests(); analyzer = nil }
}
// Synthetic-file test path: never opens a microphone. It does not output recognized words.
func classifySpeechFile(_ path: String) throws {
    let request = try SNClassifySoundRequest(classifierIdentifier: .version1), analyzer = try SNAudioFileAnalyzer(url: URL(fileURLWithPath: path)), observer = SpeechObserver()
    var samples = 0, maximum = 0.0
    observer.emitResult = { value in samples += 1; maximum = max(maximum, value) }
    try analyzer.add(request, withObserver: observer); analyzer.analyze()
    emit(["type": "offline-file-test", "samples": samples, "maximumSpeechConfidence": maximum, "recordsMicrophone": false, "savesAudio": false, "transcribes": false, "uploads": false])
}
