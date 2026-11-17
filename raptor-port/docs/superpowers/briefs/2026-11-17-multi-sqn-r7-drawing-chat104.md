# Round 7's last three pictures — the drawing brief (chat 104, 17 Nov 26)

One helper draws three pictures on the REAL running app for round 7's page. Read
`2026-11-17-multi-sqn-r7-drawing.md` (beside this file) §"Read first" and §"Rules for every picture" and follow them
whole, with the three changes below. The words below are the spec, letter for letter; if the app makes a word
impossible or wrong-looking, draw what is written and report it, never invent another.

## What is different from chat 102's brief

1. **The app is NOT served.** Build and serve it yourself, from `C:\Users\User\projects\Raptor-msqn\raptor-port`:
   check the checks lock is free (`C:\Users\User\.raptor-gates-lock` must not exist — if it does, wait and check every
   few minutes, never build alongside), then build through the lock:
   `node scripts/gatelock.mjs exec "claude/multi-sqn-design-r4 — mock-up build" -- npm run build`,
   then serve with `npx vite preview --port 4181 --strictPort` in the background (check 4181 is free first; if not,
   pick a free one and pass `MQ_URL`). No test suite, no other build. Stop the server when you finish.
2. **Mark colours:** everything on these three pictures is already ruled, so every mark is BLUE (`#0e7fa6`). On
   round 7's page the blue tags are hidden (chat 103's change: blue outline kept, tag `display:none`); do the same.
3. **His standing correction (D2185):** never write an action as if it were a person on any drawn line ("Close
   would…"); a button is named only as the button reads.

## The three pictures

Group F; script `raptor-port/docs/mock/2026-11-17-multi-sqn-r7/draw-r7f.mjs` (copy helpers whole from `draw-r7b.mjs`
and `draw-r7d.mjs`). Two sizes each, as always.

**F1 — a 142 man filing his DET onto 149's detachment** (`R7F1-*-proposed.png`). 142's Inputs page, the new-input
window as in `draw-r7b.mjs` picB1, but for Saber (142's man; re-letter a demo person): PERSON "Saber"; TYPE "DET";
DETACHMENT open as a list, showing two choices — "Exercise North · 249 · 13–31 Jul" with the small grey "149" badge
after it (the app's other-squadron badge, as on round 7's pictures C1–C6), picked; and "Red Sands · 242 · 3–14 Aug",
no badge (142's own). TITLE "Exercise North"; FROM "13 Jul", TO "31 Jul". No "On 142's schedule in these dates" box
(he has nothing planned then). Blue ring on the DETACHMENT list.

**F2 — Saber on 249's crew list** (`R7F2-*-proposed.png`). 249's Edit Schedule (Exercise North's schedule), Wed 15 Jul,
its crew list: the six (Hawk, Spur, Talc, Vane, Crisp, Moss) and Saber with the small grey "142" badge after his name,
in the list as one of the detachment's people (not in the foot group of the other squadron's free people — he is
here by DET). Blue ring on Saber's row.

**F3 — Admin → Squadrons with the time-zone picker** (replaces `R7D5a-*-proposed.png`, same file names; redraw from
`draw-r7d.mjs`'s D5a, changing only this): the box "HOURS FROM HOME" with "+7" becomes "TIME ZONE", a select reading
"Dhaka · GMT+6"; and 142's and 149's rows each gain a line "Perth · GMT+8" in their grey sub-line ("Home base · 61
people · Perth · GMT+8"; "Northern base · 48 people · Perth · GMT+8"). Blue ring on the TIME ZONE box. (His own example
was home GMT+8, a detachment GMT+6; the city names are made up for the demo.)

## Report

Each picture's file names, one line on what it shows, anything you touched that this brief did not name, and confirm
the server is stopped and the lock released. Look at every picture yourself, cropped to the marked part, before you
report. Do not commit; the host commits.
