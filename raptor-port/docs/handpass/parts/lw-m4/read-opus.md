# M4 — the fresh, blind Opus code read (28 Oct 26)

Read at 5f0405eaf in the read-only copy `C:/m4r` (`git diff 36b7beaa9 5f0405eaf -- raptor-port/src`), against the build
spec, the evidence sheet (§3, §6, §8, §9, §10) and the Leave War rulings D1420–D1442. Blind to the other reader. Nothing built
or run; every finding below is from reading the code, its steps traced through the functions named.

## Findings

### 1. HIGH — harms a man's leave: on a day whose other half already holds war-approved leave, Approvals' second tap (or Refuse after Approve) acts on the WRONG leave

**Steps.** Ranger has LL approved on the war for Mon 12 Jan afternoon (LL*, an Input filed earlier — Input A). He bids
*LL for the morning. In Approvals the admin taps Approve on that line → lit "Approved". He then taps the lit "Approved"
(D1421's slip fix) — or taps Refuse (D1428).
**What happens.** The AFTERNOON leave A — approved days or weeks ago — is put back to a pending bid (or turned into a
refused one), and the morning leave just approved stays approved. Ranger's bell says "LL put back to a bid · Saber" (or
"LL refused") about the afternoon.
**Cause.** `leavewar/state/store.ts decideRequests`, the re-read after the command: for `l.to === 'approved'` a pending
part is re-keyed with `warLeaveOn(l.personId, p.date)` — no id, no half — which returns the FIRST war-approved leave in
`absencesAt` for that date. `absencesAt` is built in INPUTS order (`sync.ts refreshAbsences`), so the older Input A comes
first and the line's part becomes `{ iid: A }`. The next press sends `iid: A` to `decideApprovedWhy` / `doorDecideApproved`,
which find A standing and change it. The same half-blind lookup in `staleWhy` ("gone from that day" → `warLeaveOn(personId,
p.date)`) says "Already approved by …" for a morning bid that was simply deleted, because the afternoon is approved.
**Fix.** Carry the request's code on the part (`DecidePart.code`, filled by `linesOfWar` and by the re-read) and match the
leave by its window: after the command, `absencesAt(pid, date).find(c => c.kind === 'absence' && !!c.lw &&
isLeaveCode(c.code) && overlaps(c.win, requestWin(code)))`; use the same match in `staleWhy`'s "gone from that day"
branch. (Better still: have `doorApprove` return, per item, the Input id it wrote or extended, and re-key from that.) A unit
test: PM approved, approve the AM line, second tap → only the AM goes back; Refuse → only the AM refused.

### 2. HIGH (visible, misinforms him about his leave) — the bell's Leave War lines go wrong on a day holding two war-approved halves

**Steps.** (a) Ranger has LL* (afternoon) approved on Mon; the admin approves his *LL bid for the morning (Approvals, a bid
window or Approve all). (b) Ranger has *LL approved on Sun–Mon morning as one leave K, filed before an afternoon leave A on
Mon; the admin approves a *LL bid… or (c) puts back one half of a day where both halves are war-approved.
**What happens.** (a) Ranger gets TWO lines: "LL approved · Saber" AND "LL deleted · Saber" — his afternoon leave was not
deleted. (b) The approval reads "LL bid deleted · Saber" and no "approved" line at all. (c) Depending on which Input is
older, the put-back tells nothing, or tells correctly. If he has read the wrong line, an Undo then writes a wrong "Deletion
of LL taken back".
**Cause.** `leavewar/sync.ts warLeaveNow` builds person → date → ONE notation (`m.set(d, …)`), so the second half's leave
overwrites the first on the same date, whichever Input comes later in INPUTS. `store.ts decisionTells` then compares those
single values: the overwrite shows as a day "lost" (→ `deleted`) and/or "gained", or hides a real change. An approval that
extends an earlier leave keeps that leave's place in INPUTS, so the later afternoon Input still wins the date and `gained`
never has it → the request falls through to `biddel`.
**Fix.** Key the map by date AND half: person → `${date}|${notation}` (or date → set of notations), build `lost` / `gained`
as sets of (date, notation) pairs, match an approval to a gained pair on the request's date whose half is the request's
(`portionOfCode(rec.code)`), and pair moves over the pairs sorted by date. A test for each of (a), (b), (c), and for
"Approve what I enter" (D1422) beside an approved half.

### 3. MEDIUM (visible; speed) — leaving the Leave War from the Approvals page turns the grid's "on screen" flag back on while it is hidden, and can scroll the next page

**Steps.** Admin on the Approvals page (or with the slim bar up) → goes to another page (Schedule, Inputs, a bell line
for an input, …).
**What happens.** The Leave War grid, now off screen, is told it is on screen: on a desktop its background fill draws the
whole year while he is on other pages, and the next return pays the full-year re-style the 5 Sep 26 design exists to avoid
(`docs/performance.md` §E: "desktop off-screen = capped HIDDEN_MONTHS"). From the page (not the bar), `window.scrollTo(0,
gridY)` also runs after he has left, and can move the new page to the grid's old scroll (0 if he never scrolled the grid).
Separately, `gridY` is written by a window-wide scroll listener on every page, so going Approvals → Grid can restore the
scroll of whatever other page he last scrolled.
**Cause.** `leavewar/LeaveWarPage.tsx`: the leave-effect calls `setApprMode('off')` and then `setLwOnScreen(false)`; the
mode change re-renders `Body`, whose effect runs AFTER the cleanup and does `setLwOnScreen(mode !== 'page')` → true, plus
(from `'page'`) `window.scrollTo(0, gridY.current)` and a resize kick. `Body`'s scroll listener records `gridY` whenever
`apprMode() !== 'page'`, on any page.
**Fix.** In `Body`, act only while the Leave War page is the page on screen (`CURPAGE === 'leavewar'`, or a flag the page's
own activation effect sets): when the mode goes to `'off'` because the page was left, only reset `apprY` and return —
never touch `setLwOnScreen` or the scroll; and record `gridY` only while that holds and the mode is not `'page'` (or take
it from the page's own `savedY` when switching to the Approvals page).

### 4. MEDIUM-LOW (visible) — a lit line is never checked again: after a change on the grid it stays "Approved" beside a second copy of the same request

**Steps.** Approvals: Approve a line (lit "Approved"). Tap its dates → the grid, slim bar up. Open that leave on the grid
and press its lit Approve (back to a bid, D1330), or Refuse it there. Back ▴.
**What happens.** The old line still shows lit "Approved", and the same request appears again below as a new pending line.
Only pressing a button on the old line reveals "Already put back to pending". A lit "Refused" line whose bid was then
deleted on the grid likewise stays lit.
**Cause.** `ui/ApprovalsPage.tsx`, the `rows` memo: `if (r.lit) { out.push(r); continue }` — a lit row is kept as it is,
never asked `lineStale`; the put-back mints new request ids that are not in `r.ids`, so the fresh line is not matched to
it and is pushed as a new row.
**Fix.** For a lit row, ask `lineStale(r.line.personId, r.line.parts)`; when it answers, drop the light and show the stale
reason (`msg: { kind: 'stale', why }`) — or, where an unmatched fresh line of the same man covers the same dates, let that
line take the row's place (keep the row's key) so the request is shown once, pending.

### 5. LOW (visible; against D1216) — an unread "… approved again" line survives the next Undo

**Steps.** Admin approves Ranger's LL → Ranger reads "LL approved" → admin Undo ("Approval of LL taken back") → Redo ("LL
approved again", unread) → Undo again, before Ranger opens his bell.
**What happens.** Ranger's bell holds "Approval of LL taken back" and, still unread, "LL approved again · Saber" — for an
approval that no longer stands. D1216: a line he has not read goes with the Undo.
**Cause.** `leavewar/sync.ts warNoticesReversed`: the "again" line is written by the Redo's own follow-up (inside the
`undo.restore` command), not by the step, so it is not in `entry.forward`; the Undo branch only looks at the step's own
notices and never at the "again" lines it made.
**Fix.** Give the "again" part `ref: n.id` (as `lwback` has); in the Undo branch, for each forward notice `n`, also find
stored `lw` lines with `again` and `ref === n.id` for `n.to`: delete each the member has not read (in the same `lw.notice`
command), and for one he has read write the "taken back" line as for `n`.

### 6. LOW (two doors disagree) — "Posted out — refuse or delete it" holds only in Approvals; the bid window approves the same request

**Steps.** A man whose posting out has RUN (not SANS) still has a pending bid from before his posting date. Approve it from
Approvals → refused "Posted out — refuse or delete it". Approve the same bid from the grid's bid window or the drag window →
approved.
**Cause.** The run check lives only in `store.ts decideWhy` (`postedOutBy`); the one body both doors ask, `sync.ts
approveWhy`, checks only D1436's dates after the posting (`postingOutWhy`).
**Fix.** Move the run check into `approveWhy` (one body: `postedOutBy(personId) && !postedOutAsSans(personId)` → "Posted out —
refuse or delete it"), and drop it from `decideWhy`, so every door gives one answer — or, if the bid window is meant to
approve, drop it from Approvals. Either way one rule, with a test through both doors.

### 7. LOW (security, a crafted command only) — the stamp guard still lets a member's new bid borrow an old stamp

**Steps.** A member's hand-made command on his own cell (not reachable from the screens): (a) drops his own REFUSED request
of months ago and adds a new pending request carrying its `placedBy` / `placedAt`; or (b) keeps a request where it is and
adds a copy with the same id on another day of his row.
**What happens.** Both pass `stampForged`: the new bid sorts to the top of Approvals (oldest first) and never shows as
"New".
**Cause.** `state/perms.ts stampForged`: `replaced` is every request of the cell's before-image not kept — refused ones
included, of either half — while `setCell` carries the stamp only from the live requests on the same half; and "the same
record" is any id found in a before-image, without checking that the id left its old place (a copy, not a move).
**Fix.** Build `replaced` from pending requests whose half overlaps the new request's (`portionOfCode`), as `setCell` does;
and treat a same-id request as "the same record" only when that id is absent from every other after-image of the command
(otherwise it is new: placed by him, now).

### 8. TIDINESS (speed) — the derived "its dates ended" lines are worked out again for every bidding line, on every bell draw

`state/notices.ts noticeLive` calls `allNoticesFor(n.to)` for every `lwopen` line, and each call runs `sync.ts endedLines`
(which walks every war's stretches and, for each, all NOTICES, and rebuilds `warAudience()` from the accounts). `unreadFor`
(the bell's count, drawn on every Raptor notify) and `noticesFor` call `noticeLive` per notice — quadratic in the notices
held, growing every time bidding is opened or closed. **Fix:** work the person's list out once per call (pass it into
`noticeLive`, or memo `endedLines(pid)` on the NOTICES length, the wars' version and today).

## What I read and found sound

- **Stamps:** `readRecBody` keeps all four (bounded, a pre-M4 request kept bare — D401); `setCell` mints them and keeps the
  first on a re-type; `moveRecords` keeps who placed and drops who decided; `decideRequest` sets / clears who decided;
  `doorApprove` puts the earliest placer on the Input (and on an extension's merge) and `doorDecideApproved` gives it back;
  `replaceClashingBids` and `setRequestWords` spread the record. Pre-M4 requests sort first with a dash.
- **Who may do what:** `lw.apprseen` own row, admin only, declared to the command layer, never an Undo step; NoticeSeen
  widened to an admin's read only; `lw.notice` admin-only and only ever joined to an admin's restore; a member's notice may
  carry no war kind; `lw` / `lwMoved` and `lwBy` / `lwAt` on a member's Input kept or vouched by this command's own
  before-images; `verifiedReplay` now vouches war cells, so a member's real Undo / Redo passes and a self-styled restore does
  not. An admin's commands are untouched by the guard.
- **The one writer:** every line checked before anything is written; a refusal leaves the line as drawn; D1436's dates in
  both doors (`approveWhy`), SANS excepted; ranges crossing the date and a half day on it refused whole; Approve all one
  command, one Undo; a decision reaches the war holding the date.
- **The bell:** one line per run per man, never to the actor, never to a man who has left; B1 (`skipLw`) silences the
  Inputs door for war leave in war commands, with ★7's remark-only exception; a re-type tells nothing (★5); bidding lines to
  everyone on the war but the admin, one live line a stretch, shortened / split stretches said with their new dates;
  "taken back" only where read; C-F3's ended line dated after the newest line he holds; the replaced bid named on the
  Inputs door's own line and its words kept on the grid notice.
- **The page:** the visit's moment written on opening, the previous one kept; New excludes his own placings; Approve all
  armed by the exact list shown; the slim bar's Back keeps the page mounted; Undo with the page up does not jump the
  hidden grid; a member's view leaves the tab.
