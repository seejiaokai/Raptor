# Plan — `[POST-OUT-OUTCOMES]`: a posting out says which it is; accounts suspended and deleted; the archived man's callsign; the admin's member view (D229, D280–D301), 27 Sep 26

Builder: Opus 5.5. Reviewers: Fable 5.1 and Astra — both, independently (permissions, deletion, persistence, the
published record, the Leave War's leave and OIL). Tier: **FULL**. Branch `claude/post-out-outcomes`, cut from
`claude/accounts-new-person` (PR #443, not yet merged — D301). Rulings this chat: D301 onwards (its range D280–D309).

**Status: DRAFT for red-team round 1.** The approved mock-up (D299, trimmed D300) is the design of record:
`raptor-port/docs/mock/post-out.html` (its pictures `docs/mock/img/post-out/*.png`, drawn by
`scripts/handpass/am/mk-post-out.mjs`; Artifact Version 6).

## What he ruled, in one paragraph

A posting out on the Leave War says **which** it is — four short chips, **"Overseas Sqn" · "Delete" · "SANS" ·
"Transfer to Sqn"** (D229, D294, D298) — and the app does it **on the date** (each can also be done by hand).
**Overseas Sqn:** archived on Quals and his account **suspended** (D280); back **as he was**, quals kept, with a prompt
to check them (D284). **Delete** (leaving flying for good): his account AND his person deleted (D287) — underneath a
**hidden "deleted" mark**, never erased (D290); **the past keeps its record of him, today and the future lose him**
(D297, D299 — the list in the mock-up's §5). **SANS** (another workplace, still flies with us): he becomes SANS on the
date; with Show SANS off the war still shows him posted out, untracked; with it on he joins the SANS group that day,
tracked (D283). **Transfer to Sqn:** later, with the shared database (D281, `[XFER]`). The account buttons read
**"Suspend" / "Enable"** and **"Delete account"**, the state **"suspended"** (D285). **An archived man's callsign may go
to a new person**; restoring him while it is in use needs one renamed — **renamed right on the Archived list, or on the
spot by Restore** (D286, D295). **An admin can switch himself to the member view and back** by tapping his name badge
(D292). **No Sign-up button** (D293 — nothing to build). **Each thing is said once, in few words**; the button reads
just **"Post out"**, and the same for **"Post in"** (D300). **Started before #443 merges** (D301).

## The rules sweep — every ruling that applies

| Id | Ruling (date) | What it demands of this build |
|---|---|---|
| D229 | a posting out has four outcomes and the admin says which; the app does it on the date as the archive does today; each can also be done by hand later (26 Sep) | §2 the outcome; §3 the date pass; §6 every posting door |
| D280 | an account can be suspended and enabled again, and deleted; suspend is today's "Switch off / on" (26 Sep) | §5 |
| D281, D282 | a transfer is future, with the multi-squadron database | the chip drawn and disabled (§6); nothing else |
| D283 | SANS on the date; Show SANS off: shown posted out, untracked; on: in the SANS group that day, tracked (26 Sep) | §7 |
| D284 | back from overseas as he was, quals kept; a prompt when the admin restores him / enables his account, with a way to his Quals row; it changes nothing (26 Sep) | §8 |
| D285 | "Suspend" / "Enable", "Delete account"; the tag "suspended"; the sign-in "Your access is suspended" (26 Sep) | §5 the words roll-call |
| D286 | an archived man's callsign may go to a new person; Restore refuses while it is taken, never renames by itself; a typed callsign finds the roster man; old schedules keep the archived man's days; the sign-up's "is archived — restore them instead" gives way; Approve opens on New person with a line (26 Sep) | §9 |
| D287 | leaving flying for good = account AND person deleted, gone from every list; asks twice, names what goes, cannot be undone; taken back = a new person (26 Sep) — narrowed by D297 | §4 |
| D288, D289, D296 | callsigns unique per community; a guest's orange corner — later, with `[XFER]` | nothing built; the database must not make a callsign unique across the app (unchanged) |
| D290 | the delete is a hidden "deleted" mark, the row kept, never erased (27 Sep) | §4.1 |
| D292 | tap the badge "SABER · ADMIN" ↔ "SABER · MEMBER"; in the member view exactly a member; every sign-in starts as admin; he stays himself; on a phone in the drawer's account line (27 Sep) — replaces D166 (3)'s "no preview" | §10 |
| D293 | no Sign-up button (27 Sep) | nothing to build |
| D294, D298 | the four chips "Overseas Sqn" · "Delete" · "SANS" · "Transfer to Sqn"; one line under them; "Delete" everywhere the act is named (27 Sep) | §6 |
| D295 | an archived man renamed directly on the Archived list; Restore meeting a taken callsign offers that box on the spot, rename + restore one step (27 Sep) | §9 |
| D297 | every day he already flew keeps his puck, published or not; days still to come lose him (pending on a published day); callsign free; old days show the old man (27 Sep) | §4.3 |
| D299 | a delete takes him out of today and the future; the past keeps its record (the stays/goes list); the mock-up approved (27 Sep) | §4 (the list, item by item — §4.6) |
| D300 | each thing once: the date in its box, one line, the button "Post out"; "Post in"; fewer words (27 Sep) | §6, §11 the words |
| D301 | started now, before #443 merges; its own branch; its merge after #443's (27 Sep) | this plan; §13 build base |
| D166, D204, D214, D217, D223 | accounts: one person one account; the sign-in's outcomes; the one door for a new person | every existing account guard holds; a deleted man who signs in again asks afresh |
| D149, D218 | a member edits his own Quals row, all but the callsign | member view obeys it; rename on the Archived list is admin-only |
| D200, D202 | one permissions module mirroring data-model §11, drift-tested | §12: `perms.ts` and §11 together |
| D201 | a new ruling fixes what the old one left behind | §14 the documents |
| D45, D103, D186 | nothing on a published day changes without the scheduler acknowledging it; a pending change wipes the sign-offs; a man's posting on his puck stays as published until the next AL | §4.3 (days to come read pending); §4.4 (a delete never makes a day he flew read pending) |
| D48, D142 | a day's OIL comes from its latest published version | §4.5 (a deleted man earns nothing on or after his date — D299's "goes") |
| D56 | demo data is not a finding | an older `poArchive` is read tolerantly (§2), nothing migrated |
| D78, D228 | parallel chats merge one at a time, the later takes `main` in first; heavy runs take the lock | §13 |
| 19 Aug 26 | the post-out's archive runs on the date itself; Restore clears the posting ("they are back") | §3, §8 |
| 7 Aug 26 (robustness) | a refused value never looks saved; every refusal says why | every refusal in §4–§10 |
| 25 Aug 26 | production words on screen | §11 |

## The design

### 1. What is kept where

- **The person** (`PEOPLE[id]`): a delete sets `deleted: true`, `deletedFrom: 'yyyy-mm-dd'` (the first day he is gone)
  AND `archived: true` — so every one of the ~20 roster filters that already hides an archived man (the Quals table,
  the crew palette, the Available crew and the day ⓘ, ALL AVAIL, the Inputs pickers, the account pickers, the sign-off
  boxes, the Leave War projection, the Tracker's bridge, insights) hides him with no change (the roll-call below checks
  each). Only the lists that DELIBERATELY show archived people add `!deleted` (§4.2).
- **The account** (`accounts` settings record `{ id, name, role, pid, on }`): suspend = `on: false` (the act "Switch
  off" named anew — D280). **New: `offBy?: 'po'`** when the Post out suspended it, so "he's back" re-enables only that
  suspension (the mirror of #444's `archivedBy: 'po'`). A delete REMOVES the account record (the sign-in is gone; at the
  database step it is the `User` tombstone).
- **The posting** (Leave War `postouts` record, laid on the projection by `setPeople`): `poArchive?: boolean` becomes
  **`poOutcome?: 'overseas' | 'delete' | 'sans' | 'none'`** and **`poDone?: string`** (the PO date the outcome ran for).
  The loader reads an older `poArchive: true` as `'overseas'` and `false` as `'none'` (tolerant, not migrated — D56).
- **The SANS the Post out made**: `sanBy?: 'po'` on the person when the SANS outcome ticked it, so Undo post out takes
  back only its own tick.

### 2. The outcome, and one line for each (D229, D294, D298, D300)

`OUTCOMES` (one list, `leavewar/engine/postout.ts`, new) — each: its chip, its line, whether it may run:

| Chip | Stored | The line (D300: said once, short) |
|---|---|---|
| **Overseas Sqn** (the default, as "Archive on PO date" is today) | `overseas` | "On 14 Oct: archived on Quals, account suspended." — no account: "On 14 Oct: archived on Quals." |
| **Delete** | `delete` | "On 14 Oct: deleted with his account. Days he flew keep his puck." — no account: "On 14 Oct: deleted. Days he flew keep his puck." |
| **SANS** | `sans` | "On 14 Oct: becomes SANS." |
| **Transfer to Sqn** | — | disabled; its title "Comes with the shared database" |
| (none chosen — tap the chosen chip again) | `none` | "On 14 Oct: off the manpower, nothing else." |

The date in the line is the PO date, day and month ("14 Oct"), from ONE formatter shared with the sheet.

### 3. On the date — the outcome pass (extends `runPoArchive`, on #444's version)

One pass, `runPoOutcomes` (the renamed `runPoArchive`, same triggers: boot, every Raptor notify, every Leave War
notify — so a date that has already come runs at once), over each posting with `to !== null`, `today > to` (today =
`localToday()`, the real clock — the clock the posting pass already uses; see §4.3 on the two clocks) and
`poDone !== <its PO date>`:

- **overseas** → archive (`archived`, `archivedBy: 'po'` — #444) and, if he has an account that is on, suspend it
  (`on: false`, `offBy: 'po'`).
- **delete** → the delete command (§4) with `from = max(PO date, today)`.
- **sans** → tick SANS (`san: true`, `sanBy: 'po'`) if not already.
- **none** → nothing (he is off the manpower through the posting window, as today).

Then `poDone = <PO date>`. **Each effect happens once; the app never undoes a later hand change** (an admin who enables
the account by hand while the posting stands is not suspended again — the reason for `poDone`). Changing the posting
(date or outcome) clears `poDone`, and #444's `postOut` rule extends: what the Post out made and the new posting no
longer makes today is taken back in the same command (the archive — #444; the suspension it made; the SANS tick it
made). A delete that has run is final (§4): its posting can no longer be changed (the Post out sheet of a deleted man is
not offered — he has no row after his date).

It is ONE command per posting (people + settings + the Leave War), a reconciler write as today's pass is (`[CMDL-FINISH]`
C10), so a half-applied outcome never persists.

### 4. Delete — the hidden mark; the past keeps him, today and the future lose him

#### 4.1 The command (`person.delete`, new — `state/person-delete.ts`)

`deletePerson(id, from)` — admin only (`mayDeletePerson()` in `perms.ts`); refusals, in the app's words: not a person /
a placeholder ("That is not a person"); already deleted; his own person ("You cannot delete yourself"); he is the last
admin who can sign in ("At least one admin must keep access"). ONE command enlisting **people, settings (`accounts`),
the schedule (the live week), the week stash, inputs, the Leave War and the planning calendar**, so it all happens or
none of it does, and — touching `people` — it is not undoable and blocks undo of any earlier change to the records it
touched (`undo/timeline.ts` — which is exactly what keeps an Undo from putting him back on a day). It:

1. marks the person (`deleted`, `deletedFrom = from`, `archived`) and rebuilds the callsign index (§9.1 — his callsign
   is free);
2. removes his account, if any (and an access request under that sign-in name, if any);
3. takes him off every day on or after `from` (§4.3);
4. deletes his inputs that start on or after `from`, and ends the day before `from` any input that spans it (its
   landed rows on the days it no longer covers go with it) (§4.5);
5. clears his Leave War records dated on or after `from` in every war, and sets his posting window's last day to the
   day before `from` if it is later or unset (§4.5);
6. removes his id from the planning calendar's pucks on or after `from`.

#### 4.2 Gone from every list, callsign free

- Hidden by `archived` already (no change — the roll-call walks each): the Quals table and its CSV, the crew palette and
  the board's crew, SANS avail, Available crew and the day ⓘ, ALL AVAIL (`availableFor`), the Inputs roster pickers and
  "+ Pucks", the account pickers (`linkablePeople`), the sign-off boxes (`signPeople`), the Leave War projection and
  qual catalogue, the Tracker's bridge, insights.
- **Adds `!deleted`:** the Quals Archived list; the Inputs "Posted out / archived" group (`archivedOptions`,
  `ArchivedGroup` — add form, filter, row editor); `pidProblem`; the Leave War's OIL tracker (`displayRoster` there
  skips a deleted man — "his OIL balance goes").
- The Leave War keeps his row the way it keeps a posted-out man's (the keep rule — a posting window), so **the months he
  was here show his leave and OIL, and the months after do not** (`rowInWindow`) — D299's "his past Leave War record, in
  the months he was here (as a posted-out man's today)" and "his Leave War row after he left" goes.
- A search, a typed callsign, the one add and a rename never resolve to a deleted man (§9.1).

#### 4.3 Days — which are "to come", and taking him off

**The clock.** The scheduler has no clock (demo `TODAY` 13 Jul 26); the posting pass uses the real one
(`localToday()`). A delete's `from` is **the later of its date and the real today**: a hand delete → today; a posting's
Delete that runs late (the app not opened on the day) → the day it runs. So a day he already flew is never touched, and
D299's "today and the future" includes today. (The demo weeks, 13 and 20 Jul 26, are all "already flown" by the real
clock — the walk builds its day to come in a later week.)

**Taking him off** every day whose date ≥ `from`, in every place a day lives (the working copy only — every published
version is a record and is never rewritten; on a published day the working copy then differs, so the day reads
pending and its four fall, as any change — D45, D103):

- **the live week** — through the funnel: every seat, duty holder and extras, sim seat / passengers / extras, ground
  `who`, programme `who[]` / extras holding his id → `setSlotVal(key, '')`; a ground row that CAME FROM one of his
  inputs → `unacceptInput` (the row goes with its input); his sign-off boxes → `setSign(di, role, '')`; his OIL-mode
  switches on that day (`oild.people` keys) cleared;
- **every stashed week** — the same, through `stashEditDays` inside the command (`weekstashStore` enlisted), on the
  days and the parked plans the blob holds (`d`, `dr`) and its sign boxes;
- **the parked plans of the live week** (`SCHED.drafts[di][k].d` and `.sign`) for days ≥ `from`;
- **the planning calendar's pucks** (`PLANPUCKS`) dated ≥ `from`.

**The belt — nothing puts him back on such a day.** A whole-day replacement that re-installs content is the one way a
deleted man could return: loading a published version onto the working copy and switching to a parked plan. Both go
through `rowsLeftOut` today (LOADLEFT, D175); it gains the rule "a deleted man on a day on or after his date is left out
— said in the load's message" (one function, `stripDeleted(day, iso)`, shared with §4.3's sweep). Undo cannot (the
delete blocks undo of every earlier change to the records it touched). A day template carries no crew. A copy of a day
(duplicate wave) copies what is on it — he is not on it.

#### 4.4 The past keeps its record — and a delete never makes a day he flew read pending

His puck on a day before `from` stays, published or not: `PEOPLE[id]` is kept (the hidden mark), so every day that
holds him still draws his callsign (and a new man who later takes "Vector" is a different id — old days still show the
old man, D297). **The published-face comparison** (`attrsOf`, D186) compares each man's `archived` on a published day —
so marking him archived would make every published day he flew read "1 pending · posted out". **Rule: a deleted man's
roster attributes are not compared on a day before his `deletedFrom`** (that day is the past; a delete does not change
it). On a day on or after it he is off the working copy anyway (§4.3), so that day reads pending for the removal — once.

#### 4.5 His inputs, his Leave War records, his OIL

- **Inputs** dated on or after `from` are deleted; one that spans `from` ends the day before (`endDate`, the remarks'
  "till" tail rewritten by `withRemarksTail`, `mod` = now) — inside the command, not through `commitInputEdit` (which
  refuses an input landed on a week not loaded; the command reaches the stash itself). Their documents stay stored
  (D299: how long medical records are kept is the organisation's rule, at the database step).
- **Leave War records** (requests, credits, notices) dated on or after `from`, in every war — a new store function
  `forgetPersonFrom(id, iso)` inside the command (the store's private `gesture` + `putList`, enlisting `lwStore`).
  His ledger grants and opening balances are records and stay (the OIL tracker no longer lists him — §4.2).
- **OIL:** the OIL pass pays from the latest published version (D48, D142) — a published day still to come that still
  carries him (pending, not yet re-issued) would credit him again. **Rule: a deleted man earns nothing on or after his
  `deletedFrom`** (`creditable` — `leavewar/sync.ts`). Credits before it are untouched (they need `PEOPLE[id]`, which
  stays).

#### 4.6 D299's list, item by item — where each is decided

| Stays (the past) | How |
|---|---|
| his puck on every day he already flew | §4.3 touches only days ≥ `from`; §4.4 |
| his past Leave War leave and OIL, in the months he was here | §4.2 (his row kept as a posted-out man's); §4.5 (records before `from` kept) |
| his past inputs and their documents | §4.5 (only inputs on/after `from` go; documents never deleted) |
| his signatures on published days | issued copies are never rewritten (§4.3) |
| the change history | the edit log is never touched |
| his Tracker record from courses he finished | the Tracker is not touched (§4.7) |

| Goes | How |
|---|---|
| his account | §4.1 step 2 |
| his Quals row, from every list and picker (Archived too) | §4.2 |
| his callsign (free) | §9.1 |
| every day still to come | §4.3 (+ the belt) |
| his future leave, bids and inputs | §4.5 |
| his OIL balance | the OIL tracker skips him (§4.2); nothing earned on/after `from` (§4.5) |
| his Leave War row after he left | §4.2 (`rowInWindow`, his window's last day) |
| his place on a course still running | **not built — §4.7** |

#### 4.7 The Tracker — not in this build (a question for him)

The Tracker has no "course still running" or "finished" — a course has students and marks, nothing that ends it. After
a delete his name stays on every course he was on, shown unlinked (as an archived man's today), marks kept; "Remove" on
the Students card takes him off by hand. **Filed `[POST-OUT-TRACKER]`** with the question: what makes a course "still
running" (the pace target end? a new "finished" mark on the course?). On the look card.

#### 4.8 The doors to a delete

- **Admin → Users**, the account editor: **"Delete account"** (D285) → **"Tap again to delete Hex"** with the line
  "Goes: his account, his Quals row, every day still to come. Days he flew keep his puck. Can't be undone." (the
  approved picture); the second tap runs `deletePerson(pid, today)`. Not on his own account (the editor is disabled
  there); refused for the last admin.
- **The Leave War's post-out sheet** with **Delete** chosen: **"Post out"** → **"Tap again to delete Hex"** (the
  second tap — D287 "asks twice"); it runs on the date (§3). This is also the door for a man with **no account** (a
  roster-only SANS man) — on the look card: there is no delete on Quals.
- The drag selection's PO and the existing posting's Post out sheet: the same chips and the same second tap (§6).

### 5. Suspend, Enable, Delete account — the words (D285, D300)

- The editor's `#accEdOnOff` reads **"Suspend"** / **"Enable"**; toasts "Hex suspended" / "Hex can sign in again".
- The row's tag **"suspended"** (was "switched off"); its tooltip "…suspend the account if they have left" → "Suspend
  while he is away; delete when he leaves flying".
- **`#accEdDel` "Delete account"** (new, danger style) beside Enable/Suspend, then the second tap (§4.8).
- The sign-in screen `#accessOff`: **"Your access is suspended"**, body **"Ask an admin to enable it when you're
  back."** (D300 — the picture as approved).
- The words roll-call (bug-check order §6): every on-screen "switched off / Switch off / Switch on" in `src` (listed in
  the map: `AccessScreen.tsx` ×2, `UsersPanel.tsx` ×4) and every comment and test name that states the act.
- Enabling by hand clears `offBy`.

### 6. The post-out sheet — every door (D229, D294, D298, D300; on #444's sheet)

Three doors pick a posting's outcome, all through #444's one route (`postOut`) and ONE chip row component
(`OutcomeChips`, new, `leavewar/ui/`):

1. **The bid sheet's PO** (`BidPicker`: `bid-postout` → `po-date`, the chips, the line, `po-confirm`).
2. **An existing posting's Post out sheet** (`PostOutSheet`: `postout-date`, the chips replacing `postout-archive`,
   commit on change as today; `postout-undo`, `postout-place` unchanged).
3. **The drag selection's PO** (`SelectSheet`: `sel-postout`, `sel-po-date`, the chips replacing `sel-po-archive`,
   `sel-po-confirm`).

Each: the date in its box **once** ("PO from"); the chips row ("Posting"); **one line** (§2); the button **"Post out"**
(D300) — for Delete, the second tap (§4.8). The old note "Off the manpower from that day on. Past schedules keep their
pucks." goes (said by the line). #444's refusal line (`post-err`) stays. **Post in**: the button reads **"Post in"**
(D300); its note stays (it explains the blank days — the agent's call, on the look card).

### 7. SANS on the date (D283)

- The pass ticks SANS (`san`, `sanBy: 'po'`) on the date; he stays on the roster (not archived), his account on.
- **The Leave War**, one place (`setPeople`'s lay-on of the posting window): for a posting with `poOutcome === 'sans'`,
  **with Show SANS on** the window is NOT laid (he is a SANS man from the date — in the SANS group, tracked; the grid's
  rows are people, so his whole row moves to the SANS group from the date his tick lands); **with Show SANS off** the
  window IS laid (his old place, greyed "PO" from the date, untracked — today's keep rule keeps him though SANS are
  hidden) and his callsign wears a small **"SANS"** tag (the approved picture 4a).
- Undo post out takes back its own tick (`sanBy === 'po'`).

### 8. Back from overseas (D284)

- **Restore on Quals** (#444's `restoreArchivedPerson`: clears the posting, un-archives) **also enables the account the
  Post out suspended** (`offBy === 'po'` → `on: true`) in the same command — one act for "he's back" (the agent's
  reading of "when the admin restores him / enables his account"; on the look card).
- Then the **back prompt** on Quals, lined up with the table (the approved picture 3): "**Hex is back** — quals and CAT
  as he left them." **[Check his quals]** (scrolls to his row in its seat view and outlines it) **[Later]** (closes it).
  It changes nothing (D284). A session list (`BACKPROMPT`, `state/view.ts`, `VIEW_RESET` 'session'); one prompt per
  restored man, newest first.
- An account suspended by hand (no `offBy`) stays suspended after Restore; Enable on Admin → Users brings it back.

### 9. Names — an archived man's callsign (D286, D295)

#### 9.1 One rule for "taken", one index

- **`callsignHolder(cs)`** (`engine/people.ts`): the person a typed callsign means — **the roster man** (not archived)
  if there is one, else **an archived man**, never a deleted man; a placeholder by its own callsign; a bare id as today
  (`whoId` / `nameToId` keep their id-first / callsign-first shapes).
- **`ID_BY_CS`** is rebuilt by ONE function, `indexCallsigns()`, from that rule, at every writer the map listed (load,
  the people restore, undo's rebuild, rename, the one add, the reference harness) and after an archive, a restore, a
  delete.
- **`callsignProblem(cs, exceptId?)`** — ONE refusal every writer asks: taken when a **non-deleted person other than
  `exceptId` who is on the roster or a placeholder** holds it, or it collides with any person's id (deleted included —
  ids are never reused). An archived-only holder does NOT make it taken (D286). Asked by the one add
  (`newPersonProblem` — its "is archived — restore them instead" line goes), `renameCallsign`, and Restore.

#### 9.2 The doors

- **Approve** (Admin → Users): a request whose callsign only an archived man holds opens on **New person** with the
  note **"An archived man is already Ace — this makes a new person."** (D286 reading (5), the D300 words); a callsign a
  roster man holds opens On the roster as today.
- **The Archived list** (Quals, admin): each row gains **"Rename"** (the approved picture 6b) → an inline box, Save /
  Cancel, refused with `callsignProblem`'s reason.
- **Restore** with his callsign held by a roster man: the row opens **"Ace is taken — give him another callsign."**, a
  box pre-filled "Ace 2" (the next free "<cs> N"), **"Restore as Ace 2"** and Cancel — rename + restore ONE command
  (D295). Restore never renames by itself (D286 reading (1)): nothing moves until he presses it.
- Old schedules keep the archived man's days as his (the id — unchanged).

### 10. The admin's member view (D292)

- **The role in force is the session's role**, as before `[ACCOUNTS]` removed the old toggle: `SESSION.role` flips
  `'admin'` ↔ `'main'` (`auth.ts setEffectiveRole`); `roleOf`, every `may…`, the command actor (`command/actor.ts`) and
  the ownership check follow with no other change.
- **Who may switch — `mayViewAsMember()`** in `perms.ts`: the session's ACCOUNT is an admin's (`sessionFor` adds
  `acct: account.role` to the session; `acct` is never changed by the switch).
- **The switch** (`store.ts switchRoleView()`, asking `perms.ts`, never reading `SESSION.role` itself — the
  `perms-scan` rule): to member — leave Edit Schedule / Admin for View-only Sched, disarm, `LGEDIT` off, `ADMINOPEN`
  cleared; the Leave War's role follows (`lwSetRole`); `bumpNav`; `notify`. Nothing else resets (the week, selection,
  filters, undo — the old toggle's rule). Every sign-in starts as admin: `resetSession` takes the role from the account.
- **Desktop:** `#roleBadge` becomes a button for a real admin — **"SABER · ADMIN"** / **"SABER · MEMBER"**, title
  "Switch to the member view" / "Back to the admin view"; a plain chip for a member (unchanged). **Phone:** the badge
  is hidden there, so the drawer's account line gains `#drawerRole` **"Switch to the member view"** / **"Back to the
  admin view"** (the approved picture 7c), closing the drawer.
- **In the member view he is exactly a member** — including Undo: an entry he made as admin cannot be undone until he
  switches back (`mayReverse`), with its reason (on the look card).
- The old toggle's tests (`ui/roletoggle.test.tsx`, deleted by `[ACCOUNTS]`) come back from `cc0cba7a^` and are
  brought up to the new words and rules.

### 11. The words — D300, one roll-call

The sheet's line (§2), the delete's second tap and its line (§4.8), the suspended sign-in (§5), the back prompt (§8),
the Restore rename line and the approve note (§9.2), "Post out" and "Post in" (§6), the badge and the drawer switch
(§10) — each ONE constant beside its builder, each rendered by a test. No "Nothing changes until that day" anywhere.

### 12. Permissions (D200 — `perms.ts` and data-model §11 together)

| Command | Writes | Who (COMMAND_OPS: base + `more`) |
|---|---|---|
| `person.delete` (new) | people + accounts (+ accessreqs) + schedule + stash + inputs + Leave War + plan | `Person` D + `User` D, `Input` D, `LeaveBid` D, ScheduleWeek U, `AccessRequest` D |
| `person.rename` (the Archived list — reuses Quals' rename) | people | `Person` U (admin — D218) |
| `person.restoreAs` (new: rename + restore) | people + accounts (`offBy` enable) + Leave War (the posting cleared) | `Person` U + `User` U + `LeavePersonProfile` U |
| `account.update` (`on`/`offBy`) | accounts | `User` U (unchanged) |
| the posting pass (reconciler) | people + accounts + Leave War (+ the delete command) | a reconciler write, as today's `runPoArchive` |

**§11 edits:** `User` — Admin **C R U D** (was C R U); note: "suspended (`enabled` false) while he is away; **deleted
with his `Person` when he leaves flying for good (D287)** — at the database step a tombstone"; "at least one enabled
admin always remains; an admin never changes or deletes his own account". `Person` — note gains "deleted by the hidden
mark (the tombstone, D290) — gone from every list, his callsign free; his past rows keep pointing at him (D297)".
`LeavePersonProfile` — the posting's outcome. `perms.test.ts` and `perms-scan.test.ts` hold them together.

### 13. Build base and order — the overlap with PR #444

PR #444 (the absence-record re-test, another chat) has reworked posting out on the Leave War: one route for every
posting door (`postOut`), `archivedBy: 'po'`, Undo post out and Restore taking back only the Post out's own archive,
`postingProblem` refusals shown on the sheet. This build EXTENDS that code, so:

- **Part A — built first, touching none of #444's files:** §5 (words, Delete account), §9 (the callsign rule, rename,
  Restore's check — the Restore half that lives in `leavewar/sync.ts` waits for Part B), §10 (member view), §4's core
  (`person-delete.ts`, the sweep, the inputs and the belt — except the Leave War records and the OIL rule), §12.
- **Part B — on #444's code:** the moment #444 merges, `main` is merged in (or, if it has not merged when Part A is done,
  #444's branch is merged in and its later commits followed); then §2, §3, §6, §7, §8, the Leave War half of §4.5, and
  Restore-with-rename. Nothing of #444's is restructured; the chat that owns it has been told (a heads-up, 27 Sep 26).
- **This branch merges last** (after #443 and #444; #445 in any order), `main` merged in first and the full checks
  re-run (D78).

### 14. The documents (D201, D138)

- `docs/data-model.md` §3 `Person` (the tombstone + `deletedFrom`), `User` (suspended; deleted with his person), `LeavePersonProfile`
  (`poArchive` → the outcome), §10 (Person), §11 (§12 above).
- `docs/data-schema.md` — `PEOPLE` (`deleted`, `deletedFrom`, `sanBy`, `archivedBy`), `accounts` (`offBy`; "never deleted"
  corrected), `postouts` (`poOutcome`, `poDone`).
- `docs/engine-rules.md` §Auth / roles (the words; delete; the member view back — "the admin's role toggle is GONE (D166
  (3))" corrected; the member's table) and the who→personId passage (the callsign rule).
- `docs/ui-contracts.md` — the post-out sheet(s), the access screens, Admin → Users (the editor), Quals' Archived list
  (Rename, Restore's box), the back prompt, the badge ("an inert `<span>`" corrected) and the drawer's switch.
- `docs/feature-impact.md` — a flow "a posting out" and "a delete".
- `docs/handover-dataverse.md` — account delete, the Person tombstone.
- `raptor-port/CLAUDE.md` — the person-identity paragraph (D286's "to narrow" note → built); the Leave War row of
  §Where things live (the role writer: `resetSession` AND the member-view switch).
- `.claude/rules/decisions/leave-war.md` §Architecture (the role writer, the same correction).
- Stale comments the map found (the old toggle: `view.ts`, `store.ts`, the four editor sheets, `LeaveWarPage.tsx`,
  `tracker.test.tsx`, `amendretest.test.tsx`), and the handpass scripts that click `#drawerRole` / `#roleBadge`.
- `docs/file-map.md` — new files.
- The register `docs/superpowers/specs/2026-09-26-accounts-behaviour-register.md` — rows PO1–PO12 (below);
  `scripts/rulecheck.mjs` in step.
- `OUTSTANDING.md` — `[POST-OUT-OUTCOMES]` archived at the merge; `[POST-OUT-TRACKER]` filed; `HANDOFF.md` this chat's
  block.

**The register rows:**

| Id | The rule | Ruling |
|---|---|---|
| PO1 | A posting out says which it is — four chips "Overseas Sqn" · "Delete" · "SANS" · "Transfer to Sqn" (the last disabled, later), the date once, one line saying what happens on it, the button "Post out"; the same on every posting door | D229, D294, D298, D300 |
| PO2 | On the date the app does the chosen outcome once — overseas: archived + account suspended; delete: deleted; SANS: SANS ticked — and never undoes a later hand change | D229, D280, D283 |
| PO3 | "Suspend" / "Enable", "Delete account"; the tag "suspended"; the sign-in "Your access is suspended — Ask an admin to enable it when you're back." | D285, D300 |
| PO4 | A delete asks twice and names what goes; it cannot be undone; never one's own; never the last admin | D287, D298 |
| PO5 | A deleted man is kept underneath, marked deleted: gone from every list and picker (the Archived list too), his callsign free, his account gone | D287, D290, D299 |
| PO6 | Days he already flew keep his puck, published or not, and never read pending for the delete; every day from the later of his date and today loses him (a published one reads pending); loading a version or switching a plan never brings him back | D297, D299 |
| PO7 | His past inputs, war leave and OIL, signatures and history stay; his inputs, bids and records from the date go (one spanning it ends the day before); he earns no OIL from the date | D299 |
| PO8 | Back from overseas: Restore brings him back as he was and enables the account the Post out suspended; a prompt offers to check his quals and changes nothing | D284 |
| PO9 | A SANS posting: SANS on the date; Show SANS off — in his place, posted out, untracked, marked SANS; on — in the SANS group, tracked | D283 |
| PO10 | An archived man's callsign may go to a new person (Approve opens on New person, saying so); a typed callsign finds the roster man; Restore meeting a taken callsign asks for another on the spot, one step; Rename on the Archived list | D286, D295 |
| PO11 | An admin switches to the member view and back (the badge; on a phone the menu) and is then exactly a member; each sign-in starts as admin; a member has no switch | D292 |
| PO12 | "Post in" reads just "Post in" | D300 |

## Roll-call — every place the change reaches (bug-check order §6)

The THINGS: **a posting** (its sheet, its pass), **an account** (suspended / deleted), **a deleted person**, **an
archived man's callsign**, **the role in force**. The walk fills the "walked" column in the evidence sheet.

| # | Place | Must after the build |
|---|---|---|
| 1 | The bid sheet's PO, desktop + phone | chips, one line, "Post out"; Delete's second tap |
| 2 | An existing posting's Post out sheet | the same chips, commit on change; Undo post out takes back its own suspend / SANS |
| 3 | The drag selection's PO | the same chips |
| 4 | The pass — a date already come at confirm; a date to come then arrives (the probe clock) | each outcome once; `poDone`; a later hand Enable not re-suspended |
| 5 | Admin → Users row + editor | "suspended" tag; Suspend / Enable; Delete account, second tap; own row disabled; last admin refused |
| 6 | The sign-in of a suspended account; of a deleted account | "Your access is suspended…"; a deleted one → Request access |
| 7 | Quals table, CSV, Archived list | deleted man absent from all three; overseas man in Archived |
| 8 | Quals Archived: Rename; Restore (free callsign); Restore (taken) | inline rename; restore; "Ace is taken…" box, one step |
| 9 | The back prompt on Quals | after Restore; Check → his row outlined; Later closes |
| 10 | Admin → Users approve with an archived-only callsign | New person + the note |
| 11 | The one add / sign-up with an archived-only callsign | allowed |
| 12 | Crew palette (edit week), board crew, Available crew, day ⓘ, SANS avail | deleted man absent |
| 13 | ALL AVAIL window / count | deleted man never counted |
| 14 | Inputs: add, filter, row editor pickers, "+ Pucks", the Posted out / archived group | deleted man absent |
| 15 | Sign-off boxes (week + board) | deleted man not offered; a past signature still reads his name |
| 16 | A past day (published and not) that holds him | his puck; no pending for the delete |
| 17 | A day to come, not published | he is gone from every seat / row / crowd / extras / sim / sign box |
| 18 | A day to come, published | issued face unchanged; working copy without him; "N pending"; the four fall; the pending list names it |
| 19 | A stashed week to come; a parked plan to come | he is gone there too |
| 20 | Load a published version / switch to a plan on a day to come | he is left out, and the message says so |
| 21 | Undo after a delete | cannot bring him back; its reason on screen |
| 22 | Inputs of his: past / spanning / future | kept / ended the day before / gone |
| 23 | Leave War grid: months he was here; months after | his row with leave and OIL; no row |
| 24 | Leave War OIL tracker | no row for him |
| 25 | OIL pass on a published day to come still carrying him | no credit for him |
| 26 | Planning calendar pucks | gone on/after his date |
| 27 | Tracker Students card | his name unlinked (no-because: `[POST-OUT-TRACKER]`) |
| 28 | Leave War with a SANS posting, Show SANS off / on | old place + PO grey + "SANS" tag / SANS group, tracked |
| 29 | The badge (desktop), the drawer switch (phone) | admin: switch both ways; member: no switch |
| 30 | In the member view: tabs, Edit Schedule, Admin, Quals own row only, Inputs own only, the Leave War own row only, Undo of an admin entry | exactly a member |
| 31 | A reload after each | every mark, account, posting and outcome kept; the member view back to admin at a new sign-in |
| 32 | Post in button | "Post in" |
| 33 | Help page, Logic page | searched for "switched off", "Archive on PO date", posting words |

**The door check:** choose each outcome on each of the three sheets; un-choose; change a posting's outcome; Undo post
out after each outcome's date has come; delete from Admin → Users; delete a man with no account (the sheet); suspend and
enable; rename an archived man; restore free and taken; check / later on the prompt; switch view both ways on both
widths; sign out from the member view and in again.

## Build order (each behaviour red first)

**Part A**

1. `engine/people.ts` `callsignHolder`, `indexCallsigns`, `callsignProblem` + tests (the placeholders, a bare id, a
   deleted id, archived-only free); every `ID_BY_CS` writer calls `indexCallsigns`; `roster-add.ts`, `renameCallsign`
   switch to `callsignProblem` (PID-01's test kept, the archived-refusal test inverted — D286).
2. `accounts.ts` + `UsersPanel.tsx` + `AccessScreen.tsx`: the words (§5), `offBy`, approve's archived-only New person
   note (§9.2); tests.
3. `perms.ts` + data-model §11: `mayDeletePerson`, `mayViewAsMember`, the new commands; `perms.test.ts` red until §11
   agrees.
4. `state/person-delete.ts`: the command (§4.1) — the mark, the account, the live-week sweep, the stash sweep, the
   parked plans, the sign boxes, `oild`, PLANPUCKS, the inputs; `stripDeleted` + the belt in `rowsLeftOut`; `attrsOf`'s
   rule; tests per KIND of slot (a test loops the roll-call of slot kinds — bug-check order §8.1), per store, the belt,
   undo blocked, a refusal leaving nothing changed, a reload.
5. The lists that show archived people (`!deleted`) + the Archived list's Rename (Quals) + tests.
6. The member view (§10): `auth.ts`, `perms.ts`, `store.ts switchRoleView`, `Shell.tsx`, `Drawer.tsx`; the old
   `roletoggle.test.tsx` brought back and updated; `accounts-ui.test.tsx`'s badge test.

**Part B** (after taking #444 in)

7. `leavewar/engine/postout.ts` (`OUTCOMES`, the line); the store's `poOutcome` / `poDone`; `setPeople`'s lay-on (SANS);
   `forgetPersonFrom`; `creditable`; the OIL tracker's skip; tests.
8. `runPoOutcomes` (§3), `postOut`'s take-back extended, `undoPostOut`, `restoreArchivedPerson` (+ `offBy` enable, the
   callsign check, `restoreAs`), the back prompt; tests (the probe clock for a date that arrives).
9. `OutcomeChips` in the three sheets; "Post out" / "Post in"; Delete's second tap; the "SANS" tag; tests
   (`po.test.tsx`, `pi.test.tsx`, `selectsheet.test.tsx`, `poarchive.test.ts`).

**Then:** documents (§14) → e2e (the sheet's chips fit the phone sheet; the back prompt lines up with the table; the
badge/drawer) → gates under the lock → the walk (the scenarios Fable/Astra design, driven by the roll-call) → the two
code reads with the evidence sheet → fixes → re-walk → gates → the sheet → his look.

## On the look card (the agent's calls — his to correct)

1. Tapping the chosen chip again un-chooses it: "off the manpower, nothing else" (today's switch-off case kept).
2. Delete on the sheet asks twice whatever the date (the act is set up there).
3. A man with no account is deleted from the Leave War's sheet (there is no Delete on Quals).
4. A delete's "today" is the real date; the demo weeks (July) are all "already flown".
5. Restore brings back the account the Post out suspended, in the same act; one suspended by hand stays suspended.
6. The back prompt appears on Restore (not on Enable alone).
7. Post in keeps its explaining note.
8. In the member view, Undo of something he did as admin waits until he switches back.
9. The Tracker is untouched: a deleted man's name stays on his courses, unlinked (`[POST-OUT-TRACKER]` — what is a
   "course still running"?).

## Not in this build

- Transfer to another squadron, guests from another community, the orange corner — `[XFER]`, with the database.
- A course "still running" in the Tracker — `[POST-OUT-TRACKER]`.
- Ending a session already open when its account is suspended or deleted — the database step (as `[ACCOUNTS]`).
- Whether archiving a man (the overseas outcome) should make his published days BEFORE the posting date read pending
  (today it does — D186's posting attribute) — the question goes to him with the walk's picture; this build changes it
  only for a DELETE (§4.4).
