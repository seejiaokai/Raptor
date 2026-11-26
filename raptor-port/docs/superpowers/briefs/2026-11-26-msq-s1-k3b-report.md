# Section 1 (the guard rail) — step K3b's report: the note's five words he answered on 26 Nov (chat 204)

Built to `2026-11-26-msq-s1-k3b-brief.md`, on `claude/msq-s1-guard-6ae5e1`, nothing committed or pushed.

## The five leads as built (copied from `src/ui/guard.ts` `GUARD_LEADS`)

```
  windowOnTrackerInfo: 'close the open window on the Tracker’s Info tab',    // D2813
  rowOnSquadrons: 'save or cancel the open row on Squadrons',                // D2814
  giveAccessOnUsers: 'finish or cancel giving access on Users',              // D2814
  newSquadronOnSquadrons: 'save or cancel the new squadron on Squadrons',    // D2814
  addPersonOnUsers: 'add or cancel the new person on Users',                 // D2814
```

The apostrophe in "Tracker’s" is the curly one. Each was compared by eye with the picture he saw
(`docs/mock/2026-11-26-msq-questions/q19-20/q19-recommended-crop.png`, `q20a-`, `q20b-`, `q20c-`, `q20d-recommended-crop.png`)
and by a test with the brief's five literal sentences, letter for letter.

## What changed

- `src/ui/guard.ts`:
  - the five leads above, each with its ruling beside it;
  - `useGuardSection` takes `'squadrons'` too, and `squadronsOutOfSight()` reads it;
  - `GuardWordsAt` gains `squadronsOut`; `live` reads `usersOut` for `addperson` and `giveaccess` as well as the two rows,
    and `squadronsOut` for `newsqn`, `sqnmove`, `placeedit`;
  - `guardLead`: each of the five takes its new lead only while its section is not the one showing; a Tracker window
    behind the Flow chart tab takes the Info tab's lead, on another page too (the orchestrator's reading of D2813, said so
    in the comment as a reading); `placeedit` takes the open row's words (the words review's reading 1, said so);
  - the controls each new lead names are the same as its plain lead's (the Info tab's names none, as "…on the Tracker"
    names none; the section's own button is not added, matching `rowOnUsers`);
  - the stale comments ("…on Squadrons was reviewed, never drawn for him", "question 19 to him … until he has seen the
    Info tab's") corrected to cite D2813 / D2814.
- `src/ui/SquadronsPanel.tsx`: `useGuardSection('squadrons', shown)`, with a comment in the shape of the Users one.
- `src/ui/msq-guard-note.test.tsx`: the tests below.
- `docs/notifications-register.md`: it does not list the guard's note or its leads, so it was left unchanged.

## Tests — each seen failing first

Written before the code, run against the unchanged `guard.ts`: **7 failed, 51 passed**, each failure for the expected
reason (the new leads did not exist; `squadronsOutOfSight` was not there; the words said were the plain ones). After the
code: **58 passed**. Then, by the patch-file method (`git diff -- src/ui/SquadronsPanel.tsx > .tmp/k3b-panel.patch`,
`git checkout` that file, run, `git apply`): with the Squadrons panel's one line removed, **3 failed** (the two
"on Squadrons" tests and the section's report), so the line is needed; put back, all pass.

New:
- "the Squadrons section's report": in sight on Squadrons, out of sight on Users, nothing once Admin unmounts — and then
  each of the five rows takes its plain lead, never "on Squadrons" / "on Users".
- "the five sentences he saw, letter for letter": each constant joined to "then pick 149." equals the brief's literal
  sentence.
- "each new lead names the controls its plain lead names" (and the Info tab's names none).

Old expectations changed (each pinned the plain words with the section out of sight; now his words):

| Test | Old | New |
|---|---|---|
| Tracker window behind the Flow chart tab | `windowOnTracker` ("…on the Tracker") | `windowOnTrackerInfo` (D2813); the same test now also checks: back on the Info tab "close the open window"; on another page, not behind the tab, "…on the Tracker" (D2627 A7); behind the tab and on another page, the Info tab's words |
| A squadron's move / a place edited, Users showing | `row` ("save or cancel the open row") | `rowOnSquadrons` (D2814); back on Squadrons, `row` |
| "+ New squadron" typed, Users showing | `newSquadron` | `newSquadronOnSquadrons` (D2814); back on Squadrons, `newSquadron` |
| Add a person / Give access, Squadrons showing | `addPerson` / `giveAccess` ("none ruled for them") | `addPersonOnUsers` / `giveAccessOnUsers` (D2814); back on Users, the plain leads |

Unchanged and still passing: each of the four Admin states with its own section showing says its lead as today (the
"the words" block); `userrow` / `archrow` with Users out of sight say "…the open row on Users…"; a Tracker window
behind the Inputs tab says "…on the Tracker".

`src/ui/msq-guard-doors.test.tsx` (K4) reads every lead from the table; no case there typed a literal this step changes,
so nothing in it was changed.

## Checks (from `raptor-port/`)

| Check | Result |
|---|---|
| `npx vitest run src/ui/msq-guard-note.test.tsx` | PASS — 58 / 58 |
| `npx vitest run src/ui/msq-guard-rollcall.test.ts src/ui/msq-guard-g.test.tsx src/ui/msq-guard-doors.test.tsx src/ui/msq-squadrons-panel.test.tsx src/ui/msq-fix2-picker-keeps-own-squadron.test.tsx` | PASS — 5 files, 192 passed, 2 todo |
| `src/ui/msq-guard-open.test.tsx` | NOT RUN — nothing it reads beyond the words was touched (brief: only then) |
| `npm run lint:changed > .tmp/k3b-lint.txt 2>&1` | at the one finding that is not this section's (`ui/UsersPanel.tsx` line 350, `PersonEditor`, complexity); none new |
| `npm run build` | PASS (type-check and build) — under the checks lock, taken and released at once |
| `npm run docsize` | PASS — every record accounted for |

The lock was held by another chat's walk when first looked at; looked at again five minutes later it was free.

## Anything not built as written

Nothing. One comment outside this step's reach: `src/ui/UsersPanel.tsx` (read only for this step) still says its
section report is for "the open row on Users"; it now also serves "Add a person" and Give access (D2814). The chat that
is rebuilding that file may want to widen the comment.
