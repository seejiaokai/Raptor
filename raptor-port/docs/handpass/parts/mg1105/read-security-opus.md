# Member / guest check — the security read (fresh, blind Opus, D1411 — 5 Nov 26)

Saved whole for `docs/handpass/2026-11-05-member-guest.md`. The reader read commit `80b04e175` (the walk and probe
committed, no app change yet), was told nothing of the host's conclusions, and was asked only for holes in who may do or
see what — a member (or an admin in his member view), a guest or a pending person reaching a write, and one person seeing
another's data beyond §11 — with the demo-data exclusion (D56), D785 and the ruled reads (D211, D213, D215, D218, D1510,
D169, D1008) in its brief. Its F1 was reproduced red by the host and fixed (the evidence sheet §Findings).

---

SECURITY READ — who may do or see what. Commit 80b04e175, read-only. I changed no file and ran no test.

I found one confirmed hole. It is a read-side leak, low to medium consequence. I found no route by which a member, a guest or a pending person writes the schedule or anything else §11 does not grant. The negatives below carry the evidence.

## FINDINGS (most consequential first)

### F1 — The change-log batch names a person waiting for access by his sign-in name (defence mail), and every member and guest may read it (low–medium, CONFIRMED by reading)

- **Who:** any member or guest, reading the `ChangeBatch` table. §11 (data-model.md:1558) gives member C R and guest R, and the table is "read by every screen's 30-second check". Today no screen draws batches, so this shows at the database step, where the server enforces §11 as written.
- **Route:**
  1. A pending person presses "Request access" on AccessScreen. That runs `requestAccess` (accounts.ts:425–446), which commits `access.request`.
  2. `deriveActor` (command/actor.ts:33) sets `actor.id = SESSION.user`. For a pending session that is `principal:<sign-in name>` (accounts.ts:302).
  3. The whiteboard wrapper records `actorId: String(info.actor?.id ?? 'system')` (state/changebatch.ts:82).
  4. The sealed batch `{ type:'access.request', actorId:'principal:<mail>', items:[{table:'settings', key:'accessreq:<id>'}] }` (changebatch.ts:69–70) is stored beside the request.
- **What it reveals:** the sign-in name of everyone asking for access, and when they asked. §11 gives members and guests nothing on `AccessRequest` (data-model.md:1553), and its "own" rule hides the name even from other waiting people. The batch hands that same name to every member and guest. It also contradicts §11's own User row (member reads his own account only).
- **This is not stored data only:** the app does it again for every new request (D56 does not apply).
- **Fix:** never write a principal into `actorId`. In changebatch.ts:82 use `actorId: info.actor && (info.actor.role === 'pending' || info.actor.role === 'guest' || info.actor.role === 'off') ? info.actor.role : String(info.actor?.id ?? 'system')`. The batch only needs to say a waiting person acted; the request row names him for admins.
  - Add a unit test: commit `access.request` as a pending session, then assert the sealed batch's `actorId` holds no `@`/sign-in name.
  - Add a line to data-model.md §11's ChangeBatch row: "actorId is a User id, or the bare role for someone without an account — never a sign-in name".

### Q1 — Already filed, not new: a member's choice of Leave War period is saved as a shared Setting

- **Route:** `selectWar` (leavewar/state/store.ts:6182) calls `persistNotify`, which commits `lw.edit` and writes the `lw.current` change to the shared row `current` (rows.ts:145). The ownership check lets it through on purpose (perms.ts:1200), but §11 gives members R only on Setting.
- **Where it stands:** filed in OUTSTANDING.md:1272 for group B. It is never honoured at boot, so it is harmless in one browser today.
- **Consequence at the database step:** either the server refuses a member's period switch, or one member's switch moves the period everyone opens on. Keep it on the group-B list. No new filing needed.

### Note (not a finding — the agreed stand-in)

`signIn` (accounts.ts:271–282) checks a password only for seeded accounts (`SEED_PASS`). Any account an admin creates opens with any non-empty password typed beside its name. This is the D166 (2) stand-in for the organisation's sign-in ("the app never keeps a password"). It holds only while the app sits behind Vercel's sign-in. Say so plainly before any wider hosting trial (D1532).

## NEGATIVES — checked, no route found

**1. Gate at commit, fail closed.**
- `authorize` (command/permissions.ts:66–72) refuses an unregistered type.
- `cmdAuthorize` (perms.ts:588–598) refuses an unmapped type, refuses `off`, and requires every `more` table.
- Every `sched.*` type is admin-only by its row, e.g. `sched.sign`/`sched.publishAL` on Amendment C (perms.ts:440, 443). A member, guest or pending actor is refused at authorize, whatever surface sent the click.

**2. A board edit made outside a command.**
- `afterSchedMutate` wraps the edit in `sched.mutate` (sched-commit.ts:808). The gate lets a member open it (it is under the Input row's own-row rule).
- `ownershipViolation` then refuses any schedule record for a member (perms.ts:680, 1131).
- The rollback restores the store's lagging baseline (commit.ts:293–300; commit.ts:384–396 notes `capture()` is the baseline), so the in-memory edit is undone too.

**3. Guest, pending, off: they change nothing.** perms.ts:1122–1127 refuses every change except a pending person's single new `accessreq:` row under his own name, made by `access.request`.
- `requestAccess` refuses a second request and takes the name from the session, never from a typed box (accounts.ts:427–429).

**4. Edit Schedule cannot be reached by a member.**
- The nav tab is `hidden` for non-admins (Shell.tsx:377, 395); the drawer filters by admin (Drawer.tsx:26, 33).
- `setPage` has no role check, but no member route reaches 'editsched' or 'admin':
  - Login's reopen allows only leavewar/tracker (pagedownload.ts:77, 98).
  - The undo landing adds 'editsched' only when `canEditSched()` (undo-wire.ts:248). A member never holds an admin step: `mayReverse` refuses, timeline.ts:504–507.
  - `switchRoleView` moves off editsched/admin (store.ts:504–507).
- `#page-editsched` stays mounted but hidden by CSS. Its week renders read-only once `canEditSched()` is false (html.ts:785, 1347, 2304).

**5. Delegated handlers re-check role and page before any change.**
- Right-click clear: Shell.tsx:240, 262.
- Accept input: interactions.ts:992. Load version: 1562. Templates: 1658. Plan menu: 1679. Sign-clear: 1693.
- Plan menu body: board.ts:1806. Drop: drag.ts:201. Board opened by keys: interactions.ts:925.
- Traffic window: members get a read-only list (Modals.tsx:204–215).
- ALL AVAIL window's earn switch: AvailWindow.tsx:90, 260.

**6. History lines.** A line given outside a command is held. The next command adopts it before authorize (commit.ts:236 begin hooks), and a refusal drops it. A line with no command goes through the system door. I found no member-reachable `logAction` that lands without its own change: the AvailWindow line is gated, and `logReversed` is written only after a successful undo.

**7. Settings written directly.** The write hook throws for typed keys outside their command (mission role, SANS calendar, flying plan, members' switch). It writes raw only for keys that are not records — the history's `elog:` rows, written inside their command or door (people-settings-commit.ts:344–351).

**8. Direct browser storage.** Every other `localStorage`/`sessionStorage` write is a view preference on this one device: board side width, Inputs calendar fold, Manning fold, the reopen note.
- Documents are add-only (state/docs.ts:90).
- The Leave War writes rows only from the command stream (leavewar/state/store.ts:1636–1642). A standalone war edit runs as `lw.edit` under the member checks (store.ts:1689–1708).
- The old war-only undo (`lwUndo`/`historyApply`) is called by nothing.

**9. The week load.** The `sched.load` landing writes no row (persist.ts:322, 340). A member's or guest's week change saves no schedule rows.

**10. Probe bridge.** Installed only when the hostname is localhost, 127.0.0.1 or ::1 (main.tsx:53, probe-bridge.ts:60–63). Never on a deployed host.

**11. Role and session changes.**
- `resetSession` closes windows (`resetViewState('session')`), clears the undo list (store.ts:450) and sets the war's role.
- The App re-checks the session on every repaint (App.tsx:39–43, accounts.ts:515–527). It turns off a suspended, archived or deleted account and rebuilds a changed role or person.
- The admin's member-view switch keeps his undo list, but `mayReverse` refuses his admin steps while in member view (timeline.ts:474, 504–507). The actor is worked out at each commit, so a window left open writes only as the role now in force.

**12. Guest tree.** It mounts no Shell, board, editor or document-wide listeners (App.tsx:66, GuestApp.tsx). A published day shows the issued face only, with no version picker (html.ts:268, 401). No day panel, warning list or Traffic button (html.ts:1704, 1786, 1824, 1885).
- Medical shown to a guest is pinned by D213/D215. A guest's view of an unpublished working day matches what a member sees (D215).

**13. URL.** Only `?fresh=1` (an empty in-memory demo world, storage/boot.ts:66) and debug flags. Neither grants anything over saved data.

**14. Ownership coverage.** Every collection the store knows has a case in `ownershipViolation`. The default lets through only the Tracker (D121); `trk.flex` stays the admin's.
- `lw.cell`, `lw.balance`, people (callsign, Management, archive and delete marks), notices, settings own-rows and the input rules (`inputBreach`, perms.ts:880–1000) each tie a member to his own records, his filings for others, or a verified replay.

## NOT SETTLED, AND WHAT WOULD SETTLE IT

- **The system passes** (the OIL pass `runOilPass`, the war sync, the posting pass) run in every browser, a guest's included, as the system actor, and nothing asks them. I found no way for a member or guest to change what they write: every reachable in-memory change is either gated before it happens or rolled back to the baseline when refused. A full proof needs every handler that changes `DAYS` or `INPUTS` without a following command listed. A grep for direct assignments to DAYS/INPUTS fields in `src/ui/`, each checked for a role gate ahead of it, would settle it.
- **F1's fix** should be checked for every session that is not a User. Today only `pending` writes; `guest` and `off` change nothing. One unit test, as given under F1, settles it.
