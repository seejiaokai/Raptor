# Walker w3 — round 4: ALL AVAIL and the post-in date (his D2328), 22 Nov 26, chat 141

Brief: `docs/superpowers/briefs/2026-11-22-allavail-sans-posted-walk-d2328-brief.md` (R4-1 to R4-6). Build: `raptor-port/dist`
as found (not rebuilt), served by `npx vite preview --port 4392 --strictPort`; the server was stopped by its port at the end.
Clock installed before the app loaded at Wed 15 Jul 26 09:00 and left running (the app's today logged at each scenario's
start: "Wed Jul 15 2026 09:00"). Each scenario in a fresh browser context; desktop Chromium 1536×864, iPhone WebKit 402×874
(touch, scale 3, real taps, a picture within ~100 ms of each tap in `w3/taps/`). Signed in as `ad`/`a`. Everything made
through the app's own controls; `window.*` only read, to read back each set-up step.

Scripts: `scripts/handpass/asp-w3.mjs` (R4-1 to R4-5, on the first walk's `asp-w2-lib.mjs` helpers); R4-6 is the first
walk's own `scripts/handpass/asp-w2.mjs` run unchanged with `ONLY=s13d`. Both with
`W2_URL=http://localhost:4392/ W2_OUT=docs/img/handpass/2026-11-22-allavail-sans-posted/w3`.
Runs: `ONLY=r41d` (one run), `ONLY=r41p,r44d,r45d` (one run), `ONLY=s13d node scripts/handpass/asp-w2.mjs` (one run) —
each the only run of its scenarios; no earlier attempts. Pictures: `docs/img/handpass/2026-11-22-allavail-sans-posted/w3/`
(82, plus 56 tap pictures), results `w3/results-*.json`.

"In the crowd" is read as membership — the man's own puck in the ALL AVAIL window (`.availwin .rpuck[data-awp=<id>]`) —
beside the count chip, each with "+ SANS" off, then on, then off again on the Leave War, the board reopened on the day and
the chip pressed each time (the library's `bothWays`). I opened the deciding picture of every scenario myself (listed
below).

**Counts:** 6 scenarios, 8 scenario-size runs. Every EXPECTED line PASS; 0 FAIL; counts RECORDED; 0 NOT WALKED. No console
error, page error or failed request in any run.

## Results

Picture names drop the `-desktop.png` / `-phone.png` ending where both exist.

### R4-1 — Quokka (SANS, post-in Fri 17 Jul) named on Thu 16 Jul — desktop and phone

| What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|
| Admin → Users: New person Quokka, WSO, CAT C, Post in → the app's calendar → 17, Add person | "Quokka added to the roster — set flight and quals on the Quals page"; Post in "Fri 17 Jul 26"; read back: a new person, seat RCP | PASS (set-up) | r41-r41-01-newperson-form, r41-r41-01-newperson-added |
| Quals: WSOs → ✎ Edit → his SANS cell | read back: SANS, from 15 Jul | PASS (set-up) | r41-r41-02-quals |
| Thu 16 board: Quokka in the crew list? | offered (1 copy) | note | r41-03-thu-crew |
| Thu 16: Ground Programme BRIEF 08:00–09:00 naming Quokka; Common Programme SQN EVENT 10:00–17:00 ALL AVAIL | read back: both rows as typed, Quokka on BRIEF, ALL AVAIL on the event | PASS (set-up) | r41-04-thu-fixture |
| the event's count chip, "+ SANS" off / on / off | chip "21", window "Who's available 21" (pilots 14, WSOs 7), **Quokka NOT in**, 0 pending — the same three ways, both sizes | **PASS ×3, both sizes** | r41-r41-05-{off,on,off2}-win |
| the count | 21 / 21 / 21 (desktop and phone). The first walk on the build before this change counted 22 with Quokka in (w2, S3-5) | RECORDED | |

### R4-2 — the same Quokka on Sat 18 Jul (after his post-in) — desktop and phone

| What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|
| Sat 18 board: Quokka in the crew list? | offered (1 copy) | note | r41-r42-01-sat-crew |
| Sat 18: BRIEF 08:00–09:00 naming Quokka; SQN EVENT 10:00–17:00 ALL AVAIL | read back: both rows made | PASS (set-up) | r41-r42-02-sat-fixture |
| the count chip ×3 | chip "46", window 46 (pilots 28, WSOs 18), **Quokka IN** with the purple SANS line, 0 pending — the same three ways, both sizes | **PASS ×3, both sizes** | r41-r42-03-{off,on,off2}-win |
| the count | 46 / 46 / 46 | RECORDED | |

### R4-3 — the same Quokka, Tue 14 Jul, event only, not named — desktop

| What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|
| Tue 14: SQN EVENT 10:00–17:00 ALL AVAIL | read back: made | PASS (set-up) | r41-r43-01-tue-fixture |
| the count chip ×3 | chip "23", window 23 (pilots 17, WSOs 6), **Quokka NOT in**, 0 pending, same each way | **PASS ×3** | r41-r43-02-{off,on,off2}-win-desktop |
| the count | 23 / 23 / 23 | RECORDED | |

### R4-4 — Kiwi (not SANS, post-in Fri 17 Jul), fresh world — desktop

| What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|
| New person Kiwi (callsign free), WSO, CAT C, Post in 17 Jul, Add person; not SANS (read) | "Kiwi added to the roster — …"; Post in "Fri 17 Jul 26" | PASS (set-up) | r44-r44-01-newperson-form, r44-r44-01-newperson-added |
| Thu 16: SQN EVENT 10:00–17:00 ALL AVAIL; count chip ×3 | chip "21", window 21, **Kiwi NOT in**, same each way | **PASS ×3** | r44-r44-thu-01-fixture, r44-r44-thu-02-{off,on,off2}-win-desktop |
| Sat 18: SQN EVENT 10:00–17:00 ALL AVAIL; count chip ×3 | chip "46", window 46, **Kiwi IN** (no purple line), same each way | **PASS ×3** | r44-r44-sat-01-fixture, r44-r44-sat-02-{off,on,off2}-win-desktop |
| the counts | Thu 21 / 21 / 21; Sat 46 / 46 / 46 | RECORDED | |

### R4-5 — the first walk's S1 again, fresh world — desktop

| What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|
| Hex's 15 Jul cell → ⋯ → Post out → SANS → Post out | "On 15 Jul: becomes SANS."; read back SANS from 15 Jul | PASS (set-up) | r45-r45-01-postout-open, r45-r45-01-postout-sheet |
| Sat 18: BRIEF 08:00–09:00 naming Hex, SQN EVENT 10:00–17:00 ALL AVAIL | read back: both rows | PASS (set-up) | r45-r45-02-fixture |
| the count before Publish | chip "45", window 45, Hex IN with the purple SANS line | PASS (45, as the first walk) | r45-r45-03-win |
| four sign-offs, Publish day | "SIGNED ORIG · CUR CK Ace · SKED CK Anvil · PLANNED Basher · APPROVED Bolt", 0 pending | PASS | r45-r45-04-published |
| Leave War: Hex's Sat 18 Jul cell | "FO*" | PASS | r45-r45-05-lw-cell |
| "+ SANS" on, off, on, off (⚙ Settings), each time Saturday on the board and Hex's cell | each time: 0 pending, not "Not yet signed", the SIGNED ORIG line unchanged, the cell "FO*"; the SANS group shown on the war when on, gone when off | **PASS ×4** | r45-r45-{6,7,8,9}-settings-{on,off}, r45-r45-{6..9}-board, r45-r45-{6..9}-lw-cell |
| the count once more after the switches | chip "45", window 45, Hex IN | PASS | r45-r45-10-win |

### R4-6 — the first walk's S13 again (w2's `s13`, unchanged), fresh world — desktop

| What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|
| Hex posted out SANS from Mon 13 Jul | "On 13 Jul: becomes SANS." | PASS (set-up) | s13-s13-01-postout-sheet-desktop |
| Tue 14: BRIEF 11:00–11:30 Hex, SQN EVENT 12:00–14:00 ALL AVAIL; window before Publish | chip "35", Hex IN (amber "Misses VL BFM debrief 10:05–12:05: SQN EVENT 12:00–14:00") | PASS | s13-02-tue-win-desktop |
| Tue signed, Publish day | SIGNED ORIG, 0 pending | PASS | s13-03-tue-published-desktop |
| Thu 16: same two items, not published | chip "33", Hex IN | PASS | s13-04-thu-win-desktop |
| Admin → Users → Hex → Archive | "Hex archived — his sign-in is suspended" | PASS | s13-s13-05-acc-open-desktop, s13-s13-05-archived-desktop |
| Tue's crowd after the archive ×3 | chip "35", window 35, **Hex IN**, the board "1 pending" | **PASS ×3** | s13-s13-06-tue-{off,on,off2}-win-desktop |
| Thu's crowd after the archive ×3 | chip "32", window 32, Hex NOT in, 0 pending | **PASS ×3** | s13-s13-07-thu-{off,on,off2}-win-desktop |
| Tue's "1 pending" list | "Waiting to go out as AL1 · 1 change · Hex · posted out — Saber 15/7 09:01 — no → yes" — no line about the event's crowd or OIL | RECORDED; the "no crowd/OIL line" check PASS | s13-08-tue-pending-desktop |
| counts vs w2 | Tue 35 (w2 35); Thu 33 → 32 (w2 33 → 32) — identical | RECORDED | |

## Recorded

- R4-1 Thu 16 Jul: 21 each way, desktop and phone (the build before the change: 22 with Quokka in, w2 S3-5). R4-2 Sat 18
  Jul: 46 each way, both sizes. R4-3 Tue 14 Jul: 23. R4-4 Thu 21, Sat 46. R4-5: 45 before and after Publish and the
  switches. R4-6: Tue 35; Thu 33 → 32.
- Quokka (and Kiwi) is offered in the board's crew list on Thu 16 Jul, before his post-in date, and can be named there —
  as the first walk saw (w2 S3-3). Only who is in the ALL AVAIL crowd changed; this round did not judge the crew list.

## The walk's own mistakes

- None that changed a result. Every set-up step read back as made on its first try.
- A known reader weakness carried from the first walk: the library's `pendingOf` read on Edit Schedule (not the board)
  reads 0 where the screen shows "1 pending" (w2 noted it). In R4-6's step s13-08 it printed `pend 0` while the list it
  opened says "1 change waiting"; the board read in s13-06 says 1 pending, and the picture agrees. R4-5 read pending on
  the board, where the reader is right, and each board picture shows the SIGNED ORIG line and no pending chip.
- My read-back of the new person's post-in date looked for a field on his record and found none named so (`record
  {"postIn":null}`); the date is checked from the Post in box's own words ("Fri 17 Jul 26") instead.

## Console / page errors

None in any run (every run's `errors` line PASS: no console error, page error, 4xx or failed request).
