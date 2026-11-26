# Round 2's questions checked against his rulings — the three reads combined (chat 192, 26 Nov 26)

He said the agent seemed to be making errors and asked for Opus and Fable, then Astra. Three blind reads of the round-2
page (`raptor-port/docs/mock/2026-11-25-rulings-round2/`), the end-time try-out, `words-reviewed.md` and the chat's four
answers of 26 Nov (`2026-11-26-round2-check-chat-answers.md`); brief `2026-11-26-round2-check-brief.md`; reports
`…-opus.md`, `…-fable.md`, `…-astra.md`. "Host" = checked by chat 192 in the rulings' full rows or the code.

## Confirmed (host-checked), by item
- **H** — three recommendations: page "every row"; chat "a person or name on it"; try-out default `b:'never'`. D2612's
  rule lists ground/programme and ALL AVAIL rows. The chat's and the try-out's versions narrow D2612 unnamed. "Name"
  is ambiguous (an event title vs a person); an ALL / ALL AVAIL puck counts as someone on it. H's "could not be checked:
  an input with a start and no end" — the app refuses it (`ui/inputedit.tsx` normalizeInputDraft). [all three]
- **I** — "lands on the Ground Programme" for an Attach is wrong: under Unavailable (D1374, `landsUnavail`). "What the
  app does today: nothing" overstated: weekend/holiday OIL_NO_TIMES warning, whole-day absences (course, overseas,
  all-day meeting), a flying standby's advisory, a landing alone still ends the day for crew rest, seat-qual checks.
  The Standard duty block's template can carry times (`ui/DutyTplModal.tsx`). His D361 "?" idea not named. [all three]
- **Missing question** — a cancelled (CX) or information-only item with a time missing: does it block? The try-out
  counts them; OIL leaves them out. [all three]
- **J / E11 / E12 / try-out** — J1 says "softened by E12" while E12 recommends no softening; J2 drops E12 and E11 needs
  the grey box; the try-out opens on grey without saying it changes D2613; switch 3 (published day red at once) was
  never on the page and the try-out reds every missing time on a published day, not only an emptied one. [all three]
- **G** — D2734 already rules the board's line; not said; the try-out still asks it; the try-out's tap always goes to
  the first box, the page says each in turn. [all three]
- **D** — tied to H (those rows carry nobody; under a "someone on it" rule they never count); "nobody types today" rests
  on demo data (D2616); OIL needs a real start and end on a seated BRIEF/DEBRIEF row (Astra). [all three]
- **C** — "What stays as you ruled: a row with no times at all is not touched" is the agent's reading in D2612, and I
  asks it. Ask C last, as the refusal only. [Fable, Opus]
- **A** — D2294: an unanswered input "asks it when a scheduler presses any of its four sign-off boxes", Later alone
  stops it; D2299: "the next press on any of the four boxes asks again". The built Save-as-Later narrows that; the page
  said his words do not cover it. Also: the Later memory lasts only while signed in (`ui/pops.ts` OILSIGN_LATER). [Opus, Astra]
- **E6** — "your ruling … stamped with who gave it" is among D782's agent's readings. [all three]
- **E7** — answered by the code: an input's OIL also waits for the day to be published again (`leavewar/sync.ts`
  creditFrom from the published evidence). The input card's sentence is a seventh untrue sentence — F7. [Opus, Astra]
- **F6** — "Every input closes the man…" still false: SANS availability and upchits close nothing (`engine/events.ts`
  inpShow). [Astra]
- **F2, F5, F6, G4 words** — cold read still owed (`words-reviewed.md`) though the page says "exact words to be built". [Fable, Opus]
- **B** — answered, D2617. Drop. **E5** — covered by his "cant be published unless a time is in"; only its words remain. [all]
- **Small 1, 12** — "can no longer be published" stated as fact; not built. [Fable, Opus]
- **Small 9** — changes D1120's "the day's figures and the Leave War are not changed"; name it. [Fable, Astra]
- **Small 15 (and chat answer)** — D2626 (25 Nov, multi-squadron branch): Plan of a squadron is given and ended by its
  own admins or a master admin. "Owner squadron" read one way unasked; "as today" describes no screen (D2266). [all three]
- **Small 17** — D321 (the whole Leave War row moves into the SANS group, earlier months included) and D2327 (the
  Leave War's row stays on today's tick) — the point would reverse them. Split: dated counts per D2313, the row's
  grouping kept. Fable read it as a plain fault; Astra right. [Astra; host]
- **Small 19 (and chat answer)** — the left-out words ARE built (`sansCut`); the save checks only new days (held days
  kept); D2341 says hidden "on every screen and in every count, as if deleted", so the window naming both breaks it —
  a fix or an explicit exception, not "leave as built". [all three; D2341 Astra]
- **Small 7** — settled (D2217, D2731 on the multi-squadron branch). Drop. **Small 8** — bell words never shown: to
  [BELL-WORDS-CLEAR]. **Small 16** — follows D1667 ("Blocked:"); a fix, not a question. [Fable, Astra]

## Stand as they are (no reader found a fault)
K; E2, E4, E8, E9, E10; F1, F3, F4; small points 2, 3, 4, 5, 6, 10, 11, 13, 14, 18.

## Outside the brief
- **Ruling numbers clash:** D2729–D2733 are also used on `claude/msq-b1-screens-135` (chat 191) with other meanings;
  this branch holds D2729, D2730 (and D2734–D2736). Whichever merges later renumbers its own (shipping rules).
- The cause: the page and the chat were written on a branch 97 commits behind main, never checked against the other
  branches' rulings of 25–26 Nov, and the chat changed a recommendation without saying so (skill note 1083).
