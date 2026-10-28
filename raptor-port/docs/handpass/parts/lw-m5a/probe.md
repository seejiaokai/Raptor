# M5a — the host's probe (29 Oct 26)

The route every walker starts from, driven first on the frozen build of commit 27e5d655c served on 4173 (the served page's
bundle `index-BHe1I-qr.js` is the local `dist`'s). Script: `raptor-port/scripts/handpass/lw-m5a-probe.mjs` (v2), run
`node scripts/handpass/lw-m5a-probe.mjs` from `raptor-port/`; the war's today 25 Jan 2026. Pictures:
`raptor-port/docs/img/handpass/2026-10-28-lw-m5a/probe/` (`desk-*` at 1536 × 860, scale 1.25; `phone-*` at 402 × 874, touch,
each phone press with its `-q` picture ~100 ms after the lift); the raw results `probe.json` there.

**48 PASS, 2 FAIL, 0 NOT WALKED** (25 checks a size). Both FAILs are one fault: on a desktop the person window opens off the
bottom of the screen. No console error, page error or 4xx at either size.

| Step | Size | Verdict | What the screen said | Pictures |
|---|---|---|---|---|
| 1 tab row, admin | desk | PASS | Grid · Approvals 13 · Balances · OIL, ⚙ at the right end | desk-01-tabrow |
| 1 tab row, admin | phone | PASS | Grid · Approvals 13 · Balances · OIL, ⚙ at the right end (icons kept at 402) | phone-01-tabrow |
| 2 Balances, Ranger's row | desk | PASS | the page in the grid card's place (grid not drawn); Ranger App bal 15, carried fwd 2, Pending −2.5 (amber), War bal 12.5, OIL 0 ›, Senior pilot +36, CCL 3 −1, FCL 5, PL 2 −0.5, EL 4, CL 1 −1 — 7 boxes | desk-02-balances |
| 2 Balances, Ranger's row | phone | PASS | the same figures; grade "Senior pilot · +36" | phone-02-balances |
| 3a typed 16 + Enter | both | PASS | App bal 16, War bal 13.5, no refusal words; the box keeps the keyboard | desk-03a-typed, phone-03a-typed |
| 3b Undo | both | PASS | App bal back to 15, War bal 12.5; the page's scroll unmoved (0/0 before and after) | desk-03b-undo, phone-03b-undo |
| 3c Redo / 3d Undo again | both | PASS | 16 / 13.5, then back to 15 (the note "Undid: LVE balance 15 → 16") | desk-03c-redo, phone-03c-redo |
| 4a Days taken | desk | PASS | heading "DAYS TAKEN IN JAN - DEC 26"; columns LL OL OIL CCL FCL PL EL CL MED CSE OD; Ranger LL 3, the rest – | desk-04-taken |
| 4a Days taken | phone | PASS | the same columns (no period heading on a phone); Ranger LL 3 | phone-04-taken |
| 4b back to Balances | both | PASS | App bal box back, 15 | — |
| 5a Grades… opens | both | PASS | 5 grades: Senior pilot +36 (16 people), Junior pilot +33 (12), Senior WSO +21 (7), Junior WSO +18 (11), Ops A +14 (3) | desk-05a-grades, phone-05a-grades |
| 5b Escape closes it | both | PASS | gone; the keyboard back on Grades… | desk-05b-closed, phone-05b-closed |
| 6 person window from Ranger's name | desk | **FAIL** | the window opens (its tiles read right: 3 taken, App bal 15, Pending −2.5, War bal 12.5, incl. 2 carried fwd · till 31 Dec, OIL 0 ›, MED 0, CCL 3 FCL 5 PL 2 EL 4 CL 1; year "2026 and ahead"; 8 lines) **but stands off the screen**: its top at 860 of an 860 screen, its right edge 1528 | desk-06-person (no window in sight) |
| 6 person window | phone | PASS | in the middle, 10 px each side; the same tiles; 8 leave lines (19–21 Jan 3 Approved … Tue 17 Mar CL 1 Pending) | phone-06-person |
| 6b it closes | desk / phone | PASS | desk: by Escape (✕ off the screen); phone: by ✕ | — |
| 7a Lock for members on | both | PASS | switch on (desktop "Lock for members", phone padlock closed and lit cyan) | desk-07a-lock-on, phone-07a-lock-on(-q) |
| 7b member's tab row | both | PASS | Grid · Balances · OIL, no ⚙ | desk-07b-member-tabs, phone-07b-member-tabs |
| 7c member, locked | both | PASS | "Locked by admin" with the padlock; Ranger's row read only (15 2 3 5 2 4 1), no box | desk-07c-member-locked, phone-07c-member-locked |
| 7d lock off again | both | PASS | switch off | desk-07d-lock-off, phone-07d-lock-off |
| 8a `lockViaBridge(on)` under the member | both | PASS | his 7 boxes go, "Locked by admin" shows | desk-08a-bridge-on, phone-08a-bridge-on |
| 8b `lockViaBridge(off)` | both | PASS | the 7 boxes come back | — |
| 8c the lock under his open box (14 typed, no Enter) | both | PASS | the box goes; the note "Ranger LVE App bal not saved: Locked by admin" | desk-08c-lock-under-box, phone-08c-lock-under-box |
| 8d App bal unchanged | both | PASS | 15 | — |
| 9a today 1 Jan 2027, after a reload | both | PASS | the reload signed him out (signed in again); period on screen JAN - DEC 27; Ranger 49 / incl. 13 / −0.5 / 48.5, CCL 3 −1, FCL 5, PL 2 −0.5, EL 4, CL 1 −1; My leave "LVE 48.5 · OIL 0 · 5 pending" | desk-09a-2027, phone-09a-2027 |
| 9b back to 25 Jan 2026 | both | PASS | 15 / 2 / −2.5 / 12.5 again | desk-09b-back, phone-09b-back |
| 10a My leave → his own window | desk | **FAIL** | My leave "next 26 Jan · LVE 12.5 · OIL 0 · 5 pending"; the window opens with his tiles and 8 lines **but at top 2034 of an 860 screen** — over the grid, off the screen | desk-10-myleave (no window in sight) |
| 10a My leave | phone | PASS | his window in the middle (top 45, 10 px each side), no dots (his first visit) | phone-10-myleave |
| 10b it closes | desk / phone | PASS | desk by Escape, phone by ✕ | desk-10b-closed, phone-10b-closed |
| errors | both | PASS | none | — |

## Faults

1. **On a desktop the person window opens off the bottom of the screen** (steps 6 and 10, desk; the phone is right). Expected
   (D1480): docked at the grid's right edge, under its bar. Seen: no window on either picture; measured top 860 of an 860 screen
   over the Balances page and 2034 over the grid, its own `top` empty, its ✕ unreachable (a press lands on the page; Escape
   closes it). The cause, read once to confirm the pictures: the window's docking sets its top and height, then the shared
   window's keyboard follower (`Sheet.tsx useKeyboardInset`, `place()` with no keyboard up) clears `top`, `bottom` and
   `maxHeight` straight after, so the fixed window falls to where it would stand in the page's flow — below the page. Every
   desktop way into the person window carries it.
2. **Candidate, for the host to look at — on a phone the Grades window's column heading "AUTO + LVE ON 1 JAN" runs into the
   window's right edge, "JAN" cut** (phone-05a-grades; a close crop in the host's scratch run showed the N cut at the window's
   edge). Not measured as outside the window by the box test (the words overflow inside their own cell), so seen on the
   picture only.

## Observations (not judged)

- On 1 Jan 2027 Ranger's LVE Pending reads −0.5 while his 2026 pending leave (Thu 29 Jan AM 0.5, 12–13 Feb 2) is still
  pending; walker D judges the 1 Jan figures against the designer's scenarios (D1474 — pending over the new year counts in
  the year its days fall in).
- My leave's "5 pending" counts his pending requests (5), where the window's Pending counts days (2.5).
- The "Saving…" passing note stands over the ⚙ for a moment after the phone padlock is pressed (phone-07a-lock-on-q).

## `lockViaBridge`

Works on both sizes. **The localhost bridge has no function for the lock**; the helper uses the bridge's role switches
(`raptorRole`, `lwSetRole`, localhost only) around the store's own lock writer found in the served build's store module, in
one synchronous call. Limits: it reaches into the bundle rather than a named bridge function (a rebuilt bundle is found again
by its file name pattern), and the change history names Ranger for the lock, not Saber. A lock landing under his open box
takes the box away, so the scenario's "his Enter, refused" cannot be pressed: the refusal comes as the note instead.

## Errors seen

None — no console error, page error or 4xx at either size.
