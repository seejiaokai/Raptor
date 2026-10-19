import { launch, proveBundle, phone, wait } from './sf-B-lib.mjs'
console.log('sf-B-probe2 v1')
await proveBundle()
const browser = await launch()
try {
  const { page: p, errors } = await phone(browser, 'a')
  console.log(await p.evaluate(() => JSON.stringify([5, 6].map(d => ({ d, date: window.DAYS[d].date, waves: window.DAYS[d].waves.map(w => w.kind + ':' + w.label + ':' + w.formations.map(f => f.cs + '/' + f.to + '-' + f.ld + '/' + f.aircraft.length).join(',')), duty: window.DAYS[d].dutywaves.map(x => x.label) })))))
  console.log(await p.evaluate(() => Object.keys(window).filter(k => /wave|sched|pub|fill|flies|Flies|tick/i.test(k)).join(' ')))
  console.log(await p.evaluate(() => Object.entries(window.PEOPLE).filter(([k, v]) => !v.special).slice(0, 40).map(([k, v]) => k + ':' + v.cs + ':' + v.seat).join(' ')))
  // add waves menu: open the board and look at the + Wave button
  await p.evaluate(() => window.go('editsched')); await wait(p, 600)
  await p.evaluate(() => window.openScheduler(6)); await p.waitForSelector('#schedBoard'); await wait(p, 800)
  console.log(await p.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => b.offsetParent).map(b => (b.innerText || b.title).trim().slice(0, 30) + '|' + [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')).join('\n')))
  console.log('errors', errors)
} finally { await browser.close() }
