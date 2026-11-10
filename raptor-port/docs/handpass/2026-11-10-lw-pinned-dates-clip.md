# Evidence sheet — the Leave War's pinned dates trimmed by a clip path (D1963) — 10 Nov 26, chat 52

Branch `claude/lw-frozen-bar-stutter`, pull request 743. Tier: WALK (no OIL, published record, saved data, roles or
warnings; a look that is drawn in several copies and has a twin on Quals).

## 1. What changed
`src/leavewar/ui/matrix.css`, where the dates follow the grid by the scroll itself (`.lw-sda`): the pinned box no longer
trims by `overflow`; its track trims by `clip-path: inset(0)`; while two fingers pinch the clip path is lifted as the
overflow was. Nothing else. His ruling D1963: on his iPhone the dates then go blank less soon on a swipe to the page's
foot — his own side-by-side look at trial link 15 against the app as built. The blank on a hard pull and the swipe-down
flash stay (D1961); the flash waits for the large scrolling change, to be filed at the close.

## 2. What this sheet cannot show
No PC browser draws the blank (chat 52's first measurement — the block in `HANDOFF.md`), so nothing here proves the
cure. The proof is his iPhone, on the branch's preview. What is checked here is that the change breaks nothing.

## 3. Roll-call — every place the app draws a pinned heading
| Place | Has the new trimming? | How it was seen |
|---|---|---|
| The Leave War grid's pinned dates, phone, at rest | has it | pictures `webkit-phone-1-pinned`, `chromium-phone-1-pinned` |
| The same after a sideways scroll | has it | `…-phone-2-sideways` — the dates stand over their columns, none left of the corner |
| The same at the page's foot | has it | `…-phone-3-foot` |
| The same at the year's far end | has it | `…-phone-4-year-end` |
| The same on a desktop, at rest and scrolled sideways | has it | `desktop-1-pinned`, `desktop-2-sideways` |
| The same while two fingers pinch | has it — the clip path lifted, the pinch's own trim in force | the existing pinch tests of the Leave War browser file, all green (D1870, D1287) |
| The same in Rearrange | has it — Rearrange changes only the name column's width | the Leave War browser file's Rearrange tests, green; the fresh read §2 |
| Reduced motion | has it — that block is untouched | the browser file's reduced-motion test, green (D1870) |
| A browser without scroll-driven animation (no `.lw-sda`) | must not, because the change is his choice for the scroll-driven path he tested; the old path keeps `overflow: hidden` | the fresh read §3 |
| The OIL tab's grid and the Balances page | must not, because they do not use this pinned box | read of `matrix.css` |
| Quals' pinned heading | must not, because its track already trims by `overflow: clip`, he reported nothing there and never tried it — D1963's condition is not met | `desktop-3-quals`, unchanged |

## 4. The walk (the host, on the PC, the built bundle served on 4180)
Script: the scratchpad's `walk1963.mjs`. WebKit and Chromium at 402×874 with touch, Chromium at 1440×900; signed in as
the admin; the Leave War opened; the page scrolled down until the row pins, then sideways, then to the foot, then to the
year's end. At every stop: the box shown, box and track `overflow: visible`, track `clip-path: inset(0px)`, a date found
inside the strip, none found over the corner, the page no wider than the screen, no console or page error. 10 stops,
10 PASS. Pictures: `docs/img/handpass/2026-11-10-lw-pinned-dates-clip/` (11). The host opened the phone's sideways
picture and the desktop's and read them: dates over their columns, the corner whole, nothing spilled.

## 5. Tests
- New, red first on the old styling at both sizes, then green: `e2e/leavewar.spec.ts` "the pinned dates are trimmed by a
  clip path, not by overflow, and none shows outside their strip (D1963)".
- The whole Leave War browser file on the new styling: 420 passed, 104 skipped (the other size's), 0 failed.
- `npm run lint:changed`: no new finding. GitHub's run of the pull request is the full check (D1086).

## 6. The reads
- **The fresh, blind Opus read** (brief: `docs/superpowers/briefs/2026-11-10-lw-pinned-dates-clip-read.md`): no finding
  in the styling. One finding on the test — on a phone the box runs edge to edge, so its checks beside the box could not
  fail. Reproduced by reading, and fixed: the test now also holds that the clipped track lies wholly inside the box and
  that no date shows just under it; the check over the corner, which could never fail, is gone. Re-run green at both
  sizes. Tidiness note, filed not fixed: the pinch rule's `overflow-y: visible` now restates the resting value.
- **Astra's read:** see §7.

## 7. Astra's read
Astra (Codex, read only, the same brief, blind to the Opus read): no confirmed fault in the styling — clipping, stacking, shadows, scroll writes, the pinch's precedence on both paths, Rearrange, reduced motion, the old path and Quals all checked. One finding, the same as the Opus reader's: on a phone the test's side checks pass by themselves and nothing is tried under the row, so a track shifted 4px down would pass. Already fixed by the change in §6 (the track must lie inside the box to half a pixel, and no date may show just under it), which Astra did not see — it read the committed test. Its own browser check was blocked by its read-only sandbox. Tidiness: nothing to file.

## 8. Lessons added
None: no fault he found was one a walk missed — the fault shows on no PC browser, which the walk ledger's row records.

Walk: docs/handpass/2026-11-10-lw-pinned-dates-clip.md · 11 pictures · 11 surfaces · 1 order · MISSING: none (the cure itself can only be seen on his iPhone — his look)
