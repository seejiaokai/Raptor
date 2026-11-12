console.log('rcf-w2-dbg4 v1')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w2/dbg4')
const W = await import('./rcf-w2-lib.mjs')
const { L, sleep } = W
const DI = 5
const browser = await W.launch()
const { page } = await W.world(browser)
await W.openBoard(page, DI)
const gi = await W.addWave(page, DI, 'sc')
console.log('sc wave', gi)
const attrs = await page.evaluate(() => { const a=[]; document.querySelectorAll('#schedBoard [data-bfld], #schedBoard [data-slot], #schedBoard [data-fill], #schedBoard [data-gline], #schedBoard [data-scflip], #schedBoard [data-flies], #schedBoard [data-wvdel]').forEach(e=>{ if (e.offsetParent===null) return; const ds = Object.entries(e.dataset).map(([k,v])=>k+'='+v).join(' '); a.push(ds+' '+e.tagName+'.'+String(e.className).slice(0,25)+' :: '+(e.innerText||'').slice(0,20))}); return a })
console.log(attrs.join('\n'))
console.log(JSON.stringify(await page.evaluate(d => window.DAYS[d].waves.map(w => ({ label: w.label, kind: w.kind, sa: w.sa, f: w.formations.map(f => Object.keys(f)) })), DI)))
await W.shot(page, 'sc')
await browser.close()
