Reviewed `e67107e31` against `535fdc94f`. **Two findings.** No files changed or commits made. I did not open the other reports, evidence sheet or walk pictures.

1. **P2 — Combining the test switches bypasses “no storage” and permits startup writes.**

   **Failure:** Open with `?nostore&savefail` or `?savefail&nostore`. The app selects browser storage, leaves “Not kept” off, and permits writes before the failed-save switch is armed.

   **Cause:** In `src/storage/boot.ts:96–106`, storage is accessed and `savefail` returns before `nostore` is checked. Even `?nostore` alone reads the storage length.

   **Evidence:** An in-memory probe running the specified commit’s storage modules returned `BrowserBackend`, `storageRefused() === false`, and one stored entry after a startup-style write for both combined URLs.

   **Fix:** Move the `nostore` check before acquiring browser storage and before the `savefail` branch, retaining the existing intentional-memory exclusions.

   **Failing regression:** For both combined URLs, assert memory storage, refusal flagged, and zero storage getter/method calls through startup. Count the `localStorage` getter and `length`, which the added test currently misses.

2. **P3 — `?nostore` still reads and saves browser preferences.**

   **Failure:** Open Tracker with `?nostore` and hide its toolbar. That preference survives reopening the ordinary app. This contradicts the brief’s promise that the switch touches no storage and behaves like a browser refusing storage.

   **Cause:** The switch replaces the records backend only. Tracker’s `prefGet`/`prefSet` (`src/tracker/app/core.js:785–804`) still access browser storage directly. The Inputs calendar’s expansion setting, Board column width and Leave War preferences have equivalent paths.

   **Evidence:** Executing the commit’s Tracker preference functions with storage marked unavailable still read `ocuLocal:barHidden` and wrote its changed value.

   **Fix:** Make these preference helpers use memory/defaults while storage is refused or `?nostore` is active. Establish that state before their first read; preserve ordinary-browser and intentional test-mode behaviour.

   **Failing regression:** Instrument browser storage, open Tracker under `?nostore`, and toggle the toolbar. Assert zero reads/writes and unchanged persisted preferences. Repeat for the other direct preference writers.

No further code-level findings in the band’s callers, failed-save precedence, access-pass distinction, Tracker error visibility or magnifier replacement. The changed assertions were not weakened.

Targeted in-memory checks passed seven save-state combinations and confirmed that successful Retry returns to “Not kept” when appropriate. The project test suite and browser geometry were **not run**; this report does not certify narrow-phone fit.

Rulings: none this session.

**Tidiness note — for the host to file, not fixed:**

- **Standalone leftovers:** none newly retained in the changed logic; the separate magnifier drawing is removed.
- **Duplication:** the existing glyph-wrapper duplication remains covered by `[TRK-COPIES-TIDY]`; no additional item identified.
- **Comments:** the revised pencil comment misleadingly attaches “1.05em” to the Tracker’s classes. Tracker uses `.trkglyph` at 15px, with smaller contextual overrides; `.trkglyph.trkpen` has no sizing rule. Separate the app’s sizing explanation from Tracker’s.

