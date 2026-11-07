# DRAFT — the general rulings ("how we work") as a "how it works now" page (rules-diet sample, v3, 7 Nov 26)

**Not in force.** A sample for the rules-diet plan (`2026-11-07-rules-diet-plan.md`, D1732), written to measure the method
on the file every chat loads before he rules. The rules in force are `.claude/rules/decisions/how-we-work.md` and its full
rows. Below `=== THE PAGE ===` is what the new `how-we-work.md` would hold; after it, the account of every ruling it
replaces. **v2** folds in the fresh Opus reader's findings on v1 (`../briefs/2026-11-07-rules-diet-plan-read-opus.md`):
no bare list of numbers (H1a), the clauses v1 dropped put back (H1c — D16, D874, D1530, D1536, D1554), every change mark
cited beside the ruling it changes (H1b — checked by the trial script of the plan's §5), and the archive list cut from 23
to 10 (H2). **v3** folds in Astra's blind read of v1 (`../briefs/2026-11-07-rules-diet-plan-read-astra.md`): D766 kept
live with its compaction clause; four rulings stated with the parts v2 dropped or widened — D148 (the list clears at sign-out;
another's change never undone; it says who), D493 (the Leave War's saved-data reading and its schedule link), D787 (Opus
never walks as a helper; the host's own short look stands), D486 and D491 (the skills he sent, not every outside skill).
This account is still by ruling; the real conversion's is by requirement (the plan's §2).

=== THE PAGE ===

# How we work — the general rulings as they stand (loaded in every chat)

Each line is a rule as it stands today; the numbers after it are the rulings that set it. His words, the readings he was
told and the history: the full rows, `.claude/decisions-full/how-we-work.md` — open the row before acting on a rule's
detail or asking him about it (`grep -h '^| D90 |' .claude/decisions-full/*.md`, the shell). Before telling him anything
is undecided or missing: search the full rows, `DECISIONS-ARCHIVE.md` and `OUTSTANDING.md` too [D53, D137].
The rules for recording his rulings, shipping, speaking to him, the bug check and where each fact goes are stated in the
other always-loaded files — `record-decisions.md`, `shipping.md`, `plain-language.md`, `bug-check.md`, `doc-structure.md` —
each line there citing its rulings; they are not repeated here. In every report, OIL is earned leave — time off banked,
never pay or money [D25, filed under OIL].

## Records
- Records state the decision, not the transcript: his words only where the exact words matter, otherwise one line, the
  date and a pointer; a condensed record never changes what the original meant [D14, D138, D141, D390].
- A ruling's rule is written in ordinary letters — capitals only where a name or a short form such as OIL has them — and
  no word is changed for it [D970].
- No size targets: the test is whether each piece is needed where it sits, organised and written clearly; a size ceiling
  is a tripwire — move what does not belong, or raise it with its reason; for a loaded rulings file it counts bytes [D141, D390].
- Each ruling's full row is kept whole in `.claude/decisions-full/`, searched, never loaded; it is opened before acting on
  a ruling's detail or asking him about it [D390]. The repo reads by relevance — a small general layer every chat, each
  area by itself — and keeps itself tidy, each new fact to its one home [D140, D141, D390].
- The scheduler's rulings stay one file, the Inputs pages' rulings in a file of their own; the split question came back
  when the file passed D611's mark, and he kept one file [D611, D802, D976].
- What a chat loads at its start is trimmed, never anything a job reads (D68): the every-chat rulings a later one restates
  in full are archived, the screen-design rulings load only for screen work, the Codex guide is short; after an hour away
  from a chat past about 30% full, the agent suggests a fresh chat from the handoff [D1554].
- The rules diet — the area rulings as pages of how it works now, the old rows archived but searched, the working rules
  and the bug-check order as one-page checklists — runs on Opus, its plan and sizes put to him before any change [D1732].
- From the 17 Oct start-size page: the skill-notes guide gets a short form, its wording read before he approves it; his own
  settings to switch off were listed for him; the scheduler split waits [D969, D976]. The handoff file keeps only the
  newest gate count [D1733].

## Models and readers
- Opus 5.5 plans and builds; never the writer reads its own work; what Codex builds, Opus reads [D67, D353, D590, D601, D790, D903].
- Every code read: a fresh, blind Opus read [D790, D903]. Astra and Sol 6.1 only when he calls for them, each time; a job that
  would have had one goes on the reads-owed list, `[NO-ASTRA-LIST]` [D1734, D761]. Fable for nothing unless he calls [D903].
- Scenarios are designed by a reader other than the builder, and Opus runs them in the app [D6]. Scenario design and side
  questions: one reader (a fresh Opus reader unless he calls Astra); an important plan or risky code: two — Sol 6.1 keeps
  the second seat when he calls the ChatGPT readers [D353, D590, D601, D790, D903, D1734]. A working-guide change is read before
  his approval, one round each, never by its writer [D70, D590, D811, D941, D1417].
- Sonnet 5.5 walks the app, runs the checks and does document chores, the host checking the results — it never reads code
  for bugs; a cheaper-model trial stays small and the agent decides and tells him [D588, D595]. The walkers stay Sonnet:
  Opus never walks as a helper, not even one share for comparison; the host still opens their pictures, reproduces every
  finding and may run a short look itself where the sizing step says a helper is not worth starting [D787].
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
- Driving the running app is the bug test; a code review plus green tests is not one [D5]. All three kinds of check — a
  code read, automated tests, a hand pass — scaled by what the change touches, the hand pass sized for each change [D7,
  D607, D608]. The order is the merged result of two independent proposals and replaced the three earlier methods — one method
  [D8, D10]; it adapts to any kind of work [D12]; it owns the running app, the readers the plan and the code, the walk
  before the final read [D11]. The old bug-testing list is retired: nothing adds to it, no handoff checks it [D72].
- Every walk of a screen has a plain-user round: the area's everyday tasks end to end, every control that opens or closes
  pressed, every other place that should show the result looked at, with pictures [D1557]. On a phone, a picture right
  after each tap as well as the settled one; a standing test that a dense screen's controls never turn a pinned cell
  see-through [D1281].
- A long hand pass is fanned out across Sonnet walkers, each in its own world, driving a scripted real browser; the host
  opens their pictures and reproduces every finding before it enters the evidence sheet [D16, D17, D588, D595].
- A slow-machine browser failure is fixed by waiting on what the test needs, never a fixed time [D87]; a Leave War desktop
  timeout on GitHub gets one re-run of the failed group [D84].
- A screen with an approved drawing is built to it and checked beside it as built and after every fix; the drawing check
  is a standing step, red until each difference is fixed or he rules to keep it, beside the look by eye and the walk; the
  differences go to him side by side, each marked, and he chooses — an outright fault is fixed without asking; an approved
  part is drawn again from its drawing in a later round [D1424, D1426, D1478, D1494, D1495].
- Clearing the demo data is approved whenever it is the simpler path [D22].
- Every two weeks a one-page scorecard: faults he found after a change went live, changes undone or redone within two
  weeks, merges — each beside the two weeks before; speed counts only while the first two hold [D1409].

## Secrets and the repo
- The project's secrets scan is a required check on `main` (he switches it on from the steps given) and GitHub's own
  scanning is on; a key found in the history is changed, not only deleted [D1408, D1535, D1540].
- The repo is public until he says otherwise; his PC's runner stays stopped meanwhile; private again, it restarts and the
  checks return to his PC [D106, D89, D1530]. No public GitHub web address [D343]; the app is viewed on Vercel [D59].
- Three points of the SWiFT build-and-deploy kit are set aside on his order: all its red flags (whether the flying schedule
  or the Tracker count as operational information among them), its rule against hosting on Vercel and its rule that the
  project be private; Vercel and the public project stay until he says otherwise, and none is put back to him unasked
  [D1530].
- Two guards stand: a backgrounded npm command must move into `raptor-port` [D162]; the push-and-lock guard [D976].

## Showing him, asking him
- Anything new a person will see — a box, a message, a mark, a button — is drawn as a mock-up and shown before it is
  built, even inside a fault fix [D1625]. A picture for a question shows only what it is about, the change named on it
  [D1222]; a questions page puts what he should look at now at the very top — each open question in one line with its
  recommendation and a link to its pictures, newest first; answered and replaced ones leave the page [D1237, D1363];
  product questions in small rounds, each with a recommendation and a picture [D541, D853].
- No preview link while work is in progress: the link comes when the work is ready for his look, whenever his review is
  needed, and when the work is done [D905, D906].
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
- Text that only says what the screen already makes plain is named in every look and recommended for deletion; the editing
  hint once on Edit Schedule's panels stays deleted [D846, D847, D938, D941, D1417]. His design corrections become lessons in the
  guide the same day, in his words, read by one fresh reader and named in the closing report; a branch adding lessons
  takes a number range first [D852, D941, D1417]; his first lesson stays struck [D942].
- Jobs of their own, later: the wording pass [D808]; the minimal-interface design [D765]; the consistency looks, each
  mismatch put to him with pictures before it changes [D1124, D1508]. The writing guide governs how the agent writes to
  him once approved [D835].

## Order of work
- Features first, grouped by area; an area's small finds and tidy-up ride with its batch; one whole-app check at the end
  [D490, D485]; architecture before individual bugs [D144]. The backlog's priority list shows only what is open, one line
  an item [D1024]; the sized plan's fix nights first, the pictures round after [D1717].
- The original batch order stays the reference: work-hours, Insights, workflow UI, inputs, Tracker, caps and ops (started
  only on his word; its handoff stays cancelled, the SANS calendar in its place), the whole-app check [D495, D568, D569];
  the earlier builds' re-test as a person uses them has the Leave War links left, with the 7 Sep phone check [D4, D147,
  D203, D453, D473]. No guide for bringing a third app in as a tab until one comes [D73]. No tidy-up deletes the SANS layout's
  branch, records or pictures [D610].
- Not started until he says: the Tracker's progress graph [D774]; the M365 hosting trial (until his test account) [D1682];
  the Tracker's and Leave War's tidy-ups are jobs of their own [D775, D493]. Of the code-tidiness read's separations, the
  Leave War's saved-data reading waits for the database step, and its link to the schedule stays whole — split only if a
  later feature must work heavily inside it, a new question for him then; nothing is restructured outside an approved item
  [D493, D486]. His go for the jobs the 13 Oct skill-notes
  review filed stands — the script guard (`[SHELL-SCRIPT-GUARD]`) among them, built with its fresh read [D811].
- The outside skills he has sent — the article's five, the mattpocock and jakubkrehel collections, the Apple design skill —
  were not installed whole: their practices are fused into our own guides [D486, D491, D812]; guides and automatic
  tools stay readable by any model [D623]; Impeccable moves to v4.1.3 by its vendoring note's steps [D625]. Codex alone
  uses the proportional framework [D499].

## The platform and the database
- The database comes at the end, once the features are built; the table list is kept true as each feature is added; he
  writes the table format with his AI for the IT side [D473, D203, D453]. Work needing IT's confirmation waits for it, and he is
  told; the day and request tables' hand-over waits for IT's written answer [D466, D465]. After the connection, group B is
  tuned against the real database, the lock's screens last [D453, D473].
- The target: a Power Apps code app on Dataverse on his M365; every user holds Power Apps Premium [D1570]; the tables are
  the one master of saved data [D1580]; what does not read the one table is one item for the database step [D1587]; no
  tables, roles, day-lock flow, setup script or sign-in test on his M365 before then [D1571, D1662]; the hosting trial is
  the app without a database [D1532]. At the move: each aircraft type set by a setting, the code check every session and on
  every change, a medical change shown whole in the change history, words on screen kept to his design rulings, a clean
  copy for the PPCoE with this project kept whole [D1536, D1537]; strict value checking area by area, the rules engine word
  for word [D1537].
- React Doctor — the free code check the SWiFT kit runs — comes from the same public package store as the app's other
  building tools and changes nothing in the app; it runs the kit's way [D1531, D1533]. Its findings are fixed with each
  area's batch, new code clean [D1534]; it runs on every pull request and at each session's end [D1539]; the 31 old
  walk-script errors fixed before the next full run [D1572]; mock-up pages and the original app not counted [D1716].

## Long runs, compaction and handoff
- `/overnight` sizes the night to his hours, he selects, its questions come first, then it runs unattended in one chat
  [D867, D869]; it lists the night's jobs before it starts [D1443]; asks "Low or Medium?" [D1104]; each job a fresh helper,
  the night's chat coordinating [D1416]; it goes on past 90% of the weekly allowance, saving at every step [D1415]; using up
  the allowance is his aim [D1033, D1415].
- Unattended: a question never stops the run — search the rulings, decide technical points, park his choices in one list;
  one notification at the end; no merge, no `main` [D596]; at a full chat, write the state and carry on [D667]. Before a
  compaction the state is in the repo and the compaction is told exactly what to keep — the step in hand, the files it
  touches, the open faults, the parked questions — and what to drop [D766].
- Every chat compacts at about 400,000 tokens (first note about 300,000; held until saved from about 360,000) [D1671,
  D878]. The compaction set-up stands: the fullness on his screen, a guard that holds the app's compaction until the state
  is saved — off when he is away — and the saved note handed back after [D870, D872]. Idle compaction stays on [D884].
- In the day the agent suggests a handoff to a fresh chat whenever the work is at a suitable point — clean, committed,
  little lost — mid-job included; the compaction set-up is for a big job that would fill the chat first [D874]. From the
  first note it picks that clean point itself, so a big job compacts once, and near a job's end while he is using the chat
  it offers a handoff instead [D868, D871, D874, D884].
- A guide missing after compaction → ask him to type `/reload-skills`; he runs the guide check himself [D885, D886]. A chat
  started from a handoff has Remote Control on [D1195]. Write the state into the repo as you go; condense it in its own
  docs-only commit [D69].

## Names and privacy
- The bare squadron number only; never the squadron or service abbreviation [D58]; "a fighter squadron", the bare
  "F-15", the Tracker's event-box hint reading the bare type [D63, D64]; the Tracker's syllabus data is outside every
  privacy sweep [D62]; the commander briefing deck stays [D57].

## App-wide product rules (to move to their area pages)
- Undo steps back through the signed-in person's own changes only, and the list clears when they sign out; it never undoes
  another person's change, and where someone has since changed the very same thing it refuses and says who [D148];
  it does not take back adding a person, archive, restore, delete or a posting [D350]; "Clear edit history…" stays until the
  database step [D351]. A scheduler is always an admin [D785]. To the OIL page: an issued weekend carrying a placeholder
  raises the pending mark — leave it [D54].

=== END OF THE PAGE ===

## The account — every ruling of today's `how-we-work.md` not cited on the page

Every other ruling of the file is cited on a line that states it — on this page, or in one of the five always-loaded files.
These 10 are not; each is **proposed** for
the archive by `DECISIONS.md` step 2 (a spent one-off permission, or a ruling a later one restates in full — D971), to be
confirmed by the conversion's fresh reader against the full row, sentence by sentence:

| Ruling | Proposed | Why |
|---|---|---|
| D602 | spent | the order after the Codex stack: each step done (the crew-rest fault, the start-load audit); its "never at the cost of the quality of the work" is D68's |
| D832 | spent | the drafting of the writing guide — approved as D836 |
| D972, D973 | spent | the capitals sweep — done, `[CAPS-SWEEP]` archived |
| D974 | spent | the start-size job's commits left on `main` — a one-off |
| D1556 | spent | the three drafts of the start-load trim — approved and live |
| D1566, D1659 | spent | one-off stand-ins for the drawing check on pull requests 611 and 636, both live |
| D86 | spent | two chats for the 23 Sep re-test; the lock that replaced its rule is D228 |
| D136 | **replaced** by the ruling that approves the plan | "every live ruling stays in the list chats read" — what the diet changes; the gate's citation check takes its place |

**Kept live in v2 that v1 proposed for the archive** (the reader's H2): D141, D390 (they stand — the diet narrows D390's
loading shape and D136 only by the ruling that approves it); D969 (its points E and F are open — the skill-notes short form
was approved on 17 Oct); D811 (its go for `[SHELL-SCRIPT-GUARD]` is unspent); D905 (widened by D906, not restated); D8,
D10, D72 (no "history" category in step 2; D72 is a standing no); D870 (its standing design); D1531 (the package store);
D1732 (live until the diet ends); D203 (kept rather than argued as restated). **Kept live in v3** (Astra's finding 3): D766 —
its one-rule job is done, but its "smart compaction" (what to keep, what to drop) is the rule `doc-structure.md`,
`doc-budget.md` §5 and `/overnight` apply to every unattended run, and no later ruling carries it.

**Sizes** (the project's calibrated estimate, `docsize.mjs` `estTokens`): today's `how-we-work.md` 56,682 bytes, about
21,236 tokens → this page 17,524 bytes, about 6,602 tokens (−69%; v2 was 6,243, v1 4,873 with a bare list of numbers and
six clauses dropped). The plan's two trial checks (§5) pass on v3 — rebuilt on his PC for it, since the cloud chat's
scripts are gone, and reproducing v2's own figures first: no bare list of numbers, and every change mark of a general
ruling cited beside it. With the five always-loaded files, every one of the 207 rulings is cited on a line that states
it, except the 10 above.
