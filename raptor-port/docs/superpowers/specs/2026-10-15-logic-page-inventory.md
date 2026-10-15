# The Logic page today — its inventory, for the redesign (D809, D925; the design approved as drawn, D928)

**Who it is for (D929, 15 Oct 26):** a member or an admin reading it understands how each rule applies to them and how
the rules affect one another — key pointers, never the app's inside detail. Every setting's line names what else moves
with it; every check's line names the setting it reads.

*A fresh Opus helper's read of `src/ui/LogicPage.tsx`, `src/ui/logic-html.ts` and `src/engine/rules.ts` (VCONF, RULE_SPEC,
SHIFT_HARD), the night of 15 Oct 26 — saved in substance for the mock-up. The design note is
`2026-10-15-logic-page-design.md` (on `claude/trk-reorder-finger-drag`); pictures of today:
`docs/img/handpass/2026-10-15-logic-page/today/` (`scripts/handpass/pics-logic-today.mjs`). Today the page is about 7,900
words: 22,600 px tall on a phone (about 27 screens), 10,300 on a desktop.*

## The page's own controls
Title "Logic" with "every rule the engine applies — "Edit rules" to change a threshold"; a bar that stays in sight: search,
the chips All / Warnings / Advisories / Notes / Fired this week, ✎ Edit rules (→ Done), Reset to standard (only when a
value is off standard), the count line ("N of M rules · K fired this week · X off standard"); an amber strip when a value is
changed; the Insights box (one switch) ABOVE the twelve rule groups. Every row wears a tier tag, its code name
(CREW_REST), a grey column of engine text (`VCONF.step 60`), and "fired N× / not fired this week".

## Every setting, what changing it affects, and where it would group
| Setting (today's name) | Standard | What changing it affects (the helper's reading, from the code that reads it) | Group |
|---|---|---|---|
| Crew rest | 12h | the rest a flyer needs before his first commitment; the crew-rest warning and its "Breaks Monday" box | Crew rest & the working day |
| Max days worked in a row | 6 | the day the red "7 days" break warning lands on; it counts last week's tail | Crew rest & the working day |
| Long work day | 12h | when the grey long-work-day note shows (report to last end) | Crew rest & the working day |
| Nominal report before T/O | 3h | where no In-time / Rally is typed: a flyer's start of day (long day, Insights hours, OIL), the time "+ In-time / Rally" fills in, the tight-turn crew-rest note | Crew rest & the working day |
| Flight brief before T/O | 2h20 | the suggested brief — the blue B on every flying line with none typed, and what a blank B is checked against; also the export and the next-week peek; a published day keeps its old B until the next amendment | Flying lines |
| Step before take-off | 1h | how long before take-off a man counts as busy (clashes, the crew list's struck names); the line that rings a LATE SHOW crew-rest breach dashed instead of solid; the tight-turn floor | Flying lines |
| Dekit after landing | 30m | how long after landing a man stays busy; the tight-turn floor | Flying lines |
| Flight debrief after land | 2h | when a flyer's day ends — next day's crew rest, the long day, Insights hours, OIL; the debrief-clash window | Flying lines |
| Tight turn threshold | 2h | the landing-to-next-take-off gap under which the amber tight-turn advisory shows | Flying lines |
| + In-time / Rally words | IN TIME + WX/NOTAMS | the words the "+ In-time / Rally" button writes after the time | Flying lines |
| EP sim brief / Sim debrief / AMT debrief | 15m / 30m / 30m | the sim and AMT brief and debrief windows behind their advisories | Sims |
| Assumed sim length, no end time | 1h30 | how long a sim row with no end runs — clashes, the crew list, OIL | Sims |
| Assumed length, no end time | 1h | the same for a ground, programme or duty row | Rows with no end time |
| SC day window opens / closes | 07:00 / 19:00 | which SC / BB shift needs SC DAY currency and which SC NIGHT | Standby |
| SC MAIN clash grading (six switches) | flight, sim, duty, shift red; ground, programme amber | whether an SC MAIN man's clash with that kind of thing is red or amber in the warning list | Standby |
| Inputs late cut-off; SANS late cut-off; members may file for others | 14 days; the Wednesday two weeks before; on | when the LATE mark starts; who may file for whom (each opens its calendar's settings window) | Inputs |
| Full-day OIL threshold | 6h01 | weekend or holiday work at or above it earns a full day (FO), under it a half (HO); the suggestion in the OIL question | OIL |
| Track Blue/Red sorties | off | splits Insights' flying bars into Blue / Red and asks the Blue/Red question under formations | Insights |
| Minimum turn; Default sortie length | 20m; 1h25 | NOTHING — no code reads either (the page lists them "so it accounts for every setting") | to remove from view |

Not checked by the helper: the crew list's own reader of the SC MAIN grading (the code's comment says it reads it).

## Clutter — what only describes the app inside, or repeats the screen
The grey engine-text column on every row; the code name on every row; "every rule the engine applies"; "Before any rule
can fire, the engine has to decide…"; history in the text ("used to…", "until 21 Aug 26", "the owner's rule (21 Aug
26)"); the overlap row's "This is deliberate…"; the brief row's "This number is a convenience, not a rule…"; the OIL
row's very long paragraph; "Wave types at a glance" repeating "The standby lines"; the publishing rows repeating the
publish screen; Step and the report lead shown twice; "fired N× / not fired this week" on every row. And one misleading
line: the amber strip's "checked against these values, not the published ones" — a published day keeps its brief,
report, debrief and OIL values until it is published again.

## The four rules that need a short "how it works"
1. **Crew rest** — 12h clear between the end of yesterday's last commitment (a flight ends at landing + 2h debrief) and
   today's first thing, which may be a meeting before the report. A LATE SHOW remark keeps the warning; it rings dashed
   if rest still clears by step, solid past it. Monday checks last Sunday; a Sunday that breaks Monday shows a box.
2. **Days in a row** — any tasking counts; leave or a downchit resets it; the warning lands on the day to clear.
3. **The suggested brief and the order of times** — the B on the line is what is checked; a blank one is checked as
   take-off − 2h20. In-time → rally → brief → take-off → landing must run in order; out of order is red but never blocks
   publishing.
4. **OIL** — weekend or holiday work earns when the day is published; first report to last end; 6h01 or more a full day,
   under it a half; a row with no times earns nothing; SC spare and AVALON / BB only if switched on in OIL Earn.
