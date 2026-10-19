import { launch, proveBundle, phone, addWaveAndSeat, shot, wait } from './sf-B-lib.mjs'
console.log('sf-B-probe6 v2')
await proveBundle()
const browser = await launch()
try {
  const { page: p, errors } = await phone(browser, 'a')
  await addWaveAndSeat(p, 5, 'avalon', [[0, 0], [0, 1], [0, 2], [0, 3]])
  await p.evaluate(() => { window.DAYS[5].waves[0].formations[0].rl = '18:30' })
  await p.evaluate(() => window.go('editsched')); await wait(p, 800)
  await shot(p, 'probe-week-top', { scale: 'css' })
  console.log(await p.evaluate(() => { const w = document.querySelector('#eWeek'); const cs = getComputedStyle(w); return [cs.display, cs.overflowX, cs.scrollSnapType, w.scrollLeft, w.scrollWidth, w.clientWidth, [...w.querySelectorAll('.day')].map(d => Math.round(d.getBoundingClientRect().left)).join(',')].join(' ') }))
  console.log(await p.evaluate(() => [...document.querySelectorAll('#page-editsched button, #page-editsched [data-wkgo], #page-editsched .tab')].filter(b => b.offsetParent).slice(0, 30).map(b => (b.innerText || b.title || '').trim().slice(0, 20) + '|' + [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')).join('\n')))
  console.log('errors', errors)
} finally { await browser.close() }
