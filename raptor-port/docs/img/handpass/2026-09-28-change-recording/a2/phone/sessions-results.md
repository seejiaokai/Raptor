# Walker A2 — sessions (phone)

| # | Check | Result | Observed | Picture(s) |
|---|---|---|---|---|
| S1-bid | Ranger bids LL on his own 7 Jan | PASS | {"rec":"request:LL/pending","doors":{"undo":"on \"Undo — a change to the leave board\"","redo":"off \"Redo\""}} | sessions-01-S1-ranger-bid.png |
| S1-own | his own Undo takes his bid back and Redo puts it back | PASS | {"undo":["Undid: a change to the leave board"],"afterUndo":"-","redo":["Redid: a change to the leave board"],"afterRedo":"request:LL/pending"} | sessions-02-S1-ranger-undo.png, sessions-03-S1-ranger-redo.png |
| S2-empty | Saber signs in after Ranger: nothing to undo or redo (Ranger's bid is not on his list) | PASS | {"undo":"off \"Undo the last change\"","redo":"off \"Redo\""} |  |
| S2-approve | Saber approves Ranger's bid (it becomes his leave) | PASS | {"opened":"bid-picker","approved":1,"rec":"-"} | sessions-04-S2-saber-approves.png |
| S2-undo | Saber's Undo takes his approval back — Ranger's bid stands again, undecided | PASS | {"toasts":["Undid: a change to the leave board"],"approved":0,"rec":"request:LL/pending"} | sessions-05-S2-saber-undo-approve.png |
| S2-redo | Redo approves it again | PASS | {"toasts":["Redid: a change to the leave board"],"approved":1} | sessions-06-S2-saber-redo-approve.png |
| S3-give | Saber gives Ranger a 1-day OIL award on 8 Jan | PASS | {"rec":"credit:FO/manual/d1"} | sessions-07-S3-award-given.png |
| S3-delete | Saber deletes the award through the day's sheet | PASS | {"opened":"bid-picker","buttons":["bid-cancel:✕","span-one:Just this day","span-range:Pick a range","bid-clear:Delete","portion-full:Whole day","portion-am:AM","portion-pm:PM","bid-LL:LL","bid-OL:OL","bid-OIL:OIL","bid-CCL:CCL","bid-FCL:FCL","bid-PL:PL","bid-EL:EL","bid-CL:CL","bid-oil:FO · a day","bid-postout:PO","bid-postin:PI"],"how":"bid-clear (Delete)","rec":"-"} | sessions-08-S3-award-deleted.png |
| S3-undo | Undo brings the deleted award back | PASS | {"toasts":["Undid: a change to the leave board"],"rec":"credit:FO/manual/d1"} | sessions-09-S3-undo-delete.png |
| S3-redo | Redo deletes it again | PASS | {"toasts":["Redid: a change to the leave board"],"rec":"-"} | sessions-10-S3-redo-delete.png |
| S3-undo-again | Undo once more: the award is back | PASS | {"toasts":["Undid: a change to the leave board"],"rec":"credit:FO/manual/d1"} |  |
| S4-stop | Saber's Undo walks back only his own steps and stops; Ranger's bid stays (undecided again) | PASS | {"presses":["Undid: a change to the leave board","Undid: a change to the leave board","OFF off \"Undo the last change\""],"bid":"request:LL/pending","approved":0,"award":"-"} | sessions-11-S4-saber-list-exhausted.png |
| S4-redo | Redo still works after the list is walked back (the last step he undid) | PASS | {"toasts":["Redid: a change to the leave board"]} |  |
| S5-empty | Ranger signs in again: his Undo and Redo are off — Saber's decisions are not his to take back | PASS | {"doors":{"undo":"off \"Undo the last change\"","redo":"off \"Redo\""},"rec":"-"} | sessions-12-S5-ranger-again.png, sessions-13-S5-ranger-doors.png |
| errors | NOTE | note | [] |  |

Console / page errors: none
