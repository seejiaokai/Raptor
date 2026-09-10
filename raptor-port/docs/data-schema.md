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
| Scheduler | `store` + `storeBackend.impl` in `src/engine/hooks.ts`, plugged in once by `src/main.tsx` | `raptor:settings/*`, `raptor:weeks/*`, `raptor:inputs/all`, `raptor:people/all`, `raptor:plan/all` (legacy `sqn142_` imported once) | the whiteboard (`src/storage/`) → BrowserBackend on the built site |
| Leave War | `StorageBackend {read, write}` in `src/leavewar/state/storage.ts`, now the whiteboard-backed adapter | `raptor:leavewar/*` (legacy `leavewar:` ignored) | the whiteboard (`src/storage/`) → BrowserBackend on the built site |
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
| Undo history, edit log | scheduler session memory | **No** — session-only by design |
| Attachment bytes (medical documents) | in-memory cache → per-browser IndexedDB drawer (`raptor-docs`, `src/storage/docstore.ts`) on the built site; memory-only in dev/tests | **Yes** on the built site (per browser, since 8 Sep 26); no in dev/tests |
| Accounts | hard-coded in `src/state/auth.ts` | n/a |

`?fresh=1` on the URL forces the Memory backend for a clean-start demo. So
"moving RAPTOR to a database" is now giving these already-per-browser shapes
a permanent, **shared** home, rather than saving them for the first time.

---

## World 1 — the scheduler

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
| `iid` | string | minted `'i' + n`, monotonic; the stable handle (never address by index). At boot the counter is seeded past the highest stored id (`src/state/persist.ts:55`), so a reload never re-mints one |
| `person` | string | a PEOPLE id |
| `date` | string | day, display form (`'Jul 13'`) |
| `endDate` | string? | last day of a multi-day input |
| `yr` | number | the anchor year the bare date label belongs to — written on create/edit (`src/ui/inputedit.tsx:712`, `src/ui/InputsPage.tsx:391`, `src/leavewar/sync.ts:323`) and back-filled at boot on any row without one (`src/state/store.ts:602`); part of the content key `inpKey` |
| `allday` | boolean | all day, or a window |
| `s`, `e` | number? | window start / end in **minutes from midnight** (when not all-day) |
| `half` | string? | half-day marker for types that allow it |
| `type` | string | one of the catalogue codes below |
| `remarks` | string? | free text, may be `''`; absent on the seed SANS rows |
| `mod` | string | last-modified date, ISO `yyyy-mm-dd` on the seeds — but **the app writes the literal `'now'`** on every create, edit and trim (`src/ui/inputedit.tsx:348`, `:712`) and the Leave War sync does the same (`src/leavewar/sync.ts:334`); the reader resolves `'now'` to today's date (`src/engine/inputs.ts:683`). A store that keeps `'now'` keeps "modified today" for ever |
| `acc` | `undefined \| 'g' \| 'u' \| 'r'` | never landed / landed on the Ground Programme / actioned to Unavailable / **removed by a scheduler (dormant)** |
| `lw` | string? | the **war id** the row was derived from, written by the Leave War sync (`src/leavewar/sync.ts:340`) — the loop-breaker, see Sync below |
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
| wave | `standalone`, `kind` (`sc \| avalon \| bb`), `noconf` | `makeStandalone` (`src/engine/waves.ts:43`), the + Wave picker (`src/ui/board.ts:994`), a placed template (`src/engine/wavetpl.ts:239-240`) |
| formation | `shift` | `makeStandalone` (`src/engine/waves.ts:51`), a standby template (`src/engine/wavetpl.ts:225`) |
| formation | `br` (typed SC in-time) | the board's B box (`src/ui/board.ts:195`) through the `ff:…br` text key (`src/engine/slots.ts:252`) |
| formation | `area`, `atime` (the typed-over area strip) | `src/ui/textedit.ts:184`, `:194` |
| seat pair | `spare`, `role` | `saCrewRow` (`src/engine/waves.ts:40`), a standby template (`src/engine/wavetpl.ts:190`), the MAIN/SPARE badge flip |
| duty block | `sa` (which standalone wave the desk serves), `noconf` | `waveDutyBlock` (`src/engine/waves.ts:96`), `blockFromTpl` (`src/engine/dutytpl.ts:184`) |
| ground row | `rmks`, `src` (the landed input's content key) | `acceptInput` (`src/engine/slots.ts:367`) |
| day | `gman` (ground list frozen to hand order) | a ground-row drag / Sort (`src/engine/reorder.ts:237`, `:425`) |

### The publish book — `SCHED`, `src/engine/publish.ts`

Everything about a week's publication state, keyed by day index 0..6.

| Field | Shape | Meaning |
|---|---|---|
| `al` | number | amendment counter |
| `pending` | `{ key: 1 }` | edits made since the last publish |
| `changes` | `{ key: alNumber }` | **issued** keys → the AL number that issued them (`src/engine/publish.ts:359`); a key edited again is deleted from here as it goes pending (`:294`) |
| `added` | `{ key: 1 }` | structural adds (a new line/wave/row) |
| `als` | `[{ n, keys[], sign, days[], n0, adds, structAdds, snap }]` | every published amendment (AL), newest last; `sign` here is the four **callsigns** frozen at issue, `snap` the covered days as issued |
| `dayOK` | `{ di: 1 }` | which days are **published — approval is per day, not per week** |
| `sign` | `{ di: { cur, sked, plan, appr } }` | the four sign-off slots per day; each value is a **PEOPLE id** when signed (the picker's options are ids, `src/ui/html.ts:1538-1539`, written by `src/ui/Shell.tsx:169`) and `''` when unsigned |
| `orig` | `{ di: snapshot }` | the day as first published |
| `cur` | `{ di: 'orig' \| n }` | which version each day currently shows |
| `drafts`, `curDraft` | `{ di: [blob] }`, `{ di }` | per-day alternate drafts and which is live |

Synthetic keys ride the same book: `del:<day>.<n>.<kind>` (a deletion),
`mov:…` (a move), `inp:<day>.<token>` (an input filing).

### The week record — `weekStashSnap()` / the week stash

Two snapshots share one field list (`schedFields()`, `src/state/history.ts:22`),
and only one of them is stored.

**The week record** is `weekStashSnap()` (`src/state/store.ts:300-302`) —
what the stash holds for every visited week and what `raptor:weeks/<week>`
persists:

```
{ d: DAYS,
  c, p, ad, a, al, ok, sg, o, cv, dr, cd,   // the SCHED fields, short names
  wo: string[],                             // muted warning ids
  un: string[] }                            // content keys (inpKey) of inputs a
                                            //   scheduler removed on this week
```

It carries **no inputs and no planning layer** — those are global, and
their own records (`raptor:inputs/all`, `raptor:plan/all`, written
separately in `src/state/persist.ts:89-91`).

**The undo snapshot** is `histSnap()` (`src/state/history.ts:43`): the same
fields plus `i: INPUTS`, `pp: PLANPUCKS`, `dm: DAYRMK`. It is the undo
stack's unit only and is never stored.

The week stash (`src/engine/weekstash.ts`) keys week records by week-start
`'dd/mm/yyyy'` with a per-week change counter, and **it persists**: at
boot every `weeks/*` record is put back into the stash
(`src/state/persist.ts:80-83`), and every history step writes every stashed
week plus the loaded one — the loaded one only once it has changed since
load, so a pristine seed week is never written (`:96-105`). The record id
is the key with `/` replaced by `-` (`raptor:weeks/13-07-2026`). This is
what the persistence table at the top calls "per-week stash — Yes".

### Planning layer — `src/state/plan.ts`

- `PLANPUCKS[]`: `{ id: 'pp'+n, date: 'yyyy-mm-dd', kind?: 'pucks', text?, ids?: personId[] }` — a section dropped on a calendar day; the day column is `date` (`src/state/plan.ts:79`, `:130`), a note carries `text` and no `kind`, a pucks row carries `kind: 'pucks'` and `ids`
- `DAYRMK`: `{ 'yyyy-mm-dd': title }` — the day's free-text title

### Attachments — `src/state/docs.ts`

`docBackend.impl`: a map `id → { name, mime, size, blob }` — the synchronous
read path the viewer needs in render. Behind it (since 8 Sep 26) a durable
per-browser drawer: **IndexedDB** `raptor-docs` (`src/storage/docstore.ts`),
wired by `docBoot` from `main.tsx` on the built site only (dev/tests/`?fresh`
stay memory-only). `docAdd` writes through to it; `docBoot` fills the cache
back at boot and advances the id counter past every stored id (a reset `seq`
must not reuse a hydrated `doc<N>`). Its OWN drawer, deliberately NOT the
~5 MB text seam a couple of photos would overflow. Accepts photos (`image/*`)
and PDFs, capped at **8 MB** each. Append-only (undo can resurrect the input
that owned one). Input records carry only the id, never the bytes. Fail-soft:
a drawer that will not open (private mode) leaves the store memory-only.
Migration seam: a browser that persisted INPUTS before the drawer existed
holds `docId`s whose blobs were never saved — read honestly as "no document
on file" (never fabricated) until the data is cleared.

### Edit log — `ELOG.rows`, `src/engine/editlog.ts`

`{ t, who, di, key, lbl, from, to }` — wall-clock, display name (from
`HOOKS.whoami()`), day index or null, slot key, a frozen label of what it
was, before and after. Capped at 400 rows, oldest falls off.

### Accounts and session — `src/state/auth.ts`, `src/state/users.ts`

- `ACCOUNTS`: `{ username: { pass, role: 'admin' | 'main', label } }` — **two hard-coded prototype accounts**
- `SESSION`: `{ user, role }`; `ME`: the logged-in person's PEOPLE id
- `USERS[]`: `{ name, role }` — the Admin page's list

### Settings and templates — the `sqn142_*` keys

Each key writes **`null` when the squadron is on the shipped standard**, so
a later change to the standard is picked up rather than frozen in a browser.

| Key | Value | Record |
|---|---|---|
| `daytpl` | `DayTpl[]` | `{ id, title, d: DayTplBlob }` — a whole saved day (the day shape above, minus date fields) |
| `wavetpl` | `WaveTpl[]` | `{ id, title, kind: 'fly' \| 'sc' \| 'avalon' \| 'bb', lines: [{ cs, msn, to, ld, spare }] }` |
| `wavehide` | `string[]` | hidden wave-template ids |
| `wavedefault` | `string[]` | house wave order |
| `dutytpl` | `DutyTpl[]` | `{ id, title, wave: '' \| 'sc' \| 'avalon' \| 'bb', rows: [{ role, str, end }] }` |
| `cxreasons` | `string[]` | the cancel-reason list |
| `lookahead` | `{ w, s }` | weeks ahead, to-Sunday flag |
| `secdefault` | `string[]` | section order, from `notes, prog, waves, duty, sims, ground, inputs, avail, sans, unav` |
| `stores` | `[[key, label]]` | the stores list |
| `qualcols` | `QualCol[]` | the LoX column list — `{ k, h, lav?, apt?, scq?, aar?, fcpOnly? }` in display order (saved since the 8 Sep 26 bug pass: the ticks under a column persist, so the column must too) |
| `rules` | `{ v: { rule: number }, s: { kind: boolean } }` | overrides only: `v` for thresholds off the standard (`briefLead, dur, step, dekit, minTurn, tightTurn, crewRest, debrief, reportLead, longDay, epBrief, simDebrief, amtDebrief, openEnd, maxRun, inputLead, scDayFrom, scDayTo, simLen, oilFullMin`), `s` for which kinds hard-clash a shift (`fly, sim, duty, shift, ground, prog`) |

---

## World 2 — Leave War

Fully typed (TypeScript interfaces), so these shapes are exact. Dates here
are ISO `'yyyy-mm-dd'` throughout.

### Keys (`raptor:leavewar/*` on the built site; legacy `leavewar:*`)

Every key its `persist()` writes — about twenty (`src/leavewar/state/store.ts`):
`wars`, `current`, `openings`, `ledger`, `oilpolicy`, `eventdefs`, `figorder`,
`rosterorder`, `perslabels`, `manningorder`, `manninghidden`, `fighidden`,
`groupdefs`, `grouppriority`, `grouppriocustom`, `groupcolors`, `manningdefs`,
`eventrows`, `showsans`, `personedits`, `postouts` — plus the pre-migration
trio `grid`, `states`, `stage` that older browsers may still hold (read once,
migrated into `wars`).

The last two are the only per-person records Leave War keeps (8 Sep 26 bug
pass — a posting-out date used to vanish on reload): `personedits` is
`{ [personId]: { seat?, band?, sxo? } }`, an admin's identity overrides;
`postouts` is `{ [personId]: Person }`, the person as last projected with
the posting-out window (`to`, `poArchive`) on them — an entry exists only
while `to` is set. `people` itself is never stored: it is re-projected from
Raptor's `PEOPLE` on every boot and these two are laid back on top.

### The state — `src/leavewar/state/store.ts`

```
people: Person[]            requirements: Requirements     qualCatalog: QualDef[]
eventDefs: EventDef[]       wars: LeaveWar[]               currentId: string
period, grid, states        // derived from the current war — never stored separately
openings: Openings          ledger: Ledger                 oilPolicy: OilPolicy
role: 'member' | 'admin'    viewer: string | null
figureOrder, rosterOrder, manningOrder, manningHidden, figureHidden: string[]
persLabels, groupColors: Record<string, string>
groupDefs: GroupDef[]       groupPriority: string[]        groupPriorityCustom: boolean
eventRows: number           showSans: boolean
focusDate: string | null    focusSeq: number
personEdits: { personId: { seat?, band?, sxo? } }
```

### Records

| Record | Fields |
|---|---|
| `Person` | `id, callsign, seat: 'pilot' \| 'wso' \| 'gnd', band: 'instructor' \| 'ops', sxo, from, to` (dates in squadron, null = open), `poArchive?, q?, scd?, scn?, xq?: string[], san?, pers?, label?` — built from the scheduler's PEOPLE, **same ids** |
| `LeaveWar` | `{ period, grid, states }` — one war |
| `Period` | `id, name, start, end, stage: 'draft' \| 'open' \| 'closed' \| 'published', bidFrom, bidTo, days: DayInfo[], bands: EventBand[]` |
| `Grid` | `personId → date → code` (the code string a cell shows) |
| `Cell` | `{ type, portion: 'full' \| 'am' \| 'pm' }` — a parsed code |
| `States` | `personId → date → BidRecord` |
| `BidRecord` | `state: 'pending' \| 'acknowledged' \| 'approved' \| 'refused', source: 'bid' \| 'raptor', shiftedFrom?, note?` |
| `Openings` | `personId → { counter: number }` — opening balances |
| `CounterName` | `'annual' \| 'oil' \| 'ccl' \| 'fcl' \| 'pl' \| 'el' \| 'cl'` |
| `LedgerEntry` | `id, personId, counter, amount, date, reason, approvedBy, givenBy?` — a grant or correction |
| `OilPolicy` | `expiry: { n, unit: 'days' \| 'months' } \| null, historyMonths \| null` |
| `OilLedger` (derived) | `credits: OilCredit[], debits: OilDebit[], balance, earned, granted, taken, expired, overdrawn, first` |
| `OilCredit` | `id, date, amount, reason, source: 'opening' \| 'auto' \| 'grant', approvedBy?, givenBy?, manual?, expires, used: [{date, amount}], left, expired, ledgerId?` |
| `OilDebit` | `id, date, amount, reason, source: 'taken' \| 'correction' \| 'opening', from: [{creditId, amount}], unbacked, ledgerId?` |
| `EventDef` | `{ name, kind: 'off' \| 'free' \| 'nolv' \| 'work' }` |
| `Requirements` | `{ default: { rules: ManningRule[] }, overrides: { key: Requirement } }` |
| `QualDef` | `{ k, label }` |

### Sync with the scheduler — `src/leavewar/sync.ts`

Two wires, both **derived reconciliation** (compute desired state, diff,
write only the difference — never a queue):

- approved leave, and the four medical markers (`ATT B`, `ATT C`, `HL`,
  `OML`), cross from the war grid to the schedule as an input tagged
  `lw: <war id>` (`src/leavewar/sync.ts:340`);
- leave / medical filed on the Inputs page crosses to the grid as a cell
  whose `BidRecord.source` is `'raptor'`.

Each direction is blind to the other's writes (outbound skips
`source: 'raptor'` cells; inbound skips `lw` inputs), so one pass reaches a
fixed point. **A database must preserve both markers** or the loop-breaker
is lost.

---

## World 3 — the Tracker

Vendored JavaScript, shapes fixed in `src/tracker/app/fileFormat.js`.
Course, syllabus and student names are free text and are used as object
keys on purpose (nested objects, never joined strings).

### Keys (`raptor:tracker/*` on the built site; legacy `ocu:*`) and prefs (`ocuLocal:*`)

`v3:master`, `v3:courses`, `v3:lay`, `v3:eventinfo`, `v3:seedstamp` hold
the containers below. Since the seam the Tracker's data flows through the
whiteboard and lands under `raptor:tracker/<key>` (e.g. `raptor:tracker/v3:master:syls`);
the legacy `ocu:*` keys are imported once. `ocuLocal:*` holds this browser's
last course and crew member — a view preference, written straight to
localStorage (NOT through the whiteboard), kept outside the shared prefix by design.

### Containers

```
charts   = { order: string[],
             syllabi:  { name: event[] },        // event = { id, type, seq, prereqs: string[], phase, _b }
             layouts:  { name: object },
             eventInfo: { eventId: { name, fmt, hrs } } }

students = { courses: string[],
             byCourse: { course: {
               plan: object,
               bySyllabus: { syl: {
                 roster: string[],
                 marks:  { student: { eventId: { g, f } } },   // g = grade (0 = none), f = failure ticks
                 dates:  { student: { eventId: date } } } } } } }
```

A mark record is `{ g, f, fd, d, by?, at? }` — grade code, failure count,
one ISO date per failure (oldest first, null when undated), the done date,
and since 9 Sep 26 **who** made the last write (Raptor's `HOOKS.whoami()`
display name, absent when unknown) and **when** (ISO instant). `dates[s]`
(`lastSyll, lastCurr, downDays, upchit`) carries the same two stamps. Undo
snapshots restore them verbatim.

### The person link — `v3:links`

`{ [course]: { [studentName]: personId } }` — the one record that ties a
Tracker student to a Raptor `PEOPLE` id (9 Sep 26). Written when a student
is added by picking them off the squadron roster (the Students card's
`+ Add` lists the roster via the no-import bridge `src/tracker/people.js`,
fed by `TrackerPage.tsx` → `src/tracker/peoplewire.ts`), dropped with the
student, moved by a course rename, and carried by Export/Import as a third
block `links`. Additive: a typed-in student has no link and behaves exactly
as before. Students are STILL keyed by their typed name everywhere else —
the person id becomes the key at storage-seam stage 2.

Course, syllabus and student names are storage-key segments joined by `:`,
so a name containing a colon is refused at every entry point and by the
file check.

### The syllabus file

`{ format: 'ocu-tracker', version: 1, savedAt, contains: { charts, students, links }, charts?, students?, links? }`
— a FORMAT, not a store (9 Sep 26): ⤓ Export writes one from the store, ⇪ Import
reads one back in (charts always; students & marks — and the links that ride
with them — only after a yes). Nothing
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
3. **Positional slot keys.** Schedule rows are addressed by
   `day.section.index`, so inserting a row renumbers the ones after it
   (`keys.ts` remaps the book and the edit log to cope). A database row
   wants a stable id, the way `iid` already gives inputs one.
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
9. **One person, three records.** The scheduler roster is the identity;
   the Leave War projects it (same ids) and the Tracker now LINKS to it
   (`v3:links`, 9 Sep 26) — but Tracker students, courses and syllabi are
   still keyed by typed name, and their storage keys are those names joined
   with `:`. The designed model (`data-model.md`) makes Enrolment
   (person × course × syllabus) the row and the name an attribute.
10. **Progression is a summary, not a history.** A Tracker mark holds the
    latest grade, a failure count with dates, the done date and (since
    9 Sep 26) who last wrote it and when. It cannot answer "what happened on
    each attempt". `data-model.md` records each Attempt and derives today's
    mark from them.
11. **Hours are display text** (`'2.0 Hrs'`) in the event details, not a
    number, so nothing totals them. Left as-is on purpose — the owner is
    replacing the event details himself; the model types hours as a number.

## Suggested first cut of tables

The cheapest seamless path keeps the app's own units rather than
normalising on day one:

| Table | Row = | Source shape |
|---|---|---|
| `People` | one person | PEOPLE record (+ Leave War `Person` extras) |
| `Inputs` | one filed input | INPUTS record |
| `Weeks` | one week, JSON snapshot column | `weekStashSnap()` — DAYS + SCHED + muted warnings + removed-input keys, exactly the record `raptor:weeks/*` already holds (inputs and the planning layer are their own rows, not part of it) |
| `Amendments` | one published AL | `SCHED.als[n]` (also inside the week snapshot; split out when reporting needs it) |
| `EditLog` | one edit | `ELogRow` |
| `Settings` | one `sqn142_*` key | key + JSON value, absent = standard |
| `Attachments` | one file | id, name, mime, size + a file store reference |
| `LW_Wars` | one war | `LeaveWar` (period + grid + states as JSON) |
| `LW_Openings`, `LW_Ledger`, `LW_OilPolicy`, `LW_EventDefs`, `LW_Settings` | as named | the matching `leavewar:*` keys |
| `TR_Charts`, `TR_Students` | one container each | `charts`, `students` |

Normalising `Weeks` into Days / Waves / Formations / Aircraft rows is a
later step, worth doing only when something outside RAPTOR (a report, Power
BI) needs to query inside a week.
