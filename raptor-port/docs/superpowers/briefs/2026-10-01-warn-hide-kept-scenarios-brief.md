# Scenario-design brief — [WARN-HIDE-KEPT] hidden warnings (D469, D471, D472, D475) — the FULL check — 1 Oct 26

You are designing TEST SCENARIOS for a walk of the running app. You are not reviewing code for style and you are not
asked whether the code is "clean". Work READ-ONLY. Report as your final message, in the format at the foot.

**The build** is on branch `claude/warn-hide-kept` (commit 12e892c2), under `raptor-port/src`. **What it promises** is the
plan `raptor-port/docs/superpowers/plans/2026-10-01-warn-hide-kept-plan.md` (§1 the rulings in one place, §3 the design,
§5 the roll-call of every reader, §10 what is left as it is), the register
`raptor-port/docs/superpowers/specs/2026-10-01-warn-hide-behaviour-register.md` (WH1–WH13), the screen contract
`raptor-port/docs/ui-contracts.md` §Muting a check ("Hide a specific warning"), and the picture he approved
`raptor-port/docs/mock/warn-hide.html`. The plan's red team and what was done about each finding:
`raptor-port/docs/superpowers/briefs/2026-10-01-warn-hide-kept-dispositions-r1.md`.
**The owner's rulings**, from the live files: `.claude/rules/decisions/scheduler.md` (one line each) and the full rows in
`.claude/decisions-full/scheduler.md` — `grep -h '^| D469 |' .claude/decisions-full/*.md` (D469, D471, D472, D475; and
D45, D97, D98, D99, D101, D103, D148, D168, D179, D183–D185, D187, D188, D346). Also `.claude/rules/decisions/how-we-work.md`
(D56) and `raptor-port/docs/bug-check-order.md` §2b, §6, §7.

**In one paragraph, what the app should now do.** A scheduler taps ✕ on one line of a day's issues list (Edit Schedule's
day list, or the Scheduler Board's panel). That warning is then hidden — for everyone, across a reload and a sign-in —
until someone taps ↺ on it. While hidden: the pucks carry no flag for that item (no ring, chip, dashed ring, dotted
"breaks tomorrow" mark, nor the red time box of a nought-minute line); its line stays where it is in the list, struck
out and darker; it is not counted ("4 issues" reads "3 issues", and the count line says nothing about a hidden one);
with every issue of a day hidden a quiet "✓ No issues" bar still opens the list. View-only Sched and a look at a
version show the struck line with no button. It comes back by itself when the situation changes. On a day ALREADY
PUBLISHED the hide waits for the next amendment: one pending change, the four sign-offs fall, the published face keeps
the flag until the amendment is out; each version keeps the hides it went out with.

## What to do

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

Aim for 30–45 scenarios a person (or a scripted browser) can carry out through the app's OWN controls, each one
checkable on screen. Cover, at least: every KIND of warning (a clash, a crew-rest breach with its dotted mark on the day
before, a tight turn, a double-turn line naming several men, a crew-pairing warning naming two men, a qualification
flag, the long day, a line with no man in it such as the nought-minute line or the OIL reminder); every PLACE a man's
puck is drawn (flying seats, an exempt SC / AVALON / BB line, duty desks incl. an exempt one, sims, ground and Common
Programme rows and their extras, the crew list beside the week and the board, the Available-crew grid, SANS cards, the
Unavailable block, the ALL AVAIL window); every LIST and COUNT (the two lists, the day popup ⓘ, Insights, the "also
flagged on" line, the puck-tap that opens a man's flagged days, the drop message); both WIDTHS; every ROLE (scheduler,
member, guest, the admin in his member view); every ORDER across the publish line (hide → publish; publish → hide →
amend; hide → publish → flag again → amend; Unpublish; Load onto working copy of the current and of an older version; a
look at an older version; a saved plan switched in and out; a day template); Undo / Redo, incl. after another person's
change; a reload and a second sign-in at each stage; a second week and the week's edge (Sunday → next Monday, both
directions, draft and published); a rename of a man named in a hidden warning; the situation changing and changing
back; two schedulers (one hides, the other flags again); and the things that must NOT change (the published face before
the amendment, the Logic page's "fired N×", print and CSV, the Leave War, OIL).

**And this, in the same breath — WHAT IS NOT A FINDING (owner, D56):**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

## How to report

- A numbered list, most likely to fail FIRST. Each: a one-line title; the surface and the rule it tests (WH id or D
  number); SETUP (in the app's own words — which day, which line, which button); ACTION; EXPECTED (what the screen
  says); and THE OBSERVATION THAT WOULD DISPROVE IT.
- Then: any place you believe the build is MISSING a call site, with the file and function, and how a person would see it.
- Then: explicit negatives — surfaces you checked and believe are wired.
