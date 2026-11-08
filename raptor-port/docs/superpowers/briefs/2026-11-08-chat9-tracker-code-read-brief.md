# Chat 9 — the code read of the Tracker's three pictures-round answers (D1790, D1791, D1792 (c))

**One brief, two readers, blind to each other:** Astra (Codex) and a fresh Opus reader that did not write the code.
Read-only: change no file, commit nothing. Do not open any other reader's report, the walk's evidence sheet
(`raptor-port/docs/handpass/2026-11-08-chat9-tracker.md`), its pictures (`raptor-port/docs/img/handpass/2026-11-08-chat9-tracker/`)
or the scenario designer's file (`raptor-port/docs/superpowers/briefs/2026-11-08-chat9-tracker-scenarios.md`).
Write your whole report to the file your launch names, and nothing else.

## What to read — a fixed commit, not the working tree

The working tree may change while you read. **Read the code at commit `7d750640e`** of branch
`claude/pr-tracker-787259`, against its base `549482bd5` (the `main` it was cut from):

```
git diff 549482bd5 7d750640e -- raptor-port/src raptor-port/scripts/tracker
git show 7d750640e:raptor-port/src/tracker/components/Pop.jsx
```

The changed files: `raptor-port/src/tracker/app/popPlace.js` (new — where the marking window opens; pure),
`raptor-port/src/tracker/components/Pop.jsx` (measures, slides the chart, places the window),
`raptor-port/src/tracker/components/Header.jsx` (Find's ✕ and a pick from the list),
`raptor-port/src/tracker/components/Modals.jsx` (Restore's mark), the unit pins
`raptor-port/src/tracker/trk-round-seen.test.ts`, the browser pins in `raptor-port/scripts/tracker/smoke.mjs`.
Read their callers and neighbours at the same commit as you need: `src/tracker/app/core.js` (`openPop`, `closePop`,
`chartKey`, `stopGlide`, `scrollToEvent`, `padBoard`, `searchGo`, `clearSearch`, `redrawKeepView`),
`src/tracker/components/Glyphs.jsx`, `src/tracker/tracker.css` (`#pop`, `#hSearchPanel`, the `max-width:1050px` block,
`#viewtabs`, `#board`).

**The rules to hold it to** (none of `.claude/rules/` loads by itself for Codex — open each): the Tracker's rulings
`.claude/rules/decisions/tracker.md` (D984, D985–D989, D992, D980 especially) and their full rows
(`grep -h '^| D1790 |' .claude/decisions-full/*.md`); the screen-design rulings `.claude/rules/decisions/design.md`
(D1792, D1127, D1122); the Tracker's architecture `.claude/rules/seams/tracker.md`; `.claude/rules/raptor-executor.md`;
`.claude/rules/ui-design.md` and, in `raptor-port/docs/design-practices.md`, §2 (keyboard) and §5 (motion) and §9's
lessons 12, 45 and 92. The approved drawings and their measuring notes:
`raptor-port/docs/img/handpass/2026-11-07-pictures-round/notes-marks.md` (§1 the window, the Find strip, Restore) and
the pictures `q-trkpop-ph-A-drawn.png`, `q-trkpop-ph-today.png`, `q-trkpop-pc-today.png`, `q-trkfind-ph-A-drawn.png`,
`q-r5c-ph-restore-drawn.png`, `q-r5c-pc-restore-drawn.png` in the same folder; the drawing script
`raptor-port/scripts/handpass/pr-marks.mjs`. The answers as recorded for the screen:
`raptor-port/docs/ui-contracts.md` §The pictures round's answers, 8 Nov 26.

## The promise — copied from the full rows (8 Nov 26, his "All as recommended" to the pictures round)

- **D1790:** "When the Tracker's marking window would not fit below the event tapped, the chart slides the event up
  under the tabs with its own smooth scroll, only as far as needed, and stays there after Close, and the window opens
  whole below it, on a phone and a desktop; an event too near the chart's end to slide falls back to the page's option
  B." The page's option B: nothing moves; the window opens between the tabs and the event, its lower part scrolling
  inside it. It follows D1290 and the lesson that a window never hides what it is about; D984 (where Find lands an
  event) is unchanged — the slide comes only when the window opens.
- **D1791:** "On a phone the ✕ in the Tracker's Find strip empties the box and puts Find away — the keyboard down, the
  tabs back — as Escape does, its hover words 'Clear the search and close Find'; a pick from the list puts Find away on
  purpose; on a desktop nothing changes." The ✕ stays in the search box (D1127).
- **D1792 (c):** "the Tracker's ↺ Restore … the Reset arrow" — the typed ↺ on Restore becomes the app's drawn Reset
  arrow, as drawn.

**The builder's readings — rule each supported / contradicted / his to decide:**
1. "Only as far as needed" is read as the approved drawing's slide: the event's top ends 22px under the chart box's top
   (232px for the drawing's case, ACG-09 at 419–448 on a 402×874 phone), not the least slide that would fit the window
   (15px there). The chart's end may stop it short of that, which is still A while the window then fits whole.
2. The window waits unseen while the chart slides and opens once the chart rests (target reached, or 150ms still, or
   1s), rather than riding up with the event.
3. The window opens 4px under the event's foot (it opened 12px under the tap's centre before, 2–3px over a ball 30 tall).
4. "On a phone" for D1791 is read as wherever Find is the strip — the stylesheet's `max-width:1050px` — not touch alone.
5. From the keyboard (Enter or Space on ✕), the keys go back to the 🔍 button; from a tap, focus goes nowhere, as Escape.
6. A too-short screen (a phone on its side, 390 tall) slides the event as high as it may and the window scrolls inside.

## The finder's brief (the bug-check order §4, verbatim)

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

Places to think about, not a limit: every way the marking window opens (a tap, a pick from Find, a crew pick, the
keyboard's Enter on a chart event, a re-open of the same event, a tap on another event while one is open); a finger
still gliding when the window opens; a pinch or a resize or a turn of the phone while the slide runs; the window
closed (Close, Escape, a tap outside, a grade) while the slide runs; reduced motion; a desktop with the window too
tall for the space under the event; Edit chart layout; Show All and the Info tab; WebKit's lack of `scrollend`; the
✕ on a desktop, on a phone, from the keyboard, with the list open, with the box already empty; a pick from the list
by mouse, finger and keyboard; the media query changing while Find is open (a window resized past 1050); every other
place the Tracker draws Restore or a typed ↺; the browser pins — do they prove what they say, or can they pass with the
change undone?

## What to hand back

- Each finding: the concrete failure (setup, action, what the person sees), its cause in the code, and **exact,
  step-by-step fix instructions** — which file, which lines, what to write (D489). A claim with no concrete failure is
  not a finding.
- **Explicit negatives:** for each place above, "I checked X and found nothing", with what you checked.
- A short tidiness note (three questions of the changed lines: is anything duplicated, is anything left that nothing
  uses, is anything named for what it was rather than what it is) — filed, not fixed (D489).
- You may run a unit test file (`cd raptor-port && npx vitest run src/tracker/trk-round-seen.test.ts`); you cannot build
  or run a browser. For a case you would need to run in the browser, name the exact input and what you expect, and the
  host will run it.
