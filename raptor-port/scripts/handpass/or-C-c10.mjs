// Walker C, C10 - typed boxes on every line (desktop 1440x900). One world.
import * as L from './or-C-lib.mjs'
import * as L2 from './or-C-lib2.mjs'
const { browser, page: p, errs } = await L.openWorld()
const DI = 2, ISO = '2026-07-15'
const j = o => JSON.stringify(o)
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: ISO, to: ISO, timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
const iid = mt.iid
console.log('filed', j(mt))
const inputsNow = () => p.evaluate(id => { const r = window.INPUTS.find(x => x.iid === id); const f = m => (m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')); return `time ${f(r.s)}-${f(r.e)} remarks="${r.remarks || ''}" title="${r.title || ''}" people=${JSON.stringify(r.people.map(e => window.PEOPLE[e.p]?.cs))} late=${JSON.stringify(r.late || r.lt || null)} keys=${Object.keys(r).filter(k => /late|lat/i.test(k)).join(',')}` }, iid)
const ri0 = await L.rowIdx(p, DI, iid)
const day = () => p.locator('#eWeek .day:not(.peek)').nth(DI)
async function typeCE(loc, v) { await loc.scrollIntoViewIfNeeded(); await loc.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(v); await loc.evaluate(e => e.blur()); await p.waitForTimeout(450) }
async function typeIn(loc, v) { await loc.scrollIntoViewIfNeeded(); await loc.click(); await loc.fill(v); await loc.evaluate(e => e.blur()); await p.waitForTimeout(450) }
async function openWeek() { await L.goEdit(p); const d = day(); const f = d.locator('.sec-inp .pl-fold').first(); if (!(await d.locator('.sec-inp .pl-row').count()) && await f.count()) { await f.scrollIntoViewIfNeeded(); await f.click(); await p.waitForTimeout(300) } }
async function openBoardWithLine() { await L.openBoard(p, DI); const has = await p.evaluate(() => document.querySelectorAll('#schedBoard .pinp .sb-arow').length); if (!has) { const f = p.locator(`#schedBoard [data-pitog="${DI}"]:visible`).first(); await f.scrollIntoViewIfNeeded(); await f.click(); await p.waitForTimeout(300) } }
const late = o => Object.entries(o).filter(([k, v]) => /\bLATE\b/i.test(typeof v === 'string' ? v : j(v))).map(([k]) => k)
const typers = {
  a: async (s, e, r) => { await openWeek(); const ri = await L.rowIdx(p, DI, iid); await typeCE(day().locator(`[data-txt="gr:${DI}.${ri}.end"]`), e); await typeCE(day().locator(`[data-txt="gr:${DI}.${ri}.str"]`), s); await typeCE(day().locator(`[data-txt="gr:${DI}.${ri}.rmks"]`), r) },
  b: async (s, e, r) => { await openBoardWithLine(); const ri = await L.rowIdx(p, DI, iid); await typeIn(p.locator(`#schedBoard [data-bfld="gr:${DI}.${ri}.end"]:visible`).first(), e); await typeIn(p.locator(`#schedBoard [data-bfld="gr:${DI}.${ri}.str"]:visible`).first(), s); await typeIn(p.locator(`#schedBoard [data-bfld="gr:${DI}.${ri}.rmks"]:visible`).first(), r) },
  c: async (s, e, r) => { await openWeek(); const l = day().locator('.sec-inp [data-inprow]').first(); await typeCE(l.locator('[data-inp$=".end"]'), e); await typeCE(l.locator('[data-inp$=".str"]'), s); await typeCE(l.locator('[data-inp$=".rmks"]'), r) },
  d: async (s, e, r) => { await openBoardWithLine(); const l = p.locator('#schedBoard .pinp .sb-arow.inprow:visible').first(); await typeIn(l.locator('[data-ifld$=".end"]'), e); await typeIn(l.locator('[data-ifld$=".str"]'), s); await typeIn(l.locator('[data-ifld$=".rmks"]'), r) },
}
const steps = [['a', 'the week\'s row', '10:00', '11:00', 'Alpha'], ['b', 'the board\'s row', '11:00', '12:00', 'Bravo'], ['c', 'its line on the week', '12:00', '13:00', 'Charlie'], ['d', 'its line on the board', '13:00', '14:00', 'Delta']]
console.log('START', await inputsNow())
for (const [k, label, s, e, r] of steps) {
  console.log(`=== (${k}) typed on ${label}: ${s} / ${e} / "${r}"`)
  const m = await L.toastMark(p)
  await typers[k](s, e, r)
  console.log('  toasts:', await L.toastsSince(p, m))
  console.log('  INPUTS:', await inputsNow())
  const surf = await L2.surfaces(p, { di: DI, iso: ISO, iid })
  for (const [kk, v] of Object.entries(surf)) console.log(`  ${kk}: ${typeof v === 'string' ? v : j(v)}`)
  console.log('  anything reading LATE:', j(late(surf)))
  if (k === 'a' || k === 'c') { await L.goEdit(p); await day().locator('.sec-grnd .pl-row').first().scrollIntoViewIfNeeded(); await L.shot(p, `c10-${k}-after`) }
  // U / R once
  await L.goEdit(p)
  const u = await L.undoRedo(p, 'undo'); console.log(`  UNDO once (${u.used}): INPUTS:`, await inputsNow(), '| toast:', await L.toastNow(p))
  const r2 = await L.undoRedo(p, 'redo'); console.log(`  REDO once (${r2.used}): INPUTS:`, await inputsNow())
}
console.log('ERRORS', errs.join(' | ') || 'none')
await browser.close()
