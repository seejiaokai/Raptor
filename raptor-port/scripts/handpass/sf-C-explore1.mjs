import { launch, ctxOpen, openBoard, sleep, shot, warns, dump, errors } from './sf-C-lib.mjs'
const b = await launch()
const { p } = await ctxOpen(b, {})
await p.evaluate(() => window.go('editsched')); await sleep(600)
const info = await p.evaluate(() => {
  const out = []
  window.DAYS.forEach((d, i) => out.push({ i, label: d.label || d.date || d.name, waves: d.waves.map(w => w.kind + ':' + w.label + ':' + w.formations.length) }))
  return { days: out, people: Object.entries(window.PEOPLE).map(([k, v]) => k + '=' + v.cs + '/' + v.seat).join(' ') }
})
console.log(JSON.stringify(info, null, 1))
await p.evaluate(() => window.addWave(5, 'sc')); await sleep(600)
const wi = await p.evaluate(() => window.DAYS[5].waves.findIndex(w => w.kind === 'sc'))
console.log('sc wave idx', wi)
await openBoard(p, 5)
const html = await p.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const sa = [...b.querySelectorAll('[data-safly]')].slice(0, 3).map(e => e.outerHTML)
  const rows = [...b.querySelectorAll('[data-sarole]')].slice(0, 2).map(e => e.parentElement.parentElement.outerHTML.slice(0, 1800))
  return { sa, rows, top: (b.querySelector('.sb-top') || b).innerText.slice(0, 400) }
})
console.log(JSON.stringify(html, null, 1))
await shot(p, 'explore-board')
console.log((await warns(p)).join('\n'))
console.log(errors)
await b.close()
