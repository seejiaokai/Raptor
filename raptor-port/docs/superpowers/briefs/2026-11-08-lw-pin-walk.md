# The walk of [LW-PIN-LAST-FRAME] (D1870) — the two walkers' brief

Written by the host (chat 16, Opus) on 8 Nov 26. Two walkers: **L walks the Leave War, Q walks Quals.** Each reads the
common part and its own part only. **Read `raptor-port/docs/walk-scripts.md` §3 to §7 before writing a line of script**
— every rule there is there because a walk once reported something untrue.

## Common part — what changed, and what "shown" means

The Leave War grid's pinned dates row and Quals' pinned heading are each drawn twice: the real row inside the table,
and a **copy** pinned under the top bar. Before this change the copy was added to the page only once the real row had
gone under the top bar, by the page's own code, one painted frame late. **Now the copy is ALWAYS in the page**, hidden,
and the browser itself shows it the moment the real row's top reaches the top bar's foot (a 1px opacity step on the
page's own scroll). So:

- **"Shown" means: its computed `opacity` > 0.5 AND its computed `visibility` is not `hidden`.** Being in the page,
  having a size, or being "visible" to Playwright proves nothing. Judge by the PICTURE first (walk-scripts §4: what is
  drawn), with opacity as support.
- While hidden the copy is `inert` (out of the keys and of what a screen reader reads) and takes no taps; once pinned
  it gains the class `up` (a frame late) and takes taps.
- While two fingers pinch, the copy is off the scroll's step and is shown by the pinch's own rule (class
  `lw-pinching` on the Leave War copy, `q-pinching` on Quals'), with no shadow.
- With the computer's or phone's "reduce motion" on, the step still runs (it moves nothing).
- On a page too short to scroll (Quals filtered to one man) the copy must never show.
- In a browser without the scroll timeline, the old way runs unchanged (the copy added by the page's code).

**Selectors (taken from passing tests — do not compose your own):**
- top bar: `.topbar` — the meeting point is its `getBoundingClientRect().bottom`.
- Leave War copy: `[data-testid="sticky-head"]`; the real dates row: the `#page-leavewar tbody.mxhead` that is NOT
  inside `.mxfixed` (`[...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed'))`);
  the grid tab: `[data-testid="lw-tab-grid"]`; the month buttons: `[data-testid^="month-"]`.
- Quals copy: `[data-testid="qsticky-head"]`; the real heading: `#qtbl thead`; the filter box: `#qFilter`; a name cell:
  `#qtbl td.qname`.
- **T**, the meeting point, as a page scroll: `scrollY + realRow.getBoundingClientRect().top − topbar.bottom`.

**The recipes — routes already proved on this build:**
- `raptor-port/scripts/handpass/lwpin-frames.mjs` — opens both pages (`lib.mjs` `login(page, 'a')`, `go(page,
  'leavewar' | 'quals')`), finds T (its `GEO`), drives a real CDP finger (its `finger()`) and the desktop wheel, and
  records painted frames by the screencast (its `cast()`). Copy its helpers into your own script; do not import it.
- `raptor-port/e2e/app.ts` `pinShown` / `expectPinned`; `raptor-port/e2e/leavewar.spec.ts` the D1870 tests (search
  "D1870"); `raptor-port/e2e/geometry.spec.ts` the Quals D1870 tests; `raptor-port/e2e/pinchzoom.spec.ts` (a pinch over
  CDP).
- A member: `login(page, 'm')` signs in the member account. "Reduce motion": `page.emulateMedia({ reducedMotion:
  'reduce' })`. The failed-save band: open the app at `/?savefail` (D1666: in that tab every save is refused, the
  "Not saved" band shows under the top bar and the page moves down — D587).
- **A browser without the scroll timeline** (scenario 24), no other browser being installed: before the page loads,
  `page.addInitScript(() => { const s = CSS.supports.bind(CSS); CSS.supports = (a, b) => /animation-timeline|animation-range|scroll-timeline|timeline-scope/.test(String(a) + String(b ?? '')) ? false : (b === undefined ? s(a) : s(a, b)) })`
  — the app then takes the old way. The partial case: make only `animation-range` answer false. Say in the report that
  this is a stand-in, not a real browser.

**The build:** served at `http://localhost:4393` (rebuilt from commit c23920f0d, with the height-watch fix). Never rebuild it, never start another
server on that port. Before your first step, check the served index names the same bundle as the folder
`C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/bfddd1cb-8b24-453c-b9e5-f54c2d5dd233/scratchpad/dist-final/index.html`
(walk-scripts §1). Each walker uses its own fresh browser context(s) — that keeps the two worlds apart. Do not take or
release the checks lock: the host holds it for the whole walk.

**Sizes:** desktop 1536 × 864 Chromium; phone 402 × 874 Chromium with touch (`isMobile`, `hasTouch`, scale 2) for every
finger gesture — fingers over CDP `Input.dispatchTouchEvent`, a finger RESTS about 90 ms before it lifts (walk-scripts
§4); phone 402 × 874 WebKit for LOOKS only (WebKit's scripted touches drive no scroll — set the scroll with
`scrollTo`); L also 2560 × 1440 Chromium zoomed fully out. A headless CDP finger never makes a fling — say so where it
matters.

**The machine's traps (Windows, Git Bash):** write every script to a file with the file tool and run it from there —
never `node -e`, never a heredoc (backslashes are lost, an apostrophe fails to parse, often silently). Never rewrite a
script and run it in one step. Print a version line at the top of every run. Resolve every path from the script itself
(`import.meta.url`). Your scratch files go in your own scratch folder (below), never the shell's `$TEMP`. A check piped
into `tail` hides its failure: write output to a file, then read its exit. There is no `jq`.

**Pictures:** one picture per assertion that matters; on the phone, a picture within about 100 ms of each tap's lift
AND the settled one (walk-scripts §5); crossings judged from painted frames (the screencast), never only from a resting
screenshot. One run, one folder — empty your folder first.

**Judging:** a scenario with an EXPECTED line is PASS or FAIL; a scenario marked RECORD is written down exactly as seen.
A step whose own set-up could not act is NOT WALKED with its reason, never FAIL. Every assertion's note prints the value
it judged. Your conclusion is a finding only after the host reproduces it; the host opens the pictures behind every
FAIL. **What is not a finding (D56):** a problem that lives only in data already stored, when the app would not do it
again to new data. Old behaviour this change did not touch is still reported if you meet it, marked "also on the old
build?" — the host decides.

**Stopping:** stop and report after three failed attempts at one gesture. When done, stop every script and browser you
started, write your report ONCE to your report file (below) — one table row per scenario: id, size and engine, what you
did, EXPECTED, what you saw, PASS / FAIL / NOT WALKED / RECORDED, picture file names — and hand back a short summary
naming the FAILs. Your cost is your own token count.

## Walker L — the Leave War

Script: `raptor-port/scripts/handpass/lwpin-walk-l.mjs` (a new name — it is free; check before writing). Pictures:
`raptor-port/docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/L/`. Report:
`raptor-port/docs/handpass/parts/2026-11-08-lw-pin-walk-L.md`. Scratch:
`C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/bfddd1cb-8b24-453c-b9e5-f54c2d5dd233/scratchpad/walkL/`.

Open the Leave War grid as admin unless a scenario says otherwise. The scenarios are Astra's (full text:
`raptor-port/docs/superpowers/briefs/2026-11-08-lw-pin-last-frame-astra-scenarios.md`, its numbers kept):

- **L1 (Astra 1) reduce motion**, 1536 and 402: at the top, just above T, just past T, well past T, back to the top.
  EXPECTED: the copy is not shown at the top or just above T — nothing drawn over the month buttons — and is shown past
  T, under the top bar, the real row gone under it.
- **L3 (Astra 3) keys and screen reader**, 1536: at the top press Tab through the page's controls past the grid's
  heading. EXPECTED: focus never lands inside the copy while it is hidden; the copy has `inert` while hidden. Then
  RECORD: past T, what Tab reaches, and whether the copy's accessible tree is exposed (`page.accessibility.snapshot()`
  or the ARIA tree) — the old build read it twice while pinned, which is known.
- **L4, L5 (Astra 4, 5) a pinch**, 402 Chromium: part-way down, a pinch across T both ways (Astra's finger recipe);
  a pinch begun before T then released, and one cancelled. EXPECTED (D1287): the names stay at the grid's left, the
  dates row stays pinned under the month buttons' row — never drawn over the month buttons — the days stretch about the
  fingers; no row is cut or doubled at the lift. Pictures mid-pinch, at each step's middle, and at the lift.
- **L6 (Astra 6) the failed-save band**, 1536 and 402, at `/?savefail`: pinned at T + 160, make a save (any small
  admin change on the grid — note which); picture the first frames with the band. EXPECTED: the copy sits flush under
  the band's foot (the bar's new foot), no gap, nothing covered; Retry stays a save (it keeps failing).
- **L8 (Astra 8) Manning and folds**, both sizes: at T + 2 and again at T − 2, without scrolling, open and close
  Manning, fold and unfold a group. EXPECTED: the copy is shown at T + 2 and hidden at T − 2 after each action, its
  columns over the real columns, in the first painted frame after the action (screencast), not only after a later
  scroll.
- **L10 (Astra 10) a fast crossing and reversal**: desktop four 100 px wheel steps 80 ms apart then back; phone a finger
  (200, 760) → (200, 260) and back; five each way. EXPECTED: no painted frame shows the row cut, missing or doubled
  under the top bar.
- **L11 (Astra 11) the fractional seam**, phone scale 2 and 3, zoom at default, fully out and fully in: scroll to T − 1,
  − 0.75, − 0.5, − 0.25, T, T + 1 (record what the browser reaches). EXPECTED: no see-through row and no seam.
- **L12 (Astra 12) diagonal**, both sizes: the grid's left edge, middle and right end, crossing T while moving sideways
  (phone: a finger (330, 650) → (90, 250) and back). EXPECTED: each date stays over its own column, the corner and the
  names lined up.
- **L13 (Astra 13) a tap on a date**, both sizes: tap a date on the real row at T − 40, then on the copy at T + 40,
  again after sideways scrolling, and once straight after the first pinned frame. EXPECTED (D1143): one day panel opens
  from the foot for exactly the date tapped; nothing opens under it.
- **L15 (Astra 15) Rearrange**, both sizes: pinned, ⚙ → Rearrange the grid, drag a row, fold and unfold a group, Done,
  then Undo and Redo in the top bar. EXPECTED: the dates and names stay lined up; nothing moved that was not dragged.
  On the phone, a second finger during a drag: RECORD what happens.
- **L16 (Astra 16) months and periods**, both sizes: pinned, press other months, cross 31 Dec – 1 Jan (the corner's
  year turns — D1561), pick another period and back; at the fit and the largest zoom. EXPECTED: the copy's dates and
  year match the grid's; the month buttons stay uncovered and pressable.
- **L17 (Astra 17) edits, Undo, Redo**, both sizes: pinned and half way sideways, add a whole-day and a half-day leave
  through a day's bid window, then Undo and Redo. EXPECTED: the copy and the real row agree after each, widths lined up.
- **L18 (Astra 18) away and back**, both sizes and WebKit: pinned and sideways-scrolled, go to another page, change a
  person on Quals (an admin change), come back; then resize the window while away and come back. EXPECTED: the first
  frame back shows the copy where the grid is, with today's content, and no copy on any other page.
- **L19 (Astra 19) the other tabs**, both sizes: from a pinned grid open Approvals, Balances, OIL and My leave, then the
  grid. EXPECTED: the dates copy shows only on the grid; on the phone a pinch on OIL zooms OIL (D1285), a pinch on the
  page's ordinary controls does nothing (D1567).
- **L20 (Astra 20) windows over the grid**, both sizes: pinned and sideways-scrolled, open and close the day panel, the
  person window, the Required cell's keypad (phone) and the ⋯ menus, each closed by ✕, Escape and a tap outside where
  it has them; tap a control of the window that lies over the copy. EXPECTED: the window takes the tap; no date shows
  through or opens behind it; after closing, one copy, in place.
- **L22 (Astra 22) turning the phone, the keyboard, the window's width**: 402 × 874 → 874 × 402 → 402 × 874 pinned and
  just before T; desktop 1536 → 420 wide → 1536. EXPECTED: the copy under the actual top bar, its widths right, from
  the first settled frame. (Safari's address bar: only his iPhone — write it down as not walkable.)
- **L23 (Astra 23) a member**, both sizes: signed in as the member, the same date taps and pinning. EXPECTED: as for the
  admin, and the copy offers nothing the member's real row does not.
- **L24 (Astra 24) the old way**, both sizes, with the stand-in above (full and partial): cross T, move sideways, pinch
  on the phone, back and forth to another page. EXPECTED: one working copy each time, as before this change.
- **L-plain, the plain-user round (§7.0a)**, both sizes, as admin then member: open the Leave War, scroll down a long
  way, open a day by its date and close it each way, place a bid and decide it, open a person, go back to the top,
  leave the page and come back. Press every control that opens or closes something. EXPECTED: everything works as a
  user expects, the dates row always there when the dates are under the bar, never over the month buttons.
- **L-height**: the copy's height equals the real row's at 402 (Chromium and WebKit) and 1536. RECORD both numbers.

## Walker Q — Quals

Script: `raptor-port/scripts/handpass/lwpin-walk-q.mjs` (a new name — it is free; check before writing). Pictures:
`raptor-port/docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/Q/`. Report:
`raptor-port/docs/handpass/parts/2026-11-08-lw-pin-walk-Q.md`. Scratch:
`C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/bfddd1cb-8b24-453c-b9e5-f54c2d5dd233/scratchpad/walkQ/`.

Open Quals as admin (`go(page, 'quals')`) unless a scenario says otherwise. Astra's scenarios, numbers kept:

- **Q1 (Astra 1) reduce motion**, 1536 and 402: the top, just above T, past T, back. EXPECTED: not shown above T —
  nothing drawn over the filter, Export or the Pilots · WSOs · Personnel · All switch — shown past T.
- **Q3 (Astra 3) keys and screen reader**, 1536: Tab from the top through the heading. EXPECTED: focus never in the copy
  while it is hidden; the copy has `inert` then. RECORD past T what Tab reaches and the accessible tree.
- **Q4, Q5 (Astra 4, 5) a pinch**, 402 Chromium: part-way down, across T both ways, begun before T and released or
  cancelled. EXPECTED (D1110): the heading row and the name column stay pinned and lined up; the top bar, Enable
  editing, Export, the filter and the switch keep their size; no row cut or doubled; no shadow on the copy mid-pinch
  (Astra 2). Pictures mid-pinch and at the lift.
- **Q6 (Astra 6) the failed-save band**, both sizes at `/?savefail`: pinned at T + 160, make a save (a tick in Edit
  quals — note which). EXPECTED: the copy flush under the band's foot, nothing covered.
- **Q7 (Astra 7) changes above the table**, both sizes, at T + 2 and T − 2, no scrolling between: Enable editing /
  Done, Edit quals in and out, open and close the Add qualification row, and a returnee notice's Later where one can be
  raised through the app (else NOT WALKED, with why). EXPECTED: the copy shown at T + 2 and hidden at T − 2 after each,
  in the first painted frame after the action.
- **Q9 (Astra 9) a page that no longer scrolls**, both sizes: search one man, then nothing that matches, then clear;
  each of Pilots, WSOs, Personnel, All. EXPECTED: when the page fits the screen the copy is never shown; pinning comes
  back when the list grows.
- **Q10 (Astra 10) a fast crossing and reversal**, as L10. EXPECTED: no painted frame shows the heading cut, missing or
  doubled.
- **Q11 (Astra 11) the fractional seam**, as L11, at the default zoom, fully out and fully in. EXPECTED: no see-through
  heading, no seam.
- **Q12 (Astra 12) diagonal**, both sizes, left, middle and right of the table. EXPECTED: each heading over its own
  column, the callsign heading over the names.
- **Q14 (Astra 14) sorting from the copy**, both sizes: sort by the real heading at T − 40, then by the copy at T + 40,
  the callsign heading too, after sideways scrolling, and straight after crossing T. EXPECTED: the column tapped sorts,
  once a tap, its arrow showing on the copy and the real heading alike.
- **Q17 (Astra 17) edits and Undo**, both sizes: pinned, half way sideways, add a qualification column with a
  14-letter name, change a tick, Undo it in the top bar. EXPECTED: the copy and the real heading agree after each,
  widths lined up.
- **Q18 (Astra 18) away and back**, both sizes and WebKit: pinch-zoomed on the phone, leave Quals and come back.
  EXPECTED: no copy on another page; the first frame back shows the heading right. RECORD the zoom on return.
- **Q21 (Astra 21) windows and Quals' own controls**, both sizes, as admin then member: pinned, open and close the
  account menu, Export, Add person, Edit quals and any window they raise, each closed every way it offers. EXPECTED: the
  window takes the tap, the heading never above it, one heading in place after.
- **Q22 (Astra 22) turning the phone and the width**, as L22.
- **Q23 (Astra 23) a member**: the same sorting and pinning as the member. EXPECTED: as the admin's, nothing more
  offered.
- **Q24 (Astra 24) the old way**, both sizes, with the stand-in (full and partial), as L24.
- **Q-plain, the plain-user round (§7.0a)**, both sizes, admin then member: open Quals, filter, sort, scroll a long way,
  Enable editing and change a tick, Done, Undo, leave and come back; press every control that opens or closes something.
- **Q-height**: the copy's height equals the real heading's at 402 (Chromium and WebKit) and 1536. RECORD both.
