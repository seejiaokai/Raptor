# Brief — read the proposed walk-sizing wording (`[WALK-SIZING-GUIDE]`, D607) — one round, independent

Written 7 Oct 26 by the host (Opus 5.5), who also wrote the draft — so you are not its writer (D70, D590). You are
ONE of two readers (Astra, Sol 6.1). Read alone: do not look for, open or rely on the other reader's report.
**Read-only: change no file.** Your whole output is your report.

## What you are reading

A proposed change to a working guide — nothing has been put in yet:

- **The draft:** `raptor-port/docs/superpowers/specs/2026-10-07-walk-sizing-guide-wording.md` — eleven "now →
  proposed" edits to the checking guide, its reasons, what it deliberately leaves out, two points parked for the owner.

Read these whole before judging it (none of this loads for you by itself):

- **The ruling it words:** D607's FULL row — `grep -h '^| D607 |' .claude/decisions-full/*.md` — and its short line
  in `.claude/rules/decisions/how-we-work.md`.
- **The rulings it must not weaken** (full rows, same grep): D5 (driving the app IS the bug test), D7, D9, D16 (a long
  pass is fanned out), D588 (who walks), D56 (what is not a finding), D138 (a summary never changes the meaning),
  D141 (no size targets), D596 (unattended runs).
- **The guide it changes:** `raptor-port/docs/bug-check-order.md` — all of it, and `.claude/rules/bug-check.md`.
- **The step and the record it points at:** `raptor-port/docs/walk-ledger.md` — the sizing step, the types of
  change, the record of past walks and "The figures".

## What to find

1. **Does the wording rule what D607 rules — no more, no less?** Name any sentence that decides something the owner
   did not (look hard at the floor in the proposed §7.0, and at anything that reads as "this type of change gets
   this walk" — D607's reading (4) says that is NOT ruled).
2. **Can it be used to skip a walk the order requires?** Build concrete cases: a change, and the reading of the
   proposed words under which an agent under pressure shrinks or drops a walk that D5 and the order need. The
   failure this guide exists to stop is a screen nobody wired up reaching the owner behind a code review and green
   tests (the guide's §1).
3. **The opposite: what still walks by habit?** Read for ABSENCE. Which sentences — in `bug-check-order.md`, in
   `.claude/rules/bug-check.md`, or in any other guide a chat follows (`raptor-port/docs/guide-full.md`,
   `raptor-port/CLAUDE.md`, `.claude/rules/raptor-executor.md`, `.claude/skills/session-handoff/SKILL.md`,
   `AGENTS.md`, `raptor-port/docs/codex-review-workflow.md`) — would still tell an agent to run "the full walk" or a
   fixed number of walkers after these eleven edits, and are missing from the draft?
4. **Does it hold together?** The new §7.0 against §7.3, §7.4, §7.5, §9's `Walk:` line, §12's checklist, the tier
   table and "Order of steps in FULL". Name any pair of sentences that would then contradict each other.
5. **The ledger's sizing step and its types of change** (marked there as the agent's first draft): is a type of
   change missing, or a "where a walk has something to find" cell wrong, judged against the record's own rows?
6. **"The figures" in the ledger:** does any sentence there claim more than the rows below it show? Check three
   figures of your choosing against the rows, and two rows of your choosing against their evidence sheets
   (`raptor-port/docs/handpass/`).
7. **D138:** D607's short line against its full row — does the short line lose a condition, or add one?

## What is NOT a finding

- A matter of taste in the wording, or a different way to say the same thing.
- A claim with no concrete case. A finding needs: the sentence, the concrete situation in which it fails, why, and
  the exact replacement wording (D489).
- A problem that lives only in data already stored (D56) — not relevant here, said for completeness.
- The two points the draft parks for the owner — unless you think the draft's recommended answer is wrong; then say
  why.

## Your report

- First line: **PASS** or **CHANGES REQUIRED**.
- Findings numbered, most serious first; each: where (file and the draft's edit number or the guide's section) · the
  concrete case · why it fails · the exact wording to use instead.
- Then: what you read whole, what you sampled, what you did not read.
- Plain words; no praise; nothing about style.
