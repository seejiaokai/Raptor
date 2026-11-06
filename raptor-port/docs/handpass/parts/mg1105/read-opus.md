# Member / guest check — the code read (fresh, blind Opus — 5 Nov 26)

Saved whole for `docs/handpass/2026-11-05-member-guest.md`. The reader read `git diff c7ddf441b..243e02c8f` (the app's one
change — the change-log batch's actor — with its test and two document lines, and the walk scripts), blind to the walk's
report and to the security reader's, and was asked (A) whether the fix is right and complete and (B, C) whether the walk
scripts prove what the check claims. Its F1–F8 are about the PROBE, not the app; the host answered them with a second
probe round (`scripts/handpass/mg1105-probe2.mjs`), the evidence sheet §Reads says how each was answered.

---

## Fresh, blind read: the change-log actor fix and the member / guest evidence (commit 243e02c8f)

**Summary:** The app change is right. I found no fault in it. The walk scripts do not yet prove "every control was pressed and nothing saved". The counter itself is sound: M9's total for the whole member run is 0 writes, and the guest's request group is captured whole. The gaps are elsewhere: presses whose click never landed still count as quiet, controls inside popups were never pressed, and Edit Schedule's own text and seat cells were never touched.

I read only. I changed nothing and ran one unit file, `src/state/changebatch-rollcall.test.ts`: 6/6 passed.

### Findings, ranked

**F1 (C, high): a press that never landed counts as a PASS.**
- **Where:** `scripts/handpass/mg1105-probe.mjs` — lines 30–35: `pressOne` catches the click error into `r.err`; line 54: `quiet()` ignores `err`; lines 96–98: a quiet result is logged only if it showed a toast, so `err` never appears in `results-M.txt` or `probe-M.log`.
- **How it fails:** a click that Playwright cannot land times out after 1.5 s and reads "nothing saved" — another element covers the control, or the control is disabled (the board's Remarks box is `disabled:true` for a member, walk A5).
- **Concrete trigger, from the walk's own evidence:** the changes window does not close on Escape or on an outside click (walk-a AdA2/ApA2). In M3 it is opened at press 15 of 28 by "See the 1 change waiting…". Nothing closes it afterwards, so it stays over every later press, possibly the whole M4 board run.
- **Fix:** log every press with its `err`; classify disabled and NOT PRESSED; make M3 and M4 FAIL when NOT PRESSED is above 0; after each press close `.chgwin .win-x` and the day pop-up too, not only Escape.

**F2 (B, high for "every control"): controls inside popups were never pressed.** `listControls` is run once per root before any press; contents that appear later, often outside the root, are never listed — the changes window's own controls ("Mark all as seen" is a save), the day-info popup's approval and AL-version controls, the CAT and Type filter chips, the 7 Quals chips the log calls "gone". **Fix:** a worklist — after every press, list controls in the whole document, push any kind not yet seen, press it.

**F3 (B, medium): Edit Schedule's own editing surfaces are not in the control list.** No `[data-txt]` and no empty seat cells; click-to-place never tried; the walk's one drag found no empty seat and had no positive control (never shown to change the model as an admin). **Fix:** add `[data-txt], [data-slot]`; type into text cells; try an empty seat then a crew puck; run the same as the admin first and assert something moves, then as the member.

**F4 (C, low): the refused guest rounds pass unconditionally** (probe line 211). Settled anyway by GR: once storage works, the flush holds exactly `__txn`, `accessreq`, `changes`, then removes `__txn`, so nothing else was pending. **Fix:** record the parsed group's keys for `raptor:__txn`.

**F5 (B, low): the run total is only a note** (M9-end). **Fix:** make it a check.

**F6 (B, low): the schedule hash does not cover everything a member could change** — people, the Leave War, settings and accounts, the Tracker; and the round ends without a sign-out. **Fix:** hash PEOPLE and the war state; end with sign-out, the admin's sign-in, and check what was written.

**F7 (B, low): IndexedDB is not counted** — the documents drawer, reached only by the input editor's hidden file box, which the probes never reach in this scope. **Fix:** wrap the object store's writers.

**F8 (C, low): a change is missed when the same press also moves the week.** **Fix:** a week-independent hash of inputs and the rest on every press.

**Observation, for the walk report:** AdA4's PASS checks writes only. Its data shows the member's pick staying in the sign-off select after a repaint (`valueAfterRepaint:"shaft"`), with "Couldn't save that — try again". This is on the bridge-only route.

### A. `batchActor` — correct; no finding

- **Every role:** admin and member keep their account id (the admin's member view too); pending, guest and off carry `principal:<name>` and now record their bare role; the headless and system actor stays `'system'`.
- **Every door:** the wrapper's only caller is `dispatch` (`commit.ts:173`); nested commands join without changing `OPENED`; app-run projections use the system actor; Undo/Redo runs as `currentActor()`; the admin history sweep runs as the admin; guest and off sessions are refused at authorize, so no batch is written for them.
- **What the changed path no longer does:** it no longer tells which waiting person acted. Nothing reads `actorId` — the writer and three tests only; in the docs, data-model, data-schema and file-map mention it; the design's reader never uses the actor.
- **The test:** the real route (a real sign-in as a stranger, the real Request access writer, the real command layer and sealer); red without the fix (`'principal:kite@mail' !== 'pending'`); guest and off cannot commit.
- **Not settled — for the database step:** Dataverse stamps every row's built-in "created by"; the ChangeBatch row a waiting person writes would still name him there — a database-step design matter (write a waiting person's request through a service account, or an equivalent).
- **Wording nit:** "someone with no account (… switched off)" — a switched-off person has an account; his session carries none. Suggested: "a session that carries no account id".
- **Not a finding (D56):** the demo seed's account ids (`acad`, `acus`…) contain sign-in names; new accounts get random ids.

### Explicit negatives

- The counter sees every storage write the app makes (it wraps `Storage.prototype`, so sessionStorage is counted too); no `Storage.clear()`, no `localStorage[…] =`, no cookies, Cache API, `sendBeacon`, BroadcastChannel or service worker.
- No long timer writes; the 6 s guest wait is enough without a refusal.
- `ELOG`, `histSnap`, `CURWEEK`, `CURPAGE` and `openScheduler` are all on the bridge; `#undoBtn` is present on Edit Schedule; the board's pair drives the same Undo history.
- The Escape is sent after each press's reading.
- The G2 request group was captured whole.
- AdA1's "Monday published and approved" toast is stale text from the admin's fixture: no new toast appeared.

**Not settled without running the browser:** how many M3/M4 presses actually landed, and whether the changes window covers the board.
