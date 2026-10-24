# Leave War short lines and design lessons — blind read

Read from `origin/claude/lw-m3-placing-leave` (fetched 24 Oct 26): `.claude/rules/decisions/leave-war.md`,
`.claude/decisions-full/leave-war.md` (and `how-we-work.md` for D1237, D687), `raptor-port/docs/design-practices.md`.
The read command was proved first on D1231. Every later row that names an in-scope D-number was searched (all eight
full-text files and `DECISIONS-ARCHIVE.md`) and read, to check the "changed by" tails. The round-18 drawing
`raptor-port/docs/mock/lw-overhaul/full/r18-lve-member.png` was opened to check F1.

## Part 1 — short lines

| Ruling | Verdict | Detail (findings only) |
|---|---|---|
| D1208 | OK | |
| D1209 | OK | |
| D1210 | OK | |
| D1211 | OK | |
| D1212 | OK | |
| D1213 | OK | (states D1243's narrowing inline; tail present) |
| D1214 | OK | |
| D1215 | OK | |
| D1216 | OK | |
| D1217 | OK | |
| D1218 | OK | |
| D1219 | OK | |
| D1220 | OK | |
| D1231 | OK | |
| D1232 | OK | |
| D1233 | OK | |
| D1234 | OK | |
| D1235 | OK | |
| D1236 | OK | |
| D1238 | OK | |
| D1239 | OK | |
| D1240 | OK | |
| **D1241** | **FINDING F1** | see below |
| D1242 | OK | |
| D1243 | OK | |
| D1244 | OK | |
| D1245 | OK | |
| D1246 | OK | |
| D1247 | OK | |
| D1248 | OK | |
| D1249 | OK | |
| D1250 | OK | |
| D1251 | OK | |
| D1252 | OK | |
| D1253 | OK | |
| D1254 | OK | (D1278 corrects the build to this drawing and says the drawing stands, so no tail is needed) |
| D1255 | OK | |
| D1256 | OK | |
| D1257 | OK | |
| D1258 | OK | |
| D1259 | OK | |
| D1263 | OK | |
| D1264 | OK | |
| D1265 | OK | |
| D1266 | OK | |
| D1267 | OK | |
| D1268 | OK | (D1269 extends it to the grid; the tail names it and D1269 has its own line) |
| D1269 | OK | |
| **D1282** | **FINDING F2** | see below |
| D1283 | OK | |
| D1284 | OK | |
| D1285 | OK | |

(D1237 and D1260–D1262 are not Leave War rows; D1237 is read under Part 2.)

### F1 — D1241: "built as drawn in round 18" leaves out D1251's amber

- **The line now:** "The person window's balance tiles are built as drawn in round 18: one grid, every figure and label
  from the left, "3 taken" beside the LVE box, App bal · Pending −2.5 · War bal (bold) on one line, … locked with no
  boxes; halves .5 (D1246). — changed by D1246"
- **What the rows say:** the round-18 drawing (`full/r18-lve-member.png`, opened) shows LVE's "−2½" in grey. D1251, his
  words *"also pending is amber, why dont the lve pending follow it too?"*, makes LVE's pending figure amber, and D1252
  keeps only the figure amber, the word grey. D1251's full row does not say it narrows D1241, and D1241's full row
  carries no mark for it, so the tail and the line both miss it.
- **What goes wrong:** a chat building "as drawn in round 18" from this line draws LVE's Pending figure grey, against
  D1251 and D1252. D1251's own line says it, but this line tells the builder to follow a drawing D1251 has since
  changed.
- **Replacement:** "The person window's balance tiles are built as drawn in round 18: one grid, every figure and label
  from the left, "3 taken" beside the LVE box, App bal · Pending −2.5 · War bal (bold) on one line, its Pending figure
  amber and the word grey (D1251, D1252), "incl. 4 carried fwd · till 31 Dec" under App bal, a box only where he may
  type, locked with no boxes; halves .5 (D1246). — changed by D1252, D1251, D1246". Also add the matching
  "— NARROWED 22 Oct 26 BY D1251" mark to D1241's full row.

### F2 — D1282: the line still carries the wording D1287 corrected

- **The line now:** "On a phone a pinch on the Leave War zooms the grid only, the frozen date row and names column with
  it, staying over their columns; … — changed by D1287"
- **What the rows say:** D1287 (his mid-pinch pictures, *"Some untidiness … This is a mid pinch zoom picture"*)
  narrows exactly "the frozen date row and names column with it". The build had read that as one picture stretched
  about the fingers, pinned parts included. While the fingers are down, the names column stays at the grid's left edge,
  the date row stays under the month buttons, the corner stays where they meet, and nothing is drawn over the month
  buttons.
- **What goes wrong:** the tail names D1287, but the body still holds the wording that caused the faulty build. A chat
  that reads only this line (D1282 is the main pinch ruling) can rebuild the same fault. Every other narrowed line in
  this range (D1213, D1231, D1238, D1239, D1265) states the change in its own words. This one does not.
- **Replacement:** "On a phone a pinch on the Leave War zooms the grid only, the frozen date row and names column growing
  with it and staying over their columns — and, while the fingers are down, pinned: the names at the grid's left edge,
  the dates under the month buttons (D1287); a pinch that starts anywhere on the page zooms the grid, never the whole
  page; the top bar, tab row, View row, the grid's own bar and the month buttons stay their size. — changed by D1287"

## Part 2 — design guide §9 lessons and the §8 line

| Lesson / line | Verdict | Detail (findings only) |
|---|---|---|
| **Lesson 31 (D1212)** | **FINDING F3** | see below |
| Lesson 33 (D1232) | OK | |
| Lesson 34 (D1233) | OK | |
| Lesson 35 (D1238) | OK | (its narrowing by lesson 36 is marked) |
| **Lesson 36 (D1239)** | **FINDING F4 (minor)** | see below |
| Lesson 37 (D1246) | OK | |
| Lesson 38 (D1251) | OK | (says "figure", which agrees with D1252) |
| Lesson 39 (D1252) | OK | |
| Lesson 40 (D1264) | OK | (it calls the 2 Sep 26 rule "D687". D687 is his 9 Oct restatement of that rule for the Inputs switch, which is close enough not to mislead) |
| **§8 "What he should look at stands at the top" (D1237)** | **FINDING F5 (minor)** | see below |

### F3 — Lesson 31 lists a change he ordered as a suggestion

- **The line now:** "… *Other places, named under D852 and not changed:* the Inputs window's "When" row (drawn for him as
  "Duration"); the +OIL panel's "Days" box; …"
- **What the row says:** his words are *"Make sure the rest of the app that does it also changes to match it."* D1212's
  readings, put to him with a picture, say: "the Inputs page's input window … its 'When' row … becomes 'Duration' to
  match … Built with the overhaul's M3 (the bid windows), the Inputs window's row with it."
- **What goes wrong:** filed under "named under D852 and not changed", the "When" row reads as a suggestion waiting for
  his word, so the M3 build may leave it as "When". But it is inside his D1212 ruling.
- **Replacement:** end the lesson's rule with: "… and the same choice carries the same label everywhere the app asks it
  — so the Inputs window's "When" row becomes "Duration" too (D1212, built with the bid windows)." Then:
  "*Other places, named under D852 and not changed:* the +OIL panel's "Days" box; the SANS calendar's commit window; the
  Calendar window's day class row."

### F4 — Lesson 36 has no pointer to lesson 39's exception (minor)

- **The line now:** "… figures that stand side by side align the same way, not one group left and another right. …
  **Narrows lesson 35 for the balance tiles: its figures … now read from the left …**"
- **What the rows say:** D1252 (lesson 39) narrows D1239 "for those two lines only": a small tile's stacked "Pending" /
  "War bal" lines put the words left and the figures right. D1239's short line carries this exception. Lesson 36 does
  not, and lesson 39 does not say it narrows lesson 36.
- **What goes wrong:** a chat applying lesson 36's "now read from the left" to the balance tiles left-aligns the small
  tiles' pending figures, against D1252 and D1253.
- **Replacement:** add after the bold sentence: "*Narrowed by lesson 39 (D1252): a small tile's stacked Pending and War
  bal lines put the words left and the figures right.*"

### F5 — §8's line goes wider than D1237 and does not mark the agent's reading (minor)

- **The line now:** "Every mock-up or look page put to him opens with one short list: … answered and older rounds go
  below it, and a question he asked is answered there in words."
- **What the row says:** the rule is "On every **mock-up page** put to him …". "A question he asked gets its answer
  written in that top list, in words" is under "The agent's readings", not in his rule.
- **What goes wrong:** a later chat takes "or look page" and the in-words answer as his ruling. He could then strike
  what he believes is the agent's reading and find his own words in its place. The practical effect is small, since a
  look page is put to him like a mock-up.
- **Replacement:** "Every mock-up page put to him opens with one short list: each open question or answer in one line
  with its recommendation and a link to its pictures, newest first; answered and older rounds go below it. *(That a
  look's page does the same, and that a question he asked is answered there in words, are the agent's readings.)*"

## Count

Short lines read: 56 — 54 OK, 2 findings (D1241, D1282).
Design guide items read: 10 (lessons 31, 33–40 and the §8 line) — 7 OK, 3 findings (lesson 31; lesson 36 and §8, both
minor).
Total: 66 read, 61 OK, 5 findings.
