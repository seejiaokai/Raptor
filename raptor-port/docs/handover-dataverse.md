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
  3. how a signed-in person is matched to a `Person` row the first time;
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
- **Medical information is restricted.** A medical absence and any attached
  document are readable by the person and admins only.
- **No real names in the public repository.** Demo data only; anything with
  a real person in it stays in the tenant.

## What happens next, on our side

1. Stable ids (the two string keys become ids) — done, with tests (10 Sep 26).
2. When your schema is shared: the adapter behind the storage doorway, written
   to your tables, passing the doorway's existing contract tests; then a
   one-time import of what is in the browsers today; then sign-in.
3. Live updates (a change feed) once the data is shared.

Questions to the owner; he will bring them to us.
