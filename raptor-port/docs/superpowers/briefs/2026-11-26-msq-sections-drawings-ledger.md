# The drawings ledger for the four section mock-up pages (D2656, D2657) — a fresh Opus helper's report, 26 Nov 26

Brief: `2026-11-26-msq-sections-drawings-ledger-brief.md`. Read-only on `claude/msq-b1-screens-135` in
`C:/Users/User/projects/Raptor-msq`; nothing else written, nothing committed. Rulings read whole: D2590–D2603,
D2620–D2657 (and D2318, D2403, D2580–D2595 for the guard's first drawings). The plan read by section (§10, §17's
pointers, §18, §19, §20's owed list) while another helper was editing it — line numbers may have moved.

## How to read the tables

- **Rounds** (where he saw a picture): **R2** = the guard rail page `docs/mock/2026-11-24-msq-pick-guard/page.html`
  (version 3, 24 Nov; answered D2590–D2595). **R4** = `…-25-msq-pick-guard-q2/page.html` (version 4, 25 Nov; group A
  answered D2627, group C D2628 — group C had only "Today" pictures). **R5** = `…-25-msq-pick-guard-q3/page.html`
  (round 5, group D drawings), answered on round 6's page as group D → **D2655**. **R6** = `…-q3/page-r6.html`
  (version 11, sources `scripts/handpass/n188/page/`): N1–N11, N13 → **D2652**; N12 → **D2653**; group E → **D2654**;
  group D → **D2655**. **B1** = `…-22-msq-b1-screens/page.html` (D2318's question drawing f2d, 22 Nov).
- **Paths:** `Q3/` = `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/`; `Q2/` = `…-q2/drawn/` (and
  `Q2p/` = `…-q2/page/`); `PG/` = `…-24-msq-pick-guard/drawn/`; `B1/` = `…-22-msq-b1-screens/img/`. Every picture
  has a `-crop` twin; names below are without it. Scripts: `H/` = `raptor-port/scripts/handpass/`.
- **Approved** = a picture he was shown and answered (his "as recommended / as drawn" counted only where the ruling
  names that item). **OWED** gives why. "No drawing" = the state adds nothing a person sees (D1625 asks a drawing
  only of what is new to see) — said why.
- Pictures **opened** by me (crops): PG p1b-d, p3-p; Q2 d3c-d; Q2p approved-p5; Q3 e1b-d-form, j6-d-A-149,
  e4b-d-opened-r, u6-d-edit, e4b2-d-opened, e4c-d-note, e9-d-greyed, e9-p-greyed, e10-d-person, e3d-d-both,
  e3d-p-both, e3g-d-display, e7-d-numbers, e6b-d-archived-many, e6c-d-bell, p6-d-C-war-overseas, e8-p-menu-r,
  e2-d-2-mid-dim, m6-p-fade-55. The rest are taken from the drawers' FACT lines and the page's captions, each named.
  **Also checked in the built page:** `p6-d-C-war`, `p6-d-C-postin` and `p6-{d,p}-C-war-overseas` are **not on
  round 6's page** (`grep` of `page-r6.html`): drawn, never shown.

---

## 1. Core — the guard rail (Build 1 parts A, B, F, G)

| # | State | Approved drawing (path · round · ruling) | OWED (why) | New? | D / P |
|---|---|---|---|---|---|
| 1.1 | A pick refused: grey "Blocked: close the open window, then pick 149." under the squadron picker; the list closed | `PG/p1b-d-after` · R2 · D2590; the list-press version `Q2p/approved-p1b` · R4 · D2627 A12 | — | yes | D ✓ · P ✓ `PG/p3-p-after` (picked from ☰, note at the foot, menu closed) · R2 · D2590, and `Q2/d3a-p-note` · R4 · D2627 A16 |
| 1.2 | The member-view switch refused: the note under the badge | `PG/p2b-d-after` · R2 · D2590 | — | yes | D ✓ · P: the same foot note as 1.1's phone, only the ending's words differ (D2590's place rule; D2627 A14) — no second picture needed |
| 1.3 | A bell line refused: the note under the list, the list open, the line unread | `PG/p4b-d-after` · R2 · D2590; `Q2p/approved-p4b` · R4 · D2627 A11 | **Phone never drawn** — on a phone the bell list covers most of the screen and stays open (A11), so where the foot note stands against it is not shown. Start `PG/p4b-d-after` + `PG/p3-p-after`, script `H/n166/draw-beside.mjs` | yes | D ✓ · P OWED |
| 1.4 | A tap on a lit bell refused: "…then press the bell again.", the bell stays lit | `Q2/d3c-d-note` · R4 · D2627 A8 | **Phone never drawn** (the lit bell's tap on a phone, the note at the foot). Start `Q2/d3c-d-note`, `H/n175/draw-notes.mjs` | yes | D ✓ · P OWED |
| 1.5 | An opened row with a change refuses: "Blocked: save or cancel the open row, then pick 149." | `Q2/d3a-d-note`, `Q2/d3a-p-note` · R4 · D2627 A6 | — | yes | D ✓ · P ✓ |
| 1.6 | A window open on a page out of sight: "…close the open window on the Leave War, then pick 149." | `Q2/d3e-d-note` · R4 · D2627 A7 | — | yes | D ✓ · P: the 1.1 foot note, words only (D2590, A14) |
| 1.7 | Two reasons at once: the window named first | `Q2p/d3d-d.png` · R4 · D2627 A10 | — | yes | D ✓ · P as 1.6 |
| 1.8 | A change not saved: "Blocked: press Retry to save your changes, then pick 149." under the band | `Q2p/d3b-d.png`, `Q2/d3b-p-note` · R4 · D2627 A13 | — | yes | D ✓ · P ✓ (two lines at the foot) |
| 1.9 | Tablet upright / phone on its side: the note under the control | `Q2/d5a-t-note`, `Q2/d5a-ps-note` · R4 · D2627 A14 | — | yes | the in-between sizes ✓ |
| 1.10 | Phone with Inputs settings or the Calendar open: the note at the foot | `Q2/d5c-p-note` · R4 · D2627 A15 | — | yes | P only (on a desktop it is 1.1) ✓ |
| 1.11 | The ☰ menu closes after a refused pick | `Q2/d3a-p-note` · R4 · D2627 A16 | — | yes | P only (the menu is a phone's) ✓ |
| 1.12 | A pick waits for a save in flight, then goes or is refused (A9) | — | No drawing: nothing new on screen while it waits; a refusal is 1.8's note | — | — |
| 1.13 | "+ Add a person" in the top row (search · Filter · + Add a person); on a phone under the four jumps | `Q3/j6-d-A-149`, `Q3/j6-d-A-142`, `Q3/j6-p-149`, `Q3/j6-p-142` · R6 · D2652 N13 i (the round-5 place beside Filter on the People row, `Q3/e1a-{d,p}-button` · D2655 D1, is superseded) | — | yes | D ✓ · P ✓ |
| 1.14 | The Add a person form opened, "Add person" · "Cancel" at its foot | `Q3/e1b-d-form`, `Q3/e1b-p-form` · R5/R6 · D2655 D1, D2652 N11 (the button pair) — **drawn under the People row** | **OWED redraw: D2652 N13 i moved it to the top row, the form opening under it above "Waiting for access"** — named in D2652's own "owed before the build". The redraw also waits on **NQ2** (the "Home squadron" box, drawn in e1b; its recommendation drops it on another squadron's page). Start `Q3/e1b-d-form` + `Q3/j6-d-A-149`; scripts `H/n176/draw-r5b-e1.mjs`, `H/n176/draw-r6-nav.mjs` | yes | D OWED · P OWED |
| 1.15 | After Cancel: the form shut and empty | `Q3/e1c-d-after-cancel` · R5 · D2655 D1; in the new layout it is simply `Q3/j6-d-A-149` / `j6-p-149` | — | yes | D ✓ · P ✓ |
| 1.16 | Something typed in Add a person, then a pick: "Blocked: add or cancel the new person, then pick 149." | `Q3/e1d-d-note`, `Q3/e1d-p-note` · R5/R6 · D2655 D1, D2652 N11 | — (note: the plan's §4.6 still calls these words "not his yet"; D2655 D1 approved the drawing that carries them — the plan's row is stale) | yes | D ✓ · P ✓ |
| 1.17 | The squadron number's two fades; less motion: white a second | `Q3/e2-d.mp4`, `Q3/e2-d-rm.mp4` (stills `e2-d-1…3`) · R5 · D2655 D2; phone `Q3/m6-p-fade-film.mp4`, `Q3/m6-p-fade-lm-film.mp4` · R6 · D2652 N8 (supersedes `e2-p*`, drawn before D2642) | — | yes | D ✓ · P ✓ |
| 1.18 | The fade waits where something else covers the number — a phone's bell list (D2652 N8 a) | approved as a reading on R6, **"Not drawn"** on the page itself | **OWED (minor): a phone film of a bell line that changes squadron, the fade after the list closes.** Start `H/n176/draw-r6-misc-fade.mjs` | yes | P OWED (desktop: nothing covers it) |
| 1.19 | The "Welcome back" card only on his own squadron | — | No drawing: the card is simply not drawn elsewhere | — | — |
| 1.20 | "+ Input" on another squadron: the Person box empty, only that squadron's men | `Q3/e10-d-person` · R5 · D2655 D12 (drawn as a plain list; the build keeps the browser's own, D2646) | **OWED (two small parts): (a) the closed, empty Person box and what its empty line says** (e10 draws a blank first line; N10 a's "— name —" fell with N10, D2646); **(b) what "Add" says with nobody picked — not drafted** (round 6's page: "words still to draft and draw"; plan §18.6 `[WNS]`). The open list on his iPhone is the phone's own wheel, which cannot be pictured from here — his own picture of 26 Nov stands (D2646). Start `Q3/e10t-d-today`, `H/n176/draw-e10.mjs` | yes | D ✓ (list) / OWED (a, b) · P: the list as his phone shows it (his picture); (a, b) OWED |
| 1.21 | "+ Commitment" greyed on a squadron with no SANS aircrew, "150 has no SANS aircrew." as words under it | `Q3/e9-d-greyed`, `Q3/e9-p-greyed` · R5 · D2655 D11 — **opened: both already redrawn with the words under the button** (round 6's caption still says "a label on mouse rest … redrawn" — a stale caption, not a stale picture) | — | yes | D ✓ · P ✓ |
| 1.22 | A drag across days on that calendar: "says that reason and opens nothing" (§18.7) | — | **OWED: how the drag says it (a passing note? where?) never drawn** | yes | D OWED · P (a drag on a phone — the builder to say whether it exists) |
| 1.23 | Unsaved chart edits asked about at the member-view switch: "…Save them before switching to the member view?" Stay · Discard them · Save them | `Q2p/approved-p5` (= `PG/p5-d-after`) · R2/R4 · D2627 A20 | **Phone with these words never drawn** — the switch is pressed inside the ☰ menu (the menu closing first is the plan's reading of D2637). Start `B1/f2d-p.png`; script `H/n166/draw-trk.mjs` | no (the D2318 card) | D ✓ · P OWED (minor) |
| 1.24 | A pick of a squadron he only views asks the same (D2637) | `B1/f2d-d.png`, `B1/f2d-p.png` · B1 · D2318 (D2637 names this drawing) | — | no | D ✓ · P ✓ |
| 1.25 | Logic's and Quals' edit mode ends at a pick; Quals' "Done" gone in the member view | — | No drawing: the page opens as it always does | — | — |
| 1.26 | Windows that close by themselves: ALL AVAIL, Changes, Insights, a SANS day, the Leave War's day panel, a Tracker event's details; the marking window (E2); the chart editor at the switch, nothing moved (E3); the Info panel's Down days and Failures (E4); the Calendar with nothing pending and an unchanged settings window beside it (E1) | — | No drawing: they close, nothing new is seen (D2596, D2597, D2654) | — | — |
| 1.27 | **The Calendar refuses while a form is half done (E1):** "…save or cancel the new holiday / the changed holiday / “Every Monday” / add or cancel the sheet's holidays / cancel the new holiday, or add its leave period, then pick 149."; a changed settings window: "…save or cancel Inputs calendar settings, then pick 149." | none — R6's E1 says "None of these notes is drawn yet; each is drawn on the real app before it is built"; D2654 E1 repeats it | **OWED, all of it, desktop and phone** — and on a phone the settings window lies under the Calendar, so its note names a window he cannot see (words gap 1a, unsettled). Start `Q3/../today/k1-d-8-typed-before-pick149` (the pressed Calendar), scripts `H/n176/k1-calendar.mjs` + `H/n175/draw-notes.mjs` | yes | D OWED · P OWED |
| 1.28 | The Info panel's two lull pop-ups (E4): pressed first; if one can hold a choice, it refuses with "…close the open window on the Tracker's Info tab, then pick 149." | none | **OWED, conditional** — pressed before the build; drawn only if one refuses. Start `Q3/../today/k6-d-*`, `H/n176/k6-trkhidden.mjs` | maybe | D · P OWED if it refuses |
| 1.29 | Undo of "+ New squadron" refused with a window open: "Blocked: close the open window, then press Undo again." under Undo, at the foot on a phone (E7, step 6b) | none — D2654 E7 "(a draft) … drawn before the build" | **OWED, desktop and phone.** Start `Q2/../today/p4-undoc-d-1-on150-before-undo` and `Q2/d6a-d-undo`, script `H/n175/draw-place.mjs` | yes | D OWED · P OWED |
| 1.30 | Words in Quals' "Add qualification" box refuse a pick: "…add or clear the new qualification, then pick 149." (§3.2 (i), §18.1) | none | **OWED: the reading itself was never put to him** (the fold report: "new readings for him, on no page yet", §17 item 17) — a question with its drawing | yes | D · P OWED |
| 1.31 | A row open on another Admin section, then the badge: "…save or cancel the new squadron on Squadrons, then switch to the member view." (E9 n) | approved as a reading, D2654 E9 n — the same note look as 1.5 | No new picture needed (1.5's note); **its words "on Squadrons" are a draft** — see the words list | yes | as 1.5 |
| 1.32 | Part F: another squadron's Inputs page no longer lists his own inputs; the Input window held by its own squadron | — | No drawing: rows leave a list; the held window's look is today's | — | — |
| 1.33 | E5: a held input window given back at a pick | — | No drawing: as today (D2654 E5) | — | — |

Not in this section: the refresh card (D2591, `PG/p6-*`, `p7-*`, `p8-*`) and Logout's questions are Build 2 / group B
(D2636).

**Count — section 1:** of the 27 states that put something new on screen, **16 approved whole** (1.1, 1.2, 1.5–1.11,
1.13, 1.15–1.17, 1.21, 1.24, 1.31's look) and **11 owed in whole or part** (1.3 P, 1.4 P, 1.14, 1.18, 1.20 (a)(b),
1.22, 1.23 P, 1.27, 1.28 (conditional), 1.29, 1.30). 6 more need no drawing (1.12, 1.19, 1.25, 1.26, 1.32, 1.33).

**Words not yet read by a fresh Fable (D2441) — section 1:**
- The Calendar's five notes (1.27) — the page's own drafts, read by no second Fable (plan §4.6); the quote marks
  inside a grey note would be a first.
- "save or cancel SANS calendar settings" — the second words review's gap 1b, read by no one (the Inputs twin was kept
  by that review).
- "close the open window on the Tracker’s Info tab" (1.28) — the reviser's draft, read by no one.
- "add or clear the new qualification" (1.30) — the third read's fold, read by no one.
- The Undo ending's leads "cancel the open row / the new person / giving access / the new squadron" (1.29 joined to a
  row or form) — the fold's drafts, read by no one (`2026-11-25-msq-read3-fold-report.md` §7). The ending "press Undo
  again." itself was kept by the r5b review.
- "…on Squadrons" (1.31, E9 n) — a draft; I found no review that names it.
- What "Add" says with nobody in the Person box, and the empty Person line (1.20) — not even drafted.

---

## 2. Admin → Users across squadrons (§19.1–19.4; D2625, D2626, D2643, D2647, D2650–D2655)

| # | State | Approved drawing | OWED (why) | New? | D / P |
|---|---|---|---|---|---|
| 2.1 | The page in his order: one search at the top with Filter and "+ Add a person"; Waiting for access; People; Outgoing; Incoming; From other squadrons; the other squadrons folded at the foot | `Q3/j6-d-A-149`, `j6-d-A-142`, `j6-p-149`, `j6-p-142` · R6 · D2652 N13 (supersedes the round-6 order of `u6-{d,p}-users` and round 5's `e4a-*`) | — | yes | D ✓ · P ✓ |
| 2.2 | The jumps: under "Users" in Admin's left column (desktop), four jump buttons under the search (phone) | the same pictures · R6 · D2652 (way A) | **OWED (minor): the left column with the new "Display" card as well** — the served app had no Display card, so `j6` shows four cards; `e3g-d-display` shows Display but no jumps. One picture of both, with section 3 | yes | D OWED (the combined column) · P ✓ |
| 2.3 | A jump pressed: the page runs to the heading, which stands white about a second | stills `Q3/j6-d-A-jump`, `Q3/j6-p-jump` · R6 · D2652 N13 b | **OWED: the film** — named in D2652's "owed before the build" | yes (a new mark, ruled) | D, P: film OWED |
| 2.4 | Scrolled halfway: the lit jump follows | `Q3/j6-d-A-mid`, `Q3/j6-p-mid` · R6 · D2652 | — | yes | D ✓ · P ✓ |
| 2.5 | A heading folded, its count kept | `Q3/j6-d-A-fold`, `Q3/j6-p-fold` · R6 · D2652 N13 h | — | yes | D ✓ · P ✓ |
| 2.6 | Searching "Bol": groups with no match hide, their jumps grey; whole counts kept | `Q3/j6-d-A-search`, `Q3/j6-p-search` · R6 · D2652 N13 d, j | **OWED redraw: drawn with Bolt twice** (under "View only" and under "142 · 60 people", the FACT line says so); D2652 N13 d rules him **once, under "From other squadrons"** | yes | D OWED · P OWED |
| 2.7 | "Nobody matches." | none | **OWED — never drawn** (named in D2652's owed list) | yes | D · P OWED |
| 2.8 | An empty "From other squadrons": "Nobody from another squadron plans or views 142." | only in the old order (`Q3/u6-d-postout`, `u6-d-both-pages-142`) | **OWED in the new order** — named in D2652's owed list ("the empty block") | yes | D · P OWED |
| 2.9 | An empty Incoming or Outgoing: hidden, with its jump | none (D2652 N13 e approved as a reading) | **OWED — never drawn** (the nav report §9) | yes | D · P OWED |
| 2.10 | "Waiting for access" with people in it (no jump) | none | **OWED — never drawn** (nav report §9) | no (today's list) in a new place among the jumps | D · P OWED |
| 2.11 | A 375-px phone, and a two-figure count ("Outgoing 12") | none | **OWED — needs a rule first** (the four jumps are at their limit at his width; D2652's owed list) | yes | P OWED |
| 2.12 | "From other squadrons": Plan holders named ("Hunter 142 — Pilot · CAT IP · admin · also plans 149"), a master admin ("master admin, full access"), "▸ View only · 2 people" folded | `Q3/j6-d-A-149` (new order), `Q3/u6-p-users` (phone, old order — the rows themselves unchanged) · R6 · D2652 N3 b–e | — | yes | D ✓ · P ✓ |
| 2.13 | "View only" opened | none | **OWED — never drawn** (users-draw report; HANDOFF chat 188) | yes | D · P OWED |
| 2.14 | A row of the block opened, to end someone's View or Plan | none | **OWED (minor) — never drawn**; it should be 2.16's opened row inside the block | yes | D · P OWED |
| 2.15 | A folded squadron opened: short rows, no grey number, role in words ("admin") | `Q3/u6-d-folded`, `Q3/u6-p-folded` · R6 · D2652 N4, N3 e | — | yes | D ✓ · P ✓ |
| 2.16 | A short row opened: the one access line with Save and Cancel; "Edit on 142 →" for one who is 142's admin | member row with the link: `Q3/u6-d-edit`, `Q3/u6-p-edit` · R6 · D2652 N5, D2654 E8 (opened: no grey numbers) | **OWED redraw — an admin's row opened by one who is not 142's admin (Kestrel, no link):** `Q3/e4b-{d,p}-opened-r` · R5 · D2655 D5 — opened: every row still wears the grey "142" and Blade's row lacks "admin", both changed later by D2652 N4 and N3 e. Start `Q3/u6-d-edit`, `H/n176/draw-r6-users.mjs` | yes | D OWED · P OWED |
| 2.17 | A short row opened, no sign-in: "No sign-in. Ask 142's admin to give him one first." and Cancel | `Q3/e4b2-{d,p}-opened` · R5 · D2655 D5 | **OWED redraw (small): drawn with the grey "142" on every row** (opened), against D2652 N4. Same start and script as 2.16 | yes | D OWED · P OWED |
| 2.18 | Plan greyed for one who may not give it, the reason as words under the line: "Only 149's own admins or a master admin can give or end Plan of 149." | `Q3/e4c-d-note` · R5 · D2655 D6 — opened: already on an admin's row (Blade) | **Phone never drawn**; the desktop's rows still wear the grey "142" (D2652 N4 — redraw with 2.16). Script `H/n176/draw-r5b-users.mjs` | yes | D ✓ (redraw with 2.16) · P OWED |
| 2.19 | The roles table's note 5: "Only a master admin makes squadrons or master admins. Plan of a squadron is given by its own admins or a master admin." | `Q3/e4d-d-roles` · R5 · D2655 D6 | **Phone never drawn (minor).** Script `H/n176/draw-e4.mjs` | yes (words) | D ✓ · P OWED |
| 2.20 | "Edit on 142 →" pressed: 142 picked, his full row opened there | `Q3/e8j2-d-after` · R5/R6 · D2652 N5 | — (the landing is today's full row; phone not needed — the page he lands on is today's) | no | D ✓ · P not needed |
| 2.21 | The "All squadrons" tick gone; a master admin's own squadron open, the rest folded | `Q3/e5-d-primary-top`, `e5-d-primary-open` · R5 · D2655 D7, D2654 E8 — **drawn in round 5's order** | **OWED (minor): a master admin's page in the new order** (named in round 6's N13 "not drawn": "a master admin's view"). The Filter panel without the squadron ticks is a removal — no drawing | no | D OWED · P OWED |
| 2.22 | Incoming / Outgoing rows: "posting out 4 Jan · to 150" on the app's amber tag (also on his own row), "posting in 14 Dec" | `Q3/j6-*`, `Q3/u6-{d,p}-users` · R6 · D2652 N3 f | — | yes | D ✓ · P ✓ |
| 2.23 | Outgoing holding a posting overseas, to SANS or to Delete; a restored man with a post-in date under Incoming (N3 g) | none — "Not drawn" on R6 itself | **OWED.** These are the only Incoming / Outgoing rows Build 1V can show before the Transfer step | yes | D · P OWED |
| 2.24 | Another squadron's archived callsign: the note (seat, CAT, date), "If this is him, ask 142's admin", "Someone new"; "Add person" greyed with "Answer “Is this him?” first." | `Q3/e6a-{d,p}-archived-r` · R5 · D2655 D8 (redrawn with the app's button pair, D2644) | — | yes | D ✓ · P ✓ |
| 2.25 | After "Someone new": "A new Jester. 142's admins are told when you add him." | `Q3/e6a2-{d,p}-after` · R5 · D2655 D8 | — | yes | D ✓ · P ✓ |
| 2.26 | Archived holders on several squadrons, a line each | `Q3/e6b-d-archived-many` (opened: already redrawn to seat, CAT, date), `Q3/e6b2-d-after` · R5 · D2655 D8 | **Phone never drawn.** Script `H/n176/draw-r5b-form.mjs` | yes | D ✓ · P OWED |
| 2.27 | The old squadron's bell line: "149 added a new Jester. Delete yours if he has left flying for good · Kestrel"; its tap lands on the archived row, its fold open, ringed | `Q3/e6c-d-bell` · R5 · D2655 D8 — opened: **grey number and plain Show buttons** | **OWED redraw in squadron colours** (D2638 came after); **phone never drawn; the tap's landing never drawn** (plan §19.4). Start `Q3/e6c-d-bell` + `Q3/e3d-d-both`, scripts `H/n176/draw-e6.mjs`, `draw-r5b-both.mjs` | yes | D OWED · P OWED |
| 2.28 | A live callsign: "Ranger is already taken on 142" under the callsign box | `Q3/e6d-d-taken-r` · R5 · D2655 D8 | **Phone never drawn (minor).** Script `H/n176/draw-r5b-form.mjs` | yes (words, place) | D ✓ · P OWED |
| 2.29 | The Give access form's twin: "…142's admins are told when you approve him." | none | **OWED — never drawn**, words read by no second Fable (§20's owed list) | yes | D · P OWED |
| 2.30 | An admin of both squadrons (Saber; Hunter on 149) meets another squadron's archived callsign (V-Q2) | none | **OWED — never drawn and never asked** (R5 D8: "Not drawn yet … drawn before it is built") | yes | D · P OWED |
| 2.31 | A restore refused for a taken callsign names the squadron: "Ace is already taken on 149" (E9 k) | approved as a reading, D2654 E9 k — today's refusal place | No new picture (today's note); **words** — see the list | words | — |
| 2.32 | The Plan-given line to 149's admin audience, his name wearing his home number: "149 · Hunter 142 · Given Plan of 149 · Kestrel" | `Q3/e3d-d-both`, `Q3/e3d-p-both` top line · R6 · D2652 N1, D2654 E6 (opened: in colour) | — | yes | D ✓ · P ✓ |
| 2.33 | The Plan-ended line "Plan of 149 ended · Kestrel"; the app's own endings "Plan of 149 ended: he moved to 150", "…: made a member" (E9 l) | `Q3/e3b-d-bell`, `e3b2-d-bell`, `e3b3-{d,p}-bell` · R5 · D2654 E6 — **grey numbers** | **OWED: the ended line in colour (D2638 came after); the two app-made endings never drawn** (E9 l: "Drafts, drawn before they are built"). Script `H/n176/draw-r5b-bell.mjs` | yes | D OWED · P OWED |
| 2.34 | A tap on a Plan line opens that squadron's Admin → Users at the man's row, ringed | none — the plan's default, "drawn for him with the lines" (§19.2) | **OWED — never drawn** | yes | D · P OWED |
| 2.35 | A re-link refused: "This sign-in holds a right in 149. Only 149's own admins or a master admin can link it to another person." | none | No new look (today's refusal); **words owed** — see the list | words | — |
| 2.36 | A foreign row's Save after the man's home changed under it: "This changed while it was open — open it again." | none | **OWED — never drawn**, words read by no second Fable | yes | D · P OWED |
| 2.37 | A Plan holder looking at the squadron he plans (Hunter on 149: himself in "From other squadrons") | none | **OWED (minor) — never drawn** (nav report §9) | yes | D · P OWED |
| 2.38 | A heading folded over a changed row: the row closes as Cancel does (E9 h) | — | No drawing: nothing new is seen | — | — |

Riding the Transfer step ([XFER]), **not in these four sections** though drawn on Admin → Users: "Post out…" on the
row and its form (`Q3/u6-d-postout`; the form `Q3/p6-{d,p}-C-users` — D2653 c; the sheet `Q3/u6-d-postout-sheet` is
superseded by it), "Undo post out" in the opened Outgoing row (`Q3/u6-d-both-pages`), "Ask 142 to post him to 149"
(`Q3/u6-d-askpost`, `-bell` — phone and the bell line's landing owed), "It's him" end to end (`Q3/m6-*-itshim*`; its
sheet `m6-d-itshim-sheet` predates D2653 — "To" as chips, redraw in way C).

**Count — section 2:** of 36 states that put something new on screen, **11 approved whole** (2.1, 2.4, 2.5, 2.12,
2.15, 2.20, 2.22, 2.24, 2.25, 2.32, and 2.31's look) and **25 owed in whole or part** (2.2, 2.3, 2.6–2.11, 2.13,
2.14, 2.16–2.19, 2.21, 2.23, 2.26–2.30, 2.33, 2.34, 2.36, 2.37). 2.35 and 2.38 need no picture.

**Words not yet read by a fresh Fable — section 2:**
- "This changed while it was open — open it again." (2.36) — fold's draft, read by no one.
- "…142's admins are told when you approve him." (2.29) — read by no one.
- The re-link sentence (2.35) — the plan's reading; owed a fresh Fable (§19.2, chat 187's owed list).
- V-Q2's words for an admin of both squadrons (2.30) — not drafted.
- "Ace is already taken on 149" for a refused restore (2.31) — a variant of the reviewed "Ranger is already taken on
  142"; no review names it.
- "Nobody matches." (2.7) — not drafted in any words file I found.
- The folded heading's singular ("1 person") — `[WNS]` in the plan §19.3.
- "Edit on 142 →" — in `words-r6-users.mjs`, but the round-6 review's "Kept" list does not name it (nor `folded`);
  chat 187 listed it owed. Confirm with that review or have it read.

---

## 3. The bell, colours and Display (§19.5–19.8; D2638–D2640, D2649, D2652 N1–N2, D2623, D2655 D9, D10, D12)

| # | State | Approved drawing | OWED (why) | New? | D / P |
|---|---|---|---|---|---|
| 3.1 | The bell with several squadrons: each line's number first, in one column, in its squadron's colour; Show buttons the same colours; the dot blue | `Q3/e3d-d-both`, `Q3/e3d-p-both` (opened), `Q3/e3d2-d-both-read` · R6 · D2638, D2652 N1 (supersedes round 5's grey `e3-*`, `e3h-*`, D2655 D3) | — | yes | D ✓ · P ✓ |
| 3.2 | A man's home number after his name, in its colour (N1 a) | the top line of `Q3/e3d-*` · R6 · D2652 N1 a | — | yes | D ✓ · P ✓ |
| 3.3 | His own account's lines keep the column empty, colours on | `Q3/m6-d-itshim-bell`, `Q3/m6-p-itshim-bell` (Hunter, 142 and 149) · R6 · D2652 (N9) | — (those pictures carry an [XFER] line on top; the look is the same) | yes | D ✓ · P ✓ |
| 3.4 | One squadron switched on: no numbers | — | No drawing: today's bell | — | — |
| 3.5 | Admin → Display, "Squadron colours": each squadron's number and colour, a colour slider and a brightness slider, Save · Reset, a live preview of his bell | `Q3/e3g-d-display` (opened), `Q3/e3g-p-display`, `Q3/e3g2-d-display-moved` · R6 · D2652 N2, D2639, D2640 | — | yes | D ✓ · P ✓ |
| 3.6 | The brightness slider stops short of unreadable (N2 d) | approved as a reading | No new picture: the slider's end only | — | — |
| 3.7 | Display for an admin whose bell can show only one squadron (N2 e hides the section) — does the Display card show at all, empty? | none | **OWED — never drawn, and not settled**: with "Squadron colours" its only section (D2640), the page would be empty for him | yes | D · P OWED |
| 3.8 | The left column with both the Display card and Users' jumps | none (2.2) | **OWED (minor)** — one picture with 2.2 | yes | D OWED |
| 3.9 | Bug reports: one list, newest first, each report wearing its squadron's number | `Q3/e7-d-numbers` (opened) · R5 · D2655 D9 | **Phone never drawn.** Script `H/n176/draw-e7.mjs` | yes | D ✓ · P OWED |
| 3.10 | A member's own "Your reports": no number | none — the plan §19.6: "a look, drawn with D9" | **OWED — never drawn** | yes | D · P OWED |
| 3.11 | The name badge where he only views: "Hunter · View only", plain words, no switch; the ☰ menu without "Switch to the member view" there; "Admin" where he plans | `Q3/e8-d-badge-r`, `Q3/e8-p-menu-r` (opened), `Q3/e8b-d-badge-149` · R5 · D2655 D10 | — ("Ranger · View only" for a member is the same look) | yes | D ✓ · P ✓ |
| 3.12 | A sign-off box holding another squadron's name, closed: "Hunter · 142" in plain letters | `Q3/e11b-d-chosen` · R5 · D2655 D12; phone `Q3/m6-p-plannedby-chosen` · R6 (N10's drawing; the closed box is the same, only its open list was rejected, D2646) | — | yes | D ✓ · P ✓ |
| 3.13 | The same list opened: the browser's own list with "Hunter · 142" | `Q3/e11-d-plannedby` · R5 is **superseded** (it draws the grey box; D2655 D12 rules plain letters, D2646 the browser's list) | **Cannot be pictured from here** (the browser's / iPhone's own list, D2646, lesson 104); his own iPhone picture stands. Say so on the page rather than redraw | yes (words) | — |
| 3.14 | Whether a signed box and the published day carry "· 142" | — | **OWED: a check, not a drawing** — round 5's D12: "checked and told to you" | — | — |
| 3.15 | A new report rings only its squadron's admins and a master admin | — | No drawing: the bell's existing alert | — | — |

Open questions found on round 5's page and still not put to him (no drawing yet): "Mark all read" marks every line
the list shows, 142's included with 149 picked; a waiting OIL question takes the bell's one tap, so its list and
Show buttons cannot be reached. Also undecided: whether an unsaved colour on Display refuses a pick (a guard row) —
the plan does not list Display among the forms.

**Count — section 3:** of 11 states that put something new on screen, **7 approved whole** (3.1, 3.2, 3.3, 3.5, 3.11,
3.12, and 3.13 as words) and **4 owed in whole or part** (3.7, 3.8, 3.9 P, 3.10), plus the check 3.14. 3.4, 3.6, 3.15
need no picture.

**Words not yet read by a fresh Fable — section 3:**
- **The whole Display page:** "Display" (and its card subtitle "Squadron colours"), "Squadron colours", "How each
  squadron looks on your bell. Only you see your colours.", "Colour", "Brightness", "Save", "Reset", "Preview" — the
  round-6 review says it did not re-review N1's and N2's pictures word by word (its §4 item 9); chat 187 listed "the
  Display page's words" owed. None other found.
- Everything else here (the badge, "Hunter · 142", "150 has no SANS aircrew.") was read by round 5's Fable reviews.

---

## 4. The posting sheet on the Leave War (D2648, D2653 way C)

| # | State | Approved drawing | OWED (why) | New? | D / P |
|---|---|---|---|---|---|
| 4.1 | Post out, way C, Transfer to Sqn chosen: head "Cinch  Post out"; Posting first; "PO from" and "To squadron" side by side; the line; a blue "Post out" | phone `Q3/p6-p-C-war` · R6 · D2653 | **Desktop `Q3/p6-d-C-war` drawn but never shown** (not on round 6's page) — show it | yes | D OWED (show) · P ✓ |
| 4.2 | The sheet as it opens: Overseas Sqn chosen, "On 14 Dec: archived, account suspended.", no "To squadron" | `Q3/p6-{d,p}-C-war-overseas` (opened) — **drawn, never shown** | **OWED (show).** It is the first thing every admin will see | yes | D · P OWED (show) |
| 4.3 | **Transfer to Sqn greyed in way C until the Transfer step** — this side ships alone, before [XFER] (D2657); today the chip is greyed with a reason shown only on mouse rest ("Comes with the shared database"), which an iPhone never shows (round 5's D11 lesson) | none — every way-C picture draws Transfer live (`p6-d-C-war-overseas`, opened, shows it live) | **OWED — never drawn, and its reason's place undecided** | yes | D · P OWED |
| 4.4 | Delete chosen: the "Delete Cinch?" card | none | **OWED** — named in D2653 "Not drawn yet, before the build" | restyle | D · P OWED |
| 4.5 | The last admin cannot be posted: the amber blocked line | none | **OWED** (D2653) | restyle | D · P OWED |
| 4.6 | An existing posting's sheet ("Undo post out") | none | **OWED** (D2653) | restyle | D · P OWED |
| 4.7 | The posting from a dragged range (the drag sheet) | none | **OWED** (D2653) | restyle | D · P OWED |
| 4.8 | A ground-crew man's three chips (no SANS) | none | **OWED** (D2653) | restyle | D · P OWED |
| 4.9 | The opened "To squadron" list | none | **OWED / cannot be pictured** — the phone's own list (D2653 names it; the posting report §6 says a picture from here cannot hold it) | yes | — |
| 4.10 | SANS chosen; an error line; no outcome chosen | none | **OWED (minor)** — posting report §6 ("an error line, … no outcome chosen") | restyle | D · P OWED |
| 4.11 | Post in, way C: head "Post in", the date, the app's own note, a blue "Post in" | phone `Q3/p6-p-C-postin` · R6 · D2653 i | **Desktop `Q3/p6-d-C-postin` drawn, never shown** | yes | D OWED (show) · P ✓ |
| 4.12 | The leave buttons step aside while a posting is open; ✕ and the day pressed again give them back | the way-C pictures · R6 · D2653 d | — (the way back is today's sheet) | yes | D, P ✓ |

All way-C pictures: script `H/n176/draw-r6-posting.mjs` (today's sheets `draw-r6-posting-today.mjs`); start each
missing state from `Q3/p6-{d,p}-C-war` and that state's today picture. The Admin → Users side (`p6-{d,p}-C-users`,
D2653 c) rides [XFER].

**Count — section 4:** of 12 states, **1 approved whole** (4.12); 4.1 and 4.11 are approved on the phone only;
**10 owed in whole or part** (4.1 D, 4.2, 4.3, 4.4–4.8, 4.10, 4.11 D); 4.9 cannot be pictured.

**Words not yet read by a fresh Fable — section 4:** none of the sheet's new words (the r6-words2 review read them all:
"To squadron", "Post in", the transfer line). Owed only if 4.3 moves the greyed Transfer chip's reason into words under
it — today's hover text "Comes with the shared database" would then be read as a new on-screen line.

---

## Things the coordinator should know

1. **Round 6's page has captions that are behind its pictures:** D11 ("redrawn with the words under the button" —
   `e9-*` already are), D4's note on `e4a-p-folded` ("Hunter's row … will be redrawn" — superseded anyway by the new
   order). Not a fault in what he approved, but a section page built from these must not repeat them.
2. **Three way-C pictures were drawn and never shown** (`p6-d-C-war`, `p6-d-C-postin`, `p6-{d,p}-C-war-overseas`);
   D2653 cites `p6-*` as a whole, but he saw only the phone pictures. The section-4 page should show them.
3. **Section 1 and section 2 both draw "+ Add a person".** Build 1's step 1b (core) puts it beside Filter on the People
   row (§18.3); D2652 N13 i puts it in the top row with the one search (D2647), its form under that row. The core's
   1b drawing must be the top-row one, or 1b builds a place section 2 then moves.
4. **The plan's §4.6 still marks "add or cancel the new person" as not his** — D2655 D1 approved the drawing that
   carries it (`e1d-*`).
5. Not drawn because they are not this batch: the refresh card and Logout's questions (group B, D2636); everything of
   [XFER] listed under section 2.

## Totals

| Section | Approved whole | Owed (whole or part) | No drawing needed |
|---|---|---|---|
| 1. Core — the guard rail | 16 | 11 | 6 |
| 2. Admin → Users across squadrons | 11 | 25 | 2 |
| 3. The bell, colours and Display | 7 | 4 (+ 1 check) | 3 |
| 4. The posting sheet on the Leave War | 1 (+ 2 on the phone only) | 10 (+ 1 that cannot be pictured) | 0 |
