# The design look of 13 Oct 26 — the record behind the page (`[DESIGN-LOOK-13OCT]`, D805, D806, D807)

**For the next agent.** What he reads is the page — `docs/mock/design-look-13oct.html`, published as an Artifact (the link
is in this job's `HANDOFF.md` block). This sheet holds what the page must not: the file and line behind each finding, how
each picture was made, and what was and was not looked at. **Nothing under `src/` was changed by this job** — it is a
look and three sets of mock-ups; tier NONE (`docs/bug-check-order.md` §5: no behaviour, no stored data, no rule touched).
Every build that follows gets its own check.

## How it was made

- **The build:** `main` at `ef060d17e` (13 Oct 26), built once in this checkout, served on 4173 (`.claude/launch.json`
  "raptor-walk"), fresh demo data (`/?fresh=1`), signed in as the admin.
- **The sizes:** a phone 390 × 844 at three device pixels to one, touch; a desktop 1440 × 900 at two to one. A Windows
  browser's letters — his iPhone's are wider (the page says so).
- **The scripts** (`scripts/handpass/`, run with `node scripts/handpass/<name>.mjs [phone|desk]`): `dl-lib.mjs` (the
  shared helpers), `dl-cal.mjs` (the date calendar, and its keys), `dl-trk.mjs` (the Tracker's date boxes, the "Until"
  calendar), `dl-oil.mjs` (the OIL question, its bar, the bar drawn full-width on a phone), `dl-keys.mjs` (a puck and the
  Tracker's chart by keys), `dl-clash.mjs` (the Leave War's clash note as built, and the three options DRAWN IN),
  `dl-notes.mjs` (the publish and unpublish notes, as built and in the shorter words, and the note drawn full-width).
- **The pictures:** `docs/mock/2026-10-13-design-look/` (73), and `keyboard.json` there — one row per key pressed: what
  was expected, what was read off the page, the verdict.
- **The design skill** (D819): `/impeccable critique`, its two reads run apart — a fresh Opus reader given only the
  pictures, the guide and the app's record (§5 below), and the skill's detector over the seven screen
  files (clean: no finding). The skill's browser overlay was not run: it draws on a tab for a person at the PC, and he
  reads this from his phone — the pictures are the evidence. Its snapshot (the scores, the five heaviest issues): `docs/handpass/parts/design-look-critique-snapshot.md` — written by the skill's own helper, then moved here: the document check refuses a new document outside the docs tree, and the skill's own folder is outside it.

## 1. The clash note (D805) — what the mock-up is, exactly

- **As built:** `src/leavewar/ui/Chrome.tsx` (the `.syncclash` block at the foot of the stage bar; the words `WAY_OUT`
  at the head of the file), `src/leavewar/ui/chrome.css` `.syncclash` (`flex-basis:100%` inside `.filters`). On a phone
  `.filters` is `flex-wrap: nowrap` (D678's two lines, `chrome.css` the phone block — "the row does not wrap, and ONE
  thing gives way: the stage's name"), so `flex-basis:100%` cannot take a line of its own: the note is squeezed to what
  the four chips leave. Measured: the note 100 × 294, the row 305 tall, the grid's card from 396.
- **The set-up** (the developer's bridge, not what is pictured): Saturday 18 Jul 26 published with the seed's duty
  officer and two men on programme rows; `lwSetCell` gives two of them a bid that day → two clashes of the duty kind.
- **The options** are injected by `dl-clash.mjs stage(mode)`: the built note is hidden, and A (`A-closed`, `A-open`), B
  (`B-closed`, `B-open`) or C drawn. A and C put ONE element after `.filters` (so the two lines are untouched); B puts a
  `.fchip` before Legend and reuses the under-manned list's own `.umlist` / `.umrow`. The only new style is the block
  marked NEW in that script — the note's own amber, as lines.
- **Measured** (the script prints it): the grid's card from 156 (A closed), 253 (A open, two clashes), 125 (B), 155 (C);
  under B the stage's name is cut (`stageCut: true`, the chip 124 → 106).
- **What the transform touched that the backlog item did not name:** the lines become buttons (a jump to the day — the
  under-manned list's `focusDay` path — or to the Inputs page for `wayOut: 'inputs'`); `WAY_OUT` needs a short form
  beside its sentence; the note's place leaves `.filters`; a long callsign with a long instruction wraps to two lines
  (the busy picture); the list needs a cap (five, then it scrolls inside); the line is a real button for a keyboard
  (`aria-expanded`).

## 1a. His choice, the same evening — A, neater (D823), and the key words kept (D825)

- **D823** ("this but neater like alignment", of the busy picture of option A). `dl-clash.mjs` modes `N-closed` / `N-open`: ONE grid for the whole list (`grid-template-columns: max-content minmax(0,1fr) max-content 7px`, each row a subgrid) — the name | the day | what to do, right-aligned | its arrow; what clashes on a second line across the whole row (it wrapped to a third line when held to the day's column: the longest callsign widens the first column). The script prints, per state, that every row's name, day, instruction and arrow share one edge, the rows' heights (48, 49), and that the line's edges are the chips' (10, 380). The card from 156 (closed), 205 (one clash open), 254 (two), 450 (six). Subgrid is in every browser the app is used in; a build that cannot use it sets the first column from the longest callsign.
- **D825** ("the key words are gone. Too summarised"). The clash lines say today's sentence less the name and the date ("Weekend/PH work earns FO, but the day holds LL"; "Input OML against bid LL"), and the four instructions keep their words. The notes list on the page was redone to the same rule — only filler cut, each row saying what went; the first list's wordings (still in `[NOTES-SHORTER]`'s first paragraph and in the L3 table's first form) are NOT the ones to build. `dl-notes.mjs` now draws the redone N1–N3.
- **D824** — the ring round a picked date in `cal-desk-3` is `:focus-visible` only; nothing to build.

## 2. The passing notes (D806)

- **The count:** 276 `toast(` calls outside the tests; 99 whose words run to nine or more (a script over `src/`, the
  same day). The list on the page is the 33 worth changing; the rest are named as "leave".
- **Where the two he pictured are written:** `src/engine/publish.ts` (`published — APPROVED`, joined to the day's own
  warning by `ui/toast.ts toastBatch`), `src/ui/interactions.ts` (the unpublish and the withdrawn-amendment notes, and
  the "Heads up" two-tap).
- **THE BOX IS HALF THE SCREEN ON A PHONE** — `src/ui/toast.ts` (the note's inline style: `left:50%` with
  `transform:translateX(-50%)`): a box placed at `left:50%` can be at most half the screen wide (195 of 390). Measured:
  the unpublish note 195 × 102 (five lines); the same words at `left:12px; right:12px`: 366 × 70 (three); the shorter
  words there: 366 × 54 (two). The fix keeps the rise-in animation's own `translateX(-50%)` keyframes in step.
  The same cause: `src/ui/scheduler/08-windows-tools.css` `.secdef-snack` (the bar that stays, and the "Set as default"
  offer) — 195 × 94 on a phone; drawn at full width 366 × 46.
- **N33** — `src/ui/QualsPage.tsx` "Add qualifications": a note that says "Django-style backend in the full build". The
  standing rule it breaks: `raptor-port/CLAUDE.md` "UI copy reads PRODUCTION, never prototype" (25 Aug 26).
- **Not looked at:** the Leave War's own notes (`setNote`, 14 places) and the Tracker's — the whole-app words job (D808).

## 3. The look's findings — where each one is (the page's numbers)

The independent reader's file-and-line list is merged in; lines are as of `ef060d17e`. All paths under `raptor-port/src/`.

| # | The place | Cause | The change |
|---|---|---|---|
| L1 | the OIL question's answers | `ui/OilConfirm.tsx` (about 153–158) wraps them in `<span class="seg">`; `.seg` is ALSO the week strip's rule (`ui/scheduler/02-shell.css:202` — padding, a bottom border, a wash), so the answers wear it. Older than 13 Oct (the sheet is of 28 Aug); `UpchitConfirm.tsx` uses the same wrapper. The flat precedent he asked for on 28 Aug ("remove the box around the buttons. It looks unclean"): `14-input-editors.css:164–173` | a class of the sheet's own for the answers' row; no card, no strip |
| L2 | the ✕ of the question | `08-windows-tools.css:398–400` — `.airpop-head` has nothing pushing `.x` right. Same markup: `UpchitConfirm.tsx`, `MedClashConfirm.tsx`, `DocConfirm.tsx`, `SchedBoard.tsx` (two), `Modals.tsx` (two) | the title takes the spare room — every `airpop` head at once; look at each afterwards |
| L3 | the question's words | `ui/OilConfirm.tsx` about 151, 152, 160, 163 (135–136, 147 for several days); tests pin the sentences | the page's a–f. Saying "weekend" or "public holiday" instead of "a non-working day" would need the plan to carry which — not checked, so not proposed |
| L4 | "Cancel / Save" at a save | `ui/OilConfirm.tsx` about 165–166 (the defaults); callers `ui/inputedit.tsx`, `ui/InputsPage.tsx` | "Back" / "Add" (a new input), "Back" / "Save" (a change) |
| L5 | a picked answer | `14-input-editors.css:161` (`.upconf-seg.on-keep` — solid accent); the day's one list draws a picked No grey (`25-inputs-calendar.css` about 534) | the outline look for a picked answer, the same in the list |
| L6 | the bar on a phone | `08-windows-tools.css:206–208, 221` — `.secdef-snack{left:50%;transform:translateX(-50%)}`: a shrink-to-fit box at `left:50%` is at most half the screen. The "Set as default" offer shares the rule | full width less the gutters on a phone; measured on his iPhone before it is called done |
| L7 | the bar by keyboard | `ui/OilWaitSheet.tsx OilBar` — nothing moves the keyboard to it, and it hears no Escape | focus "Answer OIL" when it appears; Escape = `oilBarOk` |
| L8 | a date that cannot be picked looks alive | `26-date-calendar.css:91, 95–97` — `.is-out b` sets `opacity:.4`, then `.is-today b` (later, same weight) sets `opacity:1`, cyan, 800; `.dcal.is-marked .dcal-d.is-mk b` outranks `.is-out` for colour and weight | an `.is-out` rule that wins over both |
| L9 | the phone card has no name | `ui/DateBox.tsx Layer` already holds `label` (the spoken name); the phone card's rule `26-date-calendar.css` about 51 | one line of small capitals on the phone card |
| L10 | four keys | K1–K4 below | — |
| L11 | the run's sentence is cyan | `26-date-calendar.css:104` `.dcal-foot{color:var(--accent)}` | the plain ink |
| L12 | the faint dates | `26-date-calendar.css:95` (about 2.0 to 1 against the card, worked out from the app's colour values, not measured off a screen) | one step stronger (about 2.7 to 1) |
| L13 | the lists' keyboard place | `26-date-calendar.css:114–121` (`.dcal-col{outline:none}`; the keyboard shown by `.dcal-opt.is-at{color:accent}`); the title's ring round its 10em room (`:59, :68`) | the app's ring round the list that has the keyboard; the title's ring round its words |
| L14 | a future day in the Tracker | `tracker/components/Pop.jsx`, `tracker/components/DateBox.jsx` pass only `min`; `ui/DateCal.tsx` has `min` and no upper limit (D374's refusal is after the pick) | a `max` on the calendar; the four boxes pass the squadron's today |
| L15 | a date before anything is marked | `tracker/components/Pop.jsx` about 57–83; the dim look is `26-date-calendar.css:21` (`.is-empty`) | the dim look until a mark or a failure carries the day |
| L16 | the side panel's boxes | `26-date-calendar.css:16–18` (inline-flex, `min-height:36px`); `tracker/tracker.css` about 234–247 | one width for the column on a desktop |
| K1, K2 | Home / End; a year | `ui/DateCal.tsx onKey` handles the arrows and Page Up / Down only | add them |
| K3, K4 | into and out of the lists | `DateCal.tsx openLists` leaves the keyboard on the title; `Wheel onKey` takes the arrows only | focus the month list on open; Enter in a list closes the lists onto the dates |
| K5, K6 | the Tracker's chart and pop-up | the events are drawn into the chart with no Tab stop; the pop-up takes no focus and returns none | `[TRK-KBD-CHART]` |
| K7 | the question as it opens | `ui/sheetfocus.ts` puts the keyboard on the sheet's box; the ✕ is first in the order | the first answer takes it |
| K8, K9 | the bar | as L7 | as L7 |
| K10 | the ring | no `:focus-visible` rule for `.upconf-seg` (`14-input-editors.css:159`), `.airpop-head .x`, `.secdef-btn` (`08-windows-tools.css:210`); `.abtn` has one (`02-shell.css:59`) | the app's ring, set a little off the button so it shows round a filled one |
| K11 | a puck | `ui/html.ts` draws every puck with `tabindex="0"` (two places); nothing hears a key on one (`ui/drag.ts` is a pointer's) | `[KBD-PUCK]` |

## 4. What was not looked at

The question's "put back" and "file" forms and its many-day form; the calendar over the Leave War's posting sheets and
the upchit date; a phone on its side; his iPhone's own letters; the swipe; a screen reader; the Leave War's and the
Tracker's own notes.

## 5. The two reads, and how they were put together

- **The independent reader** (a fresh Opus reader, 13 Oct 26; given the pictures, the guide and the app's record — not
  the host's findings; told what was ruled and where the host was least sure): sixteen findings, a line-by-line of the
  OIL question's words, the usual ten usability measures scored 27 of 40 (consistency 2, error prevention 2, minimal
  design 2; the rest 3). **Every one of its findings is on the page** (its F1–F16 are the page's L1–L16, re-ordered by
  surface, with the host's own where they met: the box in a box, the ✕, the words, the bar, the cyan sentence, the
  "Failed on" date). The host reproduced each against a picture or the code before listing it; two were re-weighed by
  the host: its "today looks live where it cannot be picked" from the heaviest weight to the middle one (nothing is
  lost by the tap), and "the phone card does not say which date" taken from the host's "considered and left" into the
  list, because the Tracker's five boxes and the pop-up's two make the wrong-box case real.
- **What it could not judge from pictures, and nobody has yet:** anything that moves (the flash, the slide, the swipe,
  a frame's cost on his iPhone); whether the bar fits one line and "September 2026" its room in his iPhone's letters;
  his PC at 125%; a phone on its side; a picked "No OIL", the full-day and the several-days questions on screen.
- **The detector** (`.claude/skills/impeccable/scripts/detect.mjs --json` over `ui/DateCal.tsx`, `ui/DateBox.tsx`,
  `ui/OilConfirm.tsx`, `ui/OilWaitSheet.tsx`, `tracker/components/DateBox.jsx`, `tracker/components/Pop.jsx`,
  `leavewar/ui/Chrome.tsx`): exit 0, no finding. Run by a Sonnet helper (D588 — it runs checks; it read no code for bugs).
- **Seen in passing, outside the four, not weighed:** on a phone a passing note raised while a window is up sits at the
  top of the screen over Undo and Redo for as long as it shows (it takes no tap — a finger passes through it).

## 6. Fable's read (owner D826, 13 Oct 26 — "Ask fable go read the entire thing he hasn’t read and see what can be improved")

Fable read the page, every picture it names, the key record, the drawing scripts and each "today" wording in the source.
The host checked every point against the app before using it. **Taken, and now on the page:**

- **Words.** N11's first redraft read as its opposite ("anything added later too") → "Nothing on this day earns OIL,
  including anything added later". N2 "until then" → "until it is republished" (the app's own word). N3 keeps "back".
  N24 stays TWO notes — they are two refusals, and "ALL AVAIL" is the first one's reason (`ui/inputedit.tsx`). N28 is
  left whole ("can carry it" says which mark was refused). The OIL question's small print does NOT gain "to FO": the
  line serves the full-day question too (`ui/OilConfirm.tsx`, the `amt === 1` branch). "Send back or delete" → "Send the
  leave back or delete it".
- **The clash list (`dl-clash.mjs`, modes N-…).** The name's column is a fixed width — the roster's longest callsign,
  measured in the list's own letters — so the day starts in the same place on every visit; the day never shrinks or
  wraps (`max-content`, `nowrap`); the instruction is the column that gives way (it wraps inside its own column,
  right-aligned); the arrow rides inside the instruction; one bold a row (the name). `N5` draws the busy case in
  letters a seventh wider as a stand-in for his iPhone's: every day on one line, one instruction and one sentence
  gain a line, nothing cut. Rows 46 tall; the card from 156 / 203 / 250 / 438 (closed / one / two / six).
- **Behaviour written on the page for the build:** a tap opens that day FOR that person (the sheet that holds Decide),
  or the leave's own window on the Inputs page — today the under-manned list only jumps to the day
  (`leavewar/state/store.ts focusDay`), so opening the sheet is new work; with one clash the list starts open; the
  open-or-closed state is kept for the visit; no inner scroll — a long list pushes the grid, Hide is the way back; the
  keyboard set (Enter / Space on the line, each row a Tab stop, Enter on a row); the desktop strip takes the same words,
  its layout unchanged (D679 is about layout) — said to him under "build it".
- **L17 (new)** — weekend dates inside a picked run stay dim: `26-date-calendar.css` `.dcal-d.is-we b` is never
  overridden for `.is-in`. **K12 (new)** — Delete / Backspace on a filled box does nothing (the key record had it; the
  page had dropped it); the Tracker's own Delete key must not fire from the box. **L2** — the ✕ goes to the END of the
  Tab order when it moves to the corner. **The step-two key set** gains: where the keyboard lands, the roll into the
  next month, a faint date reachable but not pickable, Escape with the lists open, Enter never sending a form, Delete.
- **L6's place, put to him (the page's choice 5):** D587 gives a warning that stays a band under the top bar; the OIL
  bar is the same kind of thing and floats at the foot. Recommended to him: the band, drawn first.
- **The page:** the three first-drawn ways (A, B, C), their table and "what the drawing found" left the page (they are
  §1 above and the pictures `clash-phone-A*`, `-B*`, `-C*`); the score and the method paragraph went; the asks name the
  bar's place apart.

**Not taken, and why:** hiding "Failed on" until Fails is 1 — its date is set BEFORE "+" is pressed (`tracker/app/core.js`,
the pop-up's "Failed on" box: "only where the NEXT + lands"), so the box is needed at 0; the dim look stands (L15). N9
shortened ("take him off") — left whole, every part is the instruction. Dropping "Applying" from N8 — Fable called it
borderline; kept cut. **For the words job (D808), seen by Fable outside the four:** the question's grey explanation
belongs under a "How this works" fold; the Calendar window's two hint lines; the Tracker panel's grey "No currency date
set" pills read as buttons; "Close" sits among the marks in the marking pop-up.
