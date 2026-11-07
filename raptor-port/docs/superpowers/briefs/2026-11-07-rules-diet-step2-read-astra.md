# The rules diet's step-2 short texts — Astra's blind read (7 Nov 26)

Read at commit `6703fda1f` of `claude/rules-diet-step2` from the brief `2026-11-07-rules-diet-step2-read-brief.md`, by Astra (Codex CLI, `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`) on his PC — his call for every reworded step of the diet (D1739). It was given a copy of that commit's documents outside the repo (`git archive`), so the fresh Opus reader's report was out of its reach: blind to it. Saved as it came back, before anything was done about it.

---

A — no meaning change.

The proposed note still makes the agent classify each message before acting, names the kinds of ruling, requires recording first, distinguishes recording from doing the work, and retains the closing `Rulings:` line. Every substantive instruction removed from the note is carried where the table says: `record-decisions.md` lines 13–25 and 35–59, `DECISIONS.md` lines 19–44, `doc-structure.md` lines 21–23, and `how-we-work.md` lines 6–9. This preserves D13’s purpose.

B — findings. The short form is not yet equivalent to its sources. No high finding.

1. **Medium — the start loses the general scan of existing lessons.** `.claude/skills/task-observer/SHORT-FORM.md` lines 11–16 require counting OPEN notes and applying those tagged to a skill when it loads. They omit `SKILL.md` lines 84–85: scan OPEN observations and active principles at session start. A session using no named skill can therefore repeat an already-recorded general workflow trap. Add: “At the start, scan the OPEN observations and active cross-cutting principles; keep them in mind without surfacing them unprompted.”

2. **Low — the watch list changes the evidence needed for simplification and loses explicit improvement signals.** `SHORT-FORM.md` lines 21–24 omit the full guide’s undocumented use cases and conversational naming, framing or structural suggestions (`SKILL.md` lines 129–138). “A part never used” also loses “across many sessions” from lines 140–146. An agent could overlook a useful structural suggestion or propose removing a section merely because today’s task did not use it. Add “an undocumented use case or a naming, framing or structural suggestion, including conversational feedback”; replace “a part never used” with “a part never relevant across many sessions”; retain the explicit check for unnecessary complexity that has never been needed.

3. **Medium — the prohibition on private-detail observations loses its internal-skill exception.** `SHORT-FORM.md` lines 25–26 prohibit “a note useful only with a client’s private detail.” `SKILL.md` lines 149–152 permit that observation when an internal skill is the right home. The short form would discard a reusable internal workflow precisely because its usefulness depends on private context. Replace that clause with: “a note needing proprietary client information to be useful in an open-source skill, unless an internal skill is the right home.”

4. **Low — numbering and recovery lose their diagnostic records.** `SHORT-FORM.md` lines 31–36 and 66–67 omit three instructions: record that numbering skipped another branch’s entries; log a meta-observation when the pre-write collision check fires; and log a meta-observation when a missing entry has to be restored. These are required by `SKILL.md` lines 208–209, 224–227 and 283–289. An agent can repair the symptom while leaving the recurring collision unrecorded. Add those instructions beside the corresponding checks.

5. **Medium — merging logs can leave references pointing to the wrong observations.** `SHORT-FORM.md` lines 76–77 say to keep either side and renumber the other side’s new entries. They omit correcting cross-references (`SKILL.md` lines 227–230) and the project’s requirement to keep the reviewed side (`TASK-OBSERVER-VENDORED.md` lines 91–93). After a merge, a recurrence note can name an unrelated observation, and reviewed identifiers can change unnecessarily. Replace with: “At a merge, keep the reviewed side’s entries and re-append the other side’s new entries at the end with fresh numbers, correcting every cross-reference to the renumbered entries.”

6. **Medium — rendering a deliverable no longer triggers a flush.** `SHORT-FORM.md` lines 56–58 preserve the approximately-third-completion checkpoint, including the explicit “no observations” write, but reduce the other checkpoint to handing over a deliverable or finishing a batch. `SKILL.md` lines 175–184 also require flushing when rendering a major deliverable. An agent repeatedly rendering and inspecting a document can now pass those concrete checkpoints without writing its pending observations. Replace “whenever you hand over a deliverable” with “whenever you present or render a major deliverable”.

7. **Low — a recurring trap’s unconditional default loses its cost condition.** `SHORT-FORM.md` lines 60–62 permit “a safe default in place of a judgement.” `SKILL.md` lines 458–466 permit that alternative where the safer way costs nothing extra. The shortened instruction can justify an expensive mandatory process that the source did not authorise. Replace the ending with: “or, where a safer way costs nothing extra, an unconditional default in place of a judgement each time.”

8. **Low — citing loses the second check against the actual counter range.** `SHORT-FORM.md` line 64 correctly requires the literal observation header, but drops the plausibility check required by `SKILL.md` lines 350–354. An anomalous number can consequently pass without the required second check. Add: “Before quoting it, compare it with the log’s highest observation number.”

9. **Low — the closing validation checks only survival and Status.** `SHORT-FORM.md` lines 66–68 omit the remaining pre-surfacing checks in `SKILL.md` lines 430–440: Issue → Improvement → Principle, a type, the relevant section for an existing skill, and no identifying information in an open-source Principle. The entry template tells the agent what to write, but does not retain the required check that it actually did so. Add those checks before “Then give him your notes”.

10. **Low — ordinary programmatic appends lose part of the write-safety check.** `SHORT-FORM.md` lines 35–36 check the new number, while lines 73–75 delegate safety only for changes beyond an append. The full guide requires a pre-write backup for programmatic mutation and a live heading-count invariant, explicitly including append (`SKILL.md` lines 270–281). A malformed append that fails to create the expected separate heading can escape a check that merely finds its number. Retain: “Before a programmatic write, keep a backup; check the observation-heading count against the live pre-write file and require exactly the expected change.”

11. **Medium — the deliberate archival change is not expressed consistently.** `SHORT-FORM.md` lines 73–76 require non-append changes to follow “Archival on Write”, then say resolved notes are archived at each review. The draft’s explanation repeats this at `2026-11-07-rules-diet-step2-short-texts.md` lines 95–98. Following the delegated section would archive older resolved entries during an ordinary status change or renumber, and retain entries resolved today during the review. Both conflict with the proposed review-only timing; the second also conflicts with the project’s same-day cleanup rule in `TASK-OBSERVER-VENDORED.md` lines 88–90 and D69’s full row.

   The intended change is clear, but it does **not** hold as written. Replace the ending with: “All non-append changes follow the full skill’s Log-write safety section. This project overrides Archival on Write’s timing: archive resolved notes only when a review ends after installation, including notes resolved that same day (D69). Keep the resolution dates and all write-safety checks.”

12. **Medium — activation leaves contradictory instructions and no explicit precedence.** `2026-11-07-rules-diet-step2-short-texts.md` lines 78–88 and 99–101 leave the skill description’s unconditional “invoke this skill first” standing, while the hook and proposed guide say the full skill is used only for listed exceptions. An agent can still follow the advertised description and load the full guide in every ordinary session, defeating the switch. The fallback instruction also needs to remain an explicit exception to “only”.

   Add to the short form and the guide’s switch-on paragraph: “For this project, this short form replaces the skill description’s instruction to invoke the full skill at every session start. If the hook cannot read the short form, follow its fallback instruction and invoke the full skill.”

The full-skill delegation for reviews, skill creation or editing, setup questions and uncovered cases is otherwise appropriate. The short form preserves immediate silent logging, OPEN as the first field, the entry format, post-write collision repair of the agent’s own entry, recurrence handling, grouped reporting, log-and-defer, the permitted occasions for acting, and closing an observation where its lesson lands.

C1 — findings. All 62 bullets cite an existing source ruling and include every ruling named in that source line’s direct “changed by” tail.

1. **Medium — one pointer reverses the SANS calculation.** `.claude/rules/decisions/inputs.md` line 120 says: “An Other under Unavailable lowering Available and the SANS calendar’s need”. D1352, at `leave-war.md` line 191, says lowering Available **raises** the SANS calendar’s “still needed”. Although this is a pointer, its wording asserts the opposite relationship and can misdirect a calculation change. Replace it with: “An Other under Unavailable lowering Available and raising the SANS calendar’s need [D1352, D1356]”.

2. **Low — D1154 is incorrectly excluded as concerning only the war’s controls.** The exclusion is in `2026-11-07-rules-diet-step2-short-texts.md` lines 114–116; the missing pointer belongs in `inputs.md` lines 89–142. D1154 explicitly governs the SANS calendar and requires the screen to explain how the Available counters affect its need. D640 and the seam text already carry the calculation relationship, so that calculation is not wholly lost; the distinct explanation requirement has no pointer here. An Inputs/SANS change can preserve the arithmetic but omit the explanation. Add: “Available counters’ selected categories, their effect on SANS need, and the screen’s explanation [D1154]”, and remove D1154 from the exclusions.

The other sampled subjects are faithful pointers rather than attempted restatements. I found no additional missing ruling for the specified Inputs, Quals, people or store work after reading all 373 Leave War short lines and the listed exclusions.

C2 — no meaning change.

The seam files retain every own-area path present in the corresponding narrowed rulings file and additionally cover the listed shared files. Their heads accurately distinguish architecture loading on both sets of paths from rulings loading on the area’s own paths. This includes `engine/qualcols.ts` for the moved catalogue bullet. This is a check of the supplied texts, not an independent byte comparison with the unavailable pre-move branch.

C3 — no meaning change.

`raptor-port/CLAUDE.md` lines 300–301 retain the identifying map text and point to the corresponding complete rows at `seams/leave-war.md` line 176 and `seams/tracker.md` line 158. Both destination headings exist.

C4 — no meaning change.

The Architecture pointers, the qual-catalogue pointer, the People & accounts seam pointer, the two project-guide architecture lines, and the repointed references in `data-schema.md` and `engine-rules.md` lead to the appropriate moved material. Existing references to the old Architecture location can continue through the retained pointer.

C5 — one low finding.

**Low — new handoff pointers use paths that do not resolve from the root handoff.** `HANDOFF.md` line 27 points to `./briefs/2026-11-07-rules-diet-step2-read-brief.md`; line 28 uses the same nonexistent directory for the report destinations. Line 38 points to `./handoff-right-now-2026-10-20.md`, which also does not exist there. A successor following these instructions cannot open the brief or earlier archive, and could save reports in the wrong place.

Use `raptor-port/docs/superpowers/briefs/` for the brief and both report destinations. Replace the older archive pointer with `raptor-port/docs/archive/handoff-right-now-2026-10-20.md`, which exists.

The archive head clearly marks its contents as historical, preserves the continuing homes of D774 and D775, and directs the reader to the current handoff. The new RIGHT NOW line follows the plan’s sequence and retains the merge requirement. The archive head’s external merge-status claim cannot be independently verified from this non-git copy.

C1 bullets checked closely: all 62, identified below by each bullet’s leading ruling. Each was compared for subject, primary number and direct change-tail citations.

- Inputs, lines 92–105: D1724, D1722, D1565, D1563, D1553, D1552, D1548, D1542, D1501, D1401, D1400, D1399, D1398, D1395.
- Inputs, lines 106–120: D1393, D1390, D1389, D1388, D1381, D1380, D1379, D1378, D1371, D1370, D1365, D1357, D1354, D1353, D1352.
- Inputs, lines 121–142: D1350, D1328, D1327, D1323, D1322, D1321, D1318, D1317, D1316, D1307, D1299, D1226, D1212, D1211, D1176, D1175, D1166, D1159, D1155, D1150, D998, D418.
- People & accounts, lines 72–82: D1555, D1545, D1541, D1521, D1502, D1447, D1223, D1200, D1149, D461, D460.