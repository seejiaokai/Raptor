# The four readers' SECOND pass — Codex's code, with the walk in hand — 6 Oct 26

*(One brief for four readers, each with its own piece: AB, C, D1 or D2 — your piece is in the message that gave you
this brief. Work apart: do not open another piece's reports.)*

You are reading code **Codex wrote** (2–5 Oct 26), as the reviewer who did not write it (D67). A first reader of your
piece read it BEFORE the app was walked and wrote a roll-call and a list of leads — `raptor-port/docs/handpass/parts/
stack-read-<PIECE>.md`. Since then the running app was walked twice and a round of fixes was built by Opus. This pass
is the read the project's bug-check order asks for AFTER the walk: **with the evidence in hand, read for what is
ABSENT.** Work READ-ONLY: change nothing, run no build, no test suite, no server; `git show` / `git diff` / `git log`
only to read.

## Read first, in this order

1. The first pass for your piece: `raptor-port/docs/handpass/parts/stack-read-<PIECE>.md` — whole. Its §1 roll-call
   and §2 doors are YOUR list of surfaces; its §4 leads were all walked; its §5 negatives say what was already checked.
2. The evidence sheet: `raptor-port/docs/handpass/2026-10-05-codex-stack-check.md` — §1, §5.2 (the findings W1–W19),
   §5.3 (what was done about each), §5.5 (the re-walk), §5.6 (what two outside reviewers then found in the fixes), §6.
3. The cross-reference of every roll-call row against the walks, if it exists when you start:
   `raptor-port/docs/handpass/parts/stk-rollcall-marks.md` — your piece's tables, and its list of UNWALKED rows.
   (Made by a helper from the tables; treat a mark as a pointer, and check the walker's own row —
   `parts/stk-<letter>.md`, `parts/stk2-<letter>.md` — before leaning on it.)
4. The code of your piece as it stands NOW on this branch (the first pass names the files), and
   `git diff bcc69fc8 HEAD -- raptor-port/src` restricted to your piece's files — what the fix rounds changed in it.

## What to answer — three questions, in this order

**A. Absences.** For every row of your roll-call that the walks did NOT cover, or covered only in passing: read the
code for that surface and say, row by row, either "read: sound, because …" (one line) or a finding. Then ask of the
roll-call itself: is there a place the app draws your piece's thing, or a door for it, that the first pass's roll-call
does not list at all? (Search the callers again; the first pass may have missed a renderer — a print view, an export,
the next-week peek, a published look, the phone layout, a member's or guest's view.)

**B. Siblings.** Each finding the walk made in your piece is one instance of a KIND of fault — a wording changed in
some places and not others; a record keyed by something that does not persist; a handler that returns before it looks;
a check that asks one spelling and misses another; a redraw held while the caret is in text; a figure worked out from
a value that can be not-a-number. For each such kind found in your piece (§5.2, §5.6), search your piece for ANOTHER
instance that nobody walked. Name it with its file and line, or say "searched <how>: none".

**C. The fixes in your piece.** Where a fix commit changed a file of your piece, read the change as the person who
knows that piece best: does it break anything the piece relied on? (Two outside reviewers have read the fixes as code;
you are asked only for what someone who knows the piece's own invariants would see.)

## The project's standing wording — follow it

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward.** If the app would do it again to NEW data, report it.

A claim is a finding only with a concrete failure (exact steps a person can do in the app), its cause (file and
line), whether it is the same on `main` (`git show de470db5:<path>`), and its fix, step by step. The owner's rulings:
one line each in `.claude/rules/decisions/*.md`; a full row by `grep -h '^| D535 |' .claude/decisions-full/*.md`.
Already filed, not to be re-reported: everything in the sheet's §5.2–§5.6 and §12's "Questions waiting for him".

## Your report — your final message, at most about 1,200 words; also write it to `raptor-port/docs/handpass/parts/stack-read2-<PIECE>.md`

1. **Findings**, most serious first (steps · expected, with the ruling · what the code does, file:line · on `main`? ·
   the fix, step by step) — or "No finding."
2. **A — absences:** one line per unwalked or thinly walked row: sound because … / finding n.
3. **B — siblings:** one line per kind: another instance at … / searched, none.
4. **C — the fixes in your piece:** one line per changed file.
5. **What you did not read, and why.** One line: how sure you are, and what would change your mind.
