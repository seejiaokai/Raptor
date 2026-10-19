import { launch, proveBundle, phone, addWaveAndSeat, openBoard, closeBoard, shot, zoom, wait, tapEl, typeBox, scrollTo, publishDay } from './sf-B-lib.mjs'
console.log('sf-B-s2a v1')
await proveBundle()
const browser = await launch()
try {
  const { page: p, errors } = await phone(browser, 'a')
  const DI = 5
  const gi = await addWaveAndSeat(p, DI, 'avalon', [[0, 0], [0, 1], [0, 2], [0, 3]])
  // Sunday flying wave
  const gs = await p.evaluate(() => { window.addWave(6, ''); return window.DAYS[6].waves.length - 1 })
  console.log('sunday wave gi', gs, JSON.stringify(await p.evaluate(g => window.DAYS[6].waves[g].formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld, rl: f.rl, n: f.aircraft.length })), gs)))
  await openBoard(p, DI)
  console.log('publish', JSON.stringify(await publishDay(p, DI)))
  console.log('zoom', await zoom(p))
  console.log(await p.evaluate(() => (document.querySelector('#schedBoard').innerText.match(/.*\bX\s*\d.*/g) || []).join(' || ')))
  await shot(p, 'probe-pub')
  console.log('errors', errors)
} finally { await browser.close() }
