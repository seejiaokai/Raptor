# The List's dates calendar opened off the screen on a phone — his find, the fix, the check (10 Oct 26)

**His words, with a picture from his iPhone:** "When I click on the calander to see the dates it shows me this and I
can't select the dates." On `claude/day-window-compact`, the morning after the design vet's build (`[INPUTS-VET]`,
D726–D730). Fixed by Opus 5.5 the same morning. Pictures: `docs/img/handpass/2026-10-10-list-dates-picker/before/` and
`…/after/` (24 each). The walk's script: `scripts/handpass/rng-repro.mjs` — its checks are the right behaviour, so the
run on the fixed build IS the re-walk.

## 1. What was wrong, and why nothing caught it

On a phone the Inputs List's dates button (`📅 10 Oct → 24 Oct`) lit and no calendar appeared. The calendar WAS open: it
was drawn one screen's height down the page, below the foot of the screen (measured: its top at 850 on an 844-tall
phone, at 574 on a 568-tall one). The page could be scrolled to it; nothing said so.

**The cause is old; last night's build exposed it.** On a phone the calendar is told to span the row of buttons, and
since Aug 26 it was placed against nothing but the screen — "one screen down". While the List's own add form stood above
that row, the row itself sat about a screen down the page, so the calendar happened to land near its button. D729 (V1)
removed the form; the row moved to the top of the page and the calendar stayed a screen below it. **An older fault this
build made the main road** — the third of that kind in `[INPUTS-VET]` (its sheet's §0, reading 11).

**Why last night's FULL check missed it — the method's failure before the app's (the order's §11):**
- Four browser tests and every walker pressed this button on a phone with a scripted press that first SCROLLS ITS TARGET
  INTO VIEW. The calendar's buttons were pressed and worked, so every step passed. A person's finger does not scroll the
  page to a thing he cannot see. The order's §7.2 already warns that a generic scroll-into-view can manufacture a
  finding; here it HID one.
- The vet's roll-call listed the List's tools row as a surface and "+ Input" as its door, and asked what the removal
  of the form took away (the door inventory). It did not ask what the removal MOVED: everything under the form shifted
  a screen up, and a pop-up placed by the screen rather than by its button does not follow.
- **The lines this costs the method** (each filed, none a change to the checking guide itself — that is read by both
  reviewers first, D70): `OUTSTANDING.md` `[WALK-FINGER-NOT-LOCATOR]`.

## 2. The eight questions, and the tier

| # | Question | Answer |
|---|---|---|
| 1 | OIL, pay, how many count as present | NO — a pop-up's place on the screen. |
| 2 | The published record | NO. |
| 3 | Saved data | NO — nothing is stored or read differently. |
| 4 | A shared drawer | NO — the two-tap calendar itself is shared (an input's window uses it too) and is NOT touched; the one rule changed places the List's own pop-up, drawn in one place. |
| 5 | A new gesture or mode | NO — the same button, the same two taps. |
| 6 | A new surface | NO — the pop-up existed; it is put back in sight. |
| 7 | Roles | NO — walked as the admin and as a member all the same (a member's has no "Default window" line). |
| 8 | The warning list | NO. |

**Tier: LOOK** — the gates, a before-and-after picture at phone and desktop. Done wider than a LOOK asks, because it is a
pop-up and the order's §6 wants a floating surface proved by what a finger meets: three phone heights, a phone on its
side, a desktop; both roles; pressed, not only pictured. No model read (none is required at this tier). The sizing step
and the walk ledger are for WALK and FULL changes (§7.0); no ledger row.

## 3. The fix

One rule in `src/ui/scheduler/06-inputs.css`: on a phone the row of buttons is the box the calendar is placed against, so
"under the row" means under the row. Nothing else changed — no script, no markup, no size of any button (D487).

**Red first.** `e2e/inputs-calendar.spec.ts` — "a phone N tall, the List: the dates button opens its calendar on screen,
under its row; a finger picks two dates and "All dates" on it", at 844, 667 and 568 tall. Each asserts the page was NOT
scrolled, the whole calendar is inside the screen and within 12 points of the row, a date is what a finger at its centre
meets, and then presses by a finger AT A POINT (`touchscreen.tap(x, y)`), never a locator's tap. Before the fix: 3 failed
(the calendar 641, 464 and 365 points below the row). After: 3 passed.

## 4. The walk on the fixed build (`scripts/handpass/rng-repro.mjs after`)

| Size | Admin (Saber) | Member (Ranger) | Pictures (`after/`) |
|---|---|---|---|
| Phone 390 × 844, by touch | PASS × 3 — opens under the row (top at 214), two dates picked, "All dates" pressed and it closes | PASS × 3 (top at 266 — his list opens on himself, the filter line above) | `phone-390x844-ad-open.png`, `…-us-open.png`, `-picked`, `-all` |
| Phone 320 × 568, by touch | PASS × 3 — the whole calendar inside the screen (foot at 553 of 568) | PASS × 3 (foot at 558) | `phone-320x568-*` |
| Desktop 1440 × 900 | PASS × 3 — unchanged: under its own button | PASS × 3 | `desktop-1440x900-*` |
| Phone on its side, 844 × 390 | FILED — see §5 | FILED — see §5 | `phone-side-844x390-*` |

Before the fix the same script: 7 FAIL (every upright phone, both roles — `before/`). `before/phone-390x844-ad-open.png`
is his own picture, reproduced. Errors in the browser during both runs: none.

**Opened and looked at (anti-pattern 21):** `before/phone-390x844-ad-open.png`, `after/phone-390x844-ad-open.png`,
`after/phone-side-844x390-us-picked.png`.

## 5. Found, not fixed — filed

- **A phone on its side** shows the desktop layout on a 390-tall screen: the calendar opens under its button and runs
  past the foot of the screen; and for a member whose list is empty the scripted press on "All dates" could not reach
  it at all. Older than this find, the same before and after the fix. With the other sideways-phone looks — his, with
  pictures: `OUTSTANDING.md` `[SEEN-BATCH-2]` list C.
- **The calendar's days are small for a finger** (about 28 × 23 points) and it fills half the pop-up's width. D725 made
  the days of the calendar in an input's WINDOW a finger's size; this one was not part of it, and no button's size
  changes without his word (D487). Put to him with a picture: `[SEEN-BATCH-2]` B11; the page `docs/mock/batch2-choices.html`.

## 6. The gates

On the fix's code, the whole set under the PC's lock — the counts are in `HANDOFF.md` §Gate baseline and this chat's
block. The e2e count rises by three (the new test at three heights).

## 7. His look

On his iPhone, the branch's preview link: Inputs → List → tap the dates button. The calendar opens under the row of
buttons; tap a start and an end date; the list follows; "All dates" closes it.

`Walk: docs/handpass/2026-10-10-list-dates-picker.md · 48 pictures · 1 surface (the List's dates calendar) at 4 sizes, 2 roles · 3 orders (open · pick two dates · All dates) · MISSING: none — two older finds filed`
