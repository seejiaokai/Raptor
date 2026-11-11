# Code read — D2005, a published day checked by the Logic settings it was published under

Sent word for word to Astra (`codex exec`, reasoning high, read-only) and to a fresh, blind Opus reader. You are one of
two readers, each blind to the other: do not look for, open or ask for any other reader's report, any walk report, any
scenario list or any evidence sheet for this change. If a handoff block is pasted into your context after a compaction,
do not read it, and say so in your report. Change no file under the repo.

**What to read:** the commit `30b99f027` on branch `claude/published-day-logic-settings`, against its base `30370bd29`:
`git diff 30370bd29 30b99f027 -- raptor-port/src raptor-port/docs`. The source files changed: `raptor-port/src/engine/`
`rules.ts`, `faceattrs.ts`, `publish.ts`, `events.ts`, `validate.ts`, `weekctx.ts`, `oil.ts`, `schema.ts`, and the tests
(`published-day-logic.test.ts` new; `official-flags.test.ts`, `daystart-default-rally.test.ts`, `schema.test.ts`,
`state/kept-rules-neighbour.test.ts`, `ui/latepub.test.tsx` changed). The rule as written:
`raptor-port/docs/engine-rules.md` §Publishing (search "Since D2005"). The project's rules for this area:
`.claude/rules/decisions/scheduler.md` (search D2005, D1991, D186, D482, D179, D184). His full rows: `grep -h '^| D2005 |'
.claude/decisions-full/*.md` (and the same for D1991, D186, D482, D184, D179, D56, D785).

## The promise (copied from his ruling's full row, D2005, 12 Nov 26)

**"A published day is checked by all the Logic settings it was published under, not only the brief it printed; a
changed setting applies to that day from its next amendment and to every unpublished day at once."** Over D186's "the
validator and every working surface read today's rules" for a published day's own checks — the later wins (D90). His
case: Ranger lands Monday 19:00, his day ending 21:00; Tuesday is published with him on VL, take-off 12:00, B 09:40,
12h40 of rest; on Wednesday the admin raises "Crew rest" on the Logic page from 12 to 13 hours — Tuesday stays clean.

The agent's readings in that row, NOT checked with him: a changed setting does not clear a flag on a published day
either; the working copy of a published day, once edited, is checked by today's settings; OIL and a changed "Full day
of OIL" is not covered (this build leaves OIL on today's settings).

D482 (1 Oct 26, settled): "A rule changed on the Logic page moves Insights' work hours at once, published days included."
The build keeps that for the hours only (`validate.ts hoursEvd`).

## The scope, as open questions — answer each with evidence

1. Does EVERY check of a published day read its kept settings — on the official pass (View-only Sched, the issued face,
   the print/CSV), and on the working pass (Edit Schedule, the Scheduler Board, the crew picker's struck names) while
   nothing waits on that day? Name any reader of a Logic setting (`VCONF.x`, `SHIFT_HARD`, `RULE_STD`, a helper that
   reads them) on a published day's path that is NOT inside the kept overlay.
2. Are there Logic settings a check reads that are NOT in `KEPT_RULE_KEYS` (`faceattrs.ts`), so a change to them still
   starts or clears a flag on a published day? Equally: is any key kept that should not be (one that changes OIL, the
   late cut-offs, the inputs)?
3. Cross-day rules (crew rest from the day before, the dotted "breaks tomorrow's crew rest" mark on the day before, days
   in a row, next week's Monday, last week's Sunday): the host's reading is "the day being judged decides". Is that
   applied consistently, and does any mark land on a day that the warning itself does not (an orphan ring or dash)?
4. When does a published day's working copy switch from its kept settings to today's (`validate.ts untouchedKept`,
   `weekctx.ts keepUntouchedRules`)? Is there an edit, a filing, a hide, an input change, a Load onto working copy, an
   Unpublish, a saved plan, an undo or redo, a week change or a reload after which the surfaces disagree with the
   promise (the face clean, the working copy red, or the reverse) where they should not?
5. Pending and sign-offs: a Logic change must neither make a published day pending nor fall its four sign-offs (only the
   printed brief lead reads pending, D186). Is there any route where it still does — or where a REAL change now fails to
   read pending because of the new comparison (`publish.ts warnDelta`)?
6. The overlay itself (`rules.ts withRuleVals`): can a thrown error, a nested call, a re-entrant validate, or an early
   return leave the Logic settings changed after the call? Is `ruleNow` right inside a nested overlay?
7. OIL: does anything OIL credits, shows or compares now change because of this build (it must not)? Insights' hours
   (D482) — do they still move at once on a published day for every setting that moves them?
8. Publishing and amendments: does a newly published version, an amendment (AL), an EOD, a Load onto working copy and an
   Unpublish keep and read the right settings? Does a version published before this build (no `rv`, or only
   `briefLead`) read today's for the rest?
9. Anything MISSING: a reader, a surface or an order of actions the build should cover and does not.

## The finder wording (from the bug-check order, verbatim)

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

## What is NOT a finding

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it. (D56)

And: a scheduler is always an admin (D785) — nothing about a scheduler who is not an admin is a finding. A member, a
guest and a person with no sign-in stay in scope.

## What to hand back

- Each finding: the concrete failure (setup, action, what the screen or the engine shows, what it should show and the
  ruling that says so), its cause (file and function), and EXACT step-by-step fix instructions. A claim without a
  concrete failure is not a finding (D489).
- Where you can run code: write each claim as a failing test before you report it. **Your proof tests go only in your
  own scratch folder named below — never under `raptor-port/src` or anywhere in the repo.** Where you cannot run code
  (Astra's sandbox is read-only), name the exact test or input you would run, and the host will run it.
- Explicit negatives: each question above you checked and found nothing in, said so.
- Rank by consequence: a published day that changes without an amendment, OIL, saved data, then the rest.
