# Inputs / schedule batch — walker 1 (13 Oct 26)

Branch `claude/inputs-schedule-batch`, build served on `http://localhost:4187/`. Driven with Playwright scripts of my own
(`raptor-port/scripts/handpass/ib/w1/` — `ibl.mjs` is the shared driver, `g1a.mjs` scenarios 1–6, `g1b.mjs` scenarios 7–14,
`g2.mjs` scenarios 15–20, `compile.mjs` builds the table from `results.jsonl`; `x*.mjs` are my exploration scripts).
Pictures: `raptor-port/docs/img/handpass/2026-10-13-inputs-batch/w1/`. Every scenario ran in a fresh browser context signed in as
Saber (`ad`/`a`) unless it says Ranger. Desktop 1440 x 900; phone 390 x 844 touch; "phone on its side" 844 x 390 touch.
Where a row has two sizes both were walked.

## Counts

38 scenario-size rows: **34 PASS, 0 FAIL, 4 RECORD** (scenario 13 at both sizes, scenario 18 at both sizes), 0 NOT WALKED.
Scenarios 3, 4, 9, 12 and 16 also carry a RECORD item inside their PASS line (the Undo button's words, the flash, the card's
words, the first line of the shared sheet, the bubble's text) — each is written out in the table.
Scenario 11 was desktop only (as the brief says), 14 on the phone turned on its side only.

## What the take-off controls were (asked for in the brief)

On the Scheduler Board, for an input landed on the programme, BOTH controls exist and were found at desktop and phone: the row's
✕ (`[data-grdel]`, "Remove this item") and, under Personal Inputs, the card's "Undo" (`[data-acc="x"]`). Every take-off in these
walks was made with the row's ✕ (the recipe's). The put-back control was `[data-acc="g"]`, labelled "ACCEPT". On Edit Schedule's
week (scenario 11) the card's Undo and Accept were both found under Friday's Personal Inputs after opening the folded panel.
The app's Undo button (`#undoBtn`, ↶) carried the title "Undo — a change to the schedule" (scenario 9, 10) or "Undo — a personal
input" (scenario 3, after a put-back) — it changes its words with what it would undo.

## The table

