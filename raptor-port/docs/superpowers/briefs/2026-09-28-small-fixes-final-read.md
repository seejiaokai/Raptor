# Brief — the small-fixes batch, the final code read (28 Sep 26)

You are reading FINISHED code, after the walk (bug-check order §4a: the walk goes before the inspection). Read blind to the
other reviewer. **Read for MISSING as hard as for wrong** — a surface the change should reach and does not, a door that
still does the old thing, a word the screen says that the code does not keep — because reading code cannot find a line
that is not there unless you go looking for where it should be.

## What to read

- The change: `git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e` on branch `claude/small-fixes-batch-d223f6`
  (worktree `C:\Users\User\projects\Raptor\.claude\worktrees\trk-smoke-add-race-bug-007eed`). One commit per item; the
  commit messages say what each does and why.
- The plan and what the red team changed: `raptor-port/docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`
  (§2 the items, §9 the dispositions — the build follows §9).
- The evidence sheet — what was walked, what the walk found, what was NOT walked:
  `raptor-port/docs/handpass/2026-09-28-small-fixes.md`.
- The rulings that govern it (read the rows the plan §0 names): `.claude/rules/decisions/scheduler.md` (D360 at the top —
  the owner's answer on `[ALLAVAIL-OPEN-ROW]`), `.claude/rules/decisions/oil.md`, `.claude/rules/decisions/leave-war.md`,
  `.claude/rules/decisions/how-we-work.md`. The project guide: `raptor-port/CLAUDE.md` (the robustness doctrine).
- The contracts the change wrote: `raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md` (search for
  "28 Sep 26").

## The items, in one line each

A — a floating window (ALL AVAIL, changes) never opens over the board's preview bar (`ui/floatwin.ts BOARD_BAR`).
B — a dragged flagged puck keeps its own ring and its lifted shadow (`scheduler.css` `.lift`).
C — D360: an ALL AVAIL on a row with a start and no end is counted over the assumed length (display only, `oil.ts
openEndRows` → `oilev.ts`), earns nobody OIL, and the admin is told why; a row with no start gets its own "?".
D1 — messages spoken in one publish are joined (`ui/toast.ts toastBatch`, `sched-commit.ts commitPublish`); Unpublish
says what it did. D3 — a flying line's callsign shows six letters whole (CSS widths; the name an inline run). D4 — a
changed time's AL tag sits under the time. D9 — "Sort" on the ground programme keeps the four sign-offs: the digest binds
the rows as SHOWN (`publish.ts currentBindNow`) and the pending key names a current ground row by its id
(`pendingKey`, `canonical.ts` `was`).
E — one request, one row across stored weeks (`engine/weekstash.ts rowElsewhere` and its readers: `slots.ts acceptInput`,
`relandInputs`, `publish.ts rowsLeftOut`, `inputedit.tsx landedOnUnloadedWeek` / `dropInputRow`, `html.ts accCtl`,
`interactions.ts` the Accept handler). F — the banner's switch in the menu's words; a deleted request named without a
row (`pendlist.ts requestWords`). G — the Leave War: no sheet prints a stored ISO date (`leavewar/ui/dates.ts`); the
unused move doors retired (`leavewar/state/store.ts`); each clash line names its way out (`sync.ts clashWayOut`,
`Chrome.tsx WAY_OUT`); the VIEWING AS chip on a phone (`chrome.css`); the read-only input window's look
(`scheduler.css .inped-body[inert]`).

## What is NOT a finding — do not report these (owner, D56)

A problem that lives ONLY in data already stored is not a finding: the whole store is demo data, cleared before the
database step. **Both must be true:** the harm exists only in data already stored, AND the code is already correct going
forward. If new data would be hurt too, it IS a finding. Examples here: a signature bound before D9's change re-signing
once; a day published before C having no frozen crowd for an open-ended row.

Also out of scope (another chat's files, not changed here): the undo engine, `src/state/undo-wire.ts`,
`people-settings-commit.ts`, `person-delete.ts`, `accounts.ts`, the Leave War store's `write` and `reprojectRoster`, every
Undo/Redo button.

## What to hand back

A report written to the file named in your prompt, from its first line. For each finding:
1. **Severity** — money / published record / saved data / a person sees something wrong / cosmetic.
2. **Where** — file and line.
3. **The scenario** — the exact steps a person takes and what they see, or the exact state and the wrong result.
4. **Why it is wrong** — the ruling, contract or doctrine it breaks.
5. **The fix, step by step** — precise enough to build from without re-deriving it (which function, what to change, what
   to test — and the test that would go red today).
Then a short list of what you checked and found RIGHT, so the absence of a finding means something. Do not edit any file
other than your report. Do not run the app's full test suite (another chat holds the PC's check lock); reading code, and
running ONE test file if you must, is fine.
