# Rules diet step 4, part 2 — the account of the five always-loaded files, by requirement (8 Nov 26)

**What it is.** The account the build brief asks for (`2026-11-08-rules-diet-step4b-build-brief.md`, step 6; the plan
`../plans/2026-11-07-rules-diet-plan.md` §3): every requirement of the old text of `.claude/rules/shipping.md`,
`doc-structure.md`, `record-decisions.md`, `plain-language.md` and `bug-check.md` — a rule, a condition, an exception, a
command, a number — with its rulings and the checklist line that states it now, or "archived" with why it states no
rule. **Compared:** old = `7744e66db` (each file's old text, now whole in
`raptor-port/docs/archive/rule-files-2026-11-08.md`); new = the working tree of this commit. Old and new line numbers are
each file's own. Built by one Opus helper; not yet read by the two blind readers (D1739). **Use it as a map, not as
evidence** — the old text and the full rows are the authority.

**How it was made.** Each old file read line by line; the full row of every ruling a line cites read (its meaning
column) where the line states more than a pointer; each requirement written as one checklist statement with its numbers.
The checklists were written into each file ABOVE the old text first, and the old text then moved by
`backlog-archive.mjs --move` (`--dry-run` first): the move's own after-check runs the gate's inventory, which fails if a
live general ruling is no longer stated in a file that loads — moving first would have rolled every move back. The five
moves: shipping 125 lines (sha256 `0006df09abcfe98d`), doc-structure 80 (`7cba99fe9105bb71`), record-decisions 93
(`27ead2c2a7c0d277`), plain-language 64 (`f2830f344fa30873`), bug-check 80 (`058aae02643cfe71`) — each the whole body
below the title, each landing once, the inventory clean after each.

**Mechanical checks.** Every D-number each old file carried is in its new checklist, and none was added (a script over
both, the pointer line left out): shipping 35/35, doc-structure 29/29, record-decisions 13/13, plain-language 6/6,
bug-check 15/15. `node raptor-port/scripts/backlog-archive.mjs --rulings` — clean (exit 0): every statement citing a
general ruling also cites the live rulings marked as changing it, none cites one archived as replaced. `npm run docsize`
— OK (exit 0).

**Kept headings other files point at:** shipping `## "Push" and "merge live"`, `## The loop, change by change`, `## "Done"
means LIVE — and live means ON VERCEL`, `## The checks`, `## Pull requests` (and the 2 Nov pointer heading, verbatim);
doc-structure all seven of its headings; record-decisions `## The lapse this exists to stop`, `## The rule`, `## Two
catches…`, `## When a ruling overwrites another — fix what it leaves behind`, `## If you notice…`, `## Read it before you
ask him anything` with `### The check`, and the `## Keeping the list whole…` pointer heading verbatim; plain-language `## A
check before you send`; bug-check `## The trigger — you decide this, never the owner`, `## A fault he finds that the walk
missed`, `## The three that get skipped…`, `## When to call in Fable and Codex`, `## What is not a finding (D56)…`, `## If
you catch yourself…`, and the `## With the Claudex loop` pointer heading verbatim. Dates in headings dropped; capitals in
headings kept where a pointer quotes them.

**The rules hooks and guards enforce, stated in words for Codex (plan §3):** the push and lock guard — shipping 127–131,
with its gap (it lets a push through when it cannot reach GitHub); the per-message rulings check — record-decisions 18;
the document check at a turn's end — doc-structure 87–88.

## shipping.md (old 127 lines → new 156)

| # | Old | Requirement | Rulings | New (section, lines) |
|---|---|---|---|---|
| S1 | 3–4 | Unscoped on purpose: a notes-only chat ships too; `raptor-port/CLAUDE.md` loads only once a `raptor-port/` file is opened | D140, D141, D390, D1735 | head, 3–4 |
| S2 | 4–5 | Gathered in the spring clean, 24 Sep 26, from the guide's §How to work here and §Build & verify | (D140…) | history — archived: where the text came from, no rule |
| S3 | 5–6 | The Pages-era wording and the full story behind each rule: `raptor-claude-md-2026-09-24.md` | — | head, 6 (pointer kept) |
| S4 | 6–7 | The rulings behind it: `how-we-work.md`; the traps of the checks and deploy: `gates-and-deploy.md` | — | head, 4–5 |
| S5 | 11–13 | Push a branch freely; ask before `main`: a branch push changes nothing official, gives him a Vercel link to look at, needs no permission; `main` gated behind his "merge live" | D60 | Push, 10–12 |
| S6 | 13 | "Push" and "merge live" are not synonyms | — | Push, 11–12 ("not the same thing") |
| S7 | 11 | (in the parenthesis) notes only merge by themselves, but not a rules-diet step | D1407, D1737 | Push, 13–16 |
| S8 | 13–14 | The question only arose because D59 took the repo private (public again since D106, D1530), which meters Actions minutes (D89: checks move to his PC) | D59, D106, D1530, D89 | story — archived: why the question arose; the repo's state now is The checks 107–110 and Done 80–81 |
| S9 | 14 | Never push while a pull request's checks are running: any push restarts them and cancels the run in progress | D151 | Loop, 41–45 — stated once, beside the look-first command (the old text said it three times: 14, 32, 83–84) |
| S10 | 15–16 | Nothing reaches `main` without his explicit "merge live", whatever the change that touches the app | (2 Sep 26) | Push, 13 |
| S11 | 15–16 | His words of 2 Sep 26 ("dont automatically push to live…") | — | his words — archived; the rule they state is S10 |
| S12 | 16–17 | Since D1407: a pull request that changes only notes goes live by itself once its run is green; a rules-diet step waits for his word all the same | D1407, D1737 | Push, 13–16 |
| S13 | 17 | "Only notes" — the list, and the never-list (unscoped `.claude/rules/*.md` with this merge rule, hooks, settings, skills, agents, `launch.json`, `AGENTS.md`, `raptor-port/CLAUDE.md`, `.github/`) | D1407 | Push, 17–22, every path kept; **plus "never a working guide"**, carried up from old 115–116 (S64) — question Q1 |
| S14 | 17–18 | The agent checks the file list, merges and says so in its report | D1407 | Push, 14–15 |
| S15 | 18 | Since a few checks read documents (permissions table §11, `engine-rules.md`, `remarks-vocabulary.md`, behaviour registers) and the gates skip a notes-only pull request, the agent runs `npm run rulecheck` and the doc-reading unit tests on his PC before such a merge, until [REVIEW-LAYERS] builds the guard, "with the secrets scan" | D1407 | Push, 23–26 — the clause "with the secrets scan" kept in its old place (question Q2) |
| S16 | 18–19 | The 2 Sep 26 rule ended the old "auto-merge is the default" rule of 24 Aug 26 | — | history — archived: an ended rule, nothing to do |
| S17 | 19–20 | Parallel chats merge one at a time, each on his word; the later one merges `main` in first and renumbers its own clashing rulings | D78 | Push, 27–28 |
| S18 | 23–25 | Not held to the end: two to four related jobs of one area share one branch, one check, one merge on "merge live"; a job he wants live at once goes alone; nothing piled up for one merge at the end | D1087, D485, D822 | Loop, 32–33 |
| S19 | 26–29 | change → own tests green locally (whole gate set too once private again) → commit and push to the session branch (one open pull request accumulates the lot) → once ready for his look (built and checked) and the preview is Ready, send the link — not after every push of unfinished work | D905 | Loop, 34–37 |
| S20 | 28 | His words of 15 Oct 26 ("u are still working…") | D905 | his words — archived; the rule is S19 |
| S21 | 29 | The link and the pictures come whenever you need him to review something, and when the work is done | D906 | Loop, 38 |
| S22 | 30–31 | Do not go quiet waiting on the checks → take the next change; while a preview or run cooks he will hand more work: take it; never idle waiting on a rollout | — | Loop, 39–40 |
| S23 | 32–36 | Never push while that pull request's checks run (even notes-only); look first — a push starts two runs, the documents guard and the full checks; `gh run list --branch <branch> --limit 6 --json status,workflowName,headSha`; push only when no run of the last pushed commit is `queued` or `in_progress`; batch, push when finished | D151, D870 | Loop, 41–45 — command and states exact |
| S24 | 37–39 | Read the checks' conclusions on your next turn after each push and fix a red one then — never discover it at "merge live" | — | Loop, 46–47 |
| S25 | 38–39 | 7 Sep 26: six red runs sat unread | — | story — archived |
| S26 | 40–42 | A green pull request sitting open is the intended resting state; the link never gates the merge — only "merge live" does | — | Loop, 48–49 |
| S27 | 41–42 | 9 Sep 26: an older auto-merge clause got a fix merged without him | — | story — archived |
| S28 | 43–45 | Where the link is: the `vercel[bot]` comment (Preview URL stable per branch), or the head commit's Preview deployment (`gh api repos/<owner>/<repo>/deployments`, then its statuses); hand it to him every time | — | Loop, 50–52 — commands exact; "every time" kept as written (it reads beside S19's "not after every push") |
| S29 | 46–48 | Vercel is his surface, never your drive target: behind his sign-in, your browser gets a 302 to `vercel.com/sso-api`; your fast surface is the local `npm run build && npx vite preview`, the same bundle | — | Loop, 53–55 |
| S30 | 49–50 | The preview is not a gate: `vercel.json` builds `raptor-port` for every push, untested; correctness rides the gates | — | Loop, 56–57 |
| S31 | 52 | Pointer heading: "Ship once per session" moved to `rule-files-2026-11-02.md`; its live points in The loop and The checks | D1556, D1086, D1087 | heading 59, verbatim |
| S32 | 54 | Heading "Done" means LIVE (owner 10 and 12 Aug 26; D143, 24 Sep 26) | D143 | heading 61 (dates dropped; D143 cited at 78 and 82) |
| S33 | 55–57 | On "merge live": closing records were pushed before his look, true once live; merge at once if the run on the last pushed commit is green; confirm the live app; nothing pushed between his word and the merge | D1742 | Done, 63–65 |
| S34 | 57 | If his look brings a change, the fix and its records are pushed together and his look asked again | D1742 | Done, 66 |
| S35 | 57 | His "auto merge live" for a run covers all it produces, its records pull request too | D1093 | Done, 67 |
| S36 | 58–60 | Tell him when done with `PushNotification` — genuinely finished, and blocked waiting; one line, plainly; not for progress, not for a quick reply he is clearly watching, never twice for the same work | — | Done, 68–70 |
| S37 | 60–62 | Since D1097: every stop that waits on him (work done and next step due, a question, an answer, a look, any input) gets its one notification whether or not he seems to be watching; an unattended run keeps its one at the end | D1097, D596 | Done, 71–73 |
| S38 | 63–67 | Green check ≠ done, merged ≠ done; once "merge live" — never before — carry it through without checking in: merge on green → `main`'s run green (GitHub's machines while public, his PC once private) → Vercel live app READY (`gh api repos/<owner>/<repo>/deployments?environment=Production`, statuses) → one notification with the link | D143 | Done, 74–78 — command exact |
| S39 | 67 | His "merge live" (or "merge now") means his own look is done — never ask about it again | D1640 | Done, 79 |
| S40 | 67–68 | His phone look replaces the live-page look on GitHub Pages (gone since D59, D343; public again D106, D1530); the live app is behind his sign-in; the agent is never given a login | D59, D343, D106, D1530, D143 | Done, 80–82 |
| S41 | 69–71 | During an unattended run a question is no reason to stop or notify: park it in the one list, carry on; links and questions in the closing report; one notification, at the end or when nothing authorised can continue | D596 | Done, 83–85 |
| S42 | 72–74 | The only reasons to come back sooner: a red check you cannot fix, a genuine question, a merge he told you to hold; waiting is not — schedule a check-in | — | Done, 86–87 |
| S43 | 77 | While public, GitHub's run of the pull request is a job's full check | D1086 | Checks, 91 |
| S44 | 78–79 | Open the pull request into `main` as soon as built — no pull request, or one based on another branch, starts no checks — so the run goes during the walk | D1086 | Checks, 91–93 |
| S45 | 80–81 | About 6 minutes since D1089 (5m53s measured 20 Oct 26), the same set as his PC's (build, the original's 728, unit, browser, Tracker's, rule and document checks) | D1089 | Checks, 94–96 |
| S46 | 81–82 | On his PC only the tests of what you change and the build the walk drives; no full gate run there | D1086 | Checks, 97 |
| S47 | 82 | Nothing merges until GitHub's run is green and "merge live" (notes-only: D1407 — not a rules-diet step, D1737) | D1086, D1407, D1737 | Checks, 98–99 |
| S48 | 82–83 | A red run is fixed before his look is asked for | D1086 | Checks, 99 |
| S49 | 83 | Its slowest checks split across more machines, every area still run | D1089 | Checks, 95–96 |
| S50 | 83 | GitHub's machines download without the walks' pictures, which no check reads | D1091 | Checks, 100 |
| S51 | 83–84 | The run that counts is on the last pushed commit; walk fixes batched, pushed once the run in progress finished | D151 | Checks, 101–102 |
| S52 | 84 | Once private again (D106 ended — D1530 keeps it public until he says otherwise), the full check is back on his PC | D89, D106, D1530 | Checks, 107–110 (merged with S54, S55 into one bullet) |
| S53 | 85–87 | A small follow-up fix on an open pull request whose whole set passed runs only its touched tests before the push; GitHub's run is its full check; nothing merges until green; a job's first push keeps the whole set on his PC — except while public | D902, D1086 | Checks, 103–106 |
| S54 | 88–89 | While public (until he says otherwise) the checks run on GitHub's machines (the workflow sends a public repo there by itself) and his PC's runner stays stopped; private again, the runner starts again | D106, D1530 | Checks, 107–109 |
| S55 | 90 | When private: read first how the checks run on his PC — `gates-and-deploy.md` §The checks run on HIS PC | D89, D106, D1530, D1556 | Checks, 109–110 (pointer kept) |
| S56 | 91–92 | Parallel chats take turns through one lock on his PC; each keeps its own branch, ports and rulings range | D228 | Checks, 111–112 |
| S57 | 92–96 | Before the full unit suite, a browser run of more than one file, the Tracker smoke or a fanned-out walk, take the lock (`gatelock.mjs take "<branch> — <what>"`, or by hand the folder `C:\Users\User\.raptor-gates-lock`, which fails if it exists, and `owner.txt`); held → wait, check every few minutes, never start alongside; release the moment the run ends, pass or fail (`release`, or delete the folder) | D228 | Checks, 113–117 — folder and command exact |
| S58 | 96–97 | `gatelock.mjs run` takes, runs the whole set in order, releases — a run you stop does not: release at once | D228 | Checks, 118–119 |
| S59 | 97–99 | Stale after 2 hours with no sign of life; `run` and `exec` refresh each minute; a hand-taken lock refreshed with `beat` ([GATELOCK-STALE-LIVE]); break a stale one and say so, asking its holder first while a chat that could hold it is open | D228 | Checks, 121–123 |
| S60 | 99–101 | No lock for one unit test file, a typecheck or one walk script on a served build; anything that builds — a browser run of even one file — waits until free; the folder is outside every checkout, shared by every worktree | D228 | Checks, 124–126 |
| S61 | 101–105 | `gatelock.mjs exec "<branch> — <what>" -- <command>` takes, runs one command, always releases; a guard (D976, [PUSH-LOCK-GUARD]) refuses a full run without the lock, anything that builds while another chat holds it, a push landing on `main`, a push while that branch's checks run; its refusal says what to run | D976, D228 | Checks, 118–120 (exec), 127–129 (guard) |
| S61a | — (plan §3) | New words: the guard is a backstop — it lets a push through when it cannot reach GitHub, and Codex has no hooks, so every rule is kept by hand | (D976) | Checks, 129–131 — question Q3 |
| S62 | 106–111 | Parallel chats talk so they do not clash: before changing a file or function another open chat's branch changes (`git diff --name-only $(git merge-base origin/main <branch>) <branch>`), message it (`ListAgents`, `SendMessage`) — what you change and leave; answer the same; settle an overlap at once; repeat promises in your `HANDOFF.md` block; the merge order and "merge live" stay his — a chat never merges for another | D302, D60, D78, D1407, D1737 | Checks, 132–137 — command exact |
| S63 | 112–114 | Docs-only changes skip the gates (`paths-ignore`: `**.md`, `.claude/**`, `docsize*.mjs`, `backlog-archive.mjs`, `docs-guard.yml`) but the Docs guard (two to three billed minutes) runs on every pull request and every push to `main` | — | Checks, 138–140 |
| S64 | 114–116 | An exemption from the gates only: notes-only merges by itself once green (a rules-diet step on his word); any other docs change — a rule that governs the agent, a hook, a setting, a working guide, a workflow — merges only on "merge live" (corrected 17 Sep 26, narrowed 27 Oct 26) | D1407, D1737 | Checks, 141–143 (the two dates dropped) |
| S65 | 116–117 | A pull request mixing code and docs runs everything; GitHub judges the whole pull request, so once it carries code even a notes-only push re-runs every gate | D151 | Checks, 144–145 |
| S66 | 121 | Do not watch pull requests (15 Aug 26) | — | PRs, 149 |
| S67 | 121 | The app's "Auto-fix" too: found on, switch it off and say so | D1090 | PRs, 153 |
| S68 | 121–123 | The harness auto-watches an opened pull request and floods his phone with check/review/Vercel `<wake>` blocks for little gain | — | PRs, 149–150 |
| S69 | 123–124 | (gates and live page checked before the pull request opens; he leaves no review comments) | — | reason — archived: why watching gains little; the rule is S66 |
| S70 | 124–126 | Call `unsubscribe_pr_activity` immediately after opening any pull request; never leave one watched; the ship-to-live duty unchanged; an explicit "babysit this PR" ask overrides, for that pull request only | — | PRs, 150–152 |
| S71 | 127 | Reading the preview URL off the pull request once is not watching — fetch the link, then unsubscribe | — | PRs, 154 |

## doc-structure.md (old 82 lines → new 96)

| # | Old | Requirement | Rulings | New (section, lines) |
|---|---|---|---|---|
| T1 | 3–5 | His words of 24 Sep 26: read only what applies, know how to navigate, new information follows the structure by itself, no more spring cleaning | D140 | head, 3–4 — stated as the rule; his quoted words archived |
| T2 | 5–6 | No line targets — whether a block is needed where it sits, organised and written clearly | D141 | head, 4–5 |
| T3 | 6 | A move never rewords; a rewrite is checked for meaning | D138 | head, 5 |
| T4 | 6 | The rulings' full text is a searched tier; each area converts to a page of how it works now | D390, D1735 | head, 5–6 |
| T5 | 7 | The full policy and the tiers: `doc-budget.md`; this file its short, always-loaded form | — | head, 6–7 |
| T6 | 10–13 | Already loaded: the unscoped rule files (named) and `decisions/how-we-work.md`; `raptor-port/CLAUDE.md` loads once a `raptor-port/` file is opened; most of its rules one line naming its full text in `guide-full.md` | D391 | What a chat reads, 10–14 |
| T7 | 14 | At the start of a chat: `HANDOFF.md` (`## Now`, a block per chat) and what is next | — | 15 |
| T8 | 15–17 | By itself, per area: the eight area files (inputs — D802; design — D1554, D1735) load when a matching file is opened with the Read tool | D802, D1554, D1735 | 16–19 |
| T9 | 17–18 | A shell read does not load them, nor does planning before any file is open | D390, D1735 | 19–20 |
| T10 | 18–19 | Before planning or editing in an area, open its file yourself — People & accounts for accounts, sign-in, Admin → Users, Quals, one-door, posting in or out, archive, restore, delete | D390, D1735 | 21–22 |
| T11 | 19–20 | A brief for Astra names the area files and their full-text files — Codex loads none of this by itself | D140, D141 | 23–24 (D390, D1735 cited too: the marks D140 carries) |
| T12 | 21–23 | A ruling loads as one line — on a page, as a statement; its full row does not; open the full row before acting on its detail or asking him (`grep -h '^| D149 |' …`, the shell; the Grep tool hides a long row) | D390, D1735 | 25–28 — command exact |
| T13 | 24–25 | When the job needs it: the reference doc the map names; never whole: an archive, a full-text rulings file, the guide's full text — search it | — | 29–30 |
| T14 | 26–27 | Before telling him anything is undecided or missing: search every rulings file, `DECISIONS-ARCHIVE.md`, `OUTSTANDING.md` | — | 31–32 |
| T15 | 30–45 | The table, one home each — every row | D390, D1735, D391 | 35–50 — every row kept; only capitals lowered (ONE, EVERY, AND, NOT) |
| T16 | 48–49 | Finished backlog item → `OUTSTANDING-ARCHIVE.md` by `backlog-archive.mjs <ID> --homes <file>`, after its lasting facts have a pointer in a live doc | D29, D137 | When it leaves, 53–54 |
| T17 | 50–51 | Replaced ruling, one restated in full (a fresh reader checking each), a spent permission → `DECISIONS-ARCHIVE.md` by `--rulings`; mark in its full row; the command drops its short line; on a page every line citing it rewritten first | D971, D136, D137, D1735, D390 | 55–58 |
| T18 | 52 | A merged `## Now` block → removed at the next handoff, once its open residue is filed | — | 59 |
| T19 | 53–55 | A passage a newer ruling supersedes, in a file every chat reads → moved whole to `raptor-port/docs/archive/` in the same change, new rule and one-line pointer left | — | 60–62 |
| T20 | 56–58 | Anything no longer needed → moved whole by `--move` (exact anchors, byte for byte, a pointer naming the destination); `docsize.mjs --moves` lists what left and did not arrive | D141, D390, D1735 | 63–65 |
| T21 | 61–62 | He works until the context is full, hands off, seldom compacts, merges only when happy on "merge live", sometimes runs two worktrees and merges both | D140, D141, D390, D1735 | In his workflow, 68–69 |
| T22 | 63–65 | The handoff: the skill rewrites this chat's block, files what is open, removes merged blocks, gives a ready-to-paste opening line naming `HANDOFF.md` and the branch; Remote Control on in the new chat (already connected by the app's setting; where off, the new chat switches it on) | D1195 | 70–73 |
| T23 | 65–68 | He picks nothing — he only pastes: no branch or worktree picker, so the outgoing chat releases its branch as its last step and the opening line switches the new chat to it, with what to do if refused — new job: level with `main`; unmerged branch continuing: that branch; just-merged: never; compaction the same: persist first | D975 | 74–77 |
| T24 | 69 | Unattended runs: moved whole to `doc-budget.md` §5; the overnight guide carries the same rulings | D596, D667, D766, D1556 | 78–79 (pointer kept) |
| T25 | 70–71 | Parallel chats touch only their own block, backlog items, D-number range; the later merge brings `main` in first | D78 | 80–81 |
| T26 | 72–73 | The Claudex loop (who builds, who reads); plans and review logs are tier-3 docs; the ripple walk reads `feature-impact.md` | D67, D353, D590, D601, D790, D903, D1734, D1738, D1739 | 82–84, unchanged |
| T27 | 76 | `npm run docsize` in CI and, for everything but sizes, at the end of every turn (the Stop hook) | — | The check, 87–88; **plus** "without hooks — Codex — run it yourself before you end a turn that changed a document" (the hook's rule in words, as `AGENTS.md` says) — question Q4 |
| T28 | 77–80 | What it fails on — every item, `HANDOFF.md`'s shape and its three headings in order | — | 89–92 |
| T29 | 80–82 | Each always-read file has a size tripwire: crossing it means move what does not belong, never cut to a number; a change touching `raptor-port/src` never trims a document | D141, D390, D1735, D29, D137 | 93–94 |

## record-decisions.md (old 95 lines → new 84)

| # | Old | Requirement | Rulings | New (section, lines) |
|---|---|---|---|---|
| R1 | 3–5 | Unscoped, loads before any project file; one file per area under `.claude/rules/decisions/`, `DECISIONS.md` the front door and map; the hook fires this check on every message he sends | D137 | head, 3–5 ("the last section's pointer below" dropped: a cross-reference) |
| R2 | 9 | The lapse: two misses of 21 Sep 26, kept in `guide-full.md` §Write his rulings down at the moment; the lapse is misclassifying, not forgetting | D13, D137, D1556 | The lapse, 9–11 (pointer kept) |
| R3 | 13–15 | The moment he states something that outlives the task, add it to its area's rulings file before the work it implies — not after, not at the session's end, not "once I see where it lands"; the three steps (and a converted area's own steps) at the head of `DECISIONS.md` | D13, D137 | The rule, 15–17 |
| R3a | — (plan §3) | New words: ask it of every message he sends — the hook asks it; without hooks (Codex) ask it yourself | — | The rule, 18 — question Q4 |
| R4 | 17–18 | What counts: a ruling, a product decision, a correction to how you work, a preference, a "leave it", an explicit no, a supersession, an answer to your question | — | 19–20 |
| R5 | 20–21 | What does not: ordinary task instructions — they die with the task | — | 21–22 |
| R6 | 23–25 | Every entry names the file that will carry it — make that file carry it, with its D-number beside the ruling there; the gate fails a new row whose home never mentions its number ([RULING-HOMES-AUDIT]) | — | 23–24 |
| R7 | 24–25 | 28 Sep 26: one row's "corrected" home had never been corrected | — | story — archived |
| R8 | 26–29 | The rulings list is an index, never the only home; nobody reads an index while building; the home is the document the next session opens (the behaviour register, `engine-rules.md`, `ui-contracts.md`, the standing order, the area file, or `raptor-port/CLAUDE.md` if every task needs it) | — | 25–28 |
| R9 | 29–30 | Never `OUTSTANDING.md` alone: the backlog is where finished work leaves from | D29, D137 | 29–30 |
| R10 | 32–33 | Put it where it belongs, not where you happen to be working — the error both misses shared | — | 31 |
| R11 | 37–41 | The checkpoint sweep: before any handoff, any closing commit, any "done" report — re-read what he said, list every ruling, check each in its area's file and its real home, and every ruling it replaced or restates in full and every permission it spent marked and archived (`DECISIONS.md` step 2) | D971 | Two catches, 35–38 ("this is what catches what the moment missed" — a reason, dropped) |
| R12 | 42–47 | The report line: every closing report carries, beside Status / Changes / Checks / Walk, `Rulings: <n> recorded → <area file(s)> (D<x>–D<y>)` — or `Rulings: none this session`; it makes a miss visible to him; the same shape as `Walk:` | — | 39–41 — the line's shape exact |
| R13 | 49, 51 | Heading (D201, 26 Sep 26) and his words | D201 | heading 43; his words archived |
| R14 | 51–53 | The later ruling wins, but the older lives on in files, in the app, and by its absence from lists; so, in the same change that records the ruling: | D90, D201 | 45–47 ("nobody reading those later knows" — a reason, dropped) |
| R15 | 55–57 | The documents: search for the rule's subject, not only its number, across `raptor-port/docs/` (reference docs, `data-model.md` and §11, `handover-dataverse.md`, specs, look cards), code comments, test names; correct each or mark it with a pointer | — | 48–51 |
| R16 | 58 | The app: file the build in `OUTSTANDING.md` with its place | — | 52 |
| R17 | 59 | The lists: add the ruling to every list it belongs in | — | 53 |
| R18 | 61–62 | The new row's "Where it lives now" names what was fixed and filed; a change inside `raptor-port/src` never trims a document — a correction is not a trim | D29, D137 | 55–56 |
| R19 | 66–68 | A ruling you never recorded: say so plainly and record it, however old; never fold it in quietly — he cannot tell captured from merely done | — | If you notice, 60–61 |
| R20 | 70–81 | Heading (added 22 Sep 26) and the story of 22 Sep 26: an approved design ruled on four times (D38–D41) called missing from a stale code comment; his words | D53, D137, D38–D41 | heading 63; one line of the story kept as the reason, 65–66, with its numbers; the rest and his words archived |
| R21 | 85–91 | The check: before calling anything undecided, putting any choice to him, or calling anything missing or unbuilt — search `.claude/rules/decisions/` (every area; an area loads only when one of its files is read), the full rows (a short line or a page's line is the rule; his words, conditions, readings only there), `DECISIONS-ARCHIVE.md`, `OUTSTANDING.md` | D390, D1735, D53, D137 | ### The check, 70–74 |
| R22 | 89–91 | Not the code, not the specs folder; those, by keyword, every time, with the shell's grep — the Grep tool prints "[Omitted long matching line]"; a search that returned no text is not a read; it costs one search | — | 75–76 |
| R23 | 93 | The three failures behind the check — a named entry is a pointer, not a scope; the backlog is read every time; search for a claim's subject, never its phrasing — and why a code comment is never evidence about today (the rulings win; fix the comment): kept in `guide-full.md` | D1556 | 77–80 — stated as rules, pointer kept (question Q5) |
| R24 | 95 | Pointer heading: Keeping the list whole — moved to `doc-budget.md` §5 | D136, D137, D390, D1556 | heading 82, verbatim |

## plain-language.md (old 66 lines → new 60)

| # | Old | Requirement | Rulings | New (section, lines) |
|---|---|---|---|---|
| L1 | 3–7 | Every message, every session, whatever the task; he is not technical; this is the operative short form; the full reasoning in `raptor-port/CLAUDE.md` §How to work here and `guide-full.md` (6 Aug, 10 Aug, 13 Sep 26), the source of truth where they differ; these stand on their own, in force before any project file is read | — | head, 3–7 |
| L2 | 9–11 | Never paste raw output — no log lines, stack traces, JSON, run ids, commit hashes, HTTP codes, `file:line`, CSS class names; read it yourself and report what it means | — | 9–10 |
| L3 | 11 | Example: "The publish step gave up after ten minutes" | — | worked example — archived |
| L4 | 12–13 | Lead with what it means for him; detail only if it earns its place; is it working, is it live, what do I do now | — | 11–12 |
| L5 | 14–16 | Name things the way the app does — never internal function, file or class names; those belong in code comments and commit messages | — | 13–14; its three examples archived (the check's step 2, 40–42, still lists the app's names) |
| L6 | 17–18 | Say what you did and whether it worked; a gate table with counts is fine; a walkthrough of the diff is not | — | 15–16 |
| L7 | 19–21 | Short and ordinary; no flourishes, drum-roll structure, repetition for effect; a reply past a screen is mostly restatement | — | 17–18 |
| L8 | 22–24 | Vocabulary, not depth: never thin out reasoning, trade-offs, caveats; never hide a limitation to save a sentence | — | 19–20 |
| L9 | 25–26 | Technical decisions are yours, said plainly; product direction stays his | — | 21–22 |
| L10 | 27–29 | End at a decision point with a numbered "here's what you do now"; when you wait, the message says so and for what, with your recommendation (a handoff question says whether you recommend it, and why); never only in the next-step box | D904 | 23–25 |
| L11 | 29–31 | Whenever you need his review, and when done, the preview link and pictures; whenever a handoff is due, the ready-to-paste prompt | D906 | 26–27 |
| L12 | 32–33 | Anything on screen talked about — a change, a question, or only what a backlog item is and where — comes with pictures of the real app, the place marked, the first time it is raised; never words alone | D853, D921 | 28–29 |
| L13 | 35–36 | An unavoidable technical term is defined in the same sentence, once, then the plain phrase | — | 30–31 |
| L14 | 38, 40–43 | Heading (added 17 Sep 26) and the story: three times he asked to re-explain, it read as made up | — | heading 33; story archived |
| L15 | 42–43 | A rule you agree with and don't apply is worth nothing; run the check on every message before sending | — | 35 |
| L16 | 45–49 | Check 1: scan for programmer names (the kinds and the example list); delete or replace each with what it means — not defined, replaced | — | 36–39 — the list kept whole: it is what the check scans for |
| L17 | 50–52 | Check 2: the app's names (the list); a thing with no name described in a short phrase | — | 40–42 |
| L18 | 53–55 | Check 3: every claim gets its consequence; he judges importance by consequence | — | 43–44 |
| L19 | 56 | Check 4: shorter is never thinner — the whole text | D825, D832 | 45–49, word for word |
| L20 | 57–58 | Check 5: would it mean anything to someone who never opened the code? That is the whole test | — | 50–51 |
| L21 | 60–62 | A re-explain request is a defect in your writing; re-explain fully, no shortening, not the framing that failed; do not defend the first version | — | 53–55 |
| L22 | 64–66 | Longer context makes it worse — the drift showed up in long, dense replies late in a session; the more context, the harder you run the check | — | 56–58 |

## bug-check.md (old 82 lines → new 77)

| # | Old | Requirement | Rulings | New (section, lines) |
|---|---|---|---|---|
| B1 | 3–6 | Unscoped on purpose, like plain-language; loads before any project file, in force before anything can talk you out of it; the method is `bug-check-order.md`; this file makes you open it, by its checklist, which names the section at each step | D1735 | head, 3–6 |
| B2 | 10–11 | He must never have to say which checks to run; the order is in force the moment any trigger holds | D9 | The trigger, 10 |
| B3 | 13–18 | The five triggers, word for word | — | 11–16 |
| B4 | 22–23 | Read the checklist and, at each step, the section it names — whole, whenever that step applies; not from memory; they change | D1735 | 19–20 |
| B5 | 24–26 | Answer its eight questions (§5) against the actual change; state the tier out loud: NONE / LOOK / WALK / FULL; a question not answerable NO with a written reason is YES | — | 21–22 — the tiers exact |
| B6 | 27–29 | Tell him in one short block what the tier means you will do — the checks, the size of the walk and why, roughly how long; he reads it, does not choose; less is his call, never yours to assume | D607, D608 | 23–25 |
| B7 | 30–33 | Execute in §5's order (roll-call and door check → size the walk, `walk-ledger.md` → walk → gates → the model reads → fix → re-walk → evidence sheet → his look); sizing never means no walk; a test that changes data directly never stands in for pressing a control | D607, D608 | 26–29 — the order exact |
| B8 | 37–38 | A fault he finds that the walk missed: learn by yourself, same day, without asking — fix red-first, write the lesson in §7.11, every later sizing step and walker's brief checks against that list | D1297 | 33–35 |
| B9 | 39 | Every closing report names the lessons added; he may strike any | D1297 | 36 |
| B10 | 43–45 | A code review plus green tests is not a bug check; reading code cannot find a line that is not there | — | 40 |
| B11 | 43–45 | Two frontier models passed the OIL build; he found three unwired surfaces | — | story — archived |
| B12 | 46–48 | The roll-call first: every place the app draws the thing, each with a written *has it / must not, because… / MISSING*; no blank cells | — | 41–42 — the shape exact |
| B13 | 48 | "That one table would have caught all three" | — | story — archived |
| B14 | 49–50 | A walk with no picture did not happen; the closing report carries the `Walk:` line from §9; without it nothing is ready for "merge live" | — | 43–44 |
| B15 | 54 | §4 of the order decides, not habit (D353: scenarios and side questions one, Astra first; a plan's red team both) | D353 | Fable and Codex, 48–49 (D590, D601, D790, D903 cited too: D353's marks) |
| B16 | 54–57 | Short form: scenario design first (ask what is missing, not whether the code is wrong); both reading the code only on money, published records, permissions or persistence; never another static review when what is missing is someone running the app — review pile-on | — | 49–52 |
| B17 | 58–59 | Who they are now: Astra and Sol 6.1 only on his call (D1734), D1738 and D1739 calling Astra for the diet's reworded steps; for work Opus wrote, Astra reviews, Sol 6.1 second where two are required; Fable on call only (a bug Opus cannot crack, a big open-ended plan, on his word); what Codex wrote, Opus reads | D590, D601, D1734, D1738, D1739 | 53–56 ("each time" from D1734's row; D790, D903 cited: the marks D590 and D601 carry) |
| B18 | 60–62 | Unless he calls for a ChatGPT reader: every job needing a code read gets a fresh, blind Opus read of its finished code, never by the chat that wrote it | D790, D1734 | 57–58 (his Pro-plan reason archived; D903, D1738, D1739 cited too: the marks D790 and D1734 carry) |
| B19 | 61–62 | Fable is used for nothing unless he calls for it — the riskiest changes get the Opus read alone | D903 | 59 (his words archived) |
| B20 | 64, 66–67 | Heading (D56, 23 Sep 26 — read before you spend anything) and his words | D56 | heading 61; his words archived |
| B21 | 69–70 | A problem only in data already stored is not a finding: no reviewer, no walk step, no fix; the store is demo data, cleared before the database step | D56 | 63–64 |
| B22 | 72–73 | Both must be true or it does not apply: harm only in stored data, and the code already correct going forward; new data hurt too → a real finding | D56 | 65–66 |
| B23 | 74–75 | "Pre-existing" alone is not this — age versus the data's future | D56 | 67 |
| B24 | 75 | Put the exclusion in the reviewer's brief (§2b, §4) | D56 | 68 |
| B25 | 79–80 | About to skip it: say so to him, plainly, and why; a skipped check he agreed to is a decision; one he never heard about is how three bugs reached him on 21 Sep 26 | — | 72–73 |
| B26 | 82 | Pointer heading: With the Claudex loop — moved to `bug-check-order.md`, after §4a | D1556 | heading 75, verbatim |

## Sizes

| File | Lines | Bytes | Tokens (`--reads`) | Tripwire (lines) |
|---|---|---|---|---|
| `shipping.md` | 127 → 156 | 14,913 → 13,816 | 5,677 → 5,180 | 135 → 172 (rises) |
| `doc-structure.md` | 82 → 96 | 9,428 → 9,622 | 3,564 → 3,615 | 100 → 106 (rises) |
| `record-decisions.md` | 95 → 84 | 6,856 → 6,251 | 2,657 → 2,358 | 160 → 93 |
| `plain-language.md` | 66 → 60 | 5,459 → 5,151 | 2,057 → 1,908 | 70 → 65 |
| `bug-check.md` | 82 → 77 | 5,903 → 5,523 | 2,259 → 2,057 | 88 → 85 |
| **The five** | 452 → 473 | 42,559 → 40,363 | 16,214 → 15,118 | |

`node raptor-port/scripts/docsize.mjs --reads`, before → after:

| Job | Start | Task | Check | Total |
|---|---|---|---|---|
| notes | 34,335 → 33,239 | 24,021 → 24,411 | 0 | 58,356 → 57,650 |
| Leave War | 34,335 → 33,239 | 117,690 → 118,080 | 169,076 | 321,101 → 320,395 |
| scheduler | 34,335 → 33,239 | 96,436 → 96,826 | 130,894 | 261,665 → 260,959 |
| Inputs | 34,335 → 33,239 | 128,290 → 128,680 | 124,019 | 286,644 → 285,938 |
| Tracker | 34,335 → 33,239 | 63,431 → 63,821 | 175,951 | 273,717 → 273,011 |

The task column's +390 is `HANDOFF.md` (9,019 → 9,409 tokens), which the host chat edited during this run — not this change.

**Why the saving is about 1,100 tokens, not the ~9,000 the plan's §3 projected (~6,600 for the five).** The old text was
mostly rules: stories, quotes and worked examples were about a tenth of it (S8, S11, S16, S20, S25, S27, S69; T1's quote;
R7, R13, R20; L3, L5's examples, L14; B11, B13, B20). What is left is commands, paths, lists and conditions the brief
asks to keep exact (the notes list, the lock, the `gh` commands, the docs-only exemption, the table of homes). Lines
went up in shipping and doc-structure because the old text held very long unwrapped lines that the checklists wrap.
A further saving is possible only by leaving out what the general page `how-we-work.md` also states — shipping's
unattended-run line (S41, page §Long runs), the public/private runner (S52–S55, page §Secrets), bug-check's readers
(B15–B19, page §Models and readers) — at the cost of each checklist no longer being whole on its own, and of the full
rows that name these files as homes. Not done: a choice for the host (and for him), not the builder.

## Questions for the host

- **Q1 — shipping 19, "never a working guide".** The old notes list (old 17) did not name a working guide, but the old
  docs-only bullet (old 115–116) said any other docs change — "a working guide" among them — merges only on his "merge
  live", and D1407's full row says the same. The checklist now says it in the list too, so the two cannot be read apart.
  Which documents under `raptor-port/docs/` count as a working guide (the bug-check order, the design guide, the ripple
  map…) is as undefined as before.
- **Q2 — shipping 26, "with the secrets scan".** Old and D1407's row both read either "the agent also runs the secrets
  scan" or "the guard [REVIEW-LAYERS] builds will include the secrets scan". Kept in its old place, not resolved.
- **Q3 — shipping 129–131, the guard as a backstop.** New words the plan §3 asks for: the guard lets a push through when
  it cannot reach GitHub (the guard's own head says so), and Codex has no hooks — "so every rule above is kept by hand
  all the same". This states a consequence, not a new rule; check it reads that way.
- **Q4 — record-decisions 18 and doc-structure 88, the hooks' rules in words.** "Ask it of every message he sends" (the
  per-message hook) and "without hooks — Codex — run [the document check] yourself before you end a turn that changed a
  document" (the Stop hook). Both repeat what `AGENTS.md` already tells Codex; neither changes what Claude does.
- **Q5 — record-decisions 77–80.** The old line was a pointer that named the three failures behind the check and why a
  code comment is no evidence; the checklist states them as rules and keeps the pointer. They are the lessons the check
  exists for, but the promotion from a pointer's description to a statement is a change of form to read.
- **Q6 — shipping 52, "Hand it to him every time".** Kept as written; it sits beside D905's "not after every push of
  unfinished work" (S19) exactly as it did before.
- **Q7 — the archive's headings.** Each moved block keeps its own `## ` headings, at the same level as the per-file
  heading the move created above it (`## \`.claude/rules/<file>.md\` — everything below its title…`); the archive's
  head says so. Nesting them would have meant editing the moved bytes.
