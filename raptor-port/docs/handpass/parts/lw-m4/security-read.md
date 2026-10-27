# M4's security read (D1411) — a fresh Opus reader, read-only, on commit 21f578261 (27 Oct 26)

Kept whole as the reader handed it back (its scratch tests: the session scratchpad `sec/m4.sec.test.ts`, not in the
repo — the next chat writes its own red tests from the cases below). **Disposition: none fixed yet** — see the evidence
sheet `docs/handpass/2026-10-27-lw-m4.md` §Security read for the plan.

## 1. HIGH — the new stamp checks skip any change that only claims to be an Undo
`state/perms.ts ownershipViolation`: the war-row case calls `stampForged` only when `env.origin !== 'restore'`; the
inputs case has the same bare test for the new `lwBy`/`lwAt` check. Nothing asks the timeline whether the restore is real
(the module's own header: "A command that merely calls itself `undo.restore` gains nothing"; the neighbours use
`REPLAY` → `verifiedReplay`, `LW_RESTORE` → `verifiedWarRestore`).
Failure (member `bane`, both accepted):
```ts
ownershipViolation({ type:'undo.restore', origin:'restore', actor:{role:'member',personId:'bane'}, changes:[
  { collection:'lw.cell', id:`${periodId}:bane:2026-02-10`, op:'put', before:[],
    after:[{ id:'q9', kind:'request', code:'LL', state:'refused', placedBy:'stiff', placedAt:5, decidedBy:'stiff', decidedAt:6 }] }]})
ownershipViolation({ type:'undo.restore', origin:'restore', actor:{role:'member',personId:'bane'}, changes:[
  { collection:'inputs', id:'x1', op:'put', before:null,
    after:{ iid:'x1', person:'bane', type:'LL', date:'Feb 10', yr:2026, allday:true, by:'bane', at:Date.now(), lw:true, lwBy:'stiff', lwAt:5 } }]})
```
Fix: inputs case — replace `env.origin !== 'restore'` with `!(replayed && replayed(c))`; war-row case — in
`undo/timeline.ts verifiedReplay` also collect `lw.cell` changes and accept both collections; in `perms.ts` work out
`replayed` for war rows too and skip `stampForged` only when `replayed(c)`.

## 2. MEDIUM — a member's new bid can carry no stamp, or a borrowed one (jumps the Approvals queue, dodges "New")
`stampForged` checks a request only if `placedBy`/`placedAt` are present, and vouches a stamp by ANY request
before-image of the command (a set of `by|at`), not by the record it came from. Accepted: a new bid with no stamp; a new
bid carrying his admin-placed Tuesday bid's stamp (that bid included unchanged); a new bid with his own name and his
oldest bid's time. Approvals sorts oldest first (an unstamped line first) and "New" is `placedAt > prev`.
Fix — vouch by record: same id in a before-image of this command (a move) → exactly that record's stamps (absent only if
absent before); else, where this cell's before-image holds requests it replaces (a re-type) → the earliest of those;
else new → both stamps, `placedBy === pid`, `placedAt` within the window. Keep the id-keyed `decidedBy` check.

## 3. MEDIUM-LOW — "approved by the war" (`lw`, `lwMoved`) on an input is not guarded, and M4 trusts it
A member can file his own leave with `lw: true`; neither `inputBreach` nor the `lwBy` check looks at `lw`/`lwMoved`
(older than M4). M4 trusts it: `alsoSince` skips `row.lw`; Approvals' `warLeaveOn` and `decisionTells` treat it as
war-approved leave. Fix: refuse a member's put whose `lw`/`lwMoved` differs from the same record's before-image; a new
record may carry them only as a piece of a record this command changed (match by record and person).

## 4. LOW-MEDIUM — a member can put a forged "Your leave · LL refused" line in another man's bell
The notices case accepts any notice by a member addressed to someone else that rides an input the same command
changes; it never checks what it says. Accepted: `inputs.write` by bane with his own new input `x4` and a notice
`{id:'n1', to:'ammo', by:'bane', iid:'x4', name:'Your leave', what:[{k:'lw', c:'LL', a:D, b:D, d:'refused'}]}`. And
`cmdAuthorize('lw.notice', member)` returns true (the member's Notice cell holds "C"; only `iid: ''` stops it today).
Fix: for a member refuse any notice whose parts include a war line kind; refuse `env.type === 'lw.notice'` for a member.
(The older gap — a member's notice text never compared with what his change did — worth filing.)

## Lower, noted
- The 5-minute window allows future times (a member may date a bid up to 5 min ahead). At the database step the
  server must set the placed time itself, or a device whose clock is off can never place a bid.
- One admin can write another admin's Approvals marker (`lw.apprseen` own-row is the command's stated owner only; the
  invariant passes every admin change) — the same pattern as the existing `reqseen:` row.
- Outside this diff: the war-row case never checks the record KIND — on an open day of his own row a member's change
  carrying `{kind:'credit', code:'FO', oil:'auto'}` is accepted; `dayview.ts earnsOil` adds such credits up; whether the
  schedule's credit pass rewrites a forged one was not confirmed.

## Checked and clean
1. Who can write a notice: `decisionTells` skips the actor's own row; `noticeWar` skips `by`; a member's war change
   touches only his own row; `tellBidding` only on `lw.open` (admin-only); `warNoticesReversed` — a member's own steps
   carry no war lines, and `iid: ''` would be refused.
2. NoticeSeen: only the admin's READ is widened; writes still `notices.seen`, own row.
3. LeaveApprovalsSeen: a member's permission is empty; the invariant refuses a member's `apprseen:` row.
4. `decideRequests`: `canDecide` in the store; `lw.decide` admin-only at the gate; an admin in member view (D292) is
   refused `lw.decide` and `lw.apprseen`.
5. A member's legitimate changes pass (move, re-type, delete on a closed day, a medical cutting his war-approved leave,
   a real Undo) — and keep passing under fixes 1 and 2.
6. "Add to the LL" (`replacedCarry`): requires the leave to hold that man; saves through `setLeaveRemarks`; a member
   changes only his own leave; the documents are his own replaced bid's.
7. `alsoSince` only reads on the admin's page; the viewer's read-only flag hides "Edit input" and "Upchit"; reading
   documents is allowed (D211, D1008).
8. The replaced-bid registry is keyed by the command's own envelope (a WeakMap), read per input and per person.
