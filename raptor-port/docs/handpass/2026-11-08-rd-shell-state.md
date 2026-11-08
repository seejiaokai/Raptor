# Bug check — React Doctor on the shell, the state and the windows, the night of 7–8 Nov 26 (job 2), branch `claude/rd-shell-state`

React Doctor's findings in the shell (`Shell.tsx`), the windows (`Modals.tsx` and the other windows' files), the state,
the storage, the command layer and undo (D1534), with [DOC-POINTERS-CODE] and [ONE-RULE-LEFTOVERS] (3). Nothing a person
sees was to change; a fix that would change a look or a word was left and listed. Pictures:
`docs/img/handpass/2026-11-08-rd-shell-state/` — `same/` the pixel comparison of every touched screen (main's build twice,
then this branch's), `same-save/` its first, save-only run, `walk/` the walk, before (main) and after. The three reads and
their brief: `docs/handpass/parts/rss1108/`, `docs/superpowers/briefs/2026-11-08-rd-shell-state-read-brief.md`.

## 1. The eight answers and the tier
1 money — no: OIL's waiting question keeps its places in a Set now (`ui/oilwait.ts`), same answers; walked in W3 (the OIL
question answered on a weekend Duty). 2 published record — no. 3 saved data — YES, in the path: the storage converters'
lists (`storage/fold.ts`), saved plans (`state/plan.ts`), the notices seen (`state/noticeseen.ts`), keep-reasons in
`storage/memory.ts` and `storage/reset.ts` — the same rows written; W3's reload. 4 shared drawer — YES: the quiet shade
behind eleven windows and the side menu, a spoken "Close" on five ✕, the top bar's mark drawn once (`TalonMark`) for every
page and the guest page, the "Not saved" band's source moved to its own file. 5 gesture — YES: a press on the shade behind a
window (it must still close it); a press on Help's two labels now puts the caret in their box (added on purpose — §4). 6 new
surface — no. 7 roles — YES: `state/perms.ts` (two list lookups as Sets, and the posting pass's outcome read from its own
keys only — §4, the security read). 8 warnings — no. **Tier: WALK**, with the security read (D1411) for `perms.ts`.

## 2. Roll-call — every place the touched things are drawn
| Place | Has it / must not, because… |
|---|---|
| The top bar's TALON mark — View-only Sched, Edit Schedule, every signed-in page; the guest page's bar | HAS IT, unchanged — one `TalonMark`, the same markup byte for byte (both reads); `same/` view, edit, guest at both sizes: identical |
| The week's search boxes (View-only Sched, Edit Schedule) | Nothing drawn changes — `same/` edit-search identical; their spoken name is now "Search by name or callsign", as the board's (deliberate, §4) |
| The highlight chips on the week; the Inputs calendar's + Pucks picker (the same lists) | Nothing drawn changes — the lists moved whole to `ui/hlchips-model.ts`; `same/` view-hl, inputs-picker identical |
| The day-details window (View-only Sched) | Shade and ✕ — `same/` view-dayinfo identical; W1: Escape, ✕, a press on the shade, desktop and phone |
| Traffic | Shade and ✕ — `same/` edit-traffic identical; W1 the three ways, both sizes |
| Insights, and its "Show all" | Shade and ✕; its body's builder moved whole to `ui/insights-html.ts` — `same/` edit-insights, -insights-all identical; W1 |
| Day templates | Shade and ✕ — `same/` edit-daytpl identical; W1 |
| Plans (a day's saved plans) | Shade and ✕; the plan list's lookup a Set — `same/` edit-plans identical; W1; W3 Plan B made and kept after a reload |
| Jump to a date (the week's calendar) | A keep-reason only — `same/` edit-weekcal identical; W1 |
| The side menu (phone) | Shade — `same/` drawer identical; W1 phone: Escape, a press outside (it has no ✕) |
| The "Not saved" band and its Retry, under the top bar | Its source moved to `ui/savestatus-source.ts` — `same/` save-failed and save-failed-retry identical at both sizes (`?savefail`, D1666); the phone's band after Retry opened |
| The sync pill in the top bar | The same source — in every `same/` picture of a signed-in page |
| Help's report form | Its two labels tied to their boxes — `same/` help identical; W2: a press on each label puts the caret in its box, a report sent and listed |
| The OIL question (weekend or holiday input) | Shade — `same/` oilconf identical; W3 answered "Yes: credit FO", then Add |
| The no-document question (ATT B, Upchit) | Shade — `same/` docconf identical; W4 both kinds, "No document" pressed |
| The medical clash question | Shade — W4: opened by Save after "No document", closed by ✕ |
| The upchit question | Shade — W4: opened by Save, closed by ✕ |
| The document viewer | Shade — W4: opened from the Inputs list's clip, closed by Escape, by ✕ and by a press outside |
| The input window | Comments only — W3 filed a Duty through it; W4 filed ATT B and Upchit through it |
| Undo / Redo and their names | The names' lookups as Sets (`undo/describe.ts`, `undo/timeline.ts`) — W3: "Undo — Saber’s Duty", "Undid", "Redid", the same on both builds |
| The changes window | Its people lookups as Sets (`state/changelines.ts`) — W3: 4 changes, grouped by item, the same on both builds |
| The bell | Notices and the seen list as Sets (`state/notices.ts`, `noticeseen.ts`) — W3: "Nothing new" on both builds |
| The schedule export | A keep-reason only — W3: the same file name and size (4,506 bytes) on both builds |
| Saved data across a reload | `fold.ts`, `plan.ts`, `noticeseen.ts`; keep-reasons in `memory.ts`, `reset.ts` — W3 reload: Plan B and the Sat 18 Jul Duty still there, both builds |
| Who may do what (`perms.ts`) — every gate that asks it | MUST NOT change any answer for a real record — not a screen: the unit tests (perms, the posting pass's roster, the M4 security set: 146), the two break lists that cut its lines (CAUGHT), the security read |
| Dragging on the schedule (`ui/drag.ts`), the board's builder (`ui/board.ts`), the input editor (`ui/inputedit.tsx`) | MUST NOT change — comments re-pointed only; both code reads found each comment true |
| The rules engine | MUST NOT change — not touched (D1537) |

## 3. The walk's size (D607)
1. **Type:** E (the shades and ✕ on eleven windows, the top bar's mark, three pieces moved to their own files), D (the mark
   and the save band drawn on every page from one source), G (the storage converters, saved plans and the seen list), H (two
   lookups in `perms.ts` and the posting pass's outcome), C (a press on the shade; Help's label press).
2. **What only a walk finds:** whether each window still closes by each of its ways once its shade changed, at a desktop and
   on a phone's touch; whether anything drawn moved (in pixels, not boxes); whether the Sets give the same answers on screen
   in the everyday round — undo's names, the changes window, the bell, a plan and an input kept across a reload. The reads
   cover the Sets line by line; the unit tests cover `perms.ts`.
3. **The ledger:** the React Doctor batches of 6 Nov 26 (People and Quals, type C, E) found nothing seen changed and their
   faults in the reads; a moved shade or a window over a window has missed a closing before (lessons 4, 12, 19).
4. **Chosen:** the host alone, two scripts on two builds served side by side (main's and this branch's):
   `scripts/handpass/rss1108-same.mjs` — 19 screens × desktop Chromium 1536 at 1.25 and phone WebKit 402, main's build
   twice (to prove the comparison steady) then this one, pixel for pixel; and `scripts/handpass/rss1108-walk.mjs` — W1 every
   shaded window closed by Escape, ✕ and a press on the shade (desktop by mouse, phone WebKit by touch taps), W2 Help's
   labels and a report, W3 the plain-user round (D1557) on the browser's own store, W4 the medical questions and the viewer;
   every value read on both builds and compared. Carried by tests: `perms.ts`'s answers (§2), the three moved files' importers
   (the Insights, highlight, save band and accounts tests in the full unit suite).
5. **Row added** to `docs/walk-ledger.md`.
§7.11 lessons covered: 4 (a press on the shade behind each window — it closes), 12 in part (each window from one page —
Insights and Plans from Edit Schedule, day details from View-only Sched; the shade is the window's own, the same from every
page), 14 (the closings found from the code's own list of changed shades, not from memory), 19 in part (the medical clash and
upchit questions raised over the input window's save, closed by ✕), 22 (judged by the pixels drawn); 6 and 21 named in §5.

## 4. Results
- **React Doctor** (0.9.18, the kit's way): the app's own code 124 → 31. The job's files 106 → 13 — the shell 13 → 0,
  the windows 11 (`Modals.tsx`) + 33 (the other windows and `ui/` files) → 0, the state 33 → 9, the storage 8 → 0, the
  command layer 5 → 4, undo 3 → 0. The 13 left are all import cycles through the people-settings save — a cycle cannot be
  kept with a reason on a line, so they are filed ([RD-LEFT-1108] (1)). Outside the job's files 18, unchanged (filed, (2)).
  Fixed: list lookups as Sets (state, undo, storage, `ui/oilwait.ts`), the three moves (Insights' body, the highlight lists,
  the save indicator's source), `TalonMark`, the shades and ✕, Help's labels; the rest kept with their reasons on the line
  above. `npm run lint:changed`: no new finding (169 files).
- **Nothing seen changed:** `rss1108-same.mjs` — 38 of 38 screens identical to the pixel; main's build against itself
  identical too. The phone's "Not saved" band after Retry opened: it shows under the top bar, as on main.
- **The walk** (`rss1108-walk.mjs`, both builds): 191 values read, 189 the same, 2 different — both meant: Help's two labels
  now name their boxes (a press on "Category" puts the caret in its list, on "What happened" in its box; on main the press
  left it on the page). W1: every window opened and closed by each way, both sizes (38 closings each build). W2: "Report
  sent — thank you", the report listed. W3: Plan B made, a Duty filed on Sat 18 Jul through the Inputs calendar, the OIL
  question answered "Yes: credit FO", Undo and Redo named "Saber’s Duty", the changes window 4 changes, the bell "Nothing
  new", the export 142-schedule.csv, a reload keeping Plan B and the Duty. W4: the no-document question for ATT B and
  Upchit, the medical clash and upchit questions closed by ✕, the viewer by Escape, ✕ and outside. No page or console error.
- **Deliberate, heard not seen** (nothing drawn changes): a screen reader no longer names the shade behind the eleven windows;
  five ✕ (day details, Traffic, Insights, Day templates, Plans) are spoken "Close"; the two week search boxes are spoken
  "Search by name or callsign", as the board's is; Help's "What happened" box is spoken by its label (its Category list keeps
  its own spoken name). Each also makes a keep-reason true (the opus read's low 3).
- **Astra's read** (`parts/rss1108/read-astra.md`): one low — a 27 Oct 26 picture script (`scripts/handpass/lw-m4-bars.mjs`)
  still loaded the save source from its old file and would have thrown at its "Not saved" step. Fixed (one path).
- **The fresh, blind Opus read** (`parts/rss1108/read-opus.md`): six low, no high or medium — (1) the same script: fixed;
  (2) the three new files had no file-map row: added, with the two rows they came from; (3) the spoken names above: kept,
  named here; (4) a keep-reason in `state/sched-commit.ts` said "people" where the list is a day's row ids: reworded; (5) a
  comment in `Shell.tsx` still named the highlight lists' old home: re-pointed; (6) for the security reader, the posting
  pass (below). Not a finding but asked for: `storage/reset.ts`'s reason stated an order nothing needs: reworded; and three
  old break lists pointed at lines this change rewrote: re-pointed (`2026-10-14-oil-uncancel-load.json` #31, `lw-m4.json`
  #23, `lw-rr1031.json` #12) and each run on this branch — CAUGHT (1 test failing of 94, 1 of 555, 2 of 81).
  `state/view.ts`'s keep-reason was reworded in the same spirit.
- **The security read** (D1411, `parts/rss1108/read-security.md`): no high or medium. One low, the same as the Opus read's
  (6): the posting pass looked an outcome up on a plain object, so an outcome named as something every object has
  ("toString", "constructor") found a function, not a field list, and the check now threw at once where it used to refuse
  or pass — caught by the commit's own guard, so it failed closed, and only a hand-made record could carry such a name.
  **Fixed red first:** `src/leavewar/postout-roster.test.ts` "a posting whose outcome names something every object has is
  refused — never thrown, never passed" (four names) failed on the code before and passes after; `perms.ts` now reads
  only `PASS_FIELDS`' own keys. Two older points, no worse, filed for the full security review (§6).
- **Gates on his PC:** the full unit suite (before the posting-pass fix): 801 files, 13,881 passed, 20 skipped; after it,
  the three files it touches (perms, the posting pass's roster, the M4 security set): 146 passed; the build: passes;
  `node scripts/code-check.mjs --include-untracked`: no new finding. GitHub's run of the pull request is the full check (D1086).

## 5. Not walked, and why
The OIL question's and the no-document question's own closings (Escape, ✕, outside) — each pictured open and identical, and
answered in W3 and W4, but not closed by each way. W2–W4 ran on a desktop only (the phone took W1 and the pixel
comparison). The medical clash and upchit questions closed by ✕ only. Only his iPhone can show the shades' presses under
its own touch (lesson 21) — the press handlers did not change, only the shade's spoken role.

## 6. Filed, not fixed
- [RD-LEFT-1108] — the 13 import cycles through the people-settings save, and the 18 findings in other areas' files.
- [DOC-POINTERS-CODE] — narrowed to four pointers in files this job could not touch (the engine; pull request 664's two),
  and one to read against D338.
- [REVIEW-LAYERS], for the full security review — (a) the posting pass may change a done man's account row in every field
  but person, role and name, or delete it, whatever the outcome; (b) the document viewer's PDF frame is not sandboxed,
  safe today, to pin once documents come from a shared store.

Walk: docs/handpass/2026-11-08-rd-shell-state.md · 138 pictures (114 comparison + 8 its first run + 16 walk) · 24 surfaces · 43 orders (38 closings, a report, the round, 3 questions and the viewer) · MISSING: 0 (two older security points and the cycles filed)

Docs: OUTSTANDING 159 items (+1 −0) · DECISIONS D1–D1750 · homes OK
docsize: OK
