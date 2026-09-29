# Small fixes — final code read

## Findings

### 1. Unreadable stored weeks fail open at three mutation doors

**Severity:** Published record / saved data

**Where:**

- `raptor-port/src/engine/publish.ts:758`
- `raptor-port/src/ui/inputedit.tsx:908-911`
- `raptor-port/src/engine/slots.ts:621`
- Missing coverage at `raptor-port/src/state/reqorphan.test.ts:63-72`

**Scenario:**

1. A request spans two weeks.
2. The other week has a stored but unreadable blob, so `rowElsewhere()` correctly returns `'unreadable'`.
3. On the loaded week:
   - Loading a version or switching plans keeps its incoming row because `rowsLeftOut()` explicitly ignores `'unreadable'`. If the stored week contains the original row, the request now has two rows and the new one can be published.
   - Editing or deleting the request proceeds because `landedOnUnloadedWeek()` converts `'unreadable'` to the safe-looking empty string. A delete can therefore leave an orphan row in the stored week; an edit can leave that row with stale details.
   - During relanding, `relandInputs()` sets the request to dormant `'r'`, even though the unreadable week may contain its active row.

The existing unreadable-stash test proves only that `acceptInput()` refuses. It does not exercise these other consumers.

**Why it is wrong:**

Plan §9 requires the shared resolver to fail closed on an unreadable stash and explicitly lists `rowsLeftOut`, `landedOnUnloadedWeek`, and `relandInputs` as readers. The one-request/one-row contract also says a stored unloaded row prevents edit or deletion. Current code obtains the required unknown state and then discards it at those three doors.

This is not old-demo-data-only harm: a currently unreadable persistence write followed by a load, edit, delete, or navigation creates new inconsistent state.

**Fix:**

1. Make `landedOnUnloadedWeek()` preserve three results: safe, found with a date, and unreadable. Pass the request to `rowElsewhere(inpId(r), r)` so an unrelated damaged week does not block it.
2. In `commitInputEdit()` and `removeInput()`, refuse both found and unreadable results before any write. Give unreadable its own message: “Can’t tell whether this request has a row on another week — load or recover that week first.”
3. In `rowsLeftOut()`, find the matching request and pass it to `rowElsewhere(id, inp)`. Treat `'unreadable'` as a reason to leave the incoming row out, with an explicit unknown-week result so `rowsLeftSaid()` does not produce an empty day name.
4. In `relandInputs()`, set `'r'` only when `away === null`; both a found row and `'unreadable'` must prevent reparking.
5. Extend `reqorphan.test.ts` with one unreadable covered-week case for each door:
   - `rowsLeftOut()` includes the incoming row. This returns `[]` today.
   - `removeInput()` and `commitInputEdit()` return false without changing the request. They succeed today.
   - `relandInputs(new Set([id]))` does not set `acc` to `'r'`. It does today.
   - Retain the existing control proving an unreadable week outside the request’s covered dates does not block it.

### 2. A wide six-letter callsign still ellipsizes on phones

**Severity:** A person sees something wrong

**Where:**

- `raptor-port/src/ui/scheduler.css:1136`
- `raptor-port/src/ui/scheduler.css:3454`
- `raptor-port/src/ui/scheduler.css:3570`
- Missing coverage at `raptor-port/e2e/geometry.spec.ts:516`

**Scenario:**

1. Give a flying line a six-letter callsign such as `HAMMER` or `MAGNUM`.
2. Open the edit week or View-only schedule at phone width.
3. The callsign is ellipsized despite being exactly six letters.

The normal phone track is 50px. After cell padding and the always-present 7px mission dot, approximately 39px remains for the name. The file’s own measurements show wider six-letter names need more; its comment explicitly acknowledges that a wide six-letter name still ends in an ellipsis. At 374px and below, the track falls to 48px.

The browser test uses `W6LINE` and `RANGER`, both narrow enough to pass, so it does not prove the stated six-letter rule.

**Why it is wrong:**

The brief and accepted D3 disposition require six letters whole, with ellipsis beginning only for longer names. The implementation and its proof cover selected six-letter strings rather than the six-character boundary.

**Fix:**

1. For both phone track rules, size the CS/MSN track from the complete requirement: cell padding + the 7px dot + the widest legal six-character callsign at that breakpoint’s font.
2. Update both the 50px rule and the ≤374px 48px override; preserve the flexible remarks track and the fixed time/puck tracks.
3. In `geometry.spec.ts`, replace the narrow-only sample with wide six-letter controls such as `HAMMER` and `MAGNUM`, plus the widest legal six-character string, while retaining a seven-plus-letter ellipsis control.
4. Assert at both 390px and 360px that every six-character name has `scrollWidth <= clientWidth`, stays on one line, and the longer control is still ellipsized. Those wide-name assertions go red today.

## Checked and found right

- Both floating windows use the shared `BOARD_BAR` clearance, react to preview-bar replacement, and preserve a user-positioned box.
- Lift depth is on the veil, lifted ghosts expose overflow, and the puck’s own warning/focus ring remains independent.
- Open-ended placeholder membership is derived in a display-only pass; the OIL money walk remains unchanged. The window and row switch explain the missing end, while no-start rows use a distinct `?` state.
- Publish toast batching is scoped to `commitPublish`, preserves order and strongest severity, and drops messages on an exception. Unpublish derives its sentence from the withdrawn version.
- Ground signature binding uses shown order, and pending ground addresses use stable row IDs while issued-side deletes/holes retain their old addresses.
- Readable cross-week rows are found without reading the loaded week’s stale stash; Accept refuses duplicates and names the other date.
- The plan banner delegates to the plans-menu switch path, and deleted requests can be named from their frozen input or surviving row.
- Leave War sheet dates use the shared human-readable formatters; retired move doors are gone; clash lines distinguish bid, war-approved, published-war, and Inputs-page remedies; phone VIEWING AS and inert input styling are present.
- I inspected the complete requested source/e2e diff and the named contracts, rulings, evidence, and tests. I did not run the full suite or the app, as the brief reserves the check lock. No files were modified.

