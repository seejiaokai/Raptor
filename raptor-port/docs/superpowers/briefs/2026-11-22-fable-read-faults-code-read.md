# The code read of [FABLE-READ-FAULTS] (22 Nov 26, chat 133) — the brief, the same for both readers

Do not open `HANDOFF.md`, any file under `raptor-port/docs/handpass/`, or any other reader's report: you read blind.
Change no file. Report only.

**What changed:** `git diff 8ef011c73 dacbf6a01 -- raptor-port/src` (the commit `dacbf6a01` on `claude/fable-read-faults-4104f0`;
`8ef011c73` is `main`). The faults it fixes, each with its case and cause: `raptor-port/docs/superpowers/briefs/2026-11-21-msq-fable-never-read.md`
§2 (Leave War F1), §3 (Inputs F1–F4), §4 (OIL F1). Two were proved but not built (OIL F2, Leave War F2): their proofs are kept as
`it.fails`; they are not yours to read.

**The rulings that govern it** (open the pages; a ruling's full row: `grep -h '^| D327 |' .claude/decisions-full/*.md`):
`.claude/rules/decisions/oil.md`, `inputs.md`, `leave-war.md`, `scheduler.md` (its late-mark lines under "Settled before this
list", and "Nothing on a published schedule may change…"), `people-accounts.md` (posting out, SANS, D283, D327). `src/engine/` is a
verbatim port: a change there must be the behaviour change only.

**The money and the record at stake:** OIL is earned time off, never money, but owed all the same. A published day's crowd
behind ALL AVAIL is frozen at publication (D44, D45); its latest published version decides the day's OIL (D142).

**What to look for — what is MISSING, not only what is wrong:**
1. OIL F1 (`leavewar/sync.ts sansSince`, `availableFor`; `engine/publish.ts peopleAttrsNow`): is there any path where a man posted
   out as SANS still drops out of, or wrongly stays in, the crowd of a day — before, on and after the posting date; a posting moved,
   undone, re-run, or still to come; a hand SANS tick; Quals untick then re-tick; a man NAMED on the day as well as in a crowd? Can
   the `peopleAttrsNow` change hide a real change that should read pending?
2. Leave War F1 (`leavewar/state/store.ts outsideSource` in `figureCtxOf`): can a date be counted twice (held by a war AND outside),
   or a stale cache be read (the memo keys on the absence index and the wars array)? Does every reader of `figureCtxOf().sources`
   (counters.ts, approvals.ts `ownDays`, `withFill`, the OIL tracker, Balances, My leave, sync.ts's withdrawal warning) behave with a
   source that has no period? Does a period made later change any figure?
3. Inputs F1/F2 and the ✕ (`ui/inputedit.tsx commitInput`, `draftChanges`; `ui/InputWindow.tsx unsavedFields`, `saveNow`): is
   anything a person can change in the window still able to be lost while the window says saved, or closed without the question?
   Is each fixed save one Undo step? Does a man who may not change a shared input for everyone get a clean refusal?
4. Inputs F3/F4 (`engine/inputs.ts laterMod`; `ui/interactions.ts` the LATE chip's tap): can the LATE mark now show where the
   scheduler's settled rule says it must not — a change a scheduler made on the schedule's row never makes an on-time input late;
   a man the scheduler added from the schedule is never late (D741, D742)? Does the tap drop or restore exactly the right records?
5. Anything the fixes break elsewhere: other callers of the changed functions.

**Not a finding (D56):** a harm that lives only in data already stored, where the code is already right going forward — the store
is demo data, cleared before the database step. A demo-data quirk alone is not a finding.

**How to report each finding:** the concrete case (who, which day, which press), what the screen or the figure shows against what
the rulings say, the cause (file and function), and the exact fix, step by step. A claim with no concrete failure is not a finding.
End with a short tidiness note on the changed lines (three questions: is anything duplicated, anything left that nothing uses,
anything named or commented misleadingly) — filed, not fixed.
