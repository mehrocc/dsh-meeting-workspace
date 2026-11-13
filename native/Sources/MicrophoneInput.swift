import AVFoundation
import CoreAudio
import AudioToolbox

// Select a device on this capture engine only. Never change the Mac's default input.
enum MicrophoneInput {
    struct Device: Equatable {
        let id: AudioDeviceID
        let name: String
        let builtIn: Bool
    }
    static func uintProperty(_ object: AudioObjectID, _ selector: AudioObjectPropertySelector) -> UInt32? {
        var address = AudioObjectPropertyAddress(mSelector: selector, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
        var value: UInt32 = 0, size = UInt32(MemoryLayout<UInt32>.size)
        return AudioObjectGetPropertyData(object, &address, 0, nil, &size, &value) == noErr ? value : nil
    }
    static func defaultID() -> AudioDeviceID? { uintProperty(AudioObjectID(kAudioObjectSystemObject), kAudioHardwarePropertyDefaultInputDevice) }
    static func devices() -> [Device] {
        var address = AudioObjectPropertyAddress(mSelector: kAudioHardwarePropertyDevices, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
        var size: UInt32 = 0
        guard AudioObjectGetPropertyDataSize(AudioObjectID(kAudioObjectSystemObject), &address, 0, nil, &size) == noErr, size >= MemoryLayout<AudioDeviceID>.size else { return [] }
        var ids = [AudioDeviceID](repeating: 0, count: Int(size) / MemoryLayout<AudioDeviceID>.size)
        let result = ids.withUnsafeMutableBytes { AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &address, 0, nil, &size, $0.baseAddress!) }
        guard result == noErr else { return [] }
        return ids.compactMap { id in
            var input = AudioObjectPropertyAddress(mSelector: kAudioDevicePropertyStreams, mScope: kAudioDevicePropertyScopeInput, mElement: kAudioObjectPropertyElementMain)
            var bytes: UInt32 = 0
            guard AudioObjectGetPropertyDataSize(id, &input, 0, nil, &bytes) == noErr, bytes > 0 else { return nil }
            var nameAddress = AudioObjectPropertyAddress(mSelector: kAudioObjectPropertyName, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
            var rawName: Unmanaged<CFString>?, nameSize = UInt32(MemoryLayout<Unmanaged<CFString>?>.size)
            let nameResult = AudioObjectGetPropertyData(id, &nameAddress, 0, nil, &nameSize, &rawName)
            let name: String
            if nameResult == noErr, let value = rawName?.takeRetainedValue() { name = value as String } else { name = "麦克风" }
            return Device(id: id, name: name, builtIn: uintProperty(id, kAudioDevicePropertyTransportType) == kAudioDeviceTransportTypeBuiltIn)
        }
    }
    static func select(_ devices: [Device], defaultID: AudioDeviceID?, preferBuiltIn: Bool) -> Device? {
        if preferBuiltIn, let device = devices.first(where: { $0.builtIn }) { return device }
        return devices.first { $0.id == defaultID }
    }
    static func configure(_ engine: AVAudioEngine, preferBuiltIn: Bool) throws -> (name: String, fallback: Bool) {
        let currentDefault = defaultID()
        guard let device = select(devices(), defaultID: currentDefault, preferBuiltIn: preferBuiltIn) else { throw audioError("没有可用的麦克风输入设备") }
        // Let AVAudioEngine negotiate the current default route. Rebinding an
        // already selected Bluetooth device can stall its audio graph.
        if !preferBuiltIn || device.id == currentDefault { return (device.name, false) }
        guard let unit = engine.inputNode.audioUnit else { throw audioError("麦克风输入组件暂不可用") }
        var id = device.id
        let result = AudioUnitSetProperty(unit, kAudioOutputUnitProperty_CurrentDevice, kAudioUnitScope_Global, 0, &id, UInt32(MemoryLayout<AudioDeviceID>.size))
        guard result == noErr else { throw audioError("麦克风输入设备连接失败（\(result)）") }
        return (device.name, preferBuiltIn && device.builtIn && device.id != currentDefault)
    }
    // Diagnostic only: bind an idle engine and read back the selected device. No
    // engine.start(), tap, audio file or permission request is performed here.
    static func routeCheck() {
        let original = defaultID(), inventory = devices()
        var results: [Bool] = []
        do {
            for prefer in [false, true] {
                let engine = AVAudioEngine()
                _ = try configure(engine, preferBuiltIn: prefer)
                guard let unit = engine.inputNode.audioUnit else { throw audioError("麦克风输入组件暂不可用") }
                var id: AudioDeviceID = 0, size = UInt32(MemoryLayout<AudioDeviceID>.size)
                let code = AudioUnitGetProperty(unit, kAudioOutputUnitProperty_CurrentDevice, kAudioUnitScope_Global, 0, &id, &size)
                results.append(code == noErr && id == select(inventory, defaultID: original, preferBuiltIn: prefer)?.id)
                engine.stop()
            }
            emit(["type": "microphone-route-check", "passed": results.allSatisfy { $0 } && original == defaultID(), "recordsAudio": false, "defaultRouteBound": results[0], "fallbackRouteBound": results[1], "hasBuiltIn": inventory.contains { $0.builtIn }, "systemDefaultUnchanged": original == defaultID()])
        } catch {
            emit(["type": "microphone-route-check", "passed": false, "recordsAudio": false, "message": error.localizedDescription])
        }
    }
}
