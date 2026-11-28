# Red team of batch 1's second-half plan, round 3 — the fresh Opus reader's report (22 Nov 26, chat 139)

Brief: `2026-11-22-msq-b1-second-half-plan-read3-brief.md` (§15 alone), blind to Astra's and Fable's reports of this
round. Read an exported copy of commit 310496564 (picture-free; the builder's handoff block removed). Saved by the host
as returned, condensed only in layout. Spot-checks by the host: §16 of the plan.

The reader read §15 against `raptor-port/src` and the full rows of D2198, D2202, D2218, D2251, D2253, D2299, D2308–D2311.

## Findings (most serious first)

**1. D1 — an Undo that ends a right leaves the lines that arrived in the meantime.**
- Case: Saber gives Hunter Plan of 149 at 09:00. At 09:30 a 149 posting runs and its `po` line reaches Hunter. At 10:00
  Saber presses Undo. Hunter's Plan is gone, but the 149 line stays on his bell, marked "149"; a tap opens a 149 page he
  cannot act on. The same on an Undo of "made a master admin", and of Member → Admin.
- Cause: D1 removes lines only in the command that ends a man's admin level. A restore only replays the step's own
  records, none touching lines written after the step. `state/undo-wire.ts` l.590–607 (the `reversed` hook) writes the
  war's follow-ups only; the gate (`state/perms.ts adminOwnerViolation`) has no rule for it.
- Fix: when an Undo or Redo lowers a man's level in a squadron (judged before and after), the restore also removes his
  stored admin-kind lines of that squadron, inside the restore's own envelope, from the `reversed` hook as
  `warNoticesReversed` does; the gate passes them by D1's before/after test, origin `restore`. Tests: give Plan → line
  → Undo → gone; make master → another squadron's line → Undo → gone.

**2. D1 — lines he was told only as an input's filer, through the right he loses, stay on his bell.**
- Case: Hunter, holding Plan of 149, files a leave for 149's Viper; every later change tells him as its filer
  (`fu: ['149']`). Saber takes his Plan, with no move; those lines stay, the unread ones keep his bell lit — against
  D2310 and D2223 (a filer is told only while he is that man's admin).
- Cause: `filerTold` (`state/notices.ts` l.142ff) counts a Plan grant; `noticeLeftBell` judges `fu` lines only on the
  days his home changes (l.716–724); `noticeAboutHim` (l.650–671) returns false for them; D1's kinds leave them out.
- Fix: D1's set also takes every input line with `fu` where, after the command, no squadron in `fu` is his unmoved home
  or one he is still admin of (`filerVia`'s test); the gate the same. Test: Plan taken → his filer lines for Viper's
  leave gone; a line where he is named in the input stays.

**3. D1's gate sentence either refuses a lawful command, or its forgery test cannot pass.**
- A (read as a narrowing): Kestrel presses the posting sheet's "Undo post out" on a posting whose line another admin
  has not read; `retractPostingLines` (`leavewar/sync.ts` l.3756–3764) deletes that unread `po` line with no change of
  level, so it would be refused.
- B (read as a widening): D1's test "a forged removal of another man's lines refused" fails — `ownsHome` (`perms.ts`
  l.3022–3026, used at l.3108) already lets any admin of a man's home delete any line on his bell.
- Fix: a closed list — a command may delete an admin-kind line from another person's bell only where (a) its own
  records lower that man's level in the line's squadron, (b) it is the posting take-back's own command for an unread
  line of that posting, or (c) it is a verified replay. Tests: the forgery refused; "Undo post out" still passes.

**4. D1 contradicts D6 — the promotion command is refused.**
- Saber makes Hunter a master admin; D1 writes Hunter's `bellsqn` "on" for 149 inside Saber's `account.access`; D6
  allows `bellsqn:<pid>` only for the actor's own person, so the promotion is refused. It would also overwrite an "off"
  Hunter chose himself, against §7 item 3 (the setting holds only his own choices).
- Fix: one exception — a command that sets the master mark on may write that account's `bellsqn`, only "on", only for
  squadrons whose Plan rows it drops, only where he has no entry of his own. Tests: promotion passes; Saber writing
  Hunter's `bellsqn` in any other command refused.

**5. D1 — the worked-out "off the manpower" lines come back when Plan is given again.**
- Hunter holds Plan of 149; a 149 posting with no outcome dated 3 days ago gives a worked-out line `po:viper:<date>`.
  Saber takes the Plan at 10:00 and gives it at 11:00 (a new command); the line comes back, unread — `markNoticeRead`
  prunes ids of lines that are gone (`state/noticeseen.ts` l.88–90). D1's test "none back" fails.
- Cause: `postedLines` (`leavewar/sync.ts` l.1713–1720) asks today's `postingAdmins(u)`; the line's id is steady
  (l.1744). D1 says these lines need nothing.
- Fix: for a squadron not his home, `postedLinesOf` builds only postings dated on or after the `from` of the grant that
  now makes him admin (`setGrant` writes a new row dated today when none holds, `state/units.ts` l.288–291). The master
  mark and home role have no start day — tell him these lines follow the right there (the agent's reading), and narrow
  the test.

**6. D1 — an archive or an Overseas posting ends Plan (D2311) but does not take that squadron's lines.**
- Hunter holds Plan of 149, is posted Overseas (archived, suspended), later restored and enabled without Plan; his bell
  still holds 149's `po` and `oilhol` lines.
- Fix: add the archive's command and the pass's Overseas outcome to D1's commands; extend §4 item 8's gate exceptions
  (`unitRowViolation` about l.2541–2568, `postingPassViolation`) to these removals. Test: archive → restore → no 149
  lines.

**7. D1 — an Undo can bring back a line whose posting has since been taken back.**
- 10:00 Saber takes Hunter's Plan; Viper's `po` line leaves Hunter's bell. 10:30 Kestrel presses "Undo post out" on
  Viper's posting; `retractPostingLines` works over the bell as it stands, so Hunter gets nothing. 10:45 Saber presses
  Undo; Viper's "Posted out · archived" line comes back for a posting that no longer happened.
- Fix: the restore (`undo-wire` `leaveOut`) leaves out a `po` line whose posting is no longer done; test this sequence.

**8. D2 — a Plan holder's own home Tracker falls into case (b).**
- Hunter (142's admin, Plan of 149) opens his 142 Tracker, then picks 149. `pageUnit('own')` is now 149 (`perms.ts`
  l.278–286), the bound Tracker 142; D2 (a)'s condition ("a squadron he holds Plan of, or a master admin") misses it, so
  (b) hides the chart: "You can't open 142's Tracker any more. Sign out and in to open 149's." — false: picking 142 again
  is enough. In the member view a Plan holder also gets (b)'s "Sign out and in", though one tap brings the chart back.
  (a)'s words never tell him how to reach his own squadron's Tracker.
- Fix: (a)'s condition — his account is an admin of the bound squadron today by any road (home role, Plan or the master
  mark — `levelOfAccount(levelAcct(acct), bound, iso) === 'admin'`), read from the account, not the role in force; (b)
  only where that fails; in the member view (b) says to tap his name to switch back. Into F2.

**9. D2 — the pick's "ask first" reuses the sign-out question, which talks about logging out.**
- With unsaved chart edits a pick would ask "… Save them before logging out?" (`tracker/app/core.js` l.97), and call
  `show`, jumping to the Tracker page before the pick (`ui/logout.ts` l.27).
- Fix: the pick its own wording and `show` behaviour, drawn with F2.

**10. D7 — keeping a read own-account line through the Undo breaks the Redo; the gate door named has nothing to work from.**
- Saber gives Hunter Plan of 149; Hunter reads "Given Plan of 149 · Saber". Undo: D7 keeps that line and writes "Plan of
  149 ended · Saber". Redo replays the forward `put` of the first line, whose id is still stored; `writtenAsNewViolation`
  (`perms.ts` l.3188–3195; restores not exempt) refuses the whole Redo. And `restoreFollowUpOwed` (l.2981–2998) takes its
  source from lines the restore removed, war lines only (l.3125) — with the first line kept, nothing vouches.
- Fix: copy the war's shape — the Undo always takes the step's own-account line; if he had read it, the restore writes
  the opposite line inside its own envelope, proved by §7's own rule on the restore's replayed access; the Redo puts the
  first line back by verified replay, and where he had read the opposite line also writes a fresh unread line, as the
  war's "again" line. Test give → read → Undo → Redo.

**11. D10 — a posting the gate refuses can never prove it failed, so its line is refused and the admins never told.**
- Ranger's Overseas posting is due; the pass's command is refused by the gate (the retry case, `leavewar/sync.ts`
  l.3004) and given up (`PO_REFUSED`). "Held" can be re-checked from rows (`poHeldReason` l.2812–2824, `deleteBlocked`
  l.3277–3288); "refused now" cannot — the gate cannot dry-run a posting command it was not given. D2214's ring fails
  silently; the plan's tests cover only a held Delete.
- Fix, one of: (a) a pure builder of the posting's outcome from the stored rows, the gate running its posting sections
  on it and passing the line where they refuse; (b) accept "due, not done, not held by the last-admin lock" as proof,
  telling him the worst a forgery does is an early amber line that leaves when the posting runs. Either way a test for
  a gate-refused posting.

**12. D4 — the same threshold is read when an answer is voided, at the door and at the gate.**
- 142's full-OIL line 240 minutes, 149's 300. Ranger with View of 149: his Saturday duty 08:00–12:30 (270 min) answered
  Yes, full day. With 149 picked he changes only its remark; `voidedOil` works the amount as half a day under 149's line,
  differing from his Yes; his answer is dropped, the OIL lost.
- Cause: `voidedOil` and `repricedOil` (`engine/oil.ts` l.123–145) call `inputOilAmt` → `ruleNow('oilFullMin')`, the
  loaded squadron's (`switchUnit` reloads, `state/store.ts` l.880); used by the input's save and the gate's member check.
  D4 names only `oilAskPlan`.
- Fix: `inputOilAmt` takes the input's squadron (as `cutBackFor`), all four callers pass it; D4 names `voidedOil`,
  `repricedOil`. Test red first: the remark edit with 149 picked keeps the Yes, at the door and the gate.

**13. D5 and D11 (with §7 item 6) — where the gate checks an own-account line decides whether it passes at all.**
- Kestrel gives Hunter View of 149: the `acct` line has no squadron (D5), so `lineSquadron` gives nothing and it fails
  "a bell line of another squadron's man" (`perms.ts` l.3108); even Saber's fail "a bell line about nothing the command
  changed" (l.3150–3154). D11's line is written at a later load; dated the change day (`at`), `lineNotNow` refuses it
  (l.2878–2883).
- Fix: the own-account door goes before the `ownsLine` and "about nothing" checks, named in the plan; the app's own
  writer (system role, skipping `adminOwnerViolation`, l.3008) its own section, as `postingPassViolation`; D11's line
  carries `at` = now and `day` = the change's day.

**14. D13 — an empty set of squadrons lets any admin through, a gap today's gate does not have.**
- 142 moves from Home base, so from the next day no place row names Home base; "an admin of every one" over an empty
  set is true, and Kestrel may change Home base's time zone. Today's check (`perms.ts` l.2588–2589) refuses him. "A
  place is only ever made with a move or a new squadron" is assumed, not enforced: `setPlace` makes a place on its own
  (`state/units.ts` l.250–259), and the gate checks no new place row (`b != null` only).
- Fix: an empty set needs a master admin; a new place row passes only where the same command writes a squadron place
  row naming it, or the actor is a master admin. Tests for both. Line note: the check sits at l.2588–2589 in this copy,
  not l.2615–2617; D10's `stashPreflight` / `masterDeleteProblem` sit in `poHeldReason` l.2812–2824, not l.2895–2897.

**15. New on-screen words §15 implies that §9 does not list:** D3's toast "1 waiting for access to 149"
(`ui/topstate.ts` l.54); D7's Undo label for `account.access` (`undo/describe.ts`); D2's pick-time unsaved-chart
question (finding 9); D2 (b)'s member-view words (finding 8). All on the §9 page before they are built.

## The decisions

- D1 — does not hold (findings 1–7)
- D2 — holds with findings 8, 9
- D3 — holds with finding 15 (the toast)
- D4 — holds with finding 12
- D5 — holds with finding 13
- D6 — holds with finding 4
- D7 — does not hold as written (finding 10; label in 15)
- D8 — holds
- D9 — holds
- D10 — holds with finding 11
- D11 — holds with finding 13
- D12 — holds
- D13 — holds with finding 14
- D14 — holds
