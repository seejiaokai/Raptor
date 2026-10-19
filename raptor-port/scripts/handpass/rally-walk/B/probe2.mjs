console.log('B probe2 v1')
import { launch, open, sleep, shot, elShot } from './lib.mjs'
const b = await launch()
const { ctx, p } = await open(b)
await p.evaluate(() => window.go('editsched')); await sleep(800)
console.log(await p.evaluate(() => {
  const d = document.querySelector('#eWeek .day[data-day="0"]')
  const f = d.querySelector('[data-txt="ff:0.1.0.rl"]')
  const form = f.closest('.form')
  return { dayHtmlLen: d.outerHTML.length, formHtml: form.outerHTML.slice(0, 3500), btns: [...d.querySelectorAll('button,[data-act]')].slice(0, 40).map(x => (x.dataset.act || x.tagName) + ':' + (x.textContent || '').trim().slice(0, 20)) }
}))
console.log(await p.evaluate(() => { const f = window.DAYS[0].waves[1].formations[0]; return JSON.stringify(f).slice(0, 800) }))
console.log(await p.evaluate(() => JSON.stringify(window.DAYS[0].waves[1].intimes)))
console.log(await elShot(p, '#eWeek .day[data-day="0"] .go', 'probe-flying'))
await b.close()
