import AppKit
import CoreAudio

// Only platform identity and whether that platform has an active input stream are observed.
// No audio tap, device capture, window title, message, or meeting content is read here.
func meetingPlatform(_ bundle: String) -> String? {
    let value = bundle.lowercased()
    for (prefix, id) in [("com.tencent.meeting", "tencent"), ("com.bytedance.macos.feishu", "feishu"), ("com.larksuite.lark", "feishu")] {
        if value == prefix || value.hasPrefix(prefix + ".") { return id }
    }
    return nil
}
@available(macOS 14.2, *) private func activityUInt(_ object: AudioObjectID, _ selector: AudioObjectPropertySelector) -> UInt32? {
    var address = AudioObjectPropertyAddress(mSelector: selector, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
    var value: UInt32 = 0, size = UInt32(MemoryLayout<UInt32>.size)
    return AudioObjectGetPropertyData(object, &address, 0, nil, &size, &value) == noErr ? value : nil
}
@available(macOS 14.2, *) private func activityBundle(_ object: AudioObjectID) -> String? {
    var address = AudioObjectPropertyAddress(mSelector: kAudioProcessPropertyBundleID, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
    var value: Unmanaged<CFString>?, size = UInt32(MemoryLayout<Unmanaged<CFString>?>.size)
    guard AudioObjectGetPropertyData(object, &address, 0, nil, &size, &value) == noErr else { return nil }
    return value?.takeRetainedValue() as String?
}
@MainActor func meetingActivity() -> [String: Any] {
    guard #available(macOS 14.2, *) else { return ["supported": false, "error": "会议检测需要 macOS 14.2 或更新版本", "platforms": []] }
    var address = AudioObjectPropertyAddress(mSelector: kAudioHardwarePropertyProcessObjectList, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
    var size: UInt32 = 0
    guard AudioObjectGetPropertyDataSize(AudioObjectID(kAudioObjectSystemObject), &address, 0, nil, &size) == noErr,
          size % UInt32(MemoryLayout<AudioObjectID>.size) == 0, size <= 65536 else {
        return ["supported": true, "error": "无法读取系统音频活动，请稍后重试", "platforms": []]
    }
    var objects = [AudioObjectID](repeating: 0, count: Int(size) / MemoryLayout<AudioObjectID>.size)
    if !objects.isEmpty {
        let result = objects.withUnsafeMutableBytes { bytes in AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &address, 0, nil, &size, bytes.baseAddress!) }
        guard result == noErr else { return ["supported": true, "error": "系统音频活动暂不可用", "platforms": []] }
        objects = Array(objects.prefix(Int(size) / MemoryLayout<AudioObjectID>.size))
    }
    var active = Set<String>()
    for object in objects {
        guard activityUInt(object, kAudioProcessPropertyIsRunningInput) == 1 else { continue }
        var bundle = activityBundle(object)
        if bundle == nil, let pid = activityUInt(object, kAudioProcessPropertyPID) { bundle = NSRunningApplication(processIdentifier: pid_t(pid))?.bundleIdentifier }
        if let bundle = bundle, let platform = meetingPlatform(bundle) { active.insert(platform) }
    }
    return ["supported": true, "method": "coreaudio-process-input", "platforms": active.sorted().map { ["id": $0, "name": $0 == "tencent" ? "腾讯会议" : "飞书", "inputActive": true] }]
}
func meetingActivitySelfTest() {
    precondition(meetingPlatform("com.tencent.meeting") == "tencent")
    precondition(meetingPlatform("com.tencent.meeting.helper") == "tencent")
    precondition(meetingPlatform("com.bytedance.macos.feishu") == "feishu")
    precondition(meetingPlatform("com.bytedance.macos.feishu.helper") == "feishu")
    precondition(meetingPlatform("com.tencent.meeting-unknown") == nil)
    precondition(meetingPlatform("io.dsh.meeting-workspace.audio") == nil)
    precondition(meetingPlatform("com.apple.Safari") == nil)
    emit(["type": "meeting-activity-test", "passed": true, "checks": ["tencent", "feishu", "helpers", "reject-prefix-collision", "ignore-own-recorder", "ignore-browser"], "recordsAudio": false])
}
