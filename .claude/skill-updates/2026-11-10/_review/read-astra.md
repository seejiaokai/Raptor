# Astra's report — the skill-notes review of 10 Nov 26 (codex exec -m gpt-6-astra, reasoning high, read-only, on an exported copy of commit 0669d87a1; saved word for word as it came back)

REVISE

The drafts contain useful lessons, but several passages change the checking rules or conflict with instructions elsewhere. Revise the following before approval.

All paths below are relative to `.claude/skill-updates/2026-11-10/`. This was a read-only review: no files changed, no commits or pushes, and no other reader’s report opened.

1. **The drawing shortcut drops safeguards from the approved method.**

   **Passages:** `raptor-port/docs/bug-check-order.md` §7.0: “or, where the drawing script saved its own measured figures, is checked by that script’s own measure”; `raptor-port/docs/walk-scripts.md` §10: “may be checked without a part list”.

   **Checked against:** observation 875, D1494, D1495, and the exact wording approved under D1495.

   Reusing the measuring function is sound. Treating its saved figures as a substitute for the approved method is not. The draft does not require those figures to cover every required state and property, establish that the recorded drawing matches the approved picture, or retain the existing treatment of unreachable states and accepted differences. The board’s 78 geometry figures demonstrate a useful technique, not equivalence to all those safeguards.

   **Replace the alternative in §7.0 with:**

   > A surface whose drawing has no part list or no record yet gets both first (`docs/walk-scripts.md` §10). Saved figures from the drawing script may help prepare them; they do not replace the checks approved in D1495.

   **Replace the new §10 bullet with:**

   > **Reuse a drawing script’s own measuring function, copied whole, for the measures it already covers.** Keep the part list and every safeguard above and below: the approved-picture comparison, the states and properties measured, the refusal of missing records or unreachable states, the marked comparisons and the precise record of each difference he keeps (D1494, D1495). Add any missing measures before calling the drawing check complete.

2. **The overnight report-saving instruction breaks the new blindness rule.**

   **Passage:** `.claude/skills/overnight/SKILL.md`, Part 2: a helper’s report “is saved into the repo … the moment it arrives, before anything is done about it”.

   **Checked against:** observation 852 and the drafted bug-check order §4, which forbids any report or summary in a folder another blind reader can access.

   If Astra returns while Opus is still reading the checkout, following the overnight instruction exposes Astra’s report. Both instructions cannot be obeyed.

   **Replace that report-saving sentence with:**

   > A helper returns its report as its final reply. Save it at once. While any blind reader is still working, keep the report and every summary outside the files those readers can access; copy them into the repo only after all blind reads have ended. Other reports go straight into their named home.

3. **The revised Claudex passages still contradict the readers they now name.**

   **Passages:** `raptor-port/docs/bug-check-order.md` §4a and “With the Claudex loop” now name a fresh Opus reader beside Astra, but retain “the provider that built never inspects” and the instruction to give the inspector “the finished code AND the evidence sheet”.

   **Checked against:** D790, D903 and D1770.

   D790 expressly permits a fresh Opus reader of Opus-built code, while withholding the walk’s report. The remaining sentences can either exclude that required reader or give it material it must not see. The checklist’s precedence note helps, but these passages should state the same rule.

   **Replace both provider-prohibition sentences with:**

   > Claudex’s independent reviewer is never bypassed. The chat that wrote the code never reviews it; the fresh, blind Opus read required by D790 remains beside Astra’s, including when Opus wrote the code (D1770).

   **Replace the evidence-sheet instruction in §4a point 1 and the corresponding summary instruction with:**

   > Walk first and fix what it finds, then give the readers the finished code and the same brief. The fresh Opus reader sees neither the walk’s report nor another reader’s report (D790); any evidence handed to a reader follows §4’s blindness rules.

4. **The main-folder recipe can operate on the wrong checkout and does not prove that work is pushed.**

   **Passages:** `.claude/skills/session-handoff/SKILL.md`, Step 3: `git -C . switch main` and `git -C . merge --ff-only origin/main`; `raptor-port/docs/gates-and-deploy.md`, the main-checkout paragraph: `status -sb` showing no “ahead”.

   **Checked against:** `[MAIN-CHECKOUT-STALE]`, its original full-path recipe, and the requirement to preserve another chat’s work.

   `-C .` means the current folder. In this review it resolved to the exported review folder, not the main checkout. Also, a detached checkout or a branch without an upstream can show no “ahead” while holding unpublished commits. Switching away can strand that work.

   **Replace the gates-guide recipe with:**

   > After a merge that changes these files, bring the main checkout level only when no chat is using it, it has no tracked changes, and its current commit is safely held on a fetched remote branch. Use `git -C C:/Users/User/projects/Raptor` on every command: fetch `origin`; confirm `branch --show-current` names a branch; confirm `log HEAD --not --remotes=origin --oneline` prints nothing; then `switch main` if needed and `merge --ff-only origin/main`. A detached checkout, an unpublished commit, a failed check or a refused command stops this update: leave the folder as it is and say what holds it. Never reset, restore or clean the folder. Verify the loaded settings and skills in a new chat.

   **Replace the handoff guide’s duplicate recipe with:**

   > When the main checkout is on another branch or behind `origin/main`, follow the guarded, full-path recipe in `raptor-port/docs/gates-and-deploy.md`, “A worktree chat loads its settings, hooks and skills from the MAIN checkout”. If any condition fails, leave it alone and name what holds it.

5. **The own-folder clause assumes the chat can write to another worktree.**

   **Passage:** `.claude/skills/session-handoff/SKILL.md`, Step 1: “run `git worktree add --detach ../Raptor-<short> origin/main` … and work only there”.

   **Checked against:** observations 787 and 831, the writer’s stated worktree-permission doubt, and D975.

   Separate folders prevent branch collisions, but creating a folder does not grant the current chat permission to write there. The instruction also leaves the new checkout detached without completing the branch setup in that clause.

   **Replace it with:**

   > Before any switch, check whose folder this is. If another chat uses it or it holds changes you did not make, leave it untouched. Use this chat’s own writable worktree. Where the tools permit creating and using another worktree, create it at a short path outside temp and scratchpad folders, then complete the new-job or continuing-branch setup below before editing. Otherwise hand off to a fresh chat whose opening line uses its own writable worktree; never ask him to pick a branch or worktree (D975). Check the branch before every commit.

   I did not attempt a prohibited write to reproduce the permission refusal.

6. **The fixed two-chat rule overrides the judgement the owner asked for.**

   **Passages:** `raptor-port/docs/bug-check-order.md` §0a step 3 and `bug-check-checklist.md` step 3: “A FULL check whose chat starts past about 40% … names its chats”.

   **Checked against:** observation 893; D868, D871, D874; and D667/D867 for unattended work.

   This turns one measured case into a universal split. It mandates two chats even when the remaining work fits, and applies without an exception to overnight work that must continue in one chat. The useful lesson is to count forthcoming loads and choose clean stopping points.

   **Replace the added order text with:**

   > Before a FULL check, estimate the remaining reading and work, including files that load by themselves. If it will not fit, name a clean stopping point and what follows it. In the day, suggest the handoff when appropriate (D868, D871, D874); unattended, save the state and continue through compaction (D667, D867). Do not choose a fixed number of chats from the starting percentage alone.

   **Replace the checklist addition with:**

   > Include the remaining reading and work in that estimate; name a clean stopping point if needed, following the daytime handoff or unattended compaction rule.

7. **A correct unchanged-behaviour comparison is wrongly required to fail on the old build.**

   **Passage:** `raptor-port/docs/walk-scripts.md` §8: “the change’s own checks run on it and FAIL; a before whose checks pass shows the change”.

   **Checked against:** observation 750 and the same section’s instruction to write an out-of-scope test that passes on the old build.

   Observation 750 concerned checks for changed words. Section 8 also governs refactors and cases whose behaviour must remain identical. Those checks should pass on both builds. The new sentence rejects valid baseline evidence.

   **Replace it with:**

   > **Prove which build supplies the “before”.** Build from the named base commit and verify the served bundle belongs to it. Where a check distinguishes the intended change from the old behaviour, run it on the base and confirm it fails for that difference. Checks of behaviour that must stay unchanged should pass on both builds; their passing does not identify the build.

8. **Deleting every failed attempt can delete the defect’s evidence.**

   **Passage:** `raptor-port/docs/walk-scripts.md` §5: “before hand-back the walker deletes its failed attempts’ pictures”.

   **Checked against:** observation 896, the bug-check order §5’s preservation of the first walk’s pictures, and the instruction never to delete data or history.

   “Failed attempts” does not distinguish a broken script from a successful reproduction of a real defect. A walker following this literally can erase the before pictures needed to verify its finding and fix.

   **Replace it with:**

   > Each attempt writes to a fresh sub-folder and never reuses a picture number within that attempt. Before hand-back, identify the final run and its picture count; label earlier attempts separately. Keep every picture that supports a finding or a before-and-after comparison. Failed attempts must never be mixed into the cited run.

9. **The frame buckets turn one machine’s refresh rate into a general rule.**

   **Passage:** `raptor-port/docs/walk-scripts.md` §5: “buckets around each refresh (under 20 ms, one refresh skipped, 34.5–50 ms, over 50)”.

   **Checked against:** observation 884, whose principle is to bucket around the actual refresh multiples.

   The supplied numbers assume roughly 60 Hz. I ran a synthetic check: 100 intervals at 8.333 ms and 100 at 16.667 ms both produce `[100, 0, 0, 0]` under those buckets. On a 120 Hz display, the second run misses every other refresh, yet the summary puts both runs entirely in the first bucket.

   **Replace the bullet with:**

   > **A frame measure keeps every raw interval.** Establish the display’s refresh interval and report buckets around its multiples, stating the boundaries used. The 20 / 34.5 / 50 ms boundaries are the recorded 60 Hz case, not defaults for every display. Repeat the run before trusting a total, and switch the suspected style off for one comparison before choosing a fix.

**Applying the drafts to recorded cases**

These are applications to repository evidence, not new browser runs.

| Real case | Drafted rule applied | Result |
|---|---|---|
| Board layout, `raptor-port/docs/handpass/2026-11-08-board-layout.md`, W-GH1 | Search every reader of a moved scroller; hold a drag just inside its new visible edge. | Requires the older sideways-board test and the hold immediately below the pinned bar. The recorded failure was scroll `300 → 300`; the earlier walk’s hold over the bar did not cover it. The draft would have added the missing case before the first push. |
| Pinned-row timing, `raptor-port/docs/handpass/2026-11-08-lw-pin-last-frame.md`, “The frame measure” | Keep raw intervals, repeat the run and switch off the suspected style. | Rejects a conclusion based only on `4 → 17` intervals over 33.4 ms. The raw counts expose `47/860 → 252/927` one-refresh skips; the switch-off run isolates the scroll-animation cost. The repeated run also overturns “a third less work”. |
| Leave War fixes, `raptor-port/docs/handpass/2026-10-31-lw-fixes.md`, “The gates” | A handoff’s green claim names its run and scope. | Produces two distinct claims: the whole Leave War project passed before the fix round; only touched files and the guard passed afterwards. It cannot honestly become “the final whole suite passed”. |

**A constructed case that passes the prescribed checks and is still wrong**

For the main-folder update, suppose the folder has no tracked changes, no active chat, and a detached unpublished commit. Its short branch status is `## HEAD (no branch)`: no “ahead”. Local `main` can fast-forward to fetched `origin/main`.

The draft’s observable checks pass. Switching to `main` and fast-forwarding succeeds, but the unpublished commit is left without a branch. No reset, restore, clean or non-fast-forward merge was needed. This is why finding 4 requires an attached branch and an explicit reachability check, rather than absence of “ahead”.

**The stale reader lines, checked against their rulings**

| Rewritten line | Rulings checked | Result |
|---|---|---|
| Bug-check order §4, scenario fallback: fresh Opus instead of Fable | D903, D1770 | Correct. |
| §4, Sol’s expired window | D1734, D1770 | Correct: Sol is now called only on the owner’s word. |
| §4, important-plan red team | D1760, D1770 | Correct: Astra first; Sol on his call, otherwise fresh Opus. |
| §4a point 2, high-consequence readers | D790, D1734, D1770 | Names are correct; surrounding instructions need finding 3. |
| “With the Claudex loop”, high-consequence readers | Same | Same problem. |
| Overnight step 5, code reads | D790, D903, D1770 | Correct. |
| Overnight step 7, reads owed | D761, D1770 | Correct, including Sol’s omitted read where two are required. |
| Overnight Part 2, reader beside Astra | D790, D1770 | Correct; report handling needs finding 2. |
| Overnight morning checklist, reads owed | D761, D1770 | Correct. |

**Notes**

- **D1443/D1104:** the named-work paragraph is supported. D1443 expressly says to list the jobs beside “Low or Medium?” and start without waiting. Taking the stated recommendation is a reasonable reading for that named-work path; it does not settle an unanswered product question.
- **Observation 843:** a shell peek is compatible with avoiding an unrelated automatic load. Add this sentence to prevent it being read as permission to skip required rules:  
  > This changes the tool used, not the required reading: before planning or editing in an area, open its rulings file yourself as `doc-structure.md` requires (D390, D1735).
- **Lesson moves:** the complete bodies of lesson 7 and the second lesson 23, including their terminating newline, compare byte for byte equal. Their numbers remain unchanged. The new checklist line 24 is true to the lesson. Its omitted regression-test detail remains mandatory because the checklist routes the reader to the full lesson.
- **ASK 751:** closing is supported for the named guard. I called its refusal function with both the `/c/…` and `C:/…` spellings; both were allowed. This does not establish which other check caused the historical refusal.
- **ASK 909:** closing is reasonable. All existing areas have converted, and the reusable preflight lesson is retained through observation 912. No conversion skill needs creating now.
- **Disposition samples:** the 15 REFLECTED/FILED rows listed below have the claimed homes. For 801, the guard covers the escaped-backslash case; its recorded measurement clears the bare-apostrophe case, rather than the guard refusing every multiline script.
- **Size:** against the live files in this copy, the final drafts grew by **27.3%** for walk-scripts, **49.1%** for the mock-up guide and **18.8%** for handoff. The brief’s percentages describe earlier drafts.

  Concrete cuts that retain the lessons:

  - In the mock-up guide, step 3, replace the added marking explanation with:  
    > A mark must not change the element’s position, display, size or overflow; use a child tag for a static element. Assert that marking leaves its box unchanged and keeps every tag inside all clipping ancestors.
  - In the handoff guide, replace the duplicated main-folder recipe with finding 4’s pointer. Keep the commands in one home.
  - In walk-scripts §5, replace the phone-recording paragraph with:  
    > Read his phone recordings in Edge (`channel: 'msedge'`): open a local video page, seek with `currentTime`, wait for `seeked`, and capture the video element. Save sheets of eight frames sampled every 0.25 s with the evidence.

The disposition checker passed: **160 observations, exactly once** — 126 APPLY, 12 REFLECTED, 17 FILED, one MEMORY, two ASK and two OPEN. I did not rerun the installation rehearsal or document check because this review changed nothing.

Rulings: none this session.

**Rows sampled**

- **APPLY — 43:** 722, 723, 724, 726, 731, 741, 750, 753, 758, 759, 769, 770, 776, 787, 789, 790, 820, 831, 836, 839, 841, 842, 843, 844, 845, 852, 858, 863, 871, 875, 878, 880, 883, 884, 886, 893, 896, 901, 903, 906, 911, 913, 914. These cover every drafted guide and the associated vendoring-register changes.
- **REFLECTED — 10:** 727, 736, 757, 766, 780, 799, 801, 837, 895, 902.
- **FILED — 5:** 733, 734, 745, 767, 848.
- **ASK — both:** 751, 909.

