# Timing — does hiding SANS availability on a day he is not SANS slow the app? (D2341, chat 152)

**The answer: no difference a person would notice.** Not one of the 11 single measures and 2 repeated-step measures
below shows AFTER slower by more than the gap between one run and the next. The only lean is the Scheduler Board's
day step. In the ordinary demo world it is about 11 ms slower when the runs are compared in pairs, but its long-task
CPU goes up by only about 4 ms a step. That is at 4× CPU slow-down, so about 1 ms on a normal machine. The step's own
spread is 150–310 ms (p10–p90), and the lean did **not** grow when the SANS records went from 6 to 34. So it is not the
check's cost growing with its work.

## What was compared

- **BEFORE**: commit `8d64b0c0d`, the parent of `cc831de21`, which added `sansShownOn` / `sansShownAny`. It was built
  outside the repo from a `git archive` of the build inputs (src, public, reference, sample-data, configs) with
  `npx vite build`, using the main folder's modules through a junction that was removed straight after.
- **AFTER**: the existing `raptor-port/dist` (branch head `ddd8c4a44`), not rebuilt.
- Both were served by the main folder's `vite preview`: BEFORE on 4412 (with `--outDir` pointed at the BEFORE bundle;
  that folder has no `node_modules` of its own), AFTER on 4413. Each port served its own bundle (checked by the index
  script name). Both servers were stopped by port at the end.
- **Note:** AFTER is five code commits on, not only the hiding. It also has D2340's filing-ahead rules, the rewritten
  tests and D2346's faded days before a man's own SANS date. The timing therefore covers everything since
  `8d64b0c0d`, with the hiding as its main reading change.

## Method (`docs/performance.md` Part 1)

- Real Chromium (Playwright 1.62.1), desktop 1536×864, **CPU throttled 4×** (the owner's slow office laptop, per
  Part 1). The clock was installed at Wed 15 Jul 26 09:00, and each run signed in as `ad`.
- **A fresh browser context every run.** Runs were **interleaved** (B,A then A,B, alternating) so drift hit both
  builds. Warm-up runs were dropped.
- Timing was taken **inside the page** with the real `performance.now` / `requestAnimationFrame` / `setTimeout`, saved
  by an init script before the fake clock replaced them. Only the timer's own helpers were put on `window`
  (`__rNow`, `__rRAF`, `__rST`, and a short-lived `__tm`); no app state was written.
  - **drawn** runs from the press (an element `click()`, or for the SANS day and the board's first open, the first real
    `pointerdown` of a Playwright mouse click, because those open on the pointer-gesture machine) until the result is in
    the page and that frame has painted (rAF, then `setTimeout 0`).
  - **long-task CPU** is the sum of `longtask` entries (tasks over 50 ms) from the press to the moment the page settled
    (no DOM change for 200 ms).
- **Two worlds:**
  - **demo**: the demo data as shipped, with 6 SANS availability records.
  - **stress**: a worse world, filed once per build **through the app's own controls**. On the SANS calendar, a month
    drag opened "+ Commitment", a person was picked, then Add. Every one of the 11 SANS men was filed for every day of
    July (split around his own demo days, which the app refuses to double-file) and every day of August. That made 34
    SANS records, so each July and August day carries 11–12 records the check must judge. The browser's saved data
    (IndexedDB) was then kept and loaded into each run's fresh context. Every run read back 34 records, and the 15 Jul
    day window listed 8 people.
- **Two series:**
  1. A walk of single measures, 2 warm-ups + 15 runs per build per world.
  2. A repeated-steps series, 1 warm-up + 8 runs per build per world. Each run pressed the SANS calendar's month arrows
     24 times (6 forward, 6 back, twice) and the board's day arrows 24 times. That gave 192 steps per build per world.
- 0 failed runs and 0 page errors in all 100 runs.

## Results — series 1, one press each (median of 15, ms; spread is p10–p90)

The paired figure is the median of (AFTER − BEFORE) within each interleaved pair. It is the fairest single figure,
because the PC slowed down over the series.

### Demo world (6 SANS records)

| Measure | BEFORE | AFTER | A − B (median) | % | Paired A − B |
|---|---|---|---|---|---|
| Inputs page opens (list) | 1576 (1223–2100) | 1478 (1165–2039) | −98 | −6.2% | −64 |
| SANS tab → month drawn | 480 (385–594) | 444 (364–537) | −36 | −7.6% | −35 |
| SANS month › (Jul → Aug) | 379 (325–466) | 361 (285–511) | −18 | −4.8% | −12 |
| SANS month ‹ (Aug → Jul) | 307 (283–406) | 319 (283–406) | +12 | +4.0% | 0 |
| SANS day 15 Jul opens | 556 (444–698) | 505 (466–628) | −51 | −9.2% | −4 |
| Edit Schedule opens, week drawn | 1351 (1148–1912) | 1364 (1152–1693) | +13 | +1.0% | −89 |
| Edit Schedule, a week on | 1027 (720–1264) | 1041 (784–1225) | +14 | +1.4% | +3 |
| Edit Schedule, back a week | 1165 (905–1395) | 1212 (906–1377) | +47 | +4.0% | −19 |
| Board opens (Wed) | 1531 (1143–1769) | 1389 (1226–1712) | −142 | −9.3% | +36 |
| Board, next day (Thu) | 279 (244–401) | 323 (241–356) | +44 | +15.7% | +7 |
| Board, next day (Fri) | 190 (176–246) | 233 (168–266) | +43 | +22.8% | +11 |

### Stress world (34 SANS records, every SANS man every day of Jul and Aug)

| Measure | BEFORE | AFTER | A − B (median) | % | Paired A − B |
|---|---|---|---|---|---|
| Inputs page opens (list) | 2020 (1779–2214) | 1986 (1460–2272) | −35 | −1.7% | −69 |
| SANS tab → month drawn | 622 (549–669) | 607 (579–655) | −14 | −2.3% | −20 |
| SANS month › | 525 (466–575) | 512 (458–568) | −13 | −2.4% | −25 |
| SANS month ‹ | 481 (461–524) | 467 (403–495) | −15 | −3.1% | −28 |
| SANS day 15 Jul opens (8 people) | 738 (669–784) | 719 (644–772) | −19 | −2.5% | −11 |
| Edit Schedule opens | 1923 (1676–2187) | 1791 (1272–1992) | −132 | −6.9% | −162 |
| Edit Schedule, a week on | 1268 (1198–1333) | 1222 (1018–1268) | −46 | −3.7% | −83 |
| Edit Schedule, back a week | 1383 (1205–1490) | 1311 (1117–1418) | −73 | −5.2% | −81 |
| Board opens (Wed) | 1721 (1591–1872) | 1639 (1522–1763) | −82 | −4.8% | −95 |
| Board, next day | 343 (325–391) | 315 (286–366) | −28 | −8.2% | −29 |
| Board, next day again | 245 (218–288) | 236 (192–357) | −9 | −3.8% | −12 |

### What the demo board-step figures show

The demo world's two board-step medians (+44 and +43 ms) come from a slow drift across the series, not from AFTER. The
per-run lists (in `raw-demo.jsonl`) rise for both builds in the later runs, and the paired figures are only +7 and +11.
The repeated-steps series below was run to settle it.

## Results — series 2, repeated steps (192 steps per build per world, ms)

| World | Step | BEFORE median (p10–p90) | AFTER median (p10–p90) | A − B | Paired run-medians A − B | Long-task CPU A − B |
|---|---|---|---|---|---|---|
| demo | SANS month ‹ › | 355 (320–401) | 359 (314–407) | +4 (+1.1%) | −2 | +4 |
| demo | board day ‹ › | 239 (151–311) | 256 (153–328) | +17 (+7.0%) | +11 | +4 (64 → 68) |
| stress | SANS month ‹ › | 420 (370–479) | 434 (369–477) | +13 (+3.2%) | −7 | +6 |
| stress | board day ‹ › | 224 (154–293) | 227 (153–302) | +3 (+1.2%) | +7 | +3 (63 → 66) |

## Judgement

- **No measure is slower beyond its spread.** The largest AFTER-slower medians are the demo board steps:
  - in series 1, +44 and +43 ms, but paired only +7 and +11, a drift effect;
  - in series 2, +17 ms pooled and +11 paired, against a p10–p90 spread of about 160 ms.
- In the stress world, the measures that open the SANS calendar, its day, Edit Schedule and the board are all **as fast
  or faster** in AFTER.
- The board step's lean is real at most at **3–4 ms of script time per step at 4× slow-down, about 1 ms at full speed**.
  That is under one frame (16 ms), and it did not grow with 5½ times the SANS records. A check whose cost grew with its
  work would have grown here. So it is either noise or one of the other four commits, not the hiding.
- The "one quick check" promise (D2341) holds on everything measured.

## What was not measured, and why

- **The phone, and his iPhone in particular.** This was desktop Chromium only, as the brief set. WebKit on a phone was
  not run.
- **A SANS posting set for a date ahead.** The demo has none, and the stress world did not add one. With one, the
  check also walks the saved posting-outs on each ask (the posting-ahead lookup). That list is built once and reused,
  and only a handful of people have one, so the cost is likely small, but it is unmeasured.
- **The Inputs page's own calendar tab** (its day lists now also ask the check) and **the Leave War** were not timed.
  The Inputs page's list, which also asks the check through `sansShownAny`, was timed as it opens ("Inputs page opens" in both tables).
- **Long-task CPU for the SANS day's opening** read 0 in most runs, because no single task passed 50 ms after the real
  press. Its time to drawn is the figure to use.
- **Attribution:** no profiler was used. Part 1 says to time and attribute in separate runs, and nothing was slower
  enough to need finding.

## Files

- Raw per-run logs: `D:/raptor-work/c152-timing/raw-demo.jsonl`, `raw-stress.jsonl`, `raw-steps-demo.jsonl`,
  `raw-steps-stress.jsonl`, with console logs `log-*.txt`.
- Scripts: `time.cjs` (series 1), `time-steps.cjs` (series 2), `stress-build.cjs` (the stress filing),
  `analyse.cjs` / `analyse-steps.cjs`, all in `D:/raptor-work/c152-timing/`.
- The stress world's saved browser data: `stress-before.json` and `stress-after.json`, with a picture of each.
