# Brief — the blind code read of the board-keys job (night of 7–8 Nov 26)

**You are one of two readers, each blind to the other (his D790; Astra's read called under his D1743).** Do not open,
search for or read any file named `*board-keys-read-opus*` or `*board-keys-read-astra*`, nor the evidence sheet
`raptor-port/docs/handpass/2026-11-08-board-keys.md` or anything under `raptor-port/docs/img/handpass/2026-11-08-board-keys/`.
Read only; change no file; commit nothing; run no build and no browser (unit tests of one file are fine:
`cd raptor-port && npx vitest run <file>`).

**The change:** one commit, `git show 24549f120` on branch `claude/board-keys` (its parent is `main`). Four source files
and two test files:
- `raptor-port/src/ui/SchedBoard.tsx` — the Scheduler Board's ⋯ menu (drawn only at a phone's width, ≤ 820: Insights,
  Sort all, the layout switch) reached by the keys: Enter, Space or ↓ on ⋯ opens it on its first item; ↑/↓ move round
  the enabled items; Escape closes it and, when the keys were in it, puts them back on ⋯; a pick made by the keys puts the
  keys back on ⋯ BEFORE the pick acts (so Insights' window or the Sort all box, which remember what had the keys when they
  opened, give them back to ⋯ when they close); the keys leaving the menu (Tab past it) close it. A mouse or a finger
  opens it as before, the keys left where they were.
- `raptor-port/src/ui/sheetfocus.ts` — `pressedByKeys(el)`, split out of `menuKeys`: whether the press now landing on
  `el` came from the keys (Enter, Space or ↓ pressed on it, no pointer since), read and forgotten.
- `raptor-port/src/ui/interactions.ts` — `MENU_BTN` gains `[data-daytpladd]`, the day bar's Templates button (drawn at a
  phone's width), so ↓ opens it as it opens the board's other menus.
- `raptor-port/src/ui/weekglide.ts` — the phone's glide across weeks ([WEEK-GLIDE-TWO-PAGES]): Edit Schedule and View-only
  Sched each keep their own week, both mounted (`Shell.tsx`), one shown. A burst of overlapping glides kept ONE week's
  pre-glide styles and put them back on the LAST week alone, so a cross on one page, a switch to the other and a cross there
  inside the first slide left the first page's week untouchable (`pointer-events:none`) and unscrollable (`overflow-x:hidden`)
  until a reload. Now each week a burst touches keeps its own pre-glide styles and its own latest landing (a `Map`), the
  page's clip one value per burst, and the burst's last finish puts every week back.
- Tests: `raptor-port/src/ui/boardmenukeys.test.tsx` (two new `describe` blocks), `raptor-port/src/ui/weekglide.test.ts`
  (one new case).

**The rulings it serves** (full rows: `grep -h '^| D1646 |\|^| D1652 |' .claude/decisions-full/*.md`, with the shell — a
search tool may hide a long row): **D1646** — on the Scheduler Board its small menus, its day and week chips and Edit
Schedule's day name are reached and pressed by the keyboard; a menu opened by Enter or ↓ puts the keys on its first item,
the arrows moving through it; the ring shows for the keys only, never after a click. The design guide's keyboard rule
(`.claude/rules/ui-design.md` short form point 3): Escape closes what opened last; the keys return to the button that
opened a thing; focus never hidden. **A click-open popup closes on a click outside it** (`raptor-port/CLAUDE.md` §Standing
UI rules). The week's own ⋯ (`raptor-port/src/ui/ScheduleInsightsMenu.tsx`) already behaves this way and is the pattern.
The glide's design is settled (`.claude/rules/decisions/scheduler.md` §Week navigation, the phone bullet) — read the
change against it, do not re-open it.

**The question: what is MISSING, and what does it break?** Ask, for each part:
1. **The ⋯ menu:** every way the menu can open, be moved through, picked from and closed — Enter, Space, ↓, ↑, Escape,
   Tab and Shift+Tab out, a click outside, a click on ⋯ again, a pick by the mouse after opening by the keys and the other
   way round, a disabled item (Sort all is disabled on a day being previewed), the board closing or changing day or layout
   with the menu open, the menu opened while Insights or Sort all is already up. In which of these does the menu stay open
   when it should close, close when it should stay, leave the keys on nothing (on the page behind the board), or put them
   somewhere a keyboard user cannot see? Does the `keyOn` reading (`sheetfocus.ts`) ever answer "by the keys" for a press
   that was not (a stale value from an earlier key press elsewhere, a pointer press that does not clear it), or "not" for
   one that was — and what does the person then see? Do the new listeners (the Escape listener's `stopPropagation`, the
   wrapper's `onBlur`, the menu's own `onKeyDown`) take a key or an event another part of the board or the app relies on
   (the board's own Escape that closes the board, the app-wide keyboard routing in `interactions.ts`, Tab kept on the board
   by `boardescape.ts keepTabOnBoard`)?
2. **The day bar's Templates:** does adding it to `MENU_BTN` make ↓ do anything wrong where that button appears (the board
   at a phone's width; anywhere else `data-daytpladd` is drawn)?
3. **The glide:** every order of start and finish across one and two weeks — two crosses on one week, one on each, three,
   finishes out of order, the fallback timer and `transitionend` both firing, a glide whose `run()` is never called, a week
   whose styles were already set by something else when the burst began. Can any order leave a week covered, unscrollable,
   on a stale day, or the page clipped? Does `held` ever keep a week past its burst (a leak that breaks the next burst)?
4. **The tests:** do the new cases pin the behaviour, or could the code be broken in a way they would not see? Name the
   case that is missing.
5. **Tidiness of the changed lines only** (D489): is anything duplicated that already exists, named so the next reader is
   misled, or left half-done? Filed, not fixed — say it, ranked low.

**Not a finding (D56):** a problem that lives only in data already stored, when the code is correct going forward — the
whole store is demo data, cleared before the database step. Also not a finding: wording or styling you would merely
prefer; how a focused item is DRAWN (a separate question already put to him); behaviour that was there before this commit
and is not made worse by it (say so if you see one, ranked as "before this change").
**A finding is a claim with a concrete failure** (what a person presses, on which screen and size, and what goes wrong),
**its cause** (file and line) **and its fix** — exact steps or replacement code where you can (D489). A claim you could not
make concrete is listed separately as a question, not a finding.

**Report:** each finding ranked high / medium / low, with file, line, the failing sequence, the cause and the fix; then
the questions; then, for each of the five parts, what you checked and found nothing in. Plain prose, no preamble.
