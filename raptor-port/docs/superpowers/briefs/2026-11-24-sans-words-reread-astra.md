Four findings remain at `f73602f9f`. I would not close this fix round.

The six targeted test files passed **159/159 tests**. I ran the four additional tests below through an in-memory Vitest transform; all four fail at the stated assertions. No files were changed. Remote reads were simulated through saved read records; this was not a live two-device or browser walk.

**F1 — Redo leaves Undo’s “You're no longer SANS.” line standing**

**Where:** [sync.ts — `warNoticesReversed`](D:/raptor-work/c156-read2/raptor-port/src/leavewar/sync.ts:1986), with `sansBackLeft` in `state/notices.ts`.

**Concrete case:** On Wednesday 15 July 2026, Saber plans Hex for Saturday 18 July, then ticks Hex’s SANS qualification. Hex reads the reminder on his other device. Saber presses Undo, producing “You're no longer SANS.” Saber then presses Redo.

**Failure:** Hex is SANS again, but the unstruck “You're no longer SANS.” line remains. I also reproduced this after saving and booting again.

**Cause:** Undo creates this additional notice inside the restore. It is absent from the original tick’s recorded changes, so Redo restores the tick without retracting the notice created by Undo.

**Fix:** Associate the Undo-created notice with the verified tick/restore that caused it. On the reverse restore, remove it if unread or mark it taken back if read. Extend the permission check only for that verified relationship. Test unread and read variants, repeated cycles and reload; globally hiding historical notices whenever someone is SANS would not implement the required retraction.

---

**F2 — A second Undo/Redo can remove the only explanation of hidden filings**

**Where:** [notices.ts — `sansStillHidden` and `sansBackLeft`](D:/raptor-work/c156-read2/raptor-port/src/state/notices.ts:911), interacting with restore insertion in `state/sched-commit.ts`.

**Concrete case:** On Wednesday 15 July 2026, Saber ticks Hex SANS, files his SANS availability for Friday 17–Saturday 18 July, then unticks him. Hex reads the resulting hidden-filing line. Saber presses Undo and Redo. Leave that new Redo copy **unread**, then press Undo and Redo again.

**Failure:** After the first cycle, one current line explains the hidden availability. After the second, none does, although the filing remains hidden.

**Cause:** Restore appends the original notice after its existing unread Redo copy. `sansStillHidden` treats that array position as “later” and lets the original claim the hidden dates. `sansBackLeft` simultaneously suppresses the original because its Redo copy exists. The copy loses its explanation, and the original cannot display it.

The existing repeated-Redo test reads each new copy, so it misses this sequence.

**Fix:** Resolve which notice represents each original/Redo/replacement chain before allocating hidden dates. A suppressed original must not take dates away from its surviving copy. Use a persisted, stable ordering for independent changes rather than restore insertion order. Add the unread-copy sequence below, its read-copy counterpart and reload coverage.

---

**F3 — The held-week cache retains a deleted meeting**

**Where:** [sansunfiled.ts — `weeksHeld`](D:/raptor-work/c156-read2/raptor-port/src/leavewar/sansunfiled.ts:110).

**Concrete case:** On Wednesday 15 July 2026, tick Hex SANS. Open the week of Monday 27 July and add Hex’s Meeting on Tuesday 28 July, 1600–1700, to Ground. Save an ordinary programme edit in that week. Return to the week of Monday 13 July and draw Hex’s reminder, warming the held-week cache. Delete the Meeting from Inputs while this earlier week remains loaded.

**Failure:** Hex’s reminder still asks for SANS availability on 28 July. A fresh `stashDays` view correctly shows that he is no longer engaged that day; the cached reminder disagrees.

**Cause:** `HELD` caches `stashDays(...).days` and its engagement sets using only the saved week blob. `stashDays` includes live input overlays; it is not merely a blob parser. Deleting this input changes that overlay without changing the saved week bytes.

**Fix:** Cache the raw parsed week separately from its derived view. Reapply current overlays and rebuild engagement sets when their inputs change, or include every relevant overlay dependency in the derived cache’s invalidation. Preserve the past-week skip. Test deletion, Undo and Redo while another week is loaded.

---

**F4 — Scheduled Delete leaves the deleted man’s planning marks saved**

**Where:** [sansunfiled.ts — `wireSansBackBefore`’s `onCommit` callback](D:/raptor-work/c156-read2/raptor-port/src/leavewar/sansunfiled.ts:460).

**Concrete case:** On Wednesday 15 July 2026, Saber posts Hex SANS from Friday 17 July and plans him for Saturday 18 July. Change the posting outcome to Delete on Friday 17 July. Advance to that Friday and let the posting pass run.

**Failure:** Hex is deleted, but `sansplan:rocky:2026-07-18` remains. I confirmed that the positive planning value remains in the saved settings after flush and another boot.

**Cause:** The cleanup callback returns for every non-user origin before collecting deleted people. Scheduled Delete runs through the `lw.postoutRun` projection, so it never reaches that cleanup. The existing deletion test covers manual Delete.

**Fix:** Separate deleted-person cleanup from user-only planning detection. Collect actual deletion transitions from successful manual and posting-pass commands, then remove only those people’s planning keys through the existing authorized settings projection. Cover loaded and foreign posting passes, persistence and preservation of other people’s rows.

**Failing tests**

Append to [raptor-port/src/leavewar/sans-reads-156.test.tsx](D:/raptor-work/c156-read2/raptor-port/src/leavewar/sans-reads-156.test.tsx), using its existing fixture and helpers. This is the exact four-test probe run; F1 receives one standing line instead of zero, F2 receives zero explanations instead of one, F3 retains 28 July, and F4 retains one planning key.

```tsx
import { stashGet as stashGetR2, stashDays as stashDaysR2 } from '../engine/weekstash'
import { sansUnfiledDays as unfiledR2 } from './sansunfiled'
import { dayEngaged as engagedR2 } from '../engine/avail'

describe('ASTRA_R2 regressions', () => {
  it('F1: Redo retracts the line made by Undo of a tick', () => {
    plan(SATI)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
    raptorNotify(); readElsewhere()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(backs()).toHaveLength(1)
    expect(globalRedo().ok).toBe(true); raptorNotify()
    expect((PEOPLE as any).rocky.san).toBe(true)
    expect(backs().filter(n => !noticeWords(n).nameStruck)).toHaveLength(0)
  })

  it('F2: an unread Redo copy keeps the hidden explanation', () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
    raptorNotify()
    expect(commitNewInput(draft(FRI, SAT))).toBe(true)
    raptorNotify()
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
    raptorNotify(); readElsewhere()
    for (let cycle = 0; cycle < 2; cycle++) {
      expect(globalUndo().ok).toBe(true)
      expect(globalRedo().ok).toBe(true); raptorNotify()
      expect(backs().filter(n =>
        noticeWords(n).what.includes('is hidden')
      )).toHaveLength(1)
    }
  })

  it('F3: held-week reminders follow a deleted meeting', () => {
    ticked()
    loadWeek('27/07/2026'); raptorNotify()
    expect(commitNewInput({
      ...draft('2026-07-28'), type: 'Meeting', allday: false,
      sTime: '16:00', eTime: '17:00', sans: null,
      remarks: 'R2 meeting', docIds: [],
    }, true)).toBe(true)
    raptorNotify()
    const rec: any = INPUTS.find((r: any) =>
      r.type === 'Meeting' && idsOf(r).map(String).includes('rocky')
      && r.date.includes('28'))
    expect(rec).toBeTruthy()
    plan(0, 'bane')
    loadWeek('13/07/2026'); raptorNotify()
    expect(unfiledR2('rocky')).toContain('2026-07-28')
    const blob = stashGetR2('27/07/2026')
    removeInput(rec); raptorNotify()
    expect(INPUTS.includes(rec)).toBe(false)
    expect(stashGetR2('27/07/2026')).toBe(blob)
    expect(engagedR2(stashDaysR2('27/07/2026')!.days[1])
      .has('rocky')).toBe(false)
    expect(unfiledR2('rocky')).not.toContain('2026-07-28')
  })

  it('F4: a scheduled Delete removes the planning rows', () => {
    posted(); plan(SATI)
    expect(plans()).toHaveLength(1)
    expect(postOut('rocky', FRI, 'delete')).toBe(true)
    raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect((PEOPLE as any).rocky.deleted).toBe(true)
    expect(plans()).toHaveLength(0)
  })
})
```

**Per-item verdicts**

| Item | Verdict | Evidence and remaining issue |
|---|---|---|
| 1. Planning mark | **CLOSED ONLY IN PART** | Round-1 fresh-planning-after-Undo cases now relight; Redo preserves the read stamp. User/admin writes, raw writes and a forged restore are refused. A saved read stamp ahead of this device’s clock is exceeded by fresh planning. Past-row pruning and manual deletion pass; scheduled deletion fails **F4**. |
| 2. `ended` | **CLOSED** | Taking back a posting while the tick stands, and unticking while the posting stands, no longer falsely end the SANS run or relight its read reminder. |
| 3. Retained reminder read | **CLOSED** | Tap and Mark all read preserve an absent reminder’s read, fold its versions and retain the correct person’s state across sign-out/sign-in. |
| 4. Saber’s Undo of a tick | **CLOSED ONLY IN PART** | The original missing-line case is fixed. Reversing that Undo leaves its false line standing: **F1**. |
| 5. Input-window cut note | **CLOSED** | The saved filing stretched backwards, trimmed back to its original extent and exiting with no change now reports the cut. |
| 6. SANS-line deletion gate | **CLOSED** | An actual posting change no longer authorizes deleting the line. A hand-built restore outside the active timeline is also refused. |
| 7. Required `how` and `to` | **CLOSED** | Missing fields fail the owed-line equality check; the original omitted-wording cases are refused. |
| 8. Forged read / duplicate Redo | **CLOSED for the two round-1 cases** | Follow-ups use saved reads, and mutating the returned read object does not authorize them. Read-between-cycle Redos leave one current copy. The additional unread-copy failure is **F2**, also affecting item 12. |
| 9. Speed | **CLOSED ONLY IN PART** | Past-week skipping and reuse address the repeated parsing case. The reused value includes live overlays and becomes stale: **F3**. The narrowed snapshot still covers the tested posting, tick and restore paths. |
| 10. Clear cut note in `finally` | **CLOSED — pinned** | Cleanup is present. No concrete pre-fix failure was established; this is not counted as a newly proven defect. |
| 11. Week creation/copy | **QUESTION — not a finding** | Left as built, as instructed by the owner. |
| 12. Latest hidden sentence | **CLOSED ONLY IN PART** | The forward posting and tick sequences pass; the posting sequence also passes a saved reload check. Repeated restore with an unread copy loses the explanation: **F2**. |

The command-start hook’s default remains user commands only; the change-history registration remains unchanged. The SANS hook explicitly requests restores. The forged-restore probes did not bypass either planning-mark or SANS-line protection.

**Older, not counted:** The exported system-projection API can still be invoked with a manually constructed `sans.planned` projection. Round 1’s security Q2 already identifies the broader trusted-system-call capability; this round did not introduce it.

**Tidiness note — filed, not fixed:** Reminder-token parsing is repeated across planning-stamp and read-retention code. The cache’s “parse” terminology obscures its live-overlay dependencies. `sansBackEraseViolation` still says deletion lacked a posting change, although a posting change no longer grants permission. No newly dead executable branch was confirmed.

**4 findings. Fix F2 first, then F1 and F3, then F4.**