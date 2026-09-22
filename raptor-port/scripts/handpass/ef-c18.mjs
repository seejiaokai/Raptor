/* C18 — a hidden SANS man, an archived man and a named ground-crew man keep the
   right money. Display membership must never become a second money authority.
   Clean Sunday (day 6). */
import { open, board, tap, type, shot, oilMode, publish, go } from './lib.mjs'
import { modeRead, names, putSure, money, tracker, closeTracker, closeSheets, leaveWar, SUN } from './ef.mjs'

const STATE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat.json'
const di = 6
const R = {}
const { browser, page, errors } = await open({ state: STATE })
const { writeFileSync } = await import('node:fs')
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/ef-c18.json'
const save = t => { R._at = t; writeFileSync(OUT, JSON.stringify(R, null, 1)) }

const onGrid = async (ids) => { await leaveWar(page); return page.evaluate(list => Object.fromEntries(list.map(id => {
  const row = document.querySelector(`[data-testid="row-${id}"]`)
  const cell = document.querySelector(`[data-testid="cell-${id}-2026-07-19"]`)
  return [id, { row: !!row, cell: cell ? (cell.innerText || '').trim() : 'NO CELL' }]
})), ids) }

async function showSans(on) {
  await leaveWar(page); await closeSheets(page)
  await page.locator('[data-testid="settings-open"]:visible').first().click()
  await page.waitForTimeout(900)
  const btn = page.locator('button').filter({ hasText: /^(Show SANS|✓ SANS shown)$/ }).first()
  const label = await btn.count() ? (await btn.innerText()).trim() : 'NO SANS BUTTON'
  const isOn = label.startsWith('✓')
  if (isOn !== on && await btn.count()) { await btn.click(); await page.waitForTimeout(800) }
  const after = await btn.count() ? (await btn.innerText()).trim() : label
  await closeSheets(page)
  await page.waitForTimeout(800)
  return { was: label, now: after }
}

await board(page, di)
await tap(page, `[data-gradd="${di}"]`); await tap(page, `[data-gradd="${di}"]`)
await type(page, `[data-bfld="gr:${di}.0.prog"]`, 'SANS TASK')
await type(page, `[data-bfld="gr:${di}.0.str"]`, '07:00')
await type(page, `[data-bfld="gr:${di}.0.end"]`, '08:00')
R.f1 = await putSure(page, `[data-fill="g:${di}.0.+"]`, 'yeti', id => JSON.stringify(window.DAYS[6].ground[0]).includes('"' + id + '"'))
await type(page, `[data-bfld="gr:${di}.1.prog"]`, 'GROUND CREW JOB')
await type(page, `[data-bfld="gr:${di}.1.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.1.end"]`, '17:00')
R.f2 = await putSure(page, `[data-fill="g:${di}.1.+"]`, 'torque', id => JSON.stringify(window.DAYS[6].ground[1]).includes('"' + id + '"'))
await tap(page, `[data-padd="${di}"]`); await page.waitForTimeout(400)
await type(page, `[data-bfld="ap:${di}.0.prog"]`, 'FAMILY DAY')
await type(page, `[data-bfld="ap:${di}.0.str"]`, '10:00')
await type(page, `[data-bfld="ap:${di}.0.end"]`, '17:00')
R.f3 = await putSure(page, `[data-fill="a:${di}.0.+"]`, 'allavail', id => JSON.stringify(window.DAYS[6].allhands[0]).includes('"' + id + '"'))
save('built')

await oilMode(page, true)
const m = await modeRead(page)
R.family = await page.evaluate(() => {
  const P = window.PEOPLE
  return [...document.querySelectorAll('#schedBoard [data-oilp]')].filter(e => {
    const row = e.closest('.sb-arow,.sb-row,tr,li'); return row && /FAMILY DAY/i.test(row.innerText || '')
  }).map(e => { const pk = e.matches('[data-person]') ? e : e.querySelector('[data-person]'); return (P[pk ? pk.dataset.person : ''] || {}).cs || '?' })
})
R.boltInFamily = R.family.includes('Bolt')
R.ratchetInFamily = R.family.includes('Ratchet')
R.boltMode = m.people.filter(p => p.id === 'yeti').map(p => `${p.text} :: ${p.title}`)
R.ratchetMode = m.people.filter(p => p.id === 'torque').map(p => `${p.text} :: ${p.title}`)
await shot(page, 'EF-C18-01-mode')
await oilMode(page, false)
R.publish = await publish(page, di)
await page.waitForTimeout(900)
await shot(page, 'EF-C18-02-published')
save('published')

/* ---- 1. Show SANS OFF: who is on the grid? ----------------------------- */
R.sansOffState = await showSans(false)
R.gridSansOff = await onGrid(['yeti', 'torque', 'bane', 'allavail'])
await shot(page, 'EF-C18-03-sans-off')
R.trackerSansOff = await tracker(page, ['yeti', 'torque', 'bane'])
await closeTracker(page)
save('sans-off')

/* ---- 2. Show SANS ON: his row arrives already carrying the credit ------ */
R.sansOnState = await showSans(true)
R.gridSansOn = await onGrid(['yeti', 'torque', 'bane'])
await shot(page, 'EF-C18-04-sans-on')
R.trackerSansOn = await tracker(page, ['yeti', 'torque', 'bane'])
await shot(page, 'EF-C18-05-tracker-sans-on')
await closeTracker(page)
save('sans-on')

/* ---- 3. off again, then on again: the credit must survive -------------- */
await showSans(false)
R.gridOffAgain = await onGrid(['yeti'])
await showSans(true)
R.gridOnAgain = await onGrid(['yeti'])
R.trackerOnAgain = await tracker(page, ['yeti'])
await closeTracker(page)
save('sans-toggled')

/* ---- 4. archive a man who holds an issued credit, then restore him ----- */
await go(page, 'quals'); await page.waitForTimeout(900)
const arch = page.locator('[data-arch="bane"]:visible').first()
R.archiveDoor = await arch.count() ? 'the ✕ on his row' : 'NO ARCHIVE CONTROL'
if (await arch.count()) { await arch.click(); await page.waitForTimeout(500); if (await arch.count()) { await arch.click(); await page.waitForTimeout(800) } }
R.archivedFlag = await page.evaluate(() => !!window.PEOPLE.bane.archived)
await shot(page, 'EF-C18-06-archived')
R.gridArchived = await onGrid(['bane'])
R.trackerArchived = await tracker(page, ['bane'])
await closeTracker(page)
save('archived')

await go(page, 'quals'); await page.waitForTimeout(900)
const rest = page.locator('[data-restore="bane"]:visible').first()
R.restoreDoor = await rest.count() ? 'Restore button' : 'NO RESTORE CONTROL'
if (await rest.count()) { await rest.click(); await page.waitForTimeout(1000) }
R.restoredFlag = await page.evaluate(() => !!window.PEOPLE.bane.archived)
R.gridRestored = await onGrid(['bane'])
R.trackerRestored = await tracker(page, ['bane'])
await shot(page, 'EF-C18-07-restored')
await closeTracker(page)
R.errors = errors.slice(0, 10)
save('done')

const T = o => JSON.stringify(Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.found ? v.text.slice(0, 160) : 'no row in the tracker'])))
console.log('fills:', R.f1, R.f2, R.f3)
console.log('\nFAMILY DAY stands for ' + R.family.length + ' men. Bolt (SANS, planned 07:00-08:00) in?', R.boltInFamily, '| Ratchet (ground crew) in?', R.ratchetInFamily)
console.log('Bolt in the mode:', JSON.stringify(R.boltMode))
console.log('Ratchet in the mode:', JSON.stringify(R.ratchetMode))
console.log('publish:', JSON.stringify(R.publish))
console.log('\n== Show SANS OFF ==', JSON.stringify(R.sansOffState))
console.log('  grid:', JSON.stringify(R.gridSansOff))
console.log('  tracker:', T(R.trackerSansOff))
console.log('\n== Show SANS ON ==', JSON.stringify(R.sansOnState))
console.log('  grid:', JSON.stringify(R.gridSansOn))
console.log('  tracker:', T(R.trackerSansOn))
console.log('\n== off again then on again ==')
console.log('  off:', JSON.stringify(R.gridOffAgain), ' on:', JSON.stringify(R.gridOnAgain))
console.log('  tracker:', T(R.trackerOnAgain))
console.log('\n== archiving a man who already earned ==')
console.log('  door:', R.archiveDoor, '| archived flag now:', R.archivedFlag)
console.log('  grid:', JSON.stringify(R.gridArchived), ' tracker:', T(R.trackerArchived))
console.log('  restore door:', R.restoreDoor, '| archived flag now:', R.restoredFlag)
console.log('  grid:', JSON.stringify(R.gridRestored), ' tracker:', T(R.trackerRestored))
console.log('\nerrors', R.errors)
await browser.close()
