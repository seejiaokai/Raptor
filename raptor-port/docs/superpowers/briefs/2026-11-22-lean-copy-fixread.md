# Fix-round read brief — lean working copies ([HELPER-COPIES-NO-PICTURES], his D2290, D2292), 22 Nov 26

**Two readers, blind to each other:** Astra, and a fresh Opus reader who wrote none of this. Do not open any file whose
name starts `2026-11-22-lean-copy-fixread-` other than this brief. You MAY read the first round's brief and its three
reports (`2026-11-22-lean-copy-read.md`, `…-read-astra.md`, `…-read-opus.md`, `…-read-fable.md`): they are what the
fixes answer. Read-only: change no file in the repo; write only your report. Throwaway repos or copies outside the repo
are fine (D:/ has room; in Git Bash set MSYS_NO_PATHCONV=1 before a git argument starting with `/`, then write paths
`D:/...`).

## What to read

`git diff b7fe7de1c 90c3a0ec8` on branch `claude/helper-copies-no-pictures-134` (pull request 821) — the fix round:
`raptor-port/scripts/lean-copy.mjs` (largely rewritten), `raptor-port/scripts/lean-copy.test.mjs` (18 tests),
`AGENTS.md` (one new bullet — a working-guide change), `raptor-port/docs/gates-and-deploy.md` §Lean working copies,
`raptor-port/docs/walk-scripts.md` §2, `raptor-port/docs/file-map.md`, `OUTSTANDING.md`
([HELPER-COPIES-NO-PICTURES], [LW-E2E-WRITES-EVIDENCE]), `.claude/rules/decisions/how-we-work.md` (D2290 and D2292's
line, reworded to fit the page's size limit — is its meaning the same as the two full rows?), and the rulings records
put back in `main`'s order (`DECISIONS-ARCHIVE.md`, `.claude/decisions-full/*.md` — is anything lost, changed or out
of order against `origin/main` apart from D2292's row and D2290's mark and last cell?).

## What to answer

1. **Each first-round finding: is it truly fixed, and did the fix break anything?** Above all: a picture re-written
   into an old walk's folder can never leave a commit unseen once `install` has run (and what happens before it has);
   the hooks touch only a copy made in the last 15 minutes and never one set whole; the long step's detached child
   and the 200-second wait (Windows: does the child survive the hook's exit, does anything hang the hook); only
   picture files leave, the drawing check's record folders and every other file stay; the pattern lines that bring
   files back (`/**`); `get`, `status`, `full` and `slim` by hand; the commit guard's message and exit code in the
   main folder, a whole copy and a lean one; `install`/`uninstall` with two hooks.
2. **What is still missing** — a case none of the 18 tests covers that a helper, chat or Codex will meet.
3. **The notes and AGENTS.md's bullet:** true to what the code does; no clash with a guide or ruling; no safeguard
   dropped; no bulk.

## What is not a finding

A problem only in working copies already on his PC (D56 — none is touched; slimming them is his call). The Leave War
test writing into a committed folder is filed ([LW-E2E-WRITES-EVIDENCE]), not part of this job. Style alone.

## How to report

A finding has a concrete failure, its cause and exact step-by-step fix (D489), proven by a reproduction or labelled
unproven. Rank by harm. Say what you checked and found sound.
