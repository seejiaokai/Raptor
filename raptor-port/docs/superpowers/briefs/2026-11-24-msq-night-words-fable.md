# The night of 24 Nov 26: Fable's review of the app's words (D2441), commit `c2e8e524c`, saved verbatim from its hand-back

## Fable words review (D2441) — branch `claude/msq-b1-screens-135`, commit `c2e8e524c`, read only

Nothing was edited, committed, started or run. Read: D2441, D2318, D2323, D2637, D2389, D2395, D2396, D2400, D2401 (full rows); the writing guide §1, §1a, §1b; the questions page (b)–(p); the drawn page of new words; `undo/describe.ts`, `state/acctlines.ts`, `state/notices.ts`, and the source diff `54772307c..c2e8e524c` without tests.

**Result in one line:** of the three proposed Undo wordings, two stand as drafted and one needs a capital letter; everything else new on the branch is either ruled by him or existing words moved, so I adjusted nothing there. Five facts go back to the builder.

### A. The three proposed Undo wordings (not built)

| Where it appears | Proposed words | Status | Verdict | Adjusted words, exact | Why |
|---|---|---|---|---|---|
| Undo bubble and hover, q1: made a member and sign-in name changed in one Save | "Undid: Made a member, sign-in name changed · Hunter" | new, unruled | keep | — | "Made a member" is the bell's own line; comma, small "sign-in name changed" and "· Hunter" match the ruled (o) shape (D2396, D2400). |
| Undo bubble and hover, q2: sign-in name changed alone | "Undid: sign-in name changed · Hunter" | new, unruled | adjust | "Undid: Sign-in name changed · Hunter" (hover: "Undo — Sign-in name changed · Hunter", "Redo — Sign-in name changed · Hunter") | Every approved line of this family opens with a capital after "Undid: " ("Made…", "Master admin…", "Plan of…"); small only after a comma. No word changed. |
| Undo bubble and hover, q7: made a member, which also ends Plan of 149 | "Undid: Made a member, Plan of 149 ended · Hunter" | new, unruled | keep | — | Same two facts, same order, as the two bell lines that Save sends Hunter ("Made a member", then "Plan of 149 ended"); names everything the one Undo brings back. |
| All three together (role, Plan ended, sign-in changed) | not drafted | new, unruled | — | "Undid: Made a member, Plan of 149 ended, sign-in name changed · Hunter" | The order the code already builds: the role or master admin change first, each squadron line next, the sign-in name last, then the man. Long; (o) already accepted two lines on a phone. |

Checked against the code: making a Plan holder a member does end his Plan rows in the same Save (accounts.ts, D2250), and the bell writes "Made a member" before "Plan of 149 ended". So q7 is true as worded.

### B. Every other new or changed sentence since `54772307c`

| Where it appears | Words | Status | Verdict | Why |
|---|---|---|---|---|
| Bell, made a master admin | "Made a master admin: full access to every squadron" | ruled — D2396 (n), D2400 | keep | As drawn. |
| Bell, master admin taken off | "Master admin taken off: full access to every squadron ended" | ruled — D2396 (n), D2400 | keep | As drawn. |
| Bell, a Plan or View ended by being made a master admin | "Plan of 149 ended: master admin covers every squadron · Saber" (View the same) | ruled — D2396 (n), D2400 | keep | As drawn. |
| Undo bubble and hover, master admin | "Made a master admin · Hunter" / "Master admin taken off · Hunter" | ruled — D2396 (l), D2400 | keep | As drawn. |
| Undo bubble, two changes in one Save | "Plan of 149 given, sign-in name changed · Hunter" | ruled — D2396 (o), D2400 | keep | As drawn. |
| Request access, Squadron box and its error line | "Pick…" / "Pick your squadron" | ruled — D2396 (f), D2400 | keep | As drawn. |
| Leave War or Input window held in the member view | "Member view." / "Switch back to the admin view to change this, or close it." | ruled — D2389, D2400 | keep | His choice A, as drawn. |
| Tracker's band in the member view | "This is 149's Tracker." / "Leave the member view to open it." | moved — D2318's words, the only band D2395 left | keep | Words unchanged; the other two bands were removed, as D2395 says. |
| Tracker question at sign-out | "You have unsaved chart edits on “…”. Save them before logging out?" — Save them / Discard them / Stay | moved (same words, code re-wrapped) | keep | Not new. |
| Tracker question at a pick | "… Save them before switching to 149?" — Save them / Discard them / Stay | ruled — D2318, D2637 | keep | Unchanged. |
| Tracker question at a change of syllabus or course | "Discard them and switch to “…”?" / "Discard them and switch to course “…”?" | moved (only what Discard does behind it changed) | keep | Words unchanged. |
| Input window, the name badge lifted above the shade, hover text | "Back to the admin view" | moved — the top bar badge's own hover, copied | keep | Same control, same words. |
| Admin → Users filter button; Inputs filter button | "Filter", "Filter · 2"; "Filters" | look only — D2401 | keep | No word changed. |

### Flagged facts for the builder (no rewrite made)

1. **Two ways to save, two sets of Undo words.** `accountLabel` (the older account Save) still answers before `accessLabel` and returns "Hunter’s role" and "Hunter’s sign-in name". When q1, q2 and q7 are built, both must give the new words, or the same act reads two ways.
2. **The other direction is not drafted.** A member made an admin needs its line too. The bell's words are "Made an admin of 142", so the Undo line should read "Undid: Made an admin of 142 · Hunter" — the builder to confirm the squadron number is available there.
3. **An admin "made again" may name nothing.** Admin → Users' Save counts re-making a lapsed admin as a role change, but the stored role reads the same before and after, so the Undo words would fall back to "a settings change". Check, read from code only.
4. **Tracker, existing words raised in two new places, with no reason given.** (a) "Save them" pressed in the sign-out or pick question while in the member view is always refused and answers "This change could not be saved." (b) When a right is taken away while he has unsaved chart edits, the edits are dropped and the corner reads "● This change could not be saved." Neither says why, and (b) calls a whole set of dropped edits "this change". The guide asks a refusal to say why (§1). New words here would be a new thing he sees, so this is for a mock-up and his word, not mine to add.
5. **Tracker, an error message that may state a wrong cause.** If anything fails while the Tracker moves to another squadron, it shows "The Tracker could not finish upgrading your data — the browser did not keep what was written. Reload to try again." That sentence was written for one known cause at first load; here it is raised for any failure during a switch, where no upgrade may be involved. I doubt the fact; the builder should confirm or put a truer line to him.

Small note: the old fallback "the master admin mark" is still in the code's list of Undo words. I could find no path that reaches it now, but if one exists it would show the wording (l) replaced.

## Fable's second answer, on the Tracker's failed-switch line (saved verbatim from its hand-back)

**Verdict: keep.**

**Exact words:** "The Tracker could not switch squadrons. Reload to try again."

**Why:** it is true of every step that can fail there (leaving the old squadron, moving, reading the next), names no cause the app cannot know, and matches the family's own shape ("The Tracker could not finish … Reload to try again.").

**Facts I doubt or that need the builder:**

1. **The heading above it is fixed and would now be wrong.** The failure panel (`tracker/App.jsx`, the `bootError` panel) always prints the bold heading "Couldn’t finish upgrading your Tracker data" over whatever message it is given. The new line would sit under that heading. The heading needs to follow the message for this case, and that heading is then a new wording for him too. If it follows, I would use "Couldn’t switch squadrons" (the heading family's own "Couldn’t …" form).
2. **"Reload to try again" probably does not retry by itself.** I found no place where the squadron picked is stored across a reload, so a reload appears to open on his own squadron and he must pick the other one again. Read from code, not pressed; the builder should confirm on the app. If confirmed, the line is still true but leaves out a step. The fuller form would be "The Tracker could not switch squadrons. Reload, then pick the squadron again." — that adds a fact, so it is for the builder to confirm before it goes to him.
3. **One path is not a switch.** The same catch also covers a pick straight back to the squadron he was leaving, where a dropped draft makes the Tracker reload its own chart and that reload fails. No squadron changed there, so "could not switch squadrons" is loose for that case. Rare; named so it is a decision and not an accident.
4. **What is lost at the reload:** nothing saved. Unsaved chart edits have already been asked about, or already dropped where a right was taken away. The Undo steps the Tracker had put aside for each squadron are held in memory only, so the reload loses them. The draft claims nothing about this, which is right; I would not add "nothing has been changed", as two sister messages do, because here the old squadron's memory has already been emptied.
5. **Unchanged case, for the record:** where the read of the next squadron fails its own upgrade check, it returns without throwing and sets its own upgrade message, so that case keeps the first-load words and heading, correctly.
