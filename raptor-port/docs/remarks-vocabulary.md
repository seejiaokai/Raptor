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

- `AREA: D4445, AAR` — harmless. `AREA:` ends in `A`, so it reads as a
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

## The in-time lines — at the top of a wave

Each line the wave publishes is read for a **time** and, optionally, a
**callsign** (21 Aug 26):

| Typed | Means |
|---|---|
| `0900` `09:00` `0900H` `09:00H` `0900L` `09:00L` | the show time — the FIRST valid clock time in the line is the one that counts |
| a formation's callsign anywhere in the line (`RU 0900`, `0900H: RU IN TIME`) | this line is that formation's in-time only |
| no callsign in the line (`0900H: IN TIME + WX/NOTAMS`) | the whole wave's — every formation without a line of its own |

Case is free on the callsign and the H/L suffix. A specific line always beats
a wave-wide one, whatever order they were typed; with several wave-wide
lines, the earliest time is the show. A number glued to letters (`FL240`)
never reads as a time, and an impossible clock (`2590`) is skipped.

The published in-time moves the formation's **report time**, which feeds crew
rest (the anchor is the EARLIER of in-time and brief), the long-work-day
note, and the wave windows. A line with no readable time is inert until a
time is typed into it.

## Late show — in a flying line's RMKS

| Typed | Means |
|---|---|
| `LATE SHOW` `SHOW AT BRIEF` `SHOW @ BRIEF` `BRIEF SHOW` | this crew is not needed at the published in-time, only from the brief |

Case and spacing are free. **Unlike AAR, no seat tag is read** — a late show on
a line applies to the whole aircraft, both seats.

It does **not** remove a crew-rest breach or move the anchor. It changes the
RING: dashed while the man can still make the jet by the latest show, solid
once he cannot. Rule: `engine/events.ts` `lateShowOf`.

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
