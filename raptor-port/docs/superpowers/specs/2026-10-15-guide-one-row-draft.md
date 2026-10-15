# The design guide's "one row of controls" rule — draft and its places (D911, D912)

**Status: DRAFTED (v1, the night of 15 Oct 26), read by one fresh reader — for his approval** — this file is the rule's home until its wording is approved and moves into
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
   - **Logic** — a "Logic" heading that repeats the page's name, and "Edit rules" alone on a row under the filter chips
     (`sweep-logic.png`) — rides with the Logic page's own redesign (D809, D925).
   - **Admin** — an "Admin" heading that repeats the page's name, on a row with nothing beside it (`sweep-admin.png`).
   - **Edit Schedule, View-only Sched** — the "Legend — colours & flags" fold alone on a row under the tools: a fold, not a
     button; put to him as a question, not counted as breaking it (`sweep-editsched.png`, `sweep-viewsched.png`).
   - Keeping it: the Inputs and SANS calendars (one row — D910 and D698), the Leave War (each row full), the Tracker (its
     rows full), the Medical tab (place 1 above).

## The draft (v1, 15 Oct 26 — for one fresh reader, then him; D911, D70)

**Where it goes:** `raptor-port/docs/design-practices.md` §3 "Layout and grouping", as a bullet after "Group with the space
already there…" — it is that rule's case for a page's controls.

**The wording:**

- **A page's controls are one row (owner D907, D910, D911 — 15 Oct 26).** The buttons that belong to the page in view —
  what it adds, the dates or filter it is read by, its settings — stand in the page's one row of controls, at that row's
  button height, beside the switch, the tabs' own controls or the arrows already there. One or two buttons never take a
  second row of their own. A heading that only repeats the tab's or the page's name is no reason for a row (§1, D846):
  it goes, and what stood beside it joins the row. **When the row runs out of room on the narrowest phone, the words
  shorten before anything moves** — a button keeps its size and its place, its label takes a shorter form or its icon
  alone (the Inputs list's dates button, D910) — and only then may the row wrap, the page's main button staying in the
  first line. Not the page's own, and not in its row: a window's or a sheet's own buttons (they keep their bar, §3 "One
  main button"), the controls of one item in a list (its row carries them), and a bar the app shows for a while (the
  "Not saved" band, the OIL bar — D587, D840).

**What the draft settles, from the brief (`2026-10-15-guide-one-row-draft.md`):**
1. *What counts as the page's own buttons* — what acts on, adds to or reads the page as a whole; not a window's, an item's
   or a passing bar's.
2. *The narrowest phone* — words shorten first (D910's answer), a button never shrinks (D487), the row may wrap only
   after that, the main button first.
3. *A heading that repeats the tab's name* — not a reason for a row (D846's test); the Medical tab's is the case (D912).

