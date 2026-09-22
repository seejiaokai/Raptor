# [OIL-SEATS-CAN-EARN] — the walk, SURFACES block

Everywhere the count and the green earn bar are drawn **other than the scheduler board**: the
edit week, the view week, the next-week peek, the exported file, the issued page, and the
squadron member's view. FULL tier, `docs/bug-check-order.md` §7.

Driven against the production bundle already served at `http://localhost:4173`, byte-identical to
the branch head. Every fixture made through the app's own add controls and its own crew palette
(§7.7) — nothing injected. Pictures in `docs/img/handpass/2026-09-22-oil-seats/`, named `SURF-*`.
Scripts in `raptor-port/scripts/handpass/seat-surf-*.mjs`.

The day walked is the everything-Saturday, day index 5, **Sat 18 Jul 2026**, plus Tuesday 14 Jul
for the weekday case and Sat 25 Jul (next week) for the peek.

**The browser's error list was empty on every run.** No console error, no page error, no 4xx,
across all nineteen scripts and 48 pictures.

---

## What the surfaces are asked to do

| # | Surface | The promise | Result |
|---|---|---|---|
| 1 | **Edit week**, desktop | count chip on every seat kind; green earn bar reaches flying lines, sims, duty desks, ground rows, Common Programme | **passes** |
| 1b | **Edit week**, phone | the same | **FAILS — finding S1** |
| 2 | **View week**, desktop and phone | the same, read-only; a member may read the count | **passes** |
| 3 | **CSV / print export** | the written NO-because — "flying seats only" | **NO-because proved** |
| 4 | **Next-week peek**, both widths | a bare puck, **no** chip, no bar | **passes** |
| 5 | **Roles** | the count shows for a member on View-only Sched; the switch is the admin's, gated at the page and the write path | **passes** |
| 6 | **The issued page**, seen from the week | the chip carries the version and says "as issued" | **passes** |

---

## THE FINDINGS

### S1 — On a phone, on the EDIT WEEK, the count cannot be tapped. The tap opens the remarks box instead.

**Severity: medium.** Reachability, not money. But the chip is the *only* way to see who is behind
a placeholder, and on a published day that list is the record of who was paid.

**What the ruling says.** D27/D37: the count shows on every seat, on every day, and *"tap to see
each one"* is the chip's own instruction — it says so in its own hover words.

**What I did.** Phone width 390x844. Added a ground row `STORES CHECK 08:00–10:00` through the
board's own `+` control, dropped ALL AVAIL on it through the week's own people cell. Then measured
what sits on the chip's own pixels and pressed exactly there.

**What I saw.**

```
EDIT WEEK, phone — the chip "30 of 30 earn"
  pixels, front to back:  SPAN.ntx.txed  >  SPAN.rmk  >  SPAN.oilcount  >  SPAN.seat
  the chip is on top:     NO
  a real press there:     NOTHING HAPPENED
  where the cursor went:  the row's own remarks box (contenteditable, same row)
```

The picture says it plainly: at phone width the chip **overflows the People column and lands under
the RMKS heading**, on top of the remarks box.

- `SURF-34-phone-editweek-chip-under-remarks.png` — the chip sitting in the RMKS column
- `SURF-39-desktop-editweek-same-row.png` — the same row at desktop, chip inside People, remarks clear
- `SURF-38-phone-press-lands-in-remarks.png`, `SURF-25-phone-editweek-all-kinds.png`

**Which rows it hits**, measured one at a time (`seat-surf-14-phonekinds.mjs`):

| Row on the edit week, phone | chip | on top | a real press |
|---|---|---|---|
| Common Programme — FAMILY DAY, ALL AVAIL alone | 27 | **NO** | **nothing** |
| Common Programme — SAFETY BRIEF, ALL AVAIL alone | 39 | **NO** | **nothing** |
| Ground row — STORES CHECK, ALL AVAIL alone | 30 | **NO** | **nothing** |
| Common Programme — MASS BRIEF, ALL AVAIL after two named men | 39 of 39 earn | yes | the list appeared |
| Duty desk — OPS O (AVALON) | 45 | yes | the list appeared |
| Duty desk — OPS O AM (SC) | 30 | yes | the list appeared |
| Sim — EP-6 extras | 39 of 39 earn | yes | the list appeared |
| Sim — BOX passenger extras | 30 | yes | the list appeared |

**The controls that make it a real finding, not a measuring error.** The very same rows work
everywhere else: desktop edit week, desktop view week, desktop board, **phone view week**, phone
board — all eight chips on top, all eight presses produced the list
(`seat-surf-11-chiphit2.mjs`, `SURF-19`/`SURF-20`, `SURF-26`).

**Is it new to this branch?** Two halves, and they differ:

- The layout overflow is **pre-existing**. `scheduler.css` is untouched on this branch
  (`git diff main...HEAD -- raptor-port/src/scheduler.css` is empty), and on `main` a Common
  Programme row or ground row carrying a placeholder on a **weekend** already drew this chip.
- **On the five weekdays it is NEW.** Step 9a (D27) is what put the count on days that earn
  nobody anything — the code's own comment says so: *"five days a week the puck stood for nobody
  and this returned null"*. Driven and confirmed: Tuesday 14 Jul, phone, edit week, a ground row
  with ALL AVAIL draws **"33"**, hover *"33 with nothing else on at that time — tap to see them"*,
  chip under `SPAN.ntx.txed`, press → **nothing** (`SURF-27-weekday-phone-chip.png`).

So the branch does not create the defect; it multiplies it from two days a week to seven, and puts
it on the surface the scheduler actually edits in.

**Disposition:** unresolved — for the owner. It is a layout fix in `scheduler.css` (the People
column's chip must not overflow into RMKS at phone width), which no worker on this walk may make.

---

### S2 — The chip says "N of N earn" while its hover says "some of them earn nothing". Both cannot be true, and the hover is the one that is wrong.

**Severity: low-medium.** Wording, not money — but it is the sentence a scheduler reads before
deciding whether anyone has been missed.

**What the ruling says.** D37: *"It reads as what it is."*

**What I did.** Read each chip, then tapped it and counted the list underneath
(`seat-surf-16-words.mjs`).

```
row  FAMILY DAY 10:00 14:00 ALL AVAIL
  the chip reads : "27 of 27 earn"
  the hover says : Some of these men earn OIL and some do not — tap to see each one
  the list says  : 1 gets a full day, 26 get half a day, 0 get nothing

row  STORES CHECK 08:00 10:00 ALL AVAIL
  the chip reads : "30 of 30 earn"
  the hover says : Some of these men earn OIL and some do not — tap to see each one
  the list says  : 3 get a full day, 27 get half a day, 0 get nothing
```

Nobody in either crowd earns nothing. What actually varies is the **amount** — a full day against
half a day. The "some do and some do not" wording fires on *mixed amounts*, not on *mixed
entitlement*, and the two are different questions.

The chip text has the same trouble from the other side: "27 of 27" is written as a fraction, which
invites the reader to check whether the two numbers differ — and they never will in this case,
because this wording only appears when everyone earns something.

**Consequence.** The scheduler reads "some of these men earn nothing" and goes looking for men who
are owed nothing. There are none. Or, worse, he takes it at face value and believes part of a
weekend crowd went unpaid.

**Is it new?** **Pre-existing** — the same two strings are on `main`
(`git show main:raptor-port/src/ui/html.ts`, lines 501–502). Newly reachable far more widely,
because the count now draws on every seat kind and every day.

**Disposition:** unresolved — a wording question for the owner. The honest sentence is about
amounts: something like *"All 27 earn, but not all the same amount"*.

Picture: `SURF-32-chip-words.png`.

---

## THE EXPLICIT NEGATIVES — what I checked and found nothing wrong with

### The green earn bar reaches every kind of seat on the week

Read straight off the edit week, day 5, after placing by hand (`seat-surf-02-editweek.mjs`):

| Kind on the week | example | earn bar |
|---|---|---|
| Flying line — cockpit, ordinary wave | bane, freak, razer, sufa | green, full day |
| Flying line — SC MAIN | pump, glass | green, full day |
| Flying line — SC SPARE | taipan, drill | none — D24, off by default |
| Flying line — AVALON | prowler, nasty | none — D24, off by default |
| Duty desk — SDO block | plasma | green, full day |
| Duty desk — AVALON block | salsa | none — D24, off by default |
| Duty desk — SC block | slipway | green, full day |
| Sim — front/rear seat | dice, glass | green, full day |
| Sim — passenger line | snap, ammo | green, full day |
| Ground row — the who | stiff, haowen, mamba | green, full day |
| Common Programme — the who list | stiff, ignite | green, full and half day |

The week and the board agree: the lib's own read of the board (`readDay`) and the week's read give
the same bar for the same man on the same seat. No surface was missed and none disagreed.

### The count chip shows on every seat kind, on the week, at both widths

Placed by hand through the week's own doors, one placeholder on each
(`seat-surf-04-weekfull.mjs`, `seat-surf-14-phonekinds.mjs`):

| Roll-call row | edit week desktop | view week desktop | edit week phone | view week phone |
|---|---|---|---|---|
| Common Programme — the who list | chip | chip | chip (unreachable, S1) | chip |
| Common Programme — extras | chip | chip | chip | chip |
| Duty desk — own position | chip | chip | chip | chip |
| Duty desk — a second desk | chip | chip | chip | chip |
| Sim — row extras | chip | chip | chip | chip |
| Sim — passenger row extras | chip | chip | chip | chip |
| Ground row — the who | chip | chip | chip (unreachable, S1) | chip |
| Flying line — either cockpit seat | **refused, with a reason** — no chip, correctly | same | same | same |

No blank cells. The week and the board do **not** disagree about which seats carry a chip.

### The chip's tap says the same thing on every surface

`seat-surf-05-tap.mjs`: the same three chips tapped on the edit week, the view week and the board
all produced the identical sentence, e.g. *"30 behind this puck — who is free as things stand now
— Ace half day, Warden half day, …"*. Pictures `SURF-04`, `SURF-05`, `SURF-06`.

*(I nearly filed a false finding here: my first probe looked for the app's message under the wrong
name and reported "nothing happened" on all three surfaces. The message strip is `#toastEl`. Worth
recording, because a wrong selector and a dead control look identical from outside.)*

### The next-week peek — bare puck, no chip, no bar. Correct.

Driven properly: clicked a peek column (its own door — it loaded the week of 20 Jul), added a
ground row `PEEK PROBE` on Sat 25 Jul through the board's `+`, dropped ALL AVAIL on it, went back
a week, and looked at the peek (`seat-surf-12-peek.mjs`).

```
THE PEEK on the EDIT WEEK, desktop
  peek columns: 7 | count chips: 0 | earn bars: 0
  addressable markers (data-person / data-slot): 0 / 0
  placeholder pucks drawn: 1
  the row as the peek shows it: "PEEK PROBE 08:00 10:00 ALL AVAIL"
```

Identical on the view week. **On a phone the peek is not drawn at all** (0 columns) — it is a
desktop-only preview, so there is nothing there to get wrong. Pictures `SURF-21`, `SURF-22`,
`SURF-23`.

A second thing this proved in passing: the per-week memory works — an edit made on next week came
back through the peek after navigating away and back.

### The export carries flying seats only. The NO-because is complete.

Took the door in the running app: the week's **Export to Excel (CSV)** control. The app handed over
`142-schedule.csv` and said *"CSV downloaded"* (`seat-surf-13-export.mjs`, `SURF-24`).

What the file actually contains, with a placeholder sitting on a ground row and another on the
Common Programme of the exported day:

```
rows: 47
header: Day, Date, Wave, CS, Mission, Brief, TO, Land, FCP, FCP lvl, RCP, RCP lvl, Area, Area time, Rmks, Stores
lines naming a placeholder:              0
lines mentioning a count or earning:     0
lines mentioning a ground or programme row at all: 0
Saturday lines: 14  — all of them flight lines
```

The file is the flying programme and nothing else: waves → formations → aircraft → the two cockpit
seats. Ground rows, duty desks, sims, the Common Programme and every count are outside it by
construction.

**And a placeholder cannot get into it by the back door either.** The only cells the export reads
are the two cockpit seats, and both doors refuse a placeholder — I drove both orders on a freshly
added, empty cockpit seat (`seat-surf-15-three.mjs`):

```
TAP the seat, then the palette :  seat stays empty — "ALL AVAIL — cannot crew a jet; name the people flying it"
DRAG from the palette onto it  :  seat stays empty — same sentence
```

Picture `SURF-28-cockpit-refusal.png`. So the export's silence about placeholders is not luck; the
data can never contain one.

### Roles — clean, and gated at the page, not the nav

Signed in as the squadron member (`us`/`us`), `seat-surf-06-member.mjs` / `seat-surf-07-memberwrite.mjs`:

- **He sees the count.** View-only Sched, Saturday: chip **"27"**, hover *"All 27 earn half a day —
  tap to see each one (who is free as things stand now)"*. His tap produced the full list of the
  27 men and what each is owed. `SURF-07`, `SURF-08`.
- **The tabs he can see** are View-only Sched · Inputs · Quals · Logic · Leave War · Tracker · Help.
  No Edit Schedule, no Admin.
- **The page refuses him too, not only the nav.** Sent straight to Edit Schedule through the app's
  own page switch: the week draws with **0** drop targets, **0** draggable pucks, **0** empty seats
  and **0** add controls. Pressing a people cell does not arm it — there is no cell to press.
  `SURF-10`, `SURF-11`.
- **No earn switch anywhere.** The OIL Earn button is absent, and so are the per-item switches, the
  opened pucks and the publish controls. `SURF-12`.

### The issued page keeps its own answer, and the week shows it

Published Saturday through the real sign-off and Publish controls (four sign-offs, version
**ORIG**), opened the day's one white selector, and took the issued page (`seat-surf-15-three.mjs`):

```
inside the issued page:  chip "27"  version 2026-07-18#0
                         "All 27 earn half a day — tap to see each one (who was free when this day was issued)"
the same day on the VIEW WEEK while it is up:
                         chip "27"  version 2026-07-18#0   — the same words
```

The words change from *"as things stand now"* to *"when this day was issued"*, and the chip carries
the version, on the week as well as the board. D44 and D37 hold on this surface. `SURF-29`,
`SURF-30`, `SURF-31`.

### Two answers to the word "free" on one screen — not on the week

The plan flagged the Available-crew panel's "Pilots · N free" sitting beside a puck's count. On the
**edit week** there is no such line: the panel is present, but the word "free" appears nowhere on
the day column (`seat-surf-16-words.mjs`, `SURF-33`). If that clash exists it is on the board, not
here.

---

## Things I met on the way that are NOT defects, recorded so nobody re-finds them

1. **A people cell whose own seat holds a REAL man cannot be armed by a press** — pressing it
   selects the man instead. So `Duty desk — more` and `Ground row — more` cannot be reached by tap
   on the week; the drag still works. This is deliberate and pre-existing
   (`interactions.ts`: a placeholder-filled or empty seat arms, a real man's puck falls through to
   selection). I used empty rows and new rows instead.
2. **The board's ✕ has no readable name at phone width**, so the shared `closeBoard()` helper
   silently fails there and leaves the board over the week. A harness limit, not an app fault —
   `#sbClose` closes it. Recorded because it produced a completely false first phone run
   ("nothing arms at phone width"), which was wrong.
3. **Two placeholders on one row draw two identical chips.** Expected — each puck carries its own.

---

## WHAT I DID NOT WALK, AND WHY

- **The scheduler board at either width** — another worker's block on this walk; I opened it only
  to make fixtures and to take the comparison readings named above.
- **The Leave War side** (the OIL tracker figure, the FO/HO cell, the clash strip, the reverse
  sweep after a switch is turned off on a published day) — the plan lists it, and it is not in this
  block. It must not be reported as covered by anyone on the strength of this sheet.
- **The Inputs page and the board's personal-inputs strip.** The claim row's own puck is the man
  who filed the request, who can never be a placeholder, so there is no count to draw there. I did
  not drive the accepted-request ground row (D46/step 6) — the ground row it lands on is covered
  above as an ordinary ground row, but the `src`-marked row specifically was not walked.
- **The print / PDF door.** The control is present on the week (`#exportPdf`) but it opens the
  browser's own print dialog, which a driven browser cannot read. It uses the same `schedRows` /
  `publishedDays` flattening as the CSV, so the same NO-because applies by construction — but that
  is reasoning, not a driven result, and it is written here as such.
- **The arithmetic behind each number.** I placed both placeholder pucks — ALL and ALL AVAIL — on
  every seat kind and confirmed each draws its own chip, bar and list on every surface. I did not
  audit whether each number is *right*, only that it is drawn, reachable and consistent between
  surfaces. (One thing I did close: the two pucks read different numbers on different rows — 30 on
  a 07:00–13:00 desk, 39 on a 15:00–16:00 brief, 45 on a 19:00–07:00 desk. That is the window
  differing, not the puck: ALL and ALL AVAIL are declared the same thing — *"only those available
  will attend"* — and both expand against the event's own hours.)
