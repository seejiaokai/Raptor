RED-TEAM OF A PLAN — blind, read-only. Do not read HANDOFF.md or any evidence sheet; change no file. You are one of two
readers; you will not see the other's report.

The plan: raptor-port/docs/superpowers/plans/2026-11-27-oil-later-plan.md (in the repo you are given). Read it whole, then
the code it names: raptor-port/src/ui/oilsign.ts, raptor-port/src/ui/OilDayList.tsx, raptor-port/src/engine/publish.ts
(currentBind / currentBindNow, signBoundOk, oilBoundOk, signShown, signRoleOk, pendingKey), raptor-port/src/engine/oilev.ts
(oilEvidenceKey, insSeg, oilSignKey, oilMovedInputsOnly, projectOilInputs), raptor-port/src/ui/oilday.ts (saveOilDay),
and every other writer of an input's OIL answer (grep `r.oil =`, `.oil = ` under raptor-port/src/ui). Area rulings:
.claude/rules/decisions/oil.md and scheduler.md (the sign-off lines).

The owner's rulings it builds (not yet on this copy's rulings files — quoted here):
- D2800 (26 Nov 26): "Later on a day's OIL list means 'not my call': each next press of any of the day's four sign-off
  boxes opens the list again until someone answers; an OIL answer does not clear the names already signed; Save with
  rows left unpicked leaves them as Later does." His use: a scheduler without authority to decide OIL presses Later, so
  management, signing a later box (usually APPROVED BY), sees the question and answers it. Narrows D2294 and the
  amendment register's AM11 for an OIL answer.
- D2801: "Any OIL answer leaves the names already signed on a day not yet published — given on the sign-off list, on the
  input's own 'OIL?' sign or from a bell line alike."
- D2859: the list's foot words — none picked: "Later: Ace signs, and the next sign-off asks again"; some picked: "Save:
  the next sign-off asks the rest" in its place; on the last of the four boxes "Later: Ace signs, and OIL stays
  unanswered for now"; Later after picks still throws them away and saves nothing.

Ask, of the plan against the code:
1. Does leaving the answer out of the signature's OIL key (and only there) do what D2800/D2801 say, through EVERY door
   an answer is written by — and does it open any hole: a change other than an answer that would now slip past a
   signature (e.g. an answer that changes who earns, a new input's arrival, an answer that also moves `stand`, `acc`,
   the earns flag, the `orv` axis, a multi-day input, a placeholder, drafts/plans each owning signatures, a day loaded
   back from a published version, Undo of an answer)?
2. On a published day: is the plan right that an answer still takes the names down (through `pd`), and is that what
   D2801 says? Would anything on a published day now behave inconsistently (the count of pending, "Publish AL" greyed or
   not, the publish note)?
3. With the Later memory gone, can a sign-off ever loop, refuse, or sign with nobody asked — the end-time rule's refusals,
   a refused command write, a hold whose plan/week changed, a list left open while another box is pressed?
4. The foot words: is the plan's "last box" test right (the other three roles signed and standing), and are the
   no-line cases right? Any case where a line shown would be untrue?
5. Missing tests, missing places that draw a sign-off box or give an OIL answer, comments or documents left stating
   the old rule.

A finding counts only with a concrete failure (the steps, what the screen or the record shows), its cause in the code,
and its fix. A problem that lives only in data already stored, with the code correct going forward, is not a finding
(D56) — e.g. signatures stored before this build reading unsigned once. End with a verdict: build as planned / revise
first, and why. Write your whole report to the report file you are given.
