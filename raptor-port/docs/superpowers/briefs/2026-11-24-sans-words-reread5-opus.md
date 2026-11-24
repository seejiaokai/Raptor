# Round 5 — the fresh, blind Opus read (24 Nov 26, chat 169)

Read: `BRIEF.md`, `FIX.diff` whole, `FIXES-CLAIMED.md`, `READS/round4-*.md` (for the cases only), D2560/D2561/D2564/D2565/
D2566's full rows, and the whole of the files the fix touches or leans on: `leavewar/sansunfiled.ts`, `engine/avail.ts`
(dayEngaged, daySansSeats, slotRules, slotBar's SANS block, sansGate), `engine/events.ts buildDay`, `engine/validate.ts`
(sansChecks), `engine/waves.ts` (saExempt, saFlies, scSpare, saDeskFlies), `engine/overlay.ts` (viewOfWeek, its reconcile,
land and deleted-man strip, the signatures), `engine/weekstash.ts stashDays`, `engine/inputs.ts` (sansAvailOn, inputsOn,
dateOrd, inputCoversDate), `engine/weeks-data.ts weekDatesAbs`, `state/perms.ts` (ownershipViolation, ownershipChecks,
adminOwnerViolation, the member branch), `state/noticeseen.ts`, `command/commit.ts`, `undo/timeline.ts` (restore,
NOT_STEPS), `leavewar/sync.ts` (takeBack, forgetRead's two callers), `ui/peek.ts peekKey`, `state/units.ts homesSignature`.
I did not read `HANDOFF.md`, `r5-astra/` or `r5-sec/`.

My tests: `raptor-port/src/r5-opus/r5-opus.test.ts` — **12 cases, all green** (each a claim of the round put to a case the
builder's files do not hold; a red one would have been a finding). The builder's four new files and the 27 older files
the round re-pinned also pass here: **31 files, 441 tests, green** (`src/leavewar/sans*`, `sansplan-sec156`,
`units-sqn-fixread2`, `opus-read-147`, `sec147-read2`, `astra-c147-reread`, `src/ui/peek*`).

---

## Findings

**None.** I found no case where the reminder names a day D2564 leaves out, or misses one it covers; no write of a read
record by anyone but its owner through any door the app has; nothing in the week-change speed fix that keeps a reading
too long. Two questions and two older points follow.

---

## §3.1 — does each fix close its finding

| Round-4 finding | Verdict | Evidence |
|---|---|---|
| **SEC-R4-1** — the projection door (and an admin's command of any type) rewrote another man's read record | **CLOSED** | The new block in `ownershipChecks` runs before every role's early return and asks every actor — the system actor of `commitProjection`, an admin of any command type, a forged `restore` — that the row is `noticeseen:<his own person>`. The honest paths all reach it as their own person: a tap and "Mark all read" (`noticeseen.ts write`, the signed-in man's row); `forgetRead` after Undo post out (called after the command lands, as the presser, own row — both callers in `sync.ts`); `notices.seen` is never an Undo step (`timeline.ts NOT_STEPS`), so a Redo or an Undo never carries a read record. A member's own row by another command type is still refused by the member branch, as before. One narrowing to decide on purpose, not a finding: Q1 below. |
| **R4-O1** — next-week preview kept a moved man's request | **CLOSED** | `peekKey` now carries `landingSig()`, which adds the homes (`homesSignature`, rebuilt with every new set of rows, Undo's reload included) to the three parts it had. The builder's case with the Undo of the move passes. |
| **Astra round-4 F1** — a change of week re-read every held week | **CLOSED** | The held reading is keyed by its saved copy, the men deleted and the squadron in view. I checked each step `stashDays → viewOfWeek` takes: the reconcile and the landing touch `d.ground` only (`placeRequestRow` pushes onto `ground`; `requestRowFields` writes a ground row), and the only step that reaches a seat or a sim is the deleted-man strip (`stripPersonFromDay`), which reads only the deleted man's id and cutoff — in the key. The day's label was the only thing the week on screen gave, and `sansAvailOn` is now asked by `weekDatesAbs(k)`, which always carries its year (`dateOrd` reads the year from the label; records carry `yr`). What he filed is asked afresh every time (only `daySansSeats` is kept). My case "a saved week opened on screen and left again with nothing changed" names the day once each way. |

## §3.2 — D2564 built as ruled

**One definition, three readers — where they can disagree.** `daySansSeats` follows `buildDay`'s own collection line for
line: a cancelled formation or row is skipped in both; an SC SPARE (`f.spare` or `a.spare`) and a whole AVALON / BB wave
stand by in both unless the row flies (`saFlies` — B or R typed, or a row ticked by hand), and then count in both; every
sim row's `p`, `w`, `pax` and `more` count in both. I put the cases §3.2 names that the builder's twelve rows do not hold
to all three (definition, checks' collection, his reminder) — all agree:

- an AVALON row ticked Flies by hand → the day; an AVALON shift with its B typed → the day; an AVALON wave standing by
  with no times → no day;
- an SC SPARE whose shift flies (B typed) → the day, and an armed seat there strikes him for nothing filed (the crew list
  agrees: `scSpare` is false for a flying row);
- an extra dropped under an AMT box → the day; an AMT BRIEF row naming him → the day (the checks ask it as an AMT entry);
- a cancelled AMT box with him as a passenger → no day;
- AVALON's desk while its wave flies (D1997 checks the desk fully) → no day — the checks never ask SANS of a desk either;
- a seat on Thu 16 Jul, the day before his SANS date → no day (both ask `sansOnP`).

The armed seat differs from the reminder in exactly the builder's two stated readings (R1: no times — the crew list asks
only with a window; R2: a cancelled line — the crew list still strikes). One thing worth saying plainly: "the same the
warning reads" can only mean the same *places* — the warning list never raises anything for "nothing filed" (`sansGate`'s
`none` is deliberately silent in `validate.ts`); it raises only "not offering" or "outside the window".

**Ground rows, desks, all hands.** Nothing else reaches the reminder: every reader of "planned" for the line goes through
`sansUnfiledDays` (the line itself, the begin-of-command note, the take-back's `days` check), and that asks
`daySansSeats` alone. `dayEngaged` keeps its other callers (the crew list's fade, ALL AVAIL, the war's walk), untouched.

**Another squadron's week:** only his home squadron's saved weeks are read (`stashKeys` is the unit in view's, and a man
whose home is not the unit in view gets nothing). A seat on another squadron's week is not seen — older, the same as
before this round (below).

**After Undo/Redo, a home move, a New Year week, a week first worked on while on screen, a seat placed before saving:**
the week on screen is read from the live days on every change (its kept list is rebuilt each change); a saved week is
re-read when its saved copy changes (an Undo or Redo of a seat on it rewrites that copy) or a man's deletion changes; a home
move changes nothing a seat reads and the line's squadron test (`homeUnitOf(pid, today)`) is asked afresh; the New Year
case is the builder's, green, and my reading of `weekDatesAbs` / `dateOrd` agrees.

## §3.3 — the permission gate

Only a man's own row passes, whatever the actor or the command type, for the `user`, `projection` and `restore` origins.
Nothing newly open through any door the app has. One narrowing, as a question:

**Q1 (question, no failure today) — `remote` and `seed` are not asked, and the squadron check for them went with the
removed branch.** Before round 4, `adminOwnerViolation` refused an admin's write of another squadron's man's
`noticeseen:` row whatever the origin. Round 4 put the rule in `ownershipChecks`, which skips `remote` and `seed`, and took
the `noticeseen:` branch out of `adminOwnerViolation` — so for those two origins an admin's write of any man's read record
is now let through (pinned, green: "Kestrel (149's admin) as a 'remote' change of Hex's read record: let through now";
the same envelope as `user` is refused). Nothing in the app raises either origin today (no caller of `commitAs` passes
them, and `command/index.ts` does not re-export it), so there is no concrete case. For the database step: decide on
purpose whether another device's change of a read record is trusted whole, or asked "his own row" like the rest — a line
for `handover-dataverse.md` beside the "merged, never replaced" note round 4 already raised.

## §3.4 — saved data

Every write in the round goes through the command layer: the read record only through `notices.seen`; nothing new is
stored by the reminder (`daySansSeats` and the kept readings are memory only). Nothing is removed but what the fix names
(the `noticeseen:` branch of `adminOwnerViolation`, which only an admin's own row could still reach). The two older
assertions whose wording changed still assert a refusal "as a read record" — not weakened; one new line widens one of
them.

## §3.5 — speed

- **A change of week, a request filed or deleted, a home changed:** no saved week is read again (the builder's counts, 0;
  my reading of the key agrees). Rebuilding the list each change costs a key listing, a string compare and
  `weekDatesAbs` per held week — negligible at 40.
- **What still re-reads them all:** the first reading, a change of squadron in view, and **any person deleted** (the men
  deleted are in the key whole, so one delete re-reads every held week, and each read runs the cross-week row search —
  the ~14,000-parse, ~150 ms figure Astra measured, once per delete). Rare, correct, acceptable; noted, not a finding.
- **The preview key:** `landingSig` adds only the homes' signature, memoised per set of rows — no new cost between changes.

---

## R1 and R2 — the builder's two readings

- **R1 — a flying seat or sim box with no times typed yet counts.** Follows D2564's words ("in a flying seat or a sim …
  with nothing filed": he is in the seat), and D2566's "as soon as planned" for the ground line points the same way. It
  would not surprise him: a scheduler building the week usually seats crews before typing times, and the man is told the
  day he will be needed. The crew list does not strike such a seat (it judges only against a window), so the two differ
  here — but in timing, not in scope. My judgement: keep; put it to him as a one-line confirmation, not a question that
  holds anything.
- **R2 — a cancelled line or box never counts.** Follows D2564's words in substance — a cancelled sortie or sim is one
  nobody flies or sits — and agrees with the checks, which skip it. The crew list's strike on a SANS man armed onto a
  cancelled line is the odd one out and older than this job; it is the crew list saying something the warning list will
  not. My judgement: keep R2; the crew list's cancelled-line strike could be filed as a small older item (whether arming a
  cancelled place should ask SANS at all) — its own question for him with a picture, not part of this job.

## Older, said so it can be weighed (not counted)

- The reminder reads only his home squadron's weeks, so a seat a detachment's other squadron gives him is never named.
  The same before this round (the old read had the same weeks).
- The crew list's SANS strike on an armed cancelled line (R2 above).

## Tidiness note (D489 — filed, never fixed)

1. `leavewar/sansunfiled.ts`, the weeks-held header's last sentence: "(leavewar/sans-planned-r5.test.ts counts the reads
   and holds each answer to a fresh one)" — the counting cases are in `sans-held-weeks-r5.test.tsx`; the planned-r5 file
   holds the three-reader agreement. A wrong pointer.
2. The same header is now six stacked "…AND / …BUT NOT / …AND SINCE" paragraphs, each undoing part of the one before; the
   key it describes is now two parts. The history belongs in the commits; the comment could state what the key is and why.
3. `weeksHeld` returns a four-part tuple (`[week, days, named, labels | null]`) read by position in one place — a small
   named shape would read more plainly.
4. `command/commit.ts` says "`commitAs` stays unexported", but it is exported (only `command/index.ts` leaves it out) —
   older, and the reason Q1 has no door today.

---

**0 findings; 1 question for the database step (Q1), 2 builder readings judged (keep both).** Nothing to fix first; if
anything is taken up, Q1's line in the database handover, then the wrong test pointer (tidiness 1).
