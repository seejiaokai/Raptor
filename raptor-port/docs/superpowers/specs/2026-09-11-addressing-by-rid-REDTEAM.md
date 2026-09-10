# Addressing-by-rid engine wiring — Round-1 red-team findings (11 Sep 26)

**READ THIS BEFORE BUILDING the rid engine wiring (spec tasks 2–7).** The design
spec is `2026-09-10-addressing-by-rid-design.md`. Two independent reviewers —
**Astra (GPT-6 Astra, Codex)** and **Fable 5.1** — reviewed that spec at high
effort, read-only, and **both returned REVISE**. Their findings converged. The
spec must be **revised to close these**, then **re-reviewed by both models**,
before any code is written. (Coordinator: Opus 4.8.)

**The live app is safe today.** `migrateBookKeys` is defined but NOT yet wired
into boot (that is task 5), so nothing translates yet — no silent corruption is
running. Every finding below is about what happens WHEN the wiring is built, and
every one is fixable in the spec first.

## The 6 convergent findings (both models, independently)

1. **New rows get their `rid` too late → the new-row amendment is silently lost.**
   `ensureRowIds` mints ids inside `histPush`, which runs AFTER `markStructuralAdd`.
   So a `+ Line` / `+ Wave` on a published day stores a POSITIONAL key, then the
   id is minted, then paint/`dayKeys` look under the rid — no match, the mark
   vanishes. This is the most common edit. **[PRIMARY RISK.]** Sites:
   `board.ts` add sites (lines ~730–1455), `slots.ts:364-376` (`acceptInput`),
   and `applyWeekModel` restore-landing. **Fix in spec:** a "mint before mark"
   rule — `ensureRowIds(DAYS)` (or per-row mint) before the first translate.

2. **Delete cleanup is wired in the wrong file.** The spec puts it in
   `reorder.ts`, but every actual delete lives in `board.ts` (~717–926) and
   `slots.ts` (`unacceptInput`). And an ancestor-free key can't sweep a deleted
   parent's child marks. **Fix:** capture the removed subtree's rids BEFORE the
   splice and drop their keys at each real delete site; define `dropRowMarks`
   over any component.

3. **Key-shape mismatch: the merged foundation keeps ancestor ids; the spec
   drops them.** `rowids.ts`/`rowids.test.ts:70` pin the ancestor-RETAINING form
   (`di.wRid.fRid.aRid.p`); the spec table shows ancestor-FREE (`di.aRid.p`).
   **[COORDINATOR-VERIFIED.]** One or the other must be chosen and made
   consistent across `ridKey`/`posKey`/`dayKeys`/`migrateBookKeys` AND the
   expected-key test strings, BEFORE wiring. (Fable notes: the nested/retaining
   form is safer for `dropRowMarks` — a rid is `r`+base36, never a literal.)

4. **Draft duplication re-mints ids → the whole day falsely reads as changed.**
   `draftDup` strips + re-mints every parked draft row's id (pinned by
   `drafts.test.ts:174` zero-pending, `rowids.test.ts:309-334`). Under rid-keyed
   `dayKeys`, a parked draft then looks all-new vs the issued snapshot → every
   field goes pending. **Fix (owner-adjacent DECISION):** either (a) `draftDup`
   keeps ids for drafts, or (b) rebase/reconcile pair rows against the snapshot
   and translate the result (keep `dayKeys` positional, translate after). Fable
   leans (b) — smaller, keeps `dayKeys` as the positional grammar the foundation
   tests mirror.

5. **Reorder/move reads `SCHED.added` positionally → the add-then-delete no-op
   breaks.** `reorder.ts:60` (`done`) and `:89` (`sortedKey`) look up `SCHED.added`
   by a positional head key the rid-book no longer holds. Not listed in the spec's
   reorder entry. **Fix:** translate those two lookups via `ridKey`.

6. **Legacy-book migration pairs rows by position → wrong identity after a
   delete.** `migrateBookKeys` trusts `backfillSnapshotIds`, which pairs legacy
   snapshot rows to live rows by POSITION; after a delete that glues the wrong
   id on and mis-attributes amendments. **Fix:** don't equate rows by position
   alone; use snapshot-local identity or retain a legacy addressing mode.

## Additional findings Fable added (fold in too)

- **`jumpToChange`/`findHistCell`** (`interactions.ts:73` → `histbubble.ts:105`)
  hands a stored rid key to a positional DOM scan → every changes-list jump
  toasts "no longer on this day". Not in the spec's UI audit. Needs `posKey`
  before the scan.
- **`migrateBookKeys` skips `SCHED.orig[di].c`** (the reissue/original preview) →
  marks vanish there. One-line completeness fix (translate against `orig[di].d`).
- **`logEdit` needs BOTH keys**: label from the POSITIONAL key, store the rid
  key — the spec's "translate after labelling" underspecifies the `noteChange`
  path. Specify `logEdit(posKey)` → `keyLabel(posKey)` then `key = ridKey(posKey)`.
- **`rebaseDayPending` attributes an add to the LAST row** (length-based diff);
  under rid that lands the add on the wrong row. Compute adds/tombstones as rid
  set-differences between `snap.d` and the live day.

## Confirmed CLEAN (don't re-worry these)

- **Parity:** no `rid` leaks into rendered HTML (checked `html.ts`, `board.ts`,
  `board-html.ts`, `peek.ts`, `ALPanel.tsx`, `Shell.tsx`). `alAttr` only
  translates its lookup key.
- **Fallback spaces:** `dn:`/`sn:`/`pn:`/`del:`/`mov:`/`inp:`/`iu:` are in
  `NONROW`; `shiftKeys`/`permuteKeys` are genuinely inert on rid keys.
- **Performance:** `ridKey` is O(depth), fine on the paint path; `posKey`
  (O(n)) stays OFF it (flash/label/migrate only). Suggest an empty-book
  short-circuit in `alAttr`.

## Process for the next session (HEAVY)

1. Revise `2026-09-10-addressing-by-rid-design.md` to close findings 1–6 + the
   four Fable additions. Two are owner DECISIONS to raise first: the **key-shape**
   (finding 3) and the **draft-identity approach** (finding 4).
2. Re-review the revised spec with BOTH Astra and Fable (claudex-loop for Astra;
   a Fable Plan agent for Fable). Only build on convergent approval.
3. Build with **Opus 4.8, high**, TDD per the spec's task plan; Fable independent
   bug-check after; **HOLD before live** — merge only on the owner's "merge live".
4. Start on a fresh branch cut from `main`.
