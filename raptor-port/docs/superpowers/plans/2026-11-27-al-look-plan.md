# [AL-LOOK] — build plan for the new amendment look

Written 27 Nov 26 by a fresh Fable planner, overnight, plan only. Nothing in the repo was changed, built or run.
Read from: the checkout `C:/Users/User/projects/Raptor-readings` (branch `claude/readings-lapse-fix-fdbb3c`) for the
rulings, the study and the try-out; `origin/main` (at `2eaab2769`) for the app code.

Status of this plan: a DRAFT for its red team (Astra and a fresh Opus, each blind) and then his look. Not an approval
to build. Section 1 is written for him; sections 2 to 7 are for the builder and the readers.

## 0. Three things the host must know first

1. **The job's records are not on `main`.** `[AL-LOOK]`, `[AL-MARK-GAPS]`, the rulings D2618, D2619, D2735 to D2738,
   design lesson 150, the try-out folder and Fable's study exist only on `claude/readings-lapse-fix-fdbb3c` (85
   commits ahead of `main`, 132 behind). The build branch is cut from `main`, so either that branch merges first (it
   carries rule files, so it needs his "merge live") or the build branch brings it in. Decide before step 1.
2. **The backlog holds only the two priority lines** (`OUTSTANDING.md` lines 167 and 168). There is no `### [AL-LOOK]`
   item body. This plan should be linked from the line once it is filed in the repo.
3. **The try-out was captured from the app as it stood 132 commits ago.** The week and board renderers have changed on
   `main` since (60 lines across three files, none touching a mark). The drawing check (section 5) needs the busy day
   staged and captured again on the build's own base, or it compares against an old screen.

Nothing on any open branch changes the mark rules today (four old branches touch the same stylesheet; none is live
work on marks).

## 1. What he will see

All of this applies only to a day that has been published, as today. A draft day shows no amendment mark (owner,
25 Aug 26, unchanged). Phone and desktop are the same unless said.

### 1.1 A changed time, name, area or remark

- The changed words take the amendment's colour. The small "AL1", "AL2" words beside or under them are gone. On the
  Scheduler Board the coloured box round a changed box is gone too. (D2619)
- A thin line sits under the words only where the change is new:
  - the day's **newest published** amendment: a solid line;
  - changes **waiting** to go out: a dotted line;
  - every **older** amendment on that day: colour only, no line. (D2618)
- "Newest" is each day's own. Monday at AL3 and Tuesday at AL1 are judged separately (his fixed rule that each day
  keeps its own AL track, 11 Sep 26).
- On the Scheduler Board, where a time or remark is a typing box, the line is drawn inside the box near its foot,
  never round it (the try-out he picked, D2619).
- A jet whose stores changed: the stores chips take the colour (their edge dotted while waiting); the remark's own
  words, which did not change, stay as they are (the try-out he picked, D2619).
- Nothing gets extra room. No row moves, grows or wraps because it is marked (the try-out's measured rule: at least
  2px clear under every line, nothing cut off).
- Hovering a changed thing still says "Changed at AL3" or "Edited, goes out as AL4" (unchanged; the study's point 4).

### 1.2 A changed puck

- The puck keeps its own colours and its edge keeps only its warnings (D92, D93, unchanged).
- Changed in the newest published amendment, or waiting: a small **number** in the puck's top-right corner, in the
  amendment's colour. Solid once out, hollow and dotted while waiting. It says "6", not "AL6". (D2619)
- Changed in an older amendment: a small plain mark in that amendment's colour, **smaller and quieter** than the
  number, never wider or bolder (D2737, design lesson 150). The try-out, redrawn after his correction, draws it as a
  5px dot inside the corner. See question 2.

### 1.3 The "Changed in" line

- Under the day's "Signed" line, one slim line: "CHANGED IN AL1 AL2 AL3 … ", each name in its colour and drawn as its
  marks are: the newest published one underlined solid, a waiting one underlined dotted with the word "waiting",
  older ones colour only. This is the key to the colours. (D2619)
- It appears wherever the Signed line appears: Edit Schedule, View-only Sched and the Scheduler Board (D95, D102 for
  the Signed line; the try-out for the key).
- A day with nothing changed shows no such line.

### 1.4 The seven colours

AL1 lemon, AL2 orange, AL3 mint, AL4 lilac, AL5 green, AL6 azure, AL7 and every later one pink (D2619). AL2 stays
orange though Personal Inputs shares it (D2738). AL5 stays green (D2736). No colour-blind switch, and colour-blind
reading is not a test of this look (D2735).

### 1.5 What does not change

- The day's own version tag ("ORIG", "AL6") at the head of the day, the tag in the Signed line, the plans menu's list
  of versions, "Publish AL7", "Waiting to go out as AL7" at the head of the pending list, the Amendments box and the
  day details panel: these name a version, they are not marks on a changed thing, so they keep the "ALn" words and
  simply take the new colours. **This is the agent's reading** of "no ALn words" in D2619, taken from the try-out he
  picked (which left them as they are) and the study's point 4. It is named to him with the build's pictures.
- The ORIG seal (D110, D111), "Not yet signed / Not yet published" (D97), the "OG" tag on a draft day (D172), the
  pending count and list, undo, every bell line, every toast, the CSV and the printed PDF (a plain table that has
  never carried marks).

### 1.6 Earlier rulings this look changes (later wins, D90; told to him, not asked)

| Followed | Set aside, in part | What changes |
|---|---|---|
| D2619, D2737 (26 Nov 26) | D92, D93 (24 Sep 26) | "marked by its ALn tag alone, solid out, hollow waiting": the tag becomes a number or a small plain mark. "Never a ring" stands. |
| D2619 (26 Nov 26) | `[AMEND-SMALL-SEEN]` 4 (28 Sep 26) | "the tag sits on its own line under a time": there is no tag any more. |
| D2619 (26 Nov 26) | D362 (29 Sep 26) | "AL8 and later share AL7's colour, the tag's number telling them apart": they now share pink, and words carry no number. Only a puck's number, the "Changed in" line and the hover words tell AL7 from AL8. |
| D2619 (26 Nov 26) | D1784 (8 Nov 26), the board half | "its name box outlined dotted on the board": see question 6. |

### 1.7 Questions for him

Each needs a picture of the real app beside it when it is put to him (D853, D2439). None is decided here.

**Q1. The exact pink and orange.** The record says the seven hex values are "the agent's reading, to be confirmed
against his pictures when built". Two had a near neighbour in the try-out's list: the pink (the brighter one he had
before, or a paler one) and the orange (a lighter one, or today's darker AL7 orange).
*The case:* he tapped his seven colours in the try-out on 26 Nov; the host read the values off his picture.
*Recommend:* the try-out's "Your pick" values as recorded (lemon F8F337, orange FF9548, mint 4FEBC8, lilac D9B3FF,
green 3DE86B, azure 19AFFE, pink FF7FC4), confirmed by his look at the build's first pictures.
*Waits on it:* nothing; the build starts with these and one value is a one-line change.

**Q2. An older amendment's mark on a puck: the small dot.** He picked "a plain tab on older ones", then corrected it:
the tab was wider than the newest's number and pulled the eye (D2737). The try-out was redrawn with a 5px dot inside
the corner. The still pictures on the page still show the old wide tab; I found no record that he has seen the dot.
*The case:* a scheduler opens Monday at AL6. Wisp's seat changed in AL3. Today it wears a solid "AL3" tag.
*Recommend:* the dot, as the try-out now draws it.
*Waits on it:* the puck step (step 4). The rest can be built.

**Q3. Looking back at an older version.** A scheduler or member opens Monday, now at AL6, and uses the eye or the
version picker to look at Monday as it went out at AL3. Today that look shows AL1 to AL3's marks with their tags.
*Not settled:* which amendment gets the solid line in that look. D2618 says "the day's newest published AL".
*Recommend:* the version being looked at (AL3) is the newest on that face, so AL3's changes are lined and AL1, AL2 are
colour only; the "Changed in" line lists AL1 to AL3. It then reads exactly as the day did when AL3 was current.
*Waits on it:* step 2 (it decides one rule in the engine). A wrong guess is cheap to change before the walk.

**Q4. The newest amendment changed nothing you can point at.** AL3 only removed a row, or only changed what the day
earns in OIL, or only a warning. No word or puck wears AL3's colour (a removed row leaves no mark, by D91 and the
contract).
*Today:* the day's tag says AL3; no cell says AL3.
*Not settled:* (a) does anything get a line that day, and (b) does "Changed in" list AL3?
*Recommend:* (a) nothing is lined: AL2 is no longer the newest, so its changes are colour only; (b) the line lists
only amendments that have a mark showing, since it is the key to the colours, and the day's own tag already says AL3.
*Waits on it:* steps 2 and 5. Note the try-out's own script gets (a) wrong (it takes "newest" from the marks on
screen and would line AL2); the build must not copy that.

**Q5. A changed thing that is now empty.** A scheduler clears a flight remark or an area on a published day. Today
the empty cell keeps a dotted coloured box, so the waiting change can be seen. In the new look the box is gone and a
line under no words draws nothing, so on Edit Schedule and View-only Sched the change would be invisible (the board's
boxes still show their line). The try-out drew this only for an emptied time, as part of the missing-time rule.
*Recommend:* an emptied, marked place on the week keeps a short line of its kind (dotted waiting, solid if newest,
nothing if older) where the words were, as the try-out does for an emptied time. To be drawn for him first (D1625).
*Waits on it:* part of step 3; the rest of step 3 can be built.

**Q6. A request filed after publishing, on its Unavailable row.** D1784: on the week its name is underlined dotted in
the amendment's colour; on the board its name box (the coloured type pill) is outlined dotted. The try-out's staged
requests were all accepted, so they showed on the Ground Programme only; this row was never drawn in the new look.
*Recommend:* the week: unchanged (already colour and a dotted line). The board: the pill keeps its own colours and
gets the dotted line inside its foot like every other box, in place of the dotted outline. To be drawn first.
*Waits on it:* one rule in step 3.

**Q7. The two places that wear no mark at all today ([AL-MARK-GAPS]).** A wave's Traffic lines changed on a published
day, and the outside squadron's typed crew name on a sim changed: each is counted and listed as waiting, and neither
shows any mark, in the old look or the new.
*Recommend:* fix both in this build (same screens, same check): the typed crew name marked like any other name; the
wave's "Traffic" button's word in the amendment's colour with the line, since the lines themselves sit in a window.
Both are new things on screen, so both are drawn first (D1625).
*Waits on it:* step 7 only.

**Told to him with the build, not asked:** D2735's note that admins and ground crew were not checked for colour
vision; the Legend fold gets no amendment line (the "Changed in" line is the key, D2619); the missing-time red outline
beside the marks is still his open question on the try-out page and belongs to [END-TIME-GUARD], which is not built
on `main`, so the two never meet in this job (whichever is built second draws the meeting, as the try-out shows it).

## 2. The roll-call: every place the app draws an amendment mark, tag or version label

Found by searching `origin/main` for `data-alc`, `data-aln`, `data-alp`, `--alc`, `alColor`, `verchip`, `verLabel`,
`alAttr(` (27 callers: week 8, board 17, history bubble 1, peek 1) and `unavPendAtt`. "New look" = colour, the line
by D2618, no words.

### 2.1 Marks on changed things

| # | Place | Drawn by | Today | Verdict for the new look |
|---|---|---|---|---|
| 1 | Edit Schedule: every typed text (programme name, times, labels, block labels, wave labels, callsign, mission, R/B/TO/LD, duty and sim times, ground rows, remarks, notes) | `ted()` → `alAttr` (`html.ts`) | underline + trailing "ALn" (under a time) | HAS IT: new look |
| 2 | Edit Schedule: area, area time, in-time line, remark cell (stores) | `.areacell .timecell .intimes .rmkcell` + `alAttr` | coloured box + "ALn" | HAS IT: new look; stores chips coloured instead of the cell |
| 3 | Edit Schedule: pucks in flying, sim, duty, programme and ground seats | `slotCell`, `.seat` + `alAttr` | "ALn" tag, solid / hollow | HAS IT: number or small mark |
| 4 | Edit Schedule: an emptied cockpit seat once issued (D91) | `.seat[data-alc]::after` on an empty seat | "ALn" badge on the empty place | HAS IT: number or small mark; MISSING from the try-out, add to the drawing check |
| 5 | Edit Schedule: Unavailable row's name (a request waiting) | `unavPendAtt` | dotted underline, colour | HAS IT while waiting; MUST NOT once out, because D1784 says "until the day's next amendment goes out" and the app never marks it after |
| 6 | Edit Schedule: block notes / scheduler notes | `alAttr` on the note (`html.ts` 848) | underline + "ALn" | HAS IT: new look |
| 7 | View-only Sched, issued face | same builders inside the snapshot swap | published marks only | HAS IT: published marks, newest lined; MUST NOT show waiting marks, because the issued face is the document as it went out |
| 8 | View-only Sched, working-draft face | same builders | waiting marks too (D93) | HAS IT: waiting marks dotted, number hollow |
| 9 | A look at an older version (the eye, the picker, the board's preview strip) | `withDaySnap` swap | that version's marks | HAS IT: per Q3 |
| 10 | A look at a parked plan | `withDaySnap` on a plan | the plan's stored marks, if any | HAS IT only as the published marks it sits on; MUST NOT draw waiting marks, because a plan is not the working copy (builder to confirm what a plan's snapshot holds; a test either way) |
| 11 | Scheduler Board: every box (callsign, mission, rally, times, remarks, notes, day notes, programme and duty times) | `boxHTML` + `alAttr` (`board.ts`, `board-html.ts`) | coloured outline, solid / dotted | HAS IT: colour + line inside the box, no outline |
| 12 | Scheduler Board: area, area time, in-time line, remark cell | as 2 | box + "ALn" | HAS IT: as 2 |
| 13 | Scheduler Board: pucks and empty seats | `.seat` + `alAttr` | "ALn" tag | HAS IT: as 3 and 4 |
| 14 | Scheduler Board: Unavailable row's type pill | `unavPendAtt` (`board-html.ts` 742) | dotted outline (D1784) | HAS IT: per Q6 |
| 15 | Scheduler Board in OIL mode | `!oilModeOn(di)` guard | no Unavailable waiting mark | MUST NOT, because OIL mode already hides it today and this job changes no rule |
| 16 | A puck that also wears the OIL count chip | `.seat:has(> .oilcount)…::after` (`20-changes-quals.css`) | the tag moves to the other corner | HAS IT: the number and the small mark must move the same way |
| 17 | A puck being dragged (the lifted copy) | `11-drag.css` veil note on `.seat[data-alc]::after` | the tag must not swallow the veil | HAS IT: re-check with the new mark |
| 18 | History's hover bubble and "help" cursor on a marked thing | `histbubble.ts`, `.hist-on [data-alc]` | title words, cursor | HAS IT: unchanged; the hover words keep "AL" (not a mark) |
| 19 | The flash when a change lands on a published day | `interactions.ts` 256, `alColor(nextSeq)` | a ring in the next AL's colour | HAS IT: takes the new colour by itself |
| 20 | Next week's peek day beside the week | `peek.ts` | deliberately no marks (this week's keys would paint it) | MUST NOT, because the peek is another week's day and its marks would be this week's |
| 21 | A draft day, any surface | `alAttr` returns nothing | none | MUST NOT, because nothing has been issued (owner, 25 Aug 26) |
| 22 | The "OG" tag (a change new to you, draft day) | `data-og` | hollow "OG" | MUST NOT change, because it is not an amendment mark (D172) |
| 23 | ALL AVAIL / ALL window: a crowd changed on a published day | not built ([ALL-AVAIL-WINDOW-FLAGS], D2333) | nothing | MISSING, and stays so here: its own job; its drawing must use this puck mark |
| 24 | A wave's changed Traffic lines | `Modals.tsx` writes `tr:`; no drawer reads it | nothing | MISSING: [AL-MARK-GAPS], per Q7 |
| 25 | The outside squadron's typed sim crew name | (builder to locate the drawer) | nothing | MISSING: [AL-MARK-GAPS], per Q7 |
| 26 | A removed row; a man taken off a desk, crowd or sim seat | nothing left to mark | none (D91) | MUST NOT, because he ruled it (D91): counted and listed, never marked |

### 2.2 The key and the version labels

| # | Place | Drawn by | Today | Verdict |
|---|---|---|---|---|
| 27 | "Changed in" line, Edit Schedule | new, after `signedLineHTML` | absent | MISSING: build it |
| 28 | "Changed in" line, View-only Sched | new | absent | MISSING: build it (published only on the issued face) |
| 29 | "Changed in" line, Scheduler Board | new, in the board's sign strip | absent | MISSING: build it |
| 30 | Day's version tag (day head on the week, the board's strip) | `verTagHTML` / `verChipHTML` | "AL6" on its colour | HAS IT: words stay (1.5), new colour; dark letters must still read on all seven |
| 31 | Signed line's tag | `signedLineHTML` | same chip | HAS IT: as 30 |
| 32 | Version picker ("AL6 — as issued"), plans menu's version list | `html.ts` 428, `board.ts` 1928 | plain words | MUST NOT change, because they are words, not colour |
| 33 | Preview bar and the dashed edge round a day being looked at | `.dprev-bar`, `.day.preview` (`alColor`) | that AL's colour | HAS IT: new colour by itself |
| 34 | Pending list's head "Waiting to go out as [AL7]" | `pendlist.ts` 678 | chip in next colour | HAS IT: new colour; words stay |
| 35 | Changes window's "To go out" tab and published head | `.cw-out .pl-head .verchip` | chip | HAS IT: as 34 |
| 36 | Amendments box (desktop only) tags | `ALPanel.tsx` `.al-tag` | "AL2 Mon · 3 items" outlined in colour | HAS IT: new colour; words stay. Check the generic text rule does not also underline it |
| 37 | Day details panel (the ⓘ) list of amendments | `.dip-al` | "AL2 3 items" in colour | HAS IT: as 36 |
| 38 | "Publish AL7" buttons, Unpublish titles, toasts ("Published AL2 · 3 items"), bell and history lines | plain words | words | MUST NOT change, because they are sentences naming a version |
| 39 | CSV export, printed PDF | `export.ts`, `printpdf.ts` ("Published — AL2") | a text table, no marks | MUST NOT, because the print is built from rows and has never carried marks (the study's "print keeps the small words" does not apply: there are none) |
| 40 | The Legend fold; the Logic and Help pages | `legendHTML` | no amendment line | MUST NOT, because the "Changed in" line is the key (D2619); adding one is not asked |
| 41 | Insights, OIL tracker, Leave War, Inputs pages, Tracker | — | no amendment marks | MUST NOT, because none draws the schedule's changed items |

## 3. Files and order

Each step: its failing tests first, then the change, then those tests and the touched suites green, then `npx tsc -b`.
One branch, one pull request, opened once step 5 is built.

**Step 0. Before any code** (host). His answers to Q2, Q3, Q4 at least; the drawings for Q5, Q6, Q7 put to him;
the readings branch dealt with (section 0). Open `raptor-port/docs/design-practices.md` head, §0, §4, §6, §9;
`scheduler.md`, `design.md`; `performance.md` Part 1; `ui-contracts.md` §Amendment marks on screen.

**Step 1. The seven colours.** `src/engine/publish.ts` (`AL_COLORS`, its comment) and
`src/ui/scheduler/04-pucks-sections.css` (the eight `--alc` rules, the catch-all becomes pink). Nothing else.
Smallest step; after it every tag and mark wears the new colours in the old shapes.

**Step 2. Which marks are "older".** The only logic in the job, and the risky part.
- What is needed: every published mark knows whether it belongs to the newest published amendment *of the version on
  screen* for its day. Recommended shape: `alAttr` adds one more attribute to an older published mark (say
  `data-alo="1"`), and the stylesheet does the rest. Nothing is stored; no saved data changes.
- "Newest" comes from the version, never from the marks present (Q4): the live working copy and the issued face use
  the day's current version; a look uses the version looked at (Q3, if he agrees). After an Unpublish the previous
  amendment is the newest again, by itself.
- Constraints the readers will hold it to: `alAttr` runs thousands of times a paint, so no walk of the amendment list
  per cell (one value per day per paint, however the builder carries it); a week with no amendments must emit
  byte-identical HTML (the parity and html gates); `publish.ts` is in `src/engine/`, so the change there is this
  behaviour only, in the file's own style.
- Files: `src/engine/publish.ts` (`alAttr`), `src/ui/html.ts` (`withDaySnap` or the day renderers, to say which
  version is on screen), `src/ui/board.ts` / `board-html.ts` only if the board draws a look outside the swap.

**Step 3. Words: colour and the line.** `04-pucks-sections.css` only (plus `20-changes-quals.css` if the Unavailable
rule lives there). Port the try-out's `src/looks.css` rules for look C into the app's own rules, without `!important`
and without the `alx-` classes: text takes the colour; underline 1px at offset 0, solid / dotted, not on an older
mark; the trailing "ALn" `::after` rules, the under-a-time rule and the cell outlines go; the board's boxes get the
inside line; stores chips; the emptied-place rule per Q5; the Unavailable pill per Q6. The old comments that told the
story move to the commit message, not deleted knowledge: the measured facts go into `ui-contracts.md`.

**Step 4. Pucks: the number and the small mark.** Same stylesheet: `.seat[data-alc]::after` (number, or the small
mark when older), `.seat[data-aln]::after` (hollow dotted number), the OIL-count offset rule, the drag veil.

**Step 5. The "Changed in" line.** A new small builder beside `signedLineHTML` in `src/ui/html.ts`, called where the
Signed line is called (the week's day head on both pages, `board.ts`'s sign strip and its preview strip). It reads
the day's marks for the face being drawn. Styles in `03-week.css` beside `.signedln` (wraps on a phone; names never
break mid-word). A screen reader gets "Changes on this day: AL1, AL2, AL7 waiting".

**Step 6. The other tags.** No code expected: check 30 to 37 of the roll-call in the running build, fix only what the
generic rules now catch by accident (the Amendments box and the day details panel are plain spans with `data-alc`).

**Step 7. [AL-MARK-GAPS]**, only if he says yes to Q7 and has seen the drawing: the Traffic button (week and board)
and the typed sim crew name read `alAttr` for their keys.

**Step 8. Records, in the same pull request.** `ui-contracts.md` §Amendment marks on screen rewritten as built;
`scheduler.md` lines for D92/D93, D2618, D2619 and D362 rewritten "as built", D1784's if Q6 changes it; the full rows
of D92, D93, D362, D1784 marked narrowed; `design-practices.md` §4's table row "An AL tag's colour"; `feature-impact.md`
Publishing / AL row; `file-map.md` (the try-out folder has no row; new test files); `OUTSTANDING.md` both items;
walk ledger; evidence sheet. A change inside `src` trims no document (D29).

### Tests to write first (each must fail before its step)

| Step | Test | Fails today because |
|---|---|---|
| 1 | `publish.test.ts`: `alColor(1..7)` are his seven, `alColor(8)` and `alColor(12)` are pink | old colours |
| 1 | new: the stylesheet's eight `--alc` rules equal `AL_COLORS` (read the CSS file, as `amendretest.test.tsx` already does) | no such test; the two lists are kept in step by a comment only |
| 1 | `publish.test.ts`: dark letters on each colour ≥ 4.5 (exists; must still pass) | passes; guard |
| 2 | unit (new file beside `amendbatch.test.tsx`): Monday ORIG → AL1 (a time) → AL2 (a name) → a remark waiting: AL1's mark is older, AL2's is not, the waiting one is neither | no older flag |
| 2 | …AL3 removes a row only: AL2's mark is now older; nothing on the day is "newest" | — |
| 2 | …Unpublish AL3: AL2's mark is newest again | — |
| 2 | …a look at AL1 while the day is at AL3: AL1's mark is not older (Q3) | — |
| 2 | …Tuesday at AL1 is untouched by Monday reaching AL3 | — |
| 2 | …the same cell changed in AL1 and again in AL3 wears AL3 only | passes today; guard |
| 2 | a week with no amendments: week and board HTML byte-identical to before (existing parity / html gates) | guard |
| 3 | `amendretest.test.tsx` (rules read from the CSS): no rule draws `'AL' attr(data-alc)` on a text mark; no outline in `--alc` on area, time, remark, in-time cells or board boxes; the line rules exclude an older mark | old rules present |
| 3 | browser test (new `e2e/al-look.spec.ts`, 402 and 1536, week, view page, board): a changed time, name, area, remark has the AL's text colour; underline solid / dotted / none by age; `::after` content is none; a marked row is exactly as tall as the same row unmarked | old look |
| 3 | browser test: the try-out's clearance measure ported (`mock/…/src/measure.js`): ≥ 2px under every line, none cut | no line there today / different offset |
| 3 | browser test: an emptied marked remark still shows a mark (Q5) | would be invisible |
| 4 | browser test: newest and waiting puck: `::after` content is the bare number; older: no content, box smaller in width and height than the number's; puck edge styles untouched | "AL3" |
| 5 | unit: the key's HTML for the staged Monday; none on a draft day; none with no marks; "waiting" entry; after the Signed line on the week, the view page and the board; per Q4 | absent |
| 5 | browser test: at 402 the line wraps inside the day, no sideways scroll | absent |
| 7 | unit: a changed Traffic set and a changed typed sim crew emit the mark attributes on a published day, none on a draft | none emitted |

### Existing tests that pin the old look and must be rewritten (never weakened: each keeps its purpose)

- `src/engine/publish.test.ts` 295 to 300: the six old colour values.
- `e2e/amendbatch.spec.ts` 35 to 60: "a changed puck wears its ALn tag" expects `::after` content to match "AL".
  Rewrite to number / small mark; keep the half that proves the puck's edge is untouched (D92, D93).
- `e2e/og-tag-count.spec.ts`: its `ALn` cases measure the tag's place and size on a lone puck and beside the OIL
  count. Rewrite the sizes for the number and the small mark; the "OG" cases stay as they are.
- `e2e/geometry.spec.ts` 713 to 740: "a changed time's ALn tag sits under the time". The tag is gone; replace with
  "a changed time adds no height and is not cut" in the same narrow boxes at both widths.
- `e2e/changeswin.spec.ts` 188 to 201: reads the "AL1" tag as the seat's `::after` beside the new-to-you dot. Rewrite
  to the number; keep the proof that the dot never takes the tag's place.
- `src/ui/amendretest.test.tsx` 547 to 553: "the hollow ALn tag, on every surface (D93)" matches a `content:` rule.
  Rewrite to the hollow number; keep "no outline on the seat or the puck".
- Pass unchanged, and must: `html.test.ts` 689 to 707, `planselector.test.tsx`, `pubsweep.test.tsx`,
  `editweek.test.tsx` 122 to 146 (the day's version tag still reads "ORIG" / "AL1"), `unavmark.test.tsx`,
  `interact.test.tsx` 604 to 613, `mission-role-interim-fixes.test.tsx`, `ALPanel.test.tsx`.
- Not gates, left as history: the old walk scripts under `scripts/handpass/am/` and `sf/sf-d4-altag.mjs` (they carry
  the old colours and tag shapes; new walk scripts are written for this job).

## 4. The bug check

### Tier: FULL

| # | Question | Answer |
|---|---|---|
| 1 | Money / OIL | NO: no figure, count or credit is read or written; only how a mark is drawn |
| 2 | The published record | **YES**: it changes how every amendment reads on the issued face and in a look at an older version |
| 3 | Saved data | NO, on condition: "older" is worked out at draw time and nothing new is stored. If the builder stores anything, YES |
| 4 | A shared drawer | **YES**: `alAttr` feeds 27 call sites; the rules style every surface |
| 5 | A new gesture or mode | NO: nothing new to press |
| 6 | A new surface | **YES**: the "Changed in" line, a new kind of row on three screens |
| 7 | Roles | NO: who sees which face is unchanged; proved by the walk on a member's View-only Sched |
| 8 | The warning list | NO: no warning, ring or flag is touched; proved by "the puck's edge is untouched" |

Question 2 alone makes it FULL, as the backlog line says. Order: build → pull request → roll-call (section 2, re-read
against the built code) and door check (none: no new gesture) → sizing step → walk → fix → the reads → fix →
re-walk what the fixes touched → sheet → his look → his "merge live".

Also in a FULL: the case seeded into the demo data. The demo week has no amendment at all, which is why none of this
was ever seen in ordinary use (lesson 25). Seed one day with an original, two amendments out and one change waiting,
if the demo's rules allow it; otherwise say so on the sheet.

### Walk scenarios — Fable's list (Astra designs his own, blind; the host combines)

Staging: the study's own scripts through the app's real boxes and Publish buttons (`stage.mjs` four amendments,
`stage2.mjs` seven with AL7 waiting), re-run on the build. Each scenario at his iPhone's size (402, WebKit) and a
desktop (1536, Chromium), pictures cropped to the place, plus one desktop pass in a browser started at 125%.

1. The busy Monday, AL6 out and AL7 waiting, on Edit Schedule, View-only Sched (member signed in) and the Scheduler
   Board: only AL6 solid-lined and AL7 dotted; AL1 to AL5 colour only; no "ALn" word on any changed thing.
2. Publish AL7 while watching one AL6 time: its line goes, its colour stays; AL7's dotted lines turn solid; the
   "Changed in" line updates; the number on AL6 pucks becomes the small mark. No reload.
3. Reload, sign out and in, change week and come back: identical.
4. Unpublish AL7: AL6 is lined again, AL7's changes are dotted and waiting again, numbers hollow.
5. Undo the publish (the top bar's Undo) and Redo it: same as 4 then 2.
6. A day whose newest amendment only removed a row (Q4): nothing lined; the key per his answer.
7. A day whose newest amendment only changed what the day earns in OIL (an OIL switch): same.
8. One cell changed in AL2, changed again and waiting: dotted, AL-next colour, no trace of AL2; then typed back to the
   published value: no mark, nothing pending (D98).
9. Look at AL3 with the eye from Edit Schedule, from the board, and with View-only Sched's picker, while the day is
   at AL6 (Q3); come back to the live copy: marks return to AL6-newest.
10. "Load onto working copy" of an older version: everything waiting, per D98, and the marks say so.
11. A parked plan brought out on a published day, and a look at a plan: no stray lines.
12. Two days side by side on a desktop: Monday at AL6, Tuesday at AL1, Wednesday draft. Tuesday's AL1 is lined;
    Monday's AL1 is not; Wednesday has no mark and no "Changed in" line. The peek day beside the week has none.
13. AL8 and AL9 on one day: both pink; the number on a puck reads 8 / 9; a two-figure number (AL10) fits the corner
    on a lone puck and beside the OIL count chip.
14. Pucks: newest, waiting, older, on a pilot, a WSO and a white ground-crew puck; with a red, amber and grey
    warning ring, a dashed late ring and a dotted crew-rest ring; with the OIL edge and the OIL count; an emptied
    cockpit seat after it went out (D91). The edge is never covered; the older mark is the quietest thing there.
15. Drag a marked puck, slowly and quickly, and drop it back: the lifted copy, the veil and the landing mark draw
    right; the corner mark is not smeared (lessons 2, 20).
16. Narrow boxes: a changed take-off over a changed landing; a duty's start beside its people; R / B on a phone.
    Nothing cut, nothing touching, row heights equal to an unmarked row (measured, not judged by eye: lesson 9).
17. A remark over stores chips with both changed in different amendments; a store pressed and waiting.
18. Emptied things: a remark, an area, a time, on the week and the board, waiting and after going out (Q5).
19. A request filed after publishing: its Unavailable row on the week and the board (Q6), in and out of OIL mode;
    then accepted onto the Ground Programme; then the amendment published (the Unavailable mark goes, D1784).
20. A crowd row (ALL AVAIL) where one man is added and one taken off on a published day (D113, D736): one number on
    the added man only.
21. Type in a box that wears a published mark: while typing, after leaving it, after an invalid time is refused.
22. The "Changed in" line: one amendment; seven; waiting only (ORIG + changes); on a phone where it wraps; under a
    Signed line with long names; on the board's strip with the panel dragged narrow; with the keyboard open on a
    phone (it must not push the day's controls off).
23. Every tag that keeps its words (roll-call 30 to 37): new colours, readable letters, no stray underline.
24. Hover and history: hover words on a newest, an older and a waiting mark; the History bubble; "N pending" opens
    the list and a tap lands on the marked place.
25. The plain-user round (D1557): publish a day, change three things, sign, publish AL1, read it as a member on a
    phone, export the CSV and the PDF (no marks, label right: lesson 18 is why the PDF is opened, not assumed).
26. Break tests, one per surface: remove the older rule (every AL lined), remove the colour for AL7+, put a tag's
    words back: each must turn a named test red.
27. His own devices: the look on his iPhone is his (Apple's font; a 1px line at offset 0 and a 5px dot are exactly
    the things a real phone may draw differently: lessons 6, 21, 22). Ask him for that look in particular.

### Readers

- Scenario design: Astra and a fresh, blind Fable (not this planner's list handed over as theirs: this list is
  Fable's; Astra's is made blind to it), combined by the host (D2443).
- Finished code, each blind, same brief: Astra; a fresh Opus that did not build it; a fresh Fable (high risk, D2440).
  Brief asks for absences against the roll-call, the hot-path cost, the parity guarantee, and "newest from the
  version, not from the marks". The brief carries the D56 exclusion and D785 (no non-admin scheduler).
- No security read: no sign-in, permission or what one person sees of another changes.
- The words: the only new words are "Changed in" and "waiting" (his ruling's own) and the screen-reader sentence;
  a fresh Fable checks that one sentence (D2441).
- Each fix round that rewrites logic gets its own narrow read by a fresh Opus (at most about three rounds).
- If Astra or Fable cannot run: a fresh Opus in the seat, and the job goes on the reads-owed list for his call.

### The drawing check (D1494, D1495)

- The approved drawing is the try-out set to "Your pick" (`raptor-port/docs/mock/2026-11-26-al-colours/`, its
  `src/looks.css` and `looks.js`), with the older puck mark as redrawn for D2737.
- First re-stage and re-capture the busy day on the build's base (section 0, point 3) and re-shoot the page's still
  pictures, which still show the old wide tab (the handoff's open point 3).
- A spec under `raptor-port/scripts/drawcheck/specs/` measures, on the same staged Monday in the built app and in the
  try-out, at 402 and 1536, on all three screens, with AL7 waiting and with all out: each mark's text colour, line
  style, thickness and distance under the baseline; each puck mark's size, place and colour; the key line's place,
  size, letter style and entries; the board box's inside line. Every difference over about 2px or any colour
  difference is listed with marked pictures side by side.
- Run as each of steps 3, 4, 5 is built and after every fix; red until each difference is fixed or he rules to keep
  it. Known differences to name to him, not hide: the "newest" rule where the try-out's script is wrong (Q4); anything
  his answers to Q2, Q5, Q6 change.

## 5. Risks and knock-on effects

1. **"Newest" worked out from the wrong thing.** First step: AL2 lined on a day at AL3. Second: a reader takes old
   changes for the latest and misses that AL3 removed a row. Third: on a look at an old version the page reads
   differently from how that version read on its day. Guard: step 2's tests, scenario 6, 7, 9.
2. **The hot paint path.** `alAttr` is called per cell per repaint. A per-cell walk of the amendment list would slow
   every week with amendments, worst on his slow work computer ([APP-SPEED]). Guard: one value per day per paint;
   the reader's brief; time a repaint of the busy Monday before and after.
3. **Parity.** Any attribute emitted on a week with no amendments breaks the byte-compared view week. Guard: the
   empty-book short-circuit stays first in `alAttr`.
4. **Colour on words where the ground is not dark.** The try-out measured the week's panels and the board's boxes.
   Not measured: a marked word on the board's coloured type pill, in the amber in-time strip on the board, in a
   focused typing box (the app's blue focus ring beside azure), on a selected / highlighted row, under the search
   highlight, and under the History hover. Second step: lemon or mint words on a pale tint drop below readable.
   Guard: scenario 21, 23 and a contrast measure in the drawing check for each ground the walk meets.
5. **Colour that already means something.** Orange words in Personal Inputs, green times beside Duties' green
   labels, azure beside the waves' cyan, pink beside warning red: he was told and ruled to keep them (D2736, D2738).
   Knock-on: once such a change is no longer the newest it has colour only, so in those sections an older change can
   pass unseen. This is accepted by ruling; the walk pictures those exact spots so he sees it once more in the build.
6. **Marks that vanish with the outline.** An emptied cell (Q5) and any marked thing that is a container rather than
   words (the in-time strip, a remark cell with only chips) had a box and now rely on text. Guard: test in step 3,
   scenario 17, 18.
7. **Accidental catches by the generic rule.** Any span with `data-alc` now takes the colour and maybe a line: the
   Amendments box tags, the day details list, the key's own entries, the pending list's chip. Guard: step 6.
8. **The puck corner is crowded.** Number or small mark, the "OG" tag, the OIL count, the role chip, the new-to-you
   dot, the drag veil all use that corner. A two-figure number is wider. Guard: scenarios 13, 14, 15;
   `og-tag-count.spec.ts`.
9. **AL7 and later look alike.** Two pink amendments on one day cannot be told apart on words (1.6). On a long day
   this is the commonest "which amendment was this?" question; the hover words and the key answer it on a desktop,
   only the key on a phone.
10. **A phone has no hover.** With the words gone, a phone reader learns which amendment an older colour means only
    from the "Changed in" line. If that line is scrolled out of view the colour is unexplained. Not a fault under
    his ruling; say it at his look.
11. **Other jobs that will meet this one.** [END-TIME-GUARD] (the red outline round an empty time, drawn beside the
    waiting line in the try-out; his answer still open); [ALL-AVAIL-WINDOW-FLAGS] (D2333's "tags the puck, hollow
    while waiting" must be drawn with this mark); [BELL-WORDS-CLEAR] and the wording pass (no clash: sentences keep
    "AL3"); the multi-squadron build (another squadron's day viewed read-only wears the same marks; nothing here is
    per squadron). Whichever is built second redraws the meeting and says so.
12. **Old pictures and guides go stale.** Every walk picture, mock-up and guide slide showing "AL1" tags is now of
    the old look. None is deleted; the evidence sheet says from which date the look changed.
13. **A reading left in the code.** Two readings are in this plan (1.5: version labels keep their words; Q3 until he
    answers). Each is put to him, and none goes into a code comment as if it were his rule (lesson 32).

## 6. Rough sizes

| Step | Hours (agent) |
|---|---|
| 0. His answers, three small drawings (Q5, Q6, Q7), re-stage and re-capture | 2.5, plus his time |
| 1. Colours | 1 |
| 2. "Older" marks | 3 |
| 3. Words: colour and line | 3.5 |
| 4. Pucks | 1.5 |
| 5. "Changed in" line | 2.5 |
| 6. Other tags | 1 |
| 7. [AL-MARK-GAPS], if yes | 2 |
| 8. Records | 1.5 |
| Drawing-check spec and its runs | 2 |
| Rewriting the six pinned tests | 2 (inside the steps above where they fall) |
| **Build** | **about 19 to 21** |
| FULL check: scenario design 1, sizing and walk scripts 2, walk 3 to 4, three reads 1.5, fixes and re-walk 2 to 3, sheet 1 | **about 11 to 13** |
| **Whole job** | **about 30 to 34**, two to three sittings; GitHub's run about 6 minutes each push |

Model, by his rule of risk: the build is high risk (the published record) → the latest Fable, high, with Astra and a
fresh Opus reading beside a fresh Fable; walkers Opus; the records step may go to Opus.

## 7. What I could not check

- Nothing was run: every statement about today's behaviour is from reading `origin/main`, not from the app.
- Whether he has seen the 5px dot (Q2), and what a parked plan's snapshot holds for marks (roll-call 10).
- Where the outside squadron's typed sim crew name is drawn (roll-call 25): not located.
- The try-out on a real iPhone, and AL5 to AL7 beyond the staged busy day, as the study already said.
- Lessons 151 to 154 are reserved for this branch but only 150 is written; nothing more to follow there yet.
