# The Tracker tidy — bug check (5 Nov 26, `claude/tracker-standalone-tidy`, pull request 637)

The job: [TRK-STANDALONE-LEFTOVERS] (D1538 — the code kept only for a standalone Tracker) and the Tracker's React Doctor
warnings (D1534). Built in commits 35c2aedea and 8b94fb1e5; the builder's report `parts/trk1105/build-report.md`.
Nothing a person sees is meant to change.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money | NO — the Tracker holds no OIL, pay or count of who is present. |
| 2 | The published record | NO — no publishing, signing or issued copy is touched. |
| 3 | Saved data | **YES** — the Tracker's storage doorway (`src/tracker/storage.js`) lost its no-target path; the save corner's setter was renamed and re-wired in `main.tsx`. |
| 4 | A shared drawer | YES — the Undo / Redo pair is drawn by the top bar for every page; the Tracker's own copy of it was removed from its bar. |
| 5 | A new gesture or mode | NO — nothing added. |
| 6 | A new surface | NO. |
| 7 | Roles | NO — no permission changed (the flex gate's no-wire answer kept as it was). |
| 8 | The warning list | NO. |

**Tier: FULL** (question 3).

## 2. The rules swept

Every ruling this change could touch, each checked on the running build (the walk's scenario, or the named check).
Results are filled from the walk (§6).

| Ruling | What it says (short) | How checked | Result |
|---|---|---|---|
| D1538 | The Tracker lives in Raptor for good; no standalone export | the change itself; the code kept for a standalone Tracker gone or re-grounded; the read found nothing left | PASS |
| D1534 | An area's React Doctor warnings ride with its next batch; kept ones with a reason | `npm run lint` before 583 / after 572, the Tracker 11 → 0; `lint:changed` no new finding | PASS |
| D347 | Every Undo / Redo pair sits in the top bar, Edit Schedule's place and look | S11, S12, route R1 | PASS — one pair, top bar only, Edit Schedule's size and look |
| D348 | On a phone: Undo · Redo · sync dot · bell | S11 (P) | PASS |
| D349 | The Tracker's own Undo / Redo moved to the top bar | S11, S12, S14 | PASS |
| D372 | A pace, end date or lull change is an undo step, ↶ / Ctrl+Z, ↷ / Ctrl+Y | S11, S12, S19 | PASS — ↶ / Ctrl+Z, ↷ / Ctrl+Y on the Tracker's steps |
| D129 | Logout with unsaved chart edits asks Save / Discard / Stay | S16 | PASS (desktop, from three pages; phone not walked — §6) |
| D376 | Each person reopens on their own course, chart and student | S1, S17, S19 | PASS |
| D463 | A shared store starts the Tracker with no course | carried by `trk-nocourse.test.tsx` (boot policy through the page seam; unchanged code path, now with the target the real boot plugs) | PASS (the unit suite) |
| D464 | His charts and typed details are kept | S9, S10 | PASS |
| D120 / D122 / D132 | Import: the charts' route; never wipes typed details; never deletes marks | S9, S10 | PASS |
| D126 | Event details belong to their chart | `eventDetails.test.tsx` (now through the app's own door); S9 | PASS |
| D121 / D1014 | Same access for everyone, the flex settings an admin's alone | S11 (M), S12(d) | PASS — the member has the pair; the flex settings read-only for him |
| D191 / D1003 / D1018 | + Add: the roster picker, the typed name, the course start box | S19; the no-roster prompt by `tracker.test.tsx` | PASS |
| D1625 | Nothing new a person sees without a mock-up | the walk: no new mark, box or button anywhere | PASS |
| D1132 / D1135 / D1170 | The Tracker bar's icons and heights | S11, S12 pictures (the bar unchanged — the removed pair was never drawn in the app) | PASS |
| D56 | Data-only harm with correct code is not a finding | in every brief | — (no finding set aside under it) |

## 3. The roll-call (§6)

**A. The thing: a Tracker record written or read through the storage doorway.** Every route into the doorway in the
running app, and whether the whiteboard is plugged in before it is reached.

| Route into the doorway | Plugged before? | Walked by |
|---|---|---|
| The Tracker's first mount (`core.init` — reads, one-time converters) | YES, because `bootBody` plugs `trackerTarget(wb)` before `main.tsx` draws anything; the Tracker is a lazy chunk drawn inside the app | S1, S7, S15, route R1 |
| A mark, a failure and its date, Last flown, pace, lulls (save helpers → `trkWrite`) | YES (same) | S1, S2, S6, S19 |
| + Add a student, rename, remove | YES | S1, S19 |
| A course added, switched, renamed, deleted, restored | YES | S1, S10 |
| ✓ Save changes (chart structure), a moved ball, event details | YES | S9, S12(a), S16 |
| ⇪ Import (charts, students & marks) | YES | S9, S10 |
| Undo / Redo of any of the above (`trkStore.restore` → `storage.set/delete`) | YES | S11, S12, S14 |
| The flex settings (admin) | YES | S12(d) |
| Logout's "Save them" (D129) | YES — logout does not unplug; `role.js` ends only the session | S16, S17 |
| `?fresh=1`, a browser whose storage cannot be touched (memory backend) | YES — the same `bootApp` with a memory backend | S3, S4 |
| The page-download Retry (D1633) | YES — Retry reloads the whole app, which boots again | S18 |
| A failed boot / a newer-version card | must not reach it, because no app is drawn | set aside (scenario designer) |
| The boot's one-time Tracker conversion (`tracker/fold.ts`) — added on the read | must not reach it: it cannot — it goes through `app/rows.js` on the backend's entries, never the doorway | the unit suite (`trk-rows.test.ts`) |
| The desktop pre-warm of the Tracker's page (`Shell.tsx` effect) — added on the read | YES — an effect of the app drawn after the boot | S15, route R1 |
| Unplugging (`setStorageImpl(null)`) | must not happen in the app — only tests call it (searched: `src/`, no caller outside `*.test.*`) | — |
| The browser backend's one-time import of old `ocu:` keys | not the doorway — `storage/browser.ts`, unchanged | S5 (an old key is never read by the Tracker) |

**B. The thing: the Undo / Redo pair for the Tracker's changes.** Every place it is drawn or pressed.

| Place | Has it / must not | Walked by |
|---|---|---|
| The app's top bar, desktop | HAS it (D347) | R1, S11 |
| The app's top bar, phone upright | HAS it, icon only, Undo · Redo · sync · bell (D348) | R1, S11 |
| The app's top bar, phone on its side (one row, D1643) | HAS it | S11, S12(a) |
| The Tracker's own bar (`#page-tracker header`) | MUST NOT, because D349 moved it to the top bar; its copy removed here | R1, S11 |
| Edit chart layout's strip, folded strip, Tools ▾ panel | MUST NOT (never had it); the top bar's pair must stay reachable over it | S12(a) |
| The marking pop-up, Show All, Legend, flex settings, + Add picker open | top bar pair HAS it, reachable or rightly covered | S12(b)–(d) |
| The keyboard (Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z) on the Tracker | HAS it; a text box keeps its own | S11, S13 |
| Another page while the Tracker is kept mounted | MUST NOT take a Tracker change back | S14 |
| Before the Tracker's code has loaded (first visit) | greyed, safe | S15 |

**C. The removed control** (the Tracker bar's own ↶ ↷, `OwnUndoRedo`) — from the removed code: its actions were
`core.doUndo` / `core.doRedo`, greyed by `canUndo` / `canRedo`, a tooltip naming the step. Afterwards each is given by
the top bar's pair (`trackerUndoEngine` → the same functions through `undo-bridge.js`), the same tooltip. It was drawn
only when the page seam had not set `hosted` — never inside the app (the seam set it as its code loaded, before any
drawing) — so nothing stood beside or below it in the app, and no event of it ran anything else.

**D. The save corner** (`#saveStat`) — one place, the Tracker's bar (desktop and phone), reading the saver handed over
by `main.tsx` through the renamed `setSaveHealth`. Walked by S6, S7, S8.

No MISSING cell at the roll-call stage.

## 4. The sizing step (§7.0, D607)

1. **Type of change:** G (saved data — the storage doorway's no-target path removed, the save corner's wiring renamed),
   with D (the Undo / Redo pair drawn by the top bar; the Tracker's own copy removed).
2. **What only a walk could find here:** a route in the running app that reaches the doorway without the whiteboard
   plugged in (it would save to memory and lose the work on reload, silently); a record landing under an `ocu:` key; the
   save corner saying "saved" beside "Not saved" (a wrong wiring of the renamed setter); a Tracker screen, size or mode
   left with no Undo / Redo pair. The tests already cover: the doorway's memory fallback and that the real boot plugs it
   (`storage.test.ts`), the no-roster + Add prompt (`tracker.test.tsx`), the bar drawing no pair (`tracker.test.tsx`),
   the pair in the top bar (`topbar-pair.test.tsx`), the smoke suite's 453 checks.
3. **What the ledger says:** G walks have found faults mostly in orders around reload and undo (the inputs batch, the
   Leave War's posting undo); the Tracker's own walks found their faults on the phone and in modes (`[TRK-DATE-BOXES]`:
   4 by the walk). A confirmation walk of a removal is cheap and has found faults where a mode reshapes a bar.
4. **The walk chosen:** ONE Sonnet 5.5 walker (D787; Low — helpers one after another), on the frozen build at
   127.0.0.1:4180 (bundle `index-DTX1F34K.js`, from 58f66b7b1), the designer's 19 scenarios S1–S19, at desktop 1536 ×
   864 Chromium and iPhone 402 × 874 WebKit by touch, the phone on its side 874 × 402 where S11/S12 say, a picture
   right after each tap on a phone (D1281), with the plain-user round S19 (D1557). Brief:
   `parts/trk1105/walker-brief.md`. Carried by tests, not walked: the no-target memory path itself (it cannot be reached
   in the app — that is the claim the walk tests from the outside), the no-roster + Add prompt (needs a store whose one
   person is ground crew — `tracker.test.tsx`, through the real roster projection), D463 (`trk-nocourse.test.tsx`).
5. **After the walk:** its row in `docs/walk-ledger.md` (§10 below).

## 5. The host's route check (walk-scripts §1)

`scripts/handpass/trk1105-route.mjs` on the frozen build: 8/8 PASS (desktop 1536 and phone 402) — one pair, top bar
only, greyed; DCO on ST-02 lights ↶ with "Undo the mark on ST-02 for STUDENT A (Ctrl+Z)"; the mark changed keys under
`raptor:tracker/` only, no `ocu:` key; the top bar's ↶ takes it back. Pictures `img/handpass/2026-11-05-tracker-tidy/route/`.

## 6. The walk

One Sonnet 5.5 walker, the frozen build at 127.0.0.1:4180 (bundle `index-DTX1F34K.js`, from 58f66b7b1); its full table,
readings and scripts: `parts/trk1105/walk-report.md`; scripts `scripts/handpass/trk1105-walk-*.mjs` (shared driver
`trk1105-walk-lib.mjs`); results `parts/trk1105/walk/`; 205 pictures `img/handpass/2026-11-05-tracker-tidy/walk/`.
Desktop 1536 × 864 Chromium; iPhone 402 × 874 WebKit by touch, two pictures a tap from S6 on (D1281); the phone on its
side 874 × 402 WebKit; admin and member.

**206 PASS · 0 FAIL · 3 not walked.** Every first-run FAIL was the script's own world (walk-scripts §7), each read in its
row and re-run on the right premise.

| Scenario | Steps | What it showed |
|---|---|---|
| S1 saves land under `raptor:tracker/` (D admin, P member) | 18 | a mark, a failure with its Failed on day, Last flown (currency), + Add from the roster, a student switch: every change under `raptor:tracker/` (and `ocuLocal:` for the pick), never an `ocu:` key; all back after a reload, same course and student |
| S2 a reload or a closed tab straight after a mark | 3 | the mark kept both ways |
| S3 `?fresh=1` | 11 | the Tracker works in memory; no `raptor:tracker/` key and no `ocu:` key changed; the stored world comes back without the session's marks |
| S4 storage that cannot be touched | 4 | the app boots on memory; the Tracker opens, marks, undoes, exports; no error |
| S5 a planted old `ocu:` course list | 16 | never read (its course nowhere on screen), never written — byte-identical after a mark and a reload |
| S6 a failed save with the Tracker open (D, P) | 6 (+ P) | the band "Not saved — keep this page open" + Retry; the corner silent, judged on its pixels; Retry while failing keeps both; lifted, Retry brings the words back; reload keeps both changes |
| S7 failed before the Tracker was ever opened | 3 | silent from the first frame; recovered after Retry |
| S8 failed while the Tracker was hidden, and back | 12 | first frame back silent, the chart drawn without a touch; recovered both orders |
| S9 Export → change → Import → reload | 6 | the file parses with charts and students; the ball's place back from the file; a typed detail and marks made after it kept (D122, D132); every key under `raptor:tracker/` |
| S10 Import into a new profile (substitute — see not walked) | 6 | real backend: the import kept after a reload; `?fresh=1`: nothing written |
| S11 the one pair (D, P, L; admin, member) | 36 | one `#trUndoBtn` / `#trRedoBtn`, inside the top bar only, greyed "Nothing to undo"; Edit Schedule's size and look (34 × 29 desktop, 30 × 30 phone); Undo · Redo · sync · bell on a phone; sideways one row, the pair on screen; a mark lights ↶ with its step named; ↶ ↷ and Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z |
| S12 every mode (D; P; L) | 27 | Edit chart layout (a ball dragged slow and quick, ↶ puts it back; sideways Tools ▾ open, the pair on screen and pressable); the marking pop-up open — the top bar's ↶ closes it and takes the mark back, no stale grade; Show All, Legend, flex settings each closed every way; the bar hidden and shown |
| S13 Ctrl+Z in a text box | 5 | the box's own; the chart's last change not taken back |
| S14 two histories while the Tracker is hidden | 6 | another page's Ctrl+Z / ↶ never takes a Tracker mark back; back on the Tracker ↶ names and takes it |
| S15 first visit on a slow network | 7 | the pair drawn once, greyed through the load; a press does nothing, no error |
| S16 Logout with unsaved chart edits (from Edit Schedule, Inputs, the Leave War) | 5 | the Tracker comes forward with Save / Discard / Stay; Save writes under `raptor:tracker/`; the member then sees it, ↶ greyed; Discard drops it, after a reload too |
| S17 another person signs in without a reload | 5 | both people's marks under `raptor:tracker/`, both there after a reload |
| S18 the Tracker's download fails, Retry | 10 | the card and its words; Retry while blocked keeps it; unblocked, the app reloads, reopens the Tracker after sign-in (D1635); a mark lands under `raptor:tracker/`; the earlier change kept |
| S19 the plain-user round (D admin; P member WebKit) | 23 | every opener and closer pressed; the course, student, marks, dates, Info panel and Show All back after a reload and a sign-out / in |

**Pictures the host opened and judged** (D1271): `route/R2-phone-marked.png` (one pair, top bar), `walk/S6-D-2-failed.png`
(the band, no corner words), `walk/S8-P-2-back-first-frame.png` (first frame back on a phone: band, no corner),
`walk/S11-L-member-marked.png` (sideways: the pair in the top bar, none on the Tracker's bar). Each as the walker said.

**Not walked, and why:**
- **S10's empty Tracker screen** — no control reaches it: deleting the last course answers "Keep at least one course."
  (`walk/S10-0-keep-one-course.png`). Its import path was walked as the first act of a new profile instead.
- **S16 on a phone** — the ball editor would not open by script (two taps, the Text tool, a double-click; WebKit and
  Chromium touch), so no unsaved chart edit could be made there. The logout question's code is untouched by this change
  (`role.js`: comments only); walked in full on the desktop from three pages.
- **S19's person window from Quals** — a click on a callsign there opens nothing; the scenario only asked to record whether
  it names his Tracker course, which this change cannot alter.
- Smaller: S9's Import on a phone (Export on a phone was walked in S19), S14 by the bell, S8's wait past idle (3.5 s).
  Phone S15, S16 and S18 ran in Chromium touch at the phone's size (WebKit has no network throttle).

**Readings that are as built, not faults:** a moved ball saves itself, so Logout asks only about typed structure edits;
Show All edits and typed event details are not undoable (`ui-contracts.md`); Edit Schedule binds no Ctrl+Z of its own;
Show All, Legend and flex settings sit under a scrim that covers the top bar while open.

**Seen in passing (older, not this change's):** with the browser's storage locked (S4) the Tracker's corner says "● saved"
though nothing will be kept after a reload — the app's own top bar says nothing either. Same before this change (the
storage target was the memory store then too). Filed for the coordinator to file. The sideways phone's cut dropdown words:
D1564 (the test browser's drawing).

## 7. The break tests

Each wire broken in the source, the test file that should catch it run, the file put back (the runner kept in the
scratch folder; each break a one-line swap).

| Break | Caught by | Result |
|---|---|---|
| B1 the boot does not plug the Tracker's door | `storage.test.ts` (the real boot; the boot body's order) | RED |
| B2 the no-target path writes the browser's storage under `ocu:` again | `storage.test.ts` | RED |
| B3 the no-target path reads an old `ocu:` key | `storage.test.ts` | RED |
| B4 unplugging keeps the memory from before | `storage.test.ts` | RED |
| B5 `main.tsx` does not hand the saver to the Tracker | — first run: **GREEN, no test caught it** (`storage.test.ts`, `trk-batch-store.test.ts`) | a wire with no test → a test added (`storage.test.ts`, "main.tsx hands the saver … to the Tracker's doorway"); RED with the line out, green with it in |
| B6 the Tracker's bar draws its own pair again | `tracker.test.tsx` (2 tests) | RED |
| B7 the top bar leaves the Tracker's pair out | `topbar-pair.test.tsx`, `tracker.test.tsx` | RED |
| B8 + Add offers the roster picker with nobody on it | `tracker.test.tsx` (the no-roster prompt, and 30 more that add a typed student) | RED |

The walk (S6–S8) proved the corner's wiring on screen; B5 shows nothing else did between walks.

## 8. The read

One fresh, blind Opus reader (D790, D1594), handed the diff (c7ddf441b..29d3044a3), the rulings swept, the roll-call, the
sizing and the walk; brief `parts/trk1105/reader-brief.md`; its report `parts/trk1105/read-opus.md`. 238,174 tokens.

**Verdict: no route in the running app reaches the doorway with no target plugged in, or after an unplug** — one entry
and one boot, the plug unconditional on every backend, the boot's Tracker conversion going through its own row door and
not the doorway, `core.js` loaded only in the lazy page chunk after the boot (the desktop pre-warm included), nothing
unplugging it. The rename is the same function handed the same saver at the same moment; nothing reads the removed
names in `src`, `scripts`, `e2e` or `probes`; no test weakened (the memory fallback behaves as the whiteboard: the
value as written, `null` when missing, keys in insertion order, each test file its own).

| # | Grade | Finding | Disposition |
|---|---|---|---|
| L1 | LOW | `docs/feature-impact.md` still named `useSaveHealth` | fixed (the name) |
| L2 | LOW | the leftovers kept on purpose (the Tracker's own glyph and pencil drawings, its colour copies) live only in `known-gaps.md`; once [TRK-STANDALONE-LEFTOVERS] is archived they have no backlog item | for the coordinator to file in `OUTSTANDING.md` before the item is archived (this chat may not edit it) |

**Roll-call:** nothing missing that changes the result; two safe rows it would add to §3 A — the boot's Tracker
conversion (`tracker/fold.ts`, through `app/rows.js`, never the doorway) and the desktop pre-warm of the Tracker's page
(a `Shell.tsx` effect, after the boot). Added here, both "must not reach it before the plug: it cannot — YES, because …".

**The tidiness note (filed, not fixed — D489):** the "nobody signed in" phrase repeated in four `core.js` comments, two
of them with a dash never closed (the two broken sentences were put right — comment punctuation only; the repetition
stays); `storage.js` says the boot plugs the door "before anything else" — other boot steps run first, nothing reaches
the door before it; `core.js`'s "local only" save word was for a browser with no storage, now reached only by a target
whose save fails; two kinds of test read source as text (the pair over `Shell.tsx`; `main.tsx` / `boot.ts`) and a
harmless reformat would turn them red; a thought: the memory fallback could warn the first time it is written outside a
test.

## 9. Fixes and the re-walk

- **B5's missing test** — added red-first (§7). Test only; nothing on screen.
- **L1** — the stale name in `feature-impact.md`. Words only.
- **Two comment sentences in `core.js`** (the tidiness note's unclosed dash). Comment punctuation only.

No fix touched logic or anything a person sees, so no narrow read (the order's §5 "a fix is new code" asks one only for a
fix that rewrites logic) and no re-walk: the walk's build (58f66b7b1) and the final code differ by one test, one document
line and four comment lines (`git diff 58f66b7b1..HEAD -- raptor-port/src`).

## 10. Gates, documents, and what was not walked

- **GitHub's run of 58f66b7b1** (the walked build): Deploy (the full gate set), Docs guard and Secrets scan all
  success. The run of the last pushed commit: the closing report says.
- **On his PC** (phase A, the code as walked): the Tracker's and the seams' unit tests 824 / 824; `npm run build` PASS;
  `npm run smoke:tracker` 453 / 0; `npm run lint:changed` no new finding; React Doctor 583 → 572, the Tracker's 11 → 0.
  After the fixes: `storage.test.ts` and `trk-legend.test.tsx` 15 / 15; `lint:changed` no new finding.
- **What was not walked:** §6 — S10's empty screen (no control reaches it), S16 on a phone, S19's person window, and the
  smaller gaps named there; each with its reason. Carried by tests instead: the no-target memory path, the no-roster +
  Add prompt, D463.
- `Docs: OUTSTANDING 148 items (+0 −0) · DECISIONS D1–D1644 · homes OK`
- `docsize: OVER by 158, deferred (D29)` — `.claude/rules/decisions/tracker.md` is 158 bytes over its tripwire after
  the coordinator's correction of its §Architecture; a code change is never the place to trim (D29).

**Walk: docs/handpass/2026-11-05-tracker-tidy.md · 211 pictures · 9 surfaces · 19 orders · MISSING: 1 fixed (B5's wire, a test red first), 0 ruled, 1 filed (L2, by the coordinator)**
