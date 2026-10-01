# Astra's scenario design — [DB-READINESS] group A phase 7 (1 Oct 26)

*(Saved verbatim from Astra's final message — `codex exec -m gpt-5.6-sol -c model_reasoning_effort=high -s read-only`, the plan at commit 47531e0d, the code `main` at 7612b19d; brief `2026-10-01-db-readiness-phase7-scenarios-brief.md`. One reviewer — D353.)*


## Scope and basis

This is a read-only scenario design against:

- `main` at `7612b19d8a5ec263821231ce2e235fc237c29e5a`
- The committed phase-7 plan/brief at `47531e0db8621a75a25184472fb778a81df338ca`

An implementation appeared uncommitted in the working tree while this review was in progress. I excluded it and read the product code from `main`, as the brief requires. I changed no file and ran no implementation tests.

Overall judgment: the plan targets the correct seams, but the walk must be treated as FULL-tier. The highest-risk omissions are the Personal-row membership path, issued-world SIM windows, sparse second-spare writes, and lifecycle transitions where a request changes identity or holder.

---

## 1. Roll-call draft

### 1.1 `[OIL-PERSONAL-PLACEHOLDER]`

Qualifying object: a standing landed request row whose request does not ask the OIL question—particularly Personal—containing ALL or ALL AVAIL in its primary name box or `more[]`.

Eligibility must exclude:

- Taken-off/`kept` requests.
- Cancelled rows.
- Information-only rows.
- Missing/deleted requests.
- Rows without a placeholder.

| Surface/consumer | Required visible sign | Required gesture/behavior |
|---|---|---|
| Board request/ground row | Count chip beside ALL/ALL AVAIL, even with OIL Earn off | Tapping opens the availability window |
| Edit week | Same count chip from `oilSeatDeco` | Week handler opens the same window with board closed |
| OIL Earn mode | Same crowd membership, but Personal contributes no earnings | Window may show the earn view; every Personal-only member is inert/zero |
| View-only Sched, issued face | Frozen count and frozen member list; title says it is the issued world | Chip opens read-only; no earning edits |
| Published working copy | Live membership on the working row; changed membership is pending | Existing sign-offs fall under D103 |
| Version preview | Frozen count/list from that version; historical previews deliberately carry no live flags | Read only |
| Saved-plan preview | Count and tap agree on the parked plan; it is not labelled issued | Read only; plan’s own row and crowd |
| Next-week peek | No count chip; a peek is not the day | No window door |
| Phone | Same count and list; full-width floating panel above the schedule | Tap, scroll and drag remain usable |
| Print/PDF and CSV | No count chip or floating availability window; exports remain their existing published flying report | No gesture |
| Changes window | No duplicate “count changed” record; the underlying request/placement/edit line is visible | Its existing jump/detail gesture reaches the affected row |
| Leave War | No automatic OIL credit from Personal, even on Saturday/PH | No Personal-derived credit should appear |
| Member role | May read the chip/window | Cannot change who earns |
| Scheduler role | May read; in OIL mode may attempt earning changes | Personal-only membership must still earn nothing |

The sign is the count/list. The working gesture is the chip tap. The downstream proof is that the crowd is frozen at publication but creates no Personal-derived credit.

### 1.2 `[CROWD-SIM-BRIEF]`

Qualifying object: a person represented behind ALL/ALL AVAIL whose placeholder event overlaps that person’s own SIM brief or debrief window.

| Object/surface | Required sign | Required gesture/behavior |
|---|---|---|
| OFT EP, 15-minute brief | Person remains in the crowd, amber flag `B`, full SIM-brief sentence | Tap the flagged puck for the full reason |
| OFT EP, 30-minute debrief | Person remains, amber flag `D`, full SIM-debrief sentence | Same |
| AMT BRIEF row | Person remains, amber `B` | Same |
| AMT DEBRIEF row | Person remains, amber `D` | Same |
| Working board/edit week | Flag derived from live `simwin` | Editing either time behind the open window updates the flag |
| View-only issued face | Flag derived from the issued snapshot’s `simwin`, not today’s SIM | Chip opens the official-world answer |
| Historical version preview | Membership remains version-correct; flags remain absent by the existing past-version rule | Read only |
| Phone | Flag and wrapped reason stay attached to the person | Tap still supplies the full sentence |
| Warning list | Existing warning text stays byte-for-byte consistent with the new shared sentence helpers | Clicking/jumping still targets the SIM row |
| Leave War | The flag does not alter OIL quantity | Existing valid credit remains unchanged |
| Ground crew | No SIM-brief/debrief flag | No false advisory |
| Person not on that SIM | No SIM-brief/debrief flag | No false advisory |

The critical missing call site is the issued-face argument: `AvailWindow` must provide both that version’s events and that version’s `simwin`.

### 1.3 Second spare SIM seat

Qualifying objects:

- Indexed SIM `pax[n]`.
- SIM `more[n]`.
- First spare and second spare.
- Direct drop and tap-arm placement.

| Surface/consumer | Required sign | Required gesture/behavior |
|---|---|---|
| Board SIM row | Person appears in the exact second spare targeted; first skipped seat stays visually empty | Palette drop and drag from another seat |
| Edit week | Same seat layout and identities | Tap-arm and picker placement |
| Stored day row | Arrays contain strings only; skipped indexes are `''`, never JSON `null` | Save/reload preserves exact indexes |
| Published face | Person remains in the same indexed seat | Publish and view |
| Undo/redo | Undo removes only the placed person; redo restores the same index | One step each |
| OIL | Person’s work/credit matches an otherwise identical named SIM seat | No omission or double credit |
| Changes window | One placement line with the correct SIM row/person | Existing detail gesture |
| Phone | First and second spare remain separately targetable | Touch/tap-arm path |

### 1.4 `[OIL-READ-LEFTOVERS]` closed items

**Saved-plan preview:** the sign is an identical count between the parked plan and its window; the gesture is the chip tap. It must say “as things stand now,” not “issued.”

**Placeholder-to-cockpit refusal:** every visible door must show the refusal before writing:

- Palette tap-arm.
- Drag from palette.
- Drag from another seat.
- Crew picker.
- Append/fill route if exposed.
- Phone equivalents.

The result must be no cockpit occupant, no pending mark, no Undo step and no Changes line. If any current door creates the state, it is a new-data finding and D56 does not exclude it.

### 1.5 `[STORE-READER-SWEEP]`

Every stored family needs a writer → persisted row → real loader → visible screen proof:

| Family | Writers | Readers | Reload sign |
|---|---|---|---|
| Scheduler inputs | Inputs add/edit/delete/move/handover | `state/persist.ts::hydrate` | Exact request, holder, dates, filing state and order |
| Roster people | Admin add/rename/archive/restore/posting | `hydrate`, Leave War sync readers | Exact person/status/order |
| Planning calendar | Notes, pucks, day titles | `hydrate` | Exact plan row/title/order |
| Week rows | Board/week edits, publish, amendment, unpublish, mutes | `weekrows.ts::rowsToParts/joinWeek` | Exact day, decisions, issued versions and withdrawals |
| Accounts/access requests | Admin Users and access workflow | `accountsLoad/readAccounts` | Role, person link, suspension reason, created position |
| Changes/seen | Every logged edit and “Mark seen” | `elogLoad`, `changesLoad` | Exact line, dates, affected items and unread state |
| Documents | Medical attachment upload | `docs.ts::docBoot` | File still opens with correct name/type |
| Leave War wars/records | War sheet, grid, bid, move, credit and award controls | `readWar`, `readRec/readRecs` | Exact grid, events, states, records and order |
| Leave War configuration | Settings controls | Individual `read*` validators in `state/store.ts` | Exact configured rows, filters, colours and policies |
| Postings | Post In, Post Out, restore/archive outcomes | `readPostOuts/readPast` | Exact current window and closed stints |
| Tracker enrolments | Course/chart roster controls | `rows.js::readable/joinRows` | Exact students and order |
| Tracker courses/charts | Create, reorder, hide, delete | `joinRows` | Exact catalogue/order/marks |
| Tracker ball details | Typed training-event details | Event-info `joinRows` | Exact text on the same chart and ball |

Unreadable old demo-only records are not findings when every current writer produces a readable shape.

### 1.6 `[OIL-WORDS]`

| Area | Required proof |
|---|---|
| Production screen | No “money”, “pay”, “paid” or “pays” used for OIL |
| Source change | Comments and test titles only |
| Production bundle | Byte-identical before and after the wording commit |
| Unit suite | Same test count |
| Product wording | “OIL”, “earned leave”, “credit”, “credited”, “earns” |

No user gesture or product behavior should change.

### 1.7 `[OIL-REQ-NAMEBOX]`

This remains a walk question, not an assumed build item.

Required walk:

1. Land another person’s asking request.
2. Put a different named person in its primary name box, not `more[]`.
3. Show the row, OIL mode and resulting credit.
4. Ask whether that substitute should earn as D18’s second man does.

Until answered, no implementation should widen `landedExtras`. The requester remains excluded. A named person in `more[]` continues to follow D18.

---

## 2. Ranked scenarios

### P0 — least-shared and most specialized paths

1. **Personal, ALL in primary box, timed weekday.**  
   Setup: create a timed Personal request, accept it, replace the row’s primary person with ALL. Action: open board and tap the count. Expected: a nonzero count and “who is free as things stand now”; no OIL credit because it is a weekday and Personal never asks. Disproof: missing chip, empty window, or any Personal earning.

2. **Personal, ALL AVAIL in primary box, all-day Saturday.**  
   Setup through Inputs and the board. Action: open the chip with OIL Earn off and on. Expected: identical membership in both modes; zero earners and no Leave War auto credit. Disproof: membership disappears in one mode or any person earns.

3. **Personal, ALL in `more[]`, timed Saturday.**  
   Setup: keep the requester in the name box and add ALL as an extra. Action: publish. Expected: count/list exists and is frozen; the Personal crowd earns nothing. Disproof: extras path has no count, differs from primary-box membership, or creates credit.

4. **Personal, ALL AVAIL in `more[]`, all-day weekday.**  
   Expected: count/list exists despite no explicit row times; no earning. Disproof: D31 is misapplied as “no usable time” and suppresses the membership.

5. **ALL in the name box and ALL AVAIL in extras together.**  
   Action: open both visible count doors if two pucks are drawn. Expected: identical deduplicated semantics; no person counted twice and no duplicate credit. Disproof: two different crowds, doubled total or doubled Leave War credit.

6. **Personal negative-state quartet.**  
   Repeat with cancelled, information-only, taken-off/`kept`, and no-placeholder rows. Expected: no Personal membership entry, chip or frozen crowd. Disproof: any excluded row produces a chip or pending OIL evidence.

7. **Edit the Personal request’s time; Undo, Redo, reload.**  
   Expected: crowd recomputes from the new request window; Undo restores the old crowd, Redo restores the new one, reload keeps the redone state; no credit throughout. Disproof: stale membership, an extra history step, or reload drift.

8. **Retype Personal → Training; Undo, Redo, reload.**  
   Expected: the same row changes from membership-only/no earning to the ordinary asking-type behavior; Undo restores Personal’s zero-credit rule. Disproof: duplicate evidence entries, retained Personal semantics after retype, or requester/crowd double credit.

9. **Retype Training → Personal; Undo, Redo, reload.**  
   Expected: existing asking entry is replaced by membership-only evidence without leaving stale earning decisions. Disproof: people continue earning because the prior asking entry survives.

10. **Move the Personal request to another day under D468; Undo, Redo, reload.**  
    Setup: put a named extra and placeholder on the old landed row. Expected: the request arrives filed on the new day; scheduler additions remain with the old day, reappear with the request if it returns before that day is saved, and the new day receives only applicable new membership. Disproof: extras silently travel, disappear from the old day, or credit follows the wrong day.

11. **Take the request off; Undo, Redo, reload.**  
    Expected: chip/list disappear immediately; Undo restores the exact crowd and decisions; Redo removes them again. Disproof: orphan count, retained frozen-looking entry on the live row, or stale credit.

12. **Delete the request; Undo, Redo, reload.**  
    Expected: landed row no longer resolves, open window says the row is gone, and reload does not resurrect it; Undo restores it. Disproof: row remains actionable or an orphan item persists in OIL evidence.

13. **Hand the request to another member; Undo, Redo, reload.**  
    Expected: holder-sensitive decisions for the former holder are void under the holding stamp; a scheduler-added extra’s valid decision remains; Personal crowd still earns nothing. Disproof: old holder inherits an old denial after A→B→A, or the extra’s decision is pruned.

14. **OFT EP SIM brief, working copy.**  
    Setup: put a crowd member on an OFT EP and place the placeholder event inside its 15-minute brief. Expected: member remains listed with amber `B`; reason follows “No time for the … brief — [event] sits inside …”. OIL quantity is unchanged. Disproof: person filtered out, unflagged, red, or credited differently.

15. **OFT EP SIM debrief, working copy.**  
    Expected: amber `D` with the 30-minute debrief window and unchanged credit. Disproof: flight-debrief wording, no flag, or filter-out.

16. **AMT BRIEF-row overlap.**  
    Expected: AMT’s written BRIEF window is used without invented lead time. Disproof: OFT’s 15-minute rule is applied to AMT.

17. **AMT DEBRIEF-row overlap.**  
    Expected: AMT’s recorded debrief window and shared SIM-debrief sentence. Disproof: event is outside the actual recorded window but still flagged, or inside and unflagged.

18. **Issued-world SIM overlap.**  
    Setup: publish the overlap, then edit the live SIM time so the overlap disappears. Action: open View-only Sched. Expected: issued face still lists and flags the member using its own `simwin`; working copy reflects today. Disproof: issued face follows the live SIM or loses the flag.

19. **SIM negatives.**  
    Repeat outside the windows, for a person not on that SIM, and for ground crew. Expected: no SIM brief/debrief flag. Disproof: any false advisory.

20. **Second spare `pax` by drop.**  
    Setup: expose two spare places, leave the first indexed spare blank and drop onto the second. Expected: `pax` is `['', personId]`, both entries strings; target person stays at index 1 and first spare remains offered. Disproof: JSON `null`, index collapse, or person moves to index 0.

21. **Second spare `pax` by tap-arm.**  
    Expected: identical stored shape and rendering to direct drop. Disproof: only one gesture pads correctly.

22. **Second spare `more[]` by drop.**  
    Expected: `more` is padded with `''` before the person. Disproof: sparse array serializes a hole/`null`.

23. **Second spare `more[]` by tap-arm.**  
    Expected: same as drop. Disproof: gesture-dependent shape.

24. **Publish and reload sparse-seat cases.**  
    Expected: live, issued and reloaded faces show the same person at the same indexed seat; every stored element is text. OIL/Leave War matches an equivalent first-spare occupant. Disproof: disappearance, index shift, or different credit.

25. **Undo/redo the second-spare placement.**  
    Expected: one Undo removes only that person and trims only trailing blanks; Redo restores the same index. Disproof: neighboring seats shift, the first blank is removed, or Redo fills another slot.

### P1 — doors, publication and shared surfaces

26. **Published Personal crowd freezes.**  
    Setup: publish a Saturday Personal row with ALL AVAIL. Action: file later leave for one crowd member. Expected: live crowd changes; issued count/list stays frozen; pending comparison appears and all four sign-offs fall. Leave War still has no Personal-derived credit. Disproof: issued crowd changes, no pending item, or signatures remain.

27. **Undo the later leave.**  
    Expected: live membership returns exactly to the issued state, pending clears and D103 sign-offs restore. Disproof: signatures remain absent or crowd remains divergent.

28. **Published request edit/retype/handover matrix.**  
    Repeat scenarios 7–13 on a published day. Expected: issued face remains unchanged; working face shows the mutation; each mutation is pending, wipes sign-offs, and survives reload. Undo restores exact equality. Disproof: issued record mutates or any change escapes pending comparison.

29. **Cockpit refusal—palette tap-arm.**  
    Arm each FCP/RCP cockpit and tap ALL then ALL AVAIL. Expected: struck/refused reason, no write, no pending mark, Undo step or Changes line. Disproof: cockpit draws as crewed.

30. **Cockpit refusal—drag from palette.**  
    Same expectations. Disproof includes a temporary planted puck that is later removed; the refusal must precede the write.

31. **Cockpit refusal—drag from another seat.**  
    Place the placeholder legally on ground/SIM, then drag it to every cockpit seat. Expected: source remains intact because destination refuses. Disproof: source clears, cockpit fills, or an Undo step appears.

32. **Cockpit refusal—crew picker/append/phone.**  
    Exercise every picker or fill route exposed at desktop and phone width. Expected: same refusal at every route. Any successful current write is a real finding, not D56.

33. **Another man’s request name box.**  
    Setup: land Member A’s asking request and place Member B into the primary name box; also run the same row with B in extras. Expected before owner answer: capture the exact difference—extras follows D18, primary-box behavior is shown but not changed. Disproof of the question’s premise: the UI has no such primary-box door. This scenario must produce the owner-facing picture.

34. **Saved-plan and version previews.**  
    Expected: a parked plan’s chip/window agree and say current/plan-world words; issued/version preview is read-only and cannot alter today’s OIL decisions. Disproof: parked plan says “issued,” preview count and window disagree, or a tap writes to the working day.

35. **Role and phone parity.**  
    Scheduler and member open the same chip at desktop and phone widths. Expected: identical membership/flags; member has no earning controls, scheduler has them only on the working copy; panel remains above the schedule and usable. Disproof: role changes the crowd, or phone drops the reason/gesture.

### P2 — persistence and proof obligations

36. **Stored week compound row.**  
    Through the UI create a day containing the padded second SIM spare, a Personal placeholder, an OIL person decision, an issued version and an Unpublish/reissue. Reload. Expected: exact seats, crowd, decisions, issuance/retraction history and pending state. Disproof: any current write narrows or disappears on real hydration.

37. **High-risk non-scheduler reader sweep.**  
    Through controls perform: Post In without Post Out, then a full out/back stint; add a sixth Leave War event row and band; create an auto OIL credit with spans; move a non-contiguous request that produces rich Changes metadata; edit Tracker ball details and reorder/hide its chart. Reload after each. Expected: every screen is byte/meaning-equivalent. Disproof: any legitimate current value is absent, defaulted or shortened.

38. **OIL wording-only commit.**  
    Build before and after the isolated wording commit. Expected: identical production bundle bytes and unchanged unit count; source/test prose no longer calls OIL money/pay, and no product screen contains those words. Disproof: any bundle byte, behavior, test count or visible text changes.

---

## 3. Proposed automated tests

### Personal placeholder

`src/engine/oilmembership.test.ts`

Assert:

- Personal + ALL AVAIL writes membership on weekday and Saturday.
- Timed and all-day requests both work.
- Primary and extras paths work.
- Cancelled, info-only, taken-off/`kept`, missing request and no-placeholder rows write none.
- An ordinary non-placeholder Personal day’s evidence remains byte-identical.
- Saturday Personal crowd produces no earned work.
- Existing asking-type entries remain unchanged.
- Publication freezes membership and later leave changes the live block only.

`src/ui/oilcount.test.tsx`

Assert the Personal request row draws the same chip on board and edit week and that the week’s own handler opens the window.

`src/ui/availwin.test.tsx`

Assert the Personal chip lists the crowd, issued words/list are frozen, OIL view has no Personal earners, member is read-only, and the phone panel retains its reason and controls.

### SIM brief/debrief crowd flags

`src/engine/validate.test.ts`

Assert `crowdClashes` returns:

- Amber SIM brief for OFT EP.
- Amber SIM debrief for OFT EP.
- Amber brief for AMT BRIEF.
- Amber debrief for AMT DEBRIEF.
- Nothing outside the window.
- Nothing for a nonparticipant.
- Nothing for ground crew.
- The supplied issued `simwin`, not the live one.

Also pin that the warning pass’s existing strings remain unchanged after extraction to `simBriefSays`/`simDebriefSays`.

`src/ui/availwin.test.tsx`

Assert the person remains in the list, wears the correct flag, contributes to the flagged count, exposes the full sentence on tap, and an issued face reads its snapshot’s `simwin`.

### Sparse SIM seats

`src/ui/simspare.test.tsx`

Assert for both `pax` and `more`, and for drop and tap-arm:

- Every array element is a string.
- Skipped index is `''`.
- Target person remains at the selected index.
- First spare is still offered.
- Save/reload and publish preserve indexes.
- Undo/redo restores the identical array.

### Cockpit doors

`src/ui/oilseat-refusal.test.tsx`, `src/ui/drag.test.tsx`, and `src/ui/editweek.test.tsx`

Assert each door refuses ALL and ALL AVAIL before mutation and leaves:

- Cockpit empty.
- Source unchanged for a move.
- `SCHED.pending` unchanged.
- No history/Undo entry.
- Correct visible refusal.

### Request name box

If the owner answers “yes,” add to `src/engine/oilev.test.ts` or `src/engine/oilmembership.test.ts`:

- Named substitute in the landed primary box earns as an extra would.
- Original requester remains excluded.
- Removing/moving/handover prunes or preserves the correct decision.
- Primary-box and `more[]` behavior agree.

Nothing should be added before that answer.

### Store-reader sweep

Recommended red-first homes:

- `src/state/weekrows-store.test.ts`: current UI/engine write → row save → `joinWeek` → exact compound week.
- `src/leavewar/postout-persist.test.ts`: Post In-only `{from, to:null}`, complete stints and restore survive `readPostOuts`.
- `src/leavewar/rows.test.ts`: sixth event line/band, auto credit spans, `via`, `ord` and record details round-trip.
- `src/state/elog-rows.test.ts`: `iids`, `days`, `wdays`, `wdate/wend`, `itype`, `sect`, `sub` and `fld` survive `elogLoad`.
- `src/state/accounts-rows.test.ts`: `offBy`, `seenFrom`, `createdAt`, request seat/CAT and per-admin seen state survive `accountsLoad`.
- `src/tracker/app/rows.test.ts`: typed event details with punctuation, enrolment order, chart order/hidden/tomb/definition survive `splitValue` → stored rows → `joinRows`.
- `src/state/docs.test.ts`: multiple uploaded files reload with correct ID, name, MIME, size and Blob.

---

## 4. Reader/writer pairs most likely to narrow

These are priorities for the sweep, not declared findings.

1. **Posting windows: `setPostIn`/`setPostOut`/restore ↔ `readPostOuts/readPast`.**  
   Exact vulnerable write: a legitimate current stint with only `from` set and `to:null`, followed later by closed `past[]` stints. Walk: Post In a person, reload and inspect roster/availability; then Post Out, restore, reload and inspect the full window.

2. **Week composition: schedule writers ↔ `rowsToParts/joinWeek`.**  
   Exact write: padded `pax:['', id]` or `more:['', id]` combined with OIL decisions, issuance and retraction rows. Walk: place second spare, publish, unpublish/reissue, reload and compare every face.

3. **Changes rows: all `logEdit`/`logAction` writers ↔ `elogLoad`.**  
   Exact write: a moved request naming multiple IDs and non-contiguous before/after day arrays. Walk: move it, reload, group Changes by day/item and verify no gap day is claimed and both old/new spans remain reachable.

4. **Leave War records: bid/credit/award/move writers ↔ `readRec/readRecs`.**  
   Exact write: auto OIL credit with `via`, note and time spans beside another record at a stable `ord`. Walk: publish qualifying work, add a manual award/bid, reload and inspect day detail, order, credit giver and conflict state.

5. **Variable war structure: event-row/band writers ↔ `readWar`.**  
   Exact write: text and a band on the sixth configured event line, with instance kind. Walk: add rows in Settings, add the band, reload and look at the same line/date.

6. **Tracker split rows: core record writers ↔ `readable/joinRows`.**  
   Exact write: event details keyed by a ball name requiring URI encoding, plus chart hide/order/tomb fields. Walk: type the details, reorder/hide, reload and reopen that exact ball.

7. **Accounts and seen positions: account/access writers ↔ `readAccounts/accountsLoad`.**  
   Exact write: an account carrying `offBy:'po'`, `seenFrom:{at,lineId}` and `createdAt`, plus per-admin request-seen state. Walk: archive/post out, create another user, mark requests seen, reload and inspect status and bell.

8. **Medical document drawer: `docAdd` ↔ `docBoot`.**  
   Exact write: several attachments with independent IDs and metadata. Walk: upload, reload, reopen every attachment.

9. **Manning/group/event configuration readers.**  
   Exact write: maximum-size valid filters/rules, sixth event row and a custom qualification colour. Walk: configure at valid bounds, reload Settings and the matrix.

10. **Inputs, people and plan rows.**  
    Lower risk because their current row readers are intentionally permissive objects, but still verify ordering, opaque IDs, placeholders-not-stored, and day titles.

A mismatch counts only if today’s app can write the value. A malformed older record or unsupported pre-phase shape is D56, not a finding.

---

## 5. Ruling conflicts and open cases

No direct ruling conflict was found.

The following cases remain open:

1. **Personal placeholder earning.**  
   D43/D46 require the placeholder to behave like named people and be allowed on a request row. The 28 August rule says Personal never asks the OIL question. These coexist if the crowd is counted but earns nothing—the plan’s interpretation. The owner has not explicitly confirmed that exact crowd case, so it remains an assumption to show in the walk.

2. **Another man in the request name box.**  
   D18 says a second man put on the request row earns like the filer. It does not expressly say whether replacing the primary name box is the same relationship as adding an extra. `[OIL-REQ-NAMEBOX]` therefore remains an owner question.

3. **D56 and cockpit copies.**  
   D33/D47 refuse placeholders in cockpits at every current door. If all doors refuse, an old stored cockpit placeholder is excluded by D56. If any current door recreates it, D56 no longer applies and it is a real finding.

D36 and the SIM work do not conflict: availability remains narrow and the person stays in the crowd; the overlap is surfaced as an amber flag rather than filtering the person out.

---

## 6. Explicit negatives

Checked and deliberately not requested as changes:

- Personal and SANS Availability still never ask the OIL question.
- Personal placeholder membership must not create OIL credit.
- Named Personal-row occupants continue to earn nothing.
- Cancelled, information-only, taken-off/`kept` and missing request rows produce no placeholder evidence.
- A row without a placeholder remains byte-for-byte unaffected.
- ALL and ALL AVAIL have identical crowd semantics.
- Ground crew remain outside both placeholder crowds and SIM brief/debrief advisories.
- A person outside the SIM brief/debrief window is not flagged.
- A person not on that SIM is not flagged.
- SIM flags do not change credit quantity.
- Historical version previews do not acquire live warning flags.
- Next-week peek gets no availability count or window.
- Print/PDF and CSV get no chip or floating window.
- Changes gets no duplicate line solely because a derived count changed.
- Members may read but not edit OIL decisions.
- Issued/version windows are read-only.
- A parked plan is not an issued day.
- Placeholder cockpit refusal must leave no mutation, pending mark, Undo entry or history line.
- Existing malformed/demo-only records are not findings when all current writers are correct.
- `[OIL-WORDS]` changes no production behavior or visible vocabulary.
- No implementation work or test result is claimed by this report.

Prior memory was used only as a workflow safeguard that historical green suites do not constitute current clearance; all substantive conclusions above were re-read from this checkout.

