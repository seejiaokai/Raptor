# Walker B3 — the doors, the load, the keyboard, the bubble, and a regression sweep (25 Sep 26)

Brief: `docs/superpowers/briefs/2026-09-25-amendment-batch-walk-brief.md` §Walker B3 (items 4, 6, 11, 10 + regression).
Driven: the production build on http://localhost:4173, my own fresh browser contexts, the saved everything-week
(`docs/handpass/2026-09-24-amendment-week.json`). Desktop 1440×900 (DPR 1, DPR 2 for close-ups), phone 390×844 (DPR 3).
Scripts: `scripts/handpass/am/b3-*.mjs` (run from `raptor-port/`). Pictures: `docs/img/handpass/2026-09-25-amendment-batch/b3/`
(63, every one looked at). Browser error list: **empty in every run.**

**Result: 144 checks across the runs — 132 PASS, 12 FAIL. All 12 FAILs are three findings**, some counted in two
scripts: F1, the refused template row looks live (3); F2, loading Monday quietly changes Tuesday for a request
covering both (6); F3, the desktop bubble drops as the mouse crosses into it (3). Everything else in the section
walked right.

Writes through `window`: **none.** `window.*` was read for the evidence only. One emulation replaced the browser's own
`window.visualViewport` (item 11, E1): that stands in for an iPhone keyboard, which Chromium cannot raise. It is not a
write to the app, and it is said in the table.

## 1. The checks

### Item 4 — a template is refused on a published day (D96) · `b3-01-templates.mjs`, `b3-01b-template-look.mjs`
| id | result | what the screen said | picture |
|---|---|---|---|
| d/p.T1 Tue published ORIG (the fixture) | PASS | ORIG | — |
| d/p.T1 Templates on published Tue offers "+ Save this day as a template" | PASS | offered | d/p-T2-tue-week-templates-refused |
| d/p.T1 saving from a published day works | PASS | toast "Saved as "Template 1"" | — |
| d/p.T2 Tue (ORIG, nothing pending): every template disabled | PASS | the Template 1 row is disabled; its title gives the reason | d/p-T2-tue-week-templates-refused |
| d/p.T2 Tue: the reason is on screen, one sentence | PASS | "Tuesday is published — a template can't be applied to a published day. Edit the working copy, or Unpublish it first." | same |
| d/p.T2 Tue: saving still offered | PASS | | same |
| d/p.T2 Tue: a tap on the refused row changes nothing | PASS | same day, same count | d/p-T2-tue-after-tap-disabled |
| d/p.T2 Tue: only the reason is said | PASS | the menu note stays up; no toast | same |
| d/p.T2 Mon (AL1, 1 pending): same four checks | PASS | "Monday is published — …"; count stays "1 pending" | d/p-T2-mon-week-templates-refused, d/p-T2-mon-after-tap-disabled |
| d.T3 board's Templates on published Tue: disabled, reason on screen, saving offered, tap changes nothing | PASS | same sentence in the board's menu | d-T3-board-templates-refused |
| p.T3 board's Templates on a phone | NOTE | the phone board hides its day controls, so it has no Templates button. The phone reaches templates from the week only | p-T3-board-no-templates-button |
| d/p.T4 draft Fri: templates enabled, no refusal note | PASS | | — |
| d/p.T4 draft Fri: picking applies it | PASS | toast "Applied "Template 1" to Friday"; the day changed | d/p-T4-fri-draft-template-applied |
| d/p.T4 Fri stays DRAFT; Undo takes it back | PASS | DRAFT; Undo puts the day back exactly | — |
| d.T5 after Unpublish (the sentence's advice) Tue's templates are enabled again | PASS | | — |
| d.T6 a refused row LOOKS different from a live one | **FAIL** (F1) | identical: same colour, same fill, no fade | d-T6-tue-published-template-row-disabled vs d-T6-fri-draft-template-row-enabled |
| d.T6 a refused row does not show the pointer hand | **FAIL** (F1) | cursor: pointer | — |
| d.T6 a refused row does not light up under the pointer | **FAIL** (F1) | turns accent blue, border and text, like a live choice | d-T6-tue-published-template-row-hovered |

### Item 6 — the load puts back what the version filed (D98) · `b3-02-load.mjs`, `b3-02b-twoday.mjs`
| id | result | what the screen said | picture |
|---|---|---|---|
| d/p.L1 fixture: Tue ORIG, nothing pending, Saint's dental request on Tue's programme | PASS | | — |
| d/p.L1 taken off through the request's own UNDO: row leaves, day pending | PASS | "2 pending" | d/p-L1-tue-request-taken-off |
| d/p.L1 preview of the Original offers "Load onto working copy" | PASS | | — |
| d/p.L1 first tap arms "Discard N edits & load — confirm", N = the head's count | PASS | "Discard 2 edits & load — confirm" (head "2 pending") | d-L-A-orig-confirm, p-L-A-orig-confirm |
| d/p.L1 after the load the request is back on the programme | PASS | its row is back on Tue; board row reads "Appointment … Saint … UNDO" | d/p-L1-board-after-load |
| d/p.L1 the day reads 0 pending, ORIG | PASS | no pending chip, no marker | d/p-L1-tue-after-load |
| d/p.L1 message | PASS | "Tuesday: Original loaded onto the working copy — viewers still see Original until you publish · 2 unpublished edits replaced" | — |
| d/p.L1 ⓘ panel and the board strip agree | PASS | no unpublished edits; ORIG, nothing pending | — |
| d.L2 a request filed AFTER the Original lands on Tue as waiting | PASS | "2 pending" | — |
| d.L2 the confirm counts it | PASS | "Discard 2 edits & load — confirm" | d-L-B-orig-confirm |
| d.L2 after the load the late request reads fresh again (no row) | PASS | board: "B3 LATE … Hex → GROUND → UNAVAIL" | d-L2-board-personal-inputs-after-load |
| d.L2 Tue reads 0 pending | PASS | | d-L2-tue-after-load-late-request |
| B.1 two-day request (Mon–Tue) moved onto TUESDAY's programme (UNDO on Mon, → GROUND on Tue) | PASS | row on Tue | — |
| B.3 loading Monday AL1: Tuesday's content, count ("2 pending"), filing and Personal Inputs row unchanged | PASS | all unchanged | d-L4B-tue-board-before/after-mon-load |
| B.3 message says it was left as filed | PASS | "… · 1 unpublished edit replaced · 1 request also covers another day — left as filed" | d-L4B-mon-after-load |
| A.3 / d.L3 two-day request landed on MONDAY (where the app puts it); load Monday AL1: Tuesday's content unchanged | PASS | | — |
| A.3 / d.L3 …Tuesday's pending count unchanged | **FAIL** (F2) | "1 pending" → nothing | d-L4A-tue-before-mon-load, d-L4A-tue-pendlist-before |
| A.3 / d.L3 …the request's filing / its row on Tue's Personal Inputs unchanged | **FAIL** (F2) | "UNDO" (on the programme) → "→ GROUND → UNAVAIL" (fresh) | d-L4A-tue-board-before-mon-load → d-L4A-tue-board-after-mon-load |
| A.3 / d.L3 message says it was left as filed | **FAIL** (F2) | message says only "3 unpublished edits replaced" | d-L4A-mon-after-load |
| A.3 / B.3 no new warning on Tuesday | PASS | Talisman's "Other but tasked" line was there before and after | — |

### Item 11 — the phone keyboard · `b3-03-keyboard.mjs` (History off AND on; every check passed in both)
| id | result | what the screen said | picture |
|---|---|---|---|
| p.K1 E1 fixture: last Common Programme name focused, low on the screen | PASS | focused, 809–845 | p-K1-*-E1-before-keyboard |
| p.K1 E1 (iOS-like: layout 844, visible band 260–804) the board follows the band | PASS | board top 260, height 544 | p-K1-*-E1-keyboard-visible-band |
| p.K1 E1 nothing of the week shows anywhere in the band (15 points sampled) | PASS | every point inside the board | same |
| p.K1 E1 the page behind is not painted while the board is open | PASS | hidden | p-K1-*-E1-keyboard-whole-layout |
| p.K1 E1 the field keeps focus | PASS | | — |
| p.K1 E1 keyboard down: the board fills the screen again | PASS | 0 / 844 | — |
| p.K1 E1 board closed: the week is painted again | PASS | | p-K1-*-E1-after-close |
| p.K2 E2 (Android-like: the whole viewport shortened to 544) the board fills it, nothing behind shows | PASS | 0 / 544 | p-K2-*-E2-keyboard |
| p.K1/K2 no errors | PASS | | — |

### Item 10 — the History bubble (D105) · `b3-04-bubble.mjs`, `b3-04b-bubble-path.mjs`, probe `b3-04c-phone-probe.mjs`
| id | result | what the screen said | picture |
|---|---|---|---|
| d/p.H0 one detail (Fri SODB start) edited 13 times through its box | PASS | reads 07:13 | — |
| d.H1 hover shows the whole story, newest last | PASS | 13 lines, last "07:12 → 07:13 Admin · 25/9 03:55" | d-H1-hover-long-story |
| d.H1 a long story is capped and scrolls inside itself | PASS | list 360 tall, 544 of content | same |
| d.H2 / d.H2b pointer moves from the cell INTO the bubble without it vanishing | **FAIL** (F3) | kept only by a jump straight into the list. With 10 or 20 steps, with or without pauses, it went at the first step inside the 8px gap | d-H2b-bubble-gone-on-the-way |
| d.H2 once inside, the wheel scrolls the list and the bubble stays | PASS (when reached) | 184 → 34 | — |
| d.H3 leaving the bubble puts it down | PASS | | — |
| d.H4 History on, a click on the detail still focuses it | PASS | | — |
| p.H1 a tap shows the last 3 lines and "⌄ all 13 changes" | PASS | | p-H1-tap-bubble |
| p.H1 the same tap still focuses the detail underneath | PASS | | — |
| p.H2 "all 13 changes" expands the whole story; the list is capped and scrolls | PASS | 13 lines, 338 tall of 544 | p-H2-expanded |
| p.H3 a finger scrolls the expanded list, the bubble stays | PASS | a raw finger drag moved it 206 → 77. Chromium's own synthetic swipe did not move it (a tool limit — the raw drag is the real gesture) | p-H3-finger-scrolled |
| p.H4 History on, a tap on an empty seat still arms it | PASS | armed the OFT sim seat | p-H4-seat-armed-history-on |

### Regression sweep (desktop) · `b3-05-regress.mjs`
| id | result | what the screen said | picture |
|---|---|---|---|
| d.R1 Publish day (Fri) | PASS | "Friday published — APPROVED"; ORIG, Unpublish offered | d-R1-fri-published |
| d.R2 Undo of the publish / Redo | PASS | "Undid: publishing a day" → DRAFT; "Redid: publishing a day" → ORIG | d-R2-fri-after-undo |
| d.R3 Publish AL (Sun, 1 pending) | PASS | "Published AL1 · 1 item on Sun only · approved by Basher · 1 day with changes still held" | d-R3-sun-al1-published |
| d.R4 Unpublish Tue, then re-publish | PASS | DRAFT → "Tuesday published — APPROVED", ORIG; the Signed line names the new four | d-R4-tue-unpublished, d-R4-tue-republished |
| d.R5 plan switch Wed Plan B → Plan A → back | PASS | "Switched to "Plan A" — this is now the live Wednesday", and back | d-R5-wed-plan-switched |
| d.R6 the Amendments panel's own Publish AL2 (Mon) | PASS | "Published AL2 · 1 item on Mon only · approved by Cinch"; the panel lists AL2 | d-R6-panel-after-publish |
| d.R errors across the sweep | PASS | none | — |

## 2. Findings

### F1 — a refused template looks exactly like one that applies (item 4, D96) — small, the look only
- **Steps:** Edit Schedule, desktop. Save any day as a template. Open Templates on a published day (Tue), then on a
  draft day (Fri). Rest the mouse on the template row.
- **Expected:** "every template is drawn disabled", so a reader can tell a refused choice from a live one.
- **Seen:** the row is truly disabled (a tap does nothing, and the reason sentence sits above it). But it is drawn the
  same as a live row: same white text, same fill, the pointer hand. Under the mouse it lights up accent blue, border
  and text, just like a choice you can pick. Measured: the published and draft rows compute the same colour, opacity,
  fill and cursor. Phone: same drawing, no hover.
- **Pictures:** `d-T6-tue-published-template-row-disabled.png`, `d-T6-fri-draft-template-row-enabled.png`,
  `d-T6-tue-published-template-row-hovered.png`.
- **Cause (my read):** `board.ts dayTplMenu` sets only `disabled` on the row. `scheduler.css` has no disabled rule
  for `.wavemenu button.wm`: the base rule carries `cursor:pointer`, and `.wavemenu button.wm:hover` has no
  `:not(:disabled)`, so it applies to the disabled row too.

### F2 — loading Monday quietly changes Tuesday, for a request covering both that sits on Monday's programme (item 6, D98 / AM1) — moderate
- **Steps:** Inputs page: file an "Other" request for one man, all day, Mon 13 → Tue 14 (both days published). The app
  puts it on MONDAY's programme; a request lands one row, on its first day. Tuesday now reads "1 pending". Its list
  says "Talisman · B3 TWODAY A — not on the programme → on the programme", and Tuesday's Personal Inputs shows the
  request as accepted (UNDO). Now on Monday, plans menu → AL1 → "Load onto working copy" → confirm.
- **Expected (the brief; AM1):** loading Monday must not change Tuesday. A request that also covers another day is
  left as filed, and the message says so. It does exactly that when the request's row stands on Tuesday (shape B, PASS).
- **Seen:** Tuesday's content is untouched, but Tuesday changes all the same. Its "1 pending" disappears, and the
  request turns fresh on Tuesday too: its row on Tuesday's Personal Inputs goes from "UNDO" to "→ GROUND → UNAVAIL".
  The message is only "Monday: AL1 loaded onto the working copy … · 3 unpublished edits replaced". Nothing names
  Tuesday or the request. A waiting change on another day went with no word.
- **Why it matters:** the result happens to match what Tuesday was issued with, so nothing wrong goes out. But
  Tuesday lost a waiting change silently, which the one-day rule and "nothing changes without the scheduler
  acknowledging it" (D45's principle) both forbid. New requests do this today, so D56 does not exclude it.
- **Pictures:** `d-L4A-tue-before-mon-load.png`, `d-L4A-tue-pendlist-before.png`,
  `d-L4A-tue-board-before-mon-load.png` → `d-L4A-tue-board-after-mon-load.png`, `d-L4A-mon-after-load.png`.
- **Cause (my read):** `publish.ts filingRestorePlan`. Its "another day" guard refuses only when another published day
  was ISSUED with a different filing (`sn.fil[id] !== want`). Tuesday's Original went out before the request existed
  ("fresh"), which is the load's target, so the guard passes. The `landed` test does not catch it either: the only row
  stood on Monday, the day being loaded. What is missed: the request's CURRENT filing is itself a waiting change on
  Tuesday's working copy. The guard compares against the other day's issued version and never its working copy.
- **Side note, same fixture:** Tuesday's pending list calls the filing "not on the programme → on the programme",
  though the row is on Monday's programme, not Tuesday's. That is an older way of wording the filing, not new with
  this batch, but it reads oddly on Tuesday.

### F3 — on a desktop the History bubble drops as the mouse crosses into it (item 10, D105) — moderate for the desktop half of D105
- **Steps:** board, desktop. Edit one detail 12+ times. History on. Hover the detail: the long bubble opens above it,
  8px clear of the cell, its list scrollable. Move the mouse up into the list at an ordinary pace.
- **Expected (D105):** the pointer can move INTO the bubble and wheel-scroll its list without it vanishing.
- **Seen:** the bubble survives only if the pointer jumps from the cell straight into the list in one move (4 steps
  over ~200px). With 10 or 20 steps, with or without a 25–40ms pause per step, it is gone at the first step that lands
  in the gap (y 482, over the row's container). It stays gone for the rest of the path. Once inside, the wheel does
  scroll the list (184 → 34), so scrolling works and reaching the list is what fails. Real mice send many small moves,
  so this will usually fail in his hand.
- **Pictures:** `d-H1-hover-long-story.png` (the bubble up), `d-H2b-bubble-gone-on-the-way.png` (gone mid-path);
  the step-by-step trail is in `b3-04b-bubble-path.mjs`'s output.
- **Cause (my read):** `histbubble.ts wireHistBubble`, the `over` handler: `const c = cellOf(e.target); if (!c) return
  hideHistBub()`. It puts the bubble down on the first non-cell element under the pointer, and bypasses the 350ms grace
  that the `out` handler starts for a long story (`hideT = setTimeout(hideHistBub, 350)`). The bubble's own head and
  edges take no pointer, so crossing them also reads as "over the board". One way to fix it (for the builder): while
  that grace is running, `over` on a non-cell leaves the decision to the timer.

## 3. Surprises and notes (not failures)
- **Item 11, for his iPhone look:** in the iOS-like emulation the board correctly follows the visible band. But the
  field being typed into moved down with the board, below the band (1069–1105 against 260–804), so he could not see
  what he types. A real Safari also scrolls a focused field into view by itself, which the emulation cannot do, so this
  is not a verdict. When he checks on his phone: can he see the field he is typing into, and does the board hold
  still? (`p-K1-*-E1-keyboard-visible-band.png`.) In the Android-like run the field also sat under the keyboard
  (809–845 in a 544 screen). Chrome normally scrolls it into view itself; this headless run did not.
- **The pending list stays put when the week scrolls under it** (`d-L4A-tue-pendlist-before.png`): my script scrolled
  the week after opening it, and the list stayed at its old place, away from its chip. This is B1's area; flagged for
  B1 or the host to check whether it should close or follow.
- **Unpublish shows no message** (R4: no toast), where Publish day, Publish AL and the plan switch each say one.
  I do not know if it ever did; noted, not called a defect.
- **Tooling:** a Playwright "mobile" context widened the page past the app's 820px phone line, so the app ran its
  DESKTOP bubble (`b3-04c`). The phone was walked with the standard 390-wide context, with touch switched on only for
  the finger drag. Chromium's CDP "set visible size" does not shrink the visual viewport (measured), hence the
  stand-in for E1.

## 4. What I checked and found right
- Refused at both doors (the week's Templates, desktop and phone; the board's Templates, desktop), on a published day
  with and without waiting changes, with the one sentence on screen. A tap changes nothing and says nothing else.
  Saving stays open. A draft day applies and Undo takes it back. After Unpublish the templates open again.
- The load, desktop and phone: the taken-off request comes back; 0 pending; the confirm's N equals the day's count
  and counts the filing; the ⓘ panel, the board strip and the week agree. A request filed after the version goes back
  to fresh. A request whose row stands on the other day is left as filed and named in the message.
- The keyboard: in both emulations, History on and off, no part of the week shows; the board fills what is visible;
  the page behind is unpainted while the board is open and painted again when it closes; focus is kept.
- The bubble: desktop hover gives the whole story, capped and scrollable. The phone tap gives three lines and "all N
  changes", which expands; a finger scrolls the list. History never takes the tap: a field still focuses and an empty
  seat still arms.
- Regression: Publish day, Undo/Redo of it, Publish AL, Unpublish and re-publish, plan switch there and back, and the
  Amendments panel's Publish all work with the right messages. The browser error list stayed empty in every run.

## 5. What I could NOT walk, and why
- **A real iPhone keyboard.** Chromium cannot raise one. The real proof is his iPhone; the two emulations are
  evidence, not proof.
- **A request with rows on BOTH Monday and Tuesday.** The app lands a request as one row, on the day it is accepted
  onto, so that shape cannot be made through the app. Both shapes it can make were walked (F2 is the Monday one).
- **The template refusal on the phone BOARD.** The phone board has no Templates button (its day controls are hidden
  on a phone). The phone reaches templates from the week, which was walked.
- **A pinch-zoomed phone with the keyboard up.** The board deliberately leaves a zoomed page alone. Not emulated.
- **The regression sweep on a phone.** The brief asked for desktop only.
