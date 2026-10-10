Two remaining defects give incorrect explanations. **The OIL credit and deletion permission checks were correct in both reproductions.**

I reviewed the latest `claude/day-window-compact` code, including W1–W8 and the subsequent conversion and dormant-decision fixes. I did not open another reader’s report or anything in the prohibited folder. I changed no files.

Verification comprised source inspection and fresh, in-memory probes using the production save, calculation and React controls. I did not rerun the full suite, browser walk or publication gates.

**1. The OIL window says nobody earns after the scheduler has credited a man.**

**Setup → action → wrong result:** File a fresh ALL AVAIL Duty on Saturday 18 July, 09:00–12:00, and answer **No** to OIL. Open “Who earns OIL”, tap one man to credit him, then close and reopen the window.

The window now shows **“1 of 2”**, that man’s puck is lit, and the calculation credits him. Nevertheless, its hint says:

> Whoever filed this Duty answered No to OIL, so nobody behind it earns. Tap a puck to credit one man.

The hint contradicts the count and credit. Its tap instruction also fails to explain that tapping the already lit man removes his credit.

**Cause:** [oilmode.ts, `oilHeldClaimHint`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/oilmode.ts:293) derives the explanation solely from the filer’s answer. It does not account for individual overrides or a named man typed onto the row. [AvailWindow.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/AvailWindow.tsx:336) uses that explanation again once the temporary message from the tap has cleared.

**Exact fix:**

- Describe the filer’s No or unanswered question as the **default**, rather than asserting that nobody currently earns. Alternatively, derive the statement from the effective earners.
- Give instructions valid for mixed states: “Tap an unlit puck to credit a man; tap a lit puck to stop his credit.”
- Preserve the existing priority of issued-record, cancelled, whole-day-off and unmeasurable-row explanations.
- Add a regression through the real window: **No → grant one man → close → reopen**, for both ALL AVAIL and ALL. Assert agreement between the hint, count, lit puck and earned credit. Tap again and verify return to the No default.
- Cover the unanswered question and a named man typed onto the request row. Add these orders to the evidence sheet’s row 19 and switching-door entry.

**Origin:** New with this change. The shared calculation is sound; the new explanation is incomplete.

**2. A refused keyboard deletion names ALL AVAIL as the input’s owner.**

**Setup → action → wrong result:** Have an admin file a fresh ALL AVAIL Meeting on 13 October, 10:00–11:00. Sign in as another member, select Everyone, open that day, focus the input card’s opening button and press **Delete**.

Deletion is correctly refused, but the message says:

> Only ALL AVAIL or an admin can delete this input

ALL AVAIL is not an account capable of deleting anything. The actual filer is omitted. Backspace reaches the same refusal.

**Cause:** [InputsCal.tsx, `onLineKey`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsCal.tsx:754) uses the input’s `person` for the refusal message at line 767. For a placeholder input, ownership comes from the filer. The permission check itself is correct. W5 fixed the editor’s read-only explanation but missed this keyboard door.

**Exact fix:**

- Give the single-input refusal a placeholder branch, preferably sharing the editor’s filer wording. Name the actual filer or “whoever filed it”; never describe ALL or ALL AVAIL as the owner.
- Make the sentence match the current permission setting. When members cannot change filings for others, do not promise that a member filer can delete it.
- Test a newly filed input through the opened day’s actual button: another member presses Delete and Backspace, receives accurate wording, and causes no mutation. Cover both placeholders.
- Check the authorized filer with the members’ setting enabled, then the same filer after it is disabled.
- Add these refused keyboard orders to the evidence sheet’s row 13 and deletion-door entry.

**Origin:** This line predates the feature on the calendar branch. The new placeholder choices make its incorrect ownership assumption reachable.

**Roll-call and explicit negatives**

The following is the code-read roll-call. “Sound” here denotes the inspected path; it does not claim a new browser walk.

| Objects, surfaces and roles | Expected sign and working door | Read result |
|---|---|---|
| New editor, board dialog, List Add and pencil | Separate ALL/ALL AVAIL choices; valid kind and one-day save; visible refusal and correction for invalid choices | Shared picker and save paths are sound. The plain board dialog still lacks recorded operation in the walk. |
| Several-person editor; SANS commitment picker | Placeholder cannot join a group; SANS remains a real person’s offer | Restrictions remain sound. Named Event groups remain supported. |
| Existing-input editor; admin, filer, other member | Correct person name; admin reassignment; filer permissions; accurate read-only explanation | W5 is sound. The calendar keyboard refusal is finding 2. |
| Inputs List, month and opened day | Correct name/kind, search, sort, filter and late mark; open/edit, drag, delete | Shared person-filter comparisons distinguish Everyone from ALL. W4 preserves the reasoned move. |
| OIL question, List chip and bell | One filer answer; only the eligible filer receives the bell | Permissions and bell routing are sound, including loss of access when filing for others is disabled. |
| Edit Schedule, Scheduler Board, member and guest schedule | Request name and crowd count; working count window; appropriate read-only face | Placeholder remains a crowd marker rather than a payable person. W1, W2 and W6 retain the appropriate controls. |
| OIL Earn, crowd window and typed named seats | Count, glow and credit agree; individual switch follows the effective default | Calculation and switch direction are sound. Reopened explanation fails as described in finding 1. |
| Personal Inputs, Accept/Undo, Unavailable | Accept or remove the request; no placeholder “→ Unavail” door | W3 prevents dormant tapping/counting. The latest conversion fix clears the old Unavailable state. |
| Issued face, pending list, sign-offs and changes window | Frozen issued crowd/answer; later effective changes become pending | Snapshot, comparison and credit paths are sound on inspection. W7 excludes dormant requests and their decisions from comparison without deleting stored decisions. |
| OIL Tracker and Leave War credit | Credit actual men; never credit the placeholder | Credit consumers use actual earners. The dedicated Tracker screen was not separately operated in the recorded walk. |
| Absence totals, warnings, rest, work hours and Insights | No fictitious absent person; named Event applies its real-person rules | Placeholder exclusions and Event consumers are sound. |
| Archive/delete/post-out, crowd attributes and late overlays | Protect special people; distinguish live crowd flags from named-person changes | W8’s archive exclusion retains relevant CAT/seat attributes. Named-person archive changes still count. |
| Export, legend, Logic table and hand-typed EVENT | Human-readable names; Event listed and matched consistently | Inputs export is sound. Schedule print/CSV remain flying-only, as already disclosed. |

**The highest-risk calculations are connected correctly.** `claimDefault` reaches the span defaults, effective defaults, puck state, eligibility, figures, counts and earned-work calculation. A No or unanswered placeholder claim starts the crowd off; the first tap grants credit and the second returns to the default. A Yes starts it on; a denial switches the man off. Explicitly typed named men retain their existing precedence.

**Issued days retain their own evidence.** The issued render and credit pass use the saved inputs, answers, crowd, decisions and rule values. I found no new path that recalculates an issued claim from live availability or a live filer answer. The latest published version remains the credit source.

**Reassignment and saving are sound after the latest fix.** Hand-over pruning removes obsolete holder decisions without discarding legitimate crowd or explicitly named decisions. The hard shape check examines the saved records supplied by the command boundary. The reviewed editor, List, reassignment, restore and Leave War writer paths reach it. Unsupported kinds, multiple days, grouping and placeholder Unavailable state are refused without leaving a partial save.

My fresh production-writer probes also covered **named Other → Unavailable → ALL AVAIL/ALL → Yes**. Both conversions now clear the old state, land the request and produce credit. The earlier conversion failure is therefore closed.

**Event is consistently carried through the reviewed metadata, schema, typed-word matcher and both reference-window twins.** Named Event removes the man from the free crowd and uses the ruled red clash behaviour. I found no missing new Event branch among the reviewed consumers.

**Ranked action orders**

These start with the specialized doors most likely to escape an ordinary filing walk.

| Order | Expected result and failure signal | Observation |
|---|---|---|
| Filer No → individual grant → close/reopen OIL window | Explanation agrees with the granted credit; “nobody earns” would disprove it | Confirmed failure, finding 1 |
| Other member → opened-day button → Delete/Backspace | Accurate refusal naming an eligible owner; placeholder named as owner would disprove it | Confirmed failure, finding 2 |
| Named Other → Unavailable → either placeholder → Yes | No stale Unavailable state; request lands and credits | Fresh probes pass after the latest fix |
| Publish → change live answer/availability → publish amendment | Original remains frozen; subsequent effective change becomes pending and amendment supplies later credit | Code paths sound; no new publication walk run |
| Named holder → placeholder → named holder → original holder | Obsolete holder decision does not resurrect; legitimate crowd overrides survive | Code and regression paths sound |
| Override → remove request → alter dormant decisions → delete/Undo | Dormant state neither credits nor creates false pending changes; restoration remains possible | Latest key filtering is sound on inspection |
| Invalid kind/day/group/state through each writer or restore | One refusal, no illegal saved record or partial change | Boundary and reviewed tests cover these shapes |

**Missing coverage and test quality**

The recorded walk does not cover either failing order above. Its board-dialog row explicitly says **NOT WALKED**, while the filing-door table claims every case was operated; those statements need reconciling.

The OIL tests meaningfully check switch direction and earned credit, but the hint assertion stops at the initial No state. The temporary tap message hides the defect until reopening. Some window fixtures also use `by: 'saber'`, although Saber’s actual person key is `stiff`; these fixtures do not establish a valid filer/permission lifecycle. Use a real filer and production save for that coverage.

The W8 test titled “CAT or seat changing” changes CAT only. Add a separate seat mutation before claiming both are proved. The strengthened reload assertion and new conversion tests are useful, but the weekday conversion test alone does not prove weekend landing and credit.

The dedicated Tracker screen, a separate repeated simulation, the before-original-publication variant and a complete member-filer publication cycle remain outside the recorded walk. These are coverage limits, not additional demonstrated code defects.

I have not reopened the owner’s settled product choices, reported problems confined to old stored demo data, or repeated the small items already listed in the backlog.

Rulings: none this session

VERDICT: CHANGES REQUIRED