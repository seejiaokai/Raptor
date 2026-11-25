# Drawing brief — the schedulers' bell line when a SANS man withdraws (D2588) and the crew list's F / O / A column (D2581, D2582), for his look (chat 185, 25 Nov 26)

You draw proposed changes ON THE REAL RUNNING APP for the owner (non-technical; a fighter squadron's scheduler) to answer.
Nothing in the app's source is changed by you. You are an Opus helper; the host (chat 185) publishes the page after reading
it whole. Work only in `C:/Users/User/projects/Raptor/.claude/worktrees/dreamy-maxwell-a0acf7` (the branch
`claude/sans-leftovers-179`); do not commit, push, switch branches or run a build.

## Read first, whole, before the first drawing
1. `.claude/skills/brainstorming/mockups-on-the-real-app.md` — the method and its traps.
2. `raptor-port/docs/design-practices.md` — its head, §0, §6, §8 and §9 (his design lessons).
3. The template to copy (never edit): `raptor-port/docs/mock/2026-11-25-sans-leftovers/draw.mjs` and its page
   `index.html` (its look, its viewer, its "Your answers" list at the top, its light / dark tokens). It already stages
   Ranger's posting, his SANS filings, flights, OFT / AMT boxes, armed seats and his bell — reuse its routes.
4. The words, exactly: `raptor-port/docs/superpowers/briefs/2026-11-25-sans-d2587-d2588-words-fable.md` §Wording 2 (a)–(d)
   and its five questions. The ruling: `grep -h '^| D2588 |' .claude/decisions-full/*.md`; the column's:
   `grep -h '^| D258[12] |' .claude/decisions-full/*.md`; the words already ruled for the crew list's mismatch:
   `grep -h '^| D2584 |' .claude/decisions-full/*.md` (its Q2).

## The build and the people
- Serve the frozen build `D:/raptor-work/c185-build` (`index-SXKkjfaJ.js`) on port **4880** only
  (`cd "C:/Users/User/projects/Raptor/.claude/worktrees/dreamy-maxwell-a0acf7/raptor-port" && npx vite preview --port 4880
  --strictPort --outDir D:/raptor-work/c185-build`; check the port is free first; prove the served page names that bundle;
  stop it by its port at the end).
- Clock held at 2026-07-15 09:00 as the template does. Saber = `ad`/`a` (admin, scheduler, mostly at a desk); Ranger =
  `us`/`us` (member, SANS, on his phone), id `bane`. Post Ranger out as SANS from Fri 17 Jul first.
- Sizes: desktop 1536 wide at 2x; phone his iPhone's 402×874, WebKit, touch, 3x. Every case at both sizes; say which device
  he would really meet it on (Saber's bell and crew list: mostly the desktop).
- Script `raptor-port/docs/mock/2026-11-25-sans-d2588/draw.mjs`, pictures its `img/`, page its `index.html`. Raw runs and
  logs `D:/raptor-work/c185-draw/`. Leave every other folder alone.

## What to draw
Each case: stage it through the app's own controls; ASSERT the staged state on screen; picture TODAY; then change only the
words or marks of the part the app drew (a new part cloned from its real neighbour, marked "New"); picture PROPOSED. Crop
each picture to what the question is about (his D1222), the place marked by an outline on the element.

1. **Saber's bell when Ranger withdraws for a day he is planned on.** Ranger has filed Fly 08:00–17:00 for Sat 18 Jul;
   Saber plans him on a flight named "VL BFM", T/O 13:00 (times typed). Then, as Ranger on his phone, he deletes that filing
   on the SANS calendar. TODAY: Saber's bell says nothing of it (picture). PROPOSED: a new line in Saber's bell, cloned from
   a real line of Saber's bell, with Fable's words (a). Then stage for real and draw (b) Ranger cuts it back to Fly
   08:00–10:00, (c) to OFT only, and (d) planned on an OFT at 10:00 and VL BFM — the quieter line naming both.
2. **The five questions**, each its own section with its worked example (Fable's file) and, where a picture helps, the
   staged case: Q1 a cut-back that still covers the flight (Fly 08:00–17:00 to 10:00–17:00); Q2 hours moved, not cut
   (08:00–12:00 to 14:00–18:00); Q3 Saber deletes it for him; Q4 one filing over Sat 18 and Sun 19, both planned, deleted
   in one press; Q5 two planned things, only one no longer covered. Draw the proposed line for each recommendation below.
   Recommendations (the host's): **Q1 no line** while what he is planned on is still covered — the schedulers hear only
   when the plan is hit; **Q2 a line**, its title "changed his SANS availability" since nothing was cut; **Q3 a line to the
   other schedulers**, naming who did it ("Saber deleted Ranger's SANS availability for Sat 18 Jul."), none to Saber himself;
   **Q4 one line a day**, as his own mismatch line is one a day and a tap opens that day; **Q5 name only what is no longer
   covered**. Add Fable's sixth point as a line: "planned" means a flying seat or a sim, as for his own reminder.
3. **The crew list's F / O / A letters in one column** (already answered: straight after the widest reason). Saber presses
   an AMT seat (times typed) on Sun 19 with several SANS men whose reasons differ in length (one offered Fly only, one OFT
   only, one with hours, one nothing filed) so the small offered letters after each reason sit at different places. TODAY
   as drawn now; PROPOSED: the letters moved into one column just after the widest reason, the reasons in the words he
   already chose for a mismatch ("SANS — offered Fly only, not AMT"; two offered "SANS — offered Fly and OFT only, not
   AMT"). Desktop and phone. Find where the letters are drawn by reading the crew list's real markup on the page.

## The page (index.html)
- At the very top, "Your answers": one line per question with its recommendation and a link to its pictures (D1237): the
  bell line's words (a)–(d) as Fable wrote them — recommend yes; Q1–Q5 as above; the column — "built as drawn" (already
  answered), for his look only.
- Every question first says when it happens in real life — who is doing what, how often (D2439) — in plain words, no
  ruling numbers, no codes, no app internals (D2164); today and proposed side by side, numbered tags on the pictures only.
- Pictures tap to open full size; light and dark both readable (the template's tokens and viewer).
- Under each picture one line saying which parts are real and which are drawn in.

## Hand back
Write `D:/raptor-work/c185-draw/report.md`: every case drawn (or why not), each staged premise and how it was asserted,
every place the app differed from this brief, every word drawn and its source, anything the transform had to touch that this
brief did not name, and the picture list. Then reply with the report's path only.
