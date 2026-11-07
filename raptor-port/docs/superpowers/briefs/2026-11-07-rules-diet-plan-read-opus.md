# The rules-diet plan v1 — the fresh, blind Opus reader's report (7 Nov 26)

Read at commit `a294a09f` (branch `claude/rules-diet-plan`), from the brief `2026-11-07-rules-diet-plan-read.md`, by a
fresh Opus reader that had not seen the conversation (D790, D1734): 82 tool uses, about 16 minutes. Saved as it came back,
before anything was done about it; what was done with each finding is in the plan's review log
(`../plans/2026-11-07-rules-diet-plan.md`). Astra's read of the same commit is separate and blind to this one.

---

I read the rules-diet plan blind, at a294a09f (branch claude/rules-diet-plan). The direction holds up and the numbers it starts from are correct. It is not ready to put to him for approval yet: the safety gate it promises can be satisfied by a bare ruling number, several of its proposed archivals break DECISIONS.md step 2, and the existing merge and map scripts break on a converted page.

# Findings

## HIGH

**H1. The gate can't tell a rule from a number, and the plan removes today's only automatic signal for a narrowed ruling.** So Part 1 point 4 ("nothing can be lost or left stale without the check going red") and §7.1 ("the stronger gate check") are false.

- **Failure (a): a bare number list passes the check.** The how-we-work sample "places" 46 rulings as a list of numbers ("stated in the always-loaded checklists"). Those checklists are not drafted yet. Three of the 46 are stated in none of today's five files: D14, D970 and D611. The proposed check ("every live ruling is cited on its area's page") passes on the bare numbers. The same thing will happen with every new shipping or recording ruling:
  - recording step 2 adds its number to how-we-work's head list, and the gate is green;
  - nothing checks that shipping.md was edited;
  - so the rule is loaded nowhere.
- **Failure (b): a narrowing ruling slips through.** 392 short lines carry "— changed by" today. The converter writes that tail automatically, and the gate fails a short line whose tail doesn't match its full row's marks (docsize.mjs L733-736). After the diet only archival is checked. Example: a new ruling that narrows D1044 can just add a new page line, leaving the old line stating the un-narrowed rule. Nothing goes red.
- **Failure (c): the samples already lose clauses of rulings they cite.**
  - D874: handoff "whenever at a suitable point, mid-job included" became "if the job is nearly done".
  - D1530: "Vercel and the red flags set aside, not raised unasked" dropped; only "the repo is public" kept.
  - D1536: "words on screen stay with his design rulings" and "this project kept whole" dropped.
  - D1554: its main clause, "never anything a job reads (D68)", dropped.
  - D15: "ⓘ rows do not earn" dropped. D15's row says every other clause still stands.
  - D16: "the host reproduces every finding" dropped.
- **Cause:** the check only tests that a number is present (`citesRuling`). The "— changed by" chains are removed from what loads, and nothing replaces them.
- **Fix:**
  1. A citation counts only on a line that states the rule. Ban bare-number lists. Rulings carried by the five checklists are cited and checked in those files.
  2. Add a mark check: for every live ruling X whose full row carries a change mark naming Y (`RL.marksOf`), every page line citing X must also cite Y.
  3. The fresh reader checks each cited ruling's short line, and its full row where it has "— changed by", against the page line that carries it.

**H2. The how-we-work account's archive list breaks DECISIONS.md step 2, D971 and the plan's own text.** At least six of the 23 are wrong, so Part 1's "23 proposed for the archive" is wrong.

- **D141 and D390 marked "replaced":** but §7.1 says D141 stands and D390's full-row half stands. A ruling changed in part stays live (step 2). D1732's recorded reading also told him the diet sets D141 aside. He needs one consistent statement.
- **D969 marked "spent":** its point F (the skill-notes short form) and point E (his connectors) are still open. OUTSTANDING.md line 225: "[CONTEXT-START-SIZE] — left: the short skill-notes guide (F) and his own connectors setting (E)". Worse, §6 and §7.2 tell him the skill-notes short form "reverses a choice of his (15 Aug 26)". He already approved it on 17 Oct (D969, the newer ruling, so it wins under D90). Putting it to him again as an open choice breaks D53, and the wrong framing invites a no.
- **D811 marked "spent":** its go to build [SHELL-SCRIPT-GUARD] is unused (OUTSTANDING.md line 199: "his go given (D811)"). That guard is a hook, which needs his explicit go. Archiving D811 leaves the permission homed only in the backlog, against D29 rule 2.
- **D905 marked "restated in full by D906":** D905's full row says "WIDENED BY D906". D906 doesn't restate "no link after every push of unfinished work"; it widens when a link is sent. D905 stays live, and shipping.md still cites it.
- **D8, D10, D72 marked "spent (history)":** DECISIONS.md allows no such category. D72 is a standing no: "nothing adds rows to it and no handoff checks it".
- **OIL account:**
  - D163 is a "leave it", not a spent permission. At most it is "restated in full by D56", subject to the reader's check.
  - D470's justification, "its full row's amendment says so", is wrong: the mark is AMENDED, not restated. D755 doesn't carry D470's "a Personal request earns nobody anything".
- **Borderline:**
  - D870 is a build permission, but it also sets standing design: the fullness on his screen and the saved note handed back.
  - D1531: "comes from the same public package store" is not carried by any later ruling.
  - D1732 is uncited on the sample page but stays live until the diet ends, so the plan's own check would fail during the work.
- **Fix:**
  - Re-run the account sentence by sentence against step 2.
  - Keep D141, D390, D905, D969, D811 and D72 live, with narrowing marks where needed, and drop the "history" category.
  - Correct §6 and §7.2 to say D969 already approved the short form.
  - Cite D1732 on the page.
  - Fix Part 1's archive count.

**H3. The change-over doesn't work with the scripts as they are, and the plan never mentions the map, `--merge` or `--move-rows`.**

- **The map empties without warning:** `backlog-archive.mjs --rulings` step 4 rebuilds each map row from the rows in the area file (L388). A converted page has none, so the row becomes "—". The gate's map check (docsize.mjs L744-758) then passes on an empty list. "The map says which file carries which D-number" ends without anything going red.
- **`--merge` (the route DECISIONS.md step 3 prescribes) breaks both ways:**
  - **A converting branch that brings `main` in:** new rulings from main go through `topInsert` into the page, which has no table, and the run stops ("has no rulings table", L240-242).
  - **An unconverted parallel branch that brings a converted main in:** both sides have the full-text folder, so the branch's files are the starting point (L102, L107). The page from main is only printed as "RE-APPLY BY HAND" lines, never written. The run then writes the branch's old-shape file, so main's conversion is quietly undone. That file has no `shape: page` marker, so the gate checks it the old way and passes. The plan's "none can slip through" fails in this direction. He runs parallel worktrees, and the conversion spans 8 to 10 chats.
- **`--move-rows` stops on converted areas:** it requires a short line (L256). Yet the sample itself proposes moving D148, D350, D351, D785, D25 and D54 to other area pages.
- **The new seam files** under `decisions/` count as rulings areas to the gate. Each needs a RULING_BYTES tripwire (L739) and a map row (L754). Neither is in the plan.
- **Fix:** step 1 must include, each with a self-test case, before any area converts:
  - map lists for converted areas built from `decisions-full/<area>.md`;
  - `--merge` taught the page shape: take a converted page whole, never as prose; send the other side's new rulings to the full-text file plus a "place on page" list;
  - `--move-rows` for full row only plus page-line edits;
  - the seam files placed outside `decisions/`, or registered with a map row and a tripwire.

## MEDIUM

**M1. Rulings it says "stand" or doesn't name are in fact narrowed.**

- **D68 and D1554:** §4 and extra reads 1 and 2 shrink what a job reads: the bug-check order from 40k to about 10k, the design guide from 50k to about 12k, the ripple map from 29k to about 7k. D68 says "never skip or shrink a read to save context". D1554 limits trimming to the start load, "never anything a job reads". D1732's words cover the bug-check order checklist, but not the design guide or the ripple map.
- **D1417 and D941:** extra read 1 condenses the design guide's §9 lessons to "one line of what to check". D1417 says a lesson keeps his words and covers no case he didn't correct.
- **D611 and D976:** the seam split is the kind of split D611 weighed ("a ruling sitting in a part that was not loaded"). After it, Inputs, Quals and store jobs stop loading the Leave War rulings about inputs: 41 short lines mention inputs, among them D1548, D1552, D1553, D1563, D1565, D1722 and D1724. Also, D611's mark (about 100,000 bytes) is already crossed: scheduler.md is 117,753 bytes, which D976 said brings the split question back.
- **Fix:** name all of these in §7.1 in plain words. Keep §9 whole, with any one-liners as a separate list. List the Leave War input rulings under "From other areas" on the Inputs and Quals pages.

**M2. The numbers' assumptions.**

- **The "after" columns leave out reads the pages themselves require.** A page line is "a few words", and the page says to open a surface's rows before changing anything on it. Leave War full rows average about 440 tokens, so a surface with 30 rulings adds about 13k.
- **"Today" assumes whole reads.** It counts the bug-check order, design guide and ripple map read whole. The project's own rules say a file over about 300 lines is read in parts (CLAUDE.md token discipline; D68's row). So "today" is a ceiling, yet Part 1 tells him as fact that this is the cause of the forgetting and the handoffs.
- **A missing layer:** `performance.md` Part 1, about 11,000 tokens, which CLAUDE.md requires before any layout, interface, design or rendering change.
- **"The middle" isn't the middle:** the projection keeps 35% and calls it the middle of the samples' 23% and 64%. The middle is about 43%, which adds about 3k for the Leave War and 2.7k for the scheduler (about 3% on the job rows).
- **Smaller points:**
  - Layer C (the per-message note across 40 messages) is counted as "before code".
  - "401 carry changed by" is 392 by my count.
  - The Inputs job also loads `oil.md` (OilDayList.tsx matches `*Oil*`); that is an undercount.
- **Fix:** label "today" an upper bound. Add per-surface row reads to the "after" columns, measured on the last real Leave War and scheduler jobs. Add `performance.md` Part 1. Use about 43%, or call 35% the optimistic end.

**M3. The big areas can't be converted or read by one chat.**

- The Leave War's full rows are about 163,500 tokens and the scheduler's about 177,400; the rows to fold (those with "— changed by") come to about 73k and 64k.
- A converter chat would carry about 340k (112k app, 14k every-chat, 51k Leave War lines, 163k full rows). That reaches the roughly 384k compaction point before it writes anything. So would "a fresh reader per page".
- **Fix:** convert and read section by section, a group of surfaces per chat, each with its own account. Re-cost the 8 to 10 chats on that basis.

**M4. A cheaper, safer path is ordered last.**

- For a scheduler job (300k to 121k), the per-job savings break down as:
  - the six extra reads, mostly moves and pointers with no rewording: about 91k;
  - the bug-check checklist: about 30k;
  - the every-chat layer: about 25k;
  - rewriting the scheduler and design pages, the riskiest part: about 32k.
- For Inputs jobs, the seam split alone removes about 47k with no rewording.
- The plan puts the extra reads at step 5.
- **Fix:** after steps 1 and 2, do these first:
  - the skill-notes short form (already approved, D969);
  - the per-message note;
  - the seam split, as a byte-for-byte move;
  - the handoff's old lines.
  Then re-measure, and convert only the areas still too large. Also weigh D611's crossed trigger: splitting the scheduler's settled sections by screen with `--move-rows` is lower risk than rewriting them.

## LOW

- **The per-message note** at about 350 bytes drops the list of what counts (decision, preference, correction, "leave it", explicit no, supersession). That list is the hook's purpose: it targets misclassification at the moment of hearing (hook comment; D13). Keep the list.
- **Rules a guard enforces** must keep their own words, not just name the guard. The push guard lets a push through when it can't reach GitHub (push-guard.mjs header), and Codex has no hooks.
- **Two automatic checks apply only to short lines:** the capital-letters check (D970) and the 350-character cap. Pages lose both. Carry them over or say so.
- **"Settled designs — guarded by tests"** overclaims: 242 of the 1,130 area rulings have no test naming them.
- **D25** ("governs every report") would move to the OIL page, so the every-chat layer loses it. Keep a one-line pointer on the general page.
- **OIL page:**
  - drops D660 from its cross-references, though D660's full row names `oil.md` as a home;
  - drops the [OIL-AUTO-REMOVE] evidence pointer ("do not re-do them");
  - states D1042–D1044, D360 and D1578 in full while they are homed elsewhere, against the plan's one-home rule — and D1043 is already changed by D1060 and D1061.
- **D1407:** steps that touch only area files are "notes" and would merge themselves once green. The approving ruling should say they wait for his "merge live".
- **The `shape: page` marker:** confirm that `how-we-work.md` with a frontmatter block but no `paths:` still loads in every chat.

# Checked and found sound

**The numbers.** I recomputed every layer A–I figure with `estTokens` at HEAD; all match. HANDOFF.md is 8,499 at HEAD (the working tree differs); the OUTSTANDING.md head is 14,886 at the commit before the plan. Part 1's rows rebuild exactly from the layers:

| Job | Today (rebuilt) | Diet as named (rebuilt) | Plus six (rebuilt) |
|---|---|---|---|
| Notes only | 92,161 | — | — |
| Leave War | 318,964 | — | — |
| Scheduler | 299,605 | 211,688 | 120,913 |
| Inputs | 368,158 | 239,488 | 131,513 |
| Tracker | 265,949 | — | — |

**Sizes and counts:**
- How-we-work page: 12,577 bytes ✓; 4,762 tokens by my extract (about 2% off the plan's 4,873).
- 1,337 live rulings and the per-area counts ✓.
- Cited: 184 of 207 and 46 of 48 ✓.
- 888 of 1,130 area rulings are named in a test file (plan: 891) ✓.
- Skill log 398,690 bytes ✓.
- Architecture sections 5,136 and 4,260 tokens, at 80% about 4,000 and 3,300 ✓.

**Paths assumptions** for the Leave War and Inputs jobs ✓.

**Unaffected or working as intended:**
- `rulecheck` reads the behaviour-register ids, not the rulings files.
- The archive route's retire step works on full rows; dropping a missing short line does nothing.
- The Stop hook runs the rulings checks through `--inventory`, so the new checks would fire at each turn's end.
- The homes check for new rows still works.

**Archivals that are right:** D602, D766, D832, D972, D973, D974, D1556, D1566, D1659, D86. D203 is defensible, though "restated in full" is loose.

**Full rows opened for the how-we-work sample:** D8, D10, D68, D72, D86, D136, D137, D141, D203, D390, D541, D590, D602, D611, D811, D832, D853, D870, D871, D874, D884, D905, D906, D969, D972, D973, D974, D976, D1033, D1415, D1530, D1531, D1554, D1556, D1732; and in the archive D1414, D1593, D1594, D1718.

**How-we-work statements found faithful:** D6, D16/D17 (apart from the clause in H1), D22, D23, D53, D56–D59, D62, D63, D67–D70, D84, D87, D89/D106, D343, D353/D590/D601/D1734, D485/D490, D541/D853, D588/D787, D596/D667, D754, D790, D820/D821, D884–D886, D903, D994, D1024, D1033/D1415, D1195, D1222, D1237/D1363, D1271/D1273, D1281, D1409–D1411, D1424/D1426/D1478/D1494/D1495, D1551, D1557, D1613, D1625, D1671/D878, D1717, D1733.

**Full rows opened for the OIL sample:** D2, D15, D19, D24, D28, D32, D35, D43, D48, D52, D163, D402, D470, D592, D660, D753, D755, D762, D781, D783, D831, D840, D865, D978, D1008, D1043, D1094, D1579.

**OIL statements found faithful:** D1, D2, D19, D21, D24–D26, D28, D31, D32, D35, D42, D43, D48, D49, D52, D79–D82, D142, D260, D261, D400–D402, D591, D592, D606, D781–D783, D793, D804, D814, D816, D818, D831/D840, D862, D863, D865, D923, D978, D1008, D1094, D1578, D1579.

I changed and committed nothing (scratch files only, under /tmp/reader-opus/). The working tree already had uncommitted changes to HANDOFF.md and .claude/skill-observations/log.md that I did not make. The clone is shallow (2 commits), so I couldn't check the "754 on 17 Oct" figure. Nothing new to remember about the user.

# Verdict

Not safe to put to him as written: the archive list breaks DECISIONS.md step 2 in at least six places, the skill-notes item is framed as reversing a choice he already approved (D969), and the safety check plus the merge and map tools fail on converted pages.

What must change first:
1. Correct the archive list and the D969 and D141 statements.
2. Specify the citation and mark checks so a bare number can't pass and narrowings carry through.
3. Bring the map, `--merge` and `--move-rows` into step 1.
4. Name D68, D1554, D1417 and D611 as narrowed.

Recommended: run the mechanical moves before any area rewrite.
