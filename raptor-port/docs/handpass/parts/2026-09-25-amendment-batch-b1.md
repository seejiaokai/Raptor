# Walker B1 — the counting, the list, the jump, the marker, the signatures (25 Sep 26)

Items 14, 7, 8, 9, 12, 5 of the amendment batch (D109, D103, D99/D100, D104, D107, D97), driven in the production
build on :4173, each world a fresh browser context. Desktop 1440×900 (DPR 1), phone 390×844 (DPR 3).
Fixtures made through the app's own controls only (sign-off selects, Publish day, Publish AL, real mouse drags,
arm-then-pick, right-click to take a man off, typing in boxes, the ✕ buttons, the plans menu, the Inputs form).
Nothing was written through `window`. The browser error list stayed empty in every run.

Scripts (`raptor-port/scripts/handpass/am/`): `b1-00-probe.mjs` (what the seed Monday holds), `b1-01-count-desktop.mjs`,
`b1-02-phone.mjs`, `b1-03-extras-plans-allavail.mjs`, `b1-04-allavail-putback.mjs`.
Pictures: `raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b1/` (`b1-d-*` desktop, `b1-p-*` phone,
`b1-x-*` / `b1-y-*` the extra cases).

**Walk:** desktop + phone, edit week + board + View-only Sched (issued face and working-draft peek); 76 checks,
74 PASS, 2 FAIL (both the same count question, F1 — one of them only a knock-on of my own expected number), 1 NOT
WALKED half (D103 put-back for ALL AVAIL). No browser errors.

## 1. The checks

Fixture (desktop): seed week, Havoc added to FLIGHT SAFETY STAND-DOWN before publishing, Monday signed and published
(tag ORIG, nothing pending). Then one change at a time; after each, EVERY count read: week head, board strip, ⓘ on the
week, ⓘ on the board, the Amendments panel's Monday line, the sign-off line (after signing the four) and, at A/B/I,
"Discard N edits" on the Original's Load button.

| id | result | what the screen said | picture |
|---|---|---|---|
| FIX-publish | PASS | Publish day → tag "ORIG", no pending | b1-d-00-published |
| M-1 | PASS | no marker on a freshly published day | b1-d-00-published |
| S-1 | PASS | first change on the published day → the four sign-off boxes blank (D103) | b1-d-01-A-board-strip |
| M-2 | PASS | marker "Not yet signed" while unsigned (D97) | b1-d-01-A-board-strip |
| C-1 | PASS | Warden MET + NOTAM BRIEF → empty SODB: every count **1** (week, board, both ⓘ "1 unpublished edit", panel "Mon · 1 change", "1 change to publish", "Discard 1 edit & load") | b1-d-02-A-week-head, b1-d-A-discard |
| M-3 | PASS | all four signed → marker "Not yet published" | — |
| C-1b | PASS | the week head's "1 pending" is a button | b1-d-02-A-week-head |
| C-1c | PASS | under a preview of the Original on the board, no pending button | b1-d-A-discard |
| S-2 | PASS | signed (Ace/Anvil/Anvil/Anvil); a further change blanks all four | — |
| C-2 | PASS | Cinder into the row Warden left: every count **2** | b1-d-B-discard |
| C-3 | PASS | swap of two pilots (Saber ↔ Ranger, VL front seats): every count **4** | — |
| C-4 | PASS* | holder → extras drop did not land (see §4); every count stayed **4**, all agreeing | b1-x-01-holder-to-extras |
| C-5 | PASS | a man taken off the FLIGHT SAFETY crowd: every count **5** | — |
| C-6 | PASS | time 11:30 → 11:40: every count **6** | — |
| C-7 | PASS | a remark: every count **7** | — |
| C-8 | **FAIL** | ✕ on the ground row FLY WITH (Gambit's accepted request): every count **9** (+2), all agreeing — see F1 | b1-d-03-list-week |
| C-9 | FAIL (knock-on) | Wave 1 dragged below Wave 2: +1 → every count **10** incl. "Discard 10 edits"; failed only because my expected number carried F1's +1 | b1-d-I-discard |
| L-long | note | five more remarks → "15 pending" | — |
| L-week-open / -head / -rows | PASS | "Waiting to go out as AL1 · 15 changes", 15 rows | b1-d-03-list-week |
| L-week-move | PASS | "Warden — MET + NOTAM BRIEF → SODB", Admin 25/9 03:52 | b1-d-03-list-week |
| L-week-no-ids / -no-raw | PASS | callsigns only; no "␟", no JSON | b1-d-03-list-week |
| L-week-who | PASS | 12 rows "Admin" + time; the rest (row added/removed/reorder/filing) name nobody | b1-d-03-list-week |
| L-week-scroll / -wheel | PASS | list scrolls INSIDE the window (767 of 451 px), window ends on screen; the wheel scrolls it | b1-d-04-list-week-scrolled |
| L-week-esc / -outside | PASS | Escape closes it; a tap outside closes it | — |
| L-board-* (7 checks) | PASS | same list from the board strip, same 15 rows, same words | b1-d-05-list-board |
| J-1 | PASS | week list → Warden row: stays on Edit Schedule, board NOT opened, SODB ringed and in view | b1-d-06-jump-week-from-list |
| J-2 | PASS | the removed row is listed but not tappable ("Ground · FLY WITH · item removed", "Order changed waves", the filing) | b1-d-03-list-week |
| J-3 | PASS | top-bar Edit history → the time change: stays on the week, board shut, 11:40 marked in view | b1-d-07-edit-history, b1-d-08-jump-week-from-history |
| J-4 | PASS | the removed row's Edit history entry is listed and not a jump button | b1-d-07-edit-history |
| J-5 | PASS | board's own list → Warden: stays on the board, cell ringed, History bubble pinned ("PROGRAMME · SODB set to Warden") | b1-d-09-jump-board-from-list |
| L-not-view | PASS | View-only Sched: no pending button on the issued face or the working-draft peek | b1-d-10, b1-d-11 |
| M-4 | PASS | issued face on View-only Sched: no marker | b1-d-11-view-issued |
| M-5 | PASS | working-draft peek shows "Not yet signed" | b1-d-10-view-working-peek |
| L-not-draft | PASS | draft Tuesday reads "1 pending" — not a button, board or week | — |
| L-not-preview | PASS | previewing the Original on the week: no pending button | b1-d-12-week-preview-head |
| S-3 / S-4 | PASS | signed; a remark added → four blank; the remark cleared → the same four return | b1-d-13-signs-back |
| L-earlier | PASS | after a reload the rows read "earlier" (12 earlier, 0 named) | b1-d-14-list-after-reload |
| C-10 | PASS | before Publish AL every count 15 | — |
| C-11 | PASS | toast "Published AL1 · 15 items on Mon only · approved by Anvil" | — |
| C-12 | PASS | Amendments history "AL1 Mon · 15 items · 1 removal · 1 reorder · 1 input filing · appr Anvil" | b1-d-16-panel-after-AL |
| C-13 | PASS | ⓘ "AL1 15 items" | — |
| M-6 | PASS | after Publish AL: no marker, no count | b1-d-15-after-AL |
| ERR | PASS | browser error list empty | — |
| **Phone** P-FIX | PASS | Monday published on the phone board | — |
| P-C1 | PASS | move + time + remark: board strip, week head, both ⓘ all read 3 | b1-p-01-board-strip |
| P-L1..L4 | PASS | list from the week head: "AL1 · 3 changes", 3 rows, inside 8–382 px of 390, move line right, no raw/ids | b1-p-02-list-week |
| P-J1 | PASS | week list → the remark far down CMD ENGAGEMENT: board shut, scrolled to and ringed | b1-p-03-jump-week-from-list |
| P-J2 | PASS | week showing Wednesday → top-bar Edit history → Monday's move: the week steps to Monday, board shut, Warden ringed | b1-p-04-edit-history, b1-p-05-jump-week-from-history |
| P-L5 | PASS | list from the phone board strip, inside the screen | b1-p-06-list-board |
| P-J3 | PASS | phone board list → the remark: stays on the board, bubble pinned | b1-p-07-jump-board-from-list |
| P-L6 / P-ERR | PASS | Escape closes it; no browser errors | — |
| **Extras** X-2 | PASS | Havoc and Ranger taken off FLIGHT SAFETY (one crowd): 0 → 2, two lines "→ taken off" | — |
| X-3 | PASS | a PLAIN row removed (DINNER WITH CMD): 2 → 3, one line "item removed" | b1-x-03-week-head |
| X-4a | PASS | Wednesday published, + Alt Plan (Plan B), a change, four signed: "1 change to publish" | b1-x-04-planB-signed |
| X-4b | PASS | switch to Plan A ("matches Original — nothing pending") → the four blank | b1-x-05-planA |
| X-4c | PASS | back to Plan B → the same four signed again | b1-x-06-planB-back |
| X-5a | PASS | saved week, published Saturday signed (Blade/Cinch/Cinch/Cinch); LL filed on Inputs for Ghost, behind the FAMILY DAY ALL AVAIL puck → four blank, "1 pending", marker "Not yet signed" | b1-x-07, b1-x-08-sat-after-leave |
| X-5b | NOT WALKED | the leave's ✕ on the Inputs table could not be reached by my script (§4) | — |
| X-ERR-1/2, Y-ERR | PASS | no browser errors | — |

## 2. Findings

**F1 — Removing a request's row on a published day counts as TWO changes (a question for him, not clearly a defect).**
- Steps: Monday published. On the board, ✕ on the ground row FLY WITH (it is Gambit's accepted request). Toast: "Ground
  item removed — back under Personal Inputs — FLY WITH, Gambit".
- Expected (the brief: "a row removed" = 1; D109: one act, one change): +1.
- Seen: +2 on every surface, all agreeing. The pending list shows two lines for the one tap: "Ground · FLY WITH · item
  removed" and "Gambit · Fly with on the programme → taken off". The issued AL reads "… · 1 removal · 1 input filing".
  A plain row removed (DINNER WITH CMD) counts 1, correctly (X-3).
- Picture: b1-d-03-list-week (the list), b1-d-16-panel-after-AL.
- My read: `engine/publish.ts dayPendingItems` lists the removed row and the request's filing change as two items. D109
  pairs a man taken off one place and put on another, but nothing pairs a request row's removal with its own filing
  change. Whether that is one change or two for him is his call — it is consistent everywhere, so nothing disagrees.

**F2 — A change in who is behind ALL AVAIL reads only "What this day earns · changed" in the pending list (minor, wording).**
- Steps: saved week, published Saturday; file LL for Ghost on 18 Jul (he stands behind the FAMILY DAY ALL AVAIL puck).
- Seen: "1 pending"; the list's one line is "What this day earns — changed", no name, no event, not tappable.
- Expected (D99: "so that the scheduler dont need to search everywhere"): a line that says whose availability changed
  and where.
- Picture: b1-x-08-sat-after-leave (the head); the list text is in the run log.
- My read: `ui/pendlist.ts pendItemWords` — the `oil` kind falls through to `{ where: 'What this day earns', to:
  'changed' }`.

## 3. Checked and found right

- Every count agreed with every other count at every step, desktop and phone: week head, board strip, both ⓘ panels,
  the Amendments panel line, the sign-off line, "Discard N edits", then the toast, the history tag and the ⓘ "N items".
- A move is ONE (Warden → SODB read 1; then a man into the row he left read 2). A swap is two. Two men off one crowd is
  two. A time, a remark, a plain row removed, a wave reorder each one.
- A move made in two separate steps pairs too: in the first run Reaper was on the published FLIGHT SAFETY crowd, was put
  into MET + NOTAM BRIEF (+1), then taken off FLIGHT SAFETY — the count stayed where it was (one move).
- The list: right head, one row per change, "<man>: <from> → <to>", callsigns only, no "␟" or JSON, Admin + time this
  sitting, "earlier" after a reload, 15 rows scroll inside the window with the wheel, closes on Escape and on a tap
  outside; not a button on View-only Sched (issued or working-draft peek), under a preview, or on a draft day.
- The jump: from the week's list and from the top-bar Edit history, the board never opens and the change is ringed in
  view; on a phone the week steps from Wednesday back to Monday; from the board's list, the board jump with the bubble
  pinned. A removed row is listed but not a button, in the list and in Edit history.
- Signatures (D103): any change blanks the four; putting it back returns them; Plan B signed → Plan A unsigned → back
  to Plan B signed; a leave for a man behind ALL AVAIL blanks them.
- The marker (D97): "Not yet signed" while unsigned, "Not yet published" once all four are valid, gone after Publish day
  and after Publish AL, never on the issued face, shown on the working-draft peek.

## 4. Not walked, and why

- **A desk holder moved onto his own desk's extras line** — two drag attempts did not land (once "Already in that seat",
  once nothing). On the board a filled desk row draws no "+ add" box to aim at (b1-x-01). Not claimed as a defect; I ran
  out of time to find the right drop point.
- **D103 "put it back" for ALL AVAIL** — the wipe half passed; I could not reach the leave's ✕ on the Inputs table in
  time (my script did not find the row), so the "signatures return" half is not walked.
- **A traffic change "says it has no place"** — I did not make a traffic change.
- **"Earlier" after a reload and the 15-row scrolling list** were walked on desktop only; the phone list had 3 rows.
- The reload asked for the sign-in again (the app's normal behaviour); I signed in once after it, at the end of the
  fixture.
