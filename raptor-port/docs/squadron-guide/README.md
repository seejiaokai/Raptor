# The guide for another squadron's schedulers

His ask, 24 Nov 26 (chat 159): an easy guide for colleagues in other fighter squadrons seeing TALON for the first
time — how it works and what logic is in it now — so they can say what is the same for them, what is different and
what is missing. Its readers, his words the same day: F-16 schedulers and training appointment holders; and it says
how SC MAIN, SC SPARE, AVALON and BB are flagged (its section 7). A first piece of `[USER-GUIDE]`; the answers feed
`[SINGLE-SEAT]` and the multi-squadron build.

**What he sends them:** `talon-guide.pdf` (opens anywhere), `talon-guide.html` (the same guide as one page, pictures
inside it) and `questions.txt` (the eleven questions as plain text, each with its context, to paste into a chat).

**How it is made — nothing in its two big tables is typed by hand:**
- `logic.json` — the Logic page's own words and standard values (its settings, its checks with their level and their
  "How it works", the letters on a puck), read out of `src/ui/logic-html.ts` and the engine's standard settings. Every
  setting row gets a code S1… and every check row C1…, so a reader answers "S6: our step is 45 min".
- `build.mjs` — writes the HTML and, with `--pdf`, the PDF. The hand-written parts (what the app is, the pages, plan to
  published, the typed words that switch a rule on, what is built around the F-15) are in its template.
- `shots.mjs` — takes the ten pictures from the built app served locally (the demo data — invented people; nothing is
  masked, his word of 26 Sep 26), with the IT flow guide's toolkit, `scripts/itflow/lib.mjs`. The demo week has no
  standby wave and no published day, so it adds an SC wave and publishes Monday inside its own pages; nothing is saved.
- The hand-written parts were read against the code twice by a fresh Opus reader (24 Nov 26), every finding taken.
- `questions.txt` — the questions; the guide's last section is built from it, so the two cannot differ.

**To rebuild after the app's rules or screens change** (from `raptor-port/`, the checks lock free for the build):
1. Read the Logic page out again: a one-off test file under `src/ui/` that imports `lgSettings`, `lgChecks`,
   `lgChkName`, `lgKinds` and writes them, values included, to `logic.json` (the shape is the file's own); run that one
   file with vitest, then delete it.
2. `npm run build`, serve it (`npx vite preview --port 4180`), then `PORT=4180 node docs/squadron-guide/shots.mjs`.
3. `node docs/squadron-guide/build.mjs --pdf`.

**Names (D58, D63):** the guide says "a two-seat F-15 squadron" and names no unit or service.
