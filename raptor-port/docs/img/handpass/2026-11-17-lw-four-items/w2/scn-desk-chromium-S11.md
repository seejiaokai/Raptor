# W2 report (scn-desk-chromium-S11.md)

| scenario | size | role | what I did | what the screen showed | verdict | pictures |
|---|---|---|---|---|---|---|
| S11 | 1536x864 chromium | admin | opened a 0.5 PM award | AM/PM shown: {"am":"tchip half","pm":"tchip half on","gap":0} | PASS | w2-desk-chromium-S11-open.png |
| S11 | 1536x864 chromium | admin | amount 1, then Tab three times from the amount box | chips {"am":null,"pm":null,"gap":1}; the other parts keep their boxes: true; Tab order ["oil-edit-reason","oil-edit-given","oil-edit-save"];  | PASS | w2-desk-chromium-S11-amt-1.png |
| S11 | 1536x864 chromium | admin | amount 2.5, then Tab three times from the amount box | chips {"am":null,"pm":null,"gap":1}; the other parts keep their boxes: true; Tab order ["oil-edit-reason","oil-edit-given","oil-edit-save"];  | PASS | w2-desk-chromium-S11-amt-2_5.png |
| S11 | 1536x864 chromium | admin | amount 0.5, then Tab three times from the amount box | chips {"am":"tchip half","pm":"tchip half on","gap":0}; the other parts keep their boxes: true; Tab order ["oil-edit-half-am","oil-edit-half-pm","oil-edit-reason"];  | PASS | w2-desk-chromium-S11-amt-0_5.png |
| S11 | 1536x864 chromium | admin | saved with PM, opened another (AM) award, SIM 18 Apr | chips {"am":"tchip half on","pm":"tchip half","gap":0} | PASS | w2-desk-chromium-S11-other-AM-award.png |
| S11 | 1536x864 chromium | admin | reopened the first award | chips {"am":"tchip half","pm":"tchip half on","gap":0} | PASS | w2-desk-chromium-S11-back-to-first.png |
