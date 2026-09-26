/* W3 probe: which browser-storage keys the war keeps (READ only — for the evidence table). */
process.env.AB_WHO = 'w3'
const L = await import('./ab-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { browser, page } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await L.lwOpen(page, '2026-07-20')
const k = await page.evaluate(() => Object.keys(localStorage).map(k => k + ' ' + (localStorage.getItem(k) || '').length))
console.log(k.join('\n'))
const w = await page.evaluate(() => { const k = Object.keys(localStorage).find(k => /leavewar:wars|leavewar:world|lw.*wars/i.test(k)); return k ? localStorage.getItem(k).slice(0, 1500) : 'none' })
console.log(w)
await browser.close()
