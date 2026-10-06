/* exploratory: what controls the board draws (read-only on the app) */
import * as K from './stk-B-lib.mjs'
const { B, L, W } = K
const { browser, p, errors } = await K.fresh()
const m = await K.addFlyWave(p, 1)
await K.addLine(p, 1, m.gi)
const attrs = await p.evaluate(() => {
  const o = {}
  for (const e of document.querySelectorAll('#schedBoard *')) for (const a of e.attributes) if (a.name.startsWith('data-') || a.name === 'id') {
    const k = a.name; o[k] = o[k] || { n: 0, ex: a.value.slice(0, 40), tag: e.tagName }; o[k].n++
  }
  return o
})
for (const [k, v] of Object.entries(attrs)) console.log(k, v.n, v.tag, JSON.stringify(v.ex))
console.log('WAVE', JSON.stringify(m))
console.log('top bar ids', await p.evaluate(() => [...document.querySelectorAll('#undoBtn,#redoBtn,#sbUndo,#sbRedo,#sbDone,#sbClose,#editSchedMore')].map(e => e.id + ':' + (e.offsetParent !== null))))
await B.pic(p, 'explore-board')
console.log('errors', errors)
await browser.close()
