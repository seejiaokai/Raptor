---
paths:
  - raptor-port/docs/it-flow-guide/**
  - raptor-port/scripts/itflow/**
  - raptor-port/docs/**/*it-flow*
  - raptor-port/docs/**/*itflow*
---

# The IT flow guide — how it works now

<!-- shape: page -->

Loads by itself whenever a chat reads a file of the IT flow guide — its deck folder (`raptor-port/docs/it-flow-guide/`),
the scripts that shoot and build it (`raptor-port/scripts/itflow/`), its plans and briefs (the `paths:` above) — and
open it yourself before planning any work on the guide, before one of those files is open
(`.claude/rules/doc-structure.md`).

Each line is a rule as it stands today; the numbers after it are the rulings that set it. His words, the readings he was
told, each ruling's date and the history are in the full rows, `.claude/decisions-full/it-flow-guide.md` — open the row
before acting on a rule's detail or asking him about it (`grep -h '^| D410 |' .claude/decisions-full/*.md`, the shell;
the Grep tool hides a long row).

These rulings moved here from How we work on 2 Oct 26, in the documents' size pass: they say what the deck shows and
when it is rebuilt, which only a chat working on the guide needs. The Leave War's rulings that bear on the guide are
pointed to at the end, each stated on its own area's file — the Leave War's own file does not load with the guide's.
The general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every chat; the map of every ruling, and
how to record or retire one: `DECISIONS.md`.

## What the guide is
- The guide is for the IT team and the next developer: how the app is used, journey by journey — what a person clicks
  and what he sees next — and the checks that prove each journey still works; never the rules engine's detail, how the
  app calculates [D410].
- It is a PowerPoint deck plus a PDF of it: a map slide of every journey, then one slide per journey — or several in
  order where a journey needs them, as the schedule's and the Tracker's do — with real screenshots, numbered click
  marks, arrows, a short caption per step, and a "What to test" box naming the checks and the automated test that
  covers the journey; few words, pictures first [D410, D412, D414].
- Its look is the sample he approved as drawn — four pictures a slide, the style kept; the map and the slide style stand
  for every slide added since [D410, D411, D412].

## What it covers
- The work flow: how the journeys follow one another, from inputs filed to a day published and amended. Drawn, as the
  agent's reading told to him: one slide after the map, the life of a day across the roles — members file inputs and
  bids, the scheduler builds the day trying alternate plans, signs and publishes, everyone reads it, a late change, an
  amendment — each stage naming its journey slide [D411].
- The alternate-plan flow: saved plans — making one, switching between them, bringing one out [D411].
- How a schedule is made, step by step, with the day, wave and duty templates and the duty blocks each given their
  steps; drawn (the agent's call) over several slides in order — a blank day, then waves, lines and duties, then people
  in, then the issues [D412].
- Wherever the app offers more than one way to do a thing — a puck brought onto a seat, and every other such case the
  agent finds; his examples are not the limit — the guide shows each way, and every way names what to test; each case
  is drawn (the agent's call) as a slide of its own, one picture per way side by side, each with its short steps [D412].
- The schedule's two editing modes and when to use each: the Scheduler Board — one day, with more functions dedicated to
  a day — and Edit Schedule's week — the big picture, for smaller edits [D416].
- The two modes are drawn (the agent's call) on a slide setting them side by side — how each is opened, what each is
  for, what the board has that the week does not — and each schedule-making slide says which mode its step uses; each
  checked in the running app [D416].
- What happens by itself: for one action — one input filed, and each other action that spreads the same way — every
  place in the app that changes without anyone touching it, and what it shows there; never the rules engine's
  arithmetic [D415, D410].
- Each such action is drawn (the agent's call) as a "where one change shows up" slide, in still screens — the action in
  the middle, each place it reaches around it with a small real picture and one line — built from the app's own map of
  how an edit travels (`raptor-port/docs/feature-impact.md` §2) and proved in the running app [D415].
- The Leave War's own work flow, in his order: the admin creates the period and opens its dates for bidding; members
  bid; the admin closes the dates and decides the bids — closing first, then approving, is his best order, though the
  agent's reading of D1177 lets him decide a bid at any time — and texts the squadron [D413, D1177, D1208].
- In that flow members edit their remarks at any time; later changes are made mainly by the member through inputs; and
  the admin may still edit on the war directly, since he sees everything there at once [D413, D1177].
- A member's later change, as he described it: management's verbal approval first, then he files or edits the leave on
  the Inputs page himself; it lands approved — never waiting in Approvals, which he turned down — closed dates never
  stop it, and the Leave War follows by itself [D1166, D1177].
- The Leave War's flow is drawn (the agent's call) as a work flow slide of its own beside the day's, in two lanes, each
  stage a real picture and its journey slide; each stage is checked in the running app before it is drawn, and any
  place the app differs from his description is put to him, never drawn over [D413, D1177].
- How the Leave War's manning is set up and customised — where the manning rows come from, how an admin adds, changes
  or removes one, and what the grid shows after — as screens, not the count's arithmetic [D417].
- The Tracker in full: how a flow chart is made — each tool and what it does, joining events, editing an event's
  details — how a member updates it and what he sees, every other way to update, what it refuses (an NA cannot have
  fails), making students and courses, export and import [D414].
- The Tracker is drawn as several slides, its steps and its ways, each checked in the running app and each naming what
  to test [D414].
- His lists are not the limit: the agent looks in the app for the rest and adds what else it finds, the schedule's
  several ways and the Tracker's among them; his "All I can think of" closed his own list of what to add, for now
  [D412, D414, D417].

## When it is remade
- The guide is re-shot and rebuilt only when he says so — not after each app change, and not on a schedule [D403].
- A change that alters a screen the guide pictures files nothing and re-shoots nothing by itself; a chat may mention,
  once, in its closing report, that the guide now shows an older screen [D403].
- Refreshes already filed wait for his word too — `[ITFLOW-OIL-RESHOOT]`, which collects what has changed since the
  deck was drawn [D403].

## Settled — leave as they are
- The deck and its PDF, built 29 Sep 26 and in the guide's folder — its format his own, its look the approved sample's;
  it still pictures what has changed since, the Leave War's stages among it, collected on `[ITFLOW-OIL-RESHOOT]` for
  his word; how to re-shoot and rebuild it then is the folder's README, §Remaking it after a screen changes [D410,
  D411, D403].
- The two-slide sample shown to him first was a one-off step of that first build, approved 29 Sep 26 — not a standing
  rule [D410, D411].

## From other areas (each stated on its own area's file)
- The Leave War's: its stages (draft, open for bidding, bidding closed, published) go — members bid only on the open
  dates the admin sets in the "Open for bidding" window, nothing is open until he opens it, and with nothing open the
  chip reads "Bidding closed" — a chip, not a stage [D1177].
- The Leave War's: a member may still delete his own pending bid on a day since closed; the day's note then reads that
  his bid is pending a decision and he may delete it if he no longer wants it [D1225, D1177].
- The Leave War's, checked by the guide against his description: an approved leave reaches inputs at approve, and a
  drag across days that goes below zero asks first, as a one-day bid does; with the stages gone, the admin decides bids
  at any time and a member's approved leave offers him its remarks at any time, the leave itself changed on the Inputs
  page — the agent's readings of D1177 [D418, D1177, D1166].
- The Leave War's later direction: every entry on the war — leave filed on the Inputs page among them — can be moved,
  deleted and its days and remarks changed there, a member only his own and an admin anyone's; it replaces the agent's
  reading "change it on the Inputs page"; drawn first, its own job, filed as `[LW-FULL-EDITING]`, not yet built
  [D1724].
- The Leave War's: whoever runs it is not flooded with notices of new requests — not while bidding is open, when he
  closes the bids and then approves, and not afterwards, when leave is daily operations [D1208].
