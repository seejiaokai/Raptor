/* OPENING THE ALL AVAIL WINDOW — moved whole, word for word, out of ui/AvailWindow.tsx (3 Nov 26 — React Doctor's
   only-export-components: the window's file hands out its parts alone, so it can be swapped in place while the app is
   being built), the way the changes window's opener has its own small module (ui/changesopen.ts). The board's and the
   week's count chips call it. */
import { raiseWin } from './floatwin'
import { withChipWorld } from './html'
import { oilModeOn, oilItemLabel } from './oilmode'
import { AVAILWIN, setAvailWin, AVAILWIN_BOX, setAvailWinBox } from './pops'

/* OPENING THE WINDOW FROM A COUNT CHIP — one body for the board and the week,
   which both draw the chip. A second opener is how the chip and its tap came to
   disagree once before (Fable correction 2). The title is read IN THE CHIP'S
   WORLD, so an issued chip is titled by the issued row even if it has been
   renamed since; it is kept as the fallback the window shows if the row is
   later deleted behind it (S14).

   WHICH HALF IT OPENS ON. Availability is the default and is always offered;
   inside the earn mode the counter IS the door to switching men off — the job
   he opened it for — so it lands on that half. Not for a VERSION's chip: a
   record is read, never edited, so it lands on availability. */
export function openAvailWinFrom(osn: HTMLElement) {
  const di = +(osn.dataset.oilday || -1), item = osn.dataset.oilsent || '', ver = osn.dataset.oilver || ''
  const ofw = osn.dataset.oilofw === '1'
  const lbl = withChipWorld(di, ver, ofw, () => oilItemLabel(di, item))
  /* A NEW SUBJECT FOR AN OPEN WINDOW KEEPS ITS PLACE (Fable, final read): he
     dragged it aside to see the board, and tapping a second chip should not
     throw it back over what he is looking at. A window opened fresh still
     starts where the stylesheet puts it (S11). */
  const keep = AVAILWIN ? AVAILWIN_BOX : null
  setAvailWin({ di, item, ver, ofw, name: lbl.name, when: lbl.when, tab: oilModeOn(di) && !ver ? 'oil' : 'who' })
  if (keep) setAvailWinBox(keep)
  raiseWin('avail')
}
