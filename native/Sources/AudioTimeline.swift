import Foundation
import AVFoundation

// Shared monotonic timeline. Call only on the capture queue.
final class AudioTimeline {
    let rate = 16000
    let block = 1600
    var origin = 0.0
    var next = 0
    var pausedAt: Double?
    var bins: [Int: [Float]] = [:]
    var converters: [String: AVAudioConverter] = [:]
    var droppedSamples = 0
    let output: ([Float]) -> Void
    init(output: @escaping ([Float]) -> Void) { self.output = output }
    func start(at time: Double) { origin = time; next = 0; bins.removeAll(); pausedAt = nil }
    func converted(_ input: AVAudioPCMBuffer, source: String) throws -> AVAudioPCMBuffer {
        let format = AVAudioFormat(standardFormatWithSampleRate: Double(rate), channels: 1)!
        if converters[source]?.inputFormat != input.format { converters[source] = AVAudioConverter(from: input.format, to: format) }
        guard let converter = converters[source], let out = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(ceil(Double(input.frameLength) * Double(rate) / input.format.sampleRate) + 64)) else { throw audioError("音频格式转换失败") }
        var supplied = false
        var error: NSError?
        converter.convert(to: out, error: &error) { _, status in
            if supplied { status.pointee = .noDataNow; return nil }
            supplied = true; status.pointee = .haveData; return input
        }
        if let error = error { throw error }
        return out
    }
    func append(_ samples: [Float], at timestamp: Double) {
        guard pausedAt == nil, timestamp.isFinite else { return }
        let start = Int(((timestamp - origin) * Double(rate)).rounded())
        for (i, sample) in samples.enumerated() {
            let index = start + i
            guard index >= next, index >= 0, index < next + rate * 3 else { droppedSamples += 1; continue }
            let bin = index / block, position = index % block
            if bins[bin] == nil { bins[bin] = [Float](repeating: 0, count: block) }
            bins[bin]![position] += sample * 0.7
        }
    }
    func drain(through index: Int) {
        while next + block <= index {
            let samples = bins.removeValue(forKey: next / block) ?? [Float](repeating: 0, count: block)
            output(samples.map { max(-1, min(1, $0)) }); next += block
        }
    }
    func drain(now: Double) { if pausedAt == nil { drain(through: max(next, Int((now - origin - 0.25) * Double(rate)))) } }
    func pause(now: Double) { guard pausedAt == nil else { return }; drain(through: max(next, Int((now - origin) * Double(rate)))); pausedAt = now; bins.removeAll() }
    func resume(now: Double) { guard let start = pausedAt else { return }; origin += now - start; pausedAt = nil }
    func finish(now: Double) { if pausedAt == nil { drain(through: max(next, Int((now - origin) * Double(rate)))) }; bins.removeAll(); converters.removeAll() }
}

func audioError(_ text: String) -> NSError { NSError(domain: "DSHMeetingAudio", code: 1, userInfo: [NSLocalizedDescriptionKey: text]) }
func pcmWave(_ samples: [Float]) -> Data {
    var data = Data()
    func string(_ value: String) { data.append(value.data(using: .ascii)!) }
    func u16(_ value: UInt16) { var value = value.littleEndian; withUnsafeBytes(of: &value) { data.append(contentsOf: $0) } }
    func u32(_ value: UInt32) { var value = value.littleEndian; withUnsafeBytes(of: &value) { data.append(contentsOf: $0) } }
    string("RIFF"); u32(UInt32(36 + samples.count * 2)); string("WAVEfmt "); u32(16); u16(1); u16(1); u32(16000); u32(32000); u16(2); u16(16); string("data"); u32(UInt32(samples.count * 2))
    for sample in samples { let x = max(-1, min(1, sample)); u16(UInt16(bitPattern: Int16(x * (x < 0 ? 32768 : 32767)))) }
    return data
}
