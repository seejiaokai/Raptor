/* E2 — ROWS THAT CROSS MIDNIGHT, ROWS WITH NO TIMES, ZERO-LENGTH ROWS
   (Fable S30, Codex 15 in part). Clean Sunday (day 6). */
import { open, board, tap, type, put, shot, oilMode, warnings, publish } from './lib.mjs'
import { modeRead, bars, money, tracker, closeTracker, names, SUN } from './ef.mjs'

const STATE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat.json'
const di = 6
const R = {}
const { browser, page, errors } = await open({ state: STATE })
const NM = await names(page)
const cs = id => NM[id] || id
const waveIx = (kind) => page.evaluate(([i, k]) => window.DAYS[i].waves.findIndex(w => (w.kind || 'fly') === k), [di, kind])

async function look(tag, who) {
  await oilMode(page, true)
  const m = await modeRead(page)
  await shot(page, `EF-E2-${tag}-mode`)
  await oilMode(page, false)
  const b = await bars(page)
  return { mode: m.people.filter(x => who.includes(x.id)), items: m.items, bar: b.filter(x => who.includes(x.id)) }
}

await board(page, di)

/* ---- 1. SC MAIN crossing midnight: 20:00-02:00 = 6h00, then 02:01 ------ */
await tap(page, `[data-wvadd="${di}"]`)
await page.getByRole('button', { name: 'SC', exact: true }).click()
await page.waitForTimeout(700)
const sc = await waveIx('sc')
R.scIndex = sc
await type(page, `[data-bfld="ff:${di}.${sc}.0.to"]`, '20:00')
await type(page, `[data-bfld="ff:${di}.${sc}.0.ld"]`, '02:00')
R.scP = await put(page, `[data-slot="${di}.${sc}.0.0.p"]`, ['pump'])
R.scW = await put(page, `[data-slot="${di}.${sc}.0.0.w"]`, ['glass'])
R.sc360 = await look('01-sc-2000-0200', ['pump', 'glass'])
await type(page, `[data-bfld="ff:${di}.${sc}.0.ld"]`, '02:01')
R.sc361 = await look('02-sc-2000-0201', ['pump', 'glass'])

/* ---- 2. a night flying line: T-O 23:00, land 00:30 --------------------- */
await tap(page, `[data-wvadd="${di}"]`)
await page.getByRole('button', { name: 'Flying wave', exact: true }).click()
await page.waitForTimeout(700)
const fw = await waveIx('fly')
R.flyIndex = fw
await type(page, `[data-bfld="ff:${di}.${fw}.0.cs"]`, 'NIGHTHAWK')
await type(page, `[data-bfld="ff:${di}.${fw}.0.to"]`, '23:00')
await type(page, `[data-bfld="ff:${di}.${fw}.0.ld"]`, '00:30')
R.nightP = await put(page, `[data-slot="${di}.${fw}.0.0.p"]`, ['razer'])
R.nightW = await put(page, `[data-slot="${di}.${fw}.0.0.w"]`, ['sufa'])
R.night = await look('03-night-2300-0030', ['razer', 'sufa'])

/* ---- 3 + 4. a desk with NO times, and a desk 09:00-09:00 --------------- */
await tap(page, `[data-dradd="${di}.0"]`)
await tap(page, `[data-dradd="${di}.0"]`)
await type(page, `[data-bfld="dr:${di}.0.1.role"]`, 'BLIND DESK')
await type(page, `[data-bfld="dr:${di}.0.2.role"]`, 'ZERO DESK')
await type(page, `[data-bfld="dr:${di}.0.2.str"]`, '09:00')
await type(page, `[data-bfld="dr:${di}.0.2.end"]`, '09:00')
R.blindFill = await put(page, `[data-fill="d:${di}.0.1.+"]`, ['nact'])
R.zeroFill = await put(page, `[data-fill="d:${di}.0.2.+"]`, ['casper'])
R.blindZero = await look('04-blind-and-zero', ['nact', 'casper'])
R.warnBefore = await warnings(page)
await shot(page, 'EF-E2-05-warnings')

/* ---- 5. can the no-times man be allowed in at all? --------------------- */
await oilMode(page, true)
const m = await modeRead(page)
R.allItems = m.items.map(i => `${i.text} :: ${i.title}`)
R.allPeople = m.people.map(p => `${cs(p.id)} :: ${p.text} :: ${p.title}`)
R.blindHasPuck = m.people.some(p => p.id === 'nact')
R.zeroHasPuck = m.people.some(p => p.id === 'casper')
R.blindHasItem = m.items.some(i => /BLIND DESK/i.test(i.text))
R.zeroHasItem = m.items.some(i => /ZERO DESK/i.test(i.text))
/* try to tap the blind desk's puck anyway, through whatever is drawn there */
const blindPuck = page.locator(`#schedBoard .puck[data-person="nact"]:visible`).first()
R.blindPuckTitle = await blindPuck.count() ? await blindPuck.getAttribute('title') : 'NO PUCK'
if (await blindPuck.count()) { try { await blindPuck.click({ timeout: 2000 }) } catch (e) { R.blindClickErr = String(e).slice(0, 80) } }
await page.waitForTimeout(500)
R.afterBlindTap = (await modeRead(page)).people.filter(p => p.id === 'nact')
R.blindBarAfterTap = (await bars(page)).filter(p => p.id === 'nact')
await shot(page, 'EF-E2-06-blind-tap')
await oilMode(page, false)

/* ---- publish and read the money --------------------------------------- */
R.publish = await publish(page, di)
await page.waitForTimeout(800)
R.warnAfter = await warnings(page)
await shot(page, 'EF-E2-07-published')
const who = ['pump', 'glass', 'razer', 'sufa', 'nact', 'casper', 'spaceman']
R.barsAfter = (await bars(page)).filter(p => who.includes(p.id))
R.gridSun = await money(page, who, SUN)
R.gridMon = await money(page, who, '2026-07-20')
R.tracker = await tracker(page, who)
await shot(page, 'EF-E2-08-oil-tracker')
await closeTracker(page)

R.errors = errors.slice(0, 10)
const { writeFileSync } = await import('node:fs')
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/ef-e2.json', JSON.stringify(R, null, 1))

const P = (t, o) => { console.log('\n== ' + t); (o.mode || []).forEach(x => console.log(`  MODE ${cs(x.id).padEnd(10)} ${x.text.padEnd(16)} ${x.title}`)); (o.bar || []).forEach(x => console.log(`  BAR  ${cs(x.id).padEnd(10)} ${String(x.bar).padEnd(10)} ${x.title}`)) }
P('SC MAIN 20:00-02:00', R.sc360)
P('SC MAIN 20:00-02:01', R.sc361)
P('night line 23:00-00:30', R.night)
P('blind desk + zero desk', R.blindZero)
console.log('\n== items in the mode =='); R.allItems.forEach(s => console.log('  ' + s))
console.log('\n== people in the mode =='); R.allPeople.forEach(s => console.log('  ' + s))
console.log('\nblind desk has a tappable person?', R.blindHasPuck, '| item switch?', R.blindHasItem)
console.log('zero desk has a tappable person?', R.zeroHasPuck, '| item switch?', R.zeroHasItem)
console.log('blind puck title:', R.blindPuckTitle, '| click err:', R.blindClickErr || 'none')
console.log('after tapping the blind man:', JSON.stringify(R.afterBlindTap), JSON.stringify(R.blindBarAfterTap))
console.log('\n== warnings BEFORE publish ==', JSON.stringify(R.warnBefore))
console.log('== warnings AFTER publish ==', JSON.stringify(R.warnAfter))
console.log('== publish ==', JSON.stringify(R.publish))
console.log('\n== bars after publish =='); R.barsAfter.forEach(x => console.log(`  ${cs(x.id).padEnd(10)} ${String(x.bar).padEnd(10)} ${x.title}`))
console.log('\n== leave war SUNDAY =='); for (const k of who) console.log(`  ${cs(k).padEnd(10)} ${JSON.stringify(R.gridSun[k])}`)
console.log('\n== leave war MONDAY 20 Jul =='); for (const k of who) console.log(`  ${cs(k).padEnd(10)} ${JSON.stringify(R.gridMon[k])}`)
console.log('\n== oil tracker =='); for (const k of who) console.log(`  ${cs(k).padEnd(10)} ${JSON.stringify((R.tracker[k] || {}).entries || R.tracker[k]).slice(0, 600)}`)
console.log('\nerrors', R.errors)
await browser.close()
