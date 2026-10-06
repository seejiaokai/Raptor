import * as K from './ows-B-lib.mjs'
const { p, browser } = await K.world()
await K.L.go(p, 'editsched'); await K.sleep(400)
await p.locator('[data-wk]:visible', { hasText: 'Jul 20' }).first().click(); await K.sleep(900)
const r = await p.evaluate(() => { const d = window.DAYS[0]; const ids = new Set(); JSON.stringify(d, (k, v) => { if (typeof v === 'string') ids.add(v); return v }); const busy = [...ids].filter(i => window.PEOPLE[i]); const free = Object.keys(window.PEOPLE).filter(i => !busy.includes(i) && window.PEOPLE[i].seat === 'FCP' && !['allavail','all'].includes(i)).slice(0, 12); return { busy, free } })
console.log(JSON.stringify(r))
await browser.close()
