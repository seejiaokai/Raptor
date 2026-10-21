---
paths:
  - raptor-port/src/leavewar/**
  - raptor-port/docs/leavewar/**
  - raptor-port/e2e/*leavewar*
  - raptor-port/docs/**/*leavewar*
  - raptor-port/docs/**/*lw-*
  - raptor-port/docs/**/*lw-*/**
  - raptor-port/docs/**/*one-absence*
  - raptor-port/docs/**/*arch-stack-4*
  - raptor-port/scripts/handpass/lw-*.mjs
  - raptor-port/scripts/handpass/seat-lw-*.mjs
  # the seams where the Leave War meets the rest of the app (widened 24 Sep 26, the spring clean's red team):
  # its architecture below binds these files too, so a session editing them must load it
  - raptor-port/src/main.tsx
  - raptor-port/src/probe-bridge.ts
  - raptor-port/src/state/store.ts
  - raptor-port/src/state/inputgate-hook.ts
  - raptor-port/src/state/people-settings-commit.ts
  - raptor-port/src/storage/**
  - raptor-port/src/command/**
  - raptor-port/src/undo/**
  - raptor-port/src/engine/qualcols.ts
  - raptor-port/src/engine/people.ts
  - raptor-port/src/engine/inputs.ts
  - raptor-port/src/ui/QualsPage.tsx
  - raptor-port/src/ui/InputsPage.tsx
  - raptor-port/src/ui/inputedit.tsx
  - raptor-port/src/ui/Shell.tsx
  - raptor-port/docs/data-schema.md
  - raptor-port/docs/undo-contract.md
  - raptor-port/docs/performance.md
---

# Rulings — the Leave War

**Loads by itself** whenever a session reads a Leave War file (the `paths:` at the top of this file). The general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every session; the map of every ruling and how to add or retire one: `DECISIONS.md`.
**One line per ruling — its number, its date, the rule as it stands (D390). Its full row** — his words, the readings he
was told, where it lives — **is in `.claude/decisions-full/leave-war.md`, never loaded by itself: open it before acting on a
ruling's detail or asking him about it** (`grep -h '^| D… |' .claude/decisions-full/*.md` — the shell; the Grep tool
hides a long row). A "— changed by" tail names the later rulings that changed it. Newest first.
**Its own rulings are in the table below.** Its decisions from before this list began are below, in
§Settled before this list, and its architecture in §Architecture (both moved from `raptor-port/CLAUDE.md`,
24 Sep 26). **The OIL rulings load with every
Leave War file** (OIL is leave the war banks) — among them **D79, D80, D81, D82** (a hand-typed award: any
day; never flags a leave day; a worked weekend that earns nobody says so; an award and a worked day add up),
**D19** (a weekend no Leave War period covers says so and offers to create it) and **D21** (an Off day earns
no OIL). **Also read** — in `oil.md`: **D260** (a dragged block's Delete and the one-day Clear remove OIL awards too, and name them first; awards never move — and D265 here: a bid beside an award moves alone). In `scheduler.md`: **D1080** (one tap then typing replaces a counter's amber and red numbers and the OIL figure boxes, as the schedule's time boxes do — D1047; the Required cells' pad already did); **D274** (Reset order approved as built, 27 Sep 26); **D665** (the four Required / Available rows of the calendar job sit at the foot of the Manning block, not under the Event rows — nothing covers the month buttons, and the open-bidding outline stays round the dates). In `how-we-work.md`: **D347** (the war's Undo / Redo leave its Period row for the app's top bar, in the same place and look as Edit Schedule's — desktop and phone). In `people-accounts.md` (it loads by itself with the Leave War's posting files; moved there from How we work, D390): **D166** (accounts: the war follows the signed-in callsign, not "View as"); **D229, D280, D281, D283, D284** (a posting out's four outcomes — archive + suspend, delete, SANS, transfer — which change the war's post-out sheet; a man posted out as SANS joins the SANS group that day when Show SANS is on, else stays shown as posted out, untracked; a man back from overseas returns as he was); **D308, D320, D323** (a man posted in is asked his post-in date; Archive on Admin → Users is "posted out from today", his past kept; the war keeps every stint a man has in the squadron — "away" between a posting out and a later post-in, his months before it as they were). In `scheduler.md`: **D44, D45** (nothing on a published day changes without the
scheduler acknowledging it; the pending mark is the mechanism).

**Where the detail lives:** the grid, its sheets and its window of months — `raptor-port/docs/ui-contracts.md`
(its Leave War sections) and `raptor-port/docs/performance.md` §E. Leave War; what the war stores —
`raptor-port/docs/data-schema.md` §World 2; its gaps — `raptor-port/docs/leavewar/known-gaps.md`; the one-absence
rules — `raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md` and
`…/2026-09-20-arch-stack-4-clash-check.md`; its files — `raptor-port/docs/file-map.md`.

| # | Date | The rule |
|---|---|---|
| D1160 | 21 Oct 26 | The Leave War's rows stay their height; a whole day's box fills its whole cell and a half day's box fills its half — the morning the top half, the afternoon the bottom — its letters smaller, so a half reads as half at a glance by its size. |
| D1159 | 21 Oct 26 | Wherever the Leave War overhaul lets a person add a document — the bid window, an entry already placed, a leave filed on the Inputs page — it uses the app's one Document button as the input window has it: the upload arrow and "Document", "Add" once a file is there, each file a chip with its ✕ — not a button of its own. |
| D1158 | 21 Oct 26 | The Leave War's Ack goes: the bid windows' Decide row is Approve · Refuse, a bid simply waits until it is decided, and the Legend loses Ack's purple, which stays "this is you". |
| D1157 | 21 Oct 26 | The Leave War keeps its year grid — the whole period in one grid — not a month at a time as the colleague's app has; on a phone the close look is the day panel (D1143) and pinch to zoom (D1117). |
| D1156 | 21 Oct 26 | The Leave War adopts lock dates, as the colleague's app has them: a period, with its reason, in which members cannot add, change or remove leave; whether the stages (draft, bidding, closed, published) go is put to him on the full mock-up, his lean being that they go. |
| D1155 | 21 Oct 26 | Public holidays can be brought in by file, since the app runs on a network with no internet: it exports a sheet in its own format, he has it filled offline and imports it, and the holidays fill in by themselves, several days where a holiday runs so; and the Leave War gets a list of the squadron's events with their types, where events are added. |
| D1154 | 21 Oct 26 | The Available P and Available W rows are set up as any counter is, choosing exactly what each counts (CAT A to D, IP, FI and the rest): one row for pilots and one for WSOs; the SANS calendar's need follows what they count, and the screen says how. |
| D1153 | 21 Oct 26 | A bid takes its leave off the balance the moment it is placed, as the Leave War does today; there is no second "after pending" figure as the colleague's app has. |
| D1152 | 21 Oct 26 | The Leave War gets an Approvals list: everything awaiting approval in one list, its count rising with each new request not yet approved, with Approve on each line and an Approve all. |
| D1151 | 21 Oct 26 | One document lists every place in the app that should send a notification and how each works, starting with the reminder to attach a leave's document a day before it starts; the agent adds to it by itself whenever work shows a place that needs one, tells him, and he may strike any. |
| D1150 | 21 Oct 26 | Every input, on the Leave War and the Inputs page, can carry photos and PDFs, added or seen at any time, even after its dates are locked, so a leave shows it was applied and approved in the official leave system; a leave filed on the Inputs page asks for its document as a medical one does, never as a hard stop. |
| D1149 | 21 Oct 26 | The Leave War's groups can include a Management group that the admin makes and fills by picking its people, placed at the top of the war by default. |
| D1148 | 21 Oct 26 | A tap on a person on the Leave War opens his leave: his balances and his upcoming leave, each with its state; a year picker shows this year and ahead by default, and a past year's leave stays kept and shows when that year is picked from the drop-down. |
| D1147 | 21 Oct 26 | An admin's bid window carries an "Approve what I enter" tick: whatever he places, on any row, is approved as it is placed. |
| D1146 | 21 Oct 26 | A Leave War day holding two entries shows both in its cell, one above the other, as the colleague's entry 1 and entry 2 do, not one code with a "+n" corner. |
| D1145 | 21 Oct 26 | The Leave War keeps AM and PM half days, a member picking which half, never a general half day off; and a day's cell draws the AM in its top half and the PM in its bottom half, as the colleague's app does — a whole day's box filling its cell and a half's its half, letters smaller, the rows keeping their height (D1160). — changed by D1160 |
| D1144 | 21 Oct 26 | Both Leave War bid windows show what is left on each leave button, and at the top one line for the day — Available P before and after the bid, and only a manning row the bid would turn amber or red; where several would, each stands on its own line, flush left, one under another; where none would, the line says so. |
| D1143 | 21 Oct 26 | On the Leave War, phone and desktop, a tap on a date's heading opens that day from the foot, as the Inputs and SANS calendars' day does: ‹ › to step, its figures (Available P and W, the squadron's manning rows with their amber or red), and who is away with his leave's letters and whether approved or waiting — never a remark. |
| D1142 | 21 Oct 26 | A member is told by the app's bell when the Leave War decides his leave — one line a decision, naming who made it: a bid approved or refused, an approved leave put back to a bid, moved or deleted, and a bid replaced by a clashing input; an Ack tells nothing; days decided together are one line; a tap takes the grid to it. |
| D1141 | 21 Oct 26 | The person signed in sees "My leave" on the Leave War — LVE left (less his waiting bids), OIL, bids waiting, next leave; on a phone a third line under the top's two, on a desktop the free end of the stage row, no new line; a tap lists his own leave, one line a request with its state, and a tap on one takes the grid there. |
| D1140 | 21 Oct 26 | The Leave War gets a major overhaul, planned in its own chat, taking the good things from a colleague's leave app. |
| D1117 | 21 Oct 26 | On a phone the Leave War grid can be pinched to zoom in and out, as the board's desktop layout and Quals can; built as its own job in a fresh chat, its questions and pictures first. |
| D1019 | 18 Oct 26 | From 431 to 700 wide the Leave War grid card's buttons use the phone's short words ("⇅", "OIL") as drawn at 440, so "−" and "+" stay on the first line; the grid's columns are unchanged. |
| D1016 | 18 Oct 26 | The Leave War's shorter two-line top up to 700 wide is built as drawn at 440 and 600: the wide gap in each line at 600 is accepted, and from 431 to 700 the top keeps the grid card's 20px edge so the two line up; the grid card is unchanged but for its buttons' short words (D1019). — changed by D1019 |
| D1001 | 18 Oct 26 | The Leave War keeps each man's flight label as it is — it is not dropped — because he intends an option to sort the Leave War by flight; until that option is designed nothing about the label changes on screen. |
| D1000 | 18 Oct 26 | On screens up to about 700 wide the Leave War's top takes the phone's shorter layout (D678, with "My leave" its third line — D1141), not the tallest one; the top only, the grid unchanged; drawn for him at 440 and 600 wide before it is built. — changed by D1141 |
| D998 | 18 Oct 26 | For now the Leave War's manning stays as built: only leave, a medical downchit (not ATT B), a course, an overseas duty and a leave bid not refused lower it; a duty or other commitment does not. |
| D892 | 15 Oct 26 | In the Leave War's Rearrange, a row dragged toward the top or bottom edge of the screen scrolls the grid that way, so it can be carried to a row out of view — a man's row, a group heading and a counter alike, on a phone and a desktop — as the scheduler's drags and the war's own move already do. |
| D891 | 15 Oct 26 | The Leave War's ⚙ Settings Groups and "Who wins" lists and a day's notes on the Inputs calendar show one landing line a gap too, as the grid does (D890): over a row's lower half the line is drawn on the top of the row below; only under the last row of a list is it drawn on a row's foot. |
| D890 | 15 Oct 26 | In the Leave War's Rearrange the gap between two rows shows one landing line, in one place: over the lower half of a row or the upper half of the row below it, the same line is drawn on the top edge of the row below; only under the last row of a list, or above a heading the row cannot land on, is it drawn on a row's bottom edge. — changed by D891 |
| D883 | 15 Oct 26 | While a row is dragged in the Leave War's Rearrange, its blue landing line runs unbroken across the whole row: the name, the counters (the figures columns) and the days. |
| D882 | 15 Oct 26 | The last four places lose their glow too: the light under today's day card, a SANS puck's stripe's light, the light on the Leave War's landing line; and the Rearrange button and the Show SANS switch show "on" by the filter chip's pale blue fill, blue words and blue edge, with no halo or glow. |
| D881 | 15 Oct 26 | Four more places lose their glow, each keeping its line as it is: the green "he can take this seat" ring on Edit Schedule; the Leave War's green open-bidding box; the ring on his own name on the Leave War; the Tracker's gold "can fly next" and turquoise "search found" rings. |
| D827 | 13 Oct 26 | The neater drawing of the Leave War's clash note on a phone ("A+") is approved as drawn and is built: it is the design of record — the slim line that opens, its list in aligned columns, every row two lines, the words as drawn. — changed by D837, D833 |
| D823 | 13 Oct 26 | On a phone the Leave War's clash note is the slim full-width line under the two rows that opens its list in place (option a of the design page) — with the list's parts lined up in columns and every row the same shape; the neater drawing is put to him before it is built. |
| D805 | 13 Oct 26 | On a phone the Leave War's "clashes with the schedule" note is redesigned — its layout and where it sits: never a narrow box squeezed at the right of the top row; a picture is put to him before anything is built. |
| D679 | 8 Oct 26 | On a desktop the top of the Leave War stays as it is — two lines, every label and button as today, but for the "My leave" chip in the stage row's free end (D1141); only the phone takes the two-line layout of D678. — changed by D1141 |
| D678 | 8 Oct 26 | On a phone the top of the Leave War is two lines, as drawn in idea A: the period, "+" and "viewing as" on the first; the stage (its two moves behind the stage button), the bidding dates, under-manned and legend on the second; and a third, "My leave" (D1141). — changed by D1141 |
| D677 | 8 Oct 26 | The two ways of deleting a counter stay as they are: the cross in Rearrange deletes at once and asks nothing (undo brings the counter back), and "Delete counter" in the counter's own window still asks "Really delete?". |
| D676 | 8 Oct 26 | In Rearrange a counter row's delete cross is red — as "Delete counter" is in the counter's own window. |
| D674 | 8 Oct 26 | In Rearrange a counter row can be dropped anywhere among the four fixed rows (required P and W, available P and W) — above them, between any two of them, or below all four. |
| D673 | 8 Oct 26 | On a counter's own window, "Delete counter" is red and "Save counter" is the app's filled Save button — the three buttons no longer look alike. — changed by D676 |
| D670 | 8 Oct 26 | On the Leave War, undo and redo leave the grid where it is when the day they change is already on screen; the grid jumps to that day only when it is out of view. — changed by D672 |
| D669 | 8 Oct 26 | The Leave War's manning block comes with no count rows of its own — a squadron makes the ones it wants; and in Rearrange a count row's eye (hide) is replaced by a cross that deletes it. |
| D461 | 30 Sep 26 | The Leave War has no "Edit person": a man's seat, band and SXO are changed only on Quals, and the war shows what Quals says. |
| D460 | 30 Sep 26 | The SXO tick he keeps on Quals is the one source the app reads (his setting, not a claim about the official qualification): the Leave War cannot make anyone SXO — it shows what Quals says, read only, and counts him as SXO only if Quals does; nothing on the war (its person sheet, a move into a category) ticks SXO. — changed by D461 |
| D418 | 29 Sep 26 | The Leave War stays as built on three counts — an approved leave reaches inputs at approve; the admin decides bids in every stage but draft; a published war's approved leave offers only its remarks — and a drag across days that goes below zero must ask first, as a one-day bid does. |
| D352 | 28 Sep 26 | The one undo takes back a Leave War stage move, as today — and says so. |
| D365 | 29 Sep 26 | On a phone the Leave War's "Viewing as" chip takes a line of its own under the picker, words kept — as built; a tablet and a desktop keep the one line. — changed by D678 |
| D335 | 27 Sep 26 | The one-day sheet keeps "how many" (Just this day / Pick a range), at its top. |
| D334 | 27 Sep 26 | The Move button is the grey chip with a teal arrow before the word ("⇄ Move") — on every sheet that offers it. |
| D333 | 27 Sep 26 | A member gets move on his own bid while bidding is open — on the one-day sheet and the day's list, as the drag already lets him. |
| D332 | 27 Sep 26 | "Delete" is the one word for taking a record away, on every Leave War sheet — the one-day sheet's "Clear" and the day's list's "Clear" become "Delete" — in a dashed grey edge, not red — changed by D676, D673 |
| D331 | 27 Sep 26 | Both sheets follow order A: Decide (Approve · Refuse — Ack goes with the overhaul, D1158; the app still shows Ack until then) → Selected (Move · Delete) → How much → Which leave — changed by D1158 |
| D266 | 27 Sep 26 | A day's list (a day holding several records) moves a record the same way as a single chip — its own Move per record, no date box, picking that record up into the grid's move mode; a member may move his own bid while bidding is open (D333). — changed by D333 |
| D265 | 27 Sep 26 | A record that can move always offers move, whatever shares its day. |
| D264 | 27 Sep 26 | The one-day sheet and the drag-selection sheet share one format and one look |
| D262 | 27 Sep 26 | One chip, one move: the one-day sheet's Move is always pressable and picks the chip up into the grid's move mode — no date box; while moving, the grid scrolls at its edges, the months keep it on, an empty tap outside cancels; a day's list moves a record the same way (D266). — changed by D266 |
| D160 | 24 Sep 26 | Build a "Reset order" line in the Leave War ⚙ settings |
| D159 | 24 Sep 26 | Leave it: the desktop Leave War grid opens at normal size (zoom 1); only the phone opens one step out. |

## Settled before this list — moved from `raptor-port/CLAUDE.md` §Stable decisions (24 Sep 26)

**CLOSED: a new decision is a row in the table above, with a D-number — never a line added here.** These are
the Leave War's settled decisions from before the rulings list began (21 Sep 26), MOVED WHOLE, word for word
(D138), so they load with this area instead of in every chat (D140). Where a row above changes an entry
here, the row wins (newest instruction wins). The preamble they carried in `raptor-port/CLAUDE.md`, unchanged:

Each entry is a tripwire: the decision is SETTLED — don't rebuild, re-propose or
re-litigate it. Where a reference doc holds the full story, the line keeps the
decision + a pointer. Owner + date establish authority; keep them.

### Leave War roster & display (owner, 3–4 Sep 26)
- **Admin controls live in ONE ⚙ Settings; rearranging is on the grid.** Matrix top
  row is now ONE line (owner, 5 Sep 26 — "all in 1 row to minimise row height
  space"): Manning · ⚙ · Rearrange for an admin, then the OIL tracker RIGHT AFTER
  the last control (no spring to the far edge); a member sees just Manning · OIL.
  The old "JAN – DEC 26 · 365 days · 50 people" line was dropped (the war NAME
  still lives in the Period picker in the page chrome). "OIL tracker" shortens to
  "OIL" on a phone (`.rtlbl`) so the four hold one line. **The − / + ZOOM pair
  follows OIL in this row at BOTH widths** (owner, 6 Sep 26 — moved off the
  month strip, where it was phone-only), and **a phone OPENS one step out**
  (`zoom` 0.8, desktop 1 — "can this be the default zoom? Like zoom 1 click
  out"; the desktop STAYS at 1 — his "leave it", D159, 24 Sep 26); the freed month strip holds all twelve months on ONE line on a phone
  (equal-width buttons, 9px, 44px row — the 72px two-line row is gone) and the
  strip CANCELS the grid zoom (`zoom: 1/zoom` inline — navigation chrome stays
  readable at 0.8). The OIL TRACKER sheet has its OWN − / + beside RANGE with
  the same steps and the same phone-opens-at-0.8 default (`OilTracker.tsx`).
  Don't put the zoom back on the strip, let the strip wrap, or let it scale
  with the grid. ⚙ opens `SettingsSheet`
  (CONFIG: + Counter, +/− Event row, Show SANS, Reset counters *[gone 8 Oct 26 — D669: the Manning block comes with no count rows of its own, so there is nothing to reset to; a row's eye in Rearrange is a delete cross and the Archive bar went with it]* + the roster GROUPS
  editor folded in; old `⚙ Groups` button + `GroupSheet.tsx` deleted). REARRANGING
  is STILL hands-on-grid (person rows AND category headings drag), and the top
  row's ⇅ toggle is the ONE way in and out (owner, 6 Sep 26 — "delete this whole
  blue section … when I click on it, it exits"): the on-grid strip
  (`.lw-rearrange-bar`, "Rearranging — drag people…", Auto-sort, Done) is
  DELETED; the toggle lights accent while on and is icon-only (⇅) on a phone.
  **No Auto-sort button anywhere** — the store's `autoSortRoster` stays for the
  tests; don't re-add the button or the strip without his ask. **His ask came 24 Sep 26 (D160): a "Reset order"
  line in ⚙ Settings — not a button or a strip.** In Rearrange the
  frozen NAME column WIDENS by the grip's footprint (`.mx-outer.mx-arranging`
  re-sets `--who-w`, 136px desktop / 92px phone) so callsigns keep their at-rest
  width beside the ⠿ ("not … shortened"); the header mirror and strip geometry
  re-pin on `arranging`. The corner cell is empty (5 Sep 26). Don't move config
  onto the grid or rearrange into a sheet (a Sheet's scrim swallows the drag's
  taps), and don't push OIL back to the far edge.
- **Who-wins follows the page order by default** (reversal of 28 Aug "two separate
  orders"). Group higher on the page wins a tie; dragging a category reorders
  who-wins with it (`groupPriorityIds` until `groupPriorityCustom`). A hand edit of
  the ⚙ "Who wins" list switches to CUSTOM; "Match the page order"
  (`clearGroupPriority`) clears it. **Standard categories OVERLAP** — a category is
  a FIT check (`people.ts fitsCategory`), so an SXO IP fits both and IP-above-SXO
  draws them under IP; `groupOf` = first fit down `GROUP_ORDER` (untouched page
  unchanged). Two fits stay exclusive by design: ground crew fit only Personnel;
  OCU fits OCU but never OPS P/W. `sxo`/`san` are never offered as qual groups (they
  ARE the SXO cat / SANS group; a stored one is pruned). The store's
  `autoSortRoster` buckets by live grouping (`liveAutoOrder`) — no button calls
  it since 6 Sep 26 (above); an empty `rosterOrder` shows the same order.
- **A chip shows only the CAT; hover/tap reveals DISPLAYED quals in group colours.**
  Chip stays CAT-coloured (`catClass` off `groupOf`), never encodes a qual. The
  popover (`qualpop`, screen-fixed so the frozen column can't clip it) lists ONLY
  the qual GROUPS on the page the person matches, each pill its group colour, + SXO
  gold when present. Undisplayed quals not listed; an empty chip is inert (no
  `.has-quals`). Click swallowed (doesn't open figures sheet); dismissed by
  pointer-leave, outside pointer-down, scroll, Escape, or a second tap — no scrim.
- **A qual group's colour is the admin's PICK.** `groupColors` (persisted
  `groupcolors`, admin-gated, `q:` ids + `#rrggbb`, dropped with the group, cleared
  by reset); `groupColorOf` falls back to a deterministic palette (`qualSwatch`) so
  an unpicked group is never black. ⚙ list opens a 12-dot palette (`PALETTE`);
  built-ins/SANS keep their CSS-class CAT colours, no button. Pill text by luminance
  (`inkFor`). Palette closes on pick / outside click / Escape (per the popup rule).
  **NOT pruned at boot** — pruning is at read (`groupsInOrder`) and when the
  catalogue arrives (`setQualCatalog`); a boot prune once threw away every saved
  TF/NVG/custom group before Raptor's real column list landed (bug hunt, 4 Sep).
- **The ⚙ groups list drags too.** Rows carry `data-grow` + a `⠿` grip wired to the
  same `GROUP_DRAG` → `moveGroupTo` as the grid heading, so the two never disagree
  (SANS has no grip, auto-placed at the foot). "Drop after row X" resolves from the
  hovered row's OWN container, never a document-wide query. Every draggable list
  shows the bar on the hovered row's bottom edge for a lower-half hover.
- **Pilots above WSOs inside every block, ALWAYS.** `rankCompare` sorts seat before
  `CAT_RANK`; `displayRoster` partitions each block by seat around the hand-order —
  a drag can't carry a WSO above the pilots (single-seat blocks untouched). The
  callsign wears a FULL-WIDTH seat-colour bar across the frozen column (pilot olive,
  WSO green; `.cs.seat-*`, `flex:1` to the CAT chip). LW bars are DARKER than
  Raptor's pucks — explicit deep-olive/deep-green hex in `matrix.css`, NOT
  `var(--fcp/--rcp)` (never darken the flight line via scheduler.css); ground crew
  keep a light bar off pure white. Phone (≤430px): bar side-padding tightens to 4px.
- **The qual catalogue is Raptor's LoX column list, not the holders.** Column list
  lives in `engine/qualcols.ts`; `qualCatalogue` takes keys+headings from it,
  appending any key someone still holds after a removed column (ticks survive).
  (The old "known gap — the column list isn't saved across reload" was SUPERSEDED
  by the 8 Sep 26 storage work: `qualcols` is one of the durable settings keys,
  saved and reloaded by `engine/qualcols.ts`. Corrected 17 Sep 26.)
- **Show SANS = SANS as their own counted group at the foot.** Injects `SANS_GROUP`
  (auto-managed, never stored) LAST on the page / FIRST in who-wins, so shown SANS
  draw together; they still count in manning by seat+band (a group never moves a
  count — `groups.ts` invariant).


### Leave War grid performance (split 24 Sep 26 from "Leave War grid & scheduler render/drag performance")
Full detail for this whole group: `docs/performance.md` (Part 1 invariants + Part 2
ledger). Read it before any layout/render/drag-touching change. *(Heading and intro copied at the split; the
scheduler half of the group — the board DOM ceiling, the dragged ghost, the per-block day swap — is in
`scheduler.md` §Settled before this list.)*

- **The open-bidding dates wear a glowing dark-green border on the LW grid** (owner,
  1 Sep 26). One overlay `.lw-bidbox` (`Matrix.tsx measureBidBox`) around
  `bidFrom..bidTo`, shown only while `stage==='open'`. Colour `rgba(74,140,100,.80)`
  + low-opacity halo (the lighter of two faded greens he compared; deeper
  `rgba(56,104,76,.78)` was the other) — don't brighten or swap to `--ok` without
  asking. *[AMENDED 15 Oct 26 by D881: no glow and no halo — the green border alone (the design guide's "no mark in
  this app glows", D887).]* OUTLINE ONLY — he declined the faint-green wash (built, one-line add if he
  asks; don't re-pitch). `ui-contracts.md` §The open-bidding box; pin
  `e2e/leavewar.spec.ts`.
- **The tab opens on the war being bid on, at the start of its bidding window**
  (owner, 7 Sep 26 — "the default view … is always the start of the period in which
  it is opened for bidding, followed by bidding closed, followed by published"). Boot
  picks `currentId` by STAGE (open→closed→published→draft, `stages.ts
  pickDefaultPeriodId`) on EVERY load — a remembered `current` is recorded but
  deliberately NOT honoured at boot (owner reaffirmed 17 Sep 26; it briefly WAS
  honoured after the 8 Sep storage seam made the tab persist, which silently
  reopened the squadron on whatever war was last glanced at. A picker switch
  still holds for the rest of that session). Pinned by
  `state/store.test.ts` "records the chosen war but does NOT reopen on it".
  The grid lands on
  `period.ts defaultFocusDate` (`bidFrom ?? start`) once on first show
  (`LeaveWarPage.tsx` → `focusDay` → `Matrix jumpTo`, the under-manned jump path — so
  it preloads the target months and scrolls there), and `selectWar` lands the same way
  on a picker switch. The column window builds AROUND that month, not month 0 — don't
  reset it to 0 on a war change or the desktop whole-year fill drifts the landing back
  to January (the phone's rolling window doesn't). Reads the same `stage`/`bidFrom` as
  the open-bidding box; keep them in step. `ui-contracts.md` §The Leave War opens on
  the war being bid on; pins `stages.test.ts` / `period.test.ts` / `leavewarpage.test.tsx`.
- **The Leave War year grid: one draw-toward-a-target window engine** (owner, 3–5 Sep
  26). Whole months at real widths over year-wide PLACEHOLDER cells (one empty cell
  per side per row, as wide as the months it stands for), drawn IN PLACE while the
  scroll is still moving. One loop `colwindow.ts stepToward` toward a per-mode TARGET:
  phone = rolling window a few months ahead (prune at rest); desktop on-screen = whole
  year (scrollbar slides); desktop off-screen = capped `HIDDEN_MONTHS`, drawn only
  while idle (`state/idle.ts`). Shrinks on leave (dropped months → measured-width
  placeholders, scroll kept), rebuilds on return; pre-warmed hidden after login
  (`Shell.tsx`, idle-gated). Load-bearing invariants: `docs/performance.md`
  §Leave War window engine holds them in full — the short form (don't undo): a drawn month keeps
  its MEASURED width in the placeholder (`monthPxRef`); never draw/prune an
  estimated-width month left of the view mid-scroll; placeholder widths are INLINE
  styles, never a CSS custom property on `.mx-outer` or ANY grid ancestor (restyles
  ~7k nodes; `--lwx-max` lives on the frozen bar's own box); EVERY row incl header
  carries identical cells (the owner's iPhone/WebKit is the gate); on-screen signal is
  `screen.ts` (a listener set, NOT the store — never repaint the grid on tab show);
  `PersonRow` day cells stay one memoised `PersonMonth`/month; keep `.mx tbody tr
  {position:relative}`. This reverses the 3 Sep "never fixed-width spacers" and the
  4 Sep "desktop keeps whole year / never prune" — the reveal cost is why.
  `ui-contracts.md` §The Leave War grid draws a window of months; HANDOFF-ARCHIVE.md
  (the 5 Sep 26 entry); pins `colwindow.test.ts` + e2e.

## Architecture — moved from `raptor-port/CLAUDE.md` §Architecture rules (24 Sep 26)

The Leave War's architecture rules, MOVED WHOLE, word for word (D138), so they load with this area instead of
in every chat (D140). The rules every area shares — the store, the mutation and persistence funnels, what
persists, the one command layer — stay in `raptor-port/CLAUDE.md` §Architecture rules. Paths inside this
section are relative to `raptor-port/` (as they were in that file).

**The Leave War tab is a SECOND app with a SECOND store** (vendored 16 Aug
26, `src/leavewar/`). It keeps its own store/notify/useVersion, its own
`state/storage.ts` seam (NOT `HOOKS.storeBackend`), and its own vitest project
(fixed TZ + jsdom + 20s timeout — see vite.config.ts). **IT PERSISTS — the
17 Aug 26 "session-only" decision was SUPERSEDED by the 8 Sep 26 storage work
(corrected here 17 Sep 26 after both reviewers found this reading as live).**
`main.tsx` boots it on the WHITEBOARD (`lwInitStore(leavewarAdapter(wb))`), so
on a built site a world that came back from storage keeps its wars, its OIL
story and its inputs; `installDemoWorld` overlays the demo only on a
first-ever boot. `memoryBackend` is now the DEV/TEST path only (`vite` dev,
`MODE==='test'`, `?fresh=1`, or a browser whose storage can't be touched —
`storage/boot.ts chooseBackend`). **Do not "restore" session-only behaviour or
delete this persistence as unintended — it is deliberate.** The seam interface
(`state/storage.ts`, `memoryBackend`/`localBackend`) stays; the shared database
replaces the implementation behind it. What is stored: `docs/data-schema.md`. Four seams cross the boundary, and only
four: `main.tsx` boots it once *[since 30 Sep 26 through `src/boot.ts`, the boot moved whole out of `main.tsx`, which
hands it the boot policy — on a shared store no demo world and no seed war; a store may then hold NO war, and the page
says "No leave period yet" (`[DB-READINESS]` group A phase 5)]* (`lwInitStore` → `installDemoWorld` →
`wireLeaveWarSync` → a `histInit` re-baseline, in that order), `resetSession`
derives its role from the Raptor login (`store.ts:toggleRole` — the admin's
view-as-member flip, 27 Aug 26 — is the only other production writer, riding
this same seam so the war always reads the session's EFFECTIVE role; on the
Leave War itself, moving the cycle stage forward became admin-only the same
day — members still bid) *[AMENDED 26 Sep 26 by `[ACCOUNTS]` (D166 (3)): the toggle is gone — `resetSession` was then the ONE production writer
of the war's role. AMENDED AGAIN 27 Sep 26 by D292, built with `[POST-OUT-OUTCOMES]`: the admin's member view is back —
TWO production writers now, `resetSession` (every sign-in starts as admin) and the switch (`state/store.ts
switchRoleView`), both on this same seam]*, `probe-bridge.ts`
exposes `w.lwSetRole` for its e2e suite *[the whole bridge on the developer's PC only since `[ACCOUNTS]`]*, and **`src/leavewar/sync.ts`** — the
sync wires (17 Aug 26; this seam also mirrors Raptor's "View as" person *[since `[ACCOUNTS]`, 26 Sep 26 — D166 (4): the
SIGNED-IN person, `state/perms.ts viewerId()`; '' (no row) for someone signed in without access]* into
the Leave War store's `viewer` on every Raptor notify — what lights the
viewer's row and personalises the counter picker — a rider on this seam, not
a fifth): Leave War's roster is a boot-time PROJECTION of
Raptor's PEOPLE; **an absence is ONE record — the Raptor Input ([ARCH-STACK]
step 4, 20 Sep 26; SUPERSEDES the 17 Aug two-way copy: `runInbound`,
`runOutbound`, `retractLwRow`, `ingestFromRaptor` are deleted)**. The war
stores only its own records — a LIST per person/date of requests, OIL credits
and replaced-bid notices (`engine/warrecs.ts`) — and DERIVES everything it
shows about leave, medical, courses and overseas duty from the Inputs on read
(`sync.ts:refreshAbsences` → `state/merge.ts` → `engine/dayview.ts`: one main
code by the agreed ladder, grey `+n` / amber `!`, charges by halves). Approving
on the war writes the Input inside the same command (the absence door in
`sync.ts`, installed on the store, carrying `lw` = the war id as provenance).
The owner's clash rules run at ONE seat inside the Raptor inputs door
(`leavewar/inputgate.ts` via `state/inputgate-hook.ts`: sick cuts leave, no
overlapping leave / leave over a medical / leave over recorded work, a
clashing input replaces an undecided bid with a notice) — and on undo/redo, and
publishing a weekend/PH day replaces a clashing bid inside the publish command. *(SUPERSEDED 20–21 Sep 26 — marked
24 Sep 26 by the amendment re-test, per D90: "keep the bid and flag the day, both ways" — publishing KEEPS a clashing
undecided bid and flags the day; `leavewar/sync.ts` `publishFlagsBids`, pinned by `leavewar/publishdoor.test.ts`;
register AM48c.)*
Rules of record: `docs/superpowers/specs/2026-09-20-arch-stack-4-clash-check.md`.
Weekend/holiday WORK — the
PUBLISHED schedule plus acknowledged Duty-&-commitments input claims
(`row.oil`, the OilConfirm ask-flow, 28 Aug 26) — credits OIL as a third
derived pass (wire 4, `runOilPass` +
`engine/oil.ts`, one ≤6h/>6h test on the day's start-to-finish ENVELOPE
since 29 Aug 26 — gaps between events count, and the schedule half reads
every visited week via the session stash, not just the loaded one — the
ownership partition is by cell vocabulary, FO/HO vs
leave codes; credits are `oil:'auto'` records with the work times). Editing
or deleting a war-approved Input on the Inputs page needs no carry-back any
more — the war simply re-reads it (a member's own date/type edit clears `lw`,
so it gains the blue "filed on the Inputs page" edge, owner 19 Sep 26). The roster is a LIVE projection since 18 Aug 26: `sync.ts:reprojectRoster`
re-projects Raptor's PEOPLE on every Raptor notify (change-guarded), so a body
added on the Quals page reaches Leave War without a reload — a rider on this
same seam. Its DISPLAY is categorised (`engine/people.ts:groupOf` — SXO / IP /
OPS P by CAT / IWSO / OPS W by CAT / OCU / Personnel, colours from Raptor's
`--q-*`), and ground crew ride it (`pers`, seat `gnd`) but are skipped by every
manning count (`countsFor`); `categoryOf` and the thresholds are untouched.
The PUBLISHED remarks editor (27 Aug 26) rides this same seam in the war→Raptor
direction: `sync.ts:leaveInputAt` finds the Raptor input a war cell derives
from (through the day view), and `RemarksSheet` saves through Raptor's own
`setLeaveRemarks → commitInputEdit` — a remarks-only edit. A day holding more
than one record opens the TAP LIST instead (`ui/DayList.tsx`), each record on
its own line with its own actions. Don't add a fifth seam casually,
and never call its `initStore` from a component — it clears the store's
subscribers.

**SAVED ONE ROW PER RECORD, FROM THE COMMAND STREAM (`[DB-READINESS]` group A, phase 3, 30 Sep 26 —
`src/leavewar/state/rows.ts`).** A war, each of its records (`rec:<war>:<recId>`, with its person, date and place
`ord`), each ledger entry, each opening and each man's profile (window + label) is its own stored row; the store
subscribes to the one command stream it already joined and writes, through its OWN door, exactly the rows each
command's changes land in — a move is one row, a row goes only for a record that command removed. Not a fifth seam:
the war still stores only through `state/storage.ts`. `rawPersist` writes nothing; a change outside every command is
not saved. **No Edit person (D460, D461):** the war keeps no seat, band or SXO of its own — `setPerson`,
`PersonSheet.tsx` and `personEdits` are gone; the projection's are the man's (Quals is the one place they change).
Detail: `raptor-port/docs/data-schema.md` §World 2.

**THE CALENDARS READ THE WAR THROUGH `sync.ts` — a rider on that seam, not a fifth (the Inputs / SANS redesign, 7 Oct 26;
D617, D627, D640; the plan `raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` §3.1).** Two stores
hold the facts of one day: its flying class and required pilots and WSOs are the scheduler's settings rows
(`state/flyplan.ts` — they outlive any one period); whether it is a public holiday or an Off day, and who is available
per seat, are the war's. `sync.ts` hands the war's half over, read only: `dayFacts(iso)` (from the period HOLDING the
date, never the one on screen), `holidaysIn(year)`, and the signal `useWarFacts()` — a version that moves when anything
those read has moved (a day's events, a band, the event types, a period, the count rows, the roster, a bid, an absence,
an Undo of any) and stands still for a look. It is NOT the OIL-only Raptor notify, which stays as narrow as it is. The
ONE place the two halves are joined is `state/flyplan-model.ts planFor`; a screen that joins them itself is a defect.
Who is available is the two Available rows (`engine/availrows.ts`, ids `availp` / `availw`): ordinary count rows an admin
renames and re-defines, summed by ONE function that never counts a SANS man, never drawn or judged with the Manning rows. *[AMENDED 8 Oct 26 by D665: they ARE drawn in the Manning block now — its last rows, with the two Required rows, by `ui/FlyRows.tsx` — still never as rows of the Manning list (`manningRowIds`), and still never judged.]* *[AND SINCE D674 (8 Oct 26) NOT ALWAYS ITS LAST ROWS: a counter may stand above the four, between any two of them, or below all four. The block's ONE order is `state/store.ts manningBlockOrder` — the counters and the four rows' tokens, read by the pure `engine/fixedrows.ts`; `manningRowIds` is still the counters alone, and the calendars still find the Available rows by their rule ids.]*
**And the war reads the flying plan through the same file — the second rider:** its Required rows reach the scheduler's
records and typed commands only through the re-export at the foot of `sync.ts`, and every screen that shows a day's
class, required figures or how many more are needed asks `sync.ts flyAnswer(iso)` / `flyMonth(y, m)` — the plan, the
war's facts and the SANS committed to fly (`state/flyplan.ts sansFly`: only a SANS man, never one archived) handed to the
ONE resolver. **The Holidays list writes the war's own record** (D638 — two doors, one record): `holidayAdd` /
`holidayChange` / `holidayRemove` (`state/store.ts`, pure half `engine/holidays.ts`) write a tagged day event or a merged
band into the period HOLDING the date, on the first Event row free across the range, each ONE named command
(`lw.holiday.*`); a change is checked whole before anything is taken away.
**WHO READS IT, AS BUILT (steps 3 to 5 of that job, 8 Oct 26) — the list a new reader is added to.** On the scheduler's
side, six screen files import the war's half (and `probe-bridge.ts`, for the browser tests), all from `leavewar/sync.ts`: the window called "Calendar" on screen
(`ui/DaysWindow.tsx` — `flyMonth`, `useWarFacts`) and its Holidays list (`ui/HolidaysPanel.tsx` — `holidaysIn`, the three
`holiday*` writers, `uncoveredIn(year)`: the runs of dates no period covers, said BEFORE a save is refused, and
`holidayWord(kind)`: the word a nameless holiday is saved under); the SANS month, its opened day and "+ Commitment"
(`ui/SansCal.tsx`, `ui/SansDay.tsx`, `ui/sansadd.ts` — `flyMonth` / `flyAnswer` for the need, `dayFacts` for the tag);
and the Inputs month (`ui/InputsCal.tsx` — the date's tag only: PH, an Off day, NF; no sun, no moon, no figures — D627).
`dayFacts` answers `covered:false` with both counts `null` for a date no period holds — who is available is then
UNKNOWN, and every reader prints a dash, never 0 — and carries `short`, what the Event row prints for that holiday
(D652), so a calendar's tag and the war's grid cannot differ. **Two doors cross the boundary, and each reaches a flag,
never a screen:** `sync.ts openDays(iso)` — the "Calendar…" line in the war's ⚙ — sets the scheduler's open-flag
(`ui/pops.ts`) and the window itself stays the gate (admins only); `sync.ts openNewPeriod(from, to)` — the Holidays
list, on dates no period covers — leaves an ask for the war's own top row (`leavewar/ui/warask.ts`, never the war's
store: an ask is not a fact about the war, so it is not saved, not undone and repaints no grid) and brings the Leave
War to the front, where the war's own sheet checks everything itself. The war's four rows repaint on two signals of
their own (`usePlanVersion`, `useWarFacts`) inside `leavewar/ui/FlyRows.tsx`; `Matrix` and the memo firewall are not
touched (`raptor-port/docs/performance.md` §E).
