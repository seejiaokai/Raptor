# Rules diet step 5a — the account of the People & accounts rulings, by requirement (8 Nov 26)

**What it is.** The account the plan asks of every conversion (`raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md`
§2 "The account — by requirement", §7 step 5a), in the shape of OIL's
(`raptor-port/docs/superpowers/briefs/2026-11-08-rules-diet-step5a-account.md`): every ruling of the old
`.claude/rules/decisions/people-accounts.md`, split into its parts, each part → the page line that states it now, or
marked spent, detail or superseded, or a gap. **Compared:** old = `97eaa5251` (the table of 80 short lines, its head, its
"Also read" paragraph and its "From the Leave War" list of 12); new = `c9bcf22fa` (the page, first draft, chat 17).

**How it was made.** By a fresh Opus helper that did not write the page. For every one of the 80 rulings the full row in
`.claude/decisions-full/people-accounts.md` was read sentence by sentence — his words, the meaning cell with every mark,
the readings he was told; the old head, "Also read" and the Leave War list item by item, each pointer checked against its
ruling in its own area today (`leave-war.md`, `scheduler.md`, `tracker.md`, `inputs.md`, `design.md`, `how-we-work.md`,
`.claude/rules/seams/leave-war.md`); the other areas searched by subject for rulings that bear on people and accounts
and are pointed to nowhere; the backlog (`OUTSTANDING.md`, `OUTSTANDING-ARCHIVE.md`), `HANDOFF.md` and the app's code
(`leavewar/ui/outcomewords.ts`, `state/quals-write.ts`, `state/perms.ts`) read where a part's state decides whether it is
live or what the app shows.

**Fixes applied by the same helper** (8 Nov 26, the working tree, not committed): every gap below carries a **Fixed:**
note saying where it is stated now, each duplicate is merged and each pointer made true. **The account table still
describes `c9bcf22fa`**: its "Where on the page" column names the page line as fixed; a part marked A# or B# was
missing, bent or doubled at `c9bcf22fa`. **Not yet read by the blind readers.**

**Codes.** Page sections: **P-head** (the paragraphs before the first heading), **P-Acc** §Accounts and signing in,
**P-Join** §How a person joins, **P-Roles** §Roles, the member view and permissions, **P-Door** §Admin → Users — the one
door, **P-QualsWho** §Quals — who edits what, **P-QualsBtn** §Quals — its row of buttons, and on a phone, **P-In**
§Posting in, and a man's stints, **P-Out** §Posting out — its four outcomes and its sheet, **P-Bell** §Posting out on its
date — the admins' bells, **P-Arch** §Archive, restore and callsigns, **P-Del** §Delete — a man who leaves flying for
good, **P-Sqn** §Many squadrons and aircraft types — not built yet, **P-Set** §Settled — leave as they are, **P-From**
§From other areas. A page line is named by its section code and its first words. Marks: **stated** — the line states the
part; **spent** — a one-off part done (the evidence named); **detail** — only an example, a figure that is not a rule, a
reason or history (never a wording on screen, a control, a scope or who does what); **superseded** — a later ruling
replaced the part (named, with its date; the newer wins); **A#/B#** — a gap below. "r" before a part is the agent's
reading told to him in the row; "(1)", "(2)" his row's own numbering. **M#** — a rule stated twice on the draft, merged.

## Gaps

### A — a rule part missing, bent or stated differently

| # | Ruling | Part | The full row says | The page at `c9bcf22fa` | Fixed |
|---|---|---|---|---|---|
| A1 | — (the page itself) | the frontmatter | the old file closes its `paths:` list with `---` before its title | the 51 lines of `paths:` never closed — line 52 blank, then the title — so the page would not load by itself with the files it names, and the document check read it as unscoped and skipped every area-page check (statement size, no table rows, the Settled and From headings) | **Fixed:** `---` restored after the paths; the gate's page checks now run on it and pass (165 statements, the longest 520 characters). |
| A2 | D309, D310 | where the dated posting stays | D309's proposal: "the Leave War keeps the dated posting sheet, and the row shows a posting waiting for its date"; D310: "One door, as proposed" | P-Door "…carries every action on it; Quals loses its archive" — every action, the posting sheets with them | **Fixed:** P-Door "His direction, built as proposed: one door — … carries every action on him but the dated posting, whose sheets stay on the Leave War, his row showing a posting that waits for its date" [D309, D310]. |
| A3 | D1101, D1695 | a database for each aircraft type | D1101: "deployed separately for each aircraft type … each with its own database"; D1695 (5 Nov 26): "1 app 1 database … sort the people to go which sqn" | both stated, each as settled, side by side; never said that they meet, nor that the IT side's answer of 8 Nov 26 (one production environment for code apps) was put to him | **Fixed:** P-Sqn new bullet "Not settled: his direction of 5 Nov 26 below names one database for many squadrons, not aircraft types…" [D1101, D1695], the agent's reading — see Not settled (a). |
| A4 | D1100 | what he described | his rule: "work before then avoids what would have to be redone"; (2) "the rule checks included"; (3) "so a scheduler sees only who is with him"; (4) "members see each other's schedules … flying with one squadron in the morning and teaching academics at the other in the afternoon, so checks such as clashes and crew rest must see both" | (2)–(4) cut to "squadrons sharing people by day or period"; his rule folded into the agent's reading ("until then new work keeps … (the agent's reading)") | **Fixed:** P-Sqn "One app is built… its rule checks included", "Detachments — … so a scheduler sees only who is with him — and squadrons sharing people — members seeing each other's schedules, … crew rest must see both — … and work before then avoids what would have to be redone", and a new bullet "The agent's reading of that last part, told to him…" [D1100, D1101]. |
| A5 | D300 (with D310) | the sheet's line | his example of 27 Sep 26, "On 14 Oct: archived on Quals, account suspended." — before the one door | P-Out quoted it as the sheet's words; the app writes "On 14 Oct: archived, account suspended." ("archived." for a man with no sign-in) since Quals lost its archive (D310) | **Fixed:** P-Out new bullet "His example of that line, "On 14 Oct: archived on Quals, account suspended.", came before the one door; since Quals lost its archive the app writes … — the agent's reading of the later D310, as built" [D300, D1105, D310] — see Not settled (b). |
| A6 | D321 (6), D283 | where a SANS posting moves him | D321 (6): "moves his WHOLE Leave War row into the SANS group on the date"; D283: with Show SANS off the war "still shows him" in his old group | P-Out stated (6) with no condition, and two bullets later that with SANS off he stays in his old place — two lines that disagree | **Fixed:** P-Out "A posting out is not a step of the Undo button… a SANS posting moves his whole Leave War row into the SANS group on the date, earlier months included — the case where "+ SANS" is on, since with SANS off he stays in his old place (below; the agent's reading of the two together)" [D321, D327, D283, D1692]. |
| A7 | the scheduler's D337, D710 | what a delete lists | D337: "Deleting a man lists everything the delete took away, one line each": his "deleted" line, each future input, bid and OIL award, each on its own day; "A credit the schedule earned (automatic OIL) is never a line"; D710 widens it to each planning note he was taken off | pointed to nowhere; the delete section never says what the changes window shows | **Fixed:** P-From new bullet "The scheduler's: deleting a man lists everything the delete took away in the changes window…" [D337, D710]. |
| A8 | D219 (with D222) | whose rule "one field" is | "The agent's reading, stated to him so he can correct it: it is ONE field — the label on his puck … relabelled wherever the app asks for or heads it" | "reads "Callsign/Name" — one field, the label on his puck, … wherever it is asked or headed (the sign-up, …, the agent's reading)" — the reading's mark covered only the list, so "one field, the label on his puck" read as his rule | **Fixed:** P-Join "The field that names a person reads "Callsign/Name"…; the agent's readings: it is one field, the label on his puck, relabelled wherever…" [D219, D222]. |

### B — smaller drops (a wording, a reading, a state or a pointer)

- **B1** D1695 — the agent's reading that the table format for the IT side carries the squadron on each record.
  **Fixed:** P-Sqn "His direction (5 Nov 26)… the agent's readings: nothing is built now, and the table format for the
  IT side carries the squadron on each record" [D1695].
- **B2** D1547 — his idea of an "auto" / "manual" choice at the Post out sheet, put back to him with the agent's
  recommendation (no such choice). **Fixed:** P-Bell "A posting out runs by itself… the agent's readings: every outcome
  alike, Delete included, and no "auto" or "manual" choice at the Post out sheet — his idea, put back to him with that
  recommendation" [D1547, D1690, D1691].
- **B3** D993 — "only that row changes, and the Leave War's is left as it is"; and the two rows' later change pointed to.
  **Fixed:** P-QualsBtn "Quals' pinned header row… — that row alone, the Leave War's left as it was [D993]; both rows
  since take the row's place in the same frame it reaches the top bar (the Leave War's D1789, D1850, below)."
- **B4** D227 — the reading that the bell's state is stored with the request, survives a reload and goes when it is
  answered. **Fixed:** P-Join "Each admin's bell is his own… stored with the request so it survives a reload and goes
  once the request is answered (the agent's readings)" [D227, D216].
- **B5** D221 — the readings "with a line saying he can look while he waits" and "the guest view keeps its Sign out".
  **Fixed:** P-Join "With guest access on… the agent's readings: the button reads "View the schedule", with a line
  saying he can look while he waits, and the guest view keeps its Sign out" [D221].
- **B6** D226 — "Keeps D219's one field and the Quals box's 14". **Fixed:** P-Join "The callsign/name stays at 14
  letters, as the Quals callsign box does…" [D226].
- **B7** D286 r5 — "the sign-up never checks names; it is the approve that allows it". **Fixed:** P-Arch "When a
  request's callsign belongs only to an archived man… — the sign-up itself checks no names, the approve allows it (the
  agent's readings)" [D286].
- **B8** D294 — "'Sqn' alone is fine" is the agent's reading (D58 bars only a squadron number paired with it), stated as
  his rule; the "he's back" line, his rule, sat after it. **Fixed:** P-Out "The choices are four short chips… and the
  "he's back" line on Quals lines up with the page's left edge; the agent's readings: one short line under the chips…,
  and "Sqn" alone is fine, the bar on unit names forbidding only a squadron number paired with it" [D294, D298, D1709].
- **B9** D322 — "no Enable on an archived row" is one of the agent's calls approved with the mock-up, stated as plain
  rule. **Fixed:** P-Door "Archive also suspends the sign-in; …; the agent's calls, approved with the mock-up: Archive is
  one tap, Restore undoing it, and no Enable on an archived row…" [D310, D322].
- **B10** D328 — "open at every stage", what he was told on 28 Sep 26, is stale since the Leave War's D1177 (no stages);
  and it was what he was told, not his ruling. **Fixed:** P-In "The posting sheets are the admin's, open at any time — …
  — and never the man's, as he was told" [D328].
- **B11** D1510, D1651 — the draft made the screen's refusal Management's alone ("for Management at the screen too");
  D1651 rules the Quals write and the commit gate for the Scheduler, and D1510's reading has all three for Management.
  **Fixed:** P-QualsWho "A member's own Management and Scheduler cells read only, and a member's command that changes one
  is refused at the Quals write and the commit gate as well; for Management, refused at the screen, the write and the
  gate alike is the agent's reading" [D1510, D1651].
- **B12** D200 — stated as past work ("The permissions work rode [ACCOUNTS]…"); its standing rule — the table matches
  every ruling, one place in the app answers it, a test fails when they disagree — read as done. **Fixed:** P-Roles "One
  place in the app answers "may this person do this?", mirroring the data model's permissions table…, which matches every
  ruling, with a test that fails when the two disagree; built with [ACCOUNTS]…" [D200, D149, D218, D1510, D1651].
- **B13** D165 — the hand over's end state: each person sees "what changed since you last looked". **Fixed:** P-Acc "His
  plan for the database step… with personal accounts the hand over shows each person what changed since he last looked"
  [D165].
- **B14** D166 — "The only piece left to IT is tying each account to the real address"; the demo passwords "are never
  real ones". **Fixed:** P-Acc "Today's sign-in screen stands for the defence-mail sign-in… the one piece left to the IT
  side being to tie each account to its real address; the agent's readings: the demo passwords are not security and
  never real ones…" [D166, D292].
- **B15** D1653 — the IT side's answers of 8 Nov 26 (database rights are theirs, who may do what the app's own roles)
  were put to him that day, held on `[DB-SECURITY-ROLES]`; the page said nothing. **Fixed:** P-Roles "The database's
  security roles are designed by the agent… the IT side's answers of 8 Nov 26 — … — were put to him that day, held on
  [DB-SECURITY-ROLES]" [D1653].
- **B16** the head — it said the seams file holds the Leave War's "own store, and how a posting out is done on its
  date"; it holds the store and storage seam, the roster projected from the people list, the one absence record and the
  seams — nothing on a posting's date (the old file's "posting sheets and stints" overstated it too). **Fixed:** P-head
  "The Leave War's architecture — its own store and storage seam, its roster projected from the app's people, the one
  absence record, the seams where it meets the rest of the app — still loads with them".
- **B17** the design file's D1590 pointer — "the app is called TALON on the sign-in and the access screens" narrowed a
  rename of the whole app (D1590: everywhere the app names itself) to two screens. **Fixed:** P-From "The design file's:
  the app is called TALON, not RAPTOR, the sign-in and the access screens included, where the claw sits 7px nearer the
  name" [D1590, D1606, D1608].
- **B18** two pointers short of a citation — the D169 pointer states "a medical change in full", which is D211's (D169's
  line: "— changed by D211"); the D1099 pointer's aircraft-type setting is D1100's. **Fixed:** [D169, D211, D213] and
  [D1099, D1100, D1101] — D213 and D1101 added because the gate requires every live ruling marked as changing a cited one.
- **B19** the scheduler's D212 pointer — "who is offered in each comes from the Quals ticks" left the Scheduler tick a
  member's to set. **Fixed:** P-From "… the Scheduler tick an admin's alone since this page's D1651" [D212]; D212's own
  stale line is left for the scheduler's page (Not settled).
- **B20** D1101 r2, r3 — the architecture guide's "one database" means one deployment's scheduler, Leave War and
  Tracker; a man's data travels with him only within one system (his 13 Sep 26 rule). **Fixed:** P-Sqn "How a guest flyer
  from another type, or a man moving from one aircraft type to another — his data travelling with him today only within
  one system — …; "one database" in the architecture guide meant one deployment's schedule, Leave War and Tracker…" [D1101].
- **B21** D1696 — "a read one taken back" is the scheduler's D1693, uncited. **Fixed:** P-Bell "… a read one taken back,
  by the scheduler's rule for every bell line — … [D1696, D1693]".
- **B22** D1101 r1 — the two F-15 squadrons share the F-15 database, so lending a man between them stays inside one
  system. **Fixed:** P-Sqn "The app is deployed separately… so far at most two squadrons a type, so lending a man between
  the two F-15 squadrons stays inside one system (the agent's reading)" [D1101, D1100].
- **B23** D288 proposal (5), unanswered like (4): a guest's leave, quals and account stay with his own squadron (as
  D282). **Fixed:** P-Sqn "The agent's proposal of the same day, not yet answered by him: … and a guest's leave, quals and
  account stay with his own squadron, as a neighbour's man's do" [D288].
- **B24** the How we work D1536 pointer — "the app is set to its aircraft type by a setting"; D1536's words are "each
  aircraft type's deployment is set to its type by a setting, not by code". **Fixed:** P-From "How we work: at the move
  each aircraft type's deployment is set to its type by a setting, not by code — built then, not now, the agent's
  reading" [D1536, D1537].
- **B25** D280 r1 — suspend is the old "Switch off", and a posting out can do it on its date. **Fixed:** P-Acc "An
  account can be suspended and enabled again — …; suspend is the old "Switch off", which a posting out can also do on its
  date (the agent's reading) — …".
- **B26** D326 r — "the tag goes if the posting is undone" sat outside the reading's mark, as if his rule. **Fixed:**
  P-Door "A posting waiting for its date shows on his row… the agent's readings: that covers a posting with no outcome
  and a SANS posting — "posted out 14 Oct · SANS" — and the tag goes if the posting is undone" [D326, D322].
- **B27** the Leave War's D1326 pointer — "reached from the "⋯" button…, beside Grant OIL" read as if Grant OIL were
  another button; D1326 puts Grant OIL, Post out and Post in behind the one "⋯". **Fixed:** P-From "The Leave War's: in
  the bid window, Post out and Post in, with Grant OIL, are reached from the one "⋯" button in the row under the leaves"
  [D1326].

### Stated twice, and lines that disagree — the page's own check

- **(i) a rule stated twice — merged, every part and every citation kept:**
  - **M1** "View as" goes — in P-Acc's first bullet [D166, D292] and again in the D165 plan bullet → one, P-Acc
    "Accounts are built in the app now… "View as" another person is gone — every account already is a callsign, as his
    plan for the database step has it" [D166, D292, D165].
  - **M2** P-Del's first, second, fourth and fifth bullets said what goes and what stays twice over → what a delete is,
    its two asks and a new person afresh [D287, D290, D297, D299, D1102, D981, D300, D1105, D280]; what stays [D299,
    D297, D981, D300, D1105]; what goes [same]; the callsign and the hidden mark [D290, D297].
  - **M3** P-QualsWho said the callsign, the Management tick and the Scheduler tick are an admin's in three bullets →
    the first bullet holds the list [D149, D218, D1510, D1651]; the rename bullet keeps only that the rename stays on
    Quals and stays a label [D218, D1510, D1651].
  - **M4** P-Out "Archiving a man makes a published day he is named on… read "1 pending"…" and P-Arch's D327 bullet →
    one, P-Arch "An archived man stays in the ALL AVAIL crowd…" [D327, D321].
  - **M5** D1658 in P-Roles and in P-Set → P-Set alone, with "no member reaches the page anywhere else, and every change
    he tries there is refused" [D1658].
  - **M6** "a deleted man who comes back asks for access afresh" in P-Acc and "a new person" in P-Del → P-Del's first
    bullet [D280 among its citations].
  - **M7** the D284 and D307 bullets both said what Enable on a suspended man shows → one, P-Out "A man back from
    overseas returns as he was… on Restore, and on Enable of any suspended man…" [D284, D307].
  - **M8** "Quals loses its archive" in P-Door's first bullet and in the Quals bullet → the Quals bullet alone [D310,
    D322, D224].
  - **M9** "(first "Fully delete")" on the chips bullet and D298 in P-Del → P-Del alone [D298, D285].
  - **M10** "New person… asks the post-in date" in P-Door's "Add a person" bullet and in P-In's "Posted in" bullet → P-In
    alone [D308, D322].
  - The Settled section's short summary lines are kept: the plan's page shape gives each design of record and each
    look card's "keep" its line there, the rule itself stated once in its section.
- **(ii) two lines that state one rule and disagree:** A6 (a SANS posting's move), and B11 (where a member's tick is
  refused). None else found.
- **(iii) a citation for something its row does not say:** none found among the rulings cited; the head's pointer to
  the seams file claimed what that file does not hold (B16), and three statements lacked a citation their rows needed
  (B18, B21).

### Not settled — each with the reading taken

- **(a) D1101 against D1695.** D1101 (21 Oct 26, his leaning, "Im thinking"): a deployment and a database for each
  aircraft type, the squadrons of one type sharing it. D1695 (5 Nov 26): "the option to have 1 app 1 database", people
  sorted into squadrons within it — his words name squadrons, not aircraft types, so by its words it does not end the
  split by type; the later ruling wins only where it clearly covers the case (D90, D201). Since then the IT side answered
  (their answer 7, 8 Nov 26): one production environment for code apps, so no database for each type today; it was put to
  him that day with the recommendation "no change now, the F-15 squadrons first, settled when a second type joins", held
  on `[AIRCRAFT-TYPE-SETTING]` and `[MULTI-SQN-DESIGN]` and in `HANDOFF.md`. **Reading taken:** both stay live and stated
  as ruled; the page says plainly they meet and where the question sits (P-Sqn "Not settled: …", the agent's reading); no
  ruling is marked or archived for it — his answer settles it.
- **(b) D300's quoted line.** The row's bold rule is that the sheet says each thing once, "one line for what happens on
  it", with his example in brackets ("On 14 Oct: archived on Quals, account suspended."), written the day before the one
  door took the archive off Quals (D310, 27 Sep 26). The app's line today (`leavewar/ui/outcomewords.ts`): "On 14 Oct:
  archived, account suspended." — "archived." for a man with no sign-in; its code comment cites D310 and `[ONE-DOOR]`.
  **Reading taken:** the page states the rule (one line for what happens on the date), quotes his words as his example,
  and gives today's words as the agent's reading of the later D310, as built — never as words he ruled (A5). D1105's
  Delete line is his own words and stays stated as such.
- **(c) The drafter's four archive proposals — recommendations only; nothing moved.**
  - **D1546 — keep live.** Its mark is ANSWERED (by D1547), which by `DECISIONS.md` step 2 leaves it live. Its
    direction — every outcome, the "transferred" one among them, told to the schedulers so nobody is ever gone silently —
    is carried by no later ruling: D1547 rules that the posting runs and tells the bells, and its "every outcome alike" is
    only the agent's reading, not yet checked with him.
  - **D1108 — agree: archivable as restated in full by D1110**, a fresh reader to check it first (D971). Its live parts —
    a pinch on Quals on a phone, in and out; the pinned heading row and name column lined up while zoomed; the desktop
    unchanged — are each in D1110 (its rule and readings (1)–(3)); the rest is a comparison (the Board's desktop pinch,
    D1107), a reason, or spent (built with `[BOARD-PHONE-PINCH-ZOOM]`, its pictures put and answered). Archived, the
    P-QualsBtn pinch bullet drops D1108 from its citation.
  - **D309 — keep live.** "The Leave War keeps the dated posting sheet, and the row shows a posting waiting for its
    date" is carried by no later ruling: D310 says only "as proposed" (A2). D322 restates the row's posting tag, not the
    sheet's place.
  - **D224's work-route half — not archivable on its own.** A ruling is archived whole or not at all; D224 keeps live
    parts — the new-person mock-up as the design of record, its content (the sign-up's questions, the bell, "New person"
    on approve, Quals' "+ Add person" a button to Admin → Users) and the "[or: change X]" reading. The work route (Opus
    plan, Fable and Astra red team, the FULL check, his look) is spent — `[ACCOUNTS-NEW-PERSON]` built and archived — so
    the account marks it **spent** and the page does not state it.
- **D212's stale line** (the scheduler's: who is offered in each sign-off comes from the Quals ticks; its full row has a
  member able to tick SCHEDULER, stale since D1651 of 5 Nov 26) — not edited here; left for the scheduler's page (step
  5b). This page's pointer says the Scheduler tick is an admin's since D1651 (B19).
- **D1653 and the IT side's answers 3, 8 and 9 of 8 Nov 26** (database rights are the platform team's; who may do what is
  the app's own roles; a squadron column) — put to him that day, held on `[DB-SECURITY-ROLES]` and `[MULTI-SQN-DESIGN]`.
  The page states D1653 as ruled and says the answers were put (B15); his answer may change D1653's "IT enters them".
- **D1547's "auto" / "manual" idea** — put back to him with the agent's recommendation (no such choice); no answer is
  recorded (the backlog item `[POSTOUT-RUN-NOTICE]` was archived "answered with the agent's recommendation (none)"). The
  page states it as the agent's recommendation, not his rule (B2).
- **D288's proposals (4) and (5)** — never answered (D289 confirmed only (1) and (3)); the page states both as the
  agent's proposal "not yet answered by him".
- **D1510's reading that the screen refuses a Management tick** — built (the cell reads only; the Quals write refuses
  with "Only an admin can tick Management"); stated as the agent's reading, as the row has it.
- **The page is over its tripwire:** see Count. No part was cut to fit; the host asks him to raise it or split the area.

## The account — every ruling of the old file, newest first

| Ruling | Part | Where on the page | Mark |
|---|---|---|---|
| D1709 | (a) a ground-crew man cannot be posted out as SANS | P-Out "A ground-crew man cannot be posted out as SANS…" | stated |
| | (b) the Post out choices offer him no SANS — on the one-day sheet, the posting sheet and the drag window | P-Out "A ground-crew man cannot…" | stated |
| | (c) the posting writer refuses it | P-Out "A ground-crew man cannot…" | stated |
| | (d) SANS stays an aircrew status | P-Out "A ground-crew man cannot…" | stated |
| | (e) narrows D229 and D294 for ground crew only; the other outcomes stay his | P-Out "A ground-crew man cannot…"; cited on P-Out "A posting out has four outcomes…" and "The choices are four short chips…" | stated |
| | (f) why it was asked: a ground-crew man made SANS lost the purple line at his date | — | detail |
| D1696 | (a) the bell's "off the manpower" line is worked out from the posting as it stands, as built | P-Bell "The "off the manpower" line is worked out…" | stated |
| | (b) it moves with the posting's date | P-Bell "The "off the manpower" line…" | stated |
| | (c) it goes with an undone posting — a read one taken back (D1693) | P-Bell "The "off the manpower" line…" | B21 |
| | (d) it goes if the man is archived or deleted by hand later | P-Bell "The "off the manpower" line…" | stated |
| | (e) it is not saved as the other three lines are | P-Bell "The "off the manpower" line…" | stated |
| D1695 | (a) his direction: one app and one database for many squadrons | P-Sqn "His direction (5 Nov 26): one app and one database…" | stated |
| | (b) each person's squadron set when his account is made | P-Sqn "His direction (5 Nov 26)…" | stated |
| | (c) rights to view other squadrons, read only | P-Sqn "His direction (5 Nov 26)…" | stated |
| | (d) a permanent transfer when he posts out | P-Sqn "His direction (5 Nov 26)…" | stated |
| | (e) a day planned half in one squadron and half in another | P-Sqn "His direction (5 Nov 26)…" | stated |
| | (f) its design put to him with pictures as a job of its own, before the database step ("I'm not sure how should we design it") | P-Sqn "His direction (5 Nov 26)…" | stated |
| | (g) builds on D281, D282 and D1100 | — | detail |
| | (h) r: nothing is built now (D473) | P-Sqn "His direction (5 Nov 26)…" | stated |
| | (i) r: the table format for the IT side carries the squadron on each record | P-Sqn "His direction (5 Nov 26)…" | B1 |
| | (j) how it meets D1101 (a database for each aircraft type) | P-Sqn "Not settled: his direction of 5 Nov 26…" | A3 |
| D1694 | (a) on Admin → Users the blue ring on a row a bell's posting line lands on stands 8px outside the row on each side, clear of his name, as built — not on the row's edge, as drawn | P-Bell "On Admin → Users the blue ring…"; P-Set "The posting bell's line…" | stated |
| | (b) the drawing check keeps the difference on this ruling | P-Bell "On Admin → Users the blue ring…" | stated |
| | (c) the drawing check's spec file | — | detail |
| D1691 | (a) when a posting out deletes a man on its date, his bell line opens nothing when tapped | P-Bell "A tap on the line opens his row…" | stated |
| | (b) because he has no row left on Admin → Users | P-Bell "A tap on the line…" | stated |
| | (c) the line stays in the bell as the record, as the bell's "Deleted" line for an input does | P-Bell "A tap on the line…" | stated |
| | (d) checked on the app 5 Nov 26: no row, in the list or under Archived | — | detail |
| | (e) the other three outcomes open his row (D1547) | P-Bell "A tap on the line opens his row on Admin → Users…" | stated |
| | (f) narrows D1547 for the Delete | cited on P-Bell "A tap on the line…" | stated |
| D1690 | (a) the line leads with the man in bold and the date, then "Posted out" and what the outcome did | P-Bell "A posting out runs by itself…" | stated |
| | (b) his example "Ranger · Mon 16 Nov / Posted out · archived, account suspended" | P-Bell "A posting out runs by itself…" | stated |
| | (c) option B as drawn, not "Posting out" first | P-Bell "A posting out runs by itself…" | stated |
| | (d) the outcome's words as drawn — "archived, account suspended" ("archived" with no sign-in), "deleted", "now SANS", "off the manpower" | P-Bell "The outcome's words, as drawn…" | stated |
| | (e) nobody is named as who set the posting: the app does not keep it | P-Bell "The outcome's words, as drawn…" | stated |
| | (f) the drawing of record, pictures 4 and 6 | P-Set "The posting bell's line…" | stated |
| | (g) narrows D1547's words | cited on P-Bell "A posting out runs by itself…" | stated |
| D1658 | (a) Edit Schedule's "Publish AL1" is left as it is | P-Set "Edit Schedule's "Publish AL1"…" | stated |
| | (b) a member sees it looking pressable only through this PC's developer route | P-Set "Edit Schedule's "Publish AL1"…" | stated |
| | (c) no member reaches the page anywhere else, and every change he tries there is refused | P-Set "Edit Schedule's "Publish AL1"…" (the draft said it twice — M5) | stated |
| | (d) it closes [MEMBER-EDITPAGE-CHECK] | — (archived in `OUTSTANDING-ARCHIVE.md`) | spent |
| | (e) "My fade looks good" — another question's answer | — | detail |
| D1653 | (a) the database's security roles are designed by the agent at the database step, not before | P-Roles "The database's security roles are designed…" | stated |
| | (b) each table's permissions per role, row ownership set by the app, the protected columns, what stands in for each rule a role cannot hold | P-Roles "The database's security roles…" | stated |
| | (c) IT enters them, and a member-only account tests them | P-Roles "The database's security roles…" | stated |
| | (d) filed for the to-do list ("Yes add to to do list") — and the IT side's answers of 8 Nov 26 put to him, held on [DB-SECURITY-ROLES] | P-Roles "The database's security roles…" | B15 |
| | (e) r: joining stays one choice for the admin, member or admin; the app puts the person into the matching group, which carries the role — to check in the hosting trial and with the IT side | P-Roles "Joining stays one choice…" | stated |
| D1651 | (a) on Quals only an admin ticks the Scheduler column too | P-QualsWho "On Quals a member edits his own row only…" | stated |
| | (b) a member's own Scheduler cell reads only, as his Management cell does | P-QualsWho "A member's own Management and Scheduler cells…" | stated |
| | (c) a member's command that changes it is refused at the Quals write and the commit gate | P-QualsWho "A member's own Management and Scheduler cells…" | B11 |
| | (d) he still ticks every other column of his own row | P-QualsWho "On Quals a member edits his own row only…" | stated |
| | (e) why: the tick decides who may sign SKED CK, PLANNED BY and APPROVED BY, a scheduler is always an admin (D785), and a member unticking his own blanked his signatures | P-QualsWho "The Scheduler tick decides…" | stated |
| | (f) narrows D1510 and D149 | cited on P-QualsWho's first two bullets | stated |
| | (g) to build red first with a security read, with [MEMBER-SCHED-TICK] | — (built 5 Nov 26, archived: refused with "Only an admin can appoint a scheduler") | spent |
| D1547 | (a) a posting out runs by itself on its date, as before | P-Bell "A posting out runs by itself…" | stated |
| | (b) each admin's bell then gets one line saying it ran | P-Bell "A posting out runs by itself…" | stated |
| | (c) the line names the man, the date and what the outcome did | P-Bell "A posting out runs by itself…" | stated |
| | (d) its first words, "Posting out · Drifter · Mon 14 Nov · …" | — | superseded — D1690, 5 Nov 26 |
| | (e) a tap opens his row on Admin → Users | P-Bell "A tap on the line opens his row…" | stated |
| | (f) it does not wait for anyone to accept it | P-Bell "His direction… never waiting for an Accept" | stated |
| | (g) r1: every outcome alike, Delete included | P-Bell "A posting out runs by itself…" | stated |
| | (h) r1: the Delete's two taps at the sheet stay (D287, D1102) | P-Del "A man who leaves flying for good… asks twice… and so does the date that sets one off" | stated |
| | (i) r2: the words are the agent's draft, the outcome's own line | — | superseded — D1690, 5 Nov 26 |
| | (j) his idea of an "auto" / "manual" choice at the Post out sheet, put back to him with the agent's recommendation (no such choice) | P-Bell "A posting out runs by itself…" | B2 |
| D1546 | (a) his direction: when a man's posting out runs on its date — archived, deleted, made SANS or transferred — the schedulers are told | P-Bell "His direction: when a man's posting out runs…" | stated |
| | (b) so nobody is ever gone silently | P-Bell "His direction…" | stated |
| | (c) waits for an Accept, or runs and tells them: put to him with a picture before anything is built | P-Bell "His direction… answered by his "A"" (answered by D1547, 31 Oct 26) | spent |
| | (d) checked that day: the posting ran with no notice, only a passing note when held back (D306) | — | detail |
| D1510 | (a) on Quals only an admin ticks the Management column | P-QualsWho "On Quals a member edits his own row only…" | stated |
| | (b) a member's own Management cell reads only | P-QualsWho "A member's own Management and Scheduler cells…" | stated |
| | (c) a member's command that changes it is refused | P-QualsWho "A member's own Management and Scheduler cells…" | stated |
| | (d) he still ticks every other column of his own row | P-QualsWho "On Quals a member edits his own row only…" | stated |
| | (e) it narrows D149 as D218 did for the callsign, and follows D1502 | cited on P-QualsWho's first bullet; D1502 on P-From "the Management tick column…" | detail |
| | (f) r: refused at the screen, the Quals write and the commit gate alike | P-QualsWho "A member's own Management and Scheduler cells…" | B11 |
| | (g) to build red first with a security read (D1411) | — (built: `state/quals-write.ts`, "Only an admin can tick Management") | spent |
| | (h) lives in `data-model.md` §The Management column | — | detail |
| D1108 | (a) on a phone, Quals can be pinched to zoom in and out | P-QualsBtn "On a phone a pinch on Quals zooms the table only…" (as D1110 restates it) | stated |
| | (b) as the Scheduler Board's desktop layout can (D1107) | — | detail |
| | (c) so its wide table can be seen whole or read close | — | detail |
| | (d) built with [BOARD-PHONE-PINCH-ZOOM], in a fresh chat (his word) | — (archived, built) | spent |
| | (e) r1: what a pinch zooms, how far, and whether the zoom is kept put to him with pictures first | — (answered by D1110, 21 Oct 26) | spent |
| | (f) r2: Quals' pinned heading row and name column keep lining up while zoomed (D993) | P-QualsBtn "On a phone a pinch on Quals…" (D1110: "stay pinned and lined up") | stated |
| | (g) r3: the desktop is unchanged | P-QualsBtn "The agent's readings of the pinch…" (D1110 r3) | stated |
| D1105 | (a) a posting out with Delete chosen says plainly that the app deletes him by itself on the date | P-Out "For the Delete outcome the sheet's line reads…" | stated |
| | (b) the sheet's line: "On <date> the app deletes him automatically, with his account. Days he flew keep his puck." | P-Out "For the Delete outcome…" | stated |
| | (c) until the date his row reads "posting out <date> · auto delete" | P-Out "For the Delete outcome…" | stated |
| | (d) the button stays "Delete" (D298) — his A over renaming it "Auto delete" | P-Out "For the Delete outcome…" | stated |
| | (e) it narrows D300's one line for the Delete outcome only; the other outcomes' lines are unchanged | P-Out "For the Delete outcome…"; P-Out "His example of that line…" | stated |
| | (f) r1: the pending words show wherever they show today — Admin → Users and the Leave War | P-Out "For the Delete outcome…" | stated |
| | (g) r2: built with the next Leave War batch, not on pull request 556 | — ([PO-AUTO-DELETE-WORDS] archived, built) | spent |
| | (h) r3: a man whose delete has run shows no such word | P-Out "For the Delete outcome…" | stated |
| D1102 | (a) on the Post out sheet, changing the date of a Delete posting to today or earlier asks the same tap-twice question as the Delete button before he is deleted | P-Out "On the Post out sheet, changing the date…" | stated |
| | (b) the date is not saved until the second tap | P-Out "On the Post out sheet…" | stated |
| | (c) it extends D287 (3), "the delete asks twice", to the date that sets a delete off | P-Del "A man who leaves flying for good… and so does the date that sets one off" | stated |
| | (d) r1: a date in the future deletes no one at once, so it is saved with no ask | P-Out "On the Post out sheet…" | stated |
| | (e) r2: backing out leaves the posting and its date as they were | P-Out "On the Post out sheet…" | stated |
| | (f) r3: built that night only if a test on main showed the one-tap delete real | — ([PO-MOVE-DATE-DELETE-ASK] archived) | spent |
| D1101 | (a) the app is deployed separately for each aircraft type — F-15, F-16, F-35 — each with its own database | P-Sqn "The app is deployed separately…"; P-Sqn "Not settled: his direction of 5 Nov 26…" | A3 |
| | (b) one code base still serves them all (D1100) | P-Sqn "The app is deployed separately…" | stated |
| | (c) the squadrons of one type, with their detachments, share that type's database | P-Sqn "The app is deployed separately…" | stated |
| | (d) his leaning ("Im thinking"), answering D1100's open question | P-Sqn "The app is deployed separately…" | stated |
| | (e) r1: the two F-15 squadrons share the F-15 database, so lending a man between them stays inside one system | P-Sqn "The app is deployed separately… so lending a man between the two F-15 squadrons stays inside one system" | B22 |
| | (f) r2: the architecture guide's "one database" means one deployment's scheduler, Leave War and Tracker | P-Sqn "How a guest flyer from another type…" | B20 |
| | (g) r3: a guest flyer from another type and a man moving between types cross databases — how is his question at the database step | P-Sqn "How a guest flyer from another type…" | stated |
| | (h) r3: today's rule (13 Sep 26): a man who leaves the whole system starts fresh, his data travelling with him only within one system | P-Sqn "How a guest flyer… his data travelling with him today only within one system"; P-Out ""Fresh" on return…" | B20 |
| | (i) r4: nothing is built for it now | P-Sqn "How a guest flyer…" | stated |
| | (j) confirmed: one type's deployment holds several squadrons, so far at most two | P-Sqn "The app is deployed separately…" | stated |
| D1100 | (a) one app is built for every squadron and aircraft type (F-15, F-16, F-35), each squadron configuring it inside the app | P-Sqn "One app is built for every squadron…" | stated |
| | (b) an aircraft-type setting that carries its rules | P-Sqn "One app is built…" | stated |
| | (c) detachments and squadrons sharing people by day or period come at the end, after the F-15 app's faults are fixed | P-Sqn "Detachments — one squadron split…" | stated |
| | (d) work before then avoids what would have to be redone — his rule | P-Sqn "Detachments…" (stated only as the agent's reading at `c9bcf22fa`) | A4 |
| | (e) (1) one code base deployed for any squadron; a change is made once; users configure it to their squadron | P-Sqn "One app is built…" | stated |
| | (f) (2) the setting's choice brings its own settings, the rule checks included; rules common to all types shared; each squadron keeps its quirks | P-Sqn "One app is built… its rule checks included…" | A4 |
| | (g) (3) a detachment — one squadron split across two places — has its own schedule, its people moved to it so a scheduler sees only who is with him | P-Sqn "Detachments…" | A4 |
| | (h) (4) the two F-15 squadrons may share one app: members see each other's schedules; a man lent for a day or a period, even flying with one in the morning and teaching at the other in the afternoon, so checks such as clashes and crew rest must see both | P-Sqn "Detachments…" | A4 |
| | (i) (5) one shared system or split apart, for the security classification — his question | — | superseded — D1101, 21 Oct 26 |
| | (j) ra: it extends D281/D282 and D288/D289, all for the database step ([XFER]) | P-Sqn "A posting to another squadron…", "Neighbouring squadrons…", "A community is…" (each cites D1100 or sits under "not built yet") | stated |
| | (k) rb: D1099's back-seat switch becomes one of the aircraft-type settings | P-From "The scheduler's: a flying line with only its front seat…" | stated |
| | (l) rc: "no double work" read as settings, never fixed in the code, never built so that one man on two squadrons' days or a second schedule would have to be undone; nothing of the feature built early | P-Sqn "The agent's reading of that last part…" | stated |
| D1129 | (a) while editing Quals, "Edit quals" is plain grey until pressed, as "✎ Edit" is | P-QualsBtn "While editing, "Edit quals" is plain grey…" | stated |
| | (b) so "Done" is the one bright-blue button — the way out | P-QualsBtn "While editing…" | stated |
| | (c) pressed, it still reads "✕ Edit quals", plain | P-QualsBtn "While editing…" | stated |
| | (d) what it does is unchanged | P-QualsBtn "While editing…" | stated |
| | (e) it replaces, for this one button, his 5 Aug 26 rule that it is blue while it is the thing to press | P-QualsBtn "While editing…" | stated |
| | (f) the question: two bright-blue buttons side by side | — | detail |
| D1128 | (a) Quals' edit buttons read as Logic's: "✎ Edit" in plain grey to start, "Done" in the bright blue while editing | P-QualsBtn "Quals' edit buttons read as Logic's…" | stated |
| | (b) in place of "Enable editing" (blue) and "Save changes" ("Save" on a phone) | P-QualsBtn "Quals' edit buttons…" | stated |
| | (c) what each does is unchanged | P-QualsBtn "Quals' edit buttons…" | stated |
| | (d) Quals keeps each change as it is made; the button only ends editing, so "Done" says what it does | P-QualsBtn "Quals' edit buttons…" | stated |
| | (e) it narrows D937's first half (the phone's "Save") — on every width | P-QualsBtn "Quals' edit buttons… on every width" | stated |
| D1110 | (a) on a phone a pinch on Quals zooms the table only | P-QualsBtn "On a phone a pinch on Quals…" | stated |
| | (b) the top bar, Enable editing (now "✎ Edit"), Export, the filter and the Pilots · WSOs · Personnel · All switch stay as they are | P-QualsBtn "On a phone a pinch…" | stated |
| | (c) the heading row and the name column stay pinned and lined up | P-QualsBtn "On a phone a pinch…" | stated |
| | (d) it zooms out until the whole table's width fits and in to twice normal | P-QualsBtn "On a phone a pinch…" | stated |
| | (e) it keeps its zoom while he stays on Quals | P-QualsBtn "On a phone a pinch…" | stated |
| | (f) it answers D1108's open question | cited on P-QualsBtn "On a phone a pinch…" | stated |
| | (g) r1: "stays on Quals" means back to normal when he leaves the page | P-QualsBtn "The agent's readings of the pinch…" | stated |
| | (h) r2: switching Pilots / WSOs / Personnel / All keeps the zoom | P-QualsBtn "The agent's readings of the pinch…" | stated |
| | (i) r3: the desktop is unchanged | P-QualsBtn "The agent's readings of the pinch…" | stated |
| | (j) filed as [BOARD-PHONE-PINCH-ZOOM] | — (archived, built) | spent |
| D993 | (a) Quals' pinned header row follows the table sideways by the browser itself, as the Leave War's pinned date row does | P-QualsBtn "Quals' pinned header row follows the table sideways…" | stated |
| | (b) so it keeps up with the table on his iPhone | P-QualsBtn "Quals' pinned header row…" | stated |
| | (c) only that row changes; the Leave War's is left as it is | P-QualsBtn "Quals' pinned header row… that row alone, the Leave War's left as it was" | B3 |
| | (d) his look of 18 Oct 26: the Leave War's row smooth on his iPhone, Quals' not | — | detail |
| | (e) r: the "120 frames fix" is the browser moving the row, not the app's code each frame | P-QualsBtn "Quals' pinned header row… by the browser itself" | stated |
| | (f) r: built on the same branch as [TRK-CHART-FPS]; the separate job for both rows withdrawn | — ([TRK-CHART-FPS] archived) | spent |
| D937 | (a) on a phone "Save changes" reads "Save" so the filter keeps room | — | superseded — D1128, 21 Oct 26 |
| | (b) Quals opens at its top — its row of buttons in sight — wherever it is opened from, as the Inputs page does | P-QualsBtn "Quals opens at its top…" | stated |
| | (c) r: "on a phone" is 480 or less, the full words kept for a screen reader | — | superseded — D1128, 21 Oct 26 |
| | (d) r: "opens at its top" is the page arriving at its top each time the Quals tab is opened | P-QualsBtn "Quals opens at its top… wherever it is opened from" | stated |
| | (e) r: Logic and the other pages are not part of this ruling | P-QualsBtn "Quals opens at its top…" | stated |
| D935 | (a) Quals' row of buttons is built as drawn: one row at 36 | P-QualsBtn "Quals' row of buttons is one row at 36…"; P-Set "Quals' row of buttons, as built…" | stated |
| | (b) the date box that does nothing removed | P-QualsBtn "Quals' row of buttons…" | stated |
| | (c) "Export to Excel" reads "Export" on a phone | P-QualsBtn "Quals' row of buttons…" | stated |
| | (d) the paragraph under it ("similar to a LoX…", with its links) deleted whole | P-QualsBtn "Quals' row of buttons…" | stated |
| | (e) built with its own WALK check, in a fresh chat | — ([GUIDE-ONE-ROW] archived) | spent |
| | (f) r: "+ Add person" alone on its row stays as it is | P-QualsBtn "Quals' row of buttons…" | stated |
| | (g) r: the quals test that pinned the paragraph's words goes with it | — (built with the row) | spent |
| D329 | (a) an archived man's row says how he came to be archived and when — by an admin, or by his posting out on its date, and which one | P-Door "An archived man's row says how he came to be archived…" | stated |
| | (b) one line on each row of "▸ Archived" — "Archived 27 Sep 26 by Saber", "Archived 14 Oct 26 by his posting (Overseas Sqn)" | P-Door "An archived man's row…" | stated |
| | (c) stored on the person when it happens, so it survives a reload | P-Door "An archived man's row…" | stated |
| | (d) needs no change history, which is session-only until the database | — | detail |
| | (e) a man archived before it was built shows no line | P-Door "An archived man's row…" | stated |
| | (f) settled the same hour, his pick: the latest archive only, one line, over a full list | P-Door "An archived man's row… the latest archive only, his pick" | stated |
| | (g) built 28 Sep 26 on the one-door branch | — (pull request 450) | spent |
| D328 | (a) an earlier stint's dates are read-only on the Leave War, as built | P-In "The posting sheets are the admin's… an earlier stint's dates are read-only…"; P-Set "The post-out and one-door look cards' answers…" | stated |
| | (b) the Post in sheet of the stint he came back for says "Back from a posting on …" and offers no Undo | P-In "The posting sheets are the admin's…" | stated |
| | (c) a date aimed into an earlier stint is refused with the reason | P-In "The posting sheets are the admin's…" | stated |
| | (d) his current stint's post-in and post-out still move | P-In "His current stint's post-in and post-out…" | stated |
| | (e) chosen knowing an old stint's wrong date then has no door to correct it | P-In "His current stint's…" | stated |
| | (f) what he was told: the posting sheets are the admin's, open at every stage — a posting date is an official date, not a bid — never the man's | P-In "The posting sheets are the admin's, open at any time…" | B10 |
| | (g) round 1's findings (Fable F2, Astra 1) | — | detail |
| D327 | (a) an archived man stays in the ALL AVAIL crowd on every day before his archive | P-Arch "An archived man stays in the ALL AVAIL crowd…" | stated |
| | (b) the crowd on a day already published stays as it went out, and nothing reads pending for it | P-Arch "An archived man stays…" | stated |
| | (c) the published schedule never changed (D44, D45) | P-From "The scheduler's: who was behind a placeholder puck…" | stated |
| | (d) the working copy reads an archived man by his stints, as a deleted man by date — in the crowd on days he was here, out of it from his archive on | P-Arch "An archived man stays… the working copy reads him by his stints, in the crowd on days he was here…" | stated |
| | (e) narrows D321 (7) for the crowd: a day he is named on (a seat, a desk) still reads pending | P-Arch "An archived man stays… a published day he is named on… still reads "1 pending"" (two bullets at `c9bcf22fa` — M4) | stated |
| | (f) put to him the same day, not assumed | — | detail |
| | (g) his question a yes; "before his archive" is his stints, so a later Restore's gap reads him out too — confirmed, "4 correct" | P-Arch "An archived man stays… so a gap before a later Restore reads him out too" | stated |
| D326 | (a) a man whose posting out has run and left him on the roster shows "posted out <date>" on his Admin → Users row | P-Door "A posting waiting for its date shows on his row…" | stated |
| | (b) the partner of "posting out 14 Oct · Overseas Sqn" and "posting in 19 Oct" | P-Door "A posting waiting for its date…" | stated |
| | (c) found by Fable's final read | — | detail |
| | (d) r: it covers a posting with no outcome (D303) and a SANS posting (D283), "posted out 14 Oct · SANS" | P-Door "A posting waiting for its date… the agent's readings…" | stated |
| | (e) r: the tag goes if the posting is undone | P-Door "A posting waiting for its date… the agent's readings…" | B26 |
| D325 | (a) a hidden SANS man, once archived, shows on the Leave War with his months here, whatever Show SANS (now "+ SANS") says | P-Out "A hidden SANS man, once archived…" | stated |
| | (b) as a deleted man does (D299) | P-Out "A hidden SANS man…" | stated |
| | (c) his leave and OIL in those months stay seen | P-Out "A hidden SANS man…" | stated |
| | (d) as built; nothing to change | P-Out "A hidden SANS man… as built"; P-Set "The post-out and one-door look cards' answers…" | stated |
| D323 | (a) Archive on Admin → Users is "posted out from today" on the Leave War, his past kept | P-Arch "Archive on Admin → Users is "posted out from today"…" | stated |
| | (b) his row shows as normal up to yesterday, his leave and OIL in those months kept | P-Arch "Archive on Admin → Users…" | stated |
| | (c) reads "PO" (away) from today and is not counted in manning | P-Arch "Archive on Admin → Users…" | stated |
| | (d) a leave period wholly after today does not show him | P-Arch "Archive on Admin → Users…" | stated |
| | (e) Restore with a post-in date opens a new stint (D320) | P-Arch "Archive on Admin → Users…" | stated |
| | (f) sets aside the old Quals ✕'s effect — the row taken off the war altogether — which goes with the ✕ (D310) | P-Door "Quals keeps quals, CAT, flight and initials; its ✕ archive… moved to Admin → Users" | stated |
| | (g) r1: a posting that already closed his stint keeps its date | P-Arch "The agent's readings of it, told to him…" | stated |
| | (h) r2: a man whose post-in is still to come is closed empty | P-Arch "The agent's readings of it…" | stated |
| | (i) r3: a pending posting out is replaced by today's | P-Arch "The agent's readings of it…" | stated |
| | (j) r4: it writes the war's posting as run, so the posting pass never repeats it | P-Arch "The agent's readings of it…" | stated |
| D322 | (a) the one-door mock-up is approved — the design of record for [ONE-DOOR] | P-Set "Admin → Users, the one door: the one-door mock-up…" | stated |
| | (b) Admin → Users lists every person on the roster, one row each, A to Z, with a search box | P-Door "One row per person on the roster…" | stated |
| | (c) a Sign-in dot and a Roster dot in two columns — green on, red off, grey no sign-in | P-Door "One row per person…" | stated |
| | (d) tapping a row opens his sign-in, his role and the buttons for his state (D310's list) | P-Door "One row per person…"; P-Door "The buttons by state…" | stated |
| | (e) a posting waiting for its date shows on his row | P-Door "A posting waiting for its date…" | stated |
| | (f) "▸ Archived · N" folded at the foot, each archived row opening his callsign box — a rename, and "Restore as …" when his callsign is held (D295) | P-Door "The buttons by state…"; P-Arch "An archived man can be renamed directly…"; P-Arch "Restore refuses while the name is taken…" | stated |
| | (g) a Post in date opening on today (D308), Restore and Delete on each archived row | P-In ""Posted in" is every door…"; P-Door "The buttons by state…" | stated |
| | (h) the waiting list's buttons read Give access / Refuse, and New person there asks the post-in date | P-Door "The buttons by state…"; P-In ""Posted in" is every door…" (said twice at `c9bcf22fa` — M10) | stated |
| | (i) "Add a person" at the foot makes a New person only, asking the post-in date; a man already on the roster gets his sign-in on his own row — Give sign-in | P-Door ""Add a person" at the foot…"; P-In ""Posted in" is every door…" | stated |
| | (j) his first sign-in after Restore shows "Welcome back, <callsign> — check your quals and CAT" with Check my quals and Later | P-Door "His first sign-in after Restore…" | stated |
| | (k) Quals loses its ✕ and its Archived list | P-Door "Quals keeps quals, CAT, flight and initials…" (said twice at `c9bcf22fa` — M8) | stated |
| | (l) the agent's call: Archive is one tap, Restore undoing it | P-Door "Archive also suspends the sign-in… the agent's calls, approved with the mock-up…" | stated |
| | (m) the agent's call: Restore turns his sign-in back on even when suspended by hand before he was archived — narrowing, for Restore alone, the rule that "he's back" enables only a posting's suspension | P-Door "Restore turns his sign-in back on…" | stated |
| | (n) the agent's call: no Enable on an archived row, so no signing in while archived | P-Door "Archive also suspends the sign-in… the agent's calls…" | B9 |
| | (o) the agent's call: renaming a man on the roster stays on Quals (D218) | P-Door "Quals keeps quals… renaming a man on the roster stays on Quals (the agent's call…)"; P-QualsWho "A callsign's rename stays on Quals…" | stated |
| | (p) the agent's call: the list never reorders itself | P-Door "One row per person… (the agent's call, approved with the mock-up)" | stated |
| D321 | (a) the post-out look card's open questions stand as built | P-Out "A posting out is not a step of the Undo button…" | stated |
| | (b) (6) a man posted out as SANS moves his whole Leave War row into the SANS group on the date, earlier months included | P-Out "A posting out is not a step of the Undo button… the case where "+ SANS" is on…" | A6 |
| | (c) (7) archiving a man makes the published days he is on read "1 pending" until the next amendment (D45) — for the crowd narrowed by D327 | P-Arch "An archived man stays in the ALL AVAIL crowd… a published day he is named on… still reads "1 pending"" | stated |
| | (d) (8) a posting out is not a step of the Undo button — "Undo post out" takes it back | P-Out "A posting out is not a step of the Undo button…" | stated |
| | (e) (10) an admin may still add leave or OIL on a deleted man's past days, the past keeping his record (D299) | P-Out "A posting out is not a step of the Undo button…" | stated |
| | (f) the look card's (2), a Delete on an archived man with no account, answered by D322: every archived row has Delete | P-Door "The buttons by state… Archived… → Restore · Delete" | stated |
| | (g) nothing to build beyond [ONE-DOOR] | — | spent |
| D320 | (a) the Leave War keeps every stint a man has in the squadron, not one in-and-out window | P-In "The Leave War keeps every stint…" | stated |
| | (b) posted out and later restored with a post-in date, he reads "away" between the two — not counted in manning or availability, no bids, the posting hatch | P-In "The Leave War keeps every stint…" | stated |
| | (c) his months before the posting stay as they were, his leave there included | P-In "The Leave War keeps every stint…" | stated |
| | (d) he is counted again from the post-in date | P-In "The Leave War keeps every stint…" | stated |
| | (e) a leave period he is away for the whole of shows no row for him; one holding his posting-out date shows his days before it as normal | P-In "A leave period he is away for the whole of…" | stated |
| | (f) sets aside B — one post-in date only | — | detail |
| | (g) extends D308 | cited on P-In "The Leave War keeps every stint…" | stated |
| | (h) r: a stint opens on a post-in date and closes on a posting-out date; Restore opens a new one, never rewriting an old one | P-In "A leave period he is away for the whole of… (the agent's readings)" | stated |
| | (i) r: the war's own Post in / Post out edit the stint the day falls in | P-In "A leave period he is away for…" | stated |
| | (j) r: the records he left in an earlier stint stay and show there | P-In "The Leave War keeps every stint… his months before the posting stay as they were, his leave there included" | stated |
| | (k) his two questions on the leave periods' rows (Oct, Nov–Dec, Jan–Apr) | — | detail |
| D310 | (a) one door, as proposed: Admin → Users shows every person's sign-in and roster state | P-Door "His direction, built as proposed: one door…" | stated |
| | (b) and carries every action — "as proposed", the dated posting sheet staying on the Leave War (D309) | P-Door "His direction… but the dated posting, whose sheets stay on the Leave War…" | A2 |
| | (c) one row per person, a dot for Sign-in and one for Roster (green / red; grey no sign-in) | P-Door "One row per person on the roster…" | stated |
| | (d) the buttons by state — Active, Suspended, no sign-in, Archived (in the folded group), Waiting | P-Door "The buttons by state…" | stated |
| | (e) a posting waiting for its date shown on the row | P-Door "A posting waiting for its date…" | stated |
| | (f) Archive also suspends the sign-in; Restore brings both back, asks the post-in date and tells him to check his quals and CAT; so no "can sign in but archived" half-state | P-Door "Archive also suspends the sign-in…" | stated |
| | (g) the words stay — Suspend / Enable, Archive / Restore, Delete; "Give sign-in" is new | P-Door "The buttons by state…" | stated |
| | (h) a new person is still made by the form at the foot, the sign-in blank for someone who won't use the app | P-Door ""Add a person" at the foot…" | stated |
| | (i) Quals keeps quals, CAT, flight and initials; its ✕ archive, its Archived list, Restore, Restore as and the rename move to Admin → Users | P-Door "Quals keeps quals, CAT, flight and initials…" | stated |
| | (j) narrows D217 and D295, his newer word winning (D90) | cited on P-Door "Quals keeps quals…" and P-Arch "An archived man can be renamed directly…" | stated |
| | (k) r: a mock-up first, then the build and a FULL check; its place after pull request 446 | — (D322 approved the mock-up; [ONE-DOOR] built and archived) | spent |
| D309 | (a) his direction: one door — Admin → Users shows each person's whole state, sign-in and roster, a green or red dot each | P-Door "His direction, built as proposed: one door…" | stated |
| | (b) and carries every action on him | P-Door "His direction…" | stated |
| | (c) a direction, not yet a design: the proposal put to him with a mock-up first, settled by his approval | — (approved, D322) | spent |
| | (d) narrows D217 — archive and restore move to Admin → Users, Quals keeping quals, CAT, flight and initials — named to him as the clash | P-Door "Quals keeps quals, CAT, flight and initials…" | stated |
| | (e) D295's rename on Quals' Archived list moves with it | P-Arch "An archived man can be renamed directly… since the one door, no longer Quals'" | stated |
| | (f) the proposal: one row per person, the archived in a folded "▸ Archived · N" group | P-Door "One row per person…"; P-Door "The buttons by state…" | stated |
| | (g) the proposal: the words kept, shown only where they make sense | P-Door "The buttons by state…" | stated |
| | (h) the proposal: Archive suspends, Restore brings both back, asking the post-in date and telling him to check his quals | P-Door "Archive also suspends the sign-in…" | stated |
| | (i) the proposal: the Leave War keeps the dated posting sheet, and the row shows a posting waiting for its date | P-Door "His direction… but the dated posting, whose sheets stay on the Leave War…" (absent at `c9bcf22fa`: "carries every action") | A2 |
| | (j) its place: pull request 446 merges as checked, this its own branch after it | — | spent |
| | (k) asked before it: Admin → Users had no archived list, every account in one list | — | detail |
| D308 | (a) when someone is posted in, the app asks the admin for his post-in date, so the Leave War is right | P-In "When someone is posted in, the app asks…" | stated |
| | (b) his access can start a few days before it | P-In "When someone is posted in…" | stated |
| | (c) the two are separate: his account works from the day the admin adds or restores him; the post-in date decides from when he counts — availability, the manning counts, the crowds a placeholder stands for | P-In "When someone is posted in…" | stated |
| | (d) extends the Leave War's 20 Sep 26 "Post in" button, set by hand, to be asked where a man arrives | P-In "When someone is posted in…"; P-In ""Posted in" is every door…" | stated |
| | (e) adds a field to D224's approved new-person form | P-Set "The new person and the sign-up… the post-in date added to its form" | stated |
| | (f) r1: "posted in" is every door that puts a man on the roster — New person (added, or approving a request) and Restore / Restore as | P-In ""Posted in" is every door…" | stated |
| | (g) r2: the date box opens on today's date, changed when he arrives later | P-In ""Posted in" is every door…" | stated |
| | (h) r3: its place put to him | — | spent |
| D307 | (a) Enable on any suspended man shows the "he's back — check his Quals and CAT" note, not only one back from overseas, as built | P-Out "A man back from overseas returns as he was… on Enable of any suspended man…" (two bullets at `c9bcf22fa` — M7); P-Set "The post-out and one-door look cards' answers…" | stated |
| | (b) it changes nothing by itself (D284) | P-Out "A man back from overseas…" | stated |
| D306 | (a) a posting that would leave no admin able to sign in waits, whole, until another admin can, as built — never half done | P-Out "A posting that would archive, suspend or delete the last admin…" | stated |
| | (b) said before the confirm and on his account row | P-Out "A posting that would archive…" | stated |
| | (c) it runs by itself once the reason goes | P-Out "A posting that would archive…" | stated |
| D304 | (a) a delete counts from the real calendar date, as built | P-Del "A delete counts from the real calendar date…" | stated |
| | (b) every day before it keeps his puck (D297), every day from it loses him | P-Del "A delete counts from the real calendar date…" | stated |
| | (c) the demo's own "today" (13 Jul) is not the clock | P-Del "A delete counts…" | stated |
| | (d) confirms the build (the one clock); nothing to change | P-Del "A delete counts… as built"; P-Set "The post-out and one-door look cards' answers…" | stated |
| D303 | (a) a posting with no chip chosen stays "off the manpower, nothing else" | P-Out "A posting with no chip chosen…" | stated |
| | (b) the Leave War shows him posted out from the date; he stays on Quals, his account open, nothing archived, deleted or made SANS | P-Out "A posting with no chip chosen…" | stated |
| | (c) the old sheet's "Archive on PO date" off | — | detail |
| | (d) kept because Transfer to Sqn waits for the shared database (D281): until then this is how a man leaving for another squadron is recorded | P-Out "A posting with no chip chosen…" | stated |
| | (e) the sheet still opens on Overseas Sqn | P-Out "A posting with no chip chosen…" | stated |
| | (f) reached only by un-picking the chosen chip | P-Out "A posting with no chip chosen — the chosen one tapped again…" | stated |
| D300 | (a) the post-out sheet says each thing once: the date in its box, one line for what happens on it, and a button that reads just "Post out" | P-Out "The post-out sheet says each thing once…" | stated |
| | (b) his example of that line, "On 14 Oct: archived on Quals, account suspended." | P-Out "His example of that line… came before the one door…" (quoted at `c9bcf22fa` as the sheet's words) | A5 |
| | (c) the "Nothing changes until that day…" line goes | P-Out "The post-out sheet says each thing once…" | stated |
| | (d) narrows D299's approved mock-up (§1) and changes the button that read "Post out from <date>" | P-Out "The post-out sheet says each thing once… a button that reads just "Post out""; P-Set "The Post out sheet and the delete… trimmed to say each thing once" | stated |
| | (e) fewer words overall, on the sheet and across the mock-up page | P-Out "The post-out sheet says each thing once… with fewer words overall" | stated |
| | (f) the next chat does it and shows him before the build | — (the trimmed mock-up, P-Set; [POST-OUT-OUTCOMES] archived) | spent |
| | (g) r: the same for the post-in button — "Post in" | P-Out "The post-out sheet says each thing once… (the agent's reading)" | stated |
| | (h) narrowed by D1105 for the Delete outcome | P-Out "For the Delete outcome the sheet's line reads…" | stated |
| D299 | (a) (1) a delete takes him out of today and the future; the past keeps its record of him, shown only where the past is shown | P-Del "What stays — a delete takes him out of today and the future…" (two bullets at `c9bcf22fa` — M2) | stated |
| | (b) stays: his puck on every day he already flew (D297) | P-Del "What stays…" | stated |
| | (c) stays: his past Leave War record — leave taken, OIL earned — in the months he was here | P-Del "What stays…" | stated |
| | (d) stays: his past inputs with their documents (leave, medical, courses, the examples) | P-Del "What stays…" | stated |
| | (e) stays: his signatures on published days (CUR CK, SKED CK, PLANNED BY, APPROVED BY) | P-Del "What stays…" | stated |
| | (f) stays: the change history; his Tracker record from courses he finished | P-Del "What stays…" | stated |
| | (g) goes: his account; his Quals row from every list, the Archived one included, and every picker | P-Del "What goes…" | stated |
| | (h) goes: his callsign (free) | P-Del "His callsign is free…" | stated |
| | (i) goes: every day still to come; his future leave, bids and inputs; his OIL balance; his Leave War row after he left; his place on any course still running | P-Del "What goes…" | stated |
| | (j) how long medical records are kept is the organisation's rule, applied at the database step | P-Del "What goes…" | stated |
| | (k) (2) the mock-up is approved — the design of record for [POST-OUT-OUTCOMES], and for the guest mark when [XFER] is built | P-Set "The Post out sheet and the delete…" | stated |
| | (l) answered by D981: "a course still running" is every course with events neither done nor N.A. | P-From "The Tracker's: a man deleted through Post out leaves every Tracker course…" | stated |
| | (m) narrowed by D300: the sheet says each thing once | P-Out "The post-out sheet says each thing once…" | stated |
| D298 | (a) the post-out chip reads "Delete", not "Fully delete" | P-Del "The post-out chip reads "Delete"…" | stated |
| | (b) why: the past keeps its record, so "fully" overstates it | P-Del "The post-out chip reads "Delete"…" | stated |
| | (c) a delete takes him out of today and the future — every list, picker, sign-in, day still to come | P-Del "What goes…" | stated |
| | (d) narrows D294: the four chips "Overseas Sqn", "Delete", "SANS", "Transfer to Sqn" | P-Out "The choices are four short chips…" (with "(first "Fully delete")" there at `c9bcf22fa` — M9) | stated |
| | (e) D285's "Delete account" button stands | P-Del "The post-out chip reads "Delete"… "Delete account" stands" | stated |
| | (f) r: the same word everywhere the act is named — the chip, the account editor's second tap, the confirm line | P-Del "The post-out chip reads "Delete"…" | stated |
| D297 | (a) a deleted man keeps his puck on every day he already flew, published or not | P-Del "What stays…"; P-Del "A delete counts from the real calendar date…" | stated |
| | (b) he is taken off every day still to come, a published day reading pending as any change does | P-Del "What goes…" | stated |
| | (c) he is gone from every list, picker, the Leave War's current views and the sign-in | P-Del "What goes…" | stated |
| | (d) his callsign is free; if a new man takes it the old days still show the old one — the app knows each by his id | P-Del "His callsign is free…" | stated |
| | (e) narrows D287: "every day he was on shows his seat empty, published days included" gives way | — | stated (D287 (e) marked superseded) |
| | (f) the published record stays true — D45's principle holds again | P-From "The scheduler's: who was behind a placeholder puck… what a published day keeps when a man is deleted or archived" | stated |
| | (g) made possible by D290, his record kept underneath as a hidden "deleted" mark | P-Del "His callsign is free… underneath he is kept as a hidden "deleted" mark…" | stated |
| D296 | (a) a guest from another community is marked by an orange corner on his puck (option A) | P-Sqn "The guest mark is an orange corner on his puck…" | stated |
| | (b) it settles D289's form, for when it is built with the shared database | P-Sqn "The guest mark is an orange corner…" (under "not built yet"); P-Set "The Post out sheet and the delete… for the guest mark when [XFER] is built" | stated |
| | (c) taken knowing it is a little less distinct beside a red warning chip | P-Sqn "The guest mark is an orange corner…" | stated |
| D295 | (a) an archived man can be renamed directly — narrowed by D310 to Admin → Users' archived list | P-Arch "An archived man can be renamed directly…" | stated |
| | (b) a name clash on restore is solved by renaming the archived man (or the new one) — no restore first | P-Arch "Restore refuses while the name is taken…"; P-Arch "An archived man's callsign may be given to a new person… one of the two is renamed first" | stated |
| | (c) refines D286, whose reading (1) stands: Restore refuses while the name is taken, never renaming anyone by itself | P-Arch "Restore refuses while the name is taken…" | stated |
| | (d) r: a rename box on each archived row, admin only | P-Arch "An archived man can be renamed directly, by an admin…" | stated |
| | (e) r: Restore meeting a taken callsign offers that box on the spot ("Ace is taken — give him another callsign"), the rename and the restore one step | P-Arch "Restore refuses while the name is taken…" | stated |
| D294 | (a) the post-out choices are four short chips, taking little room | P-Out "The choices are four short chips…" | stated |
| | (b) "Fully delete" among them | — | superseded — D298, 27 Sep 26 |
| | (c) the "he's back" line on Quals lines up with the page's left edge | P-Out "The choices are four short chips…" | stated |
| | (d) replaces the mock-up's first drawing (four wide buttons, each with a sentence) | — | detail |
| | (e) r: one short line under the chips says what the chosen one does on the date | P-Out "The choices are four short chips… the agent's readings…" | stated |
| | (f) r: "Sqn" alone is fine — D58 bars only a squadron number paired with it | P-Out "The choices are four short chips… the agent's readings…" (stated as his rule at `c9bcf22fa`) | B8 |
| | (g) r: the app already shows "EXT SQN" | — | detail |
| | (h) narrowed by D1709 for ground crew | P-Out "A ground-crew man cannot be posted out as SANS…" | stated |
| D293 | (a) no "Sign up" button on the sign-in page | P-Acc "No "Sign up" button on the sign-in page…" | stated |
| | (b) anyone who signs in and is on no list lands on "Request access" by himself, and at the database step the sign-in is Microsoft's | P-Acc "No "Sign up" button…" | stated |
| | (c) why: a button would lead to the same place and hint that the app makes a password; the page stays simple (7 Aug 26) | — | detail |
| | (d) kept in reserve, not built: one line under the button — "New here? Sign in with your defence mail to ask for access." — if new people are confused once it is live | P-Acc "No "Sign up" button…" | stated |
| D292 | (a) an admin can switch himself to the member view and back, by tapping his name badge — "SABER · ADMIN" ↔ "SABER · MEMBER" | P-Roles "An admin can switch himself to the member view…" | stated |
| | (b) in the member view the app behaves exactly as for a member — his own Quals row and inputs only, no Admin tab, no Edit Schedule | P-Roles "An admin can switch himself…" | stated |
| | (c) every sign-in starts as admin; he stays himself throughout — it changes what he may do, never who he is | P-Roles "An admin can switch himself…" | stated |
| | (d) replaces D166 (3)'s "no preview as a member"; the rest of D166 stands — "View as" another person stays gone | P-Acc "Accounts are built in the app now… "View as" another person is gone…" | stated |
| | (e) built with [POST-OUT-OUTCOMES] | — (archived, built) | spent |
| | (f) r: on a phone the switch sits in the drawer's account line | P-Roles "An admin can switch himself… (the agent's reading)" | stated |
| D290 | (a) a man deleted for leaving flying for good is kept underneath as a hidden "deleted" mark — never erased | P-Del "His callsign is free… underneath he is kept as a hidden "deleted" mark…" | stated |
| | (b) on screen it is D287 — gone from every list, his callsign free | P-Del "What goes…"; P-Del "His callsign is free…" | stated |
| | (c) on screen: his old seats reading empty | — | superseded — D297, 27 Sep 26 |
| | (d) in the database his row stays, marked deleted and invisible everywhere — the data model's tombstone and the platform's own way of deleting | P-Del "His callsign is free…" | stated |
| | (e) settles D287's "how"; the data model's never-hard-deleted rule stands for the database | P-Del "His callsign is free… never erased…" | stated |
| D289 | (a) a community is the squadrons flying one aircraft type (F-15, F-16) | P-Sqn "A community is the squadrons flying one aircraft type…" | stated |
| | (b) a guest from another community is always marked as one | P-Sqn "A community is…" | stated |
| | (c) confirms D288's proposal (1) and (3) | cited on P-Sqn "A community is…" | stated |
| | (d) his concern: the mark must never hide the callsign | P-Sqn "The guest mark is an orange corner… the mark never hides the callsign" | stated |
| | (e) why: a puck is a fixed width, never wraps, and shows about 9–10 letters | — | detail |
| | (f) r: on a puck the mark is a small colour mark, not text, with "Viper · F-16" in full wherever there is room — the lists, the pickers, a tap | P-Sqn "The guest mark is an orange corner… (the agent's reading)" | stated |
| | (g) r: its form settled with a mock-up before it is built | — (settled by D296, option A) | spent |
| D288 | (a) callsigns are unique within a community, not across the app | P-Sqn "A community is… callsigns are unique within a community, not across the app" | stated |
| | (b) the F-15 community keeps one callsign per man; a future F-16 community will reuse callsigns; its people may fly with an F-15 squadron as guest flyers | P-Sqn "A community is…"; P-Sqn "How a guest flyer from another type…" | stated |
| | (c) future, with the multi-squadron database; nothing to build now | P-Sqn "A community is… future, nothing built now" | stated |
| | (d) the database must not make a callsign unique across the whole app | P-Sqn "A community is…" | stated |
| | (e) proposal (1): a community = the squadrons of one aircraft type | P-Sqn "A community is…" (confirmed, D289) | stated |
| | (f) proposal (2): the app knows a man by a hidden id, never his name, so two "Viper"s are never mixed up | P-Del "His callsign is free… the app knows each by his id" | stated |
| | (g) proposal (3): a guest wears a small tag on his puck and in every picker, always | P-Sqn "The guest mark is an orange corner…" (confirmed, D289; its form D296) | stated |
| | (h) proposal (4), unanswered: a guest is picked from a list of guest flyers, never by typing a bare callsign | P-Sqn "The agent's proposal of the same day, not yet answered by him…" | stated |
| | (i) proposal (5), unanswered: his leave, quals and account stay with his own squadron (as D282) | P-Sqn "The agent's proposal of the same day… a guest's leave, quals and account stay with his own squadron" | B23 |
| D287 | (a) a man who leaves flying for good is deleted outright — his account and his person | P-Del "A man who leaves flying for good is deleted…"; P-Acc "An account can be suspended and enabled again… and deleted…" | stated |
| | (b) he goes from every list, the Archived one included | P-Del "What goes…" | stated |
| | (c) every day he was ever on shows his seat empty, published days included | — | superseded — D297, 27 Sep 26 |
| | (d) sets aside the agent's recommendation (C) and D280's reading (2), "deleting an account never deletes the person" | P-Acc "An account can be suspended… the delete taking the person too" | stated |
| | (e) narrows D45's principle for this one act, made knowing a published seat then reads empty with nobody told | — | superseded — D297, 27 Sep 26 (D45 holds again) |
| | (f) r1: everything that is his goes with him — his Quals row, his account, his inputs, his Leave War leave and OIL | P-Del "What goes…" (the future part) | superseded in part — D299, 27 Sep 26: the past keeps his leave, OIL, inputs and signatures |
| | (g) r2: on a day still to come he is taken off, a published day reading pending | P-Del "What goes…" | stated |
| | (h) r2: a past day keeps its empty seat | — | superseded — D297, 27 Sep 26 |
| | (i) r3: the delete asks twice and names what goes; it cannot be undone | P-Del "A man who leaves flying for good…" | stated |
| | (j) r4: if he is ever taken back he is a new person (his 13 Sep 26 "fresh") | P-Del "A man who leaves flying for good…"; P-Out ""Fresh" on return…" | stated |
| | (k) narrowed by D290, D299, D297; extended by D1102 | cited on P-Del's first bullet | stated |
| | (l) the choices A, B, C and his worry about a huge archive list | — | detail |
| D286 | (a) an archived man's callsign may be given to a new person | P-Arch "An archived man's callsign may be given to a new person…" | stated |
| | (b) if the archived man is later restored while his callsign is in use, one of the two is renamed first | P-Arch "An archived man's callsign may be given…" | stated |
| | (c) narrows the one-callsign rule: a callsign held by someone on the roster is still refused; one held only by an archived man is free | P-Arch "An archived man's callsign may be given…" | stated |
| | (d) r1: Restore refuses while the name is taken and says so, never renaming anyone by itself | P-Arch "Restore refuses while the name is taken…" | stated |
| | (e) r2: a typed callsign (a row, the search, a sign-up) finds the man on the roster, never the archived one | P-Arch "An archived man can be renamed directly…" | stated |
| | (f) r3: old schedules keep showing the archived man's days as his | P-Arch "An archived man can be renamed directly…" | stated |
| | (g) r4: the "is archived — restore them instead" refusal gives way to allowing the name | P-Arch "An archived man's callsign may be given to a new person…" | stated |
| | (h) r5: when a request's callsign belongs only to an archived man, Approve opens on New person, filled from the request, with a line saying an archived man holds it | P-Arch "When a request's callsign belongs only to an archived man…" | stated |
| | (i) r5: the sign-up never checks names; it is the approve that allows it | P-Arch "When a request's callsign belongs only…" | B7 |
| D285 | (a) the account buttons read "Suspend" / "Enable" and "Delete account" | P-Acc "The account buttons read "Suspend" / "Enable"…" | stated |
| | (b) "Suspend / Enable" replaces "Switch off / Switch on" on Admin → Users — the same act | P-Acc "The account buttons read…"; P-Acc "An account can be suspended… suspend is the old "Switch off"…" | stated |
| | (c) "Delete account" is new (D280) | P-Acc "The account buttons read…"; P-Del "The post-out chip reads "Delete"… "Delete account" stands" | stated |
| | (d) r: the screens that name the state follow — the tag "suspended", the sign-in screen "Your access is suspended" | P-Acc "The account buttons read… (the agent's reading)" | stated |
| D284 | (a) a man back from overseas returns as he was — his Quals kept | P-Out "A man back from overseas returns as he was…" | stated |
| | (b) the app prompts the admin to update them | P-Out "A man back from overseas…" | stated |
| | (c) narrows his 13 Sep 26 "fresh on return" rule: it no longer covers a man archived while overseas | P-Out ""Fresh" on return…" | stated |
| | (d) r1: "fresh" still applies to a man who left flying for good and is ever taken back | P-Out ""Fresh" on return…" | stated |
| | (e) r2: "maintain" covers his whole record, the Leave War's too | P-Out "A man back from overseas… (the agent's reading)" | stated |
| | (f) r3: the prompt comes when the admin restores him or enables his account; it says he is back and to check his quals and CAT, with a way straight to his Quals row, changing nothing by itself | P-Out "A man back from overseas…" | stated |
| D283 | (a) a man posted out as SANS becomes SANS on the posting-out date | P-Out "A man posted out as SANS becomes SANS…" | stated |
| | (b) with SANS off the Leave War still shows him, marked posted out, and does not track his leave | P-Out "A man posted out as SANS…" | stated |
| | (c) with SANS on he moves into the SANS group that day and his leave is tracked there | P-Out "A man posted out as SANS…" | stated |
| | (d) whether to track SANS stays his choice | P-Out "A man posted out as SANS…" | stated |
| | (e) refines D229's SANS outcome with the Show SANS case | P-Out "A posting out has four outcomes…" (cites D283) | stated |
| | (f) r: "the SANS column" is the SANS group of the grid; with SANS off he stays in his old group, posted out from the date | P-Out "A man posted out as SANS… the war still shows him in his old place" | stated |
| | (g) narrowed by D1692: his name wears the SANS purple line, not a "SANS" tag | P-Out "A man posted out as SANS…" | stated |
| D282 | (a) neighbouring squadrons plan each other's people as a matter of course, not only while a man is being posted | P-Sqn "Neighbouring squadrons plan each other's people…" | stated |
| | (b) widens D281's "in the mean time"; D281's other halves stand | P-Sqn "A posting to another squadron will be a transfer…" (cites D282) | stated |
| | (c) r1: both ways | P-Sqn "Neighbouring squadrons…" | stated |
| | (d) r2: "plan" means put on the other squadron's schedule, his leave, quals and account staying his own squadron's | P-Sqn "Neighbouring squadrons…" | stated |
| | (e) r3: it needs several squadrons on one database, so nothing is built before then — but the database must not assume a squadron's schedule holds only its own people | P-Sqn "Neighbouring squadrons…" (under "not built yet") | stated |
| D281 | (a) a posting to another squadron will be a transfer — future, with the multi-squadron database | P-Sqn "A posting to another squadron will be a transfer…" | stated |
| | (b) on the posting-out date he belongs to the other squadron, the admin transferring him automatically on that date or by hand in the app | P-Sqn "A posting to another squadron…" | stated |
| | (c) his data goes with him (his 13 Sep 26 rule) | P-Sqn "A posting to another squadron…" | stated |
| | (d) another squadron may plan a man meanwhile, the squadrons being local and near each other | P-Sqn "Neighbouring squadrons plan each other's people…" | stated |
| | (e) not built now — it needs more than one squadron on one database | P-Sqn "A posting to another squadron… not built now" | stated |
| | (f) r: "plan" means put on the other squadron's schedule — its pucks, its crew lists — never edit his leave or quals | P-Sqn "Neighbouring squadrons…" | stated |
| | (g) widened by D282; extended by D1100 | cited on P-Sqn "A posting to another squadron…" | stated |
| D280 | (a) an account can be suspended and enabled again, and deleted | P-Acc "An account can be suspended and enabled again…" | stated |
| | (b) suspend: a man away, overseas with another squadron, cannot sign in; on his return an admin enables it and he signs in as before | P-Acc "An account can be suspended…" | stated |
| | (c) delete: for a man who leaves flying for good — the sign-in is gone | P-Acc "An account can be suspended…"; P-Del "A man who leaves flying for good…" | stated |
| | (d) r1: suspend is the old "Switch off / Switch on"; what changes is its words and that a posting out can do it on the date | P-Acc "An account can be suspended… suspend is the old "Switch off", which a posting out can also do on its date (the agent's reading)" | B25 |
| | (e) r2: deleting an account never deletes the person | — | superseded — D287, 26 Sep 26 |
| | (f) r3: a deleted man who ever comes back asks for access afresh, as someone who left the system (his 13 Sep 26 rule) | P-Del "A man who leaves flying for good… asking for access afresh as someone who left the system" (in two places at `c9bcf22fa` — M6) | stated |
| D229 | (a) a posting out has four outcomes, and the admin says which | P-Out "A posting out has four outcomes…" | stated |
| | (b) (1) overseas to another squadron → archived, his account suspended, back later | P-Out "A posting out has four outcomes…" | stated |
| | (c) (2) leaving flying for good → deleted — narrowed by D287: person and account | P-Out "A posting out has four outcomes…" | stated |
| | (d) (3) posted to another workplace but still flies with us → he becomes SANS, still shown as posted out, his leave tracked by the other workplace — refined by D283 | P-Out "A posting out has four outcomes…"; P-Out "A man posted out as SANS…" | stated |
| | (e) (4) transferred to another squadron → future (D281) | P-Out "A posting out has four outcomes…" | stated |
| | (f) changes the Leave War's post-out sheet, whose one choice was "Archive on PO date" | — | detail |
| | (g) r: the sheet asks which outcome; the app does it on the posting-out date; each can also be done by hand later | P-Out "A posting out has four outcomes… (the agent's reading)" | stated |
| | (h) narrowed by D1709 for ground crew | P-Out "A ground-crew man cannot be posted out as SANS…" | stated |
| D227 | (a) each admin's bell is his own (D216's "he" read per admin) | P-Join "Each admin's bell is his own…" | stated |
| | (b) a new request lights every admin's bell; it goes out for an admin only once he has had the waiting list on screen | P-Join "Each admin's bell is his own…" | stated |
| | (c) another admin looking does not put it out | P-Join "Each admin's bell…" | stated |
| | (d) the Admin tab's count stays until the request is answered (D204) | P-Join "Each admin's bell…" | stated |
| | (e) r: "on screen" is Admin → Users itself — on a desktop the Admin tab at once; on a phone only once he taps into Users | P-Join "Each admin's bell… (the agent's readings)" | stated |
| | (f) r: stored with the request (which admins have seen it), so it survives a reload, and goes when the request is answered | P-Join "Each admin's bell… stored with the request…" | B4 |
| D226 | (a) the callsign/name stays at 14 letters, and the box says so — it never quietly cuts a name | P-Join "The callsign/name stays at 14 letters…" | stated |
| | (b) more than 14 on the sign-up or on Admin → Users' New person is refused with the reason ("at most 14 letters") shown on the form, so the person picks a short form | P-Join "The callsign/name stays at 14 letters…" | stated |
| | (c) the robustness doctrine; Fable's plan read found the 15th letter dropped | — | detail |
| | (d) keeps D219's one field and the Quals callsign box's 14 | P-Join "The callsign/name stays at 14 letters, as the Quals callsign box does…" | B6 |
| D225 | (a) initials are asked but never required — on the sign-up and on Admin → Users' New person alike | P-Join "Initials are asked but never required…" | stated |
| | (b) a blank is filled in later on Quals, as today | P-Join "Initials are asked…" | stated |
| | (c) D214's "ill need his initials" stands as the reason the field is asked on both forms | — | detail |
| | (d) sets aside the agent's plan (required on both) and its recommendation (required on the sign-up) | — | detail |
| D224 | (a) the new-person mock-up is approved — the design of record for [ACCOUNTS-NEW-PERSON] | P-Set "The new person and the sign-up…" | stated |
| | (b) its content: the sign-up asking callsign/name, initials, Pilot / WSO / Personnel, CAT | P-Join "The sign-up card (Request access) and Admin → Users' New person ask the same things…" | stated |
| | (c) its content: the admins' bell | P-Join "A new access request notifies the admins…" | stated |
| | (d) its content: "On the roster / New person" on Admin → Users' approve | P-Join "A new user joins either way… links him to a puck"; P-Join "Admin → Users can create a brand-new person… the same "New person" is offered when approving a request" | stated |
| | (e) its content: "On the roster / New person" on Admin → Users' add | — | superseded — D322, 27 Sep 26 ("Add a person" makes a New person only) |
| | (f) its content: Quals' "+ Add person" a button to Admin → Users | P-Door "Quals keeps quals… Quals' "+ Add person" is a button to Admin → Users" | stated |
| | (g) settles D214's "a mock-up first" | — | spent |
| | (h) the work route: planned on Opus, red-teamed by Fable and Astra, built, walked and FULL-checked, his look and "merge live" | — ([ACCOUNTS-NEW-PERSON] archived, built) | spent |
| | (i) r: the template's "[or: change X]" left unfilled, read as approved as drawn — a change he names later is a new ruling | P-Set "The new person and the sign-up…" | stated |
| D223 | (a) the sign-in keeps its password box until the database step, when Microsoft's sign-in replaces the whole page | P-Acc "The sign-in keeps its password box…" | stated |
| | (b) it stands for the defence-mail sign-in (D166 (2)) | P-Acc "Today's sign-in screen stands for the defence-mail sign-in…" | stated |
| | (c) only the two seeded sign-ins check it; the app never stores a password | P-Acc "The sign-in keeps its password box…" | stated |
| | (d) r: his "ok" took the recommendation — "remove it" reverses this | P-Acc "The sign-in keeps its password box…" | stated |
| D222 | (a) on the sign-up card only, the first field reads "Displayed callsign/name" | P-Join "The field that names a person reads "Callsign/Name"… on the sign-up card only it reads "Displayed callsign/name"" | stated |
| | (b) so the person knows it is the name everyone sees on the schedule | — | detail |
| | (c) narrows D219 for that one card; Admin → Users and Quals keep "Callsign/Name" | P-Join "The field that names a person…" | stated |
| | (d) r: a new label on the one field, not an extra field | P-Join "The field that names a person… a new label on that field, not a second one" | stated |
| D221 | (a) with guest access on, the waiting screen offers a button into the guest view, with no signing out and in again | P-Join "With guest access on, the waiting screen offers a button…" | stated |
| | (b) with it off, no button | P-Join "With guest access on…" | stated |
| | (c) replaces the agent's look-card reading (waiting screen until he signs in again) | — | detail |
| | (d) r: the button reads "View the schedule" | P-Join "With guest access on… the agent's readings: the button reads "View the schedule"" | stated |
| | (e) r: a line saying he can look while he waits; the guest view keeps its Sign out | P-Join "With guest access on…" | B5 |
| D220 | (a) the seat choice reads "Pilot" and "WSO" — no (FCP) / (RCP) — wherever a new person's seat is asked, the sign-up and Admin → Users | P-Join "The seat choice reads "Pilot" and "WSO"…" | stated |
| | (b) "Personnel (ground crew)" as it was | P-Join "The seat choice…" | stated |
| | (c) he named only the two | — | detail |
| D219 | (a) the field that names a person reads "Callsign/Name" | P-Join "The field that names a person reads "Callsign/Name"…" | stated |
| | (b) a man with no callsign — ground crew, for one — goes by his name in the same field | P-Join "The field that names a person…" | stated |
| | (c) r: it is one field — the label on his puck, what every screen shows for him | P-Join "The field that names a person… the agent's readings: it is one field…" (stated as his rule at `c9bcf22fa`) | A8 |
| | (d) r: relabelled wherever the app asks for or heads it — the sign-up, Admin → Users' add, approve and account editor, the Quals column head | P-Join "The field that names a person…" | A8 |
| | (e) r: no separate "name" field beside it, the sign-up's "Name" box giving way to initials | P-Join "The field that names a person… it is one field…" | stated |
| | (f) narrowed by D222 for the sign-up card | P-Join "The field that names a person…" | stated |
| D216 | (a) a new access request notifies the admins, beyond D204's count on the Admin tab | P-Join "A new access request notifies the admins…" | stated |
| | (b) r: the admin's top-bar bell lights, desktop and phone | P-Join "A new access request…" | stated |
| | (c) r: as it does for a new bug report | — | detail |
| | (d) r: a tap says "N waiting for access" and takes him to Admin → Users | P-Join "A new access request…" | stated |
| | (e) r: it goes out once he has opened that list; the Admin tab's count stays until each request is answered | P-Join "Each admin's bell is his own…" (as D227 reads it per admin) | stated |
| | (f) r: a member's bell never lights for it | P-Join "A new access request…" | stated |
| | (g) r: at the database step it also becomes a Teams message (D204) | P-Join "A new access request…" | stated |
| D215 | (a) a guest sees what a member sees on View-only Sched, read only | P-Join "A guest sees what a member sees on View-only Sched…" | stated |
| | (b) a published day as issued, a day not yet published as it stands now | P-Join "A guest sees what a member sees…" | stated |
| | (c) with D213, its medical inputs too | P-Join "A guest sees what a member sees… its medical inputs too (below)" | stated |
| | (d) changes the agent's reading of D204, built as published days only | — | detail |
| | (e) r: read only means no buttons — no working-draft picker, no ⓘ day panel, no warning list, no pending list | P-Join "A guest sees what a member sees…" | stated |
| | (f) r: the switch stays the admin's and off by default | P-Join "A guest sees what a member sees…" | stated |
| D214 | (a) Admin → Users can create a brand-new person with his account, in one step — callsign, initials, Pilot / WSO / Personnel and CAT — making his Quals row and his account together | P-Join "Admin → Users can create a brand-new person…"; P-Join "The sign-up card… and Admin → Users' New person ask the same things…" | stated |
| | (b) a mock-up first, then the build and its own check | — (D224 approved it; [ACCOUNTS-NEW-PERSON] built) | spent |
| | (c) r: the same "New person" is offered when approving a request, filled from what he typed | P-Join "Admin → Users can create a brand-new person…" | stated |
| | (d) r: the rest of his Quals row (flight, quals) is set on Quals | P-Join "Admin → Users can create…" | stated |
| | (e) r: the new person goes through the same add Quals uses — the one callsign rule, never a second copy | P-Join "Admin → Users can create…" | stated |
| | (f) re-stated and settled: the admin's form and the sign-up ask the same things, so approving a request makes his Quals row from what he gave | P-Join "The sign-up card… ask the same things…" | stated |
| | (g) nothing built before he approves the mock-up | — | spent |
| D213 | (a) a guest sees a medical input as members do — its type and remarks on the schedule he sees | P-Join "A guest sees a medical input as members do…" | stated |
| | (b) narrows D211's reading (2), now set aside by his word; D211 itself stands | P-Join "Every member sees a medical input's type…" (cites D213) | stated |
| | (c) r: what changes is the medical row on the schedule — type, times, remarks, as a member reads it | P-Join "A guest sees a medical input… the agent's readings: its times too…" | stated |
| | (d) r: still no door to a document, the Inputs page or the medical view — none mounted for a guest | P-Join "A guest sees a medical input…" | stated |
| D211 | (a) every member sees a medical input's type, remarks and documents, as today | P-Join "Every member sees a medical input's type, remarks and documents…" | stated |
| | (b) re-confirms the 27 Aug 26 rule and sets aside the database brief's "the person and admins only", chosen knowing the database step then departs from that rule | P-Join "Every member sees…" | stated |
| | (c) sets aside the medical half of D169's reading | P-From "The scheduler's: members see the full change history, a medical change in full too…" | stated |
| | (d) sets aside the agent's recommendation (type and times only) | — | detail |
| | (e) r1: the change history shows a medical change in full to members too | P-Join "Every member sees… (the agent's reading)" | stated |
| | (f) r2: a guest still sees no medical detail | — | superseded — D213, 26 Sep 26 |
| D204 | (a) a new user joins either way | P-Join "A new user joins either way…" | stated |
| | (b) (1) the admin adds him first — defence mail, the puck (callsign) it belongs to, member or admin — his first sign-in having that access at once | P-Join "A new user joins either way…" | stated |
| | (c) (2) or he asks — signed in but on no list, he sees "Request access" | P-Join "A new user joins either way…" | stated |
| | (d) (2) "Request access" asks only for callsign and name | — | superseded — D214, 26 Sep 26 (P-Join "…the sign-up no longer asks only callsign and name") |
| | (e) the sign-in already gives the defence mail, which cannot be faked | — | detail |
| | (f) the admin is notified — a badge on the Admin tab, a Teams message at the database step | P-Join "A new access request notifies the admins beyond the Admin tab's count… a Teams message" | stated |
| | (g) the admin approves, sets member or admin and links him to a puck — a typed callsign never claims a puck by itself | P-Join "A new user joins either way…" | stated |
| | (h) either way the admin changes his role, his puck or switches the account off later | P-Join "A new user joins either way…" | stated |
| | (i) r: while waiting he sees the waiting screen | P-Join "While he waits he sees the waiting screen…" | stated |
| | (j) r: an admin switch, off by default, can let people waiting see the programme read only as a guest, off because anyone who reaches the app could then read it | P-Join "While he waits…" | stated |
| D200 | (a) [ACCOUNTS] carries the permissions work | P-Roles "One place in the app answers… built with [ACCOUNTS]…" | stated |
| | (b) (1) D149 built there — the own-row gate at the page and the write path, a test per column | P-Roles "One place in the app answers… a member's own Quals row held at the page and the write path, a test per column" ([ACCOUNTS], [QUALS-MEMBER-SCOPE] archived) | spent |
| | (c) (2) the permissions table (data model §11, what IT builds the security roles from) matches every ruling | P-Roles "One place in the app answers… mirroring the data model's permissions table…, which matches every ruling" (stated as past work at `c9bcf22fa`) | B12 |
| | (d) (2) its examples — a member's own Person row, the change history readable by members, accounts tied to callsigns, OIL awards admin-only with who and when | — | detail |
| | (e) (2) "a medical input's details excepted" from the change history | — | superseded — D211, 26 Sep 26 |
| | (f) (3) one place in the app answers "may this person do this?", mirroring the table, with a test that fails when the two disagree | P-Roles "One place in the app answers…" | B12 |
| | (g) (3) so the server's rules at the database step are a translation of an agreed list | — | detail |
| | (h) all three inside the [ACCOUNTS] work, the table's two stale lines corrected there | — ([ACCOUNTS] archived) | spent |
| D218 | (a) on Quals only an admin changes a callsign | P-QualsWho "On Quals a member edits his own row only… but three, each an admin's: the callsign…" (said three times at `c9bcf22fa` — M3) | stated |
| | (b) a member still edits everything else on his own row — initials, flight, CAT, SXO, SANS, every qualification | P-QualsWho "On Quals a member edits his own row only…" | stated |
| | (c) "everything else" including SCHEDULER | — | superseded — D1651, 5 Nov 26 (and the Management column, D1510, 29 Oct 26) |
| | (d) renaming stays on Quals and stays a label: every puck, the history and his account follow it | P-QualsWho "A callsign's rename stays on Quals…" | stated |
| | (e) narrows D149 (the callsign taken out) | cited on P-QualsWho's first bullet | stated |
| D166 | (a) build accounts in the app now, shaped as the real thing will be | P-Acc "Accounts are built in the app now, shaped as the real thing…" | stated |
| | (b) (1) the Admin tab creates and manages accounts — each a sign-in name, admin or member, and the callsign it belongs to; an admin creates new admins and members | P-Acc "Accounts are built in the app now…" | stated |
| | (c) (1) it replaces the two fixed logins and merges the Admin tab's "Manage users" list | — ([ACCOUNTS] archived, built) | spent |
| | (d) (2) today's sign-in screen stands for the defence-mail sign-in: the sign-in name plays the address, its password the organisation's | P-Acc "Today's sign-in screen stands for the defence-mail sign-in…" | stated |
| | (e) (2) at the database step Microsoft's sign-in, with an authenticator, replaces it, and nobody signs in a second time | P-Acc "Today's sign-in screen…" | stated |
| | (f) (2) the only piece left to IT is tying each account to the real address (D165) | P-Acc "Today's sign-in screen… the one piece left to the IT side being to tie each account to its real address" | B14 |
| | (g) (3) signing in makes you that callsign; "View as" goes | P-Acc "Accounts are built in the app now… "View as" another person is gone…" (said in two bullets at `c9bcf22fa` — M1) | stated |
| | (h) (3) and with it the admin's role toggle's reason to pick a person | — | detail |
| | (i) (3) no "preview as a member" | — | superseded — D292, 27 Sep 26 |
| | (j) (4) the Leave War follows the signed-in callsign: a member bids only on his own row | P-Acc "Accounts are built in the app now…" | stated |
| | (k) (5) everything that records who did something names the callsign — the edit record, the pending list, the hand over | P-Acc "Accounts are built in the app now…" | stated |
| | (l) r: permissions work, so the FULL bug check | — | spent |
| | (m) r: the demo passwords are not security, and never real ones | P-Acc "Today's sign-in screen… the agent's readings: the demo passwords are not security and never real ones" | B14 |
| | (n) r: accounts, like all data, live in one browser until the database | P-Acc "Today's sign-in screen…" | stated |
| | (o) r: the order proposed — the smaller inputs, then accounts, then the hand over | — | spent |
| D165 | (a) his plan: everyone signs in with his own defence-mail account | P-Acc "His plan for the database step…" | stated |
| | (b) an admin creates each person in the app — callsign, name, admin or member — and ties it to that person's defence-mail address | P-Acc "His plan for the database step…" | stated |
| | (c) "View as" goes away, because every account already is a callsign | P-Acc "Accounts are built in the app now… every account already is a callsign, as his plan for the database step has it" (M1) | stated |
| | (d) it answers the data model's open question 3: the first sign-in with that address becomes that person | P-Acc "His plan for the database step…" | stated |
| | (e) it decides the hand over's end state: each person sees "what changed since you last looked" | P-Acc "His plan… with personal accounts the hand over shows each person what changed since he last looked" | B13 |
| | (f) r: getting into the app at all is granted in the organisation's Microsoft set-up by whoever administers it | P-Acc "The agent's readings of that plan, told to him…" | stated |
| | (g) r: inside the app he manages the people list | P-Acc "The agent's readings of that plan…" | stated |
| | (h) r: the agent never sets up the tenant, the accounts or any login | P-Acc "The agent's readings of that plan…" | stated |
| | (i) r: that is his helper's side, with the Dataverse hand-over document as their brief | — | detail |
| | (j) r: real names and e-mail addresses live only in the organisation's environment, never in this repository | P-Acc "The agent's readings of that plan…" | stated |
| D149 | (a) on Quals a member edits his own row only — never another person's | P-QualsWho "On Quals a member edits his own row only…" | stated |
| | (b) every column of his own row — CAT, SXO, SANS, every qualification | P-QualsWho "On Quals a member edits his own row only…" | stated |
| | (c) the callsign among his columns | — | superseded — D218, 26 Sep 26 |
| | (d) SCHEDULER among his columns | — | superseded — D1651, 5 Nov 26 (Management, D1510) |
| | (e) so members keep their own qualifications up to date themselves | P-QualsWho "On Quals a member edits his own row only…" | stated |
| | (f) narrows the 5 Aug 26 rule, which let a member edit any row with editing on | — | detail |
| | (g) sets aside the recommendation that SXO be admin-only: no harm on one's own row (a member still cannot sign) | P-QualsWho "On Quals a member edits his own row… SXO…" | stated |
| | (h) to build: the own-row gate at the page and the write path, a test per column, FULL tier | — (built with [ACCOUNTS]; [QUALS-MEMBER-SCOPE] archived) | spent |

## The old head, the "Also read" paragraph and the "From the Leave War" list, item by item

| Item at `97eaa5251` | Where on the page | Mark |
|---|---|---|
| Head: loads by itself whenever a session reads an accounts, sign-in, Admin → Users, Quals, one-door or posting file — and open it yourself before planning such work | P-head "Loads by itself whenever a chat reads…" | A1 (the `paths:` never closed at `c9bcf22fa`, so it would not have loaded) |
| Head: its rulings moved here from How we work and the scheduler file on 28 Sep 26 (D390) | P-head "These rulings moved here from How we work and the scheduler file on 28 Sep 26…" | stated |
| Head: the general rulings in `how-we-work.md`, loaded in every session; the map of every ruling and how to add or retire one: `DECISIONS.md` | P-head "The general rulings are in…" | stated |
| Head: one line per ruling — its number, its date, the rule as it stands (D390) | P-head "Each line is a rule as it stands today; the numbers after it are the rulings that set it" (the page's shape, D1735) | stated |
| Head: its full row is in `.claude/decisions-full/people-accounts.md`, never loaded; open it before acting on a ruling's detail or asking him; the grep line; the Grep tool hides a long row | P-head "Each line is a rule… open the row before acting…" | stated |
| Head: a "— changed by" tail names the later rulings that changed it; newest first | — the table's own furniture; on the page each statement cites its changers (the gate's rule) | spent (the page shape, D1735) |
| Also read: `tracker.md` D981 — a man deleted through Post out leaves every Tracker course with events still to do, and stays, his record kept, where all of his are | P-From "The Tracker's: a man deleted through Post out…"; checked against `tracker.md` D981 and its full row: true | stated |
| Also read: the Leave War's posting sheets and stints: `.claude/rules/seams/leave-war.md` | P-head "The Leave War's architecture — its own store and storage seam…"; the seams file holds neither the posting sheets nor the stints | B16 |
| Also read: what a published day keeps when a man is deleted or archived: `scheduler.md` (D44, D45) | P-From "The scheduler's: who was behind a placeholder puck is frozen at publication…" [D44, D45, D103]; checked against `scheduler.md`: true | stated |
| Also read: a Quals column heading dragged to the table's edge scrolls it sideways: `inputs.md` (D893) | P-From "The Inputs pages': a column heading dragged on Quals…" [D893]; checked: true | stated |
| Leave War 1: a Delete-outcome posting and moving his already approved leave [D1555] | P-From "The Leave War's: a posting out with the Delete outcome refuses approving his leave from its date, but not moving leave of his already approved" [D1555, D1545]; checked against `leave-war.md`: true | stated |
| Leave War 2: a Delete-outcome posting refusing his leave from its date [D1545] | P-From, the same bullet (items 1 and 2 merged) | stated |
| Leave War 3: a posting-out date refusing no leave on the war [D1541, D1545] | P-From "The Leave War's: a posting-out date refuses no leave on the war…" [D1541, D1545]; checked: true | stated |
| Leave War 4: a man deleted before arriving — his leftover leave line's words [D1521] | P-From "The Leave War's: a man deleted on Admin → Users before he ever arrived keeps his leftover leave line's words…" [D1521]; checked: true | stated |
| Leave War 5: the Management tick column already on Quals [D1502] | P-From "The Leave War's: the Management tick column is already on Quals…" [D1502]; checked: true | stated |
| Leave War 6: the M4 readings, among them a deleted man's leftover pending leave [D1447, D1541, D1460] | P-From "The Leave War's: the M4 readings stand as built…" [D1447, D1541, D1460]; checked: true | stated |
| Leave War 7: the Leave War's runner an admin; no Leave-War-only role [D1223] | P-From "The Leave War's: whoever runs it is given an admin account…" [D1223]; checked: true | stated |
| Leave War 8: SANS men on the war only by "+ SANS", in place of Show SANS [D1215, D1221] | P-From "The Leave War's: SANS men are off the war unless the admin puts them on with "+ SANS"…" [D1215, D1221]; checked: true | stated |
| Leave War 9: the war's Management group from a Quals tick column [D1200, D1502] | P-From "The Leave War's: its Management group comes from that Quals column…" [D1200, D1502, D1149]; checked: true | stated |
| Leave War 10: a Management group on the war, filled from Quals [D1149, D1200] | P-From, the same bullet (items 9 and 10 merged) | stated |
| Leave War 11: no Edit person on the war — seat, band, SXO on Quals [D461] | P-From "The Leave War's: it has no "Edit person"…" [D461, D460]; checked: true | stated |
| Leave War 12: Quals' SXO tick the one source; the war reads only [D460, D461] | P-From, the same bullet (items 11 and 12 merged) | stated |

## The pointers on the page that are new

Each checked against its ruling in its own area today — its short line and, where the pointer says more, its full row:
no more, no less, no other than that area says.

| Pointer (P-From unless named) | Area | Mark |
|---|---|---|
| a man posted out as SANS wears the SANS purple line on his name's chip from when the posting is set; Balances and Approvals from his date [D1692, D1697, D1698, D1711] | Leave War | true |
| Approvals reads "posting out 1 Mar · Overseas Sqn", where he goes named [D1446] | Leave War | true |
| a man's last day in is a yellow line; an entry filed after his posting out over faint dark stripes; a bare "PO" on a gone day [D1728, D1729, D1730, D1720] | Leave War | true |
| Post out and Post in, with Grant OIL, behind the bid window's one "⋯" [D1326] | Leave War | B27 (fixed) |
| the "Viewing as <callsign>" chip gone [D1173] | Leave War | true |
| the clash note's link for a man with no row on the war [D1542] | Leave War | true |
| the pinned dates row and Quals' header take the row's place in the same frame; the painted frame left a job of its own [D1789, D1850] | Leave War | true |
| deleting a man lists everything the delete took away in the changes window [D337, D710] | scheduler | A7 (new) |
| a man's CAT, seat and posting on his puck stay as published until the next AL; a rename updates at once [D186] | scheduler | true |
| an admin picks all four sign-offs' names; who is offered comes from the Quals ticks [D212] | scheduler | B19 (fixed) |
| members see the full change history, a medical change in full [D169, D211, D213]; a Quals change dated the day it was made; someone given access later starts with nothing new [D338] | scheduler | B18 (fixed) |
| every bell line is taken back by the undo of what made it [D1693, D1699, D1710] | scheduler | true |
| a new person's Post in date opens the app's one date calendar, weeks starting Monday [D796, D797] | scheduler | true |
| a flying line with only its front seat filled; the back-seat switch an aircraft-type setting [D1099, D1100, D1101] | scheduler | B18 (fixed) |
| each person reopens the Tracker on his own last course, chart and student; the admin's member view the same person [D376] | Tracker | true |
| the screen after asking for access — look B's pass and look A's steps [D1649, D1650, D1654, D1656] | design | true |
| the "Not saved — keep this page open · Retry" band on that screen, the guest page and the sign-in [D1657, D1664] | design | true |
| the app is called TALON, not RAPTOR; the claw 7px nearer the name [D1590, D1606, D1608] | design | B17 (fixed) |
| Admin → Users' dots carry no band — no mark glows [D887] | design | true |
| the posting's delete asks its second step in a card hanging from the control [D1627, D1628] | design | true |
| on a phone the page never zooms; Quals one of the grids with its own pinch [D1567] | design | true |
| Quals' pencil the app's one drawn pencil; its search box the Edit Schedule week's look [D1134, D1127]; undo and redo move Quals to a row only when it is not wholly on screen [D672] | design | true |
| a scheduler is always an admin; the admin's member view a member while it is on [D785] | How we work | true |
| the one undo does not take back adding a person, archive, Restore, delete or a posting; Undo steps back only through one's own changes [D350, D148] | How we work | true |
| "Clear edit history…" removed at the database step [D1752] | How we work | true |
| a security read on any change to sign-in, permissions or what one person sees of another [D1411] | How we work | true |
| at the move each aircraft type's deployment set by a setting, not by code [D1536, D1537] | How we work | B24 (fixed) |
| no tables, security roles or day-lock flow on his M365 before the database step; his test account to match the IT side's restrictions [D1662, D1749, D1571, D473] | How we work | true |
| what does not read the one table is one item for the database step [D1587, D473] | How we work | true |
| D103 added to the D44, D45 pointer — any pending change wipes the sign-offs | scheduler | true |

**The search of the other areas by subject** (delete, archive, posting, SANS, Quals, account, sign-in, guest, member,
callsign, squadron, aircraft type): found only D337 and D710 missing (A7). Nothing else in another area bears on this
one that the page does not point to.

## Count

Counted from the tables above by a script (each row of the account table one part; its last cell the mark), not estimated.

- **Rulings accounted: 80** — all live; one recommended for the archive (D1108, restated in full by D1110, a fresh
  reader to check it first); D1546, D309 and D224 stay live (Not settled (c)).
- **Parts accounted: 553** across the 80 rulings: **424 stated** on a line, **37 that were in a gap** (12 under an A, 25
  under a B), **31 spent**, **41 detail** and **20 superseded** by a later ruling (each named with its date).
- **The old head, "Also read" and the Leave War list: 22 items** — 19 stated, 1 spent (the table's "— changed by"
  furniture), 1 under A1 (the head's "loads by itself"), 1 under B16 (the seams pointer).
- **The pointers on the page that are new: 30** — 23 true as written, 1 added (A7), 6 made true (B17, B18 twice, B19,
  B24, B27).
- **Gaps: 35** — 8 that drop, bend or double a rule part (A1–A8), 27 smaller (B1–B27); and 10 rules stated twice, merged
  (M1–M10). All fixed on the page.
- **After the fixes:** `node raptor-port/scripts/backlog-archive.mjs --rulings` says "done; the inventory is clean"
  (it first asked for two citations, D213 on the D169 pointer and D1101 on the D1099 pointer — both added, B18); the
  gate's page-shape check, which now runs (A1), finds no problem: 165 statements, the longest 520 characters.
  `npm run docsize` fails on one thing only — the page is **47,201 bytes against its 22,000 tripwire** (25,201 over;
  44,211 at `c9bcf22fa`). No part was cut to fit; the tripwire is left for the host.
