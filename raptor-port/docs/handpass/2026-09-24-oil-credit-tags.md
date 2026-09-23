# The OIL tracker's credit boxes read in full — WALK-tier evidence sheet (24 Sep 26)

Branch `claude/oil-credit-tags` (from `main` at `41120f78`). **Found recording the commanders' demo video**
(the separate demo chat): on Fable's new automatic credit the two small words beside "+1 18 Jul" came out
**"AU… Weeken…"** instead of **"AUTO"** and **"Weekend/PH"**, and the tracker's − / + zoom could not help —
the words grow with the box. Pictures: `docs/img/handpass/2026-09-24-oil-credit-tags/`. Walk driver:
`scripts/handpass/oil-credit-tags.mjs` (its own log beside the pictures: `after-walk.txt`).

## 1. The eight questions → WALK

| # | Question | Answer |
|---|---|---|
| 1 | Money / earned leave / manning | **NO** — only how a credit's words sit in its box; no figure, no balance, no count is read or written differently |
| 2 | The published record | **NO** — nothing about publishing changes (the walk publishes a Saturday only to make an automatic credit) |
| 3 | Saved data | **NO** — a stylesheet change; nothing stored |
| 4 | A shared drawer | **YES** — one stylesheet rule draws the top line of EVERY kind of credit box (automatic, award, a credit given here, carried in, correction, a day taken with nothing to cover it) |
| 5 | A gesture / mode | **NO** |
| 6 | A surface | **NO** |
| 7 | Roles | **NO** — admin and member see the same box; only the admin's award reason is a button (walked both) |
| 8 | Rules / the warning list | **NO** |

WALK because of 4. **Fable / Astra not called** (order §4: a one-surface cosmetic change, no layering or
tap-target risk — the missing evidence was the running app, and it was driven).

## 2. Cause and fix

Every word on a box's top line was held to ONE line and cut with "…" at 60% of the box
(`oiltracker.css`, `.oil-e .l1 .by`). An automatic credit carries TWO labels there since 21 Sep 26 —
"Auto" (his 2 Sep ask: *"if auto credited put Auto"*) and the giver "Weekend/PH" / "Duty input" (his
21 Sep ask, `[LW-OIL-DETAIL]`) — and the pair needs ~150px beside "+1 18 Jul" in a 150px box. The phone
already let the line wrap, so on a phone the two read; the desktop did not.

**The walk then found the same fault one line down** — the reason line was also one line with "…", and
what it cut was the app's OWN words after a reason: the demo's correction lost **"· correction"**,
Outlaw's uncovered opening figure **"· not covered"**, and Cinder's award **"· 3 days"** (on both widths).

**Fix, one file** (`src/leavewar/ui/oiltracker.css`): the top line wraps — amount and date stay on the
left, the labels stay on the right, and a label that does not fit moves under them, still right-aligned;
a giver up to the 40-character limit wraps its own words. The reason line and an award's reason button
wrap too, with "· 3 days" / the work hours moving down whole. **Both words are kept** — both are his asks;
the price is one line more on a box that carries both (Fable's row 61 → 75px at zoom 1, measured off the before/after pictures), and the row grows to its tallest box, as it
already did for a credit with several takes. The zoom scales all of it together, so the layout is the
same at every step. Rule recorded in `docs/ui-contracts.md` (after the tracker's zoom paragraph).

## 3. The roll-call — every place a credit's words are drawn

| Where | The labels / reason | Has it? |
|---|---|---|
| Tracker — automatic credit, giver "Weekend/PH" | Auto + Weekend/PH | **has it** — walked both widths, 5 zooms (Fable 18 Jul, published through the sign-off selects) |
| Tracker — automatic credit, giver "Duty input" | Auto + Duty input | **has it, NOT walked, because** making one needs a published day carrying an accepted duty input and the fresh demo has none (§7). Same label, same rule, shorter text than "Weekend/PH" |
| Tracker — a credit given here, short giver | "OC Ops" | **has it** — unchanged look: fits the top line, stays there (Drifter 14 Mar) |
| Tracker — a credit given here, 40-character giver | the longest giver | **has it** — wraps to two lines, right-aligned (made through the credit bar) |
| Tracker — a credit given here, no giver | none | **has it** — top line is amount + date only (Wolf, made through the bar) |
| Tracker — award with a giver and days | "OC Ops" + "Exercise recovery · 3 days" | **has it** — was cut on both widths before; now whole (Cinder 4 Jul) |
| Tracker — award, no reason yet | "+ reason" button | **has it** (Drifter 3 Jan) |
| Tracker — carried in (opening figure) | "carried in" / "opening figure" | **has it** — fits; unchanged |
| Tracker — a negative opening, not covered | "opening figure · not covered" | **has it** — was cut; now whole (Outlaw) |
| Tracker — a correction | "Correction: double credit · correction" | **has it** — was cut; now whole (Blade 20 May) |
| Tracker — a day taken with nothing to cover it | "taken · not covered" | **has it** — fits |
| Tracker — used up (archive open) | struck amount / date / reason | **has it** — walked with the archive open |
| Tracker — expired (policy 6 months) | "expired 4 Jul" | **has it** — walked (Hunter; 8 expired boxes) |
| Tracker — the in-place editors (a grant; an award's reason) | the editor's fields | **must not** change — they draw their own rows and are untouched; walked, pictured |
| Tracker — member view | same boxes, reason as plain text | **has it** — walked (50 rows, 33 boxes, 0 buttons, nothing cut) |
| The day window on the grid (tap Fable's 18 Jul) | REASON / GIVEN BY / DAYS | **must not** change — its own labelled rows, never cut; seen reading "GIVEN BY Weekend/PH" |
| The tap list, the read-only sheet | "Given by" row | **must not** change — the same labelled rows as the day window; not touched by this stylesheet |

## 4. Orders walked

Not a gesture, so "orders" are the states a box can be seen in: each zoom step from 0.6 to 1.4 in turn, on
a fresh demo with Saturday 18 Jul published, at desktop 1440×900 and phone (iPhone 13); archive shut and
open; expiry off and 6 months; admin and member.

| Measure (after the fix) | Desktop | Phone |
|---|---|---|
| Words cut anywhere on any box, zoom 0.6 / 0.8 / 1 / 1.2 / 1.4 | none / none / none / none / none | none / none / none / none / none |
| Fable's box (w × h) at 0.6 → 1.4 | 90×44 → 210×101 | 79×44 → 185×101 |
| "Auto" top right, "Weekend/PH" under it, right | yes, every step | yes, every step |
| Archive open · expiry on · member view | nothing cut | nothing cut |
| Page scrolls sideways | no | no |
| Console / page errors, failed requests | none | none |
| **Before the fix** (the red test runs, §5) | "Auto", "Weekend/PH", the long giver, the correction, Outlaw, Cinder — all cut | the long giver, the correction, Outlaw, Cinder — cut ("Auto" / "Weekend/PH" already wrapped) |

## 5. The test, red first, and the break tests

`e2e/leavewar.spec.ts` → **"every label and reason on an OIL credit box reads in full, at every zoom
step"** (both Leave War projects). It publishes Saturday 18 Jul, gives Drifter a credit with a 40-character
giver and a 120-character reason through the credit bar, then at every zoom step asserts: no word on any
box is cut or pokes out of its box; the amount starts the top line at the left; every label ends at the
right; an award's "· 3 days" is on one line.

- **Red on the old code**: desktop — "Auto", "Weekend/PH", the long giver; phone — the long giver (the phone
  already wrapped the pair). Widened to the reason line: red on the correction, Outlaw, Cinder and the long
  reason, both widths.
- **Break tests** — each piece of the fix undone on its own, rebuilt, test run: every one **red on both
  widths**, for its own reason.

| # | Undone | Went red on |
|---|---|---|
| B1 | the top line wraps | "Auto" not at the right (runs out of the box) |
| B2 | a giver wraps its words | the 40-character giver cut |
| B3 | the date holds line one apart | the amount not at the left |
| B4 | a labels-only line right-aligns | "Weekend/PH" not at the right |
| B5 | the reason line wraps | the 120-character reason cut |
| B6 | the award's reason button wraps | "Exercise recovery · 3 days" cut |
| B7 | "· 3 days" moves down whole | "· 3 days" split over two lines |

## 6. Found on the way — not this change's

| # | Finding | Disposition |
|---|---|---|
| W1 | A reload (a second sign-in) on a fresh demo world that nobody has written to brings the Leave War back **without its OIL story**: opening figures, awards and credits given here are gone, the days taken stay, so rows read "taken · not covered". Measured: once a credit had been given in the tracker, a reload kept everything (the demo story and the new credit). | **Not a finding (D56)** — it lives only in the demo seeding, which the database step removes, and real writes persist. **Told to him because it matters for the demo recording**: publish or give one credit before any reload. Test trap logged, skill-observations #225 |
| W2 | The demo seed's comment said Cinder's 4 Jul is "worth FOUR"; a fresh boot shows three — the duty input earns only from a published day | **fixed** — comment corrected (`state/demoworld.ts`); no behaviour change |
| W3 | Dash's award is dated 15 Aug and Vector's 29 Aug — after the schedule's demo week (13–19 Jul); the tracker itself counts to today's real date | **put to him** — is that intended? (the demo chat read Vector's as 20 Aug; the seed says 29 Aug) |

## 7. NOT walked, and why

- **An automatic credit from a DUTY INPUT** ("Duty input" giver) — needs a published day carrying an accepted
  duty input; the fresh demo has none and building one is a long detour for a label that is the same
  element as "Weekend/PH" with shorter text. The 40-character giver proves the wrap.
- **A real iPhone** — Chromium with iPhone 13 emulation. His look is the device check.
- **Pictures of every zoom step on the phone** — the measurements cover all five; the pictures are the
  default step plus the two ends. At 1.4 on a phone a box is wider than the strip the credits show in, so
  its right edge sits past the screen until the grid is scrolled sideways — as before this change; the
  measurement is inside the box, where nothing is cut.

## 8. Gates

Run 24 Sep 26 on this branch, once, one at a time on a quiet PC (D86, D125; own ports 4192–4194): unit **5819 / 5819** (358 files) ·
build clean · tfin **728 / 0** · e2e **469 passed**, 48 skipped (the new test included, both Leave War projects) · smoke
**442 / 0** · rulecheck OK · docsize OK (`OVER by 93, deferred (D29)` — OUTSTANDING and DECISIONS, not touched here).
The final walk re-ran on the same finished build: nothing cut, no errors, both widths.

## 9. His look (on the branch's Vercel preview)

**DONE by him before "merge live" (D156, 24 Sep 26):** *"I've looked, merge"*.

1. Edit Schedule → Saturday 18 Jul → sign the four boxes → Publish day.
2. Leave War → ◷ OIL tracker → Fable's box reads **AUTO**, and **Weekend/PH** under it on the right. Nothing ends in "…".
3. Press − until it stops, then + until it stops → still whole at every step.
4. Blade's red box reads "Correction: double credit · correction"; Cinder's award reads "Exercise recovery · 3 days".

`Walk: docs/handpass/2026-09-24-oil-credit-tags.md · 22 pictures · 17 surfaces · 5 zoom steps × 2 widths · MISSING: 0 (W1 not a finding under D56; W2 fixed; W3 asked)`
