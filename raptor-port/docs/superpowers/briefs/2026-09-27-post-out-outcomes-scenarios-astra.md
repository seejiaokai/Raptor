# Astra — `[POST-OUT-OUTCOMES]` browser-walk scenarios

Designed from the finished code, owner rulings, Round 2 plan, approved mock-up, and PO1–PO12. These scenarios were not executed; no tests or builds were run.

## Ranked scenarios

1. **A blocked last-admin outcome remains visible after the toast**

   - **Start state:** Saber is the only enabled admin. Give him an Overseas Sqn posting due today; repeat with Delete.
   - **Gestures:** Let the outcome run, dismiss the warning, reload, and reopen the grey Leave War cell and Admin → Users. Cause several unrelated notifications. Change the posting and make it due again; then add another enabled admin.
   - **Must show:** The warning occurs once per unchanged posting, while a persistent line on the post-out sheet/account row explains that suspension or deletion is waiting because he is the last admin. Changing the posting permits one fresh warning; adding another admin makes the outcome complete silently.
   - **Proves it wrong:** The toast is the only explanation; reload loses the blocked state; notifications repeat it; changing the posting does not re-arm it; or the outcome never retries after another admin exists.

2. **A delete cannot be undone by loading an issued version or parked plan**

   - **Start state:** On 3 Oct 2026, put Hex on a published day and in a parked plan, complete CUR CK, SKED CK, PLANNED BY and APPROVED BY, then publish an amendment so an older version also exists.
   - **Gestures:** Admin → Users → Hex → Delete account → Tap again. Inspect the working day and current/older issued faces; use the published-version Load control, then switch the parked plan onto the day.
   - **Must show:** The working day loses Hex, reads pending, and all four sign-offs fall. Issued versions remain unchanged. Loading either version or switching the plan says Hex was left out and never reinstalls him.
   - **Proves it wrong:** An issued record is rewritten, the day is not pending, any sign-off survives, or a Load/plan switch puts Hex back.

3. **Undo and Redo pass over a deleted man without becoming a wall**

   - **Start state:** Make one safe edit to Saber; afterwards remove Hex manually from a future day; then delete Hex.
   - **Gestures:** Press Undo repeatedly. Separately, add Hex to a future day, Undo that add, delete him, then press Redo repeatedly.
   - **Must show:** Undo skips the removal whose inverse would resurrect Hex and reaches the older disjoint Saber edit. When only the dead step remains it says “Hex has been deleted — that change can’t be undone.” Redo abandons the unsafe add and restores nothing.
   - **Proves it wrong:** Undo remains lit but repeats the same refusal, safe older work is unreachable, Redo resurrects Hex, or an overlapping older edit bypasses the conflict guard.

4. **SANS posting and Show SANS work in both orders**

   - **Start state:** Hex is active with past leave and a SANS posting due today.
   - **Gestures:** With Show SANS off, run the posting, then turn Show SANS on and off. Reset; turn Show SANS on first, then post him as SANS. Finally untick SANS by hand, notify, and reload.
   - **Must show:** Off: Hex remains in his old group, marked posted out and untracked. On: his whole row moves to the SANS group and is tracked; manning follows that choice. A hand SANS change after the outcome is not reversed by another pass.
   - **Proves it wrong:** His row vanishes with Show SANS off, appears in two groups, only later months move, counts disagree with the row, or reload re-applies a hand-cleared SANS tick.

5. **Outcome take-back owns only what the posting made**

   - **Start state:** An Overseas Sqn posting has already archived Hex and suspended his account.
   - **Gestures:** Enable the account by hand; cause another notify and reload. Change the completed outcome to SANS, then move its date after today, then Undo post out. Repeat with an account suspended by hand before the posting.
   - **Must show:** Hand Enable survives every later pass. Changing to SANS removes the posting-owned archive/suspension, applies SANS, and raises no “he’s back” prompt. Moving later takes back posting-owned state only. A hand suspension is never enabled by changing, moving, restoring, or undoing the posting.
   - **Proves it wrong:** A later pass suspends the account again; take-back raises the Quals prompt; stale archive/SANS remains; or a hand suspension is cleared.

6. **The interval between a past PO date and today changes only the crowd**

   - **Start state:** Publish 26 Sep with Hex inside an ALL AVAIL crowd and all four sign-offs. Give him a Delete posting from 25 Sep; today is 27 Sep. Put him directly on 28 Sep too.
   - **Gestures:** Let the outcome run, inspect 26 and 28 Sep on working and issued faces, and open the ALL AVAIL list.
   - **Must show:** The delete cutoff is 27 Sep, so a direct puck before it stays. The posting window nevertheless removes Hex from the working ALL AVAIL crowd from 25 Sep; the frozen issued crowd still includes him, so 26 Sep reads pending and loses its sign-offs. His 28 Sep puck is removed.
   - **Proves it wrong:** The 26 Sep direct record is stripped, the working crowd still contains Hex, the issued crowd changes live, no pending mark appears, or 28 Sep retains him.

7. **Past Leave War and OIL survive; future value disappears**

   - **Start state:** Hex has leave and earned OIL before 27 Sep, plus future bids, leave and a published future weekend that would award OIL.
   - **Gestures:** Record his figures, delete him, inspect his past Leave War months, future months, OIL tracker, and manning; publish the pending future day again without him.
   - **Must show:** Past leave and earned OIL remain in the months he was present. Future bids, leave and credits vanish; he has no current OIL balance/tracker row and contributes zero manning from the cutoff. A still-issued future version containing him cannot keep crediting a deleted man.
   - **Proves it wrong:** Past value is erased, future value survives, the tracker still offers him, counts include him, or republishing changes the past.

8. **A preserved or unreadable future week refuses the whole delete**

   - **Start state:** Hex exists in live, stashed and parked future days; prepare one future stash that the app must preserve or cannot read.
   - **Gestures:** Use Admin → Users to complete the two-tap Delete account action. Repair/remove the bad stash and repeat.
   - **Must show:** The first attempt names the unreadable/unchangeable week and changes nothing: person, account, callsign, schedule, inputs, war and planning calendar all remain. The second attempt deletes everything atomically.
   - **Proves it wrong:** Any partial deletion occurs, the bad week is silently skipped, the UI claims success, or the repaired retry leaves a surviving reference.

9. **A reused callsign never changes the identity on an old day**

   - **Start state:** Hex flew on a past published day. Delete him, then add a new person also called Hex and place the new Hex on a future day.
   - **Gestures:** Inspect the past day, current roster/search/pickers, CSV and print; search “Hex” on both days.
   - **Must show:** The past puck remains the deleted original person, while active lookups and future placement resolve to the new person. The past day does not become pending merely because the old body was deleted or the name reused.
   - **Proves it wrong:** The old puck disappears, retargets to the new person, loses its label, or the deleted body is offered by an active picker.

10. **Two archived holders and one active holder are never confused**

   - **Start state:** Archive two people and rename both Ace; then create a new active Ace.
   - **Gestures:** Open Quals’ Archived list. Try Restore on each archived Ace, refuse a blank/overlong/taken replacement, then restore each under a distinct free callsign.
   - **Must show:** Both archived rows remain distinct. Restore offers an inline replacement callsign, uses the normal refusal wording, and renames plus restores exactly the selected body in one step. Typed “Ace” continues to mean the active Ace.
   - **Proves it wrong:** The wrong archived row changes, an active duplicate is created, Restore silently renames someone else, or the callsign resolves to an archived body.

11. **Post out then Restore, and Restore then post out**

   - **Start state:** First, let an Overseas Sqn posting run. Separately, begin with a manually archived person.
   - **Gestures:** For the first person use Quals → Archived → Restore; for the second, Restore first and then create a new Overseas Sqn posting due today.
   - **Must show:** The first Restore clears the posting, restores the person as-is, enables only a posting-suspended account, and displays the left-aligned “he’s back” prompt. In the reverse order, the person remains restored until the new date, then archives/suspends once.
   - **Proves it wrong:** The posting remains after Restore, quals reset, the prompt changes data, a hand suspension is enabled, or the reverse order fires early or twice.

12. **Deleted and archived people across every list and picker**

   - **Start state:** Keep one ordinary archived person and one deleted person.
   - **Gestures:** Walk Quals/current and Archived, crew palette, Available crew/day `~`, SANS availability, Inputs add/filter/editor selectors, Admin account-link picker, all four sign-off pickers, Leave War groups and OIL tracker, Tracker + Add, Insights and scheduler search.
   - **Must show:** The deleted person appears nowhere as a selectable/current person, including Quals’ Archived list. The archived person is absent from active-roster surfaces; his roster row is on Quals’ Archived list, with any historical Inputs access confined to the explicitly labelled “Posted out / archived” group.
   - **Proves it wrong:** A deleted option remains anywhere, an archived person leaks into an active picker, or a deleted identifier renders as a raw id or blank label.

13. **Every role is checked at the screen and write path**

   - **Start state:** Prepare a member, guest, suspended account, real admin, and admin in member view; leave a post-out or drag-selection sheet open before switching view.
   - **Gestures:** Try Post out, Post in, Undo post out, Delete account, Rename, Restore and Restore-as through the screen and hand-made calls. Switch the admin to member view mid-gesture; use Undo; sign out and back in. Repeat the role switch from the phone drawer.
   - **Must show:** Only a real admin view offers the management doors. A mid-gesture switch removes the write control; calls are refused, and his admin Undo says “Switch back to the admin view to undo that.” Re-sign-in starts as admin. No member, guest or suspended account can climb roles.
   - **Proves it wrong:** A hidden control still writes, an open sheet retains authority, the Leave War role lags, a hand-made call succeeds, or a new sign-in remains in member view.

14. **All three posting doors use the same compact contract**

   - **Start state:** Use an active Leave War cell, an existing grey posted-out cell, and a one-person drag selection.
   - **Gestures:** Open respectively the bid sheet’s PO, the Post out sheet, and SelectSheet’s “Post out (PO)…”. Exercise Overseas Sqn, Delete, SANS, Transfer to Sqn and un-choosing the selected chip on desktop and phone.
   - **Must show:** Each door has the four short chips, one date, one outcome line, Transfer disabled with “Comes with the shared database,” and no repeated explanation. Delete’s first tap writes nothing and names the person; the required confirmation completes it.
   - **Proves it wrong:** A door has old wording or missing chips, Transfer writes, the date is repeated, Delete commits on the first tap, or the three routes produce different state.

15. **Reload and navigation disarm every destructive first tap**

   - **Start state:** Open Delete account for Hex and arm its first tap; separately arm Delete in each posting door.
   - **Gestures:** Before confirming, reload, close the sheet, open another account, change date, change outcome, or tap the armed chip again. Then perform a clean two-tap delete and reload.
   - **Must show:** Every interruption disarms the confirmation and leaves data unchanged. Only two deliberate taps in one uninterrupted context delete; that completed deletion persists after reload.
   - **Proves it wrong:** A stale second tap deletes after reload/navigation, changing a field preserves the arm, the first tap writes anything, or a completed delete returns after reload.

16. **Input, document and history boundaries follow the cutoff**

   - **Start state:** Give Hex one past medical/leave/course input with a document, one input spanning 27 Sep, and one future input; create visible edit-history entries.
   - **Gestures:** Delete him, inspect past records/documents/history, the spanning record, future dates, landed programme rows and the Inputs selectors.
   - **Must show:** Past records, their documents and history remain; the spanning input ends on 26 Sep with truthful “till” wording; future inputs and landed rows disappear. No past record is silently reassigned to a new holder of the callsign.
   - **Proves it wrong:** A document/history entry vanishes, the spanning input still covers the cutoff, a future row remains, or a retained record points at the wrong person.

17. **Roster-only people and “nothing else” do not invent account work**

   - **Start state:** Create a roster-only person with no sign-in account.
   - **Gestures:** Open all three posting doors, inspect Overseas Sqn and Delete wording, tap the selected chip again to choose no outcome, and Post out. Also open Post in.
   - **Must show:** Outcome lines omit “account suspended/deleted” when no account exists. No outcome reads “off the manpower, nothing else” and changes only the posting window. The button reads “Post out”; the joining twin reads only “Post in.”
   - **Proves it wrong:** The line promises account work, no-outcome archives/deletes/SANSes him, or either button repeats its date.

18. **Guest, print and CSV obey the published record**

   - **Start state:** Publish one day Hex flew before the cutoff and one future day containing him; enable Guest View, then delete Hex.
   - **Gestures:** Sign in as guest and inspect both issued days. As admin, inspect working/current/older versions, print and CSV; publish an amendment of the future day without him and repeat.
   - **Must show:** The past issued day always keeps Hex. Before the amendment, the future issued face also keeps what was published while the working day is pending without him. After the amendment, the guest sees him gone there; the older version still keeps him.
   - **Proves it wrong:** Guest/CSV/print read live roster state instead of the chosen version, deletion silently changes an issued face, or the past loses him.

19. **Planning calendar and Tracker retain identity without offering the deleted man**

   - **Start state:** Put Hex in planning-calendar pucks before and after the cutoff and link him to completed and ongoing Tracker courses.
   - **Gestures:** Delete him, inspect calendar positions, Tracker records and Tracker’s + Add roster; then add a new Hex.
   - **Must show:** Past calendar history remains; future occurrences become gaps without shifting neighbours. Completed Tracker history stays linked to the old id; + Add excludes the deleted person and never retargets the old course to the new Hex. An ongoing-course removal is explicitly the known deferred `[POST-OUT-TRACKER]` item.
   - **Proves it wrong:** Future pucks survive, neighbours shift, the deleted person is addable, or a same-callsign replacement inherits old Tracker records.

20. **The complete destructive and recovery flow remains usable at phone width**

   - **Start state:** Use a 390 px viewport with an archived callsign collision, an existing posting, and another account open in Admin → Users.
   - **Gestures:** Walk the drawer’s role switch, all three post-out sheets, Delete account’s second tap, Archived Rename/Restore-as, the “he’s back” prompt, Show SANS and the OIL tracker.
   - **Must show:** Every chip, date, confirmation, refusal and recovery control is visible, readable and tappable; sheets scroll without hiding their close/confirm controls; no horizontal page scroll or accidental background-grid gesture occurs.
   - **Proves it wrong:** A required control is clipped, chips wrap ambiguously, the second tap cannot be reached, the grid moves through a sheet, or the phone route lacks a desktop action.

## Surfaces or orders absent from the plan’s roll-call gains

- Persistent on-screen `poBlocked` state, its survival after the toast, and its reset when the posting changes.
- Switching to member view while a Post out or drag-selection sheet is already open.
- A hand suspension before a posting, followed by outcome change, move, Restore or Undo post out.
- Past input documents and the visible change-history record after deletion.
- The planning calendar’s visible gap and preservation of neighbouring puck positions.
- The no-account wording, the un-chosen “nothing else” outcome, and the shortened “Post in” button.
- The current issued guest face before and after the amendment that finally removes the deleted man.
- The foreground experience of a user whose account becomes suspended or deleted while another admin acts.

