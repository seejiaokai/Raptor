# DRAFT — the general rulings ("how we work") as a "how it works now" page (rules-diet sample, 7 Nov 26)

**Not in force.** A sample for the rules-diet plan (`2026-11-07-rules-diet-plan.md`, D1732), written to measure the method
on the file every chat loads before he rules. The rules in force are `.claude/rules/decisions/how-we-work.md` and its full
rows. Below `=== THE PAGE ===` is what the new `how-we-work.md` would hold; after it, the account of every ruling it
replaces. Rules the five always-loaded checklists carry (recording, shipping, plain language, the bug check, where facts
go) are named here by number only, so each rule is stated once.

=== THE PAGE ===

# How we work — the general rulings as they stand (loaded in every chat)

Each line is a rule as it stands today; the number after it is the ruling that set it. His words, the readings he was
told and the history: the full rows, `.claude/decisions-full/how-we-work.md` — open the row before acting on a rule's
detail or asking him about it (`grep -h '^| D90 |' .claude/decisions-full/*.md`, the shell). Before telling him anything
is undecided or missing: search the full rows, `DECISIONS-ARCHIVE.md` and `OUTSTANDING.md` too [D53].
**Stated in the always-loaded checklists, not repeated here:** recording rulings (`record-decisions.md` — D13, D14, D29,
D53, D90, D138, D201, D970, D971); shipping and checks (`shipping.md` — D60, D78, D143, D151, D228, D302, D822, D902, D1086,
D1087, D1088, D1089, D1090, D1091, D1093, D1097, D1407, D1640); speaking and showing him (`plain-language.md` — D853, D904,
D906, D921); the bug check (`bug-check.md` — D5, D7, D9, D56, D607, D608, D790, D903, D1297, D1734); where facts go
(`doc-structure.md` — D137, D140, D611, D802, D975).

## Models and readers
- Opus 5.5 plans and builds; never the writer reads its own work; what Codex builds, Opus reads [D67].
- Every code read: a fresh, blind Opus read [D790]. Astra and Sol 6.1 only when he calls for them, each time; a job that
  would have had one goes on the reads-owed list, `[NO-ASTRA-LIST]` [D1734, D761]. Fable for nothing unless he calls [D903].
- Scenarios are designed by a reader other than the builder, and Opus runs them in the app [D6]. Scenario design and side
  questions: one reader (a fresh Opus reader unless he calls Astra); an important plan or risky code: two — Sol 6.1 keeps
  the second seat when he calls the ChatGPT readers [D353, D590, D601, D1734]. A working-guide change is read before his approval, one round each, never by its writer
  [D70].
- Sonnet 5.5 walks the app, runs the checks and does document chores, the host checking the results — it never reads code
  for bugs; Opus does not walk [D588, D787]. A cheaper-model trial stays small and the agent decides and tells him [D595].
- The host opens every picture that decides something — a fault's cause, a fix's check, a finding — cropped to the area
  that matters; walkers look at the bulk [D1271, D1273].
- A security read (an extra fresh reader looking only for holes) on any change to sign-in, permissions or what one person
  sees of another; one full security review of the app before the database step [D1411].
- Every fault he found that a check missed becomes a case in the code reader's test set; a changed reader is scored on
  it and kept only if it catches as many [D1410].
- A reviewer's open findings outrank the planned job list [D23]; a reviewer's claim is a finding only with a concrete
  failure, its cause and its fix [D489].
- Correctness beats context economy: never skip or shrink a read to save context [D68].

## Checking the running app (detail: `raptor-port/docs/bug-check-order.md`)
- The bug-check order adapts to any kind of work [D12]; it owns the running app, the readers the plan and the code; the
  walk comes before the final read [D11].
- Every walk of a screen has a plain-user round: the area's everyday tasks end to end, every control that opens or closes
  pressed, every other place that should show the result looked at, with pictures [D1557]. On a phone, a picture right
  after each tap as well as the settled one; a standing test that a dense screen's controls never turn a pinned cell
  see-through [D1281].
- A long hand pass is fanned out across walkers, each in its own world, driving a scripted real browser [D16, D17].
- A slow-machine browser failure is fixed by waiting on what the test needs, never a fixed time [D87]; a Leave War desktop
  timeout on GitHub gets one re-run of the failed group [D84].
- A screen with an approved drawing is built to it and checked beside it as built and after every fix; the drawing check
  is a standing step, red until each difference is fixed or he rules to keep it, beside the look by eye and the walk
  [D1424, D1494, D1495]; differences go to him side by side, each marked, and he chooses — an outright fault is fixed
  without asking [D1426]; an approved part is drawn again from its drawing in a later round [D1478].
- Clearing the demo data is approved whenever it is the simpler path [D22].
- Every two weeks a one-page scorecard: faults he found after a change went live, changes undone or redone within two
  weeks, merges — each beside the two weeks before; speed counts only while the first two hold [D1409].

## Secrets and the repo
- The project's secrets scan is a required check on `main` (he switches it on from the steps given) and GitHub's own
  scanning is on; a key found in the history is changed, not only deleted [D1408, D1535, D1540].
- The repo is public until he says otherwise; his PC's runner stays stopped meanwhile; private again, it restarts and the
  checks return to his PC [D106, D89, D1530]. No public GitHub web address [D343]; the app is viewed on Vercel [D59].
- Two guards stand: a backgrounded npm command must move into `raptor-port` [D162]; the push-and-lock guard [D976].

## Showing him, asking him
- Anything new a person will see — a box, a message, a mark, a button — is drawn as a mock-up and shown before it is
  built, even inside a fault fix [D1625]. A picture for a question shows only what it is about, the change named on it
  [D1222]; a questions page puts what he should look at now at the very top — each open question in one line with its
  recommendation and a link to its pictures, newest first; answered and replaced ones leave the page [D1237, D1363]; product questions in small rounds, each with a
  recommendation and a picture [D541].
- When he offers a different solution mid-build: stop and answer it — what it does, its cost, a recommendation — before
  building on [D1613].
- Say at once when a feature cannot be done, or only differently, with a licence or the IT side, on a Power Apps code app
  on Dataverse [D1551]. Recommend the right design — intuitive, fits the workflow, the same everywhere, fewer places for a
  bug — never the easiest; say its cost and which rulings it changes [D754].
- The questions the backlog keeps for him are not put until he says so [D994].

## Design (the guide: `raptor-port/docs/design-practices.md`)
- What the app is: an all-in-one that makes information flow and cross-checks; schedulers mostly at a desk, members mostly
  on phones [D820]. The look: the Raptor style made cleaner the way Apple's are, intuitive enough to need few instructions
  [D821]; smooth motion counts as part of quality [D991]; button sizes do not change without his word [D487].
- One combined design guide for all interface work, the design skill (Impeccable) on top for a design job; his rulings
  win [D812, D813, D819]; a mock-up uses the app's own parts [D1496].
- Text that only says what the screen already makes plain is named in every look and recommended for deletion [D846,
  D847]. His design corrections become lessons in the guide the same day, in his words, read by one fresh reader and named
  in the closing report; a branch adding lessons takes a number range first [D852, D941, D1417]; his first lesson stays
  struck [D942].
- Jobs of their own, later: the wording pass [D808]; the minimal-interface design [D765]; the consistency looks, each
  mismatch put to him with pictures before it changes [D1124, D1508]. The writing guide governs how the agent writes to
  him [D835].

## Order of work
- Features first, grouped by area; an area's small finds and tidy-up ride with its batch; one whole-app check at the end
  [D490, D485]; architecture before individual bugs [D144]. The backlog's priority list shows only what is open, one line
  an item [D1024]; the sized plan's fix nights first, the pictures round after [D1717].
- The original batch order stays the reference: work-hours, Insights, workflow UI, inputs, Tracker, caps and ops (started
  only on his word), the whole-app check [D495, D568]; the earlier builds' re-test as a person uses them has the Leave War links left,
  with the 7 Sep phone check [D4, D147]. No guide for bringing a third app in as a tab until one comes [D73]. No tidy-up deletes the SANS layout's
  branch, records or pictures [D610].
- Not started until he says: the Tracker's progress graph [D774]; the M365 hosting trial (until his test account) [D1682];
  the Tracker's and Leave War's tidy-ups are jobs of their own [D775, D493].
- Outside skills are never installed whole — their practices are fused into our guides [D486, D491]; guides and automatic
  tools stay readable by any model [D623]; Impeccable moves to v4.1.3 by its vendoring note's steps [D625]. Codex alone
  uses the proportional framework [D499].

## The platform and the database
- The database comes at the end, once the features are built; the table list is kept true as each feature is added; he
  writes the table format with his AI for the IT side [D473]. Work needing IT's confirmation waits for it, and he is told; the day and request tables' hand-over waits for IT's
  written answer [D466, D465]. After the connection, group B is tuned against the real database, the lock's screens last
  [D453].
- The target: a Power Apps code app on Dataverse on his M365; every user holds Power Apps Premium [D1570]; the tables are
  the one master of saved data [D1580]; what does not read the one table is one item for the database step [D1587]; no
  tables, roles, day-lock flow, setup script or sign-in test on his M365 before then [D1571, D1662]; the hosting trial is
  the app without a database [D1532]. At the move: aircraft type by a setting, the code check every session, a medical
  change shown whole in the history, a clean copy for the PPCoE [D1536]; strict value checking area by area, the rules
  engine word for word [D1537].
- React Doctor: run the kit's way [D1533]; findings fixed with each area's batch, new code clean [D1534]; it runs on every
  pull request and at each session's end [D1539]; the 31 old walk-script errors fixed before the next full run [D1572];
  mock-up pages and the original app not counted [D1716].

## Long runs, compaction and handoff
- `/overnight` sizes the night to his hours, he selects, its questions come first, then it runs unattended in one chat
  [D867, D869]; it lists the night's jobs before it starts [D1443]; asks "Low or Medium?" [D1104]; each job a fresh helper,
  the night's chat coordinating [D1416]; it goes on past 90% of the weekly allowance, saving at every step [D1415]; using up
  the allowance is his aim [D1033].
- Unattended: a question never stops the run — search the rulings, decide technical points, park his choices in one list;
  one notification at the end; no merge, no `main` [D596]; at a full chat, write the state and carry on [D667].
- Every chat compacts at about 400,000 tokens (first note about 300,000; held until saved from about 360,000) [D1671,
  D878]; from the first note the agent picks a clean point itself — work committed, state written — so a big job compacts
  once, and if the job is nearly done while he is using the chat it offers a handoff instead [D868, D871, D874]; the guard is off when he is away [D872]; idle compaction
  stays on [D884]; a guide missing after compaction → ask him to type `/reload-skills` [D885]; he runs the guide check
  himself [D886].
- After an hour away from a chat past about 30% full, suggest a fresh chat from the handoff [D1554]; a chat started from a
  handoff has Remote Control on [D1195]. Write the state into the repo as you go; condense it in its own docs-only commit
  [D69]. The handoff file keeps only the newest gate count [D1733].

## Names and privacy
- The bare squadron number only; never the squadron or service abbreviation [D58]; "a fighter squadron", the bare
  "F-15" [D63]; the Tracker's syllabus data is outside every privacy sweep [D62]; the commander briefing deck stays [D57].

## App-wide product rules (to move to their area pages)
- Undo reverses only the signed-in person's own changes, refusing where someone has since changed the same thing [D148];
  it does not take back adding a person, archive, restore, delete or a posting [D350]; "Clear edit history…" stays until the
  database step [D351]. A scheduler is always an admin [D785]. To the OIL page: OIL is earned leave, never pay [D25]; an issued weekend
  carrying a placeholder raises the pending mark — leave it [D54].

=== END OF THE PAGE ===

## The account — every ruling of today's `how-we-work.md` not cited on the page

Every other ruling of the file is cited above. These are not; each disposition is **proposed**, to be
confirmed by the conversion's fresh reader against the full row (D971: a ruling restated in full, a replaced one or a spent
permission leaves for `DECISIONS-ARCHIVE.md`, still searched):

| Ruling | Proposed | Why |
|---|---|---|
| D136, D141, D390 | **replaced** by the ruling that approves this plan | they keep every ruling as a loaded line and forbid size aims — the two things the diet changes |
| D1732 | cited by that same ruling; **spent** when the diet is done | the job itself |
| D203 | **restated in full** by D453 and D473 | its order is theirs; each step it named is done or theirs |
| D1531 | **restated in full** by D1533 and D1534 | "may be run" is D1533's wider form |
| D905 | **restated in full** by D906 | the link "when ready for his look" is D906's first clause |
| D602, D766, D811, D832, D870, D969, D972, D973, D974, D1556, D1566, D1659 | **spent** | a one-off job, approval or exception, each done and live |
| D86 | **spent** | two chats for the 23 Sep re-test; the lock that replaced its rule is D228 |
| D8, D10, D72 | **spent** (history) | where the bug-check order came from; the old bug-testing list's retirement |

**Sizes** (the project's calibrated estimate, `docsize.mjs` `estTokens`): today's `how-we-work.md` 56,682 bytes, about
21,236 tokens → this page 12,577 bytes, about 4,873 tokens (−77%). 184 of its 207 rulings are cited on the page; the 23
above are proposed for the archive.
