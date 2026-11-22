# Pictures for his round of questions on the reshape plan (chat 125, 20 Nov 26) — the drawing helper's brief

You draw the pictures for seven questions put to the owner, who is not technical, about the plan
`raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md` §11 and §12 (read both; read nothing else of
the plan unless a picture needs it). **Your method is `.claude/skills/brainstorming/mockups-on-the-real-app.md` — read it
whole before the first drawing and follow it**: the real running app reached through its own controls; ONE named
transform per drawn picture; a new part cloned from a real neighbour, outlined pink and tagged "New"; the place of a
question marked with an outline and a numbered tag where nothing is new; each staged record asserted ON SCREEN before a
picture; every picture opened and looked at before you report it.

Work in `C:\Users\User\projects\Raptor-msq\raptor-port` (branch `claude/multi-sqn-b1-107`). Write only in
`docs/mock/2026-11-20-multi-sqn-reshape/`: one script `draw.mjs` (header lists every picture), `img/` (pictures and
`manifest.json`). No app code changes, no git writes, no `npm run build` (the build in `dist/` is current: R1 included).
The app is served at `http://localhost:4527/` from that `dist/`; or serve `dist` from inside the test browser as
`scripts/handpass/msq/msq-fr16-lib.mjs` does (its `openAt`, `putMoves`, the clock installed with `ctx.clock.install`) —
reuse its helpers, but check its pinned bundle name against `dist/index.html` first (it was rebuilt). No screen saves a
squadron move yet: write the move as `putMoves` does (setup only, named in the caption), then press every control the
picture shows on screen. Sizes: desktop 1536×864 Chromium at 2x; his iPhone 402×874 WebKit, touch, at 3x. Demo data
only. Read `scripts/handpass/msq/` for the seeded sign-ins (Saber the master `ad`, Hunter a plain 142 admin `ad2`,
Kestrel 149's admin, Ranger a 142 member) and how earlier walks reached each screen.

## The pictures (d = desktop, p = iPhone; each pair unless said)

The move used throughout unless a question says otherwise: **Ranger, 142 → 149, counting from Thu 16 Jul 2026**, saved
on Wed 15 Jul (the clock on Wed 15 Jul at about 10:00 unless said).

1. **Q1 — an ALL AVAIL meeting filed on 142.** (1a, real) Hunter files, through the Inputs window, an ALL AVAIL squadron
   meeting for Fri 24 Jul; 142's schedule for Fri 24 Jul shows it — mark it "1". (1b, real, today's behaviour) Hunter's
   own move to 149 from Thu 16 Jul written; 142's Fri 24 Jul no longer shows the meeting, and Kestrel's 149 Fri 24 Jul
   does — mark the place on both. Use the question's own move (Hunter's, not Ranger's) for Q1.
2. **Q2 — sign-off boxes.** (2a, real) Ranger's move written; Hunter opens 142's week of Mon 20 Jul, the sign-off box
   for Mon 20 Jul open on its list of names, which still offers Ranger — mark Ranger "2". (2b) the crew list for the same
   day beside it, which does not list him (real; mark the list). (2c, drawn) the same sign-off list with Ranger's name
   hidden (the transform: hide, never remove) — the recommended look. Find where the sign-off boxes live on screen
   (publish and sign); if Mon 20 Jul's boxes cannot be reached, say so and picture the nearest day that shows it.
3. **Q6 and Q3 — a moved man's row on both Leave Wars.** (6a, real, today) Ranger's move written; Saber's 142 Leave War
   in July: what happens to Ranger's row (the fault: the old war loses his months); Kestrel's 149 Leave War in July: his
   row (the fault: counted from before he came). Mark his row or its absence. (6b, drawn, NEW, pink) the proposal:
   142's war — Ranger's row as now up to Wed 15 Jul, then, from Thu 16 Jul, **the war's own existing look for days
   outside a man's window** (find it on the real app first: a man whose window starts or ends inside the month — read
   the grid's code for how it draws days outside a person's window, and picture that real case beside your drawing so
   the look is the app's, not invented); no posting hatch or tag, since no posting was set. 149's war — his row from Thu
   16 Jul, the same outside-window look before it. Mark Fri 24 Jul on 142's row "3": the day a master can no longer write
   leave into (Q3). (6c, real) Admin → Users, Ranger's row after the move: no "posting out" tag — mark the place.
4. **Q4 — when a moved man's View of another squadron ends.** This needs a third squadron, 150: make it as the app lets
   a master (Admin, "+ New squadron", if on screen; else write its place row as setup and say so). The access ladder on
   Admin → Users (None · View · Plan · Master admin) is **not built**: it is an approved drawing — redraw it ONLY from
   `docs/mock/2026-11-19-multi-sqn-pieces/draw.mjs` p1's code (copy its drawing function; never draw it by hand), on
   Ranger's row. (4a, drawn) Wed 15 Jul, after his move to 149 is saved at 10:00: "View 150" still lit — the
   recommendation; a short line under it is NOT added. (4b, drawn) Thu 16 Jul: "None" lit. Caption each with its day
   and time. Desktop and iPhone.
5. **Q5 — the guest switch.** (5a, real) find the guest switch on screen (the setting that lets people who asked for
   access see the schedule — grep `guest` in `src/ui/` and `src/state/`); Kestrel turns on 149's — mark it "5". (5b,
   real) a waiting guest's session: it lands in 142's week (mark the place that says whose week). If Kestrel's switch
   is not on his screen, picture where it is and say so.
6. **Q7 — the band at midnight.** (7a, real) Ranger, signed in, with a Leave War request window open and words typed in
   its remarks, the clock at 23:58 on Wed 15 Jul (on the phone, set the words through the box's own event — never type,
   per the method). (7b, drawn, NEW, pink) the same window just after midnight with one band across the window's top,
   cloned from the app's own note or warning band look, reading exactly: **"You are 149's from today. This can't be
   saved in 142's Leave War."** and one button, **"Close"**, cloned from the window's own buttons. The typed words stay
   visible under it. (7c, drawn, NEW) a Tracker chart being edited at the same moment, the band reading **"You are
   149's from today. This can't be saved in 142's Tracker."** with "Close" — find what "editing a chart" is on the
   Tracker first; if the Tracker has no open editing state, picture its page with the band and say so.

## What you return

A short report: each picture's file, whether real or drawn, its transform, what it shows; every place the app differed
from this brief or from the plan's §11/§12 (each a finding for the plan — e.g. a look that does not exist, a question's
example that the app contradicts); each staged record's on-screen assertion; the page errors the runs printed. Look at
every picture yourself before you report it. Keep the report under 800 words.
