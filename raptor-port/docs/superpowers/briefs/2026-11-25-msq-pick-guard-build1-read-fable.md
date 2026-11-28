# [MSQ-PICK-GUARD] Build 1's plan — the red team, round 1: a fresh, blind Fable reader (chat 175, 25 Nov 26)

Brief: `2026-11-25-msq-pick-guard-build1-read-brief.md`. Read from an exported copy of commit `9c0d03e93` (`C:c175`; the handoff block and the plan writer's brief taken out). Blind to the other two readers; kept outside the checkout until all three had reported. Saved whole by the host.

---

I read the exported copy of commit 9c0d03e93 (C:\rc175), blind: no handoff block opened, no other reader's report, not the writer's brief. Nothing run, no file changed. D2611 has no row in the copy; I took its meaning from my brief.

## Findings, most important first

**1. HIGH — a trap: four flags stay set while their window is not drawn.** §3.1 rests on "the window is on screen exactly when its flag says so". False for `TPLEDIT`, `WAVEEDIT`, `DAYTPLEDIT`, `DRAFTSEDIT`: each dialog draws only while `canEditSched()` holds (`DutyTplModal.tsx` l.47, `WaveTplModal.tsx` l.56, `DayTplModal.tsx` l.43; `DraftsModal.tsx` l.47 also needs `CURPAGE === 'editsched'`), and none of the four flags resets on a page change (`pops.ts POPS_RESET` is 'session' only; DutyTplModal's own comment says the flag "is not cleared").
- Failure: Hunter (Plan of 149), 149 picked, Duty templates open. 149's admin lowers his Plan to View (or his role changes, or his move lands). `landOffEditSched` puts him on View-only Sched, the dialog self-hides, `TPLEDIT` stays true. Every pick, the badge and every bell line to another squadron now answer "Blocked: close the open window" with no window anywhere and nothing to close. Only Logout or a reload gets him out. Today the same state is harmless.
- Fix: every row's `open()` is the predicate the component draws from (export it from the component's file), never the raw flag. New test A10: each (c) row opened, then the right lowered / the role changed / the midnight move → `whatIsOpen()` null. R1 checks the row reads that predicate. Row (e) is already right (`useSheetFocus(boxRef, open)` leaves when undrawn).

**2. HIGH — a missing door: a line his pages may NOT follow (`'no'`), pressed while a squadron he only views is picked.** §4.5's new test is `u === pageUnit('own') && u !== UNIT`. It misses `u === UNIT`.
- Failure: Hunter (142, Plan of 149) picks 149 and switches to the member view (149 is now "View only"). He presses a bell line of a 149 input. `enterForLine(149)`: not `'here'`; `ownPageMayBe` is false in the member view → `'no'`, no guard. `openNotice` goes on for an input's line → `openInputOnPage` → `setPage('inputs')` → `landOnOwnPage` → `enterSquadron(142, …, true)`. 149 → 142 with a change not saved (D2594's own fault) or a window open, and nothing asked. Same for a View holder named in a both-squadron input stamped 149, and for part F's door 2 when it answers `'no'`.
- Fix: the test becomes "a squadron he only views is picked (`!pageOffered` of the page this tap opens)", asked before the `'no'` return for every tap that goes on to open a page. B8 gains both cases. Better: finding 5's cut.

**3. HIGH/MEDIUM — part F's root holds windows that must stay live; N2 is not a free choice.**
- (a) A man posted 142 → 149 with last weekend's 142 duty unanswered: `oilPendingFor` reads all `INPUTS`, so his bell still asks. Door 2: `enterForLine(142)` → `'no'` → opens; the root (`inputSquadrons` = [142], page 149) holds it from the first draw; `doSave` stops on `held`. He can never answer, the bell stays lit, and `bellTap` returns before `setBellList` — his bell's list is unreachable for good. Live only if N2 is answered as recommended. Fix: say this in N2; whatever he answers, an input he alone answers for is never held by the root (or `oilHit` skips one he cannot answer).
- (b) Door 2 passes `inputUnitOf(row)` (first named man's squadron) while the root uses `ownSqnOf`. For an input naming a 149 man first and Hunter second, a bell tap on 142 now carries him to 149 though the input is live on his own page. Fix: doors 1 and 2 pass `ownSqnOf(row, pageUnit('own'))`.
- (c) A filer-only line reached by `'no'` opens greyed with "This is 149's. You picked 142…" or, with no pick, "This change could not be saved." over live-looking controls. Neither is approved for a window he has just opened (D2611). Fix: put to him with N2; until then `'no'` routes open as today.
- (d) "Worked out once as the window takes up a record" against "judged on every draw": if a builder recomputes `ownSqnOf` per draw with N2's clause, his own input open across his midnight move reads the new page's squadron and comes back live (P5 broken). State: once, in the note.

**4. MEDIUM — door 1's belt refuses itself, and N4 is not "as today until answered".**
- Whenever the OIL list's `unit` is not his pages' (N4's state; a master admin after his own move), the card's `enterForLine` asks the guard while the list — a counted window — is the thing open. Always refused, with a bell line's words, telling him to close the list that holds the card. Fix: door 1 skips its own row (as `heldChip` does) and has its own door id.
- Step 5's new case already refuses a holiday line of his own squadron (it never moved him) before N4 is answered. Fix: `oilhol` leaves the new case until N4.

**5. MEDIUM — R5 cannot see the largest family; a safer cut.** `landOnOwnPage` is reached by any `setPage` to a page not offered. R5 scans `enterSquadron(…, true)` callers only, so a new `setPage('quals')` button passes silently. Sixteen non-test `setPage` callers exist today; the plan lists three.
- Cut: one check at the page door — `store.setPage(p)` asks `refuse('page', home)` when `!pageOffered(p)` and changes nothing if refused. It closes rows 7, 12, 13 and finding 2 in one place; R5 becomes "nothing outside `state/` calls `view.setPage`". Cost: callers that set a flag first (`OilDayList openInput`, `WelcomeBack`, `leavewar/sync.ts openInputWindow`) put the page first and read the answer; a non-line note needs words (N3 already asks).
- R3 is keyed on class names; a window drawn as a plain `div` passes. Add users of `useEscClose`, `useSheetFocus`, `useFloatWin`, `escCloses`.

**6. MEDIUM — row (e) is wider than the plan says.** `sheets` has thirteen users, not six: the Input dialog, Insights, the four template dialogs, the board's two — and `DocViewer.tsx` l.121, a bar-free window the plan marks `'no'`. On a one-press door (badge, bell) the viewer's sheet leaves `sheets` only after React commits; a scripted click reaches the door first → refused. P10 as written would be flaky for the badge. Fix: row (e) ignores a sheet inside a bar-free window; P10 covers badge and bell.

**7. MEDIUM — the build order.**
- The checker goes into `enterSquadron` at step 3, but bell lines and the landing enter with `byPick` true and are guarded only at step 5: existing bell tests with something open go red for two steps. Fix: the checker takes the door's name and is switched on per step.
- Tests that pass today, listed as failing-first: R5, B17, B18 (once step 1 exists), F8; F6 is an argument, not a test. Mark them pins.
- N2 must be answered before step 6, N4 and H7 before step 7 — the table does not say.

**8. LOW — H8's wait.** `enterForLine` is synchronous; the plan gives no answer for "waiting". On a slow store the press lands seconds later with no sign, perhaps while he types in a box that is no window (H13). Fix: tell him this cost in H8; drop the press if anything was pressed since.

**9. LOW — built on a reading, not marked (D2611).**
- §4.4's "…Save them before switching to the member view?" has no `[WNS]`; `p5` is not a drawing of record in D2590.
- Row 7 (a line of his OWN squadron refused) and "two lines that open nothing are refused: accepted" are readings; N6 is called "the letter".
- A clean chart editor closing at the switch to the member view (today it waits under the cover).

**10. LOW — the Tracker's rows read module state.** If the page shows its failed-download or failed-upgrade card with `pop` or `dlg` still set, the guard refuses with nothing to close. Fix: `trackerWindowsOpen()` answers none unless the Tracker is drawn and ready.

## True as stated (checked in the code)
`landOnOwnPage` and its `byPick` entry; `enterForLine` and `openNotice`'s order (the `'asked'` return stands before `markNoticeRead`); `bellTap`'s OIL branch has no entry; `OilDayList openInput` sets the window before the page; `winorder.ts UP` (ten `FloatWin` ids, as listed); `Sheet.tsx OPEN` behind `warWindowOpen`; `saveRefused` / `saveSettling`; `core.js ask` (`if (dlg) return false`, the tail); `endSession`'s list matches `TRK_WINDOWS`; `pageUnit('own')` goes home in the member view; `#drawerRole` closes the menu first; the Input window's note (l.224–232).

## Explicit negatives
- Callers of `enterSquadron`, `switchRoleView`, `pickSquadron`, `enterForLine`, `openBellRequest`, `switchRoleInForce`, `switchUnit`: none beyond §4.1's. No key picks or switches; no hash, `popstate` or link. The tabs are hidden for a view-only pick; `data-mkperiod` needs an admin.
- The saver stays `'failed'` through a Retry in flight (`postman.ts status`), so Retry-then-pick is refused without H8.
- A held Input window stops Save, Delete, Take me out, the OIL answer and Enter (`held` at l.618, 700, 731, 844–858, 925). A document picked there stores only a file, in no squadron's record.
- Admin unmounts off its tab, so `useGuardWork` cannot go stale; `OilDayList` clears `OILLIST` itself when refused.
- Logout, sign-in, a waiting person, nobody signed in, the squadron in view picked, a line of the squadron his pages are on: unchanged.
- §4.4 step 5's second entry: I could not fault the reasoning from reading; B14 must prove it.

## Not checked
Undoing or deleting the squadron in view (a re-entry by his own press, not "by pick"); the 23 Leave War sheets' bodies; the stylesheets; the census of 37 + 13 test files.

## For his iPhone only
The note against the keyboard and Safari's folding toolbar; whether the bell and badge can be reached at all with a panel window up.
