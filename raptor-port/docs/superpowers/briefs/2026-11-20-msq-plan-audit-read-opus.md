# [MSQ-PLAN-AUDIT] — the fresh, blind Opus reader's report (20 Nov 26, on a5271a17c)

Brief: `raptor-port/docs/superpowers/briefs/2026-11-20-msq-plan-audit-read-brief.md`. I read only inside the export
`<scratchpad>/audit-read-opus`, plus my own proofs folder. Nothing in the export was edited. I saw no other reader's report
and no walk report.

**About compaction:** this chat was compacted once, part-way through. When it was, the compaction hook pasted a handoff
block (`claude/multi-sqn-b1-107`, chat 126) into my chat. I did not use it, and no finding below depends on it. I did not
follow its instructions either (re-reading HANDOFF.md, noting the compaction in the block), because those are for the host.

**Proofs:** written blind and NOT run, because the export has no node_modules. File:
`C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\2edafb56-e544-4e90-a441-340014ce0ec8\scratchpad\audit-read-opus-proofs\opus-plan-audit-read.test.ts`
To run: copy it to `raptor-port/src/zz-repro-o/opus-plan-audit-read.test.ts`, then from `raptor-port/`:
`npx vitest run src/zz-repro-o/opus-plan-audit-read.test.ts`
- O1 (a) and (b), O2 and O4 are expected **red** on a5271a17c.
- O1's control and O3 are expected **green**. O3 is a guard that must stay green through PE1's fix.
- In each red case the claim is the **last** expectation. If an earlier "setup" expectation fails, the harness needs
  adjusting; that does not count against the claim.

Seeded people: Saber (`acad`/`stiff`), the master admin, home 142 · Hunter (`acad2`/`prowler`), 142's admin, holding Plan
of 149 in the scenarios · Kestrel (`acad9`/`kes9`), 149's admin · Osprey (`acus9`/`osp9`), 149's member · Ranger
(`acus`/`bane`), 142's member.

---

## Findings

### F1 — A Plan holder can move himself into the squadron he holds Plan of, and can move the master admin (CODE, security; new — not in the roll-call)

**Where:**
- `raptor-port/src/state/units.ts` `setHome`, l.214–244. It has no check that the man moved is not the signed-in person.
  It does not call `masterChangeProblem` (`accounts.ts` l.747), so a master admin's squadron is changed like anyone
  else's.
- The gate passes both moves:
  - §8 (`perms.ts` l.2125–2141) asks only that the actor be an admin of the squadron the man leaves (`levelBefore(acct,
    was, today, before) !== 'admin'`).
  - §6 asks only that he be an admin of the squadron joined.
  - The grant drop of the move is exempted at l.2024–2028.
  - G1 (l.1832–1838) compares only a master admin's account row and `ACCOUNT_LIKE` of his person. It never compares his
    home rows.

**Failures (proof O1):**
- (a) Saber gives Hunter Plan of 149. Hunter, signed in, opens his own row and moves himself to 149. The move is
  allowed: from tomorrow he is 149's home admin. Saber can no longer end this by taking Plan away, because it is now
  Hunter's own squadron role. Hunter has turned a right that only a master admin gives and takes (D2199, D2201's reading)
  into a permanent admin role in 149, by his own hand.
- (b) Saber gives Hunter Plan of 149. Hunter moves **Saber**, the master admin, to 149. The move is allowed: Saber's
  primary squadron becomes 149 from tomorrow. With it go his bell default (D2198), where his inputs and leave are filed,
  and his OIL settings. All of this was done by an admin who is not a master admin.
- Control: Saber moves Hunter. This is allowed, as it should be.
- Without Plan, Hunter could do neither (he is no admin of 149). So this is a Plan-holder fault, inside this audit's
  scope.

**Rulings broken:**
- (b): D2205 — `| D2205 | 18 Nov 26 | *"Rest as recommended"* … | **Only a master admin changes a master admin's account (M3); …** The agent's readings: an admin given Plan of 149 counts as "an admin of 149" in those words (D2201); M3 holds against a planner too. …`
  A master admin's squadron is part of his account. D1695: "each person's squadron set when his account is made".
- (a): D2199 — `**A master admin may let one named admin edit another squadron, person by person: a switch on that person's row in Admin → Users, off by default, set by a master admin only; …** … the master switches it off when the job ends.`
  D2201's reading: "Plan is given and taken away by a master admin only (D2199)".
  The app's own-account pattern, which refuses an admin acting on himself:
  - `ownAccount` refuses changes to his own account;
  - `archiveProblem` says "You can't archive yourself";
  - `postOutProblem` says "You can't delete yourself".
  The move in (a) is my reading of these rulings, not his word. It is a self-promotion that no ruling allows, so put it to
  him if the fix is in doubt.

**Fix, step by step:**
1. In `units.ts setHome`, as the first line after the squadron check: `const mp = masterChangeProblem(pid); if (mp) return
   no(mp)`.
2. Next, refuse a move of the signed-in person: `if (pid === activePersonId()) return no("You can't move yourself — ask
   another admin.")`. These are new words, so draw them first (D1625). Use the own-account helper that `archiveProblem`
   uses.
3. At the gate, §8: for each `pid` in `moved` whose squadron differs on a date, refuse when `pid` is the actor's own
   person (`accountPidBefore(env, acct)`): `a man's own squadron changed by himself (home of ${pid})`.
4. At the gate, G1: also compare each master admin's `homeBefore(m.pid, d, before)` against `after` for every date in
   the command's home rows. Refuse when it differs and `!actorMaster`.
5. Batch 4's Transfer outcome reuses `setHome`'s checks. Name this in its plan.
6. Make O1 (a) and (b) part of `units.test.ts` and the gate tests. Each must be red before the fix and green after.

---

### F2 — PE1's fix, as written, gives an admin edit mode back in the member view; later it takes his own pages' controls away when he picks another squadron (PLAN; new)

**Where:** the reshape plan §19 PE1, l.1519: "`mayEditSched` and a new 'admin of the page's squadron' question read
`levelIn(account, pageUnit(kind, today), today) === 'admin'`; today the same answer." This is **not** the same answer
today.
- Today, `mayEditSched` (`perms.ts` l.258) is `may(T.sched,'U')`, which reads the role in force. In the member view that
  role is `member`.
- `levelIn` reads the stored account role, the master mark and the grant. It never reads the role in force.

**Failure 1 (phase 1, guard O3):**
- Saber taps his name badge for the member view. After PE1, `mayEditSched()` answers `levelIn('acad','u142') === 'admin'`,
  which is true. Edit Schedule's edit mode comes back in the member view.
- So do these, all behind `canEditSched()`:
  - the posting and holiday bell lines (`notices.ts` l.752 and l.761);
  - the OIL list (`OilDayList.tsx` l.38, `oilday.ts` l.30);
  - Inputs' scheduler controls.
- The same holds for Hunter. This breaks D292.

**Failure 2 (P3, once the call sites move):**
- `canEditSched()` (`auth.ts` l.39) has about 160 callers. Many belong to his OWN pages and the bell, not the schedule
  pages: `InputWindow`, `InputsPage`, `inputedit`, `PeoplePick`, `peoplepick-model`, `DocViewer`, `reqdoor`,
  `OilDayList`, `ui/oilday.ts`, `mayMovePlace`, `leavewar/sync.ts` l.791, and `noticeLive`.
- Suppose every caller reads "admin of the picked schedule". Hunter holds only View of 149 and picks 149. He then loses
  his 142 scheduler controls on Inputs and his 142 holiday and posting bell lines, though he is still 142's admin.
- A-ii's `pageUnit` also does not say where the member view sends the own pages.

**Ruling broken:** D292 — `**An admin can switch himself to the member view and back, by tapping his name badge.** "SABER · ADMIN" ↔ "SABER · MEMBER": in the member view the app behaves exactly as for a member (his own Quals row and inputs only, no Admin tab, no Edit Schedule); …`

**Fix, step by step:**
1. PE1's core half: `mayEditSched = () => !!SESSION && roleOf() === 'admin' && levelIn(account, pageUnit('schedule',
   today), today) === 'admin'`. The role in force comes first. Do the same for the new "admin of the page's squadron"
   question.
2. Strike "today the same answer". Replace it with "the same answer for the admin view; the member view stays a member's
   (D292), guard O3".
3. Split the question at P3. Do not move every `canEditSched` caller to one answer:
   - the schedule pages ask the pick's level (`pageUnit('schedule')`);
   - the own pages ask `pageUnit('own')`;
   - each bell line and the OIL list ask about the squadron the line is for.
   List the callers in each group in P3's plan.
4. In A-ii, write that `pageUnit('own')` in the member view returns his home.
5. Add O3 to the phase-1 tests.

**The roll-call carries the same unsafe fix wording:** gate rows 2–3 and doors row 34 (see "Roll-call verdicts
challenged").

---

### F3 — The one OIL list saves only the reader's home squadron's answers; PB4 names only the list's opening (PLAN; PB4 misses call sites)

**Where:**
- PB4 (plan l.1515) moves `OilDayList` l.48 to the line's squadron. (The line is l.49 at a5271a17c: `const open =
  oilOpenOn(from, to, myUnit())`.)
- The save is a separate function, `raptor-port/src/ui/oilday.ts saveOilDay`. At l.31 it filters again by the reader's
  home: `const todo = oilOpenOn(from, to, myUnit()).filter(...)`.
- Its refusal at l.30 (`!canEditSched()`) is the same question F2 is about.
- `leavewar/sync.ts tellHoliday` l.1482 decides whether to open the list with `const mine = myUnit()`.

**Failure (proof O4):**
- After PB4, Saber (home 142) taps a 149 holiday line. The list opens on 149 and shows Osprey's Sat 18 Jul duty.
- He answers Yes and saves. `saveOilDay` filters by `myUnit()` (142), finds nothing, saves 0 answers, and gives no
  warning. Osprey's OIL day is never credited.
- The same happens to Hunter with Plan of 149.

**Rulings:**
- D2201, Plan as full access: "every page, each his to edit".
- D2197, a master admin's pick moving every page, each edited as that squadron's own admins edit it.

**Fix, step by step:**
1. Put the list's squadron on the list's open state (`OILLIST`) when it is opened from a line.
2. Pass that squadron to `saveOilDay(from, to, picks, unit)` and use it in l.31's `oilOpenOn`.
3. Replace l.30's `canEditSched()` with "an admin of `unit`" (`levelIn(..., unit) === 'admin'` with the role in force,
   F2).
4. Change `tellHoliday` l.1482 to read `pageUnit('own')`, or the line's squadron.
5. Add O4 to PB4's tests, and add `ui/oilday.ts` to PB4's list of files.

---

### F4 — A 149 holiday line stays hidden on a bell whose loaded Leave War is 142's (PLAN; new)

**Where:**
- `noticeLive` (`notices.ts` l.722) hides a holiday line whose span reads null (l.763: `if (!s || noticeLeft(n) <= 0)
  return false`). The span comes from `noticeSpan`, then `HOL_SPAN`, then `leavewar/sync.ts holidaySpan` l.1446.
- `holidaySpan` judges the days with `isNonWorkingISO`, which reads the **loaded** war.
- `holidayOwnName` (l.1456) reads `dayFacts`, also the loaded war.
- `holidayLineOn` (`notices.ts` l.776) has the same dependency.

**Failure:**
- Hunter holds Plan of 149. D2202 says his bell carries 149's admin lines.
- With 142's war loaded (his own pages), 149 adds a holiday on Fri 24 Jul. The line is built, but `holidaySpan` reads
  142's war, where 24 Jul is a working day. The span is null and `noticeLive` hides the line.
- Hunter is never told. PB4's fix (the line carries its squadron, `holidayLeft` counts it) does not reach `holidaySpan`
  or the holiday's name.

**Ruling broken:** D2202 — `**While an admin holds Plan of another squadron, his bell carries that squadron's admin lines, on by default, his to switch off; each line shows which squadron it is from — 142 or 149.**`

**Fix, step by step:**
1. `holidaySpan(a, b, unit)` judges days with `nonWorkingFor(unit, d)`, the squadron's stored holiday list rather than
   the loaded war.
2. The name comes from that squadron's stored war, read the way `oilOpenOn(…, unit)` already reads another squadron's.
3. `noticeSpan`, `HOL_SPAN` and `holidayLineOn` pass the line's stored squadron (PB4's new field).
4. Add these to A4 and PB4. Test: Hunter with Plan of 149 and 142 loaded sees 149's holiday line, and counts it against
   149's open inputs.

---

### F5 — Approvals' "since you last looked" moment is one per person, not one per squadron (CODE; new)

**Where:**
- `raptor-port/src/state/apprseen.ts`: one row `apprseen:<pid>` holding one moment.
- `raptor-port/src/leavewar/ui/ApprovalsPage.tsx` l.96 reads and writes it, whichever squadron's war is loaded.
- Compare the change history's `seen:` in `state/changes.ts`, which is already per squadron.

**Failure (proof O2):**
- Saber opens 142's Approvals at moment 1000. He picks 149 (D2197) and opens 149's Approvals at 2000. He goes back to
  142.
- 142's "New" dots and its "Also since you last looked" group are now measured from 2000, his 149 visit. Every 142
  request that arrived between 1000 and 2000 has lost its "New" mark, unseen.
- Through `pageUnit('own')`, the same happens to Hunter with Plan of 149.
- Reachable once step 5's pick moves the Leave War. For a master admin this is code today, written for the pick.

**Rulings broken:**
- D1231 — `… the cyan dot leads a line that arrived since the admin last opened Approvals, and a member's decisions since he last looked, inside those two lists only; …`. It is the moment of the Approvals he opened, which is one squadron's.
- With D2197 (every page follows a master admin's pick) and D2201.

**Fix, step by step:**
1. Change the stored shape to `{ units: { [unit]: { at } } }`.
2. Read an old single moment as the home squadron's. This is demo data, so clearing it is also fine (D22, D56).
3. Give `openApprovals(pid, now, unit = worldUnit())` and `apprSeenAt(pid, unit = worldUnit())` the squadron.
4. `ApprovalsPage` passes the loaded war's squadron.
5. Add O2 to the tests.

---

### F6 — A right taken away during the day leaves the pick and the loaded Leave War on that squadron (PLAN; new)

**Where:** reshape plan §2, A-iv.
- `enterSquadron` re-runs only when his home changes, plus the midnight check.
- `pageUnit('own', today)` reads his Plan live.

**Failure:**
- Hunter holds Plan of 149 and has 149 picked, so the Leave War and Tracker are 149's. Saber removes the Plan, or lowers
  it to View. A PA2 drop does the same.
- Now `pageUnit('own')` says 142, but the loaded war and Tracker are still 149's. His war role is still admin.
- He goes on reading all of 149's leave with no right to it, and each save he tries is refused.
- The schedule pages stay on 149 too, with no right at all once the Plan is removed.
- The reverse: Saber raises View to Plan while 149 is picked. The own pages now say 149, but the loaded war is still
  142's.

**Ruling broken:** D2191 — `… View of another squadron shows its schedule pages and Logic read only, never its bell.` A man
with no right sees nothing of it.

**Fix, step by step:**
1. In `notify()`, or wherever A-iv hooks in, re-run `enterSquadron` whenever either is true:
   - `pageUnit('own', today)` differs from the loaded war's or Tracker's squadron;
   - the pick is a squadron where he holds no home, View, Plan or master mark (the pick then goes home).
2. Keep the typing hold, so a save in progress is not lost (D2243 Q7's band).
3. Test: remove Hunter's Plan while 149 is picked. His war, Tracker and pick go back to 142, and the band shows if he
   was typing.

---

### F7 — PA2's "drop allowed to whoever may make him a member" lets an admin who is not a master admin end a Plan (PLAN; contradicts PA3 in the same plan)

**Where:** plan §19 PA2, l.1510: "making a Plan holder a member drops his Plan rows in the same command — a drop allowed to
whoever may make him a member". Also l.501.

**Failure:**
- Saber gives Kestrel (149's admin) Plan of 150.
- Hunter holds Plan of 149, so he may make a 149 man a member (D2192 via D2201). He makes Kestrel a member, and PA2's
  drop ends Kestrel's Plan of 150.
- Hunter holds no right in 150 at all. A Plan that only a master admin gives and takes has been taken by an admin who is
  not one.
- PA3 in the same section says the opposite: "the drop takes Plan, which is a master admin's alone (D2199)".
- The delete drop (`personDeletedHere`) is the same shape, the host's earlier fault H. Name it beside this one.

**Rulings broken:**
- D2199 — `… set by a master admin only; … the master switches it off when the job ends.`
- D2201's reading — "Plan is given and taken away by a master admin only (D2199)".

**Fix, step by step:**
1. On the role change: refuse making a member of an account holding a Plan that holds today, unless the actor is a
   master admin. Suggested words, to draw first (D1625): "Hunter holds Plan of 150. Only a master admin can make him a
   member."
2. At the gate: the PA2 drop is allowed only when `actorMaster`.
3. Delete: make the same choice for `personDeletedHere`'s drop, or state why it differs.
4. PA2 calls itself "The agent's decision, technical". It decides who may end a Plan, which is a product choice, so it
   goes to him.

---

### F8 — The sign-off boxes never offer a Plan holder, so he cannot sign the day he planned (CODE and PLAN; a clash of rulings — a question for him)

**Where:**
- `raptor-port/src/engine/publish.ts signPeople` l.1725–1733 offers only `rosterOf(UNIT)` people with the Scheduler
  tick. `SIGN_ROLES` is at l.1532 and `setSign` at l.1619.
- Publishing needs every box signed (`daySigned`): SKED CK, PLANNED BY, APPROVED BY.
- The plan's C5, with D2243 Q2, keeps "the day's people".

**Failure:**
- Hunter holds Plan of 149 and plans Thu 16 Jul for 149. PLANNED BY offers only 149's own people, and Hunter is 142's.
- He can publish only by picking someone else, such as Kestrel, as PLANNED BY.
- The published record then names the wrong planner. That is a published-record harm.

**Rulings:**
- D2201: `**An admin a master admin gives "Plan" of another squadron has full access to it, everything 149's own admins have — …**` The agent's table there named "149's schedules and publishing".
- D2211: "its schedule and publishing".
- D2199's reading: "publishing included".
- Against these: D2184 Q13 (17 Nov 26, earlier than D2201): "a detachment's sign-off boxes offer anyone of its own
  squadron qualified for each box, … never the other squadron's".
- D2243 Q2: "sign-off boxes offer that day's people".

This is a clash between rulings, so it goes to him (D90, D201). My recommendation: the boxes offer the squadron's own
people first, then its Plan holders and a master admin who carry the Scheduler tick.

---

### F9 — The posting line's tap may open a page that does not hold the man (PLAN; the doors helper's "unsure 6", not folded in)

**Where:** `raptor-port/src/ui/topstate.ts openNotice` l.104–111: `const po = postOf(n)` → `openAdminUsers({ person:
po.who })`.

**Failure:**
- Once step 5 filters Admin → Users by `pageUnit('own')`: Hunter, with 142 picked, gets a 149 posting line (D2202), or
  D2214's "Posting out could not run" line for a 149 man.
- He taps it. Admin → Users opens on 142's list, and no row is ringed.
- D2214 promises "a tap opening his row".

**Rulings broken:**
- D2214 — `… "Outlaw · Fri 20 Nov / Posting out could not run. See his row on Admin → Users." — a tap opening his row.`
- The B12 register row: "Admin → Users at his row, ringed".

**Fix:**
1. For a reader who is an admin of the man's squadron (at home, by Plan, or a master admin), `openNotice` moves the page
   to that squadron, or opens the list found by search, before ringing the row.
2. Add this to PF1 (step 5) with a test.

---

### F10 — A Plan holder's lines from the squadron he moves into leave his bell at the move (PLAN; low)

**Where:** `raptor-port/src/state/notices.ts noticeLeftBell`, l.689 (`const was = homeOn(to, wrote)`) to l.714. A line's
squadron is judged as the reader's home on the day the line was written.

**Failure:**
- Hunter holds Plan of 149 and has 149 lines on his bell. He is moved into 149.
- Those 149 lines are judged as "written while he was 142's", so they leave his bell, though he is now 149's admin.

**Fix:** once lines carry their squadron (PB1–PB5), judge each line by its own squadron against the reader's rights on
that day.

---

### F11 — Documents and drawings that still leave the Plan holder out, or say "master" alone (WORDS and stale rules)

**Rulings:**
- D2241 — `**Wherever a master admin may act for a squadron, an admin holding Plan of that squadron may too — in what the app allows, in its words and in what is written for him — and both are named, never the master admin alone.**`
- D2240 — `**The role is always called "master admin" — in every word on screen and in everything written for him — never "master" alone.**`

**`raptor-port/docs/data-model.md`:**
- l.1845: "the master's Archive, Restore, Restore as and Delete" leaves out the Plan holder.
- Bare "master" also appears at l.979, 1068, 1093, 1692, 1697, 1719, 1720, 1745, 1747, 1754, 1765–1767, 1797, 1852–1853.

**`raptor-port/docs/notifications-register.md`:**
- B12 (l.43): "every admin who can sign in of the squadron … never the other squadron's". This contradicts D2202 for a
  Plan holder of that squadron.
- D2214's "Posting out could not run" line has no row in the register at all.

**`raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md`:**
- l.79–81: "Access to another squadron is View only, never as a scheduler … an admin of a squadron is made only by its
  own admins or a master admin". This is stale and unmarked. PJ1 corrected the same line on the scheduler page.
- l.88–91: "for a master admin every page follows the pick". No Plan holder.
- l.77–78: the access request "goes to that squadron's admins only". The audience must be `adminsOf`, Plan holders
  included.
- l.123 (O3).

**The rest-pieces map:**
- P3: "every page following a master's pick".
- P4: "the master's bell". The Plan holder's switch (D2202) is drawn in picture 3c.

**`.claude/rules/decisions/people-accounts.md`:**
- l.139 names the master admin alone for the pick moving every page.
- Bare "master" at l.138, 142 and 145.

**The reshape plan:**
- §0's ground rule: "A master admin's every page follows his pick (D2197)".
- §1's A7 row, l.923 and l.1015 are stale (Q3 is answered, D2243).
- l.253 and l.284: "step 5's master admin pick".
- These tests name only the master admin: A-v l.308 and l.335; B1 l.1037; §6.4 and §6.5 l.1032 and l.1047.
- §13's plain-user round says "for each of the four seeded sign-ins". There are five, and no round is for a Plan holder,
  though Admin → Users acts on 149's men for one today.

**Drawings `raptor-port/docs/mock/2026-11-19-multi-sqn-pieces/`:**
- The §1 list line "View 149: … Given by 149's admins or a master admin." PK1 covers only picture 1c.
- Bare "a master" at `page.html` l.80 and l.103.
- Picture 10's example: "Saber and Hunter, 142's admins, each get the line; 149's admins get nothing". By D2202, a Plan
  holder of 142 gets it too.
- Picture 7's words, under PG1's reading.

**Drawings `raptor-port/docs/mock/2026-11-20-multi-sqn-reshape/page.html`:**
- The "Told to you" re-link line says: "only a master admin, or an admin of every squadron it has access to (by Plan),
  may move it".
- PA3 now makes re-linking a sign-in holding Plan a master admin's alone, so he was told a rule that is no longer the
  plan.
- Correct the line and tell him the change (D2140).

**Fix:** one WORDS pass in Piece B's documents step, with each line above rewritten to name both the master admin and the
Plan holder. The re-link line goes to him as a changed reading.

---

### F12 — The last-admin words send a 142 admin to a fix he cannot make (CODE words; low)

**Where:**
- `raptor-port/src/state/accounts.ts lockProblem`, with the plan's §14 item 2.
- When 150's only admin is a Plan holder, a 142 admin who holds no right in 150 is told "… Make another admin of 150
  first."

**Fix:** where the reader is no admin of 150, the words say who can act: "Only a master admin or an admin of 150 can
make
another admin of 150." Draw them first (D1625).

---

## Roll-call verdicts challenged

1. **Doors row 41: "in the member view he acts as admin nowhere".**
   - This is not true at the gate. `units-model.ts levelFrom` reads a grant whatever the account's role, and the gate's
     member branches (§7, §7b, §7f) let a 149 record through on a Plan grant while the role in force is member.
   - No harm today, because no screen offers a 149 save in the member view.
   - It matters for PA2's backstop and for `pageUnit`. The verdict should read "HAS IT on screen; at the gate a grant
     still counts in the member view — PA2's backstop must read the role in force".
2. **Gate rows 2–3 and doors row 34.**
   - Their fix wording, "read `levelIn(…, pageUnit) === 'admin'`", carries the member-view fault of F2.
   - It should read "the role in force first, then the page's squadron level", with the own pages split from the
     schedule pages.

## Explicit negatives — read, and nothing found beyond the roll-call

- **`perms.ts`:**
  - §7 `unitRecordViolation`, §7b (war), §7c (inputs), §7d (history), §7f (Tracker).
  - §8 for persons and accounts (beyond F1).
  - G4, beyond PA3.
  - `postingPassViolation`, beyond the roll-call's row 36.
  - §7e `adminOwnerViolation`: `ownsHim` and the read records.
  - The master-only commands (squadrons, `setMaster`, a shared place's time zone).
- **`accounts.ts`:** `otherSquadronProblem`, `otherSquadronPersonProblem`, `relinkRightsProblem` (beyond PA3); add,
  update and approve; `setMaster`; `lockProblem`'s counting (its words are F12).
- **`setGrant`'s refusal of a right in his own squadron**, and `unit.place` changed by a Plan holder (§6's
  admin-of-a-squadron-at-that-place check holds).
- **`quals-write.ts`.**
- **`leavewar/sync.ts`:** `archiveProblem`, `restoreProblem`, `postOutProblem`, `foreignOf`.
- **The Tracker:** its flex settings and roster writers.
- **The change history:** `seen:` is already per squadron, and `elogUnitAllowed` is correct. Also `ChangesWindow`.
- **`HelpPage`:** bug reports are shared by everyone and belong to no squadron.
- **`cutoff.ts`:** covered by B4.
- **`storage/keyowner.ts`:** every squadron setting there is already keyed by squadron.
- **Undo's `inUnitView`:** Archive and Restore are not Undo steps (D350), so no off-view step is skipped.
- **Bidding lines:** they are people's lines, not admin lines, so Plan does not apply.
- **Pending account approvals:** no bell line exists for anyone.
- **`view.ts BELLLIT`:** nothing uses it.
- **Piece C's last-admin rule:** a Plan holder counts only where the squadron has no admin at home, as written.

## What I did not do

- I ran no test: the export has no node_modules. The proofs above are unrun.
- I did not walk the app.
- I did not read the Tracker's screens beyond their writers, or Insights.
- Anything outside the export folder and my own proofs folder was not opened.
