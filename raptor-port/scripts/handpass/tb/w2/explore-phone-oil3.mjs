import { L, openBoard, sleep, clearToast, toastShown } from './w2lib.mjs'
console.log('explore-phone-oil3 v1')
const size = process.argv[2] || 'phone'
const w = await L.world(size)
const p = w.page
try {
  await openBoard(w, 5)
  await clearToast(p)
  const b = p.locator('#schedBoard [data-oilmode="5"]:visible').first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await w.press(b)
  const t = await toastShown(p)
  console.log('NOTE:', JSON.stringify(t && t.text), t && JSON.stringify(t.box))
  await sleep(600)
  await L.pic(w, `explore-${size}-oil3-0`)
  console.log(await p.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [role=switch], #schedBoard input[type=checkbox], #schedBoard .oilsw, #schedBoard [class*=oil]')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 }).filter(b => /oil|earn/i.test(b.className + b.id + (b.title||'') + [...b.attributes].map(a=>a.name+a.value).join(''))).slice(0,30).map(b => `${b.tagName}#${b.id}.${String(b.className).slice(0,30)}|${b.textContent.trim().slice(0,30)}|${[...b.attributes].filter(a=>a.name.startsWith('data-')||a.name.startsWith('aria')).map(a=>a.name+'='+a.value).join(',')}|t=${b.title}`).join('\n')))
} finally { await L.close(w) }
