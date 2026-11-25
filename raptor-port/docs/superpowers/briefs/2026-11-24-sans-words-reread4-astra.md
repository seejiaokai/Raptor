**Round 4: five findings are closed; O3-2 is closed only in part.** One low-priority speed finding remains. I also reproduced two older issues excluded by this brief.

Review limitation: the required startup instructions led me to read the unredacted handoff before opening this brief. I therefore cannot claim blindness to its prior-round summaries. I did not read another round-4 reader’s report.

Only reviewer tests and their configuration were added under `raptor-port/src/r4-astra/`. No production files or documents were changed; nothing was committed or pushed.

**F1 — Low priority: switching weeks still rebuilds unchanged held weeks**

**Where:** [sansunfiled.ts, `weeksHeld`](/D:/raptor-work/c169-read4/raptor-port/src/leavewar/sansunfiled.ts:132), particularly the full current-week value in its cache key.

**Concrete case:** Today is Wednesday 15 July 2026. Saber ticks Hex SANS and saves a Tuesday briefing for him in each of 40 weeks beginning 27 July. Open the unedited week of 7 June 2027 and read Hex’s reminder, warming the cache. Then open 14 June 2027 and read it again.

The test establishes that the landing signature and every existing saved-week blob remain unchanged. Nevertheless, the reminder rebuilds the held weeks:

- Six held weeks: **330 week parses**, instead of zero.
- Forty held weeks: **14,440 week parses**, taking approximately **153 ms**.
- Building the landing signature averaged **0.055 ms**.
- A subsequent ordinary repaint performs no further week parses.

**Consequence:** Navigation causes avoidable work on the next reminder reading or relevant people command. This is a speed problem; the test does not establish a wrong reminder.

**Cause:** Removing empty source-row entries fixed the plain-row case, but `${cur}` still invalidates every held entry on every week change. The older source-row memo’s clearing behaviour above 32 weeks amplifies the cost; that older amplification is not a separate finding.

**Fix:**

1. Stop making every displayed-week change invalidate the held readings.
2. For a minimal safe improvement, use the displayed year when the displayed week has neither loaded request-source rows nor a saved-week entry. Retain the full week dependency otherwise.
3. Preserve invalidation for homes, requests, deleted people, squadron, saved blobs and relevant loaded source rows.
4. Do not simply substitute the year everywhere: loaded source rows have calendar dates, and the cross-week row search excludes the current week.
5. Run the retained navigation regression, the plain-row regression, and the home-change and New Year cases.

Failing test: [review.test.tsx:108](/D:/raptor-work/c169-read4/raptor-port/src/r4-astra/review.test.tsx:108). It fails at the expected zero-parses assertion.

**Per-finding verdicts**

| Round-3 finding | Verdict | Evidence |
|---|---|---|
| Astra F1 — forged historical cause changes a planning mark | **CLOSED** | Both original attack routes now write an inert setting. No executable planning-mark reader remains, and neither route relights the reminder. |
| Astra F2 — home change leaves a held-week reminder stale | **CLOSED** | The home signature invalidates the cached days and engagement sets. The original case, Undo/Redo and both squadron views pass against fresh held-week readings. |
| SEC-R3-1 — own read record poisons a shared stamp clock | **CLOSED** | The clock is removed. Old numeric suffixes are ignored when extracting dates. The crafted own-record case does not affect Ranger’s reminder. |
| SEC-R3-2 — an owed mark accepts a permanently freezing value | **CLOSED** | There is no mark writer, numeric clock or consumer to freeze. Writing the obsolete setting cannot suppress a newly unseen day. |
| Opus O3-1 — untick, Undo, Redo stops the SANS ending counting | **CLOSED** | The shared retraction check follows the latest take-back/again by time and list order. The exact sequence and repeated cycles pass; a later fresh tick produces an unread reminder. |
| Opus O3-2 — unnecessary held-week rebuilding | **CLOSED ONLY IN PART** | Adding/removing an ordinary row now preserves the cache. Displayed-week navigation still invalidates unchanged readings: **F1**. |

**D2560 and the four changed answers**

The date-set implementation follows the ruling. Previously seen days remain read when removed and restored; genuinely unseen days relight the reminder. The checks cover manual replanning, planning Undo/Redo, filing deletion, date changes, older record shapes, Mark all read, and ending/restarting SANS.

My additional control uses real individual reminder taps on disjoint day lists, reloads the saved read record, then restores both days. Both stay read.

| Builder’s answer | Judgment |
|---|---|
| **(a)** Saturday was filed before he read the Sunday-only reminder; deleting Saturday’s filing lights it | **Follows D2560:** he had not seen Saturday in the reminder. |
| **(b)** Saturday was planned while filed, after his read; deleting its filing lights it | **Follows D2560:** Saturday is still unseen. |
| **(c)** Moving the SANS date earlier introduces an unseen planned day | **Follows D2560:** that day lights it. |
| **(d)** An unsaved week introduces unseen days while displayed; leaving it makes the reminder read again | **Follows the literal rule, but needs the owner’s judgment.** |

**Question — changing weeks changes the bell without reading it.** Hex reads Saturday 18 July. Opening the unsaved week of 20 July introduces further planned days and lights his reminder. Returning to 13 July removes those days and makes it read again, without a read or filing. The existing test reproduces this. It is the combination of the older displayed-week scope and the new unseen-day rule, not a contrary implementation of D2560.

Two-device behaviour was simulated by loading another device’s saved read record; I did not perform a live two-device walk.

**Permissions and saving**

The removed `sansplan:` name is now an unlisted setting: raw writes can reach storage without becoming a governed settings change. Members, other-squadron admins and projections can therefore leave values there, but nothing reads them. The application itself creates no such rows.

Normal member commands cannot overwrite another person’s read record, and another squadron’s admin is refused. Crafted string IDs in a person’s own record stay confined to that person’s reminder; stamp suffixes no longer influence shared state.

The `SANS_UNDO_TOLD` exception remains tied to the timeline’s actual Redo, the same person’s step and the lines remembered from that step’s Undo. It permits deletion while unread, or the exact single retraction while read. I found no new widening in this round.

The remaining read-record and notice writes retain their command paths. A focused save-and-boot test passes. Read reminders fold to one date union per base; I found no growth increase beyond the already-filed retention issue.

**Older, excluded — the public projection door can empty another person’s read record**

Sign in as Hex and read his Saturday reminder. Sign in as Ranger and call `commitProjection` with type `notices.seen`, enlisting the settings store and writing an empty `noticeseen:rocky`.

The command returns success, the empty record is stored, and Hex’s reminder becomes unread. This uses neither a delivery-hook write nor `commitAs`.

The public projection supplies a system actor; the ownership checks return before the member’s owner-only restriction. Those paths predate this job, so this is **older**, not a reopened Astra F1. It does mean the claim “only its owner writes it” is not fully enforced.

For a later fix, put the read-record owner/type restriction before the role-based early returns and reject system projections writing these personal records, preserving only genuine hydration paths.

Failing test: [review.test.tsx:169](/D:/raptor-work/c169-read4/raptor-port/src/r4-astra/review.test.tsx:169).

**Older, excluded — next-week preview retains the stale-home gap**

With 13 July displayed, file Hex’s Meeting for Tuesday 21 July and warm the next-week preview. Move his home to 149 from tomorrow.

A fresh reading correctly excludes that meeting from 142. The preview key remains identical and its cached HTML still contains the meeting. `peekKey` does not include the new home signature.

This omission predates the job; the whole-job diff only moves the existing loaded-source signature into the shared overlay code. Fix later by using the shared landing signature in the preview key, retaining its other dependencies.

Failing test: [review.test.tsx:142](/D:/raptor-work/c169-read4/raptor-port/src/r4-astra/review.test.tsx:142).

**Verification**

Five focused existing suites passed **160/160 tests**:

| Suite | Passed |
|---|---:|
| Round-3 fixes | 25 |
| Prior reminder regressions | 45 |
| Permission regressions | 11 |
| SANS words and behaviour | 78 |
| Save-and-boot regression | 1 |

The retained reviewer file produces **three expected failures and one passing control**: one current speed finding and two explicitly labelled older failures.

From `raptor-port/`:

```powershell
npx.cmd vitest run --configLoader native --config src/r4-astra/vitest.config.mjs src/r4-astra/review.test.tsx
```

For the 40-week measurement:

```powershell
$env:R4_PERF='1'
npx.cmd vitest run --configLoader native --config src/r4-astra/vitest.config.mjs src/r4-astra/review.test.tsx -t 'O3-2 remaining'
```

No full suite, production build or browser walk was run. Timings are local test measurements, not browser frame-time evidence.

**Tidiness — filed, not fixed:** Removing the planning clock and its gate substantially simplifies this area, and sharing `sansRetracted` removes the earlier duplicated rule. Comments asserting that nobody else can change the read record overstate the current gate. The preview also continues assembling its own dependency list instead of using the shared landing signature.

Rulings: none; review only.

**1 finding, low priority: fix F1, the remaining O3-2 navigation cost. Two older issues and one owner question are reported separately.**