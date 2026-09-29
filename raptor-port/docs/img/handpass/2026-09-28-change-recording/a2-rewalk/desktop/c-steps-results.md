# Walker A2 — c-steps (desktop)

| # | Check | Result | Observed | Picture(s) |
|---|---|---|---|---|
| C1.1 | the tick changed on Quals | PASS | before "✓" after "" | c-steps-01-C1-ticked.png |
| C1.2 | Undo on the Leave War lands on Quals (AM39b, A2-F4) | PASS | page quals | c-steps-02-C1-undone-on-quals.png |
| C1.3 | it says what came back — "Ranger’s quals" (B8) | PASS | Undid: Ranger’s quals |  |
| C1.4 | the tick is back as it was | PASS | now "✓" |  |
| C1.5 | Redo puts it back | PASS | Redid: Ranger’s quals |  |
| C1.6 | NOTE | note | the change history's last lines (S29 — a roster undo writes its line dated today): ["Ranger · NVG @2026-09-29","Undo — Ranger’s quals @2026-09-29","Redo — Ranger’s quals @2026-09-29"] |  |
| C2.1 | TF removed from the LoX | PASS | san,sxo,sched,scDay,scNight,daar,naar,nvg,imc | c-steps-03-C2-tf-removed.png |
| C2.2 | Undo brings TF back ON THE QUALS PAGE (Fable S19 — the page read its own copy) | PASS | san,sxo,sched,scDay,scNight,daar,naar,nvg,imc,tf · Undid: the LoX columns | c-steps-04-C2-tf-back.png |
| C2.3 | the words: "the LoX columns" | PASS | Undid: the LoX columns |  |
| C3.1 | the rule scDayFrom changed 07:00 → 07:05 | PASS | box now "07:05" | c-steps-05-C3-rule-changed.png |
| C3.2 | Undo from Edit Schedule lands on Logic | PASS | page logic | c-steps-06-C3-undone-on-logic.png |
| C3.3 | the rule shows its old value again (Fable S18 — a stale box) | PASS | now "HOW A DAY IS MEASURED

Before any rule can fire, the engine has to decide how much of the day each commitment actually occupies.

SETTING
A sortie occupies the schedule from step, 1h before take-off, to dekit, 30 min after landing — not just take-off to landing.
Step before take-off
1h
Dekit after landing
30 min
VCONF.step 60 · VCONF.dekit 30
SETTING
The flight brief is the time in the line's B box. Where a line has none, this setting suggests one — 2h20 before take-off — and the scheduler accepts it or types their own.
This number is a convenience, not a rule: it only works out the suggestion so nobody has to do the arithmetic. What every brief warning actually follows is the B on the  |  |
| C3.4 | the words: "a rule on the Logic page" | PASS | Undid: a rule on the Logic page |  |
| C4.1 | Outlaw suspended (his sign-in dot changes) | PASS |  | c-steps-07-C4-suspended.png |
| C4.2 | Undo on Admin → Users enables him again | PASS | Undid: suspending Outlaw’s sign-in | c-steps-08-C4-undone.png |
| C4.3 | the words: "suspending Outlaw’s sign-in" | PASS | Undid: suspending Outlaw’s sign-in |  |
| C5.1 | the person is added | PASS | rows 1 | c-steps-09-C5-added.png |
| C5.2 | Undo is greyed, and its hover says why (D350 — B3) | PASS | disabled true · "Adding, archiving or restoring a person, and a posting, aren’t undone here — use Restore, Delete or the posting sheet’s own Undo. A delete is final." |  |
| C6.1 | Undo of the rename is refused whole, naming the callsign (D286 — B5) | PASS | Hex is taken on the roster now — rename one of them first. | c-steps-10-C6-refused.png |
| C6.2 | nothing moved: one Hex (the new man), Quasar still Quasar | PASS | Hex ×1, Quasar ×1 |  |
| C6.3 | the step stays next — Undo still on | PASS | disabled after false |  |
| C7.1 | Undo of the suspension, behind the archive, refused (D322 — B5) | PASS | Hex is archived — restore him on Admin → Users first | c-steps-11-C7-refused.png |
| C8.1 | the stage moved OPEN FOR BIDDING → BIDDING CLOSED, and Undo from Edit Schedule lands on the Leave War (B7) | PASS | page leavewar | c-steps-12-C8-undone-on-war.png |
| C8.2 | the stage is back | PASS | now OPEN FOR BIDDING |  |
| C8.3 | D352 — its own words, and what the war is now | PASS | Undid: closing bidding — bidding is open again for everyone |  |
| C9.1 | a take-off time undone says "a take-off time" (A2-F6, [AMEND-SMALL-SEEN] 2) | PASS | Undid: a take-off time | c-steps-13-C9-takeoff-undone.png |
| C9.2 | and the time is back | PASS | now "12:40" |  |
| C10.1 | his own admin step, in the member view, refuses "Switch back…" — every press (D292, D148) | PASS | Switch back to the admin view to undo that. / Switch back to the admin view to undo that. | c-steps-14-C10-member-view.png |
| C10.2 | switched back, the same Undo takes it | PASS | Undid: Ranger’s quals |  |
| C11.1 | after "Mark all as seen", Undo on Inputs takes his LL — the seen mark is no step (B1, Fable S2) | PASS | Undid: a personal input · seen pressed: 0 · iid imum23pqy8a6rj2 | c-steps-15-C11-undone.png |

Console / page errors: none
