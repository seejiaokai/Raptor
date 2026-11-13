# The rules check's small batch — the bug check (13 Nov 26, the night's job 2)

Four of his answers to the rules check, `[RULES-CHECK-FIXES]`'s small batch (D2009, D2010, D2014, D2015), branch
`claude/rules-check-small-batch` (cut from pull request 762's branch; no pull request at night). Scenarios: Astra's,
designed read only before the build, `docs/superpowers/briefs/2026-11-13-rules-check-small-batch-scenarios.md`.
Pictures: `docs/img/handpass/2026-11-13-rules-check-small-batch/`. Laid down at the build's end, before the walk;
the walk, the reads, the one fix and the gates filled in after it.

## 1. The eight answers and the tier

| # | Question | Answer, and why |
|---|---|---|
| 1 | Money | YES — OIL (earned leave, time off banked, never pay — D25): D2014 is about which "Full day of OIL" a published day's OIL follows |
| 2 | The published record | YES — D2014 and D2015 are about when a changed setting reaches a published day |
| 3 | Saved data | NO — nothing new is saved: the sortie's "no landing typed" mark (D2010) is worked out afresh from the typed landing at each check, never stored; the published day's three kept OIL values were already saved, unchanged ([OIL-WORK-START], D592 (4)) |
| 4 | A shared drawer | YES — the warning names (D2009) are one table read by the Logic page, the week's warning list, the day's ⓘ and Insights; the crew-rest sentence (D2010) is one function feeding the crew-rest warning, the tight-turn note, the day before's trace and next week's Monday |
| 5 | A new gesture or mode | NO — no control, tap target or mode added |
| 6 | A new surface | NO — no screen, panel, sheet or kind of row added; no new box, message, mark or button |
| 7 | Roles | NO — who may do or see anything is unchanged |
| 8 | The warning list | YES — two warning names (D2009) and what the crew-rest warning says (D2010) |

**Tier: FULL.**

## 2. The rulings swept

| Ruling | What it says, in the app's words | Clash | Held by |
|---|---|---|---|
| D2009 | the checks read "On leave + planned" and "Downchit + planned"; the day's own message ("On leave but tasked — BRIEFING", "planned to fly") unchanged | none | `rules-small-batch.test.ts`; the walk |
| D2010 | "Monday took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00" where the last flight has no landing typed; a blank, "TBD" or any word that is not a time | none; the ruling's "Mon" is shorthand — the app prints the day's full name, as it always has | `rules-small-batch.test.ts`; the walk |
| D1990 | a "TBD" landing ends the day as a blank one does | none — D2010 words it | `rules-small-batch.test.ts` |
| D49 | a landing typed equal to the take-off is a real landing — it keeps "landed" | none | `rules-small-batch.test.ts` |
| D1936 | an unlanded sortie counts no hours and raises no long-day note | none | `rules-small-batch.test.ts` |
| D2014 | a published day's OIL follows the "Full day of OIL" it was published under; a change reaches it from its next amendment | **none, but its premise is wrong:** already built that way by [OIL-WORK-START] (D592 (4), 5 Oct 26) — pinned end to end, nothing in the engine changed | `oil-fullday-published.test.ts` (12, break-tested); the walk |
| D592 (4) | a later Logic change reads pending until the day is published again | none — a Logic change makes a published day pending in two ways only: when it would move someone's OIL, and when it changes the brief lead a blank B printed (D186, `publish.ts warnDelta`); a change that only checks never does by itself (corrected after Astra's read, §6) | `oil-fullday-published.test.ts`; `rulesfirst-7-published-day.test.ts` |
| D2005 | a Logic change never starts a flag on a published day; the day is checked by the settings it was published under | none | earlier tests; unchanged |
| D2015 | the Logic page's note says a changed setting reaches a published day from its next amendment | none | `logic.test.tsx` W2; the walk |
| D48, D142, D2 | an issued day keeps its OIL until republished; OIL comes from the latest published version | none | `oil-fullday-published.test.ts` (older versions, Unpublish) |
| D482 | a Logic change moves Insights' hours at once, published days too | none — untouched | — |
| D56 | days published before the kept copy existed are demo data | — | not a finding |

**The other OIL settings (D2014's roll-call):** none reaches a published day's OIL at once. The OIL arithmetic reads only
the report lead, the debrief and the "Full day of OIL", all three kept in the day's published evidence. The open-ended
row's assumed hour and the sim length only draw (the hour shown, the chip); step, dekit, brief lead, sim debrief,
AMT debrief and the hard SC shift are not read by it. The placeholder crowd is frozen at publication. An input's OIL
question reads today's line, but only when it is asked or edited — the working copy. Nothing parked.

## 3. The roll-call

| Change | Surface | Mark | Seen in |
|---|---|---|---|
| The two names (D2009) | the Logic page's check rows | has it | W2 N1 (g), N2 (g), PC and phone — `w2/N1/d-07-g0-logic-list.png`, `w2/N1-phone/`; a member, N3 `w2/N1/d-N3-logic.png` |
| | the Logic page's search and Warnings filter | has it | W2 N1 (g): "planned" and "leave" find it, "flying" finds no check name — `w2/N1/d-07-g-logic-filter-*.png` |
| | Edit Schedule's warning list (bold name), desktop and phone | has it | W2 N1 (a), N2 (a) — `w2/N1/d-03-a-edit-strip.png` (a flying row and a BRIEFING row), `w2/N1-phone/`, `w2/N2-ATTC-*` |
| | the same, a hidden line (struck) | has it | W2 N1 (b): hide, Undo, Redo, Reset, the name unchanged — `w2/N1/`; by touch N7 `w2/N7-phone/` |
| | View-only Sched's warning list | has it | W2 N1 (e) admin and N3 member, after publish — `w2/N1/d-08-e-view-strip.png`, `d-N3-view-strip.png` |
| | the day's ⓘ (Issues on this day) | has it | W2 N1 (d), N2 (d), PC and phone, closed by ✕, Escape and a tap outside — `w2/N1/d-04-d-dayinfo-*.png` |
| | Insights, Conflicts by type | has it | W2 N1 (f), N2 (f), PC (no Insights button on the phone's Edit Schedule) — `w2/N1/d-06-f-insights.png` |
| | the Scheduler Board's issues list | must not, because the board shows the message, not the name | W2 N1 (c), N2 (c): messages only, unchanged — `w2/N1/d-02-c-board-issues.png` |
| | the crew list's struck reason | must not, because it shows the reason, not the check's name | W2 N6: no check name drawn there |
| | the IT flow guide deck (two slides quote the old names) | MISSING — the deck is re-made only on his word (D403); filed for the coordinator | — |
| | old walk scripts under `scripts/handpass/` | must not, because they are the record of past walks | — |
| The crew-rest words (D2010) | the crew-rest warning on the next day, Edit Schedule, desktop and phone | has it | W2 N4 — `w2/N4-blank-pc/d-03-tuesday-edit-strip.png`, `w2/N4-blank-phone/`; TBD, 13:00, 12:00/12:00, 1h30 debrief N5 `w2/N4-*-pc/` |
| | the same on the Scheduler Board and View-only Sched | has it | W2 N4 — `w2/N4-blank-pc/d-02-tuesday-board-issues.png`, `d-06-tuesday-view-strip.png` |
| | the amber tight-turn note | has it | W2 N6 (3), N5 (1h30), PC and phone — `w2/N6-pc/d-01-tight-0430-issues.png` |
| | the day before's "breaks tomorrow's crew rest" line and dotted mark | has it | W2 N4: Monday's mark, "he had to leave by 13:40", agrees with the sentence — `w2/N4-blank-pc/d-04-monday-mark*.png` |
| | across the week's edge: Sunday's sortie, next Monday's warning | has it | W2 N5 — `w2/N5e-pc/d-05-next-monday-edit-strip.png` |
| | the day's ⓘ | has it | W2 N4, PC and phone — `w2/N4-blank-pc/d-05-tuesday-info.png` |
| | the ALL AVAIL window, a flagged man's reason | has it | W2 N6 (2), PC and phone — `w2/N6-pc/d-05-allavail-vandal-reason.png` |
| | the crew list's reason before a man is placed | must not, because its short reason ("crew rest — not clear until …") names no landing | W2 N6 (1): it draws no crew-rest reason at all for an already-seated man, typed landing too — older, recorded (§6 W2-1) |
| | Insights hours, the long-day note | must not, because D1936 keeps an unlanded sortie at no hours | carried by test (`rules-small-batch.test.ts`) |
| | the next-week preview | must not, because it draws no crew-rest warnings | not walked: the preview draws no warning list |
| A published day's OIL (D2014) | OIL Earn's figures and green marks, the week and the board | has it — the working copy, as D2013 rules (§6 W1-4) | W1 S1, S2 — `w1/s1/s1a/s1b/s1c-board-oilearn.png`; host `host/pc/h1/h3/h4-*-oilearn.png`, `host/phone/` |
| | the ALL AVAIL chip's earning half | has it | W1 S7: a row that earns nobody, before and after — `w1/s7/`; the frozen crowd by test |
| | a look at an issued version (👁) | has it | W1 S1, S2 — `w1/s1/s1*-look-original.png` |
| | the Leave War grid's credit cell and its day sheet | has it | W1 S1, S2 (+ phone, a picture at the tap) — `w1/s1/s1a/s1b/s1c-lw-grid.png`, `-lw-window.png`; reopened `s1b-lw-reopened.png`; RW1 `rw1/` |
| | the OIL tracker, Balances, the person window's OIL figure | has it | W1 S1, S2 — `w1/s1/s1*-lw-tracker.png`, `-lw-balances.png`, `-lw-person.png` |
| | the day's pending count, To go out, the four sign-offs | has it | W1 S1 (b), S2 (b), S5 — `w1/s1/s1b-edit-head.png`, `s1b-edit-pendinglist.png`, `s1b-edit-signoff.png`; the sign-off boxes read the next amendment's (§6 W1-1) |
| | the amber "Publish this day again…" lines | has it | carried by test (`oil-fullday-published.test.ts`, a holiday made after publishing); not walked tonight |
| | the change history | must not, because a Logic change writes no history line | host `host/s3/h3-lines.txt`: only the amendment's own lines |
| | the red "no usable times" line on a published face (found by the read, §6 Opus 1) | has it, since the fix | RW1 — `rw1/b2-view.png`, `rw1/b3-edit-issues.png`, `rw1/c2-view.png` |
| The note (D2015) | the Logic page's strip, admin and member, one and several settings, desktop and phone | has it | W1 S6, ten of ten, word for word — `w1/s6-pc/s6-admin-one.png`, `s6-member-two.png`, `w1/s6-phone/`; host `host/pc/h5-strip-one.png`, `h6-strip-two.png` |
| | the other Logic lines that say "until it is published again" | must not change, because they say the same of one setting — consistent | — |

## 4. The five sizing lines

- **Type of change:** A (the crew-rest sentence: one shared function, many readers), D (two names and one sentence drawn
  in several places), F (the strip's words), G (D2014: the published record and OIL across a Logic change, an
  amendment, Undo and Redo).
- **What only a walk could find here:** a reader of the name or the sentence that draws its own copy (the board's issues,
  the day's ⓘ, Insights, the ALL AVAIL window, the crew list's reason); for D2014 a place that draws a published day's
  OIL from today's line — the tests read the engine's figures, not what the Leave War grid, its day sheet, the person
  window, the OIL tracker, Balances, OIL Earn and the pending list each paint; the strip at both widths and for a member.
  The host's own route (`scripts/handpass/rcsb/rcsb-host.mjs`, pictures `host/`) already showed, at his PC's size in a
  window started at 125% and on WebKit at 402: published FO*, the line raised to 7h, the Leave War still FO* and 1, the
  day "1 pending" and "Not yet signed", the board's OIL Earn reading the working copy's HO, and after Publish AL1 HO* and
  0.5 everywhere.
- **What the ledger says:** type A/D/G walks of 12 Nov 26 (D2005; the rules check's fixes) found 2–3 real faults each,
  all in places that drew their own copy (the ALL AVAIL window's reason, a published heading, a desk's own ring); two to
  three Sonnet walkers, 400–650 pictures.
- **The walk chosen:** "Low" — TWO Sonnet 5.5 walkers, one after the other, on the frozen build of `300be6535` (the
  strip's last words included) served on port 4193: **W1** D2014 both directions shown on every surface (before the
  change, right after, after the next amendment), Undo and Redo, another day published under the new line, the setting
  put back, the strip (admin, member, one and two settings, Reset), Astra's open-end side question, the plain-user round;
  **W2** D2009's two names and D2010's sentence on every surface that draws them, a briefing row and a flying row, a
  member's View-only. Sizes: his PC's 1536 × 864 in a Chromium window started at 125% (no size emulated) and his
  iPhone's 402 × 874 in WebKit by touch, each scenario at the PC and the ones that draw on a phone at both. Carried by
  tests (they call the engine and the commands, not the screen; the routes on screen are the walked ones): the D2010
  word variants (TBD, "late", "?", a midnight landing, a later typed landing, a 1h30 debrief, both orders) —
  `rules-small-batch.test.ts`, one walked variant each of blank and TBD; D2014's older versions and Unpublish, the
  holiday made after publication and the five gotcha families — `oil-fullday-published.test.ts` (through the app's own
  commands, the OIL pass and the ledger).
- **Afterwards:** the ledger's row (§10 below).

**The lessons of §7.11, each against this walk:** 1 (states × readings) — D2014's table is before / after / after the
amendment × every OIL surface, W1; 2, 7, 13, 20, 21, 26 (gestures, pinches, motion) — no gesture changed, cannot apply;
3 (after every press) — W1 pictures the pending mark and sign-offs after the Logic change; 4 (a window leaving the page
working) — not touched; 5 (a box moved into sight) — not touched; 6 (handed to the phone) — no; 8 (an approved drawing) —
no drawing; 9 (lists measured) — the warning list and Insights' rows are only renamed: W2 pictures each at both widths
for a wrapped name; 10 (a page hidden and shown) — W1 changes the setting with the Leave War closed and reopens it; 11 (how
much fits) — no; 12 (every page a window opens from) — the person window from the grid, the OIL tracker from it and
from Balances, W1; 14 (keyboard boxes) — no; 15 (bars over scrolling) — no; 16 (after a refusal at a box) — the Logic box
takes a bad value once, W1's plain round; 17 (show/hide controls) — the Logic page's ✎ Edit / Done and the strip shown
and hidden by Reset, W1; 18 (print) — no print changed; 19 (window over window) — the OIL tracker over the person window,
closed each of its ways, W1; 22 (what is drawn) — every claim read from the painted text and pictured; 23 (what a tap
opens) — the pending count opens To go out, the war's FO* box opens its own window (D1524), W1; 23b (side-by-side
boxes) — the strip's lines at both widths; 24 (against the top bar) — no; 25 (made through the app's own controls in every
place) — the leave and the downchit made through the Inputs page, the line and the desk on the board, W2 on a flying
and a briefing row; 27 (neighbours of a pressed control) — no control's neighbour changes; 28 (phone: what a press opens
proved first) — W1's phone step opens the strip and the war by taps; 29 (reads today) — no; 30 (a tap pictured at once on a
phone) — W1 and W2 phone taps use the tap-picture helper; 31 (a page fitted to the screen) — not touched, but the PC
world is the real 125% window it asks for.

## 5. The orders walked

Pictures under `docs/img/handpass/2026-11-13-rules-check-small-batch/`; the walkers' own reports, kept whole, in
`docs/handpass/parts/2026-11-13-rcsb-w1.md` and `-w2.md`; scripts `scripts/handpass/rcsb/`. Every run: 0 console errors,
0 page errors, 0 failed requests.

| Order | Who | What | Sizes | Result |
|---|---|---|---|---|
| H1–H3 | the host | D2014 shown before the walk: a published Saturday's FO*, the line raised to 7h, the Leave War still FO* and 1, "1 pending", "Not yet signed", the board's OIL Earn reading the working copy, AL1 → HO* and 0.5 everywhere; H3 reproduced W1's 16-against-14 changes count (`host/`) | 1536 at 125%, 402 WebKit | as ruled |
| W1 S1, S2 (+phone), S4, S5 | W1 | a published weekend's OIL before the change, right after it (both directions), after the next amendment; another day published under the new line; the line put back — every OIL surface (`w1/s1`, `s2`, `s2-phone`, `s5`) | 1536 at 125%; S2 also 402 WebKit | 12 PASS, 2 RECORD (S5's two steps set down), 0 FAIL |
| W1 S3 | W1 | Undo and Redo of the amendment | 1536 | 2 PASS |
| W1 S6 | W1 | the strip: admin and member, one and two settings, Reset (`w1/s6-pc`, `s6-phone`) | both | 10 PASS |
| W1 S7 | W1 | Astra's side question — the open-ended row's assumed hour on a published day (`w1/s7`) | 1536 | RECORD — parked for him, §6 |
| W1 S8 | W1 | the plain-user round: Logic ✎ Edit / Done, a bad value, Undo / Redo of a Logic change, OIL Earn, the person window, the OIL tracker, Balances, the FO*/HO* window as member and admin, View-only (`w1/s8-pc`, `s8-phone`) | both | 8 PASS, 1 brief-wording (§6 W1-3), 5 RECORD |
| W2 N1, N2, N3 | W2 | "On leave + planned" on a flying row and a BRIEFING row; "Downchit + planned" for ATT C and ATT B; every surface that draws a check's name; hide, Undo, Redo, Reset; a member's View-only after publish (`w2/N1`, `N1-phone`, `N2-*`) | both (N3 PC) | PASS |
| W2 N4, N5 | W2 | the crew-rest sentence with the landing blank, TBD, 13:00, equal to the take-off, a 1h30 debrief, Sunday to next Monday (`w2/N4-*`, `N5e-pc`) | N4 both, N5 PC | 6 PASS |
| W2 N6 | W2 | where else the sentence appears: the crew list, the ALL AVAIL window, the tight-turn note (`w2/N6-*`, `N6b-*`) | both | RECORD — as ruled |
| W2 N7 | W2 | the plain-user round, everything opened and closed (`w2/N7-*`) | both | PASS |
| RW1 | the host | the re-walk of the one code fix: a Saturday typed 10:00–10:00 with the report lead 0, published (HO*); the debrief set to 0 — View-only shows no red "no usable times" line, the Leave War keeps HO*, Edit Schedule reads "1 pending" and shows the line marked "new once signed"; after AL1 the published face says it and the Leave War drops the half day (`rw1/`, `scripts/handpass/rcsb/rw1/rcsb-rw1.mjs`) | 1536 at 125% | 4 PASS |

The reference window's fix (Astra's finding 1) changes only the comparison the tests make, nothing in the app: no walk.

## 6. Findings and what was done

**From the walk — no fault in the four rulings.**
- **W1-1, not a fault:** "the four sign-offs fall" could not be seen in the sign-off boxes — they read "— name —" and
  "4 to sign" for the NEXT amendment at every moment, the SIGNED line shows the published version's names. What shows a
  change waiting is "Not yet signed" and the greyed "Publish AL1"; the walker pictured both. My brief's expectation was
  wrong, not the app.
- **W1-2, not a fault:** after Undo and Redo of AL1 the head reads "16 changes" against 14 — the host reproduced it
  (`host/s3`): the two extra lines are "Undo — publishing an amendment" and "Redo — publishing an amendment" in the change
  history, which counts them.
- **W1-3, not a fault:** an admin's tap on an FO*/HO* box opens the bid sheet with the "Where it came from" block, not
  the member's "HO* · approved" window (D1524 is the member's window); older behaviour, untouched by this job — filed as
  an older find for the coordinator to rule whether it should match.
- **W1-4, known (D2013):** at the moment after the Logic change the board's OIL Earn shows the working copy's answer
  (the next amendment's FO or HO) with nothing saying it is not issued yet; the To go out list says it plainly ("OIL as
  published, under today's values"). D2013 rules the working copy shows the next amendment; a word on OIL Earn would be
  something new a person sees — parked as a question for him, not built.
- **W1-5, older:** the Leave War's person window and its OIL tracker do not close on a tap outside on a PC (the standing
  rule of 4 Sep 26 says a click-open popup does); untouched by this job — filed for the coordinator.
- **W1-6, older:** a bad value on the Logic page is refused with "Full-day OIL threshold (worked mins) must be between 1h
  and 12h" — "(worked mins)" is a programmer's phrase; older wording — filed.
- **W1-7 (S7), Astra's side question — parked for him, case first:** on a published Saturday a Common Programme row
  "Briefing", 09:00 with no end, holds ALL AVAIL (45). Published, its window reads "09:00–10:00 · no end time, an hour
  assumed". "Any other row" changed 1h → 2h on the Logic page: the published Saturday's window reads "09:00–11:00 · 2
  hours assumed" at once; nothing reads pending, no AL1 is offered, and nobody earns OIL either way (`w1/s7`). The
  scheduler page's line (D360, the agent's reading) says "a change of that setting on a published day reads pending";
  D2005 says a published day is checked by the settings it was published under — the setting is one of the kept ones
  (`faceattrs.ts KEPT_RULE_KEYS` has `openEnd`), but the ALL AVAIL window draws it with today's. **Recommended:** the
  published day keeps its one hour until its next amendment, as every other kept setting does, and the D360 reading is
  rewritten to say so (no pending mark, since nobody's OIL moves). What waits on it: the window's assumed hour on a
  published face (a small engine change, red-first, and the scheduler page's line). Not changed tonight.
- **W2-1, older:** the crew list draws no crew-rest reason for a man already seated, in any variant, a typed landing too —
  not caused by this job (the list's reason names no landing, roll-call above); recorded.
- **W2-2, older:** Insights cannot be reached from Edit Schedule on a phone (no button; the board has it under ⋯) —
  recorded, filed.
- **W2-3, not a fault:** the Inputs day panel does not close on a tap beside it — a docked panel (D1143), as ruled.

**From the reads.**
- **Opus 1 — FIXED, red-first:** the red "the <line> has no usable times — nobody on it earns OIL for this day" line, one
  of the warnings live on a published face, was worked out with TODAY's "Nominal report before T/O" and "Flight debrief
  after land", while the Leave War credited the day by the values it was published under. A published Saturday typed
  10:00–10:00 (report lead 0, debrief 2h: a half day) showed the red line on View-only the moment the debrief was set to
  0, while the Leave War still credited the half day — the face said nobody earns while somebody did; and the reverse.
  Fixed: the line is judged by the report lead and debrief the day's checks read (the kept values on a published day),
  as D2014 rules for its OIL; a Logic change now raises or clears it only with the next amendment. Tests: three cases in
  `oil-fullday-published.test.ts` (lowered, raised, nothing credited and nothing pending), red before, green after,
  break-tested by removing the fix (3 red). Re-walked: RW1.
- **Opus 2 — recorded, not changed:** the IT flow guide's deck (`scripts/itflow/content.mjs`, two slides) still names
  "On leave + flying" and "Downchit + flying"; the deck is re-made only on his word (D403) — for the coordinator.
- **Opus 3 — FIXED:** two code comments said the opposite of D2014 (`faceattrs.ts`, `oil.ts`); reworded.
- **Opus 4 — folded into a question:** the strip counts the Inputs and SANS late cut-offs as "settings changed", but the
  LATE tag is drawn live everywhere, so the strip's "a published day keeps the settings it was published with" claims
  more than holds for those two. Arguably covered ("for its checks and its OIL" — LATE is a mark, not a check); parked
  beside S7 as one question for him.
- **Opus 5 — recorded:** two old walk scripts (`bta-D-4.mjs`, `ins-a-11.mjs`) match the old name — records of past
  walks, left.
- **Astra 1 — FIXED, red-first (the comparison only):** the reference window — the read-only original app the port is
  compared with — mirrored D2010's words but kept the original's own sum on a landing that is not a time, so it raised
  no crew-rest warning for "TBD" and the comparison was blind to the case; it also kept the two old check names. Fixed
  in `src/testing/refwin.ts`; a new comparison in `parity.test.ts` (blank, "TBD", words, the take-off's own minute, a
  typed landing — the same warning in both, word for word — and the two names), red before, green after. Not a fault a
  person could meet.
- **Astra 2 — FIXED (documents):** `engine-rules.md` and the amendment register's AM7 said OIL is the only way a Logic
  change makes a published day pending; the printed brief lead is the other (D186) — both corrected.
- **The narrow read of the fixes (a fresh Opus):** sound in every path asked (official pass, working pass with and
  without a change waiting, drafts, neighbour weeks, standalone shifts, the publish note, the hide comparison); two
  points — **1 FIXED:** no test drove the case D2014 exists for most (nothing credited, so nothing pending) — the third
  case above, break-tested; **2 FIXED:** a stale comment in `rules.ts` ("the owner's question") pointed at D2014.

**The roll-call's MISSING cell:** the IT flow guide's deck — settled as recorded for the coordinator (D403), not
changed.

**Why the night before read D2014 the other way.** The earlier night (12 Nov 26) wrote, beside D2005, that "OIL stays on
today's settings" (the file map's line for `oil.ts`, and D2005's row: OIL was left out of the day's kept checks
"because it keeps its own values"). Both were about the validator's OIL CHECKS, which do run on today's settings — not
about the credit. The credit has followed the three values kept in the day's OIL block since [OIL-WORK-START] (D592 (4),
5 Oct 26). What a person sees agreed with the misreading in one place: the board's OIL Earn shows the working copy's
answer at once (W1-4, D2013), so a quick look after a Logic change shows the new amount on the board while the Leave
War, Balances, the OIL tracker and the published face keep the old one (`host/`, `w1/s1`, `w1/s2`). The walk's search for
a place where a published day's OIL figure or its warning moves at once with the setting found the figure nowhere and
the warning in one place — the "no usable times" line (Opus 1), now fixed.

## 7. The reads

- **Scenarios:** Astra, designed read only before the build (`docs/superpowers/briefs/2026-11-13-rules-check-small-batch-scenarios.md`).
- **The code reads, blind to each other and to the walk:** Astra (`docs/handpass/parts/2026-11-13-rcsb-read-astra.md`)
  — 2 findings, both fixed; a fresh Opus reader (`…-read-opus.md`) — 5 points: 1 fault fixed, 1 comment fixed, 3
  recorded or folded into a question. Sol 6.1 not called (his call only).
- **The narrow read of the fixes:** a fresh, blind Opus reader (`…-read-fixes.md`) — sound; 1 missing test and 1 comment,
  both fixed.
- Reads owed: none for this job beyond the standing reads-owed list (Sol 6.1's second seat on the published record and
  OIL, his call).

## 8. Cases carried by tests

- D2009: the two names on the Logic page and as the warning's bold name; the four messages unchanged; "Personal input
  clash" unchanged — `src/engine/rules-small-batch.test.ts`.
- D2010: blank, "TBD" and other words; a typed landing and one equal to the take-off keep "landed"; overnight; the later
  end decides in both orders; a ground row ending the day; a 1h30 debrief; the crew list's check; the tight-turn note; a
  midnight landing; a later typed landing beats a blank one; no long-day note — same file.
- D2014: lowered and raised, every surface, Undo and Redo, older versions and Unpublish, another day published under the
  new value, the working copy, a holiday made after publishing, and the five gotcha families (a TBD landing, an empty
  day, changed and put back, the desk deleted, the week off screen and back) — `src/leavewar/oil-fullday-published.test.ts`;
  made to read today's line, 9 of its 11 OIL cases went red.
- D2015: one and several settings, the old words gone — `src/ui/logic.test.tsx`.
- The original's assertions run against the same messages: the reference window mirrors D2010 (`src/testing/refwin.ts`).
- Added after the reads, each red before its fix and green after:
  - the red "no usable times" line on a published day across a Logic change — lowered, raised, and nothing credited on
    the day (so nothing pending): View-only and the working copy keep the published answer until the next amendment —
    the last describe of `src/leavewar/oil-fullday-published.test.ts` (with the fix taken out, all three red);
  - the two engines compared on a landing that is not a time — blank, "TBD", words, the take-off's own minute and a
    typed landing give the same crew-rest warning word for word, and both carry the two new names —
    `src/engine/parity.test.ts`, its last describe.

## 9. Gates

The whole gate set once, after the last fix, on his PC through the checks lock (`gatelock.mjs run`, 13 Nov 26 06:32,
commit `5ec8aec9f`), watched to its end:

| Gate | Result |
|---|---|
| unit | PASS — 832 files, 14,306 passed, 20 skipped |
| build | PASS |
| the original's assertions | PASS — 728 passed, 0 failed |
| browser (e2e) | FAIL — 1,207 passed, 117 skipped, 1 failed: the Leave War's "a month button scrolls the grid to that month" (desktop), September's first date 1.11px under the frozen balance column where the test allows 1px |
| Tracker smoke | PASS — 472 passed, 0 failed |
| rule check | PASS |
| document check | PASS |

**The one red, older and not this change's:** this branch changes no Leave War screen, style or grid code (the engine's
words and OIL checks, the reference window, the Logic page's strip). Run alone five times on desktop and phone it
failed 2 of 5 on desktop; run eight times on the branch's parent (the code before this job, put back afterwards) it
failed 1 of 8, the same 1.1px. The test waits until the distance, rounded, is at least −1 (so −1.5 passes the wait)
and then demands at least −1, so a landing between −1 and −1.5 px fails it now and then. Not changed here (never
weaken a test; out of this job) — filed for the coordinator. GitHub's run of the pull request is the job's full check.

## 10. The Walk line

`Walk: docs/handpass/2026-11-13-rules-check-small-batch.md · 572 pictures · 26 surfaces · 17 orders · MISSING: 0 fixed, 0 ruled, 1 filed (the IT flow guide's deck, D403)`

The pictures: host 37, W1 283, W2 240, the re-walk 12. The orders: the host's route, W1's S1–S8, W2's N1–N7 and the
re-walk. The surfaces: the roll-call's rows walked or pictured (§3), the IT flow guide's deck and the old walk scripts
not counted.

---

# Part 2 — D2028: a published day's row with no end keeps the assumed length it was published under (chat 68, 13 Nov 26)

Laid down at 10:10 on 13 Nov 26, BEFORE the walk: the roll-call's "walked" cells and §11.5 to §11.10 are empty on
purpose until each is done — a blank is a blank, not a pass. The plan: `docs/superpowers/plans/2026-11-13-d2028-open-end-published-plan.md`.
The scenarios (Astra, not the builder): `docs/superpowers/briefs/2026-11-13-d2028-scenarios.md`.

## 11.1 The eight answers and the tier
1 money (OIL, who counts as present): YES — the crowd behind a placeholder decides who earns on a Saturday or holiday.
2 the published record: YES — what a published day shows and whether it reads pending. 3 saved data: YES — the crowd is
frozen onto the issued version at publication. 4 a shared drawer: YES — the OIL block's one reader feeds every surface.
5 a new gesture or mode: NO — no control added or changed. 6 a new surface: NO. 7 roles: NO — nothing about who may do
what. 8 the warning list: YES — the "would earn" and missing-period lines read the same crowd. **Tier: FULL.**

## 11.2 The rulings swept
D2028 (the change). D2005, D2014 (a published day is checked, and its OIL counted, by the settings it went out under).
D2013 (a day with something waiting previews its next amendment under today's settings). D2029 (OIL Earn shows the
working figure only — nothing built). D360, D361 (the assumed hour; such a row earns nobody). D44, D45, D103 (the crowd
frozen at publication; a real change reads pending and the four fall). D98 (back to what was published is no
amendment). D101 (after an Unpublish the withdrawn change waits). D592 (OIL's own values still read pending). D186 (the
printed brief). D482 (Insights' hours stay live). D142, D48 (the credit follows the latest published version). D36 (the
narrow availability window, step to dekit). D56, D785 (what is not a finding). No two of them clash: D2013 and D2028
meet at "does anything wait on the day", and the build takes that line from the validator's own test of it.

## 11.3 The roll-call — every place a published day's assumed length, or the crowd behind a placeholder, is drawn or used
SHOWS = the kept length / crowd while nothing waits. Rows 14 to 23 are Astra's additions to the plan's draft.

| # | Place | SHOWS it | Proved by (test) | Walked |
|---|---|---|---|---|
| 1 | ALL AVAIL window's title — View-only Sched | YES since this build | `published-day-open-end.test.ts` "the window keeps…" | D1, D7 |
| 2 | the same — a look at an older version | YES | the same file, "the next amendment…", "the amendment, clean…" | D3 (a look at the Original) |
| 3 | the same — Edit Schedule and the board, nothing waiting | YES since this build | "the window keeps…" | D1 |
| 4 | the same — a change waiting | MUST NOT, because the working copy previews the next amendment (D2013) | "once something else waits…", "a real change waiting previews today's 3h" | D2, F1, F2 |
| 5 | the window's flags and list | follows the title's interval (one label) | — (the walk) | the list: D1, D2 (Ranger in, out); the flags: not walked |
| 6 | the count chip and list — issued face | YES (frozen at publication) | "premise", "the next amendment…" | D1 (View-only: 45) |
| 7 | the count chip and list — working copy, nothing waiting | YES since this build | "the Logic change alone…", every row kind | D1 |
| 8 | the day's pending count and list, "Not yet signed", the four sign-offs | YES since this build | every row kind (the list and the count, checked twice) | D1, D2, F0–F4 |
| 9 | another placeholder's crowd on the day (a named man on the open-ended row; the step and dekit times) | YES since this build | "another row's crowd", the step and dekit tests | D6 |
| 10 | the day's clash warnings and crew-rest end | YES (D2005's build) | `published-day-logic.test.ts` | not walked — the step and dekit tests |
| 11 | the crew list and seat picker | to see in the walk: nothing waiting reads the kept settings; a placement previewed is the next amendment | — | not walked |
| 12 | OIL Earn's "No OIL worked out — this row has no end time" | MUST NOT change, because it does not depend on the length | `oilopenrow.test.ts` | not walked in this walk |
| 13 | Insights work hours | MUST NOT, because D482 keeps them live | — | not walked |
| 14 | the Leave War's credit, the OIL tracker, Balances — through ANOTHER timed row whose crowd the open-ended row moves | YES since this build (the draft's "must not, such a row earns nobody" was too narrow) | `leavewar/published-open-end-oil.test.ts` (the credit) | D6 — the credit, the tracker, Balances |
| 15 | the "would earn", missing-period and "publish again" lines | YES — the untouched day reads the crowd it went out with | the same file, the sole-earner tests | not walked — the missing-period test |
| 16 | the pending list, publish eligibility, the discard question | agree with the day's count; no setting-only item | every row kind | the list and Publish AL1: D2, D3, F1–F4; the discard question: not walked |
| 17 | working sign-off boxes as against the issued "Signed" line | the boxes stay valid; the line is the version's own | "the four stay" tests | D1, D2, F1 (the picture shows both) |
| 18 | the window open while an edit is made behind it | title, flags, people and chip move together | — (the walk) | D2 |
| 19 | a saved plan's preview; a version loaded onto the working copy | the loaded-version test; a saved plan: the walk | "the original loaded…" | not walked — the test "a version loaded onto the working copy and back" |
| 20 | the next-week preview (View-only: the issued version; Edit Schedule: the working copy) | `weekctx.ts` builds under the day's own settings (D2005) | `state/kept-rules-neighbour.test.ts` | not walked |
| 21 | a member's count window | the same issued interval and people, no earning controls | — (the walk) | D7 |
| 22 | print and CSV | the title is not printed; the count is the frozen one — to confirm in the walk by what each emits | — | D9 — must not: neither draws a Common Programme row (flying lines only) |
| 23 | after a reload, a week change and back, Undo and Redo | the settings are laid again by each check | "the day read back as new objects" | D1 — a reload, a week change, Undo, Redo |
| 24 | the IT flow deck, the Logic page's lines for "A sim" / "Any other row" | words only — to read once the records are written | — | the Logic strip: D1; the deck: not read |

## 11.4 The five sizing lines
Written 13 Nov 26, 10:15, by the host (Fable 5.2 in Opus's place this week, D1972) before the walker started.

1. **The type of change — A, G, D.** A: one rule inside shared calculations (which settings a published day's
   placeholder crowd and its assumed length are read under). G: it changes what a published day shows, what reads
   pending and what a sign-off is checked against, across publish, an amendment, Undo, a reload. D: the title and the
   crowd are drawn in several places by separate code (View-only Sched, Edit Schedule, the board, a look at an older
   version, a member's view, the Leave War's credit).
2. **What only a walk could find.** Whether each PLACE that draws the window and its count shows the kept hour (the
   tests ask the engine and the window's builder, not the three pages); the pending count, the sign-off ticks and the
   publish button as drawn; a real reload and a week change, which hand the app new day objects (the kept settings
   ride outside the saved day — a test pins it with copied objects, a browser proves the real path); Undo / Redo from
   the top bar; a placeholder put on an extras line and as a sim passenger through the app's own controls; a real
   leave filed through the Inputs window; the Leave War grid, the OIL tracker and Balances after a real publish; the
   window left open while the day changes behind it; the phone. What the tests and the reads already carry: §11.8,
   and the nine questions of the read brief.
3. **What the ledger says.** Four earlier walks carry both A and G. Last night's walk of this very branch (two
   Sonnet walkers, 572 pictures) found no fault; its one fault came from a read, in a place the roll-call had not
   listed — so this roll-call was redrawn from Astra's scenario design first (24 rows), and the walk is aimed at the
   rows whose "Walked" cell is blank, not at repeating what the tests prove.
4. **The walk chosen.** ONE Sonnet walker (D787), eleven scenarios (D0–D10 of
   `docs/superpowers/briefs/2026-11-13-d2028-walk-brief.md`), desktop 1536 × 864 throughout and his iPhone's 402 × 874
   on his case, the preview, the member's view and the plain-user round; no size beyond those. Carried by tests and
   not repeated on screen: the three-version chain 1h / 2h / 3h, the dekit and step times, the length made shorter,
   a real end typed and cleared, Unpublish and publish again, the missing-period warning — each named in §11.8 with
   what it proves. The host then opens every deciding picture and repeats every difference itself.
5. **After the walk:** its row goes into `docs/walk-ledger.md` before the closing report.

## 11.5 The orders walked

One Sonnet walker on the build BEFORE the reads' fix (`index-DPKf-mls.js`), then the host on the build AFTER it
(`index-DfSavxWy.js`, built 10:27). A desktop (1536×864) and a phone (402×874, the WebKit test browser). Scripts:
`scripts/handpass/d2028/` (the walker's `d-00` … `d-14`; the host's `d-20-fixwalk`, `d-21-probe-phonechip2`). Pictures:
`docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/`.

| Order | What was done | Desktop | Phone |
|---|---|---|---|
| D0 | the fixture tells the lengths apart on an UNPUBLISHED day: 1h → 42 with Ranger, 2h → 41 without | as expected | — |
| D1 | his case: Saturday published and signed again; "Any other row" 1h → 2h; then straight back, Undo, Redo, a week change, a true reload | View-only, Edit Schedule, the board: "09:00–10:00 · no end time, an hour assumed", 45, Ranger listed, every time; ORIG, nothing pending, the four signed | the board: the same. The week's two pages: the window read by a plain click (the finger tap is W2) — an hour, Ranger listed (host, `d-21 logic`) |
| D2 | a remark typed on the SDO desk with the window open | the window turns to "09:00–11:00 · no end time, 2 hours assumed", 44, no Ranger; View-only keeps 45 and an hour; "Not yet signed", the four blank; remark deleted → back to 45, an hour, signed | the board: the same |
| D3 | the amendment published | all three: 2 hours, 44; a look at the Original: an hour, 45, Ranger | the board: the same |
| D4 | the sim twin: "A sim" 1h30 → 3h, ALL AVAIL on an OFT seat | View-only and Edit Schedule: "09:00–10:30 · no end time, 90 minutes assumed", unchanged, nothing pending. The board's front-seat count could not be pressed (W1); the board's sim seat is read in D5 | — |
| D5 | ALL AVAIL on a ground row, a duty desk, the Common Programme extras and a sim rear seat; Logic 2h and 3h | every count and title unchanged on all three pages | — |
| D6 | OIL through another row, on the Leave War: Ranger named on the open-ended row, ALL AVAIL on 10:15–17:15 | Logic change alone: his FO, OIL 1, tracker 1, Balances 1 all stay; a real change + AL1: his box empty, 0, 0, 0; another man's stays | — |
| D7 | a member on View-only | 45, an hour, Ranger, no OIL controls | by plain click only (W2) |
| D8 | a real leave filed | NOT DONE by the walker (it stopped at the "No document" question) — carried by the Leave War test "a real leave still reads pending" and by D2 / D6's real changes | — |
| D9 | print and CSV | neither draws a Common Programme row at all: both list the flying lines only (roll-call row 22: must not, because there is nothing of the row in either) | — |
| D10 | the plain-user round: the count opens the window, ✕ closes it, a press behind it leaves it up | as written; Escape does not close it — as the contract says (a window, not a pop-up) | the board: the same |
| F0–F4 (host, the fix) | Logic change alone → an unrelated remark → a second man really busy → Undo and the remark cleared → the remark again and AL1 | nothing waiting → "2 pending", the list reads "Briefing · who it stands for: Ranger → no longer free" → "3 pending", "Ranger, Piston → no longer free" → nothing waiting, signed, an hour, Ranger back → AL1 out, nothing waiting, 2 hours, no Ranger | the same, step for step |
| M0–M1 (host, the fix) | Ranger's row published at 09:30–09:45, Logic 2h, the row moved to 10:15–10:45 | the list shows the row's start and end only — no line about who the puck stands for | — |

## 11.6 Findings and what was done
*(from the reads so far, 11:05; the walk's are added when its report is in)*

| # | From | The finding | Real? | What was done |
|---|---|---|---|---|
| R1 | the fresh Opus read, findings 1 and 2 | With the Logic length changed AND something else waiting on a published day, the pending comparison counted the crowds under the old settings while the screen and the amendment used today's: an amendment could take a man's OIL with only "renamed" listed; or the list carried "What this day earns: changed" for nothing | REAL — both reproduced red by the host (3 tests) | Fixed red-first, `f4d7e8195`: `publish.ts crowdSide`, `validate.ts faceWaits` (one body with `untouchedKept`), `HOOKS.faceWaits`; 120 related files, 2,028 tests green. To walk on the fixed build. |
| R2 | Astra's read, finding 1 (P2) | The pending line's WORDS were read under today's settings while the comparison used the old: a real departure was worded with a Logic-only one beside it; "No OIL earned" switched on was worded as a man "no longer free" | The mismatch: REAL, the same cause as R1, closed by R1's fix the other way round (both now today's once anything waits — Astra's own fix, the words under the old settings, would have re-opened R1). Pinned: "a real departure beside the one the new length makes…" | Its first case leaves an OLDER gap, not D2028's: an OIL Earn decision made beside any crowd change is not said in the list — filed for his ruling with a picture, [OIL-LINE-DECISION-HIDDEN]; the facts pinned ("No OIL earned switched on after the Logic change…"), the words not. |
| R3 | the Opus read, tidiness | `oilEvidence`'s third argument has three meanings; `keptRulesOf` doubles `keptOn`; the `oil.ts` header misleads | Filed, not fixed (D489) | The foot of `…-d2028-read-opus.md` |
| R4 | the narrow fresh Opus read of the fix (`docs/superpowers/briefs/2026-11-13-d2028-read-fix.md`), finding 1 (P2) | A man free over the length the day went out with and busy over today's longer one joins the crowd after the Logic change, nothing else waiting: the day reads pending, the four fall, the line is the vague "What this day earns: changed", the window shows no change and the amendment changes nobody | REAL — the reader's proof run red by the host. Two of his rulings pull apart here (D45: acknowledge a crowd change; D2013: the preview is today's) | Kept as built — it over-asks, it never hides; nobody's OIL and no record is wrong. FILED for his word: `[CROWD-TIE-KEPT-LENGTH]`. No route through the app's own controls found |
| R5 | the same read, finding 2 (P3) | two of the new tests pass on the code before the fix | REAL | their comments now say "a guard, not a pin"; the pins are the block's first two tests and the Leave War pair |
| W1 | the walk, difference 1 | On the board (desktop), ALL AVAIL in an OFT row's FRONT seat: its count is drawn inside the empty rear seat's "+", so a press arms that seat and the window does not open | REAL — the host opened the picture (`d2028/probe-simchip-pc/p-1-after-press.png`). Older: this job changed no layout | FILED: `[SIM-COUNT-OVER-SEAT]` |
| W2 | the walk, differences 2 and 3 | On a phone, a finger tap on the count on View-only Sched opens nothing; on Edit Schedule it arms the row | The open item `[COUNT-CHIP-PHONE-TAP]` (fixed for Chromium 1 Oct 26, his iPhone look owed), met again: in the WebKit test browser the touch lands on the count and the click on the puck's name beside it; a plain click opens the window (host, `d-21`) | A dated line added to that item — his iPhone look is still the proof |
| W3 | the walk, difference 4 | Escape does not close the ALL AVAIL window | NOT a fault — `ui-contracts.md`: it closes on ✕, a page or week change, a sign-in; never on Escape | — |
| W4 | the walk, difference 5 | print and CSV carry no Saturday Briefing row | NOT a fault — both list flying lines only; the walker's print capture was also cut short at Monday | roll-call row 22 answered |
| W5 | the host, on the fix walk's picture | the changes window prints "Tap a change to go to it." twice, under the list and at its foot | older, words only | added to `[RULES-BATCH-OLDER-1113]` |

## 11.7 The reads
The brief, word for word to both: `docs/superpowers/briefs/2026-11-13-d2028-read-brief.md`. Started 10:05, before the
walk, because the walk waited on the checks lock; the walk is done before the reads are closed, and a fix is re-read.

## 11.8 Cases carried by tests
`src/published-day-open-end.test.ts` (23) and `src/leavewar/published-open-end-oil.test.ts` (8). Run against the code
before the fix (the five source files at `f80b5804b`): 19 of 23 and 4 of 8 red there; the 8 that stay green are the
premises and the "kept as it is" halves (a real change still reads pending), which is what they are for. Not carried by
a test, so the walk's: extras and passengers, a real leave filed through the Inputs window, Undo / Redo from the top
bar, a true reload, a saved plan switched in, a weekday made a holiday.

## 11.9 Gates
On his PC under the checks lock, 10:43–11:05, 13 Nov 26, on `69df33885` (the code as `03b028e69`; only the block after it): unit 14,342 passed, 20 skipped, 834 files; build; the original's 728 / 0; the Tracker's 472 / 0; the rule and document checks pass; the browser tests 1,207 passed, 117 skipped, 1 FAILED — the Leave War's "a month button scrolls the grid to that month" on desktop, 209.89 against 210, the same tenth of a pixel as the night's run on this branch's parent, no Leave War code touched (`[RULES-BATCH-OLDER-1113]`); run again alone three times: 3 passed (D84). `npm run lint:changed`: no new finding. Not run: `probes:adapted`, `perf` — no layout changed. No GitHub run: the branch has no pull request.

## 11.10 The Walk line
Walk: `docs/handpass/2026-11-13-rules-check-small-batch.md` §11 · 369 pictures · 24 surfaces · 18 orders (D0–D7, D9, D10, F0–F4, M0–M1; D8 not done, carried by a test) · MISSING: 0 fixed, 0 ruled, 0 filed
