/* THE DOOR, FOUND (22 Sep 26) — closes the open item at the bottom of
   docs/handpass/README.md.

   The board's PERSONAL INPUTS panel FOLDS to a one-line summary by default
   ("3 inputs · 3 on programme · show ⌄", sbInputsGroupPanel, board-html.ts).
   Folded, it renders NO rows at all — so the claim's own edit button is not
   merely hidden, it is absent from the DOM, which is exactly what the 21 Sep
   session measured and read as "the button was never drawn".

   The header IS the toggle: `[data-pitog="<di>"]`, routed through routeClick.
   Press it and the rows appear, each carrying its `data-inpedit` address.

   It also explains the other half of the confusion: the fold is `!acRo`, so a
   READ-ONLY board keeps the panel open — which is why the rows DO appear once
   the OIL mode is on (the mode makes the board read-only, fix 5), while the
   edit button there is correctly replaced by the OIL cell. */
import { open, board, tap, shot, SHOTS } from './lib.mjs'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
await board(page, 5)

const count = () => page.evaluate(() => ({
  doorsInBoard: document.querySelectorAll('#schedBoard [data-inpedit]').length,
  rows: document.querySelectorAll('#schedBoard .pinp .sb-arow.inprow, #schedBoard .pinp .sbi-row').length,
  head: (document.querySelector('#schedBoard .pinp') || {}).innerText?.replace(/\s+/g, ' ').trim().slice(0, 78),
}))
const before = await count()
await shot(page, 'door-01-panel-folded')

await tap(page, '[data-pitog="5"]')
await page.waitForTimeout(600)
const after = await count()
await shot(page, 'door-02-panel-open')

const doors = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-inpedit]')]
  .map(b => ({ iid: b.getAttribute('data-inpedit'), txt: (b.innerText || '').trim(),
               row: (b.closest('.sb-arow,.sbi-row') || {}).innerText?.replace(/\s+/g, ' ').trim().slice(0, 64) })))

console.log(JSON.stringify({ before, after, doors }, null, 1))
console.log('errors:', errors.slice(0, 4))
console.log('shots in ' + SHOTS)
await browser.close()
