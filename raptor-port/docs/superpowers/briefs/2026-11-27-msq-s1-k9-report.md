# Section 1 (the guard rail), step K9 — Part F's list and doors, and what the Inputs pages offer on another squadron: the builder's report (chat 204's helper, 27 Nov 26)

Brief: `2026-11-27-msq-s1-k9-brief.md` (K4's brief where it is silent). Branch `claude/msq-s1-guard-6ae5e1`, working copy
`lw-balances-hover-275293`, built on `15275d03b`. Nothing committed or pushed; `HANDOFF.md`, the plan and `OUTSTANDING.md`
not touched. Not touched: `ui/UsersPanel.tsx`, `ui/AdminPage.tsx`, `storage/`, the root (`InputWindow.tsx`'s note, `held`,
`swapOn` — K10), `letOpenOn` (K10). No word written beyond the drawn and seen ones ("Pick…", "Pick at least one person",
"150 has no SANS aircrew.").

**In one line: with another squadron picked, the Inputs page and its calendar no longer list his own inputs of a squadron
whose page he can still open (and a moved master admin's old ones follow the view he is in); the List's just-saved pin is
drawn only from the page's own list and dropped when the page's squadron changes; the OIL list's card and the bell's own OIL
tap bring the input's own squadron into view before its page and window (refused, or waiting for the Tracker's question or a
save, nothing opens); on another squadron's page "+ Input" opens on "Pick…" with that squadron's men only, and "+ Commitment"
opens on that squadron's first SANS man — greyed with "150 has no SANS aircrew." where it has none, a drag saying the same and
opening nothing; a document chosen on a held window is not stored.**

## FIRST — one place the brief and his ruling differ, and what I built (for the orchestrator's call)

**The brief (and §10 step 7, §5.1) say the reach test is "handed in only where the page's squadron is not his home that
day". His D2729 Q8 (26 Nov, "as recommended" on the section page's Q8) says a moved master admin's old inputs, in the admin
view, are "on 142's Inputs page, where 142's other inputs are", and listed on his own 149 page only once he presses his badge
for the member view. Built by the brief's letter, Saber — moved 142 → 149, home 149 — would see his old 142 duty on his 149
home page in BOTH views (no reach test is handed in on the home page), so F15's admin half ("on 142's page only") cannot pass
and the list would not "follow the view he is in".**

What I built (`state/inputsqn.ts listReach`, the builder's reading — easy to undo): the reach test is handed in on every page,
and **on his home page it leaves out only a squadron he is moving to** — a squadron that is his home on a day of the input
after today (a move saved ahead). So:
- F18 (Fable 5's case) stays green: Saber / Hunter, home 142, a move to 149 saved for 1 Dec, leave filed for 5 Dec on 142's
  page — listed on 142's page (and on 149's, where it touches 149).
- F15 holds both halves: the admin view, his old 142 duty off his 149 home page and on 142's; the member view, on his 149 page.
- Nobody else's home page changes: an input naming him that does not touch his home squadron exists only across a move.

If the orchestrator rules the brief's letter instead, the change is one line in `listReach` (return `undefined` where
`pageIsHome()`), and F15's admin half must then be re-pointed — that would set aside D2729 Q8, which is his to say.

## What changed, file by file

| File | Change |
|---|---|
| `state/inputsqn.ts` | **New.** `inputSqn(r, pageSqn)` — the input's own squadron (§5.2; no clause for who is named). `INPUT_DOORS` — the eleven saved-input doors of §5.5 with `home` (two built `home: true` here: `oilcard`, `belloil`; `bellline` already enters the line's squadron). `pageIsHome()` — the page's squadron is his home that day. `listReach()` — the reach test (above). `letOpenOn` is NOT here (K10's). File-map line for K12: "the input's own squadron (Part F): the doors' one answer `inputSqn`, the doors into the Input window `INPUT_DOORS`, the Inputs pages' list rule `listReach` and `pageIsHome` (the guard rail, step K9)". |
| `engine/inputs.ts` | `inputsListed(unit, pid, list?, reach?)` — a fourth argument: an input that does not touch the page and only names him is left out where `reach` says one of its squadrons is a page of his. No `reach`, as before. The behaviour change only, in the file's style. |
| `ui/InputsPage.tsx` | `inputsPageRows` hands in `listReach()`. The pins are drawn only from the page's own list (`pins.filter(r => listed.has(r))`), and an effect on `inputsPageUnit()` clears the pins and the reveal where the page's squadron changes (§5.1, Opus F-e). |
| `ui/InputsCal.tsx` | `calRows` hands in `listReach()` (the month, the opened day, the "hidden by a filter" line). The just-saved `savedId` needed no change: the page's reveal is cleared at a squadron change, which clears it (F7 answered: see below). |
| `ui/inputedit.tsx` | `newInputSeed`: `person: pageIsHome() ? me() : ''` — the four doors (the List's "+ Input", a calendar day's, a drag across days, "+ Medical") open on nobody on another squadron's page (§18.6). |
| `ui/InputWindow.tsx` | A new input's people start empty where its seed names nobody; Add with nobody picked says the app's own "Pick at least one person" (a warn note, the "Several people" save's words) and saves nothing; `DocField` takes `locked` (= `held`) and its file box returns before `docAdd` when set (§5.4, F11). |
| `ui/PeoplePick.tsx` | The one-person list draws `<option value="">Pick…</option>` while nobody is picked — as drawn on the section page's group 3. |
| `ui/OilDayList.tsx` | The card: `enterForLine(inputSqn(r, pageUnit('own')), again, 'card', { skip: ['oilday'] })` ahead of K6's page door; asked or refused → nothing; `again` presses the card again with the input found afresh. K6's pointer comment replaced. |
| `ui/topstate.ts` | `bellTap`'s OIL branch: `enterForLine(inputSqn(row, pageUnit('own')), () => bellTap(from), 'bell')` first; asked or refused → nothing; `'no'` → the window where he is, as before. K6's pointer comment replaced. |
| `ui/sansadd.ts` | `noSansAircrew(iso)` — "150 has no SANS aircrew." on another squadron's day with none, else null; `maySansAdd(iso)` false there (the day's button greys; the drag machine's `maySansAdd()` with no day still lets an admin drag, so the drag reaches the note); `openSansAdd` on another squadron opens on its first SANS man that day (else the first whose SANS date the run reaches), never the presser; with none, the passing note (`HOOKS.toast(…, 'warn')`, where the calendar says a refused drag) and nothing opens. The seed's tail moved into `openSeeded` (unchanged). |
| `ui/SansDay.tsx` | The grey reason under "+ Commitment" reads `noSansAircrew(iso)` first, then the reasons it had. |
| `ui/msq-guard-input-sqn.test.tsx` | F0, F1, F2, F3, F5, F7, F11, F13, F15, F16, F17 and an INPUT_DOORS test written (the K0 pins F14, F18, F19 untouched, green). The file's `afterEach` now also runs the testkit's teardown (the new tests draw the app). |
| `ui/msq-guard-g.test.tsx` | G11, G12. |
| `ui/msq-guard-rollcall.test.ts` | R5 (a)'s list gains the two new `enterForLine` callers (`ui/topstate.ts` bellTap, `ui/OilDayList.tsx` openInput). |

## Tests — seen failing first (the patch-file method, never `git stash`)

The ten source files' changes were set aside as `.tmp/k9.patch` (whole copies kept in `.tmp/k9-keep/`), the files checked
out, and `state/inputsqn.ts` replaced by a one-line stand-in whose `inputSqn` throws "not built" (the test file imports it
dynamically and the test runner refuses a missing file outright, which would have failed every test for the wrong reason).
Then the patch applied back and every file compared byte for byte with its kept copy: equal.

On the old code (`.tmp/k9-red.txt`, `.tmp/k9-red2.txt`):
- **Red, for the right reason (24):** F0 (inputSqn not built); F1 with 149 (stayed on 149); F2 (the duty's window opened over
  the open one); F3 (no question — the window opened at once); F5 ×3 (149 with the window; the window opened behind the
  change not saved; no question); F7 (his 142 OL's card in 149's day); F11 held (the file stored: 85 vs 84); F13 ×3 (his duty
  listed and drawn on 149, desktop and phone; the invariant — inputSqn not built after the list failed); F15 admin (listed on
  his 149 page); F16 (his own name offered on 149); F17 ×3 (the pinned duty drawn on 149's List, desktop, phone, after a bell
  line); G11 ×3 (the box read Hunter / Saber; no "Pick at least one person"); G12 ×2 (opened on Hunter; not greyed, no note);
  R5 (a) ×2 (the two new callers not yet in the source).
- **Passed on the old code, each a pin named so in its title:** F1 with 150 picked (the page door's landing, K6, already brought
  142 back — his own pages stay 142's while he only views 150); F11 on a live window; F15's member view (in the member view his
  own pages are his home's, where every input naming him was already listed); G11's two pins (Hunter on 142, Ranger with 149
  picked); G12's two pins (Hunter on 142; Hunter with 150 picked, his SANS calendar 142's). F14, F18, F19 stayed green.

**F7 answered (§5.4 asked it be found out):** on the old code the just-saved card DID follow him — his 142 OL showed in 149's
opened day — but by the list's rule (it was listed there), not by `savedId`. With the list's rule and the page's reveal cleared
at a squadron change it is gone; no `savedId` line was needed. F7 stays as the pin.

Not written, named: **F0's `letOpenOn` half** (`it.todo` — the root's alone, K10); **F5's member-view variant** (the plan's
"the landing's question up (the member view…)": in the member view the card's squadron is his own pages' and the road is
K6's page-door landing, already held by B27; F5 tests the new road — the admin view on 149, the Tracker's question from
`enterForLine`); **F1's "its Save writes 142's record"** (the window is asserted 142's and live under a bar reading 142; the OIL
answer's own save is unchanged code).

## Checks (all in `raptor-port/`)

| Command | Result |
|---|---|
| `npx vitest run src/ui/msq-guard-input-sqn.test.tsx src/ui/msq-guard-g.test.tsx src/ui/msq-guard-rollcall.test.ts` | **107 passed, 2 to-do**, exit 0 (`.tmp/k9-green1.txt`) |
| the batch: every `src/ui/*input*`, `*sans*`, `src/engine/inputs*` test, every `msq-guard-*` but `-open`, `edit-rights-readers`, the bell, document-field, medical, people-picker tests, `msq-inputscal-own-calendar`, `msq-night-held-input`, `msq-sqnlist-escape-over-input`, `reshape-inputs-own-lists` (62 files, `--maxWorkers=3`) | **62 files, 1627 passed, 8 to-do**, exit 0 (`.tmp/k9-batch1.txt`) |
| `npm run lint:changed` | the one known finding only (`ui/UsersPanel.tsx` high complexity — not K9's file); nothing new (`.tmp/k9-lint.txt`) |
| `npm test` — the full unit suite, under the checks lock (taken 09:50, released at its end) | **1146 of 1147 files, 17853 passed, 1 failed**, 5 expected fail, 20 skipped, 8 to-do, 1601 s (`.tmp/k9-full.txt`). The one red: `ui/msq-own-flyplan.test.tsx` "the control: a master admin's pick of 149 moves his own pages to 149's plan" — re-pointed below; that file again: **6 passed**, exit 0 (`.tmp/k9-flyplan.txt`). A "ReferenceError: window is not defined" line stands in the run's printed noise, outside any failed test (the run counts no unhandled error) |
| `npm run build` (typecheck + build), under the checks lock | **passed**, 492 modules, exit 0 (`.tmp/k9-build.txt`); lock taken and released round it |
| `npm run rulecheck` | **OK** (303 of 334 rulings named; it notes Q12 now covered and removable from its baseline — not this step's tests) |

`state/edit-rights-readers.test.ts` (the role-question count) is green: K9 adds no `isAdmin`, `canEditSched` or `mayEditSched`
call (`pageIsHome` and `listReach` read `pageUnit`, `myUnit` and `ownPageMayBe`; `sansadd.ts` keeps its one `isAdmin()`).

## An existing test re-pointed — old and new expectation

| Test | Old | New |
|---|---|---|
| `ui/msq-own-flyplan.test.tsx`, "the control: a master admin's pick of 149 moves his own pages to 149's plan" | Saber picks 149, `openSansAdd` on Wed 22 Jul returns true and seeds Fly (149 flies at night). 149 had no SANS man in that world, so the window opened on nobody | §18.7 (his D2628 C3): on another squadron's SANS calendar "+ Commitment" opens only on its own SANS aircrew, and with none opens nothing — so the test's premise gives 149 one SANS man (Osprey, the Quals SANS tick's mark), and asserts as before (`true`, Fly seeded) plus that the window opens on him. No assertion weakened or removed |

## Departures from the drawings

None found by a test: the Person box reads "Pick…" as its first, picked choice; Add with nobody picked raises "Pick at least
one person" as a warn note; "+ Commitment" is greyed with "150 has no SANS aircrew." as a line under it (the day's own
`sd-addwhy` note, where its other grey reasons stand); the drag's note is the calendar's own passing note in its warn look.
Not checked by eye (jsdom): sizes and places — K12.

## What only a browser can show (for K12)

- **"Pick…" in the Person box** on a desktop and his iPhone (the browser's own list), against `s1-input-empty-d/-p`.
- **"Pick at least one person"** at the foot on a desktop and at the top on a phone, against `s1-input-nobody-d/-p`.
- **The greyed "+ Commitment" with its reason under it**, against `e9-d-greyed-crop.png` / `e9-p-greyed-crop.png`.
- **The drag's passing note** on 150's SANS calendar, desktop and a phone (a finger held, then dragged), against
  `s1-sans-drag-d/-p`.
- **The card and the bell's OIL tap entering 142**: the squadron number's flash, then Inputs, then the window, in that order.
- **The List after a pick**: no just-saved row at 149's head, on a phone's day groups too.
- **The card's silent refusal** (K6's difference 1 still stands: the 'card' door has no words).

## Scenarios worth a walker's time

1. Hunter (Plan of 149) files his own weekend duty on 142, picks 149: the List, the month and a day opened show none of his
   142 inputs; "OIL?" nowhere; his input shared with a 149 man still shows. Taps the bell: 142, Inputs, the duty's window.
2. Hunter on 142's List with a Person filter on someone else, saves his own duty (pinned), picks 149: nothing of it there.
3. Hunter on 149 with an Input window open, taps the bell for his 142 duty: "…then press the bell again.", nothing opens.
4. Hunter on 149's Tracker with an unsaved chart edit, taps the bell: the question; Stay; tap again, Discard: 142 and the window.
5. Saber moved 142 → 149 (a master admin): his old 142 duty off his 149 page in the admin view, on 142's; his badge pressed:
   on his 149 page.
6. Hunter on 149: "+ Input" from the List, a day, a drag and "+ Medical" — "Pick…", 149's men only; Add with nobody picked.
7. Saber on 150's SANS calendar: "+ Commitment" greyed with its reason; a drag says it. Hunter (SANS) on 149's: opens on
   149's SANS man.
8. Ranger moved to 149, a window of his old 142 input open over midnight, then a document chosen: nothing stored.

## Rulings

Rulings: none this session (a builder helper; no message from him).

```
Status: READY FOR INDEPENDENT REVIEW (with one call for the orchestrator: the home-page reach test, above)
Changes: new state/inputsqn.ts (inputSqn, INPUT_DOORS, pageIsHome, listReach); engine/inputs.ts inputsListed's reach; ui/InputsPage.tsx (reach, pins from the page's list, cleared at a squadron change); ui/InputsCal.tsx (reach); ui/inputedit.tsx newInputSeed; ui/InputWindow.tsx (empty people, "Pick at least one person", DocField locked); ui/PeoplePick.tsx ("Pick…"); ui/OilDayList.tsx and ui/topstate.ts (the input's squadron first); ui/sansadd.ts, ui/SansDay.tsx (another squadron's SANS aircrew, the greyed button, the drag's note); tests in ui/msq-guard-input-sqn.test.tsx, ui/msq-guard-g.test.tsx, ui/msq-guard-rollcall.test.ts; one premise re-pointed in ui/msq-own-flyplan.test.tsx
Checks: listed above, in raptor-port/
Open items: the home-page reach test (D2729 Q8 against the brief's letter); F0's letOpenOn half and the root (K10); docs/file-map.md line for state/inputsqn.ts (K12); the 'card' door's words (K6's difference 1); the browser looks above (K12)
```
