# Brief — a clean sheet: how would you design a person's absence in TALON from scratch? (27 Nov 26, chat 191)

The same brief goes to Fable and to Astra (GPT-6 Astra), **each blind to the other** in round 1; round 2 will have each
read the other's and the two settle on one direction. Read-only: change no file in the repo; write only where your call
says.

## What he asked (D2785, after D2782 — open the full rows: `grep -h '^| D278[25] |' .claude/decisions-full/scheduler.md`)

You both already proposed a design (`2026-11-26-absence-design-r{1,2}-{fable,astra}.md`, this folder; merged in
`../specs/2026-11-27-absence-one-design.md`): one item window everywhere, rights by person, a group one item. He read it
and said: *"Actually I'm asking from the pov in which if u could redesign this whole thing again. How would u do so?"*

So this round is a **clean sheet**. Forget that the Leave War, the Inputs pages and the schedule's Unavailable list are
three separate places built at different times. If you were designing, today, how a fighter squadron enters, bids for,
approves, sees and changes **people's absences and commitments** — and how the scheduler plans the week around them —
what would you build? What pages, what objects, what gestures? Be bold; then say honestly what it costs.

## The real work it must serve (his words and the product record)

- **Leave bidding** (the Leave War today): months ahead, members bid for leave on open dates; admins decide against
  manning (how many pilots and WSOs are available each day against what is required); bidding has its rules (open and
  closed dates, balances, OIL — earned leave, never pay). Read `.claude/rules/decisions/leave-war.md` for how bidding
  works and what he ruled about it.
- **Day-to-day and last-minute inputs** (the Inputs pages today): members on phones file medical, leave approved by
  word of mouth, duties, courses, appointments and other commitments, often for several people at once; schedulers
  file them too. `.claude/rules/decisions/inputs.md`.
- **The scheduler's week** (Edit Schedule and the Scheduler Board): at a desk, dense, fast, by drag and tap; who is
  away shapes who can fly; last-minute changes; a published day is a record changed only by a signed amendment.
  `.claude/rules/decisions/scheduler.md` §Inputs on the schedule.
- What confuses him today, and the facts: the fact map `2026-11-26-absence-three-pages-map.md` (this folder) and his
  examples in the round-1 brief `2026-11-26-absence-three-pages-design-brief.md`.
- Who uses it and how it should feel: `raptor-port/docs/PRODUCT.md`; `raptor-port/docs/design-practices.md` §0 and §9
  (his design lessons, lesson 151 the newest).

## What may change, and what may not

- **May change:** which pages exist and what each holds; how an absence is shown, opened, moved, grouped, approved;
  windows, gestures, navigation; any earlier ruling about these — name each you would set aside and why (D754: the
  right design, not the easy or nearest one).
- **May not change without saying so loudly:** bidding as the way leave is allocated ahead; OIL as earned leave; a
  published day changed only by a signed amendment; one record per input with its people (D756) unless you argue a
  better record; the Raptor look (dark, dense, the talon, colours that mean something — D821, cleaner the way Apple's
  are); phones for members and a desk for schedulers (D820); the later move to a Power Apps code app on Dataverse —
  flag anything it cannot do (D1551); speed on a phone.

## What to deliver (under about 220 lines, plain words — he is not technical; the host will translate)

1. **Your concept in one paragraph** — the idea at its heart, the thing a scheduler would say about it after a week.
2. **The places** — the pages or views, what each is for and who uses it when, and what is gone compared with today.
3. **The objects** — what a person's absence *is* in your design (one thing or several kinds), how a group is shown,
   how a bid becomes leave.
4. **Five moments, walked through** in your design, step by step on screen: (a) a member bids for March leave in the
   January war; (b) an admin approves bids against manning; (c) a member on his phone files a medical this morning;
   (d) a stand-down for six men, Cutter then recalled a day early; (e) the scheduler, an hour before publishing, finds
   Ghost unavailable and replans.
5. **A sketch of each main screen**, in words a designer could draw from (what sits where, what is dense, what one tap
   does) — two to four screens, desktop and phone where they differ.
6. **What it costs and risks**, and how far it is from today: what can be reused, what must be rebuilt, what can come
   in steps without breaking the squadron's work in between.
7. **Against the agreed consistency design** (the spec above): is yours a different destination, or the same one
   reached further? Would you still do step 1 (the one window) first?
8. **Questions only he can answer** — at most four, each with when it happens in real life and your recommendation.
