# The Tracker — plain-user round on the live code (2 Nov 26)

**Why:** his D1558 (2 Nov 26 — "Now I'm also afraid of the things u changed for the tracker"): the Tracker's code clean-up of
31 Oct 26 (pull request 603, D1534) walked the way a person uses it, by his new rule D1557 (the bug-check order §7.0a — a
plain-user round). **Read-only:** nothing in the app was changed.

**What was walked:** `main` at bb6932e8c (the live code), built and served at :4241; and, for every step, the code as it
stood just before pull request 603 (its first parent, 4f363bb46 — `git archive` into a short path, `node_modules` by a
junction, built and served at :4242), walked by the same script, so each result can be told apart as "the clean-up's" or
"older".

## The verdict

**No fault caused by the clean-up was found.** Every step a person does was walked start to finish on the desktop (Chromium,
1536 wide) and on his iPhone's size (WebKit, 402 × 874, touch), as the admin and as a member: 356 checks on `main`, every one
passed. The same steps on the code before pull request 603 drew **pixel-identical pictures**: 174 of 175 on the desktop,
175 of 175 on the phone, and 81 of 82 of the phone's right-after-a-tap pictures (D1281) — the two that differ are both the
OLD code's (below). So what he sees and what each press does in these tasks is exactly what it was before the clean-up.

## The round — what a person does, each window closed by each of its ways

Script: `scripts/handpass/trk-ur-walk.mjs` (driver `trk-ur-lib.mjs`). Each run starts on a fresh demo world.

| Section | What was done, start to finish | Looked for afterwards in |
|---|---|---|
| a | Pick a student in Crew, then back | the store's student, the Pace card's name |
| b | Open a ball → DCO; top bar Undo, then Redo | the ball's ring, Overall (1 DONE / 0.5%), the Info half |
| c | The marking pop-up closed by Close, Escape, a tap outside; a press on another ball while it is up; Fails + | the pop-up's list, the Failures card chip and total, the chip's tap note, the full failures list (✕, Escape, outside) |
| d | Edit details: Cancel, Escape, outside; then type Hours and Save | the pop-up's details, Show All |
| e | Show All (Close, Escape, outside, the filter); Legend (its button again, Escape, outside); ⓘ on / off | — |
| f | Flex ⚙ (✕, Cancel, Escape, outside); admin: a From day changed, saved, reopened, put back; the switch off and on. Member: read-only | the Info half's flex bar gone / back |
| g | + Add (Cancel, Escape, outside), add a man from the roster; rename him by the pencil; Remove (Cancel, Escape, outside, then yes); ⇅ Reorder (Cancel, Escape, outside) | Students chips, the Crew list |
| h | Last Flown (Syllabus) by the calendar (calendar also shut by Escape and outside); pace; End date A; course start; a roster man's down days window (✕, Escape, outside); a lull period (calendar ✕, Escape, outside; two days picked; its chip reopens it); Copy to… (✕, Escape, outside) | Days since, the bars, projected end, req. pace, lull chips |
| i | Course, Syllabus and File menus (their button again, Escape, outside); Export (Cancel, Escape, outside, then a full backup with students); Import that file back (Replace each chart, yes to students); Find event (type, Enter, ✕); phone: the search panel put away by 🔍 again, Escape, outside | the mark, Overall after the import; the chart landed on the event |
| j | Hide the bar and bring it back; chart zoom +, reset | — |
| k | A Next-event chip | the chart lands on that event |
| l | Reload the page | everything above still there (student, mark, fails, dates, pace, lulls, roster, Overall) |
| m | Leave for the Leave War and come back; log out and in | same student, same mark |
| drag | A mouse drag starting on a chip, the pencil, the Failures title scrolls the Info half and opens nothing; Enter on the Failures title opens the list (the clean-up made these buttons) — `trk-ur-drag.mjs` | — |

| Run | Browser, size, role | Result |
|---|---|---|
| desk-admin | Chromium 1536 × 864, admin | 89 PASS, 0 FAIL, 0 page errors |
| desk-member | Chromium 1536 × 864, member | 86 PASS, 0 FAIL, 0 page errors |
| phone-admin | WebKit 402 × 874 touch, admin | 92 PASS, 0 FAIL, 0 page errors |
| phone-member | WebKit 402 × 874 touch, member | 89 PASS, 0 FAIL, 0 page errors |
| desk-drag | Chromium, admin | 3 PASS, 1 the script's own (below) |
| before603-desk-admin / -phone-member / -desk-drag | the same, on the code before pull request 603 | 88 / 88 PASS / the same 3 + 1 |

(The before-603 runs have one check fewer: the lull chip's own opener is new in the clean-up, so that one check had nothing to
press on the old code.)

## What the round found

**Caused by the clean-up: nothing.** Each item below was seen identically on the code before pull request 603.

1. **The bar's three dropdowns show their words cut in half — in the test browser's WebKit only.** `phone-member/01-landing.png`
   (Crew, Course, Syllabus read "STUDENT A", "26ABSG", "2026" with the lower half missing). The same on the old code
   (`before603-phone-member/01-landing.png`); Chromium at the same size draws them whole (`selects/tracker-bar-chromium.png`
   beside `selects/tracker-bar-webkit.png`), with the same measured box (26 high, 12px words). Read as the Windows WebKit's
   own drawing of a dropdown, not the app — **not checked on a real iPhone**; worth one look on his phone.
2. **On a phone the ⚙ is the typed gear, which WebKit draws as a grey picture** (every phone picture). Older, and already
   ruled and filed (D1507/D1509, `[UI-CONSISTENCY-LOOK]` round 4).
3. **On a phone, the marking pop-up of an event at the very top of the chart opens over the Tracker's bar** — it covers ⚙,
   ^ and the Flow / Info / Show All tabs while it is up (`phone-member/04-b-pop-open.png`). It still works and closes by
   each way; identical before 603. An observation for him, not judged a fault.
4. **On a phone the Find panel, while open, covers the Flow / Info / Show All tabs, and its ✕ only empties the box**
   (`phone-member/232-i-search-cleared.png`): it is put away by 🔍 again, Escape or a tap outside — each passed. Unchanged
   code; an observation.

**The two pictures that differ between the builds are the OLD code's:** the old build drew End date A and B empty for a
moment (`compare/desk-only-difference-before603-endA-empty.png` — `main` on the left draws them), and after Reorder's Cancel
the old build left a focus ring on No. of Down Days (`compare/phone-only-difference-before603-focus-ring.png`).

## The script's own (not the app)

- The Failures-title drag "did not scroll": the half was already at its bottom and the drag pushed further down — the same
  on both builds; the other two drags scrolled.
- Earlier tries failed on the script's selectors (the flex window's controls are named by test names; the Legend's button
  sits under its own scrim by design, so its second press is a press on the scrim; the down-days box rightly does nothing for
  a student who is not a man on the roster — D1018; Export's "Exported as…" note needs its OK). Fixed in the script, then
  re-run whole.
- Desktop Chrome's own Save-as and Open windows cannot be driven headless: for the desktop runs they were taken away, so
  Export and Import used the download and file-box path — the iPhone's path.

## Not walked

- **A real iPhone** (Safari's own dropdown, its own file picker) — WebKit on Windows stands in.
- **Pinch on the chart** — the test WebKit has no two-finger touch.
- **Edit chart layout** (drawing, moving balls and lines, Save changes), the poke-ball editor, **adding / renaming / deleting a
  course or a syllabus, Duplicate, Reorder courses or syllabi** — the menus were opened and closed, their items not run.
- The chart's arrow keys (D980), and the Tracker on a phone turned sideways.
- The desktop at his PC's 125% display.

## Files

- Scripts: `scripts/handpass/trk-ur-lib.mjs`, `trk-ur-walk.mjs`, `trk-ur-drag.mjs`, `trk-ur-compare.mjs`, `trk-ur-selects.mjs`,
  `trk-ur-survey.mjs`.
- Pictures: `docs/img/handpass/2026-11-02-tracker-user-round/<run>/` — each run's `_log.txt` and `_results.json` beside them;
  the comparisons in `compare/`.
- Commands: from `raptor-port/`, `UR_TAG=<run> [UR_PHONE=1] [UR_WHO=u] [UR_URL=http://localhost:4242] node scripts/handpass/trk-ur-walk.mjs`;
  `node scripts/handpass/trk-ur-compare.mjs <main run folder> <before-603 run folder> <out>`.

Walk: docs/handpass/2026-11-02-tracker-user-round.md · 1320 pictures · 14 surfaces · 4 roles-and-sizes (admin and member, desktop and phone) plus 2 before-603 runs · MISSING: none caused by the clean-up; 2 observations for his look (items 3, 4), 1 to check on his iPhone (item 1), 1 already filed (item 2)
