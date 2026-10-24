# The night of 25 Oct 26 — the fresh, blind Opus read of the finished code

Reader: Opus 5.5, fresh and blind (wrote none of it). Read-only. Change read: `git diff 140dd5cf3..HEAD -- raptor-port/src`
on `claude/lw-m3-placing-leave` (head 851971073). Read first: the evidence sheet `../../2026-10-25-lw-night.md`, the full
rows of D1344, D1345, D1351, D1339, D1341, D1354, D1277, D1227, D1274, D1338, D1346, D1347, D418, D1177, and the Leave War
area file's §Architecture. D56 applied: nothing below lives only in stored data.

Note on the diff's size: `store.ts` shows 420 changed lines, but with `--ignore-cr-at-eol` it is 42 — the rest is three
blocks (`setRequestWords`, `placeApproved` … `removeUna`, `bidWhatIf`) whose CRLF line ends became LF. No behaviour in them
changed; it only makes the diff look larger than it is.

## Findings

### R1 — medium — Approve or Refuse in the drag window with words typed is two or more Undo steps, and one Undo leaves the days' own remarks overwritten
**Steps.** Admin. Ranger holds pending LL bids on 10–11 Feb, the first with the remark "Wedding". Drag the two days, type
"Exercise" in the Remarks box, press Approve. Press Undo once.
**Wrong result.** The approval is taken back — both bids pending again — but both now read "Exercise": "Wedding" is gone.
A second Undo is needed to bring "Wedding" back. Where the drag also covers a leave the war already approved, each such
leave adds one more step (its Inputs-page remark). One press, N + 2 Undo steps; an admin who undoes once believes the
press is gone while the member's own words stay replaced.
**Cause.** `ui/SelectSheet.tsx` `decide` (line 282) calls `keepWords()` (line 285) and then `setBidStates` as separate
top-level calls: `setRemarksOn` is its own command (`state/store.ts` 3071, `gesture('lw.reqmeta')`), each
`setLeaveRemarks` in `keepWords` its own Inputs command, and `setBidStates` its own (`gesture('lw.decide')`, store.ts 3461).
The house rule beside them — "ONE command, ONE Undo" (`placeApproved`, `setBidStates`) — is broken for this press.
(The filed `[LW-NIGHT1025-OLDER]` (e) covers the closed-day window's blur-then-Delete only, not this.)
**Fix.** Run the words and the decision in one command: a store entry, e.g. `decideWithWords(cells, bid, remarks)`, whose
body is `gesture('lw.decide', () => { setRemarksOn(cells, t); <the war-approved leaves' setLeaveRemarks>; return
setBidStates(cells, bid) })` — the nested gestures already run inline (`gesture`: `if (cmdIsCommitting()) return fn()`),
and the Inputs writes join the war's command as the absence door's approve already does. `SelectSheet.decide` calls it
in place of `keepWords(); setBidStates(...)`. Pin it: type, Approve, one Undo → both bids pending with "Wedding" and none.
(One consequence to accept or guard: a decision refused whole would now roll the words back with it.)

### R2 — medium — a document added, or the till tick turned, in the drag window over days that already hold entries is silently dropped
**Steps.** Admin, one man's drag over his pending bids (or his war-approved leave). Press Document, add `approval.pdf`
(optionally untick "till …"), then press Approve, Refuse, Move or ✕.
**Wrong result.** The file and the tick go nowhere: the bids, the filed leave and the Inputs page carry neither. With the
Remarks box left empty nothing at all is kept. The window draws the Document button and the tick in the same one row as
the Remarks box (D1354's row), so the person has every reason to think the file went with the press — the same fault
D1339 fixed for the words ("never dropped"); D1150 makes a document the leave's proof of approval.
**Cause.** `ui/SelectSheet.tsx` `keepWords` (259–276) reads `words.remarks` only and returns when it is blank (262); it
never reads `words.docIds` or `words.till`. `store.ts setRemarksOn` (3071) takes a remark only.
**Fix.** Keep the whole draft: `setRemarksOn(cells, patch)` taking `{ remarks?, till?, docIds? }` — remarks replace (D1341),
documents ADD to each bid's own (as `placeApproved`'s held path already does: `[...new Set([...(r.docIds ?? []),
...words.docIds])]`, and `setCell`'s "a new code never loses a paper"), the till only where the draft holds an explicit
choice; and `setLeaveRemarks(row, t || remarksTyped(row.remarks,row), pid, union(rowDocIds(row), words.docIds), words.till)`
for each war-approved leave. Return early only when the draft holds nothing at all.

### R3 — low — a member's drag that reaches one of his refused bids on a closed day loses the typed words on every day, silently
**Steps.** Member (Ranger). His own row holds a pending LL on an open day and a refused OL on a day since closed (or a
refused run reaching into closed days). Drag both days, type "Back Monday", press ✕ (or Move).
**Wrong result.** Nothing is saved — not even on the open day's pending bid. No message.
**Cause.** `store.ts setRemarksOn` (3071–3084) writes every dragged day in ONE command (the inner `setRequestWords` runs
inline, and writes its bid's whole run, days outside the drag included). The commit lets a member change words on a
closed day only for a pending or acknowledged bid (`state/perms.ts onlyChangesWords`, 693–707; the closed-day check at
865), so the one refused bid refuses the whole command. `keepWords` ignores the result.
**Fix.** In `setRemarksOn`, for anyone but an admin skip a request whose state is neither pending nor acknowledged when
any day of its run is not open for him (`!dayWritable(d)`) — the commit's own rule, asked first — so the rest is written.

### R4 — low — a new drag while the drag window is up drops the words typed in it
**Steps.** One man's drag over days holding bids, type "Exercise", then drag a different block on the grid (D642: the
window stays and takes the new block).
**Wrong result.** The first block's bids never get "Exercise"; the box is empty again.
**Cause.** Matrix keys the window by its selection (`ui/Matrix.tsx` 4300) and `onSelect` (3603) simply `setSel(s)`: the old
window unmounts without `closeKeeping`. ✕, Escape and a tap on a day keep the words (gap 7); this way out does not.
**Fix.** Let the window hand Matrix its `keepWords` through a ref (the `FlushRef` pattern `ReqWords.tsx useFlush` already
uses) and call it in `onSelect` before `setSel(s)` when a selection is already up. Not on the other resets (period change,
Undo — `Matrix.tsx` 661), where writing would be wrong.

### R5 — low — a key pressed inside a window drawn over the page still ends the bubble
**Steps.** Desktop, the Manning button in view. File an overseas duty on a weekend from the bid window: the OIL question
opens over the page and the bubble waits under the Manning button (F1's fix). Answer the question with the keyboard
(Enter or Space on its button), or close it with Escape.
**Wrong result.** The bubble is gone before it is seen — the roll-call's "a window over the page neither moves it to the
foot nor ends it" holds for a tap only.
**Cause.** `ui/Matrix.tsx` 1567: `onKey` exempts Tab, Shift and the note itself, but not a key whose target is inside
`.airpop` / `[role="dialog"]`; `onDown` (1564) got `overPage`, `onKey` did not.
**Fix.** `if (e.key === 'Tab' || e.key === 'Shift' || inNote(e) || overPage(e.target)) return`.

### R6 — low — the "Show ›" guard swallows every click in the whole page for 450 ms, keyboard clicks included
**Steps.** Tab to "Show ›", press Enter: focus moves to the Manning button. Press Enter again at once (under 450 ms) to
fold or open the rows — or click the top bar's Undo, a tab, a pop-up, at once.
**Wrong result.** Nothing happens; the press is eaten.
**Cause.** `ui/Matrix.tsx` 1533–1534: a capture-phase `click` listener on `document` that stops and cancels every click,
wherever it lands and however it was made. F2's case is a second TOUCH landing on the grid where the note stood.
**Fix.** Swallow only what F2 is about: `if (e instanceof MouseEvent && e.detail > 0 && wrapRef.current?.contains(e.target
as Node)) { stop }` — a pointer click on the grid; let keyboard clicks (`detail === 0`) and clicks elsewhere through.

## Read and found sound

**The count — no placing path that does not count, no count that raises without a worsening.**
- Every war gesture that can lower a Manning or Available row is in `PLACING`: a bid (`setCell`'s write, which runs outside
  a gesture and so counts itself — `actSeq++` just before its `putList`; `setCells` / `setCellRange` through `writeMany`'s
  `lw.edit`), `lw.placeApproved`, `lw.file` (CSE · OD, from the one-day, drag and closed-day windows), `lw.una`,
  `lw.decide` (a refused bid approved again — `setBidStates`, `decideRequestById`, `changeAbsenceById`), `lw.move`
  (`moveRecords`, the one landing — `commitMove` takes its "before" first). Approving a pending bid changes no count
  (D998: a bid not refused already lowers). `lw.ack` is a bell notice; `lw.award`, `lw.ledger`, `lw.availrow`,
  `lw.reqname`, `lw.open`, the event and holiday writes place nothing. A posting out is not counted — the sheet's reading
  of gap 4 (D1345 names bids and filings).
- Words never count: `setRequestWords`, `setRemarksOn` (`lw.reqmeta`) and the Inputs-page `setLeaveRemarks` add nothing,
  so the closed-day window's and the bid window's words saved on closing never turn a filing into "This bid" (gap 1).
- Counts that place nothing (a refused command, a removal, a UNA's remarks) are harmless: `raiseIfWorse` still needs a
  row-day that got worse. The one leftover is the design's own: inside the non-modal drag window a top-bar Undo that
  lowers a row, followed by any placing press, is reported as the press's — rare, and the before/after rule as ruled.
- `filedSince`: `lastFiled` is stamped after the gesture with the final count (nested door writes included); any later
  placing act moves the count past it, so a bid after a UNA reads "This bid" again; refused filings change no row.
- `worsenedRows`: a lower figure is always worse (`evaluate.ts judge`: `have < red`, `have < amber`; the Available rows by
  the same `availVerdict`). The rank (red-turns > red-lower > amber-turns > amber-lower) matches the comment's "red
  outranks amber". A day's figure the war does not hold (`dayFacts` null) is compared by level alone. Available rows of a
  day not drawn at the "before" are still skipped. `bubbleWords`' joins read as drawn.
- The colour: `lv` is red when any named row is red, a "still red" lowering included — D1344. The CSS sits in the same scope
  as `.mn-bubble` / `.mn-foot`, and `.mn-foot.mnb-red` outranks the desktop `@media` block's `.mn-foot`.
- Stale closures: the `[sheetUp]` effect and the move effect call that render's `flaggedNow`; the move machine reads
  `flaggedRef.current`; `useCloseOnCellClick` keeps the latest `closeKeeping` (the latest words) in its ref;
  `unswallowRef` is read at call time and cleaned up with the grid; a second Show cannot arm a second guard (clicks are
  swallowed), and each arm clears the last.
- The swallow does not eat Show's own click: it is added during React's bubble-phase handler, after the document's capture
  phase for that event has passed.
- `overPage` in `manningInView` only matters for a button on screen (the off-screen test runs first); the windows the bid
  bubble is raised behind are unmounted by the time the effect runs.

**The drag window's words.**
- `setRemarksOn` replaces each bid's remark across its whole run (`setRequestWords`) — D1339's "a change there changes it
  for all"; next-door bids given one remark become one run and one leave at Approve — D1346. Refused bids take the words
  too (D1341, "every day dragged").
- Approve files the leave with the words (they are on the bids before `DOOR.approve`); Refuse of a war-approved leave
  carries them back (`sync.ts doorDecideApproved` copies the input's remarks, till and documents onto the request).
- `leaveInputsAt` gives each leave input behind the cell once (a morning and an afternoon both — gap 5); `keepWords`
  writes only `row.lw` leaves (W4) and skips one already holding the words; a split of a shared input (`ownInputOf`, new
  iid) is followed on the next day because the war re-derives inside the command and `seen` holds the old id.
- `setLeaveRemarks` with no `docIds` leaves the documents as they are (`...(docIds ? {...} : {})`), so the words-only save
  from the drag window never strips a leave's papers.
- A fill that wrote everything closes through `onDone` (no second words save); a partial one keeps the window, and its
  later ✕ writes the words onto what the fill skipped — D1341.
- An empty box or a drag of several men changes nothing (262, 260). An empty command makes no Undo step
  (`undo/timeline.ts` 239).

**The one Remarks row.**
- `LeaveWords` re-reading by iid on `usePlanVersion()` (Raptor's version) fixes W1. Checked the case it could break — a
  member's remark on his cell of a leave filed for several, which gives him a NEW input and leaves the old id with the
  others: `absenceSignature` carries the iid, so the war repaints, Matrix recomputes `remarkRow` (`leaveInputAt` → his new
  input) and the row follows it; it does not stay on the others' leave.
- A deleted input falls back to the prop and `commitInputEdit` refuses it with its own toast ("That input is no longer
  there"); a refusal on a locked week toasts too, so the window's missing `onRefused` is not silent.
- Words typed and not saved go on unmount (✕, Escape, a tap behind, a period change); `pending` is cleared by every commit,
  so a document or tick change never replays an old remark. The closed-day window's `compact` row keeps its saves exactly.
- Performance (D991): `usePlanVersion` re-renders only the open window's rows (never a grid cell); `INPUTS.find` per render
  is linear in the inputs; `flaggedNow`'s new `dayFacts` call hits the cache `availVerdictAt` has just filled; nothing new
  runs per frame or per cell.

## Readings for the host, not findings
- Typed words reach bids and war-approved leave only; an overseas duty or course filed from the war, and a UNA, on a
  dragged day keep their own remarks. D1341 says "every day dragged … one remark"; the build reads D1339's subject (a
  leave) as its limit — consistent with W4's reading, but his to confirm if he means every entry.
- The drag window's words are written untrimmed (`words.remarks`), while the one-day window and `LeaveWords` trim. A
  trailing space makes two otherwise equal bids two runs (`reqRunKey`), so two leaves at Approve. Cosmetic today; trimming
  in `setRemarksOn` and `keepWords` would match the rest.
- The closed-day window with a morning and an afternoon bid now draws two identical dark boxes with no label; nothing says
  which box is which bid (D1315 asks for both to be shown — they are). A look item, not a fault.
