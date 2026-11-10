import AppKit

final class MeetingBubbleView: NSView {
    var open: (() -> Void)?
    var paused = false, ended = false
    private var origin: NSPoint?, anchor: NSPoint?
    override var isFlipped: Bool { true }
    override func draw(_ dirtyRect: NSRect) {
        let rect = bounds.insetBy(dx: 4, dy: 4)
        NSColor.white.setFill(); NSBezierPath(ovalIn: rect).fill()
        let purple = NSColor(srgbRed: 0.424, green: 0.325, blue: 0.843, alpha: 1)
        purple.withAlphaComponent(0.13).setFill(); NSBezierPath(ovalIn: rect.insetBy(dx: 5, dy: 5)).fill()
        purple.setFill()
        for (index, value) in [10.0, 20, 28, 17, 10].enumerated() {
            let height = ended || paused ? 6.0 : value
            NSBezierPath(roundedRect: NSRect(x: 15 + Double(index) * 5, y: (bounds.height - height) / 2, width: 3, height: height), xRadius: 1.5, yRadius: 1.5).fill()
        }
        (ended ? NSColor.systemGray : paused ? NSColor.systemOrange : NSColor.systemRed).setFill()
        NSBezierPath(ovalIn: NSRect(x: bounds.width - 15, y: 7, width: 8, height: 8)).fill()
    }
    override func mouseDown(with event: NSEvent) { origin = window?.frame.origin; anchor = NSEvent.mouseLocation }
    override func mouseDragged(with event: NSEvent) {
        guard let origin = origin, let anchor = anchor, let window = window, let screen = window.screen ?? NSScreen.main else { return }
        let now = NSEvent.mouseLocation, visible = screen.visibleFrame
        window.setFrameOrigin(NSPoint(x: max(visible.minX, min(visible.maxX - window.frame.width, origin.x + now.x - anchor.x)), y: max(visible.minY, min(visible.maxY - window.frame.height, origin.y + now.y - anchor.y))))
    }
    override func mouseUp(with event: NSEvent) {
        defer { origin = nil; anchor = nil }
        if let anchor = anchor, hypot(NSEvent.mouseLocation.x - anchor.x, NSEvent.mouseLocation.y - anchor.y) < 5 { open?() }
    }
    override func accessibilityPerformPress() -> Bool { open?(); return true }
}
@MainActor final class MeetingBubble {
    let panel: NSPanel
    let view = MeetingBubbleView()
    init() {
        panel = NSPanel(contentRect: NSRect(x: 0, y: 0, width: 56, height: 56), styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
        panel.level = .floating; panel.backgroundColor = .clear; panel.isOpaque = false; panel.hasShadow = true; panel.hidesOnDeactivate = false; panel.canHide = false; panel.isReleasedWhenClosed = false
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]; panel.contentView = view
        view.setAccessibilityElement(true); view.setAccessibilityRole(.button); view.setAccessibilityLabel("展开会议记录"); view.toolTip = "展开会议记录；可拖动"
        if let screen = NSScreen.main { panel.setFrameOrigin(NSPoint(x: screen.visibleFrame.maxX - 84, y: screen.visibleFrame.midY)) }
    }
    func show() { panel.orderFrontRegardless() }
    func hide() { panel.orderOut(nil) }
    func update(paused: Bool, ended: Bool) { view.paused = paused; view.ended = ended; view.needsDisplay = true; view.toolTip = ended ? "录制结束，点击查看" : paused ? "已暂停，点击展开" : "正在记录，点击展开" }
}
