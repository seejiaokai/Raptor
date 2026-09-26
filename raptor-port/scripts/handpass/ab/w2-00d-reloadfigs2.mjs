/* W2 probe d — the same, but ONE write before the first reload (the brief's rule for a fresh world). */
process.env.AB_WHO = 'w2'
const L = await import('./ab-lib.mjs')
const W = await import('./w2-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await L.toastSpy(page)
const men = ['slipway', 'prowler']
const read = async (tag) => { await L.lwOpen(page, '2026-07-20'); const o = {}; for (const m of men) o[m] = await L.figures(page, m); console.log(tag, JSON.stringify(o)); return o }
await read('fresh')
await W.fileMed(page, { person: 'dice', type: 'ATT C', from: '2026-07-22', remarks: 'probe' })
await read('after-write')
const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => /leavewar/.test(k)).map(k => k + ':' + (localStorage.getItem(k) || '').length))
console.log('lw keys', JSON.stringify(keys))
await W.reload(page, 'a')
await read('after-reload')
console.log('errors', JSON.stringify(errors.slice(0, 10)))
await browser.close()
