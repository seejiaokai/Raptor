# [UPCHIT-SHEET-LEAVE-CUT] (D1023) — the bug check (branch `claude/upchit-sheet-leave-cut`)

His words: "Ok as recommended" (18 Oct 26), to the question the fresh read of the three follow-ups raised — should the upchit
sheet also list a leave or bid its give-back will cut, before anything changes. Recorded D1023.

| What changed | Where |
|---|---|
| Where an upchit moved later (D999) or deleted (D1022) gives a downchit days back, the upchit sheet lists each leave and bid of his those days will cut, one boxed line each under the give-back, with the amber edge down its left, in the Leave War's own warning words | `ui/UpchitConfirm.tsx` (`cuts`), `ui/scheduler/14-input-editors.css` (`.upconf-cut`) |
| The lines come from the door's own save tried and thrown away, the Leave War's rules heard as they cut; kept only if the try would go through | `ui/inputedit.tsx giveBackCuts`; `state/inputgate-hook.ts gateCuts` / `hearGateCuts`; `leavewar/inputgate.ts apply` |
| The asks carry them: the move (`medAskFor` — the calendar's drag, the schedule's reassign, and now the window's own Save of an existing upchit) and the delete (`upchitDeleteAsk` — the window's Delete, the opened day's Delete key); each re-reads its plan off the lists after the try | `ui/inputedit.tsx`, `ui/MedMoveConfirm.tsx` |
| A tried save puts the inputs back as new objects: an open window is pointed at its record's new copy and keeps what was typed | `ui/pops.ts INPEDIT_REFOUND`, the window's re-seed effect |

## The eight questions and the tier

1. Money / OIL — no: leave and medical never earn (D804); the leave balance moves only by the cut, which is unchanged.
2. The published record — YES: the try runs a real save on what may be a published day and throws it away; it must leave no
   change waiting and no sign-off fallen.
3. Saved data — YES: the try writes and rolls back inside one command; nothing of it may be saved, and the records held on
   screen are replaced by new copies.
4. A shared drawer — yes: the upchit sheet (five doors).
5. A new gesture or mode — no.
6. A new surface — no (new lines in an existing sheet).
7. Roles — no change: the try runs the same permission checks as the save (a member's own upchit only).
8. The warning list — no.

**Tier: FULL** (2 and 3).

## The rulings swept

D1023 (this); D999 and D1022 (the give-back itself — unchanged); D792 (a delete that gives nothing back asks nothing —
unchanged, the try runs only where something is given back); D621 (the Delete key's question — the sheet in its place where
it gives back, as D1022 built); the Leave War's rules ("sick cuts leave" H2; a clashing input replaces an undecided bid
H1/B6; D418 a bid below zero asks first); D747 (the amber line down the left of a row as a warning mark — reused for the cut
lines); D850 (feedback: the note afterwards stays, as the press does more than he touched); D178/D103 (a published day's
change waiting). No clash.

## The roll-call

| Thing | Place | Has it / must not, because… / MISSING |
|---|---|---|
| The cut lines on the sheet | the input's own window → Delete (Inputs page) | HAS — walked C1, C2; test |
| | the opened day's Delete key on the upchit's line | HAS — walked C3; test |
| | the calendar's drag of the upchit to a later day | HAS — walked C4; test |
| | the input's own window → Save of a later date (Inputs page) | HAS — walked C5; test (until now this door built its sheet itself; it now asks through `medAskFor`, the drag's ask) |
| | the input window opened from the schedule (Edit Schedule / the board) — Delete, Save | HAS — the same window and code; test "the window opened from the schedule" (jsdom); not walked (below) |
| | the schedule's reassign of an upchit to another man | MUST NOT — a reassign never gives back (D999's reading: one handed to another man gives that man nothing), so no try runs; unchanged |
| | a NEW upchit (window, Medical tab's "Upchit", DocViewer) | MUST NOT — nothing is given back; no try; test "a new upchit gives nothing back" |
| | an upchit moved EARLIER | MUST NOT — nothing is given back (D999); no try |
| | a give-back whose days hold no leave or bid | MUST NOT — no line; walked C6; test |
| What a line says | a whole-day leave cut | HAS — walked (the LL), the gate's own sentence |
| | a half-day leave cut, a leave of several of which he is one | HAS — the same sentence from the same body (`sickCutsLeave`); not walked (below) |
| | an undecided bid replaced (another man's: "Warden's"; his own: "your") | HAS — walked C1/C4 (admin, another man's); "your" carried by the gate's own test (`inputgate.test.ts`) and the same line body |
| | leave over recorded work (a flag, not a cut) | MUST NOT — not listed; the gate keeps it out of `gateCuts` |
| What the try leaves behind | the inputs, the Leave War grid (leave and bid), the window's typing | NOTHING — walked C1c/C1f/C1e, C3b, C4b, C5b; tests |
| | a published day's waiting changes and sign-offs | NOTHING — walked C8c (heading the same before and after) |
| | the saved store (a reload) | NOTHING — walked C7-0 and C8-0 (after asking and cancelling, a reload keeps all as it was) |
| The cut itself and its note afterwards | Delete / Save | UNCHANGED — walked C2a (the note reads the cut beside "Input deleted"), C4c |
| Undo after | Delete then Undo | HAS — walked C2c, C4d (one step puts back the upchit, the cut and the leave) |

## The walk's size (`docs/walk-ledger.md` — D607)

1. **Type:** C (a sheet's content at five doors) and G (saved data and a published day — the thrown-away save).
2. **What only a walk could find:** that the try leaves nothing on screen or in the store in the real build (the Leave War's
   grid, a published day's heading, a reload); that the sheet with its new lines fits a phone; that the drag and the Delete
   key reach the lines as the window does; that the bid placed on the real grid is named.
3. **The ledger:** D1022's walk (C, G — 58 checks, the host's script) found nothing in its change; D999's the same.
4. **Chosen:** the host alone, one script (`scripts/handpass/upcut1018-walk.mjs`), desktop 1440 and phone 390 by touch, a
   reload twice, a published day. Carried by tests: the schedule-page window (jsdom — the same window, its only difference
   the record-follow, which a browser cannot show apart); a later medical removed on the same sheet; a refused try lists
   nothing; the half-day and several-people cut sentences (the gate's own `inputgate.test.ts` — one sentence body).
5. **The ledger row:** added after the walk.

## The walk

The host alone, `scripts/handpass/upcut1018-walk.mjs` v1, on the built app at `f787cc156` (served on 4231, its bundle name
checked against the build's). **28 / 28 PASS**, no console error, page error or 4xx/5xx. Pictures
`docs/img/handpass/2026-10-18-upchit-sheet-leave-cut/` (18), every one cited below opened by the host.

| Step | Result | Seen |
|---|---|---|
| C0 | PASS | Warden: ATT C Mon 19 – Fri 23 Oct, the upchit Wed 21 cuts it to Mon–Tue; LL Thu 22 filed (01); a pending LL bid Fri 23 placed on the Leave War's grid by its own sheet — a second tap of LL past its "takes Warden to −2" question (D418) (02) |
| C1a–b | PASS | the window's Delete: "DELETING THIS UPCHIT WILL — ATT C Oct 19 – Oct 20 → now ends Oct 23, its days given back", then "Warden's LL on 22 Oct is cut for the ATT C — that leave goes back to the balance" and "This replaces Warden's LL bid on 23 Oct on the Leave War", each with the 3px amber edge (03) |
| C1c–f | PASS | nothing changed while it asks; Cancel leaves all three and the window open (04); a remark typed before Delete still there after Cancel (05); the Leave War after asking: Thu 22 LL, Fri 23 the bid (06) |
| C2a–c | PASS | "Delete upchit": ATT C Mon–Fri, the LL gone, the note "Warden's LL on 22 Oct is cut … · This replaces … · Input deleted" (07, 08 — the grid reads the ATT C on 22 and 23, the bid's notice "!"); one Undo puts all back (09) |
| C3 | PASS | the Delete key on the upchit's line in the opened day: the same sheet, the LL listed (10); Cancel changes nothing |
| C4 | PASS | the drag to Sat 24: "SAVING THIS UPCHIT WILL … now ends Oct 23 …", the LL and the bid listed, "Fit for full duty from Oct 24" (11); nothing moved by asking; Save: upchit Sat 24, ATT C Mon–Fri, LL gone (12); Undo back |
| C5 | PASS | the window's own Save on Sat 24: the save sheet lists the LL under the give-back (13); Cancel changes nothing |
| C6 | PASS | Piston, nothing in his days given back: the sheet as before, no cut line (14) |
| C7 | PASS | after a reload, on the phone: Warden as left — ATT C Mon–Tue, the upchit, the LL (15); the sheet on the phone at x 22–368, its cut lines whole, a finger on "Delete upchit" meets it (16) |
| C8 | PASS | Sat 18 Jul published through the board's own sign-offs and Publish; Saber ATT C Thu 16, upchit Fri 17, LL Fri 17; the sheet gives back to Jul 18 and lists the LL (17); after Cancel the published Saturday's heading reads exactly as before — "ORIG … 7 changes … Unpublish", nothing waiting (18) |

**The script's own mistakes, met and fixed before the final run** (walk-scripts §7): the bid needs a second tap past its
below-zero question (D418 — the app's rule, not a fault); the grid draws an ATT C as "C"; on a phone the month's thin bars
leave the kind out but for the first, so the LL bar reads "Warden" (read by its days and its picture, 15).

**Orders walked:** ask then Cancel then ask again then Delete; Delete then Undo; drag then Save then Undo; ask then a reload
(twice); publish, then file, then ask, then Cancel; the window, the key, the drag; a mouse and a finger.

## Errors seen

None on any page of the walk.

## What was NOT walked, and why

- The input window opened from Edit Schedule or the board — the same component; what differs off the Inputs page is that
  its own follow-the-record step does not run, so only the new flag keeps the typing: carried by `upchitcuts.test.tsx` "the
  window opened from the schedule" (the real window's Delete, Cancel and Delete in jsdom, the real rules).
- A half-day leave cut, a leave of several people, and his own bid ("your") — the same gate sentence body as the walked
  whole-day LL and another man's bid; carried by `leavewar/inputgate.test.ts` (the sentences) and the one `gateCuts` line.
- A later medical put to Remove on the drag's sheet — carried by `upchitcuts.test.tsx` "a later medical put to Keep /
  Remove" (the real drag door and the sheet's buttons).
- The Inputs list on a desktop and the Medical tab — they open the same window (walked).

## Break tests

`scripts/handpass/breaks/upcut1018.json` — **12 of 12 caught** (the gate silent; the bids unsaid; a refused try listed; the
window not found again; the window found again but reset; the delete's and the move's ask without cuts; each ask's plan
from before the try; the sheet drawing no line; the drag's and the window's sheet not handed the cuts). Three stayed green
at first — 3 (a refused try), 4 (the window not re-pointed: on the Inputs page the window's own follow step covers it) and
8 (the move's plan from before the try: its rows only label, but its leftovers are what Remove removes) — each given a test
of the case it decides (a gate that cuts then refuses; the schedule's window; a later HL removed), then caught.

## The gates

*(the whole set under the PC lock on a port checked free — written when the run ends)*

## The fresh, blind Opus read

*(written when it returns)*

## Findings and dispositions

*(written after the read)*
