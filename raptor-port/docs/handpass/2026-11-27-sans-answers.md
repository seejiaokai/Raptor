# Evidence sheet — his answers to the SANS warning-lines questions (chat 208, 27 Nov 26)

Branch `claude/sans-warnlines-185` (pull request 850). Rulings D2753–D2759 (scheduler page), his "all as recommended"
on the questions page of the warning-list piece's bug check (`2026-11-26-sans-warnlines.md` §14). The rulings
`1ea13a30b`; the build `232df4490`.

## 1. The eight answers and the tier

1 money: NO — no OIL, no count of who is present; the SANS check raises an advisory only. 2 the published record: NO —
the words of a line change, nothing about publishing, signing or the issued copy (a published day shows whatever its
frozen warnings say, as before). 3 saved data: NO — nothing new stored; a line hidden under its old words may show again
(stored demo data only, D56). 4 a shared drawer: YES — the puck's hover words (every copy of a puck) and the note after a
plant (every way of planting). 5 a new gesture or mode: NO. 6 a new surface: NO. 7 roles: NO. 8 the warning list: YES —
what the SANS lines say. **Tier: FULL.**

## 2. The rulings that apply

D2753 (the note after a plant reads the crew list's words), D2754 (a sim named OFT / AMT, "(end assumed)", "(no times
yet)", "this OFT row"), D2755 (Fly · OFT · AMT), D2756 (one line a flight; leave and SANS both — kept), D2757 (the amber
"A" hover words), D2758 (AM / PM under the letter for every man with a seat picked — kept), D2759 ("available AM only" /
"PM only" in his struck reason; Fable's check of the words, chat 208: yes as recommended). Left as they are and walked
as such: D2583 (the Legend's amber "A" line), D2584 (the flying lines' words, the nothing-filed line's head), D2587 (no
"file it" to the scheduler), D2750 / D2751 (the hours under the letter).

## 3. The roll-call

| Place the app draws it | SHOWS the new words / order | Gesture usable | What else is painted there |
|---|---|---|---|
| The day's warning list, Edit Schedule (desktop, phone) — a sim's SANS line | YES (D2754) | the line's ✕ / ↺ | the day's count, the other lines |
| The day's warning list, View-only Sched and the Board's panel | YES — the same warnings | the line's ✕ / ↺ where offered | — |
| A published day's list | must not change until republished (frozen warnings, D179) | — | — |
| The note after a plant — tap onto an armed seat, drag from the crew list, seat-to-seat, onto an input's row, after the OIL question | YES (D2753) | — | the landing flash |
| The crew list's struck reason (Edit Schedule, Board; desktop, phone) | YES (D2759) | the struck name still plants | F / O / A letters, AM / PM under the letter (D2758) |
| The drag hint over a seat | YES (D2759) | — | — |
| A puck's hover words (every copy of a puck) and its "A" chip's | YES (D2757) | — | his callsign, level, SANS |
| The Logic page's flag row | YES (D2757 — it lists the same words) | — | the other flags |
| The week's Legend, its amber "A" line | must not change (D2583) | — | — |
| The SANS calendar's "+ Commitment" form, its ticks and its refusal | YES (D2755) | each tick | the span picker |
| His own bell's SANS lines | must not change | — | — |

## 4. The five sizing lines

1. **Type:** F (words — the note, the sim's name, the reason for a half day, the A's hover) with D (the A's words drawn on
   every copy of a puck and the Logic page; the note made by every way of planting) and a small E (three ticks reordered).
2. **What only a walk could find:** whether every way of planting reaches the new note words, before and after a hide;
   whether every place that reads the day's warnings shows the sim's new ending, through publish and reload; whether
   every door to the "+ Commitment" form shows the new order and each tick still saves what it says; whether every copy
   of the A carries the new words; the column's AM / PM, free and struck, still lined up. The tests hold the words.
3. **The ledger:** chat 207's FULL walk of this same piece (three walkers) found its faults where the answer is read and
   drawn (a hidden line keyed wrongly, a phone tap planting the man above, a reason wrapping) — so the readers and the
   column are walked again, not only the words.
4. **The walk chosen:** two Opus walkers (A, B) on one frozen build (`D:/raptor-work/c208-build`, `index-CjChD3bM.js`),
   desktop 1536 Chromium and phone 402 WebKit, Chromium phone for finger drags, a desktop started at 125% for the
   column; every scenario of both designers (57), the plain-user round by each. Repeated cases carried by the tests of §7.
5. **After the walk:** its row in `docs/walk-ledger.md`.

## 5. The scenarios

Astra (gpt-6-astra) S1–S17 and a fresh Fable F1–F40, blind to each other, on the brief
`docs/superpowers/briefs/2026-11-27-sans-answers-scenarios-brief.md` (their lists beside it, `…-scenarios-astra.md`,
`…-scenarios-fable.md`); combined, with the host's corrections to their EXPECTED lines, in
`docs/superpowers/briefs/2026-11-27-sans-answers-walk-brief.md`.

## 6. The orders walked

Walker A (the note after every way of planting, the crew list's reasons, AM / PM, the column, the plain-user rounds):
desktop 235 PASS / 1 FAIL / 26 RECORDED; phone WebKit 200 / 1 / 19 (2 not walked, then walked in `final-a13p`: 39 / 1);
phone Chromium 79 / 1 / 13 (its drag re-aimed in `final-pu39b`); desktop at 125% 26 / 0 / 2. Every FAIL is §14's row 1
or row 4. Walker B (the sim's words on every reader, hiding, two flights, leave, the ticks in every door, the A
everywhere): desktop 139 PASS, phone 140 PASS, 0 FAIL, 61 RECORDED. Reports `D:/raptor-work/c208/{A,B}-report.md`;
scripts `scripts/handpass/sa208-wA*.mjs`, `sa208-wB*.mjs`.

## 7. Cases carried by a test

`src/engine/sans-answers-208.test.ts` (D2753, D2754, D2757, D2759 — 18 cases, every one red before the build);
`src/ui/sansform.test.tsx` (D2755's order); `src/ui/sans-notimes-surfaces.test.tsx` (the note after a tap and a drop
reads the crew list's words); the older SANS tests moved to the ruled words (`sans-hide-event`, `sans-notimes-offer`,
`sans-warn-lines`, `warnwords`).

## 8. The pictures

`docs/img/handpass/2026-11-27-sans-answers/A/{final,final-a13p,final-pu39b,repro1,repro2}/` and `…/B/{run1,run2}/`
(walker B's trial runs moved out to `D:/raptor-work/c208/B-trials/`, cited nowhere). The host opened each deciding
picture of §14.

## 9. The break tests

`sans-answers-208.test.ts`: 18 cases, all red before the build (21 failing with the older tests moved to the new words),
green after; `sans-notimes-surfaces.test.tsx`'s note after a tap and a drop, red against the build until moved to the
crew list's words.

## 10. Errors seen

None — no console error, page error or failed request on any walker's run, either size.

## 11. Not walked, and why

The real iPhone (its touch, bounce and keyboard over the form's Remarks) and his own PC at its 125% size — his look. A
headless browser draws no hover box: the "A" words were read from the element. WebKit drives no finger drag (Chromium's
phone did); its pax-row "+" needed a script click (a known quirk of the test browser).

## 12. The code reads

Astra (gpt-6-astra) and a fresh Opus, each blind (the brief `D:/raptor-work/c208/read-brief.md`; reports
`astra-read.md`, `opus-read.md` there). Both found row 2 below; Astra row 3; Opus rows 9–10 and the tidiness note (row 11).
The fix commit `e5bfbb402` read narrowly by a further fresh Opus (`opus-fixread.md`).

## 13. Gates

GitHub's run on `232df4490`: all green (Vercel's preview refused — its daily build limit). On his PC: the 126 SANS,
warning, drop-note, publish and signing test files, 1,959 tests green after the fixes; the build's type check clean.

## 14. What the walk found, and each disposition

| # | What | Who | Disposition |
|---|---|---|---|
| 1 | A filing typed as Custom 00:00–12:00 saves as AM and reads "available AM only" (pictures `A/repro1/R1-r1-kedit-reopened-desktop.png`, opened by the host: the reopened form lights AM) | walker A | Not this change: the form has long turned a span equal to a half day into that half. Put to him: hours or AM? |
| 2 | A SANS line's note words were saved with a published day and compared, so a SANS posting running on its date turned the day "Not yet signed" with nothing to show | both reads | FIXED red-first (`e5bfbb402`, `sans-answers-208.test.ts` "a published day stays signed…", red before); re-walked (A, re-walk 1) |
| 3 | A sim row named "SIM" / "Sim" read "this OFT row"; with a blank row at the same times the two lines merged | Astra; walker B's question 2 | FIXED red-first (`e5bfbb402`, two cases); re-walked (B, re-walk 1) |
| 4 | An AMT row renamed BRIEF / DEBRIEF hides its man from the row yet the line still warns "Planned on AMT BRIEF …" (`B/run1/names-nm-amt-brief-*`, opened by the host) | walker B | Older than this change (it read "Sim BRIEF" before); his open question (chat 207's Astra F2), put to him |
| 5 | The warning list keeps clock times for a half-day filing while the crew list and note say "AM only" / "PM only" | both walkers, Fable | Not ruled (D2759 covers the reason); put to him with Fable's words |
| 6 | A row with an end and no start reads "(no times yet)" beside its typed end | walker B | Put to him |
| 7 | Other lines still say "Sim …" (the crew list's "already on Sim EP-9 …", a two-seat clash, "Misses AMT debrief …: Sim BOX") | walker B | Outside D2754 (SANS lines only); put to him |
| 8 | Before a posting runs the crew list says "SANS from Fri 17 Jul: …" and the list "… for today"; a swap raising two SANS lines leads the note with the other man; a PM filer on a flight past midnight is struck; the board's SANS "+ Add" opens with nothing ticked, "+ Commitment" with Fly; Export as PDF prints no sims or warnings | walkers | RECORDED; older behaviour — listed for him, none changed |
| 9 | A sim row with no label key at all would read "OFT undefined" | Opus read | Older ("Sim undefined" before); the app's "+ Row" always writes a name or a blank — filed |
| 10 | The note's tests cannot tell the new path from the fallback | Opus read | Filed with the tidiness note |
| 11 | Tidiness: comments naming the old order or the old note words (`dropflag.ts` header, `sansNoneWhy`'s, `slotBar`'s "only call site", two test headers) | Opus read | Filed, not fixed (D489) |
| 12 | Chromium phone: the first finger drag after the crew drawer opens showed no hint and once landed in the front seat | walker A (lead) | Not this change, not reproduced; filed under `[SANS-STANDBY-WALK-LEADS]` |

## 15. The Walk line

Walk: FULL — two Opus walkers on `232df4490`, 57 scenarios (Astra 17, Fable 40) at desktop and phone, every ruled
wording PASS, 0 errors; 2 faults found by the reads, fixed red-first (`e5bfbb402`) and re-walked on `D:/raptor-work/c208-build2`
(`index-0HKWKnT7.js`): A's published day stays signed through the posting (25 / 24 PASS, the old build failing the same
script), B's row names and two-row case (25 / 25 PASS); the fix read narrowly by a fresh Opus — nothing found. Pictures
`docs/img/handpass/2026-11-27-sans-answers/{A,B}/`. His look owed, on his PC at 125% too.
