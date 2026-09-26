# Plan — `[ACCOUNTS-NEW-PERSON]`: one door for a new person, the sign-up asking the same, the admins' bell (D214, D216, D217, D219, D220, D222, D224), 26 Sep 26

Builder: Opus 5.5 (high thinking). Reviewers: Fable 5.1 and Astra — both, independently (roles, saved data). Tier:
**FULL**. Branch `claude/accounts-new-person` (from `main` after `[ACCOUNTS]` merged, PR #442). Rulings this chat: D224–D229
(the rest of the accounts chat's range, D210–D229).

**Status: DRAFT for red-team round 1.** Nothing is built. The approved mock-up (D224) is the design of record:
`raptor-port/docs/mock/new-person-account.html` (pictures `docs/mock/img/new-person-account/*.png`).

## What he ruled, in one paragraph

A new person — a new callsign on the roster — is made in ONE place: **Admin → Users** (D217). The admin's "Add an account"
gets a **New person** choice beside picking someone already on the roster: callsign/name, **initials**, pilot / WSO /
personnel, CAT — making his Quals row and his account together, in one step (D214). The sign-in may be left **blank** for
someone who will not use the app (a SANS man from another squadron): that makes a roster-only person (D217). The person's
own **sign-up** (Request access) asks the **same things** (D214, "signs up for an account"), and **approving** it offers
the same New person choice, **filled from what he gave** (D214). A new access request **lights the admins' bell**; a tap
says so and goes to Admin → Users; it goes out once he has opened that list; a member's bell never lights for it (D216).
**Quals keeps everything after that** — quals, CAT, flight, archive, restore — and its "+ Add person" becomes a **button to
Admin → Users**; the old form and its tests are retired (D217, D201). The field reads **"Callsign/Name"** (some people have
no callsign — D219) on the sign-up, Admin → Users (add, approve, the account editor) and the Quals column head; on the
**sign-up card only** it reads **"Displayed callsign/name"** (D222). The seat choice reads **"Pilot", "WSO",
"Personnel (ground crew)"** (D220). The mock-up is approved (D224).

## The rules sweep — every ruling that applies

| Id | Ruling (date) | What it demands of this build |
|---|---|---|
| D214 | Admin → Users creates a brand-new person with his account in one step; callsign, initials, pilot/WSO/personnel, CAT; approving offers the same, filled from the request; the SAME add Quals used (one callsign rule), one command (26 Sep) | §2 the one add; §3 the commands; §5 the forms |
| D216 | a new access request lights the admins' bell; a tap → Admin → Users; out once he has opened that list; the Admin tab's count stays until answered; never a member's bell; Teams at the database step (26 Sep) | §4 the bell and "seen" |
| D217 | ONE door: Admin → Users (or his approved sign-up); a blank sign-in makes a roster-only person; Quals keeps everything after; its "+ Add person" becomes a button to Admin → Users; the 15 Aug form retired (26 Sep) | §2, §5.3, §5.4; the Quals form, its state, its tests and the docs that describe it go (D201) |
| D219 | the field reads "Callsign/Name" — ONE field, the puck's label; sign-up, Admin → Users (add, approve, account editor), the Quals column head; no separate name field — the sign-up's Name box gives way to initials (26 Sep) | §5 labels; the request record loses `full` (§1) |
| D220 | the seat choice reads "Pilot", "WSO", "Personnel (ground crew)" wherever a new person's seat is asked (26 Sep) | ONE list both forms read (§2 `SEATS`) |
| D222 | on the sign-up card ONLY the field reads "Displayed callsign/name" (26 Sep) | §5.1 |
| D224 | the mock-up approved; plan → red-team → build → walk → FULL check (26 Sep) | this plan |
| D204 | join either way; a typed callsign never claims a puck by itself; waiting screen; guest switch (26 Sep) | approving still makes the admin choose (§5.2 — no pre-selection when the typed callsign matches someone) |
| D221 | the waiting screen's "View the schedule" with guest access on (26 Sep) | kept; the waiting screen's words change to the new fields (§5.1) |
| D166 | accounts: one person one account, tied to a callsign; the sign-in stands for the defence mail's; admin creates admins and members (25 Sep) | the account half of every new command keeps every existing guard (§6) |
| D223 | the sign-in keeps its password box until the database step (26 Sep) | unchanged |
| D200, D202 | one permissions module mirroring data-model §11, drift-tested; a change to who may do something changes §11 in the same change (26 Sep) | §3: new command types in `COMMAND_OPS`; §11 `AccessRequest` gains the admin's U (seen) — edited with `perms.ts` together |
| D149, D218 | a member edits his own Quals row, every column but the callsign (24/26 Sep) | unchanged — a member still never adds a person; only an admin renames |
| D201 | a new ruling fixes what the old one left: documents, app, lists (26 Sep) | §8: every doc describing the Quals Add person form; the request's `full`; engine-rules' roles table row; the Tracker walk script that drove the old form |
| 12 Aug + 14 Sep 26 (PID-01) | two people cannot share a callsign, and a callsign cannot collide with an internal id (`nameToId`, id-tolerant) | §2 keeps the exact guard and its test |
| 26 Aug 26 | Personnel (ground crew) hold no CAT (`pers:true`, `q:''`) | §2 |
| 25 Aug 26 | production words on screen, prototype truths in comments | every new string |
| 7 Aug 26 (robustness doctrine) | a missing pick fails CLOSED with its reason, never a silent default | §2: seat and CAT are "Pick…" until chosen, and a refusal names what is missing |
| 4 Sep 26 | a click-open popup closes on a click outside | not affected — the forms are inline, not popups |
| 16 Sep 26 | new modules follow the ONE command layer | the add is ONE command over the people and settings stores (§3) |
| D56 | demo data is not a finding | a stored request written by the old build (with `full`) is read tolerantly and not migrated |

## The design

### 1. The records

**`AccessRequest`** (the `accessreqs` settings record; data-model §3) becomes:

`{ id, name, cs, ini, seat, cat, at, seenBy }`

- `name` — the signed-in principal (from the session, never typed; unchanged).
- `cs` — "Displayed callsign/name" as typed, trimmed, ≤ 14 (the Quals callsign box's limit, `MAX_CS`, unchanged).
- `ini` — initials as typed, trimmed, upper-cased, ≤ 12 (the Quals initials box's limit). Replaces `full` (D219: the
  Name box gives way to initials).
- `seat` — `'FCP' | 'RCP' | 'GND'` (shown "Pilot" / "WSO" / "Personnel (ground crew)", D220).
- `cat` — one of `catsFor(seat)`; `''` for `GND`.
- `at` — when (unchanged).
- `seenBy` — the account ids of the admins who have had the waiting list on screen since this request arrived (D216;
  §4). Starts `[]`.

The loader (`accountsLoad`, which never writes) reads each field defensively: an unknown seat reads `''`, a CAT that is
not one of that seat's reads `''`, `seenBy` keeps only strings. A request stored by the old build (`full`, no seat)
loads with `seat: ''`, `cat: ''`, `ini: ''` — the admin then fills them in when approving; nothing is migrated (D56).

**The person** a new-person command makes is exactly the record the Quals add made (unchanged shape):
`{ cs, initials, seat, q, flight: '-' }` + `deriveQuals`, or for personnel `{ cs, initials, seat: 'GND', pers: true,
q: '', flight: '-', remarks: '' }`; its id `newId('p')`; `ID_BY_CS[cs.toLowerCase()] = id`. Flight and quals are set on
Quals afterwards (D214).

**No new settings key.** The bell's "seen" rides on the request (`seenBy`), so it vanishes with the request when it is
answered and needs no pruning.

### 2. The one add — `src/state/roster-add.ts` (new)

The Quals page's `addPerson` body moves here, unchanged in its rules, and becomes the ONLY place a person is created
(D214 "the same add the Quals page uses"; D217 "one door"):

- `SEATS` — `[{ v: 'FCP', l: 'Pilot' }, { v: 'RCP', l: 'WSO' }, { v: 'GND', l: 'Personnel (ground crew)' }]` — the ONE
  list both forms read (D220).
- `catsFor(seat)` — moved here from `QualsPage.tsx` (the Quals CAT box imports it back) — one list.
- `interface NewPerson { cs: string; ini: string; seat: string; cat: string }`.
- `newPersonProblem(np): string | null` — every refusal, in the app's words, checked in this order:
  1. callsign/name blank → "Type the callsign or name";
  2. longer than 14 → "A callsign or name is at most 14 characters";
  3. **the PID-01 guard, verbatim:** `nameToId(cs)` resolves to anyone (by callsign OR bare id, archived and the ALL /
     ALL AVAIL placeholders included) → "<cs> is already taken — callsigns must be unique"; if the match is an ARCHIVED
     person → "<cs> is archived — restore them on the Quals page instead" (a clearer way out, same refusal);
  4. initials blank → "Type the initials" (D214 "ill need his initials" — required on both forms; the agent's reading,
     stated on the look card);
  5. seat not one of `SEATS` → "Pick pilot, WSO or personnel";
  6. not personnel and CAT not one of `catsFor(seat)` → "Pick the CAT".
- `putNewPerson(np): string` — the mutation alone (PEOPLE, `deriveQuals`, `ID_BY_CS`), returning the new id. It is only
  ever called INSIDE a command that enlisted the people store, and it RE-CHECKS `newPersonProblem` there and throws on a
  refusal (so the command rolls back — the check and the write are one step, no gap between them).
- `addRosterPerson(np): string | null` — the admin's roster-only add (blank sign-in, D217): `mayManageRoster()` first
  (refused → "Only an admin can add someone"), then `newPersonProblem`, then ONE `person.add` command over the people
  store.

`QualsPage.tsx` loses `addPerson`, `addP`, `showAdd`, the form (`#qCS`, `#qInitials`, `#qFlight`, `#qSeat`, `#qLevel`,
`#qAddPerson`) and its CSS rule where only it used it; the `.qtablehead` keeps its "+ Add person" button (§5.4).

### 3. The commands and who may run them (D200 — `perms.ts` and data-model §11 together)

A new helper in `state/people-settings-commit.ts`: `commitPeopleSettingsIntent(type, meta, fn)` — ONE command that enlists
BOTH the people store and the settings store, runs `fn`, then advances the people baseline (as `commitPeopleEdit` does),
so a person and his account commit or roll back together (the command layer restores every enlisted store on a refusal
or a throw — `command/commit.ts`).

| Command | Writes | Who (COMMAND_OPS) |
|---|---|---|
| `person.add` (new) | people | `Person` C — admin |
| `account.addNew` (new) | people + `accounts` (+ `accessreqs` when that sign-in name had asked — answered, as `account.add` does) | `User` C **and** `Person` C — admin |
| `access.approveNew` (new) | people + `accounts` + `accessreqs` (the request cleared) | `AccessRequest` D **and** `User` C **and** `Person` C — admin |
| `access.seen` (new) | `accessreqs` (`seenBy` only) | `AccessRequest` U — admin |
| `access.request` (changed fields) | `accessreqs` | `AccessRequest` C own — pending, unchanged |

**`CommandOp` gains an optional `more: [table, act][]`**, and `cmdAuthorize` requires the actor to hold every one: a
command that writes three tables names three, so the database's security at the translation step reads one honest list
(D200: "a translation of an agreed list, not a hunt"). Only the new types use it; the existing `access.approve` /
`account.add` (which also write two tables) gain their second table in the same change — a correction, not a new rule
(D201 "the lists").

**§11 changes (edited with `perms.ts`, the drift test holds them together):** `AccessRequest` — Admin **R U D** (was R D),
its note gains "U: which admins have seen it — each admin's bell (D216); the callsign, initials, seat and CAT he typed
are text only — approving with New person makes the `Person` from them, with the admin's corrections, in the same step as
the `User` (D214, D217)". `Person` — note gains "created only on Admin → Users, alone or with its `User` in one step
(D217)". `User` — note gains "created with a new `Person` in one step, or linked to one already on the roster".

`ownershipViolation` needs no change: an admin is not limited there, and a member, a guest or a pending person running
any of the new types is refused at the gate first — and would be rolled back by it anyway (a new `people/<id>` that is
not his own row; an `accessreqs` change that is not his own request).

### 4. The admins' bell (D216) — "seen" per admin

- `unseenRequests()` — the waiting requests whose `seenBy` does not hold the signed-in admin's account id
  (`SESSION.user`); `accessAlert()` = `isAdmin() && unseenRequests() > 0`. A member, a guest, a pending person: never.
- **The bell lights** when `accessAlert()` — added to the Shell's bell condition beside `bellLit()`, `bugAlert()`,
  the OIL question (and its memo deps).
- **The tap, first in order** (a person locked out of the app outranks a bug report or an OIL question — the agent's
  call, on the look card): toast "N waiting for access — opening Admin → Users" (N = every request waiting), then
  `openAdminUsers()` (§5.3) and the Admin page.
- **It goes out once he has opened that list:** `UsersPanel` receives `shown` (true when the Users category is the one
  on screen — on a phone, once he has tapped into it, not while the category list shows "1 waiting for access"); an
  effect, while `shown` and `unseenRequests() > 0`, runs `markRequestsSeen()` — ONE `access.seen` command adding his
  account id to every waiting request's `seenBy`. It never writes when nothing is unseen (so opening the page twice
  writes once). The Admin tab's count and the Users row's "N waiting for access" are unchanged — they count every request
  until it is answered (D204, D216).
- **Each admin's own:** another admin's bell stays lit until HE opens the list (the agent's reading of "he" in D216,
  stated on the look card; with one browser today the admins take turns in it; at the database step it is per person
  as written).
- A request arriving while the list is on screen is marked seen at once (the effect re-runs on the version tick).

### 5. The screens (the approved mock-up is the design of record)

**5.1 The sign-up card (Request access — `AccessScreen.tsx`).** Four fields, each labelled, in this order:
"Displayed callsign/name" (D222) · "Initials" · "Pilot, WSO or personnel" (a select: "Pick…", Pilot, WSO, Personnel
(ground crew) — D220) · "CAT" (a select: "Pick…" then `catsFor(seat)`; hidden for personnel; emptied back to "Pick…" when
the seat changes to one whose list does not hold it). "Request access" refuses with the reason on the card (`#accErr`)
— the same refusals as §2 items 1, 2, 4, 5, 6 **but never the "already taken" check** (a person not yet let in may not
read the roster — §11 `Person` has no Pending read; the admin sees a clash when approving). The Name box goes (D219).
**The waiting screen** reads "You asked for access as **Viper** (JKB · Pilot · CAT C)." (personnel: "(ABC · Personnel)").
The `#accErr` / `#accSend` / `#accOut` ids stay; new ids `#accIni`, `#accSeat`, `#accCat`; `#accFull` goes.

**5.2 Approving (Admin → Users, Waiting for access).** The request's line reads "asked as **Viper** · JKB · Pilot · CAT C ·
26/9 16:01" (the mock-up). **Approve** opens a PERSON choice — two buttons, "On the roster" | "New person" (the mock-up's
segmented pair, `.abtn` / `.abtn.primary` for the one chosen):
- **New person** (the default when the typed callsign is NOT on the roster): the four fields in two columns
  (Callsign/Name · Initials / Pilot, WSO or personnel · CAT), filled from the request, editable; the note "Filled from
  what he gave when he signed up — change anything before you give access."; Role; **"Add person and give access"**
  (`approveRequestNew` → `access.approveNew`).
- **On the roster** (the default when the typed callsign IS someone on the roster — never pre-picked, D204 "a typed
  callsign never claims a puck by itself"): the Callsign/Name picker (today's, relabelled D219), with the note
  "He typed Viper — Viper is on the roster. Pick them if this is them." (or, when the typed callsign matches nobody: no
  note); Role; **"Give access"** (`approveRequest`, unchanged).
- Cancel, as today. Ids: `#apvModeRoster`, `#apvModeNew`, `#apvCs`, `#apvIni`, `#apvSeat`, `#apvCat`, `#apvPid` (kept),
  `#apvRole` (kept), `#apvGo` (kept), `#apvCancel` (kept).

**5.3 Adding (Admin → Users, "Add an account").** Sign-in (defence mail) first; then PERSON — "On the roster" | "New
person" (default "On the roster", since most accounts are for people already on Quals; "New person" when arriving from
Quals' "+ Add person" — §5.4; the bell opens the waiting list only):
- **On the roster:** today's picker (relabelled "Callsign/Name"); Role; **"Add account"** (unchanged; a blank sign-in is
  refused, as today).
- **New person:** the four fields; the note from the mock-up — "Makes his row on Quals and his account together — the one
  place a new person is made. Leave the sign-in blank for someone who won't use the app (a SANS man). Flight and quals are
  set on Quals."; Role **only when a sign-in is typed** (with none there is no account, so no role — the agent's call);
  the button reads **"Add person and account"** with a sign-in, **"Add person"** without (`addPersonAndAccount` →
  `account.addNew`, or `addRosterPerson` → `person.add`).
- On success: toast "Blaze added — nomad2@mail can sign in now" / "Blaze added to the roster — set flight and quals on the
  Quals page"; the form clears back to its default.
- **Opening it from elsewhere** — a view-state intent in `state/view.ts`, `ADMINOPEN: { cat: 'users', newPerson?: true } |
  null`, set by `openAdminUsers({ newPerson })`, consumed ONCE by the Admin page (it selects Users and, on a phone, opens
  it — `drilled`) and by `UsersPanel` (New person chosen, the form scrolled into view, the Callsign/Name box focused on a
  desktop). Registered in `VIEW_RESET` with the `'session'` scope, so a sign-in or sign-out never inherits it.
- Ids: `#accModeRoster`, `#accModeNew`, `#accAddCs`, `#accAddIni`, `#accAddSeat`, `#accAddCat`; `#accAddName`,
  `#accAddPid`, `#accAddRole`, `#accAdd` kept.

**5.4 Quals.** "+ Add person" (`#qAddToggle`, admin only as today) becomes a plain button — no `aria-expanded`, no ✕ Close
— that calls `openAdminUsers({ newPerson: true })` and goes to the Admin page. The column head reads **"Callsign/Name"** in
every seat view (today: "Callsign" except Personnel, which already read "Callsign/Name" — 26 Aug 26). Nothing else on
Quals changes (D217 "Quals keeps everything after that").

**5.5 The account editor** (an account row tapped): its "Callsign" label reads "Callsign/Name" (D219); the picker's first
option "Pick a callsign/name…". Nothing else.

**5.6 Phone.** The two-column field pairs stack to one column under the Admin pane's phone width only if they do not fit
(the mock-up's phone pictures keep two columns at 390px — `.adm-2col` as drawn); the sign-up card is one column (as
drawn). Measured on the walk at 390px and 1440px, and at a short 700px-tall window (bug-check order §7.2).

### 6. The guards (each refusal says why, on screen)

Every existing account guard holds for the new commands (one person one account — trivially, the person is new; one
sign-in name one account; the sign-in normalised to lower case; ≤ 80; a request under that name answered). Plus §2's
person refusals. **Order:** the person's problems and the account's problems are all checked BEFORE the command, and the
first one is said; inside the command `putNewPerson` re-checks the person (§2), so a refusal between the check and the
write rolls back both. A member, a guest, a pending person or an account switched off calling any new function is
refused at the function ("Only an admin can …"), at the command gate, and by the ownership check — three layers, as for
`[ACCOUNTS]`.

### 7. What does NOT change

The accounts list, the account editor (but its label), switch off/on, decline, the guest switch, the sign-in, the
seeded accounts, D223's password box; Quals' own-row editing (D149, D218), archive, restore, Edit quals; the Leave War and
the Tracker (they pick a new person up through their existing projections of the roster — `reprojectRoster`,
`peoplewire.ts` — exactly as they picked up a Quals add; walked, not changed); undo (people and settings commands are not
undoable today — `undo/timeline.ts`; a new person is no more undoable than the Quals add was — `[UNDO-ROSTER-SETTINGS]`
stays filed).

### 8. The documents (D201, D200)

- `docs/data-model.md` §3 `AccessRequest` (fields: `callsign`, `initials`, `seat`, `cat`, `seenBy`; `name` goes; the
  approve-with-New-person sentence) and §11 (`Person`, `User`, `AccessRequest` rows — §3 above).
- `docs/data-schema.md` — the `accessreqs` shape line.
- `docs/engine-rules.md` §Auth / roles — the roles table's "Quals — Add person" row becomes "Admin → Users — add a person
  (alone or with his account)"; the sign-up's fields; the bell.
- `docs/ui-contracts.md` — the three Quals "Add person" passages (lines ~3795, ~3896, ~3939) → the button to Admin →
  Users; §The access screens (the sign-up's four fields, the waiting line); Admin → Users (New person, approve with New
  person); the bell's access trigger and its order.
- `docs/feature-impact.md` — a flow: "a new person" (the one door → PEOPLE → every projection: Quals, the crew lists,
  Inputs, Leave War roster, Tracker + Add, Admin's picker).
- `docs/handover-dataverse.md` — the `AccessRequest` fields line.
- `docs/file-map.md` — `state/roster-add.ts` (+ its test); the walk script.
- The register `docs/superpowers/specs/2026-09-26-accounts-behaviour-register.md` — rows NP1–NP8 (below), and
  `scripts/rulecheck.mjs` RULES in step.
- Code comments that describe the retired form (`QualsPage.tsx` 192, 295, 746–750; `scheduler.css` 1941;
  `engine/slots.ts` 692 "addPerson (QualsPage)"; `leavewar/sync.ts` 1257 quotes "add personnel through quals" — a
  quotation of his 18 Aug words, kept, with a pointer that the door is Admin → Users now).
- `scripts/handpass/trk-w3-09-roster.mjs` drives the old Quals form — moved to the new door.
- `OUTSTANDING.md` `[ACCOUNTS-NEW-PERSON]` — archived at the merge; `HANDOFF.md` this chat's block.

**The register rows (NP1–NP8):**

| Id | The rule | Ruling |
|---|---|---|
| NP1 | A new person is made only on Admin → Users — alone (blank sign-in) or with his account — and the Quals page's "+ Add person" goes there | D217 |
| NP2 | The one add keeps the one callsign rule: a callsign that is anyone's (callsign or id, archived and the placeholders included) is refused, with its reason | D214, PID-01 |
| NP3 | A new person with his account is ONE step: both are made or neither | D214 |
| NP4 | The sign-up asks what the admin's form asks — displayed callsign/name, initials, pilot / WSO / personnel, CAT — each refused with its reason when missing; it never tells a person not yet let in whether a callsign is taken | D214, D222, D204 |
| NP5 | Approving offers New person, filled from the request; a typed callsign already on the roster opens "On the roster" and is never picked for the admin | D214, D204 |
| NP6 | A new request lights each admin's bell until he has had the waiting list on screen; a member's never; the tap goes to Admin → Users | D216 |
| NP7 | The words: "Callsign/Name" (sign-up card: "Displayed callsign/name"); "Pilot", "WSO", "Personnel (ground crew)" | D219, D220, D222 |
| NP8 | Only an admin adds a person, approves or marks requests seen — at the function, the command gate and the ownership check | D200, D217 |

## Roll-call — every place the change reaches (bug-check order §6)

The THING: **a person** (a new one), **an access request**, and **the add/approve forms**. Every place, with its answer
now (the walk fills the "walked" column in the evidence sheet).

| # | Place | Must after the build |
|---|---|---|
| 1 | Sign-up card (Request access), desktop + phone | four fields, D222 label, refusals, no Name box |
| 2 | Waiting screen | the new "asked as" line; D221's button unchanged |
| 3 | Admin tab badge + the Users row's "N waiting" | unchanged count |
| 4 | The bell (desktop + phone) | lights for an unseen request (admin only); tap → Admin → Users; out once the list was on screen |
| 5 | Admin → Users, Waiting: the request line | "asked as Viper · JKB · Pilot · CAT C · when" |
| 6 | Approve — New person | four fields filled; "Add person and give access" |
| 7 | Approve — On the roster | the picker; the note when the callsign matches; never pre-picked |
| 8 | Add — On the roster | unchanged but the label |
| 9 | Add — New person, with a sign-in | person + account, one step |
| 10 | Add — New person, blank sign-in | roster-only person; no Role; "Add person" |
| 11 | The account editor | "Callsign/Name" label only |
| 12 | Quals "+ Add person" (admin) | goes to Admin → Users, New person chosen; absent for a member |
| 13 | Quals column head | "Callsign/Name" in every seat view |
| 14 | Quals table | the new person's row in his seat view (pilot / WSO / personnel), CAT chip, blank flight "-" |
| 15 | The scheduler's crew lists (edit week palette, board's Available crew) | the new aircrew person offered |
| 16 | Inputs (admin files for anyone; the person picker) | the new person offered |
| 17 | Highlight chips / search | the new person found |
| 18 | Leave War roster | the new person drawn in his group, counts right (personnel skipped by manning) |
| 19 | Tracker "+ Add" roster list | the new person listed |
| 20 | Admin → Users "On the roster" picker | a roster-only person (blank sign-in) is linkable later |
| 21 | The new person signs in (after approve / add) | lands as himself — "this is you" puck, his own Inputs, his own Quals row |
| 22 | A reload after each | person, account and request state all kept |
| 23 | Member / guest / pending / switched off | none of the new doors; the gate refuses a hand-made call |
| 24 | Help page, Logic page | nothing — checked by search that neither describes the old form |

**The door check** (every action → its on-screen control, in every state): add a roster-only person (Add → New person,
blank sign-in, "Add person"); add a person with an account ("Add person and account"); approve with a new person ("Add
person and give access"); approve linking someone on the roster ("Give access"); get to the add form from Quals ("+ Add
person"); get to the waiting list from the bell (the bell); request access with the four fields ("Request access").

## Build order (each behaviour red first)

1. `state/roster-add.ts` + `roster-add.test.ts`: `SEATS`, `catsFor`, `newPersonProblem` (every refusal, PID-01's id
   collision, archived, placeholder), `putNewPerson` (re-check inside the command), `addRosterPerson` (admin only).
2. `people-settings-commit.ts` `commitPeopleSettingsIntent`; `perms.ts` `more` + the four new types + the two corrected;
   §11 edited with it (`perms.test.ts` red until both agree).
3. `accounts.ts`: the request's new fields and loader; `requestAccess(np)`; `addPersonAndAccount`; `approveRequestNew`;
   `unseenRequests` / `accessAlert` / `markRequestsSeen`; `ACCOUNT_TYPES` += the four. Tests in `accounts.test.ts`
   (NP3 atomicity: a forced failure of the account half leaves no person; NP8 each role refused at the function and at
   the gate).
4. `state/view.ts` `ADMINOPEN` + `openAdminUsers` (VIEW_RESET 'session').
5. UI: `AccessScreen.tsx`, `UsersPanel.tsx` (the Person choice as one small component used by add and approve; the seen
   effect), `AdminPage.tsx` (consume `ADMINOPEN`; pass `shown`), `Shell.tsx` (the bell), `QualsPage.tsx` (the button,
   the head; the form removed). Tests: `accounts-ui.test.tsx` (NP4–NP7), `quals.test.tsx` (the retired form's tests
   replaced by the button test; the head label).
6. The e2e geometry test for the sign-up card's button (it must still sit square under its boxes with the new fields);
   a new geometry check: the New person field pairs inside the Users pane at 390px (nothing clipped, no sideways scroll).
7. Documents (§8), the register, rulecheck; the Tracker walk script.
8. Gates → the walk → the two code reads (with the evidence sheet) → fixes → re-walk → gates → the sheet → his look.

## The agent's calls, stated to him on the look card (his to correct, not blocking)

1. Initials are required on both forms (his "ill need his initials").
2. Seat and CAT start at "Pick…" on both forms — never a silent default (the robustness doctrine); the old Quals form
   defaulted to Pilot / OCU.
3. Approving: a typed callsign already on the roster opens "On the roster" with a note, not pre-picked (D204).
4. The bell's tap goes to the waiting list before a bug report or an OIL question; each admin's bell is his own.
5. With a blank sign-in the Role box hides (no account, no role).
6. The 14-character limit stays for a name as for a callsign (the puck's width; pucks never wrap).

## Not in this build

- Teams notice to the admins — the database step (D204, D216).
- Undo of adding a person or an account — `[UNDO-ROSTER-SETTINGS]` (unchanged).
- A member editing his own initials/seat after approval — already his on Quals (D149); the seat is the admin's today
  (the Quals seat is not editable for anyone after the add — unchanged; noted on the look card only if the walk shows it
  matters).
