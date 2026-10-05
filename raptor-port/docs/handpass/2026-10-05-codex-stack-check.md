# The Codex stack — Claude's ONE check (D589) — the evidence sheet — started 5 Oct 26

Branch `claude/codex-stack-review`, cut from `codex/save-note-controls`; the app code checked is commit `bcc69fc8`
against `main` at `de470db5`. Five pieces, built 2–5 Oct 26 while Claude waited (D494, D496): **Discard marks removed**
(D488) · **In-time / Rally and work hours** (D497–D511) · **Insights' mission mix** (D512–D538) · **the workflow UI pass**
(D540–D566: the stylesheet split, the phone board repair, the Tab route, the phone Insights menu, the tapered wing with
the Logic search and the Insights cross) · **the failed-save warning's band** (D586, D587). The Inputs/SANS calendar
(`codex/inputs-sans-calendar`) is on hold and outside this check.

**STATE OF THIS SHEET: IN PROGRESS.** It is written as the check goes (order §9). A section that says "to come" has not
been done; nothing here is a result until its section is filled.

**Every read the Codex blocks of `HANDOFF.md` list as owed to Claude is paid by this check** (D589) — §10 names each.

## 1. The eight questions — tier FULL

| # | The question | Answer | Why, read off the change |
|---|---|---|---|
| 1 | Earned leave (D25) | YES | Rally / work hours changes where a person's day starts (`engine/reporting.ts`, `events.ts`, `validate.ts`); the worked-hours test of a weekend or holiday reads that start |
| 2 | The published record | YES | "Discard marks" and its command are cut out of the publishing path (`publish.ts`, `sched-commit.ts`, `ALPanel.tsx`); a Blue/Red answer counts on a published day with no amendment (D530); a wrong timing no longer blocks publishing (D509) |
| 3 | Saved data | YES | a new stored record, the mission-role answer (`state/mission-roles.ts`, `persist.ts`, `storage/reset.ts`, `storage/boot.ts`); two new Logic values (`reportLead`, `reportText`) and the tracking switch |
| 4 | A shared drawer | YES | the stylesheet split touches every screen; `board.ts`, `html.ts`, `textedit.ts` draw every line; the warning band sits under every full-screen surface; thirteen windows share one close rule |
| 5 | A new gesture or mode | YES | Tab through the schedule; the phone ⋯ → Insights; "Choose / Change mission role" and the Blue / Red / Later question; "+ In-time / Rally"; Retry |
| 6 | A new surface | YES | the mission-mix chart with Show all; the warning band; the phone menu; the board's Insights door |
| 7 | Roles | YES | `state/perms.ts`: a new table (`MissionRoleAnswer` — admin all, member and guest read), two new commands, `sched.discard` removed, a new settings key |
| 8 | The warning list | YES | the timing-order warnings (in-time, Rally, brief, take-off, landing), "suggested brief", the previous-day wording, how rest and the long day read the start |

Every answer is YES, so the tier is FULL by any one of 1, 2, 3, 7 or 8 (D485: a batch takes its riskiest change's tier).

## 2. Who does what (D588, D589, D590)

| Job | Who | Why |
|---|---|---|
| The plan of the check, the roll-call, reproducing every finding, opening every picture | the host, Opus 5.5 | Opus wrote none of Codex's code |
| Reading Codex's code, piece by piece (AB · C · D1 · D2) | four Opus 5.5 readers, each in its own space, pass 1 before the walk (the inventory and leads), pass 2 after it with this sheet in hand | D67 (3): what Codex builds, Opus reads; never Sonnet (D588) |
| Reading what OPUS wrote inside the stack — the Insights fixes of 3 Oct (D534, D536, D538) and the save-note fix (D586), whose last round has had no independent read | Astra; Sol 6.1 second on the Insights fixes (they touch the published record) | D590 |
| The one side-by-side | Astra, Sol 6.1 and Fable 5.1 each read the Insights fixes once, blind to each other; his weekly allowance read before and after Fable | D590 (5) |
| The scenario list | Astra — a fresh session, told that the Codex sheets are claims; the host adds its own from the roll-call, because Astra planned these builds | D353; anti-pattern 10 |
| The walk | Sonnet 5.5 walkers, each in its own world; pictures and a filled table | D588 |
| The check set | a Sonnet 5.5 helper under the PC lock | D588, D228 |
| Trial 1 — the walkers | one Opus and one Sonnet walker, the Rally scenarios, on the Rally build as it stood before its review fixes (`786d2b2c`), neither told what is wrong | D588 (3), D480 |
| Trial 2 — the builder | `[OG-TAG-OVER-COUNT]` built by a Sonnet helper to a precise spec, read by Opus | D588 (4) |

**The builds walked.** `raptor-port/dist-stack` — `npm run build` of this branch at `8785118d` (app code `bcc69fc8`),
frozen 5 Oct 26; servers `raptor-stack-a` (4221), `raptor-stack-b` (4222). `raptor-port/dist-rallyold` — the same build
command on `786d2b2c` in a temporary checkout, frozen the same day; servers `raptor-rallyold-o` (4226),
`raptor-rallyold-s` (4227). *(Codex's Rally sheet names an earlier commit, `9cc5d4ff`, as "the known-defect baseline" —
the build BEFORE Rally existed. D588, the later ruling, says "the Rally build as it stood before its review fixes", and
on the earlier one the Rally scenarios could not be walked at all; so the trial uses `786d2b2c`.)*

## 3. The rulings walked — to come (the rules sweep: one mark per surface for what is shown, one per order for earned leave)

## 4. The roll-call and the door check — to come
Parts, one per reader: `parts/stack-read-AB.md`, `-C.md`, `-D1.md`, `-D2.md`; the save-note band's own roll-call is in
`2026-10-05-save-note-controls.md` and is re-checked here against the top of the stack.

## 5. The walk — to come
Briefs: `../superpowers/briefs/2026-10-05-codex-stack-scenarios-brief.md` (Astra's list:
`…-codex-stack-scenarios-astra.md`), the readers' `…-codex-stack-read-brief.md`.

## 6. The break tests — to come
## 7. Errors seen — to come
## 8. What was NOT walked, and why — to come
## 9. The gates — to come
## 10. The reads, and each owed read paid — to come
## 11. Trial 1 (the walkers) and Trial 2 (the builder) — to come
## 12. His look — the "look here" card — to come
