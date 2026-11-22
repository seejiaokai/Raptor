# Fix read 6 — the fresh, blind Opus reader's report (19 Nov 26, chat 114; copy at 63620a9e7)

Saved whole as handed back; not yet reproduced by the host.

Worked only in the exported copy. No handoff block pasted. Opened none of the forbidden files. Proof file `src/leavewar/zz-fr6-opus-proof.test.ts` (harness of `multi-sqn-fixread4-bells.test.ts`), run red as below, then deleted.

Baseline green, one at a time: fixread4-bells (20), fixread3-retract-moved (16), fixread5-admin-placer (6), inputs-readers (7), units-sqn-fixread2 (34), m4bell (24), fixread3-undo-moved (3), job2-bell (10), job2-retract (3), job2-warbell (3), postout-notice (27), perms (102), m4sec (14), undo-wire (52).

## Findings, by consequence

### F1 (high) — D2223 not met for an input naming nobody (ALL AVAIL): a moved filer is still told, the gate lets the crossing line through, and his old lines never leave his bell
- Cause: `state/notices.ts filerTold` — `if (named.has(f) || !named.size) return true`. An ALL AVAIL input HAS a squadron: the gate's 7c (`perms.ts inputUnitViolation unitsOf`) gives it its filer's (or the placeholder's placer's) squadron on the input's own date. `filerTold` ignores that, and its `true` reaches the pass, `toldBy` and `noticeAboutHim` alike.
- Proofs (all red): P1 (writer) — Hunter (142 admin) files a Meeting for ALL AVAIL on 15 Jul; his move to 149 from 16 Jul saved; 17 Jul Saber changes the remark → Hunter (149's) gets the line (expected 0, got 1). P1b (gate) — 142's plain admin Outlaw forges the input change plus a line to Hunter → expected refused "bell line of another squadron", got allowed. P1c (read rule) — Saber's change on 15 Jul tells Hunter; after the move (17 Jul) the line is still on his bell, expected gone.
- Introduced? No — fault 2's fix left this case open on purpose ("no man whose squadron to ask"), but 7c names one.
- Fix: (1) in `filerTold`, when `named` is empty, derive each image's squadron as 7c does: `ph = placeholderOf(r)`, `owner = ph?.by || r.by`, `u = homeOn(String(owner), inputAtIso(r.date, r.yr) || todayIso())`; (2) true only if `u` is null, or `u === homeOn(f)`, or `levelOfAccount(accountOfPid(f), u) === 'admin'`, else false; (3) better: export ONE helper for "the input's squadron" and have 7c's `unitsOf` call it too; (4) tests P1, P1b, P1c green, plus controls: Hunter never moved still told; a master filer still told.

### F2 (high, introduced by fa256aaf2) — a line D2218 retired comes back, unread, when its input is deleted
- Cause: `noticeAboutHim` returns `!r || filerTold(...)` — an input no longer stored counts as "about him". So a filer-only line retires on his move day while the input exists; once 142 deletes the input, `noticeLeftBell` says no and the line is back in `noticeLive`, the unread count and "mark all read".
- Proof P2 (red): Hunter files LL for Ranger; Saber's change on 15 Jul tells Hunter; Hunter moves to 149 from 16 Jul; 17 Jul the line is off his bell (right); Saber deletes the input — Hunter rightly not told of the delete, but his unread count goes 0 → 1 and the old line is on his 149 bell again (an Undo of the delete takes it off again: it flickers).
- Fix: record on the notice whether its reader was told only as the filer. (1) In `noticePass`, mark a line sent to someone only as the filer (not in `ids(b)` or `ids(a)`), e.g. `f: true` (`toldBy` unchanged); (2) in `noticeAboutHim`, for an `iid` line: unmarked = about him; marked = about him only while the input is stored AND `filerTold` holds — a deleted input = not about him; (3) stored lines carry no mark — D56; (4) test P2 green, plus a control: a named man's line on a deleted input stays.

### F3 (medium, introduced by fa256aaf2) — a retired filer line comes back when he moves back (war and posting lines do not)
- Cause: `filerTold` reads today's homes. Hunter 142 → 149 (16 Jul) → 142 (17 Jul): on 17 Jul he is in Ranger's squadron again, `noticeAboutHim` true, `noticeLeftBell` keeps the line. `noticeLeftBell`'s own rule says a line leaves "for good … even should he move back", and fault 3's fix enforces it for war and posting lines; input lines now do the opposite.
- Proof P3 (red): off his bell on 16 Jul, back on 17 Jul (expected false, got true).
- Fix: (1) give `filerTold` an optional date (`homeOn(f, iso)`, `homeOn(m, iso)`, `levelOfAccount(acct, u, iso)`); (2) in `noticeLeftBell`, for a filer-marked line (F2's mark), ask `filerTold` on the first move day after the line was written — not told then = left for good; (3) named lines stay about him (D2223); (4) test P3 green, plus a control: his own named line survives the same round trip.

### F4 (low — a reading to put to him, not a fault) — the filer never moved, the named man did
- Proof P4 (red against the "never moved" reading): Hunter (142, never moved) files LL for Ranger on 15 Jul, a 142 day; Ranger moves to 149 from 16 Jul; 17 Jul Saber changes it → Hunter not told. `filerTold` uses Ranger's home of today, while 7c makes that leave 142's business by its date.
- D2223's literal words ("only while he is still that man's admin") support the code; D2194 and 7c support telling him; the commit's own reading ("the ruling speaks of 'after a move'", the filer's move) is contradicted here.
- If he wants Hunter told: in `filerTold`, read each named man's home on the input's dates, as 7c's `daysOf` does, not today's.

## Explicit negatives (checked, sound)
- One body for every bell place: the list (`noticesFor`), unread count, "mark all read", a tap — all through `noticeLive` → `noticeLeftBell`; Undo's leave-out list uses `noticeLeftBell`; the posting take-back (`postingLinesOf`, `retractPostingLines`) and `warNoticesReversed` ask it; nothing that stores goes through them.
- `followUpOf` is narrow: needs `origin: 'restore'`, the line written by the admin himself, and the timeline's verified replay (answers only while the timeline applies this admin's own entry — a forged restore gets null); one `lwback` / `lw again` part whose `ref` names a notice in this same envelope that the replay verified, a deleted (Undo) or put-back (Redo) line, kind `lw`, same addressee, about him; bidding opened/closed excluded; the fixes' three forgeries refused. Its content (`c`, `a`, `b`, `d`) not checked — inside a real restore only app code writes it, not a finding.
- The restore put branch is limited to lines about the addressee, verified image for image; squadron-business lines still left out by the leave-out list.
- Fault 1 against D2222: Undo, Redo, Undo, read and unread, approved and refused as ruled; the no-move control unchanged.
- Fault 3: away and back, two round trips, read and unread — posting and war lines neither deleted nor told; the control (Saber, never moved) still told "taken back".
- D2215 and the posting pass: job2-retract, postout-notice, fixread3-retract-moved green.
- D2223 for a master: a master filer still told; Plan counts through `levelOfAccount`; `units-sqn-fixread2`'s change pins the refusal correctly.
- Movers: a line written on the move day itself is never retired (`from > wrote`), and the pass does not tell him that day; a member filer who never moved still told.
- FR5-SEC-1's extension sound: a placer stamp across the move refused, rewritten and forged; a plain leave allowed.
- Walk F4 consistent — read records load at start-up only, out of scope.
- The inputs-readers entry for `notices.ts` correct (reads only); green.
- Undo (D148), other squadrons' admins and a member's normal work: the suites above green; no regression found.
