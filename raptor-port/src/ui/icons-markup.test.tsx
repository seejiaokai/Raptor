/* THE APP'S ICONS DRAW EXACTLY AS BEFORE ([TRK-KEPT-COPIES], chat 20, 8 Nov 26). The Tracker kept its own copies of the
   app's pencil, gear, Reorder, Reset and list so a standalone export would carry them; with no standalone export any
   more (D1538) it draws them from the app's one source, passing its own class for its own size. Each icon took an
   optional class for that; everywhere else in the app it is called with none, and must print the very markup it
   printed before — recorded here from the build before the change, so a later edit cannot drift it unseen. */
import { appendFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { GearIcon, ListIcon, PenIcon, ReorderIcon, ResetIcon } from './icons'

/* PRINT_ICON_MARKUP=<file> writes each icon's markup there (the runner hides console output) */
const PRINT = process.env.PRINT_ICON_MARKUP || ''
const cases: [string, () => string][] = [
  ['GearIcon', () => renderToStaticMarkup(<GearIcon />)],
  ['ReorderIcon', () => renderToStaticMarkup(<ReorderIcon />)],
  ['ResetIcon', () => renderToStaticMarkup(<ResetIcon />)],
  ['ListIcon', () => renderToStaticMarkup(<ListIcon />)],
  ['PenIcon', () => renderToStaticMarkup(<PenIcon />)],
  ['PenIcon solo', () => renderToStaticMarkup(<PenIcon solo />)],
]
/* recorded 8 Nov 26 from the icons as they stood before the change (PRINT_ICON_MARKUP=<file>) */
const BEFORE: Record<string, string> = {
  "GearIcon":
    "<svg class=\"btnglyph\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z\"/></svg>",
  "ReorderIcon":
    "<svg class=\"btnglyph\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m21 16-4 4-4-4\"/><path d=\"M17 20V4\"/><path d=\"m3 8 4-4 4 4\"/><path d=\"M7 4v16\"/></svg>",
  "ResetIcon":
    "<svg class=\"btnglyph\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d=\"M3 3v5h5\"/></svg>",
  "ListIcon":
    "<svg class=\"btnglyph\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01\"></path></svg>",
  "PenIcon":
    "<svg class=\"pen-ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><g transform=\"rotate(-45 12 12)\" fill=\"currentColor\"><rect x=\"8.5\" y=\"1\" width=\"7\" height=\"4.6\" rx=\"2.4\"/><rect x=\"8.5\" y=\"6.4\" width=\"7\" height=\"12.2\" rx=\".3\"/><path d=\"M8.5 19.4h7l-2.6 3.1a1.2 1.2 0 0 1-1.8 0Z\"/></g></svg>",
  "PenIcon solo":
    "<svg class=\"pen-ic solo\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><g transform=\"rotate(-45 12 12)\" fill=\"currentColor\"><rect x=\"8.5\" y=\"1\" width=\"7\" height=\"4.6\" rx=\"2.4\"/><rect x=\"8.5\" y=\"6.4\" width=\"7\" height=\"12.2\" rx=\".3\"/><path d=\"M8.5 19.4h7l-2.6 3.1a1.2 1.2 0 0 1-1.8 0Z\"/></g></svg>",
}

describe('the app\'s icons, called as the app calls them, print the markup they printed before', () => {
  for (const [name, f] of cases) {
    it(name, () => {
      if (PRINT) { appendFileSync(PRINT, JSON.stringify([name, f()]) + '\n'); return }
      expect(f()).toBe(BEFORE[name])
    })
  }
})
