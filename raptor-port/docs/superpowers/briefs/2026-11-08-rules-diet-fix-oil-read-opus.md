# Blind read — the trimmed OIL page against its account (fresh Opus reader, 8 Nov 26)

Compared the working-tree `.claude/rules/decisions/oil.md` (15,362 bytes, under the 15,407 of the old list) with
`HEAD` (the page before the trim), the old list `a6265cae0`, the account
`raptor-port/docs/superpowers/briefs/2026-11-08-rules-diet-step5a-account.md`, the full rows, and the pointed-to
lines in `scheduler.md`, `leave-war.md`, `people-accounts.md`, `design.md` and `inputs.md`. No file changed.

**Citations:** every D-number on the page before the trim is still on it (a set comparison: none gone, none added).
D18, D20, D34, D390, D738, D744, D750 and D971 were on the old list but already off the page before the trim, as the
account records; not a trim finding.

## Findings

**1. Medium: D1043, D1044, D1045 and D1061 (scheduler). The trimmed standby bullet now makes a hand tick fly the
whole line.**
- **Before the trim**, two separate bullets said: "when it counts as flying — its B or R typed, or its row ticked
  'Flies'"; and "On a standby line **with its B or R typed** every row, SPARE rows included, is a jet that flies".
- **The trimmed page**, "A standby line that actually flies is a real flight…", merges them: "when it counts as flying
  (B or R typed, or its row ticked "Flies"), and that every row **then**, SPARE rows included, is a jet that flies".
  Read this way, "then" covers a hand-ticked row too, so a hand tick would make every row of the line fly.
- **D1061** says the opposite: "A Flies tick set by hand lights one standby row only, never its whole shift". D1044
  and D1045 limit "every row" to a line with B or R typed.
- "for OIL as for the rest" was also dropped.
- **Smallest fix:** "…every row of a line **with B or R typed**, SPARE rows included, is a jet that flies; a hand
  tick flies its own row only…"

**2. Medium: D755 (1) and D762, the account's gap A14. The rule for a person added to a shared input is now stated
nowhere that loads.**
- **The account says** gap A14 was fixed by having the page carry: "a person added follows that answer, the scheduler
  asked on the spot only where there is none yet", and where the answer is No "the note says they are not counted".
- **The trimmed page** has only the bare pointer "The scheduler's, on OIL (a shared input's one answer, men on its
  row…": D762, … D755.
- The trim was allowed to make this a pointer only because the rule is stated on its own area's file. It is not:
  `scheduler.md`'s D762 and D755 lines do not mention someone being added. The clause survives only in D755's full
  row, which is searched, never loaded.
- **Smallest fix:** put the clause back after the pointer, or add it to `scheduler.md`'s D755 line.

**3. Medium: D731 (7). Where a shared input's answer goes when the input stops covering a day: also no longer stated
anywhere that loads.**
- **Before the trim:** "an answer for a day the input no longer covers stays on the record, credited for nothing and
  shown nowhere, and stands again if the input moves back [D731]". The account marks this part **stated**.
- **Now:** only the bare D731 in the scheduler pointer.
- `scheduler.md`'s D731 line says only that the small choices were answered "Yes to all". The rule itself is in D731's
  full row (item 7) and in the reference documents, not in any rulings file.
- **Smallest fix:** keep that clause on the page, or state it on `scheduler.md`'s D731 line.

**4. Medium, a contradiction the trim introduced: several of the agent's readings are still stated as his rules,
though the new opening paragraph says readings are "never stated here as his rule".**
- **What the account marks "r"** (readings told to him, not his own words):
  - D260 r1: the bid sheet's Clear names an award and asks once.
  - D782's readings: a several-people input is one line with one answer, FO or HO offered, each answer stamped with
    who gave it; the list is what the bell opens.
  - D783's readings: the Leave War's Event row opens the same list; "OK" only closes the bar; a move from one input's
    row to another's waits like a swap.
  - D816 r1–r4: the ⓘ mark treated the same; the "Not un-cancelled" bar; one step, one Undo; an Undo asks nothing.
  - D793 r1–r3, D818 r4, D923 r1, D814 r2, D863 r1–r2, D261's "read only".
- **On the trimmed page** each of these appears as a plain rule. Some of the lines: "Every waiting door keeps that
  bar…", "A several-people input is one line…", "Taking the cancel, or the information-only ⓘ mark…", "A dragged
  block's delete… the bid sheet's Clear does the same…", "'Answer OIL' reopens the question, 'OK' only closes the
  bar".
- The full rows confirm these are readings: D260's "the agent's readings, stated to him so he can correct them"; D782
  and D816, "readings, told to him".
- The trim moved only the D591, D592 and D606 readings back to their rows, so the opening paragraph's new promise is
  now untrue for the rest. They were on the page as rules before the trim too, so this is not a meaning the trim
  dropped.
- **Smallest fix:** either soften the opening paragraph to say a reading that was built and shown to him without
  correction is stated as it stands, or mark each one "(reading)".

**5. Low to medium: D19. The "never silently" guard moved onto the wrong thing.**
- **The row says** the period "is never made silently from a schedule screen — the offer creates it and hands the
  scheduler to the Leave War". Before the trim: "never a bare refusal and never silently: the offer hands…" (A12).
- **The trimmed page,** "A weekend or holiday no Leave War period covers…", reads "never a bare or silent refusal".
  "Silent" now describes the refusal, and the rule that a period is never created silently is gone. Only the clause
  about handing the scheduler to the Leave War hints at it.
- **Smallest fix:** "…never a bare refusal; the period is never made silently — the offer hands the scheduler to the
  Leave War…"

**6. Low: Settled, the OIL Earn mode. A document path and a detail were dropped.**
- **Before the trim:** "the finished item is in `OUTSTANDING-ARCHIVE.md`, under `[OIL-AUTO-REMOVE]`", and "his
  five-minute look waived".
- **Now:** "(`[OIL-AUTO-REMOVE]`, archived)" and "his look waived". The brief requires a settled item's document path
  to stay; the walk's and the design's paths are kept, but the archive file's name is gone.
- **Smallest fix:** "(`[OIL-AUTO-REMOVE]`, in `OUTSTANDING-ARCHIVE.md`)".

**7. Low: D401 and D163 merged in Settled ("Old-shape stored awards, the demo award dates…").**
- "the items that raised them closed" now reads as covering D401's stored awards as well. The account ties the closed
  items (`[DEMO-AWARD-DATES-ASK]`, `[POSTOUT-LOST]`) to D163 only.
- D401's "the award fix converts no stored award" is now only implied by "only the demo seed is rewritten".
- **Smallest fix:** "…the two items that raised the award dates and the posted-out man closed".

**8. Low: the opening paragraph lost the shell search.**
- The `grep -h '^| D… |'` command and the warning that "the Grep tool hides a long row" are gone. `doc-structure.md`
  and `record-decisions.md` (both always loaded) carry both, so this is cosmetic. Not a requirement.

## Checked and found faithful

These are faithful, every citation of both halves kept in each merge:
- D2, D142, D48 with D592 (pending until published again), D28/D31/D43/D755/D49 (the four "nothing to measure"
  cases, the flying-line exception).
- The on-by-default and off-by-default lists (BB duty desk; B5's clause now its own bullet).
- The placeholders (an input's one answer), D470, D52, D82/D79.
- D21 (leave charging), D804 (the kinds asked and never asked), D814, D81/D360.
- D591/D592 and D606 (readings moved to rows that hold them: D592 r6–r9, D606 r1–r3 confirmed in the full rows),
  D1041, D49, D42.
- The OIL-question section: buttons, the bar's words, "Not added / Not filed / Not un-cancelled", one Undo, D816/D865,
  the holiday list's words, "Yes to all"/"No to all", "Later"/"Save", the mock path, the load note, "Switch to this
  plan", the calendar and its 400-wide count line, D1578.
- The awards section: D400, D402 with its negative entry and no-period credit, D261 "how many days", D1008, D1209,
  D80's open manning question, D260 and its Undo, D1579.
- D1, D1783/D26, D1094, D865's words, D26 settled.
- The pointers checked on their own files: D762, D660, D682, D753, D272, D277, D65, D1782, D1793, D327 (the
  archive–restore gap), D1209, D54 ("leave it").

## Could not decide

**Whether findings 2 and 3 count against this trim or against the brief's allowance.** The brief allows a pointer to
lose its explanation, but only on the premise that the rule is stated on its own area's file. For D755's added-person
clause and D731 (7), that premise is false: the one-line scheduler rows never stated those parts. Before the trim, the
OIL page's own explanation was the only loaded statement of them. I count them as dropped requirements. The owner or
host may decide instead that `scheduler.md` should carry them.

**Whether finding 4 needs fixing in this trim.** It depends on whether the readings left on the page were ever
accepted. Several were built and shown to him without correction, for example D816 r2, whose words D865 later kept.
I could not find, for each one, a record that he confirmed it, so I raise the mismatch rather than judge each line.
