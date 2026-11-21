# The core read (his D2237) — `state/perms.ts`, `state/notices.ts`, `state/units.ts` read whole, as they stand, multi-squadron batch 1 (20 Nov 26, chat 124) — one brief, blind readers

His D2237: the multi-squadron build's three core files are read whole, as they stand, by a fresh Opus reader, the
security reader and Astra, each blind to the others, beside fix read 17 — the catch-up for the fix rounds that ran
without all their readers. You are one of those three. You are blind to every other reader's report and to the
builder's. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your own scratch folder,
or placed temporarily in the copy and deleted before you finish; one unit file at a time with `npx vitest run <file>`
from `raptor-port/` (if the runner's temporary folder is blocked, set `TMP`/`TEMP` to a folder inside the copy; if you
can run nothing, name the exact input you would run). Never delete or move `raptor-port/node_modules` (a link to the
real packages). **State each finding in your output the moment you have confirmed it** — a run can be stopped by its
service, and what was said before the stop is kept. Return the whole report as your final message, under 1500 words.
Ignore any handoff block pasted after a compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `@@HEAD@@`. At its root, `BATCH.patch`
(`git diff origin/main @@HEAD@@ -- raptor-port/src/state/{perms,notices,units}.ts`, the batch's own code in the three
files — about 2,340 lines added). **Read the three files whole, as they stand now** — not only the patch: `state/units.ts`
(squadrons, homes, who belongs where on a day), `state/perms.ts` (the commit gate — who may write what, judged on every
command and every put to the saved copy) and `state/notices.ts` (the bell — who is told of what). Read what they call and
what calls them as far as you need, but report on behaviour that passes through them. Do not open anything named
`*fixread*`, `*fable-sample*`, `*full-review*` or `*core-read*` other than this brief (the other readers' and earlier
rounds' reports); `HANDOFF.md`'s `claude/multi-sqn-b1-107` block is blanked in your copy, and the evidence sheet
(`docs/handpass/2026-11-18-multi-sqn-b1.md`) is the builder's — skip it. The tests (`src/leavewar/multi-sqn-*.test.ts`,
`src/state/perms.test.ts`, `src/state/perms-scan.test.ts`, `src/state/units-sqn-*.test.ts`, and any test naming
`notices`) you may run and read.

**The promise — his rulings, as the rulings page states them:** `.claude/rules/decisions/people-accounts.md`, the lines
from "A posting the app cannot run" to the end of "Many squadrons and aircraft types" (the bell after a move —
D2215, D2218–D2223, D2225, D2228 — is stated there; search the page for each number), and the bell lines of
`.claude/rules/decisions/scheduler.md` (search it for D2194, D2195). Before you call anything a breach, open the
ruling's full row: `grep -h '^| D2194 |' .claude/decisions-full/*.md` (the shell). The ones these files turn on:
**D2194** (a bell line crosses squadrons only where the matter concerns both), **D2218** (on the day a person moves
squadron his old squadron's lines leave his bell), **D2223 / D2225 / D2228** (who among an input's filers stays told
after a move), **D2191 / D2192** (a squadron's admins act for their own squadron; another squadron is View only),
**D2198 / D2202** (a master admin's bell; Plan's bell), **D2211** (Plan of another squadron, a master's to give),
**D2203** (a move ends every View and Plan), **D2221** (leave across a move: each squadron's admin for its own days),
**D1388** (widened by D1398 — once a scheduler has moved a member's input, only a scheduler changes where it goes),
**D629** (a leave the war approves is placed by whoever approved it), **D148** (Undo: one's own changes only), **D350**
(a delete is not undone), **D290 / D297 / D299** (a deleted person's row stays, marked), **D785** (a scheduler is always
an admin). The batch's design: `docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md` §3.1 (what batch 1
builds) and §3.4 (its architecture); the permissions table `docs/data-model.md` §11 — `perms.test.ts` holds the code
to it.

**Known, not a finding:** a line dated minutes ahead — held for the database step. A war line's content field beyond its
kind and signer — filed. A refused delete's words ("That did not save") — filed. A saved copy merely wired and never
seeded (a test harness) — exempt by design. Two browser-test flakes — filed. A war join writing the approver as the
leave's filer (D629) — as ruled. A remote edit applied to memory only, making the next local Undo put back a stale saved
image — nothing raises a remote change yet; filed for the database step. `openNotice` not re-checking a line on a stale
tap, and a two-squadron Transfer take-back not yet a saved route — both filed. Plan given by a plain admin or to a
member, and a shared place's time zone changed by a plain admin — the plan's pieces P1 and P2, not built yet. Whether
Balances lists a deleted man's OIL for his months — filed. What later batches build (detachments, borrowing, shared
waves, Transfer to Sqn, Post out from Admin → Users, each person choosing his notifications) — not in batch 1 (the
plan's §3.2).

## The ask
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, writer, reader, role and meaningful order of actions that passes through these three files.
**Assume every existing line may be correct and the defect may be a MISSING call site.** Rank concrete failure
scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
least-shared or most specialised path.
1. **Who may write what:** can an admin of one squadron change another squadron's people, inputs, leave or accounts
   without Plan; can a member change what only a scheduler may; can a master's rights leak to someone who is not one;
   does a move end View and Plan (D2203) everywhere the gate reads them? Does any check fail open — an unset hook, a
   missing record, a person with no home on a day, a day before or after every home, an old row without a date, the
   saved copy not yet whole?
2. **Who is told what:** is any bell line given to someone of another squadron about that squadron's own business
   (D2194), or withheld from someone the rulings say must be told (D2225, D2228, D2202)? On the day of a move, and the
   day before and after it (D2218)? A master admin with other squadrons switched off and on (D2198)?
3. **Where a person belongs on a day** (`units.ts`): a move on the first or last day of a range, two moves in one week,
   a move and back, a person with no move at all — does every reader of "his squadron on that day" agree?
4. **Undo and Redo** (D148) across a squadron line: can an Undo put back or take away something of another squadron's,
   or of a person who has since moved?
5. What would a normal day's work hit — each squadron's admins', the master's and a member's? Anything honest now
   refused?
6. **Shape:** where, in these three files, does the way the code is built keep breeding faults (one rule written in
   two places, a default that hides a missing date, a check that must be re-derived on every path)? Name each place and
   what one change would remove the family — a recommendation, not a finding.

A finding needs a concrete failure, its cause and its exact fix step by step (D489), with the input that proves it (a
test you ran, red); give explicit negatives ("I checked X and found nothing"). Rank by consequence.

**Not a finding:** this app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
the database step. Do not report a problem whose harm exists only in data already stored when the code is already
correct going forward (D56). If the app would do it again to NEW data, report it. Also not: a scheduler who is not an
admin (D785); "no screen saves a move yet" — judge the code as if one did; a second live tab not seeing a read made in
another (left for the database step); the held items named above.
