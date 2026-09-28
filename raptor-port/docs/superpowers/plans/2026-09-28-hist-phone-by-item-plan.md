# Plan — History on a phone (`[HIST-PHONE-HIDE]`) with the changes window sorted by item (`[CHG-BY-ITEM]`), 28 Sep 26

Planned by Opus 5.5; to be red-teamed by Fable 5.1 and Astra (one round each, blind to each other — D67, the ~3-round
cap). One branch from `main` (`claude/hist-phone-by-item`), both items together (both change the one changes window).
Nothing is built before the red team has read this.

## 0. What he ruled — the build must do all of it

- **D345** (28 Sep 26, "1. Approve") — both mock-ups APPROVED with the calls listed on the page:
  `raptor-port/docs/img/handpass/2026-09-28-draft-pending/histphone/histphone-mockup.png` and
  `…/byitem/byitem-mockup.png` (made by `scripts/handpass/dp-histphone.mjs`, `dp-byitem.mjs`).
- **D344** — the hint reads, in his words and punctuation: **"History on: Tap a gold dot on the schedule"**.
- **D339** — History on a phone: say it is on, and let the schedule be seen; the window hides to the bottom; "Hide ▾" /
  "Show ▴" spelled out (his question: how does one know it minimises?).
- **D340** — sort by ITEM, every line item-first ("Programme · WPNS & TACTICS SYNC", then "Trident → Piston"), never the
  man first; the latest-changed item on top; an item with several changes lists each. **Narrows D168** ("Where = by the
  day's own sections").
- Standing, still in force: **D167** (the window: movable, resizable, stays open across a jump; on a phone the panel
  shrinks to a slim bar after a tap on a line — D167 (2); (4) "a group with something new opens by itself; the rest
  fold"), **D168** (one window; New to you / All changes / To go out; a day picker), **D170** (new to you until Mark all
  as seen; who and when on every line), **D171** (the doors), **D172** (the OG tag, top-right of a puck), **D92** (a
  changed puck gets a TAG, never a ring), **D116 / D338 (3)** (History mode = the window open, on the board and the
  edit week), **D119** (newest first), **D169 / D211** (members read it, medical in full), **D263** (every change to
  an absence is a line), the 2 Sep 26 rule (a control tapped repeatedly must not move under the finger), the 11 Aug 26
  rule (a change always shows its date).

**The approved calls, as a build list:**

*History on a phone (`[HIST-PHONE-HIDE]`):*
- H1. On a PHONE the window's header gains **"Hide ▾"** beside ✕. Desktop: no Hide (a movable, resizable window).
- H2. Under the header, one line: **"History on: Tap a gold dot on the schedule"** (D344).
- H3. Hide sends the window to the slim bar at the bottom: **"History on · N changes"** and a **"Show ▴"** button, plus ✕.
  Show brings the panel back; ✕ closes the window, which turns History off. The same bar a tap on a line already
  gives (D167 (2)) — one bar, not two.
- H4. While History is on, **every detail with a history wears a small gold dot** just outside the puck's bottom-right
  corner (never a ring — D92; clear of the OG / AL tags at the top right) — on desktop too.
- H5. A tap on a dotted detail opens its bubble (the phone's existing tap — `histbubble.ts`; a desktop hovers).

*Sorted by item (`[CHG-BY-ITEM]`):*
- I1. **"Group by: Item / Who"** — Item first and the default; Where and its section groups go.
- I2. **One group per item** — a Common Programme event, a duty desk, a formation (its seats as details: "#1 RCP"), a
  sim, a ground event, an input — **the item whose latest change is newest on top**.
- I3. An item with ONE change is ONE line (no fold); with more, a header ("Programme · SODB · 3", its latest time) and a
  sub-line per change, newest first, each with who · when; a text change names its field ("Start").
- I4. In the WEEK view the day leads the header ("Mon · Programme · SODB") — the same event on two days is two items.
- I5. A man moved between items shows under BOTH ("Echo moved in from MET + NOTAM BRIEF" / "Echo moved out to SODB"),
  still ONE change in the tab's count.
- I6. **Who keeps its sittings**, its lines item-first too (a move once, under the item he reached).
- I7. Every group open by default; a caret folds it.

## 1. What exists today (read from the code, 28 Sep 26)

- `src/ui/ChangesWindow.tsx` — the window. Header (`.win-bar`: grip, title, ✕), tabs, the day picker, "Group by
  Who / Where", the list (`byWho` / `byWhere` from `changesmodel.ts`), the foot. On a phone, after a tap on a line,
  `CHGWIN.bar = true` shows `.chgwin.bar`: one button "Changes · N new ▴" (reopens) and ✕. Folding: `isOpen` — a group
  with something new, or the first when nothing is new, or every group on New to you (D167 (4)); `CHGFOLD` holds hand
  folds while the window is open.
- `src/ui/floatwin.ts` — shared chrome: `onBarDown` starts a drag on ANY press in `.win-bar` except `.win-x` (a Hide
  button there would start a drag — it must be excluded).
- `src/ui/changesmodel.ts` — `linesFor(days)` (newest first, a move paired into one `CLine` — within 1.5 s, same person,
  neighbours, same day), `byWho` (person → sittings of ≤30 min gaps), `byWhere` (a closed list of sections by key
  prefix), the counts. A line's words today: a person key → title = the MAN ("Ranger"), text "put on RU BFM · #1 FCP";
  anything else → title = the frozen label ("Ground · MASS BRIEF · start"), from → to.
- `src/engine/editlog.ts` — the history. Every line's `key` is ROW-ANCHORED (`ridKey`: row positions replaced by the
  rows' stable `rid`, the day index literal); `lbl` is frozen at log time; keyless lines carry `iid` (an input),
  `sub` + `fld` (a Quals detail), `sub` (a Leave War record's man), `sect` ('abs', 'quals', 'day'), or nothing (a
  structural sentence: "Programme item added", "Wave added"…). `elogFor(key)` = the newest line for a DOM key on the
  loaded day (what the bubble answers); `rowTouches` / dates make lines week-safe.
- `src/state/changelines.ts` — the writers for everything the cell funnels never see (inputs, the Leave War, ledger,
  postings, Quals, publish, undo). **Not changed by this plan** (so the stored history's shape does not change).
- `src/ui/histbubble.ts` — the bubble. `CELL_SEL` (`[data-bfld],[data-slot],[data-store],[data-bombs],[data-area],
  [data-atime],[data-intimes],[data-txt],[data-inprow]`) and `keyOf(el)` are THE definition of "a detail the bubble
  can answer for". Wired on the edit week's root (`EditWeek.tsx`) and the board wrap (`SchedBoard.tsx`); desktop hover,
  phone tap (capture, never stops the edit).
- History mode: `state/view.ts` — `setChgWin(v)` sets `HISTMODE = !!v`. The bubbles work only where they are wired —
  the edit week and the board. **View-only Sched draws no bubble** (its day chip opens the window for everyone, a
  member included; D338 (3) names the board and Edit Schedule).
- The post-repaint pass precedent: `ui/highlights.ts refreshHighlights()` runs after every repaint of the edit week
  (`EditWeek.tsx`), View-only (`ViewWeek.tsx`) and the board (`SchedBoard.tsx`), marking pucks by a DOM walk — the
  string-built surfaces are never given extra per-cell attributes for view state (perf doctrine; parity).
- Pseudo-elements in use (measured on the built app, both widths, 28 Sep 26): a seat's `::after` is the OG / AL tag
  (top right); its `::before` is free except on a drag CLONE (`.tdghost.lift::before`, `.dragimg.lift::before` — the
  lift veil). Every other addressable cell has `::after` free; several use `::before` for an empty placeholder ("—",
  "Config…", "No notes yet."). Typed boxes on the board (`input.atm`, `input.tm`, `textarea.ain`/`.nin`/`.lin`/`.msn`/
  `.nts`/`.sb-nbox`) take no pseudo-element at all. The next-week peek (`ui/peek.ts`) draws seats with no `data-slot`
  (no key → no dot).

## 2. The design

### 2.1 The gold dots (H4) — one pass after each repaint, the bubble's own answer

**Where the dot goes is decided by the SAME question the bubble asks** — `keyOf(el)` over `CELL_SEL`, then "does the
history hold a line for it on the loaded day" — so a dot can never promise a bubble that is not there, nor a bubble
appear on an undotted detail (the backlog's "the same keys the bubble answers").

- `src/engine/editlog.ts`: **`elogKeySet(): Set<string>`** — the row-anchored keys `elogFor` would answer, memoised on
  (`ELOG.next`, `ELOG.rows.length`, `CURWEEK`): every line with a key whose date is its key's day of the loaded week
  (`onLoadedDay`'s own test, shared — one body, not a second literal). A unit test pins it equal to `elogFor` for every
  key of a seeded week (drift test).
- `src/ui/histbubble.ts`: **`refreshHistDots(root)`** — while `HISTMODE` and not `inVersionLook()`: for each `CELL_SEL`
  element under the root that is not inside `.pv-frozen` (a version or saved-plan look wears none — the OG tag's P4
  rule): `want = set.has(ridKey(keyOf(el), DAYS))`; toggle `data-hist` only where it differs (no style churn). History
  off: remove every `[data-hist]` under the root (one query; normally none). Costs ~1–3 ms over ~1,500 cells, only while
  the window is open.
- Called from the three places `refreshHighlights()` already runs after a repaint — `EditWeek.tsx` and `SchedBoard.tsx`
  (ViewWeek draws no bubbles, so no dots — §2.3) — and it runs on the notify that opens or closes the window, since
  both components repaint on every version.
- `src/ui/scheduler.css` — the dot, `#E5C24A` (the app's gold, as the new-to-you dots), 8px with a 2px ring of the page
  colour (as drawn on the mock-up), pointer-events none:
  - a SEAT (`.seat[data-hist]`): `position:relative` (as `.seat[data-og]`) and `::before` at `right:-4px; bottom:-4px`
    — outside its bottom-right corner, clear of the OG / AL tags at the top right. Not on a drag clone
    (`:not(.tdghost):not(.dragimg)`), whose `::before` is the lift veil; the comment beside the veil ("nothing in this
    file gives a seat … a ::before") is corrected in the same change.
  - any other addressable cell but a typed box: `position:relative` and `::after` at its bottom-right corner.
  - a TYPED box (input / textarea — no pseudo-element possible): the dot drawn INSIDE its bottom-right corner as a
    background image (a radial gradient, no-repeat). **My reading, for his look card:** the mock-up drew a gold line
    under a typed box; I read "a small gold dot on every detail" (D345) as a dot there too, inside the corner, because a
    typed box cannot draw outside its own edge.

### 2.2 Hide, Show and the hint (H1–H3, H5)

- `ChangesWindow.tsx`, header: on a phone (`phoneLayout()`), a button **"Hide ▾"** (`.win-hide`, the `win-x` recipe with
  a word) before ✕; its press sets `bar: true` — the same state a tap on a line sets. `useFloatWin({ closeSel:
  '.win-x, .win-hide' })` so pressing it never starts a drag.
- Under the header, while History shows dots on this page (`CURPAGE === 'editsched' || SBDAY != null`) **and on a
  phone**: the hint line `.cw-hint` "History on: Tap a gold dot on the schedule" (the mock-up's gold-tinted strip).
- The bar (`.chgwin.bar`, at the bottom — the stylesheet's place, whatever height the panel was dragged to, P8): ONE
  button, the whole left part, reading **"History on · N changes"** with a **"Show ▴"** pill inside it (as the mock-up
  draws it, and a bigger target than the pill alone), then ✕. N = the changes the window lists for its chosen day or
  week (the "All changes" count — a move once). "1 change" singular. Show sets `bar: false`.
- **My readings, for his look card:** (a) the hint is on the PHONE only — on a desktop the window sits beside the
  schedule and a pointer hovers, where "Tap" would not be true; (b) where there are no dots — View-only Sched, from a day
  chip, a member's only door — the hint is not shown and the bar reads **"Changes · N changes"**, since History draws
  nothing there; (c) the bar's count is every change on the chosen day or week, as the mock-up's "5 changes", not only
  the new ones (the old bar said "N new").

### 2.3 Sorted by item (I1–I7)

**`changesmodel.ts` — the item of a line (`itemOf`), from its ROW-ANCHORED key, never its words:**

| The line | Its item (identity) | Its title (live words; the frozen label's head when the row is gone) | Its detail |
|---|---|---|---|
| a flying seat `di.W.F.A.seat`; `ff:`, `fr:`, `st:`, `ar:`, `at:`, `fa:`, `ft:`, `fx:`, `aa:`, `au:` on the same line | the formation: `date \| F \| W.F` | "Flying · VL BFM" (callsign + mission) | "#1 FCP" (the jet only when the line has two); a field ("Take-off", "Callsign"…); "#1 remarks", "#1 stores", "Area", "Area time" |
| `wl:`, `it:`, `tr:`, `wx:` | the wave: `date \| W \| W` | "Wave · WAVE 1" | "Label", "In-times", "Traffic" |
| `d:`, `dr:` | the duty desk: `date \| D \| B.R` | "Duty · SDO" | a field ("Start"…); a man on / off has none |
| `dl:`, `bx:` | the duty block | "Duty block · DAY" | "Label" |
| `s:`, `sr:` | the sim row: `date \| S \| kind.R` | "Sim · AMT 1" | the seat ("FCP", "RCP", "Pax"); a field |
| `a:`, `ap:` | the programme row: `date \| A \| R` | "Programme · SODB" | a field ("Start", "End", "Item"…) |
| `g:`, `gr:`, `gx:` | the ground row: `date \| G \| R` | "Ground · MASS BRIEF" | a field |
| `dn:` `sn:` `pn:` `dtn:` `gn:` (a note) | the note, by its key | "Day note", "Programme notes"… | — |
| `iu:<iid>`, or a keyless line with `iid` | the input: `date \| I \| iid` | "Input · Ranger · LL" (live person and type; the line's words when the input is gone) | — |
| keyless, `sect 'quals'` + `sub` + `fld` | the man's Quals: `date \| Q \| sub` | "Quals · Casper" | the field ("CAT", a qualification's heading) |
| keyless, `sect 'abs'` + `sub`, no `iid` (the Leave War's decisions, awards, ledger) | the man on the Leave War: `date \| LW \| sub` | "Leave War · Ranger" | — |
| everything else keyless with a day — publish, withdraw, sign-offs, structural sentences, undo / redo, "Draft marks cleared" | the day itself: `date \| DAY` | "The day" | — |
| keyless with no day link to any of the above (a posting line, "added to the roster") | the line itself: `L \| seq` | its own words | — |

- **The row path (or the input, the man) is the identity, and the day is ALWAYS part of it** (`date` — the line's
  calendar day, its first when it spans days): the same event on two days is two items (I4), an input's lines on two
  days two items, two formations both called "VL BFM" are two items, and a row renamed between two changes stays ONE
  item (its rid does not change). An unknown prefix is its own item by its whole key (never merged by guess).
- **The words of a change under its item** (`entryWords`): a man put on → "Diesel put on"; taken off → "Ranger taken
  off"; a seat changed hands → from → to ("Echo → Static") with the seat as the detail; a typed value → from → to with
  its field as the detail; a keyless line → its own words, with the item's leading "Ranger · " / "Leave War · Ranger ·
  " taken off when it matches the item's title (so "Input · Ranger · LL" reads "LL added · 1 Aug", not "Ranger · LL
  added · 1 Aug"); a Quals line → from → to with its field as the detail.
- **A move** (a paired `CLine`) becomes TWO entries: under the item he REACHED, "Echo moved in from <the other item's
  title>"; under the item he LEFT, "Echo moved out to <the reached item's title>" (I5) — the section word dropped when
  both are the same kind ("moved in from MET + NOTAM BRIEF", as the mock-up). Each entry's tap goes to ITS place (the
  moved-out entry to the place he left). Both are the one `CLine`: one change in the tab's count, one gold dot of new
  if new, one "Mark all as seen".
- **`byItem(lines, weekView)`** → groups `{ key, title, entries[], newest, fresh, one }`, the group whose newest entry is
  newest first (time, then number — the history's own order breaks a tie), entries newest first; `one` when the group
  has a single entry. In the week view every title is led by its day ("Mon · …") — the day in the item's identity.
- **Who (I6):** `byWho` unchanged (sittings); each line drawn item-first — title = the item (with its day in the week
  view), the change under it; a move ONCE, under the item he reached ("Echo moved in from MET + NOTAM BRIEF").
- **`ChangesWindow.tsx`:** "Group by" **Item · Who** (Item first); `ChgWin.group: 'item' | 'who'`, default `'item'`
  (`changesopen.ts`). Item groups: a one-entry group is drawn as a single line (title bold; detail tag + change; who ·
  when), no caret; a group of several has a header — caret, title, "· N" in grey, NEW when something in it is new, its
  newest time — and one sub-line per entry (detail tag, the change, who · when), each a button when it has somewhere to
  go (today's `canGo` / `jumpOf`, per entry). **Folding (I7):** an Item group is open unless he folded it
  (`CHGFOLD`); Who keeps D167 (4) as built (**my reading:** D345's "every group open" is among the by-item calls, and
  "Who keeps its sittings" leaves Who as it is — for his look card).
- `byWhere`, `SECT_ORDER`, `SECT_LABEL` go (their only reader is the window's Where); `sectionOf` stays only if another
  reader needs it (none found — `CLine.sect` is read only by `byWhere`), else it goes too, with its test.
- The ui-contracts text of D168's "Where" and D167 (4)'s fold rule is rewritten in the same change (D201).

### 2.4 What does NOT change

The history's stored shape (no writer changes); the counts on the day chip and the admin's icon (lines — a move once);
To go out; Mark all as seen; the OG tag; View-only Sched's drawing; the desktop window's size, place and drag.

## 3. The roll-call (to be completed by the walk)

**The dot** — every place a detail with a history is drawn: the edit week (desktop, phone) — seats (flying, duty,
programme, sim, ground), typed fields, stores chips, bombs, area and area time, in-times, Unavailable rows; the board
(desktop, phone) — the same plus the board's typed boxes; the board over the edit week; a version look / a saved plan
(MUST NOT — a document, not your history); the next-week peek (no key — MUST NOT); View-only Sched (MUST NOT — no
bubble there); the palettes and the ALL AVAIL window's pucks (MUST NOT — not a place in the day); a drag ghost (the
veil must win); a puck with an OG tag, an AL tag, a flag ring, a SANS edge, a warning chip (the dot must sit clear of
each). **The bar and Hide** — the phone over the edit week, over the board, over View-only (the words there); the
desktop (no Hide). **By item** — New to you, All changes, a day, the week, a member, a move, an input, a Quals change,
a Leave War decision, a publish, a structural line.

## 4. The door check

| Action | Its door, every state |
|---|---|
| Hide the panel | "Hide ▾" in the header (phone) |
| Bring it back | the bar's "History on · N changes · Show ▴" button (phone) |
| Turn History off | ✕ on the panel and on the bar; the board's History button; the admin's clock (toggles) |
| See a detail's story | tap a dotted detail (phone), hover (desktop) |
| Group by item / by who | the two buttons |
| Fold / unfold an item | its caret header |
| Go to a change | the line, the sub-line; a move's two entries each to their own place |

## 5. Tests, red first

- `changesmodel.test.ts`: `itemOf` — the closed table above, one case per prefix and per keyless kind (the Where test's
  shape, which it replaces); identity by rid not words (two "VL BFM" lines → two items; a renamed row → one item);
  `byItem` — newest item on top, entries newest first, `one`, a move under both with its words and ONE line counted,
  the day leading in the week view, the same event on two days two items; `entryWords` item-first; Who's lines
  item-first, a move once.
- `editlog.test.ts`: `elogKeySet` equals `elogFor` over a seeded week's every key (drift test).
- `histbubble.test.tsx`: `refreshHistDots` marks exactly the cells `elogFor` answers, clears on History off, skips
  `.pv-frozen`.
- A component test of the window: Hide on a phone only; the bar's words and Show; ✕ closes; the hint on the phone on
  Edit Schedule / the board and not on View-only or desktop; "Group by" Item / Who, Item the default.
- `e2e/changeswin.spec.ts` (a real browser — the dot as PAINTED, anti-pattern 21): with the window open the changed
  puck's `::before` is a gold 8px circle at its bottom-right corner, OUTSIDE the puck, not overlapping its OG tag;
  a typed box's dot is painted; none on a published day's issued face / View-only; closed, none. Phone: Hide → the
  bar at the bottom with its words, the schedule's changed puck visible and dotted; a tap on it raises the bubble;
  Show → the panel back; ✕ → no dots. Group by Item: the headers and sub-lines as the mock-up.
- Break tests per wired surface (the edit week's pass call, the board's, the CSS per cell kind, closeSel).

## 6. The ripple and risks

- **Performance:** the dot pass runs after every repaint while the window is open (~1,500 cells, a Set lookup and a
  `ridKey` walk each); nothing while it is shut. Measured on the walk, not assumed (`docs/performance.md` checklist).
- **Layering:** the dot is inside its cell's own paint (z 5 within the day) — under the window (410/411), the bubble
  (430), drawers and modals; a `position:relative` added to a non-seat cell creates a containing block for its
  absolutely-placed children — every cell kind is listed in §1; the walk pictures each.
- **The drag:** a seat with `data-hist` cloned into the drag ghost — the veil's `::before` must win (the `:not()` guard).
- **The bubble's own keys drive the dots**, so a cell family the bubble cannot answer (the traffic, the wave's title
  select) gets no dot — the same as no bubble; said, not hidden.
- **The walk of `[DRAFT-PENDING]` (`dp-walk.mjs`) clicks "Where" (A10)** — rewritten to Item in the same change.
- **Words:** "Item" / "Who" on the buttons, "History on", "Hide ▾", "Show ▴", "Changes · N changes" — production copy.

## 7. Order of the build

1. The model (`itemOf`, `entryWords`, `byItem`, Who item-first) with its tests red first, then green.
2. `elogKeySet` and `refreshHistDots` with their tests; the CSS; the two call sites.
3. The window: Item / Who, the groups; Hide, the hint, the bar; `closeSel`; its tests.
4. `e2e/changeswin.spec.ts` additions (red first on the old code where they can be), the docs (ui-contracts §The one
   changes window and §History on the board; file-map), `dp-walk.mjs` A10.
5. The gates; the walk (both widths, pictures), break tests, the evidence sheet; his look card.

## 8. The bug-check tier (the order's §5)

1 money — no. 2 published record — no (To go out untouched). 3 saved data — no (the history's shape is unchanged; the
grouping is session view state). 4 a shared drawer — **YES** (the dot on every detail every builder draws). 5 a new
gesture or mode — **YES** (Hide / Show, Item grouping, the fold). 6 a new surface — the hint strip (small). 7 roles —
no (a member reads the same window, as today). 8 the warning list — no. **Tier: WALK** — the gates; the roll-call; the
door check; the walk of the touched surfaces at both widths; each new gesture in both orders; a break test per surface;
the evidence sheet; then his look.

## 9. After round 1 (28 Sep 26) — the plan as it now stands

Fable 5.1 and Astra read §0–§8 blind to each other (the brief:
`docs/superpowers/briefs/2026-09-28-hist-phone-by-item-plan-redteam.md`). Astra's report is kept whole in
`docs/superpowers/specs/2026-09-28-hist-phone-by-item-plan-review-astra.md`; Fable's findings are summarised here, each
with its disposition. One round (the ~3-round cap); the build, the walk and the final reads carry the rest.

| Finding | Said by | Disposition |
|---|---|---|
| A text cell's `::after` is its AL badge on a published day — the non-seat dot would fight it | Fable F1 · Astra 04 | **Taken.** Every non-seat detail (typed boxes, contenteditable spans, chips, rows) gets the dot as a BACKGROUND IMAGE inside its bottom-right corner; no pseudo-element, no `position:relative`. Seats and the board's empty seat (`.sb-slot`) keep `::before` outside the corner. §1's claim corrected. The attribute is `data-histdot` (Fable F11 — `data-hist-t` already exists). |
| A man moved within ONE item read as "moved in from X / moved out to X" under X | Fable F2 | **Taken.** Same item → ONE entry, "<man> moved", the two places as its from → to. |
| Postings and "added to the roster" carry no person, so they fell under "The day" | Fable F3 · Astra 05 | **Taken — two writer changes** (existing optional fields): a posting line `sect 'abs'`, `sub`, `fld 'posting'`; a roster add `sub`, `fld 'roster'`. The item dispatch is an ordered list: a key → its place; `iid` → the input; `sub` → Quals (`sect 'quals'`) or the Leave War; a day → the day; else the line itself. |
| The dot set's memo goes stale when a delete renumbers a note's key in place | Fable F4 | **Taken:** built fresh each pass (≤2,000 lines, only while History is on). |
| The hint used the window's phone form (≤620px); the bubble's own tap starts at ≤820px | Fable F5 | **Taken:** the hint shows where the bubble answers a TAP (`HOOKS.isPhone()`); Hide stays with the panel form (≤620px). |
| The old walk (`dp-walk.mjs`) A6, A7 assert the old grouping | Fable F6 | **Taken:** A6, A7, A10 rewritten; the whole walk re-run. |
| `inVersionLook()` is false after a render; a look must be excluded by where the cell sits | Fable F7 · Astra 01 | **Taken:** the pass skips `.pv-frozen` and `.preview`, and so do the bubble's `cellOf` and the list's `findHistCell` (Astra — no live story on a look, no jump into one). Measured: the week's look draws no addressable cells (`ted` with `ed` false); the board's does (`data-bfld`, disabled). |
| A jet's store chips and bombs box share one line — four dots for one change | Fable F8 | **Taken:** one dot per detail per day (the first element). |
| The week view's day word for a line whose first day is outside the week | Fable F9 | **Taken:** an item's day is the first day it touches among the days the window shows. |
| Documents D201 needs fixed | Fable F10 | **Taken:** `editlog.ts` (`sect`'s comment), `changesmodel.ts`'s header, `docs/mock/changes-window.html` §C (marked narrowed by D340), `ui-contracts.md` (the bar's words, the History-on-the-board note on per-cell markup, D167 (4)'s folds). |
| The bar drops "N new" | Fable F11 | **His look card** — the approved words kept ("History on · N changes"); the day chips and the tab still count what is new. |
| The board's wave-title box writes history (`wl:`) but has no bubble or dot | Astra 02 | **Taken:** `[data-wsel]` joins the bubble's cells (`wl:di.gi`); `wl` leaves `NO_BOARD_CELL` (a jump now lands on it). |
| Personal Inputs / Unavailable rows: their lines have no key, so neither dot nor bubble | Astra 03 | **Taken:** a row `iu:<iid>` answers with its input's lines (`iid` or `iids`) that touch the row's own day — one `storyOf(cell)` for the bubble, the dots and the tests. |
| Who's groups should open by default too | Astra 06 | **Taken** (the later word, D90): "every group open by default" covers Item and Who; a caret folds either. D167 (4)'s "new opens, the rest fold" is marked narrowed in `ui-contracts.md`. On his look card. |
| On a phone the ALL AVAIL window can cover the hidden bar | Astra 07 | **Taken:** the hidden bar sits one layer above the two windows (412) on a phone, below the bubble, drawers and modals; a press on it raises it. Walked in both orders. |
| The tier is FULL, not WALK | Astra 08 | **Taken:** with the writer changes, "saved data" is YES. **FULL:** the rules sweep, the two reviewers' scenarios (their failure scenarios and Astra's twelve action orders are the scenario design), the roll-call, the door check, the walk at both widths, break tests, both models reading the finished code with the evidence sheet, the re-walk, then his look. |
