# Plan — `[ACCOUNTS]`: accounts in the app now, shaped as the defence-mail sign-in will be (D165, D166, D200, D202, D204, D210), 26 Sep 26

Builder: Opus 5.5. Reviewers: Fable 5.1 and Astra — both, independently (permissions and saved data). Tier: **FULL**
(roles, saved data; the permissions table the database's security will be built from). Branch `claude/accounts`.
Rulings this chat: D210–D229.

**Status: DRAFT for the red team (round 1).** Nothing is built.

## What he ruled, in one paragraph

Everyone signs in as HIMSELF. The Admin tab creates and manages accounts — a sign-in name (which stands for the defence
mail address), admin or member, and the callsign (the person on the roster) the account belongs to; an admin creates
admins and members (D166 (1)). The sign-in screen stands for the defence-mail sign-in, and at the database step Microsoft
sign-in replaces it with no second sign-in (D166 (2)). **Signing in makes you that callsign; "View as" goes; no "preview
as a member"** (D166 (3)). The Leave War follows the signed-in callsign — a member bids only on his own row (D166 (4)).
Everything that records who did something names the callsign (D166 (5)). A new user joins **either way**: the admin adds
him first, or he signs in, finds he is on no list, asks for access with his callsign and name, and the admin approves,
sets member or admin and links him to a puck — a typed callsign never claims a puck by itself (D204). While waiting he
sees a waiting screen; an admin switch, OFF by default, lets people waiting see the programme read-only as a guest
(D204). And the accounts work carries the permissions work (D200): the Quals own-row rule (D149) is built here; the
permissions table in `docs/data-model.md` §11 is brought up to every ruling; and ONE place in the app answers "may this
person do this?", mirroring that table, with a test that fails when the two disagree. D210: this gets its own FULL check,
before the changes window (`[DRAFT-PENDING]`) is built on top.

## The rules sweep — every ruling that applies (bug-check order §5, the 20 Sep standing order)

| Id | Ruling (date) | What it demands of this build |
|---|---|---|
| D166 (1) | accounts on the Admin tab; admin creates admins and members; merges "Manage users" (25 Sep) | Admin → Users lists ACCOUNTS; the old in-memory `USERS` list is gone |
| D166 (2) | sign-in stands for the defence mail sign-in (25 Sep) | the sign-in name plays the address; production wording, no demo caveat on screen |
| D166 (3) | signing in makes you that callsign; View as goes; no preview as a member (25 Sep) | `#viewAs`, the drawer's View-as chips, `setMe` from the UI, and the admin's role toggle (`#roleBadge` button, `#drawerRole`, `toggleRole`) all go |
| D166 (4) | the Leave War follows the signed-in callsign (25 Sep) | `viewer` mirrors the account's person; nothing else can set it in production |
| D166 (5) | every "who" names the callsign (25 Sep) | `HOOKS.whoami()` returns the signed-in callsign — the edit log, the pending list, the Tracker's `by` stamps |
| D104 | who by callsign only at the database; until then the shared account (25 Sep) | **REPLACED by D166 (5)** — marked and archived in this change, its stale text fixed (D201) |
| D204 | both ways in; waiting screen; guest switch off by default (26 Sep) | the request-access screen, the waiting screen, the Admin tab's badge and approve/decline, the guest switch |
| D165 | the admin maps each person to a defence mail; IT ties the real address at the database (25 Sep) | the account's sign-in name is that mapping, in the shape the database will keep (`data-model.md` §3 `User`) |
| D200 | accounts carries: D149 built; §11 brought up to date; one permissions module + drift test (26 Sep) | `state/perms.ts` + `perms.test.ts`; §11 rewritten |
| D149 | Quals: a member edits his OWN row only, every column (24 Sep) | own-row gate at the page AND the write path; a test per column |
| D169 | members read the change history (medical details hidden) (25 Sep) | §11 `EditLog`: member R — the window itself is `[DRAFT-PENDING]` |
| D79, D82 | an OIL award by hand, any day; award + worked day add up (20–21 Sep) | §11: awards written by admins only, who gave each and when kept — see Q-A below |
| D202 | every bug check asks the server question until the drift test carries it (26 Sep) | when the drift test lands, the bug-check order §5 paragraph points at it and D202 is marked spent |
| D201 | a new ruling fixes what the old one left: documents, app, lists (26 Sep) | D104, the 27 Aug role toggle, the "View as" wording across the docs |
| 5 Aug 26 | a member edits his own record, not the squadron's programme (engine-rules §Auth / roles) | unchanged, now keyed to the account's person |
| 27 Aug 26 | a member edits/deletes only his own inputs; views any attachment | unchanged, keyed to the account's person |
| 27 Aug 26 | the admin's role toggle — "View as member" / "Back to admin" | **removed by D166 (3)** ("There isint a need for preview as a member") — the agent's reading, stated to him |
| 27 Aug 26 | Leave War: member bids own row only (`canEditRow`); stage advance and decisions admin-only | unchanged; `viewer` now comes from the account |
| 24 Aug 26 | sign-in names `ad`/`a`, `us`/`us`; the credentials hint not printed on the sign-in card | kept as SEEDED demo accounts (not hard-coded); the hint stays off the card |
| 23 Aug 26 | Manage users lives on the Admin tab, last; the PAGE is the gate (`#admDeny`) | the accounts UI is the Users panel; `#admDeny` stays |
| 6 Aug 26 | role checks at the page and the write path, never only the nav | every new write refuses at its function, not only by hiding the button |
| 25 Aug 26 | UI copy reads production — no "demo" caveats on screen | the prototype truths live in code comments and the handoff |
| 7 Aug 26 | invariants: login page stays simple; talon logo stays | the sign-in card is unchanged; the new screens are siblings of it, in its style |
| D121 | the Tracker reads no role; everyone does everything | unchanged — only its `by` stamp changes, through `whoami` |
| D129 | Logout asks about unsaved Tracker chart edits | unchanged — every sign-out path (incl. the new screens' "Sign out") goes through `ui/logout.ts` |
| D66 | the ALL AVAIL window closes on logout | unchanged — `resetSession` |
| 13 Sep 26 + D148 | undo is per login session; logout clears it; undo reverses only your own changes (D148 — to build with change-recording) | sign-in / sign-out still end the undo history; D148 itself is NOT built here |
| D58 | no unit designation anywhere | the new screens carry none |
| D56 / D54 | demo data is wiped before the database | no migration of any old session or `USERS` list; the seeded accounts are demo data |
| data-model §3 `User` | "no password is ever stored in this model" | admin-added accounts carry NO password (see §The sign-in) |
| handover non-negotiables | one identity (a person by id, never a callsign as a key); medical restricted | an account points at the person's id; callsign renames move nothing |

**Clashes found:** (1) D104 vs D166 (5) — D166 is later and names the change; D104 is replaced (above). (2) The 27 Aug 26
role toggle vs D166 (3) — the toggle IS a preview as a member (its label reads "View as member"); D166 wins. Both are
stated to him in the report.

## The design

### 1. The records (the Shell's `User` table, as today's app can hold it)

New module `src/state/accounts.ts` (ordinary TS). Three records, persisted as three new durable settings keys through the
existing settings seam (`store.set` → the settings command store → the whiteboard), so they survive a reload and ride the
one command layer (the "new modules follow the command layer" rule):

- **`accounts`** — `Account = { id, name, role: 'admin' | 'main', pid, on, pass? }`. `id` an opaque stable id (`ac…`),
  `name` the sign-in name (unique, compared lower-case; stands for the defence mail address), `pid` the PEOPLE id it
  belongs to (unique across accounts — one person, one account), `on` switched on/off (D204 "switches the account off";
  `data-model` §10: `enabled = false` is the exit — never deleted), `pass` ONLY on the seeded demo accounts (below).
- **`accessreqs`** — `AccessRequest = { id, name, cs, full, at }`: the sign-in name that asked, the callsign and name he
  typed (text only — never a link to a puck), when.
- **`guestview`** — `boolean`, default `false` (D204).

`SETTINGS_KEYS` gains the three; a loader `accountsLoad()` joins `SETTINGS_LOADERS` so a rollback re-derives them. The
"11 durable settings keys" wording in the docs becomes 14.

**Seeds** (demo data, D56): the two sign-ins everyone already uses stay, as ordinary accounts in the list — no longer
hard-coded — plus the two admins and two members the old Manage-users list showed. (Which person each seed belongs to is
settled by the test blast radius — see §The seeds.)

### 2. The sign-in (it stands for Microsoft's)

The sign-in card is unchanged (the 7 Aug "login page stays simple"). What happens on Sign in:

| What was typed | Today | New |
|---|---|---|
| a sign-in name on the list, account ON, right password | in, as admin or member | in, AS THAT PERSON, with the account's role |
| same, wrong password | "Incorrect username or password." | same |
| a name on the list, account OFF | — | the **switched-off** screen: "Your access has been switched off. Ask an admin." · Sign out |
| a name on NO list, any non-empty password | "Incorrect…" | the **request-access** screen (Microsoft would have let him in; the app does not know him) |
| a name that has asked already | — | the **waiting** screen — or, with the guest switch ON, the programme read-only as a GUEST |
| empty name or empty password | "Incorrect…" | same |

**Passwords.** An account the admin adds has NO password (`data-model.md` §3: the app never stores one; the
organisation's sign-in checks it). So in the prototype the password box stands for that check: any non-empty password
passes for an admin-added account, and for a name on no list (which then lands on request access). The two seeded
sign-ins keep their old passwords (`ad`/`a`, `us`/`us` — the 24 Aug 26 names, a wrong one still refused, pinned today by
`session.test.ts`). Said in a code comment and on his look card, never on screen.

### 3. The session

`resetSession(s)` stays the ONE session-change path. A signed-in session is `{ user: <account id>, role, pid }`; ME (the
"View as" binding) becomes **the signed-in person**, set ONLY by `resetSession` from the account — `setMe` loses every UI
caller. `LOGINROLE`, `canToggleRole`, `setEffectiveRole`'s UI use and `toggleRole` are removed (the probe bridge keeps a
localhost-only role switch for the e2e suite and the walk, §7.7 of the bug-check order — it changes the role in place,
never the world).

A **guest** session (D204, switch ON, request pending) is `{ user: 'guest', role: 'guest', pid: null, name }`: ME = null;
`canEditSched()` false; the Leave War `viewer` = a sentinel that matches no row (`''`), never `null` (null means
"unscoped" to the war's `canEditRow`, which would let a member-role write touch any row).

The **access screens** (request, waiting, switched off) are not a session: `App.tsx` renders them from a small
`ACCESS` state (`{ name, state }`) the sign-in sets, and every one of them has Sign out (through `ui/logout.ts`).

### 4. One place answers "may this person do this?" (D200 (3))

New module `src/state/perms.ts`:

- **The matrix** — one row per table of `data-model.md` §11, admin and member columns as C/R/U/D letters and the own-row
  rule, written as data (`PERMS`), plus `guest` (read the programme only). This is what the drift test compares.
- **The questions** every gate asks, each one body: `isAdmin()`, `me()`, `mayEditSched()` (today's `canEditSched`, which
  stays as a re-export so ~100 call sites do not move), `mayEditInputOf(pid)`, `mayFileInputFor(pid)`,
  `mayEditQualsOf(pid)` (D149), `mayManageRoster()` (add / archive / restore a person), `mayManageAccounts()`,
  `mayBidFor(pid)` (the war's own `canEditRow` stays in the war's engine — the war is a second app — and the test proves
  the two agree), `mayDecideBids()`, `mayAwardOil()`.
- **The existing scattered checks are routed through it**: the member-own input checks (`inputedit.tsx` ×2,
  `caldrag.ts`, `DocViewer.tsx`, `InputsPage.tsx`, `InputsCal.tsx`), the Quals gates (new), the roster writers
  (`QualsPage` archive, `restoreArchivedPerson`), the Admin page, the Leave War's `inputgate.ts` "own" check. A gate that
  reads `r.person !== ME` directly after this change is a finding.
- **The drift test** `perms.test.ts` reads `docs/data-model.md` §11 from disk, parses the table, and fails when a row or
  a letter differs from `PERMS` — and walks each question against `PERMS` for admin, member (own / other) and guest. When
  it lands, the bug-check order §5's server question points at it and D202 is marked spent (D202's own words).

### 5. The Quals own-row rule (D149)

A member with editing on edits every column of HIS row — callsign, CAT, SXO, SCHEDULER, SANS, every qualification — and
no other row: other rows render read-only for him (no tick boxes, no inputs), and every Quals write function refuses a
member writing someone else's row (`mayEditQualsOf`). `Edit quals` (the LoX columns), Add person, archive and restore
stay admin-only (unchanged). One test per column, member-own passes and member-other refuses, at the write path; a
render test for the page.

### 6. The screens

- **Top bar:** `#viewAs` goes. `#roleBadge` becomes an inert label naming the person and role ("Ranger · Admin"); hidden
  on a phone as today.
- **Drawer (phone):** the View-as chips go; the Account row reads "Signed in as Ranger · Admin" above Logout; the role
  toggle goes.
- **Admin tab:** a count badge on the tab (top nav and drawer) while access requests wait — admins only (D204 "a badge
  on the Admin tab").
- **Admin → Users** (replaces Manage users): (a) **Waiting for access** — each request: sign-in name, the callsign and
  name typed, when; **Approve** opens a small form: the puck (a picker over the roster — people with no account, not
  archived, not the ALL / ALL AVAIL placeholders; the typed callsign is shown as a hint, never pre-linked) and member /
  admin; **Decline** removes it. "Not on the roster? Add them on the Quals page first." (b) **Accounts** — one row each:
  sign-in name, the person's callsign (live — a rename moves nothing), role, on/off; tap to edit role, puck, sign-in
  name, or switch off / on. (c) **Add an account** — sign-in name, puck, role. (d) **Guest view** — "Let people waiting
  for access view the schedule (read only)", off.
- **The access screens** — siblings of the sign-in card, same look: request access (callsign, name, Request access,
  Sign out); waiting ("Your request is with the admins…", Sign out); switched off (Sign out).
- **Guest:** the shell with only View-only Sched (and its week picker), a thin banner "Waiting for access — view only",
  and Sign out. Every other page clamps to View-only Sched at the one page-change path (`setPage`) and at render.

### 7. Guards (the refusals, each with its reason on screen)

- **Never lock the squadron out:** at least one account that is ON and admin must remain — switching off, demoting or
  relinking is refused when it would leave none ("At least one admin must keep access").
- **Not your own account:** an admin cannot switch off or demote the account he is signed in with ("Ask another admin").
- **One person, one account; one sign-in name, one account** (case-insensitive).
- **A puck that is archived** keeps its account working (posting out archives a person AUTOMATICALLY — `leavewar/sync.ts
  runPoArchive` — so refusing sign-in would lock out whoever it catches); the Accounts list marks it "archived callsign"
  so the admin can switch it off.
- **A change to someone else's account** takes effect at his next sign-in (only one person is signed in on a browser).

### 8. "Who" names the callsign (D166 (5))

`HOOKS.whoami()` returns the signed-in person's callsign (the guest: "Guest"). The edit log keeps its string `who` and
gains `pid` beside it, so the changes window (`[DRAFT-PENDING]`) can draw a renamed callsign live. The command actor's
`personId` (already read from ME) is now the real person. The Tracker's `by` stamps follow `whoami` with no Tracker change.

### 9. The documents (D201, D200 (2))

`data-model.md` §3 `User` (personId required — D166; `enabled`; the request record; no password) and §11 (every ruling:
the member's own `Person` row every column — D149; `EditLog` member R, medical details excepted — D169; `User` tied to a
person — D166; OIL awards admin-only with who and when — D79/D82; guest read of the programme — D204; `AccessRequest`);
`engine-rules.md` §Auth / roles; `ui-contracts.md` (the top bar, the drawer, the Admin page, the new screens);
`feature-impact.md` (the accounts surfaces, the identity seam); `data-schema.md` (the three settings keys);
`handover-dataverse.md` (View as retired in the app now; the join flow); `architecture-direction.md` (the guest line
built); `raptor-port/CLAUDE.md` (the login line, the Leave War row, the 11→14 keys); `leave-war.md` §Architecture and
`stages.ts` comments ("the identity IS the View-as selection"); `HANDOFF.md` §Standing constraints ("Prototype auth");
`file-map.md`; the bug-check order §5 (the server question → the drift test).

## Questions this plan answers itself, stated so the reviewers can attack them

- **Q-A. OIL awards "who gave each and when kept" (D200 (2) citing D79/D82):** checked — a hand-typed award is written
  only by an admin today (`leavewar/state/store.ts setManualCredit`, `grantTo`: "Only an admin can enter OIL"), and it
  keeps its date and an optional "Given by" the admin types (`givenBy` — on whose say-so, a name or a post; owner, 20 Sep
  26). No new field is added: at the database the platform's own created-by / created-on columns keep which admin entered
  it and when (`data-model.md` §2), and §11 says so. The permissions module's `mayAwardOil()` mirrors the store's check
  and the drift test pins that the two agree.
- **Q-B. Seeds and the tests:** see §Roll-call.
- **Q-C. Why not refuse sign-in to an archived callsign:** the automatic posting-out pass (§7).
- **Q-D. Why the settings seam and not a new storage collection:** `User` is a Shell table like `Setting`; three keys on
  the existing seam ride the command layer and the whiteboard with no change to the storage contract, and the database
  step maps them to the `User` table in the one adapter.

## Not in this build (filed or ruled elsewhere)

- The changes window, "new to you", per-person hand-over (`[DRAFT-PENDING]`, D167–D172) — built on top of this.
- D148 per-person undo (with change-recording, `[HUMAN-RETEST]`).
- A Teams message on a new request (D204 — at the database step).
- Microsoft sign-in itself, the real address, the environment's access group (D165 — IT).
- Server-side enforcement (the database step; the drift test keeps the table it is built from honest).

## The seeds, and why (Q-B)

The test suites sign in as `ad` (6 e2e files, 122 geometry logins, the Tracker smoke, the probes, 26 hand-pass scripts)
and `us` (3 e2e files — the whole Leave War spec runs as `us`, 177 tests). Today BOTH are "View as" `bane` (Ranger) after
signing in, and the Leave War's `viewer` re-mirrors that on every Raptor change. One person may hold one account, so they
cannot both stay Ranger. **`us` → `bane` (Ranger, member)** keeps every member-side test exactly as it is today (the
member's own inputs, own row, the viewer re-mirror). **`ad` → `stiff` (Saber, admin)** — an admin's identity moves only
display: his purple puck, his OIL bell, his default Person on the Inputs add form, the war's "your numbers". Two more
seeds from the old Manage-users list, with no password: `torch` → `ignite` (Torch, member), `outlaw` → `casper` (Outlaw,
member). No seeded access request (a badge on the first boot would move the top-bar geometry the e2e suite measures).

`resetSession(s)` sets ME from `s.pid`; a call without `pid` (125 unit-test files use `setSession` directly, 14 use
`resetSession` with a bare `{ user, role }`) keeps the module default `bane` — the headless/test person, documented as
exactly that. Production always passes `pid` (the sign-in resolves the account first).

## The probe bridge (localhost only, for the e2e suite and the walk)

`raptorRole(r)` stays (it changes the role in place). New `raptorMe(pid)` changes the person in place — it replaces the
one e2e step that drove `#viewAs` (`step4-leavewar.spec.ts:320`). Neither exists on a deployed site.

## Roll-call — every place the app reads "who is signed in" (bug-check order §6)

The THING: the signed-in identity (the person and the role). Columns: after the build, what it must do · how it is
proved (test / walk) · state today.

| # | Surface / reader | Must, after the build | Proved by | Today |
|---|---|---|---|---|
| 1 | Top bar `#viewAs` | MUST NOT exist (D166 (3)) | unit + walk (desktop) | a person picker, members too |
| 2 | Drawer `#drawerViewAs` chips | MUST NOT exist | unit + walk (phone) | chips, members too |
| 3 | Top bar `#roleBadge` | inert "Callsign · Admin/Member" | unit + walk | admin toggle button |
| 4 | Drawer `#drawerRole` | MUST NOT exist; Account row reads "Signed in as …" | unit + walk (phone) | toggle |
| 5 | Inputs page — filter default, admin's Person default, `#inPersonFixed`, row ✎ ✕ OIL | the account's person | unit + walk | ME |
| 6 | Inputs calendar `openAdd` | seeds the account's person | unit | ME |
| 7 | `commitNewInput` / `commitInputEdit` / `removeInput` / `setInpField` / `setLeaveRemarks` | refuse through `perms` (member own, guest none) | unit (red first for guest) | `r.person !== ME` |
| 8 | Inputs calendar chip move (`caldrag`) | through `perms` | unit | ME |
| 9 | Document viewer — Upchit / Edit input | through `perms` | unit + walk | ME |
| 10 | Leave War `viewer` (sync mirror) | the account's person; guest `''`; never null for a session | unit | ME, null possible |
| 11 | Leave War "Viewing as" badge (Chrome) | names the signed-in person; no "use View as" wording | walk | stale words |
| 12 | Leave War counter sheet "VIEWING AS … your numbers" | own numbers; no "view a callsign" wording | walk | stale words |
| 13 | Leave War own-row tint, own actions, "OK, seen", remarks | own row | e2e (existing) + walk | ME via viewer |
| 14 | Leave War `approvedBy` on a grant | the admin's own callsign | unit | the View-as callsign |
| 15 | `inputgate.ts` replaced-bid "own" | the account role and person | unit | `LOGINROLE` |
| 16 | The bell's OIL question | the account's own | walk | ME |
| 17 | The purple "this is you" puck | the account's own puck | walk (board + week) | ME |
| 18 | Command actor / undo `mayReverse` | account id + own person; a member undoes only his own | unit | shared `us` id |
| 19 | `HOOKS.whoami` → edit log, History bubble, pending list, bug reports, Tracker `by` | the callsign | unit + walk | "Admin" / "Squadron member" |
| 20 | Help page "Your reports" | by his own callsign | unit | shared label |
| 21 | Unpublish `by` | the person | unit | ME or `us` |
| 22 | Sign-off boxes (four) | unchanged names; the write refused for a non-admin | unit (red first) | no write-path check |
| 23 | Admin tab (nav, drawer, page `#admDeny`) | admin only; badge while requests wait | unit + walk | admin only |
| 24 | Admin → Users | accounts, requests, add, edit, guest switch | unit + walk | the dead `USERS` list |
| 25 | Sign-in card | account lookup; the access screens | unit + walk | `ACCOUNTS` constant |
| 26 | `App.tsx` | Login · access screen · guest shell · Shell | unit | Login · Shell |
| 27 | Quals page | member: own row every column, others read-only; write refused | unit per column + walk | any row |
| 28 | Quals archive / add / restore / Edit quals | admin, through `perms` | unit | admin |
| 29 | Logic page edits | admin (unchanged) | existing | admin |
| 30 | Edit Schedule, the board's edit mode, the four template sheets | admin (unchanged); their "toggle peek" comments corrected | existing + walk | admin |
| 31 | View-only Sched | everyone, guest included (read only) | walk | everyone |
| 32 | Tracker | no role; `by` from `whoami` | smoke (existing) | no role |
| 33 | Guest: every page but View-only Sched | clamped at `setPage` and at render | unit (red first) | n/a |
| 34 | Probe bridge `raptorRole` / `raptorMe` | localhost only | unit | `raptorRole` |

**Doors** (every action, the control that does it): sign in (the card); sign out (top bar Logout, drawer Logout, each
access screen, the guest banner — all through `ui/logout.ts`); request access (the request screen); approve / decline
(Admin → Users); add an account; change role, puck, sign-in name; switch off / on; the guest switch.

**Orders to walk:** request → approve → sign in; request → decline → sign in → request again; admin adds an account
for a name that has a request waiting (the request clears); switch off → sign in (switched-off screen) → switch on → in;
demote / switch off the last admin (refused); switch off oneself (refused); relink a puck → next sign-in is the new
person; rename the callsign on Quals → the account list and "who" follow; the Leave War posts a man out (archived) →
his account still signs in and the list marks it; guest switch on → a waiting person sees View-only Sched only →
switch off → next sign-in shows the waiting screen; reload after each (the three records persist; the session does not
— a reload lands on the sign-in, as today). Member walks: own Quals row every column / another row refused; own input
/ another's refused; own war row / another's refused; undo of own change / another's refused.

## Build order (each step red first where a behaviour changes)

1. `perms.ts` + §11 rewritten + the drift test (red first: the test fails on today's §11).
2. `accounts.ts` + the three settings keys + seeds; sign-in resolution (`signIn`), unit-tested headless.
3. The session: `resetSession` takes the account; the toggle, `#viewAs`, the drawer chips removed; `whoami`; the actor;
   the Leave War viewer; `inputgate` off `LOGINROLE`; the probe `raptorMe`; the e2e step and the tests that drove the
   toggle rewritten to what the ruling now says (never weakened — a test that pinned the toggle is REPLACED by one that
   pins its absence).
4. The access screens + `App.tsx`; the guest shell and page clamp.
5. Admin → Users; the badge.
6. D149 on the Quals page (a test per column).
7. The scattered own-checks routed through `perms`; the sign-off write gate.
8. The documents (§9 of this plan); `rulecheck` gains the accounts register's ids (`AC1`…); the file map.
9. Gates → the walk (roll-call-driven, both widths, pictures) → gates → Fable and Astra read the final code with the
   evidence sheet → fix → re-walk → gates → his look card.

## Questions for him that this build does NOT answer (filed, not blocking)

- **The sign-off boxes with personal accounts:** today an admin picks all four names. Should each of the four sign as
  himself, signed in, instead? (A product change; filed as `[SIGNOFF-SELF]`.)
- **The edit history is cleared at every sign-in** (session-only, as today). With personal accounts, should it outlive a
  sign-out? Belongs to the changes window (`[DRAFT-PENDING]`, D168–D170), noted there.
