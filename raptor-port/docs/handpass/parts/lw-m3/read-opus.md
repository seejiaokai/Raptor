# M3 — the fresh, blind Opus code read (D790, D903)

Reader: Opus 5.5, fresh chat, did not write the code. Read: `git diff 312c3df68..HEAD -- raptor-port/src` on
`claude/lw-m3-placing-leave` (head e8f585f0c), against the build spec `2026-10-24-lw-m3-build-spec.md`, the evidence sheet
`2026-10-24-lw-m3.md` and the three walkers' reports. Read-only; no file changed but this one. Unit files run to check
claims: `reqwords`, `placeapproved`, `whatif`, `memberclash`, `opendates-store` (all green, 63 tests).

Severity key: **H** would harm a person's leave, records or permissions · **V** visible fault · **T** tidiness.
Nothing below lives only in stored demo data (D56).

## Findings

### 1 (V) A range's or a drag's day line can say "No manning row turns amber or red" while another day of it turns a row red
- **Steps:** member (or admin), one-day window → Pick a range Mon–Fri. On Tue more pilots are already away, so the
  bid's Available P after is lowest on Tue (say 17) but nothing turns there; on Thu two IPs are already away, so the bid
  turns the IP row red on Thu (or Thu's Required is higher and Available P goes red there at a higher figure).
- **What he meets:** the line names Tue, "Available P 18 → 17", and the calm line "No manning row turns amber or red".
  He places it; the bubble then says "This bid turns IP red". D1144: "where none would, the line says so" — the line
  says none would when one does. Same in the drag-selection window (worst person-day across people).
- **Cause:** `leavewar/engine/whatif.ts worstWhatIf` ranks days by the lowest `avail.after` first and uses the number of
  turned rows only as a tie-break; `ui/DayLine.tsx` then draws that one day and its calm-line test
  (`!w.turned.length && !w.avail?.level`) reads only it. (`state/whatif.test.ts` "the lowest Available figure after it"
  pins the spec's §7 point 1 reading, which is where the gap comes from.)
- **Fix:** rank by severity first — `sev(d) = max(avail.level red 2 / amber 1 / none 0, max of turned levels)` — then
  `turned.length` (more first), then lowest `avail.after`, then the earliest date. A test: a two-day range where day 1
  has the lower Available after and nothing turns, day 2 turns a Manning row red → the line names day 2 and is not calm.

### 2 (V) "Approve what I enter" on a day that already holds the same pending bid approves it but says the day was not written
- **Steps:** admin taps Ranger's day holding his pending LL; the tick is on (default); he taps LL (the quick way to
  approve). Or: a ticked range or drag over a member's run of pending LL, LL tapped.
- **What he meets:** the bid IS approved (an Input with `lw`), but the window stays open reading "1 day not written:
  already holding leave or a medical." (the range/drag: "N days not written…" for every day that was in fact approved).
  The window's typed remark / picked document is not put on those bids either.
- **Cause:** `leavewar/state/store.ts placeApproved` runs `writeMany`, whose `setCell` returns false for a re-typed
  same code (`replaced.length === 1 && replaced[0].code === clean` — "re-typing the same bid keeps whatever decision it
  carries"), so `writeMany` counts it `skipped`; `placeApproved` then approves every pending request of that code on the
  cells (not only the ones the write made — the spec's 5.5 said "find them by id after the write"), and
  `BidPicker.write` / `SelectSheet.fill` print the skip note from `r.skipped`.
- **Fix:** in `placeApproved`, before `writeMany`, note the cells already holding a live pending request of exactly
  `clean` on that portion; after it, take those out of `skipped` (count them as written, or return them as `already`),
  so the window closes when nothing else was refused. If the window carries words, write them onto those requests first
  (`setRequestWords` inside the same gesture) or leave them — but say which. A test: pending LL held, ticked LL → one
  Input, `skipped === 0`, the window closes.

### 3 (V, a stored field) Adding a document later makes an on-time input read LATE
- **Steps:** member files LL for 20 Nov on 1 Oct (on time). On 15 Nov — after the cut-off — he attaches the approval
  screenshot: Inputs page → his leave → Document → Save (or, for a war-approved leave, the war's Remarks window →
  Document → Save). D1150 and the new leave ask ("…or file it and attach it later") invite exactly this.
- **What he meets:** the leave now wears LATE on the Inputs page and on the schedule's Unavailable list, as if he had
  changed it after the cut-off; the scheduler reads it as a late input.
- **Cause:** `ui/inputedit.tsx commitInputEdit` — `if (!sched) r.mod = nowStamp()` runs for every save, documents-only
  included (`setLeaveRemarks` → `commitInputEdit` with no `opts`, so `sched` is false); `engine/inputs.ts isLateInput`
  measures `mod`. Before M3 a document could be added only to a medical, and medical is exempt from the late mark, so
  this is new with "every input can carry documents".
- **Fix:** in `commitInputEdit`, work out `docsOnly` — the draft equal to `draftOf(r)` in every field but `docIds` —
  and skip the `mod` bump then (keep `stampChanged`, who changed it). Pin it: an on-time LL, `mod` before the cut-off,
  a documents-only save after it → `isLateInput` stays false. (If he should rule that attaching IS an amendment, this
  becomes a question for him; D1150's words read as "no".)

### 4 (H, low) A re-typed bid loses its documents when it replaces two halves, or when the window hands its own words
- **Steps (a):** member has a pending morning LL with a document and a pending afternoon LL with a document on one day;
  he taps the day (two requests → no held bid, so the window's rows are an empty draft), Whole day, LL.
  **(b):** admin picks a range over a member's pending run that carries a document, types a remark in the window, taps OL.
- **What he meets:** (a) the new whole-day bid carries no document; (b) the re-typed days carry the window's remark and
  no document. The files stay in the drawer but no record lists them — the B9 risk, and 5.11's "a new code never loses
  a paper".
- **Cause:** `store.ts setCell`: `carry = words ? requestWords(words) : replaced.length === 1 ? requestWords(replaced[0]) : {}`
  — two replaced requests carry nothing; given words replace the replaced request's words whole.
- **Fix:** build `carry` from both: `docIds` = the union of `words?.docIds` and every replaced request's `docIds`
  (capped as the record is); `remarks` / `till` = the window's where it gave them, else the replaced requests' where they
  agree. Test both cases in `reqwords.test.ts`.

### 5 (V, low) Words typed on a held bid are lost when the window closes before the box is left
- **Steps:** on a day holding his pending bid (one-day window or the closed-day window), he types a remark and presses
  Escape. On his iPhone, also check ✕ and a tap outside with the keyboard still up — iOS Safari does not always blur an
  input when a non-focusable element is tapped.
- **What he meets:** the remark is not saved, though a document picked a moment before in the same window was saved at
  once — the window reads as "saves as you go" for one row and not the other.
- **Cause:** `ui/ReqWords.tsx` commits typed words only on blur or Enter; `BidPicker` / `ClosedNoteSheet` keep them in
  `heldEdit` / `edit` and unmount on close without a flush (React fires no blur on unmount).
- **Fix:** flush on close: in `BidPicker`, wrap `onClose` so a pending `heldEdit` is committed (`patchOf` →
  `setRequestWords`) before closing — Escape included, or decide Escape means cancel and say so; the same in
  `ClosedNoteSheet` for each `edit[r.id]`. The walk's phone step should type then tap ✕ directly.

### 6 (V, low) The day's list offers Document on a member's refused bid on a closed day, and the save is refused silently
- **Steps:** member; a day closed for him holding his refused morning bid and his pending afternoon bid → the tap opens
  the day's list; on the refused line, Document → pick a file.
- **What he meets:** nothing — the chip does not appear and no message says why (the commit refuses "a war day not
  open for bidding"; `gesture` returns the inner `true`, so `act` shows no "Couldn't change that" either). The file is
  stored in the drawer, listed nowhere.
- **Cause:** `leavewar/ui/DayList.tsx` draws the `DocField` wherever `canEditRow`; `state/perms.ts onlyChangesWords`
  lets a closed-day change through only on a pending bid (rightly).
- **Fix:** draw it only where the save can land: `canEditRow && (role === 'admin' || editable || c.state !== 'refused')`
  (`editable` = `canBidOn`, already in scope). Separately (T): `setRequestWords` returns `gesture(...)`'s inner value,
  which is `true` even when the commit refused — return `false` on a refusal so callers can say so.

### 7 (H, low) A bid replaced by a clashing Inputs-page leave or medical drops its documents and remarks from every record
- **Steps:** member's pending LL on 10 Feb carries his approval screenshot; the day closes; he files LL for 10 Feb on
  the Inputs page (D1166 — the way he changes leave on closed days).
- **What he meets:** the bid becomes a replaced-bid notice; the new Input has no document (the leave ask comes up, and
  he must find and attach the file again); the screenshot is in the drawer but no record lists it.
- **Cause:** `leavewar/inputgate.ts replaceClashingBids` writes a `NoticeRec` (code, was, by…) and carries neither the
  bid's `docIds` nor its `remarks`.
- **Fix (the agent's call):** where the replacing input is the same man's leave, union the replaced bid's `docIds` into
  that input inside the same command (`docFields`); at the least keep `docIds` on the notice so they are not orphaned.

### 8 (T) The 20-document cap on a request is silent, and the Inputs page has none
- `MAX_REQ_DOCS` (20) is applied in `setRequestWords`, `doorDecideApproved` (`rowDocIds(row).slice(0, 20)`) and the
  reader; `DocField` and the Inputs page take any number. A 21st file picked on a bid disappears without a word; an
  approved leave holding 21+ files put back to a bid keeps 20, and re-approving the whole leave loses the rest from the
  records. Fix: one cap for both (or none on the writers, the reader's cap kept higher as a junk guard), and the
  window says it when a file is refused.

## Read and found sound
- **`onlyChangesWords` (perms.ts):** only the same records, same order, each pending/acknowledged request equal but for
  `remarks`/`till`/`docIds`; a code, state, record added or taken, a notice, a refused bid, another man's row (checked
  first) all refuse; an Undo/Redo of a words-only step is words-only, and a Redo that puts a bid back still meets
  D1263's check (`opendates-store` green). No way found to pass anything else through it.
- **`setRequestWords`:** gated by `canEditRow`; the run is the same person, consecutive days, same code, state and
  words — never another request kind, another man, or a neighbour with other words; one gesture.
- **`doorApprove` / `doorDecideApproved`:** run key with remarks, till and documents; the documents' union on an
  extension (before, after, bridge); the till kept only against the leave's default; the put-back carries remarks, till
  and documents to each day; moves (`moveRecords`, `doorMoveApproved`) carry them; `carried.remarks` read into
  `remarks` for an older shape. No double-counting (Sets).
- **`placeApproved`:** one gesture, `canDecide` gate, admin-only command op, one Undo; a day the door refuses keeps its
  bid (but see 2).
- **Inputs documents:** `commitNewInput` / `commitInputEdit` keep documents for every kind; a draft without a list leaves
  the record's; a medical's list never empties; `docGate` asks a new leave or one retyped into leave, never an edit of a
  saved leave; `lw` is kept on a documents-only edit (`leaveKey` reads no document).
- **The grid's memo:** `sameMonth` / `sameDays` — everything `PersonMonth` draws comes in its props (checked
  `cellOpenable`, `raptorOwns`, `shiftedFrom`, `stateOf` — all prop-read); `evKind` re-keyed on period + event types,
  `drawnDays`/`monthDaysCache` on the period, `lockedCols` on period + role + today (D1266). An event, a band, open
  dates, a role switch, a new day, a roster change and an Undo each replace one of the compared props. Nothing found
  that should repaint a month and now would not.
- **The day panel:** no remark anywhere (LeaveLine draws puck, box, dates, days, state); figures from the period holding
  the date (`dayFacts`, `warHolding`; the requirements are squadron-wide); its open state is a listener set, not the store.
- **The Inputs page:** `typeMatches` used by all three readers (list, month, opened day); "No document" only on leave and
  medical (SANS availability excluded), on the desktop list and the cards alike.
- **Folded items:** the deferred "This replaces" note; `enteredDay` (local date); the Move refusal's 'closed' reason; the
  shared-duty-over-a-bid case cannot arise (only leave or medical replaces a bid; D655) — sound.

**Roll-call absences:** none found beyond the sheet's own named NOs/MISSING; row 6 ("each bid line: Document YES")
should read "own pending or admin — not a member's refused bid on a closed day" once 6 is fixed.
