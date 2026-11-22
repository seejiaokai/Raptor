# The full review of multi-squadron batch 1 (his D2235) — area @@AREA@@ — one brief, blind readers (20 Nov 26, chat 123)

His D2235: after Fable's sample review of the batch's three core files found two confirmed faults, the rest of the
batch's own code is reviewed by Fable and by a fresh Opus reader, blind to each other, beside the fix reads and never in
their seat; each also says where the build's shape keeps breeding faults. The rest is split into three areas so the
readers run at once; **you read area @@AREA@@**, and one other reader (another model) reads the same area blind to you.
You are blind to every other reader's report and to the builder's. Read-only on the app (change no file under
`raptor-port/src`); proof tests only in your own scratch folder, or placed temporarily in the copy and deleted before you
finish; one unit file at a time with `npx vitest run <file>` from `raptor-port/` (if the runner's temporary folder is
blocked, set `TMP`/`TEMP` to a folder inside the copy; if you can run nothing, name the exact input you would run). Never
delete or move `raptor-port/node_modules` (a link to the real packages). **State each finding in your output the moment
you have confirmed it.** Return the whole report as your final message, under 1800 words.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `@@HEAD@@`. At its root, `AREA.patch` — the batch's
own code in your area, against `main` (`git diff origin/main @@HEAD@@ -- <your files>`, tests excluded). **Your files:**
@@FILES@@
Read what they call and what calls them as far as you need, but report on behaviour that passes through your files. The
commit gate (`state/perms.ts`), the bell (`state/notices.ts`) and where a person belongs on a day (`state/units.ts`) were
read by the sample review and are being re-read by the fix reads — use them, do not review them. Do not open anything
named `*fixread*`, `*fable-sample*` or `*full-review*` other than this brief; `HANDOFF.md`'s `claude/multi-sqn-b1-107`
block is blanked in your copy, and the evidence sheet (`docs/handpass/2026-11-18-multi-sqn-b1.md`) is the builder's —
skip it. Tests (`src/**/multi-sqn-*.test.ts`, `src/**/units-*.test.ts`, the area's own tests) you may run and read.

**The promise — his rulings, as the rulings pages state them:** `.claude/rules/decisions/people-accounts.md` (from "A
posting the app cannot run" to the end of "Many squadrons and aircraft types"), the multi-squadron lines of
`.claude/rules/decisions/scheduler.md` and `.claude/rules/decisions/leave-war.md` (search each for D21 and D22 numbers).
Before you call anything a breach, open the ruling's full row: `grep -h '^| D2194 |' .claude/decisions-full/*.md` (the
shell). The batch's design: `docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md` §3.1 (what batch 1 builds),
§3.2 (what it leaves for later) and §3.4 (its architecture); the permissions table `docs/data-model.md` §11.

**Known, not a finding:** a bell line dated minutes ahead — held for the database step. A war line's content field beyond
its kind and signer — filed. A refused delete's words ("That did not save") — filed. A saved copy merely wired and never
seeded (a test harness) — exempt by design. Two browser-test flakes — filed. A war join writing the approver as the
leave's filer (D629) — as ruled. A remote edit applied to memory only, making the next local Undo put back a stale saved
image — filed for the database step. A deleted man's Leave War row in the months he was here — by design (D299); whether
Balances lists a deleted man's OIL — filed, being checked. `openNotice` not re-checking a line on a stale tap, and a
two-squadron Transfer take-back not yet a saved route — filed. Plan given by a plain admin or to a member, and a shared
place's time zone changed by a plain admin — the plan's pieces P1 and P2, not built yet. What later batches build
(detachments, borrowing, shared waves, Transfer to Sqn, Post out from Admin → Users, each person choosing his
notifications, Plan's bell, a master's squadron switches, holidays per squadron) — not in batch 1 (§3.2).

## The ask
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions that passes through your files. **Assume every existing line may be correct and the defect may be a MISSING call
site.** For each item, state where the visible sign and the working gesture should exist in the production app. Then
rank concrete failure scenarios with setup, action, expected result, and the observation that would disprove
correctness. Start with the least-shared or most specialised path.
1. **Each squadron's own world:** does every reader and writer in your area act on the right squadron's people, inputs,
   leave, Tracker and settings — on the day of a move, the day before and after, a move and back, two squadrons' admins
   and the master in turn? Does anything leak one squadron's data into another's view or count?
2. **Saved data:** is everything your area writes saved, loaded back and undone as one — a reload, a second device's
   copy, an Undo / Redo across a squadron line (D148), a write the gate refuses (nothing half-saved, the screen not
   saying "done")?
3. **Normal work:** what would a normal day's work hit — each squadron's admins', the master's and a member's — that ran
   before the batch and is now refused, wrong or slower?
4. **The shape (his D2235):** where does the way this area is built keep breeding faults — the same check written in
   several places, a rule judged one way by the screen and another by the saved copy, special cases piled on one path?
   Name each, what a simpler shape would be, and which kinds of fault it would remove. A recommendation only.

A finding needs a concrete failure, its cause and its exact fix step by step (D489), with the input that proves it (a
test you ran, red); give explicit negatives ("I checked X and found nothing"). Rank by consequence.

**Not a finding:** this app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
the database step. Do not report a problem whose harm exists only in data already stored when the code is already
correct going forward (D56). If the app would do it again to NEW data, report it. Also not: a scheduler who is not an
admin (D785); "no screen saves a move yet" — judge the code as if one did; a second live tab not seeing a read made in
another (left for the database step); the held items named above.
