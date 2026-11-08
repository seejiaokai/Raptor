// W1a probe: what the input window offers (types, filing place, people) — read only
import * as L from './sm-lib.mjs'
console.log('sm-w1a-probe v1')
const OUT = L.outDir('w1a')
const W = await L.launch('pc', { origin: 'http://localhost:4391' })
await L.signIn(W)
await L.fillNew(W, { who: 'Bolt', type: 'Other', iso: '2026-07-15' })
const info = await W.page.evaluate(() => {
  const win = document.querySelector('[data-testid="win-inputedit"]')
  const sels = [...win.querySelectorAll('select')].map(s => ({ id: s.id, opts: [...s.options].map(o => o.value + '=' + o.text) }))
  const ctl = [...win.querySelectorAll('button, input, textarea')].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.tagName}#${e.id}.${(e.className + '').slice(0, 30)}[${e.dataset.testid || ''}] ${(e.innerText || e.value || '').slice(0, 30)}`)
  return { sels, ctl, text: win.innerText.replace(/\s+/g, ' ').slice(0, 900) }
})
console.log(JSON.stringify(info, null, 1))
await L.pic(W, OUT, 'probe-window')
await L.closeAll(W)
