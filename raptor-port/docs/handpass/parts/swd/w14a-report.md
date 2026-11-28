# w14a report — what counts as planned (C1–C11), chat 174, 25 Nov 26

Walker: a fresh Opus. Build `index--V1bS7d_.js` (dist as it stood, `f3f0e7388` + `e80742fc5`), served on 4811, not rebuilt;
server stopped by its port at the end. Clock Wed 15 Jul 26 09:00, running. Each case in a fresh browser context, desktop
Chromium 1536×864 and iPhone WebKit 402×874 (touch, scale 3, a picture right after each tap).

- Step table: `raptor-port/docs/handpass/parts/swd/w14a-walk.md` (the summary table per case, the finding-candidates, the
  lessons, then every step).
- Deciding pictures, cropped: `raptor-port/docs/img/handpass/2026-11-24-sans-words/w14a/` (233, named `<run>__<picture>`).
- Scripts: `raptor-port/scripts/handpass/swd-w14a.mjs`, `swd-w14a-lib.mjs`, `swd-w14a-env.mjs`, `swd-w14a-probe.mjs`,
  `swd-w14a-report.mjs`, `swd-w14a-pics.mjs`. Raw runs and logs: `D:/raptor-work/c174-walk/w14a/`.
- Recipes for w14b–d: `D:/raptor-work/c174-walk/recipes.md`.

## Counts

330 judged steps (desktop 176, phone 154): **PASS 162 · FAIL 0 · RECORDED 168 · NOT WALKED 0**. Besides them: 171 set-up steps
(each asserted as it landed; all landed) and 43 error watches (console errors, page errors, 4xx, failed requests): none.

## Faults

None. Five first-run FAILs were the script's own and were re-walked (each named in the sheet's "Runs cited"): arming his OWN
ground / all-hands row reads "already on … not added twice" (C1, C3); arming a second seat of a standby line he was already on
reads "already on …" (C11b, C11c — re-walked with the seat armed before he was placed); and three phone stops where the bell's
list, left open, covered the next control (C9 Quals, C8b, C8d).

## Probes proved (all found their door)

P0 bundle on the port = local build · P1 a cockpit seat on a day with no line (+ Wave → Flying wave; one aircraft per new line)
· P2 OFT / AMT boxes · P3 a duty desk row on Sat 18 (`[data-dradd="5.0"]` "+ Row") · P4 all hands on Fri 17 · P5 CX / Un-cancel
on a flying line (`data-lcx`) and a sim box (`data-srcx`) through `#cxPop` · P7 a seat on a line with no times (it arms, he can be
placed) · P8 SC (MAIN / SPARE by each aircraft's spare flag), AVALON, BB, and FLIES (`data-safly`) · P14 the day's warning list,
`#sbWarn` on the board.

## RECORDED finding-candidates (for the host to put to him)

1. **The warning list says nothing about a SANS man planned with nothing filed** — every seat and sim case (C4, C5, C6, C7, C11),
   both sizes. The reminder and the crew list agree everywhere; the warning list carries no SANS row at all until he has filed
   something the seat falls outside. D2564 says the reminder counts "the same the crew list greys and the warning reads". The code
   calls the silence deliberate (no warning on the demo's own SANS flyers).
2. **C7: a seat on a line with no times** puts the day in his reminder (D2568) but an armed no-times seat does not strike him
   (title "Ranger", no reason); timed, it does. A difference D2568 did not name.
3. **C5c: a Fly-only filing clears an OFT day** from the reminder. No ruling matches a filing's kind to the seat.
4. **C8c: Saber deleting Ranger's filing** lights the reminder (as D2560's words give; D2565 names only his own delete) and sends
   "SANS Availability · Sat 18 Jul · Deleted · Saber", unread.
5. **C8a (e): his own top-bar Undo of his delete** takes the relight back: "Sun 19 Jul", READ, bell dark. No ruling.
6. **C11: standby seats** — SC MAIN counts, SC SPARE does not, AVALON not flying does not, AVALON ticked FLIES does; reminder and
   armed seat agree each time (PASS); whether standby should count is NOT RULED.
7. **C9: today counts** in a 2b reminder (Hex's Wed 15 demo seat named first). C9: his own untick sends him nothing.
8. C1–C3: nothing in his bell about a ground row, desk or all hands (D2566 not built — not a finding).
9. A lead outside this part, to check, not filed: View-only Sched heads its first column "Monday Jul 13 · Today" with the clock at
   Wed 15 (raw picture `D:/raptor-work/c174-walk/w14a/run1/c4-c4-i-desktop.png`).

## Not walked / narrowed

Nothing NOT WALKED. Narrowed: C6b's cancelled OFT box had no armed read; C11 used AVALON, not BB; C9's ground row on Thu 23
(Hex's demo Wed 22 is a seat, read — the plan's Wed 22 would have tested nothing); the desktop hover read from the puck's title,
not by moving the mouse.
