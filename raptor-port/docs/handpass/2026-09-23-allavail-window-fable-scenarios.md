# [ALL-AVAIL-WINDOW] — Fable's scenario design (23 Sep 26)

**What this is.** The bug-check order §4 rank 1: a model that did NOT build the feature designs
the test scenarios, hunting for what is MISSING rather than reviewing what is there. Fable 5.1,
read-only (nothing edited, nothing run), against the branch at commit `7c2953b5` (the earn half),
briefed with the §4 finder wording and the D56 demo-data exclusion. Kept verbatim below the status
table, the same way the bug-check order keeps both providers' proposals verbatim.

## Status — ALL DISPOSITIONED (23 Sep 26 night)

Every item below, and the five "next worth a look", is fixed (with a test red first), ruled, or
filed — one row each in the evidence sheet §5: `2026-09-23-allavail-window.md`. The status table
that stood here was the work list; it is retired so it cannot go stale beside the sheet.

---

## Fable's report, verbatim

# [ALL-AVAIL-WINDOW] — scenario design (what is MISSING)

Read: DECISIONS D18/D27/D33/D36–D41/D43/D44/D51, the full branch diff, `AvailWindow.tsx`, `pops.ts`, `oilmode.ts`, `oilev.ts`, `html.ts`, `board-html.ts`, `board.ts`, `interactions.ts`, `SchedBoard.tsx`, `view.ts`, `store.ts`, `drag.ts`, `slots.ts`, `peek.ts`, `printpdf.ts`/`export.ts`, the mock, `availwin.test.tsx`, `e2e/geometry.spec.ts`. Nothing edited, nothing run.

## 1. Roll-call

Door = the count chip (`data-oilsent`), drawn by `oilSeatDeco` (html.ts:491) through the ONE seat body per surface (`sbSeat` board-html.ts:311, `lSeat` html.ts:472). Gesture = board `boardArmClick` (board.ts:1290, gated on edit mode + not-preview) falling through to the document router `routeClick` (interactions.ts:491, no gate).

| Surface | Door | Gesture works? | Painted on the same pixels / notes |
|---|---|---|---|
| Board · ground row, its extras line | yes | opens the window — **but the window paints UNDER the board** (see S1) | seat is armable + draggable in edit mode; chip must take its own press (e2e pins that for the week only) |
| Board · row landed from an accepted request | **unsure** | — | membership for a `src` row is written only when the request type *asks* the OIL question (oilev.ts:535–538; the day walk skips `src` rows whole). A placeholder on an "Other → Ground" row may draw NO chip at all — no door, any day. D46 allows the puck there; D27 says the count shows. Pre-existing, verify. |
| Board · Common Programme, beside a named man | yes | as above | |
| Board · duty desk own position, duty extras | yes | as above | manning count reads the placeholder (D33 accepted) |
| Board · sim seat, sim passengers, sim extras | yes | as above | |
| Board · flying cockpit seat | must-not | — | D33 refusal lives in the writers (`setSlotVal`/`fillSlot` belts + `sentinelSeatOK` preflights, slots.ts:127/147/192). Only stored data can put one there → excluded. |
| Board · requester puck on Personal Inputs / Unavailable | must-not | — | `inp.person` is always a real person |
| Board · inside OIL Earn mode (every kind above) | yes | opens on the "Who earns OIL" tab | in-row crowd is gone; **this chip is now the ONLY door to switching a crowd member off** — and it opens an invisible window (S1) |
| Board · issued/version preview (`.pv-frozen`) | yes, chip carries the version | `boardArmClick` bails on DPREV (board.ts:1246) but the document router opens it | flags/figures inside the window then come from the LIVE day (S3) |
| Edit week · programme / duty / sim / pax / ground / extras | yes | routeClick | |
| Edit week · cockpit seats (`slotCell`) | must-not | — | same refusal |
| Edit week · version preview (`dayPreviewHTML`) | yes, with version | routeClick | S3 |
| View week · issued face (`dayIssuedHTML`) | yes, with version | routeClick, no role gate — a member can open it | "who was free when this day was issued" |
| View week · working-copy peek (VWORK) / draft day | yes, live | routeClick | |
| Next-week peek | must-not | — | peek.ts draws its own markup (no oil deco); any tap lands the week (routeClick's first branch) |
| Printed schedule (printpdf.ts) | must-not | — | prints text, no pucks/chips |
| CSV export (export.ts) | must-not | — | no pucks/chips |
| Inputs page / Leave War / Tracker / Quals | no placeholder drawn | — | **the open window floats over them** (position:fixed, nothing closes it on page change) — S13 |
| The window's own pucks | n/a | tap = why / switch off | ALSO hit routeClick's `.puck[data-person]` selection branch (S9); NOT draggable (no `data-drag`); blank-space clear does not fire (needs `#shell`/`#schedBoard` ancestry) |
| History (edit log) as downstream consumer | — | — | a switch made from the window writes NO line (S7) |
| Pending count / amendment / undo | — | — | same `schedWrite(SCHED_TYPES.oil)` path as the board — sound |

Roles: scheduler (edit) · scheduler with the page moved off Edit Schedule (board read-only → router opens) · admin viewing as member · member (view week only; OIL tab unreachable, write gated with a toast). Overlays above the window: every Sheet/modal (z 420–480), **the board (z 400)**, the phone edit-week rail (151), the desktop proxy scrollbar (185). Below it: topbar (60), week arrows (150, same z, DOM order).

## 2. Top 15 failure scenarios (likelihood × consequence)

**S1 — The window is painted UNDER the board.** `.availwin{position:fixed;z-index:150}` (scheduler.css:6083); `.schedboard{position:fixed;inset:0;z-index:400}` (scheduler.css:3553); both are siblings of the App fragment, no rule lifts the window. Setup: any day's board, ground row with ALL AVAIL, phone or desktop. Action: tap the chip. Expected: window over the board, board still editable behind it. Disproof: nothing appears (the DOM holds an un-hidden `.availwin` beneath `#schedBoard`); the same tap on the week works. Consequence: inside OIL Earn — a board-only mode — there is now no reachable door to switch one man off; the whole D38 job is invisible where it is needed. No browser test covers the window (geometry.spec only measures the chip), so the run in progress cannot catch this.

**S2 — The flag the window exists for never appears.** D36+D38: a man whose ops brief sits inside his standard debrief must appear FLAGGED. `personWarnMsgs` (html.ts:477) only filters the day's WARN by `who`; the engine skips placeholders everywhere (validate.ts:168, events.ts:179/191/331/408/438) and the resolver returns bare ids (leavewar/sync.ts:190). Nothing computes a crowd member's own tasking against THIS event's window. Setup: Saturday, 4-ship landing 14:30 (debrief to 16:30), ground row OPS BRIEF 15:20–16:20 with ALL AVAIL. Action: open the window. Expected: that crew listed AND flagged with the debrief overlap. Disproof: listed clean, footer "nothing else on the programme at that time". Note the resolver already drops a true time clash, so the only flags a crowd member can ever wear are day-wide ones (crew rest on his own sortie, quals, RUN) — never a clash with this event. `availwin.test.tsx` "a man with a warning is STILL LISTED" plants a named-seat warning; it does not cover this.

**S3 — Issued list, today's flags and figures.** Only `crowd()` is wrapped in `withDaySnap` (AvailWindow.tsx:46–48); `personPuckHTML`, `personWarnMsgs`, `earners`, `oilSeatHTML` run against the live day (AvailWindow.tsx:124–170). The html.ts comment placing `personPuckHTML` beside the PV-gated lookups says a second reader "would flag an ISSUED document from today's warnings" — the gate never fires because the window renders outside the snapshot. Setup: publish Saturday with a crowd; on the working copy switch one man off in the mode, double-book another on a named row at that time. Action: open the ISSUED face's chip (view week, or board plan selector). Expected: issued membership, issued figures, the face's own flags (none under PV; OFW ones on the view page); tab "x of y" equals the chip's "x of y earn". Disproof: tab count ≠ chip; a man on the issued list wears a red ring the issued face does not draw.

**S4 — Week switch leaves a stale window.** AVAILWIN is not in `VIEW_RESET` (view.ts:677) and `loadWeek` never clears it (store.ts:638). Setup: open the window from Saturday; press the week arrow / week chip / calendar. Expected: it closes (every per-week transient — DPREV, VWORK, folds — resets on 'week'). Disproof: still titled "OPS BRIEF · Sat 26 Sep" but listing next week's Saturday crowd (or "none"), with next week's warnings.

**S5 — Unpublish (or undo across the publish) makes the label lie.** `withDaySnap` returns `fn(false)` when the snapshot is gone (html.ts:83–84); `crowd()` ignores `ok`, so it reads LIVE while `oilFromWords(ver)` still prints "who was free when this day was issued". The app already has `prunePreviews()` for exactly this on DPREV; the window has no equivalent. Setup: publish Sat; file leave for one crowd member (live ≠ issued); open the window from the issued face (N men); Unpublish, or Undo the publish. Expected: window closes or re-words to live. Disproof: list silently becomes N−1 under the "when this day was issued" line.

**S6 — Row switched off: the window's tap says the wrong thing and offers no way out.** `oilSeatHTML` draws a masked man with no `data-oilp` (oilmode.ts:653–657) — the board's `[data-oilp]` selector therefore never fires for him; the window wraps him in its own `data-awp` (AvailWindow.tsx:179) so the tap routes anyway, `toggleOilPerson` refuses (returns false), and the footer prints "X earns nothing from this event." (AvailWindow.tsx:208–210). Setup: mode on; switch the OPS BRIEF row off by its name cell; open the window; tap a man. Expected: the board's own refusal, "This event earns nobody any OIL — turn the event back on first" (board.ts:1263–1267). Disproof: the footer sentence above, a second tap says the same, nothing changes, nothing explains why. (Blanket IS handled — AvailWindow.tsx:204.)

**S7 — A switch made from the window leaves no History line.** The board's tap goes through `act()` → `logAction` (board.ts:739, 1272); the window calls `toggleOilPerson` + `notify()` only. This is now the sole door for a crowd member. Setup: mode on; open the window; tap a man off; open History for the day. Expected: "X earns nothing from OPS BRIEF". Disproof: nothing logged; the footer sentence is gone on the next tap. Consequence: the "why is my balance short" gap Fable raised 21 Sep, reopened for every crowd member.

**S8 — Phone: not the design of record.** The mock at ≤620px stretches the window (left 12 / right 12 / width auto / bottom-anchored / 62vh) and scheduler.css:6160 copies that rule — but React's inline `style={{width:212,height:540}}` (AvailWindow.tsx:249) beats the media query. Setup: 390px wide, open the window. Expected: full-width bottom panel per the approved mock (D41). Disproof: a 212px column pinned bottom-left, 62vh tall. Also state plainly: CSS `resize` has no touch handle and WebKit ignores it — on the owner's phone the window is not resizable at all; the mock's "drag the bottom-right corner" does not apply there.

**S9 — Tapping a man in the window also selects him on the schedule.** The window's `onBody` does not stop propagation; the document router's `.puck[data-person]` branch (interactions.ts:1147–1160) then runs `selectPerson`. Setup: OIL tab; tap a man to switch him off. Expected: only the switch (inside the mode the board's own taps never select). Disproof: he lights blue on every copy behind the window, any prior selection is replaced, and the selection outlives the window. Unruled — flag to the owner; if unwanted, one `stopPropagation` or an `.availwin` exclusion.

**S10 — Typing behind the window lags on the OIL tab.** Every notify re-renders the window, which rebuilds the day's evidence ~5–8 times per man (crowd, `earners` ×3, `oilEligible`/`oilPuck`/`oilFigureFor` per puck, `personWarnMsgs`) outside any `oilReadPass` — the memo the HTML builders rely on (oilev.ts "SO IT IS MEMOISED — BUT NEVER ON…"). Setup: 27-man crowd, OIL tab open, type into a remarks box on the board behind. Expected: no visible lag. Disproof: keystrokes stutter or drop. (Only becomes testable once S1 is fixed.)

**S11 — Reopen carries the last window's footer and position.** `foot.current` is never cleared on close/open (AvailWindow.tsx:170; board.ts:1310; interactions.ts:508); the drag's inline left/top is never cleared when the box is null (the layout effect only writes when `b` is truthy, AvailWindow.tsx:70–79). Setup: open A, tap a man ("X — …" in the footer), drag it, ✕; open B from another row. Expected: default corner, default hint. Disproof: B shows A's sentence about a man who is not behind B; B appears where A was dragged.

**S12 — Logout → login inherits the window.** `resetSession` (store.ts:283–305) clears every 'session' transient except this one. Setup: admin opens the window; logs out; `us`/`us` logs in. Expected: no window. Disproof: the member's first screen already carries the admin's window (title, day, version).

**S13 — Page change: the window floats over Leave War / Tracker / Inputs.** Nothing closes it on `setPage`; on a phone it covers 62vh of the Leave War grid. The contract's "✕ and nothing else" was written for editing the schedule behind it, not for other pages. Put to the owner: close on page change (as every inline popup does) or keep.

**S14 — The row that opened it is deleted (or the placeholder dragged off).** `oilSentOf` → 'none' → the window shows "Who's available 0 / — none —" under the captured title — which reads as "nobody is available for OPS BRIEF". Setup: open the window, delete the row (or bin the puck), look at the window. Expected (contract: it outlives the row): stays open but says the row is gone. Disproof: a confident zero. Undo brings it back to life — worth walking both orders.

**S15 — Browser shrink after a drag strands it.** The clamp runs only during a drag; the layout effect re-applies the stored box every render. Setup: desktop, drag to the right/bottom edge, then narrow the browser (or rotate a tablet). Expected: still on screen. Disproof: bar and ✕ off-screen, no scrim, no Escape — the only dismissal is unreachable.

Next five worth a look: two placeholders (ALL + ALL AVAIL) on one row share one item, one list, one window, and the title does not say which puck was tapped (resolver takes no id — by design? put to owner) · a placeholder on a non-asking landed request row draws no chip (roll-call row 2) · tapping an inert man (no `data-oilp`) still reaches `toggleOilPerson` through `data-awp` and, with `spanDefault` defaulting ON (oilev.ts:268), writes a `deny` for a man with nothing to earn — hard to reach through the controls, but the guard the board had is bypassed · title read from the LIVE day at open even for an issued chip (`oilItemLabel(di,it)`, board.ts:1301) — a row renamed since publication retitles the issued list · the toast the window uses for refusals — check it is not hidden under a bottom-anchored phone window.

## 3. Explicit negatives (checked, believe sound)

- Every board and week row kind draws the chip through one seat body each (`sbSeat` fall-through for a placeholder in the mode, board-html.ts:319; `lSeat`), extras/pax/duty included; `oilrowpucks.test.tsx` pins it seat kind by seat kind.
- Chip number and window number come from ONE body (`oilSentOf(evOf(di), item)`) — on the working copy they cannot disagree; the divergence is only the secondary numbers under a version (S3).
- Cockpit placeholders: refused at the writers, not just the doors — an unchipped cockpit puck is stored-data-only → excluded by the brief's rule. Likewise the '?' unrecorded chip (blocks predating membership) → excluded; the window shows 0 there and the chip's title still says why.
- Print and CSV draw no pucks or chips; the next-week peek draws no chip and any tap lands the week — all three correctly doorless.
- The board's issued preview chip still opens (router has no gate) once S1 is fixed; a member on the view week can open the availability list — matches "read-only to open".
- The blanket is checked before the write with the board's own words; a member's tap on the earn half toasts and writes nothing; the OIL tab is unreachable with the mode off (tabs absent), and the mode is scheduler-only.
- Window pucks carry no `data-drag` (drag.ts arms only on `[data-drag]`) — not draggable; a drop released over the window hits no `DROP_SEL` — refused.
- The blank-space clear (interactions.ts tail) needs `#shell`/`#schedBoard` ancestry — clicks in the window never disarm a slot or drop a selection.
- `*{box-sizing:border-box}` — the rect→style write on drag/resize does not grow the window.
- A switch from the window rides `schedWrite(SCHED_TYPES.oil)` — same undo, same pending mark, same amendment as the board's tap; OIL undo boundary applies.
- Touch drag of the bar: pointer capture + `touch-action:none` + `preventDefault` — sound; ✕ excluded from the drag start.
- Outside click: nothing in Shell/board/pops closes AVAILWIN on pointerdown (only the three set sites exist) — the contract holds.

## 4. Missing call sites (file:line)

1. `raptor-port/src/ui/scheduler.css:6083` — `.availwin` z-index 150 under `.schedboard` 400 (`:3553`); no lifting rule. (S1)
2. `raptor-port/src/ui/AvailWindow.tsx:124–170` — `personPuckHTML`/`personWarnMsgs`/`earners`/`oilSeatHTML` outside `withDaySnap` when `ver` is set; only `:46–48` is wrapped. (S3)
3. `raptor-port/src/ui/AvailWindow.tsx:208–211` — no `logAction` (cf. `board.ts:739` `act`). (S7)
4. `raptor-port/src/state/view.ts:677` VIEW_RESET — no AVAILWIN entry; `store.ts:638` (loadWeek) and `:305` (resetSession) never clear it. (S4, S12)
5. `raptor-port/src/ui/AvailWindow.tsx:46–48` — `crowd()` ignores `withDaySnap`'s `ok=false` (`html.ts:83–84`); no `prunePreviews` equivalent (`view.ts` prunePreviews). (S5)
6. `raptor-port/src/ui/AvailWindow.tsx:202–212` — no `oilItemMasked` check/message (cf. `board.ts:1263–1267`); `:179` `data-awp` makes masked/inert pucks tappable, which the board's `[data-oilp]` never did. (S6, inert `deny`)
7. `raptor-port/src/ui/AvailWindow.tsx:249` — inline width/height defeats `scheduler.css:6160` (≤620px). (S8)
8. No reader computes a crowd member's own tasking against the event window — `html.ts:477` filters WARN only; engine skips placeholders (`validate.ts:168`, `events.ts:179/191/331/408/438`); resolver `leavewar/sync.ts:190` returns ids. (S2)
9. `raptor-port/src/ui/AvailWindow.tsx` — no `oilReadPass` around the render reads (cf. html.ts/board.ts builders). (S10)
10. `raptor-port/src/ui/AvailWindow.tsx:170`, `board.ts:1310`, `interactions.ts:508` — `foot` never cleared; `:70–79` never clears inline left/top when the box is null. (S11)
11. `raptor-port/src/ui/interactions.ts:1147` — selection branch has no `.availwin` exclusion; `AvailWindow.tsx:197` onBody does not stop propagation. (S9)
12. `raptor-port/src/engine/oilev.ts:535–538` — landed-row membership only for `asks` inputs → no chip on a non-asking landed row (pre-existing; verify).
13. No browser test touches `.availwin` (`e2e/geometry.spec.ts` measures the chip only) — S1/S8/S15 are invisible to the gates.
