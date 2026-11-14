# Job 3 — Astra's read of commits 535dba349 and 3bb14d74e (saved by the coordinator)

1. **P2 — Two rule labels overstate coverage.** OR26’s test has Ranger file an input for someone else; it never tests him handing away an input filed **for him**. OR15’s tagged tests check the saved answer, not whether everyone earns correctly or only one claim exists. Those behaviours could lose their tests while the rule check stays green. Add the missing OR26 case; mark OR15 partial until its earning tests carry the label.

2. **P2 — A real pink design difference can pass unnoticed.** A drawing with an ordinary pink border and shadow, compared with a build missing both, returns no differences. Colour alone triggers the exemption, including nearby shades. Exempt explicitly identified annotations only; ordinary design colours must remain checked. Reproduced directly.

3. **P2 — Scaled clipping boundaries are measured incorrectly.** A clipping parent 200 pixels wide, scaled to half size, visibly ends at 100 pixels; the helper still permits tags out to 200 because it mixes screen coordinates with unscaled dimensions. A tag extending beyond 100 can pass while clipped. Calculate clipping bounds in one coordinate system and test scaled and zoomed parents.

4. **P2 — Class cleanup can change the page.** A refused mark removes a requested class even if the element already had it. Conversely, a newly added class survives clearing the marks. Track which classes the helper actually added, preserve existing classes, and remove its additions on rollback and clear. Both paths reproduced in memory.

5. **P2 — A missing scope hides something elsewhere.** Asking to hide a toast inside a nonexistent panel falls back to searching the whole document and hides the outside toast. Refuse a missing scope without changing anything, matching the marking operation’s behaviour. Reproduced in memory.

6. **P2 — An invisible mark can still pass the picture check.** Mark an element, then make it invisible without changing its box: the check reports no fault and permits a picture. It checks attachment and geometry, but not visibility. Recheck the element and tag’s visibility, including ancestor opacity, before taking the picture. Reproduced with an in-memory page stand-in; the existing self-test misses this case.

7. **P3 — The register correction stops before the later ruling.** Correcting Personal inputs to allow several people follows D776. But OR8 and OR11 still say “six kinds”; D778 also permits ALL/ALL AVAIL on a one-day Personal input, making seven. State that eligibility explicitly and cite D778 so a future reader does not restore the old refusal.

Tidiness note, changed lines only: the new OR20 table entry says “see below”, although its explanation is above. The marker colour is also defined independently in the helper and comparator.

Checked 22 IDs closely, including every partial-coverage and closed-gap entry. The 109 edits across 23 test files change titles only. I found no title-dependent tool broken by them. Existing rule matching is unchanged: OR2 does **not** match OR20 or OR29; removing OR29’s label makes it unnamed. The rule check and all 16 drawing-comparison self-tests passed.

The comparator leaves the build’s border/shadow values untouched; the text exclusion applies on both sides, specifically beneath the helper’s tag attribute. Shadow-root and iframe contents cannot be reached by its selectors. Real-browser verification—including fixed/sticky parts, transforms, zoom and SVG—and the helper’s browser self-test remain unverified: this read-only session cannot create browser temporary files.

No files changed. Rulings: none this session.