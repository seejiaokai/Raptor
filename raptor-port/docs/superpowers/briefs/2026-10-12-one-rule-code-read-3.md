# The brief — Fable's THIRD read: the last round of the one-rule job's check (`[ALL-AVAIL-AS-MEMBER]`) — 12 Oct 26

**Why:** since your second read (`2026-10-12-reads/one-rule-code-fable-2.md`, the branch at `2d53556c2`) four things
were built, all by Opus 5.5: your finding 1 (the history line's mark read back after a reload); eight fixes forced by
a second, blind read of the walked build by a fresh Opus reader; the owner's rulings D776 + D778 (a Personal input is
the same as an Event for people, and still not work); and D777 (the "OIL?" sign). You did not write any of it. You
are this job's independent reader (D758, D764). **Read-only: change no file but the one report named at the end; run
no build, no test, no browser** (the PC's check set and a walk of the running app may be in flight as you read).

## What to read
1. **The check's sheet:** `raptor-port/docs/handpass/2026-10-12-one-rule.md` — §3 (the roll-call), §10b (the Opus
   trial read's eleven claims and what was done with each), §10c (what was built on the rulings), §10d (the first
   re-walk). The trial read itself: `raptor-port/docs/superpowers/briefs/2026-10-12-reads/one-rule-code-opus-trial.md`.
2. **The rulings, in full** (the shell, never the Grep tool — a long row is hidden by it):
   `grep -h '^| D776 |\|^| D777 |\|^| D778 |\|^| D712 |\|^| D762 |\|^| D759 |\|^| D98 |\|^| D109 |\|^| D113 |\|^| D736 |' .claude/decisions-full/*.md`
3. **The diff:** `git diff 2d53556c2 HEAD -- raptor-port/src` — every file it touches read whole where the change
   sits; the commits `git log --oneline 2d53556c2..HEAD`. The area rules that govern it:
   `.claude/rules/decisions/scheduler.md`, `oil.md`, `leave-war.md`, `people-accounts.md`.
4. **The second re-walk's brief** — what a walker is driving on this build as you read:
   `raptor-port/docs/superpowers/briefs/2026-10-12-one-rule-rewalk2-brief.md`.

## What is asked
**Do not merely review the changed code.** Starting from the owner's promise in each ruling and each fix's own
sentence in §10b, enumerate every qualifying object, renderer, visible door, writer, reader, downstream consumer,
role, overlay and meaningful order of actions. **Assume every existing line may be correct and the defect may be a
MISSING call site.** For each item, state where the visible sign and the working gesture should exist in the
production app. Then rank concrete failure scenarios with setup, action, expected result, and the observation that
would disprove correctness. Start with the least-shared or most specialised surface.

1. **Your finding 1** (`engine/editlog.ts elogLoad` reads `one` back): fixed, and fixed right? Any other reader of a
   saved history line that keeps its own list of fields?
2. **The eight fixes — attack each as new code, and say what each could have BROKEN:**
   - `engine/inputown.ts pieceOf` and `putPerson` no longer pushing in place. Every OTHER place a record is copied
     shallowly and then changed (`{ ...row }`, `Object.assign({}, row)`, a spread into a new input): `ownInputOf` uses
     a JSON copy — anything else? Does any caller RELY on two records sharing a list (an entry stamped through one and
     read through the other)?
   - `ui/inputedit.tsx ownPartSave` (a throw rolls the one-man doors back whole). The other places in the diff's files
     where a batch's body answers `false` after it has already changed something — `ui/reqdoor.ts replace` and
     `leave`, `commitInput`'s own body, the Leave War's doors (`leavewar/sync.ts doorWrite` callers,
     `leavewar/inputgate.ts`): which of them can still commit half an act?
   - `engine/inputs.ts shapeProblem` — `LW_OWN`: a second person on a leave the Leave War approved is refused. Does the
     refusal reach every door (the window, the row's "+ add" — a leave has no programme row, the Unavailable row's
     swap, a restore by Undo of a record that already holds two)? Is any HONEST act now refused — the war extending an
     approved leave beside another, a member's own date edit (which clears `lw`) in the same save as an add?
   - `engine/overlay.ts asIssuedOrder` / `issuedRowOf`, and `slots.ts acceptInput`: where the row's people are the ones
     the issued day's row held, it is written in the issued order. Attack: the marks on pucks (`g:di.ri.xN` are
     positional — `state/holderbase.ts requestAddMarks`, `engine/restore.ts dayKeys`, `canonical.ts`); the armed
     place; `srcv` now matching a row whose order differs from `requestRowFields`; a week that is not on screen
     (`ctx.issued` there); a day published BEFORE this build whose issued row is in the old shape; a placeholder among
     them; the same people with one REPLACED and put back.
   - …and the same body's new skip test, `row.srcv === sv && shows(row) === shows(f)`: a row is re-made whenever it
     differs from what its input writes. Is anything a row legitimately carries apart from its input now wiped on
     every read (a row `kept`, a request taken off — rule 4 runs first; `who` stored as a callsign in old data)?
     What does it cost on a week of many rows (it runs after every command)?
   - `engine/publish.ts`, the people step: the unit that seats the man replaced somewhere else is given back as its
     own item. Attack the count: a swap from ANOTHER input's row, from a duty desk, from a sim seat; the same swap
     undone; the same swap on a day that earns (the OIL fold); "Discard N edits" (`dayDiscardCount`) and the published
     amendment's own item count beside the day head's — do all readers still agree?
   - `engine/inputs.ts frozenInputMatch` 3b: a piece pairs only where it carries the frozen record's own `by` and
     `at`. When is a REAL piece now missed (a piece whose `by` was passed on by `byAfterLeaving`; a record stamped
     before D629 with neither; a piece re-stamped by `stampPlaced` — does any door do that to a piece?) and counted
     as a filing of its own?
   - `state/person-delete.ts passBy`, `state/inputstamp.ts stampWho`, `ui/inputedit.tsx reassignInput`: "By" passes to
     the admin who deletes or swaps out the filer. The posting pass that runs a delete by itself, inside someone
     else's command (who is `stampWho()` then — and should a MEMBER whose visit triggered it become "By"?); Undo of
     the delete; the permissions check on what a command changed (`perms.ts inputBreach`, `ownPart`) for the swap.
3. **D776 + D778 — a Personal input like an Event for people, still not work.** The owner's words and the agent's
   readings are in the full rows. Find what is MISSING: every place that still treats the Personal kind apart
   (`grep -rn "Personal'" raptor-port/src --include=*.ts --include=*.tsx`, tests apart — crew rest and OIL are meant
   to: D778 "not work"); the men behind its ALL AVAIL (`engine/oilev.ts` — the membership-only pass: is the crowd
   written for every day a reader asks, frozen at publication, read by the count chip, the ALL AVAIL window and the
   pending count; can any path CREDIT it — `oilEarnedWork`, the Leave War's OIL pass, the legacy readers, a
   scheduler's "allow" — or ask its OIL question — the save's gate, the row's door, the bell, the new "OIL?" sign);
   the availability a man behind it is given (does a Personal input holding ALL AVAIL make every free man read
   "busy"? compare with an Event's); the warnings (clash, crew rest — unchanged for the kind?); a member filing it for
   others with the switch off, and what `docs/data-model.md` §11 says.
4. **D777 — the "OIL?" sign.** `ui/inputedit.tsx oilSignDay` is `oilUnansweredDay(row) && mayEditInput(row)`. Is "may
   edit" the same as "may answer" for every reader — the input's only person, its filer after a scheduler put someone
   in, a member with the switch off, the admin in the member view (D292), a guest? Where is the question unanswered
   and NOBODY sees the sign? Where does the sign show and the question cannot be answered (a cancelled input, an
   information-only one, a day the Leave War has no period for — D19, a read-only week)? Is there a third place that
   draws an input's card or row and now disagrees (the SANS day, the schedule's Personal Inputs line, View-only
   Sched)? The desktop row's new button for an input of several opens `reviseOil` — is one answer written for
   everyone, stamped, one Undo step?
5. **The Opus trial read's negatives** (its "traced and found sound") were the builder's own model reading its own
   code. Name any you have reason to doubt after this round.
6. **Scenarios the second re-walk does not drive** and should — as a person would do each, with what must be seen.

## Not findings
Harm that lives only in stored demo data when the code is right going forward (D56 — the whole store is demo data,
cleared before the database step; if the app would do it again to NEW data, report it). The behaviour register's ids
not yet wired into the rule check. Words filed in `OUTSTANDING.md` `[ONE-RULE-SMALL-WORDS]`.

## How to report
A claim is a finding only with a concrete failure, its cause, whether it is silent, whether it is new against
`2d53556c2` or older, and step-by-step fix instructions precise enough to build from; explicit negatives for what you
traced and found sound. End with a verdict — **CLEAN / CLEAN WITH THESE EXACT CHANGES / NOT CLEAN** — on the branch as
it stands, and what, if anything, must be fixed before the owner's "merge live". **Save the whole report yourself**,
with the Write tool, to
`C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/briefs/2026-10-12-reads/one-rule-code-fable-3.md` (that
one file only), and hand back a summary of at most forty lines: the verdict, each finding in one sentence with its
severity, and the scenarios for the walk.
