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
