# Walker A2 — roles (desktop)

| # | Check | Result | Observed | Picture(s) |
|---|---|---|---|---|
| R1-note | Saber types a note on Monday on Edit Schedule; the top bar's Undo names it | PASS | {"key":"dn:0.0","note":"A2 NOTE AS ADMIN","top":{"undo":"on \"Undo — a day note\"","redo":"off \"Redo\""}} | roles-01-R1-note-as-admin.png |
| R1-switch | the switch puts Saber in the member view (Edit Schedule gives way to View-only Sched; its Undo pair goes) | PASS | {"sv":"SABER · MEMBER","v1":{"badge":"Saber · Member","acct":"Signed in as Saber · Member"},"page":"viewsched","topUndoVisible":0} | roles-02-R1-member-view.png |
| R1-refuse | in the member view the war's Undo is ON and refuses: "Switch back to the admin view to undo that." | PASS | {"door":{"undo":"on \"Undo — a day note\"","redo":"off \"Redo\""},"toasts":["Switch back to the admin view to undo that."],"stillOn":true} | roles-03-R1-member-undo-refused.png |
| R1-again | the next press says the same and the button stays on (D148: never greys); Redo is off and raises nothing (S30) | PASS | {"second":["Switch back to the admin view to undo that."],"undoStillOn":true,"redo":{"disabled":true,"title":"Redo"}} |  |
| R1-unchanged | the refused Undo left Monday's note as Saber typed it (View-only Sched) | PASS | {"found":true} | roles-04-R1-note-kept-on-view-page.png |
| R1-file | in the member view Saber files his own LL on Tue 14 Jul on the Inputs page | PASS | {"f":{"added":1,"asked":[],"toast":"","iid":"imum4nd0059xfri"},"m1":1} | roles-05-R1-member-files-own-LL.png |
| R1-own | his member-view Undo takes his own filing back and Redo brings it back | PASS | {"undo":["Undid: a personal input"],"afterUndo":0,"redo":["Redid: a personal input"],"afterRedo":1} | roles-06-R1-member-own-undo-redo.png |
| R1-back | back in the admin view, Undo reverses the member-view filing (an admin may reverse anything) | PASS | {"sb":"SABER · ADMIN","v2":{"badge":"Saber · Admin","acct":"Signed in as Saber · Admin"},"toasts":["Undid: a personal input"],"left":0} | roles-07-R1-back-to-admin-undo.png |
| R1-note-undone | the next Undo (admin view) reverses the note typed before the switch | PASS | {"toasts":["Undid: a day note"],"note":"EP: ENGINE FIRE ON TAKE OFF"} | roles-08-R1-note-undone-as-admin.png |
| R3-words | a take-off time changed and undone: the bubble names what came back (a time on a flying line) — KNOWN, [AMEND-SMALL-SEEN] 2 | PASS | {"key":"ff:0.0.0.to","was":"12:40","title":"on \"Undo — a take-off time\"","toasts":["Undid: a take-off time"],"now":"12:40"} | roles-09-R3-takeoff-undo-bubble.png |
| R2-setup | Saber: two bids on Echo, the second undone — Undo and Redo both on | PASS | {"a":"request:LL/pending","b":"request:LL/pending","undo":["Undid: Echo’s bid"],"doors":{"undo":"on \"Undo — Echo’s bid\"","redo":"on \"Redo — Echo’s bid\""}} | roles-10-R2-saber-two-bids-one-undone.png |
| R2-saber-again | Saber signs out and in again: both doors off; the bids stay as they were (Wed kept, Thu gone) | PASS | {"lw":{"undo":"off \"Undo\"","redo":"off \"Redo\""},"top":{"undo":"off \"Undo\"","redo":"off \"Redo\""},"recs":{"2026-07-15":"request:LL/pending","2026-07-16":"-"}} | roles-11-R2-saber-again-empty.png |
| R2-ranger-after | Ranger signs in after Saber: the war's Undo and Redo are off | PASS | {"undo":"off \"Undo\"","redo":"off \"Redo\""} | roles-12-R2-ranger-after-saber.png |
| R2-ranger-bid | Ranger bids on his own row (7 Jan, inside the bidding window) — his Undo is on and names it | PASS | {"rec":"request:LL/pending","doors":{"undo":"on \"Undo — Ranger’s bid\"","redo":"off \"Redo\""}} | roles-13-R2-ranger-bid.png |
| R2-ranger-again | Ranger signs out and in again: his Undo is off; his bid stays | PASS | {"doors":{"undo":"off \"Undo\"","redo":"off \"Redo\""},"rec":"request:LL/pending"} | roles-14-R2-ranger-again-empty.png |
| R2-saber-after | Saber signs in after Ranger: every door off | PASS | {"lw":{"undo":"off \"Undo\"","redo":"off \"Redo\""},"top":{"undo":"off \"Undo\"","redo":"off \"Redo\""}} | roles-15-R2-saber-after-ranger.png |
| errors | NOTE | note | [] |  |

Console / page errors: none
