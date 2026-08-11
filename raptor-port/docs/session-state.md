# Session handoff — the AVALON rule is specified and commissioned, not built

## Where it started

Fifteen owner changes to the board and duties (shipped), the perf gate's
timing budgets removed (shipped), and process rules tightened (shipped). The
session then turned to the AVALON spare rule the owner had reserved for
himself since 5 Aug. **He specified it in full on 11 Aug 26, and added a
second, larger requirement on top.** Nothing of that last piece is built. He
asked to move to a fresh session before it started.

## Shipped

- Board and duties, fifteen changes — PR #144, merged, deploy green,
  live-verified in a browser.
- Perf gate: the three per-node timing budgets stop being assertions —
  PR #143, merged, deploy green.
- SC brings its own duty blocks — PR #142, merged, live-verified. **Partly
  superseded the same day by #144**, which moved SC's duties to `+ Block`.
- Working rules: ship once per session; don't re-run the full gate set
  between sub-changes; `/brainstorming` is usually the wrong tool — PR #145,
  merged.
- Handoff pass: three docs the session's own changes had made stale —
  PR #146, merged.

## Unfinished

**THE AVALON RULE + THE GENERAL MIDNIGHT TAIL. Specified, owner-confirmed,
zero code written.** This is the whole of the unfinished work.

The owner's own words, and the wording he confirmed when it was read back:

> **Jet seats (MAIN and SPARE).** Plannable if he is on the island and not
> medically down. Local leave, off in lieu, childcare, a course, an
> appointment — fine, plant him, nothing raised. Overseas leave, overseas
> duty, hospitalisation, medical leave, ATT B and ATT C — **red conflict**.
> ATT B is barred here because it means no flying, and these are jet seats.
>
> **Duty roles (SXO, OPS O, RUNNER, LOG CELL).** Same, except **ATT B is
> allowed** — he cannot fly but he can man a desk. So only overseas,
> hospitalisation, medical leave and ATT C raise a red conflict.
>
> **It warns, it does not block.** He still shows in the crew list. Plant him
> and the red conflict appears in the day's warnings.
>
> **The overnight tail.** An AVALON shift runs 19:00–07:00, so the part after
> midnight belongs to TOMORROW. The evening half is judged against today's
> inputs, the morning half against tomorrow's. A man fine tonight but
> overseas from tomorrow, or unavailable at 05:00 tomorrow, raises it.
>
> Everything else about AVALON is unchanged — still outside the flying count,
> still nothing else cross-checked. This gives it one check where it has none.

**And then the larger ask** (verbatim): *"I want u to make sure the default
warning engine also checks in the same modality for all applicable rules
based on timing. So this doesn't gets overlooked."*

So the tail is NOT an AVALON special case. Every timed check must judge the
part of a window that runs past midnight against the NEXT day's inputs:
a night sortie landing 00:30, its debrief tail, an overnight duty row typed
1900–0700, a brief that starts before midnight for a sortie after it.

### The predicates already exist — do not write new ones

`engine/inputs.ts` already carries exactly the two tests this needs, and
`canSpare`'s comment says in terms that it was written so the AVALON rule
"drops in without re-cutting":

- **Jet seats** = `canSpare(type)` — `local && grp!=='med'`. Barred: OL, OD,
  HL, OML, ATT B, ATT C. Correct as-is, no change.
- **Duty rows** = `canSpare(type) || canWork(type)`. `canWork` is `m.work`,
  true for **ATT B only**, which is precisely the carve-out he asked for.

Overseas is exactly two types, both `local:false`: **OL** (overseas leave)
and **OD** (overseas duty). Everything else in `INPUT_META` is local.

### The implementation shape found this session (verified by reading, not run)

- `events.ts:166` builds each day's `input` array from inputs covering THAT
  DATE only, times clamped 0–1439.
- **Four** sites consume it, all `day.input.forEach`:
  `validate.ts:170`, `:204`, `:226`, `:535`.
- So the cheapest correct fix is at the GATHER site, not per rule: append the
  NEXT day's inputs with `s`/`e` shifted `+1440`. `time.ts`'s `win()` already
  rolls a midnight-crossing end past 1440, so both sides land in the same
  minute-space and all four sites inherit the fix with no edit. A rule added
  later inherits it too.
- Watch `validate.ts:226` — `timedInput` filters `i.e-i.s<1439` to drop
  all-day inputs. A shifted all-day input is 1440→2879, difference still
  1439, so it is filtered out identically. Confirm, don't assume.
- **AVALON is `noconf` today** (`saExempt` returns true for the whole wave,
  `events.ts` line ~31 skips the formation outright). The new check has to
  reach it WITHOUT undoing that exemption — it is one check on a wave that is
  otherwise wholly uncrosschecked. This is the main design decision left.
- **The AVALON duty block is created `noconf:true`** as well
  (`waves.ts:waveDutyBlock`), and `events.ts:151` skips `dw.noconf` rows. Same
  problem, same decision.
- The PALETTE side (`avail.ts` — `dayOff`/`dayAway`/`slotBar`) reads `INPUTS`
  directly, not `day.input`. `HANDOFF.md` is explicit: fix the picker and the
  warning list TOGETHER or neither, or the two disagree.

### Expected consequences, both told to the owner in advance

1. **New warnings will appear on the demo week.** That is the point — they
   were being missed — but the count moves, and he asked to be shown exactly
   what appeared and where BEFORE it ships.
2. **This diverges from `reference/`**, which does not do it either. Needs a
   `testing/refwin.ts` patch or the byte-exact parity gate goes red.

### How he asked for it to be built

Agreed process for rule work this session, in place of the heavy path:
write the rule back in plain English and have him confirm (**done — the
block-quote above IS that, and he confirmed it**), then **test first** (a case
that should flag and currently does not, plus cases that must stay quiet),
then build, then **report what moved on the demo week**, then record it in
`docs/engine-rules.md`. No implementation-plan document.

## Branch state

- Designated branch: `claude/handoff-review-erjfvb`
- Its PR is **merged** (#146 was the last).
- The next session MUST reset before starting new work, or it stacks commits
  onto already-merged history:
  `git fetch origin main && git checkout -B claude/handoff-review-erjfvb origin/main`

## Gates

- `npm test` 940/940 across 52 files · `npm run build` clean ·
  `node reference/tfin.js` 728/0 · `npm run test:e2e` 64/64 — all green, run
  first-hand this session.
- `npm run probes:adapted` 6/6 · `npm run perf` 4/0 — green, run first-hand.
  Only PR #146 (docs-only) shipped without re-running them, deliberately:
  markdown no code imports, and the new rule says not to re-run for that.
- Run from `raptor-port/`, not the repo root. A fresh container needs
  `npm ci` first.

## Open questions

- **The midnight split point was STATED, not explicitly confirmed.** The
  owner was told "19:00–23:59 checked against today, 00:00–07:00 against
  tomorrow — not the whole shift against both days" and replied "Ok" while
  adding the generalisation. Treat as agreed; re-confirm only if the
  implementation makes a different split obviously better.
- **BB is unspecified.** He named AVALON jet seats, AVALON duty roles, and
  "all applicable rules based on timing". BB is `noconf` with no fixed hours.
  Ask before extending the AVALON bar to it; the timing generalisation
  reaches it anyway once BB has typed times.

## Pick up here

Reset the branch, then build the AVALON rule and the general midnight tail as
one job — the tail is the larger half and `HANDOFF.md` requires the picker
(`avail.ts`) and the warning list (`events.ts`/`validate.ts`) to change
together. Start with the failing test.
