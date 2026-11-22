# Fable's blind read of the reshape's core rights change (Piece B with Piece C) — the report, 21 Nov 26

His D2244 ("Fable reads the core's rights change blind before any helper builds on it"). Read on an exported copy of
`6c0908481` (the code with no records); the brief: `2026-11-21-msq-reshape-fable-read-brief.md` beside this file. The
report below is Fable's final reply, word for word. Each claim is reproduced red in the checkout before it counts — the
evidence sheet `docs/handpass/2026-11-21-msq-reshape.md` carries what was reproduced and fixed.

---

FABLE-READ-BC

Blind read of Piece B with Piece C, in the export copy only. Four findings, each with a test I ran red on the code as given. I then applied each fix inside the export, saw the proof go green (and `lastadmin`, `reshape-piece-c-doors`, `reshape-r3-undo-move`, `reshape-r5-first-admin-moving`, `piece-b-tables` stay green), and put the code back as it was. The four proof files are left in `raptor-port/src/state/` and are red against the reviewed code.

I found no case of a right holding when it should not. The reading rule, the re-link drop, Plan's master-only rule and the restore's re-dating all held under test.

---

## 1. The first admin's move into his new squadron can never be taken back or undone — HIGH

**The case.** Wed 15 Jul. Saber makes 150 with Hunter as first admin (his Plan). Saber saves Hunter's move into 150 (counts from Thu 16 Jul), then sees it was a mistake.
- Taking it back the same minute (moving Hunter to 142) is refused: "Hunter is 150's last admin. Make another admin of 150 first."
- Undo, the same minute, says "That couldn’t be completed just now."

Both would leave exactly the world that stood before the move: Hunter at home in 142, his Plan of 150 holding every day, which the lock accepted. There is no way round by rights: once a date has a home admin "before", a second Plan holder does not count, so only moving another admin's home into 150 frees it. Rulings: D148 (Undo steps back his own change), D2119 (the move has not begun), and the brief's item 4 (a false refusal on a Plan-only squadron).

**Cause.** `state/lastadmin.ts`, `lastAdminBreach`. On 16 Jul the rows before have Hunter at home in 150, so the home rule applies and the after-world must have a home admin. Hunter still counting there by his Plan (which never ends once the move is gone) is not looked at, because the Plan line runs only when `!homeB.length`.

**Fix.** In `lastAdminBreach`, directly after
`if (!homeB.length && ableA.some(x => plan(x, u.id, d, w.rowsA))) continue`
add:
`if (homeB.length && homeB.some(x => ableA.some(y => y.id === x.id && plan(y, u.id, d, w.rowsA)))) continue`
with a comment that a home admin of that date who still counts there by his own Plan after the step is a move in, not yet begun, taken back or undone.

This is narrow: the same account can be at home before and a Plan holder after on one date only when a move in that has not begun is removed. A retarget to a third squadron still ends the Plan on that date and is still refused (my control). "Once at home, a Plan holder alone does not keep it" in `lastadmin.test.ts` stays green.

**Proof.** `src/state/fable-first-admin-takeback.test.ts`
- `AssertionError: the take-back: expected { ok: false, …(1) } to match object { ok: true }`
- `AssertionError: {"ok":false,"reason":"That couldn’t be completed just now."}: expected false to be true`

---

## 2. Making a squadron's only Plan admin a master admin: the door lets through what the gate refuses — MED

**The case.** 15 Jul. 150 is new, Hunter its only admin (Plan). Saber makes Hunter a master admin. The screen says "That did not save" (the B3 shape). The one rule never counts a master admin as a Plan holder, so the gate reads the step as leaving 150 with no admin. Every other door says "Hunter is 150's last admin. Make another admin of 150 first." for this same lock; the master mark's door never asks.

**Cause.** `state/accounts.ts`, `setMaster`: no call to the lock before the commit. The gate's `lastAdminViolation` runs for every account change.

**Fix.** In `setMaster`, after the line `if (!list.some(x => x.master)) return { ok: false, message: 'At least one master admin must be left' }`, add:
```
const locked = lockProblem(list)
if (locked) return { ok: false, message: locked }
```
(Whether a master admin should count for a Plan-only squadron is the plan's own reading, Opus L1; I left the rule alone and fixed only the door.)

**Proof.** `src/state/fable-master-mark-lock.test.ts`
- `AssertionError: {"ok":false,"message":"That did not save"}: expected false to be true`

---

## 3. The squadron doors show the gate's raw reason — MED

**The case.** 15 Jul, six doors, none checking who is pressing:
- Hunter (142's admin) moves his man Ranger to 149 → "member-writes-own: not an admin of u149 (home:h…)"
- Kestrel (149's admin) takes Ranger into 149 → "member-writes-own: not an admin of u142 (home:h…)"
- Hunter takes away a View of 149 that Kestrel gave Ranger → "member-writes-own: not an admin of u149 (grant:g…)"
- Hunter gives himself View of 149 → the same
- Kestrel moves 142's place → the same shape
- Hunter presses "+ New squadron" → "type unit.add not permitted for admin"

The refusals are right (D2191, D2192; a unit is a master admin's). The words are the gate's — the R5 shape that `reshape-r5` forbids for one door only.

**Cause.** `state/units.ts`, `said()`: `message: r.message || 'This change could not be saved.'` hands on whatever the command layer returns. The accounts' doors go through `saidOf` (`roster-add.ts`), which never does.

**Fix.** In `units.ts said()`, change the return to:
`return { ok: r.ok, ...(!r.ok ? { message: (r.reason === 'refused' && r.message) || 'This change could not be saved.' } : {}) }`
- A refusal raised inside a command keeps its own words; everything else says the generic words until these doors are drawn (D1625).
- I searched the test files for a few common raw-reason assertion patterns (`message).toMatch(/not an admin…`, `/only a master…`, `/a home changed…`, `not permitted for`) and found none besides my own; this was a spot check, not the whole suite. The builder should grep the unit tests for any other assertion on a units door's raw message before applying.

**Proof.** `src/state/fable-unit-doors-raw-reason.test.ts` — six red, for example:
- `AssertionError: move out — the gate's own words reached the screen: expected 'member-writes-own: not an admin of u1…' not to match …`
- `AssertionError: + New squadron — the gate's own words reached the screen: expected 'type unit.add not permitted for admin' not to match …`

---

## 4. After a move's day has begun, its Undo jams his whole Undo list — MED

**The case.** 15 Jul: Saber gives Kestrel View of 142 (step 1), then moves Ranger to 149 (step 2). 17 Jul: Saber presses Undo. The move can never be undone now (D2119), and the gate rightly refuses. But every press says "That couldn’t be completed just now." and the step is never passed over, so step 1 and everything older of his is out of reach for good. The same on the move day itself. The plan's own rule for a step that can never pass is "blocked for good", said once, the next press naming the step it takes (§4.3; D148 keeps his history).

This is not on the brief's owed list (that names the re-link's Undo and the guardrail-2 probe). If the host counts it as the Undo job's, move it there.

**Cause.** `undo/timeline.ts`, `refusedFor`: only the "war day not open for bidding" refusal is treated as for good; the gate's "a home changed for a day already begun" / "a squadron's place changed for a day already begun" falls to the try-again words.

**Fix.** In `refusedFor`, before its last line, add:
`if (reason && /changed for a day already begun/.test(reason)) return sayBlocked(entry, dir, OUT_OF_BAND)`
(`OUT_OF_BAND` is the existing "Something else changed this after your action — it can’t be undone now." — no new words.)

**Proof.** `src/state/fable-move-undo-after-midnight.test.ts`
- `AssertionError: never the "just now" words for a step that can never pass: expected 'That couldn’t be completed just now.' not to match /just now/`

---

## One thing for the owner, not a fault

Once a squadron has had an admin at home, a Plan holder never counts for it again. With Ranger as 150's only home admin and Hunter holding Plan of 150, demoting Ranger (and the Undo of his promotion) is refused with "Make another admin of 150 first" — and giving another Plan does not satisfy it. The same reasoning would apply to suspending, moving or posting him; a posting would wait until another admin's home is 150 (I ran only the demote and the Undo). This is the plan's stated reading (§5.3, to be told to him); D2201 says Plan gives "full access as its own admins have". Worth his yes or no before screens are built on it.

## Checked and found sound

- **A move ends rights on its day.** Ranger's View of 150 reads on 15 Jul, nothing from 16 Jul. A View of the squadron he joins becomes "member" there. Nothing of 142 follows him. After a move back, both stay ended, and a right given again on the move day is a new row with the old one left ended.
- **Take-back and Undo of an ordinary move the same day.** Rights hold again.
- **Rights given, undone, redone on the day a move is saved.** Pass, and end at midnight.
- **Restores after a move.** The Undo of a lowering on 17 Jul, after his move of 16 Jul, puts the Plan back with its recorded day and it holds nothing; the Redo likewise. No restore I ran put back a right that holds after a move.
- **Plan is a master admin's.** Hunter giving Plan is refused in the approved words. Kestrel re-linking a sign-in that holds Plan gets "Only a master admin…"; one holding a View of 142 gets D2241's words. Kestrel demoting a Plan holder gets the generic words (owed, c). Hunter cannot touch a 149 man's sign-in.
- **Re-link.** Kestrel re-linking a sign-in holding only ended rows passes and drops them all; its Undo fails closed (owed, a).
- **Plan-only squadron, honest steps.** Moving a member in, a second Plan given and taken, the Plan holder promoting the member at home, then the first Plan removed — all pass. The first admin's move in passes. A retarget that would end his Plan is refused in the lock's words.
- **A member cannot give rights or move anyone.**
- **Dates, read in the code and not run.** `datedRowsBreach` judges today and every row date of both images, so a removed row, a same-date row and a first row reaching back are all seen. The lock's dates cover every day a right can end.
- **Every non-test reader of grant rows** (grep): each either asks "holds on a day" or only names the account, as the plan lists.
