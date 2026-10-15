# The design guide's "one row of controls" rule — draft and its places (D911, D912)

**Status: NOT YET DRAFTED** — this file is the rule's home until its wording is approved and moves into
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
2. (A sweep of the other pages is part of step 1.)
