import Foundation

// Queue-confined policy. Only a real input buffer confirms recovery; start() alone does not.
struct MicrophoneRecovery {
    enum Action: Equatable { case none, restart, recovered, failed }
    var enabled = false, suspended = false, recovering = false
    var baseline = 0.0, nextAttempt = 0.0
    var lastBuffer: Double?, gapStarted: Double?
    var attempts: [Double] = []
    var totalAttempts = 0
    var recoveries = 0, interruptions = 0, gapSeconds = 0.0
    var changed = false
    mutating func start(at now: Double) { enabled = true; baseline = now; nextAttempt = now + 2 }
    mutating func configurationChanged(at now: Double) {
        guard enabled, !suspended else { return }
        changed = true; gapStarted = gapStarted ?? now
    }
    mutating func received(at now: Double) { guard enabled, !suspended else { return }; lastBuffer = now; changed = false; if !recovering { gapStarted = nil } }
    mutating func pause(at now: Double? = nil) { finishGap(at: now); suspended = true; recovering = false; changed = false }
    mutating func resume(at now: Double) { suspended = false; baseline = now; lastBuffer = nil; nextAttempt = now + 2 }
    mutating func finishGap(at now: Double?) {
        if let now = now, let start = gapStarted { gapSeconds += max(0, now - start) }
        gapStarted = nil
    }
    mutating func stop(at now: Double? = nil) { finishGap(at: now); enabled = false; recovering = false }
    mutating func tick(at now: Double, running: Bool, authorized: Bool, keepSystemAudio: Bool = false) -> Action {
        guard enabled, !suspended else { return .none }
        if !authorized {
            if !keepSystemAudio { stop(at: now); return .failed }
            if !recovering { recovering = true; interruptions += 1; gapStarted = now }
            // Permission can be restored while the system audio continues. Never restart
            // the engine without permission or consume the retry budget in this state.
            lastBuffer = nil
            return .none
        }
        let recent = lastBuffer.map { now - $0 < 1 } ?? false
        if running && recent && !changed {
            if recovering {
                recoveries += 1; gapSeconds += max(0, now - (gapStarted ?? now))
                recovering = false; gapStarted = nil
                return .recovered
            }
            return .none
        }
        guard changed || !running || now - (lastBuffer ?? baseline) > 3 else { return .none }
        if !recovering {
            recovering = true; interruptions += 1
            gapStarted = gapStarted ?? (lastBuffer ?? baseline)
        }
        // A microphone-only session cannot produce useful audio after a sustained gap.
        // Dual capture keeps its healthy system source and retries within a rolling budget.
        if !keepSystemAudio && now - (gapStarted ?? now) >= 12 { stop(at: now); return .failed }
        guard now >= nextAttempt else { return .none }
        attempts.removeAll { now - $0 >= 30 }
        guard attempts.count < 3 else {
            if !keepSystemAudio { stop(at: now); return .failed }
            nextAttempt = (attempts.first ?? now) + 30
            return .none
        }
        attempts.append(now); totalAttempts += 1; nextAttempt = now + 3; changed = false
        lastBuffer = nil; baseline = now
        return .restart
    }
}

func microphoneRecoverySelfTest() {
    var r = MicrophoneRecovery(); r.start(at: 0)
    precondition(r.tick(at: 0.5, running: false, authorized: true) == .none)
    precondition(r.recovering)
    precondition(r.tick(at: 2, running: false, authorized: true) == .restart)
    precondition(r.tick(at: 2.5, running: true, authorized: true) == .none)
    r.received(at: 2.6)
    precondition(r.tick(at: 2.6, running: true, authorized: true) == .recovered && r.recoveries == 1)
    r.configurationChanged(at: 5)
    precondition(r.tick(at: 5, running: true, authorized: true) == .restart)
    precondition(r.tick(at: 8, running: false, authorized: true) == .restart)
    precondition(r.tick(at: 11, running: false, authorized: true) == .failed)
    precondition(r.tick(at: 99, running: false, authorized: true) == .none)
    var flowing = MicrophoneRecovery(); flowing.start(at: 0)
    flowing.configurationChanged(at: 2); flowing.received(at: 2.1)
    precondition(flowing.tick(at: 2.2, running: true, authorized: true) == .none && flowing.attempts.isEmpty && flowing.gapStarted == nil)
    var stoppedGap = MicrophoneRecovery(); stoppedGap.start(at: 0)
    precondition(stoppedGap.tick(at: 4, running: false, authorized: true, keepSystemAudio: true) == .restart)
    stoppedGap.stop(at: 10)
    precondition(stoppedGap.gapSeconds == 10)
    var paused = MicrophoneRecovery(); paused.start(at: 0); paused.pause()
    paused.configurationChanged(at: 4)
    precondition(paused.tick(at: 10, running: false, authorized: true) == .none)
    paused.resume(at: 10)
    precondition(paused.tick(at: 10.5, running: false, authorized: true) == .none)
    paused.stop()
    precondition(paused.tick(at: 15, running: false, authorized: true) == .none)
    var revoked = MicrophoneRecovery(); revoked.start(at: 0)
    precondition(revoked.tick(at: 0.5, running: false, authorized: false) == .failed && revoked.attempts.isEmpty)
    var silent = MicrophoneRecovery(); silent.start(at: 0)
    for n in 1...100 { let t = Double(n) / 2; silent.received(at: t); precondition(silent.tick(at: t, running: true, authorized: true) == .none) }
    precondition(silent.attempts.isEmpty)
    precondition(silent.tick(at: 54, running: true, authorized: true) == .restart)
    // A long microphone outage must not stop the healthy system stream or spin.
    var dual = MicrophoneRecovery(); dual.start(at: 0)
    var mixedFrames = 0
    let mixer = AudioTimeline { samples in
        precondition(samples.contains { $0 > 0 })
        mixedFrames += samples.count
    }
    mixer.start(at: 0)
    var restarts = 0
    for step in 0..<180 {
        let t = Double(step) / 2
        let action = dual.tick(at: t, running: false, authorized: true, keepSystemAudio: true)
        precondition(action != .failed)
        if action == .restart { restarts += 1 }
        mixer.append([Float](repeating: 0.2, count: 8000), at: t)
        mixer.drain(through: (step + 1) * 8000)
    }
    precondition(dual.enabled && dual.recovering && restarts <= 9 && restarts >= 6 && mixedFrames == 90 * 16000)
    dual.received(at: 90)
    precondition(dual.tick(at: 90, running: true, authorized: true, keepSystemAudio: true) == .recovered)
    // A second outage after recovery must remain resumable, too.
    dual.configurationChanged(at: 94)
    precondition(dual.tick(at: 94, running: true, authorized: true, keepSystemAudio: true) != .failed)
    dual.received(at: 95)
    precondition(dual.tick(at: 95, running: true, authorized: true, keepSystemAudio: true) == .recovered)
    var permissions = MicrophoneRecovery(); permissions.start(at: 0)
    for step in 0..<120 { precondition(permissions.tick(at: Double(step), running: false, authorized: false, keepSystemAudio: true) == .none) }
    precondition(permissions.enabled && permissions.recovering && permissions.attempts.isEmpty && permissions.interruptions == 1)
    precondition(permissions.tick(at: 120, running: false, authorized: true, keepSystemAudio: true) == .restart)
    permissions.pause()
    precondition(permissions.tick(at: 180, running: false, authorized: true, keepSystemAudio: true) == .none)
    permissions.resume(at: 200); permissions.stop()
    precondition(permissions.tick(at: 250, running: false, authorized: true, keepSystemAudio: true) == .none)
    let headset = MicrophoneInput.Device(id: 11, name: "Headset", builtIn: false)
    let builtin = MicrophoneInput.Device(id: 22, name: "Built-in", builtIn: true)
    precondition(MicrophoneInput.select([headset,builtin], defaultID: 11, preferBuiltIn: false) == headset)
    precondition(MicrophoneInput.select([headset,builtin], defaultID: 11, preferBuiltIn: true) == builtin)
    precondition(MicrophoneInput.select([headset], defaultID: 11, preferBuiltIn: true) == headset)
    precondition(MicrophoneInput.select([], defaultID: nil, preferBuiltIn: true) == nil)
    emit(["type": "microphone-recovery-self-test", "passed": true, "recordsAudio": false,
          "checks": ["startup-grace", "configuration-change", "real-buffer-confirms-recovery", "bounded-retries", "pause-stop-cancel", "permission-revoked", "silence-is-not-disconnection", "missing-buffer-watchdog", "system-audio-survives-90-second-mic-outage", "retry-backoff", "permission-restored", "second-outage-recovers", "builtin-input-fallback", "flowing-input-does-not-restart", "unfinished-gap-duration"]])
}
