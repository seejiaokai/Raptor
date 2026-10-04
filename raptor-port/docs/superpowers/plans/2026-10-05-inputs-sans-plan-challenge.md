# Inputs/SANS plan — independent Sol challenge, 5 Oct 2026

Author Sol 6.1, independent of Astra's plan/mock. Authority D580 delegates product
choices/build. Outcome PASS for the corrected plan at SHA256
`a9e13ae345b7d5c7a4598c6c5a2b6360bec3d0dfb0f43009e46023bfb5df6a6d`.
This is technical/design challenge, not owner picture approval, built-code approval
or Claude's read. Source has not changed at this checkpoint.

Read the plan, source/permission/settings paths and date helpers. One concrete
finding: copying the mission-role hook's unconditional prefix throw would refuse
typed SANS day saves and settingsStore Undo/rollback, which use store.set. Cause:
mission-role rows have a separate store; proposed sansday rows use settingsStore.
Fix: refuse naked sansday writes outside a command, allow command-owned typed save
and restore/Undo, and prove both permission and validation at that seam. Astra
retained its original text and appended the accepted correction in section8.
Tests must show atomic rollback and member/admin-member-view refusal. No weaker
data path, extra store, storage bypass or protected hook changes are authorized.

The existing fmt(ISO) preserves an explicit off-base-year label; inputCoversDate
uses the row's own yr. The new derivations must reuse both and prove cross-year,
multi-day and overnight anchoring. Count unique Fly offers independently of all
display filters; no new time-coverage eligibility policy is hidden in the total.
Plan preserves existing records, notes/pucks, medical/OIL prompts, publication,
own-member/admin permissions and list export. Zero versus absent target, global
inclusive cutoffs, explicit admin day/night planning intent and separate transient
view state are coherent delegated choices with reasons. FULL scenarios map the
affected roles, storage, publication, gestures and upstream/downstream surfaces.

Branch ancestry independently checked: planning5f9bf978 is an ancestor and exact
merge-base of workflow-ui c6e1634d. Create the new job from planning, then fast-
forward the saved reviewed UI descendant. No main merge, cherry-pick/reset or
loss of old evidence. Claude plan/code/scenario/full pictures remain owed before
main; all inherited reads remain owed too.

## Private picture challenge

Astra's original HTML proposal produced blank main content. Sol personally opened
four blank captures; Chromium reported `SyntaxError: Unexpected identifier 's'`.
The single-quoted editor template contained an unescaped apostrophe. Astra fixed
only that parser error; original captures are retained as failed evidence. New
mock SHA256 `9d14a8754177af189b8cb90652a0c379c30874281ff740f1039d94934de1896b`.

Sol rendered/opened all eight corrected pictures: Member month, SANS month,
SANS day, Member day, Custom editor, date selection, List and desktop admin. Every
main is nonempty and no browser pageerror occurred. Pictures show the incumbent
dark shell, two clear mode controls, Calendar/List, legible compact SANS totals
and shortage text, hours/activities, blank Remarks, selection and admin settings.
These are synthetic static design states, not saving/gesture/runtime/Safari proof.
Do not ship their synthetic data or reference pixels into the app.

Initial private captures mistakenly ran after a sandbox refusal to create the PC
lock; they carry no lock compliance claim. Corrected eight-state capture ran only
after an escalated lock take returned0, and released immediately after completion.
No application gate/source check used the unlocked attempt. Future heavy checks
must inspect lock exit status before starting and release through the same route.

Private assets live under the task's visualization folder, `inputs-sans`, with
corrected pictures in `proposal-r2/`; no private image is staged or pushed.
Final actual-app pictures must be inspected by independent Astra; the builder
must not approve its own source. This challenge applies to the plan/picture
proposal only. Any material plan correction is read before dependent source work.

Rulings: D569–D580 already filed by host; none added by this challenge.
