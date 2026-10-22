# Leave War M2 ("how it looks") — the independent scenario design, 23 Oct 26

Written by a scenario designer that did not write the code (bug-check order §8.5), read-only, for branch
`claude/lw-m2-looks` at `37f4e7894` — M1's base `4a827bb11`, then M2: Ack gone and look F (`5042a50e4`), the navigation
(`999737dfc`), D1227's bubble (`c37e3e48f`), and the two pieces built in parallel and since merged — batch 3, the
Required / Available rows (`8b18f5800`…`2063a94d9`), and D1164, an HO's half (`9855e42b5`, `37f4e7894`). Both parallel
pieces were on the branch by the time this was written, so their scenarios are written against the built code as well
as the rulings. Not a finding (D56): harm living only in stored demo data when the code is right going forward.

Sizes: phone 390×844, desktop 1536×864 (and his PC's 125% — memory note), plus 431–700 where a top row is measured
(D1016, D1019) and a short screen (844×390, a phone on its side) for the bar and the frozen header. Roles: admin `ad`/`a`
(Saber, has a row), member `us`/`us` (Ranger). "Undo" means the app's top-bar Undo.

---

## 1. The roll-call (§6) — every place that draws or reads what M2 changes

| # | Place | Must now show | Must not |
|---|---|---|---|
| R1 | Grid box — whole day, each kind (LL, OL, OIL, FO, HO*, CCL/FCL/PL/CL/EL, CSE, OD, B/C/OML/HL, ATT B as "B") | look F colour by kind, filled = approved/filed/credited/medical/course/OD | old green "approved", purple Ack, cyan credit |
| R2 | Grid box — each state (approved, pending, refused) | filled / hollow dashed / grey struck | a refused bid in its kind's colour |
| R3 | Grid box — halves | AM top half, PM bottom half, smaller letters, no `<`/`>`/`*` arrows | the old asterisk/arrow print; a half that reads as a whole |
| R4 | Two entries on a day | AM+PM top/bottom; two whole days side by side; whole + HO, HO in its half of the right side; no "+1" | "+1" when both are drawn; one box hiding the other |
| R5 | Three or more entries | one box + "+n" corner, tap opens the day's list | two boxes plus a "+1" that miscounts |
| R6 | Corner marks — grey "+n", amber "!" (clash, replaced-bid notice), PO ribbon on last day, PO tag on leave after posting out | each readable over every kind, incl. amber leave and a right-hand half box | covering a half box's letters unreadably |
| R7 | Posted-out days ("gone" hatch, bare "PO" text) and "not yet arrived" blanks | hatch, "PO" legible and centred in its cell | "PO" pushed to a corner/clipped now the box is absolutely placed |
| R8 | Inputs-page edge (blue left edge) and the moved edge (gold dotted) | on the box, both sizes; D1175: a thin dark outline so they show on amber leave | edge lost on amber LL/OL; edge missing on the second box of a two-entry day without a reason |
| R9 | Closed-day dim + lock, open-bidding green outline (M1) | unchanged by look F; outline still rounds the open dates, now with Manning rows between dates and people | outline cut short/misplaced after the row order change or a Manning fold |
| R10 | Frozen header copy (the mirror that follows a scroll, both sizes) | the dates alone (no month band, no Balances fold), columns lined up | the band row or "FIGURES" back; misaligned dates |
| R11 | Grid row order (D1256, D1257) | month buttons → dates → Manning rows → Event rows → people; no month band row | Manning above the month buttons; "JAN" band row |
| R12 | LVE beside each name (D1245) | the two small LVE lines stay | the Balances / FIGURES fold or its columns on the grid |
| R13 | Grid bar (D1254, D1243) | [▸/▾ Manning \| n red ›] · open dates · … · Legend; zoom −/+ at right end until pinch (D1228 deferred) | "Under-manned" label, a disabled "0 days" chip; ⚙, OIL, Rearrange on the bar |
| R14 | Manning red count + its list | red days only: Manning rows, Available P/W at red; list line names row + figure; tap jumps; no red → "Manning" alone | amber days counted; Available amber counted |
| R15 | Manning fold on a phone (D1258) | folded by default for everyone, remembered per person on the device; desktop opens as today | one person's choice leaking to another; desktop starting folded |
| R16 | D1227 bubble | under Manning after a bid window closes having turned a Manning/Available row amber or red; opens the rows; gone at next tap | after a window that changed nothing; after an improvement; claiming a change made by Undo/another tab |
| R17 | Top row — tabs (D1254) | Grid · OIL now (Approvals M4, Balances M5), Inputs-page tab look, OIL lit while the tracker is up | a tab with nothing behind it; two tabs lit |
| R18 | ⚙ at the tab row's end | admin only; opens Settings | ⚙ for a member; ⚙ still on the grid bar |
| R19 | View + period picker (D1174, D1244) | "View" on both sizes; admin's list ends "+ New period" opening the new-period window | "Period"; a "+"/"+ New" button on the row; "+ New period" for a member |
| R20 | "Viewing as" chip (D1173) | gone, both sizes | anywhere on the Leave War top (the counter window's own title stays) |
| R21 | My leave (D1141, D1227, D1254) | LVE · OIL · n pending (days, .5) · next date; desktop row 1 right, phone line 2 beside View; tap opens the person window | ½; requests counted instead of days; overflow at 390 |
| R22 | Rearrange (D1254) | a line in ⚙ "⇅ Rearrange the grid"; "Done" on the grid bar while on; Manning forced open | Rearrange button on the bar at rest; no way out |
| R23 | Legend (r7-07) | colour/fill/size/dates/left edge sections drawn with the grid's own box; every code in the glossary in its kind's colour | Ack line; "*LL / LL*" or arrow explanations; columns of the gone Balances fold |
| R24 | One-day bid window (BidPicker) Decide row | Approve · Refuse | Ack; `decide-ack` |
| R25 | Drag-selection window (SelectSheet) Decide row | Approve · Refuse | Ack |
| R26 | Day's list (DayList) | "bid pending" / "bid refused"; Approve, Refuse, Move, Delete; HO line names its half | "acked", Ack button |
| R27 | +OIL panel in the admin's bid window | Half row AM/PM when HO; default the other half beside a half-day leave, else AM | half row on an FO |
| R28 | OIL tracker — grant form, editor, lines | AM/PM pick on 0.5; line shows "AM"/"PM" by the date | half on an FO; default lit that is not what saves |
| R29 | Person window (today's, until M5) | opened by My leave and by a name; its figures agree with My leave | different LVE/OIL from My leave |
| R30 | Available P/W cells (D1190, D1191, D1202) | amber under Required+amber, red under Required+red, "+0" red default | a filled box (Manning look); colour on a no-fly / no-Required day |
| R31 | Available row's window (CounterForm) | Amber and Red point boxes, "Red is set at or above amber…" line, the SANS line (D1154) | a fixed-number amber/red; saving a bad value |
| R32 | Required rows' names (D1193) | admin tap on the name opens a rename window; phone "Req P" only while original; every window naming the row (FlyEdit pad, ReqPanel, CounterForm SANS line) reads the new name | figures editable from the rename window; member able to rename |
| R33 | Pair tints (D1194) | Req P + Avail P olive, Req W + Avail W green, faint; red/amber readable | tint on a counter row dragged between the four |
| R34 | SANS calendar / SANS day / Calendar window | the same "still needed" figures before and after any point change; SANS day keeps its own words (D626) | still-needed moving because amber/red points changed |
| R35 | Bell / change history / Undo words | an old notice reads as pending; Undo names a points save or a rename sensibly | "acknowledged" in a new line; "a change" for the new commands if a better name exists |
| R36 | Inputs page and Inputs month | war-approved leave as today (Inputs' own look) | look F leaking onto the Inputs page |
| R37 | NoWar page ("No leave period yet") | admin's "Create the first period" still works | the top row's tabs on an empty store throwing |

---

## 2. The scenarios

P1 = must walk. P2 = walk if the sizing step allows, else name the test that carries it (§7.0).

### A. The box (look F, halves, two entries, marks)

1. **P1 · admin · both sizes.** Open the Legend's colour section beside the grid; for each kind in R1 find a real cell on the
   demo grid (or place one) and confirm the box's colour equals its Legend swatch. Picture per kind.
2. **P1 · admin · both.** On one LL bid: leave pending (hollow dashed, light amber) → Approve (filled amber, blue
   edge absent, war-approved) → Back to bid → Refuse (grey, struck) → Undo ×3 → Redo ×3. Each step the box matches, no
   purple anywhere. Reload at the end: the same state.
3. **P1 · member · phone.** Place a whole-day LL, an AM LL and a PM LL on three open days of his own row. Whole fills the
   cell; AM the top half; PM the bottom half; letters smaller; no arrows/asterisks printed. Zoom one step in and out —
   letters readable at the phone's default zoom (D1167: "cramped, checked on his phone" — picture for his look).
4. **P1 · admin · both.** One day, AM LL bid + PM OIL bid: top/bottom, each its own fill. Then approve only the AM: fills
   differ correctly. No "+1".
5. **P1 · admin · both.** Two whole days on one day (leave during a course filed on the Inputs page; or an FO given by hand
   on an approved OL day): side by side, each full height, own colour. Three-letter code (CSE, CCL, OIL) a step smaller
   and fits; no "+1".
6. **P1 · admin · both.** Whole-day LL + HO morning → HO top-right; change the HO to afternoon → bottom-right. Picture both.
7. **P1 · admin · both (break: three entries).** Add a third record (e.g. a refused bid in the other half, or a notice
   from a clashing Inputs-page entry): the cell shows ONE box + "+2"/"!" corner, the tap opens the day's list listing all
   three. Delete one → two boxes, corner gone. Undo → back to one box + corner.
8. **P1 · admin · both.** A day with two entries and an amber "!" (clash): both boxes drawn AND the "!" kept, and the "!"
   does not hide the right-hand box's letters (look at a right-AM HO under the "!").
9. **P1 · admin · both.** Posted-out man (a seeded PO, or post one out through the app): days after his last read "PO"
   with the hatch, centred and legible; his last day wears the PO ribbon; leave dated after posting out shows its box with
   the PO tag, and the tag does not swallow a bottom-right half box.
10. **P1 · admin · both.** Inputs-page-filed LL (blue left edge) and an approved LL moved to another day (gold dotted edge):
    both edges visible on light amber AND deep amber (OL). D1175's thin dark outline present — look closely (zoom picture).
11. **P2 · admin.** Two-entry day where the second entry is the Inputs-page one (LL bid + CSE filed on Inputs): does the
    CSE box carry the blue edge? Record what shows; see §3 M5.
12. **P1 · break · admin.** HO and a half-day leave on the SAME half: give an AM LL, then +OIL HO and press AM (against the
    default). Screen must not draw two boxes on top of each other; expected: one box + "+1", the day's list naming both
    halves. Then the other order: HO AM first, then file AM LL. Record exactly what shows (D1164's reading "takes the other
    half" is only a default — see §3 M3).
13. **P2 · admin · desktop.** Columns: a column holding a three-letter whole box is no wider than one holding none; the
    Manning figures and the open outline still line up under the dates across a month with many boxes.
14. **P2 · admin · desktop.** Performance: scroll the whole year, open/close Legend, drag-select a block — no visible stall;
    browser error list empty (§E — node count is the e2e band's job, name the test).
15. **P1 · break · stored Ack.** Load a store holding a request saved as `acknowledged` (seed one through the probe bridge
    before the walk, or an old saved world): the cell is hollow dashed (pending), the day's list says "bid pending", the
    Decide row offers Approve · Refuse and both work; the bell's old "replaced" notice for an acked bid still reads.

### B. Halves of an HO (D1164)

16. **P1 · admin · both.** +OIL in the bid window on a day with an AM LL: type 0.5 → Half row appears with **PM** lit; save
    → HO box bottom half. On an empty day → AM lit by default. Type 1 → Half row gone; save → FO whole box.
17. **P1 · admin · both.** OIL tracker grant form: 0.5 to two people, one with an AM leave that day and one without → the
    chips light neither (defaults differ); save without picking → each takes his own default (check both cells). Then a
    single person, pick PM → saves PM.
18. **P1 · admin.** OIL tracker editor: change an FO to 0.5 without touching the half → the half saved equals the chip that
    was lit; change its date in the same edit to a day holding a PM leave → which half is saved? It should be the free half
    of the NEW date (see §3 M4). Change 0.5 back to 1 → half dropped, whole box.
19. **P1 · admin.** Day's list Edit… on an HO: switch AM→PM → box moves; Undo → back; Redo. The list line reads "HO —
    …, afternoon".
20. **P1 · admin.** An app-credited HO (publish a weekend morning duty that earns HO; then one starting 13:00): first draws
    top half with the star, second bottom half; the OIL tracker line shows AM / PM. A worked stretch 10:00–14:00 → AM.
21. **P2 · member · phone.** His own HO award opens read-only and names its half; no Half chips for him.
22. **P2 · admin.** An HO given before D1164 (stored without a half) reads as the morning everywhere (grid, list, tracker).

### C. The Available and Required rows (D1190–D1194, D1202, D1243)

23. **P1 · admin · desktop.** Available P's window: Amber "+ 2", Red "+ 0", Save → days with 0–1 to spare turn amber,
    days under Required red; a no-fly day and a day with no Required show neither. Undo → amber gone; Redo.
24. **P1 · admin.** Red "+ 2", Amber "+ 1" → the window says "Red is set at or above amber, so amber never shows"; Save →
    no amber on the grid. Negative "− 1" red, "+ 0" amber → red only once two short.
25. **P1 · break · admin.** Type "abc", "+", "200", a blank red → the window refuses Save with its line; nothing saved.
26. **P1 · admin · both.** The red count: with Available P amber-only days → count unchanged; push a day to red (place
    enough bids) → "n red ›" rises by one; the list line names "Available P 23" (drawn r19c reads "23 of 24" — compare); a
    tap jumps the grid there. Remove the bids → count falls; at zero the right half vanishes, "Manning" alone.
27. **P1 · admin · both.** Rename Required P to "Pilots req" → row name, the typed-figure pad's title, the "Required P and
    W" panel title, the Available P window's SANS line all say the new name; phone shows the new name, not "Req P". Rename
    back to "Required P" (or blank) → phone shows "Req P" again. Undo/Redo the rename; reload keeps it.
28. **P1 · member · both.** Tap the Required and Available row names: nothing editable opens (no rename, no points).
29. **P1 · admin.** SANS calendar month and SANS day for a date before and after changing Available P's points: "still
    needed" identical; SANS day keeps its own words. The Calendar window's figures unchanged.
30. **P1 · admin · both.** Pair tints: Req P + Avail P one faint olive, the W pair green; red and amber figures readable
    over them. In Rearrange drag a counter between Req W and Avail P → that counter row has no tint, the four keep theirs.
31. **P2 · admin.** Two tabs open: change a point in one; the other's grid repaints amber/red after its next sync (or say
    it does not — D302-style two-tab rule, §6 "storage change adds a column per writer").
32. **P2 · admin.** Undo label for a points save and for a rename: read the top bar's Undo title — record the words.

### D. The top row and the grid bar

33. **P1 · admin · desktop 1536 and 125%.** One row: Grid · OIL tabs, View [period], spring, My leave, ⚙. No "Viewing as",
    no "+ New". Picture; nothing wraps.
34. **P1 · member · phone 390.** Line 1: Grid · OIL tabs (no ⚙). Line 2: View [JAN – DEC 26] + My leave. No horizontal
    page scroll (measure document width = 390).
35. **P1 · admin · phone 390.** Line 1 tabs + ⚙; line 2 View + My leave; no third line.
36. **P1 · break · admin.** Create a period with a very long name (the window's maximum): desktop row and phone line 2 do
    not overflow the screen; My leave stays visible or shrinks gracefully; no horizontal page scroll at 390 and 431–700.
37. **P1 · admin · both.** Period list ends "+ New period": choose it → the new-period window opens; Cancel → the picker
    still shows the current period (not "+ New period"); choose it again → opens again. Create → the new period is listed
    and selected. Member: no such line.
38. **P1 · both roles · both sizes.** OIL tab → tracker opens, OIL tab lit, Grid unlit; close the tracker by its ✕ /
    Escape → Grid lit. Open the tracker from a name's OIL figure (not the tab) → OIL tab lit too. Arrow keys on the tab row
    move between tabs and the focus follows (keyboard rule).
39. **P1 · both roles.** My leave: compare LVE and OIL with the same person's figures beside his name and in his person
    window; place a half-day pending bid → "0.5 pending" (never ½); approve it → pending 0, next date shown; refuse a bid →
    not counted, not "next". Bids in a second period count too (switch View).
40. **P1 · both.** My leave tap → his person window opens; with the OIL tracker already up, tap My leave → what is in front
    (record; nothing stuck behind).
41. **P2 · admin.** Signed in as an account with no row on the war → no My leave, row still laid out.
42. **P1 · admin · both.** ⚙ → "⇅ Rearrange the grid" → Settings closes, drag handles on, "Done" on the grid bar, Manning
    rows shown even if folded. Drag a person, Undo, Redo. Done → handles off; on a phone Manning folds back to his choice.
    On a phone the Done button shows only "⇅" — record whether it reads as a way out (§3 M9).
43. **P1 · member.** No ⚙ anywhere; no Rearrange; probe-bridge or keyboard cannot reach Settings.
44. **P2 · admin · both.** Zoom −/+ on the bar's right end works, disabled at the ends; still present (D1228 deferred to
    [LW-PHONE-PINCH-ZOOM]).
45. **P2 · both.** Short screen 844×390: the grid bar holds one line; Legend reachable; the open-dates chip not clipped.

### E. Row order, Manning fold, frozen header

46. **P1 · admin · both.** Top to bottom: month buttons, dates, Manning rows (counters and the four), Event rows, people.
    No "JAN" band row; first date reads "JAN THU 01". Picture both sizes (compare r21-rows-*).
47. **P1 · admin · both.** Scroll the people down: the frozen header shows the dates only, lined up with the columns, at
    zoom 1 and one step out; the Manning rows scroll away under it. Toggle Manning while scrolled → header still aligned.
48. **P1 · admin · both.** Open-bidding outline: top at the dates, runs down through Manning and Event rows to the last
    person; fold Manning → outline re-placed (no gap, no overhang); unfold → again.
49. **P1 · break · phone.** Same phone: sign in `ad` → Manning folded → open it → sign out → sign in `us` → folded (his
    own) → open, fold → sign out → `ad` → open. Reload each time: each person keeps his own. Check the browser's storage
    key carries the person (not `lw:manning:` with an empty id).
50. **P1 · desktop.** Manning opens by default at 1536 whatever the phone remembered; a toggle on the desktop is not
    remembered across reload (opens as today).
51. **P2 · phone.** Rotate 390→844 wide and back with Manning folded: no blank band, no stuck state.

### F. The bubble (D1227, D1258)

52. **P1 · member · phone, Manning folded.** Bid on a day that turns Available P (or a Manning row) amber: on closing the
    window Manning opens and the bubble names the row and colour; the next tap anywhere removes it. Picture.
53. **P1 · break · member.** Open the bid window and close it with no change (✕, Escape, outside tap): no bubble, Manning
    stays folded.
54. **P1 · break · member / admin.** On a day already red, delete his pending bid (or the admin Refuses a bid) so the row
    goes red → amber: expect NO bubble (it improved). Record the words if one appears.
55. **P1 · break · admin.** Open a bid window, then press the top-bar Undo (taking back an earlier delete that turns a row
    red), close the window: no bubble claiming "This bid turns…".
56. **P2 · break.** With the bid window open in tab A, make the day red from tab B; close A unchanged → no bubble.
57. **P1 · admin · phone.** Drag-select a block in his own row and fill it with LL that turns two rows red: one bubble naming
    both rows; Manning opens.
58. **P2 · member.** Move a pending bid (Move from the window, or drag) onto a day where it turns a row red: record
    whether a bubble shows (§3 M7).
59. **P2 · desktop.** Same as 52 at 1536: record whether a bubble shows on the desktop (§3 M8).
60. **P2 · keyboard.** After the bubble shows, use only the keyboard: it should not stay forever (record).
61. **P2 · phone.** Bubble shown while the grid is scrolled far down the roster: the Manning rows it opened are out of view
    — record what he sees.

### G. Ack gone in every window

62. **P1 · admin · both.** One-day window, drag-selection window, day's list: Decide is Approve · Refuse only; no purple
    anywhere; the Legend has no Ack line.
63. **P2 · admin.** History / changes window after Approve → Back to bid → Refuse: lines read sensibly, no "acknowledged".

### H. Legend

64. **P1 · both.** Open Legend at 390: sections Colour, Fill, Size, Dates, Left edge, Corner as r7-07; each swatch is the
    grid's own box. Scroll the glossary: FO, HO, FO*, medical, leave, other duty each in its kind's colour.
65. **P1 · both.** Legend must not explain arrows ("<LL" / "LL>" MORNING/AFTERNOON) the grid no longer prints, nor columns of
    the gone Balances fold ("The figures — each column") — record what is there (§3 M2).

### I. Undo / reload sweep

66. **P1 · admin.** After each of: a points save, a rename, an HO half pick, Rearrange drop, a new period — Undo, Redo,
    reload; the screen and the stored state agree.

---

## 3. What is missing or suspect (each with its ruling and where it should be)

- **M1 — D1175's reading: the thin dark outline on the moved edge and the clash corner.** `matrix.css` draws the gold dotted
  `::before` and `.mk.warn` with no dark outline. Should be in `leavewar/ui/matrix.css` (the `.c.moved::before`,
  `.c.raptor::before`, `.mk.warn` rules). Check on his phone (scenario 10).
- **M2 — the Legend's glossary still teaches the old grid (D1160, D1175, D1245).** `engine/codes.ts CODE_GLOSSARY`'s
  "Half days" group explains `<LL` / `LL>` arrows the grid no longer prints; `FO*` goes through `kindOf`, which reads an
  unknown code as duty grey, so it is drawn grey not green; HO is drawn as a whole box though an HO is now a half; and
  `Chrome.tsx` still lists "The figures — the colours / each column" for the Balances fold D1245 removed. The corner rows
  still use the old `.leg-sw` swatch, not the grid's box.
- **M3 — HO on the same half as a half-day leave (D1164).** Only the *default* takes the other half (`freeHalfFor`); the
  admin may pick the same half, and a leave filed after an HO never moves it (awards never move, D260). The grid then shows
  one box + "+1" (`pairPlaces` returns null). Not refused, not said. Whether that is acceptable is his — the pair is
  scenario 12.
- **M4 — an HO's default half after a date change.** `updateLedgerEntry` takes an FO→HO default from the OLD date
  (`defaultAwardHalf(cur.personId, cur.date, …)`); the OIL tracker editor's lit chip is also computed on `c.date`. Should
  use the new date (`state/store.ts updateLedgerEntry`, `ui/OilTracker.tsx`).
- **M5 — the second box carries no edge.** In `MatrixRows.tsx` only the main box gets `raptor`/`moved` marks; a two-entry
  day whose second entry was filed on the Inputs page or moved shows no edge (r7-04 draws "Leave during a course (from the
  Inputs page)"). Needs his look or a written reason.
- **M6 — the bubble reports an improvement.** `Matrix.tsx` compares `rule|day|verdict` keys, so a row going red → amber
  produces a new "amber" key and the bubble says "This bid turns … amber" after a delete or a refusal (D1227: "only when
  the input reduces the counter to hit amber or red"). It also fires on any change made while a window is open (Undo,
  another tab). Scenarios 54–56.
- **M7 — the bubble only follows a bid window.** A Move or a direct drag of a bid that turns a row red raises none (D1227
  "a bid of his"). Question for him or a written reason.
- **M8 — the bubble on a desktop.** D1227 / D1258 rule it with the phone's fold; the build raises it at every width. Not
  ruled either way — put to him with a picture.
- **M9 — "Done" on a phone is the ⇅ icon alone.** `.rtlbl` hides "Done" ≤700px, so the one way out of Rearrange (D1254)
  reads as the old toggle. Check against the drawing; a plain word may be needed.
- **M10 — the Manning memory's key is fixed at mount.** `Matrix.tsx` reads `lw:manning:<viewer>` once in `useState`; if the
  page mounts (pre-warm after login) before the viewer is known, the key is `lw:manning:` — shared by everyone on the device
  (D1258 "remembered per person"). Scenario 49.
- **M11 — the red list's wording.** Built "Available P 23"; drawn r19c "Available P 23 of 24" (D1243 "each with the row and
  figure"). Compare and decide.
- **M12 — SANS day words after a Required rename.** D1193's reading: "the SANS calendar and every screen that names the row
  read its own name"; `ui/SansDay.tsx` prints "Required to fly" (D626 kept "Available" there). Probably right as the SANS
  day's own words — say so in the evidence sheet.
- **M13 — the day's list keeps the old colours.** `bidpicker.css .dl-line.appr/.ref` are the old green/red edges while the
  grid is look F (D1175). The day panel is M3 (D1143), but a refused line edged red beside a grey grid box is worth a note.
- **M14 — the new commands' Undo words.** `lw.availrow` and `lw.reqname` have no line in `undo/describe.ts`; the Undo
  title falls back to a generic word. Scenario 32.
- **M15 — by the plan, not missing:** the Approvals and Balances tabs (M4, M5); the bid windows' look F buttons (D1183, M3);
  zoom buttons kept until [LW-PHONE-PINCH-ZOOM] (D1228); My leave opening today's person window (D1148, until M5).
