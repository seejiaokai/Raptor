# Five-flags batch — walker W3: [CROWD-SWAP-SAYS-BUSY], "already on" when a man is moved inside his own row

Walked 26 Sep 26 against the production bundle of `ca5d04e3` served at http://localhost:4176 (`assets/index-DBnovQvy.js`,
`dist/` built 19:07, not rebuilt; the builder's W2 commit `b6d27787` landed mid-walk and touches only the Leave War, not
this bundle). Chromium (Playwright), a fresh browser context = a fresh demo world per part. Script:
`raptor-port/scripts/handpass/ff-w3.mjs` (`node scripts/handpass/ff-w3.mjs [part …]` from `raptor-port/`; parts
`f4d f4p f2d f2p f3 f5 f6 f1a f1b f1c f1d f1e f20`, none = all; every check asserts the RIGHT behaviour, so re-running
it is the re-walk). Pictures: `raptor-port/docs/img/handpass/2026-09-26-five-flags/w3/` (63). Scenarios: Fable F1–F6,
F20 and §2.3. Every fixture made through the app's own controls (the board's arm-and-plant, + Item, + Row, + Line,
+ Wave → SC / AVALON, typed times, ⓘ, sign-off selects and Publish day, the board's and the page's Undo / Redo, a
reload); `window.*` read for the tables only. Desktop 1440×900 (mouse); phone 390×844 with a real finger (CDP
`Input.dispatchTouchEvent`: press, hold past the 180 ms, travel, lift) for F4 and the drawer for F2.

**Result (the last full run, all parts in one pass): 123 PASS · 5 FAIL · 27 NOTES · browser error list empty in every
part.** The fix does what it promises everywhere it was walked: a man moved inside his own crowd is never "already on"
it (caption, drop toast, Undo/Redo, published, reload, phone finger, edit week); a man on ANOTHER overlapping programme
row is now struck (palette, drawer, "N free", the green rings) and the picker agrees with the warning list; the
"his only event that day" test now holds for all five Saturday shapes. The five FAILs:

| FAIL | What | New with this branch? |
|---|---|---|
| **F6-d** | Ranger dropped from the palette onto ANOTHER man's seat in the crowd Ranger is already on: that man is replaced by a second Ranger, and nothing is said — no caption, no toast, no warning | **NEW** — on `main` this route spoke ("already on FLIGHT SAFETY STAND-DOWN 08:30–09:00" under the ghost and as the drop toast) because the old trim made the seat's row differ from the event's; the fix removed the only voice. Fable's "duplicate door the fix may open" — it is open |
| F6-a | Ranger dragged from the palette onto his own row's "+ add" → listed twice, silent | same on `main` (read: `main`'s trim turned both the "+ add" key and the event key into `a:0`, so no busy words there either; `fillSlot` appends without a duplicate check, `slots.ts` unchanged; the validator raises nothing for one man twice on a row, `validate.ts`'s clash code unchanged) |
| F6-b | FLIGHT SAFETY's "+ add" armed, Ranger tapped → listed twice, toast "Ranger planned" | same on `main` (same reading as F6-a; `placeArmed` unchanged) |
| F20-sc-3 | SC AM MAIN dragged onto the OTHER SC AM MAIN seat of the same shift: the ghost says "on SC AM 07:00–13:00 — inside this shift" (the shift he is leaving), the drop then lands and says nothing | same on `main` — `avail.ts`'s SC shift-window block (`e.slot!==self`, lines 399–408 on `main`) is byte-identical and excludes only the seat planted into, not the one dragged from; outside this diff, but the SAME family as this fix (the hover must describe the week after the move) |
| F20-sc-4 | SC AM MAIN front seat dragged onto the same MAIN's rear seat: the same caption, the same silent drop | same on `main`, same reading |

## Roll-call (§2.3) — every consumer of the busy check, every route into a crowd

| # | Consumer / surface | Walked? | Result | Picture(s) |
|---|---|---|---|---|
| 1 | The caption under the dragged ghost — mouse, with the from-seat | YES (F1 ×5, F3 ×4, F4 ×5 incl. the edit week, F6, F20 ×6) | right, except F6-d (silent where `main` spoke) and F20-sc-3/4 (pre-existing) | f4d-01/03/03w/04/08, f3-*-hover, f1?-01, f20-0*, f6-* |
| 1b | The same caption — a finger (phone board) | YES (F4, unpublished and published) | clear; the finger ghost rides the finger | f4p-01, f4p-03 |
| 2 | The fallback drop toast (after the write, when the warning delta is empty) | YES (F4, F3, F6, F20) | never "already on" for the row he stays on / left; F6-d silent (see FAIL) | f4d-02, f3-*-after-drop |
| 3a | Armed palette — the strike | YES (F2 desktop + phone, F3 ×4 plain arm, F1 ×5, F20 info / SC) | right | f2d-01, f2p-01, f1?-03, f20-04/06 |
| 3b | Armed palette — the reason printed under the name | YES | printed whole, not clipped, on the desktop aside and the phone drawer (wraps to three lines) | f2d-01, f2p-01 |
| 3c | Armed palette — the column's "N free" | YES | the head's number = names not struck (22 with the overlap, 23 abutting) | f2d-01, f2d-04 |
| 3d | Armed palette — the "show anyway" line | NO-because the app has no such line, on this branch or on `main` (read `palette-html.ts` on both): a struck name stays listed in its own column, sorted after the free ones (Ranger 25th of 29), and a tap on it still plants — that IS the "anyway" | — |
| 3e | Armed palette — the sort rank | YES (read) | struck sorts below the free names | f2d-01 |
| 4 | The palette tap's toast | YES (F2, F6-b, F20) | F2: "Ranger — FLIGHT SAFETY STAND-DOWN & SAFETY WALK clash"; F6-b: "Ranger planned" over a duplicate (see FAIL) | f2d-02 |
| 5 | The green "where can he go" rings | YES (F5, board AND edit week) | SAFETY WALK none; MET + SODB green; WPNS none, agreeing with the palette (he is on VL BFM from 11:40 on this seed); evening wave dim green; his OWN row's "+ add" green (pre-existing, and it invites F6-a/b) | f5-01, f5-02, f5-03 |
| — | NOT a consumer: the ALL AVAIL window, the validator | NO-because read: no non-test file but `drag.ts`, `highlights.ts`, `palette-html.ts` and `view.ts placeArmed` calls the busy check (grep `slotBar` over `src`) | — |

**Targets walked:** flying seat (F3, F1e) · SC MAIN / SPARE (F20) · desk holder, desk extras (F3, F20, F1c) · sim front
seat, sim extra (F3, F20, F1b) · ground name, ground extras (F3, F20, F1d) · programme person seat (F4, F6-d) ·
programme "+ add" (F2, F5, F6, F1a). **Not walked:** the AVALON seat and desk (+ Wave → AVALON made a wave with no desk;
the desk comes from a duty template — not pursued in the budget), a sim pax line (the seed's pax rows carry no front
seat; the sim's spare-pair extra stood in), a request row and the Unavailable reassign (neither reads the busy check
for a man already on a crowd — not a route into this change).
**Sources walked:** the palette (no from-seat) · a seat of the same row (F4) · a seat of another row of the same kind
(F3 — programme to programme is covered by the unit test, not walked) · a seat of another kind (F3, F20) · a seat on
another day (F1).

## Orders walked

- **F4, each swap both ways:** Reaper → Ranger and Ranger → Reaper, unpublished (board, and once on the edit week) and
  published (board), desktop mouse; unpublished and published on the phone by finger. After each: the board's Undo;
  on the published day Undo → 0, Redo → 1, Undo, the other direction → 1, then a reload → the swap holds, board and
  week heads both "1 pending".
- **The pending count for a swap inside one crowd is 1, one line "FLIGHT SAFETY STAND-DOWN … order changed"** — not
  Fable's 2. NOT a defect by the record: the amendment batch settled that a list whose members are unchanged and whose
  order differs is ONE item (`docs/handpass/2026-09-25-amendment-batch-fable-scenarios.md` F1 fix (2); re-walk A in
  `docs/handpass/2026-09-25-amendment-batch.md` read "taken off" + "order changed" = 2). D109's "a swap of two men is
  two moves" was written about two different places. Put to the builder: if the owner reads D109 as covering a swap
  inside one crowd, that is his call.
- **F2:** arm → struck → tap anyway → plants, toast, clash raised → Undo → retype to abutting → arm → free. Desktop and
  phone.
- **F3:** for each of four targets: the plain arm (he stays on the row: still "already on …"), then the drag off the
  row, the drop, Undo (only when the drop changed the day — checked by comparing the day before and after).
- **F1:** for each of five Saturday shapes: the drag Saturday → Sunday on the edit week, the page Undo, then the palette
  from Sunday's board (Saturday stays) and the plant.
- **F6:** (a) palette drag onto "+ add", (b) arm + tap, (d) palette drag onto another man's seat in the crowd, (e) arm
  that seat — not reachable (a tap on a filled seat selects the man, it does not arm), (c) his own puck onto his own
  row's "+ add" on a PUBLISHED Monday → one copy, 0 pending (a no-op).

## What was NOT walked, and why

- The AVALON seat ↔ desk negative (no desk came with + Wave → AVALON; template-minted desk not pursued).
- A real iPhone (the finger drag is Chromium's touch input; Safari's event delivery is not proven here).
- F6 on `main`: `main` cannot be served here (no rebuild), so every "same on `main`" above is a reading of `main`'s code
  (`git show main:…`), named per row.
- The next-week preview and the ALL AVAIL window (not consumers — negatives by reading).

## Notes worth the builder's eye (not FAILs)

- **The fixture's Ranger already wears a red ring** from the seed (VL BFM & Sim EP-4 clash), so "his puck rings red on
  both rows" (F2-2d) is weak evidence on its own; the warning-list check (F2-2c: a NEW "FLIGHT SAFETY STAND-DOWN &
  SAFETY WALK clash", absent before) carries the proof.
- **F3 desk:** the desk 08:00–12:00 also overlaps his VL BFM window (from 11:40), and the caption rightly names THAT
  ("already on VL BFM 11:40–14:35") — the named commitment is real, not the row he left.
- **F3 flying line:** the drop onto the 09:00 line was silent under the ghost; the drop toast then named a real debrief
  clash with his sim ("Not enough time to attend the FTHREE debrief — Sim EP-4…") — the picker does not model the
  debrief window; pre-existing and outside this change.
- **F5:** his own row's "+ add" stays green while he is selected — the door F6-a/b walk through (pre-existing).
- **Seed callsigns differ from Fable's text** (Fable's "Nact / Harpoon / Pump" are Warden / Trident / Piston on screen).

## Errors seen

None — console errors, page errors and 4xx responses were empty in every part, every run.

## Every check (the last full run)

| id | what | result | picture | detail |
|---|---|---|---|---|
| F4d-0 | fixture: FLIGHT SAFETY STAND-DOWN holds Ranger then Reaper (+ add, palette tap) | PASS | `f4d-00-fixture-crowd.png` | {"pl":"a:0.2.+ → tapped","c0":["bane","dice"],"t0":["Reaper planned"]} |
| F4d-1a | unpublished · Reaper dragged onto Ranger: nothing printed under the ghost | PASS | `f4d-01-hover-reaper-onto-ranger.png` | {"ghost":"puck","caption":"","over":"a:0.2.0","overWhy":null,"pic":"f4d-01-hover-reaper-onto-ranger.png"} |
| F4d-1b | the two swap places | PASS | `f4d-02-after-swap.png` | ["dice","bane"] |
| F4d-1c | no "already on" toast after the drop | PASS | — | [] |
| F4d-1d | Monday's warning list unchanged by the swap | PASS | — | {"added":[],"gone":[]} |
| F4d-1e | the board's Undo puts them back | PASS | — | ["bane","dice"] |
| F4d-2a | unpublished · Ranger dragged onto Reaper: nothing under the ghost | PASS | `f4d-03-hover-ranger-onto-reaper.png` | {"ghost":"puck","caption":"","over":"a:0.2.1","overWhy":null,"pic":"f4d-03-hover-ranger-onto-reaper.png"} |
| F4d-2b | they swap, no busy toast | PASS | — | {"c1":["dice","bane"],"t1":[]} |
| F4d-W | edit week · Reaper dragged onto Ranger: nothing under the ghost, they swap, no busy toast | PASS | `f4d-03w-week-hover-reaper-onto-ranger.png` | {"h":{"ghost":"puck","caption":"","over":"a:0.2.0","overWhy":null,"pic":"f4d-03w-week-hover-reaper-onto-ranger.png"},"c1":["dice","bane"],"t1":[]} |
| F4d-Wu | the page Undo puts them back | PASS | — | ["bane","dice"] |
| F4d-P | Monday published (signed, Publish day) — ORIG, nothing pending | PASS | — | {"sg":{"cur":"Ace","sked":"Anvil","plan":"Anvil","appr":"Anvil"},"pb":{"pressed":true,"label":"Publish day"},"tag":"ORIG","pend":""} |
| F4d-3a | published · Reaper onto Ranger: nothing under the ghost | PASS | `f4d-04-hover-published-reaper-onto-ranger.png` | {"ghost":"puck","caption":"","over":"a:0.2.0","overWhy":null,"pic":"f4d-04-hover-published-reaper-onto-ranger.png"} |
| F4d-3b | they swap, no busy toast | PASS | — | {"c1":["dice","bane"],"t1":[]} |
| F4d-3c | the head reads 1 pending (a swap INSIDE one crowd is one "order changed" — the amendment batch's list-place rule; Fable's F4 expected 2 from D109, see the note) | PASS | `f4d-05-published-head-pending.png` | 1 pending |
| F4d-3d | the pending list agrees with the head: one line, "FLIGHT SAFETY STAND-DOWN … order changed" | PASS | `f4d-06-pending-list.png` | {"open":true,"head":"Waiting to go out as AL1 · 1 change","rows":["FLIGHT SAFETY STAND-DOWN Saber 26/9 21:17 order changed"]} |
| F4d-3n | expectation difference, not a defect by the record: Fable's F4 said "2 pending (D109: a swap is two moves)"; the shipped count is 1, one "order changed" line — the amendment batch's list-place rule (a list whose members are unchanged and whose order differs is ONE item), already on main. D109's reading speaks of two places; whether a swap inside one crowd should read 1 or 2 is the owner's call if he reads D109 the other way | NOTE | — | {"head":"1 pending","list":["FLIGHT SAFETY STAND-DOWN Saber 26/9 21:17 order changed"]} |
| F4d-3e | Undo → back, 0 pending | PASS | — | {"crowd":["bane","dice"],"pend":""} |
| F4d-3f | Redo → swapped again, pending as before | PASS | `f4d-07-after-redo.png` | {"crowd":["dice","bane"],"pend":"1 pending"} |
| F4d-4a | published · Ranger onto Reaper: nothing under the ghost | PASS | `f4d-08-hover-published-ranger-onto-reaper.png` | {"ghost":"puck","caption":"","over":"a:0.2.1","overWhy":null,"pic":"f4d-08-hover-published-ranger-onto-reaper.png"} |
| F4d-4b | they swap, no busy toast, the same pending count | PASS | — | {"c1":["dice","bane"],"t1":[],"pend":"1 pending"} |
| F4d-4c | the warning list is the same as before any swap | PASS | — | {"added":[],"gone":[]} |
| F4d-5 | after a reload the swap holds and the board and the week heads read the same count | PASS | `f4d-09-after-reload.png` | {"crowd":["dice","bane"],"board":"1 pending","week":"1 pending"} |
| F4d-ERR | browser error list empty (console, page errors, 4xx) | PASS | — | [] |
| F4p-0 | phone fixture: Ranger then Reaper on FLIGHT SAFETY (armed + add, the drawer's name tapped) | PASS | `f4p-00-phone-fixture.png` | {"pl":"a:0.2.+ → tapped","c0":["bane","dice"]} |
| F4p-1a | the finger drag armed (a ghost rides under the finger) | PASS | `f4p-01-phone-finger-hover-reaper-onto-ranger.png` | {"ghost":"puck","caption":"","over":"a:0.2.0","overWhy":null,"pic":"f4p-01-phone-finger-hover-reaper-onto-ranger.png"} |
| F4p-1b | phone · Reaper onto Ranger: nothing under the finger | PASS | — | — |
| F4p-1c | they swap, no busy toast | PASS | `f4p-02-phone-after-swap.png` | {"c1":["dice","bane"],"t1":[]} |
| F4p-1d | warning list unchanged | PASS | — | — |
| F4p-2a | published (on the phone) · Ranger onto Reaper by finger: nothing under the finger | PASS | `f4p-03-phone-finger-hover-published-ranger-onto-reaper.png` | {"pb":{"pressed":true,"label":"Publish day"},"h":{"ghost":"puck","caption":"","over":"a:0.2.1","overWhy":null,"pic":"f4p-03-phone-finger-hover-published-ranger-onto-reaper.png"}} |
| F4p-2b | they swap, no busy toast, the same pending count as the desktop | PASS | `f4p-04-phone-published-after-swap.png` | {"c1":["dice","bane"],"t1":[],"pend":"1 pending"} |
| F4p-ERR | browser error list empty | PASS | — | [] |
| F2d-0 | fixture: + Item → SAFETY WALK 08:45–09:15, empty; Ranger on FLIGHT SAFETY STAND-DOWN 08:30–09:00 | NOTE | — | {"ri":10,"row":"SAFETY WALK/08:45-09:15"} |
| F2d-1a | SAFETY WALK armed: Ranger is struck with "already on FLIGHT SAFETY STAND-DOWN 08:30–09:00" | PASS | `f2d-01-palette-armed-ranger-struck.png` | {"armed":"a:0.10.+","no":true,"why":"already on FLIGHT SAFETY STAND-DOWN 08:30–09:00"} |
| F2d-1b | the reason is PRINTED under his name, whole | PASS | — | {"line":"already on FLIGHT SAFETY STAND-DOWN 08:30–09:00","vis":true,"clipped":false,"colLine":""} |
| F2d-1c | the column's "N free" does not count him (head number = names not struck) | PASS | — | {"head":"Pilots · 22 free","notStruck":22,"total":29,"pos":24} |
| F2d-2a | tapping him anyway plants him (everything plants) | PASS | — | {"fs":["bane"],"sw":["bane"]} |
| F2d-2b | the toast repeats the reason (or the validator's clash words) | PASS | — | ["Ranger — FLIGHT SAFETY STAND-DOWN & SAFETY WALK clash"] |
| F2d-2c | Monday's warning list raises the clash between the two rows (and did not before) | PASS | — | {"clash":["hard/DOUBLE_BOOK/bane/FLIGHT SAFETY STAND-DOWN & SAFETY WALK clash"],"rangerBefore":["hard/DOUBLE_BOOK/bane/VL BFM & Sim EP-4 clash","adv/NO_BRIEF/bane/No time for the VL BFM flight brief — Sim EP-4 sits inside 10:20–12:40 (brief 10:20)","adv/SIM… |
| F2d-2c-wording | the clash as the warning list words it (F20: the validator's wording is untouched by this change — validate.ts's diff is the two leaving-seat helpers only) | NOTE | — | ["hard/DOUBLE_BOOK/bane/FLIGHT SAFETY STAND-DOWN & SAFETY WALK clash"] |
| F2d-2d | his puck rings red on BOTH rows | PASS | `f2d-02-planted-anyway-rings.png` | [{"key":"a:0.2.0","cls":"puck sm warn hard boxred flagnew","ring":"rgb(240, 85, 95) 0px 0px 0px 2px"},{"key":"a:0.10.0","cls":"puck sm warn hard boxred flagnew","ring":"rgb(240, 85, 95) 0px 0px 0px 2px"}] |
| F2d-2e | picture of the day's warning list with the clash | NOTE | `f2d-03-warning-list.png` | — |
| F2d-3a | Undo takes the plant off | PASS | — | [] |
| F2d-3b | retyped to 09:00–09:30 (abutting 08:30–09:00): Ranger is NOT struck | PASS | `f2d-04-palette-abutting-ranger-free.png` | {"a2":"a:0.10.+","row":"09:00-09:30","no":false,"why":"","head":"Pilots · 23 free"} |
| F2d-3c | "N free" with the overlap vs abutting (Ranger is one of the differences) | NOTE | — | {"overlap":"Pilots · 22 free","abutting":"Pilots · 23 free"} |
| F2d-ERR | browser error list empty | PASS | — | [] |
| F2p-0 | fixture: + Item → SAFETY WALK 08:45–09:15, empty; Ranger on FLIGHT SAFETY STAND-DOWN 08:30–09:00 | NOTE | — | {"ri":10,"row":"SAFETY WALK/08:45-09:15"} |
| F2p-1a | SAFETY WALK armed: Ranger is struck with "already on FLIGHT SAFETY STAND-DOWN 08:30–09:00" | PASS | `f2p-01-drawer-armed-ranger-struck.png` | {"armed":"a:0.10.+","no":true,"why":"already on FLIGHT SAFETY STAND-DOWN 08:30–09:00"} |
| F2p-1b | the reason is PRINTED under his name, whole | PASS | — | {"line":"already on FLIGHT SAFETY STAND-DOWN 08:30–09:00","vis":true,"clipped":false,"colLine":""} |
| F2p-1c | the column's "N free" does not count him (head number = names not struck) | PASS | — | {"head":"Pilots · 22 free","notStruck":22,"total":29,"pos":24} |
| F2p-1d | on the phone the drawer opens as the picker | PASS | — | true |
| F2p-2a | tapping him anyway plants him (everything plants) | PASS | — | {"fs":["bane"],"sw":["bane"]} |
| F2p-2b | the toast repeats the reason (or the validator's clash words) | PASS | — | ["Ranger — FLIGHT SAFETY STAND-DOWN & SAFETY WALK clash"] |
| F2p-2c | Monday's warning list raises the clash between the two rows (and did not before) | PASS | — | {"clash":["hard/DOUBLE_BOOK/bane/FLIGHT SAFETY STAND-DOWN & SAFETY WALK clash"],"rangerBefore":["hard/DOUBLE_BOOK/bane/VL BFM & Sim EP-4 clash","adv/NO_BRIEF/bane/No time for the VL BFM flight brief — Sim EP-4 sits inside 10:20–12:40 (brief 10:20)","adv/SIM… |
| F2p-2c-wording | the clash as the warning list words it (F20: the validator's wording is untouched by this change — validate.ts's diff is the two leaving-seat helpers only) | NOTE | — | ["hard/DOUBLE_BOOK/bane/FLIGHT SAFETY STAND-DOWN & SAFETY WALK clash"] |
| F2p-2d | his puck rings red on BOTH rows | PASS | `f2p-02-planted-anyway-rings.png` | [{"key":"a:0.2.0","cls":"puck sm warn hard boxred flagnew","ring":"rgb(240, 85, 95) 0px 0px 0px 2px"},{"key":"a:0.10.0","cls":"puck sm warn hard boxred flagnew","ring":"rgb(240, 85, 95) 0px 0px 0px 2px"}] |
| F2p-3a | Undo takes the plant off | PASS | — | [] |
| F2p-3b | retyped to 09:00–09:30 (abutting 08:30–09:00): Ranger is NOT struck | PASS | `f2p-04-drawer-abutting-ranger-free.png` | {"a2":"a:0.10.+","row":"09:00-09:30","no":false,"why":"","head":"Pilots · 23 free"} |
| F2p-3c | "N free" with the overlap vs abutting (Ranger is one of the differences) | NOTE | — | {"overlap":"Pilots · 22 free","abutting":"Pilots · 23 free"} |
| F2p-ERR | browser error list empty | PASS | — | [] |
| F3-0 | fixture: four overlapping empty targets made through + Row / + Item / + Line and typed times; Ranger on FLIGHT SAFETY 08:30–09:00 | NOTE | — | {"oft":"OFT F3 08:30-10:00","desk":"DESK F3 08:00-12:00","ground":"GROUND F3 08:30-09:30","line":"FTHREE br=undefined to=09:00 ld=10:30"} |
| F3-oft-plain | an OFT box 08:30–10:00 (its empty front seat), armed (he stays on the row): the palette still says he is busy | PASS | — | {"ak":"s:0.oft.5.p","why":"already on FLIGHT SAFETY STAND-DOWN 08:30–09:00"} |
| F3-oft-a | dragged off FLIGHT SAFETY onto an OFT box 08:30–10:00 (its empty front seat): the caption never names the row he is leaving | PASS | `f3-oft-hover-ranger-off-flight-safety.png` | {"caption":"","over":"s:0.oft.5.p"} |
| F3-oft-b | after the drop he is on the target and off the row | PASS | — | {"on":true,"off":true} |
| F3-oft-c | no toast and no warning names the row he left | PASS | — | {"toasts":[],"ranger":["hard/DOUBLE_BOOK/bane/VL BFM & Sim EP-4 clash","adv/NO_BRIEF/bane/No time for the VL BFM flight brief — Sim EP-4 sits inside 10:20–12:40 (brief 10:20)","adv/SIM_BRIEF/bane/No time for the OFT EP-4 brief — VL BFM sits inside 11:30–12:… |
| F3-oft-undo | Undo puts him back on FLIGHT SAFETY and the day is as before the drag | PASS | — | {"same":true,"crowd":["bane"]} |
| F3-desk-plain | a duty desk 08:00–12:00 (its + add), armed (he stays on the row): the palette still says he is busy | PASS | — | {"ak":"d:0.0.3.+","why":"already on VL BFM 11:40–14:35"} |
| F3-desk-a | dragged off FLIGHT SAFETY onto a duty desk 08:00–12:00 (its + add): the caption never names the row he is leaving | PASS | `f3-desk-hover-ranger-off-flight-safety.png` | {"caption":"already on VL BFM 11:40–14:35","over":"d:0.0.3.+"} |
| F3-desk-b | after the drop he is on the target and off the row | PASS | — | {"on":true,"off":true} |
| F3-desk-c | no toast and no warning names the row he left | PASS | — | {"toasts":["Ranger — DESK F3 duty & VL BFM clash (+2 more)"],"ranger":["hard/DOUBLE_BOOK/bane/DESK F3 duty & VL BFM clash","hard/DOUBLE_BOOK/bane/VL BFM & Sim EP-4 clash","adv/NO_BRIEF/bane/No time for the VL BFM flight brief — Sim EP-4, DESK F3 duty sits i… |
| F3-desk-other | the caption named something else (a real commitment/rule, not the row he left) | NOTE | — | already on VL BFM 11:40–14:35 |
| F3-desk-undo | Undo puts him back on FLIGHT SAFETY and the day is as before the drag | PASS | — | {"same":true,"crowd":["bane"]} |
| F3-ground-plain | a ground row 08:30–09:30 (its + add), armed (he stays on the row): the palette still says he is busy | PASS | — | {"ak":"g:0.9.+","why":"already on FLIGHT SAFETY STAND-DOWN 08:30–09:00"} |
| F3-ground-a | dragged off FLIGHT SAFETY onto a ground row 08:30–09:30 (its + add): the caption never names the row he is leaving | PASS | `f3-ground-hover-ranger-off-flight-safety.png` | {"caption":"","over":"g:0.9.+"} |
| F3-ground-b | after the drop he is on the target and off the row | PASS | — | {"on":true,"off":true} |
| F3-ground-c | no toast and no warning names the row he left | PASS | — | {"toasts":[],"ranger":["hard/DOUBLE_BOOK/bane/VL BFM & Sim EP-4 clash","adv/NO_BRIEF/bane/No time for the VL BFM flight brief — Sim EP-4 sits inside 10:20–12:40 (brief 10:20)","adv/SIM_BRIEF/bane/No time for the OFT EP-4 brief — VL BFM sits inside 11:30–12:… |
| F3-ground-undo | Undo puts him back on FLIGHT SAFETY and the day is as before the drag | PASS | — | {"same":true,"crowd":["bane"]} |
| F3-fly-plain | wave 1's new line, take-off 09:00 (its empty front seat), armed (he stays on the row): the palette still says he is busy | PASS | — | {"ak":"0.0.2.0.p","why":"already on FLIGHT SAFETY STAND-DOWN 08:30–09:00"} |
| F3-fly-a | dragged off FLIGHT SAFETY onto wave 1's new line, take-off 09:00 (its empty front seat): the caption never names the row he is leaving | PASS | `f3-fly-hover-ranger-off-flight-safety.png` | {"caption":"","over":"0.0.2.0.p"} |
| F3-fly-b | after the drop he is on the target and off the row | PASS | — | {"on":true,"off":true} |
| F3-fly-c | no toast and no warning names the row he left | PASS | — | {"toasts":["Ranger — Not enough time to attend the FTHREE  debrief — Sim EP-4 sits inside 10:30–12:30 (land + 2h) (+1 more)"],"ranger":["hard/DOUBLE_BOOK/bane/VL BFM & Sim EP-4 clash","adv/NO_BRIEF/bane/No time for the VL BFM flight brief — Sim EP-4 sits in… |
| F3-fly-undo | Undo puts him back on FLIGHT SAFETY and the day is as before the drag | PASS | — | {"same":true,"crowd":["bane"]} |
| F3-ERR | browser error list empty | PASS | — | [] |
| F5-0 | fixture: + Item SAFETY WALK 08:45–09:15 (empty). What the palette says of Ranger for WPNS & TACTICS SYNC 11:30–12:00 | NOTE | — | {"wpnsWhy":"already on VL BFM 11:40–14:35"} |
| F5-b1 | board, Ranger selected (blue): SAFETY WALK's + add has NO green ring (he is busy 08:30–09:00) | PASS | `f5-01-board-rings-ranger-selected.png` | {"selected":["bane"],"safetyWalk":"none","met":"green","sodb":"green","wpns":"none","ownRow":"green","wave2":["0.1.0.0.p:dim green","0.1.0.0.w:dim green","0.1.0.1.p:dim green","0.1.0.1.w:dim green","0.1.1.0.p:dim green","0.1.1.0.w:dim green","0.1.1.1.p:dim … |
| F5-b2 | the free programme rows around it — MET + NOTAM BRIEF 08:15–08:30 (abutting) and SODB 07:45–08:15 — are green | PASS | — | {"met":"green","sodb":"green"} |
| F5-b2w | WPNS & TACTICS SYNC's ring agrees with the palette's answer for it (he is busy there on this seed: VL BFM from 11:40) | PASS | — | {"ring":"none","palette":"already on VL BFM 11:40–14:35"} |
| F5-b3 | the seats of the evening wave (wave 2) are dim green (he could take over) | PASS | — | ["0.1.0.0.p:dim green","0.1.0.0.w:dim green","0.1.0.1.p:dim green","0.1.0.1.w:dim green","0.1.1.0.p:dim green","0.1.1.0.w:dim green","0.1.1.1.p:dim green","0.1.1.1.w:dim green"] |
| F5-b4 | his OWN row's + add (FLIGHT SAFETY) shows (green on main too, where every programme cell was excluded) | NOTE | — | green |
| F5-w1 | edit week, Ranger selected: SAFETY WALK no ring, MET green, WPNS as on the board | PASS | `f5-03-week-rings-ranger-selected.png` | {"selected":["bane"],"safetyWalk":"none","met":"green","sodb":"green","wpns":"none","ownRow":"green","wave2":["0.1.0.0.p:dim green","0.1.0.0.w:dim green","0.1.0.1.p:dim green","0.1.0.1.w:dim green","0.1.1.0.p:dim green","0.1.1.0.w:dim green","0.1.1.1.p:dim … |
| F5-w2 | edit week: his own row's + add shows | NOTE | — | green |
| F5-ERR | browser error list empty | PASS | — | [] |
| F6-a | (a) palette drag of Ranger onto FLIGHT SAFETY's + add: he is never listed twice | **FAIL** | `f6-a-after-palette-drag.png` | {"count":2,"crowd":["bane","bane"],"caption":"","toasts":[],"rangerWarn":["hard/DOUBLE_BOOK/bane/VL BFM & Sim EP-4 clash","adv/NO_BRIEF/bane/No time for the VL BFM flight brief — Sim EP-4 sits inside 10:20–12:40 (brief 10:20)","adv/SIM_BRIEF/bane/No time fo… |
| F6-b | (b) arm FLIGHT SAFETY's + add, tap Ranger: he is never listed twice | **FAIL** | `f6-b-after-arm-and-tap.png` | {"armed":"a:0.2.+","paletteSays":{"no":false,"why":""},"count":2,"crowd":["bane","bane"],"toasts":["Ranger planned"],"rangerWarn":["hard/DOUBLE_BOOK/bane/VL BFM & Sim EP-4 clash","adv/NO_BRIEF/bane/No time for the VL BFM flight brief — Sim EP-4 sits inside … |
| F6-de-0 | fixture for (d)/(e): FLIGHT SAFETY holds Ranger and Reaper | NOTE | — | ["bane","dice"] |
| F6-d | (d) palette Ranger dropped onto Reaper's seat in the crowd Ranger is already on: never a silent second copy (either one copy, or the caption / a toast says so) | **FAIL** | `f6-d-hover-palette-ranger-onto-reaper-in-his-own-crowd.png` | {"caption":"","crowd":["bane","bane"],"count":2,"toasts":[],"rangerWarn":[]} |
| F6-d-pic | after the drop | NOTE | `f6-d-after-palette-ranger-onto-reaper.png` | — |
| F6-e | a tap on Reaper's filled seat does not arm it (it selects him) — route (e) is not reachable this way | NOTE | — | {"armE":null} |
| F6-de-z | back to Ranger alone before (c) | PASS | — | ["bane"] |
| F6-c | (c) published Monday, Ranger's own puck onto his own row's + add: one copy, 0 pending, no busy toast | PASS | `f6-c-hover-own-puck-onto-own-row.png` | {"caption":"","count":1,"pend":"","toasts":[]} |
| F6-ERR | browser error list empty | PASS | — | [] |
| F1a-0 | fixture: Reaper on Mon–Fri; his only Saturday event is a Common Programme row (SAT BRIEF 09:00–10:00) at a:5.0.0; Sunday "SUN DUTY 09:00–12:00" empty | NOTE | — | {"setup":["0:a:0.0.+ → tapped","2:a:2.0.+ → tapped","3:a:3.0.+ → tapped","4:a:4.0.+ → tapped"],"days":["Mon","Tue","Wed","Thu","Fri","Sat"],"satMentions":1} |
| F1a-1 | (a) dragging Reaper off a Common Programme row (SAT BRIEF 09:00–10:00) onto Sunday: no "7th day in a row" under the ghost | PASS | `f1a-01-week-hover-reaper-sat-to-sun.png` | {"ghost":"puck","caption":"","over":"g:6.0.+","overWhy":null,"pic":"f1a-01-week-hover-reaper-sat-to-sun.png"} |
| F1a-2 | the move landed: on Sunday, off Saturday | PASS | — | {"sat":false,"sun":true} |
| F1a-3 | no run warning after the drop, no toast about it (the caption and the drop agree) | PASS | — | {"runW":[],"toasts":[]} |
| F1a-4 | the page Undo puts him back on Saturday | PASS | — | true |
| F1a-5 | from the palette (Saturday stays): Reaper struck "7th day in a row — breaks Sunday" | PASS | `f1a-03-palette-reaper-7th-day.png` | {"why":"7th day in a row — breaks Sunday (6 is the limit)"} |
| F1a-6 | the plant raises the run warning | PASS | — | {"runW2":["6/hard/DAYS_RUN/dice/Reaper is on the programme 7 days in a row — 6 is the limit, so a break day is due"],"toasts":["Reaper is on the programme 7 days in a row — 6 is the limit, so a break day is due"]} |
| F1a-ERR | browser error list empty | PASS | — | [] |
| F1b-0 | fixture: Reaper on Mon–Fri; his only Saturday event is an OFT front seat (SAT OFT 09:00–10:00) at s:5.oft.0.p; Sunday "SUN DUTY 09:00–12:00" empty | NOTE | — | {"setup":["0:a:0.0.+ → tapped","2:a:2.0.+ → tapped","3:a:3.0.+ → tapped","4:a:4.0.+ → tapped"],"days":["Mon","Tue","Wed","Thu","Fri","Sat"],"satMentions":1} |
| F1b-1 | (b) dragging Reaper off an OFT front seat (SAT OFT 09:00–10:00) onto Sunday: no "7th day in a row" under the ghost | PASS | `f1b-01-week-hover-reaper-sat-to-sun.png` | {"ghost":"puck","caption":"","over":"g:6.0.+","overWhy":null,"pic":"f1b-01-week-hover-reaper-sat-to-sun.png"} |
| F1b-2 | the move landed: on Sunday, off Saturday | PASS | — | {"sat":false,"sun":true} |
| F1b-3 | no run warning after the drop, no toast about it (the caption and the drop agree) | PASS | — | {"runW":[],"toasts":[]} |
| F1b-4 | the page Undo puts him back on Saturday | PASS | — | true |
| F1b-5 | from the palette (Saturday stays): Reaper struck "7th day in a row — breaks Sunday" | PASS | `f1b-03-palette-reaper-7th-day.png` | {"why":"7th day in a row — breaks Sunday (6 is the limit)"} |
| F1b-6 | the plant raises the run warning | PASS | — | {"runW2":["6/hard/DAYS_RUN/dice/Reaper is on the programme 7 days in a row — 6 is the limit, so a break day is due"],"toasts":["Reaper is on the programme 7 days in a row — 6 is the limit, so a break day is due"]} |
| F1b-ERR | browser error list empty | PASS | — | [] |
| F1c-0 | fixture: Reaper on Mon–Fri; his only Saturday event is a duty desk's extras line (SDO 08:00–18:00, Fable holds the desk) at d:5.0.0.x0; Sunday "SUN DUTY 09:00–12:00" empty | NOTE | — | {"setup":["0:a:0.0.+ → tapped","2:a:2.0.+ → tapped","3:a:3.0.+ → tapped","4:a:4.0.+ → tapped"],"days":["Mon","Tue","Wed","Thu","Fri","Sat"],"satMentions":1} |
| F1c-1 | (c) dragging Reaper off a duty desk's extras line (SDO 08:00–18:00, Fable holds the desk) onto Sunday: no "7th day in a row" under the ghost | PASS | `f1c-01-week-hover-reaper-sat-to-sun.png` | {"ghost":"puck","caption":"","over":"g:6.0.+","overWhy":null,"pic":"f1c-01-week-hover-reaper-sat-to-sun.png"} |
| F1c-2 | the move landed: on Sunday, off Saturday | PASS | — | {"sat":false,"sun":true} |
| F1c-3 | no run warning after the drop, no toast about it (the caption and the drop agree) | PASS | — | {"runW":[],"toasts":[]} |
| F1c-4 | the page Undo puts him back on Saturday | PASS | — | true |
| F1c-5 | from the palette (Saturday stays): Reaper struck "7th day in a row — breaks Sunday" | PASS | `f1c-03-palette-reaper-7th-day.png` | {"why":"7th day in a row — breaks Sunday (6 is the limit)"} |
| F1c-6 | the plant raises the run warning | PASS | — | {"runW2":["6/hard/DAYS_RUN/dice/Reaper is on the programme 7 days in a row — 6 is the limit, so a break day is due"],"toasts":["Reaper is on the programme 7 days in a row — 6 is the limit, so a break day is due"]} |
| F1c-ERR | browser error list empty | PASS | — | [] |
| F1d-0 | fixture: Reaper on Mon–Fri; his only Saturday event is a ground row's extras line (SAT ROW 09:00–10:00, another man holds the name) at g:5.0.x0; Sunday "SUN DUTY 09:00–12:00" empty | NOTE | — | {"setup":["0:a:0.0.+ → tapped","2:a:2.0.+ → tapped","3:a:3.0.+ → tapped","4:a:4.0.+ → tapped"],"days":["Mon","Tue","Wed","Thu","Fri","Sat"],"satMentions":1} |
| F1d-1 | (d) dragging Reaper off a ground row's extras line (SAT ROW 09:00–10:00, another man holds the name) onto Sunday: no "7th day in a row" under the ghost | PASS | `f1d-01-week-hover-reaper-sat-to-sun.png` | {"ghost":"puck","caption":"","over":"g:6.0.+","overWhy":null,"pic":"f1d-01-week-hover-reaper-sat-to-sun.png"} |
| F1d-2 | the move landed: on Sunday, off Saturday | PASS | — | {"sat":false,"sun":true} |
| F1d-3 | no run warning after the drop, no toast about it (the caption and the drop agree) | PASS | — | {"runW":[],"toasts":[]} |
| F1d-4 | the page Undo puts him back on Saturday | PASS | — | true |
| F1d-5 | from the palette (Saturday stays): Reaper struck "7th day in a row — breaks Sunday" | PASS | `f1d-03-palette-reaper-7th-day.png` | {"why":"7th day in a row — breaks Sunday (6 is the limit)"} |
| F1d-6 | the plant raises the run warning | PASS | — | {"runW2":["6/hard/DAYS_RUN/dice/Reaper is on the programme 7 days in a row — 6 is the limit, so a break day is due"],"toasts":["Reaper is on the programme 7 days in a row — 6 is the limit, so a break day is due"]} |
| F1d-ERR | browser error list empty | PASS | — | [] |
| F1e-0 | fixture: Reaper on Mon–Fri; his only Saturday event is a flying front seat (the control — worked before the change) at 5.0.0.0.p; Sunday "SUN DUTY 09:00–12:00" empty | NOTE | — | {"setup":["0:a:0.0.+ → tapped","2:a:2.0.+ → tapped","3:a:3.0.+ → tapped","4:a:4.0.+ → tapped"],"days":["Mon","Tue","Wed","Thu","Fri","Sat"],"satMentions":1} |
| F1e-1 | (e) dragging Reaper off a flying front seat (the control — worked before the change) onto Sunday: no "7th day in a row" under the ghost | PASS | `f1e-01-week-hover-reaper-sat-to-sun.png` | {"ghost":"puck","caption":"","over":"g:6.0.+","overWhy":null,"pic":"f1e-01-week-hover-reaper-sat-to-sun.png"} |
| F1e-2 | the move landed: on Sunday, off Saturday | PASS | — | {"sat":false,"sun":true} |
| F1e-3 | no run warning after the drop, no toast about it (the caption and the drop agree) | PASS | — | {"runW":[],"toasts":[]} |
| F1e-4 | the page Undo puts him back on Saturday | PASS | — | true |
| F1e-5 | from the palette (Saturday stays): Reaper struck "7th day in a row — breaks Sunday" | PASS | `f1e-03-palette-reaper-7th-day.png` | {"why":"7th day in a row — breaks Sunday (6 is the limit)"} |
| F1e-6 | the plant raises the run warning | PASS | — | {"runW2":["6/hard/DAYS_RUN/dice/Reaper is on the programme 7 days in a row — 6 is the limit, so a break day is due"],"toasts":["Reaper is on the programme 7 days in a row — 6 is the limit, so a break day is due"]} |
| F1e-ERR | browser error list empty | PASS | — | [] |
| F20-desk | desk holder (Sidewinder) dragged onto his extra (Reaper): silent, swapped | PASS | `f20-01-hover-desk-holder-onto-extra.png` | {"caption":"","toasts":[],"r":{"id":"dice","more":["mamba"]}} |
| F20-desk-z | desk back as the seed | NOTE | — | {"id":"mamba","more":[]} |
| F20-ground | ground row's extra (Reaper) dragged onto its name (Vapor): silent, swapped | PASS | `f20-02-hover-ground-extra-onto-name.png` | {"caption":"","toasts":[],"r":{"who":"dice","more":["vegas"]}} |
| F20-sim | sim front seat (Talisman) dragged onto the same box's extra (Reaper): silent, swapped | PASS | `f20-03-hover-sim-front-onto-its-extra.png` | {"simX":0,"caption":"","toasts":[],"r":{"p":"dice","w":"stiff","more":["haowen"]}} |
| F20-sim-z | sim back as the seed | NOTE | — | {"p":"haowen","w":"stiff","more":[]} |
| F20-info | FLIGHT SAFETY made ⓘ info-only; SAFETY WALK (overlapping) armed: Ranger is not busy | PASS | `f20-04-info-row-ranger-not-busy.png` | {"no":false,"why":""} |
| F20-sc-0 | + Wave → SC: what it made | NOTE | — | {"gi":2,"label":"SC","lines":[{"cs":"SC","to":"07:00","ld":"13:00","role":["MAIN","MAIN","SPARE","SPARE"]},{"cs":"SC","to":"13:00","ld":"19:00","role":["MAIN","MAIN","SPARE","SPARE"]}]} |
| F20-sc-fix | Comet planted on SC AM MAIN (front seat) through the arm and the palette | NOTE | — | {"planted":"beams","toasts":["Comet planned"]} |
| F20-sc-1 | SC AM MAIN dragged onto SC AM SPARE (same shift): caption clear, the move lands, nothing said after | PASS | `f20-05-hover-sc-main-onto-spare.png` | {"caption":"","landed":true,"leftEmpty":true,"toasts":[]} |
| F20-sc-2 | a plain plant of the MAIN man onto SPARE (he stays MAIN) still says "already on SC AM MAIN 07:00–13:00" | PASS | `f20-06-palette-sc-main-on-spare.png` | {"why":"already on SC AM MAIN 07:00–13:00"} |
| F20-sc-3 | SC AM MAIN (1st) dragged onto the OTHER SC AM MAIN seat of the same shift: caption clear, the move lands, nothing said after | **FAIL** | `f20-07-hover-sc-main-onto-other-main.png` | {"caption":"on SC AM 07:00–13:00 — inside this shift","landed":true,"leftEmpty":true,"toasts":[]} |
| F20-sc-4 | SC AM MAIN front seat dragged onto the same MAIN's rear seat: caption clear, the move lands, nothing said after | **FAIL** | `f20-08-hover-sc-main-front-onto-rear.png` | {"caption":"on SC AM 07:00–13:00 — inside this shift","landed":true,"leftEmpty":true,"toasts":[]} |
| F20-av-0 | + Wave → AVALON: what it made | NOTE | — | {"gi":3,"label":"AVALON","lines":[{"cs":"AV","to":"19:00","ld":"07:00","role":["MAIN","MAIN","SPARE","SPARE"]}],"bi":-1,"desk":null} |
| F20-av | AVALON shape not recognised — not driven | NOTE | — | {"gi":3,"label":"AVALON","lines":[{"cs":"AV","to":"19:00","ld":"07:00","role":["MAIN","MAIN","SPARE","SPARE"]}],"bi":-1,"desk":null} |
| F20-ERR | browser error list empty | PASS | — | [] |
