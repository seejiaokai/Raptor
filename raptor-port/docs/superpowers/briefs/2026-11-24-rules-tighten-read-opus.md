Fresh Opus read of the exported copy of commit c3b956832.

*(The reader's report as it was handed back to chat 158, 24 Nov 26; brief `2026-11-24-rules-tighten-read-brief.md`. What was done with each finding: `2026-11-24-rules-tighten-findings.md`.)*

I found no HIGH findings. No safeguard is dropped. Five findings are MEDIUM and five are LOW. Each has a failure and a fix.

## MEDIUM

**M1. The checks lock is now required for more than the rule says. The short form contradicts its own steps.**
- File: `.claude/rules/shipping.md` §The checks.
- Sentence: "Before the full unit suite, any browser-test run, the Tracker smoke, a fanned-out walk or anything that builds, take the checks lock — its commands, what needs no lock and when a lock is stale are in the steps."
- The old rule (in `shipping-steps.md`) is narrower. A chat takes the lock for the full unit suite, a browser-test run of *more than one file*, the Tracker smoke or a fanned-out walk. Anything else that builds, a single browser-test file included, only *waits until the lock is free*. It does not take it.
- Failure: a chat would take the PC-wide lock for every `npm run build` and every one-file browser run. That blocks parallel chats' full runs. The line also says "what needs no lock" is in the steps, but the steps say this case needs no lock. The two disagree.
- Fix: "Before the full unit suite, a browser-test run of more than one file, the Tracker smoke or a fanned-out walk, take the checks lock; anything else that builds — even one browser-test file — waits until it is free. Its commands, and when a lock is stale, are in the steps."

**M2. Two duties of parallel chats are lost, and no moment to open the steps is named.**
- File: `.claude/rules/shipping.md` §The checks.
- Sentence: "Before changing a file or function another open chat's branch also changes, message that chat — what you will change and what you will leave — and settle the overlap at once; …"
- The old bullet also said "answer the same when asked" and "repeat what you promised in your own `HANDOFF.md` block". It also gave the command that compares the branches and the way to reach the other chat (`ListAgents`, then `SendMessage`). None of this is in the short form, and the bullet does not point to the steps.
- Failure: a promise made to another chat is not written into the handoff block, so the next chat breaks it. A chat that is messaged may not reply. A chat may also not know how to find out which files the other branch changes.
- Fix: add "; answer the same when asked, and repeat what you promised in your own `HANDOFF.md` block — how to compare the branches and reach the other chat: the steps, §The checks."

**M3. Telling a notes-only job apart happens before the merge, but the short form names only the merge as the moment. Its own list is partial.**
- File: `.claude/rules/shipping.md`.
- Sentence: "**Before merging a notes-only pull request, open the steps:** what "only notes" covers — never a working guide, a rule file, a hook, a setting, a skill or a workflow — …"
- The session-handoff skill decides how a job ships when the job is planned. It does this "checked against `.claude/rules/shipping.md`'s "only notes"" list (line 301; also lines 24–25, "that file's "only notes" list"). That list is no longer in the file.
- The short list leaves out `AGENTS.md`, `raptor-port/CLAUDE.md`, `.claude/agents/` and `.claude/launch.json`.
- "A rule file" is ambiguous. The rulings files under `.claude/rules/decisions/` *are* notes.
- Failure: a chat plans a change to `AGENTS.md` or `.claude/launch.json` as "merges by itself" and tells him so. The full list is read only at merge time. A chat may also wrongly class a rulings-only change as not notes.
- Fix: "**Before deciding a job ships as notes-only, and before merging one, open the steps:** the exact list of what "only notes" covers (never a working guide or an unscoped rule file, hook, setting, skill, agent, workflow, `AGENTS.md` or `raptor-port/CLAUDE.md`) and the checks to run on his PC first." Also point session-handoff lines 25 and 301, and the comment in `raptor-port/scripts/vercel-ignore.mjs` line 15, at `raptor-port/docs/shipping-steps.md` §"Push" and "merge live".

**M4. The "Done" chain still requires a Vercel build that a notes-only merge never starts.**
- Files: `.claude/rules/shipping.md` §"Done" means LIVE, and the same bullet in `shipping-steps.md`, which was not corrected.
- Sentence: "Then carry it the whole way without checking in: `main`'s own run green → Vercel reports the live app READY → one notification, with the link."
- His ruling D2032 makes Vercel skip a notes-only push, and `vercel-ignore.mjs` counts rulings-only changes as notes. `main` also skips the gates for a docs-only push; only the Docs guard runs.
- A rules-diet step that changes only rulings files merges on his "merge live", so it enters this chain. Vercel never reaches READY for it.
- Failure: the chat waits for a Production deployment that was cancelled. Or, following the "Vercel can miss a merge" memory, it tells him to promote a build by hand. Only two of the three D2032 lines were corrected. The short form's first bullet and this one now disagree.
- Fix: "Then carry it the whole way without checking in: `main`'s own run green → Vercel reports the live app READY (a merge of notes only builds nothing on Vercel: the Docs guard green on `main` ends it) → one notification, with the link. How to read the deployment: the steps." Make the same change in `shipping-steps.md`.

**M5. The new `DECISIONS.md` step keeps a future ruling of a moved section out of every loaded file.**
- File: `DECISIONS.md`, line 51.
- Sentence: "(a general ruling of the rules diet, the database step, an overnight run or compaction: state it in full in `raptor-port/docs/how-we-work-when-needed.md` and cite it on the page's line for that section — D2460)".
- A citation alone does not carry meaning. A new ruling about one of these subjects may bind ordinary work outside the section's moment. An example is "never build X in the app before the database step". Such a ruling would load only as a number.
- Failure: a feature chat that never opens the section breaks the new ruling. This is exactly what Q2 guards against, and the step lets it happen again later.
- Fix: add "…and cite it on the page's line for that section, rewording that line to state the rule itself where it binds work done outside that section's moment".

## LOW

**L1. The merged reads-owed line has lost "where two are required".**
- File: `.claude/rules/decisions/how-we-work.md` §Models and readers.
- Sentence: "A job, plan or guide change that went without Astra's read, or without Sol 6.1's, goes on the reads-owed list".
- "A job" without a qualifier reads as any job. Read that way, every job without Sol 6.1 would go on the list, which floods it. The Astra line above keeps "where two are required".
- Fix: "Risky code, a plan or a guide change of the line above that went without Astra's read, or without Sol 6.1's, goes on the reads-owed list; …"

**L2. The compaction statement drops "his word".**
- File: `.claude/rules/decisions/how-we-work.md` §Long runs.
- Sentence: "a guard holds the app's compaction until the state is saved — off when he is away or a job is left unattended —".
- The old text said "an `/overnight` run or his word that a job is left unattended".
- Failure: a chat may decide by itself that a job is unattended and switch the guard off.
- Fix: "— off when he is away, on an `/overnight` run or on his word that a job is left unattended —".

**L3. The compaction pointer names no moment to open the section.**
- File: `.claude/rules/decisions/how-we-work.md`.
- Sentence: "The figures and the set-up: `…` §Compaction".
- Every other moved section has a "before…" moment; this one does not.
- Fix: "Before changing the compaction set-up or its figures, open `raptor-port/docs/how-we-work-when-needed.md` §Compaction."

**L4. D1762 is still cited as a live ruling.**
- File: `.claude/rules/decisions/how-we-work.md` §Records, first new statement, "[D1732, D1735, D1762, D2460]".
- D1762's full row is marked "ANSWERED 24 Nov 26 BY D2460". Its own line was deleted rather than moved, and it is not in `DECISIONS-ARCHIVE.md`.
- By the records rule, a ruling a later one answers or restates leaves for the archive. Citing it here keeps a spent ruling on the live page and in the map (`DECISIONS.md` row "How we work").
- Fix: archive D1762 with `backlog-archive.mjs --rulings` and drop it from the citation, leaving D2460. Or, if it is kept on purpose, say so in D2460's row.

**L5. Three pointers in skills and scripts aim at text that has moved.**
- `.claude/skills/overnight/SKILL.md` line 14 ("by `.claude/rules/shipping.md`'s four steps") and line 30 (the two-runs command).
- `raptor-port/scripts/vercel-ignore.mjs` line 15 (the "only notes" list, `.claude/rules/shipping.md`).
- Each still lands on the short form, which forwards to the steps, so no rule is lost. They should name `raptor-port/docs/shipping-steps.md` directly.

## Checked and found sound

- `shipping-steps.md` against `OLD/shipping.md`: the same text except the header and the two D2032 Vercel lines, which are correct.
- His "merge live", the notes-only exception and its rules-diet carve-out, and "auto merge live" for an unattended run's notes: all kept in the short form.
- The four merge steps, the merge lock, the level check and never `--auto`: named, with "open the steps before every merge" as the moment. The moment is wide enough.
- Never pushing while checks run, and reading both runs: kept, with the command pointed to the steps.
- The merge-as-one rule, its moment and its pointer: sound.
- "Done" means live, his "merge live" meaning his look is done, a look that brings a change, the one notification, the unattended-run question rule, when to come back sooner, and no login to the live app: kept.
- The checks while the repo is public, the about-6-minute run, a pull request with no base or a stacked one running no checks, the walk pictures, the private-repo pointer, the push guard as a backstop, and docs-only skipping the gates but not the Docs guard: kept.
- Not watching pull requests, and switching Auto-fix off: kept.
- 30 lines moved byte for byte into `how-we-work-when-needed.md`: 10 rules diet, 12 platform, 5 overnight, 3 compaction. The D1762 line was deleted, not moved (see L4).
- The rules-diet statements: "merge live" for every step, the reading by Astra and a fresh Opus reader of any reworded step, "never goes on without that read", and text moved out of a guide being read by Astra too. All kept, and the section trigger covers "if Astra cannot run, he is told first".
- The skill-notes rule on when to open the full skill is still stated in `raptor-port/CLAUDE.md` (D969, D1740).
- The database statements: nothing on his M365 before its step, work waiting on IT, and no rush to February 2027 are kept. The kept line "after phase 7 no more database-readiness work" still covers D1580/D1587's "nothing built before then". The section's trigger is broad enough.
- The overnight statement keeps every rule an unattended run needs, with a correct trigger. The compaction figures agree with the hooks: 450,000, 540,000, 576,000 and 612,000 of a 600,000 window.
- Readers merge (Q3): Astra first; the second seat is Sol 6.1 on his call, otherwise a fresh blind Opus reader, which is his word for a plan (D1760, narrowed by D1770) and the agent's reading for code and guide changes. "One round each", "never by its writer", Astra being his call for every guide change, and "told first and the change waits" are all kept. Dropping "as plans have been read since 13 Oct" as history is sound.
- The two pointers (Q4): every condition the old `bug-check.md` and `doc-structure.md` text held is on the page's §Models and readers. This includes Fable designing scenarios beside Astra on high-risk work, Fable's high-risk pick and the app's words, "What Codex wrote, Opus reads", and the fresh blind Opus read beside Astra.
- Other pointers to `shipping.md` §The checks and to the merge lock (`AGENTS.md`, `raptor-port/CLAUDE.md`, `gates-and-deploy.md`, the bug-check order and checklist, `doc-structure.md`, `tracker.md`): all still land on matching text.
- Bulk (Q7): no new sentence adds words that are not needed where they sit.
