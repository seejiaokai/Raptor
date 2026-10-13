# Read of D804 — "→ Unavail" waits on its OIL question (Fable 5.1, blind, 13 Oct 26)

Brief: `docs/superpowers/briefs/2026-10-13-unavail-file-read.md`. Commit read: `cf0d9061f`, branch
`claude/inputs-schedule-batch`. Read-only; one unit file run at a time; no build, no browser. The other readers' reports
were not opened.

## Verdict

The change is right and complete for what D804 asks of this door. "→ Unavail" now runs the same gate as "Accept":
the question is put only where the input needs an answer, nothing is written until it is answered, the answer and the
filing are one command and one Undo, and "not answered" leaves the bar in the filing's own words. Every reader of the
wait's kind is a plain lookup (the sheet, the bar, the "has changed" note), so the fifth kind breaks nothing beside it.
I walked every other way an asking input can come to stand under Unavailable and found no gap: the only door that
files an input under Unavailable is this button; every other way either asks in its own window (a retype, a re-date, a
calendar drag, a person swap on the Unavailable row — all gated before the write already) or is a way D793's reading 3
says never asks (Undo/Redo, a week load, the working-out after a command, a plan switch, a template, publishing). I ran
the seven D804 unit tests (7 of 7 pass) and four probes of my own on a scratch test (a published day: nothing pending
and still signed while the question stands; answered, one pending item and the sign-offs fall; one Undo puts it all
back — a shared Other: the question is headed for everyone and the one record is filed with one answer — a No leaves
no "OIL?" sign — a cancelled Other). No finding at High or Medium. One Low (shared with Accept and the input's window,
not introduced here), one note on the tests, and one housekeeping matter the host must act on: **my scratch test was
swept into the branch by the host's commit `2de26dd07` (15:55:46) while it existed on disk; I deleted it from the
working tree, so it now shows as an unstaged deletion — the host must commit that deletion (I may not commit).**

## Findings, ranked

### F1 — Low — a cancelled Other is still asked the OIL question at this door (and at Accept, and in its window)
- **Failure:** an Other with the scheduler's CX on it (D760 — the CX is the input's), taken off, then "→ Unavail": the
  OIL question is put ("Filing Ranger's … under Unavailable", Yes/No), although a cancelled input earns nobody OIL
  whatever is answered (D760 reading 1; `engine/oilev.ts landedStanding` → `cx` → `standEarns` false). The scheduler
  answers a question that can change nothing.
- **Cause:** `leavewar/sync.ts oilAskPlan` (what `ui/inputedit.tsx oilGate` prices) never looks at `cx` or `info`; the
  one list (`oilOpenOn`) and the bell's scan don't either. So the gate says 'ask' for a cancelled input at every door —
  the input's own window, Accept (D793), the calendar drag, and now this one. Pre-existing and app-wide; this change
  only brought one more door to the same gate.
- **Fix (if he wants it; a product choice — D760 says cancelled earns nothing, it does not say "never asked"):** in
  `oilGate` return `{ kind: 'none' }` when `prevRow && (prevRow.cx || prevRow.info)` — one line, every door at once;
  then the one list and the bell's scan skip `row.cx || row.info` the same way (`oilOpenOn`, `oilPendingFor`), so an
  "OIL?" tag is not shown for a question nobody can usefully answer. File it, do not fix it in this batch.
- **Reproduced:** my scratch test (deleted): `r.cx = true` on a filed Other, press x, press u → `OILWAIT` set.

### F2 — Note (tests) — one new test fails without the change for a reason other than its name
- "(D804) taking it back OUT of Unavailable asks nothing, and its answer stays on the record": before the change
  `press('u')` filed at once and asked nothing, so `answerOilWait(...)` returned false and the test failed on its
  setup line — not on the take-off it is named for. The take-off's own claim (`press('x')` asks nothing, the answer
  stays) was true before and after. Harmless; worth knowing when reading "six failed before".
- The other six: five fail before the change for the reason named (no wait, no bar, nothing filed with an answer); the
  fifth, "where nothing is to be asked … files it at once, as before", passes before and after by design (a guard).
- **Claims of the ruling no test at this door holds:** a shared Other through "→ Unavail" (headed for everyone, one
  answer — I probed it, right); the published-day case for the `file` kind (the `back` kind has one; I probed it,
  right); a refusal AFTER the answer for the `file` kind (same code path as `back`, which has the test). None is a
  defect; the first two would be cheap to pin.

## Question 1 — the answered path, line by line, for `dest === 'u'`

`press()` (`ui/interactions.ts` ~791): `off(r)` is true for 'r' and for no `acc`; the gate runs on `draftOf(r)` with
the toast muted; `dryRun(acceptInput(di, …, 'u'))` tries the filing and throws it away — a placeholder input, a locked
week, an already-filed one are refused in the real run's words and nobody is asked (I checked `acceptInput`'s refusals:
`isUnavail`, placeholder, protected week, `acc` not 'r'). `holdForOil` with kind `file` and the filing's lead. `redo`
and `ask` keep `off()` and `here()` — `here` matters here too (the card's day is kept in the bar; the input's dates can
move under it).

`run(x, oil)` → `saveBatchX`: `commitInputEdit(x, draftOf(x), …, { sched: true, oil })` then `acceptInput(di, …, 'u')`
then `reconcileIssuedMarks([di])`. For 'u':
- `commitInputEdit` with `sched: true`: the late mark is not moved (`r.mod` untouched), a Yes is repriced not voided,
  the answer written last (`opts.oil`), `acc` untouched (type unchanged, not a placeholder). Right for both doors.
- `acceptInput(…, 'u')`: `inp.acc = 'u'; markEdit()` — no row, no structural add. Right.
- `reconcileIssuedMarks([di])`: walks the day's pending keys against the issued snapshot; a 'u' filing writes no row and
  no key, so it is a no-op here — harmless, and it keeps the two doors one body. Right.
- A refused filing after the answer throws `CmdRefused` inside the batch, so the answer is not kept without it — the
  `back` test pins that path; identical for `file`.
- `refusalWords` for 'u': "already on the programme" cannot apply to an 'r' input (no standing row); a locked week says
  "can't be changed here right now". Fine.
- The note: "<who>'s <input> filed under Unavailable" — right; no `afterSchedMutate` second step (the inputs batch is
  the command; its epilogue re-runs the rules — `runInputWrite` → `HOOKS.reflow`, and `tryInputsBatch` re-validates
  after a throw-away, so the warnings behind the question are the day's as it stands).
- Published day (probed): while the question stands, nothing pending and the sign-offs hold; answered, ONE pending item
  (`kind: input`) and the four sign-offs fall (D103, D114 — one change, not two); one Undo: 'r' again, no answer, nothing
  pending. The change history writes two lines for the one command — "filed: taken off → under Unavailable" and
  "OIL: not asked → earns part OIL" (`state/changelines.ts`, one line a thing that changed, by design).
- The bell: nobody else is told (D783 (4)); the one list and the bell's holiday line include a 'u' input while it has no
  answer (`oilOpenOn` skips 'r' only) — D804 reading (2), as built.
- Earning: `landedStanding` reads 'u' as `unlanded`, which credits the input's own answer — a Yes earns, a No does not
  (D804 reading (2)); my "No leaves no OIL? sign" probe agrees.

## Question 2 — what else reads the kind

`OilWaitKind`: `state/view.ts` (the type), `ui/oilwait.ts` (`WAIT_WORDS`, `CHANGED` — both extended), `ui/OilWaitSheet.tsx`
(`WAIT_WORDS[w.kind]` — a lookup, nothing switches on four kinds), `ui/inputedit.tsx oilFirst` and `ui/reqdoor.ts` (carry
the kind through). `OILWAIT.kind` is only ever compared in tests. The sheet (`oilconf`) takes `lead`, `noLabel`,
`yesLabel` from the wait — the e2e route checks the three words for both doors. Nothing broke.

## Question 3 — every way an asking input can stand under Unavailable (`acc === 'u'`)

| The way in | Asks / must not / GAP | Where |
|---|---|---|
| "→ Unavail" on the card or line (Other, taken off or never landed) | **Asks** — the question first, filed only on an answer (D804) | `ui/interactions.ts press()` |
| "→ Unavail" where nothing is to be asked (answered — a No included; a working day) | must not — files at once | same; test 5 |
| The same button for a kind that is never asked (Personal, leave, medical) | must not — not drawn for them (`accCtl` draws it for Other only); a hand-made press: Personal → gate 'none'; leave/medical → `acceptInput` refuses `isUnavail` | `ui/html.ts accCtl`, `engine/slots.ts acceptInput` |
| A hand-made press for an OD (asks, but `isUnavail`) | must not — the gate would ask, but `dryRun` finds `acceptInput` refuses, so the real run refuses in words and nobody is asked | `press()`'s `dryRun` |
| A placeholder (ALL / ALL AVAIL) Other | must not — no button; `acceptInput` refuses 'u' for a placeholder | `accCtl`, `acceptInput` |
| The input's own window: a 'u' Other retyped to another asking kind | **Asks** in the window (retype voids the answer → stale → `oilGate` 'ask'); stays 'u' (only a retype to leave/medical/OD clears it) | `ui/inputedit.tsx` ~2603, ~1300 |
| The window: a 'u' Other re-dated onto a holiday | **Asks** in the window before the save | same |
| The window: remarks-only edit of an unanswered 'u' Other | asks (no answer covers the day) — the window's standing rule | `oilGate` |
| The board's "+ Add" under Unavailable (`_ctx: 'u'`) | must not — offers leave / medical / OD only, never Other; an OD asks in its window and never carries `acc` | `TYPE_ALLOW.u` |
| The Inputs page / calendar / list | no control files under Unavailable (no `Unavail` in `InputsPage.tsx`, `InputCard.tsx`, `InputsCal.tsx`) | — |
| The Inputs calendar's date drag of a 'u' Other onto a holiday | **Asks** first (`oilFirst` kind `move`), made with the answer; stays 'u' | `ui/caldrag.ts commitChipMove` |
| The Unavailable row's person cell — a man dropped or planted on a 'u' Other | **Asks** first (`oilFirst` kind `swap`) for the new holder; stays 'u' | `ui/inputedit.tsx reassignInput` |
| In-place time cells on the Unavailable row of a 'u' Other | must not ask — a Yes is repriced, a No kept (D739 (4), D740 (4)); unanswered stays unanswered for the tag and the bell | `commitInputEdit` with `sched` |
| Undo / Redo of the answered filing | must not — an Undo never asks (D793 (3)); Redo re-files WITH the answer | `undo` |
| Undo of a take-off of a 'u' input | must not — back to 'u' with its answer | `unacceptInput` → Undo |
| The working-out after every command | must not — 'r' and 'u' are a scheduler's decisions and stay | `state/holderbase.ts` ~196 |
| A week load / plan switch / template / recovery | must not — 'u' kept (`store.ts` 654, 1004; `reconcileDayFiling` skips 'u'; D96 no template on a published day) | — |
| Publishing | must not — publishes the filing as it stands; a 'u' Yes earns, a No or no answer does not (D2, D142) | `engine/oilev.ts` |
| A day made a holiday after a 'u' Other was filed | must not file — the one list opens and includes the 'u' input; "Later" sends it to the bells (D783 (5), (6)) | `leavewar/sync.ts oilOpenOn` |
| The Leave War approving a bid | must not — leave only, never an asking kind | `leavewar/sync.ts` |
| A paste / a puck drag | must not — pucks and rows only; no path writes `acc` | `ui/drag.ts` (the `iu:` target is the person swap above) |
| A hand-made `acceptInput(di, inp, 'u')` (tests, the probe bridge) | not an app door | — |

**Ways in listed: 22. Gaps: 0.** The reverse (asked where it should not be): a cancelled or information-only Other is
asked — F1, Low, shared with every other door.

## Question 4 — the tests

- Unit (`src/ui/oilwait.test.tsx`, the seven "(D804)" tests): **ran, 7 of 7 pass** (`npx vitest run src/ui/oilwait.test.tsx
  -t D804`). Fail-before reasoning per test is in F2.
- Browser (`e2e/oilwait.spec.ts`): **not run** (a build is forbidden by the brief). Read: the `DOORS` table drives the
  same route for 'g' and 'u' at the three sizes — the lead, the two buttons, the bar's words, `filed()` 'r' while it
  waits and after "Don't file", then 'u' with `{ [FRI]: 0.5 }` after "Answer OIL" → Yes → File. It would fail before
  the change at `toHaveText(door.lead)` for the 'u' door (no sheet). Right.
- Claims no test holds: in F2.

## What I did not read

The e2e harness (`e2e/app.ts`, `fileIt`, the size table) beyond the changed lines; `ui/reqdoor.ts` beyond its `gate`
lines; `engine/publish.ts filingDelta` (I relied on the probe's pending count and sign-offs instead of reading the body);
`engine/drafts.ts reconcileIssuedMarks` beyond its head; `ui/OilConfirm.tsx` (the sheet's own body — the sheet is
unchanged and the e2e checks its words). I did not read any other reader's report, nor
`docs/handpass/2026-10-13-inputs-batch.md`.

## Tidiness (filed, not fixed — D489)

- `engine/oilev.ts` ~386: the comment "dormant, or a kind that never lands" is stale for 'u' since D804 — an Other under
  Unavailable asks and earns on its Yes; say "filed under Unavailable (asks and earns on its own answer)".
- `state/view.ts` ~404 says a page change takes the waiting change and the bar away, but `VIEW_RESET` scopes them to
  `session` and `week` only; the `off()`/`here()` guards keep "Answer OIL" safe across a page change, so the comment is
  what is wrong, not the behaviour.
- `state/view.ts` ~407: "kind — which words: swap / add / move" now has five kinds.

## Housekeeping — for the host, before anything else

My scratch test `raptor-port/src/ui/zz-d804-scratch.test.tsx` existed on disk from 15:54 to 15:55; the host's commit
`2de26dd07` ("[RULING D812] …", 15:55:46) added it to the branch. I deleted it from the working tree the moment I was
done; `git status` now shows it as an unstaged deletion (` D`) beside this report. I may not commit, so the host must
commit the deletion (or amend `2de26dd07` if it has not been pushed). Nothing of mine is otherwise on the branch.
