// bell190-c probe 8: what Ranger (member) sees when he taps his own day — Aug and Dec.
const L = await import('./bell190-c-lib.mjs')
console.log('bell190-c-probe8 v1')
const w = await L.newWorld('desk')
await L.signIn(w, 'us', 'us'); await L.toWar(w)
for (const d of ['2026-08-12', '2026-12-09']) {
  const o = await L.openCell(w, 'bane', d)
  const ids = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => { const r = e.getBoundingClientRect(); return r.height > 0 && r.top > 450 && !/^(cell|head|req|avail|fly|row|bal)-/.test(e.dataset.testid) }).slice(0, 40).map(e => e.dataset.testid + ':' + (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30)).join(' | '))
  console.log(d, 'picker', o, ids)
  await L.shot(w, 'probe8-' + d)
  await L.closeWin(w); await w.page.keyboard.press('Escape')
}
await L.closeAll()
