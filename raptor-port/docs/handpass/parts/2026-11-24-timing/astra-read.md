# Astra's blind code read (GPT-6 Astra, high) — saved by chat 165

Read an exported copy (C:/t165r) of fcb9ec69e, its handoff block, evidence sheet, scenario reports and walk scripts taken out; brief: docs/superpowers/briefs/2026-11-24-timing-readout-code-read-brief.md; run 15:40–15:57, 24 Nov 26, exit 0, codex exec -s read-only. Blind to the walk and to the other reader.

I found six defects in the supplied source. I reported each as it was confirmed; the complete findings follow. These are source-level findings—the browser reproductions remain for the host.

I used the supplied patch, changed no file, and read no other reviewer’s report. No branch handoff was supplied after compaction.

**1. Escape closes the Leave War window underneath Timing.**

**Setup and action:** Open `?timing`, fold Timing, open someone’s leave window in Leave War, reopen Timing, then press Escape with focus inside Timing.

**What shows:** The person’s leave window closes; Timing stays open. **What should:** Timing folds and the leave window stays intact.

**Cause:** [Sheet.tsx:518](/C:/t165r/raptor-port/src/leavewar/ui/Sheet.tsx:518) handles Escape during document capture and stops propagation. Its exceptions cover other sheets and questions, but omit the front movable window. Timing’s handler runs later, at [FloatWindow.tsx:228](/C:/t165r/raptor-port/src/ui/FloatWindow.tsx:228).

**Fix steps:**

1. In the Leave War Escape handler, inspect the event target’s closest movable window.
2. If that window’s identifier matches the shared front-window registry, return without closing the sheet or stopping the event.
3. Let the movable window’s existing handler fold Timing.
4. Add both orders: leave window → Timing → Escape; Timing → leave window → Escape. Each must close only the last opened surface.

**Host reproduction:** Desktop, normal speed, exactly the sequence above. Also repeat with keyboard focus on Timing’s Copy button.

**2. An older Copy result can falsely confirm the newest failed copy.**

**Setup and action:** Press Copy all twice while the first request is pending. Make the second request return `false`, then let the first return `true`.

**What shows:** “Copied” appears after the latest copy failed. If the figures changed between presses, it confirms the wrong snapshot. **What should:** Only the latest request may set the confirmation.

**Cause:** [TimingReadout.tsx:52](/C:/t165r/raptor-port/src/ui/TimingReadout.tsx:52) accepts every asynchronous completion. There is no request identifier, and folding does not invalidate pending requests.

**Fix steps:**

1. Add a ref holding a monotonically increasing copy-request identifier.
2. Increment it on every Copy press, capture its value, and clear “Copied”.
3. After awaiting the copy, set “Copied” only when the result succeeded and the captured identifier is still current.
4. Invalidate the identifier and clear the confirmation when folding or unmounting.
5. Add deferred-promise tests for both completion orders and for folding while a copy is pending.

**Host test:** In `TimingReadout.test.tsx`, inject two independently controlled copy promises. Resolve request two as failure before request one succeeds; the button must remain “Copy all”. The existing sequential success/failure test does not exercise this overlap.

**3. Tracker’s download figure can include Leave War’s background download.**

**Setup and action:** On a fresh desktop visit, let Leave War’s idle pre-download start. Open Tracker while it remains pending. Complete Leave War’s download before Tracker finishes opening.

**What shows:** Tracker’s “downloaded” figure includes the unrelated Leave War files. **What should:** A figure presented as Tracker’s download must count files needed by Tracker, or be omitted when ownership cannot be established.

**Cause:** [timing.ts:101](/C:/t165r/raptor-port/src/ui/timing.ts:101) totals JavaScript and CSS resource entries overlapping the interval. It filters Timing’s own files, but has no page ownership filter. Background Leave War downloads qualify.

**Fix steps:**

1. Pass the destination page into the download calculation.
2. Establish each lazy page’s asset set from build metadata, including its imported chunks and styles.
3. Count only same-origin entries belonging to that page’s asset set and overlapping the measurement interval.
4. Preserve the exclusions for Timing itself and responses without a downloaded body.
5. Keep this metadata out of the ordinary initial download; do not introduce a manifest request on every navigation.
6. If ownership is unavailable, omit the page download figure.
7. Add a test containing overlapping Leave War and Tracker resource entries and assert that Tracker receives only its own total.

**Host reproduction:** Hold Leave War’s chunk response for five seconds. During that hold, open Tracker and hold its response too. Release Leave War first, then Tracker. Compare the displayed figure with Tracker’s actual asset transfers.

**4. Folding Timing loses the keyboard’s place.**

**Setup and action:** Fold Timing, reach its corner button using Tab, open it with Enter, then fold it using Escape or its close button.

**What shows:** Focus falls back to the document instead of returning to the corner button. **What should:** Focus returns to the newly displayed Timing button.

**Cause:** [TimingReadout.tsx:47](/C:/t165r/raptor-port/src/ui/TimingReadout.tsx:47) removes the opener button while Timing is open. The shared cleanup at [FloatWindow.tsx:204](/C:/t165r/raptor-port/src/ui/FloatWindow.tsx:204) cannot restore focus to that disconnected element. The replacement button receives no focus.

**Fix steps:**

1. Give the corner button a ref.
2. Record when a user folds the window.
3. After the folded button mounts, focus that ref with `preventScroll`, then clear the recorded request.
4. Preserve the separate startup behaviour that leaves the sign-in caret alone.
5. Test reopening and folding through both Escape and the close button.

**Host reproduction:** Desktop, keyboard only, normal speed. After folding, assert that the corner button is the active element and that the next Tab follows it.

**5. A full Timing window covers the failed-save band on a phone.**

**Setup and action:** At 390 × 844, open `?timing&savefail`. Make a change that produces “Not saved”, accumulate 30 page rows, then open Timing without dragging it.

**What shows:** The window can extend to 12 pixels below the screen’s top, covering the warning and Retry. **What should:** An unplaced window must remain below the failed-save band, with its contents scrolling.

**Cause:** [timing.css:25](/C:/t165r/raptor-port/src/ui/timing.css:25) anchors the phone window 12 pixels above the bottom but leaves the inherited almost-full-screen height. [22-float-windows.css:52](/C:/t165r/raptor-port/src/ui/scheduler/22-float-windows.css:52) permits `100dvh - 24px`; [floatwin.ts:183](/C:/t165r/raptor-port/src/ui/floatwin.ts:183) skips default-position clearance on phones.

**Fix steps:**

1. Distinguish an unplaced phone window from one the user has dragged. Existing `data-placed` is desktop-only, so do not rely on it for this distinction.
2. Cap the unplaced phone window using the live top-bar height: with a 12-pixel bottom gap and an 8-pixel clearance, the maximum height is `100dvh - var(--topbar-h, 0px) - 20px`.
3. Supply the corresponding `vh` fallback and retain scrolling inside the window body.
4. Recalculate through the existing live height variable when the failed-save band appears or disappears.
5. Preserve the user’s explicitly moved position.
6. Add browser geometry and hit-testing checks for a band already present and one appearing while Timing is open.

**Host reproduction:** Run the stated 390 × 844 case in Chromium and WebKit. Timing’s top must remain below the band, and a hit test at Retry’s centre must reach Retry.

**6. Escape in Timing can discard an unfinished Tracker edit.**

**Setup and action:** Fold Timing, open Tracker → Show All, start editing an event name without saving, reopen Timing, then press Escape inside Timing.

**What shows:** Show All closes, unmounting the unfinished edit, while Timing remains open. **What should:** Timing folds; Show All and the unfinished text remain.

**Cause:** Tracker installs its document Escape listener at [App.jsx:131](/C:/t165r/raptor-port/src/tracker/App.jsx:131). [core.js:6431](/C:/t165r/raptor-port/src/tracker/app/core.js:6431) does not exclude events belonging to a front movable window. Its Show All branch at [core.js:6456](/C:/t165r/raptor-port/src/tracker/app/core.js:6456) prevents the default action and closes the panel before Timing’s window listener acts.

**Fix steps:**

1. At Tracker’s document Escape entry point, identify whether the event target belongs to the current front movable window.
2. If so, return without preventing the event or changing Tracker state.
3. Let the shared window handler process Escape.
4. Add a test with an unfinished Show All edit and Timing opened afterwards.
5. Assert that Escape folds Timing, leaves Show All open, and preserves the exact draft text.
6. Verify that Tracker’s ordinary Escape behaviour still works once Timing is folded.

**Host reproduction:** Desktop, normal speed. Use a visibly distinct unsaved event name and check that exact text after folding Timing.

The host should reproduce **6 and 5 first**, followed by **1 and 3**. Findings **2 and 4** also need the focused tests described above.

I traced the production coverage as follows. “Checked” below means source inspection, not a browser pass.

| Surface or door | Visible sign and working gesture checked |
|---|---|
| Leave War | Navigation and direct war/period openings; loading claw and download failure; person window; nested sheet/question Escape order; input links. Timing row belongs to the completed page opening. |
| Tracker | Navigation, course/download readiness, logout diversion, Show All and its unfinished edit, other Escape-controlled panels. |
| View-only Sched | Navigation, initial sign-in landing, return after session reset, week readiness, background board keyboard handling. |
| Edit Schedule | Navigation, role/access redirects, board overlays and return paths. |
| Inputs | Navigation, bell links, Leave War links and OIL-day openings. |
| Quals | Navigation, welcome-back shortcut and person/admin links. |
| Logic | Shared navigation and page readiness. |
| Help | Navigation and bell/help entry. |
| Admin | Navigation and direct account/person/posting entries, subject to existing access checks. |
| Desktop navigation and phone drawer | Both route page changes through the marked page setter; Enter/Space navigation was included. |
| Sign-in and access screens | Accepted sign-in, rejected sign-in, Retry reopening, pending/disabled access, startup caret preservation. |
| Roles and sessions | Member/admin access, role-view switching, access refresh, logout and subsequent sign-in. No new guest path was introduced. |
| Timing controls | Desktop-open/phone-folded start, corner button, close, Copy, dragging, resize, page background use and failed-save clearance. |
| Other consumers | Board Escape handling, toast placement, shared window ordering, loading state, clipboard text and late readout arrival. |

The writers are the boot, accepted sign-in and shared page-change marks. The stopwatch queues or delivers their results; the readout retains the newest 30 page rows. The visible window and Copy text consume the same data. Resource and long-task observers supply computer figures independently. I found no additional production page-state writer bypassing the marked page setter.

The lifetime checks produced this table:

| State | Same trigger again | Different trigger while active | Removed or hidden | Older completion |
|---|---|---|---|---|
| Held press timestamp | Replaced by the next captured press | A subsequent click/key replaces it; a later independent action uses its own mark | Cleared by the zero-delay timer | Timestamp bounds reject an incompatible or stale clock value |
| Sign-in landing moment | New accepted sign-in replaces it | Same-task landing is treated specially; another destination cancels the week measurement | Landing flag expires after the task; hiding invalidates waits | Generation checks reject the old result |
| Page generation | New page opening replaces the previous wait; selecting the current page does not start another | Sign-in or another destination invalidates it | Hiding the document invalidates it; absent content cannot complete it | Cannot add a row after invalidation |
| Sign-in generation | A new sign-in withdraws the old figure | Leaving before the week is ready cancels it | Hidden document invalidates it | Earlier sign-in cannot publish over the new one |
| Frame wait | Independent wait belongs to its generation | Page changes invalidate the old wait | Failure stops it; waiting is bounded; final frames recheck visibility/readiness | Two-frame completion still checks ownership and readiness |
| “Copied” and its timer | New press clears the label | Overlapping requests lack ownership—finding 2 | Folding retains the component and does not invalidate the request | Old success can restore the label |
| Late readout arrival | Mount is guarded; queued results drain in order | Measurements can finish before the readout arrives | Folded readout continues collecting; failed readout import is caught | Stored measurement times do not become import-completion times |

For “what no longer runs”, the patch retains the existing navigation cleanup, session reset, role handling and boot-claw dismissal. The deliberate omissions are timing results for unchanged-page requests, abandoned openings, failed downloads and waits spanning a hidden tab. Background pre-downloads do not create page-opening rows. I found no removed scheduling or data-writing behaviour.

The existing tests cover basic rendering, sequential Copy results, startup focus, switch gating, event queuing, loading/failure guards, rapid navigation, sign-in cancellation, hidden tabs, press timestamps and resource-size formatting. They do not cover the six combinations above.

I attempted only `timing-watch.test.ts`. The first invocation was blocked by PowerShell’s script policy; invoking `npx.cmd` reached Vitest but failed creating its temporary directory with `EPERM`. **Zero tests ran.** The host should run, from `raptor-port`:

```text
npx vitest run src/ui/timing-watch.test.ts
```

Beyond the six reproductions, the remaining browser evidence is:

- Compare clean production downloads with the baseline when `?timing` is absent. Static import inspection cannot prove identical emitted files.
- Delay the Timing download by five seconds while signing in and changing pages; earlier figures must remain correctly timed and the sign-in caret must stay usable.
- With slow page downloads, switch destinations rapidly, fail a download, and hide the tab mid-opening; abandoned measurements must not later appear.
- Check Safari’s unavailable memory/long-task figures and inspect Copy text for the named fallback wording and absence of person information.

The separation between measurement, display and wording is reasonable. No unrelated restructuring is needed to address these findings.

Rulings: none this session.

Explicit negatives:

- I checked switch parsing, gated startup and the readout’s imports and found no additional source-level ungated readout download or storage write.
- I checked displayed fields and Copy text and found no person names, account details or raw resource URLs.
- I checked all nine page destinations and their production callers and found no additional missing page-change mark.
- I checked loading claws, busy sections, download failures and final-frame rechecks and found no additional premature-completion path.
- I checked sign-in, Retry reopening, session reset, logout and role changes and found no additional timing-lifetime defect or changed permission behaviour.
- I checked browser wording, missing figures, cache-size handling and freeze counters and found no additional confirmed defect.
- I checked shared dragging, resize handling, board Escape guards and toast placement and found nothing further beyond the window-order, focus and clearance findings above.
- I checked the supplied source patch for removed existing work and found no unrelated behavioural removal.