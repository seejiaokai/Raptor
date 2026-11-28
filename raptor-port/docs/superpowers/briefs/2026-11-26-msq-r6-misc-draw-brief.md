# Round 6 — D2's phone fade, D8's "It's him" path, D12's person lists (an Opus drawer; chat 188, 26 Nov 26)

You draw; you build nothing in the app. The owner is not technical and reads on his iPhone. His ask today: update the
round-5 mock-up with every change so far, and **show what is new in a different colour**.

## Where and how (read first)
- Folder `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135` (use `git -C`; do not switch, commit
  or push). A Fable drawer works in the same folders at the same time on Admin → Users — touch only files you create:
  pictures starting `m6-`, scripts `draw-r6-misc*.mjs` and `words-r6-misc.mjs`.
- The served app: `http://localhost:4700/`. First check it serves THIS folder's `raptor-port/dist` (compare a script
  file name in the page's HTML with `raptor-port/dist/assets/`); if not, serve it on a free port 4701–4719
  (`npx vite preview --port N --strictPort`, from `raptor-port/` by its full path, in the background); never rebuild,
  never stop another chat's server. Say which you used.
- How the drawings are made: `raptor-port/scripts/handpass/n176/` — `world.mjs`, `draw-lib.mjs`, `draw-r5b-lib.mjs`,
  `draw-r5b-form.mjs`, `draw-r5b-e1.mjs`, `draw-e2.mjs`, `draw-e6.mjs`, `draw-e10.mjs`, `draw-e11.mjs`, `words.mjs`; the
  world and how it was made: `raptor-port/docs/superpowers/briefs/2026-11-25-msq-q3-draw-report.md` and
  `…-q3-redraw-brief.md`. A drawing adds only the new thing on top of the real app, in the app's own parts and sizes,
  **measured from the app, never guessed** — his D1 correction today: "the cancel button is different in size and
  doesnt seemed to be aligned": a pair of buttons is the app's own pair, same height, one line.
- Output `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/`: each whole picture plus its `-crop`, desktop 1536
  wide, phone 402×874, deviceScaleFactor 2. Every new word in `words-r6-misc.mjs`.
- **Mark what is new since round 5** on every picture: a violet dashed ring, 2px, colour `#8B5CF6`, 4px clear of the
  part — nothing else violet (pink rings in older pictures mean "look here"; do not reuse pink).
- Read the full rows first (the shell: `grep -h '^| D2642 |' .claude/decisions-full/*.md`): D2642, D2620, D2628,
  D2384, D2632, D2633, D2634, D2643, D2387 if present; the round-5 page `…/q3/page.html`, sections D2, D8, D12.

## 1. D2 on a phone — the fade waits until the ☰ menu has closed (his D2642)
A fresh phone film (stills at about 12 a second, as round 5's D2 films are made — find them in `drawn/` and the D2
section): Saber on 142 opens ☰, picks 150 in the menu's list (the menu stays open after a pick, D2384), closes the
menu; only then the number dims and comes back twice. A second film with "less motion" on (white, then grey). Name the
stills `m6-p-fade-NN.png` and `m6-p-fade-lm-NN.png`, plus a poster still of each; a short `-film.webm` or `.mp4` too if
round 5's films were made that way. The desktop is unchanged: no new desktop film.

## 2. D8 — "It's him", end to end (his "u can draw this in the new chat"; D2632, D2633, D2643)
The archived Jester on 142 is the man joining 149. Draw:
a. `m6-d-itshim`: Kestrel on 149 types "Jester" in "+ Add a person"; the note under the callsign box (as round 5's
   `e6a-d-archived-r`) now with two answers: "It's him" and "Someone new" — the app's own button pair, measured.
b. `m6-d-itshim-asked`: after "It's him": the form closes or stays as you judge right, with one line saying 142's
   admins have been asked; nothing added to 149.
c. `m6-d-itshim-bell` (+`-p`): the line on 142's admin's bell (Hunter): Kestrel asks to restore Jester and post him to
   149; and what a tap opens: Jester's archived row on 142 with "Restore and post to 149".
d. `m6-d-itshim-sheet`: that press opens the Leave War's own posting sheet (Transfer to Sqn → 149, a date) — drawn
   from the app's real sheet.
The end — Jester in 142's Outgoing and 149's Incoming — is drawn by the Fable drawer for another man; do not draw it.
Also check round 5's D8 redraws (`e6a-*-r`, `e6a2-*`, `e6b-d`, `e6b2-d`, `e6d-d-taken-r`) use the app's own
Save · Cancel pair, measured (28px?); redraw any that do not, under `m6-` names, and say which.

## 3. D12 — his correction: "D12 i dont remember my drop down of personnel design is so ugly"
Round 5 drew a plain browser list open for PLANNED BY (`e11-d-plannedby`) and for "+ Input"'s Person box (`e10-d-*`).
First find out, on the app, what it really draws today for both lists (open them; picture `m6-d-today-plannedby`,
`m6-d-today-person`), and whether the app has its own person picker elsewhere (Edit Schedule's, the Leave War's).
Then redraw D12 from the app's own drop-down: `m6-d-plannedby`, `m6-d-person` (+ `-p` twins): empty first, then 149's
own men, then the names from another squadron with their number ("Hunter · 142"), and the closed box after choosing
Hunter. If today's list really is the plain browser one, draw it beside a recommended design made of the app's own
picker, and say which is which.

## Report
Write the whole report to `raptor-port/docs/superpowers/briefs/2026-11-26-msq-r6-misc-draw-report.md` (create it), then
reply with a short summary. In it: each picture's names and what is on it; what is new (the violet rings); what the app
draws today for the two lists (with the pictures that show it); every new word in one list (it goes to a fresh Fable
before he sees it — D2441); a `FACT` line per picture; any departure and why; anything you could not draw. Open each
picture you made before reporting it.
