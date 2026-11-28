# Section 1 (the guard rail), step K5 — the view switch and the Tracker's question: the builder's report (chat 204's helper, 27 Nov 26)

Brief: `2026-11-27-msq-s1-k5-brief.md`. Branch `claude/msq-s1-guard-6ae5e1`, working copy `lw-balances-hover-275293`.
Nothing committed or pushed; `HANDOFF.md`, the plan and `OUTSTANDING.md` not touched; `ui/UsersPanel.tsx`, `ui/AdminPage.tsx`,
`undo/timeline.ts`, `state/undo-wire.ts`, `state/pick.ts`, the bell's files and `storage/` not touched.

**In one line: the switch to the member view and back — the name badge, the ☰ menu's switch and the Input window's own
chip — now asks the guard, is refused with the "Blocked:" note while something counts, waits for a save still going, asks
the Tracker's question about unsaved chart edits always (both ways, on his own squadron too), and when it goes through
closes the windows that only show things and ends Quals' edit mode in the same run; where it moves his own pages the
Tracker follows at once and a clean chart editor closes. One fault in the plan's own reasoning was found by B14 and fixed
(below).**

## What changed, file by file

| File | Change |
|---|---|
| `src/state/store.ts` | `switchRoleView(opts?: GuardOpts)` is the door, in §4.2's order (below). The old body is `switchRoleBody()` (unchanged lines). New `switchRoleViewRaw()` — the body then `notify()`, asking nothing: the raw switch the re-pointed tests use (as `enterSquadron` is the raw pick); for K7's allow-list by name. New `viewSwitchAsks()` = `trackerSwitchNeeds()`. `enterRoleView()` — `closeShown()`, the body, and where `pageUnit('own')` moved, `enterSquadron(UNIT, false, true)` then `markEntryTried()`, then `notify()`. The midnight check's key is now `entryKey(to, held)` (the same string, one function) so `markEntryTried()` can record the switch's own entry as tried. |
| `src/tracker/role.js` | `trackerSwitchAsk(to, back = false)` hands `back` to the registered `ask`. |
| `src/tracker/app/core.js` | the registered `ask(to, back)`: its last line `'Save them before switching ' + (back ? 'back to ' : 'to ') + to + '?'` — a pick's question byte for byte as before (pinned). |
| `src/ui/Shell.tsx` | the badge: `void switchRoleView({ from: 'bar' })`. |
| `src/ui/Drawer.tsx` | `#drawerRole`: `setDrawer(false); notify(); void switchRoleView({ from: 'drawer' })` — the menu closed and redrawn whether the switch goes, waits, asks or is refused. |
| `src/ui/InputWindow.tsx` | the chip: `switchRoleView(CHIP_SWITCH)`, `CHIP_SWITCH = { skip: ['inputedit', 'inputdlg'], from: 'bar' }`. |
| `src/ui/msq-guard-doors-switch.test.tsx` (**new** — line for `docs/file-map.md`: "the guard rail's doors — the view switch's halves of §4.7's B rows (B5, B4b, B10–B16, B19–B21, B30, row 5's chip), pressed on the real controls") | 104 tests. Started beside K4's file, as the brief allows: K4's would have passed ~900 lines. |
| `src/ui/msq-guard-g.test.tsx` | G2 (2 tests). |
| `src/test-support/msq-guard-testkit.ts` | `avail`, `SHOWN`, `note`, `nothingHeld`, `answeringSaver` moved whole from `ui/msq-guard-doors.test.tsx` (both door files read them; no word of them changed), `Postman` imported for the last. |
| `src/ui/msq-guard-doors.test.tsx` | those five moved out, its imports trimmed; nothing else. |
| re-pointed tests | `state/msq-trk-cover`, `tracker/msq-bell-input-ask`, `msq-bell-recheck-after-ask`, `msq-night-memberview`, `msq-trk-follows-pick`, `msq-trk-pick-ask`, `ui/msq-night-held-input`, `msq-pick-windows`, `msq-view-only-menu`, `msq-guard-open` — the table below. |

## The door, as built (`state/store.ts switchRoleView`)

1. may he switch (`mayViewAsMember()`) — else nothing, as today;
2. `refuse(toMember ? 'toMember' : 'toAdmin', '', opts)` → the note by the seam, the press ends (the chip's `skip` leaves out
   the Input window's two rows, every other row still asked);
3. `saveGoing()` → the doors' one wait, `state/doorwait.ts waitForSave()` (K4's — reused, never a second), then from 1;
   dropped by his next press of any door, or any pointer-down or key-down;
4. `viewSwitchAsks()` → `trackerSwitchAsk('the member view', false)` or `('the admin view', true)`;
5. after Save or Discard: the role must still be what it was, the guard again, the wait again if a save is going;
6. `enterRoleView()`.

With nothing to refuse, wait for or ask, the switch is synchronous, as before (pinned: the member view the moment the badge
is clicked). Logic's mode was already ended by the body (`setLgEdit(false)`); Quals' now ends through `closeShown()` (K1b's
`end()`), which is G2.

## Where the plan and the code differed, and what I did

1. **§4.4 step 5's "unproved" note was wrong, and B14 proved it.** The plan expected the `notify()` after the switch's own
   entry to find nothing to hold. It did hold: the Tracker's move waits a beat before it leaves the squadron
   (`core.js runFollow` awaits its first boot before `leaveSquadron`), so the midnight check in that same `notify()` still
   saw the Tracker off his pages, entered once more — not his press — and, the member view's cover allowing it, held the
   Tracker for the still-open chart editor. Result: Hunter on 149 with Edit chart layout open and nothing moved switched to
   the member view and the editor stayed open, the Tracker held on 149 under the cover — the very state D2403 and D2654 E3
   say must not be left. **Fix, in `store.ts` only:** the switch's own entry is recorded as the check's try for that exact
   state (`markEntryTried`), so the check does not make the same entry again; anything else due is still entered as
   before. Not touched: `core.js`'s follow. B14's test of it failed first, then passed.
2. **Saber on his own 142 with the chart editor open and nothing moved: the switch leaves it open.** The plan's step 5
   closes it only where the switch moves his pages; at home they do not move, and the editor stays in sight in the member
   view (the Tracker is offered to a member, D121). His E3 was asked about Hunter on 149. Built as the plan says, pinned as
   today's. **For the orchestrator:** if "nothing is left open behind a switch you made" (E3's recommendation) was meant to
   cover his own squadron too, that is one more line, and it is his to say.
3. **B15 is reached by a press — so the "…switching back to the admin view?" words are shown to him.** Saber in the member
   view on his own 142 can open the Tracker and edit the chart (D121); the badge then asks the back question. B15 is three
   real-press tests (Stay, Discard, Save — the Save lands in 142's record). **He has not seen these words drawn** (the
   fresh Fable read them, words-read N7): they now appear in the app, so they belong on a page for him.
4. **The OIL list does not count in the member view** (it is not drawn there for him), so B5's "window open" in both
   directions is an Input window over View-only Sched, which counts in both views.
5. **A held draft in the member view is reached by no press now.** Read in `core.js` and `store.ts`: the Tracker is held
   for the member view only while it is bound to a squadron his pages have left, which only an unasked switch made; Save or
   Discard leaves nothing unsaved and Stay does not switch. So the census's three files (and `msq-trk-cover`) make that
   state by the raw switch, named so. Whether his own move at midnight can make it was read too: no — that road holds the
   Tracker under the midnight band, not the member view's cover.
6. **`msq-night-press-held` (census kind (c)) stays green unchanged** — no question is asked there, as the drag has saved
   nothing when the switch is pressed. Its premise line "the Tracker held on 149" is read one tick after the switch; with
   K5 the Tracker is then on its way to 142 (step 5), not held. The test's own assertions (no box raised, nothing saved, the
   press ended) hold either way; the label reads older than the behaviour (from reading; not changed).
7. **`msq-view-only-menu` "Opus F1"** faked a Leave War window through the hold's probe, which the guard does not read — so
   it stayed green with the real switch on a state a real window would refuse. Re-pointed to the raw switch.
8. **The chip's refused case** uses a failed save as the other reason (the OIL list does not count in the member view).

## Tests — seen failing first (the patch-file method, never `git stash`)

`git diff -- <the six source files> > .tmp/k5.patch` → `git checkout --` them → **one shim on the old code:**
`export function switchRoleViewRaw() { switchRoleView() }` appended to `store.ts` (on the old code the raw switch *is* the
switch, which asked nothing — so the test files load and each test meets the old behaviour, not an import error) → run →
`git checkout -- src/state/store.ts && git apply .tmp/k5.patch`. Done twice (the second for the two B16 tests, tightened
after the first run).

On the old code: **79 of the new file's 103 tests failed**, then both tightened B16 tests (104 now); G2's Quals test failed;
the three re-pointed "asks" tests failed (`msq-trk-pick-ask` l.≈233, `msq-trk-follows-pick`'s new asking test,
`msq-pick-windows`'s re-pointed l.235 pin); `msq-trk-pick-ask`'s "…add a course?" failed after them as a knock-on (the old
switch asked nothing, so the test before it left its wait standing) and passes on the new code.

The new file's tests that passed on the old code are pins, titled "(pin, today's too)": P11 by each control; a pick's
question byte for byte; B11's row opened with nothing changed; Saber's editor open at home; the switch synchronous with no
save going; the chip with only its own window; and B4b's rows the switch already closed — ALL AVAIL and Changes (P19), the
Calendar and its family (an admin's windows, gone from the member view), the marking window (any press outside it closes
it) — by each control. B16 first passed on the old code for the wrong reason (both presses went through, ending back in the
admin view); it now checks after each press and adds Hunter on 149, where the old switch held the window under
"Member view." — both seen failing.

What the new file holds: P11; **B5** — an admin at home, Hunter by Plan on 149, Saber the master admin on 149 × a window /
a failed save × the badge / ☰ × to the member view / back (24), the note's ruled endings read from the tables, the role,
page, the Leave War's role, the squadron and his pages' squadron unchanged, the ☰ menu closed and gone; **B4b** — every
`closes` row but the Leave War's member-only sheet × both controls, and four beside an Input window (refused, still open),
and Insights closing on the way back; **B10** by both; **B12, B13**; **B11** — six forms × both, and nothing changed;
**B14** — Stay, Discard (no cover, not held, the Tracker on 142, nothing in 149's record), Save (in 149's record), Saber on
142 asked by the ☰ menu (the menu closed first), the clean editor closing on 149, the pin at home; **B15** — Stay, Discard,
Save; **B16** (2); **row 5** — the chip through, and refused with a failed save; **B19**; **B20** — the save sent first then
the switch, made to fail, never answering (a stand-in, named so), a second badge press dropping the first (one switch, never
two), a pick dropping the switch's wait, a pointer-down dropping it, synchronous with no save going; **B21**; **B30** — Stay
keeps ALL AVAIL, Discard closes it then switches, a failed save leaves it, a save waited for closes it only after it lands
(the pick's fourth case, "the squadron already in view", has no twin: every switch is a change). **G2** in
`msq-guard-g.test.tsx`: Quals' "Done" gone in the member view and Edit back in the admin view, the tick kept; Logic's half a
pin.

## Existing tests re-pointed — old and new expectation

| Test | Old | New |
|---|---|---|
| `tracker/msq-trk-pick-ask` "the member view and back keeps a draft" (l.≈146) | the real switch, asking nothing, held the draft | the same by the raw switch, renamed "— reached by no press since D2627 A20, by the raw switch"; every assertion kept |
| `msq-trk-pick-ask` "the member-view switch is not a pick: it asks nothing and keeps the edits" (l.≈233, kind (c)) | nothing asked | renamed "the member-view switch asks too (D2627 A20 — it asked nothing before)…": the question's own last line asked; Stay keeps the edits and the admin view |
| `tracker/msq-trk-follows-pick` "unsaved edits on 149 at the switch: the Tracker keeps them…" (l.≈348, kind (c)) | the real switch held the draft under the cover | kept whole by the raw switch, renamed; **plus a new test** for the asking switch: asked; Stay keeps all; Discard → the member view, the Tracker on 142, no cover, nothing in 149's record |
| `msq-trk-follows-pick` "held on 149 in the member view, a pick of 142 asks…" (l.≈373, kind (b)) | the real switch | the raw switch, renamed |
| `tracker/msq-night-memberview` — every test on `heldDraft` (9) and the switch back in "back from the member view…" | the real switch made the held draft | `heldDraft` by the raw switch, the back press too; each describe renamed; every assertion kept |
| `tracker/msq-bell-input-ask` B1 (2), `msq-bell-recheck-after-ask` F3's OIL door (3) | the same `heldDraft` | `heldDraft` by the raw switch; describes renamed |
| `state/msq-trk-cover` l.80, l.120 (held edits faked through the probe) | stayed green with the real switch on a state the app no longer reaches | the raw switch, renamed |
| `ui/msq-pick-windows` "a Leave War window left open at the switch to the member view (D2389)" — l.180, 191, 205, 217, 230; "Fable 1" l.≈269; "the member view over an Input window" l.≈287 | the real switch made the member view's band | the raw switch, each title + "— reached by no press since D2403 (step K5: the switch is refused while a window is open), so by the raw switch; removed with the band in Build 2"; the (pin, D2323) test's title names the raw switch too; every assertion kept |
| `msq-pick-windows` l.235 "(pin) an admin on his own squadron switching to the member view: no hold, no band, as today" (the pin K4 left) | the switch went through | renamed "…presses the switch to the member view: refused (D2403) — still the admin view, no band, the window live": both old assertions kept, the refusal added (it was passing for the wrong reason: refused, nothing could be held) |
| `ui/msq-night-held-input` "an Input window held by the switch…" (2) | the real switch held the window | the raw switch, renamed; **the chip is still pressed for real** and gives the window back (its `skip`) |
| `msq-night-held-input` it.each l.85 | the switch twice over a pick's hold — passing because both switches were refused | the raw switch, renamed |
| `ui/msq-view-only-menu` "Opus F1" (l.186) | a faked war window, the real switch | the raw switch, renamed |
| `ui/msq-guard-open` B18's pin (l.≈688) "a row changed on Admin → Users, then the member view: the Admin page is not drawn…" | the real switch went through over the changed row | red at K5 (the switch now refuses: B11). The raw switch, renamed "— reached by no press since D2403 (step K5…), so by the raw switch"; its assertions kept. Not in K0's census (its press is a direct call, not a control) |
| `ui/msq-guard-open` A-row "…with the page's cover up (the member view, the Tracker held on 149 for the edits)…" (l.≈893) | the real switch, with Show All up and a chart edit, made the cover | red at K5 (refused: Show All counts; and it would ask). The raw switch, renamed; its assertions kept. Not in the census either |

No assertion weakened or deleted.

## Checks (all in `raptor-port/`)

| Command | Result |
|---|---|
| `npx vitest run --maxWorkers=2 src/ui/msq-guard-doors-switch.test.tsx src/ui/msq-guard-doors.test.tsx src/ui/msq-guard-g.test.tsx` | **250 passed, 2 to-do**, exit 0 (`.tmp/k5-1.txt`) |
| `npx vitest run src/ui/msq-guard-open.test.tsx` (background, whole) | first run: 339 of 341 passed, **2 red** — B18's pin and the A-row with the cover up, both pressing the switch directly over a row or window that now refuses it (re-pointed, table above; not in K0's census). After the re-point: those two alone 2 passed, then **the whole file again: 341 passed (341), exit 0**, 15 min (`.tmp/k5-open2.txt`) |
| batch 1 — the Tracker: `msq-bell-input-ask`, `msq-bell-recheck-after-ask`, `msq-night-export-abort`, `msq-night-gestures`, `msq-night-memberview`, `msq-night-press-held`, `msq-night-press-undo`, `msq-trk-ask-keys`, `msq-trk-follows-pick`, `msq-trk-pick-ask`, `tracker.test`, `state/msq-trk-cover` | **12 files, 203 passed**, exit 0 (`.tmp/k5-f1.txt`) |
| batch 2 — `ui/`: `msq-pick-windows`, `msq-night-held-input`, `msq-view-only-menu`, `msq-guard-asis`, `msq-guard-note`, `msq-guard-rollcall`, `accounts-ui`, `memberview`, `msq-sqn-menu`, `schedule-insights-menu`, `topbar-pair`, `welcomeback`, `msq-pick-swap-question`, `test-support/no-app-import`, `msq-board-sqn`, `msq-s2-asis`, `msq-sqnlist-escape-over-input`, `msq-users-filter`, `rolestable`, `msq-admin-config` | **20 files, 308 passed, 4 to-do**, exit 0 (`.tmp/k5-f2.txt`) |
| batch 3 — state, the Leave War and the pins: `leavewar/groupinput`, `holnotice`, `postout-takeback`, `rolerestore`, `state/msq-fix2-*` ×3, `perms`, `reshape-plan-audit-read`, `signin-kinds-*` ×4, `ui/msq-fix-sched-windows-midnight`, `state/typing-hold`, `typing-hold-grid`, `reshape-r6-reenter`, `leavewar/ui/msq-fix2-r2-held-figure`, `state/msq-fix2-tracker-moved-master`, `ui/msq-bell-tap`, `pops`, `state/view-reset` | **22 files, 336 passed**, exit 0 (`.tmp/k5-f3.txt`) |

K4's ten files are all in the runs above (`msq-guard-doors`, `msq-guard-g` in the first row; the other eight in batches 1 and
2). Batches 1–3 and the second whole run of `msq-guard-open` ran on the final code. The bell's own files (`bellnotices`,
`msq-bell-show`, `sans-unfiled` and the like) were not run again: K5 changes nothing they press.
| `npm run lint:changed` | the one known finding only — `ui/UsersPanel.tsx` (`PersonEditor`'s complexity), not this section's; none in K5's files |
| `npm run build` under the checks lock (`gatelock.mjs exec`) | **passed**, exit 0 (type check and bundle) — the lock was held by `claude/lw-postin-build-5d49de` at the first look, free at the next (about 5 minutes later). After it, two things changed: a reorder in `store.ts` (the two new helpers moved above the check's own comment — no line of code changed) and the two `msq-guard-open` test re-points. A second build to cover them was started under the lock and stopped while still waiting (chat 202's FULL walk holds it); the vitest runs above type nothing, so **the final code's build is NOT RUN** — expected green, the change since being comments, function order and test files |

No full unit suite. `npm run rulecheck` not run (no ruling id is newly required to be named; the test titles cite D2403,
D2590, D2596, D2597, D2627 A4/A9/A10/A13/A16/A20, D2654 E3, D2742 as the other guard files do).

## What only a browser can show (for K12)

- The note under the name badge's right edge for a badge press, and at the foot from the ☰ menu with the menu gone and the
  window in sight (D2627 A16) — jsdom checks only the words and that the menu closed.
- The Tracker's question over the page he is on at the switch, on a phone after the ☰ menu has closed (the drawing p5).
- That a refused switch moves neither the badge nor the window, and the keys stay on the badge.
- The chip over the shade on a window the member view holds — reached by no press now, so only by the raw switch.
- The wait for a save with the app's real saver: a switch right after an edit should go through with no visible pause.

## Scenarios worth a walker's time

1. An Input window open with a word typed, then the badge — and the ☰ menu's switch on a phone: the note's place, the
   window untouched, still the admin view.
2. Hunter (Plan of 149) on 149's Tracker with Edit chart layout open, nothing moved: the badge — the member view, the editor
   closed, and back in the admin view on 149 the Tracker shows 149's chart, not the editor.
3. A chart edit made, the badge: "…Save them before switching to the member view?" — Stay, Discard, Save each; then Saber in
   the member view on 142 edits the chart and presses the badge: "…switching back to the admin view?".
4. Quals in edit mode with a tick made, the badge and back: Edit, not Done, the tick kept.
5. ALL AVAIL, Changes, Insights, a SANS day, the Leave War's day panel open, then the badge: each gone, no note.
6. Admin → Users with a row changed, the badge: refused, the row still open; with the row unchanged: the member view.
7. Saber at home with the chart editor open, the badge: it stays open (item 2 above) — worth his eye.

## Rulings

None this step (no word of his).
