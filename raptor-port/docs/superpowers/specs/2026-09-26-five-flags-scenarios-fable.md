# Five-flags batch — scenario design (Fable 5.1, 26 Sep 26, read-only)

*Saved verbatim by the builder from Fable's hand-back (brief: `raptor-port/docs/superpowers/briefs/2026-09-26-five-flags-scenarios-brief.md`).
Bug-check order §4 rank 1. The builder's dispositions are in the evidence sheet `raptor-port/docs/handpass/2026-09-26-five-flags.md`.*

Designed from the five promises in the brief and the code on `main` at `e27e15fe` (`git show main:…`), not from the builder's diff. Demo week Mon 13 – Sun 19 Jul 26. `ad`/`a` = admin **Saber** (FCP, IP, SXO); `us`/`us` = member **Ranger** (FCP, IP, SXO); **Reaper** (FCP, IR, SXO) is the third man used below. Monday's Common Programme in the seed: SODB 07:45–08:15 · MET + NOTAM BRIEF 08:15–08:30 (Nact) · **FLIGHT SAFETY STAND-DOWN 08:30–09:00 (Ranger)** · WPNS & TACTICS SYNC 11:30–12:00 (Harpoon) · STANDARDISATION MEETING 13:30–14:30 (Pump) · OCU PROGRESS REVIEW 14:45–15:30 · INTEL UPDATE 16:00–16:20 · **OPS SHARING + NAV SYS BRIEF 17:55–open (Saber)** · DINNER WITH CMD 18:30–open · CMD ENGAGEMENT 21:30–open. Note the seed's rows ABUT, they do not overlap (overlap is half-open) — every "overlapping row" below is made through the app's own controls (+ row, or retype an end time), never injected.

**Tier, my reading (the builder states it, §5):** item 3 changes how a rule is read and what the picker's reason says → question 8 YES → **FULL** for item 3 (the busy check has five consumers, listed below). Items 1, 2 and 4 → **WALK** (a shared drawer; a new control; a landing gesture). Item 5 → **NONE** for the app; it is proved by its own `node --test` matrix.

**Two walker traps, up front.** (a) The purple "this is you" class is *passive*: clicking that puck (selection) or any highlight chip removes it — a walk script that clicks Saber's puck to inspect it will see a plain puck and report the glow gone. Inspect by screenshot, hover and computed style; select something else only in the scenario that tests the yield. (b) Chromium re-snaps after a programmatic scroll and Safari does not; for item 4, record the front day's position on the landing frame AND after it settles — a 54px hop after landing is the snap doing the landing code's job, not a pass.

---

## 1. Ranked scenarios — most likely to find a real defect first

Format: **Setup / Action / Expected / Disproved by.** Widths: D = 1440×900, P = 390×844, S = a 1024×700 short desktop. "iPhone-only" marks what the emulator cannot prove.

### F1 · [CROWD-SWAP] The "was it his only event that day" test across the FOUR key shapes it gets wrong today
On `main` the cross-day check reads the seat a man is dragged FROM and asks whether it was his sole event there by comparing the raw drag key with the event's key. Only a flying seat compares equal. A programme seat (`…ri.N` vs the row `…ri`), a sim seat (`….p` vs the box), a duty desk's extras line and a ground row's extras (`.xN` vs the row) all read "not sole" — so dragging his only event off a day still counts that day as on.
- **Setup (D, Edit Schedule, `ad`):** put Reaper on something Mon–Fri (one flying seat a day is enough). Saturday 18 Jul: his ONLY event is (a) a Common Programme row you add ("SAT BRIEF 09:00–10:00", + row, then + add → Reaper). Sunday 19 Jul: an empty ground row ("SUN DUTY 09:00–12:00").
- **Action:** drag Reaper's Saturday puck onto Sunday's row's "+ add" — read the caption under the ghost before letting go; drop; read the toast and Sunday's warning list. Undo. Then plant Reaper on Sunday from the PALETTE (Saturday stays). Repeat the drag with Saturday's sole event being (b) an OFT front seat, (c) a duty desk's extras line, (d) a ground row's extras line, (e) a flying seat (the control — works today).
- **Expected:** on the drag, NO "7th day in a row — breaks Sunday" under the ghost in (a)–(e) (after the move Saturday is off; the run stays six), no run warning after the drop, no toast about it. From the palette (Saturday stays): the palette strikes him "7th day in a row — breaks Sunday" and the plant raises the run warning on Sunday.
- **Disproved by:** the caption or toast saying "7th day" on the drag in any of (a)–(d) — or the caption saying it while the drop delta stays silent (the two must agree: "the hover describes the week after the move").

### F2 · [CROWD-SWAP] A man on ANOTHER overlapping programme row is offered as free (the promise's second half)
- **Setup (D and P, Monday, board or edit week):** add a row "SAFETY WALK 08:45–09:15" (+ row), empty. Ranger is on FLIGHT SAFETY STAND-DOWN 08:30–09:00.
- **Action:** tap SAFETY WALK's "+ add" to arm it. Desktop: read the aside; phone: the drawer opens as the picker.
- **Expected:** Ranger struck through with "already on FLIGHT SAFETY STAND-DOWN 08:30–09:00"; the column head's "N free" does not count him; he sits behind the "show anyway" line. Tap him anyway → he plants (everything plants), the warn toast repeats the reason (or the validator's own clash words), Monday's warning list raises the clash, his puck rings red on both rows. Then retype SAFETY WALK to 09:00–09:30 (abutting): Ranger is NOT struck.
- **Disproved by:** Ranger listed free (today), the count including him, or the toast silent while the warning list clashes. On the phone: the reason line under his name missing or clipped while the desktop shows it.

### F3 · [CROWD-SWAP] Dragging a man OFF a programme row: the seat he is leaving must not be called busy
On `main` a programme source key trims to `a:0` and the row's own event to `a:0` as well — every programme row of the day is excluded from the check, and the one he is leaving is described wrongly on other kinds of target.
- **Setup (D, Monday):** Ranger on FLIGHT SAFETY 08:30–09:00. Make four overlapping empty targets: an OFT box 08:30–10:00 (+ sim), a duty desk 08:00–12:00 (+ Block), a ground row 08:30–09:30, and wave 1's flying line whose step window covers 08:30.
- **Action:** drag Ranger from FLIGHT SAFETY onto each target in turn (Undo between): caption → drop → toast.
- **Expected:** the caption never names FLIGHT SAFETY (he is leaving it); if another commitment overlaps it names THAT; after the drop he is on the target and off the row; no clash for the row he left.
- **Disproved by:** "already on FLIGHT SAFETY STAND-DOWN 08:30–09:00" under the ghost while dragging him off it.

### F4 · [CROWD-SWAP] The reported swap — both directions, unpublished and published, mouse and finger
- **Setup:** Monday, board. FLIGHT SAFETY STAND-DOWN: Ranger, plus Reaper (+ add).
- **Action:** drag Reaper onto Ranger's puck (not the +) → swap. Undo. Drag Ranger onto Reaper. Publish Monday (sign the four, Publish). Do both again. On P, the same with a real touch drag on the phone board.
- **Expected:** they swap; nothing under the ghost; no "already on" toast; on the published day the head reads "2 pending" (D109: a swap is two moves) and the pending list shows two lines; the warning list unchanged. Undo → back and "0 pending"; Redo → 2; reload → holds.
- **Disproved by:** the busy toast, a caption naming the same row, a count other than 2.

### F5 · [CROWD-SWAP] The FOURTH consumer nobody names: the green "where can he go" rings
`paintSelRings` (highlights.ts) asks the same busy check for every seat and append cell when a man is selected; it shares the bug and the fix.
- **Setup (D, Edit Schedule = edit mode):** Ranger on FLIGHT SAFETY 08:30–09:00; SAFETY WALK 08:45–09:15 empty; WPNS & TACTICS SYNC 11:30–12:00.
- **Action:** click Ranger's puck (blue).
- **Expected:** SAFETY WALK's "+ add" shows NO green ring (he is busy 08:30–09:00); WPNS's "+ add" green; a seat in the afternoon wave green. Report what his OWN row's "+ add" shows (green is pre-existing on main, where every programme cell was excluded).
- **Disproved by:** SAFETY WALK's "+ add" green — the ring consumer still misses another programme row.

### F6 · [CROWD-SWAP] The duplicate door the fix may open
Today the only voice on "plant him onto a row he is already on" is the busy toast, which the fix silences for the man's own row.
- **Setup:** Monday, Ranger on FLIGHT SAFETY. Check `main` first (§4 step 3) for what each route does today.
- **Action:** (a) palette → drag Ranger onto FLIGHT SAFETY's "+ add"; (b) arm the "+ add", tap Ranger in the palette; (c) drag Ranger's own puck from the row onto the same row's "+ add".
- **Expected:** he is never listed twice on the row; either a plain refusal ("already in that seat" / "already on this row") or one copy quietly kept; a published Monday reads "0 pending" for a no-op.
- **Disproved by:** two Ranger pucks on one row with no word said.

### F7 · [VIEW-ARROW] The five landings that park the day at the scroller's edge, not at the inset
`scrollWeekToDay` (calendar pick, page-switch carry, board close) and `bringIntoView` (a warning tap, "take me to this change") both write the day flush to the week's own left edge. With an inset they land the day UNDER the arrow and rely on the snap to hop it across.
- **Setup (D, View-only Sched):** open Monday's "⚠ N issues" list (click the day's issues line).
- **Action, one path at a time, then measure:** (L5) calendar → pick Wed 15 Jul; (L6) go to Edit Schedule and back (the day is carried); (L7) open the board on Thursday, close it; (L9) scroll so Wednesday hangs half off the right edge, tap a warning on Wednesday's list; (L10) on a published day with pending changes, "take me there" from the pending list while that day hangs half off the right.
- **Expected:** on the landing frame AND after it settles (≥500 ms, no scroll events): the front day's left edge ≥ 46px from the viewport's left; `elementFromPoint(50, 468)` is the day, not the arrow; the issues list's first letters, the row-name column, the FCP puck, the sign-off pills of that day all readable.
- **Disproved by:** a day landing flush at the edge (first ~26px under the arrow) on the landing frame; a visible ~54px hop after landing; or (Edit Schedule) the same on `#eWeek`.

### F8 · [VIEW-ARROW] The arrows and the week crossings, every day to the front, both ways
- **Setup:** D and S (1024×700), View-only and Edit Schedule.
- **Action:** press › seven times (Mon … Sun at the front, then the cross to next Monday), then ‹ back (Sunday at the front on the cross back, then Sat … Mon, then the cross to the previous week's Sunday). Also the four week chips (prev · current · +1 · +2).
- **Expected:** one picture per press; each day's left edge at the inset, beside the arrow; "day 1–2 of 7" reads right with Monday at the front (the label divides scroll by the day step — the inset must not shift it); the proxy bar's thumb follows; Sunday at the front shows the next-week preview beside it, no void.
- **Disproved by:** a day under the arrow; a fraction of a day at the front; the label off by one; two presses needed for one day (the park tolerance broken by the inset).

### F9 · [VIEW-ARROW] The phone is untouched — and only a real iPhone finishes this one
- **Setup (P):** View-only Sched.
- **Action:** on Monday 13 Jul swipe right (back); on Sunday 19 Jul swipe left (forward); an ordinary within-week swipe on a wave-dense day.
- **Expected:** one swipe crosses each way (the edge guard assumes a ~12–20px resting inset — a larger phone padding would need two swipes); no left gutter on the phone; the glide's two clones the same height as before.
- **Disproved by:** a swipe on Monday needing two tries, or any left inset visible at 390. **iPhone-only:** Safari's rubber-band and no-re-snap; put the phone landing on the owner's look card.

### F10 · [LW-RESET] "Greyed when it already follows the default" — by the ORDER, not by whether a list is saved
- **Setup (D, Leave War, `ad`):** Rearrange ON; drag Ranger below the next pilot in his block; drag him back to exactly where he was. Rearrange OFF.
- **Action:** open ⚙.
- **Expected:** "Reset order" greyed (the roster follows the default). Reverse: drag a WSO up among the pilots (he lands at the top of the WSOs — a real change) → enabled.
- **Disproved by:** the line enabled after drag-and-back, and pressing it writes an Undo entry that changes nothing on screen; or greyed while a hand order exists.

### F11 · [LW-RESET] Two arms, not one — and neither reset touches the other's data
- **Setup:** ⚙ open; a custom counter saved (＋ Counter); a hand order exists.
- **Action:** tap "Reset order" once → "Really reset?"; tap "↺ Reset counters" once; then fire "Really reset?" on Reset order. Close, reopen. Then the reverse: arm and fire Reset counters.
- **Expected:** one tap on either never fires the other; the roster reset leaves the custom counter, the event rows, the groups, their colours, who-wins and Show SANS exactly as they were; the counter reset leaves the order; reopening shows both unarmed; "Back to the standard groups" never resets the order.
- **Disproved by:** "Really reset?" appearing on both lines from one tap; a counter lost by the roster reset; the order lost by any other reset.

### F12 · [LW-RESET] Later arrivals and CAT changes follow the default after a reset (the plan's "clear it" versus "freeze today's default")
- **Setup:** hand-arranged roster; Reset order fired.
- **Action:** on Quals, move a man up the CAT ladder (C → A); back to the Leave War. Then add a new person on Quals (the + Add person form is still the door until [ACCOUNTS-NEW-PERSON] is built); back to the Leave War.
- **Expected:** the man moves to his ranked place in his block with no second reset; the new man appears in his ranked place, not at the foot of his seat.
- **Disproved by:** the man staying where the hand order had him (the reset stored a frozen order instead of clearing it), or the newcomer sinking to the end.

### F13 · [PUCK-GLOW] Every ring a "this is you" puck can wear — not only the two the backlog names
On `main` the purple rule's `!important` shadow HIDES the amber advisory ring, the thin hard-red ring and the grey note ring on your own puck (only the chip shows), and the dotted trace ring sits on top of the purple ring AND its purple glow. The ruling's words are "a flagged puck does not glow … like the 2nd puck picture" — every flagged puck looks the same.
- **Setup (D and P, Edit Schedule, `ad`):** make Saber wear, one at a time (Undo between): solid red (plant him on wave 1's front seat AND an OFT box in the same window → C); dashed (a crew-rest breach with `late show` in the remarks); dotted (the previous-day trace of a breach he causes tomorrow); amber (an eaten brief — NB — or a SANS advisory); thin red (any hard flag that is not C/CR/Q/RUN — pick from the warning list); grey note. Put Reaper beside him with the same flag each time.
- **Expected by the promise (solid, dashed):** Saber's ring identical to Reaper's — computed box-shadow `0 0 0 2px <red>` only, no blurred layer; dashed = outline only, gaps show background. **Expected by the ruling's words (the other four): report what Saber shows against Reaper** — a ring hidden on Saber and present on Reaper, or a purple glow under a dotted ring, is a finding to put on the look card as a question, not to wave through as out of scope. Pre-existing on `main`, not demo data.
- **Disproved by:** any blurred layer in any box-shadow on Saber's flagged puck; or Saber's ring missing where Reaper's shows.

### F14 · [PUCK-GLOW] Every surface that draws a flagged "this is you" puck (the roll-call, §2.1), both widths
- **Action:** with Saber solid-red on Monday: the edit week (cockpit, desk, sim, ground, programme, the Unavailable block after filing him leave), View-only Sched (unpublished and a published Monday — frozen rings plus the live ones), the desktop board and the phone board (cockpit, programme, desk/sim/ground, Unavailable), the crew palette (aside, phone drawer, board roster), the ALL AVAIL window (a row with an ALL puck where Saber is listed), the 👁 version look on the week and the board (D187 — the version's own flags), the mouse ghost and the finger ghost.
- **Expected:** the same plain red ring everywhere; the ghost shows the cyan lift box and its depth shadow, red ring, no glow; drop back → "Already in that seat".
- **Disproved by:** one surface glowing, or the ghost losing its lift box.

### F15 · [PUCK-GLOW] The member's own puck
- **Setup:** as admin, make Ranger conflicted on Monday (one write before any reload, §7.7). Sign out, sign in `us`.
- **Action:** View-only Sched, D and P.
- **Expected:** Ranger's puck purple with a plain red ring; Saber's puck (not "you" now) plain; the legend's purple "you" swatch unchanged.

### F16 · [BG-GUARD] Where the hook thinks the shell starts versus where it does
The 26 Sep measurement: a background shell starts in the CHAT's starting folder, not where the foreground shell moved to.
- **Action:** from a chat started at the repo root, foreground `cd raptor-port`, then background `npm run docsize`.
- **Expected:** still refused, and the refusal names the absolute path the shell will start in (the chat's folder). From a chat started inside `raptor-port` (or run the hook with `cwd` ending in `raptor-port`): a bare `npm` allowed. From this worktree's root: refused, naming the worktree path, not the main checkout's.
- **Disproved by:** a `cwd` in the hook input that follows the foreground `cd` — the guard passes a command that then dies in the root; or "undefined" / "REPO ROOT" in the message.

### F17 · [BG-GUARD] The `refusal()` matrix (run as `node --test .claude/hooks/bg-cwd-guard.test.mjs`, plus the new cases)
Allowed: `cd C:\Users\User\projects\Raptor\raptor-port && npm test` · `cd /c/Users/User/projects/Raptor/raptor-port && npx playwright test` · `cd "C:/…/Raptor/raptor-port/" && npm …` (trailing slash) · a path with a space, quoted · `cd -- raptor-port && npm` · `cd ./raptor-port` · `cd ../raptor-port` (from a sibling) · `Push-Location raptor-port; npm test` (refused today — not in the list) · `npm --prefix ./raptor-port run build`. Refused: `cd raptor-port/docs && npm` and `cd raptor-port-old && npm` (contains, does not END in) · `cd "$RP" && npm` (unknowable — the message says why) · a bare `npm` with `cwd` at a root. Known and stated blind spots: `cd raptor-port; cd ..; npm test` (moved in, then out) passes; `echo "run npm later"` is refused (pre-existing false refusal). Measure, do not assume: a bare `npm run docsize` backgrounded from `raptor-port/scripts` — npm walks up to the package.json, so decide whether a `cwd` INSIDE raptor-port counts as "in".

### F18 · [LW-RESET] Undo, redo, reload, war switch, Rearrange on, SANS on
- **Action:** hand order → Reset → top-bar Undo → Redo → reload → switch war in the Period picker and back. Then Reset while Rearrange is ON and Show SANS is on.
- **Expected:** Undo brings the hand order back (report the bubble's words — today a Leave War setting reads "Undid: a change to the leave board"; AM39b asks it to say what it did); Redo resets; reload keeps the default; the same order in every war (it is world-level); with Rearrange on the grid redraws ranked with the ⠿ handles and the widened name column intact, SANS ranked at the foot; the first drag after a reset picks up the live default.
- **Disproved by:** Undo not covering it; reload restoring the hand order (an empty list treated as "nothing stored").

### F19 · [VIEW-ARROW] The other edge-docked controls, measured, and the resize crossing
- **Action:** at D and S measure every fixed control against what it covers: › (right 8) over the last visible column / the preview's first column; the proxy bar at the foot; on Edit Schedule the rail (z 151) versus the › arrow (z 150) — `elementFromPoint` at the arrow's centre must be the arrow. Resize 1440 → 780 → 1440 without a reload.
- **Expected:** the ‹ arrow covers nothing on the front day at either height; the › arrow clickable on both pages; after the resize the inset and the arrows follow the width. Report the › overlaps as observations (not in the promise).

### F20 · [CROWD-SWAP] Negatives that must still hold, one walk each
SC AM MAIN → SC AM SPARE drag: caption clear, swap lands; a plain plant of the MAIN man onto SPARE still says "already on SC AM MAIN 07:00–13:00". AVALON MAIN → AVALON desk: clear. Desk holder ↔ his extras line, ground name ↔ its extras, sim front seat → its pax line: silent as today. A man on an ⓘ programme row armed elsewhere: never busy. Monday's warning list wording after F2's plant identical to `main` (the fix is in the picker; "not his call unless the fix changes what a warning says elsewhere").

---

## 2. Roll-calls, doors, orders, ripples — per item

### 2.1 [PUCK-FLAG-GLOW] — the thing: a puck that is BOTH "this is you" and flagged
The purple class is hung after every repaint on every `.puck[data-person]` in the document (highlights.ts), so the question per drawer is only "can this puck carry a ring".

| # | Where a puck is drawn | Can be "you" | Can be flagged | Answer |
|---|---|---|---|---|
| 1 | Edit week — flying seat (`slotCell`) | yes | yes (sev/flag/dash/trace) | walk |
| 2 | Edit week — duty desk holder + extras | yes | yes | walk |
| 3 | Edit week — sim seats + pax | yes | yes | walk |
| 4 | Edit week — ground row name + extras | yes | yes | walk |
| 5 | Edit week — Common Programme crowd | yes | yes | walk |
| 6 | Edit week — Unavailable block's puck (a man on leave, also planted) | yes | yes (day flag) | walk |
| 7 | View-only Sched — 1–6 read-only; a published day's frozen rings + live ones (D183–185) | yes | yes | walk, published and not |
| 8 | Desktop board — cockpit `sbSlot`, programme inline builder, desk/sim/ground rows, Unavailable | yes | yes | walk (two of these were the OIL-build holes) |
| 9 | Phone board — the same | yes | yes | walk |
| 10 | Board OIL mode pucks | yes | never (flags not passed) | NO-because — but note: the purple `!important` shadow hides the green OIL ring on your own puck (pre-existing; report) |
| 11 | Crew palette (Edit aside, phone drawer, board roster) | yes | yes (sev/chip) | walk; note the busy/no inset stripe is lost under the purple rule (pre-existing) |
| 12 | ALL AVAIL window (`personPuckHTML`) | yes | its flag is a red/amber WORD on the wrapper, plus whatever ring its builder emits | walk and answer |
| 13 | 👁 version look (`.pv-frozen` + D187 flags), week and board | yes | yes | walk |
| 14 | Mouse ghost `.dragimg` / finger ghost `.tdghost` (clones) | yes | yes | walk: cyan lift + depth shadow, no glow |
| 15 | Next-week preview | never (no `data-person`) | never | NO |
| 16 | Inputs calendar / Medical view pucks | yes | never | NO-because |
| 17 | Print, CSV, pending list, History bubble, warning-list crew names, the "you" legend swatch | no pucks / a swatch | — | NO |
| 18 | Leave War `tr.me` row (its bar's glow, 6 Sep 26 — wanted) | not a puck | — | must NOT be touched by a "remove glow" sweep; one picture |

**Orders:** flag on → you → flag off; you → flag on; select a chip (purple yields, ring stays) → clear; publish → unpublish; undo/redo; reload. **Ripples:** the builder's `flagglow-css.test.ts` should walk every `me` ring rule; break test: add a blur to `.puck.me.boxred` → red.

### 2.2 [LW-RESET-ORDER] — doors and states
**Door:** Leave War → top row Manning · ⚙ · Rearrange · OIL (admin) → ⚙ → the line. **Who:** admin only; Ranger (`us`) sees Manning · OIL and has no door (walk once, picture). **States:** greyed (follows the default) / enabled / armed "Really reset?" / disarmed on close and, like Reset counters, on leaving the sheet. **Must not disturb:** ＋ Counter, ± Event row, Show SANS, ↺ Reset counters and its own arm, the groups list and its drag, the colour palette, Who wins, "Back to the standard groups". **Phone:** the sheet's new line reachable and tappable at 390; its hint reads production copy (no "prototype"). **Orders:** F10/F11/F12/F18. **Ripples:** persisted key `rosterorder`; the one Undo through the `lw.config` collection; grouping is NOT order — drag a category heading with the roster at default → the line stays greyed and Reset order never moves a group.

### 2.3 [CROWD-SWAP-SAYS-BUSY] — every consumer of the busy check, every route into a crowd
**Consumers of `slotBar`:** (1) the caption under the dragged ghost (mouse and finger, with the from-seat); (2) the fallback drop toast after the write (`barDrop`); (3) the palette while a slot is armed — the strike, the reason line, the "N free" count, the column's "show anyway" line, the sort rank; (4) the palette tap's toast (`placeArmed`); (5) the green selection rings (`paintSelRings`). **Not a consumer (negative, checked):** the ALL AVAIL window (it reads the warnings, not the picker); the validator itself. **Targets a man can be dropped/armed into:** flying seat · SC MAIN/SPARE · AVALON/BB seat · desk holder · desk extras (`+` / overflow) · sim front/rear · sim pax · sim extras · ground name · ground extras · programme person seat · programme "+ add" · a request row · the Unavailable reassign (`iu:`). **Sources:** the palette (no from-seat) · a seat of the same row · a seat of another row of the same kind · a seat of another kind · a seat on another day (F1). **Orders:** each swap both ways; unpublished then published (D109 counts); undo/redo/reload. **Ripples:** the SC/AVALON same-hours walks compare full seat and desk keys — untouched by a programme-key fix (F20); the cross-day answer is cached per (man, key, from-seat) until the next validate — a stale cache would show as F1 passing once and failing after an edit; `restIfPlaced` strips the from-seat from the day's `events` by raw key too — crew rest reads flying legs only, so no visible effect (say so).

### 2.4 [VIEW-ARROW-OVER-LIST] — every landing path, every edge-docked control
**Landings (the front day must sit beside the arrow after each):** L1 ‹ one day · L2 › one day · L3 › past Sunday → next Monday · L4 ‹ on Monday → previous Sunday · L5 calendar day pick · L6 page switch carrying the day (View↔Edit, and via Inputs) · L7 board close carrying the board's day · L8 next-week preview click (lands at the SAME x, not the front — check the resulting front day) · L9 warning tap that pans a half-off day to the front · L10 "take me to this change" · L11 the palette's ‹ › day arrows (they point the palette, never scroll the week — negative) · L12 proxy-bar drag, shift+wheel, trackpad pan (free positions → the snap parks at the inset) · L13 boot · L14 in-place repaint (edit, undo) holds position · L15 the 👁 look holds · L16 the week chips. **Edge-docked controls to measure against, both pages, D and S:** ‹ (left 8, 38×70 at 52%), › (right 8), the proxy bar (bottom), the rail and the palette aside (Edit only), the ALL AVAIL window's default dock, the pending-list pop-up, the sticky top bar. **What the ‹ arrow can cover on the front day:** the opened issues list, the row-name column, the FCP puck, the sign-off pills ([AMEND-SMALL-SEEN] item 4), the day note. **Ripples (each must be padding-blind):** the palette's day-follow and the carry both read "the day nearest the week's left edge" (fine at a snapped inset; the flip point is the midpoint); "day a–b of 7" divides scroll by the step; the trailing tail rounds the far end to a whole day using the right padding only; the scroll ceiling is (days−1)×step; the phone's edge-swipe slop; the geometry e2e that measures the carried day's scroll. **Test to add (§6, the floating-surface rule inverted):** after each landing path, assert the element at the front day's first line is the day, not the arrow.

### 2.5 [BG-GUARD-FALSE] — the notes that carry the wrong sentence
`raptor-port/CLAUDE.md` §Build & verify (the "REPO ROOT" block), `.claude/rules/raptor-executor.md` ("A backgrounded job starts at the REPO ROOT"), `raptor-port/docs/file-map.md` (the hook's row), the hook's own header comment and refusal text, and `docs/gates-and-deploy.md` line 81's trap (b) — a dated measurement; annotate rather than delete. The hook must still exit 0 on garbage, on a missing `cwd`, and for foreground commands.

---

## 3. Explicit negatives — looked, expect nothing
- The next-week preview draws pucks with no `data-person` and no ring classes: it can never be "you" or flagged.
- The Leave War's own "you" row glow is a different, wanted glow; nothing in item 1 reaches `#page-leavewar`.
- The ALL AVAIL window does not call the busy check; item 3 cannot change what it lists.
- The SC and AVALON same-hours checks compare full seat/desk keys; a programme-key fix does not touch them.
- Abutting programme rows (08:15–08:30 then 08:30–09:00) never clash — the seed's rows are safe; every overlap in this design is made through + row / a retyped time.
- Item 4's tail spacer, scroll ceiling and "day a–b of 7" label are all computed from the day step and the right padding — a left inset changes none of them by arithmetic; F8 still measures it.
- The palette's ‹ › day arrows never scroll the week.
- Reset order is world-level (one order for every war) — nothing per war to test; and it never moves a group heading.
- The hook's regex on `main` already accepts a full POSIX or Windows path ending in `raptor-port` — the accounts chat's refusal is not reproduced by the shape the backlog quotes; F16/F17 look for the real cause (the `cwd` assumption and `Push-Location`) rather than re-fixing the path match.
- Nothing in the five items touches money, the published record's content, permissions or persistence of scheduler data — D56 does not arise anywhere here.
