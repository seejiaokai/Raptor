# M3 walk — Walker A (the bid windows and the remarks) — §6 lines 1–11

Build: the served `dist` (commit addf330a5), port 4301, then stopped by its port (no listener left). Scripts: `raptor-port/scripts/handpass/lw-m3-walk-a-lib.mjs`, `lw-m3-walk-a1`…`a10` (a1 s1, a2/a2b s2, a3 s3, a4 s4+s7, a5 s5, a6 s6, a8 s8, a9/a9b s9, a10 s10+s11). Pictures: `raptor-port/docs/img/handpass/2026-10-24-lw-m3/A/` (285 files; names below drop that folder and `.png`). Names: `s<n>-dk-` desktop Chromium 1440×900, `s<n>-ph-` phone Chromium 402×874 touch, `s<n>-ph-wk-` phone WebKit, `s<n>-dk-wk-` desktop WebKit; a trailing `-q` is the picture ~100 ms after the lift with the pointer left where it pressed; the plain name is the settled one. Console errors, page errors and 4xx: none in any run.

Worlds: sign-in on the plain address (real storage) in a fresh browser context for every scenario; a member is `us` with `lwSetMemberToday('2026-02-15')` (the demo's open stretch is 15 Feb–31 Mar), the admin `ad`. A reload is a real reload, then sign in again (the app shows the login page after a reload, both times). Required P for scenario 2 was typed through the Required cell (desktop: its box; phone: the number pad). Nothing was injected; the stored records were only READ (to see the `lw` tag).

## Results

| # | Size | Engine | Verdict | Pictures | What they show |
|---|---|---|---|---|---|
| 1 a window opens: day line, eight buttons, two rows of four, hollow | desktop | Chromium | PASS | s1-dk-01-open | Ranger, Fri 20 Feb: "Available P 28 → 27 / No manning row turns amber or red"; Date, Duration, Document, Remarks (grey "till 20 Feb" with a tick), Which leave LL OL OIL CCL / FCL PL EL CL, each dashed and empty, each with "0" |
| 1 | phone | Chromium | PASS | s1-ph-01-celltap-q, s1-ph-01-open | same, 378 wide window at the foot; buttons in two rows of four at the same y (781 and 817); all eight hollow |
| 1 | phone | WebKit | PASS | s1-ph-wk-01-open | same; rows 28/28/30/32/79 px high (Chromium 30/30/30/31/86) |
| 1 b Duration AM moves the line .5 | all three | | PASS | s1-ph-03-ll1-q (window, AM lit, "28 → 27.5"), s1-dk-02-am | line reads 28 → 27.5 |
| 1 c LL: below-zero note, then pending box | all three | | PASS | s1-ph-03-ll1-q, s1-ph-04-ll2-q, s1-dk-05-cell-pending, s1-ph-wk-04-ll2-q | tap 1 keeps the window open, buttons gain "<", amber line "That takes Ranger to -0.5 LVE. Tap the same leave again to go ahead."; tap 2 closes it; the cell is the dashed amber LL half-box, "LVE -0.5 · 0.5 pending" |
| 1 d reload → still there | all three | | PASS | s1-dk-06-after-reload | dashed LL box still in the cell after reload + sign-in again |
| 2 a day line says Available P red | desktop, phone | Chromium | PASS | s2-ph-01-open | "Available P 28 → 27 · red", the whole line red |
| 2 b bubble under Manning | desktop, phone | Chromium | PASS | s2-ph-04-bubble, s2-dk-04-bubble | "This bid turns Available P red." under the Manning button, "1 red ›" beside it; Manning rows opened by themselves on the phone |
| 2 c Manning off screen → bubble at the foot | phone | Chromium | PASS | s2b-ph-04-bubble, s2b-ph-05-show-q, s2b-ph-05-show | grid scrolled so Manning is above the screen: "This bid turns Available P red.  Show ›" at the foot (y 816–862 of 874); Show takes the page to the top, Manning open, Required P 28 / Available P 27 in view, foot note gone |
| 3 a tick on, buttons filled | desktop, phone | Chromium, WebKit | PASS | s3-dk-01-open, s3-ph-01-open, s3-ph-wk-01-open | "Approve what I enter" ticked in the title bar before ✕; all eight buttons filled in their kind's colour |
| 3 b LL → approved box and an Input with `lw` | all four | | PASS | s3-dk-04-cell-approved, s3-dk-05-inputs-after | filled LL box; stored inputs 50 → 51, the new one carries `lw:"y2026"`, type LL, date Feb 24; the Inputs list shows "Ranger 24 Feb LL … By Saber now No document" (on a phone read from the stored record; the phone list was not scrolled to the card) |
| 3 c one Undo takes both back, grid where it was | all four | | PASS | s3-dk-08-after-undo, s3-ph-07-undo-q | toast "Undid: placing and approving leave"; cell empty; stored inputs back to 50; page and grid scroll position identical before and after |
| 3 d Redo puts both back | all four | | PASS | s3-dk-10-after-redo, s3-ph-10-after-redo | approved LL box back, input back (51, one with lw) |
| 4 a untick | desktop Chromium, desktop WebKit, phone WebKit | | **FAIL** (see Fault 1) | s4-ph-wk-01-untick-q | the press on the tick does nothing; Space key unticks |
| 4 a untick | phone | Chromium | PASS | s4-ph-01-untick-q, s4-ph-02-unticked | touch tap unticks; buttons go hollow and dashed |
| 4 b unticked LL → pending, no Input | all (after Space where the press failed) | | PASS | s4-ph-05-cell, s4-dk-05-cell | dashed pending box; stored inputs unchanged (50 → 50) |
| 4 c close and reopen → ticked again | all (same note) | | PASS | s4-ph-06-cross-q, s4-ph-07-reopened | unticked, ✕, reopen: ticked again |
| 5 range across a locked week | — | — | **NOT RUN** | — | a locked week is a stored week the app cannot read; no control makes one (the 13 Oct 26 walk ledger line says the same: "a locked week — carried by a test"). Not injected. |
| 5 (nearest reachable) ticked range 1–3 Jan across a day already holding OL | desktop, phone | Chromium | PASS, but see Observation 3 | s5-dk-03-range-picked, s5-dk-06-result, s5-ph-06-result | 2 Jan LL approved (stored inputs 50 → 51), 3 Jan LL approved beside its OIL half, 1 Jan (the OL) untouched; window stays open reading "1 day not written: already holding leave or a medical." The refused day is counted, not named; no pending bid was left for it |
| 6 drag across three people, ticked | desktop, phone (held touch drag) | Chromium | PASS | s6-dk-01-selection, s6-ph-01-selection, s6-ph-04-after | window "Reaper, Anvil, Cinch · 25 Feb 26 – 26 Feb 26 · 2 days" with the tick; LL (note "That takes Reaper to -2 LVE, Anvil to -2 LVE and Cinch to -2 LVE. Tap the same leave again…") then 6 filled approved boxes, 3 `lw` inputs |
| 6 one Undo / Redo | desktop, phone | | PASS | s6-ph-06-after-undo, s6-dk-06-after-undo, s6-ph-07-redo | one Undo removes all six boxes and the three inputs (toast "Undid: placing and approving leave"); Redo restores them |
| 7 below zero | desktop, phone | Chromium, WebKit | PASS | s4-ph-11-anvil-ll1-q, s4-ph-13-anvil-cell | Anvil's LVE is 0 in this demo (not −1.5): LL → "That takes Anvil to -1 LVE. Tap the same leave again to go ahead.", nothing placed; tap again → filled approved LL box |
| 8 phone: low cell scrolls above the window | phone | Chromium, WebKit | PASS | s8-ph-t820-1-tap-q, s8-ph-t820-2-open, s8-ph-wk-t820-2-open | Diesel's cell tapped at y 560, 700 and 820: each time the page scrolls so the cell ends at y 442–463 (Chromium) / 458–479 (WebKit), the window's top at 471 / 487; cell wholly above, window not covering it |
| 9 "Date" / "Duration" | desktop, phone | Chromium | PASS | s9-dk-01-oneday-empty, s9-dk-02-oneday-held, s9-dk-03-select, s9-dk-04-inputs-window, s9-dk-05-inputs-custom | one-day window: Date, Duration; window on a held leave: Date, Duration; drag window: Duration; Inputs "New input": Duration (All day / AM / PM / Custom); "How many", "How much", "When", "How much of the day" appear nowhere |
| 10 a remarks, then Pick a range | desktop, phone | Chromium, WebKit (phone) | PASS | s10-dk-10a-remarks-then-range, s10-dk-10a2-reopened | "passport" typed, range 5–9 Mar picked: grey date goes "till 5 Mar" → "till 9 Mar", ticked; placed and reopened: remarks and "till 9 Mar" kept |
| 10 b Pick a range, then remarks | same | | PASS | s10-dk-10b-range-then-remarks, s10-dk-10b2-reopened | range 17–20 Mar then "visa": "till 20 Mar"; kept after placing |
| 11 a untick till | same | | PASS | s10-dk-11a-unticked | remark "dentist", tick off: date struck through |
| 11 b approved → Inputs page | desktop, phone | Chromium, WebKit | PASS | s10-dk-11b-inputs, s10-ph-11b-inputs | desktop list: "dentist" with no till, the ticked control "checkup till 24 Mar"; phone cards: remark only in both (the run's end shows in the corner of both cards, which is the range, not the tick) |
| 11 c put it back to a bid | desktop, phone | Chromium, WebKit | PASS with Observation 2 | s10-dk-11d-after-putback | the Decide row has no control that makes a waiting bid (Ack is gone). **Refuse** is the one way off the Inputs: the cell goes refused (struck), the input is removed, and the reopened window keeps remarks "dentist" and the unticked, struck date |

## Faults

**Fault 1 — "Approve what I enter" cannot be unticked with a mouse click (desktop) or a tap in WebKit (the iPhone's engine).** Chromium phone touch works.
- Steps (desktop): sign in as admin, open any empty day (a click on Ranger's 24 Feb), click the small tick in the title bar (or its words). Seen: nothing changes, it stays ticked, the buttons stay filled; the page reports `pointerdown` on the tick, then the click lands on the title bar instead of the tick. Expected: it unticks, buttons go hollow/dashed (scenario 4). Pressing Space with the tick focused does untick it. The ✕ beside it takes a click normally.
- Steps (phone WebKit): same, tapping the tick (box 12×12 px, words 117×12). Seen: pointer and touch events arrive, no click is made, nothing changes; the ✕ tap right beside it does click.
- Same at every size in desktop Chromium and desktop WebKit (mouse), and in phone WebKit (tap). Pictures: s4-ph-wk-01-untick-q (WebKit, still ticked right after the tap), s4-ph-wk-02-unticked (after Space), s4-ph-02-unticked (Chromium touch: unticked, hollow dashed buttons). Because his iPhone is WebKit, scenario 4 cannot be done by a finger on that engine; scripted tap = Playwright touchscreen.tap, the nearest to his phone available here.
- Related sizes: the tick's box is 13×13 (12×12 WebKit) and the ✕ 19×17, both on screen and not overlapping at 402 wide; both far under a finger-sized target.

## Observations (not faults — for the host to judge)

1. **Phone window vs the drawings (`r9-remarks-bid-phone.png`, `r7-12-bid-admin-phone.png`, opened beside `s8-ph-window-zoom`).** (a) In the drawings the day line ("Available P 24.5 → 23.5 · red") sits in a full-width rounded bordered box; in the built window it is plain text with no border or fill (measured: border 0, no background, 352 wide × 16 high a line). (b) In the drawings the "Which leave" label stands to the left of the two rows of buttons; built, the label sits on its own line above full-width buttons (label 14 + grid 66 = 86 px). Rows built at 402 wide (Chromium): title bar 37, day line 34 (two lines), Date 30, Duration 30, Document 30, Remarks 31, Which leave 86, Also 43; window 378 wide, 389 high for an admin, 342 for a member.
2. **No way to put an approved leave back to a WAITING bid** (scenario 11's "put it back to a bid"): the Decide row is Approve · Refuse only (pressing the lit Approve changes nothing); Refuse is the only action, and it leaves a refused request. The remark and the untick do come back on it.
3. **Range with a day the approval refuses (scenario 5, nearest reachable):** the words are "1 day not written: already holding leave or a medical." — they count the days, they do not name them (the spec's example names the day: "3 Feb is on a locked week — not approved"), and the refused day is not left as a pending bid.
4. Quick (~100 ms) pictures after a phone tap show a "Saving…" pill drawn over the OIL tab / gear at the top right for a moment (s1-ph-04-ll2-q, s3-ph-07-undo-q, both engines). It is gone in the settled picture.
5. The bubble "This bid turns Available P red." covers the first month buttons (JAN–JUN on the phone, JAN–APR on the desktop) while it is up (s2-ph-04-bubble, explore picture of the desktop in s2-dk-04-bubble).
6. WebKit phone: when the window opens under the finger the button beneath it keeps a light "hover" ring (the PO button in s8-ph-wk-t820-2-open); not seen in Chromium. On a phone the three-person drag window's title wraps to three lines ("Reaper, / Anvil, / Cinch", s6-ph-01-selection).
7. The demo's Anvil reads LVE 0, not −1.5 as scenario 7 says; the "tap again" path was walked on him and on others at 0 (they go to −1/−2).
8. Mid-scroll picture after Show (s2b-ph-05-show-q): the frozen date row is drawn twice (one pinned, one in flow) for a moment while the page scrolls up; the settled picture is right.

## Not done / limits

- Scenario 5's locked-week premise (NOT RUN, above).
- The phone Inputs list was not scrolled to the Ranger LL card in scenario 3 (stored record read instead); it was scrolled to in scenario 11 (s10-ph-11b-inputs).
- Desktop WebKit was run only for scenario 4 (to settle Fault 1); phone WebKit for 1, 3, 4, 7, 8, 10, 11.
- Row measures and pictures were not compared pixel-for-pixel with the drawings; differences listed above are what showed on measurement and by eye.
