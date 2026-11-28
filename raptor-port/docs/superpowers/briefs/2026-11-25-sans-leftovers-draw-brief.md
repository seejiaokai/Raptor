# Drawing brief — the SANS leftovers (23)–(25), for his look (chat 179, 25 Nov 26)

You draw proposed changes ON THE REAL RUNNING APP, for the owner (non-technical; a fighter squadron's scheduler) to
answer. Nothing in the app is changed by you. You are an Opus helper; the host (chat 179) publishes the page after
reading it whole.

## Read first, whole, before the first drawing
1. `C:/Users/User/projects/Raptor/.claude/skills/brainstorming/mockups-on-the-real-app.md` — the method and its traps.
2. `C:/Users/User/projects/Raptor/raptor-port/docs/design-practices.md` — its head, §0, §6, §8 and §9 (his design lessons).
3. The template to copy (never edit): `raptor-port/docs/mock/2026-11-24-sans-words/draw.mjs` (stages through the app's own
   controls, pictures "today", then changes only the words or marks of the element the app drew, and pictures again) and
   the page style of `raptor-port/docs/mock/2026-11-25-sans-w14-questions/index.html` (the round of questions he answered
   this morning — copy its look and its "Your answers" list at the top).
4. Routes already proved on this kind of build: `D:/raptor-work/c174-walk/recipes.md` (how to add a flying line, arm a
   seat, add an OFT/AMT box, add SC/AVALON/BB, read the day's warning list `#sbWarn`, post Ranger out as SANS, file SANS
   availability) and the helper libraries it names under `raptor-port/scripts/handpass/` (import them; never edit them).
5. The words to draw: `D:/raptor-work/c179-words/fable-words.md` (a fresh Fable's final words — use them exactly; if a
   section there offers two choices, draw both side by side). The rulings' full rows: `D:/raptor-work/c179-words/rulings.md`.

## The build and the people
- Serve the frozen build the host names in your prompt (a folder with `index.html`), on port **4880** only
  (`npx vite preview --port 4880 --strictPort --outDir <folder>` from `raptor-port/`; check the port is free first; stop it
  by its port at the end). It is the live app plus one small change (a SANS man with nothing filed is now struck on a
  flying seat with NO times yet) — so every "today" frame below uses a seat WITH times typed, unless it says otherwise.
- Clock held at 2026-07-15 09:00 as the template does. Saber = `ad`/`a` (admin, scheduler, at a desk); Ranger = `us`/`us`
  (member, SANS, on his phone), id `bane`. Post Ranger out as SANS from Fri 17 Jul first (the template's `post`).
- Sizes: desktop 1536 wide at 2x; phone his iPhone's 402×874, WebKit, touch, 3x (the library's sizes). Every case at both
  sizes; on each pair say which device the owner would really meet it on (Ranger's bell: phone; Saber's crew list and
  warning list: mostly desktop).
- Write the script to `C:/Users/User/projects/Raptor/raptor-port/docs/mock/2026-11-25-sans-leftovers/draw.mjs`, the
  pictures to its `img/`, the page to its `index.html`. Raw runs and logs to `D:/raptor-work/c179-draw/runs/`. Do not
  commit, do not switch branches, do not touch any other folder in the checkout (two other chats' untracked folders sit in
  `raptor-port/docs/mock/` — leave them alone). Do not run a build.

## What to draw — five questions and one built change

Each case: stage it through the app's own controls; ASSERT the staged state on screen; picture TODAY; then change only the
words or marks of the part the app drew (a new part cloned from its real neighbour, marked "New"); picture PROPOSED.
Crop each picture to what the question is about (his D1222), the place marked by an outline drawn on the element.

1. **His bell when what he filed misses what he is planned on** (D2570–D2572). Ranger files SANS availability for Sun 19
   Jul ticking Fly only; Saber plans him on an OFT box on Sun 19 (times typed). TODAY: his bell says nothing about it
   (picture it); the crew list with that OFT seat armed reads "SANS — not offering OFT"; the warning list's SANS line.
   PROPOSED: a new line on his bell, in the bell's own markup (clone a real SANS line), with Fable's words A1. Also draw A2
   (planned to fly on Sat 18, offered OFT only), A3 (planned AMT, offered OFT) and — for the open question — A5 (wrong
   hours). Stage each one for real (the plan and the filing exist), only the bell line's words drawn in.
2. **The crew list's words for that miss** (D2575). The same OFT seat armed by Saber: today "SANS — not offering OFT";
   proposed B1. Also B2 (AMT armed, OFT offered). Desktop and phone.
3. **The warning list's new amber line for nothing filed** (D2579) **and the "S" letter** (D2580). Ranger seated in a timed
   Tue 14 jet (or the nearest day his SANS date allows — he is SANS only from Fri 17; use Sat 18) with NOTHING filed. TODAY:
   the crew list strikes him, the warning list shows no SANS line, his puck has no amber ring. PROPOSED: one amber line in
   the warning list in Fable's words (C), cloned from a real amber advisory line of the same list; his puck wearing the amber
   ring with an "S" chip, cloned from a real amber "A" chip. Beside it, a real SANS miss from case 1 showing today's amber
   "A" and the same puck proposed with "S" (D2580 — every SANS availability flag). The Logic page's line for the check,
   today and proposed (C3).
4. **The Legend** (D2580). Edit Schedule's Legend fold opened: today's amber "A · advisory — shift + ground" line; proposed:
   a new "S · SANS availability" line (Fable's words D) added beside it. Another chat is redrawing other Legend lines
   tonight — draw only this line, and say on the page that the other Legend words may change separately.
5. **SC MAIN, SC SPARE, BB and AVALON** (D2576–D2578). Saber adds an SC wave (times as minted) and an AVALON on Sat 18,
   arms an SC MAIN seat: TODAY Ranger (nothing filed) is struck "SANS — no availability filed…"; arm an AVALON seat: TODAY
   plain. PROPOSED: on SC MAIN not struck, with Fable's note E1 beside his name; the same look on AVALON. Draw a second
   proposed frame for "before his bell has told him" per Fable's answer to E.
6. **A sim with no times yet** (the host's question from the build). An OFT box on Sat 18 with NO start or end typed, its
   seat armed: TODAY Ranger (nothing filed) is plain; PROPOSED struck with "SANS from Fri 17 Jul: no availability filed. File
   it on the Inputs page's SANS tab." — copy the words from a timed OFT seat's real strike on the same build, never type them.
7. **Built (not a question):** a flying line on Sat 18 with no times, its seat armed — Ranger now struck (this build). One
   picture per size, captioned "built — for your look".

## The page (index.html)
- At the very top, "Your answers": one line per question with its recommendation and a link to its pictures (D1237).
  Recommendations (the host's): Q1 yes, tell him on his bell — wrong hours too, as the warning list already flags them;
  Q2 the words as Fable gives them; Q3 yes, the amber line and "S"; Q4 not struck on SC MAIN, SC SPARE, BB, AVALON, the
  note shown only once his bell has told him, nothing before; Q5 yes, a sim with no times strikes him too, so the crew list
  agrees with his reminder. Where Fable raised a question of its own, add it as a further line.
- Every question first says when it happens in real life — who is doing what, how often (D2439) — in plain words, no
  ruling numbers, no codes, no app internals (D2164); today and proposed side by side, numbered tags on the pictures only.
- Pictures tap to open full size; light and dark both readable (copy the template's `:root` tokens and its viewer).
- Under each picture, one line saying which are real and which are drawn in.

## Hand back
Write `D:/raptor-work/c179-draw/report.md`: every case drawn (or why not), each staged premise and how it was asserted,
every place the app differed from this brief, every word drawn and its source, anything the transform had to touch that
this brief did not name (step 5 of the method), and the picture list. Then reply with the report's path only.
