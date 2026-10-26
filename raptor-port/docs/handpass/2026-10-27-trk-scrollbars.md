# The Tracker's stray scroll bars — evidence sheet (27 Oct 26)

`claude/trk-scrollbars` · [TRK-STRAY-SCROLLBARS] · his D1405 (find and fix them first) and D1406 (his "A": on a touch
screen the chart draws no scroll bars; the Info half, Show All, the windows and a desktop keep theirs).
Pictures: `docs/img/handpass/2026-10-27-trk-scrollbars/`. Question page put to him (his recordings marked):
https://claude.ai/artifact/PTMphm5ggooqaBT5pJcesF

## The fault, from his two iPhone recordings (06:03, 06:05)

The iPhone's own fading scroll bars on the chart box, which the phone scrolls itself since D992: one down the right
edge, one along the foot, shown whenever the chart moved; mid-pinch the sideways one floated halfway up the chart
(06:03, 0.5s) and the up-and-down one jumped to the top left (06:05, 0.5s — the one he marked). Frames pulled with
`scripts/handpass/video-frames.mjs`. The desktop (his PC, 125%) draws exactly two bars, the chart's and the Info panel's,
both scrolling something real (`scripts/handpass/trk-sb-inventory.mjs`: every box on the Tracker that can scroll, with
the test browser's hidden bars switched back on).

## The eight answers and the tier

1 money NO (no figure, no OIL) · 2 published record NO · 3 saved data NO (a style only) · 4 shared drawer NO (one box,
`.board`, drawn once) · 5 new gesture or mode NO (the scroll and pinch are unchanged; a bar is taken away on touch
screens only) · 6 new surface NO · 7 roles NO · 8 warning list NO. **Tier: LOOK** — a look on one surface. Taken a little
further than LOOK because the fault was his find: a finger drag, a pinch and the Info half driven on a phone, the wheel
on a desktop.

## Roll-call — the thing: a scroll bar on the Tracker

| Place | Shows a bar after the change | Why |
|---|---|---|
| The chart box, touch screen | NO, because D1406 — the fault | `.board` under `(hover:none) and (pointer:coarse)` |
| The chart box, mouse screen | YES, because a mouse scrolls it by its bar | measured 21px at 125% |
| The Info half / Info panel, both | YES, because D1406 keeps it | measured 22px on the desktop; `auto` on the phone |
| Show All's list (`#saBody`) | YES while open, because D1406 keeps it | untouched |
| The windows (Legend, flex, marking pop-up, lull calendar) | YES where their content runs over, because D1406 keeps them | untouched |
| The Failures card's chips | YES where they run over | untouched |
| The bar's search list (`.findlist`) | YES where it runs over | untouched |
| Lost with the chart's iPhone bar: holding it to scrub the chart | a finger drag scrolls it the same | the phone's own scroll stays (D992) |

## Sizing (§7.0)

1. Type E (look, one surface). 2. Only a walk sees that the chart still scrolls and pinches with the bars gone, and that
the desktop keeps its bars; no desktop browser draws the iPhone's own bars, so whether they are gone on his iPhone is his
look. 3. The ledger's type-E walks: short host walks find the seams of the touched surface. 4. The host alone, one
assertion script (`scripts/handpass/trk-sb-walk.mjs`) of 10 steps on one served build: phone 402 (touch, Chromium) and
desktop 1536 at 125%. The rule itself is carried by `e2e/trk-scrollbars.spec.ts` at a touch screen and a mouse screen.
5. The ledger row added. §7.11's lessons: 1 (one state only) — the phone walked at rest, after a drag, mid-pinch, after
the pinch, and on Info; 2 (one speed) — the drag at a person's speed (30px a frame); 3 (feedback) — the zoom figure read
after the pinch; 4 and 5 do not apply (no window, no box brought into sight); 6 (added today, below) — his iPhone look.

## Walked (`trk-sb-walk.mjs`, 10/10 pass)

| Step | Said |
|---|---|
| phone: the chart box hides its bars | scrollbar-width none, bar widths 0/0 |
| phone: a finger drag still scrolls the chart | scrolled 339 → 624 |
| phone: mid-pinch the chart box still draws no bars | scrollbar-width none |
| phone: the pinch still zooms the chart | 42% → 143% |
| phone: the Info half keeps its normal bar | scrollbar-width auto |
| phone: no page errors | none |
| desktop: the chart keeps its bar | 21px |
| desktop: the Info panel keeps its bar | 22px |
| desktop: the wheel still scrolls the chart | 295 → 695 |
| desktop: no page errors | none |

Pictures opened by the host: `p2-phone-after-drag`, `p3-phone-mid-pinch`, `p4-phone-after-pinch`, `p5-phone-info`,
`d1-desktop-after-wheel` — no bar on the phone's chart; the Info half and the desktop as before.

## Carried by a test

`e2e/trk-scrollbars.spec.ts` — red before the rule (phone: "auto", wanted "none"), green after; the desktop case green
both times. Its premise is checked inside it: the browser takes the phone context for a touch screen.

## Not walked, and why

His iPhone itself: no desktop browser draws the iPhone's own overlay bars, so that they are gone there is his look on the
preview. An iPad with a trackpad, a touch-screen laptop: not walked (a screen whose primary pointer is a mouse keeps its
bars by the media query's reading of the primary pointer — the reader's note below).

## The read

A fresh, blind Opus read of commit 22cacbcd2 (D790): **no findings.** Verified: the rule wins inside the `#page-tracker`
wrapper (same weight, later); nothing else styles the chart's bars; the pinch makes no new scroll box (`.flowwrap` is
not one, `.boardcol` clips it); WebKit's own source hides the iPhone's bars for `scrollbar-width:none` on a box that
scrolls (iOS 18.2 and later); the test fails without the rule and runs in CI; D1406's short line matches its full row.
Its notes on the test, and their dispositions: (a) a rule narrowed to phone widths would still pass — **taken**: a third
case, a touch screen 1180 wide (an iPad on its side), green; (b) "still scrolls" set the scroll from code — left: the
walk's finger drag carries it; (c) the Info half's check only guards a later change — left as that guard. Not verifiable
by it: his iPhone (mid-pinch included — whether the top-left bar was the chart's, though no other box here can scroll),
an iPhone older than iOS 18.2, an iPad, a real Android phone.

## Gates

While the repo is public, GitHub's run of the pull request is the gate set (D1086); on his PC: the new spec, red then green.
