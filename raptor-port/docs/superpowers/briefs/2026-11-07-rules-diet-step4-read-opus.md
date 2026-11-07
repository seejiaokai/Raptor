# The rules diet, step 4 part 1 — the fresh, blind Opus read (8 Nov 26)

The report of the fresh, blind Opus reader on the brief `2026-11-07-rules-diet-step4-read-brief.md`, branch
`claude/rules-diet-step-4-7b92cb` at 9710cf413 — saved whole, as it came back (D1739). Blind to Astra's read, which ran
at the same time (`2026-11-07-rules-diet-step4-read-astra.md`). What was done with each finding: the plan's step-4
section.

---

Report: the fresh, blind Opus read of the rules diet's step 4 (branch claude/rules-diet-step-4-7b92cb, head 9710cf413). This was a read only: I changed, committed and pushed nothing. I opened no file whose name contains step4-read-opus or step4-read-astra.

## Findings, most serious first

### 1. D1736 was archived while it was still in use — MEDIUM
- **Where:** DECISIONS-ARCHIVE.md, D1736's row ("SPENT 7 Nov 26 — the plan's steps 1 and 2 landed"). The page also has no line saying the permission has ended.
- **What the row requires:** the permission to change the document check, the ruling scripts and the two hooks. The row says it is spent once steps 1 and 2 land, but those words are the agent's reading. His own word was "As recommended", answering plan §8 question 2, which asked permission for the diet as a whole.
- **What happened:** the diet kept using it after steps 1 and 2 landed. Commit b1a5e682b is titled "[RULES-DIET] step 3: the second script read's fixes (D1736)". Step 5a ("OIL first, as the trial of the whole route") is likely to need more script fixes. The page (lines 62–63) still says "the checks and scripts" keep the one fresh Opus reader, which suggests more script changes are expected. Yet nothing that loads now says such a change needs his word again.
- **Fix:** keep D1736 live until the diet ends, or archive it and add a line to the page saying any further change to the document check, the ruling scripts or the two hooks needs his word first.

### 2. D785 lost its instruction to readers and walkers — MEDIUM
- **Where:** how-we-work.md line 338, "A scheduler is always an admin [D785]".
- **What the row requires:** also that the app is not built for a scheduler who is not an admin, and that no check, walker or brief tests one. A finding of that shape is not a finding.
- **What the line says:** only the fact, not the instruction.
- **Fix:** add "…so nothing is built, walked or reported for a non-admin scheduler".

### 3. The standing "no outside skill is installed whole" is now only a past-tense list — MEDIUM
- **Where:** line 243–245, "The outside skills he has sent — … — were not installed whole: their practices are fused into our own guides [D486, D491, D812]".
- **What the rows require:** D812 makes it a standing rule. The list also leaves out the 13 Oct outside writing guides and the humanizer tool. With D832 archived, D832's standing "nothing outside is installed" is carried by no live line.
- **Also:** "are fused" says the work is done, but [SKILL-FUSION] and [WORD-LIST] are still open in OUTSTANDING.md.
- **Fix:** state it as a rule for the future — an outside skill he sends is read at its source and fused into our guides, never installed whole without his word [D486, D491, D812, D835]. Say the fusion is still in progress.

### 4. Old descriptions of the one-line shape were not updated — MEDIUM
- **Where:**
  - raptor-port/docs/doc-budget.md about line 102: "since D390 every live full row has exactly one short line…".
  - The same file about line 171: "An area file holds one short line per ruling…".
  - OUTSTANDING.md about line 1630 also states one short line per ruling (D390).
- **What the rows require:** D1735's row names "the documents that state D136 and D390 — the rulings map's head, the rules on where facts live and on recording" to change in steps 1 and 4, and D201 asks for the same. record-decisions.md sends readers to doc-budget.md §5 for "Keeping the list whole", and that section still describes only the old shape.
- **Fix:** add the page shape for converted areas to doc-budget.md §5 and §4 (a statement with its rulings cited after it, the gate checking it), and correct the backlog line.

### 5. D625's reader was changed without saying so — LOW
- **Where:** line 248–249, "…merged… read as a guide change is…".
- **What the row requires:** a read by Astra and Sol 6.1 (via D70).
- **What the line says:** a read like any guide change. That quietly applies D1734 without citing it, and without naming the clash as D90 asks.
- **Also:** the [IMPECCABLE-UPDATE] backlog item still says Astra and Sol read it, and its waiting condition is already met (the calendar job is live).
- **Fix:** cite D1734 on the line, and align the backlog item.

### 6. D1750 depends on a "merge lock" that nothing loaded defines — LOW
- **Where:** lines 54–57, "…through the merge lock…".
- **What the row requires:** the lock is D1746's, which is only on the unmerged branch claude/merge-one-at-a-time. Only HANDOFF.md explains it.
- **Also dropped:** the row's reading (4), that the morning report says what merged and that the live app was confirmed.
- **Fix:** add "(D1746, on its own branch until it merges — steps in HANDOFF.md)" and the morning-report clause.

### 7. Whether Sol 6.1 is called for diet steps is left unresolved — LOW
- **Where:** line 60, "Sol 6.1 is not called" (D1738/D1739), against line 82, "until Mon 9 Nov 26 19:00 Sol 6.1 is called too where a second reader fits" (D1743, the later ruling).
- **The problem:** the page never says which one wins for a diet step inside that window. The Sol clause also sits oddly in the bullet about the reads-owed list.
- **Fix:** say plainly which one wins for diet steps before Monday 19:00. As written, D1743 is later, so it is D1743, unless the rows say otherwise.

### 8. Smaller things dropped or bent — each LOW
- **D1732:** "to see which is better" (comparing the two blind reads) is not on the page.
- **D1572 (line 282–283):** stated as still to do, but [WALK-SCRIPT-DOCTOR-ERRORS] was built on 2 Nov 26 and archived.
- **D1124 "(1–4 live)" (line 213):** round 4 went to him on 5 Nov 26 and its questions are still open in [UI-CONSISTENCY-LOOK].
- **D822:** "record files merge without clashing" ([MERGE-ONCE-RECORDS], open) is stated nowhere.
- **D1742 reading (2):** "if his look brings a change, the fix and its records are pushed together and his look asked again" is missing from shipping.md. This gap is older than step 4.
- **D228:** "each chat on its own ports" is stated nowhere that loads, now that D86 is archived.
- **D1532 / D1749:** "only made-up demo data goes to his test account" is dropped.
- **D971:** "a ruling the later one only narrows stays" is only in DECISIONS.md step 2, not on the page or in doc-structure.md.
- **record-decisions.md:** "the three steps are at the head of DECISIONS.md" does not mention the steps for a converted area. AGENTS.md was updated; this file was not.
- **Compressions that lose a condition:**
  - D1537: the engine's checks are switched off, protected by the original's 728 tests.
  - D1531/D1533: usage tracking off.
  - D1495: "never instead of them".
  - D1222: a whole screen only when the question is about the whole screen.
  - D884: the guard lets idle compaction through, and nothing in his settings changes.
  - D872: the state is saved at every commit.
  - D868: "about 80%" became "from the first note", which is about 75%.
  - D820: schedulers use a phone only occasionally, for minor changes.
  - D808: a warning a person needs is never removed.
  - D350: "in this build", and the greyed button's reason.
  - D1717: each night's jobs still start on his word.
  - D490: a fault that harms people now is fixed at once.
  - D1557: on top of the change's own scenarios.
  - D607: what the walk record is for.
  - D70: the cap of about three rounds.
  - D941: reading (1).
  - D1551: "or one is designed", and "if unsure, say so".
  - D1297: closing reports name the lessons, and he may strike any.

## What I confirm
- **Rulings checked against their full rows:** about 218 — every ruling in the old file (216 rows at 6e6c55667) plus D1745, D1749 and D1750. I read in full every row dated 7 Nov 26, every row whose old short line carried "— changed by", and every archived row.
- **Archivals confirmed as right:** D86, D602, D972, D973 ([CAPS-SWEEP] archived), D974, D1556, D1566, D1659, D775 (both tidy-ups archived), and chat 1's D1748. D832 is right, with the caveat in finding 3. **D1736 is doubtful** (finding 1).
- **D136 kept live beside D1735 is correct:** D1735's row says it narrows D136, not that it replaces it.
- **Text with no number is kept:** the old head's meaning, the D25 pointer (line 17), the screen-design pointer (lines 188–192), and "each area loads by itself" (in doc-structure.md).
- **The five files:** only citations were added. Dropping "replacing D1594 / D368 / D1088" is correct, since those rulings are archived. The D1737 notes in shipping.md match the row. The rewritten Claudex line in doc-structure.md keeps its meaning.
- **Pointers:** AGENTS.md item 5 and the recording bullet, raptor-port/CLAUDE.md's map row, DECISIONS.md's head and map, and the docsize tripwire (36000) all match the page shape.
- **Main's additions are stated correctly:** D1745, D1749 and the new D1571 wording.

## Not counted, as the brief says
Problems that live only in stored data (D56), the page's length or style, and the five files not yet being checklists.
