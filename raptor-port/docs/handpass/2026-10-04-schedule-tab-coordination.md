# Schedule Tab — independent scenario coordination

4 Oct 2026. Astra read-only coordination while Sol builds. This is scenario design and
source orientation, not code approval or executed runtime evidence. The approved R2 plan
remains unchanged at SHA256
`13626097C62ECD5D8B5D57C74EA85C32CD99F26BFFA709619B849F6555F66BA8`.
D556 full/short rows and the route-spec/backlog homes were independently read: their
picture acceptance and agreed-build authorization preserve D550–D555 and all review/main
limits. The host updates its current handoff as this build proceeds.

## TAB04 correction — existing input semantics, no new product decision

The R2 table's shorthand "invalid/end-before-start heals" is wrong for input-owned times.
**An end before its start is a valid overnight absence; equal endpoints and unreadable
time are refused.** Keep the frozen plan/hash and this correction together; do not change
the writer or weaken an existing test to satisfy that shorthand. Sol accepted this
correction before building the checks.

Authority: `src/ui/inputedit.tsx` around 519–525 and `setInpField` at1285;
`src/ui/inputedit.test.tsx` 189 (unreadable refusal), 202 (overnight acceptance),
210 (equal-endpoint refusal), and 218 (one edit, one Undo step). Example: 22:00→02:00
must save as overnight; 09:00→09:00 heals to the prior valid end. TAB04 tests both.

## Existing check homes

| IDs | Smallest useful existing support / required addition |
|---|---|
| TAB01/02/03 | New focused navigation tests plus `e2e/geometry.spec.ts` for native Tab and layout eligibility. Existing phone Desktop repair at18 must stay green. Section drag example2467–2493 supplies the real reorder gesture. |
| TAB04/09 | `src/ui/textedit.test.tsx`48–106, `boardwrap.test.tsx`120–154 and `inputedit.test.tsx`120–241. Existing blur-only tests are regressions, not proof of the new key route. |
| TAB05 | `editlog-writers.test.tsx`77–146 (stores/Area/time/in-time history); `stsaved.test.tsx` (changed-only feedback); inputedit137 no-op all-day. Add traversal via actual key events. |
| TAB06 | `rally-feedback.test.tsx`58–76 plus a mounted first/middle/last line deletion→next-line edit case in both renderers. Check shifted addresses and exact surviving model line, not just count. |
| TAB07 | New mounted caret/paint regressions on actual EditWeek/SchedBoard, with Board data-ifld targets. Browser must assert active node remains connected, value and caret survive, and deferred paint settles on exit. |
| TAB08 | `mission-role-offer.test.tsx`36–105 and dirty-role tests from136; `mission-role-interim-fixes.test.tsx`62–88; `e2e/insights.spec.ts`16–27 already drives native Tab. |
| TAB10 | `scripts/handpass/insights-publication.mjs`53–66 snapshot/publish/preview/live and84–85 Undo/Redo patterns; `lib.mjs`221 readDay and285 signState. Observe real envelopes/history and issued copy, not only input value. |
| TAB11 | Existing mission-role reset test83 and board permission/refusal tests around `board.test.tsx`1612–1800. New stale session/day/fold/delete tests exercise the navigation handler and pending UI work. |

Do not lose two dependency cases inside a generic no-op check: (1) edit Take-off, remain
in the Tab chain, traverse derived Area time untouched; assert no stored atime override,
no phantom history, and a correct new derived window; (2) edit first-aircraft CS/Mission/TO,
then reach the Board's repeated second-aircraft box; assert it shows the just-saved model
value and does not revert that edit. These are risks to test, not reported proven defects.

## Smallest sufficient runtime scenarios under D499

1. **Route and eligibility:** one populated weekday through each text family on week and
   Board, forward/reverse; multi-aircraft flight; supporting/empty notes; manually opened
   and folded Personal Inputs; standalone omissions. Native keys, no synthetic change.
   Observe representative current page and both widths, including Board phone Desktop mode.
2. **Changed writer versus no-op:** schedule text/time, input time/remarks, in-time, stores,
   Area and Area time each save through their real field once; traverse unchanged again.
   Capture command count/history, refusal healing, no-op marks, derived dependency cases
   above and stores flash. Overnight acceptance is distinct from the equal-endpoint refusal.
3. **Live focus:** first/middle/last in-time clear followed by forward/reverse neighbouring
   edit, Board native→input-owned→native fields, rapid repeated Tab, final unchanged field
   exit, Enter/Escape, and changed Mission/Remarks offer with Later/Choose/Change. Confirm
   actual selection/focus and pending repaint; a persisted model value alone is insufficient.
4. **Boundaries and order:** ordinary first/last examples, no-following-control blur fallback,
   phone no day jump/no closed-drawer focus, next ordinary Tab unhandled after text exit;
   use real section drag to make a section with a trailing control last, traverse again,
   undo reorder and reverse. No data injection to simulate displayed section order.
5. **Persistence and issued state:** once per distinct schedule/input writer path, changed
   value→Tab→Undo→Redo→reload, edit-before-publish and publish-before-edit, actual sign/publish
   controls, issued preview stays frozen while working copy is pending. Confirm input-backed
   ground time/remarks and existing timing/work-span/earned result through their real reader.
   Read current expected values; do not copy old fixture comments as today's authority.
6. **Denied surfaces and reach:** actual member and reachable readonly preview/OIL states;
   no entry to their text route. Mounted tests cover stale role/session transitions. At
   phone/desktop/short height verify focus reveal, warnings/role offers and overlay hit
   targets. Share identical lifecycle proof across widths, but repeat differing mechanisms.

Reuse `lib.mjs` open/login/read helpers and `fixture.mjs buildSaturday` only after checking
current controls; the latter creates the everything-day through app controls. Save a
same-origin fixture only after a real write. No fresh sign-in midway through an unwritten
demo fixture. No need to rerun the entire old Insights walk for this feature.

Important helper limits: `lib.mjs type()`167 explicitly blurs and force-clicks; it cannot
prove Tab navigation. `lib.mjs closeBoard()`78 looks for retired Close, then Escape;
prefer the visible `#sbDone` path used by insights-editing16. Generic `go()` uses the probe
bridge and is setup-only proof; the walk uses desktop nav or phone `#burger`→`#drawerNav`.
`e2e/app.ts settleWeek()` watches horizontal week plus actual page vertical scroll;
`settleBoth()` alone does not prove the week page has stopped scrolling.

## Commands and execution boundaries

From `C:/Users/User/projects/Raptor/raptor-port`, focused Vitest can group the new navigation
test with textedit, boardwrap, inputedit, editlog-writers, stsaved, rally-feedback and both
mission-role UI test files. Run only affected groups between fixes, then the required
full gates once on the final snapshot. Example browser focus:
`npx playwright test e2e/geometry.spec.ts --project=raptor --grep "schedule Tab|phone Desktop"`.
Use the actual chosen test titles; a zero-test run is not evidence.

`playwright.config.ts` has an explicit raptor `testMatch` list. A new schedule-tab.spec.ts
needs registration or it will never run; adding tests in geometry.spec.ts avoids that hole.
The Playwright server may reuse an existing local preview: verify served build identity,
use the owned free E2E_PORT and keep the PC lock around every required heavy run.

Required scripts remain `npm test`, `npm run build`, `npm run test:reference`,
`npm run test:e2e`, `npm run smoke:tracker`, `npm run probes:adapted`, `npm run perf`,
`npm run rulecheck`, `npm run docsize`, with current shipping sequencing/lock rules.
New walk uses a fresh evidence directory, exact source/test/driver/plan freeze and served
asset proof. Selected distinct screenshots only; each is opened. Report errors and absent
fixtures explicitly. Fresh Astra final inspection is separate; Claude Monday reads remain
owed. No heavy check or app walk was run by this coordination task.
