# Blind code read (fresh Opus) — the note's box and the Board's held sections, 25 Nov 26

Read: `FIX-DIFF.patch` and, whole or by the parts named, `ui/toast.ts`, `ui/scheduler/28-blocked.css`, `ui/dayswap.ts`,
`ui/SchedBoard.tsx` (the paint effect, `put`/`set`, the `resume` listener), `ui/board.ts` (`boardHTMLBody`,
`boardChange`, `boardTab`, `boardDayStep`, `boardWeekStep`, the sorts), `ui/board-html.ts` (the crew panels),
`ui/oilmode.ts dayBarHTML`, `ui/textedit.ts` (`textCaret`, the arriving box, `CARET_GONE`, the pressed-button rescue),
`ui/schedule-tab.ts`, `ui/EditWeek.tsx` (the week's hold), `ui/rowdrag.ts`, `ui/mission-role-offer.ts`,
`ui/pinchzoom.ts` (head), `state/store.ts loadWeek/enterWeek`, and `docs/ui-contracts.md` at both named contracts.
No compaction happened during this read; no handoff block was pasted into my context.

**Findings: 1** (PLAUSIBLE — proven in jsdom, real-browser reachability not confirmed; see its last paragraph).

---

## Finding 1 — the week stepped on the Board under a caret: the new week's sections drawn around the old week's

**What fails, in a person's words.** With the Scheduler Board open on a Monday and the caret in a box of the Board that
the week arrows do not first let go of (an In-time line, an Area or Time cell, a bombs field — any contenteditable box;
`boardTab` blurs only the `data-bfld` / `data-ifld` boxes), pressing the desktop strip's week arrow (» / «) loads the
next week and keeps the same weekday open. Every section of the Board except the one holding the caret is then
redrawn with **the next week's Monday**, while the section holding the caret (say Flying waves) stays **this week's
Monday**. The Board shows two different days side by side, one section each — exactly what the promise says must not
happen ("another day … writes nothing while the caret is on the Board, as before"). Before this change the whole Board
panel was held, so it showed one day (the old one) until the caret left.

**Steps.** Open the Scheduler Board on day 0 of a week with a flying wave that has an In-time line; put the caret in the
In-time line; press the week arrow on the day strip by a press that does not take the focus; look at the Board.

**Cause.** `ui/dayswap.ts swapKidsAround` decides "the same blocks in the same places" by `blockId`, which for a
section is its `data-secmove` — `"<day index>.<section>"` (`board.ts boardHTMLBody wrapSec`). The day INDEX is not the
day: `boardWeekStep` (`board.ts`) calls `loadWeek(shiftWeek(CURWEEK, dir))` then `boardTab(Math.min(di, …))`, the two
notifies batch into one paint (its own comment says so), `SBDAY` is the same index, so the paint effect in
`SchedBoard.tsx` never sees `SBDAY == null` (the only place `panelPrev`/`panelKids` are cleared), every id lines up, and
`put`'s caret branch writes every changed section from the new week. `navGen()` is bumped by the week swap
(`state/store.ts enterWeek` → `view.bumpNav()`), but the paint effect's held path never compares it (only `resume`
does). The week page's own twin avoids this differently (`EditWeek.tsx` refuses the held path while `WEEKJUMP` is set).

**Proof (run).** `D:/rw4/night3/opus-proofs/raptor-port/src/ui/opus-proof-week.test.tsx` (the patch's own harness from
`board-heldpanel.test.tsx`): Board open on day 0, caret focused in `#sbBoard [data-itline]`, `boardWeekStep(1)`.
Result today — **fails**: week 13/07/2026 → 20/07/2026, `SBDAY` still 0, caret still in the line; sections replaced
under the caret: notes, prog, duty, sims, ground, inputs, avail, sans, unav (their words changed too); held: waves.
The test expects no section replaced.

**Fix, step by step (tried).**
1. In `SchedBoard.tsx`, beside `panelKids`, keep `const panelNav = useRef<Record<string, number>>({})`.
2. In `put`'s whole-write line, record it: `el.innerHTML = html; panelPrev.current[key] = html; delete
   panelKids.current[key]; panelNav.current[key] = navGen()`.
3. At the top of `put`'s caret branch: `if (panelNav.current[key] !== navGen()) { delete panelPrev.current[key];
   return }` — a different week (or session, role, unit — everything that bumps the navigation generation) holds the
   whole panel, as before this change; the paint after the caret leaves writes it whole and records the new value.
   (`SBDAY == null` already clears `panelPrev`/`panelKids`; clearing `panelNav` there too is harmless but not needed.)
I applied exactly this to the proof copy only (`D:/rw4/night3/opus-proofs/patch-nav.mjs`): the proof test then passes,
and the patch's own `board-heldpanel.test.tsx` (7 tests) still passes. An alternative is to put the week into
`blockId` for board sections, but the navigation generation is the narrower, already-maintained signal.

**Reachability — why PLAUSIBLE, not CONFIRMED.** The week arrows are focusable spans (`tabindex="0"`,
`board.ts dayTabsHTML`); a mouse click in Chrome or Safari on a Mac moves the focus to the span, so the line commits
and the caret is gone before the paint — no fault there. The fault needs a press that leaves the caret in the line: a
touch on a phone using the desktop layout (the strip's week arrows drawn there) where the browser does not move the
focus on a tap — the app already documents that "a tap on Safari does not" move the focus for its buttons; whether
iOS also leaves the focus on a tapped `tabindex` span I did not establish. Day arrows and day chips are safe: they
change the day index, so the ids differ and nothing is written (the patch's own test covers that).

Side note, pre-existing and NOT this change (unverified lead for the host): in the same situation the In-time line,
left later, carries its old `di|gi|ix` address; `textedit.ts` commits a line by that address against `DAYS`, which by
then is the new week — before and after this change alike. I did not test whether an untouched line writes.

---

## Checked and found sound

- **The note's box.** `overflow-wrap:anywhere` is added only to the element's first-creation style; `placeToast`
  only sets `left/right/transform/textAlign/top/bottom`, so no path drops it. A box breaks inside a word only where no
  ordinary break fits, so an ordinary note's lines, a time like 09:00 and a callsign are unchanged. Desktop: the box is
  `left:50%`, shrink-to-fit inside the right half; with `anywhere` its min-content no longer exceeds that, so a long
  word can no longer widen it off-screen; one-line notes stay one line (max-content unchanged). Phone: held 12px each
  side, centred words, unchanged. The grey "Blocked:" face is `display:flex` with `.bk-words{min-width:0}`; the
  property inherits into the words, so a long typed name breaks there too; the sign keeps its 14px. Colours, place
  above the "OIL not answered" bar, the top position with a window up: untouched code. No other writer of
  `#toastEl`'s style (`boardland.ts` only reads it). Older WebKit without `anywhere` simply ignores it (old behaviour).
- **What the panel's top-level children are.** Editable board: the day bar (`DIV.sb-panel daybar`) plus one
  `.sb-sec[data-secmove]` per section — every crew panel always draws a header, so the count does not change in
  ordinary editing. OIL Earn: the day bar's class gains `oilon` and the sections are unwrapped → ids differ → nothing
  written (as promised). Read-only, frozen (`pv-frozen`, also returned early by `DPREV`), quarantined: no caret path
  that reaches the swap with matching ids.
- **The record.** `panelKids` and `panelPrev` stay consistent with the screen on every path: a whole write sets
  `panelPrev` and drops `panelKids`; a swap that owes nothing sets both from the new string; an owed swap or a
  mismatch drops `panelPrev` and keeps what is on screen in `panelKids`; `SBDAY == null` clears both. `panelPrev` is a
  string only when `panelKids` is absent or describes the same string, so `was` is never stale. An owed section stays
  owed while the caret is in it (new markup never equals the `OWED` marker), is written as soon as the caret is in
  another section, and the settled paint after the caret leaves writes the panel whole (its `panelPrev` was dropped).
  A swap that owed nothing leaves `panelPrev` equal, so the settled paint skips — fewer rewrites than before.
- **The comparison.** Both sides are canonical strings of template-parsed markup (the first from `kidsOfHTML` of the
  last written string, later ones captured before `replaceWith`), never live decorated nodes. Same identity, other
  content → written (or owed if it holds the caret). Text or comments between children → `loose` → nothing written;
  the live side is counted by element children. Order changes, an added/removed section, another day index → nothing
  written (tested by the patch).
- **What a partial write no longer protects.** Every board listener is delegated on `#sbBoard` or the wrap
  (`boardMbtn`, `boardArmClick`, `boardChange`, `wireRowDrag`, the History bubble), so a replaced section loses none.
  The Blue/Red question and its offer button hang inside a section and are put back by `reconcileMissionRoleOffer`,
  which runs after every paint; menus (`.stmenu`) and the History bubble live on `document.body`. A grip drag blurs
  the caret first and refuses a drop on a detached node. Sorts and Sort all blur first. Pinch zoom stretches the
  target box, not its children. Highlights, gold dots, wave-report clocks and the bubble are re-applied after the
  paint as before. `holdingPlace` still wraps the write, so a section above the caret that changes height does not
  move the box (the board's scroller is `.sb-board` / `.sb-main`, no inner scroller holds text boxes).
- **The arriving box and the Tab route.** A click from a box in one section to a box in another: the save's paint sees
  the arriving box as the caret (`textCaret` → `arriving()`), so the destination's section is held and the left box's
  section is written — the destination is never replaced under the press. The Tab route collects its destination
  before the blur; the save's paint runs after the handler (React's flush), by which time the destination holds the
  caret, so its section waits and the source's is written; `refresh(next)` still brings the destination up to date.
  The route's own catch-up paths (`flushSync(notify)`) run with no caret and write whole, as before.
- **Undo / Redo.** Per the contract they let the caret go first, so their paint is the whole one; the owed marker
  covers a section put back to what it last showed while the caret stays (the patch's third test).
- **A caret outside the Board** (a window over it, the warning panel): the effect still returns before writing, as
  before — not changed by this patch.
- **Cost.** A held paint now parses the panel string once (twice on the first held paint, from the last written
  string) and serialises each top-level child; that is less work than the whole write every caret-less paint already
  does, and it only runs on paints caused by a change.

## Tidiness note (changed lines only — filed, not fixed)

1. *Anything not needed?* `swapKidsAround` checks both `prev.html.length !== nk.length` and the per-place ids; the
   ids check already implies the html-length one when ids and html are built together (they always are). Harmless.
2. *Anything said twice?* The story of the fix (Personal Inputs → Ground Programme row one change behind, the OWED
   lesson) is told in full three times — the `dayswap.ts` header of `swapKidsAround`, the `put` comment in
   `SchedBoard.tsx`, and the test file's header — plus `ui-contracts.md`; one home and a pointer would do. The note
   box's reason is told in `toast.ts` and again in the e2e header.
3. *Hard to follow?* `put`'s caret branch packs four decisions into four dense lines (`was` from two sources, `kids`
   kept or dropped, `panelPrev` kept or dropped); a one-line comment per record would help the next reader. `blockId`'s
   fallback to the class string is fine but its reason (the day bar, OIL Earn's unwrapped panels) is only in the long
   header above.
