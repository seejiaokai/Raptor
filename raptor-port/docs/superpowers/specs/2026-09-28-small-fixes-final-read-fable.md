# Small-fixes batch — the final code read (Fable, blind) — 28 Sep 26

Reviewer: Fable 5.1 (did not write the code). Brief: `docs/superpowers/briefs/2026-09-28-small-fixes-final-read.md`.
Branch `claude/small-fixes-batch-d223f6`, diff `origin/main...HEAD -- raptor-port/src raptor-port/e2e` (54 files), read whole,
with the plan (§2, §9), the evidence sheet, D360 / D31 / D44 / D45 / D103 / D175 / D56 and the code around every seam the
diff touches. Read blind to the other reviewer. No test suite run (the PC's lock is held); one test file was not needed.

**Result: 3 findings — none money, none the published record, none saved data. One is a wording gap in the very place
D360 names; two are cosmetic. Nothing here should hold "merge live" once the gates are green; finding 1 is a small fix
worth making on this branch because D360's sentence is the point of item C.**

## Findings

### F1 — In the window's "Who earns OIL" half, a man on an open-ended row says "nothing measurable to earn from here", and a tap on him replaces D360's sentence with it

- **Severity:** a person sees something wrong (a wording gap where OIL is decided — D360 reading (2)). Not money: nobody is
  credited either way.
- **Where:** `raptor-port/src/ui/oilmode.ts:627-641` (`inertWhy` — the `plain` fallback is what a non-request item gets),
  reached from `oilSeatHTML` at `oilmode.ts:652`; the tap that copies it into the footer: `raptor-port/src/ui/AvailWindow.tsx:276-284`.
- **The scenario:** Saturday, ground row DINNER WITH CMD 18:30 with no end, an ALL AVAIL on it. OIL Earn on. Tap the count →
  the window opens on "Who earns OIL · 0 of 2", the footer reads "No OIL worked out — this row has no end time." (right).
  Hover a man's puck: its title reads "Ranger — nothing measurable to earn from here". Tap him: the footer now reads
  "Ranger — nothing measurable to earn from here." — the reason D360 asked for is gone from the one half D360 names, and
  the admin reads a generic phrase that does not tell him the fix (give the row an end time). The row's own switch on the
  board says the right thing (`oilmode.ts:579-580`); the men in the same window do not.
- **Why it is wrong:** D360 (`scheduler.md`), reading (2): *"where OIL is decided — the window's 'Who earns OIL' half and the
  row's seat in OIL Earn mode … say 'No OIL worked out — this row has no end time'"*. D31: a refusal says WHY. The half
  says it until the first tap, then says something else about the same row.
- **The fix, step by step:**
  1. In `inertWhy(di, item)` (`oilmode.ts:627`), before `if (!item || !item.startsWith('i:')) return plain`, add: if
     `openEndRows(DAYS[+di] || {}).some(r => r.item === item)` return `'no OIL worked out — this row has no end time'`
     (the lower-case form of `OIL_OPEN_END`, since `oilSeatHTML` prefixes the callsign and a dash). `openEndRows` and `DAYS`
     are already imported in `oilmode.ts`. That fixes the puck title AND the footer, because the footer copies the title.
  2. Test (`raptor-port/src/ui/availopenrow.test.tsx`, the "where OIL is decided" block): open the window in OIL mode on the
     open row; assert `$$('.availwin .seat.oilpk')[0].getAttribute('title')` contains `'no end time'` (RED today: it contains
     `'nothing measurable'`); then `click($('.availwin [data-awp]'))` and assert `$('.availwin .win-foot .hint').textContent`
     contains `'no end time'` (RED today).
  3. Re-walk `sf-c-openrow` C2b (one tap on a man added to the check).

### F2 — The floating window stays pushed down after the board closes with its preview bar showing (cosmetic)

- **Severity:** cosmetic — the window is lower than its corner and height-capped for a while; nothing is covered, nothing lost.
- **Where:** `raptor-port/src/ui/floatwin.ts:112-121` (the only trigger is a MutationObserver on `#sbWarn`'s children) and
  `raptor-port/src/ui/SchedBoard.tsx:222` (`if (SBDAY == null) { panelPrev.current = {}; return }` — when the board closes the
  effect returns before rewriting the panels, so the bar's markup stays in `#sbWarn`, hidden with the board, and no
  mutation fires).
- **The scenario:** 1440×900, Edit Schedule → open the board on a published day → plans menu → the issued ORIG (the bar
  shows) → tap an ALL AVAIL count → the window opens below the bar (right). Close the board (✕). The window stays open over
  the edit week (D66 closes it on a page / week change, not on the board closing) — but at the bar's height (roughly 150+
  px from the top) with its `max-height` still set, not at the stylesheet's corner (top 96), until a browser resize or a
  tap on another chip. `BOARD_BAR.clear()` already answers null here (`#schedBoard:not([hidden])`) — only the trigger to
  re-place is missing. The reverse order (window open, then the board opened onto a preview) works: the board's effect
  rewrites `#sbWarn` and the observer fires.
- **Why it is wrong:** the item's own contract in `floatwin.ts:57-58` — *"the next place() with no bar clears both again"* —
  and D38–D41 (an unplaced window sits at the stylesheet's corner). The evidence sheet's roll-call has no row for "the
  board closes while the window is pushed down".
- **The fix, step by step:**
  1. In `useFloatWin`, add a presence check that runs on every render (the windows re-render on every `notify`, and
     closing the board notifies): `const wasClear = useRef(false)` and
     `useEffect(() => { const now = !!(open && !phoneLayout() && opts.clear && opts.clear()); if (now !== wasClear.current) { wasClear.current = now; placeRef.current() } })`
     (no deps). Keep the MutationObserver — it is what catches the bar arming/growing while the board is open.
     (Alternative: a second observer on `#schedBoard` with `attributes: true, attributeFilter: ['hidden']`.)
  2. Test (`raptor-port/e2e/availwin.spec.ts`, after the pushed placement in the desktop test): close the board through its
     own ✕ (the board's close button), `waitForTimeout(250)`, assert `(await rectOf(page, '.availwin')).top === 96` and that
     `.availwin`'s inline `max-height` is empty (RED today).

### F3 — "moved from" is said in two voices, one tap apart (cosmetic)

- **Severity:** cosmetic (wording).
- **Where:** `raptor-port/src/leavewar/ui/DayList.tsx:155` — `· moved from ${dayLabel(src.shiftedFrom)}` → "moved from Wed 11 Feb";
  `raptor-port/src/leavewar/ui/BidPicker.tsx:455` — now `shortDate(decide.movedFrom)` → "moved from 11 Feb 26".
- **The scenario:** a closed war; a bid dragged to another day. Tap the day (one record) → the bid sheet's decide row reads
  "moved from 11 Feb 26". A day holding two records → the day's list reads "LL — … · moved from Wed 11 Feb". The same
  phrase about the same move, two spellings. The DayList line is pre-existing; the split is new — the bid sheet's line
  used to print the ISO date, and this change gave it the sentence voice while the list keeps the header voice.
- **Why it is wrong:** the change's own rule (the plan §G1, built in `dates.ts`): a sheet HEADED by a day reads "Fri 17
  Jul"; a date INSIDE a sentence reads "17 Jul 26". "moved from …" is a sentence in both places. `isodates.test.tsx` does
  not render the day's list, so the roll-call did not see it.
- **The fix, step by step:**
  1. `DayList.tsx:155`: `shortDate(src.shiftedFrom)` (import `shortDate` from `./dates`). The list's HEADER (`:220`, `:223`)
     keeps `dayLabel` — it is a header.
  2. Test (`isodates.test.tsx`, "the two voices"): render `DayList` with a closed war holding a moved bid (the `moveone.test.tsx`
     fixture: `states.asics['2026-01-30']` with `shiftedFrom: '2026-01-23'`), assert its text matches
     `/moved from 23 Jan 26/` and not `/moved from Fri 23 Jan/` (RED today).

## Observations — not findings, said so the next reader does not chase them

- **D9 and an existing test:** `raptor-port/src/engine/signbind.test.ts:53-54, 100` assert `signBindOf(0).cur.dg === digest(DAYS[0], 0)`.
  That holds only if the seed Monday's ground rows are STORED in shown (time) order. If the gate goes red there, the test's
  expectation should become the digest of the shown copy (what `currentBindNow` now binds) — never the code. I could not run
  the suite to check (the lock).
- **`was: true` on `DeltaEntry`** (`canonical.ts:122`) shares a name with `PendItem.was` (`publish.ts:208` — the input's
  previous RECORD). No reader collides today: pending units carry the entry under `entry`, and `pendlist.ts:169, :326` read
  `it.was` only for input items. A naming smell, not a defect.
- **F1's route** (`[PLAN-BANNER-DOOR]`, the walk's W-4): confirmed from the code — the view page's drafts picker
  (`html.ts:357`) sets a `d:` preview whose bar carries no Switch button (`vsel` false), and `view.ts:543` drops every `d:`
  preview on entering Edit Schedule, so neither the edit week's bar (`html.ts:1538`) nor the board's (`SchedBoard.tsx:260`)
  can show it. The filing is right; the wording fix is right where it sits.

## Checked and found right (so the absence of a finding means something)

**A — the windows and the bar.** `BOARD_BAR.clear` matches the board's DOM (`SchedBoard.tsx:545` `#sbWarn`, `:256` `.dprev-bar`)
and the `hidden` gate; only `top` and `max-height` are written, so the ResizeObserver's "his box" test is never fooled; a
dragged/resized box is never touched; the phone never enters the branch; the observer on `#sbWarn` re-places when the bar
appears, arms (grows) or goes; `resize` re-places; both windows pass the same `BOARD_BAR`. (Only the board-closes case above.)

**B — the ghost.** `.puck{overflow:hidden}` (`scheduler.css:1205`) and `.puck .nm{overflow:hidden}` (`:1329`) — the name still
clips itself when the ghost lifts the clip; the lift compound now sets no `box-shadow`; the veil carries depth + accent; the
cascade test walks every ring set (`boxred`, `boxdash`, `warn`, `warn.hard`, `warn.note`, `me`, `hl`, `wfoc…`, `me.boxred`)
and the e2e reads the veil.

**C — D360.** `openEndRows` skips cancelled, ⓘ, request (`src`) rows and never lists a flying line; sims use `VCONF.simLen`,
everything else `VCONF.openEnd` — the SAME defaults `time.ts win()` (`:25-30`) and `avail.ts:186` give the crew picker and
validator, so the count and the picker agree. The evidence writes `sent[item]` only — no `reach`, no `put` — so
`dayOilWork` / `oilEarnedWork` measure and pay nothing from the row (pinned per row kind). `oilEvidenceKey` carries the crowd
(`memKey`), so a crowd change on a published day reads pending (D44/D45, look-card Q4 named), while `oilSignKey` strips
membership as D45 says and the four still fall through `pd` (D103). `oilItemCellHTML`'s open-end branch is reached (the row is
not in `oilCapableItems`, since `reach` is never called for it) and every caller is the board (`board-html.ts:310, :703`,
`board.ts:278`). `oilSentinelSummary`'s `nostart` state is distinct from `unrecorded` (its own class and title); a start with
no length → `OIL_NO_LENGTH`; the window's title, flags (`crowdClashes` over the assumed window) and OIL hint read the assumed
window; the when-line wraps. An issued face of a day published BEFORE this change shows no chip for such a row — D56, as the
brief says.

**D1 — one press, one message.** Both publish sentences are raised INSIDE `fn` (`publish.ts:343` `setDayApproved`, `:1112`
`publishALDay`) and the Leave War's gate speaks through `HOOKS.toast` (`sync.ts:1221, :1234`), so all join. `commitUnpublish` is
its own command, its sentence built after success from the version withdrawn (`was`), with the armed-withdraw tail. A throw
drops the batch; a batch inside a batch joins the outer; outside a batch the last message still wins (Astra 03 kept).

**D3 / D4 — the callsign and the AL tag.** The `.ntx` becomes an inline run inside a clipping block, so a long name ends in "…"
and never wraps; an empty editable keeps a tappable width. `.bto` and `.ld` hold inner spans (`html.ts:1718-1720`), so the
descendant `::after` rule matches on both weeks; the board's times are inputs and stay out.

**D9 — Sort and the four.** The digest reads a copy with ground rows in shown order; `gman` is in `DAY_EXCLUDED_FIELDS`
(`canonical.ts:46`), so Sort on a hand order that already equals time order binds the same and the four hold; a hand-order
real reorder changes the digest AND emits a `move` entry, so the four fall (pinned). `pendingKey` rewrites only `g:`/`gr:`
addresses of the CURRENT day to `@rid`; `was` holes and deletes keep their issued positions; `mov:`, `oil`, `input` and every
other section's address are untouched; a legacy row with no rid keeps its position. `currentBindNow` is the only reader of
`digest(` in `publish.ts` (no second comparison to drift). The stored `gord` re-signs once — D56, as the brief says.

**E — one request, one row across weeks.** `rowElsewhere` skips `CURWEEK`, and `loadWeek` stashes the week being left
BEFORE `setCurWeek` (`store.ts:627, :634`), so the reland pass reads the fresh copy of the old week and the stale copy of the
new one is skipped. Fails closed ('unreadable') where a second row could be made (accept, relandInputs), open where a delete
would otherwise block on an unknown (as before). Every row-making path goes through `acceptInput`'s guard — `autoAcceptInput`
(`slots.ts:563`), `commitNewInput` with `toGround` (`inputedit.tsx:869`) and without (`:877`), the card's Accept. The filing
stays week-local: `reconcileLandedAcc` and `reconcileDayFiling` scan `DAYS` only (Astra 02). `relandInputs` never re-parks 'r'
while the row stands on another (or an unreadable) week. `dropInputRow` adopts a standing row before `unacceptInput`, so no
dead row survives a delete. The card's "On Sun 19 Jul" note replaces Accept only for a personal input with no filing here; a
'u'/'g' filing keeps its Undo; the Undo names the other day and its press says so. `rowsLeftOut` returns `away` and the load's
sentence names the day. The refusal wording (`stuckSays`) names the day day-first.

**F1 / F3.** The banner keeps its role/page and protected-week gates, checks the plan exists, then runs `switchDraft` (whose
own edit-mode gate is true on the board and the edit week). `requestWords` names a deleted request from the pending item's
record or the issued `snap.inp[id]` — never history prose; a request filed after publication and deleted yields no delta.

**G — the Leave War.** One clash producer (`sync.ts:627`) sets `wayOut` for every clash; four holders → four sentences, the
published-war case included; every `why.push` in `sync.ts` (approve, change, delete) prints day-first; Matrix's move refusal
and PO tag; the bid / Raptor / award / Post-in / Post-out sheets and the day's list header via `dayLabel`; the one-day
selection via `shortDate`; the remarks editor via `inputDayLabel`; the Inputs editor's title via `fmtDay`; the under-manned
list already `shortDate`. `.spring{flex:0 1 auto;min-width:0}` lets the row wrap under the shell's `.topbar>*` rule; the
read-only window's look is keyed on the `inert` the window already sets. `shiftBid` / `moveAbsenceById` / `ShiftResult` have no
callers left in `src/` (only docs marked retired); their tests run through `moveRecords` / `moveCells`, with the two answers
that changed ('nothing' for a zero move and for a closed-war member) noted in the tests.
