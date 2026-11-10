import AppKit
import EventKit

@MainActor func calendarCommand(_ command: String) async -> [String: Any] {
    let store = EKEventStore()
    let state = EKEventStore.authorizationStatus(for: .event)
    let allowed: Bool
    if #available(macOS 14.0, *) { allowed = state == .fullAccess } else { allowed = state == .authorized }
    if command == "--calendar-status" { return ["authorized": allowed, "status": state.rawValue] }
    do {
        if !allowed {
            guard command == "--calendar-connect" else { throw audioError("系统日历未授权，请先连接系统日历") }
            let granted: Bool
            if #available(macOS 14.0, *) { granted = try await store.requestFullAccessToEvents() }
            else { granted = try await withCheckedThrowingContinuation { continuation in store.requestAccess(to: .event) { granted, error in if let error = error { continuation.resume(throwing: error) } else { continuation.resume(returning: granted) } } } }
            guard granted else { throw audioError("请在系统设置 → 隐私与安全性 → 日历中，为「DSH 会议音频」开启完全访问，再重新连接") }
        }
        let calendars = store.calendars(for: .event)
        if command == "--calendar-connect" { return ["authorized": true, "calendars": calendars.map { ["id": $0.calendarIdentifier, "title": $0.title, "account": $0.source.title] }] }
        let input = FileHandle.standardInput.readDataToEndOfFile()
        let args = (try? JSONSerialization.jsonObject(with: input)) as? [String: Any] ?? [:]
        let identifiers = Set(args["ids"] as? [String] ?? [])
        let selected = calendars.filter { identifiers.contains($0.calendarIdentifier) }
        guard !selected.isEmpty else { throw audioError("请选择要同步的系统日历") }
        let now = Date(), end = now.addingTimeInterval(30 * 86400)
        let events = store.events(matching: store.predicateForEvents(withStart: now, end: end, calendars: selected)).filter { !$0.isAllDay && $0.status != .canceled }.sorted { $0.startDate < $1.startDate }
        guard events.count <= 2000 else { throw audioError("未来 30 天日程超过 2000 条，请减少同步的日历") }
        let iso = ISO8601DateFormatter()
        return ["authorized": true, "events": events.map { event -> [String: Any] in
            let notes = String((event.notes ?? "").prefix(20000))
            return ["id": event.eventIdentifier ?? event.calendarItemIdentifier, "calendarId": event.calendar.calendarIdentifier, "calendarTitle": event.calendar.title, "title": String((event.title ?? "未命名会议").prefix(200)), "startsAt": iso.string(from: event.startDate), "agenda": notes, "link": event.url?.absoluteString ?? ""]
        }, "from": iso.string(from: now), "until": iso.string(from: end)]
    } catch { return ["error": error.localizedDescription] }
}
