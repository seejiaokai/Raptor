# The keyboard and windows batch — the builder's closing report on the bug check (the night of 5 Nov 26, phase B)

Saved as it arrived (the overnight guide). Status: CHECKED. Last pushed commit `6f093f95d`; GitHub's run on it green in
every workflow (the gate set "Deploy to GitHub Pages", the Docs guard, the Secrets scan) — confirmed by the night's chat.

## Roll-call (evidence sheet §2)
No MISSING cells. Two rows NOT WALKED, each with what covers it: the document viewer from the Inputs list's paperclip (the
demo week draws no paperclip until a document is filed through the list — covered by the Medical card, the same component
and bar-free behaviour, and the Leave War walk's R8); the OIL question raised from a typed box (since D739 (4) a box's own
save asks nothing; the one door left needs a fixture the demo week lacks — covered by `oilkeysback.test.tsx`, driving the
real Tab route and sheet). One row by code reading only: a guest on View-only Sched has no Traffic button (`isGuest()`),
unchanged. The reader's gaps added as rows: the viewer from the Inputs calendar's day card, a role pick, a chip pressed by
the keys with a window up, Tab inside a menu, a control drawn on several days, an undo removing one of several viewer pages.

## Walk
`kw-walk.mjs` (assertions of the right behaviour), one Sonnet walker, 1536×864 and 402×874 touch with a picture after each
tap: 152 PASS, 0 FAIL, 2 NOT WALKED (the paperclip, each size), 0 browser errors, 115 pictures. The walker's four flags,
pictures opened by the builder, none a fault: phone picture 110 (Undo dim only because nothing is left to undo); teal
tints after taps (the test browser's tap highlight, also on untouched markup); a passing note mid-fade; a blank document
page (the walk's stand-in PDF is empty). The walker opened 90 of 115; the builder the deciding ones. The Leave War
viewer-close walk (`lw-nb-docclose.mjs`) re-run: 29/29 (Chromium desktop, Chromium and WebKit phone). Break tests
`breaks/kw1105.json` 29/29 caught. **The drawing check (D1495) not run** — the mock-up's pictures are transforms of the
real app; the built screens compared with them side by side by eye (sheet §3) — a departure put to him.

## Reads (one fresh, blind Opus reader; two narrow fresh reads of the fixes — `read-opus.md`, `read-fixes-opus.md`, `read-fixes2-opus.md`)
| Finding | What | Disposition |
|---|---|---|
| F1 MEDIUM | after a role pick the role box shows its old words | not reproduced in real Chromium, mouse or keys, on the build before the fix; the reader's harmless deferral kept; pinned by tests passing either way |
| F2 MEDIUM | Enter on a board day chip left Traffic, day details or a menu open over the new day | fixed — the key press sends the chip's click; red first (unit, and the browser on the old build) |
| F3 LOW | Tab out of a board menu reached the top bar hidden under the board | fixed — Tab past the end closes it, keys on its button; red first |
| F4 LOW | keys back to another day's copy of a control | fixed — looked for on the day pressed; red first |
| F5 LOW | a several-entry viewer kept a page an undo removed | fixed — that page dropped; red first |
| G1 LOW | the viewer slid to another entry when a page in front went | fixed — the page shown kept by what it is; red first |
| G2 LOW | a control moved to another day not found | fixed — falls back to the same week; red first |
| H1 MEDIUM | the keys' twin could be another input's "→ Ground", one Enter from putting it on the programme unseen | fixed — the twin must belong to the same input (`data-acck`); red first |
| H2 LOW | the file shown gone: the next entry shown though the same entry had another file | fixed — the same entry's other page first; red first |
Round 2's fixes (one selector attribute, one "same entry first" search) each with a red test, not read a third time.
Tidiness notes filed in the sheet, not fixed: the opener noted up to three times, the viewer's close repeated, two lists of
focus stops copies; two wrong comments corrected.

## GitHub's red run on `077e5a49b`
`unit (raptor 6/6)`, `placedshown.test.tsx`: F5's change closed a viewer whose rows were never inputs on the list (pages a
caller makes up). Fix: "gone" means only an input that was on the list when the viewer opened; red first; the 14 viewer
test files 212 passed; `6f093f95d` green everywhere.

## Re-walk
S3 and S5 on the fixed build into `…/rewalk/`: first run one FAIL of the step's own (Traffic opened on a Saturday, which has
no Traffic button — script v6); second run 60 PASS, 0 FAIL, 2 NOT WALKED. H1 and H2 have no route the demo world reaches —
unit tests; on their build `keys-windows`, `board-escape-traffic`, `medical` passed (43). Code check no new finding;
document check OK.

**Walk:** docs/handpass/2026-11-05-keys-windows.md · 233 pictures (115 walk, 41 re-walk, 77 Leave War viewer walk) · 24 surfaces · 152 checks walked (+ 29 Leave War rows, 60 re-walk) · MISSING: 0 (2 rows NOT WALKED and 1 by code, each with what covers it named)

## Parked
1. The drawing check (D1495): the by-eye comparison in its place for this batch — recommended yes (the drawings are the
   built parts with one class and one outline added, each put side by side, sheet §3).
2. The round-2 reader's question: should the app's way of finding a redrawn button again know a short list of the marks
   that name the item a button belongs to, instead of trusting its first mark? Only the accept buttons needed it today,
   fixed. Recommended: a low backlog note.
3. The three departures of the build report stand as built.
