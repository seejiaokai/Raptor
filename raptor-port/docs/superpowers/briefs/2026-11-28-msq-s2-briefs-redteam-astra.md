<!-- The red-team read of the D2826 + U2L and U3 briefs by Astra (gpt-6-astra, high, read-only, blind), 28 Nov 26, chat A212; copied from its own report file. Folded into the briefs' heads. -->

Both files are **ready after changes**. I found seven issues. This was a read-only review of the plans and current code; I changed no files and ran no tests.

1. **Should-fix — D2826, head decisions (e) and (g), §3.3–4: exceptions narrow the ruling without approval.**

   Saber (master admin), typing on 149 when his home moves from 142 to 150, keeps the form under decision (e). Under (g), a half-typed form hidden behind another Admin section closes without the note.

   D2826’s full row requires the half-typed form to close with a note when his own move lands; it states neither exception. These are behavioural departures, not merely choices about implementation.

   **Code cause:** `store.ts::pickAfterMove` preserves Saber's pick of 149, and `UsersPanel.tsx::startedOnChanged` consequently sees no changed page or permission. The proposed exception deliberately leaves this case open. The visibility restriction deliberately suppresses the other case’s note.

   **Fix the plan:** follow D2826 for these cases, or obtain an explicit amendment before building the exceptions. Add tests for both. Calling them “the agent’s reading” does not resolve the conflict.

2. **Should-fix — D2826, §5 `pressPaths` and §7 tests: Refuse is incorrectly treated as an Add press.**

   Saber (master admin) has Add a person half typed. His midnight move lands before a redraw; he presses Refuse on a waiting request. The Refuse result—or its refusal—can be replaced by the add form’s midnight note on the following redraw.

   **Code cause:** `UsersPanel.tsx::Waiting` sends Refuse through `p.addWrite`. `pressPaths::afterWrite('add')` currently judges row and Give access as the other work. The brief makes Add a real slot but explicitly says that this path never judges Add itself. That is correct for an actual Add press, but wrong for Refuse, which owns none of the three slots.

   **Fix the plan:** separate an actual Add write from a write outside the three forms. After Refuse, judge all three entries and combine its result with every owed note in one batch. Add the midnight-before-redraw Refuse case; the existing three-at-once test does not cover it.

3. **Should-fix — U2L, head decision 2, §3.6 and §6.7: Undo deliberately erases a read notification without answering it.**

   Kestrel (149’s admin) reads that Hunter was made a master admin and his Plan ended. Saber (master admin) then undoes that change. The brief removes Kestrel’s read line and gives him no replacement explaining the restored position.

   This contradicts D2437’s explicit “every line” rule: unread lines disappear; read lines receive a new line saying what is true now.

   **Code cause:** `undo-wire.ts::installGlobalUndo` invokes `acctNoticesReversed`; `acctlines.ts::acctFollowUps` selects only `acct` parts. `sqplan` lines receive replay removal but no corresponding follow-up. `acctLineLeftOut` governs which lines accompany restored rights; it does not supply the missing notification.

   **Fix the plan:** include the follow-up writer and narrowly checked gate path, with read/unread Undo and Redo tests. Alternatively, make the coordinated follow-up an explicit prerequisite to calling U2L complete. Merely reporting the contradiction to the coordinator leaves the proposed behaviour wrong.

4. **Should-fix — U2L head decision 3, §3.7/§6.11, versus U3 R8 and Pass A: the two steps require opposite results from the same tap.**

   After Hunter becomes a master admin, U2L requires the line to open nothing because he has no Plan grant of 149. U3 then gives live people without such a grant a row under their home squadron’s fold.

   **Code cause:** `topstate.ts::planRow` checks whether the person is live and `userslist-model.ts::hasUsersRow` returns true. It does **not** distinguish the `master` ending. U3’s planned expansion therefore makes that U2L line navigable automatically.

   **Fix the plan:** specify the final combined behaviour and a named test transition. Following U3’s general row-based landing rule means the master-admin line opens the home fold, while archived/deleted people still open nothing. If “opens nothing” must remain an exception, explicitly authorize and specify that change in `planRow`. The present order alone does not reconcile the contracts.

5. **Should-fix — U3 R7, Pass C and V11b: retained filters can hide the row the link promises to open.**

   Saber (master admin), on 149, selects **Plans 149**, opens Hunter’s short row and presses **Edit on 142 →**. The squadron changes, but the retained `plans` tick now means **Plans 142**. Hunter is 142’s own man, so his row is excluded. The intended whole editor cannot appear.

   **Code cause:** `usersfilter-model.ts::rolesOf` assigns `plans` only to a person whose home differs from the page’s squadron. `keeps` applies that tick. `UsersPanel.tsx::useRingLanding` explicitly leaves Filter ticks untouched, and the proposed `openFor` entry does not override list filtering.

   **Fix the plan:** define how an explicit Edit-on landing reveals its target despite excluding filters, while preserving the ordinary pick’s filter contract. Test the `plans` example and another excluding Role/CAT filter. Opening work in state and applying a ring are insufficient if no row is drawn.

6. **Should-fix — U3 R7 and Pass C: destination permission is checked when drawn, but not when pressed or after waiting.**

   Hunter (142’s admin, holding Plan of 149 and 150) opens Mako’s row on 149. Mako (150’s admin) lowers Hunter’s Plan of 150 to View before Hunter’s screen redraws. Hunter presses **Edit on 150 →**.

   The proposed row check still passes: Hunter remains authorized on 149, and Mako’s row has not changed. A normal pick of 150 is allowed because Hunter retains View. The subsequent Admin landing cannot deliver the promised whole row on 150 and can bring Hunter back to his own squadron instead.

   **Code cause:** `UsersPanel.tsx::judgeRow` checks `adminThere(on.unit)`—149—not permission over the destination. `pick.ts::pickSquadron` is a general navigation door, including View-only destinations. `store.ts::enterSquadron` and the Admin page-opening path handle the resulting unavailable page.

   **Fix the plan:** recheck destination admin permission and the target’s home immediately before entry, and again after any save/Tracker wait. A failed check must not turn this edit action into unrelated navigation. Test both an unseen permission reduction and one occurring during a wait.

7. **Should-fix — U3 Pass A, `usersView`’s CAT choices: the filter cannot select categories found only in another squadron.**

   Suppose 149’s people have CAT A, while a person in the opened 142 fold has CAT IW. U3 displays that person and applies CAT filtering to fold rows, but explicitly keeps the available CAT choices derived from the page’s own list. IW cannot be selected.

   **Code cause:** `usersfilter-model.ts::usersView` builds `cats` from the selected list’s people and current search finds; `UsersFilter.tsx::UsersFilterBox` offers only those supplied choices. Retiring `found` while retaining an own-list-only calculation removes the route by which another squadron’s CAT could become available.

   **Fix the plan:** derive CAT choices from the complete population the filter now governs, including other-squadron folds, independently of which folds are open. Add a category present only in another squadron to the model and page tests.

**Verdicts**

- **D2826:** ready after changes.
- **U2L:** ready after changes.
- **U3:** ready after changes.

The stated D2826 → U2L → U3 order is present. The missing dependency is the explicit U2L-to-U3 notification-tap contract and test transition identified above.

Rulings: none this session.

