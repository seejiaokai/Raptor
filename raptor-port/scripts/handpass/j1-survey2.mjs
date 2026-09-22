import { open, board } from './lib.mjs'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
await board(page, 5)
const r = await page.evaluate(() => {
  const all = [...document.querySelectorAll('[data-inpedit]')]
  const inBoard = all.filter(e => e.closest('#schedBoard'))
  const vis = all.filter(e => e.offsetParent)
  const d = (window.DAYS || [])[window.SBDAY] || {}
  return {
    dayKeys: Object.keys(d).slice(0, 18),
    day: d,
    total: all.length, inBoard: inBoard.length, visible: vis.length,
    visibleInBoard: all.filter(e => e.offsetParent && e.closest('#schedBoard')).length,
    where: all.slice(0, 6).map(e => ({
      iid: e.getAttribute('data-inpedit'),
      txt: (e.innerText || '').trim().slice(0, 30),
      vis: !!e.offsetParent,
      host: (() => { let p = e, c = []; while (p && c.length < 6) { c.push(p.id ? '#' + p.id : (p.className || '').toString().split(' ')[0] || p.tagName); p = p.parentElement } return c.join(' < ') })(),
    })),
    boardPanels: [...document.querySelectorAll('#schedBoard .sb-panel, #schedBoard [class*=panel]')].filter(e=>e.offsetParent).map(e => (e.className||'').toString().slice(0,40)).slice(0,20),
  }
})
console.log(JSON.stringify(r, null, 1))
await browser.close()
