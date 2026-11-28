# The posting sheet, redesigned — the drawer's report (a fresh Fable through the design skill, 26 Nov 26)

Brief: `2026-11-26-msq-r6-posting-sheet-brief.md`. His D2648 — *"can we redesign this post out page. Likewise for leave
war. It's so ugly"*. Folder `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135`; nothing committed,
pushed or built; no file under `src` touched. The served app at 4700 was checked first: it is this folder's own preview.

Method: dual-agent (A: a fresh design reviewer, blind · B: the detector run, a Sonnet helper), then this drawer's own
look. The design skill's setup ran (`context.mjs`, Operate mode); the critique playbook's closing questions to the user
are not asked from here — `Questions skipped: a helper has no user to ask; the three questions for him are at the end`.
The skill's snapshot of the critique was not written into `.impeccable/critique/` (this report is its record).

Pictures: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/p6-*` — 20 pictures, each whole and `-crop` (40
files). `d` = desktop 1536×864, `p` = phone 402×874, both at scale 2. Scripts: `raptor-port/scripts/handpass/n176/`
`draw-r6-posting-today.mjs` (today, nothing drawn), `draw-r6-posting.mjs` (the three directions),
`draw-r6-posting-probe.mjs` (reads Admin → Users' own parts; draws nothing), words `words-r6-posting.mjs`. Every crop
was opened one by one; the 20 whole screens were opened as two contact sheets.

## 1. What is wrong with today's sheet

Today (`p6-d-today-postout`, `p6-p-today-postout`, `p6-d-today-postin`, `p6-p-today-postin`). The reviewer scored it
19 out of 40 on the usual ten usability points; the detector found nothing (it reads code patterns, not layout). The
reviewer and I agree on every point below.

1. **The posting is a footnote on a leave sheet.** Post out opens under the day's leave controls — Remarks, "till 14
   Dec", Document, Whole day / AM / PM, Pick a range and eight coloured leave buttons — which stay live and take about
   60% of the sheet. The title still reads "Cinch Mon 14 Dec" with Auto-approve; nothing says this is now a posting.
   A stray tap a thumb-width above "PO from" files leave.
2. **The button that does it is the weakest thing on the sheet.** "Post out" / "Post in" is a grey hatched chip, 87×32,
   at the bottom left. The hatch is the grid's posted-out pattern, but on a button it reads as greyed out.
3. **What will happen is the faintest text.** "On 14 Dec: archived, account suspended." is 11.5px in the dimmest grey,
   shut between two hairlines — for an act that can delete a man.
4. **A ladder of rules.** Every row has its own line above it: four rules in about 170px, and two together under the
   title. Boxes inside a box.
5. **The chips do not sit as a group.** Four widths (97, 59, 54, 106); on the phone "Transfer to Sqn" drops to a line
   of its own and starts at the sheet's left edge, under the word POSTING rather than under the other chips.
6. **Three control heights in three rows** — the date box 36, the chips 30, the button 32 — each starting from a
   78px label gutter that on a phone takes a quarter of the width.
7. **Post in** puts the button beside a three-line note on the phone; button and words share no edge.
8. **On Admin → Users (round 6's N6)** the copy is a second window hung over the list, covering the next six names,
   in the Leave War's parts rather than that page's.

What works and is kept everywhere: the date arrives filled from the day pressed; one plain line says what will happen
before the press; four short outcomes; the button sits where the thumb is on a phone.

## 2. The three directions

Each is drawn with Transfer to Sqn chosen and To 149, on the Leave War and on Admin → Users, desktop and phone. A
violet dashed ring marks what is new. In all three, shared:

- **The sheet is the posting's alone.** Its title reads "Cinch  Post out"; the leave controls step aside while it is
  open. *This is a change in what the sheet shows, not only how it looks — named here, not drawn silently:* today the
  leave buttons stay pressable above an open posting. The ✕ closes it as today; pressing the day again gives the leave
  controls back.
- **The rules between rows are gone**; one line stays under the title. Spacing does the grouping.
- **Every word is the app's own or round 6's.** Sizes are the app's own (measured: chips 30 tall, date box 36, the
  button 87×32 on a desktop — as today; on Admin → Users that page's own 28 and 40).

### A — tidied (`p6-{d,p}-A-war`, `p6-{d,p}-A-users`)
Today's order and labels, cleaned: PO from, Posting, To, the line, the button. The chips fill the row as one group (a
desktop) or stand two by two (a phone, no orphan). The line is a step brighter. **The button stays the grey hatched one.**
On Admin → Users the sheet hangs from the row's "Post out…" (a desktop) or sits at the screen's foot (a phone).
Changes least; fixes points 1, 4, 5. Leaves 2, 3, 6 and 8. Touches no ruling beyond the shared ones.

### B — a list (`p6-{d,p}-B-war`, `p6-{d,p}-B-users`)
The four outcomes as rows in one panel, the chosen one lit with a tick, "149 ▾" at the end of the Transfer row, the
line as the panel's foot, a main (cyan) Post out button. The choice and what it does are one block. It is the tallest
(353 against 282 for C on a desktop) and roomy at a desk. **It touches D294** — his own "use less words and space to
have these 4 options", which made them chips — and the menus rule (rows 38 tall are the look of a menu of actions).
Fixes 1–5; costs height; leaves 8.

### C — one grid (`p6-{d,p}-C-war`, `p6-{d,p}-C-users`, `p6-{d,p}-C-war-overseas`, `p6-{d,p}-C-postin`) — recommended
Labels sit over their controls, so nothing is lost to a gutter. Posting first: four chips, equal, one row at a desk and
two by two on a phone. Under them PO from and To side by side, each half the width — "To" appears beside the date when
Transfer is chosen, so nothing below moves (`-overseas` shows the same sheet without it: same height, 282). The line
stands on a slightly raised strip right above the button. Post out is the app's main button, in the posting button's
own size and place.
**On Admin → Users it is not a second window:** pressing "Post out…" turns the man's opened row into the posting form,
made of that page's own parts — the label over a box ("Role", "Post in"), its date box, its squadron list, its lit
chip (None · View · Plan's), its grey note, and its Post out · Cancel pair where Save · Cancel stand. The list under
him stays in view. One arrangement, each door in its own page's parts (lesson 68).
Post in takes the same shape: PI from, the note on the strip, the main button.

## 3. Recommendation — C

It is the one that reads at a glance on his iPhone and wastes nothing at a desk: one grid (four columns, or two), the
choice first, the two facts it needs on one line, the result right above the press. It is also the only one where
Admin → Users gets "a new interface of its own" (his D2634) rather than a copy hung over the list.

**Its cost.**
- The Leave War: a layout and style change to the posting parts of three sheets (a day's sheet, the drag sheet, an
  existing posting's sheet) and Post in's two; the parts keep their names, so the tests that press them should hold.
- Admin → Users: the in-row form is new work either way; it arrives with the Transfer step (D2634).
- Round 6's N6 (`u6-d-postout-sheet`) and the "It's him" sheet (`m6-d-itshim-sheet`) would be redrawn to it.

**The rulings it touches** (none in what the sheet does):
- **D300** and its approved mock-up (`docs/mock/post-out.html`): the order changes — Posting before PO from. The date
  in its own box, the one line and the plain "Post out" all stay.
- **The owner's direction of 18 Aug 26** (no number; in the stylesheet's note): Post out as "a muted grey chip set
  apart from the coloured bid chips". It was said when the button sat among the bid buttons; behind the ⋯, as the
  sheet's one action, it is drawn as the main button. His to confirm. (A keeps the grey.)
- **D1462** (a window opened on a day names the day in its title): the title now names the act; the day is in PO from.
- **D2634**: met; the hung sheet of round 6 is replaced on that page.
- **D1626–D1628**: unchanged — the Delete chip, the PO from date and the Post out button are all still there for the
  "Delete Cinch?" card to hang from (in B it would hang from the Delete row).
- **D487**: no button changes size. **D294, D298, D303, D1709, D306, D328**: unchanged (a ground-crew man's three chips
  would be three equal columns, or two and one on a phone — not drawn).

## 4. Every word

`words-r6-posting.mjs`. **One word is new: the title "Post in"** (the head of the Post in sheet; today the head shows
the day). Reused from round 6's words: the title "Post out", "To", "Post out…", "On 14 Dec: moves to 149 with his
sign-in." The app's own, unchanged: "PO from", "PI from", "Posting", "Overseas Sqn", "Delete", "SANS", "Transfer to
Sqn", "Post out", "Post in", "Cancel", "On 14 Dec: archived, account suspended.", "Their first day in the squadron.
Days before it are blank and count nobody — leave can still be dated there."

## 5. FACT, a line per picture

All boxes in screen pixels (the pictures are twice that). Every run closed the real sheet with nothing posted
(`closedNothingPosted: sheets 0`).

- FACT `p6-d-today-postout`: the real sheet, untouched; 560×404; Overseas Sqn is chosen as the app opens it; line "On 14 Dec: archived, account suspended."; Transfer to Sqn greyed.
- FACT `p6-p-today-postout`: the real sheet, untouched; 378×426; "Transfer to Sqn" on a row of its own.
- FACT `p6-d-today-postin`: the real sheet, untouched; 560×328; the button beside a two-line note.
- FACT `p6-p-today-postin`: the real sheet, untouched; 378×337; the button beside a three-line note.
- FACT `p6-d-A-war`: sheet 560×266; chips 122, 84, 80, 144 wide, 30 tall, one row; date 122×36; To 59×36; button 87×32, the hatched grey kept.
- FACT `p6-p-A-war`: sheet 378×298; chips 131 wide, two by two; button 88×30.
- FACT `p6-d-A-users`: the same sheet, its look frozen, hung 10px under the row's "Post out…"; 560×266.
- FACT `p6-p-A-users`: the same sheet at the screen's foot; 378×298.
- FACT `p6-d-B-war`: sheet 560×353; four rows 38 tall in one panel; To 57×28 at the Transfer row's end; main button 87×32, the app's main-button colours (rgb 59,198,232 on rgb 5,42,52).
- FACT `p6-p-B-war`: sheet 378×351; main button 88×30.
- FACT `p6-d-B-users`: the same sheet hung under "Post out…"; 560×353.
- FACT `p6-p-B-users`: the same sheet at the screen's foot; 378×351.
- FACT `p6-d-C-war`: sheet 560×282; four chips each 129×30; date 262×36 and To 262×36 side by side; the line's strip 534×35; main button 87×32.
- FACT `p6-p-C-war`: sheet 378×308; chips 173 wide, two by two; date 171×36, To 171×36; main button 88×30.
- FACT `p6-d-C-users`: the form inside Cinch's opened row, 584×200; that page's chips 106, 62, 59, 114 wide, 28 tall, the chosen one its lit chip; date 287×40, To (a real list holding 149 and 150) 287×40; Post out 74×28, Cancel 65×28.
- FACT `p6-p-C-users`: the form 328×225; chips 161×28, two by two; date 159×40, To 159×40.
- FACT `p6-d-C-war-overseas`: as the real sheet opens (✓ Overseas Sqn, the app's own line); sheet 560×282, the same height as with To; date 262×36 alone on its line.
- FACT `p6-p-C-war-overseas`: sheet 378×308.
- FACT `p6-d-C-postin`: sheet 560×236; date 262×36; the app's own note on the strip, 534×51; main button "Post in" 77×32.
- FACT `p6-p-C-postin`: sheet 378×231; date 171×36; main button 79×30.

How each is made: the real sheet is opened by Hunter's presses (Cinch, Mon 14 Dec → ⋯ → Post out) and its own date
box, chips, line and button are laid out again in place; A's and B's Admin pictures are that sheet's look frozen and
placed; C's Admin form is built from Admin → Users' own parts. The Transfer chip is greyed in the app today and is
drawn pressable and chosen; "To" and its line are drawn.

## 6. What I could not draw, and what is not drawn

- **The "To" list opened.** It is the browser's or the phone's own list (lesson 104), which a picture from here cannot
  show. Closed, it is drawn in the date box's look on the Leave War and as the page's own list on Admin → Users.
- **His iPhone's own look of that list on Admin → Users.** The phone pictures show it as the test browser draws it
  (grey), as every list on that page is pictured from here (Role, Home squadron); his iPhone draws its own.
- **Not drawn in the new look:** the "Delete Cinch?" card, the amber "blocked" line (the last admin), an error line,
  a ground-crew man's three chips, no outcome chosen, an existing posting's sheet ("Undo post out (PO)"), the drag
  sheet's posting, Post in on Admin → Users, direction C's Admin row before the press (round 6's `u6-d-postout` shows it).
- **A note for the build:** in the phone's test browser the tick makes the chosen chip 2px taller than its neighbours
  (30 against 28); the build should hold one height.
- **Raised by the reviewer, not drawn — his to rule:** the chips are 30 tall, under a comfortable thumb's size, and
  kept so (D487); Delete looks like SANS until it is pressed (a colour for it would be a new meaning of red, and the
  Leave War's own Delete is ruled never red, D332).
- A stale first run of `.tmp/n176-draw/p6-facts.txt` holds earlier "overseas" lines; the lines above are from the last
  runs (`p6-facts-overseas.txt`, `p6-facts-postin.txt`, `p6-facts-today.txt`).

## 7. Three questions for him (each needs its picture beside it)

1. Which direction — A, B or C (recommended C)?
2. Post out as the app's main button, or kept grey (his 18 Aug direction)? Recommended: the main button.
3. On Admin → Users: the form inside the man's row (C), or a sheet hung from the button? Recommended: inside the row.

## After the host's look

The host's note (26 Nov 26): direction C drew two looks — Admin → Users in that page's own parts (a filled chip with no
tick, the browser's own list for "To"), the Leave War in the sheet's parts — while his D2648 asks for ONE design for
both doors. Redrawn; what section 2 and section 5 say of `p6-{d,p}-C-users` is replaced by this.

- **`p6-d-C-users` and `p6-p-C-users` are re-made** with the Leave War's own C parts inside Cinch's opened row: the same
  outlined chips with "✓ Transfer to Sqn", "To" in the same box with ▾ as PO from, the line on its strip. The row keeps
  its own foot pair, Post out · Cancel. Both crops and the phone's whole screen were opened.
- **One thing differs, and why:** the strip's colour on the sheet is the same as an opened row's background, so in the
  row it would not show; there it takes the sheet's own colour, one step darker than the row. On the sheet it reads as
  raised, in the row as set in. The build should name one rule: the strip is one step off what it lies on.
- **The foot buttons** are the row's own pair (74×28 and 65×28), as every opened row's are; the Leave War's Post out
  stays 87×32. His to rule if the pair should match the sheet's size.
- **`p6-{d,p}-C-postin` checked against `p6-{d,p}-C-war`:** same title strip, the same label over the same date box at
  half width (262×36 a desktop, 171×36 a phone), the note on the same strip, the same main button. No change needed.
- The section 6 caveat about the phone's grey list on Admin → Users no longer applies to C: "To" is now the app's box.
  Opened, it is still the browser's or the phone's own list, not drawn.
- FACT `p6-d-C-users`: the form 584×205 in the row; four chips each 142×30, the chosen "✓ Transfer to Sqn"; date 287×36 and To 287×36; the line's strip 584×35; Post out 74×28, Cancel 65×28.
- FACT `p6-p-C-users`: the form 328×233; chips 161 wide, two by two; date 159×36, To 159×36; strip 328×35; Post out 74×28, Cancel 65×28.
- Script: `draw-r6-posting.mjs` — `rowFormWar` draws it (the war sheet's parts, their look frozen, laid at the row's
  width); the first drawing's `rowForm` is kept in the file but no longer run. `p6-{d,p}-C-war` were re-made by the
  same run and are unchanged.
