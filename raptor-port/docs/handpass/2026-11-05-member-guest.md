# A member on Edit Schedule, and a guest's saves — the bug check (5 Nov 26)

`claude/member-guest-checks`, job 3 of the night of 4–5 Nov 26 (his "Go"). Two checks from the backlog:
`[MEMBER-EDITPAGE-CHECK]` (a member sent to Edit Schedule by the developer bridge sees live-looking Amendments buttons —
does the write path refuse?) and `[GUEST-SAVE-WARNING]` (does anything a guest does get saved through the app's saver,
and is he told when it fails?), and — question 7 — every other route by which a member or a guest could reach a write.
Pictures: `docs/img/handpass/2026-11-05-member-guest/` (the host's probe, round 1), `…/probe2/` (round 2), `…/walk/` (the
Sonnet walk), `…/rewalk/` (the fix re-walked); mock-ups `docs/mock/2026-11-05-member-guest/img/`. Parts:
`docs/handpass/parts/mg1105/` — the scenario design, the walk report, the two reads, each saved whole.

## 1. The eight questions and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL) | NO — nothing earned or counted is touched |
| 2 | The published record | NO in the change; the CHECK presses Publish AL1 and the sign-offs as a member, so it is walked |
| 3 | Saved data | YES — the fix changes what a saved change-log batch records as its actor |
| 4 | A shared drawer | NO |
| 5 | A new gesture or mode | NO |
| 6 | A new surface | NO |
| 7 | Roles | YES — who may do what, and what a waiting person's save shows members |
| 8 | The warning list | NO |

**Tier: FULL.** The server question (§5) is carried by `perms.test.ts` and `perms-scan.test.ts`, both run green; no §11 row's
letters changed — the ChangeBatch row's note gained what its actor may name.

## 2. The roll-call — every place a member or a guest can reach a write

| Place | A member / guest writes there? | Proved by | What else is drawn there |
|---|---|---|---|
| Edit Schedule's Amendments panel, "Publish AL1" (member, bridge only) | must NOT — the command gate refuses `sched.publishAL` (Amendment C is the admin's) | probe M2a/M2b (mouse, keyboard: 0 writes, no issue), walk A1 both sizes | the button draws live and a press says nothing — Q3 below |
| Every other control on Edit Schedule (member, bridge only): week buttons, the date jump, CSV, PDF, CAT / TYPE / QUALS chips, search, the legend, each day's plan selector, changes count, ⓘ, Traffic, pucks, CREW rail | must NOT | probe round 1 M3 (28), round 2 R2-M3 (worklist, below) | the week draws read-only for a member (`canEditSched()` false) |
| Edit Schedule's text cells and empty seats (member) | must NOT | round 2 R2-M3, with the admin's positive control P1 | — |
| The day heads' Publish day / Publish AL / sign-off strip / Clear | not drawn for a member, because the week builds them in edit mode only (`html.ts` `ed`) | probe M3's list (absent); security read negative 5 | — |
| The full-screen board forced open (member, bridge only — no click path) | must NOT | probe M4 (80 of 87 pressed), round 2 R2-M4, walk A4–A6 | sign-off pills drawn; a pick says "Couldn't save that — try again" and the saved name stays on the pill — Q3 |
| A puck dragged from the crew panel onto a seat (member) | must NOT | walk A3 (0 writes; onto a filled seat — no empty seat that day); click-to-place R2-M3 | — |
| A member's own pages — Inputs (his own leave: add, edit, delete, Undo, Redo), Quals (his own row), the bell | YES, his own rows only | walk B both sizes: writes only `inputs/*`, his history lines, `people/bane`; Management refused with words | his own Scheduler tick is his to untick — Q2 |
| The admin's member view: Undo of his own admin step | must NOT | probe X2: refused, "Switch back to the admin view to undo that.", 0 writes, page kept | — |
| The guest page (`GuestApp.tsx`): weeks, every control, a 6 s wait, sign out and in | must NOT | probe G4 (0 writes), walk C2 both sizes | only the app's own "reopen page" key is removed at sign-in |
| The access screen's Request access (a waiting person) | YES — his one request | probe G2, walk C1 | when the save fails he is told it is with the admins — Q1 |
| The sign-in screen after a failed save (any role) | — (nothing written there) | probe X3: no warning on the sign-in or access screen | the same gap — Q1 |
| The change-log batch saved with a waiting person's request | must NOT name him: every member and guest reads batches (§11) | the security read's F1 — FIXED red-first; re-walk RW both sizes | — |
| The developer bridge | this PC only | `probe-bridge-offhost.test.ts`; `main.tsx` installs it on localhost only | — |
| A URL hash or query | no route | no hash routing in `src/`; `?fresh=1` only gives an empty demo world | — |
| A keyboard shortcut | no route | no global Undo key; the Tracker's own Ctrl+Z only on its tab; the guest page mounts no document listeners | — |
| A window left open across a role change | writes as the role now in force | `resetSession` closes windows and clears Undo; the member-view switch leaves Edit Schedule; the actor is worked out at each commit (security read negative 11); X2 | — |
| Two tabs of one browser | not a route: the app has no cross-tab sync — each browser is its own world until the database step, where the server enforces §11 | — | — |

## 3. The sizing step (§7.0)

- **Type of change:** B (who may do what) and A (what a save records) — a check of two backlog items, plus one fix.
- **What only a walk could find here:** a control a member reaches that writes outside every command; what a refused
  press SHOWS; what a guest is told when his one save fails; a write that lands only on a later sign-in.
- **What the ledger says about walks of this type:** role walks find their faults in what the screen says after a refused
  press and in the states a role change leaves behind, not in the gate itself (the gate is tested).
- **The walk chosen:** the host's scripted probe (press everything, every storage write counted, the in-memory schedule
  hashed), two rounds — the second a worklist answering the code read; one Sonnet walker for what a person SEES (both
  sizes, a picture right after each phone tap), the plain-user rounds of a member and a guest (D1557), and the failed save;
  the fix re-walked on its own build.
- **Its row:** added to `docs/walk-ledger.md`.
- **The §7.11 lessons, for this change:** 3 (feedback after a press — what a refused Publish, a refused sign-off pick and a
  failed request say: Q1, Q3); 19 (every window closed by each of its ways — walk A2, A6, B; the changes window closes only
  by its ✕, noted); 4 (the page behind an open window — round 2 closes each window after its own controls are pressed);
  6 and 21 (only the real phone — an iPhone never asks "Leave site?", so a stranger whose request failed loses it silently:
  read in `storage/boot.ts guardUnload`, on his look card). The rest do not apply: no gesture, list, pinch, print or hidden page.

## 4. Orders walked

| Order | Result |
|---|---|
| Admin signs off, publishes Monday, edits it, signs again → member presses Publish AL1 (mouse, then keys) | refused, nothing issued, 0 writes (M2) |
| Admin's own setting step → his member view → Undo → Redo | Undo refused with its words; Redo has nothing (X2) |
| Stranger asks → guest page → weeks → sign out → in again | one save (the request); straight back to the guest page (G, C) |
| Stranger asks with storage refusing → guest page → storage works again | the request lands by itself on the saver's retry (GR6) |
| Stranger asks with storage refusing → the tab closed | desktop: the browser asks "Leave site?" once; the request is gone (GF7, D3) |
| Admin's save fails → sign out → the sign-in and access screens | no warning on either; the save lands when storage works, the admin back (X3, X4) |
| A member's leave: add → edit → delete → Undo → Redo | each saved, his own rows only (walk B) |

## 5. Cases carried by a test

| Case | Test | What it proves | Real route? |
|---|---|---|---|
| A waiting person's batch names his role, never his sign-in name | `src/state/changebatch-rollcall.test.ts` "a waiting person's batch names his role…" | the sealed batch of a real `requestAccess` | yes — a real sign-in as a stranger, the real writer, command layer and sealer; red before the fix (`principal:kite@mail`) |
| Every command type maps to a §11 row; no rule decided elsewhere | `perms.test.ts`, `perms-scan.test.ts` | the server question (§5) | the table itself |
| The bridge is never installed off this PC | `probe-bridge-offhost.test.ts` | a member on a deployed host has no `setPage` | the install function |

## 6. Break tests

The fix's test was red on the code before it (the break): `expected 'principal:kite@mail' to be 'pending'`.

## 7. Errors seen

None — no page error, console error or failed request in any run (probe rounds 1 and 2, the walk, the re-walk, the mock-ups).

## 8. Not walked, and why

- A real touch swipe and long-press on the guest page in WebKit (the test browser refused to make a touch); the guest
  page's swipe only moves the view (`pan.ts`), mounts no writer — security read negative 12.
- His iPhone's own "no question on leaving" — read in the code (`boot.ts guardUnload`: iOS never fires it); on his look card.
- Documents (the input window's file box) — never reachable on Edit Schedule or the guest page; the code read's F7.

## 9. Gates

On his PC: the touched unit files (`changebatch-rollcall`, `changebatch`, `perms`, `perms-scan`, `accounts`,
`accounts-rows`: 153 passed), `npm run build` green, `npm run lint:changed` no new finding. GitHub's run of the pull request
is the full set (D1086) — the host opens it.

## 10. What the walk and the reads found

**[MEMBER-EDITPAGE-CHECK] — CLOSED with its reason.** The page gate is not the only thing between a member and a write:
every write on Edit Schedule and the board is a command, and the command gate refuses a member every schedule type
(`state/perms.ts` `COMMAND_OPS` — `sched.publishAL` and `sched.sign` are Amendment C, `sched.slot` / `sched.text` are the
schedule's U, all the admin's), while the commit check refuses any change a member's command makes to the schedule's own
records (`ownershipViolation`, `SCHEDULE_RECORDS`) and rolls it back. Pressed as a member (the developer route), Publish
AL1 by mouse and by keys, every control on the page and on the board, the sign-off pills, the boxes, a drag and
click-to-place saved nothing and changed nothing on screen; the whole member run wrote 0 times. No production route puts a
member there (the tab hidden, the member view leaves the page, every sign-in lands on View-only Sched, the bridge is this
PC's only). "Discard marks" is gone since D488. What a person would SEE there is parked (Q3, recommended: leave it).

**[GUEST-SAVE-WARNING] — a finding, parked (Q1).** Nothing a guest does on the guest page is saved — 0 writes for every
control, every week, a 6 s wait, sign out and in (probe G4, walk C2). But the same person's one save, his access request on
the waiting screen, goes through the app's saver, and when it fails he is told "Your request is with the admins": no
warning on that screen nor on the guest page; if the tab is closed the request is gone and nobody hears — on a desktop the
browser asks "Leave site?" once, on an iPhone nothing asks (`storage/boot.ts guardUnload`). Left open, the saver's own retry
lands it once storage works (GR6). The same gap hides an admin's failed save after he signs out: the sign-in and access
screens draw no warning (X3). The fix is a band he would see — drawn, not built (D1625).

**Found by the walk, a question (Q2).** A member ticks or unticks his own Scheduler appointment on Quals, and it saves
(walk B — Ranger). D1510 leaves him every column but Management and the callsign, so it is allowed today; but the tick
decides who may be named on SKED CK, PLANNED BY and APPROVED BY (`publish.ts signRoleOk`), and a scheduler is always an
admin (D785).

**Found by the security read, FIXED (F1).** The change-log batch saved with a waiting person's request named him by his
sign-in name, and every member and guest reads every batch (§11). Now it names the role "pending"; red first; re-walked on
the fixed build at both sizes (RW-1 to RW-3). For the database step (the code read): Dataverse's own "created by" on that
row would name him again — for the host to note there.

**The code read (8 probe findings, 0 app findings)** — answered by round 2 (`mg1105-probe2.mjs`): F1 every press logged as
landed / disabled / NOT PRESSED, a NOT PRESSED a FAIL; F2 a worklist re-listing the page and every window after each press;
F3 text cells and empty seats pressed, the admin's positive control first; F5 the run total a check; F6 people, inputs and
the Leave War hashed, and the next sign-in checked; F8 the hash week-independent. F4 settled by GR6 (the flush held only the
request); F7 (documents) not reachable here — §8. Its observation on AdA4: the picked name stays in the hidden select, while
the pill shows the saved name (`walk/AdA4-pill-after-repaint.png`: "CUR CK Ace") — on the developer route only; in Q3.

**Round 2 (`probe2/results-probe2.txt`).** The positive control first: as the admin, 14 editing presses (text cells typed, the
search, the in-time lines) — 11 SAVED and showed on the week (P1 PASS): the probe sees an edit when there is one. Then the
member on Edit Schedule: 102 kinds listed as the worklist grew (28 pressed, 2 disabled, 71 gone before their turn — a
window's own control that closed with it — and 1 NOT PRESSED: the crew panel's "Next day", covered; a view control); the
board: 130 kinds (19 pressed, 65 disabled — the board's boxes and pills are switched off for a member — 46 gone, 0 not
pressed). **0 storage writes across the whole member run (R2-M9 PASS), and nothing saved at the sign-out or at the admin's
sign-in after it (R2-M10 PASS).** The script's two FAIL lines were read against the run and are not faults: a week button
re-works the week's input landings in memory as any week load does, for every role (the "inputs" reading moved, no write);
and the "typed text left" reading is the name search box's own text — a filter, where text stays by design — which then
reads on every later press of that page (the board's 63 lines are that one text and its disabled boxes; every one wrote
nothing and moved nothing else). The Leave War's in-memory state is not on the bridge, so its reading is a constant; its
saves would show in the storage count, which read 0.

**Older things met in passing, not this job's:** the changes window closes only by its ✕, not by Escape or a click beside it
(walk A2 — no ruling found that it should; not filed as a fault); in WebKit, a scripted sideways scroll of Quals on a phone
left its pinned headings behind (the mock-up script's own scroll; a finger scroll not tried — unconfirmed); a guest signing
in again lands on the week he last looked at (D1383 allows the demo week until testing).

### The parked questions (for him, with pictures)

**Q1 — a stranger whose access request could not be saved is told it was sent.** *Case:* Kite, a new pilot, signs in on
his iPhone with no account, fills Request access and presses it while the phone's storage refuses (full, or a locked-down
browser). Today the screen says "Your request is with the admins"; nothing was saved; if he closes the tab the request is
gone and no admin hears of it. *Recommended:* yes — the same "Not saved — keep this page open · Retry" band every other page
wears, across the top of the waiting screen and under the guest page's bar, and on the sign-in screen while a save from
before a sign-out is still waiting. *Pictures:* `docs/mock/2026-11-05-member-guest/img/Q1-waiting-today-*.png`,
`Q1-waiting-proposed-*.png`, `Q1-guest-today-*.png`, `Q1-guest-proposed-*.png` (desk and phone). *Waits on it:* a small
build (the band is the app's own `SaveBand`), with its walk. At the database step a failed save is a network failure — the
band applies the same (D1551: nothing the platform cannot do).

**Q2 — should a member's own Scheduler tick on Quals be the admin's, like Management?** *Case:* Ranger, a member, opens
Quals, presses ✎ Edit and unticks "Scheduler" on his own row; it saves. Any day he signed as SKED CK, PLANNED BY or
APPROVED BY then reads that sign-off as missing ("needs an appointed scheduler") and its next amendment cannot go out until
re-signed; ticking it puts a member in those sign-off lists. *Recommended:* yes — his Scheduler cell reads only, as his
Management cell does (D1510), refused at the Quals write and the commit gate alike, because a scheduler is always an admin
(D785). *Pictures:* `Q2-quals-today-*.png`, `Q2-quals-proposed-*.png`. *Waits on it:* a small build with a security read
(D1411). It narrows D1510 — his word first.

**Q3 — Edit Schedule as a member: hide Publish AL# and the board's sign-off pills?** *Case:* only on this PC, through the
developer tools, a member put on Edit Schedule sees "Publish AL1" live; a press does nothing and says nothing; on the board
a sign-off pick says "Couldn't save that — try again". No control, link or address takes a member there. *Recommended:*
leave it — nothing is saved, and no person can reach it. *Pictures:* `Q3-amendments-today-desk.png`,
`Q3-amendments-proposed-desk.png`. *Waits on it:* nothing.

## 11. His look card

1. (Q1) The waiting screen and the guest page, today and proposed, on his iPhone's size — the band is the only new thing.
2. (Q2) Quals, his own row as a member: is Scheduler his to change?
3. Nothing else: the fix (the change log's actor) changes nothing on screen.

## 12. The reads

- Scenario design: fresh Opus — `parts/mg1105/scenarios-opus.md` (23 scenarios; 1, 4, 6–8, 13, 19, 22 walked; 2 and 3 as
  X3; 5, 9–12, 14, 20, 21 are role-switch and posting states whose writes take the role in force — the security read's
  negative 11 and X2 — not walked one by one; 15–18 are two tabs and storage that cannot be touched, not routes of this
  prototype; 23 is not a write).
- The security read (D1411): fresh, blind Opus — `parts/mg1105/read-security-opus.md`: F1 (fixed), its Q1 already filed (a
  member's choice of Leave War period saved as a shared setting — `OUTSTANDING.md`, group B), 14 negatives.
- The code read: fresh, blind Opus — `parts/mg1105/read-opus.md`: the fix right; 8 probe findings, answered by round 2.
- The walk: Sonnet 5.5 — `parts/mg1105/walk-report.md` (180 pictures).
- Codex (Astra, Sol) not used (D1594 — this job goes on the `[NO-ASTRA-LIST]`); Fable not used (D903).

## 13. The closing lines

Walk: docs/handpass/2026-11-05-member-guest.md · 206 pictures (+14 mock-up) · 12 surfaces · 7 orders · MISSING: 1 fixed (the change log naming a waiting person), 2 parked for him (Q1 the failed-save band on the access, guest and sign-in screens; Q2 a member's own Scheduler tick), 1 recommended leave-it (Q3)
