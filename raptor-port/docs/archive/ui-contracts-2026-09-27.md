# Passages moved out of raptor-port/docs/ui-contracts.md on 27 Sep 26 ([ONE-DOOR], D310)

Moved WHOLE by `backlog-archive.mjs --move` (D138): what a newer ruling replaced. The live contract is in
`raptor-port/docs/ui-contracts.md` (Admin → Users — one door).

## Quals' Archived list — Rename, Restore, "he's back" (`[POST-OUT-OUTCOMES]`, 27 Sep 26 — D284, D286, D295, D299)

> **Moving (D310, 27 Sep 26 — his "one door as proposed, Quals loses archive"):** this list, its Restore, Restore as and
> Rename, and Quals' ✕ archive move to Admin → Users with `[ONE-DOOR]`; until that is built, the app does what follows.

A DELETED man is on no list, the Archived one included (D299). Each archived row carries, for an admin: **Restore**, and
**Rename** (`#qRenameCs` / `#qRenameGo`, refused with the one callsign rule's reason in `#qRenameErr` — blank, over 14
letters, or taken by a man on the roster; D295). **Restore meeting a callsign a roster man now holds** never renames
anyone by itself (D286 (1)): the row opens "<callsign> is taken — give him another callsign." with a box
(`#qRestoreCs`) filled with the first free "<callsign> 2", **"Restore as …"** (`#qRestoreGo`) and Cancel; a refusal
reads in `#qRestoreErr`. **The "he's back" prompt (D284):** after a Restore, an Undo post out that restores, or an Enable
on Admin → Users, a line above the table — "<callsign> is back — quals and CAT as he left them." — with **Check his
quals** (his seat view, his row outlined `.back-hl`) and **Later**; lined up with the table's left edge (D294 (3)). It
changes nothing; a session list (`state/view.ts BACKPROMPT`), cleared at every sign-in.

- **`#admUsers` Users — the ACCOUNTS** (`[ACCOUNTS]`, 26 Sep 26 — D166 (1), D204; `ui/UsersPanel.tsx`). Replaces the
  old Manage-users list (`#userList`, `state/users.ts` — it drove nothing and is gone). Four blocks, top to bottom:
  **Waiting for access** (`#admWaiting`, one `[data-req]` row each: the sign-in name, "asked as <callsign> · <initials
  · Pilot/WSO/Personnel · CAT> · <when>" — `requestSummary`, blank parts dropped; **Approve** `[data-approve]` opens
  PERSON — "On the roster" `#apvModeRoster` | "New person" `#apvModeNew` (`[ACCOUNTS-NEW-PERSON]`, D214) — **New person**
  the default when the typed callsign is nobody's: the four fields `#apvCs` / `#apvIni` / `#apvSeat` / `#apvCat` in two
  columns, filled from what he gave, the note `#apvNote` "Filled from what he gave when he signed up — change anything
  before you give access.", then "Add person and give access" `#apvGo` (one command: the person, his account, the request
  answered); **On the roster** the default when it is someone's: the picker `#apvPid` (people with no account, not
  archived, not ALL / ALL AVAIL) NEVER pre-picked (D204), the note naming the matched person by his callsign (one who
  already has an account — archived or not, the account is checked FIRST: says so, names that account's sign-in, says he
  can't be picked here and names both ways out: him on a new sign-in → change that account's sign-in under Accounts,
  which answers the request (archived: "and restore them on the Quals page if they are back" — said, never done for
  him, Restore wipes his posting-out window); the signed-in admin's OWN account → "another admin must change its
  sign-in", his row being locked to him; someone else → New person with another callsign or name — Fable's code read
  #1, both fix checks; an archived one with no account: restore on Quals first, or New person if it is someone else), then
  "Give access"; the role `#apvRole` either way; Cancel `#apvCancel` discards edits —
  the next Approve starts again from the request; within one open, each half keeps its entries; **Decline**
  `[data-decline]`), or "Nobody is waiting for access." (`#admNoWaiting`); **Accounts** (`#accList`, one
  `[data-acct]` row each: sign-in name over the live callsign, the role pill, tags "archived callsign" / "switched off" /
  "you"; a tap (`.acc-tap`) opens its editor `[data-editing]` — sign-in name, callsign (its picker keeps the account's
  own person even once he is archived — never a blank "Pick…" over a hidden value; Astra's fix check #2), role, Save / Switch off-on /
  Cancel — except his OWN account, whose row is disabled; its picker reads "Callsign/Name", D219); **Add an account**
  (`#accAddBlock`: the sign-in `#accAddName`, then PERSON `#accModeRoster` | `#accModeNew`, default On the roster — **the
  ONE door for a new person**, D217: **On the roster** = the picker `#accAddPid`, the role, "Add account"; **New person** =
  the four fields `#accAddCs` / `#accAddIni` / `#accAddSeat` / `#accAddCat` and the mock-up's note — with a sign-in, the
  role and "Add person and account" (the person and his account in one command); with the sign-in BLANK, no role and "Add
  person" (a roster-only person — someone who won't use the app, a SANS man); the form clears back to On the roster);
  **Guest view** (`#admGuestView`, a checkbox, OFF by default). The words: "Callsign/Name" on every picker and field (D219),
  "Pilot" / "WSO" / "Personnel (ground crew)" (D220); a callsign/name over 14 letters is said under its box (`…CsLong`) and
  refused, never cut (D226); initials never required (D225). Every refusal toasts its reason (at least one admin keeps
  access; never your own account; one person one account; one sign-in name one account; the one callsign rule). The
  rail's Users entry and the Admin tab (`#admWaitBadge` top nav, `#drawerWaitBadge` drawer) carry the count waiting.
  **Opening it from elsewhere** — the bell's access alert and Quals' "+ Add person" call `ui/adminopen.ts openAdminUsers`,
  which sets `state/view.ts ADMINOPEN` (`{ seq, newPerson }`); the Admin page is its ONE consumer (keyed on `seq`, so it
  works when the page is already up on another category): Users chosen, on a phone drilled in, and `newPerson` handed to
  the Users panel, which chooses New person, scrolls the form into view and focuses the Callsign/Name box on a desktop.
  A sign-in or sign-out clears a pending one (`VIEW_RESET`). The Users panel is told `shown` (Users chosen, and on a phone
  drilled in) — the bell's "seen" (§The top bar carries the bell).

## Admin → Users — Suspend / Enable, Delete account (`[POST-OUT-OUTCOMES]`, 27 Sep 26 — D285, D287, D300)

The account editor's buttons read **"Suspend" / "Enable"** (was "Switch off / on") and **"Delete account"**; a suspended
row is tagged "suspended". "Delete account" asks twice — "Tap again to delete <callsign>" with a line naming what goes
(his account and his person; days he flew keep his puck) — never on one's own account, never the last admin who can sign
in; a man archived on Quals says so beside it. **Enable** is one of the two "he's back" acts (D284): it arms the Quals
prompt below. The sign-in of a suspended account reads "Your access is suspended — Ask an admin to enable it when you're
back." (said once).

