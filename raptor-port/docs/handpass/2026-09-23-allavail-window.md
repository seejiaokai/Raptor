# [ALL-AVAIL-WINDOW] — the FULL-tier evidence sheet (23 Sep 26)

Branch `claude/all-avail-window`. Built by Opus 5.5; the bug check below is `docs/bug-check-order.md`.
Pictures: `docs/img/handpass/2026-09-23-allavail-window/`. Walk drivers: `scripts/handpass/aw-walk*.mjs`
(the everything-Saturday of `fixture.mjs`, built through the app's own controls, plus the owner's D38
case). Scenario design: `2026-09-23-allavail-window-fable-scenarios.md` (Fable, verbatim).

## 1. The eight questions → FULL

| # | Question | Answer |
|---|---|---|
| 1 | Money / earned leave | **YES** — the earn half switches a man off OIL for an event |
| 2 | The published record | **YES** — the window reads issued versions; a switch on a published day is an amendment |
| 3 | Saved data | **YES** — the switch writes the day's OIL decisions |
| 4 | A shared drawer | **YES** — the count chip is drawn on every seat kind, week and board |
| 5 | A new gesture / mode | **YES** — drag, resize, tap-a-man, the two tabs |
| 6 | A new surface | **YES** — a third kind of transient surface, the app's first |
| 7 | Roles | **YES** — a member reads, only a scheduler switches |
| 8 | The warning list | **YES** — the D38 debrief/brief flag reads the warning list's own rule |

## 2. The rulings walked

D27 (the count is a scheduling fact) · D32/D33 (where a placeholder lands; ALL = ALL AVAIL) · D36 (the
availability window stays narrow) · D37 (the count reads as what it is) · **D38–D41** (the window, one
puck per row, 212px skinny, the grip, the mock is the design of record) · D43 (placeholders on by
default) · D44/D45 (issued membership frozen; nothing on a published day changes unacknowledged) ·
D46 (a placeholder on a request row) · D56 (demo-data exclusion) · **D65** (a tap selects with OIL
Earn off, never with it on) · **D66** (closes on a page, week or session change; NOT on an outside click).
No clash found between them.

## 3. The roll-call — every place the chip is drawn

| Surface | Shows the chip | Gesture works | Painted over? | Evidence |
|---|---|---|---|---|
| Board · ground row | YES | YES — window over the board, both widths | NO (was: under the board, S1 — fixed) | 01, 13; e2e |
| Board · Common Programme | YES | YES | NO | 05a |
| Board · duty desk extras | YES | YES | NO | 05b |
| Board · sim seats / pax | YES | YES (markup, unit) — not walked by hand | NO | `oilrowpucks.test.tsx` |
| Board · request row, asking type | YES | YES (unit) | NO | `oilrowpucks.test.tsx` |
| Board · request row, **Personal** | **NO — MISSING** | — | — | **filed `[OIL-PERSONAL-PLACEHOLDER]`** (pre-existing on main; read, not walked) |
| Board · OIL Earn mode | YES | YES — opens on the earn tab; the only door to one man | NO | 06, 07, 08 |
| Board · issued preview (plans menu) | YES | YES — availability only (§5) | NO | walk 4 |
| Edit week | YES | YES (unit, the week's own door) | NO | `oilcount.test.tsx` |
| View week · issued face | YES | YES — official flags, incl. the D38 case from the record | NO | 10, 24 |
| Flying cockpit seat · next-week peek · print · CSV | must-not — a placeholder is refused / no chip is drawn | — | — | Fable §3, unchanged |
| Leave War / Tracker / Inputs | must-not — the window closes on a page change (D66) | — | — | walk 1 step 10; unit |

## 4. Orders walked (real bundle, no console errors on any of the four passes)

| Order | What the screen said | Pass |
|---|---|---|
| Tap the OPS BRIEF chip on the board (desktop) | window over the board; 45 available; Ridge + Grit AMBER "Not enough time to attend the COBRA debrief — OPS BRIEF sits inside 15:30–17:30" (the owner's case); Basher amber (his own OFT brief) | ✓ |
| Tap Ridge, OIL Earn off | full sentence in the footer; Ridge lit on 16 copies behind the window (D65) | ✓ |
| Drag, then type behind it | stays where dragged; stays open (D38) | ✓ |
| Close, reopen | back in the corner (S11) | ✓ |
| OIL Earn on → chip | earn tab, "45 of 45"; tap Reaper → "Reaper earns nothing from OPS BRIEF", same line in History, nobody selected (S7, D65) | ✓ |
| Row switched off by its name → tap | the board's refusal toast, nothing written (S6); hint now says why (W2) | ✓ |
| Publish → View-only Sched | window closed by the page change (D66); issued face's window "who was free when this day was issued", flags from the record (W1) | ✓ |
| Delete the FAMILY DAY row behind it → Undo | "This row is no longer on the schedule.", count "—"; Undo → 30 again (S14) | ✓ |
| Week arrow on the board | window closed (D66) | ✓ |
| Phone | full-width bottom panel 366×523 at 12px margins, on top, 3 flagged (S8); drag down 300px → bar still on screen | ✓ |
| Phone, masked row, tap | refusal toast shown OVER the panel (toast 540 > window 410) | ✓ |
| Logout → member | no window inherited (D66); member reads the issued window, no tabs, reason on tap | ✓ |
| OIL Earn on → plans menu → issued preview | the preview switches the mode OFF; window opens with no earn tab | ✓ |
| Issued preview → OIL Earn | the button is disabled | ✓ |

**So a version's earn half is unreachable from the screen in both orders** — the read-only guard on
it is a belt, pinned by a unit test.

## 5. Fable's scenarios — every one dispositioned

| Item | Disposition |
|---|---|
| S1 under the board | **fixed** `32f2e36a` (z 410), e2e red first |
| S2 debrief flag | **fixed** `735b83dd`; on the issued face from the record `d0f16a29` (walk W1) |
| S3 issued list, today's flags/figures | **fixed** `e81e1fe0` — the window replays its chip's whole world |
| S4 week change | **fixed** `1c4a8e17` (D66) |
| S5 unpublish/undo | **fixed** `e81e1fe0` — prunePreviews closes it; through the screen D66/the preview gate close it first |
| S6 masked row tap | **fixed** `e81e1fe0` (+ hint, W2) |
| S7 no History line | **fixed** `e81e1fe0` — one sentence body with the board |
| S8 phone layout | **fixed** `c285ad66` |
| S9 tap selects | **fixed** `1c4a8e17` (D65) |
| S10 typing lag | **fixed structurally** `e81e1fe0` (one read pass per render) — **not timed** |
| S11 footer and position carry over | **fixed** `735b83dd` + `c285ad66` |
| S12 logout | **fixed** `1c4a8e17` (D66) |
| S13 other pages | **fixed** `1c4a8e17` (D66) |
| S14 row deleted | **fixed** `e81e1fe0` |
| S15 browser shrink | **fixed** `c285ad66` |
| Next-five 1 — two placeholders, one window | **no finding** — D32: ALL and ALL AVAIL are the same semantics |
| Next-five 2 — Personal request row, no chip | **filed** `[OIL-PERSONAL-PLACEHOLDER]` |
| Next-five 3 — inert man writes a deny | **fixed** `e81e1fe0` |
| Next-five 4 — title from the live day | **fixed** `e81e1fe0` (read in the chip's world) |
| Next-five 5 — toast under the phone panel | **no finding** — walked, the toast is on top |
| Known gap — a crowd man's SIM brief/debrief | **filed** `[CROWD-SIM-BRIEF]` |

Also fixed on the way: a parked plan's words said "issued" (it keeps no frozen membership); a landed
request's times printed as "10:20" for 17:00; the phone panel's right margin (the mock's own quirk).

## 6. Red first — every fix

S1 e2e 3/3 red · S2 2 red · S11 footer: break test 2 red · D65/D66 6 red · S3/S5/S6/S7/S14/plan 9 red
· S8/S11/S15 e2e 3 red · W1 1 red · W2 1 red. Each green after, source restored and re-run.

## 7. NOT walked, and why

- **S10 typing lag** — fixed by structure, not measured with a timer.
- **The Personal request row** — confirmed by reading the code, filed, not walked.
- **Sim seats and a request row by hand** — covered seat kind by seat kind in `oilrowpucks.test.tsx`.
- **A touch RESIZE on the phone** — CSS resize has no touch handle; on his phone the window MOVES but
  does not resize. Put to the owner (D38 asked for "resizable").

## 8. Gates — see the closing commit

## 9. The two code reads — see §10 once they return
