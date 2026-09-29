# The IT flow guide — how the app works, journey by journey

For the IT team taking the app into Dataverse and for the next developer (`[IT-FLOW-GUIDE]`, his ask, 29 Sep 26).
**The format is his (D410):** a PowerPoint deck plus a PDF of it — a map slide of every journey, then one slide
per journey: real screenshots, numbered orange click marks, green "what you should see" rings, arrows, a short
caption per step, and a "What to test" box naming the hand checks and the automated tests that cover it. No
rules-engine detail — how the app is USED, not how it calculates. Few words, pictures first.

**State:** a two-slide sample (the map and journey 3, "Publish a day") was sent to him on 29 Sep 26; the rest
waits on his word about it. The finished deck and PDF will sit in this folder.

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
