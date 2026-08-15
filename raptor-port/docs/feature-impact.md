# Feature impact — the components a change touches, and how work flows

The owner's standing ask (12 Aug 26): *"any addition or feature will affect
multiple components… always ask yourself if this implementation will affect
these components. And record how things flow generically, so we don't miss
things out."*

This file is that record. It is not a list of features — it is the **map you
check a feature against before you build it and again before you call it done.**
Two halves:

1. **The surfaces** — every place a change can show up, and what feeds it.
2. **The flows** — how a single edit travels from a keystroke to the screen,
   so you can trace where any change ripples.

Then a **checklist** to run per feature, and a **robustness** section naming
which joints are single-funnel (safe to build on) and which are drift-seams
(where two copies of one rule can fall out of step — the bugs that keep
recurring in this app).

**Keep this true in the same PR** (same rule as `HANDOFF.md`). A feature that
adds a surface, a flow, or a new drift-seam adds a line here. Stale is worse
than absent — the next session trusts it.

---

## 1. The surfaces — what a change can touch

Every feature should be walked against this list out loud: *does it touch
this one, and if so, is the touch wired or missing?* The owner named nine;
the rest are the ones the code actually has.

| Surface | What it is | Where it lives | Fed by |
|---|---|---|---|
| **Warnings** | The day's checks list, the puck rings, the board issue list | `validate.ts` → `WARN`/`REST`/`EVD`; drawn in `html.ts` (day warnings), `board.ts` (issue list), `highlights.ts` (rings) | every `validate()` run; re-read, never cached |
| **Layout / geometry** | Row heights, column widths, board node count, overflow | `scheduler.css` (measured contracts), the string builders | gated by `e2e/geometry.spec.ts` + `perf-port.cjs` DOM ceilings |
| **History (edit log)** | The changes list, newest first; the board bubble | `editlog.ts` (`ELOG`), `HistoryModal.tsx`, `histbubble.ts` | `markEdit`/`logEdit`/`logAction`, only when BOTH from/to values are passed |
| **Undo / redo** | Step back/forward through snapshots | `state/history.ts` (`HIST`, `histPush`/`histApply`) | every mutation batch pushes one snapshot |
| **Scheduler board** | The full-screen day board (desktop + phone) | `SchedBoard.tsx`, `board.ts`, `board-html.ts` | global store lane + board-only view lane (`SBDAY`) |
| **Edit Schedule** | The editable seven-day week (`CURPAGE==='editsched'`) | `EditWeek.tsx`, `EditRoster` palette | writes go through the mutation funnel; gated by `editMode()` |
| **View-only Schedule** | The read-only week (`CURPAGE==='viewsched'`, the default) | `ViewWeek.tsx` | same builders, no write controls; `editMode()` is false |
| **Desktop mode** | Wide layout — must USE the width, not just stretch | `scheduler.css` (default rules, `min-width` / `>820px`) | CSS media queries; no separate "mode" state |
| **Mobile mode** | Phone layout — top-to-bottom, reachable, one board window | `scheduler.css` `@media (max-width:820px)` / `480px`; `boardnav` | CSS + the phone board's arrows/dots; `sbWide` module-local |
| **Qualifications** | The Quals grid; the qual ladder the validator reads | `QualsPage.tsx`; `people.ts` (`p.quals`, qual rules in `validate.ts`) | ticks are session-only; drive `QUAL`/`SC_QUAL`/`AAR_*` checks |
| **Personal inputs** | Leave / medical / activity records | `INPUTS` in `inputs.ts`; `inputedit.tsx`; `InputsPage.tsx` | `INPUT_META` (the one table) decides every predicate |
| **Availability / palette** | Who the crew strip offers, who is struck out, the armed reason lines, the green eligibility rings, the folded Available-crew panel | `avail.ts` (`slotBar`, `dayOff`), `palette-html.ts`, `highlights.ts` (`paintSelRings`), `html.ts` (`availHTML` + `AVOPEN`) | `isAway`/`inputCoversDate`/`inpWin` — MUST agree with the warning list; the rings read `slotBar` itself, never a copy |
| **Post-render decoration** | Selection/search/warning classes, the armed ring, the green eligibility rings, and the ~6s just-added blue box | `highlights.ts` (`refreshHighlights` → `paintArm`/`paintSelRings`/`paintFreshAdds`) | hung AFTER the string diff, off view state (`SELID`/`ARM`/`FRESHADD`), never baked into the builder string — so a class survives an unrelated repaint; a new one adds a paint function here, never a class in the markup |
| **Publishing / AL** | Sign-off, amendments after a day is signed | `publish.ts`, `ALPanel.tsx` | inert amendment keys through the mutation funnel |
| **Day templates / Drafts** | Whole-day master templates; per-day alternate schedules, one of which is always the live day | `engine/daytpl.ts`, `engine/drafts.ts`; `DayTplModal.tsx`, `DraftsModal.tsx`; the board's + week's Templates/Drafts buttons (`board.ts`'s `dayTplMenu`/`draftsMenu`) | direct-write to `DAYS[di]`, refuses a published day, one undo step via the caller's `afterSchedMutate()` — the `restoreDayVersion` shape, not the ordinary funnel |
| **Export (CSV)** | Schedule, inputs and LoX downloads | `export.ts` (`csvText`, `exportCSV`, `schedRows`); `InputsPage.tsx` | reads the model directly; formula-injection escaped at the sink |
| **Roles / auth** | Admin vs member vs view-only; who may write | `auth.ts`, `state/session.test.ts` | checked at the PAGE and the WRITE path, never the nav |

Two things are NOT on this list because the app does not have them yet, and a
feature that seems to need them is a bigger change than it looks: **shared /
persisted data** (localStorage only — two devices never see each other) and
**a real per-person identity** (`HOOKS.whoami()` reads a hard-coded login, so
history names an ACCOUNT, not a person). Both are the same server-shaped hole;
`HANDOFF.md`'s first bullets carry it.

---

## 2. The flows — how one edit travels

The owner's example, in his words: *"when an input is made or changed, it goes
to the right area like unavailable, then through a warning check, then if an
edit can be made it changes the input and updates the history."* That is Flow B
below. Here are the flows that actually run, each ending at the surfaces it
repaints.

### Flow A — a schedule cell edit (a puck, a time, a note)
```
gesture (drag / type)
  → the mutation funnel: slotVal / setSlotVal / fillSlot / txtGet / txtSet
      (BYPASSING this funnel is always a bug — see Architecture rules in CLAUDE.md)
  → noteChange(key)              marks the cell pending for the next AL
  → afterSchedMutate()
      → validate()               reassigns WARN / REST / EVD  → WARNINGS repaint
      → histPush()               one undo snapshot            → UNDO/REDO
      → markEdit() / logEdit()   only with both values        → HISTORY (edit log)
  → notify()                     bumps the store version      → WEEK + BOARD repaint
                                                              → HIGHLIGHTS re-decorate
  → if the day is PUBLISHED: the pending key reaches the next AL → PUBLISHING/AL
```
Deletes renumber the live key space FIRST, then drop an inert `del:` tombstone
(`markDeletion`) — see `docs/engine-rules.md` §Key renumbering.

### Flow B — a personal input added or edited (the owner's example)
```
add form / row editor / week cell / board cell   (three editors, ONE list)
  → commitInputEdit / setInpField / removeInput   (all in inputedit.tsx)
  → writeInputsBatch()                            one undo step, re-validates
      → the record lands in INPUTS; which BLOCK it draws in is decided by
        isUnavail (leave/medical/OD) vs isPersonal (activities) — presentational
      → validate()          every input now counts   → WARNINGS
      → availability: isAway / inpWin / inputCoversDate
                            → PALETTE strikes / offers the man
      → histPush + markEdit                            → UNDO + HISTORY
  → if a scheduler ACCEPTS it onto the day: acceptInput() promotes it to a
    Ground or Unavailable row (`acceptedDay`, inert amendment keys)  → BOARD/WEEK
```
The trap this flow exists to prevent: the **palette and the warning list read
the same input two different ways.** They must never disagree — a man struck
out of the palette but raising no warning when planted anyway is the exact bug
`inpWin`/`awayAllDay` were made to fail-closed against. Any change to how an
input is read gets checked on BOTH.

### Flow C — day navigation on the phone board (view-only, no mutation)
```
arrow / dot scrub  → boardDayStep(±1)  → SBDAY changes
  → the BOARD-ONLY notification lane repaints just the board
  → it must NOT validate and must NOT wake the mounted EditWeek/EditRoster
```
`boardTab` is view-only by contract. A "navigation" feature that quietly
validates or writes has crossed from Flow C into Flow A and needs its guards.

### Flow D — publish / amendment / rollback
```
sign off a day          → setDayApproved / SCHED
edit a signed day       → the pending keys become an AL issue (alIssue)
roll a day back          → restoreDayVersion   (ROLLBACK semantics — session-only)
apply a day template     → applyDayTpl          (same direct-write + refuse-on-published shape)
duplicate / switch a draft → draftDup / draftSelect (same shape; the live day IS the selected draft)
```
Previews freeze schedule content but read live personal-inputs and day-info —
a known limitation, `docs/engine-rules.md` §Version snapshots. Day templates
and drafts inherit the same limitation for the same reason — both preview
through `daySnapOf`/`withDaySnap`, never a second path.

**Every flow ends by repainting through `notify()` (or the board lane).** State
that lives outside the funnel + `HOOKS.storeBackend` is invisible to undo, AL
and re-validation — do not add any.

---

## 3. The per-feature checklist

Run this before building and again before calling it done. Most answers are
"no" — the value is in catching the one "yes" you would have missed.

- **Warnings** — does it change what `validate()` sees, or add a check? If a
  new rule: does it read off the same window the picker reads (below)?
- **Availability / palette** — if it touches an input, a time or a qual, does
  the palette still agree with the warning list? (The one invariant that
  breaks most often.)
- **Layout** — does it add DOM or change a measured size? Then re-measure the
  perf ceiling and add/adjust an `e2e/geometry.spec.ts` check IN THE SAME PR.
  Check BOTH desktop and phone — they are different code paths (media queries).
- **History / edit log** — is this a new schedule write? Then it must reach
  `markEdit` **with both from/to values** (a key with no values logs nothing),
  and a new text-key family wants a line in `keyOf` and, if the board can't
  draw it as a cell, in `NO_BOARD_CELL`.
- **Undo / redo** — does the write go through a `write*Batch`? If not, undo
  can't see it.
- **Board vs Edit vs View-only** — does the change render on all three
  surfaces it should, and stay OFF the ones it shouldn't (a view-only surface
  must not gain a live control)?
- **Desktop / mobile** — reachable and legible at 390px AND using the width at
  desktop? Both are owner standing concerns.
- **Qualifications** — does it read or change `p.quals` or the qual ladder?
- **Roles** — is the gate on the PAGE and the WRITE path (`editMode()` /
  `canEditSched`), never on the nav?
- **Export** — does the new field belong in the CSV, and is any free text
  escaped at the sink?
- **Publishing / AL** — on a published day, does the change mark pending and
  reach the AL correctly (add-then-delete before an AL is a no-op)?
- **Persistence** — does the feature imply data surviving a reload? Only
  `rules` and `stores` do today; everything else is session-only. Say so.
- **Reference parity** — does it change the seed `INPUTS`, `DATES`, or an
  engine body the reference computes? Then `refwin.ts` and `node reference/tfin.js`
  are in scope. (Adding a NEW capability that leaves the seed alone is not.)

---

## 4. Robustness — the single funnels and the drift-seams

**Where the wiring is robust** (one path, so it cannot fall out of step — build
ON these, don't route around them):

- **The mutation funnel** — every schedule write goes through five functions to
  `noteChange` → `afterSchedMutate`. One place validation, history and AL hang
  off.
- **`validate()` is the only judge** — `WARN`/`REST`/`EVD` are reassigned every
  run and re-read, never cached.
- **`INPUT_META` is the one input table** — every predicate (`isLeave`,
  `isAway`, `canSpare`, …) is a lookup, and the legend is generated from it, so
  the rule and its explanation cannot disagree.
- **`acceptInput` is the one promotion path**; `commitInputEdit` the one input
  commit; `export.ts` the one exporter (schedule, inputs, LoX).
- **`dayStatHTML` (`html.ts`) is the one publish-strip builder** (15 Aug 26)
  — the week's day-head and the board's sign-off panel both call it for the
  version chip, pending count, ⓘ and Publish controls, so "the board should
  edit everything the week does" cannot drift into two copies of that strip.
- **`rosterOptions` (`inputedit.tsx`) is the one roster list** (14 Aug 26) —
  the Inputs page's add form, its row editor and the schedule's
  Unavailable-reassign dialog all call it, so the three can never disagree
  on who is offered or in what order.
- **`draftVerLabel`/`daySnapOf` are the one version-label/resolve path**
  (15 Aug 26) — a `'d:<id>'` draft version and an AL/ORIG version both
  label and resolve through these two, so a new preview consumer (a picker,
  a banner) never needs a second branch for "is this a draft".
- **Dates now carry a year when it is not the loaded week's** (12 Aug 26), so
  `dateOrd`/`fmt`/`unfmt`/`inputCoversDate` all read one representation and a
  span into the new year sorts and covers correctly. Before this there were two
  readings of a yearless label and they disagreed across a year boundary.

**Where the wiring is a drift-seam** (two copies of one truth that a change can
split — these are where this app's recurring bugs come from; touch one side and
check the other):

- **Palette vs warning list.** `slotBar`/`avail.ts` and `validate.ts` read the
  same input independently. They must give the same answer about who is
  available. Failing closed (`inpWin`, `awayAllDay`) is how they are kept honest.
  Since 13 Aug 26 the GREEN ELIGIBILITY RINGS (`paintSelRings`, highlights.ts)
  are a third reader of the same question — deliberately NOT a third copy: they
  call `slotBar` itself per slot, memoised against WARN's identity, so they can
  only ever disagree with the palette by a stale repaint, never by a diverged
  rule. Keep it that way: a ring rule that does not go through `slotBar` is a
  new drift-seam. (`selrings.test.tsx` pins DOM-agrees-with-slotBar directly.)
- **Three editors over one list.** The Inputs page, the week cell and the board
  cell all edit `INPUTS`; they are kept from drifting only because all three
  funnel through `commitInputEdit`/`setInpField`. Add a fourth the same way.
- **The history bubble is wired to the board wrap.** Cells that render only on
  the WEEK (`ar:`/`at:`/`it:`) list in history but cannot show a bubble or be
  jumped to — `NO_BOARD_CELL` records which. A new week-only cell inherits this.
- **The reference push.** `refwin.ts` pushes the port's seed `INPUTS` into the
  read-only original for parity. Change the seed's SHAPE and the reference must
  be patched too — which is why new date-years live in USER data, not the seed.
- **Duties are decoupled from waves (13 Aug 26).** A duty desk is minted from a
  template (`dutytpl.ts`), not built from a wave, and nothing links the two —
  a removed seam. The template library is a new persisted-config surface beside
  the stores list; a change to its seed shapes or its load/save path is
  per-device state, so treat it exactly like stores.
- **AMT brief/box/debrief is label-driven.** `events.ts` splits an AMT block by
  matching `/^BRIEF/` and `/DEBRIEF/` on the row labels a scheduler types, so the
  row LABELS and the engine's window maths are two copies of one truth — a
  renamed AMT row silently changes which window it feeds. (The debrief END is
  read off its own cell since 13 Aug 26; the three-way SPLIT is still by label.)
- **Desktop and phone are separate CSS paths.** A fix measured on one is
  unproven on the other; the geometry gate checks both because a change often
  lands on only one.
- **`whoami()` / `whoAmI` names an account, not a person.** Any feature that
  wants "who did this" inherits the prototype-auth limitation until a server
  fills that hook.
- **SANS availability — one gate, three surfaces (14 Aug 26; reworked to one
  window the same day).** `sansGate` (`avail.ts`, backed by
  `sansAvailOn`/`sansWindow`/`sansLetters`/`sansBadge` in `inputs.ts`) is
  read by `slotBar` (the palette grey-out + both plant/drag toasts, PLUS the
  unarmed default strike `rosterPuck` gives a record-less SANS), by
  `validate()` (the `SANS_AVAIL` advisory), and by three badge surfaces — the
  palette's `.rall.rsans` band (badge + remarks), the shared card grid the
  week group and the board panel both render, and the Available-crew header's
  "N SANS offering" count. Change what a status means, or add a fourth
  domain, and check all of them; a badge or a grey-out reader that stops
  calling `sansGate`/`sansBadge` and starts reading the record itself is a
  new drift-seam the moment it happens. The record now carries ordinary
  top-level `s`/`e`/`half` — the exclusion from the absence/clash machinery
  is TYPE-based (`inpShow`, `isAway`), pinned by `sansavail.test.ts`'s leak
  guard; any new consumer of input times must decide whether SANS rows
  belong in it.
- **A person's category is read in many places (`p.pers` / `seat:'GND'`).**
  Personnel (ground crew, Aug 26) must be handled the same at every joint: the
  front-seat bar in BOTH `slotBar` (`avail.ts`) and `validate.ts`; the flying
  exemptions in `validate.ts` (crew rest, turns, matrix, AAR, brief/debrief);
  the puck (`html.ts`, white, no CAT chip); the palette column and the quals
  table; the flying-count exclusions (`availByWave`, `insights.ts`). Add a rule
  that iterates aircrew and ask whether a `pers` body belongs in it. They are
  seeded but kept OUT of the seed schedule, which is what keeps parity clean.

- **A draft's stow can lag the live day (15 Aug 26).** `SCHED.drafts[di]`
  holds each entry's own blob; the live `DAYS[di]` is only the SELECTED
  entry's working copy, and every OTHER entry's blob is refreshed solely by
  `draftDup`/`draftSelect`'s own stow step — nothing keeps a non-selected
  draft's stored blob live-synced to anything. A future whole-day writer
  that assigns `DAYS[di]` directly, bypassing `draftDup`/`draftSelect`
  (a bulk import, a second template-apply path), leaves the OTHER drafts'
  blobs describing a day that has already moved on, silently, until the
  next switch reads one back in. Any new whole-day writer has to decide
  whether it stows first or accepts that staleness.

When you add a feature that creates a NEW drift-seam — two places that must now
agree — name it here so the next session knows to check both.
