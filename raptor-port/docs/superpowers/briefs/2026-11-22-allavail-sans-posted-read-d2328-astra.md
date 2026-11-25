REVISE. The patch fixes the reported new-arrival case, but it is not complete. I found one regression and two remaining ways to count someone before his post-in date.

I reviewed the exported, post-patch copy. I changed no files and opened no other reader’s report. I checked the code and ran its actual counting and stint functions in memory with controlled people, dates and inputs. These were isolated checks, not the full test suite or a browser walk.

1. Returning after a SANS posting and archive removes earlier days he actually attended

This is a regression introduced by the patch.

Exact state:
- First post-in: 1 Jul.
- Posted out as SANS: 13 Jul; the posting has run.
- Named on our programme on 14 Jul, free during the ALL AVAIL event.
- Archived on 15 Jul.
- Restored with a new post-in date of 17 Jul.
- “+ SANS” either on or off.

What the app does:
It counts him on 14 Jul before the archive and while he is archived. After Restore, the patched count drops him from 14 Jul.

The saved posting still ends his first stint on 12 Jul—the day before the SANS posting. Archive changes the posting’s outcome to Overseas Sqn but keeps that end date. Restore saves that shortened stint as his earlier stint and clears the archive date. The new count now obeys that shortened history.

I reproduced the difference: the pre-patch function includes him after Restore; the patched function excludes him.

What the ruling requires:
D283 says the SANS posting leaves him flying with us. D327 and D320 preserve the days he was here across archive and Restore. D2328 requires his actual status on the day. Therefore 14 Jul stays included; 15–16 Jul stay excluded; 17 Jul begins his return.

A published day keeps its frozen crowd, but its working copy now disagrees. That can raise an incorrect pending change and remove earned leave when the day is republished. D44 and D45 require the published record to stay frozen until acknowledgement.

Exact fix:
1. In raptor-port/src/leavewar/state/store.ts, stintClosed, at line 2399, distinguish an already-run SANS posting from a real departure. The test is: outcomeOf(person) === 'sans', person.to is not null, and person.poDone === addDays(person.to, 1).
2. For that case, close the stint on the day before the actual archive. Include it in the existing branch that closes an open stint. Keep the existing treatment of ordinary departures and a stint that has not begun.
3. In raptor-port/src/leavewar/sync.ts, lines 2121–2122, remove the blanket archive-end replacement once the writer saves the correct end. Read the resulting window directly with inSquadron(lw, iso). Keep the saved-posting fallback at line 2099.
4. Add a test through postOut, archivePerson and restoreArchivedPerson. Check 14 Jul before archive, after archive and after Restore; it must remain included. Check 15–16 Jul excluded and 17 Jul included, with both switch positions.
5. Add the published-Saturday version: SANS from 13 Jul, attending on 18 Jul, archive on 20 Jul, return on 22 Jul. Restore must not change that Saturday’s crowd or earned-leave amount.

I checked the proposed date repair in memory: it preserves the earlier SANS day and the genuine gap before return.

2. Deleting someone before he joins can make him count on earlier days

This predates the patch, but remains a failure of D2328 with newly created data.

Exact state:
- Added on 13 Jul, with post-in set to 17 Jul and no earlier stint.
- Deleted on 15 Jul.
- Inspect ALL AVAIL on 14 Jul.
- An ordinary man needs no named assignment. If ticked SANS from 13 Jul, name him on a non-overlapping briefing that day.

What the app does:
When he has a Leave War row at deletion, the delete removes both that row and his saved posting. The count subsequently sees a deleted man on a day before his deletion, finds no joining window, and includes him.

For a SANS man with no earlier leave, input or award, the switch’s position when Delete is performed changes the result:
- “+ SANS” on: his row exists; deletion removes the posting; 14 Jul wrongly includes him.
- “+ SANS” off: no row exists; the saved joining date can survive; 14 Jul correctly excludes him.

This is a difference caused by performing Delete under different switch positions. Merely toggling the switch afterwards does not repair the lost date.

What the ruling requires:
D2328 and D308 exclude him before 17 Jul. D297 preserves genuine past participation after deletion; it does not create participation before he arrived.

Exact fix:
1. Keep personCut’s “no display row” result for someone who never arrived, at raptor-port/src/leavewar/state/store.ts line 2236.
2. Change the posting-record choice at line 2217. When deletion removes his only, not-yet-started stint, retain the original post-in date in a saved record instead of deleting the evidence.
3. That retained record should have to: null and gone: true, with posting-out outcome and completion fields cleared. It must remain absent from state.people. The existing count will then apply his joining date before the deletion cutoff.
4. Apply the same retention rule to deleteOnForeign in raptor-port/src/leavewar/sync.ts, line 3333, so the two deletion routes agree.
5. Add tests for an ordinary new arrival and a SANS new arrival, deleting with the switch separately off and on. Check dates before deletion, on deletion and on the planned joining date. He must count on none of them. Reload the saved records and repeat.

I checked this retention approach in memory: both switch positions exclude him and leave no display row.

3. Archiving a returning man before his return can fill the gap he was away

This also predates the patch and remains reproducible with new data.

Exact state:
- Earlier stint: 1 Jun through 9 Jul.
- Overseas posting from 10 Jul.
- Restored on 13 Jul, with his return dated 17 Jul.
- SANS ticked by hand on 13 Jul.
- Named on a non-overlapping briefing on 14 Jul.
- Archived again on 15 Jul, before his return begins.
- “+ SANS” either on or off.

What the app does:
Before the second archive, 14 Jul correctly excludes him.

The archive discards the unstarted return and makes his earlier stint current again, ending on 9 Jul. The count then replaces that genuine end with 14 Jul simply because he is archived and was SANS on the queried day. He now incorrectly counts on 14 Jul.

What the ruling requires:
D320 preserves the gap between stints. D323 explicitly treats an unstarted stint as never occupied. D2328 therefore leaves him out before his planned return; archiving him must not change that.

Exact fix:
1. Keep the unstarted-stint handling in stintClosed at line 2403: the earlier stint must retain its real end.
2. Remove the unconditional archive-end replacement at sync.ts line 2122, together with finding 1’s correction to how a genuine SANS stint is closed. Removing it alone would bring back the SANS archive problem.
3. Add the sequence above as a test. Assert that 14 Jul remains excluded before and after the second archive, with both switch positions.
4. Also assert that 15 Jun remains included and that no day from 10 Jul onwards becomes part of the cancelled return.

The combined repair for findings 1 and 3 passed these isolated checks. Ordinary earlier departures retained their original dates.

The saved-record fallback and the switch

The new fallback at line 2099 is necessary: a hidden SANS man’s joining date must still be read.

Structurally, a saved posting can carry a field that changes the answer: home. The storage reader preserves extra fields, and inSquadron consults home. However, the current posting writers strip home, while the display projection rebuilds it. I found no newly produced failure from that field and am not raising an old stored-data case as a finding.

Saved postings can remain for people absent from the displayed roster, or after they move squadron. Their presence alone does not admit them: availableFor first enumerates the schedule squadron’s roster for the queried date.

For the same valid saved state, I found no immediate on/off count difference in the checked cases. Finding 2 is the important exception in the workflow: the switch can change what Delete saves.

What the tests are missing

The changed test file does not cover any of the three sequences above. In particular, it stops the SANS archive check before Restore—the operation that exposes the regression.

Add these further checks:
- The exact post-in date. The positive D2328 test currently checks Saturday after a Friday joining date.
- Multiple earlier stints: before the first arrival, inside each stint, inside each gap, and on return.
- Delete before arrival, with deletion performed under both switch positions.
- Delete outcome before and after its date, including an already-SANS man.
- Another squadron’s saved posting and a person with dated home stints.
- A reload after the lifecycle changes, followed by the published-crowd comparison.

The new “from his post-in date” positive test would also pass with this patch removed. It is useful preservation coverage, but does not prove the fix. The two negative D2328 tests do distinguish the patched behaviour.

States checked and found right

These are code and isolated-function checks, not browser verification:

- An ordinary man without a posting record counts when otherwise available.
- An ordinary man with a joining date is excluded before it and included on it.
- A hand-ticked SANS man with a saved joining date is excluded before arrival, including when his Leave War row is hidden.
- A day before both the SANS tick and the joining date excludes him.
- From arrival, a SANS man counts only when named on that day’s programme and otherwise available.
- A completed SANS posting preserves ordinary days before its date and includes named, available SANS days afterwards.
- Taking SANS off by hand after the posting restores the ordinary-man answer.
- Ordinary earlier stints remain included; genuine gaps and dates before the first stint remain excluded.
- Overseas Sqn, Delete and no-chip postings retain their departure boundaries.
- A pending SANS posting retains the existing treatment described in the brief.
- An archived man after a SANS posting retains his earlier named SANS days while still archived; the regression begins at Restore.
- An archived hand-ticked SANS man retains his earlier eligible days and is excluded from archive onwards.
- An archive without a saved archive date retains the existing posting-window fallback.
- An ordinary deleted man with retained stint dates counts before deletion where eligible and never from the deletion cutoff.
- Another squadron’s man is excluded despite a saved posting entry.
- Dated home stints still restrict membership.
- The input and schedule-clash exclusions are unchanged.
- Published crowd readers continue using the frozen membership; this patch changes the live answer compared against it.

Rulings: none this session.