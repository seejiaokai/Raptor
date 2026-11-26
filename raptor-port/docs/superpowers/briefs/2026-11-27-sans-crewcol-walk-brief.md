# Walk brief — the crew list's SANS words and F / O / A column (his D2584 Q2, D2581, D2582, D2750, D2751), chat 207, 27 Nov 26

You are an Opus walker. You walk the RUNNING app with a scripted real browser and return pictures and a filled table, and
you run the drawing check. You never read the app's code to look for bugs and never change it. Root of the repo:
`C:/Users/User/projects/Raptor-sans` (ROOT). Same rules as the warning-list walk brief
(`ROOT/raptor-port/docs/superpowers/briefs/2026-11-26-sans-warnlines-walk-brief.md` — its "Read first", "The build and
the people" and "How to judge" sections apply here whole; read them again if you have not).

## The two scenario lists — both walked
- Fable's: `D:/raptor-work/c207-design/fable-crewcol-scenarios.md` (groups A, C, H, R, S, D, negatives, questions).
- Astra's: `D:/raptor-work/c207-design/astra-crewcol-scenarios.md` (A01 …, its questions at the end).
Where two name the same case, walk it once and give both ids. **The EXPECTED lines below replace theirs where they differ.**
Walk Edit Schedule's own crew panel AND the Scheduler Board's crew list — the layout test on GitHub measures only the
Board's.

## Expected lines that replace theirs
- **A man with nothing filed:** no seat picked — no reason line (D2420); a seat picked — the line under his struck name is
  "as built" (D2420's reading; the approved drawing shows "SANS — no availability filed for today"): RECORD its exact
  words at both sizes, and whether that line counts as the widest reason the column stands after. Never a line telling
  the scheduler to file (D2420, D2587) — that is a FAIL.
- **Ranger ahead of his SANS date (posted out from Fri 17 Jul):** exactly "SANS from Fri 17 Jul: no availability filed"
  (D2587) — never "File it…".
- **The mismatch words (D2584 Q2):** "SANS — offered Fly only, not OFT"; two offered "SANS — offered OFT and AMT only, not
  Fly" — the events in the order F, O, A; nothing ticked keeps "SANS — not offering …". PASS / FAIL.
- **The column (D2581, D2582):** the letters' left edges within 0.5px down the whole SANS section, straight after the
  widest reason — never at the row's right edge; when the widest reason changes (a longer one appears or goes) the column
  follows. PASS / FAIL, measured.
- **The hours (D2750, D2751):** with a place picked, never cut off; on a second line under the letter where the column
  leaves no room. RECORD whether AM / PM (or a whole-day filing) also go under the letter — the builder's reading, a
  question for him, not a FAIL either way.
- **The longest line at 402** ("SANS — offered OFT and AMT only, not Fly") under a struck name: measure whether it wraps;
  RECORD with a cropped picture — a wrap is a question for him, a cut-off or an overlap is a FAIL.
- **Two filings for one day / two events with two sets of hours (Fable H-05, Astra's like case):** first find whether the
  app lets him file that way at all (the Inputs page's SANS tab, and Ranger's own SANS calendar); RECORD what the crew
  list then shows. Never make a filing any other way than through the app's controls.
- **The other readers (drag hover, the drop's note, an armed seat):** the same words as the reason line (one source —
  D2587's reading); a difference is a FAIL to report with both pictures side by side.
- Everything else: as the lists say, from the rulings they cite; anything they mark "my reading" is RECORDED, not judged.

## The drawing check (his D1494, D1495) — `ROOT/raptor-port/docs/walk-scripts.md` §10, read whole
The approved drawing is `ROOT/raptor-port/docs/mock/2026-11-25-sans-d2588/`, scene `col` (its pictures `img/col-*.png`;
its script `draw.mjs`, whose `col` scene's asserts are the part list). It was drawn on the build `D:/raptor-work/c185-build`
(main script `index-SXKkjfaJ.js`). It has no part list or record yet:
1. Write the part list `ROOT/raptor-port/scripts/drawcheck/specs/sans-col.mjs` (prove the name free first; copy the
   drawing script's own measuring of the column whole, as §10 says; M5a's `specs/lw-m5a.mjs` is the worked example):
   the SANS section, each row's name puck, its reason, its letters (the column), the hours under a letter — at the
   drawing's states (no place picked; a place picked; the hours wrapped).
2. Record the drawing from `draw.mjs` (SZ=d and SZ=p, ONLY=col) on the c185 build, by `scripts/drawcheck/record.mjs`, into
   `docs/mock/2026-11-25-sans-d2588/drawcheck/`; each record must say its replay drew the approved picture.
3. Check the build `D:/raptor-work/c203-build` against it: `node scripts/drawcheck/check.mjs scripts/drawcheck/specs/sans-col.mjs
   --dist D:/raptor-work/c203-build --out docs/img/handpass/2026-11-27-drawcheck-sans-col` at 1536 and 402. Never run
   `npm run build`. Use a port no one else holds (not 4895–4897); check it free first.
4. Every difference over about 2px listed with its marked pictures side by side; open each before reporting it. The
   departures the builder named (the hours' place for AM / PM) are differences to list, not to accept.
If a step cannot be done (the drawing script will not replay, a state cannot be reached), stop that step after three
tries and report exactly why — do not stand anything in for it.

## The plain-user round (both sizes)
As Saber on Edit Schedule: open the crew panel, pick a flying seat, then an OFT seat, then an AMT extra place, read the
SANS section each time, unpick, close the panel; drag a SANS man over a seat he cannot take and drop him; open the Board
for the day and its crew list, pick a place, close with ✓ Done. Pictures of each, the one right after each press too.

## Hand back
Scratch `D:/raptor-work/c207-walk/X/`; scripts `ROOT/raptor-port/scripts/handpass/scc-w1X-*.mjs` (names proved free,
`npm run lint:changed`-clean); pictures `ROOT/raptor-port/docs/img/handpass/2026-11-27-sans-crewcol/`. Report
`D:/raptor-work/c207-walk/X-report.md`: one row per scenario (both ids, size, PASS / FAIL / RECORDED, what the screen said,
the pictures), every FAIL with pictures and how to reproduce, the drawing check's result and every difference, console
errors, what you could not reach and why, how many pictures. Never commit, push, switch branch or touch other files. Stop
every script and server you started, then reply with the report's path and a five-line summary.
