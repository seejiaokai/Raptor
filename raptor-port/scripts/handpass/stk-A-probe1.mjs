import { world, L, W, pic } from './wh-lib.mjs'
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
const info = await p.evaluate(() => {
  const d = window.DAYS
  return {
    week: window.CURWEEK,
    days: d.map((x, i) => ({
      i, waves: x.waves.map(w => ({ label: w.label, kind: w.kind, intimes: w.intimes, f: w.formations.map(f => ({ cs: f.cs, m: f.mission || f.ms, to: f.to, ld: f.ld, cx: f.cx, brief: f.brief || f.bf, keys: Object.keys(f) })) })),
      duty: x.dutywaves.map(b => ({ label: b.label, rows: b.rows.map(r => `${r.role}|${r.str}-${r.end}|${r.id}`) })),
    })).slice(0, 7),
    sample: JSON.stringify(d[0].waves[0]).slice(0, 1500),
  }
})
console.log(JSON.stringify(info, null, 1).slice(0, 9000))
const dom = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-txt],#eWeek .day[data-day="0"] [data-itline],#eWeek .day[data-day="0"] [data-itadd]')].slice(0, 60).map(e => (e.dataset.txt || e.dataset.itline || ('itadd ' + e.dataset.itadd)) + ' :: ' + (e.innerText || '').slice(0, 40)))
console.log(dom.join('\n'))
console.log(await p.evaluate(() => Object.keys(window).filter(k => /^[A-Z_]+$/.test(k) || /^(go|open|load|dayCur|dayOil|dayEvents|txt|keyDay|raptor|lw)/.test(k)).join(' ')))
await pic(p, 'probe-week')
console.log(errors)
await browser.close()
