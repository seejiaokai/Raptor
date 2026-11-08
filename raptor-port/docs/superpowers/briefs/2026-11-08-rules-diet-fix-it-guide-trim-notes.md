# Trim report — `.claude/rules/decisions/it-flow-guide.md` (the IT flow guide)

## 1. Size and the gate
- Final: **3,966 bytes**. Old list (`cd8a5dd67`): 4,028 bytes. Headroom: **62 bytes** (was 9,330). The ~200 spare was not reachable without dropping a rule part; every remaining line is one statement at the fewest words.
- Head paragraph: 397 characters (limit 600). Longest statement: 352 characters (limit 600). LF endings, no CR.
- Gate (`node scripts/docsize.mjs`, run once at the end): **no finding about this page** — its row reads 3,966 against a 4,028 limit, no statement, mark or unstated-ruling debt. The 9 FAIL lines are all other pages (design, tracker, people-accounts).
- Correction to the brief: D418's full row sits in `.claude/decisions-full/leave-war.md`, not the guide's (`grep -l`); the guide's file holds 9 rulings, D403 and D410–D417. D418 is therefore pointed to, not stated.

## 2. Folded into the one "From other areas" pointer
D1177, D1225, D1166, D1208, D1724, D418 (five bullets → one line; the body's D1166 line — verbal approval, lands approved — is now part of that pointer, the Leave War's page stating it).

## 3. Readings removed — each confirmed in its full row
- D411: the work-flow slide (one slide after the map, the life of a day across the roles) — row: "The agent's reading of 'the work flow', said to him in the report".
- D412: several slides in order (blank day → waves → people → issues); each several-ways case its own slide, one picture per way, "every way still names what to test" — row: "How it is drawn (the agent's call)". The "What to test" box on every slide (D410) still stands on the page.
- D413: a work-flow slide of its own, two lanes, each stage a picture and its journey slide — row: "How it is drawn (the agent's call)".
- D415: the "where one change shows up" slide, built from the feature-impact map — row: "How it is drawn (the agent's call)".
- D416: the side-by-side slide; each schedule-making slide naming its mode — row: "How it is drawn (the agent's call)".
- "the agent's reading of D1177 lets him decide a bid at any time" and the D418 pointer's "the agent's readings of D1177" (decides at any time; remarks at any time; the leave changed on Inputs) — D1177's row lists them under "The agent's readings"; D418's mark says the same.
- Readings NOT found in their row and kept: none.

## 4. Bullets merged (citation sets unioned)
- Who it is for + the deck's parts → one [D410, D412, D414].
- The approved look + alternate-plan flow + work flow → one [D410, D411, D412].
- Schedule step by step + the several-ways rule → one [D412].
- The Leave War's manning + "his lists are not the limit" → one [D417, D412, D414].
- The checks in the running app of D413(p,q), D414, D415, D416 → one [D413, D1177, D414, D415, D416].
- D403's three lines → one [D403]. Settled's two → one [D410, D411, D403]. Three body sections → one "## The guide".

## 5. Judgment calls a blind reader should check
1. D410: "how the app is used, journey by journey — what a person clicks and what he sees next — and the checks that prove each journey still works; how the app calculates" cut to "For the IT team and the next developer". The clicks/checks gloss came from the archived backlog ask, not D410's row (the account flagged it); "no rules-engine detail" keeps his scope.
2. "or several in order where a journey needs them, as the schedule's and the Tracker's do" dropped: "several slides" is the agent's call in D412's and D414's rows; the page now states his "one slide per journey" only. The readers' earlier one-vs-several point is answered by the rows, not the page.
3. Leave War flow: "closes the dates and decides the bids (closing first, then approving, his best order)" → "he closes the bids, then decides them, and texts the squadron" — D1208's words; D1177's "decides at any time" is its reading. A reader may find the order firmer than D413-as-narrowed ("bid and decide → close the dates → text").
4. The check line says "checked in the running app first" for all four rulings (D413's row says "before it is drawn"; D414–D416 "checked in the running app") and no longer names the Leave War's stages.
5. D415: "still screens, not the rules' arithmetic" → "screens, not the rules' arithmetic".
6. `[ITFLOW-OIL-RESHOOT]` named once, on the Settled line; the D403 line reads "refreshes already filed wait for his word too".
7. Settled: "in the guide's folder" → "its folder's README"; "the Leave War's stages among it" dropped (the backlog item carries what changed).
8. Head: dropped "open it yourself before planning any work on the guide" (stated in always-loaded `doc-structure.md`), the 2 Oct 26 move history, the grep line and the general-rulings sentence; "each stated on its own file" lives in the section heading.
9. Small word cuts: "the map and the slide style stand for every slide added since" → "its map and slide style stand for every slide since"; D416 "with more functions" → "more functions", "for smaller edits" → "smaller edits"; D415 "without anyone touching it" → "with nobody touching it".
10. The pointer's bracket words are bare subjects (stages, open dates, a closed day's pending bid, Inputs-page leave, notices, full editing, D418's keeps and the drag's ask); the Leave War's page states each.

Nothing committed or pushed; only this page edited.
