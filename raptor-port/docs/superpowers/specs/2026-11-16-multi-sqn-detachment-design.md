# More than one squadron, and detachments — the design, round by round

Backlog item: `[MULTI-SQN-DESIGN]` (his D1695, with D281, D282, D288, D289, D296, D1100, D1101). His order of work,
D2086 (16 Nov 26): this design first, design only; caps and ops limits next; then the Tracker expansion; this build last,
at the database step (D473). Started by chat 90. Questions go to him in small rounds, each with a recommendation and
pictures of the real app (D541, D853, D1237); his answers are recorded as rulings the moment he gives them.

## What is already settled (his rulings — not asked again)

- **One deployment per aircraft type** (D1101), each with its own database; one code base for all (D1100); the type set
  by a setting (D1536). Inside the F-15 deployment: several squadrons — so far at most two (D1101) — and their
  detachments.
- **A person belongs to one squadron at a time**, set when his account is made (D1695); it changes on a date. A posting
  to the other squadron is a **transfer** — on the posting-out date, by itself or by the admin's hand, all his data going
  with him (D281); leaving the whole system and coming back starts fresh.
- **The neighbouring squadron plans his people as a matter of course** (D282) — both ways, the agent's reading; his leave,
  quals and account stay his own squadron's (D281, D282 readings).
- **Rights to view other squadrons, read only**, may be given (D1695).
- **A day split between squadrons** — one squadron's morning, the other's afternoon academics (D1100, D1695).
- **A detachment:** a squadron split over two places for operations; its people moved to it, so each scheduler sees who
  is available at his place and not a mix; two places, two separate schedules (D1100).
- **Callsigns are unique within a community** (the squadrons of one type); a guest from another type is picked from a
  guest list and wears an orange corner on his puck (D288, D289, D296).
- **The platform (D1551):** doable on Dataverse — the IT side's answer 8 (8 Nov 26): a column naming the squadron on every
  record and the app's own roles stopping one squadron editing another's (`raptor-port/docs/data-model.md` §Squadrons).

## His plan, given 16 Nov 26 before round 1 reached him (D2087, D2088, D2089)

He described his plan and asked for it to be reviewed and improved. Recorded as his direction, the design still open:
- **Squadrons and people (D2087):** a squadron is made in Admin (the demo to hold 142 and 149); the admin who makes one has
  access to both; an admin gives a person access to one squadron, the other or both; every person keeps one primary
  squadron; a member with several views them all and files inputs and leave only in his primary; only the Leave War's
  Post out moves his primary squadron, on a date.
- **Detachments (D2088) — answers round 1's Q1:** a temporary unit under a name of its own (149's "249"), its own manpower
  and schedule; an option moves people between the two; no conflicts flagged across; no man planned in two locations.
- **Flying together at home (D2089, his lean):** one wave may hold formations of both squadrons; a 142 formation shows on
  142's own schedule too and either scheduler may plan it; 142 still plans the rest of its day.
- **His open questions to the agent:** the best way to enrol people; whether a scheduler picks the other squadron's men or
  their own scheduler grants them; whether the checks read across squadrons or follow the man; how the interface looks;
  and what a Power Apps code app on Dataverse allows of all this (security, roles, permissions).

## His real example — two schedules of one day (D2090, 16 Nov 26)

He sent pictures of both squadrons' issued schedules for the same day (real names — never put in this public project).
What they show, the agent's reading, to confirm with him:
- **The same lines are typed on both schedules by hand today** — 142's two lines in each of 149's waves, and on 142's own
  schedule. Small differences between the two copies are already there (an area written two ways) — the case for one
  record shown in both places.
- **Each marks the other's lines only in the remark** ("142 LINE", "149 LINE"). His ruling D2090: 149's schedule must show
  which lines are 142's — a proper mark, drawn for him first.
- **The other squadron's lines carry none of the schedule's own line numbers and are left out of its jet count** (149's
  day reads 6 × 6, 142's 2 × 2).
- **142's schedule shows more than its own lines:** the one 149 line its men fly against stands there too, marked
  "149 LINE" — so "which of the other squadron's lines show on mine" is a choice, not only "my own". Recommended for round
  2: a squadron's schedule shows its own lines wherever they are planned, plus any line of the shared wave a scheduler
  marks to show there.
- **The wave's deconfliction notes stand on one schedule** (149's, in charge of the wave); 142's says to refer to it.
- **Not understood, to ask:** what the purple names mean on both schedules (not the squadron — both squadrons' men wear it).

## What the platform allows (read 16 Nov 26 — the project's own records; Microsoft's pages being read by a helper)

From the move plan (written from the SWiFT kit v0.6, 31 Oct 26 — the kit itself stays out of this project, D1530), the
IT side's answers of 8 and 10 Nov 26 (`[IT-QUESTIONS]`) and `raptor-port/docs/data-model.md` §11:
- **Sign-in is Microsoft's**, by itself; no password box. Who may open the app at all is one group the IT side keeps.
  Inside the app a person is matched to his row by his work mail (D165); someone on no list lands on "Request access".
- **Rights are the app's own.** The IT side keeps the database's rights and will not split squadrons there (no business
  units offered; roles handed out by them only). Their advice, both people: a squadron column on every record and the
  app's own rules. Consequence, to say plainly: the database itself refuses nothing — anyone with access to the app could,
  with other tools, read or change another squadron's rows. The app enforces the limits; the audit log (kept a year,
  readable by the environment's admins) records who did what.
- **So a squadron or a detachment made in Admin is a row in a table** — no IT request, which fits his plan. Anything that
  needed a database team, role or business unit per squadron would need the IT side each time — avoided.
- **Nothing runs on the server but scheduled flows** (no plug-ins, no custom APIs), owned by the unit's role-based account
  (its licence still to ask). A dated move — a posting, a detachment's start and end — is worked out when the app is opened
  or by such a flow.
- **One production environment** for code apps: a database per aircraft type (D1101) is not possible today — not settled,
  recommended "when a second type joins". **Reading across squadrons** for the checks has no barrier; the costs are the
  2,000-row page and each person's 40,000 requests a day, so the app fetches a day's rows for a place, not for a squadron.
- **Microsoft's own pages (learn.microsoft.com, read by a helper 16 Nov 26; page dates Aug–Nov 2026):** a code app reads
  and writes Dataverse rows with filters and paging — no FetchXML, no alternate-key lookups, no polymorphic lookups; it is
  not offered in Power Apps for Windows, and nothing read confirms the Power Apps phone app (community posts say it hangs
  there) — so phones are assumed to use the browser, to confirm with the IT side. Dataverse can split units for real
  (business units with ownership across units, or a team owning each unit's rows), but making one needs an administrator
  each time — the IT side's, which they do not offer; a squadron column checked only by the app is a filter, not security
  (Microsoft describes no such pattern as security). A person needs a licence, the environment's group and at least one
  role before the app opens for him at all, so "Request access" serves only people the IT side has already let in. Each
  row carries a version for refusing a stale save — whether a code app can send it is unproven: a trial before the build,
  since two schedulers may now edit one line (D2089). One practitioner's post (unverified) reports paging and guest-user
  faults in the client library — test paging on real volumes.
- **Stale records to correct when the design is agreed (D201):** data-model §11's intro ("one business unit … no
  cross-squadron rows") and §Squadrons' first paragraph; the 10 Nov answers not yet folded into the handover documents.

## His answers to the review's four questions, and what he added, 16 Nov 26 (chat 91 — D2091–D2098)

*"All four as recommended."* The four questions as chat 90 put them, each now a ruling:
- **Borrowing a man (D2091):** a scheduler picks the other squadron's man freely, with no request, where both squadrons
  are at the same place; every pick shows at once on his home squadron's schedule and rings its schedulers' bell. The
  "ask us first" switch stays unbuilt unless a squadron wants it.
- **One place, one man (D2092):** every squadron and detachment has a place; a man is at one place on any day; units at
  the same place may share people and are checked against each other; units at different places never are; the app
  refuses to plan a man at a place he is not at. Answers D2089's open question (conflicts are flagged across two
  squadrons at home) and confirms D2088's refusal.
- **Who makes a squadron (D2093):** a master admin only (D1971); a squadron's own admins make its detachments.
- **Enrolment (D2094):** "Request access" asks the person's squadron and goes to that squadron's admins only; an admin
  adding a person picks his primary squadron, his own by default; access to another squadron is never asked at sign-up —
  an admin gives it on Admin → Users, to view or as a scheduler.
- **Added by him (D2095):** *"the admin can also close the detachment onces its over. or archive it (to see old
  programme)."* To check in round 2: one action or two (recommended one, "Close detachment", its schedules always kept,
  read only, under past detachments — an issued schedule is never erased); its people go back to their squadron that day.
- **Asked by him, the same hour, for round 2:** *"So how are we going to assign people to the detachment? Through inputs?
  Or scheduler/admin?"* then *"Is it also easier for people to self input DET? so that its easier on the scheduler?"*
  **Recommended (chat 91's second answer, replacing its first — "the admins' own dated list, never an input"):** through
  Inputs, as today. The app already enters a detachment as the "overseas duty" input (it replaced "Detachment", owner
  10 Aug 26 — `src/engine/inputs.ts`), filed by the man himself or by a scheduler for several men in one input, and it
  already takes him out of reach at home and shows on the Leave War. So: that input gains one choice, which detachment
  (none, as today, for a trip with no schedule in the app); a man with one naming a detachment is on that detachment's
  manpower for its dates; the detachment's page lists who and when, read from those inputs, and its admins add or change
  a man there (the same input, written for him). One record, both doors, nothing new to learn. To settle in round 2: it
  takes effect at once as every input does (recommended, both squadrons' schedulers seeing it) or waits for an admin's
  yes; whether "DET" shows as a kind of its own in Unavailable or as overseas duty with the detachment's name. Not ruled.

- **The count at the top of a day (D2096):** *"2 (142) 6 (149). not 8"* — squadrons counted apart, never added. To draw:
  how it reads with more than one wave (today's badge is the aircraft in each wave, "6 × 6").
- **Two ALL AVAIL events at one time (D2097, his lean):** a 142 man flies with 149 in the morning; both squadrons put an
  all-available ground programme at the same afternoon time — *"I think it should be left as open for interpretation by
  the user?"* No conflict, the app decides nothing. Recommended with it, to confirm: each squadron's ALL AVAIL counts its
  own people only (so he stands in 142's, and never earns OIL twice); its window shows his morning with 149; a squadron
  that wants him names him — a pick (D2091).
- **What the home schedule shows for a borrowed man — his offered option, 16 Nov 26, RULED the same day, "as recommended" (D2098):** *"149 just plans this
  person on their schedule. but on 142 schedule it just says attach 149. just like our current input. or should it show
  the event on 142, but have a 149 label?"* **Recommended: his first — by whose line it is.** (a) A 142 man in a seat or
  an event of 149's own: the line is 149's alone; 142's schedule shows one row for him, "Attach · 149" with the times,
  under Unavailable as the Attach input does today (the inputs page's D1373, D1374) — made by itself from 149's plan,
  changed only by it, a tap opening 149's schedule at that line, read only. 142's published day then changes only when
  his time away changes, not with every detail of 149's line; nothing of 149's enters 142's count, numbers, publishing or
  signatures. This replaces round 1's drawn "WITH 149 · ACADEMICS" row and narrows the review's improvement 3. (b) A 142
  formation flown in 149's wave is 142's own line: it shows whole on 142's schedule (D2089) and on 149's with the 142
  mark (D2090). (c) Another squadron's line shown only for reference (his real example: the 149 line 142's men fly
  against) — a scheduler's choice, round 2.

**Not asked as questions of their own, so still to confirm in round 2:** the review's improvements 2 to 5 below (a
detachment is a unit like a squadron; one line, one record; the checks follow the man; inputs and leave belong to the
person), and the three points of his real example (the other squadron's lines carry no line number of the schedule's own
and are left out of its jet count; which of the other squadron's lines show on a schedule; what the purple names mean).

## Round 2's answers, 17 Nov 26 (chat 92 — D2099–D2111)

Round 2's page: `raptor-port/docs/mock/2026-11-16-multi-sqn-r2/` (pictures `raptor-port/docs/img/2026-11-16-multi-sqn-r2/`).
Each ruling below settles the point named; the full rows are in `.claude/decisions-full/`, the short lines on the
scheduler's page.

- **D2099** — B1's first mark, a plain "142" after the callsign, turned down for its look ("so ugly"); redrawn in three
  looks. *Settled by D2104.*
- **D2100** — B7, the purple names on his paper schedules: dropped; nothing is drawn from them. *Settles the third point
  of his real example above.*
- **D2101** — A1: a man is put on a detachment through his overseas duty input, which gains a "Detachment" choice; "None"
  stays, for an overseas duty with no schedule in the app (a staff trip). *Settles how people join a detachment.*
- **D2102** — A2: at home he shows as today's overseas duty row, titled by the detachment. *Settles how he shows at home.*
- **D2103** — A3: one button, "Close detachment"; its schedules kept, read only, under "Past detachments"; its people
  back with their squadron. *Settles closing.*
- **D2104** — B1: look 2 — a grey "142" badge after the mission (under it, a size smaller, on a phone) and the whole
  formation one shade lighter. *Settles the mark on the other squadron's line.*
- **D2105** — B2: a schedule shows its own lines wherever planned, plus any line of a shared wave a scheduler ticks to
  show; a shown line of the other squadron wears the mark and is read only there. *Settles which lines show; the tick's
  control is not drawn yet.*
- **D2106** — B3: the squadron whose wave it is publishes and signs it, the other's lines in it included; 142 joins
  149's wave through "+ Wave" → "Join a 149 wave"; 149's "+ Line" stays as today. *Settles who signs and how a line
  joins.*
- **D2107** — B4: a pick onto a day the home squadron has published arrives as a pending change. *Settles late picks.*
- **D2108** — B5: at home people, areas and sims are checked across both squadrons; jets each squadron's own. *Narrows
  D2089's and D2092's cross-checks for jets.*
- **D2109** — B6: a line is judged by the Logic settings of the schedule it sits in. *Settles whose settings.*
- **D2110** — C1: Admin gains a "Squadrons" page as drawn. *Settles where places and detachments are kept.*
- **D2111** — C2: "Request access" asks which squadron, the first choice on its card. *Settles sign-up.*

**Still open after round 2, asked in round 3:** round 1's Q4 (how a person moves between places on screen — never put
to him) and where the other squadron's free people show on a day (never drawn). Round 1's Q1–Q3 were overtaken by his
plan and round 2 and are not asked again.

## Round 3 — the design reviewed whole, and "+ Line" (night of 17 Nov 26, chat 92 — put to him; nothing ruled yet)

His job for the night: is the design good, by the design guide; does it touch other parts of the app; is it easy to
use; how 149 is put in 142's home; and whether "+ Line" should open a card that stays open for repeated presses. The
page: `raptor-port/docs/mock/2026-11-17-multi-sqn-r3/page.html` (pictures `raptor-port/docs/img/2026-11-17-multi-sqn-r3/`).
Its seven questions, one decision each, with its recommendation (revised the same night after a fresh reader's look):

- **Q1** — moving 149's place takes a "From" date. A master admin does it (D2093), the place picked from the places list
  on Admin → Squadrons (D2110), with one line saying what changes; both squadrons' admins and schedulers told by the bell.
- **Q2** — the whole TALON mark becomes a button, its number "149 ▾", opening "Schedules" — the ones the person may see
  (round 1's Q4 (A), redrawn). Changes the built "142 TALON" title (D1590, D1606). The schedule pages (Edit Schedule,
  View-only Sched, the Scheduler Board) and Logic follow the choice; Inputs, Quals, the Leave War and the Tracker stay on
  his own squadron.
- **Q3** — the other squadron's free people in a group of their own at the foot of both crew lists (Edit Schedule's
  Available crew and the Scheduler Board's), each showing when he is free.
- **Q4** — "✕ Wave" on a wave holding the other squadron's lines asks at the button (lesson 77); otherwise as today.
- **Q5** — his "click twice" was about round 2's card on "+ Line", which D2106 turned down (149's "+ Line" one press, 142
  joins through "+ Wave"). For adding several lines quickly: "+ Line" moved to the wave's foot, the board keeping it under
  the finger, so each new line lands in view in the just-added ring; his stay-open card and a "How many lines?" stepper
  drawn beside it. Measured on the real app: today three presses leave none of the three new lines wholly on screen,
  desktop or phone. The board's other add buttons ("+ Row", "+ Item", "+ Note", "+ Block") follow the same rule (D754),
  drawn if A is taken.
- **Q6** — D2089 (either squadron's scheduler may plan a 142 line in 149's wave) against D2105 (a shown line of the other
  squadron is read only): recommended, in a wave 149 owns and signs (D2106) 149 may change 142's line and 142 is told;
  read only for a line shown only for reference.
- **Q7** — crew rest between lines on two schedules whose settings differ: recommended, the later line's schedule's
  settings (following D2109); other choice the stricter of the two.

Three for him to answer only if he disagrees: **R1** a detachment's "To" is its planned end, never a close by itself, the
bell reminding its admins that day; **R2** on the Scheduler Board the grey badge sits inside the mission box, since no
room is after or under it there (a change from D2104, the board only); **R3** closing a detachment early ends its men's
overseas duty that day and tells each by the bell (the agent's reading).

Its ripple list (the day's count D2096, ALL AVAIL D2097, OIL, the Leave War and the Attach row D2098, the Tracker,
Insights, Inputs, warnings, publishing, Undo, the bell, Admin, print, the database step) is on the page, §6. The agent's
readings told to him there: OIL earned on the other squadron's schedule counts on the man's own OIL when that squadron
publishes; a sortie flown on the other squadron's schedule counts on the student's own Tracker.

## Round 4 — what is drawn, and the agent's design for each (17 Nov 26, chat 93 — to put to him; nothing ruled)

His answers to round 3 are D2113–D2123. Round 4's page: `raptor-port/docs/mock/2026-11-17-multi-sqn-r4/`
(pictures `raptor-port/docs/img/2026-11-17-multi-sqn-r4/`), drawn on the real app as round 3 was (its `draw.mjs` the
start; the method `.claude/skills/brainstorming/mockups-on-the-real-app.md`). Desktop 1536×864 and phone 390×844, both
at 2x. **Every picture says whose schedule it is** (his question on round 3's picture 9): in its caption's first words
("142's schedule —", "149's schedule —") and, on Edit Schedule, in the top bar's own number ("142 TALON", re-lettered
"149 TALON" where 142's app stands in for 149's). Q2's "149 ▾" is not used, Q2 being still open.

1. **The board's badge (D2117).** The grey "142" badge (look 2's recipe) sits on the callsign box's top-right corner,
   its middle on the box's top edge, its right edge a few px inside the box's right: it never covers a callsign, and
   the line keeps its height (measured before and after, both devices). The line one shade lighter, as ruled. Today
   beside proposed. R2 (inside the mission box) dropped. The week keeps look 2 (D2104).
2. **Signing (D2121, lesson 95).** One rule: the day head's status (DRAFT, ✓ ORIG, ALn) is the only "published" mark
   on a schedule, and speaks for that squadron's own day only. The other squadron's wave never wears a status chip:
   under its head one quiet grey line in words — "149's wave · 149 publishes it · not published yet" or "… · published
   by 149" — and, on 142's published day while 149's wave is not, "RU goes out when 149 publishes." On 149's own
   schedule 142's line wears only its badge; its state is 149's day's. Two moments, each seen on both schedules (four
   pictures a device): 149 published and 142 not; 142 published and 149 not. Each picture one continuous frame — top
   bar, day head, the wave — the sections between hidden and named on the page, never two clips stitched. The page
   says, case by case, why it reads right.
3. **Feedback for "+ Line" (D2115, lesson 94).** The button stays in the head. **A, recommended:** each new line goes
   in at the top of the wave, straight under the column headings, just below the button, in the just-added ring — the
   newest always on top, so every press shows its line where the finger is. **B:** the lines land at the foot as
   today, and a small count beside "+ Line" — "3 new ↓" — brings them into view on a tap. Today, A and B from three
   real presses, with the count of new lines wholly in view per device. A's cost: a new line sits at the wave's top
   until it is dragged or Auto sort runs.
4. **His questions, answered with pictures.** (a) 149 has no wave that day: "+ Wave"'s "Join a 149 wave" group reads
   "149 has no wave on Mon 13 Jul", greyed — 142 plans in its own wave, and 149 may join it (D2106, D2114). (b)
   Picture 9 is 142's board just after "Join a 149 wave", redrawn with item 2's line in place of round 3's "149 DRAFT"
   chips. (c) Who may change what (D2114): on 149's board RU (142's line in 149's wave) marked "142 or 149 may change
   it", VL marked "149 only"; a short table in words beside it.
5. **The number box (D2116):** "+ New detachment"'s second box labelled "Squadron number", empty, a faded "249" in it.
6. **Several men at once (D2120)** — recommended yes: the open detachment's row shows "People · 6" with their names
   and a "+ Put people on it" button opening the Inputs page's own several-people picker; it files one overseas duty
   input for all of them, Detachment "249", the detachment's dates; each man's own input stays the backup.
7. **Crew rest across two schedules (D2122, D2123):** made-up settings, 149's crew rest 10h, 142's 12h. Saber (142)
   flies 149's night wave Monday; 142 plans him early Tuesday. The later line is 142's, so 142's 12h judges: the
   crew-rest warning on 142's Tuesday, and the dotted "breaks tomorrow's crew rest" ring on Saber in 149's Monday wave.
   Raised by the real app on 142's own two days, then re-lettered. Who fixes: 142 changes its own Tuesday line; 142 or
   149 may change the night line, which holds a 142 man (D2114, the agent's reading).
8. **The place saved at once (D2119):** round 3's picture 1 redrawn with no "From": "Once saved, 142 and 149 can plan
   each other's people, and clashes between the two are checked. Both squadrons' schedulers are told."

The page's top: this round's open questions — the badge's place (1), the signing look (2), A or B (3), the door (6) —
then round 3's still open Q2, Q3, R1, R3. Then the plain answers. Then one fresh Opus reader against his words; a new
Artifact.

## The review of his plan (chat 90, 16 Nov 26 — put to him; answered in part, the section above)

**Kept as he said it:** squadrons made in Admin; one primary squadron each; access to others given by an admin; only Post
out moves the primary; a detachment is a unit of its own with its own name, people and schedule; no man in two places.

**Five improvements recommended:**
1. **Think in places.** Every unit — a squadron or a detachment — has a place; 142 and 149 share "home", "249" is
   elsewhere. A man is at one place on any day. Units at the same place may share people and are cross-checked; units at
   different places never are, and the app refuses to plan a man where he is not. One rule covers his three cases (two
   squadrons at home; a squadron and its detachment; two detachments on the same exercise).
2. **A detachment is a unit like a squadron** — the same schedule, picker, crew lists and access, nothing built twice —
   with two differences: its people are there for dates (they come back by themselves), and leave, quals, OIL and the
   Tracker stay with the primary squadron.
3. **One line, one record, shown wherever it belongs.** A line belongs to one squadron and sits in one wave; it shows on
   the schedule of the wave's squadron and on its own squadron's schedule — the same record, never a copy, so the two can
   never disagree. This carries both of his cases: a 142 formation inside 149's wave (D2089), and a 142 man in a seat of
   149's own line (lending).
4. **The checks follow the man.** Crew rest, double booking, days in a row, leave and medical read everything he is on,
   on every schedule at his place, and both schedulers see the warning. Checks about the schedule itself (a missing brief,
   an illegal seat) stay with the schedule the line sits in.
5. **Inputs and leave belong to the person, not a schedule:** filed once, in his primary squadron (as he said), and shown
   on every schedule that plans him — the borrowing squadron's and the detachment's too.

**His dilemma — pick or grant:** recommended, the other squadron's scheduler picks freely (as D282), limited to schedulers
at the same place, and every pick shows at once on the home squadron's schedule ("With 149 · …") and rings its schedulers'
bell. Why: granting first fails quietly — the borrower is stuck until someone answers — while a free pick fails loudly, on
a screen the home scheduler already watches. A per-squadron switch "ask us first" can be added later if a squadron wants it.

**Enrolment, recommended:** first opening of the app (signed in by Microsoft) → "Request access" as today, with one more
choice, his squadron; the request goes to that squadron's admins only. An admin adding a person picks the primary squadron
(his own by default). Access to another squadron is never asked at sign-up — its admin, or an admin of both, gives it on
Admin → Users, as view or as scheduler. Who may make a new squadron: recommended the master admins only (D1971), a
squadron's own admins making its detachments.

**Open, for round 2 (each with pictures):** who publishes and signs a line shared by two squadrons (recommended: the
squadron in charge of the wave; the other's schedule shows it as issued by them); a lend onto a day the home squadron has
already published (recommended: it reads pending there, as a late input does); whether shared areas, sims or jets are
cross-checked at home as well as people; whose Logic settings judge a borrowed man's line (recommended: the schedule the
line sits in); how people are moved to a detachment (a dated list on the detachment, shown on the Leave War); the Admin →
Squadrons page and the sign-up choice, not yet drawn.

**What the round-1 pictures showed that the notes had not named** (the helper's list, 16 Nov 26): the wave counts in
Available crew and the desktop AIRCREW panel must count only the people at the place; a detachment's own SANS Avail and
Unavailable sections are undefined; "DET" would be a new kind beside LL and OIL in Unavailable — six men, six rows a day;
a lend's row on the home schedule is owned by the other squadron; a long detachment name collides with the top bar's
buttons on a phone (8px spare with "142 DET · Exercise North") — names need a short form.

## Round 1 — the foundations (written 16 Nov 26; overtaken in part by his plan above before it was put)

Four questions, one decision each. The pictures: `raptor-port/docs/img/2026-11-16-multi-sqn-r1/`, drawn by
`raptor-port/docs/mock/2026-11-16-multi-sqn-r1/draw.mjs` on the real app (today beside proposed).

**Q1 — What "detachment modes" means.** *Example:* 142 sends six crew to a three-week overseas exercise; the rest stay
home. **Recommended (A):** an admin makes a detachment — a name, a place, its dates — under 142, and moves those six into
it for those dates. The detachment has its own schedule (its own Edit Schedule, View-only Sched and board, its own
publishing and sign-offs), and its crew lists hold only its people. At home the six show as away — "DET · <name>" in
Unavailable, the way leave shows — so the home scheduler is never offered them. The same set-up covers the whole squadron
deploying (home's schedule simply empty). Their leave, quals and OIL stay one record, the squadron's. *Or (B):* he means
something else by "modes" — he says what.

**Q2 — Lending a man to the other squadron for part of a day.** *Example:* Viper (142) flies 142's morning wave; 149
wants him for academics 14:00–16:00. **Recommended (A):** 149's scheduler picks him from a "142" group in 149's crew list —
no request, as D282 says; on 142's schedule Viper's day shows "With 149 · Academics 14:00–16:00"; crew rest and clashes
on both schedules read his whole day across both. *Or (B):* 149 asks first, and he appears only once 142's scheduler
agrees — more control at home, slower, and one more thing to answer.

**Q3 — Who may see the other squadron's schedule.** **Recommended (A):** a scheduler sees the other squadron's schedule,
read only, by default — he needs it to lend and borrow; a member sees it only when an admin ticks it for him in Admin →
Users (D1695's "assigned rights"); anyone sees, read only, a day of the other squadron he is planned on himself. *Or (B):*
everyone sees the other squadron's schedule, read only, by default.

**Q4 — How a person moves between places on screen.** **Recommended (A):** the squadron name on the top bar becomes a
picker listing only the places he may see — "142", "142 DET · <name>", "149 · view only"; picking one keeps him on the same
page; the bar always says whose schedule he is looking at; someone with only one place sees no picker, as today. *Or (B):*
each place a tab of its own beside the page names — more to fit on a bar that is already full on a phone (D1642, D1643).

**Left for later rounds (not asked yet):** a detachment's own people at the edges (who runs and signs its schedule, a man
joining late or coming home early); transfer on posting out (the Post out sheet's greyed "Transfer to Sqn"); OIL earned on
the other squadron's schedule; the Leave War, Quals and the Tracker across squadrons; the bell's notices across
squadrons; a guest flyer from another type (D288's crossing of two databases — his question at the database step, D1101).
