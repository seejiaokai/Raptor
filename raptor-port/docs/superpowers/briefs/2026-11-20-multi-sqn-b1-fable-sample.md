# Fable's sample review of multi-squadron batch 1 (D2234) — Fable's report (blind; copy at `078bc2f7e`)

Reader: Fable, a background helper of chat 123, blind to every other reader and to the builder's report; brief
`2026-11-20-multi-sqn-b1-fable-sample-brief.md`; its own exported copy of `078bc2f7e` with `BATCH.patch` (the batch's own
code in `state/{perms,notices,units}.ts` against `main`); finished whole (about 10½ minutes). The report as returned:

---

Blind read of `state/units.ts`, `state/perms.ts`, `state/notices.ts` (with `units-model.ts` and the callers needed). **Four faults confirmed, each by a test I ran red** — two new (1, 2), two already on the builder's own "remaining pieces" map but still open in this code and not on the brief's known list (3, 4). No fault confirmed in the bell.

All proofs ran in one scratch file, `src/state/zz-proof-a.test.ts` (harness copied from `units-sqn-fixread2.test.ts`, clock at 15 Jul 26): 5 red, 2 controls green. The file and its temp folder are deleted; no file under `src` changed, git untouched.

## Findings, by consequence

### 1. A View or Plan given after a move is saved, but before its day, survives the move (D2203) — new
- **Failing input (red):** as Saber (master): `addUnit('150','p1')`; `setHome('bane','u149')` (Ranger is 149's from 16 Jul); then, still 15 Jul, `setGrant('acus', <150>, 'view', 'bane')` → ok. Clock to 16 Jul, `unitsLoad()`: `homeOn('bane')` is `u149`, and `levelOfAccount(acus, <150>)` is `'view'`; expected `null`.
- **Cause:** `setHome` drops his rights once, when the move is saved, though the move counts from tomorrow. `setGrant` and the gate's grant branch in `unitRowViolation` read his home today only, so a right given in the rest of that day is never cleared. With `level: 'admin'` it is Plan that survives.
- **Needs a third squadron to matter.** With only 142 and 149 the surviving right can only be of his new home, where it lies unused and goes at his next move.
- **Fix:**
  1. `units.ts setGrant`: refuse when `homeOn(accountPid, moveFrom(todayIso())) !== homeOn(accountPid)`, with words such as "He moves squadron tomorrow — give this after the move".
  2. `perms.ts unitRowViolation`, grant branch: refuse a put that is not `grantKept` when `homeBefore(who.pid, moveFrom(today), after) !== homeBefore(who.pid, today, after)`. This holds forged writes and an Undo that puts a right back in that window.
  3. Pin both with tests, plus a control: the same grant on 16 Jul is allowed.

### 2. A move is refused whole when the man holds a right in a squadron the mover is not an admin of (D2203) — new
- **Failing input (red):** as Saber: `addUnit('150','p1')`, `setGrant('acus', <150>, 'view', 'bane')`, `setGrant('acad2','u149','admin','prowler')`. As Hunter (admin of 142, Plan of 149): `setHome('bane','u149')` → `ok: false`. Its message is the gate's raw text: `member-writes-own: not an admin of um… (grant:gm…)`.
- **Control (green):** the same move with no third-squadron right goes through.
- **Cause:** `setHome` drops every right inside the move, and `unitRowViolation` judges each dropped grant by its own squadron. The exemption for a right going with its holder exists only for a person delete (`accountGoesHere && personDeletedHere`). `setHome`'s own comment accepts the refusal, but fix read 11's fault H read D2203 as "whoever moves him".
- **Consequence:** only a master can move such a man, and the admin is shown internal words.
- **Fix:**
  1. In the same WHO block, let a grant removal pass when the same command changes that account's person's home on a later date (the `homeBefore` before/after comparison `homeUnitViolation` already makes) and the actor passes section 8 for that move.
  2. A bare removal stays refused.
  3. Give `setHome` plain words for any refusal left.

### 3. Plan is given by any admin of the squadron, and to a member (D2199, D2201, D2211) — on the builder's map, still open
- **Failing input (red):** as Kestrel (149's plain admin): `setGrant('acad2','u149','admin','prowler')` → ok; expected refused, Plan being a master's alone. As Saber: `setGrant('acus','u149','admin','bane')` (Ranger is a member) → ok; expected refused, Plan being for admins only.
- **Cause:** `setGrant` has no master test, and the gate asks only `adminOf(img.unit)`. `units.test.ts` (lines 213–217) and data-model §11 ("an `admin` grant by its own admins or a master") still pin the old rule.
- **Already noted** as piece P1 in `docs/superpowers/plans/2026-11-19-multi-sqn-b1-rest-files.md`.
- **Fix:**
  1. Gate: a grant whose before or after level is `admin` needs `master`; View stays its squadron's admins'.
  2. Gate and `setGrant`: refuse `admin` for an account whose role is not `admin`.
  3. Correct §11 and the pinned test in the same change.

### 4. A plain admin changes the time zone of the place both squadrons sit on (D2196) — on the builder's map, still open
- **Failing input (red):** as Hunter: `setPlace({ id:'p1', name:'Home base', tz:'Asia/Singapore' })` → ok.
- **Cause:** the gate's place branch passes any admin of a unit at that place today.
- **Already noted** as piece P2 on the same map; §11 marks it "to build".
- **Fix:** in that branch, when more than one unit is at the place today and `tz` differs before and after, require `master`.

## Checked, nothing found
- **Bell, D2218:** traced `noticeLeftBell` by hand for a move day, the day before and after, a move and back, two moves in a week, a move saved then replaced the same day, and a man with no home row. No wrong answer.
- **Bell, D2223 / D2225 / D2228:** `filerVia`, `filerUnits`, `movedSince` and `adminThen` agree with the three rulings in every case I traced (filer never moved, moved member, moved admin with the man, moved away and back).
- **Pass and gate agree:** `toldBy` and `filerMarkOk` use the pass's own functions. I found no honest line the pass writes that the gate refuses, for an admin, a member or a split-out input.
- **Cross-squadron writes:** no path for a plain admin to change another squadron's person, account, home, inputs, unit records, Leave War or Tracker. The actor's own account and master mark are read as they stood before the command.
- **Member rights:** nothing gained through View. A member holding an `admin` grant passes only as a member there, which is finding 3's reach.
- **Undo across a squadron line (D148):** an Undo of an input now on another squadron's day is refused as the change would be. An Undo of a move after its day is refused. A right put back by Undo after a move is dated today, by stated design — not reported.
- **Where a person belongs:** a move on the first or last day of an input's span reads the same at the gate (`daysOf`) and the bell (`homesOver`). The engine's input lists read the first day only, which the code says is for the Transfer batch.
- **Fail-open:** unset probes (war unit, Tracker unit, saved rows) pass open only in test harnesses; replay, follow-up and holiday probes fail closed. A person with no home on a store with seeds off, and an input with no filer, are unjudged — reachable only through stored or seed data (D56), not reported.

## Not built, so not judged
Plan's bell and a master's squadron switches (D2202, D2198), holidays per squadron (D2195), and an input spanning a move being changeable only by a master or the man (filed for Transfer).

## Not covered
- I ran only my own proof file — none of the existing suites.
- I did not drive the bell through real doors; the bell negatives are from reading the code.
- The Leave War's side (`leavewar/sync.ts`) was read only where these three files call it.

Findings 1 and 2 are confirmed faults in the sample's own code; under D2234 that puts the question of the full review to the owner.
