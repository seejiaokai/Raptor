# Independent final code read

Not an all-clear. Against the requested snapshot `0b65979d` and baseline `a2d0853a`, I found four defects:

1. **High — an official post-in date is discarded on reload, which can silently add an ineligible man to OIL.**
2. **High — the new zero-length warning falsely says SC/AVALON/BB shifts still earn OIL when the money engine pays nothing.**
3. **Medium — the next-week peek is a missed renderer for the new zero-length mark.**
4. **Low — tapping the warning locates the box but does not visibly light it.**

The checkout advanced concurrently from `0b65979d` to `0901ef08` while I was reading. All findings and provenance below are against the immutable requested commit `0b65979d`, inspected with `git show` and baseline diffs. I made no file changes.

## Roll-call used for the read

| Area | Objects and production expectation |
|---|---|
| Ordinary flying | FCP/RCP named seats earn by default; ALL/ALL AVAIL are refused at drag, tap/arm, picker, and writer doors. OIL mode shows the item switch and person figure. Equal TO/LD is D49: it still earns but both time boxes must warn. |
| Standalone flying | SC MAIN earns by written shift; SC SPARE, AVALON and BB default off but offer a switch when measurable. Cockpit placeholders remain refused. Zero-length standalone shifts fall under D31, not D49. |
| Sims | AMT/OFT FCP, RCP, passenger and `more` seats accept placeholders, expand them, and default on. A full editable row must retain an empty seat as its add door. |
| Duty | Primary desk and extras accept/expand placeholders. Ordinary desks default on; AVALON/BB desks, including template-minted blocks, default off but remain switchable. |
| Programme | Ground and Common Programme primary/extras accept/expand placeholders and default on. Rows without usable times offer no switch and must say why. |
| Requests | Accepted request rows use the claim evidence path; placeholder name/extras membership freezes at publication. The separately filed `[OIL-REQ-NAMEBOX]` named-man defect is outside this change. |
| Renderers | Edit week, view week, live board, read-only/version board, and next-week peek must render the relevant sign. Only interactive surfaces should offer gestures. |
| Writers | Schedule placement goes through slot writers/commit paths; OIL item/person/blanket decisions go through `schedWrite`; member claims retain the member’s answer; posting windows persist through the Leave War store. |
| Readers | `oilSentOf` is the membership authority; `oilEvidenceOf` selects live versus issued evidence; count chips, crowd opening, OIL figures and publication comparison must read that same version. |
| Lasting consumers | Publication freezes `oilev`; only the issued snapshot reaches `desiredOilCells`/`creditFrom`; forward and reverse passes update generated cells; tracker, balance and clash views consume those cells. |
| Roles | Admin/scheduler controls the OIL mode and publication; members answer their own claims; issued counts remain readable without exposing edit controls. |
| Important orders | Place → decide → publish; publish → availability change → pending; publish → amend → reverse sweep; post-in/out → reload; full sim → add another body; warning tap while the named line is already visible. |

## 1. High — a post-in-only window is thrown away on reload

**Provenance:** confirmed-pre-existing. The defect is present unchanged in baseline `a2d0853a`. The branch’s new `setPeople` capture makes the full posting-window seam more important, while OIL placeholders make wrong squadron membership money-bearing.

At `0b65979d`, `[state/store.ts](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/state/store.ts)` `readPostOuts` (snapshot line 600) accepts a record only when `v.to` is a string:

```ts
typeof v.to !== 'string'
```

But `setPostIn` and `windowRecord` deliberately persist a valid joining window shaped like:

```ts
{ from: '2026-10-01', to: null }
```

The write succeeds; the next boot rejects it. There is also a connected restore rule in `setPeople` (snapshot line 1535): every missing person with any `postOuts` record is appended, although a PI-only record is not evidence that an otherwise-removed person is archived.

### Failure scenario

- **Setup:** Set a man’s official PI date to `2026-10-01`, leaving `to` null. Put ALL AVAIL on a Sunday before that date.
- **Action:** Reload, inspect the count, then publish or re-publish the day.
- **Expected:** The PI date survives. He remains outside the squadron before 1 October and receives no generated OIL for that day.
- **Observation disproving correctness:** After reload `person.from` is null; the chip count increases; `availableFor` includes him; or publication creates an FO/HO credit for him.

An already-issued day can instead acquire a phantom pending difference after reload, followed by an incorrect credit if the scheduler acknowledges it by re-issuing.

### Exact fix

1. In `readPostOuts`, replace the `typeof v.to === 'string'` requirement with independent endpoint validation:
   - `from` must be null or a valid stored date string.
   - `to` must be null or a valid stored date string.
   - At least one endpoint must be non-null.
   - Preserve the existing id and callsign checks.
2. If both endpoints exist, reject a stored window where `from > to`.
3. Build a validated `Person` copy instead of accepting the entire untrusted object by cast.
4. In `setPeople`, change the “projection no longer contains this person” restoration loop so it re-adds only an archived/post-out person—i.e. a record with `to`—not a PI-only person removed from Raptor’s roster.
5. Extend `[postout-persist.test.ts](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/postout-persist.test.ts)` with:
   - `setPostIn` only → reboot → `from` survives.
   - `availableFor` before the PI date excludes him both before and after reboot.
   - Set PI and PO, clear only PO, reboot → PI remains.
   - A projection arriving with only `from` is captured and survives reboot.
   - A PI-only record does not resurrect a person absent from the authoritative Raptor projection.
6. Extend the untrusted-storage block with both-null, malformed-endpoint and inverted-window cases.

## 2. High — D49’s message is applied to standalone shifts that do not earn

**Provenance:** confirmed-new. `fltNoLen`, `FLT_NO_LEN_SAYS`, and their renderer calls were added on this branch.

`[validate.ts](/C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:133)` defines `fltNoLen(f)` using only the formation. It cannot tell an ordinary sortie from an SC, AVALON or BB standalone shift. Every equal-time crewed formation therefore receives this sentence:

> takes off and lands at the same time … the day still earns from the report and debrief

That is correct only for D49’s ordinary sortie.

`dayOilWork` deliberately treats every standalone line as the exact written shift. Its zero-length window is rejected, so:

- SC MAIN earns nothing and has no capable item/switch.
- SC SPARE earns nothing.
- AVALON/BB earn nothing and have no switch, even though a measurable one would be switchable.
- There is no report/debrief padding on any standalone shift.

This directly contradicts D31 and the money engine.

### Failure scenario

- **Setup:** On a Saturday, create an SC MAIN with a named crew member and `10:00–10:00`.
- **Action:** Open the week or board, read the marked time boxes, enter OIL mode, and publish.
- **Expected:** The row states that it has no measurable shift and earns nothing until corrected; it offers no switch.
- **Observation disproving correctness:** Both boxes say it “still earns from the report and debrief,” while `oilCapableItems` omits the row and the issued Leave War receives no credit.

The same false assurance appears on equal-time AVALON and BB lines. This can silently withhold earned leave because the scheduler is explicitly told payment will occur.

### Exact fix

1. Replace `fltNoLen(f)` with a context-aware classification in `validate.ts`, for example:
   ```ts
   fltNoLen(wave, formation): 'sortie' | 'shift' | null
   ```
2. Return `sortie` only for a non-standalone flying line with equal readable times and real crew.
3. Return `shift` for an SC/AVALON/BB line with equal readable times and real crew.
4. Split the shared wording:
   - `sortie`: D49’s existing “still earns from report and debrief.”
   - `shift`: “starts and ends at the same time; there is no measurable shift, so nobody earns OIL until one time is corrected.”
5. Pass the wave into the predicate from:
   - `validateCore` in `validate.ts`
   - `dayHTMLBody` in `[html.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:1500)`
   - `boardHTMLBody` in `[board.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/board.ts:205)`
   - `peekFormation` once finding 3 is fixed.
6. Keep the advisory D49 code for ordinary sorties. Give the standalone case its own warning code or D31/OIL-no-measure message so it cannot inherit flight/report wording.
7. Add matrices to `engine/oilflighttimes.test.ts` and `ui/fltnolen-mark.test.tsx` covering:
   - Ordinary flight: warning says it still earns; credit and switch exist.
   - SC MAIN: warning says no measurable shift; no credit or switch.
   - SC SPARE: no credit or switch.
   - AVALON and BB: no credit or switch at zero length; measurable rows remain default-off and switchable.
   - Ordinary overnight lines remain valid.

## 3. Medium — the next-week peek is missing D49’s visible mark

**Provenance:** confirmed-new missing call site. `[peek.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/peek.ts)` is unchanged from baseline, while the branch added the D49 mark only to the live week and board renderers.

`peekFormation` owns a separate copy of flying-line markup because it renders a stashed/next week rather than live `DAYS`. Therefore changes in `html.ts` cannot reach it automatically.

### Failure scenario

- **Setup:** Put a crewed ordinary line with equal TO/LD into the week shown by the next-week peek.
- **Action:** Open that peek.
- **Expected:** Its TO and LD cells have the same advisory edge and explanatory title as the edit and view weeks.
- **Observation disproving correctness:** The line is byte-for-byte visually ordinary; no `.badtm` or explanatory title exists.

This is the least-shared renderer and the only surface that shows the next week in this form.

### Exact fix

1. In `peek.ts`, import the context-aware predicate and wording introduced for finding 2.
2. In `peekFormation(w, f)`, compute the warning class and title before assembling the row.
3. Apply the class and title to both B/TO and LD cells.
4. Do **not** add `data-warnkey`: the peek is inert and has no warning list whose tap it could answer.
5. Add a block to `ui/peek.test.tsx` covering:
   - Equal-time ordinary line: exactly two marked cells with explanatory titles.
   - Normal, overnight and blank lines: no mark.
   - Crewless line: no mark.
   - Standalone equal-time line: the D31 wording, not D49’s report/debrief wording.

## 4. Low — warning tap has no visible focus response

**Provenance:** confirmed-new. The branch adds `data-warnkey` resolution in `anchorEl`, but does not extend `refreshHighlights` to paint that target.

At `0b65979d`, `[highlights.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/highlights.ts)` can find the landing box and scroll to it. The warning carries no person ids, however, so the existing puck-highlight loop lights nothing. If the line is already visible, the gesture appears to do nothing.

The new test proves only that `anchorEl` resolves and that the returned element already has the resting `badtm` mark; it never invokes the real focus-paint pass.

### Failure scenario

- **Setup:** Keep an equal-time line visible beside its warning list.
- **Action:** Tap `FLT_NO_LEN`.
- **Expected:** The page moves if necessary and the named fault visibly lights in the warning’s advisory colour.
- **Observation disproving correctness:** Scroll position does not change because the line is already visible, and neither time box gains a focus class.

### Exact fix

1. In `refreshHighlights`, remove stale `wfoc`/`advf` classes from all `[data-warnkey]` elements on every pass.
2. When `WFOCUS.key` equals an element’s `data-warnkey`, add `wfoc`; add `advf` for a non-hard warning.
3. Add element-specific CSS for `.badtm.wfoc` and `.badtm.wfoc.advf`, stronger than the resting one-pixel advisory edge.
4. Extend `ui/fltnolen-mark.test.tsx` to call the actual highlight refresh and assert:
   - Both addressed boxes visibly focus.
   - Clearing focus removes the classes.
   - An unrelated warning key does not focus them.
   - The same behavior works on board, edit week and view week.

## Explicit negatives

- I checked the **issued-money boundary** and found nothing else: generated OIL is derived from the resolved issued snapshot, not the live draft, and the reverse sweep removes only generated credits no issued work still supports.
- I checked the **two evidence projections** and found nothing: publication comparison carries frozen placeholder membership; the signature key deliberately omits membership while retaining actual scheduler decisions and inputs.
- I checked **signature invalidation** and found nothing: availability-only membership changes raise pending without clearing signatures; OIL decision changes still alter the signature binding.
- I checked every **placeholder expansion surface**—duty primary/extras, AMT/OFT seats/passengers/extras, ground primary/extras, Common Programme lists/extras, and accepted-request placeholder membership—and found no additional missing `putAny`/`oilSentOf` route.
- I checked all **cockpit refusal doors**—drag/drop, armed-seat shortcut, picker/tap and engine writer belt—and found no route by which ALL/ALL AVAIL can become paying flying crew.
- I checked **item, person and blanket OIL decisions**, including default-off exemptions and later-added people, and found no additional screen/money disagreement.
- I checked **sim spare-seat creation** for even, odd, already-empty and read-only rows and found nothing.
- I checked the **phone count-chip CSS and hit-test assertion** and found no static-code defect. I could not independently execute its browser geometry test in this read-only environment.
- I specifically checked the new **`setPeople` capture** for capturing an empty window, resurrecting a cleared PO, stored-record precedence, post-boot invocation, nested command routing and reconciler locking. Apart from the pre-existing PI-only reader/restoration defect in finding 1, I found no concrete corruption path. The boot comments are stale—`initStore` has already enabled the command router—but the later history re-baseline prevents the boot capture becoming a user undo step.
- I checked ordinary D49 rendering on the **board, edit week and view week** and found nothing beyond findings 2 and 4.
- I did not report the explicitly excluded `[OIL-REQ-NAMEBOX]`, `[ALL-AVAIL-WINDOW]`, demo seed/date mismatch, or `[LW-SCRUBBER-FLAKY]` as branch findings.

## Verification limitation

I attempted the focused changed suites, but Vitest could not start because the read-only environment denied creation of its temporary client/SSR directories (`EPERM ... mkdir ...\Temp\...\client` / `ssr`). Therefore this report is based on direct source, ruling, call-site and baseline inspection—not a fresh green test claim.

