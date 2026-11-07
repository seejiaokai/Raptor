# The fresh Opus reader's blind read of job 6, Insights and the last small ones (8 Nov 26)

Run: a fresh Opus helper (D790), on the branch `claude/insights-leftovers` at its first pushed commit, by the brief
`2026-11-08-insights-leftovers-read-brief.md`; blind to Astra's read. Its final report, whole:

No high or medium findings. There are three low ones, and none of them changes anything a person sees today.

**Low 1 — one of the two kept React Doctor findings gives a reason that contradicts a ruling.** `raptor-port/src/ui/mission-role-offer.ts`, line 189 (the disable comment on `asking.includes(open)`).
- The comment says "the open questions are one or two". D598's full row says the opposite: "there is no cap on how many stand, since each needs its own typed edit".
- The code agrees with D598. `asking` holds at most one question per formation and nothing else limits it.
- Keeping the finding is still right. The list is tiny: one entry per formation with an open question, and only his own typed edits add entries. The check is also defensive only: each step drops and redraws its own formation's entry, so another entry is never removed under it.
- The failure is that the stated reason is false against the ruling, so the next reader would trust a bound that does not exist.
- Fix: reword the comment, for example: `// eslint-disable-next-line react-doctor/js-set-map-lookups -- the open questions are few — at most one a formation, each raised by his own typed edit (D598: no cap); this asks whether the one in hand is still in the list after an earlier step changed it, and a Set kept beside the list would be a second record to keep in step`

**Low 2 — the board half of edge (b) is only proven by setting the look in code.** `raptor-port/src/ui/insights-leftovers.test.tsx`, lines 108, 114, 117 and 126.
- Both (b) tests start the look with `setDayPreview(...)` directly.
- The walk presses the real plans selector and its issued row, but only on the week (`#eWeek [data-planmenu="0"]`).
- So "the board's Templates greys under a look started from the board's own plans selector" has no press-the-control evidence. The bug-check order §7.0 says a test that changes the data directly never stands in for pressing a control.
- Nothing is wrong today: the board's menu calls the same `view.setDayPreview(di, pv.dataset.planpv); notify()` (board.ts line 1893). The gap is in the evidence, not the app.
- Fix: in the board part of the test, replace line 117 with `await click(q('#sbSign [data-planmenu="0"]')!);await settle();await click(q('.wavemenu [data-planpv]')!);await settle()`. Or add a board step to the walk's (b) check. I have not run this suggested code.
- The View-only half has the same shape (the `'d:'` look and the page change are set in code). The drop on entering Edit Schedule is said to be pinned in `draftsui.test.tsx`, which I did not read.

**Low 3 — tidiness note only (D489: filed, not fixed).** The same callsign tidying ("close up spaces, trim, cut at 80") still has three separate bodies:
- `raptor-port/src/state/mission-roles.ts` line 90 — the question's name, no 80-letter cut, falls back to "Line";
- `raptor-port/src/state/changelines.ts` line 609 — `roleFormationName`, used for a copied answer's history line;
- `raptor-port/src/engine/mission-role.ts` line 102 — `roleAnswerName`.

Today a typed answer and a copied answer get the same name in the history. A later change to the cut or the spacing in one body would make the change-history line name a copied answer differently from a typed one. If wanted, one exported `lineName(cs)` in `engine/mission-role.ts` would serve all three. This is not a defect now.

**What I checked and found nothing in:**

- **Wording helper, word for word.** I wrote a script in my scratch folder that runs main's bodies and the branch's bodies side by side.
  - It compared 6,687,132 cases: history name with and without a fallback callsign, Undo's words, and the side word. Details covered: absent, empty, `'null'`, not JSON, `[1]`, a number name, a null name, an array name, an object name. Names covered: odd spaces, 79/80/81/100 letters, emoji pairs, and every one of the 65,536 basic characters, alone and spaced. Sides covered: blue, red, Blue, RED, empty, number, null, missing, and no role change at all.
  - There were zero differences for every string or absent detail.
  - The only 51 differences come from a detail that is not a string (an array holding JSON text). That cannot happen: `detail` is set only when `meta.key` is a string (command/commit.ts line 239), and Undo entries copy the envelope's detail (undo/timeline.ts line 327).
  - Undo's old order (trim, then close spaces) and the history's (close spaces, then trim) give identical results, so moving both onto one body changed neither.
  - No other place turns a side into "Blue"/"Red"/"Unresolved". The Insights legend and the question's buttons are fixed words.
- **Imports and bundle.**
  - No new loop: `engine/mission-role` imports only `verid` and `waves`, which lead to `time`, `rules` and `hooks`. None of these imports the undo or state code.
  - No new weight: `mission-role` was already in the main bundle (state/store → state/mission-roles, and undo/derive.ts already imported it).
- **Context refactor.**
  - The same script compared 200,012 formations: odd values in place of mission, aircraft and remarks; lone surrogate halves; line separators; characters whose capitals change length (ß, ﬁ); every DS/RED/REDAIR spelling.
  - `missionContext`, and `resolveMissionRole` with and without a reader, came out identical every time.
  - This is guaranteed anyway: the old code parsed back a string the code had just written from a string and an array of strings, and writing then reading JSON loses nothing for those. So the mission and clause list the resolver tests are the same values as before.
- **Edge (a).**
  - With the caret in a box, the week's narrow repaint (`EditWeek.tsx` lines 133–165) rewrites every block of the day except the one holding the caret. The chip is drawn in the day head, which holds no text box.
  - The test's last check proves this path really ran: it compares the page's focused element with a fresh look-up of the box, which would fail if the box's block had been rewritten. The chip changing in the same paint means the head was rewritten.
  - The board writes its sign strip on the same rule (`SchedBoard.tsx` lines 388–437). The keyboard route puts the focus on the Choose button, which still counts as a text box, so the same path runs.
  - The cases that make the whole day wait are older and unchanged by this branch: a caret in the board over the hidden week, a week jump or peek landing still waiting, a day whose block layout changed.
  - The walk presses with a mouse even on the phone. I tried a stand-alone Chromium page with the same press-holding listeners: a finger tap and a mouse click both kept the focus in the box. So the walk's phone result stands for Chromium; his iPhone is the walk's own stated limit.
- **Edge (b).**
  - Ways a look could exist with Templates pressable: page change drops `'d:'` looks (view.ts line 658); the drafts picker is drawn only on View-only Sched; the plans menu only looks at issued rows, which exist only on published days, where a template is refused anyway (D96).
  - The week's Templates button is drawn only when the day can be edited, which is never under a look. The board's `#sbTpl` is disabled under a look, and its `data-daytpladd` button is withheld then.
  - Undo and redo drop a look whose version vanished (undo-wire.ts line 315).
  - A stale week Templates button would need the caret held in the day head's block, but the head holds no text box, and pressing the plans selector moves the focus anyway.
  - One hardening note, not a finding: `dayTplMenu` (board.ts line 1693) itself has no look check — the protection is only in what is drawn — where `askSortAll` carries one as a belt. I found no route that reaches it.
- **Kept clone (mission-roles.ts).** The reason is true: the store's saved copy and its signature are JSON, and a structured clone would keep keys set to undefined. For every value that reaches the store today (checked answers, or rows already read from JSON) the two clones give the same result, so keeping it costs nothing.
- **Walk script.**
  - The Templates absence is judged in the same paint as the look bar's presence, and the bar must count 1 first.
  - The chip and the question are read only once visible, with waiting.
  - "Caret kept" is read through a locator that finds the box afresh, so a rewritten box would fail it.
  - The toast is read from the visible box. No earlier message in the run contains "the mission role".
  - The precondition that no chip exists before typing is counted 600 ms after a fresh entry to the page.
- **Tests run, read-only:** the new test file passed 7 of 7. The eight existing mission-role test files passed 131 of 131. I did not run React Doctor or anything that builds.
