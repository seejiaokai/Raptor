# HANDOFF — 24 Sep 26 (night). **The rulings are now split by area and load by relevance (D136 + D137) — read §How rulings are kept, below.** `[TRK-PINCH-DRAGS-BALL]` and his "left side cut off" report — MERGED as PR #431 on D133 (his advance "merge live", this session only; his look waived). Before it: the Tracker `[HUMAN-RETEST]` and PR #428's Leave War fixes, both on `main`.

**Pick `main` in the new-chat picker.** Before acting: `git fetch`, `gh run list --branch main --limit 3` — the
Tracker merge's own check run on his PC may still have been going when this was written; confirm it went green.

## The OIL tracker's credit boxes read in full — branch `claude/oil-credit-tags`, MERGED on his "merge live" (D156, 24 Sep 26)

Found by the demo chat while recording: an automatic credit's "Auto" and "Weekend/PH" came out "AU… Weeken…"; the walk
found the reason line cutting "· correction" / "· not covered" / "· 3 days" the same way. Fixed in `oiltracker.css` (the
box's words wrap, never cut), WALK tier, sheet `raptor-port/docs/handpass/2026-09-24-oil-credit-tags.md`, all gates green.
**D156:** he looked at the preview and said "merge live", and chose to run the pull request's checks on his PC while the
demo chat was busy on it (against the agent's advice to wait); merged once they were green. **Open question put to him:** the demo's
awards for Dash (15 Aug) and Vector (29 Aug) are dated after the schedule's demo week (13–19 Jul) — intended?

## `[TRK-PINCH-DRAGS-BALL]` + his "left side cut off" report — MERGED as PR #431 on D133 (24 Sep 26, night)

Branch `claude/tracker-pinch-drags-ball`, FULL tier: sheet `raptor-port/docs/handpass/2026-09-23-tracker-pinch-ball.md`.
A pinch in Edit chart layout now moves nothing (the second finger takes back whatever the first did — ball, group,
line, Delete, Merge, handles; nothing stored, nothing on the command stream); leaving Edit chart layout leaves its
view behind (his cut-off chart) and holds the middle going in and out. Walked 93/93 with two real fingers (phone,
sideways, tablet), 15 of 16 wires break-tested red (B13 is Safari-only), Astra's scenarios + both final reads (Fable,
Astra) dispositioned and fixed red-first, all gates green. **D133: he gave "merge live" in advance for this work only**
— merged after the PR's checks on his PC went green (the first run stopped on the smoke suite's known "+ Add" race,
now filed as `[TRK-SMOKE-ADD-RACE]`; re-run once with the evidence in the sheet §9). D133 covered this session only.
His look was waived: the card is §12 of the sheet, held by `[TRK-PINCH-ASK]`; his two feel questions are answered
(**D134: keep both as built**). The live app: `https://raptor-kai-e2f5.vercel.app` (his Vercel sign-in first).

## The Tracker pinch fix — MERGED on his "merge live" (23 Sep 26, night)

His report from the live app: the chart's pinch zoom did not follow his fingers ("off to the top left"). Fixed
on `claude/tracker-pinch-anchor` (one anchor body for the pinch and the + / − buttons), walked on phone /
sideways / tablet, gates green, merged on his "merge live" after the PC's checks. Sheet:
`raptor-port/docs/handpass/2026-09-23-tracker-pinch.md`. Filed from it: `[TRK-PINCH-DRAGS-BALL]` (done — above),
`[TRK-EDIT-SIDEWAYS]`, `[TRK-TAP-AFTER-DRAG]` (asked him whether he has seen it on his phone — not answered yet; ask
again before working on it).

## The Tracker `[HUMAN-RETEST]` — DONE and merged (23 Sep 26)

Branch `claude/tracker-human-retest-8d3411`, merged to `main` on his "merge live" after his look on its Vercel
preview (the look card is §13 of the evidence sheet `raptor-port/docs/handpass/2026-09-23-tracker.md`). FULL tier:
every finding fixed red-first and walked; the two blind reads (Fable + Astra) done and every finding fixed; the final
gates green on the finished code; his three questions answered and built (D130–D132). Rulings **D120–D132** (the
charts' route to the database; one access for admin and member; imports never wipe typed details; Last Flown;
deleting a ball wipes its marks; resuming beside the demo; details per chart; a backup remembers a deleted chart; a
course restore door; logout asks; a deleted ball's typed details go with it; a backup does not carry a deleted
course; an import never deletes marks). Left from it, none blocking: `[TRK-RETEST-NOTES]`.

## Next, in order

1. **The presentation/demo-video work (D154) is DONE (D135, 24 Sep 26)** — the PC is no longer shared with it; D86's
   one-full-run-at-a-time and "not while the PC runner is mid-run" still stand. D58 holds (no unit designation).
2. **`[HUMAN-RETEST]` continues — THE AMENDMENT SYSTEM is next** (the Tracker half is done): D85/D86 — port 4173,
   rulings from D90, FULL tier, the Tracker's sheet `raptor-port/docs/handpass/2026-09-23-tracker.md` is the worked
   example. The demo is done (D135): the PC is its own, heavy runs still one at a time. The order of the other three (change-recording, the absence record, the Leave War links) is not ruled:
   propose it and ask.
2a. **DONE 24 Sep 26 — `main`'s Docs guard green again.** The rulings pass (D136, then D137 the same hour) and 14
   finished items out of `OUTSTANDING.md` (1,479 → ~1,200), both read beforehand by Fable and Astra.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[TRK-SMOKE-ADD-RACE]`
   (the smoke suite's "+ Add" step can still lose a name under load), `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]` (a one-frame blink), `[LW-FIGSEL-SLOW]` (a slow unit test).
4. `[DOC-TRIM]` — what is left: `raptor-port/CLAUDE.md` → 500, `HANDOFF.md` → 400, `OUTSTANDING.md` → 600 (its item).
5. Before ANY collaborator: take the runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## How rulings are kept (D136 + D137, 24 Sep 26)

One file per area under `.claude/rules/decisions/`: **How we work loads in every session**; Tracker, Leave War,
Scheduler & amendments and OIL each load BY THEMSELVES when a file in that area is read. `DECISIONS.md` is the map
(which file holds which D-number); replaced rulings and spent one-off permissions are in `DECISIONS-ARCHIVE.md`.
A new ruling: a row at the top of its area's table, mark any row it replaces, then
`node raptor-port/scripts/backlog-archive.mjs --rulings` (moves marked rows, rewrites the map). `docsize` fails —
in CI and at the end of every turn — until the map matches. The next number: `DECISIONS.md` §Parallel branches.

## The checks run on HIS PC

A Windows service under NETWORK SERVICE at `C:\actions-runner\actions-runner` (never delete `C:\actions-runner`);
its folder permissions were tightened by him (Astra SEC-102, done). PR #428's evidence (the Leave War fixes):
`raptor-port/docs/handpass/2026-09-23-lw-monthjump.md` PART TWO.

## How pushes cost runs (his question, 23 Sep 26)

Any push to a branch with an open PR re-runs the whole check set, even notes-only (D151's reason). Notes wait
and ride along with the next real change or the merge; the merge itself earns one run on `main`.
