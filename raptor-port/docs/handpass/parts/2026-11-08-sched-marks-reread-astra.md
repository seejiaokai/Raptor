# The narrow re-read of the fixes — Astra's report (chat 13, 8 Nov 26)

Brief: `raptor-port/docs/superpowers/briefs/2026-11-08-sched-marks-fix-reread.md`, on `9d330d50c`; blind to the other reader. Saved verbatim; the host's dispositions are in the evidence sheet's §13.

---

**One P2 finding remains: removing someone from a shared Unavailable input leaves a button that lands on another person’s row.** This also happens at `19551d882`; I found no newly introduced regression in the fixes.

References below are to `9d330d50c`. No files changed. I stayed blind to the excluded material and the other re-reader.

| Claim | Verdict | Deciding lines |
|---|---|---|
| **1. One place** | **Holds.** The fallback runs after wording selection, including filing lines, preserves existing destinations, and prepends the split person’s `lead`. | `pendlist.ts:617–625`; split destination at `:254–258`. |
| **2. Only where drawn** | **Does not hold** for a person removed from a surviving shared input. The page/type restrictions and whole-input deletion/date checks hold. | `pendlist.ts:218–224` checks the input’s existence, but not whether the removed person still belongs to it; `:202–204` supplies the parent input key. |
| **3. The fold** | **Holds.** Personal Inputs opens only for a listed personal input, and an accepted input opens it only when its programme row is absent that day. | `interactions.ts:167–170`. |
| **4. The damaged week** | **Does not hold in full** as a claim about ordering before *every* dry run. Initial presses and delayed answers are guarded correctly. **Answer OIL** retries enter `press` directly and can run the dry run before reaching the guard in `run`. I found no resulting unsafe save or duplicate refusal. | `interactions.ts:1046,1068,1175–1186,1198–1199`. |

**P2 — “Taken out” can lead to somebody else**

Host reproduction, using fresh data:

1. File one Wednesday OD input for Bane, Split and Rocky under **Unavailable**.
2. Publish Wednesday.
3. Open that input’s window, remove Rocky from its people, and save. Do not create a separate input for him.
4. Open Wednesday’s **N pending → To go out**.
5. Press **Rocky · OD · taken out**. Repeat on the Scheduler Board.

**Expected:** under claim 2, Rocky’s line stays still because his row is gone.

**Source-established result:** the line is a button carrying `iu:<shared-input-id>`. The destination search finds a surviving person’s Unavailable row and lands there.

**Cause:** the people comparison retains the surviving shared record as `it.now` (`publish.ts:300–332`). [drawnRowKeys](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-day-start-7b064c/raptor-port/src/ui/pendlist.ts:218) accepts that record. `inputRowKeys` omits Rocky’s specific key because he is absent, but still returns the parent key. `findInputCell` then matches any row of that input (`histbubble.ts:162–166`).

**Baseline:** `19551d882` does the same through `inputWords:218–219,244`. This is an unclosed case in the stated promise, not a regression introduced by this rework.

Exact fix:

1. In the existing no-destination branch of [pendListHTML](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-day-start-7b064c/raptor-port/src/ui/pendlist.ts:620), skip the fallback when `it.pp?.role === 'off'` and the wording has no `lead`.
2. Leave existing programme destinations untouched.
3. Keep the `lead` exception so someone split into their own record still reaches it first.
4. Add a production-writer test following the reproduction above. Require Rocky’s line to be a non-button with no pending keys.
5. Keep positive controls for adding someone and splitting someone into their own record; verify the actual destination row.

**Explicit negatives**

From the source paths checked, I found no further defect in:

- New Course filings and Reject → Unavail reaching their rows.
- SANS/upchit exclusion; Personal Inputs exclusion on View-only Sched.
- Deleted or moved-off whole inputs receiving no fallback.
- Existing programme destinations and split-record-first ordering.
- Tuesday’s folded Personal Inputs opening for a Monday–Tuesday request standing on Monday.
- Unavailable jumps leaving Personal Inputs folded.
- Leaving a version look before searching for a working destination.
- Initial Accept, Reject and → Unavail refusals occurring before OIL work, with one grey note.
- Delayed OIL answers stopping before a write, without an additional refusal from the caller.
- Healthy inputs being refused merely because an unrelated week is protected.

**Tidiness and ordering notes — filed here, not fixed**

- The changed comment claiming removed people “keep their still line” is incorrect until the P2 is resolved.
- For claim 4’s strict ordering, add `if (protectedInput(r)) return 'refused'` immediately after `press` finds `r`, before `oilGate` and `dryRun`; retain the guard in `run`. Check **Accept → Don’t put back → protect a covered week → Answer OIL**. Expect one grey refusal, no question, no dry run and no Undo step. Current code still refuses safely, so I have not counted this as another functional finding.
- The new `lead` property should be declared in `Words`, alongside its navigation metadata, rather than accessed through added `any` casts. No newly unused declaration found.

**Checks:** the permitted unit file could not start because the read-only environment blocked its temporary directory; no tests executed.  
**Walk:** not performed, as instructed; host reproduction remains required.  
**Rulings:** none this session.