**REVISE — six findings remain.** I reviewed the exact comparison named in the brief, including the permitted first-round reports. I opened no other fix-round report and changed no files.

The proof below distinguishes execution of the actual logic in memory from a complete Git reproduction. The latter remains **unproven** where stated: this session’s filesystem permissions prohibit creating the disposable repositories those checks require.

1. **High — the commit guard allows the commit when its inspection fails.**

   If the picture inspection fails—for example, its Git command times out—the guard returns success without a warning. A rewritten picture that ordinary adding skipped can therefore remain outside the commit even after installation.

   **Proof:** executing the actual guard with an inspection error returned success and no message. A complete failing-Git commit reproduction remains unproven.

   **Fix:** first add a test that forces the inspection to fail. Then distinguish “successfully checked, nothing missing” from “could not check”; the latter must stop the commit with a retry instruction. Apply that distinction to reading the lean-copy setting too, which currently treats a read failure as “not lean.” [Relevant logic](C:/Users/User/projects/Raptor/raptor-port/scripts/lean-copy.mjs:219)

2. **Medium — the guard misses excluded pictures stored directly in the pictures folder.**

   Slimming explicitly excludes individual pictures at that level, but the guard recognises only exclusions for walk folders. Rewriting one of those individual pictures can escape the guard.

   **Proof:** with the same loose-picture exclusion the tests generate, the actual inspection returned no stranded picture and the guard allowed the commit. The corresponding walk-folder picture correctly stopped it. A complete Git commit reproduction remains unproven.

   **Fix:** add a rewritten-loose-picture case to the existing fixture. Check changed paths against Git’s actual inclusion rules rather than recognising only one kind of exclusion. Make the recovery message fetch that individual picture. [Relevant logic](C:/Users/User/projects/Raptor/raptor-port/scripts/lean-copy.mjs:205)

3. **Medium — a failed slimming operation can still be hidden, then described as successfully lean.**

   The slimming routine now produces a useful “may be half-done” result. Both automatic entry routes discard that result. On another startup, the routine checks the lean setting before checking whether Git is still busy, so it can hand over the ordinary lean-copy note while an unfinished operation still prevents saving work.

   **Proof:** I simulated the child failing after setting the lean flag and leaving Git’s lock. The first startup produced no context. The next startup produced the ordinary lean-copy note. The separate status command correctly reported the lock. Actual process interruption remains unproven this round.

   **Fix:** first test failure followed by another startup. Preserve failure and busy messages through both automatic routes, while keeping their required successful exit. Check whether Git is busy before accepting “already lean.” Keep a failed operation distinguishable from a completed one. [Slimming checks](C:/Users/User/projects/Raptor/raptor-port/scripts/lean-copy.mjs:141), [automatic routes](C:/Users/User/projects/Raptor/raptor-port/scripts/lean-copy.mjs:180)

4. **Medium — the 200-second wait does not enforce the overall 300-second limit.**

   Each preliminary Git command can take up to a minute. The long operation then receives a fresh 200-second allowance; a retry can receive another. The final lookup used to compose the note also takes time.

   **Proof:** running the actual startup logic against a simulated clock, with seven successful Git reads taking 20 seconds each and the long child exhausting its allowance, returned after **340 seconds**. None of the individual reads exceeded its limit. This is a timing-model reproduction, not a measured slow-disk run.

   Claude cancels a hook at its configured limit and discards its output, so the promised waiting note can still disappear. [Claude’s timeout behaviour](https://code.claude.com/docs/en/hooks.md#timeouts)

   **Fix:** establish one deadline at entry. Give every read, retry and child wait only the remaining allowance, reserve time for reporting, and reuse the location already read when composing the note. Test the total duration, including a retry. [Relevant implementation](C:/Users/User/projects/Raptor/raptor-port/scripts/lean-copy.mjs:54)

5. **Medium — before installation, keeping one copy whole can keep every new copy whole.**

   In a fresh repository without per-copy settings enabled, Git treats a per-copy configuration write as a shared configuration write. The new routine enables per-copy settings only if that write throws; Git normally succeeds instead.

   Consequently, using the whole-copy opt-out before installation can write the preference into shared settings. Other newly created copies then inherit it and stay large, defeating the disk-space saving.

   **Proof:** the actual routine made only the initial configuration write when it succeeded. The installed Git documentation confirms the shared-setting fallback. The full two-copy reproduction remains unproven. Existing tests check that the opted-out copy stays whole, but not that another copy remains eligible for slimming.

   **Fix:** first test two copies in a fresh repository before installation. Enable and verify per-copy settings before writing the whole-copy preference. Then verify that only the selected copy stays whole; do not report a lasting preference if saving it failed. [Relevant logic](C:/Users/User/projects/Raptor/raptor-port/scripts/lean-copy.mjs:71)

6. **Low — exported reviewers still lack a reliable route to the reviewed version’s pictures.**

   The false “already holds every picture” response is fixed. However, the replacement tells an exported reviewer to look in the main folder. When that folder holds another version—or lacks a branch-only walk—the reviewer still cannot obtain the right evidence.

   **Proof:** this follows directly from the export recipe and the new response. I did not create an export this round.

   **Fix:** have the host supply the original repository location and reviewed version with the export. Document that a requested picture folder must come from that version; use the main folder only after confirming it contains the matching pictures. Make the unavailable-picture message name that route. [Retrieval logic](C:/Users/User/projects/Raptor/raptor-port/scripts/lean-copy.mjs:237)

**Disposition of every first-round finding**

“Addressed” below means the change addresses the reported cause on inspection; it does not claim I reran its repository-writing test.

| Earlier finding | Disposition |
|---|---|
| Astra 1; Opus 3; Fable 3 — existing copies slimmed, whole-copy choice undone | Fifteen-minute restriction and lasting preference added. The fresh-repository problem remains in finding 5. |
| Astra 2; Opus 7; Fable 4 — supporting files and drawing records omitted | Addressed: only listed media types are excluded; supporting files stay, and drawing-record folders are brought back whole. |
| Astra 3 — exported-copy retrieval | False success fixed; matching-version retrieval remains incomplete, finding 6. |
| Astra 4 — startup deadline | Partly addressed by individual limits and detachment; overall deadline remains open, finding 4. |
| Astra 5 — uninstall test checks the wrong repository | Addressed: it now requests an absolute administrative path. |
| Opus 1; Fable 1 — rewritten pictures silently omitted | Ordinary walk-folder case addressed after installation. Findings 1–2 prevent closing the general guarantee. |
| Opus 2 — interrupted slimming reported as fine | Status improves, but automatic reporting remains incomplete, finding 3. |
| Opus 4; Fable 5 — typed copies receive no note; uncovered creation routes | Note now reaches the error stream; Codex guidance added. No-checkout and native Codex coverage limits are documented. |
| Opus 5 — main folder may hold different pictures | Linked-copy guidance now distinguishes versions. Exported copies retain finding 6. |
| Opus 6 — making the main folder whole writes settings | Addressed: that operation now refuses there. |
| Opus 8 — temporary full-space requirement understated | Addressed for all creation routes. |
| Opus 9 — rulings reordered | Addressed; comparison described below found no unexpected changes. |
| Fable 2 — rulings page exceeds its limit | Addressed: **41,231 bytes against 41,250**, with the meaning preserved. |
| Fable 6 — simultaneous first copies collide on shared settings | Installation enables per-copy settings, and a lock failure gets one retry. Remaining failure reporting is covered by finding 3. Concurrent execution was not rerun. |
| Fable 7 — manual slimming cannot refresh a long-lived copy | Addressed: manual slimming rebuilds the exclusions and retains fetched paths. |

**What checked out**

- The main-folder slimming guard remains before modifying operations.
- Automatic helper handling still requires the helper’s matching copy name.
- The application route checks the fifteen-minute age and the whole-copy preference.
- The inclusion lines end in `/**`, covering the restored files rather than merely naming their directories.
- The ordinary commit refusal names the pictures, explains recovery and returns a stopping result. It correctly leaves fetching until after the attempted commit.
- Installation checks both destinations for another hook before writing either; removal preserves unrelated hooks.
- The rulings archive and all nine full-row files match the locally available main reference exactly after accounting for the permitted new ruling and the permitted amendment. Their order is preserved. The rulings map differs only by the new ruling.
- The shortened rule preserves the two full rows’ meaning. The new Codex bullet is appropriately brief and directs readers to the operating guidance.

Before installation, application-created copies can already become lean, but **the commit guard is absent**. The helper note should state that condition instead of promising an unconditional guard. The opening code comment also incorrectly says the guard fetches pictures itself.

**Checks and limits**

Both scripts passed syntax checks. The non-writing path-escaping test passed. I ran the targeted in-memory checks described above.

A small native Windows process check confirmed that a detached child remained alive after its parent exited normally. The implementation also avoids inherited output pipes, consistent with [Node’s detachment guidance](https://nodejs.org/api/child_process.html#optionsdetached). This does **not** prove survival after cancellation by Claude or validate a real large-copy timeout. The current timeout test keeps its parent alive while waiting, so it does not establish that behaviour either.

I did not run the other 17 repository-writing tests, install or remove hooks, fetch references, perform a real concurrent slim, or start native desktop/Codex worktree sessions. No full document-check pass is claimed.

**Tidiness note, for filing only:** the guard duplicates Git’s inclusion-rule interpretation; the opening description repeats guidance and has already drifted about fetching; the term “lean” currently covers both configured and successfully completed states.

Walk: not performed; this was the requested read-only tooling review.  
Rulings: none this session.