# Read of a working-guide change — the guide check's rounds 2–3 (chat 73, 14 Nov 26)

You are one of two blind readers (Astra, and a fresh Opus reader, each blind to the other). Read only; change nothing,
commit nothing. One round, a read of documents (D70, D1761): **does each change say what its note meant, does it
contradict a guide or a ruling, does it drop a safeguard, or does it add bulk?**

**Repo:** `C:\Users\User\projects\Raptor`, branch `claude/guide-check-r1-1114`. **The change:** one commit, `5fb477baa`
(`git show 5fb477baa`). Its edits to `.claude/decisions-full/how-we-work.md` and `OUTSTANDING.md` only record his answers
— read them only to learn what he approved. The earlier commits of the branch were read already; leave them.

**What he approved** — D2038's full row, its "Round 2" and "Round 3" sentences (`grep -h '^| D2038 |'
.claude/decisions-full/*.md`, with the shell); the proposals they answer: `raptor-port/docs/superpowers/briefs/2026-11-14-prompt-audit.md`
(e = hunk 5, f = hunk 6, g = hunk 7, k = F4).

1. **e — `.claude/rules/bug-check.md`:** "again" dropped from "Astra is the standing reviewer again". Anything lost?
2. **f — `.claude/rules/raptor-executor.md` §Communication:** "Brief progress updates only at real milestones or
   blockers" now reads "Give a one-line progress note at each milestone, at a blocker, and whenever a long stretch of
   work has passed without one." Does this clash with any rule on notes or notifications (`shipping.md`'s one
   notification per stop that waits on him, D1097; the unattended run's single notification, D596; the overnight skill)?
   A progress note in the chat is not a phone notification — is that clear enough, or could a chat read it as "notify"?
3. **g — `AGENTS.md` step 5, `DECISIONS.md` (its head), `raptor-port/CLAUDE.md` §Where things live (the rulings row):**
   the dated list of which rulings files became pages is cut; each now says a page is marked `<!-- shape: page -->` and
   keeps the numbers D1735, D1943, D1944, D1947. Is the marker really on every converted page and on no other file
   (`grep -l 'shape: page' .claude/rules/decisions/*.md`)? Codex reads AGENTS.md and loads nothing by itself: can it
   still tell which files are pages? Does anything (a script, the document check, `doc-budget.md`, `doc-structure.md`)
   rely on the old list?
4. **k — `raptor-port/CLAUDE.md` §Build & verify:** the note "copied … from the container-era paragraph archived below"
   now names `docs/archive/raptor-claude-md-2026-09-24.md`. Is that the file that holds it?
5. **The first read's one finding, fixed — `raptor-port/docs/guide-full.md` §Future development and DevOps:** "five gates
   in CI on every PR and push" now defers to `shipping.md` §The checks (D1086), which says which changes skip them. Does
   it now agree with the shipping rules, and does it keep "the two local-only gates for UI work" and "nothing deploys
   red"?

**What is not a finding:** wording you would merely prefer; points h and j (left as they are, his choice); his global
file (outside the repo); data already stored (D56). A finding counts only with the exact place, what a future chat would
now do wrong, and the fix.

**Report:** findings first (or "no finding"), numbered with severity; then one line on bulk. Short.
