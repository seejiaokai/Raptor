# Brief for Fable — the keyboard fault on his iPhone, after six Opus rounds (25 Oct 26, D1366)

**Taken 27 Oct 26 by Fable on `claude/kbs-fable`** (the branch of pull request 569 had merged): his ruling D1412, the four recordings read frame by
frame, option (b) built — the phone carries the window — with the evidence sheet `raptor-port/docs/handpass/2026-10-27-kbs-carried.md`.

**Who, when:** Fable, on his call (D903), after his weekly reset (Mon 26 Oct 26, evening) — D1366. Written by the chat
that took his "still similar bug" on round 6, so the fixer starts with the whole story. Branch `claude/lw-m3-placing-leave`
(pull request 569) unless he names another; if that branch has merged, cut `claude/kbs-fable` from `main`.

## What he sees

On his iPhone (Safari, Apple's font, display as the phone draws it — `owner-uses-iphone`), the Inputs page → a day →
"+ Input" → the input window → Remarks tapped: as the keys come up, the window does not hold still — for a few frames the
page behind it (the day panel, its "+ Input") shows above the window's top, then the window settles. His words on
round 6: *"Still similar bug"* (25 Oct 26, 12:57). On round 5: *"I can see the top of the background behind this window …
The old one was like smoother."* His Tracker's All events window he called "better now" on round 5.

**His recording:** he saves a fresh one for this chat (D1366) — ask for it first if it is not attached; have him close the
tab and reopen the preview before recording (his Safari keeps the page it loaded). `?kbdebug` on the address shows the
phone's numbers on screen (round 3). Read it frame by frame with `raptor-port/scripts/handpass/video-frames.mjs`
(1/60 s around the tap).

## The six rounds (all on 25 Oct 26, all Opus) — the detail is the evidence sheet

`raptor-port/docs/handpass/2026-10-25-kbs-other-remarks.md`, a section a round, each with its cause, its fix, its tests and
its walk. In one line each:
1. Remarks lifted behind the window's pinned Cancel / Add — the lift keeps a panel's pinned foot clear (`0d1e5ec42`).
2. The phone's late pan left a held window behind — a lifted window follows the visible screen (`9442fe279`).
3. A window brought down to the visible top when the phone panned past it; `?kbdebug` added (`1b85cff0f`).
4. His readouts: the lift read his iPhone's numbers the wrong way — measured from the visible top (`da4fde3a0`).
5. The Tracker twitched — a moved window glides over a quarter second; `compensate` holds it still as the page slides
   (`7cfc7f9a8`). **This is the round after which he said "the old one was smoother".**
6. The glide ran 90–145 points ahead — every glide put on his phone's own measured slide (`cfe7db989`). His look:
   still similar.

The code: `raptor-port/src/ui/kbscroll.ts` (673 lines — the lift, the hold, `glide`, `compensate`, `SLIDE_UP` /
`SLIDE_DOWN`); tests `raptor-port/src/ui/kbscroll.test.ts`, `raptor-port/e2e/kbscroll.spec.ts` (KS3d–KS3k); walks
`raptor-port/scripts/handpass/kbs-his-measure.mjs`, `kbs-slide-walk.mjs`. The older history (19 Oct 26, the Scheduler
Board, D1081 "nothing jumps as the keys open or close", and an earlier Fable read) is in the commits on `kbscroll.ts`
from `3e30c8cc6` on.

## What the six rounds could not do — and what you should weigh

- **Every round passed its stand-in keyboard and failed on his phone.** The stand-in plays numbers measured off his
  recordings, but Safari decides when it pans, by how much and on what curve, and tells the page late (~30ms) and in
  pieces. A fix that steers the window frame by frame against Safari's own slide is tuned against a model of it.
- **Weigh first whether to stop steering.** His "the old one was smoother" points at the build before round 5's glide
  (round 4, `da4fde3a0`), or further back. Options to compare, with what each costs him on screen: (a) go back to round 4's
  behaviour (the lift places the window once, no glide) and keep rounds 1–4's fixes; (b) let Safari move the window as page
  content does (what D1081 did for the Scheduler Board) instead of the app moving it; (c) a guardrail — whatever moves,
  nothing of the page shows above the window (its backdrop or its own colour reaching above its top while the keys move);
  (d) a seventh steering fix. The design rule: a guardrail over a bug cascade (`prefer-guardrail-over-bug-cascade`).
- **Seen, not changed (older):** as the keys start, a held window shortens at once to its final room, so for about a tenth
  of a second the page behind shows between its foot and the rising keys.
- Not swept: the Leave War's sheets place themselves (`raptor-port/src/leavewar/ui/Sheet.tsx followVisible`) and may jump
  the same way.

## How to finish

The bug-check order (`raptor-port/docs/bug-check-order.md`) in full: the tier (WALK at least — the one lift moves every
window raised for the keys), the roll-call (the sheet's §The sixth round has it), red first, the walk with pictures on
every window the lift moves, and **his iPhone look before anything is called fixed** — the stand-in's pass has never been
enough. Pictures of something moving are timed on the compositor's clock (`raptor-port/docs/walk-scripts.md` §5). Speak to
him plainly (`.claude/rules/plain-language.md`). The fault goes in the bug-check order's list of faults the walks missed
(§7.11, D1297) with why the stand-in missed it.
