# Section 1 — Core, the guard rail: the owed drawings (drawer s1, chat 191, 26 Nov 26)

Brief: `2026-11-26-msq-sections-draw-brief.md`; ledger: `2026-11-26-msq-sections-drawings-ledger.md` §1. Folder
`C:/Users/User/projects/Raptor-msq`, branch `claude/msq-b1-screens-135`, nothing committed, nothing of the app changed.

- **The app used:** the one already served at `http://localhost:4700/` — checked: its page loads `assets/index-7OsqMtMA.js`,
  the same file as this folder's `raptor-port/dist/assets/`. No server of my own started; ports 4721–4724 unused.
- **The world:** n176's (142, 149, 150; Hunter 142's admin with Plan of 149 and View of 150 — D2630), read only. The two
  Undo pictures make 150 themselves from the two seeded squadrons (his E7 case: Saber makes 150, picks it, opens a
  window, presses Undo), so they also show three squadrons. The bell pictures add one input (Saber files OL on Tue 8 Dec
  for Hunter — n166's p4b way), saved as `.tmp/n191-s1/state-bell2.json`.
- **Pictures:** `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/s1-*.png`, each with its `-crop` twin; desktop
  1536×864, phone 402×874 (WebKit, touch), both at 2x. **Marks:** what is new in the app wears the teal dashed ring
  (2px `#0D9488`, 4px clear). No violet, no pink.
- **Scripts:** `raptor-port/scripts/handpass/n191/draw-s1-lib.mjs` (helpers over n176's, read only), `draw-s1-notes.mjs`,
  `draw-s1-add.mjs`, `draw-s1-input.mjs`, `draw-s1-sans.mjs`, `draw-s1-trk.mjs`, `draw-s1-fade.mjs`, `draw-s1-lull.mjs`
  (pressed only), `draw-s1-probe.mjs` (reads only). Words: `words-s1.mjs`. **FACT logs kept:**
  `raptor-port/.tmp/n191-s1/log-*.txt` (notes, add, input, sans, trk, fade, lull).
- Every picture listed below was opened and checked against its ruling.

## The rows — what was owed, and what is drawn

| Ledger row | State | Desktop / phone | What is new (ringed) | Ruling it follows | Departures, and why | Question |
|---|---|---|---|---|---|---|
| 1.3 P | A bell line refused on a phone: the list stays open, the line stays unread, the note at the foot | — / `s1-bellline-p` | the note "Blocked: close the open window, then press this line again." | D2590 (words, foot on a phone), D2627 A11 | Hunter on 149 with a 149 man's leave window open (opened from the Leave War's Balances — his own "My leave" is 142's); the line is his own 142 input (8 Dec), so its press would take him to 142. **The bell is today's look** (no squadron numbers, no colours): the numbers and colours are section 3's (D2624, D2638) | — |
| 1.4 P | A tap on the lit bell refused on a phone: the bell stays lit | — / `s1-belltap-p` | the note "Blocked: close the open window, then press the bell again." | D2627 A8, D2590 | **Stand-in, named:** the bell is lit by its own lit look (as n175's d3c) — nothing waits behind it; the tap itself is the guard's to refuse, so it is not made. Saber's own leave window open on 142. Bell in today's look (section 3) | — |
| 1.14 | "+ Add a person" in the page's TOP row, its form opened under that row, above "Waiting for access"; the foot block gone | `s1-add-d` / `s1-add-p` (recommended); `s1-add-home-d` / `s1-add-home-p` (the other answer) | the button and the opened form (the search and Filter are today's, moved up into the row) | D2652 N13 i, D2647, D2655 D1, D2644 (the pair measured from the app's Save · Cancel: 6px apart, one line, same height and type) | Hunter on 149 (an admin of two squadrons, so the Home squadron box shows today). **The rest of the page is today's** (no jumps, today's order) — the core's step 1b builds only the row and the form (plan §18.3); the Users section adds the jumps. **On a phone the app's own opened row stacks its Save above its Cancel** (measured: Save at y 994, Cancel at y 1028); the pair is drawn side by side as round 6's N11, which he took (D2652 N11) — said here so it is not missed | **NQ2** (below) |
| 1.18 | On a phone, a bell line that changes squadron: the two fades wait while the number is covered, then play | — / `s1-fade-p-film.mp4`, `s1-fade-p-poster.png`, stills `s1-fade-p-01…83.png` | the number's two fades, ringed from the moment they play | D2642, D2652 N8 a | **Read from the screen, not as the ledger expected:** the bell's list does **not** cover the number on a phone (it opens under the top bar). What covers it is the **Input window the line opens** — its title strip lies over the top bar (`coveredAtChange: div.win-bar`). So the fade waited until that window was closed (2.4 s in the film, when its ✕ was tapped) and played 10 ms after. Less motion not filmed (the same wait; round 6's `m6-p-fade-lm-film.mp4` shows its look) | **Q4** (below) |
| 1.20 (a) | "+ Input" on another squadron: the Person box closed and empty, its list that squadron's men only | `s1-input-empty-d` / `s1-input-empty-p` | the empty Person box reading "Pick…" | D2628 C2, D2655 D12, D2646 | Hunter on 149; his name and every man not of 149 taken out of the list, an empty first choice added. **"Pick…" is the app's own word for an empty choice** (Admin → Users' Add a person: its seat and CAT boxes) — a draft for this box. The opened list is the browser's / iPhone's own (D2646), not pictured; his iPhone picture of 26 Nov stands | — |
| 1.20 (b) | Add pressed with nobody picked | `s1-input-nobody-d` / `s1-input-nobody-p` | the note "Pick at least one person" | plan §18.6 ("today's own refusal for an empty Person if it has one") | **Read from the app: it has one** — "Pick at least one person", a warning note (`ui/inputedit.tsx commitInput`), today reached only with "Several people" and nobody picked. Drawn as the app raises it, at its own place (the foot on a desktop; the top on a phone while a window is open — D731). No new words | — |
| 1.22 | A drag across days on a squadron with no SANS aircrew: says the reason, opens nothing | `s1-sans-drag-d` / `s1-sans-drag-p` | the passing note "150 has no SANS aircrew." | D2628 C3, D2655 D11, plan §18.7 | **How it says it was never ruled:** drawn on the app's own precedent — the calendar already tells a refused drag by a warning note (`ui/sansadd.ts`: a SANS man whose SANS starts after his dragged run "is told why, never met with nothing"). Same words as the greyed button's reason (reviewed in round 5). The drag itself not made (today it would open the window). A drag exists on both sizes (mouse; a finger held then dragged) | **Q5** (below) |
| 1.23 P | Unsaved chart edits asked about at the member-view switch, on a phone | — / `s1-trk-p` | the question card | D2627 A20, D2318, D2637 (the menu closes first — the plan's reading) | The card is the app's own, raised by a real pick of 149 from ☰ with an unsaved chart edit; only its words changed to the member-view wording drawn 24 Nov (p5). Its buttons as the app draws them: Stay · Discard them · Save them. Read: the ☰ menu was already closed when the card came up | — |
| 1.27 | The Calendar refuses a pick while one of its forms is half done (E1) — five notes, and a changed settings window | `s1-cal-new-d` / `-p` · `s1-cal-changed-d` / `-p` · `s1-cal-every-d` / `-p` · `s1-cal-sheet-d` / `-p` · `s1-cal-noleave-d` / `-p` · `s1-cal-settings-d` / `-p`; and `s1-cal-settings-alt-p` | each note (desktop under the squadron picker; phone at the foot, D2627 A15) | D2654 E1, D2590, D2627 A15 | All pressed for real on the app: a holiday name typed; a listed holiday ("PH", Thu 1 Jan) opened and changed; "Every Monday" with "Day" pressed; a sheet of two holidays read in ("Add 2 holidays" waiting); a holiday on 14 Jan 2028, which no leave period covers — **pressed, so no longer only read from the code:** Save shows "No leave period covers 14 Jan 28 yet." and "It is kept here, and saved by itself as soon as a leave period covers it." with "Create the 2028 leave period"; Inputs calendar settings changed (late cut-off 14 → 15 days) with the Calendar beside it. On a phone the settings box lies under the Calendar, so the script changed it there by hand — the same state as changing it first, then opening the Calendar. **On a desktop the Calendar's small forms ("Add a holiday", "Change a holiday", "Every Monday") open at the top left,
so the note under the picker stands just above their ✕ — 4px clear, never over it (D2590); the ring touches their top
edge.** The builder's ✕ check (plan §4.6) should be shown these pictures. On a phone four of the notes take two lines | **Q2** (below) |
| 1.28 | The Info panel's two lull pop-ups: pressed before the build; drawn only if one refuses | — (none drawn) | — | D2654 E4 | **Pressed (desktop 1536 and 1000 wide, phone):** both hold a choice not yet saved ("Set lull period": the first day picked, "now pick the last day"; "Copy to…": students ticked, not copied). **But each lays its shade over the whole screen** — the squadron picker, the name badge, the bell, ☰ and the Flow chart tab are all covered while it is up (FACT `covered by div.lullback`). So no pick, switch or bell press can be made while either waits, and neither can be left behind the Flow chart tab. **Nothing to refuse, so no drawing**, and the draft "…on the Tracker’s Info tab" is not needed for them. Not tried: the keyboard reaching the picker behind the shade | — |
| 1.29 | Undo of "+ New squadron" refused while a window is open | `s1-undo-d` / `s1-undo-p` | the note, under Undo on a desktop (left edge on Undo's — plan §4.6), at the foot on a phone | D2654 E7 | Desktop: Saber makes 150, picks it, "+ Input" with Remarks typed; Undo reads "Undo — adding a squadron". **The whole desktop picture shows the Person box reading "Saber" on 150** — today's fault that 1.20 fixes; the crop leaves it out. **Phone: an Input window covers Undo on a phone** (its title strip lies over the top bar), so no Undo can be pressed from it; drawn instead with the Calendar's "Add a holiday" half done — Undo is free there. Its lead follows plan §4.6's rule for the Undo ending (only a lead that adds no Undo step): "Blocked: cancel the new holiday, then press Undo again." — a new joined draft | — |
| 1.30 | Words typed in Quals' "Add qualification" box refuse a pick | `s1-qual-d` / `s1-qual-p` (recommended); `s1-qual-other-d` (the other answer) | the note "Blocked: add or clear the new qualification, then pick 149." | plan §3.2 (i), §18.1 (a reading never put to him) | The box shows only once both "Edit" and "Edit quals" are pressed (read: `canEditQuals` needs both). The other answer's picture: the pick goes through, 149's Quals opens with "Edit", no box (nothing new to ring) | **Q3** (below) |

No section-1 row is "drawn, never shown" (the ledger lists none). Already approved and not redrawn (for the page to show
from earlier rounds): 1.1, 1.2, 1.5–1.11, 1.13, 1.15–1.17, 1.21, 1.24, 1.31's look — paths in the ledger.

## The questions, each in one line (D2439)

- **NQ2 (1.14) — the Home squadron box in "Add a person".** When: now and then — Hunter, with 149 picked, adds a new man
  on 149's Admin → Users; today the box offers 149 and 142 because he is an admin of both. **Recommended: the box goes —
  the form adds to the squadron in view; to add a 142 man he picks 142 first** (`s1-add-d`, `s1-add-p`). The other:
  keep the box (`s1-add-home-d`, `s1-add-home-p`).
- **Q2 (1.27, words gap 1a) — on a phone the changed settings window lies under the Calendar.** When: a few times a month —
  Saber changes the late cut-off in Inputs calendar settings, opens the Calendar from it on his phone, then picks 149.
  The plain note names a window he cannot see. **Recommended, on a phone only: name the Calendar first — "Blocked: close
  the Calendar, save or cancel Inputs calendar settings, then pick 149."** (as the words review left it) (`s1-cal-settings-alt-p`). The other:
  the same words as a desktop (`s1-cal-settings-p`).
- **Q3 (1.30) — words left in Quals' "Add qualification" box at a pick.** When: rare — Saber, in Quals' edit mode on 142,
  types "LOW LEVEL" and, before pressing Add, picks 149. **Recommended: the pick is refused, "Blocked: add or clear the
  new qualification, then pick 149."**, the words kept (`s1-qual-d`, `s1-qual-p`). The other: the pick goes through and
  the typed words are dropped; 149's Quals opens with "Edit" (`s1-qual-other-d`).
- **Q4 (1.18) — the fade after a bell line on a phone waits for the Input window it opens.** When: a few times a week —
  Hunter, 149 picked, taps the bell and then a line about his own 142 input; 142 comes into view and that input opens,
  its window over the top bar. The number's two fades then play only when he closes the window, which may be much later.
  **Recommended: keep it as ruled (D2652 N8 a — wait while covered)**; the window's own top line already reads the
  input's owner and day. The other: no fade at all for a change he cannot see.
- **Q5 (1.22) — how a refused drag on the SANS calendar says why.** When: rare — Saber, 150 picked (no SANS aircrew),
  drags across three days on 150's SANS calendar. **Recommended: the app's passing warning note, "150 has no SANS
  aircrew.", at its usual place, and nothing opens** — as the calendar already tells a refused drag today
  (`s1-sans-drag-d`, `s1-sans-drag-p`). The other: nothing said.

## Every new word drafted (all in `words-s1.mjs`)

Each marked there **"draft — owed a fresh Fable review (D2441)"**, except where named as ruled, reviewed or the app's own.

| Words | Where | Status |
|---|---|---|
| "Blocked: save or cancel the new holiday, then pick 149." | 1.27 | draft (round 6's page) — owed Fable |
| "Blocked: save or cancel the changed holiday, then pick 149." | 1.27 | draft (round 6's page) — owed Fable |
| "Blocked: save or cancel “Every Monday”, then pick 149." | 1.27 | draft (round 6's page) — owed Fable; the quote marks inside a grey note are a first |
| "Blocked: add or cancel the sheet’s holidays, then pick 149." | 1.27 | draft (round 6's page) — owed Fable |
| "Blocked: cancel the new holiday, or create its leave period, then pick 149." | 1.27 | reviewed — the words review changed "add" to "create" (below) |
| "Blocked: save or cancel Inputs calendar settings, then pick 149." | 1.27 | reviewed (r5b words review 1) — not reworded |
| "Blocked: close the Calendar, save or cancel Inputs calendar settings, then pick 149." | 1.27, Q2 | reviewed — the words review cut the first "then" (below) |
| "Blocked: close the open window, then press Undo again." | 1.29 desktop | draft (D2654 E7); its ending reviewed (r5b review 2) — owed Fable as a whole |
| "Blocked: cancel the new holiday, then press Undo again." | 1.29 phone | **new draft** (§4.6's joining rule) — owed Fable |
| "Blocked: add or clear the new qualification, then pick 149." | 1.30 | draft (the third read's fold) — owed Fable |
| "Pick…" (the empty Person box) | 1.20 (a) | **new draft**, the app's own word — owed Fable |
| "Pick at least one person" | 1.20 (b) | the app's own words today — nothing new |
| "150 has no SANS aircrew." | 1.22 | reviewed (round 5) — the same words in a passing note |
| "You have unsaved chart edits on “2026”. Save them before switching to the member view?" · Stay · Discard them · Save them | 1.23 | ruled (D2627 A20, drawn 24 Nov) |
| "Blocked: close the open window, then press this line again." / "…then press the bell again." | 1.3, 1.4 | ruled (D2590, D2627 A8) |
| "+ Add a person" · "Add person" · "Cancel" | 1.14 | ruled (D2628 C11, D2652 N11) |

Not drawn, so still owed a word review only if built: "close the open window on the Tracker’s Info tab" (1.28 needs no
note — above); "save or cancel SANS calendar settings" (the SANS twin of 1.27); "…on Squadrons" (1.31, words only).

## What could not be drawn, and why

- **1.28** — nothing to draw: the pop-ups cover the whole screen, so no press can be refused (above).
- **1.20's opened Person list and 3.13-like lists** — the browser's / iPhone's own list (D2646); his own iPhone picture stands.
- **1.18 with less motion** — not filmed; the wait is the same and round 6's less-motion film shows its look.
- **The bell's squadron numbers and colours** in 1.3 / 1.4 — section 3's; drawn as the bell is today.

## After the words review

The fresh Fable words review (`2026-11-26-msq-sections-words-review.md`) changed two of these lines. Both are now in
`words-s1.mjs`, marked as reviewed, and the pictures that show them were drawn again under the same file names. The log
is `raptor-port/.tmp/n191-s1/log-notes-words2.txt`; each picture was opened and checked.

- **1.27, a holiday that no leave period covers:** "Blocked: cancel the new holiday, or create its leave period, then
  pick 149." ("create", as the form's own button reads "Create the 2028 leave period") — `s1-cal-noleave-d`, `s1-cal-noleave-p`.
  One line on a desktop, two on a phone.
- **1.27, Q2's phone wording:** "Blocked: close the Calendar, save or cancel Inputs calendar settings, then pick 149." —
  `s1-cal-settings-alt-p`. Two lines. The words in Q2 above now read this way.
- **Seen on the redraw — for the builder:** on a phone the waiting holiday form is taller, so the note at the foot lies
  over that form's own Cancel and Save, the very buttons the note names. It is not over a ✕, and D2590 lets the note
  cover what lies under it for its few seconds. But the ✕ check in plan §4.6 does not catch this case. The other phone
  Calendar pictures leave their form's buttons clear.

The review's §5 facts, against these drawings:
- **(3) the qualification box:** the drawings hold. The box has only "Add" and no Cancel, so "clear" means emptying it by
  hand. Whether that lifts the refusal, and what "Done" does with typed words, is the builder's to confirm; nothing on the
  page changes.
- **(5) "Every Monday" quoting the open window's own weekday:** the drawings hold. The form was opened from the Monday
  heading, and its window's title reads "Every Monday", the words the note quotes. A form opened from another weekday's
  heading must quote that day's name.
