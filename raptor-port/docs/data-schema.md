# Data schema, as shipped

What RAPTOR stores, the shape of each record, and where it lives today.
Read this before the shared-database (Dataverse) step: it is the map of the
tables that step has to hold, taken from the working code on 8 Sep 26, not
from a design. Nothing here is proposed — every field is one the app reads
or writes now. The last section lists what is *loose* about these shapes
and what a database migration would want to tighten.

Companion docs: `engine-rules.md` (what the validator does with these
records), `ui-contracts.md` (how the screens render them),
`leavewar/` and `tracker/` (those two modules' own notes).

## The three storage worlds

RAPTOR is one app, but it keeps three separate stores, each behind its own
"door" (a small module every save goes through). The doors are the seams a
shared database replaces; nothing above a door knows where a key lives.

| World | Door (the seam) | Key prefix (built site) | Backed by today |
|---|---|---|---|
| Scheduler | `store` + `storeBackend.impl` in `src/engine/hooks.ts`, plugged in once by `src/main.tsx` | `raptor:settings/*`, `raptor:weeks/*` (rows — phase 1), `raptor:inputs/<iid>`, `raptor:people/<pid>`, `raptor:plan/pp:<id>` and `raptor:plan/dm:<iso>` (one row each since 30 Sep 26, `[DB-READINESS]` group A, phase 2; `inputs/all`, `people/all`, `plan/all` until then) (legacy `sqn142_` imported once) | the whiteboard (`src/storage/`) → BrowserBackend on the built site |
| Leave War | `StorageBackend {read, write, remove, keys}` (remove and keys since 30 Sep 26, `[DB-READINESS]` group A phase 0) in `src/leavewar/state/storage.ts`, now the whiteboard-backed adapter | `raptor:leavewar/*` (legacy `leavewar:` ignored) | the whiteboard (`src/storage/`) → BrowserBackend on the built site |
| Tracker | `storage {get, set, delete, list}` (async) in `src/tracker/storage.js`; per-browser prefs via `ocuLocal:` (NOT through the whiteboard) | `raptor:tracker/*` (legacy `ocu:` imported once); prefs stay `ocuLocal:*` | the whiteboard (`src/storage/`) → BrowserBackend on the built site — the record; the .json file is an import/export FORMAT only (9 Sep 26) |

Two smaller seams sit beside these: `docBackend.impl` in `src/state/docs.ts`
(uploaded attachments — an in-memory cache over a per-browser IndexedDB
drawer, `src/storage/docstore.ts`, wired by `docBoot`; see Attachments) and
`HOOKS.whoami()` (who is making an edit — the one hook that changes the day
real accounts arrive).

History worth knowing: the Tracker, before it was merged in (7 Sep 26), had
a `sync/cloud.js` layer written for Dataverse / Firebase over a SharePoint
file. It never switched on outside the hosts it was written for and was
removed at the merge; `storage.js` is what replaced it.

## What persists, and what is session-only

This is the single most important fact for the database step. Since the
storage seam (8 Sep 26) the whole app boots through the whiteboard
(`src/storage/`), so on the **built site** (BrowserBackend) everything
persists together, per browser; in **dev and tests** (MemoryBackend) every
boot starts clean by design. This replaced the pre-seam doctrine (owner,
23 Aug 26 — "it's ok that u don't remember once I exit the session") once the
owner approved "everything persists on the built site".

| Data | Lives in | Survives reload? |
|---|---|---|
| Roster (PEOPLE), schedule + publish book + per-week stash (DAYS/SCHED), inputs (INPUTS), planning pucks (PLANPUCKS/DAYRMK) | whiteboard → backend (Browser on the built site, Memory in dev/tests) | **Yes** on the built site (per browser); no in dev/tests by design |
| Templates, house orders, rule overrides, cancel reasons, look-ahead, stores list | whiteboard → backend (settings collection; legacy `sqn142_*`) | Yes |
| Every Leave War record | whiteboard → backend (Browser on the built site, Memory in dev/tests) | **Yes** on the built site (per browser); no in dev/tests by design |
| Tracker charts and students | whiteboard → backend (`raptor:tracker/*` on the built site) + the syllabus file | Yes |
| Undo history | scheduler session memory | **No** — session-only by design |
| The change history (the edit log) and each person's seen record | settings collection, one row per line (`elog:<lineId>`) and one per person (`seen:<pid>`) since 30 Sep 26 (`[DB-READINESS]` group A phase 4.3 — they were `elog` and `changeseen`, `[DRAFT-PENDING]`, 28 Sep 26) | **Yes** — and it outlives a sign-out (D336 (b)) |
| Attachment bytes (medical documents) | in-memory cache → per-browser IndexedDB drawer (`raptor-docs`, `src/storage/docstore.ts`) on the built site; memory-only in dev/tests | **Yes** on the built site (per browser, since 8 Sep 26); no in dev/tests |
| Accounts, access requests, each admin's seen requests | settings collection, one row each — `account:<id>`, `accessreq:<id>`, `reqseen:<accountId>` (since 30 Sep 26, `[DB-READINESS]` group A phase 4.4; they were `accounts` and `accessreqs`) — below, §Accounts and session | Yes |
| The store's own stamp, `settings/schema` | ONE object since 30 Sep 26 (`[DB-READINESS]` group A phase 0, `src/storage/schema.ts`): `{ stage, dataFormatVersion, initialized, appliedAt, minClient }` — the design's `SchemaVersion` row (`data-model.md`). `initialized` is how the app knows the store has STARTED (it replaced the sniffs of `inputs/all` and `leavewar/wars`); a first boot writes its seed and `initialized` in ONE saved group; a wipe clears it; a store ahead of the build is never touched. A bare number (every store before) still reads, as format 5 with `initialized` unknown, and is upgraded at its next boot | Yes |
| The change log, `changes/*` | its own collection since 30 Sep 26 (group A phase 0 — cleared by a wipe with `inputs`, `weeks`, `leavewar`); written since phase 4.1: ONE `changes/<clientBootId>-<first seq>` per saved group, in that group — `{ type, seqs, actorId, at, items: [{ table, key, op }] }`, a pure invalidation log (it names the rows, never their values) — by the whiteboard's seal (`src/state/changebatch.ts`); the newest 200 kept, the oldest retired in the group that adds the newest. A group written outside every command is never sealed — only the Tracker's first mount (its seed and migrations), named in `src/state/changebatch-rollcall.test.ts` | Yes |

**What an empty store starts with — the boot policy (since 30 Sep 26, `[DB-READINESS]` group A phase 5 — `src/bootpolicy.ts`,
`src/boot.ts`).** The build's own settings choose it: the DEMO (the default — every test, the dev server, the e2e suite,
his preview) seeds an empty store with the demo world as always; a SHARED store (`VITE_SEED_DEMO=false`) is never
seeded — no demo requests, roster, weeks (the two authored demo weeks read blank), accounts, Leave War world or Tracker
course — and its first boot stores exactly the stamp, its FIRST ADMIN's person and account (from `VITE_BOOTSTRAP_ADMIN`:
a sign-in name and a person, or a person IT already made), and the one change-log batch naming them, in one saved group.
A shared store whose first admin is not configured, or not as a person the app can make, refuses to start and writes
nothing. A started store is read as it stands under either policy — no account row then means no account under a shared
store's policy, a list with no admin is left as it is there, and no war stored means no war under either (the Leave War
shows "No leave period yet"). Every boot resets the live scheduler data in place from frozen copies of the demo, or to
blank (`src/state/seeds.ts`), before storage is read.

`?fresh=1` on the URL forces the Memory backend for a clean-start demo. So
"moving RAPTOR to a database" is now giving these already-per-browser shapes
a permanent, **shared** home, rather than saving them for the first time.

---

## World 1 — the scheduler

### A day's OIL evidence (`Day.oild`, `Day.oilev` — 21 Sep 26, `[OIL-AUTO-REMOVE]`)

Two fields, and the difference between them is the whole design (`engine/oilev.ts`,
`docs/engine-rules.md` §Weekend/PH work earns OIL):

- **`oild` — the scheduler's DECISIONS. Day content.** `{ blanket?: 1, items?: {
  <itemKey>: 0 }, people?: { "<personId>|<itemKey>": 'allow' | 'deny' }, pa?: { "<personId>|i:<iid>": <holding> } }` —
  `pa` (30 Sep 26, `[DB-READINESS]` group A phase 6 (a)): the holding of the request each decision about it was made under
  (the request's `hand` then); a decision about a man the request has LEFT since (`Input.leftAt`) reads as nothing. Stored on
  the live day, so it rides the snapshot, a parked plan, an undo and the persistence
  funnel like any typed time, and changing it is publishable as an amendment. Absent
  means nothing was decided, so the ordinary rules decide alone — which is why a mark
  turned on and off again is DELETED rather than left as an empty object.
- **`oilev` — the FROZEN evidence. On an ISSUED SNAPSHOT'S day copy ONLY.**
  `{ iso, earns, d: <the decisions>, inputs: [{ iid, person, type, asks, acc, win,
  ans }], sent: { <itemKey>: personId[] }, rv?: { reportLead, debrief, oilFullMin } }` — `rv` (6 Oct 26,
  `[OIL-WORK-START]`, D592 (4)): the three Logic values the day's OIL was worked out from, in minutes, as they stood at
  publication; on a day that earns only. Every reader of the block's OIL uses them, so a later Logic change moves a
  published day's OIL only when the day is published again. A block without it (an earlier build's) reads today's
  values. Attached by `publish.ts:daySnap` and
  stripped from every clone back onto a working copy (`drafts.ts:liveDay`). It is the
  ONLY thing the credit pass reads on a published day. **Never present on a live day**
  — there it is derived on read, so it cannot go stale and a plan restored months
  later cannot resurrect an obsolete projection.

An item key is `i:<inputId>` for anything derived from an input (including a ground row
the input landed on — the row is deleted and recreated on every member edit, the input
is not) and `r:<rowId>` for a hand-built row.

**On the wire to the database:** `oild` is real squadron data and must migrate. `oilev`
is part of the ISSUED DOCUMENT and must migrate WITH its snapshot — it cannot be
recomputed later, which is exactly why the cutover clears pre-existing weeks
(`storage/reset.ts`, schema 5) rather than trying to rebuild evidence nobody stored.


### People (the roster) — `PEOPLE[id]`, `src/engine/people.ts`

One record per person, keyed by a short lowercase id that is the same id
the schedule, the inputs and the Leave War all use.

| Field | Type | Meaning |
|---|---|---|
| id (key) | string | e.g. a short handle; never shown, used everywhere |
| `cs` | string | callsign — the display name |
| `seat` | `'FCP' \| 'RCP' \| 'GND'` | front cockpit (pilot), rear cockpit (WSO), ground |
| `q` | `'OCU' \| 'D' \| 'C' \| 'B' \| 'A' \| 'IW' \| 'IP' \| 'IR' \| 'FI'` or `''` | category ladder, lowest to highest (`QORDER`); ground crew hold `''` |
| `sxo` | boolean | SXO-qualified |
| `initials`, `flight`, `remarks` | string | ground-crew extras |
| `pers` | boolean | ground personnel (no flying quals derive) |
| `special` | boolean | a sentinel body (`ALL`, `ALL AVAIL`) — occupies slots, is not a person |
| `archived` | boolean | kept out of every roster |
| `archivedBy` | `'po'` \| `'del'` \| `'admin'` | `'admin'` when Archive on Admin → Users did (`[ONE-DOOR]`, D310, D323 — only Restore there takes it back); `'po'` when the Leave War's posting pass archived him (an "Overseas Sqn" posting, its date come) — the archive the posting's Undo, a later date or another outcome takes back; `'del'` when a delete did (below); absent = archived by hand on Quals (the absence-record re-test's final read, 26 Sep 26) |
| `archivedOn`, `archivedWho` | `'YYYY-MM-DD'`, person id | **how and when he came to be archived** (D329, 28 Sep 26 — his row on Admin → Users says it, `leavewar/sync.ts archivedLine`): the day an admin archived him and that admin's person id (read back as his current callsign), or — `archivedBy 'po'` — his posting's date and no id. Cleared by Restore and by a posting's take-back; absent on a man archived before it was kept |
| `deleted`, `deletedFrom` | boolean, `'YYYY-MM-DD'` | **the delete's hidden mark** (`[POST-OUT-OUTCOMES]`, D287, D290, 27 Sep 26 — `state/person-delete.ts`): the record is KEPT (every day he flew still points at him, D297) but read as gone everywhere — no list, no picker, the Archived one included; his callsign free (the callsign index skips him); `deletedFrom` the first day he is gone, the later of the delete's date and the calendar date. Written with `archived: true, archivedBy: 'del'`. Never cleared — a delete is final |
| `sanBy` | `'po'` | present only when a SANS posting ticked `san` on its date (D283) — what the posting takes back; absent = ticked by hand |
| `san`, `sanQ` | boolean, `{flown, carry, missedQtrs}` | SANS member and their quarter progress |
| `tf`, `sched` | boolean | terrain-following mark; scheduler appointment (both granted, never derived) |
| `quals` | object | **derived at boot** by `deriveQuals`: `sxo, imc, nvg, tf, san, sched, scDay, scNight, daar, naar` (booleans; `daar`/`naar` may also be `'I'` = instructor) |

The quals ladder invariants are enforced at boot and on every tick: night
is signed off after day (SC and AAR alike); an instructor night mark that
outruns its day one is demoted, not removed.

### Inputs (leave / away / medical / activity) — `INPUTS[]`, `src/engine/inputs.ts`

One record per filed input. The type catalogue (`inpMeta`) is the source of
truth for what each type means; the fields below are what a record carries.

| Field | Type | Meaning |
|---|---|---|
| `iid` | string | **CORRECTED 17 Sep 26** — it is NOT `'i' + n` and there is NO counter. Since ARCH-STACK 1A it is the shared OPAQUE id `newId('i')` = `'i'` + a base-36 timestamp + 6 random base-36 chars (`src/engine/newid.ts`), minted by `inpId` on first read and by `mintInpIds` at boot. Opaque precisely so two devices cannot both mint `i5`. The stable handle — never address an input by index. `state/persist.ts` says so in place: "no counter to seed past stored ids" |
| `person` | string | a PEOPLE id |
| `date` | string | day, display form (`'Jul 13'`) |
| `endDate` | string? | last day of a multi-day input |
| `yr` | number | the anchor year the bare date label belongs to — written on create/edit (`src/ui/inputedit.tsx:712`, `src/ui/InputsPage.tsx:391`, `src/leavewar/sync.ts:323`) and back-filled at boot on any row without one (`src/state/store.ts:602`); part of the content key `inpKey` |
| `allday` | boolean | all day, or a window |
| `s`, `e` | number? | window start / end in **minutes from midnight** (when not all-day) |
| `half` | string? | half-day marker for types that allow it |
| `type` | string | one of the catalogue codes below |
| `remarks` | string? | free text, may be `''`; absent on the seed SANS rows |
| `mod` | string | last-modified date, ISO `yyyy-mm-dd` — **frozen at the moment of the write** (`engine/inputs.ts nowStamp`, every create, edit, trim and the Leave War's approve door); a record minted before the freeze may still carry the literal `'now'`, which the reader resolves to today (`inputStampISO`). *(Corrected 1 Oct 26, `[STORE-READER-SWEEP]`: this row said the app still writes `'now'`.)* |
| `acc` | `undefined \| 'g' \| 'u' \| 'r'` | never landed / landed on the Ground Programme / actioned to Unavailable / **removed by a scheduler (dormant)** |
| `hand` | number? | how many times the request has changed hands — +1 at every change of person (`ui/inputedit.tsx commitInputEdit`); absent = 0 (`[DB-READINESS]` group A phase 6 (a), 30 Sep 26) |
| `leftAt` | `{ <personId>: number }`? | the holding at which the request LEFT each man — written by the hand-over; an OIL decision about him made under an earlier holding reads as nothing (phase 6 (a)) |
| `by` / `at` | string? / number? | **who PLACED it and when** (owner D629, 7 Oct 26): the signed-in PERSON's id and the moment (ms) — the filer, who can differ from `person` (an admin filing for a member; the approver of a leave on the Leave War). Written once, by `state/inputstamp.ts stampPlaced` (the editor's new input, the Inputs List's Add form, the war's approve door — an approval that extends a leave re-states it); never changed by an edit; a PIECE the app cuts from a record (a leave cut or moved, a medical split) is a copy and carries that record's. Absent on a record filed before 7 Oct 26 or with nobody signed in |
| `modBy` / `modAt` | string? / number? | **who last CHANGED it and when** — equal to `by` / `at` on a record nobody has changed. Written by `state/inputstamp.ts stampChanged` at every door that changes an input (the plan `docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` §3.8: an edit, an OIL answer alone, a leave moved or cut, a medical split or trimmed, a posting's trim). ONE moment per command. `modBy` is absent when the last change was the app's own act (a posting that ran by itself on its date). Undo / Redo put all four back as recorded. **Beside `mod`, never instead of it** — `mod` is the DATE the late rule reads, written exactly as before; a filing decision (`acc`) is not a change to the record and stamps nothing |
| `grp` / `grpBy` | string? / string? | **an input filed for a GROUP** (owner D654, D655, 7 Oct 26; the plan `docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` §3.13): `grp` is a group id, the same on every record of one group filing, absent on an ordinary input; `grpBy` is the ENTRY'S FILER (a person id), the same on every record of the group and never changed once set — always together, never one alone. The group is kept as ONE RECORD PER MAN (every reader of an input reads one man's record and is unchanged); an "entry" — the one thing the Inputs page shows — is worked out on read: the records sharing a `grp` AND the same shared fields (`type, date, endDate, yr, allday, s, e, half, remarks, sans` — `sans` read as the set of Fly / OFT / AMT boxes ticked, so one availability an admin files for several SANS people is one entry, D658), `src/state/inputgroup.ts entriesOf`. A record changed alone no longer matches and reads as that man's own input; nothing is written to keep a group in step. Held at the write (the inputs door and the Undo / Redo restore): one man once an entry, one filer a group. `by` stays the truth of who placed THIS man's record |
| `lw` | string? | the **war id** the leave was approved in — PROVENANCE ("approved in war W"), written by the war's approval door (`src/leavewar/sync.ts` `doorApprove`); a member's own date/type edit clears it ([ARCH-STACK] step 4) |
| `docId` / `docIds` | string / string[] | attachment ids (see Attachments) |
| `oil` | `{ 'yyyy-mm-dd': 0 \| 0.5 \| 1 }`? | the per-day OIL credit decision from the OilConfirm ask-flow — written after a create or edit (`src/ui/InputsPage.tsx:425`, `:599`, `:631`; `src/ui/inputedit.tsx:1325`, `:1335`) |
| `sans` | `{ f?, o?, a? }`? | SANS Availability only: which of Fly / OFT / AMT are offered (`src/ui/inputedit.tsx:715`, `:861`; `src/ui/InputsPage.tsx:397`) |

**Type catalogue** (`code` → group; each entry also carries `name, work,
local, ground, half, shiftHard` flags):

- `leave`: `LL` local, `OL` overseas, `OIL` off in lieu, `CCL` childcare, `PL` paternity, `FCL` family care, `EL` embarkation, `CL` compassionate
- `med`: `HL` hospitalisation, `OML` ordinary medical, `ATT C` medically down — cannot report, `ATT B` medically down — no flying, may work
- `upchit`: `Upchit` — fit to fly again
- `act`: `Training`, `CSE`, `Meeting`, `Fly with`, `Personal`, `Appointment`, `Duty`, `Other`
- `duty`: `OD` overseas duty
- `sans`: `SANS Availability`

### A schedule day — `DAYS[0..6]`, `src/engine/data.ts`

One record per day of the loaded week, Monday first. Times inside a day are
`'HHMM'` strings for `str`/`end` and `'HH:MM'` for take-off / land.

```
{
  dow: 'Monday', dt: 'Jul 13', wc: '4 X 4 X 0', today?: true,
  notes: string[],
  allhands: [{ prog, str, end, who? }],
  waves: [{
    label, night: boolean, intimes: string[], traffic: string[],
    formations: [{
      cs, msn, to, ld,
      aircraft: [{ p, w, area, rmks, opts: { tk2, tpod, nav, bombs } }]
    }]
  }],
  sims: { amt: [row], oft: [row] },        // row = { label, str, end, rmks } +
                                           //   either { p, w } or { pax: [] } or { who }
  dutywaves: [{ label, rows: [{ role, id, str, end }] }],
  ground: [{ prog, str, end, who }],
  simnotes, prognotes, dutynotes, grndnotes: string,   // per-section notes
  secOrder?: string[]                       // section display order, absent = canonical
}
```

**Every entry of `pax[]` and `more[]` is text — a seat skipped is `''`, never a hole or `null`** (`engine/slots.ts setSlotVal` pads; `[OIL-READ-LEFTOVERS]` 2, `[DB-READINESS]` phase 7 — pin `ui/simspare.test.tsx`).
`p` / `w` / `who` / `id` / `pax[]` are PEOPLE ids. Rows also carry flags the
engine sets as the day is worked: `cx` (cancelled) with `cxr` (the cancel
reason, from the cancel-reasons list), `info` (info-only), and on a
standalone crew row `spare` with its `role` label (`MAIN` / `SPARE`,
`src/engine/waves.ts:40`, `src/engine/wavetpl.ts:190`). Two things that
look like row fields are **not**: the engine's `spareAcs` is rebuilt from
the `spare` rows on every validate (`src/engine/events.ts:343-388`) and
never stored, and the late mark is derived from the input's `mod` plus a
session-only forgiven set (`LATEOFF`, `src/state/view.ts:139`) — nothing on
a row records it. Sections are addressed by **slot keys** of the form
`d:<day>.<section>.<index>…` — positional, which is one of the loose spots
noted at the end.

**Fields written only after boot** — absent from the seed literals, so a
seed-walking check never sees them; each with its writer:

| Where | Field | Writer |
|---|---|---|
| wave | `standalone`, `kind` (`sc \| avalon \| bb`), `noconf` | `makeStandalone` (`src/engine/waves.ts`), the + Wave picker (`src/ui/board.ts`), a placed template (`src/engine/wavetpl.ts`) |
| formation | `shift` | `makeStandalone` (`src/engine/waves.ts:51`), a standby template (`src/engine/wavetpl.ts:225`) |
| formation | `br` (typed SC in-time) | the board's B box (`src/ui/board.ts`) through the `ff:…br` text key (`src/engine/slots.ts`) |
| formation | `area`, `atime` (the typed-over area strip) | `src/ui/textedit.ts:184`, `:194` |
| seat pair | `spare`, `role` | `saCrewRow` (`src/engine/waves.ts:40`), a standby template (`src/engine/wavetpl.ts:190`), the MAIN/SPARE badge flip |
| duty block | `sa` (which standalone wave the desk serves), `noconf` | `waveDutyBlock` (`src/engine/waves.ts:96`), `blockFromTpl` (`src/engine/dutytpl.ts:184`) |
| ground row | `rmks`, `src` (the landed input's content key) | `acceptInput` (`src/engine/slots.ts:367`) |
| ground row | `srcv` (a short hash of what the row was last made or re-made from — its request's six fields), `kept` (a row a loaded version or a switched-in plan brought back although its request is gone or cannot stand on the day — D363); neither canonical ([DB-READINESS] group A phase 6 (c), 1 Oct 26) | `acceptInput`, the read-time view (`src/engine/overlay.ts viewOfWeek`), a whole-day replacement (`src/engine/drafts.ts markKept`) |
| day | `gman` (ground list frozen to hand order) | a ground-row drag / Sort (`src/engine/reorder.ts:237`, `:425`) |

### The publish book — `SCHED`, `src/engine/publish.ts`

Everything about a week's publication state, keyed by day index 0..6.

| Field | Shape | Meaning |
|---|---|---|
| `al` | number | amendment counter |
| `pending` | `{ key: 1 }` | edits made since the last publish |
| `changes` | `{ key: alNumber }` | **issued** keys → the AL number that issued them (written by `src/engine/publish.ts:publishAL`); a key edited again is deleted from here as it goes pending (`publish.ts:markEdit`) |
| `added` | `{ key: 1 }` | structural adds (a new line/wave/row) |
| `als` | `[{ n, keys[], sign, days[], n0, adds, structAdds, snap }]` | every published amendment (AL), newest last; `sign` here is the four **callsigns** frozen at issue, `snap` the covered days as issued |
| `dayOK` | `{ di: 1 }` | which days are **published — approval is per day, not per week** |
| `sign` | `{ di: { cur, sked, plan, appr } }` | the four sign-off slots per day; each value is a **PEOPLE id** when signed (the picker's options are ids, `src/ui/html.ts`, written by `src/engine/publish.ts:setSign` from the Shell's sign-picker handler) and `''` when unsigned |
| `orig` | `{ di: snapshot }` | the day as first published |
| `cur` | `{ di: 'orig' \| n }` | which version each day currently shows |
| `drafts`, `curDraft` | `{ di: [{id,name,d,sign?,signBind?}] }`, `{ di }` | per-day alternate plans and which is live; each blob carries its OWN sign-offs + AM-06 bindings since 15 Sep 26 (item 1a) |

Synthetic keys ride the same book: `del:<day>.<n>.<kind>` (a deletion),
`mov:…` (a move), `inp:<day>.<token>` (an input filing).

**A snapshot** (`SCHED.orig[di]`, `SCHED.als[].snap`) — the day as issued: `d` (the day, with its OIL evidence `d.oilev`),
`c` (its marks), `fil` (each covering input's filing state) and, since 26 Sep 26 (`[LEAVE-LATE-PUBLISHED]`, D177–D179),
`inp` (a full copy of every input covering the day — the issued face reads these, never the live records), `w` (the day's
slice of the official warnings as it went out: `byDay`, `sev`, `chip`, `dash`, and `cs` the callsigns its warnings were
worded with — only the warnings that freeze and the marks THEY raise; what stays live is not kept: the next-day crew-rest
mark, a crew-rest breach, the 7-day run, a lapsed qualification and the OIL warnings, `validate.ts LIVE_ON_FACE`, D183–D185),
`pa` (the men on the day as the roster drew them — CAT, seat, posting — every man in a person slot of its content, behind
its placeholder pucks, or of its inputs), `rv` (the rule value it prints — a blank brief's lead) and `ros` (the aircrew
roster at issue, for the day panel's "free all day"). The face, the CSV and the print draw `pa` and `rv`
(`engine/faceattrs.ts`); the pending comparison measures today's `pa` against them, and `rv` where a flying line prints a
suggested brief; `ros` is drawn, never compared. A retired issuance keeps all of them (`publish.ts retireIssued`). Size: a copy of
a day's few inputs and its warning list per version — measured in the evidence sheet. Declared in `src/engine/schema.ts`
`DaySnapshot` / `WarnSlice`.
**The hides a version went out with (`[WARN-HIDE-KEPT]`, D469 / D471, 1 Oct 26)** ride inside `w`: `w.wo` — the keys of
the day's warnings hidden as it was issued (only those that match a warning; absent when nothing was hidden); `w.shown`
— the rings, chips and dashes of the warnings that freeze AS SHOWN then (kept only beside `wo`); and in `w.face` a hidden
warning carries `off: true`. `w.byDay` / `sev` / `chip` / `dash` stay as the rules raised them — they are the pending
comparison's basis, and a hide is its own comparison (the working copy's `wo` against the version's `w.wo`, one pending
change per warning that differs — `publish.ts hidePending`). An amendment's stored item counts (`ukinds`) gain `hide`, and its stored `diff` carries one `kind:'hide'` entry per warning hidden or flagged again (`addr: hide:<di>.<fingerprint of its key>`, `from` / `to` the plain `shown` / `hidden` — `engine/schema.ts AlDiffEntry`; pinned by `engine/schema.test.ts`, an amendment issued with a hide and conformed).

### The week record — `weekStashSnap()` / the week stash

Two snapshots share one field list (`schedFields()`, `src/state/history.ts` — **16 fields**, `rt` and `cr` with
[GLOBAL-UNDO]), and only one of them is kept — **in memory as one record, in storage as ROWS** (below).

**The week record** is `weekStashSnap()` (`src/state/store.ts:weekStashSnap`) —
what the stash holds for every visited week, and what `raptor:weeks/<week>` held as one record until 30 Sep 26:

**CORRECTED 17 Sep 26 — the old example listed ELEVEN SCHED fields and mislabelled `un`.**
Three fields were missing: `sb` (signature BINDINGS), `v` (`ridV`) and `am` (`amV`, the
amendment-format stamp). That matters beyond tidiness: `engine/publish.ts` classifies a
published book with no `amV` as UNSUPPORTED and read-only-quarantines the week, so a
serializer built from the old list would freeze every week it wrote, and every signature
binding would be lost (a signature is content-valid only while its binding still matches).

```
{ d: DAYS,                                  // the seven day objects
  c, p, ad, a, al, ok, sg, sb, o, cv, dr, cd, v, am, rt, cr,   // the SIXTEEN SCHED fields,
                                            //   short names, from schedFields()
  wo: string[] }                            // the warnings hidden on the WORKING copy (view.WARNOFF) — kept with the day
                                            //   for everyone until someone flags one again (D469, 1 Oct 26; built by
                                            //   `[WARN-HIDE-KEPT]`: read back at boot and week load, kept through a sign-in).
                                            //   Each is a key — `<di>|<rule>|<person ids>|<the words, callsigns folded to @id>`
                                            //   (engine/warnhide.ts hideKey) — filed in its day's row by that leading day.
                                            //   A key whose warning is no longer raised stays, inert (it is live again if
                                            //   the same situation returns) — not an error in the row.
```
*(`un` — the stable ids of the requests a scheduler took off on this week — left the record 30 Sep 26: it is read from
each request's own `acc: 'r'` mark, `store.ts takenOff` — `[DB-READINESS]` group A, F3-02.)*

| short | `SCHED` field | what it is |
|---|---|---|
| `c` | `changes` | issued key → the AL seq that issued it |
| `p` | `pending` | keys edited since the last issue (the TINT; not AL eligibility) |
| `ad` | `added` | outstanding draft structural-add identities |
| `a` | `als` | the AL records, one per issue, single-day |
| `al` | `al` | the week's AL bookkeeping |
| `ok` | `dayOK` | per-day published state |
| `sg` | `sign` | the four live sign-off slots per day |
| **`sb`** | **`signBind`** | **what each signature signed — digest, date, issued base id, plan revision. A signature is valid only while all four still match** — and, since 6 Oct 26 (`[OIL-WORK-START]`), `orv`: the three Logic values the day's OIL was worked out from when it was signed (`{ reportLead, debrief, oilFullMin }`, earning days only, else null); the signature falls while the day as it stands would write anyone's OIL record differently under those values than under today's |
| `o` | `orig` | the frozen Original per day |
| `cv` | `cur` | which version each day shows (a verId) |
| `dr` | `drafts` | the parked alternate plans per day |
| `cd` | `curDraft` | which plan the live day is |
| **`v`** | **`ridV`** | **row-id version stamp** |
| **`am`** | **`amV`** | **amendment-format stamp — a published book WITHOUT this reads as unsupported and is quarantined** |
| `rt` | `retired` | the withdrawn issuances (an Unpublish), keyed `<verId>~<n>`; each keeps its issued record whole as `rec` |
| `cr` | `correcting` | a day being corrected after an Unpublish: the version it may reissue under the same label |

It carries **no inputs and no planning layer** — those are global, and
their own records: since 30 Sep 26 (`[DB-READINESS]` group A, phase 2) ONE ROW EACH, written from the command
that changed them (`src/state/persist.ts` — the stream consumer; `persistAll` is gone):

| stored id | row | holds |
|---|---|---|
| `raptor:inputs/<iid>` | a request (`Input`) | the whole request, with `ord` — its place in the list (`src/command/ord.ts`; the design's `sortIndex`) |
| `raptor:people/<pid>` | a person (`Person`) | the whole roster record, with `ord`; the two placeholder pucks (ALL `all`, ALL AVAIL `allavail`) are code and never stored |
| `raptor:plan/pp:<id>` | a planning note or pucks row (`PlanningPuck`) | the entry, with `ord`; its id the app's opaque `newId('pp')` (a note saved before keeps its `pp<N>`) |
| `raptor:plan/dm:<iso>` | a day title (`DayRemark`) | the title string |

A list reads back in its order `(ord, id)` — ties between two people's rows break by id, the same on every device. A
first boot stores the seed's rows once, in the boot's one group; a row that will not read is left in storage as it is and
not read. A setting saved as `null` removes its key (it reads as never set).

**The undo snapshot** is `histSnap()` (`src/state/history.ts:histSnap`): the same
fields plus `i: INPUTS`, `pp: PLANPUCKS`, `dm: DAYRMK`. It is the undo
stack's unit only and is never stored.

The week stash (`src/engine/weekstash.ts`) keys week records by week-start
`'dd/mm/yyyy'` with a per-week change counter, and **it persists — as rows since 30 Sep 26** (`[DB-READINESS]` group A,
phase 1 — `src/state/weekrows.ts`, the design's `ScheduleWeek`, `ScheduleDay`, `Amendment`, `AmendmentRetraction`).
The week's id is its key with `/` replaced by `-`; its rows are

| stored id | row | holds |
|---|---|---|
| `raptor:weeks/13-07-2026` | the week row | the two format stamps `v`, `am` — nothing else |
| `raptor:weeks/13-07-2026#<di>` | a day row (0 = Monday … 6) | the day `d`; that day's slice of `c`, `p`, `ad` (the keys naming it); its `ok`, `sg`, `sb`, `cv`, `dr`, `cd`, `cr`; its muted warnings `wo`. A slice with nothing for the day is left out |
| `raptor:weeks/13-07-2026:is:<verId>~<n>` | an issuance | the issued record as it went out — the Original (`<iso>#0`) or an amendment; `n` = how many times that version had been withdrawn before it went out. Written ONCE: an Unpublish never touches it |
| `raptor:weeks/13-07-2026:rx:<verId>~<n>` | a retraction | an Unpublish of that issuance: `at`, `by`, `restoreSeq`, `logged` |

`al` and `un` are not stored. At boot every week's rows are joined back into one stash record
(`src/state/persist.ts:hydrate`); a week whose rows will not read, whose week row still carries a whole old week, or
that was published by an older build is kept byte-for-byte, loads read-only, and its rows are never rewritten.
**Written from the command stream, never by `persistAll`**: each command's changes to a week go out as exactly the rows
they touched, in its one saved group; a week's first save writes its week row and ONLY the days it changed (a day no
one has saved has no row and reads as the week untouched — the group-wide walk's finding H3, 30 Sep 26), and a week load's landing is saved only onto
days already saved; a pristine seed week is never written; a row is removed only by an explicit delete (an Undo of a publish or an
Unpublish). A week switch writes nothing of the week left, and NOTHING of the week arriving: its landing pass (the
`sched.load` command) is worked out again at every load, the boot's too (the group-A final read, Fable F2 and F1, 30 Sep 26: saving it wrote this browser's copy of rows another person may have changed, and made a member's browser the writer of days a member may not write — the plan's phase 6(c) direction, a landing worked out on read). This is what the persistence
table at the top calls "per-week stash — Yes".

### Planning layer — `src/state/plan.ts`

- `PLANPUCKS[]`: `{ id: 'pp'+n, date: 'yyyy-mm-dd', kind?: 'pucks', text?, ids?: personId[] }` — a section dropped on a calendar day; the day column is `date` (`src/state/plan.ts:79`, `:130`), a note carries `text` and no `kind`, a pucks row carries `kind: 'pucks'` and `ids`
- `DAYRMK`: `{ 'yyyy-mm-dd': title }` — the day's free-text title

### Attachments — `src/state/docs.ts`

`docBackend.impl`: a map `id → { name, mime, size, blob }` — the synchronous
read path the viewer needs in render. Behind it (since 8 Sep 26) a durable
per-browser drawer: **IndexedDB** `raptor-docs` (`src/storage/docstore.ts`),
wired by `docBoot` from `main.tsx` on the built site only (dev/tests/`?fresh`
stay memory-only). `docAdd` writes through to it; `docBoot` fills the cache
back at boot. Ids are random (`state/docs.ts newDocId` — `doc-<uuid>`), so two minters cannot collide; an older
`doc<N>` id still resolves. *(Corrected 1 Oct 26, `[STORE-READER-SWEEP]`: this said the boot advances an id counter.)* Its OWN drawer, deliberately NOT the
~5 MB text seam a couple of photos would overflow. Accepts photos (`image/*`)
and PDFs, capped at **8 MB** each. Append-only (undo can resurrect the input
that owned one). Input records carry only the id, never the bytes. Fail-soft:
a drawer that will not open (private mode) leaves the store memory-only.
Migration seam: a browser that persisted INPUTS before the drawer existed
holds `docId`s whose blobs were never saved — read honestly as "no document
on file" (never fabricated) until the data is cleared.

### Edit log — `ELOG.rows`, `src/engine/editlog.ts`

`{ seq, t, who, pid, di, date, end?, wdate?, wend?, iid?, sect?, key, lbl, from, to }` — the line's number (only rises,
kept across a reload), wall-clock, display name (from `HOOKS.whoami()` — the signed-in CALLSIGN since `[ACCOUNTS]`, 26 Sep
26), the person behind it (`HOOKS.whoamiId()`, so a rename moves nothing), the day index of the week loaded when it was
written, its CALENDAR day (ISO — the week it belongs to) and, for an absence, the span after (`date`–`end`) and before
(`wdate`–`wend`), the input it is about, the part of the day a line with no key belongs to, for a Quals line the person it
is about and which of his details (`sub`, `fld` — by id, so a rename never loses it; Astra's final read), for an absence
line the person too (`sub`) and — for one record of an input filed for several people — that filing's group id (`grp`, the
record's own `Input.grp`; 8 Oct 26, D663: the changes window files the men of one filing under one item), every input a war decision is about when more than one (`iids` — a moved day is re-filed as a
new record), and its exact days when they are not one run (`days`, `wdays` — a gap day stays untouched), the slot key, a frozen label
of what it was, before and after (a person key keeps the person's ID — `elogVal` says his live callsign). **Durable since
`[DRAFT-PENDING]` (28 Sep 26, D336 (b)):** loaded at boot, kept across sign-in and sign-out, never a command record (undo
never rewinds it). **One row per line since 30 Sep 26 (`[DB-READINESS]` group A, phase 4.3):** `settings/elog:<lineId>` =
the line without its in-memory `seq`, written the moment the line is kept — inside the command that made it, in its saved
group and its change-log batch (a line given just BEFORE its command opens — the board's in-place edits, a text box — is held and kept inside that
command's group, the group-wide walk's finding H2, 30 Sep 26; a line no command claims by the end of the turn goes
through a command of its own, `elog.line`; the Admin
→ Data sweep is one command, `elog.sweep`, deleting exact lines). `lineId` (`<page>.<n>`, rising within a page life) is
the line's identity; the history's order is `(t, lineId)` on every client, and `seq` is only a line's place in the list
loaded now. Capped at 2,000 lines — the oldest line's row deleted in the same group that adds the newest; a boot loads the
newest 2,000 in order; a row that will not read, or lacks its time, is left in storage and not read. The old whole record
(`elog = { v, next, rows }`) is converted by the fold (`src/state/settingsrows.ts elogConverter`), never read.
**Each person's "seen"** is `settings/seen:<pid>` = `{ upto: { at, lineId } | null, extra: lineId[] }` (was one
`changeseen` record for everyone): positions in that order, written only by `state/changes.ts` through `changes.seen`,
his OWN row only (`perms.ts ownershipViolation`) — data-model §11 `EditLogSeen`.

### Accounts and session — `src/state/accounts.ts`, `src/state/auth.ts` (`[ACCOUNTS]`, 26 Sep 26 — D166, D204)

Durable settings rows below — one per account (`account:<id>`), per waiting request (`accessreq:<id>`), per admin's
seen requests (`reqseen:<accountId>`) since 30 Sep 26 (`[DB-READINESS]` group A phase 4.4), and the `guestview` key —
written ONLY by `state/accounts.ts` through its intent commands, each command writing EXACTLY the rows its own list edit
changed (never against storage, so a client that has not read another's new account cannot remove it); the session is
memory only (a reload lands on the sign-in, as always).
- **No account row at all** = the four seeded demo accounts, held in memory (as a missing record was); the first account
  write stores every account of the list it leaves. **Two account rows for one person** (two admins at once — the
  database's unique `personId` refuses the second, group B): the older (`createdAt`; a seeded one, with none, oldest)
  is kept on load, the other dropped with a logged line.
- `SESSION`: `{ user, role, pid, name }` — `user` the account id (or `principal:<name>` for someone signed in without
  access), `role` `'admin' | 'main' | 'pending' | 'guest' | 'off'`, `pid` his person (null without access), `name` the
  sign-in name (it stands for the defence mail address)
- `ME`: the signed-in person's PEOPLE id — set only by `resetSession` from the account (the "View as" picker is gone)
- **No password is stored anywhere** (data-model §3): an added account takes any password; the two seeded sign-ins'
  passwords (`ad`, `us`) live in code only (`accounts.ts SEED_PASS`)
- (`ACCOUNTS` — the two hard-coded logins — and `USERS[]` — the old Manage-users list, which drove nothing — are gone)

### Settings and templates — the `sqn142_*` keys

Each key writes **`null` when the squadron is on the shipped standard**, so
a later change to the standard is picked up rather than frozen in a browser.

| Key | Value | Record |
|---|---|---|
| `daytpl` | `DayTpl[]` | `{ id, title, d: DayTplBlob, missionRoleSeeds? }` — whole saved day, minus dates/crew/row IDs; optional `{ format:1, seeds:[{ path:[wave,formation], context, side }] }` outside `d`, validated against conditional context v1; applying creates fresh annotation IDs in the same structure transaction (D529–D531) |
| `insights` | `{ trackBlueRedSorties:true }` or null | squadron Insights tracking; absent/malformed is Off; independently loaded, saved and undone; warning rules/search/reset/count/stamp do not consume it (D512, D524) |
| `missionrole:<encoded-id>` | `MissionRoleAnswer` | one guarded row: `{ format:1, contextVersion:1, weekKey, dayISO, formationRid, context, side:'blue'\|'red' }`; ID = URI-encoded JSON tuple `[1,weekKey,dayISO,formationRid,context]`. Week is a real Monday, day within it. Unsupported or mismatched records remain stored and inert. Mapper alone writes these rows; raw settings writes refuse. Existing schema wipe removes these rows and filters them from an unfinished reset journal, without a schema bump (D530) |
| `wavetpl` | `WaveTpl[]` | `{ id, title, kind: 'fly' \| 'sc' \| 'avalon' \| 'bb', lines: [{ cs, msn, to, ld, spare }] }` |
| `wavehide` | `string[]` | hidden wave-template ids |
| `wavedefault` | `string[]` | house wave order |
| `dutytpl` | `DutyTpl[]` | `{ id, title, wave: '' \| 'sc' \| 'avalon' \| 'bb', rows: [{ role, str, end }] }` |
| `cxreasons` | `string[]` | the cancel-reason list — **a stored empty list is a decision** (every reason removed in the editor) and reads back empty; a list whose every row is unusable falls back to the shipped set (`[STORE-READER-SWEEP]`, phase 7; the same for `stores` and `qualcols`) |
| `lookahead` | `{ w, s }` | weeks ahead, to-Sunday flag |
| `secdefault` | `string[]` | section order, from `notes, prog, waves, duty, sims, ground, inputs, avail, sans, unav` |
| `stores` | `[[key, label]]` | the stores list — a stored empty list stays empty after a reload (as `cxreasons`) |
| `qualcols` | `QualCol[]` | the LoX column list — `{ k, h, lav?, apt?, scq?, aar?, fcpOnly? }` in display order (saved since the 8 Sep 26 bug pass: the ticks under a column persist, so the column must too); a stored empty list — every column removed on the Quals page — stays empty after a reload (as `cxreasons`) |
| `account:<id>` | `Account` | one row per account (`[DB-READINESS]` group A phase 4.4 — it was one `accounts` list): `{ id, name, role: 'admin' \| 'main', pid, on, offBy?, seenFrom?, createdAt? }` — `seenFrom` (`[DRAFT-PENDING]`, Fable F6): where the change history stood when the account was made, a POSITION `{ at, lineId }` (phase 4.3), so someone given access later starts with nothing new; `createdAt` (ms) — the older of two accounts for one person wins; `name` the sign-in name (lower-case, unique; stands for the defence mail address), `pid` the person (one account each), `on` false = **suspended** (D285); `offBy: 'po'` only when an "Overseas Sqn" posting suspended it on its date (what "he's back" enables — any hand Suspend / Enable drops it). An account is removed only with its person, by a delete (D287, `[POST-OUT-OUTCOMES]`). **No password.** No row at all = the four seeded demo accounts (`[ACCOUNTS]`, D166) |
| `accessreq:<id>` | `AccessRequest` | one row per waiting request (was one `accessreqs` list): `{ id, name, cs, ini, seat, cat, at }` — who asked (the signed-in principal, from the session); what he typed, text only — the displayed callsign/name (≤ 14), initials (may be blank), `seat` `FCP`/`RCP`/`GND`, `cat` (`''` for personnel) — never a link to a puck; when. (D204; `[ACCOUNTS-NEW-PERSON]` D214, D216, D227 — the typed name field gave way to the initials, D219). Who has had it on screen is no longer on it: |
| `reqseen:<accountId>` | `{ userId, seenRequestIds }` | each admin's own row of the requests he has had on screen — his bell (D216, D227); written only by `access.seen`, his own row; removed with his account (data-model `AccessRequestSeen`, R3-04) |
| `seen:<pid>` | `{ upto, extra }` | each person's own "seen" for the change history — §The change history above (was one `changeseen` record) |
| `guestview` | `true` or null | the admin's switch letting people waiting for access read the published week as a guest — OFF (null) by default (D204) |
| `memberfile` | `false` or null | the members' switch — "members may file duties and commitments for other people" (owner D654, D655): ON (null) by default, `false` = admins only. Written only by the admin command `settings.memberfile` (`src/state/memberfile.ts`); a raw write is refused. Read live by `src/state/perms.ts membersFileOn`. Switched off, nothing already filed is removed or altered — a member's right over what he had filed for others simply goes |
| `rules` | `{ v: { numericRule?: number, reportText?: string }, s: { kind: boolean } }` | overrides only: `v` for thresholds off the standard (`briefLead, dur, step, dekit, minTurn, tightTurn, crewRest, debrief, reportLead, longDay, epBrief, simDebrief, amtDebrief, openEnd, maxRun, inputLead, scDayFrom, scDayTo, simLen, oilFullMin` — and, since 7 Oct 26 (D628, D639), the two late cut-offs' seven: `inputCutMode, inputCutWd, inputCutWeeks, sansLead, sansCutMode, sansCutWd, sansCutWeeks` — a mode (0 days / 1 weekday), a weekday (0 = Monday … 6), a number of weeks (1–8), a number of days (0–60)), plus D511 text `reportText` (default `IN TIME + WX/NOTAMS`, trim/CR-LF-to-space, max60, empty falls back); `s` for which kinds hard-clash a shift (`fly, sim, duty, shift, ground, prog`). Numeric keys remain numbers; text travels with the same rules record/reset/snapshot/export/Undo |
| `sanscalendar`, `flyday:<ISO>`, `flyrule:<id>`, `flyrun:<ISO>` | see below | the SANS calendar's three day colours and the flying plan's three kinds of row — a date's class and required figures, a weekday's rule, a running figure (`src/state/flyplan.ts`): §The flying plan and the SANS calendar's colours, at the foot of this file |

---

## World 2 — Leave War

Fully typed (TypeScript interfaces), so these shapes are exact. Dates here
are ISO `'yyyy-mm-dd'` throughout.

### Keys (`raptor:leavewar/*` on the built site; legacy `leavewar:*`)

**ONE ROW PER RECORD since 30 Sep 26 (`[DB-READINESS]` group A, phase 3 — `src/leavewar/state/rows.ts`).** Each row is written
FROM THE COMMAND that changed it — the war's store subscribes to the command stream and writes, through its own
door (`state/storage.ts`), exactly the rows each command's changes land in, inside that command's one saved group; a
row is removed only for a record that command removed. The first boot stores the seed's world as rows (and the demo
world replaces it, inside the boot's group); the one-time fold (`store.ts leavewarConverter`) converts an old store.

| stored key | the design's table | holds |
|---|---|---|
| `war:<warId>` | `LeaveWar` | the war's `Period` (its days, bands, stage, bidding window) with `ord` — its place among the wars, the order they were created (the period picker's) |
| `rec:<warId>:<recId>` | `LeaveBid` | ONE of the war's own records (a request, an earned credit, a notice — `WarRec` below) with `pid` and `date` (its address) and `ord` (its place at that address). Several share an address; the list there reads back by `(ord, recId)`. A MOVE rewrites the one row (its new `pid` / `date`) |
| `ledger:<id>` | `LeaveLedger` | one `LedgerEntry`; a reload reads the ledger by (date, entry time, id) — every reader sorts it for itself |
| `opening:<pid>:<counter>` | `LeaveOpening` | one opening balance, a number |
| `profile:<pid>` | `LeavePersonProfile` | `{ post?, label? }` — his posting window (`post`: the `postouts` entry below) and his personnel label (`label`, the admin's text for a ground-crew row); the row goes when both do |
| `current`, `oilpolicy`, `eventdefs`, `figorder`, `rosterorder`, `manningorder`, `manninghidden`, `fighidden`, `groupdefs`, `grouppriority`, `grouppriocustom`, `groupcolors`, `manningdefs`, `eventrows`, `showsans` | `Setting` | one key each, as before — only the keys a command changed are written. **`manningorder` — the order of the Manning block's rows — is a list of counter ids and, since D674 (8 Oct 26), may also hold the four fixed rows' TOKENS (`@req-p`, `@req-w`, `@avail-p`, `@avail-w` — `leavewar/engine/fixedrows.ts`): a list that names none of them means "these counters, then the four", which is what every list saved before that day says and what is still saved while no counter stands among or below the four; nothing stored is converted.** **`manningdefs` starts ABSENT and means "no counters" — the Manning block comes with no count rows of its own (D669, 8 Oct 26; until then an absent or unreadable list read as eleven built-in counters, and a pre-19 Aug 26 `manningthresh` overlay was laid over them — that key is no longer read). `manninghidden` is still read and written, so a store from before loads as it was, but nothing consults it: the eye that hid a row became a delete cross and a row can no longer be hidden.** `manningdefs` holds at most `MAX_MANNING_RULES` (60) counters: ONE number for the reader (a longer list reads as damage → no saved list, so no counters) and the writer (a new counter past it is refused, and the form says so) — `[STORE-READER-SWEEP]`, phase 7. **Since the Inputs / SANS redesign (7 Oct 26, D640) the list may also hold `availp` and `availw`** — the two Available rows the SANS calendar reads, stored only once an admin has renamed or re-defined one (until then the built-in definition serves: every pilot / every WSO — "Reset counters", which also put it back, went with D669). They are BESIDE the limit (the list may be 62 long, the ordinary counters still at most 60); each is a `people` count with `threshold` `{amber: 0, red: 0}` — a stored one of any other shape is left out at the read, and a SANS man is never counted whatever its filter says (`leavewar/engine/availrows.ts`) |

A started store is read as it stands — no opening, ledger entry or window stored means none, never the seed's; a
row that will not read (or a war claiming a day another already holds, or a record that would break its address's
rules — two people each bidding the same half at once) is left in storage as it is and not read. *(Until 30 Sep 26:
every key above in ONE record each for everyone — `wars` (every war with every record), `openings`, `ledger`,
`postouts`, `perslabels` — rewritten whole by every edit, with `personedits` beside them; the fold removes them.)*
(Since [ARCH-STACK] step 4, 20 Sep 26, a war's records are `recs` — an older shape is not migrated — `SCHEMA_VERSION` 4
clears `inputs`, `weeks` and `leavewar` on a returning browser.)

The posting window is the only per-person record Leave War keeps (8 Sep 26 bug
pass — a posting-out date used to vanish on reload): the `post` of his profile row,
`Person` — since `[ONE-DOOR]` (D320, 27 Sep 26) with `past: { from, to }[]` beside `from`/`to`, his CLOSED earlier stints (from `from <= to`, in order, never overlapping, the last ending before the current `from`; a malformed list is dropped whole on reading) — the person as last projected with
the posting-out window (`to`, `poOutcome`, `poDone`, and the older
`poArchive` kept in step — `true` = `'overseas'`) on them, and `gone: true`
once he is deleted — an entry exists while either date is set.
`poOutcome` is which posting it is (`'overseas' | 'delete' | 'sans' | 'none'`,
`[POST-OUT-OUTCOMES]`, D229); `poDone` the posting date its outcome has run
for (so it runs once). `people` itself is never stored: it is re-projected from
Raptor's `PEOPLE` on every boot and the window is laid back on top. (The identity
overrides stored beside it until 30 Sep 26 — `personedits`, `{ [personId]: { seat?, band?,
sxo? } }`, the war's Edit person — are gone: D460, D461; a man's seat, band and SXO are Quals's.)

### The state — `src/leavewar/state/store.ts`

```
people: Person[]            requirements: Requirements     qualCatalog: QualDef[]
eventDefs: EventDef[]       wars: LeaveWar[]               currentId: string
period                      // the current war's period
getState() adds grid, states, views — DERIVED on read (state/merge.ts) from the
  war's own records + the Inputs; rawState() is what is stored
openings: Openings          ledger: Ledger                 oilPolicy: OilPolicy
role: 'member' | 'admin'    viewer: string | null
figureOrder, rosterOrder, manningOrder, manningHidden, figureHidden: string[]
persLabels, groupColors: Record<string, string>
groupDefs: GroupDef[]       groupPriority: string[]        groupPriorityCustom: boolean
eventRows: number           showSans: boolean
focusDate: string | null    focusSeq: number
postOuts: { personId: Person }   // (personEdits went with the war's Edit person — D460, D461)
```

### Records

| Record | Fields |
|---|---|
| `Person` | `id, callsign, seat: 'pilot' \| 'wso' \| 'gnd', band: 'instructor' \| 'ops', sxo, from, to` (dates in squadron, null = open), `poArchive?, poOutcome?, poDone?, gone?, q?, scd?, scn?, xq?: string[], san?, pers?, label?` — built from the scheduler's PEOPLE, **same ids** |
| `LeaveWar` | `{ period, recs }` — one war (stored) |
| `Recs` | `personId → date → WarRec[]` — the war's OWN records only ([ARCH-STACK] step 4) |
| `WarRec` | each with `ord?` (its place at its address — `[DB-READINESS]` group A, phase 3), one of: **request** `{ id, kind:'request', code, state: 'pending' \| 'acknowledged' \| 'refused', shiftedFrom?, carried? }` · **OIL credit** `{ id, kind:'credit', code: 'FO' \| 'HO', oil: 'auto', via?, note?, spans? }` — the SCHEDULE'S credit only; an OIL award is a ledger entry since [OIL-AWARD-IS-A-GRANT] (29 Sep 26), and an old `oil:'manual'` record is dropped on read (D401) · **notice** `{ id, kind:'notice', code, was, byType, byWho, seq, at }` (a replaced bid, until "OK, seen"). Nothing "approved" is ever stored here — approved leave is the Input with `lw` |
| `Period` | `id, name, start, end, stage: 'draft' \| 'open' \| 'closed' \| 'published', bidFrom, bidTo, days: DayInfo[], bands: EventBand[], ord?` (its place among the wars — `[DB-READINESS]` group A, phase 3) |
| `Grid` (derived) | `personId → date → code` — the main code a cell shows |
| `Cell` | `{ type, portion: 'full' \| 'am' \| 'pm' }` — a parsed code |
| `States` (derived) | `personId → date → BidRecord` — the main record's colour state; `source: 'raptor'` now means "locked on the war" (filed on the Inputs page, or medical) |
| `Views` (derived) | `personId → date → DayView` — every record on the day, the main one, the corner mark, the charges (`engine/dayview.ts`) |
| `Openings` | `personId → { counter: number }` — opening balances |
| `CounterName` | `'annual' \| 'oil' \| 'ccl' \| 'fcl' \| 'pl' \| 'el' \| 'cl'` |
| `LedgerEntry` | `id, personId, counter, amount, date, reason, approvedBy, givenBy?, enteredBy?, enteredAt?` — a grant or correction; a positive OIL entry is an OIL AWARD, the ONE kind of hand-given OIL (D400, D402), drawn on the war grid on its date; `enteredBy` / `enteredAt` who entered it and when (D200 (2)); a new entry's id is opaque (`ol-…`) |
| `OilPolicy` | `expiry: { n, unit: 'days' \| 'months' } \| null, historyMonths \| null` |
| `OilLedger` (derived) | `credits: OilCredit[], debits: OilDebit[], balance, earned, awarded, corrections, taken, expired, overdrawn, first` — `earned` the automatic credits, `awarded` every award, `corrections` the negative entries (D400) |
| `OilCredit` | `id, date, amount, reason, source: 'opening' \| 'auto' \| 'grant', approvedBy?, givenBy?, enteredBy?, enteredAt?, expires, used: [{date, amount}], left, expired, ledgerId?` — `grant` is an award (a ledger entry) |
| `OilDebit` | `id, date, amount, reason, source: 'taken' \| 'correction' \| 'opening', from: [{creditId, amount}], unbacked, ledgerId?` |
| `EventDef` | `{ name, kind: 'off' \| 'free' \| 'nolv' \| 'work', short? }` — a preset; `short` is what the grid prints for an event of that name (one to three letters or digits, `engine/eventshort.ts normShort`; the four seeded ones carry PH, OFF, NL, SC — D645). Absent on a library stored before short forms: its events print one derived from the name |
| `DayInfo` | `{ date, events: string[], eventKinds?: (kind \| null)[], eventShorts?: (string \| null)[], blocked, blockedReason, ph }` — a day's Event lines: each line's text, its own kind tag and its own short form, same index, written TOGETHER (`engine/period.ts writeDayEvent`; the build plan §3.12). `eventShorts` is absent on a day that never had one typed |
| `EventBand` | `{ line, from, to, text, kind?, short? }` — a merged event over a run of dates on one Event line; `short` as on a day, absent where none was typed |
| `Requirements` | `{ default: { rules: ManningRule[] }, overrides: { key: Requirement } }` |
| `QualDef` | `{ k, label }` |

### Sync with the scheduler — `src/leavewar/sync.ts`

**Since [ARCH-STACK] step 4 (20 Sep 26) there is no copy to sync.** An absence
(leave, medical, course, overseas duty) is ONE record — the Input. The war
READS the Inputs (`refreshAbsences`) and derives what each day shows; approving
on the war WRITES the Input in the same command, tagged `lw: <war id>` as
provenance ("approved in war W"), not as a loop-breaker. OIL credits remain a
derived pass (`runOilPass`) writing `oil:'auto'` records.

---

## World 3 — the Tracker

Vendored JavaScript, shapes fixed in `src/tracker/app/fileFormat.js`.
Course, syllabus and student names are free text LABELS. **CORRECTED
17 Sep 26:** they are no longer used as keys — courses, syllabi and students all
carry stable ids (13 Sep / 10 Sep 26), so renaming any of them moves nothing. A
colon is allowed in a syllabus, chart or student name; a COURSE name still
refuses one.

### Keys (`raptor:tracker/*` on the built site; legacy `ocu:*`) and prefs (`ocuLocal:*`)

`v3:master`, `v3:courses`, `v3:lay`, `v3:seedstamp` hold
the containers below. **Event details are PER CHART since 23 Sep 26 (D126)** —
`v3:master:eventinfo` = `{ sylId: { eventId: { name?, fmt?, hrs?, crew?, pre? } } }`,
only the fields that differ from that chart's shipped wording (the base table
plus a built-in's own profile); an emptied field is stored as `''`. The old
one-table key `v3:eventinfo` (`{ eventId: fields }`, shown on every chart with
that code) is converted ONCE when the new key is absent — each edit laid on
every chart that has the event — and then left untouched as a backup
(`app/eventDetails.js`). **Deleted courses (D128)** are `v3:delcourses` =
`{ id, name }[]`; their records stay filed under the id, and ⇅ Reorder courses
restores one. A Last Flown record (`…:d:<id>`) may carry `handSyll` /
`handCurr: true` — the day in that box was typed by hand and stands until a
later flight (D123). **Each save travels with its command (30 Sep 26, `[DB-READINESS]`
group A phase 4.1):** a record a command changed is written by the Tracker's own subscriber
to the command stream, through its storage door, inside that command's saved group and its
change-log batch — never again after it; its own Undo / Redo is one restore command each
(`tracker.undo` / `tracker.redo`). Only its first mount (the seed and one-time migrations,
their flags) writes outside a command. **One row per thing (30 Sep 26, `[DB-READINESS]` group A phase 5b — D462,
D464):** the records that held several people's or several charts' work are STORED one row each, through the row door
in `core.js` (`app/rows.js` holds the one conversion; every caller still reads and writes the old record whole):
a course and chart's student list `v3:<course>:<chart>:roster` → `v3:<course>:<chart>:enr:<enrolmentId>` =
`{ id, name, pid?, ord }` (`Enrolment`); the course list `v3:courses` and the deleted courses `v3:delcourses` →
`v3:master:course:<courseId>` = `{ id, name, ord, deleted? }` (`Course`); the chart records `v3:master:syls`
(definitions), `sylcat` (names), `sylorder` (display order), `sylhidden`, `syltomb` → `v3:master:chart:<sylId>` =
`{ id, name?, base?, userNamed?, ord?, hidden?, tomb?, def? }` (`Syllabus` — the catalogue list now reads in the
display order, the one order a chart row carries); the details typed on the balls `v3:master:eventinfo` →
`v3:master:info:<sylId>:<encoded ball code>` = the ball's typed fields (`TrainingEvent`), with a one-time flag
`v3:eventinfomig` = `'1'` once the details are in their per-chart form (so clearing the last one never brings the old
one-table `v3:eventinfo` back). Order rides the row (`ord`, read by (ord, id) — `src/command/ord.ts`). A write stores
only the rows its list CHANGED against what that copy of the Tracker last read, so two people's work on two things never
overwrites; one write is one command. An old whole record that is still stored (a browser the fold has not reached, the
standalone Tracker) is read as it stands, and converted to rows at its next write; one that cannot be split (bare names
from before the ids) is kept whole. A browser's old records are converted once at boot by the fold's `tracker` converter
(`src/tracker/fold.ts`, registered by `src/boot.ts` — the last of the eight: the store's format is 6). The layouts, marks,
dates, pace, lulls, plans and flags keep their keys. **The chart a signed-in person has open is his own place** (D376),
kept on his browser under `ocuLocal:who:<id>:lastSyl:<course>` — never written into the course's shared `v3:<course>:plan`,
whose `sylId` names the course's own chart (the standalone Tracker, nobody signed in, keeps the one shared answer).
Since the seam the Tracker's data flows through the
whiteboard and lands under `raptor:tracker/<key>` (e.g. `raptor:tracker/v3:master:syls`);
the legacy `ocu:*` keys are imported once. `ocuLocal:*` holds this browser's
last course and crew member — a view preference, written straight to
localStorage (NOT through the whiteboard), kept outside the shared prefix by design.

### Containers

```
charts   = { order: string[],
             syllabi:  { name: event[] },        // event = { id, type, seq, prereqs: string[], phase, _b }
             layouts:  { name: object },
             eventInfoBySyl: { sylId: { eventId: { name?, fmt?, hrs?, crew?, pre? } } },  // D126: each chart's OWN edits
             deleted: sylId[] }   // D127: a backup of EVERY chart names the built-ins deleted when written
             // a file written before D126 carries `eventInfo: { eventId: fields }` (one table)
             // instead; import lays its real edits on the imported charts only

students = { courses: string[],
             byCourse: { course: {
               plan: object,
               bySyllabus: { syl: {
                 roster: { id, name, pid? }[],                 // legacy files: string[] (names)
                 marks:  { enrolmentId: { eventId: { g, f } } },   // g = grade (0 = none), f = failure ticks
                 dates:  { enrolmentId: { eventId: date } } } } } } }
```

**A student is an enrolment id since 10 Sep 26 (stable ids).** A roster entry
is `{ id, name, pid? }` — `id` opaque (`s` + base-36 time + random, minted
when the student is added), `name` the typed callsign (a label; the pencil on
each Students-card chip renames it — `core.js:renameStudent`, 10 Sep 26,
everyone may, refused if another enrolment on the course holds that name; the id
and every id-keyed record are untouched), `pid` the Raptor `PEOPLE` id when the
student was picked off the roster. Every per-student record files under the
id: `v3:<course>:<syl>:m:<id>`, `:d:<id>`, `v3:<course>:pace:<id>`,
`lulls:<id>`, `last:<id>`, and `lastStudent` holds an id. The same name on
two syllabi of one course is ONE enrolment (pace and lulls are per course).
Existing browser data converts once per course — `v3:<course>:idmig` = `'1'`
marks it done — by `core.js migrateIds` through the one converter
`app/ids.js upgradeCourseBlock`: the name → id mapping is built from every
roster first and parked in `v3:<course>:idmap` (read back before anything
moves, reused if the run is interrupted so a retry lands every record under
the same id), each record is written under the id and read back before its
name key is deleted, the roster is written last and the flag after it; the
map is deleted with the flag. Run at the first mount they are the Tracker's one exempt writer; run AFTER it (an
Import bringing a course this browser never converted) the flags, the map and the old `v3:links` record are each saved
as a command of their own (`trk.meta`) with its change-log batch (the group-wide walk's W5 finding 1, 30 Sep 26 — they
had gone out bare). A course whose conversion did not finish
(the roster still a string list after the retry) refuses roster writes
until a later load converts it. `migrateAllCourses()` at init converts
courses nobody has opened; a course still waiting for the older roster
split (`rostermig`) converts on its first open. **CORRECTED 17 Sep 26 — a course
rename MOVES NOTHING.** Since course ids (13 Sep 26) every per-course key files
under the id (`v3:<courseId>:…`), so `renCourse` just sets the entry's name; the
old copy-verify-delete apparatus described here (write, read back, delete the
old; the old course left listed beside the new) is GONE. `app/courseIds.js` is
the one converter (mint/upgrade/reconcile); `migrateCourseIds` re-bases a
name-keyed browser once — resumable, read-back-verified, a `storage.list()`
prefix-move with a reserved-namespace skiplist
(`courses`/`links`/`master`/`lay`/`SYLLABUS EDIT`) and a fail-closed preflight:
a reserved or colon-bearing legacy course name stops the boot (`bootError` → the
reload panel, no board, no writers). Course-id grammar `^c[0-9a-z]+$`; Import
refuses a reserved name or a non-matching id at the file boundary.

A mark record is `{ g, f, fd, d, by?, at? }` — grade code, failure count,
one ISO date per failure (oldest first, null when undated), the done date,
and since 9 Sep 26 **who** made the last write (Raptor's `HOOKS.whoami()`
display name, absent when unknown) and **when** (ISO instant). `dates[s]`
(`lastSyll, lastCurr, downDays, upchit`) carries the same two stamps. Undo
snapshots restore them verbatim.

### The person link — `pid` on the entry (`v3:links` is legacy)

The Raptor `PEOPLE` id a student was picked with (the Students card's
`+ Add` lists the roster via the no-import bridge `src/tracker/people.js`,
fed by `TrackerPage.tsx` → `src/tracker/peoplewire.ts`) rides the roster
entry as `pid` since 10 Sep 26. Picking the same person again, or typing a
name already on the course, lands on the existing enrolment (a pid that
already belongs to a differently named entry, or a name already linked to
another person, is refused with a message). The 9 Sep 26 record
`v3:links` = `{ [course]: { [studentName]: personId } }` is read once by
the migration, folded into `pid`, and deleted; a file's `links` block is
read the same way on Import and never written by Export.

**A syllabus is a syllabus id since 1B-ii (`[TRK-CSID]`, 13 Sep 26).** The
`<syl>` segment above is a syllabus id: built-ins carry a deterministic
shipped id from `app/sylIds.js:BUILTIN_SYL` (`sb…`), user charts a minted
`sc…`; the global catalogue is `v3:master:sylcat` (`{id,name,base?,userNamed?}[]`),
definitions `v3:master:syls` and layouts `v3:master:lay:<sylId>` are id-keyed,
and `plan.sylId` replaces `plan.sylName`. `migrateSylIds` converts the
catalogue in place (payload journal, flags `v3:sylcatmig`/`v3:sylreset`) and
RESETS the per-(course,syllabus) student layer ("keep charts, reset marks").
File version → 3; student marks import only from an id-native v3 file with a
`sylcat` (the §19 guardrail). A COURSE name is still a storage-key segment
shown in name reconcile, so a course name containing a colon is refused at
every entry point and by the file check; a SYLLABUS, CHART or STUDENT name is
a label now and may contain a colon.

### The syllabus file

`{ format: 'ocu-tracker', version: 1, savedAt, contains: { charts, students, links }, charts?, students?, links? }`
— a FORMAT, not a store (9 Sep 26): ⤓ Export writes one from the store, ⇪ Import
reads one back in (charts always; students & marks — and the links that ride
with them — only after a yes; the file's students are matched to the
enrolments the course already has, by person id then by name, so the store's
id wins and a student it does not carry keeps their place — `ids.js
reconcileIds`, 10 Sep 26). Nothing
binds a file; the store above is the record. The database migration's recipe
is exactly this shape: Export (both boxes ticked) → wipe → Import, answer yes.

---

## Loose spots a database migration should tighten

Listed in the order they would bite.

1. **The scheduler schema is declared but not yet enforced by the compiler.**
   Since 9 Sep 26 `src/engine/schema.ts` types every record above and
   `src/engine/schema.test.ts` walks the shipped seeds, the initial `SCHED`
   and both week snapshots against those types — an unknown field or a
   wrong primitive is a red test. The seeds never carry the after-boot
   fields tabled under the schedule day (a typed `br`, a landed `src`, a
   template's `sa`), so those are declared from their writers and the same
   test's "after edits" block exercises the writers to check them. The live
   exports (PEOPLE, DAYS, INPUTS, SCHED) still read `any` (the verbatim-port
   rule); flipping them is a later, behaviour-free step. The Leave War is
   fully typed.
2. **Three date conventions.** Scheduler: `'Jul 13'` display strings, a
   0..6 day index, minutes-from-midnight; Leave War: ISO `'yyyy-mm-dd'`;
   Tracker: free text. A shared store wants one (ISO).
3. **Positional slot keys — the id half is done (10 Sep 26).** Every
   schedule row (wave, formation, seat pair, duty block and row, sim,
   programme and ground row) carries `rid`: opaque, minted by one walk
   (`engine/rowids.ts ensureRowIds`) that runs before every baseline and
   snapshot, never printed, never used for addressing. A copy (a day
   template, a duplicated wave, a draft) is a new row and mints fresh; a
   move, an undo, a restore keeps the id; snapshots written before ids
   existed are back-filled by address once. Rows are STILL addressed by
   `day.section.index`, so inserting a row renumbers the ones after it
   (`keys.ts` remaps the book and the edit log to cope); the addressing
   rewrite is the next step. *(Corrected 24 Sep 26: that rewrite SHIPPED 11 Sep 26 — the amendment
   book now resolves rows by `rid`, translated at the screen boundary; `raptor-port/CLAUDE.md` §The
   slot-key grammar.)*
   *(6 Oct 26, the Codex stack check's W8: the rows of the two BUILT-IN demo weeks carry REPEATABLE ids — the same id
   for the same row on every load (`engine/weeks-data.ts seedRids`: its week, its day and its place in the day's walk;
   the boot seeds the module's own literal the same way). A day nobody has saved is read from the built-in week every
   time, and its random ids changed on every load, which lost any record keyed by a row id that does not save its day —
   a Blue/Red answer (D530). Every other row — a blank week's, anything added — is still minted at random.)*
4. **The demo seed is code.** PEOPLE, DAYS and INPUTS are literals in
   `people.ts` / `data.ts` / `inputs.ts`. A database replaces the seed; the
   seed then becomes test fixtures only. The repository is public: no real
   names or dates may ever be committed as seed.
5. **Accounts are two hard-coded users.** Real sign-in is a separate step
   from storage; `HOOKS.whoami()` is the one seam the edit log needs.
6. **Attachments are blobs in a per-browser file store** (IndexedDB
   `raptor-docs`, since 8 Sep 26). The database step gives them a **shared**
   file store, not a table column; inputs already reference them by id only.
   Ids are minted globally unique (`doc-`+UUID, 9 Sep 26) so a shared store
   never collides two files under one id; the DB layer still owns write-verify
   and cross-store referential integrity (see the storage-seam spec's
   "Database-stage requirements").
7. **`null` means "standard"** for every `sqn142_*` key. The migration must
   keep that meaning (absent row = shipped default), not store the default.
8. **The three worlds do not share a style** (sync vs async doors, three
   prefixes, TS vs JS). Unifying them behind one async door is the
   storage-seam work; the shapes above do not change for it.
9. **One person, three records — the student half is done (10 Sep 26).**
   The scheduler roster is the identity; the Leave War projects it (same
   ids) and a Tracker student is an enrolment id carrying `pid` where they
   were picked off that roster. Courses and syllabi are still keyed by
   typed name, and their storage keys are those names joined with `:`
   *(corrected 24 Sep 26: since 13 Sep 26 both are stable ids too — `COURSES`/`SYLS` entries `{id,name}`,
   keys filed under the id; `.claude/rules/decisions/tracker.md` §Architecture)*. The
   designed model (`data-model.md`) makes Enrolment (person × course ×
   syllabus) the row and the name an attribute.
10. **Progression is a summary, not a history.** A Tracker mark holds the
    latest grade, a failure count with dates, the done date and (since
    9 Sep 26) who last wrote it and when. It cannot answer "what happened on
    each attempt". `data-model.md` records each Attempt and derives today's
    mark from them.
11. **Hours are display text** (`'2.0 Hrs'`) in the event details, not a
    number, so nothing totals them. Left as-is on purpose — the owner is
    replacing the event details himself; the model types hours as a number.
12. **Two tabs of one browser overwrite each other's whole-record writes.** A known gap of the storage
    seam's first stage (8 Sep 26): each tab writes whole records through its own postman, so the later
    write wins; the stage-3 "incoming" side (live-ish sync) is the fix, which the database step
    brings. The Tracker's own case is in `docs/tracker/known-gaps.md`. *(Moved here 24 Sep 26 from
    `HANDOFF.md`'s storage-seam story, now archived, where it was the only place it was written.)*

## Suggested first cut of tables

The cheapest seamless path keeps the app's own units rather than
normalising on day one:

| Table | Row = | Source shape |
|---|---|---|
| `People` | one person | PEOPLE record (+ Leave War `Person` extras) |
| `Inputs` | one filed input | INPUTS record |
| `Weeks` | one week, JSON snapshot column | `weekStashSnap()` — DAYS + SCHED + muted warnings (the removed-input keys left it 30 Sep 26), stored since 30 Sep 26 as the week's rows — its week row, a day row for each day someone has saved, one per issuance and one per retraction (`src/state/weekrows.ts`; inputs and the planning layer are their own rows, not part of it) |
| `Amendments` | one published AL | `SCHED.als[n]` (also inside the week snapshot; split out when reporting needs it) |
| `EditLog` | one edit | `ELogRow` |
| `Settings` | one `sqn142_*` key | key + JSON value, absent = standard |
| `Attachments` | one file | id, name, mime, size + a file store reference |
| `LW_Wars` | one war | `LeaveWar` (period + the war's record lists as JSON) |
| `LW_Openings`, `LW_Ledger`, `LW_OilPolicy`, `LW_EventDefs`, `LW_Settings` | as named | the matching `leavewar:*` keys |
| `TR_Charts`, `TR_Students` | one container each | `charts`, `students` |

Normalising `Weeks` into Days / Waves / Formations / Aircraft rows is a
later step, worth doing only when something outside RAPTOR (a report, Power
BI) needs to query inside a week.

## The flying plan and the SANS calendar's colours (7–8 Oct 26; the first build's D580 records below, superseded)

**The flying plan (the Inputs / SANS redesign, 7 Oct 26 — D617–D642; `src/state/flyplan.ts`, records and resolver
`src/state/flyplan-model.ts`).** Three kinds of settings row, each its own stored record, written only by its typed admin
command and refused as a raw write: `settings/flyday:<YYYY-MM-DD>` = `{cls?, p?, w?}` — what is set for ONE date: its
flying class (`day`, `night`, `nf` no fly, `none` not set), required pilots, required WSOs; any subset; the class stored
only where it differs from what the date would inherit; the row removed when empty (`fly.day.set`, one command for one
date or a picked block). `settings/flyrule:<id>` = `{id, wd, cls, from, until?}` — every weekday `wd` (0 = Monday) from a
date onward, with or without a last day (`fly.rule.set`, `fly.rule.remove`). `settings/flyrun:<YYYY-MM-DD>` = `{p?, w?}`
— a required figure RUNNING from that date, per seat; `null` ends the run for that seat (`fly.run.set` — which, typed as
"From <date> on" on the Leave War, also takes that date's own `p` / `w` out of its `flyday:` row in the same command, so
the run shows on the day it starts: one command, two rows, one Undo step; applied to a PICKED BLOCK it does the same for
every picked flying weekday — one command, the run's row and each of those `flyday:` rows). Whole numbers of
zero or more; a row that fails the check is read as nothing. *(`settings/flynames` = `{p?, w?}`, a saved name for each Required row, was written by this branch's step 1 and is
GONE since 8 Oct 26 — D668: the Required rows keep their names. Nothing reads or writes the key; it never reached
`main`, so no table needs a column for it.)* From the same change `settings/sanscalendar` is read by the
flying plan as THREE figures, `{yellowFrom, amberFrom, redFrom}`, whole numbers, `1 <= yellow < amber < red`, defaults
1 / 3 / 5, written by the one admin command `settings.sanscalendar` from the SANS calendar's gear (D618). **The first
calendar build's own records are GONE since 8 Oct 26 (step 4 — the build plan §3.10):** its two-figure `sanscalendar`
(`{amberFrom, redFrom}`), its `settings/sansday:<date>` rows (`{required, flying}`) and its command `sans.day.set`, with
`src/state/sans-calendar.ts`. None of it reached `main`, so no table needs them; a row of either left in a browser's
storage is read by nothing (the two-figure record reads as the defaults). The day's requirement and class are the
`flyday:` / `flyrule:` / `flyrun:` rows above. The paragraph that described them is kept below, marked.

*(SUPERSEDED 8 Oct 26 — the first calendar build's records, removed; kept as written, for the record:)*
`settings/sanscalendar` holds `{amberFrom,redFrom}`: safe whole numbers, `1 <= amberFrom < redFrom`.
Absent/malformed reads shipped defaults1/3. `settings/sansday:<YYYY-MM-DD>` holds
`{required:number|null,flying:'unset'|'day'|'night'|'both'}`. Required is a safe integer >=0;
null means no target, 0 explicitly none required. A null/unset pair deletes the row.
Dates round-trip as real ISO dates; unknown fields/periods are refused. Writes use typed
admin commands `sans.day.set` and `settings.sanscalendar`, one settings record per changed day.
Input records are unchanged. Sun/moon intent never rewrites availability or issued schedules.
