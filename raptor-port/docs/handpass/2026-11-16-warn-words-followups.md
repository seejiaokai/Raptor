# Evidence sheet — `[WARN-WORDS-STANDALONE]`'s follow-ups, chat 86 (16 Nov 26)

One check for four changes on `claude/warn-words-followups` (pull request 784): D2073 (an SC-template duty desk with no
END left out of crew rest), D2074 ("Illegal seat"), D2077 (the Logic page says "conflict") and D2075/D2078 (the Legend's
new names, built from the approved picture). Laid down before the walk (the checklist's step 4).
Pictures: `docs/img/handpass/2026-11-16-warn-words-followups/`.

## The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money — OIL, who counts as present | NO — a desk's worked time and OIL read its assumed hour as before (D2073 changes crew rest only); "who counts as present" is not read from crew rest — to be confirmed in the walk (ALL AVAIL, the crew list) |
| 2 | The published record | NO new mechanism — a day published after the change carries the new words and the new crew-rest reading; a day published before keeps its frozen lines (D56) |
| 3 | Saved data | NO — nothing new is stored; D2073 reads the duty block's existing template mark |
| 4 | A shared drawer | YES — the warning lines are drawn by the issues list, the Board, the day-details window, the peek, the foot note; the Legend is drawn on two pages |
| 5 | A new gesture or mode | NO |
| 6 | A new surface | NO |
| 7 | Roles | NO |
| 8 | The warning list | YES — what the seat warning says, and how crew rest reads an SC desk |

**Tier: FULL** (YES to 8).

## The rulings that apply

| Ruling | What it says, in short | Pinned by | Walk |
|---|---|---|---|
| D2073 | An SC-template desk, START typed, END blank: left out of crew rest until END is typed; a plain desk keeps START + 1h (the builder's reading) | `engine/assumedlanding.test.ts` "D2073" (red seen; two controls) | |
| D2055 | An SC wave line with no END left out of crew rest — unchanged | `engine/assumedlanding.test.ts` "D2055" | |
| D2074 | "Illegal seat" everywhere: the lines, the check's short name; the Legend keeps "qual / illegal seat" | `engine/warnwords.test.ts`, `engine/validate.test.ts`, `engine/scspare-rules.test.ts`, `engine/sansavail.test.ts`, `ui/drag.test.tsx` (changed, red seen) | |
| D2071 | The rest of the approved words stand (narrowed by D2074 on the one label) | `engine/warnwords.test.ts` | |
| D2077, D2070 | The Logic page says "conflict", never "clash"; "SC MAIN conflicts" | `ui/logic.test.tsx` "D2077" (red seen) | |
| D2075, D2078 | The Legend: days in a row, qual / illegal seat, misses flight/sim brief, misses flight/sim debrief, long day; only the words change, both sizes keep their height | `ui/html.test.ts` "D2078" (red seen) and the four Legend tests changed with it | |
| D56 | Demo data is not a finding | — | |

## The roll-call — every place the four changes show

Columns: does it SHOW the change · is the gesture USABLE there · what else is PAINTED there. YES / NO-because / MISSING,
filled in the walk.

| Surface | SHOW | USABLE | PAINTED | Proved by |
|---|---|---|---|---|
| Edit Schedule's issues list — the seat line (desktop, phone) | YES — "Hex — Illegal seat: a WSO in the front seat of …" from every producer (AVALON, BB, SC SPARE, flight, OFT) | YES — tap, hide ✕ / Reset arrow | YES — dim when hidden, the SC-currency line beside it | w1 S7, S8 (`w1/s07/01`–`11`, `s08/06`); phone `s07-p`, `s08-p` |
| Scheduler Board's issues list — the seat line | YES — the same words | YES — hide, show, then the board's own Undo / Redo (host: desktop and phone alike) | YES — struck through when hidden, the Reset arrow, "Undid: flagging a warning again" | w1 S8 `s08/01`–`03`; host `w1/host-s08u/03-undo1.png`, `w1/host-s08u-p/` |
| The puck's Q chip — its hover / tap words | YES — on w1's build (before the Opus F1 fix) "Hex · C · ops wingman · Illegal seat"; now "Qual / illegal seat" (w2 R2, desktop and phone) | YES — hover, and a tap on the phone shows his line | YES — the red Q chip | w1 S8 log; `ui/html.test.ts`; re-walk w2 R2 |
| The foot-of-screen note after tapping the seat line | YES — the red band at the foot carries the line's own words ("Hex — Illegal seat: a WSO in the front seat of this line (T/O 09:00)") | YES — a tap on the chip or the line | YES — the line's crew lit | w2 R2, R5 (`w2/r2-p/04-b-chip-fast.png`) |
| The day-details window's warning rows | YES — "Warning · Illegal seat Hex — Illegal seat: …"; the SC desk's crew-rest line with END 23:00, none with END blank | YES — opened, closed by Done | YES | w1 S1, S8 `s08/07-day-details.png` |
| A day published after the change — 👁 its version, the seat line | YES — ORIG and AL1 keep "Illegal seat" | YES — publish, amend | YES — the SC-currency line with it | w1 S8 `s08/09`, `10`; S3 the 👁 looks |
| A member's view (View-only Sched) — the seat line | YES — both Illegal seat lines, no "Wrong seat" | YES (read) | YES | w1 S8 `s08/11-viewonly.png`; a member at phone width NOT WALKED |
| Edit Schedule's issues list — the crew-rest line for an SC desk with no END (absent), then END typed (present) | YES — none with END blank; "…duty ended 23:00 → clear 11:00 … needs 12h" with END 23:00; gone when cleared | YES — typing END | YES | w1 S1, S2, S4, S5 (`s01/07`, `s04/12`, `s05/07b`) |
| The next day's crew-rest mark ("Breaks …" row) after an SC desk | YES — "Breaks Monday Ranger — had to leave by 20:00. Crew rest: Sunday duty ended 23:00 …" only once END is typed | YES — the puck tap | YES | w1 S1 `s01/07-monday-strip-2300.png` |
| The crew list / ALL AVAIL on the next morning after an SC desk | YES — ALL AVAIL counts 46; its window says "no end time, an hour assumed" (D2073 changes crew rest only — RECORDED, as on `main`) | YES — opened, closed by its ✕ | YES | w1 S6 `s06/06`, `07` |
| Sunday's SC desk → Monday (the week's edge, the peek) | YES — no line cold or warm; the line at END 23:00; gone when cleared (desktop; the phone for Ranger) | YES | YES | w1 S1 `s01/03`, `s01-p` |
| The Logic page — Settings part ("SC MAIN conflicts") and Checks part ("Illegal seat", every "conflict") | YES — "clash" 0, "Wrong seat" 0, "conflict" 14, "Illegal seat" 2 (admin desktop, admin phone, member); a search for "clash" finds nothing; D2079's sentence word for word (w2 R4) | YES — six choices, a flip held over a reload, Reset to standard | YES | w1 S9 `s09-d-a/02`, `06`–`08`; re-walk w2 R4 |
| Edit Schedule's Legend fold (desktop, phone; folded and open) | YES — the seven new names; open height 65px on a desktop, 255px on the phone, each time | YES — folded and opened four times | MISSING at 402 wide (his iPhone 17 Pro): the parked AIRCREW tab covers the last letters of "misses sim debrief" — the drawing and its check were made at 390, where that name wraps to its own row; put to him (the last section) | w1 S10 `s10-d-a`, `s10-p-a/editsched-2-open.png` |
| View-only Sched's Legend fold (the same builder, its second home) | YES — the same words and heights, admin and member | YES | NO-because View-only Sched has no AIRCREW tab | w1 S10 `s10-d-a/viewsched-2-open.png`, `s10-p-u` |

## The five sizing lines (§7.0)

1. **Type:** A (one rule inside the crew-rest calculation — which desks bear rest, D2073) + F (words: D2074, D2077,
   D2078) + D in part (the one seat sentence drawn by the issues list, the Board, the chip, the day-details window, the
   foot note, the history; the Legend drawn on two pages).
2. **What only a walk could find:** the SC template's mark reaching a desk through each real writer (+ Block → SC
   Shift, a template with "For wave", a day template, + Alt Plan, a published day loaded back, Undo / Redo, a reload)
   and NOT through a name typed on a plain block; the crew-rest readers agreeing after each END change (the list, the
   forward trace, the picker); the seat words on every drawer after a real placement; the Legend's two homes at both
   sizes; the Logic page as drawn. The unit tests cover the calculation and the strings; the drawing check covered
   Edit Schedule's Legend (0 pixels different at both sizes — host, `docs/mock/2026-11-16-legend-words/drawcheck.mjs`).
3. **The ledger:** the last walk of this family ([WARN-WORDS-STANDALONE], 16 Nov 26) — FULL, two Sonnet walkers then a
   re-walk, 753 pictures; the walk found 3 faults, the blind reads 6 more; W3 cost about 289k and 22 min.
4. **The walk chosen:** ONE Sonnet walker, Astra's ten scenarios in her order (`docs/superpowers/briefs/
   2026-11-16-warn-words-followups-scenarios-astra.md`), about 75 minutes, on the frozen build of `7eade5b52`. Desktop
   1536 Chromium for all ten; the phone (402 × 874 WebKit, touch) for 1, 8, 9 and 10 and one row of 7. Carried by
   tests, not walked: the seat warning for a pilot record carrying CAT IW, which no control can make
   (`engine/validate.test.ts`, `engine/avalon-rules.test.ts` — the new words, calling the check directly); the
   Legend's drawing (the drawing check above). The host proved the opening route first:
   `scripts/handpass/wwf/wwf-host-probe.mjs` (desktop) — SC desk END blank: no crew-rest line; END 23:00: "Ranger —
   Crew rest: Saturday duty ended 23:00 → clear 11:00. Report 06:40: 7h40 rest, needs 12h."; END cleared: none.
5. **After the walk:** its row in `docs/walk-ledger.md`.

## The lessons of §7.11, each against a scenario or a test

| Lesson | Here |
|---|---|
| 1 state × reading | The SC desk's crew rest: no END / END typed / END cleared × working copy / published / amended — the walk's D2073 scenarios; the seat line: working copy / published 👁 / member's view |
| 3 after every press | each typed START / END and each tap on a seat line pictured with what tells the person it happened (the list's count, the ring) |
| 9 every list measured | the Legend's rows and the Logic page's lines measured at phone and desktop; the issues list's longest seat line |
| 22 what is drawn | the Legend and the lines judged on the pictures, not on the text in the page |
| 23 (first) the ruled window | a tap on a seat line opens what it opens on `main` today — recorded, not changed here |
| 23 (second) side-by-side boxes | the Legend's rows at an iPhone's width with an iPhone's letters (WebKit) as well as a desktop's |
| 25 every place the thing can be put | the seat line on a flight, a sim, a spare and an AVALON line; the SC desk on Monday-to-Saturday and on Sunday into the next week |
| 28 on a phone, what a press opens | the Legend fold opened on the phone and pictured before anything in it is read |
| 30 a picture after each tap on a phone | the Legend fold's tap and a seat line's tap, on the phone |
| 2, 7, 13, 20, 21, 26 (gestures, pinch, drags) | do not apply — no gesture changes |
| 4, 5, 12, 19 (windows) | do not apply — no window changes; the day-details window is only read |
| 6, 15, 24, 31 (scrolling, pinned bars, page fit) | do not apply — no layout or scroll changes; the Legend keeps its height (D2078), measured |
| 8 approved drawing | the Legend's approved picture: the build pictured beside it at both sizes (no part list exists for it; the words are the whole change) |
| 10 hidden page / 11 zoom-dependent / 17 show-hide | 17: the Legend fold opened and closed and the page measured after each; 10 and 11 do not apply |
| 14 keyboard, 16 refusal at a box, 18 print, 27 neighbours, 29 midnight | do not apply — no keyboard, refusal, print, neighbour or date change |

## Astra's scenarios

Her ten, `docs/superpowers/briefs/2026-11-16-warn-words-followups-scenarios-astra.md`, walked by w1 in her order with
the host's corrections (the walk brief). Every scenario walked on a desktop; 1, 7, 8, 9 and 10 on the phone too.

## Orders walked — what the screen said

The full table, one row a step: `docs/handpass/parts/2026-11-16-wwf-w1.md` (w1, the frozen build of `7eade5b52`, 205
pictures) and `docs/handpass/parts/2026-11-16-wwf-w2.md` (w2, the re-walk on the frozen build of `fd8c40f40`). In short:
- **D2073, the SC desk with no END:** S1 (Sunday into Monday, cold and warm, END typed, cleared), S2 (a skipped desk
  beside a real ending, both block orders), S3 (published, a pending END, AL1, the 👁 looks, Load Original, Undo), S4
  (the template's identity, never the name: a renamed block, an Empty block named "SC Shift", templates with "For
  wave" SC and None, flipped after placing), S5 (plans A / B, Undo / Redo, a day template, a paste) — all PASS.
- **The assumed hour still works elsewhere (S6):** the conflict with a meeting and the long day still read it — PASS;
  ALL AVAIL and OIL Earn RECORDED as on `main`.
- **D2074, "Illegal seat" (S7, S8):** every producer — AVALON MAIN and SPARE, BB MAIN and SPARE, SC SPARE, a flight's
  front seat, the OFT — PASS; the issues list, the board, the week, the day-details window, ORIG, AL1, View-only Sched
  — PASS; hide, show, Undo (the host, by the board's own Undo).
- **D2077 (S9):** the Logic page — PASS at three doors. **D2078 (S10):** the Legend — PASS, with the phone note below.
- **The re-walk (w2), 33 PASS · 0 FAIL · 8 RECORDED · 0 NOT WALKED, 98 pictures, no errors:** R1 — two desks of one
  man, SC first and plain first, desktop and phone: ONE crew-rest line, "Friday duty ended 21:00 → clear 09:00", END
  23:00 → 23:00, cleared → 21:00, no conflict with himself while END is blank (host opened
  `w2/r1-scfirst-d/04-sat-strip.png`). R2 — the Q chip's title "Qual / illegal seat" on Nomad (only "Not SC NIGHT
  current") and on Hex ("Illegal seat: …"); a tap on the phone shows that man's own warning line. R3 — an AVALON and a
  BB desk, their waves flying: END blank no line, END 23:00 one, cleared none. R4 — D2079's sentence word for word at
  three doors (host opened `w2/r4-p-a/03-fold-open.png`). R5 — the plain-user round: a man seated, a line tapped, the
  day-details window closed by Done, ✕ and Escape, the Legend, a publish, View-only Sched as admin and member — PASS.
  RECORDED and as built: with the SC desk's END 23:00 and the plain desk's blank, the two desks overlap and Friday
  shows "Conflict … in two seats on SXO AM duty … at once" (two real overlapping desks); with the AVALON or BB wave NOT
  flying, its desk carries no crew rest either way (a standby desk, D1997).

## Cases carried by a test

- The seat warning for a record carrying CAT IW in a front seat — no control can make one: `engine/validate.test.ts`,
  `engine/avalon-rules.test.ts`.
- Ground crew in SC SPARE's front seat — the crew picker never offers him there: `engine/scspare-rules.test.ts`
  ("Illegal seat: ground crew in the front seat of SC AM SPARE 07:00–13:00").
- The Legend's drawing: `docs/mock/2026-11-16-legend-words/drawcheck.mjs`, 0 pixels different at 390 and 1536.

## Break tests

Each change's test was seen red before its fix: D2073 and Astra F1 (`engine/assumedlanding.test.ts`, both block
orders and the same-row extra control), D2080 (the same file), D2074 (`engine/warnwords.test.ts` and four others),
Opus F1 (`engine/validate.test.ts`, `ui/html.test.ts`), D2077 and D2079 (`ui/logic.test.tsx`), D2078
(`ui/html.test.ts`).

## Errors seen

No console or page error in any run of w1 or the host's. Two banners, both the test world's: "Couldn't save that
document…" on the phone's Logic run (the test browser's WebKit on Windows stores no files — `docs/walk-scripts.md`) and
"Sync · slow" once on a member's desktop run.

## What was NOT walked, and why

- **S1, Echo on the phone:** the script could not seat him on the phone ("seat not armed"); the desktop run covers
  Echo, the phone run Ranger.
- **S6:** Insights' work hours and "type END, clear it, read again" — carried by S1's and S5's END cycles.
- **S7:** SANS men (none set up); ground crew in SC SPARE (not offered — carried by a test, above).
- **S8:** Insights' line, the Q chip's tap, the ALL AVAIL reason, the two 👁 looks at the published versions, the
  member at phone width — the Q chip and a line's tap went to the re-walk (R2, R5).
- **S9:** the member at phone width.

## The reads

| Reader | Finding | Disposition |
|---|---|---|
| Astra (`…-coderead-astra.md`) | F1 — an SC desk with no END placed before a plain desk of the same man, role and hours swallowed the plain desk and its crew-rest breach | NEW in this change — FIXED red first (`447638180`, `engine/events.ts`); re-walked, w2 R1 |
| Fresh, blind Opus (`…-coderead-opus.md`) | F1 — the red Q chip's hover said "Illegal seat" on a man only out of date | OLDER — FIXED red first (`447638180`): "Qual / illegal seat", the Legend's words; re-walked, w2 R2 |
| Fresh, blind Opus | F2 — the Logic page's crew-rest fold still said a desk with no END runs an hour | put to him as Q1 → D2079, BUILT red first (`fd8c40f40`); re-walked, w2 R4 |
| Fresh, blind Opus | F3 — a question: an AVALON or BB desk whose wave flies, END blank | put to him as Q2 → D2080, BUILT red first (`fd8c40f40`); re-walked, w2 R3 |

## Gate counts

GitHub's run of the pull request (the full set while the repo is public, D1086): green on `447638180` and on
`fd8c40f40` (the last code commit); the notes commits after it re-run it — the closing report names the last one read.

## What the check found, and each disposition

- **The four read findings** — above: two fixed, two ruled by him and built.
- **w1's lead (a), S8 Undo after hide and show:** NOT A FAULT. The host reproduced it with the board's own Undo
  (`#sbUndo`): desktop and phone alike — the first Undo hides the line again ("Undid: flagging a warning again"), the
  second shows it, Redo forward (`w1/host-s08u/`, `w1/host-s08u-p/`, script `scripts/handpass/wwf/wwf-host-s08u.mjs`).
  w1's script pressed the page's Undo, which the board covers, so its desktop click landed on whatever lay on top.
  The re-walk's brief carries the trap.
- **w1's lead (b), a BB line with blank START and END:** the crew picker's own drop note ("WSO — cannot fly front
  seat") shows, and no "Illegal seat" line — the same on `main`: a BB or AVALON shift left with no times has no window
  and is not collected for its checks (a comment in `engine/validate.ts` says so), while an ordinary flight with no
  times does warn ("… of this line (no times yet)"). Older, not this change — FILED, `[STANDBY-NO-TIMES-SEAT]`.
- **w1's lead (c), the phone Legend:** at 402 wide (his iPhone 17 Pro) the parked AIRCREW tab covers the last letters
  of "misses sim debrief"; at 390, where the drawing and its check were made, that name wraps to its own row. The tab
  floats over the page's right 30px everywhere on Edit Schedule's phone view, and the Legend runs to 20px from the
  edge. A fix (a right margin for the tab) would make the Legend one row taller at some widths, against D2078's "both
  sizes keeping their height" — so it is put to him with its picture, recommended, at his look.
- **The AMT box's first seat with a WSO:** no warning — the place w1 used is a passenger place (its own words);
  the check reads a sim row's named front seat, AMT and OFT alike (`engine/events.ts`). As built, not a finding.
- **The method:** the drawing check ran at 390 wide, not at his iPhone's 402 (D1494 says his iPhone's size); the walk
  at 402 caught it (§7.11 lesson 23, side-by-side boxes). A skill note, not a lesson of a fault he found.

## Closing (chat 88)

**§12, every box:** the eight answers and the tier — yes (FULL) · the rulings listed, no clash — yes (D2079 widens
D2073's drawn words, his own ruling, said to him) · the roll-call, no blanks — yes (one MISSING, the phone Legend under
the tab, put to him) · the production build driven at both widths — yes (frozen `7eade5b52`, then `fd8c40f40`) · the
fixture made through the app's controls — yes · every surface seen and operated — yes · sized in writing, every order a
result — yes, the NOT WALKED list above · the downstream result — crew rest and the warning lines as a scheduler meets
them; OIL not touched (RECORDED as on `main`) · tests on production routes — yes · one red break test per wired surface
— yes · the gates — GitHub's run green on `fd8c40f40`, the last code commit · the reads done and dispositioned — yes ·
the sheet with its pictures and its NOT WALKED list — yes · his look — next.

Walk: w1 205 pictures (Astra's 10 scenarios, PASS) + w2 98 (33 PASS, 0 FAIL) + the host's 16; 0 faults found by the walk; the phone Legend under the AIRCREW tab put to him
Docs: OUTSTANDING 177 items (+1 −0) · DECISIONS D1–D2080 (new: D2078, D2079, D2080) · homes OK
docsize: OVER by 19, deferred (D29) — docsize OK, every record accounted for
