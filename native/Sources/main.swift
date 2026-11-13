import AppKit
import AVFoundation

func selfTest() {
    var result: [[Float]] = []
    let mixer = AudioTimeline { result.append($0) }
    mixer.start(at: 100)
    mixer.append([Float](repeating: 0.2, count: 1600), at: 100)
    mixer.append([Float](repeating: 0.4, count: 1600), at: 100)
    mixer.drain(through: 3200)
    precondition(result.count == 2 && abs(result[0][200] - 0.42) < 0.0001 && result[1].allSatisfy { $0 == 0 })
    mixer.pause(now: 100.2); mixer.append([Float](repeating: 1, count: 1600), at: 102)
    mixer.resume(now: 105.2); mixer.append([Float](repeating: 0.5, count: 1600), at: 105.2); mixer.drain(through: 4800)
    precondition(result.count == 3 && abs(result[2][200] - 0.35) < 0.0001)
    mixer.append([1], at: 90); precondition(mixer.droppedSamples > 0)
    let wave = pcmWave([-1, 0, 0.5, 1]); precondition(wave.count == 52 && String(data: wave.prefix(4), encoding: .ascii) == "RIFF")
    emit(["type": "self-test", "passed": true, "checks": ["source-mix", "silence", "pause-resume", "stale-samples", "pcm16-wave"]])
}

@MainActor final class CaptureDelegate: NSObject, NSApplicationDelegate {
    var pipeline: CapturePipeline?
    var overlay: MeetingPanel?
    var item: NSStatusItem?
    var inputBuffer = Data()
    var starting = false
    func applicationDidFinishLaunching(_ notification: Notification) {
        guard CommandLine.arguments.count >= 3, ["--capture", "--diagnostic-system", "--capture-microphone"].contains(CommandLine.arguments[1]) else {
            emit(["type": "error", "message": "采集组件必须由会议工作台启动"]); NSApp.terminate(nil); return
        }
        let root = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
        guard root.path.hasPrefix("/"), FileManager.default.fileExists(atPath: root.path) else { emit(["type": "error", "message": "会议录音目录不存在"]); NSApp.terminate(nil); return }
        let capture = CapturePipeline(root: root, systemOnly: CommandLine.arguments[1] == "--diagnostic-system", microphoneOnly: CommandLine.arguments[1] == "--capture-microphone")
        capture.ended = { [weak self] in
            self?.item?.button?.title = "DSH 会议"
            self?.overlay?.update(["ended": true, "status": "录音已结束，正在保存和整理…"])
            self?.overlay?.stop.isEnabled = true
            if self?.overlay == nil { NSApp.terminate(nil) }
        }
        capture.statusChanged = { [weak self] value in Task { @MainActor in self?.overlay?.update(value) } }; pipeline = capture
        FileHandle.standardInput.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            guard let self = self else { return }
            Task { @MainActor in
                if data.isEmpty { await self.pipeline?.stop(); NSApp.terminate(nil); return }
                self.inputBuffer.append(data)
                if self.inputBuffer.count > 262144 { await self.pipeline?.stop(); return }
                while let end = self.inputBuffer.firstIndex(of: 10) {
                    let line = self.inputBuffer.prefix(upTo: end); self.inputBuffer.removeSubrange(...end)
                    guard let value = try? JSONSerialization.jsonObject(with: line) as? [String: Any], let command = value["command"] as? String else { continue }
                    await self.command(command, value: value)
                }
            }
        }
        emit(["type": "ready", "version": "0.16.0"])
    }
    func command(_ command: String, value: [String: Any] = [:]) async {
        guard let pipeline = pipeline else { return }
        switch command {
        case "start":
            guard !starting else { return }; starting = true
            do {
                pipeline.setStreamPCM(value["streamPCM"] as? Bool == true)
                try await pipeline.start()
                overlay = MeetingPanel(title: value["title"] as? String ?? "会议记录")
                overlay?.submitQuestion = { question in emit(["type": "question", "text": question]) }
                overlay?.action = { [weak self] action in Task { @MainActor in await self?.command(action) } }
                item = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
                item?.button?.title = "● DSH 录音"
                let menu = NSMenu(); let stop = NSMenuItem(title: "结束并保存", action: #selector(stopCapture), keyEquivalent: "")
                stop.target = self; menu.addItem(stop)
                let show = NSMenuItem(title: "显示实时转写", action: #selector(showPanel), keyEquivalent: ""); show.target = self; menu.addItem(show); item?.menu = menu
            } catch { emit(["type": "error", "message": error.localizedDescription]); await pipeline.stop() }
        case "pause": pipeline.setPaused(true)
        case "resume": pipeline.setPaused(false)
        case "stop": await pipeline.stop()
        case "stream-pcm": pipeline.setStreamPCM(true)
        case "display": overlay?.update(value)
        case "show": overlay?.show()
        case "close": if !pipeline.active { NSApp.terminate(nil) }
        default: break
        }
    }
    @objc func showPanel() { overlay?.show() }
    @objc func stopCapture() { Task { @MainActor in await pipeline?.stop() } }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { false }
}

if CommandLine.arguments.contains("--offline-watch") {
    MainActor.assumeIsolated {
        let app = NSApplication.shared; app.setActivationPolicy(.accessory)
        let watcher = OfflineSpeechWatcher()
        FileHandle.standardInput.readabilityHandler = { handle in if handle.availableData.isEmpty { Task { @MainActor in watcher.stop(); NSApp.terminate(nil) } } }
        Task { @MainActor in await watcher.start() }; app.run()
    }; exit(0)
}
if let index = CommandLine.arguments.firstIndex(of: "--offline-file-test"), CommandLine.arguments.count > index + 1 { do { try classifySpeechFile(CommandLine.arguments[index + 1]) } catch { emit(["type":"offline-file-error", "message": "测试文件无法分类"]); exit(1) }; exit(0) }
if let index = CommandLine.arguments.firstIndex(of: "--bubble-preview"), CommandLine.arguments.count > index + 1 {
    MainActor.assumeIsolated {
        let app = NSApplication.shared; app.setActivationPolicy(.prohibited); let bubble = MeetingBubble(); let view = bubble.view
        view.layoutSubtreeIfNeeded(); let bitmap = view.bitmapImageRepForCachingDisplay(in: view.bounds)!; view.cacheDisplay(in: view.bounds, to: bitmap)
        try! bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[index + 1]))
        emit(["type": "bubble-test", "passed": view.bounds.width == 56 && view.bounds.height == 56, "recordsAudio": false])
    }; exit(0)
}
if let index = CommandLine.arguments.firstIndex(of: "--panel-preview"), CommandLine.arguments.count > index + 1 {
    MainActor.assumeIsolated {
        let app = NSApplication.shared; app.setActivationPolicy(.prohibited)
        let panel = MeetingPanel(title: "产品评审 · Product Review（测试文字）", show: false)
        panel.update(["seconds": 95.0, "transcript": "[00:04] 今天讨论会议工作台的录音和转写。\n\n[00:12] We will review the meeting workspace on Friday.\n\n[00:24] 小王负责接口联调，时间待确认。", "summary": "本次讨论录音、自动识别语言和会议安排。\n\n下一步：周五进行评审，接口联调由小王跟进。", "status": "AI 实时摘要 · 待核对"])
        let view = panel.panel.contentView!; view.layoutSubtreeIfNeeded()
        precondition(panel.panel.level == .floating && panel.transcript.isSelectable && panel.paneHeights.count == panel.visiblePanes.count)
        precondition(panel.paneHeights.allSatisfy { $0 >= 70 })
        let original = panel.visiblePanes
        for i in [1, 2] where panel.visiblePanes.contains(i) { if !panel.visiblePanes.contains(0) { panel.togglePane(0, persist: false) }; panel.togglePane(i, persist: false) }
        view.layoutSubtreeIfNeeded()
        precondition(panel.visiblePanes == [0] && panel.paneHeights.count == 1)
        for i in original where !panel.visiblePanes.contains(i) { panel.togglePane(i, persist: false) }
        if !original.contains(0) { panel.togglePane(0, persist: false) }
        view.layoutSubtreeIfNeeded()
        precondition(abs(panel.pause.frame.width - panel.stop.frame.width) < 2 && panel.stop.frame.width > 110)

        precondition(panel.paneHeights.allSatisfy { $0 >= 70 })
        guard let bitmap = view.bitmapImageRepForCachingDisplay(in: view.bounds) else { exit(2) }
        view.cacheDisplay(in: view.bounds, to: bitmap)
        try! bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[index + 1]))
        emit(["type": "panel-test", "passed": true, "floating": true, "transcriptSelectable": panel.transcript.isSelectable, "equalWidthButtons": true, "moduleSelection": true, "resizable": true, "recordsAudio": false])
    }; exit(0)
}
if let index = CommandLine.arguments.firstIndex(of: "--detection-prompt-preview"), CommandLine.arguments.count > index + 1 {
    MainActor.assumeIsolated {
        let app = NSApplication.shared; app.setActivationPolicy(.prohibited)
        let alert = recordingPrompt(["detected": true, "platform": "腾讯会议", "project": "default", "projects": [["id": "default", "name": "未分类"], ["id": "product", "name": "产品评审 · Product Review"]], "live": true, "canStart": true])
        let view = alert.window.contentView!; view.layoutSubtreeIfNeeded()
        precondition(alert.startButton.title == "开始录音并实时转写" && alert.startButton.keyEquivalent.isEmpty && alert.snoozeButton.keyEquivalent == "\r")
        precondition(alert.selectedProject == "default"); alert.projectMenu.selectItem(at: 1)
        precondition(alert.selectedProject == "product")
        let blocked = recordingPrompt(["detected": true, "canStart": false]); precondition(!blocked.startButton.isEnabled); blocked.start(); precondition(blocked.action == "dismiss")
        guard let bitmap = view.bitmapImageRepForCachingDisplay(in: view.bounds) else { exit(2) }; view.cacheDisplay(in: view.bounds, to: bitmap)
        try! bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[index + 1]))
        alert.start(); precondition(alert.response["project"] as? String == "product")
        emit(["type": "detection-prompt-test", "passed": true, "explicitConfirmation": true, "unreadyStartDisabled": true, "projectSelection": true, "logo": true, "recordsAudio": false])
    }; exit(0)
}
if CommandLine.arguments.contains("--prompt-interaction-self-test") {
    MainActor.assumeIsolated {
        let app = NSApplication.shared; app.setActivationPolicy(.accessory)
        let value: [String: Any] = ["detected": true, "platform": "飞书", "project": "default", "projects": [["id": "default", "name": "未分类"], ["id": "first", "name": "同名项目"], ["id": "second", "name": "同名项目"], ["id": "long", "name": String(repeating: "项目分类 Product Review · ", count: 4)]], "canStart": true]
        let prompt = recordingPrompt(value); precondition(prompt.projectMenu.numberOfItems == 4)
        DispatchQueue.main.async { prompt.projectMenu.selectItem(at: 2); prompt.startButton.performClick(nil) }
        let result = prompt.run(); precondition(result["action"] as? String == "start" && result["project"] as? String == "second")
        let later = recordingPrompt(value)
        DispatchQueue.main.async { later.projectMenu.selectItem(at: 3); later.snoozeButton.performClick(nil) }
        let postponed = later.run(); precondition(postponed["action"] as? String == "snooze" && postponed["project"] == nil)
        let blocked = recordingPrompt(["detected": true, "canStart": false])
        DispatchQueue.main.async { blocked.startButton.performClick(nil); precondition(blocked.action == "dismiss"); blocked.dismissButton.performClick(nil) }
        precondition(blocked.run()["action"] as? String == "dismiss")
        emit(["type": "prompt-interaction-test", "passed": true, "selectedProject": result["project"]!, "duplicateNames": true, "longNames": true, "blockedStart": true, "snoozeNoProjectWrite": true, "recordsAudio": false])
    }; exit(0)
}
if CommandLine.arguments.contains("--question-ui-self-test") {
    MainActor.assumeIsolated {
        NSApplication.shared.setActivationPolicy(.prohibited)
        let panel = MeetingPanel(title: "提问重试测试 · 不录音", show: false)
        func descendants(_ view: NSView) -> [NSView] { [view] + view.subviews.flatMap { descendants($0) } }
        if !panel.visiblePanes.contains(2) { panel.togglePane(2, persist: false) }
        let controls = descendants(panel.panel.contentView!)
        let button = controls.compactMap { $0 as? NSButton }.first { $0.title == "发送" }!
        let input = controls.compactMap { $0 as? NSTextField }.first { $0.placeholderString == "询问本场会议…" }!
        var submitted: [String] = []
        panel.submitQuestion = { submitted.append($0) }
        input.stringValue = "虚构会议什么时候验收？"
        button.performClick(nil)
        precondition(submitted.count == 1 && input.stringValue.isEmpty)
        panel.update(["questionBusy": true, "questionError": false, "questionDisplay": "正在回答…"])
        precondition(!button.isEnabled)
        panel.update(["questionBusy": false, "questionError": true, "questionDisplay": "本次回答未完成，请重试。"])
        precondition(button.isEnabled && button.title == "重试" && input.stringValue == submitted[0])
        input.stringValue = "修改后的问题"
        panel.update(["questionBusy": false, "questionError": true, "questionDisplay": "仍可重试"])
        precondition(input.stringValue == "修改后的问题")
        button.performClick(nil)
        precondition(submitted.last == "修改后的问题")
        panel.update(["questionBusy": false, "questionError": false, "questionDisplay": "测试回答"])
        precondition(button.isEnabled && button.title == "发送" && !panel.panel.isVisible && !panel.bubble.panel.isVisible)
        emit(["type": "question-ui-self-test", "passed": true, "recordsAudio": false, "showsWindows": false, "checks": ["failure-restores-question", "retry-button", "edited-draft-preserved", "success-restores-send"]])
    }; exit(0)
}
if CommandLine.arguments.contains("--floating-self-test") {
    MainActor.assumeIsolated {
        let app = NSApplication.shared; app.setActivationPolicy(.accessory)
        let host = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 320, height: 200), styleMask: [.titled, .miniaturizable], backing: .buffered, defer: false)
        host.title = "会议工作台最小化测试 · 非 DSH 窗口"
        let panel = MeetingPanel(title: "悬浮窗测试 · 不采集音频"); precondition(panel.bubble.panel.isVisible && !panel.panel.isVisible); panel.show(); precondition(!panel.bubble.panel.isVisible && panel.panel.isVisible); panel.collapse(); precondition(panel.bubble.panel.isVisible && !panel.panel.isVisible); panel.show()
        panel.update(["transcript": (0..<40).map { "[00:\(String(format: "%02d", $0))] 测试段落 \($0)：核对中英文会议内容 Meeting Workspace。" }.joined(separator: "\n\n")])
        panel.panel.contentView!.layoutSubtreeIfNeeded()
        let scroll = panel.transcript.enclosingScrollView!
        scroll.contentView.scroll(to: .zero); scroll.reflectScrolledClipView(scroll.contentView)
        panel.update(["transcript": (0..<41).map { "[00:\(String(format: "%02d", $0))] 测试段落 \($0)：核对中英文会议内容 Meeting Workspace。" }.joined(separator: "\n\n")])
        let preservedReadingPosition = scroll.contentView.bounds.origin.y < 2
        host.orderFrontRegardless(); host.miniaturize(nil)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            let passed = host.isMiniaturized && panel.panel.isVisible && !panel.panel.isMiniaturized && !panel.panel.hidesOnDeactivate && !panel.panel.canHide
            emit(["type": "floating-window-test", "passed": passed, "testHostMinimized": host.isMiniaturized, "panelVisible": panel.panel.isVisible, "preservedReadingPosition": preservedReadingPosition, "independentProcess": true, "realDshMinimized": false, "recordsAudio": false])
            panel.panel.orderOut(nil); panel.bubble.hide(); host.orderOut(nil); app.stop(nil)
        }
        app.run()
    }; exit(0)
}
if CommandLine.arguments.contains("--meeting-activity") { MainActor.assumeIsolated { emit(meetingActivity()) }; exit(0) }
if CommandLine.arguments.contains("--activity-self-test") { meetingActivitySelfTest(); exit(0) }
if let index = CommandLine.arguments.firstIndex(of: "--export-icons"), CommandLine.arguments.count > index + 1 {
    MainActor.assumeIsolated { try! exportMeetingIcons(CommandLine.arguments[index + 1]) }; exit(0)
}
if CommandLine.arguments.contains("--remind") {
    MainActor.assumeIsolated {
        let app = NSApplication.shared; app.setActivationPolicy(.accessory)
        let input = FileHandle.standardInput.readDataToEndOfFile()
        let value = (try? JSONSerialization.jsonObject(with: input)) as? [String: Any] ?? [:]
        NSApp.applicationIconImage = meetingWorkspaceIcon(256)
        emit(recordingPrompt(value).run())
    }; exit(0)
}
if let command = CommandLine.arguments.first(where: { ["--calendar-status", "--calendar-connect", "--calendar-sync"].contains($0) }) {
    // Launch Services runs the helper independently of the process waiting for it.
    DispatchQueue.global().asyncAfter(deadline: .now() + 140) { exit(124) }
    MainActor.assumeIsolated {
        let app = NSApplication.shared; app.setActivationPolicy(.accessory)
        Task { @MainActor in emit(await calendarCommand(command)); NSApp.terminate(nil) }; app.run()
    }; exit(0)
}
if CommandLine.arguments.contains("--permissions") { emit(permissions()); exit(0) }
if CommandLine.arguments.contains("--microphone-route-check") { MicrophoneInput.routeCheck(); exit(0) }
if CommandLine.arguments.contains("--version") { emit(["version": "0.16.0"]); exit(0) }
if CommandLine.arguments.contains("--microphone-recovery-self-test") { microphoneRecoverySelfTest(); exit(0) }
if let index = CommandLine.arguments.firstIndex(of: "--capture-runtime-check"), CommandLine.arguments.count > index + 1 {
    MainActor.assumeIsolated {
        let allowed = permissions()
        guard allowed["system"] as? Bool == true, allowed["microphone"] as? Bool == true else {
            emit(["type":"capture-runtime-check", "passed":false, "message":"当前诊断进程未获采集权限，未启动录音"]); exit(2)
        }
        let app = NSApplication.shared; app.setActivationPolicy(.prohibited)
        let capture = CapturePipeline(root: URL(fileURLWithPath: CommandLine.arguments[index + 1], isDirectory: true))
        Task { @MainActor in
            do {
                try await capture.start()
                try await Task.sleep(nanoseconds: 2_500_000_000)
                await capture.stop()
                let stats = capture.queue.sync { (capture.written, capture.frames["microphone"] ?? 0, capture.frames["system"] ?? 0, capture.failure) }
                emit(["type":"capture-runtime-check", "passed":stats.0 > 16000 && stats.1 > 0 && stats.3 == nil, "microphoneFrames":stats.1, "systemFrames":stats.2, "seconds":Double(stats.0)/16000, "visibleWindows":false])
                exit(stats.0 > 16000 && stats.1 > 0 && stats.3 == nil ? 0 : 1)
            } catch { await capture.stop(); emit(["type":"capture-runtime-check", "passed":false, "message":error.localizedDescription]); exit(1) }
        }
        app.run()
    }; exit(0)
}
if CommandLine.arguments.contains("--capture-ack-self-test") {
    Task {
        do {
            let early = CaptureAcknowledgement(); early.complete()
            try await early.wait(seconds: 0.1, message: "unexpected timeout")
            let dataFirst = CaptureAcknowledgement()
            DispatchQueue.global().asyncAfter(deadline: .now() + 0.01) { dataFirst.complete(); dataFirst.complete(audioError("late completion")) }
            try await dataFirst.wait(seconds: 0.1, message: "unexpected timeout")
            let missing = CaptureAcknowledgement(); var timedOut = false
            do { try await missing.wait(seconds: 0.02, message: "bounded timeout") } catch { timedOut = true }
            precondition(timedOut)
            missing.complete() // A late framework callback cannot resume twice.
            emit(["type":"capture-ack-self-test", "passed":true, "recordsAudio":false, "checks":["early-callback", "first-buffer-readiness", "bounded-missing-callback", "late-callback-idempotent"]])
            exit(0)
        } catch { emit(["type":"capture-ack-self-test", "passed":false]); exit(1) }
    }
    dispatchMain()
}
if CommandLine.arguments.contains("--self-test") { selfTest(); exit(0) }
MainActor.assumeIsolated {
 let app = NSApplication.shared
 app.setActivationPolicy(.accessory)
 let delegate = CaptureDelegate(); app.delegate = delegate; app.run()
}
