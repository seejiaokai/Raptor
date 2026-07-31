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
`audit2` **18/18 on both** (after fixes 1 and 2 above).

Spot-parity worth recording: the ink probe measures the SAME pixel
geometry on both builds to the first decimal (puck 15px, text −3px below,
9px/9px Inter Tight), and `rules`/`sign` run their whole publish + AL
flows through the port end to end (after fix 3).

## Adapted (5)

| probe | reference | port | why adapted / where covered |
|---|---|---|---|
| `wrap` | 36/36 | direct run misleading; **`adapted/wrap-async.cjs` 36/36** | injects the jam and measures in one `evaluate` — needs a sync repaint. Same B55 measurements (Range-ink, wrap-not-overflow, no sideways swipe), split across the async commit. |
| `drop` | 14/14 | 8/14 direct; **`adapted/drop-async.cjs` 9/9** | B1/B4/B5/B7 pass directly. A (offset-puck geometry) needs an awaited repaint; B2/B3/B6 instrument `window.tdArm`/`window.toast`/bare `DRAG=` which module internals never call — re-expressed with user-visible verdicts (body class while held, toast text). |
| `perf1` | 43/44¹ | **`probes/perf-port.cjs` 7/7** | sections E/H pin the string-diff cache itself (dropped per PORTING.md); C's `DAYHTML.eWeek=null` forced-rebuild has no React equivalent. The behavioural checks (one-day isolation B, scroll held D, Edit-toggle F) and the timing gate live in perf-port. |
| `perf3` | 13/13 | **`probes/perf-port.cjs`** | same — panel `__html=null` cache pokes; the board timings and the field-survival check (informational in the reference too) live in perf-port. |
| `perf2` | — | — | dropped per PORTING.md: it pins the `setHTML` identity mechanism. |

¹ perf1's one reference failure was its C timing assertion under the
sweep's shared-CPU load; quiet-machine numbers are below.

## Partial on the port (4)

| probe | status |
|---|---|
| `audit` | **all 21 assertions pass on the port**; the run then stops at console item 14, which assigns the module-internal `AIRKEY` as a bare window global and clicks `#airAdd` synchronously. The item-14 contract (a traffic edit earns a history step + `tr:` pending mark) is pinned in `odds.test.tsx`; item 9 (board day-tab disarms) in `board.test.tsx`. |
| `aar` | engine parse checks print and match; stops reading the Quals DOM synchronously after `go('quals')`. The NAAR-before-DAAR invariants are pinned in `quals.test.tsx` and the engine tests. |
| `sa` | standalone-wave checks stop at a synchronous post-`addWave` DOM read. The SC/AVALON/BB shapes, `saExempt` and the duty block are pinned in the engine suites and `board.test.tsx`. |
| `sc2` | stops at a synchronous post-arm palette read. The SC DAY/NIGHT palette gating is pinned in `slotrules.test.ts` and `editweek.test.tsx`. |

## Environment-bound (1)

`zdup` errors **identically on both builds** at the same step (a tap-timing
dependence on this VM); `zdup2`, which covers the same double-tap ground,
runs on both.

## The performance gate (`probes/perf-port.cjs`)

The PORTING.md budgets (one-day ≤ 200 ms, board ≤ 120 ms) were measured on
the author's machine. On this VM the *reference itself* lands elsewhere, so
the gate measures both builds with one methodology — mutation → macrotask →
forced layout, the full painted cost regardless of when each build does its
work — and asserts **no regression** (port ≤ reference × 1.15):

| 4×-throttled phone, painted cost | reference | port |
|---|---|---|
| one-day edit | 320 ms | **312 ms** |
| no-op repaint | 118 ms | **73 ms** |
| board edit | 506 ms | **542 ms** (1.07×) |
| board no-op | 141 ms | **83 ms** |

Plus, all green: the other days' DOM is untouched by a day-1 edit, the week
holds its scroll through an edit and through an Edit-mode toggle, Edit-mode
OFF renders no contenteditable, and an open board field survives an
unrelated panel change exactly as far as the reference's does.

## How to re-run

```
npm run build && npx vite preview --port 4173 &
node probes/run.cjs all both          # the sweep (writes probes/out/)
node probes/run.cjs <name> ref|port   # one probe
node probes/adapted/wrap-async.cjs    # adapted B55
node probes/adapted/drop-async.cjs    # adapted B49
node probes/perf-port.cjs             # the perf gate (measures BOTH builds)
```
