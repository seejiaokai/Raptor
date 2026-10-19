import { launch, proveBundle, phone, addWaveAndSeat, openBoard, shot, wait, tapEl, scrollTo } from './sf-B-lib.mjs'
console.log('sf-B-probe10 v1')
await proveBundle()
const browser = await launch()
try {
  const { ctx, page: p, errors } = await phone(browser, 'a')
  const gi = await addWaveAndSeat(p, 5, 'sc', [[0, 0], [0, 1]])
  await p.evaluate(() => { window.DAYS[5].waves[0].formations[0].rl = '06:30' })
  const dump = () => p.evaluate(() => window.DAYS[5].waves[0].formations[0].aircraft.map(a => (a.p || '-') + '/' + (a.w || '-')).join(' '))
  await p.evaluate(() => window.fillSlot('5.0.0.3.p', 'allavail'))
  console.log('after fillSlot allavail:', await dump())
  await p.evaluate(() => window.fillSlot('5.0.0.3.p', 'all'))
  console.log('after fillSlot all:', await dump())
  await p.evaluate(() => window.fillSlot('5.0.0.3.p', ''))
  // the real route on the board
  await openBoard(p, 5)
  const seatSel = '#schedBoard [data-slot="5.0.0.3.p"]'
  console.log('seat els', await p.locator(seatSel).count(), await p.evaluate(s => [...document.querySelectorAll(s)].map(e => e.outerHTML.slice(0, 200)).join('\n'), seatSel))
  await scrollTo(p, p.locator(seatSel).first(), 300)
  await tapEl(p, p.locator(seatSel), { label: 'seat' })
  console.log('ARM', await p.evaluate(() => window.ARM && window.ARM.key))
  console.log(await p.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck, #sbRoster [data-person]')].filter(e => /ALL/.test(e.innerText)).map(e => e.outerHTML.slice(0, 200) + ' vis=' + (e.offsetParent !== null)).join('\n')))
  await shot(p, 'probe-armed', { scale: 'css' })
  console.log('errors', errors)
} finally { await browser.close() }
