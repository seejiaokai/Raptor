import { launch, proveBundle, phone, addWaveAndSeat, openBoard, shot, wait, tapEl, typeBox, scrollTo, publishDay } from './sf-B-lib.mjs'
console.log('sf-B-probe5 v2')
await proveBundle()
const browser = await launch()
const dump = p => p.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => e.offsetParent && e.children.length <= 2 && /pending|change|sign|amend|AL\d|ORIG/i.test(e.textContent || '') && (e.textContent || '').length < 80 && e.tagName !== 'OPTION' && e.tagName !== 'SELECT').map(e => e.tagName + '.' + e.className + '[' + [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',') + '] ' + e.textContent.trim().replace(/\s+/g, ' ')).join('\n'))
try {
  const { page: p, errors } = await phone(browser, 'a')
  await addWaveAndSeat(p, 5, 'avalon', [[0, 0], [0, 1], [0, 2], [0, 3]])
  await openBoard(p, 5)
  console.log('publish', JSON.stringify(await publishDay(p, 5)))
  await p.evaluate(() => window.scrollTo(0, 0)); await wait(p, 300)
  console.log('--- after publish\n' + await dump(p))
  await typeBox(p, p.locator('#schedBoard [data-bfld="ff:5.0.0.rl"]'), '1830')
  await p.evaluate(() => window.scrollTo(0, 0)); await wait(p, 300)
  console.log('--- after R\n' + await dump(p))
  console.log('errors', errors)
} finally { await browser.close() }
