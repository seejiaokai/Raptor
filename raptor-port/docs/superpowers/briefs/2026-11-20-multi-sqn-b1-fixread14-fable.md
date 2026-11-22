# Fix read 14 — Fable's blind read, returned 20 Nov 26 (saved by the host from its final message; the helper's own file was not written)

**Verdict: no confirmed finding.** Read at `bfc9ad0e3` (fix code `aa96a9a0f`); the host's overlay.ts note taken (three grep lines of the old copy seen, none relied on). No file under `raptor-port/src` changed; probe files deleted.

Builder's suites green in the copy: fixread13 31/31, fixread12 37/37, fixread11 46/46, fixread10 29/29, fixread9 26/26, fixread8 22/22, fixread7 23/23, person-delete 22/22, postout-roster 44/44.

Probes (harness copied from multi-sqn-fixread13.test.ts; saved copy wired and seeded unless said):
- BOOT — the app's real start-up (bootApp, demo policy), a reload on the same store, signed in as Saber, Kestrel, Ranger, Hunter: every request (54) and bell line in memory has a saved row; every posting equals its saved row in both worlds; revertUnsavedPostOuts puts nothing back; the master deletes one seeded request of each of 16 kinds and Undoes each — 16/16 both rounds. A refuses no honest removal; B reverts no honest posting.
- T3 — a member deletes his own saved request, Undo, Redo, Undo: all pass.
- T2 — Hunter places an approved leave on the war, Undo, Redo, clears the cell, Undo; the master clears it: all pass.
- P2 — Ranger's own saved request rewritten in memory "filed by Saber a month ago", then an honest edit (a put), then a delete: edit refused, saved row keeps its real filer; delete refused; no line reaches Saber.
- P1 — Saber deletes Casper; the delete marks cleared in memory outside every command; then a person command: refused ("a deleted person brought back"). An ordinary Quals edit of the deleted man afterwards still saves and keeps the mark.
- T7 — a saved Delete posting for Casper; Ranger re-links Kestrel's sign-in to Casper in memory; the pass runs in Ranger's browser: Casper deleted, Kestrel's sign-in untouched.
- Q2 — D2228 with the drag window and the saved-copy gate: Hunter places Ranger's leave, both move to 149, Kestrel types words in the leave's own window, then the drag window: each time Ranger and Hunter told once, Hunter through 149, both lines saved.
- Q1 — a war leave placed for two men; drag-window words on one: one request per man; Ranger and the filer told once.
- Q3 — a meeting naming nobody, filed by Hunter in 142; he moves to 149 as its admin: not told through D2228's branch.

Choices: (1) A supported — nothing raises a `remote` change today; the swapped image is the saved record. (2) B supported — posting compared whole against the saved row; accounts list does not steer the pass; a second tab's undone or re-dated posting now takes the saved one (an improvement). (3) C supported on the reading in D2228's row. (4) D(1) supported — reads only a row already marked deleted; a missing delete date compares equal; a new person never reuses a deleted row. (5) D(2) supported — told once, through the right squadron, never of his own words; other remark doors run outside a war command.

Rounds fit together: fix reads 7–12's suites green.

Not checked / by reading only: (for his eye, not a fault) where every day of the leave falls before the shared move, the moved filer is not told — the ruling row's reading; a pass whose war-records start point is stale after several war writes in one turn might be refused by the stricter posting check until the next write — no input built; the pass and gate read the browser's date (older, same family as the held "line dated ahead"). Not run: the full unit suite, browser tests, any walk.
