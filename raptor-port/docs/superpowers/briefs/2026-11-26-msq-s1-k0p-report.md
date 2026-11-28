# Section 1 (the guard rail) — the presser's report: K2a beside its drawings, and K0's presses (26 Nov 26)

Brief: `2026-11-26-msq-s1-k0p-brief.md`. Built app (this branch's `npm run build`), served by `vite preview` on port 4741,
driven by scripted Playwright. Desktop: Chromium 1536 × 864. Phone: WebKit 390 × 844 with touch. Both at twice the
sharpness. Every picture named below was opened and looked at. Pictures: `raptor-port/docs/img/handpass/2026-11-26-msq-s1-k0p/`.
Scripts: `raptor-port/scripts/handpass/n194/` (`k0p-lib.mjs`, `k0p-world.mjs`, `k0p-f-windows.mjs`, `k0p-p1-add.mjs`,
`k0p-p1-measure.mjs` + `k0p-p1-scans.json`, `k0p-p1-keys.mjs`, `k0p-a-lull.mjs`, `k0p-b-settings.mjs`, `k0p-cde.mjs`,
probes `k0p-lw-probe.mjs`, `k0p-e-probe.mjs`). Nothing under `raptor-port/src` or `raptor-port/e2e` was changed. Nothing committed.

**The lock and the preview:** the checks lock was taken before the build ("gatelock: taken") and released after the last
picture ("gatelock: released"); the preview on port 4741 was stopped by its port (PowerShell `Get-NetTCPConnection` →
`Stop-Process`), and the port was then confirmed free.

**Console and page errors:** none on any step of any run (every page error, console error and 4xx response was
collected — all lists empty). One `beforeunload` question came up in item E when the tab was reloaded with an
unsaved change (expected; the script accepted it).

## The world

The n191 / n176 world scripts serve port 4700 and use Add a person's Home squadron box, which K2a removed (his D2729 Q1).
So the world was made again here by the app's own controls (`k0p-world.mjs`), Saber signed in on a desktop:
Admin → Squadrons → + New squadron 150 (Place: first in the list; First admin: Kestrel · 149 — the form offered
"Hunter · 142" and "Kestrel · 149"); 142's Ace archived; 150 picked → Admin → Users → + Add a person: Mako (Pilot,
CAT B, sign-in `mako`, Admin), Jackal (WSO, C), Onyx (Pilot, IP), Ace (Pilot, B), then Ace archived; Kestrel's
"Access to 150" → None; 142 picked; Hunter → Plan of 149, View of 150. Read back: 142 resting, 149 has 10 own people
plus "Hunter · 142" (his Plan), 150 shows Jackal, Mako, Onyx (Ace archived). For Part 2 F, Saber also gave Ranger an
OIL award (Leave War, Ranger's cell Mon 5 Jan 26 → "+OIL", Reason "Weekend duty cover", 1 day) and opened December 2026
for bidding (the "Bidding closed" chip → December's month button).

---

## Part 2 F — the five Leave War windows (done first; for the owner)

Each opened as Ranger (member), cut to the window, the window's top row ringed in teal, nothing else marked.
**Note on "the title":** the names the owner was given ("Leave filed on the Inputs page", "Your OIL award", a person's
"<name>'s leave", "OIL tracker") are the windows' spoken names for a screen reader — they are **not printed** on
windows 1, 2 and 4. What a person sees at the top is the man's name, the day and the code. So the ring is on that top row.
On windows 3 and 5 the printed top row does carry the name ("Open for bidding", "OIL TRACKER").

| # | Window | How opened | Desktop picture | Phone picture | What it shows |
|---|---|---|---|---|---|
| 1 | Leave filed on the Inputs page | Another man's leave filed on the Inputs page: Quill's cell, Tue 14 Jul 26 (Ranger's own Inputs-filed leave opens a different window, "Edit the note on this leave"; Outlaw's Thu 5 Feb opens a day list because an award shares the day) | `f1-inputs-leave-d-crop.png` | `f1-inputs-leave-p-crop.png` | "Quill · Tue 14 Jul · LL · APPROVED ✕"; one line: "INPUTS PAGE — Filed on the Inputs page, so it is already approved — change it there, not here." Nothing to press but ✕. |
| 2 | Your OIL award | Ranger's own award cell, Mon 5 Jan 26 (the award Saber gave, above) | `f2-award-d-crop.png` | `f2-award-p-crop.png` | "Ranger · Mon 5 Jan · FO · OIL AWARD ✕"; Where it came from: "Given by an admin — only an admin can change it."; Reason "Weekend duty cover", Given by "Not given", Entered by "Saber", Days "a day". Nothing to press but ✕. |
| 3 | Open for bidding (member) | The chip above the grid ("Open for bidding 1 Dec – 31 Dec" on a desktop, "Open 1 Dec – 31 Dec" on a phone) | `f3-open-bidding-d-crop.png` | `f3-open-bidding-p-crop.png` | "Open for bidding · JAN - DEC 26 ✕"; twelve month buttons, Jan–Oct locked, Nov plain, Dec lit green; one line "1 Dec – 31 Dec · 31 days". On the phone it is a full-screen page; on a desktop a window over the grid. |
| 4 | A person's window — another man's | The name Drifter on the grid | `f4-person-other-d-crop.png` | `f4-person-other-p-crop.png` | "Drifter ✕"; Balances (LVE: 0 taken, App bal 24, Pending –, War bal 24, incl. 2 carried fwd till 31 Dec; OIL 4 ›; MED 0 days; CCL 5, FCL 0, PL 0, EL 0, CL 0); Leave list for "2026 and ahead" (a year chooser) with five lines. |
| 5 | OIL TRACKER (member) | The OIL tab's "OIL tracker" button | `f5-oil-tracker-d-crop.png` | `f5-oil-tracker-p-crop.png` | Full screen: "OIL TRACKER — one row per person ✕" (phone: "OIL TRACKER ✕"); Show "From first entry", Range, "?"; a row a person with balance and credits. No settings gear (a member's view). Ranger's row shows "+1 5 Jan Weekend duty cover, 1 left". |

Where the phone looks different: 3 and 5 fill the phone screen; 1, 2 and 4 stand at the foot or middle as cards.
**To check (not a finding yet):** in WebKit at the phone size, window 4's figures ("24", "0 taken", "5", "2026 and ahead",
"till 31 Dec") are drawn in a serif font (Times-like), while the desktop (Chromium) draws them in the app's sans font
(`f4-person-other-p-crop.png` against `-d-crop.png`). This test WebKit runs on Windows, not his iPhone, and the app loads
no fonts, so it may be this browser's fallback only; it needs a look on his iPhone before it is called a fault.

---

## Part 1 — "+ Add a person" on Admin → Users, beside its drawings

Signed in as Hunter, 149 picked (as the drawings s1-add2-a drew him). Drawings: `docs/mock/2026-11-25-msq-pick-guard-q3/drawn/`.

### The four side-by-side pictures (drawing left, build right)
- closed, desktop: `p1-side-closed-d.png` (drawing `s3-8-d-column-crop.png` — that drawing is Saber on 142 with
  another section's left column; only its top row is compared)
- closed, phone: `p1-side-closed-p.png` (drawing `s2-10-p-waiting-crop.png` — its People/Outgoing/Incoming/Others
  jumps are another section's)
- open, desktop: `p1-side-open-d.png` (drawing `s1-add2-a-d-crop.png`)
- open, phone: `p1-side-open-p.png` (drawing `s1-add2-a-p-crop.png`)

### Every difference over about 2px, measured
Measured on the pictures' own pixels (edge scans, `k0p-p1-measure.mjs`; 2 picture pixels = 1 screen point), each image
lined up on the search box's top-left corner. Figures are screen points.

**Phone width caveat:** the phone drawings were drawn at 402 wide (the drawers' phone size); this walk's phone is the
brief's 390. Every phone width difference below that equals 12 points comes from that, not from the build.

| Picture | Part | Drawing | Build | Difference |
|---|---|---|---|---|
| closed, desktop | search box | 377 wide, 35 tall | 377 wide, 35 tall | none |
| closed, desktop | Filter | 76 wide, 8 from search | 76 wide, 8 from search | none |
| closed, desktop | + Add a person | 112 wide, 8 from Filter, same top and height | 112 wide, 8 from Filter, same top and height | none |
| closed, desktop | "WAITING FOR ACCESS" below the row | text top 24.5 below the search box's foot | 18.5 below | build 6 pt nearer the row (that drawing is another section's page; the K2a open drawing does not show this part) |
| closed, phone | search box | 241.5 wide | 229.5 wide | 12 narrower — phone width (402 vs 390) |
| closed, phone | Filter | 76.5 wide | 76.5 wide | none |
| closed, phone | + Add a person | full width (327), 35 tall | full width (315), 35 tall | 12 narrower — phone width |
| closed, phone | button to "WAITING FOR ACCESS" | text top ~23.5 below the button | ~17.5 below | build 6 pt nearer (same as desktop) |
| open, desktop | search row and Filter | — | — | none (every edge within 0–1 px) |
| open, desktop | "ADD A PERSON" heading | — | — | build 2 pt lower |
| open, desktop | the six fields (Callsign/Name, Initials, Pilot/WSO/Personnel, CAT, Sign-in, Post in) | — | — | each 2 pt lower (the same 2 pt as the heading); widths and left/right edges identical |
| open, desktop | the note "Makes his Quals row…" | 29.5 below the Sign-in box | 19.5 below | build 10 pt nearer the fields |
| open, desktop | Add person · Cancel | — | — | 8 pt higher in the build (the 2 pt + the 10 pt); their size, gap (6) and left edge identical: Add person 93 × 28, Cancel 64 × 28 |
| open, phone | heading and fields | — | — | each 2 pt lower; each field 6 narrower — phone width |
| open, phone | the note | 31 below the Sign-in box | 21 below | build 10 pt nearer the fields |
| open, phone | Add person · Cancel | — | — | 8 pt higher; same sizes and gap |

No difference in colour or text alignment was found: the heading, labels, boxes and the pair read the same in both
(heading look below).

### 1. The top row
`p1-1-closed-d-crop.png`, `p1-1-closed-p-crop.png`.
- Desktop: search left 607, top 136, 378.1 × 36; Filter left 993.1, top 136, 77.3 × 36; "+ Add a person" left 1078.4,
  top 136, 112.6 × 36. All three 36 tall, tops and feet on one line (136 / 172); gaps 8 and 8. **Pass.**
- Phone: search left 37, top 135, 230.7 × 36; Filter left 275.7, top 135, 77.3 × 36 — one row. "+ Add a person" left
  37, top 179, 316 × 36 — the full width of the row (37 to 353), 8 under it. **Pass.**

### 2. Opening the form
`p1-2-open-d-crop.png`, `p1-2-open-p-crop.png`.
- The opener is gone once the form is open (no "+ Add a person" on the page), desktop and phone. **Pass.**
- Search width, desktop: 378.1 before, 498.7 after — it grew by 120.6 = the opener's 112.6 + its 8 gap; Filter moved
  to 1113.7, its right edge where the opener's was (1191). **Pass.** Phone: 230.7 before and after — on the phone the
  opener sat under the row, so there is no place to widen into (as drawn).
- "ADD A PERSON" against "WAITING FOR ACCESS": both 10.5 px, weight 800, colour rgb(182, 192, 203), letter spacing
  1.47 px, capitals, the same font — identical. **Pass.**
- Where the keys go on opening: desktop — into Callsign/Name (with its focus ring); phone — nowhere (the page body),
  so the phone's keyboard does not jump up on its own.

### 3. "Add person" · "Cancel" beside an opened row's Save · Cancel
`p1-3-addpair-d-crop.png`, `p1-3-rowpair-d-crop.png` (and `-p`).
- Add pair, desktop: Add person 92.7 × 28, Cancel 65.4 × 28, both 12 px / 600, padding 6 × 12, corner 9, gap 6, one line (top 417.5).
- Osprey's opened row: Save 54 × 28, Cancel 65.4 × 28, the same type, padding, corner and colours; its buttons
  (Save · Suspend · Archive · Delete · Cancel) 6 apart on one line. Same height, same gap, one line. **Pass.**
- Phone: the add pair stays side by side (top 408, both 28). The opened row's five buttons wrap at 390 wide (Save on
  one line, Cancel 34 lower) — that row has five buttons, so it is not a like-for-like pair; noted only.

### 4. Cancel and Escape
- Cancel (mouse / finger): the form is gone, the opener back; reopened, the boxes are empty ("" callsign, "" initials).
  The keys are on "+ Add a person" (it is the focused element) but **no ring shows** after a mouse click or a tap —
  the browser shows the ring only after a key press (`p1-4-cancel-focus-d-crop.png`). That is normal browser behaviour,
  not a fault; with the keyboard (below) the ring shows.
- Escape with typing in the form ("Zulu"): the form gone, the opener back with the cyan ring, 2 px
  (`p1-4-escape-focus-d-crop.png`). Reopened: empty. **Pass.**
- Escape with the Post in calendar open (`p1-4-postin-cal-d-crop.png`): first Escape closed the calendar only — the form
  stayed with "Yank" still typed, the keys on the Post in box; the second Escape closed the form, keys back on
  "+ Add a person" with its ring. **Pass**, desktop and phone (on the phone the Escape key was sent from the test
  browser's keyboard).

### 5. Filter and the search while the form is open
`p1-5-filter-open-d-crop.png`, `p1-5-search-d-crop.png` (and `-p`).
- Callsign "Nova" typed, Filter opened: the Filter panel opens over the right half of the form (it covers Initials, CAT,
  Post in while it is open); closed by its own button: the form still open, "Nova" still typed. **Pass.**
- "osp" typed in the search: the list narrows to Osprey; the form still open, "Nova" still there. **Pass.**

### 6. Adding a person on 149 as Hunter
`p1-6-added-d-crop.png`, `p1-6-in-list-d-crop.png` (and `-p`).
- Callsign "Nova" (phone run: "Vega"), Pilot, CAT D → "Add person": the passing note "Nova added to the roster — set
  flight and quals on the Quals page" (today's words); he appears in 149's list; the heading reads "People · 11"; the
  form stays open with every box empty. **Pass.**
- No Home squadron box: Hunter on 149 and on 142, Saber on 142, 149 and 150 — the box is absent every time. **Pass.**

### 7. From Quals' "+ Add person"
`p1-7-from-quals-d-crop.png`. Saber, 142, Quals → "+ Add person": Admin → Users opened with the form open and the cursor
in Callsign/Name (its white focus ring drawn). **Pass.**

### 8. What stands under the open form
`p1-8-under-d-crop.png`, `p1-8-under-p-crop.png`. The form ends (desktop 467), then the page's separator line (1 px,
rgb(42, 49, 58), 18 below the form), then "WAITING FOR ACCESS" 15 below the line. The same on the phone. The drawing
does not show this part.

### 9. The phone with the keys up
`p1-9-tap-now-p.png`, `p1-9-keys-up-p.png`, `p1-9-keys-up-scrolled-p.png`. **A stand-in, not his iPhone:** the test
browser has no on-screen keyboard; after the tap on Callsign/Name the screen height was cut by an iPhone keyboard's 336
points (844 → 508), as a browser that shrinks for its keys does. His iPhone pans the screen instead, which this does not
play (walk-scripts §3). With the keys "up": Add person and Cancel sit at 457–485, inside the 508 left — on screen without
any scroll; the page did not move (scroll 0 before and after, the callsign box at the same place, the keys still in it).
So: reachable, nothing jumped — on this stand-in only.

---

## Part 2 A — the Tracker's two lull pop-ups (Saber, 142's Tracker, STUDENT A)

Pictures: `a-setlull-open-d.png`, `a-setlull-focus-on-sqn-d.png`, `a-setlull-enter-sqn-d.png`, `a-setlull-after-pick-d.png`,
`a-setlull-back-*`, `a-setlull-badge-*`, `a-setlull-bell-*`, and the same set `a-copylull-*`; phone `a-setlull-open-p.png`,
`a-copylull-open-p.png`.
- **The shade covers the whole screen, top bar included**, on both sizes: its box is 0,0 to 1536 × 864 (phone 390 × 844),
  and a press on the squadron button, the name badge or the bell lands on the shade. So a mouse or finger cannot reach them.
- **"Set lull period — STUDENT A"** (opened with "+ Set lull period", a first day picked: "Start 04/11/26 — now pick the
  last day."): Tab walks the pop-up's days, then leaves it — the chart's −, +, reset, then the page — and reaches the
  squadron button "142 TALON" on the 37th press. Enter opened the Schedules list (142 · 149 Full access · 150 Full
  access) **over the open pop-up**; the arrow keys to 149, Enter: **149 was picked**, the Tracker showed 149, the pop-up
  was gone and its half-picked period with it (nothing saved, no question). **Yes — a squadron can be picked while the
  pop-up is up, by the keys.**
- Shift+Tab: back through the pop-up's buttons, out into the Tracker's bar, and onto the name badge "Saber · Admin";
  Enter switched it to "Saber · Member" with the pop-up still open (`a-setlull-badge-enter-badge-d.png`). **Yes.**
- The bell: reached by Tab; Enter opened its list ("Nothing new", Show 142 · 149 · 150) over the pop-up. **Yes.**
- **"Copy STUDENT A's lull periods to"** (STUDENT B ticked, not copied): the same three — the keys reach the squadron
  button in 8 presses, the list opens, 149 is picked and the pop-up closes; the badge switches to member; the bell
  opens. And on opening, the keys stay on the page's "Copy to…" button — they never enter the pop-up — so Shift+Tab goes
  straight into the Info panel behind it. **Yes to all three.**

## Part 2 B — the Calendar over the settings windows (phone; desktop for comparison)

Pictures: `b-inputs-settings-changed-p.png`, `b-inputs-calendar-over-settings-p.png`, `b-sans-settings-changed-p.png`,
`b-sans-calendar-over-settings-p.png` (and `-d`).
- Inputs → gear → "Inputs calendar settings"; late cut-off 14 changed to 21, not saved; "Calendar…" pressed: on the phone
  the Calendar window (6,54 to 378 × 784) is drawn **over** the settings window and covers it entirely — the settings
  window is still there underneath, still holding 21, unsaved. **Pictured.**
- The SANS calendar's settings (its gear): cut-off 1 changed to 21, not saved; its "Calendar…" button free to press;
  pressed: **yes, the same** — the Calendar covers the SANS settings window entirely, which still holds 21.
- Desktop: the Calendar opens beside the settings window (left of it), not over it, for both.

## Part 2 C — Quals' Done with words left in "Add qualification"

Pictures: `c-1-typed-d-crop.png`, `c-2-edit-again-142-d-crop.png`, `c-3-edit-on-149-d-crop.png`. Saber, 142: Edit → Edit
quals → "LOW LEVEL" typed → Done (no Add): note "Quals saved", the box gone, no LOW LEVEL column. Edit → Edit quals again:
**the box reads "LOW LEVEL"**. Done; 149 picked (Quals follows the pick, bar "149 TALON"); Edit → Edit quals: **149's box
reads "LOW LEVEL"**. Fault confirmed as K0-C predicted: the words are kept, carried to the other squadron, and "Quals
saved" is said though nothing was added.

## Part 2 D — 150's "+ Input" Person list as Saber

Pictures: `d-1-input-window-d-crop.png`, `d-2-person-list-open-d-crop.png` (the list is the browser's own drop-down, which
a picture cannot catch open, so for the picture it was shown expanded in place — a drawing aid, the same entries).
Saber, 150 picked, Inputs → List → "+ Input": the Person list reads, top to bottom: **Saber (picked)**, Jackal, Mako, Onyx,
then a group "Posted out / archived": **Ace**. So it offers Saber himself (a 142 man, already chosen) and 150's archived
Ace. (Below the list: "Several people".)

## Part 2 E — a Retry that lands

Pictures: `e-1-not-saved-d-crop.png`, `e-2-retry-refused-d-crop.png`, `e-3-after-reload-d-crop.png`.
- Opened with `?savefail`, signed in as Saber, Edit Schedule, one change (the first day note, " K0P" typed): the band
  "⚠ Not saved · keep this page open · Retry" under the top bar. Undo's name: "Undo — a day note".
- Retry pressed: refused again, the band stays; Undo's name still "Undo — a day note".
- **A Retry that lands cannot be pressed as described.** The switch cannot be taken off inside the tab: the app fixes
  the refusing store when the tab opens (`storage/boot.ts`, "Retry is refused again while the switch is on; the link
  without it ends the test"), and the app's notes name no other way. The only way off is the link without it — a
  reload. Done: the browser asked to leave the page (accepted), the sign-in came back, and after signing in there was no
  band, no Retry, the change was lost (the note does not hold " K0P"), and Undo was greyed with the plain name "Undo".
  So what Undo names on top after a landed Retry could not be seen.

---

## Faults and leads, in order

1. **(A) Fault.** With either Tracker lull pop-up open, the keyboard leaves the pop-up and reaches the top bar behind the
   shade: a squadron can be picked (149 was), the member view switched and the bell opened, while the shade blocks the
   mouse and finger. The pick throws away the half-done lull silently.
2. **(C) Fault** (as K0-C read it): Quals' Done with "LOW LEVEL" left unadded keeps the words, says "Quals saved", and
   shows them again on Edit — on 149 too after a pick.
3. **(D) Fault** (as K0-C read it): 150's "+ Input" Person list offers Saber himself, of 142, at the top, picked.
4. **(Part 1) Differences from the approved drawing, small:** in the open form the note sits 10 pt nearer the fields
   and the pair 8 pt higher than drawn (desktop and phone); the heading and fields 2 pt lower. On the closed page the
   top row is exactly as drawn; "Waiting for access" sits 6 pt nearer the row than in the (other section's) drawings.
5. **(E) Not walkable:** a Retry that lands cannot be produced with `?savefail` in one tab.
6. **(F) To check:** the person window's figures drawn in a serif font in the phone test browser.

Everything else in Part 1 passed (one line, opener gone, search widens, heading look identical, pair matches the row's,
Cancel / Escape / the calendar's two Escapes, Filter and the search keep the typing, the add on 149, no Home squadron box
anywhere, Quals' door focuses the callsign, the separator under the form, the keys stand-in).
