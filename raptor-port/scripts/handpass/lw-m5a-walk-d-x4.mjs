// exploration 4: Pick a range in the bid window; the clock move; period list
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-12-20'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-x4 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
console.log('period', await P.locator(T('war-picker')).evaluate(s => s.options[s.selectedIndex]?.textContent))
await D.openBalances(w)
console.log('pike', JSON.stringify(await D.balRow(P, 'pike')))
await L.openGrid(w)
console.log(await P.locator(T('war-picker')).evaluate(s => [...s.options].map(o => o.value + '=' + o.textContent).join(' | ')))
await P.selectOption(T('war-picker'), { label: 'JAN - DEC 27' }); await P.waitForTimeout(800)
await L.openCell(w, 'pike', '2027-02-01')
console.log('picker', await vis(P, T('bid-picker')))
await press(w, T('span-range')); await P.waitForTimeout(600)
await shot(w, 'x4-range')
console.log(await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] [data-testid], [data-testid^="range-"], [data-testid^="rp-"], [data-testid^="cal-"]')].map(e => e.dataset.testid + '=' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 30)).join(' | ')))
console.log(await P.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid]')].map(e => e.dataset.testid).filter(t => /range|cal|pick|day-/.test(t)))].slice(0, 60).join(',')))
await w.ctx.close(); await L.closeBrowser()
