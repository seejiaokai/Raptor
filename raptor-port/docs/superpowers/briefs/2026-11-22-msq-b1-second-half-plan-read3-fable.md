# Red team of batch 1's second-half plan, round 3 — Fable's report (22 Nov 26, chat 139)

Brief: `2026-11-22-msq-b1-second-half-plan-read3-brief.md` (§15 alone), blind to Astra's and the fresh Opus reader's
reports of this round. Read an exported copy of commit 310496564 (picture-free; the builder's handoff block removed).
Saved by the host as returned, condensed only in layout. Spot-checks by the host: §16 of the plan.

Scope: §15 (D1–D14) alone, against the code under `raptor-port/src` and the rows of D2198, D2202, D2218, D2251, D2253,
D2308–D2311. All §15 line references checked are right (`bellTap` l.51–56, `bandWords` l.1028–1043, NOT_STEPS l.272,
`postedLinesOf` l.1723–1744, `perms.ts` l.2616–2617, `adminRecFor` l.352–362, `logout.ts` l.39, `sync.ts` l.2895–2897
and l.3277–3288).

**Where §15's own shape breeds faults:** D1 turned "which lines may he see" from a rule read at the bell into a write
made by named doors. Every path that ends or restores an admin right without going through one of those doors now
leaves the bell wrong (findings 1–4, 8). The second seam is the bell switch: D6 puts it in the one body but drops the
"about himself" exception, and D1 writes another man's switch row that D6 forbids (findings 1, 5).

## Findings

**1. D1 and D6 contradict: the promotion to master admin is refused, or its test cannot pass.**
- Case: Saber makes Hunter (Plan of 149) a master admin. D1 has that command write Hunter's bell switch "on" for 149. D6
  makes `bellsqn:<pid>` writable "only for the actor's own person, by its one command". The actor is Saber and the type
  is `account.access`, so the gate refuses, or the row is not written and D1's "none gone, still in view" fails (D2198's
  default hides 149).
- Second fault if the gate were widened instead: Hunter later flips his own switch, and Saber's Undo of the promotion is
  refused as "Hunter changed this after your action" because the switch row is in Saber's step.
- Cause: §15 D1 ("his bell switch written 'on'") against §15 D6 ("the owner's alone … NOT_STEPS").
- Fix: never write his switch row. Keep the fact on the account row, which `account.access` already owns:
  `bellKeep: ['<unit>', …]`, set in the promotion for each Plan dropped and cleared when the mark comes off. The default
  reader for a master admin becomes "home, plus `bellKeep`"; his own `bellsqn` choices still win. Undo restores the
  account row whole. Test: promote, bell still shows 149's lines; Hunter switches 149 off; Saber's Undo still goes
  through.

**2. D1 removes lines only in named doors, so rights that end any other way leave the squadron's lines on the bell
(D2310).**
- (a) Top-bar Undo of a give. Saber gives Hunter Plan of 149 at 10:00; 149's posting runs at 10:15 (its line to Hunter,
  out of band); Saber presses Undo at 10:30. A restore replays images and runs no door (`undo/timeline.ts applyRestore`
  l.933 on), so the 10:15 line stays on the bell of a man with no right of 149.
- (b) Redo of a take-away, after lines arrived between the Undo and the Redo: the same.
- (c) D2311's paths (§4 item 8, not overridden by §15): Hunter is archived, or posted Overseas, which ends his Plan of
  149; restored a week later without it (D2311), his bell still holds 149's lines. D1 lists only Plan taken or lowered,
  made a member, master admin off.
- Cause: §15 D1 ("no continuity is worked out at read time") with the removal tied to doors.
- Fix, three parts:
  1. One read rule in `noticeLive` (`state/notices.ts` l.739), beside the member-view test: a line of the admin kinds
     (`po`, `poback`, `oilhol`, the posting-failed kind) stamped `u` is live only while its reader is in
     `adminLineAudience(u, today)` by his account's own role. It needs no history and holds on every path.
  2. The removal ("for good") keyed at the gate on the level change in the command's own records, not on the command
     type, so the archive command and the posting pass's Overseas outcome run it too.
  3. After an Undo or Redo of an access change that ends his admin level, D7's follow-up command also removes that
     squadron's admin lines written since; the gate proves it from the verified replay's account and grant rows.
- Tests: (a), (b), archive then restore, Overseas then restore.

**3. A non-master's Undo of "made a member" puts 149's lines back without the Plan.**
- Case: Viper (142's plain admin) makes Hunter (142 admin, Plan of 149) a member; D1 removes his 142 and 149 admin
  lines. Viper presses Undo. The role comes back, but the Plan row is left out of the restore (`state/perms.ts
  restoreLeavesOut` l.2174: a Plan only by a master admin's restore, D2250). The line puts are left out only on a move
  (`state/undo-wire.ts` l.641, `noticeLeftBell`). So 149's lines return to a man who is not 149's admin. D1's "the right
  and the lines back together" is false here.
- Fix: the `leaveOut` hook at `undo-wire.ts` l.641 also leaves out a put of an admin-kind line whose reader will not be
  in `adminLineAudience(u, today)` after the restore (read over the restore's kept rows). Finding 2's read rule is the
  backstop. Test: this case, with 142's lines back and 149's not.

**4. D1's "taken at 10:00 and given at 11:00 — none back" fails for the worked-out posting lines.**
- Case: Outlaw's "off the manpower" posting in 149 was dated yesterday. Hunter's Plan of 149 is taken and given again.
  `postedLines` (`leavewar/sync.ts` l.1711–1722) builds the line for whoever is in today's audience, so it returns. It
  can return unread, because `markNoticeRead` (`state/noticeseen.ts`) drops read ids whose line is not currently his.
  The same after Admin → Member → Admin at home.
- Cause: D1 says the derived lines "need nothing".
- Fix: `postedLinesOf` gets the unit (D6 already passes it) and skips a posting whose date is not after the day the
  reader's present admin right in that squadron began: `adminThen`'s test for a Plan or the mark (`state/notices.ts`
  l.300), and `adminFrom` for the home role. For that, `adminRecFor` (`state/accounts.ts` l.352–362) must write
  `adminOf` / `adminFrom` = today when a member is made an admin again; today it returns the bare row. Test red first.

**5. D6's switch, placed in `noticeLive` with no exception, hides lines about the man himself (D2218, D2222).**
- Case 1: Saber, master admin, moves 142 → 150. "LL approved · Kestrel" about his own leave is stamped 142 (§7 item 1).
  142 is now another squadron, off by default (D2198), so the line vanishes; D2218 keeps it.
- Case 2: a master admin who switches his own squadron off loses "you were added to…" lines and his own leave decisions.
- Cause: D6 adopted round 2's finding 5 without its condition ("after the about-him exception"); D5 exempts only `acct`.
- Fix: in `noticeLive`, the switch is asked only where `!noticeAboutHim(n)` and the line carries a squadron. Tests: both
  cases; a filer-only line (`fu`) does follow the switch.

**6. A master admin's own move takes every other squadron's lines off his bell.**
- Case: Saber (home 142, 149 switched on) moves to 150 tomorrow. Tomorrow 149's "Posting out could not run" line is
  gone, though he is still 149's admin without a break.
- Cause: `noticeLeftBell`'s last branch (`state/notices.ts` l.729–731) is "moved and not about him", with no squadron
  asked. That was harmless while a master was told through his home only (`adminsOf`). §7 item 2 now sends him every
  squadron's lines, and D1 keeps the move rule "as it is", dropping the old item 4's sentence that it read the line's
  `u`.
- Fix: for a line of the admin kinds stamped `u`, that branch asks each move day as the filer loop above it does
  (l.722–726): left only where `!adminThen(acct, u, d)`. A Plan holder's move ends his Plan (D2203), so his lines
  still leave. Test: Saber's move keeps 149's; Hunter's move with Plan of 149 loses it.

**7. D10's proof cannot be run for a refused posting.**
- Case: the test "a forgery for a due, untried posting refused" beside "a genuinely failed posting rings". A held
  posting has a check the gate can re-run (`poHeldReason`, `leavewar/sync.ts` l.2812–2825). A refused one does not: its
  refusal is the gate's judgement of the pass's whole command (`refused()`, l.3012–3020), and no function over the
  stored rows reproduces that without running the posting. So the rule either passes every due, not-done posting (the
  forgery passes) or refuses the real line (D2214's ring is never written).
- Fix: the proof of a refusal is the runner's own record. Hand `PO_REFUSED` (l.2784, set at l.3017) and `FX_REFUSED` to
  the gate through a probe, as `setLwPostingProbe` already is. The `posting.failed` rule passes where `poHeldReason`
  answers a reason that is not `lastAdminLock`'s, or the probe holds that posting's key. A group failure never sets a
  key before the single retries, which is the "rings for none" case.

**8. D4's inventory misses the bell lines worked out from the loaded Leave War.**
- Case: Saber (home 142), 142's bidding stretch ended yesterday. With 142 picked his bell holds "bidding closed · …". He
  picks 149: `endedLines` (`sync.ts` l.1685 on) reads the loaded war and `warAudience()` (l.1659, people at home in
  it), so his line goes, the unread count drops, and the older stored "bidding open" line it had replaced shows again
  (`noticeLive`'s one-line-a-stretch rule). The same for a Plan holder.
- Cause: D4 lists readers of `VCONF` and the templates; this reads a fourth in-memory thing, the war's world.
- Fix: `endedLines(pid)` reads the wars of the reader's home squadron (the loaded war when it is his home's, else that
  squadron's stored periods, as `storedPostings` does) and is added to D4's list as "own squadron". Test red first: 149
  picked, the line and the unread count unchanged.

**9. D7: three gaps.**
- (a) Kept line against the gate's door. `restoreFollowUpOwed` (`perms.ts` l.2964–2981) finds what is owed from the
  notices the replay deleted. D7 keeps the first line when it was read, so nothing is deleted and nothing is owed: the
  follow-up is refused. Fix: the `acct` probe is fed the replayed account and grant rows, and the read line's delete is
  left out by `leaveOut` on Undo, its put on Redo.
- (b) The follow-up's command type must be in NOT_STEPS, as `lw.notice` is (`timeline.ts` l.272), or it becomes a new
  step and Redo is lost after every Undo of an access change. D7 does not say so.
- (c) Undo of "+ New squadron" after the first admin read "Given Plan of 150": the squadron row is gone, so both the
  kept line and "Plan of 150 ended" can only print its internal id. Fix: the `acct` part stores the number as written
  (`num`) beside the unit id, as `Notice.name` keeps an input's name.

**10. Words on screen not in §9's list (D2, D3).**
- D2 (b) in the member view: "You can't open 149's Tracker any more. Sign out and in…" is untrue for a master admin or
  Plan holder who only tapped to the member view (D2253: a tap puts him back). It needs its own line, e.g. "This is
  149's Tracker. Leave the member view to open it."
- D2's pick-time question reuses sign-out's, whose words are "Save them before logging out?" (`tracker/app/core.js`
  l.93). A pick needs its own sentence, drawn.
- D2 (a) gives only "Pick 149 to change it"; Saber with 150 picked is never told how to reach 150's Tracker. Round 2's
  second sentence (sign out and in) was dropped.
- D3's toast "1 waiting for access to 149" is new words and not on §9's page.

**11. D11's writer runs only at the first load on or after that day.**
- Case: Hunter is signed in across midnight on his move day. His Plan of 149 ends and R6 re-enters his home, but no line
  is written until some later reload (D2251).
- Fix: run the writer wherever the foreign posting pass runs on a new day (the midnight wake, `sync.ts` l.3044–3046), as
  well as at boot.

**12. D13 leaves the empty set unsaid.**
- Case: a place nobody sits on today or later (every squadron moved away, or a move onto it re-pointed before its day).
  "An admin of every one" over no squadrons is true for any admin; today's check (`perms.ts` l.2616–2617, `some`) lets
  only a master admin.
- Fix: say it: an empty set is a master admin's alone. Test: Hunter refused, Saber allowed.

Not a finding today, noted for the database step: D1's removal writes lines that belong to another person's step
(Kestrel's holiday made Hunter's line). With remote changes Kestrel's Undo of that holiday would be refused naming
Saber — the fault `state/noticeseen.ts`'s header names for seen marks. Finding 2's read rule narrows what must be
removed, but does not end this.

## One line per decision

- **D1** — does not hold as written: findings 1, 2, 3, 4, 6.
- **D2** — holds with finding 10.
- **D3** — holds with finding 10 (the toast).
- **D4** — holds with finding 8.
- **D5** — holds.
- **D6** — holds with findings 1 and 5.
- **D7** — holds with finding 9 (and finding 2's follow-up removal).
- **D8** — holds.
- **D9** — holds.
- **D10** — holds with finding 7.
- **D11** — holds with finding 11.
- **D12** — holds.
- **D13** — holds with finding 12.
- **D14** — holds.
