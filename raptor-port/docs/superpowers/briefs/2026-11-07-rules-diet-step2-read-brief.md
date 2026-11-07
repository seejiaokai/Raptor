# Brief — the blind read of the rules diet's step-2 short texts (7 Nov 26)

**You are one of two readers, each blind to the other (his D1739).** Do not open, search for or read any file named
`*step2-read-opus*` or `*step2-read-astra*`. Read only; change no file; commit nothing.

**What to read:** `raptor-port/docs/superpowers/briefs/2026-11-07-rules-diet-step2-short-texts.md` — parts A, B and C are
new short texts; part D lists pointer edits. Background: the plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md`
§2 ("The seam files"), §5 (the per-message note), §6, §7 (step 2) and §8 ("Not a question, already his"). The project's
rules: a summary must never change what the original meant (D138); a ruling's full row is found with
`grep -h '^| D969 |' .claude/decisions-full/*.md` (use the shell — a search tool may hide a long row).

**The question, for each text: does any meaning change, get lost, or get added — against its source?**
- **A, the note on each message:** against today's note (quoted in the document) and the files named as carrying each
  part that leaves it (`.claude/rules/record-decisions.md`, `.claude/rules/doc-structure.md`, the head of `DECISIONS.md`,
  the head of `.claude/rules/decisions/how-we-work.md`). Is every part carried where the table says? Does the new note
  still do the hook's job — make the agent classify each message as a ruling or not at the moment he speaks (D13)?
- **B, the skill-notes short form** (`.claude/skills/task-observer/SHORT-FORM.md`): against the full guide
  (`.claude/skills/task-observer/SKILL.md`) and this project's notes on it (`.claude/skills/TASK-OBSERVER-VENDORED.md`).
  Name every rule an agent needs during an ordinary session that the short form drops, bends or adds — the start, what
  to watch, logging and numbering, the checkpoints, a trap met again, citing, the end of a session, acting on a note,
  rewriting the log. The document names one deliberate change (archiving at the review, not on every write): say
  whether it holds. Also read the switch-on plan (the hook, the guide's line and paragraph): would anything conflict?
- **C1, the two pointer lists** (`.claude/rules/decisions/inputs.md` "From the Leave War", 51 bullets;
  `.claude/rules/decisions/people-accounts.md`, 11): each bullet against its ruling's short line in
  `.claude/rules/decisions/leave-war.md` — does it name the ruling's subject faithfully, cite the right number(s), and
  cite the rulings its short line's "— changed by" tail names? Is any Leave War ruling missing that someone editing
  the Inputs page, an input's window, `engine/inputs.ts`, the Quals page, `engine/people.ts` or `state/store.ts` would
  need (the exclusions are listed in the document)? Sample at least 25 of the 62 bullets closely, and say which.
- **C2–C5:** the seam files' heads and `paths:`, the two new map rows, the pointers left by the moves, the archive
  file's head and the handoff's new lines — anything misleading or wrong?

**Not a finding:** a problem that lives only in data already stored, when the rules going forward are correct (D56);
wording you would merely prefer. **A finding is a claim with a concrete failure** (what an agent would then do wrong),
**its cause and its fix** — exact replacement words where you can.

**Report:** a verdict for each part (A, B, C1, C2–C5): "no meaning change" or the findings, each ranked high / medium /
low, with file, line and the fix. Then the bullets you checked in C1. Plain prose, no preamble.
