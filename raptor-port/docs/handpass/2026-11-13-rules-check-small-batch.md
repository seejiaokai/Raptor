# The rules check's small batch — the bug check (13 Nov 26, the night's job 2)

Four of his answers to the rules check, `[RULES-CHECK-FIXES]`'s small batch (D2009, D2010, D2014, D2015), branch
`claude/rules-check-small-batch` (cut from pull request 762's branch; no pull request at night). Scenarios: Astra's,
designed read only before the build, `docs/superpowers/briefs/2026-11-13-rules-check-small-batch-scenarios.md`.
Pictures: `docs/img/handpass/2026-11-13-rules-check-small-batch/`. Laid down at the build's end, before the walk;
the walk, the reads and the gates are filled in after it.

## 1. The eight answers and the tier

| # | Question | Answer, and why |
|---|---|---|
| 1 | Money | YES — OIL (earned leave, time off banked, never pay — D25): D2014 is about which "Full day of OIL" a published day's OIL follows |
| 2 | The published record | YES — D2014 and D2015 are about when a changed setting reaches a published day |
| 3 | Saved data | NO — nothing new is saved: the sortie's "no landing typed" mark (D2010) is worked out afresh from the typed landing at each check, never stored; the published day's three kept OIL values were already saved, unchanged ([OIL-WORK-START], D592 (4)) |
| 4 | A shared drawer | YES — the warning names (D2009) are one table read by the Logic page, the week's warning list, the day's ⓘ and Insights; the crew-rest sentence (D2010) is one function feeding the crew-rest warning, the tight-turn note, the day before's trace and next week's Monday |
| 5 | A new gesture or mode | NO — no control, tap target or mode added |
| 6 | A new surface | NO — no screen, panel, sheet or kind of row added; no new box, message, mark or button |
| 7 | Roles | NO — who may do or see anything is unchanged |
| 8 | The warning list | YES — two warning names (D2009) and what the crew-rest warning says (D2010) |

**Tier: FULL.**

## 2. The rulings swept

| Ruling | What it says, in the app's words | Clash | Held by |
|---|---|---|---|
| D2009 | the checks read "On leave + planned" and "Downchit + planned"; the day's own message ("On leave but tasked — BRIEFING", "planned to fly") unchanged | none | `rules-small-batch.test.ts`; the walk |
| D2010 | "Monday took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00" where the last flight has no landing typed; a blank, "TBD" or any word that is not a time | none; the ruling's "Mon" is shorthand — the app prints the day's full name, as it always has | `rules-small-batch.test.ts`; the walk |
| D1990 | a "TBD" landing ends the day as a blank one does | none — D2010 words it | `rules-small-batch.test.ts` |
| D49 | a landing typed equal to the take-off is a real landing — it keeps "landed" | none | `rules-small-batch.test.ts` |
| D1936 | an unlanded sortie counts no hours and raises no long-day note | none | `rules-small-batch.test.ts` |
| D2014 | a published day's OIL follows the "Full day of OIL" it was published under; a change reaches it from its next amendment | **none, but its premise is wrong:** already built that way by [OIL-WORK-START] (D592 (4), 5 Oct 26) — pinned end to end, nothing in the engine changed | `oil-fullday-published.test.ts` (12, break-tested); the walk |
| D592 (4) | a later Logic change reads pending until the day is published again | none — the one way a Logic change makes a published day pending is when it would move someone's OIL | `oil-fullday-published.test.ts` |
| D2005 | a Logic change never starts a flag on a published day; the day is checked by the settings it was published under | none | earlier tests; unchanged |
| D2015 | the Logic page's note says a changed setting reaches a published day from its next amendment | none | `logic.test.tsx` W2; the walk |
| D48, D142, D2 | an issued day keeps its OIL until republished; OIL comes from the latest published version | none | `oil-fullday-published.test.ts` (older versions, Unpublish) |
| D482 | a Logic change moves Insights' hours at once, published days too | none — untouched | — |
| D56 | days published before the kept copy existed are demo data | — | not a finding |

**The other OIL settings (D2014's roll-call):** none reaches a published day's OIL at once. The OIL arithmetic reads only
the report lead, the debrief and the "Full day of OIL", all three kept in the day's published evidence. The open-ended
row's assumed hour and the sim length only draw (the hour shown, the chip); step, dekit, brief lead, sim debrief,
AMT debrief and the hard SC shift are not read by it. The placeholder crowd is frozen at publication. An input's OIL
question reads today's line, but only when it is asked or edited — the working copy. Nothing parked.

## 3. The roll-call

| Change | Surface | Mark | Seen in |
|---|---|---|---|
| The two names (D2009) | the Logic page's check rows | has it | |
| | the Logic page's search and Warnings filter | has it | |
| | Edit Schedule's warning list (bold name), desktop and phone | has it | |
| | the same, a hidden line (struck) | has it | |
| | View-only Sched's warning list | has it | |
| | the day's ⓘ (Issues on this day) | has it | |
| | Insights, Conflicts by type | has it | |
| | the Scheduler Board's issues list | must not, because the board shows the message, not the name | |
| | the crew list's struck reason | must not, because it shows the reason, not the check's name | |
| | the IT flow guide deck (two slides quote the old names) | MISSING — the deck is re-made only on his word (D403); filed for the coordinator | — |
| | old walk scripts under `scripts/handpass/` | must not, because they are the record of past walks | — |
| The crew-rest words (D2010) | the crew-rest warning on the next day, Edit Schedule, desktop and phone | has it | |
| | the same on the Scheduler Board and View-only Sched | has it | |
| | the amber tight-turn note | has it | |
| | the day before's "breaks tomorrow's crew rest" line and dotted mark | has it | |
| | across the week's edge: Sunday's sortie, next Monday's warning | has it | |
| | the day's ⓘ | has it | |
| | the ALL AVAIL window, a flagged man's reason | has it | |
| | the crew list's reason before a man is placed | must not, because its short reason ("crew rest — not clear until …") names no landing | |
| | Insights hours, the long-day note | must not, because D1936 keeps an unlanded sortie at no hours | |
| | the next-week preview | must not, because it draws no crew-rest warnings | |
| A published day's OIL (D2014) | OIL Earn's figures and green marks, the week and the board | has it | |
| | the ALL AVAIL chip's earning half | has it | |
| | a look at an issued version (👁) | has it | |
| | the Leave War grid's credit cell and its day sheet | has it | |
| | the OIL tracker, Balances, the person window's OIL figure | has it | |
| | the day's pending count, To go out, the four sign-offs | has it | |
| | the amber "Publish this day again…" lines | has it | |
| | the change history | must not, because a Logic change writes no history line | |
| The note (D2015) | the Logic page's strip, admin and member, one and several settings, desktop and phone | has it | |
| | the other Logic lines that say "until it is published again" | must not change, because they say the same of one setting — consistent | — |

## 4. The five sizing lines

- **Type of change:** A (the crew-rest sentence: one shared function, many readers), D (two names and one sentence drawn
  in several places), F (the strip's words), G (D2014: the published record and OIL across a Logic change, an
  amendment, Undo and Redo).
- **What only a walk could find here:** a reader of the name or the sentence that draws its own copy (the board's issues,
  the day's ⓘ, Insights, the ALL AVAIL window, the crew list's reason); for D2014 a place that draws a published day's
  OIL from today's line — the tests read the engine's figures, not what the Leave War grid, its day sheet, the person
  window, the OIL tracker, Balances, OIL Earn and the pending list each paint; the strip at both widths and for a member.
  The host's own route (`scripts/handpass/rcsb/rcsb-host.mjs`, pictures `host/`) already showed, at his PC's size in a
  window started at 125% and on WebKit at 402: published FO*, the line raised to 7h, the Leave War still FO* and 1, the
  day "1 pending" and "Not yet signed", the board's OIL Earn reading the working copy's HO, and after Publish AL1 HO* and
  0.5 everywhere.
- **What the ledger says:** type A/D/G walks of 12 Nov 26 (D2005; the rules check's fixes) found 2–3 real faults each,
  all in places that drew their own copy (the ALL AVAIL window's reason, a published heading, a desk's own ring); two to
  three Sonnet walkers, 400–650 pictures.
- **The walk chosen:** "Low" — TWO Sonnet 5.5 walkers, one after the other, on the frozen build of `300be6535` (the
  strip's last words included) served on port 4193: **W1** D2014 both directions shown on every surface (before the
  change, right after, after the next amendment), Undo and Redo, another day published under the new line, the setting
  put back, the strip (admin, member, one and two settings, Reset), Astra's open-end side question, the plain-user round;
  **W2** D2009's two names and D2010's sentence on every surface that draws them, a briefing row and a flying row, a
  member's View-only. Sizes: his PC's 1536 × 864 in a Chromium window started at 125% (no size emulated) and his
  iPhone's 402 × 874 in WebKit by touch, each scenario at the PC and the ones that draw on a phone at both. Carried by
  tests (they call the engine and the commands, not the screen; the routes on screen are the walked ones): the D2010
  word variants (TBD, "late", "?", a midnight landing, a later typed landing, a 1h30 debrief, both orders) —
  `rules-small-batch.test.ts`, one walked variant each of blank and TBD; D2014's older versions and Unpublish, the
  holiday made after publication and the five gotcha families — `oil-fullday-published.test.ts` (through the app's own
  commands, the OIL pass and the ledger).
- **Afterwards:** the ledger's row (§10 below).

**The lessons of §7.11, each against this walk:** 1 (states × readings) — D2014's table is before / after / after the
amendment × every OIL surface, W1; 2, 7, 13, 20, 21, 26 (gestures, pinches, motion) — no gesture changed, cannot apply;
3 (after every press) — W1 pictures the pending mark and sign-offs after the Logic change; 4 (a window leaving the page
working) — not touched; 5 (a box moved into sight) — not touched; 6 (handed to the phone) — no; 8 (an approved drawing) —
no drawing; 9 (lists measured) — the warning list and Insights' rows are only renamed: W2 pictures each at both widths
for a wrapped name; 10 (a page hidden and shown) — W1 changes the setting with the Leave War closed and reopens it; 11 (how
much fits) — no; 12 (every page a window opens from) — the person window from the grid, the OIL tracker from it and
from Balances, W1; 14 (keyboard boxes) — no; 15 (bars over scrolling) — no; 16 (after a refusal at a box) — the Logic box
takes a bad value once, W1's plain round; 17 (show/hide controls) — the Logic page's ✎ Edit / Done and the strip shown
and hidden by Reset, W1; 18 (print) — no print changed; 19 (window over window) — the OIL tracker over the person window,
closed each of its ways, W1; 22 (what is drawn) — every claim read from the painted text and pictured; 23 (what a tap
opens) — the pending count opens To go out, the war's FO* box opens its own window (D1524), W1; 23b (side-by-side
boxes) — the strip's lines at both widths; 24 (against the top bar) — no; 25 (made through the app's own controls in every
place) — the leave and the downchit made through the Inputs page, the line and the desk on the board, W2 on a flying
and a briefing row; 27 (neighbours of a pressed control) — no control's neighbour changes; 28 (phone: what a press opens
proved first) — W1's phone step opens the strip and the war by taps; 29 (reads today) — no; 30 (a tap pictured at once on a
phone) — W1 and W2 phone taps use the tap-picture helper; 31 (a page fitted to the screen) — not touched, but the PC
world is the real 125% window it asks for.

## 5. The orders walked

## 6. Findings and what was done

## 7. The reads

## 8. Cases carried by tests

- D2009: the two names on the Logic page and as the warning's bold name; the four messages unchanged; "Personal input
  clash" unchanged — `src/engine/rules-small-batch.test.ts`.
- D2010: blank, "TBD" and other words; a typed landing and one equal to the take-off keep "landed"; overnight; the later
  end decides in both orders; a ground row ending the day; a 1h30 debrief; the crew list's check; the tight-turn note; a
  midnight landing; a later typed landing beats a blank one; no long-day note — same file.
- D2014: lowered and raised, every surface, Undo and Redo, older versions and Unpublish, another day published under the
  new value, the working copy, a holiday made after publishing, and the five gotcha families (a TBD landing, an empty
  day, changed and put back, the desk deleted, the week off screen and back) — `src/leavewar/oil-fullday-published.test.ts`;
  made to read today's line, 9 of its 11 OIL cases went red.
- D2015: one and several settings, the old words gone — `src/ui/logic.test.tsx`.
- The original's assertions run against the same messages: the reference window mirrors D2010 (`src/testing/refwin.ts`).

## 9. Gates

## 10. The Walk line
