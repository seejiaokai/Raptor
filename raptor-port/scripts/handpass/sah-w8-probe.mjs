// sah-w8-probe — READ ONLY: who Ranger and Hex are, what each holds on the weeks of 13 and 20 Jul, the SANS tab's and the
// bell's markup, signed in as Saber on a fresh world (Wed 15 Jul 26 09:00). Nothing written to window.*.
import './sah-w8-env.mjs'
const L = await import('./asp-w2-lib.mjs')
import { writeFileSync, mkdirSync } from 'node:fs'
console.log('sah-w8-probe v1', L.URL_)
const OUTD = 'D:/raptor-work/c152-walk/w8/probe'; mkdirSync(OUTD, { recursive: true })
const sz = L.SIZES.d, W = L.mk('probe', sz)
const { b, p } = await L.world(sz, W)
await L.signIn(p, 'ad', 'a')
const people = await p.evaluate(() => Object.entries(window.PEOPLE).filter(([k, q]) => /ranger|hex/i.test(q.cs)).map(([k, q]) => ({ id: k, cs: q.cs, seat: q.seat, san: !!q.san, sanFrom: q.sanFrom || null, user: q.user || q.login || null })))
console.log('people', JSON.stringify(people))
const holds = await p.evaluate(ids => {
  const out = {}
  for (const id of ids) {
    out[id] = (window.DAYS || []).map(d => {
      const hits = []
      const walk = (o, path) => {
        if (o == null) return
        if (typeof o === 'string') { if (o === id) hits.push(path); return }
        if (Array.isArray(o)) { o.forEach((x, i) => walk(x, path + '[' + i + ']')); return }
        if (typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], path + '.' + k)
      }
      walk(d, '')
      return d.dt + ': ' + (hits.join(' ') || '-')
    })
  }
  return out
}, people.map(x => x.id))
console.log('week', await p.evaluate(() => window.CURWEEK), JSON.stringify(holds, null, 1))
const inputs = await p.evaluate(ids => (window.INPUTS || []).filter(i => ids.some(id => JSON.stringify(i).includes('"' + id + '"'))).map(i => ({ iid: i.iid, type: i.type, date: i.date, yr: i.yr, end: i.end, sans: i.sans, person: i.person, people: i.people, s: i.s, e: i.e })), people.map(x => x.id))
console.log('inputs', JSON.stringify(inputs))
// the SANS tab on July, and the bell's markup
await L.go(p, 'inputs')
await W.press(p, '#inSansMode', 'sans')
await p.waitForSelector('[data-testid="sanscal"]')
await L.sleep(600)
const cell = await p.evaluate(() => { const c = document.querySelector('[data-testid="sc-day-2026-07-16"]'); return c ? c.outerHTML.slice(0, 1500) : 'none' })
console.log('cell16', cell)
await p.screenshot({ path: OUTD + '/sans-ad.png' })
await W.press(p, '[data-testid="sc-day-2026-07-17"]', 'd17')
await L.sleep(700)
const win = await p.evaluate(() => { const w = document.querySelector('[data-testid="win-sansday"]'); return w ? w.outerHTML.slice(0, 3000) : 'none' })
console.log('win17', win)
await p.screenshot({ path: OUTD + '/sans-ad-17.png' })
writeFileSync(OUTD + '/probe.json', JSON.stringify({ people, holds, inputs }, null, 1))
console.log('errs', W.errs.join(' || '))
await b.close()
