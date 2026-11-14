# Code read — job 3 of the night of 14 Nov 26: the checking tools (nothing in the app is meant to change)

You are one of two blind readers of finished code. Read only; change nothing, commit nothing.

**Repo:** C:\Users\User\projects\Raptor. **Branch:** `claude/check-tools-1114`. The change under review is TWO commits on top of
`main` (`6f47f69db`): `535dba349` and `3bb14d74e` (`git diff 6f47f69db 3bb14d74e`).

**What it claims:**
1. [ONE-RULE-LEFTOVERS] part (1) (its text in `OUTSTANDING.md`): the one-rule behaviour register — moved to
   `raptor-port/docs/superpowers/specs/2026-10-12-one-rule-behaviour-register.md` — has its ids OR1–OR55 added to
   `raptor-port/scripts/rulecheck.mjs`; 54 written into the titles of tests that pin each behaviour (109 places, 23 files under
   `src/leavewar`, `src/state`, `src/ui`, titles only, no assertion touched); OR20 in the baseline (its tests live in `src/engine/`,
   which this job may not touch, D1537). Some register rows were reworded: OR3 and OR8 (said to contradict the later ruling D776 —
   `grep -h '^| D776 |' .claude/decisions-full/*.md`), OR4, OR13, OR35 marked "in part", OR29, OR33, OR46 "gaps closed".
2. [DRAW-MARK-HELPER]: `raptor-port/scripts/handpass/drawmark.mjs` (rings a part with an outline and its own tag, refuses a mark that
   moves the part, moves or refuses a tag cut off by a clipping ancestor, `hide()` and no `remove()`, prints page errors as they happen,
   refuses a picture if a mark went stale) with a self-test `drawmark-selftest.mjs` (16/16); and the drawing check
   (`raptor-port/scripts/drawcheck/lib.mjs`, `compare.mjs`, `selftest.mjs`) now leaves the helper's marks out: text under the tag
   skipped in the measure, and on the DRAWING side only a shadow or an edge in the marker colour (#ff2d95) counts as none.

**Your questions:**
- For each of the 54 ids: does the test whose title now carries it really pin the behaviour the register line states? Sample hard —
  at least 15 ids, chosen across files, and every id marked "in part" or "gaps closed" — and name any id that sits on a test that does
  not pin it (the rule check would then stay green while the behaviour is lost). Were any assertions changed, or any test renamed in a
  way that breaks another tool reading titles (grep for scripts that read test titles or ids besides rulecheck)?
- Do the reworded register rows keep their meaning, or correct it rightly against the later ruling? Is anything a ruling says now
  missing from the register?
- Does `rulecheck.mjs` still fail on every case it failed on before (a ruling with no test, outside the baseline)? Could the change
  let a real gap pass (e.g. an id matched as a substring of another — OR2 inside OR20, OR29…)? Show with a concrete example.
- The drawing check: can the new exemption hide a REAL difference between a build and its drawing (the build side is said never to be
  excused — is that true in the code)? Could a drawing that legitimately uses #ff2d95 lose a check? Is the measure's skip limited to the
  helper's own tag?
- The helper: does it do what it claims in a real page (fixed and sticky parts, transformed or zoomed ancestors, an SVG, a part
  inside a shadow root or an iframe, a redraw that replaces the node)? Is there any path by which marking a part changes the app's
  layout or state (a class added to the part, a node left behind by `clear()`)? Does the self-test really fail on each fault?

**A finding counts only with:** a concrete case, what goes wrong, the cause and the fix — written so it could become a failing test.
No finding about data already stored (D56).

**Then, separately, a tidiness note** on the changed lines only (filed, not fixed): written twice, left over, harder to read than it
needs to be. No size numbers.

**Report:** findings first (or "no finding"), each numbered with severity; then the tidiness note; short.
