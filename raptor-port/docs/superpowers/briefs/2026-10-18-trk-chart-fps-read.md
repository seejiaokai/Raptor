# Brief — the fresh, blind code read of `[TRK-CHART-FPS]` (D992), 18 Oct 26

You are a fresh reader: you did not write this code and have not seen the chat that did. Read the live files; change
nothing; report findings only.

## What changed, and why

On a phone the Tracker's flow chart (`#board`) and its Info half (`#side`) were scrolled by the app's own finger drag and
glide (`dragScroll` + `glide.js`, built 17 Oct 26 as `[TRK-SCROLL-GLIDE]`, rulings D985–D989). On the owner's iPhone 17 Pro
in Chrome (Apple's WebKit underneath) a page's own motion is held near 60 frames while the phone's own scrolling runs at
120, so the chart looked choppy; and a pinch set the chart's CSS `zoom` at every step, laying the whole chart out again
(measured about 12 frames a second with the CPU slowed 4×). His ruling **D992**: on a phone the chart and the Info half
are scrolled by the phone itself (its own glide, bounce and touch-to-stop); a pinch stretches the chart as a picture while
the fingers move and lays it out sharp once at the lift, the spot under the fingers kept under them. Unchanged: a mouse
drag stops where it is let go and never bounces (D988); Edit chart layout pans and pinches its own view; the app's own
move (a pick, a search, the keyboard, the zoom buttons) stops a glide first and wins (D989); after a pinch the finger left
down does nothing until it lifts (D134).

The diff: `git diff origin/main...claude/trk-chart-fps -- raptor-port/src raptor-port/scripts/tracker/smoke.mjs`
(`src/tracker/app/core.js` — `dragScroll`, `stopGlide`, `enablePinchZoom`; `src/tracker/tracker.css` — the two boxes'
`touch-action` and the Info half's `overscroll-behavior`; `src/tracker/components/SidePanel.jsx` — comments; `glide.js` and
its test deleted). Read the whole of `enablePinchZoom`, `dragScroll`, `stopGlide`, `chartPointAt`, `placeChartPoint`,
`applyFlowZoom`, `padBoard`, `setFlowZoom`, `redrawKeepView`, and every caller of `stopGlide`.

Hand in hand: the evidence sheet `raptor-port/docs/handpass/2026-10-18-trk-chart-fps.md` (its roll-call and walk results).
The rulings, in full: `grep -h '^| D99[12] |\|^| D98[5-9] |\|^| D134 |' .claude/decisions-full/*.md DECISIONS-ARCHIVE.md`.

## What to look for — absences first

1. **The engines.** The owner uses an iPhone (WebKit — Chrome there too); the walk ran in Chromium only, which makes no
   glide from scripted fingers. For each of these, say what WebKit on iOS does and whether the code is right there:
   `touch-action: pan-x pan-y` on an overflow box with non-passive `touchstart` / `touchmove` listeners; `preventDefault`
   on a second finger's `touchstart` (cancelable or not, before and after the phone has begun to scroll); whether pointer
   events keep coming for both fingers once that is done, or a `pointercancel` takes them; the `overflow:hidden` toggle in
   `__glideStop` as a way to stop a momentum scroll (does the scroll place survive it; is the glide really dropped; any
   flash); a `transform` and `transform-origin` on an element that also carries CSS `zoom` (the code measures one
   transform pixel on screen instead of assuming).
2. **Every state × every event of the pinch** (`start`, `pinching`, `held`, `pts`): a finger lifted mid-pinch; a lost lift
   (a redraw takes the finger's target); a redraw of the board mid-pinch (the `.flowwrap` replaced — is the transform
   left on anything, is the final zoom and place right); Edit chart layout switched while a pinch runs; a pinch whose
   fingers never move; the zoom reaching 10% or 300%; three fingers.
3. **The app's own moves after a finger scroll** — every caller of `stopGlide`: does each still land where it did; can
   the overflow toggle undo or shift a move (the zoom's anchor, a landing, Home / End, the side panel's − / +)?
4. **What the old code did that the new does not** — list it from the REMOVED code (the click guard, the stretch, the
   wheel stop, `notOurs` for a finger, the press that only stopped a glide) and say for each who does it now (the
   browser, or nobody) and whether nobody is right.
5. **A mouse** on a desktop: every behaviour of the old mouse path kept (no stretch, the click after a drag swallowed,
   presses on buttons, inputs, `[data-rm]`, `[data-lull]`, fixed windows, the `skip` for balls and lines left alone)?
6. **The Info half**: its long-press chips (`EventChip`), the Failures card's own scrolling list, the lull calendar window
   (fixed, inside `#side`) — with the browser now scrolling `#side`.

## The rules for a finding

A finding is a concrete failure — the gesture, the size, the engine and what goes wrong on screen — with its cause in the
code and its exact fix (D489). **A problem that lives only in data already stored is not a finding (D56)** — nothing here
stores anything. Say plainly what you could not decide without a real iPhone; those go on his look card, not into a fix.
Give findings most-severe first; then the items you checked and found sound, one line each.
