# Section 2 — Admin → Users across squadrons: the drawer's report (chat 191, a fresh Fable, 26 Nov 26)

Brief: `2026-11-26-msq-sections-draw-brief.md`. Ledger: `2026-11-26-msq-sections-drawings-ledger.md` §2. Nothing in the
app was built, rebuilt, committed or pushed; no file without the `s2` prefix was written.

## How it was made

- **Served app:** `http://localhost:4700/` — checked that it serves this folder's `raptor-port/dist` (the page's
  `index-7OsqMtMA.js` is in `dist/assets/`). No server was started or stopped.
- **World:** round 6's (`.tmp/n176-draw/r6-users-state.json`, read only): 142, 149, 150; Hunter Plan of 149 and View of
  150; Bolt View of 149; Blade a 142 admin; Osprey a second 149 admin. Two set-ups by presses on top of it
  (`s2-state-arch.json`: Saber archives 142's Jester; `s2-state-wait.json`: two new sign-ins ask 149 for access through
  the app's own "Request access" card). The bell pictures of 2.33 and 2.34 use round 1's Saber bell state
  (`state-e3s.json`), as the approved `e3d`.
- **The page** is round 6's approved page (way A), rebuilt by `draw-s2-lib.mjs` `build` — copied from
  `n176/draw-r6-nav.mjs` because that file runs on import; nothing in `n176/` was edited. Every part is the app's own:
  rows cloned from a real row, an opened row is the man's **real** opened row cut to its one access line, a passing
  note is a real one raised by the app, the landing ring is the app's own (`acc-ring`).
- **Drawn, not in the world** (the app cannot do them yet), as round 6: Cinch posting to 149 on 14 Dec, Raven posting
  out 4 Jan, Mako's View of 149, Kestrel's View of 142, Mako posting in to 142 on 4 Jan; and here: the three outcome
  tags of 2.23, Cobra's and Blade's Plan of 149 in 2.33.
- **Mark:** teal dashed ring, 2px `#0D9488`, 4px clear. No violet, no pink.
- **Scripts** (`raptor-port/scripts/handpass/n191/`): `draw-s2-src.mjs` (sources), `draw-s2-lib.mjs`,
  `draw-s2-page.mjs`, `draw-s2-forms.mjs`, `draw-s2-bell.mjs`, `draw-s2-film.mjs`, `words-s2.mjs`. Each prints `FACT`
  lines; the runs' output is kept in `raptor-port/.tmp/n176-draw/s2-page.log`, `s2-forms.log`, `s2-bell.log`,
  `s2-film.log` (the first three pictures of the page script were run before the log was kept — re-run
  `ONLY=06,07` to print them again).
- **Pictures:** `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/s2-<row>-<d|p>-<name>.png` and its `-crop`;
  desktop 1536 wide, phone 402×874, scale 2. Every picture was opened (crop) and checked against its ruling.

## One row per ledger row

| # | State | Pictures (desktop / phone) | What is new, ringed | Ruling | Departure or reading |
|---|---|---|---|---|---|
| 2.1 | The page in his order | approved — `j6-d-A-149`, `j6-d-A-142`, `j6-p-149`, `j6-p-142` | — | D2652 N13 | none; shown from round 6 |
| 2.2 | The left column with the jumps **and** "Display" | **drawn** `s2-02-d-column` / phone approved (`j6-p-*`) | the jumps under "Users"; the "Display" card | D2652 way A, D2639 | "Display · Squadron colours" is round 5's `e3g` words (section 3's); the card stands after "Data", where `e3g` put it |
| 2.3 | A jump pressed — **the film** | **drawn** `s2-03-d-jump.mp4` / `s2-03-p-jump.mp4` (3.2 s each; a still of the white heading: `s2-03-{d,p}-jump-reached.png`, no crop) | not ringed (a film) | D2652 N13 b | only "white about a second" is ruled. **Readings:** the pressed jump lights at the press; the page runs 0.6 s, slowing at the end; the heading goes back to grey over 0.3 s. On the desktop the heading stops lower than on the phone because the page ends there. The pale dot is the film's own mark for the finger, not the app's |
| 2.4 | Scrolled halfway | approved — `j6-d-A-mid`, `j6-p-mid` | — | D2652 | — |
| 2.5 | A heading folded | approved — `j6-d-A-fold`, `j6-p-fold` | — | D2652 N13 h | — |
| 2.6 | Searching "Bol" — **redrawn** | `s2-06-d-search` / `s2-06-p-search` | "From other squadrons" holding Bolt once | D2652 N13 d, j; D2647 | Bolt shows **once**, under "▾ View only · 2 people" opened for him. **Reading:** "▸ 142 · 60 people" hides, since its only match is the man already shown (checked: nobody else of 142, 149 or 150 matches "Bol"); had another 142 man matched, the fold would stay, open on him alone |
| 2.7 | "Nobody matches." | `s2-07-d-nobody` / `s2-07-p-nobody` | the line | D2652 owed list; D2647 | the app's own words today. **Reading:** one line under the top row, every jump grey, none lit |
| 2.8 | The empty "From other squadrons" in the new order | `s2-08-d-empty-other` / `s2-08-p-empty-other` | the block; the jumps | D2652 owed list | Hunter on 142, nobody from outside and nobody coming or going. **Readings to check:** the heading carries no count (as round 6's `u6-d-postout` drew it and as "Waiting for access" does), its jump says 0 and stays live; with two jumps the phone's two share the row equally |
| 2.9 | An empty Incoming: hidden, with its jump | `s2-09-d-no-incoming` / `s2-09-p-no-incoming` | the jumps (three) | D2652 N13 e | — |
| 2.10 | "Waiting for access" with people in it | `s2-10-d-waiting` / `s2-10-p-waiting` | nothing ringed — it is today's list, real, in the new page | D2652 N13 f (no jump) | the two requests are real (made through "Request access"); the "2" badge on the Users card is the app's own today |
| 2.11 | A 375-px phone, "Outgoing 12" — **needs his rule** | phone only: `s2-11-p-375-words` (recommended), `s2-11-p-375-nocount` (the other), `s2-11-p-375-equal` (round 6's rule at this width — the fault) | the jumps | D2652 owed list | see the question below. Twelve of 149's ten cannot post out — only the count is drawn |
| 2.12 | Plan holders named, master admin, View-only folded | approved — `j6-d-A-149`, `u6-p-users` | — | D2652 N3 b–e | — |
| 2.13 | "View only" opened | `s2-13-d-viewonly` / `s2-13-p-viewonly` | the opened fold and its two rows | D2652 N3 c | Bolt (142, real) and Mako (150, drawn); each keeps his grey home number, as every row of the block does |
| 2.14 | A row of the block opened | `s2-14-d-block-opened` / `s2-14-p-block-opened` | the opened row | D2655 D5, D2626 | Hunter's real row, opened by Kestrel (149's own admin): None · View · **Plan** all live, Save, Cancel. Today's "Only a master admin gives Plan." is gone, as D2626 rules. No "Edit on 142 →" (Kestrel is not 142's admin) |
| 2.15 | A folded squadron opened | approved — `u6-d-folded`, `u6-p-folded` | — | D2652 N4, N3 e | — |
| 2.16 | An admin's row opened by one who is not 142's admin — **redrawn** | `s2-16-d-admin-opened` / `s2-16-p-admin-opened` | the opened row | D2655 D5, D2652 N4, N3 e | no grey number on any row of the group (FACT: 0); Blade reads "Pilot · CAT IP · admin"; Plan live for Kestrel (D2626); no link |
| 2.17 | No sign-in, opened — **redrawn** | `s2-17-d-nosignin` / `s2-17-p-nosignin` | the opened row | D2655 D5, D2652 N4 | reviewed words; no grey numbers |
| 2.18 | Plan greyed, its reason under the line | `s2-18-d-plan-greyed` (redrawn) / `s2-18-p-plan-greyed` (new) | the reason | D2655 D6, D2626 | Hunter (Plan of 149) with 149 picked; reviewed words. On the phone the reason takes two lines. Hunter stands in "From other squadrons" and in the 142 group, with "you" |
| 2.19 | The roles table's note 5 | desktop approved (`e4d-d-roles`) / `s2-19-p-roles` | note 5 | D2655 D6 | three lines on the phone |
| 2.20 | "Edit on 142 →" pressed | approved — `e8j2-d-after` | — | D2652 N5 | — |
| 2.21 | A master admin's page in the new order | `s2-21-d-master-top`, `s2-21-d-master-foot` / `s2-21-p-master-top`, `s2-21-p-master-foot` | top: the jumps; foot: the folded squadrons | D2654 E8, D2655 D7, D2652 | Saber on his own 142. The Filter panel losing its squadron ticks is a removal — not drawn |
| 2.22 | Incoming / Outgoing rows | approved — `j6-*`, `u6-{d,p}-users` | — | D2652 N3 f | — |
| 2.23 | Outgoing holding overseas, SANS and Delete; a restored man incoming | `s2-23-d-outcomes` / `s2-23-p-outcomes` | the Outgoing and Incoming groups | D2652 N3 g | each tag is the app's own today ("· Overseas Sqn", "· SANS", "· auto delete", "posting in 14 Dec"); the men are 149's own, so no grey number; each also wears his tag on his own row, as round 6 |
| 2.24, 2.25 | Another squadron's archived callsign; after "Someone new" | approved — `e6a-{d,p}-archived-r`, `e6a2-{d,p}-after` | — | D2655 D8 | **those approved pictures show the form under "People" (round 5's place)**; see "For the coordinator" |
| 2.26 | Archived holders on several squadrons | desktop approved (`e6b-d-archived-many`, `e6b2-d-after`) / `s2-26-p-archived-many`, `s2-26-p-archived-many-after` | the note and "Answer … first."; after: the new line | D2655 D8, D2652 N13 i | the phone pictures draw the form **under the top row** (on a phone, under "+ Add a person" itself), the new place |
| 2.27 | The old squadron's bell line, in colours; its landing | `s2-27-d-bell`, `s2-27-d-lands` / `s2-27-p-bell`, `s2-27-p-lands` | the line; the landed row | D2655 D8, D2638, plan §19.4 | Hunter's bell (142 and 149 on): "142" in orange. His own two "Given …" lines keep an empty place for the number, as approved. The landing: 142's page, "▾ Archived · 2" opened by the app, Jester's row in the app's own blue landing ring (its still look — the flash is stopped for a picture) |
| 2.28 | "Ranger is already taken on 142" | desktop approved (`e6d-d-taken-r`) / `s2-28-p-taken` | the line | D2655 D8 | the passing note's own amber, read off today's note |
| 2.29 | The Give access form's twin | `s2-29-d-give-ask`, `s2-29-d-give-told` / `s2-29-p-give-ask`, `s2-29-p-give-told` | ask: the note and "Answer … first."; told: the twin line | D2655 D8, plan §19.4 | the real Give access form on Jester's real request. "Add person and give access" greyed until answered — **a reading**: D8 names "Add person"; the form's own button is the twin |
| 2.30 | An admin of both squadrons meets the archived callsign (V-Q2) — **never asked** | `s2-30-d-both` / `s2-30-p-both` (recommended); `s2-30-d-both-plain` (the other); `s2-30-d-both-after` | the way across; the words; the line after | D2632 ("decides himself on that page") | see the question below |
| 2.31 | A refused restore names the squadron | no picture (today's place) | — | D2654 E9 k | words owed a review — list below |
| 2.32 | The Plan-given line | approved — `e3d-d-both`, `e3d-p-both` | — | D2652 N1, D2654 E6 | — |
| 2.33 | "Plan of 149 ended" in colours, and the app's own endings | `s2-33-d-ended` / `s2-33-p-ended` | the three lines | D2654 E6, E9 l; D2638 | **Readings:** "…: he moved to 150" carries no signer (the app ends it when the posting runs) and the man's home number is by then 150; "…: made a member" is signed by the 142 admin who made him one |
| 2.34 | A tap on a Plan line | `s2-34-d-bell`, `s2-34-d-lands` / `s2-34-p-bell`, `s2-34-p-lands` | the line; the landed row | plan §19.2 | lands on 149's page at Hunter's row in "From other squadrons", the jump for that group lit, the app's own landing ring |
| 2.35 | A re-link refused | no picture | — | plan §19.2 | words owed — list below |
| 2.36 | Save after the man's home changed under the row | `s2-36-d-changed` / `s2-36-p-changed` | the passing note | plan §19 (the fold's draft) | **Readings:** it is the app's passing note at the screen's foot (a real one raised, its words replaced), and the row stays open under it |
| 2.37 | A Plan holder looking at the squadron he plans | `s2-37-d-plan-holder` / `s2-37-p-plan-holder` | his own row in the block | D2652 N3 d | Hunter on 149: himself in "From other squadrons" with the app's "you" tag, not on 149's own list |
| 2.38 | A heading folded over a changed row | no drawing | — | D2654 E9 h | nothing new is seen |

## The two questions (each drawn; D2439 form)

**2.11 — a smaller iPhone.** *When:* an admin on a 375-wide iPhone (a mini or an SE) opens Admin → Users while ten or
more of his squadron are posting out at once — a detachment rotating; a few times a year. The four jumps then share
too little room: "Outgoing 12" fills its button edge to edge (`s2-11-p-375-equal`).
**Question:** on a narrow phone, should each jump be as wide as its own words need (recommended — all four still
show, counts kept, `s2-11-p-375-words`), or should the counts leave the jumps there (`s2-11-p-375-nocount`)?
Measured at 375: by words 67 / 81 / 75 / 60 px; equal 71 each. With three two-figure counts even the recommended way
would run out — then the counts would have to leave; not drawn.

**2.30 (V-Q2) — an admin of both squadrons.** *When:* Hunter, 142's admin who also plans 149, adds a "Jester" on 149
while 142 holds an archived Jester — a man coming back after a long break; rare, perhaps once or twice a year.
He can restore the man himself, so "ask 142's admin" is wrong for him.
**Question:** should the note give him a way straight to that archived row — "If this is him, restore him on 142 →"
(recommended, `s2-30-{d,p}-both`: one press picks 142 and opens the row, in the look of "Edit on 142 →") — or only say
"If this is him, restore him on 142's page first." (`s2-30-d-both-plain`)? Either way "Someone new" then reads
"A new Jester." alone, since nobody else needs telling (`s2-30-d-both-after`).

## Drawn, never shown (ledger)

None in section 2's own rows. The Transfer-step pictures the ledger lists under section 2 are not this section's.

## Every new word (file `n191/words-s2.mjs`)

Reviewed words were used unchanged from `n176/words.mjs`, `words-r6-users.mjs`, `words-r6-nav.mjs`.

| Words | Where | State |
|---|---|---|
| "This changed while it was open — open it again." | 2.36 | the plan's draft — **owed a fresh Fable review (D2441)** |
| "A new Jester. 142's admins are told when you approve him." | 2.29 | the plan's draft — **owed a fresh Fable review** |
| "If this is him, restore him on 142 →" | 2.30 recommended | drafted here — **owed a fresh Fable review**; the question is his |
| "If this is him, restore him on 142's page first." | 2.30 other | drafted here — **owed a fresh Fable review** |
| "A new Jester." | 2.30 after | the plan's §19.4 — owed a fresh Fable review |
| "Plan of 149 ended: he moved to 150", "Plan of 149 ended: made a member" | 2.33 | round 5's `words.mjs` (a Fable's, E9 l "drafts") — drawn now for the first time |
| "Nobody matches." | 2.7 | the app's own today |
| "posting out 4 Jan · Overseas Sqn", "… · SANS", "… · auto delete", "posting in 14 Dec" | 2.23 | the app's own today |
| "Display" / "Squadron colours" | 2.2 | round 5's `e3g` (section 3's words) |

Still owed a review and **not drawn** (no new look): "Ace is already taken on 149" for a refused restore (2.31); the
re-link sentence (2.35); the folded heading's singular "1 person"; "Edit on 142 →" (the ledger says the round-6
review's "Kept" list does not name it).

## What could not be drawn, and small faults

- **2.3's film is drawn frame by frame**, not recorded from a real scroll: the app has no jumps to press. The timing
  is a draft for him to judge; the mp4 files have no `-crop` twin.
- **2.11 with three two-figure counts**, and **a 375-px phone for any other state** — not drawn.
- **2.21:** the two rings round the folded squadrons touch.
- **2.36 desktop:** the passing note stands at the screen's middle, so it sits left of centre in the cut.
- **Pinned rows** (the left column; the phone's search and jumps) are drawn fixed for the picture, as round 6.
- On a phone a row peeks behind the pinned jumps in the scrolled pictures (2.17, 2.18) — how a pinned bar looks.

## For the coordinator

1. **The approved form pictures (2.24, 2.25, desktop 2.26, 2.28) still show the form under "People"**, round 5's
   place; D2652 N13 i moved it under the top row. My phone pictures (2.26, 2.28, 2.30) and 2.29 draw the new place.
   The section page should say so, or the desktop ones be redrawn with section 1's "form opened at the top".
2. **Today's fact seen while drawing:** with "Bol" typed on 149's page the app already lists 142's Bolt in 149's own
   list (the search reaches other squadrons) — the build must move him to the block, once.
3. **The app's landing ring is a six-second flash** (`inflash`); the pictures show its still look (the plain blue
   ring the app uses under reduced motion).
4. Hunter on 149 sees the "Home squadron" box in the add form (the app's own, today) — it shows in 2.30.

## After the coordinator (26 Nov 26)

Asked: redraw the approved form pictures that still show the "+ Add a person" form under "People" (rows 2.24, 2.25,
desktop 2.26, desktop 2.28) with the form under the top row (D2652 N13 i). Done, by `draw-s2-forms.mjs`
(`ONLY=24,25,26,28`; its output kept in `.tmp/n176-draw/s2-forms-top.log`); each picture opened and checked.

| Row | New picture | Replaces (approved, form under "People") |
|---|---|---|
| 2.24 | `s2-24-d-top-archived`, `s2-24-p-top-archived` | `e6a-d-archived-r`, `e6a-p-archived-r` |
| 2.25 | `s2-25-d-top-after`, `s2-25-p-top-after` | `e6a2-d-after`, `e6a2-p-after` |
| 2.26 | `s2-26-d-top-archived-many`, `s2-26-d-top-archived-many-after` | `e6b-d-archived-many`, `e6b2-d-after` |
| 2.28 | `s2-28-d-top-taken` | `e6d-d-taken-r` |

The phone pictures of 2.26 and 2.28 were already drawn at the top in the first pass and keep their names
(`s2-26-p-archived-many`, `s2-26-p-archived-many-after`, `s2-28-p-taken`) — no `-top-` twin was made for them.

**What changed, and nothing else:**
- **The form's place:** under the top row (search · Filter · "+ Add a person") on a desktop; on a phone under the
  "+ Add a person" button, which stands under the jumps. "+ Add a person" wears the app's pressed look while the form
  is open, as approved.
- **The page round it** is round 6's approved page: the one search at the top, the jumps (in Admin's left column on a
  desktop — outside these cuts; the four buttons on a phone), "Waiting for access" and "People" below the form.
- **The mark:** teal dashed ring round what is new in the app (the note and "Answer “Is this him?” first."; the line
  after "Someone new"; the taken line), in place of round 5's pink.
- **Jester's archive date reads "26 Nov 26"** (he was archived again for this set-up; the approved pictures read
  25 Nov) — the app's own date, not a word change.

**Kept as approved:** every word (round 5's reviewed words, unchanged), the note under the callsign box, the
"Someone new" button and "If this is him, ask 142's admin", "Add person" greyed in the app's greyed plain look with
its reason under it, the app's own Save · Cancel pair measured for "Add person" · "Cancel" (same height, one line,
6px apart — the FACT lines give each box), the amber of "Ranger is already taken on 142".

## After the words review (26 Nov 26)

The fresh Fable's review (`2026-11-26-msq-sections-words-review.md` §2) changed three of this section's lines. Applied
in `n191/words-s2.mjs`, and only the pictures that show them re-run under the same names (`ONLY=29,30,36`; output in
`.tmp/n176-draw/s2-forms-words.log`); each opened.

| Row | Was | Now | Pictures re-run |
|---|---|---|---|
| 2.29 | "A new Jester. 142's admins are told when you approve him." | **"A new Jester. 142's admins are told when you add him."** — round 5's reviewed line itself; no twin (`approveTold` is gone from the words file) | `s2-29-d-give-told`, `s2-29-p-give-told` (the `-give-ask` pair carries no changed word; re-run with them, unchanged) |
| 2.36 | "This changed while it was open — open it again." | **"Cinch’s row changed while it was open, so nothing was saved. Open it again."** (the callsign from the row) — one line on a desktop, two at 402 | `s2-36-d-changed`, `s2-36-p-changed` |
| 2.30, the other answer | "If this is him, restore him on 142's page first." | **"If this is him, restore him on 142"** | `s2-30-d-both-plain` (the recommended `s2-30-{d,p}-both` and `-both-after` carry no changed word; re-run, unchanged) |

This replaces the first pass's lines for 2.29, 2.30 and 2.36 in the tables above. "If this is him, restore him on
142 →" was kept by the review.

**Fact 1 — 2.36, does the row close?** The plan says it closes: §19.2 (line 2385) — "nothing is sent and the row
closes with the words". The first pass drew the row still open — wrong against the plan. **Redrawn: Cinch's row
stands closed again in the 142 group, the note at the screen's foot**, so "Open it again." is true and stays in.
(Still a reading: the note is the app's passing note at the foot.)

**Fact 2 — 2.30, the way across while the form holds a typed callsign.** The picture shows the moment before the
press and does not change. As drawn, the link sits inside the open "+ Add a person" form with "Jester" typed, and the
guard would refuse the pick it makes ("Blocked: add or cancel the new person, then pick 142."). For the recommended
picture to be honest, **the press must shut the form first, as its Cancel does — the typed callsign dropped — then
pick 142 and open "▸ Archived" at Jester's row** (2.27's landing). That is one more thing the guard lets through
without its note; the plan does not say it. **It does not need a question of its own**, but the 2.30 question put to
him must say it in its recommended answer: "one press closes this form — what you typed is dropped — and opens 142 at
his archived row". If the builder finds the form cannot be shut that way, the other answer's plain words ("If this is
him, restore him on 142") are the honest ones and the link is not built.
