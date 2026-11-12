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

To be written once the coordinator gives the go for the walk.

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
