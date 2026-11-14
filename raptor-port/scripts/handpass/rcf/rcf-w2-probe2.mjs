console.log('rcf-w2-probe2 v1')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w2/probe')
const L = await import('../lib.mjs')
const { browser, page, errors } = await L.open({ width: 1536, height: 864 })
const di = 5
await L.board(page, di)
await L.tap(page, `[data-wvadd="${di}"]`)
await page.locator('.wavemenu [data-wmkind=""]').first().click(); await page.waitForTimeout(500)
await L.tap(page, `[data-gradd="${di}"]`)
await page.waitForTimeout(500)
const attrs = await page.evaluate(() => { const a=[]; document.querySelectorAll('#schedBoard [data-bfld], #schedBoard [data-slot], #schedBoard [data-fill], #schedBoard [data-gline]').forEach(e=>{ if (e.offsetParent===null) return; a.push((e.dataset.bfld?'bfld='+e.dataset.bfld:'')+(e.dataset.slot?' slot='+e.dataset.slot:'')+(e.dataset.fill?' fill='+e.dataset.fill:'')+(e.dataset.gline?' gline='+e.dataset.gline:'')+' '+e.tagName+'.'+String(e.className).slice(0,25))}); return a })
console.log(attrs.join('\n'))
console.log(await page.evaluate(()=>JSON.stringify(window.DAYS[5].waves.map(w=>({label:w.label,f:w.formations.map(f=>({to:f.to,ld:f.ld,ac:f.aircraft.length}))})))))
await L.shot(page, 'p-wave')
await browser.close()
