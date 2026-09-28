# The Tracker leftovers — plan (28 Sep 26)

**Branch** `claude/tracker-leftovers-f79d36` (worktree `.claude/worktrees/tracker-palette-prompt-a0c90f`), cut from `main`
at `60a6792c`. **Items:** `[TRK-RETEST-NOTES]`, `[TRK-EDIT-SIDEWAYS]`, `[TRK-SESSION-PICK]`, `[TRK-DLG-LEFTOVERS]`,
`[TRK-BAKE-STALE]` (`OUTSTANDING.md`). **His order for the work** (28 Sep 26): plan with Opus 5.5, Fable and Astra design
scenarios and red-team the plan, then build, walk and check per `docs/bug-check-order.md`; preview port 4175,
`E2E_PORT=4192`, rulings D370–D379, full checks and the Tracker smoke through the PC lock; nothing to `main` without his
"merge live".

**Parallel chats (D302), agreed by message 28 Sep 26:**
- `claude/change-recording-retest` (D347–D359, ports 4173/4190) takes the Tracker's ↶ ↷ buttons out of
  `components/Header.jsx` (lines ~230–245) into Raptor's top bar through a NEW `src/tracker/undo-bridge.js`, and adds ONE
  registration call where `core.init()` finishes. **This plan does not touch** `canUndo` / `undoWhat` / `doUndo` /
  `doRedo`, `init()`, `Shell.tsx`, or Header.jsx's ↶ ↷ lines. It **does** take the Ctrl+Z note (§C4) — their word: "your
  one-line guard in the key handler". Their measurement: Raptor's top bar at 844×390 is 149px today and stays 149px
  with ↶ ↷ added.
- `claude/docs-tidy-subheads-audit-ec8f87` (docs only, D380–D389) inserts `###` headings into `ui-contracts.md` (its
  Tracker section included); this branch edits body lines there only and keeps both on a conflict.

## 0. The check level — FULL

The order's eight questions (`bug-check-order.md` §5):
1. Money — **no**: the Tracker holds course progress; no OIL, leave or manning.
2. The published record — **no**: nothing in the Tracker is published or signed.
3. Saved data — **YES**: which course and student each person reopens on (stored per browser today); what a date box
   saves while it is typed; the order a student's failures are kept in; a question's answer when a second one opens.
4. A shared drawer — **YES**: the ball (`ballGroup`) is drawn for every event on every chart; the question box
   (`_dlgShow` / `DlgModal`) serves every question in the Tracker.
5. A new gesture — **YES**: a press on a failure tick changes what it does.
6. A new surface — **YES**, possibly: the Edit chart layout strip on a short screen changes shape.
7. Roles — **no**: the Tracker reads no role (D121). The per-person pick is about WHO, not what they may do.
8. The warning list — **no**.

**FULL** (3). So: the rules sweep (§1); Fable and Astra design scenarios and red-team this plan, blind to each other;
the roll-call and door check per item (§2); the walk at phone, sideways phone and desktop, with pictures; break tests;
the gates under the lock; both models read the finished code with the evidence sheet; re-walk what the fixes touched;
the sheet; his look.

## 1. The rulings that apply

Tracker (`.claude/rules/decisions/tracker.md`): **D120** (export → wipe → import; a finding only if new data would be
hurt; the round trip of charts is the highest class), **D121** (no role in the Tracker), **D123** (Last Flown = the
latest day flown; a box briefly empty while retyped is not a day flown), **D124/D130** (deleting a ball deletes its
marks and details), **D126** (event details per chart), **D129** (logout asks about unsaved chart edits), **D134** (pinch
take-back as built), **D157** (Raptor's colours), **D190/D191** (the + Add dialog's typed name is never lost; OK adds a
search that matches nobody).
The Tracker register (`docs/handpass/2026-09-23-tracker-rulings.md`): **R26** (his chart loop: export charts, a session
bakes it, he imports it back), **R42** (− takes the LATEST failure back), **R43** (failure chips worst event first, "its
failures oldest first"), **R46** (the full failures list), **R47** (Done on), **R50** (the most recent flight wins),
**R51** (dates day-first), **R52** (N.A. cannot be failed; its ticks hidden), **R53** (the lull calendar), **R54** (pace
and end dates are the student's), **R62** (grading keeps the view), **R108–R112** (the one undo, its keys and
boundaries, per login session), **R114** (a click-open popup closes on a click outside), **R115** (a repeated-tap
control never moves).
How we work: **D56** (not a finding if only stored data is hurt), **D67** (Opus builds; Fable and Astra review),
**D90** (the later ruling wins), **D201** (a ruling that overwrites fixes what the old one left), **D302** (chats
coordinate), **D228** (the PC lock). Standing UI rules (`raptor-port/CLAUDE.md`): a click-open popup closes on a click
outside; a repeated-tap control must not move; the owner rejected a sideways-scrolling phone header with hidden
controls (15 Aug 26, `tracker.css` phone header comment) — relevant to §D.

## 2. The items

**§2.0 — the baseline.** Every note was re-walked on today's build before this plan was settled (the scripts
`scripts/handpass/trk-lo-00-*.mjs`, pictures `docs/img/handpass/2026-09-28-trk-leftovers/baseline/` — 80, every one
opened; step logs `docs/handpass/parts/trk-leftovers/baseline/`); each item below says what that found. No console or
page error in any of it. Of 16 checks: 12 still happen, C1 and C15 are already fixed, C14 is half fixed.

### A. `[TRK-SESSION-PICK]` — each person reopens on THEIR OWN course and student

**What happens.** The course and student the Tracker opens on are remembered per BROWSER (`ocuLocal:lastCourse`,
`ocuLocal:lastCrew:<course>`), and a logout → login keeps the engine's in-memory `course` / `active` (the section is
remounted, `core.init` does not re-run — `App.jsx` "LOGOUT→LOGIN remount"). So the next person on a shared browser
opens on the last person's pick. `endSession` clears undo, windows and modes but not the pick. **Baseline (M): still
happens** — the admin picked the second course and STUDENT B, logged out; the member opened on that course and STUDENT B
(`lo-M-*`).

**HIS PICK — D376, 28 Sep 26: "own place"** (put to him after Astra's F-08 found this was his call, not the
agent's). **The choice the agent had made, now his:** keep the "reopen where YOU left it" behaviour the smoke suite
pins (it is a design of its own — "the app reopens where YOU left it, and tells nobody else") and make it per PERSON,
rather than the item's other option (every sign-in starts on the default course and no student), which would take
that behaviour away from everyone. It changes the least that was built on purpose.

**Build.**
1. `people.js` (the no-import bridge) gains `setWhoamiId(fn)` / `whoamiId()` beside `whoami` — the signed-in PERSON's
   id (`HOOKS.whoamiId()`), '' when nobody is wired (the standalone Tracker) or nobody is signed in. `peoplewire.ts`
   wires it with `setWhoami` (Raptor answers the headless default `DEFAULT_ME` after a logout — the wire returns '' when
   there is no session, as `whoamiForTracker` does for 'Unknown').
2. `core.js`: the two pick keys go through ONE helper, `pickKey(k)` = `'who:' + whoamiId() + ':' + k` when a person is
   known, else `k` (the standalone and "nobody" fallback — today's key, unchanged). `lastCourse` and every
   `lastCrew:<course>` read and write use it (lines ~1726, ~1805, ~2694, ~4211, ~4303, ~5993). The boot converters that
   rewrite OLD unprefixed keys (~1115, ~1220, ~1236) are left alone (D120: older data is not a finding).
3. `core.js`: the pick records whose it is (`pickOwner = whoamiId()` at every load). A new export, `resumeForPerson()`,
   runs from `App.jsx`'s ready effect (the remount after a login — it already calls `renderBoard` there): if
   `whoamiId() !== pickOwner`, it reloads the course this person last had (their `lastCourse`, else the first course)
   with their last student (their `lastCrew`, else — as today — the last person anyone GRADED on the course, else the
   first), then lands the chart as `init` does (their last mark, else the first event). Nothing is written for the
   outgoing person. The admin's member-view switch (D292) keeps the same person, so it never fires.
4. Removing a student (~4211) clears only the CURRENT person's pick of them; another person's stale pick falls back
   by the existing membership test (`onRoster`), which is already how a pick of a removed student is read.
**Tests (red first):** `retest.test.tsx` F10's logout → login extended: admin picks course 2 + student B, logout,
login as member → member opens on the first course and the default student, NOT course 2 / B; member picks course 1 +
student A; logout, login as admin → admin back on course 2 + B; the standalone path (no whoamiId) still reads and
writes `ocuLocal:lastCourse`. The smoke block "the app reopens where YOU left it" reads the per-person key (it signs in
as the admin), and gains the cross-person check.
**Roll-call — every door that sets or reads the pick:** the Crew dropdown, a wedge press (`ballTap` → `setActive`), the
Course dropdown, + Add course / Rename / Delete course, a syllabus switch (`loadCourse`), + Add student (sets `active`),
Remove student, the undo that switches the picker (`applyMarkHist`), an Import (`reloadFromStore`), the boot (`init`),
the remount (`resumeForPerson`), the Crew-pick landing.

### B. `[TRK-DLG-LEFTOVERS]` — the question box

**B1. A second question never strands the first.** `_dlgShow` answers an open question as CANCELLED (input → `null`,
otherwise `false` — what `uiChoice` reads as 'cancel') before it shows the next, so the first job's `await` always ends.
**Baseline (N): still happens** — with "Rename course" open, Tab left the box at the third press (Cancel, OK, then the
page, Raptor's nav, the Tracker bar); Enter on "+ Add" replaced the rename question, and after Cancel the rename was
simply gone, unanswered (`lo-N-*`). The same walk saw Enter on "⇅ Reorder" behind a question open the reorder window
under it. **So B1 has two halves:** (a) the belt above — a second question never strands the first; (b) the door — while
a question is up, Tab and Shift+Tab stay inside it (Tab from its last control goes to its first, and back), so nothing
behind the shade is reachable by keyboard, as it is not by pointer. **Tests:** (a) as above; (b) a Tab from `#dlgOk`
lands on the box's first control, a Shift+Tab from its first on `#dlgOk`. **Test:** `uiPrompt('a')` then `uiPrompt('b')` → the first resolves `null`, the second is on
screen and answers normally; `uiChoice` then `uiConfirm` → the first reads 'cancel'.
**B2. Enter while a phone keyboard is still composing a word is not a submit.** One helper, `isComposing(e)`
(`e.nativeEvent.isComposing || e.keyCode === 229`), skips Enter in every Tracker text box that acts on Enter — the
roll-call: `#dlgInput` (OK), `#dlgFilter` (pick the one left / add the search, D191), `#hSearch` (Header.jsx — the find
box; outside the ↶ ↷ lines, agreed with the parallel chat). ShowAllPanel's Ctrl+Enter needs a modifier and is left.
**Test:** a keydown Enter with `isComposing: true` on each of the three does nothing; without it, each does what it did.

### C. `[TRK-RETEST-NOTES]` — each note, re-walked, then fixed, put to him, or filed

| # | The note | Today (baseline) | Disposition |
|---|---|---|---|
| C1 | Entering ✎ Edit chart layout moves a scrolled chart (500 → 262; back to 449) | **FIXED already** — ACG-04 and BFM-3 500 → 582 → exactly 500; the 82px drop is the chart centred in the smaller box under the strip (`lo-A-*`) | NONE — archived as fixed; the re-walk repeats the check |
| C2 | The Failures card still counts failures on an N.A. event | still: ACG-01 N.A., card "ACG-01, ACG-01X, ST-02 · 3 FAILS", the full list too (`lo-B-*`) | HIS CALL — §3 Q1 |
| C3 | The X labels follow the order failures were recorded, not their days; − takes back the last recorded | still: "ST-02 · 28/09/26", "ST-02X · 10/09/26"; − took the 10/09 one (`lo-C-*`) | HIS CALL — §3 Q2 (R42 and R43 read two ways) |
| C4 | Ctrl+Z right after a pace / end-date / lull change takes back an older mark, silently | still, all three: the change stayed, an older mark went, the status said "● saved" (`lo-D-*`) | HIS CALL on the shape — §3 Q3; either way the key stops being silent |
| C5 | A slowly typed date saves half-typed years (0002, 0020, 0202…) | still: Upchit and both Last Flown boxes saved 0002/0020/0202; one ↶ left 02/11/0202 and Currency read "666167d … Re-course"; Done on stays fixed but made a do-nothing undo step (`lo-E-*`) | FIX — §C5 below |
| C6 | A press on another student's red failure tick grades the picked student | still: a press on B's tick opened "BFM-3 · STUDENT A" (`lo-F-*`) | FIX — the tick carries its wedge's `data-wi`, and `ballTap` reads `closest('[data-wi]')` over `.wedge, .ftick` |
| C7 | + Set lull period opens on the last month looked at | still: opened on November with today in September (`lo-G-*`) | FIX — a NEW period opens on this month (`openLullPicker` with no index sets `calView` to today's month); changing a period still opens on its own month |
| C8 | A future "Done on" day is accepted (Currency reads "−1d") | still: tomorrow accepted, both Last Flown boxes tomorrow, "−1d", "Landing Current" (`lo-H-*`) | HIS CALL — §3 Q4 |
| C9 | After a students import, a course new to the app goes after the app's own courses | by reading (`applyStudents` "Merge, never replace … a genuinely new one is appended") | HIS CALL — §3 Q5 (by design for a handover; students do not travel his database route, D120) |
| C10 | On a phone the Crew box reads "STUDEN…" (88px at every width under 1050) | still: 88px at 390 and at 1000 (where the bar has room), both students "STUDEN"; 111px at 1440; the name needs ~70px of text (`lo-I-*`) | FIX — the Crew box gets the width a callsign needs on the phone bar, measured so the bar stays two rows at 390px; picture on the look card |
| C11 | A + Add dialog left open while the roster changes keeps its old list (keyboard only) | still: ZULU9 added on Admin → Users by keyboard; the open dialog kept 58 rows without him; reopened, 59 (`lo-J-*`) | FIX — `uiPick` takes the list as a function; `DlgModal` re-reads it on every render (a roster change already notifies, `onPeople`) |
| C12 | At 844×390 Raptor's own top bar is 149px (two rows) | measured by the parallel chat: 149px, and 149px with its ↶ ↷ added | FILE as its own item — a shell matter, and the parallel chat is changing that bar now |
| C13 | A `scheduler.css` comment says a dozing page's insides read 0×0 | still wrong (`src/ui/scheduler.css` `.page.doze`): a dozing Tracker's bar reads 1440×51, a ball 61×61, unpainted (`lo-O-*`) | FIX the comment (one line; the parallel chat is told) |
| C14 | At 1200px the status beside ✓ Save changes shortens to "● un…"; at 1440 "… hit “S…" | half: the bar no longer wraps (51px through edit, Save, Done); the words are cut at BOTH widths — "● sa…" while editing, "● un…" after Done (`lo-K-*`) | FIX the words — while ✓ Save changes is showing, the status reads "● unsaved" (the button says the rest; the long sentence stays in its tooltip). Set in `core.js`, not Header.jsx |
| C15 | (w3 O6, never filed) ⧉ Duplicate syllabus and + Add syllabus do not ask about an unsaved chart edit | **FIXED already** — Duplicate asks (No — only in the copy / Yes — save them on both), + Add syllabus asks to discard; each answer does what it says (`lo-P-*`) | NONE |

**§C5 — the date boxes.** Chrome's date box passes through the half-typed years while a year is typed, and every
keystroke is saved today (the down-days box is a number: a slowly typed "12" saves "1" then "12", two real numbers, and
one ↶ goes back to "1" — undo doing its job, left as it is) (the grading pop-up's Done on box was fixed for this, W2-F2). **The roll-call — every date
box in the Tracker:** Done on (fixed), Failed on (only where the NEXT + lands — gate the +), each row of the full
failures list, Last Flown (Syllabus), Last Flown (Currency), Upchit, End date A, End date B. **Build:** one small
component, `DateBox` (`components/DateBox.jsx`), used by the six side-panel boxes: it shows what is typed, saves only a
whole day (`isWholeDay`, exported from core.js — a 4-digit year from 1900) or, on leaving the box, a deliberate empty;
a half-typed day left in the box is put back to the saved day on leaving it (the robustness doctrine: a refused value
is put back, never left looking saved). Keyed by student, so a Crew switch never carries a draft across. The + beside
Failed on uses today when its box holds no whole day, as it does for an empty box. The number box (down days) and the
pace box are numbers, not dates: each keystroke is a real number — left as they are (an explicit negative in the
sheet). **And a value that has not changed makes no undo step** (the baseline's Done on quirk: the day retyped to the day it
already held made a step that takes back nothing): `setDoneDate`, `setFailDate` and the four side-panel setters return
at once when the value is the one already stored. **Tests:** each of the six boxes fed 0002-11-02, 0020-11-02,
0202-11-02 then 2026-11-02 saves only the last and leaves one undo step (for the undoable ones); an emptied box saves the
empty on blur; a half-typed box reverts on blur; the same day retyped leaves no step.

### D. `[TRK-EDIT-SIDEWAYS]` — Edit chart layout on a sideways phone

**What happens.** At 844×390 the tool strip (three wrapped rows plus its note) takes what is left under Raptor's bar
(149px), the Tracker's bar and the Flow/Info tabs: the chart gets 0px. **Baseline (L):** Raptor's bar
149px, the Tracker's 38px, the strip 144px, then the "Move:" line and the tabs — the chart starts at the screen's bottom
edge, 0px (132px before editing); upright 49/70/214px, the chart keeps 446px (`lo-L-*`). **The mock-up is drawn**
(`scripts/handpass/trk-lo-mock-sideways.mjs`, pictures `docs/img/handpass/2026-09-28-trk-leftovers/mock/`): today
24px, (1) 147px, (2) 167px — both hide the note, the hint line and the Flow / Info / Show All tabs while editing on a
short screen.
**It is a visual change, so a mock-up first** (the house rule): two ways drawn on a real picture at 844×390 —
(1) on a short screen the strip is ONE row that scrolls sideways, with a visible "more ›" edge and the note hidden;
(2) on a short screen the strip FOLDS to one row showing the tool in use and a "Tools ▾" button that opens the full
strip over the chart (closing on a tap outside, the standing rule). The owner rejected a sideways-scrolling phone BAR
with hidden controls on 15 Aug 26 (`tracker.css`), which weighs against (1); recommended: (2). Upright (390×844) and
desktop are unchanged either way. His pick settles it; nothing is built before it.

### E. `[TRK-BAKE-STALE]` — the chart-baking script

R26 (his chart loop: he exports charts, a session bakes them into the shipped charts, he imports the charts-only file
back) is still stated as holding in `docs/tracker/known-gaps.md` — and the script has not run since the ids (13 Sep)
and per-chart details (D126). **Repair, not retire** (retiring would silently end a loop a live document promises).
**Build:** the logic moves into `scripts/tracker/bake-lib.mjs` — a pure function from (the file, the four data blobs)
to (the new blobs, a report) — and `bake-user-charts.mjs` becomes the thin command that reads and writes
`src/tracker/data/*.js` (resolved from its own folder, the bug). It reads a v3 file (D120: the file baked is one just
exported; an older file is refused with "export a fresh file"): each BUILT-IN chart in `charts.order` (an `sb…` id,
its shipped name from `BUILTIN_SYL`) replaces that chart's events and layout; its `eventInfoBySyl` edits land in
`EVENT_INFO_BY_SYL[<shipped name>]` over the shipped wording (`shippedDetails`); a chart made in the app (`sc…`) is not
baked and the report says so; every event must have a position; no student name may reach the data files (checked
against the file's `students` roster entries). **Test:** `src/tracker/bake.test.ts` bakes a file exported by the real
`collectCharts` path into in-memory copies and checks a moved ball, an edited detail, a custom chart reported and not
baked, a student name refused.

## 3. His calls — put to him with a recommendation, built on his answer

**His answers, 28 Sep 26** (`https://claude.ai/artifact/YZKv7p9FeZK51FwwNxycMb`): **Q1 yes — D370**; **Q2 yes — D371**;
**Q3 a — D372**; **Q6 fold — D373** (rows in `.claude/rules/decisions/tracker.md`, readings stated there). **Q4 and Q5**:
he asked for them again in plainer words ("4 explain clearly · 5 what do u mean goes after your own courses") — re-put
the same hour: **Q4 yes — D374** (a future day refused in Done on, Failed on and both Last Flown boxes; Upchit and the end
dates keep taking any day); **Q5 keep — D375** (a new course from a students import joins at the bottom; §C9 closed as
ruled).

Searched first (`record-decisions.md`): no ruling in any area file, `DECISIONS-ARCHIVE.md` or `OUTSTANDING.md` answers
these.
- **Q1 (C2).** An event marked N.A. hides its red failure ticks (R52). Should the Failures card (and its total) leave
  those failures out too? *Recommended: yes — they are kept, and come back if the event is graded again, as the ticks do.*
- **Q2 (C3).** A failure recorded today, then one back-dated to 10 Sep: the card reads ST-02 (today) then ST-02X
  (10 Sep), and − takes back the 10 Sep one. Should the plain code / X / XX follow the DAYS (the earliest day is the
  plain code), and − take back the one with the latest day? *Recommended: yes — R43 says "oldest first".*
- **Q3 (C4).** The pace, the two end dates and the lull periods are not steps ↶ or Ctrl+Z take back, so Ctrl+Z right
  after changing one quietly takes back an older mark instead. (a) Make them steps, like Last Flown and Upchit already
  are; or (b) keep them out, and have Ctrl+Z say what it took back. *Recommended: (a).*
- **Q4 (C8).** A "Done on" day in the future is accepted, and the Currency card then reads "−1d". Refuse a future day
  (the box put back, one line saying why)? *Recommended: yes — for Done on, Failed on and the two Last Flown boxes;
  Upchit and the end dates are often in the future and stay as they are.*
- **Q5 (C9).** Importing a file WITH students adds a course the app did not have AFTER the app's own courses. Keep?
  *Recommended: keep — for a handover your own courses stay first; and students do not travel your database route
  (D120), so the course order never meets it.*
- **Q6 (D).** The sideways-phone Edit chart layout: (1) one sideways-scrolling row, or (2) a folded "Tools ▾" row.
  *Recommended: (2)* — on the mock-up.

## 4. Order of work

1. Fable and Astra: scenarios + red team of this plan, blind to each other (briefs under `docs/superpowers/briefs/`).
   Fold their findings into §2 (capped at ~3 rounds; this is round 1).
2. Build, each fix red-first: B (the question box — both halves), A (the per-person pick), C5 (DateBox and the
   no-change guard), C6, C7, C10, C11, C13, C14, E (baking). Then his answers: C2, C3, C4, C8, C9, D. (C1 and C15 were
   already fixed — the re-walk repeats their checks.)
3. The walk (the Tracker's everything-course: two courses, a hidden chart, three students one of them removed, an N.A.
   event with failures, a back-dated failure, a lull, a pace, an unsaved chart edit, an imported file), at 390×844,
   844×390, 1200×800 and 1440×900, admin and member, both orders of each pair, with pictures; the roll-calls above
   walked row by row; a break test per wired surface.
4. The gates under the PC lock (`gatelock.mjs run`), the Tracker smoke included.
5. Fable and Astra read the finished code with the evidence sheet (both — this touches saved data), blind to each
   other; fix; re-walk what the fixes touched; gates.
6. The evidence sheet `docs/handpass/2026-09-28-trk-leftovers.md`, the look card, the PR, the Vercel link.

## 5. Not in this work

- The Tracker's ↶ ↷ buttons and their move to Raptor's top bar (the parallel chat, D347).
- Raptor's top bar at 844×390 (C12 — filed as its own item).
- Anything that lives only in data already stored (D56, D120): the old unprefixed pick keys, older file formats.

## 6. Round 1 — Fable and Astra, and what is done with each finding (28 Sep 26)

Both reports, blind to each other: `docs/handpass/2026-09-28-trk-leftovers-fable-plan.md` (F1–F17, scenarios A1–E) and
`docs/handpass/2026-09-28-trk-leftovers-astra-plan.md` (F-01–F-10, 20 scenarios). Both read the plan after D370–D375
landed, so part of what they found is the plan catching up with his answers (Astra F-01, F-04). **This section wins
over §2 where they differ.** The scenario lists are the walk's order list (§4.3).

**A — the per-person pick (D376).** *Astra F-08 found the choice was his* → put to him: "own place" (D376).
- The session's person, for the Tracker, is ONE function beside `whoamiForTracker` in `peoplewire.ts`: the signed-in
  person's id, or `''` when `HOOKS.whoami()` is 'Unknown' (no session — after a logout Raptor's id is the headless
  default `bane`, a real member's id; Fable F6). It crosses the no-import bridge `people.js` (`setWhoamiId`).
- **The resume fires whenever the Tracker is SHOWN** (App.jsx: an effect on `active` and `ready`), not only on a
  remount — so an account whose person was changed by another admin while the Tracker sat mounted (`sessionNow` remakes
  the session in place; Astra F-02) is caught the next time the tab comes up. `resetSession` always sends the page to
  View-only Sched, so the Tracker is never on screen across a person change.
- `resumeForPerson()` decides SYNCHRONOUSLY: same person → nothing (the board draws as today); another person →
  `loading = true`, `active` and `pop` cleared, the board NOT drawn (App shows "Loading…"; `ballTap` does nothing while
  loading) until the chained load lands and renders (Fable F4). The chained task reads the person when it RUNS, so a
  later change queues a second task that corrects the first (Astra F-02's generation). `pickOwner` is set when the load
  lands. **With an unsaved chart edit the resume waits** (the edit is never replaced under anyone; production's logout
  already asks, D129 — Fable F15).
- Every pick goes through one writer that also remembers it for the current person: the Crew box, a wedge or tick
  press, + Add (which never remembered its pick — Fable A13, Astra F-08), the undo that moves the picker. The fallback
  for someone with no pick stays the course's shared "last person anyone graded" (Fable F14 — on the look card).
- **Tests** sign in with real people (`pid`: the admin `stiff`, the member `bane`, a third `outlaw`/`hex`), wire the
  bridge and call the resume (Fable F5); the smoke's "reopens where you left it" block reads the per-person key and gains
  a second person.

**B1 — the question box.** *Both found "cancel the first" re-entrant and able to invent an answer* (Fable F2: an import
would silently SKIP a chart; Astra F-03).
- **A FIFO queue, never a cancel:** a question asked while one is up waits for it and then shows; order kept, nobody's
  answer invented. Ending the session answers the one on screen and every waiting one as cancelled (they belong to the
  outgoing person). The logout refusal while a question is up stays.
- **The door (Fable F3):** while a question is up, everything else in the Tracker's page is `inert` (no focus, no
  press), Tab / Shift+Tab wrap inside the box, and the box is `role="dialog" aria-modal="true"`. Raptor's own top bar
  stays usable (its Logout is guarded); a Tab from it can no longer reach the Tracker's controls behind the shade.

**B2 (Astra F-07).** One `isComposing(e)` helper (`nativeEvent.isComposing`, `isComposing`, key code 229) in the three
Enter handlers AND Show All's Ctrl/⌘+Enter.

**C5 + D374 — the date boxes (Fable F1, Astra F-05).** A date box COMMITS when you leave it (blur), on Enter, or when it
goes away (unmount) — never per keystroke, because Chrome passes through whole but WRONG days while the day or month is
typed (the 1st on the way to the 17th). At commit: a real calendar day (strict y-m-d round trip, year ≥ 1900) that
differs from the saved one is saved — for Done on, Failed on and both Last Flown boxes only if it is not after
`isoToday()` (Singapore, D374); an emptied box with nothing half-typed (`validity.badInput` false) saves the empty;
anything else is put back to the saved day, and a refused future day says why in one line. Eight boxes: Done on (its
draft still feeds a grade press), Failed on (+ with a half-typed or future day refuses and says so rather than using
today), each failures-list row (keyed by event + stored index, so a re-sort never moves a draft), Last Flown ×2,
Upchit, End A, End B. One commit = one undo step; the same day retyped = no step (the setters return on no change).
**The feel change goes on his look card:** a date saves when you leave the box, not as you type. The smoke's four
`fill`s on date boxes gain a Tab.

**C3 + D371 (Fable F9, Astra F-01).** The order lives in ONE place: `failDates` returns the failures sorted — dated by
day ascending, undated after, ties in recorded order — and every writer (`popFail`, `setFailDate`) works on that sorted
copy and stores it back sorted, so the ball, the card, the full list, the bubble, the pop-up and the export all agree.
− removes the one with the latest day (all undated: the last recorded).

**C2 + D370 (Fable F10).** Hidden from the card's chips and total and from the full failures list; **the grading
pop-up and the details bubble keep showing them** (the pop-up is where + is refused and a re-grade brings them back;
the bubble is that event's own record) — on the look card. The export keeps them.

**C4 + D372 (Fable F8, Astra F-01).** A mark step snapshots marks, dates, pace AND lull periods; restoring saves all
four. Pace and each end date coalesce per field for two seconds; a lull set, changed or removed is one step (removal
still asks first); Copy to… is ONE group step over every ticked student (a removed student drops out of it; an empty
group is skipped). The exports the parallel chat binds keep their names; the tooltip gains words ("the lull periods for
3 students") — told to that chat. On the look card: a syllabus switch still clears the history (R110) though the pace
is per course.

**C6 (Fable F17).** The tick carries `data-wi`; the `.mine` edge also does but takes no presses. The picked student's
own tick opens grading as before; Details mode and Edit chart layout are unchanged.

**C7 (Fable F13, Astra F-10).** A new period opens on `isoToday()`'s month (Singapore), parsed without a time zone.

**C10 (Fable F16).** The Crew box gets its own phone cap, sized for a 14-letter callsign (D226); the Course box gives
width back; the bar is measured to stay two rows at 390 (and still two once the parallel chat's ↶ ↷ leave it).

**C13 (Fable F12).** The comment says what is measured: the dozing SECTION reads 0 tall; its insides keep their boxes,
unpainted. Filed, not fixed here: whether the Leave War's measurement guards (`Matrix.tsx`, `width === 0`) ever run
while its page dozes.

**C14 (Fable F7, Astra F-09).** The words are cut by the SLOT (172px, 59px beside Save), not their length: the slot
widens to fit "● unsaved" beside Save, measured to keep the bar one row at 1060/1150/1200; while there are unsaved
chart edits the visible words stay "● unsaved" whatever a later background save reports (an error still shows, in red);
the long sentence is the tooltip.

**D + D373 (Astra F-04; Fable's D list).** The folded row on a short screen (under ~500px tall — a short desktop window
too): the tool in use, its one-line hint, ⤢ Fit, Tools ▾. The full set opens OVER the chart, closes on a tap outside,
on Escape (before anything else) and on leaving edit mode; choosing a tool closes it. Asserted: the chart's height is
positive at 844×390. R93/R101 and the contract gain D373's short-screen line.

**E — baking (Fable F11, Astra F-06).** The pure function takes and returns `DEFAULT_SYL_ORDER` too (baked built-ins in
the file's order, the rest after in their order); reads the file through `FMT.readFile` (v3 and `contains.charts`
required; an older file → "export a fresh file"); merges each chart's `eventInfoBySyl` DIFFS into
`EVENT_INFO_BY_SYL[<shipped name>]` over the shipped wording, never into `EVENT_INFO` (D126); leaves a deleted or absent
built-in untouched and reports it; carries layout specials whole; refuses when any roster entry's `.name` appears in the
written data; reports that the smoke's data assertions may need re-checking after a real bake.

**Not adopted, with the reason:** Astra F-02's "owner question for a person reassigned mid-session with unsaved edits"
— the resume waits while an edit is unsaved (above), so no edit is lost and nothing needs asking.
