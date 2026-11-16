# `[WARN-WORDS-STANDALONE]`'s follow-ups — the code read's brief (chat 87, 16 Nov 26)

The ONE brief for both blind code reads of the job (`docs/bug-check-order.md` §4, §4a; D790, D1770): Astra (Codex), and a
fresh Opus reader. Same words to each; neither sees the walk's report, the builder's report or the other's. Each runs in
an exported copy, `C:/Users/User/wwf-read` — the branch `claude/warn-words-followups` at `7eade5b52` (the app's source is
the same at the branch's head), without the job's evidence sheets, briefs, pictures or `HANDOFF.md`. The job's app diff
against `main`: `JOB-DIFF.patch` at that folder's root. Sent to both at about 08:40 his time, while the walker walks.

## The brief, as sent

You are a blind code reader of a finished change to a flying-schedule app (React + a rules engine), working in the folder
`C:/Users/User/wwf-read` only. Do not open anything outside it — the project's live checkout holds other readers'
reports and the walk's results, and your read must be blind to them. If, after a compaction of your own context, a
"handoff" block is pasted into your chat, do not read it, and name that in your report.

**The change** (`JOB-DIFF.patch`; the files under `raptor-port/src`). His rulings' full rows are in
`.claude/decisions-full/scheduler.md` (search `^| D2073 |` and so on); the area page `.claude/rules/decisions/scheduler.md`
states them as they stand. Four pieces:
1. **D2073:** a duty desk made from an SC shift template (the board's + Block → SC Shift; a template's block carries its
   template mark), with its START typed and its END blank, is left out of crew rest until its END is typed, as an SC wave
   line already is (D2055) — never counted as ending an hour after its START. *The agent's reading, not checked with him:*
   only a desk made from an SC shift template, not every duty row with no END — a plain desk with no END keeps START +
   the Logic page's one-hour default. D2073 changes crew rest only; a desk's worked time and OIL are not part of it.
2. **D2074:** the seat warning is called "Illegal seat", not "Wrong seat", everywhere: its warning lines begin
   "Illegal seat:" ("Illegal seat: a WSO in the front seat of VL BFM (T/O 12:00)"), the check's short name is
   "Illegal seat", and the Legend keeps "qual / illegal seat". It narrows D2071 on that one label; the rest of the
   approved words stand.
3. **D2077 (with D2070):** the Logic page's explanations say "conflict", never "clash", in every place they name the
   check.
4. **D2075 / D2078:** Edit Schedule's Legend names each flag as the check is now named — 7 "days in a row", Q
   "qual / illegal seat", B "misses flight brief" and "misses sim brief", D "misses flight debrief" and "misses sim
   debrief", L "long day"; the rest unchanged; only the six words change, both sizes keep their height (the approved
   picture: `raptor-port/docs/mock/2026-11-16-legend-words/img/`).

**Do not merely review the changed code.** Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

In particular: **every way a duty block or desk gets — or keeps, or loses — its SC template mark** (+ Block → SC Shift,
a day or week template that carries an SC block, + Alt Plan / a saved plan brought out, copying or pasting a day or a
block, a published day loaded back or its 👁 look, Undo / Redo, a reload, renaming a block, adding or deleting a row
inside an SC block, moving a row between blocks, a block typed by hand that is named like an SC block but is not one);
**every reader of a desk's end time** that should now agree — crew rest's list line, its forward trace and the crew
picker's rest window, ALL AVAIL and the crew list, the week's edge (a Sunday desk into the next Monday, the peek),
the day-details window, Insights' hours, the long day, the tight turn — and whether any of them still computes START +
1h for itself for an SC desk; **every drawer of the seat warning's words and its short name** (the engine's lines, the
issues list, the Board, the puck's Q chip, the day-details window, the foot note after a tap, the Logic page, Insights,
the history, the reference-side words in `src/testing/refwin.ts` and the parity tests) — is "Wrong seat" left anywhere
a person can see it; **every "clash"** still on a screen a person reads; **both homes of the Legend** (Edit Schedule's
fold and View-only Sched's) — do they share one builder, and do both keep their height at a phone's width.

**What is NOT a finding (owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that will
be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when the
code is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly", no
"a published day's frozen list carries the old words", no "a block saved before the change lacks the mark". If the app
would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it. Also not a
finding: anything about a scheduler who is not an admin (D785) — a scheduler is always an admin.

**What to hand back** — one report, in plain text, saved where your run's instructions say:
- each finding: the concrete failure (setup → action → what the screen shows), its cause (file and line), whether it is
  NEW in this change or older (compare with `main`'s code in the patch's minus lines), and **exact, step-by-step fix
  instructions** — not a direction;
- **explicit negatives:** every place you checked and found right ("I checked X and found nothing");
- you cannot run the app here: for any claim that needs a run, name the exact input (the day, the times, the people, the
  clicks) or the exact unit test you would write, and the host will run it. Write no file anywhere except your one
  report.
