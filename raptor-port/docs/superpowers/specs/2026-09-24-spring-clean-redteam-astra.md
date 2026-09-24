# Spring clean — Astra's red team of the plan (24 Sep 26)

Tier 3. Astra (Codex, gpt-5.6-sol, high, read-only) on `2026-09-24-spring-clean-plan.md` as first written. Saved verbatim; the dispositions are in the plan §7.

Not ready to build. I found nine high-severity gaps.

1. **HIGH — `raptor-port/CLAUDE.md` is not actually Layer 0.**  
   Evidence: plan `:21`, `:122-130`. A docs-only, workflow, root-file, or `.claude/` session may never read anything under `raptor-port/`, so it misses Shipping and navigation rules it needs.  
   **Exact fix:** move the current Shipping block into an unscoped `.claude/rules/shipping.md`; leave only a pointer in `raptor-port/CLAUDE.md`. Put workflow-specific routing in the unscoped `doc-structure.md`.

2. **HIGH — the proposed area globs miss shared seams.**  
   Evidence: plan `:117-120`; `raptor-port/CLAUDE.md:748-817`, `:818-918`, `:1077-1082`. Examples:
   - A qualifications/roster session touching `src/engine/qualcols.ts` or `src/ui/QualsPage.tsx` misses Leave War roster rules.
   - A storage/undo/command session misses both Leave War and Tracker architecture.
   - A Tracker-shell change touching `src/ui/Shell.tsx` misses Tracker architecture.
   - A planning session reading only a generic tier-3 rules-engine plan misses the robustness doctrine moved by C7.
   
   **Exact fix:** add the relevant shared paths to both area files: `src/storage/**`, `src/command/**`, `src/undo/**`, `docs/undo-contract.md`, `src/engine/people.ts`, `src/engine/qualcols.ts`, `src/state/people-settings-commit.ts`, `src/ui/QualsPage.tsx`; add `src/ui/Shell.tsx` to Tracker. Keep an always-loaded pointer requiring `scheduler.md §Working rules` before rules-engine planning/review.

3. **HIGH — one `HANDOFF.md` is sound in principle, but this design loses session-state semantics and races parallel worktrees.**  
   Evidence: plan `:28-34`, `:45`, `:56-57`, `:69-73`; current skill `.claude/skills/session-handoff/SKILL.md:24-35`, `:64-76`. “Absent means nothing pending” disappears; a merged block remains stale until another handoff; two branches inserting or deleting under one `## Now` anchor conflict; deleting “merged blocks” can edit another chat’s state.  
   **Exact fix:** define machine-stable, branch-keyed blocks such as `<!-- handoff:claude/foo -->`, each carrying branch, PR, HEAD, timestamp and “verify before use.” A chat may overwrite only its own block. Another block may be removed only after `git fetch` verifies its PR merged and its residue is filed. The gate must reject duplicate branch keys. `## Next` remains project-wide and is reconciled under D78.

4. **HIGH — the known parallel-merge docs-guard defect is left intact.**  
   Evidence: `OUTSTANDING.md:1220-1227`; plan `:72-74`, `:86`. A later parallel branch that merges `main` can fail because the guard audits that branch’s old copy of an item already archived on `main`.  
   **Exact fix:** implement `[DOCSGUARD-MERGE]` before the spring clean: in the “ever live” audit, skip an ID already present in the archive at `BASE`. Add a self-test reproducing the D78 merge graph.

5. **HIGH — §1d will not enforce D140 as claimed and can reject legitimate root tooling.**  
   Evidence: plan `:77-86`; `.claude/hooks/backlog-guard.sh:20` runs only `--inventory`; `docsize.mjs:58-96` hard-codes files and does not include the planned `doc-structure.md`. New unscoped rules can therefore bloat unnoticed, while tier-2 clutter is entirely semantic and ungated. The root allowlist would also reject a legitimate tool-required `AGENTS.md`.  
   **Exact fix:** make the Stop hook run a new full `--structure` mode; dynamically enumerate every unscoped `.claude/rules/**/*.md`; require each new rule/reference doc to be registered with its tier/home; add `doc-structure.md` to ceilings; retain D29’s code-change deferral. Use a documented root allowlist that includes `AGENTS.md` and permits a docs-only allowlist addition with a reason.

6. **HIGH — the new definition of “done” is invented.**  
   Evidence: plan `:122-130`; D59/D60 in `.claude/rules/decisions/how-we-work.md:34-35`; old chain `raptor-port/CLAUDE.md:180-188`. D59 removed Pages and made Vercel the viewer; it did not rule that “main checks green” alone now means live. Checks do not prove the main Vercel deployment is Ready.  
   **Exact fix:** mark the new endpoint as an owner decision needed: whether “done” means main checks green, main’s Vercel deployment Ready, and/or his look. Until ruled, preserve only the supported pieces—explicit “merge live,” green checks, and one notification—and do not define a new endpoint. Also say “docs-only skips the five app gates; Docs guard still runs.”

7. **HIGH — the move map cannot be executed byte-exactly.**  
   Evidence: C2 and C4 both move `CLAUDE.md:1437-1439` (plan `:97`, `:99`); C10 overlaps `593-602` (`:105`). H4/H5 (`:139-140`) contain no unit-by-unit destination manifest.  
   **Exact fix:** make all ranges disjoint. Move `530-633` once for C10. Archive the shared `1437-1439` heading/preamble once, then create separately reviewed Leave War and scheduler headings around `1444-1491` and `1440-1443 + 1492-1516`. Inline or explicitly link and commit the full H4/H5 classification manifest before execution.

8. **HIGH — the mover is not transaction-safe or fully byte-exact.**  
   Evidence: `backlog-archive.mjs:151-168` selects source/end anchors without proving they are outside fences; `:179-192` does the same for `--under`; `:171-172` adds a final newline; `:201-208` defines rollback only after both writes, so a first-write/second-write failure leaves a partial move. The pointer is not verified. `.gitattributes:4-7` leaves most mover participants unpinned.  
   **Exact fix:** make all anchors fence-aware; refuse a missing `--under` unless `--create-under` is explicit; preserve a missing final newline; validate real paths remain inside the repo; write and verify temporary files before replacement; catch every write failure and restore originals; assert the pointer occurs exactly once. Pin LF for `CLAUDE.md`, all decision files, all archives and `docs/archive/**`. Add mover tests for CRLF/LF mismatch, fenced duplicate anchors, section boundaries, missing headings, pointer duplication and injected second-write failure.

9. **HIGH — appending to `HANDOFF-ARCHIVE.md` contradicts standing rules.**  
   Evidence: plan `:139-148`; `HANDOFF-ARCHIVE.md:1-13`; `raptor-port/CLAUDE.md:934-944`; `.claude/skills/session-handoff/SKILL.md:176-180`, `:248-250`. D140 did not specifically unfreeze that 4 Sep snapshot, and the plan itself says merged `Now` stories belong in git.  
   **Exact fix:** keep `HANDOFF-ARCHIVE.md` frozen. Move the historical H4/H5/H6 material whole into a new dated `docs/archive/handoff-spring-clean-2026-09-24.md`; keep durable facts in tier 2 and open residue in `OUTSTANDING.md`.

10. **MEDIUM — several controlling documents will contradict the new structure after the moves.**  
    Evidence: `DECISIONS.md:64-67` says not to back-fill old decisions wholesale; `.claude/rules/record-decisions.md:35-40` still points to `CLAUDE.md §Stable decisions`; `raptor-port/CLAUDE.md:934-944` still orders file-map edits in `HANDOFF`, trim-on-touch, and a frozen archive.  
    **Exact fix:** add those exact passages to the rewrite manifest: D140 now authorizes the one-time settled-decision migration; future rulings still are not wholesale backfills; file-map changes go to `docs/file-map.md`; code changes never trigger trimming.

11. **MEDIUM — R1 knowingly leaves dangling pointers.**  
    Evidence: plan `:144`; examples include `.claude/rules/decisions/oil.md:25`, `.claude/rules/decisions/how-we-work.md:18`, `:22`, `:30`, `.claude/skills/TASK-OBSERVER-VENDORED.md:98-100`, `raptor-port/README.md:16`, `OUTSTANDING.md:489`, and `raptor-port/src/engine/overnight.test.ts:2`. “The filename still finds it” is not a valid path.  
    **Exact fix:** maintain an old→new path table and require `git grep` to return zero operative old-path references. Update source/e2e comments in a separate pointer-only change with the required gates; do not knowingly finish the move with broken paths. Resolve Observation 194 in `.claude/skill-observations/log.md:117-130`.

12. **MEDIUM — `[DEPLOY-DOCS]` omits operational files that still claim Pages deploys.**  
    Evidence: plan C9/C10/H3 `:104-105`, `:138`; `.github/workflows/deploy.yml:1-5`, `:28`, `:354-399`; `raptor-port/scripts/handpass/live-check.mjs:9`, `:28`.  
    **Exact fix:** after settling finding 6, add a separate operational-doc commit changing the workflow name/header/comments and replacing or retiring `live-check.mjs`. Because these files start the app gates, do not hide this inside the nominal docs-only pass.

13. **MEDIUM — two latest rulings are not fully carried into the plan.**  
    Evidence: D141 withdraws fixed targets, but O1 only covers `OUTSTANDING.md:41-236`; `[DOC-TRIM]` still contains fixed `500/400/600` and token targets at `OUTSTANDING.md:523-577`. The current D140 row also requires Astra briefs to name applicable area files, while plan workflow `:64-75` omits that.  
    **Exact fix:** rewrite/archive the entire `[DOC-TRIM]` item when closing it, removing every hard target. Add the area-file packet requirement to `doc-structure.md` and the plan/spec/code-review prompt templates; because those are working-guide changes, send all affected skill changes through D70’s Fable+Astra review.

