# Brief — a blind read of the rules-diet plan (7 Nov 26, D1732, D1734)

**The same brief goes to two readers, each blind to the other: a fresh Opus reader, and Astra (his call, D1734).** Neither
reads the other's report; neither has seen the conversation that wrote the plan. The owner wants to see which read is
better, so work on your own and say what you checked.

**What to read.** The repository at branch `claude/rules-diet-plan`, the commit named in the message that sends you this
brief. Start with:
1. `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` — the plan (v1).
2. `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-sample-how-we-work.md` and `…-sample-oil.md` — two real
   conversions, each with its account of every ruling it replaces.
3. The sources they draw on, as you need them: `.claude/rules/*.md` (the five without `paths:` load in every chat),
   `.claude/rules/decisions/*.md` (each ruling as one short line), `.claude/decisions-full/*.md` (the full rows — open
   one with `grep -h '^| D142 |' .claude/decisions-full/*.md`), `DECISIONS.md`, `DECISIONS-ARCHIVE.md`,
   `raptor-port/docs/doc-budget.md`, `raptor-port/scripts/docsize.mjs`, `docsize-rulings.mjs`, `backlog-archive.mjs`,
   `raptor-port/docs/bug-check-order.md`, `raptor-port/CLAUDE.md`, `HANDOFF.md`, `OUTSTANDING.md` item `[RULES-DIET]`.
   Never read an archive or a full-text rulings file whole — search it.

**What the plan is for.** Chats in this project fill up with rules and records before they touch code; the owner (not
technical) sees handoffs and hallucination. The plan proposes turning each area's rulings into a "how it works now" page,
the always-loaded rules and the bug-check order into checklists, and some rules into automatic checks — with every ruling
kept whole in the searched full rows. Nothing is changed until he approves.

**What to look for — what is MISSING or WRONG, not whether you like it:**
1. **Lost or bent rules.** In each sample, check at least 15 rulings of its account against their rows (the short line,
   and the full row where the short line has "— changed by"): does the page state the rule as it stands, with nothing
   dropped or widened? Are the proposed archivals ("spent", "restated in full") right by `DECISIONS.md`'s rules and D971?
   Name any ruling the account misses.
2. **The mechanism.** Would the recording steps, the gate checks (§5) and the change-over marker work with the scripts as
   they are — `docsize.mjs`, `docsize-rulings.mjs`, `backlog-archive.mjs --rulings`, the Stop and prompt hooks? What
   breaks, what is unaccounted for (the rulings map in `DECISIONS.md`, the archive route, `rulecheck`, the homes audit,
   parallel branches)?
3. **The numbers.** Are the measurements and projections in §1 and Part 1 sound? Is any layer missing or double-counted,
   any assumption wrong (what a job really must read by rule)?
4. **The rulings it sets aside or keeps.** Does it name every ruling it would change (D136, D390, D141, D68, D138, D971,
   D1556 and any other)? Is anything it says "stands" in fact broken by it?
5. **A better path.** Is there a cheaper or safer way to the same saving the plan misses — or a piece of it not worth its
   risk?

**A finding needs a concrete failure, its cause and its fix (D489)** — "if step 2 runs as written, X happens because Y;
do Z instead". Rate each high / medium / low. Say also what you checked and found sound (explicit negatives).

**Not a finding:** wording or style preferences; the plan's projected sizes being estimates (it says so) unless a number
is wrong; anything in its §10 "Not in this plan" unless leaving it out breaks the plan; a problem that lives only in data
already stored, the code being correct going forward (D56); the samples being drafts (they are, on purpose).

**Change no file. Do not commit or push.** Return the whole report as your answer.
