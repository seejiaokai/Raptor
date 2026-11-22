# The faults Fable's reads proved — the bug check (22 Nov 26, chat 133, [FABLE-READ-FAULTS], his D2268)

The faults: `docs/superpowers/briefs/2026-11-21-msq-fable-never-read.md` §2–4. Each was re-proved red on `main` (8ef011c73)
with the reader's own test before any fix; all reproduced. Fixed by: OIL F1, Inputs F1 and F2 — Fable, as helpers (his
D2268, D2258); Inputs F3 and F4, Leave War F1 and F2, the ✕ found beside Inputs F1/F2 — Opus (this chat). OIL F2 — not
built: it adds words on screen, so it is drawn for his choice first (D1625), its proof kept running as an expected failure.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money — what a man is owed, OIL, who counts as present | YES — OIL F1 (a posting took earned OIL), Leave War F1 (OIL taken not taken off), the ALL AVAIL crowd |
| 2 | The published record | YES — OIL F1: a published day read pending and its next amendment dropped a man |
| 3 | Saved data | YES — Inputs F1, F2: a document and a "Goes to" lost while the window said saved |
| 4 | A shared drawer | YES — the input window, used from the Inputs page, the calendar and the schedule |
| 5 | A new gesture or mode | NO — no new control; the ✕ now asks where it should already have asked (D1622) |
| 6 | A new surface | NO |
| 7 | Roles | NO — no change to who may do what; Leave War F2 refuses only an id naming nobody, which no screen sends |
| 8 | The warning list | NO — the LATE mark is a mark, never a warning (the scheduler's settled late-mark rule); no warning changed |

**Tier: FULL** (YES to 1, 2, 3).

## 2. The roll-call

OIL F2 was built after this sheet was laid down (chat 138), so its rows join here; Astra's scenario report
(`docs/superpowers/briefs/2026-11-22-oil-f2-scenarios-astra.md`) gave its ten door rows, R01–R10, the start of them.
Pictures: `docs/img/handpass/2026-11-22-fable-read-faults/` — the first walk in `w1/`, `w2/`, `w3/` (build `ac3e22f77`);
the re-walk in `rewalk/w3/` and `w2/only-s3-both/` (build `e0a2a4155`); finding (f) reproduced before its fix in
`w2/only-s3-d/`.

| Thing changed | Where the app draws it | SHOWS | USABLE | PAINTED there too |
|---|---|---|---|---|
| OIL F1 — the ALL AVAIL crowd of a published day kept when a man is posted out as SANS later | Edit Schedule's day head (pending chip, four sign-offs), View-only Sched, the ALL AVAIL window's count, the next amendment, the Leave War's FO | YES (w1 S1, both sizes: nothing pending, Hex's FO kept) | YES (real controls only) | the crew list's "SANS avail" — MISSING → filed, finding (e) |
| Inputs F1 — a document on a shared input | the input window's chips, the List's paperclip, the calendar card, the day window, the week window, the board's Personal Inputs, the document viewer | YES (w2 S2, both sizes) | YES; on the test WebKit a stored file cannot survive a reload (§10 (g)) | the viewer's "Placed by Saber for Drifter" names one of two people — a lead, §10 |
| Inputs F2 — an Other's "Goes to" with its OIL answer, one Save | the window, the schedule's Unavailable, the calendar card, the Leave War | YES (w2 S3, both sizes) | YES | NO-because the board's and the week's rows draw it from the same record |
| Inputs F3, F4 — the LATE chip on a late-added man's row | the board's Personal Inputs and Unavailable rows, the Inputs list (kept as the paperwork record) | YES (w2 S4, both sizes) | YES, a tap drops it and a tap brings it back, kept after a reload | NO-because the week draws no chip it could miss |
| Leave War F1 — OIL leave on dates no period holds | the OIL tracker, Balances, the person window, the member's My leave | YES (w1 S5, both sizes: 3 → 2 at once) | YES (delete, Undo, Redo) | the person window's "Thu 3 Feb" shows no year — a lead, §10 |
| The ✕ and Escape ask over an unsaved "Goes to" / "To" / document | the input window on the Inputs page and the schedule's pop-up | YES (w2 S3) | YES (Cancel keeps the window) | NO-because nothing else draws the question |
| The window follows its record changed behind it (Astra's F1, then finding (f)) | the input window on the Inputs page; the schedule's pop-up the same window becomes | YES (re-walk: after an Undo the pop-up reads the record) | YES (a remark saved after it) | MISSING before the fix — finding (f), fixed red-first |
| OIL F2 — the sign-off held until the day's OIL is answered | the four sign-off boxes on the board and on Edit Schedule's week (R01) | YES (w3 F2-a–d, both sizes) | YES | NO-because Clear and the empty option ask nothing (R02, F2-d) |
| OIL F2 — the day's OIL list with the held box and its foot | the list window, over the board and the week | YES; matches the drawing (w3's drawing check, 0 differences over 2px) | YES (Save, Later, ✕, Escape) | no held box once the hold no longer stands — re-walk F2-f, F2-j |
| OIL F2 — the publish note naming the unanswered input | the day's Publish (board, week — R03), the Amendments panel (R04) | YES (F2-b, F2-e, F2-g) | YES | NO-because the published face carries no note |
| OIL F2 — the doors that move signatures without a press (R05–R10: plans, a version loaded back, Undo / Redo, Clear, Unpublish, the other list openers) | the plans selector, the version list, the top bar's Undo | YES for the plan switch (re-walk F2-j) and the week change (re-walk F2-f, weekhold) | YES | the rest carried by tests (§5) |

## 3. The five sizing lines

1. **Type:** C (a new step at the sign-off) + G (OIL saved, the publish path, Undo) + D (a sign-off and a document drawn
   in several places, each by its own code).
2. **Walkers:** three Opus walkers (his D2256), side by side on the build of `ac3e22f77` — w1 the SANS case and OIL leave
   next year, w2 the document, the Other under Unavailable, the LATE chip, w3 the sign-off question (nine scenarios) and
   the drawing check; the re-walk by the host on `e0a2a4155`.
3. **Size:** 14 scenarios plus the plain-user rounds, desktop 1536 and iPhone 402 (WebKit, by touch); the re-walk the nine
   sign-off scenarios again, the plan switch (new), the week change, and walker w2's route for finding (f), both sizes.
4. **The drawing:** OIL F2 has an approved drawing (D2297) — the drawing check measured the list against
   `draw-f3.mjs` (0 differences over 2px), the formal part list not made.
5. **Why this size:** YES to money, the published record and saved data (FULL); the lessons of §7.11 that apply — 1 (a
   state table: the list's states × held / not held, F2-a–j), 3 (what tells him it happened: the note after Save, the
   publish note), 4 (the page behind the list works: F2-f, F2-j), 12 (every page the input window opens from: List,
   calendar, board), 16 (after a refusal: F2-c, the refused Later), 19 (every way out of the list: ✕, Escape, Later,
   Save), 30 (phone pictures right after each tap: the `-tap-` pictures); the rest cannot apply (no drag, pinch, scroll,
   print or midnight in this change).

## 4. The orders walked

- **The SANS case (w1 S1):** a published holiday with ALL AVAIL, Hex posted out as SANS two days later → the day reads
  nothing pending, the four sign-offs kept, the next amendment keeps his FO. Money: Hex's FO stays.
- **OIL leave next year (w1 S5):** OIL filed for Ranger on 3 Feb 2028 → the OIL tracker, Balances and his person window
  drop 3 → 2 at once; delete → 3; Undo → 2; Redo → 3; signed in as Ranger, My leave agrees.
- **A shared Meeting's document (w2 S2):** attach, Save, reopen → there (List, calendar, day window, week, board, viewer);
  take it off, Save → gone everywhere; after a reload the same (desktop; the phone, §10 (g)).
- **An Other under Unavailable (w2 S3):** Unavailable and the OIL answer in one Save → under Unavailable on the schedule,
  the card, the Leave War; ✕ and Escape after picking Unavailable ask; Cancel keeps the window.
- **The LATE chip (w2 S4):** on a late-added man's Unavailable and Personal Inputs rows a tap drops it, a tap brings it
  back, kept after a reload; a scheduler's own edit of the row never makes an on-time input LATE.
- **The sign-off question (w3 F2-a–i, re-walked):** first press → list, nothing written; Save → answer then name, the box
  green; Later → name, no answer, the publish note names the input in amber, no FO on the Leave War; ✕ / Escape → nothing
  signed, the next press asks again; every box on the board and the week; two inputs: Save with one answered, the next
  box signs at once (changed since the first walk — §10, the fresh Opus read 1), the note names the one left; a published
  day; a holiday made through the Inputs gear, its bell line, Undo and Redo; the board's bar and the phone's middle.
- **Behind the list (re-walk):** the day changed (the held box stays, Later signs Saturday — a lead, §10); the week
  changed → no held box, Later signs nothing, back on Saturday the box asks again; a second plan made behind the list
  (F2-j) → no held box, Later signs nothing, the next press asks; switched back, Save writes the answer and signs nothing.
- **Finding (f)'s route (re-walk):** the board's Reject then → Unavail; the input's window opened from the List; the top
  bar's Undo → the app goes to Edit Schedule, the window reads "Rejected by a scheduler", a remark typed then is saved
  ("Input updated"); the same for Rejected → Ground.

## 5. Cases carried by a test

| Case | Test | What it proves |
|---|---|---|
| OIL F1, on `main` red first | `leavewar/fableoil-sans-crowd.test.ts`, `fableoil-sans-crowd-kept.test.ts` | the crowd before the posting date kept; the day reads nothing pending |
| Inputs F1, F2 | `ui/fableinp-window.test.tsx` | the document and "Goes to" with its OIL answer saved by the window |
| Inputs F3, F4 | `ui/fableinp-late.test.tsx` | the chip's drop and its tap target |
| Leave War F1 | `leavewar/fablelw-oil-outside.test.ts` | OIL leave with no period comes off his OIL |
| Leave War F2 (not built, his) | `leavewar/fablelw-nobody.test.ts` | kept as an expected failure |
| The ✕ asks; the window follows; finding (f) | `ui/inpwin-unsaved-goes.test.tsx`, `ui/inputedit.test.tsx` | the question, the follow on the Inputs page and as the schedule's pop-up, a removed input closing the window |
| OIL F2's doors (R05–R10: Undo / Redo of the two steps, Clear, Unpublish, a version loaded back, the refused Later, the plan switch, the stale hold, Save leaving the unpicked as Later, the write inside a command) | `ui/oilsign.test.tsx`, `leavewar/publishdoor.test.ts`, `leavewar/fableoil-unanswered-publish.test.tsx` | each door signs nothing it should not and asks again where it should |
| The readers of an input's records | `engine/inputs-readers.test.ts` | every reader of the stored inputs listed |

## 6. Break tests

One red-first test per wired surface, each seen failing before its fix: the files in §5 (the fixes' commit messages name
each red run). Finding (f): `inpwin-unsaved-goes.test.tsx` "finding (f)…" failed ("the window, now the schedule's
pop-up, no longer shows Unavailable") before the fix, passes after.

## 7. Errors seen

None in any walk — no page error, no console error, no failed request (each script's `errors` line), first walk and
re-walk.

## 8. What was not walked, and why

- A squadron change or a sign-out with the list up; a keyboard-only pick of a sign-off name; more than three inputs on
  one day; a member's view of the list (members do not sign) — Astra's S19, S23–S28, S37 beyond their unit tests
  (`oilsign.test.tsx`): time, and each is a door the tests hold.
- On the phone, finding (f)'s route does not exist: the top bar is covered while the input window is up.
- A change of the record behind the schedule's pop-up from the schedule itself: the pop-up's veil covers every control
  that could make it (w2, both sizes) — only its unit test.
- A document surviving a reload on an iPhone: the test WebKit cannot store a file (§10 (g)) — his look.

## 9. Gate counts

- GitHub's full run on `0d21c5abe` (the last push before this re-walk): every job green — build, the code check, the
  Tracker's smoke (2/2), every unit shard (raptor 6/6, Leave War 4/4), every geometry shard; the run on the re-walk's push
  is read before his look is asked.
- On his PC after finding (f)'s fix: the 49 test files that use the input window, 1,255 tests, all passed; the code
  check: no new finding; the build clean.

## 10. What the walk and the reads found, and each disposition

| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | Astra's scenarios, F01 | a name held on one saved plan signed another after a plan switch behind the list | FIXED red-first (`holdStands`); walked F2-j, both sizes |
| 2 | w3 | the list still promised "Later: Ace signs" after the week changed behind it | FIXED red-first (the held box drawn only while the hold stands); re-walked, both sizes |
| 3 | GitHub's run | the code check (the list's function too branchy) and the Leave War's no-`any` test | FIXED, green on the next run |
| 4 | the fresh Opus read, 1 | Save with one of two answered, the next box asked again and its answer cleared the first name | FIXED red-first (Save leaves the unpicked as Later does); F2-e re-walked with its new expected result |
| 5 | the fresh Opus read, 2 | a held press wrote the day's sign record outside any command | FIXED red-first |
| 6 | Astra's read, claim 3 | a refused Later used up the question | FIXED red-first (`writeHeld`) |
| 7 | Astra's read, claim 1 | a hold should end when the day's content changes behind the list | NOT TAKEN (the agent's reading, told to him): the name is written when he presses Save or Later and signs the day as it stands then, as a press on the box at that moment would; Save itself changes the content before the name, by his D2294 |
| (e) | w1 | the board's crew list shows a man posted out as SANS under "SANS avail" on a day before his posting date | FILED (`[FABLE-READ-FAULTS]` (e)), with Fable's three SANS questions — his answer |
| (f) | w2 | Undo with the input window open from the List: the window kept the old "Goes to"; a remark typed then was lost | REPRODUCED by the host, FIXED red-first (`e0a2a4155`), re-walked both sizes; the root (the bar pressable over the window, against D1645) FILED under [VEILED-WINDOWS-BAR] |
| (g) | w2 | on the phone, after a reload, the viewer said "No document on file" | NOT AN APP FAULT — the test WebKit refuses to store any file in its local database (plain browser code fails the same; Chromium keeps it), and the app said so ("Couldn't save that document…"); his iPhone is the check — on his look card |
| leads | w1, w2, w3 | the person window's "Thu 3 Feb" with no year; the viewer's "Placed by Saber for Drifter" for a two-person input; no door to change "Goes to" from the schedule with the window open; the board stepped to Friday with Saturday held, Later signs Saturday out of sight (the list's title says Saturday) | left as they are, listed for him |
| wording | the fresh Opus read | an input holding ALL AVAIL is named "ALL AVAIL's Training" / "Training for 2 people" in the publish note | his question, on the look card |
| tidiness | the fresh Opus read | the day's head and the capital-letter line each built twice in the publish note; a lost space in an import | filed, not fixed |

## The closing lines

Walk: docs/handpass/2026-11-22-fable-read-faults.md · 556 pictures · 11 surfaces · 21 orders · MISSING: 2 fixed (f, the
stale held box), 1 filed (e), 1 not an app fault (g)
