# The amendment batch — the build plan (25 Sep 26, overnight, D112)

Written by the builder (Opus 5.5) at the start of the overnight chat on `claude/amendment-batch`. The WHAT is the batch
spec (`raptor-port/docs/superpowers/specs/2026-09-25-amendment-batch.md`, 14 items, every one a recorded ruling D91–D111
in `.claude/rules/decisions/scheduler.md`); this is the HOW. Nothing here re-decides a ruling. Where the rulings leave a
real product gap, it is marked **GAP** with the builder's call; the call is built and the gap is filed in `OUTSTANDING.md`
for his morning look (D112), never guessed silently.

## 0. Tier — FULL (bug-check order §5)

1 Money — **YES**: item 7 moves what a signature binds to on days whose OIL crowd (who earns) changes; a sign-off
decides what goes out and what earns. 2 Published record — **YES** (signing, the pending count, the load, the template
door, the issued face's marks). 3 Saved data — **YES** (the Original starts keeping its signers; AL records gain a
change count). 4 Shared drawer — **YES** (the puck mark, the version tag, the day head). 5 New gesture — **YES** (the
pending button and list, the one jump). 6 New surface — **YES** (the pending list, the Signed line). 7 Roles — **YES**
(who sees the Signed line: everyone on View-only Sched, D95). 8 Warning list — **YES** (the rings on the board, D94).
→ **FULL.** Order: rules sweep → the other models design the scenarios and attack this plan → build (red first) →
gates → roll-call + door check → walk (desktop + phone, every surface) → fixes → gates → Fable and Astra read the
code blind, with the evidence sheet → fixes → re-walk → gates → evidence sheet with his look card → PR open, green.

## 1. The order of building (the spec's Overnight order)

1. **Items 14 then 7 — the one counting body, then the signature binding.**
2. **Items 8, 9, 12, 10 — the pending list, who, the one jump, the scrolling bubble.**
3. **Item 5 — the two-state marker.**
4. **Items 1, 2, 13, 3 — the puck tag, the board's rings, the ORIG seal, the Signed line.**
5. **Items 4, 6 — the template door, the load.**
6. **Item 11 — the phone keyboard gap.**

Stop rule: by ~08:00 his time, or two-thirds of the chat, stop building; what is built gets the whole FULL check.

## 2. The design, item by item

### Item 14 (D109) — ONE counting body: `dayPendingItems(di)`
A new engine module `src/engine/pending.ts`. It returns the day's NET waiting changes as ITEMS — one per thing a
person would call "a change" — and every count in the app becomes the length of that list (or a filtered length):

- **Input:** the same comparison publication uses — the live day against the CURRENT issued version
  (`dayCurVer` / `daySnapOf`), the same `canonicalDiff` + filing axis + OIL axis `dayDelta` concatenates. The stored
  AL `diff` is UNCHANGED (D109: "what goes out … unchanged"); only the counting unit changes.
- **Non-person entries** (times, remarks, labels, areas, stores, in-times, traffic, structural add / delete, a
  reorder, an input filing, the OIL block): **one item each** — as today.
- **Person entries** (addresses that hold a man or a placeholder: a flying seat `di.gi.li.ai.p|w`; the programme
  `a:`; duty `d:` and its extras `d:….xN`; sim `s:….p|w`, `s:….pax.k`, `s:….xN`; ground `g:` and `g:….xN`) are
  decomposed into PERSON EVENTS per PLACE:
  - a **place** is a single seat (a flying seat, a sim FCP / RCP seat) or a whole row's people list (a programme
    row's who-list; a duty row's desk holder + extras; a sim row's passengers + extras; a ground row's who + extras) —
    so a man shifting inside one row's list is no change, and compaction of a list is not counted;
  - places are identified by row `rid` (resolved in the issued day for a removed sub-cell, in the live day
    otherwise) so both sides agree after a reorder;
  - per place: `off` = the multiset of tokens it held and no longer holds; `on` = the reverse;
  - **a MOVE** = a token (a man's id, or a placeholder / free-text token) that is `off` at one place and `on` at
    another place of the SAME day → **one item** ("Warden: MET + NOTAM BRIEF → SODB"), pairing deterministically
    (address order);
  - the events left unpaired count **one item per place** ("times, areas, remarks one per box" applied to a
    person box): a man only taken off = 1, only added = 1, a replacement in one box (A → B, neither moved) = 1.
  - Checks against his words: Warden MET → SODB = **1**; then Reaper into MET = **2**; a swap of two men = **2**
    (two moves); a man moved to ANOTHER day = one on each day (each day is its own list); a move put back = **0**.
  - Only places on rows that SURVIVE on both sides pair; a man inside an added / removed row is part of that row's
    add / delete item (D109 says nothing about rows; counting the row as one item and a man dragged into a brand-new
    row as one more reads the same either way).
  - **GAP (builder's call, filed):** a replacement inside one box (A → B, neither man moved elsewhere) counts ONE —
    his words cover "only taken off" and "only added", not a replacement in place; one box, one line reads naturally
    and matches today.
- **Readers switched to it** (the roll-call for this item — every place a count is drawn or used):
  `dayShownPendCount` (day head "N pending", ⓘ panel "N unpublished edits", the plan-switch toast); the sign-off
  status line ("N changes to publish", `signoffHTML`); the Amendments panel per-day line (`ALPanel`: "N changes · N
  removals · N reorders · N input filings"); the publish toast ("Published AL1 · N items"); the issued AL's item
  count in the Amendments panel history and the ⓘ panel (`alCount` — stored on the record at issue as `units`,
  falling back to the diff length); `dayDiscardCount` ("Discard N edits & load", the Load confirm, the board's
  copy). `dayHasChanges` / eligibility stay `dayDelta().length > 0` — a count of zero units must equal an empty delta
  (asserted).
- A draft (never-published) day keeps its draft-marks count (`dayPendCount`) — unchanged, not an amendment.

### Item 7 (D103) — any pending change wipes the sign-offs
`currentBind` gains one axis, `pd`: on a PUBLISHED day, a stable string of the day's whole `dayDelta` (every entry's
address, kind, from, to — sorted); on a draft day `''`. `signBoundOk` compares it (absent = `''`). So a signature is
valid only while the pending set is exactly what it was when he signed: anything newly pending (a change in who is
behind ALL / ALL AVAIL, an edited request's times, a Quals / posting change, a filing) wipes the four; putting it back
restores them (AM11). The D45 comments in `publish.ts` that say "membership is left out of what a signature binds to"
are rewritten to say D103 replaced that half. Register AM13 is rewritten. `[AMEND-D45-FILING]` is already closed.

### Items 8 + 9 (D99, D100, D104) — "N pending ▾" opens the list of what will go out
- The day head's pending chip (`dayStatHTML`, shared by the edit week and the board strip) becomes a BUTTON on the
  edit surfaces (`ed` and not previewing): "N pending ▾" (`data-pendlist="di"`). View-only Sched keeps the plain chip
  (the list is the scheduler's tool; the view page's issued face shows no count at all, AM24).
- The list (a small popover anchored under the chip, the mock-up's look `docs/mock/pending-list.html`): a head
  "Waiting to go out as <ALn tag> · N changes"; one row per ITEM from `dayPendingItems` — where (plain words), before →
  after (struck / bold), and on the right who and when; a long list scrolls inside the window (D100); a foot "Tap a
  change to go to it."; closes on an outside tap and on Escape (the standing popup rule).
- **Who / when (D104):** the newest edit-log row for the item's address(es) — its `who` is the shared account name
  the app already records ("Admin" / "Member"), its time `elogWhen`. A keyed item with no log row (made before this
  page was opened) reads **"earlier"**. An item with no single cell (a removal, a reorder, a filing, the OIL block)
  shows no who / when.
- **Tap** → the ONE jump (item 12) to the item's cell, which closes the list. A row whose change has no cell to go to
  (a removal, a reorder, the OIL block, a filing) is NOT a button (the Edit history list's own rule) — it is listed,
  greyed slightly, not tappable.

### Item 12 (D107) — ONE "take me to this change", landing on the page you are on
`goToChange(key, di)` in `ui/interactions.ts` replaces `jumpToChange` and serves Edit history AND the pending list:
- **On the board** (board open): today's behaviour exactly — `boardTab` to the day, find the cell, pin the History
  bubble, scroll it in; a key the board does not draw (`NO_BOARD_CELL`) says so on screen.
- **On Edit Schedule** (board closed): never opens the board. Find the cell inside `#eWeek .day[data-day=di]`
  (`findHistCell`, which already reads the week's cell attributes); on a phone first step the edit week to that day
  (the week's own day-step), then scroll the cell into view and give it the brief mark (a 1.4 s ring flash — the
  mock-up's mark). A key the week does not draw says so on screen ("That detail is shown on the scheduler board");
  a row deleted since says "That detail is no longer on this day" (today's words).
- `HistoryModal`'s row tap calls it; the list closes first, as today.

### Item 10 (D105) — the change bubble stays, and a long one scrolls
`.histbub` gets a max height (≈ 55% of the visible screen); its list scrolls inside. On a desktop the pointer may
move from the cell into the bubble without it vanishing (it goes when the pointer leaves both); on a phone the
expanded, pinned bubble's list takes touch-scrolls (pointer events on the scrolling list only — the bubble itself
still never takes the tap that raised it, the pinned contract).

### Item 5 (D97) — the two-state marker
`nysMarkHTML`: on the working copy of a published day with changes waiting — **"Not yet signed"** while any of the
four is missing or no longer valid (`!daySigned`), **"Not yet published"** once all four are valid. Never on the
issued face (unchanged). Register AM24's wording changes.

### Item 1 (D92, D93) — a changed puck gets a TAG, never a ring
`scheduler.css`: remove `.seat[data-alc] .puck{box-shadow…}` (the published ring) and
`#eWeek/#schedBoard .seat[data-aln] .puck{outline…}` (the waiting outline); add the hollow dotted waiting tag
(`#eWeek/#schedBoard .seat[data-aln]::after`, the approved `C_CSS`). The solid published tag `.seat[data-alc]::after`
is today's and stays. Times, areas, remarks keep their marks. The view page's neutral pending hint (`#vWeek
.seat[data-alp]` dashed outline on the seat) is left as it is (the working-draft peek; checked for ring overlap in the
walk). A geometry pin (e2e): on a published change and on a waiting change, a puck carrying an amber, grey, thin-red,
dashed and dotted ring keeps its ring's stroke (the computed box-shadow / outline is the ring's, not an AL colour).

### Item 2 (D94) — the board draws the dashed and dotted rings
`board-html.ts`: every `puck(…, dash=false, trace=null)` passes the day's dash (`dsh`/`dashOf`) and trace
(`traceOf`) as the week's builder does. Roll-call of every board seat builder (flying, SC, duty, sim, ground,
programme, input rows).

### Item 13 (D108, D110, D111) — the ORIG seal, A1
`verTagHTML`'s ORIG branch draws the drawn tick disc before "ORIG"; `.verchip.orig` gets the seal look (faint white
wash, thin light outline) from `mk-orig-tag-refine.mjs` variant `s`. One drawer → the edit week head, the board strip,
View-only Sched. Register AM22 changes ("grey ORIG" → the seal).

### Item 3 (D95, D102) — the "Signed ALn" line
- **Data:** the Original starts keeping its signers — `setDayApproved` stores `sign:{[di]: signNames(di)}` on
  `SCHED.orig[di]` before `signClear` (the same shape an AL record already has).
- **Drawer:** `signedLineHTML(di, ver)` — one slim line: "SIGNED" · the version tag · four names (roles labelled on a
  desktop, names only on a phone, by CSS). Nothing when the version has no signers recorded.
- **Where:** View-only Sched — under the day head of a published day's issued face (that version's signers); on the
  working-draft peek, the published version it sits on. The edit week — under the day head of a published day (the
  published version the working copy sits on; while previewing an older version, that version's). The board — in the
  sign strip, above the sign-off boxes. Byte parity: published days only — the seed week the reference pins has none.

### Item 4 (D96) — a day template is refused on a published day
`applyDayTpl` refuses a published day (returns false) — the engine door. The picker (`dayTplMenu`, the ONE picker
both the week's Templates button and the board's open) draws its apply rows disabled on a published day with the
reason in plain words ("Mon is published — a template can't be applied to a published day. Edit the working copy, or
Unpublish first."); saving a template from a published day stays allowed. Every other door found in the roll-call
(the board's `'noop'` path, any probe path) refuses with the same sentence (one constant).

### Item 6 (D98) — "Load onto working copy" puts back what that version had filed
In `loadVersionToWorkingCopy` ONLY (never the general reconcile — Fable's warning): after the content swap, every
input covering the day is set to the filing state the loaded version froze (`snap.fil`; absent = fresh), a
"on the programme" state only where its row is on a loaded day (else fresh). Then the day reads exactly as that
version: nothing pending. `dayDiscardCount` (the Load confirm's "Discard N edits") counts the filing changes too,
since the load now replaces them.

### Item 11 — the phone keyboard gap
While the board is open, hold the page behind still and size the board to the VISIBLE area (the visual viewport's
height and offset), following its resize / scroll — as the Leave War sheet and the History bubble already do.
Chromium cannot raise an iPhone keyboard: tested by shrinking the visual viewport in a script; a line on his look card.

## 3. What each item changes in the records
Register (`2026-09-24-amendment-behaviour-register.md`): AM13 (D103), AM22 (the seal), AM23 (the unit), AM24 (the two
wordings), AM19 (tags not rings), AM6 (the load restores filings), + new lines for the list, the jump, the Signed line,
the template refusal. `ui-contracts.md` §Amendment marks on screen, §History on the board (the jump), the new list;
`engine-rules.md` (the pending count, the signature binding, the load, the template refusal); `feature-impact.md` (the
new surface); `file-map.md` (new files). The backlog items leave `OUTSTANDING.md` by script once walked.

## 4. Tests (red first, each named for its ruling)
One unit test per item, failing before its code, named "(D109)", "(D103)", … and the register ids (the rule-coverage
gate). The count body gets the roll-call test: every reader returns the same number on one fixture carrying a move, a
swap, a replacement, a time change, a removal, a reorder and a filing. The e2e geometry pin for item 1; the board's
rings for item 2.

## 5. Risks the builder already sees
- `currentBind` now calls `dayDelta` — cost on every sign read of a published day with a binding (measured before and
  after; `docs/performance.md`).
- The canonical diff's hole entries carry ISSUED-day addresses; the count body and the list must resolve them by rid,
  not by position (a reorder then a removal).
- The Signed line on the view page must never read the working copy's signers (AM5).
- The pending list's jump on a phone must land on the right day of the edit week (one day per screen).
</content>
</invoke>
