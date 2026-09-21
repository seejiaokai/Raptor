/* E1 — EXACTLY SIX HOURS, BY THREE ROUTES  (Fable S29, Codex 4)
   A clean Sunday (day 6): it arrives carrying only the SDO desk, Dash 08:00-18:00.
   360 minutes must be HALF a day; 361 a FULL day. Three routes to the boundary:
   one desk, one sortie, two gapped desks. */
import { open, board, tap, type, put, shot, oilMode, warnings } from './lib.mjs'
import { modeRead, bars, money, tracker, closeTracker, names, SUN } from './ef.mjs'

const STATE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat.json'
const di = 6
const R = {}
const { browser, page, errors } = await open({ state: STATE })
const NM = await names(page)
const cs = id => NM[id] || id

async function look(tag, who) {
  await oilMode(page, true)
  const m = await modeRead(page)
  await shot(page, `EF-E1-${tag}-mode`)
  await oilMode(page, false)
  const b = await bars(page)
  const pick = arr => arr.filter(x => who.includes(x.id))
  return { mode: pick(m.people), items: m.items, bar: pick(b) }
}

await board(page, di)

/* ---- route 1: ONE DESK, 08:00-14:00 then 14:01 ------------------------- */
await type(page, `[data-bfld="dr:${di}.0.0.end"]`, '14:00')
R.desk360 = await look('01-desk360', ['spaceman'])
await type(page, `[data-bfld="dr:${di}.0.0.end"]`, '14:01')
R.desk361 = await look('02-desk361', ['spaceman'])

/* ---- route 2: ONE SORTIE, land 11:00 then 11:01 ------------------------ */
await tap(page, `[data-wvadd="${di}"]`)
await page.getByRole('button', { name: 'Flying wave', exact: true }).click()
await page.waitForTimeout(600)
await type(page, `[data-bfld="ff:${di}.0.0.cs"]`, 'VIPER')
await type(page, `[data-bfld="ff:${di}.0.0.to"]`, '10:00')
await type(page, `[data-bfld="ff:${di}.0.0.ld"]`, '11:00')
R.seatP = await put(page, `[data-slot="${di}.0.0.0.p"]`, ['bane'])
R.seatW = await put(page, `[data-slot="${di}.0.0.0.w"]`, ['freak'])
R.sortie360 = await look('03-sortie360', ['bane', 'freak'])
await type(page, `[data-bfld="ff:${di}.0.0.ld"]`, '11:01')
R.sortie361 = await look('04-sortie361', ['bane', 'freak'])

/* ---- route 3: TWO GAPPED DESKS for one man ----------------------------- */
await tap(page, `[data-dradd="${di}.0"]`)
await tap(page, `[data-dradd="${di}.0"]`)
await type(page, `[data-bfld="dr:${di}.0.1.role"]`, 'EARLY DESK')
await type(page, `[data-bfld="dr:${di}.0.1.str"]`, '07:00')
await type(page, `[data-bfld="dr:${di}.0.1.end"]`, '08:00')
await type(page, `[data-bfld="dr:${di}.0.2.role"]`, 'LATE DESK')
await type(page, `[data-bfld="dr:${di}.0.2.str"]`, '12:00')
await type(page, `[data-bfld="dr:${di}.0.2.end"]`, '13:00')
R.fill1 = await put(page, `[data-fill="d:${di}.0.1.+"]`, ['bruise'])
R.fill2 = await put(page, `[data-fill="d:${di}.0.2.+"]`, ['bruise'])
R.gap360 = await look('05-gap360', ['bruise'])
await type(page, `[data-bfld="dr:${di}.0.2.end"]`, '13:01')
R.gap361 = await look('06-gap361', ['bruise'])

/* switch the FIRST (early) desk off in the mode — the far end goes with it */
await oilMode(page, true)
const before = await modeRead(page)
R.itemsAtSwitch = before.items.map(i => `${i.key} :: ${i.text} :: ${i.title}`)
const early = before.items.find(i => /EARLY DESK/i.test(i.text)) || before.items.find(i => i.key === `d:${di}.0.1`)
R.earlyItem = early || null
if (early) {
  await page.locator(`#schedBoard [data-oilitem="${early.key}"]:visible`).first().click()
  await page.waitForTimeout(700)
}
R.afterSwitchMode = (await modeRead(page)).people.filter(p => p.id === 'bruise')
await shot(page, 'EF-E1-07-early-off-mode')
await oilMode(page, false)
R.afterSwitchBars = (await bars(page)).filter(p => p.id === 'bruise')
await shot(page, 'EF-E1-08-early-off')

R.warn = await warnings(page)

/* ---- publish once, then read the money -------------------------------- */
const { publish } = await import('./lib.mjs')
R.publish = await publish(page, di)
await page.waitForTimeout(800)
await shot(page, 'EF-E1-09-published')
R.barsAfterPublish = (await bars(page)).filter(p => ['spaceman', 'bane', 'freak', 'bruise'].includes(p.id))

const who = ['spaceman', 'bane', 'freak', 'bruise']
R.grid = await money(page, who, SUN)
R.tracker = await tracker(page, who)
await shot(page, 'EF-E1-10-oil-tracker')
await closeTracker(page)

R.errors = errors.slice(0, 10)
const { writeFileSync } = await import('node:fs')
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/ef-e1.json', JSON.stringify(R, null, 1))

const P = (t, o) => { console.log('\n== ' + t); (o.mode || []).forEach(x => console.log(`  MODE ${cs(x.id).padEnd(10)} ${x.cls.slice(0, 44).padEnd(46)} ${x.title}`)); (o.bar || []).forEach(x => console.log(`  BAR  ${cs(x.id).padEnd(10)} ${String(x.bar).padEnd(10)} ${x.cls.slice(0, 40).padEnd(42)} ${x.title}`)) }
P('desk 360 (08:00-14:00)', R.desk360)
P('desk 361 (08:00-14:01)', R.desk361)
P('sortie 360 (10:00-11:00)', R.sortie360)
P('sortie 361 (10:00-11:01)', R.sortie361)
P('two desks 360 (07-08 + 12-13)', R.gap360)
P('two desks 361 (07-08 + 12-13:01)', R.gap361)
console.log('\n== items in the mode =='); R.itemsAtSwitch.forEach(s => console.log('  ' + s))
console.log('\n== after switching EARLY DESK off ==')
R.afterSwitchMode.forEach(x => console.log(`  MODE ${cs(x.id)} ${x.cls} ${x.title}`))
R.afterSwitchBars.forEach(x => console.log(`  BAR  ${cs(x.id)} ${x.bar} ${x.cls} ${x.title}`))
console.log('\n== warnings ==', JSON.stringify(R.warn))
console.log('\n== publish ==', JSON.stringify(R.publish))
console.log('\n== bars after publish =='); R.barsAfterPublish.forEach(x => console.log(`  ${cs(x.id).padEnd(10)} ${String(x.bar).padEnd(10)} ${x.title}`))
console.log('\n== leave war grid =='); for (const k of who) console.log(`  ${cs(k).padEnd(10)} ${JSON.stringify(R.grid[k])}`)
console.log('\n== oil tracker =='); for (const k of who) console.log(`  ${cs(k).padEnd(10)} ${JSON.stringify(R.tracker[k]).slice(0, 700)}`)
console.log('\nerrors', R.errors)
await browser.close()
