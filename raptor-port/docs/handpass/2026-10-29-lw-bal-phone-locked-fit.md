# [LW-BAL-PHONE-LOCKED-FIT] — the iPhone's locked Balances page back to its drawing (D1497) — evidence (LOOK)

**Tier: LOOK** (bug-check order §5: one stylesheet rule on one surface, the Balances page on a phone; no saved data, roles,
published record or shared drawer — `.bp-row` is the phone's Balances row alone). Branch
`claude/leave-war-m5b-iphone-balances-1402b7`, commit 3d2a069c4.

- **Fixed, red first:** a read-only figure on the phone (a member's locked row, anyone else's row) keeps the drawing's 10px
  at its right, ending where a typed box's figure ends; it stood flush, 10px right of `m5c-c2-phone-locked`. Browser test
  "M5a drawing F" red (0px against 10) then green, phone and desktop projects; stylesheet test F beside D1493's.
- **Walk:** the drawing check on all ten M5a states at his iPhone's 402 and the desktop's 1536 (report and pictures:
  `../img/handpass/2026-10-29-drawcheck-m5a-fix/report.md`): 23 kept differences as before, 1 left — Ranger's row 6px lower.
  Pictures opened by the host: the locked page after the fix beside the drawing (`after-crop.png`, `drawing-crop.png` — the
  figures' right edges on the drawing's), and the View row in the drawing and the build.
- **Not fixed, put to him (his page, question A):** the 6px is the drawing's own fault — both member drawings lay the page
  over the bottom 6px of the View row, cutting the period picker's and My leave's bottom edges (also in the approved sheet
  `m5c-c2-phones`). Recommended: keep the build. Until he answers, the check stays red on that one part.
- **Gates:** GitHub's run of the pull request (D1086); on his PC the Balances unit file (46 / 46) and the M5a drawing browser
  tests (8 passed, 2 skipped by project).
