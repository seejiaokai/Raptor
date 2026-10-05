# Phone Desktop Board repair — 4 Oct 26

Status: repair complete; fresh independent Astra R1 PASS; branch preview only. Only
`[PHONE-WIDE-BOARD-BLANK]` is authorized by D548.
Crew-list/header and popup behaviour stay unchanged; D547 accepts New input scroll
recovery. No main push, merge or merging PR. Existing split and earlier-build
Claude reads remain owed after Monday5Oct2026,19:00 Asia/Singapore.

## Plan, independent challenge and picture-first record

Astra plan: `../superpowers/plans/2026-10-04-phone-desktop-board-repair.md`.
SHA256 `cd4f1dee8a275a8464e4458d35150e5f5e1ea74b5b42df4310e6289f276d8414`.
Sol independent challenge: PASS for the single-property restoration and WALK tier.
Only wide mode restores the wrapper's flex column; normal-phone flattening,
desktop dimensions, controls, storage, warnings and roles are preserved.
Assertions require usable section widths, not a hard-coded832px: the existing
candidate phone geometry gives816px. No new publication/data writes to invent
history. Any absent scheduler/issued fixture must be named, not bypassed.

D541 full row requires a picture before visual building. D548 already authorizes
this existing-layout restoration; it does not require a second permission request.
Candidate phone and desktop pictures were shown inline before source edits.
They are not owner picture approval or final-build evidence. Candidate uses the
unchanged diagnostic bundle with a clearly separated browser-only display override.

Astra independent candidate inspection, complete response:

> **Candidate PASS.** Opened all five originals individually.
>
> Phone Desktop layout now shows the schedule below sign-off; all10 sections measure816px. Existing toolbar and sideways-navigation layout are retained. Desktop before/candidate pictures match visually, with unchanged measured geometry.
>
> Keep the presentation labelled **candidate only**. These pictures establish the proposed restoration, not completed pan/control verification or owner picture approval. The final walk must prove those interactions.
>
> Sol's usable-width threshold and fixture/role limitations are appropriate; retain them in the evidence. No plan or source edits made.

Candidate files: `../img/handpass/2026-10-04-phone-desktop-board/candidate/`.
The first candidate harness raced the desktop opening animation (y116.82 versus
settled106), and its deep geometry check failed. Pictures/driver are preserved in
`candidate-harness-first/`. The driver now waits for finite animations to finish;
the same deep geometry assertion passes. No assertion was relaxed or app fault
inferred from that harness failure.

## Risk answers and tier

WALK: money NO; issued records NO; saved data NO; shared rendering YES; mode YES
conservatively; new surface NO; permissions NO; warning meanings NO. The existing
Board wrapper's layout is the only production change. Astra supplies independent
scenarios/roll-call in the plan; final results below will name each disposition.

## Red regression, final walk and gates

Only production behaviour delta: `display:flex` on the existing wide-mode wrapper.
The source diff also adds a cause comment and removes one trailing blank line,
as independently identified in the final read; no other production file changed.
The new browser regression
uses ordinary sign-in → Edit Schedule → date → More → Desktop layout. Before
the fix it fails on section width0; after the fix the same assertions pass:
all10 section widths>300, sign-off above Board, actual populated note row>300.
`red-regression.log`, `red-error-context.md`, candidate's original pre-override
`phone-wide-before.png`, and `green-regression.log` retain red/green evidence.

Final native run: `walk5/walk.json`, its executed `driver.mjs` and22 originals.
All22 individually opened by Astra; exact names/hashes in `picture-inspection.md`.
Errors0. No force click, app-handler call, storage/record mutation or style
override in qualifying states. One separately labelled disposable break restores
`display:contents!important`; the actual usable-width assertion runs and fails,
all10 widths0. Remove the override, assert absence and run the same check green.
Candidate pictures are excluded from final repair proof.

### Roll-call and orders

| Surface/item | Result and downstream proof |
|---|---|
| Edit Schedule date door | Actual admin sign-in/drawer/date; editor opens; no injected Board permission. |
| Normal Phone Board | Before/return geometry deep-equal to retained pre-repair baseline; all10 sections346px. |
| Desktop layout on phone | All10 sections816px at390/820;832px at821/844;932px at1280. Sign-off above schedule at every width. |
| Short/resize |390×568,820/821×700,844×390,1280×700, then821→820→390; content stays nonzero through both directions. |
| Schedule content | First populated note hit; independent vertical scroll0→3342/max3342; final actual ATT C/Grit row visible and own hit. Medical17Jul string is DOM evidence, not wholly visible in left-edge picture. |
| Side/crew column | Native toolbar touch0→240→790 moves rosterx861→71 and receives its own hit; return pan790→0 reaches schedule note. Crew0→432/max432 leaves schedule unchanged. Last named pilots Gambit/WSOVector hit; shorter column requires ordinary scroll back150. |
| Toolbar/menu/day/return/Done | Native pan brings far-right controls on screen before own-hit and click; Next/Previous after switch; More→Phone→Done returns to Edit Schedule. |
| Normal desktop |1280×700 geometry deep-equal to the unchanged pre-repair baseline; no desktop redesign. |
| Actual member | Normal us/us sign-in; no Edit Schedule drawer door and visible Board count0; same browser-error watch. |
| Guest/dedicated scheduler/issued | No separate scheduler role/fixture; admin is scheduler-capable. Guest access off; no setting mutation/bypass. Existing fresh fixture has Live working copy/DRAFT, no issued snapshot manufactured. |

Named orders O1–O9: native opening plus next/previous day before switching;
Phone→Desktop plus resize round-trip; disposable break→red→restore→green;
touch-pan right/crew scroll/back left/schedule scroll with the other unchanged;
next/previous day after switching; More→Phone→Done; separate desktop-input390px
wheel right→left; actual member sign-in→drawer exclusion. A supplemental native
all10-section header/content roll-call (O9) is recorded separately under `rollcall/`:
all10 headers receive own hits, populated sections have real-row own hits;
Personal Inputs opened through its native fold. Available/SANS retain header/grid
proof, no absent row selector invented. Existing17issues/6warnings and Live working
copy/DRAFT text recorded. Four original content pictures individually opened by
Astra;10 header hits/8 real-row hits, Available/SANS visible grid/header proof.
Shared operations run once; width-specific layout is repeated per D499.

### Retained failures and limits

`walk`, `walk2`, `walk3`, `walk4` are partial, not PASS. All53 original pictures,
including4 failure pictures, individually opened and named in the same ledger.
First/third/fourth stop on mouse-wheel reach after emulated touch; second reaches
roster but the shorter column's last name sits clipped above it at scroll maximum.
Final run uses native toolbar touch for the phone, ordinary scroll-back for that
name and a separate mouse-input Chromium context at390px. Same reach/hit assertions
remain; no production expansion or weakened test. Separate mouse proof0→790→0.

Main-content touch attempt remains0→0, matching the qualified old investigation;
toolbar touch works. This is not full-area touch clearance or physical iPhone
Safari proof. Those limits stay named; owner authorized only the blank-content
restoration. Popups/header stay unchanged. Existing browser49 skips remain.

The original walk asset loop expected `/assets/`, while Vite emits `./assets/`:
empty `assets[]` was vacuous and proves no byte identity. The supplemental
all-dist HTTP hash proof under `rollcall/` establishes19/19 served/disk equality,
including main CSS/JS, index and lazy files; do not infer it from the empty old loop.
Current source/build identity: `source-freeze.json`,848entries, SHA256
`b45eb292d46ea445b1b420266d5250e8609f4a5b303f88b122486a10f44b5f9b`.
The old834-entry split freeze remains immutable. Initial freeze-generator assertion
wrongly expected it to contain `e2e/geometry.spec.ts`; it contains no e2e files.
Corrected bound records that limitation, verifies the actual HEAD delta as only
CSS+geometry regression, adds all current e2e files and binds the two executed
final drivers/new plan. Old bound non-dist files differ only in the intended CSS.

### Gates on the repair build

| Check | Result |
|---|---|
| Full unit |7727 passed,489 files,0 failed. |
| Production build |PASS. |
| Reference |728 passed,0 failed. |
| Full browser |528 passed,49 existing skips,0 failed/retries. |
| Tracker |445 passed,0 failed. |
| All6 adapted/relevant wrap probe |155 assertions passed;17/53/9/25/15/36,0 failed. |
| Performance |4 assertions passed: week5131≤5450,Board1018≤1150,isolation and scroll400→400. Three alternating4× trials; timings informational, no speed claim. |
| Rulecheck |PASS; existing uncovered-ruling list preserved. |
| Document check |Pre-inspection PASS, records/homes accounted for. Existing2289 excess deferred D29; no document trim. Final closing output retained after inspection. |

Exact logs are retained in this evidence folder. Each broad run takes/releases
the PC lock; no overlapping full browser/unit/Tracker runs. The dedicated preview
serves the production bundle on4220; final served-byte proof and source fingerprints
must agree with the independently reviewed frozen snapshot. No main/merging PR.

Fresh Astra final code read: **PASS**, initial inspection1 of at most2, no concrete
defect/blocking absence. Independently verified848 frozen entries,19 served assets,
79 ledger hashes and20 individually opened originals. Complete report SHA256
`622f195a4b366bee23f79a81279af6270601062e27f18bef99d63c8e2d1eb6a6`.
The planner's picture checks remain separate. Immutable brief:
`../superpowers/briefs/2026-10-04-phone-desktop-board-astra-final-r1.md`; complete
report: `2026-10-04-phone-desktop-board-astra-final-r1.md`. No self-approval.
All PC locks released; owned4220 preview stopped after the independent HTTP read,
port confirmed free. Source/tests/drivers/plan unchanged after the PASS. Closing
branch-only commit/push and Ready-link delivery complete this authorized repair;
no open PR/current-head PR workflow runs at the pre-push check. GitHub deployment
connector does not expose that endpoint; existing Git credentials are read only
in memory under sandbox escalation to fetch deployment metadata, never printed.

**OWED: Claude's read after the reset — `codex/workflow-ui`.**

Rulings: D547 and D548 recorded before dependent work; independently read.
Walk: docs/handpass/2026-10-04-phone-desktop-board-repair.md ·22 inspected final-run
plus4 inspected supplemental originals (26 total) ·5 surfaces ·9 orders ·MISSING:
physical Safari/full-area touch, unseeded guest/issued/dedicated-scheduler states;
explicitly qualified above. All retained repair gates/checks and fresh independent
read PASS; owner look and Claude's Monday reads remain before any live merge.

## Subsequent owner look — D549, 4 Oct 26

Owner: "looks good, whats the next task", after the reviewed repair preview was
delivered. Owner-look step passed. Ready deployment matches repair commit
063806c7d2240322c1615c24a1635aa4177199ae:
https://raptor-7q0tkgdev-kai-e2f5.vercel.app. No device-specific Safari verification,
broader UI approval, next-feature implementation, waived read or live merge is
inferred. D547/D548's other-behaviour leave-it and D544/D545's pending keyboard
choices remain. Claude's Monday reads and owner's explicit "merge live" still
precede main. No source/test/driver/plan or immutable review artifact changed.
