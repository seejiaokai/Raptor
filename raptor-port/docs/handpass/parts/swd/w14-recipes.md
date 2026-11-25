# w14 recipes — routes proved on the build `index--V1bS7d_.js` (shared by w14a–d; read before writing a new route)

Each was proved by a script that passed on this build. Helpers: `raptor-port/scripts/handpass/swd-w14a-lib.mjs` (copy, never
edit). Proof run: `W14A_RUN=probe3 node scripts/handpass/swd-w14a-probe.mjs` (pictures `D:/raptor-work/c174-walk/w14a/probe3/`).

## From w14a (probes P0, P1, P2, P3, P4, P5, P7, P8, P14), 25 Nov 26 ~00:30

- **P0** — `npx vite preview --port 4811 --strictPort` from raptor-port/; `curl -s http://localhost:4811/ | grep -o 'index-[^"]*\.js'`
  printed `index--V1bS7d_.js`, the same as `dist/assets`.
- **P1 a cockpit seat on a day with no flying line** — Saber, Edit Schedule, the board of the day (`L.openBoard(p, W, di)`, di 5 =
  Sat 18 in week 1) → `[data-wvadd="<di>"]` → button "Flying wave" (exact) → the new wave is the last of `DAYS[di].waves`; type
  `[data-bfld="ff:<di>.<wi>.0.cs|to|ld"]` with `L.typeBox`. Press the seat's own box `#schedBoard [data-slot="<di>.<wi>.0.0.p"]`
  (no ".addz" inside a seat box — press the box itself), then the crew puck `#schedBoard .rpuck[data-person="bane"]`. Read back
  `DAYS[di].waves[wi].formations[0].aircraft[0].p === 'bane'`. A new flying line has ONE aircraft (n 1): for a second seat to arm,
  add a second line. Helper: `addLine(p, W, di, { cs, to, ld })` + `armSeat(p, W, key, tag, pick)` (swd-w14a-lib).
  Armed on a timed line with Ranger posted SANS from Fri 17, nothing filed: his puck under "SANS Avail", struck, title
  `Ranger — SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab.`
- **P7 the same with NO times** — skip `to` / `ld`: the seat arms (`ARM.key 5.0.0.0.p`) and he can be picked; the passing note
  says "the W14A line has no usable times, so nobody on it earns OIL for this day". Armed: his puck NOT struck, title "Ranger".
  His reminder names the day all the same (D2568). Times typed later: `lineTimes(p, W, di, wi, '21:00', '22:00')`.
- **P2 an OFT / AMT box** — `swd-w12-lib planSim(p, W, d, 'oft'|'amt', sid)` passed (21:00–21:45, label "W12 SIM"); an empty box
  for an armed read: `T.W5.addSim(p, W, di, kind, label, str, end)` then arm `[data-fill="s:<di>.<kind>.<ri>.+"]` at its ".addz".
- **P5 cancel / un-cancel** — a flying line: `#schedBoard [data-lcx="<di>.<wi>.<fi>.<ai>"]` → `#cxPop` opens → type a reason in its
  box → `#cxSave` ("Cancel line"); the aircraft gets `cx:true, cxr:"WX"`. Un-cancel: the same CX button → `#cxUn` ("Un-cancel").
  A sim box: `[data-srcx="<di>.<kind>.<ri>"]`, same window. Ground row `data-grcx`, duty `data-drcx`, all hands `data-pcx`.
  Helper: `cx(p, W, di, btnSel, on, tag)`.
- **P3 a duty desk on Sat 18** — the board of Sat 18 has `[data-dradd="5.0"]` "+ Row"; it adds zone `d:5.0.<n>.+`
  (`[data-fill="d:5.0.1.+"]` on the demo); arm it and pick Ranger (`L.armAndPick`). Read back: `T.holds(p,'bane')` shows
  `Jul 18: … .dutywaves[0].rows[1].id`. Armed: his puck NOT struck.
- **P4 all hands** — `L.progRow(p, W, 4, 'W14A ALLHANDS', '21:00', '21:30', 'bane')` on the open board of Fri 17 (di 4): row
  `{"prog":"W14A ALLHANDS","str":"21:00","end":"21:30","who":"bane"}`.
- **P8 SC / AVALON / BB** — the "+ Wave" menu reads: Flying wave | SC | AVALON | BB. "SC": label SC, kind sc, two formations
  (AM 07:00–13:00, PM 13:00–19:00), 4 aircraft each, seats `<di>.<wi>.<fi>.<ai>.p|w`; each aircraft has a `spare` flag (MAIN =
  not spare). "AVALON": 19:00–07:00, 4 aircraft. "BB": no times, 4 aircraft. Making a standby row fly: its `[data-safly="<key>"]`
  "FLIES" button (aria-pressed true once ticked; html.ts saFliesHTML).
- **P14 the warning list of one day** — the board's `#sbWarn`: heading `.wh` ("⚠ 2 issues · 1 warning"), rows = the children of
  `.sbwrap` other than `.wh`; on the phone tap `[data-sbwtog]` to open the fold. With Ranger seated on a timed line and NOTHING
  filed, no SANS row appears (engine/validate.ts: the SANS_AVAIL advisory fires only for 'not-offered' / 'window'; 'none' is
  deliberately silent). Helper: `warns(p, W, di, tag)`.

## From w14b (probe P6, Hex, the top bar on Quals), 25 Nov 26 ~01:35

Proof runs: `W14B_RUN=probe node scripts/handpass/swd-w14b-probe.mjs`, `W14B_RUN=probe2 node scripts/handpass/swd-w14b-probe2.mjs`
(pictures `D:/raptor-work/c174-walk/w14b/probe*/`). Helpers: `raptor-port/scripts/handpass/swd-w14b-lib.mjs`.

- **P6 — NO.** A reload of Saber's own tab opens the SIGN-IN CARD (the sign-in is not kept over a reload); signed in
  again, the top bar Undo reads "Undo", greyed, on Quals and on Edit Schedule (before the reload: "Undo — Ranger's quals",
  enabled). A second tab of the same browser also opens on the sign-in card. So Saber's Undo list cannot outlive another
  man's read in a second tab: the read-then-Undo cases (D2's read case, `0eaacc411`'s Redo after a read Undo, round 2's
  struck Redo) stay test-only.
- **Hex signs in** `hex` / `x` (badge "Hex · Member"). His demo week 1 (read): Mon 13 AMT pax, Tue 14 / Wed 15 wave 1 RCP,
  Thu 16 wave 2 RCP; nothing Fri 17 – Sun 19. Ticked SANS on Wed 15 with nothing else: his reminder "Your SANS availability
  is needed." / "You're planned on Wed 15, Thu 16 Jul with nothing filed. Tap to file for availability.", unread.
  Ranger week 1: Mon 13 all hands + wave 1 FCP + OFT; Thu 16 wave 2 FCP + a ground row; nothing Wed 15, Fri 17 – Sun 19.
- **The top bar Undo / Redo of a Quals tick**: `#undoBtn` title "Undo — Hex’s quals", note "Undid: Hex’s quals"; Redo
  "Redo — Hex’s quals", "Redid: Hex’s quals". `L.qualsTick(p, W, id)` is a toggle (one press of his SANS cell).

## From w14c (probes P11, P12, and the routes of B8 / B10 / A1–A10), 25 Nov 26 ~02:30

Proof runs: `W14C_RUN=probe node scripts/handpass/swd-w14c-probe.mjs` (desktop), `SZ=d|p W14C_RUN=probe2[p] node
scripts/handpass/swd-w14c-probe2.mjs` (pictures `D:/raptor-work/c174-walk/w14c/probe*/`). Helpers: `swd-w14c-lib.mjs`.

- **A seat emptied** (`lineOff`): the board of the day → the line's own ✕ `[data-ldel="<di>.<gi>.<fi>.<ai>"]` ("Remove this
  line"), no confirm; note "Line removed — W14B, 21:00–22:00, Ranger". Works at both sizes (the drag off a seat is desktop only).
  **A sim emptied** (`simOff`): `[data-srdel="<di>.oft.<ri>"]`, note "Sim row removed — OFT · W14C SIM, 21:00–21:45".
- **Save week 2** (`saveWk2`): a Ground Programme row "W14C WK2" 22:00–22:30 naming Casper on Wed 22 (`swd-w12-lib plan`, id
  casper). With it Ranger's demo Mon 20 waves count: his reminder then names Mon 20.
- **The posting moved to any day, from any cell** (`moveTo`): `T.movePo(p, W, id, <cell of the current date>, <to>)` — proved
  17 → 20 → 17, 17 → 18; the sheet line reads "On 20 Jul: becomes SANS.".
- **P11 — YES.** Clock Sun 19 09:00 (reload, Saber): his Fri 17 cell opens the posted-out sheet ("On 17 Jul: becomes SANS."),
  and its date box moves it to Tue 21 ("On 21 Jul: becomes SANS."), no error.
- **P12 — NO door.** The only code that moves a man's home squadron (`state/units.ts setHome`) is called from test support
  alone; Admin → Users shows no squadron / move / transfer control (only "Squadron config"). B11 stays test-only.
- **Saber's Undo after a posting move**: greyed, title "Adding, archiving or restoring a person, and a posting, aren’t undone
  here — use Restore, Delete or the posting sheet’s own Undo. A delete is final." (D350).
- **A filing run across the month's end** (`fileAcross`): Fri 31's "+ Commitment" window → its calendar's › → tap
  `[data-testid="inpEdCal-day-2026-08-01"]` → Add; window read "Jul 31 → Aug 1", record date "Jul 31", endDate "Aug 1".
  (`T.file` with `endIso` cannot: it taps only a day already drawn — it saved Fri 31 alone.)
- **Ranger's own run Sat 18 → Sun 19** (`runOf`): desktop a mouse drag on the SANS month (`swd-w13-lib drag` + `add`, note
  "Input added"); phone the day window's last day tapped. His top bar Undo: "Undo — Ranger’s SANS Availability" / note
  "Undid: …"; Redo "Redo — …" / "Redid: …".
- **A bell line tapped and read back** (`tapAndRead`): an A line opens the SANS calendar on the day its sentence names (Fri 17)
  with that day's window; the list closes; the line turns read.

## From w14d (probes P9, P10; the routes of B5, D1–D3), 25 Nov 26 ~03:10

Proof runs: `SZ=d|p W14D_RUN=probe2|probe-p node scripts/handpass/swd-w14d-probe.mjs` (pictures `D:/raptor-work/c174-walk/w14d/probe*/`).
Helpers: `raptor-port/scripts/handpass/swd-w14d-lib.mjs`.

- **P9 - YES (no fly).** Saber, SANS tab, the day (Fri 17) -> its window's "Calendar..." button `[data-testid="sd-days"]` ->
  the Calendar window `win-days` ("Calendar · admins only") -> month tab `days-tab-month`, `days-next/prev` to the month ->
  desktop: the date's NF key `[data-testid="days-nf-<iso>"]`; phone: the date's one stepping button `days-step-<iso>` pressed
  until its `data-cls` reads `nf`. Close `win-days-x`. Read back `window.flyAnswer(iso).cls === 'nf'`; the SANS day window's
  subtitle then reads "No fly", Required "NF / NF", the month's cell an "NF" tag. Helper `noFly(p, W, iso, tag)`.
- **P10 - NO edit for a member.** Ranger opening the shared Sat 18 offer Saber filed for him and Hex (from Sat 18's line,
  `X.openLine` after `M.onSans`): no Save, no Delete; its foot reads "Only Saber — who filed it — or an admin can change this
  for everyone."; the pucks fixed (both picked). So A4's member stretch is RECORDED, not refused by the words.
- **A saved filing's dates edited** (`editDates`): `M.onSans` first, then `X.openLine(iso, iid)`, `X.tapWinDate` first day then
  last, `M.add` (presses `#inpEditSave`), the record read back by its iid.
- **An input for a man, filed and changed** (`fileIn`, `editIn`, copied from wr4-lib, which launches a browser on import):
  Inputs -> Calendar -> the day by focus + Enter -> `#icPopAdd` -> Type, `#inpEditPerson`, span / Custom times, title, remark ->
  Save, then every question answered (no document, OIL yes). Change: the day's card `[data-popiid]` -> edit -> Save (or
  `#inpEditDel`). Ranger's stored lines read from `window.NOTICES` (to === 'bane').
