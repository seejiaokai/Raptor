---
name: overnight
description: Use when the owner types /overnight, or says he is going to sleep or away and wants work run unattended ("I have 8 hours", "run this overnight", "what can we build while I sleep"). Before he sleeps it recommends the jobs that fit the hours he gives, he selects them and answers its questions, and it writes the night's plan into the repo; then it runs unattended in this one chat, building, checking and saving as it goes; in the morning it leaves one report.
---

<!-- INSTALLED 15 Oct 26 on his "Approve" (D869) as `.claude/skills/overnight/SKILL.md` — THAT file is the live
command; this is the draft as approved, kept as the record of [OVERNIGHT-SKILL] (D859, D867, D868): read by two fresh,
blind Opus readers (D70, D810's way — `raptor-port/docs/superpowers/briefs/2026-10-15-overnight-skill-read-report.md`).
A later change is made to the live file, never here. -->

# Overnight — the unattended run as one command (RAPTOR, internal)

He types `/overnight` (or `/overnight 6` — the hours he will be away; 8 when he gives none). The agent lays out the jobs
that fit in that time, he selects them and answers its questions, and then it runs the night unattended in this one
chat (D867). This guide replaces the questions he used to ask by hand each night (D596, D667, D766, D856–D859). Its
worked example is the night of 14 Oct 26: the rows D856–D858 and the handoff block written that night
(`git show 81b65274b:HANDOFF.md`).

**What the command is, and is not.** The command and his selection are his go for the night: the agent builds the
jobs he selected, on branches, in this chat. It is NOT permission to build a job he did not select, to merge, to touch
`main`, to change his Claude settings, the hooks or a working guide, or to answer a product question for him. Those
stay his, every night.

**If his message names the work** ("continue this till step 8"), that is the night's work: Part 1 shrinks to the
questions his words leave open — asked, and answered, before it starts — then steps 8 and 9. With none open, it goes
straight to steps 8 and 9 without ending the turn.

## Part 1 — before he sleeps: recommend, he selects, then start

1. **Level and look.** `git fetch origin`, then `git rev-list --left-right --count HEAD...origin/main` (`0 0` = level).
   Open pull requests: `gh pr list --state open --json number,headRefName,title`. Whether a branch's checks are running:
   `gh run list --branch <branch> --limit 6 --json status,workflowName,headSha` — a push makes TWO runs (the documents
   guard, a minute or two; the full checks, up to about twenty), so look for any run of the branch's last pushed commit
   that is `queued` or `in_progress`, never only the newest row. The check lock:
   `node raptor-port/scripts/gatelock.mjs status`. Other live chats: `ListAgents` (or `list_sessions`) — a job another
   chat holds is not tonight's (D302).
2. **Read the order.** `HANDOFF.md` (`## Now`, `## Next, in order`) and `OUTSTANDING.md`'s priority list. For every
   job you might recommend, its item and its rulings' full rows (`grep -h '^| D… |' .claude/decisions-full/*.md`) —
   never only the short line (D53, D390). **Before a job counts as a candidate, confirm it is not already done:** its
   pull request's state (`gh pr list --state all`), `git log origin/main`, `OUTSTANDING-ARCHIVE.md`. A stale line is
   named in the morning report, not acted on.
3. **Read the allowance** — `get_usage` (a deferred tool: load it first): the 5-hour figure and when it resets, the
   weekly figure, the Fable weekly figure, and this chat's fullness. If the chat is past about half full, say so in the
   message, with its figure; the night still runs here (D667, D857, D867).
4. **Sort every candidate:**
   - **Can run tonight:** his ruling orders it, or its backlog item is placed by the agent and changes no look and no
     words a person sees; its design is settled. A new sentence his ruling leaves to the build is written to the
     writing guide (`raptor-port/docs/design-practices.md` §1b) and shown to him in the morning as built, his to change.
     Also here, marked "nothing in the app changes": filing; drafting guide wording for his later approval; drawing
     the pictures a held job waits on; steadying a test (a test change still takes the lock and the gates).
   - **Not tonight:** an item that says "his to place" or "his answers first" (unless a question below settles it); a
     visual change he has not seen in a picture (D541, D853); waiting on a merge or another branch; held by his word
     (as D774 holds the progress graph); waiting on the IT side (D466); a change to how Claude itself runs here — a
     hook, a setting, a working guide — even one he has approved, because it is done while he is awake.
5. **Size each job, and the night.** For each job (or batch of related jobs on one branch — checked once at the
   riskiest tier, D485): its branch (below); its bug-check tier and walk size (`raptor-port/docs/bug-check-order.md` §5
   and §7.0 — read it, not from memory); its model reads (D790: a fresh, blind Opus read of the finished code; Fable as
   well on OIL, published days, who may do what, saved data); and a rough time, from `raptor-port/docs/walk-ledger.md`
   or marked a guess. Add the times in the recommended order and mark where his hours run out — keeping the last hour
   for the report — so the list shows how many jobs fit (D867). The allowance can shorten it too. Order them so the
   most valuable finished job does not depend on the last one finishing.
6. **Send him ONE message and wait for his selection** — the night does not start before he has answered (D867). In his
   words (`.claude/rules/plain-language.md`), a one-minute read:
   - **the recommended jobs, numbered, in order**, a line each: what he will have in the morning, its check, its rough
     time; then a line: "In <N> hours: 1 to <k> fit. Recommended: 1 to <k>.";
   - "not tonight": only the ones he would expect to see, a line each with the reason; the rest as a count;
   - **the questions that must be answered before it starts** — at most four, numbered, each with a recommended answer
     and a worked example where it helps; a design question carries a picture with the area marked (D853) — if
     drawing it would take more than a few minutes, the job is held and the drawing can be a job;
   - the allowance: the weekly figure now and roughly after the night; how full this chat is;
   - "Nothing merges and nothing touches the live app. One notification in the morning. Leave the PC on and plugged
     in, the lid open.";
   - "Nothing starts until you reply. If you are about to sleep, reply "go" first.";
   - last line: "Reply with the job numbers you want and your answers, or "go" for the recommended jobs AND the
     recommended answers."
7. **His reply is the night's plan.** The jobs he selected are the night's — no others. "Go" takes the recommended jobs
   and the recommended answers. A question he skips is never a yes: the piece it governs waits, the rest goes on. **A
   job marked "not tonight" that he selects** is built only if his reply settles what held it (it answers the question
   it waited on); otherwise say in one line what holds it, start the rest, and give it a place in the morning report —
   never wait on him again before starting. **A reply more than about an hour after the message:** look again (steps 1
   and 3) and count his hours from the reply; if anything changed, say so in one line and go on. A
   new decision in his reply (a "yes, build it", a "Opus alone reads it", a correction) is recorded as a ruling by the
   three steps at the head of `DECISIONS.md`; his selection itself is not — the command's ruling is its standing
   permission. While the ChatGPT readers are out, every selected job that needs a code read is written onto
   `OUTSTANDING.md` `[NO-ASTRA-LIST]` in the same change (D761).
8. **Write the night into the repo BEFORE the first job, and push it:** this chat's block in `HANDOFF.md` opens with
   "THE NIGHT OF <date>", and its first line reads: "After a compaction: re-read this block, the overnight guide and the
   files of the step in hand before the next change; note the compaction here with its time." Then: his selection in order, each job's branch, check, reads and rough time, his answers, and
   "Questions waiting for him: none yet". A compaction loses nothing that is already here (D667).
9. **Then start**, without ending the turn: call `request_keep_awake` with `until: "session_idle"`, and go to the first
   job. Through the night, wait on a long run INSIDE the turn (a monitor or a foreground wait), never by ending the
   turn: an idle session lets the PC sleep after about five minutes, and the night stops with it.

**Branches.** A new job: its own branch cut from `main`. A job that needs unmerged work: cut from that branch, and the
block says so. Never a pull request based on another branch — it runs none of the real checks.

## Part 2 — through the night

- **Each selected job, or batch, runs the bug-check order in full** — roll-call, sized walk with pictures (the walkers
  Sonnet 5.5, D787), gates under the lock (D228), the model reads, fixes, re-walk, evidence sheet. Unattended is not a
  reason for a smaller check; if the night runs short, the LAST job is left, not a check.
- **A helper's report** (reader, walker, scenario designer) is saved into the repo — its brief's folder or the evidence
  sheet — the moment it arrives, before anything is done about it.
- **At every commit:** this chat's block and the backlog true; `cd raptor-port && npm run docsize` before a commit of
  records; the branch pushed — never while its checks are running (step 1's command; D151); `get_usage` read.
  **No record is written into the repo while a gate run is going** — draft it in the scratch folder (the document check
  is the run's last gate, and an edit during the run fails it).
- **Compact smartly, by how full the chat is (D766, D867, D868).** Not at a fixed point: from about 80% full the agent
  chooses the moment itself, without asking him — the next clean point, so a big job does not compact twice. Until the
  chat can be made to compact at that moment (`[COMPACT-WHEN-MOD]`), the app does it by itself near full (the usage
  reading names the point), and the agent keeps that harmless and the work accurate:
  - keep the chat lean: heavy reading, walking and code reads go to helpers that return conclusions, never file dumps;
  - at each commit, the block names exactly what the rest of the night needs — the job and step in hand, the files it
    touches, the open faults, the questions parked — and what it does not;
  - from about 80% full: at the next clean point — the step in hand finished, committed, pushed, the block rewritten —
    compact there; no new helper, walk or gate run starts above that mark until the block is written;
  - **after a compaction, re-read the block, this guide and the files the step in hand touches before the next change,
    and note the compaction in the block with its time** — never carry on from the summary's memory of a file, a ruling
    or a test result.
- **A roadblock that needs him** waits until he wakes (D596, D867): search the rulings and the backlog first (D53); a
  technical choice is yours — decide and write down why; a choice truly his goes into the block's "Questions waiting
  for him" — written into the block, never sent as a message that ends the turn — the question in the app's own words, a recommended answer, what waits on it — and the job's evidence sheet
  points to it; only that piece waits, the rest goes on. Before recommending "leave it as built", write the case in
  which "as built" fails the ruling's own words; if that case is real, it is a finding to fix, not a question.
- **Pull requests:** a job cut from `main` gets its pull request when its check closes, so GitHub's checks run while he
  sleeps; stop watching it at once. A job cut from another unmerged branch gets none at night: the morning report
  offers him one pull request carrying the related work (D822, D864).
- **Stop starting new jobs** when the time he gave is nearly up (keep the last hour for the report), when the weekly
  figure passes 90%, or when his selection is done. **When the 5-hour figure passes 85%:** commit, push and write the
  block before it runs out, and carry on after it resets. A job half built at a stop is committed, pushed and written
  into the block as unfinished — never left in a state its tests do not describe.
- **Never:** build a job he did not select, or one step 4 holds that his reply did not settle; merge; push to `main`; change his Claude settings, the hooks or a working
  guide; send more than one notification. If truly blocked — nothing he selected can continue — that is the one
  notification.

## Part 3 — the morning report

- **Read every pull request's checks first** (step 1's command), so the report never says green on a guess.
- **The block in `HANDOFF.md`** is rewritten by the session-handoff guide, and pushed.
- **One notification**, one line: done, or blocked, and where to look.
- **The report**, short, plain words, in this order:
  1. what is ready for his look — per job: what it does in the app, the preview link, the pictures (several pictures go
     as one Artifact page, sharp, tap to zoom);
  2. what of his selection was not done, and why — and any stale record found on the way;
  3. the questions waiting for him — each with its recommended answer, its picture where it is a design;
  4. the allowance used (the weekly figure at the start and now), how full this chat is, and whether it compacted;
  5. the lines `Walk:` (per job, from its evidence sheet) and `Rulings:`;
  6. **"What you do now"**, numbered: his look on his iPhone at what needs it, his answers, "merge live" when he is
     happy, and whether the next job wants a fresh chat (with its ready-to-paste opening line, the branch to pick and
     whether to tick "worktree" — D368).

## Before sending the Part 1 message — check

- [ ] Every recommended job meets step 4's "can run tonight", and none is already done.
- [ ] Each job has a rough time, and the message says how many fit in his hours.
- [ ] At most four questions, each with a recommended answer; no technical choice is put to him.
- [ ] The message says nothing merges and the live app is untouched, says nothing starts until he replies, and ends
      by asking for his selection ("go" = the recommended jobs and answers).

## Before the first job — check

- [ ] Only the jobs he selected are planned; his answers are recorded where they are new rulings.
- [ ] The night is written into the repo and pushed; the keep-awake hold is asked for.

## Before sending the morning report — check

- [ ] Every pull request's checks read, both runs; none described as green that was not seen green.
- [ ] Every job has its evidence sheet with a `Walk:` line, or is reported as not checked.
- [ ] Every job read without Astra or Sol 6.1 is on `[NO-ASTRA-LIST]`.
- [ ] Every new ruling is recorded; the `Rulings:` line is filled.
- [ ] One notification sent, no more. Nothing merged; nothing pushed to `main`.
