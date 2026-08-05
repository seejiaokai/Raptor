# Phase 5 — the full probe sweep, reference vs port

Every Playwright probe in `reference/probes/` (54 files), run against the
reference (`file://…/scheduler.html`) and the React port (`vite preview`)
on the same machine, same Chromium (`probes/run.cjs all both`). Where a
probe assumes the reference's *mechanism* — a synchronous repaint after a
mutation, or instrumentation of window globals that ESM modules never call
— an adapted variant in `probes/adapted/` re-expresses the same contract
for an async repaint, per PORTING.md ("keep their behavioural checks").

The sweep also caught **three real porting bugs**, each fixed and pinned
with a Vitest assertion before this table was final:

1. `rulesLoad()` was never called at boot — a saved rule override
   silently reverted on reload (audit2 #6) → fixed in `initStore`,
   pinned in `rules.test.ts`.
2. The RULES MODIFIED stamp was set only by the Logic page — the exact
   bug the reference's own comment records having fixed → moved to the
   banner path in `Shell`, pinned in `logic.test.tsx`.
3. The stores toggle (`[data-store]` 2TK/TPOD/NAV chips) had never been
   ported → ported verbatim into `routeClick`, pinned in
   `interact.test.tsx`.

## Result: identical on both builds (44 of 54)

`add beams board board2 clip cx2 draw drawdrag fit grip hs hs4 ink leave
lgn lgn2 logic one ovw pal pal3 perf0 pubday rules(19/19) sc sc3 scdiag
sched scmix scpal screst scroll sel selprev selx shot2 shota shotsc
sign sim tdrag warn zdup2` — same output / same pass counts, and
`audit2` **18/18 on the reference, 17/18 on the port** (after fixes 1 and 2
above). The one gap is deliberate: **#8 "an offer adds nothing, a meeting still
does"** pins the old OFFER exemption, where `Available fly` / `Available duty` /
`Fly` clashed with nothing. Those first two types were removed and `Fly` became
an ordinary commitment (owner decision, Aug 26), so the port now raises 3
warnings where the probe wants 0. The probe still describes the reference
correctly; it no longer describes the port. The replacement assertion lives in
`src/engine/validate.test.ts` ("Fly eats brief/debrief time exactly as a meeting
does").

Spot-parity worth recording: the ink probe measures the SAME pixel
geometry on both builds to the first decimal (puck 15px, text −3px below,
9px/9px Inter Tight), and `rules`/`sign` run their whole publish + AL
flows through the port end to end (after fix 3).

## Adapted (9) — `npm run probes:adapted`

Six adapted files, covering nine reference probes. Each re-expresses its
original's contracts for this build; none of them drops one. They run as a
set (`probes/adapted/run-all.cjs`) and every one exits non-zero if an
assertion fails, so the whole set can be treated as one command.

| probe | reference | port | why adapted / where covered |
|---|---|---|---|
| `wrap` | 36/36 | direct run misleading; **`adapted/wrap-async.cjs` 36/36** | injects the jam and measures in one `evaluate` — needs a sync repaint. Same B55 measurements (Range-ink, wrap-not-overflow, no sideways swipe), split across the async commit. |
| `drop` | 14/14 | 8/14 direct; **`adapted/drop-async.cjs` 9/9** | B1/B4/B5/B7 pass directly. A (offset-puck geometry) needs an awaited repaint; B2/B3/B6 instrument `window.tdArm`/`window.toast`/bare `DRAG=` which module internals never call — re-expressed with user-visible verdicts (body class while held, toast text). |
| `aar` | ran, one line vacuous | **`adapted/aar-async.cjs` 17/17** | the original reads and clicks `#qtbl` in the same `evaluate` as `go('quals')`. Also STRONGER than the original: its `seq` line never clicked "Enable editing", so every qtbl click was swallowed and it printed the "blocked=true · both=false · cascade=true" you get when nothing ticks at all. The adapted run enables editing and exercises the real NAAR-needs-DAAR ladder. |
| `audit` | 21/21 | **`adapted/audit-async.cjs` 27/27** | three separate blockers: item 3 pinned the OFFER exemption (`Available *` types, removed Aug 26 — the lookup returned undefined and killed the whole evaluate); item 14 assigned the module-internal `AIRKEY` as a bare global; items 9/12/13 read the board and the Inputs page in the same tick as the nav that builds them. Item 3 is re-expressed against the rule that replaced it (a personal input is invisible to the validator until a scheduler accepts it); item 14 now opens the popup by clicking the wave's own Traffic button. |
| `sa` | 1 assertion FAILS on the reference too | **`adapted/sa-async.cjs` 23/23** | `chip order` recovers RANK by regexing the page source — the reference is one inline script, an ESM build has nothing to scrape (RANK is on the probe bridge now). The `SUP filter` and the phone/board chrome read the DOM in the same tick as the click. And its "warnings UNCHANGED" step is FIXED rather than copied: it stuffs exempt seats from `dayEngaged()` without regard to who those men are, and on **both** builds eventually plants a downchit man on an SC SPARE, which raises DNIF_FLY — no exemption lets a grounded man near a jet. The adapted run stuffs eligible men only (so the exemption is tested on its own, and now really is UNCHANGED), and asserts DNIF_FLY and SC_QUAL separately. |
| `sc2` | 13/13 | **`adapted/sc2-async.cjs` 15/15** | arms a slot and reads `#eRoster` in the same `evaluate`, and calls `$('qEdit').click()` on the line after `go('quals')`. Every count the reference prints (54 shown, 23 struck, busy 3, 32 shown) comes out identical on the port. |
| `perf1` | 43/44¹ | **`probes/perf-port.cjs`** | sections E/H pin the string-diff cache itself (dropped per PORTING.md); C's `DAYHTML.eWeek=null` forced-rebuild has no React equivalent. The behavioural checks (one-day isolation B, scroll held D, Edit-toggle F) and the timing gate live in perf-port. |
| `perf3` | 13/13 | **`probes/perf-port.cjs`** | same — panel `__html=null` cache pokes; the board timings and the field-survival check (informational in the reference too) live in perf-port. |
| `perf2` | — | — | dropped per PORTING.md: it pins the `setHTML` identity mechanism. |

¹ perf1's one reference failure was its C timing assertion under the
sweep's shared-CPU load; quiet-machine numbers are below.

Nothing is "partial on the port" any more. The four that used to stop
partway — `aar`, `audit`, `sa`, `sc2` — now run end to end in their adapted
form, and between them they added six contracts the originals never got as
far as asserting.

## Environment-bound (1)

`zdup` errors **identically on both builds** at the same step (a tap-timing
dependence on this VM); `zdup2`, which covers the same double-tap ground,
runs on both.

## The performance gate (`probes/perf-port.cjs`, `npm run perf`)

The PORTING.md budgets (one-day ≤ 200 ms, board ≤ 120 ms) were measured on
the author's machine. On this VM the *reference itself* lands elsewhere, so
the gate measures both builds with one methodology — mutation → macrotask →
forced layout, the full painted cost regardless of when each build does its
work — and asserts **no regression** (port ≤ reference × 1.15).

### It is no longer flaky

It used to fail about 2 runs in 5 — measured at 3 in 5 before this rewrite,
**at the same rate on an unchanged baseline**. The flakiness was the
estimator, not the code: one round of the one-day edit reads anywhere from
210 to 830 ms on the SAME build here. Three changes fixed it, and the third
matters most:

- a **warm-up**: the first two rounds of each metric are run and discarded;
- the **minimum** of the per-trial medians, because scheduler noise is
  strictly additive — the fastest trial is the closest reading of the truth;
- **both builds open at once, measured round for round** — reference round 1,
  port round 1, reference round 2… The old run measured all of the reference
  and then all of the port, ~15 s apart, and the machine load in those two
  windows is not the same. That gap was most of the flakiness. The verdict is
  now the **median of the per-trial ratios**, each ratio computed from two
  halves measured under one machine, never by pairing the reference's
  luckiest trial with the port's unluckiest.

Per-trial ratios now cluster within about ±0.05 of each other inside a run,
where the same metric used to swing ±30% between runs.

**Self-check.** Point the gate at the reference twice and it should read
≈ 1.00: `PORT_URL="file://$PWD/reference/scheduler.html" npm run perf`.
Measured: 0.91 / 0.99 / 0.93 / 1.01 on the four metrics — no systematic
penalty for being the second page open, if anything a slight advantage. That
is the instrument's resolution: about ±10%.

### What it now reports (and the one red light)

| 4×-throttled phone, painted cost | reference | port | ratio |
|---|---|---|---|
| one-day edit | 249 ms | **255 ms** | 1.12× |
| no-op repaint | 94 ms | **60 ms** | 0.66× |
| board edit | 418 ms | **496 ms** | **1.19× — over budget** |
| board no-op | 131 ms | **83 ms** | 0.62× |

**The board assertion is red, and it is not a rendering regression.** The
gate assumes both builds draw the same thing. They no longer do:

| DOM at the moment of measurement | reference | port |
|---|---|---|
| `#sbBoard` | 393 nodes / 20 KB | **699 nodes / 37 KB** (1.78× / 1.84×) |
| `#eWeek` | 4173 nodes, 5 days | **5028 nodes, 7 days** (1.20×) |

The board grew the stores config chips, the personal-inputs group, the
day-version selects and the rest; the week grew the weekend. So the port
paints 1.78× the board for 1.19× the time — per node it is comfortably
*faster*, which is what the two no-op metrics (0.62× / 0.66×) say directly.
The gate prints both DOM sizes above the ratios for exactly this reason.

**This is an owner decision, left open deliberately.** The threshold has not
been moved and the assertion has not been weakened: a `port ≤ reference ×
1.15` gate has simply outlived its usefulness for the board now that the two
boards are different boards. Re-baselining it (port against a recorded port
number, or a per-node budget) is a call about the squadron's performance
budget, not a call to make while fixing a flaky estimator.

Plus, all green: the other days' DOM is untouched by a day-1 edit, the week
holds its scroll through an edit and through an Edit-mode toggle, Edit-mode
OFF renders no contenteditable, and an open board field survives an
unrelated panel change exactly as far as the reference's does.

## How to re-run

```
npm run test:e2e                      # the geometry gate — builds & serves itself

npm run build && npx vite preview --port 4173 &
node probes/run.cjs all both          # the sweep (writes probes/out/)
node probes/run.cjs <name> ref|port   # one probe
npm run probes:adapted                # all six adapted probes
node probes/adapted/sc2-async.cjs     # or one of them
npm run perf                          # the perf gate (measures BOTH builds)
PERF_TRIALS=7 npm run perf            # slower, tighter ratios
```

## The geometry gate (`e2e/`, `npm run test:e2e`)

jsdom has no layout engine — every rect in Vitest is 0×0 — so the contracts
`docs/ui-contracts.md` calls "measured, suite-enforced" used to be enforced
only by a human remembering to run a probe. They are Playwright specs now,
against a preview of the real production build, and they run in CI beside
`npm test` / `tfin.js` / `npm run build`:

- the puck is exactly `--puck-w` × `--puck-h` (74×15) on phone and desktop,
  on both week surfaces and in the palette, and the form grid's seat column
  is `--puck-w × 2 + 16` rather than a hard-coded number;
- every prose cell carries **both** `overflow-wrap:anywhere` and
  `min-width:0` (either alone does not wrap), nothing overflows its box, and
  a jammed week still gains no sideways swipe;
- one pan click moves exactly one day box, in both directions, and the proxy
  scrollbar sits where the week is;
- an edit and an Edit-mode toggle both hold the week's scroll, and Edit off
  renders no `contenteditable`;
- a hole in a programme row renders NO element, so the pucks either side do
  not shift;
- puck type is 9px and a descender's ink stays inside the 15px puck.
