# `[BLANK-TIMES-ABSENCE]` (D605) with `[SC-PICKER-INTIME-REST]` — evidence sheet (6 Oct 26)

**Authority: D605** (owner, 6 Oct 26 — "4 yes as recommended"): a man who is on leave or grounded for the whole day is
flagged the moment he is seated anywhere that day, on a line or row with no times yet too; a part-day absence against a
seat with no times stays silent. His instruction for this chat: build it together with `[SC-PICKER-INTIME-REST]`, with
its own full check; add the "Vercel missed a merge" trap to the deploy notes; merge nothing. Branch
`claude/blank-times-absence-picker-2cebae`, cut from `main` at the merge of PR #482. Nothing merged; `main` untouched.

**Status: BUILT, WALKED, EVERY GATE GREEN on the final code, the TWO independent reads done. His look is left. Not
merged; `main` untouched.** *(Filled in as each step closed — see §The gates and §The two code reads.)*

## Questions waiting for him

None that blocks. **Two readings the agent made in the build, for him to overrule if he wants them otherwise** (both
recorded in D605's full row):

1. **It covers every input that lasts the whole day, not only leave and a downchit.** A whole-day course, overseas
   duty or an all-day meeting gets, on a seat with no times, exactly the warning it gets once a time is typed.
   Recommended: keep — the answer never depended on the missing time, and a narrower rule would leave an overseas-duty
   man unflagged on a blank line. What waits on it: nothing; narrowing it later is a one-line change.
2. **The crew list is not changed.** Before a man is placed on a seat with no times it still strikes his name for ANY
   absence that day — so for a part-day absence the name is struck before and the list says nothing after (his ruling:
   nothing to compare). Recommended: leave it.

## The eight questions (bug-check order §5) → tier FULL

| # | Question | Answer |
|---|---|---|
| 1 | OIL / what a man is owed | NO — a seat with no hours is kept in its own list and never becomes an event, so nothing that works out OIL or work hours reads it (`engine/oil*.ts`, `workSpan`: untouched) |
| 2 | The published record | **YES** — a leave or downchit warning is part of what a published day goes out with and freezes there (D177–D179); when such a warning is raised changes |
| 3 | Saved data | NO — a warning is worked out, never stored on its own; nothing saved changes shape (an issued version keeps the list it went out with, as before) |
| 4 | A shared drawer | **YES** — one day-builder feeds every reader of the day's seats; the warning's ring is drawn wherever a man's puck is |
| 5 | A new gesture or mode | NO |
| 6 | A new surface | NO (one new row of text on the Logic page) |
| 7 | Roles | NO — the same result for everyone; the member's and the guest's read-only faces were walked |
| 8 | The warning list | **YES** — when three warnings are raised, and their words where a seat has no name |

## The rulings that apply — each walked against the build

| Ruling | What it says here | Result |
|---|---|---|
| D605 | whole-day absence → flagged at once on any seat; part-day vs a seat with no times → silent; each kind's exemptions unchanged; nothing about a published day changes | this sheet |
| 10 Aug 26 (owner) — "all will automatically go in": every input closes the man's hours the moment it is typed; leave / medical / overseas duty "close the man's day outright" | the whole-day rule reaches every input type the timed check flags | holds — the oracle test (every type × every seat), walker A H-01 |
| 10–11 Aug 26, 7 Sep 26 — a standby place (SC SPARE, AVALON, BB) bars only what cannot spare: overseas and medical; ATT B may man a desk but no jet seat | unchanged with no hours | holds — the oracle; walker A S01, S12 |
| 26 Aug 26 — across an SC MAIN a Meeting is the amber advisory; the red-list types are hard; a removed ("taken off") request is dormant | unchanged with no hours; no clock printed | holds — unit; walker B S05 |
| 27 Aug 26 — an Upchit is a paperwork record, invisible to the engine | it raised a warning on timed seats (OLD) — closed | fixed red-first; walker B S03 |
| 14 Aug 26 — SANS Availability is an offer, never an absence | unchanged | holds — walker B S27 |
| 1 Sep 26 — an ⓘ info-only row is never checked; 4 Aug 26 — a cancelled row | unchanged | holds — unit; walker A S22 |
| 10 and 25 Aug 26 — a new line and a new wave's first line come up blank | the fault's doorway — the app's normal state | the tests use that exact shape; the browser test the real "+ Wave" |
| D33, D47, D278 — placeholder pucks | nobody; refused on cockpits | holds — walker A S23 |
| D271, D276 — one man once per row; both seats of one jet a warning | unchanged | holds — walker A S24 |
| D177, D178, D179, D103 | a leave or downchit warning freezes on a published day; a change reads pending and takes the sign-offs down | holds — `latepub.test.tsx` (two new cases), host H4, walker D |
| D185, D188 | what stays LIVE on a published face — these warnings are NOT among them | holds — walker D |
| D187 | the 👁 look at a published version shows its warnings | walker D |
| D469, D472 | a hidden warning | walker D S28 |
| D477, D478 | Insights counts the page's copy | walker D S30 |
| D360, D361 | a row with a start and no end has its assumed hour | unchanged — it was never a seat without hours (unit test) |
| 24 Aug 26 — an SC line's B box is its in-time | the crew list now asks with it | `scpickerrest.test.ts`, host H5, walker C |
| D56 | harm only in stored demo data is not a finding | said in every brief; none raised |
| The robustness doctrine (21 Aug 26) | the five families | the table in §The walk |

No clash between them was found.

## The fault, seen on screen — before and after

`scripts/handpass/bta-host.mjs`, the host's own walk, through the app's own controls (the Inputs page's form, "+ Wave",
"+ Item", the text boxes, a seat and the struck name in the crew list, Publish), on the build as it is LIVE (the two
engine files set aside, rebuilt) and on the FIXED build. A PASS means the warning is where it should be. X = Vandal, a
pilot, idle across the demo week. Pictures: `docs/img/handpass/2026-10-06-blank-times-absence/before/`, `…/after/`.

| Step | What was done | LIVE build | FIXED build |
|---|---|---|---|
| H1.1 | Local leave (LL) all Tuesday filed for Vandal on the Inputs page; "+ Wave" (its line comes up blank); the seat armed — his name is struck "local leave (LL) — Wedding" — and pressed | **nothing in Tuesday's list, plain puck** — FAIL | "Vandal — On leave but planned to fly this line — reason: Wedding", red ring and C chip; the toast says it too — PASS |
| H1.2 | callsign ZL, mission BFM typed; still no times | nothing — FAIL | "… planned to fly ZL BFM — reason: Wedding" — PASS |
| H1.3 | take-off 10:00, landing 11:00 typed | the line appears — PASS | the same single line — PASS |
| H1.4 | both times cleared again | **gone again** — FAIL | stays — PASS |
| H1.5 | a landing 15:00 typed alone | nothing — FAIL | stays — PASS |
| H1.6 | the page reloaded, signed in again | nothing — FAIL | stays — PASS |
| H2.1 | the half left as it was: leave for Tuesday MORNING only; "+ Wave", seated on the blank line (the crew list strikes him "local leave (LL) (AM)") | silent — PASS | silent — PASS |
| H2.2 | an afternoon flight typed on it | silent — PASS | silent — PASS |
| H2.3 | retyped as a morning flight | flagged — PASS | flagged — PASS |
| H3.1 | ATT C all Tuesday (the certificate question answered); "+ Wave" → BB (no shift times); Vandal in its MAIN seat | **nothing** — FAIL | "ATT C but on BB SHIFT — medically down — reason: Flu", ring on the BB seat's own puck — PASS |
| H3.2 | "+ Item" on the Ground Programme (no name, no times), Vandal put on it | **nothing** — FAIL | "Downchit but tasked — this ground row — reason: Flu" — PASS |
| H3.3 | the row named RANGE SWEEP | (the script stopped at the row's name box on this build) | "Downchit but tasked — RANGE SWEEP — reason: Flu" — PASS |
| H4.0 | Vandal seated on a new line ZP with no times; Tuesday published | nothing, nothing pending — PASS | the same — PASS |
| H4.1 | local leave all Tuesday filed AFTER publishing | "1 pending", **but no warning on the working copy** — FAIL | "1 pending · Not yet signed"; the working copy says "On leave but planned to fly ZP" — PASS |
| H4.2 | View-only Sched — the published face | no line, plain puck — PASS | no line, plain puck (it keeps what it went out with) — PASS |
| H5.1 | `[SC-PICKER-INTIME-REST]`: Vandal lands 22:30 Monday. Tuesday "+ Wave" → SC, Cobra in a MAIN seat, shift 13:00–19:00, B 05:00. A SPARE seat armed | no crew-rest word against Vandal — PASS | the same — PASS (the negative control) |
| H5.2 | the other MAIN seat armed | **Vandal offered clean** — FAIL | struck: "crew rest — not clear until 12:30" — PASS |
| H5.3 | his name pressed | the breach appears only now — PASS | the same breach, the same clearance time — PASS |

*(H3.2's words are the final build's "this ground row" — on the walked build they read "this row".)* No browser error
in any run. 35 + 36 pictures; the host opened eight of them (the list and the puck on both builds,
the BB seat, the ground row, the armed SC seat, the published face) — each showed what the row says.

## What was built

**`[BLANK-TIMES-ABSENCE]`** — `src/engine/events.ts`, `src/engine/validate.ts`:
1. **The seats with no hours are kept** (`day.blank`): a duty desk, a sim seat or body, a ground or Common Programme
   row with no start, an AVALON / BB seat or desk with no shift times. They never became an event, so nothing could be
   said about the man on them. They are NOT made events: the clash rules, the crew list's busy scan, Insights' hours
   and OIL still read a row with no times as occupying no time.
2. **The day's whole-day inputs** (`day.whole`): the All day tick, a record with no usable hours, or hours typed
   00:00–23:59 / to 24:00 — this day's only, through the same gate as the rest (dormant requests out; the frozen filing
   on a published face), and counting a whole-day request that is already on the programme.
3. **Each absence check judges a seat with no usable hours against that list** — the flying-line check, the duty / sim /
   ground check (an SC MAIN with cleared times), the SC SPARE check, and one new check for the seats of (1) — with the
   types, the exemptions and the words each already had. A request is never flagged against its own row.
4. **The sentence**: no clock that is not there; where the seat has no name yet, "this line" for a flying line and the
   kind of row for a row — "this duty row", "this sim row", "this ground row" (so a man on three new rows is three
   lines, not one) — with times and without.
5. **An Upchit is turned away where SANS Availability is** — it had been raising "Upchit clashes with …" on the day a
   man was cleared fit, on seats WITH times (old; found by Astra's scenario read).
6. `src/ui/logic-html.ts`: one row in the Logic page's leave group says the rule.

**`[SC-PICKER-INTIME-REST]`** — `src/engine/validate.ts` `restIfPlaced`: the crew list's crew-rest question measures
from a sibling already on the formation; it looked only for a sortie's, so it answered nothing for any SC seat. A shift
sibling now counts — backward (the typed in-time or the shift start against his clearance) and forward — and a seat the
conflict engine leaves alone (an SC SPARE, AVALON, BB) is answered nothing, so a spare cannot borrow the MAIN's report.

**Not changed, on purpose:** the crew list's own reading of a seat with no hours (it fails closed — §Questions (2)); the
standby lines' currency and two-places looks with no hours (still inert); a row with a start and no end.

## The roll-call (1) — every kind of seat a man can be put on with no times

From Astra's roll-call (`docs/superpowers/briefs/2026-10-06-blank-times-absence-scenarios-astra.md` §1) and the test's
`SEATS` table. "Flagged" = a whole-day absence that bars the seat raises its line, ring and chip with no times typed.

| Seat | How it comes up with no times | Before | After | By |
|---|---|---|---|---|
| A flying line | "+ Line", "+ Wave"; a cleared or unreadable take-off; a landing typed alone | silent | flagged | unit (oracle); e2e; host H1; A |
| SC MAIN | the shift's start and end cleared | silent | flagged; Meeting amber, no clock | unit; A H-01 |
| SC SPARE | the same | silent | overseas and medical flagged; local leave not | unit; A H-01, S01 |
| AVALON / BB MAIN and SPARE | BB is minted with no shift times; AVALON's cleared | silent | overseas and medical (ATT B too) flagged; local leave not | unit; e2e; host H3.1; A S01, S12 |
| AVALON / BB desk (a template's "For wave") | its hours cleared | silent | overseas and medical flagged; ATT B and local leave not | unit; A S01, S12 |
| A duty desk, and a man added under its row | "+ Row" / a template with no hours | silent | flagged; ATT B not | unit; A H-01, H-02, S14 |
| An OFT / AMT seat, passenger, a man under the row | "+ Row"; an AMT block's three rows | silent | flagged; ATT B not | unit; A S13 |
| A Ground Programme row, and a man added under it | "+ Item" | silent | flagged; ATT B not | unit; host H3.2; A S14 |
| A request's own row (an all-day request put on the programme) | by construction | silent | still silent for ITS man and ITS request; flagged for anyone else's absence | unit; B S15 |
| A Common Programme row | "+ Item" | silent | flagged; ATT B not | unit; A S14 |
| An ⓘ info-only row; a cancelled row, line or aircraft | — | never checked | never checked | unit; A S22 |
| A placeholder puck (ALL, ALL AVAIL) | — | nobody | nobody | unit; A S23 |
| A row with a start and no end | — | has its assumed hour | unchanged | unit |

## The roll-call (2) — every place the app shows or uses a leave / downchit warning

| Place | The new warning reaches it | By |
|---|---|---|
| Edit Schedule's day warning list | yes — the line, word for word | host H1–H4; A, B |
| Scheduler Board's issue list | yes | A, C |
| The drop toast | yes — it now names the warning, not only the crew list's reason | host H1.1, H3 |
| The crew list before a drop (struck name and its reason) | unchanged — it already struck him | host; A; pinned one-way in `blankabsence.test.ts` |
| Cockpit puck; duty, sim, ground, Common Programme pucks; the Unavailable row's and Personal Inputs row's copies | yes — red ring and C chip, painted | host (computed style); e2e; A |
| The exempt line's own puck (SC SPARE, AVALON, BB) and the exempt desk's | yes — it rings for its OWN warning | e2e (BB); `overnight.test.ts`; host H3.1; A |
| …an SC SPARE puck when the SAME man also sits in a MAIN seat of that formation | it wears the MAIN's leave ring — OLD ownership quirk, filed `[SC-SPARE-RING-BORROWS]` | host (unit probe); C H-05 |
| View-only Sched's published face; the 👁 look at a version | only what the day went out with — frozen | `latepub.test.tsx`; host H4; D |
| The day's "N pending" and the four sign-offs | a filing after publication is the one pending change; the sign-offs fall | `latepub.test.tsx`; host H4.1; D |
| A hidden warning | follows the shared hide | D S28 |
| The ALL AVAIL window's flagged count and reasons | yes, when he stands in the crowd | C S29 |
| Insights' issue counts | counts it, by the page's copy | D S30 |
| The Logic page | states the rule | unit; B H-03 |
| The PDF / CSV exports; the next-week peek | draw no warning, by design | D S38 (recorded) |

## The walk

Four walkers (Sonnet 5.5 — D588), each in its own world on its own server, on the frozen fixed build (the build before
the last wording fix — "this duty row" for "this row", below; the host re-walked that on the final build). Astra designed
the scenarios (S01–S38, the oracle table, the publication orders); the host added H-01 to H-06. The brief:
`docs/superpowers/briefs/2026-10-06-blank-times-absence-walk-brief.md`. Their reports, tables and scripts:
`docs/handpass/parts/bta-{A,B,C,D}.md`, `.json`, `scripts/handpass/bta-{A,B,C,D}-*.mjs`.

| Walker | Share | Rows | Result |
|---|---|---|---|
| A — every kind of seat | H-01 (the oracle on screen: 9 kinds of input × 10 kinds of seat, each with no times, then with times, then cleared — all 90 cells), H-02, S01, S12, S13, S14, S19, S22, S23, S24; desktop, and phone for H-02 and S01 | 270 | 251 PASS, 16 recorded, 1 partial, **2 FAIL** — both H-02 (below) |
| B — the input side | S03 (Upchit), S04 and S05 (custom whole-day hours, put on the programme, to Unavailable, taken off), S15, S17, S18, S25 (filed, edited, moved, deleted from the Inputs list, the calendar, the Medical view, the Leave War, the board's Unavailable row), S26, S27, H-03; desktop, and phone for S04 and H-03 | 159 | 125 PASS, 31 recorded, **3 FAIL** — none the rule's (below) |
| C — the crew list and an SC seat | S08–S11, S32–S35, S20, H-04, H-05, S29, S36; desktop, and phone for S08 and S10; tap, a real drag and its bubble | 98 | 80 PASS, 13 recorded, 5 partial, 0 FAIL |
| D — published days | S06, S07, H-06, twelve publication orders (six with a leave filed, six with a leave lifted — the working copy, the published face, the 👁 look, "N pending" and the sign-off line read at every step), S28, S30, S31, S37, S38; desktop, and phone for S06 and H-06 | 178 | 150 PASS, 28 recorded, 0 FAIL |

No browser error in any walker's run.

**What the walkers found, and each disposition** (a walker's conclusion is not a finding until the host reproduces it):

| Find | Host's check | Disposition |
|---|---|---|
| **A H-02, B F-B1 — a man on three brand-new rows (duty, sim, ground; no names, no times) gets ONE line**, and adding the second row seems to remove the first row's line; every puck still rings | reproduced: the three sentences were identical ("… but tasked — this row") and the list folds identical sentences into one line (its standing rule) | **FIXED**, red first — a row with no name says which kind it is ("this duty row", "this sim row", "this ground row"); re-walked on the final build with walker A's own script: three lines, each replaced by the row's name when it is typed |
| **A — a BB / AVALON desk with no role typed reads "OL but on  duty — overseas"** (a hole), with hours and without | reproduced in a unit run; the standby look's sentence was outside the fallback | **FIXED**, red first — "OL but on this duty row — overseas" |
| A — an unnamed Common Programme row reads "— programme" | as built: that row's own standing fallback word | not a finding |
| A — "SC NIGHT currency needed for SC AM (NaN:NaN–NaN:NaN)" on a blank SC shift | the currency check, untouched | OLD — already filed `[SC-BLANK-SHIFT-QUAL]` |
| A S24 — the second press of an OFT row's "+" for a man already on it is refused with no message | not reproduced by the host; not this rule | FILED `[OFT-ADD-TWICE-SILENT]` (low) |
| A S22 — with four rows carrying him, a cancelled row's puck keeps his red ring while his other rows still flag him | as built: an ordinary puck wears the man's flag for the DAY, whichever row raised it | not a finding |
| **B S26 — an Upchit moved to a LATER date does not give back the medical days it cut**; and the published days it touched read "1 pending" | the pending marks are as ruled (D178, D189 — the "till <date>" note a published day printed is out of date); the first part is the Upchit's own write path, untouched by this change; not reproduced by the host | the first part FILED `[UPCHIT-MOVE-NO-REGROW]` (low, a question for him); the rest not a finding |
| B S18 — a flight 00:00–00:00 against an absence 00:01–23:59 flagged | the walker's own probe: the debrief pad reaches 00:01 — a real overlap | not a finding (its FAIL row is the probe's) |
| **B F-B3 — ONE run of its S03 script showed no warning at all after the downchit was filed**; two earlier and seven later runs of the same script were normal; its pictures were overwritten | not reproduced: the host ran that script five more times on the final build — the downchit flagged every time | UNEXPLAINED, not reproduced in 14 runs; recorded here, nothing to fix or file |
| C H-05 — one man in a MAIN and a SPARE seat of one SC line, local leave: the SPARE puck wears the red ring too, blank and typed | reproduced (Astra's F3) | OLD — FILED `[SC-SPARE-RING-BORROWS]` |
| C H-04 — the placed crew-rest line reads "… but SC AM starts 05:00" where 05:00 is the in-time | seen by the host too (H5.3) | OLD wording — FILED `[SC-INTIME-REST-WORDS]` |
| C S29 — the ALL AVAIL window never shows a man with a whole-day input: he is not in the crowd at all | by design — a man away or committed all day is not available, so this reader cannot carry the warning | not a finding (the roll-call row says so) |
| C S34 — an EMPTY SC formation with an early in-time says nothing before the drop | the known limit | already filed `[REST-FIRST-CREW-HINT]` |
| D — the 👁 look at the Original read "1 pending" in its head while the working copy read "2 pending" (a man seated and a leave filed after publishing) | not reproduced by the host; not this rule | FILED `[LOOK-PENDING-COUNT]` (low) |
| The crew list strikes a name where the list then says nothing — a part-day absence on any seat with no times (B S18), a local leave on a blank standby seat (A H-01) | as the brief said | recorded; the second is `[BLANK-STANDBY-STRIKE]` |

**The re-walk on the FINAL build** (after the two wording fixes above — the walkers' fixes touched sentences only):
the host's whole walk again, H1–H5, 23 rows, all PASS (`…/rewalk/`, 36 pictures); walker A's H-02 script: three lines
for the three unnamed rows, each renamed in turn (`…/rewalk-rows/` — its judge still expected the old words, so its
own verdicts read FAIL; the screen's words are quoted in the table above); walker B's S03 script five times
(`…/rewalk-s03/1/` kept).

**Pictures the host opened itself** (15): the fault before and after (the blank line's puck and the day's list on both
builds), the crew list with the seat armed, the BB seat's own puck, the ground row, the published face, the armed SC
MAIN seat; C — the armed SC seat with "crew rest — not clear until 12:30" (and five other men struck the same way for
the same 05:00 in-time), the forward "breaks Wednesday: he must be gone by 18:00", the MAIN-and-SPARE pucks; D — the
published face still ringed after the leave was lifted, and the working copy beside it, plain. Each showed what its
walker reported. The walkers opened 29 (A), about 39 (B), 19 (C) and about 175 (D — every published-day step).

### The five gotcha families

| Family | Walked as | Result |
|---|---|---|
| People not following the format | hours typed 00:00–23:59 instead of the All day tick (B S04, S05); 00:01–23:59 and 22:00–02:00 (B S18); B typed as 0500 / 05:00 / 0500H, 12:90, 25:00 (C S20) | the tick and the full-day hours answer alike; a near-whole day is a part day; an unreadable time is refused and put back |
| Missing input | the whole job — every kind of seat with no times (A H-01); no name either (A H-02); an end with no start, a start with no end (A S19); a shift with no hours but a typed in-time (C S09); an empty formation (C S34) | a missing time is never read as a time; a whole-day absence needs none; the rule is said on the Logic page |
| User errors | the same man put on a row twice, both seats of one jet (A S24); a placeholder on a cockpit (A S23, 28 tries); the 12:29 / 12:30 / 12:31 edge (C S32); a template on a published day (D S31) | refused or warned as before; the edge is to the minute |
| Deletions and edits from another page | the absence filed, shortened, re-typed, moved to another day and deleted from the Inputs list, the calendar's editor, the Medical view, the Leave War (bid, approve, move, delete) and the board's own Unavailable row (B S25); an Upchit (B S03, S26); a request put on the programme, moved to Unavailable, taken off, accepted again (B S05); CX and ⓘ (A S22) | every reader follows at once, on every page |
| Sync between copies | the working copy, the published face, the 👁 look, "N pending", the sign-offs, Insights, a hidden warning, a saved plan, a loaded version, the member's and the guest's face (D); the crew list before against the list after (A, C; the unit test on every kind of seat) | the published face moves only with an amendment; no man the list flags was offered clean |

### Orders (both ways each; Undo, Redo, reload where it applies)

Seat the man ↔ file the absence · seat ↔ type or clear the seat's times, its name · file ↔ lift, shorten, move the
absence · put a request on the programme ↔ take it off ↔ move it to Unavailable · CX / ⓘ ↔ restore · hide ↔ unhide ·
a sibling seated ↔ removed (Undo / Redo) with the SC seat armed · and across publishing: every order of {seat, file or
lift, publish, amend} — twelve orders (D). The same final words, rings and pending count in both orders of every pair.

## Tests, red first

- `src/engine/blankabsence.test.ts` — 82 cases. The `SEATS` table is the roll-call: thirteen kinds of seat, each made
  with no times in the app's own shape. Written before the fix: 36 of its first 54 failed on the unfixed rule. The
  loops: every input type raises the same codes with and without times; **the exact oracle** (every type × every seat,
  nine groups × six families, no times and times typed — added after Astra showed "the same before and after" passes on
  two equally wrong answers); the ring and the chip on every kind; the sentence (a named line, "this line", each kind
  of unnamed row by its own words — three rows, three lines — an unnamed standby desk, no clock, the standby lines' own
  words); the half left as it was on every kind (a
  morning-only leave, two hours, tomorrow's and yesterday's whole day); an info-only row, a cancelled row and line, a
  placeholder; a start with no end; a standby line's currency and two-places looks still inert; an Upchit; a whole-day
  request already on the programme (00:00–23:59 and to 24:00; taken off; its own row with hours and with them
  cleared); the crew list's strike against the list's flag on every kind.
- `src/engine/scpickerrest.test.ts` — 10 cases: 3 red before the fix (a typed in-time with the shift typed and blank;
  forward), the negative control (a SPARE seat — red when the guard is cut), and the half left as it was.
- `src/ui/latepub.test.tsx` — 2 new cases on a published day (goes out WITH the warning; a leave filed afterwards).
- `src/ui/logic.test.tsx` — 1 new case: the Logic page's row.
- `e2e/blankabsence.spec.ts` — 2 browser tests through the real controls, the ring asserted as PAINTED: both red on
  the unfixed rule, both green on the fix.
- Three older tests had written the silence down as known and now state the rule: `audit-c-times.test.ts` ("KNOWN
  HOLE, now pinned … the line vanishes from the conflict engine rather than failing closed"), `avalon-rules.test.ts`
  ("a BB shift with BLANK times checks nothing"), `overnight.test.ts` (two cases). Each keeps its other half — the
  part-day absence, the currency and two-places looks, an exempt copy ringing only for its own rule.

### Break tests — each part of the fix cut once, on purpose

`breaks.py` in the session's scratch folder, against the seven pinning files (267 cases): 24 cuts, every one red.

| Part cut | Went red |
|---|---|
| the flying-line check: a seat with no usable hours | 14 |
| …judged against the whole-day list, not every input | 4 |
| the duty / sim / ground check: an SC MAIN with cleared times | 8 |
| the Meeting's amber sentence prints no clock | 2 |
| the SC SPARE check | 5 |
| the time-less rows: the whole look | 44 |
| …a standby place bars only what cannot spare | 10 |
| …ATT B may work an AVALON / BB desk | 3 |
| …ATT B may work a desk, a sim or a ground row | 15 |
| …the ring and the chip | 7 (no test at first — written, then red) |
| "this line" | 2 |
| "this row" | 2 |
| an unnamed sim / duty row | 1 |
| whole day, not part of it | 15 |
| collect: an AVALON / BB seat · its desk · a sim box · a duty / ground / programme row | 12 · 5 · 11 · 22 |
| its own request is not a clash | 2 |
| a whole-day request already on the programme still counts | 3 |
| an Upchit is turned away | 4 |
| the crew list: a shift sibling counts | 3 |
| the crew list: an exempt seat borrows nothing | 2 |
| the Logic page row | 1 |
| a guard against a neighbouring day's copy | none — proved to do nothing (such a copy is shifted a whole day and can never be "the whole of today"), so it was REMOVED rather than left untested |

## Astra's scenario read — four finds by reading, each tried by the host before anything was changed

`docs/superpowers/briefs/2026-10-06-blank-times-absence-scenarios-astra.md` §4. A reviewer's claim is a finding only
once reproduced; each was run through the rule in a throwaway test, and compared with the unchanged timed path.

| Find | Host's check | Disposition |
|---|---|---|
| F1 — an Upchit raises "Upchit clashes with …" / "Upchit but tasked — …" | reproduced — on a TIMED seat too, so OLD (the same on the live app); the new rule would have carried it to every seat with no times | **FIXED**, red first (the oracle's Upchit row; its own test) |
| F2 — a request typed 00:00–23:59 and put on the Ground Programme goes silent against his other seat with no times (the All day tick does not) | reproduced — NEW (a gap in this rule) | **FIXED**, red first (`day.whole`, asked undeferred) |
| F3 — one man in a MAIN and a SPARE seat of one SC formation: the SPARE puck wears the MAIN's leave ring | reproduced, with the shift's times blank and typed — OLD (the puck drawer's key-prefix match); needs one man in two seats of one shift | **FILED** `[SC-SPARE-RING-BORROWS]` (low) |
| F4 — an unnamed sim or duty row prints "— Sim" / "— duty" | reproduced — NEW (the fallback missed the built-up labels) | **FIXED**, red first |

Its meaning read of D605's short line (D138): **preserves the ruling**; reading (7)'s "`[BLANK-STANDBY-STRIKE]`, filed"
was not yet true when it read — the item is filed now.

## What was NOT walked, and why

- **His iPhone.** Every phone step ran in Chromium's phone emulation.
- **Phone size** beyond the scenarios named against a phone above: the rule's result does not depend on the screen; the
  places that DRAW it (the list, the puck, the crew drawer, the published face) were walked at both sizes.
- **The final build by walkers A–D**: they walked the build before two sentences were reworded ("this duty row" …); the
  host re-ran its whole walk, the three-rows case and the S03 repeats on the final build, and the gates ran on it.
- **Undo → Redo → reload after EVERY change of EVERY scenario** (Astra's protocol): walked for S01, S22 (A), S06, S07 and
  nine of the twelve orders (D), the sibling in S34 (C), the Inputs-page edits (B); not after each cell of the oracle.
- **The whole pairwise matrix of actions** in Astra's "broader action-order requirement": the pairs in §Orders were
  walked; the rest (a MAIN / SPARE flip, a day template, a plan) only where a scenario of its own carried them.
- **The ALL AVAIL window as a reader of the new warning** (S29): a man away all day is not in the crowd — nothing to read.
- **AVALON / BB crew-rest drag bubbles** (C used the armed list and placement); a crew-list drag for S11, S33, S34.
- **The Sunday before the demo week** (S17's far neighbour), **hours to 24:00** (no control accepts it — pinned in the
  unit test instead), **the browser's own print preview and a PDF** (the app's print page and the CSV were read).
- **An AMT block's BRIEF and DEBRIEF rows**: a new block gives them no place for a person.

## Found and filed — none of it this change's doing (each is in `OUTSTANDING.md` with its place)

`[BLANK-STANDBY-STRIKE]` (low — the crew list strikes a man on local leave for a standby seat whose shift times are
blank) · `[SC-SPARE-RING-BORROWS]` (low — Astra's F3) · `[REQ-ROW-SELF-CLASH]` (low — times typed on an all-day
request's own row flag its own man) · `[SC-INTIME-REST-WORDS]` (low — the crew-rest sentence calls an SC line's in-time
its "start") · `[UPCHIT-MOVE-NO-REGROW]` (low, a question for him — walker B) · `[OFT-ADD-TWICE-SILENT]` (low — walker
A) · `[LOOK-PENDING-COUNT]` (low — walker D).

## The gates

*(Filled in from the run on the final code.)*

## The two code reads (Astra, and Sol 6.1 second, each blind to the other — D590, D601)

*(Filled in when both reports were in.)*

## His look — the "look here" card

*(Written last.)*
