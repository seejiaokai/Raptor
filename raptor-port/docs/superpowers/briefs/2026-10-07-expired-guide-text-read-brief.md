# Brief — read the proposal to move expired text out of the working guides (`[START-CONTEXT-AUDIT]` options 5 and 6, D609) — one round, independent

Written 7 Oct 26 by the host (Opus 5.5), who also wrote the proposal — you are not its writer (D70, D590). You are
ONE of two readers (Astra, Sol 6.1). Read alone: do not look for, open or rely on the other reader's report.
**Read-only: change no file.** Your whole output is your report.

## What you are reading

- **The proposal:** `raptor-port/docs/superpowers/specs/2026-10-07-expired-guide-text.md` — five edits (a new
  `AGENTS.md`; three "until Monday 5 Oct" banners out; the Codex review guide's ended section out; three paragraphs of
  spent trials out of the checking guide with one passage replaced; one spent sentence out of three short rulings),
  and a note on why option 7 is not proposed. Nothing in it has been applied: the files it names are as they stand.

Read these whole before judging it:

- The files it changes, as they stand today: `AGENTS.md`; `raptor-port/docs/codex-review-workflow.md`;
  `raptor-port/docs/bug-check-order.md` (its head and §4); the head of `raptor-port/CLAUDE.md` and of
  `raptor-port/docs/guide-full.md`; `.claude/rules/decisions/how-we-work.md`.
- The rulings it rests on — full rows (`grep -h '^| D67 |' .claude/decisions-full/*.md`, and the same for each): D67,
  D70, D353, D499, D588, D590, D595, D596, D601, D608, D609, D610, D611, D138, D201, D136. The rulings archived as
  spent the same day are in `DECISIONS-ARCHIVE.md` (search `SPENT` with `Oct 26`): D494, D496, D508, D476, D480, D589,
  D604 and the rest.
- What was done under D609 before this proposal: `HANDOFF.md` (the block of `claude/docs-tidy-7-oct`), and
  `raptor-port/docs/superpowers/specs/2026-10-07-start-context-audit.md`.

## What to find

1. **Is anything LIVE lost?** For each passage the proposal moves out (the present `AGENTS.md` whole; the three
   banners; the Codex review guide's first section; the three trial paragraphs), name any sentence in it that is still
   a rule in force and is not carried — in the same or stricter words — by what the proposal leaves or by a live
   ruling it cites. Look hardest at the present `AGENTS.md`'s "Hard limits", "What Claude gets from its hooks" and
   "When you stop", and at the Codex review guide's paragraph on review rounds.
2. **Does the new `AGENTS.md` say what is true today?** Check every sentence of the proposed text against the live
   rulings (who plans, builds and reviews — D67, D590, D601; Codex builds only on his word; the calendar on hold —
   D610; the numbering; the branches; the sizing step — D608). Name any sentence that states something no ruling or
   guide supports, or that contradicts one. It must serve Codex both as reviewer (the usual job) and as builder when
   he calls for it.
3. **The replaced passage in the checking guide's §4** (edit 4): are the three conditions quoted faithfully from
   `raptor-port/docs/handpass/2026-10-05-codex-stack-check.md` §11 and
   `raptor-port/docs/handpass/parts/stk-trial-1.md`? Does the new passage say anything D595 or D588 does not?
4. **The three short lines** (edit 5) — D138: is the dropped sentence really spent (find where the read it calls
   "owed" was paid), and does each line still state its ruling whole?
5. **The 28 rulings archived as SPENT or REPLACED on 7 Oct 26** — sample at least eight of them in
   `DECISIONS-ARCHIVE.md`, among them D589, D496, D494, D465 and D480: does any still carry a clause in force that no
   live ruling now states? (D589's clause on the SANS calendar is meant to be carried by D610; D465's on the IT side's
   answer by D466; D476's and D480's on cheaper models by D588 and D595.)
6. **The short lines of D608, D609, D610 and D611** (written by the host on 7 Oct 26) against their full rows —
   D138: does any lose a condition, or add one?
7. **Option 7 not proposed:** if you can show a passage of real size that is repeated word for word across the
   always-loaded rule files (`.claude/rules/*.md`, `.claude/rules/decisions/how-we-work.md`), name it with both
   places; otherwise say you found none.

## What is NOT a finding

- A matter of taste in the wording.
- A claim with no concrete case: a finding needs the sentence, the situation in which it misleads or loses a rule,
  why, and the exact replacement wording (D489).
- A problem that lives only in data already stored (D56) — not relevant here.
- Anything about the SANS calendar work itself: it is on hold and is not to be reviewed (D610).

## Your report

- First line: **PASS** or **CHANGES REQUIRED**.
- Findings numbered, most serious first; each: where · the concrete case · why · the exact wording to use instead.
- Then: what you read whole, what you sampled, what you did not read.
- Plain words; no praise; nothing about style.
