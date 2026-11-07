# The rules diet, step 1 — a fresh, blind Opus read of the scripts

**Date:** 7 Nov 26. **Reader:** a fresh Opus chat that wrote none of this (D790). **Branch:** `claude/rules-diet-step1`
at `719240105`. **Read-only:** no tracked file changed; every scenario below was run in a throwaway git repo under the
OS temp folder, built from copies of the branch's own scripts (the self-test's `makeRepo` shape).

## What was read

- The plan, `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` §1, §2, §5, §7.
- `DECISIONS.md`, its head through "The steps for a converted area".
- `git diff origin/main...claude/rules-diet-step1 -- raptor-port/scripts DECISIONS.md` — the five parts:
  `docsize-rulings.mjs` (page reading, `citesIn`, `statementsOf`, `pageShapeProblems`, `pageDebts`, the seams) with
  `docsize.mjs` job 1c and job 3; `backlog-archive.mjs --rulings` on a page; the seam files; `--merge` across the page
  shape; `docsize-reads.mjs` (`--reads`); and the self-test cases for each in `docsize-selftest.mjs`.
- `npm run docsize -- --reads --verbose` on the repo as it stands.

Excluded by the brief (D56): harm that lives only in data already stored while the code is right going forward. None of
the findings below is of that kind — each would hit a ruling recorded or a branch merged from now on.

## Findings

### F1 — HIGH — a pointer on another area's page counts as stating a page's ruling (wrong pass)

**Failure.** Area `third` is a page; its live ruling D7 is stated on no line of `third`'s page. The only line citing D7
is a pointer on another page's "From other areas" section — `- Third: the third screen rule bears here too [D7].` The
gate passes. Controls: D7 stated on its own page — pass; D7 cited nowhere — fails "unstated", as it should. The same hole
reaches the recorder: `--rulings --move-rows D7 --to other` (page `third` → page `other`, `other` never states D7)
exits 0 and the gate passes after it; the only output is a MOVE ON THE PAGES line, which nothing enforces. So a ruling
can leave its home page, or never reach it, with every check green — exactly what plan §2 ("a ruling is stated on its
home page, or — a general ruling — in an always-loaded file; another page may only point to it") and the §5 table ("its
number on a statement line of its home page or of one of the five always-loaded files") forbid. The comment above the
page block in `docsize.mjs` (lines 789–797) says the same as the plan; the code does not do it.

**Cause.** `raptor-port/scripts/docsize-rulings.mjs:261` adds every cited number of every statement, from every source,
to `stated`; line 271 then calls a page ruling stated if any source stated it. The source's area (`homes`) is consulted
only for the change-mark check (line 262–263), never for `stated`.

**Fix.** At line 261, count a statement toward `stated` for `d` only when the source may state it: `homes.has(live.get(d)?.area)`
(its home page, or an always-loaded rules file, whose `homes` is the set of general areas). Keep the citation in
`listedOnly` otherwise, so the "unstated" message can say where it is only pointed to. Add self-test cases: a page ruling
stated only on another page's "From other areas" fails; `--move-rows` from one page to another that does not state it
owes a STATE ON THE PAGES line and writes nothing.

**Reproduced:** yes (both the gate and the `--move-rows` route).

### F2 — HIGH — a page ruling stated outside its home page escapes the change-mark check (wrong pass)

**Failure.** D5 (area `other`, a page) is NARROWED by D6 — the mark sits in D5's full row. Its page states only D6. D5
is stated, as first ruled and without D6, in `.claude/rules/shipping.md` (an always-loaded rules file):
`- Rule five holds on every day of the week, as first ruled [D5].` The gate passes and `--rulings --dry-run` owes
nothing. Put the same line on D5's own page and the gate fails, rightly: "states D5 but does not cite D6". So a ruling's
out-of-date wording passes wherever it is stated outside its own page — and, with F1, on any other page too.

**Cause.** `raptor-port/scripts/docsize-rulings.mjs:262–264`: `if (!homes.size) continue` and then the mark check runs
only for a ruling whose area is in the source's `homes`. An always-loaded rules file's `homes` holds only the general
areas that are pages (`docsize.mjs:804`, `backlog-archive.mjs` step 5), so a scoped area's ruling stated there is counted
as stated (line 261) but its marks are never checked.

**Fix.** Apply the mark check to every statement that line 261 counts toward `stated` — after F1's fix, that is exactly
the statements whose source may state the ruling — rather than gating it on a separate `homes` test. In other words, one
condition decides both "this statement states d" and "so its marks must be cited". Self-test case: the shape above
fails with the "does not cite D6" message.

**Reproduced:** yes (gate and recorder `--dry-run`).

### F3 — MEDIUM — `--merge` dies when the other branch created a new area directly as a page (wrong failure)

**Failure.** Branch `a` creates a new area `third` as a page — `third.md` with its page, `decisions-full/third.md` with
D7's full row, a map row — and passes the gate. `main` edits an unrelated ruling. Merging `a` into `main` and running
`--rulings --merge`: exit 1, "…/third.md has no rulings table … to put D7 in." Nothing can be merged by the tool. The
reverse direction (main merged into `a`) works. Once step 2 converts the areas, a new area is most naturally created as
a page, so this will meet the first parallel branch that adds one.

**Cause.** `raptor-port/scripts/backlog-archive.mjs:151–155` takes the new files whole (`takenWhole`), but the page has
no row for D7, so the check at line 239 (`takenWhole.has(f) && … some(l => RL.idOf(l) === d)`) is false and D7 goes to
`merge.addNew`. The page-mode loop (line 196, `if (tn == null || to == null) continue`) never sets `pageMode` for a file
one side lacks, so the apply step (line 367, `if (!pageMode.has(f)) { topInsert(f, a.line); continue }`) tries to insert
a row into the page, and `topInsert` dies.

**Fix.** At line 239, also skip `addNew` when the taken-whole full-text file (`${FULL_DIR}/${o.area}`) already holds d
— the row is already where it belongs. And in the apply step, treat any area file that is a page (`RL.isPage(textOf(f))`)
as page mode, so a row is never aimed at a page whatever route set it. Self-test case: a new area created as a page on
the other side, merged both ways.

**Reproduced:** yes, both directions (fails into `main`, passes into `a`).

### F4 — MEDIUM — PLACE ON THE PAGE misses rulings the short-line side retired or moved out (misleading instruction)

**Failure.** Area `other` is converted to a page on one branch (stating D5 and D6); on the other, still in short lines:
- D6 marked SPENT and retired: `--merge` in either direction exits 0, lists nothing, and the page still states D6 as a
  rule in force; the gate passes.
- D6 marked REPLACED BY D5 and retired: nothing listed, but the gate's "stale" check then catches it (so only the
  instruction is missing here).
- D5 moved out to `general` with `--move-rows`, merged into the short-line branch (page taken whole): nothing listed, the
  page still states D5 as `other`'s rule; the gate passes. (Merged the other way, MOVE ON THE PAGES does print.)

The plan's §5 promise is that what the short-line side changed in a converted area is listed to place on the page; a
retirement or a move out is such a change, and the page goes on stating it.

**Cause.** `raptor-port/scripts/backlog-archive.mjs:214–224` — the 'theirs' listing iterates only rulings still in the
area on the short-line side (`if (areaOf(N, d) !== area) continue`), so one retired or moved out is never seen; the
'ours' side lists only `addNew` and `replaceFull` (lines 369, 374–375), and the retire loop (line 385) lists nothing.
The gate does not catch the SPENT case because its stale check (`docsize-rulings.mjs:268`) reads only REPLACED BY.

**Fix.** For each page-mode area, list every ruling live in the area at the base that the short-line side has since
retired or moved out, with the page lines that cite it (`RL.statementsOf(pageText).filter(s => s.cites.has(d))`), as
"retired on <side>: take it off the page" / "moved to <area> on <side>: move the line". Self-test cases for both
directions.

**Reproduced:** yes, all three shapes, both directions.

### F5 — MEDIUM — a page line both sides edited stops `--merge` for good; the hand resolution is never read (wrong failure)

**Failure.** The commonest parallel case on a converted area: each branch records one new ruling in it and, as
DECISIONS.md tells it, adds the stating bullet at the end of the same section. `--merge` stops: "both sides edited the
same page line — resolve it by hand". Resolving the page by hand on disk (both bullets kept, git's markers gone) and
running `--merge` again gives the identical stop, every time. The full-text file and `DECISIONS.md` are left with git's
conflict markers, so there is no route through the tool at all. The same loop follows the "converted to a page on both
sides since the base" stop, whose message says "… by hand, then run this again".

**Cause.** `raptor-port/scripts/backlog-archive.mjs:194–210` (and `mergeLines`, 181–193) read the three versions only
from git (`show(newRef|otherRef|base, f)`); the working-tree file, where the hand resolution lives, is never consulted,
so a re-run sees the same conflict. The self-test (`docsize-selftest.mjs`, "a page line both sides edited stops the
command") checks only that it stops and writes nothing, not that a resolution gets through.

**Fix.** Before pushing either page conflict (line 190 and line 209), read the file on disk: if it is a page, holds no
`<<<<<<<` / `=======` / `>>>>>>>` line and differs from git's conflicted text, take it as the resolution
(`setText(f, w)`) and carry on; and say so in the stop message ("resolve it in the file itself, removing git's markers,
then run this again"). Self-test case: the stop, the hand resolution, the second run ending WRITTEN with both rulings
stated.

**Reproduced:** yes.

### F6 — LOW — a dash followed by a number reads as a second citation

**Failure.** `citesIn` reads `D1734 – 7 Nov 26` as citing D1734 and D7, and `D1500–02` as D1500 and D2. On a page, the
stray number is counted as stated (a wrong pass for that ruling, under F1's reading), flagged stale, or reported as "no
ruling". No area file has the shape today.

**Cause.** `raptor-port/scripts/docsize-rulings.mjs:191–195`: the range pattern takes any number after a dash; when the
upper end is lower than the lower, the `else` branch adds both ends as citations.

**Fix.** Treat `D<lo> – <hi>` as a range only when `hi > lo` (or the second end carries its own `D`); otherwise cite only
`D<lo>`, and do not add `hi` to `named`.

**Reproduced:** yes (the function called directly).

## Questions (not findings — each needs the plan's author to say what was meant)

1. **The seam check probes one file per seam** (`docsize-rulings.mjs:165–184`): one probe file inside the area, one on
   the seam. An area file could keep a `paths:` entry for a seam file the probe does not use, and a seam file could miss
   one the area needs, and both pass. Is one probe per seam the intended strength?
2. **A seam file deleted after step 2 is never reported** — the size ceilings skip a missing seam file silently. Should
   a registered seam file that no longer exists fail the gate?
3. **`--reads` measures the walk-ledger's sizing step at 472 tokens; plan §1 says 1,620.** The section it reads
   (`docs/walk-ledger.md` lines 14–29, 1,276 bytes) may be narrower than the plan meant. Every other figure matched the
   plan to within a token (feature-impact §1 + §3: 28,855 against 28,856). Which section should the sizing step cover?
4. **A section is found by `startsWith`** in `docsize-reads.mjs` (`partOf`): `## 1.` would match `## 10.` if the latter
   came first. Not so in any file today.
5. Cosmetic, recorded only: a new full-text file made by `ensureFull` for a page's area gets the header text written for
   a short-line area.

`--reads` otherwise checked out: its glob matcher handles every real `paths:` shape (`**/`, a trailing `/**`, `*`, comment
lines), each file is counted once, in the first column that loads it, and a missing heading or file is reported.

## D1739 — its short line against its full row

The short line is the full row's first bold sentence, word for word: its scope (every step of the rules diet that
rewrites, shortens or summarises a rule — a new short text, a checklist, a page), both readers each blind to the other,
what they read for (whether any meaning changed), and its authority ("his call for those steps, made now (D1734)") all
survive; nothing is added. **It drops one condition** the full row carries in its reading (2): if Astra cannot run (his
ChatGPT plan's limits), he is told before the step goes on — never on without that read — and Sol 6.1 is not called.
That is a fallback and an exclusion a chat acting on the short line alone would not know. (Reading (1), that a step that
rewords nothing keeps the one Opus reader under D1736, is implied by the scope.) D1738's short line has the same
omission. Also: D1734's full row is marked NARROWED BY D1738 but carries no mark for D1739, which uses the same "his
call" more widely; D1734's short line shows only "— changed by D1738".

**Verdict:** faithful in meaning but incomplete — add "; if Astra cannot run, he is told before the step goes on" (it
fits under 350 characters), the same to D1738, and D1739's mark on D1734's full row.
