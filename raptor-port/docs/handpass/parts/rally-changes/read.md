# [RALLY-BOX-CHANGES] — the fresh, blind Opus read (19 Oct 26)

Reader: a fresh Opus 5.5, blind to the chat that wrote the code (D790; no Fable, D903). Read: the brief
`docs/superpowers/briefs/2026-10-19-rally-changes-read.md`; `git diff 4e93d0455..HEAD -- raptor-port/src raptor-port/e2e`
(head 0c83b57f2); the evidence sheet's roll-call, door check and sizing; the scenario list; walkers A, B and C; the full
rows of D1035–D1041, D1026, D1030, D1032, D606, D592, D516, D24. Read around the diff: every reader of `scIntime`,
`seatIntime`, `scReport`, `f.br` and `f.rl` (events, oil, avail, validate, slots, publish, restore, histbubble, export,
printpdf, peek, html, board), and the focus / click routes into `placeSuggestion`. Nothing was run and no file changed but
this one.

## Findings

### F1 — medium — a select-all then typing loses the first digit when it matches the suggestion's first digit
**Where:** `raptor-port/src/ui/interactions.ts`, `firstChange` (lines 621–629), called by `firstTypingReplaces`
(630–638) for both the board's box and the week's box.

**What a scheduler sees:** a flying line, take-off 13:00, so the B box offers 10:40. He taps B (10:40 placed, the short
ring). Out of the old habit — before D1038 the placed time was highlighted, and on his iPhone a double-tap or "Select All"
gives the same — he selects the whole time and types `1100`. The box ends up `100`, and leaving it saves **01:00**, not
11:00. On an R box the same gives a rally ten hours early: a false crew-rest breach, a false long day, a wrong OIL start on
a weekend. The same happens for any suggestion whose first digit he retypes (10:xx–19:xx and 2x:xx typed over with a
leading `1` / `2`); with a leading `0` the zero is dropped and the result happens to parse the same. A paste of the same
digits without the colon over a whole selection (`0940` over `09:40`) empties the box.

**Cause:** `firstChange` judges the change by the shape of the new value alone. A select-all replaced by `1` leaves
`"1"`; against `"10:40"` the common start is `"1"` and the rest is empty, so the "something was taken out" branch
(`d < 0 && v.slice(p) === sug.slice(p - d)`) matches and returns `''` — it reads a replacement as a Backspace. The code's
own comment promises the opposite ("one whose whole value was replaced (a person selected it and typed) keeps what was
typed"), and RB9 pins only `firstChange('09:40', '1')`, where the digit differs.

**Fix:**
1. Give `firstChange` the input event's kind: `firstChange(sug: string, v: string, kind = ''): string | null`.
2. Inside it, take the insertion branch (`d > 0`) only when `kind === '' || kind.startsWith('insert')`, and the deletion
   branch (`d < 0`) only when `kind === '' || kind.startsWith('delete')`. An `insert…` that leaves the value shorter is a
   selection replaced — return `null`, so the box keeps what was typed or pasted. An empty `kind` (an old browser) keeps
   today's shape-only reading.
3. In `firstTypingReplaces`, take the event: `return (e?: Event) => { … const n = firstChange(sug, read(), (e as InputEvent | undefined)?.inputType || '') … }`
   — the `addEventListener('input', typed)` calls stay as they are.
4. Pin it in `brieftime-ui.test.tsx` RB9: `firstChange('10:40', '1', 'insertText')` is `null`;
   `firstChange('09:40', '0940', 'insertFromPaste')` is `null`; `firstChange('09:40', '09:4', 'deleteContentBackward')` is
   `''`; `firstChange('09:40', '09:401', 'insertText')` is `'1'`; and the existing shape-only cases with no kind.

### F2 — low — a second take of the same box inside its second has its ring cut short
**Where:** `raptor-port/src/ui/interactions.ts`, `flashTaken` (639–645).

**What a scheduler sees:** he taps a faint R (placed, ring on), presses Escape (box empty again, ring off), and taps it again
within the second: the second ring is cut off early — gone at about 1.2 s after the FIRST tap, so it can last a few tenths
of a second. The comment says the flash is "restarted if the same box is taken twice"; it is restarted and then ended by
the first take's timer.

**Cause:** each call starts its own `setTimeout(end, 1200)`; the first call's timer is never cleared, and its `end`
removes `sugtook` whatever flash is running then.

**Fix:** keep the running flash on the element. At the top of `flashTaken`: `const prev = (el as any)._sugEnd; if (prev) prev()`;
in `end`, also `clearTimeout(t)` and `delete (el as any)._sugEnd`; then `const t = setTimeout(end, 1200); (el as any)._sugEnd = end`.
Pin: place, Escape, place again at once, then after 1.0 s the class is still on; after 1.3 s it is off.

### F3 — low — six comments still describe the build before this change
A comment is dated the day it is written (record-decisions.md); these now say the opposite of the code:
- `raptor-port/src/ui/board.ts` 196: "A standby wave carries no rally, so its R heading is blank" — the heading now reads R
  on every wave (line 199). Replace with "every wave has its R heading — a standby line has its rally box too (D1040)".
- `raptor-port/src/ui/board.ts` 250: "one tap places it highlighted" — say "one tap places it, not highlighted, with a short
  ring (D1038)".
- `raptor-port/src/ui/html.ts` 1868–1869: "One tap places it, highlighted, so whatever is typed next replaces it" — the
  same correction.
- `raptor-port/src/engine/publish.ts` 773–774: "The CSV does print a computed brief on a standby line" — since D1039
  (`export.ts` 81) it does not; drop the sentence or say "did, until D1039".
- `raptor-port/src/ui/board-stores.test.tsx` 140: "a standby line carries no rally (D1026's build): an empty place keeps
  the R track" — the assertions below it now say the opposite.
- `raptor-port/src/engine/rallybox.test.ts` 55, the test's name "a standalone wave carries no rally: a stray value there is
  never read" — true of the flying-line reader it tests (`resolveReporting`), no longer of the app (an SC rally is read by
  `scReport`). Rename to "the flying-line reader ignores a standalone wave's rally (an SC line's is scReport's, D1041)".

## Older, not this change (one line each)
- An overnight SC MAIN shift (19:00–07:00) with R 01:00 reads as 01:00 that same morning — a false 30-hour day and a false
  crew-rest breach (walker C's FAIL). The R box inherits the B box's long-standing evening-before rule (`scIntime`, only a
  shift starting within the report lead of midnight rolls back), which does exactly the same for a B of 01:00.
- The crew picker's crew-rest grey-out for an SC MAIN seat judges from the shift's START (`avail.ts` 430, `scStart`), never
  from its B — and so not from its R either; the warning list then flags a man the picker offered. As old as SC's B box.
- A typed `24:00` is accepted on every time box, flying ones included (walker A).

## Checked and fine
- **One reading of SC's report.** `scReport` takes each box by `scIntime`'s own rule, then the earlier; crew rest
  (`seatIntime` → `buildDay`), the long day and work hours (the events' `report`), the SC in-time advisory, Insights and OIL
  (`dayOilWork`, on the published day's own lead) all go through it. The SANS window (`avail.ts` 272) reads it too, and is
  carved out for SPARE seats (`spareLike0`), so a SPARE's R moves nothing there.
- **SC MAIN only.** SPARE rows never reach the events (`saExempt`), and OIL gives a switched-on SPARE the written window
  (`seatWin`); AVALON and BB never call `scReport` (`wv.kind==='sc'` in OIL; `saExempt` before the events). A later R
  shortens nothing (OIL `scB<scWin[0]`; crew rest `insOf` takes the earlier of report and start). An empty or unreadable R
  is `null`.
- **The crew-rest sentence.** "'s rally is" only when the report is R and R is strictly earlier than B; R equal to B says
  "in-time" (a fair choice the rulings do not decide); an evening-before R and B are compared after each is rolled; a SPARE
  row raises no shift leg, so a flipped badge cannot leave a wrong word.
- **Every surface that draws a standby line's times:** the board at both layouts (R input in the R/B cell, no
  placeholder, `dis` and `stoRO` gate it like B), the week edited and read (R above START, `SA_TIME_HEAD`), the next-week
  peek, the version look, the export and the PDF (`printpdf.ts` reads `schedRows`). No other builder draws standby times
  (searched every `isStandalone` / `.standalone` reader under `src/ui` and `src/state`). The history jump's "board only"
  list (`histbubble.ts onlyOn`) rightly names SC's B and not its R. Pending, roll-back and undo carry `ff:…rl` on every
  formation (`restore.ts` 78).
- **No worked-out time on standby lines:** board `brSug` / `rlSug` both `!sa`; the week's standby branch has no B and an
  R with no `data-ph`; the export's Brief is blank unless typed. `faceRuleValsCompared` already ignored standby lines, so
  no published day goes pending from this.
- **The suggestion's two surfaces** (board input, week box) both go through `placeSuggestion`, and both get the flash;
  `.sugbox` is drawn nowhere else. The flash ends at once on an input or Escape (the walkers' fix), on a redraw that
  replaces the box (a new element has no class), and is held steady under reduced motion. The first change is read once:
  typing at the end or in the middle, a paste, a Backspace, an arrow then a digit (replaces, as D1030 says), autocorrect
  or IME text that lands as one insertion — all right, except the selection case in F1.
- **Saving a taken time:** blur and Enter raise `change` only while the box still holds the suggestion and is still
  in the page; Escape restores first so neither fires; the phone's press-then-focus route places it after the arrival's
  own refresh. Tests RB8–RB10 and the e2e cover the build's new behaviour.
- One cosmetic, not a finding: on the week, the ring's last frame (transparent, held by `forwards`) also hides the
  focused box's own thin outline from 1.0 to 1.2 s, then it comes back.
