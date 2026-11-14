# Evidence sheet — [LW-BIDPICKER-CSS-INSIDE] (14 Nov 26, chat 72's night, job 1)

**The change:** the bid sheet's 202 styling rules moved inside the Leave War page's wrapper; nothing a person sees should change. **Tier: WALK.**
Walked on the built bundle of `claude/lw-bidpicker-css-1114b`, served on port 4294, by `scripts/handpass/lw-bidpicker-css-walk.mjs` (Chromium, clock set to Wed 4 Nov 26 and left running). Desktop 1536x864 and phone 402x874 (touch, scale 1), admin (Saber) and member (Ranger). Pictures: `docs/img/handpass/2026-11-14-bidpicker-css/walk/` (`d-NN-*` desktop, `p-NN-*` phone, `*-mem-*` member; `*-justtapped` = a picture about 60 ms after the tap; `walk-log.json` holds every step's reading). Every step also reads whether any button looks browser-default (grey face, Times font) and whether the window sits inside the screen; none did.

## Steps

| # | Step | Pictures (desktop / phone) | Result |
|---|---|---|---|
| 1 | Free day: window opens; Whole day / AM / PM; remark typed; Auto-approve off and on; the ⋯ menu open and closed; Pick a range (calendar); ✕ | d-01…d-12 / p-01…p-17 | PASS |
| 1 | Grant OIL (HO · 0.5, FO · 1, "other" box typed 1.5); CSE; OD; LL with auto-approve off (pending) | d-13…d-17 / p-18…p-26 | PASS |
| 2 | Pending leave window: Refuse (window closes), reopened with "Refused" lit, Refuse pressed again (back to pending), Move, Approve, approved window, Document row, Delete | d-18…d-28 / p-27…p-42 | PASS |
| 2 | "Delete — sure?" in the one-day window | d-29 / p-43 | not reached in Part 1; walked in Part 2 over an award day (PASS) |
| 3 | Two entries on a day: the day's list, Refuse on a row, Delete chip | d-30…d-32 / p-44…p-47 | PASS (the armed words were not read from the chip; not seen) |
| 4 | Drag across 4 days: the drag window, its leave button | d-33, d-34 / p-48…p-50 | PASS |
| 5 | Settings (groups, Rearrange the grid, Reset order); Rearrange mode; a counter row opens the counter's window (name, amber/red boxes, Save, Edit counter…); Events list; its ✕ armed "Delete — sure?"; Calendar… | d-35…d-41 / p-51…p-60 | PASS |
| 6 | Open for bidding window, a month button, a stretch's calendar icon | d-42…d-44 / p-61…p-64 | PASS |
| 7 | Balances tab, Grades window, a name opens the person window, Approvals tab, Refuse on a line, Approve all armed (amber "tap again") | d-45…d-50 / p-65…p-75 | PASS |
| 8 | Desktop: hover on AM, LL, OL, Grant OIL, ⋯; Tab through the bid window | d-51…d-63 | PASS (see observation 1) |
| M | Member: bid window on his own row, AM, remark, ⋯, a closed day's window, his own approved leave's window (Move, Delete, Remarks, Document), Open for bidding window | d-01-mem…d-07-mem / p-01-mem…p-10-mem | PASS |

I opened about 40 of the pictures myself, both sizes: bid window (empty, pending, refused, approved, award, range calendar, ⋯ menu), day's list, drag window, Settings, counter window, Events with armed ✕, Open for bidding with a stretch calendar, Grades, person window, Approvals with Approve all armed, hover, focus rings, and the member's three windows. Buttons, fields, switches, chips and calendars carry the app's look everywhere; nothing is cut off, overlapping, unstyled or wrongly coloured.

## Findings

None.

## Observations (not findings)

1. Tab order: the first stops were the Remarks box (no ring; the box's own light edge), the "till <date>" tick (a native checkbox with the browser's own thin focus mark, hardly visible: `d-58-tab-2-bidtill.png`), then the buttons with the app's cyan ring (`d-59-tab-3-BUTTON.png`, `d-60…d-62`). I did not compare this tick against the build before the change, so I cannot say whether it is new; a style move cannot add a native mark, so it is probably as it always was. To check against `main` if wanted.
2. Over a plain war leave Delete deletes at once; "Delete — sure?" appears for a day holding an OIL award (the code asks only then), and in the Events list (seen: `d-40-events-armed.png`).

## Console and page errors

None: no page errors, no console errors, no 4xx/5xx responses, across all four worlds (desktop and phone, admin and member).

## Part 2 — the counter's full form and the armed Delete (script `scripts/handpass/lw-bidpicker-css-walk2.mjs`; pictures `walk/d2-*` desktop, `walk/p2-*` phone; log `walk2-log.json`)

| # | Step | Pictures (desktop / phone) | Result |
|---|---|---|---|
| 1 | Rearrange, a counter (IWSO), "Edit counter…": the form at rest (Name, Count People / Sets-teams, Crew, Cat with the is / is-not toggle, Holding, Without, Amber / Red below, Save counter, Cancel, Delete counter) | d2-01 / p2-01 | PASS |
| 1 | Sets / teams mode (slots, "of…", ✕), back to People, Amber and Red boxes typed, an amber below red, amber put back, Save counter, reopened, Delete counter (reads "Really delete?"), Cancel | d2-02…d2-14 / p2-02…p2-18 | PASS |
| 1b | "+ Counter" from Settings: a new counter's form, name typed, Sets / teams, a second slot added (the slot list stands full height), People, Save with nothing chosen | d2-01…d2-06 (`newcounter`) / p2-01…p2-11 | PASS |
| 2 | One-day window over a day holding an OIL award (Grant OIL, Give FO, day reopened): Delete pressed once, armed: "Delete — / sure?" on two lines inside its dashed edge, with the amber line "Delete also takes Ridge's OIL award (1 day) — tap Delete again to go ahead." | d2-01-award-day, d2-02-delete-armed / p2-01-award-day, p2-02, p2-03-delete-armed | PASS |
| 2 | Day with two entries (AM LL, PM OL), Delete once | d2-03 / p2-04 | the window that opened was the one-day window (the second placement replaced the first); Delete took the entry at once, no armed state: see Not reached |

I opened these pictures: both sizes of the form at rest, Sets / teams, the slot list, the Really-delete state, the armed Delete, the new counter's form. Every button, chip, box and row carries the app's look; nothing cut off or overlapping; the long Sets / teams form stands full height on the phone, as built. The script's unstyled-control check found nothing. No finding; no console or page errors (none in either part).

Observation 3: the counter form's Name box is a lighter grey than the dark boxes beside it (Amber, Red). The same box shows in the Required-row rename window of Part 1 (`d-33`, first run). The change moved no rule for it (`.namein` only sets its width), and the capture script's computed-style comparison is what shows whether it differs from before; I did not compare it myself.

## Fix round — the fresh Opus read's finding 1 (14 Nov 26)

**The finding** (`docs/superpowers/briefs/2026-11-14-bidpicker-css-read-opus.md`; Astra found nothing, `…-read-astra.md`): in the one-day window over a day holding one OIL credit — an award given by hand, or a credit the published schedule earned — the credit's detail rows (Reason, Given by, Entered by, Days) lost 8px of space above each. The moved rule that sets those rows' 2px top padding now carries the wrapper's weight, ties the window's own 10px rule for those rows and, coming later, wins. None of the 78 captures at the build (39 states, both sizes) reached those rows; Part 2 step 2 above pictured the window over an award (`d2-01-award-day`) but had no before picture to set it against.

**Red first:** two states added to the capture script — `oil-detail-award` (Ridge's day, Grant OIL → Give FO, the day tapped again) and `oil-detail-sched` (Cinder's Sat 4 Jul 2026, the demo's one day the schedule earned, with a 3-day award behind it). Captured on the build before the change (main's stylesheet) and on the unfixed build: `docs/img/handpass/2026-11-14-bidpicker-css/diff-old2-vs-red.txt` is not empty — at both sizes and in both states, each of the four detail rows' top padding 10px → 2px (each row 29.7 → 21.7px tall), the detail block 139.7 → 107.7px, the window 32px shorter (448.7 → 416.7px).

**The fix:** the rule keeps its bottom padding (2px) at full weight; its top padding moves to a rule of its own lowered with `:where()`, so the window's 10px wins again, as it always did. A one-line MOVED INSIDE note above it names the winning rule. The day's list rows that rule also covers have no other top padding and keep their 2px.

**Green:** all 82 captures (41 states, desktop and phone) on the fixed build against the build before the change — 10,342 elements, none failed: `diff-old2-vs-green.txt` reads "EMPTY — no computed style differs". The cascade simulation run again over the two new states found only this pairing and the `.tchip` border one already handled at the build; no other OIL-detail or posted-out row pairing can be reached. The raw captures and dumps are kept outside the repo, at `C:/Users/User/raptor-night-1114/bidpicker-css/fix-round/`.

| Picture | Before the change | Unfixed (the finding) | After the fix |
|---|---|---|---|
| Desktop, award | `walk/fix-desk-oil-award-before.png` | `…-unfixed.png` | `…-after.png` |
| Phone, award | `walk/fix-phone-oil-award-before.png` | `…-unfixed.png` | `…-after.png` |
| Desktop, schedule credit | `walk/fix-desk-oil-sched-before.png` | `…-unfixed.png` | `…-after.png` |
| Phone, schedule credit | `walk/fix-phone-oil-sched-before.png` | `…-unfixed.png` | `…-after.png` |

I opened the desktop award (before, unfixed) and the phone schedule-credit (unfixed, after) pictures: unfixed, the four rows sit tight and the window stands 32px lower; after the fix the window matches the before picture.

## Not reached

- A day's list showing an armed Delete. A list's Delete took a plain bid at once (one press, the entry gone), so the armed words appear only where an OIL award is involved. The armed state is pictured in the one-day window (`d2-02-delete-armed.png`, `p2-03-delete-armed.png`) and in the Events list (`d-40-events-armed.png`). The list over a day holding an award AND a bid was not tried.
- A Tab ring on the phone (a touch screen has none).
- Not compared picture by picture with the build before the change; the computed-style comparison is the capture script's job (`lw-bidpicker-css-capture.mjs`).

Walk: docs/handpass/2026-11-14-bidpicker-css.md · 223 pictures · 16 surfaces (one-day bid window, ⋯ menu, range calendar, Grant OIL, armed Delete over an award, decision rows, day's list, drag window, Settings, Rearrange and counter window, counter form incl. + Counter, Events list, Open for bidding, Balances/Grades/person window, Approvals, member's windows, the bid window's OIL detail rows — award and schedule credit, fix round) · MISSING: the day's list's armed Delete (a list over a day holding an award and a bid)
