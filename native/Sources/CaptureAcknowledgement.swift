import Foundation

// Framework completion callbacks can be late or absent. Resolve once, including
// when data arrives before the callback, and never leave stop/start awaiting forever.
final class CaptureAcknowledgement: @unchecked Sendable {
    private let lock = NSLock()
    private var outcome: Result<Void, Error>?
    private var continuation: CheckedContinuation<Void, Error>?
    func complete(_ error: Error? = nil) {
        lock.lock()
        guard outcome == nil else { lock.unlock(); return }
        let result: Result<Void, Error> = error.map { .failure($0) } ?? .success(())
        outcome = result; let waiter = continuation; continuation = nil; lock.unlock()
        waiter?.resume(with: result)
    }
    func wait(seconds: Double, message: String) async throws {
        try await withCheckedThrowingContinuation { waiter in
            lock.lock()
            if let result = outcome { lock.unlock(); waiter.resume(with: result); return }
            continuation = waiter; lock.unlock()
            DispatchQueue.global().asyncAfter(deadline: .now() + seconds) { self.complete(audioError(message)) }
        }
    }
}
