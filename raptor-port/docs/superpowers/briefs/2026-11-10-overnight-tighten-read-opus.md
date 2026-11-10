# The fresh Opus reader's report — the overnight skill's tightening (10 Nov 26, chat 60)

Read-only, by a fresh Opus helper on the brief `2026-11-10-overnight-tighten-read-brief.md`, at commit `e596f448b`,
blind to Astra's read. FIVE findings, every one in the corrections and the "said once" parts; all fixed the same day:

1. fixed in its words — the helper stops once the job is built, the coordinator pushes the block and opens the pull
   request, the same helper goes on (the agent's choice of how a night meets D1086; no ruling of his sets it);
2. fixed in its words — the re-read after a compaction is stated in the skill again, beside the pointer to step 8;
3. fixed in its words — the opening-message checklist (also Astra's one finding);
4. fixed, in fewer words than it gave, to stay under the page's hard limit (D1932): "no merge, no `main`, notes
   included, unless he gave "auto merge live" [D596, D1980]" — D1093 is not cited there; it is stated in the shipping
   rules, which load in every chat;
5. fixed in its words — "to push to `main`" stands outside the "auto merge live" exception.

The fixes were read by nobody but their writer. Kept outside the checkout until both reports were in.

Its report, as returned:

---
1 meaning change · 1 of lost detail · 3 others

What I compared: the diff of the skill, `shipping.md` and `how-we-work.md` (origin/main...HEAD), set beside the full old skill (`git show origin/main:…`) and the new one passage by passage; the archive copy, which matches the old skill apart from its front matter and headings, as the brief says; the full rows of D1975, D1979, D1980, D1407, D1737, D1093, D596, D1086, D1089, D1416, D151 and D761 (D922's row is about the Tracker's reorder windows, so I take it to be the skill-note number cited in the plan, not a ruling); the plan's §B to §F; and `shipping.md` "Push"/"merge live", The loop and The checks, plus the Long runs section of `how-we-work.md`.

Every command is word for word the same. Step 8's block sentence, the step 6 "Nothing starts…" sentence and the step 6 last line are unchanged. The only spoken sentence that changed is step 6's "Nothing merges…", which gains its clause. The dated stories, the D1103 history and the spent ruling numbers left without taking a rule with them. The reason "a refused push stops a compound command's earlier steps too" and the deploy-notes pointer both stay. The session-per-job line now says "used only when", which matches D1416 word for word. The archive is complete.

1. MEANING CHANGE: the corrected pull-request timing cannot be met under the coordinator rules that were left unchanged (§C 2, D1086).

Old (Part 2, Pull requests): "a job cut from `main` gets its pull request when its check closes, so GitHub's checks run while he sleeps;"

New: "a job cut from `main` gets its pull request as soon as it is built, so GitHub's run goes while the app is walked (D1086); … Write, commit and push the block BEFORE opening it …"

Unchanged in the helper bullet: the whole job, build, walk, reads and fixes, goes to ONE background helper. "The night's chat only coordinates: while a helper runs it writes nothing into the tree …; it commits and pushes the block, then opens each job's pull request". The helper's brief says "no edits to `HANDOFF.md`" and does not tell it to open a pull request.

Concrete failure: "as soon as it is built" happens in the middle of the helper's run. At that point the coordinator may not write the block, which must come first, and the helper may neither edit `HANDOFF.md` nor open the pull request. So a night following the new skill has two choices. It can break "writes nothing into the tree while a helper runs", committing the block into the checkout the helper is building in. Or it waits for the helper to return, which is the old "when its check closes" timing, and D1086's "run goes while the app is walked" is not met even though the skill now says it is. The order "block pushed first, then the pull request opened, then no push until its run has finished" does not fit together with "as soon as it is built" as the helper bullet stands.

Fix: in the helper bullet, after "(D1104).", add: "The helper stops once the job is built, before its walk; the coordinator then commits and pushes the block, opens the pull request (D1086), and sends the same helper on to the walk, the reads and the fixes."
And in the brief list, replace "push by explicit refspec, no edits to `HANDOFF.md`" with "push by explicit refspec, a stop once the job is built so its pull request can open, no edits to `HANDOFF.md`".

2. LOST DETAIL: the after-compaction rule now lives only in a line the night keeps rewriting (§D 4).

Old (Part 2): "**after a compaction, re-read the block, this guide and the files the step in hand touches before the next change, and note the compaction in the block with its time, read from the clock** — never carry on from the summary's memory of a file, a ruling or a test result."

New: "**after a compaction, do what the block's first line says (step 8)** — never carry on from the summary's memory of a file, a ruling or a test result."

Concrete failure: the same bullet has the block rewritten at every commit ("at each commit, the block names exactly what the rest of the night needs …") and again at each clean point ("the block rewritten"). Step 8's first line only has to be written once, at the start, and no step says a rewrite must keep it. Once a mid-night rewrite drops that line or moves it, "do what the block's first line says" points at whatever line is now first. The re-read of the guide and the files in hand, and the timed note of the compaction, are then skipped. The old wording carried both actions in the skill itself, so nothing hung on the block keeping its first line.

Fix: replace the new sub-bullet with: "**after a compaction, re-read the block, this guide and the files the step in hand touches before the next change, and note the compaction in the block with its time, read from the clock** (the block's first line, step 8, which every rewrite of the block keeps) — never carry on from the summary's memory of a file, a ruling or a test result."

3. OTHER: the Part 1 checklist was not brought in line with the "auto merge live" correction (§C 3).

Old and new (unchanged): "- [ ] The message says nothing merges and the live app is untouched, says nothing starts until he replies, and ends by asking for his selection …"

New step 6: "…'Nothing merges and nothing touches the live app. …' — or, where he has given 'auto merge live' for the night, what will merge in place of its first sentence (D1093);"

Concrete failure: on a night where he gave "auto merge live", step 6 requires the message to say what will merge, but the pre-send check fails unless the message says "nothing merges". So the agent either sends a false "Nothing merges and nothing touches the live app" or fails its own check. The plan's §C 3 listed the head, the "Never" bullet, the last checklist and the step 6 sentence, but missed this checklist line.

Fix: "- [ ] The message says nothing merges and the live app is untouched — or, where he gave "auto merge live" for the night, what will merge (D1093) — says nothing starts until he replies, and ends by asking for his selection ("go" = the recommended jobs and answers)."

4. OTHER: the general page's "Unattended:" line can be read as letting "auto merge live" release only the notes (Q5).

Old: "one notification at the end; no merge, no `main` [D596];"

New: "one notification at the end; no merge, no `main`, its notes too unless he gave "auto merge live" [D596, D1980];"

Concrete failure: the "unless" sits after "its notes too", so it reads naturally as applying to the notes alone. Read that way, on a run where he gave "auto merge live", the night's notes merge but the night's code pull requests are held. That contradicts D1093 ("covers everything that run produces"), and this page is loaded in every chat while the skill is not. The old flat "no merge" was already stale against D1093. The new line now states an exception, but one that reads narrower than D1093, and D1093 is not cited.

Fix, about the same length so it keeps within D1932's limit: "one notification at the end; no merge and no `main`, its notes included, unless he gave "auto merge live" [D596, D1093, D1980];"

5. OTHER (minor): pushing to `main` now sits inside the "auto merge live" exception (§D 2).

Old "Never": "…; merge; push to `main`; …" Both were flat.

New head: "NOT permission … to merge or touch `main` (unless he gave "auto merge live" for the night — D1093; then by `.claude/rules/shipping.md`'s four steps; …)". The "Never" bullet now points to the head.

Concrete failure, which needs a careless reading: on an "auto merge live" night, "touch `main`" falls inside the exception, so a direct push of a fix to `main` reads as allowed by the head. Only "then by … four steps" and the last checklist's "nothing pushed to `main`" stand against it. D1093 covers merging a run's pull requests, never a push to `main`.

Fix: "It is NOT permission to build a job he did not select, to push to `main`, to merge (unless he gave "auto merge live" for the night — D1093; then by `.claude/rules/shipping.md`'s four steps; otherwise nothing merges by itself, the night's notes included — they are merged in the morning, D1980), to change his Claude settings, …"

Checked and found sound:
- The head, step 6, the last checklist, the new `shipping.md` sentence and its line in The checks, against D1980 and its two readings. None lets a night merge what "auto merge live" would not cover, and none forbids the morning chat's notes merge under D1407.
- "The checks as `shipping.md` The checks sets them", against D1086 and D1089.
- Step 1's two-runs pointer: the D151 rule is kept, and the stale "up to about twenty" minutes is gone, as §C 1 meant.
- The compaction bullet merged to one statement: the 75%, about 300,000 of 400,000 note and the about 384,000 compaction are both still there, and the clean-point actions stay.
- The "Never" bullet: everything it listed is carried by the head (bar finding 5), plus "answer a product question", which is consistent with the roadblock bullet.
- The "skills … are tightened" line under Records: it drops "too", "taken out" and the "five" of the session-handoff corrections. That step is already live, so no rule is lost; "each as its list recommends" carries D1979.
- The repeated D1980 citations added in `shipping.md` add bulk only, not a rule.
