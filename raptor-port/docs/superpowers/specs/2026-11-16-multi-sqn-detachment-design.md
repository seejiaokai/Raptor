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

## The review of his plan (chat 90, 16 Nov 26 — put to him; none of it ruled until he answers)

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
`raptor-port/scripts/mock/2026-11-16-multi-sqn-r1.mjs` on the real app (today beside proposed).

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
