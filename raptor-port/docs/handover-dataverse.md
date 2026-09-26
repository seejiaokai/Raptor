# Dataverse handover — read this first

For the person designing RAPTOR's Dataverse tables. Written 10 Sep 26.

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
  1. the publisher prefix and naming convention;
  2. where files live (SharePoint library, Dataverse file column, or Blob);
  3. how a signed-in person is matched to a `Person` row the first time — **answered by the owner, 25 Sep 26
     (D165):** by an admin mapping step. Everyone signs in with their own defence mail (Microsoft) account;
     the app's admin creates each `Person` (callsign, name, admin or member) and records that person's
     defence mail address on it; the first sign-in with that address becomes that person. **Built in the app
     26 Sep 26 (`[ACCOUNTS]`):** accounts managed on Admin → Users, one per person, tied to a callsign; the
     "View as" picker is gone; a person on no list asks for access and the admin approves (links a puck,
     sets member or admin) or declines (D204); an admin switch, off by default, lets people waiting read the
     published week as a guest; the app keeps no password. The `User` and `AccessRequest` tables, and the
     permissions table the app mirrors (drift-tested), are `data-model.md` §3 and §11. Who may enter the app at
     all (the security group / environment roles) is set in your environment, not by the app;
  4. how long the edit log is kept and who may read it;
  5. whether the attempt-by-attempt training history is built from day one
     or after the first migration stage;
  6. whether a week of the flying programme is stored as one record first
     and split into rows later, or split from the start;
  7. whether the app calls the Dataverse Web API directly from the Code App,
     or a thin API sits in front of it.

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

## What happens next, on our side

1. Stable ids (the two string keys become ids) — done, with tests (10 Sep 26).
2. When your schema is shared: the adapter behind the storage doorway, written
   to your tables, passing the doorway's existing contract tests; then a
   one-time import of what is in the browsers today; then sign-in.
3. Live updates (a change feed) once the data is shared.

Questions to the owner; he will bring them to us.
