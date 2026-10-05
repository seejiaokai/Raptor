# Schedule Tab — fresh Astra final inspection R1

4 Oct 2026. **CHANGES REQUIRED.** One confirmed P2 application defect, plus two
required evidence corrections/additions before the fresh R2 read. This is the
complete immutable R1 report. The inspector did not author the plan, production
changes, tests or walk drivers, and made no source, test, driver, guide or Git writes.

## Exact snapshot and independent checks

- Branch: `codex/workflow-ui`; local baseline HEAD
  `8b741fdc7eb6030f10cdb8ca97fdd8e58fc10f7a`. Reviewed tracked diff and new files.
- Frozen R2 plan SHA256:
  `13626097C62ECD5D8B5D57C74EA85C32CD99F26BFFA709619B849F6555F66BA8`.
- Freeze15 SHA256:
  `366D75C11BB4D60D358CBC623FB9D224EA2E142527AEBF22207E5E256C494CC8`.
  Independently recalculated all 850 local hashes: 850 unique paths, zero mismatches.
- Independently fetched all 19 nonempty `dist/` entries from
  `http://localhost:4220`: every HTTP response succeeded and its bytes matched.
- Independently compared freeze13 with freeze15. Only
  `src/ui/schedule-tab.test.tsx`, `scripts/handpass/schedule-tab-evidence.mjs` and
  `scripts/handpass/schedule-tab-role-picture.mjs` differ/are added. Production,
  browser tests, broad walk driver, plan and served bundle are identical.
- Portable archive: 24,085,269 bytes, SHA256
  `AFC8FF2E8D8D12034FC8E9B3D1D9A53B38DB2399AE9E233A59DE33BE3985DA80`.
  Independently streamed and hashed every zip entry: 1,049 entries match the
  1,049 indexed paths. All 850 frozen files are members and their archive hashes
  equal the freeze hashes. No extraction over the checkout was performed.
- Independently verified all 21 hashes in `opened-pictures.json`. Walk13's JSON
  contains 19 passing steps, 20 pictures, zero errors, with the extra readable
  role-picture result separate. Hash verification alone is not visual approval.

The FULL tier is appropriate: saving, timing/warnings, issued records, roles,
shared editing and a new gesture are implicated; no new screen is introduced.
This is the independent final-inspection stage of that check, not a replacement
full-suite run. D496 independence and D499 proportionality apply. No main/merge or
owner device approval is inferred.

## F1 — P2: the week leaves derived times stale after finishing a Tab edit

**Confirmed in the actual frozen production browser, twice in independent fresh
contexts.** Normal sign-in and controls only; no model/storage/command injection.

1. At 1440 x 1000, sign in as the demo admin and open Edit Schedule week.
2. In Monday's first flying formation, change Take-off from `12:40` to `1255`.
3. Press Tab. Focus goes to Landing, without changing Landing.
4. Allow the normal task turn to finish (the diagnostic allowed 100 ms), then press
   Enter to finish editing. Wait for settlement (300 ms first run, 500 ms repeat).
5. Read the formation's Area time without focusing or traversing that box.

**Expected:** the stored Take-off is `12:55`, Area time reads `1255-1405`, and the
week refreshes after typing ends without another change or Undo entry.

**Observed:** stored Take-off is `12:55`, exactly one command is added, focus is
`BODY`, but Area time still reads `1240-1405`. The typed Take-off also remains
displayed as `1255` rather than its normal colon display. The first run had zero
page errors. I opened a second-run browser screenshot emitted directly in the
review conversation: it shows `1255` at Take-off and `1240-1405` in the Area strip
together. This screenshot was not added to the immutable host archive or counted
among its 21 originals. This is a targeted reproduction, not a new full walk.

**Cause:** `src/ui/textedit.ts:36` queues `txtCommit`, clears its flag and returns
at line42 while the next field owns focus. `src/ui/EditWeek.tsx:110` likewise skips
its notified render while text owns focus. Leaving an unchanged Landing then
takes the displayed-time no-op return at `textedit.ts:87` and schedules nothing.
The new destination refresh (`schedule-tab.ts:94`) refreshes only the next box;
the Area box was never the destination. `SchedBoard.tsx:214` supplies a pending
paint resume only for the Board, so it cannot settle the week.

**Impact:** after an ordinary, successfully saved keyboard edit the scheduler
sees an old derived airspace window and stale dependent painting until a later
unrelated notification. This is misleading operational information, not lost
storage and not an old-demo-data-only problem.

**Provenance:** checked the corresponding existing text queue and EditWeek guard
in local `origin/main` (`de470db5980cd93378080cdb5e8db970cdf64856`). Both already
drop/skip work while typing. This is an inherited mechanism exposed by the new
continuous text route, not a claim that the entire underlying mechanism was
introduced in this diff. The origin/main reference was inspected locally, not
fetched or run. It remains relevant to D550/D544 and the accepted caret/paint
contract because this new route promises both editors. D56 does not exclude it.

**Required fix and proof:** retain a pending UI repaint for the week when a real
change cannot paint under a caret, resume it when text focus ends, and cancel it
on page/week/session loss or unmount. Keep the existing writer as the sole save;
do not add a second command, validation or polling loop just to repaint. Add a
failing-first mounted regression and a native browser regression for the exact
sequence above. Assert the dependent Area text becomes `1255-1405`, no explicit
Area-time override is stored, the command count stays at one, and no later field
is torn out while continuing Tab. Also prove ordinary unchanged blur/boundary
exit, not only Enter. Re-walk both affected editor mechanisms after the fix.

## Required evidence additions and accurate claims

These are validation gaps, not invented application defects. They must be
resolved or explicitly left incomplete; they cannot be described as completed
TAB10/TAB11 proof in R2.

### E1 — input-owned persistence is a distinct unproved lifecycle

The approved plan and coordination require edit -> Tab -> Undo -> Redo -> reload
once per distinct schedule/input writer path. The walk's
`board-native-save-undo-redo-reload` asserts the callsign after reload. The
input-owned steps assert live input values, refused/equal endpoints and overnight
acceptance; the published step checks issued snapshot isolation. None asserts
the edited input-owned time/remarks after its own Undo/Redo and persisted reload.
The earlier input edit happens before the callsign reload, but that reload only
asserts the callsign, so it cannot prove the input record survived. There is no
demonstrated input-loss defect; the requirement is simply not covered.

Add a small actual-control check of an input-backed Ground row: capture its
stable input id and initial values, edit time and/or remarks with Tab through the
real input writer, assert one corresponding command, use ordinary Undo and Redo,
then same-origin normal-backend reload and sign-in. Assert the input record and
its displayed accepted Ground echo agree. Save and open a readable picture.
Keep the issued-copy isolation check. No broad duplicate full walk is required
solely to supply this missing distinct writer lifecycle.

### E2 — TAB11 and deferred lifecycle claims overstate the mounted cases

The test named `will not navigate stale text after permission, page or
issued-preview context loss` sets DPREV and then a member session. It does not
change page, Board day, week or an admin session while a blur/settlement is
pending. It does not delete a proposed destination or open a dialog during that
transition. Its DPREV value is deliberately not an existing issued version,
which proves the guard, not a real draft/issued preview UI. The evidence sheet's
`session/page/preview guards` shorthand must not imply all were exercised.

The synchronous `sameScope` checks and Board timer cleanup are sensible on read;
I did not reproduce a stale-focus or permission-write defect. However the new
pending work, and now F1's required week settlement, need focused lifecycle
coverage. Add mounted tests that change the page/day or session generation
during source blur and assert no stale destination receives focus; delete or
detach the planned destination and assert safe exit; and leave/unmount while
paint is pending then establish new dialog/text focus. Assert no late repaint
tears out or steals that new focus, and no duplicate write occurs. Give each
actual setup its own accurate name. Existing production session/page controls
and central guards should be used in mounted tests; no runtime permission
injection needs to be credited as an owner-control walk.

## Other risks checked, with explicit negatives

| Area | Inspection result and boundary |
|---|---|
| TAB01 B/reverse and D555 sections | Allowlisted live DOM order is the agreed route; week shared fields and Board repeated aircraft fields are retained. No rectangle sorting or durable field cache. Mounted explicit flight expectations plus native full tours cover both mechanisms. |
| TAB02 ordinary boundaries | Same-day ordinary controls, first reverse, no-following-control blur and phone drawer exclusion are implemented. Real reordered final notes control is asserted. Later ordinary Tab is unhandled; this does not promise all later browser navigation stays on the day. |
| TAB03 eligibility | Current central edit/page checks, Board precedence, connected nodes, ancestor hiding/inert, readonly/disabled text, DPREV/OIL and role/popup exclusions inspected. Empty editable text remains eligible and no picker click is synthesized. No concrete eligibility defect found. |
| TAB04 refused/accepted writers | Native blur/change remains the single writer entry. Input end-before-start is valid overnight, as the coordination correction says; equal endpoints/unreadable input and bad schedule times are refused. No invented timing rule added. |
| TAB05 freshness/no-op | Destination-only refresh uses existing readers. Repeated Board and derived Area destination cases cover stale-value overwrite risk; no-op display-time comparison avoids formatting-only writes. It does not resolve F1 when editing ends before visiting the derived box. |
| TAB06 shifted lines | Immediate survivor and delete-button addresses match live indices after clearing; preselected connected successor survives. First/last runtime and middle mounted checks are bounded appropriately. Middle Board runtime was not claimed; shared deletion body supports that proportional limit. |
| TAB07 caret/paint | Board input-owned native fields are added to the existing caret guard. Board UI-only pending paint and native save-once are covered; week exit settlement is missing (F1). No requirement to alter Board native INPUT Enter behaviour, which this change deliberately preserves. |
| TAB08 roles | No-op tours preserve data/command count and avoid questions. Changed own Remarks offers the question and keeps the stores caret. Existing role code and tests retain Later/Choose/Change. The extra readable screenshot fixes the evidence visibility gap without app changes. |
| TAB09 keys | Router ignores modified/composing/prevented Tab. Existing Enter/Escape branches are unchanged apart from the Tab dispatch before them. Week Enter exposes F1 rather than a new key-meaning change. |
| TAB10 issued records | Actual before/after publish edits, frozen issued snapshot, amendment, OIL readonly and schedule reload are exercised. Input-specific durable lifecycle remains E1. Captured event/OIL readers are observations, not an independently derived entitlement calculation. No formula/permission/schema changed. |
| TAB11 context | Central permission/nav-generation guards and cleanup inspected; mounted evidence is narrower than its title (E2). No independent claim of physical Safari, hardware keyboard, dedicated scheduler or guest execution. |

## Pictures and retained failure/gate evidence

Personally opened these 13 archived originals: walk13 desktop week typing,
Board typing, Board reloaded, role-offer-caret; phone week typing, Board typing,
wide typing, last-box exit, short phone, landscape; published issued readonly;
member readonly; and role-picture-1's readable question. The clipped original
role-offer picture is indeed clipped; the supplemental image shows the whole
question and is supported by its asserted retained stores focus. The phone and
short/landscape pictures show the destination boxes, with existing wide-layout
overflow/toasts retained. I did not independently open the other eight archive
originals, nor all partial-run pictures, and do not claim to have done so.

Read the retained red-unit summary (11 failed/2 passed), both named broken-wire
failures, initial full unit failure (7738 passed/3 failed), corrected full unit
(7747/490), current 79/7 and 58/3 affected runs, full browser 537/49 skipped,
current affected 165, reference728, Tracker445, adapted6 and perf4. The reference
and Tracker logs have their claimed final totals. Perf's absent informational
open-field case is not caret proof. Final build log ends in success. Original
reveal failures and walk1/walk2 covered-box failures remain; completed browser11
and affected165 runs support the later geometry fix. Partially terminated browser
logs with a start line only are not separately counted as passes.

Full unit/browser runs precede the final geometry reveal; subsequent affected
runs and unchanged remaining source justify the stated D499 qualification. They
do not make those broad runs exact-freeze15 runs. New F1 production changes will
need the applicable affected checks and a freshly identified bundle; do not
reuse this review or the old archive as approval of changed source. The host's
lock ownership/release record is retained; this inspector ran no broad/heavy
gate. Closing document checks are separate from the immutable archive.

## D489 tidiness and finish

Changed responsibilities are reasonably separated: navigation in its small
helper, model readers alongside existing text editing, and Board paint lifecycle
in its component. The shared key handler has one delegation, not replicated
routes per family. Existing readers are reused; no new engine parser, schema or
dependency. No separate tidiness job is raised and no refactor was performed.
F1's missing week connection is a correctness repair, not cosmetic tidying.

**Disposition:** F1 confirmed and unresolved in this inspected snapshot.
E1/E2 are required proof/copy corrections, with no unproved application defect
claimed. Return to Sol for the narrow fix and evidence, then one fresh independent
R2 inspection of the new frozen snapshot. Preserve this R1 and its brief verbatim.

**OWED: Claude's independent plan/code/scenario and desktop/phone app reads after
Monday 5 Oct 2026, 19:00, on `codex/workflow-ui`, before main.** This Codex read is
neither Claude approval, owner device approval nor permission to merge.

Walk: reviewed the host's qualified frozen walk; targeted independent F1
reproduction FAIL, screenshot personally opened in conversation. Not a new full walk.
Rulings: none this inspection; D556 and D550–D555 inherited, D496/D499 followed.
