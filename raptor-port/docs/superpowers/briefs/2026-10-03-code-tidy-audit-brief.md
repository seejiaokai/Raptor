# Brief for Astra — the one-off code-tidiness audit (`[CODE-TIDY-AUDIT]`, D486, D491) — 3 Oct 26

You are reading the standing code of this app, read-only. Change nothing. Your report goes to a non-technical owner
through the host, who will check your main claims against the files.

**Read first, by path (you load none of these by yourself):**
- `raptor-port/docs/superpowers/specs/2026-10-02-workflow-skills-fusion.md` §2 and §8 — what this audit is and is not.
- `raptor-port/CLAUDE.md` §Architecture rules and §Coding conventions; `raptor-port/docs/architecture-direction.md`;
  `raptor-port/docs/undo-contract.md` (the ONE command layer — the direction already ruled; do not propose against it).
- `.claude/rules/decisions/how-we-work.md` (D56, D144, D485, D490), and the area file of any file you report on:
  `.claude/rules/decisions/scheduler.md`, `leave-war.md`, `tracker.md`, `oil.md`, `people-accounts.md`.

**What to read.** Only files that are BOTH large and often changed, largest first, and stop there: `src/tracker/app/core.js`,
`src/ui/scheduler.css`, `src/leavewar/state/store.ts`, `src/leavewar/ui/Matrix.tsx`, `src/ui/html.ts`,
`src/engine/publish.ts`, `src/leavewar/sync.ts`, `src/state/store.ts` (all under `raptor-port/`). Re-measure with
`git log` if you doubt the list; follow a call out of these files only as far as a finding needs.

**The questions (for each file):**
1. Is there a restructure after which whole branches, helpers or layers DISAPPEAR while behaviour stays the same?
2. Is one file doing several unrelated jobs, so that a reader changing one job must load all of them — and would a split
   by job let a builder open only the part that matters?
3. Is the same rule written in more than one place, where it belongs in one?
4. Is logic sitting in a layer that does not own it?
5. **The deletion test:** would removing this piece gather the complexity in one place, or only move it? Report it only
   if it gathers.

**Rules of the report:**
- **At most ten findings**, few and high-conviction, ranked by what each saves against what it risks. Each must DELETE
  or separate something; a style preference, a rename or a guess is not a finding.
- **Never `src/engine/` tidying:** its bodies are verbatim ports — no reformatting, no restyling. `src/engine/publish.ts`
  may be reported only for a structural split that leaves every body untouched.
- **Not a finding (D56):** a problem that lives only in data already stored, where the code is already right going forward.
- **Do not propose a size number** as a target (D141).
- For each finding give: the file(s); what disappears or separates; what must behave exactly the same; the tests that
  already pin that behaviour (name the files); the tests that would have to be written FIRST; the bug-check tier the
  restructure would need (LOOK / WALK / FULL — FULL for anything touching the published record, earned leave (OIL),
  permissions or saved data); and which area's feature batch it should ride with (D490: Inputs, Insights, the Tracker,
  the rules, the Leave War, the workflow UI pass).
- End with: what you read, what you did NOT read, and anything you considered and rejected, one line each.
