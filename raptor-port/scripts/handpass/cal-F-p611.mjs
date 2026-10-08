import * as L from './cal-F-lib3.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE, clock: new Date('2026-06-29T10:00:00') })
const p = await L.newPage(ctx)
await p.clock.setFixedTime(new Date('2026-06-29T10:00:00'))
await L.signIn(p, 'ad')
console.log('browser date', await p.evaluate(() => new Date().toString()))
await L.go(p, 'inputs')
await L.toastSpy(p)
const P = L.press(p, PHONE)
const [ace, anvil, basher, cinder, echo, cutter] = await L.ids(p, ['Ace', 'Anvil', 'Basher', 'Cinder', 'Echo', 'Cutter'])
const pic = n => L.pic(p, `${TAG}-p611-${n}`)
async function fileOne(person, type, from, to) {
  await L.openNew(p, from, { phone: PHONE })
  await p.selectOption('#inpEditPerson', person)
  await p.selectOption('#inpEditType', type)
  if (to) await L.pickDates(p, from, to)
  await L.setWhen(p, { allday: true })
  const had = await L.iidSet(p)
  await P(p.locator('#inpEditSave')); await L.sleep(600)
  const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible')
  if (await nodoc.count()) { await P(nodoc); await L.sleep(500) }
  const nr = await L.newRows(p, had)
  return nr[0]
}
const fixtures = {}
fixtures.ace = await fileOne(ace, 'LL', '2026-07-15')                         // 29 Jun: on time
fixtures.cinder = await fileOne(cinder, 'LL', '2026-07-17', '2026-07-21')      // 29 Jun, week of 13 Jul into the next
await p.clock.setFixedTime(new Date('2026-06-30T10:00:00'))
console.log('browser date now', await p.evaluate(() => new Date().toString()))
fixtures.anvil = await fileOne(anvil, 'LL', '2026-07-15')                      // 30 Jun: late
fixtures.basher = await fileOne(basher, 'LL', '2026-07-10', '2026-07-14')      // span from the week of 6 Jul
fixtures.echo = await fileOne(echo, 'HL', '2026-07-15')                        // medical, 30 Jun: never LATE
fixtures.cutter = await fileOne(cutter, 'Training', '2026-07-16')              // a duty, 30 Jun: LATE
console.log(JSON.stringify(Object.fromEntries(Object.entries(fixtures).map(([k, v]) => [k, v && { person: v.person, date: v.date, endDate: v.endDate, mod: v.mod }]))))
const lateData = await p.evaluate(() => window.INPUTS.filter(r => ['dj', 'shaft', 'glass', 'ammo', 'freak', 'psy'].includes(r.person) && ['Jul 15', 'Jul 17', 'Jul 10', 'Jul 16'].includes(r.date)).map(r => ({ cs: window.PEOPLE[r.person].cs, type: r.type, date: r.date, mod: r.mod })))
console.log('stored stamps', JSON.stringify(lateData))

/* ---- the Inputs month: the opened days ---- */
await L.go(p, 'inputs')
await L.month(p, 2026, 7, PHONE ? (l => l.tap()) : null)
const dayLate = async iso => {
  if (await p.locator('[data-testid="win-inputsday-x"]').count()) await P(p.locator('[data-testid="win-inputsday-x"]'))
  const c = L.cell(p, iso); if (PHONE) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
  await L.sleep(500)
  return p.evaluate(() => [...document.querySelectorAll('[data-testid="idy-row"], [data-testid^="idy-row-"]')].map(r => ({ who: (r.querySelector('.idy-who') || {}).innerText, kind: (r.querySelector('.idy-kind') || {}).innerText, late: !!r.querySelector('[data-testid="idy-late"], .sd-late') })))
}
const month = {}
for (const iso of ['2026-07-10', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-20']) month[iso] = await dayLate(iso)
await pic('month-15jul')
const d15 = await dayLate('2026-07-15'); await pic('day-15jul')
console.log('month', JSON.stringify(month))

/* ---- the List ---- */
await P(p.locator('#inListBtn')); await L.sleep(600)
await P(p.locator('#inRangeBtn')); await L.sleep(300)
if (await p.locator('#inRangeAll:visible').count()) { await P(p.locator('#inRangeAll')); await L.sleep(500) }
const list = await p.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(t => ({ t: t.innerText.replace(/\s+/g, ' ').slice(0, 90), late: /LATE/.test(t.innerText) })).filter(r => /^(Ace|Anvil|Basher|Cinder|Echo|Cutter) /.test(r.t)))
await pic('list')
console.log('list', JSON.stringify(list))
await P(p.locator('#inCalBtn')); await L.sleep(400)

/* ---- the week (View-only Sched) and the board (Edit Schedule) ---- */
const NAMES = ['Ace', 'Anvil', 'Basher', 'Cinder', 'Echo', 'Cutter']
const lateRows = (scope) => p.evaluate(([sc, names]) => {
  const root = document.querySelector(sc); if (!root) return null
  const out = []
  for (const e of root.querySelectorAll('.latetag, .latechip')) {
    if (e.offsetParent === null) continue
    const row = e.closest('.pl-row, .sb-arow'); const t = row ? row.innerText.replace(/\s+/g, ' ') : ''
    out.push((names.find(n => (' ' + t + ' ').includes(' ' + n + ' '))) || ('?' + t.slice(0, 30)))
  }
  return out
}, [scope, NAMES])
const weekLate = {}
await L.go(p, 'viewsched'); await L.sleep(800)
weekLate['13jul'] = await lateRows('#vWeek')
await pic('week-13jul')
await p.evaluate(() => window.loadWeek('20/07/2026')); await L.sleep(900)
weekLate['20jul'] = await lateRows('#vWeek')
await pic('week-20jul')
await p.evaluate(() => window.loadWeek('06/07/2026')); await L.sleep(900)
weekLate['06jul'] = await lateRows('#vWeek')
await pic('week-06jul')
await p.evaluate(() => window.loadWeek('13/07/2026')); await L.sleep(600)
console.log('week late tags by man', JSON.stringify(weekLate))

await L.go(p, 'editsched'); await L.sleep(500)
const boardLate = {}
await p.locator('#eWeek [data-sbday="2"]:visible').first().click(); await p.waitForSelector('#schedBoard'); await L.sleep(800)
for (const di of [2, 3, 4]) {
  const rowsN = () => p.evaluate(() => document.querySelectorAll('#schedBoard .pinp .sb-arow, #schedBoard .pinp .sbi-row').length)
  if (!(await rowsN())) { const tg = p.locator(`#schedBoard [data-pitog="${di}"]:visible`); if (await tg.count()) { await tg.first().click(); await L.sleep(500) } }
  boardLate[di] = await lateRows('#schedBoard')
  if (di === 2) await pic('board-wed')
  if (di === 3) await pic('board-thu')
  if (PHONE) await p.locator('#sbNextDay').tap(); else await p.locator(`#sbDays [data-sbtab="${di + 1}"]`).click(); await L.sleep(800)
}
console.log('board late by man (Wed, Thu, Fri)', JSON.stringify(boardLate))
const monthLate = k => Object.fromEntries(Object.values(month).flat().filter(r => NAMES.includes(r.who)).map(r => [r.who + ' ' + r.kind, r.late]))
console.log('month by man', JSON.stringify(monthLate()))
const listLate = Object.fromEntries(list.filter(r => NAMES.includes(r.t.split(' ')[0]) && /LL|HL|TRAINING/.test(r.t) && !/OIL|DUTY|OL /.test(r.t.slice(0, 20)) ).map(r => [r.t.split(' ').slice(0, 4).join(' '), r.late]))
console.log('list by man', JSON.stringify(listLate))
const has = (arr, n) => (arr || []).includes(n)
L.judge('P6-11', 'controlled clock 29 Jun 10:00 then 30 Jun 10:00; Inputs on 14 days; LL for Ace and Cinder (span 17-21 Jul) filed 29 Jun; LL for Anvil, LL for Basher (10-14 Jul, a span beginning the week before), HL for Echo, Training for Cutter filed 30 Jun; read on the month, List, week and board; then other weeks', [
  ['month: 29 Jun filings on time (Ace 15 Jul, Cinder 17 Jul)', month['2026-07-15'].find(r => r.who === 'Ace').late === false && month['2026-07-17'].find(r => r.who === 'Cinder').late === false, { ace: month['2026-07-15'].find(r => r.who === 'Ace'), cinder: month['2026-07-17'].find(r => r.who === 'Cinder') }],
  ['month: 30 Jun filings late (Anvil LL, Cutter Training); Echo’s medical never LATE', month['2026-07-15'].find(r => r.who === 'Anvil').late === true && month['2026-07-16'].find(r => r.who === 'Cutter').late === true && month['2026-07-15'].find(r => r.who === 'Echo').late === false, month['2026-07-15'].filter(r => ['Anvil', 'Echo'].includes(r.who))],
  ['month: Basher’s span starting in the earlier week is late on both of its weeks (10 Jul and 14 Jul)', month['2026-07-10'].find(r => r.who === 'Basher').late === true && month['2026-07-14'].find(r => r.who === 'Basher').late === true],
  ['month: Cinder’s span stays on time into the next week (20 Jul)', month['2026-07-20'].find(r => r.who === 'Cinder').late === false],
  ['List: the same judgement per man', list.find(r => /^Ace 15 Jul/.test(r.t)).late === false && list.find(r => /^Anvil 15 Jul/.test(r.t)).late === true && list.find(r => /^Echo 15 Jul/.test(r.t)).late === false && list.find(r => /^Basher 10 Jul/.test(r.t)).late === true && list.find(r => /^Cinder 17 Jul/.test(r.t)).late === false && list.find(r => /^Cutter 16 Jul/.test(r.t)).late === true, listLate],
  ['week 13 Jul: Anvil, Basher, Cutter wear LATE; Ace, Cinder, Echo do not', has(weekLate['13jul'], 'Anvil') && has(weekLate['13jul'], 'Basher') && has(weekLate['13jul'], 'Cutter') && !has(weekLate['13jul'], 'Ace') && !has(weekLate['13jul'], 'Cinder') && !has(weekLate['13jul'], 'Echo'), weekLate['13jul']],
  ['loading another week does not change a man’s lateness: week 20 Jul (Cinder not late), week 6 Jul (Basher late)', !has(weekLate['20jul'], 'Cinder') && has(weekLate['06jul'], 'Basher'), { w20: weekLate['20jul'], w06: weekLate['06jul'] }],
  ['board (Wed/Thu): Anvil and Cutter LATE; Ace, Echo not', has(boardLate[2], 'Anvil') && has(boardLate[3], 'Cutter') && !has(boardLate[2], 'Ace') && !has(boardLate[2], 'Echo'), boardLate],
], [])
console.log('errors', JSON.stringify(L.errors))
L.savePart('p611-' + TAG)
await b.close()
