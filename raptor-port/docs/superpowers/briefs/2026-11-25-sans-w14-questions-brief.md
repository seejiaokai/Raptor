# Questions page brief — round A, chat 174 (host), 25 Nov 26

You are a fresh Opus helper. Build ONE HTML page of four questions for the owner (a non-technical fighter-squadron
scheduler who reads on his iPhone). You write only into `D:/raptor-work/c174-qpage/page/` (index.html and an `img/`
folder). You change nothing in the repo. Final message: two lines — the page's path, and anything you could not do.

## Before writing
Load the `artifact-design` skill (Skill tool) and follow its page contract (title of two to four words, colour tokens with
dark mode, phone width with a 16px gutter, no horizontal scroll). The page will be published as a private Artifact by the
host; images are separate files under `img/`, referenced relatively (`img/q1-a.png`) — never embedded as data URIs.

## His standing rules for such a page (follow every one)
- At the very top: each question in one line with its recommendation, linking to its section (D1237). Plain words only —
  what a person sees and what happens; no ruling numbers, code names, review codes, file names or test words (D2164).
- Each question: one decision, a worked example with a named person ("Ranger is SANS from Fri 17 Jul…") and what the screen
  shows today, then the recommendation and what changes if he picks it, then the alternative(s) (memory: questions need a
  worked example; one decision a question).
- Each picture shown beside its question, cropped to what matters, the place marked (a coloured outline drawn by the page's
  CSS over the image, or a marked copy you make), described in words under it — never "see picture 3" (D1222; his note:
  pictures he cannot see by number). Pictures at 2x where available, tap to see full size.
- A question about the phone (his bell) uses the phone pictures; a question about the scheduler's crew list uses the
  desktop pictures (D1951).
- The app's own names: the bell, the SANS reminder, the crew list (the AIRCREW panel's list on Edit Schedule), an armed seat,
  the warning list, SANS availability, "+ Commitment", the SANS calendar.

## Where the pictures are
Cropped deciding pictures: `C:/Users/User/projects/Raptor/.claude/worktrees/lw-balances-hover-275293/raptor-port/docs/img/handpass/2026-11-24-sans-words/w14a/`
(names `run1__<case>-...-desktop.png` and `run1p__<case>-...-phone.png`); the step table that says what each shows:
`…/raptor-port/docs/handpass/parts/swd/w14a-walk.md` (grep it by case: c4, c5, c7, c11). Raw pictures, if a crop is
missing: `D:/raptor-work/c174-walk/w14a/`. Copy the ones you use into `page/img/` (you may crop with any tool on the PC,
e.g. a short node script with the `sharp` or Playwright already in the repo's node_modules — run from the repo's
`raptor-port/` folder, writing only into `D:/raptor-work/c174-qpage/`).

## The four questions (the host's words — keep the meaning exactly; you may make the sentences plainer)
Context line for the page head: "Last night's checks of the new SANS words found nothing broken. These four cases are ones
your rulings don't settle. Each shows what the app does today."

**Q1 — A seat on a flight with no times typed yet.** Ranger is SANS from Fri 17 Jul and has filed nothing. Saber puts him in a
seat on a Sat 18 flight that has no take-off or landing typed yet. Today: Ranger's bell reminder names Sat 18 (you ruled a
seat with no times yet counts), but on Saber's crew list Ranger's name is NOT struck through when that seat is armed — once
times are typed, it is. Pictures: w14a C7 — the bell naming Sat 18 (phone), the crew list with the no-times seat armed
(Ranger plain), and the timed case (Ranger struck). Recommendation: strike him there too when he has filed nothing — with
nothing filed there are no times to compare, so the reminder and the crew list say the same thing. Alternative: leave the
crew list as it is.

**Q2 — The warning list when a SANS man has filed nothing.** Same Ranger, nothing filed, in a timed seat on Sat 18. Today: his
reminder names Sat 18 and the crew list strikes him, but the day's warning list shows no SANS warning — it only warns when he
HAS filed and the seat falls outside what he offered ("SANS: not offering fly today", "SANS: available 08:00–12:00 only").
This has been so since August. Pictures: w14a C4 — the struck name in the crew list and the day's warning list with no SANS
line. Recommendation: keep it — the crew list and his own reminder already say it, and a warning on every SANS flyer until he
files would crowd the list on most days. Alternative: add a warning "SANS: nothing filed for Sat 18" on the day.

**Q3 — A Fly-only filing on a sim day.** Ranger is in the OFT sim on Sun 19 and files SANS availability for Sun 19 with Fly
only. Today: his reminder stops naming Sun 19 (he has filed something), while Saber's crew list and warning list still flag
"not offering OFT today". Pictures: w14a C5 (the c5c steps) — the bell after the Fly-only filing (phone), the crew list or
warning (desktop). Recommendation: keep it — the reminder asks him to file at all; a filing that does not cover the sim is
shown to the scheduler, who can ask him. Alternative: the reminder also names a day whose filing does not cover what he is
planned on ("…on Sun 19 (OFT) with no matching availability").

**Q4 — Standby seats.** Ranger is planned on standby on Sat 18. Today: an SC MAIN seat counts as planned (reminder, crew list
strike, warning); an SC SPARE seat does not; an AVALON line counts only once it is ticked FLIES. All three places agree each
time. Pictures: w14a C11 — the reminder for SC MAIN (phone) and nothing for SC SPARE, with the crew list beside each.
Recommendation: keep it — a SPARE or a non-flying AVALON may never fly, so asking him to file for it would be asking too early;
once the line flies, it counts. Alternative: count every standby seat.

Each question ends with the buttons' worth of choice in words, e.g. "Your answer: strike him too (recommended) / leave as is."
No buttons that do anything; it is a page to read.
