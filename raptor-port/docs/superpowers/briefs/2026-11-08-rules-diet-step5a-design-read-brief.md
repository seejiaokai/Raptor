# Brief — the blind read of the rules diet's step 5a: the screen-design rulings as a page (8 Nov 26)

**You are one of two readers, each blind to the other (his D1739, D1763 "keep two").** Do not open, search for or read
any file named `*design-read-opus*` or `*design-read-astra*`. Read only; change no file; commit nothing. Your final
message is your report.

**What changed** (the branch `claude/rules-diet-step-5a-design-9bc219`, at the commit that adds this brief; the whole
change: `git diff e7fb20aad HEAD -- .claude AGENTS.md DECISIONS.md raptor-port/CLAUDE.md raptor-port/scripts
raptor-port/docs/PRODUCT.md raptor-port/docs/ui-contracts.md`; `e7fb20aad` is `main` as last merged in). The
screen-design rulings file, `.claude/rules/decisions/design.md`, was a table of 74 short lines — one per ruling, D347 to
D1901 — under a head paragraph. It is now a page, "Screen design — how it works now": each rule stated once, by topic,
the rulings behind it cited after it (his D1735, approving the plan
`raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` — read its §2 and the three §Step 5a sections, OIL,
the IT flow guide and People & accounts, with their lessons). The page loads exactly when the table did (its `paths:` are
unchanged): with every file under `raptor-port/src/**`, the mock-ups, the screen rules, the design guide and the design
skill, the walks' pictures, evidence sheets and browser tests — so what it says is what every chat doing screen work will
act on. The old file: `git show e7fb20aad:.claude/rules/decisions/design.md` (on Git Bash set `MSYS_NO_PATHCONV=1`
first). The account — every part of every ruling mapped to the page line that states it — is
`raptor-port/docs/superpowers/briefs/2026-11-08-rules-diet-step5a-design-account.md`: use it as a map, and check it; do
not trust it (a fresh helper wrote it against the first draft, `6dd4aec70`, of the 73 rulings then on the branch, and
fixed the page; its table still describes that draft, each gap with its **Fixed:** note). D1901, recorded on `main` in
the old shape while the page was drafted, was stated on the page by the host at the merge, with D1792 now all built and
the Tracker's D1900 pointed to; it is in no account — read it yourself. Two full rows gained marks in this change:
D349's, NARROWED by the Inputs pages' D854 (the board's "Schedule updated" note gone), and the scheduler's D475's,
NARROWED by D1792 (its ↺ now the drawn Reset arrow).
Four small edits name the screen-design rulings as a page: `DECISIONS.md` (its head), `AGENTS.md` (item 5),
`raptor-port/CLAUDE.md` (the map row on rulings) and the head of `.claude/decisions-full/design.md`; and the page's size
tripwire in `raptor-port/scripts/docsize.mjs`, its reason beside it. Three documents were corrected on what the page
found: `raptor-port/docs/ui-contracts.md` (D1631 and D1632 marked built), `raptor-port/docs/PRODUCT.md` (principle 7
gains D1628's three places — the design skill reads it) and one pointer on the People page (D1614 cited beside D887).

**The authority:** each ruling's full row — `.claude/decisions-full/*.md`, and `DECISIONS-ARCHIVE.md` for archived ones —
searched with the shell (`grep -h '^| D1626 |' .claude/decisions-full/*.md DECISIONS-ARCHIVE.md`); a search tool may hide
a long row; never read those files whole. A mark in a full row (`— NARROWED … BY Dn`, `ANSWERED`, …) says how the rule
stands now; where two rulings clash, the later one wins (D90). Read every full row's three cells — his words, what it
means (the rule, its conditions, the agent's readings), where it lives — not only the old short line. Where a row's home
names a reference document (`raptor-port/docs/design-practices.md` — the design guide — a section of
`raptor-port/docs/ui-contracts.md`, a mock-up under `raptor-port/docs/mock/`, a pictures folder), open the part it names
when the page's line depends on it: a design of record holds parts its row does not.

**The question, for every part of every ruling: does the page say more, less or other?** A rule, a condition, an
exception, an "only", "never", "unless", "until", "still" or "both", a scope (which screen, which bar, which window, phone
or desktop, which size), a timing or a size, a default or a "who does what" dropped, narrowed, widened or bent; a wording
on screen, a mark or a control left out or changed; an agent's reading or call stated as his rule, or his rule stated as
the agent's call; a direction ("drawn for him before it is built") stated as built, or a built rule stated as future; a
ruling cited on a line that states it as it stood before a later ruling changed it (the document check sees the numbers
only, never the meaning); two lines that state one rule and disagree. Ask what is MISSING, not only whether what is
there is right. D138: a rewrite must never change what the original meant.

**The lessons of step 5a so far, for you too** (the plan's three §Step 5a sections, "The two reads compared"):
- A wording on screen, a mark, a control, a scope or a who-does-what is a requirement, never "detail" — check every
  place the account marks **detail**.
- The agent's readings and calls are marked as such on the page; check none is stated as his rule, and none of his
  rules as the agent's call.
- **Search the other areas by the SUBJECT of each rule, not by this area's name** — earlier pages' most serious gaps
  were later rulings of other areas that changed what the page states without naming it. Here the subjects are the top
  bar (its Undo / Redo, the sync dot, the bell, the changes clock, the page names beside TALON, the side menu), the one
  gear, the one pencil, drawn line icons and typed marks (⇅, ⚙, 📅, 👁, ↺, ✕, the OIL ticket, History's clock), search
  boxes, arrows that keep their place, the "Not saved" band and its Retry, refusals and "Blocked:", the loading claw and
  the start-up logo, the name TALON, the screen after asking for access and its pass, menus of actions (⋯), the keyboard
  and the cyan focus ring, questions raised at the control (cards), legends, pinned parts leaking, phone zoom and pinch,
  where a window opens, words on screen and passing notes, glow, "one mark, one look", the drag rules, a page's controls
  on one row. Look in every area's file or page (`.claude/rules/decisions/*.md`, `.claude/rules/seams/*.md`) and full
  rows for a ruling that bears on this area and is not pointed to, or that a page line contradicts.
- Read the rulings the page points to in their own areas (short line or page statement, and full row) — each pointer
  no more and no less than its own area says today.

1. **Every screen-design ruling, its full row against the page.** The changed chains first — D1626 with D1627, D1628;
   D1631 with D1633, D1638, D1635, D1636, D1637; D1591, D1605, D1607, D1610, D1611, D1615 with D1612 (another area's or
   archived — find it) and D1614, D1617, D1618; D1663 with D1665, D1667, D1668, D1669; D1509 with D1707, D1508; D1641
   with D1642, D1643; D1649 with D1650, D1654, D1656; D1700 with D1703, D1704, D1792, D1793; D347 with D348, D349 (and
   D481); D587 with D841, D1523, D1655, D1657, D1664, D1666; D876 with D1449, D1038; D887 with D1614; D1518 with D1522;
   D726 with D836 — then every other ruling.
2. **The page's own claims:** its head (what it says about loading, the full rows and searching them, and what stays in
   How we work); its "Settled" section (what is settled — the as-built answers — and that nothing settled is presented as
   open, or open as settled); its "From other areas" pointers (each one true of the ruling it names).
3. **The account itself:** a part it marks **stated** that the page does not carry; a part it marks **detail**,
   **superseded** or **spent** that is a live requirement; a part of a full row it never lists; its count.
4. **The small edits:** does each say what is now true — How we work, OIL, the IT guide, People & accounts and screen
   design the five pages, the other areas still in short lines? Does the tripwire's reason say what happened?

**Not a finding (D56):** a problem that lives only in data already stored. Not a finding either: the page's length or
style as such (D141 — no size targets), nor whether a ruling is built yet — the page states rulings, built or not, as the
table did, but must say which are directions or future.

**Report:** findings first, most serious first — each with the ruling, the page line (a few words to find it), what the
full row requires, what the page says, a concrete fix in one sentence, and a severity (high: an agent following the page
would do what he ruled against or skip what he ruled for; medium: a condition or scope bent; low: wording or citation).
Then: how many rulings and parts you checked, and which you found whole. Plain words.
