# Rulings D1760–D1762 — the fresh, blind Opus read (8 Nov 26)

The report of the fresh, blind Opus reader on the brief `2026-11-08-readers-rulings-read-brief.md`, commit 6400f5044 —
saved whole, as it came back. Blind to Astra's read, which ran at the same time (`2026-11-08-readers-rulings-read-astra.md`).
What was done with each finding: chat 2's `HANDOFF.md` block and the closing commit.

---

## Blind read of rulings D1760–D1762 and the guide lines they changed (commit 6400f5044)

**Verdict:** the three new rulings mostly say what his answers meant, and D1750 was retired correctly. Nine findings, none high. The serious ones are guides that still say "Astra and Sol 6.1" for a guide change, and one clash between two rules on the general page that nobody has named.

### Findings, most serious first

**1. MEDIUM — the sweep for older wording (D201) missed four guides that still say Sol 6.1 reads a guide change.**
- **The Impeccable update steps:** `.claude/skills/IMPECCABLE-VENDORED.md`, the steps ending "Astra and Sol 6.1 read the change before he approves it (D70)". The backlog item `[IMPECCABLE-UPDATE]` repeats it ("Astra's and Sol 6.1's reads (D70)").
  - This commit rewrote the Impeccable line on the page to "read as a guide change is — by Astra, beside a fresh, blind Opus reader". That line sends a chat to "its vendoring note's steps", and those steps say the opposite.
- **The design guide:** `raptor-port/docs/design-practices.md`, under "Changing this guide": "by Astra and Sol 6.1 (D70, D590)".
- **The skill-notes review:** `.claude/skills/TASK-OBSERVER-VENDORED.md`, "Who reads the drafts (owner, D70)". It ends at Astra and Sol 6.1 (D590) plus the one-off D810/D1414 notes. A skill-notes review follows this file.
- **AGENTS.md, first paragraph:** "Astra first, Sol 6.1 second where two are required". It says nothing about "on his call" or the fresh Opus reader.
- **What the rulings require:** D1734 calls Sol 6.1 only when he calls for him. D1761 calls Astra, and the row's reading puts a fresh, blind Opus reader beside Astra.
- **Consequence:** a chat following any of these calls Sol 6.1 without his call (from Mon 9 Nov 19:00, when D1743's window ends) and leaves out the fresh Opus reader.
- **Fix:** add a one-line pointer to each ("since D1734 and D1761: Astra, beside a fresh, blind Opus reader; Sol 6.1 only on his call"), and add them to D1761's list of where it lives. If editing a skill file needs his word, file them in the backlog under D201.

**2. MEDIUM — an unnamed clash between D1761 and D1739's "rewords nothing" line.**
- **The two lines:** the page's line "What rewords nothing in the diet — text moved whole, the checks and scripts — keeps the one fresh Opus reader [D1739]", against the new line "by Astra, his call for every such change".
- **Why they clash:** a diet step that moves text whole out of a working guide is a working-guide change. Step 4 did this to the five rule files, and this branch's own handoff calls its edits to rule files "guide changes". The two lines now name different readers for that step.
- **The rule:** D90 and D201 say every clash is named and the later ruling wins.
- **Fix:** say on the D1761 line and in its row which way it goes. Either (a) moved-whole text keeps the one fresh Opus reader, as D1739's reading — mark that as the agent's reading and tell him; or (b) D1761 widens it, so Astra reads that too.

**3. MEDIUM — the models line in `raptor-port/CLAUDE.md` drops the second reader of a guide change.**
- **The line says:** "save a changed guide — Astra every time (D1761); otherwise a fresh, blind Opus reader". That reads as Astra *instead of* the fresh Opus reader.
- **What the rulings require:** D70 requires two readers. D1761's row keeps the fresh Opus reader beside Astra, and the page, `bug-check.md`, the bug-check order, the Codex guide and the full guide all say "beside".
- **Also lost from the old line:** which work gets two readers when he does call them (earned leave, published records, permissions, saved data, an important plan).
- **Fix:** write "save a changed guide — Astra every time, beside a fresh, blind Opus reader (D1761)".

**4. LOW — two lines of the page now disagree on whether Sol 6.1's skipped read of a guide change is "owed".**
- **The two lines:** the Astra-and-Sol line says "a job that would otherwise have had one goes on the reads-owed list". Under D590, a guide change would otherwise have had Sol 6.1. The D1761 line dropped the old "puts the reads it went without on the reads-owed list" clause and D761.
- **The row:** D1761's row says it replaces "the reads owed listed". It does not mark dropping Sol's owed read as the agent's reading.
- **Fix:** add one clause, such as "Sol 6.1's read is not owed while the fresh Opus reader holds the second seat (the agent's reading, as for the rules diet)". Put the same in the row's readings told to him.

**5. LOW — the second-seat wording in `bug-check.md` and the Codex guide.**
- **`bug-check.md` ("Who they are now"):** after "D1761 for every working-guide change (beside a fresh, blind Opus reader)", the next sentence says "When he calls them … Sol 6.1 is the second reader where two are required". That can be read as Sol taking a guide change's second seat.
- **`raptor-port/docs/codex-guide.md`:** the opening paragraph still lists "a changed working guide" among Sol 6.1's second-reader jobs, before the "save a changed working guide…" clause.
- **The exception missing from short forms:** neither these nor the CLAUDE.md line mentions his design-lessons exception (D941, D1417). A chat might send each design-lesson line to Astra, against "one fresh reader".
- **Fix:** take "a changed working guide" out of the Codex guide's Sol list, and add "(the fresh Opus reader the second; his design-lesson lines excepted)" where these short forms say "every".

**6. LOW — the new D1093 bullet repeats something the page says it does not repeat.**
- **The bullet** (on the page, §Records, "His "auto merge live" for a night or a run…") matches D1093's full row.
- **The page's opening note** says shipping rules are stated in `shipping.md` and "not repeated here". `shipping.md` already states D1093 ("His "auto merge live" for a run covers all it produces…").
- **The document check does not need the bullet:** it treats a general ruling stated in an always-loaded rules file as stated, and accepts a citation in round brackets.
- **So** it adds a new double statement of the kind D1762 just put off.
- **Fix:** drop the bullet, since `shipping.md` carries D1093. Or keep it and correct the page's opening note.

**7. LOW — D1734's later changes are not marked in the full rows of D70 and D590.**
- **The full row of D70:** the last of its "narrowed" notes still says "Every other guide change is as below", which means two readers, Astra and Sol 6.1 per D590.
- **Why it matters:** a chat opening the row before acting on its detail finds no pointer to D1734 or D1761.
- **Fix:** add "— NARROWED 8 Nov 26 BY D1761: a guide change is read by Astra, beside a fresh, blind Opus reader; Sol 6.1 only on his call" to the full rows of D70 and D590. The document check will then want D1761 cited on the other lines that cite D70.

**8. LOW — a stale "both" in the bug-check order, the test-plan bullet.**
- **The line** (in `raptor-port/docs/bug-check-order.md`, the bullet that begins "A plan's brief lists the builder's own readings as targets…"): "sent to as many readers as the plan's red team needs (D353: both for an important plan, one otherwise)".
- **What D1760 requires:** since D1734 and D1760, "both" holds only when he calls them. Otherwise the plan gets one fresh, blind Opus reader.
- **Fix:** add "— when he calls them; otherwise the one fresh Opus reader (D1760)".

**9. LOW — citations added only because the document check requires them.**
- **What happened:** D1761 is now cited on the scenario-design line, the risky-code-read line and `doc-structure.md`'s Claudex line, which it does not change. The check makes every line that cites D1734 also cite what narrows it.
- **Fix:** no wording fix needed. Note only that these citations do not mean D1761 changes those lines.

### The four questions

**1. Does each new ruling say what his answer meant?**
- **D1760 ("1 yes"):** exact. The rest of the row restates existing rules.
- **D1762 ("4 later"):** exact.
- **D1761 ("3 call in Astra"):** reading it as every working-guide change is fair. The question asked what happens to a guide change read without Astra and Sol 6.1, so his answer replaces that general rule.
  - The extra parts are marked as the agent's readings in the row: the fresh Opus reader beside Astra, Sol 6.1 only on his call, a change waiting if Astra cannot run, and the design-lessons exception.
  - **Unmarked:** that his call stands past Mon 9 Nov 19:00. His Pro limits (D1734) then apply, and with "the change waits", a guide change could stall. It would be worth one line in the next report to him.
  - **On the page:** the "if Astra cannot run … waits" clause is not marked as a reading.
- **Answer 2:** out of scope, his to decide. I only noticed that the D1761 line does not say how D1743's window applies to Sol 6.1.

**2. Does any changed line contradict a live ruling or another guide?** Findings 1–3, 5 and 8. I found no direct contradiction among the page's own lines, except findings 2 and 4.

**3. D1750 spent:**
- **Every condition is carried.** "Once both reads' findings are fixed", "through the merge lock" and "a part whose Astra read cannot run is parked" applied to that run only, and the run has ended.
- **The rest:**
  - "Step 5a and later wait for his word again" → D1737, still on the page.
  - "The morning report still comes" → it did. D1742 and `shipping.md` keep the live-app check.
  - "Continues and compacts by itself" → D596, D667, D766 and D872, all on the page.
- **The retirement itself:** the spent mark sits in the right place, the map moved the ruling to the archive, and no live line cites D1750. The merge lock (D1746) is carried in the handoff note.
- **The D1093 bullet** states D1093's full row correctly (see finding 6 for where it sits).

**4. Lost safeguards or added bulk?** The "both" lost in CLAUDE.md (finding 3), the owed-read clause dropped (finding 4) and the doubled D1093 (finding 6). Nothing else.

### What I checked
- The whole change, `git diff 4fbf85a49 6400f5044`, word by word.
- The full rows of D1760, D1761, D1762, D1734 (its new mark), D1750 (in the archive), D70, D590, D761, D790, D1739, D1743, D1093, D1407, D811 and D1736.
- The document check's rules for pages, to confirm findings 6 and 9.
- Searches by subject ("important plan", "red team", "working guide", "guide change", "Astra", "Sol 6.1", "D70") across the page, the five always-loaded rule files, AGENTS.md, the bug-check order and its checklist, the Codex guide, the project guide and its full text, `raptor-port/docs/*.md`, the skills and their vendoring notes, the start hook's short form, and the backlog.
- I opened nothing named `readers-rulings-read-opus` or `readers-rulings-read-astra`, and did not look in the other reader's scratch folder.

### Whole, no finding
- **The rows and records:** the new full rows of D1760 and D1762; the D1734 mark; D1750's spent mark and its archived row; the `DECISIONS.md` map.
- **The notes:** chat 2's `HANDOFF.md` block; the `[RULES-DIET]` backlog item; the rules-diet plan's step-4 record.
- **The guides:** `raptor-port/docs/guide-full.md` §Models (the new bullet); the bug-check order's §4 "Who reads the finished code now" sentence; the Codex guide's "a skill" bullet; the bug-check checklist; `shipping.md`, `record-decisions.md`, `plain-language.md` and `doc-structure.md` (a citation only).
- **On the page:** the plan line (D1760) and the D1762 line.

I changed no file and committed nothing.
