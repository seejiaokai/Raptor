import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { browser, p, errors } = await B.world()
try {
  await B.toEdit(p)
  const r = await p.evaluate(() => {
    const d = window.DAYS[2]
    const forms = d.waves.flatMap((w, gi) => w.formations.map((f, fi) => `${gi}.${fi} ${f.cs} ${f.to}-${f.ld} :: ` + f.aircraft.map((a, ai) => `${ai}:${a.p}/${a.w}`).join(' ')))
    const cnt = {}
    window.DAYS.forEach((dd, di) => dd.waves.forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { if (a.cx || f.cx) return; for (const s of ['p', 'w']) if (a[s]) { (cnt[a[s]] ||= []).push(di) } }))))
    const wedOnly = Object.entries(cnt).filter(([k, v]) => v.length === 1 && v[0] === 2).map(([k]) => k)
    return { forms, wedOnly, warns: (window.WARN.byDay[2].warns || []).map((w, i) => i + ':' + w.code + ':' + (w.who || []).join(',') + ':' + String(w.msg).slice(0, 60)) }
  })
  console.log(JSON.stringify(r, null, 1))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
