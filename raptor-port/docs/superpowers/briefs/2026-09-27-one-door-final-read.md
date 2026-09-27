# Final code read — `[ONE-DOOR]`, built and walked (27 Sep 26)

You read a finished build you did not write; read-only — change no file, run no browser. Another reader reads it too,
blind to you; your reports are compared only after both exist.

**The change:** branch `claude/one-door` against `main` — `git diff origin/main...claude/one-door -- raptor-port/src`
(the rest of the diff is documents and walk scripts). The owner's rulings: `.claude/rules/decisions/how-we-work.md`
D305, D308, D309, D310, D320–D324 (and D280–D299, which they narrow); `.claude/rules/decisions/leave-war.md` "Also read".
The plan and its round-1 red team: `raptor-port/docs/superpowers/plans/2026-09-27-one-door-plan.md`,
`raptor-port/docs/superpowers/specs/2026-09-27-one-door-plan-review-log.md`. The contract: `raptor-port/docs/ui-contracts.md`
§Admin → Users — one door. The walk design: `raptor-port/docs/superpowers/specs/2026-09-27-one-door-scenarios-fable.md`.
**The evidence sheet — read it first:** `raptor-port/docs/handpass/2026-09-27-one-door.md` (the roll-call §4, the doors §5,
what was not walked §7) and the walk's results `raptor-port/docs/img/handpass/2026-09-27-one-door/walk3/results.md`.

**Where to look hardest** (the wrong answer here silently deletes, withholds or authorises): who may archive, restore,
give a sign-in, and clear a welcome note (`src/state/perms.ts`, `src/state/accounts.ts`, the command gates); the war's
stints as stored and read back (`src/leavewar/state/store.ts` — `readPast`, `windowFor`, `windowRecord`, `openStint`,
`closeStintOnArchive`, `forgetPersonFrom`, `setPeople`, `postingLocked`; `src/leavewar/engine/people.ts`); who the war
counts on a date (manning, availability, the ALL AVAIL crowd — `src/leavewar/sync.ts availableFor`); what a published
day reads after an Archive or a Restore (`src/engine/publish.ts` roster comparison, the four sign-offs); one command
over three stores (people, settings, the war) — does every write inside Archive / Restore / a new person's add commit or
roll back together, and does a reload read back exactly what was written?

**Your job — find what is WRONG and what is MISSING.** Do not merely review the changed code. Starting from the user
promise and the applicable rulings, enumerate every qualifying object, renderer, visible door, writer, reader,
downstream consumer, role, overlay and meaningful order of actions. **Assume every existing line may be correct and the
defect may be a MISSING call site.** For each item, state where the visible sign and the working gesture should exist in
the production app. Check the roll-call in the evidence sheet for rows that are absent or marked without proof. Then
rank concrete failure scenarios with setup, action, expected result, and the observation that would disprove
correctness. Start with the least-shared or most specialised surface.

**What is NOT a finding (owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that will be
CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when the code
is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly". If the
app would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it. Also not a
finding: anything the evidence sheet §10 already puts to the owner as his question, unless you show it is a defect
whatever he answers.

**Deliver:** (1) findings, most severe first — each with the file and line, the concrete scenario (setup → action →
what goes wrong), whether it is new in this branch or on `main` too, and **exact, step-by-step fix instructions**;
(2) **explicit negatives** — what you checked and found right ("I checked X, it holds because Y"); (3) any roll-call row
you think is missing. Plain words.
