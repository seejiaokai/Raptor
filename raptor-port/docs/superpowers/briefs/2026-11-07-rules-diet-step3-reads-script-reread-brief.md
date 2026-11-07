# Brief — the second read of `docsize --reads` taught step 3's reads (D1736, 7 Nov 26)

**You are a fresh reader.** You did not write this change and you have not read it before. Read only; change no file;
commit nothing. Your final message is your report.

**What D1736 asks:** a change to the document check is tested, its self-test gains a case for each new check, and it is
read by one fresh reader before it is switched on. The first reader read it on 7 Nov 26 and found 1 high, 2 medium and 6
low (`C:\Users\User\AppData\Roaming\Claude\side-session-notes\local_4ee39652-1602-4caa-9846-f5f9cd5af150\step3-reads-script-read-opus.md` —
read it). The builder has changed the script for each. You check that each fix holds, and look for anything new.

**The change:** in the worktree `C:\Users\User\projects\Raptor\.claude\worktrees\dreamy-maxwell-a0acf7`,
`git diff cf81dc275 -- raptor-port/scripts/docsize-reads.mjs raptor-port/scripts/docsize-selftest.mjs` (uncommitted, in
the working tree). What it is for: `node raptor-port/scripts/docsize.mjs --reads` (run from `raptor-port/`) reports, in
tokens, what a chat reads. Since step 3 (his D1735) three documents are read by part, as the texts that route them say:
the bug-check order by the checklist `raptor-port/docs/bug-check-checklist.md`; the design guide
`raptor-port/docs/design-practices.md` by `.claude/rules/ui-design.md` §Which part of the guide to open; the ripple map
`raptor-port/docs/feature-impact.md` by its head note "How to read it". `CHECK_READS` states one case for each, which
`partOf` cuts. The report is a measure, never a gate (D141).

**What the builder changed (check each against the first report):**
1. The old case's wording (high 1) — fixed before; still passing?
2. The design case is now "a new control and its words" — §1b, §2 and §4's "One mark, one look" added (medium 2).
3. Cases with the near-miss first for spans and rows, a span's `to` searched from the top when it has no `from`, `upTo`
   with other parts, the grep's empty match and its `u` flag, the label when whole, and every part's name in the label
   (medium 3). The builder checked that a copy with each fault put back fails a case; check that yourself if you doubt it.
4. The bug-check order's case now counts §0a, §4 whole, §10, and lessons 1, 3 and 22 (low 4, low 5) — the checklist's
   head now says a step's parentheses never narrow a section, so a section a step names is read whole.
5. The ripple map's case now counts the eight §1 rows Flow A names (low 6), three drift-seams a schedule cell edit writes
   through or reads, and the one dated part in its subject.
6. `find(to, from == null ? 0 : at + 1)`; a span with no `to` runs to the file's end (low 7, low 9).
7. The grep is now a list of `{ re, from, to, n, name }` — a range as sed -n takes it, whole numbered lines for `-n`, a
   plain name in the label — and the ripple map's case gives the note's three searches by their names (low 8).
8. A new part, `paras`: a paragraph or list item, ending at a blank line or a new block at the margin. The ripple map's
   head now ends at the note's own end, not at the first dated paragraph (low 9).

**What to look for:**
- Does each part take exactly the lines the routing text says, on the real documents? Is any case counted that the
  routing text does not name for it, or any part it names left out? Is each `why` true of what is counted?
- Does `paras` end correctly on the real documents — the note, the keyboard flow's paragraph, the "One mark, one look"
  bullet — and in a case where it would run on or stop short?
- Does each of the note's three searches, as `partOf` runs it, print what the note's own command prints (run the
  commands in Git Bash from `raptor-port/` and compare)?
- Is any old behaviour changed — the other reads' figures (the walk ledger, walk scripts, performance guide) unchanged?
- Does `node raptor-port/scripts/docsize.mjs --reads --verbose` print any NOTE line?
- Do the new self-test cases test what their names claim?

**Not a finding:** a problem that lives only in data already stored, when the code is already correct going forward
(D56). A case figure being larger than the plan's estimate — that is what the measure is for.

**Your report:** each finding with its place, the concrete failure, how you checked it, and the fix; ranked high, medium,
low; then what you checked and found right. A claim is a finding only with a concrete failure, its cause and its fix (D489).
