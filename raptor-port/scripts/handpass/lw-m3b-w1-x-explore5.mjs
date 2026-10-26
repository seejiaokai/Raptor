// exploration only: the day panel's resting places (its handle drag), and the bid window over it
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const w = await M.start('phone')
const P = w.page
const D = '2026-12-17'
await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
await L.press(w, T('head-' + D)); await P.waitForSelector(T('win-lwday')); await P.waitForTimeout(600)
const prect = () => P.evaluate(() => { const e = document.querySelector('[data-testid="win-lwday"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), cls: e.className.toString().slice(0, 80) } })
console.log('panel', JSON.stringify(await prect()))
console.log('panel attrs', await P.evaluate(() => { const e = document.querySelector('[data-testid="win-lwday"]'); return [...e.querySelectorAll('[class*="grab"],[class*="grip"],[class*="drag"],[aria-label]')].slice(0, 12).map(x => x.className + '|' + (x.getAttribute('aria-label') || '')).join(' ;; ') }))
const handle = await P.evaluate(() => { const e = document.querySelector('[data-testid="win-lwday"]'); const h = [...e.querySelectorAll('*')].find(x => /⠿/.test(x.textContent) && x.children.length === 0); if (!h) return null; const r = h.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, cls: h.className.toString() } })
console.log('handle', JSON.stringify(handle))
if (handle) {
  for (const [dy, label] of [[250, 'down 250'], [250, 'down 250 again'], [-250, 'up 250']]) {
    const hh = await P.evaluate(() => { const e = document.querySelector('[data-testid="win-lwday"]'); const h = [...e.querySelectorAll('*')].find(x => /⠿/.test(x.textContent) && x.children.length === 0); const r = h.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: hh.x, y: hh.y, id: 1 }] })
    for (let i = 1; i <= 8; i++) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: hh.x, y: hh.y + dy * i / 8, id: 1 }] }); await P.waitForTimeout(30) }
    await P.waitForTimeout(90)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await P.waitForTimeout(500)
    console.log(label, JSON.stringify(await prect()))
    await M.settled(w, 'x-explore-panel-' + label.replace(/\W+/g, ''), null)
  }
}
console.log('errs', w.errs)
await w.ctx.close(); await M.closeBrowser()
