# Architecture direction — modular applications on a common data source

Written 9 Sep 26 for the technical team, in response to two recommendations:

> **Define and develop the backend data architecture.** Define the
> application's data model and database schema — syllabus structures, training
> events, students, progression records and scheduling data — to support live
> data updates, multi-user access and long-term maintainability.

> **Adopt a modular development approach for future expansion.** Design
> individual functional components as modular applications linked through
> common data sources rather than a single monolithic application, to improve
> maintainability, allow incremental deployment of capabilities, and reduce
> system-wide impact when enhancements or bug fixes are required.

The first is answered by `docs/data-model.md` (the designed target model) and
`src/engine/schema.ts` (the declared shapes, pinned to the live data by
`schema.test.ts`). This document answers the second and sets the order of
work. It is the standing direction; `CLAUDE.md` routes here.

## 1. Where RAPTOR stands today

RAPTOR is one deployed bundle carrying **three functional applications**, each
with its own store, its own tests and its own storage keys:

| Module | Code | Store | Storage seam |
|---|---|---|---|
| Scheduler (the flying programme, validation engine, publishing) | `src/engine`, `src/state`, `src/ui` | `state/store.ts` | `HOOKS.storeBackend` → `src/storage/` |
| Leave War (leave bidding and the OIL ledger) | `src/leavewar/` | its own | `leavewar/state/storage.ts` (session-only today) |
| Tracker (OCU syllabus progress) | `src/tracker/` | `tracker/app/core.js` | `tracker/storage.js` (localStorage under `raptor:tracker/`) |

The boundaries between them are enforced, not merely intended: the seams into
Leave War are four named functions; the seams into the Tracker are three
no-import modules (`role.js`, `people.js`, `TrackerPage.tsx`), and a unit test
fails if anything under the Tracker imports the engine. Every write goes through
one mutation funnel and one storage doorway. In the vocabulary of the
recommendation, RAPTOR is already a **modular monolith**: separable modules,
one deployable.

What it lacks is the **common data source**. Today the data source is each
user's browser. There is no shared database, no server-side rule enforcement,
no real accounts, and no way for one user's edit to reach another's screen.

## 2. What "modular applications linked through common data sources" should mean here

Three readings are possible. Only one fits a ~50-user, one-organisation system
maintained by a small team.

**(a) Separate deployable front-ends, one backend.** Each module built and
released as its own web app; all talk to one API and one database. Maximal
release independence; the cost is three build pipelines, three login flows,
navigation between apps, and duplicated shared UI (people, roles, the
callsign chip). Justified when modules have different owners or release
cadences. Not yet true here.

**(b) Microservices — a backend per module.** Each module with its own service
and its own database, integrated over the network. This is what "modular
applications" sometimes evokes, and it is the wrong reading for this system:
the modules share one identity (Person), one roster, one calendar, and cross-
derived data (a published flying day credits OIL in Leave War; a Tracker mark
will one day feed the scheduler's qualification picture). Splitting the data
would turn every one of those into a distributed-consistency problem. Rule of
thumb: one team, one deploy, one database, until a measured reason appears.

**(c) A modular monolith on the front end, one backend service, one database
(recommended).** Keep the three modules in one codebase and one deploy, with
the seams they already have, and add the missing half: a single backend that
owns the data and the rules that must hold regardless of which screen writes.
Each module gets a written API contract; no module reads another module's
tables directly. Modules are shipped incrementally behind feature flags. Split
a module into its own deployable (reading (a)) only when it needs its own
release rhythm — the seams make that a mechanical move later, not a rewrite.

This reading satisfies each stated goal:

- *Maintainability* — one codebase, one set of conventions, one test pipeline,
  strict seams (already enforced).
- *Incremental deployment of capabilities* — feature flags per capability and
  per module, so a change ships dark, is turned on for a few users, then all.
- *Reduced system-wide impact* — a module's change cannot touch another
  module's data except through the API contract; the contract is versioned;
  each module's test suite runs as its own CI job (already the case).

## 3. The target shape

```
┌──────────────────────────── one deployed front end ───────────────────────────┐
│  Shell (login · nav · people · roles)                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                        │
│  │  Scheduler   │   │  Leave War   │   │   Tracker    │   ← modules, strict    │
│  │  module      │   │  module      │   │   module     │     seams, own tests   │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘                        │
│         │  storage seam (the ONE route: whiteboard → postman → backend)        │
└─────────┼──────────────────┼──────────────────┼────────────────────────────────┘
          ▼                  ▼                  ▼
┌─────────────────────────── one backend service ───────────────────────────────┐
│  API per module (versioned)   ·   auth (SSO)   ·   roles at the write path     │
│  version check per record     ·   audit (who / when)   ·   change feed         │
└──────────────────────────────────────┬────────────────────────────────────────┘
                                       ▼
                         ┌─────────────────────────────┐
                         │   one database               │
                         │   shared: Person, Course,    │
                         │           Calendar, Audit    │
                         │   owned per module: the rest │
                         └─────────────────────────────┘
```

**Ownership rule.** A table is owned by exactly one module, which is the only
writer. Shared tables (Person, Course, Calendar, Audit) are owned by the shell.
Another module reads them through the API, never joins to them in its own
queries. Cross-module derivations (OIL credited from the published schedule;
a qualification picture from Tracker marks) are *derived* by the owning
module from a change feed, never written into another module's table — the
same rule the Leave War sync already follows in the browser.

**Contract rule.** Every API endpoint is versioned, and a module's contract
lives beside its code (an OpenAPI file per module). A change to a shared table
is a shell change with its own review.

## 4. The order of work

Each stage is independently deployable and reversible; none needs the next.

1. **Data model** — done, under review: `docs/data-model.md`. Stable ids,
   version + audit columns, Person as the one identity, Enrolment and Attempt
   for progression, the mapping from today's records, the four-stage
   migration inside it.
2. **API contracts** — one OpenAPI document per module, written FROM the data
   model and the existing storage-seam calls (`src/storage/` already names
   every read and write the front end makes, so the contract is a transcription,
   not an invention). Review with the team before any server code.
3. **Backend service** — one service implementing the contracts over the one
   database, with the three server-side rules the browser cannot enforce:
   role checks at the write path, an `if-match` version check on every write
   (no silent last-write-wins), and an append-only audit row per write.
4. **Accounts** — the prototype login replaced by the organisation's SSO;
   roles come from the directory, not from a hard-coded list. This is the
   point at which the public repo's demo data must be entirely synthetic
   (it already is, since the 9 Sep 26 masking).
5. **Storage seam → API** — swap the browser backend behind `src/storage/`
   for the API client. The front end does not change above the seam; this is
   the reason the seam exists. Leave War and the Tracker migrate through their
   own doorways the same way, one module at a time, each behind a flag.
6. **Live updates** — a change feed from the backend (server-sent events are
   enough at this scale) driving the same `notify()` the store already uses,
   so a colleague's edit repaints your screen without a reload.
7. **Operations** — backups, a restore drill, structured logs, an error
   tracker, an uptime check. Not optional for a system a squadron plans on.

## 5. Practices to hold to during the migration

- **The seam is the contract.** No new state outside the mutation funnel and
  the storage doorway (CLAUDE.md §Architecture rules). Anything that bypasses
  them will not survive stage 5.
- **Behind a flag, then on.** Every capability that changes what users see
  ships switched off, is turned on for named users, then for everyone.
- **Every record carries `version`, `createdBy/At`, `updatedBy/At`.** The
  Tracker's `by`/`at` stamps (9 Sep 26) are the first instance in the browser;
  the backend makes it universal.
- **Never key on a human string.** Names, callsigns and dates are attributes;
  ids are keys. Students keyed by name and schedule rows keyed by position are
  the two known exceptions, listed as stage 2 in `HANDOFF.md`.
- **Tests per module, gates per PR.** The five gates already run as parallel
  CI jobs per module; keep it that way as modules gain server-side tests.
- **One place per rule.** A rule read in two places is a drift seam (the
  robustness doctrine). On the server this means the API validates; the front
  end mirrors for feedback but never decides.
- **Public repository discipline.** No real names, marks, dates, secrets or
  hostnames — synthetic demo data only, tripwire-tested (`scrub.test.ts`).

## 6. What this does NOT recommend

- Not microservices, not a database per module, not a message bus — the
  scale and the shared identity argue against all three.
- Not a rewrite of the front end. The modules and seams stay; the backend is
  added beneath them.
- Not separate deployable apps yet. The seams make that a later, mechanical
  split if a module ever needs its own release cadence.
