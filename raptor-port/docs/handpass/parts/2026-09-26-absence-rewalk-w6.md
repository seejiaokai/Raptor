# W6 — the first walk of the roll-call rows nobody reached (26 Sep 26)

Walker W6 (Opus 5.5), on the rebuilt app at `http://localhost:4175` — bundle `index-KbvILaPW.js`, checked at the start of
every script. Brief: `docs/superpowers/briefs/2026-09-26-absence-rewalk-brief.md` §W6; the promises: plan
`docs/superpowers/plans/2026-09-26-absence-retest-plan.md` §4 and §9. Rows: **R12, R17, R18, R19, R22, R27, R30, R32, R36**
(R23 not walked — the owner's question, `[INSIGHTS-WORKING-COPY]`).

**How.** One world built through the app's own controls (`scripts/handpass/ab/w6-01-build.mjs`, desktop, admin) and saved;
every walk then OPENS that saved world in a fresh browser — so every row below was read after a reload of the stored
world — at 1440 × 900 and at 390 × 844 with real touch (a finger's tap where it matters), as the admin (Saber) and as the
member (Ranger). Scripts: `w6-01-build`, `w6-02-walk [desktop|phone] [admin|member]`, `w6-03-board-palette [desktop|phone]`
(from a FRESH world), `w6-06-r18-head`, `w6-07-member-pending`, `w6-08-arrow-over-rows`, `w6-09-leave-on-duty`; probes
`w6-00*`, `w6-04`, `w6-05`. Output: `docs/handpass/parts/2026-09-26-absence-rewalk-w6-*.txt`. Pictures:
`docs/img/handpass/2026-09-26-absence/rewalk/w6/` (every picture named below was LOOKED at). To re-walk: run `w6-01-build`
first (it writes the world to the scratchpad path at the top of the scripts), then the others.

**The world** (`w6-01-build.txt`, 12/12): Friday 17 Jul given a flying line through the board's **+ Wave** (W6LINE 10:00–11:00,
Drifter / Relay — the demo Friday flies nothing, so without it the print and the CSV have no Friday); A Hunter LL Thu–Fri ·
B Rune LL mornings Thu–Fri · C Piston ATT C Thu–Fri · D Cinder CSE Fri · E Trident LL Fri, bid and APPROVED on the war;
Friday and Saturday signed and published (0 pending); **LATE on published Friday:** F = LL Fri for Drifter (the pilot on
W6LINE) → 1 pending everywhere; **LATE on published Saturday:** LL for Fable, who holds its SDO desk 08:00–18:00 → the app
took it and said *"Fable is recorded as working 08:00–18:00 on 18 Jul — this LL is filed anyway and flagged for someone to
resolve"*; **Wed 29 Jul:** six of the seven IWSOs away (five LL all day; Ledger LL morning **and** ATT C afternoon), the
seventh (Quill) given an OIL award, 1 day, through the bid sheet's +OIL.

## The roll-call rows

| row | what it must show (plan §4 / §9) | shows it? | can act on it there? | painted over? | walked | result | pictures |
|---|---|---|---|---|---|---|---|
| **R12** manning rows, the "what this row counts" sheet, the under-manned list | a man with a leave AND a medical on one day counted away ONCE; an award counts nobody (N13, N17) | **Yes.** IWSO 7 → **1** on 29 Jul, exactly −6 against 28 and 30 Jul: Ledger (LL + ATT C) counted once, Quill (FO award, his box reads FO) counted present; the cell red (below 2). Ledger's day list names both records. The row's name opens "Instructor WSOs available. Amber when … below 3 · red below 2". Under-manned chip "1 day" → "29 Jul 26 · IWSO 1" | **Yes.** Admin: the sheet carries Amber / Red boxes and Edit counter…; member: the same words, no boxes (must not — management's lines). A tap on the list's day jumps the grid to 29 Jul (outlined) — both widths, both roles | No (checked point by point: the figures, the list's rows) | desktop + phone · admin + member | **PASS** | `w6-desktop-admin-R12-01…05`, `w6-phone-admin-R12-*`, `w6-*-member-R12-03-manning-sheet`, `w6-phone-member-R12-04-undermanned-list` |
| **R17** the board's Unavailable and Personal Inputs panels | as R16; the fold; + Add | **Yes.** Friday's Unavailable (the working copy) lists Drifter (the LATE F, top), Piston ATT C, Rune 00:00–12:00, Hunter, Grit ATT C, Nomad OD, Trident (war-approved, "on 17 Jul"); the course is not there — it landed on the Ground Programme and in Personal Inputs, folded to "1 input · 1 on programme · show ⌄", opened by its header | **Yes.** A tap on the late leave's type opens its edit window (Drifter · Jul 17 — Delete / Cancel / Save); **+ Add** opens "New input" offering leave / medical / OD types only | No (pucks, types, boxes) | desktop + phone · admin; member **must not** (no Edit Schedule — his menu lists none, both widths) | **PASS** — see N4 | `w6-desktop-admin-R17-01…04`, `w6-phone-admin-R17-01…04`, `w6-*-member-R17-member-nav` |
| **R18** View-only Sched: the issued face and the working draft | the face as issued; the draft shows the late input | **Yes.** "Original — as issued": A, B, C, E, Grit, Nomad — **no Drifter**, no pending, no draft words. "Working draft — not issued": Drifter added; the head reads "Not yet signed · 1 pending · Working draft" and the bar "Viewing Working draft — not issued · the issued schedule is Original"; back to "as issued" → as it went out. Saturday's face reads "Nil" (Fable's late leave not on it) | **Yes** — the picker, member and admin alike (read only for the member) | No at the positions walked; see N1 for the week's ‹ arrow | desktop + phone · admin + member | **PASS** | `w6-*-R18-01-fri-issued-face`, `w6-*-R18-02-fri-working-draft`, `w6-*-R18-03-head-as-issued`, `w6-*-R18-04-head-working-draft` |
| **R19** the crew picker and ALL AVAIL | a man on leave or medical is not offered as free and not counted available | **Armed — yes:** with Thursday's 07:45 SODB row armed, Hunter (LL), Rune (LL morning), Piston (ATT C), Grit (ATT C), Nomad (OD) are struck, each with its reason printed. **ALL AVAIL** on that row: chip 43 = 43 men in its window, none of the five among them. **Unarmed on the desktop board — NO (F1):** the AIRCREW column reads another day | Armed: the struck men cannot be planned. **Unarmed, desktop: a man on leave that day is offered plain and can be dragged on** (F1) | No (the window sits inside the screen) | desktop + phone · admin; member n/a (no board) | **FAIL (F1, desktop only)** — phone PASS | `w6-desktop-admin-R19-01…02`, `w6-phone-admin-R19-01…02`, `w6-desktop-P1…P3`, `w6-phone-P1`, `w6-desktop-admin-R30-03-pending-list-board` |
| **R22** the schedule's CSV | the Unavailable on a published day, as issued | Friday's line **as issued**: W6LINE, Drifter / Relay (the late leave changes nothing). **The file carries no Unavailable list at all** — flying lines only (known: host H6, `[FLAG-EXPORT]` / AM50; not re-reported) | Admin: the button on Edit Schedule, both widths ("CSV downloaded"). Member **must not** — no export button (it lives on Edit Schedule; "a scheduler-only function", owner 17 Sep 26) | — | desktop + phone · admin + member | **PASS** (as issued) · known gap recorded | `w6-*-member-R22-member-no-export`; the file in the txt |
| **R27** the war's clash strip (admin only) | the clash shown to the admin, not the member | **Yes (admin):** "1 clash with the schedule · Fable: weekend/PH work earns FO but 18 Jul 26 holds LL — resolve on the sheet"; Fable's 18 Jul box LL with an amber !, its sheet: "Two of these can't both stand on the same time — an admin needs to change one", LL (Inputs page) + FO (published schedule, worked 08:00–18:00). **Member: no strip** (must not) | Not from the strip (plain text); the day's sheet names both and points to the Inputs page — see N2 | No; fits 390 px, no sideways scroll | desktop + phone · admin + member | **PASS** — see N2 | `w6-*-admin-R27-01-clash-strip`, `w6-*-R27-02-sdo-saturday-sheet`, `w6-desktop-member-R27-01-clash-strip` |
| **R30** the pending list | tap "N pending" on a published day carrying a late input: it names the input and jumps to it | **Names it — yes:** "Waiting to go out as AL1 · 1 change · Drifter · LL filed", on the week and on the board | **Jump — NO (F2):** the line is not tappable ("This change has no place of its own on the schedule to go to") though Drifter's row stands in Friday's Unavailable block. Member: on View-only's working draft "1 pending" is a label, not the list (D169's list is `[DRAFT-PENDING]`, not built — N3) | No; the list fits the screen | desktop + phone · admin; member desktop + phone | **FAIL (F2)** | `w6-desktop-admin-R30-01, 02b, 03`, `w6-phone-admin-R30-01, 02b, 03`, `w6-*-member-R30-05` |
| **R32** the OIL question sheet | the question asked before anything is written; Cancel / Escape write nothing; Save; phone fit | **Yes** — a Duty input on Sun 19 Jul: "OIL — Ghost, Duty · This input falls on a non-working day — 19 Jul · Does it deserve FO — a full day of OIL? Yes — credit FO / No OIL"; Save off until answered; Cancel → nothing written; Escape → nothing written; Yes + Save → ONE input carrying its answer. **The brief's case — a LEAVE over a named weekend duty:** no OIL question (a leave asks none); it is filed and SAYS so in amber, still up three seconds later (N4, N18) — Saturday (Fable) and Sunday (Dash) | **Yes** — admin for another man, member for himself | No — sheet and every button inside 390 × 844 and 1440 × 900, none covered | desktop + phone · admin + member | **PASS** | `w6-*-R32-01-oil-sheet`, `w6-*-R32-02-oil-sheet-answered`, `w6-*-admin-R32-03-leave-over-sunday-duty-note` |
| **R36** print | the printed schedule of a published day carrying a late input — as issued | **Yes:** Friday "PUBLISHED — ORIGINAL", W6LINE Drifter / Relay as issued; Mon–Thu "WORKING DRAFT — NOT YET SIGNED". No Unavailable anywhere (flying lines only — the same known gap as R22); Saturday not printed (no flying line) | Admin: the button on Edit Schedule ("Print dialog opened"). Member **must not** (no button) | — | desktop + phone · admin + member | **PASS** (as issued) · known gap recorded | `w6-desktop-admin-R36-01-print-page`, `w6-phone-admin-R36-01-print-page` |

**Tally:** 9 rows walked — **7 PASS, 2 FAIL** (R19, R30). Checks: build 12/0; walk desktop-admin 46/3, phone-admin 46/2,
desktop-member 30/0, phone-member 30/0; palette desktop 2/2, phone 4/0; R18 heads 4/0; leave-on-duty 4/0; arrow 1/1 (N1).
Console errors: **none**, in every run.

## The FAILs

### F1 (R19) — the desktop scheduler board's crew column reads ANOTHER day, so a man on leave that day is offered as free
- **Steps, from a fresh world** (`w6-03-board-palette.mjs desktop`): sign in `ad`/`a` at 1440 × 900 · Inputs page: LL on
  Thu 16 Jul, all day, for a pilot with nothing that week (Vandal) · Edit Schedule, the week at its start · open Thursday's
  board from the week · look at the AIRCREW column, nothing armed.
- **Seen:** "PILOTS · 18 FREE" with **Vandal plain, not struck**; Blade and Basher — flying Thursday's VL line on the same
  screen — listed free; men tasked on WEDNESDAY greyed. The column prints no day name. A drag of Vandal onto Thursday's
  SODB row **lands him**; only then the warning and a toast say "Vandal — On leave but tasked — SODB". The same after
  the week was scrolled to Friday first. On Friday's board of the walk world, Drifter and Trident (both on leave Friday)
  are offered free while the warning list beside them says "Drifter — On leave but planned to fly W6LINE".
- **Control:** armed (tap a slot first) the column is pinned to the board's day and correct; on a PHONE the column is
  correct (Vandal struck, "local leave (LL) — W6 palette leave Thu").
- **Why, for the host:** `ui/SchedBoard.tsx` draws the column as `paletteHTML(paletteDay(), { head: false })`;
  `paletteDay()` is ROSDAY — the EDIT WEEK's left-most day in view (`pan.ts` rosDayFollow) — not the board's day, and
  `head: false` drops the day name that would give it away. Not changed on this branch (identical on `main`).
- **Rule:** plan R19 ("a man on leave or medical is not offered as free"); the 13 Aug 26 rule the palette's own comment
  quotes — the scheduler sees the problem BEFORE he plants, never by planting.
- **Who it hurts:** a scheduler building a day on the desktop board picks from a list that is another day's — men on
  leave that day look free, men flying that day look free, men free that day look busy. The leave is caught only after
  the drop, by the warning.
- **Pictures:** `w6-desktop-P1-thu-board-palette.png`, `w6-desktop-P2-after-drag.png`,
  `w6-desktop-P3-thu-board-after-week-at-fri.png`, `w6-desktop-admin-R30-03-pending-list-board.png` (Friday);
  control `w6-phone-P1-thu-board-palette.png`, `w6-desktop-admin-R19-01-palette-armed-sodb.png`.

### F2 (R30) — the pending list names a late input but cannot take the view to it
- **Steps, from a fresh world:** sign in as the admin · board for Friday 17 Jul: sign the four, Publish day · Inputs page:
  LL on Fri 17 Jul for any man · Edit Schedule: Friday reads "1 pending" · tap it · tap its line.
- **Seen:** "Waiting to go out as AL1 · 1 change · Drifter · LL filed" — the line is not a button; its hover says "This
  change has no place of its own on the schedule to go to"; a tap does nothing. Yet the late leave's row stands in
  Friday's Unavailable block on the week and on the board (with its LATE mark, its edit door). The same on the board, at
  390 px by finger, and at 1440.
- **Rule:** D99 (*"if they click on that area, it brings the view to that pending area"*), D100 (the approved mock-up:
  a tap on an item takes the view to it). **The code says it on purpose:** `ui/pendlist.ts inputWords` — "a leave with no
  row stays still" — and `docs/engine-rules.md` ("a leave with no row stays a still line", Fable's F4 fix). That is the
  builder's reading, not an owner ruling; the Unavailable block does draw the leave as a row on the working copy, so
  whether that row is "its place" is the question (the host's to put, or to fix). Not changed on this branch (identical
  on `main`).
- **Who it hurts:** the scheduler reads WHAT is pending but must hunt for WHERE — the hunt D99 exists to end; on a busy
  day the Unavailable block is a long scroll below the flying.
- **Pictures:** `w6-desktop-admin-R30-01-pending-list-week.png`, `w6-desktop-admin-R30-02b-the-row-it-could-go-to.png`,
  `w6-desktop-admin-R30-03-pending-list-board.png`, `w6-phone-admin-R30-01-pending-list-week.png`,
  `w6-phone-admin-R30-02b-the-row-it-could-go-to.png`.

## Anything else seen (new evidence, not judged as defects of these rows)

- **N1 — the week's ‹ arrow sits over the front day's first column (desktop).** With published Friday brought to the
  front of Edit Schedule by the week's own › arrow, the type words of three Unavailable rows (LL, LL, ATT C) are under
  the semi-transparent ‹ (`w6-08-arrow-over-rows.mjs`); on View-only Sched the same happens when a day sits flush left
  (the arrow also over Thursday's line times). The rows' own controls stay reachable at their centres. General layout,
  not absence-specific; low. `w6-desktop-admin-R18-05-arrow-editsched.png`, `w6-build-02-fri-face-as-published.png`,
  `w6-desktop-member-R30-05-member-working-draft-pending.png`.
- **N2 — the clash strip says "resolve on the sheet"; the sheet has nothing to resolve with.** The strip's line is plain
  text (no tap to the day), and the day's sheet offers no control: "Change it on the Inputs page" for the leave, "From
  the published schedule" for the credit. The admin finds Fable's 18 Jul himself. Wording / a missing door; low.
  `w6-desktop-admin-R27-01-clash-strip.png`, `w6-desktop-admin-R27-02-sdo-saturday-sheet.png`.
- **N3 — a member's "1 pending" on View-only's working draft** is a label whose hover says "…ahead of the issued schedule
  until you publish an AL" — to a member who cannot publish. D169's member list is `[DRAFT-PENDING]` (decided, not
  built) — recorded. `w6-desktop-member-R30-05-member-working-draft-pending.png`, `w6-phone-member-R30-05-…`.
- **N4 — the late row carries no pending mark of its own.** On the board and the week it wears LATE (the filing-deadline
  mark), not a waiting-AL mark; only the day's "1 pending" says it is the change — and with F2 nothing points at it.
  `w6-desktop-admin-R17-01-board-fri-unavailable.png`.
- **N5 — a six-letter callsign reads "…" on View-only Sched.** W6LINE shows as "●…" in the CS / MSN column at 1440 and at
  390 px (the two-letter demo callsigns fit). General, low. `w6-phone-member-R18-03-head-as-issued.png`,
  `w6-desktop-member-R30-05-member-working-draft-pending.png`.
- **N6 — the war's "VIEWING AS …" chip is cut at the right edge at 390 px** (no sideways scroll). Chrome, low; not these
  rows. `w6-phone-member-R12-04-undermanned-list.png`, `w6-phone-admin-R27-01-clash-strip.png`.
- **Driver notes (not the app):** the driver's mouse `put()` misses the phone board's drawer (a finger places ALL AVAIL
  at once — `w6-04-phone-allavail-probe.mjs`); the export buttons keep a size while Edit Schedule is hidden behind
  View-only Sched, so a size check calls them visible for a member (`w6-05-export-probe.mjs`) — the walk checks real
  visibility.

## Not walked, and why
- R12's "a posted-out man never counted" — W4's ground (not in the W6 brief).
- R19 for the member — no board or crew column; no ALL AVAIL was placed in the saved world for him to open.
- Undo / redo after each gesture — not in the W6 brief (D148 is the next re-test's); every read WAS after a reload.
- R23 — the owner's question (`[INSIGHTS-WORKING-COPY]`).
