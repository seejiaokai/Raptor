# Phone Desktop Board — fresh Astra final inspection R1

**Verdict: PASS for the bound D548 repair.** Initial final inspection 1 of at
most 2 under D496. No concrete defect or blocking absence found. This is the
fresh independent read of Sol's implementation, not approval of Astra's plan,
an owner picture approval, Claude approval, or permission to merge into main.
Only this report was written by this inspector.

## Authority and scope

Read the immutable inspection brief, AGENTS, HANDOFF, the six required general
rule files, project guide/map, scheduler and people-account rulings, executor,
temporary review workflow and bug-check order. Opened relevant full ruling rows
D489/D496/D499/D541/D547/D548, the repair plan, scope/backlog records, prior
investigation and repair evidence. Read the applicable layout/performance
guardrails and searched the guide by heading; no protected guide was changed.

D548 authorizes restoration of the blank schedule in the phone Board's existing
Desktop layout. D547 leaves the accepted New input scrolling unchanged. The
crew-header/popup investigation is not additional repair authority; pending
keyboard/Tab choices are not answered here. D541's candidate presentation and
Sol's independent plan challenge are recorded before the source edit. Candidate
pictures remain candidate evidence, not final-build or owner-approval evidence.

WALK is appropriate: money NO; published-record semantics NO; saved data NO;
shared rendering YES; existing mode behaviour YES conservatively; new surface
NO; permission rules NO; warning meanings NO. The publication/role regression
gates are retained; a fabricated issued or guest fixture is unnecessary for this
property-only restoration. This inspection follows the completed walk/gates; it
does not substitute for them or repeat broad checks without a concrete concern.

## Snapshot verified independently

- Workspace: `C:/Users/User/projects/Raptor`; branch `codex/workflow-ui`.
- HEAD/baseline during inspection:
  `e9d6ea62c7ff4a70be5d9f315b90913124e0653b`.
- Repair manifest: `../img/handpass/2026-10-04-phone-desktop-board/source-freeze.json`.
  SHA256 `b45eb292d46ea445b1b420266d5250e8609f4a5b303f88b122486a10f44b5f9b`.
- **All 848 entries independently checked for length and SHA256; 848 unique
  paths; zero missing/mismatching entries.** Includes 809 source files, all 11
  current browser-test files, all 19 current dist files, the repair/split plans
  and bound drivers. Independent directory enumeration found no unbound current
  file under `src/`, `e2e/` or `dist/`.
- Repair plan SHA256 independently matches
  `cd4f1dee8a275a8464e4458d35150e5f5e1ea74b5b42df4310e6289f276d8414`.
- Immutable older split manifest: 834 entries; independently verified SHA256
  `a5841180ff6c4d3e45cea4ff30cb3e028f27257d1886e868354c1765532d1ee5`.
  Comparison of every old non-dist entry finds only the intended responsive
  stylesheet change. That manifest omitted e2e; it is not used to certify the
  new regression. Current bundle hashes are not claimed equal to the old bundle.
- Read the actual baseline-to-working-tree source/test diff. Only production
  delta is `display:flex` and its cause comment in the existing wide-wrapper
  rule. The diff also removes one trailing blank line, with no CSS effect.
  Only test delta adds the browser regression; existing assertions are unchanged.
  Other tracked changes are owner-ruling/evidence/handoff documentation.
- Read the supplemental 19-file HTTP hash result and independently fetched all
  19 current dist URLs from the still-running local preview. Every response
  succeeded and matched the manifest's size/SHA256, including index, main CSS/JS
  and lazy assets. Zero mismatches. No rebuild or application mutation was made.

The earlier empty `assets[]` loop proves nothing: its absolute-assets matcher
missed Vite's relative links. The supplemental enumeration and this independent
nonempty HTTP check close that evidence gap without rewriting the failed proof.

## Code, regression and absence read

The cause is confirmed in the cascade and markup. The base wrapper is a flex
column. At widths up to 820px, normal phone mode flattens it with
`display:contents` so sign-off, warnings and schedule share the phone scroller.
Wide mode restores a horizontal parent and existing desktop sizes/overflow but
previously omitted the wrapper's display restoration. Its sign-off and schedule
therefore became separate horizontal flex items; the ten sections collapsed.

The more-specific existing wide selector now restores `display:flex`. The base
`flex-direction:column` still applies. The normal phone selector remains intact;
above 820px the wrapper was already flex, so the new property restates its
existing display. Minimum widths, flex sizes, overflow, side-column width,
control dimensions and ordering declarations are not changed.

Checked the real Board markup, ordinary date-door permission condition and
More-menu toggle. The repaired ancestor contains sign-off and the one schedule
container, covering all ten section families without new renderer call sites.
The same tree is used for working and existing preview states. Nothing changes
engine arithmetic, storage, published records, sign-off values, role gates,
warning wording, hidden controls, data writers or handlers. No missing alternate
wide-wrapper instance was found. Ordinary week/viewer surfaces do not match the
changed selector.

The new regression uses normal sign-in, Edit Schedule, date, More, Desktop
layout. It requires ten sections, each wider than 300px, sign-off above schedule
and a visible populated note row with usable width. It is not a heading/class
test and it weakens no earlier assertion. Read its retained red failure at width
0 and same-test green result. The final driver independently reintroduces only
`display:contents!important`, runs its normal width assertion and catches the
expected failure at width 0 for all ten sections; it removes the style, asserts
its absence, then requires green before qualifying final states.

D489 tidiness questions on changed lines: no new responsibility placed in a busy
file; no feature-only branch added to a shared flow; no existing helper duplicated
by production code. No refactor or tidy-up is warranted by this repair. No engine
tidying was proposed. No control-size finding is inferred from small dimensions.

## Runtime evidence and explicit negatives

Read both bound executed drivers and their raw final JSON, regression/gate logs,
candidate measurements, partial-run failures and picture ledger. Drivers use
ordinary doors and browser input; no force clicks, application-handler opening,
data injection or record mutation establishes a qualifying result. Read-only DOM
measurements and the explicitly removed break override are distinguished.

| Claim | Independent evidence disposition |
|---|---|
| All section families restored | Raw final widths 816px below 821, 832px at 821/844 and 932px at 1280. Supplemental roll-call names notes, programme, waves, duties, sims, ground, inputs, available, SANS and unavailable: ten header own-hits; eight populated row own-hits. Available/SANS use actual grid/card pictures and header width/hit proof, not a claimed nonexistent row-selector hit. |
| Normal phone preserved | Independently recomputed equality of final normal-phone and returned-phone shape against the retained pre-repair candidate baseline: equal, all ten widths 346px. Pictures agree; the temporary return toast is not a geometry change. |
| Normal desktop preserved | Independently recomputed final desktop shape equality with the pre-repair baseline: equal. Opened both original pictures; layout retained. |
| Resize and short screens | Raw results and selected originals cover 390x568, 820/821x700, 844x390, 1280x700 and return through 821/820/390. Sign-off remains above a nonzero schedule. Existing wide content deliberately extends beyond the viewport; the left-edge image alone is not right-hand reachability proof. |
| Sideways navigation | Native toolbar touch moves root 0→240→790, roster x861→71 with own-hit, then back to 0 with note-row own-hit. A separate mouse-input context proves wheel 0→790→0. Those are distinct input claims. |
| Separate vertical scrolling | Crew reaches 432/max432 while schedule holds. Ordinary scroll-back to 282 exposes the shorter column's last named WSO; Gambit and Vector each have own-hits. Schedule reaches 3342/max3342 while crew holds; final ATT C/Grit row has its own hit. |
| Controls and return | Recorded native panning brings Next, Previous and More onto screen before explicit own-hit/click. Day navigation runs before and after changing layout; More→Phone→Done closes Board and restores Edit Schedule. |
| Roles | Actual member sign-in has no Edit Schedule drawer entry and zero visible Board; opened its original picture. Admin is the actual scheduler-capable seeded account. The unchanged date handler requires scheduler permission and Edit Schedule. |
| Overlays and record context | Existing warning/flag content remains, including 17 issues/6 warnings; working-copy/DRAFT state is explicit. Medical “17 Jul” is DOM text evidence, not a claim the full right-hand remark is visible in a left-edge screenshot. |
| Errors | Both qualifying native result files have empty error arrays; their executed drivers watch page errors, console errors and failing HTTP responses. |

O1–O9 are represented by native entry/day stepping; layout/resize round-trip;
break/restore; horizontal and independent vertical scrolling; day stepping after
switch; Phone return/Done; separate mouse wheel; actual member exclusion; and
the supplemental all-section roll-call. Shared operations are reused under D499;
the width-specific appearance evidence is retained separately.

### Limits and retained-failure dispositions

1. Main-content emulated touch leaves root 0→0. The prior unchanged investigation
   records the same limitation. Toolbar touch provides the demonstrated existing
   route; no full-area touch or physical iPhone Safari clearance is claimed.
   D548 does not authorize expanding this restoration into gesture redesign.
   Physical device behaviour remains for the owner's preview look.
2. Guest access is off; there is no dedicated scheduler fixture or seeded issued
   snapshot in this walk. Those states are explicit omissions, not passes. Source
   selector/gate scope and retained publication/role regression gates support this
   CSS-only result without manufacturing a record or bypassing permission.
3. All four partial runs remain failed/partial. Raw failures confirm mouse-after-
   touch reach problems in runs 1/3/4 and the clipped shorter-column Vector own-hit
   in run 2. Final proof uses toolbar touch, separate desktop mouse context and
   ordinary vertical scroll-back while retaining the target-hit requirements.
   No extra production fix or relaxed width/hit assertion conceals them.
4. Candidate animation-race failure remains separate. Waiting for finite
   animations supports the same baseline equality assertion; candidate override
   pictures do not enter final-build proof.
5. Existing crew-header/popup behaviours are unchanged under D547/D548. Keyboard
   product questions stay pending. Earlier browser skips and rulecheck baseline
   entries are not silently cleared by this review.

None of these limitations supplies a concrete new failure caused by the changed
property. None is dismissed merely as old demo data. They restrict the claims and
remain recorded for branch preview/Claude follow-up, rather than being called
tested or silently fixed.

## Pictures personally opened by this inspector

Opened these **20 originals individually at original resolution**. This is a
selected independent read, not a claim that this inspector opened every picture
the coordinator opened. All paths are under
`docs/img/handpass/2026-10-04-phone-desktop-board/`:

- `walk5/02-phone-desktop-restored.png`, `03-disposable-break-zero-width.png`,
  `04-short-phone.png`, `06-wide-at821.png`, `07-wide-landscape.png`.
- `walk5/13-side-column-panned-right.png`, `14-crew-final-column1.png`,
  `14-crew-final-column2.png`, `15-schedule-final-independent.png`.
- `walk5/17-phone-return.png`, `18-desktop-normal-unchanged.png`,
  `19-member-exclusion.png`.
- `rollcall/section-2.png`, `section-4.png`, `section-5.png`, `section-8.png`.
- `walk/FAILURE.png`, `walk2/FAILURE.png`.
- `candidate/phone-normal-before.png`, `candidate/desktop-normal-before.png`.

Restored notes/programme, flying/sim/ground rows and Available/SANS grids are
visibly present; deliberate break is blank below sign-off. Side-column and final
named content pictures agree with the measured own-hits. Temporary hint overlays
are visible and are not mistaken for simultaneous visibility of all row text.

Independently verified all **79** named ledger picture hashes, zero mismatches:
53 partial-run originals plus 26 final/supplemental originals. Ledger SHA256
`cb3e09b17a70a0490edb79e1346afd559ca5d66368b65a4b2dd1e20053664463`.
The coordinator's complete visual read remains distinct from this final code read.

## Gates and closing boundary

Read retained logs: unit 7727/489 files, build PASS, reference 728/0, full browser
528 passed/49 existing skips/no reported retry, Tracker 445/0, all six adapted
probes 155 assertions, performance 4/0 (DOM 5131/1018 under unchanged ceilings,
isolation and scroll 400→400), rulecheck PASS with its existing baseline notes.
These are inspected recorded runs, not falsely described as personally rerun.
No heavy suite was repeated and no PC lock was taken by this read-only inspector.
Current source/bundle identity was independently checked as described above.

**Findings: none. Verdict: PASS for the exact bound repair.** Later source/test/
driver changes require a refreshed read of the affected snapshot. Branch preview
shipping remains the host's job; this report authorizes no main push, merging PR
or live merge.

**OWED: Claude's read after Monday 5 Oct 2026, 19:00 Asia/Singapore —
`codex/workflow-ui`**, including the preserved split/repair read and walk. Earlier
Insights/Rally/Discard reads and the temporary working-guide arrangement remain
separately owed. The owner's look is still pending; no owner acceptance is invented.

Walk: `docs/handpass/2026-10-04-phone-desktop-board-repair.md` · 26 coordinator-
inspected final originals · 5 surfaces · 9 orders · MISSING: physical Safari/full-
area touch and absent guest/issued/dedicated-scheduler fixtures, explicitly
qualified above. This inspector opened 20 selected originals and ran no new walk.

Rulings: none from inspection.
Document check: `npm run docsize` from `raptor-port/`, exit 0. Existing excess is
deferred under D29; no document was trimmed. Exact closing lines:

```text
Docs: OUTSTANDING 107 items (+13 −2, −2 all in ARCHIVE) · DECISIONS D1–D548 (new: D491, D492, D493, D494, D495, D496, D497, D498, D499, D500, D501, D502, D503, D504, D505, D506, D507, D508, D509, D510, D511, D512, D513, D514, D515, D516, D517, D518, D519, D520, D521, D522, D523, D524, D525, D526, D527, D528, D529, D530, D531, D532, D533, D534, D535, D536, D537, D538, D539, D540, D541, D542, D543, D544, D545, D546, D547, D548) · homes OK
docsize: OVER by 2289, deferred (D29)
docsize OK — every record accounted for.
```
