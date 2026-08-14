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
an ordinary commitment (owner decision, Aug 26; the type itself was renamed
`Fly with` on 14 Aug 26 — grep for that in the port), so the port now raises 3
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
| `audit` | 21/21 | **`adapted/audit-async.cjs` 27/27** | three separate blockers: item 3 pinned the OFFER exemption (`Available *` types, removed Aug 26 — the lookup returned undefined and killed the whole evaluate); item 14 assigned the module-internal `AIRKEY` as a bare global; items 9/12/13 read the board and the Inputs page in the same tick as the nav that builds them. Item 3 has now been re-expressed TWICE: first against the rule that replaced the offer exemption (a personal input is invisible to the validator until a scheduler accepts it), then INVERTED on 10 Aug 26 when the owner reversed that too — every input counts from the moment it is typed, so the probe asserts `C/hard` where it once asserted nothing. What it guards is unchanged: planting a man through his own input is never silent; item 14 now opens the popup by clicking the wave's own Traffic button. |
| `sa` | 1 assertion FAILS on the reference too | **`adapted/sa-async.cjs` 23/23** | `chip order` recovers RANK by regexing the page source — the reference is one inline script, an ESM build has nothing to scrape (RANK is on the probe bridge now). The `SUP filter` and the phone/board chrome read the DOM in the same tick as the click. And its "warnings UNCHANGED" step is FIXED rather than copied: it stuffs exempt seats from `dayEngaged()` without regard to who those men are, and on **both** builds eventually plants a downchit man on an SC SPARE, which raises DNIF_FLY — no exemption lets a grounded man near a jet. The adapted run stuffs eligible men only (so the exemption is tested on its own, and now really is UNCHANGED), and asserts DNIF_FLY and SC_QUAL separately. |
| `sc2` | 13/13 | **`adapted/sc2-async.cjs` 15/15** | arms a slot and reads `#eRoster` in the same `evaluate`, and calls `$('qEdit').click()` on the line after `go('quals')`. Every count the reference prints (54 shown, 23 struck, busy 3, 32 shown) comes out identical on the port. |
| `perf1` | 43/44¹ | **`probes/perf-port.cjs`** | sections E/H pin the string-diff cache itself (dropped per PORTING.md); C's `DAYHTML.eWeek=null` forced-rebuild has no React equivalent. The behavioural checks (one-day isolation B, scroll held D) and the timing gate live in perf-port; F measured a scroll-hold across the Edit-mode toggle and went with the toggle, 9 Aug 26. |
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
work — and REPORTS the cost per node drawn beside a recorded ceiling on the
node counts themselves. It used to ASSERT the per-node figure too
(port ms/node ≤ reference ms/node × 1.15); that went on 10 Aug 26 and the
count is what the gate stands on now. Why it is split that way is the next
section but one.

### The three timing budgets stopped being assertions (owner, 10 Aug 26)

**Decided on the record, do not re-add them.** The owner asked what the
speed check had ever caught. Counted against this repo's history:

| | times it fired | real problems found |
|---|---|---|
| the three per-node TIMING budgets | many (see below) | **0** |
| the two DOM CEILINGS | 4 | **4** — all genuine growth |

The timings never once caught a slowdown. They failed ~2 runs in 5 before
the 5 Aug rewrite (3 in 5 on an unchanged baseline), and after it the
one-day edit still straddles 1.15 — nine readings of one unchanged commit
spread 1.08x-1.23x. Every red was chased and every one was the estimator;
three of those chases are recorded in this section alone, each costing a
paired re-measurement. The ceilings, measuring an integer that is the same
on every machine, were right every time they fired.

So `perNode(k) <= 1.15` is gone for all three. The gate now asserts FOUR
things: two DOM ceilings and the two behavioural checks (B and D). **The
timings are still measured and printed** — both builds are still opened at
once and measured round for round, which is the only thing that makes them
comparable — so a real slowdown is still visible; it just no longer stops a
run on a coin flip.

**The rejected alternative was a looser bar.** A budget widened enough to
cover an estimator that swings 3x is wide enough to pass a genuine doubling,
so it would have been an assertion in name only — worse than none, because
it would read as cover. If a printed number ever looks wrong, the paired
recipe below is still how to settle it.

### Most of the flakiness went; the one-day edit still straddles its line

**(Historical from here to the end of this sub-section — these were the
reasons the timing budget was kept while it was still an assertion. Retained
because the paired recipe is still the way to investigate a suspicious
number, and because the readings are the evidence for the decision above.)**


It used to fail about 2 runs in 5 — measured at 3 in 5 before this rewrite,
**at the same rate on an unchanged baseline**. The flakiness was the
estimator, not the code: one round of the one-day edit reads anywhere from
210 to 830 ms on the SAME build here. Three changes fixed most of it, and the
third matters most:

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

**What did not go away: the one-day-edit per-node reading straddles its own
1.15 line on this container.** Nine readings of one unchanged commit ranged
1.08×–1.23× (re-measured 9 Aug 26), so the gate returned 7/0 on some runs and
6/1 on others with nothing changed — this spread is the evidence that
eventually retired the assertion. The budget was never raised to quiet it —
one loosened to cover estimator noise stops catching a real regression, which
is also why the assertion was DELETED rather than widened when it went. **A single red therefore proves nothing, and the only measurement
that settles it is a PAIRED one**: build the parent commit into a second
directory, serve it on a second port, and run `PORT_URL=… npm run perf`
alternately against both in the same window. Done that way, three alternating
rounds gave per-node differences of +0.07, −0.05 and +0.01 — i.e. none. The
`noop` metric is the useful cross-check while diagnosing: it repaints the
same week WITHOUT the edit, so a real week-render regression moves it too (it
sat at 0.56×–0.57× per node throughout, on both builds).

**Measured again on 10 Aug 26**, when the input panels became editable rows
and the one-day edit went red twice running at 1.18x and 1.19x. Three
alternating rounds against the parent commit, built into a worktree and served
on 4174:

| round | parent | this change |
|---|---|---|
| 1 | 1.14x | 1.10x |
| 2 | 1.08x | 1.06x |
| 3 | 1.08x | 1.15x |

Differences of -0.04, -0.02 and +0.07 — the same spread this section already
records for an unchanged commit, and the PARENT straddles the 1.15 line in the
same window. `noop` held at 0.58x-0.62x on both builds throughout. So: the
estimator, again, and the budget stays where it is.

**Measured again on 10 Aug 26**, when SC gained its duty blocks and the
one-day edit came back 1.16x. Three alternating rounds against the parent
commit, built into a worktree and served on 4174:

| round | parent | this change |
|---|---|---|
| 1 | 1.22x | 1.14x |
| 2 | 1.13x | 1.16x |
| 3 | 1.12x | 1.10x |

Differences of -0.08, +0.03 and -0.02, and the PARENT went red twice in the
same window (1.22x here, 1.28x on a fourth reading) while this change went red
once. `noop` held 0.51x-0.63x on both throughout. The estimator again — and
this particular change cannot move the metric anyway: it alters what a NEWLY
ADDED wave brings with it, and the gate measures the seed week, which gains
no node from it.

**Self-check.** Point the gate at the reference twice and it should read
≈ 1.00: `PORT_URL="file://$PWD/reference/scheduler.html" npm run perf`.
Measured: 0.91 / 0.99 / 0.93 / 1.01 on the four metrics — no systematic
penalty for being the second page open, if anything a slight advantage. That
is the instrument's resolution: about ±10%.

### The budget is per node, with a DOM ceiling beside it (owner, 5 Aug 26)

It used to be a flat `port ≤ reference × 1.15` on the raw times, and the
board sat red at 1.19× (1.15× when re-measured — the failure was stable, not
marginal). That was never a rendering regression: the gate assumed both
builds draw the same thing, and they no longer do.

| DOM as it stood when the budget was rewritten (5 Aug 26) | reference | port |
|---|---|---|
| `#sbBoard` | 393 nodes / 20 KB | **699 nodes / 37 KB** (1.78× / 1.85×) |
| `#eWeek` | 4173 nodes, 5 days | **5028 nodes, 7 days** (1.20×) |

(The board has grown since — see the current reading below. The point these
numbers make is about the SHAPE of the budget, not their own values.)

The board grew the stores config chips, the personal-inputs group and the
day-version selects; the week grew the weekend. A flat ratio between two
builds drawing different amounts of DOM measures **feature growth**, so it
would have gone red for every feature added while saying nothing about
speed. The budget is now the ratio **divided by that surface's node ratio**
— is a unit of drawing getting more expensive — which is the question the
gate was always for.

Per-node alone has a hole: a bug that doubled the DOM would halve the
per-node cost and sail through while the user waited twice as long. So node
counts are gated too, and **separately**, because they are the one
measurement here that is not machine-dependent — times swing 3× on this VM
and only mean something as a ratio against a reference measured in the same
seconds, while a node count is the same integer everywhere. Ceilings carry
~10% headroom over the measured count, and the live numbers are always
`probes/perf-port.cjs`'s `DOM_CEILING` — currently **board ≤ 960**
(measured 835: 829 after the 14 Aug board-full-editor batch — see the
boundary note below — plus six for SANS Availability's board panel, which
draws its header and its empty-state line on every day, records or not),
**week ≤ 4000** (measured
3621 — LOWERED from 5530 on 13 Aug 26 when the Available-crew panels started
booting folded; the argued comment sits on the ceiling itself in
`perf-port.cjs`). Tripping one is not
automatically a fault; it is a prompt to check the time and then raise the
number deliberately, in the PR that adds the nodes, beside a fresh
`npm run perf` showing the per-node cost held. The board has been raised
four times that way — 770 → 810 for the stores `C` button and its on-chips
in the remarks cell (7 Aug 26), 810 → 860 for the reorder grip, the two
nudge buttons, the per-section Auto sort and Sort all (8 Aug 26),
860 → 880 for the late-input mark (9 Aug 26), and 880 → 960 when the two
input panels became editable ground-programme rows (10 Aug 26 — about six
nodes a row, and a wide margin because that count moves with data).

**897 → 911 on 12 Aug 26, and the ceiling did NOT move for it.** The `+`
that reveals a hidden empty remarks box is one `<button>` per duty, sim and
ground row (`sbRowCtl`), so it costs about one node a row and the measured
count rose 14. That is what the 10 Aug margin was taken for; spending it is
the intended use, not a reason to raise 960 again. **Note which way this
number runs, though:** the box those buttons reveal is hidden with
`display:none`, which removes it from LAYOUT and not from the DOM — the
board got 30px shorter a row and 14 nodes heavier at the same time. A future
change that trades pixels for nodes this way should expect the same, and
should re-read this count rather than assuming a shorter board is a lighter
one. The 13 Aug board redesign then took it 911 → 923 (the inline `+ Wave`
panel header and the AMT FCP/RCP column labels), still without moving the
ceiling. The 14 Aug board-full-editor batch took it 923 → 829 DOWN, despite
adding the in-time blocks, area strips, Traffic buttons and the OFT seat
grid: the sign-off bar moved OUT of the measured `#sbBoard` into its own
`#sbSign` element (so the checks panel could sit below it), and its nodes
left the count with it — the same lesson in the other direction, a heavier
board reading lighter because the measure's boundary moved, not because the
content shrank. 131 nodes of headroom remain.

**That last raise took a wider margin than the others, on purpose.** The
late-input badge is one `<span>` per late input drawn, so on the day this
gate opens the count reads 859 with the mark off and 862 as the seed stands,
both measured through the gate's own boot; the day's fourth input is a
downchit, which is exempt from the mark and so can never add a node. It is the first surface here whose node count moves with **data**
rather than only with code: a date edited on the Inputs page can add or
remove a node with no source change at all. A ceiling set to "measured + 1",
which is what the two earlier raises took, would go red on a data change and
teach the next reader to ignore it.

**The board's margin was sized against a six-store measurement, and the
stores feature supports up to `MAX_STORES` (24, `engine/stores.ts`) — worth
knowing before this gate trips on a legitimate configuration.** A squadron that grows its
list toward the cap adds roughly one `.stchip` per store per aircraft line
on the board (the week is unaffected — its chips sit in a wrapping
`inline-flex` row, not a fixed grid, so it has no per-store DOM-count
concern the way `.sb-rcell`'s nine-column contract does). A near-cap
squadron would very plausibly trip `DOM_CEILING` for a configuration the
feature explicitly promises to support, not for a regression — the fix in
that case is the same one this section already prescribes for legitimate
growth: check the time, then raise the ceiling deliberately in the PR that
needs it, beside a fresh `npm run perf`. Not raised pre-emptively here
because no squadron has approached the cap yet and a margin sized against a
number nobody has hit is a guess, not a measurement.

Rejected: comparing the port against a *recorded port* time. Node counts
travel between machines, milliseconds do not — one round of the same edit
reads 210–830 ms here — so a recorded time from another container would be
noise. The reference stays in the loop precisely because measuring it beside
the port is what cancels the machine out.

### What it now reports

| 4×-throttled phone, painted cost | reference | port | ratio | per node |
|---|---|---|---|---|
| one-day edit | 153 ms | **204 ms** | 1.32× | 1.09× |
| no-op repaint | 59 ms | **43 ms** | 0.72× | 0.59× |
| board edit | 262 ms | **336 ms** | 1.27× | **0.58×** |
| board no-op | 81 ms | **54 ms** | 0.64× | 0.29× |
| `#eWeek` DOM | 4173 nodes | **5056 nodes** (1.21×) | | |
| `#sbBoard` DOM | 393 nodes | **859 nodes** (2.19×) | | |

**Four assertions** — two DOM ceilings and two behavioural checks. (It was
seven until 10 Aug 26; the three per-node timing budgets became printed
figures, above. Block F, a scroll-hold measured across the Edit-mode toggle,
was two more before that; it went with the toggle on 9 Aug 26 and nothing
replaced it, because no other control repaints all seven days in one
gesture. D measures the same scroll-hold across an edit.) All four are
solidly green every run — the one that was not is the one that went.
Re-measure, don't quote these numbers.

The port paints 2.19× the board for 1.27× the time, which is why the board
edit reads 0.58× per node — comfortably faster than the reference at the same
amount of drawing, exactly as the two no-op metrics said all along. The
behavioural pair: the other days' DOM is untouched by a day-1 edit, and the
week holds its scroll through an edit. (An open board field surviving an
unrelated panel change is printed too, but informational — no assertion, the
same as in the reference's own perf3.)

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
- an edit holds the week's scroll;
- a hole in a programme row renders NO element, so the pucks either side do
  not shift;
- puck type is 9px and a descender's ink stays inside the 15px puck.
