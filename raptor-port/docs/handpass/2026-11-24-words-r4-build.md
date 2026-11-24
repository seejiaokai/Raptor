# Bug check — round 4 of the words pass, built (his D2521; chat 168, 24 Nov 26)

Branch `claude/words-pass-163`, pull request 841 (draft). The build: commit `a358d4b1a` — the bell's line for a changed
input (a change of kind, a half day, "and N more change(s)") and six passing notes. The words of record:
`../superpowers/briefs/2026-11-24-words-r4-draft.md` §After the fresh Fable's read; the approved page
`../mock/2026-11-24-words-r4/`; what each case printed before the build, `../img/handpass/2026-11-24-words-r4/facts.json`.

## 1. The eight answers and the tier

| # | Question | Answer, and why |
|---|---|---|
| 1 | Money (OIL, who counts as present) | NO — nothing earned, paid or counted changes; the publish note's words only (`leavewar/sync.ts publishFlagsBids` decides nothing new) |
| 2 | The published record | NO — publishing, signing and amendments are untouched; only the passing note said after a publish |
| 3 | Saved data | **YES** — a bell line is a saved record: a new kind of part (`{k:'kind', was, now}`) and a half day's `h` / `c` on the `when` part are stored; lines saved before must still read |
| 4 | A shared drawer | YES (held so) — the bell's words (`state/notices.ts noticeWords`) feed one list drawn on desktop and phone |
| 5 | A new gesture or mode | NO — no control, tap target or mode added |
| 6 | A new surface | NO |
| 7 | Roles | NO — two refusals reworded; who may do what is untouched (`state/perms.ts` unchanged) |
| 8 | The warning list | NO — `engine/validate.ts` unchanged; its sentence is reused by the publish note |

**Tier: FULL** (question 3). Split in two chats (the checklist's step 3): chat 168 — the tier, this sheet, the
roll-call, the scenario design (Astra and a fresh, blind Fable); the next chat — the sizing, the walk, the code reads,
the fixes, the re-walk, his look.

## 2. The roll-call — every place the app draws the thing touched

SHOW — is the new wording drawn there · USABLE — does the gesture that raises it still work · PAINTED — what else is
drawn there. Each cell YES / NO-because / MISSING when walked; a blank is a row not yet walked.

| # | Surface (where it is drawn) | Raised by | SHOW | USABLE | PAINTED |
|---|---|---|---|---|---|
| R1 | The bell's list, desktop (top bar, `ui/topbits.tsx` BellList) — a changed input's line | another person's save of the input | | | |
| R2 | The bell's list, phone (the same list as a full-width panel) | the same | | | |
| R3 | A tap on such a line → the input's own window, the line marked read | a tap | | | |
| R4 | Undo, then Redo, of the save that wrote a new-shape line — the line goes and comes back; the permissions gate passes it | Undo / Redo | | | |
| R5 | The input's window, its start / end time boxes (`ui/inputedit.tsx normalizeInputDraft`) | Save with a bad time | | | |
| R6 | The Inputs list's in-place start / end cells (`ui/inputedit.tsx setInpField`) | a bad time typed in a cell | | | |
| R7 | Edit Schedule, a puck dragged back onto its own seat — flying, duty, ground, a placeholder (`ui/drag.ts`) | a drag | | | |
| R8 | The Scheduler Board, the same drag | a drag | | | |
| R9 | The Inputs page's look-ahead, saved (the default window's gear) | Save | | | |
| R10 | Publishing a weekend or holiday no Leave War period covers — Edit Schedule (`leavewar/sync.ts publishFlagsBids`), alone and joined to the publish note | Publish | | | |
| R11 | The week's warning list, the "Create the <year> period" button's hover (`ui/html.ts`) | hover | | | |
| R12 | The Scheduler Board's warning line, the same button's hover (`ui/board.ts`) | hover | | | |
| R13 | "Create the <year> period" pressed: the note "The <year> Leave War period is created…" (`ui/interactions.ts`) | a press | | | |
| R14 | Its refusal to a non-scheduler, "Only a scheduler can create a Leave War period" | a press (reachable? record) | | | |
| R15 | The OIL day list's Save by a member, "Only a scheduler can answer from this list" (`ui/oilday.ts`) — not reachable on screen (facts.json q4c): carried by `leavewar/holnotice.test.tsx` | a test | | | |
| R16 | The sign-off's OIL list (`ui/oilsign.ts`, the same save) | a press | | | |

## 3. The sizing lines (§7.0)

## 4. The scenarios (Astra and a fresh, blind Fable, each blind to the other; the host combining)

## 5. The orders walked, and what the screen said

## 6. The cases carried by a test, each with what it proves

- The bell's new words, old saved lines, the count of more changes, small letters and capitals:
  `src/ui/bellnotices.test.tsx` "round 4 of the words pass: the bell (D2521)" (written first, failing on today's words).
- The notes' words in their files, and the old words gone: `src/ui/noteswords.test.ts` (R4 rows, GONE rows).
- The bad time named, the first bad box: `src/ui/audit-guards-inputs.test.tsx` "an input time has to be a time".
- The drag back onto its own seat: `src/ui/drag.test.tsx` (three cases).
- The look-ahead note: `src/engine/lookahead.test.ts`.
- The publish note: `src/leavewar/oilsync.test.ts` "publishing a day no leave war period covers says so".
- The created-period note: `src/ui/oilperiod-offer.test.tsx`; the OIL list's refusal: `src/leavewar/holnotice.test.tsx`.

## 7. The pictures

## 8. The break tests

## 9. Errors seen

## 10. What was NOT walked, and why

## 11. The gate counts

## 12. What the walk found, and each disposition

## 13. The code reads (Astra and a fresh, blind Opus — the same brief; Fable beside them, high risk)

## 14. Lessons added (§7.11)
