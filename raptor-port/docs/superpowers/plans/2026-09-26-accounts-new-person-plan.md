# Plan — `[ACCOUNTS-NEW-PERSON]`: one door for a new person, the sign-up asking the same, the admins' bell (D214, D216, D217, D219, D220, D222, D224–D227), 26 Sep 26

Builder: Opus 5.5 (high thinking). Reviewers: Fable 5.1 and Astra — both, independently (roles, saved data). Tier:
**FULL**. Branch `claude/accounts-new-person` (from `main` after `[ACCOUNTS]` merged, PR #442). Rulings this chat: D224–D229
(the rest of the accounts chat's range, D210–D229).

**Status: REVISED after red-team round 1** (Fable: APPROVE WITH CHANGES; Astra: APPROVE WITH CHANGES, with three questions
for him — answered the same hour, D225–D227). Every finding is dispositioned in §Round 1 at the end; both reports are kept
verbatim (`docs/superpowers/specs/2026-09-26-accounts-new-person-redteam-r1-{fable,astra}.md`). The approved mock-up
(D224) is the design of record: `raptor-port/docs/mock/new-person-account.html` (pictures
`docs/mock/img/new-person-account/*.png`).

## What he ruled, in one paragraph

A new person — a new callsign on the roster — is made in ONE place: **Admin → Users** (D217). The admin's "Add an account"
gets a **New person** choice beside picking someone already on the roster: callsign/name, initials, pilot / WSO /
personnel, CAT — making his Quals row and his account together, in one step (D214). The sign-in may be left **blank** for
someone who will not use the app (a SANS man from another squadron): that makes a roster-only person (D217). The person's
own **sign-up** (Request access) asks the **same things** (D214), and **approving** it offers the same New person choice,
**filled from what he gave** (D214). A new access request **lights the admins' bell**; a tap says so and goes to Admin →
Users; it goes out once he has opened that list; a member's bell never lights for it (D216) — **each admin's bell is his
own** (D227). **Quals keeps everything after that**, and its "+ Add person" becomes a **button to Admin → Users**; the old
form and its tests are retired (D217, D201). The field reads **"Callsign/Name"** (D219) — on the **sign-up card only**
"Displayed callsign/name" (D222) — and stays at **14 letters, the form saying so rather than cutting a name** (D226). The
seat choice reads **"Pilot", "WSO", "Personnel (ground crew)"** (D220). **Initials are asked on both forms and required on
neither** (D225). The mock-up is approved (D224).

## The rules sweep — every ruling that applies

| Id | Ruling (date) | What it demands of this build |
|---|---|---|
| D214 | Admin → Users creates a brand-new person with his account in one step; callsign, initials, pilot/WSO/personnel, CAT; approving offers the same, filled from the request; the SAME add Quals used (one callsign rule), one command (26 Sep) | §2 the one add; §3 the commands; §5 the forms |
| D216 | a new access request lights the admins' bell; a tap → Admin → Users; out once he has opened that list; the Admin tab's count stays until answered; never a member's bell; Teams at the database step (26 Sep) | §4 |
| D217 | ONE door: Admin → Users (or his approved sign-up); a blank sign-in makes a roster-only person; Quals keeps everything after; "+ Add person" becomes a button to Admin → Users; the 15 Aug form retired (26 Sep) | §2, §5.3, §5.4; the form, its state, its tests and the docs describing it go (D201, §8) |
| D219 | the field reads "Callsign/Name" — ONE field, the puck's label; sign-up, Admin → Users (add, approve, the account editor), the Quals column head; the sign-up's Name box gives way to initials (26 Sep) | §5 labels, §5.7 the words roll-call; the request loses `full` (§1) |
| D220 | "Pilot", "WSO", "Personnel (ground crew)" wherever a new person's seat is asked (26 Sep) | ONE list both forms read (§2 `SEATS`) |
| D222 | on the sign-up card ONLY the field reads "Displayed callsign/name" (26 Sep) | §5.1 |
| D224 | the mock-up approved; plan → red-team → build → walk → FULL check (26 Sep) | this plan |
| D225 | initials asked on both forms, required on neither (26 Sep) | §2 (no "initials required" refusal; a length refusal only) |
| D226 | the callsign/name stays at 14 letters; the form says so, never cuts a name (26 Sep) | §2 refusal 2; §5.1/§5.3 no `maxLength` on those two boxes, an inline line once past 14 |
| D227 | each admin's bell is his own (26 Sep) | §4 |
| D204 | join either way; a typed callsign never claims a puck by itself; waiting screen; guest switch (26 Sep) | approving still makes the admin choose (§5.2 — never pre-picked) |
| D221 | the waiting screen's "View the schedule" with guest access on (26 Sep) | kept; the waiting line changes to the new fields (§5.1) |
| D166 | accounts: one person one account, tied to a callsign; the sign-in stands for the defence mail's; admin creates admins and members (25 Sep) | every existing account guard holds for the new commands (§6) |
| D223 | the sign-in keeps its password box until the database step (26 Sep) | unchanged |
| D200, D202 | one permissions module mirroring data-model §11, drift-tested (26 Sep) | §3: new command types and `more` tables in `COMMAND_OPS`; §11 edited with `perms.ts` |
| D149, D218 | a member edits his own Quals row, every column but the callsign (24/26 Sep) | unchanged — a member never adds a person; only an admin renames |
| D201 | a new ruling fixes what the old one left: documents, app, lists (26 Sep) | §8 |
| D138 | a move never rewords; a superseded passage in a doc moves whole to the archive (24 Sep) | §8: the three ui-contracts Add-person passages moved whole |
| 12 Aug + 14 Sep 26 (PID-01) | two people cannot share a callsign; a callsign cannot collide with an internal id (`nameToId`, id-tolerant) | §2 keeps the exact guard and its test |
| 26 Aug 26 | Personnel hold no CAT (`pers:true`, `q:''`) | §2 |
| 25 Aug 26 | production words on screen | every new string |
| 7 Aug 26 (robustness doctrine) | a missing pick fails CLOSED with its reason; a refused value is never left looking saved | §2: seat and CAT "Pick…" until chosen; §5: no silent truncation (D226) |
| 16 Sep 26 | new work follows the ONE command layer | §3 |
| D56 | demo data is not a finding | a stored request written by the old build is read tolerantly, not migrated |

## The design

### 1. The records

**`AccessRequest`** (the `accessreqs` settings record; data-model §3) becomes `{ id, name, cs, ini, seat, cat, at, seenBy }`:

- `name` — the signed-in principal (from the session, never typed; unchanged).
- `cs` — "Displayed callsign/name" as typed, trimmed; refused past 14 (D226 — never cut).
- `ini` — initials as typed, trimmed, upper-cased; may be `''` (D225); refused past 12 (`MAX_INITIALS`, the Quals box's
  limit). Replaces `full` (D219).
- `seat` — `'FCP' | 'RCP' | 'GND'` (shown "Pilot" / "WSO" / "Personnel (ground crew)", D220). A NEW request can never
  store `''` — the card refuses it.
- `cat` — one of `catsFor(seat)`; `''` for `GND` (and never `''` for aircrew on a new request).
- `at` — when (unchanged).
- `seenBy` — the account ids of the admins who have had the waiting list on screen since it arrived (D216, D227; §4).
  Starts `[]`.

The loader (`accountsLoad`, which never writes) reads each field defensively: an unknown seat reads `''`, a CAT not in that
seat's list `''`, `ini` upper-cased and sliced to 12, `seenBy` strings only. A request stored by the old build (`full`, no
seat) loads with the missing fields blank and the approve form shows them as "Pick…"; nothing is migrated (D56). Slicing in
the loader is only for that old demo data — every WRITER refuses an over-long value instead (D226).

**The person** a new-person command makes is exactly the record the Quals add made: `{ cs, initials, seat, q, flight: '-' }`
+ `deriveQuals`, or for personnel `{ cs, initials, seat: 'GND', pers: true, q: '', flight: '-', remarks: '' }`; its id
`newId('p')`, **minted inside the command** (a rolled-back add leaves no id anywhere); `ID_BY_CS[cs.toLowerCase()] = id`.
Flight and quals are set on Quals afterwards (D214).

**No new settings key.** The bell's "seen" rides on the request (`seenBy`), so it vanishes with the request when it is
answered (approve, decline, an account added or renamed onto that sign-in name) and needs no pruning.

### 2. The one add — `src/state/roster-add.ts` (new)

The Quals page's `addPerson` rules move here unchanged and become the ONLY place a person is created (D214, D217):

- `SEATS` — `[{ v: 'FCP', l: 'Pilot' }, { v: 'RCP', l: 'WSO' }, { v: 'GND', l: 'Personnel (ground crew)' }]` — the ONE
  list every form reads (D220).
- `catsFor(seat)` — moved here from `QualsPage.tsx` (the Quals CAT box imports it back) — one list.
- `MAX_CS = 14` (moved here; `accounts.ts` re-exports it for its existing readers), `MAX_INITIALS = 12`.
- `CALLSIGN_LABEL = 'Callsign/Name'`, `SIGNUP_CALLSIGN_LABEL = 'Displayed callsign/name'` — the D219/D222 words, one
  constant each (bug-check order §6: a wording ruling gets one shared body).
- `interface NewPerson { cs: string; ini: string; seat: string; cat: string }`.
- `newPersonProblem(np, opts?: { roster?: boolean }): string | null` — every refusal, in the app's words, in this order:
  1. callsign/name blank → "Type the callsign or name";
  2. longer than 14 → "A callsign or name is at most 14 letters — use a short form" (D226);
  3. (only when `roster !== false`) **the PID-01 guard, verbatim:** `nameToId(cs)` resolves to anyone (by callsign OR bare
     id, archived and the ALL / ALL AVAIL placeholders included). If the match is a real archived person (`archived &&
     !special`) → "<cs> is archived — restore them on the Quals page instead"; otherwise (a live person, a placeholder, a
     bare-id match) → "<cs> is already taken — callsigns must be unique";
  4. initials longer than 12 → "Initials are at most 12 letters" (blank is fine — D225);
  5. seat not one of `SEATS` → "Pick pilot, WSO or personnel";
  6. not personnel and CAT not one of `catsFor(seat)` → "Pick the CAT".
  The sign-up calls it with `roster: false` — a person not yet let in may not read the roster (§11 `Person` has no Pending
  read), so item 3 is never asked of him; the admin sees any clash when approving.
- `putNewPerson(np): string` — the mutation alone (mints the id, writes PEOPLE, `deriveQuals`, `ID_BY_CS`), returning the
  id. Called only INSIDE a command that enlisted the people store; it RE-CHECKS `newPersonProblem` there and throws
  `CmdRefused(problem)` on a refusal — a silent, rolled-back refusal whose reason reaches the screen (Fable F3, Astra F5),
  never a plain `Error` (which the command layer logs as a bug).
- `addRosterPerson(np): string | null` — the admin's roster-only add (blank sign-in, D217): `mayManageRoster()` first
  ("Only an admin can add someone"), then `newPersonProblem`, then ONE `person.add` command through `commitPeopleIntent`
  (§3).

`QualsPage.tsx` loses `addPerson`, `addP`, `showAdd`, the form (`#qCS`, `#qInitials`, `#qFlight`, `#qSeat`, `#qLevel`,
`#qAddPerson`) and any CSS only it used; the `.qtablehead` keeps its "+ Add person" button (§5.4).

### 3. The commands and who may run them (D200 — `perms.ts` and data-model §11 together)

Two helpers in `state/people-settings-commit.ts`, sharing ONE people-finalise body (`advancePeople` — persist the roster,
advance the baseline):
- `commitPeopleIntent(type, meta, fn)` — enlists the people store, runs `fn`, finalises. Used by `person.add` (Astra F3:
  never `commitPeopleEdit`, whose type is `people.edit` = `Person U`).
- `commitPeopleSettingsIntent(type, meta, fn)` — enlists the people store AND the settings store, runs `fn`, finalises
  the people half. A person and his account commit or roll back together (`command/commit.ts` phase 6 restores every
  enlisted store — Fable's explicit negative, checked).

Both return the command's result; the accounts wrapper (`commitIntent` in `accounts.ts`, and the new helpers' callers)
maps it for the screen: `refused` → its own message; `unauthorized` → "You are not allowed to do that"; anything else →
"That did not save".

| Command | Writes | Who (COMMAND_OPS: base + `more`) |
|---|---|---|
| `person.add` (new) | people | `Person` C |
| `account.addNew` (new) | people + `accounts` (+ `accessreqs` when that sign-in name had asked — answered) | `User` C + `Person` C + `AccessRequest` D |
| `access.approveNew` (new) | people + `accounts` + `accessreqs` | `AccessRequest` D + `User` C + `Person` C |
| `access.seen` (new) | `accessreqs` (`seenBy` only) | `AccessRequest` U |
| `access.request` (fields changed) | `accessreqs` | `AccessRequest` C own — pending, unchanged |
| `account.add` (corrected) | `accounts` (+ `accessreqs` answered) | `User` C + `AccessRequest` D |
| `account.update` (corrected — Astra F1) | `accounts` (+ `accessreqs` answered on a rename onto a waiting name) | `User` U + `AccessRequest` D |
| `access.approve` (corrected) | `accounts` + `accessreqs` | `AccessRequest` D + `User` C |

**`CommandOp` gains an optional `more: [table, act][]`**; `cmdAuthorize` evaluates the base op AND every `more` op, each
with its own own-row rule, before any success return — the command is authorised only if every one allows (Astra F1 step
4). All roles but admin are refused every one of these at phase 1, before anything runs.

**§11 (edited with `perms.ts`; `perms.test.ts` holds them together):** `AccessRequest` — Admin **R U D** (was R D); note
gains "U — which admins have had it on screen: each admin's bell (D216, D227); what he typed — callsign/name, initials,
seat, CAT — is text only; approving with New person makes the `Person` from it, with the admin's corrections, in the same
step as the `User`; a `User` added or renamed onto a waiting sign-in name answers (deletes) its request". `Person` — note
gains "created only on Admin → Users, alone or with its `User` in one step (D217)". `User` — note gains "created with a
new `Person` in one step, or linked to one already on the roster".

**Tests (`perms.test.ts`, Fable F11 / Astra F1):** every `[table, act]` in `more` names a PERMS row; the four new types sit
in the admin-only loop; a command whose `more` op is withheld from a role is refused as a whole with neither record changed
(a test-only matrix row withholds one op).

`ownershipViolation` needs no change: an admin is not limited there; any other role is refused at the gate first.

### 4. The admins' bell (D216, D227) — "seen" per admin

- `currentAdminAccountId(): string | null` (in `accounts.ts`) — `SESSION.user` resolved to an existing account that is ON,
  an admin, and whose person exists; else null (Astra F6: the localhost probe bridge can make a session's role "admin"
  with no admin account behind it; a headless test has no session — Fable F12).
- `unseenRequests()` — the waiting requests whose `seenBy` lacks that id; `[]` when the id is null.
  `accessAlert()` = `isAdmin() && unseenRequests().length > 0`.
- `markRequestsSeen()` — no-op without that id or with nothing unseen; otherwise ONE `access.seen` command adding the id to
  every waiting request's `seenBy`.
- **The bell lights** on `accessAlert()` — beside `bellLit()`, `bugAlert()` and the OIL question in the Shell's bell class
  and its memo deps.
- **The tap, first in order:** someone locked out of the app outranks a bug report or an OIL question (the agent's call;
  Fable confirmed it is the agent's; on the look card): toast "N waiting for access — opening Admin → Users" (N = every
  request waiting), `openAdminUsers()`, then the Admin page.
- **"Opened that list" (Fable F1):** `AdminPage` computes `shown = cat === 'users' && (drilled || !HOOKS.isPhone())`
  (the Admin page's phone breakpoint is 820px, the same as `HOOKS.isPhone`) and passes it to `UsersPanel`; an effect in
  `UsersPanel`, keyed on `[shown, version]`, calls `markRequestsSeen()`. So: desktop — the Admin tab alone puts it out
  (the Users pane is on screen beside the rail); phone — the category list ("Users · 1 waiting for access") does NOT, the
  drilled-in Users list does. A request arriving while the list is on screen is seen at once (the version tick).
- The Admin tab's count, the drawer's badge and the Users row's "N waiting for access" are unchanged — they count every
  request until answered.
- **Stated honestly:** switching an account off takes effect at its next sign-in; an admin session already open keeps
  running until it ends (today's one-browser prototype; the database step's server ends it — already filed with
  `[ACCOUNTS]`'s IT brief).

### 5. The screens (the approved mock-up is the design of record)

**5.1 The sign-up card (Request access — `AccessScreen.tsx`).** Four fields, labelled, in this order:
`SIGNUP_CALLSIGN_LABEL` (D222) · "Initials" · "Pilot, WSO or personnel" (a select: "Pick…", then `SEATS`) · "CAT" (a
select: "Pick…" then `catsFor(seat)`; hidden for personnel; put back to "Pick…" when the seat changes to one whose list does
not hold it). **No `maxLength` on the callsign/name box** (D226): past 14 a line under it says "At most 14 letters — use a
short form" at once, and "Request access" refuses with that reason; the initials box keeps `maxLength={12}` (a 12-letter
limit on initials is not a name being cut — the agent's call). "Request access" refuses with the reason in `#accErr`
(§2 items 1, 2, 4, 5, 6 — never item 3). The Name box goes (D219). **The waiting screen** reads "You asked for access as
**Viper** (JKB · Pilot · CAT C)." — blank initials drop out ("(Pilot · CAT C)"); personnel "(ABC · Personnel)". Ids kept:
`#accCs`, `#accErr`, `#accSend`, `#accOut`; new `#accIni`, `#accSeat`, `#accCat`, `#accCsLong`; `#accFull` goes.
**CSS (Fable F5):** `.login select` styled beside `.login input` — same width, box-sizing, background, border, colour,
padding, radius, height, focus outline, `appearance: none` with the app's caret (as the other selects) — the approved
pictures are the contract.

**5.2 Approving (Admin → Users, Waiting for access).** The request's line reads "asked as **Viper** · JKB · Pilot · CAT C ·
26/9 16:01" (blank parts drop out). **Approve** opens a PERSON choice — "On the roster" | "New person" (the mock-up's
segmented pair):
- **New person** — the default when the typed callsign does NOT resolve to anyone: the four fields in two columns
  (Callsign/Name · Initials / Pilot, WSO or personnel · CAT), filled from the request, editable; the note "Filled from
  what he gave when he signed up — change anything before you give access."; Role; **"Add person and give access"**
  (`approveRequestNew` → `access.approveNew`).
- **On the roster** — the default when the typed callsign resolves to someone: the picker (relabelled, §5.7), **never
  pre-picked** (D204), with the note naming the MATCHED person's callsign, never an id (Fable F14): "He typed Ranger —
  Ranger is on the roster. Pick them if this is them." / for a bare-id match "He typed bane — that is Ranger. Pick them if
  this is them." / for an archived match "He typed Ratchet — Ratchet is archived; restore them on the Quals page to link
  them." / for a placeholder no note (and New person refuses it as taken). Role; **"Give access"** (`approveRequest`,
  unchanged).
- **Form state (Fable F13):** each open of Approve starts afresh from the request (Cancel discards edits); within one open,
  switching On the roster ↔ New person keeps what was typed or picked in each half. Opening Approve on another request, or
  a decline of another request, does not touch an open form (state keyed by the request).
- Cancel, as today. Ids: `#apvModeRoster`, `#apvModeNew`, `#apvCs`, `#apvIni`, `#apvSeat`, `#apvCat`, `#apvCsLong`,
  `#apvNote`; kept `#apvPid`, `#apvRole`, `#apvGo`, `#apvCancel`.

**5.3 Adding (Admin → Users, "Add an account").** Sign-in (defence mail) first — its placeholder "name@mail (blank for
someone who won't sign in)" while New person is chosen (the mock-up script's wording), "name@mail" otherwise; then PERSON —
"On the roster" | "New person" (default "On the roster", since most accounts are for people already on Quals; "New person"
when arriving from Quals' "+ Add person"):
- **On the roster:** today's picker (relabelled); Role; **"Add account"** (unchanged; a blank sign-in is refused, as today).
- **New person:** the four fields (the callsign/name box with D226's line); the note from the mock-up — "Makes his row on
  Quals and his account together — the one place a new person is made. Leave the sign-in blank for someone who won't use
  the app (a SANS man). Flight and quals are set on Quals."; Role **only when a sign-in is typed** (no account, no role —
  the agent's call); the button reads **"Add person and account"** with a sign-in, **"Add person"** without
  (`addPersonAndAccount` → `account.addNew`, or `addRosterPerson` → `person.add`).
- On success: toast "Blaze added — nomad2@mail can sign in now" / "Blaze added to the roster — set flight and quals on the
  Quals page"; the form clears back to "On the roster" (a double tap then meets an empty form and its refusal — Fable S6f).
- Ids: `#accModeRoster`, `#accModeNew`, `#accAddCs`, `#accAddIni`, `#accAddSeat`, `#accAddCat`, `#accAddCsLong`; kept
  `#accAddName`, `#accAddPid`, `#accAddRole`, `#accAdd`.

**5.3a Opening Admin → Users from elsewhere (both reviewers — Fable F2, Astra F4).** ONE consumer. `state/view.ts`:
`ADMINOPEN: { seq: number; newPerson: boolean } | null` and `openAdminUsers(opts?)` — increments `seq`, sets the intent,
`setPage('admin')`, `notify()`. `AdminPage` alone consumes it in an effect keyed on `ADMINOPEN?.seq`: capture the intent,
`setCat('users')`, `setDrilled(true)` (inert on a desktop), `setOpenNew(intent.newPerson ? intent.seq : 0)`, then
`clearAdminOpen()`. It works whether the page was just mounted or was already up (on Squadron config, say). `UsersPanel`
takes `openNew` as a PROP and, on a change to a non-zero value, chooses New person in the add form, scrolls it into view
and (on a desktop) focuses the Callsign/Name box. `ADMINOPEN` is registered in `VIEW_RESET` with the `'session'` scope.

**5.4 Quals.** "+ Add person" (`#qAddToggle`, admin only as today) becomes a plain button — no `aria-expanded`, no
✕ Close — calling `openAdminUsers({ newPerson: true })`. The column head reads **"Callsign/Name"** in every seat view and
in the frozen header mirror (one body, `qualsHead`). Nothing else on Quals changes.

**5.5 The account editor** (an account row tapped): the picker's label reads "Callsign/Name"; its first option
"Pick a callsign or name…". Nothing else.

**5.6 Phone.** The two-column field pairs (`.adm-2col`, as drawn at 390px) must fit the Users pane with no sideways scroll
and nothing clipped; the sign-up card is one column. Walked and measured at 390, 1440 and a 1440×700 window (bug-check
order §7.2).

**5.7 The words roll-call (D219, D220, D222 — Fable F8, Astra F8).** Change: every visible label and every accessible
name that asks for the field — the add / approve / editor pickers' `aria-label` ("The callsign or name this account
belongs to") and first option ("Pick a callsign or name…"); the refusal "Pick the callsign or name this account belongs
to"; the Quals head and its frozen mirror; the Quals callsign edit box's `aria-label` ("Callsign/Name for <cs>"); the Quals
CSV export's first head cell ("Callsign/Name" — the column head, printed). Keep (they describe the puck, not the field —
the agent's call, on the look card): the account row's "no callsign" / "archived callsign" tags, the note "Each person has
one account, tied to their callsign", the head's sort title "Sort by callsign". "Displayed callsign/name" on the sign-up
card only. No "(FCP)" / "(RCP)" anywhere a new person's seat is asked (grep the built bundle).

### 6. The guards (each refusal says why, on screen)

Every existing account guard holds for the new commands (one sign-in name one account; lower-cased; ≤ 80; a request under
that name answered). Plus §2's person refusals. **Order:** the person's problems and the account's problems are checked
BEFORE the command, the first one said; inside, `putNewPerson` re-checks and refuses with `CmdRefused`, so a refusal between
the check and the write rolls back both stores and still says why. A member, a guest, a pending person or an account
switched off calling any new function is refused at the function ("Only an admin can …"), at the command gate, and by the
ownership check.

### 7. What does NOT change

The accounts list, the account editor (but its label), switch off/on, decline, the guest switch, the sign-in, the seeded
accounts, D223's password box; Quals' own-row editing (D149, D218), archive, restore, Edit quals; the Leave War and the
Tracker — they pick a new person up through their existing projections of the roster (`reprojectRoster`,
`peoplewire.ts`), which run on the notify AFTER a command seals (never a half-made person — Fable, checked); the Tracker
lists AIRCREW only (`projectForTracker` skips personnel by design — Astra F9); undo — people and settings commands are not
undoable (`undo/timeline.ts`), so adding a person is no more undoable than the Quals add was (`[UNDO-ROSTER-SETTINGS]` stays
filed) and writes no Edit history row.

### 8. The documents (D201, D138, D200)

- `docs/data-model.md` §3 `AccessRequest` (fields `signInName`, `callsign`, `initials`, `seat`, `cat`, `requestedAt`,
  `seenBy`; `name` goes; the approve-with-New-person sentence) and §11 (`Person`, `User`, `AccessRequest` — §3 above).
- `docs/data-schema.md` — the `accessreqs` shape line; `state/accounts.ts`'s header comment (the same shape).
- `docs/engine-rules.md` §Auth / roles — the roles table's "Quals — Add person" row → "Admin → Users — add a person (alone
  or with his account)"; the who→personId passage (~2308) "`addPerson` refuses…" → the one add; the sign-up's fields;
  the bell.
- `raptor-port/CLAUDE.md` §Architecture rules, the person-identity paragraph ("`addPerson` refuses a callsign…") → names
  `state/roster-add.ts newPersonProblem`, the one add.
- `docs/ui-contracts.md` — the three Quals "Add person" passages (~3795, ~3896, ~3939): **as built, NOT moved** — the
  first two KEPT WORD FOR WORD IN PLACE inside a "*(Was … — replaced by D217: …)*" pointer that names the ruling, the
  third (a one-sentence "stays admin") corrected in place to name the new door, its meaning unchanged (D138 holds either
  way: the old words are unchanged, or the correction keeps the meaning). *Corrected 26 Sep 26 after Fable's code read
  #3: this line first said the passages would be "MOVED WHOLE to `docs/archive/` by `scripts/backlog-archive.mjs
  --move`"; ui-contracts is read when the job needs it, not by every chat, so keeping them in place is what the
  build did.* Then the button's contract written; §The access screens (the four fields, the waiting line); Admin → Users (New person, approve with New person, the
  opening intent); the bell's access trigger, its order and "seen".
- `docs/feature-impact.md` — the "Leave War tab" row's "a Quals-page add" and the Tracker row's bridge sentence → the one
  door; a flow "a new person" (the one door → PEOPLE → every projection).
- `docs/handover-dataverse.md` — the `AccessRequest` fields line; the separate "callsign, name" wording (Astra F8).
- `docs/file-map.md` — `state/roster-add.ts` (+ its test); the walk scripts.
- The register `docs/superpowers/specs/2026-09-26-accounts-behaviour-register.md` — AC3 and AC11 reworded to the four fields
  (Fable F6); rows NP1–NP8 (below); `scripts/rulecheck.mjs` RULES in step.
- Code comments that describe the retired form: `QualsPage.tsx` (192, 295, 746–750), `scheduler.css` (1941),
  `engine/slots.ts` (692), `leavewar/sync.ts` (1257) and `leavewar/state/raptorRoster.ts` (46–48) — the last two quote his
  18 Aug words ("add personnel through quals"): the quote kept, a pointer added that the door is Admin → Users now.
- Walk scripts that drive the old forms, moved to the new doors: `scripts/handpass/trk-w3-09-roster.mjs` (the Quals form),
  `acc-walk.mjs` and `acc-walk2.mjs` (`#accFull` → `#accIni`, `#accSeat`, `#accCat`).
- `OUTSTANDING.md` `[ACCOUNTS-NEW-PERSON]` — archived at the merge; `HANDOFF.md` this chat's block.

**The register rows (NP1–NP8):**

| Id | The rule | Ruling |
|---|---|---|
| NP1 | A new person is made only on Admin → Users — alone (blank sign-in) or with his account — and the Quals page's "+ Add person" goes there | D217 |
| NP2 | The one add keeps the one callsign rule: a callsign that is anyone's (callsign or id, archived and the placeholders included) is refused with its reason; only a real archived person is pointed at Restore | D214, PID-01 |
| NP3 | A new person with his account is ONE step: both are made or neither, and a refusal inside still says why | D214 |
| NP4 | The sign-up asks what the admin's form asks — displayed callsign/name, initials (never required), pilot / WSO / personnel, CAT — and refuses a missing pick or an over-long name with its reason; it never tells a person not yet let in whether a callsign is taken | D214, D222, D225, D226, D204 |
| NP5 | Approving offers New person, filled from the request; a typed callsign that is someone's opens "On the roster", named by his callsign, and is never picked for the admin | D214, D204 |
| NP6 | A new request lights each admin's bell until HE has had the waiting list on screen (the phone's category list does not count); a member's never; the tap goes to Admin → Users first | D216, D227 |
| NP7 | The words: "Callsign/Name" (sign-up card: "Displayed callsign/name") at 14 letters, said when over; "Pilot", "WSO", "Personnel (ground crew)" | D219, D220, D222, D226 |
| NP8 | Only an admin adds a person, approves or marks requests seen — at the function, the command gate (every table the command writes) and the ownership check | D200, D217 |

## Roll-call — every place the change reaches (bug-check order §6)

The THING: **a person** (a new one), **an access request**, **the add/approve forms**, **the words**. The walk fills the
"walked" column in the evidence sheet.

| # | Place | Must after the build |
|---|---|---|
| 1 | Sign-up card, desktop + phone | four fields, D222 label, the two selects styled as the boxes, refusals, D226's line, no Name box |
| 2 | Waiting screen | the new "asked as" line; D221's button unchanged; no bell mounted (no-because: not signed in to the app) |
| 3 | Switched-off screen, the guest view | no bell mounted (no-because) |
| 4 | Admin tab badge, the drawer's Admin badge (phone), the Users row's "N waiting" | unchanged counts |
| 5 | The bell (desktop + phone) | lights for an unseen request (admin, his own); tap → Admin → Users (from any page, the Admin page included); out once the list was on screen; the phone's category list does not count |
| 6 | Admin → Users, Waiting: the request line | "asked as Viper · JKB · Pilot · CAT C · when"; personnel "· Personnel ·" |
| 7 | Approve — New person | four fields filled; "Add person and give access" |
| 8 | Approve — On the roster | the picker, never pre-picked; the note naming the matched callsign |
| 9 | Add — On the roster | unchanged but the words |
| 10 | Add — New person, with a sign-in | person + account, one step |
| 11 | Add — New person, blank sign-in | roster-only person; no Role; "Add person" |
| 12 | The account editor | the words only |
| 13 | The accounts list sort | a name among callsigns sorts by its letters (no-because change: same sort) |
| 14 | Quals "+ Add person" (admin) | goes to Admin → Users, New person chosen, from any page; absent for a member |
| 15 | Quals column head + its frozen mirror | "Callsign/Name" in every seat view |
| 16 | Quals CSV export | first head "Callsign/Name" |
| 17 | Quals table | the new person in his seat view, CAT chip, flight "-" |
| 18 | The scheduler's crew lists (edit week palette, board's Available crew) | the new aircrew person offered |
| 19 | Inputs (admin files for anyone) | the new person offered |
| 20 | Highlight chips / search | the new person found |
| 21 | Leave War roster | the new person in his group (aircrew by CAT; personnel in Personnel, out of manning) |
| 22 | Tracker "+ Add" roster list | a new PILOT or WSO listed; a new PERSONNEL person NOT listed (no-because: the Tracker lists aircrew only, by design) |
| 23 | Tracker's "Or type a callsign" | makes a Tracker STUDENT, not a person (no-because: D191; not a second door) |
| 24 | Admin → Users "On the roster" picker | a roster-only person is linkable later |
| 25 | The new person signs in | lands as himself — the badge, "this is you", his Inputs, his Quals row (callsign read-only, D218) |
| 26 | A reload after each | person, account, request and "seen" kept; a first write on a fresh world then a reload (§7.7) |
| 27 | Undo button, Edit history | the add is not undoable and writes no row (no-because: people/settings not cut over); an earlier schedule undo still works after an add |
| 28 | Member / guest / pending / switched off | none of the new doors; the gate refuses a hand-made call (unit) |
| 29 | Help page, Logic page | nothing — searched: neither describes the old form |

**The door check** (every action → its control, in every state): add a roster-only person ("Add person"); add a person with
an account ("Add person and account"); approve with a new person ("Add person and give access"); approve linking someone on
the roster ("Give access"); reach the add form from Quals ("+ Add person"); reach the waiting list from the bell (the bell,
from any page); request access ("Request access"); cancel and reopen an approve form (re-filled from the request); switch
On the roster ↔ New person and back (each half keeps its entries); leave the archived refusal by its door (Quals →
Archived → Restore → back → On the roster).

## Build order (each behaviour red first)

1. `state/roster-add.ts` + `roster-add.test.ts`: `SEATS`, `catsFor`, the limits and labels, `newPersonProblem` (every
   refusal: blank, 15 letters, PID-01's bare id, a live callsign, archived vs placeholder, 13 initials, blank initials
   allowed, seat, CAT; `roster: false` skips the roster check), `putNewPerson` (re-check → `CmdRefused`, no console
   error), `addRosterPerson` (admin only; one `person.add` put in `people`; `ID_BY_CS`; baseline; survives a reload).
2. `people-settings-commit.ts` `commitPeopleIntent` + `commitPeopleSettingsIntent` (one finalise body); `perms.ts` `more`,
   the four new types, the three corrected; §11 with it — `perms.test.ts` red until both agree.
3. `accounts.ts`: the request's fields and loader; `requestAccess(np)`; `addPersonAndAccount`; `approveRequestNew`;
   `currentAdminAccountId`, `unseenRequests`, `accessAlert`, `markRequestsSeen`; `commitIntent`'s messages;
   `ACCOUNT_TYPES` += the four. Tests (`accounts.test.ts`): NP3 atomicity — a refusal inside (no person, account, request
   change, index entry or envelope), a throw after the person before the account, a throw after both, the ownership
   check's refusal after both changed; one storage group holding `people` + `settings/accounts` (+ `accessreqs`); notify
   subscribers not called on a refusal (the Leave War / Tracker projections cannot see a half-person); NP6 two admins,
   reload, member/guest/pending/off, a probe-made admin with no account, a request arriving while seen, approve/decline
   before seen; NP8 each role at the function and the gate.
4. `state/view.ts` `ADMINOPEN` + `openAdminUsers` + `clearAdminOpen` (VIEW_RESET 'session').
5. UI: `AccessScreen.tsx`; `UsersPanel.tsx` (one small `PersonChoice` used by add and approve; `openNew`; the seen effect);
   `AdminPage.tsx` (the one consumer; `shown`); `Shell.tsx` (the bell); `QualsPage.tsx` (the button, the head, the CSV
   head, the aria-labels; the form removed); `scheduler.css` (`.login select`). Tests: `accounts-ui.test.tsx` (NP4–NP7:
   the forms, the words, the bell's order, `shown` at both widths with `HOOKS.isPhone` stubbed, the intent from Quals twice
   and from the bell while on Squadron config, a sign-out clearing it); `quals.test.tsx` (the retired form's tests replaced
   by the button test; the head and CSV words; the PID-01 test moved to `roster-add.test.ts`).
6. e2e (`geometry.spec.ts`): the sign-up card — every `select` shares the first input's left and right edges and height,
   the button square under them, at 1440 and 390; the Users pane's New person pairs at 390 — nothing past the pane, no
   sideways scroll.
7. Documents (§8), the register, rulecheck, the three walk scripts.
8. Gates → the walk (Fable's S1–S17, driven by the roll-call) → the two code reads (with the evidence sheet) → fixes →
   re-walk → gates → the sheet → his look.

## On the look card (the agent's calls — his to correct)

1. The bell's tap goes to the waiting list before a bug report or an OIL question.
2. Seat and CAT start at "Pick…" on both forms — never a silent default (the old Quals form defaulted to Pilot / OCU).
3. With a blank sign-in the Role box hides (no account, no role).
4. Approving: a typed callsign that is someone's opens "On the roster" with a note, never pre-picked.
5. The "Add an account" heading stays over a roster-only add (the mock-up as approved).
6. The words kept: "no callsign" / "archived callsign" tags, "tied to their callsign", "Sort by callsign".
7. Tapping through a pre-filled New person for someone already on Quals under another callsign makes a second person — the
   way back is Archive on Quals (there is no delete of a person).
8. A person's seat cannot be changed after he is added (pre-existing: Quals has no seat box) — fix it at Approve.

## Not in this build

- Teams notice to the admins — the database step (D204, D216).
- Undo of adding a person or an account — `[UNDO-ROSTER-SETTINGS]` (unchanged).
- Ending an admin session already open when its account is switched off — the database step (§4).

## Round 1 — what changed (every finding dispositioned)

**Fable (APPROVE WITH CHANGES):** F1 `shown` defined, both widths tested → §4. F2 one consumer with a nonce, works when
already mounted → §5.3a. F3 `CmdRefused` + the message kept → §2, §3. F4 placeholder vs archived wording → §2 item 3.
F5 `.login select` + e2e → §5.1, build 6. F6 the missed documents and scripts → §8. F7 kept whole → §8 (ui-contracts: kept in place with the ruling named, not moved — see §8's correction).
F8 the words split → §5.7, look card 6. F9 initials — put to him: **D225, required on neither** → §2, §5. F10 the silent
cut — put to him: **D226, keep 14 and say so** → §2, §5. F11 `perms.test.ts` reads `more` → §3. F12 headless / bridge →
§4 (`currentAdminAccountId`). F13 roll-call rows and doors → roll-call 2–4, 13, 15–16, 22–23, 27; door check; §5.2 form
state. F14 the nits → §5.2 (the note names the callsign), look card 5 and 7, §1 (new requests never blank, id minted
inside). Part 2 (S1–S17) adopted as the walk.

**Astra (APPROVE WITH CHANGES):** 1 `account.update` + `AccessRequest D`; `cmdAuthorize` checks every op; the withheld-op
test → §3. 2 the three questions — put to him: D225 (initials, via Fable's form of it), D226 (14 letters), **D227 (each
admin's own bell)**; the bell's ORDER kept as the agent's call (Fable confirmed it is; on the look card). 3
`commitPeopleIntent` + one finalise body → §3. 4 one consumer → §5.3a. 5 `MAX_INITIALS`, refuse don't slice (writers),
placeholder wording, `CmdRefused` → §1, §2. 6 `currentAdminAccountId`; the open-session limit stated → §4. 7 the atomicity
tests widened (refusal, throws, ownership refusal, one storage group, no half-person to subscribers) → build 3; the
backend-failure retry contract is the storage layer's own (unchanged, already tested there) and is NOT re-asserted here.
8 the words sweep incl. accessible names, the CSV and the handover → §5.7, §8. 9 Tracker personnel → roll-call 22.
