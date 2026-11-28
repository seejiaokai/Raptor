# Walker A — [LW-POSTIN-BALANCE], the DESKTOP (1536 x 860 at 1.25), admin and member — 27 Nov 26

Script: `raptor-port/scripts/handpass/lw-postin-build-a.mjs` (v5; each scenario a fresh browser context on real storage,
the war's today pinned to Thu 26 Nov 26; assertions written as the RIGHT behaviour). Drawing comparer:
`raptor-port/scripts/handpass/lw-postin-build-a-drawcmp.py`.
Pictures: `raptor-port/docs/img/handpass/2026-11-27-lw-postin-build/a/` (the cited run, 91 pictures + `results.json`).

## Which build, which run (read this first)
- **The served build changed under the walk at 02:24** (host commit 1759fce23, bundle `index-BFMVIReF.js` — "the person
  window's empty boxes take the dashed amber edge"). My development attempts before that ran on `index-CO3aF0BP.js`.
- **The cited run** is the full unfiltered run into `a/` (started about 02:29, wholly on `BFMVIReF`), plus three
  re-runs of steps whose SCRIPT was wrong, each in its own folder, also on `BFMVIReF`:
  `a/only-s7,s8/` (s7.6 history, s8.9 read fixed), `a/only-s9/` (drawing check with the list scrolled to its top),
  `a/only-s10/` and `a/only-s10-asLynx/` (the small-kind edge, below).
- Earlier attempts, NOT cited for any verdict: `a/only-s1/`, `a/only-s2,s3/`, `a/only-s2,s4,s5/`, `a/only-s4,s6,s7,s8/`.
  They hold one useful sighting: on the OLD build, a man with LVE typed and CCL/FCL/PL/EL/CL never typed had those five
  boxes in his person window EMPTY with a plain grey edge (not the dashed amber), while the Balances page showed them
  dashed amber — `a/only-s1/s1-02-lynx-24-pw.png` beside `a/only-s1/s1-02-lynx-24-bal.png`, and
  `a/only-s2,s3/s3-07-back-twice-pw.png`. That is the fault fixed at 02:24; on the new build it no longer reproduces
  (s8.5c, s10.0–s10.3 PASS, and every `*-pw.png` of the cited run shows the dashed amber edge — measured by pixel).

## Totals (cited run + script-fix re-runs)
10 scenario groups walked, 70 checks: **62 PASS, 0 FAIL of the app, 7 RECORD, 1 NOT WALKED**, plus the drawing check's
**2 differences over about 2px** to put to him (below). No console errors, page errors or failed requests in any run.

## The scenarios

### s1 — his example, both orders; the post-in day; the post-in date moved, Undo/Redo — PASS (14), RECORD (1)
Lynx and Pelican added on Admin → Users, post-in Mon 7 Dec.
- s1.0 PASS — a tap on Wed 2 Dec (before his post-in) opens the Post in sheet; "Place leave or OIL here instead…" hands
  the day to the leave window; LL placed approved. `s1-01-lynx-postin-sheet`
- s1.1 PASS — Lynx: LL 2 Dec first, THEN 24 typed → Official 24 / War 24, Balances and window agree. `s1-02-lynx-24-bal`, `-pw`
- s1.2 PASS — Pelican: 24 typed THEN LL 2 Dec → 24 / 24. `s1-03-pelican-24-*`
- s1.3 PASS — both 2 Dec leaves still drawn on the grid ("LL"). `s1-04-grid-2dec`
- s1.4, s1.5 PASS — LL on the post-in day Mon 7 Dec is deducted: 23 / 23 each. `s1-05-*`, `s1-06-*`
- s1.6 PASS — the grid figure beside each name reads 23.
- s1.6r RECORD — the grid's second line (leave used) reads **2** for each: it counts the 2 Dec leave before post-in as
  well as 7 Dec (grid reads "23 / 2"). Deliberately unchanged reader per the brief; picture `s1-04-grid-2dec` shows the
  same second line at "1" before the 7 Dec leave.
- s1.7 PASS — the Post in sheet's own calendar moved both post-in dates to Mon 30 Nov. `s1-07-*`, `s1-08-*`
- s1.8 PASS — Lynx (his figure typed AFTER the 2 Dec leave): 23 stays — the 2 Dec leave is not taken again.
- s1.9 PASS — Pelican (typed BEFORE the 2 Dec leave): 22 — 2 Dec now after his post-in, deducted. `s1-10-*`
- s1.10 PASS — Undo (top bar) puts Pelican's post-in back to 7 Dec: 23 on both surfaces without a reload. `s1-11-*`
- s1.11 PASS — Redo: 22. `s1-12-*`
- s1.12, s1.13 PASS — post-in moved to Thu 10 Dec: the 7 Dec leave now before post-in → both back to 24. `s1-13-*`, `s1-14-*`

### s2 — a leave across the post-in date; halves — PASS (4), RECORD (1)
- s2.0 PASS — a drag across Kite's Thu 3 – Wed 9 Dec opens the drag window ("3–9 Dec · 7 days"), one LL placed. `s2-01-drag-window`
- s2.1 PASS — post-in 7 Dec, 24 typed first → **21** (only 7, 8, 9 Dec deducted), both surfaces. `s2-02-kite-across-*`
- s2.2 RECORD — the days before post-in still drawn as part of the bar (3, 4, 7, 8, 9 Dec all carry LL). `s2-03-grid-across`
- s2.3 PASS — Plover LL **AM** Fri 4 Dec (before post-in) → 24. `s2-04-plover-am-4dec-*`
- s2.4 PASS — Plover LL **PM** Mon 7 Dec (the post-in day) → **23.5**. `s2-05-plover-pm-7dec-*`

### s3 — a man away twice (the fault both designers found — FIXED, confirmed) — PASS (8)
Hawk, post-in Mon 5 Jan 26, 24 typed, LL Mon 13 Apr approved.
- s3.0 PASS — 23 before he goes (13 Apr inside his stint). `s3-01-*`
- s3.1 PASS — bid window ⋯ → Post out, Overseas Sqn, from Wed 1 Apr ("On 1 Apr: archived."). `s3-02-postout-1apr`
- s3.2 PASS — Admin → Users → Archived → Restore, post-in Mon 1 Jun. `s3-03-restore-1jun`
- s3.3 PASS — back once: **24** (13 Apr a day away). `s3-04-back-once-*`
- s3.4, s3.5 PASS — posted out again from Tue 1 Sep; Restored with post-in Mon 2 Nov. `s3-05-*`, `s3-06-*`
- s3.6 PASS — back twice: still **24** — the FIRST gap's 13 Apr still not deducted. `s3-07-back-twice-*`
- s3.7 PASS — after a reload: 24. `s3-08-after-reload-*`
- (Seen: his window's "taken" read "1 taken" before he left and "0 taken" once back — the excluded day leaves "taken" too.)

### s4 — a SANS man hidden from the war (the other fault both found — FIXED, confirmed) — PASS (4), RECORD (1)
Gull (with a sign-in), post-in 7 Dec; LL 2 Dec approved through the Post in sheet; 24 typed; bid LL Tue 15 Dec pending.
- s4.0 PASS — on the war: Official 24, Pending 1 (window shows "−1"), War 23. `s4-01-shown-*`
- s4.1 PASS — SANS ticked on Quals (Edit mode), "+ SANS" off in ⚙: he has no row on the grid. `s4-02-quals-sans`, `s4-03-sans-off`
- s4.2 PASS — hidden: Approvals' LVE BAL on his 15 Dec line reads **23** (2 Dec still not deducted). `s4-04-approvals-hidden`
- s4.3 RECORD — signed in as Gull while hidden: **no My leave on his top row, and he is not on the Balances page**, so
  his own figures cannot be read anywhere by him. `s4-05-gull-signed-in-hidden`, `s4-06-gull-balances-hidden`. Not part of
  this change's promise; likely how a hidden SANS man has always looked — for the host to weigh.
- s4.4 PASS — "+ SANS" on again: Official 24, War 23 on both surfaces — the switch moves no figure. `s4-07-sans-on`, `s4-08-shown-again-*`

### s5 — a day after posting out; pending bids before post-in through Approve — PASS (4)
- s5.1 PASS — Swift (post-in today, 24) posted out Overseas Sqn from Mon 7 Dec (not yet run); LL Tue 8 Dec approved →
  **23** (D1541: still deducted). `s5-01-postout-7dec`, `s5-02-swift-after-po-*`
- s5.2 PASS — Tern, post-in 7 Dec, 24: bids LL 2 Dec and LL 8 Dec → Pending **1**, War **23** on both surfaces. `s5-03-tern-bids-*`
- s5.3 PASS — Approvals: his two lines, LVE BAL 23 on both. `s5-04-approvals-tern`
- s5.4 PASS — both approved by their Approve buttons → Official 23, nothing pending, War 23. `s5-05-approvals-approved`, `s5-06-tern-approved-*`

### s6 — the below-zero question waits for a figure — PASS (6), RECORD (1)
Wren never typed; Finch 0 typed.
- s6.0 PASS — a 0 typed saves as a typed figure (Official 0, War 0, no amber). `s6-00-finch-0`
- s6.1 PASS — one-day window, Wren LL Wed 9 Dec: placed at the first tap, no question. `s6-01-wren-day-after-first-tap`
- s6.1r RECORD — Wren's LL button read "−1" before the tap (deliberately unchanged "left").
- s6.2 PASS — Finch: "That takes Finch to −1 LVE. Tap the same leave again to go ahead." and the leave waits. `s6-02-finch-day-after-first-tap`
- s6.3 PASS — drag window, Wren 14–16 Dec: placed at the first tap. `s6-03-wren-drag`
- s6.4 PASS — drag window, Finch 14–16 Dec: "That takes Finch to −3 LVE…". `s6-04-finch-drag`
- s6.5 PASS — one drag over five rows (Finch … Wren, 21–22 Dec): the question names **Finch only** — not Wren, nor
  Talisman (a demo man never typed). `s6-05-both-drag` (also shows Wren's grid figure "−4" in red: unchanged reader).

### s7 — the first figure, the carried box, Undo/Redo, the history — PASS (6), RECORD (1), NOT WALKED (1)
(cited: `a/` for s7.0–s7.5; the re-run `a/only-s7,s8/` for s7.6)
- s7.0 PASS — never typed: both LVE boxes empty, dashed amber; War bal "Not typed". `s7-00-never`
- s7.1 RECORD — carried fwd typed first: refused at its box with a tag **"Type the Official bal first"** (pink words
  rgb(255,179,185) on a dark red fill, hanging under the box; the box ringed cyan). `s7-01-cf-first`. New words — the
  scenario designers' S4 (not drawn, not word-reviewed): for his disposition.
- s7.1b PASS — the refusal saved nothing (still "Not typed").
- s7.2 PASS — Official 0 typed → saved, War 0, amber gone. `s7-02-zero`
- s7.3 PASS — Undo (top bar) → back to never typed (empty dashed boxes, "Not typed"). `s7-03-undo`
- s7.4 PASS — Redo → 0. `s7-04-redo`
- s7.5 PASS — 24 then carried 2 → 24 / 2 / 24. `s7-05-24`
- s7.6 **NOT WALKED** — the change history line. Edit Schedule's changes window opens on the loaded week (13 Jul) and the
  week's › stepped only to 10 Aug in 30 presses; the balance lines (dated the typing day, 26/27 Nov) were never in view.
  `only-s7,s8/s7-06-history` shows "No changes this week yet." No verdict — another route to that week is needed.

### s8 — the looks, admin and member — PASS (12), RECORD (1)
(cited: `a/`; s8.9 from the re-run `a/only-s7,s8/`, its read fixed — the first run read a test id a read-only figure does not carry)
- s8.1 PASS — Balances (admin): "Only leave after post-in is deducted." once, above the rows (13px, grey rgb(154,164,178)). `s8-01-balances-admin`
- s8.2 PASS — heading "OFFICIAL BAL"; "App bal" nowhere on the page.
- s8.3 PASS — Days taken view: no line. `s8-03-days-taken`
- s8.4 PASS — never-typed Lark's window: label "Official bal", boxes empty, War bal "Not typed" in amber
  rgb(242,200,121) inside the tile, the one line under the LVE box. `s8-05-lark-window`
- s8.5 PASS — his Balances row: empty dashed boxes, "Not typed". `s8-04-lark-row`
- s8.5b PASS — Balances boxes LVE and CCL: dashed rgba(242,200,121,.8) (control: Ranger's typed box solid grey).
- s8.5c PASS — his window's LVE and CCL boxes: dashed amber. `s8-05-lark-window`, `s8-05b-lark-window-ccl`
- s8.6 RECORD — deliberately unchanged: grid figure beside never-typed Lark reads "0". `s8-06-grid-never`
- s8.7 PASS — member (Ranger) unlocked: the line once on Balances. `s8-07-member-balances-unlocked`
- s8.8 PASS — member's own window unlocked: the line under the LVE box, "Official bal". `s8-08-member-own-window`
- s8.9 PASS — member looking at never-typed Lark: window has no line, War bal "Not typed"; on Balances his figures are
  amber "–" read only (7 of them, title "Not typed", no boxes). `only-s7,s8/s8-09-member-other-never`, `only-s7,s8/s8-10-member-sees-never-row`
- s8.10 PASS — admin with "Lock for members" on: still the line. `s8-11-admin-locked`
- s8.11 PASS — member, locked: no line on the page, none in his own window. `s8-12-member-locked`, `s8-13-member-own-locked`
- Lead, to check (not a finding): in the member's read-only view "No grade" is grey, not amber (`only-s7,s8/s8-10-…`);
  D1249 asks amber "in his own row" — read against D1249 before it is anything; outside this change.

### s9 — the desktop drawing check — RECORD, 2 differences over about 2px
Method: the drawing's world rebuilt (Pelican, FCP OCU, post-in today, 24 typed, his five small kinds typed 0 as the
drawing showed them) and pictured exactly as the drawing script pictured it; compared pixel by pixel with the approved
raw pictures `2026-11-26-lw-postin-balance/q16-final/desk-pw.png` and `desk-bal.png` (any pixel more than 24 colour levels
off, grouped; under 3px dropped). Side by side, regions ringed: `a/s9-drawcheck-pw-side-by-side.png`,
`a/only-s9/s9-drawcheck-bal-side-by-side.png`, `a/only-s9/s9-drawcheck-bal-top-stacked.png`.
- **Person window (q16-final-pw-desk):** the words, size (11px), grey and left edge of the line match. **Difference 1:**
  the line stands **about 2.4px higher** than drawn (its ink rows 260–272 against 263–275 in the 1.25x picture), and
  everything below it follows — the small tiles ~1.6px and "LEAVE"/year picker/"No leave…" ~2.4px higher, the window
  ~2.4px shorter. Every listed region is this one shift (regions 1–9). Build measures: the line's box top 205px inside the window,
  9px below the carried box's foot (178 + 18 = 196); the drawing's mock line stood about 2.4px lower.
- **Balances page (q16-final-bal-desk):** the line's place, words and look match (no region at it). **Difference 2:**
  the **WAR BAL column is wider** — its heading on ONE line ("WAR BAL", 626–712, 86px) where the drawing has two lines
  ("WAR / BAL", about 60px) — so OIL and the whole OTHER LEAVE group stand **about 26px further right** than drawn. Cause
  as seen: the page now holds "Not typed" rows (6 drawn), whose words need the room. A knock-on of D2746 on his approved
  page; for him to keep or not (D1426).
- Expected, ruled (not a difference to put): the demo rows' CCL/FCL/PL/EL/CL boxes are now empty dashed amber where the
  drawing (drawn before D2746) showed "0".
- Not checked against: the q11 drawings (marked mock-ups on the old build, "App bal" label) — compared by eye only:
  s8-05-lark-window matches q11-person-window's recommended look ("Not typed" amber in War bal's place, dashed empty
  boxes); s8-04-lark-row matches q11-balances'. The phone drawing is walker B's.

### s10 — the small-kind edge, reproduced on the new build — PASS (4)
- s10.0–s10.3 PASS — a man with LVE typed and CCL never typed (Jay), and one with nothing typed (Ibis), before and after
  an approved LL; also Jay built exactly as s1's Lynx (post-in 7 Dec, leave through the Post in sheet first): CCL dashed
  amber on the Balances page AND in the window, every time. `only-s10/`, `only-s10-asLynx/s10-0-jay-as-lynx-pw.png`

## FAILs with steps to reproduce
None of the app on the cited build. (The old build's grey-edged small boxes in the person window — above — were the fault
walker B reported and the host fixed at 02:24; confirmed fixed on the desktop.)

## Script notes (not the app's)
- The shared `press` helper printed "the point of the Grid / Balances tab is covered by something else" on many tab
  presses; every such press still landed (the next page opened). Not investigated.
- My first runs' FAILs were all the script's: a demo archived "Osprey" matched by callsign (now: the new id by
  difference), the half-day buttons' test id, the window's pending written "−1", Quals' Edit mode, a Balances view
  switch matched to the tab, a read-only figure read by a test id it does not carry, the changes window covering the
  week's ›.

## Not walked (and why)
Time (about 75 minutes) and my part's scope: Astra 3 (deleting an old-gap leave), 4 (pending of each small kind), 10
(the wrong-order correction), 12 / Opus SC9 (the pilot's 15-day run across post-in), 14 (a SANS posting rather than the
Quals tick), 15 (Restore as, Undo post out), 16 (editing the leave on the Inputs page), 17 (a range across periods), 18–19
/ SC12 (1 January, next-year post-in), 20 (Escape, 0.5, −2), 21's recovery after the refusal in the person window, 22
(lock changing mid-edit), 24 (every person-window opener), 26 / SC2 ("taken" against Days taken), 27 (OIL beside it),
28 (Inputs/Admin round trips); SC16 (Help pages and Legend for "App bal"); SC18–19. The history line (s7.6) — no route to
the typing day's week found. Every phone step is walker B's.
