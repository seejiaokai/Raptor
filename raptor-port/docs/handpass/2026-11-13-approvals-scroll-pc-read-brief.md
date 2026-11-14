# Code read — the Leave War's Approvals page scrolling inside itself on a PC (branch `claude/approvals-scroll-pc`, commit 0a1802567)

You are one of two independent readers. Read only what this brief names and the live files; never read another reader's
report. Change no file. Your output is your report, written as your final answer.

## What the change is meant to do (his rulings — the spec)
- **D2006:** on a PC the Approvals page fits the screen and only its list scrolls, the title, the chips, Approve all and
  the column headings staying, as the Balances page does; on a phone the page stays as it is today — the whole page scrolls.
- **D2008:** on a PC a short list still has its card reach the foot of the screen, empty below the last request, as the
  Balances page does, so the card's edge stays put when a month is picked.
- "A phone" is the Leave War's own `(max-width: 700px)` (`raptor-port/src/leavewar/ui/phone.ts`); wider is a PC.
- Rulings it must not break: D1421 / D1428 / D1506 (a decided line stays lit where it is until he leaves Approvals or
  changes the dates; the OIL tracker over it does not end the visit; closing it back returns the lit lines, dots, dates
  and the place in the list); D1231 (a request's dates open the grid at that day with the slim "Back to Approvals" bar);
  D1542 (the clash note's "Decide it in Approvals ›" rings the request and brings it into view); D1518 (nothing pinned
  leaks — a bar that stays put shows none of what scrolls under it); the 2 Sep 26 rule (a control tapped repeatedly never
  moves under the finger); the Balances page's own fit (it now shares `screenfit.ts`) unchanged; lesson 31 of
  `raptor-port/docs/bug-check-order.md` §7.11 (a page fitted to the screen at a fractional height at 125%: the window
  behind it must scroll by nothing, and the list keeps the wheel at its ends).
- The rulings' full statements: `.claude/rules/decisions/leave-war.md` (the Leave War) and `.claude/rules/decisions/design.md`.

## What to read
`git diff origin/main...0a1802567 -- raptor-port/src raptor-port/e2e` — the files:
`raptor-port/src/leavewar/ui/screenfit.ts` (new), `ApprovalsPage.tsx`, `approvals.css`, `BalancesPage.tsx`,
`apprscroll.test.tsx` (new), and the new Approvals tests at the end of `raptor-port/e2e/leavewar.spec.ts`. Read the
callers and neighbours you need (`LeaveWarPage.tsx`, `lwnav.ts`, `phone.ts`, `RangePicker.tsx`, `balances` CSS).

## What the walk already found and how it was fixed (so you do not report it again — but DO say if the fix is wrong)
On a short PC window the "Pick dates…" calendar sat between the chips and the scroller in a card fixed to the screen's
height: it squeezed the list to 28px and the card cut off its last weeks. Fixed in 0a1802567: on a PC the calendar is the
scroller's first part, the scroller set back to its top as it opens, and a press on the scroller's own scroll bar does
not close it.

## What to look for — what is MISSING, not only what is wrong
The walk drove the running app (real 125% windows at fractional heights, the wheel at the list's ends, every chip, Back,
the OIL tracker, the keyboard, the phone in WebKit and Chromium). Code-reading finds what a walk cannot: a state, a path or
a reader that was never driven. Ask especially:
1. Every way the page is shown, hidden, re-shown or re-sized (the slim bar, the OIL tracker over it, another tab, a period
   change, the window crossing 700 live, the page hidden while the body class or the resize listener stays) — is the fit,
   the body's pad (`body.lw-appr-on`) and the list's kept place right in each, and torn down on every way out (unmount
   included)? Can two pages (Balances and Approvals) leave each other's body class or listener behind?
2. The list's kept place (`listY`): where can it be written wrongly (a scroll event fired while hidden, a scroll the
   browser made itself on a filter change, the calendar's new scroll-to-top) and restored where it should not be?
3. The ringed line (D1542) and a request's dates path: brought into view inside the scroller, never under the pinned
   headings or the foot fade?
4. The calendar's outside-press rule with the calendar now inside the scroller: can a press that closes it still decide a
   line (D1421)? Is the scroll-bar exemption right (`offsetX >= clientWidth`) — a right-to-left page, a scroll bar that
   overlays, a press on the scroller's padding?
5. Anything that reads `.appr-list` or `.appr-cols` by its old place (they moved: the headings are now outside the list,
   inside `.appr-scroll`) — in `src`, `e2e`, `probes`, `scripts`.
6. Tests that would pass with the feature broken (a test that asserts what jsdom cannot measure, or a geometry test at an
   emulated whole-number height only).

## What is NOT a finding (put nothing of these in your report)
- A problem that lives only in data already stored (the store is demo data, cleared before the database step — D56).
- A scheduler who is not an admin (a scheduler is always an admin — D785).
- Style, naming or tidiness — unless it hides a fault. (A short tidiness note at the end is welcome: three questions of the
  changed lines — is anything duplicated, is anything more complicated than it needs to be, is anything left unused.)
- Anything about the phone layout other than "it changed" — it is meant to be exactly as on main.

## Your report
Each finding: **the concrete failure** (what a person does and sees), **its cause** (file and line), **the exact fix**
(step by step), and how sure you are. A claim with no concrete failure is not a finding. Then list what you checked and
found sound. Plain English. At most about 1,500 words.
