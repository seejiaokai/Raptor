# `[TRK-SMOKE-ADD-RACE]` — the Tracker's question box lost typed names (25 Sep 26, D190)

Branch `claude/trk-smoke-add-race-bug-007eed`. His go: D190 (`.claude/rules/decisions/tracker.md`) — find out
whether the app itself loses the typed name, and fix the cause, not the wait. Pictures:
`docs/img/handpass/2026-09-25-trk-add-race/` (`old-*` = the code before the fix, `fix-*` = after). The walk:
`scripts/handpass/trk-add-race-walk.mjs` — written as assertions of the right behaviour, so the same script on the
old build shows the defect and on the fixed build is the re-walk.

## 1. The answer

**A real bug in the app, not a slow test.** The Tracker's one question box (every question it asks: add a
student, add or rename a course, rename a student or a syllabus, a new event's name, an imported chart's name)
moves the cursor a beat (30ms) after it opens — into the roster search when "+ Add" lists the squadron roster,
otherwise into the text box with its text selected. On a busy machine that beat lands late, after someone has
already put the cursor in the text box and started typing. The old code then:

- on "+ Add" with the roster, **moved the cursor to the search box** — the rest of the name went into the search,
  and OK added nobody (or a cut-off name like "SMO");
- on every other question, **selected what had been typed**, so the next key wiped the first letters (a course
  saved as "KE ADDCOURSE", an import brought in as "ke import").

**The fix** (`src/tracker/components/Modals.jsx`, `DlgModal`): the late move stands down when the cursor is
already in one of the box's typing fields. From anywhere else — the button that opened the box, a button inside
it, nowhere — it moves the cursor exactly as before. Contract: `docs/ui-contracts.md` §The Tracker tab, "The
question box never takes a cursor it already has".

## 2. How it was found

1. **GitHub's logs** (two of the three 25 Sep 26 stops downloaded; the third would not download, and he reported
   the same step). Both: `the syllabus picker offers Tx 2026` passed, then 31.9s later `page.click` timed out
   waiting for `#popEditInfo` (smoke.mjs line 3079). 31.9s = the 0.8s pause + opening the box + the 0.6s pause +
   the 0.3s pause + the 30s timeout — so the "+ Add" branch DID run and OK WAS pressed; nobody was on the chart
   when the ball was tapped, so the pop-up offered nothing to edit (the F9 rule: no student, no pop-up).
2. **The obvious reproduction failed.** The smoke suite up to that step, then the step itself ten times with the
   browser slowed 1x to 12x (CDP CPU throttling), instrumented: the name landed every time, within 0.6s of OK.
   A slow machine alone does not lose the name — slowing everything slows the timer and the test tool together.
3. **The mechanism, from the test tool's own source** (`playwright-core` 1.62.1, `_fill`): `fill` is TWO round
   trips — one page call that selects and focuses the box, then `Input.insertText`, which types into whatever
   holds the cursor at that moment. The box's 30ms timer can fire between them.
4. **Red first:** `tracker.test.tsx` — "a name typed into "Or type a callsign" before the box has settled stays
   there" — failed on the old code (the cursor ended in the search box), passes with the fix.
5. **The walk on the real build forced that order** — open, cursor in, first letters, all in one page step so they
   beat the timer every time (1–9ms after the press, measured), then the rest after it. The old build failed on
   all ten places; the fixed build passed all of them (§5).

**The two 24 Sep 26 stops were the same bug.** Both came at the smoke helper's own check that the typed name is in
the box before OK — the check that fails exactly when the letters went to the search instead.

## 3. The eight questions → WALK

| # | Question | Answer |
|---|---|---|
| 1 | Money / earned leave | NO — the Tracker holds training marks; no OIL, no leave |
| 2 | The published record | NO — nothing is published in the Tracker |
| 3 | Saved data | NO — the fix moves no data and changes no write; the add, rename and import paths are untouched |
| 4 | A shared drawer | **YES** — `DlgModal` is the one box every Tracker question uses |
| 5 | A new gesture or mode | NO |
| 6 | A new surface | NO |
| 7 | Roles | NO — the Tracker reads no role (D121) |
| 8 | The warning list | NO |

**Tier: WALK** (YES to 4 only). §4's trigger rule — a change on more than one surface — adds ONE other model's
read: Fable 5.1 (§8).

## 4. The rulings that apply

| Ruling | Holds? |
|---|---|
| D190 — the job: does the app lose the name; fix the cause, not the wait; port 4180; D190–D199; never the full checks while the D175 chat runs its own | Yes — the cause is in the app and fixed there; the checks ran on 4180 with the other chat idle |
| 9 Sep 26 — "+ Add" lists the roster ABOVE the text box, the search takes the cursor | Yes — unchanged when nobody is typing (the walk's "left" runs) |
| 9 Sep 26 — no roster (the standalone Tracker) = the old prompt, byte for byte | Yes — the box's markup is unchanged; only when the timer acts changes |
| 17 Sep 26 `[TRK-SMOKE]` — the reset happens during render; the cursor timer is armed once per open and survives a refresh | Yes — both kept; their two tests still pass |
| D87 — a test that fails on a slow machine waits on what it needs, not a fixed time | Yes — the Tx step now uses the `addStudent` helper, which checks the name landed and waits for the student to show |
| D121 — the Tracker reads no role | Untouched |
| D56 — a harm only in stored demo data is not a finding | Nothing here is of that kind — the old code hurt NEW typing |

No clash between rulings.

## 5. The roll-call — every place the box opens with a text field

Columns: **left** = nobody types; the cursor lands where it always did · **quick** = a quick typist on a busy
machine; the box keeps every letter · **→ OK** = what OK saved is what was typed · **phone** = walked at 390px ·
**same pixels** = what else is drawn there.

| Place | left (old → fix) | quick (old → fix) | → OK (old → fix) | phone | same pixels |
|---|---|---|---|---|---|
| + Add, the roster listed | search ✓ → ✓ | "Smo" in box, "ke add" in search ✗ → ✓ | nobody / wrong name ✗ → ✓ | YES, both | the search box and the roster list above the text box |
| + Add, test tool's own two steps | — | whole name in the search ✗ → ✓ | **nobody added** ✗ → ✓ (the smoke stop) | YES, both | as above |
| Rename a student (✎ on a chip) | text, name selected ✓ → ✓ | "ke renstu" ✗ → ✓ | ✗ → ✓ | YES, both | nothing else |
| + Add course | text ✓ → ✓ | "ke addcourse" ✗ → ✓ | saved "KE ADDCOURSE" ✗ → ✓ | NO — same box, same prompt path as rename a student (walked on the phone) | nothing else |
| Rename course | text, default selected ✓ → ✓ | ✗ → ✓ | ✗ → ✓ | NO — as above | nothing else |
| Duplicate syllabus | text, "Tx 2026 copy" selected ✓ → ✓ | ✗ → ✓ | ✗ → ✓ | NO — as above | nothing else |
| Add syllabus (empty) | text, "New syllabus" selected ✓ → ✓ | ✗ → ✓ | ✗ → ✓ | NO — as above | nothing else |
| Rename syllabus | text, default selected ✓ → ✓ | ✗ → ✓ | ✗ → ✓ | NO — as above | nothing else |
| New event name (+ Acad, Edit chart layout) | text ✓ → ✓ | "ke event" ✗ → ✓ | ✗ → ✓ | NO — as above | nothing else |
| Import → "Add as new" → the name | text, default selected ✓ → ✓ | ✗ → ✓ | "ke import" brought in ✗ → ✓ | NO — as above | nothing else |
| Import, chained by a REAL click on "Add as new" | cursor reaches the name box, default selected ✓ → ✓ | — | — | NO | the choice box it replaces |
| + Add with NO roster (the standalone Tracker) | NO — not reachable inside Raptor, which always hands the roster over; the same prompt path as the eight above, and its dialog shape is pinned by the "no roster" unit test | | | | |

Questions with no text field (confirm, alert, three-way choice) target no field — the timer does nothing there,
before and after. No blank cells; every MISSING is fixed.

**Totals:** old build 13 passed / 26 failed, fixed build 39 / 0; no page errors on either (both runs recorded in
`old-results.json` / `fix-results.json` beside the pictures).

## 6. Orders walked

Left alone → Cancel · quick typist → OK · the test tool's two steps with a busy machine's gap → OK · one question
straight into the next by a real mouse click (Import's "Add as new"). Each on the old and the fixed build.
**Found and corrected in the walk itself, not the app:** the first re-walk read four syllabus results as missing —
the picker writes a hand-made chart as "name ✎", so an exact match on the option text missed them; the app had
saved the right name (checked by hand). The walk now reads the app's own chart list.

## 7. Break tests

| Wire broken on purpose | Test that went red |
|---|---|
| B1 — the whole stand-down removed (the old behaviour) | "a name typed into "Or type a callsign" before the box has settled stays there" |
| B2 — only the "typing fields" half removed (any cursor inside the box holds the move off) | "only a cursor in one of the box's TYPING fields holds the late move off" |

Both restored byte for byte afterwards (compared with the saved fixed file).

## 8. Fable 5.1's read

One other model (§4's trigger rule), given the diff, the roll-call, the walk logs, the finder brief and the D56
exclusion; read-only, blind to nothing but the builder's reasoning. **Verdict: the fix is correct and complete; no
finding against the changed code.** Its explicit negatives, each checked by it: every place goes through the one
`_dlgShow` → `DlgModal` path; between two chained questions the box unmounts and remounts, so the stand-down never
leaves the cursor nowhere (the walk's real-click run agrees); the render-time reset and the refresh-proof timer of
17 Sep still hold; Escape and Ctrl+Z are unchanged; no background alert can land over an open question; the only
other late cursor move (the Find box, `Header.jsx`) has nothing to steal from; the smoke change strengthens rather
than weakens; both tests are honest and leave no state behind.

Three OLDER findings nearby, none caused by this change — dispositions:

| # | Finding | Reproduced? | Disposition |
|---|---|---|---|
| F1 (medium) | On "+ Add" the cursor starts in the roster search by design; a callsign NOT on the roster typed there shows "Nobody on the roster matches", and OK adds nobody, silently | **Yes** — the real fixed build, `fable-f1-search-typed.png` (the roster unchanged after OK, no message) | Filed `[TRK-ADD-SEARCH-OK]` — what OK should do there is his product call (add the name / refuse and point to the box below / leave it) |
| F2 (low) | A second question opened over an open one (Tab to a control behind the shade, then Enter) replaces it, and the first one's job waits forever | Not reproduced — read from the code (`_dlgShow` overwrites the waiting answer) | Filed `[TRK-DLG-LEFTOVERS]` item 1, with Fable's fix and test |
| F3 (low) | Enter pressed while a phone keyboard is still composing a word submits the half-typed text | Not reproduced — needs an input method; callsigns are Latin | Filed `[TRK-DLG-LEFTOVERS]` item 2, with Fable's fix and test |

## 9. What was NOT walked, and why

- **A real phone.** The walk used Chromium's phone emulation (390×844, touch). The fix is a cursor check with
  nothing engine-specific in it; it goes on his look card for his iPhone.
- **A real busy moment.** The walk FORCES the order (typing before the late move) rather than waiting for a
  genuinely slow moment — that is what makes it repeatable. For a person it takes a busy moment on the phone right
  as the box opens: rare, but when it happened the name came out wrong with no warning.
- **Typing through an input method that composes characters** (not used for callsigns).

## 10. The gates

One run, 25 Sep 26 20:06–20:18, on port 4180, with the D175 chat running nothing (checked first): unit
**5912 / 5912** (363 files — the 5910 before plus the two new tests) · build clean · the original app's checks
**728 / 0** · browser layout **471 passed**, 48 skipped · Tracker smoke **442 / 0** · rulecheck OK. The browser
layout run was pointed at 4180 (`E2E_PORT`) because another checkout's preview held 4173, and the suite would
otherwise have REUSED it and tested that bundle.

## 11. His look card

1. On his phone, Tracker → Tx 2026 → Info → **+ Add**: tap straight into "Or type a callsign" and type a name
   quickly — every letter stays in that box, and OK adds exactly that name.
2. **+ Add** and wait: the cursor still goes to the roster search by itself, as it always did.
3. Rename a course or a syllabus: the old name is selected when the box opens, so typing replaces it.
