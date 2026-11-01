# What every chat loads at its start — the trim (his D1554, 1 Nov 26)

Backlog item: `OUTSTANDING.md` [START-LOAD-TRIM]. Branch `claude/start-load-trim-1101`. Done unattended on the night of
1 Nov 26 as job 2 of the overnight run; the fresh reader's two reads are in
`raptor-port/docs/superpowers/briefs/2026-11-01-start-load-trim-reads.md`.

## 1. Done tonight (records only, no change to the app)

**Three rulings a later one restates in full went to the archive** (D971), each pair read by one fresh, blind Opus
reader, who agreed all three:
- D1507 (every gear one design; which gear to be put to him) — said in full by D1509 (the Leave War's line gear
  everywhere).
- D1133 (every pencil points bottom right) — said in full by D1134 (one solid pencil, tip at the bottom right).
- D1103 (a fresh session per overnight job) — said in full by D1416 (a fresh helper per job), with D1104 and D869.

The other 61 rulings marked "changed by" were read and stay: each still says something no later ruling says (the
reasons, pair by pair for the close ones, are in the reads file). Several of them read as **spent one-off permissions**
(D832, D885, D969, D972, D86, D568) — marking those SPENT was outside tonight's brief and is the next rulings pass's job.

**Nineteen screen-design rulings moved, whole, to a new rulings area** (`.claude/rules/decisions/design.md`, full rows
in `.claude/decisions-full/design.md`), loaded only with screen work — the design guide's own paths, and also the walks'
pictures, evidence sheets and browser tests (the reader's advice: a walk host judging a picture may never open the app's
code, and still needs "nothing pinned leaks" and the failed-save band). Moved by the filing script, byte for byte
(checked line by line): D1523, D1518, D1509, D1138, D1134, D1126, D1127, D1122, D926, D895, D887, D876, D850, D726,
D672, D587, D349, D348, D347. **Kept in every chat** on the reader's word: D1508 (its standing look-over job), D942 (a
design-guide lesson), D846 and D847 (what the agent says to him about wordy text), D487 (a limit on look checks); and
every ruling on how the agent works on design (pictures with design questions, how mock-ups are drawn and checked, the
guide's lessons, the design skill, what the app is). The general rulings' head now points at the new area; the map in
`DECISIONS.md` has its row; the document check has its size tripwire.

**What it saves, measured with the document check's own figures:**

| | Before | After | Saved |
|---|---|---|---|
| The general rulings (`how-we-work.md`), loaded in every chat | 56,481 bytes, ~21,145 tokens | 50,897 bytes, ~19,070 tokens | 5,584 bytes, ~2,075 tokens |
| All the project's always-loaded files (the five unscoped rule files, the general rulings, `AGENTS.md`) | 111,671 bytes | 106,087 bytes | 5,584 bytes |
| The new screen-design area, loaded only with screen work | — | 6,867 bytes, ~2,546 tokens | (moves, not cuts) |

About 2,000 tokens off every chat's start — about 5% of the ~41,000 the project's own files cost. The bigger share is
in the drafts below, which change files that only change while he is awake and need his "merge live".

## 2. Drafts for his approval (not done tonight)

### (a) A shorter `AGENTS.md`

`AGENTS.md` is written for Codex but loads into every Claude chat too (7,698 bytes, about 2,900 tokens). Proposed: keep at
its door only what Codex must know before its first read — who does what, the read-first list, what its hooks would have
done, the hard limits, when it stops — and move the two long "when you review" and "when you build" sections, whole and
unreworded (D138), into a new Codex-only file, `raptor-port/docs/codex-guide.md`, which the door names. The intro
paragraph moves there whole too, leaving a two-line summary. Proposed full text (about 4,600 bytes — saves about 3,100
bytes, about 1,150 tokens, in every Claude chat):

```markdown
# AGENTS.md — for Codex working in this repo

**Who does what now (D67, D590, D601).** Opus 5.5, in Claude Code, plans and builds; Codex is called as the REVIEWER
(Astra first, Sol 6.1 second where two are required) and BUILDS only on his word, each time. The full arrangement, and
how Codex reviews and builds: `raptor-port/docs/codex-guide.md` — read it before any review or build.

This file is a bridge: it holds no rules of its own beyond the short list below — it tells you which files carry them.
**Nothing in this repo loads by itself for you. Open what is named here, with your own reads, before you plan, review
or change anything.**

## Read first, every session, in this order

[the six numbered items, unchanged, word for word]

## What Claude gets from its hooks — you do these by hand

[the four bullets, unchanged, word for word]

## Hard limits

[the seven bullets, unchanged, word for word]

## When you stop

[the two paragraphs, unchanged, word for word]
```

The new `raptor-port/docs/codex-guide.md` holds, moved whole: the current intro paragraph ("Who does what now …
`codex-arrangement-2026-10-07.md`."), "## When you review" and "## When you build — only on his word". **Risk:** Codex
must open one more file before a review or build; the door says so in its first lines, and the read-first list is
untouched. **Check before it goes in:** one fresh reader confirms every hard limit and read is kept word for word.

### (b) Passages in the always-loaded rule files that no ordinary job needs where they sit (D141)

Each would move WHOLE to the home named, leaving a one-line pointer (D138 — moved, never reworded). Sizes are each
section's bytes today.

| File | Passage | Why it need not load every chat | Moves to | Saves about |
|---|---|---|---|---|
| `record-decisions.md` | "Keeping the list whole, and read by relevance (D136 + D137)" | The history of how the rulings were split and slimmed; the working steps are already at the head of `DECISIONS.md` and in `doc-structure.md` | `raptor-port/docs/doc-budget.md` | 3,300 bytes |
| `record-decisions.md` | "The lapse this exists to stop" | The story behind the rule, not the rule; the rule section after it stands alone | `raptor-port/docs/guide-full.md` (a heading of its own) | 950 bytes |
| `record-decisions.md` | The three failure stories under "Read it before you ask him anything" (from "Three failures made it" to the end of the section) | The check itself stays; the stories behind it move | `raptor-port/docs/guide-full.md` | 1,300 bytes |
| `doc-structure.md` | "In his workflow" — its "Unattended runs" bullet (D596, D667, D766) | Needed only on an unattended run, and the overnight guide and `doc-budget.md` carry the same rulings; D596 and D667 are in the general rulings, loaded anyway | `raptor-port/docs/doc-budget.md` | 1,500 bytes |
| `shipping.md` | "Once the repo is private: they run on his PC (D89) …" bullet | The repo stays public until he says otherwise (D1530); the bullet only matters on the day it goes private | `raptor-port/docs/gates-and-deploy.md`, the pointer saying "when the repo goes private, read this first" | 600 bytes |
| `shipping.md` | "Ship once per session, at the end (10 Aug 26)" | Its live points are restated by D1086 and D1087 in "The loop" and "The checks"; what is left is the 10 Aug measurement story | `raptor-port/docs/archive/` (with its pointer) | 700 bytes |
| `bug-check.md` | "With the Claudex loop" | The same order of operations is §4a of `raptor-port/docs/bug-check-order.md`, which the trigger already makes every bug check open | `raptor-port/docs/bug-check-order.md` §4a (already there — the passage becomes a pointer) | 850 bytes |
| `plain-language.md` | Nothing — every line is used on every message | — | — | — |

Together about 9,200 bytes (about 3,400 tokens). With (a), about 12,300 bytes (about 4,500 tokens) more off every
chat's start. Each move is read by one fresh reader for meaning before it goes in (D138), and, since these are rule
files every chat carries, goes live only on his "merge live" (D1407 does not cover them).

### (c) The area lists the new screen-design area needs

Two always-loaded rule files list the rulings areas and were left as they are tonight (they change only while he is
awake). The document check does not require them to name the new area, so nothing is broken meanwhile; the lines to add:
- `.claude/rules/doc-structure.md`, "What a chat reads, and when", the "By itself, per area" bullet: add
  `design.md` (the screen-design rulings — how a screen looks and behaves, loaded with screen work, D1554) to the list
  after `inputs.md`.
- `.claude/rules/record-decisions.md`, "Keeping the list whole", the list of areas: add "since 1 Nov 26, Screen design
  — D1554" after "the Inputs pages — D802". (If (b)'s first row is approved, this line moves with its section.)

## 3. What he decides

**Answered 2 Nov 26 — his D1556, "Yes all three": (a), (b) all rows and (c) approved as written.** (4), his "merge live", still his.

**Done 2 Nov 26 (D1556), on this branch:** 1–3 DONE — all ten blocks moved by the filing script, byte for byte, each with its pointer
(the `AGENTS.md` sections to `raptor-port/docs/codex-guide.md`; the rule-file passages to the homes in (b)'s table — the two
record-decisions stories under two labels in `guide-full.md` §Write his rulings down at the moment, the Keeping section and the
unattended-runs bullet in `doc-budget.md` §5, "Ship once per session" in `raptor-port/docs/archive/rule-files-2026-11-02.md`,
the Claudex section after the checking guide's §4a); the two area lines of (c) in. The always-loaded files: 106,818 → 96,929
bytes (about 9,900 bytes, ~3,700 tokens by the document check's ratio). One fresh reader: byte for byte PASS, nothing lost, every limit and read of `AGENTS.md` kept — its four findings, three
fixed, one put to him (Read 3 of the reads file). 4 waits on his "merge live".

1. Approve the shorter `AGENTS.md` and its Codex-only guide — recommended: yes.
2. Approve the moves in (b), all or row by row — recommended: all.
3. Approve the two area-list lines in (c) — recommended: yes.
4. His "merge live" on this pull request (it changes the document check's own script, so it is not notes-only).
