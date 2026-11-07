# The pictures round — the helpers' shared brief (chat 3, the night of 7–8 Nov 26)

**What this is.** The owner (not technical; an iPhone; his PC shows at 125%) gave the night's go on 7 Nov 26 (D1747): the
pictures round of about twelve small questions the backlog keeps for him is DRAWN tonight, so he can answer them all
tomorrow from his phone. Nothing is built in the app. Each question is drawn first because it shows something new (D1625,
D853). Chat 3 (the host) splits the questions into four groups; each group goes to one helper, who pictures the real app
today, draws each fix on the running app, and writes a notes file. The host checks every deciding picture and builds the
one page he reads. The plan's list: `raptor-port/docs/superpowers/plans/2026-11-05-backlog-sizing.md` §3.

## Where you work, and what you may touch

- The checkout: `C:\Users\User\projects\Raptor\.claude\worktrees\pictures-round-57c55c` (branch `claude/pictures-round`).
  **Do not** commit, push, switch branch, stash, or change any file under `raptor-port/src/`, `.claude/`, `HANDOFF.md`,
  `OUTSTANDING.md`, `DECISIONS*.md`. Other chats are building app code and rewriting rule files tonight — touch nothing of
  theirs. The host commits your files.
- **Write only:** your script `raptor-port/scripts/handpass/pr-<group>.mjs`, your pictures in
  `raptor-port/docs/img/handpass/2026-11-07-pictures-round/`, and your notes file there, `notes-<group>.md`.
- **The app:** already built from `main` and served at **http://localhost:4291** by the host. Never build, never start
  another server, never run the test suites. Run your script from `raptor-port/`:
  `HP_URL=http://localhost:4291 HP_SHOTS=docs/img/handpass/2026-11-07-pictures-round node scripts/handpass/pr-<group>.mjs`.
  In Git Bash a regex or `\n` inside `node -e` arrives mangled — write scripts to files. Use `newline=''` if you edit with
  Python (else CRLF).
- Sign in as `ad` / `a` (admin, Saber); a member is `us` / `us` (Ranger). Hold the clock still where the demo week needs it
  (round 4 used `ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })`); a Leave War period may need another date.

## Read before you draw

1. `.claude/skills/brainstorming/mockups-on-the-real-app.md` — whole. It is the method and its traps.
2. `raptor-port/scripts/handpass/cr4-look.mjs` — round 4's script: copy its helpers (`world`, `ring`, `around`, `strip`,
   `settle`, `swapMark`, `tryQ`, the `ICON` set of drawn marks) and `scripts/handpass/lib.mjs` (`login`, `go`, `board`).
3. `raptor-port/docs/design-practices.md` — its head and §0 (lines 1–90) and §9, his design lessons (from line 672), whole;
   §1 and §1b (lines 91–200, 267–410) for any words you write; §3 and §4 for layout and marks. Open the rulings file
   `.claude/rules/decisions/design.md` with the Read tool, and your area's rulings file (named in your group).
4. Your items in `OUTSTANDING.md` (find each by its tag, read it whole) and every ruling it names, by its FULL row:
   `grep -h '^| D1625 |' .claude/decisions-full/*.md` (the shell — the Grep tool hides a long row). Check each item is
   still open on today's app (search the app's code, `git log origin/main --grep=<TAG>`, `OUTSTANDING-ARCHIVE.md`); one
   that has gone stale is reported as such, not drawn.

## What each question needs (his rulings, in short)

1. **The real app today**, at his iPhone's size (402 × 874, touch: `isMobile`, `hasTouch`) and at a desktop's (1536 × 864,
   his PC) as the item needs, both at `deviceScaleFactor: 2` (sharp on his phone). **Cut to the area** — a whole screen only
   when the question is about the whole screen (D1222). **The place marked** — an outline drawn on the element itself
   (never a box laid over the page at measured places), and **the problem named in plain words on the picture**: a small
   tag on the ringed element (its own `::before` with `content: attr(data-zz-tag)`, amber `#ffb020` on the app's dark,
   12–13px bold) — e.g. "No 'waiting' mark here" (D853, D921, D1222).
2. **A mock-up of each fix** you would offer, drawn ON the running app (DOM and style changes in the page, nothing saved),
   each part drawn the way the app already draws that kind of part — copied from a real neighbour, never a look of its own
   (D1496); any part he already approved in a drawing is redrawn from that drawing (D1478); any style the app does not
   have is named as new. New words follow the writing guide (§1, §1b): every fact first, then a sentence a person would
   say across a desk, then as short as those allow; no dash as a join; "you", never "we"; a button starts with its verb.
   Tag the drawn picture too ("Drawn: …"). Usually two or three options; one when only one is sensible — say why.
3. **One decision per question**, with a **worked example naming a case** ("Saber files LL for Sat 18 Jul after the day is
   published: today his row on Unavailable shows nothing; with A it shows …"), **your recommendation first**, and why —
   judged by what is intuitive, fits the workflow, behaves the same everywhere and leaves fewer places for a bug, never by
   what is easiest to build (D754). Name every earlier ruling an option would change.
4. **Look at every picture you make** (open the PNG) before you call it done: each failure in the method file passed its
   script with no error. A before / after pair that looks the same means the crop missed the change.

**Not a finding (D56):** a problem living only in demo data already stored, where the code is right going forward.

## What you hand back

- `notes-<group>.md` in the pictures folder. Per question, in this order: **(a) the question in one plain sentence** (no
  file, code or class names — he is not technical); **(b) still open?** what today does, measured (the numbers you read);
  **(c) the pictures**, each file name with one line of what it shows and whether it is real or drawn; **(d) the options**,
  each: its pictures, its exact new words if any, what it changes, the rulings it changes; **(e) the recommendation and
  why**; **(f) the worked example**; **(g) "for the build"**: where it lands in the code and anything the drawing had to
  touch that the item did not name (the method's step 5) — this part may name files. Then a short list of anything you
  could not picture, and why.
- Your final message to the host: two or three lines — the questions done, any gone stale, anything you are unsure of.
  Do not paste the notes; the host reads the file.
