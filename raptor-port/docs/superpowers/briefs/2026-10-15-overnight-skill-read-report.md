# The read of the draft overnight command — the reader's report, as returned (15 Oct 26)

One fresh, blind Opus reader, read-only, on the brief `2026-10-15-overnight-skill-read.md`, against the draft
`../specs/2026-10-15-overnight-skill-draft.md` as first written. Saved whole the moment it arrived. What was taken is
at the end (§What the host did).

## Findings, most serious first

**F1. The night never starts if he goes to sleep without replying.** Line 12 expects him to type `/overnight` and sleep
"a few minutes later". Part 1 step 6 sends ONE message, which in practice ends the agent's turn. Nothing then runs
until he types again; step 7 ("If he does not answer before he sleeps, the night goes on") cannot happen. On 14 Oct it
worked only because he replied. Cause: the draft never says the message must not end the turn. Fix: "Do not end the
turn on this message. Send it as text inside the running turn. Then go straight on: write the night into the repo
(step 9), as 'answers awaited', and start the first job that needs no answer. His reply arrives at the next step
boundary; record it then (step 8) and rewrite the block. The message's last line is: 'Reply with your answers, or just
"go" — the night has already started.'"

**F2. The way the draft checks "are the checks still running?" can cancel a full check run (D151).** Step 1 and Part 2
use `gh run list --branch <b> --limit 1`. Every push to a pull request starts two runs at the same second: the documents
guard (about 2 minutes) and the full checks (8–17 minutes). Measured on `claude/oil-uncancel-load-ask`: the 07:22:40
pair was Docs guard 2m06s and the full checks 7m54s; the 07:01:59 pair 1m51s and 17m12s. `--limit 1` returned the Docs
guard row; once that reads "completed", the agent pushes and cancels the full run in progress. Fix: "`gh run list
--branch <branch> --limit 6 --json status,workflowName,headSha` — push only when no run for the branch's last pushed
commit is `queued` or `in_progress`." The same command sits in `.claude/rules/shipping.md` and HANDOFF's header — a
separate filing.

**F3. "A permission question takes its recommended answer" lets the agent give itself permission he never gave
(contradicts D596).** Case: "May I build the guard against typed-in scripts tonight? Recommended: yes", or "May I fix
the Quals dead links tonight?" — he sleeps; step 7 takes "yes"; a hook is added, or a look and wording he has not been
shown is changed (that item says "His answers come first"). Cause: the agent decides which questions are
"permission". Fix: "If he does not answer, the night goes on (D596). An unanswered question is never a yes. A job on
the Tonight list needs no permission question — the command is the permission. A job not on it is not built tonight
unless he answers yes. The one default that is taken: the night runs in this chat (D667, D857). A product choice is
never guessed: that piece waits; the rest goes on."

**F4. "Tonight" is defined three different ways, and the strict one would have dropped the 14 Oct OIL job.** Step 4
"ruled, with its wording and design settled"; the checklist "a ruling or a backlog item that says what to build";
Part 2 "never build what he has not ruled". D816 and D818 left the OIL job's wordings "shown to him on the build, his
to change" — under step 4 the night's most valuable job is "not tonight". Under the checklist, `[KBD-PUCK]` ("his to
place") qualifies. Fix: "Tonight: his ruling orders it, or its backlog item is placed by the agent and changes no look
and no words a person sees; its design is settled. A new sentence his ruling leaves to the build is written to the
writing guide and shown to him in the morning as built, his to change. A job whose item says 'his to place', or 'his
answers first', is not tonight." The checklist line and Part 2's 'Never' line point at that bullet.

**F5. The allowance check misses the two limits most likely to stop an 8-hour night.** The usage reading returns a
5-hour limit, the weekly limit for all models and a separate weekly limit for Fable. An 8-hour night spans two 5-hour
windows; a full check plus a Fable read can hit the 5-hour limit mid-job. Fix: step 3 reads "the 5-hour figure and when
it resets, the weekly figure, the Fable weekly figure, and this chat's fullness (`get_usage`, loaded first)"; Part 2's
stop rule adds "…or when the 5-hour figure passes 85% — commit, push and write the block before it runs out, and
resume after its reset."

**F6. The advice to start a fresh chat points at a "Part 5" that does not exist, and cannot be followed unattended.**
D667 sets the fresh-chat preference aside for unattended runs; D857 said "just work on this chat through the night".
Fix: "If the chat is past about half full, say so in the message, with its figure. The night still runs here (D667,
D857) and compacts by itself; the state goes into the repo first."

**F7. Keeping the PC awake is under-specified.** The tool needs `until`: "turn_end" lets the PC sleep when the turn
ends; "session_idle" lets go after about 5 minutes idle. Waiting on an 18-minute background gate run with the turn
ended leaves the session idle. Fix: "Call `request_keep_awake` with `until: "session_idle"`. Through the night, wait on
a long run inside the turn (Monitor, or a foreground wait), never by ending the turn."

**F8. A reader's or walker's report can be lost at a compaction.** The findings exist only in the conversation until
the next commit. Fix: "A helper's report (reader, walker, scenario designer) is saved into the repo — its brief's folder
or the evidence sheet — the moment it arrives, before anything is done about it."

**F9. Part 2 opens a pull request at night; the Branches paragraph offers one in the morning — they clash for a branch
cut from unmerged work** (two overlapping pull requests, the situation D864 settled by closing 505). Fix: "A job cut
from `main` gets its pull request when its check closes, so GitHub's checks run while he sleeps; stop watching it at
once. A job cut from another unmerged branch gets none at night: the morning report offers him the one-pull-request
choice (D822, D864)."

**F10. D761 is filed under the wrong list, and the "jobs without a ChatGPT read" list is never written.** Fix: delete
the clause from Not-tonight; step 5 adds "While the ChatGPT readers are out, every job that needs a code read is written
onto `OUTSTANDING.md` `[NO-ASTRA-LIST]` in the same change (D761)"; a morning check box for it.

**F11. The trigger fires on "I'm going to sleep" even when he has named the night's work** (12 Oct, D766: "continue to
finish this till completion step 8"). Fix: "If his message names the work, that is the night's work. Part 1 shrinks to
the questions his words leave open and step 9."

**F12. "Read the order" trusts records that are stale tonight, and the "is it level" command does not show that.** On
`main`, `## Next, in order` still says "NEXT: ONE batch of three approved builds" (live since 506); two `## Now` blocks
say "none started"; `[ONE-DATE-CALENDAR]`'s heading still says "WAITING FOR HIS LOOK" though 495 merged. `git status -sb`
on a fresh worktree branch shows no upstream. Fix: step 1 "`git fetch origin`, then `git rev-list --left-right --count
HEAD...origin/main` (0 0 = level)"; step 2 "Before a job counts as a candidate, confirm it is not already done: its pull
request's state (`gh pr list --state all`), `git log origin/main`, `OUTSTANDING-ARCHIVE.md`. A stale line is named in
the morning report, not acted on."

**F13. "Each job runs the bug-check order in full" ignores D485.** Fix: "Each job — or each batch of related jobs on
one branch, checked once at its riskiest tier (D485) — runs the bug-check order in full."

**F14. "Documents only" is inaccurate, and the document check can be skipped all night.** Steadying a test changes
browser tests, needs the lock and starts the full checks. The document check runs at a turn's end, which a one-turn
night never reaches; editing records during a gate run fails the run (observation 595). Fix: rename the third list
"Tonight, nothing in the app changes", adding "a test change still takes the lock and the gates"; Part 2's commit bullet
adds "`cd raptor-port && npm run docsize` before each commit of records; no record is written into the repo while a
gate run is going."

**F15. His reading: the message is not a one-minute read.** "Not tonight, a line each" over about 100 items is pages
long; the message also leaves out how long each job will take and the allowance figure. Fix: "the night's jobs in
order, a line each: what he will have in the morning and a rough time, quoted from the walk ledger or marked a guess";
"'not tonight' — only the ones he would expect to see, a line each with the reason; the rest as a count"; "the
allowance: the weekly figure now and roughly after the night; the chat's fullness".

## Faithfulness to his rulings

Apart from F3 (D596), F6 (D667, D857), F10 (D761) and F13 (D485), the rules stated are supported (D596, D667, D766;
D541, D853; D790; D822, D864; D151, D228; D368; D70; observation 594). No newer ruling broken beyond those. Left out:
the "jobs without a ChatGPT read" list (F10); saving helper reports at once (F8); each evidence sheet's own "Questions
waiting for him" list (D596) — the single list in HANDOFF is acceptable if each evidence sheet points to it.

## The commands it names

`git fetch origin` yes · `git status -sb` no (F12) · `gh pr list --state open --json …` yes · `gh run list --branch <b>
--limit 1` misleads (F2) · `gatelock.mjs status` yes · `ListAgents` not reachable from a helper; `list_sessions` works as
a fallback · `get_usage` yes, a deferred tool, more figures than the draft uses (F5) · `request_keep_awake` needs `until`
(F7) · the rulings grep yes.

## The Part 1 messages the reader wrote

**The night of 14 Oct 26, replayed** (commit 1d29b83c8 already held that night's plan; ignored): Tonight — (1) the
leftovers batch pushed onto 505; (2) the small OIL job on its own branch, full check, a fresh Opus read and Fable's,
its button wordings those of his ruling, shown in the morning, a guess of 3 to 5 hours; (3) if time is left, archiving
spent one-off permissions. Not tonight — calendar step two (his iPhone look first); the leftovers' small faults (a look
or words: his answer first); the Logic page and the words pass (pictures first); the overnight guide and the
chat-fullness sign (he said tomorrow). Questions: none. Compared with the real night: the guide's "no permission
question" is right once F3 is fixed; that night's "if time is left" list held faults whose item said "his answers come
first" — the guide is right for (a) and (c); "push before the first job" is right (D667); the plan matched on Fable
until D858 dropped it; "this chat" was right (F6).

**Tonight, from `main`:** (1) `[OIL-PLAN-SWITCH-UNASKED]` on its own branch, full check (OIL: a fresh Opus read and
Fable's); (2) `[GUIDE-ONE-MARK]` drafted and read, for his approval; (3) `[GLOW-PLACES-LOOK]` pictures; (4) steady the
Leave War tests. Not tonight — calendar step two; the leftovers' small faults; the guard against typed-in scripts (a
standing check on his Claude setup); the keyboard jobs, the sleeker-interface pass, the Tracker graph; about 90 others
as a count. One question: has he had his iPhone look at the new date calendar (live 13 Oct)? Recommended: if yes, step
two is the next big job, its own chat. Allowance at the read: weekly 36%, 5-hour 1%, Fable 14%.

Could not be classified by the three lists alone: `[SHELL-SCRIPT-GUARD]` (his go, D811, but a hook — on the Never
list); calendar step two (D800's look not recorded in the repo; its heading stale); `[OIL-PLAN-SWITCH-UNASKED]`'s tier
(the item says WALK, question 1 of the checking guide says FULL); faults the agent placed without a ruling of his
(`[DISCARD-FILING-NOOP]`, `[ONE-RULE-LEFTOVERS]`, `[OIL-NOTIFY-SEEN]`, leftovers (d) and (e)) — depends on F4;
`[COMPACT-WHEN-MOD]`'s picture; `[HWW-RULINGS-SIZE]` (its marker not checked).

## Not checked by the reader

A real night; `PushNotification` and `ListAgents` (not reachable from a helper); the keep-awake call; that a message
typed mid-turn reaches the agent at the next step (from how the platform works, not tested); the checking guide beyond
§0a and §5; time estimates against the walk ledger; the morning report against a real night's evidence. Style only:
the walker's model (Sonnet 5.5, D588, D787) not named; the Never list could name "his Claude settings" more plainly.

## What the host did

Checked before taking: F2 (a push on `claude/oil-uncancel-load-ask` lists two runs per commit, "Docs guard" and
"Deploy to GitHub Pages" — the full checks); F7 (the keep-awake tool's own description: "session_idle … lets go once the
session has been idle for about 5 minutes"). All fifteen findings taken into the draft, in the reader's wording or
close to it; F2's same command in `.claude/rules/shipping.md`, `HANDOFF.md`'s header and the session-handoff guide is
filed as `[RUN-CHECK-BOTH-RUNS]`, not changed here (a rule and a working guide — his approval). F12's stale records:
named to him; the two merged `## Now` blocks are this chat's handoff to clear.
