# Fix read 6 re-walk - report (walker, Sonnet; desktop 1536 and iPhone 402; build index-C8yy2VbS.js)

Pictures: raptor-port/docs/img/handpass/2026-11-19-multi-sqn-b1-fixread6/r/<run>/ (run folders f2d f2p f3d f3dr f3p f3pr f4d.. s4d s4dr s4p s4pr s4p2). Each folder has log.txt and rows.json.
Scripts (all in raptor-port/scripts/handpass/msq/): msq-fr6-f2.mjs, msq-fr6-f3.mjs, msq-fr6-f4.mjs (two-tab, superseded), msq-fr6-f4s.mjs (one tab, the one that counts).

## F2 own leave (LL, Mon 23 Nov) - PASS 18 of 18
Hunter, Ranger, Kestrel, each at desktop (f2d) and iPhone by touch (f2p): added -> shown (LL count +1, window closed); top-bar Undo -> gone; Redo -> back. Pictures f2-<user>-03/05/06.

## F3 bell line written / taken back / put back (Kestrel ad9 -> Osprey us9)
Method note: top-bar Undo is cleared by a sign-out (D148), so the brief's "sign out, back as Kestrel, Undo" cannot be done in one tab. Kestrel stays in tab 1 (keeps Undo); Osprey's bell is read in a fresh tab 2 each time (loaded fresh, so the same-tab rule holds for the bell being judged).
- Unread case, desktop (f3d) and iPhone (f3p): PASS 6 of 6 each. Words: after open, Osprey bell `Leave War 1 Dec - 31 Dec Bidding open · Kestrel now`, unread, dot lit. After Undo: bell empty ("Nothing new"), dot none. After Redo: the same line back, unread.
- Read-first case (f3dr desktop, f3pr iPhone): Osprey taps/reads the line, then Kestrel Undo -> Osprey's fresh tab: bell empty, NO struck "taken back" line. Rows say FAIL (f3dr/f3b-04-osprey-bell-after-undo.png). Steps: Kestrel (tab 1) opens December; Osprey (tab 2) opens bell and taps the line; Kestrel (tab 1, still open since before the read) presses Undo; new tab 3 as Osprey -> bell empty.
  **Treat as OWED, not a confirmed fault:** the acting tab (Kestrel's) was open before Osprey read, so by the same-tab rule it may not know the line was read. It cannot be made clean on screen (a reload or sign-out of Kestrel's tab empties his Undo list). The one-tab F4 below, where the acting tab loads fresh, shows the struck "taken back" line correctly. Not shown either way for the Leave War bidding line.

## F4 posting take-back, one tab throughout (msq-fr6-f4s.mjs) - PASS
Saber posts Ranger out for today (Leave War day window -> ... -> Overseas Sqn -> Post out); sign out / in as Hunter in the same tab; Saber "Undo post out (PO)" on the sheet (the top bar's Undo is greyed after a posting, as ruled); the PO band on Ranger's row goes (s-05).
(a) Unread (s4d desktop, s4p iPhone): Hunter's bell after the posting: `Ranger Thu 19 Nov Posted out · off the manpower 16 h`, unread, dot lit (s-03). Hunter not opened further. After Undo: Hunter's bell empty, dot none (s-07). PASS both.
(b) Read (s4dr desktop, s4pr and s4p2 iPhone): Hunter opened the bell and tapped the line (it opened the Leave War). After Undo, Hunter signed in fresh in the same tab: one line, bell lit, unread: `Ranger Thu 19 Nov Posted out · off the manpower · taken back · Saber now`; on the desktop picture "Posted out - off the manpower" is struck through and "taken back · Saber" is plain (s4dr/s-07-hunter-bell-after-undo.png). PASS all three. (Wording: the brief said "taken back · Saber"; screen adds "now" for time.)
Saber's own bell after his Undo: empty, dot none, all runs (s-06). PASS.
Earlier two-tab runs (f4d, f4dr, f4p, f4pr) showed an empty Hunter bell in the read case; that was Saber's tab being stale (the known two-tab artifact) - superseded by the one-tab runs.

## F5 plain-user round - RECORD
After the take-back, as Saber: Leave War Nov grid, Ranger's row has no PO band left (s-05, s-08; the cell text reads empty); Admin -> Users Ranger row (desktop: `Ranger us · Pilot · CAT IP MEMBER ...`; iPhone: `Ranger us · Member · Pilot · CAT IP ...`) shows no posted/suspended mark (s-09; iPhone s4p2); posting sheet reopened shows the fresh pre-post sheet: `... POSTING ✓ Overseas Sqn Delete SANS Transfer to Sqn On 19...` with a "Post out" button (s-10) - same words as the sheet before the first post (s-01). Note for the host: the line "On 19 Nov: archived, account suspended" is on that fresh sheet (preview of what Post out would do); same before the post, so not a leftover.
iPhone s4p / s4pr F5 stopped (OWED, admin page needs the Users card tapped first - script fixed, s4p2 re-ran it fine).

## Counts
PASS: F2 18, F3 unread 12 rows, F4 one-tab 15 rows (a, b, Saber bell x4 runs) = all main assertions.
FAIL: 0 confirmed.
OWED: F3 read-first case (desktop and iPhone) - not walkable cleanly (tab staleness / Undo cleared on sign-out); F5 on the two first iPhone runs (re-run done in s4p2).
Console / page errors: none in any run. 
Nothing under raptor-port/src touched; nothing committed; no browser or script left running.
