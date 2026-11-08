# Chat 20 — the Tracker's small batch: its bug check (8 Nov 26)

Branch `claude/chat20-tracker-small-batch`, pull request #696. Started by chat 3. Pictures:
`docs/img/handpass/2026-11-08-chat20-tracker/`.

## What changed
- **D1860** — the Tracker's "Delete course" question and an import's note on a deleted course drop their typed ↺ and ⇅.
- **[TRK-KEPT-COPIES]** — the Tracker's pencil, Reorder, gear, Reset and list are the app's own icons (each given the
  Tracker's class); its page colours are links to Raptor's tokens, not copies; the fallback values kept for a standalone
  Tracker are gone (D1538). Nothing a person sees should change.
- **Not built, put to him:** the Tracker's magnifier has drifted from the app's (D1625); [TRK-NOSTORE-SAVED] drawn only
  (D1660).

## The tier
**WALK.** The eight questions: money / OIL — no; the published record — no; saved data — no (nothing stored changes,
no record's shape); roles or permissions — no; the rules engine or warnings — no; a shared drawer — **yes** (the app's
icon file, `ui/icons.tsx`, drawn on many pages); a new thing a person sees — no (two messages lose two marks, a ruled
wording); a part of the app that moves or is dragged — no. One yes, a shared drawer, with nothing that can lose or
miscount data: WALK, sized to every place that draws the touched icons and colours, at both widths, plus the Tracker's
plain-user round (D1557).

## The roll-call — every place that draws what was touched
| Place | Has it / must not | How checked |
|---|---|---|
| The Tracker's bar: course and syllabus pencils, the gear (flex), Show All's list, Info | has it — same pixels | pictures d01, p01 before / after |
| The course, syllabus and File menus: Rename's pencil, Reorder's arrows, Edit chart layout's pencil | has it — same pixels | d02–d04, d17 (a row under the mouse), p02–p04 |
| Reorder courses / syllabi / crew windows | has it — same pixels | d09–d11, p09–p10 |
| Edit chart layout: Reset layout's arrow | has it — same pixels | d12, p11 |
| Flex settings, the Legend | has it — same pixels | d13–d14, p12–p13 |
| The marking window, Show All (and filtered), Find, the Info tab (top and foot), the export window | the page colours — same pixels | d05–d08, d16, p05–p08, p14 |
| The details bubble (hung off the page, outside the Tracker's own names) | Raptor's colours by name, fallbacks gone — same pixels | d15 |
| The Students card's Reorder, each name's pencil | has it — same drawing (the app's icon) | tracker.test.tsx (source and render); the walk |
| Restore on a deleted course (Reset's arrow) | has it | trk-round-seen.test.ts; the walk |
| Every other page's gear, Reorder, Reset, list and pencil (Scheduler Board, Leave War, Inputs, Edit Schedule …) | must not change — the icons called without a class print the markup they printed before, byte for byte | icons-markup.test.tsx (recorded from the build before the change) |
| The "Delete course" question | the words without ↺ and ⇅ | retest.test.tsx (D128); the walk |
| An import's note on a deleted course | the words without ↺ and ⇅ | retest.test.tsx (D127) — the walk cannot import a file it would have to make |

## The pixel check (walk-scripts §8)
`scripts/handpass/trk-kept-copies-pixels.mjs` (kcpix v1) took 31 pictures — 17 desktop (Chromium, 1536×864), 14 phone
(WebKit, 402×874, touch) — each in a fresh world from the demo data, from a frozen build served inside the test browser;
`trk-kept-copies-compare.mjs` (kccmp v1) compared them pixel for pixel.
- **The same build twice (before):** 29 of 31 identical; two differ by colour rounding at the soft corners of rounded
  boxes under a window's dim backdrop — Reorder courses, 18 pixels, at most 1 shade in 255; the Legend, 5 pixels, at
  most 14 — noise of the browser, not the code (`compare-before-twice.txt`, `diff/zoom-d09-same-build-corners.png`).
- **After against before:** 28 of 31 identical to the first before-run; Reorder courses and the Legend each identical to
  one of the two before-runs; the marking window (6 pixels, at most 1 shade) and Edit chart layout (67 pixels, at most 2
  shades) differ from both — every one at the soft bottom corners of the bar's boxes, none on an icon or a colour
  (`diff/zoom-d12-corners.png`). Nothing a person can see changed.

## Tests
`retest.test.tsx`, `trk-palette.test.ts` (each link pinned; a wrong link and a copied colour brought back each failed
it, then it was restored), `tracker.test.tsx`, `trk-flex-setting.test.tsx`, `trk-round-seen.test.ts`,
`src/ui/onepencil.test.ts`, `src/ui/icons-markup.test.tsx` — 7 files, 217 green. The code check: no new finding.
**GitHub's first full run failed one test this job had not run:** the date box's look test
(`src/ui/datecal-look.test.ts`) also reads `tracker.css` and looked for the copied grey `--muted:#8A96A3`; it now looks
for the link `--muted:var(--ink-3)` — the same colour, its value pinned by `trk-palette.test.ts`. Every test file that
reads `tracker.css` was then run: 69 green. **Lesson:** before the push, search for every test that reads a changed file
(`grep -rl "tracker.css" src`), not only the ones written for the job — the gate caught it, no person saw it.

## The walk
One Sonnet walker, `scripts/handpass/trk-chat20-walk.mjs` (kc20walk v1), on the frozen build of commit `ef035e763` (the
pixel check's "after"; since then only a test changed in this job's own files) served inside the test browser — a
desktop (Chromium, 1536×864, mouse and keys) and his iPhone's size (WebKit, 402×874, touch, a picture right after each
tap and the settled one, D1281). Every step pressed on screen; the demo has one course, so a second, WALKB, was added
through the course pencil's "+ Add course" first. **90 steps, 90 pass**; no console error, page error or failed
request; 142 pictures in `docs/img/handpass/2026-11-08-chat20-tracker/walk/` with `walk-results.json`.
- **S1 — Delete course (D1860), 4/4 at each width:** the question reads "Delete course WALKB?" then "Its students and
  marks are kept: Restore in Reorder courses brings it back in this browser." — no ↺ or ⇅ (the host opened
  `s1-phone-question.png`); Cancel keeps the course, OK removes it.
- **S2 — Restore, 3/3 at each width:** the Restore button wears the drawn arrow turning back, no typed ↺ (the host
  opened `s2-desktop-restore-button-crop.png`); pressing it brings WALKB back at the end of the Course list.
- **S3 — the Students card, 7/7 at each width:** Reorder wears the two-arrow mark; each name's pencil is the app's
  solid pencil, tip at the bottom right (the host opened `s3-desktop-pencil-crop.png`), and opens Rename; Reorder opens
  "Crew order"; Cancel leaves everything as it was.
- **S4 — the bar and menus, 22/22 desktop, 15/15 phone:** the gear and Show All open and close; the course, syllabus
  and File menus open, close on a click outside and on Escape; every row but the two "+ Add" ones wears its drawn mark;
  a row under the mouse shades as before; Edit chart layout's Reset layout wears the drawn arrow; leaving asks nothing.
- **S5 — the plain-user round (D1557), 13/13 at each width:** a student picked, an event found with Find and picked,
  its ball marked DCO in the marking window, the ball, the Info panel and Show All each showing the mark; the Legend
  opened and closed; switching course and back kept the student and the mark.

**Seen on the way, not caused by this change, filed (D994):** the Tracker's three menus under the keys wear the
browser's own white ring, not the app's cyan, and the down arrow does not move through them — the board's menus have
both (D1646, D1771) → `[TRK-MENU-KEYS]` (`s4-desktop-*-keyboard-crop.png`, the host opened the course menu's). The
cut words in the phone's dropdowns are the test browser's own drawing (D1564).

**Walk:** WALK tier — the pixel check (31 states, before twice and after) and one walker (90 steps at 1536 and 402, 142
pictures, the plain-user round included) — 0 faults from this change; 1 older gap filed.

## The reads
One brief, two readers blind to each other (`docs/superpowers/briefs/2026-11-08-chat20-tracker-read-brief.md`), the
code at commit `ef035e763` against its base `bf09f369b`.
- **Astra (Codex, gpt-6-astra, high):** PASS, no finding (`…-read-astra.md`). Its own checks, in memory at the fixed
  commits: 27 renders of the app's icons called without a class — markup identical; 23 renders of the Tracker's icons —
  the same shapes and attributes; 25 former palette values — the same resolved colours; 9 removed fallbacks — each the
  same as the app's token. Tidiness: no standalone leftover in the changed lines, no avoidable copy, no untrue comment.
- **The fresh, blind Opus read:** (to come — `…-read-opus.md`.)
