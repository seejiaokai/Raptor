# [MERGE-ONCE-RECORDS] — the brief for the two blind reads of the finished code (8 Nov 26, chat 33)

Sent word for word to Astra (`codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`) and to a fresh, blind Opus
reader, each blind to the other (D790, D1770). It changes a working guide (`shipping.md`) and a workflow, so it is read as a guide
change too (D1761). Their reports: `2026-11-08-merge-once-records-read-astra.md`, `…-read-opus.md`.

---

You are a blind code reader for the Raptor repo (a squadron scheduling web app run by one non-technical owner and many parallel AI
chats). Read only; change no file in the repo (throwaway repos and clones in a temp folder are fine, and encouraged). Nobody else's
report on this code is given to you — do not look for one (the red-team reports of the PLAN, named below, are part of the intent).

THE CHANGE: branch `claude/merge-once-records-f59c5d`, the working tree you are in. Read it with `git diff origin/main...HEAD --stat`
and `git diff origin/main...HEAD`, then the live files whole:
- `raptor-port/scripts/records-merge.mjs` (the settle step) and `raptor-port/scripts/records-merge.test.mjs`
  (run: `node --test raptor-port/scripts/records-merge.test.mjs`, about 45 s).
- `raptor-port/scripts/records-merge-replay.mjs`, its list `records-merge-replay.json`, and the evidence sheet it wrote,
  `raptor-port/docs/handpass/2026-11-08-merge-once-records.md` (the replay on 8 Nov 26's 76 real clashing merges).
- `raptor-port/scripts/docsize.mjs` and `docsize-selftest.mjs` (the new skill-note number check; run `cd raptor-port && npm run docsize`
  and `node scripts/docsize-selftest.mjs`).
- `raptor-port/scripts/ci/checks-passed.mjs` and its test, `.github/workflows/deploy.yml`, `.github/workflows/docs-guard.yml`
  (the notes-only lists; the new test step).
- `.gitattributes`; `raptor-port/docs/file-map.md`.
- The words: `.claude/rules/shipping.md` (§"Push" and "merge live" step 2; the new merge-once bullet in §The loop) and
  `raptor-port/docs/gates-and-deploy.md` (the new settle-step paragraph).
The tools it rests on: `raptor-port/scripts/backlog-archive.mjs` (its `--rulings --merge` mode), `HANDOFF.md` (its head says how
blocks are written), `.claude/skill-observations/log.md` and its `archive/`, `.claude/rules/doc-structure.md`.

THE INTENT: `raptor-port/docs/superpowers/plans/2026-11-08-merge-once-records-plan.md`, its LAST section ("After the red team"),
which is what was built; the plan's red team, `raptor-port/docs/superpowers/briefs/2026-11-08-merge-once-records-redteam-{astra,opus}.md`.
The builder's stated departures: in the skill log, `main`'s new notes go before this branch's at one place (numbers keep rising);
"only a new failure counts" compares with the commit merged in, not `origin/main` by name; a `--no-checks` option for the replay; a
record changed on both sides is merged line by line as git would and kept only if that is clean (the gate baseline always left);
regions it cannot settle stay exactly as git marked them; it prints "stage the settled files, then run `backlog-archive.mjs --rulings
--merge`" because that mode refuses while other files are unmerged — and that mode rebuilds `DECISIONS-ARCHIVE.md` from git's copies;
citations of a renumbered note outside the log are listed, not rewritten. The owner's rulings: D1930 and D822
(`grep -h '^| D1930 |' .claude/decisions-full/*.md`); the general rulings page `.claude/rules/decisions/how-we-work.md`.

NOT A FINDING: anything that lives only in records already on `main` (an old doubled line, an old misfiled row) where the code is
right going forward (D56).

ASK — what is MISSING or WRONG. A claim is a finding only with a concrete failure (the exact file contents or merge, the command, the
wrong result), its cause and its exact fix (D489); prove it with a throwaway repo where you can. Rank: P1 a record (a handoff block,
a skill note, a ledger row, a backlog item, a ruling, an archive entry) lost, doubled, revived, mis-numbered or silently changed by the
step, or the merge left in a state the chat cannot see or recover from; P2 a wrong result the chat would catch only later, a refusal
of ordinary work, a check that can pass while broken; P3 waste. Press on:
1. The refuse check (a file hand-edited before the step) — a hand edit it misses, or git's own output it wrongly calls hand-edited
   (conflict style `diff3`/`zdiff3`, labels, line endings, the file with a lone carriage return, a file with no base — add/add).
2. Cutting files into records — a `<!-- now:` marker inside a code span or a quoted line, a `### Observation N:` heading inside a note's
   text, two blocks with one marker, a block without its `<!-- /now -->`, headings at the file's end without a trailing newline.
3. Three-way per record — order when both sides reordered; a block moved; delete-versus-edit; the "merged line by line as git would"
   departure — can it combine two edits that each made sense alone into a wrong record (e.g. two chats each rewriting their status line)?
4. Renumbering — the number it picks against every remote branch and the archive; a second run; a note this branch both added and
   cites; a citation in this branch's lines of `main`'s note of the same number; three branches at once.
5. Insertion-only settling and the shared "## Moved <day>" heading — entries landing under the wrong day, a heading duplicated or lost.
6. The checks and the put-back — what the chat sees if docsize or rulecheck fails, whether `git checkout -m` restores exactly git's
   state for every file it wrote, a check red on the merged-in commit; an exception half-way through writing files.
7. The interplay with `backlog-archive.mjs --rulings --merge` — does running it after the step undo or double anything the step settled
   (the rulings archive above all)?
8. The replay — does it measure what it says; are the 61 "different" files' differences, as the evidence sheet lists them, all safe
   (read a sample against the real merges); would a wrong result pass it.
9. The docsize check — a doubled number it misses, or a false alarm on today's log or archive.
10. The words — do `shipping.md` and `gates-and-deploy.md` say what the code does; does the merge-once bullet drop a safeguard of the
    rest of `shipping.md` or contradict a ruling (D1742, D1746, D1407, D1737, D1795, D1796); does `--no-commit --no-ff` on every
    bringing-in of `main` break anything a chat does today.
11. The workflows — the notes-only lists still equal, nothing else changed by accident.

Report: numbered findings — severity, the failure, its cause, its proof, the exact fix. Then a short "checked and sound" list, and a
tidiness note of at most three points on the new script (filed, not fixed). Plain text, no preamble.
