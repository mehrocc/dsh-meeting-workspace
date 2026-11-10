import AppKit

private let promptPurple = NSColor(srgbRed: 0.424, green: 0.325, blue: 0.843, alpha: 1)

@MainActor func meetingWorkspaceIcon(_ size: CGFloat = 64) -> NSImage {
    NSImage(size: NSSize(width: size, height: size), flipped: false) { rect in
        promptPurple.setFill()
        NSBezierPath(roundedRect: rect.insetBy(dx: size * 0.04, dy: size * 0.04), xRadius: size * 0.23, yRadius: size * 0.23).fill()
        let symbol = NSImage(systemSymbolName: "doc.text", accessibilityDescription: "会议纪要工作台")!
        let config = NSImage.SymbolConfiguration(pointSize: size * 0.49, weight: .medium).applying(.init(paletteColors: [.white]))
        symbol.withSymbolConfiguration(config)?.draw(in: NSRect(x: size * 0.25, y: size * 0.22, width: size * 0.5, height: size * 0.57))
        return true
    }
}

@MainActor func exportMeetingIcons(_ directory: String) throws {
    try FileManager.default.createDirectory(atPath: directory, withIntermediateDirectories: true)
    for points in [16, 32, 128, 256, 512] {
        for scale in [1, 2] {
            let pixels = points * scale
            let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: pixels, pixelsHigh: pixels, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
            NSGraphicsContext.saveGraphicsState(); NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
            meetingWorkspaceIcon(CGFloat(pixels)).draw(in: NSRect(x: 0, y: 0, width: pixels, height: pixels))
            NSGraphicsContext.restoreGraphicsState()
            let name = "icon_\(points)x\(points)" + (scale == 2 ? "@2x" : "") + ".png"
            try bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: directory).appendingPathComponent(name))
        }
    }
}

private final class PromptBackground: NSView {
    override func draw(_ dirtyRect: NSRect) {
        NSColor(srgbRed: 0.967, green: 0.966, blue: 0.984, alpha: 1).setFill()
        bounds.fill()
    }
}
final class PromptButton: NSButton {
    var primary = false
    override func draw(_ dirtyRect: NSRect) {
        (primary ? promptPurple.withAlphaComponent(isEnabled ? 1 : 0.35) : NSColor.white).setFill()
        NSBezierPath(roundedRect: bounds.insetBy(dx: 0.5, dy: 0.5), xRadius: 12, yRadius: 12).fill()
        let style = NSMutableParagraphStyle(); style.alignment = .center
        let text = NSAttributedString(string: title, attributes: [.font: NSFont.systemFont(ofSize: primary ? 15 : 13, weight: primary ? .semibold : .medium), .foregroundColor: primary ? NSColor.white : NSColor.secondaryLabelColor, .paragraphStyle: style])
        let height = text.size().height
        text.draw(in: NSRect(x: 6, y: (bounds.height - height) / 2, width: bounds.width - 12, height: height))
    }
}

@MainActor final class MeetingRecordingPrompt: NSObject, NSWindowDelegate {
    let window: NSPanel
    let projectMenu = NSPopUpButton(frame: .zero, pullsDown: false)
    let startButton = PromptButton(), snoozeButton = PromptButton(), dismissButton = PromptButton()
    private(set) var action = "dismiss"
    var selectedProject: String? { projectMenu.selectedItem?.representedObject as? String }
    var response: [String: Any] {
        var value: [String: Any] = ["action": action]
        if action == "start", let project = selectedProject { value["project"] = project }
        return value
    }
    init(_ value: [String: Any]) {
        let detected = value["detected"] as? Bool == true
        let ready = value["canStart"] as? Bool != false
        window = NSPanel(contentRect: NSRect(x: 0, y: 0, width: 400, height: ready ? 420 : 452), styleMask: [.titled, .closable, .fullSizeContentView], backing: .buffered, defer: false)
        super.init()
        window.title = "会议纪要工作台"; window.titleVisibility = .hidden; window.titlebarAppearsTransparent = true
        window.isMovableByWindowBackground = true; window.isReleasedWhenClosed = false; window.delegate = self
        window.level = .floating; window.hidesOnDeactivate = false; window.canHide = false
        window.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        window.appearance = NSAppearance(named: .aqua)
        let root = PromptBackground(); window.contentView = root
        let stack = NSStackView(); stack.orientation = .vertical; stack.alignment = .leading; stack.spacing = 17; stack.translatesAutoresizingMaskIntoConstraints = false
        root.addSubview(stack)
        NSLayoutConstraint.activate([stack.leadingAnchor.constraint(equalTo: root.leadingAnchor, constant: 26), stack.trailingAnchor.constraint(equalTo: root.trailingAnchor, constant: -26), stack.topAnchor.constraint(equalTo: root.topAnchor, constant: 30), stack.bottomAnchor.constraint(lessThanOrEqualTo: root.bottomAnchor, constant: -24)])
        func label(_ text: String, _ size: CGFloat, _ weight: NSFont.Weight = .regular, _ color: NSColor = .labelColor) -> NSTextField {
            let field = NSTextField(wrappingLabelWithString: text); field.font = .systemFont(ofSize: size, weight: weight); field.textColor = color
            field.setContentCompressionResistancePriority(.required, for: .vertical); return field
        }
        let icon = NSImageView(); icon.image = meetingWorkspaceIcon(); icon.setAccessibilityLabel("会议纪要工作台标识")
        icon.widthAnchor.constraint(equalToConstant: 44).isActive = true; icon.heightAnchor.constraint(equalToConstant: 44).isActive = true
        let brand = NSStackView(views: [label("会议纪要工作台", 14, .semibold), label("会议检测提醒", 11, .regular, .secondaryLabelColor)]); brand.orientation = .vertical; brand.alignment = .leading; brand.spacing = 4
        let header = NSStackView(views: [icon, brand]); header.spacing = 10; header.alignment = .centerY; stack.addArrangedSubview(header)
        let heading = detected ? "是否开始记录这场会议？" : "会议即将开始"
        stack.addArrangedSubview(label(heading, 22, .bold))
        let detail = detected ? "检测到" + (value["platform"] as? String ?? "会议") + "可能正在进行" : (value["title"] as? String ?? "会议")
        let source = value["captureMode"] as? String == "microphone" ? "麦克风" : "电脑声音与麦克风"
        let subtitle = label(detail + "\n" + source + ((value["live"] as? Bool != false) ? " · 实时转写" : " · 仅录音"), 13, .regular, .secondaryLabelColor)
        subtitle.maximumNumberOfLines = 3; stack.addArrangedSubview(subtitle)
        let projectLabel = label("保存到项目", 12, .semibold)
        let projects = value["projects"] as? [[String: Any]] ?? []
        for project in projects {
            guard let id = project["id"] as? String, let name = project["name"] as? String else { continue }
            let item = NSMenuItem(title: name, action: nil, keyEquivalent: ""); item.representedObject = id; item.toolTip = name; projectMenu.menu?.addItem(item)
        }
        if projectMenu.numberOfItems == 0 { projectMenu.addItem(withTitle: value["projectName"] as? String ?? "未分类"); projectMenu.lastItem?.representedObject = value["project"] as? String ?? "default" }
        if let selected = value["project"] as? String, let item = projectMenu.itemArray.first(where: { ($0.representedObject as? String) == selected }) { projectMenu.select(item) }
        projectMenu.font = .systemFont(ofSize: 14); projectMenu.controlSize = .large; projectMenu.lineBreakMode = .byTruncatingMiddle; projectMenu.setAccessibilityLabel("保存到项目")
        let projectStack = NSStackView(views: [projectLabel, projectMenu]); projectStack.orientation = .vertical; projectStack.alignment = .leading; projectStack.spacing = 7
        stack.addArrangedSubview(projectStack)
        projectMenu.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true
        projectMenu.heightAnchor.constraint(equalToConstant: 36).isActive = true
        if !ready { stack.addArrangedSubview(label("请先在工作台设置中准备 DSH 本地语音模型。", 12, .regular, .systemOrange)) }
        startButton.title = value["live"] as? Bool != false ? "开始录音并实时转写" : "开始记录"; startButton.primary = true; startButton.isEnabled = ready
        snoozeButton.title = "5 分钟后提醒"; dismissButton.title = "忽略本次"
        for (button, selector) in [(startButton, #selector(start)), (snoozeButton, #selector(snooze)), (dismissButton, #selector(dismiss))] {
            button.isBordered = false; button.target = self; button.action = selector; button.setAccessibilityRole(.button); button.setAccessibilityLabel(button.title)
        }
        // Return postpones the reminder. Recording always requires an explicit click or focused button action.
        snoozeButton.keyEquivalent = "\r"; dismissButton.keyEquivalent = "\u{1b}"
        stack.addArrangedSubview(startButton); startButton.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true; startButton.heightAnchor.constraint(equalToConstant: 46).isActive = true
        let secondary = NSStackView(views: [snoozeButton, dismissButton]); secondary.distribution = .fillEqually; secondary.spacing = 10
        stack.addArrangedSubview(secondary); secondary.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true; secondary.heightAnchor.constraint(equalToConstant: 36).isActive = true
        snoozeButton.heightAnchor.constraint(equalTo: secondary.heightAnchor).isActive = true; dismissButton.heightAnchor.constraint(equalTo: secondary.heightAnchor).isActive = true
        stack.addArrangedSubview(label("确认后才开始采集音频", 11, .regular, .tertiaryLabelColor))
        window.center()
    }
    private func finish(_ value: String) { action = value; if NSApp.modalWindow === window { NSApp.stopModal() }; window.orderOut(nil) }
    @objc func start() { if startButton.isEnabled { finish("start") } }
    @objc func snooze() { finish("snooze") }
    @objc func dismiss() { finish("dismiss") }
    func windowShouldClose(_ sender: NSWindow) -> Bool { dismiss(); return false }
    func run() -> [String: Any] { window.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true); NSApp.runModal(for: window); return response }
}

@MainActor func recordingPrompt(_ value: [String: Any]) -> MeetingRecordingPrompt { MeetingRecordingPrompt(value) }
