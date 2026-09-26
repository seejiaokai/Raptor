# `[ACCOUNTS]` — the build plan (26 Sep 26)

Written by Opus 5.5 (the builder, D67) on `claude/nifty-albattani-j7975f`. Red-teamed by Fable 5.1 here and by Astra on
the owner's PC (this cloud session cannot reach Codex) — the brief both read is
`docs/superpowers/briefs/2026-09-26-accounts-plan-redteam-brief.md`; their findings and what was done with each are §14.

**Tier: FULL** (bug-check order §5: question 7 roles — YES; 3 saved data — YES, new stored records; 6 a new surface —
YES; 5 new controls — YES). The server question (D202): YES — who may do what changes, so `docs/data-model.md` §11 is
updated in the same change (D200 makes that the point of the work).

---

## 1. What it must do — the rulings, in the app's words

| # | Ruling | What the build must make true |
|---|---|---|
| D166 (1) | Accounts in the app now | The Admin tab creates and manages accounts: each has a sign-in name (standing for the defence mail), admin or member, and the callsign (puck) it belongs to. An admin creates admins and members. Replaces the two fixed logins and merges Admin's old "Manage users" list, which drove nothing. |
| D166 (2) | The sign-in screen stands for the defence mail sign-in | The sign-in name plays the defence mail address; the password plays the organisation's. At the database step Microsoft sign-in replaces the screen (single sign-on); IT ties each account to the real address (D165). |
| D166 (3) | Signing in makes you that callsign | "View as" goes — the top-bar picker and the phone drawer's chips. **No "preview as a member"** (his explicit no) — the admin's role toggle goes with it. |
| D166 (4) | The Leave War follows the signed-in callsign | A member bids only on his own row — the one his account is tied to. |
| D166 (5) | Every "who" names the callsign | The edit record, the pending list, the history bubble — and every other place that stamps who did something. **Overtakes D104** ("the shared account until the database"): the accounts arrive now. |
| D204 | A new user joins either way | (a) the admin adds the defence mail, callsign and role first, and the first sign-in has that access at once; (b) or someone signed in with a defence mail on no list sees **Request access**, asking only for callsign and name; the admin is notified (**a badge on the Admin tab**; a Teams message at the database step), approves, sets member or admin, and links him to a puck — **a typed callsign never claims a puck by itself**. Either way the admin can change role, puck, or switch the account off later. While waiting he sees a **waiting screen**; an **admin switch**, **off by default**, lets people waiting read the programme as a **guest**. |
| D149 (via D200) | Quals: a member edits his own row only, every column | The own-row gate at the page AND the write path; a test per column. Today every row is editable by every member once "Enable editing" is on. |
| D200 (2) | §11 matches every ruling | Person own row (D149); EditLog readable by members (D169, medical details excepted); an account tied to a callsign (D166); OIL awards admin-only with who gave each and when (D79, D82). |
| D200 (3) | One place answers "may this person do this?" | Mirrors §11, with a test that fails when the two disagree. |
| D202 | The server question on every change | Until the drift test exists; once it does, that test carries it (the order's paragraph then points at it). |
| D173 / D180 / D203 | The order | Accounts now, on its own branch; the one changes window (`[DRAFT-PENDING]`) on top of it next; one full check of both; "merge live". |

**Not in scope, kept as they are:** the Tracker reads no role (D121 — everyone does everything there); the sign-off
boxes on Edit Schedule stay a person picked from the appointed schedulers (they record who SIGNED, not who clicked);
D148 (Undo reverses only your OWN changes, its list clears at sign-out, an admin too) stays where he placed it —
built with the change-recording re-test (`[HUMAN-RETEST]`, D147; `[GLOBAL-UNDO]` `[GU-MAYREV]`); today an admin may
still undo anyone's change and the list survives a sign-out. Accounts only makes "own" a real person (the command
actor's `personId` becomes the signed-in callsign), which that build then reads;
the demo data is cleared before the database (D54, D56).

---

## 2. The records — what is stored, and where

Three new SETTINGS keys, riding the settings seam that already routes every write through the command layer
(`state/people-settings-commit.ts` — `SETTINGS_KEYS`, a named `settings.<key>` command per write) and persists it
(`sqn142_<key>` → the whiteboard's `settings/<key>`). Settings are not in the one Undo (`[UNDO-ROSTER-SETTINGS]`), which
is right here: an account switched off is not something Ctrl-Z should bring back.

| Key | Shape | Default (never written until changed) |
|---|---|---|
| `accounts` | `Account[]` — `{ id, signIn, pass?, role: 'admin'\|'main', personId, enabled }` (§14 F2: no sign-in stamp) | the demo accounts (§2a) |
| `accessreq` | `AccessRequest[]` — `{ signIn, callsign, name, at, status: 'pending'\|'declined' }`, one per sign-in name | `[]` |
| `guestview` | `boolean` | `false` (D204: off by default) |

- `signIn` is trimmed and lower-cased, unique across accounts. `personId` is a `PEOPLE` id and **unique across
  accounts** — one person, one account (an account IS a callsign, D166). `id` is minted by `engine/newid.ts`.
- `pass` exists only on the two demo accounts (§2a). **The app holds no password for any account an admin creates**
  — in the real thing the organisation checks the password, never the app (`data-model.md` §3 User: "no password is
  ever stored in this model"). The prototype's stand-in: an account with no `pass` accepts any non-empty password,
  exactly as the organisation's sign-in would have let that person through. Stated to him (§13 Q2).
- **One record each for now** (not a row per account): `[DB-READINESS]` item (1) — saving in small pieces — gains
  `settings/accounts` and `settings/accessreq` (two people requesting at the same moment on two devices would
  overwrite each other at the database). At the database step the adapter maps them to `User` and `AccessRequest`.
- The loader (`accountsLoad`, beside the other settings loaders in `initStore`, and in `SETTINGS_LOADERS` for a
  rollback) sanitises what it reads: a non-array → the default; an entry without a string `signIn`, a known role, a
  `personId` or a boolean `enabled` is dropped; duplicates (sign-in or person) keep the first. Untrusted storage never
  throws out of boot.

### 2a. The demo accounts (the default when nothing is stored)

| Sign-in | Password | Role | Puck | Why |
|---|---|---|---|---|
| `ad` | `a` | admin | Ranger (`bane`) | the account he uses every day; Ranger is who the admin has always seen as "you" |
| `us` | `us` | member | Torch (`ignite`) | today `us` also looked as Ranger — that cannot stand once a puck has one account; Torch was a member in the old Manage-users list |
| `saber` | — | admin | Saber (`stiff`) | from the old Manage-users list (Stiff = Saber); a second admin, so "another admin changes your own account" (§5) is walkable |
| `outlaw` | — | member | Outlaw (`casper`) | from the old Manage-users list (Casper = Outlaw) |

`ad`/`a` and `us`/`us` keep their exact passwords (the e2e `login()` helper, the Tracker smoke, ~300 walk scripts and
his own habit all use them). **At the database step these four are deleted, never imported** — they are demo data
(D54, D56; `data-model.md` §7 "never seed demo data into the shared store"), filed on `[DB-STEP]`.

---

## 3. Signing in — every state

`Login.tsx` calls one function, `signIn(name, pass)` in `state/accounts.ts`, which answers one of:

| What was typed | The answer | What he sees |
|---|---|---|
| a sign-in name on an account, switched on, right password (or any non-empty one where the account has none) | signed in as that account | the app, as that callsign |
| the same with the wrong password (demo accounts only) | refused | "Incorrect username or password." (as today) |
| an empty password | refused | the same message |
| a sign-in name on a switched-off account | signed in, no access | a screen: "Your access has been switched off. Ask an admin." + Sign out |
| a sign-in name on no account, no request yet | signed in as a person waiting | **Request access**: his sign-in shown (read-only — the sign-in gives it, it cannot be typed), Callsign, Name, "Send request", Sign out |
| … with a pending request | the same | the **waiting screen**: "Your request is with the admins" + what he sent + "Change my details" + Sign out — or, while the admin's guest switch is ON, the programme read-only with a waiting banner |
| … with a declined request | the same | "An admin did not approve your request." + "Ask again" (the form, pre-filled) + Sign out. No guest view — he is no longer waiting |

- The session: `SESSION = { user: signIn, role, acct }` — `role` is `'admin'`, `'main'` or **`'guest'`** (the new
  role for anyone signed in without an account, whatever the screen); `acct` is the account id or `null`.
- `ME` = the account's `personId` on sign-in; **`''` for a guest** (no puck). At sign-out it goes back to the boot
  default as today (a sessionless context reads no gates).
- A reload signs out, as today (the session is not stored).
- `App.tsx` routes: no session → `Login`; role `guest` and not (pending AND guest switch on) → `Waiting` (one
  component, the four guest screens above); otherwise the `Shell`.

---

## 4. What goes, and what replaces it

| Goes | Where | Instead |
|---|---|---|
| the "View as" select `#viewAs` | `Shell.tsx` top bar | nothing — you are who you signed in as |
| the phone drawer's View-as chips (`data-va`) | `Drawer.tsx` | the drawer's account row shows "Signed in as <callsign> · Admin/Member" |
| the role toggle (`#roleBadge` button, `#drawerRole`) | `Shell.tsx`, `Drawer.tsx`, `store.ts toggleRole` | the badge stays as an inert label for everyone (Admin / Member / Guest) |
| `canToggleRole`, `toggleRole` | `auth.ts`, `store.ts` | deleted; `LOGINROLE` stays (the probe bridge's `raptorRole` still changes the effective role for e2e) |
| `ACCOUNTS` (the two fixed logins) | `auth.ts` | `state/accounts.ts` |
| `USERS`, `addUser`, `delUser` (the list that drove nothing) | `state/users.ts` — file deleted | the accounts list on Admin → Users |
| `setMe` from any screen | — | kept as the internal setter `resetSession` uses; the probe bridge gains `raptorMe(id)` (localhost only, like `raptorRole`) so an e2e can stand in for "signed in as that person" without a new account per test |

The owner's other rules on these surfaces stand: the login page stays simple (no credentials hint — 24 Aug 26); the
badge stays at the far right; the phone bar stays one row (the badge is hidden there as now).

---

## 5. Admin → Users (the one panel for accounts)

The rail's first category, **Users — "Who can sign in"**, becomes three blocks. Production words only on screen
(25 Aug 26); the prototype truths live in code comments.

1. **Requests** — shown only while one is pending. Each: the sign-in (defence mail), the callsign and name he typed,
   when; a Role select (Member default); a **Puck** select listing the roster people with no account (sorted by
   callsign, **starting empty** — "Pick his puck…"; the typed callsign is shown beside it as text, never pre-selected:
   D204 "a typed callsign never claims a puck by itself"); **Approve** (refused with a reason until a puck is picked)
   and **Decline**. Approve creates the account (switched on) and removes the request; Decline marks it declined.
2. **Accounts** — the add form: **Defence mail**, **Puck** (the same no-account list), **Role** → **Add account**
   (refused, with the reason, for an empty or taken sign-in, no puck, or a puck already taken; a pending request under
   the same sign-in is resolved by it). Then the list, sorted by callsign: callsign (puck colours), defence mail,
   an editable Defence mail, Role select, Puck select and an On/Off switch — no Remove (`data-model.md` §10: `User` is
   Restrict, `enabled = false` is the exit; §14 F2, F5). Rows for switched-off accounts read dimmed "Off". A person posted out (archived) keeps his account and
   reads "posted out" beside it (§13 Q3).
3. **Access while waiting** — a switch: "Let people waiting for approval read the programme", off by default, with the
   line: "When on, anyone who signs in before an admin approves them can read View-only Sched. They cannot see who is
   absent, and cannot change anything."

**Guard rails** (each refused with its reason on screen): your OWN account's role, puck and switch cannot be changed by
you ("Another admin changes your own account") — no admin can lock himself out mid-session; the LAST switched-on admin
cannot be demoted or switched off; two accounts can never share a sign-in or a puck.

**The badge (D204):** while requests are pending, the Admin tab carries a count pill (desktop nav), the Users rail entry
carries it, the phone drawer's Admin entry carries it, and the phone's ☰ carries a dot (the tab lives in the drawer on a
phone, so without the dot the phone admin would never see it).

---

## 6. The guest (D204's admin switch)

Only while the switch is ON and his request is PENDING. The `Shell` with:
- the nav: View-only Sched only; `setPage` refuses every other page for a guest (the page is the gate, never the nav —
  6 Aug); the Leave War is not pre-warmed; the Tracker never mounts;
- the top bar: no bell, no Insights, no sync chip; the badge reads "Guest"; Logout;
- a banner under the bar: "Waiting for an admin to approve your access — you can read the programme meanwhile."
  with "My request" (opens the waiting screen's details) — the same banner on a phone;
- View-only Sched: no working-copy peek on a published day (the day head's picker, `VWORK`); **no Unavailable block**
  (absences are personal — who is away and why is not for someone not yet approved; §13 Q4); no "you" puck (he has none);
- nothing he can press writes: every write gate asks `may(...)`, and a guest may nothing but his own request.

---

## 7. Who did it — every stamp names the callsign (D166 (5))

| Stamp | Today | After |
|---|---|---|
| `HOOKS.whoami()` → the edit log (`logEdit`/`logAction`) → History list, History bubble, the pending list's "who" | "Admin" / "Squadron member" | the signed-in callsign |
| Bug reports' author, and Help's "mine" (`r.who === whoami()`) | the account label — every member saw every member's reports as his own | the callsign — "mine" is his own |
| Tracker marks and dates (`rec.by` via `peoplewire`) | the account label | the callsign |
| Leave War `approvedBy` (`approverName`) | the View-as person — "Ranger" by default, whoever the admin was looking as | the admin's own callsign (the viewer is now the signed-in person) |
| Leave War bid-replaced notice (`byWho`) | a member's View-as callsign | the member's own callsign (unchanged code — it follows `ME`) |
| Unpublish `by` | the View-as person id | the signed-in person id (unchanged code) |
| The command envelope's actor | `id` = 'ad'/'us', `personId` = View-as | `id` = the account id, `personId` = the signed-in person |

**Not recorded today and not added here** (filed on `[DB-READINESS]`/`[DB-STEP]` as the audit columns the database gives
for free — `createdBy`/`modifiedBy`): who decided a Leave War bid or moved it, who uploaded a medical document, who
filed an input. D79/D82's "who gave each award and when" is already on an award (`approvedBy` + its date) and becomes
right with this change.

---

## 8. One place answers "may this person do this?" (D200 (3))

- **`src/state/permissions.ts`** — pure data and one pure function, no imports: `PERMISSIONS` (one row per table group
  of §11: Admin, Member, Member-own ops, the own-row key, and the Waiting table) and `allowed(role, op, table, isOwn)`.
- **`auth.ts may(op, table, owner?)`** — the one binding to the session: the role from `SESSION` (`'admin'` → admin;
  `'guest'` → waiting; anything else → member — so the probe bridge's `'member'` and the account's `'main'` both read
  as member), `isOwn` from `owner === ME` (for `AccessRequest`, `owner === SESSION.user`); no session → **false**, and
  the existing gates keep their "a sessionless test/boot context is not gated" shape where they had it.
- **The gates that now call it** (each a mechanical swap, same meaning):

| Gate | Becomes |
|---|---|
| `canEditSched()` (~190 callers — the schedule, drafts, templates' openers, the Admin page) | `may('U','ScheduleWeek')` |
| `lgCanEdit()` (Logic) | `LGEDIT && may('U','Setting')` |
| the Inputs own-row gates (`inputedit` edit + delete, `InputsPage` buttons, `caldrag`, `DocViewer`) and "choose who it is for" | `may('U'/'D'/'C','Input', r.person)` |
| the four admin editor sheets (Duty, Day, Wave templates; Drafts) | `may('U','Setting')` / `may('U','DayDraft')` |
| Quals: archive ✕, Restore, + Add person, Edit quals columns | `may('D','Person')`, `may('U','Person')`, `may('C','Person')`, `may('U','Setting')` |
| Quals: a row's cells (D149, new) | `may('U','Person', id)` — see §9 |
| Logic page edit, the traffic popup, Admin page, the Shell's admin-only tabs, the drawer | `may(...)` on the table each one writes |
| Admin → Users | `may('U','User')` |
| `leavewar/sync.ts` restore gate; `leavewar/inputgate.ts` `adminLogin` | `may('U','Person')`; `may('U','Input')` (admin = any row) |

- **Left on their own role, deliberately:** the Leave War's gates (`stages.ts canEditRow`/`canDecide`/`canEdit`, its
  store's ~60 checks) run on the war's own role and viewer, set through the one seam (`lwSetRole` from `resetSession`;
  the viewer mirrored from `ME`); an **agreement test** drives `canEditRow`/`canDecide` for admin/member × own/other ×
  each stage and asserts each answer equals `allowed(…,'LeaveBid',…)`. The undo timeline's `mayReverse` reads the
  command actor (D148), not a table. Bug reports are memory-only (no table) — Help's "admin sees all" stays a role
  check, named in the allowlist below.
- **The drift test** (`src/state/permissions.test.ts`): reads `docs/data-model.md`, finds §11's two tables (their cells
  are now strict — `C R U D` letters or `—`, with an "Own row is…" column and a Notes column), and asserts
  `PERMISSIONS` equals them in BOTH directions (every §11 row in the module, every module row in §11, every cell
  equal). A test that fails when the two disagree — the ruling's own words.
- **The ratchet** (same file): no production file outside `state/auth.ts`, `state/permissions.ts` and the Leave War /
  Tracker / command / undo internals compares `SESSION.role` itself; the named exceptions carry their reason in the
  test (Help's bug reports). A new raw role check anywhere else fails the gates — so the one place stays one place.
- **§11 rewritten** in the strict shape with the D200 corrections: `Person` member own `U` (every column, D149);
  `QualMark` own `C U D`; `User` admin `C R U D` (D = switch off; a never-used account may be removed), member own `R`
  (an account is tied to one callsign — D166); **`AccessRequest`** (new, §3 entity added) admin `C R U D`; `EditLog`
  admin `R D` (D = Admin's "Clear edit history", 25 Aug 26 — the table said R only), **member `R`** (D169, a medical
  input's details excepted); `LeaveLedger`/`LeaveOpening`/`LeaveCounter` note: an OIL award is written by admins
  only, who gave it and when kept (D79, D82); `Setting` note: the guest switch. **The Waiting table:** `AccessRequest`
  own `C R U`; the ScheduleWeek family, `Amendment`, `Signoff`, `Person` `R` only while the guest switch is on;
  everything else nothing.
- The bug-check order's D202 paragraph then reads: the test carries it — update §11 AND `PERMISSIONS`, and the drift
  test fails until both agree.

---

## 9. D149 on the Quals page

- `qualsTable` gains the viewer's own id: with editing on, a **member's** own row is editable in every column
  (callsign, CAT, SXO, SCHEDULER, SANS, every qualification, initials, flight, remarks) and every other row renders
  exactly as with editing off; an admin's every row is editable (unchanged).
- Every write handler on the page (the qual cell click, CAT, initials, flight, remarks, callsign rename) refuses a
  non-own row for a member **before** touching `PEOPLE`, with the toast "You can change only your own row" — the
  write-path backstop for state poking, like the Inputs page's.
- Tests, per column, both ways (own row changes and persists; another row refused and unchanged; an admin changes
  both) — through the page's real handlers.

---

## 10. The roll-call — every place identity is drawn or decides something

The THING: the signed-in person (his account, his puck, his role). Columns: SHOWS the right thing · the gesture WORKS
(or is refused) · what else is PAINTED there. Filled at the walk (evidence sheet §2); the plan lists the rows.

| # | Surface | What must be true |
|---|---|---|
| 1 | Sign-in page | every §3 state; wrong password message; no credentials hint |
| 2 | Request access screen (desktop, phone) | his sign-in read-only; callsign + name; Send; Sign out |
| 3 | Waiting screen (pending / declined / switched off) | the right words per state; Change my details / Ask again; Sign out |
| 4 | The guest programme (switch on) | View-only Sched only; banner; no Unavailable; no VWORK peek; no bell/Insights; phone drawer holds only it |
| 5 | Top bar (desktop) | no View as; inert badge (Admin/Member/Guest); Admin tab badge |
| 6 | Phone drawer | no View-as chips; "Signed in as …"; Admin entry badge; ☰ dot |
| 7 | Admin → Users: Requests | approve (needs a puck), decline, role, the no-account puck list |
| 8 | Admin → Users: Accounts | add; defence mail / role / puck / on-off per row; own-row and last-admin refusals |
| 9 | Admin → Users: Access while waiting | the switch, off by default, persisted |
| 10 | The purple "you" puck (week, board) | on the signed-in person's puck only |
| 11 | Inputs page | a member lands on his own; files for himself only; edits/deletes only his own |
| 12 | Inputs calendar | the + seeds him; drags only his own chips |
| 13 | Medical document viewer | "mine" = his own |
| 14 | Quals page | D149 — own row editable, every column; others read-only; admin all |
| 15 | Leave War grid | his row is his account's; bids only on his own row; the "you" chip; the counter headline |
| 16 | Leave War award / grant | "approved by" = the admin's callsign |
| 17 | Edit history list + History bubble + pending list "who" | the callsign |
| 18 | Help: bug reports | author = callsign; "mine" is his own |
| 19 | Tracker marks | stamped by the callsign |
| 20 | The bell | his own alerts (OIL question for HIS inputs) |
| 21 | Logic page | editing admin-only |
| 22 | Undo | a member undoes only his own changes — own = his signed-in callsign now (D148's admin half and the sign-out clear are the change-recording build's, not this one's) |

**The door check** (every action the data allows → its control, in every state): add account · approve · decline ·
ask again · change my details · change role · change puck · switch off · switch on · remove (never used) · turn the
guest switch on / off · sign out from each waiting screen · sign in as each §3 state. Each walked at both widths.

**The orders:** add an account then sign in as it; request then approve then sign in; request then decline then ask
again then approve; approve then switch off then sign in; switch the guest switch on while a request is pending, then
sign in as him; demote an admin then sign in as him; change a member's puck then sign in (he is the new puck, his old
inputs are not his); reload between each.

---

## 11. Tests (written red first where they pin a change)

- `state/accounts.test.ts` — every §3 answer; sanitising stored junk; uniqueness; the guard rails; approve/decline/ask
  again; the defaults are never written until a change; editing the sign-in; the no-admin fallback.
- `state/permissions.test.ts` — the drift test (both directions), the ratchet, `may()` per role/table/own, the Leave War
  agreement test.
- `ui/login.test.tsx` — the sign-in outcomes through the real form; `App` routes to `Waiting` / guest shell / Shell.
- `ui/waiting.test.tsx` — request, change details, declined → ask again, switched off, sign out.
- `ui/adminusers.test.tsx` — the three blocks, every refusal, the badge (tab, rail, drawer, ☰).
- `ui/qualsown.test.tsx` — D149 per column, both roles, page and write path.
- `ui/guest.test.tsx` — the nav, `setPage` refusal, no Unavailable block, no VWORK, no LW prewarm, every page gate.
- Existing tests that drove the removed controls (`roletoggle.test.tsx`, the View-as lines in `session.test.ts`,
  `bell.test.ts`, `inputs.test.tsx`, `caldrag.test.tsx`, `docviewer.test.tsx`, `audit-guards-inputs.test.tsx`,
  `WaveTplModal.test.tsx`, `tracker.test.tsx`, `command-auth.test.ts`, the Leave War viewer tests): each read; where it
  pinned the toggle or the picker itself it is rewritten to pin their absence; where it used them only to set up a
  person or a role it switches to the real setters (`resetSession` with an account, or `setMe` in a unit test).
- e2e: `step4-leavewar.spec.ts:320` (the only one driving `#viewAs`) moves to `raptorMe`; one new spec walks sign-in →
  request → approve → sign in at both widths.
- Walk scripts (`scripts/handpass/`) are historical evidence, not gates: the 8 that touch View as / the badge are left
  as they are and named in the evidence sheet.

---

## 12. Documents, in the same change (D201, D29 — no trims inside this code change)

`docs/engine-rules.md` §Auth / roles (rewritten: accounts, the states, the guest, the one place; the roles table's
Quals row); `docs/data-model.md` §3 `User` (sign-in = defence mail, `personId` required and unique, no password) +
`AccessRequest` (new) + §11 (strict, corrected) + §12 Q3 (the request route beside the admin mapping step);
`docs/data-schema.md` (the three new settings keys; "the 11 durable settings keys" becomes 14); `docs/handover-dataverse.md`
(the accounts plan, both join routes, the Teams notice, "the four demo accounts are deleted, never imported", the
guest switch as a `Setting`); `docs/ui-contracts.md` (the sign-in states, the waiting screens, Admin → Users, the
guest); `docs/feature-impact.md` (the accounts row: which surfaces read the signed-in person); `docs/file-map.md`
(new files, `users.ts` gone); `raptor-port/CLAUDE.md` (the Login line: four demo accounts, `us` is now Torch; the Leave
War row "the View as person" → the signed-in person); `.claude/rules/decisions/leave-war.md` §Architecture (the viewer
mirrors the signed-in person); `.claude/rules/decisions/scheduler.md` D104 (marked: overtaken by D166 — the accounts
arrived); `docs/bug-check-order.md` §5 (the D202 paragraph points at the test); `OUTSTANDING.md` (`[ACCOUNTS]` status,
`[QUALS-MEMBER-SCOPE]` archived as built, `[DB-READINESS]` gains the two records, `[DB-STEP]` gains "delete the demo
accounts; Microsoft sign-in replaces the screen; Teams notice on a request"); `HANDOFF.md` (this chat's block).

---

## 13. Questions for him — the agent's call is built, stated here so he can correct it

1. **`us` is now Torch, not Ranger.** A puck has one account, and Ranger is the admin's (`ad`). Signing in as `us`
   shows a member's view as Torch — his inputs, his Leave War row.
2. **The password.** The app never checks a password in the real thing (Microsoft does). In this prototype `ad`/`a` and
   `us`/`us` keep theirs; an account an admin creates takes any password, and so does a sign-in name on no account (it
   lands on Request access). Not security — it never was.
3. **A posted-out man keeps his account** until an admin switches it off (the list marks him "posted out").
4. **The guest sees no Unavailable block** — who is away, and why, is personal; everything else on View-only Sched he
   can read, and nothing on a published day's working copy.
5. **An admin cannot change his own account** (role, puck, switch) — another admin does it. Stops a lock-out.

---

## 14. Red team — findings and what was done

**Fable 5.1** (`docs/superpowers/specs/2026-09-26-accounts-plan-fable.md`, read blind): 17 findings — 4 high, 8 medium,
5 low. Every one is taken; where this section and an earlier one disagree, **this section wins** (it is the later
word). **Astra**: its brief is the same file; it runs on the owner's PC — its findings will be added here when back,
and nothing is reported ready for "merge live" before they are dispositioned.

| # | Finding | What the build does instead |
|---|---|---|
| F1 high | D148 is not "no code change": today ANY admin undoes ANYONE's change, and two admin accounts make that live | **Built here** — accounts make a ruling's breach reachable, so it is this work's: `mayReverse` = the SAME ACCOUNT only (a member's entry also only on his own records); the undo list clears at sign-out (D148's second sentence). The e2e tests that pinned an admin undoing a member's cell are rewritten to undo as the actor who made it. D148's third half (refuse and say who when someone else changed the same thing since) stays with the change-recording build — checked at the build whether it already exists |
| F2 high | `lastSignInAt` makes every member a writer of `User` | **Dropped** with "Remove only if never used" (F5 makes it unnecessary): the only way out for an account is switching it off; its sign-in name and puck are editable, so a typo or a mistake is corrected, never stranded. No sign-in writes anything |
| F3 high | the drift test never runs on a docs-only edit to §11 | The table's data lives in ONE JSON file (`src/state/permissions.json`) that the app imports AND `scripts/docsize.mjs` reads: the drift check runs in the Docs guard (every PR, every push, no install), at the end of every turn (the Stop hook), and in vitest |
| F4 high | the test measures §11 ↔ module, not module ↔ app; three cells already disagree with the app | `GATES` in `permissions.ts` names the op and table each non-schedule gate claims (settings, edit history, inputs, people…); `canEditSched()` stays the named alias for the true schedule writers; a ratchet test fails any `may(` call whose op and table are not a cell of the table. §11 corrected: `Amendment` admin D = Unpublish withdraws the latest version (kept, marked); `Signoff` admin U D on the working copy, append-only once issued; `LeaveBid` member own D while open |
| F5 medium | a changed defence mail leaves a man with no working account | the sign-in name is editable per row (unique; a pending request under the new name is resolved) |
| F6 medium | approved while reading as a guest → stuck | the app upgrades him in place the moment an enabled account carries his sign-in ("Your access was approved") |
| F7 medium | the Leave War's "no viewer = every row" escape | `canEditRow` for a member needs a real viewer equal to the row; the e2e helper that left the war unscoped scopes it to the member it drives |
| F8 medium | a demoted / switched-off account keeps its powers until it signs out | `may()` reads the LIVE account (its role and switch) on every call; switched off → no rights, and the app shows the switched-off screen |
| F9 medium | stored junk with no working admin locks everyone out | the loader falls back to the demo accounts (not saved) when no switched-on admin is left, and says so; a save that would leave none is refused |
| F10 medium | the ratchet is easy to walk round | an IMPORT rule: only named files import `SESSION`; everyone else asks `signedIn()`, `may()`, `ME`, `whoami()`. `LOGINROLE` and `canToggleRole` deleted; the probe's `raptorRole` becomes `setRoleForTest` (localhost only) |
| F11 medium | §11 not buildable by IT in three places | a **Waiting** role in its own table (a principal with no `User` row), reading `Setting` always and the programme only while the guest switch is on (the server checks the switch); `User` own row = the principal; `EditLog` medical details column-secured like `Input` remarks; a Notes column the parser ignores |
| F12 medium | tests the plan did not list; `rulecheck` | a bare `{user, role}` session is the TEST shape (the person stays the boot default); a real sign-in passes the account. The listed tests are read and fixed; each ruling built here is named in a test title |
| F13 low | Approve is two commands | one `settings.accounts` command writes both records |
| F14 low | the guest's screen: three unnamed places | `Waiting` renders alone (no overlays); the Leave War pre-warm bails for a guest; the drawer holds View-only Sched and Logout only |
| F15 low | `whoami()` for a guest; "mine" by display string | a guest's whoami is his sign-in; a bug report stores the account id and "mine" compares ids |
| F16 low | roll-call rows missing | added to the walk: Admin → Data, the admin view toggles, the "Set default order?" offer, Unpublish's `by`, the replaced-bid notice's words, the Quals "Save changes" toast (its prototype words replaced — `[QUALS-PROTO-TOAST]`, the page is open anyway) |
| F17 low | doc and comment consistency | the defence mail is recorded on the ACCOUNT (not the person) everywhere; `User.personId` required; the stale comments named are fixed |

**Fable's owner questions**, folded into §13's list for his look (the built answer first): an account always needs a
puck (a non-flying scheduler is added as Personnel); a guest sees no warning list either (the reasons can name an
absence); `saber`/`outlaw` take any password; a declined person may ask again without limit.
