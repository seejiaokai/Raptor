# A blind read of "→ Unavail" waiting on its OIL question (D804) — the Opus reader, 13 Oct 26

Brief: `raptor-port/docs/superpowers/briefs/2026-10-13-unavail-file-read.md`. Commit read: `cf0d9061f`, on
`claude/inputs-schedule-batch`. Read-only; nothing built; no browser test run. Unit files run, one at a time:
`src/ui/oilwait.test.tsx` (55 of 55 pass) and two scratch files of my own, since deleted (`git status` clean of them).
"Reproduced" below names the scratch case; "read" means the code was read and not run.

## Verdict

**The change is right and complete at its own door, and it broke nothing beside it.** "→ Unavail" on an input that
needs an OIL answer now writes nothing and puts the question; answered, the answer and the filing are one command and
one Undo (and one Redo); not answered, nothing is filed and the bar says so; where nothing is to be asked (a working
day, an answer already given — a No included) it files at once as before. I found **no high or medium fault in the
change itself**. Two low findings sit BESIDE it: the member's bell says "Back on the programme" every time his input
is filed under Unavailable (older than this change, but it is what this button makes the app say), and "Load onto
working copy" puts an input back under Unavailable — or back on the programme — with nobody asked, which is neither
D804's door nor an Undo. Of 21 ways in that I listed, 1 is a gap (the version load) and none asks where it should not.

## Findings, ranked

### F1 — LOW (older than D804; said by this button on every use) — the member's bell reads "Back on the programme" when his input is filed under Unavailable, and "Taken off the programme" when it is taken out of Unavailable

- **Failure.** Ranger's Other on Saturday; Saber takes it off the programme (bell: "Taken off the programme" — right),
  then presses "→ Unavail" and answers. Ranger's bell gains **"Back on the programme"** — it is not on the programme,
  it is under Unavailable, where it closes him for the day. Saber then presses Undo on it: the bell gains **"Taken off
  the programme"** — it was never on it; Saber's own note for that same press says "taken out of Unavailable"
  (`ui/interactions.ts:756`, written precisely because "it was never on the programme"). Since an Other lands on the
  programme by itself, "taken off" is the only state from which the button is offered — so every filing under
  Unavailable sends the wrong line.
- **Cause.** `src/state/notices.ts:98-99` (`common`) knows two states only — "taken off" (`'r'`) and everything else —
  and `partWords` (`:288-289`) has only "Taken off the programme" / "Back on the programme".
- **Fix.** In `notices.ts`: add two parts to `NoticePart` — `{ k: 'unav' }`, `{ k: 'unavoff' }`; in `common` replace
  the two lines with: `if (b.acc !== 'u' && a.acc === 'u') out.push({ k: 'unav' })` · `else if (b.acc === 'u' && a.acc === 'r') out.push({ k: 'unavoff' })` ·
  `else if (b.acc !== 'r' && a.acc === 'r') out.push({ k: 'off' })` · `else if (b.acc === 'r' && a.acc !== 'r') out.push({ k: 'on' })`;
  in `partWords` add `'unav'` → "Filed under Unavailable", `'unavoff'` → "Taken out of Unavailable". The two wordings
  are words on a screen — his to approve (D769, D806). A test beside the notices' own, and one line in
  `oilwait.test.tsx`'s D804 block reading the bell after the filing.
- **Reproduced** — scratch case A: the bell's lines for Ranger read, in order, "You were added", "Taken off the
  programme", "Back on the programme" (after the filing under Unavailable), "Taken off the programme" (after it was
  taken out), while Saber's notes read "filed under Unavailable" and "taken out of Unavailable".

### F2 — LOW (a gap by the brief's own test; his to rule) — "Load onto working copy" puts an input back under Unavailable with nobody asked

- **Failure.** Friday 17 Jul, a working day. Ranger's Other is taken off and filed under Unavailable (nothing asked —
  a working day), and Friday is published. Friday is then made a public holiday; the list is left for later. Saber
  takes the input out of Unavailable. From here "→ Unavail" asks (D804 — checked in the same run). Instead Saber loads
  the published version back onto the working copy: the input is **under Unavailable again, with no answer, no
  question and no bar**. The same load puts a Training back ON the programme the same way, where "Accept" would ask
  (D793). Afterwards it is not silent — the input wears its "OIL?" tag and the one list counts it again — but at the
  moment it is put back nobody is asked, which is what D793 and D804 were ruled to end at the two buttons.
- **Cause.** `src/engine/drafts.ts:670-671` — the load sets each request's filing back to what the version froze
  (`filingRestorePlan`, `engine/publish.ts:931`), straight onto the record; its door (`ui/interactions.ts:1249`) has no
  OIL step. It is not an Undo, so D793's reading 3 does not cover it; nothing I found rules it.
- **Fix.** His choice first: (a) rule a version load a restore that never asks, as an Undo is, and write that beside
  D793 reading 3; or (b) never silent at the load: it cannot wait on a question (it replaces a whole day), so the
  question FOLLOWS it — in the `data-restore` handler, note each covered input's filing before the load; after it, for
  those the load moved to "on the programme" or "under Unavailable" that `oilUnansweredDay` names, add
  " · N input(s) put back need an OIL answer" to the load's sentence and open that day's one list (the opener the
  holiday uses). The shape `oilFirst` already takes when a try and a save disagree (`inputedit.tsx:1435-1438`).
- **Reproduced** — scratch cases L1 (Other: after the load `acc 'u'`, no answer, no question, no bar, the list holds it
  again) and L2 (Training: `acc 'g'`, its row back, no answer, no question), each with a real holiday made through
  the Leave War's own `holidayAdd`, and each with the control that the button itself asks.

### Notes — not findings

- **N1 — the tests (question 4).** Run against the door as it was (the gate made to answer "nothing to ask", which is
  exactly the old branch): six of the seven D804 tests fail and one passes, as the commit says. `803` and `843` fail on
  the claim their name gives ("nothing moved"); `819` and `834` fail because no question was ever put; **`879` and
  `893` fail in their set-up, not on their named claim** (`879`: the Undo undid the filing instead of the take-off;
  `893`: no question to answer — "taking it out asks nothing" was already true); `866` passes either way, as a guard
  should.
- **N2 — claims of the ruling no test holds for the filing's own kind** (each passes today — scratch cases B2, C, D,
  E, F, G, H — so these are pins to add, not faults): on a published day nothing waits to go out until the answer is
  given, and an Undo takes it back to nothing; a filing refused AFTER the answer keeps nothing, the answer included;
  an answer arriving after the input was put on the programme another way; an Other of several people ("Filing 3
  people's … under Unavailable", one answer for all, Undo and Redo); pressed on Friday's card of a Friday-to-Saturday
  input, the question is Saturday's; "Answer OIL" after the input moved off the card's day; a filing the save would
  refuse is refused before anyone is asked. The `back` kind has each of these; the `file` kind shares the code but
  not the pins. Also unpinned: the member's bell (F1) and a Redo.
- **N3 — a cancelled or information-only Other is still asked** at this button though it can earn nobody anything
  (`oilev.ts:384-385`). Every door asks it alike (Accept, the window, the list) — not this change's, and not judged.

## Question 1 — the walk of the door for "under Unavailable"

| Step | What it does for `dest === 'u'` | Right? |
|---|---|---|
| `press()` gate (`interactions.ts:799`) | asked only where the input is neither on the programme nor filed | yes |
| the try (`:800`) | `acceptInput(di, …, 'u')` run and thrown away; a locked week, a leave or medical kind, an ALL AVAIL input refuse here, so nobody is asked for them | yes — reproduced H |
| `holdForOil` (`:807`) | kind `file`, "Filing <who>'s <input> under Unavailable", headed for everyone in it | yes — reproduced E |
| answered: `commitInputEdit(…, { sched: true, oil })` then `acceptInput(…, 'u')` | the late date is not moved; the answer replaces whatever stood; kind and filing untouched until the second step | yes |
| `reconcileIssuedMarks([di])` | does nothing here — a filing writes no row and no mark; it is counted from the filing itself (`publish.ts filingDelta`) | harmless |
| published day | asked: 0 waiting; not answered: 0; answered: 1 (the filing), the same count the plain button gives for an input answered beforehand; Undo: 0 | yes — reproduced B1, B2, B3 |
| `refusalWords` | a refused filing says "… can't be changed here right now"; "already on the programme" only where its row does stand | yes — reproduced C, H |
| the note | "… filed under Unavailable"; several: "3 people's … filed under Unavailable" | yes |
| `off()` in `redo` / `ask` | filed or put on the programme meanwhile → "That input has changed — not filed", nothing written, no answer kept | yes — reproduced D |
| `here()` in `redo` / `ask` | stricter than a filing needs (it writes no day) but truthful: moved off the card's day → "has changed — not filed" | yes — reproduced G |
| the change history | two lines from the one writer: "filed: taken off the programme → under Unavailable", and "OIL" | read |
| the member's bell | wrong words — F1 | **no** |

Sign-offs were not observed (the harness's hand-set signatures read empty from the start); read only: the signature
binds to the filing and to the whole waiting comparison (`publish.ts:1484`), as for the plain button.

## Question 2 — beside it

Every reader of the kind: `state/view.ts:416` (the type), `ui/oilwait.ts` `WAIT_WORDS` and `CHANGED` (both typed by the
kind, so a fifth kind cannot be added to one and not the other), `ui/OilWaitSheet.tsx:26` (words by kind, nothing
else), `ui/inputedit.tsx oilFirst` and `ui/reqdoor.ts` (pass their own kinds through). No style, test id or branch is
keyed on a kind; the sheet (`OilConfirm`) takes its two labels as words. Nothing assumed four. No other test or
browser spec presses this button on a non-working day; the one older walk script that does (`scripts/handpass/am/w4-00d-unavail-door.mjs`) files on a Tuesday.

## Question 3 — every way in

| # | The way in | Asks / must not / GAP | Where |
|---|---|---|---|
| 1 | "→ Unavail" on its card or line, week and board | **asks** (D804) | `ui/interactions.ts:791-818` |
| 2 | The bar's "Answer OIL" after "Don't file" | **asks** afresh; files at once if answered meanwhile; says "has changed" if it moved | `ui/oilwait.ts:103`, `interactions.ts:815` |
| 3 | Undo of a take-out; Redo of a filing | **must not** (D793 reading 3) — reproduced E | the Undo's own restore |
| 4 | "Load onto working copy" of a version that had it filed there | **GAP** — F2 | `engine/drafts.ts:670-671`, `interactions.ts:1249` |
| 5 | A plan switch | never files there (re-derives "on the programme" only) | `engine/drafts.ts` `draftSelect` → `reconcileDayFiling` |
| 6 | A day template | never files there; refused on a published day | `engine/daytpl.ts:230` |
| 7 | A week load; the app starting | keeps the filing as stored; **must not** ask — a load is nobody's act | `state/store.ts:654`, `:1004` |
| 8 | The working-out after every command | never sets or clears it | `state/holderbase.ts:196`; `engine/overlay.ts` writes no filing |
| 9 | Publishing, unpublishing | read and frozen, never set | `engine/publish.ts:537`; `state/sched-commit.ts:296` |
| 10 | A new input from the board's "+ Add" / "+ Inputs" (a save with `_ctx`) | never files an activity kind there (the Unavailable panel's add offers leave, medical and overseas duty only); the window's own gate **asks** at Save, an overseas duty included | `ui/inputedit.tsx:834-844`, `:2603` |
| 11 | A drag | nothing dropped files an input there; a man dropped on its Unavailable row **asks** first | `ui/inputedit.tsx:1515`, `:1551` |
| 12 | A paste | none exists in the app (searched) | — |
| 13 | The Inputs page, list and calendar | no such button there | `ui/html.ts:2220` is drawn by the week and the board only |
| 14 | The Leave War | writes leave only — never asked | `leavewar/sync.ts` |
| 15 | Its own window while filed there: days, hours, person, kind to or from Other | **asks** at Save — the gate does not look at where it is filed; to leave or medical it leaves Unavailable and is never asked | `ui/inputedit.tsx:2547`, `:2603`, `:1300` |
| 16 | Its bar dragged to another date on the Inputs calendar | **asks** first | `ui/caldrag.ts:158` |
| 17 | Another man tapped or dropped onto its Unavailable row | **asks** first | `ui/inputedit.tsx:1551` |
| 18 | A time or remark typed on its row by the scheduler | **must not** (D739 reading 4 — a Yes kept at the new amount, nothing opened); its days cannot change there | `ui/inputedit.tsx:1682` |
| 19 | Its day made a holiday afterwards | **asks** — the one list and the bell count it (only "taken off" is skipped) — reproduced L1 | `leavewar/sync.ts:866` |
| 20 | The one kind under Unavailable by nature that asks — an overseas duty (a Course is a programme kind) | **asks** by 10, 15, 16, 17, 19; there is no button for it | `engine/inputs.ts:393`, and as above |
| 21 | ALL AVAIL / ALL put into it — it leaves Unavailable for the programme | **asks** — inside the window's save, whose gate asks | `ui/inputedit.tsx:1928`, `:2547` |

**21 ways in; 1 gap (row 4).**

**The reverse — does it ask where it should not?** No case found. A Personal input, leave, medical, SANS availability
and an upchit are not offered the button, and the write behind it refuses or never asks them; a working day asks
nothing; an input already answered — a No included — asks nothing (pinned, `oilwait.test.tsx:866`); a filing the save
would refuse asks nobody (reproduced H); pressed on Friday's card of a Friday-to-Saturday input it asks Saturday's
question, which is right — the filing is the whole input's (reproduced F). The one oddity is N3.

## What I did not read or run

- `raptor-port/docs/handpass/2026-10-13-inputs-batch.md` and every other reader's report — not opened. Two slips to
  declare: a `git log` line I ran showed the subject of the commit that filed Fable's read ("no high or medium
  finding; 22 ways in, 0 gaps") — after my own table was made; and my first scratch file's name
  (`src/ui/zz-d804-scratch.test.tsx`) was the name another reader chose — it was overwritten by theirs between two of
  my commands, so one run of mine executed their file (I saw a pass/fail count, nothing more) and I read its first
  dozen lines (imports) finding out why. I changed nothing in it and moved to names of my own.
- The browser route (`e2e/oilwait.spec.ts`) — read, not run (no build allowed). The full unit suite — not run.
- Question 4 was answered by making the gate say "nothing to ask" for the press, not by checking out the old commit.
- The change history's two lines and the changes window's words for a filing under Unavailable — read, not run.
- The OIL credit for a Yes under Unavailable (`engine/oilev.test.ts`, named by D804's row) — not opened.
- The look of the sheet and the bar on a screen — nothing here was looked at in a browser.

## Tidiness — filed, not fixed (D489)

- `ui/oilwait.ts:27` says "the three kinds' words" and `state/view.ts:407` lists "swap / add / move" — there are five.
- `ui/oilwait.test.tsx:703` and the browser spec's `describe` are titled "put BACK on the programme" and now hold the filing's tests too.
- `interactions.ts:799` — `(dest === 'g' || dest === 'u')` is always true there (the take-off never reaches `press()`).
