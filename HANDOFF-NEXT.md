# HANDOFF — 24 Sep 26 (night). `[TRK-PINCH-DRAGS-BALL]` and his "left side cut off" report — done, merging on D133 (his advance "merge live", this session only). Before it: the Tracker `[HUMAN-RETEST]` and PR #428's Leave War fixes, both on `main`.

**Pick `main` in the new-chat picker.** Before acting: `git fetch`, `gh run list --branch main --limit 3` — the
Tracker merge's own check run on his PC may still have been going when this was written; confirm it went green.

## `[TRK-PINCH-DRAGS-BALL]` + his "left side cut off" report — DONE; merges on D133 (24 Sep 26, night)

Branch `claude/tracker-pinch-drags-ball`, FULL tier: sheet `raptor-port/docs/handpass/2026-09-23-tracker-pinch-ball.md`.
A pinch in Edit chart layout now moves nothing (the second finger takes back whatever the first did — ball, group,
line, Delete, Merge, handles; nothing stored, nothing on the command stream); leaving Edit chart layout leaves its
view behind (his cut-off chart) and holds the middle going in and out. Walked 93/93 with two real fingers (phone,
sideways, tablet), 15 of 16 wires break-tested red (B13 is Safari-only), Astra's scenarios + both final reads (Fable,
Astra) dispositioned and fixed red-first, all gates green. **D133: he gave "merge live" in advance for this work only**
— it merges once the PR's checks on his PC are green; if the PR is still OPEN when you read this, its checks were not
green: read them first, do not re-merge on D133 in a later session (it covered this session only). His look was
waived: the card is §12 of the sheet, and `[TRK-PINCH-ASK]` holds it with his two feel questions — ask him next.

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

1. **The presentation/demo-video chat (D154) is the current work** — preview 4185, rulings from D170; D58 holds
   (no unit designation). `main` now has the Leave War fixes and the Tracker's.
2. **`[HUMAN-RETEST]` continues** — the Tracker is done; the amendment system's re-test (D85/D86: port 4173, rulings
   from D90) has not started. The order of the other three (change-recording, the absence record, the Leave War
   links) is not ruled: propose it and ask. One heavy run at a time on his PC (D86, D125).
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his two feel questions + his iPhone look — ask first), `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]` (a one-frame blink), `[LW-FIGSEL-SLOW]` (a slow unit test).
4. A docs-only trim pass (D29): DECISIONS is over its ceiling.
5. Before ANY collaborator: take the runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## The checks run on HIS PC

A Windows service under NETWORK SERVICE at `C:\actions-runner\actions-runner` (never delete `C:\actions-runner`);
its folder permissions were tightened by him (Astra SEC-102, done). PR #428's evidence (the Leave War fixes):
`raptor-port/docs/handpass/2026-09-23-lw-monthjump.md` PART TWO.

## How pushes cost runs (his question, 23 Sep 26)

Any push to a branch with an open PR re-runs the whole check set, even notes-only (D151's reason). Notes wait
and ride along with the next real change or the merge; the merge itself earns one run on `main`.
