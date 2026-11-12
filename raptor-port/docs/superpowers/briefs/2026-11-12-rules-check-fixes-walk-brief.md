# The walk of the rules check's fixes — the walkers' brief (12 Nov 26)

You are a walker for a bug check: you drive the REAL built app in a scripted real browser, through its own controls,
and take pictures. You do not read code to find bugs and you do not decide whether a finding is real — the host does,
by reproducing it. Your scenarios are in your own section at the end (W1, W2 or W3). The full scenario text, with each
EXPECTED line's source, is `raptor-port/docs/superpowers/briefs/2026-11-12-rules-check-fixes-scenarios.md` (by its
S-number); where your section changes a scenario, your section wins.

## Read first

`raptor-port/docs/walk-scripts.md` §3 to §7, whole. Then the host's passing recipe for this build,
`raptor-port/scripts/handpass/rcf/rcf-host.mjs` (sign-in, the Logic page, Admin → Squadron config → Duty templates…,
the board of a day and its warning list — all proved on this build at 03:20).

## The build and the machine

- The app is served at **http://localhost:4291** — a frozen production build (its script `index-BpIimx1U.js`). **Never
  build, never run `npm run build`, `npx playwright test` or any `e2e` spec (each rebuilds the app under everyone),
  never start or stop a server.** Only `node` scripts you write, driving that address.
- Scripts: written with the Write tool (never typed inline into the shell — backslashes and apostrophes break) into
  `raptor-port/scripts/handpass/rcf/<your prefix>-*.mjs`, run from `raptor-port/` (`cd` there by its full path:
  `C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port`). Print a version line at the
  top of every run; never rewrite and run a script in one step.
- The driver: `scripts/handpass/lib.mjs` (`open`, `login`, `go`, `board`, `closeBoard`, `tap`, `type`, `put`, `shot`,
  `publish`, `warnings`, `oilMode`, `openInputs`) and the libraries under `scripts/handpass/am/` (`w2-lib.mjs`,
  `w4-lib.mjs`: the Leave War, filing an input, `viewDay`). Set, at the very top of your script, BEFORE the driver is
  imported (`await import(...)`, never a static import):
  `process.env.HP_URL ||= 'http://localhost:4291'` and
  `process.env.HP_SHOTS ||= '<the checkout>/raptor-port/docs/img/handpass/2026-11-12-rules-check-fixes/<wN>/<run>'`.
  The libraries' other default paths point at another checkout — never rely on one.
- Each world is a NEW browser context with real storage (what `open()` does) — never the `?fresh=1` address, which
  keeps nothing. Never sign in again mid-fixture on a fresh world before one write (the order §7.7).
- Sizes: every scenario at desktop **1536 × 864**; the scenarios marked **[phone]** also at his iPhone's **402 × 874**
  (deviceScaleFactor 3, `isMobile`, `hasTouch`), tapping, with a picture taken right after each tap (within ~100ms,
  the pointer left where it pressed) as well as the settled one.
- Sign in as admin `ad` / `a` (Saber) — `open({ who: 'a' })`; a member is `us` / `us` (Ranger). A scheduler is always
  an admin: never set up a scheduler who is not one.

## Known traps in the drivers (each has cost a false finding)

- The board is drawn twice (desktop and phone twins): every board selector goes through `tap()` / `B()` /
  `#schedBoard … :visible`. The board's crew palette is `#sbRoster`, the week's `#eRoster`.
- Admin opens on Users: the template doors are under the "Squadron config" category.
- In the demo week Monday–Thursday carry hard conflicts and a publish is refused while a day has one: **Friday is the
  clean weekday** for a publish fixture; the weekend is the place for OIL.
- The board's Personal Inputs panel is folded and draws no rows folded: `openInputs()` first.
- Adding a request on a non-working day raises the OIL question ON TOP of the form — answer it or nothing is filed.
- Read words by the element that draws them (its own trimmed text, box wider than zero), and typed words in the
  `value` of `input` / `textarea`. Normalise a no-break space before comparing.
- A negative check first proves its subject exists; a "nothing changed" check proves the press happened.
- Recipes for routes (read them for selectors and order, prove each step on screen before relying on it):
  a PH added on the Leave War after publishing — `scripts/handpass/am/late-pub-leavewar-walk.mjs`,
  `scripts/handpass/am/w4-08-r38-holiday.mjs` (their old amber words are out of date — the new ones are below);
  hiding a warning with its ✕ — `e2e/warnhide.spec.ts`; In-time lines and the R box — `e2e/rallybox.spec.ts`;
  SC shifts, B / R and publishing a Saturday — `e2e/oilworkstart.spec.ts`, `scripts/handpass/bsw-walk.mjs`;
  Logic edits — `e2e/logicedit.spec.ts`; templates — `scripts/handpass/am/b3-01-templates.mjs`. You may read the
  markup builders under `raptor-port/src/ui/` to find a control's selector — only for that.

## Judging

- A scenario with an EXPECTED line is **PASS** or **FAIL**; "RECORD" is only where your section says so: then write
  exactly what the screen says. A step whose set-up could not act is **NOT WALKED**, with why — never FAIL.
- Every assertion prints the value it judged. One picture per assertion that matters, cropped to it where you can.
- Stop after three failed attempts at one gesture and report it; do not loop.
- Time box: about 75 minutes of walking. Prioritise in your section's order.

## Hand-back

Write your report to `raptor-port/docs/handpass/parts/2026-11-12-rcf-<wN>.md`: a table — scenario | what you did (the
controls pressed) | PASS / FAIL / RECORD / NOT WALKED | what the screen showed (the exact words) | picture files — then
any error seen in the browser's console, and the final run's folder and picture count. Write nothing outside your
scripts, your picture folder and that report; commit nothing. Stop every browser you started, then hand back a short
summary (counts, every FAIL in one line each).

---

## W1 — the published day, OIL and the holiday lines (prefix `rcf-w1`, pictures `…/w1/`)

1. **S18 [phone]** — a PH added after publishing (D2002, D2003). A weekend-free weekday (Friday) with a timed desk
   08:00–16:00 for a named man and a flying line with no times; publish; add a PH on that date on the Leave War (its
   Event row — the recipe above). EXPECTED: the day's warning list on Edit Schedule and the board, and View-only Sched's
   published face, show at once the amber line reading exactly **"Publish this day again so OIL is earned. The PH was
   set after the day was published."** (D2003) beside a red line for the line with no usable times (D2002); the OIL
   credit on the Leave War for the desk's man does not change until "Publish AL1" (D2, D142); after it, he is credited.
   Then Undo the PH and Redo it. Picture each amber line, cropped, at both sizes.
2. **S19** — the PH removed after publishing (D2004): a weekday PH, a timed desk, publish (the man is credited), then
   remove the PH. EXPECTED: the amber line reads exactly **"Publish this day again to withdraw the OIL. The PH was
   removed after the day was published."**; the credit stays until "Publish AL…", then goes. RECORD what a Saturday
   (still a weekend) shows when its PH is removed.
3. **S08 (one variant)** — the same as S18 but the PH set through the other door the app offers for holidays, if one
   exists (RECORD which doors you found); EXPECTED the same words.
4. **S14 + S15 [phone]** — an SC shift on Saturday typed START = END = 08:00, MAIN and SPARE seated: (a) R 06:00 typed;
   (b) B 06:00 alone; (c) nothing typed (not flying). EXPECTED (D1999): (a) and (b) each man earns 06:00–08:00 — OIL
   Earn shows him on, the figure two hours (an HO); the amber same-time note on the shift's times reads, at its end,
   **"…one of the two is wrong; the shift still earns from its R or B"**; (c) earns nothing, its note RECORD exactly.
   Publish (a); read the man's OIL credit on the Leave War.
5. **S03 + S12 + S13** — a desk made from the AVALON template ("+ Block" → AVALON) on Saturday beside an AVALON wave,
   a named man on the desk who also sits on an overlapping sortie in another wave. Before the wave flies: EXPECTED
   (D1060, D24) the desk exempt — no clash on the desk, OIL Earn shows the desk's man off by default with a switch.
   Then make the AVALON wave fly (type its R, then separately tick one row's "Flies"): EXPECTED (D1997) the desk is
   fully checked — the clash appears in the warning list in red **and the desk man's puck wears the red clash ring on
   the week and on the board** — and OIL Earn shows him on by default. Then switch him off by hand in OIL Earn before
   the wave flies and make it fly: RECORD whether he stays off. Repeat once with BB. Publish one flying case; read the
   Leave War credit.
6. **S09** — D1991: Logic → "Brief before take-off" at its default; a man's Monday ending 19:00 (debrief 2h → 21:00),
   Tuesday take-off 12:00 with no In-time, R or B; publish Tuesday. Raise "Brief before take-off" to 200 minutes.
   EXPECTED: View-only Sched's Tuesday still prints the B it went out with and shows no new crew-rest breach (D1991);
   the working copy on Edit Schedule shows the new B and judges by it. Restore the setting afterwards. (Monday–
   Thursday carry demo conflicts — remove the clashing rows through the app, or RECORD that publish was refused and
   use Friday/Saturday instead.)
7. **The plain-user round, OIL half (§7.0a):** open and close OIL Earn on the board (desktop button and the phone day
   bar's ticket), Undo / Redo a switch, ✓ Done; open View-only Sched; open the Leave War and its OIL figure for the man.

## W2 — warnings, hides and the standby line that flies (prefix `rcf-w2`, pictures `…/w2/`)

1. **S20 + S21** — D2001: a man (Ranger) on a sortie and on a ground row (BRIEFING) at an overlapping time on
   Saturday; hide the clash with its ✕. EXPECTED (D2001): change both items' times keeping the overlap, rename the ground
   row — it stays hidden; replace the man, or delete and re-make the ground row with the same words — the new clash
   SHOWS red. Read: the struck line in the list, the man's ring on the week and the board, the day's count.
2. **S22** — D479: hide it, take Ranger off the sortie seat and put him back on the same seat. EXPECTED: it returns
   struck (D2001, D479), with the brief amber "already on …" note at the drop and no lasting red ring.
3. **Two clashes worded the same** — Ranger on VL BFM 12:00–13:00 and a BRIEFING 12:00–12:30 in one wave; hide it.
   Add a second wave with VL BFM 15:00–16:00 and a BRIEFING 15:00–15:30, Ranger on both. EXPECTED (D2001 — a clash is
   kept hidden only while the man is on the SAME two items): the second clash shows red and Ranger's second VL BFM puck
   wears the red ring. Picture the list and both pucks.
4. **S01** — a personal input against flying: Ranger's Meeting filed on the Inputs page over his sortie time; hide the
   clash; re-time the Meeting keeping the overlap; then delete it and file a new Meeting with the same words and
   times. RECORD what each step shows (whether personal-input clashes follow D2001 is a question parked for him).
5. **S17 + S02 [phone]** — F3: two flying lines in one wave with different crew and the same take-off and landing
   (15:00 / 15:00); hide the same-time warning. EXPECTED (F3): BOTH lines' amber time boxes go plain on the week and
   the board; a third, differently named same-time line keeps its own. Put it back with ↺ Reset: both amber again.
   RECORD what the next-week preview shows for the same set-up made in next week.
6. **S05 [phone]** — D1996: an SC shift 07:00–13:00 with R 06:30 typed (so it flies); a LECTURE ground row 09:00–10:00
   with Ranger on it. Arm the SC MAIN seat: EXPECTED the crew list crosses Ranger out "already on LECTURE 09:00–10:00"
   (D1996 — the crew list agrees with the warning list). Seat him anyway: EXPECTED a red clash in the list. Clear the R
   (shift stands by): EXPECTED the crew list no longer crosses him out for the lecture and the clash is not red (the
   standby rule as before). Repeat with a Meeting filed on the Inputs page instead of the lecture.
7. **S29 + Advisory** — Logic → "SC MAIN clashes" → set "another shift" to Advisory. SC AM 07:00–13:00 with R typed
   (flies), SC PM changed to 09:00–15:00 standing by, Ranger on both. EXPECTED (D1996: "a clash inside it is red"): the
   AM–PM clash is red. Then clear AM's R (both stand by): EXPECTED amber, following the Advisory setting. Restore the
   setting.
8. **S28** — D1996: Ranger on a flying SC shift ending 13:00 and a sortie taking off 13:30. EXPECTED the tight-turn
   note (D1996). Reverse the order (sortie first, shift after).
9. **The plain-user round, warnings half:** open a warning's ⓘ, jump from a warning to its man, hide with ✕ and bring
   back with ↺ Reset, Undo and Redo each, publish an amendment with a hide pending and see it on View-only Sched; sign
   in as the member `us` in a new context and confirm the published face shows the hide with no ✕ or Reset offered.

## W3 — reporting, crew rest, days in a row, the Logic page and the template notes (prefix `rcf-w3`, pictures `…/w3/`)

1. **S38 [phone]** — the Logic page's changed lines: open Logic and every "How it works" fold. EXPECTED: each NEW line of
   `2026-11-12-rules-check-fixes-words.md` (the tables "The Logic page, F5–F11" and "Other sentences" — the rows that
   say Logic) is on the page word for word, and none of the OLD lines is. Change "Debrief after landing" to 90 minutes
   and back: RECORD whether the fold's "(2h)" follows. Picture each changed line, cropped.
2. **S37** — the duty-template notes (D1994, D1997): Admin → Squadron config → Duty templates…, a template's "For wave"
   set to AVALON, then BB; and the same window opened from the board's "+ Block" menu pencil. EXPECTED both notes read
   "The AVALON desk — until the AVALON flies, checked only for overseas or medically down (ATT B may still man it), and
   earns no OIL by default on a weekend or holiday. Switch it on in OIL Earn if activated." (and BB's: "The BB desk — the
   same rules as the AVALON desk: until the BB flies, …"). Close by ✕, by Done, by Escape, by a press outside — RECORD
   which close it.
3. **S23 + S24** — D1990: a Monday sortie take-off 19:30, landing blank; Tuesday a sortie for the same man whose report
   (B typed) is 09:29, then 09:30. EXPECTED: 09:29 breaches crew rest (Monday ended 21:30 — take-off + 2h debrief),
   09:30 clears (D1990). Replace the blank landing with "TBD": the same. **Picture the crew-rest warning's words at
   09:29 cropped — the owner is shown it ("Mon landed 19:30 …" with no landing typed).** Then Insights: RECORD Monday's
   hours for that man (D1936: a blank landing adds no hours).
4. **S25 + S26** — D1993: Logic's days-in-a-row limit; a man on timed work Monday–Saturday and on Sunday only a ground
   row with no times. EXPECTED Sunday raises the days-in-a-row warning (D1993) and its dotted marks on the days before.
   Repeat Sunday's untimed row as a duty desk row and a sim seat. Remove Wednesday's work: EXPECTED the warning goes.
5. **S31 + S32** — D1995: a wave's In-time line typed "09:00 RALLY" and the VL's R box 10:00. EXPECTED the week header's
   In-time / Rally reads the 09:00 line as the in-time and VL reports at 09:00 (D1995 — the earlier of the in-time and
   the R box; a line's words never make it a rally). Then lines "RALLY AFTER IN TIME" (no clock) and "RALLY 9h15"
   (unreadable clock): EXPECTED the clockless line sets no time and raises nothing; RECORD the warning the unreadable one
   raises (EXPECTED words: "…reporting line N has no recognised clock. Check the time.").
6. **S33** — D1988, D1989: a man ending Monday 21:30, Tuesday take-off 12:00, nothing typed. RECORD the crew-rest line
   (amber expected — D1988); tap the faint suggested R; RECORD; type a clearing B; EXPECTED the amber reminder stays
   (D1989).
7. **S35** — D1992: Ratchet (ground crew) on all-day local leave filed on the Inputs page; put him on a BRIEFING row
   09:00–10:00. EXPECTED (D1992) his absence is flagged. **Picture the warning's title and words cropped — the owner is
   shown it ("On leave + flying" on a BRIEFING row).** RECORD what the crew list shows for him.
8. **S44 + the plain-user round, day half:** build a Friday through the app (a wave with crew, a ground row, an input),
   sign and publish, amend a time, publish AL1, Undo the publish, Redo; reload; open and close the board by ✓ Done;
   open the Logic page and back. Then a member `us` in a new context: View-only Sched shows the published face.

