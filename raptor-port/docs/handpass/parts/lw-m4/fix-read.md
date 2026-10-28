# M4 fixes — the fresh, blind Opus read of the fixes (28 Oct 26)

Read at da770b233 in the read-only copy `C:/m4f` (`git diff 3ad84df65 da770b233 -- raptor-port/src raptor-port/e2e`, the
nine commits), against the evidence sheet §11 (M1–M13), `read-opus.md`, `fixes-night.md` and the Leave War rulings (D1421,
D1428, D1436 full rows). Nothing built, no browser run. **No unit test was run: the read-only copy has no `node_modules`.**
Every finding below is traced through the functions named.

## Findings

### 1. MEDIUM — M4 is closed only for a quick tap: a press held past 0.8 s still decides another man's line on a phone

**Steps.** Phone (his iPhone), Approvals, "Pick dates…" open (the calendar stands inline above the list). Press and hold
Ranger's Approve for about a second, then lift without moving.
**What he meets.** The calendar closes on the press, the list moves up under the finger, and at the lift the line now under
the finger — another man's — is approved. The same fault as M4, by a slower press. (iOS Safari fires the click after a
still press on a button; Android usually turns a long press into a context press and fires none — so the risk is the
iPhone's.)
**Cause.** `ui/ApprovalsPage.tsx`, the picker's outside-press handler: the click-eater is torn down by
`setTimeout(done, 800)` started at the PRESS, so a lift after 800 ms finds nothing armed and the click acts. The browser
test (`e2e/leavewar.spec.ts`, M4) only taps (`touchscreen.tap`), so it cannot see this.
**Fix.** Do not time the eater from the press. At `pointerdown` keep the pressed element and its box
(`const t0 = e.target as Element, r0 = t0.getBoundingClientRect()`); arm the eater at that press's own `pointerup`, and end
it on `pointercancel`, on the next `pointerdown`, or by a short timer started AT the `pointerup` (about 500 ms — the click
follows the lift at once). Finding 2's narrowing goes in the same eater. Test: on `lw-phone`, touch down on a line's Approve
with the calendar open, wait 1000 ms, touch up (CDP `Input.dispatchTouchEvent`) — no line lit, nothing decided.

### 2. LOW — every first press outside the open calendar is swallowed, also where nothing moved

**Steps.** Approvals, "Pick dates…" open. Press the top bar's Undo (or the bell, or the Grid tab).
**What he meets.** The calendar closes and nothing else happens; a second press is needed. Before the fix that press also
did its job (on a desktop the press on another line's Approve did nothing, because the mouse's click lands on the common
parent when the list moved — walker A's lesson 4).
**Cause.** The eater swallows the one click after the lift whatever it lands on.
**Fix.** In the eater, swallow the click only where it is not on what was pressed or what was pressed moved:
`if (!(t0 === c.target || t0.contains(c.target as Node)) || moved(t0, r0)) { c.preventDefault(); c.stopPropagation() }`,
`moved` comparing `getBoundingClientRect()` top/left with `r0` (≥ 1px). The list moving under a finger then is still eaten
(the M4 case: the pressed Approve moved); a press on the top bar, which did not move, acts. A unit or browser test for each.

### 3. LOW-MEDIUM — M3 has a three-tap twin: Approve, Refuse, Approve, then two Undos — "Already approved by Saber", both buttons off, while the first approval stands

**Steps.** Approvals: on Ranger's line tap Approve (lit "Approved"), Refuse (D1428 — lit "Refused"), Approve again. Undo,
Undo.
**What he meets.** After the first Undo the line is lit "Refused" (right). After the second the record holds the FIRST
approval again, but the line is greyed "Already approved by Saber" with its buttons off — the walker A F2 picture of M3.
**Cause.** `ui/ApprovalsPage.tsx apply`: `row.forms = [{ lit: to, parts: o.parts }, ...(row.forms ?? []).filter(f => f.lit
!== to)]` keeps one form per light, so the third tap drops the first approval's form. Each approval mints a new Input id
(`engine/inputs.ts inpId` → `newId('i')`), so the kept approved form names the third tap's Input, gone after the second
Undo; the refused form's request is gone too; no form stands, and the row falls to the stale branch.
**Fix.** Keep every form, newest first: `if (to !== 'pending') row.forms = [{ lit: to, parts: o.parts }, ...(row.forms ??
[])]`. The `find` already takes the newest that still stands, and an older form stands only where the record holds exactly
its ids in its state. Test in `m4page.test.tsx`: Approve → Refuse → Approve → Undo → Undo lights "Approved"; Redo → Redo
lights "Refused" then "Approved".

### 4. LOW — M5's twin: "Approve what I enter" (an admin's default in both bid windows) still gives a guessed reason

**Steps.** Blade posts out on 15 Jan (still to come, not SANS). Admin, "Approve what I enter" on (D1186, its default),
opens the bid window on Blade's 2 Feb and places LL (or drags over days of his after 15 Jan in the drag window).
**What he meets.** The bid is placed but left pending, and the window says "kept pending — not approved (a locked week, or
leave or a medical already there)" — none of which is true; Approvals and, since the fix, the bid window's own Approve say
"He posts out on 15 Jan: refuse or delete it". The same for any day of a man whose posting has run (finding's rule now in
every door).
**Cause.** `state/store.ts placeApproved` calls `DOOR.approve(toApprove)` and drops its `why`; `BidPicker.tsx` (the
`code && approving` branch) and `SelectSheet.tsx` (the same branch) print the fixed parenthetical.
**Fix.** `placeApproved` returns `why: [...new Set(r.why)]` beside `pending`; both windows print it in place of the
parenthetical where it is not empty (`… kept pending — ${why.join(' ')}`), keeping today's words only where `why` is empty.
Test beside "M5 the day's window gives Approvals' posting-out reason": the same through `placeApproved`.

### 5. LOW — the drag window's new note can name the rules' reason for days skipped for another reason

**Steps.** Admin drags over three of Ranger's days (one holding his pending bid after his posting date, one holding a bid
that approves, one empty) and presses Approve.
**What he meets.** "1 decided. 2 skipped: He posts out on 15 Jan: refuse or delete it" — the empty day was skipped for
having no bid, not for the posting.
**Cause.** `ui/SelectSheet.tsx`: once `why` holds anything the count `skipped` (rules' refusals and empty / Raptor-owned
days together) is followed by the rules' reasons only, and "(no bid, or Raptor-owned)" is dropped.
**Fix.** Have `setBidStates` also return how many the rules refused (`refused: r.skipped` summed from the door calls, before
the reasons are de-duplicated); print `${refused} not approved: ${why.join(' ')}` and, where `skipped - refused > 0`,
`${skipped - refused} skipped (no bid, or Raptor-owned)`.

## A question for the host, not a finding

M5 moved the older B12 rule — "a man whose posting out has RUN: Approve refused" — into `sync.ts approveWhy`, so it now holds
in every door, "Approve what I enter" included, for ANY date of his, also days before his posting (an admin correcting his
past months on the war can no longer approve there; the Inputs page still can). D1436's full row reads "a request with no
such day [no day after his posting-out date] approves as ever", while build spec §8.2 put the run rule on the Approvals
line only. The fix is consistent (one rule in every door, as the Opus read's 6 offered), but whether the run rule should
cover days before his posting is his reading to confirm, not the code's.

## Each fix

- **M1** — right and complete: the half is carried on every part (`linesOfWar`, the re-read, `codeOf` read before the
  command); `warLeaveFor` matches by half in the re-key and in `staleWhy`'s gone-from-day branch; the approved branch's
  "back" request is matched by half; `doorApprove` never joins a morning to an afternoon (`same` needs the same `half`), so
  a run across days where only one day has another half, and Approve all of both halves of one day, each re-key to their
  own Input.
- **M2** — right and complete: `warLeaveNow` keyed "date|notation"; approvals, put-backs, moves (paired over the sorted
  keys) and deletions matched by date and half; "Approve what I enter" beside an approved half tells "added" once.
- **M3** — right but not complete: finding 3 (one form per light is dropped on a third tap).
- **M4** — right for a tap, not complete: finding 1 (a press held past 0.8 s on a phone) and finding 2 (it swallows presses
  where nothing moved). Keyboard is untouched (no press, nothing eaten; Escape unchanged); a press inside the calendar or on
  "Pick dates…" is not eaten.
- **M5** — right in Approvals, the day's list and both windows' Approve; not complete: finding 4 ("Approve what I enter")
  and finding 5 (the drag window's count); the question above.
- **M6** — right and complete: `pageOn` cleared before the visit ends, `Body` touches neither the screen flag nor the
  scroll once he has left, the grid's place recorded only on the page, the return from the Approvals page lands on the grid
  where he was.
- **M7** — right and complete (a lit row is asked whether its decision stands; one put back on the grid takes its own
  place, pending; one approved again on the grid under a new Input says "Already approved by …", unlit — true).
- **M8** — right and complete: the bell holds a finger with the one body every window uses; its inner list still scrolls.
- **M9** — right and complete: the "again" line names its line, shows only while that line stands and only the newest;
  unread it goes with the next Undo, read it brings "taken back" again; no second "again" on Redo; every reader goes
  through `noticeLive`.
- **M10** — right and complete: a member's ordinary re-type (the stamp of the live bids on the half it replaces — exactly
  `setCell`'s `liveRequestsOn` set), a move (its id in one cell after), a whole day cut to a half (kept) and his Undo / Redo
  (vouched replays) all still pass; changes are one per cell (`command/commit.ts deriveChanges`), so a cell written twice in
  one command cannot double-count an id.
- **M11** — right and complete.
- **M12** — test only; right (the one-line fit asserted where it was measured, the letters everywhere).
- **M13** — right: 8 in, 46 tall, 10 above the foot; the windows over it stand 8 above it (the home-bar term is 0 without
  `viewport-fit=cover`, which the app does not set, so it changes nothing today).
