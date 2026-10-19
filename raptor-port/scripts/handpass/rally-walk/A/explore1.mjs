import { launch, ctxOpen, SIZES, sleep, go, rl } from './lib.mjs'
console.log('explore1 v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, 'x')
await go(p, 'editsched')
const info = await p.evaluate(() => {
  const D = window.DAYS
  return D.map((d, i) => ({ i, name: d.name || d.date || '', waves: d.waves.map(w => ({ label: w.label, kind: w.kind, sa: w.sa, f: w.formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld, br: f.br, rl: f.rl, ac: f.aircraft.length })) })), dutywaves: d.dutywaves.length, pub: d.published || d.pub || null }))
})
console.log(JSON.stringify(info, null, 0).slice(0, 6000))
const btns = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] button, #eWeek .day[data-day="0"] [data-act]')].map(e => (e.innerText || '').trim().slice(0, 30) + '|' + [...e.attributes].map(a => a.name + '=' + a.value).join(',').slice(0, 80)).slice(0, 60))
console.log(btns.join('\n'))
const keys = await p.evaluate(() => Object.keys(window).filter(k => /^[A-Z_]+$/.test(k) || /^(go|open|sb|ed)/.test(k)).slice(0, 80))
console.log(keys.join(' '))
await b.close()
