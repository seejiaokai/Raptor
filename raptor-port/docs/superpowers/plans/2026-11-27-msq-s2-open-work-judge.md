# S2 step U1 — one record of open work, one judge (the reshape after the seventh read; chat 205, 27 Nov 26)

A builder's working document for ONE Opus builder. Written by a fresh Opus planner from the code at `4df95bccc`, the
brief `briefs/2026-11-27-msq-s2-u1-read-brief-8.md`, the builder reports of rounds 4–7 and the readers' reports and
proofs of `fixread6/` and `fixread7/` (side-session notes, `s2-chat205/`). His D2238: open faults are fixed by
reshaping where they come from first; his D2404: a guard rail before another patch. The note's words are his D2730
Q13, `changedWhileOpenWords(<callsign>)` — **no new words anywhere in this build.**

**Why.** Every read since round 4 found one person losing typed work, or having it rewritten, because each kind of
typed work keeps its own record of what it was started on, and each path GUESSES: "untouched" from equal values (the
archived post-in date — `rolledForward`, `shownNow`), "his own pick" from a flag left over from an earlier pick
(`enteredByPick` with `Approving.view` fixed at opening), which search shows the ringed man. The reshape: **A** one
record of every piece of open work, holding what it was started on, a copy of the STORED facts it shows (never a value
made from the clock) and what he typed, each field with an explicit "he set this" mark; **B** one function that judges
every entry alike, on every draw, before every press and as the page goes.

---

## 1. The record (A)

### 1.1 One type, held by the page

In `ui/UsersPanel.tsx`, one state of `UsersPanel`, `const [work, setWork] = useState<OpenWork>(NO_WORK)`, replacing
`editing`, `editOn`, `typed` and `Waiting`'s `open` / `opened` / `lost`. `seen` and `wrote` stay as they are (they are
the list around the row, not the work — §2.5).

```ts
/* what every piece of open work was started on (B's first half) */
type StartedOn = {
  unit: string          // pageUnit('own') at the press that opened it — the page's squadron
  view: string          // pageUnit('schedule') at that press — the squadron in view
  actor: string | null  // who is looking: signedInAccount()?.id ?? null (a hand-made test session: null)
}
/* THE ROW'S (a man's roster row, whole or short, or an archived man's) — the name kept: §20 of rejudge4 lists it */
type OpenedOn = StartedOn & { short: boolean; home: string | null; arch: boolean; shown: Shown | null }
/* THE COPY — stored facts only. `postIn` LEAVES IT (it was the clock's value): a box he never set shows today live */
type Shown = { acct: string | null; name: string; role: RolePick; on: boolean; lines: Record<string, AccessLine>; cs: string; taken: boolean; box: string }
/* WHAT HE TYPED — `set` is the explicit "he set this" mark of each field; a field not set shows the copy (or, for a
   date, today live) */
type Typed = {
  name: string; role: RolePick; lines: Record<string, AccessLine>; pick: { acct: string; line: AccessLine } | null
  box: string; postIn: string
  set: { name?: true; role?: true; lines?: true; box?: true; postIn?: true }
}
/* Give access (lifted from Waiting): started-on + the request as stored + the form */
type GiveOn = StartedOn & { req: string }   // JSON of the request record as stored at the press (accounts.ts AccessRequest)
type GiveTyped = { mode: Mode; np: NewPerson; pid: string; role: AccountRole; postIn: string
  set: { mode?: true; np?: true; pid?: true; role?: true; postIn?: true } }
/* the clock boxes' last draw — the only clock fact any entry holds, and it is of the screen, not of the start (§2.3) */
type Drawn = { onScreen: boolean; day: string }
type RowWork  = { pid: string; on: OpenedOn; typed: Typed; drawn: Drawn }
type GiveWork = { id: string; on: GiveOn; typed: GiveTyped; callsign: string; drawn: Drawn }  // callsign: r.cs at the press
type OpenWork = { row: RowWork | null; give: GiveWork | null /* , add: AddWork | null — §8, conditional */ }
```

Notes for the builder:
- `Approving` goes; `startApprove(r)` becomes `giveFrom(r)` returning `{ on, typed, callsign }` (mode from `rosterMatch`,
  np from the request, pid '', role 'main', `postIn: ''`, `set: {}`).
- `Waiting` becomes presentational: handed `give`, `onTyped`, `onOpen(r)`, `onClose`, `onDone` from the page; it holds
  no state. Its markup and ids unchanged.
- `OpenedOn` keeps every field today's code reads (`unit`, `short`, `home`, `arch`, `view`, `shown`) and gains `actor`.
- `judgedNow(pid)` builds `OpenedOn` (with `actor`); `typedFrom(s)` returns `set: {}`.

### 1.2 How the marks are set and cleared

Set: by his own change event, in the editor's handler, inline (`p.onTyped({ ...typed, name: v, set: { ...typed.set,
name: true } })`) — no new helper name in the two editors (§20's lists, §5.3). Cleared: at close (the entry goes), and
ONLY by these, each today's ruled behaviour, each a named pin:

| Field | A value back equals "not set" only here | Its pin (stays green) |
|---|---|---|
| short row `pick` | he presses the line the man holds (the hand put-back, the security read 1 of round 3; brief-8 "a pick the admin puts back by hand is let go") | rejudge4 §26 "pins: a pick put back by hand is let go, against the line as it stands at the press" |
| short row `pick` | another admin's change makes the line he holds equal to the pick (`pickNowHeld`, round 6; brief-8 "a pick … made equal to the line he holds now is let go") | rejudge6 §36 (both tests) |
| archived `postIn` | he picks TODAY — the value an unset box shows: `set.postIn = v !== effectiveToday()` | rejudge6 §38 "pin: his date picked, then picked back to the day the box opened on: untouched again…" |
| Give access `postIn` | the same rule | new, rejudge8 §43 |

Nothing else clears a mark. "Differs" (the leave-guard's report, Give access's note) is **a field he set whose value is
not the copy's** — the mark gates, equality never creates one:
- whole: `(set.name && name !== s.name) || (set.role && role !== s.role) || (set.lines && JSON(lines) !== JSON(s.lines))`
  (`typedDiffers`, kept by name);
- archived: `(set.box && box.trim() !== s.box) || !!set.postIn` (`boxesDiffer`, kept by name);
- short: `shortUnsaved` as today (the pick's mark is `pick !== null`);
- Give access: `giveDiffers(g)` — each set field against its opening value (`mode`, `np` vs the request's cs/ini/seat/cat,
  `pid` vs '', `role` vs 'main'), `postIn` by its mark alone.

### 1.3 The date a box he never set shows

- `ArchivedEditor`: `value={typed.set.postIn ? postIn : effectiveToday()}`; its `onChange` sets `postIn: v` and
  `set.postIn` by the rule above; Restore / Restore as send `typed.set.postIn ? typed.postIn : effectiveToday()`.
- `Waiting`'s New person Post in: the same (it showed the day the form opened, even after midnight).
- `shownOf` no longer writes `postIn`; nothing in any copy is read from the clock.

---

## 2. The judge (B)

### 2.1 One function, one rule

```ts
type Why = 'ok' | 'gone' | 'pick' | 'changed'
function judge(w: Entry, at: 'draw' | 'press' | 'leaving'): Why
```
(`Entry` = `{ kind: 'row' } & RowWork | { kind: 'give' } & GiveWork`.) In this order:
1. **gone** — a row whose man is deleted (`P(pid)?.deleted`). Kept first, as today (the note ends "Open it again.",
   untrue of a man who is gone — D1625; round 5).
2. **pick** — `pageUnit('schedule') !== w.on.view && enteredByPick()`: the squadron in view moved, by his own pick or bell
   tap. **This is not the old guess:** every entry closes on ANY change of the squadron in view (step 3), so no entry
   outlives one, and the flag is read only on the draw where the started-on `view` first differs — the draw after the
   very change that set it (state/store.ts `enterSquadron` sets it at each change of the squadron in view). The leftover
   flag of opus2-7 #2 can no longer meet an entry. And K4 / K5 (D2403, D2590) refuse a pick or the member-view switch
   while any entry differs, so a pick only ever closes unchanged work.
3. **changed** — any started-on fact differs: `pageUnit('own') !== on.unit || pageUnit('schedule') !== on.view ||
   actorNow() !== on.actor || !adminThere(on.unit)`; or the kind's stored facts differ:
   - row: `foreignHere(pid) !== on.short || homeOn(pid, todayIso()) !== on.home || !!P(pid)?.archived !== on.arch ||
     !sameShown(shownOf(pid, kindOf(on)), on.shown) || (on.short && pickCannotGo(pid, typed))`;
   - give: the request is no longer in `waitingHere()`, or its stored record's JSON is not `on.req`;
   - **at a press only:** an entry whose clock box he never set (`arch` row with `!set.postIn`; give in New person mode
     with `!set.postIn`) and `w.drawn.day !== effectiveToday()` — the box on screen shows a day that is no longer the day
     that would be sent (keeps rejudge7 §40 "pin: a press past midnight with NOTHING redrawn stays strict").
4. **ok** otherwise.

Each started-on fact is compared, never guessed; "who is looking" stays REQUIRED (`adminThere`, round 5) and is also
compared (`actor`).

### 2.2 The note — one rule, said once

`noteOwed(w, why, at)`:
- at a **press**: closed (`why !== 'ok'`) → the note, always (today's `askAgain` / `saidChanged`; the deleted-man corner
  of round 5 kept);
- on a **draw** or as the page **goes**: `why === 'changed'` AND the entry was on screen at the last draw
  (`w.drawn.onScreen`; for a row, today's `wasDrawn` from `seen`) AND (`w` is a row OR `giveDiffers(w)`).

Rows say it whether or not anything was typed (D2730 Q13 as built since round 1); Give access only when it holds a
change (round 7, pinned: rejudge7 §42 "pin: … with nothing changed in the form — it goes without a word"). This is a
property of the kind, written once in `noteOwed`, not a path's guess. The only silent closes of work on screen: `gone`,
`pick`, the bell landing for another man (his act — §2.6), and his own act on that very work (Save, Cancel, Give access /
Add person and give access, Restore, Delete, Archive, Suspend/Enable, Give sign-in; Save name leaves the row open with a
fresh copy). Words: `changedWhileOpenWords(cs(pid))` for a row, `changedWhileOpenWords(w.callsign)` for Give access.

Once, strict mode included: the draw-time close is set while drawing; the notes owed go into ONE page state
`{ seq, callsigns: string[] }`, set in the idempotent shape used today (`{ seq: (note?.seq ?? 0) + 1, … }` — never a
functional `n => …` updater in the draw) and toasted in one effect keyed on it. Two entries closed in one draw: one
state, two toasts, each once.

### 2.3 Where it is called

| When | Caller | What it does |
|---|---|---|
| every page draw | `useOpenWorkJudged(work, now, …)` (replaces `useOpenRowJudged` and `Waiting`'s in-draw check) | for each entry: `judge(…, 'draw')`; closed → drop the entry, queue the note if owed; kept → the short row's settle step (`pickNowHeld` → `pick: null`), and re-hold `drawn` where it differs (`onScreen`, `day: effectiveToday()`) — one extra draw at midnight, none otherwise |
| every editor draw | `useJudgedOnDraw` (name and signature kept) | `judge(row, 'draw') !== 'ok'` → draw nothing, ask the page to draw again (as today); the day alone moved → ask the page to draw again, drawing normally |
| every press | `askAgain(pid, on, onClose, t)` (name and signature kept) for the three editors; `giveAsked()` at `#apvGo` (new — Give access had none) | `judge(…, 'press') !== 'ok'` → nothing sent, the entry closes, the note |
| as the page goes | `useNoteAsPageGoes(work, onScreen)` and `takenAwayUnder(o)` (both names kept — `docs/data-schema.md` names `takenAwayUnder`) | the last draw's entries in a ref; on unmount, for each: `isAdmin() && !pageOffered('admin')` and `judge(…, 'leaving') === 'changed'` and `noteOwed` → the note, once per entry |

### 2.4 What each of today's functions becomes

| Today | Becomes |
|---|---|
| `rolledForward` | **removed** — nothing in a copy is the clock's; an unset box shows today live |
| `shownNow` (the date masking) | **removed**; `rowChanged` compares `shownOf` whole again |
| `rowChanged` | **kept by name** (data-schema names it) as `judge(row, at) !== 'ok'` for its callers (`ForeignEditor`'s `onPick`, `useJudgedOnDraw`, `askAgain`); its body becomes the row half of `judge` |
| `pickCannotGo` | **kept**, inside the row's stored-fact step (the pick's own started-on: the sign-in it was made on) |
| `pickNowHeld` | **kept**, the short row's settle step on a kept draw — the one mark the store may clear, a named pin (§1.2) |
| `Waiting`'s `lost` / `view` / `opened` / `changed` | **removed** — the page's one note state; started-on `view`; `giveDiffers` |
| `useRingLanding`'s search choice | **changed** (§2.6) |
| `closedByHisPick` / `leftByHisPick` | **merged** into the judge's `pick` step (one rule for draw and leaving) |
| `useOpenRowJudged` | **replaced** by `useOpenWorkJudged`; its row-only list logic (`left`, `lost`, `still`, `see`) kept as is (§2.5); its `hold({ …on, view })` **removed** (no entry outlives a change of the squadron in view) |
| `ownWrite` | keeps the fresh copy (`judgedNow` keeping `view` and `actor`); **drops** the post-in keeping (the copy has no date) |
| `typedDiffers`, `boxesDiffer`, `shortUnsaved`, `rowWork`, `useRowReports` | kept by name; the first two read the marks (§1.2) |
| `adminThere`, `toggle`, `rowLocks`, `shownOf`, `judgedNow`, `saidChanged` | kept by name (data-schema names `adminThere`, `toggle`, `rowLocks`) |
| `startApprove` / `Approving` | `giveFrom` / `GiveWork` (§1.1) |

### 2.5 Left as it is — the list around the row

`SeenAt`, `PageAt`, `hisOwnAsBefore`, `stillListed`, `left`, `lost`, `wrote` stay: they compare the admin's OWN controls
(his search, ticks, fold, `shown`, the row's own writes) between two draws — page state he alone changes — not a stored
fact or a clock. Their pins (rejudge3 §13, §14; rejudge5 §33; rejudge4 §26 "a row's own write that takes the man off the
list raises no note") stay green.

### 2.6 The bell landing

`useRingLanding` keeps `closedNow` (a landing for another man closes the open ROW as his own act, silent — rejudge4 §22,
rejudge5 §31, rejudge6 §37; Give access is untouched by a landing, as today). For a landing on the man whose row is open:
- listed with the search empty → `setFind('')` (rejudge7 §41 pin, as today);
- else, the current search finds him (`rowInView(usersView(unit, today, q, filt, master), pid, …)`) → the search kept
  (rejudge7 §41's two tests);
- else → `setFind(cs(pid))`, so the search finds him (Astra-7 #2, opus2-7 #3).
The fold as today. The extra helper is the page's, handed in like `listedWithoutSearch`.

### 2.7 C — the seam only

`openWork(slot: 'row' | 'give', entry)` is the ONE place an entry is put in (`toggle`, Give access's button). Today, and
until he answers C, it replaces what the slot holds without a word (opus1-7 F4). A comment there names C:
"refusing a second Give access, or another man's row, while one holds a change — his question, not built". Nothing more.

---

## 3. The open findings and what closes each

Closed in round 7 and held by its lasting tests (kept green; A/B close their causes for good): **Astra-6 #1** (Save name
erased the picked date's standing — A: no date in the copy), **opus1-6 F1** (Give access dropped silently at midnight /
Undo / Redo — B's one note), **opus2-6 F1** (the landing hid the row — residue below), **opus2-6 F2** (midnight threw a
typed callsign — A). Security-6: no finding.

| Finding (fixread7 unless marked) | Closed by |
|---|---|
| opus1 F1, opus2 #1, security #1 — a date he picks equal to the box's opening day, after midnight, is rolled to today; Restore posts the wrong day | A — the explicit `set.postIn`; nothing rolls |
| Astra #1 — a changed Give access goes without a word when the app takes the Admin page away | B — as the page goes, Give access is an entry like the row |
| Astra #2, opus2 #3 (residue of opus2-6 F1) — a landing on the open man keeps a search that hides him | B §2.6 |
| opus1 F5 — a changed Give access he had put away says the note when the clock throws it away | B — the note only where on screen at the last draw |
| opus2 #2 — a View-only pick leaves a stale "his pick" that silences a later loss | B §2.1 step 2 — no entry outlives a change of the squadron in view (the proof's premise, the form surviving the pick, can no longer arise) |
| opus1 F2, F3; opus1-6 F2 — Add a person across his own move at midnight | §8, conditional on his answer to chat 204's question 25 |

**NOT closed by A/B, said plainly:**
- **C** — opus1-7 F4: one press on another request's Give access, or another man's row, drops the open one's change
  without a word. His question; pinned as built (§5.1, §48).
- **Two people at the keys** — security-6's note (a pick made equal and back with nothing redrawn between) and any note
  timing between two admins: filed for the database step (brief-8's rule).
- **A bell tap is not asked by the leave-guard** (opus1-6 note): a landing for another man still drops a held row's
  typing as his own act — for the core's K6 and him.
- **"Open it again" on an answered request** (round 7's choice, `[ROW-NOTE-OPEN-AGAIN]`): words, BLOCKED for him.

---

## 4. What a person sees differently — no new words

1. An archived man's post-in date he picked is his: picked back to yesterday's opening day after midnight it stays, and
   Restore uses it. (A box he never touched still follows today, as since round 7.)
2. **Give access → New person: the Post in box he never touched shows today, also after midnight** (it stayed on the day
   the form opened, and "Add person and give access" sent that day). A press past midnight with nothing redrawn on such a
   box sends nothing and says the existing note naming the request. *The one change of a box he can see — named for the
   host to put in front of him with its picture before the build is shown (D853); no words change.*
3. A changed Give access says the existing note once when the app takes the Admin page away (a Plan of his lowered).
4. A changed Give access he had put out of sight (another Admin card) goes without a word when the clock or his Undo
   throws it away — as an open row he had put away does.
5. A bell tap for the man whose row he had hidden with his own search brings the row back into view, ringed — the search
   reading his callsign where it did not find him.
6. Inside the app nothing else: a change of the squadron in view now closes every open piece of work, but in the app
   such a pick (one he only views) takes the Admin page away already (rejudge3 §12, rejudge4 §25). Only tests that draw
   Users without the app see it (§5.2).

Anything needing words — C, the add form's note (§8), "Open it again" for an answered request — is BLOCKED for him, not
planned.

---

## 5. The tests

### 5.1 Failing first — `src/ui/msq-s2-rejudge8.test.tsx` (new), §43–§49

Write them first, from the readers' proofs (moved in, made lasting: the app's own words through
`changedWhileOpenWords`, never a typed apostrophe), and see them fail on the code as it stands. Then build.

- **§43 — the date he set is his.** opus1-7 proof 1 ("Kestrel picks 17 Jul, midnight passes (a draw), on 16 Jul he picks
  15 Jul: the box keeps 15 Jul, and Restore posts him in on 15 Jul", and its control as a pin); opus2-7 proof 1 ("opened
  15 Jul, he picks 16 Jul; next day he picks 15 Jul — the box keeps 15 Jul, counted"); security-7 proof 4 ("his pick of
  15 Jul made on the 16th stays 15 Jul, and Restore sends 15 Jul"); new: "Give access, New person: the Post in box he
  never touched reads the new day after a draw past midnight, and Add person and give access posts him in on it";
  "pin: … a press past midnight with nothing redrawn on that box sends nothing, the note once naming the request".
- **§44 — Give access as the app takes the Admin page away.** Astra-7 proof 1, `it.each([false, true])` (changed: the
  note once, naming "Newface", and not again on a later draw; unchanged: silent), the whole app in strict mode.
- **§45 — Give access put away.** opus1-7 proof 5 ("Saber leaves Users with Give access changed; his move lands at
  midnight: no note"). Its control — on screen, the note once — is rejudge7 §42's, not repeated.
- **§46 — the landing brings the open man into view.** Astra-7 proof 2 (strict false/true); opus2-7 proof 2.
- **§47 — no work outlives a change of the squadron in view.** Without the app: Hunter (View of 150) picks 150 with an
  unchanged Give access open — the form is gone, nothing said, nothing counted; the same with Ranger's untouched row.
  With the app: opus2-7 proof 3's control ("Give access opened and changed on 142, no pick; Ranger renamed to the asker
  on his row: the note once"). opus2-7 proof 3's three main tests are **not** made lasting: their premise (the form
  surviving a View-only pick) cannot arise any more — say so in the section's comment.
- **§48 — pins, C as built until he answers.** opus1-7 proof 4's two cases, asserting today's behaviour: "pin (as built
  until his answer on C): Give access pressed for another request replaces the open one, nothing said"; "pin (…): a
  press on another man's row replaces the open row, nothing said". They change only on his answer.
- **§49 — the one judge.** Strict mode: one change closes a changed row and a changed Give access in one draw (Saber's
  own move landing at midnight, both on screen) — two notes, each once, each its own callsign; after it nothing counted
  (`workOn('userrow')`, `workOn('giveaccess')` false). Pin: "a Give access opened under a session whose account then
  lapses: its press sends nothing, the note" (Give access's new press check).

### 5.2 Existing S2 tests re-pointed by name (expected — each with its reason in the test's own comment)

The cause of all but the last: no entry outlives a change of the squadron in view (§2.1).
- rejudge2 §10, "pin: Hunter (View of 150 only) picks 150 with Ranger's whole row open on 142's page …: his own pages stay
  142's, so the row stays open, no note" → "… the row closes without a word (his own pick)".
- rejudge2 §10, "Hunter's row of Ranger survives his View-only pick of 150; then his own move to 150 lands at midnight …"
  and "… then a master admin gives him Plan of 150 …" → the row is OPENED AFTER the View-only pick (started on view 150);
  the rest unchanged (closes with the note, once — the view did not move at that close, so it is not his pick: §2.1's
  exactness held by a test).
- rejudge5 §27, "pin: his pick of a squadron he only views (150) — the page's own squadron as it was, the row open" →
  "… the row closes without a word, nothing written".
- rejudge4 §20, `ARCH_MAY_USE` gains `effectiveToday` — "the box he never set shows today live; a clock reading, never
  a reading of the man". `WHOLE_MAY_USE`, `WHOLE_PROPS`, `ARCH_PROPS` unchanged (keep the editors' props exactly).
Expected green unchanged (the builder checks each): rejudge4 §19 (midnight with a redraw: open, the box on the new day;
with nothing redrawn: strict); rejudge6 §38's five; rejudge7 §40–§42; rejudge5 §29, §30, §34; rejudge6 §36, §39;
rejudge3 §12, §15; rejudge4 §25, §26 and "pin (the Fable read's bound): a master admin's own move to the squadron he has
picked lands at midnight — … the row stays open". Any other test that goes red is a finding to understand, never an
assertion to soften: report it by name.

### 5.3 Kept green, untouched

- Every `src/ui/msq-s2-*.test.tsx`; `ui/onedoor-users`, `ui/accounts-ui`, `ui/accounts-newperson`, `ui/users-row`,
  `ui/msq-users-filter`, `ui/postout-landing`, `ui/admin`, `ui/msq-bell-tap`, `state/edit-rights-readers`.
- The security readers' pins: fixread6 `zz-security-proof-1` (8), `-2` (2); fixread7 `zz-security-proof-1` (8), `-2`
  (2), `-3` (2) — copied into `src/ui/` to run, one at a time, then removed (`git status` as found).
- Chat 204's guard files, unchanged and green: `msq-guard-rollcall`, `msq-guard-note`, `msq-guard-g`, `msq-guard-asis`,
  `msq-guard-open` with `-t "userrow|archrow|giveaccess"`.

---

## 6. Order of work — one Opus builder, small passes

Files it may change: `src/ui/UsersPanel.tsx`; `src/ui/AdminPage.tsx` only if the landing needs it (not expected);
`src/ui/msq-s2-*.test.tsx` (the new `msq-s2-rejudge8.test.tsx` included); `docs/file-map.md` (one line for rejudge8).
May NOT change: `src/state/*`, `src/ui/guard.ts`, `src/ui/guardnote*`, `src/ui/Shell.tsx`, `src/test-support/*`,
`src/ui/msq-guard-*`, `.claude/`, `docs/data-schema.md` (hence the names it cites are kept — §2.4).
Run every test from `raptor-port/`, one file at a time (`npx vitest run <file>`); no lock needed for one file. The
type check is `npm run build` (the `tsc --noEmit` here is hollow), only while the checks lock is free
(`node scripts/gatelock.mjs status`). `npm run lint:changed` before handing back.

0. **Tests first.** Write `msq-s2-rejudge8.test.tsx` (§5.1); run it on the code as it stands; record which fail (all but
   the "pin:" tests of §43, §48, §49 should). Commit nothing.
1. **The record and the date (A).** `Shown` loses `postIn`; `Typed.set`; `OpenedOn.actor`; `typedFrom`, `judgedNow`
   updated; `ArchivedEditor`'s box live / its mark / Restore's date; `ownWrite` simplified; `rolledForward` and `shownNow`
   removed; `Drawn.day` held for the archived row and the press rule (§2.1 step 3). Row still in today's separate states
   if that keeps the pass small. Run rejudge4 (§19, §20 with the one re-point), rejudge5 §29, rejudge6 §38, rejudge7 §40,
   rejudge8 §43 (archived part).
2. **One judge for the row (B).** `judge()` / `noteOwed()`; `rowChanged`, `askAgain`, `useJudgedOnDraw` through it;
   `closedByHisPick` / `leftByHisPick` merged; `useOpenWorkJudged` replaces `useOpenRowJudged` (row only), its view
   re-hold removed; `work` state with `openWork` (§2.7). Re-point §5.2's rejudge2 / rejudge5 tests. Run every
   `msq-s2-rejudge*`, `msq-s2-row`, `msq-s2-asis`, `edit-rights-readers`.
3. **Give access joins.** Lift `Waiting`'s state into `work.give`; `giveFrom`, `giveDiffers`, `giveAsked`; the New person
   Post in live; its report stays the literal `useGuardWork('giveaccess', …)` in this file. Run rejudge5 §34, rejudge6
   §39, rejudge7 §42, rejudge8 §43 (Give access part), §45, §47, §48, §49, `onedoor-users`, `msq-guard-open -t giveaccess`.
4. **The landing.** §2.6. Run rejudge7 §41, rejudge6 §37, rejudge4 §22, rejudge5 §31, rejudge8 §46, `msq-bell-tap`, `admin`.
5. **As the page goes, for every entry.** `useNoteAsPageGoes` / `takenAwayUnder` over the entries. Run rejudge3 §12,
   rejudge4 §23–§26, rejudge8 §44. Then the whole §5.3 list, the security pins, `npm run build` (lock free),
   `npm run lint:changed`, `npm run docsize` after the file-map line. Hand back with the executor's footer, each
   re-pointed test named with its reason.
6. **Conditional — only after his answer to chat 204's question 25 (§8).**

---

## 7. Risks and their pins

| Risk | Pin |
|---|---|
| React strict mode double draws: a note said twice, or a close set twice | notes in one page state set in the idempotent shape, toasted by one effect; strict cases in rejudge8 §44, §46, §49 and the existing strict tests (rejudge4 §22–§26, rejudge6 §35–§37, rejudge7 §42) |
| The leave-guard's reports: another chat's roll-call reads `useGuardWork('<id>'` literally in this file | keep the literal calls `useGuardWork('userrow', …)`, `useGuardWork('archrow', …)` (in `useRowReports`), `useGuardWork('giveaccess', …)` (now in the page), `useGuardWork('addperson', …)`, and `useGuardSection('users', …)`; run `msq-guard-rollcall` (R1) |
| The roll-call's frame census: `ui/UsersPanel.tsx` has exactly one frame mark (`escCloses(` in the add form's effect) | write no `role="dialog"`, `aria-modal`, `escCloses(`, `useEscClose(` etc. — **not even in a comment**; run `msq-guard-rollcall` |
| The edit-rights inventory counts calls in this file: `adminOfUnit` 1, `isAdmin` 1 | no new call of either (`actor` reads `signedInAccount()`); run `state/edit-rights-readers` |
| `docs/data-schema.md` names `adminThere`, `rowChanged`, `toggle`, `takenAwayUnder`, `rowLocks` | names kept (§2.4) |
| §20's name and prop lists over the two editors | props unchanged; marks set inline; the one re-point named in §5.2 |
| `actor` closes a row where a test signs in as another person under an open row | no real path (Logout unmounts the page); any such test is re-pointed by name with that reason; if more than a handful, stop and report rather than drop the fact |
| A row or form now closing at a View-only pick in tests that draw Users without the app | the re-points of §5.2; the whole-app tests (rejudge3 §12, rejudge4 §25) prove the app already took the page away |
| `Waiting` lifted: a regrouping or the fold remaking it | it holds no state; its form is drawn from `work.give` by id |
| The midnight re-hold of `drawn.day` loops | set only where it differs, like today's `hold`; one extra draw at midnight |
| React Doctor's complexity findings (`PersonRow`, `useOpenRowJudged`, `UsersPanel` today) | the judge is plain functions outside components; `npm run lint:changed` shows no new finding, or the hook is split |

---

## 8. Conditional, last — Add a person joins the judge

Built ONLY if he picks answer (1) on chat 204's question 25 (the add form closes with a passing note in the D2730 note's
shape when his own move lands). Until then `add()`, the add form and `addFormDiffers` are not touched.

- `OpenWork` gains `add: AddWork | null` — `StartedOn` at the press of "+ Add a person" (and at `useOpenRequest`'s open);
  no stored copy (a new person); typed name, np, role, postIn with `set` marks; the Post in box he never set shows today
  live (the core's `postIn0` comparison, K2b, becomes the mark; its untouched-across-midnight pin stays green).
- `judge` treats it as every entry: a started-on fact differs → the form is emptied and folded (as `shutAdd`, without
  moving the keys), the note once where it was on screen at the last draw; `add()` asks first (press) → nothing added,
  the note; as the page goes, the same.
- The note's words are his answer on 25 — not known; nothing drafted here (D1625, D2441: Opus drafts, a fresh Fable
  adjusts, drawn first).
- Failing-first tests: chat 204's two proofs (named by that chat), with opus1-7 proofs 2 and 3 as the same cases, in a
  §50 of rejudge8; `msq-guard-open -t addperson` and `msq-guard-rollcall` green; the literal `useGuardWork('addperson', …)`
  kept.
