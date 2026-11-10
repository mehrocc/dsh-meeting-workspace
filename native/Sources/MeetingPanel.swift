import AppKit

private enum MeetingStyle {
    static let accent = NSColor(srgbRed: 0.424, green: 0.325, blue: 0.843, alpha: 1)
    static let ink = NSColor(srgbRed: 0.19, green: 0.21, blue: 0.27, alpha: 1)
    static let muted = NSColor(srgbRed: 0.56, green: 0.57, blue: 0.63, alpha: 1)
    static let background = NSColor(srgbRed: 0.966, green: 0.969, blue: 0.984, alpha: 1)
    static let line = NSColor(srgbRed: 0.91, green: 0.91, blue: 0.95, alpha: 1)
    static let lilac = NSColor(srgbRed: 0.938, green: 0.920, blue: 0.990, alpha: 1)
}
final class MeetingContentView: NSView {
    override var isOpaque: Bool { true }
    override func draw(_ dirtyRect: NSRect) { MeetingStyle.background.setFill(); dirtyRect.fill() }
}
@MainActor final class MeetingPanel: NSObject, NSWindowDelegate, NSSplitViewDelegate {
    let panel: NSPanel
    let clock = NSTextField(labelWithString: "00:00")
    let status = NSTextField(wrappingLabelWithString: "")
    let transcript = NSTextView(), summary = NSTextView(), answers = NSTextView()
    let pause = NSButton(title: "暂停", target: nil, action: nil)
    let stop = NSButton(title: "结束并保存", target: nil, action: nil)
    private let badge = NSTextField(labelWithString: "●  正在记录")
    private let count = NSTextField(labelWithString: "0 段")
    private let split = NSSplitView(frame: NSRect(x: 0, y: 0, width: 338, height: 420))
    private let views = NSPopUpButton(frame: .zero, pullsDown: true)
    private let question = NSTextField()
    private let ask = NSButton(title: "发送", target: nil, action: nil)
    private var cards: [NSView] = []
    private var visible = Set([0, 1, 2])
    private var lastQuestion = ""
    private var lastAnswerDisplay = ""
    private let paneTitles = ["逐字稿", "AI 摘要", "提问"]
    var submitQuestion: ((String) -> Void)?
    var visiblePanes: Set<Int> { visible }
    var paneHeights: [CGFloat] { split.arrangedSubviews.map { $0.frame.height } }
    private var lastTranscript = ""
    private var lastPartial = ""
    var action: ((String) -> Void)?
    var recording = true, paused = false
    let bubble = MeetingBubble()
    private let compact = NSButton(title: "收起", target: nil, action: nil)
    init(title meetingTitle: String, show: Bool = true) {
        panel = NSPanel(contentRect: NSRect(x: 0, y: 0, width: 360, height: 510), styleMask: [.titled, .closable, .resizable, .nonactivatingPanel], backing: .buffered, defer: false)
        super.init()
        panel.title = "DSH · 实时会议记录"; panel.appearance = NSAppearance(named: .aqua); panel.backgroundColor = MeetingStyle.background; panel.titlebarAppearsTransparent = true
        panel.level = .floating; panel.hidesOnDeactivate = false; panel.canHide = false; panel.isFloatingPanel = true; panel.isReleasedWhenClosed = false
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]; panel.minSize = NSSize(width: 305, height: 425); panel.becomesKeyOnlyIfNeeded = true; panel.delegate = self
        let content = MeetingContentView(); panel.contentView = content
        let stack = NSStackView(); stack.orientation = .vertical; stack.alignment = .leading; stack.spacing = 6; stack.translatesAutoresizingMaskIntoConstraints = false; content.addSubview(stack)
        NSLayoutConstraint.activate([stack.leadingAnchor.constraint(equalTo: content.leadingAnchor, constant: 13), stack.trailingAnchor.constraint(equalTo: content.trailingAnchor, constant: -9), stack.topAnchor.constraint(equalTo: content.topAnchor, constant: 9), stack.bottomAnchor.constraint(equalTo: content.bottomAnchor, constant: -9)])
        badge.font = .systemFont(ofSize: 10, weight: .semibold); badge.textColor = MeetingStyle.accent; badge.wantsLayer = true
        badge.setContentHuggingPriority(.required, for: .horizontal)
        clock.font = .monospacedDigitSystemFont(ofSize: 20, weight: .semibold)
        clock.textColor = MeetingStyle.accent
        clock.setContentHuggingPriority(.required, for: .horizontal)
        compact.target = self; compact.action = #selector(collapse); compact.isBordered = false
        views.font = .systemFont(ofSize: 11)
        views.setAccessibilityLabel("选择悬浮窗显示内容")
        let top = NSStackView(views: [badge, NSView(), clock, views, compact]); top.spacing = 6
        stack.addArrangedSubview(top); top.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true
        status.font = .systemFont(ofSize: 10); status.textColor = MeetingStyle.muted
        status.maximumNumberOfLines = 2
        stack.addArrangedSubview(status); status.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true
        status.isHidden = true

        split.isVertical = false
        split.dividerStyle = .thin
        split.delegate = self
        stack.addArrangedSubview(split); split.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true
        count.font = .systemFont(ofSize: 10); count.textColor = MeetingStyle.muted
        question.placeholderString = "询问本场会议…"
        question.setAccessibilityLabel("会议问题")
        question.font = .systemFont(ofSize: 12)
        question.target = self; question.action = #selector(sendQuestion)
        question.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        ask.target = self; ask.action = #selector(sendQuestion)
        ask.setContentHuggingPriority(.required, for: .horizontal)
        let composer = NSStackView(views: [question, ask]); composer.spacing = 6
        cards = [makeCard(heading: "实时逐字稿", text: transcript, trailing: count),
                 makeCard(heading: "✦  AI 摘要", text: summary),
                 makeCard(heading: "会议提问", text: answers, footer: composer)]
        if let stored = UserDefaults.standard.array(forKey: "meeting.visiblePanes") as? [Int] {
            let valid = Set(stored.filter { cards.indices.contains($0) })
            if !valid.isEmpty { visible = valid }
        }
        rebuildPanes()
        placeholder(transcript, "等待发言…")
        placeholder(summary, "发言积累后，自动生成摘要")
        placeholder(answers, "可询问已经记录的会议内容")
        pause.target = self; pause.action = #selector(togglePause); stop.target = self; stop.action = #selector(stopCapture)
        styleButton(pause, primary: false); styleButton(stop, primary: true)
        stop.setContentHuggingPriority(.defaultLow, for: .horizontal)
        let buttons = NSStackView(views: [pause, stop]); buttons.spacing = 10; buttons.distribution = .fillEqually; stack.addArrangedSubview(buttons); buttons.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true
        bubble.view.open = { [weak self] in self?.show() }; panel.center(); if show { bubble.show() }
    }
    private func styleButton(_ button: NSButton, primary: Bool) {
        button.isBordered = false; button.bezelStyle = .regularSquare; button.wantsLayer = true; button.layer?.cornerRadius = 9
        button.layer?.backgroundColor = (primary ? MeetingStyle.accent : NSColor.white).cgColor
        button.layer?.borderWidth = primary ? 0 : 0.5; button.layer?.borderColor = MeetingStyle.line.cgColor
        button.heightAnchor.constraint(equalToConstant: 33).isActive = true; button.font = .systemFont(ofSize: 12, weight: .medium)
        button.contentTintColor = primary ? .white : MeetingStyle.ink
        button.attributedTitle = NSAttributedString(string: button.title, attributes: [.foregroundColor: primary ? NSColor.white : MeetingStyle.ink, .font: button.font!])
    }
    private func makeCard(heading: String, text: NSTextView, trailing: NSView? = nil, footer: NSView? = nil) -> NSView {
        let card = NSView(); card.wantsLayer = true; card.layer?.backgroundColor = NSColor.white.cgColor; card.layer?.cornerRadius = 12; card.layer?.borderWidth = 0.5; card.layer?.borderColor = MeetingStyle.line.cgColor
        let body = NSStackView(); body.orientation = .vertical; body.alignment = .leading; body.spacing = 6; body.translatesAutoresizingMaskIntoConstraints = false; card.addSubview(body)
        NSLayoutConstraint.activate([body.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 11), body.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -11), body.topAnchor.constraint(equalTo: card.topAnchor, constant: 9), body.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -9)])
        let label = NSTextField(labelWithString: heading); label.font = .systemFont(ofSize: 11, weight: .semibold); label.textColor = heading.hasPrefix("✦") ? MeetingStyle.accent : MeetingStyle.ink
        let head = NSStackView(views: [label, NSView(), trailing ?? NSView()]); head.spacing = 8; body.addArrangedSubview(head); head.widthAnchor.constraint(equalTo: body.widthAnchor).isActive = true
        text.isEditable = false; text.isSelectable = true; text.backgroundColor = .clear; text.drawsBackground = false; text.textColor = MeetingStyle.ink; text.font = .systemFont(ofSize: 13); text.textContainerInset = NSSize(width: 0, height: 2)
        text.autoresizingMask = [.width]; text.textContainer?.widthTracksTextView = true; text.isHorizontallyResizable = false; text.isVerticallyResizable = true
        let scroll = NSScrollView(); scroll.documentView = text; scroll.hasVerticalScroller = true; scroll.scrollerStyle = .overlay; scroll.drawsBackground = false; scroll.borderType = .noBorder
        body.addArrangedSubview(scroll); scroll.widthAnchor.constraint(equalTo: body.widthAnchor).isActive = true
        scroll.heightAnchor.constraint(greaterThanOrEqualToConstant: 36).isActive = true
        if let footer {
            body.addArrangedSubview(footer)
            footer.widthAnchor.constraint(equalTo: body.widthAnchor).isActive = true
        }
        return card
    }
    private func rebuildPanes() {
        for view in split.arrangedSubviews { split.removeArrangedSubview(view); view.removeFromSuperview() }
        let shown = visible.sorted()
        let height = max(320, split.bounds.height)
        let available = height - CGFloat(shown.count - 1) * split.dividerThickness
        var y: CGFloat = 0
        for i in shown {
            let paneHeight = available / CGFloat(shown.count)
            cards[i].frame = NSRect(x: 0, y: y, width: split.bounds.width, height: paneHeight)
            split.addArrangedSubview(cards[i])
            y += paneHeight + split.dividerThickness
        }
        split.adjustSubviews()
        views.removeAllItems()
        views.addItem(withTitle: "显示")
        for i in cards.indices {
            let item = NSMenuItem(title: paneTitles[i], action: #selector(selectPane(_:)), keyEquivalent: "")
            item.target = self; item.tag = i; item.state = visible.contains(i) ? .on : .off
            item.isEnabled = visible.count > 1 || !visible.contains(i)
            views.menu?.addItem(item)
        }
    }
    @objc private func selectPane(_ sender: NSMenuItem) { togglePane(sender.tag) }
    func togglePane(_ index: Int, persist: Bool = true) {
        guard cards.indices.contains(index), !visible.contains(index) || visible.count > 1 else { return }
        if visible.contains(index) { visible.remove(index) } else { visible.insert(index) }
        if persist { UserDefaults.standard.set(visible.sorted(), forKey: "meeting.visiblePanes") }
        rebuildPanes()
    }
    func splitView(_ splitView: NSSplitView, constrainMinCoordinate proposed: CGFloat, ofSubviewAt index: Int) -> CGFloat {
        proposed + 72
    }
    func splitView(_ splitView: NSSplitView, constrainMaxCoordinate proposed: CGFloat, ofSubviewAt index: Int) -> CGFloat {
        proposed - (index + 1 == splitView.arrangedSubviews.count - 1 && visible.contains(2) ? 100 : 72)
    }
    @objc private func sendQuestion() {
        let value = question.stringValue.trimmingCharacters(in: .whitespacesAndNewlines)
        guard recording, ask.isEnabled, !value.isEmpty, value.count <= 4000, let submitQuestion else { return }
        ask.isEnabled = false
        lastQuestion = value
        question.stringValue = ""
        submitQuestion(value)
    }
    private func placeholder(_ view: NSTextView, _ value: String) {
        view.textStorage?.setAttributedString(NSAttributedString(string: value, attributes: [.font: NSFont.systemFont(ofSize: 12), .foregroundColor: MeetingStyle.muted]))
    }
    private func transcriptText(_ raw: String) -> NSAttributedString {
        let result = NSMutableAttributedString()
        let bodyStyle = NSMutableParagraphStyle(); bodyStyle.lineSpacing = 4; bodyStyle.paragraphSpacing = 13
        let stampStyle = NSMutableParagraphStyle(); stampStyle.paragraphSpacing = 5
        for block in raw.components(separatedBy: "\n\n") where !block.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            if block.hasPrefix("["), let end = block.firstIndex(of: "]") {
                let stamp = String(block[block.index(after: block.startIndex)..<end])
                result.append(NSAttributedString(string: stamp + "\n", attributes: [.font: NSFont.monospacedDigitSystemFont(ofSize: 10, weight: .medium), .foregroundColor: MeetingStyle.accent, .paragraphStyle: stampStyle]))
                let body = String(block[block.index(after: end)...]).trimmingCharacters(in: .whitespaces)
                result.append(NSAttributedString(string: body + "\n", attributes: [.font: NSFont.systemFont(ofSize: 13), .foregroundColor: MeetingStyle.ink, .paragraphStyle: bodyStyle]))
            } else {
                result.append(NSAttributedString(string: block + "\n", attributes: [.font: NSFont.systemFont(ofSize: 13), .foregroundColor: MeetingStyle.ink, .paragraphStyle: bodyStyle]))
            }
        }
        return result
    }
    func update(_ value: [String: Any]) {
        defer { bubble.update(paused: paused, ended: !recording) }
        if let seconds = value["seconds"] as? Double { clock.stringValue = String(format: "%02d:%02d", Int(seconds) / 60, Int(seconds) % 60) }
        if let text = value["transcript"] as? String {
            let partial = value["partial"] as? String ?? ""
            if text != lastTranscript || partial != lastPartial {
            let scroll = transcript.enclosingScrollView!
            let follow = (lastTranscript.isEmpty && lastPartial.isEmpty) || scroll.documentVisibleRect.maxY >= transcript.bounds.maxY - 36
            lastTranscript = text; lastPartial = partial
            let formatted = NSMutableAttributedString(attributedString: transcriptText(text))
            if !partial.isEmpty { formatted.append(NSAttributedString(string: "识别中　" + partial, attributes: [.font: NSFont.systemFont(ofSize: 13), .foregroundColor: MeetingStyle.accent])) }
            transcript.textStorage?.setAttributedString(formatted)
            count.stringValue = "\(text.components(separatedBy: "\n\n").filter { !$0.isEmpty }.count) 段"
            if follow { transcript.scrollToEndOfDocument(nil) }
            }
        }
        if let text = value["summary"] as? String, !text.isEmpty {
            let style = NSMutableParagraphStyle(); style.lineSpacing = 4
            summary.textStorage?.setAttributedString(NSAttributedString(string: text, attributes: [.font: NSFont.systemFont(ofSize: 12), .foregroundColor: MeetingStyle.ink, .paragraphStyle: style]))
        }
        if let text = value["status"] as? String {
            let important = ["失败", "中断", "断开", "重连", "恢复", "不可用", "尚未", "保存", "关闭"].contains { text.contains($0) }
            status.stringValue = important ? text : ""
            status.toolTip = important ? text : nil
            status.isHidden = !important
        }
        if let text = value["questionDisplay"] as? String, text != lastAnswerDisplay {
            lastAnswerDisplay = text
            answers.string = text
            answers.scrollToEndOfDocument(nil)
            if value["questionError"] as? Bool == true, question.stringValue.isEmpty { question.stringValue = lastQuestion }
        }
        if let busy = value["questionBusy"] as? Bool { ask.isEnabled = !busy && recording }
        if let value = value["paused"] as? Bool {
            paused = value
            pause.title = paused ? "继续录制" : "暂停"
            pause.attributedTitle = NSAttributedString(string: pause.title, attributes: [.foregroundColor: MeetingStyle.ink, .font: pause.font!])
            if recording { badge.stringValue = paused ? "●  已暂停" : "●  正在记录" }
        }
        if value["ended"] as? Bool == true {
            recording = false; ask.isEnabled = false; pause.isEnabled = false
            stop.title = "关闭"; stop.attributedTitle = NSAttributedString(string: "关闭", attributes: [.foregroundColor: NSColor.white, .font: stop.font!])
            badge.stringValue = "●  录制结束"
        }
    }
    @objc func togglePause() { action?(paused ? "resume" : "pause") }
    @objc func stopCapture() { if recording { stop.isEnabled = false; action?("stop") } else { action?("close") } }
    func show() {
        if let screen = bubble.panel.screen ?? NSScreen.main { let visible = screen.visibleFrame; let anchor = bubble.panel.frame
            panel.setFrameOrigin(NSPoint(x: max(visible.minX, min(visible.maxX - panel.frame.width, anchor.minX - panel.frame.width - 10)), y: max(visible.minY, min(visible.maxY - panel.frame.height, anchor.maxY - panel.frame.height))))
        }
        bubble.hide(); panel.orderFrontRegardless()
    }
    @objc func collapse() { panel.orderOut(nil); bubble.show() }
    func windowShouldClose(_ sender: NSWindow) -> Bool { if recording { collapse() } else { action?("close") }; return false }
}
