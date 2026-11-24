# Round 5's fixes — builder's report (Fable, chat 169)

Status: READY FOR INDEPENDENT REVIEW. Both items built, one local commit `1d2ed3415` on
`claude/allavail-sans-postout-141` (on top of `e6d855310`), not pushed. D2565 left as built, untouched.

## Item 1 — his D2564: the reminder counts a day only where he is in a flying seat or a sim

**What changed.**
- `src/engine/avail.ts`: a new function, `daySansSeats(d)` — who stands where SANS availability is asked, on one day. It
  names every man in a flying seat that is not cancelled and not exempt, and every man on an OFT or AMT row that is not
  cancelled (seat, passenger, or dropped under it). "Exempt" is the checks' own test (`waves.ts saExempt`): an SC SPARE
  and an AVALON / BB row stand by, unless the row flies; an SC MAIN seat counts. `dayEngaged` is not touched.
- `src/leavewar/sansunfiled.ts`: the reminder asks `daySansSeats` where it asked `dayEngaged`. The header comment that
  carried the old reading ("named anywhere on that day's programme … his to change") is corrected and says what happened.

**One definition, and how drift is caught.** The scheduler's two readers work only on the loaded week (the checks build
the day's events; an armed seat asks by slot key), and the reminder also reads saved weeks that are not loaded — so I
could not make all three call one body without rewriting engine code that is a verbatim port. Instead `daySansSeats` is
the question as a function of the day alone, built on the checks' own exemption test, and
`src/leavewar/sans-planned-r5.test.ts` holds it to both of the others on the same twelve fixture rows and on every day of
the demo week: it fails if the checks' collection (`events.ts buildDay`: its flying list plus its OFT / AMT entries) or an
armed seat's reason (`slotBar`) ever disagrees with it. `docs/feature-impact.md` now names the reminder as a fourth
reader of that seam and says to change `daySansSeats` with the gate.

**Failed first** (`sans-planned-r5.test.ts`, with the reminder still on the old read: 13 of 41 red). One line each:
- a ground programme row / a duty desk / all hands, nothing filed: `expected [ '2026-07-18' ] to deeply equal []`
- an AVALON seat that only stands by: the same (the old read counted it; the checks never did)
- ground row + duty desk + all hands together: `expected [ '2026-07-18' ] to deeply equal []`
- a ground row on Sunday beside a flight on Saturday: `expected [ '2026-07-18', '2026-07-19' ] to deeply equal [ '2026-07-18' ]`
- Green before and after (controls): a flying seat, an OFT seat, an AMT box and an SC MAIN seat name the day; an SC SPARE,
  a cancelled flight, a cancelled jet and a cancelled sim do not; a mixed day names the day once; filing takes it out.

**Two readings of mine — please put them to him or tell me to change them** (I am not leaving them in a comment):
1. **A flying seat or sim box with no times typed yet still counts.** His words are "in a flying seat or a sim"; he is in
   it either way. The checks also list a no-times flying line; an armed seat with no times does not ask. Pinned by one test.
2. **A cancelled line or box never counts** (the brief said so for a cancelled flight; I applied it to a cancelled jet
   and a cancelled sim too). Here the crew list differs on purpose: arming a place on a cancelled line still strikes a
   SANS man with nothing filed. The test marks these three rows as the one stated difference.

**Older tests re-pinned (they pinned the builder's reading, not his rule).**
- The planning helper `plan(...)` put him on a ground briefing in ten files; it now seats him in an OFT's rear seat, with
  a note above it saying why: `sans-unfiled`, `sans-reads-156`, `sans-reads-r3`, `sans-words-156`, `sansplan-sec156`,
  `sans-seen-sec-r4`, `sans-ahead`, `opus-read-147`, `sec147-read2`, `sans-review-regressions`, and `astra-c147-reread`
  (its own helper). The `unplan` helpers in `sans-reads-r3` and `sans-words-156` follow. No assertion in those cases
  changed; 98 of the 108 first failures went green by the helper alone.
- **Expected results changed, each traced to D2564, each with a note in the file:**
  - `sans-reads-156.test.tsx`, block R2-2 — four cases (Astra F3; the Opus read's R1; Fable 1a; Fable 1b). Each had a
    Meeting put a day in his reminder and its deleting take it out. A Meeting lands on the ground programme, so every
    "his reminder names it" now reads "does not", the steps kept; the checks that the saved week itself follows the
    request (the busy read) are kept as they were.
  - `sans-reads-r3.test.tsx`, block "Astra F2" — three cases of a man moved squadron. The Meeting on Tue 28 Jul is never
    named now. I gave him a real seat in that week (an OFT on Wed 29 Jul) so the cases still hold something: the reminder
    equals a fresh reading before the move, after it, undone, redone and in both squadrons' views.
  - `sans-reads-r3.test.tsx`, block O3-2 — "a request landing a row on the week on screen still does [read the saved
    weeks again]" expected more than 0 reads; it now expects 0 (item 2).

## Item 2 — the week-change speed (Astra's round-4 F1): done, with proof

**Judged safe, and why.** With only seats and sims counting, I read what is worked out on the way to reading a saved week
(`weekstash.ts stashDays` → `overlay.ts viewOfWeek`). Requests are reconciled and landed on ground rows only; a home
squadron only decides whose week such a row lands on; the one step that reaches a seat is a deleted man taken off from
his cutoff. The week on screen reached the reading only through each day's label, written under the year on screen.
So `weeksHeld` now keeps a saved week's reading by its saved copy, the men deleted and the squadron in view, and asks
what he filed by a label that always carries its year (`weeks-data.ts weekDatesAbs`). Astra's step 4 (the cross-week row
search, the loaded rows' dates) concerns request rows only, which the reminder no longer reads.

**Failed first** (`src/leavewar/sans-held-weeks-r5.test.tsx`, with the week on screen put back in the key):
- six saved weeks, the week changed: `saved weeks read for a change of week: expected 330 to be +0` (Astra's own figure)
- across the New Year: `saved weeks read for a change of week across the year: expected 10 to be +0`

**The proof, now green (8 cases).** No saved week is read again for: a change of week and back; a Meeting filed and
deleted; another man's home changed and his own; a plain row added. Each case also compares the reminder's days with a
reading worked out afresh from the saved copies, so a reading kept too long would show as a wrong day, not only as a
count. Still seen: a saved week worked on again (a seat added, a seat taken off); a day he files for (asked afresh each
time, no saved week read). New Year: Sat 2 Jan 27 in the saved week of 28 Dec 26 is named from a 2026 week and from a
2027 week, and gone from both once filed. Astra's retained regression is ported as the first case; the plain-row,
home-change and New Year cases of rounds 2–3 still pass in their own files.

## Commands run (from `raptor-port/`)

| Command | Result |
|---|---|
| `npx vitest run src/leavewar/sans-planned-r5.test.ts` (reminder still on the old read) | FAIL — 13 failed, 28 passed |
| the same, after the fix | PASS — 41 / 41 |
| `npx vitest run src/leavewar/sans-held-weeks-r5.test.tsx` (old key part put back) | FAIL — 2 failed, 6 passed |
| the same, final | PASS — 8 / 8 |
| 129 test files under the checks lock, first run after the fix | 108 failed in 11 files (the re-pins above), 2316 passed |
| the same 129 files, final run after every edit | PASS — 129 files, 2424 passed, 2 expected fail (marked so already) |
| `node reference/tfin.js` (the engine file changed) | PASS — 728 passed, 0 failed |
| `npm run build` (the type check) | PASS |
| `npm run lint:changed` | PASS — "no new finding" |
| `npm run docsize` | PASS; it notes HANDOFF.md and OUTSTANDING.md over their size (423 together) — not my files, deferred by its own rule |
| full unit suite, browser tests, a walk of the running app | NOT RUN — per the brief |

The 129 files: every test file under `src` naming the read record, the bell's reads, Undo post out, the peek, the landing
signature, the projection door, `sansdue`, `sansUnfiled`, `daySansSeats`, `dayEngaged`, `slotBar` or `SANS_AVAIL`, plus
the other SANS re-read files and `src/engine/overlay*.test.ts`. The exact list is the grep in
`…/scratchpad/r5-suites.sh`; the final run's output is `…/scratchpad/r5-suites2.txt`.

## Documents corrected
- `docs/notifications-register.md` B13: what "planned" covers (D2564), the unsaved-week case narrowed to the demo's own
  weeks, D2565 named, its rulings column.
- `docs/feature-impact.md`: the SANS gate's seam gains the reminder as a reader, and how drift is caught.
- `docs/file-map.md`: the two new test files and the two changed source files.

## Found, not fixed
1. **ALL AVAIL's "planned with us" still reads every row** (`leavewar/sync.ts`, by `dayEngaged`, his D2329: a SANS man is
   counted "only on a day a scheduler has put him on our programme"). That is a different ruling with different words,
   and the brief said to leave `dayEngaged` alone — but it is the same word "planned" read widely, so it belongs in the
   audit D2567 plans. Not changed.
2. **A man moved to another squadron still gets a reminder for a seat his old squadron holds him in after his move day**
   (his home today is still the old squadron). It was so before this round too; the app does not yet refuse seating a man
   on a day he is another squadron's (borrowing is not built). Pinned as it stands in the re-pinned Astra F2 cases.
3. **`daySansSeats` is not added to the browser probes' bridge** (`probe-bridge.ts`): no probe reads it. Say if you want it there.
4. **D2566** (a SANS info line for a ground row, a duty or all hands, as soon as planned) is its own job and is not
   started; until it is built a SANS man put only on a ground row is now told nothing by his bell.
5. Kept readings of a saved week still filter by the roster as it stood when read: a man whose record did not exist then
   and exists later would be missed until that week's copy changes. I found no way for that to happen (a deleted man
   stays on record, and the men deleted are in the key), so I left it; stated for the readers.

## Departures from the brief
- "Ideally ONE shared definition both use": the scheduler's two readers still run their own code; one new definition
  serves the reminder and a test ties the three together (the reason is above). If the readers want the checks and the
  armed seat rewired onto it, that is an engine change with the parity gate to re-run — not done here.
- The readers' test (`review.test.tsx:108`) is ported, not copied: its 40-week timing run is not kept, the 6-week count is.
- Nothing else. No push; `HANDOFF.md`, `OUTSTANDING.md`, `DECISIONS*`, `.claude/` and the two modified pictures untouched.

Rulings: none recorded by me (D2564–D2567 were recorded by the host before this build). Two readings above need his word.
