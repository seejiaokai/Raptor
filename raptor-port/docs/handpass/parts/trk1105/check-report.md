# The Tracker tidy — the checker's report (the night of 5 Nov 26, job 2, phase B)

Saved as it arrived (the overnight guide), condensed only in layout. Checker: the same fresh Opus helper as phase A.
Branch `claude/tracker-standalone-tidy`, pull request 637. **Status: CHECKED.**

## Commits
- `29d3044a3` — the walk's evidence, the break tests, the new test.
- `e5d6bbe4f` — the read, the fixes, the sheet, the ledger row, the file map. Differs from the walked `58f66b7b1` by one new
  test, one document line and four comment lines in `core.js`.

## GitHub's runs at hand-back
`58f66b7b1` (the walked build): Deploy, Docs guard, Secrets scan — success. `e5d6bbe4f`: Secrets scan success; Deploy queued,
Docs guard in progress — read by the coordinator before the report.

**Walk: docs/handpass/2026-11-05-tracker-tidy.md · 211 pictures · 9 surfaces · 19 orders · MISSING: 1 fixed (B5's wire, a test red first), 0 ruled, 1 filed (L2, by the coordinator)**

## 1. Rules sweep — all PASS on the running build
D1538, D1534 (React Doctor 583 → 572; the Tracker's 11 → 0); D347 / D348 / D349 (one pair, top bar only, Edit Schedule's size
and look, desktop, phone, sideways); D372, D129 (desktop, from three pages), D376, D463 (unit), D464, D120 / D122 / D132, D126;
D121 / D1014 (the member has the pair; flex settings read-only for him); D191 / D1003 / D1018; D1625 (nothing new on screen);
D1132 / D1135 / D1170. D56 in every brief; nothing set aside under it.

## 2. Scenario designer (fresh Opus) — `parts/trk1105/scenarios-opus.md`, 19 scenarios
Found no path to the Tracker's storage without its target plugged in; the walk was built to try to break that.
- S1–S5 where saves land: a whole session's writes under `raptor:tracker/`, never `ocu:` — with `?fresh=1`, with storage that
  cannot be touched, with an old `ocu:` key planted (never read, never written).
- S6–S8 the save corner: silent beside "Not saved" (judged on pixels) — Tracker open, before its first visit, hidden;
  recovers after Retry.
- S9–S10 Export / Import: round trip; Import into a new profile (the empty-Tracker screen no control reaches — "Keep at least
  one course.").
- S11–S15 the one Undo / Redo pair: every mode, size, both roles; Ctrl+Z in a text box stays the box's; the Tracker's history
  and other pages' separate while hidden; on a slow first visit the pair greyed and safe.
- S16 logout's question (desktop only — the ball editor could not be driven on a phone); S17 sign-in without a reload; S18 a
  failed page download and Retry.
- S19 plain-user round: every opener and closer; all back after a reload and a sign-out and in. The person window from Quals
  opens nothing — not walked.

## 3. Roll-call — no MISSING cell
The read added two safe rows: the boot's one-time Tracker conversion (never touches the doorway) and the desktop pre-warm (runs
after the boot).

## 4. The walk
One Sonnet 5.5 walker on a frozen build (127.0.0.1:4180, from `58f66b7b1`); 444,778 tokens. Desktop 1536 Chromium, iPhone
402 × 874 WebKit by touch, phone sideways. **206 PASS · 0 FAIL · 3 not walked** (S10's empty Tracker — no control reaches it;
S16 on a phone — the ball editor; S19's person window from Quals — opens nothing). Every first-run FAIL was the script's own
world, read in its row and re-run on the right premise. Smaller gaps: Import on a phone not walked; S14 not by the bell; S8
waited 3.5 s, not past idle; phone S15, S16, S18 in Chromium touch at the phone's size. Pictures opened by the checker: the
route on a phone, S6 desktop failed, S8 phone first frame back, S11 sideways — each as reported. Host route check 8/8.

## 5. Break tests (8)
7 red as they should be. **B5 green:** removing `main.tsx`'s hand-over of the saver to the Tracker turned no test red — a test
added in `storage.test.ts` pins that wire (red with the line out, green with it in).

## 6. The read (one fresh, blind Opus reader) — `parts/trk1105/read-opus.md`
PASS: 0 high, 0 medium, 2 low. L1: `feature-impact.md` still named `useSaveHealth` — fixed. L2: the leftovers kept on purpose
(the Tracker's own glyph and pencil drawings, its colour copies) live only in `known-gaps.md` — filed by the coordinator as
[TRK-KEPT-COPIES]. Tidiness note filed in the sheet; two comment sentences with an unclosed dash corrected.

## 7. Fixes and re-walk
The new test, the stale document name, the comment punctuation — none touched logic or anything a person sees, so no narrow
read and no re-walk (sheet §9). After the fixes on his PC: `storage.test.ts` + `trk-legend.test.tsx` 15/15; `lint:changed` no
new finding; docsize "OUTSTANDING 148 items (+0 −0) · DECISIONS D1–D1644 · homes OK", "OVER by 158, deferred (D29)" — the
Tracker's rulings file, after the coordinator's §Architecture note (since put in fewer words by the coordinator).

## Parked
1. Older, seen in passing: in a browser that refuses storage the Tracker's corner says "● saved" and the top bar says nothing,
   though nothing survives a reload (the same before this change). Recommended: file it; new words would need a mock-up first
   (D1625) — filed by the coordinator as [TRK-NOSTORE-SAVED].
2. L2 — above.
3. The ledger row is in `docs/walk-ledger.md`.

The walk's server on 4180 stopped. HANDOFF.md, OUTSTANDING.md and the rulings files not edited. Rulings: none.
