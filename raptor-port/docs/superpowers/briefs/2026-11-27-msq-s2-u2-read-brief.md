# Section 2, step U2 — who may give Plan of a squadron, who may make its admins, the refused Undo, its bell lines and its screen: the brief for every reader of its finished code (chat 205, 27 Nov 26)

Given word for word to each reader (Astra, a fresh Opus, a second fresh Opus in the Fable seat by his D2819, and the
security reader — his D1411: this is a permission change).

**You are a reader, not a builder.** You have seen no other reader's report and no walk; do not look for one. Change no
file of the repo. Find what is MISSING or WRONG in the finished code of this step — a claim counts only with a concrete
failure, its cause and its fix, and **each claim is written as a failing test before it is believed.**

## The rule the code must keep (the owner's rulings, in plain words)

- **Plan of a squadron** (a man of another squadron allowed to plan this one) is given, raised, lowered and ended only
  by that squadron's **own admins** — an admin whose home squadron that day IS that squadron — or by a **master admin**
  (in force: not while he is in the member view). Never by a man who only holds Plan of it; never by another squadron's
  admin (D2626).
- **Only whoever may give Plan of a squadron may make a man its admin** — by the Role box on his row, by "Give
  sign-in", by "+ Add a person", by approving a request ("Give access"), by re-linking a sign-in, and by **Undo and
  Redo** (D2730 Q8, D2806, D2807). A squadron's first admin arriving by a move stays allowed (a home row is never
  asked).
- Every one of these answers **"no"** when it cannot read: nobody signed in, a home it cannot read, rows not handed in,
  an account switched off, a man archived, deleted or a placeholder (D2730 Q10).
- **An Undo or a Redo** whose step would give, end or put back a Plan row, or make a man an admin, by one who may not
  today, is **refused whole**: nothing is written, no bell line struck. Undo of making a man an admin says "Only 149's
  own admins or a master admin can make an admin of 149, so this can’t be undone." and stays blocked; a Redo of the
  same kind gives the app's existing out-of-band words. One put-back is left out rather than refused: undoing "made a
  member" puts his admin role back but not a Plan the presser may not give (D2807, D2730 Q11).
- **The last-admin words** (D2806, D2816): to one who may make another admin — "Kestrel is 149's last admin. Make
  another admin of 149 first."; to anyone else, where the squadron has an admin of its own — "… Only 149's own admins
  or a master admin can make another."; where it has none — "… Only a master admin can make another." — also in the
  dated form ("from Fri 27 Nov, when Osprey moves to 142.") and through Archive.
- **Bell lines to the squadron's admins** (D2626, D2654): "Given Plan of 149", "Plan of 149 ended", "Plan of 149 ended:
  made a member" (signed by the presser), "Plan of 149 ended: he moved to 150" (the app's, unsigned, at the move). Told
  to the squadron's admins on the day, not the presser, not the man himself (he gets his own line, as built). A tap
  opens that squadron's Admin → Users at the man's row, ringed; a man with no row there opens nothing.
- **On screen** (Pass C): the Plan choice is off with "Only 149's own admins or a master admin can give or end Plan of
  149." for one who may not; the Admin choice in the Role box is off with a grey line "Only 149's own admins or a master
  admin can make an admin of 149." under the box — on a man's row, Give sign-in, + Add a person and Give access — judged
  on the role he had when the row opened, never on what is typed, so Member picked on an admin can be put back.
- **Unchanged and NOT this step's:** within one squadron nothing on Admin → Users is refused over unsaved typing — opening
  another row drops the first one's typing with no note (D2821); the guard rail is being changed to refuse nothing for
  open work (D2825). This step adds no refusal over open work, and no test may expect one.

The cast of the test world: Saber master admin, home 142 · Hunter 142's admin, Plan of 149, View of 150 · Kestrel 149's
admin · Mako 150's admin · Ranger a 142 member · Osprey a 149 member (moves to 142 on a later date in some tests).

## What to read

The change is on branch `claude/msq-s2-users-685735`: Pass A `git show b7c49ac3d -- raptor-port/src`; Pass B
`git show e042c5d58 -- raptor-port/src`; Pass C `git show 9871b5028 -- raptor-port/src`. **In an exported copy with no
history the same diffs are `READ-U2A.patch`, `READ-U2B.patch` and `READ-U2C.patch` at the copy's root.** The files whole
where the diffs touch them, and their callers: `state/units-model.ts` (`mayGivePlanAt`, `levelFrom`,
`adminRoleHolds`), `state/accounts.ts` (`mayGivePlanNow`, `lockWords`, `relinkRightsProblem`, `updateAccount`,
`saveAccess`, `addAccount`, `approveRequest*`, `addPersonAndAccount`), `state/units.ts` (`setGrant`, `removeGrant`,
`addUnit`), `state/lastadmin.ts`, `state/perms.ts` (`mayGivePlanOf`, `planActorOf`, `madeAdminsIn`,
`madeAdminViolation`, `unitRowViolation`, `adminOwnerViolation`, `restoreLeavesOut`, `restoreGrantCtx`),
`state/undo-wire.ts` (`planRestoreStuck`, `makeAdminStuck`, `acctLineLeftOut`, `stepStuck`), `undo/timeline.ts`
(`stuck`, `sayBlocked`, `globalUndo`, `globalRedo`), `state/notices.ts`, `state/acctlines.ts`, `ui/topstate.ts`
(the new line's branch only), `ui/useraccess-model.ts`, `ui/UserAccess.tsx`, `ui/UsersPanel.tsx` (`rowLocks`,
`PersonEditor`, `RoleSelect`, Give access, Add a person), `ui/rolestable.ts`, `leavewar/sync.ts archiveLockWords`.
Its tests: `src/state/msq-s2-u2-*.test.ts`, `src/ui/msq-s2-u2-*.test.tsx`. The build brief, for what was meant:
`raptor-port/docs/superpowers/briefs/2026-11-27-msq-s2-u2-brief.md` §3, §4. The rulings page:
`.claude/rules/decisions/people-accounts.md` (open it with the Read tool where you have one).

## What is NOT a finding

- A problem that lives only in data already stored, where the code is right going forward (the store is demo data).
- A scheduler who is not an admin (there is none).
- Held for later steps, known: D2808's four further bell lines (the next step); the folds the bell tap should open
  ("From other squadrons", "View only" — U3, U5); browser tests and the drawing check (U8); Add a person half-typed at a
  midnight move (D2826, a later step); any refusal over open work (D2821, D2825 — none is wanted).
- Three stand-ins, ruled for now: a Redo that would make an admin gives the out-of-band words; a re-link that ends a
  Plan writes no line to the squadron's admins; the dated last-admin form uses D2806/D2816's tails.
- The raise and lower mapping of the lines (View→Plan reads "Given Plan of 149", Plan→View "Plan of 149 ended") — a
  reading put to his word review; report it only if a case reads wrongly to a person.
- Filed for the database step: the doors and the commit gate accepting a write from a session that no longer stands;
  a fault in a note's words or timing that needs two people at the keys at once — report it, marked as such.
- Style, naming, tidiness — unless it hides a fault.

## Questions to press on (not a checklist — look wider)

Is there any door, any command, any replay — Undo, Redo, a re-link, a request approved, a person added with an account,
an archive restored, a squadron made, a move landing — that still lets a Plan holder, another squadron's admin, a master
admin in the member view, or nobody signed in give, raise, lower or end Plan, or make an admin? Do the screen, the doors,
the gate and the replay ask the SAME rule, or can two of them disagree on one case (a home read on another day, a role
read stored rather than in force, a first admin, a man moving that day)? Can the gate be passed by a command the doors
never make? Does a refused Undo or Redo write anything, strike any line, or leave the history out of step? Does the
left-out put-back ever leave out what it should keep, or keep what it should leave out? Does any bell line reach the
wrong person, miss one who should have it, carry the wrong squadron, come twice, survive its Undo, or open the wrong
place? Does the screen ever show a choice the door then refuses, or hide one the door would allow — and does what is
typed ever change what is offered? Does any old sentence ("Only a master admin gives Plan.") still reach a person?

## How to hand back

Write each proof as a test file `raptor-port/src/state/zz-<your-name>-proof-<n>.test.ts` (or `src/ui/…test.tsx`), run it
alone from `raptor-port/` (`npx vitest run <file>`; one test file needs no lock; never `npm run build`, never the whole
suite), keep its output, then **move every proof file and its output out of the repo** into
`C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/u2read/<your-name>/`
and write your report there as `report.md`: each finding with its severity, the failing test's name and output, the
cause (file and line) and the exact fix, step by step; then what you looked at and found sound; then what you could not
check. Leave `git status` exactly as you found it. **If you cannot write or run files where you are (a read-only copy),
give each proof in your report as the whole text of its test file, ready to run, and say it was not run.** End your
reply with the report's path and a five-line summary.
