# Section 1 (the guard rail), step K6 — the bell and the page door: the builder's report (chat 204's helper, 27 Nov 26)

**K5's build: covered by GitHub's batch run** (the orchestrator's word: the full run on the batch branch with K5 merged
was green, so the extra build of the committed code was skipped; K6's own build under the lock is below).

Brief: `2026-11-27-msq-s1-k6-brief.md`. Branch `claude/msq-s1-guard-6ae5e1`, working copy `lw-balances-hover-275293`.
Nothing committed or pushed; `HANDOFF.md`, the plan and `OUTSTANDING.md` not touched. Not touched: `ui/UsersPanel.tsx`,
`ui/AdminPage.tsx`, `storage/`, `state/pick.ts`, `switchRoleView`, `undo/timeline.ts`, the note's words and place,
`src/engine/`. A compaction happened mid-step (about 04:30); the files in hand were re-read before the next change.

**In one line: a press that would bring his own squadron back — a bell line, the bell itself, the OIL list's card, the
Leave War's doors, Admin → Users from anywhere, an Undo's landing — now asks the guard before anything changes, through
one page door in `state/store.ts`; what such a press opens after its page (the Input window, the OIL list, a toast) runs
only once the page asked for is the page shown; a refused bell line stays unread with the list open; a line's entry closes
the windows that only show things and ends Logic's and Quals' edit modes in the run that enters; every notice kind has
its tap written by name; and "Welcome back" waits until his own squadron is in view.**

## What changed, file by file

| File | Change |
|---|---|
| `state/store.ts` | **The page door.** `setPage(p, opts?, then?): PageGo` (`'went' \| 'asked' \| 'refused'`), `ownSquadronFirst(opts, then)`, `ownPageRefused(p, door?, opts?, again?)`, `ownSquadronRefused(door?, opts?, again?)`, types `PageGo`, `PageOpts`. An offered page (or the page already shown): `view.setPage`, then `then(false)` — as today. Otherwise: the guard (`refuse`), a save still going (wait, then the press again), then the landing runs inside the door with the door kept (`KEPT`); the landing's Tracker question, then **its second ask** (`landAfterAsk`: the guard again with the kept door, a save waited for, `closeShown()`, `enterSquadron`). `then` runs only where the page shown is the page asked for. `landOnOwnPage` is now `landOwn(want, kept)`, shared by the page door and `ownSquadronFirst`. The re-export of `view.setPage` is gone (a comment says why). |
| `state/belltap.ts` | `enterForLine(u, again?, door = 'line', opts = {})`: the guard (→ `'refused'`), a save going (→ wait, `'asked'`), the Tracker's question, then `closeShown()` immediately before `enterSquadron`. `LineEntry` gains `'refused'`. `openBellRequest`: door `'bell'`; refused or asked → the tap taken; then `ownPageRefused('admin', 'bell', {}, again)` before `open()` and its toast. |
| `ui/topstate.ts` | `LINE_KINDS` (exported) — every kind of `NoticePart` by name with what its tap opens; `lineOpens(n, where)`. `openNotice`: `o = { line: n.id }`; `enterForLine(u, again, 'line', o)` first, returning on asked or refused; an unknown kind only read; `ownPageRefused(page, 'line', o, again)` before any line is read or the list closed; the holiday's line asks `ownSquadronRefused` then hands its list to `ownSquadronFirst`; **his own SANS reminder** enters his own squadron that day first (the line carries none), its tab, month and day set only after; the SANS branch and the input branch go through the door with `{ door: 'line', ...o }`. `openInputOnPage(iid, first?, still?, opts)` (exported): its whole open is `setPage('inputs', opts, waited => …)`. `bellTap`'s OIL branch passes `{ door: 'bell' }`; Part F's `enterForLine(inputSqn(…))` left to K9 as a pointer comment. |
| `ui/OilDayList.tsx` | The card's open goes through `openInputOnPage(r.iid, undefined, undefined, { door: 'card', skip: ['oilday'] })` — the window after its page; K9's line left as a pointer comment; the direct `setPage` / `setInpEdit` imports removed. |
| `leavewar/sync.ts` | `openInputWindow`: the window on the door's `then`, the input found afresh inside it, true whatever the door answers. `openWarAt`, `openNewPeriod`: `if (ownPageRefused('leavewar')) return` first. `openInputsPage`: unchanged, now on the store's door. Import of `setPage` moved from `state/view` to `state/store`. |
| `ui/adminopen.ts` | `if (ownPageRefused('admin')) return` as the first statement of `openAdminUsers` — **plus its import** (the one line needs the name; see "differed"). Compared first with `origin/claude/msq-b1-screens-135` and chat 205's `origin/claude/msq-s2-users-685735`: neither changes the file. |
| `ui/WelcomeBack.tsx` | `if (UNIT !== homeOn(id, todayIso())) return null` before the card is drawn; `setPage` from the store. |
| `state/undo-wire.ts` | `setPage` from the store; `snapView` goes on only where the door answers `'went'` (a belt — no road reaches it). |
| `ui/Login.tsx`, `ui/interactions.ts`, `probe-bridge.ts` | `setPage` from the store (`interactions.ts`: `view.setPage('leavewar')` → `setPage('leavewar')`). |
| `ui/msq-guard-doors-bell.test.tsx` | **New** — 76 tests. File-map line for K12: "the guard rail's doors — the bell's and the page door's halves of §4.7's B rows, pressed on the real controls (step K6)". |
| `ui/msq-guard-g.test.tsx` | G1's bell-line sentence written (was a to-do); **G10** (2 tests). |
| `ui/msq-guard-rollcall.test.ts` | **R5 (b), (c), (d)** — 9 tests. |
| `tracker/msq-bell-recheck-after-ask.test.tsx` | One planted line's kind (re-pointed, below). |

## Tests — seen failing first (the patch-file method, never `git stash`)

The source changes were set aside as `.tmp/k6.patch` (a whole copy of each file kept beside it), the eleven source files
checked out, the three new or changed test files run, and the patch applied back cleanly (`.tmp/k6-red.txt`):
**66 failed, 72 passed of 138.** The 72 that passed are the 50 tests of R1–R4, R7–R9, TO_COME, G1's first four, G2–G6
(all older than K6) and **22 of K6's**, every one a pin or a control, named so in its title:

- controls: B6 (nothing open, the line goes through), B9 (nothing open, the access request goes through), B23 (the same
  Undo step with nothing open);
- pins written as pins: B7b on 142 already; B11 a row opened with nothing changed; B29 on 142 already; B30 a line of the
  squadron in view; B17 the tabs; G10's "Later";
- **found to pass on the old code and renamed pins** (each title now starts "(pin, today's too)"): B7b with 150, which he
  only views (the old landing already brought 142 back after the marks were set — the case with 149 by his Plan did not,
  and fails red); B4b's six "a 149 line — the show-only window closes and the line goes through" (the old entry closed
  them too; B4b's K6 half is the refusal beside them and B30's); B25's two cards on 142 (on his own squadron nothing
  changes); B27's Stay and Discard-with-nothing-wrong (the landing's question already stood before K6; its second ask,
  with a refusal after Discard, fails red); B30's ALL AVAIL with unsaved chart edits;
- R5 (b)'s scanner check (planted strings, true on any code).

Every other K6 test failed on the old code: B6, B6b, B6c, B7 (input, lw, lwopen, po, sansback and the holiday family),
B7b's three refusals, B8, B9's refusals, F2b, B10, B11 (userrow, giveaccess, addperson, newsqn, chat 205's case), B12, B13,
B4b's ALL AVAIL beside an Input window, B20, B22, B23's belt, B25's refusal, B26, B27's second ask, B28, B29's two, B30's
refusals, G1's bell-line sentence (the mode stayed on — the line's entry ended nothing), G10's card, R5 (b)'s scan of the
source, R5 (c)'s five, R5 (d)'s two.

**Chat 205's named case** is in B11: Saber, an Admin → Users row open with a letter typed, 149's lines switched on in his
bell, taps a 149 posting line about another man — refused under the row's own lead, the row still open with his letter,
the line unread, the list open. Red on the old code (the tap closed the row with no word); green now.

## Existing tests re-pointed — old and new expectation

| Test | Old | New |
|---|---|---|
| `tracker/msq-bell-recheck-after-ask.test.tsx`, both F3 cases (the line is the shared `filerLine`) | the planted line's kind was `'chg'` — a kind no notice is ever written with; the tap took any kind it did not know for an input's, so the control opened Osprey's input after Discard | the line's kind is `'rmk'` ("its remark changed", a real input kind); **every assertion unchanged** — the control still enters 149 and opens the input, the F3 case still opens nothing. Why: the plan §4.5 (Opus F-g) — an unknown kind is only read, never taken for an input's line |

No assertion weakened or deleted. The tests that import `setPage` from `state/store` now get the door; on the pages they
use (all offered) it behaves as before, and none needed a change.

## Checks (all in `raptor-port/`)

| Command | Result |
|---|---|
| `npx vitest run src/ui/msq-guard-doors-bell.test.tsx` | **76 passed**, exit 0 (`.tmp/k6-bell4.txt`; final names in `.tmp/k6-green-v.txt`) |
| `npx vitest run src/ui/msq-guard-g.test.tsx` | **24 passed**, exit 0 (`.tmp/k6-g2.txt`) |
| `npx vitest run src/ui/msq-guard-rollcall.test.ts` | **38 passed**, exit 0 (`.tmp/k6-roll1.txt`) |
| the three together, verbose | **138 passed**, exit 0 (`.tmp/k6-green-v.txt`) |
| the old code (patch-file method), the three | 66 failed, 72 passed — above (`.tmp/k6-red.txt`) |
| census batch 1 (`--maxWorkers=2`): `msq-bell-tap`, `tracker/msq-bell-input-ask`, `tracker/msq-bell-recheck-after-ask`, `leavewar/sans-unfiled`, `leavewar/sans-unfiled-reload`, `bellnotices`, `bellnotices-scenarios`, `leavewar/holnotice`, `leavewar/postout-notice`, `leavewar/postout-takeback`, `leavewar/msq-posting-failed` | first run **242 of 243**, 1 red: the recheck control (re-pointed above); that file again: **5 passed**, exit 0 (`.tmp/k6-census1.txt`, `.tmp/k6-recheck.txt`) |
| census batch 2: `state/msq-trk-cover`, `tracker/msq-trk-follows-pick`, `tracker/msq-trk-pick-ask`, `tracker/msq-trk-ask-keys`, `msq-guard-asis`, `msq-guard-input-sqn`, `msq-guard-note`, `msq-bell-show`, `state/undo-wire`, `state/edit-rights-readers` | **212 passed, 5 to-do**, exit 0 (`.tmp/k6-census2.txt`) |
| K4's and K5's remaining files: `msq-guard-doors`, `msq-guard-doors-switch`, `msq-pick-windows`, `msq-pick-swap-question`, `msq-night-held-input`, `test-support/no-app-import` | **260 passed, 1 to-do**, exit 0 (`.tmp/k6-k4k5.txt`). With the two batches and the three files above, K4's ten files and K5's are all run |
| `state/edit-rights-readers.test.ts` (the coordinator's addition) | **4 passed** — K6 adds and moves no `isAdmin`, `canEditSched` or `mayEditSched` call; the door's `pageOffered` and `pageUnit` are not among the questions it counts, so no entry changed |
| `npx vitest run src/ui/msq-guard-open.test.tsx` (background, whole) | **341 passed**, exit 0 (`.tmp/k6-open.txt`) |
| `npm run lint:changed` | the one known finding only (`ui/UsersPanel.tsx`, high complexity — not K6's file); exit 1 as before |
| `npm run build` under the checks lock | **passed** — the typecheck and the build (491 modules), exit 0 (`.tmp/k6-build.txt`). The lock was held by another chat at the first look (05:15) and free at the second (05:20); taken, built, released at once |

The to-dos left in the guard's files are none of K6's (P4, P10, P12, P18 at K0; the short row's after S2's U1 fix; F14's
OIL answer).

## The page door's call-site census, as R5 (c) reads it

Seventeen calls outside `state/store.ts`: sixteen of `setPage` and the holiday line's `ownSquadronFirst`. R5 (c) fails on
a call not in this list, a `then` call that hands no function, the answer call that does not test `'went'`, an ask-first
function whose first statement is not its `ownPageRefused` line (for `openNotice`: the ask before the list is closed and
before any line is read, the unknown kind's read-only line aside), and the "Welcome back" gate not standing before its call.

| File | Call | Kind | Why |
|---|---|---|---|
| `ui/Shell.tsx` | `nav` — a tab | last | only offered pages are drawn (row 14) |
| `ui/Drawer.tsx` | `go` — a ☰ page | last | the same; the menu closed after |
| `ui/Login.tsx` | `setPage(back)` | last | his home just entered at sign-in |
| `ui/logout.ts` | `setPage('tracker')` | last | guarded by `pageOffered` on its line |
| `probe-bridge.ts` | `w.setPage` | last | the developer's browser tests |
| `ui/topstate.ts` | `setPage('help')` — the bug alert | last | Help is always offered |
| `ui/interactions.ts` | "make a period" | last | needs `canEditSched()`, so its page is always offered |
| `leavewar/sync.ts` | `openInputsPage` | last | nothing after the page but a redraw |
| `ui/WelcomeBack.tsx` | "Check my quals" | last | drawn only on his own squadron; the gate before it is pinned |
| `ui/topstate.ts` | `openInputOnPage` | then | the Input window |
| `leavewar/sync.ts` | `openInputWindow` | then | the clash note's window |
| `ui/topstate.ts` | the holiday line's `ownSquadronFirst` | then | the OIL list |
| `ui/topstate.ts` | the SANS reminder's `setPage('inputs', …)` | asks first (`openNotice`) | tab, month and day set before the page |
| `ui/adminopen.ts` | `openAdminUsers` | asks first | the Users intent |
| `leavewar/sync.ts` | `openWarAt` | asks first | the war selected, panels put away, the ring asked for |
| `leavewar/sync.ts` | `openNewPeriod` | asks first | the new-period ask |
| `state/undo-wire.ts` | `snapView` | answer | the landing's `then` only on `'went'` |

Also pinned by R5 (c): `openBellRequest` asks the page door before `open()` and its toast. R5 (b): no non-test file but
`state/store.ts` imports `setPage` from `state/view` or calls it through a namespace of it (`test-support/` aside — the
kit sets pages raw on purpose). R5 (d): each of `NoticePart`'s 26 kinds is a key of `LINE_KINDS`, and `LINE_KINDS` names
no kind the union lacks; a kind with no key fails with "say what a tap on this line opens". Each of the three has a
planted-case test.

## Where the plan and the code differed, and what I did

1. **The 'card' and 'page' doors say no note.** `guardWords` returns null for them: their endings ("…then try again.",
   `[WNS]`) are not built, and the brief forbids writing words. A refusal at the OIL list's card (B25) or at a door with
   no named door is therefore silent: nothing opens and nothing is said. B25 asserts nothing opened and names this.
   **For the orchestrator:** the plan's words for these doors are owed before K12's walk, or the walk will meet a press
   that does nothing visible.
2. **`ui/adminopen.ts` needed its import line too.** The one ask-first line cannot stand without `ownPageRefused` in the
   file's import from the store. Two lines changed, not one; the function is otherwise as it was. Compared with
   `origin/claude/msq-b1-screens-135` and chat 205's `origin/claude/msq-s2-users-685735` first: neither changes the file.
3. **The press's door, kept for the turn (my design call).** `openAdminUsers` and `openWarAt` call the door naming no
   door of their own. Pressed from a bell line, a refusal after the Tracker's question must still end "press this line
   again." and stand under the line. So the door named by the press (`'line'` with its line, `'bell'`) is remembered
   until the end of that turn (`PRESSED`, cleared by a microtask) and used where a later call in the same turn names
   none. Without it the note would fall back to the foot with no ending.
4. **A belt on the door's own answer.** After the landing, if the page shown is not the page asked for (or he is still
   off his own pages), the door answers `'refused'`, not `'went'`, and `then` does not run. No test reaches it by a
   press; it guards a landing that changes its mind.
5. **B6b's "a line from a squadron he has since left" is not reachable by a press.** Such a line leaves his bell
   (`noticeLeftBell`), so there is nothing to tap. B6b tests the road a press can reach: a line of a squadron his pages may
   never be (Ranger, 150's input line, 149 picked) — refused at the page door.
6. **An unknown kind is only read** (the plan's Opus F-g), which re-pointed one older test (above).
7. **G1's bell-line sentence in jsdom.** The value typed in a Logic box is applied a beat later. In this test the beat
   passes while the bell itself is pressed, so 142's 13h is saved before the line is pressed. The test still proves the
   line's entry ends the mode and that nothing typed for 142 lands on 149 a beat later. It does not catch the beat still
   waiting at the line's press. Whether a real press can leave it waiting is a browser question (below). The test also
   closes the input window the line opened, by its ✕, before picking back. Otherwise that open window refuses the pick.
8. **B7b with 150 picked already ended on 142's SANS tab before K6.** The landing moved him home after the marks were
   set. K6's change for the reminder is the order (his squadron first, then the marks) and the refusals. The 149 case
   (his Plan) changes outright.
9. **Test hygiene, not code:** the world does not clear the bell between tests. An earlier test's holiday line, made in
   the same minute with a higher id, stood for the new one and hid it (the one-line-a-holiday rule). The holiday helper
   clears older holiday lines first.

## What only a browser can show (for K12)

- **The note under the pressed line:** a refused line's "Blocked: …, then press this line again." hanging under that line
  in the open list, on a desktop and on his iPhone. The note under the bell for the bell's own refusals.
- **G1 F-d for real:** "13h" typed in a Logic box, then the bell and a 149 line pressed without leaving the box. Does a
  real press move the keyboard (the box's change fires) and apply the value before the line's entry? Expected: 142 reads
  13h, 149 12h.
- **The silent card and page doors** (difference 1): a press on the OIL list's card with a change not saved on 142 while
  he views 150 — nothing opens, nothing is said.
- **The holiday line from a squadron he only views:** 142 comes into view first, then the OIL list. Shown in the right
  order, and the number at the top left flashes once (D2620).
- **The Tracker's question then a refusal** (B27): unsaved chart edits in the member view on 149, a 142 input line,
  Discard, while a save fails meanwhile. The note stands under the line and no window opens.
- **"Welcome back"** absent with 149 picked and present after picking 142, on a phone too.

## Scenarios worth a walker's time

1. Hunter, 149 picked by his Plan, an Input window open: tap a 142 input line, a 142 holiday line, a 142 posting line and
   his SANS reminder in turn. Each is refused, the line unread, the list open, the note under it. Close the window, tap
   again: 142, then the page, then the window or list.
2. Ranger, 150 picked (View only), a change not saved: tap his own 142 input line, and press Retry once the save lands. The
   tap is refused until then, then goes through on a second press.
3. Saber with Admin → Users' row open and a letter typed, 149's lines on in his bell: tap a 149 posting line (chat 205's
   case). Then tap the lit bell with an access request waiting.
4. The OIL list's card on 142 while 150 is viewed: the list is 142's, so the card is the input's own door.
5. The Leave War's links from Inputs (the clash note, "make a period") with 150 picked: refused, nothing selected on the war.
6. Hunter restored, signing in with 149 last picked: no card; pick 142: the card; "Check my quals" opens his ringed Quals row.
7. An Undo whose step lands on Inputs, pressed while he views 150 with a change not saved. There is no road by a press
   (row 13), so a walker confirms the Undo button is greyed or refused for that squadron (D2593), not this belt.

## Rulings

Rulings: none this session (a builder helper; no message from him).

```
Status: READY FOR INDEPENDENT REVIEW
Changes: state/store.ts (the page door, ownSquadronFirst, ownPageRefused, ownSquadronRefused, the landing's second ask); state/belltap.ts (enterForLine's guard, wait and closeShown; openBellRequest); ui/topstate.ts (openNotice through the doors, LINE_KINDS, lineOpens, openInputOnPage on then, the SANS reminder's own squadron, bellTap's OIL door); ui/OilDayList.tsx (the card through openInputOnPage); leavewar/sync.ts (openInputWindow on then; openWarAt, openNewPeriod ask first); ui/adminopen.ts (one ask-first line and its import); ui/WelcomeBack.tsx (own squadron only); state/undo-wire.ts, ui/Login.tsx, ui/interactions.ts, probe-bridge.ts (the store's door); new ui/msq-guard-doors-bell.test.tsx; G1's sentence and G10 in ui/msq-guard-g.test.tsx; R5 (b)–(d) in ui/msq-guard-rollcall.test.ts; one planted kind in tracker/msq-bell-recheck-after-ask.test.tsx
Checks: listed above, in raptor-port/
Open items: the 'card' and 'page' doors' words ([WNS], difference 1); K9's enterForLine(inputSqn(…)) lines (pointer comments left); docs/file-map.md line for the new test file (K12); the browser looks above (K12)
```
