# W2 report (scn-phone-webkit-S12.md)

| scenario | size | role | what I did | what the screen showed | verdict | pictures |
|---|---|---|---|---|---|---|
| S12 | 402 webkit | admin | amount 0 (zero), Save | editor still open: true; message "An OIL award stays an award — delete it and enter a correction instead"; award box unchanged: true; parts keep their boxes: true | PASS | w2-phone-webkit-S12-zero.png |
| S12 | 402 webkit | admin | amount -1 (negative), Save | editor still open: true; message "An OIL award stays an award — delete it and enter a correction instead"; award box unchanged: true; parts keep their boxes: true | PASS | w2-phone-webkit-S12-negative.png |
| S12 | 402 webkit | admin | amount 0.25 (a quarter day), Save | editor still open: true; message "Days come in halves — 1, 1.5, 2 …"; award box unchanged: true; parts keep their boxes: true | PASS | w2-phone-webkit-S12-a_quarter_day.png |
| S12 | 402 webkit | admin | amount 366 (more than 365), Save | editor still open: true; message "That is more than 365 days"; award box unchanged: true; parts keep their boxes: true | PASS | w2-phone-webkit-S12-more_than_365.png |
| S12 | 402 webkit | admin | cleared the reason, Save | editor still open: true; message "Give a reason"; reason box still empty: true | PASS | w2-phone-webkit-S12-empty-reason.png |
| S12 | 402 webkit | admin | valid amount 1.5 and a reason, Save | editor closed: true; the award box reads "+1.517 NovGS12 retried1.5 left" | PASS | w2-phone-webkit-S12-valid-retry.png |
