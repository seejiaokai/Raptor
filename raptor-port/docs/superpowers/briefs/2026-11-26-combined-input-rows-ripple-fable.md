# The combined-row job — what else it reaches across the app (a fresh Fable, 26 Nov 26)

**Read:** the brief; the plan whole; Fable's and Astra's reads whole, the Opus read as the plan condenses it; the full
rows of D2770–D2780; `feature-impact.md` (its head, §1's surface names, §3 whole, "One input filed for several
people" whole); the Inputs page and the Leave War page's lines on shared and held entries; and the code named at each
item. **Nothing was run on the app** — every "today" below is from the code lines named, or from the plan's survey
where I say so. No project file was changed.

**How to read it:** ranked by consequence (OIL, the published record, who counts as away, saved data first). Each
item says whether it is new or "already named by …". **21 items; 10 need his decision** (3, 4, 6, 7, 8, 9, 10, 11,
12, 15); the rest are the builder's, several with a line he should be told.

---

## A. OIL, the published record, who counts as away

### 1. A man added by a drop leaves every ALL AVAIL crowd on every day of the input — past published days included
- **Surface / reader:** OIL earned and the ALL AVAIL crowd (`engine/avail.ts`, `engine/oilev.ts` — both read one line
  a man, `inputLines`), the Leave War's OIL pass (`leavewar/sync.ts runOilPass`).
- **Today:** only the input's own window can add a man to an absence; a drop under Unavailable can only replace.
- **The change:** a drop on Thursday's row of a Mon–Fri (or last-Sat-to-Fri) overseas duty adds the man for every
  day (D2771). On each of those days he stops being "free", so he drops out of any ALL AVAIL event's crowd there.
- **Consequence if missed:** OIL he earned from an ALL AVAIL event on a past weekend or holiday goes pending for
  removal at that day's next amendment, by a gesture made on another day that asked nothing. Nobody is looking at
  that past day. The same reach works the other way for a man taken off (D2780): he joins crowds he was out of.
- **Whose:** the builder's — it follows from D2771 and the rule that OIL follows the latest published version. He
  should be told in one line, and the walk needs the case (an ALL AVAIL event on a published weekend inside the
  input's days).
- **Named?** Partly — Astra 8 and 10, Fable 2.2 name "past published days go pending" and "OIL only through
  publication"; none names the crowd.

### 2. "No question asked, no note shown" (D2779) meets three things the app asks or says today
- **Surface:** the drop itself, on every input row.
- **Today** (`ui/inputedit.tsx reassignInput`): a drop that leaves a weekend / holiday input without an OIL answer
  puts the OIL question first and makes the change with the answer (`oilFirst`, his D783, D755 (1)); leave filed
  over recorded work is saved and the filer told in the same breath (`leavewar/inputgate.ts vet`, his 20 Sep 26
  ruling); a refused drop says why (two leaves overlapping, leave over a medical, "already on this input").
- **The change:** D2779's words, read literally, switch all three off.
- **Consequence if missed:** either a weekend duty changes hands with its OIL unanswered (wrong OIL), or the builder
  keeps the question and he is surprised by a window after ruling "nothing asked".
- **Whose:** the builder's reading, told to him and named as a clash (D90): "no question" means no "are you sure";
  the OIL question (D783), the over-work line and every refusal's reason stay. The passing note "X is now
  unavailable instead of Y" goes (D851, D854).
- **Named?** Astra 10 names OIL-before-the-change; the clash with D2779, ruled after, is not named.

### 3. A replace on a one-man leave row hands over more than the days
- **Surface:** a leave row under Unavailable; the Leave War; Balances; the Inputs page's document column.
- **Today** (`inputown.ts swapPerson`, `commitInputEdit`): the record stays and only the person changes. So the
  newcomer inherits the first man's remark, his "till" tick, his documents (`docIds` — a paper filed for CCL, PL,
  CL), the marks of who placed the bid and when (`lwBy`, `lwAt`), the dotted "moved" marks (`lwMoved`) and the
  approved-on-the-war tag (`lw`). Balances then charge the newcomer and give the first man his days back (they read
  what is there).
- **The change:** D2779 makes this an everyday gesture on leave rows, silent.
- **Consequence if missed:** Hex holds leave that reads as approved from a bid he never made, with Ranger's remark
  and Ranger's paper attached; Ranger's approved leave is gone with one bell line.
- **Whose:** **his.** Recommend: a replace on a leave row carries the kind and the days only — remark, till tick,
  papers and the bid marks do not pass — or is refused where the leave carries a paper. Show him one worked case.
- **Named?** Partly — Opus A (the hand-over itself), Fable §3 (for an ATT C's document only).

### 4. A leave approved on the Leave War still refuses the add — and D2772 says every row always shows an add place
- **Surface:** Unavailable rows of leave; the Leave War's drag across several men.
- **Today:** `engine/inputs.ts shapeProblem` refuses a second person on any leave tagged `lw` ("A leave approved on
  the Leave War is one person's…"); the war's own doors find a leave only where the man is its one person
  (`sync.ts warLeaveRow`). An admin who drags across six men on the war ("Approve what I enter") files six separate
  leaves (`doorFile`); the same stand-down filed on the Inputs page for six is one group leave.
- **The change:** D2778's reading keeps the refusal; D2772 gives every row an empty add place. So most leave rows
  would show an add place that always says no, and the same stand-down is one row or six rows — taking drops or
  not — by which door filed it.
- **Consequence if missed:** the trick he set out to remove, moved: two leave rows that look alike behave
  differently.
- **Whose:** **his.** Two choices to put: (a) a war-approved leave row draws no add place and its replace follows
  item 3; (b) the refusal's words, drawn. And tell him the war's own drag files one each, so a stand-down is a group
  only when filed on the Inputs page.
- **Named?** Fable 2.3, Astra 2 — but his rulings since leave it open, and the collision with "always an extra
  empty place" is new.

### 5. A drop that puts a man on leave skips what the Leave War's own door checks, and can eat his bid
- **Surface:** the Leave War's bids, Balances, manning colours, No Leave days.
- **Today:** the below-zero question ("Tap the same leave again to go ahead"), the manning line and the No Leave
  day refusal live only in the war's bid windows (`leavewar/ui/belowzero.ts`, `BidPicker`, `SelectSheet`) — the
  Inputs door has none. The Inputs door does one more thing: leave landing on the same time as a man's undecided
  bid removes the clashing part of the bid, and a notice stands on the war until "OK, seen"
  (`inputgate.ts`, rule 3; the register's R1).
- **The change:** a drop becomes a third, quieter way to file leave for a man.
- **Consequence if missed:** a man is taken below zero, onto a No Leave day or a red manning day with nothing said;
  his waiting bid for those days disappears and he reads "bid replaced" on his bell without having been asked.
- **Whose:** the builder's — the drop runs the Inputs door, so it is the Inputs page's behaviour, not a new one.
  He should be told once, because D2779 was ruled without it; the bid case goes in the walk.
- **Named?** Fable 2.3 names "skips the bid, the manning colours and approval, takes days off his balance". The
  replaced bid, below zero and No Leave are new.

### 6. Three doors still give one man his own leave by themselves — against D2778's "never splits a man off by itself"
- **Surface:** a group leave, on the Leave War and the schedule.
- **Today:** a medical filed over one man's days of a group leave cuts his part alone, giving him a leave of his own
  first (`inputgate.ts sickCutsLeave` → `ownInputOf`); a posting out, archive or delete trims his part the same way
  (`state/person-delete.ts`, the `split` list). The war's remark box does too (`ui/inputedit.tsx setLeaveRemarks`).
- **The change:** D2778 ends the remark split. The medical and the posting cannot end: the other five men's leave
  must not be cut for one man's sick day.
- **Consequence if missed:** either the builder removes them (a medical over one man then cuts or blocks the whole
  group's leave), or keeps them and the ruling's words are untrue.
- **Whose:** **his, one line to confirm:** "never by itself" means never by a change made on his box; a medical over
  his days, and his posting out, still give him his own leave. His own row then stands under the group's.
- **Named?** Opus D names the three doors; D2778, ruled after, now reads against two of them.

### 7. A member in a group leave loses the only things he can change on the war today
- **Surface:** the Leave War for a member; `state/perms.ts`.
- **Today:** a member who is one of several may only take himself out of the input (`perms.ts ownPart`); he cannot
  change it for everyone. On his own box of a group leave he can still type his remark, tick "till" and attach his
  paper — because that save first gives him a leave of his own (`setLeaveRemarks` → `ownPartSave`).
- **The change:** D2778 — his box opens the input's own window, a change is for everyone. For him that window is
  read only (D364), with "take yourself out".
- **Consequence if missed:** a member cannot add his own note or paper to a stand-down; and "taken off and given his
  own leave" is not something a member can do in one step — leave he files himself on the war is a bid waiting for
  approval, so by taking himself out he swaps approved leave for a request.
- **Whose:** **his.** Recommend: for a member the box opens read only and says who can change it; taking a man off
  and giving him his own leave is an admin's job, said on screen.
- **Named?** No. (Astra 6 covers a member withdrawing from a commitment, not leave on the war.)

### 8. Papers on a group leave become the group's
- **Surface:** the leave's Document button on the war (D1150, D1159, D1307), the Inputs list's document column and
  its filter (D1179), the document viewer.
- **Today:** on a leave for several, a paper attached from one man's box is his alone (the split above).
- **The change:** one input, one list of papers, opened by everyone who can open the input.
- **Consequence if missed:** one man's paper (compassionate, child-care, paternity) is readable by the others in the
  group; the Inputs list shows "has a document" for six men on the strength of one.
- **Whose:** **his.** Recommend: a group leave takes no paper — the button says a man who needs a paper is given
  his own leave (in step with D2770).
- **Named?** No.

### 9. "A man's box opens the input's own window" — what it replaces on the war, and what that window does not show
- **Surface:** the Leave War's grid tap, its bid window, the day's list.
- **Today:** a tap on a day held by an Inputs-page entry opens the war's bid window "so more can still be added,
  Grant OIL first", one line an entry saying where it is changed (D1548, D1553, D1565); a day with two entries
  opens the day's list (D1466). The one door from the war to an input's window (`sync.ts openInputWindow`) leaves
  the Leave War for the Inputs page.
- **The change:** D2778 puts the input's window first for a group leave.
- **Consequence if missed:** Grant OIL on such a day loses its way in; the admin is thrown to another page and loses
  the grid; and the input's window shows none of the war's helps — the manning line ("IP 16 → 15"), the below-zero
  question, the No Leave refusal — while he changes six men's dates.
- **Whose:** **his, in the drawing D2778 already asks for.** Recommend: keep the war's window as the first thing a
  tap opens; its line for the group leave becomes the button that opens the input's window over the war, the grid
  still in view. Say whether the manning line is wanted there.
- **Named?** No — the plan names only that it builds on [LW-FULL-EDITING] (D1724).

### 10. A drag across one man's boxes of a group leave
- **Surface:** the Leave War's drag window (`leavewar/ui/SelectSheet.tsx`) and drag-to-move.
- **Today:** words typed in the drag window replace the remark of every leave dragged over ("Replace them all",
  D1341) — on a group leave, for that man alone, by the split. Move, Delete, Refuse and un-approve act only on
  war-approved leave of one man (`warLeaveRow`); an Inputs-page leave cannot be moved on the war at all.
- **The change:** D2778's reading "a box moved moves everyone" needs a Move for Inputs-page leave that does not
  exist yet; and the drag window's words would now land on all six.
- **Consequence if missed:** an admin who drags over Ranger's four days and types a remark, or presses Delete,
  changes or deletes six men's leave while looking at one row.
- **Whose:** **his.** Recommend: a drag that covers only some men of a group leave leaves it out, with its reason
  and the way to its window; only the window changes the group.
- **Named?** No.

### 11. "Marked shared" — on which entries, in how many places, and matching the mark the app already has
- **Surface:** the war's grid box; the joined bar of a several-day leave, whose code prints once (D1359); a half
  day; the phone's frozen copy of the name column and rows; the day's list; the bid window's line; the Inputs
  calendar's bar.
- **Today:** no mark on the war. The Inputs calendar already marks a shared bar — it leads with its count (D729).
- **The change:** D2778 asks for a mark on a group leave's box, drawn first.
- **Consequence if missed:** the mark is drawn for leave only, so a shared overseas duty, course, Attach or Other on
  the war looks like one man's while its window changes everyone — the same trick, on the war. Or the war gets a
  second look for a thing the Inputs calendar already marks (his "one mark, one look").
- **Whose:** **his.** Put with the drawing: every shared entry the war shows wears it, not leave alone; the same
  mark as the Inputs calendar's count. The grid is the app's tightest drawing budget — the mark must add no box to
  a row (`docs/performance.md`, the row contract).
- **Named?** No.

### 12. One drop on a leave row rings two kinds of bell line
- **Surface:** the bell; `docs/notifications-register.md` B2, B3, B8 (an input's people) and R1, P2, P8 (the Leave
  War's "Your leave" lines).
- **Today:** a man put in or taken out of an input reads "You were added" / "You were taken off". Separately the
  war compares each man's war-approved leave before and after a change (`sync.ts warLeaveNow`) and writes "Your
  leave … deleted / approved". Both fire for a hand-over of a war-approved leave — not checked on screen.
- **The change:** this hand-over becomes common; and the two-step "take him off, give him his own leave" (D2770,
  D2778) tells one man "taken off", then "LL added and approved", for leave that moved by a day.
- **Consequence if missed:** Hex reads "LL approved" for leave he never asked for; Ranger reads two lines for one
  act; Undo must take back both (D1693).
- **Whose:** **his** — the words (Opus drafts, a fresh Fable adjusts, D2441), drawn first. Recommend one line a man
  an act; the register gets its lines in the same job.
- **Named?** Partly — the readers name B2/B3 (D755, D757); none names the war's own lines or the doubling.

### 13. Approvals' "Also since you last looked" never lists a group leave, nor leave that reached a man by a drop
- **Surface:** the Leave War's Approvals page (the register's P9; `sync.ts alsoSince`).
- **Today:** it lists leave filed on the Inputs page by reading the leave's one person (`onlyNamed`) and its filing
  time (`at`). A leave for several has no "one person", so it is skipped today; a man added or swapped in later
  does not change the filing time.
- **The change:** more leave will arrive exactly these two ways.
- **Consequence if missed:** another admin opening Approvals is never told six men went on leave, or that Hex now
  holds Ranger's.
- **Whose:** the builder's (read each man's own line and his own joining time, `people[].at`); tell him it was
  already missing for group leave.
- **Named?** No.

### 14. The published day's count and words for the new gestures
- **Surface:** "n changes waiting", the changes window, the Amendments panel (`engine/publish.ts
  dayPendingItemsIn`, `personUnitSrc`, `frozenInputMatch`; `ui/pendlist.ts`).
- **Today:** a swap on a one-man row is one change, "… Bane → Hunter"; a man split out by the app is folded into
  the input's one change (`pieces`).
- **The change:** a replace on a row of several; a man taken off and re-filed by hand in two steps; both on every
  published day the input covers, including days in a week not loaded.
- **Consequence if missed:** a replace counts as two; a man whose absence on that day did not change shows as
  "taken off" plus "LL added"; a day in last week goes pending with nobody seeing a mark.
- **Whose:** the builder's. Check D736's full row for "replace = one change", and that the fold recognises a
  hand-made take-off-and-refile.
- **Named?** Mostly — Astra 8, Fable 2.2. New: the replace's count, the week not loaded.

---

## B. The schedule's own surfaces

### 15. D2773's refusal points to a Ground Programme row that is often not there
- **Surface:** a Personal Inputs line, Edit Schedule and the Board.
- **Today:** a line stands under Personal Inputs whether its input is accepted onto the programme, still waiting,
  or rejected; only an accepted one has a Ground Programme row.
- **The change:** a drop is refused "telling him to drop the man on that input's row on the Ground Programme".
- **Consequence if missed:** for a waiting or rejected line the words send him to a row that does not exist.
- **Whose:** **his look** — a second wording for a line with no row ("Put it on the programme first"), drafted and
  drawn with the first (D2441, D1625).
- **Named?** Partly — Astra 4 ("rejected rows"); the ruling's wording came after.

### 16. Where a replaced puck stands
- **Surface:** the combined row's pucks.
- **Today:** a Ground Programme row draws its people A to Z (`engine/inputs.ts facesDrawn`); the Unavailable list
  draws them in the order they joined (`facesOf`). A sim seat keeps its place.
- **The change:** "works as a sim row" (D2772).
- **Consequence if missed:** drawn A to Z, the newcomer jumps to another place in the row the moment he lands, and
  the puck under the pointer is now another man — the fault the shared-row walk found on 25 Nov ("nothing on the
  board re-orders itself", D735).
- **Whose:** the builder's, shown in the drawing: the newcomer takes the replaced man's place; an added man goes
  last. It changes the Ground row's A-to-Z order too — name that.
- **Named?** No.

### 17. SANS
- **Surface:** SANS AVAIL cards on the schedule; the SANS calendar's counts.
- **Today:** a shared SANS offer is one input, drawn a card a man, each shown only from his own SANS date
  (`sansFaceShown`). A save runs the SANS overlap check for each person (`normalizeInputDraft`).
- **The change:** D2777 says "one row everywhere" and does not name these cards; a drop can now add a SANS man to
  an absence.
- **Consequence if missed:** the cards are merged though each man's start date differs; or a SANS man is added over
  his own offer to fly and the SANS calendar counts him as both.
- **Whose:** the builder's reading, told to him: SANS AVAIL cards stay a card a man and take no drop; an added man
  passes the same checks a save runs.
- **Named?** Astra (the exception), Fable §4 and 2.8 — listed so the reading is told.

### 18. The first man of an input decides more than his place
- **Surface:** which squadron an input belongs to, its late cut-off, and every reader of "the input's lead".
- **Today:** `engine/inputs.ts inputUnitOf` — the squadron of the first named man on its first day; `leadOf` is
  read by OIL, the Leave War and the publish list.
- **The change:** a replace or a take-off can now change who is first, on rows of several.
- **Consequence if missed:** once two squadrons are live, replacing the first man can move the input to another
  squadron's schedule and cut-off.
- **Whose:** the builder's — one line under the plan's two-squadron refusals; a test where the first man is the one
  replaced.
- **Named?** No (the readers name refusing another squadron's man, not this).

### 19. Keyboard and tap reach
- **Surface:** the combined row's add place and pucks; the time and remark boxes.
- **Today:** a puck is a Tab stop; an Unavailable puck arms on a tap and a tap on a name plants. No key takes a man
  off. The boxes of one man's row are addressed with his name in the address (`iu:<iid>~<person>`), and Tab moves
  box to box by that address (D550–D556).
- **The change:** one row, one address; an add place; taking off by dragging.
- **Consequence if missed:** the add place cannot be reached without a drag; a man cannot be taken off without one;
  Tab skips or lands twice on the row.
- **Whose:** the builder's: the add place arms on a tap and is a Tab stop like every other; taking off has a
  non-drag way (the input's window); the Tab route re-pinned.
- **Named?** Partly — Opus P and Astra 12 for the phone; the keyboard is not named.

### 20. Places that draw or point at the row, beyond Fable's list (2.12)
The builder's roll-call needs a cell for each; none needs his decision.
- The next-week peek (its own copy of the week's rows).
- The crew list's "away" greying and the Board's counter — they change the moment a drop lands.
- The just-added ring's landing place (`ui/boardland.ts`) and a warning's or a change's jump to the row
  (`ui/interactions.ts`, `ui/changesjump.ts`, `ui/highlights.ts`) — all find a man's row by the per-man address.
- The row's history bubble (`ui/histbubble.ts`): lines saved before the build sit under the per-man address. Stored
  data only (D56) — not a finding, but the new row must not throw on them.
- The day opened on the Inputs calendar, where a man is dragged off a note as off a row of pucks.
- The demo data: its one shared input is a Meeting on the Ground Programme (`state/demoseed.ts`). There is no shared
  input under Unavailable to walk — seed one outside the seed week.
- The layout checks and the size ceilings (`e2e/geometry.spec.ts`, `npm run perf`): rows become fewer and taller.
- Words on screen that describe the old behaviour (the Ground Programme's line about Reject, D947; help).
- The documents that state "a row a man": `ui-contracts.md`, `feature-impact.md`, `engine-rules.md`, `word-list.md`.

### 21. Checked, and not reached — the "must not, because" cells
- **Print and export:** the CSV and the PDF carry flying lines only (`ui/export.ts`, `ui/printpdf.ts`); the Inputs
  export is gone (D773). Nothing changes.
- **Insights and work hours:** read schedule rows, never inputs; an absence under Unavailable was never counted.
  Unchanged. ("→ Ground" on a group moves everyone's hours together, as today.)
- **The Tracker:** reads medical down days through the input's one man; medical stays one man's. Unchanged — and
  D2776 ends today's hand-over of a medical by a drop, which did move a man's down days.
- **Warnings, crew rest, the Leave War's counts and balances, the SANS calendar's counts:** each reads one line a
  man. What a row looks like changes none; only the new writes do (items 1, 5).
- **Saved data and the table list:** no new field. An input is already one record with its people
  (`data-schema.md` `people`; `data-model.md` `InputPerson`), and "a medical is one person's" is already refused at
  the write (`shapeProblem`) — so a retype of a group into a medical (Fable 2.6) is refused today. `data-model.md`
  §11 keeps its `Input` row. The one saved thing to check is the hand-over's leftovers (item 3).
- **A look at an issued version:** drawn from the people it froze, by the same builder — it will draw one row for
  what was issued as several, the people the same.

---

## What I did not check
- Nothing on the running app. Items 3, 5 and 12 are read from the code and should be reproduced on screen before
  they are believed.
- D736's full row for how a replace is counted (item 14).
- The Leave War's Move and Delete for an Inputs-page leave are not built ([LW-FULL-EDITING]); items 9 and 10 assume
  the combined-row job builds them, as the plan says.
