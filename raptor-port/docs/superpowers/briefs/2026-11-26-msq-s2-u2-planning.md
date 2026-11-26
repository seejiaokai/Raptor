# S2 step U2 — the planning read and the builder's brief, drafted (a fresh Fable helper, for chat 205, 26 Nov 26; saved by the host from the helper's reply)

Read only; no file changed, nothing run. Branch `claude/msq-s2-users-685735` at f1a3df8f7. "Plan" =
`raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md`; line numbers as read on that commit — the
builder re-reads each before relying on it. Nothing of U2 exists yet: `mayGivePlanOf` and `planRestoreStuck` are nowhere
in `src`, nor `lineOpens` (the core's K6 has not landed). **Not yet the builder's brief: the open points of (B) are the
orchestrator's to settle first.**

## (A) The builder's brief — step U2

### 1. Why
D2626 (25 Nov): Plan of a squadron is given and ended by that squadron's own admins or a master admin, never by a Plan
holder. D2730 Q8 with D2806 and D2807 (26 Nov): whoever may give Plan of a squadron is the only one who may make a man
its admin, Undo and Redo included. Today all of it is a master admin's alone, and a Plan holder can still make admins.
A permission change: the screen, every door, the commit gate and the Undo/Redo replay must agree, in one change.

### 2. Read first
- `.claude/rules/raptor-executor.md`; `.claude/rules/decisions/people-accounts.md` (lines 75, 86–87, 127–130, 175, 186).
- Plan §19.2, lines 2446–2682, whole. Plan §21 head and rules, 3234–3298; §21.2, 3496–3633 (rows Q4, Q8, Q10, Q11,
  Q12 at 3556–3564; "His answers to questions 13, 14 and 15" 3613–3623; "After U1's fourth round" 3625–3633); §21.3's
  contract 3665–3669; §21.5, 3742–3798. Plan §8.4 NQ1 (1428); §17 readings 21–24 (2049–2056); §20's rows for the
  security check F1–F7 (3195–3203).
- Full rows: `grep -h -E '^\| D(2806|2807|2808|2730|2626|2654|2250|2247|2246|2311|2336|2201) \|' .claude/decisions-full/*.md`.
- Cards and pictures: `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s2-questions-cards-13-15.md`;
  `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/q13-*`, `q14-*`. Words tables:
  `raptor-port/scripts/handpass/n176/words.mjs` lines 5–15.
- Code (slices): `state/units.ts` 165–172, 349–398; `state/units-model.ts` 309–371; `state/accounts.ts` 415–465,
  524–576, 697–780, 834–933, 1190–1231, and `approveRequestNew`, `addPersonAndAccount`; `state/perms.ts` 2365–2433,
  2686–2963, 2977–3036, `adminOwnerViolation` from 3350, `acctLineViolation` from 3899; `state/undo-wire.ts` 440–495,
  511–577, 623–634, 655–755; `undo/timeline.ts` 1145–1230; `state/acctlines.ts` whole; `state/notices.ts` `acctWords`
  (1288) and `noticeLive`; `ui/useraccess-model.ts`, `ui/UserAccess.tsx`, `ui/rolestable.ts` whole;
  `ui/UsersPanel.tsx` 76–83, 193–250, 316–423, 532–551, 616–700, 1055–1176; `src/ui/msq-s2-rejudge4.test.tsx`
  422–482; `src/state/msq-s2-plan.test.ts` and `src/ui/msq-s2-asis.test.tsx` whole; `test-support/msq-world.ts` whole.

### 3. The rule
**R1 — `mayGivePlanOf(unit, actor, rows, today)`, one body (plan 2467–2499).** True only for: (1) a master admin whose
role in force is an admin's (false in the member view); or (2) an account whose home that day is `unit` and whose level
there from its home role alone is admin — `levelFrom`'s home branch with `adminRoleHolds` unchanged, its `first` path
included; never the grant branch, never the stored `role === 'admin'` beside a home. (3) Judged on the rows before the
command: at the gate `unitRowsBefore(env.changes)` and the actor's account before, never `worldsOf` (null for a
grant-only command). (4) Fails closed: no account (at the doors too), unreadable home, rows not handed in, account
switched off, man archived, deleted or a placeholder (D2730 Q10). The receiver of Plan is read on the rows and accounts
after the command, by role in force.

**R2 — Q8 (plan 3560).** The same function is asked wherever a command leaves a man an admin in force of `unit` who was
not one before it. Keyed by the man, judged today, on commands that change an account row or create a person. Never on
a home row: the first admin of a new squadron moving in stays allowed (plan 2476–2480, 2636–2638).

**R3 — replay (plan 2522–2573).** (a) The restore's maker is asked `mayGivePlanOf` as he stands today for any grant row
that is Plan on either side; the gate's "a verified replay excepted" goes for the who-check. (b) A step that fails is
refused whole, nothing written, no line struck: `planRestoreStuck` in `state/undo-wire.ts`, on the timeline's `stuck`
hook, over `entry.inverse` / `entry.forward`, never the thinned list; words: today's (D2730 Q11). (c) The one put-back
left out and not refused: the Plan row in the Undo of a make-member, where the presser may make him an admin again but
may not give that Plan. The restore context carries `mayPlan` in place of `master`, per row's squadron; not handed in
means may not.

**R4 — D2807.** A replay that would make a man an admin of `unit`, by one who may not, is refused whole with D2807's
sentence, and at the gate by name.

### 4. The exact sentences (no other new words)
| Sentence | Ruling | Where |
|---|---|---|
| "Only 149's own admins or a master admin can give or end Plan of 149." | D2626; final on the section page (D2730) | under the squadron line (`lineState`); the refusal of `setGrant`, `removeGrant` and `saveAccess`'s lines, replacing `PLAN_MASTER_ONLY` |
| "Only 149's own admins or a master admin can make an admin of 149." | D2806 | one grey line under the Role box on the opened row, "Give sign-in", "+ Add a person", "Give access"; the door's refusal uses the same sentence (a reading — B6) |
| "Kestrel is 149's last admin. Only 149's own admins or a master admin can make another." | D2806, narrowing D2730, replacing D2246's tail | `accounts.ts lockWords`, for anyone who fails `mayGivePlanOf`; those who pass keep "Make another admin of 149 first." |
| "Only 149's own admins or a master admin can make an admin of 149, so this can’t be undone." | D2807 | the refused Undo's note (apostrophe: B4) |
| "This sign-in holds a right in 149. Only 149's own admins or a master admin can link it to another person." | D2730 Q12 | `relinkRightsProblem`, for a Plan that holds; door and tests only (D2266) |
| "Only a master admin makes squadrons or master admins. Plan of a squadron is given by its own admins or a master admin." | section page (D2730), `words.mjs rolesNote` | `ui/rolestable.ts` note 5 |
| "Given Plan of 149" · "Plan of 149 ended" · "Plan of 149 ended: made a member" · "Plan of 149 ended: he moved to 150" | D2626, D2654 E6 and E9l; drawn s2-33, s2-34 | bell lines to the squadron's admins, under the man's name; signed "· Kestrel", except the move's (the app's, unsigned) |

Kept as built: "Plan is for admins only."; "Only an admin of 149 can give access to 149."; "Give him a sign-in first to
give access."; "Something else changed this after your action — it can’t be undone now."

### 5. The changes, file by file
- **`state/units-model.ts`**: only if needed, a pure "own admin of unit" read lifted from `levelFrom`'s home branch, no
  second copy of `adminRoleHolds`.
- **`state/perms.ts`**: `mayGivePlanOf` (R1). `unitRowViolation`: the Plan who-check (2837–2841) asks it per row's
  squadron and loses the replay exception; the kept removals above it (delete, re-link's non-holding drop, the member's
  drop, archive) stay removal-only. The receiver check (2749) reads the role in force after the command. New: a grant
  row whose after-image carries `first` is refused unless a master admin's `unit.add` for that squadron and account (and
  its verified replay), or the row carried it before. `RestoreGrantCtx.master` becomes `mayPlan`, fail closed
  (2408–2413, 2911). G4, the re-link line (2588–2608), asks `mayGivePlanOf` for each Plan that holds. Q8's gate rule
  beside `homeUnitViolation`. `adminOwnerViolation`: admit each new line only where the same command changes that very
  Plan row, the reader is in the squadron's audience on the rows before, signed by the actor, one line a reader; "made a
  member" only where the command makes that account a member and drops its Plan row; the move's line only as the app's
  pass.
- **`state/units.ts`**: `setGrant` and `removeGrant` ask the one body and fail closed with nobody signed in
  (`notMaster()` at 172 lets that through today). `units.ts` does not import `perms.ts`: use the installed-seam pattern
  (`setNewHomeUnit`) or a lower pure body.
- **`state/accounts.ts`**: `saveAccess` line 885, and Q8 on `roleCh` to admin (`remade` included); `updateAccount`
  (role to admin, and a re-link that leaves a man an admin); `relinkRightsProblem`; `addAccount`, `approveRequest`,
  `approveRequestNew`, `addPersonAndAccount` with role admin; `lockWords` 537–538.
- **`state/undo-wire.ts`**: `planRestoreStuck` on `stuck`, and again inside `restoreRefusal`; `grantCtx` hands
  `mayPlan`; `acctLineLeftOut` widened to the new kinds by squadron and subject; D2807's refusal.
- **`undo/timeline.ts`**: needed for D2807 only (`stuck` returns a boolean and always says the out-of-band words). Stop
  and report before editing (B3).
- **`state/notices.ts`, and `state/acctlines.ts` or `leavewar/sync.ts` for the pass**: a new line kind, not
  `k: 'acct'` (`acctLineViolation` judges every `acct` line as the man's own; the pin in `msq-s2-asis` group 4 reads
  them). It carries squadron `u`, subject, reason. Audience: `adminLineAudience(u, today, rows before)` less the presser
  and the subject. No number in its words (§21.3). `noticeLive` treats it as that squadron's admin line.
  `acctNoticesReversed` is handed what the restore wrote (plan 2566–2570: "not read to its end by this fold; V7 proves
  it either way").
- **`ui/useraccess-model.ts lineState`**: "is he a master admin" becomes "may he give Plan of this squadron". One
  reason at a time: no sign-in, then not an admin of it, then member, then the new sentence.
- **`ui/UserAccess.tsx`**: `RoleBox` gains an `adminOff` prop. **`ui/UsersPanel.tsx`**: `RoleSelect` gains `adminOff`;
  the reason line in the four places; the layout rule in `ui/postout.css`, scoped to the row, `.adm-2col` untouched.
  **`ui/rolestable.ts`**: note 5.

### 6. U2 and U1's guard
`PersonEditor` may read the man only through `Shown`. "Already an admin" is the copy's `s.role === 'admin'`: no new
field. "May I make an admin of his squadron" is the signed-in admin's right: fold it into `rowLocks` (hand it
`s.role`), so `PersonEditor` uses no new name and §20's `WHOLE_MAY_USE` stays as it is; if a new name is unavoidable,
add it to that list with its reason and say so. The greyed option is judged on the copy's role, not the typed one, so
Member picked on an admin's row can be put back to Admin before Save. "+ Add a person" and "Give access" hold no copy:
read the right afresh each draw for `pageUnit('own')` and `r.unit`.

### 7. Held — leave out, and say so
The lines' tap (`lineOpens`, B7, R5 (d)): the core's K6. The two coloured numbers on the line: the bell's `BellList`;
`state/belltap.ts lineSqnMark` not touched. D2808's four lines: pending B1 — pin that each of those four endings writes
no line to the squadron's admins today. Browser tests and the drawing check: U8. No edit to the plan, the rulings
pages, `HANDOFF.md`, `test-support/msq-world.ts`, `state/store.ts`, `state/pick.ts`, `state/typing-hold.ts`,
`ui/Shell.tsx`, `ui/guard.ts`, `ui/topbits.tsx`.

### 8. Tests first
Each seen failing; pins seen passing and named "pin:". New files are `msq-s2-*` and call `withThird()`. Cast: Saber,
Hunter, Kestrel, Mako, Ranger, Osprey. The Viper case is Hunter moved to 149 by Saber, read on 16 Jul.

**Who gives and ends Plan — doors (V5, V5b).** Kestrel gives Hunter Plan of 149 and ends it: saved. Mako raises
Hunter's View of 150 to Plan: saved, he holds two. Kestrel gives Plan of 150: refused. A squadron whose only admin is an
unmoved first admin: only Saber gives. The first admin moved in gives and ends: saved. `setGrant` (give, raise, lower),
`removeGrant` and `saveAccess`'s lines, each called directly as: Hunter (Plan holder), Mako, Ranger, the moved admin
not re-made (then re-made: saved), Saber in the member view, nobody signed in, and Kestrel switched off, archived or
posted out with his session still open (make Osprey an admin first, or the last-admin lock answers). Each refusal in
the exact sentence, nothing changed. Hunter still gives View of 149 (pin). The re-link door: Ranger-as-admin refused in
Q12's words; Saber saved; Kestrel holding Plan of 142 saved; a View-only sign-in as today (pin).

**Q8 — doors.** Called directly as Hunter with 149 picked, each with role admin: `saveAccess` (and the `remade` case),
`updateAccount`, `addAccount`, `approveRequest`, `approveRequestNew`, `addPersonAndAccount`. Each refused with D2806's
sentence, nothing saved: one test sends role, rename and a line together and nothing lands. The same as Kestrel and
Saber: saved. An admin kept an admin: saved. An admin made a member by Hunter: saved (D2250).

**The gate (V6).** The same cases as forged commands, refused by name (forged as `state/piece-b-tables.test.ts` and
`state/reshape-plan-audit.test.ts` do). Also: Kestrel's give as one grant row and nothing else, saved; Saber's one
command making Ranger an admin with Plan of 149, saved; a give to a moved "admin" who is a member; one command making
its own actor an admin and giving Plan; `first: true` by Kestrel and by Saber refused, a kept `first` and "+ New
squadron" with its Undo and Redo saved; a re-link dropping a Plan by one who may not; forged Plan lines (no row
changed; another account's or squadron's row; unsigned; a reader outside the audience).

**Replay (V7).** Kestrel gives, Undo, Redo: saved, the admins' line struck and written again. Kestrel then loses the
right (moved and holding only Plan; made a member; switched off or archived with his session open): his Undo of a give,
a raise, an end and a lowering, and each Redo, is refused whole — the Plan stands; Hunter's own line and every admin's
line stand; none is struck; the next press takes the older step. One Save that lowered Plan of 149 and gave View of
150: Undo refused whole. Context with nothing handed in: no Plan row put back. The gate alone, with the timeline's
check taken out. Pins: Saber's Undo of Kestrel's step refused as today (D148); the make-member Redo drops the Plan
again. The Undo of a make-member by a 142 admin who may not give Plan of 149: role back, no Plan, both "ended" lines
standing; by Saber, and by Kestrel holding Plan of 142: both back.

**The refused Undo (D2807).** Hunter makes Osprey a member, presses Undo: refused with the sentence; Osprey still a
member; nothing struck; an older step of Hunter's still reachable. The same at the gate.

**The row (V8, V9).** Plan button live for Kestrel on an admin's row; greyed for Hunter with the new sentence; member
"Plan is for admins only." (pin); one reason at a time. No file says "Only a master admin gives Plan".

**The greyed "Admin", four places.** As Hunter on 149: `#accEdRole`, `#accGiveRole`, `#accAddRole`, `#apvRole` (both
modes) each have the Admin option disabled and the one line under the box. On an admin's row: not greyed, no line. For
Kestrel, Saber, and Hunter on 142: never greyed. A typed sign-in survives; a rename alone still saves.

**The last-admin note.** Hunter making Kestrel a member: the new words. Kestrel's own case and Saber: "Make another
admin of 149 first."

**The lines (V10, less the tap and the numbers).** Each of the four written to the right readers; never to the
presser; the man gets only his own account's line; Undo strikes it.

**Pins re-pointed by name, each listed in the report:** `msq-s2-plan.test.ts`, three "as built" cases;
`msq-s2-asis.test.tsx` group 3, cases 1 and 3; `state/units.test.ts`, `state/save-access.test.ts`,
`state/piece-b-tables.test.ts` ("4.": `master` to `mayPlan`; "not asked: as before" becomes "not asked: left out"),
`state/reshape-plan-audit.test.ts`, `ui/msq-users-row.test.tsx`, `ui/rolestable.test.tsx`;
`leavewar/multi-sqn-fixread8`, `-9`, `-10` (the re-link words), `-11`, `-12`; any of the eleven last-admin files and
the twenty "master admin only" files that truly change.

### 9. Limits
No commit, stage, push, build or checks lock. One test file at a time from `raptor-port/` (`npx vitest run <file>`).
No new words beyond section 4. Comments say why and cite the D-numbers. A scheduler is always an admin (D785).
`src/engine/` untouched. Records in the same change: `docs/data-model.md` §UnitGrant (1118–1121) and §11's `UnitGrant`
and `User` rows; `docs/data-schema.md` (the notice kind; §Edit rights by squadron and
`src/state/edit-rights-readers.test.ts` if any counted call changes); `docs/file-map.md`;
`docs/notifications-register.md` (rows unnumbered); `docs/ui-contracts.md` line 7191.

### 10. The report must say
Status, Changes, Checks, Open items, plus: every test seen failing first; every pin re-pointed, by name, with why;
every file touched that is not on §21.2's list; what is left out (the tap, the numbers, D2808's four lines, any Redo
wording); that readings 22, 23 and 24 are his answers (D2730 Q10–Q12), so no clause is left out for them; every place
a reading was built.

## (B) Open points for the orchestrator

1. **D2808's four lines have no clear builder.** The plan (3620–3621) says "built with the bell section's lines"; the
   D2808 row says "Admin → Users' chat builds it, with the bell section"; §21.3 forbids the bell section from touching
   `state/notices.ts`. Settle before the build: inside U2, or a follow-on S2 step. The brief leaves them out.
2. **The plan contradicts itself in four places; the later text and D2806 win.** Lines 2616–2621 ("a Plan holder of 149
   still … makes 149's men admins") against row Q8 (3560) and D2806. The U2 table row (3508) still holds NQ1 and
   readings 22–24, lifted at 1434–1438 and 3560–3564. "Still held" 1–3 and "What can start now" (3576–3591), lifted at
   3613–3623. The scheduler rulings page still says an admin is made by "its own admins, an admin with Plan of it, or a
   master admin", and People & accounts line 75 excepts only "giving or taking Plan itself" — D201's sweep is owed, and
   it is the orchestrator's (or the coordinator's), not the builder's.
3. **D2807 needs `undo/timeline.ts`.** The `stuck` hook cannot carry its own words. The core (K8) and the bell
   (`NOT_STEPS`) also change that file. Also undecided: whether the refused step is blocked for good, so that "Press
   Undo again for: …" (existing words) follows his sentence.
4. **The apostrophe.** The D2807 row and the plan write "can't"; the card and the drawing show "can’t", as the app's
   other Undo words do. The brief uses the curly one.
5. **Words no ruling approved; each needs the owner first, or must be left out:** a Redo that would make an admin
   (D2807's sentence says "undone"); the last-admin note for a squadron with no admin of its own ("Only 151's own
   admins…" names nobody); D2806's tail on the dated form ("…from Fri 27 Nov, when Osprey moves to 142. …"); whether a
   re-link that ends a Plan tells the squadron's admins; the roles table's note 5 does not say a Plan holder cannot make
   an admin.
6. **Readings the brief builds:** the door's refusal for making an admin uses D2806's grey-line sentence; the same for
   a re-link that makes an admin (never on screen); "No sign-in" in the plan (2578) is read as the built "Give him a
   sign-in first to give access."; the three undrawn places for the greyed "Admin" are built from the card's words
   alone, to be named at his look.
7. **Shared or unlisted files.** `state/perms.ts` and `state/accounts.ts` are S2's for U2 (plan 3519–3521); finding 2
   wants U2 landed before the bell's BL4. Not on §21.2's list: `state/acctlines.ts`, `undo/timeline.ts`,
   `ui/rolestable.test.tsx`, possibly `engine/schema.ts`. `ui/postout.css` is shared (finding 1). `belltap.ts
   lineSqnMark` may need to learn the new kind: the bell's.
8. **Failing closed at `setGrant` and `removeGrant` with nobody signed in** may turn many hand-made-session tests red.
   Not counted.
9. **Size and model.** The section's riskiest step; one builder's context may not hold it. Consider ordered passes
   (rule, doors, gate and replay; the lines; the screen) with one commit at the end. By D2233 a fault that returns after
   an Opus fix is Fable's.

## (C) Ten lines
1. U2 is unbuilt; the plan's §19.2 with §21.2's later blocks is complete enough to build from.
2. One function, `mayGivePlanOf`, replaces "is he a master admin" in eight places, and by Q8 also decides who may make an admin.
3. Readings 22, 23 and 24 are all answered (D2730 Q10–Q12); no clause is left out for them.
4. D2806 and D2807 are in; there is no U2b.
5. D2808's four lines are left out of the brief, because the plan does not say clearly who writes them.
6. Also left out: the lines' tap (K6), the coloured numbers (bell), the browser tests (U8).
7. The greyed "Admin" fits U1's guard with no new copy field, through `rowLocks` and the copy's role.
8. D2807's sentence needs a small change in the shared `undo/timeline.ts`.
9. Five wordings have no ruling and need the owner or must be left out; four readings are built and must be named.
10. Expect many pins re-pointed; settle points 1, 3, 4 and 5 before the builder starts.
