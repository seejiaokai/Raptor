import * as S from './ins-s-lib.mjs'
const { B, L, W } = S
const { browser, p, errors } = await B.world()
try {
  await B.toEdit(p)
  const r = await p.evaluate(() => {
    const cnt = {}, byDay = {}
    window.DAYS.forEach((d, di) => d.waves.forEach((w, gi) => (w.formations || []).forEach((f, fi) => f.aircraft.forEach((a, ai) => {
      if (a.cx || f.cx) return
      for (const s of ['p', 'w']) { const id = a[s]; if (!id) continue; cnt[id] = (cnt[id] || 0) + 1; (byDay[di] ||= []).push(id + ':' + s + '@' + gi + '.' + fi + '.' + ai + '(' + f.to + '-' + f.ld + ')') }
    }))))
    const once = Object.keys(cnt).filter(k => cnt[k] === 1)
    const tueOnce = once.filter(k => (byDay[1] || []).some(x => x.startsWith(k + ':')))
    const monLines = window.DAYS[0].waves.map((w, gi) => (w.formations || []).map((f, fi) => ({ at: gi + '.' + fi, to: f.to, ld: f.ld, ac: f.aircraft.map(a => a.p + '/' + a.w) })))
    return { total: Object.keys(cnt).length, tueOnce, tue: byDay[1], mon: byDay[0], monLines, peopleCs: Object.fromEntries(Object.entries(window.PEOPLE).slice(0, 80).map(([k, v]) => [k, v.cs + '/' + (v.role || v.cat || '')])) }
  })
  console.log(JSON.stringify(r, null, 0))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
