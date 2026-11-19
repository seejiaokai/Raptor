# Fix read 10 — the security reader's read (D1411; a fresh blind Opus; 20 Nov 26, chat 118; copy at `064079abf`, code = `945c6de69` + `0613720a7`)

Proofs: `fr10-security/raptor-port/src/zz-sec10/sec10.test.ts` (chat 118's scratch), on fix read 9's harness; run with TMP
inside the copy: 6 failed, 1 passed (the control). Nothing under `src` changed. No handoff block was pasted.

## SEC10-1 (high; older, fault D did not close SEC9-2): an admin calls a war line's writer from inside his own input command
- Who: any squadron admin (Outlaw, 142).
- Input: Hunter's move to 149 saved from 16 Jul; 15 Jul 10:00 Outlaw signed in runs
  `writeInputsBatch(() => noticeWar(['prowler'], 'casper', {k:'lw', code:'LL', d:'refused', a:'2026-07-25', b:'2026-07-25'}))`.
- Result `{ saved: true, shownOn17: true }` — a made-up "Your leave · LL refused" line saved to Hunter; about him, so under
  D2222 it follows him to his 149 bell for good (proof line 75). `noticePosting(['…','prowler'], 'dj', 'overseas', …)` from
  the same kind of command saves too (line 81): a made-up posting line on his own men's bells.
- Cause: `warMade` records whatever the three writers (`noticeWar`, `noticePosting`, `noticePostingBack`) mint; each is
  exported and writes whatever `to`, part and `who` it is given. Fault D's check asks who minted the line, never whether
  this command made a war change the line reports. Only the line's name is now fixed ("Your leave"); its code, decision
  and dates are still the caller's.
- Limit: another squadron's man stays protected (the owner check refuses a war line to a man the admin does not own).
- Fix: (1) in `leavewar/sync.ts` a pure `warLinesOwed(changes)` working out from a command's own changes which war lines
  are owed (the decision line for a changed leave cell, the bidding line for a war opened or closed, the posting line for
  a posting record changed), used as `followUpsFor` serves restores; (2) the war commands call the three writers only for
  what it returns; (3) installed into `perms.ts` by a hook, as `setLwRestoreCheck` is; (4) in `adminOwnerViolation`'s
  fault D check replace `warMade(env)?.has(id)` by a match against `warLinesOwed(env.changes)` on `to`, `what[0]` and
  `day`, keeping the verified-replay exception; (5) optionally keep `warMade` as a second condition; (6) lines 75 and 81
  as red tests.

## SEC10-2 (high; older root cause, gets round fault E): a bare drop from memory, then a "new" record with the same id, overwrites another squadron's stored record
- Who: any admin, through a write typed outside every command (the console — the road earlier rounds treat as in scope).
- How: the next input command's resync (`resyncBeforeEnlist`, before it `resyncSchedBaseline`) takes the bare write in as
  the starting point; the command's put then has no before-image, yet `persist.ts rowOf` writes the row by id, so the
  stored record is overwritten.
- (a) Holiday line rewritten (fault E's case 6, proof line 102): Saber's real holiday line on Kestrel's bell (149);
  Outlaw `NOTICES.splice`s it from memory, then `writeInputsBatch(() => NOTICES.push({...real, name:'149: OIL cancelled,
  ignore', by:'kes9', what:[oilhol 10 Aug]}))` — `ok:true`, a put of the same id with `before:null`; Kestrel's stored line
  rewritten in Outlaw's words, signed as Kestrel. The ordinary rewrite is refused (the in-test control).
- (b) Any bell line taken away (line 117): the same drop, then a put of that id re-addressed to Outlaw (`to:'casper'`,
  `what:[{k:'del'}]`) — committed; Kestrel's line gone from storage.
- (c) Another squadron's man's leave request replaced (line 155; the worst): Kestrel files LL for Osprey (`osp9`, iid
  `ipd-sec10`); Outlaw drops it from memory, then files a Training for Ranger with the same iid — committed as a put of
  `ipd-sec10` with `before:null`; Osprey's request overwritten in storage.
- Members cannot: the same road is refused for a member (control ~line 120 passes).
- Cause: every gate check that tells a new record from a rewrite reads `c.before` (E's `c.before == null`,
  `lineRewritten`, the inputs gate, the owner check's before-image); the resync before enlisting builds it from memory
  after a bare write, not from what is stored. Older than fix read 9 (`commitInputsWith` had it; W kept it); fault B
  puts the same resync at four more doors (Delete, the posting pass, Undo post out / Restore, take-back); E's new rule
  depends on that before-image, so it does not hold.
- Fix: (1) `resyncBeforeEnlist` stops taking the bare write in: put memory back to the baseline image before enlisting,
  so a bare write is thrown away as a reload would; the command is still not refused (W's aim) and its before-image is
  the saved state. (2) Backstop in `perms.ts`: refuse a put with `before == null` on `inputs` or `notices` whose id
  already has a stored row (`wb.get(collection, id) != null`) — "a record already written". (3) Lines 102, 117, 155 as
  red tests; re-run B's and W's tests.

## SEC10-3 (low; older, fix read 8's H): a new holiday-shaped line skips every check — any addressee, any maker
- Who: any admin. Input: Outlaw puts `{to:'us9', by:'kes9', iid:'', what:[{k:'oilhol',…}], name:'149 stand-down'}` — a
  149 member (not a scheduler) addressed, Kestrel as maker. Result `allowed` (line 163).
- Cause: the new-line skip `continue`s before the maker check (SEC6-A) and the owner check; D2206 sends a holiday line to
  the schedulers at the place. Limit: it shows only while a real holiday covers those days.
- Fix: the skip only when signed by the actor (`String(n.by) === self`) and `to` is an admin or scheduler at the
  holiday's place (the set `toFor(h)` in `sync.ts`); anything else through the ordinary checks; line 163 red.

## Introduced by fix read 9? None is new code: SEC10-1 is fault D left incomplete; SEC10-2 an older root cause that
defeats E, reached through B's wider doors.

## Checked and found closed
- C (choice 5): a grant re-pointed and back, or removed and given again, in one command shows only its net change; same
  account, unit, level keep their day, else today; SEC9-1's re-point refused end to end.
- A (choice 2): `restoreRedated` keeps only the day the right holds now (`store.get`), never an earlier recorded day; the
  replay exemption only where unchanged; no back-dating by Undo or Redo; a Redo dated the day pressed loses no line an
  honest grant should keep.
- Grants and the mark have no bare-write road: the settings store writes straight to storage; the people store's
  starting point resyncs only at boot or a reset.
- D (choice 4): `WAR_MADE`, `PASS_MADE` are WeakMaps keyed by the running envelope, no exported writer; a failed
  command's entries die with it; nothing carries across commands. The hole is SEC10-1, not a leak.
- E (choice 6): a replay deletes another squadron's holiday line only as the timeline's verified image of the actor's
  own step; the same-id overwrite is SEC10-2.
- F (choice 1): `lineNotNow` refuses a new line dated more than a few minutes ahead; nothing can be planted inside F's
  one-day window, so the filer exception can neither hide nor keep a planted line.
- Members refused every war-kind put; the bare-drop road refused for a member. Another squadron's man: a `noticeWar`
  line to him refused by the owner check (from the code). Every bell reader goes through `noticeLive` /
  `noticeLeftBell`.
