# Claude's small check of the two Codex builds — what it found, and the fixes Codex is to make (3 Oct 26)

**What this is.** D508: before the reset, Opus 5.5 planned a small targeted check and Sonnet 5.5 did the reading;
the host (Opus) reproduced or confirmed each find. It is an EARLY SIGNAL, not a bug check. Not done, and still
owed after the reset (Monday 5 Oct 26, 19:00) before any "merge live": the walk of the running app, the blind
walker trial (D480), the second independent reads, the working-guide reads (D70).

**Checked:** `codex/discard-marks-remove` at `3e097025` (app `91b9dff1`, base `d9492f1e`); `codex/rally-workspan`
app commit `786d2b2c` (base `9cc5d4ff`).
**Gates re-run by the host on the Rally build, under the PC lock, 3 Oct 26:** unit 7613/7613 (479 files) · build ·
tfin 728/0 · e2e 518 passed, 49 skipped · smoke 445/0 · rulecheck · docsize — all PASS.
**Readers:** one Sonnet 5.5 code read per build (Rally: the roll-call of every reader of the reporting time, each
ruling D497–D507, seven named suspicions run as throwaway tests; Discard: every changed line, a leftovers roll-call,
eight of the builder's pictures opened). No walk of the running app was made by Claude.

## Rally — what was found

| # | Find | Status |
|---|---|---|
| R1 | A fresh demo week cannot be published Mon–Thu: 13 `REPORT_ORDER` warnings in week 1 (Mon 4, Tue 1, Wed 4, Thu 4), 5 in week 2. A blank brief is taken as take-off less `VCONF.briefLead` (140 min) by `reporting.ts flightBrief()`, and the seed's in-times sit about 40 min before take-off. The builder's evidence sheet records that its tests failed on this and the test fixtures were adapted; the owner was not told. | Confirmed by the host in the code and in the builder's own sheet. The RULE is right (owner, 3 Oct 26: the suggested brief is the real brief in use) — the block is what changes: **D509** |
| R2 | The "+ In-time / Rally" button mints the wave's earliest TAKE-OFF as the in-time (`interactions.ts`, `waveInTime` fallback), which the order check then flags at once | Confirmed in the code |
| R3 | A previous-day reporting time prints with no day: the crew-rest message ("told to report 22:00 — only -1h00 rest"), the long-day note ("15h00, 22:00 → 13:00"), the board's wave header (`board.ts`, `hm24(inT)`), the leave-by / trace rows and the pre-drop message | Reader ran it; host confirmed the header and message templates |
| R4 | `docs/remarks-vocabulary.md` §The in-time lines was not touched: no RALLY, no RALLY AFTER IN TIME, no previous-day rule, no per-activity override (D505), no earliest-duplicate (D506); `docs/engine-rules.md`'s older grammar paragraph (about lines 187–199) and `report = in-time ?? step` (about line 287) are not marked superseded | Confirmed (no "Rally" in the vocabulary file) |
| R5 | "0900 RALLYING" reads as an in-time (a bare clock with no recognised word is the legacy unlabelled in-time) | Left as it is — the legacy rule (D500); note it in the vocabulary |

**Found correct (run, not only read):** every ruling D497–D507 is in the code; crew rest, work hours, Insights, the
availability bands, the available-crew panel and the pre-drop checks read the report through the one shared
resolver; tight turn, OIL and the busy windows do not, by ruling; the crew-rest map's zero or negative values reach
no reader that prints or misreads them; grammar traps (FL240, 1330Z, "RALLY PT 3", lowercase, a cancelled
formation, an SC wave, a callsign "IN") behave; a typo such as 19:00 for a 10:00 take-off gives an 18-hour long-day
note, not a negative figure; every publish door passed through the timing guard.
**Not proven:** SANS with a half-day filing and a previous-day report (the previous date's filing is not consulted);
hide and replay of the new warning on a published face; print / export of the new header; anything on screen.

**Late show (the owner asked):** `LATE SHOW` / `SHOW AT BRIEF` on a flying line only changes the crew-rest ring
(dashed while he can still make step, solid once he cannot). It does not read or affect the order check, and needs
no change.

## Rally — the fixes, exactly (Sol builds; a fresh Astra inspector reads; D496)

Work on `codex/rally-workspan`, first fast-forwarded to `origin/claude/codex-review-3-oct` (it carries D508, D509
and this file). Each fix: a test that is RED first, then the fix; `src/engine/` diffs are the behaviour change only.

**A. Nothing blocks publishing (D509 — narrows D502).**
1. `src/engine/publish.ts`: delete `publicationTimingOK` and its three calls (`setDayApproved`, `alIssue`,
   `publishALDay`) and the `if(!id)return;` it needed; restore `const {sign,count}=alIssue(di)`.
2. `src/state/sched-commit.ts`: drop the `publicationTimingOK` import, the `checkTiming` parameter of
   `commitPublish` and its call-site argument.
3. `src/engine/reporting.ts`: `REPORT_ORDER` stays severity `hard` in the warning list (validate.ts keeps
   `issue.blocking?'hard':'adv'`, or rename the field to `hard`); nothing reads it to refuse an action.
4. Keep, unchanged: the live explanation while editing (`ui/textedit.ts`), the warning's anchor, the two WCODE
   headings. The published copy freezes the warning like any other.
5. Tests: `state/rally-publish.test.ts` is rewritten to pin the NEW behaviour — first publish, AL and correcting
   reissue all SUCCEED with a wrong pair present, the warning is in the working list and in the issued copy, and
   no "Cannot publish" toast exists. Remove the toast text everywhere.
6. Documents in the same change: `docs/engine-rules.md` (the Rally section — no block), the behaviour register's
   RT6 (rewritten: publishing is never refused for timing), `docs/ui-contracts.md`, `docs/feature-impact.md`,
   `OUTSTANDING.md` `[RALLY-TIME]`.

**B. The message names the suggested brief.** In `reportingIssuesForWave`, when `parseHM(f.br)==null` the brief
stage's name is `suggested brief` ("VL: in-time 12:00 is later than suggested brief 10:20."). Pin both wordings.

**C. The demo week raises none of these.** Correct the in-time lines of the 13 week-1 and 5 week-2 seed formations
(`src/engine/data.ts` / `week2.ts`, wherever the seed lines live) so each in-time is 3 HOURS before its formation's
take-off (D510 — the same lead as the Logic default below); keep each line's words, change only its clock. `reference/` stays read-only. The parity tests
already feed identical reporting fixtures to both engines — extend that, do not loosen a comparison. If parity
cannot be kept without weakening an assertion, STOP and report; do not force it. Then a test: a fresh seed of both
weeks raises zero `REPORT_ORDER`. The test-only helper `src/testing/reporting-fixture.ts` should then be unneeded
for seed days — remove its use where it is, and say where it is not.

**D. The button fills in a time set in Logic (D510 — replaces "starts at the brief").** `interactions.ts` (the
"+ In-time / Rally" mint): when the wave has no resolved report, mint the EARLIEST take-off of its uncancelled
formations LESS `VCONF.reportLead` — the existing Logic setting "Nominal report before T/O", 180 minutes by
default. Add NO second setting. A result below 00:00 is the previous evening's clock (D503 reads it back as the
previous day). Retitle the setting in `RULE_SPEC` so the Logic page says what it now also does, e.g. "Nominal
report before T/O (also the time the + In-time / Rally button fills in)" — keep its key, range and default. Pin:
one formation, take-off 12:00 → the line reads `09:00H: IN TIME + WX/NOTAMS` and raises no warning; with the
setting changed to 120 → `10:00H`, and the order warning then names the suggested brief 09:40. Walk it in the
running app: change the setting on the Logic page, press the button, read the line.

**D2. The words the button fills in are a free-text Logic setting (D511).** Today the mint hard-codes
`IN TIME + WX/NOTAMS`. Add ONE text setting beside the report-lead setting on the Logic page — "Text the
+ In-time / Rally button fills in", default `IN TIME + WX/NOTAMS` — and mint `<hh:mm>H: <that text>`.
- It is a NEW KIND of setting: `VCONF` / `RULE_SPEC` hold numbers with a range. Do not force text through the
  number path; give it its own spec entry (a `text` kind with a length cap, about 60 characters) and its own
  input on the Logic page, saved and loaded by the SAME route as the other Logic settings (no new store, no new
  storage key outside that route), and included wherever those settings are reset, exported or undone.
- Trim it; an empty value falls back to the default; single line only (strip line breaks). It is user-entered:
  escape it wherever it is drawn (the Logic page AND the minted line go through the existing escaping).
- No special reading: the minted line is parsed exactly like a hand-typed one (`parseReportingLines`) — `RALLY`
  makes it a rally, unrecognised words leave it the legacy unlabelled in-time. A clock typed INSIDE the setting
  would come second on the line and is ignored (first clock wins, D501) — say so in the setting's hint.
- Something the app SAVES changed: update `docs/data-schema.md` and `docs/data-model.md` in the same change
  (D473), and `src/engine/schema.ts` if the settings record is declared there. Permissions: whoever may change
  Logic today — no new rule in `perms.ts`.
- Pins: default → `09:00H: IN TIME + WX/NOTAMS`; set to `RALLY` → `09:00H: RALLY` resolves as a rally; set to
  empty → the default; a value with `<b>` is drawn as text; the value survives a reload. Walk it in the running
  app at both widths: change the text on the Logic page, press the button, read the line, reload.
- This makes the batch touch SAVED DATA — the bug-check tier for the round is FULL (question 3).

**E. A previous-day time says so.** One shared helper (reporting.ts already has `stated()`): a value below 0
prints its clock with " (previous day)". Use it in: the crew-rest message's "told to report" and "his day starts"
parts and its leave-by; the long-day note's start; the pre-drop message; the trace row. The board and week wave
header prints "(prev day)" (short — the header is tight). Negative rest is never printed as "-1h00": say
"1h00 before his <day> duty ends". Pin each string. The header is a measured surface — run the geometry e2e.

**F. The documents.** Rewrite `docs/remarks-vocabulary.md` §The in-time lines for what is now true (IN TIME,
RALLY, RALLY AFTER IN TIME, callsign scope per activity — D505, earliest duplicate — D506, the previous-day rule —
D503, the two warnings, the unlabelled-clock rule and R5's "RALLYING" example, the Late Show row); mark the two
older `engine-rules.md` passages superseded with a pointer to the Rally section.

**Then:** the affected unit files between fixes; the full gates once, under the lock; a walk of the RUNNING app for
A–E at desktop and phone width with pictures opened (a fresh demo week publishes Mon–Thu; the warning shows and
names the suggested brief; the button; a previous-evening rally on the header, the warning list and the puck);
the evidence sheet `docs/handpass/2026-10-02-rally-workspan.md` gains a section for this round; a fresh
independent Astra read of the changed snapshot. Nothing merges; Claude's full check is owed after the reset.

## Discard — what was found

No fault that affects the app. Two leftovers, both reproduced by the host:
1. `src/state/sched-commit.ts:47` still imports `logAction`; its only user went with the "marks cleared" writer.
   **Fix:** delete the import (on `codex/discard-marks-remove`).
2. Six older walk scripts still look for the removed `#alDrop` button (`scripts/handpass/am/w1-s33-reorder.mjs`,
   `am/w1-s02-discard.mjs`, `am/hr-01-fixes.mjs`, `dp-walk.mjs`, `cr-a1-pub.mjs`, `dbrA-W1-c.mjs`). No gate runs
   them. **Fix:** a one-line comment at the head of each — retired with the button (D488) — or delete
   `w1-s02-discard.mjs`, whose whole subject is gone.

**Found correct:** no other door to the removed action; no hint or toast names it; the permission entry and the
undo wording are gone; the removed tests went with the feature and none was loosened (one small loss: the retired
"writes only those days" pin has no first-publication twin — not verified whether older tests cover it); eight of
the builder's pictures opened, each showing what the sheet claims. **For the owner to know, not a fault:** on a
never-published day an edit changed back by hand still counts as a change until the day is first published.
**Not done:** the tests were not run on this branch by Claude, and the app was not driven.
