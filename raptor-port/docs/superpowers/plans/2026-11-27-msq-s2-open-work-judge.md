# S2 step U1 — one record of open work, one judge (the reshape after the seventh read; chat 205, 27 Nov 26)

A builder's working document for ONE Opus builder. Written by a fresh Opus planner from the code at `4df95bccc`, the
brief `briefs/2026-11-27-msq-s2-u1-read-brief-8.md`, the builder reports of rounds 4–7 and the readers' reports and
proofs of `fixread6/` and `fixread7/` (side-session notes, `s2-chat205/`); red-teamed by Astra and two fresh Opus
readers (`planread/`), their findings folded in with the orchestrator's calls (the last section). His D2238: open
faults are fixed by reshaping where they come from first; his D2404: a guard rail before another patch. The note's
words are his D2730 Q13, `changedWhileOpenWords(<callsign>)` — **no new words anywhere in this build** (§8's words, if
built, are chat 204's, read by a fresh Fable).

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
/* Give access (lifted from Waiting): started-on, the request as the form shows or sends it, and the mode it opened on */
type GiveOn = StartedOn & {
  req: string   // JSON of { id, name, cs, ini, seat, cat, unit, at } of the request as stored at the press — NEVER `seenBy`
  mode0: Mode   // the mode it opened on (rosterMatch at the press), held — never recomputed from the roster
}
type GiveTyped = { mode: Mode; np: NewPerson; pid: string; role: AccountRole; postIn: string
  set: { mode?: true; np?: true; pid?: true; role?: true; postIn?: true } }
/* the last draw, as the note needs it: was the work on the screen — nothing of the clock */
type Drawn = { onScreen: boolean }
type RowWork  = { pid: string; on: OpenedOn; typed: Typed; drawn: Drawn }
type GiveWork = { id: string; on: GiveOn; typed: GiveTyped; callsign: string; drawn: Drawn }  // callsign: r.cs at the press
type OpenWork = { row: RowWork | null; give: GiveWork | null /* , add: AddWork | null — §8, conditional */ }
```

Notes for the builder:
- `Approving` goes; `startApprove(r)` becomes `giveFrom(r)` returning `{ on, typed, callsign }` (mode and `mode0` from
  `rosterMatch` at the press, np from the request, pid '', role 'main', `postIn: ''`, `set: {}`).
- `GiveOn.req` holds only what the form shows, fills or sends. `seenBy` is rebuilt, possibly in another order, on every
  accounts reload — each Undo / Redo of a people or settings command and each settings rollback (people-settings-commit
  `write` → `rehydrateSettings` → `accountsLoad`; `reloadUnitSettings`) — so holding it closed a changed form at an
  unrelated Undo (opus1 F1, opus2 F2 — proved on today's code).
- **Give access keeps NO copy of** the roster-match note, the archived note or the picker's options (`linkablePeople`):
  they are drawn live from the roster, and a pick they have made stale is refused by the door in its own words
  (`approveRequest`: "That did not save", `pidProblem`, `otherSquadronProblem`) — nothing wrong is written. A, as built
  here, covers the request and the form's own values only.
- `Waiting` becomes presentational: handed `give`, `onTyped`, `onOpen(r)`, `onClose`, `onDone` from the page; it holds
  no state. Its markup and ids unchanged.
- `OpenedOn` keeps every field today's code reads (`unit`, `short`, `home`, `arch`, `view`, `shown`) and gains `actor`.
- `judgedNow(pid)` builds `OpenedOn` (with `actor`); `typedFrom(s)` returns `set: {}`.

### 1.2 How the marks are set and cleared

Set: by his own change event, in the editor's handler, inline (`p.onTyped({ ...typed, name: v, set: { ...typed.set,
name: true } })`) — no new helper name in the two editors (§20's lists, §5.2). Cleared: **only** when the entry goes —
Cancel, his own finishing press (Save, Restore, Restore as, Give access / Add person and give access …), or any close.
No value he types or picks clears a mark, whatever it equals (opus1 F2, opus2 F6; the orchestrator's call 1).

The short row's `pick` is its own mark (null = not set), and the two ways it is let go stay, each ruled in brief-8 and a
named pin — the pick is a line to SEND, and Save sends it only if it differs from what he holds at that moment:

| The short row's pick let go | Its pin (stays green) |
|---|---|
| he presses the line the man holds (the hand put-back, round 3's security read 1) | rejudge4 §26 "pins: a pick put back by hand is let go, against the line as it stands at the press"; rejudge5 §30 "the short row: … the pick put back by hand: neither …" |
| another admin's change makes the line he holds equal to the pick (`pickNowHeld`, round 6) | rejudge6 §36 (both tests) |

"Differs" (the leave-guard's report, Give access's note) is **a field he set whose value is not its opening value** —
the mark gates, equality never creates one; for a date the mark alone:
- whole: `(set.name && name !== s.name) || (set.role && role !== s.role) || (set.lines && JSON(lines) !== JSON(s.lines))`
  (`typedDiffers`, kept by name);
- archived: `(set.box && box.trim() !== s.box) || !!set.postIn` (`boxesDiffer`, kept by name);
- short: `shortUnsaved` as today;
- Give access: `giveDiffers(g)` — `set.mode && mode !== on.mode0`, `set.np` against the request's cs/ini/seat/cat (from
  `on.req`), `set.pid && pid !== ''`, `set.role && role !== 'main'`, `!!set.postIn`.
So a Role put back to Member, or a callsign typed back, is not counted (rejudge5 §34 "pin: while its request still waits
the changed form counts; put back as it opened, or cancelled, it does not"; rejudge6 §39; the K4 tests "…his typing put
back…" in rejudge3 §12 and rejudge4 §25) — but a date he picked always is.

### 1.3 The date: every selection marks it; each box shows and sends the day of its own draw

- **The shared date box reports every selection.** `DateBox` (`ui/DateBox.tsx`) calls `onChange` only for a day that
  differs from the one held (`if (iso !== p.value) p.onChange(iso)`), so a deliberate pick of the day already shown
  never reached the form, and the mark was missed (Astra 1). It gains ONE optional prop, `onSelect?: (iso: string) =>
  void`, called on every selection, before the existing test; every other date box in the app passes none and behaves
  exactly as today. `PostInField` passes `onSelect` through. The archived row's and Give access's Post in boxes set the
  value and the mark in `onSelect` (`postIn: iso, set: { ...set, postIn: true }`); their `onChange` does nothing more
  (a comment says why: `onSelect` has already written the same pick).
- **Each box computes the day it shows in its own draw** (opus2 F1, the orchestrator's call 3):
  `const day = typed.set.postIn ? typed.postIn : effectiveToday()` in `ArchivedEditor`, and the same in `Waiting` for the
  New person form; `day` is the box's `value` AND the date its date-sending press sends. A press handler is the one of
  the last committed draw, so Restore, Restore as and "Add person and give access" send exactly the day on screen.
- **The strict press past midnight lives inside the press**, with that draw's `day`: where the box is not set and
  `day !== effectiveToday()`, nothing is sent, the entry closes, the note (§2.1 step 3a).
- `shownOf` no longer writes `postIn`; nothing in any copy, and nothing the page holds, is read from the clock.

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
2. **pick** — `pageUnit('schedule') !== w.on.view && enteredByPick()`: the squadron in view moved by his own pick or bell
   tap. **This is not the old guess:** every entry closes on ANY change of the squadron in view (step 3), so no entry
   outlives one, and the flag is read only on the draw where the started-on `view` first differs — the draw after the
   very change that set it (state/store.ts `enterSquadron` sets it at each change of the squadron in view; opus1 checked
   every caller: pick, bell tap, a landing on his own page, the member-view switch, sign-in, the midnight re-entry). The
   leftover flag of opus2-7 #2 can no longer meet an entry. K4 / K5 (D2403, D2590) refuse a pick or the member-view
   switch while any entry differs, so a pick only ever closes unchanged work. **A bell tap that enters another squadron
   is NOT refused today** (state/belltap.ts `enterForLine` → `enterSquadron(…, true)` never asks the guard): it closes
   changed work too, silently — not closed by this build (§3; opus2 F4).
3. **changed** — any started-on fact differs: `pageUnit('own') !== on.unit || pageUnit('schedule') !== on.view ||
   actorNow() !== on.actor || !adminThere(on.unit)`; or, on a draw and as the page goes, the kind's stored facts differ:
   - row: `foreignHere(pid) !== on.short || homeOn(pid, todayIso()) !== on.home || !!P(pid)?.archived !== on.arch ||
     !sameShown(shownOf(pid, kindOf(on)), on.shown) || (on.short && pickCannotGo(pid, typed))` — at a press as well;
   - give: the request is no longer in `waitingHere()`, or the JSON of its shown fields is not `on.req` — on a draw and as
     the page goes only. **At a press a request already gone is the door's to say** (opus1 F5, the orchestrator's call 7):
     §2.3's Give access row.
   3a. **at a press that relies on what the box showed** — the box he never set showed a day that is no longer today
   (`!typed.set.postIn && day !== effectiveToday()`, `day` the press's own draw's): `changed`. Which presses: Restore,
   Restore as and "Add person and give access" (New person) send the date; **Save name and Delete of the archived row
   keep the same check**, because rejudge4 §19 pins "the date rolls past midnight — Save name, with NOTHING redrawn" and
   "— Delete, both taps" (refused, the note, nothing written) since round 4: a press on a screen that still shows
   yesterday is refused whatever it writes. Narrowing it would change those two pins — not done (the orchestrator's
   call 3's proviso).
4. **ok** otherwise.

Each started-on fact is compared, never guessed; "who is looking" stays REQUIRED (`adminThere`, round 5) and is also
compared (`actor`).

### 2.2 The note — one rule, said once, both sentences together

`noteOwed(w, why, at)`:
- at a **press**: closed (`why !== 'ok'`) → the note, always (today's `askAgain` / `saidChanged`; the deleted-man corner
  of round 5 kept);
- on a **draw** or as the page **goes**: `why === 'changed'` AND the entry was on screen at the last draw
  (`w.drawn.onScreen`; for a row, today's `wasDrawn` from `seen`) AND (`w` is a row OR `giveDiffers(w)`).

Rows say it whether or not anything was typed (D2730 Q13 as built since round 1); Give access only when it holds a
change (round 7, pinned: rejudge7 §42 "pin: … with nothing changed in the form — it goes without a word"). This is a
property of the kind, written once in `noteOwed`, not a path's guess. The only silent closes of work on screen: `gone`,
`pick`, the bell landing for another man (his act — §2.6), and his own act on that very work (Save, Cancel, Give access /
Add person and give access, Restore, Delete, Archive, Suspend/Enable, Give sign-in, a press on a request already gone;
Save name leaves the row open with a fresh copy). Words: `changedWhileOpenWords(cs(pid))` for a row,
`changedWhileOpenWords(w.callsign)` for Give access.

**Two notes at once are said together** (Astra 3, the orchestrator's call 6). The app's passing note is one element
whose text each call replaces, so two calls show only the second. The app's one note-batching facility is
`HOOKS.toastBatch` (`ui/toast.ts toastBatch`, installed at boot by `main.tsx`): every toast raised inside it is said as
ONE line when it returns — in order, each note's own words whole, joined by " · ", a repeat said once. So every place
that says notes owed by this page — the draw's effect and the page-going cleanup — says them inside one
`HOOKS.toastBatch(() => { for (const c of callsigns) HOOKS.toast(changedWhileOpenWords(c), 'warn') })`. One note: the
same call, the same words as today. No new words: the two approved sentences, each whole, side by side.
- `ui/toast.ts`'s comment says "Only the publish command opens one" — the builder corrects that one comment sentence in
  the same change (naming Admin → Users' notes owed at one draw); no code there changes. `engine/hooks.ts`'s comment on
  `toastBatch` says the same ("only a publish uses it"); `src/engine/` is not the builder's to change — **filed for the
  host**, not edited.

Once, strict mode included: the draw-time close is computed while drawing (§2.3); the notes owed go into ONE page state
`{ seq, callsigns: string[] }`, set in the idempotent shape used today (`{ seq: (note?.seq ?? 0) + 1, … }` — never a
functional `n => …` updater for the note in the draw) and said in one effect keyed on it, through the batch.

### 2.3 Where it is called — one write of `work` per draw

**One write of `work` per draw** (opus1 F3, the orchestrator's call 5). Several things change `work` in one draw — a
landing's close, the judge's closes, the short row's settle step, `drawn.onScreen` turning true. A plain
`setWork({ ...work, … })` from a second writer would overwrite the first (Ranger's row closed by a landing would come
back open, with his typing, the moment Give access's `onScreen` was re-held). So ONE hook, `useOpenWorkJudged(work, now,
landing)`, computes the next `work` once — taking the landing's `closedNow`, judging each entry, settling the short row,
re-holding `onScreen` — and calls `setWork(next)` once, only where `next` differs from `work`. Every other write of
`work` anywhere (the editors' `onTyped`, `openWork`, `closeWork`, `ownWrite`) is a functional `setWork(w => …)`.

| When | Caller | What it does |
|---|---|---|
| every page draw | `useOpenWorkJudged` (replaces `useOpenRowJudged` and `Waiting`'s in-draw check) | the one computation above; closed entries dropped, notes owed queued |
| every editor draw | `useJudgedOnDraw` (name and signature kept) | `judge(row, 'draw') !== 'ok'` → draw nothing, ask the page to draw again (as today) — nothing about the clock |
| every press of a row | `askAgain(pid, on, onClose, t, day?)` — name kept, one optional argument added: the `day` the archived row's box showed in the draw whose handler runs (§1.3) | `judge(…, 'press') !== 'ok'` → nothing sent, the row closes, the note |
| Give access's press (`#apvGo`) | `giveAsked(g, day)` (new — Give access had none) | started-on facts and the box's day (3a) → nothing sent, the form closes, the note; **the request no longer waiting → the door is called and its own refusal stands ("That request is gone"), and the form goes with that press, silently** — a form is drawn inside its request's row, so it cannot stay on the page once the request is gone; what stays is the door's words, never replaced by the row note (opus1 F5; the orchestrator's call 7 — "the form stays" read so) |
| as the page goes | `useNoteAsPageGoes(work)` and `takenAwayUnder(o)` (both names kept — `docs/data-schema.md` names `takenAwayUnder`) | the last draw's entries in a ref; on unmount, for each: `isAdmin() && !pageOffered('admin')` and `judge(…, 'leaving') === 'changed'` and `noteOwed` → its callsign; all of them said in one batch |

### 2.4 What each of today's functions becomes

| Today | Becomes |
|---|---|
| `rolledForward` | **removed** — nothing in a copy is the clock's; an unset box shows today live |
| `shownNow` (the date masking) | **removed**; `rowChanged` compares `shownOf` whole again |
| `rowChanged` | **kept by name** (data-schema names it) as `judge(row, at) !== 'ok'` for its callers (`ForeignEditor`'s `onPick`, `useJudgedOnDraw`, `askAgain`); its body becomes the row half of `judge` |
| `pickCannotGo` | **kept**, inside the row's stored-fact step (the pick's own started-on: the sign-in it was made on) |
| `pickNowHeld` | **kept**, the short row's settle step on a kept draw — a named pin (§1.2) |
| `Waiting`'s `lost` / `view` / `opened` / `changed` | **removed** — the page's one note state; started-on `view`; `mode0`; `giveDiffers` |
| `useRingLanding`'s search choice | **changed** (§2.6); its `close()` no longer writes `work` itself — `closedNow` is handed to `useOpenWorkJudged` |
| `closedByHisPick` / `leftByHisPick` | **merged** into the judge's `pick` step (one rule for draw and leaving) |
| `useOpenRowJudged` | **replaced** by `useOpenWorkJudged`; its row-only list logic (`left`, `lost`, `still`, `see`) kept as is (§2.5); its `hold({ …on, view })` **removed** (no entry outlives a change of the squadron in view) |
| `ownWrite` | keeps the fresh copy (`judgedNow` keeping `view` and `actor`); **drops** the post-in keeping (the copy has no date); a functional `setWork` |
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
rejudge5 §31, rejudge6 §37), now handed to `useOpenWorkJudged` (§2.3). A landing on his own page leaves Give access as it
is; a bell tap that enters another squadron closes every entry by step 2 (§3). For a landing on the man whose row is open:
- listed with the search empty → `setFind('')` (rejudge7 §41 pin, as today);
- else, the current search finds him (`rowInView(usersView(unit, today, q, filt, master), pid, …)`) → the search kept
  (rejudge7 §41's two tests);
- else → `setFind(cs(pid))`, so the search finds him (Astra-7 #2, opus2-7 #3).
The fold as today. **The Filter's ticks are not touched:** where a tick hides him (a pilot's row open, the WSOs tick
pressed), neither an empty search nor his callsign brings him into view — his row stays held out of sight, as today, and
the claim is narrowed to the search (§3; Astra 5, opus1 F8, opus2 F5).

### 2.7 Opening work, and C's seam

`openWork(slot: 'row' | 'give', entry)` is the ONE place an entry is put in (`toggle`, Give access's button). It applies
`toggle`'s session check to both: where the signed-in account is no longer an admin of the page's squadron
(`adminThere(pageUnit('own'))` false) nothing opens, and where his session has lapsed the app is asked to repaint
(`sessionLapsed()` → `notify()`) — so a Give access form never opens on a lapsed session only to vanish on the next draw
(opus2 F7). Today, and until he answers C, it replaces what the slot holds without a word (opus1-7 F4). A comment there
names C: "refusing a second Give access, or another man's row, while one holds a change — his question, not built".
Nothing more.

---

## 3. The open findings and what closes each

Closed in round 7 and held by its lasting tests (kept green; A/B close their causes for good): **Astra-6 #1** (Save name
erased the picked date's standing — A: no date in the copy), **opus1-6 F1** (Give access dropped silently at midnight /
Undo / Redo — B's one note), **opus2-6 F1** (the landing hid the row — residue below), **opus2-6 F2** (midnight threw a
typed callsign — A). Security-6: no finding.

| Finding (fixread7 unless marked) | Closed by |
|---|---|
| opus1 F1, opus2 #1, security #1 — a date he picks equal to the box's opening day, after midnight, is rolled to today; Restore posts the wrong day | A — every selection marks the date (`onSelect`), the mark stays; nothing rolls |
| Astra #1 — a changed Give access goes without a word when the app takes the Admin page away | B — as the page goes, Give access is an entry like the row |
| Astra #2, opus2 #3 (residue of opus2-6 F1) — a landing on the open man keeps a search that hides him | B §2.6 (where a SEARCH hides him) |
| opus1 F5 — a changed Give access he had put away says the note when the clock throws it away | B — the note only where on screen at the last draw |
| opus2 #2 — a View-only pick leaves a stale "his pick" that silences a later loss | B §2.1 step 2 — no entry outlives a change of the squadron in view (the proof's premise, the form surviving the pick, can no longer arise) |
| opus1 F2, F3; opus1-6 F2 — Add a person across his own move at midnight | §8, conditional on his answer to chat 204's question 25 |

**NOT closed by this build, said plainly:**
- **C** — opus1-7 F4: one press on another request's Give access, or another man's row, drops the open one's change
  without a word. His question; pinned as built (§5.1 §48).
- **A Filter tick hiding the open man** — a bell landing on him does not bring his row into view, and the build clears no
  tick (Astra 5, opus1 F8, opus2 F5). His row stays held, counted, as today.
- **A bell tap that enters another squadron** drops a changed Give access, or a changed row, without a word: the bell tap
  never asks the leave-guard (the core's K6, and him — opus2 F4; opus1-6's note).
- **Two people at the keys** — security-6's note (a pick made equal and back with nothing redrawn between) and any note
  timing between two admins: filed for the database step (brief-8's rule).
- **Give access's live parts** — the roster-match note, the archived note, the picker's options are drawn live, not
  copied (§1.1); the door refuses a stale pick in its own words.
- **"Open it again" on an answered request** (round 7's choice, `[ROW-NOTE-OPEN-AGAIN]`): words, BLOCKED for him.

---

## 4. What a person sees differently — no new words

1. An archived man's post-in date he picks is his — even a pick of the day already shown, even a pick back to the day
   the box opened on: it stays across midnight and Restore uses it. A box he never touched still follows today.
2. **For his look (D853, a picture first):** Give access → New person: the Post in box he never touched shows today, also
   after midnight (it stayed on the day the form opened, and "Add person and give access" sent that day). A press past
   midnight with nothing redrawn on such a box sends nothing and says the existing note naming the request.
3. **For his look:** until §8 is built, "Add a person"'s Post in box beside it still stays on the day its form opened —
   the two boxes behave differently across midnight (opus1 F10).
4. **For his look:** a press of "Give access" / "Add person and give access" under a session that has lapsed with nothing
   redrawn (his account suspended, archived or made a member by another admin) now sends nothing and says the existing
   note, where today the approval could land; and the "Give access" button opens nothing on such a session (opus2 F7).
5. A changed Give access says the existing note once when the app takes the Admin page away (a Plan of his lowered).
6. A changed Give access he had put out of sight (another Admin card) goes without a word when the clock or his Undo
   throws it away — as an open row he had put away does.
7. A bell tap for the man whose row he had hidden with his own search brings the row back into view, ringed — the search
   reading his callsign where it did not find him. (Not where a Filter tick hides him — §3.)
8. Two pieces of work closed at the same moment say their two notes together, one after the other on one line.
9. A press on a request already answered keeps the door's own words ("That request is gone"), never the row note.
10. Inside the app nothing else: a change of the squadron in view now closes every open piece of work, but in the app
    such a pick (one he only views) takes the Admin page away already (rejudge3 §12, rejudge4 §25). Only tests that draw
    Users without the app see it (§5.2).

Anything needing words — C, the add form's note (§8, until his answer), "Open it again" for an answered request — is
BLOCKED for him, not planned.

---

## 5. The tests

### 5.1 Failing first — `src/ui/msq-s2-rejudge8.test.tsx` (new), §43–§49

Write them first, from the readers' proofs (moved in, made lasting: the app's own words through
`changedWhileOpenWords`, never a typed apostrophe), and run them on the code as it stands; **record the actual result of
each** — no test is predicted green beforehand except those named "pin:", which hold today's behaviour. A test of new
behaviour never starts with "pin:" (Astra 6, opus1 F6). Every date in §43 is picked by **pressing the real calendar's
day** (`#accArPostIn` / `#apvPostIn`, then `.dcal-layer [data-iso="…"]`, as rejudge5's `pickDate`) — setting the value
directly would miss Astra 1's fault.

- **§43 — the date he set is his.**
  - opus1-7 proof 1 ("Kestrel picks 17 Jul, midnight passes (a draw), on 16 Jul he picks 15 Jul: the box keeps 15 Jul, and
    Restore posts him in on 15 Jul", its control as a pin); opus2-7 proof 1 ("opened 15 Jul, he picks 16 Jul; next day he
    picks 15 Jul — the box keeps 15 Jul, counted"); security-7 proof 4 ("his pick of 15 Jul made on the 16th stays 15
    Jul, and Restore sends 15 Jul").
  - Astra 1, sequence 1: "the calendar opened on 15 Jul, midnight passes with nothing redrawn, he presses 15 Jul — the day
    shown: it is his; the next draw keeps 15 Jul, counted, and Restore sends 15 Jul".
  - Astra 1, sequence 2 (under the orchestrator's call 1): "he picks 17 Jul on the 15th; on the 17th he presses 17 Jul
    again: still his — across the next midnight the box keeps 17 Jul, counted, and Restore sends 17 Jul".
  - opus1 F2: "on 15 Jul he types a callsign, picks 18 Jul, then 15 Jul (today): still his — after midnight and a draw the
    box keeps 15 Jul, counted, and Restore sends 15 Jul".
  - Give access, New person: "the Post in box he never touched reads the new day after a draw past midnight, and Add
    person and give access posts him in on it"; "a press past midnight with nothing redrawn on that box sends nothing,
    the note once naming the request"; "a Post in he picked — the day shown, pressed in the real calendar — counts and is
    sent as picked".
- **§44 — Give access as the app takes the Admin page away.** Astra-7 proof 1, `it.each([false, true])` (changed: the
  note once, naming "Newface", and not again on a later draw; unchanged: silent), the whole app in strict mode.
- **§45 — Give access put away.** opus1-7 proof 5 ("Saber leaves Users with Give access changed; his move lands at
  midnight: no note"). Its control — on screen, the note once — is rejudge7 §42's, not repeated.
- **§46 — the landing brings the open man into view, and closes only what it should.** Astra-7 proof 2 (strict
  false/true); opus2-7 proof 2; opus1 F3: "Ranger's row changed and an unchanged Give access open while another Admin card
  shows; a bell line for Hunter lands on Users: Ranger's row is closed, not back open, no note, on that draw and the next;
  Give access still open as it was" (strict false/true). Pin: "a Filter tick hides the open man; a landing on him: his
  row stays held out of sight and counted, no note" (§3).
- **§47 — no work outlives a change of the squadron in view.** Without the app: Hunter (View of 150) picks 150 with an
  unchanged Give access open — the form is gone, nothing said, nothing counted; the same with Ranger's untouched row.
  With the app: opus2-7 proof 3's control ("Give access opened and changed on 142, no pick; Ranger renamed to the asker
  on his row: the note once"). opus2-7 proof 3's three main tests are **not** made lasting: their premise (the form
  surviving a View-only pick) cannot arise any more — say so in the section's comment.
- **§48 — pins, C as built until he answers.** opus1-7 proof 4's two cases, asserting today's behaviour: "pin (as built
  until his answer on C): Give access pressed for another request replaces the open one, nothing said"; "pin (…): a
  press on another man's row replaces the open row, nothing said". They change only on his answer.
- **§49 — the one judge, Give access's copy and its press.**
  - Two notes at once (Astra 3): with the real note display — the test installs `ui/toast.ts`'s `toast` and `toastBatch`
    as `HOOKS.toast` / `HOOKS.toastBatch`, as `leavewar/noperiod-join.test.ts` does, and reads `#toastEl` — Saber's own
    move lands at midnight with a changed row (Ranger) and a changed Give access (Newface) both on screen, strict mode:
    the shown text holds BOTH whole sentences, `changedWhileOpenWords('Ranger')` and `changedWhileOpenWords('Newface')`,
    once each; nothing counted after (`workOn('userrow')`, `workOn('giveaccess')` false).
  - The Undo of an unrelated change (opus1 F1, opus2 F2): "Kestrel's changed Give access survives his own Undo of an
    unrelated save — the form stays, nothing said, still counted" (with the earlier request Hunter saw, so `seenBy` is
    rebuilt in another order — opus1's sequence); "Saber's own Undo of Ranger's View of 149 with Give access changed: the
    form stays, nothing said" (opus2's sequence).
  - The mode it opened on (Astra 2, opus2 F3, opus1 F9): "opened as New person (nobody matches), switched to On the
    roster; Newface then added by Add a person with no sign-in: the switch still counts, and a pick of another squadron is
    refused"; the reverse: "opened On the roster (a roster match), switched to New person; that man archived on his own
    row: the switch still counts".
  - A request already gone at the press (opus1 F5): "the request answered by another admin, nothing redrawn; Give access
    pressed: the door's 'That request is gone', nothing written, no row note".
  - A lapsed session (Astra 6, opus2 F7): "Give access opened, the signed-in account then suspended with nothing redrawn;
    'Give access' (On the roster) pressed: nothing written, the note" and the same for "Add person and give access" (New
    person); "the Give access button on a lapsed session opens nothing and the app repaints".

### 5.2 Existing tests re-pointed by name (expected — each with its reason in the test's own comment)

- rejudge6 §38, "pin: his date picked, then picked back to the day the box opened on: untouched again — midnight rolls
  the box to the new day …" → "pin: his date picked back to the day the box opened on is his: it stays on that day
  across midnight, counted, no note" — reason: the mark, once set, stays his; only Cancel, his own finishing press or a
  close clears it (the orchestrator's call 1; opus1 F2, opus2 F6).
- (Give access had no such pin; its rule is the same, §43.)
- The View-only pick — no entry outlives a change of the squadron in view (§2.1):
  - rejudge2 §10, "pin: Hunter (View of 150 only) picks 150 with Ranger's whole row open on 142's page …: his own pages
    stay 142's, so the row stays open, no note" → "… the row closes without a word (his own pick)".
  - rejudge2 §10, "Hunter's row of Ranger survives his View-only pick of 150; then his own move to 150 lands at midnight
    …" and "… then a master admin gives him Plan of 150 …" → the row is OPENED AFTER the View-only pick (started on view
    150); the rest unchanged (closes with the note, once — the view did not move at that close, so it is not his pick:
    §2.1's exactness held by a test).
  - rejudge5 §27, "pin: his pick of a squadron he only views (150) — the page's own squadron as it was, the row open" →
    "… the row closes without a word, nothing written".
- rejudge4 §20, `ARCH_MAY_USE` gains `effectiveToday` — "the box he never set shows today live, and its press checks the
  day it showed: a clock reading, never a reading of the man". `askAgain` keeps its name (its new optional argument is
  not a name). `WHOLE_MAY_USE`, `WHOLE_PROPS`, `ARCH_PROPS` unchanged (the editors' props kept exactly; `PostInField`'s
  new `onSelect` is a prop of the part, not of the editor).

Expected green unchanged (the builder checks each): rejudge4 §19 (midnight with a redraw: open, the box on the new day;
with nothing redrawn, Restore as, Save name and Delete each refused with the note — §2.1 3a); rejudge6 §38's other four;
rejudge7 §40–§42; rejudge5 §29, §30, §34; rejudge6 §36, §39; rejudge3 §12, §15; rejudge4 §25, §26 and "pin (the Fable
read's bound): a master admin's own move to the squadron he has picked lands at midnight — … the row stays open". Any
other test that goes red is a finding to understand, never an assertion to soften: report it by name.

### 5.3 Kept green, untouched

- Every `src/ui/msq-s2-*.test.tsx`; `ui/onedoor-users`, `ui/accounts-ui`, `ui/accounts-newperson`, `ui/users-row`,
  `ui/msq-users-filter`, `ui/postout-landing`, `ui/admin`, `ui/msq-bell-tap`, `state/edit-rights-readers`,
  `leavewar/noperiod-join` (the batch's own test), and the date box's own tests (every file that imports `DateBox` or
  draws `.dcal-layer` — the builder lists them with a search before pass 1 and runs each).
- The security readers' pins: fixread6 `zz-security-proof-1` (8), `-2` (2); fixread7 `zz-security-proof-1` (8), `-2`
  (2), `-3` (2) — copied into `src/ui/` to run, one at a time, then removed (`git status` as found).
- Chat 204's guard files, unchanged and green: `msq-guard-rollcall`, `msq-guard-note`, `msq-guard-doors`,
  `msq-guard-doors-switch` (they open Give access through the test kit and count `giveaccess` — opus1 F7), `msq-guard-g`,
  `msq-guard-asis`, `msq-guard-open` with `-t "userrow|archrow|giveaccess"`.

---

## 6. Order of work — one Opus builder, small passes

Files it may change: `src/ui/UsersPanel.tsx`; `src/ui/DateBox.tsx` — **only** the one optional `onSelect` prop and its
one call (§1.3); `src/ui/toast.ts` — **only** the one comment sentence of §2.2; `src/ui/AdminPage.tsx` only if the
landing needs it (not expected); `src/ui/msq-s2-*.test.tsx` (the new `msq-s2-rejudge8.test.tsx` included);
`docs/file-map.md` (one line for rejudge8). May NOT change: `src/state/*`, `src/engine/*` (its stale `toastBatch`
comment is filed for the host), `src/ui/guard.ts`, `src/ui/guardnote*`, `src/ui/Shell.tsx`, `src/test-support/*`,
`src/ui/msq-guard-*`, `.claude/`, `docs/data-schema.md` (hence the names it cites are kept — §2.4).
Run every test from `raptor-port/`, one file at a time (`npx vitest run <file>`); no lock needed for one file. The
type check is `npm run build` (the `tsc --noEmit` here is hollow), only while the checks lock is free
(`node scripts/gatelock.mjs status`). `npm run lint:changed` before handing back.

0. **Tests first.** Write `msq-s2-rejudge8.test.tsx` (§5.1); run it on the code as it stands; record each test's actual
   result. Commit nothing.
1. **The record and the date (A).** `DateBox`'s `onSelect`, `PostInField` passing it; `Shown` loses `postIn`;
   `Typed.set`; `OpenedOn.actor`; `typedFrom`, `judgedNow` updated; `ArchivedEditor`'s `day`, its `onSelect` mark, its
   value and Restore's date from `day`, `askAgain`'s `day` argument at its four presses; `ownWrite` simplified;
   `rolledForward` and `shownNow` removed. Re-point rejudge6 §38's pin and §20's `ARCH_MAY_USE` (§5.2). Run rejudge4
   (§19, §20), rejudge5 §29, rejudge6 §38, rejudge7 §40, rejudge8 §43 (archived part), the date box's own tests.
2. **One judge for the row (B).** `judge()` / `noteOwed()`; `rowChanged`, `askAgain`, `useJudgedOnDraw` through it;
   `closedByHisPick` / `leftByHisPick` merged; the `work` state, `openWork` with the session check (§2.7), every write
   functional; `useOpenWorkJudged` replaces `useOpenRowJudged` (row only), the landing's `closedNow` handed to it, its view
   re-hold removed; the notes said through `HOOKS.toastBatch`, the `ui/toast.ts` comment. Re-point §5.2's rejudge2 /
   rejudge5 tests. Run every `msq-s2-rejudge*`, `msq-s2-row`, `msq-s2-asis`, `edit-rights-readers`, `noperiod-join`.
3. **Give access joins.** Lift `Waiting`'s state into `work.give`; `giveFrom` (with `mode0`), `giveDiffers`,
   `giveAsked` (with the request-gone path); the New person Post in's `day`, `onSelect` and press check; its report stays
   the literal `useGuardWork('giveaccess', …)` in this file. Run rejudge5 §34, rejudge6 §39, rejudge7 §42, rejudge8 §43
   (Give access part), §45, §47, §48, §49, `onedoor-users`, `msq-guard-doors`, `msq-guard-doors-switch`,
   `msq-guard-open -t giveaccess`.
4. **The landing.** §2.6. Run rejudge7 §41, rejudge6 §37, rejudge4 §22, rejudge5 §31, rejudge8 §46, `msq-bell-tap`, `admin`.
5. **As the page goes, for every entry.** `useNoteAsPageGoes` / `takenAwayUnder` over the entries, through the batch. Run
   rejudge3 §12, rejudge4 §23–§26, rejudge8 §44, §49. Then the whole §5.3 list, the security pins, `npm run build` (lock
   free), `npm run lint:changed`, `npm run docsize` after the file-map line. Hand back with the executor's footer, each
   re-pointed test named with its reason, and §43–§49's results before and after.
6. **Conditional — only after his answer to chat 204's question 25 (§8).**

---

## 7. Risks and their pins

| Risk | Pin |
|---|---|
| React strict mode double draws: a note said twice, or a close set twice | notes in one page state set in the idempotent shape, said by one effect through the batch; `work` written once per draw (§2.3); strict cases in rejudge8 §44, §46, §49 and the existing strict tests (rejudge4 §22–§26, rejudge6 §35–§37, rejudge7 §42) |
| Two writers of `work` in one draw — a closed row brought back open | one computation per draw in `useOpenWorkJudged`, every other write functional; rejudge8 §46's opus1 F3 test |
| Two notes in one moment, the second replacing the first on screen | `HOOKS.toastBatch`; rejudge8 §49 reads the real note element, never counts calls |
| The shared date box changed for every calendar | one optional prop, absent everywhere else, the existing `onChange` test untouched; the date box's own tests and every file drawing it run (§5.3) |
| The leave-guard's reports: another chat's roll-call reads `useGuardWork('<id>'` literally in this file | keep the literal calls `useGuardWork('userrow', …)`, `useGuardWork('archrow', …)` (in `useRowReports`), `useGuardWork('giveaccess', …)` (now in the page), `useGuardWork('addperson', …)`, and `useGuardSection('users', …)`; run `msq-guard-rollcall` (R1) |
| The roll-call's frame census: `ui/UsersPanel.tsx` has exactly one frame mark (`escCloses(` in the add form's effect); `ui/DateBox.tsx` has its two | write no `role="dialog"`, `aria-modal`, `escCloses(`, `useEscClose(` etc. in either file — **not even in a comment**; run `msq-guard-rollcall` |
| The edit-rights inventory counts calls in this file: `adminOfUnit` 1, `isAdmin` 1 | no new call of either (`actor` reads `signedInAccount()`; `openWork`'s check is `adminThere`); run `state/edit-rights-readers` |
| `docs/data-schema.md` names `adminThere`, `rowChanged`, `toggle`, `takenAwayUnder`, `rowLocks` | names kept (§2.4) |
| §20's name and prop lists over the two editors | props unchanged; marks set inline; `askAgain`'s extra argument is not a name; the one re-point named in §5.2 |
| `GiveOn.req` closing a changed form at an unrelated reload | only the shown fields, never `seenBy`; rejudge8 §49's two Undo tests |
| `actor` closes a row where a test signs in as another person under an open row | no real path (Logout unmounts the page); any such test is re-pointed by name with that reason; if more than a handful, stop and report rather than drop the fact |
| A row or form now closing at a View-only pick in tests that draw Users without the app | the re-points of §5.2; the whole-app tests (rejudge3 §12, rejudge4 §25) prove the app already took the page away |
| A date once picked now always counts — a pick of another squadron refused where a date was picked and picked back | ruled by the orchestrator's call 1 (his work is his until he cancels); any K4 test that picks a date and then expects a pick through is a finding to report by name, not an assertion to soften |
| `Waiting` lifted: a regrouping or the fold remaking it | it holds no state; its form is drawn from `work.give` by id |
| React Doctor's complexity findings (`PersonRow`, `useOpenRowJudged`, `UsersPanel` today) | the judge is plain functions outside components; `npm run lint:changed` shows no new finding, or the hook is split |

---

## 8. Conditional, last — Add a person joins the judge

Built ONLY if he picks answer (1) on chat 204's question 25 (the add form closes with a passing note in the D2730 note's
shape when his own move lands). Until then `add()`, the add form and `addFormDiffers` are not touched. **If he picks (2),
the stale-date case below goes to chat 204, not built here.**

- `OpenWork` gains `add: AddWork | null` — `StartedOn` at the press of "+ Add a person" (and at `useOpenRequest`'s open);
  no stored copy (a new person); typed name, np, role, postIn with `set` marks, cleared only when the form is emptied
  (Cancel, Escape, a finished Add, a close).
- **The Post in box he never set shows today live.** Today the form left open across midnight keeps yesterday's date:
  its box stays on the day it opened (`postIn` and `postIn0` are both that day) and Add posts him in on yesterday. Under
  A the box computes its day in its own draw, as §1.3's do (`set.postIn ? postIn : effectiveToday()`), with `onSelect`,
  and Add sends that day; the core's `postIn0` comparison (K2b) becomes the mark — the K2b pin (an untouched form across
  midnight is not counted) stays green. Failing-first test (§50): "Add a person opened on 15 Jul, a callsign typed, the
  date untouched; midnight and a draw: the box reads 16 Jul, and Add posts him in on 16 Jul".
- `judge` treats it as every entry: a started-on fact differs → the form is emptied and folded (as `shutAdd`, without
  moving the keys), the note once where it was on screen at the last draw; `add()` asks first (press) → nothing added,
  the note; as the page goes, the same — said through the batch with any other note owed.
- **Its note's words, if he picks (1):** "You are 150’s from today, so Bandit was not added to 142." — chat 204's, read
  by a fresh Fable (D2441); built from the squadrons' numbers and the callsign typed, its apostrophe the curly one.
  Where no callsign was typed, the words for that case are chat 204's to give — none drafted here.
- Failing-first tests (§50 of rejudge8): chat 204's two proofs (named by that chat), with opus1-7 proofs 2 and 3 as the
  same cases, and the stale-date test above; `msq-guard-open -t addperson` and `msq-guard-rollcall` green; the literal
  `useGuardWork('addperson', …)` kept.

---

## Red team, folded in

Three blind readers of this plan (`planread/astra`, `planread/opus1`, `planread/opus2`), each "ready after changes";
folded with the orchestrator's calls (numbered as he gave them).

| Finding | What changed | Where |
|---|---|---|
| Astra 1 — the date box reports only a pick that differs, so a deliberate pick of the day shown never marks it | `DateBox` gains the optional `onSelect` (every selection); these two forms use it; other calendars unchanged; tests press the real calendar day, both of Astra's sequences (call 2) | §1.3; §5.1 §43; §6 (files, pass 1); §7 |
| Astra 2, opus2 F3, opus1 F9 — Give access holds no opening mode; recomputing it from the roster misjudges a switch | `GiveOn.mode0` held at the press; `giveDiffers` compares with it; Give access keeps no copy of the match note, archived note or picker options — said plainly (call 4) | §1.1; §1.2; §3; §5.1 §49 |
| Astra 3 — two notes in one moment show only the second | both said in one `HOOKS.toastBatch` (the app's existing batch), each sentence whole; the test reads the real note element; the stale comment in `ui/toast.ts` corrected, `engine/hooks.ts`'s filed (call 6) | §2.2; §5.1 §49; §6; §7 |
| Astra 4, opus1 F4, opus2 F1 — the press-past-midnight check needed a day no caller could hand in | `Drawn.day` and the page's midnight re-hold dropped; each box computes its day in its own draw, used for its value and the date sent; the check inside the press via `askAgain`'s optional `day`; kept for Save name and Delete too, because rejudge4 §19 pins them; `ARCH_MAY_USE` gains `effectiveToday` (call 3) | §1.1; §1.3; §2.1 (3a); §2.3; §5.2 |
| Astra 5, opus1 F8, opus2 F5 — a Filter tick hiding the open man defeats the landing | stated as NOT closed; no tick cleared in this build; a pin test (call 8) | §2.6; §3; §4 item 7; §5.1 §46 |
| Astra 6, opus1 F6 — new behaviour labelled "pin:"; a blanket prediction of what passes | renamed; no prediction — each result recorded before and after (call 10) | §5.1; §6 step 0 |
| opus1 F1, opus2 F2 — `GiveOn.req` held `seenBy`, rebuilt in another order on every reload; an unrelated Undo closed a changed form | `req` = the shown fields `{ id, name, cs, ini, seat, cat, unit, at }`, never `seenBy`; both readers' Undo sequences as §49 tests (call 4) | §1.1; §5.1 §49; §7 |
| opus1 F2, opus2 F6 — "picked back to today = not set" cleared his mark by equality | the mark, once set, stays; only Cancel, his finishing press or a close clears it; rejudge6 §38's pin re-pointed by name; Give access the same (call 1) | §1.2; §1.3; §4 item 1; §5.1 §43; §5.2 |
| opus1 F3 — several writers of `work` in one draw could bring a closed row back open | one computation and one write per draw in `useOpenWorkJudged`, the landing's `closedNow` handed to it, every other write functional; a §46 test with Give access open (call 5) | §2.3; §2.4; §2.6; §5.1 §46; §7 |
| opus1 F5 — a press on a request already gone would say the row note | the door's own refusal stands; only started-on facts close with the note at a press. "The form stays" is read as: the door's words stay, never replaced by the row note — the form itself goes with that press, because it is drawn inside its request's row and cannot stay once the request is gone (call 7) | §2.1 step 3; §2.2; §2.3; §4 item 9; §5.1 §49 |
| opus1 F7 — three guard files left out of the run list | `msq-guard-doors`, `msq-guard-doors-switch`, `msq-guard-note` added (call 10) | §5.3; §6 pass 3 |
| opus1 F10 — Add a person's Post in differs from Give access's until §8 | named for his look (call 9) | §4 item 3 |
| opus2 F4 — the "pick" step claimed more than it closes: a bell tap entering another squadron drops changed work silently | step 2's sentence corrected; listed NOT closed (the core's K6 and him) (call 8) | §2.1 step 2; §2.6; §3 |
| opus2 F7 — the new press check refuses where an approval used to land; the Give access button opened forms on a lapsed session | named for his look; `openWork` applies `toggle`'s session check to Give access (call 9); §49's lapsed-session tests, both modes | §2.7; §4 item 4; §5.1 §49 |
| Orchestrator's call 11 — the add form keeps yesterday's post-in across midnight | §8 gains the stale-date case, its failing-first test, and the note's words if he picks (1); to chat 204 if he picks (2) | §8 |

Not folded as asked, with why: **opus1 F5 / call 7's "the form stays"** — the form is drawn inside its request's row, so
once the request is gone it cannot stay on the page; what the plan keeps is the door's own words, with no row note after
them (the reading above). **`engine/hooks.ts`'s stale comment** on `toastBatch` — `src/engine/` is outside the builder's
files; filed for the host.
