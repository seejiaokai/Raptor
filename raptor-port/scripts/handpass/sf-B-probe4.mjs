import { launch, proveBundle, phone, addWaveAndSeat, openBoard, shot, wait, tapEl, typeBox, scrollTo, publishDay } from './sf-B-lib.mjs'
console.log('sf-B-probe4 v1')
await proveBundle()
const browser = await launch()
try {
  const { page: p, errors } = await phone(browser, 'a')
  const gi = await addWaveAndSeat(p, 5, 'avalon', [[0, 0], [0, 1], [0, 2], [0, 3]])
  await p.evaluate(() => { window.addWave(6, ''); const g = window.DAYS[6].waves.length - 1; window.fillSlot(`6.${g}.0.0.p`, 'dj') })
  await openBoard(p, 6)
  await scrollTo(p, p.locator('#schedBoard [data-bfld="ff:6.0.0.to"]'), 300)
  console.log('sun box', await p.evaluate(() => document.querySelector('#schedBoard [data-bfld="ff:6.0.0.to"]').outerHTML))
  const z = await typeBox(p, p.locator('#schedBoard [data-bfld="ff:6.0.0.to"]'), '0900'); console.log(z)
  console.log(await p.evaluate(() => JSON.stringify(window.DAYS[6].waves[0].formations[0])).then(s => s.slice(0, 400)))
  await scrollTo(p, p.locator('#schedBoard .sb-top, #schedBoard').first(), 0)
  await p.evaluate(() => window.scrollTo(0, 0)); await wait(p, 300)
  console.log(await p.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => e.children.length < 4 && /issue/i.test(e.textContent || '') && e.offsetParent).slice(0, 6).map(e => e.tagName + '.' + e.className + ' ' + [...e.attributes].map(a => a.name + '=' + a.value).join(',') + ' :: ' + e.textContent.trim().slice(0, 50)).join('\n')))
  console.log('errors', errors)
} finally { await browser.close() }
