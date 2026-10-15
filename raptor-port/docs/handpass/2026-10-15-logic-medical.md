# Bug check — the Medical tab's one row (`[MEDICAL-ONE-ROW]`, D927) and the Logic page rewritten (`[LOGIC-PAGE-LAYOUT]`, D928–D933)

Branch `claude/one-row-guide-medical`. Built 15–16 Oct 26 by Opus, checked as ONE batch (D485): the tier is the higher of
the two. The Logic page's every line read by one fresh Opus reader before the build (D928), all its findings taken; the
finished code read by one fresh, blind Opus reader (D790; no Fable — D903). Quals' one row (D926) and its paragraph
(D930) are DRAWN, not built — they wait on his two answers (https://claude.ai/artifact/QZqDmvnF4esm4zaixiNgTA).
Unattended from his message of 15 Oct 26 (D934).

## Questions waiting for him
**ANSWERED 16 Oct 26 — "1-4 as recommended" (D935 for 1 and 2, D936 for 3 and 4).**
1. **Quals' one row** — build as drawn (the date box that does nothing removed, every control at 36, "Export" on a
   phone)? Recommended: yes. Waits: the Quals build.
2. **Quals' paragraph you circled** — delete all of it (two of its three links do nothing)? Recommended: yes.
3. **Logic, a passing note to delete (D850, never deleted unasked):** typing a value while editing raises "Crew rest →
   11h" at the foot, though the row itself now shows the new value with "Standard 12h · Reset". Recommended: delete it.
   Picture: `docs/img/handpass/2026-10-15-logic-medical/phone-logic-editing.png` (the note at the foot).
4. **Logic on a phone: "Reset all"** — while editing, at 480 wide or less, "Reset to standard" reads "Reset all" so the
   row stays one row (the guide §3's shorter-words fix, D910's pattern; the guide says such words are drawn for him).
   Recommended: keep. Picture: `phone-logic-editing.png`, `narrow-logic-editing.png`.

## 1. The tier — the eight questions (the order's §5)
1. Money (OIL is owed): **NO** — no OIL is worked out, credited or saved differently; the Logic page only describes it.
2. The published record: **NO**. 3. Saved data: **NO** — the one new writer (a setting's own Reset) writes the same
   settings record through the same `rulesSave` as an edit; it is tested on what it saved (logic.test "one setting's own
   Reset"). 4. A shared drawer: **NO**. 5. A new gesture or mode: **YES** — the Filter menu, a setting's own Reset, the
   value as the door to a calendar's settings, the folds. 6. A new surface: **YES** — the Logic page rebuilt. 7. Roles:
   **NO** — who may edit is unchanged (`isAdmin`, `lgCanEdit`; `perms.ts` untouched); a member's face walked.
   8. The warning list: **NO** — no warning's words or rule changed; the page quotes their names (`WCODE`).
   → **WALK.**

## 2. The roll-call
**The Medical tab's row** (one surface; drawn once, `MedicalView.tsx`):
| Place | No heading | As-of at 36 | Today at 36, one row | A finger's 44 (phone) | What else on the pixels |
|---|---|---|---|---|---|
| Inputs page → Medical tab, phone 390 | YES (e2e D927, unit D927) | YES (e2e) | YES (e2e) | YES (e2e) | the as-of picker hangs below — walked (W-M) |
| the same, desktop 1280 | YES | YES | YES | n/a, a mouse | the same |
| Medical opened any other way | NONE — the tab is its only door since D626 (`InputsPage.tsx`, the one caller) | | | | |

**The Logic page — every action the old page gave, and where it is now** (the order §6, a change that replaces controls):
| Old action / text | Now | Proof |
|---|---|---|
| Search box | the same box, in the one row; searches both parts | walk; logic.test "search narrows both parts" |
| Chips All / Warnings / Advisories / Notes / Fired this week | one Filter button and its menu, the count on "Fired this week (N)"; the button reads the picked filter | walk W-L3; logic.test filter, menu outside-press / Escape |
| ✎ Edit rules / Done | ✎ Edit / Done (the mock-up's words) | walk; e2e D561, insights |
| Reset to standard | the same, in the row ("Reset all" on a phone ≤ 480) | walk; e2e D561 at 320 |
| A changed value's "standard X" and "changed" tags | "Standard X" under the row, and its own Reset while editing | walk W-L4; logic.test (screen and saved copy) |
| Each rule's tier tag, code name, engine text, "fired N×" | the tier's dot (and its word for a screen reader); the rest gone (D928) | logic.test "no engine names" |
| The count line | gone (D928, the mock-up); its fired count on the filter | — |
| The Insights box above the rules | a Settings row, the same switch `#lgMissionMix` | e2e insights (phone and desktop); mission-role-offer.test |
| "Inputs/SANS calendar settings…" buttons (admin) | the value itself is the button (the mock-up's "›") | walk W-L5; logicdoors.test; e2e inputs-calendar gear |
| Two boxes for one setting (step; the report lead) | one box each (D928 — the duplicates) | logic.test "ONE box now" |
| The absence-type list (each input kind and what it closes) | not on Logic: the Inputs page's "?" legend keeps it, from the same sentence | inputs.test's own guard |
| The SC MAIN clash grading | a Settings row of six, each Warning / Advisory | logic.test clash toggles |
| The amber strip | kept, its untrue line corrected (D928): "A published day keeps its printed B and its OIL…" | logic.test W2 |
| What stood below the old rows | nothing placed against the screen; the calendars' settings windows open as before | walk W-L5 |

## 3. Sizing the walk (D607)
1. **Type:** B (the Logic page rebuilt), C (the Filter menu, a row's own Reset, the value as a door, the folds), E (the
   Medical row's height). 2. **What only a walk finds:** the one row's fit at 390, 320 and a desktop, with Done and Reset
   showing; the menu inside the screen; a fold opened by a finger; a changed value's marks and the strip on screen; the
   door opening its window; a member's face; the Medical row's measured height. The words' truth is the fresh read's;
   the numbers' liveness is a test's (D932). 3. **The ledger:** B/C walks find something most times; the last E walk
   (Inputs toolbar, D910) found its fit only at the narrowest phone. 4. **Chosen:** the host alone, one script on the
   built app (`scripts/handpass/logic-page-walk.mjs`, assertions of the right behaviour, phone by touch, desktop by
   mouse, plus 320 and a member), and the Medical row by its browser test at 390 and 1280 plus pictures; the D932
   liveness of every number carried by logic.test (it moves every setting through the engine object the page reads —
   the walk proves the same route on screen for crew rest). 5. **Its row:** added to the ledger.

## 4. The walk
`scripts/handpass/logic-page-walk.mjs` on the built bundle: **23 of 23 PASS** (re-run after every change since; the last
run after the folds became key points). Pictures `docs/img/handpass/2026-10-15-logic-medical/`:
`phone-logic-top`, `phone-logic-checks-fold`, `phone-logic-filter-menu`, `phone-logic-warnings`, `phone-logic-editing`,
`narrow-logic-editing`, `phone-logic-member`, the same six for the desktop (`desk-…`), and the Medical tab's
`phone-medical-row`, `phone-medical-row-today`, `desk-medical-row`, `desk-medical-row-today` (`medical-row-walk.mjs`, 9/9). Opened and looked at by the
host: the row, the fold, the editing face.
**Found by the walk and fixed:** at 320 wide, editing with a value changed, Done and "Reset to standard" squeezed the
search to nothing (e2e D561 red) — fixed by the shorter words on a phone (question 4). **Found by the host's look and
fixed:** the folds read as walls of text (now key points, one a line — D930, D933); "against them" for one setting.
**Found by a test and fixed:** a stray "+" printed NaN and 0 into every check row — the guard now in logic.test.

## 5. Break tests
| Wire broken on purpose | Went red |
|---|---|
| The crew-rest line's number typed as "12h" instead of read from the setting | logic.test D932 ("crewRest's standard 12h is still written") |
| The Medical heading put back (the test written first) | medicalview.test D927 |
| Reset to standard's words at 320 (before the fix) | e2e geometry D561 at 320 |

## 6. Gates
The whole set under the lock (`gatelock.mjs run`, 15–16 Oct 26, on the code before the read's fixes): **build PASS · tfin
728/0 · e2e 822 passed · Tracker smoke 446/0 · rulecheck PASS · docsize PASS** · unit **11,495 passed, 2 failed** — both
in `src/tracker/tracker.test.tsx` ("a grade is dated the day it is pressed…", "re-dating one failure…"): the run crossed
midnight, the test read today as 15 Oct and the app stamped 16 Oct; the file alone after: **79/79**. Not this job's
(nothing of the Tracker touched) — filed as `[TRK-TEST-MIDNIGHT]`. After the read's fixes (D902 — a small follow-up after
the whole set): the touched unit files **145/145** and **55/55**, the touched browser tests **17/17** (D561 at four
widths, D927 at two, Insights, the Inputs gear, the report lead), both walks re-run on the fixed build: **Logic 23/23,
Medical 9/9**. GitHub's run of the pull request is the full check after the push.

## 7. The code read
One fresh, blind Opus reader of the finished code (D790), given the old page to compare: **no high-severity finding;
nothing touches saved data or permissions; every old action has a new home; every string escaped.** Its four, all
taken, each with a test where it is behaviour: (1) the Insights switch lost the keyboard when flipped, and only its
knob answered — now a label, the keyboard put back; fixing it found its On / Off did not redraw (now it does; test);
(2) a row's Reset pressed while its box held a half-typed value did nothing at first, and the keyboard fell to the
page's foot — the press no longer blurs the box, the keyboard lands on the row's box, each Reset names its setting to a
screen reader (test); (3) stale sentences — the settled scheduler entries on the kind notes and the type matrix, a
comment in `inputs.ts`, `ui-contracts.md`, the IT flow guide's words, a test comment — corrected; (4) the OIL fold named
"the nominal report": now "Report before take-off". The last round; the fixes are small and each is tested — no
further read.

## 8. Not walked, and why
- The Quals row and paragraph: not built (questions 1, 2).
- The RULES MODIFIED stamp on the week: unchanged code; its tests (logic.test W2, "the stamp does not need the Logic
  page") ran green.
