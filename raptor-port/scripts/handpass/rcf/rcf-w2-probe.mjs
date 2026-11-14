console.log('rcf-w2-probe v2')
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
const menu = await page.evaluate(() => [...document.querySelectorAll('.wavemenu *')].filter(e=>e.dataset && Object.keys(e.dataset).length).map(e => Object.entries(e.dataset).map(([k,v])=>k+'='+v).join(',') + ' :: ' + e.textContent.trim().slice(0,30)))
console.log('wavemenu', menu)
await page.keyboard.press('Escape')
const ppl = await page.evaluate(() => Object.entries(window.PEOPLE).filter(([k,p])=>/Ranger|Saber|Static|Havoc/.test(p.cs)).map(([k,p])=>k+':'+p.cs))
console.log(ppl)
await L.tap(page, `[data-gradd="${di}"]`)
await page.waitForTimeout(500)
const g = await page.evaluate((di) => ({ground: window.DAYS[di].ground, html: [...document.querySelectorAll('#schedBoard [data-grow], #schedBoard .sb-grow')].slice(0,3).map(e=>e.outerHTML.slice(0,800))}), di)
console.log(JSON.stringify(g,null,1))
const attrs = await page.evaluate(() => { const a={}; document.querySelectorAll('#schedBoard [data-bfld]').forEach(e=>{ if(/^g|^gr|^gp/.test(e.dataset.bfld)) a[e.dataset.bfld]=e.tagName+'.'+e.className}); return a })
console.log(attrs)
await L.shot(page, 'p-ground')
await browser.close()
