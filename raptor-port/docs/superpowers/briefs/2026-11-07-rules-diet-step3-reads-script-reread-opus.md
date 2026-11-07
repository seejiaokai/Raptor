# The rules diet's step 3 — the second fresh Opus read of the reads measure, after the first read's fixes (D1736, 7 Nov 26)

Read the change `cf81dc275` → the working tree (committed during the read as `47cf3ef81`, byte for byte the same) from
the brief `2026-11-07-rules-diet-step3-reads-script-reread-brief.md`, by a second fresh Opus helper, given the
first one's findings to check each fix against. Saved as it came back; what was done about each finding: the plan's §Step 3 review log.

---

**What was read:** the change from cf81dc275 to the two scripts. While I was reading, the builder committed it as 47cf3ef81. I checked that the committed `docsize-reads.mjs` and `docsize-selftest.mjs` are byte-for-byte what I reviewed. I changed no repo file and committed or pushed nothing. My scratch scripts are in the session scratchpad's `reread\` folder (`cases.mjs`, `mutate.mjs` — 25 faults put back one at a time, `lines.mjs`, `grepcmp.mjs`, `fixcheck.mjs`).

**Result:** no high findings, 1 medium, 4 low. All 27 reads cases pass, and the first read's high 1 still passes.

## Medium

**1. Two of the faults the first read's medium 3 named still pass every case.**
- Where: `docsize-selftest.mjs` line 977, the case "a read's label is empty when it is counted whole, and names every part…"; `docsize-reads.mjs` line 121, `find(to, from == null ? 0 : at + 1)` — no case covers where `to` is searched when the span has a `from`.
- Failure (a), the label when a read is counted whole: with `p.whole ? '' : names.join(' + ')` (line 188) replaced by `names.join(' + ')`, every case still passes. The case's "whole" read is `{ f: 'd.md' }`, which has no parts, so its list of names is empty either way. The read that matters is a missing `upTo` alone, counted whole: with the fault it would be labelled "(up to ## 99.)" while the whole file is counted.
- Failure (b), where `to` is searched when there is a `from`: with line 121 changed to `find(to, 0)` or `find(to, at)`, every case still passes. The builder's cases cover only the no-`from` direction. The commit message says each fault was shown to fail on a copy; these two do not.
- How I checked: `mutate.mjs` ran the self-test's reads section on copies with each fault; both SURVIVED. The real code behaves correctly on both inputs; only the guard is missing.
- Fix (each checked by `fixcheck.mjs` to pass on the real code and fail on its faulty copy):
  - Whole label: add `{ f: 'd.md', upTo: '## 99.' }` to the label case's check reads and expect `part === ''`.
  - `to` standing before `from`: `partOf('**B x\n**A a\nb\n**B c\n', { spans: [{ from: '**A', to: '**B' }] })` must give `'**A a\nb'`; searched from the top, it gives `''`.
  - `to` that the from-line itself starts with: `partOf('**7.1 a\nb\n**7 c\n', { spans: [{ from: '**7.1', to: '**7' }] })` must give `'**7.1 a\nb'`; searched from the from-line, it gives `''`.

## Low

**2. A grep's range drops its `to` line, but `sed -n` prints it.**
- Where: the doc comment, line 99 ("…as a span takes them (sed -n's range)"); line 142, `for (let i = r[0]; i < r[1]; i++)`; the case name at line 972 ("…as sed -n's does").
- Failure: for `# T / ## 1. A / - **one** x / ## 2. B / ## 3. C`, `sed -n '/^## 1\./,/^## 2\./p' | grep -o '^## [0-9]'` prints `## 1` and `## 2`; `partOf` with `{ re: '^## [0-9]', from: '## 1.', to: '## 2.' }` gives only `## 1`. Whenever the pattern also matches the end line, the count is lower than the note's command prints. No current read is affected. The test cannot tell the difference.
- Fix: make a grep's range include its `to` line when `to` is given (capped at the file's end), as sed does, and add a case where the pattern matches the end line; or say in the comment and the case name that the `to` line is left out, unlike sed.

**3. The ripple map's case leaves out a drift-seam that a schedule cell edit writes through.**
- Where: `docsize-reads.mjs` line 64ff, and its `why`: "…the three drift-seams such an edit writes through or reads".
- Failure: `#### Editors, snapshots, the reference copy, labels, SANS and a person's category` (feature-impact lines 941–1016, about 2,126 tokens) is not counted. Its bullet "What a write STORES vs what a snapshot HOLDS" is about `txtSet` normalising a typed time and `setSlotVal` storing a callsign — the funnel Flow A writes through, compared against the issued snapshot on a published day. "Three editors over one list" names the week cell and the board cell. "The history bubble is wired to the board wrap" ties into HISTORY, which Flow A ends at. The note's rule is "read each funnel or drift-seam the change writes through, reads, crosses or could copy". So the figure, 15,036, should be about 17,160, and "the three" four.
- Fix: add `'#### Editors, snapshots'` to `sections` and say "four drift-seams"; or narrow the `why`.

**4. The design case "a new control and its words" leaves out §8.**
- Where: line 60, the `design-practices.md` entry.
- Failure: `ui-design.md` names §8 for "A look or review, or any page of mock-ups put to him". D1625 (and checklist step 5, which the bug-check case counts for this same job) makes a new button "drawn and shown to him as a mock-up before it is built". §8 holds the rules for that page (for example "What he should look at stands at the top of the page", D1237). The same check column counts the mock-up step on the bug-check side but not the design guide's section for it: §8, lines 648–671, 1,157 tokens.
- Fix: add `'## 8.'` and "§8 (the mock-up put to him first, D1625)" to the `why`; or say the mock-up round is not counted.

**5. Two cases test part of what their names claim.**
- "A paragraph runs to a blank line or the next block at the margin" (line 966) tests only a bold start and a list item. Taking a heading, a table row, a numbered item or a fence out of `BLOCK` (line 106) passes every case — four faults SURVIVED. No live paragraph depends on these. Fix: one more input, such as `'**A.** a\n## 2. b\n| x |\n'`, expecting `'**A.** a'`, and the same with a table row and a fence first.
- The `-n` path's u flag (line 144, `new RegExp(g.re, 'u')`) is untested; only the `-o` path's is. Fix: add one `n: true` input with `\p{L}`.

## Checked and found right

- The first read's high 1: the case at line 1010 passes. All 27 reads cases pass on the change.
- Each first-read point now holds, apart from medium 1 above: medium 2 (§1b, §2 and "One mark, one look" counted); medium 3 (the near-miss-first cases fail on a plain `startsWith`; the upTo-with-parts cases catch both faults; the empty-match and `-o` u-flag faults are caught; the label's part names are caught); low 4 (§0a counted; the checklist's Background line lists §1, §2, §9a and §13, no §3); low 5 (lessons 1, 3 and 22 counted); low 6 (the eight rows); low 7 (line 121's no-`from` case fixed); low 8 (plain names); low 9 (the head ends at the note's own end; a span with no `to` runs to the end, labelled "… the end").
- The bug-check case matches the checklist for a WALK of a screen with a new control: §0a, §2a, §2b, §3, §4, §5, §6, §7.0–§7.10, §8, §9, §10, §11, §12, each whole; §4 (lines 198–397) stops before §4a (line 398), rightly left out; the span **7.0 to **7.11 (lines 640–849) takes §7.0a; lessons 1, 3 and 22 are exactly lines 857–860, 864–866 and 993–1001; the "second 23" (line 1048) sits inside §8, counted whole; nothing outside what the checklist names is counted, and the `why` is true of what is counted.
- The design case: the head is lines 1–28; §0, §1b (to §2), §2, §3, §6 and §9 each take exactly their section; §1's own text (lines 91–201) holds §1's point on feedback (line 136); the "One mark, one look" paragraph takes exactly lines 537–552 and stops at "- **No mark…".
- The ripple map case: the head plus the note is lines 1–19 (the paragraph ends at the blank line 20); the keyboard-flow paragraph is lines 21–31 and stops at "**Phone schedule navigation"; the §1 head (lines 120–127), the eight rows, Flow A, §3, the single funnels and the three named seams each resolve to one correct line or range; the note's three searches, run by `partOf`, are byte-identical to the note's own commands run in Git Bash from `raptor-port/` (48, 23 and 13 lines); the fourth list, the titles of the dated parts, gives 9 lines — the script's own model, the note gives no command for it, and its label says so plainly.
- The paragraph part on harder inputs: a list item keeps its indented lines and a nested list; it stops short at a wrapped line that begins with `**` or "7. ", and at a loose list item's second paragraph; it runs on into a blockquote. Each follows the stated rule, and none touches the three live paragraphs.
- Old behaviour unchanged: the old script (cf81dc275) and the new one give identical start and task columns; the walk ledger, walk scripts and performance guide figures are unchanged (1,227, 13,220, 11,025), and the checklist's (4,534); only the three step-3 reads changed (bug-check order 23,080 → 30,651, design guide 33,778 → 41,737, ripple map 7,609 → 15,036); a plain-string grep still reads every line, fenced ones too.
- `node scripts/docsize.mjs --reads --verbose` prints no NOTE line and exits 0.
- The other new cases catch their faults: near-miss first for spans and rows; a span with no `from`, and with no `to`; upTo with other parts; the grep's range and `-n` numbering; the label's paragraph, section and grep-name parts.
