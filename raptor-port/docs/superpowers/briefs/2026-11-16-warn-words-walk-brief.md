# [WARN-WORDS-STANDALONE] — the walkers' brief (chat 83's builder, 16 Nov 26)

Two Sonnet 5.5 walkers, W1 then W2 (one after the other), each in its own world on ONE frozen build (`docs/bug-check-order.md`
§4, D16, D588). The scenarios are Astra's — `docs/superpowers/briefs/2026-11-16-warn-words-scenarios-astra.md`: read your
share there, whole (each scenario's setup, action, EXPECTED, source and disproof line). The corrections below win over
his text where they differ. Evidence sheet: `docs/handpass/2026-11-16-warn-words-standalone.md` (read its rulings table and
roll-call only).

## What changed (what you are checking), in the app's words
1. **Every warning reads on its own** — who, which items, their times and why. "Conflict:" (never "Clash:"). A conflict
   between a flight and another item shows the end of the flight that causes it:
   - in the step before take-off: `Ranger — Conflict: RU (step 12:00, T/O 13:00) & BRIEFING 12:40–13:00`
   - during the flight: `Ranger — Conflict: VL BFM (T/O 12:00, landing assumed 13:00) & BRIEFING 12:40–13:00`
   - in the dekit after landing: `Conflict: VL BFM (landing 12:30, dekit to 13:00) & BRIEFING 12:40–13:00`
   - two flights back to back stay the AMBER tight turn: `Tight turn: VL BFM → RU, 0 min (needs 120). VL BFM landing
     assumed 13:00 (T/O + 1h), RU T/O 13:00`
   - a missed debrief: `Misses VL BFM debrief 12:30–14:30: BRIEFING 12:40–13:00`; a missed brief: `Misses RU brief
     10:40–13:00: BRIEFING 12:40–13:00`
   - the double-turn line is unchanged: `1 person is double turning: Ranger` (D2050)
   - "Tight turn" (two flights, same day) and "Tight turning" (tomorrow's crew rest is short at the usual report time) are
     two different checks; "Tight turning" keeps its name (D2068).
   - the crew-rest line keeps his order with "needs 12h", and names an assumed landing: `… landing assumed 13:00 (T/O + 1h)
     + 2h debrief (assumed) → ended 15:00 → clear 03:00 …` — RECORD the whole line; judge that it says "landing assumed"
     with the T/O + the flight length, and that a typed landing says the landing with no "assumed".
2. **The assumed landing** — a flight with a take-off and no landing (blank, or "TBD") is taken to land "A flight" after
   take-off — a new Logic row, 60 minutes to start, in "Rows with no end time" before "A sim"; its bounds 15–480 min. Every
   check that reads the landing uses it: conflicts, the tight turn, the debrief, crew rest, the long day, Insights'
   hours, OIL, and who is free (the crew list, ALL AVAIL). A typed landing replaces it everywhere.
3. **A standby shift (SC and the like) with START typed and END blank** is left out of crew rest until END is typed; its
   own warning that the END is missing stays (D2055). The same for a shift that flies (the builder's reading).
4. **The Logic page's note** under the changed-settings strip is one sentence: "Published days keep their old settings
   until published again." (D2067).
5. **The pending list** on a published earning weekend, after a Logic change that moves its OIL: a line inside the man's
   row saying what moved and whether OIL changed (e.g. "RU crew: start 10:00 → 10:30, still a full day of OIL"); a change
   of "A flight" shows as "Logic · A flight with no landing typed". RECORD each such line whole.
6. **A published day keeps the Logic settings it went out with** (D2005) — "A flight" among them — and its OIL keeps the
   flight length as a fourth kept value (D2044): changing "A flight" makes a published earning weekend read "1 pending"
   and drop its four sign-offs ONLY where it would change that day's OIL; the OIL already credited stays until the day is
   published again. A weekday with no OIL is not made pending by a Logic change. Once anything waits on a published day,
   Edit Schedule checks its working copy by today's settings (D2013). Insights' hours follow today's settings (D482).

## Corrections to Astra's text
- His scenario 1 numbers are right: rally default 3h before T/O → day 09:00–15:00 = 6h00, HALF a day ("Full-day OIL
  threshold" 6h01); at 90 min → 09:00–15:30 = 6h30, a FULL day.
- His scenario 6 "flies but has no END": for a NON-flying shift RECORD exactly what its own warning says.
- His scenario 13: print / PDF and CSV carry no warning list — RECORD what they export; never demand a warning column.
- Where a scenario says "the published viewer", the app's word is the 👁 look at a published version (on the week's day
  head and the board's version selector).

## How to walk — read first
- **Read `docs/walk-scripts.md` §3 to §7, whole, before writing any script.** Its traps are why this brief is written so.
- **The driver:** `scripts/handpass/www/www-lib.mjs` — `open({ phone, who })` gives a NEW browser and context with real
  storage, the frozen build served from inside the browser at `http://localhost:4293` (no server to start; NEVER run
  `npm run build`, `npm test`, or any browser test — they rebuild and break the frozen world), signed in (`who`: `'a'` the
  admin Saber, `'u'` the member Ranger — check `L.login` in `scripts/handpass/lib.mjs` for the exact keys). Desktop:
  Chromium 1536×864. Phone: WebKit 402×874, touch, scale 3 (his iPhone's size). In the demo world Ranger's person key is
  `bane`. The lib also gives `board`, `closeBoard`, `addWave`, `seat`, `flight`, `typeIn`, `press`, `boardWarn`,
  `weekWarn`, `dayDetails`, `closeDayPop`, `trace` (the forward "Breaks <day>" rows), `row` (a report row), `pic`, `fin`.
- **The host's proven routes, to copy:** `scripts/handpass/www/www-host-probe.mjs` (a flight with no landing and a
  briefing in its window, read on the board, the week strip and day details) and `www-host-friday.mjs` (his Ranger's
  Friday: two flights and a briefing, then a landing typed) — both pass at both sizes on this build.
- **Older recipes, to COPY from (never import — they point at other folders and builds):** `scripts/handpass/rcb2/` —
  `rcb2-w1-lib.mjs` (`signAndPublish`, `hideIx`, `undo`, `dayDetails` by name, `fileInput`, `relogin`), `rcb2-w2-lib.mjs`
  (`gotoWeek` to the next week, `fileDuty`, `readPair`), `rcb2-w3-lw.mjs` and `rcb2-w3-r*.mjs` (the Leave War's OIL
  cell, OIL Earn, a Logic setting changed and put back, crew rest across two days, the published OIL Saturday);
  `scripts/handpass/rcf/rcf-w1-lib.mjs` (the published face, the OIL tracker). Prove each copied helper's first step on
  THIS build before building a fixture on it. The Logic page: `a[data-page="logic"]`; its setting boxes are NOT inside
  `#lgBody`. Insights: `#insightBtn` on a desktop; on a phone the ⋯ menu (`#editSchedMore` / `#viewSchedMore` →
  `…MoreInsights`).
- **Your own files only:** scripts `scripts/handpass/www/www-<you>-*.mjs` (you = `w1` or `w2`); set
  `process.env.WWW_WHO = '<you>'` and a `WWW_RUN` per run BEFORE importing the lib (each run its own picture folder under
  `docs/img/handpass/2026-11-16-warn-words-standalone/<you>/`); write nothing else anywhere (no app source, no other doc,
  nothing under `test-results/`). Write scripts with the file tool, UTF-8, and run them from `raptor-port/`
  (`cd C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/raptor-port && node scripts/handpass/www/<file>`);
  never a script inline in the shell. A script that writes a file and holds a backslash is refused by a guard: write
  scripts with the file tool, never with a heredoc.
- **Days:** the demo week (13 Jul 26, days 0–6 Mon–Sun) carries demo warnings Monday to Thursday; Friday (4) has no
  flying and is clear for Ranger; Saturday (5) and Sunday (6) are the weekend. The next week is 20 Jul 26. Use fresh
  people away from other commitments unless the scenario adds one, and say which.
- **Every step:** a picture after it (`pic`), the words read from the element that DRAWS them (walk-scripts §4 — a box
  wider than zero inside the surface being checked; never a container's `innerText` for a word match). On the phone, a
  picture within about 100ms of each tap's lift beside the settled one (D1281 — `press(w, sel, { after: '<name>' })`).
  Each assertion prints what it read.
- **Judging:** a scenario with an EXPECTED line is PASS or FAIL — RECORDED only where this brief or Astra's says
  "RECORD". A step whose own set-up could not act is NOT WALKED, never FAIL. A FAIL first gets walk-scripts §7's
  questions (the script's world, the route, what was pressed) and a picture at the failing step. Errors on the console or
  page are findings: list them.
- **Not a finding:** a problem that lives only in data already stored (the demo world — e.g. a hide made before this
  build coming back once, a demo published day's old words) when the app is right for new data (D56); anything about a
  scheduler who is not an admin (D785); taking a man off a seat leaving no mark (D91); the ALL AVAIL window ignoring
  Escape (already filed, `[ALLAVAIL-ESCAPE]`).
- **Stop:** after 3 failed attempts at one gesture, picture it, record NOT WALKED with why, and move on. Stop every
  browser you started. Send your report ONCE: write it to `docs/handpass/parts/2026-11-16-www-<you>.md` — one table row
  per scenario step (scenario, size, what was done, EXPECTED, what the screen said, PASS / FAIL / RECORDED / NOT WALKED,
  the picture's path), then errors seen, then each window opened and how each of its ways to close behaved, then the
  final run's folder and picture count. Your message back is a ten-line summary naming every FAIL.
- **Sizes:** each scenario at the desktop AND the phone, except where your share says "desktop, one phone look".
- **Time:** about 75 minutes of walking. If you run short, finish the scenarios in order and list what was not walked.

## The lessons the walk must cover (the checklist's list; §7.11 of the order)
Applied in your share: **1** a table of state × reading (working day, published day, working amendment, the current and
an older 👁, View-only, member) for the words and the assumed landing; **3** after every press, what tells the person it
happened — pictured; **4** the ALL AVAIL window leaves the page working: press the page behind it and check what lights;
**9** Insights' "Conflicts by type" — the heading against its figures, phone and desktop; **11** the longer lines read at
402 and 1536; **12** day details opened from every page that offers it (Edit Schedule, View-only, the board, each 👁);
**16** after the Logic page refuses an out-of-bounds value: tap away, tap the box afresh, type the figure it shows;
**17** the Logic strip shown, removed by Reset, shown again — the page measured after each; **18** print / PDF and CSV:
the result seen (print preview pictured in Chromium; WebKit's is named for his look); **19** every window opened closed
by each of its own ways (Close / Done, ×, Escape, a tap outside), phone and desktop, the page under it as it was;
**22** words judged by what is drawn; **23** what a tap opens is the window the rulings give (the day's `?` → its day
details; a warning tapped → its crew lit in the warning colours, never selection blue); **23b** side-by-side boxes on any
pictured screen one height (the Logic row); **25** the assumed landing made through the controls on every kind of row a
flight meets (a ground row, a sim seat, a duty desk, a request) and a blank landing on a second flying seat; **28** on
the phone, a window a press opens shown on screen before anything in it is pressed; **29** — not applied (nothing reads
today); **30** each phone tap pictured within about 100ms of the lift.
Not applied (no drag, swipe, pinch, scroll hand-off, drawing, hidden page, clock or fitted figure changed): 2, 5, 6, 7,
8, 10, 13, 14, 15, 20, 21, 24, 26, 27, 29, 31.

## W1's share — the published day, OIL, Logic, the week's edge, the SC with no END, print
Astra's scenarios **11, 1, 8, 2, 3, 6, 13**, in that order:
- **11** the Logic row "A flight": found by the page and its search; 90 and leave; another value then Reset at once;
  below 15 and above 480 (lesson 16); a reload; the strip and its one-sentence note; as Ranger read only — both sizes.
- **1** the published OIL Saturday, Ranger (bane), T/O 12:00, landing blank, nothing else that day: OIL Earn, sign,
  publish; the Leave War's cell, its day sheet and the OIL tracker (HO); "A flight" → 90: pending, sign-offs down, the
  pending list's line (RECORD whole), the credit still HO everywhere, Insights' hours moved; put back → pending clears;
  → 90 again and publish the amendment → FO once, never two credits — desktop, one phone look at the pending list and
  the Leave War cell. **These pictures go on his look card.**
- **8** the pending OIL line's shapes — desktop, one phone look.
- **2** the 👁 looks, day details from each page, a saved plan's preview flag-free — both sizes for day details; the rest
  desktop, one phone look.
- **3** Sunday → Monday (Sunday 23:30, landing blank; Monday item 13:30): Monday's crew-rest line, Sunday's "Breaks
  Monday" rows, the next week opened cold first then via Sunday, TBD, then a typed landing — both sizes (the next-week
  peek is the desktop's).
- **6** the SC with START 20:00 and END blank on Friday, Saturday 06:00 a ground item for the same man: no crew-rest line
  on Saturday; its own END warning stays (RECORD it); made to fly (B typed), the same; END 23:00 typed → the crew-rest
  line returns; END cleared → gone again; one control with an AVALON line — both sizes.
- **13** the same take-off and landing on a line (its own warning, not "assumed"); print / PDF and CSV — desktop.
- **Plain-user round:** the Logic page's row changed and Reset; the pending list opened and closed every way; print.

## W2's share — who is free against the conflict list, landing blank / TBD / typed, conflict shapes, hides, the phone fit
Astra's scenarios **4, 5, 9, 7, 10, 12**, in that order:
- **4** the crew list (no seat picked, and the seat picked), ALL AVAIL and ALL against the conflict list for the same
  window, then the item moved out of it and the landing typed — both sizes; press the page behind the ALL AVAIL window
  (lesson 4).
- **5** blank → TBD → typed → blank through every reader he names, the long day on a second man — both sizes.
- **9** the conflict shapes (step only, airborne, dekit only, step + airborne, across the whole flight), one with a request
  and its reason, Step / Dekit changed on the Logic page and put back, two flights, a non-flying SC SPARE control —
  desktop, one phone look; RECORD the spanning item's words.
- **7** a new hide and Undo, reload, the same two items re-timed (stays hidden), one item replaced (comes back), a request
  conflict's hide (words-keyed), a published day's hide waiting for the amendment — both sizes.
- **10** the phone fit and the gestures in each drawer: Edit Schedule, the board, day details, 👁, ALL AVAIL reasons, the
  pending list, the peek — at 402 (WebKit) and 390 (Chromium); each "Conflict:" line at most two rows (measure it — the
  host's `www-host-fit.mjs` shows how: a Range's client rects after the grey kind label, counted up to a typed
  ". Reason:"), a time range never split; a warning tapped lights its crew; ✕ hides; the drop note after a drop.
- **12** the specialised writers and short names: the issues heading, a puck's flag title, Insights' "Conflicts by type",
  the Logic check names; "Tight turning" (a tomorrow's crew-rest note) beside "Tight turn"; the double-turn line —
  desktop, one phone look.
- **Plain-user round:** the warning list's everyday tasks end to end — a warning tapped lights its crew, hidden and shown
  again, the ALL AVAIL window opened and closed every way, Insights opened and closed, View-only Sched read as the admin
  and as Ranger.
