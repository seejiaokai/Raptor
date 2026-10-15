# The design guide's "one row of controls" rule — draft and its places (D911, D912)

**Status: DRAFTED — v2, after one fresh reader's read of v1 (the night of 15 Oct 26) — for his approval** — this file is the rule's home until its wording is approved and moves into
`raptor-port/docs/design-practices.md`. Backlog: `[GUIDE-ONE-ROW]`, `[MEDICAL-ONE-ROW]`.

## Where it came from
On 15 Oct 26, shown the Inputs list on a phone — "+ Input" and the dates button on a row of their own under the row of
the calendar / list switch, the filter and the gear — he circled the two buttons: *"Why don't u move these 2 buttons up
and align them with the row above? And same height"* (D907). Drawn on the real app and approved as drawn (D910 —
`raptor-port/scripts/handpass/mock-inputs-toolbar.mjs`, pictures
`raptor-port/docs/img/handpass/2026-10-15-calendar-step-two/question/toolbar-*.png`). Asked whether the design guide
should carry what that correction says about the app (D852), he answered yes (D911 — "All as recommended").

## The rule, in the agent's words (to be drafted properly)
A page's own buttons share its one row of controls, at that row's button height, instead of taking a second row for one
or two buttons. What a draft must settle: what counts as "the page's own" buttons; what happens when the row runs out of
room on the narrowest phone (D910's answer for the Inputs list: the right-hand buttons keep their size, the dates
button's words get shorter); that a heading repeating the tab's name is not a reason for a row (D846's test).

## The steps (D911, D852, D70)
1. Draft the wording here, against `raptor-port/docs/design-practices.md`'s own structure.
2. One fresh reader reads it (D70 — never its writer); take or answer every finding.
3. Put the wording to him; the guide changes only on his approval.
4. Each place that breaks it is put to him with a picture (D853) — nothing changes before he rules.

## The places known to break it
1. **The Medical tab (D912):** its "Medical" heading repeats the tab's name and its "as of" date button stands on a
   taller row of its own (about 44 tall). Ruled: the heading goes, the date button stands in a row under the tabs at
   36, as on Inputs and SANS — drawn for him first, its own small job. Picture of today:
   `raptor-port/docs/img/handpass/2026-10-15-calendar-step-two/question/medical-today-390.png`.
2. **The sweep, 15 Oct 26** — every page's top at a phone's size (390 × 844) on the built app,
   `scripts/handpass/mock-medical-one-row.mjs`, pictures `docs/img/handpass/2026-10-15-medical-one-row/sweep-*.png`:
   - **Quals** — "Export to Excel" stands on a second row with the filter, under "Enable editing" and the date: the page's
     own buttons on two rows (`sweep-quals.png`).
   - **Logic** — "Edit rules" alone on a row under the filter chips (`sweep-logic.png`) — rides with the Logic page's own
     redesign (D809, D925). (Its "Logic" heading repeats nothing on screen — the top bar shows only the logo — so it is
     not a case; the line under it is a D846 candidate for that job.)
   - **Edit Schedule, View-only Sched** — the "Legend — colours & flags" fold alone on a row under the tools: a fold, not a
     button; put to him as a question, not counted as breaking it (`sweep-editsched.png`, `sweep-viewsched.png`).
   - Not a case (the reader, v1): **Admin** — no buttons on its first row, and its heading is the only sign of the page.
   - Keeping it: the Inputs and SANS calendars (one row — D910 and D698), the Leave War (each row full), the Tracker (its
     rows full), the Medical tab (place 1 above).

## The draft (v2, 15 Oct 26 — v1 read by one fresh reader; for him, D911, D70)

**Where it goes:** `raptor-port/docs/design-practices.md` §3 "Layout and grouping", as a bullet after "Group with the space
already there…" — it is that rule's case for a page's controls.

**The wording:**

- **A page's controls are one row (owner D907, D910, D911 — 15 Oct 26).** The page's row is the first row under the
  app's top bar and under the tabs that switch between pages (Inputs · SANS · Medical) — those two are not the page's
  row. The buttons that belong to the page in view — what it adds, the dates or filter it is read by, its settings —
  stand in that one row, at its button height (where the row holds only the page's own buttons, the height of the app's
  other rows of controls: 36 — D698, D912), even when the row holds one button. One or two buttons never take a second
  row of their own. Taking the row's height is this rule's one change of a button's size; any other change of size still
  needs his word (D487). A heading that only repeats the name of the tab already picked above it is a delete candidate
  (§1, D846), put to him with its picture; if it goes, what stood beside it joins the row. **When the row runs out of
  room on the narrowest phone,** a button keeps its size and its place, and its words take a shorter form (the Inputs
  list's dates button, D910) — drawn for him first; if shorter words still do not fit, the layout is drawn and put to
  him — this guide does not choose it. Not the page's own, and not in its row: a window's or a sheet's own buttons
  (they keep their bar — "One main button" above), the controls of one item in a list (its row carries them), and a bar
  the app shows for a while (the "Not saved" warning, the bar that waits for an OIL answer — D587, D840). A fold is not
  a button: where one stands alone on a row (the Legend), it is put to him. The rule holds on a phone and a desktop
  alike; where a desktop page already keeps its buttons in one row, nothing changes there.

## The read of v1 (one fresh Opus reader, 15 Oct 26 — saved whole in substance; the writer never reads its own, D70)

Verdict: sound in its core; matches D911 and drops nothing of it. Its changes, every one taken into v2:
(a) v1's "only then may the row wrap, the main button in the first line" invented a wrapping rule he never made and let a
second row back in — v2: a layout that still will not fit is drawn and put to him. (b) v1's "or its icon alone" was the
agent's idea; D910 only shortened words, and nothing is reworded on the guide's word alone (§0) — v2: shorter words,
drawn for him first. (c) v1's "it goes" turned a D846 candidate into a deletion, and "or the page's name" over-reached —
v2: a heading repeating the tab picked above it is a delete candidate, put to him. (d) v1's "beside … the tabs' own
controls" could put a button in the tab row, against D912 (the date button alone in a row under the tabs) — v2 names the
top bar and the tab row as not the page's row, "even when it holds one button". Also taken: the height where a row holds
only one button (36 — D698, D912); the D487 line (the row's height is this rule's one change of size); the fold line; a
desktop line; "the bar that waits for an OIL answer" in plain words. The sweep: Admin dropped (no buttons; its heading is
the page's only sign); Logic's heading dropped (it repeats nothing visible), its "Edit rules" row kept.
How it tested: Quals decides correctly ("Export to Excel" joins "Enable editing", the date and the filter — if the four do
not fit at 390, it is drawn for him); Medical decides correctly after (d); five buttons on a 320-wide phone go to him.
