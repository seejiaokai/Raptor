# Plan — `[LEAVE-LATE-PUBLISHED]`: a published day keeps what it went out with (D177–D179), 25 Sep 26 overnight (D181)

Builder: Opus 5.5. Reviewers: Fable 5.1 and Astra (published records → both). Tier: **FULL** (the published record, what
is saved, and the warning list).

## What he ruled, in one paragraph
Once a day is published, **every** change that would move what its published face shows **waits for the admin**. That
covers a member's input (filed, edited, deleted, moved; D178), a medical downchit or a lapsed qualification (D179), a rule
setting (D179's reading, as D48), and a neighbour day's input moving this day's warnings (B5, frozen by D179). The day reads
"N pending", the four sign-offs fall (D103), and the published face keeps what it was issued with until the next AL, or
until Unpublish and publish again. Putting it back reads 0 again (D98, AM20). Left live: only a reader's own view
choices (the "Working draft" view, one's own hidden LATE mark) and the Leave War's reminders (B3, B4, B6).

## The idea: the issued version carries the rest of its face
Today an issued version (the Original, or an AL) freezes the day's content (`snap.d`), its marks (`snap.c`), each
input's filing state (`snap.fil`) and the OIL evidence (`snap.d.oilev`). Everything else on its face is read live: the
inputs' own details (A0–A7), and the warnings. The warnings are recomputed on every change from the issued content plus
today's inputs, quals, rules and neighbour days. **Two more things get frozen at the moment of issue:**

1. **`snap.inp` — the day's inputs as issued.** A copy of every input covering the day's date (every field, including
   its filing state).
2. **`snap.w` — the day's warnings as issued.** The day's slice of the official warning bundle, computed right after
   the issue: its warning list (`byDay[di]`), the puck rings and flags (`sev`, `chip`, `dash`) and the next-day
   crew-rest marks it causes (`trace`).

The issued face then shows **only frozen things**: content, marks, OIL, inputs and warnings. The comparison that
drives "N pending" asks whether today's world differs from the frozen one on the axes that can move the face.

## Layer 1 — the inputs
- **The freeze.** `publish.ts daySnap` adds `inp: {[iid]: clone}`: every input covering the day's date, a JSON clone.
- **One reader for "the inputs on a date"** (`engine/inputs.ts`): `inputsOn(dt)` and `inputOn(iid, dt)`. They return the
  live inputs covering `dt`, unless a frozen set is installed for that date, in which case they return the frozen
  clones. Installed by `withFrozenInputs(map, fn)`, synchronously, and restored in `finally`. Nothing inside may write.
  **Every date-scoped reader of `INPUTS` on a schedule surface or in the validator is converted to it.** This includes
  events.ts `buildDay` and its two tails, avail.ts (six sites), inputs.ts `sansAvailOn`, html.ts (the Unavailable block,
  SANS rows, `srcInput`), board-html.ts (four panels), board.ts `dayInp`, and weekctx.ts. That list is the roll-call. A
  date-agnostic reader (the medical tracker, the Inputs page, the Leave War) keeps reading the live records: they show
  the records, not a published day.
- **Where it is installed.**
  - (a) `ui/html.ts withDaySnap`, for an ISSUED version (Original or AL, not a parked plan): the swap that already stands
    the snapshot in for the day, so every reader of the issued face (View-only Sched, the board's preview of an issued
    version, the ⓘ panel and the ALL AVAIL window through `withChipWorld`) reads the frozen inputs with no per-reader
    change.
  - (b) `validate.ts withIssuedWeek`, for every approved date of the loaded week, plus the stashed neighbour weeks'
    approved dates (`weekctx.ts windowInputs`, beside `windowFiling`). Then the official pass judges each published day
    with the inputs it was issued with. This is the detector that layer 2 compares, so it must not move on this day's
    own input changes, which layer 1 already counts.
- **Medical freezes too (D179).** The official pass stops exempting downchits from the frozen filing (events.ts
  `inpShow`: `filingActive()&&!isDownchit` → `filingActive()`), and the frozen clones carry the downchit's dates.
  The crew-rest plan's §4 ("current safety facts are never versioned") is marked set aside by D179 in the same change.
- **The comparison — `inputDelta(di, snap)`** (publish.ts), a fifth axis beside content, filing and OIL. It gives one
  entry per input whose details differ between `snap.inp` and today, including one that appeared or went away
  (`addr: inv:<di>.<iid>`, `kind: 'input'`, `from` / `to`: a short stable hash of the details). "Details" means every
  field except `acc`, which the filing axis already compares, and `iid`. **A snapshot without `inp`** (issued before this
  change: demo data only, D56) gives no entries, and its face reads live inputs, as today. That is not back-compat work,
  only a guard against a crash.
- **One act, one item** (D109, D114). `dayPendingItemsIn` folds per input: a value entry and a filing entry for the same
  input are ONE item. That item also takes the content unit of a ground row whose `src` is that input: editing an
  accepted request re-lands its row, which is one act. The pending list names it in the app's words: "Hunter · OL
  filed", "Hunter · OL changed: all day → 09:00–12:00" (the fields that moved: dates, times, type, remarks, person),
  "Hunter · OL deleted", "Hunter · OL moved off this day", "OL moved from Bane to Hunter". A filing-only change keeps
  its present words.
- **Signature, eligibility and what goes out** need no new code. `pendingKey` (the D103 signature binding), `dayHasChanges`
  (eligibility), `dayDelta` (the stored AL diff) and `officialDiverges` all read `dayDeltaIn`, which gains the axis.
  The stored AL's `ukinds` counts it as an input item.
- **The load ("Load onto working copy")** cannot put a member's input back (it is his record, and it may cover other
  days, AM1). So an input change stays pending after a load and is not counted in "Discard N edits". The load's message
  says so, in the same way it already names a filing it could not put back.

## Layer 2 — the warnings
- **The freeze.** At issue (`setDayApproved`, `alIssue`), after the snapshot is stamped: run the validator once,
  synchronously, and store the day's slice of the OFFICIAL bundle as `snap.w`. This goes through a new hook,
  `HOOKS.issuedWarn(di)`, wired in store.ts beside `reflow`, because publish.ts cannot import the validator without a
  cycle. The command layer defers `reflow()` to the transaction boundary, so the hook calls `validate()` itself.
  Unwired (a bare unit test) → no `w` → the face reads the official bundle, as today.
- **The face.** `withOfficialWarn` points `WARN` at a FACE bundle: the OFFICIAL bundle with each published day's slice
  replaced by its current issued version's `w`, when it has one. It is built once per validate run (cached on the
  OFFICIAL object). A draft day keeps its official slice, as `viewDayHTML` intends.
- **The comparison — `warnDelta(di)`** (the sixth axis): the canonical key of OFFICIAL's slice for the day, against the
  canonical key of `snap.w`. The key covers every warning's code, severity, person and message, sorted, plus the rings,
  flags and traces. Any difference gives ONE entry (`addr: warn:<di>`, `kind: 'warn'`). It catches everything the
  official pass sees that is not frozen: a quals or posting change, a rule setting, a neighbour day's content or inputs,
  a roster change. It never moves on this day's own content, filings or inputs, because the official pass reads those
  frozen (layer 1). So one act is not counted twice.
  **Kept OUT of the gate that decides whether the official pass runs** (`officialDiverges` reads a core delta without
  this axis), or the validator would depend on its own output.
- **The pending list** names it: "Warnings changed", then a line per warning that appeared ("now: <message>") or
  cleared ("cleared: <message>"). The AL panel's split gains "warnings".

## What is left alone, on purpose
- B3 (the "Working draft" view), B4 (one's own hidden LATE mark), B6 (the Leave War's missing-period reminders).
- Callsigns are labels (a rename moves nothing, 14 Sep 26): the pucks print today's callsign. A warning's frozen text
  keeps the callsign it was issued with. A rename changes the warnings key, so a rename on a published day with a
  warning naming that man reads pending (a label moved on the face). This is a known edge, noted in the evidence sheet.
- The edit week, the board's working copy and the Inputs page show the LIVE world. They are where the admin works.

## Order of the build (red first at each step)
1. `inputsOn` / `inputOn` / `withFrozenInputs` and the reader conversion (the roll-call), with no behaviour change while
   nothing is installed. The whole unit suite stays green.
2. `snap.inp`; install in `withDaySnap` (issued versions) and `withIssuedWeek` (plus `windowInputs`); the medical
   exception goes. Tests: A0–A7 and B1 each show the issued value on the face after a live change.
3. `inputDelta` + folding + pending-list words + the load's message. Tests: filed / edited / deleted / moved / retyped
   → 1 pending, the four fall, back → 0 and the four hold; an accepted request edited → 1.
4. `snap.w` + the FACE bundle + `warnDelta` + words. Tests: a quals tick, a rule setting, a neighbour draft day's late
   flight → "Warnings changed", the face unchanged, the four fall; put back → 0.
5. Docs: engine-rules.md §Publishing, ui-contracts.md (the pending list), data-schema.md (`snap.inp`, `snap.w`),
   feature-impact.md, the register (AM20, a new AM line), the crew-rest plan §4 marked set aside.

## Risks I am carrying
- **Cost.** One extra validator run per publish (fine). Two new comparisons per day per repaint, inside the
  publish-read pass's memo. The warnings key is cached per OFFICIAL object.
- **A reader missed in the conversion** reads live on the face. The roll-call (step 1) is the defence, plus a grep test
  that fails if a schedule-surface file calls `INPUTS.filter(… inputCoversDate …)`.
- **Warnings-key noise.** If the validator's output order is not stable, the day would read pending with nothing
  changed. The key is sorted, and a test proves an unchanged day reads 0 across repeated validates, reloads and a week
  switch.
