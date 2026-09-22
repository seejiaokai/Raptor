# What a session has to read before it can work — and the budget on it

**Owner, 21 Sep 26 (D14):** too much has to be read before any work starts, too much of it is his
words transcribed rather than the decision stated, and long context makes a model less reliable.
He is right. Measured that day: **1,830 lines loaded every session whatever the task**, plus
**2,228 more** read at session start. About four thousand lines before anything is done.

The repo already had ceilings — `HANDOFF.md` says inside itself that it must stay near 550 lines
and it had reached 961. **The ceilings were never wrong; nothing failed when they were breached.**
So this file adds the forcing function, not a new opinion.

## 1. Tiers, by how often a document must be READ

| Tier | What is in it | Budget |
|---|---|---|
| **0 — always loaded**, every session, no choice | `raptor-port/CLAUDE.md`, `.claude/rules/*.md` | **600 lines total.** Index and live rules ONLY. |
| **1 — read at session start** | `HANDOFF.md`, `OUTSTANDING.md`, `DECISIONS.md` | **HANDOFF 400. DECISIONS 150.** OUTSTANDING is a backlog: priority list + one short block per LIVE item; anything done moves out. |
| **2 — read when working in that area** | `engine-rules.md`, `ui-contracts.md`, `feature-impact.md`, `bug-check-order.md`, `data-*.md` | No line budget. Must be navigable: headed sections, no section over ~150 lines without sub-heads. |
| **3 — read only for that one task** | `docs/superpowers/specs/*`, `briefs/*`, review and scenario files | None. Never read unless the task names it. **Never linked from tier 0.** |
| **4 — archive** | `HANDOFF-ARCHIVE.md`, superseded specs | None. Searched, never read. |

**The rule that makes tiering work: a tier-0 file may not contain a tier-2 explanation.** It carries
the decision in one line and a pointer. That is the whole job of an index.

## 2. Record the DECISION, not the transcript

This is D14's substance, and it applies to every doc, every commit message and every report.

- **State the decision in one line.** Then the consequence, if it is not obvious. Then stop.
- **Quote him only where the exact words are load-bearing** — where a paraphrase could drift, or
  where his wording IS the specification. One quote per ruling, not three. Everywhere else: the
  decision, the date, and a pointer to where the full words live.
- **Never quote the same words in two files.** The second copy is the one that goes stale.
- **A reason earns its place only if it would change a future decision.** "Why" that merely
  explains what the code already says is padding; "why" that stops the next session undoing it is
  the most valuable line in the file.
- **This is not the plain-language rule's opposite.** That rule says never thin the reasoning, only
  the vocabulary. This one says do not say the same thing three times. Both can hold: say it once,
  fully, in ordinary words.

## 3. Prune on write

**Touching a document means leaving it no longer than you found it, unless the addition is a live
rule.** Every edit: find one stale line and remove it. A resolved item leaves; a superseded ruling
becomes a one-line pointer to what replaced it; a "how it was found" story goes to the commit
message, which is where history belongs.

Stale is worse than absent — the next session trusts it.

## 4. The gate

`npm run docsize` fails when a tier-0 or tier-1 file is over budget. It is a **ratchet**: the
recorded ceiling can only ever go DOWN. Raising one is a deliberate, argued edit in the same
change, exactly like the DOM ceilings in `performance.md`.

Run it with the other gates. It is instant.
