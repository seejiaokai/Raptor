// H-10 — a filtered month counts only what it shows: bars, "+N more", the opened day's list agree with each other and with the filter.
import { launch, world, toInputs, toMonth, cell, shot, press, saveRows, seedFile, big } from './cal-E-lib.mjs'
const size = process.argv[2] || 'desk'
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const res = {}
const w = await world(b, size); const p = w.page
const N = n => `h10-${size}-${n}`
await toInputs(p); await toMonth(p, 2026, 7)
const sid = await p.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))
// background crowd on Mon 13 Jul: nine for Saber (several kinds), four for other men — SEEDED
await seedFile(p, [
  { pid: sid, type: 'LL', from: 'Jul 13' }, { pid: sid, type: 'Training', from: 'Jul 13', timed: [420, 480] }, { pid: sid, type: 'Personal', from: 'Jul 13', timed: [1000, 1060] }, { pid: sid, type: 'Other', from: 'Jul 13', timed: [1100, 1160] },
  { pid: sid, type: 'Meeting', from: 'Jul 13', timed: [600, 660] }, { pid: sid, type: 'Meeting', from: 'Jul 13', timed: [780, 840] },
  { pid: sid, type: 'Appointment', from: 'Jul 13', timed: [540, 600] }, { pid: sid, type: 'Appointment', from: 'Jul 13', timed: [900, 960] },
  { pid: sid, type: 'Duty', from: 'Jul 13', timed: [480, 1020] }, { pid: sid, type: 'Fly with', from: 'Jul 13', timed: [480, 720] },
  { who: 20, type: 'LL', from: 'Jul 13' }, { who: 21, type: 'Meeting', from: 'Jul 13', timed: [600, 660] }, { who: 22, type: 'OL', from: 'Jul 13' }, { who: 23, type: 'Duty', from: 'Jul 13', timed: [480, 1020] },
])
await p.waitForTimeout(500)
const openFilters = async () => { if (!big(size)) { if (!(await p.locator('#inFSearch').isVisible())) { await p.locator('#inFiltersBtn').tap(); await p.waitForTimeout(250) } } }
const expectFor = (person, type) => p.evaluate(([person, type]) => {
  const w = window, d = 'Jul 13'
  const cov = w.INPUTS.filter(x => x.type !== 'SANS Availability' && x.date === d && (!person || w.PEOPLE[x.person].cs === person) && (!type || x.type === type))
  const groups = new Set(); let n = 0
  for (const x of cov) { if (x.grp) { if (groups.has(x.grp)) continue; groups.add(x.grp) } n++ }
  return n
}, [person, type])
const view = async () => {
  const m = await p.evaluate(() => {
    const iso = '2026-07-13'
    const c = document.querySelector(`#inpCal [data-icday="${iso}"]`).getBoundingClientRect(), cx = c.left + c.width / 2
    const wk = document.querySelector(`#inpCal [data-icday="${iso}"]`).closest('.ib-week')
    const bars = [...wk.querySelectorAll('.ib-bar')].filter(e => { const r = e.getBoundingClientRect(); return r.left <= cx && r.right >= cx })
    const more = document.querySelector(`[data-icmore="${iso}"]`)
    return { bars: bars.length, more: more ? more.textContent : null }
  })
  return m
}
const dayRows = async () => {
  await press(p, size, p.locator('[data-icday="2026-07-13"]'), { position: { x: 8, y: 8 } }); await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(400)
  const r = await p.evaluate(() => ({ rows: document.querySelectorAll('[data-testid="win-inputsday"] [data-testid^="idy-row-"]').length, count: document.querySelector('[data-testid="idy-count"]')?.textContent, who: [...document.querySelectorAll('[data-testid="win-inputsday"] .idy-who')].map(e => e.textContent).join(',') }))
  return r
}
const closeDay = async () => { const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await x.click(); await p.waitForTimeout(300) } }
const steps = [
  { name: 'no filter', person: null, type: null },
  { name: 'person = Saber', person: 'Saber', type: null },
  { name: 'person = Saber + type = Meeting', person: 'Saber', type: 'Meeting' },
  { name: 'type = Meeting only', person: null, type: 'Meeting' },
  { name: 'cleared', person: null, type: null },
]
let k = 0
for (const s of steps) {
  await openFilters()
  await p.selectOption('#inFPerson', { label: s.person || 'Everyone' }); await p.selectOption('#inFType', { label: s.type || 'All types' }); await p.waitForTimeout(500)
  const exp = await expectFor(s.person, s.type)
  const v = await view()
  const shown = v.bars + (v.more ? +v.more.match(/\d+/)[0] : 0)
  const day = await dayRows()
  await shot(p, N(`${++k}-${s.name.replace(/[^a-z0-9]+/gi, '-')}`))
  const agree = shown === exp && day.rows === exp
  L(s.name, '| expected from the records', exp, '| bars', v.bars, '| more', v.more, '| bars + more =', shown, '| opened day rows', day.rows, '(' + day.count + ')', '| who', day.who.slice(0, 80), '| AGREE:', agree)
  res[s.name] = { exp, v, day, agree }
  await closeDay()
}
L('errors', JSON.stringify(w.errors))
saveRows('h10-' + size, [{ log, res, errors: w.errors }])
await b.close()
