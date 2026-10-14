import { L, openBoard, sleep, clearToast, toastShown } from './w2lib.mjs'
console.log('explore-phone-oil2 v1')
const w = await L.world('phone')
const p = w.page
try {
  await openBoard(w, 5)
  const sel = '#schedBoard .gctl button[data-oilmode]'
  console.log('n', await p.locator(sel).count(), await p.evaluate(() => [...document.querySelectorAll('.gctl button')].map(b => b.outerHTML.slice(0, 200)).join('\n')))
  await clearToast(p)
  await w.press(p.locator('.gctl button:visible').first())
  const t = await toastShown(p)
  console.log('NOTE:', JSON.stringify(t && t.text))
  await sleep(500)
  await L.pic(w, 'explore-phone-oil2-0')
  console.log(await p.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [role=switch], #schedBoard input[type=checkbox]')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && /oil|earn/i.test((b.className + b.id + (b.title||'') + b.textContent + [...b.attributes].map(a=>a.name+a.value).join(''))) }).slice(0,30).map(b => `${b.tagName}#${b.id}.${String(b.className).slice(0,30)}|${b.textContent.trim().slice(0,20)}|${[...b.attributes].filter(a=>a.name.startsWith('data-')||a.name.startsWith('aria')).map(a=>a.name+'='+a.value).join(',')}|t=${b.title}`).join('\n')))
} finally { await L.close(w) }
