# Astra's report — the skill-notes review of 20 Nov 26 (codex exec -m gpt-6-astra, reasoning high, read-only, on the live checkout at commit b2314fc80; saved word for word as it came back, chat 121)

REVISE

Reviewed all 14 drafted files, all 54 APPLY rows and all 13 REFLECTED, FILED and MEMORY rows. No files changed.

Paths below refer to the copies under `.claude/skill-updates/2026-11-20/`.

1. **The export recipe can stage and commit the original checkout.**

   **Passage:** `raptor-port/docs/codex-guide.md`, step 3: “`git init -q`, `git -c core.longpaths=true add -A`…”

   **Checked against:** notes 954, 977 and 981.

   Step 1 runs from the source checkout. `tar -C <copy>` changes where tar extracts, not the shell’s working folder. Step 3 never changes that folder or supplies `git -C`. Followed literally, it stages the source checkout; its final log check can also succeed there while the exported copy remains uninitialised.

   Add before step 1:

   > Create a new, empty directory at a short absolute path outside the source checkout. Use that path for `<copy>` throughout; stop if it already contains files.

   Replace step 3’s commands and commit check with:

   > **Make the copy a repo:** run `git -C "<copy>" init -q`, then `git -C "<copy>" -c core.longpaths=true add -A`, then `git -C "<copy>" -c core.hooksPath=/dev/null commit -qm copy`. Continue only if each command succeeds. `git -C "<copy>" rev-parse --show-toplevel` must name the copy, and `git -C "<copy>" log --oneline -1` must print its new commit.

   Keep the junction instruction. Carry the same correction into `[CHECK-TOOLS-HARDEN]` (g)’s drafted recipe.

2. **The proposed report marker repeats the fault it is meant to prevent.**

   **Passage:** `.claude/skills/overnight/SKILL.md`: “a one-off token the brief asked it to open with — never a phrase the brief itself contains”.

   **Checked against:** note 933.

   A token supplied in the brief necessarily occurs in the brief. An unrestricted transcript search still finds the request first. Checking the saved file’s size cannot distinguish a nonempty request from the report. An in-memory replay with a request followed by the helper’s answer reproduced that wrong match.

   Replace those two sentences with:

   > Recover a report from the named helper’s final assistant reply, never from a request or tool message. Within that reply, check the opening token supplied in the brief; then read the saved file and check its size before citing it. A token match alone does not identify a report.

3. **A read-only reader cannot preserve findings by writing them incrementally to its report.**

   **Passage:** `raptor-port/docs/bug-check-order.md`, §4: “each finding written to its report as it is confirmed, so a stopped run keeps what it found”.

   **Checked against:** note 980 and the drafted Codex recipe’s `-s read-only -o <report>`.

   The installed command’s help describes `-o` as saving the agent’s **last message**. It does not save each finding as it appears. The draft therefore promises preservation that this invocation does not provide.

   Replace that sentence with:

   > Astra’s brief asks for the code checked against the rulings and contracts it names, and each confirmed finding stated at once in progress output captured in the run log. The coordinator saves those findings outside the checkout; `-o` saves the final reply only. If the run stops, its captured findings remain available to chase.

   Keep the prohibition on rewording and rerunning a stopped brief, and the reads-owed requirement. Those parts correctly preserve note 980’s boundary.

4. **The unconditional FULL-build chat split contradicts the unattended-work rule.**

   **Passage:** `.claude/skills/session-handoff/SKILL.md`: “A build sized FULL … is split into chats from the start, as the bug-check checklist’s step 3 names them”.

   **Checked against:** notes 942 and 966; checklist step 3; D667 and D867.

   The checklist requires a split **when measured remaining room is insufficient**. D667 and D867 explicitly keep unattended work in one chat, saving state and continuing through compaction. The new absolute instruction can stop an overnight FULL job for a handoff the owner cannot perform.

   Replace the added passage with:

   > Before the first fix of a FULL build, commit the reading of the code to a plan file. Measure the room needed for the build and its checks; where it will not fit, name the separate chats as the bug-check checklist’s step 3 requires. An unattended run stays in one chat, saving its state at clean points and continuing through compaction (D667, D867).

5. **A failing control is a clue, not proof that the fixture is wrong.**

   **Passage:** `.claude/skills/test-driven-development/SKILL.md`, “Read the red”: “treat a control case that should pass and fails as a fault in the fixture, not the fix”.

   **Checked against:** note 979.

   In the recorded case, the failing control led to discovery of a discarded fixture. But a valid control can also expose a regression introduced by the fix. The instruction rules that explanation out before investigation.

   Replace the added loader/control sentence with this separate paragraph:

   > Read back the state a fixture was meant to make through the loader the app uses; a loader may silently discard an invalid row. If a control that should pass fails, check the fixture first. If its premises hold, investigate the code too; do not change the control’s expected result merely to make it pass.

   Start the existing geometry sentence as another paragraph. That also makes the additions from notes 972 and 979 easier to read.

   In `.claude/skills/SUPERPOWERS-VENDORED.md`, change 8, replace “a failing control blamed on the fixture” with:

   > a failing control prompts a fixture check, then a code check if its premises hold

6. **A green pipeline type check does not establish that a browser-test file was checked.**

   **Passage:** `.claude/skills/test-driven-development/SKILL.md`, Verify GREEN: “A new or changed test file passes the pipeline’s own type check”.

   **Checked against:** note 941 and the current TypeScript configurations.

   The application configuration includes `src`; the other configuration includes `vite.config.ts` and `playwright.config.ts`. Neither includes the browser-test directory. A new browser test can therefore carry a type error while its runtime test and the pipeline type check both pass.

   Replace the bullet with:

   > Run the pipeline’s real type check (`npx tsc -b` here) and confirm it includes each new or changed test file. A file outside its coverage needs a type check that includes it, or is reported NOT TYPE-CHECKED; a green runner or build alone does not prove it was checked.

   In the register’s change 8, replace its corresponding description with:

   > Verify GREEN: run the pipeline’s real type check and confirm which changed test files it covers; name any unchecked files

7. **The new pure-style instruction conflicts with the existing safeguard for correcting a stylesheet rule.**

   **Passage:** `.claude/skills/brainstorming/mockups-on-the-real-app.md`, step 6: “A pure-style proposal is drawn by injecting the exact rule to be built”.

   **Checked against:** note 956 and the same file’s existing trap requiring an existing rule to be edited in place.

   An appended injected rule occupies a different position in the cascade. For example, two equally specific rules paint blue then red. Appending green previews green; changing the original blue rule to green still builds red. The existing trap explicitly prevents this misleading proposal.

   Replace the added pure-style passage with:

   > For a pure-style proposal, apply the exact rule in the place it will occupy: correct an existing rule in place as the Traps section requires, or inject a new rule at its intended position. Record the drawing on the unchanged build before building; afterwards, run the same check with no drawing changes applied.

   In the register’s change 8, replace “a pure-style proposal drawn by injecting the exact rule” with:

   > a pure-style proposal drawn with the exact rule in its intended position

8. **The code-check count cannot be matched directly to `git status`.**

   **Passage:** `raptor-port/docs/gates-and-deploy.md`: “match its ‘N changed files’ to `git status`”.

   **Checked against:** note 928 and `raptor-port/scripts/code-check.mjs`.

   The code check compares against `origin/main` by default. `git status` reports uncommitted changes. A branch with one committed source change and a clean working folder correctly produces different counts. Status also includes files outside the checker’s scope. The prescribed comparison therefore reports a coverage problem on an ordinary valid run.

   Replace the new bullet with:

   > **Trap — a new file not yet staged is not read:** by hand, run `npm run lint:changed -- --include-untracked`. Check that the intended new files were included. Its changed-file count is against the named base, normally `origin/main`, not the working-folder count from `git status` (11 Nov 26: a new test file’s finding was met only on GitHub).

   Keep `[CHECK-TOOLS-HARDEN]` (z)’s proposal to print the files actually read; that supplies the useful comparison.

9. **A longer line is not necessarily the newer instruction.**

   **Passage:** `raptor-port/docs/gates-and-deploy.md`, the records-merge addition: “`main`’s longer line is the newer”.

   **Checked against:** note 948 and the requirement to preserve the owner’s answers.

   That was true of the recorded merge, but it is not a safe merge rule. A later answer on the branch may deliberately shorten or narrow an older, longer instruction on main. Choosing by length can restore the superseded instruction.

   Replace the addition with:

   > One such “did not arrive” can be real all the same (14 Nov 26): compare the branch’s copy of each item `main` archived with the archived block. Use the history and the rulings to establish which wording is newer, never its length. Carry across the branch’s answers and other material missing from the archive, preserving which ruling replaces which.

**Notes**

- **Recorded-case exercises:** these were applications to the notes’ recorded cases, not fresh browser walks.

  | Real case | Drafted rule applied | Result |
  |---|---|---|
  | Approvals page, 13 Nov, note 939 | Narrowest desktop width above the phone split, a middle width, and sideways scrolling | The original wide-only walk is incomplete. The narrower clipping and off-screen-opening cases must be added. |
  | Published-day warning, 13 Nov, note 940 | List every reader of a changed setting | The live “no usable times” warning gets its own row; checking only stored figures cannot complete the roll-call. |
  | Undo and waiting-change checks, 13 Nov, note 943 | Use the app’s Undo button; calibrate the named element on clean and changed screens | The ineffective keyboard undo and the history-label match are both rejected before their results are accepted. |
  | Discarded move fixture, 19 Nov, note 979 | Read the fixture back through the app’s loader | The missing move fails the premise before its later red assertion can be credited as proof of the defect. |

- **Constructed case that passes the applicable drafted checks but remains wrong:** a new browser test has valid setup, a real red-before/green-after behavioural assertion, and `const expected: string = 1`, used where the runtime number is correct. Its behavioural checks can pass, and the pipeline’s type check passes because the file is outside its coverage. Reporting that test as type-checked is still wrong. This is the coverage gap in finding 6; the configurations were inspected, but no application test was added or run.

- **Named doubts resolved without a finding:** the cold-read adjustment is explicitly covered by D2230, including its separate confirmation; it retains the claim-by-claim comparison. The page-positioned tag is a bounded exception for a still screen, with its outline remaining on the element. The `23b` rename keeps an explicit historical alias; old “lesson 23” references must be interpreted by their subject, not globally replaced. The deleted push paragraph is covered by the always-loaded shipping rule, including both runs and the last pushed commit. D2229’s full row supports the new 450,000/600,000 and 576,000 figures.

- Note 920’s append-only closing note preserves the archive-move safeguard. Notes 951 and 968 reasonably remain FILED: they add a recording step and a proposed page checker, respectively. Notes 922, 924 and 925 belong together in the document-budget guide. The placements of 931 and 928 are sound; register change 8 otherwise matches the three skills.

- The absolute worktree path fits this PC. `ListAgents` availability remains an environmental limitation, not evidence that a folder is unoccupied. For portability, the opening-line instruction should say: “Use the host’s available live-chat inventory; if none is available, say ownership is unverified and use a separate worktree.”

- For note 938’s filed wording, prefer “choose the area by the subject it governs (D137), then check its room” over “choose the area by room as well as by subject”. D2148 already supplies permission to raise a page’s limit for new-feature rulings; space should not determine which future chats receive a rule.

- **Cuts:** in the mock-up guide, delete the new parentheticals beginning “16 Nov 26: at 390…” and “17 Nov 26: a tag ‘under the mission’…”. Their precise lessons remain in the preceding instructions and their stories remain in the observation log. In the handoff guide, delete “(3 and 10 Nov 26, the second from a line written by hand in a reply)”; the sentence before it already states the consequence. Finding 4 also removes the repeated fullness anecdote without losing the planning requirement.

- **Backlog references checked:** (s) commit guard; (t) future timestamps; (u) removal of unmerged blocks; (v) large pushed files; (w) lesson numbering; (x) check-then-commit; (y) after-merge wait; (z) untracked files. The final drafts’ citations match these letters. The exported-copy extension correctly remains (g).

Rulings: none this session.

Sampled rows:

- **APPLY — 54:** 916, 918, 920–925, 927–931, 933, 936–937, 939–950, 952–966, 969, 971–974, 976–981.
- **REFLECTED — 2:** 915, 970.
- **FILED — 9:** 917, 919, 926, 932, 935, 938, 951, 967, 968.
- **MEMORY — 2:** 934, 975.

