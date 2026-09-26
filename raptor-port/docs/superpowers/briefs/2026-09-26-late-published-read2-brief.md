# Brief — `[LEAVE-LATE-PUBLISHED]`: the SECOND read of the finished code (26 Sep 26, morning) — FULL tier, both providers, blind

You are an independent reviewer. You did not write this code. **Do not edit any file.** Read the LIVE files. This is the
second read: the first reads (`raptor-port/docs/handpass/2026-09-26-late-pub-{astra,fable}-read.md`) found defects that
have since been fixed, the owner then ruled on what stays live (D183, D184, D185), and the app has been walked again.
Your job is the code as it stands NOW — above all what changed since the first read.

## What changed since the first read, and the evidence in hand
- **The rulings** — `.claude/rules/decisions/scheduler.md`: D183, D184, D185 (and D185's row, "the agent's reading WIDENED
  at the build"), with D177–D179, D44/D45, D98, D103, D109/D114, D174/D176; `.claude/rules/decisions/oil.md` (D2, D48,
  D142); `.claude/rules/decisions/how-we-work.md` (D56, D67); `.claude/rules/raptor-executor.md`.
- **The rule as written:** `raptor-port/docs/engine-rules.md` §Publishing, "A PUBLISHED DAY KEEPS WHAT IT WENT OUT WITH" —
  above all its new bullet "What stays LIVE on the face".
- **The evidence sheet: `raptor-port/docs/handpass/2026-09-26-late-pub.md`** — the roll-call (§3, with its morning rows),
  the walks (§4, §4b, §4c), the break tests (§5), what was not walked (§7), the reads and fixes (§9). Look for roll-call rows
  that are wrong or MISSING.
- **The diff since the first read:** `git diff 9392e984..HEAD -- raptor-port/src` (branch `claude/leave-late-published`).
  The heart of it:
  - `src/engine/validate.ts` — `LIVE_ON_FACE` (now the crew-rest breach and tight turn, the 7-day run, the
    Qualification-flag warnings and every OIL warning); `validateCore`'s mark writers (`markRing` / `markChip` / `markDash`
    now file each mark in the day's whole map AND in a class, `fz` or `lv`, by the code a live warning's site passes);
    `warnSliceOf` (stores only `fz` marks); `faceWarn` (lays the official pass's `lv` marks and live warnings over the
    frozen slice).
  - `src/engine/inputs.ts` — `inpDetailKey` (no dates), `frozenInputMatch` (step 4: one man's gone + filed record, same type
    or both downchits, neither with a filing state, pair as one edit).
  - `src/engine/publish.ts` — `dayPendingItemsIn` (`was` / `now` on the item; a folded row's `jump` / `keys`), the
    comments on the freeze; `src/engine/faceattrs.ts` (Astra's #2, built after the first read, never read).
  - `src/ui/pendlist.ts` (`inputWords`, `faceWords`), `src/engine/drafts.ts` (`inputsLeftSaid`), `src/ui/interactions.ts`
    (the load's two messages), `src/ui/ALPanel.tsx`.
  - Tests: `src/ui/latepub.test.tsx`, `src/ui/latepub-load.test.tsx`, `src/engine/official-flags.test.ts` §4,
    `src/leavewar/amendretest-lw.test.ts`.

## Your job
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

Especially, look for:
- **a mark site of a live warning that does not name its code** (its ring or flag would land in the frozen class: stored,
  compared, and a published day would read pending for a change the ruling made live) — or a frozen warning's site that
  names a live code; and any OTHER writer of `sev` / `chip` / `dash` / `trace` outside the three mark functions;
- a published face whose rings, flags or warning list disagree with each other (the ring from one class, the warning from
  the other), or disagree with what `warnSliceKey` compares;
- a surface that reads a published day's warnings without going through `faceWarn` / `withOfficialWarn` / `officialWarn`
  (the edit surfaces rightly read the working bundle);
- a change the rulings made LIVE that still reads pending, or a change that should read pending (it moves a frozen
  warning, an input, a man's CAT, the brief lead) that reads nothing;
- the F2 pairing joining two acts that are not one (two different men? a leave and a downchit? a request?), or leaving a
  medical takeover as two lines;
- anything that breaks what worked before (the official pass, the cross-week seeds, the crew picker's rest look-ups, the
  byte-exact parity with the reference — `WARN.byDay` is compared; `sev` / `chip` / `dash` must be unchanged on the
  WORKING bundle — and performance on a phone: two extra map writes per mark).

**What is NOT a finding (owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored
when the code is already correct going forward** — no migration, no back-compat, no "an existing record would read
wrongly" (e.g. a version frozen before this morning, whose `w` still holds a live warning's marks). If the app would do
it again to NEW data, report it: that is a real finding and this exclusion does not touch it.

## Hand back
- Findings ranked by consequence, each with setup / action / expected / what you observed or would observe, and
  **exact, step-by-step fix instructions** (file, function, what to change).
- **Explicit negatives:** what you checked and found sound, by name.
- Plain English; tight.
