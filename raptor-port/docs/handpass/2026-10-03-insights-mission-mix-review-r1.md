**REVISE — one confirmed blocking defect.** Final independent code inspection, round 1, under D496. Sol authored the implementation; this inspector made no application, test, plan or brief changes.

Reviewed branch `codex/insights-mission-mix` against planning baseline `5f9bf9781874f7ee8dcaf69ebe1b532606e851a7`, including uncommitted and new source/tests. At completion, **all 793 entries in freeze-3 matched** and the binding revised-plan SHA256 remained `A51541CA5557914E37989A6F445BD828D1FDDE2ADBFD0930E557234DE4B99DBD`. Closing documentation was allowed to change separately.

**1. Blocking finding — P2: direct role selection answers the previous Remarks context while different text is visible.**

Location: [mission-role-offer.ts:74](C:/Users/User/projects/Raptor/.claude/worktrees/codex-insights-mission-mix/raptor-port/src/ui/mission-role-offer.ts:74), particularly the retained target and click handling at lines 78–86.

Reproduced independently on the running frozen production build through **both actual Board and Edit Schedule controls**:

1. Enable tracking as an administrator.
2. Enter `DS FOR ALPHA` in the first formation’s Remarks and press Tab.
3. Select Later.
4. Refocus those Remarks, exposing Choose mission role.
5. Replace the visible text with `DS FROM BRAVO`, without pressing Tab or leaving the field.
6. Click Choose mission role, then Red.

Expected: save the visible Remarks through the existing text writer first, then answer the resulting current context. The text and annotation must remain separate undoable changes.

Observed on both surfaces:

- The field visibly contained `DS FROM BRAVO`.
- The authoritative saved Remarks remained `DS FOR ALPHA`.
- The accepted `insights.role.set` command wrote Red against `[1,"BFM",["DS FOR ALPHA"]]`.
- Pressing Tab afterward saved `DS FROM BRAVO` and opened a new unanswered question.

There were **zero browser errors**. This is a current, repeatable defect with newly created data, not an old-data migration issue. It violates the save-first and current-context requirements in D525/D526/D529.

Cause: `pointerdown` and `mousedown` prevent focus movement to preserve typing. Consequently, Board’s native change writer and Edit Schedule’s focusout writer do not run. The role click handler continues using the target captured before typing. Its validity check compares against the still-old saved model, so it incorrectly succeeds.

Smallest safe repair:

1. Before Choose/Change and before Blue/Red, commit any dirty originating writable Remarks through its existing production writer.
2. Preserve the identical editor node, focus and selection.
3. Re-resolve the target from the newly saved authoritative state. Never submit the captured old context. If the result no longer qualifies, close the offer.
4. Coordinate the normal deferred auto-offer so the flush does not create duplicate questions.
5. Preserve separate text/role command history and Undo, and Later’s no-answer behavior.

Add red-first mounted tests for **both actual editor adapters**, followed by a rebuilt running-app rewalk. Include direct typing→Choose→answer without Tab; answered A→dirty B→Change; editing while the question is already open; removal of the cue or conversion to automatic exact DS; and a published A with working wording being changed. Assert no role command targets A after visible text has changed to B.

Evidence: [result.json](C:/Users/User/projects/Raptor/.claude/worktrees/codex-insights-mission-mix/raptor-port/docs/img/insights-final-astra-r1-repro/result.json), [Board picture](C:/Users/User/projects/Raptor/.claude/worktrees/codex-insights-mission-mix/raptor-port/docs/img/insights-final-astra-r1-repro/board.png), [Edit Schedule picture](C:/Users/User/projects/Raptor/.claude/worktrees/codex-insights-mission-mix/raptor-port/docs/img/insights-final-astra-r1-repro/week.png). Both saved pictures were opened. The PC lock was acquired for this verification and released afterward.

**2. Read coverage and inspected negatives**

Read the immutable brief, applicable repository rules and full ruling rows, D496 workflow, bug-check order, approved specification, revised plan and its review, Opus review including §7, independent S01–S33 route map, relevant contracts and performance guardrails. Read the complete changed application diff, all new feature modules/tests, browser tests, both walk drivers, and adjacent production call sites needed to trace the routes.

| Area | Production connection and result |
|---|---|
| Classification | Inspected exact DS/RED/RED AIR handling, bounded conditional cues, supported normalization, separators, sorted unique clauses and formation-wide context. No additional resolver defect found. |
| Counting and readers | Traced role resolution through the existing eligible aircraft/occupied-seat traversal and latest-issued source. No changed sortie totals, standby rules, cancellation counting, work-hours source or leave calculation found. |
| Editor offers | Traced App installation, native Board change, week focusout, Mission/Remarks changes, structural edits, temporary Choose/Change and automatic question. **The meaningful direct-click order fails as reported above.** |
| Published and working copies | Inspected latest-published read-only Remarks door, distinct contexts, issuance identity and historical refusal. No annotation write funnel into signed programme content found. |
| Persistence | Read the physical settings mapping, sealed store integration, hydration/reset/wipe and real storage-pipeline tests. No missing role namespace mapping or reader mutation exposure found. |
| Commands and permissions | Inspected registration, central changed-record guard, administrator requirement, tracking state, protected weeks, stale session/navigation/context/issuance guards and competing actor handling. No alternate supported role writer bypass found. |
| History and Undo | Traced role envelopes, human answer/correction descriptions, day history, reverse descriptions, off-week landing and annotation-only restoration. No role-only schedule epilogue or publication-boundary contamination found. |
| Templates and plans | Inspected capture/sanitization of template seeds, fresh destination identity, collision refusal, joined transaction rollback and atomic Undo. Plan switches/duplicates retain identity and resolve current matching annotations. No unsupported general fresh-ID copy/import route was credited. |
| Settings | Traced real Logic callback, default Off, persistence, reset isolation and Undo. Enabling tracking does not replay earlier questions. |
| Insights doors and display | Inspected shell, drawer, desktop Board and phone overflow connections to the shared modal; topmost overlay behavior; twelve/Show all/reset; ordinary total bars for unresolved people; escaped/fallback names. No further missing authorized door found. |
| Runtime lifecycle | Inspected subscriptions, reconciliation, cleanup, navigation/session resets and deferred work. The supplied long-day/idle/On–Off evidence addresses accumulation; the dirty-field defect is a different ordering gap. |

Negative findings above are bounded by these reads and the recorded tests. They do not claim exhaustive proof of every possible browser interaction.

**3. Evidence assessment and remaining gaps**

The final full unit log directly records **7,630 passing tests in 480 files**. That green gate does not cover or negate the reproduced failure.

The existing browser tests and both walk drivers largely commit text with Tab before choosing a role. Their successful results therefore do not test the failing direct-click order. This is the principal missing scenario.

Recorded evidence supports:

- Freeze-2 editing walk: 20 passing steps, zero browser errors.
- Freeze-3 affected phone rewalk: 10 passing steps, zero errors; its 14 images were inspected by the host/walker.
- Publication walk: six passing publication/working scenarios, including distinct A/B contexts, immediate issued bars, historical refusal, reissue and older-version loading.
- Actual template, plan, off-week Undo, Logic and member routes in the non-publication walk.
- Real mounted wiring tests and documented disconnect-to-fail checks for editor, storage, Logic and Board connections.

I read the drivers and pertinent results; I did not independently repeat every walk or reopen every prior walker’s picture. My own additional runtime claim is the two-surface reproduction above.

Other qualifications remain:

- Final browser/performance reruns were not complete evidence available to this report; the host must record their eventual results against the repaired freeze.
- The adapted suite is **not entirely clean**: five probe groups pass; audit reports 24 pass/3 fail. The raw unchanged-baseline audit reproduces the same three failures. They remain explicit limitations, not feature fixes or clean gate credit.
- Physical iPhone/iOS keyboard and contenteditable behavior remain unverified here.
- Guest has no authorized existing Insights opener under D204. Shared reader/permission tests are relevant; a guest browser opener is N/A.
- No general fresh-identity scheduler copy/import door exists. The actual day-template route is the applicable fresh-identity proof.
- The suspected published-A consequence of the dirty-click failure follows from the same source path, but I did **not** separately reproduce that published variant. It belongs in the repair regression and rewalk.

**4. Nonblocking D489 notes**

The new resolver, configuration, guarded annotation store and transient UI controller have distinct responsibilities. Most additions to existing busy files are necessary integration points, supported by connection tests. I found no reason to require a feature-wide extraction before this fix.

One modest duplication remains: history and Undo descriptions independently parse and normalize the role command’s human metadata. A shared description helper could prevent later divergence. This is a nonblocking maintenance observation, not a condition for acceptance.

The already-filed screen CSS split remains in its approved later batch. No unrelated engine tidying is requested.

**Disposition:** release the source freeze for Sol’s red-first repair, rebuild and rewalk affected routes, then perform the one fresh second final inspection allowed by D496. No further product or plan round is needed.

**OWED: Claude’s code/scenario read after the reset**, on `codex/insights-mission-mix`, before any main integration.

**Rulings: none new.**
