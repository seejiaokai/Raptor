# The rules check's small batch — the code read's brief (chat 81, 15 Nov 26)

The ONE brief for both blind code reads of the batch (`docs/bug-check-order.md` §4, D790, D1770): Astra (Codex), and a
fresh Opus reader. Same words to each; neither sees the walk's report or the other's. Each runs in an exported copy,
`C:/Users/User/rcb2-read` — the branch `claude/rules-check-batch2` at `877810b90` (its app code exactly as at
`cc2eefa50`), without the job's documents, reports, plans or pictures. The batch's app diff against `main`:
`BATCH-DIFF.patch` at that folder's root.

## The brief, as sent

You are a blind code reader of a small finished change to a flying-schedule app (React + a rules engine), working in the
folder `C:/Users/User/rcb2-read` only. Do not open anything outside it — the project's live checkout holds other readers'
reports and the walk's results, and your read must be blind to them. If, after a compaction of your own context, a
"handoff" block is pasted into your chat, do not read it, and name that in your report.

**The change** (`BATCH-DIFF.patch`; the files under `raptor-port/src`):
1. Two checks renamed — `WCODE.LEAVE_FLY` "On leave + flying" → "On leave + planned", `WCODE.DNIF_FLY` "Downchit + flying"
   → "Downchit + planned" (`src/engine/validate.ts`). His ruling D2009 (full row in `.claude/decisions-full/scheduler.md`):
   "one name, true on every row, since a row such as a briefing is not a flight"; the day's own warning words ("On leave
   but tasked — BRIEFING") stay. *The host's reading:* every surface that prints the check's NAME — the warning list, the
   board, Insights, the Logic page — must print the new one.
2. The crew-rest warning's tail where the previous day's last flight had no landing typed (blank, or "TBD" — D1990): it
   must read "Mon took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00",
   never "landed" at the take-off time; a typed landing still says "landed" (D2010; `validate.ts`, `prevFlyNoLd`). D2010's
   row: "the same words wherever the borrowed take-off is shown as a landing (a "TBD" landing too, D1990)".
3. The Logic page's note under the changed-settings strip (`src/ui/LogicPage.tsx`, `#lgOff`) now reads "A published day
   keeps the settings it was published under, and the OIL they gave it, until it is published again. If a changed OIL
   setting would change that OIL, the day reads pending." (D2015 — "the new words are the build's … his to change";
   D2044). Read it for TRUTH against the code: is every sentence true of what the app does (D2005, D2013, D592, D2044 —
   their full rows in `.claude/decisions-full/scheduler.md` and `oil.md`)?
4. Comments only in `oil.ts`, `oilev.ts`, `faceattrs.ts`, `publish.ts` (D2014 answered by D2044: nothing of OIL built).
   Check that no code changed there and that each comment is true of the code it sits on.

**Do not merely review the changed code.** Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

In particular for this change: every place that builds or shows the crew-rest message for a previous commitment (the
red breach, the amber "Tight turning — crew rest", the previous-week Monday, the forward trace on the day before, the
next-week preview, the ALL AVAIL reasons, the published face — `LIVE_ON_FACE`), and whether `prevFlyNoLd` is set,
reset and read on every path that sets `prevFlyEnd`/`prevFlyLd` (flights, standby lines that fly, SC shifts, duty
inputs, the week before, a published neighbour); every reader of `WCODE` names; any other place a borrowed take-off is
written as a "landing" (titles, short reasons, the Logic page's explanations, Insights).

**What is NOT a finding (owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that will
be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when the
code is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly". If
the app would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it. Also not
a finding: anything about a scheduler who is not an admin (D785) — a scheduler is always an admin.

**What to hand back** — one report, in plain text, saved where your run's instructions say:
- each finding: the concrete failure (setup → action → what the screen shows), its cause (file and line), whether it is
  NEW in this change or older (compare with `main`'s code in the patch's minus lines), and **exact, step-by-step fix
  instructions** — not a direction;
- **explicit negatives:** every place you checked and found right ("I checked X and found nothing");
- you cannot run the app or the tests here: for any claim that needs a run, name the exact input (the day, the times, the
  people, the clicks) or the exact unit test you would write, and the host will run it. Write no file anywhere except
  your one report.
