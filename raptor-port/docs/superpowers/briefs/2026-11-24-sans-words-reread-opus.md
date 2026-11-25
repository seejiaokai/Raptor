# Fresh, blind Opus re-read of the fix round (copy `D:/raptor-work/c156-read2`, commit `f73602f9f`)

Read: `BRIEF.md`, `FINDINGS.md`, the four round-1 reports in `READS/`, `FIX.diff` whole, and the whole of
`leavewar/sansunfiled.ts`, `state/noticeseen.ts`, the changed parts of `state/notices.ts`, `state/perms.ts`
(`sansBackEraseViolation`, `sansPlanViolation`, the admin and member settings sections, the war-line door),
`command/commit.ts` (dispatch, enqueue, the begin hooks), `undo/timeline.ts` (`applyingRestore`, `verifiedReplay`,
`applyRestore`), `leavewar/sync.ts` (`warNoticesReversed`, `takeBack`, `postOut`, `postingLinesOf`,
`retractPostingLines`), `engine/weekstash.ts stashDays`, `engine/overlay.ts viewOfWeek / landRequests / requestsSig`,
`ui/peek.ts`'s cache key. Nothing in the copy was changed.

**Tests.** `D:/raptor-work/c156-reread-opus/reread.test.tsx` (the fixture of `sans-reads-156.test.tsx`, word for word,
paths pointed at the copy), config `D:/raptor-work/c156-reread-opus/vitest.config.mjs` (tsconfig off, the Leave War
setup, jsdom, TZ Pacific/Midway; a `node_modules` junction in that folder points at the copy's). Run from the copy:
`cd D:/raptor-work/c156-read2/raptor-port && npx vitest run --config D:/raptor-work/c156-reread-opus/vitest.config.mjs D:/raptor-work/c156-reread-opus/reread.test.tsx`.
**All 8 tests fail on `f73602f9f`, each at its last assertion (the failure itself, not a set-up step).** Control: with
the same config the builder's `sans-reads-156`, `sansplan-sec156`, `sans-words-156`, `sans-unfiled` and `sans-ahead`
pass (158 tests).

---

## Findings

### R1 — a saved week ahead is kept parsed after a request on it changes: his reminder names a day he is no longer on (the speed fix, item 9, broke it)
- **Where:** `leavewar/sansunfiled.ts`, `weeksHeld` and its `HELD` cache.
- **Case:** Today Wed 15 Jul. The week of Mon 27 Jul is saved (Saber edited it). A Meeting for Hex on Wed 29 Jul is on
  the Inputs page, so that week, as it is read, has Hex on Wed 29 (the app lands an activity request on its day as the
  saved week is read). Saber ticks Hex SANS on Quals: his reminder rightly lists Wed 29. Saber then deletes the Meeting.
  The saved week now reads without Hex on Wed 29, but **his reminder still says "You're planned on … Wed 29 Jul with
  nothing filed"** — until that week's saved copy happens to change, or the app is reloaded (then it is right). The
  start-of-command note and the gate read the same stale copy, so a change line can name that day too.
- **Cause:** a saved week's days are worked out on every read (`stashDays` → `viewOfWeek`: requests landed, edited or
  deleted, a deleted man taken off), but `HELD` keeps the parse until the saved text (`blob`) changes. Deleting,
  re-dating or adding a request changes what the week reads as without touching its saved text. The old code re-read on
  every change, so it was never stale. The app already knows this trap: the peek's cache keys on the requests too
  (`ui/peek.ts`: `deletedSig() + requestsSig() + loadedSrcSig()`).
- **Fix:**
  1. In `weeksHeld`, once per rebuild, compute `sig = requestsSig() + '|' + deletedSig() + '|' + <the loaded week's
     request sources>` (move `loadedSrcSig` from `ui/peek.ts` into `engine/overlay.ts` and export it, so both use one).
  2. Add `sig` to `Held`; re-parse when `h.blob !== blob || h.sig !== sig`.
  3. Keep the skip of past weeks by key (that part is right).
- **Test:** `reread.test.tsx` "R1" (fails: `[…'2026-07-29'] to not include '2026-07-29'`).

### R2 — the "You're no longer SANS." line that Saber's Undo of a tick now writes is never taken back: after his Redo it stands while Hex is SANS (item 4's fix broke it)
- **Where:** `leavewar/sync.ts warNoticesReversed` (the new `unticked` branch) with `leavewar/sansunfiled.ts sansTakeBack`.
- **Case A:** Hex is planned on Sat 18. Saber ticks Hex SANS on Quals; Hex reads his reminder on his own phone. Saber
  presses Undo — Hex gets "You're no longer SANS. · Saber" (right, item 4). Saber presses Redo. Hex is SANS again and his
  reminder is back, **but "You're no longer SANS. · Saber" still stands on his bell, unread** — it says the opposite of
  what is true, and nothing says it was taken back.
- **Case B (the knock-on):** because that line is marked "ended", the Undo + Redo, which changed nothing in the end,
  turns his reminder into a new one: **the reminder he had read comes back unread** with nothing newly planned — against
  the builder's own rule "a Redo … no news".
- **Case C:** Undo, Redo, Undo again (Hex reading each time): **two current "You're no longer SANS." lines** — the same
  duplicate Astra #5 was about, by another road.
- **Cause:** the line is written inside the Undo's restore, so it belongs to no step. The Redo replays only the tick
  step's own records, so it never takes the line back (the untick step's own line, by contrast, is the step's and goes
  with its Undo, D1693, D1710). Each later Undo writes another.
- **Fix (exact steps):**
  1. Hand `warNoticesReversed` the step being restored (its caller, the undo's `reversed` hook, has `entry`; pass
     `entry.seq`).
  2. When the Undo writes the line, remember it in `sync.ts`: `UNDO_TOLD.set(entry.seq, { pid, id })` (memory is enough:
     the Undo list itself does not outlive the session).
  3. On a Redo of that same step (`dir === 'redo'`, a `people` change putting `san` back on, `UNDO_TOLD` has the seq and
     the line is still on the bell): if he has not read it (`hasReadSaved`), delete it; if he has, write its "taken
     back" form (the untick line's own struck title, `back: true`, `ref: <its id>`) and have `sansBackLeft` hide a line a
     later `back` line names.
  4. Gate: `sansBackEraseViolation` must let exactly that delete through — a probe like `setSansPlanReplay` answering
     true only when `applyingRestore(env)` is a Redo of the remembered seq, the same person, and `c.id` is the remembered
     line; extend `followUpsOwed` so the gate owes the `back` line in the same case.
  5. Then case B is closed too (the line goes, so the reminder's base goes back); keep the "ended" mark as it is.
- **Tests:** "R2" (two tests) and "R2b".

### R3 — older, the sibling of item 4 the fix left open: Saber's Undo (top bar) of a SANS posting tells Hex nothing
- **Where:** `leavewar/sync.ts warNoticesReversed` — only a tick is handled.
- **Case:** Hex is planned on Sat 18. Saber posts Hex out as SANS from Fri 17; Hex reads his reminder. Saber presses
  the top bar's Undo. The posting is gone and so is the reminder — **and his bell says nothing.** The same change made
  with the sheet's "Undo post out" writes "You're no longer posted out as SANS. · Saber" (D2391's B). With SANS
  availability he had filed, that filing is hidden in silence too (D2341, "a hiding is never silent") — I could not
  stage that variant in one test (a sign-in ends Saber's Undo list), but it follows from the same cause.
- **Cause:** item 4's fix reasons "the Undo takes the man's SANS away as an untick does, so it owes him the same line"
  and applies it to the tick only. Not caused by this round (the top-bar Undo of a posting never told him), but the gate
  already owes this line (`sansBackOwed` reads the restore's posting change), so only the writer is missing.
- **Fix:**
  1. In `warNoticesReversed`, `dir === 'undo'`: for each change `c` with `c.collection === 'lw.postouts'` and
     `const owed = sansBackOwed(c)` not null, **and** the step's own forward holds no `sansback` line to that man (so the
     Undo of a "Undo post out" step, which replays its own line, is left alone), call
     `sansTakeBack(String(c.id), owed.day, by, Date.now())`.
  2. Apply R2's step 2–4 to it as well, so its Redo takes it back.
- **Test:** "R3".

### R4 — the planning mark can still be written from outside: a command run as the app's own (`sans.planned`) passes the gate (item 1 — Astra #1, SEC156-1/2 — closed only in part)
- **Where:** `state/perms.ts sansPlanViolation`, the projection branch.
- **Case 1:** Hex is posted SANS from Fri 17, planned Sat 18, has read his reminder. Anyone signed in — Hex himself, any
  member, another squadron's admin — types in the browser console
  `commitProjection({ type: 'sans.planned', scope: { module: 'settings' }, apply: txn => { txn.enlist(settingsStore); store.set('sansplan:rocky:2026-07-18', 9e12) } })`.
  It is accepted and saved, and **his read reminder lights again with nothing newly planned.**
- **Case 2:** Saber puts Hex on Sun 19 (lit, as D2394 2a says). The same call writing `sansplan:rocky:2026-07-19` = null
  is accepted: **the newly planned day no longer lights his bell.**
- **Cause:** the gate trusts any envelope that is a projection, of type `sans.planned`, by the system actor — but
  `commitProjection` is exported from the command layer and run from outside any command it gives exactly that. Astra's
  fix asked for this case by name: "a command name or system actor alone must not authorize arbitrary counters". The
  door itself (any system projection is trusted) is older and app-wide (the security read's Q2); this row is new.
- **Fix:**
  1. In `wireSansBackBefore`'s `onCommit`, before `commitProjection`, record what this step owes:
     `PLAN_OWED = { seq: env.seq, put: new Map(owed keys → the stamp to write), drop: new Set(drop keys) }` (write the
     stamps from that map inside the projection, so they are the same numbers).
  2. Add `setSansPlanOwed(fn)` to `perms.ts`, installed by `sansunfiled.ts`: true only when `env.causedBy === PLAN_OWED.seq`
     and the change is in `put` with exactly that value, or in `drop` with the row taken away.
  3. In `sansPlanViolation`, require it on the projection branch (keep the shape check). A projection run from the
     console has no `causedBy` and is refused. Clear `PLAN_OWED` once the projection has run.
- **Tests:** "R4" (two tests).

### R5 — low: a man deleted by his posting's run keeps his planning marks (item 1, Fable F6 — closed only in part)
- **Where:** `leavewar/sansunfiled.ts`, the `onCommit` (returns for anything but `origin === 'user'`).
- **Case:** Hex is posted SANS from Fri 17, Saber plans him Sat 18 (a mark is written). Saber changes the posting to
  "Delete" from Fri 17. On Fri 17 the posting pass deletes Hex — **`sansplan:rocky:2026-07-18` stays for good**: he is
  never planned again, so nothing prunes it. (Deleted by Admin → Users, the rows go — the builder's test.) An archived man's
  rows stay too.
- **Cause:** the "a deleted man's rows go" step sits after `if (env.origin !== 'user') return`, and the pass is a
  projection.
- **Fix:** move the `gone` detection before that return and let it run for a projection of type `lw.postoutRun` as well
  (still never for a restore); write the drop in the same `sans.planned` projection (R4's `PLAN_OWED.drop` covers it).
- **Test:** "R5".

### Questions (no concrete failure staged)
- **Q1 — the prune folded into another admin's step.** The prune of a man's past-day marks rides in whichever admin's
  planning step next marks him, so it rewrites rows an earlier step of a *different* admin holds; that admin's later Undo
  of his own planning of that (now past) day would then meet a changed row and be refused as "something changed".
  Contrived (an Undo across midnight of a past day's planning), not staged.
- **Q2 — the read record now only grows.** `keepReminders` keeps, for each reminder base, every day he has ever read,
  past days included, and one id for every base ever used (each "ended" line makes a new base). Small (about 16 bytes a
  day), but never pruned; dropping days before today inside `keepReminders` would bound it.
- **Q3 — older, not SANS:** `retractPostingLines` still decides a posting's "taken back" by `hasRead` (this device's
  memory), the class Astra #3 closed for the follow-ups.

---

## Per-item verdicts (§3.1)

| # | Round-1 finding | Verdict | Why |
|---|---|---|---|
| 1 | Planning mark: F1 / A#4 (planned, read, Undone, planned afresh: dark) | **CLOSED** | Fable's and Astra's own cases pass in the builder's test, which is their case word for word; a Redo stays read; a reload or a device whose clock is behind is covered, since each stamp is above what he read and the day's mark (`read + 1`, `planOf + 1`), not only above the clock. |
| 1 | A#1, SEC156-1 (another command, another squadron's admin) | **CLOSED ONLY IN PART** | Ordinary commands and other admins are refused; a `sans.planned` projection run from the console is not — **R4**. |
| 1 | O F4, SEC156-2 (bare write) | **CLOSED** | `store.set` outside a command throws, admin or member. |
| 1 | F6 (only grows, outlives its man) | **CLOSED ONLY IN PART** | Past days and a man deleted by Admin → Users go; a man deleted by his posting's run, or archived, keeps them — **R5**. |
| 2 | O F1 (`ended`) | **CLOSED** | Both of my round-1 cases (Undo post out with the tick standing; untick with the posting standing) are the builder's tests and pass; the gate demands the exact mark. (R2's case B is item 4's new line, not this.) |
| 3 | F4 = O F2 (his read dropped) | **CLOSED** | Tap and "Mark all read" both keep his reminder reads, folded per base; the tests are our cases. Growth: Q2. |
| 4 | F2 (Saber's Undo of a tick silent) | **CLOSED, but the fix broke something** | The case passes; the line it writes is never taken back by the Redo — **R2** (wrong line standing, read reminder relit, duplicates). The posting's own Undo is still silent — **R3** (older). |
| 5 | F3 (window cut said) | **CLOSED** | The test is Fable's case word for word. |
| 6 | O F3 = SEC156-3 (posting command deletes a SANS line) | **CLOSED** | The exception is gone; I checked every place that removes a bell line (`retractPostingLines` removes posting lines only; the store write, the pass, the history load) — none removes a SANS line outside an Undo/Redo, so nothing honest is now refused. |
| 7 | A#2 (`how` required) | **CLOSED** | `how` and `to` must equal what the change did; the test is Astra's case. |
| 8 | A#3 (forged memory read) | **CLOSED** | Writer and gate both read the saved record; `seenOf` returns a copy; the test is Astra's case. |
| 8 | A#5 (repeated Redo duplicates) | **CLOSED** | Only the latest copy of a line stands; Astra's case passes. (R2 case C is a new road to duplicates.) |
| 9 | F5 (speed) | **CLOSED, but the fix broke something** | Past weeks are skipped by key and a week ahead is parsed once — but kept past a change of the requests it is worked out with — **R1**. The start-of-command note is still taken for every command that can change a posting or a tick (all are of the people module: the posting sheets, the pass, Quals, Admin → Users, delete, restore) and their Undo/Redo. |
| 10 | F Q-c (cut note in `finally`) | **CLOSED (by reading)** | The note is taken in the `finally` and said only after a landed save. |
| 11 | Owner's question | — | Not a finding. |
| 12 | W12-1 | **CLOSED** | The hidden sentence is said by the latest line of his naming that day; worked out at each draw from the stored order, which a restore keeps (Undo/Redo run last-first), so it holds after a reload. |

**Security reader's §3.3 questions, answered:** `setSansPlanReplay` vouches only while the timeline is applying a
restore (`applyingRestore` needs the live `APPLYING`, the restore's own type and `causedBy`), only for the same person's
step, and only for the exact row value the restore itself writes — no command built by hand can pass as one. The begin
hooks: the change-history hook keeps its default (a person's own commands only); the SANS hook runs for restores too but
only reads, so it cannot write anything. The one open door is R4 (a projection, not a restore).

---

## Tidiness note (D489 — filed, not fixed)
1. **Duplicated:** the reminder id (`sansdue:<pid>[:n]~day.mark,…`) is now taken apart in three places — `readOf` and
   the loop inside `nextStamp` (sansunfiled.ts), `keepReminders`/`reminderOf` (noticeseen.ts) — and "is this base his"
   is spelled twice. `setSansPlanReplay` repeats the timeline's own `verifiedReplay` (adding `sansplan:` to its
   `settingsRow` list would do the same in one place).
2. **Harder to follow than it needs to be:** what the bell says now depends on a line's position in the stored list
   (`sansStillHidden`, `sansBackLeft`'s Redo copies) — a quiet rule, and each draw is a scan of all later lines for each
   SANS line; "is he still SANS" is asked three slightly different ways (`endedNow`, `stillPosted`, `sansFiler`).
3. **Left doing nothing / stale:** the file's header still says "not before the posting's date" (D2338's reading,
   replaced by D2340); `hasRead` is still imported into `sync.ts` for `retractPostingLines` only (Q3).

**5 findings (R1–R5; R3 older in origin), 3 questions. Fix first: R2 (a new wrong line on his bell after a plain Undo
and Redo, and his read reminder relit), then R1 (wrong days in his reminder), then R4, R3, R5.**
