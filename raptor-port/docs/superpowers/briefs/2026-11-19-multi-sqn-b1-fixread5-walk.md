# Fix read 5's fixes — walk report (desktop 1536 and iPhone 402, 19 Nov 26)

Build: fr5-dist, bundle index-V_B3c44g.js. Scripts: `raptor-port/scripts/handpass/msq/msq-fr5-{f1,f1b,f2,f3b,f4}.mjs` (probes: `-probe`, `-probe2`, `-probe3`; `-f3` is superseded, see Script notes).
Pictures: `raptor-port/docs/img/handpass/2026-11-19-multi-sqn-b1-fixread5/f/<run>/` — each run has its own `log.txt` and `rows.json`. Cited runs: f1d, f1p, f1b-tap-d, f1b-tap-p, f1b-all-d, f1b-all-p, f2d, f2p3, f3bd, f3bp, f4d3, f4d-read, f4p, f4p-read.
Errors (console/page/HTTP): none in any cited run.

Totals of the cited runs: 68 PASS, 2 FAIL, 1 OWED, the rest RECORD.

## What the bell looks like (read first)
- The bell has a DOT, not a number. It is hidden when nothing is new and shown (display block) when a line is new. So "number equals unread lines" was read as "dot lit exactly when a line is marked new".
- Empty bell says: "Nothing new". A line reads, for example: "Leave War / 1 Dec – 31 Dec / Bidding open · Kestrel / now". A "Mark all read" button sits at the foot of the list only while there is something new.
- A new world holds no bell lines for any of the five sign-ins; lines only come from work done.

## F1 — every bell
- Fresh world, each of ad Saber, ad2 Hunter, us Ranger, ad9 Kestrel, us9 Osprey, desktop and iPhone: top bar pictured, bell opens, shows "Nothing new", dot hidden, closes by its own control, reopens and closes by an outside tap. 30 PASS (15 desktop + 15 iPhone). Pictures `f1-<user>-topbar/open/closed-bell/closed-outside` in f1d and f1p.
- With a line (Kestrel opens December for bidding, Osprey signs in): the bell lists one NEW line "Leave War 1 Dec – 31 Dec Bidding open · Kestrel now", dot lit (RECORD, both sizes; f1b-03).
  - Tap the line: opens the Leave War page (Osprey's, chip reads "Open for bidding 1 Dec – 31 Dec" desktop / "Open 1 Dec – 31 Dec" phone) (RECORD, f1b-04). The bell closes by itself on the tap.
  - Reopen: same line marked read, dot gone, new count down by one (PASS desktop and iPhone, f1b-05).
  - Separate world, "Mark all read" instead of tapping: line becomes read, dot gone (PASS desktop and iPhone, f1b-06).
  - Observation (lead, not a finding): when Kestrel opened December and then closed it again before Osprey looked, Osprey's bell held ONE line, "Bidding closed · Kestrel" (NEW); the earlier "Bidding open" line was not listed (run before the script change; seen in the first f1b runs, desktop and iPhone, same result). Not reproduced as a fault in any brief step; the brief does not say whether the closing replaces the opening line.

## F2 — own leave (LL on Mon 23 Nov, Inputs page; add, top bar Undo, Redo)
- Hunter (ad2, 142 admin), Ranger (us, 142 member), Kestrel (ad9, 149): each, desktop and iPhone — add saved and shown on his row (a "No document" question appeared and was answered "No document"), Undo removes it, Redo brings it back. 18 PASS (f2d, f2p3, pictures `f2-<user>-03/05/06`). Ranger's form has no person choice (fixed to himself); Hunter's and Kestrel's open on their own name.
- Hunter looks at a 149 day's schedule: OWED. No screen offers Hunter a 149 day: no squadron switch exists for him (top bar shows "142 TALON", Edit Schedule and View-only Sched show only 142 weeks; no squadron select anywhere on the page). Pictures `f/probe3/probe3-edit.png` area (host probe run folder `probe3`). Nothing walkable to check "View only, no way to add his leave".

## F3 — a bell line written, taken back, put back (nobody moved)
Route used: Kestrel opens December for bidding (Leave War chip, December month, Done) — it is on screen. Sign-out clears the top bar's Undo list (ruled), so Kestrel stayed signed in in tab 1 and Osprey read his bell in a second tab of the same world (reloaded, signed in as Osprey).
- Desktop and iPhone (f3bd, f3bp), all PASS (12):
  - After opening: Osprey's bell shows NEW "Leave War 1 Dec – 31 Dec Bidding open · Kestrel now", dot lit.
  - Kestrel's top bar Undo: chip back to "Bidding closed"; Osprey's bell (tab reopened): no line, dot gone.
  - Kestrel's Redo: chip "Open for bidding 1 Dec – 31 Dec" (phone "Open 1 Dec – 31 Dec"); Osprey's bell: the same NEW line is back.
  - Pictures `f3b-01` to `f3b-06`.

## F4 — the posting take-back
Route: Saber, Leave War, Ranger's cell for today (Thu 19 Nov), day window, ⋯, Post out, "Overseas Sqn" chip, Post out. Ranger's row shows PO from 19 Nov. The top bar's Undo stays greyed after a posting (as ruled); the take-back is the day window's own "Undo post out (PO)" button, which was used. (A first run pressed the sheet's "Delete" chip, which deleted Ranger the person: a script mistake, discarded and not cited.) Hunter and Ranger read their bells in a second tab.
- Hunter's bell after the posting: NEW "Ranger Thu 19 Nov Posted out · off the manpower 14 h", dot lit (PASS desktop and iPhone, `f4-06`).
- Take-back, Hunter had NOT read the line: Hunter's bell is empty ("Nothing new"), dot gone; Ranger's bell empty (RECORD desktop and iPhone, `f4-09`, `f4-10`; runs f4d3, f4p). Ranger's PO row is gone from the grid (`f4-08`).
- Take-back, Hunter HAD read it first (tapped the line; it took him to the Admin page): EXPECTED a "taken back" line; the screen showed an empty bell ("Nothing new"), no "taken back" line. FAIL on the brief's expectation, desktop (f4d-read `f4-09-hunter-bell-after-undo.png`) and iPhone (f4p-read, same name). Steps: sign in as ad, Leave War, post Ranger out today; open a second tab as ad2, open bell, tap the posting line; back in tab 1 open Ranger's cell and press "Undo post out (PO)"; reopen ad2 in a fresh tab and open the bell.

## F5 — other places showing the result
- After F3: the Leave War chip follows Undo/Redo exactly (Bidding closed / Open for bidding) on desktop and iPhone (`f3b-03`, `f3b-05`).
- After F4: Ranger's war row shows PO from 19 Nov after the posting and no PO after the take-back (`f4-05`, `f4-08`); Ranger's own bell shows nothing at any point (RECORD). No other bell or list places were seen to disagree.

## Script notes (not findings)
- `msq-fr5-f3.mjs` (single tab, sign-out between users) showed Undo/Redo greyed after sign-in, because sign-out clears the Undo list; replaced by `msq-fr5-f3b.mjs` (two tabs). Its pictures (runs `f3d`) are not cited.
- Early F2 phone runs (`f2p`, `f2p2`) counted words wrongly (a phone card reads "HunterLL"); the counter was fixed and `f2p3` is the cited run. The desktop counts include one "LL" from the legend, so only differences are used.
- Early f1b runs (`f1bd`, `f1bp`) expected two lines; superseded by the f1b-tap/-all runs.
- Early F4 runs `f4d`, `f4d2` (Delete chip pressed by mistake) are not cited.
