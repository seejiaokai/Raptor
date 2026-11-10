# What a Leave War job loads at its start — the fresh, blind Opus reader's read (10 Nov 26, chat 56)

*(The host's record of the reader's report, finding by finding — NOT word for word: the chat was at 81% full when it came in. A fresh Opus helper, blind to Astra; brief `2026-11-10-lw-start-load-read-brief.md`, on `93531181d`. It ran `npm run docsize` (OK) and the self-test (0 misses).)*

**1. The scheduler's page — nothing found.** The page has no statement about how browser tests are written or run. Every statement naming the Leave War, every screen or the whole app is carried by what a Leave War test job still loads (the Leave War page's "From other areas", its architecture file, OIL's and the screen-design pages). The one line named nowhere, D1120 (the crew list's standby look leaves the war unchanged), is a rule a war job cannot break. The shared helper `e2e/app.ts` still loads the scheduler's page.

**2. People & accounts' page — three rules a grid-only job lost.**
- F2-1, D328 (the posting sheets are the admin's, never the man's; an earlier stint's dates read-only): the grid decides whose tap opens a posting sheet (`Matrix.tsx`, the admin test and the stint's sheet), and nothing it loads said so. — *Fixed (Astra found it too): the "on the posting sheets" line.*
- F2-2, D321's clause (10), "an admin may still add leave or OIL on a deleted man's past days": cited but its words missing. — *Fixed: the "also" line.*
- F2-3, D149, D200, D1589 (one place in the app answers "may this person do this?"): the grid asks through `canEditRow` and `canDecide`; a grid job could add a role check of its own. — *Reproduced: the project guide's Security line states it with D200 and loads with any file under `raptor-port/`, so it was reachable; a pointer line added all the same ("on who may do what": D200).*
- Checked and not grid rules: D306, D294, D298, D304, the bell lines, D326, D329, the guest flyer's corner.

**3. The pointer lines.** F3-1: "a SANS posting moves his whole row" dropped "earlier months included, where it moves at all". F3-2: D307 and D327 cited with no words of theirs; the "fresh" clause is D284's. F3-3 (noted only): D303 shortened, nothing lost that the line above does not carry. — *F3-1 and F3-2 fixed.* D165, D309, D310, D322, D325 and D993 faithful; the reworded scheduler line and the "no longer loads" line true of the `paths:`.

**4. The general page and the two rows.** D1960's reworded line keeps all its row requires. D1973's line matches its row, which keeps his words apart from the agent's reading; what was put to him named the Tracker's test too, what was built keeps it — the row says so. F4-1: D1972 drops his word "mainly", and states "plans, coordinates and builds" (the agent's reading of "orchestrator") as his rule. — *Fixed: "mainly hosts", the reading marked, on the line and in the row.* Nothing elsewhere contradicts D1972 in a way a reader would act on wrongly.

**5. The check.** Correct for a sub-folder test, a helper, a `*leavewar*` file, Git's forward slashes, a missing page, the comment inside `paths:`; the old `e2e/**` reached nothing the 42 names and the seven war tests do not. F5-1 (low): only `.ts` files were checked. F5-2 (cosmetic): "name it *leavewar*" does not help a test in a sub-folder. — *Both fixed: every script ending; the message says "at the top of the tests' folder".*

**6. Anything else.** Reproduced: `Matrix.tsx` and `MatrixRows.tsx` load the screen-design, Leave War and OIL pages, the war's architecture and the two working rules — neither People & accounts' nor the scheduler's page; `e2e/leavewar.spec.ts` the same without the interface rule. The handoff block still said "waiting on him" — *rewritten since.* No other stale statement, no safeguard dropped.

**Verdict:** the cuts and the check work; fix the three lost People rules, the dropped SANS condition and the two wordless citations before merge; the rest small.
