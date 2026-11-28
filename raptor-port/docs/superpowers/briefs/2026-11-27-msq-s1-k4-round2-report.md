# Section 1 (the guard rail), step K4, round 2 — the builder's report (chat 204's helper, 27 Nov 26)

Brief: `2026-11-27-msq-s1-k4-round2-brief.md`. Branch `claude/msq-s1-guard-6ae5e1`, working copy
`lw-balances-hover-275293`. Nothing committed or pushed; `HANDOFF.md`, the plan, `OUTSTANDING.md` and
`ui/UsersPanel.tsx` not touched. **No app code changed** (nothing under `src/` outside test files and `src/test-support/`).

**In one line: the memory fault was a real leak — the Tracker's chart leaves three listeners on the window each time it is
drawn, each holding the whole page — swept in the shared teardown, and the file now runs to its end; three of the four kind
(a) tests are on the midnight road, the fourth (the Undo) cannot be and stays whole by the raw entry; the beat at the entry
is never drawn, so nothing changed for it.**

## Which files belong to which item (so each can be committed alone)

| Item | Files |
|---|---|
| 2 (memory) — alone | `src/test-support/msq-guard-testkit.ts` |
| 1 (kind (a) tests) — alone | `src/ui/msq-pick-windows.test.tsx` |
| 3 (the beat) — alone | `src/ui/msq-guard-doors.test.tsx` |
| this report | `docs/superpowers/briefs/2026-11-27-msq-s1-k4-round2-report.md` |

`src/ui/msq-guard-open.test.tsx` is NOT changed (the temporary memory log used for the measuring was taken out again).

## Item 2 — `msq-guard-open.test.tsx` ran out of memory: a real leak, found and swept in the teardown (done first)

**The cause, measured.** A temporary log in a `beforeEach` (heap after a forced collection, the process's memory, and a
count of window and document listeners still on), over A3 and A8 (46 tests): the heap stayed at about 210 MB through the
tests that draw no Tracker, then grew **about 65 MB with every Tracker test** (A8: 595 → 1700 MB over 20 tests), and each
Tracker test left **one more capture listener each for `keydown`, `pointerdown` and `touchstart` on the window**
(5/4/4 → 22/20/21). They are put on by `tracker/app/core.js enablePinchZoom(el)` (its lines 4238, 4329, 4330), once per
chart element, and never taken off; each closes over the chart element, which holds the whole page drawn in that test.

**Whose leak.** **The app's own, not the test world's** — for the orchestrator to weigh, not fixed here. In the app each
fresh chart element (each time the Tracker page's board is drawn anew) leaves three window listeners holding the old
chart; nothing removes them until the page is reloaded. How often that is in real use (every Tracker tab visit, or only
the first) I did not measure.

**The fix, in the shared teardown only** (`src/test-support/msq-guard-testkit.ts`): the kit wraps the window's and the
document's `addEventListener` / `removeEventListener`; every listener put on while a test runs and still on at its end is
taken off at the end of `guardTeardown`, after the page is unmounted. It arms at the end of each teardown, so a listener a
module puts on once as it loads (before the first test) is never touched. The comment says why and that the app's leak is
reported. The same A3 + A8 run after it: heap 285–430 MB throughout, the listener counts no longer climbing.

**No split was needed.** `msq-guard-open.test.tsx` itself is unchanged.

| Run of the whole file (background, by full path) | Result | Exit | Wall time | Memory |
|---|---|---|---|---|
| with the temporary log, no cap | **341 passed (341)** | 0 | 1059 s | heap after each test's clean-up flat at 225–650 MB; the process's memory rose to 2.69 GB only because the engine collects late when it may |
| the clean file, heap capped: `NODE_OPTIONS=--max-old-space-size=1536` | **341 passed (341)** | 0 | 1088 s | **peak working set of the test worker 1,368 MB** (read every 5 s from outside) |

The capped run is the proof for GitHub's machine: the whole file finishes with the heap held to 1.5 GB, under half the
4 GB it used to exhaust. The other two files that use the teardown (`msq-guard-doors`, `msq-guard-note`) pass with it
(below).

## Item 1 — the four kind (a) tests (`src/ui/msq-pick-windows.test.tsx`)

The midnight road, as in `msq-fix-sched-windows-midnight.test.tsx`: Hunter (142's admin) moved by Saber to 149 at 23:57
on Wed 15 Jul, his window open on 142's Inputs, then `pastMidnight()`. Held so, the window's band reads the midnight band's
words, `SCHED_MOVE_WORDS` ("This change could not be saved.", read from the source, not typed) — and, unlike the pick's
band, its controls are **not** greyed or dead (store.ts `heldWords`: neither a pick nor the member view). So "held" is
read by the band and its words, and by Save going nowhere (`saveGoesNowhere`: an unchanged window's Save would close it,
a held one returns first — the window stays open, the list unchanged), where the pick's hold was read by its lead and its
greyed, dead Save. That one assertion is the one that changed shape, for that reason; every other assertion about what the
held window does is kept.

| Old test (K0's line) | Old set-up | New | Assertions changed, and why |
|---|---|---|---|
| l.360 "a Plan holder's window held at a pick of 149 stays held through an Undo and a Redo; 142 picked again gives it back" | Plan of 149, his change on 142's Inputs, window open, **pick** of 149 | **Stopped on the midnight road** (below). The whole test kept by the **raw entry**, as the kind (b) tests are: "…through an Undo and a Redo; 142 picked again gives it back — reached by no press since D2403 … by the raw entry; removed with the band in Build 2" | none: every assertion as before (page, unit, record replaced, change gone / back, Save dead and greyed, the pick's lead, 142 gives it back); only the press is `rawPick` |
| l.376 "a View holder's window held over 149's View-only Sched stays held when its record is put back as a new object" | View of 149, window open, **pick** of 149 | two tests. (1) **midnight:** "a window held across his own move at midnight stays held when its record is put back as a new object". (2) the View holder's half **by the raw entry**, its old title + "— reached by no press since D2403 …" | (1): the lead is the midnight words; Save goes nowhere in place of "Save dead and greyed" (the reason above). (2): none |
| l.393 "another input asked for over the held window's unsaved words: the window keeps the first, and stays held" | Plan of 149, words typed, **pick** | midnight: the words typed before midnight; title adds "(held across his own move at midnight)" | the lead is the midnight words; Save goes nowhere — here with his typed words in the window: nothing saved, no input carries them, the window stays |
| l.409 "(control) a different input opened in the held window takes a fresh note: not held" | `heldPlan()` (a pick) | midnight: "(control) a different input opened in a window held across his own move at midnight takes a fresh note: not held" | none |

**Why l.376 became two:** its hold is a different branch of the window — held because its own page is no longer offered
(InputWindow.tsx `kept.offered`). The midnight road does not make that state: a man who moves arrives a member, whose
Inputs page is still offered. So the midnight test holds the "new object" fault on the other branch, and the View holder's
own branch stays by the raw entry, every assertion kept.

**Where I stopped — l.360 on the midnight road.** An Undo of his change made at 23:57 is **refused after midnight**:
"Something else changed this after your action — it can't be undone now." Measured: the Undo works at 23:57; across the
midnight wake the only input record that changed was another man's past appointment (Tue 14 Jul, gan9) taking `acc: 'g'`
(accepted onto the Ground Programme) — the app's own run at midnight writing to the inputs, which bars every earlier Undo.
After midnight he is a member of 149 with no input of his own to change, so no Undo step of his can be made on this road
without new set-up. No assertion was weakened: the midnight version was not kept, and the whole old test stands by the raw
entry. **For the orchestrator:** (a) whether the midnight write that blocks an Undo made a few minutes before midnight is
wanted (it is the app's own behaviour, outside this step); (b) whether the raw-entry version is enough until Build 2 removes
the pick's band.

Count: 22 tests before, **23** now (l.376 split in two). File run: **23 passed (23)**, exit 0 (`.tmp/k4r2-pickwin.txt`).
Not "seen failing" afresh: these are re-pointings; the four were red on the K4 code, as the K4 report shows.

## Item 3 — the one beat at the entry (`src/ui/msq-guard-doors.test.tsx`, a new describe after B4b)

"the entry with a show-only Leave War sheet up: never held, not even for a beat" — by each list (the bar's, ☰'s):
Ranger's "Leave filed on the Inputs page" up (the kit's `openLeaveFiled`), a pick of 149, then everything settled. A
`MutationObserver` on the page records any held band put on it in the same run as the entry (`move-band`,
`inped-moveband`, `[data-heldro]`). Asserted: through (149 in view); the war's world is what the entry gives it unheld;
the sheet gone; `holdNow()` is `'none'`; **no held band drawn at any moment**; nothing held; the store's war band the same
as a control pick with no sheet up (two control tests before them, by each list).

**Found:** nothing is ever drawn held. In the store the war band does stand for that beat ("This is 142's.") — but the
sheet that would carry it unmounts in the same render, so it never reaches the page. **Changed nothing in `enterPicked`**,
as the brief says. Two things the brief's wording did not foresee, recorded:
- "the war's world is the picked squadron's" does not hold for this person: Ranger, a member, sees 149 by View only, and
  his own pages, the Leave War among them, stay 142's at the pick (D2197). The test asserts the war is his own pages'
  squadron, unheld. The show-only sheets open only for a member's tap, so the case with the war actually following the
  pick (a Plan holder) cannot be set up with these sheets.
- After a View holder's pick, the store keeps the pick's war band even with no sheet at all (his war is left on a page 149
  does not offer — store.ts `publishBands` `warBehind`); no window is open, so nothing draws it. Harmless as it stands;
  worth knowing if anything ever reads the band outside a war window.

Run: `-t "never held, not even for a beat"` — **4 passed**, exit 0 (`.tmp/k4r2-beat.txt`).

## Checks (all in `raptor-port/`)

| Command | Result |
|---|---|
| `npx vitest run src/ui/msq-guard-open.test.tsx` (background) | **341 passed**, exit 0, 1059 s |
| the same, `NODE_OPTIONS=--max-old-space-size=1536`, the clean file (background) | **341 passed**, exit 0, 1088 s, worker peak 1,368 MB |
| `npx vitest run src/ui/msq-pick-windows.test.tsx` | **23 passed**, exit 0 |
| `npx vitest run src/ui/msq-guard-doors.test.tsx -t "never held, not even for a beat"` | **4 passed**, exit 0 |
| K4's files again, one run (`--maxWorkers=2`): `msq-guard-doors`, `msq-guard-g`, `msq-guard-asis`, `msq-pick-windows`, `msq-pick-swap-question`, `msq-night-held-input`, `tracker/msq-trk-follows-pick`, `msq-guard-note`, `msq-guard-rollcall`, `test-support/no-app-import` | **10 files, 315 passed, 6 to-do**, exit 0, 240 s |
| `npm run lint:changed` | the one known finding only, `ui/UsersPanel.tsx` (PersonEditor's complexity) — not this section's |
| `npm run build` | **NOT RUN** — the checks lock was held at every look: by `claude/sans-warnlines-185` (chat 207, a build and a FULL walk) at the first three, over about 60 minutes, then by `claude/lw-postin-build-5d49de` (a Leave War unit run) at the last |

No full unit suite. The test-count sum for the guard-open file is unchanged at 341 (no split).

## Rulings

None this step (no word of his).
