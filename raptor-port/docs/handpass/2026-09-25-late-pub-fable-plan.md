# `[LEAVE-LATE-PUBLISHED]` — Fable's one round on the build plan (25–26 Sep 26, D181)

**Reviewed:** `docs/superpowers/plans/2026-09-25-late-published-plan.md` against D177–D179, D44/D45, D98, D103, D109,
D114, D174, D176 (scheduler.md), D48/D142 (oil.md), D56/D67 (how-we-work.md), the sweep, and the code the plan names —
on `claude/leave-late-published` @ `415d2f4e` **plus the uncommitted working tree**, which already carries the plan's
layer 1 and its comparison (`inputsOn` / `withFrozenInputs` / `frozenInputDiffs` in `engine/inputs.ts`, `snap.inp` and
`inputDelta` in `engine/publish.ts`, the install in `validate.ts withIssuedWeek` and `ui/html.ts withDaySnap`,
`windowInputs` and the input axis in `weekctx.ts windowDiverges`). **Layer 2 (`snap.w`, the FACE bundle, `warnDelta`,
the issue-time hook) is not built.** Where the code already answers a worry the plan text leaves open, I say so and
credit the code. Read-only; nothing edited.

**The verdict in one line:** the shape is right — freeze the inputs a version went out with and compare on them; freeze
the warnings a version went out with and compare on them; keep the comparison out of the validator's own gate. Layer 1
as built is sound. Layer 2 has three real holes (F1–F3), one consequence he must be shown (F4), and one advisory that
must be kept out of the freeze by code (F5).

---

## Findings, ranked by consequence

### F1 — Layer 2's roll-call misses the click mirror and two ungated ring reads; `officialWarn()` would mean two things
**What breaks.** The plan points `withOfficialWarn` at a FACE bundle (OFFICIAL with each published day's slice replaced
by its version's `w`) but leaves `officialWarn()` returning raw OFFICIAL — which it must, because the detector
(`warnDelta`) and the issue-time freeze need the live official answer. Two readers in `state/view.ts` read
`officialWarn()` to decide what a TAP on the view page opens: `displayedByDay` (line 581) and the puck-select trace read
(line 540). On a published day whose warnings have moved since issue, the DRAWN ring is frozen (FACE) but the TAPPED
list is live (OFFICIAL): a tap on a frozen amber ring opens a working-world list, or the wrong warning at that index —
the very collision the comment at `view.ts:576` was written to prevent (CRPF-009).
Also: `ui/board-html.ts:137` and `:658` read `sevOf`/`chipOf` from validate directly, not the PV-gated `puckMarks`. On the
board's preview of an issued version (`SchedBoard.tsx:230` → `withDaySnap`, PV without OFW) every schedule puck shows
no marks ("a past version is read, not checked") while the input rows' pucks wear today's WORKING rings — the sweep's
A6, which the plan lists for layer 1 only.
**Fix.**
1. `engine/validate.ts`: add `export function faceWarn()` — builds the FACE once per OFFICIAL object (cache it on that
   object: `OFFICIAL.__face`), replacing per published day `byDay[di]`, `sev[di]`, `chip[di]`, `dash[di]`, `trace[di]`
   with the current version's `w` when it has one. Cheap: five slots per day. `withOfficialWarn` swaps `WARN` to
   `faceWarn()`. `officialWarn()` stays raw OFFICIAL.
2. `state/view.ts:540` and `:581`: `dayDisplaysOfficial(di) ? faceWarn() : WARN`. Rename the mirror's comments from
   "OFFICIAL" to "the face".
3. `ui/board-html.ts:137` and `:658`: read `puckMarks(di, inp.person, RO)` like lines 233/330/807 (no marks on a
   preview). Line 137 is `sbInputsHTML`, kept for the probe bridge — same change.
4. Add both to the layer-2 roll-call table with a yes/no/MISSING cell, and a step-4 test: on the view page, a rule change
   after publish → the frozen ring's tap opens the frozen warning (`displayedByDay` returns the `w` entry).

### F2 — The premise for the extra validator run is wrong; the hook should read, not run
**What the plan says.** "The command layer defers `reflow()` to the transaction boundary, so the hook calls `validate()`
itself." **What the code does.** `state/store.ts:710` wires `HOOKS.reflow = () => { validate(); notify() }` — only
`notify` (store.ts:59) and `histPush` (store.ts:717) are latched by `deferEffect`. The deferral the plan remembers is
the `write()` seam's own `cmdDeferEffect` (sched-commit.ts:298), which publish does not use: `setDayApproved`
(publish.ts:289) and `alIssue` (publish.ts:866) call `reflow()` inline, so `validate()` already runs synchronously
inside the publish command, right after `SCHED.cur[di]` is stamped. OFFICIAL is fresh at that point.
**Fix.** `HOOKS.issuedWarn(di)` is a pure READ: in store.ts `HOOKS.issuedWarn = (di) => sliceOf(officialWarn(), di)`
(a JSON clone of the five per-day slots). Call it AFTER `reflow()` and BEFORE `histPush()` in both issue paths:
`SCHED.orig[di].w = HOOKS.issuedWarn(di)` and `snap.w = HOOKS.issuedWarn(di)` (the pushed AL record holds `snap` by
reference). No second validator run; strike the cost line. **Guard:** it must read `officialWarn()` (raw), never through
`withOfficialWarn`/`faceWarn()` — a re-issue would otherwise freeze the PREVIOUS version's frozen slice as the new one.
Headless default `() => null` → no `w` → the face reads OFFICIAL, as the plan says.

### F3 — The read side of `warnDelta` has an import cycle and a self-reference the plan does not name
**Cycle.** `warnDelta(di)` must read OFFICIAL, but `publish.ts` cannot import `validate.ts` (validate imports publish).
The plan names a hook only for the issue-time run. **Self-reference.** `dayDeltaIn` is read INSIDE the validator by
`officialDiverges` (validate.ts:1387); if it gains the warn axis, the gate reads the PREVIOUS run's OFFICIAL — stale
and circular. The plan says "a core delta without this axis" but does not say which function is which.
**Fix.**
1. One read seam serves both jobs: `HOOKS.issuedWarn(di)` (F2) returns the current OFFICIAL slice; `warnDelta` in
   publish.ts compares `canonical(HOOKS.issuedWarn(di))` with `canonical(snap.w)`. Unwired or no `snap.w` → no entry.
2. Split explicitly: `dayCoreDeltaIn` = content + filing + input + OIL (read by `officialDiverges` and nothing else);
   `dayDeltaIn` = core + warn (read by `dayDelta`, `dayHasChanges`, `pendingKey`, `alIssue`, `dayPendingItemsIn`).
   Pin: a test that `officialDiverges` does not change when only `snap.w` differs.
3. Name it `issuedWarnDelta`: `state/dropflag.ts:55` already exports a `warnDelta(before, after)` for a different job —
   two bodies with one name is the drift seam the doctrine forbids.
4. The key: per warning `code ␟ sorted who ids ␟ msg`, entries sorted; plus the four maps with keys sorted. Store a
   short fingerprint (the FNV `fp` already in publish.ts) as `from`/`to`, never the key itself — the plan stores "the
   canonical key" on the AL record forever (kilobytes per AL); `inputDelta` already hashes, be consistent. The pending
   list words the change from `snap.w` against the live slice; history, if it ever prints one, from the two versions'
   `w`.

### F4 — The frozen `trace` makes a published day read pending for edits to a DRAFT neighbour, and points at warnings that are gone — put to him
**The consequence, spelled out.** A dotted ring on Monday's puck says "his day-end breaks Tuesday". With `trace` in
`snap.w` and in the key: every edit to a draft Tuesday that changes whether a Monday man breaks rest makes published
Monday read "1 pending · Warnings changed" and drops its four; publishing Tuesday does not clear it (OFFICIAL Monday is
still compared with an older `w`); only re-issuing Monday clears it; the next Tuesday edit does it again. And the frozen
ring's jump (`traceIx`) looks up the FACE's Tuesday list, where the breach may no longer exist — the tap goes nowhere.
The plan's step-4 test enshrines exactly this ("a neighbour draft day's late flight → Warnings changed"). It is D179
read literally, so it is his call, not ours; D179 is "for now — put it to him again when the build shows it". Show him
this case on the build, with the picture.
**Recommendation to put to him:** a trace is a pointer into ANOTHER day's warning list, so it should resolve in the world
that day is shown in — live while Tuesday is a draft, frozen once Tuesday is published (the FACE already does this for
Tuesday's own list). Read `trace[di]` from the FACE's neighbour computation, keep it OUT of Monday's key and out of
`snap.w`. Monday's own rings and list stay frozen; a pointer never outlives what it points at. Monday's OWN breach
caused by a draft Sunday's late duty (the previous week's stash) stays frozen and pending — that IS Monday's face.
If he wants D179 literal instead, keep the plan and write the ping-pong into the register and the evidence sheet.

### F5 — The Leave War period advisory must be kept live by code, not by a sentence
`OIL_NO_PERIOD` (validate.ts:1258) is an `adv` entry in `byDay`, designed to "keep saying so after publication" (D19; the
sweep's B6, which the plan "leaves alone"). Frozen into `snap.w` and the key as designed: the face would go on saying
"no period" after the admin creates it, and creating it would clear the advisory on OFFICIAL → "Warnings changed"
pending on every published weekend of that year → each must be re-issued to clear an admin to-do. D179 excluded exactly
this.
**Fix.** `validate.ts`: `export const LIVE_ON_FACE = new Set(['OIL_NO_PERIOD'])`. The FACE builder replaces a day's list
with `w.byDay.warns` PLUS OFFICIAL's entries whose code is in the set; the key skips them; `issuedWarn` may store them
or not (skipped either way). `OIL_STALE_HOLIDAY` stays IN the freeze: it says "publish it again", and D2 wants that
day pending. Test: create the missing period → the advisory clears on the face, the day reads 0.

### F6 — Storage growth is real and unweighed (new data, so not D56)
Each version now carries a clone of every input covering its date and its warnings; `persistAll` rewrites the whole week
record on every `histPush`. A busy day is roughly 5–10 KB per version; a week with three ALs a day is a few hundred KB,
and every visited week persists. `storage/browser.ts:108` retries a failed write; a quota throw would retry without end.
**Fix.** (1) Keep `w` to the five per-day slots and, per warning, `{sev, code, who, msg, key}` — drop `day`/`di`
(derivable). (2) Measure in the evidence sheet: the week record's size after 7 days × 3 ALs on the demo week, at issue
and after a reload. (3) A unit pin: one version's `inp` + `w` under a stated ceiling on the busiest demo day. (4) Ask
`storage/browser.ts` what it does on `QuotaExceededError` and say so in `docs/data-schema.md` — a full store must not
loop.

### F7 — Small wiring the plan does not name (each a one-line build item)
- `ui/pendlist.ts:233 RANK`: a `warn` item falls to rank 6 (mid-list); give it 10, after `oil`. D119 (newest first) puts
  an untimed item below the timed ones anyway.
- `publish.ts:234 itemCounts`: an unknown kind is counted as a "change"; add `wrn: by('warn')` and subtract it from
  `chg`; `diffCounts` (publish.ts:149) too. `ui/ALPanel.tsx:71` gains "· N warnings".
- `ui/ALPanel.tsx:71` "N input filing(s)" now also counts value changes → "N input change(s)".
- `official-flags.test.ts` CRPF-001 (line 489, "a downchit added after publish flags OFFICIAL immediately") INVERTS
  under D179 + frozen inputs: rewrite it as "OFFICIAL excludes it; the day reads 1 pending; the face reads fit". §4
  (quals and rules, lines 409–446) does NOT flip — OFFICIAL is still the detector and re-checks live quals and rules;
  only the FACE freezes. Say so in the test's own header so a later reader does not "fix" it back.
- Comments that now lie: validate.ts §5.4 (`withOfficialWarn` "points WARN at the OFFICIAL bundle"), `html.ts:184–188`
  ("the flags read are the OFFICIAL bundle's"), `view.ts:562–581`. Fix them in the same change (newest-instruction-wins).
- The grep test ("no schedule-surface file calls `INPUTS.filter(… inputCoversDate …)`"): name the files it covers
  (`ui/html.ts`, `ui/board.ts`, `ui/board-html.ts`, `engine/events.ts`, `engine/avail.ts`, `weekctx.ts workedSet`);
  `publish.ts`, `weekctx.ts liveFilingAt`, `drafts.ts:583` and `oilev.ts` read the live records on purpose.
- The folded OIL line (`oilMovedInputsOnly`, uncommitted): when a request's edited window is the only thing that moved
  what the day earns, the pending list shows the input line alone. The AL still carries the OIL entry, so the record is
  whole — but D45 is about the admin SEEING it: append "· what the day earns changes with it" to the folded line.
- `windowInputs` keys by the stash's `days.days[di].dt` and the loaded week by `snap.d.dt`; `withFrozenInputs` folds
  both through `dateOrd` — right (the CRPF-004 New Year trap). Say so in its comment.

---

## What I checked and found sound (explicit negatives)
- **D174 / D176 are not regressed.** The plan text says nothing about dormant requests, but `frozenInputDiffs`
  (inputs.ts:100) treats an input taken off ('r') on one side and absent on the other as no difference. A request 'r'
  at publish and since deleted reads 0; one filed since and taken off reads 0. Put it in the plan's layer-1 words.
- **The alias gate is complete for inputs** — in the code, not the plan text: `officialDiverges` reads `dayDelta`, which
  now carries `inputDelta` (loaded week); `windowDiverges` (weekctx.ts, uncommitted) carries `frozenInputDiffs` for a
  published neighbour. Without the second, a Sunday input's edited times would have read into Monday's seeds live
  whenever nothing else diverged. Write both into the plan.
- **No warning is clock-driven** (no `Date.now`/`new Date` in validate.ts; the LATE mark lives outside the validator),
  so the key cannot drift overnight and the four cannot fall with nobody acting. A rename moves `msg` — the plan's
  acknowledged edge; the key on `code ␟ who ids ␟ msg` limits it to warnings that name the man.
- **Undo, Unpublish, redo, reload, week switch:** `history.ts:24/60` serialise `SCHED.als`/`orig` whole, so `inp`/`w`
  ride every history snapshot and the week stash (`schedFields` is shared); `unpublishDay` drops the record and `cur`
  falls back to the prior version, whose own `inp`/`w` then drive the face and the comparison; `retireIssued`'s
  fallback now carries `inp`/`w` (uncommitted fix); `histApply` reflows (history.ts:131) so the FACE cache is rebuilt.
- **The load and plans:** `loadVersionToWorkingCopy` clones `snap.d` only and reads `snap.fil` for the put-back — never
  `inp` (AM1); `dayDiscardCount` excludes the input axis, so "Discard N edits" cannot claim an input it leaves. A parked
  plan resolves to `{d, c:{}}` — no `inp`, live inputs, WORKING flags, as today.
- **Print and CSV** (`ui/export.ts publishedDays`, `printpdf.ts`) read `snap.d` content only — no inputs, no warnings —
  untouched.
- **REST/EVD** are not swapped by `withOfficialWarn` and feed the edit page's crew picker only (validate.ts:1356) — the
  face never reads them, so nothing there can disagree with a frozen `w`.
- **The OIL wire** never calls `dayDeltaIn` on a stashed week (grep: no caller outside publish.ts), so the new axis
  cannot read the wrong week's date there. OIL money stays frozen on `snap.d.oilev` (D142/D48); the ALL AVAIL crowd on
  the face replays `oilev.mem` (D44).
- **The reader conversion** is complete on the surfaces named: no `INPUTS.` read remains in `ui/html.ts`, `ui/board.ts`,
  `ui/board-html.ts`; `events.ts` (three sites + `inputOn` at :96), `avail.ts` (six), `inputs.ts sansAvailOn`,
  `weekctx.ts workedSet` all read `inputsOn`. `srcInput` → `inputOnAny` gives the A4 LATE badge the issued copy.
- **Inputs that write acc only** (navigation's `reconcileLandedAcc`, the seed auto-land, the load's put-back) cannot move
  `inpDetailKey` (acc excluded); a Leave War approval or remarks edit writes `mod`/`remarks` and IS a change (D178).
- **Performance:** `frozenInputDiffs` and the future key sit inside `publishReadPass`'s memo (once per day per repaint);
  the FACE build is five slots per day; `inputsOn` under a freeze is cheaper than the filter. One real cost to state: an
  input edit on a published day now keeps the second validator pass alive on every keystroke until the AL is issued —
  the same class a filing change already paid.

## For the evidence sheet (walk items the plan's tests do not name)
1. View page, published Monday: change a rule setting → the ring changes on the working copy only; tap the frozen ring
   → the frozen warning opens (F1). Board preview of Monday's Original → input-row pucks show no rings (F1).
2. Draft Tuesday edited so a Monday man breaks rest → what Monday reads (F4) — his picture.
3. Create the missing Leave War period for a published weekend → advisory clears on the face, 0 pending (F5).
4. Type an OIL award on a published Saturday (D79): its row appears under Unavailable on the working copy, 1 pending,
   the face unchanged — expected under D178; note it so a walker does not file it.
5. The week record's size before and after (F6).
