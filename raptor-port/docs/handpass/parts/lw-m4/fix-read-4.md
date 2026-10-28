# M4 — the fresh, blind read of D1444 / D1445 (28 Oct 26)

Reader: a fresh Opus that did not write the change. Read in the read-only copy `C:/m4i` (a20aef5e8), the change
`f1b626906 -- raptor-port/src raptor-port/e2e`, with the full rows of D1439, D1444, D1445, the builder's account
(`fixes-night.md` §"His D1444, D1445") and the walk (`rewalk4.md`). Rules: D489 (a finding has a failure, a cause and a fix),
D56 (stored demo data is not a finding). Nothing built, no browser test run, no unit test run (none needed for what follows).

## Findings

### 1 — On a phone, deciding a month's last request can make the whole list jump up under his finger (visible fault; against D1421)

**Steps.** Phone (any width), Approvals, All picked, requests waiting in **six** months of the period (any six; e.g. the
seven-month world the builder measured, after one month empties). Tap Approve on the only request of one of those months.

**What he meets.** The line lights "Approved" as D1421 says — but that month's chip leaves the row of New and All at once.
With six months the chips filled row 1 (New · All · five months) and one month stood alone on row 2; with five, row 2 empties,
so the filter block loses a row (36px chip + 6px gap) and the lit line, every line under it, and its own Approve / Refuse jump
up **42px**. His second tap to change his mind (D1421: "a second tap on the lit button sends it back to pending, and nothing
moves under his finger") lands on the line's figures instead, or nothing. The same jump happens the other way: tapping the lit
button to send it back to pending brings the chip back and pushes the list down 42px; a top-bar Undo of that decision does the
same (against D672 — Undo leaves the screen where it is); "Approve N — tap again" with six or more months lights every line,
every month chip goes, and Approve all itself moves up a row. A request withdrawn while on screen ("No longer there") does it
too. On his iPhone nothing compensates (Safari keeps no scroll anchoring). Only the phone: the desktop keeps every month.

**Cause.** `ApprovalsPage.tsx`, `monthShown` → `monthHas`, which reads `pendingRows` — rows neither lit nor stale. A line
decided here leaves `pendingRows` the moment it is lit, though D1421 keeps it on the page until the dates change, so its
month's chip goes while its line still stands. The walk (rewalk4 H1–H5) measured the seven-month top but decided nothing on
it, and the demo's two months never cross the 5↔6 line, so no test sees it.

**Exact fix.** Show a month on a phone while any line of it stands on the page — pending, lit or gone — so its chip leaves
only when the rows start afresh (another filter, another period, leaving Approvals: `setFilter` already drops lit and stale
rows). It stays dimmed while nothing in it is pending (`dim: !monthHas(ym)` already does that):

```ts
/* on a phone a month keeps its chip while a line of it stands on the page — a decided one lit, a gone one greyed — so the
   top never moves under his finger (D1421); the rows start afresh when the dates change, and the chip goes then (D1444) */
const monthOnPage = (ym: string) => rows.some(r => r.line.parts.some(p => p.date.slice(0, 7) === ym))
const monthShown = (ym: string) => !phone || monthOnPage(ym) || (filter.kind === 'month' && filter.ym === ym)
```

(`rows` holds every line of the period whatever the filter, so a month with requests only off-filter still shows, as now.)
Red first, `lw-phone`: a world with requests in six months; Approve the only request of one; the line's Approve keeps its
top (±1px), the chip stays (dimmed); tap All — the chip goes. **Reading to tell him:** this keeps a month's chip for the
decided lines D1421 keeps on screen, which D1439's "months that hold requests waiting" did not name; it is the same reason the
build already keeps a picked month ("so the choice he made never vanishes under him").

### 2 — Changing the period keeps a month or date range of the old period picked: "Nothing here for these dates", nothing lit (visible fault; older than this change, reached by its link)

**Steps.** Phone or desktop, Approvals, tap a month chip (say Feb), then tap "+2 in JAN – DEC 27 ›" on the title's line.

**What he meets.** The other period opens with its pending count in the header but the list says "Nothing here for these
dates."; no chip is lit (the old period's Feb is not one of the new period's months, so it is not drawn), Approve all reads 0
and is disabled. He must guess to tap All. A picked range does the same, its old dates on the Pick dates… chip.

**Cause.** `filter` is component state that `selectWar` never touches; the rows start afresh on a new period (D1421) but the
filter does not. Not new — but D1444 now puts the link to another period on the title's line, the most direct door to it.

**Exact fix.** In `ApprovalsPage`, start the filter afresh with the period, beside the rows:

```ts
useEffect(() => { setFilterRaw({ kind: 'all' }); setPicking(false); setArmed(null) }, [st.period.id])
```

Red first: pick Feb, tap the other period's link; All is lit and the period's lines show.

### 3 — Stale comment over the phone filter grid (tidiness)

`approvals.css`, the comment beginning "AS HIS DRAWING (r22-5-phone — D1420, D1423): three rows — New · All · Jan–May, then
Jun–Dec…" still describes D1423's twelve months in three rows. Since D1444 the months shown are only those holding requests,
on the row of New and All (wrapping only past five). Fix: reword its first sentence to D1444's, keeping the one-line-words part
(D1387) as it is. Also in the records: D1423's short line in `.claude/rules/decisions/leave-war.md` carries no
"— changed by D1439" tail though the commit and the test say D1439 narrowed it (D1434's line carries it).

## What was asked, checked and found right

- **Which months show.** A month with requests only in another period: none of its chips (months come from this period only;
  `rows` are this war's lines). A request spanning two months: both chips (any part's month counts). A half day: its day's
  month. A month picked when its last request goes: it stays, dimmed and lit, until another filter (walked, H2b). New or a
  picked range selected: the months holding requests show; fine. The period changed: right months for the new period, but see
  finding 2. Twelve months all holding requests: three rows, as D1423 drew — the grid's placement holds (Pick dates… and
  Approve all always start a fresh row, since Pick dates… is placed at column 1 after the cursor has passed it).
- **The link on the title's line.** "+N in <name> ›" on a phone, "+N pending in <name> ›" on a desktop. Two other periods:
  two links, each wrapping as a whole to a line of its own when the title's line is full (flex wrap, 14px apart). A long period
  name: the link wraps inside itself only if wider than the card — no overflow, no sideways scroll. Very narrow phones: the
  link drops to its own line, as ruled.
- **The desktop left exactly as it was:** every month (dimmed when empty), the "pending" words, the head's gaps — the only
  desktop change is D1445's fill, as ruled.
- **The keyed chips:** each chip keyed by its test id (unique per month, New, All); the phone's chips coming and going keep
  their focus and pressed state on the right chip. Right.
- **The fill:** the slim bar is drawn in one place (`SlimBar`, both phone and desktop); `background: #161B22` comes after the
  `var(--raised)` rule in the same block, and nothing else sets its background; the app has no light theme for a fixed colour to
  break. Right.

## Line per fix

- **D1444 (A), the link on the title's line:** right and complete.
- **D1444 (B), only the months holding requests:** not complete — a decided line's month loses its chip while the line still
  stands, and with six or more months that moves the list under his finger (finding 1).
- **Keyed chips:** right and complete.
- **D1445, the slim bar's fill:** right and complete.
