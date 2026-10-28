# The Leave War's month strip lights the month pressed — evidence sheet (28 Oct 26)

`claude/leave-war-m5-handoff-3a6602` (pull request 585) · his find on the preview, 28 Oct 26 — *"im looking at feb but the MAR
month is shown selected"*, five pictures of his wide desktop (JAN to MAY pressed), *"No i mean i click on the jan icon, MAR
lights up"*, *"make sure u check Jan to Dec"* · his D1477. Pictures: `docs/img/handpass/2026-10-28-lw-month-strip/` (`before/`,
`after/`). Not from the name-puck change on the same branch: the strip's code was untouched by it (checked in the diff).

## The cause

The lit month was the one filling most of the screen (`monthview.ts monthInView`). His desktop shows three or four months at
once, so with the month he pressed whole at the left edge, a longer or later month beside it filled more: JAN pressed → MAR
(31 + 28 against 31), FEB → MAR, APR → MAY, MAY → JUL. At 1536 wide (every walk's desktop) and on a phone the month pressed
always fills most of the screen, so no walk saw it.

## The fix

1. `monthview.ts`: the first month from the left with at least half of its own width on screen is lit; only where none is
   (a phone's two weeks across a boundary) the month filling most of the screen, as before. Red first: `monthview.test.ts`,
   his five screens as spans (JAN pressed gave MAR before the fix).
2. `Matrix.tsx` (`pressedRef`, `pressedAtRef`): the month pressed stays lit while the grid sits where the jump left it — its
   first day at the frozen edge, or, at the year's end where the grid cannot scroll that far, the view at its end with the
   month whole on screen; a scroll away hands the lit month back to the rule above (a month not drawn yet gets a second to land).

## The eight answers and the tier

1–3, 7, 8 NO (a readout's colour; nothing stored) · 4 shared drawer NO (one strip) · 5 gesture NO (the press is the one it
had) · 6 surface NO. Taken as WALK all the same, because it was his find (§7.11, D1297): the check is driven in the running
app at three sizes.

## The walk — `scripts/handpass/lw-month-strip-check.mjs`, 311 checks PASS on the fixed build (after the read's fixes)

At 1536 x 860 at 1.25 (Chromium), **the same 1536 with the grid zoomed out by Ctrl+scroll to 11px a day (his own set-up — his pictures measure 18px a day)**, 2560 x 1000 and an iPhone's 402 (WebKit): every month
pressed JAN → DEC and back DEC → JAN, read at once and again past the grid's idle time (the pressed month lit every time —
NOV and DEC included, where the grid cannot bring them to the left edge); a sideways scroll by hand in twelve steps from
January (the lit month the first one half on screen); back from Approvals; Manning folded and opened; the window narrowed to
his first picture's 1306; DEC pressed, then a request's dates tapped on Approvals (the readout lights where the grid went — the press spent). **On the build before the fix the same script failed 61 times** (wide: JAN → MAR, FEB → MAR …;
1536: DEC → NOV at the year's end, the hand scroll a month ahead). Pictures opened by the host: `before/wide-feb.png` (FEB
pressed, MAR lit — his fault) and `after/wide-feb.png` (FEB lit).

**The cause, corrected by the read:** his 1536 screen with the grid zoomed out (Ctrl+scroll, D1228), not a wider screen — both
show several months at once.

## Tests

`monthview.test.ts` (the wide-screen case, red first); the Leave War's whole unit set 3,690 passed. GitHub's run of pull
request 585 is the full check (D1086).

## Why the walks missed it — the order's §7.11, lesson 11

A reading worked out from how much is on screen was walked only at 1536 and a phone; it is now walked at the widest screen he
uses as well, and pressed at the year's two ends.

## The read — one fresh, blind Opus read of the fix, the ruling and the lesson (D790)

No fault in the rule or the press; three findings, all taken:
1. **A jump from elsewhere never spent the press** — DEC pressed at the year's end, then an October date tapped on Approvals
   (the grid already at its end, so nothing scrolled): DEC stayed lit over October. Every jump now spends it (`Matrix.tsx
   jumpTo`, the strip's own press setting it again after its jump), and so does a change of period. Walked: DEC pressed, a
   request's dates tapped on Approvals, the readout's month lit.
2. **The likely cause was a zoomed-out grid, which the walk never tried:** the zoomed-out pass added (above); lesson 11 now
   names a zoomed-out grid beside a wider screen.
3. **D1477's rule carried the agent's own condition** ("while the grid stays where it landed"): taken out of the rule; it
   stays among the agent's readings.
The fixes are one-line clears and wording, so no narrow read of the fixes (§5).

Walk: 1536 at 1.25, 1536 zoomed out, 2560 and phone WebKit 402, every month JAN–DEC both ways, 311 checks PASS (61 FAIL before the fix), pictures opened by the host.
