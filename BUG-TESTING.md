# RAPTOR — bug-testing tracker

A running list of **every shipped batch**, so full bug-testing can be done
**batch by batch** and nothing is missed. Who built a batch doesn't matter
here — every batch gets checked.

Companion to `HANDOFF.md` (open work) and `git log` (the full story of each
change). This file answers one question only: *what has been bug-tested, and
what still needs it?*

## How to use this

- Work top-to-bottom, oldest batch first (or pick any ⬜ row).
- For each batch, ask Fable to **do a full bug test of that batch** — name the
  batch and its PR number so it knows the exact scope.
- When a pass is done, move the row's box from ⬜ to ✅ and write the date +
  what was found (or "clean — nothing found"). A clean pass is worth recording
  too — otherwise "not yet tested" and "tested, all good" look the same.

**Legend:** ✅ bug-tested (date — what was found) · 🟡 partly tested · ⬜ not yet
bug-tested.

---

## Bug passes already on record

These passes already happened; the ✅/🟡 marks in the table below trace back to
them.

| when | pass | what it covered |
|---|---|---|
| 15 Aug 26 | bug-test sweep | original app, pre-port (e.g. the stale AL-tint fix in `applyDayTpl`) |
| 18 Aug 26 | bug-sweep | the owner's "full bug" sweep on that week's work |
| ~Aug 26 (overnight) | **devil's-advocate pass on auto-land** | Ground-programme auto-land + the four board tools (batch #284) |
| 24 Aug 26 | **bug sweep** (shipped as #310) | the recent calendar, week-swipe and board work (batches #303–#309): cross-week glide stranding, board day-chip month strip, unaccept re-land on week return, calendar-popover stray drop, seated-puck ✕ |
| 26 Aug 26 | **bug pass** (fixes in #327/#329) | removed-input dormancy, SC MAIN per-type grading, the redesigned highlight filter bar, board trailing drop zones |

Everything before batch #281 is the **squashed port** of the original
single-file app — covered historically by the 15 Aug sweep and held by the
byte-exact parity gate (`node reference/tfin.js`) rather than batch-by-batch.

---

## The batches (#281 → #329)

| batch | what it is (plain language) | bug-tested? |
|---|---|---|
| **#281** | Rule interdependencies pinned so one knob updates every reader | ⬜ |
| **#282** | A double-booked man: the clash warning speaks alone | ⬜ |
| **#283** | Scrubbed demo data + a switchable second week | ⬜ |
| **#284** | Ground-programme auto-land + four scheduler-board tools | ✅ Aug 26 — devil's-advocate pass on auto-land |
| **#286** | Five UI asks + SQN strip (header trim, undo-a-mute, public notes, Personal-Inputs reminder, Available-crew open) | ⬜ |
| **#288** | Crew-rest warning reads once, cause-first · Inputs page column alignment | ⬜ |
| **#289** | Inputs month calendar + per-type All-day defaults + input colour code | 🟡 touched by the 24 Aug calendar sweep — worth a dedicated pass |
| **#303** | Phone week-swipe glide + three phone toolbar cosmetics | ✅ 24 Aug — bug sweep #310 |
| **#304** | Desktop scheduler: pinned crew-panel headings, weekend week-arrow fix | ✅ 24 Aug — bug sweep #310 |
| **#305** | Flagging engine reads across week boundaries | ✅ 24 Aug — bug sweep #310 |
| **#306** | Weeks remember edits, Sunday flags Monday's crew rest, next-week preview, unstuck swipe | ✅ 24 Aug — bug sweep #310 |
| **#307** | Desktop arrows reach the weekend, board week nav, phone swipe top-bar fix | ✅ 24 Aug — bug sweep #310 |
| **#308** | Week-nav fixes + Inputs calendar batch | ✅ 24 Aug — bug sweep #310 |
| **#309** | Phone week-cross glide: no more scrubbing through days | ✅ 24 Aug — bug sweep #310 |
| **#311** | Every input date anchored to a real year — no cross-year bleed | ⬜ |
| **#313** | Late-input deadline runs with each input's own week | ⬜ |
| **#315** | Desktop arrow from Saturday reaches Sunday in one press | ⬜ |
| **#316** | Login page stops printing demo accounts; accounts renamed | ⬜ |
| **#317** | SC lines: clickable MAIN/SPARE badge; probes learn renamed accounts | ⬜ |
| **#319** | SC: B box is an in-time; header note + blue brief suggestion dropped | ⬜ |
| **#320** | MAIN/SPARE toggle's reach pinned into the rules engine | ⬜ |
| **#321** | Early SC B counts toward the long day; cut in-time window advises | ⬜ |
| **#322** | Desktop day arrows: proxy scrollbar no longer cancels the glide | ⬜ |
| **#323** | Highlight group match (OR within / AND across), pucks drag-swap + picker order, available-crew-on-board, palette swap, phone top bar | 🟡 filter bar checked in the 26 Aug pass — groups/pucks/palette still open |
| **#325** | Admin console, flexible clearing, Help tab, day-head fix, motion set + speed-up | ⬜ |
| **#326** | Desktop day-arrows: fix the mid-glide cancellation that skipped a day | ⬜ |
| **#327** | Wave templates, blank waves, published-only marks, board stripes, highlight menus, version picker + mobile polish | ✅ 26 Aug — bug pass |
| **#329** | SC MAIN per-type grading, dormant removed inputs, UI polish | ✅ 26 Aug — bug pass |
| **#331** | Seam fixes, SANS in-time window + A chip, crew-panel & board-bar chrome, Leave War roster/grid, stores save flash | ⬜ (the 26 Aug pass predates it) |

**Not yet bug-tested (the working list):** #281, #282, #283, #286, #288,
#289 (dedicated pass), #311, #313, #315, #316, #317, #319, #320, #321, #322,
#323 (groups/pucks/palette), #325, #326, #331.

---

_Handoff/docs-only PRs (#285, #287, #290, #292, #318, #324, #328, #330, #332)
ship no behaviour and need no bug pass._
