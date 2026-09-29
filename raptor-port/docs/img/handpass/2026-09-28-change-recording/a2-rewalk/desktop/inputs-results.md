# Walker A2 — inputs (desktop)

| # | Check | Result | Observed | Picture(s) |
|---|---|---|---|---|
| I1-file | Ranger files an LL on Wed 15 Jul on the Inputs page: listed there and under Wednesday's Unavailable | PASS | {"f":{"added":1,"asked":[],"toast":"","iid":"imum4c5bqptqezj"},"listed":true,"unav":"[\"LL:bane\",\"OL:taipan\",\"ATT C:sufa\",\"OD:pike\",\"OIL:bruise\"]"} | inputs-01-I1-member-filed-on-inputs.png, inputs-02-I1-view-wed-unavailable-shows-it.png |
| I1-undo | the war's Undo (his only door) names it and takes it back: "Undid: a personal input"; the view stays on the war (no jump — GU-E5) | PASS | {"door":{"undo":"on \"Undo — a personal input\"","redo":"off \"Redo\""},"toasts":["Undid: a personal input"],"gone":true,"page":"leavewar"} | inputs-03-I1-lw-undo.png |
| I1-gone | after the Undo the Inputs table and Wednesday's Unavailable no longer show it | PASS | {"listed":false,"unav":"[\"OL:taipan\",\"ATT C:sufa\",\"OD:pike\",\"OIL:bruise\"]"} | inputs-04-I1-inputs-after-undo.png, inputs-05-I1-view-wed-after-undo.png |
| I1-redo | Redo brings it back ("Redid: a personal input") | PASS | {"toasts":["Redid: a personal input"],"back":true} | inputs-06-I1-lw-redo.png |
| I1-reload | a reload keeps the redone input (listed on the Inputs page); Undo and Redo are off (the history is per sign-in) | PASS | {"kept":true,"listed":true,"doors":{"undo":"off \"Undo\"","redo":"off \"Redo\""}} | inputs-07-I1-after-reload.png, inputs-08-I1-inputs-after-reload.png |
| I2-file | Saber files an LL for Ranger on Tue 21 Jul (week 2, not loaded) | PASS | {"added":1,"asked":[],"toast":"","iid":"imum4cp55az3gdr"} | inputs-09-I2-filed.png |
| I2-shown | week 2 open: Tue 21 Jul's Unavailable shows Ranger's filing | PASS | {"how":"the week button \"Jul 20\"","week":"20/07/2026","tue":"[\"LL:bane\"]"} | inputs-10-I2-week2-tue-shows-it.png |
| I2-week2 | on week 2, Undo either takes the filing back or says plainly to open a different week first (never a wrong or silent result) | PASS | {"how":"the week button \"Jul 20\"","week":"20/07/2026","door":{"undo":"on \"Undo — a personal input\"","redo":"off \"Redo\""},"toasts":["Undid: a personal input"],"stillFiled":false,"weekAfter":"20/07/2026","tueUnav":"\"Nil\""} | inputs-11-I2-undo-on-week2.png |
| I2-row | week 2 opened again: Tue 21 Jul carries no row for Ranger's filing | PASS | {"tue":"\"Nil\""} | inputs-12-I2-week2-tue-no-row.png |
| I2-reload | after a reload still no row on Tue 21 Jul | PASS | {"tue":"\"Nil\""} |  |
| I3-plan | the planning calendar: a day title typed for Thu 16 Jul | PASS | {"plan":"A2 PLAN TITLE"} | inputs-13-I3-plan-title.png |
| I3-note | then a note on the schedule | PASS | {"key":"dn:0.0"} |  |
| I3-undo1 | the first Undo (Leave War) takes the NOTE back (newest first); the plan title stays | PASS | {"toasts":["Undid: a day note"],"page":"editsched","note":"EP: ENGINE FIRE ON TAKE OFF","plan":"A2 PLAN TITLE"} | inputs-14-I3-lw-undo-1.png, inputs-15-I3-calendar-after-undo-1.png |
| I3-undo2 | the second Undo takes the plan title back | PASS | {"toasts":["Undid: a day title on the calendar"],"page":"inputs","plan":null} | inputs-16-I3-lw-undo-2.png, inputs-17-I3-calendar-after-undo-2.png |
| I3-where | NOTE | note | after each Undo the page was: editsched, inputs — neither jumped to the schedule or the planning calendar (Astra 24 expects the view to go to where the change was — AM39b; GU-E5 is the input-only sibling) |  |
| I3-redo1 | the board's Redo first brings the plan title back (most recently undone) | PASS | {"toasts":["Redid: a day title on the calendar"],"plan":"A2 PLAN TITLE"} | inputs-18-I3-board-redo-1.png, inputs-19-I3-calendar-after-redo-1.png |
| I3-redo2 | the board's second Redo brings the schedule note back | PASS | {"toasts":["Redid: a day note"],"onBoard":"A2 SCHED NOTE","onWeek":"A2 SCHED NOTE"} | inputs-20-I3-board-redo-2.png |
| I4-bid | Echo: an LL bid on Wed 7 Oct | PASS | {"rec":"request:LL/pending"} |  |
| I4-post | Echo posted out from 14 Oct (Overseas Sqn) through the war's PO sheet; from that day his boxes read PO | PASS | {"date":"2026-10-14","line":"On 14 Oct: archived.","notHere":[true,true],"doors":{"undo":"on \"Undo — Echo’s bid\"","redo":"off \"Redo\""}} | inputs-21-I4-postout-sheet.png, inputs-22-I4-posted-out.png |
| I4-undo | the app's Undo passes over the posting (D350) and takes the earlier BID back; the posting stays | PASS | {"titleBefore":"Undo — Echo’s bid","toasts":["Undid: Echo’s bid — the later posting stays; it isn’t undone here."],"bid":"-","poStill":[true,true]} | inputs-23-I4-app-undo.png |
| I4-greyed | with only the posting left, Undo is off — and its hover says why (a posting is not an Undo step, D350) | PASS | {"doors":{"undo":"off \"Adding, archiving or restoring a person, and a posting, aren’t undone here — use Restore, Delete or the posting sheet’s own Undo. A delete is final.\"","redo":"on \"Redo — Echo’s bid\""}} |  |
| I4-sheet | the posting sheet's own "Undo post out (PO)" takes the posting back | PASS | {"opened":"postout-sheet","buttons":["postout-cancel:✕","postout-overseas:✓ Overseas Sqn","postout-delete:Delete","postout-sans:SANS","postout-transfer:Transfer to Sqn(off)","postout-undo:Undo post out (PO)","postout-place:Place leave or OIL here instea"],"poAfter":[false,false]} | inputs-24-I4-sheet-undo-post-out.png |
| I4-after | NOTE | note | {"doors":{"undo":"off \"Adding, archiving or restoring a person, and a posting, aren’t undone here — use Restore, Delete or the posting sheet’s own Undo. A delete is final.\"","redo":"on \"Redo — Echo’s bid\""},"note":"\"Undo post out\" is not an Undo step either (it writes the posting record) — the war's Undo stays as it was"} |  |
| errors | NOTE | note | [] |  |

Console / page errors: none
