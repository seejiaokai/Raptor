# Group A-walks — the helper's report (saved by the coordinator as it came back; the helper's own write was refused)

Group A-walks is done. 43 notes: **APPLY 34 · REFLECTED 4 · FILED 5 · MEMORY 0 · ASK 0 · OPEN 0.** The table is at
`_review/dispositions-A-walks.md`. A script checked it: 43 rows, one for each note in the group, no duplicates, none
missing. No live file edited; nothing committed.

**Files drafted** (each a copy of the live file, edited at `.claude/skill-updates/2026-11-10/raptor-port/docs/`):
- `walk-scripts.md` (+73 −11 lines, 35.7 to 42.6 KB):
  - §1: serve the frozen build folder from inside the test browser. Every new walk library takes its build and picture folders from settings (777).
  - §2: scripts are saved as UTF-8 (778). A script outside the project loads Playwright through `createRequire` (885). Each walker gets its own file prefix (894).
  - §4: three new lines. A control reported MISSING has had every route tried, after first checking the state draws it at all (823). A clean-up step is a claim too (752). A check of a clip, pin or hide reads both sides (755).
  - §5: one run, one folder — only an unfiltered run empties it, picture numbers are never reused, failed attempts are deleted (771, 896). The ink line gains letters hidden on purpose (834). Four lines on timing and frames (870, 788, 884, 835, 849).
  - §6: a case the red-first test never turned red is proved by the walker's own steps on both builds (903).
  - §7: a small mark is enlarged before it is called missing (729). A walk that pins one clock but not the real one (728). A note with no picture, or a fault seen in passing, is "to check", not "to file" (744, 899). The member's bid-window recipe (765).
  - §8: the archive recipe is the whole app folder except its documents (756, 835).
- `bug-check-order.md` (+72 −20 lines):
  - §0a step 3: a FULL check whose chat starts past about 40% names its two chats (893).
  - §4: blindness covers copies and summaries of a reader's report, plus a stop-gap for a reader that compacts (852, 888). Every EXPECTED line names its source or becomes RECORD; an expectation that differs by surface comes from a roll-call column (768, 897). Where a code reader's proof tests go, and staging by named files while helpers work (863). App names in a finding are checked against the app (779).
  - §5: `npm run build` runs beside the touched tests before each push (743).
  - §6: the wording row searches for each old word on its own (749). New rows: a removed, renamed or moved selector, including what scrolls (735, 883); a part drawn in several copies (763); a part drawn inside another surface by a different owner (797).
  - §7.2: a new text-fit browser test pins its letters (882). §7.4: the key held down (856). §8 item 4: a skip when the setup didn't happen is a finding (906).
- `bug-check-checklist.md` (+7 −4): step 3 names the two chats; step 8's list of roll-call kinds gains the three new rows.

**Additions** in `_docs/OUTSTANDING-items.md`:
- A new item, `[READER-COMPACT-HANDOFF]` (888) — a hook change, so not drafted.
- An addition to `[CHECK-TOOLS-HARDEN]`, items (c) to (f): (c) the code check prints React Doctor's own reason when it gives up, and refuses a file that is not UTF-8 (778); (d) one shared "letters fit" helper (834); (e) a check that flags a new text-width browser test with no pinned letters (882); (f) a ready script for a blind reader's clean copy (898).
- `[WALK-SCRIPT-UTF8]` can be archived once the walk-scripts draft is installed.

**The 4 REFLECTED notes:** 757 — the "Trap — the silent pass" line in the gates guide, §Now; 780 — the order's §5 line from D1625, and checklist step 5; 799 — walk-scripts §5 on `$TEMP`, and the gates guide's "Six more" trap (1); 902 — walk-scripts §5 on `test-results/`.

**Stale lines fixed (D201)**, all in the order's §4 and §4a:
1. "(Fable if Astra is unavailable)" now says a fresh Opus reader (D903, D1770).
2. "Sol 6.1 is called until Mon 9 Nov 26 19:00 (D1743)" is removed, since that window has closed.
3. The plan red-team bullet now says Astra first, then Sol 6.1 on his call or else a fresh, blind Opus reader (D1760, D1770).
4. Two lines saying "Astra and Sol 6.1, D590" now say the same arrangement as item 3 (D1734, D1770).

Seen, not drafted (not this group's files): `.claude/rules/bug-check.md` and `how-we-work.md` still treat D1743's window as open; the gates guide's "Four traps" still gives the old, narrower `git archive raptor-port/src` recipe.

**The three places least sure of:**
1. **893** (order §0a step 3 and checklist step 3): "past about 40%, plan two chats" comes from one case. It may clash with his compaction rulings (D868, D874); if it does, it could become ASK.
2. **The size of walk-scripts (+19%)**: the four timing lines in §5 could merge into one paragraph. The D590/D601 history paragraphs in §4 were not moved to `docs/archive/`, though the italic D1734/D1770 note has overtaken them; that cut is a candidate.
3. **The rewritten "who reads" lines (stale fixes 1–4)** are a reading of D1734, D1760 and D1770 — to be checked against the How we work page for any change in meaning.

Also: 728's CSS half counts as already written only because of code comments in the Leave War stylesheets (`matrix.css`, `approvals.css`), not a guide. `[BUGCHECK-LESSON-ORDER]` (the second lesson 23, after §8) is due "with the next change to the order"; this is such a change, but it was not moved, as its lesson-number search was not done — left to the coordinator.
