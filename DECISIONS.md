# DECISIONS — every ruling the owner has made, and where each one lives

**Why this file exists** (owner, 21 Sep 26): rulings stated mid-task were absorbed into the work and never
written down — the work absorbing a ruling is not the record keeping it (the story: `.claude/rules/record-decisions.md`).

**How the rulings are kept — by RELEVANCE, not all at once (D136, D137, 24 Sep 26).** Every ruling is ONE
row in ONE area file under `.claude/rules/decisions/`. The general rulings (How we work) load in EVERY session;
each other area's file loads BY ITSELF the moment a session reads a file in that area (the paths at the top of
the file), so work that strays into a second area picks up that area's rulings too, and a session never
carries rulings for areas it does not touch. **This file is the front door:** the map below says which file
carries which D-number, so a pointer like "DECISIONS.md D38" still lands. Nothing is ever deleted, and the
list is never shrunk by moving a live ruling out (D136): the only rows that leave an area are rulings
REPLACED by a later one and one-off permissions once SPENT — they go to `DECISIONS-ARCHIVE.md`, never loaded,
and SEARCHED before telling him anything is undecided.

**Recording a ruling — the moment he says it, BEFORE the work it implies** (full rule and the misses that made
it: `.claude/rules/record-decisions.md`; closing reports carry a `Rulings:` line):
1. **Add ONE row at the top of its area's table** — the date, his words where short enough, what it means, and
   the file that now carries it (then make that file carry it: this list is an index, never the only home). A
   ruling that spans areas goes in the one it mostly governs; the other area's "Also read" line names it.
2. **If it wholly REPLACES an earlier ruling**, start that earlier row's ruling cell with
   `**REPLACED BY D<n> (<date>).**`; **a one-off permission, once used**, with `**SPENT <date> — <what used it>.**`
   A ruling changed only IN PART stays live and says so in its own words. **Either way, fix what the old ruling left
   behind in the same change — the documents, the app (file the build), the lists (D201; `record-decisions.md`).**
3. **Run `node raptor-port/scripts/backlog-archive.mjs --rulings`** — it moves every marked row to the archive
   and rewrites the map from the files. The gate (`npm run docsize`, and the check at the end of every turn)
   fails until the map matches the files, while a marked row is still in an area file, and if a row is
   written in THIS file instead of its area's.

**Parallel branches (owner, D78):** when several chats run at once, each reaches `main` only on his
"merge live", ONE AT A TIME; whichever merges later merges `main` in first, and if a D-number
clashes, the later branch renumbers ITS OWN rows — never the ones already on `main`. So numbers
may SKIP (a parallel branch can hold a range); a number is never reused and never lost. The next
number is one above the highest of `main`'s own run below D150 (the map shows it), skipping any range a
parallel chat holds (D90–D119 is the amendment chat's; D150–D156 are used). **Since 24 Sep 26 main's run below D150
is full (D135–D149), so it continues from D157**, skipping D170+ (the demo chat's range, D154). **D200–D209 is the late-published chat's follow-on range** (`claude/rulings-supersede-sweep`, 26 Sep 26). **D210–D229 is the accounts chat's** (`claude/accounts`, 26 Sep 26; its follow-on `claude/accounts-new-person` also holds **D280–D309**, taken 26–27 Sep 26 above the parallel chats' D260–D279), and **D230–D239 is offered to a parallel Tracker-palette chat** started beside it (**D240–D249** to a `[BG-CWD-GUARD]` chat, **D250–D259** to a `[BACKLOG-TIDY]` chat, if he starts them). **D190–D199 is the
Tracker smoke chat's range** (`claude/trk-smoke-add-race-bug-007eed`, D190, 25 Sep 26); **D176–D189 is the D175 chat's**
(`claude/request-one-row`, his instruction of 25 Sep 26). **D180–D189 pass to the overnight chat** (`claude/leave-late-published`, 25 Sep 26 — the D175 chat merged having used D176–D179).

**What counts.** A ruling ("do it this way from now on"), a product decision ("green only where it
counted"), a correction to how I work, a preference, a "leave it", a supersession of an earlier
ruling, or an explicit no. **Not** ordinary task instructions ("run the tests", "check that file")
— those die with the task and belong nowhere.

---

## The map — which file carries which ruling

| Area | File | Loads by itself | Rulings, newest first |
|---|---|---|---|
| How we work | `.claude/rules/decisions/how-we-work.md` | in EVERY session | D302, D301, D300, D299, D298, D297, D296, D295, D294, D293, D292, D291, D290, D289, D288, D287, D286, D285, D284, D283, D282, D281, D280, D229, D228, D227, D226, D225, D224, D223, D222, D221, D220, D219, D217, D216, D215, D214, D213, D211, D210, D204, D203, D201, D200, D182, D180, D173, D166, D165, D106, D90, D162, D148, D147, D145, D144, D143, D141, D140, D138, D137, D136, D135, D151, D89, D87, D86, D85, D84, D78, D73, D72, D70, D69, D68, D67, D63, D62, D60, D59, D58, D57, D56, D54, D53, D30, D29, D23, D22, D17, D16, D14, D13, D12, D11, D10, D9, D8, D7, D6, D5, D4 |
| Tracker | `.claude/rules/decisions/tracker.md` | when a Tracker file is read (its code, docs, scripts, evidence) | D191, D190, D158, D157, D134, D132, D131, D130, D129, D128, D127, D126, D124, D123, D122, D121, D120, D64 |
| Leave War | `.claude/rules/decisions/leave-war.md` | when a Leave War file is read (its code, docs, e2e, evidence) | D160, D159 |
| Scheduler & amendments | `.claude/rules/decisions/scheduler.md` | when a scheduler, board, engine, amendment or storage file is read | D218, D212, D189, D188, D187, D186, D185, D184, D183, D179, D178, D177, D176, D175, D174, D172, D171, D170, D169, D168, D167, D119, D118, D117, D116, D114, D113, D111, D110, D109, D108, D107, D105, D103, D102, D101, D100, D99, D98, D97, D96, D95, D94, D93, D92, D91, D164, D161, D149, D77, D66, D65, D51, D50, D47, D45, D44, D41, D40, D39, D38, D37, D36, D33, D27 |
| OIL | `.claude/rules/decisions/oil.md` | when an OIL, Leave War, placeholder-puck or publishing file is read | D163, D142, D82, D81, D80, D79, D52, D49, D48, D46, D43, D42, D35, D32, D31, D28, D26, D25, D24, D21, D20, D19, D18, D15, D3, D2, D1 |
| Archive | `DECISIONS-ARCHIVE.md` | never — SEARCH it before telling him anything is undecided | D156, D133, D125, D155, D154, D153, D152, D150, D88, D83, D71, D61, D55, D34, D139, D146, D112, D115, D181, D202, D104, D230 |

## Carried, still open for him

| # | The question | Why it is his |
|---|---|---|
| Q1 | On a published day, an OIL decision not yet published changes the green bar on the scheduler's own screen while the Leave War still pays the issued figure — and nothing on the puck says "pending". A typed edit gets a dotted amendment mark; an OIL decision gets only the day's aggregate "1 change". | Product direction: whether a pending money change should look different from one in force. Raised by Fable's S4; to be shown to him in the app first. |

---

## Before this file existed

Rulings made before 21 Sep 26 are not ROWS in the rulings files. Since 24 Sep 26 (D140) the settled decisions of
that time sit in their area's file, §Settled before this list (moved whole from `raptor-port/CLAUDE.md` §Stable
decisions, which keeps only the cross-cutting ones), and others are in the per-feature behaviour registers under
`docs/superpowers/specs/` and the memory index. **Do not back-fill them wholesale as rows**; add an old ruling to its area's file only when
it is re-confirmed, superseded or found to be stale, so the list stays a record of live decisions
rather than a second copy of the archive.
