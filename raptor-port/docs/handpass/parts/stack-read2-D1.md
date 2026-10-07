# Stack read D1, second pass — the look-only half of the workflow UI pass — Opus 5.5, 6 Oct 26

Read-only, branch `claude/codex-stack-review` at `eb8fd4d6`, against `main` `de470db5`. Nothing edited, built, run or
served; read-only `git` only. Paths are under `raptor-port/src/ui/` unless said; "13:" = `scheduler/13-board-rows-responsive.css`,
"17:" = `scheduler/17-save-status.css`, "18:" = `scheduler/18-oil-board.css`, "10:" = `scheduler/10-board-history.css`.

## 1. Findings

**F1 — MEDIUM-LOW. W13 again, above 820px: the board in its Desktop layout on a phone turned on its side shows the
failed-save band with no words and no Retry on screen.**
- *Steps:* an iPhone held upright (any but the SE / mini) → admin → Edit Schedule → open a day on the board → ⋯ →
  Desktop layout → turn the phone on its side (844–956px wide) → a save fails. Same on a computer: window at 820 or
  less → Desktop layout → widen to 821–1179.
- *Expected:* D587, and W13's own standard — "Not saved — keep this page open" and Retry on screen together, at any pan.
- *What the code does:* the Desktop layout's rules carry no width (13:852–853: the board pans and every child is at
  least 1180px wide) and the class lasts the session (`board.ts:1747–1754`), so it survives the turn. W13's pin sits
  inside `@media (max-width:820px)` (17:72, 17:81). Above 820 the band falls back to 17:68 — as wide as the 1180px
  bar — with 17:38–39's `justify-content:flex-end`: words AND Retry both at the bar's far right end. Worked from the
  sheet's own figures (not measured): Retry at about 1,100–1,160px, the words at about 860–1,090px. At 844 or 852 wide
  the screen shows an empty amber strip; at 932 a few letters; never Retry, until the bar is dragged sideways. Worse
  than W13 as first found (there the words showed).
- *Walked?* No. The browser test and walker N's L-16 run only at 620px or less with touch (`e2e/save-note.spec.ts:230`);
  walker E's 820/821 crossing had no failed save.
- *`main`:* has no band on the board at all (no `.saveband`, no `SaveBand` in `SchedBoard.tsx`). New in the stack;
  fix `5b55e1c1` was bound to the phone width.
- *Fix:* (1) in 17, after line 71, outside the phone block, add
  `@media (min-width:821px){ .schedboard.sb-wide .sb-top > .saveband{justify-content:space-between} .schedboard.sb-wide .sb-top > .saveband > .sv-msg{position:sticky;left:20px} .schedboard.sb-wide .sb-top > .saveband > button{position:sticky;right:20px} }`
  — the band keeps the bar's full width, so it keeps a line of its own, and its two pieces are held to the screen's
  two edges. Do NOT simply lift line 81 out of the phone block: above 820 the bar's last line holds the highlight chips
  and the buttons at their own width (10:133–135), and a band one screen wide could join that line. Leave line 81 as
  it is — at 820 or less the day row is a full line (13:603–604), so it is safe there. (2) Beside
  `save-note.spec.ts:230` add: upright phone, Desktop layout, `setViewportSize` 844×390, fail a save, assert words and
  Retry inside the screen and a press on Retry lands on Retry, at three pans; again at 1024×768. (3) Read, not run —
  walk it before and after.

No other finding.

## 2. A — absences

- **1a7 `index.html`:** sound — links no stylesheet; untouched by the fixes.
- **1a8 test helper:** sound — `src/testing` unchanged since `bcc69fc8`; index still 22 lines over 22 parts.
- **1a9 / 1a10 browser and unit runs:** sound — none reads the stylesheet's text; the two new rules (W13, W18) are
  guarded only by browser tests, as layout must be.
- **1a11 CI filters:** sound — `deploy.yml` names no part.
- **1a12 older scripts:** not re-read; the first pass's two notes stand.
- **1c3 Desktop layout left on above 820:** the first pass's "nothing visible" is incomplete — the board still pans at
  821–1179 and has no switch back (⋯ hidden, 18:103–105). Same on `main`. F1 lives here.
- **1c6 code using the board wrapper:** sound — the warning jump and "take me to this change" use `scrollIntoView`
  (`highlights.ts:411`, `interactions.ts:94`, `:196`), which moves whichever box scrolls, the sideways pan included;
  gold dots are marks on the cells (`histbubble.ts:361–390`); the bubble is clamped to the visible screen
  (`:331–347`); fresh-add boxes are classes (`highlights.ts:178–215`); the row drag's edge-scroll and W15's
  hold-in-place each find the nearest scrolling box (`rowdrag.ts:107–115`, `dayswap.ts:162–171`). None picks a
  scroller by "phone or desktop". Two phone-only branches still fire (`interactions.ts:86`, `:1218`, the warning
  list's fold) with no visible effect — 13:868 keeps the list open.
- **1b1 / 1c2 / D3 — a sideways swipe on the schedule does not pan (P4b-02, parked by D548):** not re-reported. Likely
  cause, by reading: the phone rule `.sb-main{overscroll-behavior:contain}` (13:346–347) is not released by the
  Desktop layout's `.sb-main` rule (13:854), so a drag begun on the schedule cannot pass to the board's sideways
  scroller; the bar lies outside `.sb-main`, so it pans from there. If so it is the layout's rule, not the test
  browser — expect the same on his iPhone. If he wants it: `.schedboard.sb-wide .sb-main{overscroll-behavior-x:auto}`.
- **1d5 key under the chart:** sound — colour swatches only (`Legend.jsx`, whole).
- **1d6 Students card's ball:** sound — its own drawing, no event symbol (`tracker/app/core.js:4121–4130`).
- **1d9 / 1d10 smoke suite, D566 test:** sound — both find a flight by the round-joined shape inside the centre group
  (`smoke.mjs:4092`, `geometry.spec.ts:5467`); the ring's cyan edge is outside it (`core.js:2324` against `:2340`).
- **1d11 Tracker stylesheet:** sound — no rule selects `path` or the centre group.
- **1e3 other pop-ups:** sound — the rule carries the window's id (`scheduler/21-insights.css:4–6`); one element has it
  (`Modals.tsx:195–198`).
- **D7 guest / no access:** sound — they get `GuestApp` / `AccessScreen`, neither mounts the Shell (`App.tsx:51–52`);
  Logic is mounted only on its page (`Shell.tsx:637`).
- **Not on the roll-call:** the print / PDF view — NO, it writes its own stylesheet, never the app's
  (`printpdf.ts:5`, `:70`). Searched again for a second drawer of the flight symbol (one routine `core.js:2279`, one
  caller `:2340`), of Logic's bar (`LogicPage.tsx:174` only) and of the Insights window: none.

## 3. B — siblings

- **Laid out to the 1180px bar, not the screen (W13):** another instance — F1. The bar's other full-width lines: the
  highlight strip starts at the left (13:639), the day row is centred by design (13:847). None other.
- **A hang-down past the screen's edge under a pan (W18):** searched `position:absolute` in the board's parts — only
  the ⋯ menu. The + Wave, + Block, template and stores menus are placed by script and clamped to the screen
  (`board.ts:1413–1415`). None.
- **A rule bound to one width test while its state is not (the W13 fix):** searched every `sb-wide` rule — all
  width-free (13:847–922) but the switch itself (same on `main`) and 17:81 → F1.
- **Measured against the top bar, missing a change that is no window resize:** Logic's bar listens for `resize`
  (`LogicPage.tsx:87–96`) and so hears Shell's notice (`Shell.tsx:316–321`); the board's own bar height is watched
  with the band inside it. None.
- **Wording / not-a-number / caret redraw kinds:** nothing of this piece computes or names anything; the one comment
  describing the shape (`core.js:2277`) is still true.

## 4. C — the fixes in this piece

- **17 (W13):** sound at 820 or less — own line guaranteed, height unchanged so the board's measured bar height
  follows, no later part names `.saveband`. Gap above 820: F1.
- **18 + `SchedBoard.tsx` (W18):** sound — `.end` follows `.sb-moremenu` in the same part, nothing later names it;
  measured before paint; the Phone layout never gets the class. The open menu still lies over the band's Retry — a
  short visit, as before.
- **`SchedBoard.tsx` (W15, RF2):** sound for this piece — every user of the wrapper is scroller-agnostic (§2).
- **`LogicPage.tsx` (W2):** sound — the pinned bar's contents are unchanged (count and Reset still count every
  setting, `:188`, `:197`); only the strip under it and the stamp use the new count.
- **`Shell.tsx` (W2):** sound — the band's notice is untouched.

## 5. Not read, and how sure

Not read: the 6,717 moved lines (byte-equal per pass 1), the walkers' pictures, the band's own roll-call beyond where
it meets this piece, the other pieces' reports. Nothing was run, so F1's pixel figures are worked from the stylesheet.
Sure that the pin does not apply above 820 (the rule's placement is plain); fairly sure of where the words land;
less sure of the swipe's cause. A picture at 844×390 with the words and Retry on screen would overturn F1.
