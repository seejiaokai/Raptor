/* Does the BOARD carry its own Undo? If not, fix 5's boundary is unreachable. */
import { open, board, tap } from './lib.mjs'
const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
await board(page, 5)
await tap(page, '[data-grflag="5.4"]'); await page.waitForTimeout(600)   /* give Undo something to do */
console.log(JSON.stringify(await page.evaluate(() => {
  const undoish = [...document.querySelectorAll('button,a,[role=button]')]
    .filter(e => e.offsetParent && (/undo|↶/i.test(e.innerText || '') || /undo/i.test(e.id) || /undo/i.test(e.title || '')))
    .map(e => {
      const r = e.getBoundingClientRect(); const cx = r.left + r.width/2, cy = r.top + r.height/2
      const top = document.elementFromPoint(cx, cy)
      return { id: e.id, txt: (e.innerText||'').trim().slice(0,18), title: (e.title||'').slice(0,40),
               inBoard: !!e.closest('#schedBoard'), disabled: e.disabled,
               y: Math.round(r.y), reachable: !!(top && (top===e || e.contains(top))),
               blockedBy: top ? (top.id?'#'+top.id:(top.className||'').toString().slice(0,24)) : null }
    })
  const sbTop = document.querySelector('#schedBoard .sb-top')
  return { undoish, sbTopRect: sbTop ? (r => ({y:Math.round(r.y),h:Math.round(r.height),z:getComputedStyle(sbTop).zIndex}))(sbTop.getBoundingClientRect()) : null }
}), null, 1))
await browser.close()
