/* diagnose: at phone width, is the day's board still covering the week? */
import { open, go, board, closeBoard, shot, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE, width: 390, height: 844 })
const snap = async (tag) => {
  const r = await page.evaluate(() => {
    const b = document.querySelector('#schedBoard')
    const bb = b ? b.getBoundingClientRect() : null
    const e = document.querySelector('#eWeek'); const eb = e ? e.getBoundingClientRect() : null
    return { page: window.CURPAGE, sbday: window.SBDAY,
      board: bb ? `${Math.round(bb.width)}x${Math.round(bb.height)} @${Math.round(bb.x)},${Math.round(bb.y)}` : 'absent',
      eWeek: eb ? `${Math.round(eb.width)}x${Math.round(eb.height)}` : 'absent',
      closeBtns: [...document.querySelectorAll('#schedBoard button')].map(x => (x.innerText || '').trim()).filter(Boolean).slice(0, 14) }
  })
  console.log(tag, JSON.stringify(r)); return r
}
await go(page, 'editsched'); await page.waitForTimeout(800)
await snap('before any board:')
await board(page, di); await page.waitForTimeout(400)
await snap('board open:   ')
const closed = await closeBoard(page); await page.waitForTimeout(700)
await snap(`after closeBoard(${closed}):`)
/* the phone's own way out */
const ways = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [id],#schedBoard [data-sbclose],#schedBoard .abtn')]
  .filter(e => e.getBoundingClientRect().width > 0)
  .map(e => ({ id: e.id, cls: e.className.slice(0, 40), txt: (e.innerText || '').trim().slice(0, 20) })).slice(0, 20))
console.log('visible controls still inside the board:', JSON.stringify(ways))
await shot(page, 'SURF-DIAG-phone-after-close')
console.log('errors:', errors.slice(0, 6))
await browser.close()
