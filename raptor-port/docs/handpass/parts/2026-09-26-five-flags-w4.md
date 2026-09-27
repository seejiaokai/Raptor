# Five-flags batch — walker W4: [VIEW-ARROW-OVER-LIST] (the day at the front sits beside the ‹ arrow)

Walker W4 (Opus), 26 Sep 26. Brief: `raptor-port/docs/superpowers/briefs/2026-09-26-five-flags-walk-brief.md` §W4;
scenarios Fable F7, F8, F9, F19 and §2.4 (`raptor-port/docs/superpowers/specs/2026-09-26-five-flags-scenarios-fable.md`).
Build: the production bundle of `ca5d04e3` served at http://localhost:4176 (not rebuilt). Script:
`raptor-port/scripts/handpass/ff-w4.mjs` (run from `raptor-port/`: `node scripts/handpass/ff-w4.mjs [section …]` —
sections `arrows chips cal carry board peek warn pend misc edge availwin resize phone`). Pictures (284):
`raptor-port/docs/img/handpass/2026-09-26-five-flags/w4/`. Every check asserts the right behaviour, so a re-run is the re-walk.

**Result (the final run, sections run in four foreground batches): 1,838 checks PASS · 2 FAIL (one defect, at two
widths) · 123 notes. Error list (console errors, page errors,
4xx): empty in every world.**

## How a landing was measured (after EVERY landing)
- **clear** — the front day's left edge ≥ the ‹ arrow's right edge + 4px.
- **inset** — the front day's left edge = week left + the declared room (scroll-padding-left, 54px) ± 2px.
- **hit** — `elementFromPoint` at the front day's first pixels, at the arrow's own height, is inside the day (where a
  short day — a bare weekend, an empty week — ends above that height: is not the arrow); **head** — the same at the day
  head's first letters.
- **list** — the front day's opened "⚠ N issues" list starts ≥4px right of the arrow, and `elementFromPoint` at its first
  item's first letters (at the arrow's height where the list reaches it — the page scrolled, never the week) is the list.
- **no hop** — the week's scroll sampled EVERY frame from the action to rest: after it first reaches its rest value it
  never moves again (landing frame = rest frame). Instant landings go there in one step (e.g. `[0, 1128]`).
- **proxy** — the foot bar's thumb is where the week is (±2px); **label** — `#hsLbl` "day a–b of 7" starts at the front day.

## Roll-call — every landing path and edge-docked control (§2.4)

| # | Landing / control | Walked? | Where | Result |
|---|---|---|---|---|
| L1 | ‹ one day | YES | View + Edit × 1440/1024×700/1920 — Sat…Mon, one press each | PASS all (clear, inset, hit, head, proxy, label, no hop, one day) |
| L2 | › one day | YES | same — Tue…Sun | PASS all; Sunday at the front shows the next-week preview 12px beside it (no void) |
| L3 | › past Sunday → next Monday | YES | same, and back from the previous week's Sunday | PASS (Monday at 54, week crossed, no hop) |
| L4 | ‹ on Monday → previous Sunday | YES | same, both into the demo week and into the week before | PASS |
| L5 | calendar day pick | YES | View + Edit × 3 widths — Wed 15, Sun 19, Thu 23 (next week), Mon 13, Fri 17 | PASS all; Wed 15's list checked on View |
| L6 | page switch carrying the day | YES | View→Edit (Thu), Edit→View (Wed + list), View→Inputs→View (Sat), View→Edit on Sunday, and from a FREE position both ways | PASS all |
| L7 | board close carrying the board's day | YES | Edit × 1440/1024×700 — Thu, Sun, Tue | PASS all |
| L8 | next-week preview click | YES | View + Edit × 1440/1024×700, from Sunday at the front | PASS — next week loads; Monday (and Tuesday) of the new week cannot sit further right than at scroll 0, so the week rests at its start: Monday at the room (54) |
| L9 | warning tap that pans a day to the front | YES | View + Edit × 1440/1024×700 — Monday almost off the left (list tapped on its visible part, never its ✕), Wednesday half off the right (two warnings) | PASS — each pan lands the day at 54, the lit man clear of both arrows; **FAIL on Edit when the man is already on screen near the crew palette** (see Findings, F-W4-1) |
| L10 | "take me to this change" (pending list) | YES | Edit × 1440/1024×700 — Friday signed + published through its own controls, one change (programme remarks), Friday half off the right, "1 pending" → the row | PASS — pans, Friday at 54, the changed cell clear of both arrows, no hop; the pop-up never over the ‹ arrow |
| L11 | the palette's ‹ › day arrows | YES | Edit × 2 widths | PASS — they step the palette's day, the week does not move (negative holds) |
| L12 | free positions: trackpad pan, shift+wheel, the foot bar's own ‹ › | YES (thumb drag: NO — see Not walked) | View + Edit × 2 widths | the free positions stay free (no snap on desktop — by design); the next press parks at 54 on the right day (PARK_TOL intact); `#hsR`/`#hsL` land like the arrows — PASS |
| L13 | boot / at rest | YES | View + Edit × 3 widths | PASS; Monday's list opened: clear |
| L14 | in-place repaint (an edit, then Undo) | YES | Edit × 2 widths, Friday at the front | PASS — the week holds |
| L15 | the 👁 look | YES | Edit × 2 widths — Friday's issued Original, then back to the live copy | PASS — holds, day at 54 |
| L16 | the week chips | YES | View + Edit × 2 widths — prev, +1, +2, current | PASS — the week holds its front day, at 54 |
| E1 | ‹ arrow vs the front day, down the whole page | YES | View + Edit × 3 widths, page walked down in 0.6-screen steps | PASS — never over the front day |
| E2 | › arrow: clickable, what it covers | YES | 3 widths × 2 pages × rest/Wed/Sun | PASS (top thing at its centre); covers are observations (O1) |
| E3 | rail (CREW tab, z 151) vs › arrow (z 150) | YES | Edit, 3 widths | PASS — no overlap (rail 150–236px from the top; arrow 329–399 at 700 tall, 433–503 at 900) |
| E4 | sticky top bar, the foot bar vs the arrows | YES | 3 widths × 2 pages | PASS — neither covers an arrow |
| E5 | pending-list pop-up vs ‹ | YES | Edit, L10 | PASS — no overlap |
| E6 | ALL AVAIL window's default dock | NO — see Not walked | — | — |
| E7 | resize 1440 → 780 → 1440, no reload | YES | View + Edit | PASS — at 780: no arrows, padding 12px, scroll-padding `auto`, room 0; back at 1440: arrows and 54px back; the next press lands at 54. Observation O4 |
| P1 | phone 390×844: no gutter, no arrows | YES | View + Edit | PASS — padding 12px, scroll-padding `auto`, arrows not drawn |
| P2 | phone: ONE swipe back on Monday / forward on Sunday | YES (CDP touch) | View | PASS both ways; the glide's two clones measured the same height (2521px) |
| P3 | phone: within-week swipe | YES (CDP touch) | View — on a wave block and on the day head | PASS — never crosses the week; where it rests: O5 |
| P4 | phone: calendar pick | YES | View — Thu 16 | PASS — Thursday at the phone's own edge, no 54px room |

## Findings

**F-W4-1 — FAIL. On Edit Schedule a warning whose man is already fully on screen, near the crew palette, swings the week
sideways.** New with this branch.
- Repro (1440×900, `ad`): Edit Schedule → › twice (Wednesday at the front) → scroll the week sideways (trackpad) until
  Gambit's puck on Wednesday's wave 1 (VL ACM) sits just left of the crew palette — fully visible, its right edge ~20px
  inside the week's right edge (x 1069–1143; the week box ends at 1163; the › arrow is at 1394, over the palette, not over
  the week) → open Wednesday's issues list → tap "On leave + flying — Gambit".
- Seen: the week pans from scroll 279 to 1128 (Wednesday snaps to the front at 54). Same at 1024×700 (695 → 1128).
- Right: no sideways move — the man is on screen and under no arrow (owner, 6 Aug 26, HOLD THE LATERAL VIEW, in
  `highlights.ts` bringIntoView: "the horizontal moves only when the destination is genuinely not on screen").
- Why (reading): the new in-view test excludes 54px at BOTH edges of the week box (`weekInset(week,'right')` from
  `scroll-padding-inline:54px`). On Edit Schedule the week box ends at the crew palette, and the › arrow floats over the
  palette, so the week's own last 54px are fully visible. On `main` the test was `tr.right <= wr.right + 1` (read from the
  diff), so the same tap held the week. The same function serves "take me to this change", so a changed cell sitting in
  that strip would pan too (not walked separately).
- Pictures: `L9band-before-edit-1440x900.png`, `L9band-before-target-edit-1440x900.png` (Gambit visible beside the
  palette), `L9band-after-edit-1440x900.png`; the same three at `1024x700`.

## Observations (not failures — for the builder / the owner's look)
- **O1 — what the › arrow covers** (pre-existing, unchanged by this branch): on View-only, the right edge of the last
  visible column (wave pucks, programme rows, the preview's first column on Sunday); on Edit Schedule it floats over the
  crew palette's right edge (`#eRoster`), never over the week. Pictures `F19-edges-*`.
- **O2 — the day before the front day now shows a 42px strip at the left edge**, around the ‹ arrow (54px room − 12px
  gap; on `main` it was 20 − 12 = 8px). It carries pieces of that day's controls — its issues line's ▾, the ends of its
  sign-off boxes, puck tails. Pictures `GUTTER-prevday-tail-view-1440x900.png`, `L4b-prevweek-sun-view-1440x900.png`,
  `L2-fwd3-edit-1024x700.png`. A question for the look card, not a defect of the promise.
- **O3 — "day a–b of 7"**: `a` is right after every landing (checked 300+ times). `b` counts `round(week width ÷ day step)`
  columns, unchanged arithmetic: at 1440 View it reads "day 1–3" while only two days are whole and the third shows 212px
  (246px on `main`).
- **O4 — resize round trip**: straight after 1440 → 780 → 1440 the week keeps the phone layout's scroll, so a day can sit
  partly under the ‹ arrow (View: Tuesday at −162; Edit: Saturday at 27) until the next press, which lands at 54. A resize
  never re-lands the week on `main` either (nothing in the diff touches resize). Pictures `RS-*`.
- **O5 — phone within-week swipe (emulated touch)**: a paced 220–250px swipe travelled ~4.4 days and once rested between
  Friday and Saturday (`F9-phone-swipe-within*.png`); an earlier run's faster swipe travelled 5 days and snapped cleanly.
  The phone's CSS and JS paths are untouched by this branch (measured: padding 12px, scroll-padding `auto`, room 0), so
  this is emulator fling physics or pre-existing — iPhone-only, for the look card.
- **O6 — free positions on desktop stay free** (no snap, by design): after a trackpad pan or shift+wheel a day can sit
  partly under the ‹ arrow (e.g. left −81) until the next press or landing; every press parked at 54 on the right day.

## Orders walked
- › ×6 then the cross forward, ‹ back across the week, ‹ ×6, the cross back into the previous week, › back — at 3 widths ×
  2 pages (one picture per press).
- Landings from a boundary AND from free positions (trackpad pan, shift+wheel) before a press and before a page switch.
- Warning taps: day almost off the left, half off the right, and fully on screen (the band case).
- Published day: publish → change → pending jump → 👁 look → back to live → an edit → Undo.
- Phone: Monday → back (previous week's Sunday) → forward (Monday) → within-week → calendar.

## Not walked, and why
- **The foot bar's thumb drag**: headless Chromium draws no scrollbars, so there is no native thumb to grab. Its two end
  buttons (`#hsL`/`#hsR`) and a trackpad pan were walked instead; the thumb-follows-the-week reading was checked after
  every landing.
- **The ALL AVAIL window's dock (E6)**: no ALL AVAIL count chip exists on the seed week, and planting the placeholder on
  Saturday's desk failed with both drivers (a tap on the desk's "+ ADD" did not arm it; the drag did not light the drop
  zone) within the time box. From the stylesheet: `position:fixed; right:16px; top:96px; z-index:410` — it opens on the
  RIGHT, over the › arrow's column, nowhere near the ‹ arrow; unchanged by this branch. The script's `availwin` section
  reports "not walked" until a driver can plant it.
- **The band case on View-only**: the jump's own target could not be identified reliably there, so it was not walked; by
  reading, the same rule treats a puck ending just short of the › arrow (inside its 54px band, at any height) as out of
  view.
- **iPhone Safari** (rubber-band, no re-snap after a programmatic scroll, a real finger's fling): emulator only — for the
  owner's look card.
- **1920×1080 for the warning taps, the pending jump, the chips and the board close**: walked at 1440 and 1024×700 only
  (the arrows, calendar, carry and edges were walked at all three).

## Errors seen
None — no console error, page error or 4xx in any world (every section's world was watched).
