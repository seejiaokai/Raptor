// swd-w11-probe — reads the demo world before any step is written (the brief's trap: each man's own flights), and shows
// how the bell draws one change line. window.* is only read.
process.env.W11_RUN ||= 'probe'
await import('./swd-w11-env.mjs')
const X = await import('./sah-w8-lib.mjs')
const T = await import('./sah-w10-lib.mjs')
const { L, RANGER, HEX } = X
console.log('VERSION swd-w11-probe 1')
const SZ = process.env.SZ || 'd'
await T.run('probe', SZ, async (p, W) => {
  for (const wk of ['2026-07-13', '2026-07-20']) {
    await L.gotoWeek(p, W, wk)
    console.log('WEEK', wk)
    console.log(' Ranger', await X.holds(p, RANGER))
    console.log(' Hex   ', await X.holds(p, HEX))
  }
  await L.gotoWeek(p, W, '2026-07-13')
  const r = await L.postOut(p, W, RANGER, '2026-07-17', 'post')
  console.log('posted', r.line, JSON.stringify(r.after))
  await T.as(p, W, 'us', 'us')
  const f = await T.file(p, W, '2026-07-17', null, ['fly'], null, 'file', { endIso: '2026-07-18' })
  console.log('filed', JSON.stringify(f.made), f.refused)
  await T.closeAll(p, W)
  await T.as(p, W, 'ad', 'a')
  const m = await T.movePo(p, W, RANGER, '2026-07-17', '2026-07-18', 'move')
  console.log('moved', JSON.stringify(m.rec), m.line, m.err)
  await T.as(p, W, 'us', 'us')
  await p.locator('.bellbtn:visible').first().click()
  await p.waitForSelector('[data-testid="bell-list"]')
  await L.sleep(400)
  console.log(await p.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(e => e.outerHTML).join('\n---\n')))
  await W.pic(p, 'bell')
})
process.exit(0)
