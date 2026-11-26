# Admin → Users across squadrons — the new order, the folds and the jumps, drawn on the real app: the designer's report (a fresh Fable; chat 188, 26 Nov 26)

Brief: `2026-11-26-msq-r6-users-nav-brief.md`. Nothing under `src`, nothing committed, no branch switched. The posting
sheet is not drawn anywhere here (the other Fable's).

## How it was made
- **Server:** `http://localhost:4700/` answered; used as it stood, nothing started, stopped or rebuilt.
- **Design skill:** loaded (`impeccable`, Operate mode). Its "shape" step wants an interview first; there is nobody to
  ask in a helper's run, so the brief stood in for it. Said here so it is not missed.
- **Scripts (mine):** `raptor-port/scripts/handpass/n176/draw-r6-nav.mjs` (the pictures), `draw-r6-nav-probe.mjs` (a
  read-only look at what the page is made of today), `words-r6-nav.mjs` (the new words). Re-run:
  `node raptor-port/scripts/handpass/n176/draw-r6-nav.mjs` (`ONLY=149,142,mid,jump,fold,search`, `DIRS=A,B,p`).
- **The world:** round 6's (`.tmp/n176-draw/r6-users-state.json`), read only. Round 6's drawn-not-real facts are kept
  (Cinch to 149 on 14 Dec, Raven to 150 on 4 Jan, Mako's View of 149). **Two more are drawn on 142's page only, so that
  page shows every group: Mako (150) posting in to 142 on 4 Jan, and Kestrel (149) holding View of 142.** This differs
  from round 6's picture 7, which showed 142 with nobody from outside — one of the two has to give before he sees both.
- **Parts:** every part is the page's own, moved or cloned — the search row, Filter, round 5's "+ Add a person", the
  headings ("People · 10"'s own look), the short rows, the amber tag, the folds ("▸ Archived"'s look), the page's rule.
  The jumps are the app's filter chip. What is new is listed under "New parts".
- **Violet dashed rings** (2px `#8B5CF6`) mark what is new since round 6's drawings: the search where it now sits, the
  jumps, and each heading that now folds. The new ORDER cannot be ringed — the caption has to say it.
- 17 pictures, each whole plus `-crop`, in `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/` — desktop 1536
  wide, phone 402×874, scale 2. All 34 files opened (the wholes one by one or on a sheet, every crop).

## 1. Critique — what reads badly in round 6's pictures once the own people come first
1. **The "one look" is gone on a big squadron.** Round 6 put "From other squadrons" on the first screen. With the own
   people first, on 142 it sits under sixty rows: about 3,100px down on a desktop (3½ screens), about 2,900px on the
   phone (3½ screens). His D2641 asked for "1 look u know who from external have control". The jumps have to give that
   back — so each jump carries its group's count, and the counts are on the first screen.
2. **Nothing says the three groups exist.** On 149 (10 people) Outgoing starts about 590px down on a desktop and off
   the phone's first screen. A first-time admin sees a list of people and no hint that there is more below.
3. **The search sat on the "People" row.** Under the new order it would sit above the people and filter groups three
   screens away from it. It has to leave that row for the very top (D2647 already says so).
4. **"People · 10 · search · Filter · + Add a person" was one crowded row.** With the search and the buttons moved up,
   "People · 10" becomes a plain heading like the others.
5. **Round 6's headings were plain words.** D2650 makes three of them fold, so they need the fold's mark.
6. **Two kinds of fold now sit side by side at the page's foot:** "▸ View only · 2 people" (inside "From other
   squadrons") and "▸ 142 · 60 people", "▸ 150 · 3 people" (everyone of another squadron, D2629). In round 6 they were a
   whole page apart. See "Open points" 1.
7. **The left column leaves with the page.** Measured today: Admin's left column scrolls away with the list (on 142 it
   is gone after the first screen). A jump list there is useless unless the column stays put.
8. **Raven shows twice on 149's desktop first screen** (his own row with the amber tag, then Outgoing). Round 6 had it
   too; it is correct (one fact, two places) but with the own people first the two rows are now close together.

## 2. The page, the same in both directions
Top to bottom (pictures `j6-d-A-149-crop`, `j6-p-149-crop` show the whole page):
1. **One row at the very top: search · Filter · + Add a person** (D2647, D2628, D926 — a page's controls one row). On
   a phone: search and Filter, then the jumps, then "+ Add a person" full width.
2. "Waiting for access", as today.
3. **"People · 10"** — a plain heading; it does not fold (he named three groups). The own list, then "▸ Archived" where
   the squadron has one.
4. **"▾ Outgoing · 1"**, **"▾ Incoming · 1"**, **"▾ From other squadrons · 4"** — each heading presses to fold, open by
   default, the count kept when shut.
5. The page's rule, then the folded squadrons "▸ 142 · 60 people", "▸ 150 · 3 people".

**The readings drawn, his to confirm (D2650's row lists them as the agent's):**
- Outgoing before Incoming, as he wrote it. (The host's example of the jump row had Incoming first.)
- "View only" stays one folded line; the other squadrons' headings stay folded (D2628, D2629).
- A folded heading keeps its count: "▸ From other squadrons · 4".
- Mine, new: **the folded squadrons go to the very foot, after "From other squadrons".** D2629 says "under its own
  people"; with three groups now under the own people, the foot is the only place they do not split the groups.
- Mine, new: **an Incoming or Outgoing group with nobody in it is not shown, and neither is its jump**; "From other
  squadrons" with nobody keeps its heading and round 6's line "Nobody from another squadron plans or views 142."
- Mine, new: **"Waiting for access" has no jump** — it is always at the top.
- Mine, new: **the bottom "Add a person" block is gone from the pictures** — round 5's button opens the form in place
  (D2628). With the button in the top row, the form would open under the top row, not under "People".

## 3. The two directions for the jumps

### Direction A — the jumps live in Admin's own left column (desktop); a row of jumps under the search (phone)
- **Desktop:** the lit "Users" card grows to hold a short list — People 60 · Outgoing 1 · Incoming 1 · From other
  squadrons 1 — the words starting where the card's own words start, the counts in one column at the right. The whole
  left column stays put while the page scrolls. One click runs the page to that heading; the jump of the group in view
  is lit as he scrolls.
- **Phone:** four jump buttons in one row under the search, sharing the row's width equally so all four always show.
  The search row and the jumps stay under the top bar while the list scrolls.
- Pictures: `j6-d-A-149`, `j6-d-A-142`, `j6-d-A-mid`, `j6-d-A-jump`, `j6-d-A-fold`, `j6-d-A-search`; phone `j6-p-149`,
  `j6-p-142`, `j6-p-mid`, `j6-p-jump`, `j6-p-fold`, `j6-p-search`.

### Direction B — one row of jumps under the search, on the desktop as on the phone
- **Desktop:** the same row of jumps as the phone, under the search row, the heading's words whole ("From other
  squadrons 1"). The two rows stay under the top bar while the list scrolls. The left column is left as it is today (it
  scrolls away).
- **Phone:** the same as A.
- Pictures: `j6-d-B-149`, `j6-d-B-142`, `j6-d-B-mid`, `j6-d-B-jump`, `j6-d-B-search`. (No `j6-d-B-fold`: a fold looks
  the same in both.)

### What a jump does, in both
- **Pressed:** the page runs to the heading by the browser's own smooth scroll (about a third of a second; with less
  motion switched on it is there at once, no run). The jump stays lit — the lasting sign, so motion is never the only
  signal (the guide's §5).
- **A jump to a folded group opens it.**
- **The last groups cannot reach the top of the screen** — there is not enough page under them. Measured on 142:
  "Outgoing" lands 312px down a desktop screen and 333px down the phone's, not at the top. So the heading reached needs
  a sign of its own: **its words stand white for about a second, then go back to grey** (steady, no ring, no glow, no
  size change; the same with less motion). Drawn white on the three `-jump` pictures. This is a new kind of mark and is
  his to rule (D876's "a new kind of mark is his to rule"); its nearest relative is D2628 C10's "bright white about a
  second, then grey".
- **Folding** is at once, as "▸ Archived" opens today — no new motion.
- **Keyboard:** every jump and every folding heading is a button, reached by Tab, pressed by Enter or Space, with the
  app's own focus ring; a screen reader hears the list named "On this page" and the lit jump as the current one.

### The search, in both (`-search` pictures: Kestrel types "Bol")
- A group with no match hides (D2647): the own people, Outgoing, Incoming and "Waiting for access" are gone; "From
  other squadrons" shows "▾ View only · 2 people" opened on Bolt; "▾ 142 · 60 people" opened on Bolt.
- **The jumps of hidden groups go grey and stay where they are** — nothing moves under the hand; the first group still
  showing is lit.
- **Headings and folds keep their whole counts while he searches** ("From other squadrons · 4", "142 · 60 people"),
  because the page does that today: checked — with "Bol" typed, today's heading still reads "People · 10".
- Typed nothing anybody has: one line, today's own words "Nobody matches." (not drawn).

## 4. Recommendation — Direction A
**Desktop: the jumps inside the lit "Users" card, the left column staying put. Phone: the row of four under the search,
pinned with it.** It is what he asked for (a left bar), and on the pictures it is the better of the two:
- It costs the desktop no height. B keeps 93px under the top bar for good (10.8% of his 864-high screen).
- The left column has the room and nothing else to do — four cards and empty space under them.
- The jumps sit apart from "Filter". In B they are filter chips in a row right under the Filter button, and a lit
  "Outgoing 1" there can be read as "showing only Outgoing".
- A column that stays put helps every Admin tab: on a long page he can go to Squadrons or Data without scrolling up.

**What A gives up:** the desktop and the phone differ (a list at the left, a row at the top) — the phone has no left
column, so they must. And in A the desktop's search scrolls away with the page; one click on "People" brings it back.
If he wants the search always in reach on a desktop too, the search row alone can be pinned (36px + its padding) —
his choice, not drawn.

**Cost of A (a build, not a tweak):**
- The left column made to stay put, and the "Users" card rebuilt as a card holding a button and a list.
- The lit jump following the scroll, and the run to a heading — with the less-motion case.
- The phone's pinned rows: the Users pane clips what is inside it today, which stops anything inside from staying put;
  that clipping has to change, and the "nothing pinned leaks" check (D1518) run on it at every zoom.
- The search moved out of the "People" row and made to filter five kinds of group; three folding headings.
- On the phone the pinned rows take 93px, 10.6% of his iPhone's screen, for as long as he is on this page.
- Its own walk and a drawing check on both sizes.
B is cheaper by the left column's work only.

**Rulings it touches:**
- D2650 — the order and the folds as he ruled; its readings above, and three of mine, to put to him.
- D2647 — the search at the very top; adds: jumps of hidden groups grey, counts kept while searching.
- D2629 — the folded squadrons move from "under its own people" to the page's foot. A change of place, his to say.
- D2628 C11 / D2599 — "+ Add a person" stays in the top row; on a phone it now comes after the jumps, and the form
  opens under the top row.
- D926 (a page's controls one row) — the phone's jumps are a second row under the controls. Read here as the page's
  tabs, which that rule allows beside the one row; his to confirm.
- D1518 (nothing pinned leaks) — the pinned rows are drawn with the pane's own colour edge to edge and a hairline
  under; D887 (no glow) — nothing glows; "one mark, one look" — the lit jump is the filter chip's "on" look on both
  devices; the white heading is a new mark, his to rule.
- D991 (smooth) — the run to a heading is the browser's own scroll, nothing drawn frame by frame; off for less motion.
- D2641 — the "one look" is kept by the counts on the first screen, not by the block's place.

## 5. Open points — where I would not decide for him
1. **Bolt shows twice when searched** (`-search` pictures): once under "View only", once under "142 · 60 people" —
   the reading told to him with D2647 ("a man in two groups shows in both"), drawn as told. Side by side it looks like
   a fault. My recommendation: while searching, a man who already holds a right shows once, in "From other squadrons".
2. **Two kinds of fold at the foot look alike** (critique 6). Nothing drawn for it beyond the page's rule between
   them. A plain heading over the squadrons would settle it but adds words; left for his word.
3. **The phone's fourth jump reads "Others"** — the heading's words do not fit four across 328px (measured: even
   shortened to "Other squadrons 4", the four at the chip's own size need 403px). The alternative is a row that slides sideways, as the bell's "Show" row
   does, with the fourth cut off at the edge — tried first and dropped, because the cut-off one was the very group he
   wants at one look.
4. **Should "People" fold too?** Not drawn: he named three. If it folded, sixty rows could be put away with one press
   and the jumps would matter less.
5. **A jump row that filters instead of jumping** ("show only Incoming") was weighed and not drawn: he asked to "go
   directly to the title", and his ruling keeps every group on one page.

## 6. New parts (lesson 68 — each named, with its reason)
| New | Made from | Why it has to be new |
|---|---|---|
| The list of jumps inside the "Users" card (A, desktop) | the card's own look; each line 28px high, 12px, the card's small-words type; lit = the filter chip's "on" colours | the app has no list inside a left-column card |
| The left column staying put (A) | — | today it scrolls away; a jump list there is useless otherwise |
| The row of jumps (phone; B's desktop) | the app's filter chip, 28px high, 6px apart, the count after the word in the same type, paler | the app has no jumps; the chip is its nearest part |
| The phone's four jumps sharing the row equally (78px each) | the same chip | at the chip's own side padding the four do not fit 328px |
| The search row and jumps staying under the top bar (phone; B) | the pane's own colour, a hairline under | nothing on Admin stays put today |
| A heading that folds | the page's heading with the fold's own mark (▾ / ▸, 12px as on "▸ Archived") before its words; the whole line presses | D2650; a heading and a fold were two different looks |
| A greyed jump (search) | the chip at 38% | the chip has no greyed look today |
| The heading's words white for a second (jump) | the heading | a new mark, his to rule |

Measured (lesson 103): on a desktop the search, Filter and "+ Add a person" are 36px high on one line (search 378 wide,
Filter 77, Add 113); on the phone search 243 and Filter 77, both 36 high, "+ Add a person" 328 × 36; the jumps 28px
high everywhere, the phone's four 78px wide each; the rail's four lines 183 × 28.

## 7. Every new word (for the second fresh Fable, D2441) — all in `words-r6-nav.mjs`
| Key | Words | Where |
|---|---|---|
| jumpPeople | People | a jump (the heading's own word), its count after it: "People 60" |
| jumpOutgoing | Outgoing | a jump: "Outgoing 1" |
| jumpIncoming | Incoming | a jump: "Incoming 1" |
| jumpOther | From other squadrons | the desktop's jump, the heading whole: "From other squadrons 4" |
| jumpOtherShort | Others | the phone's fourth jump only: "Others 4" |
| open / closed | ▾ Outgoing · 1 / ▸ From other squadrons · 4 | a heading that folds: the fold's mark before the heading's words |
| opened | ▾ View only · 2 people, ▾ 142 · 60 people | a fold the search opened |
| kestrelHolds | also views 142 | Kestrel's short row on 142's page (round 6's "also views", another number) |
| navName | On this page | never drawn — what a screen reader calls the list of jumps |

Reused unchanged: every heading, tag, row and fold word of round 6 (`words-r6-users.mjs`), "+ Add a person" (round 5),
"Find a callsign or sign-in", "Filter", "Nobody matches." (the app's). A jump writes its count without the heading's
dot ("People 60", the heading "People · 60") — one for the reviewer.

## 8. The pictures — a FACT line each
**The page from its top, Kestrel on 149 (10 people)**
- `j6-d-A-149` — FACT: top row `[Find a callsign or sign-in] Filter + Add a person`; left column, inside "Users":
  `People 10 (lit) / Outgoing 1 / Incoming 1 / From other squadrons 4`; then `WAITING FOR ACCESS / Nobody is waiting for
  access. / PEOPLE · 10` (ten rows, Raven's tagged `POSTING OUT 4 JAN · TO 150`) `/ ▾ OUTGOING · 1` Raven `/ ▾ INCOMING
  · 1` `Cinch 142 … POSTING IN 14 DEC` `/ ▾ FROM OTHER SQUADRONS · 4` `Hunter 142 — Pilot · CAT IP · admin · also plans
  149`, `Saber 142 — … master admin, full access`, `▸ View only · 2 people` / rule / `▸ 142 · 60 people`, `▸ 150 · 3
  people`. Top bar 149. Search 136px down, first person 310px down. Page 1,489px high. The crop is the whole page.
- `j6-d-B-149` — FACT: the same page; no list in the left column; under the search a row `People 10 (lit) · Outgoing 1
  · Incoming 1 · From other squadrons 4`; first person 346px down (36px lower than A).
- `j6-p-149` — FACT: `[search] Filter` / `People 10 (lit) · Outgoing 1 · Incoming 1 · Others 4` (four × 78px) / `+ Add a
  person` / the same page; first person 390px down. The crop is the whole page.

**The page from its top, Hunter on 142 (60 people)**
- `j6-d-A-142` — FACT: jumps `People 60 (lit) / Outgoing 1 / Incoming 1 / From other squadrons 1`; `PEOPLE · 60`,
  Cinch's own row tagged `POSTING OUT 14 DEC · TO 149`. Top bar 142. Page 3,987px high.
- `j6-d-B-142` — FACT: the same, the jumps a row under the search.
- `j6-p-142` — FACT: `People 60 (lit) · Outgoing 1 · Incoming 1 · Others 1`; page 3,808px high.

**Halfway down the sixty — what stays in reach** (scrolled 1,500px desktop, 1,400px phone)
- `j6-d-A-mid` — FACT: the left column where it stood, "People 60" lit; the list runs up under the top bar; no search
  on screen.
- `j6-d-B-mid` — FACT: search row and jumps held under the top bar, 93px high (10.8% of the screen), the list starting
  150px down; the left column gone.
- `j6-p-mid` — FACT: search row and jumps held, 93px high (10.6%), the list starting 142px down; "People 60" lit.

**"Outgoing" pressed** (Hunter, 142)
- `j6-d-A-jump` — FACT: "Outgoing 1" lit in the left column; `▾ OUTGOING · 1` white, 312px down the screen (it cannot
  go higher: the page ends); under it `Cinch — Pilot · CAT IP POSTING OUT 14 DEC · TO 149` / `▾ INCOMING · 1` `Mako 150
  — Pilot · CAT B POSTING IN 4 JAN` / `▾ FROM OTHER SQUADRONS · 1` `Kestrel 149 — Pilot · CAT IP · admin · also views
  142` / `▸ 149 · 10 people`, `▸ 150 · 3 people`; above it `▸ Archived · 1`. Violet: the lit jump and the heading.
- `j6-d-B-jump` — FACT: the same, "Outgoing 1" lit in the pinned row; heading 312px down.
- `j6-p-jump` — FACT: the same on the phone, "Outgoing 1" lit; heading 333px down.

**A fold closed** (Kestrel, 149)
- `j6-d-A-fold` — FACT: `▸ FROM OTHER SQUADRONS · 4` shut — Hunter, Saber and "View only" gone, the count kept; the
  rule and `▸ 142 · 60 people`, `▸ 150 · 3 people` straight under it; Outgoing and Incoming open above. Violet: the
  shut heading.
- `j6-p-fold` — FACT: the same on the phone, the search row and jumps held above.

**"Bol" typed** (Kestrel, 149)
- `j6-d-A-search` — FACT: search box `Bol`; jumps `People 10`, `Outgoing 1`, `Incoming 1` grey, `From other squadrons
  4` lit; the page is `▾ FROM OTHER SQUADRONS · 4 / ▾ View only · 2 people / Bolt 142 — Pilot · CAT C · also views 149`
  / rule / `▾ 142 · 60 people / Bolt — Pilot · CAT C · also views 149`. Today's page with "Bol" typed shows one row,
  `Bolt 142 · bolt · Pilot · CAT C · MEMBER`, under "People · 10".
- `j6-d-B-search` — FACT: the same, the jumps a row under the search.
- `j6-p-search` — FACT: the same on the phone, `Others 4` lit, "+ Add a person" under the jumps. The ✕ in the box is
  the test browser's own; his iPhone draws its own (lesson 104).

## 9. What I could not draw, and small faults in the pictures
- **Motion:** the run to a heading, the white heading going back to grey, the lit jump changing as he scrolls — stills
  only. A short film before a build, as D2628 C10 asked for the number's fade.
- **The search pinned on a desktop in A** (the choice named in the recommendation) — not drawn.
- **No match at all** ("Nobody matches."), **a squadron with no Incoming or Outgoing**, **the empty "From other
  squadrons"** with its jump at 0, **"Waiting for access" with people in it** — not drawn.
- **A phone narrower than his** (375): four jumps would be 71px each; "Outgoing 1" needs about 65. Not drawn.
- **The "+ Add a person" form opened under the top row** — not drawn (round 5 drew it under "People").
- **A master admin's "All squadrons" view and a Plan holder looking** — not drawn; the jumps would be the same.
- **The left column shows four cards** (Users, Squadrons, Squadron config, Data) — the served app has no "Display"
  card; the brief named five.
- **A rule and a fold's top edge sit close** on the `-search` pictures under "From other squadrons · 4" (the heading,
  then the fold, with no row between). A build would give the fold the heading's own gap.
- **In the phone's `-mid` picture the two violet rings touch.**
- **The pinned rows are drawn fixed for the picture**; in the app they would be the page's own, which the pane's
  clipping stops today (cost, above).
- **Tall crops:** the `-149-crop` pictures are the whole page; the `-142-crop` pictures stop at the screen's foot.
