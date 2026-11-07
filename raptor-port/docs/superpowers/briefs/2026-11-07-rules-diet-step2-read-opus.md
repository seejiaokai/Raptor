# The rules diet's step-2 short texts — the fresh Opus reader's blind read (7 Nov 26)

Read on `claude/rules-diet-step2` (commit `41afc64f3` and the drafts commit after it) from the brief
`2026-11-07-rules-diet-step2-read-brief.md`, by a fresh Opus helper that wrote none of it and saw none of the writing
chat's reasoning, told not to open Astra's report (D1739). Saved as it came back, before anything was done about it.

---

**Verdicts**
- **A (the note on each message):** one meaning lost (medium). The note still does D13's job: it lists the kinds and asks the question before the work. But one carrier it drops was itself a named home of D201, and of D137's area-file routing.
- **B (the skill-notes short form):** one medium finding and several low ones. The deliberate change (resolved notes archived at each review, not on every write) holds as policy: it matches what this project actually does. Its wording contradicts itself, though, and the switch-on plan does not register it as a local change.
- **C1 (the two pointer lists):** all 62 bullets are faithful in subject and numbers. One bullet cites a replaced ruling (low). One file that loses the Leave War rulings has no pointer list that loads with it (medium). One SANS pointer is arguably missing (low).
- **C2–C5:** no meaning change. One low inaccuracy in the handoff's pointer line.

**Findings**

**A1, medium.** File: `raptor-port/docs/superpowers/briefs/2026-11-07-rules-diet-step2-short-texts.md`, lines 43–50 (proposed note) and table lines 56–65.
- **Failure:** the full row of D201 names `.claude/hooks/record-decisions.sh` as one of its three homes ("the check on every message"). The full row of D137 also names the hook; the hook carried D137's "in its AREA's file under .claude/rules/decisions/".
- The new note drops both. Once it is switched on, two rulings' recorded homes say the per-message check carries them, and it no longer does. That is the "named home that does not carry it" defect `record-decisions.md` exists to stop.
- A smaller point: the note now reads "record it first … (`.claude/rules/record-decisions.md`; …)". Read literally, the parenthesis can look like the place to record.
- **Cause:** the carried-by table checks where each part's rule lives. It does not check which full rows name the hook as their home. The rows are found by `grep -l 'record-decisions.sh' .claude/decisions-full/*.md`: D13, D137 and D201 (D1736 and D1739 only mention the hook).
- **Fix:** keep both points in the note, which lands at about 630 bytes, near the plan's "about 600". Replace the middle sentence with:

  > If yes, record it first, in its area's rulings file, before the work it implies (the rule: `.claude/rules/record-decisions.md`; the steps: the head of `DECISIONS.md`); if it changes an earlier ruling, fix what that one left behind in the same change (D201). The work absorbing a ruling is not the record keeping it.

  Add a row to the table naming D13, D137 and D201 as the rows whose home is the hook, and saying what still carries each.

**B1, medium.** File: `.claude/skills/task-observer/SHORT-FORM.md`, lines 73–76, and the switch-on plan's step 4 (short-texts doc, lines 89–90).
- **Failure:** the text says a change "beyond an append — a status, an archive, a renumber…" follows the full skill's "Log-write safety" **and "Archival on Write"**. That section begins "On every log write, first move already-resolved entries to the archive."
- The short form itself requires an ACTIONED mark mid-session (line 71), which is a status write. An agent following the cited section archives on that write — exactly the behaviour the same sentence says is dropped ("here resolved notes are archived at each review").
- Today the log holds 150 `ACTIONED (2026-10-27)` and 2 DECLINED entries, so such a write would trigger the full guide's highest-risk mutation in an ordinary task chat.
- Separately: an agent who invokes the full skill "for a case this short form does not cover" reads "Archival on Write" with nothing telling it the project differs. Step 4 adds a line to the vendoring notes naming only `SHORT-FORM.md` and the hook change, not this behaviour change.
- **Does the change hold?** Yes as policy. The project's notes archive at the review's clean-up (D69 line). The log shows on-every-write archival has not been practised: a "met again" line was written on 7 Nov without moving the 27 Oct entries.
- **Fix (lines 73–76):**

  > Changing the log beyond an append — a status, an archive, a renumber, a merge of two branches' logs — follows the full skill's "Log-write safety" (a backup, the log read fresh just before the write, one entry at a time, the count of headings checked against the live file). Resolved notes are not archived on every write here: they move to the archive only at a review's clean-up (`.claude/skills/TASK-OBSERVER-VENDORED.md`), and that move keeps "Archival on Write"'s date rule and count check.

  In step 4, the new line in `TASK-OBSERVER-VENDORED.md` should also say: "resolved notes are archived at each review's clean-up, not on every write as the guide's 'Archival on Write' says — the short form's one change to the guide's behaviour."

**B2, low.** `SHORT-FORM.md` lines 21–24 (what to watch).
- **Dropped from the full guide's signals:** an undocumented use case; feedback that generalises; corrections forming a pattern; positive signals (a technique that worked well, beyond "worth making the recommended one"); a naming, framing or structural suggestion "even conversational". From the simplify list: a rule the agent keeps failing to follow may be removed, not only enforced.
- **Failure:** a passing suggestion from him about a skill's naming or structure goes unlogged.
- **Fix:** append to the "better skill" line: "an undocumented use case, feedback that generalises or corrections forming a pattern, something that worked well, a naming, framing or structure suggestion even in passing". Append to the "simpler skill" line: "a rule always broken (enforce it or remove it)".

**B3, low.** `SHORT-FORM.md` lines 25–26 and 52–53.
- **Bend:** "Do not log … a note useful only with a client's private detail" drops the guide's exception, "(unless an internal skill is the right home)". Line 52's "internal holds his or the project's own preferences" also narrows the guide's "internal — contains user/client/project specifics or personal preferences".
- **Failure:** a project-specific lesson that is not a preference is either skipped or forced into open-source form.
- **Fix:** "…or, as open-source, a note that needs a client's private detail to be useful (log it as internal instead)". And: "internal holds his or the project's own specifics or preferences."

**B4, low.** `SHORT-FORM.md` lines 76–77 (merging two branches' logs).
- "keep one side's entries" bends the project's note "keep the **reviewed** side". It also drops the guide's "correcting any cross-reference to them".
- **Fix:** "At a merge, keep the reviewed side's entries (or either side's, if neither was reviewed) and re-append the other side's new ones at the end with fresh numbers, correcting any cross-reference to them."

**B5, low.** `SHORT-FORM.md` lines 60–62 (a trap met again).
- "or a safe default in place of a judgement" drops the guide's condition: only "where a safer way costs nothing extra".
- **Fix:** "…or, where it costs nothing extra, an unconditional safe default in place of a judgement."

**B6, low.** Smaller drops an agent meets in an ordinary session:
- line 11: a missing `last-review-date.txt` is recreated with `never`, and a date is written only by a review that ran;
- line 33: a collision found at the pre-write check is logged as a meta-observation;
- line 31: an entry numbered past another branch's entries says so;
- lines 66–68: the self-check before surfacing. Each note is Issue → Improvement → Principle, typed, names the skill's section, and no open-source Principle carries client or project detail.

Fix: add these as one clause each in place.

**B7, low.** Switch-on plan step 2 (short-texts doc, line 81).
- The new project-guide line no longer tells a session the start hook did not reach what to do. Today that line says to invoke the skill; after the change it says only that "the start hook gives" the short form.
- **Failure:** a helper session (to my understanding the session-start hook does not fire for a helper) opens a `raptor-port/` file, reads that line and gets nothing, so no notes are taken there.
- The line also omits "a question about its setup" from the four cases.
- **Fix:** add "— a session it did not reach reads that file". The short part is about 290 characters before the "· full text" pointer, so it fits the 350 cap.
- **No other conflict found:** the hook fails open, `printf '%s'` keeps the file's `%(refname)` literal, and the full guide's paragraph plus its dated addition agree with the short form.

**C1a, low.** `.claude/rules/decisions/inputs.md` line 141, the bullet "What lowers the war's manning, by kind of input [D998, D1381, D1357, D1356, D1338]".
- D1338 is archived (REPLACED BY D1356) and has no line in `leave-war.md`. The list's head says "open its line in `leave-war.md`", so the reader finds none and may open the replaced row ("UNA stays…").
- It also breaks the plan §5 rule "no statement cites a ruling archived as replaced".
- **Cause:** copied faithfully from D998's "— changed by" tail, which still names it.
- **Fix:** drop D1338 from the bullet; D1356, which replaced it, is already cited.

**C1b / C2, medium.** `.claude/rules/seams/leave-war.md` paths, against the pointer lists' heads (inputs.md line 89; people-accounts.md line 69).
- `raptor-port/src/engine/qualcols.ts` was a Leave War seam path, so it used to load all of `leave-war.md`. Now it loads only the seam file and `scheduler.md`.
- Neither pointer list loads with it: `people-accounts.md` and `inputs.md` have no path matching it. Yet it implements D1502 (the Management tick column; its code comment cites D1502). D1200, D1149, D460 and D461 govern the same Quals columns.
- **Failure:** a chat that edits the column list from `qualcols.ts` (for example, making Management removable or renaming SXO's key) sees none of these rulings.
- **Cause:** the step moved the qual catalogue bullet into the seam file because it "binds `engine/qualcols.ts`", but did not carry that file's rulings the same way. The plan §2 names only the Inputs and Quals pages as losing rulings.
- `inputgate-hook.ts` is covered: `inputs.md` loads on `state/input*.ts`. `people-settings-commit.ts` cites no Leave War ruling.
- **Fix:** add `raptor-port/src/engine/qualcols.ts` to `people-accounts.md`'s `paths:`, and write its head as "…no longer with the Quals page, its column list (`engine/qualcols.ts`), `engine/people.ts` or `state/store.ts`…".

**C1c, low.** `people-accounts.md` pointer list.
- No bullet for D1215 and D1221: SANS men are on the war only by "+ SANS", which replaced the Show SANS switch.
- D283 and D325 on that page still speak of "Show SANS", and D283's tail does not name D1221. These two rulings used to load beside them through the `engine/people.ts` and `store.ts` seam paths.
- **Fix:** add "- SANS men on the war only by '+ SANS', in place of Show SANS [D1215, D1221]".

**C5, low.** `HANDOFF.md` line 38.
- The pointer says the 6 Oct–5 Nov lines are in the new archive and "those of 13 to 20 Oct 26" are in the older one. But the new archive also holds a 13 Oct line and three 20 Oct lines, so someone looking for those may search only the older file.
- **Fix:** "…; more of 13 to 20 Oct 26 in `…/handoff-right-now-2026-10-20.md`".
- **Verified:** the archive head's "every pull request they name is merged" holds for every pull request it names (481–489, 492, 550–554, 630–638), and D774 and D775 are where it says.

C2–C4 are otherwise right. Both seam files' `paths:` match `main`'s area files line for line. Their heads describe them accurately. Both short map rows point to sections that exist and hold the full rows. The `leave-war.md` and `tracker.md` pointers, and the `data-schema.md` / `engine-rules.md` repoints, land.

**C1 bullets checked (all 62 against their short lines in `leave-war.md`, tails included)**
- **inputs.md (51):** D1724, D1722, D1565, D1563, D1553, D1552, D1548, D1542, D1501, D1401, D1400, D1399, D1398, D1395/D1397, D1393, D1390, D1389, D1388, D1381, D1380, D1379, D1378, D1371/D1525, D1370, D1365, D1357 (its D1374 and D1372 are `inputs.md` rulings, correctly cited), D1354, D1353, D1352, D1350, D1328, D1327, D1323, D1322, D1321, D1318, D1317, D1316, D1307, D1299, D1226, D1212, D1211, D1176/D1225, D1175/D1291, D1166/D1177, D1159, D1155/D1501/D1500, D1150, D998 (D1338 archived — C1a), D418/D1177.
- **people-accounts.md (11):** D1555, D1545, D1541, D1521, D1502, D1447/D1541/D1460, D1223, D1200, D1149, D461, D460.
- **Missing-ruling sweep:** I listed every uncited, non-excluded `leave-war.md` short line that mentions inputs, Quals, Unavailable, the Ground Programme, commitments, postings, medical, documents, OIL, the bell, seats or SANS. Beyond C1c, none governs the six named files.
