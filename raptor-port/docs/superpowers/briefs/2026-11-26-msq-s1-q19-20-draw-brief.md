# Section 1 (the guard rail) — the drawings for questions 19 and 20 (chat 204, 26 Nov 26)

**A drawing job: pictures of the real app for two questions put to the owner. No file under `raptor-port/src`
changes.** Step K3 built the grey "Blocked:" note. Five states it can meet have more exact words that a fresh Fable
kept or that follow his ruled shape, but **he has never seen them drawn** (D1625), so the app says his plain words
there and each exact wording is put to him with a picture. He is not technical: the pictures and the cards' words are
for him (`.claude/rules/plain-language.md`; the rulings D2164, D2439, D1222 on the general rulings page, §Showing
him, asking him).

## Read first

- `.claude/skills/brainstorming/mockups-on-the-real-app.md` — how a proposed change is drawn on the running app.
- `raptor-port/docs/walk-scripts.md` — how a script that drives the app is written, and its traps.
- K3's report, `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k3-report.md` — **its "Words owed" section
  gives the steps that reach each state** — and the note's code: `src/ui/guardnote.ts` (`guardSay`, `noteAtFor`),
  `src/ui/toast.ts` (`toastAt`), `src/ui/guard.ts` (`GUARD_LEADS`, `guardWords`).
- How an earlier chat drew this same note on the real app: `raptor-port/scripts/handpass/n198/draw-sansnote.mjs`
  and its report `…-msq-s1-sansnote-draw-report.md`; the section page's drawer `raptor-port/scripts/handpass/n191/draw-s1-notes.mjs`
  and its library `draw-s1-lib.mjs` (three squadrons in the picker — D2630; sign-ins; the crop and the teal ring).
- The approved look of the note beside its control: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/`
  (`s1-cal-sanssettings-alt-p-crop.png`, `s1-cal-sanssettings-d-crop.png`, `d3e-d-note-crop.png`). If this working
  copy is lean, fetch that folder first (`node raptor-port/scripts/lean-copy.mjs status`, `… get <folder>`).

## What is drawn — each state reached by real presses, then the note raised as the app raises it

No door raises the note yet (steps K4–K6), so after reaching the state the script raises it through the app's own
code in the page — the built bundle's `guardSay` for the pick's door (how to reach it from a script: as the n198
drawer did, or by a small probe the script injects; never by editing `src`) — so the note's look and place are the
app's own. For the "recommended" picture the same note is raised with the recommended words in place of the lead
(the words only; its place and look unchanged).

**Question 19 — a Tracker window hidden behind the Flow chart tab (a phone, 402×874).** Saber: ☰ → Tracker → Info →
"+ Set lull period" → tap a day, do not save → the Flow chart tab → ☰ → the Schedules list → 149.
- as built: "Blocked: close the open window on the Tracker, then pick 149."
- recommended: "Blocked: close the open window on the Tracker’s Info tab, then pick 149."
Pictures: the phone with the Flow chart showing and the note at the foot, once with each wording; and one small
picture of the Info tab with the lull pop-up up, so he sees what "the open window" is.

**Question 20 — a row or a form on the Admin section that is not showing (a desktop, 1536×864).** Saber, Admin.
- (a) Squadrons: "+ New squadron" with a number typed, then the Users section shown, then 149 picked — as built
  "Blocked: save or cancel the new squadron, then pick 149."; recommended "Blocked: save or cancel the new squadron
  on Squadrons, then pick 149."
- (b) Squadrons: a squadron's row opened and its place changed, then Users shown, then 149 picked — as built
  "Blocked: save or cancel the open row, then pick 149."; recommended "Blocked: save or cancel the open row on
  Squadrons, then pick 149."
- (c) Users: "+ Add a person" with a callsign typed, then the Squadrons section shown, then 149 picked — as built
  "Blocked: add or cancel the new person, then pick 149."; recommended "Blocked: add or cancel the new person on
  Users, then pick 149."
- (d) Users: "Give access" opened and its Role changed, then Squadrons shown, then 149 picked — as built "Blocked:
  finish or cancel giving access, then pick 149."; recommended "Blocked: finish or cancel giving access on Users,
  then pick 149."
- for comparison, his ruled twin, as the app says it today: a man's row changed on Users, then Squadrons shown —
  "Blocked: save or cancel the open row on Users, then pick 149." (D2627 A6).
Pictures: for (a) and (c) the desktop with the other section showing and the note under the squadron picker, once
with each wording; (b), (d) and the ruled twin as the note's crop alone. If a state cannot be reached as written
(the section tabs, a greyed control), say what you found and draw what the app does.

**Each picture:** the real app, three squadrons in the picker, cut to what the question is about (the note and the
control it stands under, enough of the page to see which section or tab shows) with the whole screen kept beside it
for a tap; the note ringed; at 2× so it stays sharp on his iPhone; nothing internal in any caption.

## Where things go

- Scripts: `raptor-port/scripts/handpass/n204/` (one library, one script a question).
- Pictures: `raptor-port/docs/mock/2026-11-26-msq-questions/q19-20/` (whole screens and crops, named
  `q19-…`, `q20a-…`).
- **Draft cards for the questions page**, one for 19 and one for 20, in your report: for each — one line saying
  when this happens in real life (who is doing what, how often), what he sees today (the plain words), the
  recommended words and why in one plain sentence, the other answer (keep the plain words), and which pictures go
  with it. Plain words only: no row ids, no file names, no ruling numbers.

## Running it

A build and a preview are needed: **take the checks lock first** (`node raptor-port/scripts/gatelock.mjs status`;
free → `take "claude/msq-s1-guard-6ae5e1 — drawings for questions 19 and 20"`; held by another chat → wait for it by
checking every few minutes for up to 40 minutes, never build alongside, and if it is still held then stop and report
NOT RUN). Then `npm run build` in `raptor-port/` and `npx vite preview --port 4741` (this section's port — check it
is free first; stop the server by its PORT when you finish, never by a command-line pattern), and release the lock
the moment the last picture is taken. Use the repo's own browser fallback for Playwright (copy it from
`playwright.config.ts`). **Look at every picture you made** (open each with the Read tool) and say what you saw; a
picture that shows a console error, a cut-off note or the wrong section is redrawn, not sent.

Do not commit, do not push, do not edit `HANDOFF.md`, the plan or anything under `raptor-port/src`.

## Report → `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-q19-20-draw-report.md`

Each picture's path and what it shows; how the note was raised; anything a state did differently from this brief;
the two draft cards; what you could not draw and why. End your reply with the report's path and one line a
question on whether its pictures are ready.
