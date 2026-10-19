import { launch, proveBundle, phone, openBoard, wait, tapEl, typeBox, scrollTo, openWarn, shot, addWaveAndSeat } from './sf-B-lib.mjs'
console.log('sf-B-probe12 v1')
await proveBundle()
const browser = await launch()
try {
  const { ctx, page: p, errors } = await phone(browser, 'a')
  const SEL = '#schedBoard'
  await addWaveAndSeat(p, 5, 'avalon', [[0, 0], [0, 1], [0, 2], [0, 3]])
  await p.evaluate(() => { window.DAYS[5].waves[0].formations[0].rl = '18:30' })
  await openBoard(p, 5)
  await p.evaluate(() => window.scrollTo(0, 0))
  await openWarn(p)
  const st = async t => console.log(t, JSON.stringify(await p.evaluate(() => ({ y: scrollY, flash: [...document.querySelectorAll('#schedBoard .puck')].filter(e => /flash|hl|pulse|lit/.test(e.className)).length, act: document.activeElement.tagName }))))
  await st('before')
  await tapEl(p, p.locator('#sbWarn .wln').first(), { label: 'long day line' }); await wait(p, 900)
  await st('after tap on a long-work-day line')
  console.log('errors', errors)
} finally { await browser.close() }
