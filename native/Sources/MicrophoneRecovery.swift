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
    mutating func received(at now: Double) { lastBuffer = now }
    mutating func pause() { suspended = true; recovering = false; changed = false; gapStarted = nil }
    mutating func resume(at now: Double) { suspended = false; baseline = now; lastBuffer = nil; nextAttempt = now + 2 }
    mutating func stop() { enabled = false; recovering = false; gapStarted = nil }
    mutating func tick(at now: Double, running: Bool, authorized: Bool) -> Action {
        guard enabled, !suspended else { return .none }
        guard authorized else { stop(); return .failed }
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
        // A bounded gap and a rolling budget prevent endless reconnecting or route flapping.
        if now - (gapStarted ?? now) >= 12 { stop(); return .failed }
        guard now >= nextAttempt else { return .none }
        attempts.removeAll { now - $0 >= 30 }
        guard attempts.count < 3 else { stop(); return .failed }
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
    emit(["type": "microphone-recovery-self-test", "passed": true, "recordsAudio": false,
          "checks": ["startup-grace", "configuration-change", "real-buffer-confirms-recovery", "bounded-retries", "pause-stop-cancel", "permission-revoked", "silence-is-not-disconnection", "missing-buffer-watchdog"]])
}
