# Schedule Tab — fresh Astra final inspection R2

4 Oct 2026. **PASS for the exact freeze18 snapshot below.** No unresolved
blocking finding from this inspection. R1 F1 is corrected; E1 and E2 have the
required additional proof with the limits stated below. This is the complete
second and final allowed Codex code-inspection report, not a conditional or
empty approval. The inspector is separate from the planner, builder and R1
inspector, and authored no production code, tests or evidence drivers.

## Authority and scope

Read the current handoff, required general rules, scheduler rulings and the
relevant full rows, project guide, executor, bug-check order, D496/D499 workflow,
frozen plan, coordination note, both inspection briefs and complete R1 report.
D556 accepts the numbered pictures and authorizes D550–D555's agreed route;
D544 and D529 remain binding. D554/D555 supersede the earlier spatial shorthand.
The backlog still retains the feature and its remaining owner/Claude gates.
No new product choice, main push, merging PR or live merge is authorized.

Reviewed the whole tracked/new feature against baseline HEAD, not only the
correction: `schedule-tab.ts`, `textedit.ts`, `SchedBoard.tsx`, `EditWeek.tsx`,
the mounted and native-browser tests, Playwright registration, all three
evidence drivers and the affected contracts/maps. Followed existing native
writers, model readers, central permission/edit-mode checks and navigation
generation to their relevant call sites. Earlier stylesheet split and phone
Desktop repair are inherited history, not newly approved keyboard work.
The unrelated `.claude/insights-baseline-check/` was untouched.

The FULL tier is correct: timing/earned consequences, issued records, saved
data, shared editors, a new gesture, roles and warnings are implicated; there
is no new screen. This inspection follows the host's full check and walk.
It does not replace them or claim to have independently rerun the full suite.

## Independently verified identity and evidence chain

- Branch `codex/workflow-ui`; baseline HEAD
  `8b741fdc7eb6030f10cdb8ca97fdd8e58fc10f7a`.
- Frozen plan SHA256
  `13626097C62ECD5D8B5D57C74EA85C32CD99F26BFFA709619B849F6555F66BA8`.
- Freeze18 SHA256
  `C53CCB9B270A5B8A617362E1E22AA7CC5D0E76AB72A27835D1C90C099A3CEF8B`.
  Recalculated all 850 files: 850 unique paths, zero mismatches.
- Fetched each of the 19 actual `dist/` files from `http://localhost:4220`:
  all successful, nonempty HTTP bodies, every hash matching freeze18.
- R2 archive is 11,098,920 bytes, SHA256
  `85FEBB4AF1803491E20543C74ADD653074E142028695D929FF5F3BFA24290C44`.
  Independently streamed and hashed all 912 zip entries. They match the 912
  unique indexed paths; every one of the 850 frozen files is present with the
  freeze hash. No extraction over the checkout was performed.
- R1 report remains byte-identical at SHA256
  `938682DAF8AE8247C24B824ECA22A854B4E059DAA3011520E3CFB084EB8AD39E`.
  Original archive remains separately at SHA256
  `AFC8FF2E8D8D12034FC8E9B3D1D9A53B38DB2399AE9E233A59DE33BE3985DA80`.
  This read rechecked its archive hash, not each old entry a second time.
- Freeze15→18 production differences are only the week pending-paint connection
  and the router's post-blur focus guard; tests, build outputs and proof drivers
  carry the corresponding additions. Freeze16→18 differs only in the broad
  walk driver. Production, tests, browser tests, plan and bundle are unchanged
  across that latter fixture correction.
- Recalculated all 23 hashes in `opened-pictures-r2.json`: no mismatches.
  Walk16 records 21 passing steps, 22 images and zero errors; the supplemental
  role-picture2 is separately passing. Hashes were not substituted for looking.

## R1 disposition

### F1 — corrected, independently exercised

The week now retains a pending UI paint when its ordinary notification cannot
paint beneath an active text caret. On focus exit it schedules one UI settlement
through the existing day/block diff, rechecks page/navigation and editing state,
and removes its listener/timer on unmount. It does not replay the save command,
history or validation. An unchanged Landing exit can therefore repaint Take-off
and the dependent Area window without requiring that Area ever receive focus.

Read the retained failing-first evidence: three mounted week exits failed with
the old Area window; native Enter and final Tab failed on the same value, while
ordinary header click already passed. The difference is correctly retained,
not described as three native failures. Current mounted/browser tests assert
the derived window, colon display, no stored override and one save.

Additionally ran a small native diagnostic on the independently matched current
production server, in two fresh browser contexts with normal sign-in and
controls. For each: Monday Take-off `1255` → Tab → unchanged Landing; waited
100 ms, then either Enter or focus the day's last input Remarks and final Tab.
Both finished with Take-off `12:55`, Area `1255-1405`, no `atime` override,
exactly one added command, BODY focus and zero console/page/HTTP errors.
No source/test/driver edits, model injection or storage injection were used.
This targeted diagnostic produced console results only; it is not a new full
walk or an extra archived picture. The host's readable current F1 original was
personally opened and shows the corrected Take-off and Area together.

Disposition: **F1 resolved**. Its original provenance remains R1's inherited
deferred-paint mechanism exposed by the new continuous route. No claim is made
that every line of that old mechanism was introduced by this feature.

### E1 — distinct input lifecycle now proved

Read the actual driver and result, not only the step title. It selects the
current day's accepted Ground source by stable input id, changes the input
Start and Remarks through existing `data-ifld` controls, asserts one command
for each change, and uses the ordinary Undo/Redo buttons for each. It waits for
the normal browser backend, reloads the same origin, signs in normally, and
asserts the input record, open Personal Inputs controls and Ground's distinct
`data-bfld` echo. It does not count one locator family twice as two surfaces.

The recorded input goes from 600 to 615 minutes, retaining end660, and from
`HSP blood panel` to `TAB INPUT DURABLE`; its accepted Ground row carries
`10:15`, `11:00` and the same saved remarks after reload. Personally opened
the readable picture showing those matching Ground and Personal Inputs rows.
This supplies the previously missing input-owned writer lifecycle alongside
the separate schedule callsign lifecycle and issued-copy isolation check.

Disposition: **E1 resolved**. Partial14's wrong echo-family assumption and
partial15's wrong-day fixture selection are preserved as harness failures;
they are not hidden app passes or evidence that an input was lost.

### E2 — accurate lifecycle proof and focus guard

The old preview/permission test is now named for what it actually does. New
mounted cases separately change page, Board day or admin session during source
blur, detach the proposed destination, and deliberately focus a dialog input
during blur. The router rechecks current scope and preserves focus acquired
by another handler instead of overriding it with its collected successor.
The dialog-focus case is retained failing-first on the old router.

Additional week/Board cases establish a real saved edit and pending paint,
then change page/day/session or unmount and establish new dialog focus. They
assert the new focus remains connected and that no extra history write is
added. These are mounted lifecycle/outcome checks, not a literal measurement
of the private pending flag or a claim that a production modal-opening fault
was reproduced. On code inspection, the page/nav/day guards and effect cleanup
provide the cancellation; existing navigation generation also covers a week
change. There is no delayed focus request and no polling loop.

Disposition: **E2 resolved with those explicit proof boundaries**. A real
stale-session or saved-draft-preview UI tour, physical browser focus behaviour
in Safari, and a production dialog-opening reproduction are not claimed.

## Whole-scope risk read and explicit negatives

| Risk | Result and scope of proof |
|---|---|
| TAB01 B/reverse, D555 order | Live allowlisted DOM collection follows displayed sections. Week shared five appear once, Board repeats each aircraft's five. Explicit flight tests supplement full tours, so the agreed flight sequence is not inferred only from the collector itself. No persistent field cache or rectangle sort. |
| TAB02 boundaries | Existing preceding/following ordinary same-day control, otherwise blur; no synthetic activation, loop or day jump. Board day controls and parked crew drawer are excluded. Reordered final notes has a real following button. Later non-text Tab remains ordinary browser navigation; that later navigation is not promised to remain on this day. |
| TAB03 eligibility | Central edit permission/mode includes protected-week refusal; page, Board precedence, current day, DPREV/OIL, connected/rendered ancestors, disabled/readonly and role/dialog exclusions are present. Empty editable boxes remain eligible; a picker is never clicked by the router. No concrete eligibility bypass found. |
| TAB04 save/refusal | Native blur/change invokes the existing schedule or input writer once. Router and destination refresh contain no model writer. Existing input overnight acceptance is preserved; equal endpoints and unreadable clocks are refused. Frozen plan shorthand is correctly corrected by the coordination record. |
| TAB05 no-op/freshness | Existing readers refresh only the unfocused destination. Repeated Board fields and derived Area have explicit tests; the time display comparison avoids formatting-only amendments. Whole unchanged tours compare schedule, inputs and command count. No opts initialization or new schema. |
| TAB06 deletion | Immediate in-time survivor/delete-button reindexing matches shifted model positions before the neighbour can save. Preselected connected successor remains valid; detached successor exits safely. First/last runtime and middle mounted proof are accurately distinguished. |
| TAB07 caret/settlement | Native Board input-owned fields join the existing caret guard; both editors settle skipped paint on text exit. Continuous Tab retains the connected destination; F1's previously missing week exit is now proved. No second command or validation is introduced solely to paint. |
| TAB08 role question | Unchanged traversal remains silent. Changed own Mission/Remarks retains normal save-first offer and next stores caret; original clipped picture is not used to prove offscreen question text. Supplemental current picture shows the complete question. Existing Later/Choose/Change readers and focused regressions retain their roles. |
| TAB09 keys | Modified/composing/prevented Tab is unhandled; Enter/Escape branches retain their existing meanings. Native Board controls remain on their existing key path. No custom global focus trap or tabindex rewrite. |
| TAB10 durable/issued | Both distinct writer lifecycles now have Undo/Redo/reload evidence. Actual edit-before-publish and publish-before-edit checks compare the issued snapshot, then issue the amendment. Readonly issued/OIL controls and member view are checked. Event/OIL snapshots are observed downstream values, not a newly derived independent entitlement calculation. |
| TAB11 context | Synchronous post-blur permission/navigation checks, retained new focus, destination connectivity and bounded UI-settlement cleanup were read. New mounted cases cover the specified transition outcomes. No claim of unavailable dedicated scheduler/guest execution or a real saved-draft-preview tour. |

No concrete new defect was found in the changed writer connections, native
event ordering, refresh/read paths, pending settlement or focus boundaries.
Old-demo-data-only harms were not manufactured as findings (D56); that exclusion
was not used to dismiss R1's real forward-going failure.

## Pictures, checks and remaining limits

Personally opened 14 current originals: walk16's week-derived-settled,
input-durable-ground-echo, Board-reloaded, Board-reordered, phone-week-typing,
phone-Board-typing, phone-wide-typing, phone-short-phone, phone-landscape,
phone-last-box-exit, published-everything-day, published-issued-readonly,
member-readonly, plus role-picture2's complete question. The other nine current
originals are covered by the host's recorded inspection and verified hashes;
this report does not claim to have opened them or every partial-run image.

The short and landscape pictures visibly retain the existing Desktop-mode toast
over part of the field. Their runtime assertions establish active connected
focus and a hit on the field's visible portion; the pictures do not establish
fully unobscured text during that toast. This is the declared inherited limit,
not a new promise or a request to redesign unrelated popups. Wide-layout
overflow remains the accepted horizontal layout. Chromium emulation does not
prove physical iPhone Safari or hardware-keyboard behaviour.

Read retained red mounted/native correction logs, green focused52/3, current
full unit7765/490, affected browser168, successful build, adapted6 and perf4.
Read both original broken-wire failure endings. Required performance ceilings
remain unchanged (week5131/5450, Board1018/1150); isolation and scroll400→400
pass. The informational no-field performance case is not counted as caret proof.
Earlier full-browser537 plus49 existing skips, reference728 and Tracker445 are
retained scoped checks, not newly rerun exact-freeze18 broad checks. No engine,
Tracker reader or unrelated browser surface changed in the correction; D499's
affected rerun qualification is appropriate. No assertion or timeout relaxation
appears in the inspected correction. This inspector ran no heavy gate and
required no PC gate lock. Closing rulecheck/docsize and branch shipping are the
host's subsequent record work, not part of the immutable archive's contents.

## D489 tidiness and final disposition

Responsibilities stay coherent: navigation/eligibility in one helper, existing
text readers and commit handling in text editing, UI paint ownership in each
dense editor. The two small settlement effects reflect their different scope
checks and repaint owners; no concrete failure justifies a new abstraction.
Existing readers/writers are reused without a competing time parser, permission
policy, schema, dependency or engine rewrite. No tidiness refactor is requested.

**PASS:** F1/E1/E2 resolved for freeze18 with the limits above. No further code
change or third Codex inspection is requested. Changes after this snapshot are
outside this verdict; passing this read does not spend the owed later gates.

**OWED: Claude's independent plan/code/scenario and full desktop/phone app reads
after Monday 5 Oct 2026, 19:00, on `codex/workflow-ui`, before main.** Owner
preview/device look and his explicit live word remain separate. This Codex
inspection grants neither Claude approval nor permission to merge.

Walk: reviewed host's corrected frozen21-step walk and14 current originals;
independent targeted native week Enter/final-Tab diagnostics PASS, zero errors.
Not a replacement full app walk.
Rulings: none this inspection; D556/D550–D555 inherited, D496/D499 followed.
