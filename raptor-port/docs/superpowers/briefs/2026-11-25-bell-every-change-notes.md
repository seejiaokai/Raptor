# Notes — the bell's "every change" line, drawn (the night of 25 Nov 26, job 1)

For whoever builds his D2600 later, and for the host. The brief: `2026-11-25-bell-every-change-draw-brief.md` (beside
this file). The page (a draft): `raptor-port/docs/mock/bell-every-change.html`, made by
`raptor-port/scripts/handpass/bec-page.mjs` from the runs of `raptor-port/scripts/handpass/bec-draw.mjs`. Pictures:
`raptor-port/docs/img/handpass/2026-11-25-bell-every-change/`. Raw runs and logs (not in the repo): `D:/rw4/night1/`.

## The two builds

- **Today:** `D:/rw4/build-new3`, bundle `index-DIr933hk.js` — the app code of `main` with round 4 live.
- **Every change — meant:** `D:/rw4/build-every`, to be built from `D:/rw4/draw/raptor-port` — an export of
  `origin/main` (`24a1a6458`; only `src`, `public`, `index.html`, `package.json`, `vite.config.ts` and the three
  `tsconfig` files, the docs left out for size — the whole export was 6 GB), `node_modules` a junction to the checkout's,
  built with `npx vite build --outDir D:/rw4/build-every` under the checks lock (`D:/rw4/night1/build-every.sh`). **NOT
  BUILT: the checks lock was held the whole hour by chat 174's walks (w14a, then w14b, port 4811/4812), and the waiting
  take never won it.**
- **Every change — what the pictures are (the fallback, `BEC_SWAP=1` in `bec-draw.mjs`):** today's frozen build, the same
  world made by the same presses; in each bell line that ends "and N more change(s)", that ending replaced in the page by
  the parts it left unsaid, read from the notice's own stored parts (`window.NOTICES`, the same parts the build would
  join) and worded as `partWords` words them (only `add`, `rem`, `kind`, `title`, `rmk` can follow the first two in these
  cases; any other kind would have stopped the run). The first two parts the app printed are checked against the same
  wording first, and the count against the number of stored parts. The layout, fonts and wrapping are the app's own; only
  the text of that one line changed (round 4's swap method). Its output equals what the scratch change below would print
  for these seven lines; a real build, once the lock is free, should be run to confirm it
  (`WR4_NEW=D:/rw4/build-every WR4_OUT=D:/rw4/night1/every-A node scripts/handpass/bec-draw.mjs every A`, then
  `node scripts/handpass/bec-page.mjs` — it takes `every-A` over `swap-A` by itself).
- **The scratch change — the only one, never committed, never in the checkout** (`git diff --no-index`, the checkout's
  file against the scratch copy's):

```diff
--- a/raptor-port/src/state/notices.ts
+++ b/raptor-port/src/state/notices.ts
@@ -1041,9 +1041,7 @@ function backWords(p: NoticePart): string {
 const LOWER: ReadonlySet<string> = new Set(['del', 'cx', 'uncx', 'off', 'on', 'unav', 'unavoff', 'when', 'title', 'rmk'])
 function firstTwo(parts: readonly NoticePart[]): string {
   const said = parts.map(p => ({ k: p.k, w: partWords(p) || '' })).filter(x => x.w)
-  const more = said.length - 2
-  return said.slice(0, 2).map((x, i) => (i && LOWER.has(x.k) ? x.w.charAt(0).toLowerCase() + x.w.slice(1) : x.w)).join(', ')
-    + (more > 0 ? `, and ${more} more change${more === 1 ? '' : 's'}` : '')
+  return said.map((x, i) => (i && LOWER.has(x.k) ? x.w.charAt(0).toLowerCase() + x.w.slice(1) : x.w)).join(', ')
 }
```

  A build would also rename `firstTwo` and rewrite the comments above it and above `noticeWords` (they say "the first
  two, then how many more"), and the round-4 tests that pin "and 1 more change" (`src/ui/bellnotices.test.tsx`).
- **No second scratch change was needed:** nothing cuts a long line (§What cuts a line).

## The order of the parts, as built (`common` in `src/state/notices.ts`)

One save can make at most one part of each slot, in this order:
1. cancelled (`Cancelled` / `Cancelled — <why>`) or un-cancelled (`Un-cancelled`);
2. where it is filed — one of `Filed under Unavailable`, `Taken out of Unavailable`, `Taken off the programme`,
   `Back on the programme` (an `else if` chain: never two);
3. when — `Now <days> <hours>`, or a half day `Now <days> (AM)` / `Now <kind> (AM)` / `Now AM`;
4. who was added — `<callsign>, <callsign> added`, or `<n> people added` from three;
5. who was taken off — the same;
6. the kind — `<old> changed to <new>`;
7. the name — `Renamed — was <old bold name>`;
8. the remark (or the till-date tick turned) — `Remark changed`.

Joined by `, `; every part after the first starts with a small letter when it is one of cancelled, un-cancelled, the four
filing parts, when, renamed, remark (a name, a kind, "You" keep their capital). A replaced Leave War bid is said after the
rest with ` · ` (`replaces your LL bid`), never counted. A person who is himself added or taken off reads only `You were
added` / `You were taken off` — never joined to the rest.

**Why no save makes more than seven:** the window (and the in-place boxes, the drag) cannot cancel an input in the same
save as another change — the schedule's cancel box is a save of its own (round 4's walk, A6 (g)) — so slot 1 never joins
the others from one save; slots 2–8 can all come together. Case 4 makes all seven: a Training retyped to a course (a
course files itself under Unavailable — `landsUnavail` — so slot 2), new days and hours, two added, two taken off, the
kind, the name, the remark. (Theoretical eighth: a cancel, which no one save can join.)

## The cases, as read from the page

Saber (desktop) makes each in ONE save of the input window; Ranger reads his bell. Rows are the second line's rows,
read from its height over its line height: iPhone Chromium 402x874 / desktop 1440x900 / iPhone WebKit 402x874. The
bold name and date first, then the line.

| Case | Today | Rows | Every change | Rows |
|---|---|---|---|---|
| 1 two changes | Training Tue 14 Jul / Now Tue 14 Jul, remark changed · Saber | 1 / 1 / 1 | the same | 1 / 1 / 1 |
| 2 three | Range brief Thu 16 Jul / Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber | 2 / 2 / 2 | Now Thu 16 Jul, renamed — was Training, remark changed · Saber | 2 / 2 / 2 |
| 3a four (day and time, one added, renamed, remark) | Range talk Mon 20 Jul / Now Mon 20 Jul 08:00–10:00, Ace added, and 2 more changes · Saber | 2 / 2 / 2 | Now Mon 20 Jul 08:00–10:00, Ace added, renamed — was Range brief, remark changed · Saber | 2 / **3** / 2 |
| 3b five (and Training made a Meeting) | Range talk Wed 22 Jul / Now Wed 22 Jul 08:00–10:00, Ace added, and 3 more changes · Saber | 2 / 2 / 2 | Now Wed 22 Jul 08:00–10:00, Ace added, Training changed to Meeting, renamed — was Range brief, remark changed · Saber | **3 / 3 / 3** |
| 3c a leave: half day and kind | OL Fri 24 Jul / Now Fri 24 Jul (AM), LL changed to OL, and 1 more change · Saber | 2 / 2 / 2 | Now Fri 24 Jul (AM), LL changed to OL, remark changed · Saber | 2 / 2 / 2 |
| 4 the worst (seven parts, 40-letter old title) | Range course Tue 28 Jul / Filed under Unavailable, now Tue 28 Jul – Thu 30 Jul 08:00–11:30, and 5 more changes · Saber | 2 / 2 / 2 | Filed under Unavailable, now Tue 28 Jul – Thu 30 Jul 08:00–11:30, Sidewinder, Talisman added, Hex, Ace taken off, Training changed to CSE, renamed — was Advanced range safety procedures brief 1, remark changed · Saber | **5 / 5 / 5** |
| 5 a replaced Leave War bid | PL Fri 11 Dec / Now Fri 11 Dec, OL changed to PL, and 1 more change · replaces your LL bid · Saber | 2 / 2 / 2 | Now Fri 11 Dec, OL changed to PL, remark changed · replaces your LL bid · Saber | 2 / 2 / 2 |

The wordings round 4 left unruled, on today's build (all one row everywhere):

| Case | The line |
|---|---|
| u1 an all-day LL made OL and AM | OL Mon 3 Aug / Now OL (AM), LL changed to OL · Saber |
| u2 an AM LL (a save of its own) made a Training | Training Tue 4 Aug / Now 00:00–12:00, LL changed to Training · Saber |
| u3 an AM LL only moved | LL Thu 6 Aug / Now Thu 6 Aug · Saber |
| u4 a title given ("Sim") | Sim Fri 7 Aug / Renamed — was Training · Saber |
| u5 a title taken away ("Brief") | Training Mon 10 Aug / Renamed — was Brief · Saber |
| u6 an Attach's "To" changed 145 Sqn → 146 Sqn | Exercise Kite · 146 Sqn Tue 11 Aug / Renamed — was Exercise Kite · 145 Sqn · Saber |

People: Ranger (`bane`, signs in `us`), Hex (`rocky`), Ace (`dj`), Sidewinder (`mamba`) and Talisman (`haowen`) — the two
longest callsigns the window offers. `stiff` is Saber himself, so the worst case takes Ace off, not Stiff.

## What cuts a line — nothing

The bell's second line (`.bl-what`, `src/ui/scheduler/02-shell.css`) has no line clamp, no ellipsis, no fixed height,
`white-space: normal` and `overflow-wrap: anywhere`; measured on every case, nothing is cut (`scrollWidth` never past
`clientWidth`, no "…"). A long line wraps to as many rows as it needs; the list (at most 70% of the screen or 520px) scrolls
and keeps "↓ N more" and "Mark all read" under it. So no second scratch change (an uncut variant) was needed. **The worst
line takes five rows on his iPhone** — he was told (D2600's row) that a line might run to a third. On a desktop the list
is 348px wide, narrower than a phone's (as wide as the screen), so a line can take a row more there (case 3a: two rows on
the phone, three on the desktop).

## Found while drawing (put on the page as questions)

- **Two names read like two changes:** "Sidewinder, Talisman added, Hex, Ace taken off" — the commas between names and
  between parts are the same (question A5; recommended: "Sidewinder and Talisman added, Hex and Ace taken off").
- **"3 people added" is still a count** (`names`, three or more) — his D2600 says "never … any other count"; whether it
  covers this is a reading, so question A4. (Also the look for other counts' job, job 2 of the night.)
- **A course files itself under Unavailable**, so a retype into one says "Filed under Unavailable" first — the order puts
  it before the days.

## What I could not draw, and why

- **The real scratch build:** the checks lock (above). The pictures are the swap fallback, named on the page's lead.
- **A phone alert** (questions A6 and B): the app sends none yet.
- **Three or more people added, named** (question A4): the drawing copy changes only the count of changes, not
  `names` — no picture; the wording is shown in words.

