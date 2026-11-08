# Dataverse handover — read this first

For the person designing RAPTOR's Dataverse tables. Written 10 Sep 26; "What happens next" brought up to date
29 Sep 26, when the database step started (D354).

**CHANGED 1 Oct 26 (owner, D473 — on the IT side's own advice): the database comes at the END, once the app's features are
built, and the table format and schema are written on OUR side (the owner, with his AI) for you to enter into Dataverse —
you no longer design them.** Until then our proposal (`data-model.md` §3) is kept up to date as each feature is added. The
sections below are as written under the earlier agreement: where they say "You design the tables" or "Now, before your
tables settle", this paragraph wins. What we still need from you is smaller: an example of the format you want the tables
written in, your naming rule and prefix, and the limits of the platform (no plug-ins or Custom APIs today; Dataverse
functions and Power Automate flows; what the 2,000-row reading limit is).

**ANSWERED 8 Nov 26 — your written reply to our 12 questions (`OUTSTANDING.md` `[IT-QUESTIONS]`):** you take our table
list as a `tables.json` in your kit's format and build it with the same kit; the PP CoE has one production environment for
code apps, sets the short code when it creates the tables, and builds them exactly from the `tables.json` we finally send —
our own test tables, in his test account (his D1749), are for our testing only; access to the app is one user security
group with basic access, and who may do what is the app's own roles, controlled inside the app — database-level rights are
yours; no outside connectors, only M365 services such as Power Automate and Teams; large files in SharePoint with a link;
a flow runs by itself, owned by the unit's role-based account; auditing is on and managed by you. Still to ask: your short
code early, what basic access allows on the app's tables, SharePoint from the app and who may read it,
how long the audit is kept, how the unit gets a role-based account, and the first admin (item 8).

## What we agreed

- **You design the tables.** Our documents are a proposal and an inventory,
  not a build order. Take what fits, change what doesn't, and tell us the
  result.
- **The app will adapt to your tables.** Every save the app makes goes
  through one doorway (`raptor-port/src/storage/`). When your tables exist we
  write one adapter behind that doorway, to your schema, and the screens do
  not change. Nothing on our side is built against a guessed schema before
  then.
- **Before that, we key everything by id — done (10 Sep 26).** Two things
  were keyed by a human string — Tracker students by their typed name,
  schedule rows by their position. A student is now `{ id, name, pid? }`
  (an opaque enrolment id, the name a label, the person id where they came
  off the roster) and every schedule row carries a stable `rid`; rows are
  still addressed by position inside the app, which is our concern, not
  yours — the id is what your keys map onto.

## The SWiFT kit (D1530, 31 Oct 26)

He has the SWiFT build-and-deploy kit — the guide for apps the PPCoE puts on MINDEF M365 (a Power Apps code app, tables
in Dataverse built from a written table list). Read against it on 31 Oct 26, Raptor fits its road in shape (one doorway
for every save, the table list written on our side, screens switched inside the app, nothing loaded from outside).
**Set aside for now, on his order (D1530):** all its red flags, its rule against hosting on Vercel, and its rule that the
GitHub project be private — Vercel and the public project stay until he says otherwise. Its other points are not yet
ruled. Its own files, marked OFFICIAL (CLOSED), are kept out of this public project — the agent's reading, not
checked with him.
**React Doctor**, the kit's code check, may be run on Raptor to count its findings for the move plan (D1531) — a count
and a list, nothing fixed without his word; whether new code follows its rules is his to rule once he has seen the count.
It may be run the kit's way, its findings sent to the tool's maker for the score (D1533) — nothing goes to RAiD or the PPCoE.
**The order (D1532):** building goes on and the database step stays at the end (D473); at a good stopping point in the
Tracker's work the app is first put on his own M365 with no database — a hosting trial, saving in the browser as today
— so he can test it there himself (`OUTSTANDING.md` [M365-HOSTING-TRIAL]).
**The move plan** — every point of the kit set against Raptor, numbered for him to strike, with React Doctor's count:
`docs/superpowers/plans/2026-10-31-m365-move-plan.md` (`[M365-MOVE-PLAN]`).

## Read in this order

1. **`data-schema.md` — what the app stores today.** Every record, every
   field, the storage keys, which of the three modules owns which record, and
   the "loose spots" (the two string keys above, positional slot keys). This
   is the inventory you are mapping from.
2. **`data-model.md` — what the app needs from a shared store.** Our proposal,
   in Dataverse terms. The parts that matter most to a table designer:
   §2 the rules every table follows (opaque id, version on every write, an
   audit of who and when, one date format, soft delete); §3 the table
   catalogue with every column; §8 which module owns which table and reads
   which; §9 how two people editing at once is handled; §10 what happens to
   children when a parent goes; §11 the security roles.
3. **`architecture-direction.md` — the shape.** Three functional modules
   (scheduler, leave, training tracker) in one front end, one backend, one
   database, an API contract per module. Why it is not microservices and not
   a database per module.

## What we need from you

- The table and column names with their types, as you build them; the
  lookups between tables; the values of every choice column; the security
  roles and which role may create / read / update / delete which table.
- Your answers to the open questions in `data-model.md` §12, in one line
  each:
  1. the publisher prefix and naming convention; **answered 8 Nov 26: the PP CoE sets it when it creates the tables —
     please tell us early, so his test tables match;** *(owner, D1753, 8 Nov 26): his test tables use "talon" for now —
     if yours differs, the app's table names are changed once to match;*
  2. where files live (SharePoint library, Dataverse file column, or Blob); **answered 8 Nov 26: SharePoint for large
     files, a link saved in the table — who may read them there still to settle;**
  3. how a signed-in person is matched to a `Person` row the first time — **answered by the owner, 25 Sep 26
     (D165):** by an admin mapping step. Everyone signs in with their own defence mail (Microsoft) account;
     the app's admin creates each `Person` (his callsign or name — ONE field, "Callsign/Name", D219 — initials,
     pilot / WSO / personnel, CAT; admin or member) and records that person's defence mail address on it; the
     first sign-in with that address becomes that person. **Built in the app 26 Sep 26 (`[ACCOUNTS]`,
     `[ACCOUNTS-NEW-PERSON]`):** accounts managed on Admin → Users, one per person, tied to a callsign; the
     "View as" picker is gone; a new person is made ONLY there — alone (someone who won't sign in) or with his
     account, in one step (D214, D217); a person on no list asks for access giving the same (callsign/name,
     initials, seat, CAT) and the admin approves — linking a puck, or making the new `Person` from what he gave
     together with the `User` — sets member or admin, or declines (D204); each admin's bell lights for a new
     request until he has seen the list (D216, D227 — a Teams message at the database step); an admin switch,
     off by default, lets people waiting read the published week as a guest; the app keeps no password. The `User` and `AccessRequest` tables, and the
     permissions table the app mirrors (drift-tested), are `data-model.md` §3 and §11. Who may enter the app at
     all (the security group / environment roles) is set in your environment, not by the app;
  4. how long the edit log is kept and who may read it; **(owner, D1752, 8 Nov 26 — replacing D351): at the database step
     Admin → Data's "Clear edit history…" is removed, so nobody erases the change history by hand; until then it stays as
     built. The app keeps its history as long as your audit rule says (our plan: older lines dropped by the app itself
     only if room is short)** — *8 Nov 26: auditing is on and managed by you; how long it is kept still to ask*;
  5. whether the attempt-by-attempt training history is built from day one
     or after the first migration stage;
  6. whether a day of the flying programme is split into its rows from the start or later — **a week is
     stored one record per DAY from the start (owner, D355, 29 Sep 26): a scheduler takes a day to edit it, and
     two schedulers on two days of one week must never write the same record** (`data-model.md` §9, the day
     lock, with its own two questions for you, Open questions 8 and 9); *8 Nov 26: the lock is a simple mark the app holds (his D1751), so question 8 is gone;*
  7. whether the app calls the Dataverse Web API directly from the Code App,
     or a thin API sits in front of it; *8 Nov 26: directly — no plug-ins or outside connectors, so nothing can sit in
     front;*
  8. **the first admin of your empty tables** (`data-model.md` §12 q11, 30 Sep 26): a build setting naming his sign-in
     and person — or a `Person` you made — from which the app's first start makes his admin account, in one changeset;
     which you prefer, where app settings live, and which value sign-in hands the app.

## Constraints that are not negotiable

- **One identity.** A person is one `Person` row, referenced by id from every
  other table (seats, marks, bids, inputs). Never a callsign as a key.
- **A version on every write, and who/when on every row.** The app must be
  able to detect that someone else changed a record since it read it, and to
  say who changed what. Dataverse's own `versionnumber`, `createdby`,
  `modifiedby`, `modifiedon` are fine for this.
- **Published records never change.** An issued amendment and a sign-off are
  history; they are appended to, not edited.
- **Medical information — AMENDED 26 Sep 26 by the owner (D211, "Keep as today").** Every member of the
  squadron may read a medical absence, its remarks and any attached document, as the app does today (his
  27 Aug 26 rule, re-confirmed knowing it departs from what this line first said: "readable by the person and
  admins only"). Someone signed in but not yet given access (a guest, D204) sees it too on the published schedule he
  is shown (D213, the same day), and nobody outside the squadron's own accounts reads it at all.
- **No real names in the public repository.** Demo data only; anything with
  a real person in it stays in the tenant.
- **A change to someone's access takes effect on his very next request** (added 26 Sep 26, from Astra's read
  of `[ACCOUNTS]`). Switching an account off, demoting an admin, or tying it to a different person must stop the
  old rights at once — in every open tab and on every device — so the server checks the CURRENT account and its
  role on every write, never a copy the app took when he signed in. Today's app cannot: its accounts live in one
  browser and its open tabs share nothing, so a change reaches only the next sign-in on that same browser.
  *8 Nov 26 — your answers 8 and 9:* roles are the app's own, so it is the app that reads the CURRENT account and its role
  from the tables before every save, on every device; removing a person from the app's security group — access to the app
  at all — is yours.
- **A person is never erased — a delete is a hidden mark** (added 27 Sep 26, `[POST-OUT-OUTCOMES]` — owner D287, D290,
  D297). A man who leaves flying for good is deleted: his `User` goes and his `Person` row is KEPT with the tombstone set
  (and the first day he is gone, `deletedFrom`) — invisible everywhere, his callsign free for someone new, never restored.
  Every day he already flew keeps pointing at him (the published record stays true); days from `deletedFrom` lose him.
  So the security roles need no hard delete on `Person`; the delete is an update, and the same row must still be
  readable wherever a past day is drawn. An account can also be **suspended** (`enabled` false — D280, D285) and enabled
  again when he is back; one suspended by a posting out is marked so (the app enables only that one by itself).
  Callsigns are unique among the people ON the roster, not across archived or deleted rows (D286), and — with more
  than one community on the app — within a community, not across the app (D288).

## What happens next, on our side

1. Stable ids (the two string keys become ids) — done, with tests (10 Sep 26).
2. **Now, before your tables settle (owner, D354, 29 Sep 26 — the database step has started):** how the app saves
   changes so it suits a shared store — one record per leave, per person and per Leave War row instead of one record
   each for the lot; a save your store refuses (signed out, not allowed, someone changed it first) says so and stops
   instead of retrying for ever; a slow or half load says so and never falls back to demo data; nothing seeds demo data
   into a shared store (`data-model.md` §7; our backlog item `[DB-READINESS]`). We will tell you when a record's shape
   changes.
3. When your schema is shared: the adapter behind the storage doorway, written
   to your tables, passing the doorway's existing contract tests; then sign-in.
   **CHANGED 7 Nov 26 (his D1749, and your answer that you take no solution files):** at the database step your own
   table-building kit builds the tables first in his test account, where the app is tested; then you get the tested
   table list in the kit's format and build the same tables with the same kit. The 2 Nov 26 recommendation below is kept
   as it was. **Confirmed 8 Nov 26 (your answers 1 and 4):** a `tables.json` in your kit's format, which you build with
   the kit in your one production environment, with your short code; ours, in his account, are for testing only.
   **How the tables are built and handed over (the agent's recommendation of 2 Nov 26; its test held to the database step,
   his D1571):** a re-runnable setup script, written from `data-model.md`, builds every table in his own environment through
   Dataverse's Web API — each column's exact type and length, the links between tables, the unique keys — straight into a
   named solution; that solution is exported as a managed package and handed over, the script beside it for you to read or
   run. Not CSV files: an import makes one table a file and sets no links, lengths or keys. Whether a script may sign in as
   him on his PC is untested until then.
   **No data is imported — CORRECTED 29 Sep 26** (this line promised "a one-time import of what is in the browsers
   today"): everything in the browsers now is demo data and is cleared before the database step (owner, D54, D56), so
   your tables start EMPTY and the admin enters the real people himself (question 3 above, D165). The one thing that
   crosses is the owner's hand-drawn training charts, which he moves himself with the app's own Export → Import of a
   file (D120; `data-model.md` §6) — no import code on either side. `data-model.md` §5 still maps every record the app
   keeps to its table, for the adapter to follow, not as data to carry over.
4. Others' changes reach every open screen by themselves, every 30 seconds, from the day the data is shared (owner,
   D356); how two schedulers take turns on one day is `data-model.md` §9 (the day lock, D355).

Questions to the owner; he will bring them to us.

**Before the app goes out for testing (his D1383, 26 Oct 26):** signing in always opens on today's date — the demo week's date is accepted only while the demo data is what is worked on. Filed as [LOGIN-OPENS-TODAY].
