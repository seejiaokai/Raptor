# Walker A1 — s13 (phone 390×844)

| # | Check | Result | Observed | Picture(s) |
|---|---|---|---|---|
| S13.0 | NOTE | note | {"what":"the week of Sat 3 Oct, reached through the calendar","week":{"wk":"28/09/2026","sat":"Oct 3","allhands":0,"duties":0},"hex":"rocky"} |  |
| S13.1 | Hex put on Saturday 3 Oct (a Common Programme item added, Hex in it) | PASS | {"ri":0,"who":"rocky","onSat":"rocky"} | phone/s13-01-hex-on-sat.png |
| S13.2 | Quals: SCHEDULER ticked on Hex | PASS | {"ticked":"qcell apt-on"} | phone/s13-02-hex-scheduler-ticked.png |
| S13.3 | Saturday 3 Oct signed (Hex as PLANNED BY) and published | PASS | {"signed":{"cur":"Ace","sked":"Anvil","plan":"Hex","appr":"Anvil"},"h":{"tag":"ORIG","pending":"7 changes"}} | phone/s13-03-sat-published-hex-signed.png |
| S13.4 | Admin → Users → Hex → Delete, then "Tap again to delete Hex" → Hex deleted | PASS | {"armWords":"Tap again to delete Hex","t":["the common programme has no usable times — nobody on it earns OIL for this day","Saturday published — APPROVED","Saturday 3 Oct earned nobody any OIL — the common programme has no usable times","Hex deleted"]} | phone/s13-04-hex-deleted.png |
| S13.5 | NOTE | note | {"what":"Edit Schedule after the delete: the top-bar pair and Saturday","st":{"undo":"on \"Undo — a sign-off\"","redo":"off \"Redo\""},"h":{"tag":"ORIG","pending":"1 pending","signs":["— name —","— name —","— name —","— name —"]}} |  |
| S13.6 | top-bar Undo → refused: "A day on this week was published after that change — tap Unpublish on that day first, or edit its working copy."; nothing moves | **FAIL** | {"u1":{"where":"top","dir":"undo","present":true,"title":"Undo — a sign-off","disabled":false,"pressed":true,"toasts":["A later change touches the same thing — undo that first."],"titleAfter":"Undo — a sign-off","disabledAfter":false},"who1":"","h":{"tag":"ORIG","pending":"1 pending"}} | phone/s13-05-undo-behind-publish.png |
| S13.6b | NOTE | note | {"what":"the same Undo pressed again","u2":{"where":"top","dir":"undo","present":true,"title":"Undo — a sign-off","disabled":false,"pressed":true,"toasts":["A later change touches the same thing — undo that first."],"titleAfter":"Undo — a sign-off","disabledAfter":false}} |  |
| S13.7 | NOTE | note | {"what":"Unpublish pressed","unp":"pressed","h":{"tag":"DRAFT","pending":"9 changes"}} |  |
| S13.8 | after Unpublish, Undo reaches BEHIND the publish (the step before it reverts), as the message promised | **FAIL** | {"u3":{"where":"board","dir":"undo","present":true,"title":"Undo — taking a published day back","disabled":false,"pressed":true,"toasts":["Undid: taking a published day back"],"titleAfter":"Undo — a sign-off","disabledAfter":false},"who3":"","h":{"tag":"ORIG","pending":"1 pending"}} | phone/s13-06-after-unpublish-undo.png |
| S13.9 | NOTE | note | {"what":"the next Undo after that","u4":{"where":"board","dir":"undo","present":true,"title":"Undo — a sign-off","disabled":false,"pressed":true,"toasts":["A later change touches the same thing — undo that first."],"titleAfter":"Undo — a sign-off","disabledAfter":false},"h":{"tag":"ORIG","pending":"1 pending"}} | phone/s13-07-undo-after-that.png |

Console / page errors: none
