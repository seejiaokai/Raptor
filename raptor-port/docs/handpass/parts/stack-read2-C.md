# Stack read, second pass — piece C: Insights' mission mix (Blue/Red)

Reader: Opus 5.5, 6 Oct 26, `claude/codex-stack-review` at `eb8fd4d6`, against `main` `de470db5`. Read only — nothing
built, run or served. Brief: `docs/superpowers/briefs/2026-10-06-codex-stack-read-pass2-brief.md`.

## 1. Findings

**F1 (low–medium) — a line with no callsign is named by its hidden row code in the Blue/Red question and in Undo.**
- Steps: Tracking On. Scheduler Board → "+ Line" (a new line comes up blank). Leave the callsign empty, type `DS-2` in
  Mission (or `DS FOR VL` in Remarks), leave the box. The question reads "**rmuv8bvw885wj10: Blue or Red?**". Press Red:
  the top bar's Undo reads "the mission role for rmuv8bvw885wj10 — Red", and its History line the same.
- Expected: the app's own word for such a line, "Line" (`engine/editlog.ts keyLabel`, `ui/changesmodel.ts:172`); never
  an internal code — the same class as F3 and W7 (D340).
- Code: `state/mission-roles.ts:89` `name:String(source.f.cs || rid)` (Codex, `4cfe81a1`) → the question's heading and
  aria-label (`ui/mission-role-offer.ts:124–125`), the command's detail → `undo/describe.ts:280–283`. The same fallback
  for a template copy: `state/changelines.ts:465` (`|| role.formationRid`). W7's fix hides it in the changes window only.
- `main`: no such feature.
- Fix: (1) `mission-roles.ts:89` → `name:String(source.f.cs||'').replace(/\s+/g,' ').trim()||'Line'`; (2)
  `changelines.ts:465` → fall back to `'Line'`; (3) red-first tests: a blank-callsign line with Mission `DS-2` — the
  question's text and `describeEntry` hold no `f.rid`.

**F2 (low) — the Choose / Change button is not put back while the caret is still in the Remarks box.**
- Steps: Tracking On. Click RU's Remarks (`RED AIR`) → "Choose mission role" → press it → press Red (or Later). The caret
  is still in RU's Remarks and nothing is offered; a mis-press can be corrected only by clicking out and back in. The
  same after any other change on the day made with the caret left in the box (a puck dragged).
- Expected: D527, D529 — the button shows while a relevant Remarks box is being edited.
- Code: a question opening removes its formation's button (`mission-role-offer.ts:122`); after an answer or Later only
  `clearAsking()` runs and `returnCaret` re-focuses a box that already has focus, so no focus event follows (`:142–146`);
  a stale button is only removed (`:157`). Codex's build did the same (`clear()`), so no walk compared it.
- `main`: no such feature.
- Fix: (1) add `offerForFocus()` — take `document.activeElement.closest('[data-txt],[data-bfld],[data-role-remarks]')`,
  and if tracking is On, `canEditSched()` and `focusedTarget(el)` gives a target, `show(t,false,el)`; (2) call it after
  `returnCaret` in the Later and answered branches, and after `clearOffered()` at `:157`; (3) red-first mounted test:
  Choose → Red with focus kept → a "Change mission role" button under the same formation.

**F3 (record, not code) — the first pass's Lead 5 is filed nowhere.** "A line can never be put back to 'not chosen' once
the sign-in ends" is row C-D5 (UNWALKED), has no W-number, is not in §12's questions and not in `OUTSTANDING.md`
(searched "not chosen", `[ROLE-`: only `[ROLE-QUESTION-SECOND]`, `[ROLE-QUESTION-WEEK-DAY]`). File it as a question
for him (recommended: leave as built, D527 offers a correction only).

## 2. A — absences

- C-1a7 / C-1b8 (week, look at the latest published version): sound — the look is plain text (`html.ts` `ted` with
  edit off: no `data-txt`), and `editFacts` refuses a day under a look (`offer.ts:49`). The Board's look is the door.
- C-1a10 (next-week peek): sound — same builder, edit off; `anchor()` matches row id and day, and a peek line's id is
  another week's.
- C-1a12 (CSV): sound — twenty files reference the feature; none is an export or print file.
- C-1a14 (gold dots / bubble): sound — the answer's line has no key, so it is in no dot's story; the window draws it
  "still" (`ChangesWindow.tsx:113`).
- C-1a18 (wave, duty templates): sound — a wave-template pick is left out of the question's trigger on purpose
  (`offer.ts:214` names `data-wmkind`, not `data-wmtpl`; test MIX5); the new line has the button.
- C-1a21, C-1a24: sound — none imports the feature.
- **C-1b5 (Board in OIL Earn mode): the first pass's "YES by reading" is wrong — NO, because the mode disables every
  text box (`board.ts:89` `stoRO`), so no button can be raised.** A question opened before entering the mode can still
  be answered where the line shows its Area strip — harmless.
- C-1c3: sound — one caller of the switch (`LogicPage.tsx:209`). C-1c4: sound — `engine/rules.ts` never names it.
- C-1e18–20: other apps' windows, unchanged; not read further.
- C-D5: finding 3.
- Thin rows: C-D6 (the admin's member view) — no control without `canEditSched()` (`mission-roles.ts:98`); C-D10 — a
  published day is refused on `pickDayTpl`'s first line (`board.ts:661`); C-1c2 — a read-only span
  (`LogicPage.tsx:210`); Undo from another week — the answer names its week and day (`undo/derive.ts:26`,
  `undo-wire.ts:72`).
- Not in the roll-call at all: the control's own NAME for the formation — finding 1. Callers searched again
  (`computeInsights` 1, `setMissionTracking` 1, `applyDayTpl` 1, `setInsights` 5 — all in 1d): no other renderer or door.

## 3. B — siblings

- A hidden code shown, or a line filed under another name (W7, F3): another instance — finding 1. Readers of the
  history line's "man" field searched (`.sub`): `changesmodel.ts`, `histbubble.ts` (both fixed), `pendlist.ts:214`
  (compares with a person's id) — none.
- A record keyed by something that does not persist (W8): searched what the answer's id and a template's seeds are
  built from (week, date, row id, wording; a position inside the template's own stored copy, re-checked against the
  wording) — none.
- A handler that returns before it looks (W9, RF4): another instance — finding 2.
- A check that asks one spelling and misses another (W10's guard, W11, RF3): searched the offer's selectors (`fr:` and
  `ff:…msn`, both `data-txt` and `data-bfld`) and the cue matcher against `docs/remarks-vocabulary.md` — none.
- A redraw held while the caret is in text (W15): the piece draws nothing on the line (D519); what is owed while the
  caret stays is the button — finding 2. None else.
- A figure from not-a-number (W4, RF1): flying-load bars divide by at least 1. The work-hours bar's width is NaN% only
  when the week's longest span is 0 minutes (`Modals.tsx:97,103`) — a width, never text; the same on `main`. Not filed.
- A wording changed in some places only (W6): searched "mission role" / "Blue/Red" — consistent.

## 4. C — the fixes in this piece

- `ui/mission-role-offer.ts` (W9, RF3, RF4): sound — still one question at most (D523); the reset clears both slots;
  the Tab route and the "caret in text" test key on `[data-role-ui]`, which both nodes carry; the published door is
  untouched. Leaves finding 2.
- `ui/changesmodel.ts`, `ui/histbubble.ts` (W7): sound — the answer joins its formation's item by the same id its seats
  use (`:150` / `:178`). Its heading reads the WORKING copy's callsign and mission even for an answer given on the
  published wording; the line's own words say "Published · ALn".
- `engine/weeks-data.ts`, `state/store.ts` (W8): sound — only the two built-in weeks; a template's copies still take
  random ids, so the copy's collision refusal (`mission-roles.ts:129`) cannot trip.
- `engine/slots.ts` (W11): sound — it broke the offer's "stored ≠ typed, so a save follows"; RF3 mended it (`offer.ts:100`).
- `engine/validate.ts` (W4, RF1): sound — Work hours drop an unfinished flying line; Flying load still counts it (W17).
- `ui/LogicPage.tsx`, `ui/Shell.tsx` (W2): sound — the switch is not a rule and is counted in neither figure.
- `ui/outside.ts`, the four confirmation windows, `ui/pops.ts`: Opus's surfaces — the Insights window counts as a window.
- `ui/board.ts`, `ui/html.ts`, `engine/editlog.ts`, `undo/describe.ts`: the reporting box's name only.

## 5. Not read, and how sure

Test bodies (names only); the other pieces' reports; `issuedWorld`, the publish engine and the command layer's insides
(relied on walks R-01, P3-01); Leave War and Tracker windows. Finding 1: sure — three lines read end to end. Finding 2:
by reading only; one walk step with a mouse settles it, and an iPhone may differ if a tap moves focus.
