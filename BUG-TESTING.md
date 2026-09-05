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

> **Deferred (owner will revisit):** add a short "how to run a pass" checklist
> to this file (test the batch → run the six gates → record clean/found). Not
> done yet — the owner is working on the rules logic first (Tier 1 below).

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
| 27 Aug 26 (overnight) | **adversarial agent sweep** (fixes in #334) | everything in #333 + #334: Leave War store/permissions, drag/move gestures, medical engine & trims, documents & Medical view, admin-vs-member authority, the sync seam — ~24 confirmed findings fixed, each pinned |
| 28 Aug 26 | **upchit semantics rework** (rides #334) | the owner's two morning decisions: the upchit day is a FIT day (statuses end the day before), and an upchit save always shows a summary sheet with a forced Keep/Remove on any later-dated medical entry — pinned in `medical.test.ts`, `medwrite.test.ts`, `upconfirm.test.tsx` — then extended the same day: a different-type medical overlap also asks at save time (the clash sheet, `medclash.test.tsx`) · and, later the same day, the clash sheet gained a per-leftover **Remove (default) / Keep** on the tail a middle takeover leaves — the owner's ATT C/ATT B inconsistency, resolved by making the tail an explicit choice (`medTailBeyond` + `keepTail`, pinned across `medical.test.ts`/`medwrite.test.ts`/`medclash.test.tsx`) · refined on the owner's preview feedback: flat un-boxed rows, "<new> replaces" / "Keep <old> till <end>" wording, and a clash covering the whole new entry offers no keep button (forced replace — the old "nothing left to file" dead end is unreachable from one clash) |
| 28 Aug 26 | **full-chat bug sweep** (owner: "do a full bug test of the implementations made in this entire chat"; fixes shipped as #335) | everything built across #333/#334/#335 — first-hand, two-phase: a static read of the engine and configuration layers (where a defect is SILENT), then live browser driving at 1500px and 390px (where a UI defect surfaces). **Two real defects**, both fixed and pinned: adding a roster group did nothing at all (an appended group sorts LAST in the priority walk and `groupOf` is total, so the seven built-ins had already claimed everyone — the editor reported 44 people while the grid changed by zero rows, and the owner's own "qualification column beats CAT column" case was unreachable from the UI), and nothing on the Leave War tab closed on Escape (no sheet, no Legend, no under-manned list, while the input editor and the Medical as-of picker both did). **Six false positives were run down and discarded** before anything was reported — all were faults in the sweep's own probe scripts (a `CSS.escape` call in Node scope; `\b` regexes run on `textContent`, which concatenates adjacent nodes; the phone rendering the roster twice, real grid + frozen band overlay, both matching `.mxbody`; a `.sub` selector hitting a duty table; `#inRangeDef` living behind a closed calendar; an under-manned chip correctly `disabled` at 0 days). Read and found clean: the medical derivations and both trim planners, the clash/leftover selectors, the look-ahead setting and its untrusted load, the group storage guards and catalogue prune, the category fold (the real grid and the frozen overlay drop the same rows), the Legend glossary, AM/PM wording, scroll-behind and panel drag, the Medical view with its date picker and document viewer, the Logic page for both roles, and member-vs-admin reach. Zero console errors at either width. |

Everything before batch #281 is the **squashed port** of the original
single-file app — covered historically by the 15 Aug sweep and held by the
byte-exact parity gate (`node reference/tfin.js`) rather than batch-by-batch.

---

## The batches (#281 → #335, then #368 — the #336–#367 rows are still to be backfilled)

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
| **#333** | Medical tracker: Upchit input, mandatory documents + viewer, Medically Down / Pending Upchit / Upchit Complete sections, overlap & trim rules · same-day follow-ups: admin's role-badge view toggle, Leave War stage-advance made admin-only, medical-type guard rail, Medical view polish, Leave War drag-select (batch fill/decide/delete/move) + Acknowledge→Pending rename · plus a second 27 Aug follow-up wave: a plain single click on a Leave War cell opens the input sheet again (pointer-capture fix), the dotted "moved" mark shows only after bidding closes, "Key"→"Legend", the admin keeps bid decisions at PUBLISHED, and on the Inputs page a member defaults to their own inputs and can edit/delete only their own (view-only + attachment-view on others) | ✅ 27 Aug overnight adversarial sweep + 28 Aug full-chat sweep both covered its logic — owner's own pass still to come (it stays at Tier 1 in the queue below for that reason) |
| **#334** | Leave War member row scoping + moved-stripe recording, then the 27 Aug overnight adversarial sweep: the single-bid mover obeys the closed-war/day law (no more off-war landings), single-bid decisions are admin-at-closed in the store, chained moves keep the original origin, honest batch counts + the partial-write note stays readable, a member can't write medical marks, an upchit no longer deletes a future medical entry, a mid-span medical drop splits instead of erasing the tail, downchit-over-upchit / junk-upchit / blank-date / retype refusals, documents don't ride type switches and survive war-side date changes, undo of a war-synced edit no longer double-deletes, the published note editor opens the right record, one sheet per tapped cell, refused/pending cells aren't dead-tappable at published, move preview only shows what would land, legend & popover fixes, "View as" resets on logout, dead member write-gates fixed (role literal) · then the 28 Aug daytime asks: the Logic subtitle made role-accurate, minimise (fold) a Leave War category, the admin roster-group editor (qualification groups, drag order, separate who-wins list, tap-to-highlight), the configurable Inputs look-ahead, the Legend code glossary, and a merged bar as the default for a new event range | ✅ 28 Aug — full-chat bug sweep (fixes in #335); owner's own pass still to come |
| **#335** | Bug sweep on the whole chat: adding a roster group now actually claims its people (and the editor's counts say who it DRAWS, not who merely qualifies), and Escape closes every Leave War sheet, the Legend and the under-manned list | ✅ 28 Aug — this batch IS the sweep; its own two fixes are pinned by tests that were verified failing without them |
| **#368** | Leave War: the on-grid Rearrange bar (Auto-sort / Done) now paints at once on iPhone instead of waiting for a touch — its own compositor layer, one CSS line · the ARCHIVE bar under the manning counters: in Rearrange the eye archives a row out of view, the bar opens to bring one back with ↺ · in Rearrange the ⠿ grip sits to the LEFT of each counter name and the eye is centred alone in its box (phone: the longest name, CREW SETS, still reads whole) · the counter block's top controls are ONE row — Manning · ⚙ · Rearrange · OIL, OIL right after the last control, a member sees Manning · OIL; the "JAN – DEC 26 · 365 days · 50 people" line is gone (the period name stays in the Period picker); the Rearrange toggle moved up from the grid corner into this row; "OIL tracker" reads "OIL" on a phone · the EYE (and ↺) in each counter row's balance box now paints at once on iPhone when Rearrange is tapped, instead of waiting for a tap or a scroll — the same own-layer cure the bar got (owner's 6 Sep screenshot: the bar painted, the eyes did not) · then (6 Sep) the blue "Rearranging — drag people…" strip with Auto-sort and Done is GONE: the ⇅ toggle in the top row is the way in AND out (lit light-blue while on), icon-only on a phone; in Rearrange the frozen name column grows by the grip's width so callsigns are not shortened to "Re…" — same room as at rest | ⬜ — owner to confirm on his iPhone against the preview: eyes paint at once; ⇅ in/out; no strip; names whole in Rearrange with the balance column still joined to the name column and the frozen date header still lined up (WebKit-sensitive: sticky columns re-anchor on a width change) |

## The queue — ordered by risk (do these next, top first)

Risk here means **how silent a bug would be**, not how likely. A wrong crew-rest
flag or a mis-dated input can sit unnoticed and burn someone; a broken arrow
button announces itself the moment you press it. So the validation engine,
roles, dates and saved data go first (`CLAUDE.md` §How to work here: escalate
"where a defect would be SILENT rather than obvious").

### 🔴 Tier 1 — test first (silent + safety/data critical)

The rules engine, crew-rest safety, who-can-do-what, dates, and saved data.

1. **#281** — Rule interdependencies: one knob updates every reader *(engine core)*
2. **#282** — A double-booked man: the clash warning fires correctly *(clash detection)*
3. **#288** — Crew-rest warning reads once, cause-first *(crew-rest safety flag)*
4. **#319** — SC B box is an in-time *(rules engine)*
5. **#320** — MAIN/SPARE toggle's reach into the rules engine *(roles × engine)*
6. **#321** — Early SC B counts toward the long day; in-time window advises *(rules engine)*
7. **#331** — SANS in-time window + A chip *(SANS availability engine)*
8. **#311** — Every input date anchored to a real year, no cross-year bleed *(silent date bug)*
9. **#313** — Late-input deadline runs with each input's own week *(silent deadline logic)*
10. **#316** — Accounts renamed; demo accounts no longer printed *(login / auth)*
11. **#317** — SC MAIN/SPARE badge + probes learn renamed accounts *(roles × engine)*
12. **#283** — Scrubbed demo data + switchable second week *(saved week data)*
13. **#325** — Admin console + **flexible clearing** *(roles + a destructive wipe; the Help tab / motion parts are low-risk)*
14. **#333** — Medical tracker: Upchit trims, mandatory documents, permissions *(rules engine + roles + data lifecycle — silent-failure territory)*

### 🟡 Tier 2 — test next (functional, failures usually visible)

15. **#289** — Inputs month calendar + per-type All-day defaults + colour code
16. **#286** — Five UI asks + SQN strip (undo-a-mute, public notes, reminders)
17. **#323** — Highlight groups (OR/AND) + pucks drag-swap + palette *(the filter bar was already checked 26 Aug)*

### 🟢 Tier 3 — test last (cosmetic / navigation, a bug shows itself instantly)

18. **#315** — Desktop arrow from Saturday reaches Sunday in one press
19. **#322** — Desktop day arrows: proxy scrollbar no longer cancels the glide
20. **#326** — Desktop day-arrows: mid-glide cancellation that skipped a day

---

_Handoff/docs-only PRs (#285, #287, #290, #292, #318, #324, #328, #330, #332)
ship no behaviour and need no bug pass._
