# Code-tidy audit report

Five high-confidence separations passed the brief’s deletion test. None alleges a behavioural bug; each removes an unrelated job from a large file without changing rules.

## 1. Separate the memoised Leave War row renderers

**Files:** [Matrix.tsx](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:236), with a new `MatrixRows.tsx`.

**What separates:** Move `PersonRow`, `PersonMonth`, their props, and their row-only predicates from `Matrix.tsx`. Keep `Matrix` responsible for controller state, geometry, selection and sheets. The extracted components already communicate through explicit props and callbacks, so no new context or generic abstraction is needed.

**What must remain identical:** Exact DOM order, classes, data attributes, memoisation boundaries, frozen columns, placeholder columns, admin/member visibility, OIL and award display, free-half presentation, figures selection, clicks and drag behaviour.

**Existing coverage:** `ui/matrix.test.tsx`, `frozencols.test.tsx`, `freehalf.test.tsx`, `ownaward.test.tsx`, `window.test.tsx`, `figdrawer.test.tsx`, `bidding.test.tsx`, `repaint.test.tsx`, and `e2e/leavewar.spec.ts`.

**Write first:** `ui/matrix-rows.test.tsx`, rendering representative admin and member rows and pinning their DOM for awards, OIL, free halves, posted-out people and window-padding placeholders. It should also assert that opening an unrelated sheet does not repaint `PersonRow`.

**Check tier:** **FULL** — permissions and OIL presentation are involved.

**Feature batch:** **the Leave War**.

**Saving against risk:** Best ratio in the audit: roughly 470 lines of a distinct paint job leave the controller, with an existing narrow props boundary.

## 2. Split the scheduler stylesheet by owned surface

**File:** [scheduler.css](C:/Users/User/projects/Raptor/raptor-port/src/ui/scheduler.css:102).

**What separates:** Replace the 6,597-line stylesheet with an ordered entry manifest and surface-owned fragments: foundation/login, top bar and shell, week/day scheduler, Inputs, modals, Board, Admin/Help, medical, OIL, availability, and changes window. Move rule bodies unchanged and preserve their global order.

**What must remain identical:** Selector precedence, responsive breakpoints, `[hidden]` behaviour, sticky geometry, z-index ordering, role-dependent visibility, warnings, drawers, drag states, animations and every computed style. This is file separation, not selector cleanup.

**Existing coverage:** `ui/css-invalidation.test.ts`, `lift-css.test.ts`, `layers.test.ts`, `topbar-css.test.ts`, `flagglow-css.test.ts`, plus `e2e/geometry.spec.ts`, `medical.spec.ts`, `changeswin.spec.ts`, and `warnhide.spec.ts`.

**Write first:** `ui/scheduler-css-order.test.ts`, asserting that every fragment is loaded exactly once and in declared cascade order. Add a browser characterization matrix that records critical computed styles for admin/member roles at phone, laptop and desktop widths before any rule moves.

**Check tier:** **FULL** — the sheet includes role gates, warnings and shared interactive surfaces.

**Feature batch:** **workflow UI pass**.

**Saving against risk:** The largest reading and ownership saving, discounted to second place because one ordering error can change unrelated screens.

## 3. Remove file transfer from the Tracker’s interactive core

**File:** [core.js](C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:5777), using the existing `fileFormat.js`, `fileStore.js` and ID helpers.

**What separates:** Move the file-transfer workflow—chart/student collection, application, syllabus reconciliation, normalization, ID remapping, copy/export state and import orchestration—behind one file-transfer module. Leave `core.js` with the existing menu-facing calls. Do not introduce a catch-all “core context”; if the module cannot use the current store and format seams through a small explicit interface, stop the extraction.

**What must remain identical:** Export schema and contents, unsaved-state handling, selected-chart behaviour, filenames, whole-file normalization, cross-browser imports, stable IDs, syllabus collision decisions, student reconciliation, confirmation wording, cancellation and the single import action.

**Existing coverage:** `tracker/retest.test.tsx`, `tracker/tracker.test.tsx`, `tracker/app/fileFormat.test.ts`, `sylIds.test.ts`, `courseIds.test.ts`, `storage.test.ts`, and `scripts/tracker/smoke.mjs`.

**Write first:** `tracker/file-transfer-boundary.test.ts`: create charts and linked/unlinked students, export, initialize a fresh store, import, and compare every chart/student record and stable ID. Add explicit assertions for cancel, conflicting syllabus identity, one-chart export not reordering charts, and no partial write when reconciliation is refused.

**Check tier:** **FULL** — saved user data and import/export are involved.

**Feature batch:** **the Tracker**.

**Saving against risk:** Removes about 730 lines of a clearly separate user job, but ranks below the CSS split because the current workflow still reaches several Tracker globals.

## 4. Extract the Leave War stored-world codec from its live store

**File:** [state/store.ts](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/state/store.ts:408), alongside existing `state/storage.ts` and `state/rows.ts`.

**What separates:** Move untrusted-value validators, stored-war/profile/config readers, row-world loading, legacy conversion and whole-world serialization into a `storedWorld.ts` boundary. `store.ts` should retain state ownership, commands, history, live mutations and initialization sequencing. The codec should accept a `StorageBackend` and values explicitly; it must not own state or create a second write path.

**What must remain identical:** Every accepted and rejected stored shape, corruption fallback, legacy fold, empty-list semantics, record ordering, first-boot/demo writes, current-war choice, OIL and manning configuration, profile reconstruction and initialization without a command/history entry.

**Existing coverage:** `state/store.test.ts`, `bootprune.test.ts`, `write-seam.test.ts`, `storage-seam.test.ts`, `storage-door.test.ts`, `postout-persist.test.ts`, `demoworld-stored.test.ts`, and `rows.test.ts`.

**Write first:** `state/stored-world-parity.test.ts`, booting from a mixed backend containing current rows, legacy blobs, missing records and malformed leaves. Pin the resulting state, healed rows, fallback decisions, zero hydration commands, and byte-equivalent state after a second boot.

**Check tier:** **FULL** — this is the saved-data boundary and includes OIL configuration.

**Feature batch:** **the Leave War**.

**Saving against risk:** Gives the live store a much clearer command-layer shape, but persistence and migration sensitivity make it unsuitable as an isolated tidy project.

## 5. Keep one public Leave War seam while separating its four wires

**File:** [sync.ts](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/sync.ts:134).

**What separates:** Keep `sync.ts` as the sole public facade and wiring point, but move its existing named sections unchanged into internal modules for:

- absences and the absence door;
- derived clashes;
- published duty/OIL reconciliation;
- roster and posting outcomes.

External imports must continue through `sync.ts`. Shared re-entrancy and subscription state stays at the facade unless an individual wire alone owns it; there must be no second integration seam.

**What must remain identical:** One absence record per input, derived clashes never being stored, issued schedule as the OIL evidence source, roster projection, posting outcomes and restoration, public exports, subscription order, loop prevention, causal envelopes and all-or-nothing command behaviour.

**Existing coverage:** `sync.test.ts`, `oilsync.test.ts`, `publishdoor.test.ts`, `postout-outcomes.test.ts`, `onedoor.test.ts`, `causal-envelope.test.ts`, `roster.test.ts`, `viewerpin.test.ts`, and `state/changebatch-rollcall.test.ts`.

**Write first:** Extend `causal-envelope.test.ts` with one composed scenario that approves leave, publishes weekend/PH duty and applies a posting outcome in the same notification cycle. Assert exact wire order, one causal closure per user action, no duplicate projection, no stored clash and no recursive second pass. Add `sync-boundary.test.ts` to forbid production imports of internal wire modules.

**Check tier:** **FULL** — published data, OIL, permissions and persistence all cross this seam.

**Feature batch:** **the Leave War**.

**Saving against risk:** Potentially the largest TypeScript separation, but last in rank because it crosses the application’s deliberate integration boundary and must preserve its public facade exactly.

Read: The audit brief; workflow-skills fusion sections 2 and 8; the architecture, coding, architecture-direction and undo-contract guidance; D56, D144, D485 and D490; relevant Tracker, scheduler and Leave War rulings; all eight named source files in prescribed largest-first order; and only test or boundary call-outs needed to substantiate findings.

Did not read: Unrelated production implementations, generated artifacts, stored customer data, archived plans, or the full test-suite bodies; no runtime, browser walk or test execution was performed because this was the brief’s report-only source audit.

Considered and rejected: Broad splits of `html.ts`, `engine/publish.ts`, and `state/store.ts`; a geometry/controller split of `Matrix.tsx`; small duplicate-helper cleanups; and any D56 stored-data-only observation—the first four would move coupling into contexts, cycles or extra command layers, while the latter two do not meet the brief’s saving threshold.

