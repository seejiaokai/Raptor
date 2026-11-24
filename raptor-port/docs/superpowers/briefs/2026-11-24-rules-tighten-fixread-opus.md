Fresh Opus fix read of the exported copy of commit 61dd81797.

*(The reader's report as it was handed back to chat 158, 24 Nov 26. All five findings were taken in the commit after it: F1 and F2 in the short form and the steps, F3 in `gates-and-deploy.md`, F4 in the short form's "only notes" line, F5 in the when-needed document's header.)*

I found no HIGH findings. There is one MEDIUM and four LOW. All of them are about wording that is too narrow or wording that was not carried into a second file. No fix drops a rule or adds a duty the original did not hold.

## MEDIUM

**F1. The Vercel exception covers only "notes only", but Vercel also skips merges of working guides under `raptor-port/docs/`.**
- Files: `.claude/rules/shipping.md` §"Done" means LIVE, the sentence "A merge of notes only normally starts no build on Vercel: confirm the skip (…) and report the notes merged, without waiting for a new READY (D2032)." The same wording was added to `raptor-port/docs/shipping-steps.md` §"Done" means LIVE ("A merge of notes only normally starts no build on Vercel (D2032): …").
- The mismatch: `raptor-port/scripts/vercel-ignore.mjs` counts as a note everything under `raptor-port/docs/`. Its comment says so outright: "the working guides there too". `gates-and-deploy.md` says it "skips only when every changed file is a note", meaning the script's wider set. The shipping list's "only notes" leaves working guides out.
- What a chat would do wrong: take a guide change that touches only `raptor-port/docs/` (for example the bug-check order, the design guide, the Codex guide, `shipping-steps.md` or `how-we-work-when-needed.md`) plus rulings files. That job merges on his "merge live", so it enters the "Done" chain. Vercel skips it. The new exception does not apply, because the job is not "notes only". The chain still asks for "a READY Production deployment whose commit holds the merge", which never comes. The chat then waits, or, following "Vercel can miss a merge", asks him to Promote a build. That is Astra 6 and Opus M4 again, on the wider set.
- Rewording, in both files: "A merge whose every changed file Vercel counts as a note — the notes-only list, and anything under `raptor-port/docs/`, a working guide there included (`raptor-port/scripts/vercel-ignore.mjs`) — normally starts no build on Vercel: confirm the skip (`raptor-port/docs/gates-and-deploy.md`, "A notes-only push skips its build") and report it merged, without waiting for a new READY (D2032)."

## LOW

**F2. The new short-form bullet does not say whether `main`'s own run must still be green, or what to do if Vercel builds after all.**
- File: `.claude/rules/shipping.md`, the same new bullet ("confirm the skip … and report the notes merged, without waiting for a new READY").
- The problem: it is a separate bullet from the chain above it. One reader treats it as replacing the whole chain and reports as soon as the merge lands, without waiting for the Docs guard on `main`. Another keeps `main`'s run green and drops only the READY step. The word "normally" also leaves open what to do when no skip shows, for example a first deployment or a comparison base Vercel cannot reach. In the steps the sentence is attached to the chain, so this ambiguity is only in the short form.
- Rewording: "…: `main`'s own run green as above, then confirm the skip (…) and report it merged, without waiting for a new READY; if it builds instead, wait for READY as above (D2032)."

**F3. `gates-and-deploy.md` did not get the same D2032 correction.**
- File: `raptor-port/docs/gates-and-deploy.md`. The "Done after merge live" chain (around line 242: "→ the Production deployment for that commit READY … → one notification with the link") is still unqualified. So is the "VERCEL CAN MISS A MERGE" passage that follows it.
- What a chat would do wrong: the short form now sends a chat to this file for notes merges. There it reads the READY chain with no exception, plus a procedure that asks him to Promote when the newest Production deployment is not the merge's. It may take a Canceled skip for a missed merge and ask him to promote a build.
- This is the same correction the steps were given ("corrected 24 Nov 26, D201"), carried over. Rewording: add after "one notification with the link": "(a merge Vercel skips as all notes — 'A notes-only push skips its build' below — shows as Canceled, keeps the live app serving, and needs no READY and no Promote)."

**F4. The short "only notes" list still leaves out two exclusions the full list names.**
- File: `.claude/rules/shipping.md`, the sentence "The rulings files can qualify; an unscoped rule file, a working guide, a hook, a setting, a skill, an agent, a workflow, `AGENTS.md` and `raptor-port/CLAUDE.md` cannot."
- What is missing: the full list in `shipping-steps.md` also excludes `.claude/launch.json` and "anything under `.github/`", which is wider than workflows. Opus M3 named `launch.json`. On the other side, only the rulings files are named as able to qualify.
- What a chat would do wrong: a chat that takes the short list as complete, despite "open the steps", could class a `.claude/launch.json` or `.github/CODEOWNERS` change as merging by itself. It could also think `HANDOFF.md` or an evidence sheet does not qualify. The line does order the steps opened first, so the risk is small.
- Rewording: "The rulings files, `HANDOFF.md`, `OUTSTANDING*.md`, evidence sheets and reference documents under `raptor-port/docs/` can qualify; an unscoped rule file, a working guide, a hook, a setting, a skill, an agent, `.claude/launch.json`, anything under `.github/`, `AGENTS.md` and `raptor-port/CLAUDE.md` cannot."

**F5. The Opus M5 fix is in `DECISIONS.md` only. The when-needed document still gives the old, narrower step.**
- File: `raptor-port/docs/how-we-work-when-needed.md`, header, the sentence "A new ruling of one of these sections is stated here in full, its number beside it, and cited on the page's line for the section (`DECISIONS.md`, …)."
- What a chat would do wrong: a chat recording a database-step ruling may follow this header, which it is likely to have open, rather than `DECISIONS.md` step 2. It would then cite the number only. A ruling that binds ordinary work would load as a bare number, which is the case M5 was meant to stop.
- Rewording: "…and cited on the page's line for the section, that line reworded to state the rule itself where it binds work done outside the section's moment (`DECISIONS.md`, …)."

## The five checks asked for

- **(a)** The notes-merge lines in the short form and the steps agree with `gates-and-deploy.md`'s skip passage ("Canceled", "keeps serving the last build") and with the script ("first deployment or uncertain comparison builds"). The faults are scope and ambiguity only: F1, F2, F3.
- **(b)** The checks-lock line matches the old shipping rule's §The checks exactly. These runs take the lock: the full unit suite, a browser-test run of more than one file, the Tracker smoke and a fanned-out walk. Anything else that builds, a single browser-test file included, only waits for the lock to be free. One unit test file, a typecheck or one walk script on a build already served needs none. "Release a lock you took" agrees with `run` and `exec` releasing their own lock. No fault.
- **(c)** The "only notes" line: F4.
- **(d)** D1762 is gone from the full rows and from the general page's citation. It is now listed in `DECISIONS.md`'s Archive row, and D2460's row reads "This is the later step D1762 left, and replaces it." D1762 asked for two things: state once what the page and a checklist both said, and until then keep each statement. The first is now D2460's "each repeated rule stated once". The page line "the every-chat rules state what this page and a checklist both said once…" carries it, citing D2460. The second has nothing left to do. Nothing is left uncarried. One thing I could not check: the archived row's "REPLACED BY D2460" mark, because `DECISIONS-ARCHIVE.md` is not in this copy.
- **(e)** React Doctor's D1531/D1533 line is on the general page once and is gone from the when-needed document. The page's other React Doctor line (D1534, D1539, D1716) covers different rulings. The "Also stated there" line no longer names React Doctor, and every item it still lists is in the when-needed section. It is true. No fault.

## Each first-round finding

- Astra 1 (the live check): closed. "A READY Production deployment whose commit holds the merge", with "open the steps".
- Astra 2 (React Doctor behind the database trigger): closed. Its line is back on the page that always loads.
- Astra 3 (parallel chats' duties): closed.
- Astra 4 (a rulings file counted as a rule file): closed. The rulings files now qualify, and unscoped rule files do not.
- Astra 5 (the lock): closed.
- Astra 6 (the Vercel correction): closed for notes-only merges. The guide merges Vercel also skips remain open (F1, F2, F3).
- Astra 7 (the bug-check pointer): closed.
- Opus M1 (the lock): closed.
- Opus M2 (parallel chats' duties): closed.
- Opus M3 (the "only notes" moment and list): closed. The moment and the handoff skill's pointers are fixed. `.claude/launch.json` and `.github/` are still missing from the short list (F4).
- Opus M4 (the "Done" chain): closed for notes only. Not closed for guide-only merges Vercel skips (F1).
- Opus M5 (the new-ruling step): closed in `DECISIONS.md`. Not carried into the when-needed header (F5).
- Opus L1 ("where two are required"): closed. The narrowed line now applies only where two readers are required. Nothing is lost, because the Astra line above it still puts any job without Astra's read on the reads-owed list.
- Opus L2 ("his word" on compaction): closed.
- Opus L3 (the compaction moment): closed.
- Opus L4 (D1762 still cited): closed. The archive row's mark could not be checked in this copy.
- Opus L5 (pointers in skills and scripts): partly closed, as intended.
  - Fixed: the overnight skill's merge-steps pointer and the handoff skill's two pointers.
  - Left: the overnight skill's two-runs pointer (line 30) and its §The checks pointer (line 113), and the comment in `vercel-ignore.mjs`. All three still land on the short form, which states the rule and names the steps.
  - The script comment calls the shipping list its source, then explicitly widens it to all of `raptor-port/docs/`. That is not a real fault for the comment. The widening is what F1 is about.

Nothing else found. Read only: no file changed, nothing written.
