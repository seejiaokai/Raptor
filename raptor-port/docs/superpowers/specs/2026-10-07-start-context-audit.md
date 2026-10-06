# What a new chat loads at its start — the measurement, and the options (`[START-CONTEXT-AUDIT]` step 1 and 2, D602)

Written 7 Oct 26 on `claude/docs-tidy-7-oct`, documents only. **Nothing here has been done: no file was trimmed, no
guide changed. Every option waits for his ruling (D602).** The test of every option is his own: *"we should not cut
down at the expense of losing the quality of work"* — D68 (correctness beats context economy), D136 (no live ruling
leaves the list a chat reads), D138 (a move never rewords), D141 (no size targets).

## For him — the short version

- **A new chat has used about 97 thousand tokens before you type anything** — about a tenth of its room. After the
  usual opening line ("read the handoff, check the branch") and the first files of a build, it stands at about
  **190 thousand — about a fifth**. (He said 30% when he raised this; asked, he answered on 7 Oct 26 that most chats start around 20% —
  which is what the meter shows.)
- **About a third of it is the app itself** — its tool list and connected services, 68 thousand. Nothing in the repo
  changes that; one setting of yours can (option 9).
- **The largest piece that is plain waste is in the handoff notes:** seven blocks about branches that merged on
  6 Oct, about 18 thousand tokens, read by every new chat. Removing them is already the standing rule; it only needs
  a check that nothing they mention is left unfiled.
- **Done together, the safe options (1 to 4) take about 25 thousand off every chat** with no rule lost. The ones that
  touch the working guides (5 to 7) take about 5 to 8 thousand more and are read by Astra and Sol first. Splitting
  the scheduler's rulings by screen (8) saves the most on scheduler jobs — about 10 thousand — and carries the most
  risk; it wants a design step of its own.
- **Three things I recommend leaving alone** (options 11 to 13): they save tokens by removing the very text that
  stops a check being skipped or a ruling being missed.

## How it was measured

- **The app's own meter**, read from inside this chat on 7 Oct 26 (the same figures the `[OIL-WORK-START]` chat read
  on 6 Oct): tool list 38,101 · connected services' tools 17,183 · skill list 6,774 · the app's own instructions
  5,890 · "memory files" 28,815. These are measured, not estimated.
- **Each file's size**, counted by a script (`measure.mjs`, kept with this chat's scratch files; the document check's
  own table — `npm run docsize` — gives the same line and byte counts).
- **Tokens for a single file are an estimate:** 3.0 characters to a token. That rate is the meter's own — the nine
  always-loaded files are 86,843 characters and the meter counts them as 28,815 tokens. (The document check prints a
  lower estimate, 3.7 bytes to a token; the meter says these documents are denser than that.)
- **Not measured:** how much of each piece a job actually USED. Nothing records that. What can be said from the
  record is which pieces describe work that is finished — that is what the options below are built on.

## The measurement

### 1. Before the first message — about 96,800 tokens

| Piece | Tokens | Whose it is |
|---|---|---|
| The app's tool list | 38,100 | the app — fixed |
| Connected services' tools (the built-in browser, the documents and drive connectors, the drawing tool, the terminal, session controls) | 17,200 | the app — his setting (option 9) |
| The list of skills | 6,800 | the app and its plug-ins |
| The app's own instructions | 5,900 | the app — fixed |
| **The always-loaded files — 28,800 in all:** | | the repo and his PC |
| · the general rulings, How we work (106 rulings, one line each) | 8,700 | |
| · his memory index on this PC (about fifty notes) | 4,000 | |
| · `record-decisions.md` (write his rulings down; read before asking) | 3,650 | |
| · `doc-structure.md` (where each fact goes) | 3,000 | |
| · `shipping.md` (push, merge live, the checks) | 3,000 | |
| · `AGENTS.md` (the bridge written for Codex — it loads in Claude chats too) | 2,750 | |
| · `bug-check.md` (the check fires itself) | 1,700 | |
| · `plain-language.md` | 1,400 | |
| · his own global instructions | 700 | |

### 2. On the usual opening line, and the first files of a job

| Piece | Tokens | When |
|---|---|---|
| `HANDOFF.md` | 22,200 | every chat (the opening line) |
| · of which the seven blocks of branches merged with PR #481 | 18,000 | |
| · of which this chat's block, the order of work, the gate counts, the standing constraints | 4,200 | |
| The task-observer working guide | about 6,500 to 8,500 | every chat (a start-up hook calls it) |
| `raptor-port/CLAUDE.md`, the project guide | 12,300 | the first file opened under `raptor-port/` |
| The area's rulings: the scheduler 22,400 · the Leave War 9,000 · the Tracker 6,100 · People and accounts 4,600 · OIL 3,200 · the IT guide 1,300 | 1,300 to 22,400 | the first file of that area read |
| `raptor-executor.md` (the builder's policy) | 1,600 | the first source file |
| The backlog's priority list (the head of `OUTSTANDING.md`; its 150 items are searched, not loaded) | 8,200 | before a job is picked, or a question put to him |
| `bug-check-order.md`, the checking method | 17,700 | every bug check |

**A scheduler build, added up:** 96,800 + 22,200 + 7,500 + 12,300 + 22,400 + 1,600 + 8,200 + 17,700 = **about
189,000** — which is what the `[OIL-WORK-START]` chat's meter showed (197,000) before it had done any work.

### 3. Smaller, recurring

- A reminder to record his rulings is added to every message he sends — about 250 tokens each time. Over a long chat
  that is a few thousand. It is what enforces D13; no option below touches it.

## The options

Each: what would change · what it saves · what it risks · what covers it. "Saves" is per chat unless it says otherwise.

### Safe — already allowed by the standing rules; each is a move, never a rewording

**1. Remove the seven merged blocks from the handoff.** Saves **18,000** in every chat. The rule already says a merged
block leaves at the next handoff once what it left open is filed (`doc-structure.md`; `[STACK-MERGED-TIDY]` part 2).
The work: read each block for anything still open — a filed item, an owed read, a caveat — and confirm it has a home;
the blocks stay in git. Risk: low — an open point in one of the dense Codex blocks goes unfiled; the reads they owed
were paid in the one stack check (D589, D604). *Recommended: yes, first.*

**2. Archive the general rulings that are spent.** Saves about **2,000** in every chat, and brings How we work back
under its size marker without touching a live ruling. D136 already allows it: a one-off permission once spent, or a
ruling replaced by a later one, leaves for the archive, which is still searched before he is asked anything (D53).
The agent's first sort — 21 rows, each to be opened in full before it moves: D604, D589, D586, D540, D539, D538, D536,
D534, D533, D528, D508, D496, D494 (permissions and arrangements for the Codex stack, merged 6 Oct); D483, D465, D391,
D145 (jobs done); D173 (an order since replaced); D476, D85 (history, their live part carried by D588 and D86); D135
(a fact that has passed). Probably spent, to check: D480, D30, D72, D4, D147. Risk: low — a row judged spent that
still carries a live clause; each row's full text is read first, and a row with a live clause stays. The same pass
over the scheduler's and the Tracker's rulings, both over their markers. *Recommended: yes.*

**3. Send the finished backlog items to the archive.** The Codex stack's items and the four jobs since are built,
merged and still read as open (`[STACK-MERGED-TIDY]` part 1). Saves about **1,000 to 2,000** from the priority list,
and a searcher stops meeting finished work. The script refuses an item whose lasting facts have no home (D29).
Risk: low. *Recommended: yes.*

**4. Prune his memory index.** About fifty notes load in every chat, 4,000 tokens; many now repeat a ruling the repo
carries (pushing a branch, never pushing while checks run, the order of reviewers, unattended runs, the bug-check
order). The memory's own rule is not to keep what the repo records. Saves about **2,500**. Risk: low — each note is
checked against its ruling before it goes; the notes that are about this PC (its screen at 125%, his iPhone, the
Codex tool's model names) stay. *Recommended: yes.*

### Working guides — read by Astra and Sol before he approves the wording (D70)

**5. Bring `AGENTS.md` up to date.** It loads in every Claude chat (2,750) though it was written for Codex, and most
of it describes the arrangement that ended on 5 Oct. Moving the ended arrangement whole to the archive and keeping
the current bridge saves about **1,800**. Risk: low. *Recommended: yes.*

**6. Take out the expired notices.** The "until Monday 5 Oct" banner at the head of the project guide, in `AGENTS.md`
and in the Codex review guide (`[STACK-MERGED-TIDY]` part 3). Saves a few hundred; the point is that a chat stops
reading an arrangement that is over. Risk: none. *Recommended: yes, with 5.*

**7. Say each rule once across the always-loaded rule files.** The five rule files (12,750 together) repeat one
another in places — how to open a ruling's full text is explained five times; the push and merge rules stand in two
files and three rulings. Keeping each rule in its one home with a pointer saves about **2,000 to 4,000**. Risk:
medium — a pointer is weaker than the words; so only exact repeats go, and the two files written because a rule kept
being broken (`plain-language.md`'s check before sending, `record-decisions.md`'s read-before-you-ask) stay whole
(option 12). *Recommended: yes, the narrow form.*

### Larger — wants a design step of its own

**8. Split the scheduler's rulings by screen.** Any scheduler file loads all 165 rulings and nine blocks of settled
decisions — 22,400, the largest thing a build loads. Split into four or five parts (the board; the week and Edit
Schedule; publishing and amendments; inputs and requests; warnings and rules), a typical job would load one or two:
a saving of about **8,000 to 14,000** on scheduler jobs. Risk: medium, and the real one — a ruling in a part that
was not loaded is missed, and D68 says a missed ruling costs more than a loaded one. What limits it: each part's
file list drawn generously, an "also read" line where a ruling spans two, and the document check failing on a ruling
that falls in no part. *Recommended: yes, after 1 to 7, as its own job with both readers.*

### His own settings — nothing in the repo

**9. Turn off the connected services a coding chat does not use.** 17,200 loads for the built-in browser, the
documents and drive connectors, the drawing tool and others. The walks here drive the app by script and use none of
them. I could not measure each service by itself, so the saving is "up to 17,000", likely less. Risk: none to the
work; a job that does want one (a mock-up page sent to his phone uses the page publisher, which is part of the app,
not a connector) is unaffected. It is a setting in the app, his to change. *Recommended: try it on one chat and read
the meter.*

**10. The task-observer guide at the start of every chat.** A start-up hook has every chat load it (about 7,000) and
keep notes for a weekly review. The last review ran on 24 Sep; 177 notes are waiting. Three ways: keep it and run
the overdue review so it pays; keep the note-taking but load a one-page form of the guide (about −5,000); or stop it.
His call — he set it up (15 Aug 26). *Recommended: run the review once, then decide from what it yields.*

### Looked at, not recommended

**11. Loading only "rules of conduct" from the general rulings, and the dated ones by search.** Saves about 1,000 to
3,000 more than option 2. It sets D136 aside — a live ruling would leave the list a chat reads — and the order of
work is exactly what a new chat gets wrong when it cannot see it.

**12. Cutting the stories out of `plain-language.md` and `record-decisions.md`.** Saves about 2,500. Both files say
in their own words that the short rule alone was agreed with and still broken; the story is the part that works.

**13. A short form of the checking method (`bug-check-order.md`).** Saves about 6,000 to 8,000 on each bug check. Its
long sections are the reasons a check is not skipped under pressure, and it is opened only when a check runs. If
anything, only its history section (§1) could move — about 1,500 — and not before the walk-sizing wording
(`[WALK-SIZING-GUIDE]`) is settled.

## What the options add up to

| | Every chat | A scheduler build |
|---|---|---|
| Today | 96,800 before the first message | about 189,000 before any work |
| After 1 to 4 | −4,500 always-loaded, −18,000 handoff | about 165,000 |
| After 5 to 7 as well | −4,000 to −6,000 | about 160,000 |
| After 8 as well | — | about 148,000 |
| After 9 and 10, if he chooses them | up to −17,000 and −5,000 | about 126,000 at best |

## Keeping it from growing back (step 4 of the job, after his ruling)

The document check already fails on a merged block left in the handoff only as a note, and on six files over their
markers. To add, with the change: a merged block becomes a failure after one handoff, not a note; a ruling whose
permission names a branch that has merged is listed as "spent?" for the next documents pass; `AGENTS.md` and the
memory index get a marker like the rule files'. Markers stay tripwires, never targets (D141).

## What this pass did not do

- It checked the seven blocks for unfiled points only in part (option 1's work): every backlog item they name — 20
  tags — has its own heading in the backlog or its archive; the reads they say are owed were paid in the one stack
  check (D589, D604). **One caution stood nowhere a new chat reads** — a branch on his PC holding his phone photos
  that must never be pushed; it is now filed (`[PRIVATE-BRANCH-NEVER-PUSH]`). Still to read line by line before the
  blocks go: their "not proven" caveats against the evidence sheets, and the folders they say to leave untouched.
- It did not open the full rows of the 21 rulings sorted as spent (option 2's work).
- It did not sort the scheduler's 165 rulings into parts (option 8's design step).
- It changed no guide and trimmed nothing.
