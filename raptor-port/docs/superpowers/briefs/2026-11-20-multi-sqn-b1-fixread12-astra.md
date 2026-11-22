# Fix read 12 — Astra (GPT-6 Astra), whole (20 Nov 26, chat 118; copy at `04f8d92cb`, code = `c2fd83020`)

Run by `codex exec -s read-only -m gpt-6-astra`, input closed; finished whole — its first full report since fix read 7. Its runner was blocked by the sandbox, so its proofs ran in memory (no file); the builder makes each red first. Its report, as returned:

**Review result: not clear. Three findings need fixing.** All were reproduced with failing assertions against the production modules. No files changed.

1. **High — Delete postings fail when the person holds another squadron’s View or Plan.**

   **Scheduled case:** On 15 July, give Ranger View or Plan of 149, save his account, and schedule Delete for 16 July. Advance to 16 July and run the posting pass.

   Expected: person, account and rights removed together. Observed: all remain; the expected deletion assertion fails. The held-reason reader returns no reason.

   **Immediate case:** With the same saved account and foreign right, Hunter selects Delete dated today. The posting is refused; person, account and right remain. Equivalent scheduled and immediate cases **without grants pass**.

   **Cause:** E adds grant removal when an account goes. The scheduled posting gate permits account, access-request and request-seen cleanup but omits grants. The ordinary gate’s H exception accepts only a command labelled `person.delete`; immediate posting uses `lw.postout`.

   **Introduced:** Yes, by E’s cleanup, incompletely accommodated by H.

   **Fix:** First establish from the command’s effective before/after records that an authorised deletion actually removes this person and account. Permit only that account’s grant removals through both deletion routes. For the scheduled route, additionally require the matching due Delete posting. Retain refusal of unrelated grant changes. Add scheduled/immediate tests for View and Plan, home admin and master, plus the passing no-grant controls.

2. **High — Repeated Undo/Redo revives notifications that a move already retired.**

   **Master proof:** Give Hunter the master mark on 10 July and create his filer notification. Remove the mark on 11 July; he moves on 12 July. Undo on 13 July correctly restores the mark dated **13 July**, leaving the old notification hidden. On 14 July, Redo the removal and immediately Undo again.

   Expected: the effective 13 July date remains; notification stays hidden. Observed: the date becomes **10 July**, and the notification returns. Both observations were captured before the assertion failed.

   **Plan proof:** Plan dated 13 July becomes View on 15 July; the person moves on 16 July. Undo on 17 July correctly restores Plan dated 17 July. Redo/Undo on 18 July restores **13 July**, reviving the retired notification.

   A separate red test using **two different master steps** also restores the obsolete date.

   **Cause:** G correctly records the latest removal time, but the next restore still takes the right’s date from the original Undo record. It forgets the later effective date established by an earlier restore.

   **Introduced:** G introduces the demonstrated same-step cycle. The two-different-steps variant predates these commits.

   **Fix:** Before a successful restore removes a right or link, retain its effective dates, tied to the account, person and squadron. When reversing that restore, use those dates if preservation is allowed. Continue dating today when a move occurred while the right was absent; keep Redo of a re-link dated today. Cover master, Plan/View and re-link round trips, including two different steps.

3. **Medium — The person-delete exception can remove foreign rights while the person stays.**

   **Proof:** Kestrel creates a new account for a 149 person; Saber grants it Plan of 142. As Kestrel, submit a settings command labelled `person.delete` which removes that account and grant but makes **no person change**.

   Expected: refusal. Observed: accepted; the person remains and the 142 grant disappears. Creating a replacement sign-in for that same person then succeeds, with the foreign right still gone.

   This was a production command-helper test, **not a gesture exposed by the current screen**.

   **Cause:** H’s `accountGoesHere` checks account disappearance. The exception does not require the corresponding person to become deleted. The command label supplies the missing premise.

   **Introduced:** Yes, by H.

   **Fix:** Require the same command to transition the account’s live person to the app’s deleted state, remove the account, and pass that person’s deletion permission check. Judge the final effective records, including remove-and-write-back sequences. Refuse cleanup when the person survives, the account survives, or the actor cannot delete that person. Retain passing tests for genuine deletion with foreign rights.

**Production coverage, starting with the specialised routes**

| Surface and gesture | Required visible result and consumers |
|---|---|
| Leave War posting sheet: dated Delete, due posting pass, Undo post out | Person/account state in Users; pending or held posting state; completion and take-back bell lines |
| Users: add/edit account, rename, change linked person or role, suspend/enable, delete person | Account row and available access; rights cleanup; deleted-person state |
| Squadron, grant and master writers | Authority consumed by account access, editing permissions and bell history. New grant/master controls are not UI callers in this copy; this is not filed as another finding |
| Desktop, phone and board Undo/Redo | Available arrows/refusal feedback; restored records, dates and notification follow-ups |
| Leave War cells, ranges and decision controls; bidding open/close | Leave marks, approvals and full/AM/PM decisions; own-person notifications and taken-back/again states |
| Holidays list, import, Event sheet, single/repeated/merged Event dates | Holiday display, OIL questions and relevant scheduler notifications after add/change/remove/Undo/Redo |
| Inputs, calendars, Medical, SANS, week/board and shared input editor | Saved request, ownership, loaded-week state and notification changes |
| Desktop/phone bell list, unread indicator, Mark all read and notification taps | Shared visibility rules; routes to input editor, OIL day list, Leave War or Users |

Roles considered were master, home-squadron admin, foreign Plan/View holder, member and unauthorised actor. Sequence coverage included moves before/on/after grants, moving back, two moves, read/unread notifications, re-links, deletion, repeated restores and different Undo steps.

**Builder choices and explicit negatives**

- **A:** Supported on the checked paths. Saved-row substitution rejects rewritten ownership; loaded-week member editing and input delete/Undo/Redo pass. Production boot installs the probe, and queued writes update its in-memory source synchronously. Remote/seed exclusions and the order-row distinction are intentional. Backend failure/retry was inspected, not integration-tested.
- **B:** Supported. No production person-origin caller of the retired load command was found.
- **C:** Supported. Shared-place holidays reach both squadrons’ relevant schedulers. Event/list/import writers, renaming, removal and Undo/Redo passed. An unset holiday-owing probe grants no exemption.
- **D:** Supported on tested writers: decisions, full/AM/PM refusals, bidding, SANS posting, posting take-back and restore follow-ups. No additional signer failure found.
- **E/H:** Genuine Users deletion with foreign rights works, and bare foreign-grant removal remains refused. Findings 1 and 3 show incomplete coverage.
- **F:** Supported for an unchanged link and the older rename-Undo case.
- **G:** Incomplete: finding 2. Missing timing information dates a restored right today; Redo of Plan → View remains View.

Actual person Delete has no Undo, as D350 requires. The brief’s held questions and excluded cases were not reported as findings.

The normal runner was blocked creating its temporary directory. I therefore ran assertions **in memory**, without writing files. All **146 existing cases** across rounds 7–11 passed through that harness; the additional failing cases above expose coverage gaps. This was not a Vitest pass or a rendered browser walk.

Excluded reports and the builder’s handoff block stayed unopened. No pasted post-compaction handoff was used. Tidiness: no separate cleanup proposed.

**Rulings: none this session.**

