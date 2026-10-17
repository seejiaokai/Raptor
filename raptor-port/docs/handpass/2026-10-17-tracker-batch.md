# The Tracker batch (D495) — D980, D981, D982 and the faults riding with them — the bug check (FULL)

**Where it stands:** built and checked — FULL tier, every gate green at `cde63cd6a` (§13), the walk 47 / 47 after the code
read's fixes, the breaks 36 / 36. Waiting on him: the empty-band question (§14) and his look card; then his "merge live".

`Walk: docs/handpass/2026-10-17-tracker-batch.md · 78 pictures (38 walk, 19 before, 19 after, 2 of the band's other option) · 17 surfaces · 6 orders · MISSING: none open — the 3 the walk found fixed and walked again; the Tracker suite's phone check fixed (§7); a real iPhone and iPad on his look card (§11)`

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
| D980 the chart by keyboard | `src/tracker/app/core.js` (`chartKey`, `kbdNext`, `kbdStep`, `paintKbdRing`, `kbdKeepInView`, `kbdBack`, `windowUp`; `openPop` / `closePop` / `openInfo` / `closeInfo`; the board's key, focus and blur listeners in `enableHScroll`); `components/Pop.jsx` (the keyboard on the event's own grade once placed, Tab loops, arrows along the grades, `role="dialog"`); `tracker.css` (the focus outline in the pop-up) | the board was already ONE Tab stop; its arrows scrolled — now they walk the events; the ring is drawn on the chart's overlay layer at the ball's place (inside the ball's group it made the ball measure 24px wider — the Tracker suite caught it) |
| D980 branches | `kbdNext` / `kbdStep` | the scenario designer's 7: 9 events on the 2024 chart and 4 on the 2026 chart could not be reached; → ← → takes the next branch, ← → ← the next thing an event needs |
| D980 a grade pressed again | `popGrade` | the keyboard starts on the event's own grade, so a second Enter saved a mark of nothing — the same grade on the same day now only closes |
| D981 | `people.js` (`setGonePeople`), `peoplewire.ts` (`deletedForTracker`), `core.js` (`leaveRunningCourses`, called at boot before the first course loads and whenever the deleted list changes) | the people bridge did not tell the Tracker who was deleted (archived and deleted look alike in its list) |
| D982 | `core.js` (`flexFor`, `landingCurrency` return the ink with the colour), `SidePanel.jsx` | one place gives a bar both, so no bar can have one without the other |
| `[TRK-WIREBOARD-REPEAT]` | `wireBoard` (`wireOnce`) | each part of the chart is wired once; the release still wires the lines its drag redrew (a whole redraw at the release was tried first and taken back — it moved the editing canvas) |
| `[TRK-BALL-OFF-CHART-LEFT]` | `moveBall`, `moveGroup`, and every line-point handler (`svgPtOnChart`) | a drop before the chart's start is held at it |
| `[TRK-REMOUNT-LANDING]` | `App.jsx` (the remount lands), `core.js` (`landChart` — one body for the boot, a person's own place and a remount; `scrollToEvent` centres, as before — a hold at the chart's start was tried and taken back, his 9 Sep "centralise" ask; the empty band above the first event is put to him, §14) | the remount drew the chart without asking where to land |
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
**The re-walk after the code read's fixes** (17 Oct 26, the next chat, on the build at the fix below — results
`docs/handpass/parts/trk-batch/trk-batch-walk-KPL-rewalk.json`): **K 26 / 26 · P 12 / 12 · L 9 / 9 — 47 / 47, no errors**
— K16 (a mouse press takes the ring away) and K17 (no ring after a Log out and in) new; the ring found on its new layer;
L3 – L5 now ask for the landing CENTRED (the hold taken back), the first event 0px off the middle at both sizes.
**The Tracker suite's one open fault, found and fixed (the next chat):** "✓ Done editing chart keeps the middle" was 51px
off on the batch and passed on `main`. The suite's own phone steps were replayed on both builds, the chart's place printed
after every step: the two runs part at the Delete step, where a line is drawn on "empty canvas" that lies in the room
ABOVE the chart — on `main` it is drawn 150 above the chart's start (the fault `[TRK-BALL-OFF-CHART-LEFT]` fixes), on the
batch on its top edge; every pinch after starts elsewhere, and the batch's run ends with the editing view's middle 21 above
the chart's start, at 3.7× zoom. The ordinary chart cannot scroll before its start, so it stops at its top edge — the
nearest it can come — and the ball lands 51px short of where holding a point no chart can show would put it. `main`
passed by luck: its run ended with the middle on the chart. **Not a fault of the app; the check promised the impossible
there.** The check now holds each side of the middle exactly, and on a side where the middle was before the chart's start
asks for the chart at that edge (`scripts/tracker/smoke.mjs`). Proved both ways: it passes on the batch's build and on
`main`'s; broken by hand after the leave — the chart nudged 60px sideways, or 40px down from its edge — it fails (78px,
91px).

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

`scripts/handpass/breaks/trk-batch.json` — **36 of 36 caught** (`node scripts/handpass/breaks.mjs …`, the whole list run again
after the code read's fixes, 17 Oct 26): each fix taken out once, its test red. That run first caught 34 of 36: break 34
(the session's end clearing the keyboard's state) and break 36 (the ring drawn only while the keyboard is on the chart)
were each covered twice over by a later fix (a blur, `closePop`'s own clearing), so the tests written for them passed with
the line gone. Each line still guards its own way in, so each got a test that only it passes — the next person's details
window after a session ended with ✎ Edit details up from the keyboard; a keyboard pop-up dropped by a course load — and
both were broken again: caught, each by its own test. What a break cannot reach (a real browser only): focus-visible, the pop-up's placing, the landing's
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

Two fresh Opus helpers that did not write the code (D790; Fable not — D903; without Astra and Sol 6.1 → `[NO-ASTRA-LIST]`).
- **The scenario designer** (before the walk, asked for what is MISSING): 26 scenarios. Its finds, each fixed red-first
  and walked: Enter twice saved a mark of nothing (K11b); ✎ Edit details left the chart listening (K11c, K11d); the date
  box's two Escapes (K11e — held already); a click elsewhere left the ring (K11f); the keyboard did not follow a search
  (K11g); a deleted man on screen at the start (P2.3, P2.4); wide names (N2); **13 events no arrow could reach** (the
  branches rule — every state walked in a test, K11h). Set aside, each with its reason in §11.
- **The blind code read** (after the walk, the sheet in hand): no HIGH; one MED, three LOW, each fixed with a test:
  1. MED — a deleted man who STAYED on a finished course was tested again on every later start, so a chart edit (D474)
     or a grade put back could take him off later: now tested ONCE, at the delete — he carries `goneKept` on his entry
     there (`trk-batch-store.test.ts` "tested ONCE"); a course restored or imported gets its own first test.
  2. LOW — the course's "last graded" pointer was left on the man who left: cleared, as Remove does (same file, P1's test).
  3. LOW — a mouse press on the chart while a keyboard pop-up was up left the ring: the chart's focus repaints (walk K16).
  4. LOW — a Log out with a keyboard pop-up up left the keyboard's state for the next person: the session's end clears
     it (`trk-batch-ui.test.tsx`; walk K17).
  Its roll-call absences, answered: a restorable (deleted) course is tested when restored — the mark is per entry; the
  + Add and Show All jumps go through the same landing (`scrollToEvent`) — the keyboard follows them as it follows a
  search; Details mode's brief stays on the event it was shown for while the arrows move on — Enter shows the next one; left as built (not checked how a mouse user's bubble behaves meanwhile);
  the top bar's Undo on another page after a Post out — a Tracker command is never in the other pages' Undo (not this change).
  The fixes are new code (§5 of the order): one narrow round — the re-walk below, and their breaks (§9).

## 13. The gates

The whole gate set under the PC lock, one run, 17 Oct 26, at `cde63cd6a` (the code as it ships; only documents changed
after): **build clean · tfin 728 / 0 · unit 11640 / 11640 (654 files) · e2e 844 passed, 0 failed, 59 skipped · smoke
446 / 0 · rulecheck OK · docsize OK.** The run before it (at `39daa4913`) had smoke 443 / 3 and docsize 1 problem — each
traced and fixed (§7, and the landing hold taken back).

## 14. Before and after — for him

The page: https://claude.ai/artifact/RTF67FRK8uQUmyF4BSzwtv — each visible change as a pair (the same steps on `main`'s
build and the batch's, `scripts/handpass/trk-batch-pictures.mjs`; the after pictures retaken on the final build), the
two with nothing to see in words, the look card, and what was left out.

**Answered by him — D984, 17 Oct 26: "As recommended B".** Built the same day (`scrollToEvent`: centred wherever that
shows no empty space, never with the slack above or left of the chart's start in view), with the Tracker suite's two
landing checks and the walk's L3 / L4 saying so; L walked again 9 / 9 (`…/parts/trk-batch/d984/`). The Tracker suite on `main`'s build with the new checks fails exactly the
first-event check ("NOT held at the chart's top", 445 / 1): the check tells the two landings apart. On the batch's build
it first gave 445 / 1 on a different check — the phone's "two lost lifts" — every time: the phone page now starts from
another place (T-01 in the middle, not ST-01), so the pinches before that step left the view on an empty stretch of chart
with no ball near the middle to drag. The check's fault again, not the app's: the step now pans the canvas by a finger on
its empty space until a ball is there, then runs as before (both builds pass the phone block). The question as it was put:
1. *The empty space above the first event.* A student with nothing marked lands centred on ST-01 (his 9 Sep "centralise
   the view if its possible"), which leaves empty chart above — on a phone the top half of the chart box. A: keep it
   centred (as built, as now on `main`). B: centre every event that can be, but stop the chart at its top so nothing above
   it is empty (built once and taken back — its pictures `…/band-option/`). **Recommended: B** — on a phone half a
   screen of nothing reads as a chart that has not loaded. Waits on it: nothing of this branch; B would be a small
   follow-up (the landing and two of the Tracker suite's centring checks).

**His look card (a real iPhone and iPad — no Safari on this PC)**
1. iPhone, the chart: a tap on an event opens marking and draws no blue ring.
2. iPhone, the Info half: a long student name is whole on both sides of the key.
3. iPad upright, the Info half: Last Flown (Syllabus)'s calendar opens right under its box (`[TRK-DATEBOX-SAFARI-ZOOM]`).
