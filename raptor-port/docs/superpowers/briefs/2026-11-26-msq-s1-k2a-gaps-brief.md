# Section 1 (the guard rail) — K2a's three gaps against its drawing (chat 198, 26 Nov 26)

**What this is.** K2a ("+ Add a person" in Admin → Users' top row, the form under it) is built and merged. The presser
measured the open form beside its approved drawing (`2026-11-26-msq-s1-k0p-report.md`, Part 1, the table "Every
difference over about 2px, measured") and found three differences, the same on a desktop and on a phone. This job
closes them. His rule (D1494, D1495): a build with a drawing is red until each difference over about 2 is fixed.

**The three, in screen points (build against drawing):**

| Part of the open form | Now | Wanted |
|---|---|---|
| The heading "ADD A PERSON" and the six fields (Callsign/Name, Initials, Pilot/WSO/Personnel, CAT, Sign-in, Post in) | each 2 lower than drawn | as drawn |
| The note "Makes his Quals row…" | 19.5 below the Sign-in box (desktop), 21 (phone) — 10 nearer the fields than drawn | 29.5 (desktop), 31 (phone) |
| "Add person" · "Cancel" | 8 higher than drawn | as drawn (their size, gap of 6 and left edge already match — keep them) |

Drawings: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/s1-add2-a-d-crop.png` (desktop) and
`s1-add2-a-p-crop.png` (phone, drawn 402 wide — the 12-point width differences on a phone come from that and are not
faults). Open both with the Read tool before changing anything, and the two side-by-sides the presser left
(`p1-side-open-d.png`, `p1-side-open-p.png`).

## The one file you may change

`raptor-port/src/ui/postout.css` — **the add form's own rules only**: new or changed rules scoped under
`#page-admin .od-add` (the form's block, `#accAddBlock`) and, if the 2 points come from it, the space between the top
row and the form. Nothing else on the page may move by a pixel: not the closed top row, not "Waiting for access" on the
closed page, not an opened row's Save · Cancel pair, not `.adm-sub`, `.adm-2col`, `.acc-note` or `.acc-acts` anywhere
outside the form. No `.tsx` file, no test file, no other stylesheet. If the gaps cannot be closed from this file alone,
stop and say so in the report.

**Not this job (leave it, name it in the report if you see it):** on the CLOSED page "WAITING FOR ACCESS" sits 6
nearer the top row than another section's drawing shows — that drawing belongs to the Admin → Users section. The thin
separator line under the open form is the builder's addition and stays; it is named to the owner at his look.

## How to measure — the presser's own scripts, on port 4741, under the checks lock

Read `raptor-port/scripts/handpass/n194/k0p-lib.mjs` first (how it serves, signs in and saves pictures), then
`k0p-p1-add.mjs` and `k0p-p1-measure.mjs` with `k0p-p1-scans.json`. Read `raptor-port/docs/walk-scripts.md`'s traps
only as far as you need them.

1. From the repo's top folder: `node raptor-port/scripts/lean-copy.mjs get 2026-11-26-msq-s1-k0p` — this working copy
   leaves old walk pictures out, and a re-drawn picture is skipped silently unless the folder is fetched first.
2. Check the lock is free and take it, from the repo's top folder:
   `node raptor-port/scripts/gatelock.mjs status`, then
   `node raptor-port/scripts/gatelock.mjs take "claude/msq-s1-guard-6ae5e1 — K2a gaps re-measured"`. If it is held,
   wait and try again; never build alongside another chat's run.
3. Check port 4741 is free (PowerShell `Get-NetTCPConnection -LocalPort 4741`). Build (`npm run build`, in
   `raptor-port/`, by its full path) and serve the built app on 4741 the way the presser's library expects.
4. Run Part 1's script for the desktop and the phone, then the measuring script with `side`, and read the numbers
   against the table above. Change the stylesheet, rebuild, re-run — until every difference in the open form is within
   2 points on both sizes (aim for 0). Open the new side-by-side pictures yourself and look at them.
5. Also confirm, by the script's own figures before and after, that the closed page's top row and the gap under it
   have not moved.
6. Run the form's own tests: `npx vitest run src/ui/msq-guard-g.test.tsx` (in `raptor-port/`). In `e2e/`, search for
   the tests that open the add form (`accAddOpen`, `accAddBlock`); if any measures a position inside the form, run
   those tests only (by title, `E2E_PORT=4742` after checking that port is free) and report the result.
7. Stop the preview **by its port** (`Get-NetTCPConnection -LocalPort 4741` → `Stop-Process`), confirm the port is
   free, and release the lock (`node raptor-port/scripts/gatelock.mjs release`) — the moment the last run ends, pass or
   fail.

Do not commit, do not push, do not touch `HANDOFF.md` or the plan.

## Report → `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k2a-gaps-report.md`

The rules you changed and why each number; a table of the three parts — drawing, before, after, on a desktop and on a
phone; proof the closed page did not move; the pictures you made (names) and that you opened them; the tests run and
their counts; anything you could not close or could not check. End your reply with that path and a five-line summary.
