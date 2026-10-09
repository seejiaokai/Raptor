# Bug check — the input card, and the Inputs list without its pencil ([INPUT-LIST-AS-DAY-CARD]; owner D718–D724)

**Branch `claude/day-window-compact`** (not merged — his word: "No merge"). Built and checked 10 Oct 26. Host and
builder: Opus 5.5. The design is his, approved as pictured (D723): `docs/mock/img/input-card-final/day-final.png`,
`list-final.png`; the short plan `docs/superpowers/plans/2026-10-10-input-card-plan.md`. Scenario design: Astra
(`docs/superpowers/briefs/2026-10-10-input-card-scenarios-astra.md`, 84 scenarios). Code reads: Astra and Sol 6.1, each
blind (D590).

**STATE OF THIS SHEET: CLOSED but for his look (§8) and two of his three answers (§0) — question 1 is answered and built (D725, §9); for 2 and 3 he asked for a mock-up, sent 10 Oct 26.** Ten faults found and fixed, each with a test that was red first or a measured browser check — five by the walk and the scenario design (W1–W5), five by Astra's and Sol's reads of the code (R1–R5; two of them older faults this change made easy to reach); ten older small finds filed, not fixed; the gates wholly green on the last code (§7). *(Kept true as the check goes; this line is rewritten at its
close.)*

## 0. Questions waiting for him

1. **ANSWERED — "1 ok bigger" (D725, 10 Oct 26): the days are made bigger on a phone, the size the list's pencil calendar had; §9.** As it was put: **In the input's window on a phone the calendar's days are small — about 26 × 20 points.** The list's pencil had a
   calendar with bigger days on a phone (about 48 × 34); the pencil is gone (D718), and the window's calendar is the
   one a new input and a shared input already used. Not changed here: the size of the app's buttons stays as it is
   without his word (D487). **Recommended:** on a phone, make the window calendar's days the size the pencil's were.
   **What waits on it:** nothing — dates can be changed today, by a careful finger.
3. **MOCK-UP SENT 10 Oct 26 — he asked for one ("3 show me a mock up"): `docs/mock/card-questions.html`, pictures
   `docs/mock/img/card-questions/q3-*.png`; not built until he chooses.** As it was put: **A several-day input says "till 22 Jul" twice on its card** — at the right, where the hours stand, and again as its
   remark, where the remark is nothing but the automatic "till <date>". (So did the opened day's old card.)
   **Recommended:** on the card, leave out a remark that says only what the corner already says. **What waits on it:**
   nothing.
2. **MOCK-UP SENT 10 Oct 26 — he asked for one ("2 can u show me a mock up"): the same page, pictures `q2-*.png`; not
   built until he chooses. THE RECOMMENDATION ON THE PILL IS CHANGED there, and he is told: small grey capitals on the
   table too — "leave the pill", below, went against his own D718 ("I want to standardise how they look").** As it was
   put: **On the DESKTOP list a shared input still reads "Saber +3"** (the names appear on hover) **and the kind is still a
   pill.** His rulings speak of the card (D721, D723). **Recommended:** name everyone on the desktop row too; leave the
   pill — a column of a table reads well as a pill. **What waits on it:** nothing.

**Readings to tell him with the build** — each follows from his rulings; none changes what he chose (ten; 8–10 came from the two reads of the code):
1. **The window changes a one-person input's dates now** (the two-tap calendar a shared input's window already had —
   D681). The list's pencil was the only form that did; without this, removing it would have left only the drag of a
   bar on the month.
2. **OIL on the phone's list is in the window:** the card carries no OIL button. An answered input's window says "OIL …
   Change…" as before; an input whose question nobody has answered now says "Not answered yet — <day>" with "Answer…".
   The desktop row keeps its OIL / OIL? buttons.
3. **A document is opened from the window** — a paperclip button beside Cancel and Save, for any saved input that has
   one, for every reader. The phone's card carries no paperclip; the desktop row keeps its own.
4. **A shared input's LATE is said once on its card**; where only some of its people are late, pressing it names who
   (the per-man tags went with the row of pucks — D721).
8. **An OIL answer given by itself no longer marks an input LATE.** Answering or changing OIL in the window, with
   nothing else changed, saves the answer and leaves the input's late date alone (the desktop's OIL button always
   did; the window did not until this check).
9. **A man in a shared input he did not file can now answer his own OIL question from its window**, not only change
   an answer already given.
10. **Two faults older than this job were fixed with it, because the window is now where dates are changed:** a
    medical entry moved from one year into another was not asked about a clash; a member moving his war-approved leave
    to the same day of another year kept its approval.
5. **A remark with no "till <date>" in it gets none added when the dates are changed in the window**; a remark that has
   one follows the new last day. The pencil's own calendar used to add one at every pick.
6. **On a phone the list is always in date order** — it has no column headings to sort by; a just-saved input the
   filters hide stands first, under its own day's heading.
7. **A card for several people always says who filed it** (D724) — also where the picture he approved showed none.

## 1. The tier, and what it meant

**Tier: FULL** — the handoff had guessed WALK; reading the code raised it. The eight questions of the checking order's §5:
| # | Question | Answer | Why |
|---|---|---|---|
| 1 | Money / earned leave (OIL) | **YES** | no OIL rule or figure changes, but the CONTROLS through which an OIL answer is given and revised move: the list's edit-in-place (which asked the question at its save) is removed, a phone's card loses its OIL / OIL? buttons, and the window gains a date calendar that can move an input onto or off a weekend. A lost door is OIL nobody is credited |
| 2 | The published record | NO | nothing of publishing, signing or the issued copy is changed; a date changed in the window on a published day goes through the save every door uses (walked all the same — Astra's 74–77) |
| 3 | Saved data | NO | nothing new is stored; no record changes shape |
| 4 | A shared drawer | **YES** | ONE card body drawn on two screens (`ui/InputCard.tsx`), and the desktop row |
| 5 | A new gesture or mode | **YES** | a tap on a list card / a click on a desktop row opens the window; the window's calendar for a one-person input; "Answer…"; the window's paperclip |
| 6 | A new surface | **YES** | the phone's list is a new thing drawn (cards under day headings), where a restyled table stood |
| 7 | Roles | NO | who may change or delete an input is `perms.ts mayEditInput`, untouched (`perms.test.ts`, `perms-scan.test.ts` in the unit gate); the window asks it as the pencil did (walked: a member's own, another man's, a shared one) |
| 8 | The warning list | NO | no warning or rule is read differently |

What FULL meant here: the rules sweep (§2) → Astra designed the scenarios → the roll-call and the door check (§3) → the
sizing step (§4) → the walk (§5) → the gates (§7) → Astra and Sol each read the code blind, this sheet in hand (§6) →
fixes, each a failing test first → the re-walk → his look (§8).

## 2. The rulings that apply, each checked against the running build

| Ruling | What it says | Checked how | Result |
|---|---|---|---|
| D718 | the list's card takes the opened day's layout; pencil and cross go; a tap opens the input to edit or delete it | host A5, A7, A16, C2, C3, C6; `ui/inputslist.test.tsx` | PASS |
| D719 | the card stays short; a long title or remark wraps, nothing cut by what stands at its right | host A1, C1 (heights 51 / 72 / 68 / 50); `e2e/inputs-calendar.spec.ts` (a long title, a long remark, fourteen names) | PASS |
| D720 | the small print says "By Saber", never "for Ranger" | host A1, C1, C2; `ui/inputcard-model.test.ts` | PASS |
| D721 | every name of a shared input, wrapping; never "+N" | host A1, C1 (seven names on two lines); the browser test above (fourteen) | PASS |
| D722 | the title at the left on a row of its own | host A1, C1; `ui/inputtitle.test.tsx`; `e2e/input-title.spec.ts` (a phone) | PASS |
| D723 | approved as pictured: kind in small grey capitals; "By" only where someone else placed it, no day or time; the phone's day headings; the desktop keeps its columns | the pictures of §5.1 beside his; host A1–A9, C1–C2 | PASS |
| D724 | a card for several people always says who filed it | host A1, C1, C2; `ui/sharedline.test.tsx`, `ui/inputslist.test.tsx` | PASS |
| D629 (as narrowed) | who placed it and when, and its last change, stay whole in the window and on the month's tip | host A3; `ui/inputsday.test.tsx` | PASS |
| D646 | LATE, pressed, says the cut-off it missed | host A2, C4 | PASS |
| D681 | a shared input's dates are changed in its window, for everyone | unchanged: `ui/groupeditor.test.tsx` (its own describe) | PASS |
| D655, D364 | who may change a shared input; another person's input opens read only | host B1, A17; `ui/sharedline.test.tsx` | PASS |
| D660, D682 | a shared input's OIL answer is the filer's, for everyone | `ui/groupeditor.test.tsx`; the walkers' 61, 69, 73 | §5.2 |
| D620 | SANS availability is on no list | host A19 (the SANS day unchanged); `ui/inputs.test.tsx` | PASS |
| D647, D649 | the SANS day keeps its pucks with the CAT | host A19 | PASS |
| D178, D103 | an input change on a published day is a pending change; the sign-offs fall | the walkers' 74–77, 84 | §5.2 |
| D672 | Undo and Redo leave the list where it is when the input is on screen | `e2e/inputs-sans-calendar.spec.ts` (a desktop and a phone, through the window) | PASS |
| D487 | no button is resized without his word | §0 question 1; host C5b (the paperclip is as tall as the buttons beside it) | held |
| D56 | harm that lives only in stored demo data is not a finding | said in every brief | held |

No ruling clashes with another. D723 narrows D629 for the card, and D724 narrows D723 — both marked in their full rows.

## 3. The roll-call — every place an input's card or row is drawn

| # | Surface | The new card | The gesture | What else is painted there | Mark |
|---|---|---|---|---|---|
| 1 | Inputs calendar → an opened day, desktop | YES | card click, keyboard Enter / Space, LATE, the Delete key's question | the note and its pucks above; the day's title | SEEN and OPERATED — host A1–A4 |
| 2 | Inputs calendar → an opened day, phone | YES | tap | the same | SEEN and OPERATED — host C1 |
| 3 | Inputs list, phone (820px and under) | YES, under day headings | tap opens the window; LATE | the just-saved flash; the day heading | SEEN and OPERATED — host C2–C8 |
| 4 | Inputs list, desktop | NO — the table stays (D723 reading 2); the pencil and cross are gone | row click; Name by keyboard; paperclip; OIL chips | the row's stripe; the last cell's line | SEEN and OPERATED — host A5–A9 |
| 5 | SANS calendar → an opened day | MUST NOT (D723 reading 3; D647, D649) | — | pucks with the CAT | SEEN unchanged — host A19 |
| 6 | The month's bars and their tips | MUST NOT — the tip keeps the full "Placed by … for …" (D720 reading 1) | — | — | SEEN unchanged — host A3 |
| 7 | The input's window | MUST NOT — the full small print stays (D629); it GAINS the doors of §3a | — | — | SEEN — host A3, A10, A15, C3, C5b |
| 8 | The Medical tab's cards | MUST NOT — its own card | — | — | SEEN unchanged — host A20 |
| 9 | The schedule's Personal Inputs / Unavailable rows; the Scheduler Board | MUST NOT — not this card | — | — | not touched by this change (no file of theirs is in the diff); the board's dialog has no date calendar — `ui/groupeditor.test.tsx` |

### 3a. The doors — every action the list offered, and where it is now

| The action (on the list, before) | Its control now | State / role | Mark |
|---|---|---|---|
| change a field (pencil → fields → tick) | the window's own fields, opened by a tap / a row click | may-edit readers | OPERATED — host A18; walkers' 29–31 |
| change the DATES (pencil's calendar) | the window's two-tap calendar — NEW for a one-person input (plan §3.1) | may-edit readers; not one SANS commitment; not the board's dialog | OPERATED — host A10–A13, B2, C3 |
| move it to a posted-out / archived person (pencil's Person list) | the window's Person list, its "Posted out / archived" group — RESTORED (found by Astra's 57) | admin, a saved input | by test `ui/windowdoors.test.tsx` (presses the real list and Save); walker B's 57 |
| delete (the cross) | the window's Delete (a shared input asks first) | may-delete readers | OPERATED — host A16, A17, C6 |
| open its document (the paperclip) | desktop row: the paperclip, unchanged. Phone: the window's paperclip button — NEW (found by Astra's 60) | every reader, read-only ones too | OPERATED — host A9, B2b, C5b |
| revise an OIL answer (the OIL chip) | desktop row: the chip, unchanged. Phone: the window's "Change…" | may-edit readers | OPERATED — host A8, A14, C5 |
| answer an OIL question nobody answered (the OIL? chip) | desktop row: the chip. Everywhere: the window's "Not answered yet · Answer…" — NEW (plan §3.2); the bell, unchanged | may-edit readers | OPERATED — host A15; walker C's 66 |
| open a shared input (its ✎) | a tap / a row click, as any other | everyone (read only where D655 says) | OPERATED — host A17 |
| the save's questions (document, upchit summary, medical clash, OIL) | the window's own save — the body the pencil's row shared | — | OIL: host A13; the medical sheets: walker B's 39–46 |

## 4. Sizing the walk (D607 — the order's §7.0)

1. **The type of change:** D (one card DRAWN on two screens, and a desktop row beside it), C (new controls: the list's
   tap / row click, the window's calendar for a one-person input, "Answer…", the window's paperclip), E (layout — the
   card, the phone's list), with a G edge (dates changed on a published day) and an H edge (who may do each).
2. **What only a walk could find here:** how the card paints (names wrapping round the corner, a long title, 320 wide);
   whether the phone's list, its headings and its taps work by touch; whether a desktop row's click, its Name by
   keyboard, its chips and its paperclip each do their own work; whether the window's calendar, its OIL lines and its
   paperclip can be REACHED and pressed on a phone and open in front; the medical sheets and the published-day pending
   count through the new door; what a member may and may not do. What the tests already carry is in §5.4.
3. **What the ledger says:** D — ten walks of ten found a fault (57 in the change); C — eight of fifteen; E — four of
   ten. The three jobs before this one on this branch (the same screens) found 3, 8 and 8 faults by their walks.
4. **The walk chosen — MEDIUM-WIDE:** the HOST's own scripted run for the roll-call and the door list (33 steps: a
   desktop as the admin and as a member, a phone 390 × 844 by touch, then 320 × 640, 430 × 932, on its side and across
   820px); and THREE Sonnet 5.5 walkers on a frozen copy of the build for 67 of the scenario designer's 84 — A the
   cards and lists (18), B the pencil's replacement, dates and medical entries (25), C roles, OIL and published days
   (25). Each scenario at ONE size (odd numbers a phone by touch, even a desktop) unless it names its sizes. The 17 not
   given to a walker: 1, 2, 3, 6, 7, 9, 24, 26, 27, 29, 32, 37, 56, 67 walked by the host; 18 and 54 carried by a test
   that presses the real controls (§5.4).
5. **After the walk:** its row in `docs/walk-ledger.md`.

## 5. The walk

### 5.1 The host's own walk — `scripts/handpass/icard-host-walk.mjs`, the built bundle, the app's own controls

**33 of 33 steps PASS** on the build of `88a74708` (and, before it, the first runs that found W1–W3 below). No console
error, no page error, no 4xx. Pictures: `docs/img/handpass/2026-10-10-input-card-check/host/` (18) and `…/look/` (4 —
the built cards beside the approved pictures: `look/phone-day.png` against `mock/img/input-card-final/day-final.png`,
`look/phone-list.png` against `list-final.png`; opened by the host, both match — the seven-name card now also says "By
Saber", D724).

| Step | What was done, and what the screen said |
|---|---|
| A1 | desktop, the opened day: six cards as approved — kind on the top line, title on its own row, every name, "By" as ruled; heights 51 / 51 / 72 / 51 / 50 / 51 |
| A2 | LATE pressed: "after the cut-off, Mon 29 Jun"; nothing opened |
| A3 | a card clicked: the window; "Placed by Saber for Wisp · 10 Oct 26, 01:40" whole there, and on the month bar's tip |
| A4 | the card's button by keyboard, Enter; its label "ALL AVAIL, Sports day, Event, 06:00–18:00, late, placed by Saber" |
| A5 | the desktop list: the table, six sortable headings, 49 rows; no pencil, no cross, no edit row; no cards |
| A6 | the last cell is as tall as its row on all of the first 40 rows (W1) |
| A7 | a click on a row's remark opens that input; so does its Name by keyboard |
| A8 | the OIL chip opens the question, not the window |
| A9 | the paperclip opens the document, not the window |
| A10 | Ranger's Saturday duty opened from its row: the calendar stands on 18 Jul; one tap on 20 Jul; saved; the row reads "20 Jul 13:00–15:00"; no OIL question (a Monday) |
| A11 | moved off the weekend: no OIL chip on the row, no OIL line in the window |
| A12 | Undo: back on 18 Jul in one step |
| A13 | a Thursday appointment moved onto Sat 18 – Sun 19 by two taps: the OIL question is asked before anything is written; answered; saved with the dates (oil on both days) |
| A14 | its answered OIL: "Change…" in the window, the OIL chip on the row |
| A15 | a bar dragged onto a Sunday and its question put away: the row says "OIL?"; the window says "Not answered yet — 19 Jul"; "Answer…" opens the question; answered; the row says "OIL" |
| A16 | Delete in the window: the input and its row go; Undo brings both back |
| A17 | a shared row opens the entry ("+6"); Delete asks "for all 7 people"; Keep keeps all seven |
| A18 | kind, title, remarks, hours and the person changed in the window and saved; the row follows |
| A19 | the SANS day: its own rows, pucks, no card of this kind |
| A20 | the Medical tab: four of its own cards |
| B1 | a member, Everyone: another man's row opens read only — no Save, no Delete, no calendar; "Only Vapor or an admin can change this."; no pencil or cross on any row |
| B2 | his own input: Save, Delete, the calendar; one tap moves it to 21 Jul |
| B2b | another man's medical input, read only: the window's paperclip opens the document, in front of the window |
| B3 | the opened day as a member: his own input says nothing of who placed it |
| C1 | phone, the opened day: the six cards as approved; heights 51 / 51 / 72 / 68 / 50 / 51 |
| C2 | the phone's list: no table; 34 day headings in date order; "Sat 18 Jul · 6 inputs" over the six cards; no pencil, cross, chip or paperclip; nothing off the screen |
| C3 | a tap on a card: the window; a tap on 21 Jul in its calendar; saved; the card stands under "Tue 21 Jul · 1 input". A day of that calendar measures 26 × 20 — §0 question 1 |
| C4 | LATE tapped on a list card: the cut-off; nothing opened |
| C5 | "Change…" in the window a card opens: the OIL question |
| C5b | the window's paperclip on a phone: the document, in front; the button 40 × 28, as tall as Cancel beside it |
| C6 | Delete from the window: the card goes; "5 inputs" → "4 inputs" |
| C7 | 320 × 640, 430 × 932: cards, nothing off the screen; 844 × 390 (past 820): the table |
| C8 | across 820px and back with a window open: the list changes its form behind it; what was typed is kept |

### 5.2 The three walkers (Sonnet 5.5, each in its own world, the frozen build of `88a74708`)

Each walked its share through the app's own controls on its own server (ports 4231–4233, the frozen `dist-fix`), one
size a scenario (odd numbers a phone 390 × 844 by touch, even a desktop 1440 × 900) unless the scenario named its
sizes. No walker saw a console error, a page error or a 4xx. Their reports: `docs/handpass/parts/icard-A.md`, `-B.md`,
`-C.md` (and `.json`); pictures under `docs/img/handpass/2026-10-10-input-card-check/A|B|C/` (about 120, 103 and 150).

| Walker | Its share | Result as reported | After the host's check of every FAIL |
|---|---|---|---|
| A — cards and lists | 4, 5, 8, 10–17, 19–23, 25, 28 (18; 15 with the browser's own clock) | 18 PASS | 18 PASS |
| B — the pencil's replacement, dates, medical entries | 30, 31, 33–36, 38–53, 55, 57, 58 (25) | 24 PASS, 1 FAIL (55) | 25 — the FAIL is not a fault (below) |
| C — roles, OIL, published days | 59–66, 68–84 (25; 79 at three sizes) | 24 PASS, 3 FAIL (69, 70, 81) | 1 real fault, fixed (W5); 2 as designed (below) |

**The high-consequence passes whose pictures the host opened:** A 4 and 8 at 320 wide (a 40-letter title, a long remark,
fourteen names — all whole, nothing over the hours); A 12 (an input of several days under its first day, "till 22
Jul"); B 42 (a downchit moved onto another medical entry: the clash question before anything is saved); B 43 (a
downchit moved onto a leave: the morning medical, the leave left PM); C 74 (an input moved off a published Monday: the
day's sign-offs blank, "4 to sign"); C 66 (a phone: "Not answered yet — 15 Jul · Answer…").
**What their scenarios proved that the host's walk did not:** every kind's colour and capitals (22 kinds); an archived
and then a deleted person's past input; another year; the filters and the date window on the phone's list; the export
(53 rows whatever the filter); a leave moved over a leave and over a medical entry (refused whole, in words); an
upchit moved and refused as a range; a leave the Leave War approved, changed and deleted from the list (the war and
the list agree; a member's own date change clears the link, a remark alone does not); documents added and removed; the
window following a change made behind it; a member's own / another's / a shared / a filed-for-others input; members'
filing switched off; the role changed with a window open; published days (74–77, 84: pending, the sign-offs cleared,
the issued face and its OIL kept until the amendment); short screens.

**The four FAILs, each looked at by the host before it was believed:**
- **B 55 — "a drag across a row's remark opens the input instead of selecting the words": NOT A FAULT.** The app selects
  no text outside its typing boxes, by a standing rule of its own stylesheet (`html{user-select:none}` — a tap-hold
  must not paint a blue range on a phone); the list's words could not be selected before this change either. The
  scenario's expectation was the designer's assumption. *(The host first wrote a fix and a unit test from the report —
  and only then tried the real browser, where the selection never existed; the fix was taken out. Host A7b now checks
  the rule itself. Logged as a lesson: a reported failure is reproduced in the running app before anything is written
  for it.)*
- **C 69 — a shared duty, one man answered and another not: the window read "no OIL … Change…" and said nothing of the
  man still unanswered: A REAL FAULT of the new line → W5**, below. (That "Change…" then writes the answer for everyone
  is as ruled — D682: the filer's later answer replaces each man's own.)
- **C 70 — the OIL question opens with neither Yes nor No chosen: AS DESIGNED** — "the forced choice — unset until the
  filer picks, even on a re-ask" (`ui/OilConfirm.tsx`, unchanged by this job; the earlier answers pre-seed only which
  days "some" starts from).
- **C 81 — after an input was changed on the list so that the filters hide it, the calendar's opened day says "No
  inputs on this day": AS DESIGNED, AND OLDER** — the filters are one for the list, the month and the day (so they can
  never disagree about what is hidden); the list keeps the just-saved input in view until a filter is touched. The
  day's wording under a filter is filed (`[CARD-CHECK-SEEN]`).

### 5.3 What the walk found, and each disposition

| # | Found by | What | Disposition |
|---|---|---|---|
| W1 | the host's first picture of the built desktop list | the row lines of the LAST column were drawn across the middle of each row: that cell was a flex box, not a table cell, and with the pencil and the cross gone it shrank to its padding | FIXED — a real table cell (`06-inputs.css .inact`); host A6 measures it on 40 rows; in the change |
| W2 | Astra's scenario 60, confirmed by the host in the code and then a test | on a phone nobody could open an input's document from the Inputs list (the card has no paperclip; the window named a document and could not open it), and a member reading another man's medical input could not open it at all there | FIXED, a test red first (`ui/windowdoors.test.tsx`): the window's paperclip button, outside the read-only form; host B2b, C5b; in the change |
| W3 | Astra's scenario 57, confirmed the same way | an admin could no longer move a saved input to a posted-out / archived person — the pencil's Person list offered them, the window's did not | FIXED, a test red first (the same file): the window's Person list offers the group for a saved input and keeps a deleted man's own name; in the change |

| W4 | the host's picture of the built window (A10), and walker A's extra 3 | on an ordinary desktop (1440 × 900) the window's last row — Delete, Cancel, Save — was cut off at the window's foot and reached only by scrolling inside it; a shared input's "Delete for all?" had its "Keep" under the foot. The window is about 170px taller for the date calendar every saved input now gets; at his PC's 125% it would be worse | FIXED, a browser test red first at two of three sizes (`e2e/inputs-calendar.spec.ts`, "keeps Delete, Cancel and Save in sight" — 1440 × 900, 1280 × 640, a phone 390 × 664): the row is pinned to the window's foot, the form scrolling above it; host A10 and A17 check it; no button changes size (D487). It also closes `[TITLE-CHECK-SEEN]` item 9; in the change |

| W5 | walker C, scenario 69 — reproduced by the host in a test that then failed | a shared input where one man's OIL question is answered and another's is not: the window judged the whole entry by the record it was opened on, so it could read "no OIL on its non-working day · Change…" with no word that anyone was unanswered | FIXED, a test red first (`ui/groupeditor.test.tsx`): the line "Not answered yet — <day>: <who>" is drawn while ANY record of the entry is unanswered and names who, beside an answered line too (one button for the one question); in the change (the new line of the plan's §3.2) |

**Older finds met on the way — none caused by this change; filed, not fixed (`OUTSTANDING.md` `[CARD-CHECK-SEEN]`):**
a several-day input says "till 22 Jul" twice on its card where its remark is only the automatic "till" (put to him —
§0 question 3); the document viewer with two documents is a little taller than its box on a 1440 × 900 desktop (B 46);
on a phone the passing note ("Input updated") lies over the window's Cancel while it shows (B); a member reading
another man's medical input sees the picker's "You can file a medical entry only for yourself" box in the read-only
window (C 60); the opened day under a filter says "No inputs on this day" (C 81); the desktop row's paperclip and OIL
chips cannot be reached by Tab (C 83 — they are not buttons); a shared input's OIL line shows the first man's answer
("credited") after another man's own became No (C 61); the OIL question of a 2027 input names "9 JAN" with no year
(C 78); the list's date picker stays open after its end date is tapped, and Escape does not close it (A). **A teal
band in some phone pictures** is the browser's own tap flash at the place the card was tapped, caught by the camera
with the window already over it — not something the app draws.

### 5.4 The cases carried by a test, each with its test and what it proves

| The case | The test | What it proves | Real controls? |
|---|---|---|---|
| the card's words for every kind of entry (names, kind, title, remark, "By", the colour, "till", the LATE note) | `ui/inputcard-model.test.ts` (33 cases) | the one body both screens draw from | the calculation directly — the SCREENS are walked (host A1, C1, C2) |
| the phone's order inside a day and its counts; a shared input counts once (Astra's 18) | `ui/inputslist.test.tsx` | headings, counts and order from filed inputs | renders the page as a phone and reads the screen; inputs are put in by the store's own writer |
| the open editor stays on its input while the table is sorted or renumbered (Astra's 54) | `ui/audit-e-window-sort.test.tsx`, `ui/inputs.test.tsx` ("commits onto the right row…") | the window holds the record, not a row position | presses the real headings, the row, the window's Save |
| every pencil / tick / cross case of before, restated for the window (43 tests in ten files) | named in the plan's §5 | each claim the list's editor carried still holds through the row → window route | presses the row's Name and the window's own controls |
| the one-person date door: both orders, a range moved whole, the "till" word, who may, the OIL question, the board's dialog has none | `ui/groupeditor.test.tsx` (its own describe, 11 cases) | the door and its limits | presses the window's calendar and Save |
| a posted-out person offered; a deleted man's name kept | `ui/windowdoors.test.tsx` | Astra's 57 | presses the window's Person list and Save |

### 5.5 The break tests — `scripts/handpass/breaks.mjs scripts/handpass/breaks/icard.json`

**40 deliberate breaks in all, one at a time; 40 CAUGHT** (29 before the walkers reported, two more with W5, nine with the readers' five fixes — the nine are the last rows of the table). **Of the first 29** — each made a named test go red, and every broken line was put
back (`git status` clean of source afterwards). 28 were caught on the first run; **one was NOT** — "a deleted man's
name is not kept as the Person list's value": its test passed with the rule broken, because the list's "Posted out /
archived" group was empty in that test and the code took another path. The test was made to hold an archived man as
well, and the break was run again: caught. The list is Astra's break table (her B-numbers in each name) for every rule
a unit test can see, plus the window's doors:

| Area | Breaks | Caught by |
|---|---|---|
| the card opens (the phone's list, the opened day); LATE must not open it | 3 | `inputslist.test.tsx`, `inputsday.test.tsx`, `sharedline.test.tsx` |
| the card's words: the title as the kind; the title trailing on the top line; "+N"; "By" on every card; "By" hidden for a filer among several (D724); the day and time back; the last changer instead of the filer; a shared LATE from the first person alone; no "till" | 9 | `inputcard-model.test.ts`, `inputtitle.test.tsx`, `sharedline.test.tsx`, `inputsday.test.tsx`, `inputslist.test.tsx` |
| the phone's list: a heading counting people; the desktop's sort leaking in; another year's heading; no cards drawn | 4 | `inputslist.test.tsx` |
| the desktop row: its Name opens nothing; an OIL chip also opens the window | 2 | `inputslist.test.tsx`, `inputs.test.tsx` |
| the window's date calendar: shared only; given to one SANS commitment; given to a read-only reader; the hint's "for everyone" | 4 | `groupeditor.test.tsx` |
| the unanswered OIL line gone; "Answer…" offered to a read-only reader | 2 | `groupeditor.test.tsx` |
| the Person list: no archived people; archived people on a NEW input; a deleted man's name not kept | 3 | `windowdoors.test.tsx` |
| the window's paperclip: gone; shown where there is no document | 2 | `windowdoors.test.tsx` |
| W5: the unanswered line judged by the opened record alone; two buttons for the one question | 2 | `groupeditor.test.tsx` |
| R1: a moved medical date read in the record's old year — in the window, in the shared question body, for an upchit | 3 | `windowreads.test.tsx` |
| R2: a leave moved to the same day of another year keeps its approval | 1 | `windowreads.test.tsx` |
| R3: an OIL answer alone moves the late date; an answer WITH a change skips the input's own save | 2 | `windowreads.test.tsx` |
| R4: a member of a shared input has no "Answer…" of his own | 1 | `windowreads.test.tsx` |
| R5: a just-saved input's day drawn twice / not first; the input not first inside its day | 2 | `inputslist.test.tsx` |

**What a unit test cannot break, proved in a real browser instead:** the names wrapping round the corner, nothing
lying over the hours, nothing cut, the hours lined up down the phone's list, the last cell as tall as its row, the
document viewer in front of the window — `e2e/inputs-calendar.spec.ts`, `e2e/geometry.spec.ts`, host A6, B2b, C5b.

### 5.6 The re-walk

After every fix (W1–W5, R1–R5) the build was made again and the host's walk run on it, its pictures to a folder of
their own (`docs/img/handpass/2026-10-10-input-card-check/rewalk/`, and `rewalk-look/` for the cards beside the approved
pictures): **34 of 34 steps PASS**, no console error, page error or 4xx (the walk gained one step on the way: A7b, the
app's own no-selection rule). Opened by the host: the phone's window (`rewalk/C3-phone-window-dates.png` — Delete,
Cancel and Save whole at its foot, W4), the shared "Delete for all?" with both answers in sight, the built cards. What
the readers' five fixes touched is carried by tests that press the window's real controls (`ui/windowreads.test.tsx`,
`ui/inputslist.test.tsx`) — the states they need (a record of another year, a war-approved leave, a clock past the
cut-off, a member inside a shared input) are reached there through the store's own writer; the window's own controls
do the rest. The walkers' frozen build was the code of `88a74708`; nothing they passed was changed by a later fix
except where a fix is named (W4, W5, R1–R5).

## 6. The two reads of the code

Each read the code of `b8e3df2b` blind, this sheet in hand, with the finder's brief
(`docs/superpowers/briefs/2026-10-10-input-card-code-read.md`); neither saw the other's report. Their reports, whole:
`docs/superpowers/briefs/2026-10-10-reads/input-card-code-astra.md`, `…-sol.md`. **Both: CHANGES REQUIRED.** Five
findings between them — three were BOTH readers' — every one reproduced by the host in a test that failed before its
fix (`ui/windowreads.test.tsx`, `ui/inputslist.test.tsx`):

| # | Who | Their severity | What | Against `main` | Disposition |
|---|---|---|---|---|---|
| R1 | Astra 1, Sol 1 | HIGH, HIGH | a medical entry moved ACROSS A YEAR in the window: the "which status holds these days" question was worked out in the record's old year while the save wrote in the loaded one — no question, and the other medical entry cut in silence; an upchit's summary likewise | the same mistake is on `main` in the list's pencil and the bar's drag (the shared question body) — OLD CODE this change made the normal way to move a date | FIXED: the question's days are the draft's own whole dates, in the window and in the shared body; 4 tests |
| R2 | Astra 2, Sol 2 | HIGH, MEDIUM | a member moving his war-approved leave to the SAME day of another year kept its approval | on `main` too (the shared save) | FIXED: the "same leave?" test reads the year the save writes; 2 tests (his move clears it and Undo restores it; remarks alone and an admin's move keep it) |
| R3 | Astra 3, Sol 4 | MEDIUM, MEDIUM | an OIL answer given alone in the window went through the full save and moved the input's late date — an on-time input turned LATE for answering a question | "Change…" in the window did this on `main`; the desktop chip never did. NEW in effect: the phone's card has no chip, so the window is the phone's only way | FIXED: where nothing of the input differs, the answer is saved by itself (stamped, the late date not moved); with a change, one save of both; 3 tests |
| R4 | Sol 3 | MEDIUM | a man in a shared input he did not file could revise his OWN OIL answer in its window but not give one never given | on `main` too (the bell was his only way) | FIXED: "Your OIL: not answered yet — <day> · Answer…", outside the read-only form, for his record alone; 3 tests |
| R5 | Sol 5 | LOW | on the phone's list a just-saved input kept in view made its day appear twice, each heading with half the count | NEW (this change's day headings) | FIXED: one heading a day — the day holding it first, whole, that input first inside it; 1 test |

**Not taken, with the reason:** Sol's step "make the single-record `redated` comparison use resolved dates too" (R2,
step 2) — that test only decides whether the remark's "till <day>" word is rewritten, and the word carries no year, so
a move of exactly a year needs no rewrite. **Their explicit negatives** (areas each checked and found right) are in
their reports; the two agree on: the medical guard rails kept, the document rules, the refusal order (placeholder,
document, medical, OIL), the date door's `midPick` / saved-day tap / follower, the card's facts, the phone / table
boundary, the removed selectors having no caller left. **Neither read was run again on the fixes** — each fix is the
reader's own exact one, pinned by a test that was red first and by a break test (§5.5).

## 7. The gates

Watched, under the PC's lock (`node scripts/gatelock.mjs run`), nothing else running:

| Run | On | unit | build | tfin | e2e | smoke | rulecheck | docsize |
|---|---|---|---|---|---|---|---|---|
| after the walk, before the reads | `b8e3df2b` | 9743 / 9743 (577 files) | clean | 728 / 0 | 739 passed, 0 failed, 57 skipped | 445 / 0 | OK | OK |
| **THE FINAL RUN — after the readers' five fixes** | **`807b8d19`, the last code** | **9757 / 9757 (578 files)** | **clean** | **728 / 0** | **739 passed, 0 failed, 57 skipped** | **445 / 0** | **OK** | **OK** |

The two local-only checks on the same final build: the six adapted probes, all passed (`audit-async` re-pointed — the
list's rows are counted by the rows, their cross being gone); `npm run perf` 4 of 4 (no DOM ceiling moved — the phone's
list is cards in place of a restyled table, the desktop's table lost two controls a row). The permissions' two tests
(`perms.test.ts`, `perms-scan.test.ts`) are in the unit gate and green: no rule about who may do what was changed, and
no row of `docs/data-model.md` §11 is touched. Nothing new is stored, so `docs/data-schema.md` is unchanged.

`Docs: OUTSTANDING 154 items (+7 −2, −2 all in ARCHIVE) · DECISIONS D1–D724 (new: D709, D710, D711, D712, D713, D714, D715, D716, D717, D718, D719, D720, D721, D722, D723, D724) · homes OK`
`docsize: OVER by 27777, deferred (D29)`

## 8. His look

**Five minutes on his iPhone**, on this branch's preview link (the app opens on the week of 13–19 Jul 2026; go to
Inputs). Each line is what he should EXPECT, in the app's own words:

1. **Inputs → the calendar → tap Thu 23 Jul.** The day's cards read as he approved: the name, the kind in small grey
   capitals, the hours at the right; a title on its own line; the shared meeting names all four people and says "By
   Saber". Tap a card: the input opens.
2. **Inputs → List → All dates.** The same cards, under a heading a day ("THU 23 JUL · 2 inputs"). No pencil, no
   cross. Tap a card: the input opens; Delete, Cancel and Save are in sight at the foot of the window.
3. **In that window, tap another date on its calendar and Save.** The card moves under that day's heading.
   *(The calendar's days are a finger's size on a phone since D725 — §9.)*
4. **Open Gambit's OML on 23 Jul and tap the paperclip beside Delete.** His document opens.
5. **Open a Saturday or Sunday duty** (the ALL AVAIL Duty on Sat 25 Jul): its window says "OIL — credited… Change…";
   one nobody has answered says "Not answered yet" with "Answer…".

On a desktop, if he wishes: Inputs → List — the table as before without the pencil and the cross; a click on a row
opens the input.

**Walk:** `docs/handpass/2026-10-10-input-card-check.md` · about 420 pictures (the host's 44, the walkers' about 373;
the host opened 16, the walkers at least one behind every scenario) · 9 surfaces · 34 host steps + 67 walker scenarios
(101 orders; 2 more carried by tests, §5.4) · MISSING: 5 doors lost with the pencil and the paperclip, all FIXED (the
dates, the unanswered OIL line, the document, the posted-out people, the buttons in sight); 10 older finds FILED
(`[CARD-CHECK-SEEN]`); 3 questions with him (§0).

## 9. After the close — the bigger days of the window's calendar on a phone (D725, 10 Oct 26)

His answer to question 1: *"1 ok bigger"*. **Tier: LOOK** — the eight questions, each NO with its reason: no OIL, no
published record, nothing stored, no role and no warning is touched; it is one rule of the stylesheet for ONE calendar
(the one in an input's window, named by its own id — the list's date filter, the OIL sheet's days and the week picker
share the day's markup and are NOT this calendar: the date filter's day measured 26 by 20 beside it, before and after);
no new control, gesture or screen — the same tap on a bigger day. So: the gates, a before / after picture, this section.

- **Built:** on a phone (up to 820 wide) the window's calendar fills the window's width up to 360, a day is 33 tall and
  the month's arrows 28 (`src/ui/scheduler/25-inputs-calendar.css`, the rule under the window's own). Test first:
  `e2e/inputs-calendar.spec.ts` "a phone: the days of the calendar in an input's window are a finger's size…" — RED
  before the rule ("a day is a finger tall: expected at least 32, received 20"), green after; it holds a saved input's
  window, a new input's, Save in sight, nothing off sideways, and a desktop's day unchanged.
- **The look** (`scripts/handpass/icard-d725-look.mjs`, the built bundle; the "before" is the SAME window with D725's
  rule taken out of the page's stylesheet): pictures in `docs/img/handpass/2026-10-10-input-card-check/d725/` —
  `phone-window-saved-before.png` / `-after.png` (opened by the host: the days 26 × 20 → 42 × 33, the calendar the
  window's width, Delete / Cancel / Save whole at the foot; the hint under the remarks now scrolls under the pinned
  buttons, as the form is taller), `phone-window-new-after.png`, `phone-320-window.png`, `desktop-window.png`.

  | Screen | A day of the window's calendar | Save in sight | Page wider than the screen |
  |---|---|---|---|
  | 320 × 568 phone | 32 × 33 | yes | no |
  | 390 × 844 phone — before | 26 × 20 | yes | no |
  | 390 × 844 phone — after | 42 × 33 | yes | no |
  | 430 × 932 phone | 47 × 33 | yes | no |
  | 820 wide | 47 × 33 | yes | no |
  | 821 wide | 26 × 20 (unchanged) | yes | no |
  | 1440 × 900 desktop | 26 × 20 (unchanged) | yes | no |

  A tap on a day of the bigger calendar still picks it; no console error, page error or 4xx.
- **The gates, the whole set under the PC's lock, on this code:** unit 9757 / 9757 (578 files) · build clean · tfin 728 / 0 · e2e 740 passed, 0 failed, 57 skipped (one more than the close: D725's own) · smoke 445 / 0 · rulecheck OK · docsize OK — watched, nothing else of the gates running.
- **Seen, not changed (D487 — no button resized without his word):** the Inputs list's date filter has the same small
  days on a phone (26 × 20). Told to him as an option.

**Look:** `docs/handpass/2026-10-10-input-card-check.md` §9 · 5 pictures (the host opened the before and the after) ·
1 surface (the input's window, saved and new) at 7 sizes · MISSING: nothing.
