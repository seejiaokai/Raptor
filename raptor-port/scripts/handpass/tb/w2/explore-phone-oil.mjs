import { L, openBoard, sleep } from './w2lib.mjs'
console.log('explore-phone-oil v1')
const w = await L.world('phone')
const p = w.page
try {
  await openBoard(w, 5)
  const r = await p.evaluate(() => [...document.querySelectorAll('[id=sbOil], [data-oilmode]')].map(e => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return `${e.tagName}#${e.id} ${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)} display ${cs.display} vis ${cs.visibility} parent ${e.parentElement.className}` }))
  console.log(r.join('\n'))
  await p.locator('#sbBoard').first().evaluate(e => e.scrollIntoView())
  await sleep(300)
  await L.pic(w, 'explore-phone-oil-0')
  console.log(await p.evaluate(() => (document.querySelector('#sbBoard')||{}).innerText.slice(0, 300)))
} finally { await L.close(w) }
