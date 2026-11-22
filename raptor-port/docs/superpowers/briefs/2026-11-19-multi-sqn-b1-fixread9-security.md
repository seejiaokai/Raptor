# Fix read 9 — the security reader's report (blind, D1411; 19 Nov 26, chat 118; copy at `fc0e95ecf`, code = `ae1af3806`)

Saved whole as handed back; not yet reproduced by the host. The reader's proof file is kept at chat 118's scratch
`fr9-security/zz-sec9/zz-sec9-proof.test.ts.txt` (run from `raptor-port/src/leavewar/`).

---

# Fix read 9: the security reader's report (D1411)

**Setup.** I worked from the copy at fc0e95ecf, whose code is ae1af3806. No handoff block was pasted, so there was none to ignore. I read the brief, AGENTS.md, FIXES-LOG, FIXES.patch, the fix read 7 and 8 security reports, and the code.

**Proofs.** I put them in a temporary file, `src/leavewar/zz-sec9-proof.test.ts`, built on the harness of `multi-sqn-fixread8.test.ts`. The final run gave "5 failed | 1 passed". I then deleted the file from `src`. A copy is kept at `fr9-security/zz-sec9/zz-sec9-proof.test.ts.txt`. `src` is unchanged and `node_modules` was not touched.

I found three holes, worst first.

## SEC9-1 (medium; fault G's check is incomplete): a grant re-pointed to another man keeps its old day, and the line his move retired comes back

**Input.**
- On 15 Jul Hunter's filer line is marked `fu ['u142']`.
- Also on 15 Jul, Saber honestly gives Kestrel Plan of 142, so the grant carries `from '2026-07-15'`.
- Hunter moves to 149 from 16 Jul.
- On 18 Jul Outlaw, now a real 142 admin and signed in, saves this one change through a real settings command (`commitSettingsIntent('grant.set', …)`): the same grant row, with `account` set to `acad2` (Hunter) and everything else unchanged, including `from: '2026-07-15'`.

**Result.**
- At the gate: `expected 'allowed' to match /not dated today/`.
- End to end: `{ ok: true, from: '2026-07-15', back: true }`. The command commits, Hunter now holds Plan of 142 "from 15 Jul", and his retired 142 line is back on his 149 bell, read or unread.

**Why it matters.** This is a state the honest app can never produce. `setGrant` refuses a grant in a man's own home squadron, so a 142 man cannot hold Plan of 142 dated before his move. A fresh grant is dated today and correctly leaves the line off. The re-point undoes fault G and fault P (his D2218, D2223): the old squadron again chooses what follows him.

**Cause.**
- In `perms.ts` `unitRowViolation`: `const want = b != null && b.level === n.level ? b.from : today`.
- A put that keeps the level keeps the old day even when `account` or `unit` changes. The WHO check only asks that the actor is an admin of the unit, which Outlaw is.
- Introduced by 71c7d3095 (fault G).

**Fix.**
1. In `unitRowViolation`, keep the old day only when the grant is the same right: `const same = b != null && b.account === n.account && b.unit === n.unit && b.level === n.level; const want = same ? b.from : today`.
2. Do the same for the master mark in `accountShapeAndMasterViolation`. Keep `was.masterFrom` only when `was.pid === is.pid`; otherwise want `today`. This is masters only, so it is low.
3. Add red tests: SEC9-1 at the gate and end to end (in the proof file).

## SEC9-2 (medium; older, not introduced by these commits): an admin can put a war line in his own words on his own man's bell, and it follows the man to his new squadron

**Input.**
- Hunter's move to 149 is saved from 16 Jul.
- At 10:00 on 15 Jul, Outlaw (a 142 admin, signed in) saves an ordinary input command (`writeInputsBatch`) that pushes `{to:'prowler', by:'casper', iid:'', name:'149: report to Kestrel 0600 Sat', what:[{k:'lw', code:'LL', d:'refused'}]}`.

**Result.**
- `gate: allowed`.
- End to end: `{ saved: true, shownOn17: true }`. On 17 Jul the line is on Hunter's 149 bell, unread, for good. `noticeAboutHim` reads any `k:'lw'` line as being about him, so D2222 keeps it with him.
- The same holds for a `po` line naming him, and for any line whose `what` is an `lwback` (not open/close).

**Cause.**
- In `adminOwnerViolation`, a line with no input falls to the own-man fallback.
- `inputLineUnlike` returns false when there is no `iid`, so fault M's "only as the pass writes it" never covers war lines.
- Nothing asks that a war line ride a Leave War command, or that it was written by `noticeWar`, `noticePosting` or `noticePostingBack`. data-model §11 says only those write war lines.
- The member section already refuses war lines.

**Fix.**
1. Record the ids that `noticeWar`, `noticePosting` and `noticePostingBack` mint in the running command. Use the same envelope-keyed WeakMap as `notePassMade`, for example `noteWarMade(env, id)`, written only by those three.
2. In `adminOwnerViolation`, before the own-man fallback: refuse a put of a line whose parts include `WAR_LINE_KINDS` (other than the `noticeHoliday` shape) when it is not a verified replay, not passed by `followUpOf`, and its id is not in that registry.
3. Add red tests: SEC9-2 at the gate and end to end, plus a control that a real `lw.decide` line still passes.

## SEC9-3 (low to medium; older, kept by fault H): a 142 admin can delete or rewrite a holiday line on another squadron's man's bell

**Input.** A line shaped exactly as `noticeHoliday` writes it, to Kestrel (149): `{to:'kes9', iid:'', what:[{k:'oilhol', …}]}`. Outlaw (142) sends `{op:'delete', before: that line}`.

**Result.**
- `holiday: 'allowed'`.
- The control, deleting an ordinary 149 line, is refused with "a bell line of another squadron's man".
- A put whose before-image is that line, changing `what`, `name` or `by`, passes too. `lineRewritten` guards only `to`, `iid`, `at` and `fu`.
- Kestrel loses the line asking him for an OIL answer for the holiday (D780, "never silent"). No app writer deletes holiday lines.

**Cause.** `if (holidayLine(n) && !n.iid && n.fu === undefined) continue` is applied to both images of every change, deletes and rewrites included.

**Fix.**
1. Apply the skip only to a new line (`c.op === 'put' && c.before == null && n === c.after`), or to a verified replay of the actor's own step (`replayed(c)`). That keeps the holiday-maker's Undo.
2. Every other delete or rewrite of a holiday line goes through `ownsHim`.
3. Add red test SEC9-3.

## Doors checked and found closed (explicit negatives)

- **W, `isEnlisted` (choice 7).**
  - `schedStore.capture()` sets the image at the whole-world guard's capture.
  - For a root command or an un-enlisted child, the resync and the rebased image agree with the enlisted before-side, both live, so nothing absorbed is told.
  - For an enlisted child or a nested child, a bare write rides the envelope (the lagging before-side) and is judged under 7c as the actor's change, so it fails closed.
  - A rebase after a pass has told is refused (`made.size`). A failed command's `TOLD` and `PASS_MADE` die with its envelope.
  - A bare write only ever comes from the same session's console, so nobody else's write is told in a man's name.
  - Re-tried SEC8-4: a line altered after minting is still not saved, because `applyEnd` snapshots right after `tellPass`.
- **Registry (choice 1).** It is written only by `tellPass`, keyed on the live envelope, and now also needs `changed.has(iid)`. It cannot be filled across commands.
- **Replays (choice 8).**
  - `verifiedReplay` vouches only for the image the timeline itself computed for the same actor's step; a forged `undo.restore` gets nothing.
  - I tried planting a back-dated mark by Undo: master mark on, then off on 15 Jul, move on 16 Jul, Undo on 18 Jul. The Undo was refused in the harness and the line stayed off.
  - Planting a back-dated grant by Undo is impossible for a home squadron (`setGrant` refuses it).
- **N and T.** A new line dated later than today, or more than 5 minutes off, is refused at both sections. A written line keeps its `at` (`lineRewritten`). A slightly past line only retires sooner.
- **R and Q (choices 5 and 6).**
  - `filedDay` takes the earliest `at` over the images, so a command cannot raise it on a change. A member cannot change `at` (`inputBreach`).
  - An admin who rewrites `at` into the future can keep a moved filer told only where the input touches his new squadron; changing such an input needs admin of both squadrons (7c), so no plain admin can.
  - Choice 6 can only under-tell.
- **H.** A holiday-shaped line with an `iid` or a mark now goes through every check.
- **U and F.** Same as SEC8; still closed.
- **Every bell surface.** The list, the unread count, "mark all read", a tap and the undo `leaveOut` all read `noticeLive`, and so `noticeLeftBell`.

Ranking: SEC9-1 (introduced, and the D2218 harm it was meant to stop) above SEC9-2 (older, any words, permanent) above SEC9-3 (older, low to medium).
