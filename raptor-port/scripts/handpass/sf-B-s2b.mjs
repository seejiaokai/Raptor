import { launch, proveBundle, phone, addWaveAndSeat, openBoard, shot, zoom, wait, tapEl, typeBox, scrollTo, publishDay, chips, warnLines } from './sf-B-lib.mjs'
console.log('sf-B-s2b v1')
await proveBundle()
const browser = await launch()
try {
  const { page: p, errors } = await phone(browser, 'a')
  const DI = 5
  const gi = await addWaveAndSeat(p, DI, 'avalon', [[0, 0], [0, 1], [0, 2], [0, 3]])
  const gs = await p.evaluate(() => { window.addWave(6, ''); const g = window.DAYS[6].waves.length - 1; window.fillSlot(`6.${g}.0.0.p`, 'dj'); return g })
  await openBoard(p, DI)
  console.log('publish', JSON.stringify(await publishDay(p, DI)))
  await scrollTo(p, p.locator('#schedBoard [data-sarole="5.0.0.0"]').last(), 330)
  console.log(JSON.stringify(await chips(p, '#schedBoard')))
  await shot(p, 'probe-avalon-before')
  // type R
  const z = await typeBox(p, p.locator('#schedBoard [data-bfld="ff:5.0.0.rl"]'), '1830')
  console.log('zoom after typing', JSON.stringify(z), 'rl', await p.evaluate(() => window.DAYS[5].waves[0].formations[0].rl))
  console.log(JSON.stringify(await chips(p, '#schedBoard')))
  await shot(p, 'probe-avalon-after')
  console.log(JSON.stringify(await warnLines(p)))
  console.log('errors', errors)
} finally { await browser.close() }
