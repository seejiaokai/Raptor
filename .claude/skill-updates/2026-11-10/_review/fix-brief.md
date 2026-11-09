# The fixer's brief — both readers' findings on the skill-notes review drafts (chat 49, 10 Nov 26)

You fix the review's drafts after two blind reads. Both read commit 0669d87a1 and returned REVISE:
- `_review/read-astra.md` — Astra, 9 findings (A1–A9) plus notes with cuts;
- `_review/read-opus.md` — a fresh Opus reader, 12 findings (O1–O12) plus notes.
Read both whole first. Their replacement texts are the source; take them word for word unless the decision below says
otherwise. All paths are under `.claude/skill-updates/2026-11-10/` (the holding folder) unless they start at the repo
root. You edit ONLY drafts there and the `_review` / `_docs` files named here. Never a live file, never `HANDOFF.md`, the
log, a hook or a setting. No commit, no push, no `git checkout`, `switch`, `stash`, `restore` or detach in this checkout:
read older text with `git show <commit>:<path>` (set `MSYS_NO_PATHCONV=1` first in Git Bash). Write edit scripts with the
Write tool into `C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\88ec7af9-2ace-4c87-a5c0-a0bbf713885c\scratchpad\fix\`
and run them by path; in scripts use `s.replace(a, () => b)`, keep each file's line endings (read and write with
`newline` untouched — the drafts are LF), and assert every anchor is found exactly once before writing.

Two readers often found the same fault with different fixes; the coordinator has settled each (the receiving-code-review
draft's "A Finding, Its Diagnosis, and Its Fix"). Do what the decision says.

## The decisions, finding by finding

1. **The drawing check's alternative (A1, O3; note 875).** **Take Astra's A1**, both replacements (§7.0 and the walk-scripts
   §10 bullet). Reason: it keeps the method he approved word for word (D1494, D1495) and adds the measuring-function reuse
   as a help, so nothing narrows his approved wording and no question goes to him. O3 is set aside. Update row 875's
   last column in `_review/dispositions-B-design.md` (or whichever group table holds 875) to say so.
2. **A helper's report saved at once vs. reader blindness (A2, O4; overnight Part 2).** **Take O4's addition** (keeps the
   existing sentence, adds the exception) and add Astra's first two sentences in front of the existing sentence: "A helper
   returns its report as its final reply. Save it at once." — the result must say: returned as the final reply; saved at
   once; a reader's report while another reader of the same job still reads waits in a scratch folder outside the
   checkout and enters the repo once every reader has reported (the bug-check order §4). Note 915 (new tonight, OPEN) is
   the source of the "final reply" lesson; the "(10 Nov 26)" line the Opus reader found unsourced may cite it as "note 915".
3. **The Claudex passages (A3; bug-check order §4a and "With the Claudex loop").** **Take A3**, both replacements, in every
   place the order still says "the provider that built never inspects" or gives the inspector "the finished code AND the
   evidence sheet". Search the whole draft for both phrasings.
4. **The main-checkout recipe (A4, O2; gates guide and handoff guide).** **Combine:** take Astra's A4 gates-guide text
   with two changes — (a) DROP the condition "confirm `branch --show-current` names a branch" and the words "A detached
   checkout," from its stop list: every chat's release step leaves that folder detached, so the condition would stop
   nearly every update; (b) in its place use the Opus reader's reachability check, which covers a detached folder:
   "confirm `log HEAD --not --remotes=origin --oneline` prints nothing (no commit there that is not on GitHub — a detached
   folder's included)". Keep Astra's full path on every command, "Never reset, restore or clean the folder", and "Verify
   the loaded settings and skills in a new chat". In the handoff guide, **take A4's pointer** in place of the duplicated
   recipe (also the Opus reader's and Astra's size cut).
5. **The opening line's own-folder clause (O1, A5; handoff guide Step 1).** **Take O1's replacement** word for word (it
   keeps Astra's point: one write first, refused → stop and tell him; and it fixes the untracked-pictures and detached-branch
   faults Astra did not name).
6. **The FULL check's two chats (O8, A6; bug-check order §0a step 3 and checklist step 3).** **Take O8's two replacements,
   and append to the order's text** Astra's unattended clause: "Unattended, the night stays one chat: name the clean point
   and compact there instead (D667, D867)." Reason: no fixed 40% (both readers), the measure named (O8), and an overnight
   run is never split (A6). With the fixed threshold gone, question 893 for him is dropped: update row 893 to APPLY with
   the readers' change named.
7. **Merge live in another chat's text (O5; handoff Step 4, note 877).** Take O5.
8. **The type check between fix rounds (O6; bug-check order §5, note 743).** Take O6 (`npx tsc -b` — checked: the build
   script is `tsc -b && vite build`, and both configs set `noEmit`).
9. **The peek clause (O7; doc-budget §3, note 843).** Take O7. Astra's note sentence ("This changes the tool used, not the
   required reading…") is covered by O7's ending; do not add both.
10. **[CHECK-TOOLS-HARDEN] letters (O9).** Take O9: in `_docs/OUTSTANDING-items.md` renumber the review's parts (c)–(q) to
    (d)–(r); the anchor text "after the chat-48 paragraph's (c)" — the live paragraph starts "**Added 10 Nov 26 (chat 48,
    from chat 19's handoff block):**" (`OUTSTANDING.md` line ~1996); change every citation in the drafts and in the group
    tables' rows (O9 lists the rows; search for `[CHECK-TOOLS-HARDEN] (` across the holding folder and fix each letter by
    the +1 shift — check each by its subject, not only its letter).
11. **Note 911's preventive half (O10).** Take O10: the line in `.claude/skills/dispatching-parallel-agents/SKILL.md` and the
    same in the superpowers register's dispatching row; update row 911.
12. **Checklist lesson line 24 (O11).** Take O11.
13. **Walk-scripts §8, the "before" build (A7, note 750).** Take A7.
14. **Walk-scripts §5, deleting failed attempts (A8, note 896).** Take A8.
15. **Walk-scripts §5, frame buckets (A9, note 884).** Take A9.
16. **The EXPECTED-line rule (the Opus reader's run (3), note 897).** Add to that rule, as a source an EXPECTED line may
    cite, "two surfaces of the app that must agree (the mark and the changes list)" — so "the two agree" checks stay
    PASS/FAIL, not RECORD. Keep it to one clause.
17. **The D1443 paragraph (O12's cut, and the Opus note).** Take O12's shortened paragraph, with "the recommended Low or
    Medium taken" marked as the agent's reading: "(the agent's reading)".
18. **Size cuts — take all of these** (O12 and Astra's notes): the bug-check order §4 proof-tests bullet (863) → O12's
    pointer; the §4 export recipe (838) → moved whole to `raptor-port/docs/codex-guide.md` (make that draft: copy the live
    file from the repo root into the holding folder at the same path, LF, then add the recipe under a short heading on
    reading a commit that is not the branch head), leaving the rule and a pointer in §4; the mock-up guide's "A question
    about FEEL" frame-by-frame half → walk-scripts §5, one line left (O12); "Reusing an older drawing" parenthetical cut
    (O12); the mock-up guide step 3 marking explanation → Astra's two sentences; walk-scripts §5 phone-recording paragraph
    → Astra's replacement. A move keeps its words; only a cut rewrites.
19. **Everything else in the notes** (no concrete failure): leave as it is.

## Then
- Run `node .claude/skill-updates/2026-11-10/_install/check-dispositions.mjs --merge` from the repo root: it must pass
  with 160 rows; give the new counts (APPLY should rise by one — 893 — and ASK fall to 2 or stay, as the rows say).
- Run `node C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/88ec7af9-2ace-4c87-a5c0-a0bbf713885c/scratchpad/makediff.mjs C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/88ec7af9-2ace-4c87-a5c0-a0bbf713885c/scratchpad/fix/tmp.txt`
  — it rewrites `_review/diff.patch` (now with codex-guide.md).
- Measure each changed draft's size against the live file at the base (`_review/base-commit.txt`) and give the
  percentages, before and after your cuts.
- Do NOT run the rehearsal (`install.mjs --rehearse`): the coordinator runs it after committing.

## Your final reply (your only report — do not write it to a file)
1. A table: finding (A1…A9, O1…O12, and items 16–18) → what you did → file and section → done / not done and why.
2. Anything you could not place exactly, or any anchor that was not found once.
3. The dispositions counts, the sizes, and the list of files you changed.
4. Your own doubts, least sure first.
