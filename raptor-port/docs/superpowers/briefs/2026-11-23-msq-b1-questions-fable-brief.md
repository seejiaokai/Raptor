# Fable's review of the questions (b)–(p) put to him on batch 1's second half (RAPTOR), 23 Nov 26

**His ask (23 Nov 26, to chat 151):** "can fable review these questions and see if its sound. correct as required. write
it clearly. also the text u put in the app. recommend me. provide context as well". He is not technical: every word you
write for him follows `.claude/rules/plain-language.md` (read it whole first) — the app's own names for things, no file,
function or ruling numbers in the text he reads, every claim with its consequence, short sentences.

**The copy:** `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135` (head as you find it — the built app
in `raptor-port/dist` is that code). Change no file under `raptor-port/src`; do not commit, push, build or run the test
suite. You may serve the built app (`npx vite preview --port 4479 --strictPort` from `raptor-port`, the port checked free
first with `netstat -ano | findstr :4479`; stop it when done) and take new pictures with a small Playwright script of your
own (sign-ins: Saber `ad`/`a`, Ranger `us`/`us`, others as `raptor-port/scripts/handpass/n149/walk/lib.mjs` signs them in;
rights given through Admin → Users as a person would). New pictures go to
`raptor-port/docs/handpass/2026-11-23-msq-b1-morning/fable/`, each cut to what the question is about and the place marked.

**The questions as put this morning:** `HANDOFF.md`, the `claude/msq-b1-screens-135` block, the bullet "Questions waiting
for him (from job 1 …)" — (a) to (p); (a) and (i) fell away with his ruling D2381 (a squadron he only views offers its
View-only Sched and Help alone). Their pictures and words: `raptor-port/docs/handpass/2026-11-23-msq-b1-morning/`
(`manifest.md`, `page.html`, `q-*.png`). Where they came from: `raptor-port/docs/handpass/parts/n149/job1.md` … `job4.md`,
`fixjob*.md`. Chat 151 has just put (b)–(e) to him again; his answers have not come.

**The rulings to check them against — read before judging any:** `.claude/rules/decisions/people-accounts.md` (whole), the
screen-design rulings `.claude/rules/decisions/design.md`, and for any question touching them the Inputs, Leave War and
Tracker pages (`inputs.md`, `leave-war.md`, `tracker.md` under `.claude/rules/decisions/`). Open a ruling's full row before
relying on its detail: `grep -h '^| D2323 |' .claude/decisions-full/*.md` (the shell). Rulings made today that change the
ground: D2381 (View only and Help), D2382–D2384 (the ☰ menu's squadron list), D2387 (a View holder sees another
squadron's medical inputs), D2388 (a View-only pick asks about unsaved Tracker edits), D2389 (a window held by the switch
to the member view reads "Member view." / "Switch back to the admin view to change this, or close it.").

**For each of (b)–(h) and (j)–(p):**
1. Is it still true on today's build? Check the code and, where it decides, the running app. If it changed or fell away
   (today's rulings, the fixes since this morning), say so and drop or rewrite it.
2. Is it sound — does the question match his rulings, is the recommendation right by them and by good design (intuitive,
   the same everywhere, fewer places for a fault; never the easiest to build), is anything missed (a knock-on effect on
   another screen, a second and third step)? Correct it where it is wrong.
3. The words on screen: quote exactly what the app says today, and for any change, the exact words proposed. Anything new
   a person would see is drawn before it is built (his rule) — mark such questions "new words: drawn for you first".
4. Write it for him: where in the app and who meets it (one named example: Hunter, an admin of 142 with Plan of 149 …),
   what happens today, the choice, your recommendation and why, and what it costs or changes elsewhere. One decision per
   question; none depending on another's answer.

**Output:** one file, `raptor-port/docs/superpowers/specs/2026-11-23-msq-b1-questions-b-to-p.md`:
- at its top, the questions in rounds of three or four, each one line: the question, the recommendation, its picture;
- then each question in full, its picture paths (existing or your new ones), as in 4 above;
- at its foot, apart: what you changed from this morning's version and why, questions dropped and why, any new question
  you found.
Your final message: a short summary of what changed and which questions need him most. Plain and short.
