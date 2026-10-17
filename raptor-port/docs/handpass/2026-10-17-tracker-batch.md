# The Tracker batch (D495) — D980, D981, D982 and the faults riding with them — the bug check (FULL)

**Where it stands:** _(written at the close)_

`Walk:` _(written at the close)_

Branch `claude/tracker-batch-d495-affb5f`, cut from `main` at pull request 529. His word (17 Oct 26): build the Tracker
batch — D980, D981, D982 and the faults that ride with it (the triage, `docs/superpowers/plans/2026-10-17-tracker-batch-triage.md`),
one FULL check for the batch, each visible change shown before and after; not the progress graph (D774).

## 1. The eight questions — tier FULL

1 money / OIL — NO: the Tracker touches no OIL and no pay. 2 the published record — NO: no schedule, publish or
amendment is touched. **3 saved data — YES:** D981 rewrites a deleted man's place on stored student lists, on every
course; the undo fix changes which records an undo stores or removes; the save-failure fix reads Raptor's saver.
4 a shared drawer — YES, small: the chart's one drawing routine (`renderBoard`) now also paints the keyboard's ring, and
every landing of the chart goes through one body (`landChart`, `scrollToEvent`). 5 a new gesture or mode — YES: the
chart by keyboard (D980). 6 a new surface — NO (the ring is a mark, the pop-up exists). 7 roles — NO: the Tracker reads
no role (D121); a delete is the admin's, unchanged. 8 the warning list — NO.
**3 → FULL.** One check for the batch (D485), sized by its riskiest change.

## 2. The rules sweep — every ruling this batch must keep

| Ruling | What it asks here | Checked by |
|---|---|---|
| D980 | one Tab in; → ← ↑ ↓ along the lines; Enter opens marking with the keyboard inside; Escape back to the same event; the plain blue ring (D876), no glow (D887); not a Tab stop per event | walk K; `trk-batch-ui.test.tsx` |
| D981, D299, D290 | a deleted man leaves every course still running for him (an event neither done nor N.A.); stays, his record kept, where all are; never erased | walk P; `trk-batch-store.test.ts` |
| D982 | dark words on green, amber, red bars; white on grey; colours and words unchanged | walk B; `trk-batch-ui.test.tsx` |
| D132 | an import never deletes marks — D981 keeps his marks the same way, out of sight | `trk-batch-store.test.ts` (break 10) |
| D350 | a delete is not undone — D981 plans no way back | read |
| D372 | a pace, end date or lull change is an undo step — the undo fix keeps every stored record put back | `trk-batch-store.test.ts`, `leftovers.test.tsx` D372 block |
| D376, D377 | each person reopens on his own course and student; the landing as a pick makes it | walk L |
| D899 | a drag carried to the edge pans; the pan stops at the chart's start — the drop now stops there too | walk E |
| D876, D887 | one look for a mark: the plain blue ring, no glow | walk K pictures |
| D587 | the failed-save warning is Raptor's band; the Tracker's corner no longer contradicts it | walk S |
| D121 | everyone in the Tracker does everything — nothing here is gated | read |
| D129 | logging out with unsaved chart edits asks first — the logout of walk L has none | walk L |
| D56 | stored-only harm is not a finding — in every reader's brief | the briefs |

## 3. What was built

| Change | Where | The one-line why |
|---|---|---|
| D980 the chart by keyboard | `src/tracker/app/core.js` (`chartKey`, `kbdNext`, `kbdStep`, `paintKbdRing`, `kbdKeepInView`, `kbdBack`, `windowUp`; `openPop` / `closePop` / `openInfo` / `closeInfo`; the board's key, focus and blur listeners in `enableHScroll`); `components/Pop.jsx` (the keyboard on the event's own grade once placed, Tab loops, arrows along the grades, `role="dialog"`); `tracker.css` (the focus outline in the pop-up) | the board was already ONE Tab stop; its arrows scrolled — now they walk the events, the ring is drawn in the ball's own group |
| D980 branches | `kbdNext` / `kbdStep` | the scenario designer's 7: 9 events on the 2024 chart and 4 on the 2026 chart could not be reached; → ← → takes the next branch, ← → ← the next thing an event needs |
| D980 a grade pressed again | `popGrade` | the keyboard starts on the event's own grade, so a second Enter saved a mark of nothing — the same grade on the same day now only closes |
| D981 | `people.js` (`setGonePeople`), `peoplewire.ts` (`deletedForTracker`), `core.js` (`leaveRunningCourses`, called at boot before the first course loads and whenever the deleted list changes) | the people bridge did not tell the Tracker who was deleted (archived and deleted look alike in its list) |
| D982 | `core.js` (`flexFor`, `landingCurrency` return the ink with the colour), `SidePanel.jsx` | one place gives a bar both, so no bar can have one without the other |
| `[TRK-WIREBOARD-REPEAT]` | `endDrag` | `renderBoard()` (a fresh chart) in place of `wireBoard()` on the same one |
| `[TRK-BALL-OFF-CHART-LEFT]` | `moveBall`, `moveGroup`, and every line-point handler (`svgPtOnChart`) | a drop before the chart's start is held at it |
| `[TRK-REMOUNT-LANDING]` | `App.jsx` (the remount lands), `core.js` (`landChart` — one body for the boot, a person's own place and a remount; `scrollToEvent` never shows the slack above or left of the chart) | the remount drew the chart without asking where to land |
| `[TRK-KEY-NAME-CLIP]` | `keyFont`, `renderKeyBall` | a name is given the room its side of the card has, measured in the key's own type where a browser can measure |
| `[TRK-SAVE-FAIL-SAYS-SAVED]` | `storage.js` (`useSaveHealth`), `main.tsx` (hands the saver over), `core.js` (`saveWords`) | the Tracker's write lands in memory at once; it never heard the saver fail |
| `[TRK-UNDO-WRITES-DEFAULTS]` | `markSnap` (`st` — what was stored), `restoreSnap` | the snapshot held the defaults the chart shows, and an undo wrote them |

## 4. The roll-call — every place each change shows or acts

| Place | Shows / acts | Usable | Painted on the same pixels | Proved by |
|---|---|---|---|---|
| The chart (`#board`), desktop — the keyboard's one Tab stop | YES — the ring | YES — Tab, arrows, Enter / Space | the gold "can fly next" ring (r+3), the turquoise "search found" ring (r+8), the student's cyan wedge edge, failure ticks — the keyboard's ring sits outside them all (r+12) | walk K1–K15, K11b–h; picture K11h (search ring and keyboard ring side by side) |
| The chart, phone | NO, because D980 is a desktop's (D820); a tap on the chart draws no ring — focus-visible | — | — | walk L, B, N on the phone draw no ring (pictures); **a real iPhone tap: his look** |
| The marking pop-up | YES — opened by Enter, the keyboard on the event's grade | YES — arrows along the grades, Tab loops, Escape / grade / Close back to the chart | the pop-up over the chart (its own layer, as before) | K6–K11, K11b, K11e |
| The pop-up's two date boxes | YES — reached by Tab | YES — Enter opens the calendar; Escape closes the calendar first, then the pop-up | — | K11e |
| ✎ Edit details (from the pop-up) | YES — the window takes over | YES — Escape gives the keyboard back to the chart | the chart behind it takes no keys | K11c, K11d |
| Details mode | YES — Enter shows the brief | YES | the bubble beside the ball | K13 |
| Edit chart layout | NO, because it keeps its own keys and draws no ring | — | — | K14 |
| The Students card (chips), the Crew list, the key round the course ball, the chart's wedges, the Copy-to and lull-copy lists (D981) | YES — a deleted man is gone from all (they read the one student list) | — | — | P1.3–P1.6, P2.3–P2.4, P3.2 (phone) |
| Another course's list (D981) | YES — left too | — | — | P1.3 (stored) |
| His record (marks, dates, pace, lulls) (D981) | kept, out of sight | — | — | P1.5; `trk-batch-store.test.ts` |
| The Currency & flex bars (D982), desktop and the phone's Info half | YES | — | — | B1–B3 both sizes (contrast measured on screen: grey 6.2, green / amber / red ≥ 4.5 with dark ink) |
| Edit chart layout: ball, group, line drawn, line corner, end handle, bend square (edges) | YES — held at the chart's start | YES | the guide lines (unchanged) | E1–E4 (ball, group, line drawn); `trk-batch-ui.test.tsx` (ball, group); the corner, end handle and bend square carried by the one helper they share (`svgPtOnChart`) — §8 |
| Edit chart layout after a release (the view, the wheel, Connect; Text and Delete clicks) | YES — once each | YES | — | W0–W2 walk the view, the wheel and Connect; Text and Delete ride the same click listener the fix stops doubling (the listener read, §12) |
| Coming back to the Tracker (Log out / in, another tab and back, a member's first visit), a crew pick, a search | YES — the landing | — | — | L1–L5 both sizes |
| The Tracker's corner save words (desktop and phone) | YES — nothing while "Not saved" | — | Raptor's band above (unchanged) | S1–S2 both sizes |
| An undo / redo of a mark | stores nothing nobody made | — | — | U1–U2; `trk-batch-store.test.ts` |
| The standalone Tracker (no Raptor around it) | the bridge's deleted list empty, no saver — everything as before | — | — | read (`people.js`, `storage.js` defaults); `npm run smoke:tracker` in the gates |

## 5. The door check

The new gesture is the chart's keys. Every other way a key reaches the chart: the page-wide Escape, Delete and undo keys
(App.jsx — unchanged, they run after the chart's own); the search box's ↑ ↓ (its own input — the chart's keys ignore an
input); Edit chart layout (the keys return at once); a window over the chart (`windowUp` — the keys return); another
Raptor tab (the listeners are on the board, which is hidden). Every way the keyboard LEAVES the pop-up: Escape, a grade,
Close (back to the chart), ✎ Edit details (to its window, then back), a press elsewhere (the ring goes).

## 6. Sizing the walk (D607)

1. **Type:** C (a new control — the chart's keys) leading; G (saved data — D981, the undo); D (the landing, one body for
   several ways in); E (the bars, the key).
2. **What only a walk could find:** focus and focus-visible in a real browser (jsdom has neither layout nor focus-visible
   — the mouse-grade ring was found only by a picture); the pop-up's placing before focus (found by the walk); the
   Leave War's real Post out reaching the Tracker open and closed; the landing's scroll; real text widths.
3. **The ledger:** walks of type C have found faults in most jobs that had them (the record's own summary); type G walks
   find their faults in the orders around reload and undo.
4. **The walk chosen:** the host, scripted (`scripts/handpass/trk-batch-walk.mjs`), nine scenarios, desktop and phone (the
   phone where a change shows there), the deleted man three ways (the Tracker open, closed and booting, the phone);
   repeated cases carried by tests are in §8. No helper: each step needs the change's own detail.
5. **After the walk:** the ledger's row is added (`docs/walk-ledger.md`).

## 7. The walk — scenarios, orders, results

All on the final build, 17 Oct 26 (results `docs/handpass/parts/trk-batch/trk-batch-walk-*.json`, pictures
`docs/img/handpass/2026-10-17-tracker-batch/walk/`). **K 24 / 24 · P 12 / 12 · L 9 / 9 · E 4 / 4 · W 3 / 3 · B 6 / 6 ·
N 4 / 4 · S 4 / 4 · U 2 / 2.** Orders walked: the keyboard and the mouse interleaved (K12 after K11, K15 after a crew
pick); a mark, Ctrl+Z, Enter twice (K9–K11b); the delete with the Tracker open, then a reload (P1); the delete with the
Tracker closed, then its boot, with him the picked and last-marked student (P2 — 72 samples of the Crew list from the
first frame, none names him); undo, then a reload (U).
**What the walk found, each fixed and walked again:** the keyboard ring after a MOUSE grade (Chrome leaves the focus on
the pressed button — now only the keyboard's focus counts); Enter's pop-up not taking the keyboard (it is drawn hidden
while it measures its place — now it takes it once placed); the ring dropping while the pop-up is up (kept now).

## 8. Carried by a test, not walked

| Case | Test | What it proves | Through the screen? |
|---|---|---|---|
| A deleted man whose events are all done or N.A. stays | `trk-batch-store.test.ts` "every event done…" | the calculation, on his stored marks | no — marking 210 events on screen would only repeat P's route; the route on screen is P's |
| One event left is enough to leave | same file | the calculation | no — the same route |
| Only a DELETED man is on the bridge's list (archived, SANS, posted out are not) | same file | `deletedForTracker` | no — the bridge is code, not screen |
| Every event of the four built-in charts reachable by the arrows | `trk-batch-ui.test.tsx` "every state walked" | every keyboard state from the first event | no — 210 events × states; K walks the route |
| A line's corner, end handle and bend square held at the chart's start | E3 walks the drawn line; the three share `svgPtOnChart` | the one helper | partly |
| A pace or dates the student never had: not stored by an undo; a pace he set: kept | `trk-batch-store.test.ts` | what the whiteboard stores | U walks the first |

## 9. The break tests

`scripts/handpass/breaks/trk-batch.json` — **31 of 31 caught** (`node scripts/handpass/breaks.mjs …`): each fix taken out
once, its test red. What a break cannot reach (a real browser only): focus-visible, the pop-up's placing, the landing's
scroll, measured text — each carried by the walk (K12, K6, L1–L5, N1–N2), red on the build before the batch where it
showed (the before pictures).

## 10. Errors seen

None in the console or page across the walk (the forced storage refusal of S logs its own, expected).

## 11. Not walked, and why

- **Two browsers at once (the designer's 17):** no live sync between browsers exists today (the database step).
- **A real iPhone / iPad (the designer's last list):** a tap must draw no ring; the phone's landing under Safari; the
  narrowing of long names in Safari's type; an iPad's keyboard — **on his look card**.
- **`[TRK-DATEBOX-SAFARI-ZOOM]`:** no Safari on this PC — left open, on his look card.
- **Archive, Restore, "Undo post out" leaving nobody (the designer's 13):** carried by the bridge's test (only a deleted
  man is named); those routes are not this change.

## 12. The reads

## 13. The gates

## 14. Before and after — for him
