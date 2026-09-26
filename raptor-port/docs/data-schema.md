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

### A day's OIL evidence (`Day.oild`, `Day.oilev` — 21 Sep 26, `[OIL-AUTO-REMOVE]`)

Two fields, and the difference between them is the whole design (`engine/oilev.ts`,
`docs/engine-rules.md` §Weekend/PH work earns OIL):

- **`oild` — the scheduler's DECISIONS. Day content.** `{ blanket?: 1, items?: {
  <itemKey>: 0 }, people?: { "<personId>|<itemKey>": 'allow' | 'deny' } }`. Stored on
  the live day, so it rides the snapshot, a parked plan, an undo and the persistence
  funnel like any typed time, and changing it is publishable as an amendment. Absent
  means nothing was decided, so the ordinary rules decide alone — which is why a mark
  turned on and off again is DELETED rather than left as an empty object.
- **`oilev` — the FROZEN evidence. On an ISSUED SNAPSHOT'S day copy ONLY.**
  `{ iso, earns, d: <the decisions>, inputs: [{ iid, person, type, asks, acc, win,
  ans }], sent: { <itemKey>: personId[] } }`. Attached by `publish.ts:daySnap` and
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
| `mod` | string | last-modified date, ISO `yyyy-mm-dd` on the seeds — but **the app writes the literal `'now'`** on every create, edit and trim (`src/ui/inputedit.tsx:348`, `:712`) and the Leave War sync does the same (`src/leavewar/sync.ts:334`); the reader resolves `'now'` to today's date (`src/engine/inputs.ts:683`). A store that keeps `'now'` keeps "modified today" for ever |
| `acc` | `undefined \| 'g' \| 'u' \| 'r'` | never landed / landed on the Ground Programme / actioned to Unavailable / **removed by a scheduler (dormant)** |
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

### The week record — `weekStashSnap()` / the week stash

Two snapshots share one field list (`schedFields()`, `src/state/history.ts` — **14 fields**),
and only one of them is stored.

**The week record** is `weekStashSnap()` (`src/state/store.ts:weekStashSnap`) —
what the stash holds for every visited week and what `raptor:weeks/<week>`
persists:

**CORRECTED 17 Sep 26 — the old example listed ELEVEN SCHED fields and mislabelled `un`.**
Three fields were missing: `sb` (signature BINDINGS), `v` (`ridV`) and `am` (`amV`, the
amendment-format stamp). That matters beyond tidiness: `engine/publish.ts` classifies a
published book with no `amV` as UNSUPPORTED and read-only-quarantines the week, so a
serializer built from the old list would freeze every week it wrote, and every signature
binding would be lost (a signature is content-valid only while its binding still matches).

```
{ d: DAYS,                                  // the seven day objects
  c, p, ad, a, al, ok, sg, sb, o, cv, dr, cd, v, am,   // the FOURTEEN SCHED fields,
                                            //   short names, from schedFields()
  wo: string[],                             // muted warning ids (view.WARNOFF)
  un: string[] }                            // stable input IDs (inpId) of inputs a
                                            //   scheduler removed on this week
```

| short | `SCHED` field | what it is |
|---|---|---|
| `c` | `changes` | issued key → the AL seq that issued it |
| `p` | `pending` | keys edited since the last issue (the TINT; not AL eligibility) |
| `ad` | `added` | outstanding draft structural-add identities |
| `a` | `als` | the AL records, one per issue, single-day |
| `al` | `al` | the week's AL bookkeeping |
| `ok` | `dayOK` | per-day published state |
| `sg` | `sign` | the four live sign-off slots per day |
| **`sb`** | **`signBind`** | **what each signature signed — digest, date, issued base id, plan revision. A signature is valid only while all four still match** |
| `o` | `orig` | the frozen Original per day |
| `cv` | `cur` | which version each day shows (a verId) |
| `dr` | `drafts` | the parked alternate plans per day |
| `cd` | `curDraft` | which plan the live day is |
| **`v`** | **`ridV`** | **row-id version stamp** |
| **`am`** | **`amV`** | **amendment-format stamp — a published book WITHOUT this reads as unsupported and is quarantined** |

It carries **no inputs and no planning layer** — those are global, and
their own records (`raptor:inputs/all`, `raptor:plan/all`, written
separately in `src/state/persist.ts:persistAll`).

**The undo snapshot** is `histSnap()` (`src/state/history.ts:histSnap`): the same
fields plus `i: INPUTS`, `pp: PLANPUCKS`, `dm: DAYRMK`. It is the undo
stack's unit only and is never stored.

The week stash (`src/engine/weekstash.ts`) keys week records by week-start
`'dd/mm/yyyy'` with a per-week change counter, and **it persists**: at
boot every `weeks/*` record is put back into the stash
(`src/state/persist.ts:hydrate`), and every history step writes every stashed
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

`{ t, who, pid, di, key, lbl, from, to }` — wall-clock, display name (from
`HOOKS.whoami()` — the signed-in CALLSIGN since `[ACCOUNTS]`, 26 Sep 26), the person behind it (`HOOKS.whoamiId()`,
so a rename moves nothing), day index or null, slot key, a frozen label of what it
was, before and after. Capped at 400 rows, oldest falls off.

### Accounts and session — `src/state/accounts.ts`, `src/state/auth.ts` (`[ACCOUNTS]`, 26 Sep 26 — D166, D204)

Three durable settings keys below (`accounts`, `accessreqs`, `guestview`), written ONLY by `state/accounts.ts` through
its intent commands; the session is memory only (a reload lands on the sign-in, as always).
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
| `accounts` | `Account[]` | `{ id, name, role: 'admin' \| 'main', pid, on }` — `name` the sign-in name (lower-case, unique; stands for the defence mail address), `pid` the person (one account each), `on` false = switched off (never deleted). **No password.** Null = the four seeded demo accounts (`[ACCOUNTS]`, D166) |
| `accessreqs` | `AccessRequest[]` | `{ id, name, cs, ini, seat, cat, at, seenBy }` — who asked (the signed-in principal, from the session); what he typed, text only — the displayed callsign/name (≤ 14), initials (may be blank), `seat` `FCP`/`RCP`/`GND`, `cat` (`''` for personnel) — never a link to a puck; when; `seenBy` the account ids of the admins who have had it on screen (each admin's bell). (D204; `[ACCOUNTS-NEW-PERSON]` D214, D216, D227 — the typed name field gave way to the initials, D219) |
| `guestview` | `true` or null | the admin's switch letting people waiting for access read the published week as a guest — OFF (null) by default (D204) |
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
`eventrows`, `showsans`, `personedits`, `postouts`. (Since [ARCH-STACK] step 4,
20 Sep 26, a stored war holds `{ period, recs }`; an older blob is not migrated —
`SCHEMA_VERSION` 4 clears `inputs`, `weeks` and `leavewar` on a returning browser.)

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
personEdits: { personId: { seat?, band?, sxo? } }
```

### Records

| Record | Fields |
|---|---|
| `Person` | `id, callsign, seat: 'pilot' \| 'wso' \| 'gnd', band: 'instructor' \| 'ops', sxo, from, to` (dates in squadron, null = open), `poArchive?, q?, scd?, scn?, xq?: string[], san?, pers?, label?` — built from the scheduler's PEOPLE, **same ids** |
| `LeaveWar` | `{ period, recs }` — one war (stored) |
| `Recs` | `personId → date → WarRec[]` — the war's OWN records only ([ARCH-STACK] step 4) |
| `WarRec` | one of: **request** `{ id, kind:'request', code, state: 'pending' \| 'acknowledged' \| 'refused', shiftedFrom?, carried? }` · **OIL credit** `{ id, kind:'credit', code: 'FO' \| 'HO', oil: 'auto' \| 'manual', note?, spans? }` · **notice** `{ id, kind:'notice', code, was, byType, byWho, seq, at }` (a replaced bid, until "OK, seen"). Nothing "approved" is ever stored here — approved leave is the Input with `lw` |
| `Period` | `id, name, start, end, stage: 'draft' \| 'open' \| 'closed' \| 'published', bidFrom, bidTo, days: DayInfo[], bands: EventBand[]` |
| `Grid` (derived) | `personId → date → code` — the main code a cell shows |
| `Cell` | `{ type, portion: 'full' \| 'am' \| 'pm' }` — a parsed code |
| `States` (derived) | `personId → date → BidRecord` — the main record's colour state; `source: 'raptor'` now means "locked on the war" (filed on the Inputs page, or medical) |
| `Views` (derived) | `personId → date → DayView` — every record on the day, the main one, the corner mark, the charges (`engine/dayview.ts`) |
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
later flight (D123). Since the seam the Tracker's data flows through the
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
map is deleted with the flag. A course whose conversion did not finish
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
| `Weeks` | one week, JSON snapshot column | `weekStashSnap()` — DAYS + SCHED + muted warnings + removed-input keys, exactly the record `raptor:weeks/*` already holds (inputs and the planning layer are their own rows, not part of it) |
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
