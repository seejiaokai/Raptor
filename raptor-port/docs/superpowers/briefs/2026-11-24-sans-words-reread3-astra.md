Two findings remain. I would not close round 3.

The five targeted existing suites passed **181/181 tests**. I retained **three failing tests covering two findings**, plus their Vitest config, only under `raptor-port/src/r3-astra/`. No production files were changed.

**F1 — High priority: a forged historical cause authorizes another planning mark**

**Where:** [sansunfiled.ts — `wireSansBackBefore` / `planOwedBy`](D:/raptor-work/c156-read3/raptor-port/src/leavewar/sansunfiled.ts:540), [perms.ts — `sansPlanViolation`](D:/raptor-work/c156-read3/raptor-port/src/state/perms.ts:3458), and the command layer’s `commitAs` and `activeEnvelope`.

**Concrete case:** On Wednesday 15 July 2026, Saber posts Hex SANS from Friday 17 July and plans him for Saturday 18 July. Hex reads his reminder. Sign in as Ranger, a member. Find the completed planning projection’s `causedBy` in `commandStream()`, then submit a hand-built `sans.planned` projection writing `sansplan:rocky:2026-07-18 = 9000000000000`.

Both routes succeed:

- Pass the historical cause through `commitAs(..., { actor: systemActor(), origin: 'projection', causedBy })`.
- Use the public `commitProjection` door and assign that historical cause to `activeEnvelope()!.causedBy` inside its reducer.

**Failure:** The command returns `ok: true`, the planning value is saved, and Hex’s read reminder becomes unread again. Nobody has newly planned Hex.

**Cause:** The new permission check treats a matching historical command sequence as proof that this projection was caused by that command. The cause identifier is caller-controlled, the active envelope is mutable, and the historical entitlement can be reused after the legitimate projection has completed. The gate accepts any larger positive integer for an owed key.

This is a judged command passing the new gate; it does not depend on the excluded delivery-hook raw-write gap.

**Fix:**

1. Keep authorization provenance private to the dispatcher. Do not derive it from mutable public envelope fields or a caller-supplied historical sequence.
2. Bind the planning projection to the actual pending cause and its permitted changes, including values; consume that authorization once.
3. Prevent public envelope/stream access from mutating the provenance used for authorization.
4. Preserve the separately verified Undo/Redo path, then run both regressions and the legitimate planning/deletion tests.

Failing tests: [review.test.tsx:88](D:/raptor-work/c156-read3/raptor-port/src/r3-astra/review.test.tsx:88) and [review.test.tsx:103](D:/raptor-work/c156-read3/raptor-port/src/r3-astra/review.test.tsx:103).

**F2 — Medium priority: a home-unit change leaves the held-week reminder stale**

**Where:** [sansunfiled.ts — `weeksHeld`](D:/raptor-work/c156-read3/raptor-port/src/leavewar/sansunfiled.ts:124). Its derived reading uses [overlay.ts — `landingRequests`](D:/raptor-work/c156-read3/raptor-port/src/engine/overlay.ts:287), which consults home-unit records through `inputOnDay`.

**Concrete case:** On Wednesday 15 July 2026:

1. Saber ticks Hex SANS.
2. Open the week of Monday 27 July and save an ordinary programme edit for Ranger, making it a held week.
3. Return to Monday 13 July. File Hex’s Meeting for Tuesday 28 July, 09:00–10:00.
4. Read Hex’s reminder, warming the held-week cache; it includes 28 July.
5. Through Admin → Users, move Hex’s home to 149, effective Thursday 16 July. Keep 142 and the week of 13 July on screen.

**Failure:** A fresh `stashDays('27/07/2026')` reading correctly excludes Hex’s meeting from 142 on 28 July. His cached reminder still asks for SANS availability on that date.

**Cause:** The key includes requests, deleted people, loaded source rows, current week, squadron and the saved blob, but omits the home records used to decide where requests land. All existing key components remain unchanged in this case. Hex is still a 142 man today, so the reminder’s current-home check does not conceal the stale result.

**Fix:**

1. Include changes to the home mapping used by `inputOnDay` in the derived cache’s invalidation, preferably through a shared overlay dependency signature.
2. Invalidate both cached days and their engagement sets.
3. Retain the past-week skip.
4. Test the move, its Undo/Redo and both squadron views against fresh `stashDays` results.

Failing test: [review.test.tsx:119](D:/raptor-work/c156-read3/raptor-port/src/r3-astra/review.test.tsx:119).

**Per-item verdicts**

| Claimed fix | Verdict | Evidence |
|---|---|---|
| Redo retracts its Undo’s line — Astra F1, Opus R2, Fable F2 | **CLOSED** | The original case, unread/read variants and repeated cycles pass. Additional save-and-boot checks passed for both variants: no unstruck false line remains and the reminder stays read. |
| Held-week dependencies — Astra F3, Opus R1, Fable F1 | **CLOSED ONLY IN PART** | Original meeting deletion, addition, Undo/Redo and New Year cases pass. Home-dependent landing remains stale: **F2**. |
| Planning marks owed by their cause — RR-SEC-1, Opus R4 | **CLOSED ONLY IN PART** | The original uncaused projection is refused. Naming a completed genuine cause bypasses the replacement check: **F1**. |
| Hidden explanation through repeated Undo/Redo — Astra F2, security Q2 | **CLOSED** | The exact unread-copy sequence now retains one explanation through both cycles. Its read-copy counterpart also passes. |
| Scheduled Delete removes planning rows — Astra F4, Opus R5 | **CLOSED for the reported case** | The loaded posting-pass case removes Hex’s keys. An additional loaded-pass check preserves another man’s keys. I did not complete a valid foreign-world runtime reproduction. |
| Keys retained as `"null"` — Fable F3 | **CLOSED / fixture correction** | The actual settings adapter removes null-valued keys; the corrected fixture matches it. |
| Top-bar Undo of posting — Opus R3 | **CLOSED / not a fault** | The test confirms that Undo reverses the preceding planning step; the posting remains. |
| Today read inside hook guard — Fable Q5; stale comments and refusal wording | **CLOSED / pinned** | The clock read is guarded and the named text corrections are present. No additional concrete defect established. |

**Verification and speed**

Run the retained failures from `raptor-port/`:

```powershell
npx.cmd vitest run --configLoader native --config src/r3-astra/vitest.config.mjs src/r3-astra/review.test.tsx
```

Result: **3 failed**, at the intended permission and stale-reminder assertions.

With `R3_PERF=1`, the cache test also measures a synthetic fixture containing **40 held weeks and 28 inputs**. Building the new key averaged approximately **0.075 ms**; reconstructing and scanning all 40 held weeks averaged approximately **197 ms**. The key is substantially cheaper in this fixture. This is a local microbenchmark, not browser frame-time evidence.

Read activity was simulated through saved read records. Persistence checks used the app’s save/boot path with a memory backend. This was not a live browser or two-device walk.

**Tidiness — filed, not fixed:** Retraction detection is duplicated between `sansunfiled.ts`’s `retracted` and `notices.ts`’s `sansRetracted`. These determine related visibility and ending rules and could drift apart. The comment claiming that the cause is “never” taken from what the projection says is also inaccurate while `env.causedBy` remains mutable. No newly dead executable branch was confirmed.

**2 findings. Fix F1 first, then F2.**