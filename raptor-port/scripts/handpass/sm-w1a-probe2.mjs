// W1a probe 2: the "Several people" control and a shared input's rows on the week and the board — read only
import * as L from './sm-lib.mjs'
console.log('sm-w1a-probe2 v1')
const OUT = L.outDir('w1a')
const W = await L.launch('pc', { origin: 'http://localhost:4391' })
await L.signIn(W)
await L.fillNew(W, { who: 'Bolt', type: 'Other', iso: '2026-07-15', remarks: 'Range party' })
await W.page.locator('[data-testid="inpEdit-goes-u"]').click(); await L.sleep(300)
await W.page.locator('[data-testid="pp-several"]').click(); await L.sleep(600)
const info = await W.page.evaluate(() => {
  const win = document.querySelector('[data-testid="win-inputedit"]')
  const ctl = [...win.querySelectorAll('button, input, select, textarea')].filter(e => e.getBoundingClientRect().width > 0 && !/dcal|inpEdCal/.test(e.className + (e.dataset.testid || ''))).map(e => `${e.tagName}#${e.id}.${(e.className + '').slice(0, 30)}[${e.dataset.testid || ''}] ${(e.innerText || e.value || '').slice(0, 30)}`)
  return ctl
})
console.log(JSON.stringify(info, null, 1))
await L.pic(W, OUT, 'probe2-window')
await L.closeAll(W)
