import { launch, proveBundle, phone, addWaveAndSeat, openBoard, shot, wait, tapEl, scrollTo } from './sf-B-lib.mjs'
console.log('sf-B-probe8 v1')
await proveBundle()
const browser = await launch()
try {
  const { ctx, page: p, errors } = await phone(browser, 'a')
  await addWaveAndSeat(p, 5, 'sc', [[0, 0], [0, 1]])
  await p.evaluate(() => { window.DAYS[5].waves[0].formations[0].rl = '06:30' })
  await openBoard(p, 5)
  console.log(await p.evaluate(() => { const t = document.querySelector('#schedBoard'); return [...t.querySelectorAll('*')].filter(e => e.children.length === 0 && /^\s*\d+(\s*[X\/]\s*\d+)*\s*$/.test(e.textContent || '') && e.offsetParent).map(e => e.tagName + '.' + e.className + '#' + e.id + ' "' + e.textContent.trim() + '" parent=' + e.parentElement.className).join('\n') }))
  console.log('week while board open:', await p.evaluate(() => (document.querySelectorAll('#eWeek .day')[5].querySelector('.badge') || {}).innerText))
  await shot(p, 'probe-sbtop', { scale: 'css', clip: { x: 0, y: 0, width: 402, height: 300 } })
  console.log('errors', errors)
} finally { await browser.close() }
