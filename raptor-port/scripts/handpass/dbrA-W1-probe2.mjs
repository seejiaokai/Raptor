/* W1 probe 2 — a driver check: arming a flying seat on the edit week, the week key, what a note and a puck write. */
process.env.HP_URL ||= 'http://localhost:4201'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W1'
process.env.HP_OUT ||= 'C:/Users/User/AppData/Local/Temp/claude/dbrA-W1-probe.json'
const L = await import('./dbrA-lib.mjs')
const H = await import('./lib.mjs')
const A = await import('./am/am-lib.mjs')
const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const p = await L.page(ctx, errors, 'A')
await L.signIn(p, 'a')
await L.go(p, 'editsched')
const a1 = await L.step(p, 'note Mon', () => A.editText(p, 'dn:0.0', 'W1 NOTE MON'))
console.log(JSON.stringify({ put: a1.put, del: a1.del, batches: a1.batches }))
const r = await L.rows(p)
for (const b of a1.batches) console.log(b.key, r[b.key].slice(0, 600))
/* arm a flying seat */
await p.click('#eWeek [data-slot="0.0.0.0.w"]:visible')
await L.sleep(300)
console.log('ARM after click on occupied seat', await p.evaluate(() => window.ARM && JSON.stringify(window.ARM)))
await p.keyboard.press('Escape'); await L.sleep(200)
const pk = await p.locator('#eWeek [data-slot="0.0.0.0.w"] .puck:visible').count()
console.log('puck inside seat', pk)
/* what classes / attrs */
console.log(await p.evaluate(() => { const e = document.querySelector('#eWeek [data-slot="0.0.0.0.w"]'); return e.outerHTML.slice(0, 400) }))
console.log(await p.evaluate(() => { const e = document.querySelector('#eWeek [data-fill="d:0.0.0.+"]'); return e ? e.outerHTML.slice(0, 300) : 'none' }))
console.log('errors', errors)
await browser.close()
