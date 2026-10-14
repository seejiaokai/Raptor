---
name: overnight
description: Use when the owner types /overnight, or says he is going to sleep or away and wants work run unattended ("I have 8 hours", "run this overnight", "what can we build while I sleep"). Before he sleeps it chooses what can be built without him, puts at most four questions, writes the night's plan into the repo and starts at once; through the night it builds, checks and saves as it goes; in the morning it leaves one report.
---

<!-- DRAFT, [OVERNIGHT-SKILL] (D859) — NOT INSTALLED. A working guide of our own: drafted 15 Oct 26, read by one fresh,
blind Opus reader (D70, D810's way while the ChatGPT readers are out — its report and what was taken:
`raptor-port/docs/superpowers/briefs/2026-10-15-overnight-skill-read-report.md`), then put to him. On his approval this
file, without this comment, becomes `.claude/skills/overnight/SKILL.md`, with a row in `raptor-port/docs/file-map.md`. -->

# Overnight — the unattended run as one command (RAPTOR, internal)

He types `/overnight` (or `/overnight 6` — the hours he will be away; 8 when he gives none) and may go to sleep without
reading the reply. This guide replaces the questions he used to ask by hand each night (D596, D667, D766, D856–D859).
Its worked example is the night of 14 Oct 26: the rows D856–D858 and the handoff block written that night
(`git show 81b65274b:HANDOFF.md`).

**What the command is, and is not.** It is his standing go for an unattended run: the agent chooses the work from what
he has already ruled, and builds it on branches, in this chat. It is NOT permission to merge, to touch `main`, to
change his Claude settings, the hooks or a working guide, to build anything outside the Tonight list below, or to
answer a product question for him. Those stay his, every night.

**If his message names the work** ("continue this till step 8"), that is the night's work: Part 1 shrinks to the
questions his words leave open, and step 9.

## Part 1 — before he sleeps

1. **Level and look.** `git fetch origin`, then `git rev-list --left-right --count HEAD...origin/main` (`0 0` = level).
   Open pull requests: `gh pr list --state open --json number,headRefName,title`. Whether a branch's checks are running:
   `gh run list --branch <branch> --limit 6 --json status,workflowName,headSha` — a push makes TWO runs (the documents
   guard, a minute or two; the full checks, up to about twenty), so look for any run of the branch's last pushed commit
   that is `queued` or `in_progress`, never only the newest row. The check lock:
   `node raptor-port/scripts/gatelock.mjs status`. Other live chats: `ListAgents` (or `list_sessions`) — a job another
   chat holds is not tonight's (D302).
2. **Read the order.** `HANDOFF.md` (`## Now`, `## Next, in order`) and `OUTSTANDING.md`'s priority list. For every
   job you might pick, its item and its rulings' full rows (`grep -h '^| D… |' .claude/decisions-full/*.md`) — never
   only the short line (D53, D390). **Before a job counts as a candidate, confirm it is not already done:** its pull
   request's state (`gh pr list --state all`), `git log origin/main`, `OUTSTANDING-ARCHIVE.md`. A stale line is named
   in the morning report, not acted on.
3. **Read the allowance** — `get_usage` (a deferred tool: load it first): the 5-hour figure and when it resets, the
   weekly figure, the Fable weekly figure, and this chat's fullness. A night that will not fit is made smaller now, not
   stopped halfway. If the chat is past about half full, say so in the message, with its figure; the night still runs
   here (D667, D857) and compacts by itself, the state in the repo first.
4. **Sort every candidate into one of three lists:**
   - **Tonight:** his ruling orders it, or its backlog item is placed by the agent and changes no look and no words a
     person sees; its design is settled. A new sentence his ruling leaves to the build is written to the writing guide
     (`raptor-port/docs/design-practices.md` §1b) and shown to him in the morning as built, his to change.
   - **Not tonight:** an item that says "his to place" or "his answers first"; a visual change he has not seen in a
     picture (D541, D853); his product choice still owed; waiting on a merge or another branch; held by his word (as
     D774 holds the progress graph); waiting on the IT side (D466); a change to how Claude itself runs here — a hook,
     a setting, a working guide — even one he has approved, because it is done while he is awake.
   - **Tonight, nothing in the app changes:** filing; drafting guide wording for his later approval; drawing the
     pictures a "not tonight" job waits on; steadying a test (a test change still takes the lock and the gates).
5. **Plan each job or batch:** its branch (below); its bug-check tier and walk size (`raptor-port/docs/bug-check-order.md`
   §5 and §7.0 — read it, not from memory; related jobs on one branch are one batch, checked once at the riskiest tier,
   D485); its model reads (D790: a fresh, blind Opus read of the finished code; Fable as well on OIL, published days, who
   may do what, saved data); a rough time from `raptor-port/docs/walk-ledger.md`, or marked a guess. While the ChatGPT
   readers are out, every job that needs a code read is written onto `OUTSTANDING.md` `[NO-ASTRA-LIST]` in the same
   change (D761). Order the jobs so the most valuable finished one does not depend on the last finishing.
6. **Send him ONE message, and do not end the turn on it.** Write it as text inside the running turn, then go straight
   on. In his words (`.claude/rules/plain-language.md`), a one-minute read:
   - the night's jobs in order, a line each: what he will have in the morning, and a rough time;
   - "not tonight": only the ones he would expect to see, a line each with the reason; the rest as a count;
   - **at most four questions**, numbered, each with a recommended answer, a worked example where it helps, and what
     happens if he does not answer (step 7). A design question carries a picture with the area marked (D853); if
     drawing it would take more than a few minutes, the job is "not tonight" and the drawing is a job of the third list;
   - the allowance: the weekly figure now and roughly after the night; how full this chat is;
   - "Nothing merges and nothing touches the live app. One notification in the morning. Leave the PC on and plugged
     in, the lid open.";
   - last line: "Reply with your answers, or just "go" — the night has already started."
   Then call `request_keep_awake` with `until: "session_idle"`. Through the night, wait on a long run INSIDE the turn
   (a monitor or a foreground wait), never by ending the turn: an idle session lets the PC sleep after about five
   minutes, and the night stops with it.
7. **If he does not answer**, the night goes on (D596). **An unanswered question is never a yes.** A job on the Tonight
   list needs no permission question — the command is the permission. A job not on it is not built tonight unless he
   answers yes. The one default that is taken: the night runs in this chat (D667, D857). A product choice is never
   guessed (`raptor-port/CLAUDE.md`, the 95% paragraph): that piece waits; the rest goes on.
8. **Record what is new, when his reply comes** (at the next step boundary): only a new decision of his becomes a
   ruling — a "yes, build it", a "Opus alone reads it", a correction — by the three steps at the head of
   `DECISIONS.md`; then rewrite the block. The command itself is not re-recorded each night: the ruling that approved
   this guide is its standing permission.
9. **Write the night into the repo BEFORE the first job, and push it:** this chat's block in `HANDOFF.md` opens with
   "THE NIGHT OF <date>" — the jobs and their order, each one's branch, check and reads, his answers ("awaited" until
   they come; then each answer, or "unanswered — that piece waits"), and "Questions waiting for him: none yet". A
   compaction loses nothing that is already here (D667).

**Branches.** A new job: its own branch cut from `main`. A job that needs unmerged work: cut from that branch, and the
block says so. Never a pull request based on another branch — it runs none of the real checks.

## Part 2 — through the night

- **Each job, or each batch of related jobs on one branch, runs the bug-check order in full** — roll-call, sized walk
  with pictures (the walkers Sonnet 5.5, D787), gates under the lock (D228), the model reads, fixes, re-walk, evidence
  sheet. Unattended is not a reason for a smaller check; the night's allowance is a reason for fewer jobs.
- **A helper's report** (reader, walker, scenario designer) is saved into the repo — its brief's folder or the evidence
  sheet — the moment it arrives, before anything is done about it.
- **At every commit:** this chat's block and the backlog true; `cd raptor-port && npm run docsize` before a commit of
  records; the branch pushed — never while its checks are running (step 1's command; D151); `get_usage` read.
  **No record is written into the repo while a gate run is going** — draft it in the scratch folder (the document check
  is the run's last gate, and an edit during the run fails it).
- **When the chat nears full (about 70%):** finish the step in hand, commit, push, and write into the block what the
  rest of the night needs and what it does not — the step in hand, the files it touches, the open faults, the
  questions parked — so the compaction keeps exactly that (D766).
- **A question arises:** search the rulings and the backlog first (D53). A technical choice is yours — decide and write
  down why. A choice truly his goes into the block's "Questions waiting for him" — the question in the app's own words,
  a recommended answer, what waits on it — and the job's evidence sheet points to it; only that piece waits. Before
  recommending "leave it as built", write the case in which "as built" fails the ruling's own words; if that case is
  real, it is a finding to fix, not a question.
- **Pull requests:** a job cut from `main` gets its pull request when its check closes, so GitHub's checks run while he
  sleeps; stop watching it at once. A job cut from another unmerged branch gets none at night: the morning report
  offers him one pull request carrying the related work (D822, D864).
- **Stop starting new jobs** when the time he gave is nearly up (keep the last hour for the report), when the weekly
  figure passes 90%, or when nothing on the Tonight list is left. **When the 5-hour figure passes 85%:** commit, push
  and write the block before it runs out, and carry on after it resets. A job half built at a stop is committed, pushed
  and written into the block as unfinished — never left in a state its tests do not describe.
- **Never:** merge; push to `main`; change his Claude settings, the hooks or a working guide; build what is not on the
  Tonight list; send more than one notification. If truly blocked — nothing on the list can continue — that is the one
  notification.

## Part 3 — the morning report

- **Read every pull request's checks first** (step 1's command), so the report never says green on a guess.
- **The block in `HANDOFF.md`** is rewritten by the session-handoff guide, and pushed.
- **One notification**, one line: done, or blocked, and where to look.
- **The report**, short, plain words, in this order:
  1. what is ready for his look — per job: what it does in the app, the preview link, the pictures (several pictures go
     as one Artifact page, sharp, tap to zoom);
  2. what was not done, and why — and any stale record found on the way;
  3. the questions waiting for him — each with its recommended answer, its picture where it is a design;
  4. the allowance used (the weekly figure at the start and now) and how full this chat is;
  5. the lines `Walk:` (per job, from its evidence sheet) and `Rulings:`;
  6. **"What you do now"**, numbered: his look on his iPhone at what needs it, his answers, "merge live" when he is
     happy, and whether the next job wants a fresh chat (with its ready-to-paste opening line, the branch to pick and
     whether to tick "worktree" — D368).

## Before sending the Part 1 message — check

- [ ] Every job on the Tonight list meets step 4's Tonight bullet, and none is already done.
- [ ] At most four questions; each has a recommended answer and says what happens if unanswered — never a yes taken.
- [ ] No technical choice is put to him.
- [ ] The message says nothing merges and the live app is untouched, and ends "the night has already started".
- [ ] The night is written into the repo and pushed before the first job starts; the keep-awake hold is asked for.

## Before sending the morning report — check

- [ ] Every pull request's checks read, both runs; none described as green that was not seen green.
- [ ] Every job has its evidence sheet with a `Walk:` line, or is reported as not checked.
- [ ] Every job read without Astra or Sol 6.1 is on `[NO-ASTRA-LIST]`.
- [ ] Every new ruling is recorded; the `Rulings:` line is filled.
- [ ] One notification sent, no more. Nothing merged; nothing pushed to `main`.
