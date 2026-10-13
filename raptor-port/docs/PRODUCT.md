# Product

<!-- impeccable:product-schema 1 -->

*The design skill's record of this app — what it is and who it is for; never how it looks. Written 13 Oct 26 from the
owner's own answers (D820). Before any design work, read `design-practices.md` beside this file: his rulings, then the
one design guide. Where anything here meets one of his rulings, the ruling wins.*

## Platform

web

## Users

- **Schedulers** (always admins) build and amend the week's flying programme. Mostly at a desktop; occasionally on a
  phone, for minor changes. What they want from the app is to be as efficient as possible.
- **Squadron members** (aircrew, ground crew, SANS) read the published schedule, file their inputs — leave, medical,
  duties and other commitments — bid for leave, and follow their training progress. Mostly on their phones.

## Product Purpose

An all-in-one for a fighter squadron's scheduling, so that information flows seamlessly between the people who plan and
the people who fly, and — with some automation — the workload is lighter because the app does the cross-checking.
Success is a week planned, checked and published with less effort and nothing missed.

## Positioning

- One place plans the week: flying waves, duties, sims and ground events.
- It checks the plan against the squadron's rules AS IT IS BUILT — crew rest, double bookings, qualifications, missing
  briefs — not afterwards.
- A published day is a record: it changes only through a signed amendment, and everyone can see what changed.
- Leave bidding, time off earned for weekend and holiday work (OIL) and training progress are tied to the same
  schedule, so they cannot drift apart.

## Operating Context

- A scheduler works on a wide desktop screen with the whole week in view, placing people by drag and by tap, often
  under time pressure; the same scheduler makes a small correction from an iPhone.
- A member opens the app on a phone to see what he is on, to file or change an input, to bid for leave.
- The app's parts: the schedule (Edit Schedule, the Scheduler Board, View-only Sched), Inputs and its calendars, Quals,
  Logic (the rules and their settings), the Leave War (leave bidding and OIL), the Tracker (training progress), Admin.
- The owner's own phone is an iPhone; his PC's display runs at 125%.

## Capabilities and Constraints

- A week of flying waves, duty crews, sims, ground events and personal inputs; a rules engine that flags breaches as
  the schedule is built; publishing with four sign-offs, and amendments after a day is signed off.
- It must stay fast on a phone — an effect or a layout that costs speed is not taken.
- It must work on both an iPhone and a desktop.
- The words on screen are plain and read as a finished product. How the app speaks — as a capable colleague on the
  scheduling desk would say it aloud: every fact kept, calm, exact, brief, the squadron's own words kept, a dash only
  where nothing else reads as well (D834) — is `design-practices.md` §1b; §1, §1a and §1b together are the writing
  guide (D833).
- No unit designation anywhere: the squadron is "a fighter squadron".
- Undecided here, his to place: the Tracker's progress graph.

## Brand Commitments

- **The Raptor look stays:** dark, dense, the talon logo, and colours that each mean something (the table in
  `design-practices.md` §4).
- **Cleaner, in the way Apple's interfaces are — and intuitive** (D821: "raptor style design but cleaner look like
  apple, intuitive design that doesn't require a lot of instructions … placement of buttons and everything just makes
  sense"). Apple's cleanliness and sense of place — not its light colours, its single accent or its empty space.
- **Pucks stay as they are and never wrap; buttons keep their size.**
- **The login page stays simple.**
- A working screen stays dense: "sleek" here is fewer words and fewer boxes, never more empty space.

## Evidence on Hand

- The running app and its own stylesheets (`../src/ui/scheduler/`, the Leave War's and the Tracker's) are the visual
  truth; there is no separate design file. How each surface behaves and its measured sizes: `ui-contracts.md`.
- His approved mock-ups: `mock/`. Pictures of the app as walked: `img/handpass/`.
- Earlier looks by this skill: `../.impeccable/critique/` and the repository root's `.impeccable/critique/`.
- The data in the app is demo data. No testimonials, customers or figures exist — none may be invented.

## Product Principles

1. **Efficiency for the scheduler first** — fewer steps, fewer words, nothing that moves under the hand.
2. **Intuitive before instructed** — where a thing sits and what it is called should make a hint unnecessary; a
   screen that needs an instruction is redesigned before it is explained (D821).
3. **The app cross-checks so people do not have to** — a problem is flagged where it is made, in plain words.
4. **One record, seen the same everywhere** — the schedule, the inputs, leave and OIL always agree.
5. **A published record changes only in the open** — by amendment, with who and what.
6. **Nothing is paid for with speed.**

## Accessibility & Inclusion

- Anything new can be opened, used and closed by keyboard, and focus is always visible (`design-practices.md` §2).
- Touch on a phone: a target a finger can hit, without a button looking bigger.
