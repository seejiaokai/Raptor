# Group C1-handoff — the helper's report (saved by the coordinator as it came back)

**Counts:** APPLY 30, REFLECTED 1 (895), ASK 1 (751); two APPLY rows also file a tool item (760, 887). Table:
`_review/dispositions-C1-handoff.md`; its 32 rows check clean; every APPLY row names a draft in the holding folder. No
write was refused.

## Drafts and what changed
### `.claude/skills/overnight/SKILL.md` (new draft; 19.6 → 21.8 KB)
- "If his message names the work" — **D1443:** even with named work, the first message lists the night's jobs before it starts — numbered, in order, each with what he will have in the morning, its check and its rough time, how many fit in his hours and what waits for him — beside "Low or Medium?" (D1104); it does not hold the start: with no question open, the night goes straight to steps 8 and 9, taking the recommended Low or Medium. The Part 1 checklist gains the same point, citing D1443.
- Step 1 (732): if this guide loaded from a folder other than this checkout (the Skill tool's base directory shows which), compare the two copies and follow the branch's own; points at the gates-and-deploy paragraph on the main checkout.
- Step 8 and Part 2's compaction note (853, 873, 892): the compaction's time is read from the clock (`date`).
- Part 2, the helper bullet: Auto-fix switched off right after **each** pull request opens; a relayed Vercel status comment needs no reply (754, 762). How the coordinator waits on a background helper: ends its turn with the keep-awake hold on and a silent timer of under an hour, re-armed at each expiry, never polling the helper (762). With a session per job, each brief names the branch that carries the night's block (847).
- Part 2, "A helper's report": **tonight's lesson (no note number)** — a report comes back as the helper's final reply, because the tool refuses a background helper's write of a "report" file; the coordinator saves it. Each reader the block names is ticked against the report before it is accepted (857). A "stopped with background work still running" notice is not a report: stop or wait for the helper before the checkout changes, then read its branch's log (907).
- Part 3, report item 1 (738): a list written during the night is checked against a picture of the last build before it goes to him.

### `.claude/skills/session-handoff/SKILL.md` (group B's draft edited, its Rules 2 sentence kept; 24.7 → 28.4 KB)
- Step 1, another chat's block (890): first list the open pull requests that change `HANDOFF.md`; leave the blocks beside theirs, or tell those chats.
- Step 1, new bullet (889): one notes branch per chat, merged once.
- Step 1, `## Next, in order` (774): read its first line before the commit; a "RIGHT NOW" line whose work has merged is archived and replaced by a pointer to the backlog's priority list.
- Step 1, the opening line: a chat number is a hint, checked against `main`'s `HANDOFF.md` (872); if `git status` shows changes this chat did not make, or another chat works in the folder, the new chat makes its own short-path worktree and works only there (787, 831).
- Step 1, release (769): when this chat stays open by design, the new chat works the branch from its own (fast-forward, upstream set, explicit push), and this chat pushes nothing more to it.
- Step 4, the template's Gates line (759): names the run that made each result and its count, never a bare "green".
- Step 4, "acts on" list, five new lines: plan-numbered next steps checked against the plan (747); how a job ships decided by its files (748); a removal runs its area's whole suite (759); briefs name branch and commit, never a worktree folder (847, 913); his merge word does not travel in another chat's text (877).
- Rules 2 (853, 873, 892): a time is read from the clock or from the commit or file it names, never estimated; a progress line may name its commit instead.

### `raptor-port/docs/gates-and-deploy.md` (new draft)
- The `exec` line (760): one quoted string goes to Windows' own shell, so several commands go in a script, passed as `-- bash <script>`.
- The typecheck trap line (891): with no installed packages, `npx tsc` downloads an unrelated package; run `npm ci` first.
- New bullet, "After a push…" (887, 911): a pull request that clashes with `main` starts no run; "Everything up-to-date" after new commits means a detached checkout.
- The intermittent-stop bullet (855): read the step times of recent runs before calling a check hung.
- The docs-only bullet (908): a change to the document check's own scripts runs its self-test before the push.

### `raptor-port/docs/walk-scripts.md` (the earlier groups' draft edited)
- §2 (854): a window that opens on a filtered view names that view and the one that shows the walk's own changes.
- §5 (772): reading his phone recordings frame by frame — the Edge browser, a local file page, seek and wait, contact sheets.

### Additions
- `_docs/OUTSTANDING-items.md`, `[CHECK-TOOLS-HARDEN]` (h): the check lock's `exec` refuses a one-string command holding `;`, `>`, `<` or `&&` (760); (i): the push guard warns before a push when the pull request clashes with `main` (887) — a hook, so his word.
- `_review/questions.md` (new): note 751, recommended closed.

## REFLECTED
- 895: the settle step, `records-merge.mjs`, settles `HANDOFF.md` block by block; its tests cover two new blocks (test line 72) and a closing line both sides added (line 742); gates-and-deploy's settle-step paragraph and shipping's step 2 name it.

## ASK
- 751: the background-command guard tested tonight with both spellings of the folder (`/c/…` and `C:/…`) lets both through; unchanged since 26 Sep 26, so the 31 Oct refusal cannot be reproduced — it may have come from another check.

## Stale lines fixed
- Overnight step 5: the model reads named only the fresh Opus read — now Astra, the standing reviewer, with the fresh, blind Opus read beside his (D1770, D790, D903).
- Overnight step 7: "While the ChatGPT readers are out, every selected job … onto [NO-ASTRA-LIST]" — now a job that will go without Astra's read, or without Sol 6.1's where two are required (D761, D1770).
- Overnight Part 2 helper bullet: the job's reader — "fresh, blind Opus reader beside Astra's read" (D1770).
- Overnight morning checklist: "without Astra or Sol 6.1" — "without Astra, or without Sol 6.1 where two are required" (D1770).
- Gates-and-deploy, the Pages bullet: "`main`'s run green on his PC" — "on GitHub's machines while the repo is public, on his PC once it is private" (D1086, D1530).

## Places unsure
1. The D1443 wording: whether "beside Low or Medium?" plus "the recommended one taken" stays true to D1443 and D1104 together.
2. The own-folder clause for 787 and 831, against the memory note that a chat started in a worktree is refused writes into another worktree — check it does not send a worktree chat into a refused write.
3. Closing 751 as ASK when the refusal may have come from another check, against keeping it OPEN as thin evidence.
Also: 892 asked for a guard on handoff times — none filed, the cut chosen instead (name the commit rather than write a time); a reader may want a tool item. The handoff guide grew about 3.7 KB (15%) — candidates to merge or trim: the opening-line bullet (chat number and own-folder clause) and the 769 release recipe.
