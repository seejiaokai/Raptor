# What a Leave War job loads at its start — Astra's blind read (10 Nov 26, chat 56)

*(Saved word for word from his final message — `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`; brief `2026-11-10-lw-start-load-read-brief.md`, on `93531181d`. Blind to the fresh Opus reader. What the host did with it, each finding reproduced first: (2) D328, D306 and D304 named on the Leave War page's People lines, with D321's "an admin may still add leave or OIL on a deleted man's past days"; (3) D308 and D284 cited beside their clauses, D307 dropped, D327 given its own clause (the document check requires it beside D321); (5) the check takes every script under the tests' folder whatever its ending, and owes nothing when a page has no `paths:`; the self-test case widened.)*

Found **two substantive gaps and two smaller defects**. The document check passes, but it does not catch all four. I reviewed the requested change; the nine changed files still match that version. I changed no files.

1. **Scheduler rules remaining reachable — no finding.**

   I found no scheduler ruling needed by the described Leave War job that becomes unreachable. The Leave War page’s cross-area pointers, OIL and design pages, seam, executor and required guides retain the relevant instructions.

   That includes the shared calendar, keyboard and window behaviour, history entries, manning and availability, and shared schedule effects. I found no unique instruction about writing or running browser tests stranded on the scheduler page.

2. **People rules remaining reachable — P2: three grid rules are missing.**

   The replacement pointers at [leave-war.md:302](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/.claude/rules/decisions/leave-war.md:302) omit these rules from the People page:

   | Missing ruling | What a grid-only job could get wrong |
   |---|---|
   | **D328** | Allow changes to an earlier stint’s posting dates or offer Undo on its Post-in sheet. Earlier stints are read-only; current-stint dates remain editable. |
   | **D306** | Present a posting-out confirmation without explaining that the whole action waits if it would leave no admin able to sign in. |
   | **D304** | Use the demonstration date instead of the real calendar date when testing or displaying the consequences of deletion. |

   Their full rows are at [people-accounts.md:36](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/.claude/decisions-full/people-accounts.md:36), lines 48 and 49. None is stated or cited on the remaining Leave War pointers. D320’s older wording about editing the stint a date falls in particularly needs D328’s later restriction.

   **Cause:** removing the two grid paths removes the page carrying these qualifications. **Fix:** add accurate, concise pointers for all three to the Leave War page.

3. **Pointer fidelity — P3: the new People line has mismatched citations.**

   At [leave-war.md:303](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/.claude/rules/decisions/leave-war.md:303):

   - Access starting before the post-in date comes from **D308**, absent from this line’s citations.
   - The exception to “fresh on return” comes from **D284**, also absent from this line’s citations.
   - **D307**, which is cited, requires the Quals/CAT reminder when enabling *any* suspended man. The line does not describe that rule.
   - **D327**, also cited, concerns archived people in the historical ALL AVAIL crowd. The line does not describe that rule either.

   D308 and D284 are reachable through the preceding line, so this is a citation defect rather than another lost rule. Nevertheless, following the new line’s citations does not reliably substantiate its words.

   **Fix:** cite D308 and D284 beside the clauses they support; remove D307 and D327 from this line or give them accurate clauses.

   I found no separate scope error in the D993 pointer. Both “no longer loads” statements are true for the current paths.

4. **General page and full rows — no finding.**

   The revised D1960 line reflects work subsequently authorised by D1973; it does not remove the requirement to preserve access to necessary rules.

   D1973’s row distinguishes the owner’s delegation from the agent’s chosen cuts and preserves the review and merge requirements.

   D1972 is recorded as a temporary call under D903’s exception. Its full row explicitly labels the agent’s interpretation of “orchestrator,” its scope and end date. Read together, the standing Opus instructions and the adjacent temporary exception do not give conflicting instructions for this week. I would not present the interpreted end date or build scope as the owner’s literal words.

5. **New check — P2: an accepted browser-test filename escapes it.**

   [docsize-rulings.mjs:283](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/raptor-port/scripts/docsize-rulings.mjs:283) checks only filenames ending in `.ts`.

   I reproduced this result without creating a file:

   ```text
   raptor-port/e2e/geometry.spec.tsx
   Current Playwright project pattern matches: yes
   Scheduler page matches: no
   Leave War page matches: no
   testPageProblems reports: nothing
   ```

   The project’s pattern at [playwright.config.ts:69](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/raptor-port/playwright.config.ts:69) is unanchored, and the existing document-check helper already recognises `.spec.tsx` tests. Renaming this test to `.tsx` can therefore bypass the new protection.

   **Fix:** include `.tsx` files while retaining helper coverage, and add a regression case.

   **P3: an unscoped page is treated as absent.** At line 282, both a missing page and an existing page without `paths:` become an empty pattern list. The latter loads in every chat, yet the check reports that its tests load neither page. **Fix:** distinguish missing pages from existing, always-loaded pages.

   Other results:

   | Case | Result |
   |---|---|
   | Unlisted root or nested `.ts` test/helper | Correctly rejected |
   | Root filename matching `*leavewar*` | Correctly accepted |
   | Nested `sub/leavewar.spec.ts` | Correctly rejected: the current glob does not cross folders |
   | Missing page | Files relying on it are rejected |
   | Backslash-separated file list | Silently skipped; the current caller supplies Git’s forward-slash paths, so this is not a current integration failure |

   There are **49 current files: 42 explicitly retained and seven Leave War tests excluded**. The old glob additionally reaches those seven; no other current file was lost. It also covered future subfolders and other extensions automatically.

   The comments are valid YAML comment placement and are accepted by both repository parsers. I did not run an independent YAML parser.

   The added self-test correctly tests one uncovered `.ts` file, and its exact case passed in memory. It does not cover the defects above. I did not run the complete self-test because it creates temporary files, contrary to this brief.

6. **Other breakage and reproduction — no additional finding.**

   The Markdown and script-comment search found no further newly false operative instruction. Historical measurements and earlier planning descriptions are not additional findings.

   **`npm.cmd run docsize` passed.** The command reported existing handoff warnings, with no document-check failure.

   Both requested files load the six always-loaded rule files: plain language, recording decisions, bug checking, shipping, document structure and general rulings. Their additional matched rule files are:

   | Opened file | Additional rules loaded |
   |---|---|
   | `Matrix.tsx` | Design, Leave War, OIL, executor, Leave War seam, UI design |
   | `e2e/leavewar.spec.ts` | Design, Leave War, OIL, executor, Leave War seam |

   The project guide also applies through its directory hierarchy. Neither file matches the scheduler or People page.

Rulings: none this session; read-only review.

**Verdict: fix the missing People pointers and the `.tsx` check bypass before accepting; correct the citation and unscoped-page defects alongside them.**