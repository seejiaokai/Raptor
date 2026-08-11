# Session handoff — AVALON + midnight tail BUILT and green, awaiting the owner's go to ship

## What happened this session

The previous session's whole unfinished item — the AVALON rule and the
general midnight tail, owner-specified 11 Aug 26 — was built as one change,
test-first, exactly to the owner-confirmed spec that stood in this file.
Nothing was merged to main. Everything sits on branch
`claude/avalon-rule-build-4ahcpc`, pushed.

## Built (done, reviewed, not yet merged)

- Engine: `collectEvents` appends tomorrow's inputs shifted +1440 (marked
  `nx`) so every `day.input` consumer judges past-midnight tails against the
  next day; AVALON crew collected as `day.sacrew` (jets `work:false`, desk
  `work:true`) and checked in one validator loop (canSpare, canWork
  carve-out); `slotBar`/`slotRules` mirror both (avJet/avDuty + the
  "(tomorrow)" tail bar). Rules recorded in `docs/engine-rules.md`
  §Validation ("AVALON's one check", "The midnight tail"); Logic-tab AVALON
  entry rewritten; HANDOFF trued in the same commits.
- 22 new tests in `src/engine/overnight.test.ts` (13 failed before the
  code); parity's collectEvents comparison excises `nx`/`sacrew` (the
  stripKeys idiom), pinned positively in the same suite.
- **Every gate green first-hand on this code**: 962/53 vitest · build clean ·
  728/0 reference · 64/64 e2e · 6/6 probes:adapted · 4/0 perf. Live-verified
  in the production bundle: an AVALON man with OL tomorrow raises the red
  "OL but on AVALON NIGHT — overseas" in Monday's warning list, and the
  picker folds him with "overseas leave (OL) … (tomorrow)". Screenshot went
  to the owner.
- **Nothing moved on the demo week** — no seeded row crosses midnight and no
  standalone wave is seeded; the parity gate (WARN byte-identical to the
  unchanged reference Mon–Fri, weekend pinned empty) is the first-hand proof.

## Why it is not merged

The owner's own precondition (11 Aug): show him what appeared on the demo
week BEFORE it ships. That report — "nothing on the demo week; here is what
fires the moment AVALON or an overnight row is used, with the screenshot" —
went to him at the end of this session. The merge waits on his word. When he
gives it: PR from `claude/avalon-rule-build-4ahcpc` into main, the ordinary
gated deploy, then the live-page check per `CLAUDE.md` §Build & verify.

## Open questions

- **BB is unspecified** (also in HANDOFF's known-issues list). Nothing on BB
  is checked; ask the owner before extending the AVALON bar to it.
- The loaded week's last day has no next day, so its overnight tail is
  unchecked — noted in HANDOFF, fixes itself when the app carries more than
  one week.
