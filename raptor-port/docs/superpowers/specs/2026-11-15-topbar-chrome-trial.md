# The top bar coming loose in Chrome on his iPhone — the trial link and the cause report (15 Nov 26)

[TOPBAR-LOOSE-APPROVALS-QUALS], his D2025 (13 Nov 26): a trial link first — a copy of the app that shows readings on
screen while he scrolls in Chrome on his iPhone, nothing in the app changing — to tell whether the cause is
[PAGE-FOOT-FLASH]'s (Edge, D1961) and whether a small cure exists, **before any cure is chosen and put to him**. This page
is phase 1: the roll-call, the try at reproducing it, the trial switch, and the candidate cures. No cure is built.

## What he saw (his recordings of 12 Nov 26, read 13 Nov 26)

On Approvals and on Quals, in Chrome on his iPhone, the "142 TALON" bar sat about 29 points below the top of the visible
page for two or three frames, the page showing in the strip above it; on Quals the pinned headings row sat low by the same
amount. Each time it was in the frames where Chrome's own address bar was growing back while the page was still moving —
just after a flick reached the page's end and the page sprang. On Edit Schedule Chrome's bar shrank and grew back in one
frame and the top bar held. Edge (after D1873) and Safari hold on the same pages (his tries of 13 Nov 26).

## 1. The roll-call — how every page holds its top bar (measured 15 Nov 26, 402 × 874, signed in as an admin)

Measured on the built app by `scripts/handpass/topbar-chrome-probe.mjs` in WebKit (his iPhone's engine) and Chromium; the
two agree to a few pixels. Records: `docs/img/handpass/2026-11-15-topbar-chrome-trial/rollcall-{webkit,chromium}.json`.

| Page | The top bar | What scrolls | Page height (WebKit) | Pinned under the bar |
|---|---|---|---|---|
| Edit Schedule | fixed to the screen, 49 tall, its room held by an empty block (D1873) | the window | 3918 — 4.5 screens | nothing at the bar's foot; the crew rail is fixed at the right, mid-screen |
| View-only Sched | the same | the window | 2737 — 3.1 screens | nothing |
| Inputs | the same | nothing (the page fits the screen in the demo) | 874 — 1 screen | nothing |
| **Quals** | the same | **the window** | **1341 — 1.5 screens (467 to scroll)** | **a fixed copy of the headings row at the bar's foot**, shown by the browser on the window's own scroll (`.qfixed.q-psda`, D1870) |
| Logic | the same | the window | 8152 — 9.3 screens | its settings bar, sticky at the bar's foot |
| Leave War grid | the same (the war's own bar scrolls away) | the window | 1519 — 1.7 screens | a fixed copy of the dates row at the bar's foot (`.mxfixed`, D1870) |
| **Approvals** | the same | **the window** (on a phone, D2006) | **1402 — 1.6 screens (528 to scroll)** | **nothing** (its column headings pin only on a PC, inside their own box) |
| Balances | the same | a box of its own (`.bp-hs`); the window does not scroll | 874 — 1 screen | its headings, sticky inside that box |
| Tracker | the same | a box of its own (the chart board); the window does not scroll | 874 — 1 screen | its view tabs, sticky |
| Help | the same | nothing (fits) | 874 | nothing |
| Admin | the same | nothing (fits) | 874 | nothing |

**What Approvals and Quals do differently from Edit Schedule:** not the bar. Every page holds the bar the same way, fixed
to the screen since D1873. The difference is the page: Approvals and Quals scroll the whole window but are short — about
one and a half screens, 470–530 points of travel — where Edit Schedule is four and a half screens. A flick on a short page
reaches the foot while Chrome is still folding or unfolding its own bars; on a long page those bars have long settled
before the foot is reached. Quals adds a second thing fixed to the screen, its headings row, which moved with the bar —
so it is everything fixed to the screen that is drawn out of place, not the bar alone. The Leave War grid is the third
short window-scrolled page with a fixed row (1.7 screens) — the page where Edge's flash was found — and was not tried in
Chrome; Balances, the Tracker, Inputs, Help and Admin do not scroll the window at all, so Chrome's bars never move there.

## 2. The try at reproducing it — none, as expected

Every frame of a flick to the very foot was recorded (the bar's top against the visible top, the window's and the visible
screen's heights and the visible screen's top, the scroll), on the built app at 402 × 874 with touch, Edit Schedule
started two screens from its foot. Records `flick-{webkit,chromium}.json`.

| Engine, gesture | Page | Frames | Ended at the foot | Worst bar gap | Window / visible height | Visible top | Past the foot |
|---|---|---|---|---|---|---|---|
| WebKit, a smooth scroll to the foot (mobile WebKit takes no wheel and Playwright has no touch swipe there) | Edit Schedule | 138 | 3044 of 3044 | 0 | 874 / 874 throughout | 0 | 0 |
| | Quals | 152 | 467 of 467 | 0 (row 0) | 874 / 874 | 0 | 0 |
| | Approvals | 147 | 528 of 528 | 0 | 874 / 874 | 0 | 0 |
| Chromium phone, three real touch flicks (raw touches, let go, the page flinging on) | Edit Schedule | 247 | 3029 of 3029 | 0 | 874 / 874 | 0 | 0 |
| | Quals | 241 | 434 of 434 | 0 (row 0) | 874 / 874 | 0 | 0 |
| | Approvals | 247 | 551 of 551 | 0 | 874 / 874 | 0 | 0 |

No test browser on this PC springs a page past its end or folds a toolbar: the window's height never moved, the visible
screen never left the window's top, and the scroll stopped dead at the foot. So nothing here can show the fault, as
lesson 24 of the bug-check order says; the readings must come from his iPhone. (Chromium's own scroll-gesture command
moved nothing on these pages; raw touches did.)

## 3. The trial switch, `?barprobe`

Built as `?savefail` (D1666), `?swdebug` and `?kbdebug` are: only the one tab opened with it, nobody else touched.
`src/ui/barprobe.ts`, installed from `main.tsx`. With the switch a small green-on-black panel sits in the screen's bottom
right corner (about 220 × 105, clear of the top bar, taking no presses), read every frame for two seconds after any
touch, key press, scroll or screen-size change:

```
page-quals  1.3s                        the page, and seconds since it opened
win 874  vis 874 @0                     the window's height · the visible screen's height @ its top in the window
scroll 467  page 1341  past 0           the scroll · the page's height · how far it is sprung past its top or foot
bar 0 (top 0 mark 0)  row 0             the bar against the visible top (its own top, the fixed mark's) · the pinned row
WORST 0 at 0.0s  loose 0f               the largest bar gap since the page opened, when, and frames the bar was out
 win 874 vis 874@0 scroll 0 past 0      that worst frame's own numbers
RANGE win 874-874  vis 874+  @0         since the page opened: the window's lowest-highest, the visible screen's lowest
 top 0  foot -467 s0 p1341 w874          and its largest pan · furthest past the top · furthest towards/past the foot
 spring —                               the window's lowest-highest over the sprung frames only ("spring win 845-874")
```

**The signs.** `bar +N` = the bar drawn N below the visible top, the page showing above it — his fault's look; `bar −N` =
drawn N above it, partly hidden; 0 in place. `vis @+N` = the visible screen starts N below the window's top. `past −N` =
sprung N past the page's top, `past +N` = N past its foot. `RANGE … foot` is the scroll less the furthest the page can
scroll (`page − win`): below 0 the foot was never reached, above 0 it sprang that far past it, with that frame's scroll,
page and window beside it.

**Why `bar` reads through the app's fixed mark.** A phone may give every box's place from the window's top or, with the
screen panned, from the visible top (his `?kbdebug` recordings, 29 Oct 26). The bar's top less the pan alone is right only
the first way; the bar's top less the bar's own top would read 0 whatever happened. So `bar` is the bar's top less the
visible top measured in the same way as the bar — the app's own fixed mark at the window's top (the one the keyboard lift
and the Leave War's sheets read), plus the pan — and is right either way; the raw `top` and `mark` stand beside it so a
strange reading can be checked by hand.

WORST and RANGE are cleared when the page changes (another page, another Leave War tab, by a tap or the keys). Without the
switch nothing is drawn, nothing listens and no frame is asked for (the unit test proves it). The panel sits above
Approvals' slim bar while that shows, so its Back and Close stay clear, and returns to the corner when it goes. Pictures
of the panel in WebKit and Chromium: `barprobe-*-quals.png`, `barprobe-*-approvals-slim.png`, `barprobe-*-schedule.png`,
and the same pages without the switch, `noprobe-*.png`.

**What he does with it:** open the branch's preview link with `?barprobe` on the end, sign in, and screen-record while he
flicks hard to the very foot, three times each, on Approvals, Quals, Edit Schedule, the Leave War grid and Balances, in
Chrome; then the same on Approvals in Safari for comparison. One recording per page is enough. WORST holds the frame of the
largest bar gap, which is cause (i)'s mark; causes (ii) and (iii) may never move `bar`, so RANGE holds what tells them
apart — the window's height over the spring alone (`spring win`), the visible screen's pan and how far past the foot it
sprang — even if the recording misses the frame.

## 4. What the code suggests, and the candidate cures

The bar is the same fixed bar everywhere, and Edge's flash was traced to the visible screen sitting below the window's
own frame while the page was sprung (`visualViewport.offsetTop` up to 154, equal to the spring). Chrome on an iPhone is the
same WebKit underneath, folding its own top bar as the page scrolls; 29 points is about the difference between Chrome's
full and folded address bar. The likeliest reading — not proved — is the same family as [PAGE-FOOT-FLASH]: while Chrome
unfolds its bar during the spring, what is fixed to the screen is placed against a frame that has not caught up. A short
page makes the two moments meet; a long page keeps them apart. The readings decide between three versions of that:

- **(i) the page is told:** `WORST` reads about +29 — `vis @` about −29 (the visible screen 29 above the window's top,
  the bar left at the window's top), or the bar's own `top` 29 low — the browser itself reports the frame mismatch, as in
  Edge.
- **(ii) the page is not told:** `bar` stays 0 (`WORST` 0) while the recording shows it 29 low — WebKit's own drawing of
  fixed things lags Chrome's bar; nothing the page can measure sees it.
- **(iii) the window is resized mid-spring:** the spring range, `spring win`, spreads by about 29 (say `spring win
  845-874`) — Chrome changes the page's height as its bar unfolds while the page is sprung, and the fixed bar is re-placed
  a frame late. Read from the spring range only: the whole-page `RANGE win` also moves whenever Chrome folds its toolbars
  on an ordinary flick, spring or none.

### The candidate cures

| Cure | What it changes for him | Cost | When it fits |
|---|---|---|---|
| **A. Stop the spring at the page's ends** (`overscroll-behavior-y: none` on the page) | **takes away the page's spring at its top and foot, and with it Chrome's pull-down-to-reload** — the page stops dead | tiny (one rule) | only if `past` is above 0 in the worst frame; **he refused this for Edge (trial 10, D1962: a page keeps its spring)**, so it would go to him as that refusal again |
| **B. Every page scrolls inside a screen-high box of its own** — the one cure left from [PAGE-FOOT-FLASH] | the bar is no longer fixed to anything Chrome moves; Chrome's bars stop folding as he scrolls (about 30–80 points less page on his phone); the page keeps its own spring inside the box, but **Chrome's and Safari's pull-down-to-reload go**, and a tap on the phone's clock may no longer scroll to the top (not checked) | large: every page's scroll — the pinned rows that follow the window's scroll (D1870), "back to where I was" on the Leave War and Approvals, the keyboard lift (D1048, D1081), the pinch (D1567), the browser tests — a plan read first and a trial link of its own (as [PAGE-FOOT-FLASH] says) | any of (i), (ii), (iii); cures Edge's flash too, so one job with [PAGE-FOOT-FLASH] |
| **C. Only Approvals and Quals scroll inside a box**, as Balances already does | the same as B but on two pages; on a phone Chrome's bars stay full there, so about one request fewer is in view on Approvals — **this cuts against his D2006 reason (more requests in view on a phone) and goes to him for that**; the spring stays inside the box; pull-down-to-reload goes on those two pages | medium: Approvals' kept place and Quals' pinned headings, pinch and keyboard re-proved on those two pages; the same box Balances uses (`screenfit.ts`) | (ii) or (iii), if Edit Schedule flicked to its very foot reads 0 in Chrome (the short page is the trigger); not if Edit Schedule fails too |
| D. Move the bar by the visible screen's offset each frame | nothing visible if it worked | small | only (i) — **tried for Edge as trial 21 and worse, his word** (the bars moved twice); listed so it is not tried again unasked |

No cure here is both small and free of a cost he has already ruled on: A takes the spring (refused), C trades away part of
D2006's reason, D was worse. B is the clean one and is large. The trial's readings say which of (i)–(iii) it is, and
whether Edit Schedule at its very foot and the Leave War grid fail too — the two facts that choose between B and C.

### Which readings tell them apart

| On his iPhone, in Chrome | Reads as |
|---|---|
| Approvals or Quals: `WORST` about +29, its frame's `vis @` about −29 (or the bar's own `top` 29), `past` above 0 | (i), Edge's cause exactly: B cures it; D was tried; A would, at the cost he refused |
| `WORST` 0 while the recording shows the bar low | (ii): the page cannot see it — only B or C, which stop relying on Chrome to place fixed things |
| `spring win` spread by about 29 (the whole-page `RANGE win` alone does not count — it moves on any flick as Chrome folds its toolbars) | (iii): Chrome resizing the page mid-spring — B or C |
| `past` 0 in the worst frame, or `RANGE foot` at or below 0 | the spring is not the trigger, Chrome's bar alone is — A would not cure it |
| Edit Schedule flicked to its very foot: `WORST` 0 | the short page is the trigger — C is a real option |
| Edit Schedule or the Leave War grid: `WORST` about 29 | every window-scrolled page has it — B, one job with [PAGE-FOOT-FLASH] |
| Balances: `WORST` 0 and `win` steady | a page scrolling inside a box is safe, as predicted — supports B and C |
| The same on Approvals in Safari: `WORST` 0 | Safari places fixed things through the spring; the fault is Chrome's handling |

## 5. The two blind reads' fixes (phase 2, 15 Nov 26)

Each with a unit test that failed against the phase-1 switch first, and each checked by breaking the switch on purpose
(twelve ways — every one caught): `bar`, `past` and `row` pinned to their expected values; `bar` read through the app's
fixed mark (above); RANGE added; a pinned-row copy on a sleeping page, not drawn or not visible never read as the row; the
panel above Approvals' slim bar; a page changed from the keys after the panel went quiet clears WORST and RANGE. The
reads: `docs/superpowers/briefs/2026-11-15-topbar-chrome-trial-coderead-{astra,opus}.md`.

## What is not done here

No cure is built or chosen; nothing a person sees changes without the switch. The phone walk (lesson 24), the reads and
his look come after this phase. Whether `?barprobe` stays in the live app afterwards, as `?savefail` does, or leaves with
the trial, is a question for after his readings.

## 5. His try — Chrome on his iPhone, 15 Nov 26 14:55 (a 13-second screen recording, read with ffmpeg by chat 81)

He flicked Quals, opened the menu, went to the Leave War grid, Approvals, Balances, the grid and the OIL tracker. The
fault showed on Quals and on Approvals; the picture (`docs/img/handpass/2026-11-15-topbar-chrome-trial/his-try-quals-loose.png`)
is Quals at the moment Chrome's address bar grows back: a strip of the page (its headings row) shows ABOVE the "142 TALON"
bar. The readings, as the panel held them:

| Page | WORST | That frame | RANGE | Reads as |
|---|---|---|---|---|
| Quals | −106 at 8.3s, loose 127 frames | win 792, vis 792 @106, scroll 617 of 1303, past 106 (sprung 106 past its foot) | win 684–792, vis @106, foot 106, spring win 684–792 | the spring at the foot, and Chrome resizing the window during it — (i) and (iii) together |
| Approvals | −65 at 0.9s, loose 65 frames | win 792, vis 792 @65, scroll 695 of 1422, past 65 | win 684–792, vis @65, foot 65, spring win 684–792 | the same, smaller spring |
| Balances (scrolls inside its own box) | 0, loose 0 frames | — | win steady while it scrolled | safe, as predicted — supports B and C |
| Leave War grid | 0 | — | foot −811: the foot was never reached | not tested at its foot |

So: the trigger is the page springing past its end (`past` 65–106, equal to the visible screen's offset `@`) while
Chrome changes the window's height (684 ↔ 792, the spread of `spring win`). Cure A would stop it (the spring) — refused
for Edge (D1962); D was worse (trial 21). B or C remain; a page that scrolls in its own box (Balances) held. The sign: the
panel reads −N (drawn above the visible top) at the deepest spring, while the recording shows the page above the bar a
moment later as the address bar grows — the two moments differ; the build of the cure is checked on his phone either way.
Not yet read: Edit Schedule flicked to its very foot, and the Leave War grid to its foot — the two that choose between B
(every page) and C (Approvals and Quals only).
