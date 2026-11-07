# Brief — the blind read of the rules diet's step 4, part 1: the general rulings as a page (7 Nov 26)

**You are one of two readers, each blind to the other (his D1739).** Do not open, search for or read any file named
`*step4-read-opus*` or `*step4-read-astra*`. Read only; change no file; commit nothing. Your final message is your
report.

**What changed** (the branch `claude/rules-diet-step-4-7b92cb`; the whole change: `git diff 6e6c55667 HEAD -- .claude
DECISIONS.md DECISIONS-ARCHIVE.md AGENTS.md raptor-port/CLAUDE.md raptor-port/scripts/docsize.mjs`). The general rulings file
`.claude/rules/decisions/how-we-work.md` — loaded in every chat — was 216 one-line rulings in a table; it is now a page
of how it works now: each rule stated once, the rulings behind it cited after it in brackets (his D1735, approving the
plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` — read its §2 and §3; the approved sample it was
built from: `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-sample-how-we-work.md`). A ruling may instead be
stated in one of the five always-loaded rule files (`.claude/rules/shipping.md`, `doc-structure.md`,
`record-decisions.md`, `plain-language.md`, `bug-check.md`); those five changed only by added citations and three
dropped "replacing Dxxx" notes — their rewrite as checklists is a later part. Ten rulings were archived as spent
one-off permissions (now in `DECISIONS-ARCHIVE.md`, each with a `**SPENT 7 Nov 26 — …**` mark): D86, D602, D832, D972,
D973, D974, D1556, D1566, D1659, D1736. The builder's account — every part of every old ruling mapped to the line that
states it now — is `raptor-port/docs/superpowers/briefs/2026-11-07-rules-diet-step4-account.md`: use it as a map, and
check it; do not trust it.

**The authority is the full rows**, `.claude/decisions-full/how-we-work.md` (his words, the readings told to him, what
each ruling means) and, for the ten archived, `DECISIONS-ARCHIVE.md`. Search them with the shell —
`grep -h '^| D790 |' .claude/decisions-full/*.md DECISIONS-ARCHIVE.md` — a search tool may hide a long row; never read
those files whole. The old file: `git show 6e6c55667:.claude/rules/decisions/how-we-work.md`.

**The question, for every line of the page and every changed line of the five files: does it say more, less or
other than the rulings it cites?** A condition, an exception, a scope or a "who does what" dropped, narrowed, widened
or bent; a rule stated as it was before a later ruling changed it (the old short lines' "— changed by" tails name the
later ones); a part of an old ruling that no line now states. Ask what is MISSING, not only whether what is there is
right. D138: a summary must never change what the original meant.

1. **The page against the old file, ruling by ruling.** Every old ruling: is each part stated, on the page or in one of
   the five files? Read the full row wherever the old short line has "— changed by", and for every ruling dated 7 Nov 26
   (D1732–D1744 — the sample predates most of them). Is each citation on the line that states that rule?
2. **The archivals.** For each of the ten, read its row sentence by sentence: is it really spent — is every "if",
   "until", "still" or standing "no" in it carried by a live ruling? Two calls to weigh in particular: **D1736** (his
   permission to change the document check and ruling scripts for the diet — archived because its own row says "spent
   when the plan's steps 1 and 2 have landed", which they have; the plan and sample did not propose it), and **D136**
   (the sample proposed it replaced by D1735; it was kept live, stated with D1735 beside it, because D1735's row says
   it "narrows" D136 as each area converts). Is either call wrong?
3. **The five files' changes** (`git diff 6e6c55667 HEAD -- .claude/rules/*.md`): does any added citation, or any
   dropped "replacing …" note, change what the line requires, or leave a line stating a rule as it stood before the
   ruling now cited beside it?
4. **Text with no number** — the old file's head (its framing, the "Also read — D25" pointer, the screen-design rulings
   pointer): is each kept where an agent will meet it?
5. **The pointers** that described every rulings file as one short line per ruling — `AGENTS.md` (item 5 and the
   recording bullet), `raptor-port/CLAUDE.md` (the map row for the rulings), `DECISIONS.md` (its head): does each now
   send a reader (Claude or Codex) to the right shape and the right recording steps?

**Not a finding (D56):** a problem that lives only in data already stored. Not a finding either: the page's length or
style as such (D141 — no size targets), or that the five files are not yet checklists (a later part).

**Report:** findings first, most serious first — each with the ruling, the line (file and a few words to find it), what
the full row requires, what the line says, a concrete fix in one sentence, and a severity (high: an agent following
the page would do what he ruled against or skip what he ruled for; medium: a condition or scope bent; low: wording or
citation). Then: how many rulings you checked against their full rows, and which archivals you confirm. Plain words.
