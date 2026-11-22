# Job 2's re-walk after the fixes — walker R (desktop and iPhone, 19 Nov 26)

You are a walker (Sonnet). You drive the running app in a real browser and report what the screen shows, with pictures.
You never read the app's code for bugs, never change anything under `raptor-port/src`, never commit or push. Write only
your own walk scripts (`raptor-port/scripts/handpass/msq/msq-j2-r-*.mjs`) and their pictures. Send your report ONCE, after
stopping every script and browser you started; write it to
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/5b60f044-be66-416c-b9bc-c289e42f5770/scratchpad/job2/walk/r-report.md`
and hand back a short summary.

The fixes made tonight tightened who may write which squadron's bell lines, read marks, change-history lines, inputs and
Leave War records. This walk checks that ordinary work inside one squadron still works on screen — nothing allowed has
been shut out — and that the master's work across squadrons still lands.

**Read first, whole:** `raptor-port/docs/walk-scripts.md`. Then the passing routes you start from — copy their helpers and
prove each against the present screen once: `scripts/handpass/msq/msq-j2-w1-b.mjs` (Admin → Users, archive, delete, the
war grid's rows, Grant OIL), `msq-j2-w1-d.mjs` (the posting sheet, the person window), `msq-j2-w3-*.mjs` if present, else
`msq-j2-host-f.mjs` (the iPhone: the bell, a day's window and its ⋯), and `msq-j2-host-c.mjs` (reading the stored history
lines through `localStorage`, read only).

## The tooling and the machine's traps

- Library: `scripts/handpass/msq/msq-lib.mjs` (`open({phone,user})`, `login`, `signOut`, `pic`, `row`, `fin`, `say`),
  `msq-w1-util.mjs` (`pidOf`, `bodyText`). Run every script from `raptor-port/`.
- Settings for every run (in the shell line): `MSQ_DIST=<given by the host in your instructions>`
  `MSQ_BUNDLE=<given>` `MSQ_IMGDIR=2026-11-19-multi-sqn-b1-job2` `MSQ_WHO=r` and `MSQ_RUN=<a short new name each run>`.
  The library serves the frozen build from inside the test browser — never start a server, never use `?fresh=1`. Each
  `open()` is a fresh world (its own storage).
- Write each script with the file tool (UTF-8) and run it as a file — never inline. Never send a script's rewrite and its
  run in one step. Each script prints a version line first. Stop after 3 failed attempts at one gesture: OWED, with its
  picture.
- Sign-ins: `ad`/`a` Saber (142, the master admin) · `ad2`/`a2` Hunter (142's plain admin) · `us`/`us` Ranger (142
  member) · `ad9`/`a9` Kestrel (149's only admin) · `us9`/`us9` Osprey (149 member). 149's people: Kestrel, Osprey,
  Merlin, Harrier, Condor, Falcon, Heron, Raven, Shrike, Gannet. Today on screen is Thu 19 Nov 26 — T. An account an
  admin adds takes any password.
- The bridge (`window.PEOPLE`, `localStorage`) is for READING only — never to make or change anything.
- Each assertion gets one `row(...)`: what you did, EXPECTED, what the screen said word for word, PASS / FAIL / RECORD /
  OWED and the picture's name. A picture right after every press that should show something; read the screen AFTER it.

## The orders

**R-A — 149's admin runs bidding (desktop 1536, a fresh world).** Sign in as `ad9`. The Leave War → the "Bidding closed"
chip → open December as one month → done. EXPECTED: the chip shows the open dates; the green outline on December.
Sign out; sign in as `us9`: his bell has a line that bidding opened, naming the dates and Kestrel; tap it (RECORD what
opens). Sign in as `ad9`; close December again. Sign in as `us9`: a "bidding closed" line. Picture each bell open.

**R-B — a member's own input, and his bell (same world).** As `us9`: Inputs → + Input → a Training for himself on Mon 23
Nov → Add. EXPECTED: it shows on the list. Change its remark → saved. Sign in as `ad9`: Inputs → open Osprey's Training
→ add Merlin to it (the people picker) → Save. Sign in as `us9`: his bell has a line about Merlin being added (RECORD the
words). Then as `us9`: open the Training → take himself out (the window's own control for it) → press the top bar's Undo
→ EXPECTED he is back in it; Redo → out again. Picture each step.

**R-C — the changes window shows ordinary work (same world).** As `ad9`: Edit Schedule → the week holding Thu 19 Nov if
the week buttons reach it, else any week offered → change one remark or time on any line → open the changes window (the
clock) → EXPECTED his change listed under the item. As `ad2` in the same world: Edit Schedule → change one line → the
changes window lists his change; RECORD whether Kestrel's change shows (EXPECTED: no — each squadron's own history).
Read the stored history lines (as `msq-j2-host-c.mjs` does) after each change: RECORD each line's squadron (`u`) and label.

**R-D — the master's delete of a 149 man and 149's history (desktop, a fresh world).** As `ad9`: the Leave War → Merlin's
Thu 26 Nov → bid LL (Auto-approve OFF, so it stays a bid) and on Tue 24 Nov Grant OIL → Give FO. Sign in as `ad`: Admin →
Users → Merlin → Delete (twice). Read the stored history lines: EXPECTED, filed under 149 (`u149`), a line for Merlin's
deletion, a line "bid removed" on 26 Nov and an "OIL award taken away" line on 24 Nov. Sign in as `ad9`: his war shows
Merlin's row with nothing from today on.

**R-E — 149's Approvals and the access-request bell (same world as R-D).** As `us9`: the Leave War → bid LL on Mon 30
Nov. Sign in as `ad9`: the Leave War → Approvals → EXPECTED Osprey's bid listed and marked new; leave Approvals, come
back → EXPECTED it is no longer marked new. Sign out; on the sign-in card ask for access as a new person (a new sign-in
name, any password), asking for 149 if asked. Sign in as `ad9`: EXPECTED his bell lights with the access request; open
the bell, then Admin → Users → the waiting request; leave; RECORD whether his bell is dark again. Sign in as `ad` (the
master): RECORD what his bell shows.

**R-F — the last admin, again (same world).** As `ad`: Admin → Users → Kestrel → Archive. EXPECTED: refused, "Kestrel is
149's last admin. Make another admin of 149 first." Then Osprey → role Admin → Save; then Kestrel → Archive → EXPECTED
archived. Picture each.

**R-G — the phone, by touch (iPhone 402 × 874, a fresh world).** As `us9`: the bell opens and closes (a tap on the bell,
again, and a tap outside). As `ad9`: the Leave War → a day of Osprey's → its window → Grant OIL → Give FO → EXPECTED FO
on the grid; Undo → gone; Redo → back. As `us`: Inputs → + Input → a Training for himself → Add → it shows.

## Report

Each order's rows (PASS / FAIL / RECORD / OWED, the words seen exactly), the deciding pictures, every console or page
error (`fin` prints them), and anything odd with a plain user's eye. Do not explain causes; say what you saw.
