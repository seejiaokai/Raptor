# Scenario design — one man's row of a shared absence (a fresh, blind Fable designer, chat 178, 25 Nov 26)

*Head, from the brief and the run (chat 178): a fresh Fable helper, given the same brief as Astra and the Opus designer
(`2026-11-25-shared-row-scenario-brief.md`, word for word, the copy's path and the report's path filled in), blind to both:
it read an exported, picture-free copy of the branch as it stood after chat 177's last fix (`c496d0e36` joined with
`main`), from which the other two designers' reports, the evidence sheet and chat 177's handoff block were taken out
(`D:/c178/scn`, two commits: `main`, then the whole change). It was run after Fable's weekly allowance reset; chat 177
had listed it as a read owed. 449 seconds, 248,673 tokens (the harness's figures). The report follows whole.*

# Scenario design (Fable, blind) — one man's row of a shared absence

Designer's notes first. No compaction happened and no handoff block was pasted. I opened no other designer's report and
not the brief copy in the repo. The commit's own code comments name earlier designers' findings (M2–M5, S04) — I saw
those only through `git show HEAD`; they are treated below as "pinned", not re-derived. I ran no tests and no build.

Fixture used throughout unless said: **draft day D**, a leave (LL) filed on the Inputs page for **Ranger + Hex**,
08:00–10:00, no remark. "3-man" adds Outlaw. Admin = scheduler (D785). Phone 402×874, desktop 1440×900.

**How to hold the caret (matters for half the list).** The fault lives only while the row is not repainted. On a desktop
that is: Tab between boxes. On an iPhone it is far wider: a tap on a BUTTON leaves the caret in the box (the repo says so
itself — `ReqWords.tsx` "an iPhone keeps the box focused when a button is tapped"; `board.ts` data-sortsec note). Chromium's
phone emulation moves the focus on a tap, so it cannot show this. Walk the phone scenarios in Playwright **WebKit** with
touch; if WebKit on Windows also moves the focus, say so and flag S1–S3, S8, S9 for his own iPhone look — do not mark
them passed.

## 1. What qualifies — and where the sign and the working gesture should be

| Item | Where it is drawn / reached | Follows him after the cut? (read of the code) |
|---|---|---|
| Start, End, Remark boxes — Board (`data-ifld`) | Unavailable panel, desktop and phone | yes — `boardChange`, `boardTab`, Escape, arrival refresh all ask `rowInputOf` |
| Start, End, Remark cells — Edit Schedule week (`data-inp`) | week's Unavailable block | yes — focusout, Escape, arrival refresh |
| His puck as a drop / plant target (`data-inpseat`) | both | drop: yes (`reassignInput`). **Arm's liveness: no** — `engine/slots.ts:444` tests `holds(sharedInput, him)` with no follow; `state/view.ts:1440` names the row off the shared input |
| **The type label → the input's window (`data-inpedit`)** | both; the row's only door to Type and Delete | **no — addressed by the bare input id (`inpEditLabel`, `interactions.ts:1383`)** |
| **Reject on an Unavailable row (`data-acc` / `data-acck`)** — an overseas duty, a commitment moved to Unavailable | both (`accCtl`, `interactions.ts:1042`) | **no — bare input id** |
| **LATE chip (`data-lateoff`)** | Board row | **no — bare input id** |
| History dot / bubble, changes-window jump (`data-inprow`) | both | reads by the held address (`histbubble.ts`, `changesjump.ts`, `pendlist.ts:204`) — no follow |
| Leave War remark row (`LeaveWords`) | member's own window (`RemarksSheet`), admin's decide window (`BidPicker`), day's list (`DayList`), drag window (`SelectSheet.keepWords`), "Add to the LL" carry chip | words: yes (`setLeaveRemarks`). The window's other buttons use the cell's id (= the input id) — see S5 |
| Readers | Inputs page card and calendar, Leave War grid, week view page, Board read-only rows, warnings, OIL figure, bell, changes window, pending count, waiting mark (`unavPendAtt`), sign-off strip, history | must show Ranger's and Hex's leaves apart, at once |
| Kinds on the list | LL and other leave, overseas duty, course, Attach (with "To"), Other under Unavailable, a commitment moved there (`acc 'u'`); all-day, timed, half day, several days | `saveFromRow` cuts for all of them; only a Personal line under Personal Inputs is "for everyone" |
| Roles | admin on any row; member only in the Leave War's own window; member on another's cell: read-only | |

The three **bold** rows are the missing-call-site candidates: every text box on the held row now follows him, every
BUTTON on the same row still names the shared input — which, after his first change, is the others' alone.

## 2. Scenarios, ranked by likely failure

### S1 — the type label on his held row opens the OTHERS' leave (phone Board; desktop variant)
- **Role / setup:** admin, fixture.
- **Presses (phone, WebKit):** Board → day D → Unavailable. Tap Ranger's Start, type `0900`. Tap his End (first save),
  type `1100`. Tap his Remark, type `Dental`. Keyboard still up, tap the **LL** label on Ranger's row. Picture after
  each tap. In the window press **Delete** (confirm).
- **Expected:** after the label tap the remark is saved on Ranger's own leave (promise; `ui-contracts.md` "On such an
  Unavailable row the box changes HIS part alone"). The window that opens is **Ranger's** leave: his name alone,
  09:00–11:00, "Dental" (promise — "every later change on his row reaches HIS input"; D737). Delete removes Ranger's
  leave; Hex keeps 08:00–10:00, no remark (Inputs page, Leave War grid).
- **Disproof:** the window names Hex or shows 08:00–10:00 / no remark; Delete or a Type change lands on Hex's leave and
  Ranger's 09:00–11:00 leave is still there.
- **Desktop variant (1440×900, week and Board):** type `0900` in Ranger's Start and, without Tab, click the LL label
  with the mouse. RECORD exactly: which leave the window opens on, or whether the press is swallowed. Disproof: a
  window on Hex's leave.

### S2 — Reject on his held row takes the OTHERS' input out of Unavailable (phone Board and week)
- **Setup:** an overseas duty for Ranger + Hex on D (and, second pass, a commitment for both moved to Unavailable).
  Each man's row carries Reject.
- **Presses:** on Ranger's row: Start `0900`, tap End, type `1700`, tap Remark; then tap **Reject on Ranger's row**.
- **Expected:** Ranger's own duty goes back to Personal Inputs, or the press is refused in words; Hex's row stays under
  Unavailable untouched (promise: "the others' input is never changed by it"; D737). RECORD the note's words.
- **Disproof:** Hex's row leaves Unavailable while Ranger's timed row stays; the note names Hex.
- **Control:** same press with the row repainted (tap Done first) — record what Reject on one man's row of a shared
  duty does there, so the held result can be told from the standing behaviour.

### S3 — the Leave War admin window: a remark, then Delete / Refuse / Move without closing (desktop + phone)
- **Setup:** a leave the war approved that holds Ranger + Hex (approve Ranger's bid on the war, then add Hex in its
  window on the Inputs page; if that cannot be made, record that no war-approved leave can hold two and run the member
  half, S4).
- **Presses:** Leave War → tap Ranger's cell → decide window. Type remark `Dental`, Tab (first save: his own leave).
  Change it to `Dental, gym`, Tab. Tick till. Then press **Delete** (second pass: **Refuse**; third: **Approved** to
  send back; fourth: **Move**). Repeat from the day's list (several entries on the cell).
- **Expected:** both remark saves and the tick on Ranger's own leave (pinned for words; RECORD for the tick). The
  action acts on **Ranger's own leave**, or refuses in words; Hex's leave keeps its dates, approval and no remark
  (`sync.ts warLeaveRow` — "a stale or mismatched id is never moved", as on main today).
- **Disproof:** Hex's cell changes; or the press does nothing and says nothing (the cell id the buttons carry is the
  shared input's); or the window's header still describes the shared leave after the split.

### S4 — the member's own window, four saves (phone; role: member Ranger)
- **Setup:** fixture leave spanning Mon–Wed, signed in as Ranger.
- **Presses:** Leave War → own Tuesday cell → remark `Dental`, tap outside the box; add a document; tick till; change
  the remark to `Dental pm`; close. Sign in as Hex, open his Tuesday cell. Sign in as admin: Inputs page.
- **Expected:** all four on Ranger's own leave Mon–Wed; Hex's leave has no remark, no document, till as it was
  (promise; D755 (3) "he may always withdraw himself"). Hex's window shows an empty box. Inputs page: two leaves.
  Bell: RECORD exactly who is told what on the first save (the admin who filed it; Hex) — on the later ones nobody
  but those told of Ranger's own leave (unit-pinned "nobody else is told anything").
- **Disproof:** any of the four on Hex's leave; Ranger's box showing words he did not type; "could not be saved" on
  save 2–4.

### S5 — the same time retyped splits him silently (desktop Board and week)
- **Presses:** Board: click Ranger's Start (shows `08:00`), select all, type `0800`, Tab. Week: the same in the cell.
- **Expected:** nothing changes — one leave, both men, no history line, no pending change (`textedit.ts` "LEFT AS IT
  WAS, NOTHING IS SAVED"; D45 "things shouldn't change silently"). RECORD exactly what happens.
- **Disproof:** two leaves with identical times, an Undo step, a history line, and on a published day one more
  "pending" for a change nobody made.

### S6 — published day: what waits, on whose row (desktop Board; D45, D103, D736, D1784)
- **Setup:** fixture on a **published, four-times-signed** day.
- **Presses:** Ranger's row: `0900` Tab, `1100` Tab, `Dental` Tab, then click empty space. Picture and the "N pending"
  figure after each Tab and after the caret leaves. Open the changes window. Look at the issued day as a member.
- **Expected:** after the first Tab the day reads pending and the sign-offs are wiped (D103); the count is **one**
  change for the three Tabs (`engine/inputs.ts` 3b — "one man split out … is that input's one change"); RECORD the
  figure each time. The changes line: "Ranger · LL … his own now — 09:00–11:00" (`pendlist.ts`), its tap landing on
  Ranger's row. After the caret leaves, Ranger's row wears the waiting mark; RECORD whether Hex's row wears one too
  (`publish.ts pendingInputIds` adds both ids — as on main today). The issued face and a member's view still show
  both 08:00–10:00 until the amendment (D44/D45). After publishing the amendment: Ranger 09:00–11:00 "Dental", Hex
  08:00–10:00, count 0.
- **Disproof:** the count rising per Tab; a line "Hex … changed" or Hex's time or remark in the amendment; the
  waiting mark on Hex's row only; sign-offs standing; the tap landing on Hex's row.

### S7 — a puck tapped on his held row, then a name (phone Board)
- **Presses:** after S1's three boxes, keyboard up: tap Ranger's puck on his row, then tap `Outlaw` in the crew drawer.
- **Expected:** Outlaw 09:00–11:00 "Dental" in Ranger's place on Ranger's own leave ("Outlaw is now unavailable
  instead of Ranger" — `reassignInput`, as the drop is pinned), or a refusal in words. Hex untouched.
- **Disproof:** Hex replaced; or the tap arms nothing / the arm drops with no words (`slots.ts:444` reads the held
  address against the shared leave) — RECORD exactly, with the arm strip's wording.

### S8 — Undo and Redo with the caret still in his row (phone tap; desktop for record)
- **Presses (phone):** `0900`, tap End, `1100`, tap Remark (two saves). Keyboard up, tap top-bar **Undo** twice, then
  type `Dental` in the Remark box and tap Hex's Start box. Then Undo once, **Redo** once, type ` pm` after the remark,
  tap away.
- **Expected:** after two Undos one leave, both men, 08:00–10:00 (pinned in unit). The remark then lands on a fresh
  leave of Ranger's own (pinned), which is 08:00–10:00 + "Dental". **What the held row SHOWS** after the Undos is
  unsourced — RECORD exactly (it may still read 09:00 / 11:00 while 08:00–10:00 is saved). After Redo the words reach
  Ranger's own.
- **Disproof:** anything written on Hex's leave; Ranger in neither leave; after the caret leaves, the row disagreeing
  with the Inputs page.

### S9 — three men, rows typed in turn, a clear, a run of days (desktop week, then Board)
- **Setup:** 3-man leave, Mon–Wed, all day.
- **Presses (week, Tuesday's block, caret never leaving it):** Ranger Start `0900` Tab (End box on arrival must show
  his `23:59`) → End `1100` Tab → Remark `A` Tab → into Hex's row: Start `1300` Tab, Remark `B` Tab → back to Ranger's
  Remark (Shift+Tab or click): `A2` Tab → Hex's Start: clear it, Tab → Outlaw's Remark `C` Tab → click away.
- **Expected:** Ranger own 09:00–11:00 "A2", Mon–Wed (D739 reading 2: his time on every day it covers); Hex own, all
  day again after the clear ("clearing a time means all day"), "B"; Outlaw alone on the first leave, all day, "C" —
  changed in place, no fourth leave. Monday's and Wednesday's blocks show the same at once; each remark followed by
  "till <last day>" in grey (D948). Leave War grid: three men, three entries, Ranger part-day. Undo steps: one a Tab
  that changed something.
- **Disproof:** any man's words or times on another's leave; four or more leaves; Monday disagreeing with Tuesday;
  a box on arrival showing another man's value; an untouched box saving on the way through.

### S10 — refusals, first and later (desktop Board + week)
- **Presses:** (a) Ranger End `0700` Tab as the FIRST change. (b) `2570` Tab first. (c) After a good `0900` Tab: End
  `0830` Tab; then End `2570` Tab; then End `1100` Tab.
- **Expected:** (a), (b): nothing saved, one leave, both men still in it, the box heals to 10:00; RECORD the words
  (`2570 is not a time. Try 0900 or 09:00.` for (b); for (a) RECORD — and whether a second note "one man's part was
  not saved" follows). (c): each refusal heals to **his** 10:00 (pinned), the last saves 09:00–11:00 on his own.
- **Disproof:** after (a) Ranger out of the shared leave or a second leave left behind; the box healing to Hex's time.

### S11 — the LATE chip on his held row (phone Board)
- **Setup:** fixture filed after the cut-off so both rows read LATE.
- **Presses:** `0900`, tap End, `1100`, tap Remark; tap the LATE chip on Ranger's row.
- **Expected:** RECORD exactly whose LATE mark hides (the Inputs page still shows both). Promise: nothing of Hex's
  changes by a gesture on Ranger's row.
- **Disproof:** Hex's mark hidden and Ranger's still shown.

### S12 — his part gone by another door while his row is held (two windows, desktop)
- **Presses:** window A: Ranger `0900` Tab, caret left in End. Window B (same sign-in, Inputs page): delete Ranger's
  own leave (second pass: open it and put Hex in Ranger's place). Window A, once B's change has arrived: type `1100`
  Tab, then `Dental` Tab, then click away.
- **Expected:** nothing saved, Hex's leaves untouched (promise; unit-pinned). RECORD whether window A says anything
  and what the boxes show before and after the caret leaves.
- **Disproof:** Hex's leave re-timed or remarked; a leave for Ranger reappearing.

### S13 — the kinds sweep (desktop Board, one pass each)
Course; Attach (with a "To"); Other under Unavailable; a commitment moved to Unavailable; a half day (AM). On the
second man's row: Start, Tab, End, Tab, Remark, Tab, click away. For the AM half: clear Start (all day), then End
`1200` (AM again).
- **Expected:** his own input of the SAME kind, same "To", same documents, same OIL answer; the other man's whole
  (D737's reading "whatever kind lands on the Unavailable list"). Half day: his alone goes all day then reads AM again;
  the grid shows it. Overseas duty with OIL Yes: Ranger's figure follows his new hours, Hex's unchanged, no OIL question
  (D739 reading 4).
- **Disproof:** a kind whose second change lands on the shared input; "To" or documents lost on his copy; an OIL
  question opening; Hex's OIL figure moving.

### S14 — history and the changes jump from the held row (phone, low)
After two saves, keyboard up, tap History and Ranger's row dot; open the changes window and tap his line.
RECORD what the bubble tells and where the tap lands. Disproof: Hex's row lit as "changed", or "That input is not
shown on this day" for a row on screen.

## 3. Explicit negatives — checked, no fault expected

- **The original fault** (Start, End, Remark by Tab on the Board; the same on the week): `setInpField`, the Board's
  and the week's handlers all resolve through `rowInputOf`; unit- and DOM-pinned. Still walked once as S9's spine.
- **Escape, the day arrows with the caret in an untouched box, Shift+Tab onto a stale box:** each reads his own input
  now; pinned (M2–M4, S04).
- **A name DRAGGED onto his held puck:** `reassignInput` follows him; pinned (M5). Only the tap-arm is open (S7).
- **A stale pointer misdirecting a save:** the map is only followed while he is NOT in the input addressed and stops
  at a record that no longer holds him; Undo puts him back in the shared leave and that wins. No route found by which
  a repainted row (it carries its own address) uses the map.
- **Hex's own row after Ranger's cut:** it addresses the shared leave, which still holds Hex — changed in place for a
  2-man leave, cut for a 3-man one. Correct by the same rule.
- **A save giving his leave a new id** (which would orphan the pointer): `commitInputEdit` keeps the id on a row-side
  save; none found.
- **The drag window's words over several days** (`SelectSheet.keepWords`): one man only; after its first save the later
  days either skip the shared id as seen or find his own leave already carrying the words.
- **A member on another man's cell; a member on the Board or Edit Schedule:** no door — boxes are schedulers' only
  (`canEditSched`), the war's words row is own-or-admin.
- **OIL Earn mode:** the row's boxes are disabled there; no typed save to follow.
- **Personal Inputs lines and Ground Programme rows of a shared input:** one row for everyone by design (D661, D739);
  `saveFromRow` leaves them whole — out of this change.
- **Data already stored** (leaves the fault mis-saved before the fix): not reported, per the brief.
