# Brief — the Leave War overhaul's night drawings (night of 21–22 Oct 26)

The common brief for the drawing helpers of the night's /overnight run (D1204–D1207). Each helper gets this file and
its own job (below). The owner is asleep; nothing waits on him tonight.

## What this is

The Leave War (a tab of the RAPTOR app: a year grid of who is on leave, members bid for leave, admins decide) is being
overhauled. Nothing is built yet: every change is DRAWN first, over the real app, and put to the owner on a page of
pictures. He is not technical; he judges from pictures. His rulings D1140–D1207 say what he wants.

## Read first (in this order)

1. `raptor-port/docs/design-practices.md` — the ONE design guide. Read §0, §1 (words), §1b (how the app speaks), §3
   (layout), §4 (colour — what each colour already means), §6, §7, and **§9, his design lessons, every one** (lessons
   20–30 are this overhaul's; lessons 18–19 are main's pencil lessons).
2. `.claude/rules/ui-design.md` — the short form of the guide.
3. The Leave War rulings: `.claude/rules/decisions/leave-war.md` (one line each, D1140–D1207 and older). Before acting
   on a ruling's detail, read its full row with the shell: `grep -h '^| D1201 |' .claude/decisions-full/*.md`.
4. The design note: `raptor-port/docs/superpowers/specs/2026-10-21-leave-war-overhaul.md` — §5 (his answers, in
   order) and §9 (the full mock-up's plan).
5. Invoke the `impeccable` skill yourself (D819) — `shape` for a new screen, `critique` for a look — ON TOP of the
   guide; where it meets the guide or a ruling, the ruling wins. Keep the Raptor look (dark, its own chips, pucks,
   windows); no new colour that the guide's §4 table already gives a meaning; buttons keep their size (D487).

## How the drawings are made

- The app's build is served at `http://localhost:4197/` (already running — never stop or restart it; never rebuild).
- Drawing scripts live in `raptor-port/docs/mock/lw-overhaul/`. Shared helpers: `full-lib.mjs` (sign in as member
  `us`/`us` = Ranger or admin `ad`/`a` = Saber, the clock fixed at Thu 8 Jan 26, `mark()` for the pink numbered
  marks, `shot()`). Two ways are used, both fine:
  - **Into the real app** (`full-win-a.mjs`, `full-r4.mjs`): sign in, open the screen, inject the new parts with the
    app's own classes, mark, screenshot. `full-win-a.mjs` has `personScene(...)` — today's person window drawn as the
    round-2 proposal; start from it for the person window.
  - **Over a picture** (`full-r4b.mjs`): an HTML overlay over an earlier screenshot, sampled background, marks
    `data-mk`.
- Sizes: his iPhone — 390×844 CSS px at 3× (`newPage(browser, 390, 844, true)`); a desktop — 1536 wide at 1.25×
  (his PC runs at 125%). Phone first: members are mostly on a phone; schedulers mostly at a desktop (D820).
- Run from `raptor-port/`: `LWMOCK_OUT=<your own scratch folder> node docs/mock/lw-overhaul/<your-script>.mjs`. The
  pictures land in `<folder>/out/`. Copy the ones you keep into `raptor-port/docs/mock/lw-overhaul/full/` with the
  names your job gives.
- **Write scripts with the Write tool** (never `node -e`, never a heredoc holding an apostrophe, `\` or `${…}`). In any
  string replace, use `s.replace(a, () => b)`.
- **Open every picture you keep with the Read tool and look at it**: nothing cut off, nothing overlapping, text
  readable at the phone's size, marks on the right thing. Redraw until it is right.
- Every new or changed part carries a pink numbered mark; each number is explained in your write-up.

## Limits

- Change no file outside `raptor-port/docs/mock/lw-overhaul/` (your new script and your pictures). Do not edit the
  design note, the rulings, `HANDOFF.md`, `OUTSTANDING.md`, the page (`full-page.html`) or any app source. Do not
  commit or push — the host does.
- No technical question goes to the owner. A choice that is truly his (product meaning) is written as a question with
  your recommended answer and its picture.

## What you return (under 700 words)

1. The pictures kept: each file name and one line on what it shows.
2. The design, in plain words: what each numbered mark is, and why it is that way (name the ruling or lesson).
3. Taps: for the main task of your screen, how many taps from opening the Leave War, phone and desktop.
4. What you chose yourself that he has not ruled (the agent's readings) — each one line.
5. Questions for him (at most two), each with a recommended answer and which picture shows it.
6. Anything in the existing design or rulings you found that does not fit with your screen (for the red team).
