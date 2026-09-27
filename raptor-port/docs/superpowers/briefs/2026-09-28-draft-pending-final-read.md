# Final code read — `[DRAFT-PENDING]`, built and walked (28 Sep 26)

You read FINISHED code, independently; another reviewer reads it too, blind to you. Read-only: change nothing, run
nothing that writes. The repo root is `C:\Users\User\projects\Raptor`; the app is `raptor-port/`; the branch is
`claude/draft-pending` (`git log --oneline main..HEAD`, `git diff main...HEAD -- raptor-port/src`).

**Read first:** the plan (`raptor-port/docs/superpowers/plans/2026-09-28-draft-pending-plan.md` — §9 overrides §2), its
red-team log (`raptor-port/docs/superpowers/specs/2026-09-28-draft-pending-plan-review-log.md`), the evidence sheet
(`raptor-port/docs/handpass/2026-09-28-draft-pending.md` — the roll-call and the walk), the contract
(`raptor-port/docs/ui-contracts.md` §The one changes window, §Amendment marks on screen — the OG tag), the history's rules
(`raptor-port/docs/engine-rules.md` §The edit log), and the owner's rulings it builds: `.claude/rules/decisions/scheduler.md`
rows D99, D100, D105, D107, D109, D116–D119, D167–D172, D263; `how-we-work.md` rows D166, D169, D204, D211, D215, D292, D336.

**The code:** `src/engine/editlog.ts`, `src/state/changes.ts`, `src/state/changelines.ts`, `src/state/perms.ts`
(`EditLogSeen`, `changes.seen`, `ownershipViolation`, `actorIsAdmin`), `src/state/accounts.ts` (`seenFrom`),
`src/state/store.ts` (`resetSession`, `initStore`, `wireStore`), `src/state/view.ts` (CHGWIN), `src/state/undo-wire.ts` and
`src/undo/timeline.ts` (`reversed`), `src/ui/ChangesWindow.tsx`, `src/ui/changesmodel.ts`, `src/ui/changesopen.ts`,
`src/ui/floatwin.ts`, `src/ui/AvailWindow.tsx`, `src/ui/pendlist.ts`, `src/ui/html.ts` (`dayStatHTML`, the Unavailable
row's `data-inprow`), `src/ui/histbubble.ts`, `src/ui/EditWeek.tsx`, `src/ui/Shell.tsx`, `src/ui/SchedBoard.tsx`,
`src/ui/interactions.ts`, `src/ui/inputedit.tsx`, `src/ui/InputsPage.tsx`, `src/engine/publish.ts` (`alAttr`),
`src/engine/hooks.ts` (`newToMe`), `src/ui/scheduler.css` (the `.chgwin` block, the OG tag, the chip).

**Since the walk:** Fable's scenario design (read-only, before this read) predicted twelve defects, P1–P12; each was
reproduced red through the app's own code and fixed in commit `434c3cbf` (its message lists them; the tests are
`src/ui/dpfixes.test.tsx` and the last three in `src/leavewar/changelines-lw.test.ts`; the walk gained F1–F9, both
widths 33/33). Read those fixes as finished code too — a fix is new code, and may be wrong or incomplete.

**Your job — find what is WRONG and what is MISSING.** Do not merely review the changed code. Starting from the owner's
promise and the rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream consumer,
role, overlay and meaningful order of actions. **Assume every existing line may be correct and the defect may be a
MISSING call site.** For each item, state where the visible sign and the working gesture should exist in the production
app. Then rank concrete failure scenarios with setup, action, expected result, and the observation that would disprove
correctness. Start with the least-shared or most specialised surface. Check the roll-call in the evidence sheet for a row
that should be there and is not.

High-consequence areas to read hard: the published record (the To go out tab must list exactly what goes out; publish /
withdraw / sign lines), saved data (the history's save, load, cap, rollback hold; the seen record; `seenFrom`),
permissions (a member may write only his own seen entry; a guest nothing; the admin's member view), and the OIL / Leave
War lines (only a person's decisions, never an automatic credit).

**What is NOT a finding (the owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when
the code is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly".
If the app would do it again to NEW data, report it. **Also settled, do not re-raise:** two tabs of one browser
overwriting each other (the whole app's limit, filed under `[DB-READINESS]`).

**Your report:** findings ranked most severe first, each with an id, a severity, evidence (file:line), the concrete
scenario, and **exact, step-by-step fix instructions**; then **explicit negatives** — what you checked and found sound.
