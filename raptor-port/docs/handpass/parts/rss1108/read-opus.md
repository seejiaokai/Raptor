# The fresh, blind Opus code read — React Doctor on the shell, the state and the windows (8 Nov 26)

Brief: `docs/superpowers/briefs/2026-11-08-rd-shell-state-read-brief.md` (main part, items 1–6). A fresh Opus 5.5 reader,
blind to Astra's and the security read. Read of `git diff 7744e66db 969042adb -- raptor-port/src`. Saved as it came back.

No high or medium findings. I found nothing that changes what the app does for a person: every Set gives the same answers as the list it replaced, every importer of the three moved pieces points at the new file, and Retry still sends the same save again. What I did find is all low: one picture script left broken by the move, missing records, two comments that are now wrong, and one change to what a screen reader says that the commit message does not list.

FINDINGS

Low 1 — A walk script still calls the moved save-source function at its old home. `raptor-port/scripts/handpass/lw-m4-bars.mjs:61` runs `mod(p, '/src/ui/SaveStatus.tsx', "m.setSaveStatusSource({ status: 'failed', onStatus: () => {} })")`.
- Failure: `SaveStatus.tsx` no longer exports `setSaveStatusSource`, so a re-run throws "m.setSaveStatusSource is not a function" at step 6 (the failed-save band) on the phone size. The script then dies before the desktop size; the "6-not-saved" picture and every desktop picture are never taken.
- Cause: the move to `ui/savestatus-source.ts` re-pointed `main.tsx` and the two tests but not this dev-server script. It is the only importer outside `src` (I searched `src`, `e2e`, `probes` and `scripts`).
- Fix: change the path to `'/src/ui/savestatus-source.ts'`. It is the same module the app loads, so the band still appears. It is a one-off picture script from 27 Oct 26, hence low.

Low 2 — The three new files have no row in `raptor-port/docs/file-map.md`: `ui/insights-html.ts`, `ui/hlchips-model.ts` and `ui/savestatus-source.ts`.
- Failure: the next chat looking for where the Insights body, the chip lists or the save indicator's source live is not sent to these files. The rule is that a new file gets its file-map row in the same change (doc-structure.md).
- Cause: commit `969042adb` touches no document, and `file-map.md` is not changed in the working tree.
- Fix: add the three rows. On the `hlchips.tsx` row (file-map line 798), say the lists now live in `hlchips-model.ts`. If the closing records commit already plans this, it is covered.

Low 3 — The two week search boxes now carry `aria-label="Search by name or callsign"` (`ui/Shell.tsx:565` `#searchV` and `:643` `#searchE`). The commit message does not list this.
- Failure: what a screen reader says for these two boxes changes from their placeholder, "name / callsign", to "Search by name or callsign". Nothing visible changes, and no test or walk finds them by that name (I checked `getByRole`, `getByLabel` and accessible-name assertions).
- Cause: the label was added so the kept-placeholder reason ("a screen reader reads its name from aria-label") would be true. It matches the board's own `#searchB` (`SchedBoard.tsx:585`), so keeping it is right.
- Fix: keep it, and name it in the closing record and evidence as a deliberate change.
- The same applies to Help's "What happened" box: its spoken name moves from its placeholder to "What happened", a side effect of the intended label gesture. The Category list keeps its existing `aria-label`, "What the report is about", which wins over the new label.

Low 4 — A keep reason that is false of its line: `raptor-port/src/state/sched-commit.ts:525`.
- The comment says "each day's own short list of people, read once for one man". The local `idsOf` there (line 512) returns every row id and note id of a whole day, and `id` is a row id, not a person.
- Failure: none in the app. The keep is still justified, because each list is built fresh, searched once, and only for an id found on two days. The false reason misleads the next reader about what this check guards.
- Fix: `// eslint-disable-next-line react-doctor/js-set-map-lookups -- each day's own list of row ids, made fresh and searched once for one id (only for an id found on two days): a Set built for it would be read once too`

Low 5 — A stale pointer in a file this change touched: `raptor-port/src/ui/Shell.tsx:88` still says "The HL_CHIPS lists moved to ui/hlchips.tsx (23 Aug 26)". The lists now live in `ui/hlchips-model.ts`.
- Fix: append "and on 8 Nov 26 to ui/hlchips-model.ts".

Low 6, for the security reader — `perms.ts` `postingPassViolation`, line ~1060: `new Set(fields)`. Item 1 asks whether a list can ever be something other than an array, and here it can.
- `passOutcomeOf` returns any string `poOutcome`. So `PASS_FIELDS[outcome]` can be a function or `Object.prototype` when the outcome is "toString", "constructor" or "__proto__".
- Before this change, `fields.includes(k)` threw only once a field actually differed. Now `new Set(fields)` throws at once, even when no field differs. In that case the old code went on to the marked-fields check and could return null.
- This is reachable only through a forged posting record on the app's own posting pass. A fix would be `const fields = outcome && Object.hasOwn(PASS_FIELDS, outcome) ? PASS_FIELDS[outcome] : undefined`.

Not a finding, but the brief asked for this kind: `raptor-port/src/storage/reset.ts:93`'s reason, "one removal at a time, each made durable before the next", states an order nothing needs. The removals are independent, and only "all done before the check" matters. The browser backend's `remove` is a synchronous storage call, and the memory backend's is safe to run at the same time. There is no failure, since it is a one-time reset of a few keys. The honest wording would be: "a one-time reset of a handful of keys; all are removed before the check, and the first failure stops it".

WHAT I CHECKED AND FOUND CLEAN, ITEM BY ITEM

1. Sets. A Set's `has` compares exactly as an array's `includes` does, so numbers against strings and NaN behave the same. For each site I opened the function to see where the list comes from:
- `changelines` (both `inputLines`, and `warInputLines`' `holds` and `isFresh`) and `undo/describe`: string arrays from `.map(String)` or sorted day lists, never changed after.
- `notices.noticePass`: `was` and `is` are fresh string arrays from `ids()`; `tell` only adds to the notices list.
- `noticeseen`: `cur.ids` is always an array of strings (`readSeen` and `write` see to it).
- `flyplan-model.only`: called only with literal arrays.
- `fold.buildFoldGroups`: `c.collections` is a typed array, built before `convert` runs, and no converter changes it.
- `undo/timeline.missingStores`: the `seen` Set mirrors `out`.
- `plan.addPuckPeople`: `idsOf` returns the live `p.ids` array; `on.add` follows each `push`, including duplicates in `personIds` and the case where the same array is passed in. Blank gaps don't matter because `pid` must be non-empty.
- `oilwait.oilBarAgain`: `have.add` follows each push, and the case where `w.places` is the very same array as `OILWAIT.places` behaves as before.
- `perms.stampForged`: `halvesOfCode` always returns a string array.
- Only `PASS_FIELDS` can be a non-array (Low 6).

2. The three moves. Every importer is re-pointed: the two Insights tests and `Modals.tsx`; `hlchips.tsx`, `InputsCal.tsx` and `hlfold.test`; `main.tsx`, `SaveStatus.test` and `accounts-ui.test`. Nothing imported `HL_CATS`. `SaveBand`, `useSaveFailed` and `SaveStatus` are still exported from `SaveStatus.tsx` for their seven users.
- No value is copied at load: `INSIGHTS_ALL` is a live binding from `pops`, and `read`, `readFailed` and `retrySaves` read `source` on each call.
- No new import cycle can read anything early: `savestatus-source` has no runtime imports, `hlchips-model` has none, and `insights-html` only declares a function.
- Every indicator and band subscribes through the one `subscribe`/`read` pair that `main.tsx`'s `setSaveStatusSource(postman)` feeds.
- Retry calls `source?.flush()` with no arguments, as before; the click event is ignored.
- `SaveStatus.test.tsx` run: 3 of 3 pass.
- The only miss outside `src` is Low 1.

3. The shades and the ✕ buttons.
- None of the 11 shades had a role, a name, `aria-*` attributes or a tab stop before. Focus goes to the inner box (`useSheetFocus`) and Escape is wired on the box, so "presentation" removes nothing.
- No app code, test or stylesheet selects on these shades' roles. The `[role="dialog"]` checks in `schedule-tab.ts` and `Matrix.tsx` are unaffected.
- No test or walk finds a ✕ by the name "✕". The walk helpers that search `#schedBoard` for a button named "Close" cannot match these windows, because `DayTpl` and `Drafts` mount beside the board, not inside it.
- `DocViewer` and `OilConfirm` already had `aria-label="Close"`.
- Three old break-test lists now point at text that changed (`2026-10-14-oil-uncancel-load.json` #31, `lw-m4.json` #23, `lw-rr1031.json` #12). By `breaks.mjs`'s own rule a stale anchor is skipped and reported, never silent, so these lists are no longer re-runnable proof until re-pointed.

4. `TalonMark`: the same markup, byte for byte, as both inline copies. It is still a direct child of the top bar, so the bar's styling still applies.

5. Keep reasons:
- The JSON copies in `holderbase`, `mission-roles`, `people-settings-commit`, `roster-restore`, `sched-commit` `cw`, `probe-bridge`, `command/util` and the memory store: true. Each copies an image that is saved or compared as JSON.
- `fold`'s ordered await: true (the stamp is written last).
- The per-record list keeps in `notices` `splitFrom`, `person-delete`, `oilmode` (twice) and `view.personFlagDays`: true. `view`'s "one or two men" understates some warnings, but the list is still built per warning and searched once.
- `mission-role-offer` (the live list changes during the loop) and `toast` (`said` is rewritten in place): true.
- The page-tab links, the PDF frame (a blob address of a stored, type-checked PDF or image), the export link, `Drawn`'s fixed drawings from `glyphs.ts`, `seeds`' fixed text and the index keys in `MedClash` and `Upchit` (lists worked out once when the sheet opens): true.
- The two exceptions are Low 4 and the `reset.ts` note.

6. Re-pointed comments:
- `drag.ts`: `onInputRow`, `rowMove` and `rowPut` exist in `reqdoor.ts`, and the comments match what the code does today.
- `InputWindow.tsx`: the code asks only the input's one record (`oilRows = [r]`), and the "Not answered yet" line names nobody.
- `board.ts`: the heading "### Week navigation & cross-week continuity" and its bullet about the phone board's one-row top bar exist in `.claude/rules/decisions/scheduler.md`.
- `inputedit.tsx`: `.claude/rules/seams/leave-war.md` has its "## Architecture" heading.
- D734, D753, D755, D756 and D762 say what the comments cite.

Help's labels: `htmlFor` points at the right ids (`bugCat`, `bugText`), so a press on either label puts the keys in its field.
