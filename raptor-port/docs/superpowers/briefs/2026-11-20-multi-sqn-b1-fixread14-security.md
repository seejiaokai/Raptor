# Fix read 14 — security reader (D1411), returned 20 Nov 26 (saved by the host; the helper could not write files)

## SEC14-1 (high; older, half-closed by fix A): a member puts a war approval or the late-drop mark on his own leave through an honest edit then Undo
Proof (zz-sec14-lw-undo.test.ts, saved copy wired and seeded as item A's tests): Ranger (142 member) files his own LL for 27 Jul (saved, no lw); outside every command sets x.lw = 'y2026' in memory; saves an edit putting every field back as saved and changing the remark — accepted (a member may drop lw); presses Undo — accepted; the saved row now reads lw: 'y2026' (approved on the war), old remark. Same with lateOff: true. Control: cx refused at the edit.
Second proof (zz-sec14-put-undo.test.ts): forged by / person refused (memory-image check still runs); a forged date passes but he may change his own date anyway.
Cause: storedRowViolation judges the edit with memory's before-image and with the saved row; both pass. Item A (b) carries the saved row as before-image only for a removal (carry keeps c for a put), so the Undo step records memory's made-up image; the timeline's verified replay vouches for it and inputBreach returns at `if (replayed || !f) return null` before the scheduler's marks or the lw rule.
Fix: (1) in storedRowViolation (b), for a put whose memory before-image differs from the saved row (moved), carry the saved row as before-image, keeping only memory's landing-only fields (acc); or refuse such a put outright. (2) Test for lw, lwMoved, lateOff — red now, green after. (3) Re-run item A's, fix read 11/12 D's, p6*, and every file that wires a saved copy.

## Builder's choices
(1) A: exemptions checked (store not whole, restore, seed, REMOTE_ONLY grows only from remote changes); delete with no before-image changes nothing; the swap applies only after ownershipChecks, only removals, only with the judged saved row — no stale/foreign record, no hidden change. Incomplete half = SEC14-1.
(2) B: gate needs before = saved posting row, date and outcome unchanged; setStoredRowProbe set in persist.ts at real start-up (not fail-open on a built site); people/account/grant/bell changes all tied to `posted`, now only from a saved posting. Pass inside another command's reducer judged as that maker; phase-8 pass reverts memory in its own command. lw.sync forging routes via getState() mutate a shared committed object → no change to save (not proved by test). postingPassViolation does not judge LW cells/ledger/balances — older, no route found, not proved.
(3) C: homeAdmin needs moved since filing + admin now + home today a named man's home on an input day; all D2223 controls hold; role read at change time; callers pass no date (today). Suspended/archived admin filer still told (on not checked) — same as at-home branch; not a finding.
(4) D(1): before-image from PEOPLE_BASELINE (last saved roster); account dropped on every read while deleted; archive/restore of a non-deleted person never meets the check.
(5) D(2): tell skips the changer; filer told once via filerVia's squadrons, passes toldBy / filerMarkOk; other remark doors use the ordinary path.

## Negatives
Nothing lets one person see, write or take another squadron's bell, another man's leave or his account through A–D. Only SEC14-1, within the member's own record.
