# Round 2 of the consistency look — evidence sheet (21 Oct 26, `claude/consistency-round2`, pull request 563)

[UI-CONSISTENCY-LOOK] (D1124) — his answers to round 2, "1 yes, 2 yes, 3 yes, 4 yes": D1129 (Quals' Edit quals plain),
D1130 (the Scheduler Board's own Undo / Redo / History / sync to 1599), D1131 (the board's highlighter mark on a desktop),
D1132 (the Tracker's line icons and joined phone tabs). The questions page: https://claude.ai/artifact/5VUi1FHQTvcHPBdxZvXWMU.
Pictures: `docs/img/handpass/2026-10-21-consistency-round2/` — the round's questions at the top, `walk/` the walk.
Scripts: `scripts/handpass/cr2-look.mjs` (the questions' pictures), `scripts/handpass/cr2-walk.mjs` (the walk, as assertions).

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL) | NO — nothing earns, counts or shows OIL |
| 2 | The published record | NO — no publish, sign, amendment or issued face is drawn differently |
| 3 | Saved data | NO — styles, markup and icons; nothing stored, read or reset |
| 4 | A shared drawer | NO, with its reason: the board's bar and strip are drawn by `SchedBoard.tsx` alone; the Undo pair is the shared `UndoPair`, but only the board's ids (`#sbUndo`, `#sbRedo`) are styled — the top bar's rule is unchanged |
| 5 | A new gesture or mode | YES — a control removed on a desktop (the board's `#sbHl`), and four controls redrawn |
| 6 | A new surface | NO |
| 7 | Roles | NO — "Edit quals" stays an admin's; only its colour changes |
| 8 | The warning list | NO |

**Tier: WALK.** The code read: one fresh, blind Opus read (D790; no ChatGPT reader while they are out — D761's list).

## 2. The roll-call

**D1129 — "Edit quals".** One place draws it: Quals' row, admin, while editing.

| Place | Plain at rest | Plain when pressed | Done the one blue | Works |
|---|---|---|---|---|
| Quals, desktop 1536 | YES — walked (`walk/01`) | YES — walked (`02`) | YES — measured, Done's fill differs, Edit quals' equals Export's | YES — pressed on and off, Done ends editing |
| Quals, phone 402 by touch | YES — walked (`03`) | YES — walked (`04`) | YES — measured | YES — tapped |
| Quals as a member | must not — the button is admin-only (unchanged; `quals.test.tsx` "a member never sees it") | — | — | — |

**D1130 — the board's own bar.** Every control on the bar's right that has a word: Undo, Redo, History, sync; the bell, Insights
and ✓ Done have no compact form on the top bar either (unchanged); Templates and Sort all are the board's own (no top-bar twin).

| Width | Undo / Redo / History | Sync | Same as the top bar | One line | Works |
|---|---|---|---|---|---|
| 1366 | icon only, 34 wide, name on hover — walked | dot alone — walked | YES — measured on the same page | YES — every middle on one line | History opens / closes the changes window; sync toggles and back — walked |
| 1536 (his PC) | YES — walked (`07`) | YES | YES; the dot 31 × 21 on both bars | YES | YES (`06`) |
| 1599 (the band's last) | YES — walked (`08`) | YES | YES | YES | YES |
| 1600 (just past it) | words back — walked (`09`) | words back | YES | YES | YES |
| 1920 | words — walked (`10`) | words | YES | YES | YES |
| ≤820 (phone, and the desktop layout on a phone, D1109) | must not change — the rule is `min-width:821px`; the phone bar was not touched | must not | — | — | not walked: the CSS is outside the band (the phone's own rules unchanged) |

**D1131 — the highlighter mark, and the toggle removed on a desktop.** What the removed control gave, from its code: (a) a press
flipped `HLOPEN` — on a desktop the strip is always open, so nothing visible (seen before the build, `q5-board-open.png`); (b) it
lit (`.on`) while a filter or search was live and the strip folded — on a desktop the strip is never folded, and each lit chip
and CAT's count show the same thing (walked: `walk/12`); (c) a Tab stop — gone with it, nothing behind it. Nothing stood below
it. No event ran on it but its own click.

| Place | The mark | The toggle | The row works |
|---|---|---|---|
| Board, desktop 1366 | YES — leads CAT, same line, the week's grey (walked `11`) | hidden — walked | CAT opens, a chip lights and goes off — walked |
| Board, desktop 1536 | YES — walked (`13`) | hidden — walked | YES — walked (`12`) |
| Board, phone 402 | hidden — walked | shown, a tap opens and a second folds the row — walked (`14`) | YES |
| Board, the desktop layout on a phone (D1109) | hidden — the ≤820 rule (same as the phone) | shown — the ≤820 rule | as the phone; not walked separately (same width rules) |
| Edit Schedule / View-only Sched's week | must not change — their own `.hl-lab` / `.hl-tog` (untouched) | — | — |
| SANS "Highlight" | must not change — another job (D1131) | — | — |

**D1132 — the Tracker's marks.**

| Place | Icons | No typed mark left | Works |
|---|---|---|---|
| Bar, desktop 1536: course ✎, syllabus ✎, ⓘ, Show All, File, ^ | YES — each 15px, walked (`15`) | YES — walked | ⓘ on / off, File opens Import / Export, syllabus ✎ opens its menu, ^ hides and the strip brings it back — walked (`16`, `17`) |
| The hidden bar's strip (⌄) | YES — walked (`17`) | YES | YES |
| Phone tabs at 1050 (where they first show) | YES — walked (`18`) | YES | Info, Flow chart, Show All — walked (`19`) |
| Phone tabs at 402 by touch | YES — one bordered box, walked (`20`) | YES — no 🗺 | YES — tapped (`21`) |
| Bar, phone 402 | YES — walked (`22`) | YES | as the desktop |
| The Students card's ✎ / × / ⇅, the menus' items (✎ Rename…, ⇪ Import…, ⤓ Export…, ⧉ Duplicate…, 🗑 Delete…), "⇪ Import a file…" on the empty Tracker | must not, because D1132 named the bar's marks and the tabs — FOUND, filed as finding (16) of [UI-CONSISTENCY-LOOK], for him in round 3 | — | — |
| The gear ⚙ | must not — it IS the app's own cog (D635; the Inputs and SANS gears are the same character) | — | — |
| The standalone Tracker | YES — the icons are the Tracker's own file (`components/Glyphs.jsx`), no import from the app | — | not walked (no standalone build in this job) |

No MISSING.

## 3. The five sizing lines (§7.0, `walk-ledger.md`)

1. **Type:** E (look: styles and markup on four surfaces), C (a control removed on a desktop).
2. **What only a walk could find here:** a stylesheet rule beating the new one at some width; the bar breaking onto two lines;
   a removed control taking something with it; a redrawn button that no longer presses; the band's edges (1599 / 1600).
3. **What the ledger says:** type E walks of one shared rule found a fault about one time in three, mostly a size or a line
   break at an untried width; C walks find order faults — here there is no new state, only a removal.
4. **The walk chosen:** the host alone, one scripted walk of the built bundle written as assertions (`cr2-walk.mjs`): Quals at
   1536 and 402 by touch; the board's bar at 1366, 1536, 1599, 1600, 1920 against the top bar on the same page; the mark at 1366,
   1536 and 402; the Tracker at 1536, 1050 and 402 by touch — every changed control pressed. 100 checks, 22 pictures, the key
   ones opened. Carried by tests: the class names (`quals.test.tsx` D1129, `boardnav.test.tsx` D1131, `tracker.test.tsx` D1132)
   — each claims the markup only; every width and press was walked.
5. **After the walk:** the ledger row is added (`walk-ledger.md`, 21 Oct 26, this job).

## 4. The walk

`scripts/handpass/cr2-walk.mjs` on the built bundle (`npm run build`, `vite preview` on 4181), clock set to Mon 13 Jul 26 and
left running. **First run 97/100:** the three failures were the script's own measure — the bar's buttons' TOPS differed by 5,
because the sync dot (21 tall) is shorter than the buttons (29–30) and centres beside them; the top bar's dot is the same
31 × 21 (measured on the same page), so it is the app's look, not a fault. The check was rewritten to the buttons' middles.
**Second run 100/100.** No page error, console error or failed request.

**Walk:** 100/100 PASS, 22 pictures (`walk/`), the bar at five desktop widths, the mark and the Tracker at desktop and phone,
every changed control pressed; no fault found by the walk; one finding filed (the Tracker's other typed marks).

## 5. The code read

(to be filled when the fresh, blind Opus read returns)

## 6. The gates

GitHub's run of pull request 563 (D1086 — the repo is public): (to be filled). On his PC: `quals.test.tsx`, `boardnav.test.tsx`,
`tracker.test.tsx` — 194 + 41 green; `npm run build` green; `npm run docsize` OK.

## 7. Not proved here

- Safari on his iPhone: the icons' look in Apple's font beside the words, and that no mark is drawn as an emoji — the walk ran
  in Chromium. His look.
- The standalone Tracker build — not built in this job; the icons are its own file.
