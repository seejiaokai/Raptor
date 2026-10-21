# Brief — the final set: every Leave War screen as it will be (D1206, night of 21–22 Oct 26)

**His words (D1206):** "The mock up should show me at the end what u plan to change with the update details we
discussed." So the page ends with every Leave War screen **as it will be built** — not today's screen with one new part,
but the whole screen after the overhaul: every ruling D1141–D1207 in, the red team's fixes in, each open question drawn
with its recommended answer.

Read first, whole: the drawing brief `2026-10-22-lw-overhaul-night-drawings.md` (how drawings are made, sizes, limits,
the design guide, Impeccable, LOOK at every picture) — everything there holds. Then the design note
`raptor-port/docs/superpowers/specs/2026-10-21-leave-war-overhaul.md` **§10 whole** (the red team's fixes, §10.2, and
the questions, §10.3), and §5 for his rulings in order. The helpers' write-ups of tonight's drawings:
`2026-10-22-lw-overhaul-night-drawings-results.md`.

## What "as it will be" means — the same everywhere, across the three helpers

- **The top rows** are the overhauled ones, never today's (no stage chip, no "Viewing as"): phone line 1 — "View" ·
  the period picker · (admin) "+" · Approvals with its count; line 2 — the open-dates chip ("Open 1 Jan – 31 Mar", or
  "Bidding closed") · Under-manned · Legend; line 3 — My leave. Desktop: line 1 — View · picker · + New · Approvals;
  line 2 — open-dates chip · under-manned · Legend · My leave at its free end. Their drawing code exists: `full-r4.mjs`
  (A pictures) and `full-propose.mjs` (`proposeTop`, `proposeCells`, `renameFigures`) — reuse it.
- **The cells** are look F (D1175): LL light amber, OL deep amber, OIL/FO/HO green, other leave blue, course lilac,
  overseas duty grey, medical rose; filled approved, hollow dashed waiting, grey struck refused; a half fills its half
  (D1160), two whole days side by side (D1167). `full-cells2/3/4.mjs` and `full-propose.mjs` draw them.
- **The open dates** wear the green outline round each open stretch (no glow — D881); closed days the quiet dim.
- **"Balances"** is a button (D1185); the Required / Available rows faintly tinted in pairs (D1194).
- **One figure each:** use the app's own figures for the demo squadron (Ranger's LVE as the app shows it); invent leave
  lines only where a screen needs them, and say so.
- **Each change from today carries a pink numbered mark**, and your write-up names, for each number, the ruling or the
  §10.2 fix it comes from — few words, the app's names.
- **A question of §10.3** drawn with its recommended answer carries a mark reading "Q<n> — your answer first".
- Clock Thu 8 Jan 26, the demo squadron staged as the earlier scripts stage it (`state.json` — copy it from
  `C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-leave-war-overhaul-overnight-4c958e/6fa72ea4-b55a-4ffc-9a88-3f45138a4514/scratchpad/person/out/state.json`
  into your own `LWMOCK_OUT/out/` first).

## Your pictures

Name them `full/r7-<nn>-<screen>-<phone|desk>.png`, numbered in the order a person meets them (your range is given in
your job). Script: `docs/mock/lw-overhaul/full-r7-<yourpart>.mjs`.

## Return (under 700 words)

The pictures in order, a line each; then per picture its marks (number → ruling or fix, a few words); then anything you
could not draw as §10 says, and why.
