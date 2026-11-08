# Brief — the blind read of the rules diet's step 5a: the People & accounts rulings as a page (8 Nov 26)

**You are one of two readers, each blind to the other (his D1739, D1763 "keep two").** Do not open, search for or read
any file named `*people-read-opus*` or `*people-read-astra*`. Read only; change no file; commit nothing. Your final
message is your report.

**What changed** (the branch `claude/rules-diet-step-5a-people-1288c3`, at the commit that adds this brief; the whole
change: `git diff 97eaa5251 HEAD -- .claude AGENTS.md DECISIONS.md raptor-port/CLAUDE.md`). The People & accounts
rulings file, `.claude/rules/decisions/people-accounts.md`, was a table of 80 short lines — one per ruling, D149 to
D1709 — under a head with an "Also read" paragraph and a "From the Leave War" list of 12 pointers. It is now a page,
"People & accounts — how it works now": each rule stated once, by topic, the rulings behind it cited after it (his
D1735, approving the plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` — read its §2 and both
§Step 5a sections, the OIL trial and the IT flow guide, with their lessons). The page loads exactly when the table did
(its `paths:` are unchanged): with any accounts, sign-in, Admin → Users, Quals, one-door or posting file, and with the
Leave War's posting and people files — so what it says is what every chat working there will act on. The old file:
`git show 97eaa5251:.claude/rules/decisions/people-accounts.md`. The account — every part of every ruling mapped to the
page line that states it — is `raptor-port/docs/superpowers/briefs/2026-11-08-rules-diet-step5a-people-account.md`:
use it as a map, and check it; do not trust it (a fresh helper wrote it against the first draft, `c9bcf22fa`, and fixed
the page; its table still describes that draft, each gap with its **Fixed:** note). Two full rows gained marks in this
change, found missing by the draft: D149's and D218's, NARROWED by D1651 (the Scheduler tick an admin's) and D218's by
D1510 (Management). The scheduler's D212 keeps a stale clause on the same point, left for the scheduler's own page —
not a finding here. Four small edits name People & accounts as a page: `DECISIONS.md` (its
head), `AGENTS.md` (item 5), `raptor-port/CLAUDE.md` (the map row on rulings) and the head of
`.claude/decisions-full/people-accounts.md`.

**The authority:** each ruling's full row — `.claude/decisions-full/*.md`, and `DECISIONS-ARCHIVE.md` for archived ones —
searched with the shell (`grep -h '^| D287 |' .claude/decisions-full/*.md DECISIONS-ARCHIVE.md`); a search tool may hide a
long row; never read those files whole. A mark in a full row (`— NARROWED … BY Dn`, `ANSWERED`, …) says how the rule
stands now; where two rulings clash, the later one wins (D90). Read every full row's three cells — his words, what it
means (the rule, its conditions, the agent's readings), where it lives — not only the old short line. Where a row's home
names a reference document (`raptor-port/docs/ui-contracts.md`, `engine-rules.md`, `data-model.md` §11 the permissions
table, `notifications-register.md`, a mock-up under `raptor-port/docs/mock/`), open the section it names when the page's
line depends on it.

**The question, for every part of every ruling: does the page say more, less or other?** A rule, a condition, an
exception, an "only", "never", "unless", "until", "still" or "both", a scope (which screen, which sheet, which person), a
default or a "who does what" dropped, narrowed, widened or bent; a wording on screen or a control left out or changed; an
agent's reading or call stated as his rule, or his rule stated as the agent's call; a direction or a future plan stated
as built, or a built rule stated as future; a ruling cited on a line that states it as it stood before a later ruling
changed it (the document check sees the numbers only, never the meaning); two lines that state one rule and disagree.
Ask what is MISSING, not only whether what is there is right. D138: a rewrite must never change what the original meant.

**The lessons of step 5a so far, for you too** (the plan's two §Step 5a sections, "The two reads compared"):
- A wording on screen, a control, a scope or a who-does-what is a requirement, never "detail" — check every place the
  account marks **detail**.
- The agent's readings and calls are marked as such on the page; check none is stated as his rule, and none of his
  rules as the agent's call.
- **Search the other areas by the SUBJECT of each rule, not by this area's name** — the IT guide's most serious gap was
  a later Leave War ruling that changed what the guide draws without naming it. Here the subjects are sign-in and
  accounts, suspend and enable, archive and restore, posting in and the post-in date, posting out and its outcomes,
  SANS, transfer, guests, callsigns, Admin → Users and the one door, Quals and its columns (Scheduler, Management, SXO),
  roles (admin, member, scheduler), the admins' bell, many squadrons and aircraft types. Look in every area's file
  (`.claude/rules/decisions/*.md`) and full rows for a ruling that bears on this area and is not pointed to, or that a
  page line contradicts.
- Read the rulings the page points to in their own areas (short line or page statement, and full row) — each pointer
  no more and no less than its own area says today.

1. **Every People & accounts ruling, its full row against the page.** The changed chains first — D287 with D1102, D299,
   D297, D290; D229 and D294 with D1709, D287, D283, D298; D1547 and D1546 with D1691, D1690; D149 with D1510, D1651,
   D218; D166, D204, D165 (accounts and joining); D281, D282, D1100, D1101, D1695 (squadrons — what is direction, what
   is built); D283 with D1692 — then every other ruling.
2. **The page's own claims:** its head (what it says about loading, the full rows and searching them); its "Settled"
   section (what is settled — the designs of record, the as-built answers — and that nothing settled is presented as
   open, or open as settled); its "From other areas" pointers (each one true of the ruling it names).
3. **The account itself:** a part it marks **stated** that the page does not carry; a part it marks **detail**,
   **superseded** or **spent** that is a live requirement; a part of a full row it never lists; its count.
4. **The four small edits:** does each say what is now true — How we work, OIL, the IT guide and People & accounts the
   four pages, the other areas still in short lines?

**Not a finding (D56):** a problem that lives only in data already stored. Not a finding either: the page's length or
style as such (D141 — no size targets), nor whether a ruling is built yet — the page states rulings, built or not, as the
table did, but must say which are directions or future.

**Report:** findings first, most serious first — each with the ruling, the page line (a few words to find it), what the
full row requires, what the page says, a concrete fix in one sentence, and a severity (high: an agent following the page
would do what he ruled against or skip what he ruled for; medium: a condition or scope bent; low: wording or citation).
Then: how many rulings and parts you checked, and which you found whole. Plain words.
