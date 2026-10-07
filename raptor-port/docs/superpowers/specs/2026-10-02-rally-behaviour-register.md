# In-time / Rally and negative work-span behaviour register

Approved rulings: D497–D507. Bound plan and independent arithmetic:
`../plans/2026-10-02-rally-workspan-plan.md` and
`../plans/2026-10-02-rally-expected-results.md`. No new product choice here.
FULL evidence: `../../handpass/2026-10-02-rally-workspan.md`.

| ID | Whole contract | Named executable proof |
|---|---|---|
| RT1 | Own-wave bounded formation scope, no personal targeting; specific-over-wide independently for IN and RALLY | `engine/rally-workspan.test.ts` D505 separate-activity and bounded-remarks cases |
| RT2 | First valid clock, legacy clock-only IN, both activities share a clock; immediate rally inherits applicable IN; optional/malformed notes do not invent required stages | Same file grammar/immediate cases; `state/rally-publish.test.ts` advisory-only publication |
| RT3 | Clock later than own take-off is immediately previous day; resolve dates before duplicate minima; row order independent and same-CS rows use their own TO | Same file D503/D506 cases, including daytime19:20→10:00 |
| RT4 | Shared signed report gives actual span and wrapped header; today's bands never invert, prior-created empty band has no members; standalone policies preserved | Same file header/bands/SC; `engine/rally-consumers.test.ts`1085m,1240m and SC480/360m; live consumer walk |
| RT5 | Present stages in order, equality legal; actual formation/pair explained during editing; invalid draft saves | `engine/rally-workspan.test.ts` D502/D507; `ui/rally-feedback.test.tsx`; runtime week/board edits |
| RT6 | D509: first publish, AL and correcting reissue never refuse for timing; wrong pair remains a hard working and issued warning; normal boundaries, reconciliation, signatures and hidden-warning lifecycle remain | `state/rally-publish.test.ts` all engine/command doors, working/issued warning and no-refusal pins; actual signed issue/amend/correct/hide/replay walk |
| RT7 | Existing week/board add/delete, commit/Escape/no-op, warning anchor, history and authority remain; read-only has no editing doors | `ui/rally-feedback.test.tsx`; unchanged existing editor/history/permission suites; runtime width/role/copy/reload paths |
| RT8 | Report/work hours, earlier rest commitment, normal busy and SANS windows keep separate definitions; ~~nominal OIL unaffected by reporting-only edits~~ *(REPLACED 6 Oct 26 by D591, built as `[OIL-WORK-START]`: OIL follows the entered in-time / Rally — `2026-10-06-oil-work-start-behaviour-register.md` OWS1–OWS5; the rest of RT8 stands)* | `engine/rally-consumers.test.ts` exact scheduled/input/busy/SANS arithmetic, and OIL following the report; runtime SANS/rest/OIL |

The register adds RT1–RT8 to `scripts/rulecheck.mjs`, with no increase in its
uncovered baseline. A named test is the coverage floor, not a replacement for
the required actual-app operations or fresh independent final inspection.

**Historical 2 Oct26 fixture approach below, superseded by D510 (3 Oct26):**
the18 offending demo clocks now equal own take-off less180, all words retained.
Both untouched authored weeks have zero REPORT_ORDER. Unit/browser helper
preconditions are removed; both parity engines receive exactly the same edited
reporting data while comparisons of events, rest, hours, warnings and marks stay
strict. Deliberate wrong-pair tests remain. A helper is not proof of a fresh demo.

The existing original-comparison corpus remains read-only. Engine parity
excises only the two introduced reporting warning codes from both warning
lists, with all13 untouched-seed wrong pairs positively pinned. Events, work
hours, rest, existing warnings and puck maps remain compared. HTML parity
receives identical valid reporting fixture strings in both in-memory engines;
it lifts only the named new reporting anchors/feedback/editor labels, with
positive UI pins. Production and reference demo data remain unchanged.

Legacy publication/history tests now need a valid report/brief starting pair.
The test-only fixture helper adjusts only an originally invalid resolved IN
pair, before the module's baseline clones or freshly loaded setup and before
any tested action. It retains first-clock formatting, scope/prose and all
actions/assertions. Deliberate malformed, negative, Rally and standalone
fixtures are excluded. Tests that explicitly premise no entered report clear
the fixture instruction. Crew-focus tests select a person warning, because a
reporting-line warning legitimately has no person puck. Original full failures
and targeted adaptation results remain in the evidence.

One boundary find rides this timing batch (D490): negative available rest was
formatted with negative division/remainder as `-1h-30`. The actual30-minute
overlap remains a hard breach; the formatter now reads `-0h30`. Its genuinely
red regression and fixed exact assertion are in `engine/rally-consumers.test.ts`.
This does not clamp, wrap or excuse the interval, or redefine work-span totals.

RT8 final-inspection repair extends dated rest across four authored source/
target dates, retaining actual source keys, placement/removal overlays and
working/issued worlds. `rally-consumers.test.ts` pins exact9h across an empty
date, negative/zero clearance, older flight/input, maximum17h30, multiple
within-week traces and actual move effects. `rally-dated-rest.test.ts` pins
Sunday→Tuesday, issued older source, external Tuesday/Thursday rows and
independent hides, and next-Tuesday-only official divergence. RT4 additionally
pins negative-origin midnight bucket/badge suppression with global all-day
list retained and genuine same-day tie control. No new ruling was inferred.
