# Plan — the change-recording re-test, with `[UNDO-ROSTER-SETTINGS]`, D148 and `[UNDO-TOPBAR]` (28 Sep 26)

Branch `claude/change-recording-retest` (the main checkout, cut from `main` at `60a6792c`). Written by Opus 5.5; red-teamed
by Fable 5.1 and Astra before any code (the owner's order, 28 Sep 26: *"have Fable and Astra design the scenarios first,
plan it with Opus 5.5 on high thinking, have both red-team the plan, then walk, build and FULL-check it per the bug-check
order"*). Rulings range D347–D359. Ports: preview 4173 (`raptor-walk`), browser tests `E2E_PORT=4190`.

**Inputs this plan is built from** (read them; the plan does not repeat them):
- The scenario reports — `docs/superpowers/briefs/2026-09-28-change-recording-scenarios-fable.md` (S1–S32, §3 fixes) and
  `…-astra.md` (scenarios 1–26, §3.2 sequence). Both reviewers agree on every point this plan builds; where they differ
  it says so (§9).
- The owner's rulings of the day: **D347** (every Undo / Redo pair in the top bar, Edit Schedule's place and look, desktop
  and phone), **D348** (the phone's order is the desktop's: Undo · Redo · (clock) · Sync dot · bell at the far right; the
  changes clock stays Edit Schedule's), **D349** (the mock-up `docs/mock/undo-topbar.html` v4 approved — the Tracker's
  pair moves too; the board's bar gets Sync and the bell and ONE exit, ✓ Done; on a phone Sort all and the layout switch
  behind one ⋯), **D350** (adding / archiving / restoring / deleting a person and postings stay out of Undo —
  `[UNDO-POSTING-RECORD]`), with **D148** (undo only your own; clears at sign-out; refuses saying who) and the 16 Sep 26
  rule "roster and settings edits ARE undoable" (register AM39d, narrowed by D350).
- The baseline walk `scripts/handpass/cr-base.mjs` (today a Quals, Logic or Admin change is passed over by Undo; Quals,
  Admin, Logic and Inputs carry no Undo).
- **Pending (his ask, in flight):** Fable and Astra reviewing which changes should and should not be undoable
  (`docs/superpowers/briefs/2026-09-28-change-recording-undoable-list-brief.md`), with the one open question — is the Leave
  War's stage (Open for bidding / Bidding closed / Published) taken back by Undo? This plan assumes **yes, as today**, and
  moves one line (§4 B2) if the answer is no.

---

## 0. Tier — FULL (bug-check order §5)

| # | Question | Answer, with its reason |
|---|---|---|
| 1 | Money / owed | YES — Undo takes back OIL decisions, OIL awards, publishes (which credit OIL); the re-test walks them |
| 2 | The published record | YES — undo of a publish is an Unpublish (AM39c); a Quals CAT or a rule change undone moves a published day's pending (D98, D186, D179) |
| 3 | Saved data | YES — a people / settings restore writes the stored roster, accounts and rules |
| 4 | A shared drawer | YES — the top bar and the board's bar are drawn on every page |
| 5 | A new gesture | YES — the ⋯ menu on the phone board; the pair on six more pages |
| 6 | A new surface | YES — the ⋯ popup |
| 7 | Roles | YES — D148 (whose changes), accounts guards on restore, member vs admin vs member view |
| 8 | The warning list | YES — an undone rule or Quals change re-derives every warning |

**FULL:** the rules sweep (§1); the scenarios (done — both providers); the roll-call (§2) and door check; the walk of
what exists (Phase A); the build (Phase B); the gates; the walk of the build and the re-walk (Phase C); BOTH models read
the finished code with the evidence sheet (Phase D); fix; re-walk what the fixes touched; the evidence sheet
`docs/handpass/2026-09-28-change-recording.md` with its pictures in `docs/img/handpass/2026-09-28-change-recording/`; the
owner's look card.

## 1. The rules that apply (the sweep)

D148 · D166 (5) · D170 · D171 (2) · D227 · D286 · D287 · D290 · D292 · D295 · D305 · D310 · D322 · D338 (7), (9) · D347 ·
D348 · D349 · D350 · AM32–AM39d (the register) · the 13 Sep 26 "snap-to-page" undo and "per login session" undo (memory
`future-undo-semantics-multiuser`) · the 17–18 Sep 26 global-undo rulings (design §0: refuse-whole, one Undo, the bubble,
the unpublish model) · D263 (every change to an absence is a history line — an undo writes its line, D343's
`[DRAFT-PENDING]` build) · the 4 Sep 26 "a click-open popup closes on a click outside" · the 2 Sep 26 "a control tapped
again and again must not move under the finger" (the phone bar's order change) · the 7 Aug 26 UI bar and the "UI copy
reads production" rule (the greyed button's reason). **No clash found between them**; D350 narrows AM39d and D347–D349
narrow the Aug 26 / 30 Aug 26 / 9 Sep 26 placements — all recorded, their stale text marked (D201).

## 2. The roll-call — every door, and every kind of change

Both reports' roll-calls are the starting table (Fable §1a–1b, Astra §1); merged, with the decisions of D347–D350 applied:

**Doors (after the build):**

| Surface | Admin | Member | Admin in member view | Guest / waiting |
|---|---|---|---|---|
| Top bar — Edit Schedule (with the changes clock) | pair | — (no page) | page leaves (D292) | — |
| Top bar — Leave War | pair (moved from the Period row) | pair | pair | — |
| Top bar — Inputs, Quals | pair | pair | pair | — |
| Top bar — Admin, Logic | pair | — (no page / read-only Logic: pair shown, nothing of his to undo → greyed) | — | — |
| Top bar — Tracker | the Tracker's OWN pair (its own history), same place and look | same | same | — |
| Top bar — View-only Sched, Help | none (D347 (2)) | none | none | — |
| The board's bar | Undo · Redo · History · Sync · bell · ✓ Done (+ ⋯ on a phone) | — | — | — |

Logic for a member: the page is read-only for him, so the pair would only ever be greyed there; **the build shows the pair
only where the signed-in person can change something on that page** (member: Leave War, Inputs, Quals; admin: every page
above). Stated to him on the look card.

**Kinds of change** (✓ undoable, ✗ never, ⊘ D350 not yet): schedule edits ✓ · publish / Unpublish ✓ · sign-offs ✓ ·
Discard ✓ · warning mute ✓ · OIL Earn choices ✓ · inputs ✓ · planning calendar ✓ · Leave War bids, decisions, moves,
awards, balances, OIL policy, bid window, war create / rename, stage (pending his answer), ⚙ settings ✓ · Quals ticks, CAT,
initials, flight, remarks, callsign, LoX columns ✓ (new) · accounts: give access, refuse, give sign-in, suspend / enable,
role, puck, sign-in name, guest switch ✓ (new) · templates, default arrangement, wave show/hide, lookahead, rules, stores,
cancel reasons ✓ (new) · add a person (with or without sign-in; a request given access as a New person), Archive, Restore
/ Restore as, Delete, a posting ⊘ · "seen" marks (changes, the admins' bell, the welcome note) ✗ · a waiting person's
own request ✗ · the posting pass ✗ · navigation and view state ✗ · the change history ✗.

---

## 3. Phase A — walk what exists (before any build code)

The re-test proper (D147: the one undo and the command layer, walked the way a person uses it). **Fanned out** (D16)
to three Opus walker agents, each its own world (its own port, fresh browser, the production build of `60a6792c`
served by the host — nobody rebuilds under them), each returning pictures and a filled table; the host reproduces every
finding before it enters the sheet. Scripts `scripts/handpass/cr-w*.mjs`, written as assertions of the RIGHT behaviour
(PASS = correct) so the re-walk is a re-run.

- **Walker A1 — the schedule and the board** (desktop 1440×900 and phone 390×844): Fable S11 (OIL Earn's stop, both
  doors), S12 (undo of a publish, redo with the four cleared), S13 ("tap Unpublish first"), S14 (redo abandonment, LIFO),
  S16 (a late input on a published day undone — the four back), S24 (reload), S25 (two doors, one gesture), S27
  (Discard undone), S28 (the Unpublish button undone), S32 (off-week snap); Astra 16, 17, 22.
- **Walker A2 — inputs, the Leave War, roles** (both widths): Fable S6 (member view), S9 (a member's only door), S10
  (an off-week input undone from the wrong week), S15 (the list clears at sign-out / sign-in, on screen), S23 (every
  bubble read cold), S30 (a refusal, then the next press), S31 ("Undo post out" vs the app's Undo); a Leave War bid,
  decision, move, award, ⚙ setting and stage each undone and redone; Astra 14, 15, 21, 23, 24; the D263 history line for
  each undo / redo.
- **Walker A3 — the baseline of what the build changes** (both widths + 844×390): today's top bar on every page (the
  "before" of D347), the board's bar, the phone board with the highlighter open, Fable S1 / S2 / S5 / S7 / S19 as they read
  today (so the build's "after" has a "before"), the bar height at 844×390 (the Tracker chat's constraint).

Findings: each reproduced by the host, compared against `main`, dispositioned (fixed red-first on this branch / ruled /
filed); anything in an area another chat owns is messaged to it (D302).

## 4. Phase B — the build (after the red team and Phase A)

**Order of the steps is the order of the commits**; each is red first (a test that fails on `main`), and each step's own
suite runs before the next (bug-check order §5, "between fix rounds").

**B1 — never an Undo step (both reports' §3a).** `src/undo/timeline.ts` `ingest`, case `'user'`: before `isNavOnly`, a
`NOT_STEPS` set — `changes.seen`, `access.seen`, `person.backSeen`, `access.request` — records the expectation only
(`trackExpectation(env)`; return). Tests (`timeline.test.ts`): each type commits, `_timelineEntries()` unchanged,
`undoState().canUndo` unchanged; a member's "Mark all as seen" after his own input leaves his Undo on the input (Fable S2).

**B2 — cut over the roster and the settings.** `src/state/undo-wire.ts`: `registerUndoStore(peopleStore, ['people'])`,
`registerUndoStore(settingsStore, ['settings'])`, `setCutoverModules([... , 'people', 'settings'])`. (If he answers "the
stage is not undone", its type joins `NOT_STEPS` here — `lw.edit` carries more than the stage, so the stage write would
need its own type, `lw.stage`: one line in `store.ts advanceStage` / `setStage`.)

**B3 — a step Undo cannot take yet says why (D350).** `timeline.ts`: beside `LAST_DEAD`, a `LAST_BLOCKED` sentence when
the newest not-undone entry is ineligible because it touches `lw.postouts`: *"Adding, archiving, restoring or deleting a
person, and postings, aren't undone here — use Admin → Users or the Leave War's posting sheet."* — returned in
`undoWhy` (the greyed button's hover) when nothing older is eligible, and as the refusal when the dispatcher would
otherwise say "Nothing to undo." The non-linear refusal (`undoConflict`, a newer ineligible entry sharing a key) keeps
"can't be undone yet" but names the act: *"… a later change to a person (added, archived, restored or posted) touches the
same thing"*. Wording on the look card (Fable Q6).

**B4 — a Delete is final, for the person and his account too (D287; Fable S5, Astra §3.2-6).** `src/state/person-delete.ts`
`deletedRestoreProblem`: add `people/<id>` puts where the live man is `deleted` and the image is not, and `settings/accounts`
puts whose list holds an account of a deleted man. (Latent while Delete stays ineligible under D350, and pinned now so
`[UNDO-POSTING-RECORD]` cannot lift it into an un-delete.)

**B5 — the rules a roster / settings restore re-checks** — one new module `src/state/roster-restore.ts`,
`rosterRestoreProblem(changes, dir)`, wired into `undo-wire.ts`'s `restoreRefusal` after `restoreBlocker`:
1. **One callsign on the roster** (D286, D295): a `people/<id>` image whose callsign differs from the live one, or which is
   un-archived where the live man is archived, must not collide with another roster man or a placeholder — the one body
   `roster-add.ts callsignProblem` (exported if not) → *"<CS> is taken on the roster now — rename one of them first."*
2. **Accounts** — through ONE exported body in `accounts.ts`, `accountsRestoreProblem(list)`, which the write path's own
   guards call too (so the two cannot drift): at least one admin able to sign in (ADMIN_LOCK); never the signed-in
   person's own account changed (role, puck, on); no account ON for an archived man (D322); one person one account, one
   sign-in name one account. Never `accountsLoad`'s forgiving repair (Astra §3.2-5).
3. **A person removed by a restore** (no eligible entry does this under D350 — kept as a belt, fail-closed): refused if he
   is on any loaded or stashed day, an input, the planning calendar or the war.
Tests (`roster-restore.test.ts`): each rule refuses whole, nothing half-applied, the step stays next; Fable S3, S20, S21,
S22; Astra 1, 3.

**B6 — D148 (Part 3).** `timeline.ts`:
1. **Own changes only.** `mayReverse`: an admin may reverse only an entry whose `actor.personId` is his own (a member
   already so). The dispatcher (`newestUndoable`, `mostRecentlyUndone`) **passes over** an entry that is not the current
   person's — never greys, never refuses on it (D148 "never undoes another person's change"). In one browser this changes
   nothing on screen (the list empties at every sign-in); the unit model proves it (Astra 13).
2. **Remote changes set a NAMED barrier.** `ingest` case `'remote'`: for each key, a barrier at the envelope's seq and
   the actor kept (`BARRIER_BY`); `trackExpectation` keeps the actor of any barrier it sets.
3. **The refusal says who.** `undoConflict` / `redoConflict`: *"<Callsign> changed this after your action — it can't be
   undone now."*; for a system actor (the posting pass) *"The app changed this after your action (a posting out ran) — it
   can't be undone now."*; no person → today's words. The name through a hook (`hooks.nameOf`) so the timeline stays free
   of the roster.
4. **Redo checks the barrier too** (it has no barrier test today — Fable 3c-3): the entry records its undo's restore seq.
5. **The stateless pre-check** the design asked for (§8.1): `revisionOf` vs `expected` before the snap, so a stale record
   is refused in words before the view moves — never reaching `plainRestoreReason`'s "Try again".
6. **`plainRestoreReason`**: "this week" only for a week's records; drop "Try again" for a stale revision.
7. **After a refusal that names someone else, the step is PASSED OVER on the next press** (it can never be taken again —
   the barrier is sticky): the first press says who and changes nothing; the second press moves to the next of his own
   steps (whose bubble says what it did). *The builder's call, for the red team to attack:* D148 says "refuses and says who"
   and "never greys out because someone else changed something" — refusing forever would strand every older step of his
   behind one another person's change; passing over silently would never say who. Say-once-then-pass-over does both.
Tests: Fable S8's three models, Astra 11–13, 20; `session-undo.test.ts` kept.

**B7 — snap to the page (AM39b; Fable 3d, Astra §3.2-9).** `undo-wire.ts` `loadContext` for `page` contexts, BEFORE the
inverse applies: `people` → Quals, the person's row (`focusQualsRow`); `settings/accounts`, `accessreqs`, `guestview` →
Admin → Users (`openAdminUsers`); `rules` → Logic; `qualcols` → Quals; the templates, the default arrangement, wave
show/hide, lookahead → Admin's config; `stores`, `cxreasons` → stay (edited on the board / week). Not when the person is
already on that page. A closure touching a week AND a page snaps to the week (the change the eye looks for).

**B8 — the words (describe.ts; Fable 3e, S23; Astra §3.2-11).** Type phrases for every people / settings / account type
(Fable's list); the Leave War generic "a change on the Leave War" (the app's word, not "leave board"); **`[AMEND-SMALL-SEEN]`
item 2** — a text command carries the FACT of which box it wrote (the key's prefix, in a new optional `detail` on the
envelope copied from `Command.meta.key`, never a label string — design §8.2), and the describer maps the prefix: a time
box → "a time on the schedule", a remark → "a remark", a day note → "a day note", a wave or formation name → "a name on the
schedule". The same phrase feeds the button's hover, the bubble and the history line (Astra's "one vocabulary").

**B9 — the Quals columns and the Logic boxes repaint after an undo (Fable S19, S18).** `QualsPage.tsx`: `cols` re-read
from `qualCols()` on every store tick; written back only from the edit handlers, never from an effect. Logic's rule boxes:
verify they re-read the restored value (the robustness doctrine — a refused or undone value is put back on screen); fix if
not.

**B10 — `[UNDO-TOPBAR]` (D347–D349), the approved mock-up.**
1. **One pair, one place.** A small shared `UndoPair` component (the `.tb-hist` markup the top bar has) used by the top
   bar on every page §2 names, and by the board's bar. It reads `undoState()` and subscribes to the timeline's own version
   (never the domain stores — timeline.ts's C4 note). The OIL Earn stop stays inside it (`oilUndoBoundary`), so every door
   asks it.
2. **The top bar** (`Shell.tsx`): the pair outside the `page === 'editsched'` gate, on the pages §2 lists for the signed-in
   role; the changes clock still Edit Schedule's only. The bar's class `editing` becomes `has-undo` for the phone rules
   (the Sync label drops to its dot wherever the pair shows); **the phone order is the desktop's** — the pair's
   `order:9` goes, the pair sits before the Sync dot and the bell (D348). Measured after: no page's bar taller than today at
   390×844, 844×390 (the Tracker chat's constraint) and 1366×768.
3. **The Leave War** (`Chrome.tsx`): its pair leaves the Period row.
4. **The Tracker**: a no-import bridge `src/tracker/undo-bridge.js` (the shape of `role.js` / `people.js`) — `core.js
   init()` registers `canUndo / canRedo / undoWhat / redoWhat / doUndo / doRedo` and a change signal (core's own
   `subscribe`); the top bar on the Tracker page draws the pair from the bridge (the Tracker's own history, its own
   words). `Header.jsx`: the ↶ ↷ pair removed. The Tracker's Ctrl+Z is untouched (the Tracker chat's, agreed). Guard:
   `tracker.test.tsx` still proves Raptor never imports `core.js`.
5. **The board** (`SchedBoard.tsx`): after History, the Sync chip and the bell — ONE shared component each with the top
   bar's (extracted from `Shell.tsx`, so the two cannot drift); the bell's tap closes the board before it navigates
   (Help, Admin → Users, Inputs); ✕ Close removed (✓ Done is the one exit — Escape and the scrim still close); on a phone
   `#sbWide` and `#sbSortAll` leave the first row for a **⋯** button in the second row beside the highlighter, opening a
   small menu (Sort all · Phone / Desktop layout) that closes on a tap outside and after a choice; on a desktop Sort all
   moves before Undo. The geometry gate's count of the board bar's children and every test that clicks `#sbClose` are
   changed deliberately, with the reason (the owner's D349), never loosened.
6. **Docs:** `ui-contracts.md` §The top bar … and the board's bar rewritten from the marked text; `feature-impact.md`'s
   "Undo / redo" row (it still names the old snapshot stack); `performance.md` — the extra buttons are React chrome, no
   dense surface; `file-map.md` (the new files).

**B11 — docs and the register.** `undo-contract.md` (§3.1's "write() has no production caller" is stale since 18 Sep; §4
D148's build; §5 the checklist gains "a view-only write is never a step"), `engine-rules.md` §History, the register AM39d
(built) and a new row per new behaviour, `data-model.md` §11 if a permission changes (none planned — `perms.test.ts`
proves it), `OUTSTANDING.md` (`[GLOBAL-UNDO]`'s deferrals: GU-MAYREV built, CMDLF-002 → `[UNDO-POSTING-RECORD]`).

## 5. Phase C — walk the build, both widths (+ 844×390)

The scenario lists drive it: Fable S1–S5, S7, S8 (unit), S17–S22, S26, S29; Astra 1–13, 18–20, 25, 26 — and D347–D349 on
every page at both widths (the pair's place measured against Edit Schedule's, the phone order, the Sync dot, the board's
bar with and without the highlighter open, the ⋯ menu opened and dismissed, ✓ Done). Every picture opened before its
step counts (anti-pattern 21). The re-walk re-runs Phase A's scripts on the built bundle into a separate folder.

## 6. Phase D — the reads, then the look

Fable and Astra each read the finished code, blind to each other, with the evidence sheet and this plan (the finder
wording, the D56 exclusion, exact fix steps demanded) — permissions and persistence are touched, so both (§4 rank 2).
Fixes red-first; re-walk what they touched; the gates (under the PC lock, D228); the sheet; the look card (3–5 lines, in the
app's words) and his "merge live".

## 7. What is NOT built here (filed)

`[UNDO-POSTING-RECORD]` (D350) · `[HIST-PER-PAGE]` (D349) · GU-E5 (an input-only undo does not jump to its week) stays
filed unless the walk shows a person meets it on a door this build adds (the Inputs page now has the pair — it is then the
page he is on, which is the fix). The Tracker's Ctrl+Z note — the Tracker chat's (D302).

## 8. Risks the build carries

1. **The coarse `settings/accounts` record** (Fable Q4): one account change and a later, unrelated one share a record, so
   they undo in order; after the posting pass runs, an earlier account change cannot be undone (the refusal names it).
   Accepted as correct-but-strict — splitting the record changes the settings grammar for one message.
2. **The phone bar's order change** moves Undo under a finger that learned the old place (the 2 Sep 26 rule is about a
   control moving WHILE tapped repeatedly — this is a one-time move, by his ruling).
3. **The board losing ✕** — a scheduler used to ✕ finds ✓ Done in its place; Escape and the scrim still close.
4. **The Tracker's pair through a bridge** — a second undo engine behind the same-looking buttons; the page decides which
   engine answers (the one undo never reaches the Tracker — its closures are `trk.*`, not cut over).
5. **`lw.config/all` is one record** — every ⚙ Leave War change undoes in order (today's behaviour, unchanged).

## 9. Where the two reports differ, and what this plan does

- **The stuck-behind-another's-change step** — Astra: refuse every press, never skip; Fable: refuse and name. Plan: name
  once, then pass over (B6.7) — for the red team.
- **The pending person's request** — Astra: never a step (no door); Fable: not named. Plan: never a step (B1).
- **Refusing a request** — Astra: a step (it changes another person's access). Plan: a step (B2).
- **Snap exactness** — Astra: reopen the exact modal; Fable: the page and the row. Plan: the page and the row/section;
  reopening a closed modal (a template editor) is not done — the bubble names it.

## 10. Folded from the "which changes get Undo" review (his ask; both providers, 28 Sep 26)

Reports: `docs/superpowers/briefs/2026-09-28-change-recording-undoable-list-{fable,astra}.md`. Both agree with the list
except where named here.
- **"OK, seen" on a Leave War notice (`lw.ack`) — never a step** (joins B1's `NOT_STEPS`). Fable: a seen mark, and a
  member's Undo meant for his bid would bring the note back; Astra: a squadron record, so a step. The builder's call:
  Fable's — it records that a person has read the notice, like the other three seen marks. On the look card.
- **Give access** — to an EXISTING person: a step (new); as a NEW person: D350's add, never (Astra). B2 wording fixed.
- **"OIL awards"** means the admin's hand-typed awards; an automatic credit goes and comes back with the publish or OIL
  choice that made it (both).
- **Named on the list, already right:** saved plans (park, bring out, rename, delete) and Sort all are schedule steps;
  "Clear old clutter" is one step (B8 gives it words — today "a batch of inputs"); renaming an ARCHIVED man is a step with
  the callsign refusal (B5-1 covers it); a document attached to a medical input comes and goes with its input; the
  Leave War's day event lines are steps; the admin's member-view switch is looking around.
- **The Tracker's own pair** takes back chart edits and a student's marks and dates — not students, courses, charts,
  event details or an Import — and clears on ✓ Save changes: one line on the look card, since D349 puts it where the one
  Undo's pair sits.
- **Refusals** (both): a sign-in name, one person one account, a deleted man's account — already B5-2 / B4.
- **A consequence of D350 to tell him once (Fable R4):** an add, Archive, Restore or Delete writes the one accounts
  record, so it freezes the Undo of earlier account changes (and earlier Quals changes on that man) in the same sign-in —
  the way back is Enable / Restore.
- **Put to him (both his):** the Leave War STAGE (Fable: keep, with its own words — `lw.stage`, "Undid: closing
  bidding"; Astra: never, the stage buttons only); and **Admin → Data → "Clear edit history…"**, the one control that
  ERASES the squadron's change history (Fable M2) — against the transparency of D169 / D338 (1). **ANSWERED — D351: it
  stays as it is until the database step (IT's retention rule); never undoable. Nothing to build.**

## 11. Round 1 red team — dispositions (Fable + Astra, 28 Sep 26) — THESE WIN over §3–§6 where they differ

Reports: `docs/superpowers/briefs/2026-09-28-change-recording-plan-redteam-{fable,astra}.md`. Every finding is ACCEPTED;
the plan's shape is unchanged, so a round 2 is optional (the build chat may run one on §11 alone — cap ~3 rounds).
1. **The posting pass folds into the user step that woke it** (Fable 1–2): in `ingest` case `'projection'`, a
   `lw.postoutRun` envelope is NEVER folded — it sets a barrier with its actor (system) on every key it wrote and advances
   `expected`; orphan projections likewise set their barrier AT ingest with the actor; the pre-check's belt scans
   `commandStream()` for the newest envelope on the key after the entry. Test: a Quals tick whose notify runs the pass keeps
   its closure and stays undoable.
2. **B4 BEFORE B2** (Fable 10) — a delete can have no `lw.postouts` change (a hidden SANS man), so after the cutover only
   B4 keeps it dead.
3. **B5's checks run twice** (Astra 2): pre-snap through `restoreRefusal`, and again INSIDE the restore reducer before any
   write (a `CmdRefused` with the sentence), over the one combined candidate (people + settings images together).
   `accountsRestoreProblem` also refuses an `accessreqs` image naming someone who now has an account (Fable 11).
4. **B3's words** (Fable 12): *"Adding, archiving or restoring a person, and a posting, aren't undone here — use Restore,
   Delete or the posting sheet's own Undo. A delete is final."*
5. **B6.7 — decided, with three conditions** (Fable 9; Astra 1, 6): (a) pass over only an entry blocked by a STICKY barrier
   of someone else (a remote change, the posting pass) — never on `!mayReverse` (the D292 member-view refusal keeps refusing
   every press) and never on a temporary conflict (a newer own step, the publication barrier, a restore rule — those refuse
   every press); (b) the blocked entry stays `undone:false` so it still guards older steps; (c) the refusal names the next
   step: *"<Callsign> changed this after your action — it can't be undone now. Press Undo again for: <label>."*, and the
   hover says the same. Not reachable in one browser today (unit-modelled); on the look card.
6. **B7's snap** (Fable 8; Astra 7): `lookahead`, `inputs` and `plan` closures → the Inputs page (calendar view for
   `plan`) unless a week context is present; Logic shows the pair for admins only (Astra 9 — §2's table corrected: no pair
   for a member on Logic).
7. **B8's text key end to end** (Fable 6; Astra 5): optional `meta` on `commitSchedValue` / `schedWrite`; `{ key }` passed
   at `store.ts` `writeText` and every `textedit.ts` commit; `commit.ts` copies `cmd.meta?.key` onto the envelope; the
   timeline copies it onto the UndoEntry; `describe.ts` maps the prefix. Red test: `sched.text` on `dn:` → "a day note".
8. **One wave-template save = one step** (Fable 7): `waveTplSave` inside one `commitSettingsIntent('settings.wavetpl', …)`.
9. **No history line for a settings-only undo** until `[HIST-PER-PAGE]` places Admin / Logic (Fable 14) — the forward
   change writes none either.
10. **B10, split and corrected** (Fable 3, 4, 5, 13; Astra 3, 8): `UndoPair` takes its ENGINE as a prop (the one undo, or the
    Tracker bridge — never both); keep `#trUndoBtn / #trRedoBtn` as the Tracker page's pair's ids and re-point
    `scripts/tracker/smoke.mjs` (:989, :1199-1201, :1250; clicks :903, :1210, :1213, :2751, :2772) deliberately; the bridge
    carries a `hosted` flag so the STANDALONE Tracker still draws its own pair; retarget the Leave War tests
    (`e2e/leavewar.spec.ts` :139, :1896, :2184, :4242, :4278, :4294, :4310; `e2e/step4-leavewar.spec.ts` :127-132;
    `leavewar/ui/chrome.test.tsx` :210-235) to `#undoBtn`; `.topbar.editing` KEEPS the Edit Schedule tint and a new
    `has-undo` class carries only the phone Sync-dot rule (pinned by a CSS test); the Sync chip's `fast` state lifted to
    module state so the board's chip and the bar's agree; any wrapper in `.sb-actions` is `display:contents` (the
    geometry gate counts its direct children); the ⋯ menu's Sort all keeps its `open && editMode && !DPREV` gate. Commits:
    (✕ goes + Sort all moves + the gate) · (Sync + bell shared) · (the ⋯ menu) · (the pair on every page) · (the Tracker
    bridge) · (the Leave War pair out).
11. **The stage's own type** (Astra 4; Fable's list report §3): whether kept undoable (Fable) or not (Astra), the stage gets
    `lw.stage` for its words — which needs its command registration beside the Leave War's others and its row in
    `perms.ts` COMMAND_OPS, or every stage change is refused. **ANSWERED — D352 "Stage keep": Undo takes the stage back, as
    today, with `lw.stage`'s own words ("Undid: closing bidding — bidding is open again for everyone").**
12. **The FULL order** (Astra 10): build → gates → roll-call and door check → walk, fix → gates → the two reads with the
    evidence sheet → fix → re-walk what the fixes touched → gates → the sheet → his look (bug-check order §5). §5 and §6
    are read in that order.
13. **B6 split** (Fable 15): 6.1 (own changes) · 6.2–6.5 (named barriers, redo's barrier, the pre-check, the words) ·
    6.6–6.7 (plainRestoreReason, the pass-over).
