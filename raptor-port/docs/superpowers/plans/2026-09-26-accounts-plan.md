# Plan — `[ACCOUNTS]`: accounts in the app now, shaped as the defence-mail sign-in will be (D165, D166, D200, D202, D204, D210), 26 Sep 26

Builder: Opus 5.5. Reviewers: Fable 5.1 and Astra — both, independently (permissions and saved data). Tier: **FULL**
(roles, saved data; the permissions table the database's security will be built from). Branch `claude/accounts`.
Rulings this chat: D210–D229.

**Status: REVISED after red-team round 2 (Fable: APPROVE with its findings 1–3 written into §4.3; Astra: BLOCK, on the
same three plus medical visibility, which he then ruled — D211).** Nothing is built. Every report is kept verbatim
(`docs/superpowers/specs/2026-09-26-accounts-redteam-r{1,2}-{fable,astra}.md`) and every finding is dispositioned in
§Round 1 and §Round 2 at the end.

## What he ruled, in one paragraph

Everyone signs in as HIMSELF. The Admin tab creates and manages accounts — a sign-in name (which stands for the defence
mail address), admin or member, and the callsign (the person on the roster) the account belongs to; an admin creates
admins and members (D166 (1)). The sign-in screen stands for the defence-mail sign-in, and at the database step Microsoft
sign-in replaces it with no second sign-in (D166 (2)); **the app never sees or keeps a password — Microsoft checks it and
tells the app who signed in** (told to him 26 Sep 26, when he asked). **Signing in makes you that callsign; "View as"
goes; no "preview as a member"** (D166 (3)). The Leave War follows the signed-in callsign — a member bids only on his own
row (D166 (4)). Everything that records who did something names the callsign (D166 (5)). A new user joins **either way**:
the admin adds him first, or he signs in, finds he is on no list, asks for access with his callsign and name, and the
admin approves, sets member or admin and links him to a puck — a typed callsign never claims a puck by itself (D204).
While waiting he sees a waiting screen; an admin switch, OFF by default, lets people waiting see the programme read-only
as a guest (D204). And the accounts work carries the permissions work (D200): the Quals own-row rule (D149) is built
here; the permissions table in `docs/data-model.md` §11 is brought up to every ruling; and ONE place in the app answers
"may this person do this?", mirroring that table, with a test that fails when the two disagree. D210: this gets its own
FULL check, before the changes window (`[DRAFT-PENDING]`) is built on top.

## The rules sweep — every ruling that applies (bug-check order §5, the 20 Sep standing order)

| Id | Ruling (date) | What it demands of this build |
|---|---|---|
| D166 (1) | accounts on the Admin tab; admin creates admins and members; merges "Manage users" (25 Sep) | Admin → Users lists the accounts; the dead `USERS` list goes |
| D166 (2) | sign-in stands for the defence mail sign-in (25 Sep) | the sign-in name plays the address; no password is stored anywhere (§2); production wording |
| D166 (3) | signing in makes you that callsign; View as goes; no preview as a member (25 Sep) | `#viewAs`, the drawer's View-as chips, and the admin's role toggle (`#roleBadge` button, `#drawerRole`, `toggleRole`, `LOGINROLE`, `canToggleRole`) all go |
| D166 (4) | the Leave War follows the signed-in callsign (25 Sep) | `viewer` = the account's person; never null for a signed-in session |
| D166 (5) | every "who" names the callsign (25 Sep) | `HOOKS.whoami()` = the signed-in callsign; records that store a "who" also keep the person's id (§8) |
| D104 | who by callsign only at the database; until then the shared account (25 Sep) | **REPLACED by D166 (5)** — marked and archived in this change, its stale text fixed (D201) |
| D204 | both ways in; waiting screen; guest switch off by default (26 Sep) | the request-access, waiting and switched-off screens; the Admin tab's badge, approve/decline; the guest switch; a walled-off guest view |
| D165 | the admin maps each person to a defence mail; IT ties the real address at the database (25 Sep) | the account's sign-in name is that mapping, in the shape `data-model.md` §3 `User` keeps |
| D200 | accounts carries: D149 built; §11 brought up to date; one permissions module + drift test (26 Sep) | `state/perms.ts` + `perms.test.ts` + the source scan; §3 and §11 rewritten |
| D149 | Quals: a member edits his OWN row only, every column (24 Sep) | one Quals write function, checked BEFORE any change; a test per column |
| D169 | members read the change history (25 Sep); its medical limit narrowed by D211 | §11 `EditLog`: member R, medical detail included (D211) — built with `[DRAFT-PENDING]`; a known, listed gap here |
| D79, D82 | an OIL award by hand, any day; award + worked day add up (20–21 Sep) | §11: awards admin-only; "who entered it and when" is a requirement filed on `[OIL-AWARD-IS-A-GRANT]` (§Q-A) |
| D203 | the order to the database: the OIL award fix with the readiness batch, done once (26 Sep) | the award's record shape is NOT changed here |
| D202 | every bug check asks the server question until the drift test carries it (26 Sep) | when the drift test lands, the bug-check order §5 paragraph points at it and D202 is marked spent |
| D201 | a new ruling fixes what the old one left: documents, app, lists (26 Sep) | D104, the 27 Aug role toggle, the "View as" wording across docs, code comments and test names (§9) |
| 16 Sep 26 | roster and settings edits are undoable (`[UNDO-ROSTER-SETTINGS]`, not yet built) | account edits are NOT undoable in this build (settings are not cut over); the filed item gains the accounts note (§7) |
| 13 Sep 26 + D148 | undo is per login session; the list clears on sign-out; undo reverses only your own changes | sign-in and sign-out now really end the undo list (§3 — it did not); D148's "own changes only" rides `mayReverse` with a real person |
| 10 Sep 26 (handover non-negotiables) | one identity by id, never a callsign as a key; (medical restricted — **set aside by D211**) | every stored "who" keeps the person's id |
| D211 | "Keep as today": every member sees a medical input's type, remarks and documents (26 Sep) | members unchanged; the guest (not a member) sees no medical detail — the agent's reading on the look card |
| 27 Aug 26 | "anyone may VIEW any attachment" (engine-rules §Auth / roles) | **re-confirmed by D211** for every member |
| 5 Aug 26 | a member edits his own record, not the squadron's programme | unchanged, now keyed to the account's person |
| 27 Aug 26 | a member edits/deletes only his own inputs | unchanged, keyed to the account's person, through `perms` |
| 27 Aug 26 | the admin's role toggle — "View as member" / "Back to admin" | **removed by D166 (3)** ("There isint a need for preview as a member") — the agent's reading, on the look card |
| 27 Aug 26 | Leave War: member bids own row only; stage advance and decisions admin-only | unchanged; `viewer` now comes from the account |
| 24 Aug 26 | sign-in names `ad`/`a`, `us`/`us`; the credentials hint not printed on the card | kept as SEEDED demo accounts; their two passwords live in code only (§2); the hint stays off the card |
| 23 Aug 26 | Manage users lives on the Admin tab, last; the PAGE is the gate (`#admDeny`) | the accounts UI is the Users panel; `#admDeny` stays |
| 6 Aug 26 | role checks at the page and the write path, never only the nav | every new write refuses at its function AND at the command gate |
| 25 Aug 26 | UI copy reads production — no "demo" caveats on screen | the prototype truths live in code comments and the handoff |
| 7 Aug 26 | invariants: login page stays simple; talon logo stays | the sign-in card is unchanged; the new screens are siblings of it, in its style |
| D121 | the Tracker reads no role; everyone does everything | unchanged — only its `by` stamp changes, through `whoami` |
| D129 | Logout asks about unsaved Tracker chart edits | unchanged — every sign-out path goes through `ui/logout.ts` |
| D66 | the ALL AVAIL window closes on logout | unchanged — and every other open window now closes too (§3) |
| D58 | no unit designation anywhere | the new screens carry none |
| D56 / D54 | demo data is wiped before the database | no migration of any old session or `USERS` list; the seeds are demo data |
| data-model §3 `User` | "no password is ever stored in this model" | NO password is persisted — not even the two seeds' (§2) |

**Clashes found, each named to him:** (1) D104 vs D166 (5) — D166 is later; D104 is replaced. (2) The 27 Aug 26 role
toggle vs D166 (3) — the toggle IS a preview as a member (its label reads "View as member"); D166 wins. (3) The 27 Aug 26
"anyone may view any attachment" vs the 10 Sep 26 database non-negotiable and D169's reading (a medical input's details
for the person and admins only) — **put to him the same day and RULED, D211: "Keep as today"** — every member sees it all;
the database brief and D169's row are amended; the guest (not a member) gets no medical detail.

## The design

### 1. The records (the Shell's `User` table, as today's app can hold it)

New module `src/state/accounts.ts` (ordinary TS). Three records, persisted as three new durable settings keys through the
existing settings seam (`store.set` → the settings command store → the whiteboard), so they survive a reload and ride the
one command layer (the "new modules follow the command layer" rule):

- **`accounts`** — `Account = { id, name, role: 'admin' | 'main', pid, on }`. `id` opaque and stable (`ac…`), `name` the
  sign-in name (unique, compared lower-case; stands for the defence mail address), `pid` the PEOPLE id it belongs to
  (required — D166; unique across accounts — one person, one account), `on` switched on/off (D204; `data-model` §10:
  `enabled = false` is the exit — never deleted). **No password field** (§2).
- **`accessreqs`** — `AccessRequest = { id, name, cs, full, at }`: the sign-in name that asked (the signed-in principal,
  taken from the session — never a typed field), the callsign and name he typed (text only — never a link to a puck),
  when.
- **`guestview`** — `boolean`, default `false` (D204).

`SETTINGS_KEYS` gains the three; a loader `accountsLoad()` joins `SETTINGS_LOADERS` so a rollback re-derives them, and
`initStore` calls it at boot beside the others. **The loader never writes** (it runs inside every settings rollback):
when a key is null the seeds are the in-memory default, and the first admin edit writes the list. An unreadable or
invalid stored value is cleaned entry by entry (bad entries dropped); **if what remains has no enabled admin whose
person exists, the seed admin `ad` is ADDED to the cleaned list** (its name and person when free) — the prototype's way
back from a lock-out, keeping every real account (Fable R2-6), stated in a code comment (at the database step there are
no seeds: the environment's own admin restores access). Test: a stored list of two members and no admin loads as those
two plus `ad`. The "11 durable settings keys"
wording in the docs becomes 14.

**Seeds** (demo data, D56), as ordinary accounts (no longer hard-coded):
| sign-in | person | role |
|---|---|---|
| `ad` | `stiff` (Saber) | admin |
| `us` | `bane` (Ranger) | member |
| `outlaw` | `casper` (Outlaw) | member |
| `hex` | `rocky` (Hex) | member |

Why these (Q-B): the suites sign in as `ad` (6 e2e files, the Tracker smoke, the probes, 26 hand-pass scripts) and `us`
(the whole Leave War spec, 177 tests). Today both are "View as" Ranger after signing in, and the war's `viewer`
re-mirrors that on every Raptor change; one person may hold one account, so they cannot both stay Ranger. `us` → Ranger
keeps every member-side test as it is; `ad` → Saber moves only display for the admin (his purple puck, his OIL bell, his
default Person on the Inputs add form, the war's "your numbers"). `outlaw` and `hex` are members who are NOT posted out in
the demo world (`ignite` is — `leavewar/state/demoworld.ts`), so the list opens clean. No seeded access request (a badge
on first boot would move top-bar geometry the e2e suite measures). Removing the ~60-option `#viewAs` select and widening
the badge DOES move top-bar geometry: those e2e expectations are re-measured and re-baselined with the reason, never
loosened.

### 2. The sign-in (it stands for Microsoft's)

The sign-in card is unchanged (the 7 Aug "login page stays simple"). What happens on Sign in:

| What was typed | Today | New |
|---|---|---|
| a sign-in name on the list, account ON (+ for `ad`/`us`, their password) | in, as admin or member | in, AS THAT PERSON, with the account's role |
| `ad` or `us` with a wrong password | "Incorrect username or password." | same |
| a name on the list, account OFF | — | the **switched-off** screen: "Your access has been switched off. Ask an admin." · Sign out |
| a name on NO list, any non-empty password | "Incorrect…" | the **request-access** screen (Microsoft would have let him in; the app does not know him) |
| a name that has asked already | — | the **waiting** screen — or, with the guest switch ON, the programme read-only as a GUEST |
| empty name or empty password | "Incorrect…" | same |

**Passwords — none stored (data-model §3; Astra R1-7).** The two seeds' old passwords (`a`, `us` — the 24 Aug 26 names; a
wrong one still refused, as `session.test.ts` pins today) live in a code-only constant in `accounts.ts` keyed by the seed
account's id — never in the `accounts` record, a snapshot, a command envelope or an export (a raw-storage test proves
it). Every other account takes any non-empty password, and the app keeps none of it: the box stands for Microsoft's
check. **The consequence, stated to him and on his look card:** in the app today, anyone who knows an added account's
sign-in name can sign in as it — as anyone can already pick any person in "View as" today; Microsoft's sign-in closes it
at the database step. (Fable R1-1 asked for a stored password per account instead; declined — §Round 1.)

### 3. The session — one shape for every signed-in state

`resetSession(s)` stays the ONE session-change path. **Every state after a successful sign-in is a session** (Astra
R1-4), so no user action ever runs as the internal `system` actor:

| `SESSION.role` | Who | `pid` / ME | Renders |
|---|---|---|---|
| `admin` | an account, ON, admin | his person | the Shell |
| `main` | an account, ON, member | his person | the Shell |
| `guest` | on no list, asked, guest switch ON | null | the **guest view** only |
| `pending` | on no list (not asked yet, or asked and waiting with the switch OFF) | null | the request / waiting screen |
| `off` | an account switched off | null | the switched-off screen |

`SESSION = { user, role, pid, name }`: `user` the account id (or `principal:<name>` for the last three), `name` the
signed-in principal. ME is set ONLY by `resetSession` from `s.pid`; a call without a `pid` key (125 unit-test files use
`setSession` directly, 14 use `resetSession` with a bare `{ user, role }`) keeps the module default `bane` — documented
as the headless/test person; production always passes `pid` (null for the last three). `resetSession(null)` (sign-out)
sets ME back to that default and SESSION to null — the Login shows.

On every `resetSession` (sign-in AND sign-out), besides what it does today:
- **`endUndoSession()`** (new, `undo/timeline.ts`): empties the undo and redo entries AND the seq maps `bySeq` and
  `rootOfSeq` (so a projection caused by a pre-sign-in command cannot fold into an entry no longer listed), bumps the
  version, and keeps the installed hooks, the registered stores, the cutover, `expected` and `barrier` (D148's conflict
  detection rides `expected`) — the 13 Sep 26 rule and D148's "the list clears when they sign out", which the global
  undo never did (Fable R1-7 / R2-7, Astra R1-10). Pinned admin→admin, admin→member, member→member, and "A commits,
  signs out, B signs in, a projection caused by A's seq arrives: nothing throws, nothing is undoable".
- **`resetPopsForSession()`** (new, `ui/pops.ts`): closes every window and sheet whose flag lives in `pops.ts`, from a
  `POPS_RESET` registry beside the flags (the `VIEW_RESET` pattern in `state/view.ts`) — `DAYPOP`, `INSIGHTS`,
  `AIRKEY`, `TPLEDIT`, `WAVEEDIT`, `DAYTPLEDIT`, `DRAFTSEDIT`, `INPEDIT`, `OILASK`, `DOCVIEW`, `DRAWER`, `WEEKCAL`,
  `HISTLIST` with `HISTGROUP` / `HISTOPEN` — and a test that every `export let` in `pops.ts` has an entry, so a new window
  cannot be missed (Fable R2-8). So the next person never inherits an open editor or a document (Astra R1-3); each
  window keeps its own permission check as well.
- the Leave War: `lwSetRole(admin ? 'admin' : 'member')` as today; `viewer` = `SESSION ? (ME ?? '') : null` — a guest or
  pending person scopes to NO row (`''` matches nothing), never `null` (null is "unscoped" to the war's `canEditRow`).
- `LOGINROLE`, `canToggleRole`, `setEffectiveRole`'s UI use and `toggleRole` are removed. The actor: `deriveActor()` maps
  the role straight through (`admin` / `member` / `guest` / `pending` / `off`), `personId` = ME; `system` is ONLY the
  explicit seed/load/projection actor. `mayReverse` requires a non-empty person.

### 4. One place answers "may this person do this?" (D200 (3))

New module `src/state/perms.ts` — the only file that decides authority. Four parts:

1. **`PERMS` — the matrix as data**, one row per table of `data-model.md` §11: for each role (`admin`, `member`, `guest`,
   `pending`) the operations C / R / U / D, the member's own-row letters, and the named sensitive reads (a medical
   input's details, a document, the change history's medical detail — every member YES, the guest NO, D211). Rows the
   app does not yet obey carry a `gap: '[ITEM-ID]'` naming the filed build (today one: `EditLog` member R →
   `[DRAFT-PENDING]`).
2. **`may(op, ctx)`** — the one evaluator, `op` a typed `PermOp` (`{ table, act, own? }` or a named action such as
   `account.manage`, `access.request`, `guest.toggle`), `ctx` the owner's person id where the rule is own-row. The named
   questions every gate asks are one-line wrappers over it: `isAdmin()`, `me()` (null for guest/pending/off),
   `mayEditSched()` (today's `canEditSched`, kept as a re-export so ~160 call sites do not move), `mayEditInputOf(pid)`,
   `mayFileInputFor(pid)`, `mayEditQualsOf(pid)`, `mayManageRoster()`, `mayManageAccounts()`, `mayRequestAccess()`,
   `mayAwardOil()`, `mayReadMedicalOf(pid)`, `mayReadDocOf(pid)`.
3. **The command gate delegates to it** (Fable R1-4 and R2-1/2/3, Astra R1-5 and R2-2/3). `COMMAND_OPS` in `perms.ts`
   maps EVERY registered command type — all five registration sites: `state/sched-commit.ts`,
   `state/people-settings-commit.ts`, `undo/timeline.ts`, `leavewar/state/store.ts` (its eight `lw.*` types) and
   `tracker/app/core.js` (its eleven `trk.<collection>` types and `trk.gesture`) — each calling
   `definePermission(t, cmdCheck(t))` instead of `anyone`. `cmdCheck` returns ONE memoised function per type
   (`definePermission` throws on a conflicting re-register). A joined child command is never re-authorised (it runs
   inside its authorised parent — `command/permissions.ts`), so the top-level mapping can be strict without breaking a
   cascade. What each gets:
   - **refused for `guest`, `pending`, `off`: every forward command**, except `access.request` for `pending` (below).
     The one line that makes the command layer fail closed for anyone who is not a member.
   - **admin only:** the four board writes `sched.slot`, `sched.fill`, `sched.text`, `sched.delete` (their opening
     functions `writeSlot` / `writeFill` / `writeText` / `writeDelete` carry no role check of their own — Fable R2-2);
     `sched.approve`, `sched.publishAL`, `sched.discard`, `sched.unpublish`, `sched.sign`, `sched.signClear`,
     `sched.section.move`, `sched.section.reorder`, `sched.stores`, `sched.warnMute`, `sched.oil`,
     `sched.draft.rename`, `sched.draft.delete`; EVERY `settings.<key>` (the three new ones included); the account
     commands below; `lw.decide`, `lw.approve`, `lw.decideApproved`, `lw.removeApproved`, `lw.moveApproved`.
   - **member-and-admin:** `sched.mutate` (the epilogue backstop an input's own landing can fire outside a command);
     `inputs.write` and `inputs.batch` — with `meta.owner` (or `meta.owners`) passed by `commitNewInput`,
     `commitInputEdit`, `removeInput`, `setInpField`, `setLeaveRemarks`: a member is refused when an owner is present
     and is not his person; with no owner meta the writer's own `perms` check stands (the Leave War absence door, the
     calendar drag); `lw.edit`, `lw.move`, `lw.ack` (authority at the war's writer: `canEditRow` with the viewer,
     `canDecide`); every `trk.*` type and `trk.gesture` (D121 — everyone edits the Tracker; guests never mount it).
   - **own-or-admin by `meta.owner`:** `people.edit` — the Quals write function passes the row's person (and checks
     what actually changed, §5); add, archive and restore pass none, so they stay admin; the posting-out pass is a
     projection.
   - **The account commands** (intent-specific, each enlisting the settings store ONCE and writing every key it needs
     inside that one command, so a pair rolls back together — Astra R2-3, Fable R2-3): `access.request` (**pending
     only**; appends exactly one entry built from `SESSION.name`, refused if one exists or the name has an account),
     `access.decline`, `access.approve` (creates the account AND clears the request in one command), `account.add`
     (clears a waiting request for that name in the same command), `account.update`, `guestview.set` — all admin only.
     Failure injected after each constituent write rolls all three keys back to their before-image.
   - `undo.restore` keeps `mayReverse`.
   **The coverage test enumerates the registry itself** (`registeredTypes()`, exported from `command/permissions.ts`
   beside `hasPermission`, read after every module has registered): every entry has a `COMMAND_OPS` row, every row names
   an op `PERMS` has, and no registered type is `anyone`. Red first: a member actor committing `sched.slot` is refused;
   a pending actor committing `settings.accessreqs` is refused; `access.request` twice is refused.
4. **The Leave War is a second app with its own store** (its architecture rule): its writers keep their `state.role` /
   `canEditRow` / `canDecide` checks — its `role` and `viewer` are written ONLY by `resetSession` (the one seam) — and a
   **parity test drives its public writers** as admin, member-own, member-other and guest (role `member`, viewer `''`),
   comparing each outcome with the §11 rows for `LeaveWar`, `LeaveBid`, the hand-typed award, `LeaveLedger`,
   `LeaveOpening` and `LeavePersonProfile`: at least two writers per row, and every writer the war's UI offers only to an
   admin (the stage, the bid window, decisions, the ledger, balances, manning, post-out / in, the settings) at least
   once. Astra R2-2 asked for every one of its ~70 checks and for splitting its command types; declined as out of
   proportion (§Round 2) — the war's own store tests already pin its role refusals one by one, and the command gate now
   refuses every non-member.

**The drift test** (`perms.test.ts`) reads `docs/data-model.md` §11 from disk, parses each row (the letters C/R/U/D per
column, "own" applying to the letters of its clause; parenthesised words are notes), and fails when a row, a letter, a
column or a `gap` differs from `PERMS` — so the table IT builds from and the app's matrix cannot drift apart, and a known
gap cannot close or open silently. **The source scan** (`perms-scan.test.ts`, Fable R1-5 / R2-4, Astra R1-5 / R2-2)
fails on the authority forms the code actually uses — `\bSESSION\s*(\.|\[\s*['"])role\b`, a destructured `role` from
`SESSION`, `\bLOGINROLE\b`, `\bME\s*(===|!==)` / `(===|!==)\s*ME\b`, and `\.role\s*(===|!==)\s*'(admin|member|main)'`
— outside an allow-list with a stated reason per entry: `state/perms.ts`, `state/auth.ts`, `command/actor.ts`,
`command/permissions.ts`, `undo/timeline.ts` (`mayReverse` compares actor roles), and the `leavewar/` tree (its
`role` / `viewer` are the war's own, written only by `resetSession`, proved by the parity test). DISPLAY uses of the
signed-in person (the purple "this is you" puck, the war's own-row tint) are allowed by a separate, documented
display list, each entry a `file` + the expression. The scan carries its own fixtures (aliased, bracketed and
destructured forms must be caught), is red on today's tree, and is green only after build step 7. (Astra R2-2 asked for
an AST boundary check instead; declined — the regex over these forms, with fixtures, catches every form the code base
uses today at a fraction of the cost.) The direct role reads that exist today (Shell, Drawer, AdminPage, HelpPage,
LogicPage, Modals, InputsPage, QualsPage, reports, the four template sheets, `sync.ts` restore, `inputgate.ts`,
`caldrag.ts`, `DocViewer.tsx`, `inputedit.tsx`, `InputsCal.tsx`) are rewritten to the named questions (`inputgate`'s
own-bid test becomes `isMe(person)`). When the drift test lands, the bug-check order §5's server
question points at it and **D202 is marked spent** (D202's own words).

### 5. The Quals own-row rule (D149) — one write function, checked before anything moves

`src/state/quals-write.ts` (new): `updatePersonField(pid, op)` where `op` is a CLOSED set, not a free function (Astra
R2-4, Fable R2-5): `{ tick: qualKey }` (the three-state AAR ladder, SXO, SCHEDULER, SANS and every LoX column),
`{ cat }`, `{ initials }`, `{ flight }`, `{ remarks }`, `{ callsign }`. It checks `mayEditQualsOf(pid)` FIRST (refusal:
"You can only edit your own row", nothing touched), then — inside ONE `commitPeopleEdit` with `meta.owner = pid`, so the
command gate checks it a second time — applies the op to that row, the derived fields (`deriveQuals`, the SANS / SXO
wiring, the DAAR/NAAR and SC day/night cascades) and `validate()`; and BEFORE the persist it diffs `PEOPLE` against the
people baseline and refuses the whole command (rolled back) if any person other than `pid` changed. The Quals page's
handlers become thin: read the row's id and the op from the element, call `updatePersonField`, show its refusal.
`commitPeopleEdit` gains its `meta` parameter (it takes only `fn` today). Add person, archive, restore and "Edit quals" (the LoX columns) stay separate admin-only functions
(unchanged in behaviour, now asking `mayManageRoster()`). The table renders editable controls on the member's own row
only; other rows read as text for him. Tests: each op through `updatePersonField` for admin, member-own, member-other,
guest, pending, no session; a stale delegated click naming another row; a command that changes two rows rolls back;
a validation failure rolls back; the render per role.

### 6. The screens

- **Top bar:** `#viewAs` goes. `#roleBadge` becomes an inert label naming the person and role ("Saber · Admin"); hidden
  on a phone as today.
- **Drawer (phone):** the View-as chips go; the Account row reads "Signed in as Saber · Admin" above Logout; the role
  toggle goes.
- **Admin tab:** a count badge on the tab (top nav and drawer) while access requests wait — admins only (D204 "a badge
  on the Admin tab").
- **Admin → Users** (replaces Manage users): (a) **Waiting for access** — each request: sign-in name, the callsign and
  name typed, when; **Approve** opens a small form: the puck (a picker over the roster — people with no account, not
  archived, not the ALL / ALL AVAIL placeholders; the typed callsign is shown as a hint, never pre-linked) and member /
  admin; **Decline** removes it. "Not on the roster? Add them on the Quals page first." (b) **Accounts** — one row each:
  sign-in name, the person's callsign (live — a rename moves nothing), role, on/off, and "archived callsign" when the
  person has been archived; tap to edit role, puck, sign-in name, or switch off / on — except his own account, which
  reads "You" and cannot be edited here. (c) **Add an account** — sign-in name, puck, role. (d) **Guest view** — "Let
  people waiting for access view the schedule (read only)", off.
- **The access screens** — siblings of the sign-in card, same look: request access (callsign, name, Request access,
  Sign out); waiting ("Your request is with the admins…", Sign out); switched off (Sign out). Each is its session's whole
  render; Sign out goes through `ui/logout.ts` (`resetSession(null)`).
- **The guest view** — `App.tsx` renders a SEPARATE tree for a guest (Fable R1-2, Astra R1-3): a slim bar (the talon
  mark, the week picker, "Waiting for access — view only", Sign out) and the published week only, from the same week
  builder the view page uses. None of the Shell, the board, the history list, the input editor, the document viewer, the
  ALL AVAIL window, the template sheets, Leave War, Tracker, Quals, Logic, Inputs, Help or Admin is mounted. No
  working-copy peek, no pending count, no change history. **No medical detail:** a medical input on the Unavailable list
  reads "Unavailable" with its times — no type, no remarks, no document (the 10 Sep non-negotiable; `perms`
  `mayReadMedicalOf`). The builder's guest branch runs only with a guest session, so the byte-exact comparison with the
  original (which runs with no session) is untouched.

### 7. Guards (the refusals, each with its reason on screen)

- **Never lock the squadron out:** at least one account that is ON, admin, and whose person exists must remain —
  switching off, demoting or relinking is refused when it would leave none ("At least one admin must keep access").
- **Not your own account:** an admin cannot change his own account at all (role, puck, name, on/off) — "Ask another
  admin" — so his session never changes under him.
- **One person, one account; one sign-in name, one account** (case-insensitive).
- **Adding an account for a name that has a request waiting** answers the request (it clears).
- **A puck that is archived** keeps its account working (posting out archives a person AUTOMATICALLY — `leavewar/sync.ts
  runPoArchive` — so refusing sign-in would lock out whoever it catches); the list marks it so the admin can switch it
  off.
- **A change to someone else's account** takes effect at his next sign-in (one person is signed in on a browser).
- **Undo:** account edits are not undoable in this build — settings are not cut over to the one undo
  (`state/undo-wire.ts`), pinned by a test; `[UNDO-ROSTER-SETTINGS]` (his 16 Sep 26 rule) gains the note that when
  settings join the undo, an account restore must re-check the one-admin and not-your-own guards.

### 8. "Who" — the callsign on screen, the person's id in the record (D166 (5), the one-identity rule)

`HOOKS.whoami()` returns the signed-in callsign (a guest: "Guest"). Records that store a "who" gain the person's id
beside the display string, so a rename moves nothing and a reused callsign cannot inherit: the edit log (`pid` beside
`who`), a bug report (`pid`; "Your reports" filters by `pid`, displays the live callsign — Astra R1-9), the unpublish
`by` (already the person). The command actor's `personId` is now the real person. The Leave War's `approvedBy` on a
ledger grant becomes the admin's own callsign automatically (it read the View-as person). The replaced-bid notice
(`inputgate.ts`): `own = ME === person` whatever the role, and `byWho` = the signed-in callsign — an admin filing over
his OWN bid gets "your … bid" and no notice (Fable R1-6). The Tracker's `by` stamps follow `whoami` with no Tracker
change.

### 9. The probe bridge — installed on localhost only (Astra R1-1, Fable R1-3)

`main.tsx` calls `installProbeBridge()` only when the host is `localhost`, `127.0.0.1` or `[::1]`: the e2e suite, the
probes, the Tracker smoke and the hand-pass drivers all run there, and nothing in the app itself calls a bridge global
(checked: no inline handler reads one). On any other host none of its globals exist — a test with a non-local hostname
asserts every bridge name is absent. `raptorRole(r)` stays; new `raptorMe(pid)` changes the person in place, replacing
the one e2e step that drove `#viewAs` (`step4-leavewar.spec.ts:320`). The comments calling `lwSetRole` / `lwSetViewer`
production seams are corrected. **Out of the bridge's scope, stated:** the Tracker's own test hooks
(`window.__coreForTests` and four siblings, `tracker/app/core.js`) are installed by the vendored Tracker on every host;
they grant nothing a member lacks (D121) and a guest never mounts the Tracker — the absence test lists them as out of
scope with that reason (Fable R2-9). **The drivers** (Astra R2-5): the shared hand-pass helpers (`scripts/handpass/lib.mjs`,
`trk-lib.mjs`) refuse a non-loopback `HP_URL` with a clear message; `scripts/handpass/live-check.mjs` (a GitHub Pages
check, dead since D59) refuses to run and says why.

### 10. The documents (D201, D200 (2))

- `data-model.md` §3 `User`: `personId` required (D166); `enabled`; no password; the new `AccessRequest` table
  (`signInName`, `callsign` and `name` as typed text, `at`); `EditLog` gains `byUser` / `byPerson`.
- `data-model.md` §11 (Fable R1-12): every ruling — the member's own `Person` row, every column except `archived`,
  `special` and `id` (D149); `EditLog` member R, medical detail included (D169, D211); `User` tied to a person, member reads
  his own row only (D166); `AccessRequest` created by a signed-in principal on no list, read and deleted by admins
  (D204); a hand-typed OIL award admin-only, keeping who entered it and when (D79/D82 — the app half filed); the GUEST as
  a third named security role reading the issued programme and people's callsigns, no medical detail (D204); the
  PENDING principal (may create his own request). The two known gaps named.
- `engine-rules.md` §Auth / roles; `ui-contracts.md` (the top bar, the drawer, the Admin page, the new screens, the guest
  view; line 5033's toggle); `feature-impact.md` (the accounts surfaces and the identity seam, lines 564–575's role
  reads); `data-schema.md` (the three settings keys); `handover-dataverse.md` (View as retired in the app now; the join
  flow; no password); `architecture-direction.md` (the guest line built); `undo-contract.md:241`;
  `docs/leavewar/known-gaps.md:92`; `raptor-port/CLAUDE.md` (the login line, the Leave War row at 706, the 11→14 keys);
  `leave-war.md` §Architecture and `stages.ts` comments ("the identity IS the View-as selection"); `matrix.css:1431`;
  `command/types.ts:65` and the `actor.ts` header; `e2e/app.ts:207-213`; `tracker/role.js:10-13`; `HANDOFF.md`
  §Standing constraints ("Prototype auth"); `file-map.md`; the bug-check order §5 (the server question → the drift
  test); the tests that pin the old world (`people.test.ts:54` "Squadron member", `app.test.tsx` `ACCOUNTS`,
  `roletoggle.test.tsx`, `tracker.test.tsx:66`) REPLACED by tests pinning what the rulings now say — never weakened.

## Q-A. OIL awards — "who gave each and when kept" (D200 (2) citing D79/D82)

A hand-typed award is written only by an admin today (`leavewar/state/store.ts setManualCredit`, `grantTo`: "Only an
admin can enter OIL"); it keeps its date and an optional typed "Given by" (on whose say-so — owner, 20 Sep 26). It does
NOT keep which account entered it or when (Astra R1-8). **Filed, not built here:** D203 puts `[OIL-AWARD-IS-A-GRANT]` —
which changes how an award is stored, to one form — about a month before the database, "done last so it is done once";
adding fields to the award's record now would be changing it twice. That item gains the requirement: stamp the entering
person (by id) and the time, separate from "Given by". §11 states the rule. (The ledger grant's `approvedBy` becomes the
admin's own callsign with this build, §8.)

## Roll-call — every place the app reads "who is signed in" (bug-check order §6)

The THING: the signed-in identity (the person and the role). Columns: after the build · proved by · today.

| # | Surface / reader | Must, after the build | Proved by | Today |
|---|---|---|---|---|
| 1 | Top bar `#viewAs` | MUST NOT exist (D166 (3)) | unit + walk (desktop) | a person picker, members too |
| 2 | Drawer `#drawerViewAs` chips | MUST NOT exist | unit + walk (phone) | chips, members too |
| 3 | Top bar `#roleBadge` | inert "Callsign · Admin/Member" | unit + walk | admin toggle button |
| 4 | Drawer `#drawerRole` | MUST NOT exist; Account row "Signed in as …" | unit + walk (phone) | toggle |
| 5 | Inputs page — filter default, admin's Person default, `#inPersonFixed`, row ✎ ✕ OIL, the default-window editor | the account's person / `perms` | unit + walk | ME / role reads |
| 6 | Inputs calendar `openAdd`, its planning notes | the account's person; admin | unit | ME |
| 7 | `commitNewInput` / `commitInputEdit` / `removeInput` / `setInpField` / `setLeaveRemarks` | `perms` (member own; guest/pending/off none) | unit (red first for guest/pending) | `r.person !== ME` |
| 8 | Inputs calendar chip move (`caldrag`) | `perms` | unit | ME |
| 9 | Document viewer — open, Upchit, Edit input | `perms`; fails closed for a non-member even if its flag is set | unit + walk | ME; opens for anyone |
| 10 | Medical view | unchanged for members (D211); never mounted for a guest | walk | ungated |
| 11 | Leave War `viewer` (sync mirror) | the account's person; `''` for guest/pending/off; null only with no session | unit | ME, null possible |
| 12 | Leave War "Viewing as" badge (Chrome) | names the signed-in person; no "use View as" words | walk | stale words |
| 13 | Leave War counter sheet "your numbers" | own numbers; no "view a callsign" words | walk | stale words |
| 14 | Leave War own-row tint, own actions, "OK, seen", remarks | own row | e2e (existing) + parity test + walk | ME via viewer |
| 15 | Leave War `approvedBy` on a grant | the admin's own callsign | unit | the View-as callsign |
| 16 | `inputgate.ts` replaced-bid notice | `own = ME === person`; `byWho` = callsign | unit (admin over own bid) | `LOGINROLE` |
| 17 | The bell's OIL question | the account's own | walk | ME |
| 18 | The bell's bug-report light (`reports.ts bugAlert`) | admin via `perms` | unit | role read |
| 19 | The purple "this is you" puck | the account's own puck | walk (board + week) | ME |
| 20 | Command actor / undo `mayReverse` / `endUndoSession` | real id and person; the list empties at sign-in and sign-out | unit | shared `us` id; never emptied |
| 21 | `HOOKS.whoami` → edit log, History bubble, pending list, bug reports, Tracker `by` | the callsign; `pid` kept beside it | unit + walk | "Admin" / "Squadron member" |
| 22 | Help page "Your reports" | by `pid` | unit (rename) | shared label |
| 23 | Unpublish `by` | the person | unit | ME or `us` |
| 24 | Sign-off boxes (four) | names unchanged; `sched.sign` admin only at the command gate | unit (red first) | no write-path check |
| 25 | Sign-off eligibility (`publish.ts:1309` — the SCHEDULER tick) | unchanged; a member may tick his own (D149) — on the look card | walk | any row |
| 26 | Admin tab (nav, drawer, page `#admDeny`) | admin only; badge while requests wait | unit + walk | admin only |
| 27 | Admin → Users | accounts, requests, add, edit, guest switch; own account read-only | unit + walk | the dead `USERS` list |
| 28 | Sign-in card | account lookup; the five session states | unit + walk | `ACCOUNTS` constant |
| 29 | `App.tsx` | Login · access screen · guest tree · Shell | unit | Login · Shell |
| 30 | Every `pops.ts` window | closed at every sign-in and sign-out | unit (parameterised) | some survive |
| 31 | Quals page | member: own row every column, others as text; `updatePerson` refuses first | unit per column + walk | any row |
| 32 | Quals archive / add / restore / Edit quals | admin, via `perms` | unit | admin |
| 33 | Logic page edits, the airspace popover (`Modals.tsx`), the late-mark / mute / note-publish toggles (`view.ts`) | admin via `perms` | existing + unit | role reads |
| 34 | Edit Schedule, the board's edit mode, the four template sheets | admin (unchanged); their "toggle peek" comments corrected | existing + walk | admin |
| 35 | View-only Sched | members and admins as today | walk | everyone |
| 36 | The guest view | the published week only; no medical detail; nothing else mounted | unit (red first) + walk | n/a |
| 37 | Tracker | no role; `by` from `whoami` | smoke (existing) | no role |
| 38 | Probe bridge | localhost only, the whole bridge | unit (non-local host) | mostly everywhere |
| 39 | The boot mirror before sign-in (`main.tsx` → `sync.ts`) | `viewer` null with no session; nothing drawn | unit | ME `bane` |

**Doors** (every action, the control that does it): sign in (the card); sign out (top bar Logout, drawer Logout, each
access screen, the guest bar — all through `ui/logout.ts`); request access; approve / decline (Admin → Users); add an
account; change role, puck, sign-in name; switch off / on; the guest switch.

**Orders to walk:** request → approve → sign in; request → decline → sign in → request again; admin adds an account for
a name with a request waiting (the request clears); switch off → sign in (switched-off screen) → switch on → in; demote
/ switch off the last admin (refused); try to change one's own account (refused); relink a puck → next sign-in is the new
person; rename the callsign on Quals → the account list, "who" and "Your reports" follow; the Leave War posts a man out
(archived) → his account still signs in, the list marks it; guest switch on → a waiting person sees the published week
only → switch off → next sign-in shows the waiting screen; an admin opens an input editor / a document, signs out, a
guest signs in (nothing survives); a member changes his input, signs out, an admin signs in, presses Undo (nothing to
undo); admin files leave over his OWN bid (no notice); a member ticks SCHEDULER on his own row, then an admin opens the
sign-off boxes; reload after each (the three records persist; the session does not — a reload lands on the sign-in, as
today). Member walks: own Quals row every column / another row refused; own input / another's refused; own war row /
another's refused; undo of own change / another's refused.

## Build order (each step red first where a behaviour changes)

1. `perms.ts` (`PERMS`, `may`, the named questions, `COMMAND_OPS`) + §3 and §11 rewritten + the drift test (red first:
   it fails on today's §11) + the source scan (red first: it fails on today's scattered reads).
2. `accounts.ts` + the three settings keys + seeds + the code-only seed passwords; `signIn()` → the five states,
   unit-tested headless; the raw-storage test (no password anywhere).
3. The session: `resetSession` takes the account; `endUndoSession`, `resetPopsForSession`; the toggle, `#viewAs`, the
   drawer chips removed; `whoami` and the `pid` beside it; the actor roles; the Leave War viewer; `inputgate`; the command
   gate delegating to `perms`; the probe bridge on localhost only + `raptorMe`; the tests that pinned the old world
   replaced.
4. The access screens + `App.tsx`; the guest tree and its medical rule.
5. Admin → Users; the badge.
6. D149: `quals-write.ts updatePerson` + the page wired to it (a test per column).
7. The scattered checks rewritten to the named questions until the source scan is green; the Leave War parity test.
8. The documents (§10); `rulecheck` gains the accounts register's ids (`AC1`…); the file map; the backlog items filed
   (`[SIGNOFF-SELF]` — filed; `[MED-VISIBILITY]` — filed and answered, D211; the notes on `[OIL-AWARD-IS-A-GRANT]`, `[UNDO-ROSTER-SETTINGS]`,
   `[DRAFT-PENDING]`).
9. Gates → the walk (roll-call-driven, both widths, pictures) → gates → Fable and Astra read the final code with the
   evidence sheet → fix → re-walk → gates → his look card.

**His look card will carry, as the agent's readings he can correct:** the admin's role toggle removed (D166 (3)); one
person, one account; an archived callsign keeps its account; an admin cannot change his own account; the guest sees the
published week only, without medical detail; an added account signs in with any password until Microsoft's sign-in;
a member may now tick SCHEDULER on his own row, which puts his name in three sign-off boxes (D149's consequence);
until Microsoft's sign-in, the "who" on every change can be claimed by anyone who types another account's sign-in name on
a shared browser; a guest sees no medical detail (D211 was about members).

## Questions for him this build does NOT answer (filed, not blocking)

- **`[SIGNOFF-SELF]`** — with personal accounts, should each of the four sign-offs be signed by that person, signed in,
  instead of an admin picking all four names?
- **The edit history is cleared at every sign-in** (session-only, as today) — with personal accounts, should it outlive
  a sign-out? Noted on `[DRAFT-PENDING]` (D168–D170), which owns the change history.

## Not in this build (filed or ruled elsewhere)

- The changes window, "new to you", per-person hand-over (`[DRAFT-PENDING]`, D167–D172) — built on top of this.
- D148 per-person undo beyond "the list clears at sign-out" (with change-recording, `[HUMAN-RETEST]`).
- A Teams message on a new request (D204 — at the database step).
- Microsoft sign-in itself, the real address, the environment's access group (D165 — IT).
- Server-side enforcement (the database step; the drift test keeps the table it is built from honest).

## Round 1 — what changed (every finding dispositioned)

Reports: `docs/superpowers/specs/2026-09-26-accounts-redteam-r1-fable.md` (REVISE) and `…-astra.md` (BLOCK), read blind
to each other. Where they disagreed, settled by evidence (bug-check order §4 step 6).

| Finding | Disposition |
|---|---|
| Fable 1 (BLOCKER) — no password lets anyone sign in as an added account | **Declined, with the reason.** Storing a password per account contradicts `data-model.md` §3 ("no password is ever stored") and Astra R1-7 (store none at all); the owner asked on 26 Sep 26 and was told the app keeps no password; anyone can already be anyone through "View as" today; Microsoft closes it at the database step. On his look card as a consequence he can overturn. |
| Fable 2 / Astra 3 — the guest reaches overlays and doors | **Accepted:** a separate guest tree (§6), `resetPopsForSession` (§3), the command gate refuses guests (§4.3), the document viewer fails closed (roll-call 9). |
| Fable 3 / Astra 1 — the probe bridge is on the deployed site | **Accepted, widened to the whole bridge:** installed on localhost only (§9), with a non-local-host test. |
| Fable 4 / Astra 5 — the command layer's `anyone` | **Accepted:** `COMMAND_OPS` maps every type through `perms`; guests / pending / off refused; admin-only types; `people.edit` own-or-admin by `meta.owner`; a coverage test. The member-reachable scheduler and input types stay member-and-admin with their authority at the write functions, stated per type (a member's own input cascades through them — refusing them would break the 16 Sep 26 rule). |
| Fable 5 / Astra 5 — scattered checks survive; the drift test cannot see them | **Accepted:** the source scan; the direct reads rewritten; the Leave War parity test; the drift test covers own-row, guest, pending and the named gaps. |
| Fable 6 — an admin filing over his own bid is told "an admin" | **Accepted** (§8). |
| Fable 7 / Astra 10 — undo never clears at sign-in / sign-out | **Accepted:** `endUndoSession` (§3). Account edits kept out of undo and pinned; the accounts note filed on `[UNDO-ROSTER-SETTINGS]` (his 16 Sep 26 rule already says settings are undoable — no new question). |
| Fable 8 — `torch` → a posted-out man; geometry moves | **Accepted:** seeds `outlaw` / `hex`; the geometry re-baseline stated (§1). |
| Fable 9 — the SCHEDULER tick puts a member in three sign-off boxes | **Accepted:** on his look card; roll-call 25. |
| Fable 10 — the guest identity's two values | **Accepted:** §3 (the viewer rule, actor roles, `mayReverse` non-empty, `resetSession(null)` stated). |
| Fable 11 — persistence details | **Accepted:** the loader never writes; bad values; the lock-out fallback; own account not editable at all; sign-out on an access screen is `resetSession(null)`. |
| Fable 12 — §3 / §11 lines for IT | **Accepted** (§10). |
| Fable 13 — the D201 sweep misses stale text | **Accepted** (§10). |
| Fable 14 — decisions that are his | **Accepted:** the look card list. |
| Astra 2 (BLOCKER) — medical visibility | **Put to him and RULED the same day — D211, "Keep as today":** every member sees a medical input's type, remarks and documents; the database brief is amended. The guest (not a member) gets no medical detail and the document viewer fails closed for him. |
| Astra 4 (BLOCKER) — an unmapped principal runs as `system` | **Accepted:** every post-sign-in state is a session with its own role (§3). |
| Astra 6 — no pre-mutation Quals funnel | **Accepted:** `quals-write.ts updatePerson` (§5). |
| Astra 7 — a password persisted in `accounts` | **Accepted:** no password persisted; the seeds' two in code only; a raw-storage test (§2). |
| Astra 8 — OIL awards keep no entering account or time | **Accepted as a requirement, filed not built:** D203 puts the award's record change in `[OIL-AWARD-IS-A-GRANT]`, done once; the requirement is added there and to §11 (§Q-A). Fable found the deferral sound. |
| Astra 9 — "Your reports" keyed by callsign | **Accepted:** `pid` on the report (§8). |

## Round 2 — what changed (every finding dispositioned)

Reports: `docs/superpowers/specs/2026-09-26-accounts-redteam-r2-fable.md` (APPROVE with findings 1–3 in §4.3) and
`…-r2-astra.md` (BLOCK). Both saw both round-1 reports.

| Finding | Disposition |
|---|---|
| Fable 1 / Astra 2 — `COMMAND_OPS` misses the Leave War's 8 and the Tracker's 12 command types | **Accepted:** all five registration sites; the coverage test reads the registry (`registeredTypes()`); `cmdCheck` memoised (§4.3). |
| Fable 2 / Astra 2 — the four board writes left member-capable on a false premise | **Accepted:** admin only; `sched.mutate` stays member-and-admin; `inputs.write` / `inputs.batch` carry `meta.owner` (§4.3). |
| Fable 3 / Astra 3 — `settings.accessreqs` open to a pending person is a whole-list write; approve not atomic | **Accepted:** intent commands (`access.request` pending-only, `access.approve` / `account.add` one command each), failure injection (§4.3). |
| Astra 2 — every Leave War check exhaustively, and split its command types | **Declined, with the reason:** the war is a second app whose store already pins its role refusals test by test; the command gate now refuses every non-member; the parity test covers every §11 row and every admin-only door at least once (§4.4). |
| Astra 2 / Fable 4 — the source scan's forms and allow-list | **Accepted** with regex forms matching the code, fixtures, a reasoned allow-list and a separate display list; the AST check **declined** as out of proportion (§4). |
| Fable 5 / Astra 4 — the Quals function trusts a caller's owner and runs any change | **Accepted:** a closed set of ops, and a changed-rows check before the persist (§5). |
| Fable 6 — the lock-out fallback replaces the whole list | **Accepted:** the seed admin is added to the cleaned list (§1). |
| Fable 7 — `endUndoSession` must clear the seq maps | **Accepted** (§3). |
| Fable 8 — `resetPopsForSession` has no completeness check | **Accepted:** `POPS_RESET` registry + test (§3). |
| Fable 9 — the Tracker's own test hooks on every host | **Accepted as a stated exclusion** with its reason (§9). |
| Astra 5 — drivers that expect the bridge off localhost | **Accepted:** the helpers refuse a non-loopback URL; the dead Pages check refuses to run (§9). |
| Astra 1 (BLOCKER) — medical visibility for members | **Ruled by him, D211 ("Keep as today"):** members see it all; the guest sees none. |
| Fable, R1-1 note — "who" stamps forgeable on a shared browser | **Accepted:** on his look card in those words. |
