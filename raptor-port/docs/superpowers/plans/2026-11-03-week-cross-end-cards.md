# [WEEK-CROSS-END-CARDS] — the plan (3 Nov 26, put to him before any code)

**His rulings:** D1574 (on a phone the cross between weeks is the phone's own scroll onto a full-day end card at each end of
the week, that week loaded under it once the strip rests; the slide retires on the phone), D1575 (the load moves nothing on
screen — the day he rests on stays exactly where it came to rest), D1576 (the desktop stays as it is). The feel mock-up he
approved: `raptor-port/docs/img/handpass/2026-11-03-week-cross-end-cards/mock/` (version 2). Process: HEAVY
(`raptor-port/CLAUDE.md` §Match the process to the risk) — step 2 borrows the live week's data for a moment, and a leak
there is silent (an edit landing on the wrong week, a week saved with another's rows). Bug check: FULL.

## What he sees (phone, 820 px wide or less; Edit Schedule and View-only Sched)

- Past Monday sits last week's Sunday, past Sunday next week's Monday — each drawn exactly as that day draws when its week is
  loaded (the same builder, the same marks, the issues bar, the sign-off box, the available crew), read-only until it loads.
- A swipe past Monday or Sunday is the phone's own scroll onto that card, at the finger's speed. When the strip comes to rest
  there (no finger down, the scroll ended), that week is loaded underneath, landing on that day at exactly the place the card
  stands — to the pixel (D1575). The strip leaves 24 px after its last card so the end card rests where every day rests.
- On View-only Sched the end card is that day's published version, as View-only shows it once loaded (D1010); a member sees
  only View-only Sched.
- The desktop is unchanged (D1576): ‹ ›, the dimmed next-week preview, a click on it.

## How it is built — in this order, each step tested before the next

1. **Proof first (half a day, kept or thrown away):** a function that draws one day of a week that is NOT loaded, with the
   app's own day builder, and leaves the app exactly as it found it. It takes a copy of that week (its saved copy, or the
   plain week where none is saved) as fresh objects — never the live ones — puts it in place of the live week for the
   length of one synchronous call (no paint, no event, no save, no undo entry, no command), checks it (`validate`), draws
   the day, and puts back every piece it moved by reference: the days, dates, the schedule book's fields, the warning
   tables `validate` reassigns, the current week, and every cache the builders keep by day number (the dense strings,
   the publish/OIL/input read passes, peek's own). The test that decides it: for each of the four weeks of the demo data
   and each page, draw ahead, then compare the live app with a copy taken before — every stored value, every cache, the
   markup of every live day — equal; and the drawn card equal to the markup the day gets when its week is really loaded.
   **If the proof cannot be made clean, stop and tell him** — the fallback is a picture of each week's Monday and Sunday
   kept from the last time that week was on screen, with the plain preview for a week never opened this session (a visible
   change at the load for that first cross), and he decides.
2. **When it draws:** after a week is painted and the phone is idle (`requestIdleCallback`, a timeout where Safari lacks it),
   both end cards; again after any change that could change them — an edit on this week (Monday's crew rest reads this
   week's Sunday; next week's Monday reads it too), a request filed or changed, a person added, archived or deleted, a
   publish — debounced, never during a touch or a scroll. Cached by the same kind of key the desktop preview uses
   (`peek.ts peekKey`: the week, its saved-copy generation, deleted people, requests), plus the page. A card not yet drawn
   shows the plain preview (`peek.ts`), never an empty slot.
3. **The strip:** the two end cards as `.day` sections outside the live week's own day list (no `data-day`, as the desktop
   preview keeps `data-peek-day`), inert by construction — no slot, person, fill, editable or draggable attribute, so no
   click, drag or highlight reaches them (the peek's rule). 24 px after the last card on a phone.
4. **The rest and the load:** at rest on an end card, call the existing load (`loadWeek`), then put the landing day on the
   resting card's measured screen place, snap off for that one write; never during a touch. The swipe reading that crossed
   by a pull past the end (`pan.ts` edge overswipe, `pullPastEnd`, the `WEEKJUMP` set by a swipe) and the slide
   (`weekglide.ts`) retire on the phone — removed where nothing else uses them, the desktop's arrows untouched.
5. **Docs in the same change:** `scheduler.md` §Week navigation and `ui-contracts.md` (the D1574 pointers become the rule),
   `feature-impact.md`, `performance.md` (the idle drawing's cost), `file-map.md`.

## Measured so far (this PC; a 4× slower processor as a rough phone)

Checking one week 3.6 ms (18 ms slowed); drawing one day 1.4 ms (8 ms); a week loaded to its next paint 84 ms (470 ms).
So drawing two end cards ahead costs about 10 ms here, ~50 ms slowed, at idle — and the real load, which he rests through on
the end card, is the slow part (the phone is busy for that moment; a touch waits). Measured on his iPhone in the walk.

## What must keep working (the roll-call's starting list)

The week calendar and the week chips (a jump, not a cross); a jump's landing day; the crew panel following the day; search
and highlights; Undo / Redo after a cross and across weeks; the "set default?" offer and every per-week view state; OIL mode
(cleared on a week swap); Monday's crew-rest warning against last week's Sunday; a published day and its amendments on both
pages; a damaged or read-only week (`protectedWeek`) — drawn ahead, never touched; reduced motion (nothing moves anyway);
a resize across 820 px (the desktop preview comes back, the end cards go); the Scheduler Board on a phone (its own ‹ ›,
unchanged).

## Checks

Unit: the proof's equality test, kept as the guard; the end cards' markup equal to the loaded day's; inert attributes.
Browser, by a real finger at his iPhone's size in a VISIBLE Chromium (a headless one never ends the scroll —
`walk-scripts.md` §4) and in WebKit: a swipe onto each end card loads its week with the card's screen place equal before
and after (to the pixel); a swipe inside the week never loads; a touch during the rest-wait cancels the load. The walk,
sized in `walk-ledger.md`, plain-user round included (D1557). A fresh, blind Opus code read (D790). React Doctor: no new
finding. His look on his iPhone.

**Time:** about two days with the check. **Model:** Opus, high thinking.

## The fresh read (3 Nov 26, one blind Opus reader — D790) — folded in; these override the steps above where they differ

1. **The neighbour is checked against the live week, not its saved copy.** Its Monday crew rest, the run of days, "Breaks
   Monday" and `windowDiverges` read this week through `weekctx.ts bundle()` (the saved copy); a real load saves the week
   first. During the draw, hand the checker the live week's current copy by a small override in `weekstash.ts stashGet`
   — never `stashPut` / `snapshotStash` / `restoreStash` (they bump the saved copy's generation, which saving and the
   preview's cache read). The proof test adds an edit on live Sunday not yet saved.
2. **One install path, refactored out of `loadWeek`, with a draw-only flag:** no saved-copy write, no `HOOKS.weekSwapped`,
   no view resets, no `histInit`, no notify, no disarm or paint. It still runs the request working-out (`workOutLoadedWeek`
   → `rederive`, `INPUTS[].acc`, ids, the preserved registry, `resyncSchedBaseline`) so the card shows what the load
   will; and the WHOLE world is snapshotted and restored around it (`histSnap()`, the holder-base state, every `acc`, the
   preserved registry, `weekBaseline`, the schedule baseline) — never a hand-picked list.
3. **The checker is run again after the restore** (`validate()`, 3.6 ms) rather than restoring its private tables by
   hand; its page counters are not written during the draw (a flag, or put back by that run).
4. **Per-week view state is emptied for the draw and put back:** the neighbour's own hidden warnings (its saved copy's
   `wo`) installed, and every 'week'-scoped view field (`DPREV`, `VWORK`, `OILDAY`, `ARM`, selection, highlights) empty.
5. **Drawn exactly, then made inert:** the section gets `inert` and `aria-hidden`, an end-card class, and is kept out of
   every `[data-slot]` / `[data-person]` query and the highlight sweep (its markup carries the live week's day numbers).
6. **Every `.day` selector is fixed for the leading card** (`pan.ts` `weekLanding`, `weekScrollMax`, the day-step measure,
   `rosDayFollow`, the tail sizer, the day dots by index, `closest('.day')`), with a unit test for the leading card.
7. **Rest:** the quiet timer after the finger lifts (140 ms) as well as `scrollend`, and the scroll on the card's snap point
   within 1 px. **The write after the load:** the place read in the same layout step that swaps the card, the old node
   kept until then, the write skipped if the strip moved during the load (iOS scrolls on while the page's code is busy).
8. **When to redraw:** at idle after any store change (the counter `notify()` bumps; ~50 ms on a slow phone), not a
   hand-named key — people, Logic, holidays, Leave War facts, role and History mode all reach the card.
9. **A damaged or read-only neighbour** is drawn as protected (locked) when `stashWeekState(v) !== 'ok'`.
10. **What stays:** `WEEKJUMP` (the week calendar and the desktop arrows), `weekLanding` (the arrows). Tests to rework:
    `e2e/weekswipe.spec.ts`, `ui/swipeweeks.test.tsx`, `ui/pan.test.tsx`, `ui/weekglide.test.ts`, `testing/unit-times.ts`.
11. **A quick second cross:** the arriving week's opposite end card is the day just left — its markup reused at once,
    made inert — so a fast back-swipe never meets the plain preview.

**The proof test covers:** an armed seat, OIL mode, a look at a published version, a hidden warning, an edit on Sunday not
yet saved, a late request, a damaged week — the live app equal before and after, the card equal to the loaded day.
**Cost after the read:** about three to four days with the FULL check, the first day the proof. **If the proof fails:**
the kept picture of each week's Monday and Sunday (exact for a week seen this session and unchanged since; the plain
preview, filling out at the load, for a first cross) — his choice then.
