# Text that DOES something

Most boxes in RAPTOR are free text the app never reads. A few are not: type
the right word and a rule turns on. This file collects every one of them in
one place, because they are otherwise scattered across
`docs/engine-rules.md` and impossible to discover by using the app.

**Written to be lifted into the user guide** (owner asked, 10 Aug 26 — a guide
for users and admins is wanted eventually, and this is the half that cannot be
worked out by looking at the screen). Each entry says what a scheduler types,
what happens, and where the rule lives.

Keep this true. A new text trigger that is not listed here is a trigger nobody
outside the code will ever find.

---

## The seat tags — `1A:` `2A:` `1B:` `B:`

Every flying line's **RMKS** box belongs to one aircraft already. Inside it,
a tag says which SEAT the note is about:

| Typed | Means |
|---|---|
| `1A:` `2A:` `A:` | that aircraft's **front** seat (the pilot) |
| `1B:` `2B:` `B:` | that aircraft's **rear** seat |
| no tag at all | treated as the **front** seat |

**The number is ignored.** `2A` reads as "second jet, front seat" to a human,
and the seed data follows that convention — the top row is tagged `1…`, the
second `2…` — but the app knows which aircraft you are on from the box you are
typing in. It only reads the `A` or `B`. Typing `2A:` into the FIRST jet's box
applies it to that jet, not the second one.

**The one trap:** the tag is detected as *"an optional digit, then A or B, then
a colon"*, and that shape turns up inside ordinary words.

- `AREA: EAST, AAR` — harmless. `AREA:` ends in `A`, so it reads as a
  front-seat tag, and front is the default anyway.
- `SUB: AAR` — **the AAR is lost.** `SUB:` ends in `B`, so everything after it
  is read as rear-seat text, and the rear seat is dropped outright (a WSO holds
  no refuelling currency). Put the AAR *before* such a word, or tag it `1A:`.

Rule: `engine/people.ts` `aarNeed`. Byte-identical to the original app and
frozen by the reference test suite, so the trap is recorded, not fixed.

---

## Air-to-air refuelling — in a flying line's RMKS

| Typed | Means |
|---|---|
| `AAR` | this line is refuelling. **Day or night decided by the wave**: night if the wave is a night wave, otherwise day — no clock is involved (owner, 21 Aug 26) |
| `DAAR` | day refuelling, whatever the clock says |
| `NAAR` | night refuelling, whatever the clock says |
| `NO AAR` `NO DAAR` `NO NAAR` | cancels it — asks for nothing. Hyphens and dashes are tolerated (`NO-AAR`, `NO – DAAR`) |

Written after other text is fine: `PRI LSR, AAR` and `2A: BFM-5, AAR` both
read correctly. A rear-seat (`B:`) mention is always ignored.

**What it then checks.** If the front-seater is not current for what was asked:

- a back-seater cleared to **instruct** that refuelling (an `I` on his DAAR or
  NAAR in Quals) → nothing. That is a legal training sortie.
- an instructor pilot **without** that clearance → red `Q` on both crew.
- nobody who could teach him — empty back seat, a WSO, a non-instructor →
  red `Q` on the front-seater.

Rules: `docs/engine-rules.md` §AAR, and who may teach it.

---

## The In-time / Rally lines — at the top of a wave

*(Since 6 Oct 26 — D591, D592: on a weekend or public holiday the line's report also starts the OIL day of the men on
that formation's flying line; with no readable clock the nominal report does. `engine-rules.md` §Weekend/PH work earns OIL.)*

Each free-text line carries its **first valid clock** and its activity. These
rules include the original in-time spellings and the approved Rally extension
(D497–D507, narrowed for publication by D509). Words and remarks stay as typed.

| Typed | Means |
|---|---|
| `0900 IN TIME`, `09:00 IN-TIME`, `0900H INTIME` | in-time at 09:00; labels, callsigns and H/L suffix are case-insensitive |
| `0900 RALLY` | rally at 09:00; rally supplies the report when no in-time applies |
| `0900 IN TIME + RALLY` | both activities at the same first valid clock |
| `RALLY AFTER IN TIME` or `RALLY AFTER IN`, with no clock | immediate rally at its applicable in-time; it never adds another minute |
| `0830H: VL RALLY AFTER IN TIME` — the same words WITH a clock | VL's rally at 08:30 and nothing else: it is never a second in-time, so the whole-wave in-time still starts VL's day (D505; the Codex stack check's W3, 5 Oct 26) |
| `0900` `09:00` `0900H` `09:00H` `0900L` `09:00L` without a recognised activity | the legacy unlabelled in-time |
| `0900 RALLYING` | also legacy unlabelled in-time: RALLYING is not the bounded word RALLY |
| `0900H: RU RALLY`, or a formation name in remarks | that activity applies to this wave's named formation; only its own formation callsigns are recognised |
| no recognised formation name (`0900H: IN TIME + WX/NOTAMS`) | wave-wide fallback for that activity |

Formation recognition scans the whole line, including remarks, with word
boundaries; personal callsigns and role names never select people. A formation
line overrides wave-wide lines **separately for each activity** (D505): specific
RALLY does not erase wide IN TIME, and specific IN TIME does not erase wide
RALLY. Several applicable lines of the same activity choose the **earliest
resolved instant**, including specific duplicates, whatever the row order
(D506). The first valid clock wins even if a later clock appears in remarks;
`FL240` and `1330Z` are glued tokens, and impossible `2590` is skipped.

**Reporting day (D503):** a reporting clock later than that formation's take-off
means the immediately **previous day**, at most one day back. For take-off01:00,
`2200 RALLY` means22:00 the previous evening. Each formation resolves against
its own take-off before duplicate minima are compared. The earliest applicable
IN TIME/RALLY supplies report; an earlier qualifying commitment can still start
that person's working day/rest anchor. With neither instruction, the existing
step fallback stays. Crew rest, actual work hours and long-day notes read that
report; busy windows and nominal OIL retain their separate timing meanings.
Typed qualifying commitments count, but Personal/SANS offers, leave, medical
and all-day inputs do not become earlier rest commitments through these words.

**Feedback and warnings:** present stages run IN TIME → RALLY → brief → take-off
→ landing; equality is legal. `REPORT_ORDER` names an actual reversed pair as
a red warning; a blank B is checked and named as the **suggested brief**.
`REPORT_UNRESOLVED` is an advisory for a completed malformed clock or immediate
rally lacking an applicable in-time. A clock attempted in a spelling the reader does not
take — `8h00`, `8.00`, `08.00`, or digits glued to the words (`0800IN TIME`) — is a malformed
clock too and gets the same line (W19, 5 Oct 26); digits that are plainly not a clock
(`FL240`, `2 SHIPS`, `2.5 HRS`) do not. Other clockless notes remain inert.
Drafts save and first publication, amendments and correcting reissues all remain
allowed with a timing warning (D509); issued copies keep the warning normally.
The add button's nominal lead and words are both set in Logic (D510/D511).

## Late show — in a flying line's RMKS

| Typed | Means |
|---|---|
| `LATE SHOW` `SHOW AT BRIEF` `SHOW @ BRIEF` `BRIEF SHOW` | changes the crew-rest ring only: dashed while he still makes step, solid once he cannot |

Case and spacing are free. **Unlike AAR, no seat tag is read** — a late show on
a line applies to the whole aircraft, both seats.

It does **not** remove a crew-rest breach or move the anchor. It changes the
RING: dashed while the man can still make the jet by step (the step setting
on the Rules tab — the same one that pads a sortie's busy window), solid
once he cannot. It does not alter reporting chronology, `REPORT_ORDER` or
publication. Rule: `engine/events.ts` `lateShowOf`.

---

## Instrument rating test — `IRT`

| Where typed | Means |
|---|---|
| a formation's **MSN** box | an IR examiner is needed **somewhere in that formation** |
| one aircraft's **RMKS** | an IR examiner is needed **in that aircraft** |

Word-bounded and case-free. Rule: `engine/validate.ts`, code `NO_IR`.

---

## Sim rows

| Where typed | Means |
|---|---|
| an **OFT** row's label containing `EP` | that row gets a brief before and a debrief after |
| an **AMT** row's label starting `BRIEF` | that row IS the block's brief — its time is the hard line, nothing is added on top |
| an **AMT** row's label containing `DEBRIEF` | that row is the block's debrief |
| an OFT row's **RMKS**, `BRIEF 30` or `30 PRIOR` | overrides how long before the sim the brief starts |

The brief-lead number must be 1–240 minutes; anything outside that is ignored
and the default is used, so a typo like `BRIEF 3000` cannot mint a 50-hour
window. Rule: `engine/events.ts` `briefLeadOf`.

---

## Cancelling a line

Cancelling asks for a reason, and the reason is printed on the line as
`CX DUE <reason>` rather than a bare `CX` — so the next scheduler reading the
day knows why it went. Free text; nothing parses it.

---

## Mission role for Insights — when squadron tracking is On (D512–D532)

The exact Mission names `DS`, `RED`, `RED AIR` (also `REDAIR` / `RED-AIR`, ignoring case and extra spaces) count Red.
Other Mission names normally count Blue. A bounded DS/RED cue in a non-exact Mission or any aircraft Remarks asks
the scheduler to choose Blue or Red for the whole formation; FOR/FROM and an external unit never guess the answer.
`DS2`, `DS-2`, `RED AIR 2` and `ACM/DS` are cues; `DSFOR`, `REDS` and `CREDIBLE` are not.

The question follows a qualifying own edit after the text is saved. Later keeps unanswered text valid. Focus Remarks
to reveal temporary Choose/Change mission role below AREA. Answers are separate Insights annotations with actor history
and Undo; they update published Insights immediately without changing signed programme wording. Latest published Remarks
is read-only and labelled Published; the working copy is separate. Tracking starts Off and does not change totals or hours.

Only `;` and `//` split support clauses: `DS FOR VL // BRIEF 30 PRIOR` and `DS FOR VL; REJOIN 1430` retain the answer
when only the separate time changes. A single slash, comma or undelimited time stays inside its cue clause; changing that
clause or Mission can require a different answer. Standby waves remain outside flying load.

Rule: `engine/mission-role.ts`, `state/mission-roles.ts`; full context definition in the frozen revised Insights plan.

## What is NOT text

Worth stating, because these look like they might be:

- **SC / AVALON / BB** waves are a property of the wave, set when it is
  created — not detected from its label.
- **Leave, a medical code, overseas duty** are Inputs with dates, chosen from
  a dropdown of twenty types. Typing "downchit" or "ATT B" in a remark does
  nothing at all — pick the type. The **?** beside the type field says what
  each abbreviation means and what it costs.
- **AM / PM** on a leave or medical input are buttons, not words. They fill in
  the start and end times (00:00–12:00, or 12:01 onwards) and a half-day only
  closes its own half. Writing "AM" in the remarks changes nothing.
- **The late-input mark** is worked out from when the input was last changed
  against the deadline on the Rules tab. Nothing in the text affects it.
- **Initials, flight, area, traffic and the scheduler's notes** are read by
  nobody. Write what you like.
- **A personnel (ground crew) member's Remarks** on the Quals page — the same:
  a free-text note read by no rule. The category itself is set by choosing
  `Personnel (ground crew)` when the body is added, not by anything typed.
