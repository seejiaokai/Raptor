# RULES-FIRST red team — the reusable brief (read-only)

> **Reusable.** This is the standing third review, alongside the pre-build design red team and the
> post-build code inspection. Run it on any feature that has a set of owner rulings behind it.
> To reuse: swap the register path, the rules-of-record paths and the "already found" section for
> the feature at hand; everything else stands as written. First run: [S4-BUGHUNT], 20 Sep 26 —
> raised by the owner, who asked whether the bug checks should be red-teamed against the rulings
> rather than the code. They should. Two code inspections had missed a defect this sweep's first
> question finds immediately.
>
> **The three reviews and what each one catches**
> - *Design red team (before the build)* — is the plan right?
> - *Code inspection (after the build)* — does this code do what it says it does?
> - *Rules-first red team (this one)* — does the app do what the owner actually ruled?
>   Only this one catches a rule that has gone stale, or has quietly grown into a job a later
>   ruling took away from it. Code inspection cannot: the code is not wrong, the rule is.
>
> Its mechanical companion is `scripts/rulecheck.mjs` (`npm run rulecheck`), which fails when a
> ruling has no test naming it. The script catches "nothing is watching this rule"; this sweep
> catches "the code does not obey this rule". Different gaps — run both.

---

## The sweep

This is **not** a code inspection. Do not sweep files looking for defects. Work **ruling by ruling**,
in the order they are listed, and for each one answer a single question:

> **Where is this ruling implemented, and does the implementation match what the ruling says —
> no more and no less?**

Repo: `C:/Users/User/projects/Raptor`, app in `raptor-port/`. Branch `claude/s4-bughunt`.

## Why this sweep exists

Two full cross-provider CODE inspections and 5103 passing tests missed a real defect, because the
code was not wrong on its own terms. The build had taken one ruling (H2 — a medical cuts leave in
half-day steps) and used it for a second job that ruling never claimed (deciding whether a medical
and a leave clash at all), while a LATER ruling the same day (H3 as overruled — overlap is judged on
real times) governed that second job. The code carried a comment citing H2, so it read as a
deliberate, documented decision. Nothing went red because no test named either ruling.

The failure mode you are hunting is therefore **not** "this code is buggy". It is one of these four:

- **STALE** — the code implements an earlier ruling that a later one replaced or narrowed.
- **OVERREACH** — a rule is correctly implemented for its own job, but is also being used for a
  second job it never claimed (this is the one that got through).
- **MISSING** — the ruling is not implemented anywhere; nothing does this.
- **DRIFT** — implemented, but in a way that disagrees with the ruling in some case (name the case).

## Read these, in order

1. `raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md`
   — **the register**: every behaviour the owner ruled, in plain words, with its id. This is your
   worklist. Work through it section by section.
2. `raptor-port/docs/superpowers/specs/2026-09-20-arch-stack-4-clash-check.md`
   — the rules of record in their original wording (B1–B9, H1–H6, owner answers A–D). Where the
   register and this disagree in NUANCE, the original wording wins and that disagreement is itself a
   finding.
3. `raptor-port/docs/superpowers/specs/2026-09-19-arch-stack-4-clash-catalogue.md`
   — the owner rule and answers Q1–Q15, and the main-code ladder.
4. Then the code, led by the ruling you are checking — not by the file.

Useful entry points: `raptor-port/src/leavewar/` (`absences.ts`, `inputgate.ts`, `sync.ts`,
`warrecs.ts`, `engine/dayview.ts`, `engine/charge.ts`, `engine/counters.ts`, `engine/oiltracker.ts`,
`ui/`), `raptor-port/src/state/`, `raptor-port/src/ui/`.

## The one already found — do not re-report it, use it as the pattern

Section 7 of the register (medical times, 20 Sep 26) is the defect described above. It is FIXED on
this branch: a medical now carries its six-hour half in `win` for the box, manning and the medical
total, and its real hours in `wins` for every clash and every bid replacement. Read the fix, satisfy
yourself it is complete, and say so if it is not — but the finding itself is spent. It is here as the
shape of what you are looking for elsewhere.

## Pay particular attention to

- **Pairs of rulings that share a subject.** H2 and H3 shared "medical vs leave" and one grew into
  the other's job. Look for other pairs: B4 and B8 (credits and times), H1 and answer A and B5 (what
  replaces a bid), H4 and Q13 (the 15-day run), Q9 and answer C (posting dates), B3 and B9 (side by
  side vs the ladder), H6 and B1 (overnight tails and several records).
- **Rulings the owner CHANGED.** Q8, Q9 and H3 were changed or overruled after a first answer, and
  answer C changed again on 20 Sep. Each is a place where the earlier reading may survive somewhere.
- **The six rulings NO test names** — B8, Q9, Q11, Q12, Q14, Q15. Nothing would go red if these were
  wrong. Check each by reading, not by trusting.
- **Words in the rulings that constrain scope**: "only", "never", "in the same command", "whole",
  "once", "real times", "half-day steps". A missing "only" is an overreach.

## Output

A markdown list. One entry per finding, most serious first:

- **Ruling id and its words** (quote the clause at issue)
- **Kind**: STALE / OVERREACH / MISSING / DRIFT
- **Where**: the file and function that implements it, or "nowhere"
- **What it does instead**, and the exact case where that differs from the ruling — a concrete
  person / date / times / records setup, not a generality
- **Consequence**: what a user sees or loses
- **Confidence**: high / medium / low, and what would settle it

Then a short table: every ruling id in the register, with one of `MATCHES` / `STALE` / `OVERREACH` /
`MISSING` / `DRIFT` / `UNCLEAR`. Every id must appear. A ruling you checked and found correct is a
result worth reporting — say `MATCHES` and move on.

Read-only: change no file, run no build, write no test.
