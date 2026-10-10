# DECISIONS — every ruling the owner has made, and where each one lives

**Why this file exists** (owner, 21 Sep 26): rulings stated mid-task were absorbed into the work and never
written down — the work absorbing a ruling is not the record keeping it (the story: `.claude/rules/record-decisions.md`).

**How the rulings are kept — by RELEVANCE, not all at once (D136, D137, 24 Sep 26), and as ONE LINE each (D390,
28 Sep 26).** Every ruling is ONE short line — its number, its date, the rule as it stands — in ONE area file under
`.claude/rules/decisions/`, and ONE full row (his words, the readings, where it lives), kept whole in the same-named
file under `.claude/decisions-full/`, which is never loaded by itself and is SEARCHED — open a ruling's full row
before acting on its detail or asking him about it (`grep -h '^| D38 |' .claude/decisions-full/*.md`). How we work
loads in EVERY session; each other area's file loads BY ITSELF the moment a session reads a file in that area (the
paths at the top of the file). **This file is the front door:** the map below says which file carries which D-number,
so a pointer like "DECISIONS.md D38" still lands. Nothing is ever deleted, and no live ruling ever leaves the list
(D136): the only rows that leave are rulings REPLACED by a later one and one-off permissions once SPENT — they go to
`DECISIONS-ARCHIVE.md`, never loaded, and SEARCHED before telling him anything is undecided.

**Recording a ruling — the moment he says it, BEFORE the work it implies** (full rule and the misses that made
it: `.claude/rules/record-decisions.md`; closing reports carry a `Rulings:` line):
1. **Add ONE full row at the top of its area's table** — the date, his words where short enough, what it means, and
   the file that now carries it (then make that file carry it, with the D-number beside the ruling there: this list is
   an index, never the only home; the gate fails a new row whose Markdown home never mentions it — a row renumbered
   under D78 counts as new). **The first bold sentence of "what it means" becomes the line every chat loads: it must
   state the rule on its own, in at most 350 characters, with no "|".** A ruling that spans areas goes in the one it
   mostly governs; the other area's "Also read" line names it.
2. **If it wholly REPLACES an earlier ruling**, start that earlier ruling's FULL row's ruling cell (in
   `.claude/decisions-full/`) with `**REPLACED BY D<n> (<date>).**`; **a one-off permission, once used**, with
   `**SPENT <date> — <what used it>.**` A ruling changed only IN PART stays live and says so in its own words in its
   full row (`**— NARROWED <date> BY D<n>: …**`), and its short line is rewritten to state the rule as it now stands.
   **Either way, fix what the old ruling left behind in the same change — the documents, the app (file the build), the
   lists (D201; `record-decisions.md`).**
3. **Run `node raptor-port/scripts/backlog-archive.mjs --rulings`** — it moves each new full row to the full-text file
   and leaves its short line, retires every marked row to the archive, names each change on a short line's " — changed
   by" tail, and rewrites the map. The gate (`npm run docsize`, and the check at the end of every turn) fails until it
   has run — and if a row is written in THIS file instead of its area's. A branch merging `main` across the slim-down
   runs `git merge --no-commit --no-ff origin/main`, then this with `--merge` (D390; the plan
   `raptor-port/docs/superpowers/plans/2026-09-28-rulings-slim-down-plan.md` §2.4).

**Parallel branches (owner, D78):** when several chats run at once, each reaches `main` only on his
"merge live", ONE AT A TIME; whichever merges later merges `main` in first, and if a D-number
clashes, the later branch renumbers ITS OWN rows — never the ones already on `main`. So numbers
may SKIP (a parallel branch can hold a range); a number is never reused and never lost. The next
number is one above the highest of `main`'s own run below D150 (the map shows it), skipping any range a
parallel chat holds (D90–D119 is the amendment chat's; D150–D156 are used). **Since 24 Sep 26 main's run below D150
is full (D135–D149), so it continues from D157**, skipping D170+ (the demo chat's range, D154). **D200–D209 is the late-published chat's follow-on range** (`claude/rulings-supersede-sweep`, 26 Sep 26). **D210–D229 is the accounts chat's** (`claude/accounts`, 26 Sep 26), and **D230–D239 is offered to a parallel Tracker-palette chat** started beside it (**D240–D249** to a `[BG-CWD-GUARD]` chat, **D250–D259** to a `[BACKLOG-TIDY]` chat, if he starts them). **D347–D359 is the change-recording chat's** (`claude/change-recording-retest`, 28 Sep 26), and **D360–D369, D370–D379, D380–D389** are offered to three parallel chats started beside it the same day (a small-fixes batch, the Tracker leftovers, a docs-only tidy — if he starts them). **D270–D279 is the five-flags batch chat's** (`claude/five-flags-batch-build-ef7d85`, 26 Sep 26 — [PUCK-FLAG-GLOW], [LW-RESET-ORDER], [CROWD-SWAP-SAYS-BUSY], [VIEW-ARROW-OVER-LIST], [BG-GUARD-FALSE]). **D390–D399 is the rulings slim-down chat's** (`claude/docs-rulings-slim-down-e83c74`, 28 Sep 26 — [RULINGS-SLIM], D390). **D400 was the handoff-review chat's** (`claude/handoff-review-next-priority-165f99`, 29 Sep 26); **D401–D409 is the OIL award chat's** (`claude/award-earned-vs-granted-2ed66d`, 29 Sep 26 — [OIL-AWARD-IS-A-GRANT] with D400); **D410–D429 is the IT flow guide chat's** (`claude/it-flow-guide-flowchart-da7ca1`, 29 Sep 26 — [IT-FLOW-GUIDE], D410). **D190–D199 is the
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
| How we work | `.claude/rules/decisions/how-we-work.md` | in EVERY session | D726, D672, D667, D625, D623, D615, D614, D611, D610, D609, D608, D607, D602, D601, D596, D595, D590, D588, D587, D568, D541, D499, D495, D493, D491, D490, D489, D487, D486, D485, D473, D466, D465, D453, D368, D353, D351, D350, D349, D348, D347, D390, D343, D302, D228, D203, D201, D106, D90, D162, D148, D147, D144, D143, D141, D140, D138, D137, D136, D135, D151, D89, D87, D86, D84, D78, D73, D72, D70, D69, D68, D67, D63, D62, D60, D59, D58, D57, D56, D54, D53, D29, D23, D22, D17, D16, D14, D13, D12, D11, D10, D9, D8, D7, D6, D5, D4 |
| Tracker | `.claude/rules/decisions/tracker.md` | when a Tracker file is read (its code, docs, scripts, evidence) | D566, D564, D560, D474, D464, D462, D463, D377, D376, D375, D374, D373, D372, D371, D370, D191, D158, D157, D134, D132, D131, D130, D129, D128, D127, D126, D124, D123, D122, D121, D120, D64 |
| People & accounts | `.claude/rules/decisions/people-accounts.md` | when an accounts, sign-in, Admin → Users, Quals, one-door or posting file is read (D390) | D329, D328, D327, D326, D325, D323, D322, D321, D320, D310, D309, D308, D307, D306, D305, D304, D303, D301, D300, D299, D298, D297, D296, D295, D294, D293, D292, D291, D290, D289, D288, D287, D286, D285, D284, D283, D282, D281, D280, D229, D227, D226, D225, D224, D223, D222, D221, D220, D219, D217, D216, D215, D214, D213, D211, D210, D204, D200, D218, D166, D165, D149 |
| Leave War | `.claude/rules/decisions/leave-war.md` | when a Leave War file is read (its code, docs, e2e, evidence) | D679, D678, D677, D676, D674, D673, D670, D669, D461, D460, D418, D352, D365, D335, D334, D333, D332, D331, D330, D267, D266, D265, D264, D262, D160, D159 |
| Scheduler & amendments | `.claude/rules/decisions/scheduler.md` | when a scheduler, board, engine, amendment or storage file is read | D738, D737, D736, D735, D734, D733, D732, D731, D730, D729, D728, D727, D725, D724, D723, D722, D721, D720, D719, D718, D717, D716, D715, D714, D713, D712, D711, D710, D709, D707, D706, D705, D704, D703, D702, D701, D700, D699, D698, D697, D696, D695, D694, D693, D692, D691, D690, D689, D688, D687, D686, D685, D684, D683, D682, D681, D675, D671, D668, D665, D664, D663, D662, D661, D660, D659, D658, D657, D656, D655, D654, D653, D652, D651, D650, D649, D648, D647, D646, D645, D644, D643, D642, D641, D640, D639, D638, D637, D636, D635, D634, D633, D632, D631, D630, D629, D628, D627, D626, D624, D622, D621, D620, D619, D618, D617, D605, D603, D600, D599, D598, D597, D594, D593, D585, D584, D583, D582, D581, D580, D579, D578, D577, D576, D575, D574, D573, D572, D571, D570, D569, D563, D562, D561, D558, D557, D555, D554, D553, D552, D551, D550, D548, D547, D546, D545, D544, D537, D535, D532, D531, D530, D529, D527, D526, D525, D524, D523, D522, D521, D520, D519, D518, D517, D516, D514, D513, D512, D511, D510, D509, D507, D506, D505, D504, D503, D502, D501, D500, D498, D497, D488, D482, D481, D479, D478, D477, D475, D472, D471, D469, D468, D454, D452, D451, D450, D356, D355, D367, D364, D363, D362, D361, D360, D346, D345, D344, D340, D339, D338, D337, D279, D278, D277, D276, D275, D274, D272, D271, D270, D263, D212, D189, D188, D187, D186, D185, D184, D183, D179, D178, D177, D176, D175, D174, D172, D171, D170, D169, D168, D167, D119, D118, D117, D116, D114, D113, D111, D110, D109, D108, D107, D105, D103, D102, D101, D100, D99, D98, D97, D96, D95, D94, D93, D92, D91, D164, D161, D77, D66, D65, D51, D50, D47, D45, D44, D41, D40, D39, D38, D37, D36, D33, D27 |
| OIL | `.claude/rules/decisions/oil.md` | when an OIL, Leave War, placeholder-puck or publishing file is read | D606, D592, D591, D470, D402, D401, D400, D261, D260, D163, D142, D82, D81, D80, D79, D52, D49, D48, D46, D43, D42, D35, D32, D31, D28, D26, D25, D24, D21, D20, D19, D18, D15, D3, D2, D1 |
| The IT flow guide | `.claude/rules/decisions/it-flow-guide.md` | when a file of the IT flow guide is read (its deck folder, its scripts, its plans) | D403, D417, D416, D415, D414, D413, D412, D411, D410 |
| Archive | `DECISIONS-ARCHIVE.md` | never — SEARCH it before telling him anything is undecided | D156, D133, D125, D155, D154, D153, D152, D150, D88, D83, D71, D61, D55, D34, D139, D146, D112, D115, D181, D202, D104, D230, D273, D336, D342, D341, D366, D182, D354, D180, D324, D467, D542, D543, D567, D540, D539, D538, D536, D534, D533, D528, D508, D496, D494, D492, D484, D483, D480, D476, D391, D173, D145, D85, D30, D559, D556, D549, D515, D565, D190, D586, D589, D604, D613, D612, D616, D666, D680, D708 |

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
