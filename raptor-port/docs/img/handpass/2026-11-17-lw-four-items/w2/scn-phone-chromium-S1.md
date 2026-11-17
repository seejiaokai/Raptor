# W2 report (scn-phone-chromium-S1.md)

| scenario | size | role | what I did | what the screen showed | verdict | pictures |
|---|---|---|---|---|---|---|
| S1 | 402 chromium | admin | opened the editor on the active (CNY, Ace) award (l4) | same layout as the first award (editor [194.2,80.8]) | PASS | w2-phone-chromium-S1-l4.png |
| S1 | 402 chromium | admin | opened the editor on the partly used (Weekend recovery, 0.5 left of 1) award (l9) | same layout as the first award (editor [194.2,80.8]) | PASS | w2-phone-chromium-S1-l9.png |
| S1 | 402 chromium | admin | opened the editor on the 2027 lane (Overseas exercise, Trident) award (dol-4) | same layout as the first award (editor [194.2,80.8]) | PASS | w2-phone-chromium-S1-dol-4.png |
| S1 | 402 chromium | admin | opened the editor on the AM half-day (SIM) award (dol-5) | same layout as the first award (editor [194.2,80.8]) | PASS | w2-phone-chromium-S1-dol-5.png |
| S1 | 402 chromium | admin | opened the correction (negative) (dol-3) | a different editor opens (the correction editor: amount, date picker, reason, Save, Cancel, Delete; no award editor, no AM/PM place) — a boundary, not the award editor of D2155 | RECORDED | w2-phone-chromium-S1-dol-3.png |
| S1 | 402 chromium | admin | tapped a carried-in opening figure box | an award editor opened: false | RECORDED | w2-phone-chromium-S1-carried-in.png |
| S1 | 402 chromium | admin | gave Ranger a fresh 1-day award (ol-mwkayv0w1po25), took 1 day of OIL on Wed 2 Dec ("OIL0" pressed), opened the award | award box reads "+117 NovW2S1 to be used up−1 2 Dec0 left"; editor same layout | PASS | w2-phone-chromium-S1-fully-used.png |
| S1 | 402 chromium | admin | set the tracker expiry to 30 days (settings), opened the old CNY award | award box reads "+219 JanCNY workplanexpired 18 Feb"; editor same layout | PASS | w2-phone-chromium-S1-expired.png |
| S1 | 402 chromium | admin | pressed the archive mark again (the archive lane had been opened for the used-up award) | {"rows":50,"archBtns":50,"ents":15} (rows, archive marks, award boxes now drawn; see the picture) | RECORDED | w2-phone-chromium-S1-archive-pressed.png |
