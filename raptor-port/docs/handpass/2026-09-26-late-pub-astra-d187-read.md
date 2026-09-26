# Astra's read of the D187 change — a look at a published version wears its warnings (26 Sep 26, blind)

Brief: `docs/superpowers/briefs/2026-09-26-d187-read-brief.md`; the code as of `e53f9786`. Saved verbatim; dispositions in the evidence sheet §9.

# Independent review: CHANGES REQUESTED

Reviewed `e53f9786` via the requested range. Current `HEAD` has no later `raptor-port/src` changes.

## Findings

### 1. High — older versions lose warnings they actually went out with

- **Setup:** Publish an Original while a live-on-face warning exists, such as `SC_QUAL`, `CREW_REST`, `DAYS_RUN`, or an OIL warning. Clear it and publish AL1.
- **Action:** Look back at the Original.
- **Expected:** The Original shows the warning it displayed when issued.
- **Observed:** `warnSliceOf` deliberately excludes every `LIVE_ON_FACE` warning and stores only frozen marks; `versionFaceWarn` filters them again. The Original therefore appears clean. The new test derives its expected count from this already-truncated stored slice, so it cannot catch the defect. See [validate.ts:1453](C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:1453), [validate.ts:1440](C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:1440), and [latepub.test.tsx:674](C:/Users/User/projects/Raptor/raptor-port/src/ui/latepub.test.tsx:674).
- **Fix:** Keep the existing frozen/comparison slice for pending detection, but also capture an archival issue-time face slice containing the full warning list and marks, excluding the deliberately live `trace`. Use that archival slice only for superseded-version looks. Add a regression where an Original goes out with `SC_QUAL`, AL1 clears it, and the Original look retains it while current AL1 does not.

### 2. High — the edit-week look exposes live mutation controls and respects today’s mute state

- **Setup:** As a scheduler, look at a published version and expand its warnings. Include an `OIL_NO_PERIOD` warning or a warning currently muted.
- **Action:** Inspect or operate the warning rows.
- **Expected:** The historical warning list is a complete, read-only record, matching View-only Sched.
- **Observed:** `dayWarnHTML` uses global `editMode()` even while `PV` is active. It emits mute buttons and the “Create period” action, both of which mutate today’s state. It also filters the document through `WARNOFF`. The board suppresses the buttons but still moves muted document warnings under “hidden,” unlike View-only Sched. See [html.ts:1013](C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:1013), [html.ts:1075](C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:1075), [html.ts:1082](C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:1082), and [board.ts:468](C:/Users/User/projects/Raptor/raptor-port/src/ui/board.ts:468).
- **Fix:** Give both warning builders an explicit historical-look mode. In that mode, show every warning directly, ignore `WARNOFF`, and emit no mute, reveal, or Leave War action. Pin both the week and board with a previously muted warning.

### 3. High — the day-details “i” panel reads the live working copy behind a look

- **Setup:** Make the working copy differ from a published version, then look at that version on Edit Schedule.
- **Action:** Open its day-details panel.
- **Expected:** Counts, tasking, pending state, and warnings describe the version being viewed.
- **Observed:** `DayPop` only resolves an issued face on View-only Sched. On Edit Schedule it ignores `DPREV` and calls `dayInfoHTML` in the live world, so the panel can disclose different tasking and warnings. See [Modals.tsx:24](C:/Users/User/projects/Raptor/raptor-port/src/ui/Modals.tsx:24) and [html.ts:2081](C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:2081).
- **Fix:** Resolve the actually displayed edit-page version and replay it through `withChipWorld`; use flags for issued versions and no flags for parked plans. While under `PV`, have `dayInfoHTML` report zero live pending and identify `PVV`, not `dayCurVer`.

### 4. Medium — an edit-page preview leaks into View-only warning interactions

- **Setup:** Leave an older issued version selected on Edit Schedule, then navigate to View-only Sched.
- **Action:** Tap a visible current warning or select its puck.
- **Expected:** The current issued face and its interaction resolver use the same warning bundle.
- **Observed:** View-only correctly ignores issued `DPREV` when rendering, but `displayedBundle` consults it without checking the page. A tap can resolve the older version’s warning at that index—or nothing—while the screen shows the current document. This contradicts the existing “must never bleed” contract. See [view.ts:586](C:/Users/User/projects/Raptor/raptor-port/src/state/view.ts:586), [html.ts:234](C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:234), and [html.ts:354](C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:354).
- **Fix:** Consult issued `DPREV` only where it is actually painted—currently `CURPAGE === 'editsched'`. Do not clear it on navigation, because the edit page intentionally remembers its look. Extend the existing “preview never leaks” test to assert warning resolution, not merely absence of the banner.

### 5. Medium — board warning taps do not illuminate the warned puck

- **Setup:** Open the board’s published-version look and tap one of its warnings.
- **Action:** Follow the warning jump.
- **Expected:** The relevant puck or addressed box is illuminated, as on the edit week.
- **Observed:** The focus and scroll are set, but the highlighter explicitly excludes `.pv-frozen`; box highlighting also excludes both preview wrappers. Those exclusions predate D187’s version-aware warning bundle. See [highlights.ts:65](C:/Users/User/projects/Raptor/raptor-port/src/ui/highlights.ts:65) and [highlights.ts:111](C:/Users/User/projects/Raptor/raptor-port/src/ui/highlights.ts:111).
- **Fix:** Permit warning-focus decoration on a preview when `displayedBundle` resolves that preview’s warning. Retain the preview exclusions for live mutation pulses, fresh-add marks, and edit affordances.

### 6. Medium — warning focus survives a version switch by unstable array index

- **Setup:** Focus warning index 0 in one version, then switch to another version whose index 0 is a different warning.
- **Action:** Inspect or tap the newly displayed row.
- **Expected:** The old focus is cleared or rebound by stable warning identity.
- **Observed:** `setDayPreview` leaves `WFOCUS` and `PFOCUS` untouched, while both warning renderers mark the selected row using only day/index. The new warning can appear selected with no culprit highlighted; its first tap may merely toggle off the old focus. See [view.ts:834](C:/Users/User/projects/Raptor/raptor-port/src/state/view.ts:834), [html.ts:1078](C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:1078), and [board.ts:474](C:/Users/User/projects/Raptor/raptor-port/src/ui/board.ts:474).
- **Fix:** When a day’s displayed version changes, clear that day’s `WFOCUS` and version-derived `PFOCUS` while retaining ordinary name selection if desired. Test both week and board transitions.

## Explicit negatives

- The current-version look correctly routes through `faceWarn`, including D183–D188 live overlays.
- Parked plans and pre-freeze versions without stored warnings remain flag-free.
- The ALL AVAIL chip carries its version/flag world and replays it through `withChipWorld`; I found no working-copy leak there.
- Ordinary slots, drag targets, sign-offs, and publish controls remain suppressed under `PV`.
- Unpublish and AL publishing are guarded while `DPREV` is active.
- `WARN`, `OFW`, and snapshot swaps restore through `finally`; I found no overlay-state leak after rendering.
- I found no separate phone-only logic defect in this change, though no rendered-width verification was performed.
- These are forward defects, not D56 harm confined to already-stored data.

No files were edited. No tests were run, as requested. The documentation changed concurrently during the read to add D189; I re-read D183–D188 afterward, and `raptor-port/src` remained unchanged.

