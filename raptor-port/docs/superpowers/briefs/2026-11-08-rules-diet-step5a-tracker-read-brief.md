# Brief — the blind read of the rules diet's step 5a: the Tracker's rulings as a page (8 Nov 26)

**You are one of two readers, each blind to the other (his D1739, D1763 "keep two").** Do not open, search for or read
any file named `*tracker-read-opus*` or `*tracker-read-astra*`. Read only; change no file; commit nothing. Your final
message is your report.

**What changed** (the branch `claude/rules-diet-step-5a-tracker-de959c`, at the commit that adds this brief; the whole
change: `git diff b6f2e7caf HEAD -- .claude AGENTS.md DECISIONS.md raptor-port/CLAUDE.md raptor-port/scripts
raptor-port/docs/tracker`; `b6f2e7caf` is `main` as last merged in). The Tracker's rulings file, `.claude/rules/decisions/tracker.md`, was a table of 72
short lines — one per ruling, D64 to D1900 — under a head paragraph (an "Also read" list, the rule that no student name,
mark or date enters the repository, and where the detail lives). It is now a page, "The Tracker — how it works now":
each rule stated once, by topic, the rulings behind it cited after it (his D1735, approving the plan
`raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` — read its §2 and the four §Step 5a sections, OIL, the
IT flow guide, People & accounts and Screen design, with their lessons). The page loads exactly when the table did (its
`paths:` are unchanged): with every file of the Tracker's code, its documents, its scripts and walks, and the sign-out
file — so what it says is what every chat working on the Tracker will act on. The Tracker's architecture stays in
`.claude/rules/seams/tracker.md`, but for one mark (its map row's D1014 "to build" marked built). The old file:
`git show b6f2e7caf:.claude/rules/decisions/tracker.md` (on Git Bash set `MSYS_NO_PATHCONV=1` first). The account —
every part of every ruling mapped to the page line that states it — is
`raptor-port/docs/superpowers/briefs/2026-11-08-rules-diet-step5a-tracker-account.md`: use it as a map, and check it;
do not trust it (a second fresh helper, who had not written the page, wrote it against the first draft, `5ed8dbd48`,
and fixed the page; its table still describes that draft, each gap with its **Fixed:** note). After it, `main` was
brought in: D1900 (the magnifier) and D1901 (the "Not kept" band) are now built and live (pull request 706), and the
page says so. The Tracker's gaps document, `raptor-port/docs/tracker/known-gaps.md`, no longer calls the repo private
(D106, D1530).
Four small edits name the Tracker's rulings as a page: `DECISIONS.md` (its head), `AGENTS.md` (items 4 and 5),
`raptor-port/CLAUDE.md` (the map row on rulings, and the Tracker's own row) and the head of
`.claude/decisions-full/tracker.md`; and the page's size tripwire in `raptor-port/scripts/docsize.mjs`, its reason
beside it.

**The authority:** each ruling's full row — `.claude/decisions-full/*.md`, and `DECISIONS-ARCHIVE.md` for archived ones —
searched with the shell (`grep -h '^| D1790 |' .claude/decisions-full/*.md DECISIONS-ARCHIVE.md`); a search tool may hide
a long row; never read those files whole except `.claude/decisions-full/tracker.md`, which you may. A mark in a full row
(`— NARROWED … BY Dn`, `ANSWERED`, …) and a short line's "— changed by" tail say how the rule stands now; where two
rulings clash, the later one wins (D90). Read every full row's three cells — his words, what it means (the rule, its
conditions, the agent's readings), where it lives — not only the old short line. Where a row's home names a reference
document (`raptor-port/docs/design-practices.md` — the design guide — a section of `raptor-port/docs/ui-contracts.md`,
`raptor-port/docs/tracker/known-gaps.md`, a mock-up under `raptor-port/docs/mock/`, a pictures folder), open the part it
names when the page's line depends on it: a design of record holds parts its row does not. Where a ruling approves a
guide's wording "as worded" or as "the guide's rule" (D922 and D899 cite the design guide's drag rules, D895; D987 "the
one bounce the design guide allows"), read that wording clause by clause.

**The question, for every part of every ruling: does the page say more, less or other?** A rule, a condition, an
exception, an "only", "never", "unless", "until", "still" or "both", a scope (which screen, which bar, which window, phone
or desktop, finger or mouse, admin or member, which size), a timing or a size, a default or a "who does what" dropped,
narrowed, widened or bent; a wording on screen, a mark or a control left out or changed; an agent's reading or call
stated as his rule, or his rule stated as the agent's call; a direction stated as built, or a built rule stated as
future; a ruling cited on a line that states it as it stood before a later ruling changed it (the document check sees
the numbers only, never the meaning); two lines that state one rule and disagree. Ask what is MISSING, not only whether
what is there is right. D138: a rewrite must never change what the original meant.

**The lessons of step 5a so far, for you too** (the plan's four §Step 5a sections, "The two reads compared"):
- A wording on screen, a mark, a control, a scope or a who-does-what is a requirement, never "detail" — check every
  place the account marks **detail**.
- The agent's readings and calls are marked as such on the page; check none is stated as his rule, and none of his
  rules as the agent's call.
- **Search the other areas by the SUBJECT of each rule, not by this area's name** — every earlier page's most serious
  gaps were later rulings of other areas that changed what the page states without naming it. Here the subjects are: the
  chart and its balls (colours, the flight symbol, labels), scrolling, the glide, the bounce, the pinch and zoom, scroll
  bars, landing an event in view, the keyboard on the chart; the marking pop-up and its date boxes (the app's one
  calendar), attempts and failures; the Info panel, down days from the Inputs (medical, ATT B, half days, a course
  start), currency and flex, the legend, the settings gear; the bar's controls, sizes, labels and line icons, typed
  marks (✕, ×, ⇅, ↺, ☰, ⓘ, ⇪); Edit chart layout and its drags at the edge; the reorder windows and their grip ⠿;
  Find and the search box's magnifier; Undo / Redo; import, export, backup, delete and restore of a course; signing out
  with unsaved edits; each person's own last place; Post out and deleting a person; the "Not kept" band and what the
  browser keeps; the database step; who may do what (member and admin); privacy sweeps and the aircraft's name. Look in
  every area's file or page (`.claude/rules/decisions/*.md`, `.claude/rules/seams/*.md`) and full rows for a ruling that
  bears on this area and is not pointed to, or that a page line contradicts.
- Read the rulings the page points to in their own areas (short line or page statement, and full row) — each pointer
  no more and no less than its own area says today.

1. **Every Tracker ruling, its full row against the page.** The changed chains first — D1790 with D1861; D1405 with
   D1406; D1170 with D1171; D1132 with D1134 (another area's — find it); D1135 with D1132; D121 with D1014; D1003 with
   D1004, D1005; D1002 with D1003; D1006, D1007, D1014, D1018 together; D560 with D563, D564 (find D563 and D565); D564
   with D565; D566; D985–D989 and D992 together (the glide, the bounce, the pinch); D922, D924 and D899 with the design
   guide's drag rules (D895); D62, D63, D64; D376 with D377; D370, D371, D979 (failures and attempts); D981 with D299
   (find it); D122, D124, D126, D127, D128, D130, D131, D132, D375, D1015, D1860 (import, export, delete, restore) —
   then every other ruling.
2. **The page's own claims:** its head (what it says about loading, the full rows and searching them, where the detail
   lives, and the rule that no student name, mark or date enters the repository — with its reason as true today); its
   "Settled" section (what is settled — the as-built answers — and that nothing settled is presented as open, or open
   as settled); its "From other areas" pointers (each one true of the ruling it names); what it says is built or not
   (the backlog `OUTSTANDING.md` and the code under `raptor-port/src/tracker/` decide).
3. **The account itself:** a part it marks **stated** that the page does not carry; a part it marks **detail**,
   **superseded** or **spent** that is a live requirement; a part of a full row it never lists; its count.
4. **The small edits:** does each say what is now true — How we work, OIL, the IT guide, People & accounts, Screen
   design and the Tracker the six pages, the other areas (the scheduler, the Inputs pages, the Leave War) still in short
   lines? Does the tripwire's reason say what happened? Does the page's `paths:` list still close, so the page loads?

**Not a finding (D56):** a problem that lives only in data already stored. Not a finding either: the page's length or
style as such (D141 — no size targets), nor whether a ruling is built yet — the page states rulings, built or not, as the
table did, but must say which are directions or future.

**Report:** findings first, most serious first — each with the ruling, the page line (a few words to find it), what the
full row requires, what the page says, a concrete fix in one sentence, and a severity (high: an agent following the page
would do what he ruled against or skip what he ruled for; medium: a condition or scope bent; low: wording or citation).
Then: how many rulings and parts you checked, and which you found whole. Plain words.
