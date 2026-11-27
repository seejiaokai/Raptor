# Section 1 (the guard rail), step K10-a — the builder's report (chat A211's helper, 28 Nov 26)

Brief: `2026-11-28-msq-s1-k10a-brief.md`. Plan: `../plans/2026-11-28-msq-s1-k10-root-plan.md` (round 2), its §8 row
K10-a and §7.1. Working copy `a211-s1-kr-dd0560`, branch `a211-s1`. **Nothing committed or pushed.** The root itself is
still OFF: no window's held answer changed (the Input window file was not touched).

## What was built

| File | Change |
|---|---|
| `src/state/inputsqn.ts` | **`holderOf(r, today)`** — the squadron holding a one-man record now, only where a move of his carried it, else null (§2.1: settle day — an open downchit today; a closed one its own upchit's filing day; an upchit its own day, never carried; anything else its last day; the holder is his squadron on the earlier of today and the settle day, returned only where it differs from the first day's squadron). The episode's own closing upchit (§1 row 1d, R3): the earliest upchit of his dated on or after the episode's last end and before his next separate episode, filed by today; none and a later separate downchit → replaced, null (row 1c, R2). **`filedOn(r)`** — the filing day: `at`, else a `mod` that is a date, else its own first day (D56). **`isOpenMedical(r, today)`** — the "open" column (H4 reads it). **`lifeOf(r, today)`** (§2.2). **`inputSqn`** holder-first. **`letOpenOn` case 2** narrowed to K9's `aheadAt`. **`letReadOnly(r, page, pid)`** cases 3 and 4 (§4.3). **`foreignInput(r)`** — the window's `foreign` test, copied by name (below). **`INPUT_DOORS`**: `docview`'s why, a new `medtab` row. The head comment, with §2.4's restated rule word for word. Nothing in `src/engine/` changed. |
| `src/ui/MedicalView.tsx` | Upchit Complete lists an upchit by the roster on its **filing day** (`filedOn`), not the "as of" day (D2846, R1, R10). Down and Pending unchanged. No word on screen added or changed. |
| `src/ui/msq-guard-input-sqn.test.tsx` | FIND-1 and FIND-2 re-pointed and renamed (below); `bornHeld()` also counts `letReadOnly` (the root's stands-on `let ?? (ro ? at : unit)`, §4.2 item 1), asked optionally so the old code fails by its answer, never by a missing function; new: H1 ×8, H2, H3, H4, H5 ×2, H6 ×2, H7 ×5, M1 ×3, M2 ×4. |
| `src/ui/medicalview.test.tsx` | Two tests: a one-squadron pin that every kind of stored upchit (no `at` and a `mod` of "now"; a dated `mod`; an `at`) still lists; `filedOn`'s three readings. |
| `src/engine/inputs-readers.test.ts`, `src/engine/inputsfor-readers.test.ts` | **Outside the brief's file list — for the orchestrator to accept or undo.** One line each registering `state/inputsqn.ts` as a reader of the whole inputs list (RECORDS; allowed 2, with its reason). The plan builds `holderOf` from `INPUTS` (§2.1 names it); these two guards fail any new file that reads the list until it is registered, by design. No assertion changed. |

**`foreign` — copied, not exported from the window (the brief left it to me).** The K10 root patch's first window hunk
has the window's import lines from `state/auth` and `state/perms` as context. Moving the predicate out would make
`adminOfUnit` an unused import there and force a change inside that context, so the patch would no longer apply "as it
is" at K10-d (§4.1). So `foreignInput` is the same body, copied by name into `state/inputsqn.ts`, its comment saying so;
the window is unchanged. **K10-d: make the window import `foreignInput` and delete its own copy** (FIND-1's Kestrel test
asserts the window's read-only look and `foreignInput` agree on her case).

## Tests — seen failing first (the patch method)

`git diff -- src/state/inputsqn.ts src/ui/MedicalView.tsx > k10a-src.patch` → `git checkout --` both → the two test files
run (`red2.txt`) → `git apply` → both files compared byte for byte with kept copies: **equal**. Never `git stash`.
On the old code: **26 failed, 63 passed, 1 to-do**.

| Test | Seen failing on the old code — why |
|---|---|
| H1 (all 8 — pending OML moved once, twice, back to 142; closed by 149's upchit; upchit dated 17 filed 10; replaced episode; Ranger's leave kept after a move on, or back) | yes — no such export (`holderOf` / `filedOn` is not a function) |
| H2 (pin by §7.1) | fails on the old code only by absence (`holderOf` is not a function); passes now |
| H3 | yes — Nasty's OML on 142's page: 142, not 149 |
| H4 (pin by §7.1) | fails on the old code only by absence (`isOpenMedical`); passes now |
| H5 ×2 (pins by §7.1) | **pass on the old code** (engine readers unchanged; no engine, Leave War or `perms.ts` file imports `state/inputsqn.ts`) |
| H6 — a moved master admin's old duty on his new home page | yes — let (149), not null |
| H7 ×5 | yes — 4 by absence (`lifeOf` / `letReadOnly`); "moved twice" by its premise: the OML read 142, not its holder 150 |
| M1 — upchit filed before the move | yes — as of 17 Jul it stood on 149's tab, not 142's |
| M1 — backdated certificate filed after the move | yes — as of 15 Jul it stood on 142's tab |
| M2 — moved / moved twice / moved ahead | yes — finding 1's state: "142's input on 149's page", born held |
| FIND-1 (Saber) | yes — the note's squadron 142, not 149 |
| FIND-1 (Kestrel, then her Upchit) | yes — born held on 149's page |
| FIND-2 | yes — not read only (no `letReadOnly`), so born held |
| medicalview — `filedOn`'s three readings | yes — no such export |

**New tests that pass on the old code (pins), beyond those §7.1 calls pins:**
- H6 "K0's settlement unchanged by the narrowing: Saber, home 142, a move to 149 saved for 1 Dec — his leave of 5 Dec on his 142 home page → 142"
- M1 "…one filed after the move: Kestrel's, filed on 17 Jul dated 17 Jul — on 149's tab only, as of 17 Jul"
- M2 "Nasty unmoved (today 15 Jul): 142's, 149's and 150's tabs as of 13, 15 and 17 Jul"
- medicalview "D2846 (pin) Upchit Complete by the filing day: an upchit with no saved-at moment and a `mod` that is no date (yeti's), one with a dated `mod` and one with a saved-at moment all still list"

**Re-points (renamed, nothing dropped but each finding's last line):**
- "FINDING — "Edit input" in the document viewer, from the Medical tab…" → "FIND-1 — D2834/D2845: … opens it as 149's, its note's answers live". Every step kept; the last assertion was `bornHeld() === "u142's input on u149's page"`, now `inputSqn` gives 149, `bornHeld() === ''` and the window is live. A second test added for Kestrel (read only, then her Upchit dated Thu 16 Jul: saved, 149's, Nasty off Pending — on the tab and in the engine's own list).
- "FINDING — a bell line whose squadron is no longer the input's…" → "FIND-2 — D2835, the View-only presser: …". Every step kept; the last assertion was "born held", now: still 150's, `letReadOnly` true on 149, not born held.

## Checks (all from `raptor-port/`)

| Command | Result |
|---|---|
| `npx vitest run` my four test files `--maxWorkers=4` (`final.txt`) | **PASS** — 4 files, 99 passed, 1 to-do, exit 0 |
| `npx vitest run` 16 files by name — every test file naming `inputSqn`, `letOpenOn`, `listReach`, `INPUT_DOORS` or the Medical tab (8, by `grep -l`), plus `docviewer`, `upconfirm`, `medmove`, `msq-night-held-input`, `msq-pick-windows`, `msq-pick-swap-question`, `msq-guard-doors-switch`, `msq-guard-drops` (`green.txt`) | 12 files passed. Failing: KR's `msq-guard-drops` (58) and `msq-guard-rollcall` R10 (1) — red by design; **the same 59 failures, line for line, on the old code** (`kr-old.txt`, by the patch method) — and the two reader guards above, fixed since and re-run green. The same 3 unhandled `elementFromPoint` errors from the Leave War's select timer appear with and without my change |
| `msq-guard-open.test.tsx` | not run — it names none of the four (grep), as the brief allows |
| `npm run lint:changed` | 4 findings, none in my files: the 3 known `ui/UsersPanel.tsx` ones and `test-support/msq-guard-drops-kit.ts:143` (KR's, not mine) |
| `npm run build` (lock taken, released at once) | **PASS** (exit 0) |
| `npm run docsize` (after this report was written) | **PASS** — "every record accounted for" (it also prints "OVER by 357, deferred (D29)", a size line; I did not check whether it stood before this report) |

## Open items

- The two reader-guard lines outside the brief's file list (above) — accept or undo.
- K10-d: the window imports `foreignInput` and drops its copy.
- **A ripple, nothing broken:** `inputSqn` is also asked by the two door callers (`ui/OilDayList.tsx` card, `ui/topstate.ts` bell OIL tap). For a carried record they now enter its holder. The OIL-question records (duties, commitments) carried are R6's "across the move" ones, whose holder is the squadron their days already touch; F1, F5 and §5.5 stay green.
- H2 has no seeded sign-in for Nasty: the test gives him one through Admin → Users' own add (`addAccount`).
- Upchit Complete when an upchit's filing day falls after the "as of" day (a certificate filed later, viewed as of before): it lists by the filing day's roster though it was not yet filed on that day. The tab has always shown stored records as of a day, never their filing history; not changed.
- `docs/file-map.md` (`filedOn`, `holderOf`, `lifeOf`, `letReadOnly`, `foreignInput`, the `medtab` row) — K10-e's.

## For the walk's scenario designers — what only a browser can show

- First move the "as of" day, or the Upchit's date, past the move: the tab and the viewer's Upchit start on 13 Jul 2026, while moves run on the clock (plan §13).
- 149's Medical tab, a moved man's pending OML: the card, the viewer, "Edit input" — live for Saber; read only for Kestrel; her "Upchit" dated after the move closes it and the card leaves Pending.
- 142's tab as of a day before the move, and 149's between two moves: the card still there (the window's read-only look waits for K10-d and Q1).
- Upchit Complete: one filed before the move on 142's tab only; a backdated one filed after it on 149's only, whatever the "as of".
- Every card and pager page of every section, on a desktop and his iPhone, after K10-d: none opens greyed.

## Rulings

Rulings: none this session (a builder helper; no message from him).

```
Status: READY FOR INDEPENDENT REVIEW
Changes: state/inputsqn.ts (holderOf, filedOn, isOpenMedical, lifeOf, inputSqn holder-first, letOpenOn case 2 narrowed, letReadOnly, foreignInput copied by name, INPUT_DOORS docview/medtab, head comment); ui/MedicalView.tsx (Upchit Complete by filing day); tests in ui/msq-guard-input-sqn.test.tsx and ui/medicalview.test.tsx; one registration line each in engine/inputs-readers.test.ts and engine/inputsfor-readers.test.ts (outside the brief's list)
Checks: raptor-port/ — my 4 test files PASS (99/1 to-do); 16 files by name: 12 pass, KR's 59 red-by-design failures identical before and after; lint:changed no new finding of mine; npm run build PASS under the lock; msq-guard-open NOT RUN (names none)
Open items: the two guard lines to accept; K10-d to import foreignInput; file-map (K10-e)
```
