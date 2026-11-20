# The reshape plan's red team, round 2 — the fresh Opus reader's report (blind; copy at `f70594194`)

Reader: a fresh Opus reader (D790), a background helper of chat 125, blind to Astra and Fable; brief
`2026-11-20-multi-sqn-b1-reshape-read2-brief.md`; its own exported copy holding no reader's report; finished whole. Read
only; no tests run. The report as returned:

---

Round 2 red-team read: fresh, blind Opus reader of the multi-squadron batch 1 reshape plan

I read the plan whole (with §16 carefully), the fix read 17 table, the proofs R2–R5 and K1, the rulings D2203, D2221, D2119, D2201, D2194 and D2214, and the code the claims rest on. No handoff block was pasted, so there was none to ignore. I changed no file and ran no proof.

## HIGH

**H1. Piece D, step 3 of A5's chain: the plan's wording would leave another squadron's Delete posting half run, and marked done.**
- **What the plan says:** a foreign Delete runs "through deleteOnForeign / deletePersonOnWar, never the loaded war's applyDelete or forgetPersonFrom".
- **Why that is wrong:** the only `applyDelete` is `state/person-delete.ts applyDelete`, the Raptor half of a delete. It sets the deleted mark, drops the account (`dropAccountOfPid`), cuts his inputs and strips the planning calendar. `runPoOutcomes` calls it at `sync.ts` l.2841. It is not the war's.
- **What goes wrong:** a builder who follows the words runs only the war half for a 149 Delete posting while 142's war is loaded, then writes `poDone`. The man stays on the roster with a live sign-in. Because the mark says done, the pass never runs that posting again. `postingPassViolation` does not refuse a pass that leaves the Raptor half out.
- **Fix:** reword step 3 to: "a Delete runs `person-delete.ts applyDelete` (with B1's strip inside it) and the war half through `deletePersonOnWar` → `deleteOnForeign`; never the loaded war's `forgetPersonFrom`." Add a test: after a foreign Delete posting, the man is marked deleted and his account is gone.

## MEDIUM

**M1. A new collection, `planx`, slips past the member rule.** It is used by B1's writer and by the Inputs calendar (A-ii).
- **What goes wrong:** the member switch refuses `case 'plan'` as "an admin's record" (`perms.ts` l.2901). Any collection it does not name falls to `default: break`, and `planx` is not named. Section 7 lets a member at home in a squadron pass. So once `plan-foreign.ts` exists, a member's forged command carrying `planx/u142@pp:<id>` rewrites 142's planning notes, which the gate refuses for `plan` today.
- **Other readers keyed on `'plan'` that miss it:**
  - `person-delete.ts` l.454: the refusal to restore a deleted man;
  - `changelines.ts` l.665 and l.736: the history lines for notes;
  - `undo-wire.ts` l.57 and l.170;
  - `sched-commit.ts` l.882, and `command/types.ts`.
- **A wording error too:** A-ii says section 7 judges the writer "as an admin or member there". Members never write the planning calendar.
- **Fix:** add `planx` beside `plan` in the member switch (core, phase 1). List every reader keyed on `'plan'` and give each one an owner. Add a red-first forged-member test.

**M2. The re-link: door, G4 and section 6 judge differently.**
- **The parts:**
  - Per Opus L4, `relinkRightsProblem` now counts only rights that still hold.
  - G4 (l.1852) is listed as unchanged and still counts every stored row.
  - The new drop removes ended rows, and section 6 judges each removal as "an admin of its squadron".
- **What goes wrong:** Ranger was 142's with View of 150 and has moved to 149, so his View has ended. Kestrel, 149's plain admin, re-links Ranger's sign-in to another 149 man on Admin → Users. The door lets it through. The gate refuses it twice ("not an admin of u150" and G4), and the screen shows "That did not save" or the gate's own words.
- **Fix:** G4 and the door both read only rights that hold today. Section 6 lets the re-link's own command remove a row that held nothing on today in the before-image, whoever re-links. The Undo of that re-link gets the same allowance (see M3).

**M3. The new re-link backstop refuses the plan's own Undo case.**
- **What goes wrong:** the rule is "a re-link leaves no right of its account that holds nothing on that day". An Undo of a re-link is itself a re-link (`was.pid ≠ is.pid`), and it puts back the dropped rows, which still hold nothing for Ranger. So the backstop refuses it. That contradicts §4.4's test ("its Undo and Redo leave it ended for both men") and D148. For Kestrel, section 6 also refuses putting back the 150 row.
- **Fix:** write the backstop as a before/after comparison: no grant row that held nothing on today before the command holds after it, unless it is a new giving dated today and judged by the who-rule. That catches a forged re-link that keeps an ended row, and lets the Undo through, because the restored rows stay ended.

**M4. Piece C checks a new squadron's first admin on today only, so B6 survives for any move dated past tomorrow.**
- **What goes wrong:** §5.2 says "a squadron new in this command needs one of either on today". Under Piece B's rule, a first admin whose move is saved for a later date (forged now; batch 4's transfer later) holds his right on 150 only until that date. After it, 150 has no admin, and no check ever looks at that date. This contradicts §4.2's claim that batch 4 needs "no more code". Today only the "moves tomorrow" refusal stops the case where the move is tomorrow.
- **Fix:** a new squadron needs an admin on every judged date, that is today and every home or grant `from` from today on.

**M5. C1 widens a door/gate split for an input that spans a move.**
- **What goes wrong:** after C1, Ranger's leave from 14 to 17 Jul (he moves on 16 Jul) shows on 149's Inputs list. Under D2221 as built, only a master or the man may change it. The input window has no door check, so 149's admin edits it, 7c refuses, and he sees a generic refusal. 142's admin hits the same today. C1 adds a second place where it happens, and §11 calls C1 only "faults going away".
- **Fix:** the window asks `inputSquadrons` and offers no change to an admin who is not an admin of every squadron the input touches, in words to be drawn for him first (D1625). Or name this in the until-then and in the walk.

**M6. `adminsOf(unit, iso)` has no stated audience, so the same posting line could reach different people.**
- **The existing rule:** the loaded war's pass bells `ownSchedulerIds()`, which means admins whose home is that squadron.
- **What could go wrong:** if `adminsOf` follows "admin of" as `levelOfAccount` reads it, the master and any 142 man holding Plan of 149 receive 149's posting lines, but only when the foreign pass runs. When 149's own war runs the same posting, they don't. Two different audiences for one line goes against D2194.
- **Fix:** define `adminsOf` as admins at home in that squadron on that day, switched on and able to sign in. Have both passes call it, and make the gate's reader check match.

## LOW

- **L1. Partial account objects drop the link day.** `levelInForce` (l.1302), the actor object in `unitRowViolation` (~l.1946), `homeUnitViolation` (l.2074), and `accounts.ts` l.328 and l.341 all build a partial `LevelAccount` without `pidFrom`. Missing one makes the gate and the door disagree about a re-linked account's right. Name them in the reader list.
- **L2. The test count is wrong.** `state/units-sqn-fixread2.test.ts`, "Ranger… moved to 149: no right of his is left", expects `grantsOf('acus')` to be `[]` right after `setHome`. It turns red under Piece B and is not among §4.5's six.
- **L3. The kept "right given the day before his move" gate line refuses honest Undos.** Example: on the day his move is saved, the master gives a right, presses Undo, then Redo — or a removal is undone that day. Under Piece B the right ends on the move day by itself, so the gate line guards nothing. Exempt verified replays at the gate and keep the door's words.
- **L4. Ambiguous wording in Piece C's rule.** "Where it has none at home, it keeps at least one non-master Plan holder" read literally refuses the first admin moving into 150, where his Plan ends but he becomes 150's admin at home. Write "keeps an admin at home or a non-master Plan holder", as §5.3 intends.
- **L5. Piece C should count Plan holders through `levelFrom`, not `grantOn`.** A sign-in holding Plan of 150, re-linked to a 150 member, would otherwise count as 150's admin while being only a member there.
- **L6. An input with its end before its start can escape 7c.** If `inputSpanIso` copies `inputCoversDate` (no wrap: such an input covers nothing), a bare-label input like that yields no squadrons, and 7c judges nothing. Always count the first day.
- **L7. File lists.**
  - Phase 3's A4 omits `leavewar/state/store.ts`, where `PLACE_PH`, `setPlaceHolidays` and `withPlaceHolidays` live.
  - B4's setting inventory, through `state/flyplan.ts`, can reach `sync.ts`, `undo-wire.ts` and `perms.ts`. Those are other helpers' files in phase 2. Name the owners before it starts.
- **L8. A7 is missing from §11.** The war door's new refusal of a day outside his stints may show new words. A7 is also built "as one tested change" with A1, which waits on Q6, so A7's timing is not the Q3-only timing the §1 table implies.
- **L9. Rights' dates still have their own body.** Rights' start dates are checked in section 6's grant branch, and the re-dating hooks stay. D2238's "rights under one check" is met only for a right's end. Say so plainly as a deliberate split.

## Checked and found nothing

- **R2:** both cases close by construction under (ii). The same-day move back replaces the row dated tomorrow, so nothing changes. In the forged one-day case, removing 150's right needs 150's admin.
- **R3:** the Undo removes home rows only. With 149's admin right, the plain admin passes rule 1. The copy's reads on the move day are the plan's own Q4 change.
- **R4 (a)–(d):** each ends on the dated move by the reading rule.
- **K1:** rule 1 (today plus every `from`) catches a back-dated place and an erased past move.
- **R5:** closes, provided `addUnit` carries the moves-tomorrow door words (M4 applies beyond tomorrow).
- **Every body that scans home rows** (grep of `.homes`) is named in §3.1.
- **Every reader of grant rows** (17 sites plus l.1243) is in §4.3. The only miss is the partial account objects (L1).
- **Timing under (ii):** a right ends at the start of the move day.
- **The bell:** `adminThen` on a move day retires the same lines the old delete did. Fix read 10's Redo cases stay green, including "the Redo puts back 13 Jul".
- **No mid-command swap:** `notify()` is deferred inside commands, so `enterSquadron` never runs in the middle of one.
- **`pageUnit` is dormant today:** `switchUnit` has one caller.
- **Postings and the record layer:** the pass's gate chain is laid out before its caller. K4 moves no saved key. I found no new route that leaks bell lines across squadrons apart from M6.
- **Order:** phase 2 builds on nothing that phase 1 does not lay first. The core files have one owner. The only collisions are those in L7.
