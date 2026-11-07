# The rules diet, step 4 part 2 — the fresh, blind Opus read (8 Nov 26)

The report of the fresh, blind Opus reader on the brief `2026-11-08-rules-diet-step4b-read-brief.md`, branch
`claude/rules-diet-step-4-7b92cb` at 584bca6e6 — saved whole, as it came back (D1739). Blind to Astra's read, which ran
at the same time (`2026-11-08-rules-diet-step4b-read-astra.md`). What was done with each finding: the plan's step-4
section.

---

## The blind read of step 4, part 2: the five always-loaded files as checklists

I worked read-only and stayed blind. I opened no `*step4b-read-opus*` or `*step4b-read-astra*` file. The scratch folder I share with the host holds `astra-step4b.log` and `step4-read-astra.ready.md`, and I did not open either. Separately, the plan's "Step 4, part 1" record, next to §3 which the brief sent me to, summarises part 1's two reads. I saw that summary; it covers part 1 only, not this change. I saved my own working files under `…\scratchpad\blindreader\`.

**Overall:** the five checklists keep nearly every rule.
- Each file's old text is in the archive whole and unchanged (I checked all five by script).
- Each file cites exactly the same ruling numbers as before.
- The table of homes is identical apart from capitals.
- Every command, path and number checks out: the lock folder, the 2-hour stale lock, the `gh run list` check, the `Rulings:` and `Walk:` lines, the eight questions, the tiers.

I found no high finding. There are two medium findings in `shipping.md`, one medium in part 1's fixes, and some low ones.

### Findings, most serious first

**1. Medium: `shipping.md` §The checks, the bullet "On his PC run only the tests of what you change… — no full gate run there".**
- **What the old text and D1086 say:** this sat inside the bullet that opens "While the repo is public…". D1086's row says: "while the repo is public … on his PC runs only the tests of what it changes…; once the repo is private again, the full check is back on his PC (D89)".
- **What the checklist says:** the sentence is now its own bullet with no condition. It contradicts two other lines of the same file: the loop's "the whole gate set too once the repo is private again" and the later bullet "the full check is back on his PC".
- **Fix:** start it with "While the repo is public, …".

**2. Medium: `shipping.md` §"Done" means LIVE, the two notification bullets ("Not for progress, not for a quick reply he is clearly watching…" and "Every stop that waits on him … whether or not he seems to be watching").**
- **What the old text and D1097 say:** the old text was one bullet that marked the newer rule as winning: "**Since D1097 (21 Oct 26): every stop that waits on him** … whether or not he seems to be watching". D1097 widened the older rule to every stop that waits on him.
- **What the checklist says:** it splits them into two bullets with no "since" and no date on the first. "Not for a quick reply he is clearly watching" now stands beside "whether or not he seems to be watching" with nothing saying which wins. An agent could skip a notification he ruled for.
- **Fix:** drop "not for a quick reply he is clearly watching", or begin the second bullet "Since D1097, every stop…".

**3. Medium: part 1's fix to `how-we-work.md`, the line "An important plan's red team: two readers … when he calls for them — the one fresh Opus read stands in for finished code only, and a plan's read is as it was; a plan that goes without them is on the reads-owed list".**
- **What the rows say:**
  - D790's reading (3) supports "finished code only" and "a plan's read … is as it was". The order's §4 says the same.
  - D1734 names fallbacks only for code reads and scenario design. No row says who reads an important plan when he has not called Astra and Sol 6.1.
- **What the line now says:** "as it was" is undefined. In effect an important plan without his call has no reader at all, only a place on the list of reads owed. Before the fix the line gave the plan the fresh, blind Opus read. In practice since 13 Oct, plans have had a fresh Opus reader: the Leave War overhaul plan read on 22 Oct, and the diet plan itself under D1732.
- **Fix:** put the gap to him as a question ("without your call, does a fresh, blind Opus reader red-team an important plan meanwhile?"), or spell out "as it was" in words.

**4. Low: part 1's fixes put readings on the page that no full row holds.**
- `how-we-work.md`: "Sol 6.1 is not called — beside D1743's window, the agent's reading: the fresh Opus reader holds the second seat". This is in no full row; only the page and the `HANDOFF.md` note parked for him have it. The line names D1743 but does not cite it, and it settles a clash with the later D1743 in favour of D1739.
- "A change read without them — by a fresh, blind Opus reader, the agent's reading, as D1495's wording was read". This reading is not in any row either.
- The risky-work line names the reads-owed list without citing D761. The step-4 line names the merge lock without D1746, which is on another branch and not yet on `main`.
- **Fix:** write each reading into the full row of the ruling it rests on, and cite D1743 and D761 where the line leans on them.

**5. Low: the old text went to the archive, not where the approved plan says.**
- **What the approved plan says:** plan §3 (approved as D1735) says the stories and worked examples "move whole to `guide-full.md`".
- **What the build did:** it moved each file's whole old text to `raptor-port/docs/archive/rule-files-2026-11-08.md`. The build brief gives a sound reason: `guide-full.md`'s headings are checked against the project guide. But the brief quotes §3 with the destination cut out, and the plan's own step-4 record does not note the change.
- **Fix:** add a one-line note of the departure and its reason to the plan's step-4 record.

**6. Low, carried over unchanged: `bug-check.md` §When to call in Fable and Codex, the first bullet.**
- **What it says:** "D353: scenarios and side questions one reader, Astra first … both of them reading the code only on money…".
- **What the page says:** "Scenario design and side questions: one reader (a fresh Opus reader unless he calls Astra)". Under D1734, "both" applies only on his call. The next bullet ("Who they are now") corrects this, and the new "who they are now, below" helps, but the first bullet still reads against the page.
- **Fix:** write "one reader — a fresh Opus reader unless he calls Astra".

**7. Low, carried over unchanged: the same section of `bug-check.md` never mentions D1743.**
- **What D1743 says:** until Mon 9 Nov 26 19:00 his words count as his call for Astra on the work in hand, and Sol 6.1 where a second reader fits.
- **What the checklist says:** "Astra and Sol 6.1 are called only when he calls for them … D1738 and D1739 call Astra for the rules diet's reworded steps". A chat that reads only this file misses the window. The page has it, so this is leaning, not a contradiction.
- **Fix:** add "and D1743 until Mon 9 Nov 19:00".

**8. Low, carried over unchanged: `record-decisions.md` §When a ruling overwrites another.**
- **What D201 says:** its row covers a ruling that "overwrites or narrows" an older one.
- **What the checklist says:** only "overwrites". `DECISIONS.md` step 2 covers narrowing, but this section does not.
- **Fix:** write "overwrites or narrows" in the body.

**9. Low: commands broken across lines inside code marks.**
- **Where:** in `shipping.md`, "`npm run build && npx` / `vite preview`" and "`… gatelock.mjs` / `release`". In `doc-structure.md`, the `docsize.mjs --moves` and `backlog-archive.mjs <ID> --homes <file>` commands.
- **Why it matters:** `HANDOFF.md` itself warns that a command split across lines fails when it is copied.
- **Fix:** keep each command on one line.

### Checked and found right

- **The builder's account (Q1–Q7):**
  - "Never a working guide" in the notes-only list matches D1407's full row.
  - "With the secrets scan" is kept as it was.
  - The guard sentence is accurate: the guard's own head and D976 say it lets a push through when GitHub cannot be reached.
  - Both statements of a hook's rule for Codex repeat what `AGENTS.md` says.
  - The three failures, now stated as rules, match `guide-full.md` §The three failures behind "Read it before you ask him anything".
- **What was archived:** every item marked "story" or "example" is one, carrying no rule.
- **The headings other files point at:** all are present and still hold what the pointing files expect. I checked `deploy.yml`, `AGENTS.md`, the bug-check order and its checklist, `doc-budget.md`, `file-map.md`, `gates-and-deploy.md`, `guide-full.md`, `raptor-port/CLAUDE.md` and the specs.
- **The rules a hook or guard enforces:** the push guard, the lock, the per-message rulings question and the end-of-turn document check are each stated in words.
- **The tripwires:** all five sit above the new size, about a tenth up, each with its reason. The two that rose (`doc-structure.md`, `shipping.md`) are explained by line wrapping; both files are the same size or smaller in bytes.
- **Part 1's other fixes match their full rows:** D228, D1742, D1297, D971, D1732, D1750, D1557, D1494, D1222, D1551, D820, D490, D822, D1717, D785, D884, D868, D1671, D1572, D1537, D1533, D1749, D625, the `doc-budget.md` and `[RULING-HOME-HOOK]` lines, and the record-decisions steps pointer.

### Coverage

- **How many I checked:** about 194 requirements of the old text (shipping 72, doc-structure 29, record-decisions 25, plain-language 22, bug-check 26). Each was checked against its checklist line and, where the line says more than a pointer, against the full rows of about 60 rulings. I also checked the 15 headings other files point at, the 6 project hooks, the 5 tripwires and about 26 changed lines of part 1's fixes.
- **Files I found whole:**
  - Whole: `plain-language.md`, `doc-structure.md` and `record-decisions.md`. Their only notes are carried-over or low: finding 8 and finding 9's line-wrap point.
  - Whole except the low carried-over points 6 and 7: `bug-check.md`.
  - Not whole until findings 1 and 2 are fixed: `shipping.md`.
  - The archive file: whole, all five old texts unchanged inside it.
