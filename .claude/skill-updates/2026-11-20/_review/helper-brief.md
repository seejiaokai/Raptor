# The skill-notes review of 20 Nov 26 — the brief for each sorting-and-drafting helper

You are one of four helpers in the skill-notes review (chat 120). Each takes one group of OPEN notes (the groups:
`_review/groups.json` beside this file), decides what each note becomes, and drafts the guide changes. The coordinating
chat does the records, the commits, the owner's rounds and the two blind reads afterwards.

- **Repo root (a worktree):** `C:\Users\User\projects\Raptor\.claude\worktrees\xenodochial-tesla-2bd501`, branch
  `claude/skill-notes-review-0c3a78`. Never switch the branch, never `cd ..` out of it before git (use `git -C <root>`).
- **The notes:** `.claude/skill-observations/log.md` holds every OPEN note except 939–943 and 975–981, which live only on
  other open branches: read those in `_review/branch-notes.md` (a copy; do not touch those branches).
- **The method:** the task-observer skill's `.claude/skills/task-observer/references/weekly-review.md` Steps 3–5 and
  "Delivering updated skills", as this repo runs it: `.claude/skills/TASK-OBSERVER-VENDORED.md` §Reviews in this repo —
  read both first. The last review's table, for its style:
  `git show b064ac859^:.claude/skill-updates/2026-11-10/_review/dispositions.md` (set `MSYS_NO_PATHCONV=1` in Git Bash
  first).

## What you write — and nothing else

- **Drafts** at `.claude/skill-updates/2026-11-20/<the live file's repo-relative path>`. The first time you touch a file,
  copy the LIVE file there first (`cp`), then edit only the copy. NEVER edit a live file — not a skill, a document, a rule
  file, the log, `HANDOFF.md`, `OUTSTANDING.md`. Use the Edit tool on the copy; if you must script an edit, write the
  script to a file with the Write tool and run it (this shell halves a typed backslash; a script typed into the command
  line is refused); in Node use `s.replace(a, () => b)`, never a plain string replacement (a `$'` in prose doubles text);
  keep the file's line endings.
- **You own only the files your group lists below.** Helpers run side by side; two must never draft the same file. If a
  note's right home is a file you do not own, code it `APPLY`, name that file in the cell, and put the exact text to add
  and where under "For another file" in your report — the coordinator places it.
- **Your table**: `_review/dispositions-<your group>.md`, one row per note of your group, exactly this shape (a script
  reads it): `| <number> | <CODE> | <where it lands, or why> |` — the third cell one line, no `|` inside it.
- **Additions**, each in a file of your group's own name so helpers never write one file: backlog items →
  `_docs/OUTSTANDING-items-<group>.md` (a full item text in the shape of `OUTSTANDING.md`'s items, a proposed ID in
  capitals and square brackets — check it is unused: `grep -n '\[ID\]' OUTSTANDING*.md`; before proposing a new item,
  search `OUTSTANDING.md` for one that already carries the tool); memory notes → `_memory/additions-<group>.md` (name,
  one-line hook, body — the format: any file of `C:\Users\User\.claude\projects\C--Users-User-projects-Raptor\memory\`;
  check those first and extend one rather than add a near-copy); questions for the owner → `_review/questions-<group>.md`.
- **Your report** is your final reply (the tool refuses a helper's report file; the coordinator saves it): the counts per
  code, each drafted file and what changed in it (a line per change, naming the notes), "For another file" texts, the
  places you are unsure of, and any stale line you fixed. Keep it under about 1,200 words.
- Do not commit, push, or run the gates. Do not start other helpers.

## The codes

`APPLY` a draft carries it (name the file and section) · `REFLECTED` already written where it belongs (name the place —
you must have read it there, today) · `FILED` a backlog item carries it (an existing item you have read, or one you add)
— the home for a lesson that is really a tool to build or a check to automate · `MEMORY` a memory note carries it (how
to work with the owner, or a trap of this PC) · `ASK` recommend closing it with no change, his word (say why; add a line
to your questions file) · `OPEN` stays open (a new-skill candidate that needs his call — weekly-review's Constraints: no
new skills in a review; or the evidence is too thin — say which).

## Where lessons land (settled by the earlier reviews; follow it)

In the skills under `.claude/skills/` (a few lines in the section they belong to, or a reference file inside the skill);
in the project's method documents — `raptor-port/docs/bug-check-order.md` (BCO), `raptor-port/docs/bug-check-checklist.md`,
`raptor-port/docs/walk-scripts.md` (WS), `raptor-port/docs/gates-and-deploy.md` (GD), `raptor-port/docs/design-practices.md`
(DP), `raptor-port/docs/codex-guide.md` (for the claudex-loop plugin, which lives outside the repo and cannot be edited),
`raptor-port/docs/doc-budget.md`; and the vendoring notes' register of local changes (`.claude/skills/*-VENDORED.md`) for
every change to a vendored skill (superpowers, impeccable, task-observer). **Never** in `raptor-port/CLAUDE.md`,
`.claude/rules/` (always-loaded rule files and the rulings pages — size-capped, changed only by a ruling or the rules
diet), `.claude/hooks/`, `.claude/settings*.json`, `AGENTS.md`, `DECISIONS.md`. A lesson whose only right home is one of
those: `FILED` (or `ASK`), not drafted. **Impeccable's own files stay as brought in** (D1982, D625): a design lesson goes
to DP or the brainstorming skill's `mockups-on-the-real-app.md`. If BCO changes a step the checklist names, draft the
checklist's line too (the owner of BCO owns the checklist).

## How to judge each note

1. Read the note whole. Then search for its lesson where it would already live (the files above, the rule files,
   `raptor-port/docs/guide-full.md`, `OUTSTANDING.md`, the memory notes) — by its subject, not its phrasing. Many lessons
   were fixed where they hurt and left OPEN: those are `REFLECTED`, naming the place.
2. A rule broken more than once needs enforcement (a check, a script, a refusal), not louder words — `FILED` to a tool
   item, with the guide pointing at it at most. Several notes here are "met again" traps: look for the earlier note's
   resolution (the archives under `.claude/skill-observations/archive/`) and say what the guard would be.
3. Ask "what can we remove?" as hard as "what should we add?" — draft the cut or the merge where a line no longer earns
   its place, and say why.
4. **Size:** the project just finished a diet of what agents read (D1735; no size targets but every line earns its
   place, D141). Prefer sharpening an existing line to adding one; merge near-duplicates; a lesson is one to three lines
   in the section where it applies, house style (plain words, ruling numbers cited where a line states one of his
   rulings). Never invent a ruling or attribute a lesson to him.
5. A lesson that holds the project's specifics stays out of a vendored skill's general text — put it in the project's
   documents or a clearly marked project section.
6. Two notes on the same lesson: one change, both rows naming it.

## Stale lines (D201: the later ruling wins)

In every file you draft, if a line plainly contradicts a later ruling — who reads what (Astra, GPT-6 Astra, is the
standing reviewer, D1770, D2210; a working-guide change is read by Astra and a fresh, blind Opus reader, D1761; walks stay
on his PC, D1797) — fix it in the draft citing the ruling and list it in your report. Check a ruling's full row first:
`grep -h '^| D1770 |' .claude/decisions-full/*.md`. Do not go hunting through files you are not otherwise drafting.

## When you finish

Check your table has exactly one row per note of your group, every APPLY's draft exists, and your report lists your
doubts, ending with the three places you are least sure of. If a write is refused, say so.
