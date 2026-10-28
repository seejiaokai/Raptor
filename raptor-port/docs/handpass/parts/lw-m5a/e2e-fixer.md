# M5a — the browser-test fixer's report (29 Oct 26, ~03:15), in its own worktree, branch `m5a-e2e-fix` on 92b43acf9

**Commits to cherry-pick, in order:** 701d21208 (Sheet.tsx's keyboard follower undoes only what it wrote — replaces the host's
`data-docked` guard), 7cc170b70 (the docked person window stays above Approvals' slim bar — `dock()` writes only `--pw-top`,
personwindow.css works the height: 10px off the foot, 74px while the slim bar is up, never under 200, desktop only),
96f7172b9 (the four-tab row fits at 320 and from 701 to 820 wide; 701–760 drop their icons — a DEPARTURE from the drawings at
those widths, to name to him, D1424), 0d5357ed6 (the e2e rewrites and the new "wholly on screen" test), 39e19f78a
(`test.slow()` on step4's reload test).

**App faults it found:** (1) a window that places itself lost its place — the follower cleared top / bottom / max-height on
every run with no keyboard; the host's guard fixed the person window only, NOT the Grades window (docks under "Grades…",
focuses its first grip on opening) — red first in `sheet-keyboard.test.tsx` "a sheet that places itself keeps its place";
(2) the docked window ran across Approvals' slim bar once it kept its place (foot 841, bar top 834 — the e2e "with Approvals'
slim bar up, a window opens above the bar" red); (3) the four-tab row overflowed in wider letters — at 320 ⚙ lay over OIL (a
press on OIL opened Settings — the raptor save-note failure); 701–820 Approvals' count ran past its outline; 701–760 ⚙ cut.

**Each GitHub failure:** :1351, :2407, step4 :347 :381 :418 :444 :463 :674 :761 — fault (1); :2433 pinned the old blocking
sheet (the person window blocks nothing, D641 — rewritten, plus a test of no scrim and the page scrolling behind it); :2224 —
demo now types every LVE, ROCKY −2 is the negative; :2860 — HARPOON reads 12 under D1479 (rewritten: the same from either
war, Pending −4, War bal = the grid's); :2759 — the member's row Grid · Balances · OIL; :7521 — Ranger's own demo leave took
the test's days, moved to free days; :916 and save-note 320 — fault (3); step4 MED reads 0 because MED counts this year to
today and the suite pins 1 Jan 2000 — `figures()` reads MED with today at 31 Dec 26; step4 :686 `test.slow()`.

**Final counts on his PC (4 workers, under load from the walk):** lw-desktop 192 / 8 failed / 56 skipped; lw-phone 212 / 1 /
43; raptor 582 / 17 / 3 — re-run with one worker: lw-desktop 4 (:4171, :5519, :5848, :6559), lw-phone 1 (:4096), raptor 9
(changeswin, the crew-day picker, inputs-sans-calendar ×3, restblank, schedule-tab) — the four lw-desktop and lw-phone :4096
pass alone on both 92b43acf9 and the branch; none touched by M5a, none failed in GitHub's run at 27e5d655c: load, GitHub's
run is the gate. Every touched or new test passes.
