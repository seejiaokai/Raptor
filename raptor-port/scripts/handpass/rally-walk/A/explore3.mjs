import { launch, ctxOpen, SIZES, sleep, go } from './lib.mjs'
console.log('explore3 v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, 'x')
await go(p, 'editsched')
const r = await p.evaluate(() => {
  const out = []
  document.querySelectorAll('#eWeek .day').forEach(d => {
    out.push({ day: d.dataset.day, forms: d.querySelectorAll('.go .form').length, waves: d.querySelectorAll('.go').length, head: (d.querySelector('.dh, .dayhead, h2, .dname')?.innerText || '').slice(0, 40), rls: [...d.querySelectorAll('[data-txt$=".rl"]')].map(e => e.dataset.txt).slice(0, 8) })
  })
  return { out, DAYSlen: window.DAYS.length, wk: window.DAYS.map(d => [d.name, d.date, d.dow, d.waves.length]) }
})
console.log(JSON.stringify(r))
await b.close()
