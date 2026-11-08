# Brief — the blind read of the rules diet's step 5a: the OIL rulings as a page (8 Nov 26)

**You are one of two readers, each blind to the other (his D1739, D1763 "keep two").** Do not open, search for or read
any file named `*step5a-read-opus*` or `*step5a-read-astra*`. Read only; change no file; commit nothing. Your final
message is your report.

**What changed** (the branch `claude/rules-diet-step-5a-oil`, at the commit that adds this brief; the whole change:
`git diff a6265cae0 HEAD -- .claude AGENTS.md DECISIONS.md raptor-port/CLAUDE.md`). The OIL area's rulings file,
`.claude/rules/decisions/oil.md`, was a table of 49 short lines — one per ruling — with an "Also read" paragraph
(pointers to rulings of other areas that bear on OIL) and an "Also know" paragraph. It is now a page, "OIL (off in
lieu) — how it works now": each rule stated once, the rulings behind it cited after it (his D1735, approving the plan
`raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` — read its §2 and §5). The page loads exactly when the
table did (its `paths:` are unchanged), so what it says is what every chat working on OIL, the Leave War, the
placeholder pucks or publishing will act on. The old file: `git show a6265cae0:.claude/rules/decisions/oil.md`. The
builder's account — every part of every ruling mapped to the page line that states it — is
`raptor-port/docs/superpowers/briefs/2026-11-08-rules-diet-step5a-account.md`: use it as a map, and check it; do not
trust it. Four small edits name OIL as a page: `DECISIONS.md` (its head), `AGENTS.md` (item 5), `raptor-port/CLAUDE.md`
(the map row on rulings) and the head of `.claude/decisions-full/oil.md`.

**The authority:** each ruling's full row — `.claude/decisions-full/*.md`, and `DECISIONS-ARCHIVE.md` for the archived
ones (D738, D744 and D34 among them) — searched with the shell (`grep -h '^| D592 |' .claude/decisions-full/*.md
DECISIONS-ARCHIVE.md`); a search tool may hide a long row; never read those files whole. A mark in a full row
(`— NARROWED … BY Dn`, `ANSWERED`, …) says how the rule stands now; where two rulings clash, the later one wins (D90).
OIL is small (49 rulings): read every OIL full row's meaning cell, not only the old short line.

**The question, for every part of every ruling: does the page say more, less or other?** A rule, a condition, an
exception, an "only", "never", "unless", "until", "still" or "both", a scope, a default or a "who does what" dropped,
narrowed, widened or bent; a quoted wording on screen changed; a ruling cited on a line that states it as it stood
before a later ruling changed it (the document check sees the numbers only, never the meaning); two lines that state one
rule and disagree. Ask what is MISSING, not only whether what is there is right. D138: a rewrite must never change what
the original meant.

1. **Every OIL ruling, its full row against the page.** The ones most changed by later rulings first: D15, D24, D28,
   D32, D43, D470 (D755 changes it — its full row is in the scheduler's file), D781, D783, D818, D592.
2. **The old "Also read" and "Also know" paragraphs, item by item:** is each carried — a pointer that says no more and
   no less than its ruling, in its own area's file, says today — or dropped with a reason that holds?
3. **The page's own claims:** its head (what it says about loading, the full rows and searching them); its "Settled"
   section (what is settled, and that nothing settled is presented as open, or open as settled); its "From other areas"
   pointers (each one true of the ruling it names).
4. **The four small edits:** does each say what is now true — How we work and OIL the two pages, the others still in
   short lines?

**Not a finding (D56):** a problem that lives only in data already stored. Not a finding either: the page's length or
style as such (D141 — no size targets), nor whether a ruling is built yet — the page states rulings, built or not, as
the table did.

**Report:** findings first, most serious first — each with the ruling (or the old paragraph's item), the page line (a
few words to find it), what the full row requires, what the page says, a concrete fix in one sentence, and a severity
(high: an agent following the page would do what he ruled against or skip what he ruled for; medium: a condition or
scope bent; low: wording or citation). Then: how many rulings and parts you checked, and which you found whole. Plain
words.
