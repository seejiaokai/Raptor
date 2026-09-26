# Fable's read of the finished code — `[LEAVE-LATE-PUBLISHED]` (26 Sep 26, FULL tier, blind)

Brief: `docs/superpowers/briefs/2026-09-26-late-published-read-brief.md`. Read: the diff `5f4496a3..HEAD` whole, the live
files it names, the rulings (D177–D179, D174/D176, D103, D98, D109/D113/D114, D44/D45, D48, D142, D56), the plan, the
evidence sheet §3, the two scenario designs and the two plan attacks. Run: `latepub.test.tsx` (15/15) and
`official-flags.test.ts` (26/26), and three throwaway probes from my scratch folder against the live code (two confirmed a
finding, one was inconclusive — said where it matters). Nothing in the repository was edited except this file.

**Process disclosure.** One `vitest --dir <scratch>` was swallowed by the repo's two-project config and ran the WHOLE suite
once (366 files, 5954 tests): one failure, unrelated to this branch — `src/ui/inputscal.test.tsx` "a real
pointerdown+pointerup on an input chip sets INPEDIT" with `document.elementFromPoint is not a function` (×7). Not
investigated (out of scope); run that file alone — if green alone it is order- or environment-dependent. The repo is
public (D106), so his PC's runner was stopped; D86 was not crossed.

## Findings, ranked by consequence

### F1 — A change at the FAR END of a multi-day input reads pending on every published day it already covered, and un-signs them, though their faces are byte-for-byte unchanged (CONFIRMED by probe)
- **Setup:** Ranger's LL Mon–Tue; Monday and Tuesday published and signed. **Action:** the leave is extended to Wednesday
  (the Inputs page, or the Leave War approving a further day — the design's W8 "extends an existing one, same id, longer
  span"). **Expected** (the plan's own test — "the axes that can move the face"; W8 "1 on each NEWLY covered published
  day"; Q4 "the day's projection by content"): Mon 0, Tue 0, Wed 1 "filed". **Observed:** Mon "1 pending · Ranger · LL ·
  Jul 13 – Jul 14 → Jul 13 – Jul 15", Tue the same, both days' four sign-offs down, both issued faces identical to before.
- **The same shape, the other way:** an upchit on Thursday for a Mon–Fri downchit trims its end date, so Mon, Tue and Wed
  (still covered, the man still down on their faces) all read pending and lose their four — W13 expected "1 on the day that
  lost the downchit" only.
- **Why it matters:** the two most common late operations (a war approval lengthening a leave; a medical officer's upchit)
  now cost the admin an AL, or Unpublish and publish again, on every published day the input touched, for no visible
  change — and each of those ALs carries an `inv:` entry saying nothing happened on that day. Cause: `inpDetailKey`
  compares the whole span (`a`, `b`); coverage of THIS date is already decided by `frozenInputMatch`'s membership on both
  sides, and nothing the face draws or the validator judges for this day reads the far end.
- **Fix.** `src/engine/inputs.ts inpDetailKey`: drop `a` and `b` from the key (keep person, type, allday, half, s, e,
  remarks, sans); reword its comment ("whether it covers this day is the membership; the far end of a multi-day input is
  another day's business"). `src/ui/pendlist.ts inputWords`: drop the `pair(dateWords(was), dateWords(now))` line (a date
  change on THIS day can only be filed / moved off, which the membership already words). `docs/engine-rules.md` "the real
  dates" → the same. Pins in `latepub.test.tsx`: (a) Mon–Tue leave, both published, extended to Wed → `dayDelta(MON)` and
  `dayDelta(TUE)` empty, the four hold, `dayDelta(WED)` one "filed"; (b) Mon–Fri downchit, Mon and Wed published, upchit
  Thu → Mon and Wed 0; Thu and Fri 1 each. Say on the look card that this reads D178's "edited" by what the DAY shows
  (D98 / AM20), so he can overrule.

### F2 — A medical takeover reads TWO lines for one act on the tail's days (CONFIRMED by probe)
- **Setup:** Trident's ATT C Mon–Fri; Wednesday published. **Action:** the MO files OML for Tuesday. The cascade trims the
  ATT C head to Monday (its remarks gain " till 13 Jul") and mints a TAIL, ATT C Wed–Fri, under a new id (remarks
  "… till 17 Jul"). **Expected** (W12; Astra's open Q1 "one medical status transition for one person/day is one even if
  its storage operation trims several rows"): Wed reads 1. **Observed:** Wed reads 2 — "Trident · ATT C · moved off this
  day" and "Trident · ATT C · filed" — while the face's only change is the machine-appended "till 17 Jul" in the remarks.
  The new input's own days do the same when it takes over a different type (old gone + new filed = 2 for one status change).
- **Fix.** `src/engine/inputs.ts frozenInputMatch`, between steps 3 and 4: pair the leftovers by man — for each W
  (acc ≠ 'r') take the first unused N (acc ≠ 'r') with the same `person` and (the same `type`, or both `isDownchit`) →
  `out.push({id: W.id, was: W.r, now: N.r})`, remove both. Carry the pair through: `publish.ts dayPendingItemsIn` sets
  `item.was = x.was; item.now = x.now` from `ax.changed` (add `was?`/`now?` to `PendItem`); `pendlist.ts inputWords` reads
  `it.now ?? INPUTS.find(…)` and `it.was ?? snap.inp[id]`, so a pair with two ids words as one edit ("Trident · ATT C ·
  “LONG DOWNCHIT” → “LONG DOWNCHIT till 17 Jul”"). Pin: the probe's scenario → one item, those words. **Put to him
  (one line):** should the cascade's own "till …" bookkeeping in the remarks count as the member's edit at all? (On a
  published Monday the trimmed head's remark change reads pending too.)

### F3 — A holiday declared (or revoked) after publishing very likely reads 2: the OIL line and a "Warnings changed" line for the advisory that exists to explain the OIL line (BY READING; my probe was inconclusive)
- `validate.ts` 1275–1312: `OIL_STALE_DAY`, `OIL_STALE_HOLIDAY` and `OIL_OLD_BLOCK` fire only when today's earning differs
  from the frozen block — exactly when `oilDelta` already reads one change; their own comment says they exist so that
  "1 change" is not unexplained. At issue they can never be in the frozen slice (the frozen block equals today's), so when
  one appears later the detector's slice differs → `warnDelta` → a second item and two lines saying the same thing.
- **Honesty note:** my own plan read (F5) said "`OIL_STALE_HOLIDAY` stays IN the freeze — D2 wants that day pending". The
  day IS pending, through the OIL axis; keeping the advisory in the key counts the same event twice. That read was wrong
  on the count. My probe stubbed `HOOKS.oilEarningDay` after publishing and the day's earning did not flip (the earning is
  read another way in the engine), so **confirm in the app**: publish a weekday, declare it a PH in the Leave War, read the
  day head. Expected 1.
- **Fix if it reads 2.** `src/engine/validate.ts LIVE_ON_FACE`: add `'OIL_STALE_DAY'`, `'OIL_STALE_HOLIDAY'`,
  `'OIL_OLD_BLOCK'` — they are reminders about the published day's relation to today, the same class as `OIL_NO_PERIOD`,
  and they then also draw LIVE on the issued face, which is what D2 asked for ("the day says so"). Pin beside
  `official-flags` §4: publish, flip the earning the way `leavewar/oilsync.test.ts` does, assert no `warn` entry and one
  `oil` entry.

### F4 — The folded request row loses its tap target (by reading)
- **Setup:** an accepted request with a row on a published day. **Action:** the member edits its times (or an admin drags
  another man onto it). **Expected** (D99/D100): the one line is tappable and takes the view to the row. **Observed
  (`pendlist.ts inputWords` → `jump: false`; `dayPendingItemsIn` folds the row's units into `item.rows` but never carries
  their `jump`/`keys`):** the line is drawn "still" — "no place of its own on the schedule to go to" — with the row right
  there.
- **Fix.** `publish.ts dayPendingItemsIn`, where a unit is spliced into `item.rows`: also
  `item.jump = (item.jump||[]).concat(u.jump||[])` and the same for `keys`. `pendlist.ts inputWords`: return
  `jump: !!(it.jump && it.jump.length)` (a filed leave with no row stays `false`). Pin: the "accepted request edited …
  folds into it" case renders a `<button class="pl-item">`.

### F5 — A plan item not built and not recorded as dropped: the load's message
- Plan, Layer 1, last bullet: "The load's message says so, in the same way it already names a filing it could not put
  back." `drafts.ts` and `interactions.ts` are untouched. After "Load onto working copy" on a day with a member's late
  leave, the toast says "ORIG loaded onto the working copy …" and the day still reads "1 pending" with no word why.
- **Fix.** `src/ui/interactions.ts` (the `said` sentence, ~line 1017): after the load, count
  `dayPendingItems(di).filter(x => x.val && !x.inp).length` and append " · N member input(s) changed since — stay pending
  (a member's record is his)". Record it in the evidence sheet §8 either way.

### F6 — Two wordings that mislead (low)
- (a) `ALPanel.tsx:47` and `:75` say "N input filing(s)" — that count now includes detail changes (an edited leave is not
  a filing); my plan read (F7) asked for "N input change(s)". The AL history tag has no word for a `warn` item. Fix: the
  wording, plus `${c.warn ? ' · warnings' : ''}` on the tag.
- (b) `pendlist.ts warnWords`: when only `pa` or `rv` moved (a man's category, seat or posting; the brief-lead setting) the
  line reads "Warnings on this day — a ring or mark changed", which is neither. Fix: export a small
  `peopleAttrsChanged(di)` / `ruleValsChanged(di)` from publish.ts (comparing `snap.pa` with `dayPeopleAttrs(snap.d)`,
  `snap.rv` with `faceRuleVals()`) and word them "a man's category or seat on this day changed" / "the brief lead
  setting changed".

## Watched, not findings
- **Storage growth:** every version now carries a copy of every input on its date and its warnings; my plan read (F6)
  asked for a measurement in the evidence sheet and §5/§6 are still empty — record the week record's size after the walk.
- **The second validator pass** now runs on every edit while any published day (loaded or a stashed neighbour) carries an
  input change — the plan's accepted cost; the phone walk showed no console errors, no timing was recorded.
- **Cross-device:** a frozen `w` judged with a stashed neighbour's edits reads "warnings changed" on a browser without
  that stash — the pre-database per-browser truth, expected everywhere in the app.
- **An unrelated red in the full suite** — see the process disclosure above.

## Explicit negatives — checked and sound, by name
- **The roll-call's readers.** Every schedule-surface and validator date read goes through `inputsOn` / `inputOn` /
  `inputOnAny`; the direct `INPUTS` reads left are the records' own readers — the Inputs page and its calendar, the medical
  tracker, the Leave War (`sync.ts`, `inputgate.ts`, `DayList.tsx`), `inputedit.tsx`'s clash checks, the crew palette (an
  edit-page tool, rightly live), `drafts.ts:583`'s live-world check, `slots.ts reconcileDayFiling`, the click handlers in
  `interactions.ts`/`board.ts` (edit the live record), `pendlist.ts`'s lookups by id. The grep pin covers the six files.
- **Medical on the official pass.** `dayFilingFingerprint` covers every input on the date, so a downchit present at
  publish keeps its DNIF on the face; one filed after is absent from `fil` → dormant → hidden, and pending (CRPF-001's
  flipped pin).
- **`setDayApproved`** marks the day approved before `freezeWarn`, so the frozen slice never carries "not published yet".
- **The trace** (next-day crew-rest mark) writes only `trace`, never `chip`/`sev` on the cause day — F4 of the plan read
  holds: a draft Tuesday's edits do not un-sign a published Monday.
- **The gate:** `officialDiverges` reads `dayDeltaCore` (no warn axis) — the validator never gates on its own output; the
  warn axis IS in `dayDelta` → `pendingKey` (D103), `dayHasChanges` (eligibility) and the AL's stored `diff`/`ukinds`.
- **`faceWarn`:** `byDay` is dense (one object per day), so a replaced slice is never `undefined`; `all` rebuilt from `byDay`
  loses nothing (the `di:null` trace writes no warning); the cache invalidates on every validate (new OFFICIAL object) and
  on a version change; `reword` follows a rename (the Quals page re-validates). `view.ts` (the tapped list and the trace),
  `Modals.tsx` (the ⓘ panel, through `withChipWorld` → `withDaySnap` → frozen inputs) and `html.ts` all read the face.
  `diffMode` (`officialWarn() !== WARN`) is now true on any published day with a frozen version — harmless (equal sets →
  no rows) and the "new once signed" tag now rightly appears for a quals change.
- **Unpublish** re-opens only field marks from `SCHED.changes`; `inv:` / `warn:` never become pending keys; `retireIssued`
  keeps `inp`, `w`, `pa`, `rv`; undo of a publish runs the same path (test pins).
- **`passMemo`** is live only inside a read pass and keyed by the day object; the freeze's `validate()` runs outside one.
- **Boot:** `main.tsx` validates before the first render — no boot flash of "N pending".
- **Date keys:** `withFrozenInputs` and `world.ts setFiling` both fold through `dateOrd`; a parked plan reads live.
- **Determinism across a reload / week switch:** a warning is `{sev, code, who, day, di, msg, key, …}`, all content-derived;
  the key sorts the list; `stableJson` and the stored JSON agree on `undefined`/`null`; the "neighbour publish" and
  "repeated validates" pins hold.
- **`inpDetailKey`** covers every drawn field of `Input` (person, type, allday, half, s, e, remarks, sans; the dates — F1);
  excluded on purpose and rightly: `iid`, `acc`, `mod`, `lw`, `docId(s)`, `oil`.
- **The fold** (`oilMovedInputsOnly`): an OIL answer change (`ans`, out of the details key) keeps its own OIL line; an
  `earns` flip keeps its own line; a leave taking a man out of ALL AVAIL's crowd folds into his line with "what the day
  earns changes with it".
- **Print / CSV** read no inputs; `peek.ts` (next-week preview) noted outside the item, as the sheet says.
- **`board-html`** sorts filtered copies, never the shared frozen array.
- **Roles:** unchanged; a member sees the frozen face and his own records.

Rulings: none this session (reviewer).
