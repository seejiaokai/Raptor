# [DRAFT-PENDING] — the one changes window: the plan (28 Sep 26, Opus 5.5 on high thinking; for Fable's and Astra's red team)

**His go:** D336 (2) — built overnight, planned → red-teamed by Fable and Astra → built red first → walked both widths →
FULL-checked → STOP at "ready for his look" (never merged without his word). Branch `claude/draft-pending`, cut from
`main` at PR #450's merge. Rulings range for this chat: D337–D349.

## 0. What he ruled — the build must do all of it

| Ruling | What it means for this build |
|---|---|
| **D168** (25 Sep 26) | ONE changes window for the whole app, merging three lists: the published day's pending list (D99, D100), the unpublished day's list (D118) and the Edit history list (D116, D117). Two views: **New to you** and **All changes**; a **day picker**; **Group by Who / Where**; a tap takes the schedule to the change. On a published day the window also says what will go out as the next ALn. |
| **D167** | The window is movable (six-dot grip), resizable (corner), and never blocks the schedule — the ALL AVAIL window's pattern (D38–D41). A tap on a line takes the schedule BEHIND to it and marks it; the window STAYS OPEN. Phone: the ALL AVAIL window's phone form (D77: a full-width bottom panel that moves but does not resize); after a tap it shrinks to a slim bar at the bottom so the change can be seen, and a tap on the bar brings it back. Each group folds and unfolds; dates read "25/9 16:00". |
| **D170** | NO Hand over button. A change made by someone else is **new to you** (a gold dot, NEW, the "N new" count) until you press **"Mark all as seen"**, which affects only your own view. The app groups changes by person and sitting on its own ("Hex · 25/9 15:20–15:38 · 3 changes"); every line says who and when. On a PUBLISHED day the window still says what will go out as the next ALn. A member's "Mark all as seen" is his own too. |
| **D169**, narrowed by **D211** | Members read the window too — every change, who made it — from View-only Sched on the live working copy (transparency: an admin planning himself an easier life is seen). Read only for them. A medical change reads in full to members (D211). |
| **D171** | The ways in: (1) members get NO top-bar door — they open the window from the day's own count; (2) admins get a top-bar door that is an ICON ONLY on desktop too (the clock), whose number counts what is new to you across the WHOLE loaded week; (3) every day heading's count is the per-day way in, for everyone. |
| **D172** | On a day not yet published, a changed puck wears the corner tag **"OG"** in the plain white dotted outline; the day headings stay as they are (ORIG keeps its ticked seal, the AL tags stay solid, no new ticks). |
| **D118** (its live half) | A day not yet published must not show a "pending" that miscounts (a move 2, put back still 2, a new puck in a crowd 0) and cannot be tapped. |
| **D116** | Edit Schedule's history door works like the board's: a TOGGLE — History mode on the edit week too, a changed detail showing its bubble on hover (desktop) or tap (phone), as on the board (D105); ONE History mode shared by the board and the edit week. |
| **D117** | The list shows the whole loaded week, with day chips (All · Mon … Sun) to narrow it to one day and back. |
| **D119** | The pending list shows the newest change first (by the edit record's time); a change with no time goes below the timed ones, in the day's order. |
| **D107** | A tap keeps you on the page you are on (Edit Schedule stays Edit Schedule; the board stays the board). Built today in `jumpToChange` — kept. |
| **D263** | The history records EVERY change to an absence, not only its filing and removal: an input edited, cut by a medical, moved, deleted; the Leave War's approve, refuse, back-to-bid and move — each a line with what changed, who (callsign) and when. The lines are the working record, not a pending count: a change put back still leaves its two lines. |
| **D336 (b)** | The change history OUTLIVES a sign-out (today it is cleared at every sign-in and sign-out); built on YES, and put on his look card. |
| **D212, D148** unchanged | Undo still reverses only your own changes (D148); the four sign-offs unchanged. |
| From `[DRAFT-PENDING]`'s notes | The window's jump must reach an input's Unavailable row (the absence re-test's R30: "Drifter · LL filed" could not be tapped). |

**The design of record:** `raptor-port/docs/mock/changes-window.html` (option A — D170), `changes-doors.html` (the
doors — narrowed by D171: no member top-bar door, the admin door icon-only), `tags-ticks.html` (the OG tag, D172). The
earlier mock-ups (`checkpoint.html`, `handover.html`, `since.html`, `handoff-accounts.html`, `handoff-window.html`) show
ideas later replaced.

## 1. What exists today (read from the code, 28 Sep 26)

- **The edit log** (`src/engine/editlog.ts`) — rows `{t, who, pid, di, key, lbl, from, to}`, 400 rows, in memory only,
  cleared at every sign-in and sign-out (`state/store.ts resetSession → elogClear`). Written by `logEdit` (every slot /
  text write, from `noteChange` and `markEdit`) and `logAction` (structural sentences; input add/remove/trim/accept;
  Undo / Redo with no day). `di` is a day of the LOADED week and holds no week — a Monday line from week A shows under
  week B's Monday (a real defect today, for new data too).
- **The pending list** (`src/ui/pendlist.ts`) — a popup under a published day's "N pending" chip (a button only on edit
  surfaces for a scheduler), the net difference from the issued version (`dayPendingItems`), each line with who/when from
  the log; ordered by the day's sections (D119 not built); a tap closes it and jumps (`jumpToChange`, D107 built).
- **The unpublished day's count** — `dayPendCount`: raw touched keys, never a button (D118's complaint).
- **Edit history** (`src/ui/HistoryModal.tsx`) — a modal from `#histBtn` ("Edit history", Edit Schedule only) and from
  the board's "☰ Edit history · N changes" line; By time / Grouped; "All days" or the board's day. History MODE (bubbles)
  exists on the board only (`#sbHist`); D116, D117, D119 not built.
- **The ALL AVAIL window** (`src/ui/AvailWindow.tsx`) — the pattern: `place()`, grip drag, `ResizeObserver`, the phone
  panel, z-index 410 (above the board 400, below the bubble 430).
- **The command stream** (`src/command/commit.ts`) — every Inputs write and every Leave War decision is ONE envelope
  (`inputs/<iid>` before/after rows; `lw.cell` id `warId:pid:date` with the day's record list before/after), actor =
  the signed-in person. In memory only. No Leave War change and no input EDIT leaves a log line today.
- **The per-person "seen" precedent** — `AccessRequest.seenBy` + `markRequestsSeen`, one `access.seen` command.

## 2. The design

### 2.1 The change history — one durable record (the edit log, grown up)

The edit log stays THE change history (the data model already plans an `EditLog` table, `data-model.md` §11), and grows:

- **Each row gains** `seq` (a number that only rises, stored with the log — the row's identity), `date` (the ISO day the
  change is on — `dayIso(CURWEEK, di)` taken AT LOG TIME, so a week switch never moves it), `end` (the last ISO day, for an
  absence that spans days), `iid` (the input it is about, when it is), `sect` (which part of the day — for Group by Where).
  `di` stays for the session's own readers that need it, but every window reader goes by `date`.
- **Durable** (D336 (b)): saved through the store (`store.set('elog', …)`, the settings path) and loaded at boot in
  `initStore` beside `accountsLoad`. **Not cleared at sign-in or sign-out** any more (`resetSession` loses `elogClear`).
  **Outside undo, by design** (it always was: "an undo does not un-happen") — written raw, never a command-layer record,
  so the global undo never rewinds it. Saved on a batch (one write per burst of edits, flushed before sign-out and on
  page hide), never per keystroke.
- **Cap** 2,000 rows (from 400) — the oldest leave first; measured on the demo world (the size of a saved row) before it
  is fixed, and stated in `data-schema.md`. The database keeps the history properly (its own retention).
- **Undo and Redo lines carry their days:** today "Undo" / "Redo" are rows with no day, which no week can show — so an
  undone change would stand in the window with nothing saying it was undone. The line now carries the days the undone
  step touched (from its envelopes: `days/<wk>#<di>`, `inputs/<iid>`, `lw.cell/…`) and the undo's own words
  (`undo/describe.ts`), one line per day it touched: "Undo — <what was undone>".
- **The admin's sweep** (Admin → "clear the history of edits") keeps working on the durable log; its words say it clears
  it for everyone.
- **Rollback:** a command refused and rolled back must not leave its lines (today `push` writes at once). Lines pushed
  while a command runs are held and kept only if it commits (the latch the log already names, `command/latch.ts`).

### 2.2 Every change to an absence is a line (D263)

ONE subscriber on the command stream (`onCommit`), in the scheduler's state layer, turns each committed `user`-origin
envelope's absence changes into lines — so every door that writes an absence (the Inputs page, the edit window, the
day's accept, a drag onto another man, the Leave War's decide, move, delete, an approval's own Input) leaves its line,
with no call site to forget:

- **`inputs/<iid>`, before and after both present** → one line naming what changed, in the app's words: dates ("1–5 Aug
  → 1–3 Aug"), times, type, remarks, whose it is ("moved from Ranger to Saber"), the OIL answer. A trim by a medical is
  one of these ("LL cut by a medical · now ends 3 Aug").
- **added / deleted** → today's call-site sentences stay (they carry the why: "the tail of a split medical entry",
  "overwritten by a newer medical entry"); the subscriber skips an input a call site already logged in the same command
  (the rows carry `iid`; the subscriber checks the lines pushed since the command began).
- **`lw.cell` (`warId:pid:date`)** → a request added (a bid placed), its state changed (Ack / refused / back to bid), taken
  away (approved — its Input's line says "approved on the Leave War"; or deleted), moved (off one day, on another with
  `shiftedFrom`) — worded "Leave War · Ranger · LL 3 Jan: approved". An OIL credit given or taken by hand is a line too.
- Every line carries `date`/`end` from the absence itself, so it shows on the days it covers — in the window of the week
  those days are in.
- **Where does it jump?** An input's line jumps to its row on the schedule — its ground row when accepted onto the
  programme, else its row in the day's Unavailable block (`iu:<iid>`, the R30 finding). A Leave War line with no Input is
  a still line (it has no place on the schedule).

### 2.3 New to you — the seen record

- A per-person record `changeseen` = `{ [personId]: { upto: seq, extra: seq[] } }`, a durable settings key written by
  ONE command `changes.seen` (the `access.seen` precedent), registered in `SETTINGS_KEYS`, `perms.ts` (`PERMS` row: admin
  and member write their OWN entry only; guest none) and `data-model.md` §11 together.
- **A line is new to you** when someone ELSE made it (its person is not you) and its `seq` is neither ≤ `upto` nor in
  `extra`. Your own lines are never new to you. A guest (D204) has no record and no window.
- **"Mark all as seen"** marks exactly the lines the New to you tab lists (the chosen day, or the week) — adds their
  `seq`s to `extra`, then folds `extra` into `upto` wherever every line up to a point is seen or yours.
- A person with no record yet sees every line by others as new (the unread-email model, D170) — the demo world starts
  with an empty history, so nothing floods.

### 2.4 The window (`src/ui/ChangesWindow.tsx`, new)

- **Chrome from the ALL AVAIL window, shared, not copied:** `place()`, the grip drag, the resize observer and the phone
  layout move into one small shared module both windows use (`src/ui/floatwin.ts`), so the two can never drift.
  Stacking: 410, the ALL AVAIL window's level; opening one does not close the other; the one touched last comes to the front.
- **Head:** "Changes · Tuesday 14/7" (or "Changes · week of 13/7"), and under it "Not yet published" / "Published ·
  3 changes waiting to go out as AL1"; ✕ closes.
- **Tabs:** **New to you N** · **All changes N** · and, when the chosen days include a published day, **To go out ·
  AL1 N** (the net pending list, D99/D100's lines, newest first, D119).
- **Day picker:** **Week** · Mon … Sun (the loaded week); a gold dot on a day with something new to you.
- **Group by: Who / Where.** Who = by person and SITTING (one person's changes with no gap over 30 minutes form one
  sitting; the group head "Hex · 3 changes · NEW · 25/9 15:20–15:38"); Where = by the day's own sections (Flying waves,
  Duties, Common Programme, Sims, Ground, Notes, Absences, The day), each group newest first. Groups fold; a group with
  something new to you opens, the rest are folded.
- **A line:** what (the man or the place, bold), then what happened ("put on RU 1 back seat", "07:00 → 07:30", "moved from
  MET + NOTAM BRIEF to SODB"), then who · when ("Hex · 25/9 15:20"); a gold dot and NEW on a line new to you (in All
  changes too).
- **A tap** → `jumpToChange` (kept — stays on the page you are on, D107), the window stays open (D167); on a phone the
  panel shrinks to a slim bar ("Changes · 4 new — tap to open") until tapped. A line with nowhere to go is not a button.
- **Foot:** "✓ Mark all as seen" on the New to you tab (greyed when nothing is new); a member's foot also reads "Read only
  — every change and who made it, for everyone to see."
- **Empty states:** "Nothing new to you on Tuesday." · "No changes on Tuesday yet." · "Nothing is waiting to go out."
- **It closes** on ✕, a page change, a week change and sign-out (the ALL AVAIL window's rules); never on an outside tap.

### 2.5 The doors

- **The day heading's chip** (everywhere a day heading is drawn — the edit week, the board's sign strip, View-only
  Sched, desktop and phone), ONE chip, for admin and member (never a guest):
  - a published day with changes waiting → **"N pending"** (the count as today); a gold dot on it when something is new to
    you; opens the window on that day, on **To go out**;
  - otherwise, something new to you on the day → **"N new"** (gold); opens on **New to you**;
  - otherwise, changes on the day → **"N changes"** (quiet); opens on **All changes**;
  - otherwise no chip. On View-only Sched a published day shows its chip only on the working copy (as today — the issued
    face never reads pending); a day not yet published shows it on the live draft.
- **The top bar (admins only, D171):** the clock ICON, no word, on desktop and phone, where "Edit history" is today (with
  Undo / Redo on Edit Schedule), with a gold number = what is new to you across the loaded week; opens the window on the
  Week, on New to you. Members get none.
- **History mode (D116) = the window open.** Opening the window turns History mode on (the bubbles on changed details —
  hover on desktop, tap on a phone — on the board AND the edit week); closing it turns it off. The board's own History
  button (`#sbHist`) opens and closes the window; the board's "☰ Edit history · N changes" line goes (the window is the list).
- **The ⓘ day panel** stops showing the raw touched-keys count for a day not yet published; it shows the day's changes
  and what is new to you, in the chip's words.
- **What goes:** the pending popup (`pendlist.ts`'s popup — its line wording is REUSED by the To go out tab), the Edit
  history modal (`HistoryModal.tsx`), "Edit history" as a word on the top bar, and the raw count on an unpublished day.

### 2.6 The OG tag (D172)

On a day not yet published, a puck whose place has a change NEW TO YOU wears the hollow dotted white "OG" tag at its
top right (the corner the "AL1" tag uses on a published day) — on the edit week, the board and View-only Sched, desktop
and phone. Only pucks (as D172 says — times, areas and remarks keep no mark on a day not yet published, the 25 Aug 26
rule). Marking seen takes the tags away. Worked out through one engine hook (`HOOKS.newToMe`), so the engine stays free of
the state layer; one lookup per puck against the day's precomputed set.

## 3. The roll-call (every place the thing is drawn — to be completed with the walk)

| Surface | The chip | The window | The OG tag | History bubbles |
|---|---|---|---|---|
| Edit week, desktop | yes | yes (chip, top-bar icon) | yes | yes (new, D116) |
| Edit week, phone | yes | yes (bottom panel → bar) | yes | yes, tap |
| Scheduler board, desktop / phone | yes (sign strip) | yes (chip, `#sbHist`) | yes | yes (as today) |
| View-only Sched, admin | yes (working copy / live draft) | yes (chip) | yes | no — must not, it is not an edit surface |
| View-only Sched, member | yes (same) | yes, read only | yes | no |
| View-only Sched, guest | no — must not (D215: no buttons) | no | no — has no "you" | no |
| ⓘ day panel | the words | — | — | — |
| Version preview (👁) | no — must not, a preview reads a document | no | no | no |
| Top bar, admin / member | icon + week count / none | — | — | — |
| Print, CSV | no — must not (a mark is on-screen only) | — | no | — |

## 4. The door check

| Action | Its door, every state |
|---|---|
| Open the window on a day | the day's chip (published / not published; edit week, board, View-only; desktop, phone) |
| Open it on the week | the admin's top-bar icon; the day picker's Week chip inside it |
| Switch tab / day / grouping | the tabs, the day chips, Who / Where |
| Go to a change | tap its line (every section's kind; an input's Unavailable row; a still line has none) |
| Mark seen | "✓ Mark all as seen" (admin and member) |
| Close | ✕; a page / week change; sign-out |
| History mode on / off | opening / closing the window; the board's History button |
| Clear the history | Admin → the edit-history sweep (admin only) |

## 5. Tests, red first

- **Engine:** the log keeps `date` across a week switch (the Monday-of-week-A defect, red on today's code); `seq` rises
  across a reload; the log survives a sign-out and a reload (D336 (b)); a rolled-back command leaves no line; the cap.
- **D263:** one test per door — the Inputs page edit, the edit window, a reassign by drag, a medical's cut, the Leave
  War's approve / Ack / refuse / back-to-bid / move / delete — each asserts ONE line with who, when and the words; an
  approval does not leave two lines.
- **New to you:** a line by someone else is new; your own never; Mark all as seen on a day leaves the other days new;
  it survives a reload and a sign-out; members mark their own only (the command gate refuses another's entry).
- **The window:** tabs, day picker, Who/Where, sittings (the 30-minute gap), newest first (D119), the To go out tab's
  lines match today's pending list word for word, the tap jumps and the window stays, the phone bar, empty states.
- **The doors:** the chip's four states on every surface in the roll-call; the icon's week count; members get no icon;
  a guest gets no chip; History mode follows the window on both surfaces.
- **The OG tag:** on a new-to-you puck of an unpublished day only; gone after Mark all as seen; never on a published day
  (whose hollow ALn tag is unchanged); painted (a computed style, not a class — anti-pattern 21).
- **Browser tests** (both widths): the window floats above the board and the edit week (`elementFromPoint` at its centre,
  §6 of the order), moves, resizes on desktop, the phone panel and bar, no sideways page scroll.

## 6. The ripple (feature-impact) and risks

- **Performance:** the chip and the OG tag are per viewer — computed from one per-render set per day; the week's string
  diff rewrites only the blocks whose tags change. The durable log is saved on a batch, never per keystroke.
- **Storage size:** 2,000 rows in the browser's store beside the weeks — measured, and the cap said in `data-schema.md`.
- **Two people on one browser:** the history is shared (it is the squadron's record); what is NEW is per person.
- **Until the database:** another device never sees these lines (one browser per store) — said in code comments and
  HANDOFF, never on screen (the production-copy rule).
- **Tests that pin today's lists** (the pending popup, the history modal, `#histBtn`) are rewritten to the window, never
  loosened: `amendbatch-app`, `histlist`, `histbubble`, `audit-a-hist`, `editlog-writers`, `latemark`, `view-reset`,
  `geometry.spec` (bubble, modal, jump).
- **Documents** in the same change: `ui-contracts.md` (§The pending list → the changes window; §History on the board;
  §Amendment marks — the OG tag), `engine-rules.md` (§The edit log), `data-schema.md` (the log is durable; `changeseen`),
  `data-model.md` §11 (`EditLog`, the seen record), `feature-impact.md`, `file-map.md`, `perms.ts`.

## 7. Order of the build

1. The durable log (fields, save/load, no clear at sign-out, cap, rollback, week-safe dates, undo/redo days) — red first.
2. The absence lines (D263) — the subscriber, one test per door.
3. The seen record and "new to you".
4. The shared window chrome, then the window (tabs, picker, grouping, lines, tap, phone bar).
5. The doors (the chip, the icon, History mode on both surfaces), retiring the popup and the modal.
6. The OG tag.
7. Documents, gates, the walk (both widths, the roll-call), the two final code reads, fixes, re-walk, the evidence sheet,
   the look card.

## 8. For his look card (my readings — stated so he can correct them)

1. The history now outlives a sign-out and a reload (D336 (b), built on yes) — one squadron record, shared by everyone
   on the browser; what is new is per person.
2. The day chip reads "N pending" on a published day with changes waiting, "N new" when something is new to you, "N
   changes" otherwise — one chip, never two.
3. History mode (the bubbles) is on while the window is open, on the board and Edit Schedule alike.
4. A Leave War change with no place on the schedule (a refused bid) is a line you cannot tap.
5. An Undo shows as its own line on the days it changed.

## 9. After round 1 (28 Sep 26) — the plan as it now stands

Fable and Astra's round-1 findings and what each changed are in `docs/superpowers/specs/2026-09-28-draft-pending-plan-review-log.md`.
Where this section and §2 differ, THIS section wins:
- **Input lines have ONE writer** — the command-stream subscriber (add, edit, delete, split, trim, reassign, filing); a
  door's reason rides in with `elogReason`; the doors' own input sentences go (Astra DP-03).
- **A line keeps the span after (`date`–`end`) AND before (`wdate`–`wend`)** and shows on both (Astra DP-05).
- **More writers:** publish / withdraw / sign / clear a sign-off / discard (inside their commands); Quals changes
  (`people/<pid>`, section "Quals", dated the day made); hand-given OIL on the ledger (`lw.ledger`); Undo and Redo at the
  global undo's success, on every day the step touched (Fable F3, F5; Astra DP-04, DP-06, DP-07).
- **A move reads as one line** — two neighbouring lines of one person, one taking a man off, the other putting him on,
  within a second, pair into "moved from A to B" (Fable F2).
- **The seen record:** a new account keeps `seenFrom`; with no seen record, lines before it are not new (Fable F6).
- **Sections:** a closed list and one `sectionOf` (Astra DP-12). **OG:** per place, in `alAttr` (Astra DP-11).
- **Jumps:** `data-inprow` on every Unavailable row; accepted input → its ground row, then its Unavailable row (Astra
  DP-08). **History mode on the edit week:** `wireHistBubble` on `EditWeek` (Astra DP-09). **Windows:** in front 411,
  behind 410, raised on any press (Astra DP-10). **Window state** in the view-reset registries, closed on a page change;
  the jump no longer closes it (Fable F7). **Guest:** no chip (Fable F9).
- **Two tabs:** declined here and filed with the database readiness batch — the whole app shares the limit (Fable F10,
  Astra DP-01).
