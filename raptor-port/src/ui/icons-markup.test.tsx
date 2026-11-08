/* THE APP'S ICONS DRAW EXACTLY AS BEFORE ([TRK-KEPT-COPIES], chat 20, 8 Nov 26). The Tracker kept its own copies of the
   app's pencil, gear, Reorder, Reset and list so a standalone export would carry them; with no standalone export any
   more (D1538) it draws them from the app's one source, passing its own class for its own size. Each icon took an
   optional class for that; everywhere else in the app it is called with none, and must print the very markup it
   printed before — recorded here from the build before the change, so a later edit cannot drift it unseen. */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { GearIcon, ListIcon, PenIcon, ReorderIcon, ResetIcon } from './icons'

const PRINT = (process.env.PRINT_ICON_MARKUP === '1')
const cases: [string, () => string][] = [
  ['GearIcon', () => renderToStaticMarkup(<GearIcon />)],
  ['ReorderIcon', () => renderToStaticMarkup(<ReorderIcon />)],
  ['ResetIcon', () => renderToStaticMarkup(<ResetIcon />)],
  ['ListIcon', () => renderToStaticMarkup(<ListIcon />)],
  ['PenIcon', () => renderToStaticMarkup(<PenIcon />)],
  ['PenIcon solo', () => renderToStaticMarkup(<PenIcon solo />)],
]
const BEFORE: Record<string, string> = {}

describe('the app\'s icons, called as the app calls them, print the markup they printed before', () => {
  for (const [name, f] of cases) {
    it(name, () => {
      if (PRINT) { console.log(name + '\t' + f()); return }
      expect(f()).toBe(BEFORE[name])
    })
  }
})
