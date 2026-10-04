# Accepted flight taper — implementation addendum, D566, 4 Oct 26

Author: Astra coordinator. Proposed implementation plan; Sol independently challenges before editing.
The owner answered "Yes, use this tapered wing" to the final D565 phone/desktop picture. No product
question remains. This selects option 4, not the rejected first build or the earlier three alternatives.
The original batch plan, design notes, pictures and inspection records remain immutable history.

Parent plan: `2026-10-04-interface-readability-scroll-build-plan.md`.
Exact accepted geometry: `../specs/2026-10-04-flight-leading-edge-taper.md`.
Same `codex/workflow-ui` checkout; no new worktree. Preserve private evidence and old untracked folders.

## Scope and order

1. Preserve the first-build source/test/driver/bundle snapshot and its logs. Record the current diff and
   hashes before this replacement. Prove Logic/Insights source bytes unchanged by this increment.
2. In `src/tracker/app/core.js`, replace only the flight branch's filled polygon with one filled SVG path.
   Retain `innerShape(type,cx,cy)`, existing colour/stroke values, round joins, element order and text.
   Express the accepted coordinates relative to the supplied centre; do not hard-code 29 or introduce a
   wrapper transform that changes text or hit coordinates. The shape remains the first filled child of
   `.core`, immediately before the existing label. Other event types remain byte-unchanged.
3. Update flight identification in `e2e/geometry.spec.ts`,
   `scripts/handpass/interface-readability-scroll.mjs` and `scripts/tracker/smoke.mjs` to accept the path:
   `.core [stroke-linejoin="round"]`, scoped to the flight centre and checked against known flight fixtures.
   Within a core, use its corresponding round-joined geometry element. Remove polygon-only assumptions,
   including secondary shape retrieval after filtering. Keep nonempty counts, text ink assertions,
   contrast, marking and Last Flown expectations; never let zero selected flights become a pass.
4. Add the accepted taper regression before replacing production geometry. Preserve its two RED results
   on the previously checked blocky wing, one per desktop/phone geometry case. Then implement and obtain
   GREEN. Do not rewrite earlier immutable evidence to describe the accepted replacement.
5. Run affected gates, build/freeze the accepted replacement, complete the fresh WALK, then dispatch a
   fresh separate Astra final inspector. This coordinator does not inspect or approve final code.

Relative path coordinates, with each pair added to `(cx,cy)`:

```text
M (0,-18) L (4,-7) L (18,-3)
Q (19,0) (18,3) C (14,5) (10,6) (5,6)
L (8,15) L (0,11) L (-8,15) L (-5,6)
C (-10,6) (-14,5) (-18,3) Q (-19,0) (-18,-3) L (-4,-7) Z
```

No changes to the 58-unit ball, inner radius 19.14, rings, wedges, badges, labels, font storage,
coordinates, marks, event IDs, handlers, rule calculations or permissions. The new shape's stroke-inclusive
radius remains at most 18.90. No data conversion, automatic font fitting or generic symbol redesign.

## Scenario priorities and break evidence

The combined tier stays **WALK**: shared renderer across modes, no writer/permission/engine change.
Original eight risk answers and all surface obligations remain; this is an increment to that plan.

| Priority | Required observation on the accepted build |
|---|---|
| 1 — non-vacuous selection | All 41 shipped flight centres are found, with canonical fonts and nonempty painted glyph samples; every sampled glyph pixel has blue backing. Inspect long-code crops. Preserve non-flight symbols and their contrast checks. A count mismatch stops the check. |
| 1 — selected silhouette | Check straight leading edges and the removed upper shoulder area, curved lower wings and containment. A fill probe at local `(10,-6)` and `(-10,-6)` distinguishes the taper from the rejected blocky shoulder; pair it with positive centre-fill and full backing assertions. Restore the rejected wing deliberately: both width cases must fail for taper geometry, not an empty selector or harness error. Restore final bytes and rebuild afterward. |
| 1 — doors and hits | At desktop and phone, operate Flow, Details and Edit layout. Tap a different student wedge then centre; reverse the order where wiring differs. Details on/off must still choose details versus marking correctly. Label text and wing must not steal a wedge hit. |
| 2 — authored data | Exercise an existing saved font/layout/detail fixture, reload and compare its stored values and displayed selection. Check the relevant authored-font range without changing it to make the shape fit. Report any existing unsupported range rather than truncating or shrinking. Marks and Last Flown remain correct under the unchanged smoke assertions. |
| 2 — overlays and transitions | Inspect selected/search/available rings, mixed marks, failures and numbers, zoom and leave/return. Preserve explicit earlier limits for third-student/guest/issued/pinch coverage; do not silently relabel omissions as current proof. |
| 2 — combined batch | Fresh native walk retains Logic search/filter scroll and actual member restriction, plus the five distinct Insights opener/width families, close reachability and return surface. Reuse identical data lifecycle proof once where D499 allows; operate each distinct door and both widths. |

Do not substitute a text bounding-box rectangle for glyph ink. Keep all character coverage and actual
font checks; candidate-picture samples alone covered only three labels at 8.5px. The all-41 application
check, saved-font case and current native pictures provide the broader proof. Confirm no unexpected
console errors or storage mutations throughout the walk.

## Proportionate refresh, freeze and delivery

D499 retains normal gates and permits avoiding repeated broad work only when no relevant change exists.
Here `core.js` is imported by many Tracker unit files, geometry browser tests change, and smoke/handpass
selectors change. Run focused RED/GREEN checks while editing; once settled refresh `npm test`,
`npm run build`, `npm run test:e2e`, `npm run smoke:tracker`, `npm run perf`, `npm run rulecheck` and the
host's closing `npm run docsize`. This is one final refresh for relevant changes, not a repeated loop.

Reference 728 and adapted 155 first-build passes may be carried forward only with explicit unchanged
input/dependency hashes and a written reason the flight renderer/test-driver delta cannot affect their
execution. They remain retained normal-gate proof tied to the first build, not new results on the final
snapshot. If that dependency evidence is unavailable or any relevant input changed, rerun those gates.
Sol challenges this disposition before execution; D499 supplies no blanket gate waiver.

Use the PC lock for the full unit suite, browser gate, Tracker smoke, perf and fanned-out walk, releasing
after each completed run. Keep logs and exit codes. Preserve failures and fix their causes; never weaken
assertions, run overlapping heavy checks or rebuild under an active frozen walk/inspection.

Create a new snapshot of source, tests, drivers, plan/addenda and built bundle. Match all actual served
assets (previous inventory 19) with nonempty HTTP evidence; investigate a changed count rather than force
it. The earlier snapshot and Walk9 describe the rejected first wing. Record a new current Walk line,
two-width/mode roll-call, gate provenance, opened pictures, break results and limitations. No screenshot
or private fixture enters the repository or public preview assets.

Fresh Astra final inspection receives this addendum, Sol's challenge, accepted picture ruling, exact
frozen snapshot, complete batch evidence and all prior finding dispositions. Keep the code frozen while
it reads. After any fixes, refresh affected proof before its bounded fresh read. Only then branch push,
current Ready preview receipt and owner link. No main push, merge or merging PR. OWED: Claude's plan,
code, scenarios and independent desktop/phone reads after Monday 5 Oct 2026 19:00 Asia/Singapore before main.
