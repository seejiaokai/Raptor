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
- **Chat context saved into the repo is SUMMARISED, never dumped** (owner, D71, 23 Sep 26). When a
  long session persists its working context — a handoff, a context doc, a closing note — it writes
  the decisions, the state and the next step, not the conversation. The repo must not bloat.

## 3. Prune in its own pass — never inside a fix

**SUPERSEDED 23 Sep 26 (D29 rule 3, [DOCS-GUARD]):** this section used to say "prune on write" —
every edit leaves the file no longer than it found it. Pruning under the pressure of another change
is what destroyed two filed items on 22 Sep 26, so it is withdrawn. Now: **a change that touches
`raptor-port/src` never trims a document**; if a file is over budget the gate reports it as deferred.
Trimming is its own docs-only pass. In that pass: finished backlog items MOVE to
`OUTSTANDING-ARCHIVE.md` (never deleted); a superseded ruling becomes a one-line pointer to what
replaced it; a "how it was found" story goes to the commit message, where history belongs.

Stale is worse than absent — the next session trusts it.

## 4. The gate

`npm run docsize` does two jobs ([DOCS-GUARD], 23 Sep 26 — Fable's attack on D29, owner D30):

- **The inventory.** Every filed backlog item must survive the change: it fails, by name, when an
  item is gone from both `OUTSTANDING.md` and `OUTSTANDING-ARCHIVE.md`, when an id is newly
  duplicated, when an archive line is removed, when an item moved to the archive arrived
  truncated, or when a body line is newly doubled. It runs in CI (`docs-guard.yml`, which exists
  because docs-only changes otherwise run no checks at all) and as a Stop hook at the end of every
  turn. A deliberate exception is declared in the commit: `Docs-guard-allow: [ID]`.
- **The ceilings.** Each always-read file has a line ceiling. **Over a ceiling inside a code change
  is reported and deferred, never failed** — a code change is never where docs get trimmed (D29
  rule 3). Over a ceiling on a docs-only change fails, because that change is the trim pass.
- **The rulings.** No D-number in `DECISIONS.md` may be lost or newly doubled (numbers may skip —
  parallel branches hold ranges, D70), every file a ruling names as its home must exist, and every
  ruling id in `scripts/rulecheck.mjs`'s map must still head an entry in a behaviour register.

**Moving a finished item** is `node scripts/backlog-archive.mjs <ID> --homes <file>` (from the repo
root: `raptor-port/scripts/…`) — never a hand edit or a one-off script. It refuses a duplicate id,
refuses without a named home for the item's facts, moves the bytes unchanged, and puts both files
back if the inventory is not clean afterwards.

**Ceilings carry headroom; they are no longer a ratchet.** The old rule lowered a ceiling to the
file's new size after every trim, which left zero headroom, so every mandatory addition during a fix
tripped the gate — the squeeze behind the 22 Sep 26 destruction. That clause is withdrawn (D29 as
corrected). Moving a ceiling is a deliberate, argued edit with its reason in the commit, in a
commit that touches no `raptor-port/src` file (the gate checks this). Its self-test,
`scripts/docsize-selftest.mjs`, replays the destruction and must stay green.
