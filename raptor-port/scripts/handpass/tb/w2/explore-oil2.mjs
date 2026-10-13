/* explore: Saturday board, press OIL Earn, read note + what is drawn.  node explore-oil2.mjs phone|desk */
import { L, openBoard, sleep, clearToast, toastShown, signDay, pressDay } from './w2lib.mjs'
console.log('explore-oil2 v1')
const size = process.argv[2] || 'desk'
const w = await L.world(size)
const p = w.page
const desc = sel => p.evaluate(s => [...document.querySelectorAll(s)].filter(b => b.getBoundingClientRect().width > 0).slice(0, 40).map(b => `${b.tagName}#${b.id}.${String(b.className).slice(0, 28)}|${(b.textContent || '').trim().slice(0, 24)}|${[...b.attributes].filter(a => a.name.startsWith('data-') || a.name.startsWith('aria-')).map(a => a.name + '=' + a.value).join(',').slice(0, 70)}|t=${(b.title || '').slice(0, 50)}`), sel)
try {
  await openBoard(w, 5)
  await clearToast(p)
  await w.press('#sbOil')
  const t = await toastShown(p)
  console.log('NOTE after OIL Earn:', JSON.stringify(t && t.text))
  await sleep(500)
  console.log((await desc('#schedBoard [data-oilday], #schedBoard [class*=oil], #schedBoard .sw, #schedBoard [role=switch], #schedBoard [aria-pressed]')).join('\n'))
  await L.pic(w, `explore-${size}-oilearn`)
} finally { await L.close(w) }
