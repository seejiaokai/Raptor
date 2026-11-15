process.env.RCB2_RUN ||= 'probe'
const X = await import('./rcb2-w2-lib.mjs')
const PHONE = process.env.PHONE === '1'
const w = await X.open({ phone: PHONE }); const { page } = w
await X.L.go(page, 'editsched')
console.log('CURWEEK', await page.evaluate(() => window.CURWEEK))
console.log('wk visible', await page.evaluate(() => [...document.querySelectorAll('[data-wk]')].map(e => [e.dataset.wk, e.innerText, e.offsetWidth > 0, e.closest('#weekSeg') ? 'seg' : 'other'])))
console.log('cal btns', await page.evaluate(() => [...document.querySelectorAll('[aria-label="Jump to a date"]')].map(e => [e.className, e.offsetWidth > 0])))
await X.fin(w)
