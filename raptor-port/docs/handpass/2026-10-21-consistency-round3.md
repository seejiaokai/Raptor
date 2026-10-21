# Round 3 of the consistency look — evidence sheet (21 Oct 26, `claude/sharp-spence-adf59e`, pull request 564)

[UI-CONSISTENCY-LOOK] (D1124) — his answers to round 3's first four questions: to question 1 a picture of the typed ✎ as his
PC draws it and *"can u make sure u use the same icon designs i like this pencil better"* → D1134 (every pencil one design,
his solid one, drawn by the app); *"the rest yes"* → D1135 (the Tracker's menu marks as line icons), D1136 (the Tracker's
labels in small spaced capitals), D1137 ("+ Medical" first, no frame, the dates button's line calendar). The questions page:
https://claude.ai/artifact/UT34rbwMNC9Zs8M4vdYP24. Pictures: `docs/img/handpass/2026-10-21-consistency-round3/` — the
questions at the top, `walk/` the walk. Scripts: `scripts/handpass/cr3-look.mjs` (the questions), `scripts/handpass/cr3-walk.mjs`
(the walk, as assertions). Design lesson 19 (D1134) — one fresh reader, two marks taken.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL) | NO — nothing earns, counts or shows OIL |
| 2 | The published record | NO — no publish, sign, amendment or issued face drawn differently |
| 3 | Saved data | NO — icons, styles and the order of two buttons; nothing stored, read or reset |
| 4 | A shared drawer | YES — one pencil drawing (`ui/pen.ts`) printed in fourteen places, and the Tracker's copy |
| 5 | A new gesture or mode | NO — every control does what it did; "+ Medical" moved within its row |
| 6 | A new surface | NO |
| 7 | Roles | NO — the admin-only pencils (Default window, templates, plans) stay admin-only |
| 8 | The warning list | NO |

**Tier: WALK.** The code read: one fresh, blind Opus read (D790; no ChatGPT reader while they are out — D761's list).

## 2. The roll-call — every place a pencil is drawn (D1134)

| Place | The solid pencil, no typed mark | Pressed, it does its job | Picture |
|---|---|---|---|
| Quals "Edit", desktop and phone | YES — walked | YES — editing, Done ends it | `walk/01`, `21` |
| Logic "Edit" | YES | YES | `02` |
| Board, Templates menu "Manage templates" | YES | YES — the day templates window | `03` |
| Board, "+ Block" menu's heading pencil (alone) | YES | YES — the duty templates window | `04` |
| Board, plans menu — each plan's pencil and "Manage plans" (a plan made with "+ Alt Plan") | YES | YES — the plans window | `05` |
| Board, a row's CX window "Edit" | YES | YES — the reasons list | `06` |
| Board, a jet's stores list pencil (alone) | YES | YES — lit in edit, out again | `07` |
| Inputs list, dates pop-up "Default window" (admin) | YES | YES — the weeks box | `09` |
| Inputs calendar, a note's pencil (was the ✏ emoji), desktop and phone | YES | YES — its words open | `10`, `23` |
| An input's window, the title box's pencil (inside the box) | YES | — (a tap on it is a tap on the box, unchanged) | `11` |
| Tracker bar, Course and Syllabus pencils, desktop and phone | YES | YES — their menus open | `13`, `26` |
| Tracker, Course menu "Rename course"; Syllabus menu "Edit chart layout", "Rename syllabus" | YES | Edit chart layout → the tools show, Done leaves; Rename asks a name (not pressed: the browser's own prompt) | `14`, `15` |
| Tracker, Edit chart layout's "Text" tool | YES | YES — the tool in use | `16` |
| Tracker, a ball's pop-up "Edit details" | YES | YES — the details window | `18` |
| Tracker, the Students card's rename pencil on each name | YES | not pressed (the browser's own prompt) | `19` |
| A ✎ inside a sentence of help text; the ✎ after an edited chart's name in the Syllabus list | must not — kept typed by D1134 (a drawing cannot go in a sentence or a list option) | — | — |
| The Leave War, the Scheduler Board's ⇅ / ▤ | must not — round 4 (finding 17) | — | — |

**D1135 — the Tracker's menus and Students card.** Course: Reorder, Delete; Syllabus: Duplicate, Reorder, Delete; File: Import,
Export; Students: Reorder and each name's ✕ — each a line icon, no typed mark (walked `14`, `15`, `17`, `19`, phone `25`);
Reorder courses, Export and the crew Reorder pressed — each opens its window. The empty Tracker's "Import a file…" is the same
upload arrow (not walked: it shows only with no course; `onepencil.test.ts` scans its source). **D1136** — the three labels wear
Quals' "Viewing" exactly (size, weight, spacing, capitals, grey — measured on both pages); the bar stays one line; hidden on a
phone as before (`13`, `26`). **D1137** — "+ Medical" first, on the tabs' left edge where "+ Input" stands (measured: 12 at 1536,
8 at 402), "as of" next, the same 36 tall; no frame round the tab, its three sections keep their boxes; "+ Medical" still opens
the window on ATT C (`12`, `24`); the Inputs list's dates button wears the line calendar, one row with "+ Input" on a phone (`08`, `22`).

No MISSING.

## 3. The five sizing lines (§7.0, `walk-ledger.md`)

1. **Type:** E (look: one shared drawing printed in many places; styles and an order on two surfaces).
2. **What only a walk could find here:** a place still printing the typed mark; a drawn icon too big or small against its words or
   breaking a row; a pressed control that no longer works once its mark is markup; the Medical row's real place against the list's.
3. **What the ledger says:** type E walks of one shared rule found a fault about one time in three, mostly a size or a place at an
   untried width.
4. **The walk chosen:** the host alone, one scripted walk of the built bundle as assertions (`cr3-walk.mjs`): every pencil place at
   1536 (his PC), the phone's at 402 by touch, every one pressed; the labels measured against Quals; the Medical row measured
   against the list's. 71 checks, 26 pictures, the key ones opened. Carried by tests: `onepencil.test.ts` (no typed pencil printed as
   a mark; the Tracker's copy the same drawing), `tracker.test.tsx` (the menus' icons), `quals.test.tsx`, `medicalview.test.tsx`,
   `inputslist.test.tsx`, `e2e/boardside.spec.ts` — each claims the markup; every place was walked.
5. **After the walk:** the ledger row is added (`walk-ledger.md`, 21 Oct 26, this job).

## 4. The walk

`scripts/handpass/cr3-walk.mjs` on the built bundle (`vite preview` on 4237), clock set to Mon 13 Jul 26. **First runs:** the duty
and day templates and plans windows do not close on Escape (older — §7; the walk closes them by their ✕); four checks failed on the
script's own selectors (the input window's kind box, the Students card's chips), fixed. **One fault found by the walk:** "+ Medical"
stood 16px right of "+ Input" on a desktop and 10px on a phone (the Medical row kept its own padding and band), and 9px lower on a
phone — not "where + Input stands"; the row's padding and band went in the tab form only (`25-inputs-calendar.css`), measured again
level. **The pencil set beside the typed ✎ (`walk/20`)** came out a little thinner with a sharper tip; it was made chunkier with a
rounder cap and a short blunt tip, and walked again. **Second fault, found by a picture, not by the walk:** taking round 3b's
pictures (`q6-list-today.png`, first take) showed the desktop Inputs list's dates button with its new line calendar ABOVE the dates,
the button two lines — that row is not `.inputs-top`, whose buttons lay an icon beside its words, and the drawing is a block. The
walk had checked only that the icon was there. Fixed (`25-inputs-calendar.css`, the list row's dates button laid out as the
phone's), and the walk now checks the icon sits beside the words on one line, as tall as "+ Input", at both sizes. **Last run
73/73.** No page error, console error or failed request.

**Walk:** 73/73 PASS, 26 pictures (`walk/`), desktop 1536 and phone 402 by touch, every pencil place seen and pressed; two faults
found and fixed (the Medical row's place; the desktop dates button's icon stacked above its words — the second by a picture).

## 5. The code read

One fresh, blind Opus read (D790), given the diff and this sheet: "overall the change is sound" — every pencil a person presses
prints the drawing; the two kept typed are right; no markup lands where only text goes (titles, toasts, the option); the title box
keeps its 16px (`.inped-pen svg` outranks `.pen-ic`); the Medical CSS is scoped to the tab form, the only one any screen draws.
Four findings, all taken:

| # | Finding | Disposition |
|---|---|---|
| 1 | The desktop dates button's calendar stacked above the dates | Already found by the picture (§4) and fixed with the same rule, before the read returned |
| 2 | The as-of picker hung under "+ Medical" (its left was fixed at 12px, right when "as of" stood first) | Fixed: measured at the press, under its own button, kept inside the row (`MedicalView.tsx`); walked at 1536 and 402 (`rewalk/13`, the phone's) |
| 3 | A student's remove ✕ lost its only spoken name (the "×" text) | Fixed: `title` and `aria-label` "Remove this student" (`SidePanel.jsx`); walked |
| 4 | `onepencil.test.ts` caught a ✎ only right after a tag, not a quoted label (`'✎ Text'`) | Fixed: the quoted form too, comments left out, the Syllabus option named as the one kept |

Each fix is one or two lines, so no second read of the fixes (§5's "a fix is new code" is for rewritten logic). **Re-walk** of what
the fixes touched, the whole script again into `rewalk/`: **76/76** (the three new checks among them).

## 6. The gates

GitHub's run of pull request 564 is the full check while the repo is public (D1086). On his PC: the touched unit tests (10 files,
501 + the new file's) green, and the build the walk drives.

## 7. Not proved here, and seen in passing

- Safari's own drawing of the new pencil on his iPhone — the drawing is the app's, so it should match; his look.
- **Seen, older, not this job:** the Scheduler Board's Duty templates, Day templates and Plans windows do not close on Escape (the
  design guide §2: Escape closes what opened last) — filed [BOARD-MODALS-ESCAPE].
- **Seen, older:** the Tracker Students card's rename pencil and remove ✕ are not buttons (no keyboard reach) — filed with
  [UI-CONSISTENCY-LOOK] in round 3's note.
- **Finding 18 (found building round 3):** the Tracker's Info panel ("⧉ Copy to…", a lull's ×) and Edit chart layout's tools (✋ —
  an emoji on an iPhone — ▣, →, 🗑, ╱, ❐) keep typed marks — for round 4 with finding 17.
