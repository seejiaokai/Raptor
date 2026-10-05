# An independent read of three small fixes — the Insights fixes of 3 Oct 26 (D534, D536, D538) — 6 Oct 26

*(The same brief, word for word, goes to three reviewers who work apart and never see each other's reports — the one
side-by-side the owner asked for in D590. The host of the check keeps the reports apart until all three exist.)*

**You did not write this code. Opus 5.5 did, on 3 Oct 26.** Work READ-ONLY: change nothing, run no build and no test
suite. Your final message is your report, in the format at the foot.

## Where you are, and what not to open

You are in a checkout of the repository **frozen at commit `9e8ed334`** — the tree exactly as it stood after the third
of the three commits below. Read only inside this checkout, and only this history (`git log`, `git show` up to
`9e8ed334`). Do not look for other checkouts, later branches or other reviewers' reports: later work exists and would
tell you what others found.

## The three commits (read each: `git show <sha>` — its code, its tests, its own words)

| Commit | What it set out to fix |
|---|---|
| `51f5ec51` | The three findings of an interim read of the Insights "mission mix" build (owner's ruling D534): **F1** — on the Scheduler Board, looking at the latest published version, the read-only Remarks door of a formation that asks Blue/Red lost its "changed at AL" mark; **F2** (ruling D535) — an open Blue/Red question vanished after any other edit on the same day, and must now stay until Blue, Red or Later is pressed, the formation's own Mission or cue wording changes, the formation goes, or he moves to another day, week, version or sign-in; **F3** — a Blue/Red answer copied by a day template was named in the change history by the line's hidden id instead of its formation. |
| `5b2299c5` | The owner's own find on his phone (D536): the Insights window's top was cut off on a phone. |
| `9e8ed334` | Two more of his finds: on a phone a tall pop-up window left a large gap above it (D537 — it now runs up to a thin strip at the top of the visible screen; a short window stays as tall as its content, at the bottom); and a window closed when a press that began inside it was dragged out and released on the dark surround (D538 — "a window closes on its surround only when the press began on the surround"). |

The app code they touch: `raptor-port/src/ui/mission-role-offer.ts`, `src/state/mission-roles.ts`,
`src/state/changelines.ts`, `src/ui/board.ts`, `src/ui/outside.ts` and every window that calls it, the stylesheet's
window rules, and their tests (`src/ui/mission-role-interim-fixes.test.tsx`, `src/ui/outside.test.tsx`,
`e2e/insights.spec.ts`). The feature they sit on (built by another model, not under review here except where these
fixes meet it): the Blue/Red question and the "Choose / Change mission role" button — `docs/ui-contracts.md` (search
"mission role"), `docs/superpowers/specs/2026-10-03-insights-mission-mix.md`.

## The owner's rulings these fixes must keep

Each ruling is one line in `.claude/rules/decisions/scheduler.md` and `how-we-work.md`; its full row (his words, the
readings) is in `.claude/decisions-full/` — `grep -h '^| D535 |' .claude/decisions-full/*.md`, any number. Read the
full rows of **D523, D525, D527, D529, D530, D534, D535, D536, D537, D538** before judging.

Why this is high-consequence work: a Blue/Red answer counts in Insights at once **on a published day too**, with no
amendment and the four sign-offs untouched (D530); F1 is about what a published version shows.

## How to read (the project's standing wording — follow it)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

A claim is a finding only with a concrete failure (exact steps a person can do in the app), its cause in the code
(file and line), and its fix. For each finding say whether these commits introduced it, made an older fault reachable,
or left a gap in what they set out to cover (`git show <sha>^:<path>` shows the file before a commit). Give **exact,
step-by-step fix instructions**, not a direction. Give **explicit negatives** — "I checked X and found nothing" — for
everything you looked at and found sound.

## Your report (your final message; at most about 1,500 words)

1. **Findings**, most serious first — for each: a one-line title · the steps · what the ruling says should happen ·
   what the code does (file:line) · introduced / made reachable / a gap in coverage · the fix, step by step.
2. **Explicit negatives** — what you checked and found sound, one line each.
3. **What you did not read, and why.**
4. One line: how sure you are that nothing serious is left in these three commits, and what would change your mind.
