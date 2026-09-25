# What changes a PUBLISHED day's face when an input goes in — the sweep (25 Sep 26)

**Why this exists.** His question with D177 ("Question 2 yes. Is there anything else that does this too? Like change the
published schedule when an input goes in"). A read-only sweep of the code (an Opus helper, 25 Sep 26), with A0, A1, A5 and
A6 checked first-hand by the host (A0 in a unit probe — a leave filed after publishing shows on View-only Sched with 0
pending; A1 read in `publish.ts filingSame`; A5/A6 read in `html.ts dayInfoHTML` and `board.ts`). **This is the scope of
`OUTSTANDING.md` `[LEAVE-LATE-PUBLISHED]` (D177's own branch)** — nothing here is built yet. Every line numbered as of
`claude/request-one-row` @ 4947c004.

## (A) Leaks — the issued face changes, nothing pending, the four stand
| # | where | what a reader of the published day sees change | triggered by |
|---|---|---|---|
| A0 | `ui/html.ts dayHTMLBody` — the Unavailable block (with `inpTimeCells`, `inpRmkCell`, `lateTag`); also the edit week's preview of an issued AL | rows appear / vanish; times, type, person, remarks and the LATE badge read live | any leave / OD / course filed, edited, deleted or re-dated after publishing; the drag of an input to another person (`inputedit.tsx reassignInput`); a Leave War approval or its remarks editor; an Other / activity request filed "→ Unavail" |
| A1 | `engine/publish.ts filingSame` / `filingDelta` — a leave (or any never-actioned input) that EXISTED at publish, since deleted or re-dated off the day | its Unavailable row AND its warnings vanish from the issued face; 0 pending, four stand (the official pass cannot see an input that no longer exists) | deleting / re-dating a leave, OD or course — D177's mirror |
| A2 | `publish.ts dayFilingFingerprint` freezes only the filing STATE, not an input's values; `weekctx.ts filingDiffers` compares membership and state only, so the official pass reuses the working copy's warnings | issued warnings appear, clear or change their words (LEAVE_FLY / DNIF_FLY, input-vs-flight clashes, brief/debrief clashes, crew rest from inputs, SC SPARE / AVALON checks); the ⓘ issues list and the ALL AVAIL window's reasons with them | editing an input's times, all-day, type, person, span or remarks after publishing — the known open item AM-04 (`OUTSTANDING.md` `[AMEND]`) |
| A3 | `validate.ts` SANS advisory via `avail.ts sansGate` / `inputs.ts sansAvailOn` | the amber ring, "A" chip and "not offering Fly today / available hh:mm only" follow the live SANS offers | a SANS Availability filed, edited or deleted after publishing |
| A4 | `html.ts plRow` / `lateTagOf` / `srcInput`; the board's `sbGroundPanel` | the LATE badge on an issued request row appears when the request is edited after its deadline, vanishes if it is deleted; tooltip dates live | editing / deleting an accepted request |
| A5 | `html.ts dayInfoHTML` — `dayOff` / `availByWave` (`avail.ts dayAway`) | the ⓘ panel's "Leave / downchit" and "Free all day" counts move (the rest of the panel replays the issued version) | leave, OD, courses; accepted flying-type inputs |
| A6 | the scheduler board showing an issued version — `board.ts` (the `dayInp` panels), `board-html.ts sbInputsGroupPanel`, `sbUnavailPanel`, `sbSansPanel`; `sbInpRow` uses the working copy's warning rings | the Personal Inputs, Unavailable and SANS panels are fully live, and the pucks in those rows wear today's working-copy rings | every input kind |
| A7 | `events.ts shiftHardGround` grades an issued landed row's clash with an SC MAIN shift by the LIVE request's type | retyping an accepted request can flip that clash red ↔ amber | retyping an accepted request |

**Confirmed from another side (Astra's read of D176, `docs/handpass/2026-09-25-d176-astra-read.md` finding 1):** a request
LIVE when the day was published (its record holds it '' — waiting, flagging) that is later deleted, re-dated off the day
or edited (person, type, times) reads 0 pending and keeps the four, while the published face (which reads live inputs)
changes — A1 and A2 above, reached through a request instead of a leave. Its fix steps are there: membership-aware
equality allowing ONLY D174's absent↔'r' and D176's 'r'↔absent; a frozen per-version projection of the inputs the issued
face reads; value changes into the pending comparison and the signature.

**And one rule for the validator too (Astra's D176 read, finding 2; Fable noted it as cost only):** the official pass's
own gate (`engine/weekctx.ts filingDiffers`, via `validate.ts officialDiverges`) is membership-aware but does not know
D174's absent↔'r' or D176's 'r'↔absent, so such a day forces the second validation pass on every edit — no wrong screen
(the pass reads the frozen 'r'), a cost the same day already paid on `main`. When this branch makes filing equality
membership-aware, ONE pure helper should serve `publish.ts` and `weekctx.ts` both, with pins on `filingDivergesAt`.

## (B) Live on purpose — keep, unless he says otherwise
| # | what stays live | why |
|---|---|---|
| B1 | medical downchits (HL, OML, ATT B, ATT C) and upchit trims — warnings, Unavailable rows, the ⓘ count | a safety fact, never versioned (`events.ts inpShow`, `validate.ts`); D177's stated reading |
| B2 | qualifications and rule settings (not inputs) — warnings | `engine/official-flags.test.ts` §4 |
| B3 | the view page's "Working draft" choice | the working copy under a banner and stamp, by design |
| B4 | a scheduler's own "hide this LATE mark" | per browser, by his 21 Aug 26 ruling |
| B5 | an input filed on an UNPUBLISHED neighbour day (or the week before) adds / clears a published day's issued warnings — midnight tails, crew rest, the 7-day run | `world.ts fileAcc`: a date never signed reads live. **By design, yet it moves an issued face with nobody acknowledging it — worth putting to him under D45** |
| B6 | the Leave War calendar's OIL advisories on a published day | `validate.ts` ("keeps saying so after publication") |

## (C) Correctly frozen (short)
Day content incl. request rows (`withDaySnap`, `dayIssuedHTML`); official warnings against new / re-filed inputs
(`world.ts fileAcc`, `events.ts inpShow`, `validate.ts withIssuedWeek`); a new activity request lands on the working
copy only (`slots.ts autoAcceptInput`); OIL figures, the ALL AVAIL count and crowd; the pending count is hidden on the
issued face; the board preview hides Available crew; the view page never draws SANS, Personal Inputs or Available crew;
print and CSV read the published days.

**Outside the question, noted:** the desktop next-week preview on the view page shows next week's working copy even for
published days (`peek.ts`); the ⓘ panel opened from the board's preview reads the working copy.
