# Read of D2906 in the shipping rule (commit a744cadf5) — fresh Opus reader, blind

**What I opened.** The brief; `git show a744cadf5` for the two named files (plus its message and file list); D2906's and D143's full rows; `.claude/rules/shipping.md` whole at that commit. **Beyond what the brief names:** I also grepped the full rows of **D343** and **D59** and grepped the rulings page at that commit for its Vercel/preview lines, because the new line on the rulings page sits directly under the D343/D59 line ("No public GitHub web address [D343]; the app is viewed on Vercel [D59]") and the brief asks about contradictions with rulings the change points to. I looked for D2839 (cited in D2906's row): it has no row on this branch. I opened no other brief, no other reader's report, and not `OUTSTANDING.md` (so I have not seen what [VERCEL-NOT-CHASED] files). No file changed.

---

## 1. Does each line say what his words and D2906's row mean?

**1a. "done once `main`'s own run is green" is the agent's reading, stated as his rule.**
- Line (both files): "the change is done once `main`'s own run is green" (shipping) / "done once `main`'s own run is green" (page).
- Problem: D2906's row says this part is "(the agent's reading, told to him in the closing report)". His words say "Leave it" and "I don't bother about vercel"; they do not define when a change is done. Both lines drop the "agent's reading" mark, so a reading passes as his rule — the exact lapse D2567 / [READINGS-LAPSE-FIX] (this very branch) exists to stop. The page marks readings elsewhere ("the agent's reading of keeping the project public, not checked with him").
- Fix, shipping: "— the change counts as done once `main`'s own run is green (the agent's reading, told to him), and previews for his look come from GitHub (D2906)."
- Fix, page: "…no Promote asked of him; done once `main`'s own run is green (the agent's reading, told to him); previews for his look come from GitHub — [VERCEL-NOT-CHASED] [D2906, D143]."

**1b. "previews come from GitHub" is narrowed to the refused-build case — his words say "from now on".**
- Line (shipping): "But a live build Vercel refuses for its daily limit is left: … — the change is done once `main`'s own run is green, and previews for his look come from GitHub (D2906)."
- Problem: the previews clause sits inside the sentence about a refused live build, so it reads as applying only then. His words "I'll use GitHub from now on for preview" and the row's bold rule ("previews for his look come from GitHub, not Vercel") are general. Falls short. The page line has the same shape but the semicolons make it slightly more readable as general.
- Fix, shipping: split it into its own sentence: "…is done once `main`'s own run is green (the agent's reading, told to him). From now on previews for his look come from GitHub, not Vercel (D2906)." Page: "…; from now on, previews for his look come from GitHub, not Vercel — [VERCEL-NOT-CHASED] [D2906, D143]."

**1c. "from GitHub" is not said in terms a fresh model can act on.**
- Line (both): "previews for his look come from GitHub".
- Problem: neither line, nor D2906's row, says what a GitHub preview is (the pictures on the pull request? a GitHub-served page?). The row says D2839 already ruled it, but D2839 is not on this branch, so no reader here can learn it. A fresh model could build a GitHub Pages preview — which D343 forbids (see 2c). This is a gap in what the line carries, not a word beyond his.
- Fix: add what D2839 says once it is on `main`; until then, on the page: "…previews for his look come from GitHub, not Vercel (how, D2839, not yet on this branch; never a public GitHub web address, D343)".

No other word goes beyond his: "not retried", "no spare build", "no Promote asked of him" all sit inside "Leave it" as answered to "try again this evening or let it go live with the next merge", and match the row.

## 2. Does it contradict another line or ruling?

**2a. The loop still waits on a Vercel preview.**
- Line (shipping, The loop): "→ once the work is ready for his look and its Vercel preview is Ready, send him the link."
- Problem: contradicts "previews for his look come from GitHub". A fresh model obeying the loop line waits for a Vercel preview that, under the daily limit, may never come.
- Fix (in this change or named as left for [VERCEL-NOT-CHASED]): "→ once the work is ready for his look, send him the preview from GitHub (D2906)."

**2b. A branch push still "gives him a Vercel link".**
- Line (shipping, first bullet): "one that changes the app gives him a Vercel link".
- Problem: same clash, milder (it describes, not instructs). Fix: "one that changes the app gives him a preview (from GitHub, D2906)" — or name it as left for [VERCEL-NOT-CHASED].

**2c. The page line directly above says the app is viewed on Vercel, and there is no public GitHub web address.**
- Line (page, Secrets and the repo): "No public GitHub web address [D343]; the app is viewed on Vercel [D59]."
- Problem: "previews from GitHub" sits one line below "the app is viewed on Vercel" with no word on how they fit; and D343 forbids a public GitHub web address, so "from GitHub" read as a GitHub-hosted page breaks D343. Not a contradiction if "preview" means the pull request's pictures, but the lines do not say so.
- Fix: add to the D343/D59 line "; the live app stays on Vercel, previews for his look come from GitHub [D2906]" and the D343 guard in 1c.

**2d. The section heading still says live means on Vercel, without exception.**
- Line (shipping): "## "Done" means LIVE — and live means ON VERCEL".
- Problem: under the new sentence a change is done before it is on Vercel at all. The heading now states the old absolute rule.
- Fix: "## "Done" means LIVE on Vercel — except a build Vercel's daily limit refuses (D2906)" — or name the heading as left for [VERCEL-NOT-CHASED].

**2e. D143's narrowing mark is wider than the rule lines.**
- Line (D143's row, changed in the same commit): "NARROWED 28 Nov 26 BY D2906: a live build Vercel refuses for its daily limit is left; a change is done once `main`'s own run is green."
- Problem: the second clause has no limit, so it reads as "always done at green". D2906's row has the same unscoped sentence ("after his 'merge live' a change is reported done once `main`'s own run is green, Vercel's live build not waited for"). The shipping rule and the page limit it to a refused build. So: a refused build → done at green; a build that is not refused → still wait for READY? The rule lines say yes, D143's mark and D2906's second sentence say no. His "I don't bother about vercel" could support either.
- Fix: make the mark match the rule: "…a live build Vercel refuses for its daily limit is left; that change is done once `main`'s own run is green (the agent's reading)." If the wider reading is meant, it is a question for him (D90/D201: "where the newer one does not clearly cover the case, it goes to him as a question"), not something to write in.

**2f. D2906 added to the "his phone look is the live look" line changes nothing it says.**
- Line (shipping): "His look on his phone is the live look: the live app sits behind his sign-in, and the agent is never given a login to it (D143, D2906)."
- Problem: D2906 rules nothing about his phone look, the sign-in or logins; the citation attributes a line to a ruling that did not set it. Worse, after a refused build his phone look on the live app will not show the change, so the line is now partly stale and the citation hides that rather than fixing it.
- Fix: drop ", D2906" (back to "(D143)"), and if wanted add "— after a build the daily limit refused, the live app does not show the change until the next build (D2906)."

## 3. Safeguards and bulk

**3a. Is "done" now reachable with no check that the merge is good?** No — `main`'s own run green is still required, so the merge's correctness check stays. What goes is the check that it reached the live app.

**3b. He is not told the change is not live yet — and it may stay off the live app.**
- Line (shipping): "the change is done once `main`'s own run is green".
- Problem: D2906's row says the reading is "told to him in the closing report"; the rule line does not require telling him. He then looks on his phone (the "live look") and does not find it. Second step: the change goes live only with the next merge that builds; a notes-only merge skips its build (D2032, the bullet just below), so after several notes-only merges the change can sit off the live app with nobody saying so.
- Fix (shipping): "…is done once `main`'s own run is green (the agent's reading); the closing report says plainly it is merged but not yet on the live app, and that it goes live with the next merge that builds (D2906)."

**3c. Telling a limit refusal from a real failure.** Low. The line says "refuses for its daily limit", so a Vercel build that fails for another reason is still chased under D143 — correct — but nothing says to read the reason. A fresh model could treat any failed live build as "left". Fix (optional): "…for its daily limit (Vercel's own message says so; a build that fails for any other reason is still chased as above) is left…".

**3d. Bulk: the page repeats a shipping rule its own header says is not repeated.**
- Line (page, new): "A merge whose live build Vercel refuses … done once `main`'s own run is green; previews for his look come from GitHub — [VERCEL-NOT-CHASED] [D2906, D143]."
- Problem: the page's header says the shipping rules "are stated in the other always-loaded files … they are not repeated here"; this line restates shipping.md's new sentence nearly word for word in a second every-chat file. (The D1794/D2032 line above it is a precedent, so minor.)
- Fix: keep on the page only what is not a shipping step: "From now on, previews for his look come from GitHub, not Vercel (never a public GitHub web address, D343); a live build Vercel's daily limit refuses is left — the shipping rule's "done" section — [VERCEL-NOT-CHASED] [D2906, D143]."

---

**In short:** the main finding is 1a, one reading written as his rule (the lapse this branch is meant to fix). After it: 1b, where "previews from GitHub" is limited to a refused build although his words say "from now on"; 2e, where D143's mark is wider than the rule; and 3b, where he is not told the change is not yet live, so it can stay off the live app behind notes-only merges. The rest are either stale lines in shipping.md that now clash (2a, 2b, 2d), which the change should fix or name as left for [VERCEL-NOT-CHASED], or a citation and some bulk (2f, 3d).
