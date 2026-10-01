# Walker A — [WARN-HIDE-KEPT] the lists, the counts and the pucks, on days not yet published (1 Oct 26)

Served build `http://localhost:4211` (frozen `dist-wh`), driven in a scripted real browser at desktop 1440×900 and phone
390×844. Every fixture through the app's own controls (the ✕ / ↺, typed time and remark boxes, the board's "+ Wave" /
"+ Block" / "+" aircraft, a seat armed and a man picked from the crew list, drags, the plan selector, Templates). Each
scenario in a fresh world. **163 recorded rows: 143 PASS, 5 FAIL (two findings), 7 NOT WALKED, 8 information rows.
No console error, page error, 4xx or native dialog in any run.** All 280 pictures were opened.

Scripts `raptor-port/scripts/handpass/wh-a-*.mjs` (walks `10`–`20`, helpers `wh-a-lib.mjs`, probes `00`–`10-probe`);
pictures `raptor-port/docs/img/handpass/2026-10-01-warn-hide/a/` (`dk-` desktop, `ph-` phone — a phone twin carries the
same name after its number); results `raptor-port/docs/handpass/parts/wh-a.json`.

## The table

| # | What I did (the controls) | What the screen said | Verdict | Pictures (desktop; phone twins exist unless said) |
|---|---|---|---|---|
| 2 | Tap Gambit's Wednesday puck (flagged Mon + Wed); with him still selected ✕ his only Wednesday line; ↺; hide again, drop the selection, tap his clean Wednesday puck; open Wednesday's list by its bar | Monday's box loses "Gambit is also flagged on Wed" at once and gets it back at once on ↺; the clean puck opens Monday only; opened directly, Wednesday still lists his line struck | PASS | `2a-gambit-focused-*`, `2b-after-hide-*`, `2c-…`, `2d-clean-puck-tapped*`, `2e-…` |
| 8 | Board: "+ Wave" → AVALON, Grit (medically down, a WSO) picked onto its front seat and onto a ground item; ✕ one of the seat's three own lines, then the rest; ↺ one. Repeated on an SC SPARE seat. BB tried | **Edit Schedule:** the seat stays red while one of its own shows, goes plain when all three are hidden, his ground copy stays red, ↺ brings red back — PASS. **Board:** the same seat stays ringed red C (finding 1) — FAIL. BB: the seat raised nothing of its own (a new BB wave has no times) | PASS on Edit Schedule · **FAIL on the board** · BB NOT WALKED | `8a…8f`, `8x-baseline-*`, `8s-a/b/c`, `8b-a/c` |
| 9 | Board: "+ Block" → AVALON, Grit on its SXO desk and in a normal flying seat; ✕ the desk's line | Desk loses red ring and C on board and week; his flying copy stays red on both | PASS | `9a`, `9b-board-desk-plain`, `9c-week-*` |
| 10 | ALL AVAIL placed on MASS BRIEF; its count chip → the window; ✕ Saint's clash, then his brief line; from the board and from Edit Schedule; ↺ | Saint red → amber (his other reason shown) → plain with no reason; still listed; "5 men are flagged" → 4; "44 available" unchanged; ↺ restores | PASS (working face; the published half is Walker B's) | `10a…10f-window-*` |
| 11 | "+" aircraft, Cutter (a WSO) picked into the front seat; ✕ on the week, ↺ on the board | Q and red ring leave / return on the seat, Available crew and both crew lists together | PASS | `11a`, `11b`, `11c` |
| 12 | Anvil put on a programme item, two ground items, two sims and a duty desk (7 clashes); ✕ each in turn | Every copy keeps red C until the last clash is hidden, then all fall together | PASS | `12a`, `12b-*`, `12c` |
| 13 | Rebel (a SANS card), Quill (on leave), Saint, Outlaw: ✕ every line naming them | SANS card, Unavailable row, Personal Inputs and Available-crew pucks go plain; rows and inputs stay; board agrees | PASS | `13a`, `13b`, `13c` |
| 14 | The same Anvil at his timed duty desk: clashes hidden, then his advisories | Red → amber → plain, week and board | PASS · untimed desk NOT WALKED | `12b-…-duty`, `14b-*` |
| 15 | Thursday ✕ "Wildcard with Pixel — not an authorised combination"; Wednesday ✕ "Nomad with Pixel — CO approval" | Both men clear together; Nomad keeps the red of his own warning; nobody else changes | PASS | `15a`, `15b-*`, `15c` |
| 16 | Monday ✕ "4 people are double turning" | DT gone from all four (week and crew list); Saber and Piston keep red C; no unnamed man changes | PASS | `16a`, `16b` |
| 17 | Wednesday: ✕ Trident's tight turn, then the double-turn line. Tuesday: Outlaw's line retimed and its in-time typed 11:00 → "Tight turning — crew rest"; ✕, ↺ | Trident TT → DT → plain, Relay keeps TT. Overnight TT leaves and returns, week and board | PASS · both kinds on ONE man NOT WALKED | `17a`, `17b`, `17o-a/b` |
| 18 | Tuesday ✕ Outlaw's line, ✕ Saint's clash, ✕ Saint's advisory | Saint red C → amber B → plain; bar red → amber "2 issues" → grey "1 issue" | PASS | `18a`, `18b-*`, `18c-*` |
| 19 | Landing typed equal to take-off; ✕ on the week, ↺ on the board. Saturday's and Sunday's OIL reminder ✕ / ↺ on both lists | Both time boxes lose their mark on week and board (they are drawn amber, not red); line struck with ↺; times untouched. OIL line struck, "✓ No issues", Insights 2 → 1 | PASS | `19n-a/b/c-*`, `19a…19d` |
| 20 | ✕ Static's long day | No ring or L on his seat, desk, crew list (phone: the crew drawer); his 21h20 and every man's hours unchanged | PASS | `20-static-pucks-after-hide`, `24b`, phone `P1`, `P2` |
| 21 | Tuesday: ✕ the fourth line, then all four; bar shut and opened; View-only Sched; the member after a reload | "3 issues · 2 warning", no word of a hidden one; line stays fourth, struck, darker, ↺ reachable; all hidden → quiet "✓ No issues · tap to review" opening four struck lines; View-only Sched and the member: struck, no button | PASS | `21a`, `21b`, `21c-*`, `V1`, `V2-*`, `V3` |
| 22 | The same on the board; checks panel resized by its splitter (desktop), fold shut and opened (phone) | Count and order match Edit Schedule; "No conflicts flagged for Tuesday ✓" with four struck lines; ↺ topmost | PASS | `22a`, `22b`, `22c-*`, `22d` |
| 23 | The day's ⓘ on Edit Schedule, the board and View-only Sched, one hidden then all | "2 warning · 1 advisory" (no note); four lines, hidden one struck; all hidden → "Nothing flagged — this day is clean ✓" over four struck lines | PASS (working face; issued / older faces are Walker B's) | `23a`, `23b`, `23c`, `23d`, `V1-…-dayinfo` |
| 24 | Insights before, after ✕, after ↺; again with all of Monday–Thursday hidden | Tile 33 → 32 → 33, "Long work day" 2 → 1 → 2, Tuesday 4 → 3 → 4, the three agree; four days hidden → tile 2, Mon–Thu "clear" | PASS | `24a`, `24b`, `24c-*`, `S-insights-four-days-hidden` |
| 25 | Hide on Edit Schedule, read on the board; tap the struck row's words; ↺ on the board, read on the week | One shared state; the struck row lights Static and brings him on screen; an open box does not light a hidden line's man | PASS | `25a…25e` |
| 26 | Baseline drop (nothing hidden); then both Saint's lines hidden, Anvil dragged over him, Saint dragged back; then Saint dragged into a second aircraft | Baseline: red message + pulse. Exact hidden clash: lines come back already struck, no pulse, no ring, not counted — **but an amber message "Saint — already on APPOINTMENT 14:00–16:00"** (finding 2). Changed clash: shown, announced, pulses | **FAIL** on "no message" · rest PASS · phone NOT WALKED (no drag) | `26a`, `26b`, `26c` (desktop only) |
| 34 | ✕ Static's long day; his desk start typed 07:00, 05:30, 05:00 | Gone; back SHOWN as a different warning (12h35); the exact original (13h05) hidden again by itself | PASS | `34a…34e` |
| 35 | Hide on the live day; "+ Alt Plan"; change the copy; back to Plan A; a third plan; ↺ there | The hide follows the day into every plan where the exact warning exists; ↺ on one plan shows on the others | PASS | `35a…35f` |
| 36 | Monday nought-minute line hidden, day saved as a template, applied to Wednesday; Monday changed away by another template and back | Wednesday's same-looking line is shown; Monday's restored one is already hidden | PASS | `36a…36d-*` |
| + | THE SWEEP: every one of the 31 lines of Monday–Thursday hidden one at a time, the day read after each; then all flagged again | After every ✕: bar one lower, line struck in place, only the men it names change. All hidden: no flagged puck, board agrees. Monday's dotted mark for Tuesday's breach stays while Tuesday's is shown, goes with it, and the "Breaks Tuesday" row with it. Restored: identical to a fresh world | PASS | `S-*` |
| + | The dashed ring (remark "LATE SHOW") ✕ / ↺ | Dashed ring, R and Monday's dotted mark leave and return | PASS | `D1`, `D2-*`, `D3` |

## Findings

**1. The board rings an exempt flying seat with the man's flags from elsewhere; Edit Schedule does not (scenario 8).**
Steps: board, Tuesday → "+ Wave" → AVALON → arm the first front seat, pick Grit → also add Grit to the first ground
item → ✕ on the three AVALON lines naming him. Expected (scenario 8, WH3): that copy plain, his ground copy still
flagged. Edit Schedule does exactly that. The board keeps the AVALON copy ringed red C. Same on an SC SPARE seat and a
BB seat. **It is not caused by the hide:** in a fresh world with nothing hidden, Saint on an AVALON seat that raises
nothing for him is red C on the board and plain on the week (`8x-baseline-*`). The board never shows a ring for a
hidden warning (all his lines hidden → plain, `8f`). So: a week / board disagreement that hiding makes visible.
Pictures `8c-board-avalon-copy-plain` vs `8d-week-avalon-copy-plain`, `8s-b`, `8b-a`.

**2. A drop that recreates an exact hidden clash still says something (scenario 26).** Steps: board, Tuesday → ✕ both
Saint's lines → drag Anvil onto Saint's VL SAT seat → drag Saint back. Expected: "neither toast nor blink". Happened:
no blink, no ring, lines back already struck, count unchanged — but an amber message "Saint — already on APPOINTMENT
14:00–16:00". It is the drop's own "already tasked" notice, not the warning's sentence. Picture `26b`. His call whether
that notice should stay.

## Recorded, not judged
- ALL AVAIL window: with Outlaw's crew-rest line hidden he stays listed and loses ring and R, but the window writes
  another reason under him ("MASS BRIEF sits inside his flight brief" — as his formation-mates show) and its footer
  still counts him (`10d`).
- The nought-minute time boxes are amber on screen; the brief calls them red.
- A day template carries lines and times, not men; a line with nobody on it raises no nought-minute warning, so
  scenario 36 needed a man seated on it.
- The app says "Warning hidden — no flag, not counted. It returns if the day changes" / "Warning flagged again".

## Errors seen
None.

## Not walked, and why
- **BB seat (8):** a new BB wave has no times and raised nothing of its own to hide.
- **Untimed duty row (14):** every demo desk carries times.
- **One man with both tight-turn kinds (17):** each kind walked on a different man.
- **26 on a phone:** no drag there.
- The published halves of 10 and 23 (Walker B); reload, sign-in, Undo, OIL figures (Walker C).

Three readings were first wrong in my own scripts and corrected before any verdict: a busy man's grey bar in the crew
list and the signed-in man's own purple ring are not flags; Monday's dotted mark belongs to Tuesday's breach.
