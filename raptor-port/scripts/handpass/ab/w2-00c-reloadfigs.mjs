/* W2 probe c — do a man's war figures read the same before and after a reload, with no write in between and with one? */
process.env.AB_WHO = 'w2'
const L = await import('./ab-lib.mjs')
const W = await import('./w2-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const WD = process.argv[2] || 'desktop'
const { browser, page, errors } = await openHi({ width: WD === 'phone' ? 390 : 1440, height: WD === 'phone' ? 844 : 900, who: 'a', dpr: 1 })
await L.toastSpy(page)
const men = ['slipway', 'prowler', 'taipan', 'bane']
const read = async (tag) => {
  await L.lwOpen(page, '2026-07-20')
  const o = {}
  for (const m of men) o[m] = { figs: await L.figures(page, m), bal: await L.lwBalCol(page, m) }
  o.period = await page.evaluate(() => (document.querySelector('[data-testid="period-label"]') || {}).innerText)
  console.log(tag, JSON.stringify(o))
  return o
}
const a = await read('fresh')
await L.shot(page, `w2-00c-${WD}-figs-fresh`)
await W.reload(page, 'a')
const b = await read('reload-no-write')
await L.shot(page, `w2-00c-${WD}-figs-after-reload`)
await W.fileMed(page, { person: 'dice', type: 'ATT C', from: '2026-07-22', remarks: 'probe' })
const c = await read('after-one-write')
await W.reload(page, 'a')
const d = await read('reload-after-write')
console.log('errors', JSON.stringify(errors.slice(0, 10)))
await browser.close()
