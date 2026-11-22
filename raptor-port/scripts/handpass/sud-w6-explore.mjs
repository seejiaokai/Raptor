// w6 explore (read only): Hex's own items each day of the week of 13 Jul and the next, his inputs, the bell machinery
process.env.W6_RUN ||= 'explore'
await import('./sud-w6-env.mjs')
const L = await import('./asp-w2-lib.mjs')
import { writeFileSync } from 'node:fs'
console.log('sud-w6-explore v1', L.URL_)
const sz = L.SIZES.d, W = L.mk('x', sz)
const { b, p } = await L.world(sz, W)
await L.signIn(p, 'ad', 'a')
const dump = () => p.evaluate(() => {
  const out = []
  ;(window.DAYS || []).forEach((d, di) => {
    const hits = []
    const walk = (o, path) => {
      if (o == null) return
      if (typeof o === 'string') { if (o === 'rocky') hits.push(path); return }
      if (Array.isArray(o)) { o.forEach((x, i) => walk(x, path + '[' + i + ']')); return }
      if (typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], path + '.' + k)
    }
    walk(d, '')
    const items = hits.map(h => {
      const m = h.match(/^\.(\w+)\[(\d+)\](.*)$/)
      if (!m) return h
      const row = d[m[1]][+m[2]]
      const brief = row && typeof row === 'object' ? Object.fromEntries(Object.entries(row).filter(([k, v]) => typeof v === 'string' && v.length < 30 && !/^rid$/.test(k))) : row
      return h + ' ' + JSON.stringify(brief).slice(0, 300)
    })
    out.push({ di, dt: d.dt, items })
  })
  return out
})
const r = { week1: await dump() }
r.inputs = await p.evaluate(() => (window.INPUTS || []).filter(i => JSON.stringify(i).includes('rocky')).map(i => JSON.stringify(i).slice(0, 300)))
r.people = await p.evaluate(() => { const q = window.PEOPLE.rocky; return JSON.stringify(q).slice(0, 600) })
r.winKeys = await p.evaluate(() => Object.keys(window).filter(k => /NOTICE|notice|bell|Bell|sans|SANS|today|Today|clock/i.test(k)))
r.curweek = await p.evaluate(() => window.CURWEEK)
// next week by the week segment
await L.go(p, 'editsched')
r.wks = await p.evaluate(() => [...document.querySelectorAll('#weekSegE [data-wk]')].map(b => b.getAttribute('data-wk') + '|' + b.textContent.trim() + (b.classList.contains('on') ? '[on]' : '')))
const nxt = r.wks.findIndex(s => s.includes('[on]')) + 1
if (nxt > 0 && r.wks[nxt]) {
  await p.locator(`#weekSegE [data-wk="${r.wks[nxt].split('|')[0]}"]`).click(); await L.sleep(1200)
  r.curweek2 = await p.evaluate(() => window.CURWEEK)
  r.week2 = await dump()
}
writeFileSync('D:/raptor-work/c147-walk/w6/explore.json', JSON.stringify(r, null, 1))
console.log(JSON.stringify(r, null, 1).slice(0, 6000))
console.log('errors', W.errs)
await b.close()
