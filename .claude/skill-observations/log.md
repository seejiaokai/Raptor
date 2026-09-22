# Skill Observation Log

Observations captured during task-oriented work.

**Status key:** OPEN = not yet actioned | ACTIONED (YYYY-MM-DD) = skill
updated/created | DECLINED (YYYY-MM-DD) = user decided not to pursue —
resolved statuses always carry their resolution date

---

## 2026-08-17

### Observation 42: The background-cwd trap bit again despite bold docs — needs structural enforcement

**Status:** OPEN
**Date:** 2026-09-01
**Session context:** Leave War keep-alive fix; launching `npm run test:e2e` as a background task
**Skill:** repo working rules (raptor-port/CLAUDE.md §Build & verify) / harness usage
**Type:** internal
**Phase/Area:** running gates in the background

**Issue:** CLAUDE.md carries a bold, blockquoted warning (added after this
bit twice on 30 Aug 26) that background commands start at the REPO ROOT and
must be prefixed with `cd /home/user/Raptor/raptor-port &&`. It still bit a
third time this session: a backgrounded `npm run test:e2e` died instantly
(exit 144), and only an explicit post-launch check (`/proc/<pid>/cwd`)
confirmed the retry was in the right place. A rule that keeps failing in the
same way is a structural-enforcement candidate, not a louder-docs candidate.

**Suggested improvement:** Enforce structurally instead of textually — e.g. a
root-level `package.json` whose scripts just `cd raptor-port && npm run …`
(making the bare command work from anywhere), or a hook that rejects
backgrounded `npm` commands lacking the cd prefix. Either removes the
failure mode instead of documenting it.

**Principle:** When the same documented rule is violated repeatedly, stop
strengthening the wording and change the environment so the wrong command
cannot fail silently — make the bare form work, or make it refuse loudly.

## 2026-09-06

### Observation 43: Design hook scans engine and test files where design rules cannot apply

**Status:** OPEN — approved by the owner (D71, 2026-09-23) but held back: add `.impeccable/config.json` = `{"detector":{"ignoreRules":[],"ignoreFiles":["raptor-port/src/engine/**","**/*.test.*"],"ignoreValues":[]}}` (what `hook-admin.mjs ignore-file` writes) in the next change that touches code, because a config-only merge would bill a full CI run
**Date:** 2026-09-01
**Session context:** Bug hunt #3 (reorder/drag machinery) — edits to src/engine/reorder.ts and two test files
**Skill:** impeccable (hooks)
**Type:** open-source
**Phase/Area:** hooks — file filtering

**Issue:** The impeccable design-detector hook fired on every edit to
`src/engine/reorder.ts` (a pure TypeScript engine file) and `*.test.tsx`
files, each time reporting "no deterministic design-quality issues found",
then suppressed itself after 6 edits on the engine file and suggested
`/impeccable audit` — on a file with no UI in it. Pure noise: no design rule
can apply to an engine module or a test file.

**Suggested improvement:** The hook's default file filter should exclude
`*.test.*` and paths matching engine/data layers (or include only files that
emit markup/styles — `.css`, `.tsx` components, html-emitting `.ts`). The
skill's `hooks ignore-file` verb exists; the improvement is shipping sensible
default exclusions so users don't need to discover it.

**Principle:** A hook that watches file edits should scope itself to files
its rules can possibly apply to; firing "no issues" on out-of-scope files
trains the reader to ignore it on in-scope ones.

### Observation 120: Vendoring a whole app as a tab is a repeatable recipe — worth a skill

**Status:** OPEN — deferred by the owner (D73, 2026-09-23): write the "whole app as a new tab" guide only if a third app is brought in as a tab
**Date:** 2026-09-07
**Session context:** Merging the standalone OCU Progress Tracker (seejiaokai/Tracker) into Raptor as a new tab — the second time this repo has vendored a whole React app (Leave War, 16 Aug 26), and the steps were the same both times.
**Skill:** New skill candidate: vendor-app-as-tab
**Type:** open-source
**Phase/Area:** whole workflow

**Issue:** Both merges followed one unwritten sequence, re-derived from the first merge's comments each time: (1) intersect the two apps' element IDs and CLASS names before touching anything (this merge found 2 id collisions and 5 bare-class collisions — `.day`, `.modal`, `.sub` … — the class ones only surfaced when the vendored browser suite ran inside the host); (2) wrap the vendored stylesheet in the host's page-section selector with native CSS nesting, converting `:root`/`body`/`#root` rules to `&` and moving body-appended elements' rules OUTSIDE the wrapper; (3) replace the vendored app's storage/sync layers with one small doorway module of the same async shape; (4) put the host→guest role flag in a no-import module so the host can set it without loading the guest bundle (the first cut pulled ~280 KB into the host's first download via a store import); (5) keep the guest mounted after first visit when its render is imperative/once-only, and gate its document-level listeners on an `active` prop; (6) adapt the guest's browser suite by replacing every `goto`/`reload` with ONE "open via host login + tab" helper; (7) enforce the host's roles at the guest's write paths AND its affordances, and pin the pair with a test.

**Suggested improvement:** Write a `vendor-app-as-tab` skill whose core is that ordered checklist plus the two audits as runnable one-liners (id intersection; class intersection restricted to bare-class rules in the host stylesheet). Include the "measure the guest's column height off the section's own top edge, not a hard-coded bar height" note and the "lazy chunk regression guard" test pattern.

**Principle:** A second occurrence of a multi-hour integration is the moment to capture it as a skill; the two collision audits are the part nobody remembers and the browser suite is the only thing that catches what they miss.

### Observation 122: "Keep it mounted" is not enough when the HOST unmounts everything — a once-only imperative init needs a remount redraw

**Status:** OPEN — deferred by the owner (D73, 2026-09-23): write the "whole app as a new tab" guide only if a third app is brought in as a tab
**Date:** 2026-09-07
**Session context:** Bug sweep after vendoring the OCU Tracker into Raptor as a tab. The tab was kept mounted across tab switches because its flow board is drawn imperatively by a once-only init — but Raptor's logout swaps the WHOLE shell for the login screen, so the next login remounted the tab with an empty board and the guarded init drew nothing. Found only by a scenario that crossed a session boundary; every tab-switch test passed.
**Skill:** New skill candidate: vendor-app-as-tab (extends observation 120)
**Type:** open-source
**Phase/Area:** integration checklist — lifecycle

**Issue:** The "keep the guest mounted so its once-only render survives" rule (obs 120, step 5) has a hole: any host lifecycle that unmounts ABOVE the guest (logout, a route change, an error boundary reset) brings the guest back with fresh DOM and a guard that refuses to re-run. Tab-switch tests cannot see it.

**Suggested improvement:** Add to the vendor-app-as-tab checklist: "for every once-only init in the guest, make the mount effect 'boot if not ready, else REDRAW' — and test mount → unmount → mount explicitly, plus the host's session boundary (logout/login) in the browser sweep." The bug sweep's scenario list (session boundary, in-between widths, live resize, host overlays over the guest, host notify while the guest is up) is the reusable part.

**Principle:** A guard against double-initialisation is also a guard against re-initialisation; wherever a host can recreate the guest's DOM, the guest needs a redraw path that is not the init path — and the test that proves it must cross the host's own lifecycle boundaries, not just the guest's.
