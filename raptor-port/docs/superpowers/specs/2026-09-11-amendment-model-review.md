# Amendment model review — publish / draft / amend / undo (11 Sep 26)

Owner reported the publish/amend/undo flow feels "weird / buggy / not intuitive",
with a specific complaint about AL numbering. Investigated read-only by **Astra
(Codex)** and cross-checked against the code by **Claude (Opus 4.8)**. No code
changed — this is a findings + open-decision record for a follow-up design task.
Astra could not run vitest in its sandbox (EPERM on temp dirs), so its test
evidence is by inspection; the two bugs below were re-traced against the code by
Claude and hold up.

## The AL-numbering question — an OPEN PRODUCT DECISION (owner's call)

**Current behaviour (confirmed, and INTENTIONAL — not a bug):** AL numbers are
counted **week-wide**, not per day. `nextAL()` returns the lowest unused number
across the whole week (`alUsed()` = every `SCHED.als[].n`); `publishALDay()` uses
that same global value (`publish.ts:386-395, 435-442, 494-495`). So Monday's first
amendment = AL1, and Tuesday's FIRST amendment = AL2 (not its own AL1). The
"ORIG then AL" part already works per day (each day gets its own Original).

The design deliberately supports **one AL covering several days at once** —
`alIssue(n, keys)` writes one record whose `days`/`snap` hold multiple day entries
(`publish.ts:410-430`). That matches how a paper Amendment List often works.

**The decision:** does an AL number belong to the WHOLE PROGRAMME (status quo) or
to EACH DAY (owner's expectation: Mon ORIG→AL1→AL2, Tue independently ORIG→AL1→AL2)?

Per-day numbering is a sound product model but a LARGE change, not a toggle. It
changes an AL's meaning from "one amendment document" to "one day's version", and
breaks the multi-day-single-AL feature (would need a shared batch id + per-day
display numbers, or separate per-day records). Blast radius Astra mapped:
`nextAL`/`alUsed`, `SCHED.als`, `SCHED.changes` (needs day-qualified attribution),
`SCHED.cur`, `daySnapOf`/`daySnapIn` (lookup by global number → must include day or
a unique record id), `dayVersions`/version picker, `reissueReopened` (finds by
`.n` alone — ambiguous under repeated numbers), `unpublishAL`, `publishAL`,
`ALPanel.tsx`, `Shell.tsx` banner, `html.ts` day chips/stamps/pickers, `alAttr`
preview, undo/redo (history serializes the publish structure), week
stash/persistence, and a saved-data migration for existing global-AL books.
Risks: silent mis-attribution, wrong rollback target, byte-parity, undo-schema
change, migration of saved weeks. → HEAVY, design-first, red-team both providers
before building.

## Two genuine bugs found (separate from the numbering preference)

### BUG 1 — unpublishing an OLDER AL leaves the day contradictory (Medium–High)
`publish.ts:449-473` (`unpublishAL`). Repro: publish ORIG; edit note A → AL1; edit
note B → AL2; then unpublish **AL1**. Result: A returns to pending, but the day
still shows AL2 and AL2's frozen snapshot still contains A. The state then says
both "A is pending" and "issued AL2 already contains A"; a later publish re-marks A
as freshly amended. Unpublishing the LATEST AL is handled coherently and is tested;
the older-AL case is not. (Claude traced this; consistent with the code.)

### BUG 2 — the day-head "✓ Published" reopen button is not scoped to the previewed version (Low–Medium, UX)
`html.ts:961-967` (`dayStatHTML` beak) + `interactions.ts:763-770` (`data-beak` →
`setDayApproved(di, !dayApproved(di))`). While viewing a historical issued version
(ORIG or an older AL) via the edit version picker, `pvDraft`/`workView` are both
false, so the ACTIVE reopen button still renders and acts on the LIVE day, not the
version on screen. Showing the live version in the stamp during preview is
intentional (`html.ts:943-951`); the reopen ACTION staying live during an
issued-version preview is the gap. No data corruption; a credible source of the
"weird" feeling. (Claude confirmed via html.ts.)

## Recommended sequencing
Decide the numbering direction FIRST. If per-day is wanted, that rework reshapes
`unpublishAL` and the reopen/preview paths anyway, so both bugs get redesigned
inside it — don't fix them twice. If whole-programme numbering stays, fix the two
bugs as their own small, careful, red-teamed change. Everything else in the flow
(normal publish→AL, reopen→republish, draft switch/rebase, load-onto-working-copy,
restore, undo, latest-AL unpublish, multi-day snapshot) traced clean.
