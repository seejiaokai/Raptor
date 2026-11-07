# Pictures round, group marks (the Tracker and round 5 of the consistency look): notes for the host

Drawn 7–8 Nov 26 on the app built from `main` at `6e6c55667` (served at port 4291; `main` has moved since only in notes,
nothing under `raptor-port/src`), signed in as Saber (admin), the clock held at Mon 13 Jul 26, 09:00. Script:
`raptor-port/scripts/handpass/pr-marks.mjs` (`PRM_ONLY=trkpop,r5a,…` redoes one section). Pictures at his iPhone's size
(402 × 874, touch) and his PC's (1536 × 864), both at 2×. A picture whose name ends `-drawn` is the running app with the
change drawn into the page (nothing saved); every other picture is the real app today. The numbers below were read in
the page by the script (kept outside the repo; every one quoted here). Four questions: two for the Tracker
([TRK-ROUND-SEEN] points 2 and 3) and round 5 of [UI-CONSISTENCY-LOOK] grouped as two. None has gone stale.

---

## 1. [TRK-ROUND-SEEN] (2) The Tracker's marking pop-up covers the bars on a phone

**(a) The question.** When you tap an event in the middle of the Tracker's chart on your phone, how should its marking
window open so it covers neither the bars at the top nor the event itself?

**(b) Still open? Yes, and it is the normal case, not a corner.** Today the window opens below the event when it fits,
else flips above it, held 8 px from the screen's top; it knows nothing of the bars. Measured at the iPhone size, Student
A, course 26ABSG, chart 2026: the window is 429 px tall; the top bar ends at 49, the Tracker bar 49–119, the Flow chart /
Info / Show All tabs 119–165, the chart 165–841.
- Find "ACG-09": the chart lands ACG-09 as near its middle as the chart's start allows (his D984), the ball at y 419–448. A tap opens the window at
  **8–437**: over the top bar's Undo, Redo and bell, the whole Tracker bar, the three tabs, and the top 18 of the ball's
  29 px.
- An event tapped anywhere from about y 440 to 600 does the same (measured every 30–40 px: the window's top lands at 8,
  29, 59, 89, 119, 159 — over the tabs each time). The chart's middle is y 503, so **every Find and every crew pick
  lands its event inside that band**, unless the event is at the chart's very top (D984: one landing does them all).
- At his PC's size the same: ACG-09 lands at y 435–505; its window opens at **29–458**, over the top bar's page names
  (Logic, Leave War, Tracker) and the whole Tracker bar (57–108), and over the top of ACG-09's ring.

**(c) Pictures.**
- `q-trkpop-ph-today.png` — real, iPhone: ACG-09's window over the top bar, the Tracker bar and the tabs; tagged "It
  covers the top bar, the Tracker bar and the Flow chart, Info and Show All tabs".
- `q-trkpop-pc-today.png` — real, PC: the same window over the page names and the Tracker bar; tagged "On a desktop too".
- `q-trkpop-ph-A-drawn.png` — drawn A: the chart slid up, ACG-09 just under the tabs (y 187–216), the window whole below
  it (214–643), every part from Not done to Edit details in view.
- `q-trkpop-ph-B-drawn.png` — drawn B: nothing moves; the window held between the tabs and ACG-09 (169–411), its lower
  part cut off at "Fails" and scrolling inside it.

**(d) Options.** No new words in either.
- **A — the chart slides the event up under the tabs, and the window opens whole below it.** Only when the window would
  not fit below; the slide is the chart's own smooth scroll (D991), only as far as needed (here 232 px), and the chart
  stays there after Close (as undo does — D672). On a desktop the same, under the Tracker bar. Changes no ruling; it is
  his D1290's way (the Leave War's grid scrolls the picked days into view above their window) and lesson 45 (the window
  never hides what it is about). D984's landing is unchanged: the slide comes only when the window opens.
- **B — nothing moves; the window is held between the tabs and the event, and its lower part scrolls inside it.** At the
  landing he sees 242 of its 429 px (56%): the grades, Done on and Fails; Failed on, the event's details and Edit details
  need a scroll inside the window, with only the cut-off edge to say so. Changes no ruling.
- Not drawn, and why: holding the window under the tabs at full height would sit it on top of the event, against lesson
  45.

**(e) Recommendation: A.** It is the only one where the bars, the tabs and the event all stay in view and the whole
window shows; it matches how the Leave War already moves its grid for its window (D1290), so the app behaves one way;
and nothing is hidden behind a scroll you have to guess at. B is the cheaper build but leaves half the window out of
sight on every Find.

**(f) Worked example.** Saber types ACG-09 into Find on his phone and taps the ball where the chart lands it. Today the
marking window opens upward over Undo, Redo and the bell, the Tracker bar and the Flow chart / Info / Show All tabs, and
covers the top of ACG-09. With A the chart glides ACG-09 up to just under the tabs and the window opens below it, Not
done at the top and Edit details at the foot; he marks DCO and taps Close, and the chart stays where it glided to.

**(g) For the build.** `src/tracker/components/Pop.jsx`, its placing effect (lines 85–99): where the window does not fit
below (`y + h > innerHeight - 8`), ask the chart to scroll by the difference first — the chart's scroller in
`src/tracker/app/core.js` (`scrollToEvent` is today's one landing, D984) — then place the window below the event. It
must also: start below the tabs' foot (phone) or the Tracker bar's foot (desktop) as its top limit, not 8; where the
chart cannot scroll that far (an event near the chart's end) fall back to B's rule rather than over the bars; follow the
slide (the window is fixed to the tap's place); count as the app moving the chart, which stops a glide (D989); work the
same for a window opened by keyboard (D980). Seen while drawing: opened below an event, the window's top already sits
2–3 px over the ball's foot (it opens 12 px below the tap's centre, the ball being about 30 tall) — open it under the
ball's edge. The drawing touched only the chart's scroll position.

---

## 2. [TRK-ROUND-SEEN] (3) Find covers the tabs, and its ✕ only empties the box

**(a) The question.** On your phone, what should the ✕ in the Tracker's Find strip do: only empty the box, as today, or
also put Find away so the tabs come back?

**(b) Still open? Yes.** Measured at the iPhone size: Find opens as a strip at y 123–163, over the Flow chart / Info /
Show All tabs (119–165), the keyboard up. What puts it away today:
- **✕**: empties the box and puts the keyboard straight back up; the strip stays over the tabs; the turquoise "found"
  ring goes.
- **Escape** (a keyboard only), **🔍 again**, or **a tap outside**: put it away.
- **Enter**: lands the match (1 match for ACG-09); the strip and the keyboard stay.
- **Picking a match from the list**: lands it and puts the strip away — by accident today: the list's row is removed
  before the "tap outside" check runs, which then sees a tap outside.
The strip is how Find shows on any screen up to 1050 wide (a phone, an iPad, a narrow window); wider, as on his PC, Find
is a box in the Tracker bar itself, covers nothing, and its ✕ is fine as it is.

**(c) Pictures.**
- `q-trkfind-ph-open.png` — real: the open strip over the tabs; tagged "Find sits over the Flow chart, Info and Show All
  tabs".
- `q-trkfind-ph-after-x.png` — real: after Enter and then ✕, the box empty, the strip still over the tabs; tagged "✕ only
  empties the box. Find stays over the tabs, and the keyboard comes back up".
- `q-trkfind-ph-A-drawn.png` — drawn A: one ✕ and Find is away, the tabs back (the state Escape leaves today).
- `q-trkfind-ph-C-drawn.png` — drawn C: the strip opened under the tabs (169–209), over the top of the chart.

**(d) Options.**
- **A — where Find is the strip, ✕ empties the box and puts Find away** (the keyboard down, the tabs back), as Escape
  does. Its hover words there: "Clear the search and close Find" (today "Clear the search"). Where Find is a box in the
  bar, as on his PC, nothing changes. A pick
  from the list puts it away on purpose, as today by accident. Keeps D1127's reading 2 (the ✕ stays); changes no ruling.
- **B — ✕ twice**: the first tap empties the box, as today; a tap on the empty box's ✕ puts Find away. Its words: "Clear
  the search", then "Close Find". Not drawn: the second state looks like A's. Changes no ruling.
- **C — Find opens under the tabs**, over the top 40 px of the chart; ✕ as today. The tabs stay reachable, but the strip
  still needs 🔍 or a tap outside to go, and the keyboard still comes back after ✕. Changes no ruling.

**(e) Recommendation: A.** On a phone a ✕ on a strip that slid out means "done with this", and A makes it do that in one
tap; it matches Escape and a pick, so every way of finishing ends the same; the tabs are covered only while you are
finding, when you do not need them. B costs a second tap for the same end; C moves the cover from the tabs to the chart
and leaves the ✕ doing half a job.

**(f) Worked example.** Saber taps 🔍, types ACG-09 and presses Enter: the chart lands ACG-09. He taps ✕ to finish.
Today the box empties, the keyboard jumps back up and the strip still hides Flow chart, Info and Show All; he has to tap
🔍 again or tap the chart. With A that one ✕ empties the box, the keyboard goes down and the tabs are back.

**(g) For the build.** `src/tracker/components/Header.jsx` line 151–152, `#hSearchClear`'s click: where Find is the strip
(`tracker.css`'s `@media(max-width:1050px)` block, line 677, which makes `.findpanel` the fixed strip), do what Escape does on line 149
(`core.clearSearch()`, blur the box, `setOpen(false)`) instead of re-focusing; the title as above there only. Make
the pick's closing deliberate in the row's pick handler, so a later change to the list does not quietly bring the strip
back. Pin both in `src/tracker/tracker.test.tsx` and the browser suite `scripts/tracker/smoke.mjs`. The drawing pressed
Enter, then Escape, for A; for C it moved the strip's top to the tabs' foot + 4.

---

## 3. [UI-CONSISTENCY-LOOK] round 5 (a)–(d): four typed marks round 4 did not reach

**(a) The question.** Should these four typed marks become the app's drawn line marks, as drawn: the 👁 of a look at a
published version, the Inputs calendar's ⤢ / ⤡, the Tracker's ↺ Restore, and the ↺ on a hidden warning?

**(b) Still open? Yes, all four typed today** (round 4, live since pull request 643, drew the board's, the Leave War's and
the Tracker's tools but not these). Measured:
- **(a) 👁** — a typed character, which his iPhone draws as a coloured emoji (the test browser draws it plain). Two
  places: the day's selector, "👁 Original" (10.5 px, 55 px wide), on Edit Schedule's week and the Scheduler Board; and
  the look's banner line "👁 Viewing the issued Original — read-only…" (11.5 px) under it on both, and "👁 Viewing plan …"
  for a saved plan's look (the same banner).
- **(b) ⤢ / ⤡** — the Inputs calendar's last button on its legend row, 34 × 28: ⤢ "Show every input" at rest, ⤡ "Show
  the month compact" when pressed (cyan). Both typed at 16 px. The Tracker's Fit, which wore the same ⤢, became four
  corners in round 4 (D1705).
- **(c) ↺ Restore** — in the Tracker's Syllabus order (and Course order) window, the button on each deleted chart or
  course, 12 px. The same window's ⠿ ▲ ▼ are typed too (see the end).
- **(d) ✕ / ↺** — on each warning line, on the Scheduler Board (17 lines on Monday) and on Edit Schedule's day list:
  ✕ hides it (12 px), and the hidden line's ✕ becomes ↺ "Flag this again" (14 px). History's clock stands on the top bar
  of both pages (desktop at the bar's right; phone at x 285–315).

**(c) Pictures** (each real picture ringed with its typed mark named; each drawn one tagged "Drawn: …").
- (a) `q-r5a-pc-week.png` / `-drawn`, `q-r5a-ph-week.png` / `-drawn` — Monday's Original on Edit Schedule: the
  selector and the banner. `q-r5a-pc-board-sel.png` / `-drawn` and `q-r5a-pc-board-bar.png` / `-drawn` — the board's
  selector and banner at the PC size (two pictures, the board being wide); `q-r5a-ph-board.png` / `-drawn` — the board
  on the phone. Drawn: the app's own line eye from the wave templates window (its Shown button), 11 px in the selector,
  12 px in the banner.
- (b) `q-r5b-pc-compact.png`, `q-r5b-pc-every.png` and the phone pair — real, ⤢ at rest and ⤡ pressed;
  `q-r5b-pc-compact-drawn.png`, `q-r5b-pc-every-drawn.png` and the phone pair — drawn: arrows out for "Show every
  input", arrows in for "Show the month compact".
- (c) `q-r5c-pc-restore.png` / `-drawn`, `q-r5c-ph-restore.png` / `-drawn` — the Syllabus order window with "Tx 2026"
  deleted; drawn: the Reset arrow before "Restore".
- (d) `q-r5d-pc-board.png` / `-drawn`, `q-r5d-ph-board.png` / `-drawn` — the board's warning list, one line hidden (↺)
  and the rest ✕; `q-r5d-pc-week.png` / `-drawn`, `q-r5d-ph-week.png` / `-drawn` — the same on Edit Schedule's day
  list; drawn: ↺ becomes the Reset arrow, ✕ stays. `q-r5d-pc-week-history.png`, `q-r5d-ph-board-history.png`,
  `q-r5d-ph-week-history.png` — real: History's clock on the same page, for the caution under B (on the PC board picture
  History is ringed too).

**(d) Options.** No new words: every button keeps its words and its hover words.
- **A — all four as drawn** (recommended). (a) the line eye the app already draws in the wave templates window; (b) two
  new marks in the app's line style, four arrows out and four arrows in — **a departure named** (lesson 18): today's ⤡
  points out on the other slant, which says nothing of "smaller"; the drawn one points in; (c) and (d) the Reset arrow,
  the arrow turning back that already means "put back" on the Leave War's Reset order and the Tracker's Reset layout
  (D1703, D1705). The ✕ stays typed: it is the app's close-and-remove mark in over a hundred places on its screens; only the
  Tracker draws its own. Changes no ruling; carries D1124 / lesson 70 (one thing, one mark) to these four.
- **B — the first three as drawn, and the warning's ↺ left typed.** The caution (lesson 92): History's clock is that same
  arrow turning back with clock hands added, and it stands on the top bar of both pages with the warning lists. Changes
  no ruling.

**(e) Recommendation: A.** One mark, one meaning everywhere: the arrow turning back already means "put back" in two
places, and Flag this again is a put-back; History's clock reads apart by its hands and its place on the top bar, away
from the warning lists. The eye is a mark the
app draws already, so it looks the same on his iPhone as on a PC, which a typed 👁 does not. B is right only if he finds
the warning's arrow and History's clock hard to tell apart in the pictures.

**(f) Worked example.** On Edit Schedule Saber hides the clash warning on his own line (OPS SHARING + NAV SYS BRIEF & VL
BFM): today its line stays, struck through, with a typed ↺ at its end; with A the ↺ is the same drawn arrow as the Leave
War's Reset order, and a tap still flags it again. On the same page he looks at Monday's Original: today the selector
reads "👁 Original" with a coloured emoji on his iPhone; with A a grey line eye.

**(g) For the build.**
- (a) Move the eye from `src/ui/WaveTplModal.tsx` (`EyeOn`, line 43) to `src/ui/glyphs.ts` as a shared mark; use it in
  `src/ui/html.ts` line 295 (the selector's label) and 1777 / 1779 (the week's banner), and `src/ui/SchedBoard.tsx` 440 /
  442 (the board's banner). The drawing had to shrink the eye to 11 px in the selector: at 12 px "Original" wrapped on the
  phone, the label being clamped (`src/ui/scheduler/03-week.css` around line 361). Comments naming 👁 (`validate.ts`
  1724, `board.ts` 437, `html.ts` 160, 284, 1815) follow.
- (b) `src/ui/InputsCal.tsx` line 1339: two new marks in `glyphs.ts`, their paths in the script's `ICON.expand` /
  `ICON.compact` (Lucide's maximize-2 / minimize-2); the words and the pressed look stay.
- (c) `src/tracker/components/Modals.jsx` line 551: the Tracker's own `ResetGlyph` (`Glyphs.jsx` line 62) before
  "Restore", in both the course and the syllabus window.
- (d) `src/ui/board.ts` line 538 (`.wln-mute`) and `src/ui/html.ts` line 1179 (`.witem-mute`): the hidden state's ↺
  becomes `RESET_INNER` at 13 px; ✕ unchanged.

---

## 4. [UI-CONSISTENCY-LOOK] round 5 (e): the phone day bar's Templates and OIL Earn

**(a) The question.** On your phone, should the Scheduler Board's day bar show the same marks before Templates and OIL
Earn as the desktop does?

**(b) Still open? Yes.** Round 4 gave the desktop's two their marks (a page of blocks, a ticket — D1703, D1704; 14 px
beside 12 px words, 104 and 96 px wide). The phone's bar, "THIS DAY · Templates · OIL Earn", is a separate bar that the
drawing never drew, so it kept its words alone. Measured on Monday at the iPhone size: the bar 358 × 40; THIS DAY ends
at x 84; Templates 87 × 23 at x 192; OIL Earn 76 × 23 ending at x 360; **108 px** free between them.

**(c) Pictures.**
- `q-r5e-pc-desktop.png` — real, PC: the desktop's two with their marks; tagged "The desktop's two wear their marks".
- `q-r5e-ph-today.png` — real, iPhone: the phone's bar, words alone; tagged "Words alone here, while the desktop's two
  wear marks".
- `q-r5e-ph-drawn.png` — drawn A: the same marks before the words, scaled to the phone's 10.5 px words (12 px); tagged
  "Drawn: the same marks, still one row".
- `q-r5e-ph-drawn-wide.png` — drawn A with every letter a seventh wider, as an iPhone's are; still one row.

**(d) Options.**
- **A — the desktop's marks on the phone too** (recommended). Measured: Templates 104 px, OIL Earn 93 px, **74 px** still
  free, one row; with an iPhone's wider letters 113 and 101 px, **49 px** free, one row (lesson 53's test passes). The
  buttons grow 1 px taller (23 → 24) in the drawing; the build keeps them at 23 so nothing moves. Extends D1703 / D1704 to
  the phone's bar, which their drawing left out ("as drawn" drew no marks there). No new words.
- **B — leave the phone's words alone**, as built. Keeps D1703 as drawn; leaves one bar showing the same two buttons two
  ways (lesson 17).

**(e) Recommendation: A.** The same button looks the same on both sizes (D1124, lesson 17), and it fits on one row even
with his iPhone's wider letters, so it costs the phone nothing.

**(f) Worked example.** Saber opens Monday on the Scheduler Board on his phone: today the day bar reads THIS DAY,
Templates, OIL Earn in words alone, while on his PC the same two buttons wear a page of blocks and a ticket. With A his
phone shows the same two marks, the row still one line with room to spare.

**(g) For the build.** `src/ui/board.ts` line 142 (`tplBtn`) and `src/ui/oilmode.ts` line 544 (`oilBtn` at rest): the
marks as `SchedBoard.tsx` lines 623–630 draw them (`TemplatesIcon`, `TicketIcon` in a `.bi` span), at 12 px, with a 5 px
gap; hold the buttons at 23 px tall. "✓ OIL done" and "Nothing today earns" (OIL mode on) are left as they are — the
latter is [OIL-EARN-DAY-SWITCH-WORDS]. For the pictures only, the drawing opened the bar's own clipping so its tag could
stand above it.

---

## Could not picture, and why

- **His iPhone itself**: a coloured 👁, its keyboard, its letters. The test browser draws 👁 in one colour and shows no
  keyboard; the wider letters were stood in for by making every letter a seventh wider (question 4).
- **"👁 Viewing plan …"** (a saved plan's look): the same banner and the same eye as the published version's look
  pictured in question 3; it needs a saved plan made first, and the drawn change is the same swap.
- **Questions 1 and 2 drawn at the PC size**: only today's desktop pop-up is pictured; Find covers nothing on a desktop.
- **A phone held sideways** for questions 1 and 2 (Edit chart layout folds there, D373): not walked.

## Seen in passing, not drawn

- The Tracker's Syllabus / Course order window draws ⠿ ▲ ▼ as typed characters, while the Tracker draws its other marks
  (a round 6 candidate).
- On the board at the PC size the look's banner breaks "Original" onto a line of its own, the next line starting
  "— read-only" (today, with or without the drawn eye: `q-r5a-pc-board-bar.png`).
- A pick from Find's list closes the strip only by accident (question 2 (g)).
