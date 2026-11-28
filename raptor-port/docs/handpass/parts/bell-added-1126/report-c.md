# bell190 — walker C (the Leave War) — report, 26 Nov 26

Build: `http://localhost:4190/`, bundle `index-B9okpSpf.js` (checked on the first probe). Desktop: Chromium 1536×864.
Phone: WebKit 402×874, isMobile, touch, scale 3.
Pictures: `raptor-port/docs/img/handpass/2026-11-26-bell-added/c/` (94 in the cited runs; a superseded first attempt of S3
kept apart in `c/attempt1-s3/`, 15 pictures — see S3 note). Scripts and logs: `scratchpad/bell190-c/` (`bell190-c-lib.mjs`,
`-s1`, `-s1p`, `-s1q`, `-s2b` (v3 of s2), `-s3b`, `-s4`, `-s6`, `-s6b`; logs `s1.log` … `s6b.log`).
Every scenario ran in its own fresh browser context, on real storage (never `?fresh=1`); every leave and input tested was
made in the run through the app's own controls. All browsers and scripts stopped.

**Counts: 15 PASS · 0 FAIL · 9 RECORD · 0 BLOCKED** (plus 1 partial: A28's "several-days selection" route not walked).

## Two things about the set-up the host should know
1. **WebKit cannot reach the server.** The server answers only on `::1`; WebKit on this PC times out on `localhost`,
   `[::1]` and `127.0.0.1` alike (a tiny server of its own on 127.0.0.1 loads in 185 ms). The phone runs therefore went
   through a pipe inside the script (127.0.0.1:random → [::1]:4190), the same served bundle, closed with the script. No app
   server was started or stopped. The host's message offering the same build on :4173 for WebKit came after every phone
   run had finished, so the phone runs (S1p, S1q) stand on :4190 through that pipe — the same bundle, `index-B9okpSpf.js`;
   they were not re-run on :4173. Desktop runs: Chromium on :4190 direct.
2. **The third man is Kilo**, added by Saber on Admin → Users with the app's form: callsign Kilo, initials KL, Pilot,
   CAT C, sign-in `kilo` (signs in with any password), post-in Thu 1 Jan 26 (the form's own calendar). He lands in the
   OPS P group under Gambit — 19 rows from Ranger — so a drag over "Ranger and Kilo" would take in 18 other men. The
   several-people case was walked over **Gambit + Kilo** (Kilo's bell on screen, Gambit's in the store) and over
   **Ranger + Saber** (the actor among the selected).

Bells read ON SCREEN: Ranger (`us`), Kilo (`kilo`), Saber (`ad`). Read IN THE STORE (`window.NOTICES`): Gambit, Piston,
the 16 men of the first S3 attempt, and the "to" of every line written.

## The table

| # | Scenario | Door | Size | Verdict | What each bell said, word for word | What a tap opened | Pictures |
|---|---|---|---|---|---|---|---|
| 1a | LL one day, Auto-approve ON [F35, A24] | bid window, desktop | 1 day | PASS | Ranger: **Your leave** Wed 22 Jul · LL added and approved · Saber. Saber: "Nothing new". Store: one line, to Ranger only. | the Leave War grid, 22 Jul first in view, its head ringed | c-s1-01, -02, -07, -08, -13 |
| 1b | LL run of three, Auto-approve ON | drag along his row, desktop | 3 days | PASS | Ranger: **Your leave** Mon 27 – Wed 29 Jul · LL added and approved · Saber — ONE line | the grid at 27 Jul | c-s1-03, -04, -08, -12 |
| 1c | LL half day (AM), Auto-approve ON | bid window, AM, desktop | ½ day | PASS | Ranger: **Your leave** Wed 5 Aug · LL (AM) added and approved · Saber | the grid at 5 Aug | c-s1-05, -06, -08, -11 |
| 1d | the same three on the phone | bid window tap; "Pick a range" calendar for the run; AM | 1 / 3 / ½ day | PASS | Ranger (phone): **Your leave** Wed 22 Jul · LL added and approved · Saber; **Your leave** Mon 27 – Wed 29 Jul · LL added and approved · Saber; **Your leave** Wed 5 Aug · LL (AM) added and approved · Saber. Bell lit (red dot), picture right after the tap | the grid at 22 Jul / 27 Jul / 5 Aug, picture right after each tap | c-s1p-01…04, -07(-tap), -12(-tap); c-s1q-01…12 (-tap pictures beside each) |
| 1e | lines marked read | tap on each line | — | PASS (note) | after the taps all three lines read (no dot). Opening the bell alone leaves a line unread; only a tap on it (or Mark all read) reads it | — | c-s1-19 |
| 2a | pending bid placed for Ranger, Auto-approve OFF [F36, A25] | bid window | 1 day (22 Jul) | RECORD | **No line to anyone.** Ranger's bell: "Nothing new", not lit. The day window then reads "Placed Saber · Thu 26 …" | — | c-s2-01, -02, -04 |
| 2b | pending bid, range, Auto-approve OFF | drag 27–29 Jul | 3 days | RECORD | No line to anyone (same picture as 2a) | — | c-s2-03, -04 |
| 2c | Saber approves the 22 Jul bid [A28] | day window → Approve | 1 day | PASS | Ranger: **Your leave** Wed 22 Jul · LL approved · Saber (not "added", not "You were added"); nobody else | the grid at 22 Jul | c-s2-05, -12, -24 |
| 2d | Saber approves the 27–29 Jul bid [A28] | Approvals tab → the line's Approve | 3 days | PASS | Ranger: **Your leave** Mon 27 – Wed 29 Jul · LL approved · Saber — one line | the grid at 27 Jul | c-s2-06, -07, -12, -23 |
| 2e | the same from the several-days selection [A28] | select sheet's Approve | — | NOT WALKED | the brief asks only day window and Approvals; the sheet does show Approve on a pending block (c-s3b-08) | — | — |
| 2f | Auto-approve ON, LL over Ranger's own pending LL [F37a] | bid window | his bids 9 and 10 Dec | PASS (with a RECORD) | Ranger: **Your leave** Wed 9 – Thu 10 Dec · LL approved · Saber. RECORD: Ranger had filed two one-day bids (9 Dec, then 10 Dec); the war holds them as one run, and Saber's LL on 9 Dec approved **both days**. A second press (OL on 10 Dec) then did nothing — no line, the window stayed open, the cell still LL | the grid, 9 Dec head ringed (Dec drawn from 10 Nov, the year's end) | c-s2-075, -08, -09, -10, -11, -12, -21 |
| 2g | Auto-approve ON, OL over Ranger's own pending LL [F37b] | bid window | 1 day (21 Dec) | RECORD | Ranger: **Your leave** Mon 21 Dec · OL added and approved · Saber. Nothing is said of his LL bid: the cell now reads OL, and his bid is gone without a word | (bell picture) | attempt1-s3: c-s3-09, -11, -18 (see S3 note) |
| 2h | (side line seen) Saber opens December for bidding | Bidding chip → DEC | — | RECORD | Every man with a sign-in (Ranger, Hex, Outlaw, Hunter, Kilo): **Leave War** 1 Dec – 31 Dec · Bidding open · Saber | the grid (Nov/Dec) | c-s2-12, -22 |
| 3a | several people, Auto-approve ON [F38, A26] | drag over Gambit + Kilo | 2 people × 2 days | PASS | Kilo (on screen): **Your leave** Wed 2 – Thu 3 Dec · LL added and approved · Saber. Gambit (store): the same words, to Gambit. Neither told of the other; nothing to Saber. (The sheet first asked "That takes Kilo to −2 LVE. Tap the same leave again to go ahead." — answered) | Kilo's tap: the grid at 3 Dec-area (Dec) | c-s3b-01, -02, -10, -11 |
| 3b | several people with the actor among them [A26] | drag over Ranger + Saber | 2 × 2 days | PASS | Ranger: **Your leave** Mon 7 – Tue 8 Dec · LL added and approved · Saber. Saber: nothing (store and bell) | — | attempt1-s3: c-s3-05, -15, -18 |
| 3c | a mix where one is kept back [A27, F39] | Kilo posted out (Delete) from 14 Dec; drag over Gambit + Kilo 15–16 Dec | 2 × 2 days | PASS (+RECORD) | Gambit (store): **Your leave** Tue 15 – Wed 16 Dec · LL added and approved · Saber. Kilo: **no line**; the sheet says "2 days kept pending — Kilo: He posts out on 14 Dec: refuse or delete it."; his two days show as a pending LL. Kilo's kept-pending bid telling him nothing is the same open question as 2a | — | c-s3b-06, -07, -08, -09, -10 |
| 4a | OD from the war [F40, A30] | drag 27–29 Jul → OD | 3 days | PASS | Ranger: **OD** Mon 27 Jul · You were added · Saber — one line, no Leave War line beside it | the input's own window ("Ranger · 27 Jul → 29 Jul", OD) on the Inputs page | c-s4-01, -07, -16 |
| 4b | OD on the phone | bid window tap → OD | 1 day (30 Jul) | PASS | Ranger (phone): **OD** Thu 30 Jul · You were added · Saber | the input's window ("Ranger · 30 Jul", OD), picture right after the tap | c-s1p-05, -06, -07, -11(-tap) |
| 4c | CSE from the war | one-day window → CSE | 1 day (3 Aug) | PASS | Ranger: **CSE** Mon 3 Aug · You were added · Saber | the input's window ("Ranger · 3 Aug") | c-s4-02, -07, -15 |
| 4d | Other whole day, Other AM [F41, A29] | window ⋯ → Other | 5 Aug; 6 Aug AM | PASS (+RECORD) | Ranger: **Other** Wed 5 Aug · You were added · Saber; **Other** Thu 6 Aug · You were added · Saber. RECORD: the AM one says nothing of AM | the input's window ("Ranger · 5 Aug" / "· 6 Aug") | c-s4-03-OTH-05, -03-OTH-06, -07, -13, -14 |
| 4e | Attach [F41, A29] | window ⋯ → Attach | 7 Aug | PASS | Ranger: **Attach** Fri 7 Aug · You were added · Saber | the input's window ("Ranger · 7 Aug") | c-s4-03-ATCH-07, -07, -12 |
| 4f | CSE for two at once, the actor one of them [A30] | drag Ranger + Saber → CSE | 2 × 2 days | PASS | Ranger: **CSE** Mon 10 Aug · You were added · Saber. Saber: nothing. Ranger's window from the line reads "Ranger · 10 Aug → 11 Aug", PERSON Ranger | the input's window | c-s4-04, -07, -11 |
| 5 | a leave moved across rows [F43] | approved LL → ⇄ Move → a tap on Ranger's row | 1 day | RECORD | **It cannot cross rows.** Kilo's 10 Dec LL, Move, a tap on Ranger's 10 Dec: banner "It is already on that day — pick another day." Piston's 17 Aug LL, Move, a tap on Ranger's 18 Aug: the leave moved to **Piston's own** 18 Aug; Piston (store) got **Your leave** … LL moved (`d:"moved"`, to 18 Aug); Ranger nothing | — | c-s3b-03, -04, -05; c-s4-05, -06 |
| 6a | Undo before Ranger reads [F45, A38] | top bar Undo | 1 day LL, Auto ON | RECORD (as the brief asks; matches D1693's expectation) | after Undo: the leave gone and the line gone from the store; Redo: both back; Undo again: both gone. Ranger then signs in: "Nothing new" | — | c-s6-01 |
| 6b | Undo after Ranger read the line [F46, A38] | Saber's tab keeps Undo; Ranger reads in a second tab, then the one-tab check | 1 day LL, Auto ON | RECORD | Ranger tapped the line (read, the dot gone; the read mark is stored on its own, `noticeseen:bane`). Saber pressed Undo. Ranger's bell after a reload, and again after a fresh sign-in in one tab: **"Nothing new" — the line simply vanished**, no new line, no struck "taken back" line. The 23 Jul cell is empty. Fable's expectation (a new unread line saying what is true now, D1693/D2437) is not met — not built, per the scenarios file | the line, before the Undo: the grid at 23 Jul | c-s6b-01…06 (and c-s6-02…05: the same with the line only opened, not tapped — also gone) |
| 7 | a tap on each line [A45] | — | — | PASS | (above) | every **Your leave** line opened the Leave War at its day (first day in view, its head ringed), desktop and phone; every input line (OD, CSE, Other, Attach) opened that input's own window | as listed |

## FAILs
None.

## RECORDs, in plain words, for the host to put to him
1. **A pending bid an admin places for a man (Auto-approve off) tells him nothing** — one day or a run (2a, 2b), and the
   same for a man's part kept pending because he posts out (3c). He finds out only when it is approved ("LL approved").
2. **An admin's OL over a man's own pending LL bid** (2g): the man is told "OL added and approved"; nothing tells him his
   LL bid is gone.
3. **Two one-day bids a man files on following days are one run**: an admin's approval of one day approves both, and the
   line names both days (2f) — true to what happened, but the admin pressed only one day.
4. **Undo after the man has read the line** (6b): the line vanishes; he is not told the leave was taken back.
5. **An Other filed for the morning only** (4d): the line does not say AM, where the war's own leave line says "LL (AM)".
6. **Opening December for bidding** sends every man with a sign-in a "Bidding open" line (2h) — outside this job, noted.
7. **A leave cannot be moved to another man's row** (5): Move stays on his own row.

## Not a finding, but seen
- The input window that a line opens on the Inputs page sits over a calendar left on the current month (November), not
  the input's month (c-s4-16) — the window itself is right.
- Ranger (a member) sees **Delete** on an OD Saber filed for him, in the window his line opens (c-s1p-11). Not this
  walk's question; the host may want to check it against the people-and-accounts rules.

## S3 note — the superseded first attempt (`c/attempt1-s3/`)
The first S3 run aimed a drag from Ranger's row to Kilo's, 19 rows down; Kilo's row was off the screen, so the drag ended
on Ace's row and put LL with Auto-approve on 17 men (Ranger to Ace, Saber among them; one below-zero question answered),
twice (2–3 Dec, 15–16 Dec). The store then held **one line per man, his own days, none to Saber** — 16 lines each time —
which supports 3a/3b. Its 2g (OL over his own bid) and 3b (Ranger + Saber) steps were sound and are cited from it; its
Move and posting-out steps did nothing useful (no leave to move; Kilo outside the drag) and were redone in S3b.
