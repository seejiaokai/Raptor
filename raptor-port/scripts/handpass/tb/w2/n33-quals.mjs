/* W2 N33 — Quals: "Add qualifications" opens Admin, no note; and explore Admin for column removal (N29).  node n33-quals.mjs phone|desk */
import { L, sleep, toastNow, toastShown } from './w2lib.mjs'
console.log('n33-quals v1')
const size = process.argv[2] || 'desk'
const w = await L.world(size)
const p = w.page
try {
  await L.go(w, 'quals')
  await sleep(1200)
  const pre = await toastNow(p)
  console.log('note before:', JSON.stringify(pre && [pre.text, pre.opacity]))
  const a = p.locator('#qAddQual').first()
  console.log('link visible', await a.isVisible())
  await a.evaluate(e => e.scrollIntoView({ block: 'center' }))
  if (w.phone) await a.tap(); else await a.click()
  const reads = []
  for (const ms of [50, 300, 700, 1500]) { await sleep(ms); const t = await toastNow(p); reads.push(`${ms}ms ${t ? JSON.stringify(t.text) + ' op ' + t.opacity : 'none'}`) }
  const page = await p.evaluate(() => window.CURPAGE)
  const pic = await L.pic(w, `n33-${size}-admin-opened`)
  console.log(`== N33 [${size}] ${page === 'admin' && !reads.some(r => /op (1|0\.\d*[1-9])/.test(r) && !/op 0$/.test(r) && !/none/.test(r) && !/op 0\b/.test(r)) ? 'PASS' : 'CHECK'}\n   page now: ${page}\n   note reads: ${reads.join(' | ')}\n   pic ${pic}`)
  console.log(await p.evaluate(() => [...document.querySelectorAll('#page-admin button')].filter(b => b.getBoundingClientRect().width > 0).slice(0, 40).map(b => `#${b.id}|${(b.textContent || '').trim().slice(0, 40)}|${[...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',').slice(0, 40)}`).join('\n')))
} finally { await L.close(w) }
