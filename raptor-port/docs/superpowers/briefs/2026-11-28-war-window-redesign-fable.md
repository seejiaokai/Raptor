Model: Fable 5.2 (claude-fable-5-2), a fresh helper, blind to how F6 was drawn.

# A better design for the Leave War's day window — Fable's read (chat 195, 28 Nov 26)

Brief: `2026-11-28-war-window-redesign-fable-brief.md`. Judged: F6's window as drawn in
`../../mock/2026-11-27-war-window-states/img/` (s00–s10), his picture being `s01-inputs-ll-phone.png`. Nothing under
`raptor-port/src` changed; nothing committed or pushed.

## Verdict, in one paragraph

Yes — a clearly better design is there, and it is mostly a matter of taking away and regrouping, not of adding. F6's
window puts two different jobs in one undivided column: "what is on this day, and what may I do to it" and "add
something to this day". The second job takes two thirds of the window even on a day where nothing more can be added,
and the rows between the two (Remarks, till, Document, Duration, the lit leave button) belong to neither plainly.
Direction A below fixes that with no new control and no new word; direction B is the smaller step that keeps every
part of F6 in view.

## 1. The critique of the drawn window (s01 unless named)

**What works — keep it**
- The entry's line: its coloured box as the grid draws it, then only what the box cannot say (state, half, who placed
  it and when) — D1327, D1328, lesson 53. It is the right first thing to read.
- Approve · Refuse · Move · Delete on one line, in the same order and size on a phone and a desktop (D487, lessons 28
  and 53).
- The grid's cyan mark on the tapped day stays visible above the window (lesson 45).
- Remarks as a dark box that reads as a place to type (lesson 48); the app's one Document button (lesson 22).
- The same last row every time: CSE · OD · Grant OIL · ⋯.

**What makes it hard**
1. **Two jobs, one column, no boundary.** Top third: the LL that is there and its four buttons. Lower two thirds:
   Remarks, till, Document, Duration, eight leave buttons, four more. Nothing says where "this leave" ends and "add
   another" begins. The Remarks box sits directly under Delete: is it this leave's remark, or the next one's?
2. **The lower part quietly changes meaning.** On an empty day a leave button adds. In s01 the LL button is lit, so
   the same buttons now mean "this entry is LL — tap another to change its kind". Same place, same look, opposite
   effect, and nothing on screen says which. In s05 (two entries) it cannot be told at all: the lit LL belongs to the
   pending bid, the Remarks box to nobody in particular, and the OIL award above has no part in the form.
3. **The biggest, brightest part is the part that can do least.** Cutter's whole day is already held by an approved
   leave: no second leave can go on it. Yet the eight leave buttons and Duration take about 45% of the window's height
   and nearly all of its colour. The fact he tapped for — "LL, approved, Cutter placed it" — is a small grey-and-white
   line squeezed between a grey note and a wall of colour. Twenty-three controls stand in the window; four matter.
   (Today's app already leaves the leave buttons out on this very state — `a06-inputs-ll`, `a04-approved`. F6 put them
   back to make every window look alike; alike in parts is not the same as alike in sense.)
4. **Two cyan rings will meet.** D2881 (settled since F6 was drawn) gives the decided "Approved" the cyan ring the lit
   leave button wears. In F6 both then show at once — one meaning "this was decided", one meaning "this is its kind".
   One mark, two meanings, 250px apart (guide §4, one mark one look).
5. **"No manning row turns amber or red" floats.** It hangs under the rule, above the entry, and reads as the entry's
   caption. It is a fact about the day. And "turns" is the empty day's wording (what adding would do); on a day that
   holds something today's app says "is".
6. **Auto-approve sits over an "Approved" button it has nothing to do with.** The switch governs only leave placed
   from the buttons below; in s01 none can be placed. A first-time reader may take it for the switch that approved
   this leave.
7. **s07, the group.** The three names are plain words in the entry's line ("… · Cutter, Ghost, Dash"): lesson 25 says
   a person is drawn as his puck. And the "Change · [3 pax] · [Cutter]" line exists so that a change first says whom
   it is for (D2783, D2784) — yet the leave buttons and Duration stand right under it, offering a change with no such
   choice.
8. **A member (s09, his own approved leave).** Eight dashed leave buttons with LL ringed read as "place a bid" on a
   day that is already approved. What he actually needs there — the state, and the Document button to attach the
   approval — is the least visible part.
9. **Height on a phone.** 357px in s01, 455px in s05, for one line of news. The shorter the window, the more of the
   grid — the thing it is about — stays in view.

Who needs what: **Saber** on a day that holds something: see it, decide it, move or delete it; rarely add beside it.
On an empty day: place leave in one tap. **A member**: see the state; attach the document; delete his own pending
bid; on an empty open day, bid.

## 2. Direction A (recommended) — the entry owns its own things; the add buttons show only where they can add

Pictures (each also saved clean, `…-clean-…`, without the yellow outlines), all in
`raptor-port/docs/mock/2026-11-28-war-window-redesign/img/`:

| State | Phone | Desktop |
|---|---|---|
| s01 — his picture (LL from the Inputs page, approved) | `A-s01-inputs-ll-phone.png` | `A-s01-inputs-ll-desktop.png` |
| s00 — a pending bid | `A-s00-pending-phone.png` | `A-s00-pending-desktop.png` |
| s07 — a group leave | `A-s07-group-phone.png` | `A-s07-group-desktop.png` |
| extra — two entries (F6's s05) | `A-x05-two-phone.png` | `A-x05-two-desktop.png` |
| extra — an empty day | `A-x01-empty-phone.png` | `A-x01-empty-desktop.png` |

The yellow numbers on the pictures: **1** the manning line, moved; **2** the entry's card; **3** the last row.

**What changes from F6**
1. **The manning line moves up under the title, above the rule** (1). Title and manning are both about the day; the
   rule then separates "the day" from "what is on it". No new words; no height added.
2. **Each entry is one raised card** (2) holding, in today's order: its box, state and placed line (with › to its own
   window, as F6); its decision and Move · Delete; and **its own Remarks · till · Document row**. The row is the same
   row, same size, same parts — it has only moved inside the card, so it is plainly this entry's. With two entries
   (`A-x05-two`) each card carries its own; the question "whose remark?" cannot arise. An OIL award's card has none:
   its reason is changed by Edit…, as F6 has it.
3. **Duration and the eight leave buttons show only where a leave can still go** — an empty day, or a day with a half
   still free. On a day already full the window ends with the one row CSE · OD · Grant OIL · ⋯ (3), which is the
   window's last row in every state and, the window standing on the screen's foot, sits in the same place every time.
   This is F6's own rule for a medical ("leave buttons absent over a medical") applied to every full day, and it is
   what today's app already does on these states.
4. **Auto-approve shows only while the leave buttons it governs are showing** — in its ruled place, the title bar's
   right end (D1187). On a full day it is not there to be mistaken for the entry's approval.
5. **A group's people are their pucks**, on the card under its state; its remark is words on the card, changed through
   Change · [3 pax] · [Cutter], whose line is kept exactly as he ruled it (lesson 151).
6. **Only one cyan ring** can stand in a full day's window: the decided button's (D2881).
7. An empty day (`A-x01-empty`) is today's window with the manning line moved — nothing else. So the every-day act,
   one tap to place leave, is untouched.

**Why it is better**
- *For Saber:* the window opens on the answer. s01 goes from 357px and 23 controls to 256px and 11; what he may do to
  the entry is the first row of buttons he meets, and nothing below it could be mistaken for part of it. Two entries:
  455px → 357px, each with its own remark and document. The last row never moves.
- *For a member:* his approved leave shows its state and its Document button, and no bid buttons he cannot use. A
  pending bid of his own shows Delete and the same row. An empty open day is the bid window he knows.
- *Fewer places for a fault:* no button that adds in one state and changes in another; no shared form to route to the
  right entry.

**His rulings it keeps:** D487 (every button its built size), D1361 / D1427 / D2880 / D2881 (Approve · Refuse: size,
height, place, words; decided solid with the cyan ring, the other grey — drawn so), D765 and each kind's colour, D887
(no glow: the card is a flat surface one step lighter, no shadow of its own), D1327 / D1328, D1313 (the manning rows
side by side on their line), D1339 (one remark for a leave's days, changed where the leave is tapped), D1150 / D1159
(the one Document button, on the entry), D1289 (the tapped day's mark), D2783 / D2784 and lesson 151 (the Change
line), lesson 25 (pucks), lesson 40 and the repeated-tap rule (nothing in the window moves when a button is pressed),
D1625 (every part drawn here first).

**His rulings it changes or narrows (D754 — named, with the cost)**
- **D1467, one reading of it** ("on 'All' a leave button re-types it"): on a full day there is no lit leave button to
  press, so changing an entry's kind — LL to OL — or its Duration is done in the entry's own window (›), one tap
  further than today. Better because the same button no longer adds here and changes there; the cost is that one
  extra tap on a rare correction (Undo and place again also does it).
- **D1187, narrowed, not moved:** the switch keeps its place but is absent while no leave button is showing.
- **D1724's wording** ("a day of two or more entries opening the window that adds more"): it still adds — CSE, OD,
  Grant OIL, ⋯ — but leave buttons come back only when a half is free.
- **F6's "one look on every tap":** A keeps one window, one order and one last row, but the window is shorter on a
  full day. If his wish is that every tap shows every button, that is direction B.

**What it costs to build:** medium, and inside the clean sheet's step 2 (the one window), which rebuilds this window
anyway. The one-day window's rows regrouped into cards; the Remarks row made per entry; the leave rows and the switch
shown by "can a leave still go here"; the manning line's place. It leans on the entry's own window (›) for kind and
Duration changes, so it should not be built before that window exists. No new stored data. Risk sits where it already
is (who may do what to which entry), not in the layout.

**Keyboard (guide §2):** Tab goes ✕ → the card's head (Enter opens the entry's window) → Approve · Refuse · Move ·
Delete (one stop, arrows within) → Remarks → till → Document → the next card, then the leave rows where shown, then
the last row (one stop, arrows within). Escape closes the window; the keyboard returns to the day tapped.

**Not drawn, described only:** a day with a free half (the card, then Duration with the free half lit and the leave
buttons, then the last row); the member's states (as above); a card whose remark is long (the box grows downward, as
the input window's does). Each wants its picture before a build.

## 3. Direction B (alternative) — F6 kept whole, grouped by owner

| State | Phone | Desktop |
|---|---|---|
| s01 | `B-s01-inputs-ll-phone.png` | `B-s01-inputs-ll-desktop.png` |
| s00 | `B-s00-pending-phone.png` | `B-s00-pending-desktop.png` |
| s07 | `B-s07-group-phone.png` | `B-s07-group-desktop.png` |

Every part of F6 stays in view, same sizes. The changes: the manning line moves up (1), as in A; the entry's line, its
buttons, the Remarks row, Duration and the leave buttons lit on its kind all share **one raised surface** (2), so the
form reads as *this entry's* — tap OL to make it an OL, tap AM to make it a morning; and CSE · OD · Grant OIL · ⋯ stand
below the surface (3) as the way to add another. A group (s07) shows no form, because a change to it must first say
"3 pax" or "Cutter" — so B's s07 is A's s07 with the Auto-approve switch left in.

- *Better than F6:* the ownership question is answered, and the last row is plainly "add".
- *Better than A in one thing:* changing an entry's kind or Duration stays one tap.
- *Worse than A:* still 23 controls and 364px for s01; the fact he tapped for is still the smallest thing in the
  window; two cyan rings stand together once an entry is decided (the pictures show it); with two entries the form
  can belong to only one of them, so a "which entry is picked" state would have to be designed and drawn — a new
  thing to learn; a member's own approved leave still shows bid buttons.
- *Rulings:* keeps all that A keeps, and D1467 and D1187 whole. Changes none. *Cost:* small for one entry; the
  two-entry pick is the real cost and is not drawn here.

**My recommendation: A.** B is the answer only if he wants every button on every tap.

## 4. Words, old → new (for the fresh Fable words read, D2441)

| Where | F6's words | These drawings |
|---|---|---|
| The manning line on a day that holds an entry (A and B) | "No manning row turns amber or red" | "No manning row is amber or red" — today's built words for such a day, not new |
| The group card's first line (A and B) | "Approved · Whole day · Cutter, Ghost, Dash" | "Approved · Whole day", the three people as their pucks |

Nothing else is added or reworded. Approve · Approved · Refuse · Move · Delete · Change · 3 pax · Remarks · till ·
Document · Whole day · AM · PM · Pick a range · Grant OIL · Auto-approve and the placed lines are F6's or today's,
letter for letter. Neither direction adds a label, a heading or a hint.

## 5. How the pictures were made, and what was checked

- Script: `raptor-port/docs/mock/2026-11-28-war-window-redesign/draw-redesign.mjs` (v1.0). It imports F6's own world
  and helpers (`../2026-11-27-war-window-states/rollcall-today.mjs`), opens the real window on an empty day of the
  same man, and rearranges the page's own parts — the real Remarks row, Duration row, leave buttons and last row are
  moved, not redrawn; the card uses the day's list's own classes; the pucks are copied from the grid's own. Approve ·
  Refuse wear D2881's look, taken from the decide-buttons drawing (`../2026-11-27-decide-buttons/draw-decide.mjs`, E3).
- Served build: the main folder's existing `raptor-port/dist` (built 26 Nov), by `vite preview` on 127.0.0.1:4181,
  which I started (it was not up) and stopped afterwards. No build was run; the checks lock was free and not taken.
- Sizes: phone 402 × 874 at 3x (the size `rollcall-today.mjs` uses, so the pictures sit beside F6's); desktop
  1536 × 864 at 2x. **A second phone run at 390 wide** for the fit: every frame, both directions, sideways overflow 0
  for the window and 0 for the page, no button, puck or line past the window's edge.
- Console and page errors: 0 in all three runs.
- Window heights measured (phone and desktop alike): A — s01 256, s00 256, s07 280, two entries 357, empty 261;
  B — s01 364, s00 364, s07 280. F6: s01 about 357, two entries about 455 (read off its pictures).
- Opened by me: all 16 marked pictures, and 4 of the 16 clean copies (`A-s01` phone and desktop, `A-s07` phone,
  `B-s01` phone). The other 12 clean copies come from the same frame a moment later with the outlines off; not opened.
- **Not checked:** Safari and an iPhone's own letters (the runs are Chromium's phone emulation, as F6's were) — the
  rows are the app's own, at the widths they already hold today, but that is an inference, not a measurement; the
  window with real behaviour behind it (these are drawings: no button in them works); a member's sign-in.

## 6. Picture list (32 files, `raptor-port/docs/mock/2026-11-28-war-window-redesign/img/`)

A: `A-s01-inputs-ll`, `A-s00-pending`, `A-s07-group`, `A-x05-two`, `A-x01-empty` — each as `-phone.png`,
`-desktop.png`, `-clean-phone.png`, `-clean-desktop.png` (20).
B: `B-s01-inputs-ll`, `B-s00-pending`, `B-s07-group` — each the same four (12).

For his page, the pair that carries the question: F6's `s01-inputs-ll-phone.png` beside `A-s01-inputs-ll-clean-phone.png`,
then `B-s01-inputs-ll-clean-phone.png`; the marked copies where a part is being pointed at.

## 7. For the host

- No ruling of his was made here; nothing recorded. The two changed readings (D1467, D1187) and D1724's wording are
  his to rule if he picks A.
- No design lesson added. One candidate, if he takes A, in his words to come: a window shows the buttons that can act
  on this day, not every button the window has.
- The mock folder and this report are untracked; nothing else in the working copy changed.
