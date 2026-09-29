# The IT flow guide — how the app works, journey by journey

For the IT team taking the app into Dataverse and for the next developer (`[IT-FLOW-GUIDE]`, his ask, 29 Sep 26).
**The format is his (D410):** a PowerPoint deck plus a PDF of it — a map slide of every journey, then one slide
per journey: real screenshots, numbered orange click marks, green "what you should see" rings, arrows, a short
caption per step, and a "What to test" box naming the hand checks and the automated tests that cover it. No
rules-engine detail — how the app is USED, not how it calculates. Few words, pictures first.

**His look at the sample (D411, 29 Sep 26):** approved as drawn — four pictures a slide, the style kept — and the deck
ALSO covers the alternate-plan flow (saved plans: making one, switching, bringing one out) and SHOWS THE WORK FLOW: a
slide after the map with the life of a day across the roles, each stage naming its journey slide. The finished deck and
PDF sit in this folder.
**And step by step (D412, 29 Sep 26):** how a schedule is made, in order, over several slides; and wherever the app
offers more than one way to do a thing (a puck brought onto a seat, and every other such case — his examples are not the
limit), a slide shows each way side by side, each with its steps and what to test.
**The Leave War has its own work flow slide (D413):** the admin creates the period → opens it for bidding → members bid →
closed for the admin's decisions → published → members edit their remarks; later changes mainly by the member through
Inputs, while the admin may edit directly on the war. Each stage is checked in the running app before it is drawn.
**The Tracker in full (D414):** how a flow chart is made (each tool, joining events, editing an event), how a member
updates it and what he sees, the other ways to update, what it refuses (an NA cannot have fails), students and courses,
export and import — and whatever else the app has; his list is not the limit.
**What happens by itself (D415):** for one action — one input filed, and the others that spread the same way — every
place that changes without anyone touching it, drawn as a "where one change shows up" slide.
**The two editing modes (D416):** the Scheduler Board (one day, the day-dedicated functions) and Edit Schedule's week (the
big picture, smaller edits) — set side by side, and each schedule-making step says which mode it uses.
**The Leave War's manning (D417):** how it is set up and customised — where its rows come from, adding, changing or
removing one, what the grid shows after. His list closes there ("All I can think of"); the agent adds what else it finds.

## Remaking it after a screen changes

The pictures come from the running app, so the deck can be re-shot rather than redrawn. From `raptor-port/`:

1. `npm run build`, then serve it on port 4185 (`npx vite preview --port 4185`, or the `raptor-itflow` entry in
   `.claude/launch.json`).
2. `node scripts/itflow/capture.mjs <shotsDir> [journey,…]` — signs in fresh for each journey, drives it,
   takes each picture and records where every mark goes (`manifest.json`).
3. `node scripts/itflow/deck.mjs <shotsDir> <deck.pptx>` — lays out the slides. It needs `pptxgenjs`, which is
   NOT an app dependency: `npm i --no-save pptxgenjs`, or point `ITFLOW_MODULES` at a folder that has it.
   The words of every slide live in `JOURNEYS` at the top of that file.
4. `powershell -File scripts/itflow/pdf.ps1 <deck.pptx> [<pngDir>]` — PowerPoint itself writes the PDF (and,
   with a folder, one picture per slide), so the PDF matches the deck exactly.

A journey's "What to test" names real test files; when a test is renamed or a journey's screens change, change
its entry in `JOURNEYS` and re-run steps 2–4.
