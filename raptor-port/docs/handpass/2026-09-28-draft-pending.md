# Evidence sheet — `[DRAFT-PENDING]`, the one changes window (28 Sep 26, overnight, D336 (2))

Branch `claude/draft-pending`, cut from `main` at PR #450's merge. Planned (Opus 5.5) → Fable and Astra red team (one
round — `docs/superpowers/specs/2026-09-28-draft-pending-plan-review-log.md`) → built red first → walked → FULL-checked.
Pictures: `docs/img/handpass/2026-09-28-draft-pending/`.

## 1. The eight questions (bug-check order §5) and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money — earned leave, what a man is owed | **YES, read-only** — the window lists OIL awards and Leave War decisions; it moves no OIL. Its lines are written from the war's committed records only |
| 2 | The published record | **YES** — the "To go out" tab IS the published day's pending list (D99/D100); a publish, a withdrawal and the sign-offs now write lines |
| 3 | Saved data | **YES** — the change history is now durable (`elog`, D336 (b)); a new seen record (`changeseen`); an account's `seenFrom` |
| 4 | A shared drawer | **YES** — the puck's corner tag (`alAttr`, the OG tag) and the day heading's chip (`dayStatHTML`) on every surface |
| 5 | A new gesture or mode | **YES** — the window, its tabs, day picker, grouping, the phone bar; History mode = the window open |
| 6 | A new surface | **YES** — the window |
| 7 | Roles | **YES** — admins and members read it (D169), a guest never; a member marks only his own seen entry |
| 8 | The warning list | NO — the window reads the history, not the rules; no warning changes |

**Tier: FULL.**

## 2. The rulings it builds (listed before the walk — the rules sweep)

D99, D100 (the pending list's lines — now the To go out tab), D105 (the bubble), D107 (a tap stays on its page), D109
(a move counts one), D116 (History mode on Edit Schedule, one mode), D117 (the whole week, a day picker), D118 (no
miscounting "N pending" on a day not yet published), D119 (newest first), D167 (the window: movable, resizable, stays
open on a tap, the phone panel and bar, folding groups), D168 (ONE changes window), D169 with D211 (members read it, a
medical change in full), D170 (no Hand over; new to you until marked seen; people and sittings), D171 (the doors: the
day's count for everyone, the admin's icon with the week's count, none for members in the top bar), D172 (OG, headings
unchanged), D215 (a guest: no buttons), D263 (every change to an absence a line), D292 (the admin's member view — the
same person), D336 (b) (the history outlives a sign-out). And the ones it must not break: D38–D41, D77 (the ALL AVAIL
window), D44/D45/D103 (the published record, the sign-offs), D148 (Undo reverses only your own).

## 3. The roll-call

**The things this feature attaches to:** a day heading (the chip), a puck (the OG tag), a changed detail (the bubble), the
top bar (the admin's icon), and the window itself. Every place the app draws them, with a mark in every column — YES,
NO-because, or MISSING (none left MISSING).

| Surface | The chip (shows · opens) | The OG tag | The bubble (History mode) | The window over it | Walked |
|---|---|---|---|---|---|
| Edit week, desktop | YES · YES (N new → New to you; N changes → All; N pending → To go out) | YES — painted on the new-to-you pucks of a day not yet published; none on published Monday | YES (new — D116), hover | YES — `elementFromPoint` lands on it (e2e) | A2–A6, A14, A15 |
| Edit week, phone | YES · YES | YES, painted | YES, tap (the panel shrunk to its bar first, as a person would) | YES — the bottom panel, 12px margins (e2e) | walk-phone A2–A15 |
| Scheduler board, desktop / phone | YES (the sign strip) · YES | YES (2 on Tuesday's first line) | YES, as before | YES — over the board (e2e); an absence line lands on the board's own Unavailable row (P5) | A13, F5 |
| View-only Sched, member — a day not yet published | YES ("N new" — Hex's changes new to Ranger) · YES, read only | YES — the live draft is drawn through `alAttr` | NO — must not: not an edit surface, and the window's History mode wires nothing there | YES | M2, M3 |
| View-only Sched, member — a published day's issued face | NO — must not: the issued face never reads pending (AM24) | NO — must not: a published day | NO | — | M4 |
| View-only Sched, member — a published day's working copy | YES ("1 pending") · YES | NO — a published day (its hollow ALn tags) | NO | YES | M4 |
| View-only Sched, admin | YES (as a member's, plus his own lines never new) · YES | YES | NO | YES | by the same code path as M2–M4 (the chip reads `isMember()`, admin or member) |
| View-only Sched, guest (D215) | NO — must not (no buttons; Fable F9 — a guest was drawn a count before this build) | NO — no "you" to be new to | NO | NO — `openChanges` refuses without `isMember()` | unit (`dayStatHTML` gate); not walked — the guest switch is off by default and the walk did not turn it on (§7) |
| A version preview (👁), a saved plan's look | the plain count it was, never a button | NO — a preview reads a document (it DID paint on a saved plan's look until P4) | NO | — | unit (`amendbatch-app`; `dpfixes` P4); F3 (live 3 tags, the look 0) |
| The ⓘ day panel | a day not yet published: the chip's words ("5 new" / "3 changes"), never the raw count (P7); a published day: "N unpublished edits" as before (the same number as "N pending") | — | — | — | F2, both widths |
| Top bar, admin (Edit Schedule) | the clock icon, no word, the week's new count ("4" → "6" with more) | — | — | opens / closes the window on the week | A5, A15, e2e |
| Top bar, member | NO — must not (D171 (1)) | — | — | — | M1 |
| Print, CSV | NO — must not | NO (`printpdf.ts` never reads `alAttr`) | — | — | by reading (Fable's plan read, negative 10) |
| The ALL AVAIL window | — | — | — | the one pressed last in front, 411 over 410; under a modal | e2e "two windows" |

## 4. The walk — `scripts/handpass/dp-walk.mjs`

A fresh browser, the production build, desktop 1440 × 900 and phone 390 × 844. The world made through the app: Saber
signs the four and publishes Monday through the board's own controls; Hex (a member account given the admin role in
place through the localhost bridge — the role only, order §7.7) puts two men on Tuesday's first line, empties one duty
desk and moves another desk's man onto it, and hands Monday's SDO desk to someone else after publication; Ranger (a
member) files his own leave for Tuesday. Then Saber, and then Ranger, look. Every step is an assertion of the right
behaviour, so re-running it is the re-walk.

**Desktop 24/24, phone 24/24, no console errors** (`walk-desktop/results.md`, `walk-phone/results.md`, 11 pictures each).
What it saw: Tuesday "3 new" (desktop) / "5 new" (phone — more changes in that world's fixture), the gold dot on Monday's
"1 pending", the OG tag painted on the new-to-you pucks and none on published Monday, the icon's week count, the window
on Tuesday / New to you / by Who (Hex, Ranger), the desk move as ONE line "moved from Duty · SXO to Duty · SDO", Ranger's
leave as ONE line whose tap landed on his row under Unavailable with the mark (the absence re-test's R30 finding, fixed),
the window staying open after a tap (the phone's panel shrinking to "Changes · 5 new ▴"), Group by Where (Flying waves,
Duties, Absences), Monday's "To go out · AL1" naming the SDO change with Hex, the week's gold dots on Mon and Tue, the
board's History button and its bubble, the edit week's bubble (D116), Mark all as seen (Tuesday "N changes", the tags and
the icon's number gone), a reload keeping both the history and what Saber had seen (D336 (b)), a sign-off's line, an
Undo's line on the day it changed, a week change closing the window; for Ranger: no top-bar door, the chip on his view,
the window read only naming who, Monday's issued face with no chip and its working copy with "1 pending", no sideways
page scroll.

**The first look found one defect before the walk:** the OG tag was set on the right pucks but drawn off them — its
seat was not positioned. Fixed (`.seat[data-og]{position:relative}`), and the walk and the e2e now assert it as PAINTED
(anti-pattern 21).

**The tests found one:** wiring the bubble on the edit week as well as the board registered its page-wide listener twice,
so the phone's "every change" control expanded and folded back in one tap. Fixed (`histbubble.ts` wires the page-wide
half once), the test that pins that control green again.

**The first full gate run found two:** the board's old "☰ Edit history" lines had a browser test of their own
(`e2e/geometry.spec.ts`, "the way into the changes list follows the width") that still looked for them. The lines are gone
by design (D168 — the window is the list); the test now pins the new door at both widths — the board's History button on
screen, opening and closing the one changes window, the old lines drawing nothing. Everything else in that run passed.

### 4b. Fable's scenario design, and the re-walk

Fable (read-only, before the final reads) designed thirty scenarios and predicted twelve defects, P1–P12, with evidence.
**Each was reproduced red through the app's own code before its fix** (`src/ui/dpfixes.test.tsx`; the Leave War's in
`src/leavewar/changelines-lw.test.ts`), and **the walk gained a step per fix, F1–F9** — the re-walk, at both widths.
Commit `434c3cbf`.

| # | What Fable predicted | Real? | The fix | Proved by |
|---|---|---|---|---|
| P1 | a row dragged above another left the OG tag on whoever slid into its place | **yes** — red | the tag is kept by the ROW (the history's own row-anchored key), each puck's place translated as it is drawn | unit P1; walk F1 (the tag went with the moved desk) |
| P2 | the phone clock icon's number spilled past its 30px button | **yes** — measured | on a phone the number rides the icon's corner as a small badge | walk F4 (both widths, picture) |
| P3 | View-only, a published day on its issued face: a tap said "open the day on the board" to a member | **yes** — red | the day turns to its Working draft (where the change is), and says so; the fallback never names a board on that page | unit P3; walk F9 (Ranger) |
| P4 | a look at a saved plan wore OG tags | **yes** — red | a preview never wears one | unit P4; walk F3 (live 3 tags, the plan's look 0) |
| P5 | an absence line tapped on the board said "shown on the week" about a row the board draws | **yes** — red | the board's Unavailable rows carry the input's address | unit P5; walk F5 (landed, ringed) |
| P6 | a Quals change on "To go out" named nobody | **yes** — red, twice | who and when from the change history; the walk then found an item listing SEVERAL things drew an empty "who" — fixed and pinned red first too | unit P6 (both); walk F8 |
| P7 | the day panel on an unpublished day still showed "N unpublished edits" (D118's complaint) | **yes** — red | it speaks the chip's words ("5 new", "3 changes") | unit P7; walk F2 |
| P8 | phone: after the panel was dragged up, its bar floated where the panel's top had been | **yes** — measured | the bar hands the box back and sits at the bottom; the panel returns to where it was dragged | walk F6 (bar bottom 832 of 844; panel back at 136) |
| P9 | "Discard marks" wrote no line | **yes** — red | a line per day it cleared, "Draft marks cleared (N)" — it clears marks, not changes, and says so | unit P9; walk F7 |
| P10 | a bid an admin's input took away left no Leave War line | **yes** — red | "Leave War · Ranger · LL 2 Feb: bid taken away — an input covers it", beside the input's own line | Leave War unit |
| P11 | a grant read "oil +1" (D25: OIL) | **yes** — red | the counter as the app names it | Leave War unit |
| P12 | a refused door's reason could ride a later, unrelated edit | **yes** — red | a reason is dropped when its task ends | unit P12 |

**Also covered for the first time (S12):** an OIL award's three acts on the grid — given, changed, taken away — one line
each, naming who gave it (Leave War unit; they were right before this, and had no test).

**The re-walk: desktop 33/33, phone 33/33, no console errors** — the original 24 and F1–F9 together, one world per run,
the picture folder emptied first (`walk-desktop/`, `walk-phone/`). Two walk-script errors were found on the way and are the
script's, not the app's: the reorder step first used the wrong move address (the grip writes `mv:d.1.0.N`), and the ⓘ
step left the day panel open, which blocked every later tap.

**Look-card notes from the same design (not defects — his to hear):** P13 a Quals line, a ledger line with no date, and
the "Edit history cleared" sweep are dated the real today, so they show on this week's window only; P14 a member sees the
"To go out · ALn" tab too (D170 named admins; harmless — it is read only); P15 a published day's ISSUED face on View-only
shows no chip at all, so a member gets no hint of a change until he picks Working draft (the plan's rule — AM24: the
issued face never reads pending).

## 5. The break tests — each wiring broken on purpose, one at a time

Run in a SEPARATE copy of the branch (a detached worktree at `C:/Users/User/rbt`, its `node_modules` joined in), because the
two final reads were reading this checkout at the same time. The guard suite — the twelve unit files that watch this
feature — was run once unbroken first (all green, and its file count matched the list, which caught two mistyped names).

| # | The wiring broken | Went red? | What caught it |
|---|---|---|---|
| B1 | the day chip ("N new" / "N changes") drawn | RED | the chip's own tests (`amendbatch-app`) |
| B2 | the OG tag emitted on a new-to-you puck | RED | `dpfixes` P1, P4 |
| B3 | the window stays open after a tap (D167) — made to close | RED | `amendbatch-app` (the jump), `histbubble` |
| B4 | the one subscriber that writes the lines | RED | 18 tests (`changelines`, the Leave War's) |
| B5 | an Undo / Redo writes its line | RED | `changelines` (the Undo line) |
| B6 | a member writes only his own "seen" entry — the second lock | **green at first** → a new test (`changes.test`: a command that CLAIMS his own entry but WRITES another's); now RED |
| B7 | the edit week's bubble (D116) | **green at first** — only the walk (A14) saw it → a new test (`histbubble`, "the edit week"); now RED |
| B8 | the day chip and "N pending" open the window | RED | 4 tests |
| B9 | the week's Unavailable row carries the input's address | **green at first** — only the walk (A8) saw it → a new test (`dpfixes`); now RED |
| B10 | the board's Unavailable row carries it (P5) | RED | `dpfixes` P5 |
| B11 | the history outlives a sign-out (D336 (b)) — put back to clearing | RED | 21 tests (`elog-session`, `elog-durable`) |
| B12 | the OG tag's paint (`.seat[data-og]{position:relative}` taken out) | RED | the browser test `e2e/changeswin.spec.ts`, both widths ("the tag is placed on its own puck") |

**Three wirings were watched only by the walk; each has a unit test now** (commit `c716e2c2`). While writing the B6 test
it first failed on the real code — a false alarm, found by reading what the command returned: the lock DID refuse ("another
person's seen record"); a refused command's roll-back writes an empty record back rather than leaving the key absent, and
the test's first check was stricter than that. The test now asserts the refusal and that nobody else's entry was written.

## 7. Not walked — said plainly

- **The guest view** (D215: no chip, no ⓘ, no window, no OG). The guest switch is off by default and the walk did not turn
  it on; the gates are pinned in unit (the chip's `isMember()` gate, `openChanges` refusing without it).
- **The admin's member view** (D292). Not walked; it is the member's code path (`isMember()` for the chip and the window,
  `isAdmin()` hiding the icon), both walked as Ranger.
- **The Leave War's own screens.** Its decisions, awards, grants and a bid taken away were driven through the Leave War's
  own store functions (the ones its buttons call) in unit tests, not by tapping the grid in the browser; the walk reads
  only the lines an input and a Quals change write.
- **Two admins on two devices.** Not possible before the database: the whole store lives in one browser (D336 — the
  accepted limit, `[DB-READINESS]`); the walk played the two admins one after the other in one browser.
- **Print and the CSV:** by reading only (they never call the tag's code).

## 6. The two final code reads — blind, after the walk (brief `docs/superpowers/briefs/2026-09-28-draft-pending-final-read.md`)

Astra (Codex) and Fable each read the finished code with the evidence sheet, neither seeing the other. Every finding was
reproduced red through the app's own code before its fix (commit `9d1ce068`), then the walk was re-run at both widths
(33/33 each, no console errors).

| # | Who | What they found | Real? | What was done |
|---|---|---|---|---|
| 01 / F3 | Astra (High), Fable (Med) | deleting a man: each future bid his delete took off the war read "bid taken away — an input covers it"; an OIL award went with no line | **yes** — red | war records leaving in a non-war command say plainly what happened: "bid removed", "OIL award taken away"; "an input covers it" only when an input in that command does. **The two reviewers differed** (Fable: only his "deleted" line; Astra: a line per record) — built Astra's way, matching the delete's own input lines; on the look card (Q12) |
| 02 | Astra (Med) | "To go out": an input changed since publishing named nobody and sorted below older work | **yes** — red | one resolver finds its line by the input's id, for the words and the order alike |
| 03 | Astra (Med) | "To go out"'s Quals who/when found its line by the callsign's words — a rename lost it | **yes** — red | a Quals line keeps whose detail and which by id (saved and loaded) |
| F1 | Fable (High) | accepting a request onto the programme (and undoing it) wrote its line TWICE — the pinning test set its input up raw, which hid it | **yes** — red once the test starts from a committed write | the second writer removed; the board's ✕ on an accepted row now shows its sentence as a toast only (one act, one line); the test pins one line for accept and for Undo |
| F2 | Fable (High) | on the Leave War, an approved leave deleted read "approval taken back (back to a bid)"; refused read the same; moved read as an un-approval plus a fresh approval | **yes** — red, all three, through the war's real doors | one line per decision: "approved leave deleted on the Leave War", "approval taken back — refused", "moved on the Leave War · 2 Feb → 3 Feb" (shown on both days) |
| F4 | Fable (Low–Med) | a posting out set, changed or taken back left no line | **yes** — red | "Leave War · X · posting out 14 Oct · Overseas Sqn", "… taken back", "… changed", and the same for a posting in; silent when the same act already says "archived" / "deleted" |
| F5 | Fable (Low) | an input's line was a button that landed nowhere (a request under Personal Inputs; an input moved to another week) | **yes** — red | Personal Inputs rows carry the input's address and a tap opens that folded panel; a line about an input wholly outside the week is not a button; a miss says "That input is not shown on this day" |
| F6 | Fable (Low) | render-hot work once the history has lines | fair | the OG check skips keys that never hold a man; the icon's count kept with the chips'; the day dots worked out once |
| F7 | Fable (Low) | a man moved to another day was one line for the week but one per day on the chips | **yes** — red | a move pairs only within one day (D109) |
| F8 | Fable (Low) | the OG tag's memory ignored which days are published | fair | it resets on a publish or withdrawal too |
| F9 | Fable (Low, D201) | three passages in the engine rules still named the retired writers; two old readers filtered by weekday position | yes | corrected; the readers narrow by calendar day |

**Then a narrow second read of the fix commit alone** by both again (brief `…/2026-09-28-draft-pending-fix-read.md`) —
§6b below.

### 6b. The narrow reads of the fixes (rounds 2 and 3 — brief `docs/superpowers/briefs/2026-09-28-draft-pending-fix-read.md`)

**Round 2 — on `9d1ce068`.** Both found the same two defects in the new Leave War readers, independently, each red
through the war's real doors before its fix (commit `3d941ee6`):

| # | Who | What | Done |
|---|---|---|---|
| FIX-01 / FF1 | both (High) | ONE day cut out of a multi-day approved leave (refused, deleted, moved): the war SPLITS the Input and the new reader took the split's remaining piece for a "moved to" — "moved 3–4 Feb → 4 Feb", a false fresh approval, or two lines | the approved-leave lines are now read by the DAYS each man's approvals of a type covered before and after the command: gone+new = moved, gone = taken back / deleted, new = approved; a split's remainder covers days it covered before, so it says nothing |
| FF3 | Fable (Med, older than this build) | approving the day next to an approved leave (it EXTENDS that Input) read as "LL 3 Feb: deleted"; a bridge read as "approved leave deleted" | the same reading by days: one "approved on the Leave War · 3 Feb" |
| FIX-02 / FF2 | both (Med) | the posting's "quiet" rule looked at WHICH fields flipped, so the posting's own Undo after it ran said only "archived: yes → no" (overseas) or two lines (SANS), and a run posting re-dated said no "changed" line | decided by WHOSE act the command is: the posting command says the posting and leaves out the archive / SANS it made; its Undo on its own archive now runs as the posting command (an Admin → Users Restore stays a restore); Archive / Restore / Delete stay quiet |
| FF5 | Fable (Low) | a new person added with his post-in date: two lines | quiet: "added to the roster" is the one line |
| FF4 | Fable (Low) | a war move's line carried only the new record's id, so "To go out" on the day the leave LEFT named nobody | every absence line keeps whose it is; "To go out" falls back to it |
| FIX-03 | Astra (Med) | a line opened on Monday about a leave moved to Tuesday was a button landing nowhere | the line goes to a day its row is drawn on now (Tuesday); on none, it is not a button |
| FF6 | Fable | (an observation, not a defect — the one-day view's miss says so plainly) | superseded by FIX-03 |

The re-walk after them: desktop 33/33, phone 33/33, no console errors. **Round 3 — on `3d941ee6`** — below.

**Round 3 — on `3d941ee6`** (the last; the review-round cap is three, and after it the tests and the walk carry it). Both
again found the same things independently, each red before its fix (commit `1270680e`):

| # | Who | What | Done |
|---|---|---|---|
| R3-01 / G2 | both (Med) | a war move's line pointed at the split's untouched REMAINDER, so a tap went to the day that did not move; a bridge's line could name the deleted piece and stop being a button | the line points at the record holding the days it is about, and keeps every record of the decision (`iids`) |
| R3-02 | Astra (Med) | "To go out"'s same-man fallback (round 2's FF4) could credit a moved leave to an unrelated later edit | gone — the record it left is matched by id (`iids`) |
| R3-03 / G3 | both (Med / Low) | two leaves decided together with a gap between were one line spanning the gap day, so the gap day showed a change | a line keeps its exact days when they are not one run (`days`, `wdays`, saved and loaded) |
| G1 | Fable (Med) | a two-day leave slid one day read "2 Feb → 4 Feb" | "2 Feb–3 Feb → 3 Feb–4 Feb" — each landed piece whole, and the days it came from |
| G4 | Fable (Low, D201) | three comments still called the posting's Undo a Restore | corrected |

The final walk after them: desktop 33/33, phone 33/33, no console errors (`walk-desktop/`, `walk-phone/`).

## 9. The gates — on the final code (`1270680e`), one run under the PC lock

| Gate | Result |
|---|---|
| Unit (`npm test`) | **6746 / 6746** (417 files) |
| Build (typecheck + bundle) | clean |
| The original's assertions (`reference/tfin.js`) | **728 / 0** |
| Browser tests (`npm run test:e2e`) | **485 passed**, 48 skipped (the same count as `main`'s baseline) |
| The Tracker's suite (`npm run smoke:tracker`) | **443 / 0** |
| Rulecheck, docsize | pass |

Earlier runs on this branch, for the record: the first full run (`eb25c88c`) failed two browser tests of the board's old
"Edit history" lines — moved to the new door (§4, "the first full gate run"); every run after it green.

## 10. His look card — what to look at, and the questions that are his

**Where:** the preview link on the pull request (the Vercel link). "New to you" means another person's change, so make
one first:
1. Sign in as `us` / `us` (Ranger, a member). On Inputs, file a leave for yourself on Tuesday 14 Jul. Sign out.
2. Sign in as `ad` / `a` (Saber). Open Edit Schedule.
3. To see the small dotted **OG** tag on a changed puck as well, a second admin has to move people: as Saber, on
   Admin → Users make Hex an admin; sign in as `hex` (any password), put a man on a seat on Tuesday, sign out, and come
   back as Saber.

(Or just look at the pictures in `docs/img/handpass/2026-09-28-draft-pending/` — `walk-desktop/` and `walk-phone/` tell the
whole story, one picture per step.)

**Look at (a minute each):**
1. Tuesday's heading reads "N new" in gold. The clock icon at the top (admins only) carries a gold number.
2. Tap "N new": the changes window opens on Tuesday — New to you / All changes, the day picker, Group by Who / Where. Tap
   the leave line: the schedule goes to Ranger's row and rings it; the window stays open (on a phone it shrinks to a bar
   at the bottom — tap the bar to bring it back).
3. On a published day with something waiting, "N pending" opens the same window on "To go out · ALn" — the list you
   approved.
4. "✓ Mark all as seen": the gold goes, the heading reads "N changes", the OG tags and the icon's number go. Sign out
   and back in: it stays seen.

**Questions — my readings of your rulings, built this way; say if any is wrong:**
1. **The history now outlives a sign-out and a reload** (your D336 (b) question, built on YES). The history is one record
   for the squadron; what is NEW is kept per person. Keep?
2. **One count per day, never two:** "N pending" on a published day with changes waiting (with a gold dot when something
   on it is new to you); otherwise "N new"; otherwise "N changes". Keep?
3. **History mode (the hover / tap bubbles) is on while the window is open**, on the board and Edit Schedule alike, and
   the board's History button now opens the window. Keep?
4. **A move you put back reads as two lines** ("moved from A to B", then back). The history is the working record (your
   D263 (3)); "To go out" still counts 0 for it. Keep?
5. **A leave covering several days lights the count on every day it covers**, and marking it seen on one day clears it
   on all. Keep?
6. **Someone given access later starts with nothing new**: the history before his account existed is the squadron's
   past, not news to him. (The four demo accounts predate this, so every change by someone else is new to them.) Keep?
7. **A change on Quals** (a CAT, a tick, a callsign) is a line dated the day it was made, so it shows in THAT week's
   window — not in the demo week's. On a published day's "To go out" list it now names who made it. Keep?
8. **A Leave War decision with no place on the schedule** (a refused bid, an award) is listed but cannot be tapped.
   Keep, or should a tap take you to the Leave War at that day?
9. **The admin's clock icon is on Edit Schedule only** (where "Edit history" was). On View-only Sched an admin uses the
   day counts, as a member does. Keep?
10. **On View-only Sched, a published day shows its issued schedule, which carries no count** (it never reads pending —
    your earlier rule). So a member sees nothing on that day until he picks "Working draft". And when he taps a change
    about that day in the window, the day switches itself to "Working draft" and says so. Keep both?
11. **Members see the "To go out" tab too** (read only). You named admins for it (D170); it does no harm. Keep?
12. **When you delete a man, each future bid and OIL award the delete takes off the Leave War is its own line** in the
    changes window ("Leave War · Ranger · LL 2 Feb: bid removed", "… OIL award taken away"), as each of his future inputs
    already is. The two reviewers differed: one wanted only his single "deleted" line. Keep the full list, or just the
    one line?

**Said plainly — a lapse in the order you set (D336 (2)):** the first two pieces of the build (the history's storage and
each person's "seen") were written while Fable and Astra were still reading the plan, instead of after. Neither review
asked for them to change, and one finding asked for exactly what was built. But it was out of order, and it is logged so
it does not happen again.

---

**Walk:** `scripts/handpass/dp-walk.mjs` — desktop 1440×900 33/33, phone 390×844 33/33, no console errors, on the final
code; pictures `docs/img/handpass/2026-09-28-draft-pending/walk-desktop/`, `walk-phone/` (one run each, the folders
emptied first). Break tests 12/12 red (three pinned during the check). Reads: two blind final reads + two narrow rounds
on the fixes (the three-round cap reached). Every finding reproduced red before its fix.
