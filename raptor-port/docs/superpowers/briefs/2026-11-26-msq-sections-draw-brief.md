# Brief — draw what each section still owes, for its mock-up page (chat 191, 26 Nov 26; D2656, D2657, D1625)

Four drawers run at once, one per section. You draw; you build nothing in the app. The owner is not technical and
reads on his iPhone. These pages are the last look he gets before each section is built: **a wrong or guessed drawing
means he approves a build he never really saw.**

## Your section — the host's message names it

| # | Section | Your prefix (pictures `drawn/<prefix>-*`, scripts `n191/draw-<prefix>*.mjs`, words `n191/words-<prefix>.mjs`) | Ports |
|---|---|---|---|
| 1 | Core — the guard rail | `s1` | 4721–4724 |
| 2 | Admin → Users across squadrons | `s2` | 4725–4728 |
| 3 | The bell, colours and Display | `s3` | 4729–4732 |
| 4 | The posting sheet on the Leave War | `s4` | 4733–4736 |

Touch only files you create with your prefix. Scripts go in `raptor-port/scripts/handpass/n191/` (create it; another
drawer may have).

## What to draw

Your section's **OWED** rows in the ledger, `raptor-port/docs/superpowers/briefs/2026-11-26-msq-sections-drawings-ledger.md`
— every one, desktop and phone unless the ledger says why only one applies. Rows marked "drawn, never shown" need no
new drawing: list them in your report so the page shows them. A row that needs a question before it can be drawn
(the ledger says so, e.g. Quals' "Add qualification", an admin of both squadrons, Display for a one-squadron admin):
draw the recommended answer and, if cheap, the other one, and write the question in one line with its
recommendation and an example of when it happens in real life (who is doing what, how often — D2439).

**His rulings decide every look.** Read the full rows first (the shell: `grep -h '^| D2652 |' .claude/decisions-full/*.md`):
D2620–D2657, and the rows the ledger cites for your rows. In particular: "+ Add a person" is in Admin → Users' TOP row,
its form opening there (D2652 N13); a man held on View or Plan shows once while searching (D2652 N13); the bell's number
in its squadron colour (D2638, D2639); the sign-off boxes and "+ Input"'s Person list keep the phone's own list
(D2646); the posting sheet is way C (D2653). A drawing made before a later ruling is redrawn to that ruling.

## How (read first)

- Folder `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135` (use `git -C`; do not switch,
  commit or push).
- The served app: check whether `http://localhost:4700/` serves THIS folder's `raptor-port/dist` (compare a script
  name in the page's HTML with `raptor-port/dist/assets/`). If not, serve it on a free port of YOUR range
  (`npx vite preview --port N --strictPort`, from `raptor-port/` by its full path, in the background). Never rebuild
  the app, never stop another chat's server. Say which you used.
- How the drawings are made: `raptor-port/scripts/handpass/n176/` — `world.mjs`, `draw-lib.mjs`, `draw-r5b-lib.mjs`,
  `draw-r6-misc-lib.mjs`, and the drawer of your section's last round (`draw-r6-users.mjs` / `draw-r6-nav.mjs` for 2,
  `draw-r5b-display.mjs` / `draw-r5b-bell.mjs` / `draw-r5b-colour.mjs` for 3, `draw-r6-posting*.mjs` for 4,
  `draw-e*.mjs` / `draw-r6-misc-*.mjs` for 1); the ledger names the best file to start each redraw from. Reuse their
  helpers by import; do not edit them.
- **A drawing adds only the new thing on top of the real app, in the app's own parts and sizes, measured from the app,
  never guessed** (his D2644: a drawn pair of buttons is the app's own pair — same size, one line). A list of people
  is drawn as it really shows on his phone (D2646).
- Output `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/`: each whole picture plus its `-crop`, desktop 1536
  wide, phone 402×874, deviceScaleFactor 2. Three squadrons in the world (142, 149, 150) and Hunter with rights in
  several (D2630).
- **Marks:** what is new in the app (not there today) gets a **teal dashed ring, 2px, `#0D9488`, 4px clear of the
  part**. No violet (round 6's mark) and no pink (old "look here") on new pictures.
- Every new on-screen word goes in your words file, each marked "draft — owed a fresh Fable review (D2441)". Use the
  words already reviewed where the ledger or the round-6 reports give them; never reword reviewed words.
- Open every picture you produce (cropped is fine) and check it against the ruling before you call it done. Each
  script prints `FACT` lines of what the screen said; keep them.

## Your report

Write it to `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s<N>-draw-report.md`: one row per ledger row —
state, picture files (desktop / phone), what is new in it (ringed), the ruling it follows, any departure from the
ruling or the app and why, any question you wrote. Then every new word drafted. Then anything you could not draw and
why. The transcript may be lost — the file is the report. Reply with a short summary.
