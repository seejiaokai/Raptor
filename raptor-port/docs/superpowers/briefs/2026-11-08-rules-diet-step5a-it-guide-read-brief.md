# Brief — the blind read of the rules diet's step 5a: the IT flow guide's rulings as a page (8 Nov 26)

**You are one of two readers, each blind to the other (his D1739, D1763 "keep two").** Do not open, search for or read
any file named `*it-guide-read-opus*` or `*it-guide-read-astra*`. Read only; change no file; commit nothing. Your final
message is your report.

**What changed** (the branch `claude/rules-diet-step-5a-it-guide-8b561f`, at the commit that adds this brief; the whole
change: `git diff cd8a5dd67 HEAD -- .claude AGENTS.md DECISIONS.md OUTSTANDING.md raptor-port/CLAUDE.md`). The IT flow
guide's rulings file, `.claude/rules/decisions/it-flow-guide.md`, was a table of 9 short lines — one per ruling — under a
head. It is now a page, "The IT flow guide — how it works now": each rule stated once, the rulings behind it cited after
it (his D1735, approving the plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` — read its §2 and
§Step 5a, the OIL trial and its lessons). The page loads exactly when the table did (its `paths:` are unchanged), so what
it says is what every chat working on the guide — its deck, the scripts that shoot and build it, its plans — will act on.
The old file: `git show cd8a5dd67:.claude/rules/decisions/it-flow-guide.md`. The builder's account — every part of every
ruling mapped to the page line that states it — is
`raptor-port/docs/superpowers/briefs/2026-11-08-rules-diet-step5a-it-guide-account.md`: use it as a map, and check it; do
not trust it (it was written by the chat that wrote the page). Four small edits name the IT guide as a page: `DECISIONS.md`
(its head), `AGENTS.md` (item 5), `raptor-port/CLAUDE.md` (the map row on rulings) and the head of
`.claude/decisions-full/it-flow-guide.md`. One line was added to the backlog item `[ITFLOW-OIL-RESHOOT]` in
`OUTSTANDING.md` (the deck and its README still show the Leave War's old stages).

**The authority:** each ruling's full row — `.claude/decisions-full/*.md`, and `DECISIONS-ARCHIVE.md` for archived ones —
searched with the shell (`grep -h '^| D413 |' .claude/decisions-full/*.md DECISIONS-ARCHIVE.md`); a search tool may hide a
long row; never read those files whole. A mark in a full row (`— NARROWED … BY Dn`, `ANSWERED`, …) says how the rule
stands now; where two rulings clash, the later one wins (D90). The IT guide is small (9 rulings, D403 and D410–D417): read
every full row's three cells — his words, what it means (including the agent's readings and "how it is drawn"), where it
lives — not only the old short line. The guide's README, `raptor-port/docs/it-flow-guide/README.md`, is the home each row
names; the archived item `[IT-FLOW-GUIDE]` in `OUTSTANDING-ARCHIVE.md` holds his original ask.

**The question, for every part of every ruling: does the page say more, less or other?** A rule, a condition, an
exception, an "only", "never", "unless", "until", "still" or "both", a scope, a default or a "who does what" dropped,
narrowed, widened or bent; a thing the deck must show left out; an agent's reading or call stated as his rule, or his rule
stated as the agent's call; a ruling cited on a line that states it as it stood before a later ruling changed it (the
document check sees the numbers only, never the meaning); two lines that state one rule and disagree. Ask what is
MISSING, not only whether what is there is right. D138: a rewrite must never change what the original meant.

**Step 5a's two lessons, for you too** (the plan's §Step 5a, "The two reads compared"): a wording on screen, a control, a
slide part or a scope is a requirement, never "detail" — check every place the account marks **detail**; and read the
rulings the page points to in their own areas — here the Leave War's D1177, D1225, D1166 and D418 (its short lines in
`.claude/rules/decisions/leave-war.md`, its full rows in `.claude/decisions-full/leave-war.md`) — and look for any ruling
of another area that bears on the guide and is not pointed to.

1. **Every IT guide ruling, its full row against the page.** D413 first (D1177 narrows it — what the Leave War's flow is
   now, and who does each step), then D412 and D410 (the agent's calls and the spent sample), then the rest.
2. **The page's own claims:** its head (what it says about loading, the full rows and searching them); its "Settled"
   section (what is settled, and that nothing settled is presented as open, or open as settled; that the spent sample is
   not stated as standing); its "From other areas" pointers (each one true of the ruling it names, no more and no less
   than its own area's short line and full row say today).
3. **The account itself:** a part it marks **stated** that the page does not carry; a part it marks **detail**,
   **superseded** or **spent** that is a live requirement; a part of a full row it never lists.
4. **The four small edits and the backlog line:** does each say what is now true — How we work, OIL and the IT guide the
   three pages, the others still in short lines; does the backlog line say what D1177 and D403 say?

**Not a finding (D56):** a problem that lives only in data already stored. Not a finding either: the page's length or
style as such (D141 — no size targets), nor whether the deck is re-shot yet — the page states rulings, built or not, as
the table did.

**Report:** findings first, most serious first — each with the ruling, the page line (a few words to find it), what the
full row requires, what the page says, a concrete fix in one sentence, and a severity (high: an agent following the page
would do what he ruled against or skip what he ruled for; medium: a condition or scope bent; low: wording or citation).
Then: how many rulings and parts you checked, and which you found whole. Plain words.
