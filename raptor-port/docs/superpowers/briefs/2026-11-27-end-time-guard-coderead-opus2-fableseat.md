# END-TIME-GUARD — fresh, blind Opus code read (Fable's seat, D2819; owed to Fable)

Branch `claude/end-time-guard-202`, `C:/Users/User/projects/Raptor-endtime`, diff `origin/main...HEAD` (7 commits, 23 files).
Read against D2852, D2612, D2613, D2734, D2853, D2854, D2855, D2790, D2611 (full rows) and the plan's §R1–R6.
Ran: `npx vitest run src/engine/timegaps.test.ts src/ui/timeguard-doors.test.tsx`: 58 passed, 5 todo. No build, no browser run, no full suite.

## Routes checked and found closed

- **Publish day.** The only caller of `commitSetDayApproved` is the day head's `data-beak` on the week and the board (`ui/interactions.ts`). The guard runs before the command, so nothing is minted. It sits before the engine's signature check, as D2855 E1 asks.
- **Publish AL.** The callers are the day head's `data-alpub` and the Amendments panel (`ui/ALPanel.tsx`). Both reach `commitPublishALDay`, and the guard is in that command, so the panel is covered too, even though its button stays disabled while unsigned (R6, today's behaviour). A correction reissue is guarded through `SCHED.correcting`.
- **Sign-off.** The only writer of `setSign` is `ui/oilsign.ts writeSign`.
  - It is reached from the box (`signPick`, where the time is checked first, as D2855 E2 asks) and from the OIL list's Save and Later (where `writeSign` is the backstop).
  - The box's own list is disabled and out of the tab order. Its label takes the press by mouse or by Enter/Space (`routeClick` / `routeOpenKey`); Tab is not caught.
  - A signature is bound to the day's content (`publish.ts signBoundOk`). Emptying a time therefore drops all four names. Undo, Redo, plan switches and restores cannot bring back a valid signature over a gapped day, because the binding breaks.
- **Undo/Redo of publish (Q15), the Amendments panel (R6), board tap (Q19), R1/R2/R7/R8/Q16/Q17/Q20/Q21/Q-W3.** Each keeps today's behaviour and is pinned by an `it.todo`, as D2611 requires.
- **Layering.** `state/` imports nothing from `ui/`. The rule (`engine/timegaps.ts`) imports only `engine/`. The screens hear of a refusal through a hook.
- **View-only Sched.** The paint looks only at `#eWeek` (Edit Schedule) and `#schedBoard`. The week's box carries `data-txt` only when it can be typed in (`ted()`). The sign-off line and the Publish buttons are drawn only under `ed`.
- **Demo data.** `engine/data.ts` and `engine/week2.ts` change only `end` values (seven rows plus one). `testing/refwin.ts` copies `end` for programme and ground rows by position, as it already copied `prog` and `who`.

## Findings

### F1 (medium) — a row from an all-day input that the day holds as "kept" is refused for missing times. This is a builder's reading, not a ruling, and it is not in §R5

- **When it happens.** A member files an all-day input (Training, leave, …) on Thursday. It lands as a Ground Programme row with the member on it and no times, and Thursday is published. Later the request is deleted, moved off the day or filed under Unavailable. The scheduler then loads Thursday's published version back (D363: "loading an older issued version puts back every row that version had"), or swaps in a saved plan carrying the row. `engine/drafts.ts markKept` (line ~159) brings the row back with `kept = true`.
- **What goes wrong.**
  - `engine/timegaps.ts fromAllDayInput` returns false for any row with `r.kept` (`if (!r || !r.src || r.kept) return false`).
  - So the row counts as a typed row with someone on it and both boxes empty: two missing times, one item.
  - Thursday's sign-off line reads "1 item missing a time · 4 to sign", and both time boxes of the leave row are outlined.
  - Every sign-off box, Publish day and Publish AL is refused until the scheduler types made-up hours into a leave row, or deletes it.
  - Today nothing refuses this day.
- **Why it is a defect.**
  - D2852 leaves out "a row from an input with All day ticked". The kept row is exactly such a row.
  - The comment's "a row the input left behind (`kept`) is the scheduler's own typed row" is the builder's reading. D2611 says a reading is never built on.
  - The plan's own method (§R5: what no ruling settles keeps today's behaviour, never refused) is not followed, and the case is not in the question list.
  - The test `timegaps.test.ts` "a row an input left behind (kept) is a typed row" pins the reading.
- **Cause.** `engine/timegaps.ts`, the `fromAllDayInput` arrow: the `|| r.kept` clause. A gone request (`inputOnAny` → null) also reads as "not all day".
- **Fix.**
  - Leave out a `src` row whose input is all day, whether or not the row is kept. Treat a `src` row whose input is gone and whose times are both empty as left out too, which is today's behaviour.
  - Add the case to §R5 as a question for him, with a worked example.
  - Change the pinned test into an `it.todo` naming that question.
- **Failing test.** In `engine/timegaps.test.ts`:
  ```ts
  INPUTS.push({ iid: 'tg-3', person: 'dj', date: 'Jul 13', allday: true, type: 'Training', remarks: '' })
  expect(G(ground({ who: 'dj', str: '', end: '', src: 'tg-3', kept: true })).items).toBe(0)
  expect(G(ground({ who: 'dj', str: '', end: '', src: 'gone-iid', kept: true })).items).toBe(0)
  ```
  Also a door test in `ui/timeguard-doors.test.tsx`: publish Thursday with an all-day input's row on it, delete the input, load the Original back, then pick a CUR CK name. Expect it to be written, with no "Blocked:" note.

### F2 (low) — red follows a row's position, not the row, so "staying red until the time is typed" (D2853) fails once rows move

- **When it happens.** Thursday has two OFT rows. Row 0 is complete. Row 1 has a crew and a start, and its end is empty.
  1. The scheduler presses Publish day. It is refused, and row 1's END box turns red. `TIME_RED` holds `sr:3.oft.1.end`.
  2. He deletes row 0 (`board.ts` `srdel` splices the array and shifts the change marks' keys with `shiftKeys`), or presses the section's Auto sort, or drags the rows into another order.
  3. Row 1 is now index 0. Its key `sr:3.oft.0.end` is not in the red set, so its END box goes back to grey although its time was never typed.
  4. At the next paint, the stale `sr:3.oft.1.end` is dropped from the set.
- **The reverse also happens.** A box that was red (missing at the press) can shift into another red key. Then a row's red can land on a different row's box.
- **Cause.**
  - `ui/timegap-paint.ts markRefused` stores the positional box keys from `engine/timegaps.ts` (`ff:di.gi.li`, `sr:di.kind.ri`, `gr:di.ri`, `ap:di.ri`, `dr:di.wi.ri`).
  - Nothing re-keys `TIME_RED` when rows are spliced, sorted or dragged, unlike the change marks, which `shiftKeys` moves.
- **Fix.** Key the red set by the row's id and the field (`rid` exists on every row once `ensureRowIds` has run, and `f.rid` on a formation). For example, `dayTimeGaps` returns `{key, rowId, field}` per box. `markRefused` stores `rowId.field`, and the paint maps each box's key to its row's id before looking it up.
- **Failing test.** In `ui/timeguard-screens.test.tsx`:
  1. Empty Thursday's second ground row's END.
  2. Press Publish day, and assert the box has `.tg-red`.
  3. Delete the first ground row.
  4. Assert the same row's END box, now at index 0, still has `.tg-red`. Today it reads grey.

### F3 (low) — a press on a refusing sign-off box skips the protected-week exemption that the other sign paths keep

- **When it happens.** A day in a protected (read-only quarantine) week has a gap, and the scheduler presses a sign-off box.
- **What goes wrong.** `routeClick` and `routeOpenKey` (`ui/interactions.ts`, the two `.sgn.tg-block` blocks) call `refuseForTime` directly. The note says "Blocked: … missing a time …" instead of the quarantine's own first word.
- **Why it is inconsistent.** `signPick`, `writeSign` and both publish commands check `!protectedWeek()` first, and their comments say "the quarantine keeps its own first word".
- **Cause.** The guard is missing in the two key and click branches. `html.ts signoffHTML` also locks the box (`tg-block`) whatever the week's state.
- **Fix.** Give both branches the same `!protectedWeek()` condition (or route them through `signPick`'s check), and in `signoffHTML` draw `tg-block` only when the week is not protected.
- **Failing test.** Make the week protected (as the quarantine tests do), empty a time, and click the CUR CK box. Expect the quarantine note, not the time note.

### Not built, though ruled (recorded in the build's own notes)

- D2854's tap on Edit Schedule's count line, "going to each empty box in turn", is not built. The plan calls it "a later step", and there is an `it.todo`. This is a ruled behaviour the branch does not yet have, not a defect in what is built. It should stay on the list before "merge live".

## Checked and not a finding

- **The rule against the rulings.** Each of these follows D2852 and D2790:
  - "Someone" is read from trimmed entries.
  - ALL and ALL AVAIL count.
  - A typed callsign counts.
  - A desk's role alone does not count.
  - A row with a start needs its end even with nobody on it.
  - An empty start counts as an empty end does.
  - Cancelled and information-only items are left out.
  - The AMT block's BRIEF and DEBRIEF are left out while nobody is on them.
  - A stored TBD, in any case, counts as empty.
  - A standby line gets the outline only and no new warning line.
  - The flying-line keys match the week (`fp`) and the board (`board.ts` inline TO/LD). The sim and ground keys use the real array index on both surfaces.
- **Words.** The D2854 wording is in one place (`state/timeguard.ts`). The AL named is the next sequence, and the one-item form is used. The 'blocked' toast face exists and does not add a second "Blocked:".
- **Grey and red, and View-only.**
  - A box is grey from the moment it is missing.
  - Red comes only from a refused press, and is keyed by squadron, date and plan.
  - There is no outline on View-only Sched, the next-week peek, a preview (`.preview`, `.pv-frozen`) or a disabled board input.
  - R3 is built "grey until the next refused press". That is less than the recommended red, so it never shows red where today shows nothing, and the `it.todo` names it.
- **Cost on the repaint path.**
  - `paintTimeGaps` runs inside every `refreshHighlights`. It walks every `#eWeek [data-txt]` and board `input[data-bfld]`, roughly 1–2k elements: one regex and two `classList.toggle` each. The rule is memoised per day per pass.
  - `dayStatHTML` and `signoffHTML` each add one `timeGapsOf` per day per render.
  - This is small beside the day-string build, but unmeasured on the slow machine. See the tidiness note for the scoped form.

## Tidiness note (filed, not fixed)

- The sign-box refusal block is copied word for word in `routeClick` and `routeOpenKey`. One helper would serve both, and would carry F3's fix once.
- `timeGapsOf(di)` runs up to three times per day per paint (day head, sign-off line, paint). `publish.ts passMemo` would make it once.
- The paint could visit only boxes in the gap list plus elements already carrying `.tg-miss`, instead of every text box.
- `isBrief` and `isDebrief` duplicate `events.ts isB` / `isD`, on purpose until Q16 is answered. Share one once he answers.
- `TIME_RED` lives in `ui/pops.ts` but is owned by `ui/timegap-paint.ts`. `resetTimeRed` duplicates its `POPS_RESET` entry.
- The paint deletes entries from `TIME_RED` during a draw pass: a write on a read path.
- `lockAt` is worked out for every day head, even when the day is signed.
- The grey and red CSS rules are repeated for `#eWeek` and `#schedBoard`.
- `oilsign.ts`'s comment says "taking a name OUT is never refused". While a time is missing, the screen locks the box, so a stale name can then only leave by the Clear button.
- `TIME_REFUSED.message` ("a time is missing") is never shown.
- The label with `role="button"` wraps a (disabled) select, so one control sits inside another.

## Verdict

The guard holds on every publish and sign route I could find, and nothing it builds goes against today's behaviour, with one exception: a kept all-day input row is refused on a builder's reading (F1). Fix F1, and decide F2 and F3, before "merge live".
