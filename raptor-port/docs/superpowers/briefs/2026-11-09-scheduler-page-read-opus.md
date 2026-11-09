BLIND READ: the scheduler's page (`.claude/rules/decisions/scheduler.md` at 43f2bfd02) against the list at 5d8ddf6f8, the full rows, the tests and the other pages. This was read-only; no repo file was changed. Helpers forked from me read the tests named on the "Built, held by tests" line and did a first pass over the page's bullets. I re-checked every finding below that is marked "confirmed" against the row, the line or the test myself.

## Findings, most serious first

**1. D755 — Q1 (confirmed). A limit on the member is gone from every page.**
- Page l.208: "…the member is told by his bell and may always take himself out…"
- D755's full row, accompaniment (3), "as put to him and taken by his word": "he may always withdraw himself, **and changing it for everyone once the scheduler has added others is the scheduler's**".
- No page states it. `inputs.md`'s first line says only that "who is in it is changed only by its filer or a scheduler".
- The case: Ranger files Training; the scheduler adds Tally to its row; Ranger re-times it. A fresh model lets Ranger's change move Tally too.
- Fix: after "may always take himself out", add "— once the scheduler has added others, changing it for everyone is the scheduler's [D755]".

**2. D663 — Q3, and Q1 (confirmed). The built window is not what he chose, and a test pins the difference.**
- His bold rule: "one item — its kind and how many people, the names listed under it". His pick was "Input · Meeting · 4 people", with the names under it.
- `src/ui/changesmodel.test.ts`, describe "a group filing is one item (D663)", holds that format only for history lines that carry an old group id. The file's own comment says these exist only in stored history.
- For a filing made today, the last describe (D663 named in its comment) asserts `expect(groups[0]!.title).toBe(\`Input · ${az(MEN)} · Meeting\`)`: every name in the heading, no count, nothing under it.
- The page's only other mention (l.243) is D736's count rule. So his chosen format is now stated nowhere, and the "built" line claims it is held.
- Fix: take D663 off the built line. State it on the page, and put the difference to him: either the build changes to his format or a ruling accepts the names-in-heading title.

**3. D531 (with D518) — Q1 (confirmed). The stated line contradicts a built ruling.**
- Page l.294: "a mission of exactly DS, red or red air counts red with no question; for any other mission DS or red **in its remarks** asks blue or red". Page l.292: "every other mission blue unless its blue/red question says red".
- D531 narrows D518: a Mission box containing DS or red without being exactly one of the three (DS-2, red air 2, ACM/DS) "asks the blue/red question; it is never counted blue or red by guessing". D518's row carries "NARROWED … BY D531".
- The case: as worded, a "DS-2" mission with empty remarks gets no question, and l.292 then counts it blue — exactly what D531 overturned.
- D531 is also not held whole by tests:
  - `src/engine/mission-role.test.ts` checks the engine's `{role:null, conditional:true}` only.
  - The on-screen question appears only in tests that do not name D531 (`mission-role-offer.test.tsx`, `mission-role-interim-fixes.test.tsx`).
  - No named test puts a DS-2 formation through Insights.
- Fix: on l.294 add "— and so does a mission that contains DS or red without being exactly one of the three (DS-2, red air 2, ACM/DS); it is never counted blue or red by guessing [D531]".

**4. D1751 over D355, D356, D451, D452, D454 — Q2 (confirmed).**
- Page l.82–83 state the full take, read-only, 30-minute and take-over mechanics as standing rules, beside "a simple mark, not a hard lock".
- D1751's row: "The agent's readings, told to him, not yet checked with him: (1) the rest of the lock stands … taking a day … (D355, D451), freeing it … (D356), an admin's take-over asking the holder first (D454); he may strike any". His words: "too much complexity for a relatively simple problem".
- l.82's "others … reading it only" is D451's refusal of others, which a "simple mark" does not plainly keep.
- Also Q1: D454's "(asked again, noted in the history)" after "Take over anyway" is dropped.
- Fix: mark l.82–83 "kept under D1751 by the agent's reading only, not yet checked with him; he may strike any part", and restore D454's clause.

**5. D186 — Q1 (confirmed). The narrowed invariant is pinned on the wrong value.**
- Page l.111: "a callsign rename updates the published schedule at once — the one printed value for which the 'no rule versioning' invariant is narrowed".
- Full row: "Narrows the … 'no rule versioning' invariant … for ONE printed value: a published day keeps the brief lead it printed". A callsign rename is "a label".
- The case: a fresh model reads the rename as the versioned exception, and would not treat the brief lead as the narrowing (as `raptor-port/CLAUDE.md`'s invariants line does).
- Fix: "…a callsign rename updates the published schedule at once (a label); a blank line's suggested brief time is the one printed value for which the invariant is narrowed".

**6. D183, D184, D185, D188 (on D179) — Q2 (confirmed).**
- Page l.65: what stays live is "drawn from today's judgement and never making the day pending".
- D183: "The agent's reading, stated to him so he can correct it: … does NOT make the published day pending". D184 and D185 carry the same as readings. Neither his words nor any bold sentence says it.
- Also Q1: D179's "'For now': provisional — put it to him again …, not re-decided without him" is reduced to "for now".
- Fix: mark the clause "(the agent's reading)", and restore "provisional — put to him again, never re-decided without him".

**7. D278 (with D753, D755, D776) — Q1 and Q2 (confirmed).**
- Page l.105: "A placeholder … may stand on a row **nobody filed** twice … but an input takes ALL or ALL AVAIL, never both, **never the same one twice**".
- D278's bold: "may stand on a row twice — 'one man, once per row' (D271) is about men". No cited row says "a row nobody filed" or "never the same one twice"; D753 says only "never both".
- The page narrows his ruling and adds a rule of its own.
- Fix: restore D278 as ruled. Mark the input-row limit "as built — the agent's reading of D755's one record", or cite where it was ruled.

**8. Duty desks from templates (settled entry, against oil.md's D24 / D35 line) — Q1 (confirmed). A stale rule restated.**
- Page l.131: "a template naming SC, AVALON or BB mints its desk as that wave's — exempt as its wave is, earning no OIL".
- `oil.md`: "On by default: … Standard and **SC-shift duty desks**"; off by default with the switch offered: "AVALON … duty desks, … a duty block minted from an AVALON template"; "a BB duty desk do[es] not earn by default".
- The page's l.117 says a later ruling wins, yet this line still states the old rule flatly. A fresh model would build SC desks that never earn, and no switch.
- Fix: replace "earning no OIL" with "earning as the OIL page's defaults say".

**9. D1045 — Q1 (confirmed). The scope is narrowed to the SPARE.**
- Page l.190: "For a flying SPARE its crew rest and its OIL change, its day ending at END with no debrief added".
- His bold: "the line's day ends at its END, with no debrief added", for every row of a flying standby line, MAIN included. `oil.md` states it for the whole line.
- Fix: "on a flying standby line every row's day ends at the line's END, with no debrief added; for a SPARE its crew rest and OIL change".

**10. D475 (with D1792) — Q1 (confirmed). Two approved calls dropped.**
- D475: "Approved with them …: the bar's colour follows what is left (hide the only red one and it turns amber); a hidden crew-rest warning also drops the dotted 'breaks tomorrow's crew rest' mark on the day before". Also "a man with two warnings keeps the flag of the one still showing".
- None of these is on page l.232, nor elsewhere on the page.
- Fix: add them to l.232.

**11. D712 (narrowed by D778; D713) — Q1.**
- Page l.219: "for the kinds D712 lists". D712's bold list refuses Personal and leaves out Event. D778 narrowed it (a one-day Personal), and D713/D714 added Event.
- Following the pointer gives a stale list.
- Fix: name the kinds: "Training, Meeting, Appointment, Duty, Event, Other and a one-day Personal — never leave, medical or a Fly with".

**12. D1781 against D1083, D1084, D1085 — Q1.**
- Page l.183: the board's SC/AVALON/BB headings read "R · B · START · END in one line on a desktop".
- D1781 (later) stacks the board's lines from 821 to 1099 wide ("the headings stack the same way"). The narrow-desktop stylesheet's comment applies it to standby lines too.
- Fix: "in one line from 1100 wide; stacked on a phone and from 821 to 1099 wide [D1781]".

**13. The Q3 result: the "Built, held by tests" line — 25 of 56 numbers are not held whole by tests that name them.**
I confirmed D663, D605, D1064 and D187 myself; the rest are the helpers' readings of the named tests.
- **D65.** `availwin.test.tsx` checks only the stored selection. Unheld: that he "highlights … everywhere on the schedule", and that "the window still shows his reason" (only the callsign is checked).
- **D114.** The ✕ line names what, not "whose request". Needed: `toContain(PEOPLE.bane.cs)`.
- **D187.** The board test builds the look itself (`withDaySnap(… withVersionFlags(… boardHTML …))`, `latepub.test.tsx`). If the board stopped wrapping its 👁 look, no test fails.
- **D270, D272** (as narrowed by D877, D277). Only stylesheet arithmetic (`flagglow-css.test.ts`). No rendered `.puck.me` with a flag, or with `oilglow` in OIL Earn.
- **D513.** "The first twelve": the fixture ties every flyer, so which twelve show is never checked. Show-all is set directly, never clicked.
- **D517.** No stored answer reaches every aircraft and both seats; the reader is stubbed to null.
- **D531.** See finding 3.
- **D551.** Its parts (empty boxes, closed editors and popups, folded sections) are held only by tests titled D555/D556. "D551" appears only in a range "(D551–D555, D597)" in `boardkeys.test.tsx`, which checks the date is never a stop.
- **D553.** The e2e accepts `document.body` or a loop back to the day. "Without looping" and "the next normal button" are held only by tests that do not name it.
- **D562.** "At the top": only a lower bound is checked, and no assertion that the window scrolled.
- **D594.** The board drag test names D594 only in a comment. Nothing drives a wave's own Auto sort. The week's no-drag is "his call over the agent's recommendation" — a declined option a test cannot hold.
- **D605.** "A part-day absence against a seat with no times stays silent" is held only in `blankabsence.test.ts`'s describe "the half left as it was" and in comments; none names D605.
- **D663.** See finding 2.
- **D769.** "The input first … then what happened", and "its age at the right": parts are read by class name, so order and layout are unchecked.
- **D824.** Only `outline:` rules are checked. A box-shadow or border ring passes.
- **D828.** jsdom inline styles only; "full width" is never measured.
- **D831.** The band's place on the ordinary pages' top bar is never measured; only the board's band is.
- **D840.** "Always one line … on wider letters" is measured only on the board's band, not the top bar's.
- **D860.** The e2e titled for the card, the month's bar and the List's row asserts the card only. The no-glow check matches only #1E86FF.
- **D958.** "A row on the Ground Programme keeps 'ground'" is held only by neighbouring tests not naming D958 — and page l.202 also drops the clause and the three places.
- **D1010.** Only that an added row is absent; nothing checks the published content shows, or that a changed or deleted row still shows its published value.
- **D1031.** "3 hours to start" is pinned only in `rules.test.ts:84`, which does not name D1031. "No second setting" is held only indirectly. The rename is asserted in a test titled for D928, with D1031 named only in a comment.
- **D1064.** The lit chip "on all three screens" is asserted only under SF2 (D1061) and SF1 (D1044…); D1064 is named only in the file header.
- **D1781.** At 1100 only R/B side by side is checked; TO/LD are never checked, and nothing is measured wider.

Also noted:
- **D271** is held, but the later D276 (a jet's two seats stay a warning) is pinned by no test. It is stated at l.107.
- **D1020** is named only in the comment above its test.
- **D550**'s "view-only and issued surfaces stay outside" is held only under a D556 describe.

Fix for all of these: take each off the built line and state it (or its unheld part) on the page, or add the named assertion listed above.

**14. D733 — Q1 (low).**
- It is only on the built line. Its row: a passing note naming who stands there now "was offered and not taken". That is a "don't reopen" no test can hold.
- Fix: state "nothing more is said; a note naming who stands there now was offered and declined [D733]".

**15. SC B box (settled entry, D1083, D1085) — Q1 (confirmed, low–medium).**
- Page l.128: "an early one on a MAIN starts the long-day span and raises the in-time advisory".
- The old entry: an early B on a MAIN starts the long-day span; separately, "anything cutting into the B→start window raises the amber SC_INTIME advisory". Also "SPARE rows have no event stream (both MAIN-only)".
- The merge ties the advisory to an early B itself.
- The pointer to `engine-rules.md` and `ui-contracts.md` §The B box is lost.
- Fix: "…an early one on a MAIN starts the long-day span; anything cutting into the B-to-start window raises the amber in-time advisory (MAIN only); detail: `ui-contracts.md` §The B box".

**16. Smaller Q1 / Q2 points.** Each was found by a helper with quoted evidence; I checked D936 and D1699 only in part.
- **D936.** Dropped: "the refusal of a value out of bounds keeps its note (a refusal is never silent)". Add it to l.237.
- **D1699.** "The person who pressed Undo gets nothing; a tap opens what the line opened" is narrowed on l.267 to D1710's posting change. Restore it.
- **D1041.** Its "on an SC SPARE, AVALON or BB line … shown, printed and exported only" is settled silently by D1044/D1045. D1041's row carries no CHANGED/NARROWED mark. Name the clash (D90, D201) and mark the row.
- **D360.** "Frozen at publication" and "where OIL is decided" are agent's readings (2) and (3), stated as his. Dropped: "the public view shows only the assumed hour". Mark the readings and restore the dropped words.
- **D550 / D544.** l.47 under "The week on Edit Schedule" reads week-only, but D550 covers the Scheduler Board too. Fix: "on Edit Schedule's week and the Scheduler Board".
- **D36.** l.114 adds "and is shown flagged", which is in neither the line nor the row. Delete it, or cite its source.
- **D1526 / D1527.** l.46's "at rest … looks as the old arrow did" is the agent's reading in D1526. His bold covers "slid out" only.
- **D802.** "A ruling that governs both … stays on this page" (l.35, l.31) is "The agent's reading, to tell him". Mark it.
- **D111.** "On every surface it is drawn" (l.248) is the agent's reading. Mark it.
- **D815.** The "Goes to" case (l.226) came from a build's code read (F6), not his ruling. Dropped: "never on a retype into a kind the list shows by itself".
- **D102.** Dropped: "roles on a desktop, names only on a phone".
- **D507.** Dropped: "the existing brief-before-take-off and exception checks stay".
- **D40 / D41.** Dropped: each flag's reason under its puck, beside it when widened, never hidden.
- **D1063 / D1064.** "Read only" on Edit Schedule's week (l.193) is D1064's agent's reading.
- **D1080.** Dropped: "not callsign, mission, remarks, nor an input's start and end".
- **D668 / D1193.** l.317 should add "only their name; they are not re-defined".
- **D807, D830 ("Done once").** D830's "K5, K6 and K11 … his to place" is the agent's reading. D807 drops "and the ones coming".
- **D481.** Its placement was "still his to confirm"; cite D532, which confirmed it.

**17. Q4 — the moved text.**
- The seven blocks moved into `engine-rules.md` and `ui-contracts.md` arrived byte for byte, under the headings the page names.
- The late-input measurements are in `ui-contracts.md` §The late-input mark on screen.
- Pointers to "§Settled before this list" and to the old group names still land: the page keeps the heading and prefixes each line with its group's name.
- But most settled entries were rewritten, not moved; their built detail and "don'ts" were dropped. Three lines give no pointer to where that detail lives:
  - **l.145, the phone week glide.** Two frozen clones, sized to the taller week, under the top bar, never `visibility:hidden`, the touch-end ownership. It is findable only in `performance.md`.
  - **l.128.** See finding 15.
  - **l.153, the Inputs calendar's popover.** The phone's note bar, the SANS man's purple left line, a seated puck removed three ways. These are in `ui-contracts.md` §The Inputs month calendar, unnamed.
- Also lost unpointed:
  - from the four crew panels (l.139): "Don't fold the crew panels into a fixed tail", and the old "Apply to all days" gone;
  - "CREW_TIGHT never traces" (l.149). It is in `engine-rules.md`.
- Fix: add "detail: …" pointers on l.128, l.145 and l.153.

**18. Q5 — the other pages.**
- **people-accounts.md (confirmed).** D1699 and D1710 were added to D1694's bracket ("The blue ring … 8px outside the row … [D1694, D1699, D1710]"). They change nothing about the ring; they change D1693's taken-back line, cited in the bracket before it. Fix: move them to "[D1696, D1693, D1699, D1710]".
- **The other added numbers do change the ruling beside them:**
  - `design.md`: D1526, D1527 on the arrows' exception;
  - `inputs.md`: D682, D711; D637, D665, D674; D776; D736; D762;
  - `plain-language.md` check 4: D833, D834, D836, D839;
  - `record-decisions.md`: "since changed by D77, D1106".
  - No other word changed on these files.
- **oil.md's eight tightened lines keep every rule, condition, exception and scope.**
  - D2: "no longer removes" became "never removes".
  - D48: "is held to the rule it went out under and keeps the OIL" became "keeps the rule and the OIL it went out with".
  - The standby line was re-ordered; its "every row … the day ending at END" stays whole-line.
  - Placeholder: "landing and earning one list, one decision".
  - D606: "where filled" was dropped — a "typed B" already says it.
  - D19, D1094 / D865, and the demo-data line: wording only.
  - No finding.
- **The map lines** (`DECISIONS.md`, `AGENTS.md`, `raptor-port/CLAUDE.md`, the full-text file's head) add only "the scheduler since 9 Nov 26 (D1944)". `DECISIONS.md`'s list only moved D1048 and D1047.
- **The "From other areas" lines (low):**
  - D981's full row is the Tracker's, not People and accounts'.
  - D755 and D776 are listed under OIL's but are this page's own rulings.
  - The Inputs line's "an input's title" now has no number: D715 was archived, replaced by D716 (this page) and D919.
  - The old header's D46, D715 and D718 are dropped correctly: each is archived as replaced.

**19. Q6 — how-we-work.md §Records (low).**
- "The scheduler's rulings stay one file, **never** split by screen". D611's rule was "not split by screen … look again only if that file grows by about half again"; D976 said "D611's mark standing".
- The rewrite drops the look-again, and "never" closes a door his rulings kept open.
- D1944 answered this one look-again; it does not say the question never returns.
- Fix: "not split by screen (D611, D976); past D611's mark he chose one page in the trials' shape (D1944)".
- D1944's statement on the page (l.34) keeps its bold rule and leaves out its readings: correct.

## Clean, as checked
- Every number of the old table (334) is cited on the page.
- All of the old "Also read" numbers are cited except the archived D46, D715 and D718.
- The every-screen rules are stated as app-wide on the page: the phone keys, one-tap, phone windows, the one date calendar and the writing guide. But the page loads only with its `paths:`, which do not include the Leave War's or the Tracker's files. Their stated home, `design-practices.md`, carries them.
- Neither of the two open questions (D660 against D762; D511 against D1026 and D1034) is decided by the page.

rulings checked: 334 (every ruling of the old table, each page bullet against its rows), plus the 45 settled entries, the 56 numbers on the built line against the tests that name them, the numbers added to six other pages, the eight tightened OIL lines and the reworded how-we-work line.
