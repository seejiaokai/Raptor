Read-only review of exported commit **9326121d3**, containing the app code of **55c87b1dc**.

**The central repair is correct, but the broader promise in the brief remains incomplete.** I found three older functional faults and one test gap. These findings arise from newly created records, not old demo data. I changed no files and ran no tests. I did not read another reader’s report or this round’s removed evidence.

**1. Archive can erase attendance between a completed SANS posting and the archive — high priority, older fault.**

A man who was available before his archive can disappear from that day’s live ALL AVAIL crowd. This can create an unjustified pending change; republishing then removes the corresponding OIL.

Exact reproduction using the existing test fixture:

1. Keep today at 15 July 2026.
2. `postOut('rocky', '2026-07-13', 'sans')`; notify.
3. Hand-untick SANS with `updatePersonField('rocky', { tick: 'san' })`; notify.
4. Turn +SANS on. Create Saturday 18 July’s ALL AVAIL event, with nobody named separately. Set its hours to 0800–1700.
5. Publish Saturday and run the OIL pass. Assert Rocky belongs to the crowd, has `FO`, and the day has no pending changes.
6. Advance today to 20 July. Call `archivePerson('rocky')`; notify.
7. Read Saturday again.

The saved posting still ends on **12 July**, now labelled Overseas Sqn. Rocky consequently disappears from Saturday’s live crowd, although he was archived on 20 July. Because he was only behind the crowd, this is not the intentional pending change for archiving someone named on a published day.

Cause: [`closeStintOnArchive` and `stintClosed`](D:/raptor-work/c141-read/raptor-port/src/leavewar/state/store.ts:2380). `dated()` restores the original SANS posting cutoff. `stintClosed()` preserves that earlier cutoff and changes its outcome to `overseas`. The repaired [`availableFor`](D:/raptor-work/c141-read/raptor-port/src/leavewar/sync.ts:2094) can no longer recognise it as a completed SANS posting.

Fix instructions:

1. In the shared `stintClosed()` calculation, recognise a completed SANS posting using the same outcome/date condition as `windowFor()`.
2. Treat that posting’s operational stint as open when calculating the archive cutoff. Close it on the day before the archive, preserving `from` and earlier stints.
3. Record the resulting archive outcome and completion date against that cutoff.
4. Apply this through the shared helper so loaded and foreign-war archives agree.
5. Add the reproduction above, both switch positions, and a subsequent restore. Assert attendance before archive remains, the archive-to-restore gap remains excluded, and Saturday stays unchanged until an actual scheduling change.

**2. A hidden row still causes the saved joining date to be ignored — high priority, older fault left unfixed.**

Exact input in the existing fixture:

```ts
onlyTheEvent(THU)
plan(THU, 'rocky')
expect(setPostIn('rocky', FRI_ISO)).toBe(true)
expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
raptorNotify()

const { off, on } = crowdBothWays(THU_ISO, THU)
expect(off).toEqual(on)
expect(off).not.toContain('rocky')
```

Import `setPostIn` from the Leave War store.

Rocky joins on Friday 17 July and is named on Thursday 16 July. With +SANS off, the projection removes his row; his saved record has no leaving date, so neither reprojection nor `setPeople()` puts it back. With +SANS on, the row exists and the joining date excludes him.

Cause: [`availableFor`, lines 2092–2095](D:/raptor-work/c141-read/raptor-port/src/leavewar/sync.ts:2092) reads `postings[id]` only when `lw0` exists. The missing-row paths are [`reprojectRoster`](D:/raptor-work/c141-read/raptor-port/src/leavewar/sync.ts:2764) and [`setPeople`](D:/raptor-work/c141-read/raptor-port/src/leavewar/state/store.ts:2471).

Fix instructions:

1. Look up the saved posting independently of whether the display row exists.
2. When a posting exists without a row, construct the membership input from that saved identity and `windowFor(posting, true)`.
3. Lay the correct squadron’s current `home` intervals onto that input; saved postings intentionally omit them.
4. Run `inSquadron()` on this input.
5. Retain the existing date-aware SANS, deleted-person, ground-crew and clash checks.
6. Add this test and repeat it after reload. Both positions must exclude Rocky before Friday.

**3. The live crowd can use another squadron’s Leave War — medium priority, older fault.**

Exact input using `useMsqWorld()`:

1. Sign in as `kestrel`.
2. Post `PID.osprey` out on `2026-07-15` with outcome `none`; notify.
3. Sign in as `saber`, loading 142’s war.
4. Call `enterSquadron('u149', true)`, exercising the supported held-war state. Assert the schedule unit is `u149` and `worldUnit()` remains `u142`.
5. Ask `availableFor('2026-07-16', [600, 660], day)` for a clean Thursday containing only an ALL AVAIL event.
6. Release the hold with `enterSquadron('u149')` and ask again.

Osprey is incorrectly included while 142’s war is loaded, then excluded when 149’s war loads. His posting has not changed. A moved person produces the converse problem: an old-war row’s `home` intervals can exclude him from his new squadron’s crowd.

Cause: [`availableFor`](D:/raptor-work/c141-read/raptor-port/src/leavewar/sync.ts:2021) reads people and postings from the loaded war, but iterates `rosterOf(UNIT, iso)` for the schedule’s squadron. The held mismatch is expressly supported by [`enterSquadron`](D:/raptor-work/c141-read/raptor-port/src/state/store.ts:925).

Fix instructions:

1. Resolve membership records for `UNIT`, not implicitly for `worldUnit()`.
2. Use loaded postings when those units match; otherwise read `storedPostings(UNIT)`.
3. Build each person’s membership input independently of the display roster, as in finding 2.
4. Derive `home` through `homeStintsFor(id, UNIT)`; do not carry another war’s `home`.
5. Preserve the existing squadron roster gate.
6. Add the held-war reproduction and a moved-person case. Releasing the hold must not change either crowd.

This concerns the live calculation and its publication comparison. The issued crowd itself remains frozen.

**4. The moved-date test does not assert its promised exclusion — test gap introduced with this change.**

The [last test](D:/raptor-work/c141-read/raptor-port/src/leavewar/allavail-sans-posted.test.ts:188) says the man is “out on a day past the new date until it runs”, but asserts only:

```ts
expect(off).toEqual(on)
```

Both positions could wrongly include him and the test would pass. The [future-posting test](D:/raptor-work/c141-read/raptor-port/src/leavewar/allavail-sans-posted.test.ts:154) likewise checks agreement without pinning the intended membership.

Fix instructions:

1. Add `expect(off).not.toContain('rocky')` to both cases if the retained future-posting behaviour is the intended contract.
2. Keep the equality assertion.
3. Add the complementary case after the posting runs: named and free means included.
4. Verify these assertions catch removal of the `poDone` condition from `windowFor()`’s completed-SANS test.
5. Parameterise the hand-untick test for named and unnamed attendance, or narrow its “named or not” title; currently it exercises only unnamed attendance.

**The host’s three readings**

| Reading | Assessment |
|---|---|
| +SANS must not change ALL AVAIL, published state or OIL | **Supported** by D27, D44/D45 and D142. D283 separately permits changing Leave War tracking/display. Findings 2 and 3 show remaining dependencies. |
| Hand-unticking after a SANS posting makes him ordinary again, counting unnamed too | **Supported** by D2327’s explicit ordinary-man gap, together with D27. The repaired completed-posting path implements this. |
| A future SANS posting remains a departure beyond its date until it runs | **The owner’s to decide as a product rule.** The code preserves that behaviour, but the cited rulings do not expressly settle how future ALL AVAIL should forecast it. Preserving existing behaviour is not evidence of a ruling. |

**Checks against the five numbered review points**

1. **Posting and person states.** Beyond findings 1–3, I checked completed postings, future postings, earlier/later date changes, ordinary undo, ordinary archive/restore stints, deletion cutoffs, ground crew, other-squadron exclusion and time clashes and found no additional fault in the changed path. Ordinary undo here excludes the already-filed hand-untick question. Reload and off-screen-week conclusions are source-based, not executed evidence.

2. **Other display-dependent readers.** I checked the other `inSquadron`, `projectPeople`, `displayRoster` and relevant `getState().people` consumers and found no additional unfiled fault beyond those reported above. The Available/needs/bid-warning family is already covered by excluded item (g). Leave War row visibility and tracking themselves are intentional D283 behaviour. OIL crediting does not require a visible row.

3. **Saved posting truth.** I checked `setPostOut`, `setPostIn`, `markPostingDone`, `windowRecord`, `setPeople` and reprojection and found no additional ordinary-writer stale-record fault. Windows entering through `setPeople()` are captured; completion updates the saved record directly. The changed path retains the old checks and replaces their window input. Its missing-row condition is finding 2; the destructive archive conversion is finding 1.

4. **Published comparison and OIL.** I checked all four `HOOKS.oilSentinel` call sites, the frozen crowd reader, publication comparison and loaded/stashed OIL passes and found no silent rewriting of an issued crowd or immediate re-crediting from a draft. A day published under the original fault can legitimately become pending when its corrected live crowd differs; D44/D142 require acknowledgement through republication. That is not a migration finding. Fresh false differences remain possible through findings 1–3.

5. **Tests.** Apart from finding 4 and the missing scenarios identified above, I checked the 13 tests and found no further assertion defect. By source inspection, the five expected failures against the old lines are: completed-posting inclusion, full-day Saturday OIL, post-publication switch stability, named attendance in both positions, and hand-unticked unnamed attendance. The other eight are regression guards, not tests expected to fail before this fix. I did not execute that comparison.

**Tidiness of the changed lines only:** the overlay is clear and belongs at the membership decision. Reusing `windowFor()` avoids duplicating its completion rule. However, the comment promises independence from display rows while the implementation still requires one; findings 2–3 should be resolved before that comment is accurate. Filed here, not changed.

The exact existing test command I would run, from the host’s `raptor-port` folder, is:

```powershell
npx vitest run src/leavewar/allavail-sans-posted.test.ts
```

The additional exact inputs are specified in findings 1–3; finding 4 specifies the missing assertions. None was run in this sandbox. No browser walk, commit or push was performed.

Rulings: none.