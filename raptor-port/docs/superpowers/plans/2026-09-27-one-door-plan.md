# [ONE-DOOR] — the plan (27 Sep 26, Opus 5.5 on high thinking; for Fable's and Astra's red team)

**The job, in his words and rulings.** D309 / D310 (*"one door as proposed, Quals loses archive"*): Admin → Users shows
every person's sign-in and roster state and carries every action; Quals keeps quals, CAT, flight and initials. D308: a man
put on the roster is asked his post-in date. D305: the man himself is told, on his first sign-in after Restore, to check
his quals and CAT. D320: the Leave War keeps every stint a man has in the squadron. D321: the post-out look card's
questions stand as built. D322: the mock-up `raptor-port/docs/mock/one-door.html` is the design of record, with the
agent's own calls on it. Branch `claude/one-door`; the tier is **FULL** (bug-check order §5: Q1 who counts as present on
the Leave War, Q2 archiving makes published days read pending, Q3 saved records change shape, Q7 who may sign in).

## 1. Rulings swept (the rules-first list — every one the build must obey)

| Ruling | What it demands of this build |
|---|---|
| D309, D310, D322 | The one door: one row per person, a Sign-in and a Roster dot, D310's buttons per state, Archived folded at the foot, Give access / Refuse, New person only at the foot, Quals without ✕ and Archived list |
| D308 | A post-in date on Restore, New person (the foot form) and Give access → New person; opens on today; the account works at once; the war and availability count him from the date |
| D320 | The war keeps every stint; away between a posting out and a later post-in; earlier stints as they were; no row in a period he is away for the whole of |
| D305, D307 | The man's own "Welcome back — check your quals and CAT" on his first sign-in after Restore; the admin's "he's back" note (D284) stays; Enable on any suspended man still shows the admin's note |
| D322's calls | Archive one tap; Restore enables the sign-in even when suspended by hand before; no Enable on an archived row (and the write path refuses it); renaming a roster man stays on Quals (D218); the list never reorders itself |
| D295 (narrowed by D310) | An archived man renamed directly — now on his Admin → Users row; Restore meeting a taken callsign asks for another on the spot |
| D286 | An archived man's callsign is free for a new person; Restore refuses while a roster man holds it (then "Restore as …") |
| D217 (narrowed by D310) | Admin → Users is the one door for a new person; a blank sign-in makes a roster-only person |
| D280, D285, D287, D290, D297–D299 | Suspend / Enable / Delete as built; a delete keeps the past (the hidden mark) and asks twice, naming what goes |
| D284 | He returns as he was — quals kept; the admin is prompted to check them (Quals' back-prompt, unchanged) |
| D306 | A posting that would leave no admin able to sign in waits, whole; Archive refuses the same case at once, with its reason |
| D166, D204, D214, D216, D219–D227 | Accounts: one person one account, never your own account, the waiting list and bell, the New person fields and words, 14 letters said never cut, initials never required |
| D149, D218 | A member edits his own Quals row (all but the callsign); the welcome note's "Check my quals" lands him there |
| D283 | A SANS posting's window rule (Show SANS) is untouched |
| D45, D103, D321 (7) | Archiving makes the published days he is on read "1 pending" (the roster comparison) — kept |
| D56 | Stored demo data is not a finding; no migration of old one-window records beyond a tolerant read |
| D200, D201 | perms.ts and data-model §11 change together (drift-tested); every document stating the narrowed D217 / D295 is fixed in the same change |
| D302 | `[LW-MOVE-STANDARD]` is told before a shared file is touched (§7) |

## 2. What is built, piece by piece

### A. Admin → Users — the people list (`src/ui/UsersPanel.tsx`)
- **Waiting for access** stays; its buttons read **Give access / Refuse** (the ids `data-approve` / `data-decline` kept).
- **People · N** replaces "Accounts": every person on the roster (not `special`, not `deleted`, not `archived`), A to Z
  by callsign, one `acc-row` each — callsign; under it the sign-in name or "no sign-in", seat and CAT, the role word on a
  phone; a **Sign-in dot** (green on, red suspended, grey no account) and a **Roster dot** (green) in two fixed columns
  under one heading row; the role pill on desktop; the posting tag when a posting out is waiting for its date
  ("posting out 14 Oct · Overseas Sqn" — a new seam read in `leavewar/sync.ts`, `postingPendingTag(id)`); the held note
  (`postingHeldNote`, unchanged). Each dot carries `title` and `aria-label` in words (colour is never the only sign).
- **Search box** above the list: filters by callsign or sign-in name, case-insensitive; an empty result says "Nobody
  matches". Local state; cleared on sign-out with the panel.
- **Tapping a row opens it** (one at a time; never your own row — the D166 guard):
  - **with an account:** Sign-in and Role → **Save**; **Suspend** or **Enable**; **Archive**; **Delete** (two taps, the
    D287 line); Cancel.
  - **no account:** Sign-in (empty) and Role → **Give sign-in** (`addAccount`); **Archive**; **Delete**; Cancel.
- **▸ Archived · N** folded at the foot (session state; hidden when N is 0): archived, not deleted, not special. Its rows
  wear a red Roster dot and a red or grey Sign-in dot. Opened: **Callsign/Name** box (his callsign), **Post in** date
  (today) → **Restore** (or **Restore as <typed>** when the box differs), **Save name** (only when the box holds a
  different callsign — D295's direct rename, kept), **Delete** (two taps), Cancel. His callsign taken on the roster →
  the line "<cs> is taken on the roster — give him another callsign." and the box opens on the next free one
  (`nextFreeCallsign`, moved from Quals).
- **Add a person** (the foot form): **New person only** — Callsign/Name, Initials, Pilot / WSO / personnel, CAT,
  Sign-in (blank for someone who won't use the app), **Post in** (today), Role (only once a sign-in is typed) →
  **Add person** / **Add person and sign-in**. The "On the roster" half goes — a man on the roster gets his sign-in on
  his own row. Quals' "+ Add person" still opens this form on New person (`ADMINOPEN`).
- **Guest view** switch: unchanged.

### B. The commands (state, one intent each — `src/state/accounts.ts`, `src/leavewar/sync.ts`)
- **Archive** — NEW `person.archive` (`archivePerson(id)` in `leavewar/sync.ts`, beside restore — it writes the war):
  one command over the people, settings and war stores: `archived = true`, `archivedBy = 'admin'`; his account
  suspended (`offBy: 'archive'`) — skipped, and the whole Archive REFUSED, when he is the last admin who can sign in
  (D306's rule, said at once); the war's current stint closed the day before today with outcome `overseas` and `poDone`
  today (so the posting pass never runs it again), a pending posting out replaced. Refused: yourself ("You can't archive
  yourself — ask another admin"), a deleted man, a placeholder. **The agent's reading, put to him:** Archive is "posted
  out from today" on the Leave War — his months here keep their record (D284 (2), D320) — where Quals' old ✕ took his
  row off the war altogether ("should never have been here"). **His go, 27 Sep 26 (D323): "Ok what u recommend".**
- **Restore** — `person.restore` extended (`restoreArchivedPerson(id, postIn)`, `restoreArchivedAs(id, cs, postIn)`):
  the archive lifted, **his account enabled whatever suspended it** (D322), the posting's SANS tick taken back (as today),
  **a new stint opened on the war from the post-in date** (D320: the closed stint kept as it was), `back = true` on his
  Person when he has an account (D305), and the admin's back-prompt (D284). The post-in date is refused, with its reason,
  when it is not a whole date or falls on or before the day his last stint closed. **Undo post out** keeps its own
  meaning (no new stint — the posting cleared, the same stint continues): `restoreBody`'s two modes, named.
- **Enable on an archived man is refused at the write path** (`updateAccount({ on: true })`): "<cs> is archived —
  restore him instead". The posting pass's own suspension and `enableAfterPosting` are unchanged.
- **Give sign-in** = `addAccount(name, pid, role)` (built). **Suspend / Enable / Delete** = built.
- **New person with a post-in date** — `addPersonAndAccount`, `addRosterPerson`, `approveRequestNew` gain `postIn`; the
  new person's war record is written inside the same command (a new seam function, `postInOnWar(txn, id, date)`, because
  the war has not projected him yet).
- **The welcome note's dismissal** — NEW `person.backSeen` (the member's own row, `own: 'required'`): clears `back`.

### C. D320 — the war keeps every stint (`src/leavewar/`)
**The shape — chosen so the fewest readers move.** `from` / `to` stay the CURRENT (latest) stint, so every reader that
asks about his current posting (the posting pass `poDueNow` / `runPoOutcomes`, `setPostOut`, the post-out and post-in
sheets' dates, the SANS tag, `outcomeOf`, `poDone`) is untouched. NEW on the war's Person and its stored record:
`past?: { from: string | null; to: string }[]` — his CLOSED earlier stints, oldest first, each ending before the next
begins; a past stint carries no outcome (its posting has run). The inventory (a read-only sweep of `src`, 27 Sep 26, every
reader and writer of `from` / `to` listed with its verdict) found these to change — and only these:

| Where | Today | With stints |
|---|---|---|
| `engine/people.ts inSquadron` | one window | the current window OR any past stint |
| `engine/people.ts` NEW `beforeFirstStint(p, date)` | — | before his earliest stint's start (a null start never is) — the only "not yet arrived" |
| `engine/people.ts` NEW `lastDayIn(p, date)` | — | the day a stint ends (the current `to` or a past `to`) — the "PO" corner |
| `ui/Matrix.tsx rowInWindow` (l.141) | the current window stretched by the record span | today's test OR any past stint overlapping the months on screen — so a leave period he is away for the whole of shows no row (D320), and one holding a past stint shows it |
| `ui/Matrix.tsx` the day cell (l.514 `notYetArrived`, 553 text, 636, 652) | before `from` = blank "not yet arrived" | `beforeFirstStint` = blank; a day in the gap between stints reads **PO** with the hatch (away) |
| `ui/Matrix.tsx` l.619 / 624 / 655–662 (`pofin` / `polast`) | the corner on `to` only | on every stint's last day (`lastDayIn`) |
| `ui/Matrix.tsx` l.746–757, 1818–1822, 4310–4341 (which sheet a tap opens) | keys on `date < current from` | **rewritten by stint (round 1, Fable F2 / Astra 1):** a day in ANY stint is an ordinary day (the bid sheet); a gap day right before the current stint opens the CURRENT Post in sheet; a gap between two past stints, or a day before the first, opens no posting sheet (a day outside the window) |
| `state/store.ts setPostOut`, `postingProblem('out')` | refuses a post-out before the post-in | a post-out or post-in aimed at a PAST stint is refused: "<cs> was posted out on <date> and came back on <date> — an earlier stint's dates can't be moved here" (past stints read-only on the war — narrows the agent's D320 reading, put to him) |
| `state/store.ts setPostIn`, `postingProblem` | refuses a post-in after the post-out | also refuses one on or before his last past stint's end ("Back from a posting on <date> — the post-in has to be after that day"); **clearing** the post-in (the sheet's Undo) is refused while past stints exist ("He came back from a posting — move the date instead") |
| `state/store.ts` NEW `openStint(id, date)` | — | Restore's war half: the current stint (it must be closed — `to` set) pushed onto `past`, the new current `{ from: date, to: null }`, its posting fields cleared; refused when `date` is on or before that `to` |
| `state/store.ts forgetPersonFrom` (delete) | closes `to` at the cutoff | the same, and past stints ending on or after the cutoff are cut to it; a current stint that would open after it collapses into the last past one |
| `state/store.ts windowRecord`, `windowFor`, `readPostOuts`, `setPeople` capture | one window | carry and validate `past` (each `{ from: date or null, to: date }`, in order, non-overlapping — a malformed list is dropped whole, tolerant, D56); a record is kept while any stint end is set |
| `sync.ts reprojectRoster` (l.1343–1386) | lays `from` / `to` / posting fields; change signature | lays `past` too; the signature includes it |
| `ui/BidPicker.tsx` the **Post in sheet** only (a posting part — not `[LW-MOVE-STANDARD]`'s) | "Posted in on <date> — days before it count nobody" | with past stints: "Back from a posting — the days between count nobody"; its Undo refused with the reason above |

**The invariant (round 1, Fable F4 / Astra 3):** every stint has `from == null || from <= to`, stints are in order and never overlap — enforced at every write and at the load; a stint that would close before it opens is DROPPED (the last past stint becomes current again), never stored. A post-in on the day after the stint closed REOPENS that stint (no boundary — Fable F5).

**Unchanged and pinned (a test each, so the new half cannot absorb them):** a man with one stint reads exactly as today
(every existing posting test stays green unedited); the manning counts, availability, the ALL AVAIL crowd and the OIL
pass change only through `inSquadron`; Undo post out keeps its meaning (the current stint's `to` cleared); a SANS
posting's window rule (D283) acts on the current stint only.

**Archive's war half** (`person.archive`; D323): the current stint closed the day before today (`to = yesterday`) with outcome
`overseas` and `poDone = today`; if it already closed earlier (a posting that has run), its date stays; if it has not
started yet (a post-in still to come), it is closed empty (`to = from − 1` — he was never here in it). Restore then opens
a new stint (`openStint`).

### D. The man's welcome note (D305)
Rendered by the Shell under the top bar, on every page, while the signed-in person's `back` is set: "**Welcome back,
<cs>** — check your quals and CAT." **Check my quals** (clears it, opens Quals on his seat view with his row outlined —
the admin's `checkBack` path, reused) · **Later** (clears it). The admin viewing as a member (D292) sees his own, never
another's. A guest, a pending person, an account suspended: none.

### E. Quals (`src/ui/QualsPage.tsx`)
The ✕ archive column goes (head and cell), the Archived section, its Rename, Restore and Restore as go, with their state;
the help line loses "or the red ✕ to archive someone"; `checkBack`'s archived branch goes (an archived man is never
prompted — Enable is refused on him). The admin's back-prompt stays.

### F. Records and permissions
- Person (Raptor): `back?: true` (the welcome note); `archivedBy: 'admin'` (a new value). Account: `offBy: 'archive'`.
- The war's posting record: `past?: { from, to }[]` — the closed stints (§C).
- `perms.ts`: `person.archive` (Person U; more: User U, LeavePersonProfile U), `person.backSeen` (Person U, own required);
  `data-model.md` §11 in the same change (the drift test).

## 3. Documents that change with it (D201)
`ui-contracts.md` (the Admin → Users section rewritten; Quals' Archived list and its rename marked MOVED — D310),
`engine-rules.md` §Auth / roles (the one door; archive and restore; the rename's home), `data-model.md` §3 Person and
§11, `data-schema.md` (the war's posting record), `feature-impact.md` (Admin → Users as a surface for a person's state;
the Leave War's stints), `file-map.md`, the look card of `[POST-OUT-OUTCOMES]` (done), code comments naming Quals'
archive / Restore (QualsPage, sync.ts, accounts.ts header, roster-add.ts, raptorRoster.ts, store.ts `setPeople`'s
"that ✕ means should never have been here"). Searched by SUBJECT — "archive", "Restore", "Archived list", "rename" —
not only by D-number.

## 4. The roll-call and the door check (drafted here; completed on the evidence sheet)
*(the THING: a person's roster/sign-in state; every place the app draws or changes it)* — Admin → Users (desktop, phone
drilled-in), Quals (every seat view, edit mode, the back-prompt), the Leave War (grid rows, cells, the post-out and
post-in sheets, the drag-selection, the OIL tracker, manning counts), the sign-in screen (suspended), the access screens,
the schedule's crew lists and ALL AVAIL crowd (an archived man is off every roster), the week's pending count on a
published day he is on, the Admin tab's badge and the bell, the man's own pages (the welcome note). Doors: Suspend,
Enable, Archive, Restore, Restore as, Save name, Delete, Give sign-in, Give access, Refuse, Add person, the post-in date,
Check my quals, Later, Undo post out, the Leave War's Post in / Post out.

## 5. Tests — red first
Unit: each command's writes and refusals (archive: yourself, last admin, deleted, placeholder, a pending posting;
restore: the post-in date's refusals, the stint opened, the account enabled whatever suspended it, `back` set; Enable
on an archived man refused; New person's war record; backSeen own-row only); UsersPanel (rows, dots and their words,
search, each state's buttons, the folded group, Give access / Refuse words, the foot form New person only); QualsPage
(no ✕, no Archived section); the Shell's welcome note; the war's stints (every reader in §C, a test per reader); perms
drift. E2E (`e2e/one-door.spec.ts`, both widths): the whole round trip — archive → the war shows him away → restore with
a later post-in → the gap reads away → his first sign-in shows the note → Check my quals lands on his row. Every wired
surface broken once on purpose (the break tests).

## 6. The walk
A scripted walk (`scripts/handpass/one-door-walk.mjs`), both widths, pictures to `docs/img/handpass/2026-09-27-one-door/`:
the demo world with a man suspended, one with no sign-in, one archived with an account and one without, a posting
waiting, a waiting request; every door in §4 operated in both orders where it has an opposite (archive → restore;
restore → archive again; suspend → archive → restore; delete from the archived group), the Leave War checked after each
(rows, hatch, counts), a published day he is on read before and after, a reload after each.

## 7. The other chat (D302)
`[LW-MOVE-STANDARD]` touches `store.ts` (move functions) and `Matrix.tsx` (the move wiring). This build touches
`store.ts`'s posting record (`setPostIn`, `postingProblem`, `windowRecord`, `windowFor`, `readPostOuts`, `setPeople`,
`forgetPersonFrom`, the new `openStint`), `Matrix.tsx`'s `rowInWindow` and the day cell's look (l.141–152, 509–662 —
not the move wiring), and `BidPicker.tsx`'s Post in sheet (a posting part) — told 27 Sep 26 before any edit; the later
merge takes `main` in first.

## 8. Order and size
Plan red team (Fable, Astra; ~3 rounds at most) → C (the stints) first, red first → B → A → E → D → docs → the gates →
the walk, fix → both reads with the evidence sheet → fix → re-walk → gates → sheet → his look. About 8–10 hours of agent
time with the FULL check.

## 9. Round 1 of the red team — folded in (27 Sep 26)
Fable 5.1 and Astra, blind to each other: every finding and its disposition is in
`raptor-port/docs/superpowers/specs/2026-09-27-one-door-plan-review-log.md` — ALL adopted. The ones that change the
build's shape: **Restore on Admin → Users is the one way back from an Admin archive** (the war's Post out sheet for him is
read-only, its writes refused — F1 / A2); **the tap routing by stint, past stints read-only** (F2 / A1 — his answer
sought); **Archive of a hidden SANS man takes the war identity as the delete does** (F3 / A7); **no empty stints**, and a
same-day Restore reopens the stint (F4, F5 / A3); **a session whose account goes off or whose person is archived or
deleted lands on the suspended screen** (F8 / A4); **`back` on every Restore** (F12 / A5); **the new-person commands
enlist and name the war's record** (F11 / A6); **the two Restore modes written out** (F7); the published record asserted
in full (A8); on-screen strings pointing at Quals fixed (F6); `poDone = to + 1` (F9); no `offBy: 'archive'` (F10); the
replaced posting's take-back (F13); Archive / Restore not Undo steps (F14); the back-prompt skips an archived man (F15);
the roll-call additions in §4.

