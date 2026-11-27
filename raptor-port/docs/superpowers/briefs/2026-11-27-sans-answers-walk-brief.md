# Walk brief — his answers to the SANS warning-lines questions (chat 208, 27 Nov 26)

Two Opus walkers, A and B, each in its own world, on ONE frozen build. The host (chat 208) opens every deciding picture
and reproduces every finding before it enters the evidence sheet (`docs/handpass/2026-11-27-sans-answers.md`).

## What changed (the rulings — `.claude/decisions-full/scheduler.md`, D2753–D2759)

- **D2753** the short note after a plant reads the CREW LIST's reason ("Bolt — SANS — offered Fly only, not AMT",
  "Marlin — SANS — no availability filed for today", "Ranger — SANS from Fri 17 Jul: no availability filed"), whether or
  not his warning line was hidden. The warning list keeps its longer line.
- **D2754** a SANS warning line naming a sim: "Planned on OFT EP-9 10:00–11:00" / "AMT BOX 13:00–14:00"; start only →
  "09:00–10:30 (end assumed)" (the sim is taken as 90 minutes); no start → "(no times yet)"; no name → "this OFT row".
  Flying lines unchanged.
- **D2755** the SANS calendar's "+ Commitment" ticks read Fly · OFT · AMT; refusal "Tick at least one of Fly / OFT / AMT".
- **D2756** kept: one SANS line a flight; leave line and SANS line both.
- **D2757** the amber "A" hover: "Advisory — on shift and also down for a ground event or programme item; or SANS
  availability not filed, or planned outside it" (the puck's hover, the chip's, the Logic page's flag row). The week's
  Legend keeps "advisory — shift, ground or SANS availability".
- **D2758** kept: seat picked → AM / PM under the letter for every SANS man; nothing picked → "F · AM".
- **D2759** a morning / afternoon filing → "SANS — available AM only" / "PM only" in his struck reason, the drag hint and
  the note; typed hours stay hours; **the warning list's longer line keeps clock times** ("SANS: available 12:01–23:59
  only. Planned on …" — not ruled; record it, it goes to him as a question).

## The build, the tools, where things go

- Frozen build: `D:/raptor-work/c208-build` (its index page loads `index-CjChD3bM.js` — prove the served bundle is this
  one before any run). Serve it from inside the test browser (`docs/walk-scripts.md` §1, §8) or on a free port — walker
  A port 4961, B 4962 if a server is used; check the port is free first.
- Read `docs/walk-scripts.md` before writing a script. Reuse chat 207's walk helpers — `scripts/handpass/swl-w1A-lib.mjs`
  (the day's list reader, `dayList`, the demo's people: BOLT `yeti`, MARLIN `cards`, OTTER `wrangler`, PIXEL `badger`, ACE
  `dj`, Ranger `bane`, Jester `ipman`, Kraken `krait`), `swl-w1B-lib.mjs`, `scc-w1B-lib.mjs` — imported, never edited;
  their settings files set the folders with `||=`, so set yours first. Prove each borrowed helper's first step on this
  build before building on it.
- Your scripts: `scripts/handpass/sa208-wA*.mjs` / `sa208-wB*.mjs` (new names — prove each free first). Pictures:
  `docs/img/handpass/2026-11-27-sans-answers/A/` / `B/` in `C:/Users/User/projects/Raptor-sans/raptor-port`. Raw logs:
  `D:/raptor-work/c208/A/`, `B/`. Your report: `D:/raptor-work/c208/A-report.md` / `B-report.md` — write it with the Write
  tool as you go (a file, so nothing is lost), and return it as your final message.
- Sizes: desktop 1536 wide (Chromium) and phone 402 × 874 (WebKit), every scenario at both unless it says one. A picture
  right after each tap as well as the settled one on a phone; the note after a plant is pictured on its first frame (it
  fades). Watch the console, page errors and failed requests on every run.
- Every set-up through the app's own controls — never by writing data in the page. Reading `window.*` to check what the
  screen shows is fine; changing it is not.
- The checks lock is held by the host for this walk: run only your own scripts, nothing that rebuilds `dist`, no unit
  suite. Commit nothing; the host commits.
- Not a finding: a problem that lives only in data already stored (D56 — a line hidden under its old words showing again
  is that); anything about a scheduler who is not an admin (D785).

## Who walks what — the two designers' lists combined

Scenario lists: Fable `docs/superpowers/briefs/2026-11-27-sans-answers-scenarios-fable.md` (F1–F40), Astra
`…-scenarios-astra.md` (S1–S17). Walk each one named below to its EXPECTED line, corrected here where the host checked it.

**Walker A — the note after a plant, the crew list's words, AM / PM, the column, the plain-user round:**
F1–F13 with S3, S4, S5, S6, S7 (every way of planting: armed-seat tap, crew-list drag, seat-to-seat, swap, onto an
input's row, after the OIL question, another day, two warnings at once, untimed seats, standby lines, Undo / Redo, a man
whose SANS posting starts later); F29, F32–F37 with S12, S13, S14 (AM / PM as filed, the half-day edges, typed hours, a
span filing, the crew column free and struck, letters aligned); the plain-user rounds F38 (desktop), F39 (phone) and S1.

**Walker B — the warning list's sim words, hiding, kept-as-built, the ticks, the amber A:**
F14–F22 with S8, S9, S10, S11, S16 (the sim's name in every reason family, the state table of one row — start, end,
none, no name, start only, end only, odd names, extra places, OFT and AMT apart when hidden, every place the line is
read: the day's list, the Board's panel, View-only Sched, a published day before and after republishing, a reload,
print); F27, F28, S15 (two flights, leave and SANS); F23–F26 with S2 (the ticks in every door to the form, each tick
saving what it says, the phone form); F30, F31, F40, S17 (the A's words on every copy of a puck, the chip, the Logic
page, the Legend unchanged, a member's view, standby and ground rows raising nothing).

**The host's corrections to the EXPECTED lines:**
- The sim length is 90 minutes (the app's setting): start 10:00 with no end reads "10:00–11:30 (end assumed)".
- A row with an end but no start (F15f, S9): the sim has no start, so the line reads "(no times yet)" — RECORD the exact
  words and picture it; it may go to him.
- An AMT row renamed BRIEF or DEBRIEF (S10): that row becomes the AMT block's brief / debrief row, not a sim seat — RECORD
  whether the men in it still raise a SANS line, with pictures; it is an open question for him (chat 207's Astra F2).
- A hidden line whose words change (typing a sim's end, renaming its row) may show again: hiding keys on the line's
  exact words (D469). RECORD it; it is not a finding.
- Publishing: a published day's warnings are frozen until it is republished (D179) — a line published before this build
  keeps its old words there; after a republish, the new ones.
- Two warnings at once (F10): the more serious line leads the note, then "(+1 more)"; the SANS words appear in the note
  only when the SANS line leads.
- Seed filings F names (Nick, Waldo, Bullet, Romeo) are its guesses — read the SANS calendar first and use what is
  there; where a man it names is not SANS or has nothing filed, file what the scenario needs through the form.

## Lessons (`docs/bug-check-order.md` §7.11) — each walker checks its scenarios against the whole list and says, in its
report, which scenario covers each lesson that applies, or why it cannot.

## The report

For every scenario: PASS / FAIL / RECORDED, the words read off the screen, and the picture names that show it. Then a
FINDINGS list — each with the steps, what the screen showed, what it should show by the ruling, and its pictures — and a
QUESTIONS list for anything no ruling settles. The plain-user round's pictures named one by one.
