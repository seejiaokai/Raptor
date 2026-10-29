---
target: the Events list proposal
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-10-29T10-06-15Z
slug: raptor-port-src-leavewar-ui-eventssheet-tsx
---
Method: dual-agent (A: design review, Opus · B: detector and browser evidence, Sonnet)

# Critique — the Leave War's Events list, proposed (split B, line icons, kinds in one column), 29 Oct 26

## Design health: 26/40
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of status | 3 | counts and greyed past lines good; nothing marks where today falls |
| 2 | Match to the real world | 3 | the squadron's words; but ✕ also means "close" in the same window |
| 3 | User control | 3 | the armed ✕ is a good guard, but arming it moves the pencil |
| 4 | Consistency | 2 | "Delete?" here, "Delete — sure?" in the bid window (D1395); grey ✕ here, red delete cross in Rearrange (D676) |
| 5 | Error prevention | 2 | the armed button takes the pencil's place; icons ~6pt apart on a phone; a deleted holiday can change OIL, unsaid |
| 6 | Recognition over recall | 3 | one "+ Event" for two lists |
| 7 | Flexibility and efficiency | 2 | no keyboard path drawn; the holiday file import not reachable here |
| 8 | Minimal design | 3 | clean, but 24 boxed icons; "Public holiday" repeated under a Holidays heading |
| 9 | Error recovery | 2 | on the iPhone the full page covers the top bar: no Undo in view after a delete |
| 10 | Help | 3 | little needed |

## Specificity: the app's own (its section labels with counts, the Legend's squares, the solid pencil, grey past lines).
Detector: source clean (0); the drawn copies 35 findings, all in the app-wide stylesheet, none in the window (false positives;
the detector ran degraded). Measured: every text passes contrast (past lines 5.9:1); the pencil and ✕ buttons' edges 1.36:1
(a control's edge needs 3:1); the armed edge 2.84:1; both icon boxes 22 × 22.

## Priority issues
- [P1] The armed "Delete?" grows leftward and pushes the pencil: the pencil's old spot now confirms the delete. Fix: arm in place — the ✕ box keeps its size and turns red, "Delete?" shown on the line.
- [P1] Undo is out of reach on the iPhone (the full page hides the top bar). Fix: after a delete, a short note at the foot, "Families day deleted · Undo".
- [P2] Small, close targets on a phone (22 × 22, ~6pt apart) and faint edges (1.36:1). Fix: a finger-sized invisible hit area, the drawn box unchanged (D487); the box edge one step lighter.
- [P2] Delete looks and reads unlike the rest of the Leave War. Fix: "Delete — sure?" (D1395) and the red cross of Rearrange (D676).
- [P2] The desktop date column is too tight ("Tue 17 – Wed 18 Feb" ~8px from its name; a range across months or 31 Dec collides). Fix: size it for the longest possible date, both panels alike.
- [P2] A new event's landing and an empty list: lands in its own list, in view, ringed (D860); an empty list keeps its heading and one line.

## Persona red flags
Scheduler at a desktop: the double-width window covers most of the grid; no keyboard path. First-time admin: which list "+ Event" adds to; "Edit presets"; two places to change a holiday. The owner on his iPhone: small close icons, the moving pencil, no Undo.

## Minor
Past lines' icons not dimmed; title "JAN - DEC 26" hyphen vs the picker's dash; the Working event preset's red square reads as "stop".

## Questions
The order: Squadron events first (they change all year; holidays come once, by file)? Does the pencil earn its place beside a tappable line? Should past events fold away?
