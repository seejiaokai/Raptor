# Expired text in the working guides — what moves out, and what the guides say after (`[START-CONTEXT-AUDIT]` options 5 and 6, D609)

**APPLIED 7 Oct 26 on `claude/docs-tidy-7-oct`, after the two reads — both CHANGES REQUIRED, every finding taken (the
table at the foot). Where a finding changed the wording, the guides carry the corrected wording, not the text below;
the text below is the proposal as the readers saw it. His "merge live" on the pull request is his approval (D609).**

**A PROPOSAL, 7 Oct 26, on `claude/docs-tidy-7-oct`. Nothing in it has been applied.** It changes working guides, so it
is read by Astra and by Sol 6.1, one round each, apart (D70, D590), before it goes in; his "merge live" on the pull
request is his approval of the wording (D609). Written by Opus 5.5 — neither reader is its writer.

## Why

On 7 Oct 26 the rulings that set up the Codex-only arrangement of 2–5 Oct, and the permissions given under it, were
marked SPENT and archived (D609, option 2): D494, D496, D508, D476, D480 and others — the work they covered merged as
PR #481 on 6 Oct 26. The guides still carry the text those rulings left behind (D201: fix what an old ruling leaves, in
the same change). A chat — or Codex — that reads it meets an arrangement that is over, written as if it were in force.

**The rule for every edit here:** text that is over moves WHOLE to an archive file, never reworded (D138); only the
sentence that replaces it is new. The archive file is `raptor-port/docs/archive/codex-arrangement-2026-10-07.md`.

## The edits

### 1. `AGENTS.md` — the bridge file for Codex (it also loads in every Claude chat)

**Now:** 102 lines. About half describe the arrangement that ended on 5 Oct 26: who plans and builds "until the reset",
how to read Claude's model names "until the reset", the branch to base work on (`claude/planning-filing-3-oct`, long
merged), "your numbers start at D496", and an order of work whose first four jobs are live.

**Proposed:** the whole present file moves to the archive file, and `AGENTS.md` becomes the text below. Everything in
it that is a RULE is unchanged from the present file or names the ruling it restates; what is new is only the account
of who does what now.

```markdown
# AGENTS.md — for Codex working in this repo

**Who does what now (D67, D590, D601).** Opus 5.5, in Claude Code, plans and builds. Codex is called as the REVIEWER:
Astra reviews what Opus wrote, and Sol 6.1 is the second reader where two are required (OIL, published records,
permissions, saved data, an important plan, a changed working guide); each reads independently and never reads the
other's report first. **Codex BUILDS only on his word, each time** — the job on hold is the SANS availability
calendar's new layout (`OUTSTANDING.md` `[SANS-CALENDAR-WIP]`, D610). For a build, follow his instruction for it and the
current rulings; what Codex writes, Opus 5.5 reviews, and the writer never approves its own artifact (D67). The
arrangement that ran until Monday 5 Oct 26 (D494, D496 — Codex planning and building by itself) is over; its text is
kept whole in `raptor-port/docs/archive/codex-arrangement-2026-10-07.md`.

This file is a bridge: it holds no rules of its own beyond the short list below — it tells you which files carry them.
**Nothing in this repo loads by itself for you. Open what is named here, with your own reads, before you plan, review
or change anything.**

## Read first, every session, in this order

1. `HANDOFF.md` — where things stand; the newest block under `## Now` is the work in hand.
2. Every rule file Claude gets loaded in every chat — read each one whole:
   `.claude/rules/plain-language.md` · `.claude/rules/record-decisions.md` · `.claude/rules/bug-check.md` ·
   `.claude/rules/shipping.md` · `.claude/rules/doc-structure.md` · `.claude/rules/decisions/how-we-work.md`.
3. `raptor-port/CLAUDE.md` — the project guide and its map (§Where things live). Most of its rules are one line;
   the full text of each is a heading of `raptor-port/docs/guide-full.md` — search it, never read it whole.
4. Before planning, reviewing or changing anything in an AREA, that area's rulings file under `.claude/rules/decisions/`
   (`scheduler.md`, `leave-war.md`, `oil.md`, `tracker.md`, `people-accounts.md`, `it-flow-guide.md`) — the `paths:`
   at the top of each says which source files it governs. Before any build: `.claude/rules/raptor-executor.md`.
5. A ruling there is ONE line. Before acting on its detail or asking him about it, open its full row:
   `grep -h '^| D149 |' .claude/decisions-full/*.md`.
6. `OUTSTANDING.md` — the one backlog — before telling him anything is undecided, missing or unbuilt (D53).

## What Claude gets from its hooks — you do these by hand

- **Record his rulings the moment he makes them, BEFORE the work they imply** — the three steps at the head of
  `DECISIONS.md`, then `node raptor-port/scripts/backlog-archive.mjs --rulings`. Ask yourself on EVERY message of his:
  is this a decision, a preference, a correction, a "leave it", a no? Every closing report carries a `Rulings:` line.
  **Take the next free number** — the newest block of `HANDOFF.md` names it; D567–D585 are held by the calendar branch.
- **Run the document check before you end any turn that changed a document:** `cd raptor-port && npm run docsize`.
  It must pass; read what it says rather than working around it.
- **A background command starts in the wrong folder** — move into `raptor-port/` by its full path inside the command.
- **Speak to him plainly** (`plain-language.md`): he is not technical. No file names, function names, log lines or
  commit ids in what he reads. Run its "check before you send" on every message.

## When you review

- Your brief names what to read; read the live files it points at, whole, and nothing of the other reader's.
- A claim is a finding only with a concrete failure, its cause and its exact fix (D489). A problem that lives only in
  data already stored is not a finding (D56).
- Read-only: change no file. You never review, inspect or approve an artifact your own model wrote (D67).

## When you build — only on his word

- Where a rule says "Opus 5.5 plans and builds", read it as you for that job; where it says "Astra reviews", read it
  as Opus 5.5. Write each read owed in your `HANDOFF.md` block and in the bug check's evidence sheet as
  `OWED: Claude's read`, naming the branch.
- The bug-check order (`raptor-port/docs/bug-check-order.md`) is yours to run in full EXCEPT those reads: state the
  tier, the roll-call, the sizing step (§7.0), the walk of the RUNNING app with pictures, the gates, the evidence
  sheet with its `Walk:` line. In Codex only, the proportional-checks addendum applies (D499,
  `raptor-port/docs/codex-review-workflow.md`).
- "A skill" (`.claude/skills/…`) is a Claude working guide. Read one as a document where a rule points at it; never
  edit one (D70 — a change to a working guide is read by both reviewers before he approves it). The skill
  observation log (`.claude/skill-observations/log.md`) is not yours to write.
- **No feature is designed until he says what it means.** Before building one, ask him — in rounds of at most four
  questions, each with your recommended answer; product choices only, the technical how is yours. Search the rulings
  first so you never ask what he has already ruled. Write a short design note under
  `raptor-port/docs/superpowers/specs/<date>-<name>.md`, linked from the backlog item; a visual change gets a
  picture first. The order of the feature batches is D495's (`OUTSTANDING.md` `[FEATURE-WISHLIST]`).

## Hard limits

- **Never push to `main`, never merge a pull request, never open one for merging.** "Merge live" is his word alone,
  and it cannot be given for anything you built until Claude has read it (D67). Push BRANCHES freely — each gives him
  a Vercel link to look at (`shipping.md`).
- **Branches:** each build job gets its own branch, `codex/<short-name>`, cut from `main` unless he names another
  base; the calendar's work continues on `codex/inputs-sans-calendar`.
- **One full check at a time on his PC:** take the lock before the full unit suite, a multi-file browser run, the
  Tracker smoke or a fanned-out walk — `node raptor-port/scripts/gatelock.mjs take "<branch> — <what>"`; release it
  the moment the run ends (`shipping.md` §The checks).
- Never edit `.claude/hooks/`, `.claude/settings*.json`, `.claude/skills/`, a reviewer's brief after its run, or
  this file's limits to get a result accepted. Never weaken a test to pass. Never delete data or history.
- `reference/` is read-only; `src/engine/` bodies are verbatim ports — a change there is the behaviour change only.
- A change inside `raptor-port/src` never trims a document (D29).

## When you stop

Rewrite ONLY your own block under `## Now` in `HANDOFF.md` (the shape is at the head of that file): what you
built or read, on which branch, what was checked and how, every read owed to Claude, and what is next. Commit and push
the branch. The next Claude chat starts from that block.
```

### 2. The "until Monday 5 Oct" banner — three files

Each is a paragraph at the head of its file; each moves whole to the archive file, with nothing left in its place.

- `raptor-port/CLAUDE.md`, line 3: "**D496 temporary Codex model mapping (2 Oct 26):** until Monday 5 Oct 26, 19:00, …"
- `raptor-port/docs/guide-full.md`, line 3: the same banner.
- `raptor-port/docs/bug-check-order.md`, lines 3–7: "**Temporary Codex mapping — D496 (2 Oct 26), until Monday 5 Oct 26
  at 19:00:** … Exact roles and bounded review/fix loop: `codex-review-workflow.md`. Existing Claude skills remain
  unchanged."

### 3. `raptor-port/docs/codex-review-workflow.md`

**Now:** a first section "Temporary Codex roles — D496, 2 Oct 26" (the arrangement, over), then "Codex-only proportional
checks — D499" (a live ruling).

**Proposed:** the first section moves whole to the archive file EXCEPT its one paragraph on how a review round is run
("Use concrete briefs with the baseline, scope, … Reviewers do not edit the code they are inspecting."), which stays
where it is, word for word, under a new heading. The file's new head:

```markdown
# Codex in this repo — how a review round is run, and Codex's own proportional checks

Codex is the reviewer of what Opus 5.5 writes (D67, D590, D601), and builds only on his word (`AGENTS.md`). The
arrangement of 2–5 Oct 26 under which Codex planned and built by itself (D496) is over; its text is kept whole in
`docs/archive/codex-arrangement-2026-10-07.md`.

## How a review round is run
```

The D499 section is unchanged.

### 4. `raptor-port/docs/bug-check-order.md` §4 — the three paragraphs of trials that have run

**Now:** between the fan-out paragraph (D16) and "FROM 5 OCT 26 THE WALKERS ARE SONNET 5.5 (D588)" stand three
paragraphs: "A TRIAL, ON THE NEXT WALK ONLY (owner, D476 …)", "A SECOND TRIAL (owner, D480 …)" and "ONE EXCEPTION, ONCE
(owner, D508 …)". All three rulings are spent — both trials ran, the one exception was used.

**Proposed:** the three paragraphs move whole to the archive file. In the D588 paragraph, ONE passage is replaced:

**Now:** "The second trial above still runs — in the check of the Codex stack (D589): one Opus walker and one Sonnet
walker on the same scenarios, on the frozen Rally build as it stood before its review fixes, neither told what is
wrong — and its report adds his weekly allowance, read before and after each walker. One building trial rides with it:
ONE small low-risk fix (`[OG-TAG-OVER-COUNT]`) built by a Sonnet helper …"

**Proposed:** "Two trials led here (D476, D480 — both run, with the one check made before the reset, D508; their text:
`docs/archive/codex-arrangement-2026-10-07.md`). From the second, on a build with five known faults, the agent decided
(D595; told to him the same night): every walk goes to Sonnet walkers, with no Opus walker beside them, on three
conditions written into every walk brief — the host opens the pictures behind every FAIL and every high-consequence
PASS (OIL, a published day, a role, saved data); a scenario with an expected result is judged PASS or FAIL; a walker's
conclusion is a finding only once the host has reproduced it. One building trial is still to run: ONE small low-risk
fix (`[OG-TAG-OVER-COUNT]`) built by a Sonnet helper …" *(the rest of the paragraph unchanged)*

*(The three conditions are quoted from the stack check's sheet, `docs/handpass/2026-10-05-codex-stack-check.md` §11,
where they have stood since 5 Oct 26; this puts them where a walk is planned.)*

### 5. Three short lines in the general rulings — a sentence each that is no longer true

Each ends with a sentence about a read "owed before main". That read was paid: Claude's check of the Codex stack
(D589) read the code and the guide changes Codex made (the sheet's row for D70), and the stack merged on 6 Oct 26.
The rule in each line is untouched; only the spent sentence goes. The full rows gain a dated note saying so.

- **D67, now:** "… WHEN CODEX PLANS OR BUILDS, OPUS REVIEWS; NEVER THEIR OWN ARTIFACT. D496'S CODEX ARRANGEMENT RAN
  UNTIL MONDAY 5 OCT 26, 19:00; CLAUDE'S READ OF WHAT IT BUILT IS OWED BEFORE MAIN (D589)."
  **Proposed:** "… WHEN CODEX PLANS OR BUILDS, OPUS REVIEWS; NEVER THEIR OWN ARTIFACT."
- **D353, now:** "… ASTRA AND SOL 6.1 FOR WHAT OPUS WROTE (D590), FABLE ON CALL ONLY. D496'S CODEX ARRANGEMENT RAN
  UNTIL MONDAY 5 OCT 26, 19:00; CLAUDE'S READ OF WHAT IT BUILT IS OWED BEFORE MAIN."
  **Proposed:** "… ASTRA AND SOL 6.1 FOR WHAT OPUS WROTE (D590), FABLE ON CALL ONLY."
- **D70, now:** "… BY ASTRA AND SOL 6.1 (D590 — FABLE'S ROUND WENT TO SOL). THE GUIDE CHANGES CODEX MADE BEFORE MONDAY
  5 OCT 26, 19:00 STILL OWE CLAUDE'S READ BEFORE MAIN."
  **Proposed:** "… BY ASTRA AND SOL 6.1 (D590 — FABLE'S ROUND WENT TO SOL)."

## Option 7 — looked at closely, and NOT proposed

Option 7 was "say each rule once across the always-loaded rule files — only exact repeats go". Read side by side, the
five rule files overlap in SUBJECT (how to open a ruling's full text; never push while checks run; unattended runs) but
almost nowhere in WORDS: each says its part for its own purpose — where a fact goes, how a change ships, what to do
before asking him. The exact repeats found come to about a hundred tokens. The one sizeable overlap — the last section
of `record-decisions.md`, about 800 tokens that restate the head of `DECISIONS.md` — is not an exact repeat and sits in
a file written because its rule kept being broken. Under the narrow form he was recommended, nothing qualifies, so no
edit is proposed. *(If he wants that one section shortened to a pointer, it is a rewording — its own read.)*

## What this saves

`AGENTS.md` 8,360 → about 6,100 bytes (about 750 tokens in every Claude chat); the banner about 150 in every chat that
opens the project guide, and as much again on every bug check; the three trial paragraphs about 700 on every bug
check; the three short lines about 100 in every chat. Small in tokens — its worth is that no chat, and no Codex
session, reads an ended arrangement as the rule.

## The two reads — 7 Oct 26, each alone, one round each (D70)

Reports, as returned: `raptor-port/docs/superpowers/briefs/2026-10-07-expired-guide-text-read-astra.md`, `…-read-sol.md`;
the brief: `…-read-brief.md`. Both: **CHANGES REQUIRED**. Neither read the other's report. Both found nothing live lost
in the three banners, the Codex review guide's ended section or the old bridge file's limits; both confirmed the three
"owed" sentences were paid (the stack check's sheet §10.4); both found no passage of size repeated word for word across
the always-loaded rule files (the longest match: twelve words) — so option 7 stays not done.

| Finding | Who | What was done |
|---|---|---|
| The new `AGENTS.md`'s "When you stop" told a read-only reviewer to rewrite the handoff, commit and push | both | **Taken** — two cases written apart: after a review, return the report and change nothing; after an authorised build, the handoff block and the push |
| For work Codex BUILDS, "read Astra as Opus" left Sol as second reader of Sol's own code | Sol | **Taken** — the builder's bullet now keeps every required independent read: Opus beside a fresh Codex inspector whose model did not write it (the checking order's §4a); the writer never counts as a reader |
| "Take the next free number — the newest handoff block names it" was already false (it named D609 as free) | Astra | **Taken** — check the live rulings, the archive and the ranges held by other branches; the handoff's number is a hint |
| D465 was archived as wholly spent, but one of its conditions is still in force (if the IT side's reports cannot reproduce the worked-out picture, a reportable piece is added; nothing built is undone) | Astra (Sol sampled it without objection) | **Taken** — D465 is back on the live list, only its build permission marked spent |
| D610's short line kept "do not delete" and lost "no chat reviews, rebuilds or merges it until he calls it back" | both | **Taken** — the short line and the full row's heading reworded |
| D608's short line said version 2 was read by both readers; they read version 1 | both | **Taken** — "corrected after Astra and Sol read version 1", in the short line and the full row |
| D609's short line lost "a part he changes is read again" | Sol | **Taken** |
| Edit 4 made Sonnet compulsory for every walk (D608 lets the host run a short one), and lost the rule that the host re-judges a "RECORDED" row that has an expected result | Astra (Sol: the three conditions are quoted faithfully) | **Taken** — the passage in the checking guide's §4 uses Astra's wording |
| The D499 addendum still ended "OWED: Claude's working-guide read" — paid on 6 Oct | Sol | **Taken** — the sentence now says where it was paid |

**Not taken: nothing.** These corrections have had no read of their own (the cap of one round, D70); each is the
reader's own replacement wording or a closer copy of the record it quotes.
