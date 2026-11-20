# W2 report (scn-phone-webkit-S11.md)

| scenario | size | role | what I did | what the screen showed | verdict | pictures |
|---|---|---|---|---|---|---|
| S11 | 402 webkit | admin | opened a 0.5 PM award | AM/PM shown: {"am":"tchip half","pm":"tchip half on","gap":0} | PASS | w2-phone-webkit-S11-open.png |
| S11 | 402 webkit | admin | amount 1 | chips {"am":null,"pm":null,"gap":1}; the other parts keep their boxes: true;  | PASS | w2-phone-webkit-S11-amt-1.png |
| S11 | 402 webkit | admin | amount 2.5 | chips {"am":null,"pm":null,"gap":1}; the other parts keep their boxes: true;  | PASS | w2-phone-webkit-S11-amt-2_5.png |
| S11 | 402 webkit | admin | amount 0.5 | chips {"am":"tchip half","pm":"tchip half on","gap":0}; the other parts keep their boxes: true;  | PASS | w2-phone-webkit-S11-amt-0_5.png |
| S11 | 402 webkit | admin | saved with PM, opened another (AM) award, SIM 18 Apr | chips {"am":"tchip half on","pm":"tchip half","gap":0} | PASS | w2-phone-webkit-S11-other-AM-award.png |
| S11 | 402 webkit | admin | reopened the first award | chips {"am":"tchip half","pm":"tchip half on","gap":0} | PASS | w2-phone-webkit-S11-back-to-first.png |
