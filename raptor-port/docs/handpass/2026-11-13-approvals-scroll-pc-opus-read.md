# The fresh, blind code read — Approvals scrolling inside itself on a PC (13 Nov 26, at 0a1802567)

Saved as it arrived, after Astra's had reported too; the brief: §11 of `2026-11-13-approvals-scroll-pc.md`. The probe pictures it names stayed in the reader's scratch folder; its F1 was reproduced by `scripts/handpass/appr-narrow-pc.mjs` (pictures `img/handpass/2026-11-13-approvals-scroll-pc/host-narrow/`).


Read: the whole diff of `raptor-port/src` and `raptor-port/e2e` against `origin/main`. I also read `LeaveWarPage.tsx`, `lwnav.ts`,
`phone.ts`, `Chrome.tsx` (the tab row), the parts of `Matrix.tsx` that draw windows over the page, `BalancesPage.tsx`'s fit,
the save band's resize signal in `Shell.tsx`, and the scripts that read `.appr-list` and `.appr-cols`.

Two claims were checked in a real Chromium: the branch's own built folder `dist/` (built from the W3 fix), served inside the browser
through the walk's helpers (`scripts/handpass/appr-pc-lib.mjs`, the drawing's world of 19 requests), emulated desktop windows
of 1000×733, 820×1180 and 1536×733. Probe scripts and crops are in my scratchpad (`opus-probe.mjs`, `opus-probe2.mjs`,
`opus-shots/`). No repo file was changed.

## Findings

### F1. At a PC width under about 1,210, the lines show through the right end of the pinned column headings (D1518). Confirmed in a browser.

- **What he does and sees:** He opens Approvals in a window wider than 700 and narrower than about 1,210 CSS pixels and scrolls
  the list. Examples: an iPad either way up, or a desktop window at half of a 1920 screen. At the right end of the pinned
  headings row, each Approve button that scrolls under the headings shows its outline. Measured at 1000×733: the headings' solid
  box ends at x 961 and the scroll box at 979. Over x 961–979 the point under the headings row is a line's `appr-ok`, at scroll
  places 60, 120 and 200. The crops `opus-shots/head-1000-120.png` and `-200.png` show the button's rounded edge inside the
  headings row, and the lines' rules stopping at the headings' width. Once he scrolls the box sideways to reach Approve and
  Refuse, the uncovered strip gets wider. At 1000 wide Approve starts at 959, so Refuse is always off to the right.
- **Cause:** `approvals.css:63` gives a desktop line fixed columns of 1,128px (150+44+160+64+64+180+112+44+214, plus 8 gaps of 12).
  `.appr-scroll > *` (line 51) sets only a `max-width`, so the headings row `.appr-scroll > .appr-cols` (line 55, sticky, with its
  solid `--panel` background) is as wide as the box's content: 922 at 1000, 742 at 820. Its columns overflow past its own
  background. On `main` the lines spilled past the card and the window scrolled sideways, but nothing was pinned over them, so
  the leak is new. The card's new `overflow: hidden` and the box's `overflow: auto` turn that spill into a sideways scroll inside
  the box.
- **Fix:**
  1. In `approvals.css`, after line 51, add
     `.appr-scroll > .appr-cols, .appr-scroll > .appr-list, .appr-scroll > .appr-also { min-width: max-content; }`.
     The `max-width: 1240px` stays, and 1,128 is under it. The headings' background and rule then span every column, and so do
     the lines' rules.
  2. Check the sideways scroll bar in a real headed Chrome on Windows at 1000 wide. It sits along the box's foot, and the
     card's 28px fade (`.appr-page:not(.ph) .appr-card::after`, line 57) lies over it. Headless reported no bar height, so this
     is unverified. If it is covered, draw the fade inside the box instead: a last child of `.appr-scroll` with
     `position: sticky; bottom: 0; height: 28px; margin-top: -28px; pointer-events: none;` and the same gradient. Drop the card's
     `::after`.
  3. Add an e2e test at 1000×733 and at 820×1180 (every PC test now runs at 1536 only). Scroll the box by 120. Assert that the
     headings' right edge is at or past the box's last column, and that `elementFromPoint` along the headings row never lands in
     an `.appr-line`.
- **How sure:** high that it happens (measured). How much it shows: an 18px sliver at rest, wider when scrolled sideways.

### F2. A chip or another period now opens its list partway down. The first requests are hidden above the pinned headings. Confirmed in a browser.

- **What he does and sees:** With 19 requests at 1536×733 he scrolls to the foot of the list and presses "Feb". Before the
  press the box was at 607. After it, the box is at 175: 3 of February's 11 requests are above the view, under the pinned
  headings. Nothing says that more is above, because the fade is only at the foot. At 1000×733 it was 4 of 11 (691 → 259). The
  same happens with All, New, a month, a picked range, and the head's "+N pending in <period> ›". On `main` the chips and that
  link scrolled away with the page, so he could press one only from the page's top, and a new list always showed from its
  first request. Pinning them makes the press possible from anywhere, and the list keeps the old place, cut down by the
  browser.
- **Cause:** `ApprovalsPage.tsx:312–315` (`setFilter`) and the period effect at line 175 start the rows afresh (D1421) but
  never touch the box's scroll. The box keeps its `scrollTop`, cut to the new list's length.
- **Fix:**
  1. In `ApprovalsPage.tsx`, after the W3 effect (line 210), add a key and a layout effect:
     `const fkey = filter.kind === 'month' ? filter.ym : filter.kind === 'range' ? filter.from + '~' + filter.to : filter.kind`
     `const firstF = useRef(true)`
     `useLayoutEffect(() => { if (firstF.current) { firstF.current = false; return } if (fits && !picking && scrollRef.current) { scrollRef.current.scrollTop = 0; listY.current = 0 } }, [fkey, periodId])`
     Keep `picking` and `fits` out of the dependency list.
  2. Why not on `picking`: the first tap of a range keeps the calendar open and changes the filter. That tap must not move the
     calendar under his finger (the 2 Sep 26 rule). The second tap closes the calendar and sets the range in one batch, so the
     effect runs with `picking` false and the list shows from its top.
  3. The ring path (D1542) sets "All" and `ringKey` in one batch. This layout effect runs before the `ringKey` effect's
     `scrollIntoView`, so the ringed line still comes into view.
  4. Back ▴ changes neither key, so the kept place (`listY`) is untouched.
  5. Pin it in `apprscroll.test.tsx`: set the box to 500, press `appr-m-2026-02`, expect 0. Then open Pick dates…, set the box
     to 80, tap one day only, and expect it to stay at 80.
- **How sure:** high that it happens (measured). It is a behaviour gap more than a crash. The fix's choice (back to the top on
  "changing the dates") follows D1421, but it is my reading.

## Checked and found sound

- **The window keeps no pad (`body.lw-appr-on`), with the fitted height and the resize listener, on every way out.** All go in
  one cleanup, keyed on "shown and not a phone". That covers the slim bar (the page hidden), Back ▴, the slim bar's ✕, another
  tab, the member view (Chrome.tsx line 150), leaving the Leave War (`LeaveWarPage.tsx` cleanup sets the mode off, so the page
  unmounts), the last period deleted (the page unmounts), and the window crossing 700 either way.
- **Balances and Approvals together.** They use different classes and `lwnav` makes them exclusive, since each setter turns
  the other off. Neither can leave the other's class or listener behind.
- **The save band and the OIL bar.** `Shell.tsx` sends a resize when either comes or goes, so the page is fitted again.
- **The OIL tracker, ⚙ and the person window.** They are drawn over the page through a portal (Matrix.tsx 3716). The page stays
  up, so its lit lines, dots, dates and place stay too (D1506).
- **The kept place (`listY`).** It is written only while the page is shown. A scroll while hidden is ignored. It is handed back
  after the height is set, so the cut is right. A ring asked over the slim bar runs after the hand-back and wins. A cut made by
  the browser on a filter change writes the same value it shows.
- **The ringed line (D1542).** `scrollIntoView({ block: 'center' })` scrolls the box, keeps clear of the pinned headings by its
  `scroll-padding` of 40, and the window has nothing to scroll. D1231's dates path keeps the place across the slim bar
  (e2e-pinned).
- **A press that closes the calendar.** A press on a line's Approve closes the calendar, which moves the line up. The click is
  then taken because "moved", so nothing is decided (D1421).
  - The scroll-bar exemption (`t === sc && offsetX >= clientWidth`) is right for Windows' classic bars, left to right. The app
    has no right-to-left page.
  - Where the bar lies over the content (macOS, or some touch setups), a press on it closes the calendar. That is harmless,
    because the click is still taken.
  - The sideways bar of F1 is not exempt either.
  - A press on the box's padding closes the calendar, as it should.
- **Old places.** The e2e reads `.appr-cols` with no `.appr-list` parent. The drawing check's spec maps the drawing's list to
  the build's box. Older walk scripts that scroll the window to reach lines (`lw-m4-rw-*`) would not reach low lines on a PC if
  re-run. They are walk tools, not gates.
- **The phone.** Its DOM order is the same as `main`'s (calendar, the empty words, the list with its headings first, "Also
  since"), and every new rule is behind `:not(.ph)`.
- **Balances' fit.** It was moved to `screenfit.ts` word for word, with the same `[phone]` key.
- **The calendar's scroll to the top.** Closing it without picking leaves the list at its top. On `main` he had to scroll the
  window to the top to reach the chips anyway, so this is no regression.

## Not proven — worth a look

- **The top changing with no resize.** The page is fitted again only on a resize. If something above it changed height with no
  resize, the page would stand taller than the screen and the window could scroll again (lesson 31). One example would be the
  Leave War's top row wrapping at a narrow PC width after the period name changes. Balances has the same limit, and I did not
  find a case that does it.

## Tests that would pass with a part broken

- No test touches the scroll-bar exemption line. Deleting it keeps every test green.
- The W3 geometry (the calendar's last week reachable on a short PC window) is held only by the walk. The jsdom test checks
  only where the calendar sits and that the box goes back to the top.
- Every PC e2e runs at 1536 wide, so F1 cannot be seen.

## Tidiness note (filed, not to fix)

- **Duplicated:** the "fit plus body class" pair now exists in both pages. One hook in `screenfit.ts`, taking the element, an
  on flag and the class name, would keep the two from drifting.
- **More complicated than needed:** nothing beyond what the comments justify.
- **Unused:** `screenHeight` is exported but read only inside `screenfit.ts`.
