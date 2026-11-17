# W2 report (scn-phone-webkit-S13.md)

| scenario | size | role | what I did | what the screen showed | verdict | pictures |
|---|---|---|---|---|---|---|
| S13 | 402 webkit | admin | armed Delete, Cancel, reopened | armed read "Really delete?"; the award still there: true; reopened Delete reads "Delete" | PASS | w2-phone-webkit-S13-armed.png |
| S13 | 402 webkit | admin | armed Delete on the first, opened the second award, then the first again | first reads "Delete" (not armed expected); second reads "Delete"; first still there: true | PASS |  |
| S13 | 402 webkit | admin | armed Delete, closed the tracker, reopened it and the award | Delete reads "Delete" (not armed expected); award still there: true | PASS |  |
| S13 | 402 webkit | admin | pressed Delete twice (arm, then confirm) | first press read "Really delete?"; the award gone: true; the other award still there: true | PASS | w2-phone-webkit-S13-deleted.png |
| S13 | 402 webkit | admin | Undo after the deletion | the deleted award is back: true; the other still there: true | PASS | w2-phone-webkit-S13-undone.png |
