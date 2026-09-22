/* Is the Undo button actually reachable with the board open? fix 5's whole
   boundary assumes a person presses Undo while the mode is on, and the mode
   only exists on the board. */
import { open, board, tap } from './lib.mjs'
const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
const probe = async (tag) => await page.evaluate((t) => {
  const b = document.querySelector('#undoBtn')
  if (!b) return { tag: t, present: false }
  const r = b.getBoundingClientRect()
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2
  const top = document.elementFromPoint(cx, cy)
  return {
    tag: t, present: true, disabled: b.disabled,
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    whatIsOnTop: top ? (top.id ? '#' + top.id : (top.className || '').toString().slice(0, 30) || top.tagName) : 'nothing',
    isTheButton: !!(top && (top === b || b.contains(top))),
  }
}, tag)
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
console.log(JSON.stringify(await probe('board CLOSED'), null, 1))
await board(page, 5)
console.log(JSON.stringify(await probe('board OPEN'), null, 1))
await tap(page, '#sbOil'); await page.waitForTimeout(700)
console.log(JSON.stringify(await probe('board OPEN, mode ON'), null, 1))
await browser.close()
