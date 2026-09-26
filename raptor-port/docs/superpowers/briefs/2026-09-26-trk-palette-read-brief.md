# Read brief — the Tracker in Raptor's colours (`[TRK-PALETTE-ASK]`, D157), 26 Sep 26

You are reading a finished change on branch `claude/tracker-palette` (uncommitted working tree in this repo). You did
NOT write it. Read-only: change nothing.

## The promise
The owner ruled (D157, 24 Sep 26, "7 c"): **the Tracker tab takes Raptor's colours FULLY — backgrounds, text AND the
event colours** (flight, academic, test, sim, device, marginal and fail in Raptor's tones; sim turns from yellow to
amber). He chose it from a picture of the real chart ("C"); the build reproduces that picture's exact colours and
extends them to the literal copies of the old palette the picture's CSS override could not reach.

Read, by path (they load nothing by themselves for you):
- the ruling and the Tracker's architecture: `.claude/rules/decisions/tracker.md` (D157; §Architecture — the standalone
  rule, the three seams); `.claude/rules/raptor-executor.md`
- the evidence sheet — **the roll-call is §4, the colour map §3, what was not walked §8**:
  `raptor-port/docs/handpass/2026-09-26-trk-palette.md`
- the change: `git diff main -- raptor-port/src raptor-port/scripts/tracker raptor-port/docs/ui-contracts.md`, plus the
  new files `raptor-port/src/tracker/trk-palette.test.ts`, `raptor-port/scripts/handpass/trk-palette-walk.mjs`,
  `raptor-port/scripts/handpass/trk-palette-breaks.mjs`
- Raptor's tokens: `raptor-port/src/ui/scheduler.css` (the first `:root{…}` block)

## The job — find what is MISSING, not only what is wrong
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign should exist in the production app. Then rank concrete failure scenarios with setup, action,
expected result, and the observation that would disprove correctness. Start with the least-shared or most specialised
surface.

Concretely, for this change:
1. **Every place the Tracker paints a colour** — CSS rules, inline styles in the JSX, HTML/SVG strings built in
   `app/core.js` (grep beyond the obvious: info bubbles, cards, flex bars, calendars, chips, key ball, number badges,
   markers, handles, anything built with `innerHTML`). Is any place missing from the roll-call (§4)? Is any old Tracker
   colour still painted that is a copy or tint of one the ruling moved (the retired list is in `trk-palette.test.ts`)?
   Is anything kept as "the Tracker's own" (§3) that D157's "fully" should have moved?
2. **Names that do not resolve.** The Tracker's colour names are set on `#page-tracker` only. Anything drawn OUTSIDE
   that element (appended to `<body>`, a portal, a native control, the details bubble) that names a Tracker-only
   colour renders the browser's fallback. Anything that names a Raptor-only colour breaks the standalone app.
3. **Engines.** SVG presentation attributes carrying `rgba(…)`; CSS nesting; `linear-gradient(var(),var()) var()`;
   iOS Safari (he uses an iPhone). Say what only a real device can prove.
4. **Reading at a glance** (D157 asks that the chart still reads at a glance on a phone): any two marks that now
   collide in colour — a ring, a tick, a fill, a badge — where before they did not.
5. **The tests.** Can any check in `trk-palette.test.ts`, the smoke suite's changed checks
   (`scripts/tracker/smoke.mjs` — search for `ftick`, `3BC6E8`, `3bc6e8`) or the walk script pass while the thing it
   names is broken (a vacuous pass)? Any wired place with no break test?

## What is NOT a finding (owner, D56)
This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it. (Colours are not stored, so this
should rarely arise.)
Also not findings: the four pre-existing items the sheet already disposes (§7 F1–F6) unless you think a disposition is
wrong — then say why.

## What to hand back
- Findings ranked by severity, each with: the file and line, the setup → action → what the screen shows → what it
  should show, whether it is new with this change or already on `main` (check `git show main:<path>`), and **exact,
  step-by-step fix instructions**, not a direction.
- **Explicit negatives**: "I checked X and found nothing" for each of the five areas above.
- Plain words. Under 1,200 words.
