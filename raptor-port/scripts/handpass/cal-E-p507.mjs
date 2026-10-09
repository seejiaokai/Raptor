// P5-07 — bars keep their identity through overflow and calendar boundaries. Setup seeded (background); inspection + "+N more" pressed for real.
import { launch, world, toInputs, toMonth, cell, bar, shot, press, saveRows, seedFile, recOf } from './cal-E-lib.mjs'
const size = process.argv[2] || 'desk'
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const res = {}
const w = await world(b, size); const p = w.page
const N = n => `p507-${size}-${n}`
await toInputs(p); await toMonth(p, 2026, 7)
// ---- crowd on Mon 13 Jul: the demo already has 5 inputs + 1 SANS availability on it; add enough to overflow
await seedFile(p, [
  { who: 20, type: 'LL', from: 'Jul 13' }, { who: 21, type: 'OL', from: 'Jul 13' }, { who: 22, type: 'Meeting', from: 'Jul 13', timed: [600, 660] },
  { who: 23, type: 'Duty', from: 'Jul 13', timed: [480, 1020] }, { who: 24, type: 'OIL', from: 'Jul 13' }, { who: 25, type: 'Appointment', from: 'Jul 13', timed: [900, 960] },
])
await p.waitForTimeout(500)
const measure = iso => p.evaluate(iso => {
  const w = window
  const MONN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [y, m, d] = iso.split('-').map(Number)
  const lbl = MONN[m - 1] + ' ' + d
  const isoOf = lab => { const [mm, dd] = lab.split(' '); return y + '-' + String(MONN.indexOf(mm) + 1).padStart(2, '0') + '-' + String(+dd).padStart(2, '0') }
  // entries covering the date, SANS availability excluded, a shared entry once
  const cov = w.INPUTS.filter(x => x.type !== 'SANS Availability' && isoOf(x.date) <= iso && iso <= isoOf(x.endDate || x.date))
  const groups = new Set(); let n = 0
  for (const x of cov) { if (x.grp) { if (groups.has(x.grp)) continue; groups.add(x.grp) } n++ }
  const sansCov = w.INPUTS.filter(x => x.type === 'SANS Availability' && isoOf(x.date) <= iso && iso <= isoOf(x.endDate || x.date)).length
  const c = document.querySelector(`#inpCal [data-icday="${iso}"]`).getBoundingClientRect(); const cx = c.left + c.width / 2
  const wk = document.querySelector(`#inpCal [data-icday="${iso}"]`).closest('.ib-week')
  const bars = [...wk.querySelectorAll('.ib-bar')].filter(e => { const r = e.getBoundingClientRect(); return r.left <= cx && r.right >= cx })
  const more = document.querySelector(`[data-icmore="${iso}"]`)
  return { total: n, sansCov, bars: bars.length, moreText: more ? more.textContent : null, expectedMore: n - bars.length }
}, iso)
const m0 = await measure('2026-07-13'); L('13 Jul', JSON.stringify(m0)); res.crowd = m0
await shot(p, N('1-crowd'))
// press "+N more": every one of them must be reachable
const more = p.locator('[data-icmore="2026-07-13"]')
await press(p, size, more); await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(400)
const day = await p.evaluate(() => ({ rows: document.querySelectorAll('[data-testid="win-inputsday"] [data-testid^="idy-row-"]').length, count: document.querySelector('[data-testid="idy-count"]')?.textContent, text: document.querySelector('[data-testid="win-inputsday"]').innerText.slice(0, 120).replace(/\n/g, ' | '), sansListed: /SANS/i.test(document.querySelector('[data-testid="win-inputsday"]').innerText) }))
L('opened day', JSON.stringify(day)); res.day = day
await shot(p, N('2-more-opened'))
// every hidden input is reachable: press each row's open button and see an editor for that very input
const rowIds = await p.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] [data-testid^="idy-row-"]')].map(e => e.dataset.popiid))
let reach = 0, unreach = []
for (const id of rowIds) {
  const btn = p.locator(`[data-testid="idy-row-${id}"] [data-testid="idy-open"]`)
  await btn.scrollIntoViewIfNeeded()
  await press(p, size, btn).catch(() => unreach.push(id + ' (press failed)'))
  await p.waitForTimeout(250)
  const open = await p.locator('[data-testid="win-inputedit"]').count()
  const ttl = open ? await p.locator('[data-testid="win-inputedit"] .win-ttl').innerText() : ''
  if (open) { reach++; await p.locator('[data-testid="win-inputedit-x"]').click().catch(() => {}); await p.waitForTimeout(200) } else unreach.push(id)
}
L('rows', rowIds.length, 'opened editors', reach, 'unreachable', JSON.stringify(unreach)); res.reach = { rows: rowIds.length, reach, unreach }
// ---- the year boundary: Dec 2026 / Jan 2027
await p.keyboard.press('Escape')
await toMonth(p, 2026, 12)
const ids = await seedFile(p, [
  { who: 2, type: 'OL', from: 'Dec 28', to: 'Jan 4 2027', more: { yr: 2026 } },
  { who: 3, type: 'LL', from: 'Dec 30', to: 'Jan 2 2027', more: { yr: 2026 } },
  { who: 4, type: 'Meeting', from: 'Dec 31', timed: [600, 660], more: { yr: 2026 } },
  { who: 5, type: 'Duty', from: 'Dec 31', to: 'Jan 1 2027', more: { yr: 2026 } },
])
await p.waitForTimeout(500)
const barsOf = async () => p.evaluate(() => [...document.querySelectorAll('.ib-bar')].map(e => ({ iid: e.dataset.iid, cls: e.className.replace(/\s+/g, ' '), text: e.textContent, week: [...document.querySelectorAll('.ib-week')].indexOf(e.closest('.ib-week')), l: Math.round(e.getBoundingClientRect().left), r: Math.round(e.getBoundingClientRect().right) })))
const dec = (await barsOf()).filter(x => ids.includes(x.iid))
L('Dec 2026 bars of the 4 seeded:', JSON.stringify(dec)); res.dec = dec
await shot(p, N('3-december'))
await press(p, size, p.locator('#icNext')); await p.waitForTimeout(500)
const jan = (await barsOf()).filter(x => ids.includes(x.iid))
L('Jan 2027 bars of the 4 seeded:', JSON.stringify(jan)); res.jan = jan
await shot(p, N('4-january'))
// identity: for each iid the class colour is the same in both months; no iid has two bars in one week
const colour = c => /red/.test(c) ? 'red' : /amber|gold|yel/.test(c) ? 'amber' : c
const ident = ids.map(id => ({ id, dec: dec.filter(x => x.iid === id).map(x => colour(x.cls)), jan: jan.filter(x => x.iid === id).map(x => colour(x.cls)), decWeeks: dec.filter(x => x.iid === id).map(x => x.week), janWeeks: jan.filter(x => x.iid === id).map(x => x.week) }))
L('identity', JSON.stringify(ident)); res.ident = ident
// open the continuation in January: opens the same input
const cont = bar(p, ids[0]).first()
await press(p, size, cont); await p.waitForTimeout(400)
L('continuation in Jan opens:', await p.locator('[data-testid="win-inputedit"] .win-ttl').innerText().catch(() => 'nothing'), '| records for that man on Dec 28:', await p.evaluate(id => window.INPUTS.filter(x => x.iid === id).length, ids[0]))
await shot(p, N('5-continuation-opened'))
L('errors', JSON.stringify(w.errors))
saveRows('p507-' + size, [{ log, res, errors: w.errors }])
await b.close()
