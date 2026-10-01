/* probe: what the Insights window and the demo Tuesday look like (read only) */
import * as A from './ins-a-lib.mjs'
const { L, W } = A
const { browser, p, errors } = await A.world()
const r = await A.ins(p, 'probe1-insights')
console.log(JSON.stringify(r, null, 1))
console.log(await p.evaluate(() => document.querySelector('#insightModal') ? 'modal node present' : 'none'))
await A.insOpen(p)
console.log((await p.evaluate(() => document.querySelector('#insightBody').innerHTML)).slice(0, 3000))
await A.insClose(p)
/* the demo week: each day's flying lines */
console.log(JSON.stringify(await p.evaluate(() => window.DAYS.map((d, di) => ({ di, dow: d.dow, dt: d.dt, pub: !!(window.SCHED && window.SCHED.pub && window.SCHED.pub[di]),
  waves: (d.waves || []).map((w, gi) => ({ gi, label: w.label, kind: w.kind, forms: w.formations.map((f, li) => ({ li, name: f.name || f.ff, cx: !!f.cx, to: f.to, land: f.land, ac: f.aircraft.map((a, ai) => ({ ai, p: a.p, w: a.w, cx: !!a.cx })) })) })),
  duty: (d.duty || []).length, sims: Object.keys(d.sims || {}), ground: (d.ground || []).length }))), null, 0).slice(0, 6000))
console.log('SCHED keys', await p.evaluate(() => Object.keys(window.SCHED || {})))
await A.toEdit(p)
console.log('head Tue', JSON.stringify(await A.head(p, 1)))
console.log('head Mon', JSON.stringify(await A.head(p, 0)))
await W.boardOn(p, 1)
await A.pic(p, 'probe1-board')
/* the board's own bar and every kind of control on it */
console.log(JSON.stringify(await p.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const bar = [...b.querySelectorAll('button')].filter(e => e.offsetParent !== null && e.getBoundingClientRect().top < 60).map(e => (e.id || '') + ':' + e.innerText.trim().slice(0, 20))
  const attrs = {}
  for (const e of b.querySelectorAll('*')) for (const a of e.attributes) if (a.name.startsWith('data-')) { attrs[a.name] = attrs[a.name] || []; if (attrs[a.name].length < 4) attrs[a.name].push(a.value.slice(0, 30)) }
  return { bar, attrs, ins: !!document.querySelector('#insightBtn'), insVisible: (() => { const e = document.querySelector('#insightBtn'); if (!e) return null; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { r: [r.left, r.top, r.width, r.height], hit: h ? (h.id || h.className) : null } })() }
}), null, 0).slice(0, 7000))
console.log('errors', errors)
await browser.close()
