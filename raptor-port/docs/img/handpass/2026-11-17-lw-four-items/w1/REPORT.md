# W1 — Balances and the hover ring: the walker's report (Sonnet, chat 101, 17 Nov 26)

Saved by the host from the walker's hand-back (its own write of this file was refused). Build: the frozen `01f1030c4`
(`index-C4m_44z2.js`) — before finds 8–10. Real sign-in (admin `ad`, member `us` = Ranger). Desktop 1536 and 2560 by
mouse; phone 402 Chromium (touch) and WebKit (WebKit drives no pinch or touch-drag: those in Chromium only). Pictures
`w1-*` in this folder. **PASS 9, FAIL 4, RECORDED 1.**

## FAILs (each to be judged by the host from its pictures)
1. **B-c** (phone, both engines): a pending box slid 4px inside the list's right edge and tapped — its amber tag ends at
   410, the list at 402. `w1-Bc-*`. *Host:* find 10, fixed red-first after this build.
2. **S8** (phone Chromium): a press on Ranger's CCL box where its tag and the box overlap focuses FCL's box (they overlap
   ~2px). Desktop and WebKit hit the right box. `w1-S8-*`. *Host:* find 9, fixed red-first after this build.
3. **S9** (desktop, admin and member): on hover a day's own tint (approved green .13, duty / weekend dark .55) reads as
   rgba(59,198,232,.05) while the mouse rests there — by computed style. `w1-S9-*-c.png`. *Host's first reading:* that
   .05 is `main`'s row-hover tint (`tr:hover td`, unchanged by this branch), which D2157 keeps; to be confirmed from the
   pictures and against `main`.
4. **S18** (desktop): the same reading on his own row, duty and approved days; open, closed and past dates and posting
   marks keep their lines; newly shown months get the ring (`w1-S9-admin-after-month-change-c.png`). *Host:* as 3.

## By scenario
- **B-a PASS** — every heading's left equals its column's left (0 pairs over 2px, 11–12 a run) at 1536, 2560, 402
  Chromium, 402 WebKit, 1536 WebKit. `w1-Ba-*`.
- **B-b PASS (the walker's)** — 402 both engines, admin / member unlocked / member locked / admin locked, slides 0, 100,
  220: track 132 every time; name heading 78.4 (WebKit 83.8); name cells 86–114.5 admin, 86–101.5 member; no figure seen
  inside the name column. After a pinch out and back (Chromium) name cells up to 160.3 / 142.1, wider than the track — an
  oddity. *Host:* the narrow cells are find 8 (fixed red-first: the reveal's probe found boxes beside the names); the
  walker's "no figure seen" is overturned by the host's test.
- **B-d RECORDED** — Days taken unchanged (NAME, GRADE, LL OL OIL CCL FCL PL EL CL MED CSE OD); the person window's tiles
  keep "Pending −N" (LVE −2.5, CCL −1, PL −0.5, CL −1). `w1-Bd-*`.
- **S7 PASS** (1536, 402 both; bidding closed and open) — admin boxes in all 50 rows and the lock switch; member unlocked
  boxes only on his own row (typed 4 and 5 into his CCL, kept); member locked 0 boxes and the "locked" note; admin
  editable when locked.
- **S8** desktop and WebKit PASS — corner tags dashed amber, no minus, presses pass through; a row with nothing pending
  has no tag, its pending cell "–". Phone Chromium FAIL (2).
- **S9 FAIL** (3) — the ring present at three points on every kind of painted day (empty, approved, joined, pending,
  refused, half, both halves, OIL award, care, medical, duty weekend); words kept; neighbours not ringed; gone on leaving;
  names, headings, event rows no ring.
- **S10 PASS** — a drag selection's strong 2px marks; the hollow ring back on the same cell after cancel, a cancelled
  move, leaving Rearrange; the move's target amber. Oddity: no "landed" mark seen in 500ms samples after a move.
- **S15 PASS** — approving Cinch's lines: LVE pending 2.5 → "–", App bal 23.5 → 21; Undo twice restored them; PL's 0.5
  stayed (one line left unapproved).
- **S16 PASS** — tags stay on their boxes and pass under the pinned names. The pinch-back "attached" measure read false
  (zoom in the measure); the pictures show no fault.
- **S17 PASS** — 1536, 2560, 1536 at 125%: 50 rows, 0 misaligned over 2px at top, bottom, scrolled 300, searched "Ra",
  after Days taken; the group rules over exactly their columns (LVE 384–686, OTHER LEAVE 735–1065).
- **S18 FAIL** (4).
- **S19 PASS** — behind the picked-days panel the ring shows and a press on a day swaps to the one-day window; under New
  leave war no ring, a press does nothing, the window stays; a press outside closes it, no sheet opens.
- **S20 PASS** — `(hover: hover)` false on the phone; a tapped day shows the tap frame while its window is open, nothing
  left after closing or scrolling away and back, both engines; a touch-drag selection (Chromium) leaves nothing after.

## Oddities
- A tapped phone day read a thin ring by computed style; the picture shows the tap frame, not a stuck ring.
- A second leave on the same day on a desktop: the window did not complete and the cell kept the picked mark — not chased.
- After a pinch back in, admin name cells wider than the 132px track.
