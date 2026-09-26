# Red team — the `[ACCOUNTS]` plan, Fable 5.1's read (26 Sep 26)

**Read blind** (bug-check order §4): Astra's report was not seen. **What was read:** the plan
(`docs/superpowers/plans/2026-09-26-accounts-plan.md`), the rulings the brief names (D165, D166, D173, D180, D200,
D202, D203, D204; D149, D169, D104, D148; D79, D82; D121; `OUTSTANDING.md` `[ACCOUNTS]`, `[UNDO-ROSTER-SETTINGS]`),
every code file the brief lists, plus the readers those files led to (`state/view.ts`, `state/reports.ts`,
`state/plan.ts`, `state/sched-commit.ts`, `undo/timeline.ts`, `command/permissions.ts`, `leavewar/state/store.ts`,
`ui/QualsPage.tsx`, `ui/InputsPage.tsx`, `ui/inputedit.tsx`, `ui/html.ts`, `ui/Modals.tsx`, `ui/HelpPage.tsx`,
`ui/logout.ts`, `main.tsx`, `storage/reset.ts`, `.github/workflows/deploy.yml`, `scripts/rulecheck.mjs`), the
docs (`data-model.md` §3 `User`, §7, §10, §11, §12; `engine-rules.md` §Auth / roles; `handover-dataverse.md`;
`bug-check-order.md` §5; `data-schema.md` §Accounts), and a grep of every test, e2e spec, probe and walk script for
the symbols the plan removes or renames. Nothing was run; the machine was left alone.

**The short verdict.** The plan is sound in shape — three settings keys, one `may()`, the guest as a fourth role,
`us` becoming Torch. It has **four findings that change the build** (F1–F4), all of them about the two rulings the
plan leans on hardest (D148 and D200), and a set of medium dead ends and misses. Nothing found says "do not build
this"; everything found says "not quite as written".

**Severity:** HIGH = a ruling broken, a lock-out or dead end, or the one-place test silent where it must fire ·
MEDIUM = a real defect a walk would find, or a promise the plan makes that the code will not keep · LOW = a miss
the builder should know about; no user harm on its own.

---

## 1. Findings, most severe first

### F1 — HIGH — D148 is NOT "no code change": today any admin may undo anyone's change, and the plan makes that live

**Plan text:** §1 "Undo reverses only your own changes (D148 — its 'own' becomes the signed-in account's, with no
code change)"; §8 "The undo timeline's `mayReverse` reads the command actor (D148), not a table."

**The code:** `src/undo/timeline.ts:348-356`:
```
export function mayReverse(entry, cur) {
  if (cur.role === 'admin') return true          // ← any admin reverses anything
  return entry.actor.role !== 'admin' && cur.personId != null &&
         entry.actor.personId === cur.personId && entry.owners.every(...)
}
```
D148 (his words, 24 Sep 26, answering his own two-admin case): *"Undo reverses only your own changes … it never
undoes another person's change. If someone else has since changed the very same thing, Undo refuses and says who."*
Today the first line is invisible because every admin is the same actor (`SESSION.user = 'ad'`). The plan ships two
demo admins (`ad`, `saber`) and real admin accounts after them.

- **Setup:** sign in as `ad`, move a puck on Edit Schedule, sign out; sign in as `saber`.
- **Action:** press Undo (top bar).
- **Expected (D148):** refused — "it was someone else's change"; the puck stays.
- **Disproof of correctness:** the puck moves back; the label read "Undo — …" for `ad`'s change.
- **The other half:** the e2e suite pins the OPPOSITE behaviour — `e2e/leavewar.spec.ts:4256, 4276, 4292` set
  `raptorRole(page, 'admin')` precisely so an admin's Undo reverses a MEMBER's cell ("login actor admin for
  mayReverse"). Those three tests, and `:3974`, `:4228`, will go red under D148 and are not in the plan's §11 list.

**Fix, step by step:**
1. `src/undo/timeline.ts` `mayReverse`: delete `if (cur.role === 'admin') return true`. Replace the body with:
   `cur.id != null && entry.actor.id === cur.id` (same account) — and keep `entry.owners.every(o => o.person == null ||
   o.person === cur.personId)` ONLY for a non-admin actor (an admin's own edit to someone else's input is still his
   own change). Comment: D148, 24 Sep 26, the two-admin case.
2. `src/command/actor.ts` `deriveActor`: `id` becomes the account id (`SESSION.acct`), not the sign-in name — the plan
   already says so (§7 last row); make sure `systemActor()` keeps `id: 'system'` so a projection is never "yours".
3. `src/undo/undo.test.ts` (or the file that pins `mayReverse`): add "an admin cannot reverse another admin's entry"
   and "an admin CAN reverse his own entry on a member's input"; name D148 in the test title (`rulecheck`).
4. e2e: the five `raptorRole(page, 'admin')` undo tests in `e2e/leavewar.spec.ts` — rewrite each to undo AS THE ACTOR
   THAT MADE THE CHANGE (log in / `raptorMe` as that member), or make the change as the admin in the first place.
5. Check `resetSession` against D148's second sentence, *"the list clears when they sign out"* — I did not find the
   timeline being cleared there (the edit log is, `elogClear()`; the undo timeline was not looked for beyond that).
   If it is not cleared, clear it in `resetSession` (a hook in `state/undo-wire.ts`), else the next person's Undo
   button carries the previous person's labels even though every press is refused.

### F2 — HIGH — `lastSignInAt` makes every member (and the first sign-in of every new account) a WRITER of the `User` table

**Plan text:** §2 `Account.lastSignInAt?`; §3 "`lastSignInAt` stamped" on sign-in; §5 "Remove only for an account
never signed in"; §8/§11 rewrite: `User` — admin `C R U D`, member own `R`.

The stamp is a write to `settings/accounts` on every sign-in. Under the plan it goes `store.set('accounts', …)` →
the settings write hook → a `settings.accounts` command → the change stream, with the actor whoever `deriveActor()`
answers at that instant. Three things go wrong at once:

1. **§11 says a member may only READ `User`; the app has him UPDATE it on every sign-in.** The drift test cannot see
   this — it compares §11 to `PERMISSIONS`, not to what the code does. IT builds the security role from §11: at the
   database step the member's stamp is refused, so `lastSignInAt` stays empty for every account an admin created
   (they have no `pass`, so their first sign-in is the only thing that would fill it) — and **"Remove only for an
   account never signed in" then offers Remove on live accounts.** (Real defect going forward, not stored-data harm.)
2. **The actor is order-dependent.** If `signIn()` stamps before `resetSession(acct)`, `SESSION` is the OLD session
   (null after a logout → system actor; or the previous user on a shared browser) — the envelope names the wrong
   person. If it stamps after, the envelope is the member's — a member-authored write to accounts.
3. **Every sign-in adds an envelope** to the stream (harmless today, noise at the database).

- **Setup:** an admin adds account `torch2` (no password). **Action:** sign in as `torch2` with any password.
- **Expected:** the account row on Admin → Users loses its Remove button. **Disproof:** the command stream's last
  envelope is `settings.accounts` with actor `torch2` (a member writing `User`); or, at the database step, the stamp
  never lands and Remove stays.

**Fix, step by step (the system stamps, never the holder):**
1. `src/state/accounts.ts` `signIn()`: perform the `lastSignInAt` write BEFORE `resetSession(acct)` and with
   `SESSION === null` (call `authSetSession(null)`-equivalent state is already true after a logout; on a same-tab
   re-login call the raw setter first). Then `deriveActor()` answers `systemActor()` and the envelope is the
   system's. Comment why: the stamp is the sign-in's own record, not a user edit (§11).
2. `docs/data-model.md` §11 `User` row, Notes column: *"`lastSignInAt` is written by the sign-in itself (system /
   `createdby` = service), never by the account holder; member own R covers everything else."* And §3 `User`:
   same sentence beside the field.
3. The drift test's strict cell grammar must allow a Notes column per row (the plan already has one — make sure the
   parser ignores it for the equality check and the doc keeps it).
4. Alternative if the builder prefers no client stamp at all: drop `lastSignInAt`; make Remove available only while
   `enabled && !acct.everUsed`, where `everUsed` is set by the same system write — it is the same problem with a
   different name, so (1)–(3) is the honest route.

### F3 — HIGH — the drift test never runs on the change most likely to break it: a docs-only edit to §11

**Plan text:** §8 "A test that fails when the two disagree — the ruling's own words"; §8 last bullet: "the test
carries it — update §11 AND `PERMISSIONS`, and the drift test fails until both agree."

`.github/workflows/deploy.yml:43-56`: `paths-ignore: '**.md'` on push AND pull_request. A PR that edits only
`raptor-port/docs/data-model.md` (IT hands back a corrected role, someone fixes a cell) skips every gate; only the Docs
guard runs, and it checks sizes and filing, not permissions. So §11 and `PERMISSIONS` can disagree on `main` until
the next CODE PR happens to run vitest — which is exactly the silence D200 (3) exists to end.

- **Setup:** on a branch, change one cell in §11 (`Person` member `R` → `—`), commit, open a PR.
- **Expected:** a red check. **Disproof:** the PR shows only the Docs guard, green.

**Fix (pick one, (b) is cheaper and keeps docs-only PRs off the PC runner):**
- (a) `deploy.yml`: replace both `paths-ignore` blocks with `paths:` — `'**'`, `'!**.md'`, `'!.claude/**'`,
  `'!raptor-port/scripts/docsize*.mjs'`, `'!raptor-port/scripts/backlog-archive.mjs'`,
  `'!.github/workflows/docs-guard.yml'`, then `'raptor-port/docs/data-model.md'` LAST (a later positive pattern
  re-includes it). Same list in both triggers. Note it in `docs/gates-and-deploy.md`.
- (b) `.github/workflows/docs-guard.yml`: add a step, conditional on `data-model.md` being in the diff
  (`git diff --name-only origin/main... | grep -q docs/data-model.md`), that runs
  `cd raptor-port && npx vitest run src/state/permissions.test.ts`. ~1 billed minute, only when the table moves.
- Either way, `docs/bug-check-order.md` §5's D202 paragraph should say WHICH workflow runs the test on a docs-only
  change, or the next reader assumes the gates did.

### F4 — HIGH — "one place" as planned measures the wrong distance: §11 ↔ `PERMISSIONS` is checked, `PERMISSIONS` ↔ the app is not — and four cells already disagree with the app

**Plan text:** §8 the drift test (both directions, §11 vs the module) and the ratchet (no raw `SESSION.role`);
the gate table maps `canEditSched()` (~190 callers) to `may('U','ScheduleWeek')` "a mechanical swap, same meaning".

What the test proves: the module says what the table says. What it does not prove: that each `may(op, table)` call
guards the action the table cell describes. The mechanical swap makes this worse, because the ~40 callers of
`canEditSched()` that are NOT schedule writes would all claim `ScheduleWeek`:
`state/plan.ts` ×12 (correctly `ScheduleWeek` — `planningLayer` is a `ScheduleWeek` column, §3 line 326, fine),
`ui/inputedit.tsx:1442,1476` (`clearHistoryData` = planning pucks → `ScheduleWeek` U; `clearEditHistory` →
`EditLog` D), `state/view.ts:151,738,755` (`toggleLateOff`, `toggleWarnOff`, `toggleNotePub` — admin view toggles;
`ScheduleWeek` U is defensible, say so), `ui/board.ts:453` (`canMute`), `ui/SecDefaultSnackbar.tsx` ×4 (`Setting`
U), `ui/AdminPage.tsx` ×14 (`Setting` U / `EditLog` D), `ui/InputsPage.tsx:249,349` (a READ choice — `Input` R
others), `ui/InputsCal.tsx` ×4, `ui/caldrag.ts` ×4, `ui/DocViewer.tsx` ×2 (`Input`/`Attachment`), `ui/AvailWindow.tsx`
×2 (OIL earn switches → `LeaveLedger`? — the day's OIL evidence is a `ScheduleWeek` thing; decide and name it),
`leavewar/sync.ts:1393` (`Person` U), `leavewar/LeaveWarPage.tsx` ×1, `state/sched-commit.ts:567` (Unpublish —
see below).

And the table itself is already behind the app in three places the swap will not surface:
1. **`Amendment` admin `C R` "append-only"** — but Unpublish (`sched-commit.ts:567-571`, `unpublishDay`) RETRACTS
   the latest issued version. That is a soft delete of an `Amendment` row (the retraction itself kept — D101). The
   table needs admin `C R D` with a note "D = retract the latest version (Unpublish); the row is kept, marked
   withdrawn". `data-model.md` never mentions Unpublish at all (grepped).
2. **`Signoff` admin `C R` "append-only for everyone"** — the app lets an admin re-pick or clear a sign-off, and D103
   wipes all four on any pending change. That is `U`/`D` on `Signoff` by an admin (or by the store on the admin's
   command). Say which.
3. **`LeaveBid` member "C U own while open"** — `leavewar/state/store.ts:2149-2158`: a member clears his OWN request
   (`list.filter(r => !(r.kind === 'request' …))`) — a `D` own. Add it.

- **Setup:** build the plan as written. **Action:** run the drift test. **Expected:** green — and that is the point:
  it stays green while `Signoff`/`Amendment`/`LeaveBid` say something the app does not do, and while forty gates say
  `ScheduleWeek` for actions on `Setting`, `EditLog` and `Input`.
- **Disproof of correctness:** Unpublish a day as admin; §11 says `Amendment` has no `D`.

**Fix, step by step:**
1. `src/state/permissions.ts`: beside `PERMISSIONS`, export a `GATES` map `{ callSiteName: [op, table] }` for every
   NON-schedule gate named above (a dozen entries), and have each of those call sites use the named entry
   (`may(...GATES.clearEditHistory)`), so the table each gate claims is written once and readable.
2. Keep `canEditSched()` as a named alias `= () => may('U','ScheduleWeek')` for the true schedule writers (the
   week, the board, drafts, templates' openers, plan pucks) — do not rewrite 150 call sites — but hand-map the
   others listed above.
3. `src/state/permissions.test.ts`: a second ratchet — every `may(` call in `src/` (grep) passes an `(op, table)`
   that is a cell of `PERMISSIONS` (no invented tables, no `'ScheduleWeek'` where `GATES` names another).
4. `docs/data-model.md` §11: the three corrections above (`Amendment` D = retract; `Signoff` U/D by admin on the
   working copy, append-only once issued; `LeaveBid` member own `D` while open), and — since §11 is the list IT
   builds from — an "Unpublish" line in §3 `Amendment` ("a version may be withdrawn: soft-deleted, kept, marked").
5. The evidence sheet's roll-call (§10) gets a row per `GATES` entry (each is a door).

### F5 — MEDIUM — Dead end: a man whose defence mail changes can never get a working account (his puck is locked to a switched-off one)

**Plan text:** §2 `personId` unique across accounts; §5 the Puck selects list "the roster people with no account";
Remove only for an account never signed in; a used account is switched off instead; a switched-off account keeps
its puck.

- **Setup:** Torch (`ignite`) has account `torch@…`, has signed in. His mail changes (posting, rename, a new domain).
- **Action:** the admin switches `torch@…` off, then tries to add `torch2@…` for Torch, or approve Torch's new
  request. **Expected:** Torch gets a working account on his puck. **What happens:** `ignite` is not in the no-account
  list (the off account holds it); Remove is not offered (it signed in once); "Add account" refuses "puck already
  taken". No path exists.
- Same dead end for a **typo'd sign-in name discovered after the first sign-in**.

**Fix:** either (a) make the sign-in name editable per row on Admin → Users ("Defence mail" — `may('U','User')`,
uniqueness checked, the pending-request check applied) — one field, and it also fixes the typo case; or (b) let the
Puck lists offer a person whose only accounts are switched OFF (the new account takes the puck; the old stays off,
puck-less, for its audit trail — `personId` nullable on a disabled account, which §3 already allows). (a) is
smaller and needs no schema change; do (a), and say in §5.

### F6 — MEDIUM — Dead end: approved while reading as a guest, he stays a guest until he works out he must sign out

**Plan text:** §3 the session is `{ user, role: 'guest', acct: null }`; §6 the guest programme; `App` routes on the
request's status.

- **Setup:** guest switch ON; `newguy` has a pending request and is reading View-only Sched as a guest.
- **Action:** an admin approves him (account created, request removed).
- **Expected (D204: "the first sign-in has that access at once"):** he is now Torch-equivalent with his tabs.
- **What happens:** his `SESSION.role` is still `'guest'`, `ME = ''`; the request is gone, so on the next notify
  `App` routes him to `Waiting` — which now has NO pending request and NO account in the session to show. Depending
  on the builder's branch order he sees "Request access" again (he could file a second request under his own,
  now-taken sign-in — refused) or an empty state. Nothing says "approved — sign in again". Declined mid-look has the
  same shape but a correct screen (the plan covers it).

**Fix:** in `App.tsx` (or a `useEffect` in `Waiting`): when `SESSION.role === 'guest'` and `accounts` now holds an
ENABLED account whose `signIn === SESSION.user`, call `resetSession(thatAccount)` (upgrade in place — his session
was already that sign-in) and toast "Your access was approved". If the account is disabled, show the switched-off
screen. Add the order to §10's list: "request → guest switch on → sign in → approve while he reads → he becomes
his puck without signing out". Owner question Q5 covers the alternative ("sign in again").

### F7 — MEDIUM — the Leave War keeps its "no viewer = every row is yours" escape into the accounts era, and the plan's agreement test would have to hide it

`src/leavewar/engine/stages.ts:144-146`: `canEditRow(role, viewer, personId) = role === 'admin' || viewer === null
|| personId === viewer`. The comment says production never reaches null because the View-as picker always names a
person. After the plan, a member ALWAYS has a person (ME = his puck) and a guest has `''` (never equal to a person id
— good), so `null` should mean "you own no row", not "you own every row". It is reachable: `w.lwSetViewer(null)` is on
the probe bridge without the localhost gate (`probe-bridge.ts:140`), and `viewer` is `null` from LW boot until the
sync's first `setViewer(ME)`.

- **The test consequence:** the plan's agreement test asserts `canEditRow` equals `allowed(role,'U','LeaveBid',own)`.
  For `viewer === null`, `canEditRow` says true and `allowed(member, …, own=false)` says false. The builder must
  either special-case null (hiding the escape) or fix the function. Fix it.
- **The e2e consequence:** `e2e/app.ts:203-216` `openLeaveWar(page, 'user')` leaves the war UNSCOPED on purpose
  ("the member edits whatever row a mechanics test drives") — 4 tests in `e2e/leavewar.spec.ts` use the default. They
  rely on the escape and are not in the plan's list.

**Fix:** `stages.ts canEditRow` → `role === 'admin' || (viewer != null && personId === viewer)`; rewrite the
comment (the identity is the signed-in account's person; null = not scoped = no row); `e2e/app.ts openLeaveWar`:
default `viewAs` to a real member id (e.g. `'slipway'`) or switch those 4 tests to `lwRole(page,'admin')`;
`src/leavewar/viewer.test.ts:24,29` (the mirror is null before boot) stay as they are — they test the mirror, not
the permission. Add the D166(4) test: a member with viewer `X` cannot write row `Y`, at the store's write path.

### F8 — MEDIUM — a demoted or switched-off account keeps its powers until it signs out, because `may()` reads the session's snapshot, not the account

**Plan text:** §8 `may()` takes the role from `SESSION`; §5 guard rails protect the WRITER (own account untouchable,
last admin), not the TARGET.

Pre-database this is one browser, so the only live case is two tabs of the same browser (settings are localStorage
with no storage-event listener): tab A (admin `ad`) switches `saber` off; tab B (`saber`, signed in earlier) keeps
`SESSION.role === 'admin'` and every `may()` says yes until he signs out. At the database step the server enforces
it, but the plan's §11 promises the browser MIRRORS the server, and here it does not.

- **Setup:** two tabs, `ad` in one, `saber` in the other. **Action:** in `ad`'s tab switch `saber` off; in `saber`'s
  tab move a puck. **Expected:** refused / the switched-off screen. **Disproof:** the puck moves.

**Fix:** `may()` resolves `SESSION.acct` against the live accounts list on each call (cheap: a Map rebuilt by
`accountsLoad`) and uses THAT row's `enabled` and `role`; no row (removed) or `enabled === false` → false, and `App`
routes to the switched-off screen on the next render. Keep the session's role only when `acct === null` (a guest)
or for the probe's `raptorRole` (dev/e2e). Add the two-tab order to §10 as "not walkable in one tab — unit test it:
`setSession(saber)`, then `accountsSave` disabling saber from another actor, then `may()` false".

### F9 — MEDIUM — the loader accepts a stored list with no switched-on admin; nothing then says how anyone gets back in

**Plan text:** §2 the loader drops bad entries, dedupes, "untrusted storage never throws out of boot"; §5 the last
admin cannot be demoted or switched off.

Checked: every UI write comes from an admin who cannot change his own row, so no sequence of clicks — even across
stale tabs — writes a list without at least one enabled admin (the writer is always in it). What remains is stored
junk (a hand-edited or half-written `settings/accounts`, a future role rename, a future loader that validates
`personId` against `PEOPLE`) and it is a total lock-out: no sign-in, and no admin to approve a request. The plan
names no way back.

**Fix:** (1) `accountsLoad`: after sanitising, if no entry is `enabled && role === 'admin'`, append the demo admin
(`ad`) and toast once "No working admin account was found — the standard admin was restored"; (2) `accountsSave`
refuses to persist a list with no enabled admin (belt for a future writer); (3) document the emergency door that
already exists: `?fresh=1` boots the memory backend with the demo defaults (nothing persists in that session) —
one line in `docs/gates-and-deploy.md` or `engine-rules.md` §Auth / roles. A unit test per (1) and (2).

### F10 — MEDIUM — the ratchet as described is easy to walk around, and it leaves a dead ceiling in place

**Plan text:** §8 "no production file outside `state/auth.ts`, `state/permissions.ts` and the Leave War / Tracker /
command / undo internals compares `SESSION.role` itself"; §4 "`LOGINROLE` stays".

- A regex on `SESSION.role` misses `const { role } = SESSION`, `const s = SESSION; s.role`, and the shape already in
  `store.ts:327` (`s.role === 'admin'` on the parameter). Twenty files import `SESSION` today; after the plan almost
  none need it — they need `may()`, `ME`, `whoami()`, and a `signedIn()` boolean (`App.tsx`, `reports.ts:49`, the
  five "sessionless test/boot context is not gated" backstops: `inputedit.tsx:931,1324`, `sync.ts:1393`,
  `QualsPage.tsx:470`, the four modals).
- `LOGINROLE` has exactly one reader, `leavewar/inputgate.ts:319` (`adminLogin`), and the plan replaces that reader
  with `may('U','Input')`. A ceiling nobody reads is an invitation to the next `LOGINROLE === 'admin'` outside the
  ratchet's regex.

**Fix:** (1) make the ratchet an IMPORT rule: only the allowlisted files may `import { SESSION }` from `state/auth`;
export `signedIn()` from `auth.ts` for the boolean; (2) delete `LOGINROLE`, `canToggleRole`, `setEffectiveRole`'s
"ceiling" comment, and give `raptorRole` (probe) a plain `setRoleForTest` in `auth.ts` guarded by the same
localhost check; (3) keep the `SESSION.role` regex too — two cheap lints beat one.

### F11 — MEDIUM — §11 as rewritten is not yet buildable by IT in three places

**Plan text:** §8 "§11 rewritten in the strict shape" — the Waiting table's "`R` only while the guest switch is on";
`User` member own `R`; `EditLog` member `R` "a medical input's details excepted".

1. **A permission that depends on a `Setting` is not a Dataverse security role.** Write it as IT can build it: a
   third role, **Waiting**, held by any signed-in principal with no `User` row; its read privilege on the
   `ScheduleWeek` family / `Amendment` / `Signoff` / `Person` is granted or revoked when the admin flips the switch —
   either the app calls a small API that assigns/unassigns the role, or the switch is a server-checked `Setting` and
   the Waiting role's privilege is unconditional on paper with the server gating the query. Say which in the Notes,
   and say the Waiting role reads `Setting.guestview` (today's Waiting table gives it no `Setting` read at all, so a
   server cannot even answer "may this guest see the programme").
2. **Own-row for `User` is the PRINCIPAL, not the person:** `signInName = my principal`, not `personId = my
   person` — the Own-row column must say so, or IT will write the wrong ownership rule.
3. **`EditLog` member `R` with medical excepted** needs the mechanism named, as the `Input` row already does for
   remarks: column-level security on the log's detail text where the referenced input is medical, or a server-side
   redaction. One sentence.
4. **The strict shape must keep a Notes column** the parser ignores — F2, F4 and (1)–(3) all live there.

### F12 — MEDIUM — tests, scripts and one gate the plan's §11 list misses

Grepped every `*.test.*`, `e2e/*.spec.ts`, `scripts/**`, `probes/**` for the removed symbols. Beyond the plan's list:

| What | Where | Why it breaks | What to do |
|---|---|---|---|
| `ACCOUNTS.ad/us` shape pinned | `src/ui/app.test.tsx:51-54` | `ACCOUNTS` deleted | rewrite against `state/accounts.ts` defaults (`ad`/`a` admin Ranger, `us`/`us` member Torch) |
| The Manage-users list (`USERS`, `#userList .urow`, add/remove) | `src/ui/odds.test.tsx:14,139-152` | `users.ts` deleted | delete the block; the new `adminusers.test.tsx` covers the list |
| `#userAdd` absent for a member | `src/ui/admin.test.tsx:58` | id gone | pin the new panel's root instead |
| whoami stubs | `src/tracker/people.test.ts:53` (`'Squadron member'` as a stub string), `editlog.test.ts:33`, `audit-a-editlog.test.ts:38` | harmless (stubs) | leave |
| 23 unit-test files sign in as `us`/`main` (or `resetSession({user:'user', role:'main'})`) and touch Ranger (`bane`) | `session.test.ts`, `command-auth.test.ts`, `inputgate.test.ts`, `scenarios-rules.test.ts`, `plan.test.ts`, `store.test.ts`, `warnmute.test.ts`, `tracker.test.tsx`, `amendbatch.test.tsx`, `audit-e-halfday-surfaces.test.tsx`, `audit-guards-inputs.test.tsx`, `availwin.test.tsx`, `board.test.tsx`, `boardaddinput.test.tsx`, `caldrag.test.tsx`, `docviewer.test.tsx`, `inputs.test.tsx`, `inputscal.test.tsx`, `interact.test.tsx`, `quals.test.tsx`, `unavailedit.test.tsx`, `wipe.test.tsx`, `e2e/geometry.spec.ts` | only if `setSession`/`resetSession` with a bare `{user, role}` stops leaving `ME = 'bane'` | decide it in `auth.ts` and write it down: a bare `{user, role}` is the TEST shape (ME untouched — boot default `bane`); `resetSession(acct)` is production (ME = `acct.personId`). Then only the tests that log in through the real form change |
| Member reaches a read-only board via `setPage('editsched')` + `openScheduler(0)` | `e2e/geometry.spec.ts:2442-2540` | only if the builder makes `setPage` refuse MEMBERS too (the plan says guests only) | keep the refusal guest-only; say so in `view.ts setPage`'s comment |
| Unscoped member Leave War tests | `e2e/leavewar.spec.ts` ×4 (`openLeaveWar(page)` default) | F7 | see F7 |
| Admin undoes a member's cell | `e2e/leavewar.spec.ts:3974,4228,4256,4276,4292` | F1 | see F1 |
| `#viewAs` | `e2e/step4-leavewar.spec.ts:320` | the plan has it (`raptorMe`) | — |
| Reference probes that log in as the member | `reference/probes/audit2.js`, `reference/probes/logic.js` (via `probes/run.cjs:33-35`'s `'user'→'us'` rewrite) | `us` is Torch now; if either assumes Ranger's inputs it drifts | read both once; they are not gates |
| `npm run rulecheck` | `scripts/rulecheck.mjs` — a ruling no test NAMES fails the gate | new rulings D149, D165, D166, D200, D202, D204 (and D148 if F1 is built) | put the D-number in at least one test title each, or the baseline grows and the gate goes red |
| Walk scripts | `scripts/handpass/` — 9 files, not 8 (`trk-w3-17-member`, `seat-surf-06-member`, `trk-w1-j-roles`, `trk-w3-03-halves`, `am/w2-05-unpublish-plans`, `am/w2-06-phone-head`, `am/w2-02-plans`, `am/w3-lib`, `am/mk-handoff-accounts`) | historical, as the plan says | name all nine on the evidence sheet |

### F13 — LOW — Approve is two commands, so a failure between them leaves a half-approved state

`people-settings-commit.ts:239-242`: each `store.set` outside a command opens its OWN `settings.<key>` command.
Approve = `accounts` write + `accessreq` write = two envelopes; a throw or quota failure between them leaves the
account created and the request still pending (the admin sees a request he cannot approve — "sign-in taken" — and
must Decline it by hand). **Fix:** `commitSettings('settings.approve', () => { raw accounts; raw accessreq })` —
inside a command the hook writes raw (`isCommitting()`), so one envelope, one rollback. Same for "Add account"
resolving a pending request.

### F14 — LOW — the guest's screen: three places the plan promises but does not name

1. `App.tsx:23` renders the overlays (`SchedBoard`, `InputEditor`, `DocViewer`, the template modals, `AvailWindow`)
   as siblings of the `Shell` whenever `SESSION` is truthy. For `Waiting` render `<Waiting/>` ALONE. (Checked: the
   board paints only on `editsched`, so `w.openScheduler(0)` from the console shows nothing to a guest once
   `setPage` refuses — a negative, but the sibling list should still not mount for him.)
2. The Leave War pre-warm is `Shell.tsx:117-134` (the idle poll → `setPrewarmed(true)`); add the guest bail at the
   top of that effect. `lwEverRef`/`trEverRef` need nothing (the page never becomes `leavewar`/`tracker`).
3. `Drawer.tsx`: for a guest the nav holds View-only Sched only; ALSO drop "Week insights" (the desktop bar drops
   Insights — keep the phone equal; `computeInsights` lists no absences, checked, so this is consistency not
   leakage) and make the Account row read "Guest" (he has no callsign).

### F15 — LOW — `whoami()` for a guest and for an account whose person is gone; "mine" by display string

Define `HOOKS.whoami()`: an account with a live `PEOPLE[personId]` → its callsign; a guest → the sign-in name (he
writes nothing that stamps, but `fileReport` would); an account whose person is missing → the sign-in name (say so
in a comment). `state/reports.ts:52` and `HelpPage.tsx:72` compare `r.who === whoami()` — with accounts, store
`personId` (or the account id) on the report and compare that; a callsign is a label (14 Sep 26) and can change
mid-session. Memory-only data, so LOW — but the same string comparison is what the plan's §7 row promises to fix.

### F16 — LOW — roll-call (§10) rows that are missing

Add: **Admin → Data** (clear old clutter — `ScheduleWeek` U; clear edit history — `EditLog` D); **the admin view
toggles** (drop a LATE chip `toggleLateOff`, mute a warning `toggleWarnOff`/board `canMute`, publish a note
`toggleNotePub`); **"Set default order?" snackbar** (`Setting` U); **Unpublish's `by`** (now the signed-in person);
**the Leave War's replaced-bid notice wording** — `inputgate.ts:320-321` says "your bid" vs "Torch's bid" and "an
admin" from `LOGINROLE`/`ME`, so it changes with this build; **the Quals page "Save changes" toast** still reads
"(prototype — writes to Dataverse in the full build)" — pre-existing production-copy breach (25 Aug 26 rule), one
line while the page is open.

### F17 — LOW — document and comment consistency the plan's §12 does not list

`docs/handover-dataverse.md:50-55` and `data-model.md:999-1001` say the admin "records that person's defence mail
address ON THE PERSON"; the plan (rightly, per §3 `User`) records it on the ACCOUNT linked to the person — align
the words. `data-model.md` §3 `User.personId` is "no" (optional; "an admin who does not fly") — the plan makes it
required (Q2). `src/leavewar/engine/stages.ts:114-146` and `:133-138` comments describe "View as";
`src/leavewar/LeaveWarPage.tsx:45` names `toggleRole`; `src/ui/Shell.tsx:300-303` still says the Tracker's File
menu is the admin's (stale since D121) — fix while the file is open; `docs/data-schema.md:326-331` (§Accounts and
session) describes `ACCOUNTS`/`USERS` — rewrite with the three keys and the durable-keys count.

---

## 2. Explicit negatives — what was checked and found nothing

**Area 1 — missing call sites.** Every reader of `ME` in production code: `view.ts:719-720` (the bell key —
`''` is a valid key), `actor.ts:29`, `Shell.tsx:282,389` (`oilPendingFor('')` returns `[]` — `sync.ts:688`),
`InputsCal.tsx:278`, `highlights.ts:97` (`''` never equals a puck — no purple puck for a guest, as planned),
`InputsPage.tsx:225,249,349,804,1107` (`PEOPLE[ME] ? … : String(ME)` already guards a missing person; the
person filter `fPerson === ''` shows nothing, not everything — `:702`), `DocViewer.tsx:67`, `inputedit.tsx:806,
931,1324`, `caldrag.ts:88`, `inputgate.ts:320-321`, `sync.ts:1424,1433`. None assumes `PEOPLE[ME]` exists without a
guard except the LW `approverName()` (`?? 'admin'` fallback) — fine. Every reader of `SESSION.role` is listed in F4/
F10 and in the plan's own gate table; the four modals and the five write-path backstops keep the "sessionless is
not gated" shape, which `may()` returning false with no session would BREAK if swapped naïvely — the plan says
they keep it; the builder must not "simplify" them. `HOOKS.whoami` (`store.ts:747`) is the one edit-log seam;
`peoplewire.ts:45` blanks `'Unknown'`. `USERS`/`addUser`/`delUser`: only `AdminPage.tsx` and `odds.test.tsx`.
`ACCOUNTS`: `Login.tsx`, `store.ts:749`, `app.test.tsx`. `toggleRole`/`canToggleRole`/`setEffectiveRole`:
`Shell`, `Drawer`, `store.ts`, `probe-bridge.ts`, `roletoggle.test.tsx`, `WaveTplModal.test.tsx`. Nothing else.

**Area 2 — a member or guest reaching more.** Every durable write funnels through a `canEditSched()` /
own-row gate or the LW store's `state.role` checks (`~60`, grepped); the command layer's permissions are `anyone`
(`sched-commit.ts:609`, `people-settings-commit.ts:232-233`) by design, so the UI gate IS the gate — unchanged by
the plan. The probe bridge's un-gated `w.setPage`, `w.openScheduler`, `w.setSlotVal` are pre-existing console
reach on one browser's own data, not this plan's. The board paints only on `editsched` (`view.ts:468-473`), the
Tracker mounts only on its page, the Leave War only on its page or the pre-warm (F14). Keyboard: `routeKeyDown`
edits only in `editMode()`; Ctrl-Z goes through `mayReverse` (F1). The Inputs page for a guest is unreachable once
`setPage` refuses, and would show nothing if reached (`fPerson === ''`). `computeInsights` lists no absences. The
`AvailWindow` has no opener on the view week (`html.ts` — no `data-availwin`).

**Area 3 — lock-outs and dead ends.** The guard rails hold under stale tabs (the writer is always an enabled admin in
what he writes, and cannot touch his own row) — no click sequence reaches zero admins; only junk does (F9). Other
sequences checked and fine: request → decline → ask again → approve; add account over a pending request; remove a
never-used admin (the remover remains); a posted-out man keeps his account (Q3); guest switch off → the waiting
screen; reload → sign in again lands on the same request (keyed by sign-in). The two dead ends found are F5 and F6.

**Area 4 — the rulings.** D166 (1)–(5), D204 (both routes, the badge, no puck claimed by a typed callsign, the
switch off by default), D149 (every column incl. callsign, SXO, SCHEDULER — the plan does not carve any out), D169
(member `R` on `EditLog`, medical excepted), D200 (1)–(3), D202, D203/D173/D180 (the order), D121 (no Tracker
role), D79/D82 (an award's `approvedBy` + date — `counters.ts:75`, `oiltracker.ts:118`), D104 (marked overtaken —
D201 satisfied by §12). No contradiction found except D148 (F1). The plan's §13 questions are the right ones; the
ones it missed are §3 below. `stages.ts canEdit`/`canDecide` and the 27 Aug / 21 Sep rulings on the war are
untouched by the plan — correct.

**Area 5 — persistence.** The three keys ride `SETTINGS_KEYS`; `store.set` outside a command opens a
`settings.<key>` command (`people-settings-commit.ts:239`); `restoreSettings` writes `null` for a key missing from
an older snapshot and `store.get` returns the default for `'null'` (`hooks.ts:148-153`) — a rollback lands on the
demo defaults, not on junk; the loader runs in `initStore` AFTER `hydrate(wb)` (`main.tsx:52-53`), so `PEOPLE` is
real if the loader ever validates `personId`; the schema reset (`storage/reset.ts:55`) clears `inputs`, `weeks`,
`leavewar` and KEEPS `settings` — accounts survive a version bump, which is right; `?fresh=1` boots the memory
backend with defaults; settings are outside the undo cutover (`undo-wire.ts:145`, `[UNDO-ROSTER-SETTINGS]`), so the
plan's "an account switched off is not something Ctrl-Z should bring back" holds today — record in
`[UNDO-ROSTER-SETTINGS]` that when settings DO join the timeline, `accounts`/`accessreq`/`guestview` stay out.

**Area 6 — the one place.** The drift test as described (both directions, strict cells) is a real test of §11 ↔
module; its gaps are F3 (when it runs) and F4 (what it measures). The Leave War agreement test is the right idea;
F7 is its one trap. `may()`'s role mapping (`'admin'` / `'guest'` / else member) covers the probe's `'member'` and
the account's `'main'`. `authorize()` (`command/permissions.ts:49-53`) short-circuits the system actor — 728/0
parity is safe because `deriveActor()` with no session is unchanged.

**Area 7 — tests and scripts.** The plan's own list is right as far as it goes (`roletoggle`, `session`, `bell`,
`inputs`, `caldrag`, `docviewer`, `audit-guards-inputs`, `WaveTplModal`, `tracker`, `command-auth`, the LW viewer
tests, `step4-leavewar.spec.ts:320`); the misses are in F12. The Tracker smoke logs in as `ad`/`a`
(`smoke.mjs:114`) and pins no `by` label; `probes/perf-port.cjs:84` logs in as `ad`; `e2e/app.ts login()` is the
one place the credentials live and needs no change while `ad`/`a` and `us`/`us` keep their passwords.

---

## 3. Questions for the owner — one line each

1. Two extra demo accounts are added (`saber`, an admin; `outlaw`, a member) and both accept ANY password — keep
   them, and passwordless, or give them demo passwords like `ad`/`us`?
2. Every account must belong to a puck: an admin who is not aircrew (a clerk who schedules) is first added to the
   roster as Personnel — OK, or may an account have no puck?
3. A guest on View-only Sched still sees each day's warning list, which can name a man beside a medical/SANS-type
   warning — hide the warnings for a guest too, or leave them (he sees no Unavailable block either way)?
4. When a man's defence mail changes, should an admin be able to change the sign-in name on his existing account
   (recommended — F5), or does he get a new account?
5. If an admin approves someone while he is reading as a guest, should the app switch him to his puck at once
   (recommended — F6) or tell him to sign out and back in?
6. D148 with real accounts: an admin may NOT undo another admin's change — the code today lets any admin undo
   anything; the fix follows your ruling unless you say otherwise (F1).
7. A declined person can "Ask again" without limit — fine, or should an admin be able to block a sign-in name?
8. "Remove" only for an account that never signed in; a used account is switched off instead — OK?
9. Once accounts exist, should the sign-in box accept only an email-shaped name (the add form says "Defence mail"),
   or any name as today (`ad`, `us`)?
10. Should a member be able to withdraw his own access request (today the plan gives him C R U, not D)?

---

## 4. For the evidence sheet (§10 additions, from this read)

Orders to add: F6's (approve while he reads as a guest); F8's two-tab demotion (unit test, not a walk); F5's
mail-change; "an admin undoes the OTHER admin's change — refused" (F1); "a member clears his own bid — allowed;
another's — refused" (F7); a docs-only PR touching §11 shows a red check (F3 — a gate walk, once).
