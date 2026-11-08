# Rulings D1760–D1762 — Astra's blind read (8 Nov 26)

The report of Astra (D1761, D1743) on the brief `2026-11-08-readers-rulings-read-brief.md`, commit 6400f5044 — saved whole,
as it came back. Blind to the fresh Opus reader, who ran at the same time (`2026-11-08-readers-rulings-read-opus.md`).
What was done with each finding: chat 2's `HANDOFF.md` block and the closing commit.

---

1. **High — older instructions still require the wrong guide readers.**  
   **Lines:** `.claude/skills/TASK-OBSERVER-VENDORED.md`, “Who reads the drafts”; `.claude/skills/IMPECCABLE-VENDORED.md`, “Astra and Sol 6.1 read the change”; `raptor-port/docs/design-practices.md`, “Changing this guide”.  
   **Required:** D1761 calls Astra for working-guide changes, with the fresh, blind Opus reader beside it under the explicitly recorded interpretation; Sol remains on his call. D201 requires the older instructions to be corrected in the same change.  
   **Actual:** these active instructions still require Astra and Sol. Following them could omit the fresh Opus read or call Sol without the required authority after the temporary allowance ends. The full rows for D70, D590, D601 and D625 also lack the new qualification.  
   **Fix:** update these instructions and qualify the affected full rows with D1761, preserving the one-round limit, independence, approval requirement and design-lessons exception.

2. **Medium — retiring D1750 removes its loaded merge-lock instruction before its replacement arrives.**  
   **Line:** `.claude/rules/decisions/how-we-work.md`, “His ‘auto merge live’ for a night or a run”.  
   **Required:** D1750 requires merging through the merge lock; `DECISIONS.md` step 2 requires continuing conditions to be carried by live rulings before retirement.  
   **Actual:** the replacement states D1093’s permission and green-check requirement, but not the lock. D1746 has no full row in this checkout, and the handoff explicitly says its branch and shipping instruction are still pending. The remaining lock instructions concern another chat’s particular merge.  
   **Fix:** bring in D1746’s live row and general shipping instruction before removing the loaded merge-lock clause.

**What checked out:** D1760 faithfully records “1 yes”; D1762 faithfully records “4 later”. Reading “call in Astra” as applying to working-guide changes generally is fair in the context of question 3. D1761’s full row clearly labels the additional interpretations. The design-lessons exception remains stated. D1093’s replacement wording preserves its scope. D1750’s original text is preserved whole in the archive, apart from the added spent marker. Answer 2 was left outside this review.

**Checks and coverage:** reviewed the complete specified change, checked the governing full rows, and searched by subject for conflicting instructions. Read whole: the brief, `AGENTS.md`, `HANDOFF.md`, the five always-loaded rule files, the general rulings page, `raptor-port/CLAUDE.md`, the Codex guide and the bug-check checklist. Read the relevant sections and rows of the longer guides, plan, backlog and archives. Apart from the findings above, I found no further lost safeguard or unsupported addition in the changed wording.

Neither prohibited reader report was opened or searched. Document review only; no app tests, file changes, commits or pushes.

Rulings: none this session.