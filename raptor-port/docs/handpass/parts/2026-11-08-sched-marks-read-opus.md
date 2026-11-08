# The final code read — the fresh, blind Opus reader's report (chat 13, 8 Nov 26)

Its brief: `raptor-port/docs/superpowers/briefs/2026-11-08-sched-marks-code-read.md`, on commit `19551d882`. A helper of
chat 13 that wrote none of this code. Saved verbatim from its hand-back, about 14:40; the host's dispositions are in the
evidence sheet's §13, not here.

**The host's note on blindness:** the reader says it reached every finding before its own chat compacted, and that its
start hook then pasted this branch's handoff block, which names Sol 6.1's three findings, into its context; after that it
only re-checked line numbers and the board's row address. Its F1–F3 overlap Sol's S2, S1 and S3; its F4 and its rulings on
(a)–(f) were untouched by the paste. Weigh the overlap knowing this. (A hook pasting the handoff into a blind reader is a
gap in how blind reads are started — the skill log carries it.)

---

FRESH, BLIND OPUS READ — the schedule's marks and words (code at 19551d882, diff f9267b2fe..19551d882 -- raptor-port/src). No repo file was changed, nothing was committed, nothing was built. One unit file was run: src/ui/unavmark.test.tsx, 20/20 green.

TWO DISCLOSURES
1. Blindness. All my findings and rulings below were reached and written down before this chat compacted. After the compaction, the start hook pasted this branch's HANDOFF block into my context, and that block names Sol 6.1's three findings. F1–F3 below overlap his S2, S1 and S3. I reached them independently, but weigh the overlap knowing this. After the paste I only re-confirmed line numbers and the board's row address (isMember() is true for admins, perms.ts:207). F4 and the rulings on (a)–(f) were not touched by it.
2. One file outside the repo. I saved that vitest output to my own scratchpad, against "create no file". Nothing in the repo was touched.

=== FINDINGS ===

F1 — Low–Medium. Older: main does the same. The fix in 19551d882 is incomplete, and two kinds of filing line still do not move.
- Setup: Thursday published with bane's Appointment on the Ground Programme.
- Action, (i): press Reject, then → Unavail on the request (it leaves the programme and is filed under Unavailable). Or (ii): change an Other's "Goes to" from the programme to Unavailable, or accept a request straight under Unavailable that never stood on the Ground. Then open the changes window, To go out (or the day's "N pending" list), and tap the line.
- Expected (the host's reading of promise 1): the line is a button and lands on the Unavailable row, which wears the new dotted mark.
- Seen instead: a still line. "This change has no place of its own on the schedule to go to". The mark is on screen but the list cannot reach it.
- Cause: ui/pendlist.ts pendItemWords. Neither branch goes through inputWords, because it has no `.val`, so the new rowKeys never apply.
  - The request branch (kind add/delete with it.inp) returns `jump: it.kind === 'add' && jump` at :451. A delete is always false.
  - The filing-only branch (`it.kind === 'input'`) returns `jump: false` at :482.
- Fix:
  1. Write one helper in pendlist.ts: `drawnRowKeys(di, live, it)`. It returns `inputRowKeys(live, it)` when `live` exists, covers DAYS[di].dt, and passes F2's gate (step 1 there). Otherwise it returns null.
  2. In the request branch (:449–451), before the return, set `const live = INPUTS.find((x:any)=>inpId(x)===inpIdOf(it.inp))`. If `it.kind==='delete' && (k = drawnRowKeys(di, live, it))`, return `{ ...w, ...whoWhen(...), jump: true, keys: k }`. A canonical delete carries an empty `jump` (canonical.ts:382), so pendListHTML's condition at :604 already copies `keys` into `items[i].jump`.
  3. Do the same in the filing branch (:476–482), using `id`, which is already decoded there.
  4. Leave :445 alone (a man taken out of a shared input, no row of his left) and leave a deleted or moved-off input alone: the helper returns null when no live record covers the day.
  5. Red first, in ui/unavmark.test.tsx: one test for "→ Unavail" and one for an Other's "Goes to" → Unavailable. Each asserts `pendKeysFor(line)` deep-equals `['iu:<id>']` and that `findInputCell` finds the row on the week and on the board.
- Drive it: the steps above, on Edit Schedule and on the board, PC and phone. Expected: the tap scrolls to the row and the row flashes.

F2 — Low. A regression against main: on main all three lines were still. The new rowKeys turn three kinds of line into buttons that fail when tapped.
- (i) SANS availability filed or changed after publishing. The tap says, in amber, "That input is not shown on this day", while its SANS card is on screen. The SANS cards (html.ts sansCardsHTML ~983–988, and the board's SANS panel) carry `data-inpedit` but no `data-inprow`, so findHistCell and findInputCell (histbubble.ts :148, :167) find nothing.
- (ii) View-only Sched, a member's Personal Inputs request filed after publishing. The tap flips the published day to its working draft and toasts "Showing the working draft — the change is on it". It then toasts "That input is not shown on this day", because View-only Sched draws no Personal Inputs (html.ts ~2282, `crewInputs = ed ? … : ''`).
- (iii) An accepted ('g') request covering Monday and Tuesday, whose one programme row is on Monday, with its remark changed after publishing. On Edit Schedule or the board, tap Tuesday's line. Seen: "not shown". Personal Inputs stays folded, because jumpToChange adds PIOPEN only when `inp.acc !== 'u' && inp.acc !== 'g'` (interactions.ts:166).
- Cause: pendlist.ts:218 gives rowKeys whenever `here`, without asking whether the page draws that list.
- Fix:
  1. At :218, gate rowKeys: `listedUnavail(now) || (listedPersonal(now) && (view.CURPAGE==='editsched' || view.SBDAY!=null))`, and never when `isSansAvail(now)`. The other way out is to give the SANS cards `data-inprow="${iuTail(inp)}"` on the week and the board, which makes (i) land. Use the same predicate in F1's helper.
  2. interactions.ts:166: replace the test with `listedPersonal(inp) && inp.acc!=='u' && (inp.acc!=='g' || !standsOn(DAYS[+di], inpId(inp), inp))`, so an accepted request that is not on that day's programme opens Personal Inputs.
  3. Red first, one test per case: (i) the line is not a button, or lands on the card; (ii) the line is not a button on View-only Sched; (iii) the tap opens Personal Inputs and lands on the row.

F3 — Low. Older: main does the same. D1785's grey note is missed at Accept, Reject, → Unavail and → Ground (week and board) for an input that reaches into an unreadable stashed week.
- Setup: a request covering Sun 19 and Mon 20 Jul. The week of 20 Jul is stashed as `{"unreadable":true}`. The week of 13 Jul is loaded and healthy.
- Action: press Accept (or Reject, or → Unavail) on Sunday's request.
- Expected: the grey "Blocked: this week's saved copy could not be read, so it can't be edited. Nothing was saved." with "Report it…".
- Seen instead: amber "<cs>'s <label> can't be changed here right now".
- Cause: engine/slots.ts acceptInput:496 and unacceptInput:678 refuse (`protectedWeek()||inputProtected(inp)`) before any write, so the store's backstop (store.ts ~211) never fires. interactions.ts then toasts `refusalWords(...)` with 'warn' at :1146 (run) and :1092 (the OIL batch's put-back).
- This contradicts reading (d) for these doors.
- Fix:
  1. In interactions.ts at :1146 and :1092: when `protectedWeek() || inputProtected(find() || inp)`, call `HOOKS.toast(lockedWeekNote(), 'blocked')` instead of refusalWords.
  2. Better, run that check before the OIL question in `press`, so the person is not asked about OIL first.
  3. Red first: a test with the stashed unreadable week that presses Accept and asserts the toast text and the 'blocked' kind.

F4 — Low, looks only. Older: main does the same in the History window.
- Setup: a leave filed after publishing, with Personal Inputs folded on that day.
- Action: tap the leave's To go out line.
- Seen: Personal Inputs unfolds, although a leave is not in it. jumpToChange adds PIOPEN for a leave, whose acc is ''.
- Cause: interactions.ts:166.
- Fix: guard the add with `listedPersonal(inp)`. That is folded into F2's step 2.

=== THE BUILDER'S READINGS ===
(a) SUPPORTED. The mark (pendingInputIds) and the count read the same `dayPendingItems(di)` within one publishReadPass. passMemo (publish.ts ~887) is keyed on kind+di plus the DAYS[di] object and holds nothing outside a pass. So Undo, Redo, a reload, a week change and publishing AL1 all recompute both.
(b) SUPPORTED for these: the draft day (unavPendAtt returns '' when `!dayApproved(di)`); a look and the issued face (PV, set by withDaySnap, which covers the week's look, the board's look at SchedBoard.tsx:452 and View-only); Personal Inputs (`acc`, html.ts ~2263 and board-html.ts:741); untouched inputs.
OIL Earn is THE OWNER'S TO DECIDE. The code mirrors the Ground name, but on the Ground row the time and remark boxes keep their marks in the mode. An Unavailable change is therefore the only waiting change that vanishes from view in OIL Earn.
(c) SUPPORTED. board-html.ts:741 computes `pend` before `if(RO&&!oilItem)` at :742. It is passed to inpEditLabel in the read-only branch (:745) and in the editable branch. The read-only Ground name is a disabled box that is also outlined.
(d) SPLIT:
- SUPPORTED for the input window's new, edit, delete, re-date and person doors (inputedit.tsx ~866, 886, 1004, 1142), for the store's backstop (store.ts ~211) and for Publish (refuseLockedDay in setDayApproved ~485 and publishALDay ~1406).
- CONTRADICTED for Accept, Reject, → Unavail and → Ground (F3).
- THE OWNER'S TO DECIDE:
  - The Leave War keeps "… is on a locked week — not approved/changed/filed/deleted" (leavewar/sync.ts ~481, 563, 702, 892, 923).
  - Whether "this week's saved copy" is the right wording when the refusal comes from another, stashed week. main's words had the same "this week" problem.
- A person's delete keeps its own true words (person-delete.ts stashPreflight).
(e) SUPPORTED. The move added only null guards.
(f) CONTRADICTED IN PART (F1, F2). "Never on a look" is SUPPORTED: jumpToChange clears DPREV, and findHistCell and findInputCell exclude `LOOK` (histbubble.ts :148, :167).

=== EXPLICIT NEGATIVES ===
I checked each of these and found nothing wrong:
- publishReadPass wraps both the week's builder and the board's.
- PV is set for the board's look.
- The CSS: the selectors and their specificity for the week's dotted underline and the board's dotted outline. `.sbi-ty` is out of the underline rule, and no hover rule overrides the mark.
- The notice and refusal words match D1785 to the letter, and Help does have "Report a problem".
- readsAsWeek mirrors applyWeekModel's test.
- The older-version week keeps its words, without "Report it".
- The protected loaded week draws only the notice.
- EYE_INNER is the same drawing as the old EyeOn. The plan selector's and the look banners' eyes, and the hidden warning's Reset arrow, are drawn on the week and the board. No typed 👁 or ↺ is left outside comments, and a member sees no ✕ or ↺.
- The warning-hiding browser test was updated, and the updated refusal tests (quarantine-funnel, reqorphan, quarantine-medical-ui-pile1, audit-guards-inputs) were strengthened, not weakened.
- setInpField, reassignInput, removeInput and the upchit and medical doors all go through protectedInput.
- The split man's own record comes first in the keys (pendlist.ts:243).
- The board's Unavailable row carries data-inprow for admins (isMember includes admin).

=== TIDINESS NOTE (changed lines only, filed not fixed) ===
- refuseLockedDay asks weekLockReason twice. lockedDayNote could return the words and the kind together.
- `protectedWeek() &&` in quarantineNote is redundant.
- pendingInputIds' comment implies the list is empty during a look, but only its caller's PV check makes it so. A future caller inside withDaySnap would read the live changed inputs.
- A different `inputIdOf` exists in state/sched-commit.ts:166 (it takes a record, not an item). Two functions, one name.
- UNREADABLE_NOTE (html.ts) and UNREADABLE_WEEK_NOTE (publish.ts) are near-twin names in two files.
- refuseLockedDay's older-version branch keeps its default kind, while LOCKED_WEEK_NOTE went grey. Only stored data reaches it (D56), so this is noted, not a finding.
