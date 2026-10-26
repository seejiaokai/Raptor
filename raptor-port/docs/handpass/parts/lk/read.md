# The look-and-keys check (21 Oct 26) — the fresh, blind Opus code read, as handed back

Read the branch at `d76cce6` (before the fixes it led to). Saved whole by the host; the dispositions are in the sheet's §11.
The reader estimated about 130k tokens; the harness's figure is 364,702.

## Findings, most severe first

**1. HIGH: GitHub's full check on the head commit is red. Two browser tests fail on GitHub's Linux machines.**
- What fails: "Deploy to GitHub Pages" failed in the geometry shards 1/4 and 3/4, on retry too.
  - `e2e/look-keys.spec.ts:67`: the test's assumption ("one line") breaks. At 1440 the top bar is 104 tall on GitHub's
    machines (two lines). It is one line only on his PC, where the letters are narrower.
  - `e2e/availwin.spec.ts:343` ("the board closed: back in its corner"): expects 96, gets 112, at 1440×900 and 1440×700.
    The new rule is working correctly here: the bar is two lines, so the window opens under it. The test hard-codes the
    old corner. Line 344 ("no height cap left") would fail next, because the window now carries an inline max-height.
- Cause: both tests rely on a bar height that depends on the fonts. The code does not, since it measures the bar.
- Fix: `look-keys.spec.ts` "1440 wide…": run it at 1920×1000, where the bar is one line everywhere (or expect
  `barH < 70 ? 96 : barBottom + 8`). `availwin.spec.ts:343–344`: measure the top bar; expect `max(96, barBottom + 8)`;
  maxHeight `''` only when the bar is one line, otherwise `${innerHeight - top - 12}px`.
- Also: the sheet's §10 (Gates) is empty. Nothing may be reported green until this run is green.

**2. MEDIUM: two windows the person has not moved hide the bar from each other, so neither moves down (`floatwin.ts`
`barsUnder`).**
- Board route: at 1200 wide, open the board, the ALL AVAIL window from a count and the changes window from the board's
  History; both at 96, correctly. Press ✓ Done: both stay at 96 over the two-line top bar's last 8px.
- Narrowing route: open both where the bar is one line, narrow until it wraps. Same.
- Failed-save route: both open under a two-line bar, a failed save arrives; both re-place to 132 and stay over the band's
  last 8px.
- Cause: the hit test leaves out only the window itself; each window's test point lands on the OTHER window (z 410/411,
  above the bar's 60). New with the hit test; the walk and the tests opened one window at a time.
- Fix: leave out every movable window — `find(e => !e.closest('.floatwin, .chgwin, .availwin'))`; add an e2e.

**3. MEDIUM: a warning raised during a save's wait is told to a screen reader, then overwritten 50–650 ms later by "Input
added" / "Input updated" (`seen.ts`).**
- On the Inputs page a scheduler retypes a request on the Ground Programme to LL and saves; `holderbase.ts` raises "LL does
  not go on the Ground Programme — its row has been removed" a microtask after the save; that warning is now told; at
  80 ms (or 680) `noteUnlessSeen` sees another note and calls `tell('Input updated')`, which replaces it. VoiceOver often
  speaks only the latest polite words, so the warning can go unheard. Before this change the warning was not told at all.
- Fix: a note raised since the save keeps the reader's region as it keeps the screen — `say` raises nothing then; both
  `tell(words)` calls guarded; `seen.test.ts:158` expects the warning's words.

**4. LOW: the new keyboard ring is cut off inside the Cancel sheet's edit list (`12-schedule-editing.css`).** Tab to any ✕:
its right side is missing; the first row's top and the last row's bottom too. Cause: `.cxedit-list{overflow:auto}` with
no padding; a 2px ring 2px off reaches 4px outside the button. The walker read the computed style, not the pixels. Fix:
`.cxedit-list{padding:4px;margin:-4px}`.

**5. LOW: closing the ALL AVAIL window moves a note being read (`AvailWindow.tsx`).** On a phone a note raised while the
window is up stands at the top; closing the window sends it to the foot while it is read. Cause: the effect runs on close
too; `toast.ts` says "NOT when one closes". ChangesWindow has the same, older. Fix: `if (open) placeToast()`, both.

**6. LOW: the region keeps the last note's words after the note fades.** A reader swiping to the page's end meets an old
note as if current. Fix: in the hold's timeout, empty `#srSay` if it still holds this note's words.

**7. LOW: (d) missed a stale comment and a rule (`17-save-status.css`).** "in the two calendars it is a line of the column";
`.inpcal > .saveband` styles nothing reachable. Fix: reword; remove or mark the rule.

## Considered and left (no concrete failure)
The inline max-height can never be recorded as his size (the observer's guard); the phone ⇄ desktop flip clears every inline
style; the note (pointer-events none) is skipped by the hit test; the top bar's own menus and bands are inside it; the board
is shown in the same commit as the windows' placing; zoom and 125% are CSS pixels; a new desktop cost — a layout and a hit
test on every redraw of an open, unmoved window (not measured; check only if typing with a window open feels slow); the
corner tag (`--puck-w` never overridden, every builder draws the puck first and the count as a direct child, a hidden count
in print lands the tag where a lone puck's sits, the new rule out-ranks the old); the focus ring's selectors match only the
Cancel sheet and D842 is not engaged; the held clock (try/finally, the date only); the tests that read the note or the
region; W6 (closing forgets a dragged place — older and deliberate); the region made 30 ms before its first fill.

## Rows missing from the roll-call
Thing 1: two windows open together, re-placed after ✓ Done, after narrowing, and when the band arrives; the bar's line
count by platform. Thing 4: the ring seen in pixels inside the scrolling list. Thing 5: a warning raised while a save waits;
the note on a phone when the ALL AVAIL window closes.
