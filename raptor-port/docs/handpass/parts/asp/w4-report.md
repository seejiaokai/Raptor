# Walker w4 — round 4b: a SANS posting set ahead (his D2329), the restore repair and a delete before arrival, 22 Nov 26, chat 146

Brief: `docs/superpowers/briefs/2026-11-22-allavail-sans-posted-walk-r4b-brief.md` (W1, W1b, W2, W3, W4, PU). Build:
`raptor-port/dist` of this copy as found (bundle `index-DW2YsIKN.js`, the same name served — checked), not rebuilt,
served by `npx vite preview --port 4393 --strictPort`; the server was stopped by its port at the end (port 4393 free).
Clock installed before the app loaded at Wed 15 Jul 26 09:00 and left running (the app's today logged at each scenario's
start: "Wed Jul 15 2026 09:00"); for W1b moved to Fri 17 Jul 26 09:00 with the page's clock, the page reloaded in the
same browser storage and signed in again (the app's today then read "Fri Jul 17 2026 09:00"). Each scenario in a fresh
browser context; desktop Chromium 1536×864, iPhone WebKit 402×874 (touch, scale 3, real taps, a picture within ~100 ms of
each tap in `run2/taps/`). Signed in as `ad`/`a`. Everything made through the app's own controls; `window.*` only read,
to read back each set-up step (named where a step reads it).

Scripts: `scripts/handpass/asp-w4.mjs` (all scenarios, on the first walk's `asp-w2-lib.mjs` helpers),
`asp-w4-probe.mjs` (a first look: the posting set ahead read back, the war's row, the clock move works across a reload),
`asp-w4-probe2.mjs` (read only: what Hex holds on Thu 16 Jul in the demo week). Run with
`W2_URL=http://localhost:4393/ W2_OUT=docs/img/handpass/2026-11-22-allavail-sans-posted/w4/<run>`.

Runs (pictures under `docs/img/handpass/2026-11-22-allavail-sans-posted/w4/`):
- **`run2/` — the final run of the brief's scenarios**, `ONLY=w1d,w1p,w2d,w3d,w4d`, script v2: 127 pictures + 100 tap
  pictures, results `run2/results-w4-w1d_w1p_w2d_w3d_w4d.json`. 124 lines: 75 PASS, 17 FAIL, 25 RECORDED, 7 notes, 0 NOT
  WALKED.
- **`run3-w3x/` — a supplementary run (not in the brief)**, `ONLY=w3xd`, script v3: W3 again at hours Hex is free on
  Tue (explained below). 19 pictures, results `run3-w3x/results-w4-w3xd.json`. 22 lines: 17 PASS, 0 FAIL, 4 RECORDED, 1 note.
- `earlier-attempt-run1/` — an earlier attempt, W1 desktop only (script v1), stopped at the same Thu result; not cited.
- `probe/` — the two probes' pictures; not cited.

"In the crowd" is read as membership — the man's own puck in the ALL AVAIL window (`.availwin .rpuck[data-awp=<id>]`) —
beside the count chip, each with "+ SANS" off, then on, then off again on the Leave War, the board reopened on the day and
the chip pressed each time (the library's `bothWays`). I opened the deciding pictures myself (named below).

**Counts:** every Saturday, W2, W4 and PU line PASS; the restore repair PASS in the supplementary run. The 17 FAILs are two
places where the brief's own premise ("assuming that he available") does not hold in the demo week: Hex already flies
on Thu 16 Jul and on Tue 14 Jul at hours that clash with the brief's event times. No console error, page error or
failed request in any run.

## Results

Picture names drop the folder `run2/` and the `-desktop.png` / `-phone.png` ending where both exist. "×3" = "+ SANS" off,
on, off again.

### W1 — Hex posted out as SANS from Fri 17 Jul, set on Wed 15 Jul — desktop and phone

| What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|
| Wed 15 Jul: Hex's 17 Jul cell → ⋯ → Post out, PO FROM "Fri 17 Jul 26", SANS, Post out | sheet line "On 17 Jul: becomes SANS."; Admin → Users tag "posting out 17 Jul · SANS"; the war's row: a yellow line at the end of Thu 16, "PO" hatched from Fri 17; read: not yet SANS (`san:false`) | PASS (set-up), both sizes | w1-w1-01-postout-sheet, w1-w1-01-users-tag, w1-w1-01-lwrow |
| Thu 16: Common Programme SQN EVENT 10:00–17:00 for ALL AVAIL, Hex not named | row made | PASS (set-up) | w1-w1-02-thu-fixture |
| Thu 16: the event's count chip ×3 | chip "21", "Who's available 21" (pilots 14, WSOs 7), **Hex NOT in**, 0 pending — the same three ways, both sizes | **FAIL ×3 + agree, both sizes** (EXPECTED Hex IN) — but see the cause below | w1-w1-03-thu-{off,on,off2}-win |
| why (read only) | Hex already flies Thu 16: RU BFM, rear seat, T/O 16:45, LD 18:10 — inside the event's 10:00–17:00; in the crew list his puck is struck "busy", title "Hex — already tasked today, but you can still plan him" | RECORDED | w1-w1-03x-thu-crew |
| supplementary: Thu 16 SQN EVENT 2 08:00–10:00 (hours his flight leaves free), Hex not named; chip ×3 | chip "40", window 40, **Hex IN**, no purple line, 0 pending — the same three ways, both sizes | PASS ×3 + agree, both sizes | w1-w1-03y-thu-fixture2, w1-w1-03z-thu2-{off,on,off2}-win |
| Sat 18: the same SQN EVENT 10:00–17:00, Hex not named; chip ×3 | chip "44", window 44, **Hex NOT in**, 0 pending — same each way, both sizes | **PASS ×3 + agree, both sizes** | w1-w1-04-sat-fixture, w1-w1-05-sat-{off,on,off2}-win |
| Sat 18 board: Hex in the crew list? | offered (1 copy), both sizes | note | w1-w1-06a-sat-crew |
| Sat 18: Ground Programme BRIEF 08:00–09:00 naming Hex | row made, Hex on it | PASS (set-up) | w1-w1-06-sat-brief |
| Hex's puck on Saturday's BRIEF, close up | the puck "Hex C" wears the purple SANS line at its right end (beside the C chip), on Wed 15 already, both sizes | RECORDED | w1-w1-07-puck-close, w1-w1-07-sat-brief-row |
| Sat 18 event's chip ×3, Hex named | chip "45", window 45 (pilots 28, WSOs 17), **Hex IN** with the purple line, 0 pending — same each way, both sizes | **PASS ×3 + agree, both sizes** | w1-w1-08-sat-{off,on,off2}-win |
| the counts | Thu 21/21/21 (supplementary 08:00–10:00: 40/40/40); Sat not named 44/44/44; Sat named 45/45/45 — both sizes | RECORDED | |

### W1b — publish Saturday, then Friday arrives — desktop (W1's world continued)

| What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|
| Sat 18: four boxes signed, Publish day | 0 pending, not "Not yet signed", "SIGNED ORIG · CUR CK Ace · SKED CK Anvil · PLANNED Basher · APPROVED Bolt"; chip "45", Hex IN | PASS | w1-w1b-01-win, w1-w1b-01-board |
| Leave War: Hex's Sat 18 Jul cell | "FO*" | RECORDED (as expected) | w1-w1b-01-lw-cell |
| clock → Fri 17 Jul 09:00, reload, sign in | today "Fri Jul 17 2026 09:00"; read: Hex now SANS from 17 Jul | PASS (set-up) | |
| Sat 18 again: pending, signed line, window, cell | 0 pending, the same SIGNED ORIG line, chip "45", window 45, **Hex IN** (purple line), cell "FO*" | **PASS** | w1-w1b-03-win, w1-w1b-03-board, w1-w1b-03-lw-cell |
| the Leave War row after Friday arrives ("+ SANS" off) | still in its place under OPS W / CAT C, the yellow line at the end of Thu 16, "PO" hatched from Fri 17, "FO*" on Sat 18 drawn over the hatch; his name puck with the purple line | RECORDED | w1-w1b-04-lwrow, w1-w1b-04-lw |
| "+ SANS" on | the SANS group shows; Hex's row moves into it (beside Zenith, Kraken, Marlin…): 16–20 Jul blank (no PO), "FO*" on Sat 18; Saturday still 0 pending, the same signed line | **PASS** (0 pending); row RECORDED | w1-w1b-05-settings-on, w1-w1b-05-sans-on-lwrow, w1-w1b-05-board |
| "+ SANS" off | the group gone; Saturday 0 pending, the same signed line | **PASS** | w1-w1b-06-settings-off, w1-w1b-06-board |

### W2 — the BRIEF inside the event's hours — desktop

| What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|
| Post out Hex SANS from Fri 17 Jul; Sat 18 BRIEF 10:00–11:00 naming Hex, SQN EVENT 10:00–17:00 ALL AVAIL | "On 17 Jul: becomes SANS."; both rows made | PASS (set-up) | w2-w2-01-postout-sheet, w2-w2-02-fixture |
| the event's chip ×3 | chip "44", window 44, **Hex NOT in**, 0 pending, same each way | **PASS ×3 + agree** | w2-w2-03-{off,on,off2}-win-desktop |
| the count | 44 / 44 / 44 | RECORDED | |

### W3 — archived, then restored with a later post-in — desktop

As the brief has it (`run2/`):

| What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|
| Post out Hex SANS from Mon 13 Jul | "On 13 Jul: becomes SANS."; read: SANS from 13 Jul | PASS (set-up) | w3-w3-01-postout-sheet |
| Tue 14: BRIEF 08:00–09:00 naming Hex, SQN EVENT 10:00–17:00 ALL AVAIL | both rows made | PASS (set-up) | w3-w3-02-fixture |
| Tue before: the chip | chip "23", window 23 (pilots 17, WSOs 6), **Hex NOT in** | **FAIL** (EXPECTED Hex IN) — but see the cause below | w3-w3-03-before-win-desktop |
| why | Hex already flies Tue 14: VL BFM, rear seat, T/O 08:40, LD 10:05 (his puck red on the line; the issues list "Hex — Conflict … BRIEF 08:00–09:00"); the event starts 10:00, before he has landed | RECORDED | w3-w3-03-before-win-desktop |
| four boxes, Publish; archive Hex | SIGNED ORIG, 0 pending; "Hex archived — his sign-in is suspended" | PASS (set-up) | w3-w3-04-published, w3-w3-05-archived |
| Tue after the archive ×3 | chip "23", window 23, Hex NOT in, board "1 pending" | **FAIL ×3 + agree** — same cause; the count unchanged | w3-w3-06-{off,on,off2}-win-desktop |
| Restore: Post in → the app's calendar → 18, Restore | post-in box "Sat 18 Jul 26"; under it "He can sign in at once; the Leave War counts him from the post-in date."; note "Hex restored — he can sign in, and he'll be asked to check his quals and CAT"; tag "posting in 18 Jul"; read: not archived, not SANS | PASS (set-up) | w3-w3-07-restore-date, w3-w3-07-restored |
| Tue after the restore ×3 | chip "23", window 23, Hex NOT in, 0 pending | **FAIL ×3 + agree** — same cause; the count unchanged | w3-w3-08-{off,on,off2}-win-desktop |
| count before / archived / restored | 23 · 23/23/23 · 23/23/23 | PASS (unchanged) | |
| Tue's pending after the restore | 0 pending, the SIGNED ORIG line back; Edit Schedule draws no "N pending" | RECORDED | w3-w3-09-tue-nopending-desktop |

Supplementary, at the first walk's S13 hours, BRIEF 11:00–11:30 and SQN EVENT 12:00–14:00, which Hex's flight leaves free
(`run3-w3x/`, a fresh world):

| What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|
| Post out SANS from 13 Jul; the two rows; Tue before: the chip | chip "35", window 35, **Hex IN** with the purple line, amber "Misses VL BFM debrief 10:05–12:05: SQN EVENT 12:00–14:00" | PASS | w3x-w3-02-fixture, w3x-w3-03-before-win |
| four boxes, Publish; archive Hex | SIGNED ORIG, 0 pending; "Hex archived — his sign-in is suspended" | PASS (set-up) | w3x-w3-04-published, w3x-w3-05-archived |
| Tue after the archive ×3 | chip "35", window 35, **Hex IN** (purple line), board "1 pending" | **PASS ×3 + agree** | w3x-w3-06-{off,on,off2}-win |
| Restore with Post in Sat 18 Jul | "Sat 18 Jul 26"; "Hex restored — …"; tag "posting in 18 Jul" | PASS (set-up) | w3x-w3-07-restore-date, w3x-w3-07-restored |
| Tue after the restore ×3 | chip "35", window 35, **Hex IN** (purple line), 0 pending | **PASS ×3 + agree** | w3x-w3-08-{off,on,off2}-win |
| count before / archived / restored | 35 · 35/35/35 · 35/35/35 | PASS (unchanged) | |
| Tue's pending after the restore | 0 pending, SIGNED ORIG back; no "N pending" drawn, so no pending line at all | RECORDED | w3x-w3-09-tue-nopending |

### W4 — Kiwi, post-in Fri 17 Jul, deleted before he arrives — desktop

| What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|
| New person Kiwi (callsign free), WSO, CAT C, Post in → 17, Add person | "Kiwi added to the roster — set flight and quals on the Quals page"; "Fri 17 Jul 26"; read: seat RCP, not SANS | PASS (set-up) | w4-w4-01-newperson-form, w4-w4-01-newperson-added |
| Tue 14: SQN EVENT 10:00–17:00 ALL AVAIL; chip ×3 | chip "23", window 23, **Kiwi NOT in**, same each way | **PASS ×3 + agree** | w4-w4-02-fixture, w4-w4-03-{off,on,off2}-win-desktop |
| Admin → Users: Kiwi's row ("POSTING IN 17 JUL") → Delete → "Tap again to delete Kiwi" | under it "Goes: his account, his Quals row, every day still to come. Days he flew keep his puck. Can't be undone."; after the second press "Kiwi deleted", his row gone from the list | PASS (set-up) | w4-w4-04-acc-open, w4-w4-04-del-armed, w4-w4-04-deleted |
| Tue again: chip ×3 | chip "23", window 23, **Kiwi NOT in**, same each way | **PASS ×3 + agree** | w4-w4-05-{off,on,off2}-win-desktop |
| the count | before 23/23/23, after 23/23/23 — unchanged by the delete | PASS | |

### PU — the plain-user round on W1's world — desktop and phone

| What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|
| Sat 18: the count chip → the ALL AVAIL window; its ✕ | opened "SQN EVENT · Jul 18 · 10:00–17:00", "Who's available 45", Hex in; after ✕ no window | PASS, both sizes | w1-pu-01-win-open, w1-pu-02-win-closed |
| Leave War: Hex's 17 Jul cell → his posted-out sheet; its ✕ | "Hex Fri 17 Jul", PO FROM "Fri 17 Jul 26", POSTING with "✓ SANS" lit, "On 17 Jul: becomes SANS.", "Undo post out (PO)", "Place leave or OIL here instead…"; after ✕ closed, his record unchanged (read) | PASS, both sizes | w1-pu-03-cell17-opens, w1-pu-04-sheet-closed |
| the grid's row for Hex around 17 Jul | 14–15 blank; a yellow line at the end of Thu 16; "PO" hatched from Fri 17 onwards; his name puck with the purple SANS line | RECORDED, both sizes | w1-pu-05-lwrow, w1-pu-05-lw |
| nothing changed by the round | Saturday 0 pending before and after; his record the same | PASS, both sizes | w1-pu-06-sat-after |

## The FAILs, and what I believe they are

Both are the fixture, not the posting: the brief's own premise is "assuming that he available" / "the timing is
deconflicted", and in the demo week Hex is not free at the brief's event times on those two weekdays. I did not change any
expectation; the FAIL lines stand as walked, each with its supplementary run beside it. The host should judge.

1. **W1 Thu 16 Jul, both sizes, ×3** (`run2/w1-w1-03-thu-{off,on,off2}-win-{desktop,phone}.png`). Screen: "SQN EVENT · Jul
   16 · 10:00–17:00 · Who's available 21", Hex not among the WSOs (Relay, Cinder, Rune, Cutter, Ghost, Ryder, Wisp). Hex
   already flies RU BFM on Thu 16, T/O 16:45, inside 10:00–17:00 (read only from the day; the crew list strikes his puck
   "busy", `w1-w1-03x-thu-crew`). With an event at 08:00–10:00 the same day, Hex IS in, all three ways, both sizes (40).
   To reproduce: a fresh world, W1's posting, then the Thu event at 10:00–17:00.
2. **W3 Tue 14 Jul, ×1 before + ×3 after the archive + ×3 after the restore** (`run2/w3-w3-03-before-win-desktop.png`,
   `w3-w3-06-*`, `w3-w3-08-*`). Screen: "SQN EVENT · Jul 14 · 10:00–17:00 · Who's available 23", Hex absent from the start.
   Hex flies VL BFM on Tue 14, T/O 08:40, LD 10:05: the brief's BRIEF 08:00–09:00 clashes with that flight (the issues
   list's "Hex — Conflict … BRIEF 08:00–09:00") and the event starts before he lands. The count never moved (23 → 23 →
   23), so the archive and the restore changed nothing — but the walk could not show Hex kept, because he was never in.
   At the first walk's S13 hours (`run3-w3x/`) Hex is IN before, after the archive and after the restore, all three ways,
   35 each time — the restore repair holds.

## Recorded

- W1 counts: Thu 21 each way (Hex busy; 08:00–10:00 event 40, Hex in); Sat not named 44; Sat named 45 — both sizes.
- Hex's puck on Saturday's BRIEF wears the purple SANS line on Wed 15, before his posting date, at both sizes (and in the
  window on Saturday, "purple line" every reading). On the supplementary Thu event (08:00–10:00) his window puck has no
  purple line.
- W1b: after Publish Hex's Sat 18 cell reads "FO*"; after Friday arrives still "FO*", still 0 pending, the same SIGNED ORIG
  line, Hex in at 45, and 0 pending after "+ SANS" on and off.
- The Leave War row after Friday arrives: with "+ SANS" off he stays in his old place, "PO" hatched from Fri 17 with "FO*"
  on Sat 18 over the hatch; with "+ SANS" on he moves into the SANS group and his 16–20 Jul days are blank (no PO), "FO*"
  on Sat 18. Before Friday (PU, Wed 15) the row shows the same PO hatch from Fri 17 and the purple line on his name.
- W2: 44 each way. W4: 23 before and after the delete.
- W3 (as briefed): 23 throughout; Tue 1 pending after the archive, 0 after the restore (the SIGNED ORIG line back), no
  pending lines to read. W3 (supplementary): 35 throughout; the same 1 → 0 pending.
- After the restore Hex reads not SANS (`san:false`) and "posting in 18 Jul" — noted only; the brief does not ask about it.

## The walk's own mistakes

- The two FAILs above come from the brief's event times meeting Hex's own demo flights; I took the brief's times as
  written, saw the result, then read what Hex held that day and added the supplementary runs. No set-up step failed to
  take: every set-up read back as made on its first try.
- My "no pending line about OIL or the crowd" check in W3 passed trivially: after the restore there was no "N pending" to
  open, so there were no lines to read. The pending count after the archive (1) was read on the board, but its lines were
  not opened — the brief asks only after the restore.
- My reader of the war's name puck found the puck on the desktop and an inner box on the phone (its note reads only "Hex
  {nm}" there); the phone pictures show the purple line on his name all the same (`w1-pu-05-lwrow-phone`,
  `w1-pu-03-cell17-opens-phone`).
- An earlier attempt (`earlier-attempt-run1/`, script v1, W1 desktop only) was replaced by `run2/`; its results agree with
  run2's and it is not cited.

## Console / page errors

None in any run (every run's `errors` line PASS: no console error, page error, 4xx or failed request).
