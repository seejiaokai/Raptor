# The full review (D2235), area C — Fable's report (blind; copy at `424a4310c`)

Reader: Fable, a background helper of chat 123, blind to the other five readers and to the builder's report; brief
`2026-11-20-multi-sqn-b1-full-review-brief.md` with area C (the engine and the screens); its own exported copy of
`424a4310c` with `AREA.patch`; finished whole. Not yet reproduced by the host. The report as returned:

---

# Area C (the engine and the screens) — blind read, Fable

Copy at `424a4310c`. No file under `raptor-port/src` changed; five scratch proof tests written, run one file at a time, all deleted, with the temp folder. Every finding below was red in a test I ran.

**Standing fact that shapes the ranking.** In this build the only production caller of `switchUnit` is sign-in (`state/store.ts` line 459) — the "142 ▾" menu is not there. So the squadron in view always equals the signed-in person's own, and every "in view vs his own" mismatch is latent. What is reachable now is a move of squadron (`setHome`, from tomorrow) and sign-out.

## Findings, by consequence

### F1 — A leave that runs across a move is on no Inputs list of the squadron it now governs (medium)
- **Setup:** today Sun 12 Jul; master moves `bane` 142 → 149 (counts from Mon 13 Jul). `bane` has Leave 10–20 Jul.
- **Red:** `inputsFor('u149', '2026-07-14')` holds it (he is absent on 149's Tuesday), but `inputsFor('u149')` does not — "so 149 Inputs list shows it: expected false to be true".
- **What he sees:** 149's Inputs List and month bars (`InputsPage.tsx` rows, `InputsCal.tsx` `monthItems`) do not show it, while 149's schedule day and the calendar's day list (`dayEntries`, dated) do. 142's month shows a bar over 13–20 Jul whose days open empty.
- **Cause:** `engine/inputs.ts inputBelongs` with no date judges on the input's first day only. The commit gate was already changed (job 2, `multi-sqn-job2-inputs.test.ts`) to judge every day the input covers. Screen and gate now answer differently.
- **Fix:**
  1. In `inputBelongs`, when `at` is omitted, answer true if any named man's home is `unit` on the first day, the last day (`endDate`), or the day of any saved move between them. Reuse the gate's day list from job 2 rather than writing a second one.
  2. Leave the dated call as it is.
  3. Add the red test above to `state/units-roster.test.ts`.

### F2 — An ALL AVAIL / ALL commitment changes squadron when its filer is posted (medium)
- **Setup:** `bane` (142) files a Meeting for ALL AVAIL on 20 Jul; he is then moved to 149 from 13 Jul.
- **Red:** `inputBelongs(r, 'u149')` true — "not 149: expected true to be false".
- **Consequence:** the commitment leaves 142's schedule and Inputs, and lands on 149's 20 Jul, taking 149's free people.
- **Same cause, later:** a master filing one from another squadron's schedule (D2197, once the menu is built) would file it into his own squadron.
- **Cause:** a placeholder-only input has no squadron of its own; `inputBelongs` and `inputUnitOf` derive it from the filer's home on the input's date.
- **Fix:**
  1. At filing, stamp the record with the squadron it was filed in (`u`): `pickUnit` in `InputWindow.tsx`, and the demo seed's placeholder inputs.
  2. `inputBelongs` / `inputUnitOf` read `r.u` first for a placeholder-only input, and fall back to the filer only where there is none.
  3. Add `u` to the input row in `data-schema.md`.

### F3 — Lists with no day of their own are read on today, not on the day being worked (medium-low now; every posting once Transfer is built)
Same setup as F1. All red:
- `rosterIds()` (`engine/faceattrs.ts`) still holds `bane` for 142, while the crew list of Monday (`palette-html.ts rosOn`) does not. Monday's "free all day" count and the roster a published version keeps (`publish.ts` line 764, `snap.ros`, read by Insights' `issuedRoster`) count a man the crew list does not offer.
- `signPeople(false)` still offers him to sign 142's Monday.
- `pickRoster(false, 'u149')` does not offer him, so 149's admin cannot file his input for Tue 14 Jul from any picker, though the gate accepts that write (job 2's third test).
- **Cause:** `rosterOf(unit, iso = rosterToday())`. The default hides every caller that has a day and did not pass it.
- **Fix:**
  1. `rosterIds(iso?)` takes the day; `freezeWarn` and `rosterShown` pass `dayIso(CURWEEK, di)`.
  2. `signPeople` takes `di` and passes its day.
  3. `rosterOptions` / `archivedOptions` / `pickRoster` / `PeoplePick` take a date; `InputWindow` passes the draft's first day.
  4. Make `iso` a required argument of `rosterOf`, `onRosterOf`, `unitPeople`, so the compiler lists every remaining caller. Each then writes `rosterToday()` on purpose, or a day.

### F4 — Sign-out's reload can sign out the next person (low today, real at the database step)
- **Red:** `logOut()` with the last saves still being sent; the next person signs in before they finish; the reload runs — `["reload (signed in: yes)"]`.
- **Cause:** `ui/logout.ts`. The sign-in screen is drawn by `resetSession(null); notify()`, then `await flushSaves()`, then `if (!saveWaiting()) reloadPage()` with no session check. The owed-reload branch below it does check `!SESSION`.
- **Today:** the wait is milliseconds on a local store, so he would not hit it. On a network store it is as long as the save.
- **Fix:**
  1. After the `await`: `if (SESSION) return true`.
  2. Then the existing test.
  3. Keep the red test in `ui/logout.test.ts`.
  4. D2205's "sign-in waits for the last person's pending save" closes it from the other side when built.

### F5 — A stashed week read by its squadron-qualified key is read as the squadron in view (latent)
- **Red:** 142 in view; `stashPut('u149@27/07/2026', …)`; a 142 man's activity request on 28 Jul; `stashDays('u149@27/07/2026')` returns 149's week with 142's request row on it.
- **Cause:** `engine/weekstash.ts stashDays` strips the unit (`w = wkOf(v)`) before `viewOfWeek(w, …)`, which then lands for `unitOf(v) ?? UNIT`. `dayCurVerIn` / `daySnapIn` get the bare week too.
- **Reach:** no caller passes a qualified key to `stashDays` today (checked: `weekctx.ts`, `peek.ts`). The file's header promises that route to batch 3's readers.
- **Fix:** pass `qk(v)` to `viewOfWeek`, which already splits it for the year and the unit. Keep `wkOf(v)` for `weekBundle` dates only.

### F6 — The people/inputs guard cannot see a walk inside a template string (latent)
- **Red:** ``countIn('const h = `<ul>${Object.keys(PEOPLE).map(li).join("")}</ul>`', WALK)`` is 0.
- **Cause:** `testing/enumguard.ts bare` empties whole template strings, holes included. That is the style of `html.ts`, `board-html.ts`, `palette-html.ts`.
- **Checked:** I compared every source file's count with and without the string strip, for both lists — no walk is hidden today.
- **Fix:** in `bare`, keep the code of `${…}` holes (replace only the literal parts), and add the red case to both guard tests.

## Checked, nothing found
- **Speed:** with the home look-up on vs off — `inputsOn` 0.006 vs 0.003 ms, `rosterOf` 0.012 vs 0.010 ms, `validate()` 5.0 vs 5.6 ms, the crew list 1.2 vs 1.4 ms. No slow-down at the demo's size.
- **Typing another squadron's callsign into a seat:** no such door exists. Seats are filled from the crew list and the reassign pool, both `rosterOf(UNIT…)`.
- **Setting names (`hooks.ts storedKey`, `keys`):** no community key can be mistaken for a unit's (a unit id must be the whole text before the first `@`; `account:` and `seen:` hold a colon). Every `store.keys(prefix)` caller passes a whole prefix.
- **Change history (`editlog.ts`):** line ids are per page, not per squadron, so two squadrons cannot overwrite each other's lines. The trim and "Clear edit history" touch only the squadron in view. A line the giver may file nowhere is dropped, not misfiled.
- **`weekBundle`, `dayIso`, `boardland`, `weekctx` cache key:** read the date after the unit is split; 149's week has its own row ids.
- **Holidays form:** the "out of date" line is built only for a public holiday with a range. Shared-by-place holidays were left alone, as the brief says.
- **`multi-sqn-job2-inputs.test.ts`:** read as evidence of the gate's rule; not re-run.
- **Not read to the bottom:** `QualsPage.tsx` beyond its list, `InputsPage.tsx`'s reveal path (looks an input up by id across all squadrons), `ui/peek.ts`'s cache key (outside my files; keyed by bare week).

## The shape — where this area keeps breeding faults
1. **Two answers to "which squadron", chosen per call site.** `UNIT` (in view) and `myUnit()` (his own) are picked line by line across about 30 files.
   - One page mixes them: `InputsCal.tsx` reads inputs by `myUnit()` but the planning pucks, flying plan and settings (`store.get` → `storedKey(UNIT)`) of the unit in view.
   - `oilputback.ts` counts by `UNIT` and opens `OilDayList`, which lists by `myUnit()`.
   - `perms.ts membersFileOn` reads the unit in view's switch for a filing made in his own.
   - All invisible today because the two are always equal. The day the menu ships (step 5) and D2197 (a master's every page follows the pick, while `myUnit()` is always his home) each becomes a live fault.
   - **Simpler:** one `pageUnit(page)` in one file — schedule pages → the pick; Inputs/Quals/Medical/SANS → his own, or the pick for a master — and no screen names `UNIT` or `myUnit()` itself. Removes the mixed-page and "master sees his own squadron's page" class.
2. **Defaults that mean "today" and "in view".** `rosterOf(unit, iso = today)`, `inputsFor(unit, at?)`, `rosterOptions(unit = UNIT)`, `landRequests(…, unit = UNIT)`, a bare week meaning "in view" in the stash. Each default is right for most callers and silently wrong for the rest (F1, F3, F5). **Simpler:** required arguments; the bare-key convenience kept only at the scheduler's own edge.
3. **Whose-is-it derived at read, three ways.** An input's squadron is worked out from its people's homes (first day by the lists, the asked day by the schedule, every day by the gate), a history line's from `sub`/`key`/date with a three-step fallback (`editlog.ts push`, five fix notes on one statement), a placeholder's from its filer. **Simpler:** stamp the owning squadron on the record when it is written (inputs with no named man, history lines), and one shared "days an input covers, by squadron" function used by gate, lists and schedule. Removes F1, F2 and the gate-vs-screen split.
4. **The guards count spellings, not behaviour.** They passed while F1–F3 were true, and cannot see template holes (F6). A small behaviour test per reader — "a 149 man's record is absent from 142's X, on the day before, of and after a move" — is the check that would have caught these.
5. **`elog:` is the one unit record not stored under its unit** (a `u` field, filtered at load, excluded by name in `hooks.ts`). It works, but it is a second way of saying "this row is 149's", and every new reader of the history must remember the filter.

Rulings: none this session.
