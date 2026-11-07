# The rules diet's step 3 — the fresh Opus read of the reads measure taught the new reads (D1736, 7 Nov 26)

Read the uncommitted change on `claude/rules-diet-step-3-f1a069` from the brief
`2026-11-07-rules-diet-step3-reads-script-brief.md`, by a fresh Opus helper that wrote none of it. 41 tool uses, about
10 minutes. Saved as it came back; what was done about each finding: the plan's §Step 3 review log.

---

**High**

1. **An existing self-test case now fails, so the Docs guard in CI will go red.**
   - Where: `raptor-port/scripts/docsize-selftest.mjs` line 981, the case "a check read of named sections takes each to the next heading of its level; a missing heading is reported".
   - Failure: it still matches the old wording, `/no heading "## 9\."/`. `measure` now writes `has no heading or line "## 9." (check) — that part counted as nothing`, so the regex no longer matches and the case reports "the missing heading was not reported".
   - How I checked: I ran all 19 `reads(...)` cases from lines 905–987 against the changed script, from a temp folder. 18 pass and this one is a MISS. `.github/workflows/docs-guard.yml` runs `docsize-selftest.mjs`.
   - Fix: change the regex to `/no heading or line "## 9\."[^\n]*counted as nothing/`. No other script reads that message; I searched the repo for it.

**Medium**

2. **The design guide's case is not a real words job.**
   - Where: `docsize-reads.mjs` line 59, the `design-practices.md` entry. The case is "words (§1's own text)", with no §1a and no §1b.
   - Failure: §1's own text says "§1, §1a and §1b together are THE WRITING GUIDE … used every time text in the app is written or changed" (D833). `ui-design.md` also sends shortening to §1a and new words to §1b. So a job that reads §1 alone changes no words.
   - It also clashes with the rest of the check column, which is reported as one job's read. The bug-check entry counts the door check (a new control), and a new control brings its own words (§1b, 6,019 tokens) and is opened, closed or typed in (§2, 1,190 tokens). So the design figure of 33,778 is a lean case summed with an upper one.
   - Fix: add `'### 1b.'` and `'## 2.'` to its sections (about 40,987), with the case "a new control and its words". Otherwise, narrow the bug-check case so the column describes one job.

3. **The tests claim the boundary rule for spans and rows, but no case would catch it breaking.**
   - Failure: I replaced the boundary check inside `find` with a plain `startsWith`, and every case still passes. Two case names claim this boundary ("never stops at **7.10 for **7.1"; "a row is its one line, matched to a boundary"). But in `SPANDOC` the wanted line always comes before its near-miss, and `| **Warn**` can never be the start of `| **Warnings**`.
   - Missing case: `partOf('**7.10 a\n**7.1 b\nc\n**7.2 d\n', { spans: [{ from: '**7.1', to: '**7.2' }] })` must give `'**7.1 b\nc'`. Without the boundary it gives `'**7.10 a\n**7.1 b\nc'`. Add that, its `**7.0a` twin, and a row case with the near-miss row first.
   - Other changes no case catches (fix: one case each):
     - a span's `to` searched from the top, or from the from-line itself;
     - `upTo` combined with other parts — ignored, or counted whole when missing;
     - the grep's empty-match filter and its `u` flag;
     - the label when a read is counted whole;
     - the sections and grep names in the label.

**Low**

4. **The bug-check order's why misses §0a.**
   - Where: line 56, which says "each section the checklist names for it".
   - Failure: §0a (1,168 tokens) is named by checklist steps 1 and 3, which apply at every tier. The checklist's head says "Open every section a step names, whole". It is not counted.
   - Meanwhile §3 (1,199) is counted, although the checklist's own Background line lists §3 as background. The checklist contradicts itself here: step 8 cites §3, the Background line excludes it. That is a document fix for you.
   - Fix: add `'## 0a.'`, or say in the why that the always-loaded `bug-check.md` stands in for it.

5. **§7.11's lessons (7,028 tokens) are counted as none.**
   - The why states this, so it is honest. But checklist step 9 makes going through the lessons part of every WALK, opening the full text of each that applies. On a screen walk some nearly always apply: lesson 1 (more than one state), lesson 3 (after every press), lesson 22 (judged by what is drawn).
   - So zero is the floor, not the typical case. Fix: count a stated few through spans, or tell him "plus up to 7,028".

6. **The ripple map's case reads Flow A but only four of the surfaces Flow A names.**
   - Flow A ends at warnings, undo/redo, history, week + board, highlights, and publishing/AL. The case counts Warnings, Undo / redo, Edit Schedule and Publishing / AL.
   - Left out: "The one changes window + the change history", "Scheduler board", "Post-render decoration" and "View-only Schedule" — 1,267 tokens, so 7,431 should be about 8,700.
   - Fix: add those rows, or say "four of the rows Flow A names".
   - Both of these are judgement calls, not errors: the case reads no drift-seam (Flow A ends in the published-day path), and "Schedule keyboard flow" (331 tokens) is arguably in a typed cell edit's subject.

7. **A span with no `from` skips line 1 when looking for its `to`.**
   - Where: line 108, `find(to, at + 1)` with `at` = 0.
   - Failure: `partOf('## 0. zero\nz\n## 0. again\ny\n', { spans: [{ to: '## 0.' }] })` takes `'## 0. zero\nz'`, where `{ upTo: '## 0.' }` takes `''`. With no second match, it reports a heading as missing when the heading is there.
   - Fix: `find(to, from == null ? 0 : at + 1)`. No current read is affected.

8. **The grep's label does not print what is counted.**
   - Where: line 153. The label shows the JavaScript pattern, `grep -o ^\| \*\*[^*]*\*\*`.
   - Failure: pasted into GNU grep, where `\|` means "or", it prints 234 lines on `feature-impact.md`. The note's own command, `grep -o '^| \*\*[^*]*\*\*'`, prints 46.
   - Fix: show the note's command in the label.

9. **The ripple map's head span can grow without warning.**
   - Where: line 62. The span ends at the first dated paragraph (`**Schedule keyboard flow`), not at the end of the note.
   - Failure: a dated paragraph later inserted above it would be counted as part of "the note", with no NOTE line.
   - Also: a span with no `to` gives a garbled NOTE (`undefined" (the end of the span from "…`). No entry has one today. Say spans need a `to`, or treat a missing one as the end of the file.

**Checked and found right**

- **Boundary rule in the code:** correct on near-miss-first inputs — `**7.0` never takes `**7.0a`, `**7.1` never takes `**7.10`, `## 1.` never takes `## 10.`.
- **Fenced lines:** skipped for `upTo`, sections, spans and rows; read by the grep.
- **Missing parts:** a missing span start, span end or row is reported and counted as nothing. A missing `upTo` alone is counted whole and says so. `upTo` combined with other parts and missing says "counted as nothing", which is true.
- **Assembly:** overlaps are counted once, in file order, with the grep's text after the parts. The grep's text matches real `grep -o` on `feature-impact.md` byte for byte (46 lines), drops empty matches as grep does, and handles CRLF line endings.
- **Old behaviour unchanged:** old and new `partOf` give identical text and missing lists on the six real documents with `upTo`, sections, or no options. The walk ledger, walk scripts and performance guide figures are unchanged (1,227, 13,220, 11,025).
- **The live measure:** every named heading or line resolves to exactly one correct line, none inside a fence, and the run prints no NOTE lines.
- **The bug-check order's parts:** otherwise match the checklist for a WALK. That is §2a, §2b, §5, §6, §7.0–§7.10, §8, §9 (not §9a), §11, §12, and §4's span (lines 322–386: the fan-out, the walk-round folders, the table of what each part holds still, the Sonnet walkers). §5's table confirms a WALK has no code read, so leaving out §4's readers and §4a is right.
- **The design guide:** the head, §0, §9, §3 and §6 match `ui-design.md`.
- **The ripple map:** the head note, §3 whole, the note's search, Flow A and the single funnels match the note.

My scratch scripts are in the session scratchpad's `readsreview\` folder (`run.mjs`, `mutate.mjs`, `sizes.mjs`). I changed no repo file.
