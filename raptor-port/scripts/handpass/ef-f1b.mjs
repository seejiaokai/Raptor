/* F1b — the availability rule behind ALL AVAIL, tested on a CLEAN Sunday with
   one case per person, and a check for the sentinel's count chip on every
   surface the app draws it (Fable S33, Codex 6). */
import { open, board, tap, type, shot, oilMode, go } from './lib.mjs'
import { names, putSure, fileRequest } from './ef.mjs'

const STATE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat.json'
const di = 6
const R = {}
const { browser, page, errors } = await open({ state: STATE })
const NM = await names(page)
const { writeFileSync } = await import('node:fs')
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/ef-f1b.json'
const save = t => { R._at = t; writeFileSync(OUT, JSON.stringify(R, null, 1)) }

const modeOn = (word) => page.evaluate(w => {
  const P = window.PEOPLE
  return [...document.querySelectorAll('#schedBoard [data-oilp]')].filter(e => {
    const row = e.closest('.sb-arow, .sb-row, tr, li')
    return row && new RegExp(w, 'i').test(row.innerText || '')
  }).map(e => {
    const pk = e.matches('[data-person]') ? e : e.querySelector('[data-person]')
    return ((P[pk ? pk.dataset.person : ''] || {}).cs || '?')
  })
}, word)

await board(page, di)

/* the SDO desk that arrives on Sunday holds Dash 08:00-18:00 — leave it */
/* --- one man per case --------------------------------------------------- */
await tap(page, `[data-wvadd="${di}"]`)
await page.getByRole('button', { name: 'Flying wave', exact: true }).click()
await page.waitForTimeout(700)
const fw = await page.evaluate(i => window.DAYS[i].waves.findIndex(w => (w.kind || 'fly') === 'fly'), di)
await type(page, `[data-bfld="ff:${di}.${fw}.0.cs"]`, 'VIPER')
await type(page, `[data-bfld="ff:${di}.${fw}.0.to"]`, '10:00')
await type(page, `[data-bfld="ff:${di}.${fw}.0.ld"]`, '11:00')
R.p1 = await putSure(page, `[data-slot="${di}.${fw}.0.0.p"]`, 'bane', id => JSON.stringify(window.DAYS[6].waves).includes('"' + id + '"'))
R.p2 = await putSure(page, `[data-slot="${di}.${fw}.0.0.w"]`, 'freak', id => JSON.stringify(window.DAYS[6].waves).includes('"' + id + '"'))

await tap(page, `[data-gradd="${di}"]`); await tap(page, `[data-gradd="${di}"]`); await tap(page, `[data-gradd="${di}"]`)
await type(page, `[data-bfld="gr:${di}.0.prog"]`, 'MORNING JOB')
await type(page, `[data-bfld="gr:${di}.0.str"]`, '09:00')
await type(page, `[data-bfld="gr:${di}.0.end"]`, '11:00')
R.g1 = await putSure(page, `[data-fill="g:${di}.0.+"]`, 'stiff', id => JSON.stringify(window.DAYS[6].ground[0]).includes('"' + id + '"'))
await type(page, `[data-bfld="gr:${di}.1.prog"]`, 'MIDDAY JOB')
await type(page, `[data-bfld="gr:${di}.1.str"]`, '12:00')
await type(page, `[data-bfld="gr:${di}.1.end"]`, '13:00')
R.g2 = await putSure(page, `[data-fill="g:${di}.1.+"]`, 'slash', id => JSON.stringify(window.DAYS[6].ground[1]).includes('"' + id + '"'))
await type(page, `[data-bfld="gr:${di}.2.prog"]`, 'GROUND CREW JOB')
await type(page, `[data-bfld="gr:${di}.2.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.2.end"]`, '17:00')
R.g3 = await putSure(page, `[data-fill="g:${di}.2.+"]`, 'torque', id => JSON.stringify(window.DAYS[6].ground[2]).includes('"' + id + '"'))
save('rows')

/* --- the personal requests: ATT B, leave, a commitment that misses ------- */
R.attb = await fileRequest(page, di, { door: 'u', person: 'harpoon', type: 'ATT B', allday: true, oil: 'no' })   // Trident
R.leave = await fileRequest(page, di, { door: 'u', person: 'boosh', type: 'LL', allday: true, oil: 'no' })        // Havoc
R.od = await fileRequest(page, di, { door: 'u', person: 'krait', type: 'OD', allday: true, oil: 'yes' })          // Kraken
R.miss = await fileRequest(page, di, { door: 'g', person: 'beams', type: 'Meeting', st: '16:00', en: '17:00', allday: false, oil: 'no' }) // Comet
R.inputTypes = await page.evaluate(() => Object.values(window.INPUTS).map(i => `${i.person}|${i.type}|${i.st || ''}-${i.en || ''}|${i.iso || i.date || ''}`).slice(0, 20))
save('inputs')

/* --- the two sentinel rows ---------------------------------------------- */
await tap(page, `[data-padd="${di}"]`); await tap(page, `[data-padd="${di}"]`)
await type(page, `[data-bfld="ap:${di}.0.prog"]`, 'MUSTER A')
await type(page, `[data-bfld="ap:${di}.0.str"]`, '10:00')
await type(page, `[data-bfld="ap:${di}.0.end"]`, '14:00')
await type(page, `[data-bfld="ap:${di}.1.prog"]`, 'MUSTER B')
await type(page, `[data-bfld="ap:${di}.1.str"]`, '12:00')
await type(page, `[data-bfld="ap:${di}.1.end"]`, '13:00')
R.a1 = await putSure(page, `[data-fill="a:${di}.0.+"]`, 'allavail', id => JSON.stringify(window.DAYS[6].allhands[0]).includes('"' + id + '"'))
R.a2 = await putSure(page, `[data-fill="a:${di}.1.+"]`, 'allavail', id => JSON.stringify(window.DAYS[6].allhands[1]).includes('"' + id + '"'))
save('sentinels')

/* --- is there a count chip ANYWHERE? ------------------------------------ */
R.chipsBoard = await page.evaluate(() => ({
  oilcount: document.querySelectorAll('#schedBoard .oilcount').length,
  oilsent: document.querySelectorAll('#schedBoard [data-oilsent]').length,
  sentinelPucks: [...document.querySelectorAll('#schedBoard .puck.allavail')].filter(e => !e.closest('#sbRoster'))
    .map(e => ({ row: (e.closest('.sb-arow,.sb-row,tr,li') || {}).innerText?.replace(/\s+/g, ' ').trim().slice(0, 40),
      cls: e.className, title: e.getAttribute('title') || '',
      next: e.nextElementSibling ? e.nextElementSibling.outerHTML.slice(0, 90) : null,
      parentHtml: (e.parentElement || {}).outerHTML?.slice(0, 220) })),
}))
await shot(page, 'EF-F1B-01-two-musters')
/* and on the two week surfaces */
const x = page.locator('#sbClose:visible').first(); if (await x.count()) { await x.click(); await page.waitForTimeout(700) }
R.chipsEditWeek = await page.evaluate(() => ({ oilcount: document.querySelectorAll('#eWeek .oilcount').length, sentinels: document.querySelectorAll('#eWeek .puck.allavail').length }))
await go(page, 'viewsched'); await page.waitForTimeout(700)
R.chipsViewWeek = await page.evaluate(() => ({ oilcount: document.querySelectorAll('#vWeek .oilcount').length, sentinels: document.querySelectorAll('#vWeek .puck.allavail').length }))
await board(page, di)
save('chips')

/* --- who each sentinel stands for --------------------------------------- */
await oilMode(page, true)
R.listA = await modeOn('MUSTER A')
R.listB = await modeOn('MUSTER B')
await shot(page, 'EF-F1B-02-musters-mode')
await oilMode(page, false)
R.roster = await page.evaluate(() => Object.entries(window.PEOPLE).filter(([k, v]) => !v.special).map(([k, v]) => v.cs))
R.errors = errors.slice(0, 10)
save('done')

const inA = n => R.listA.includes(n) ? 'IN ' : 'out'
const inB = n => R.listB.includes(n) ? 'IN ' : 'out'
console.log('fills:', R.p1, R.p2, R.g1, R.g2, R.g3, R.a1, R.a2)
console.log('requests:', JSON.stringify({ attb: R.attb, leave: R.leave, od: R.od, miss: R.miss }))
console.log('inputs now:', JSON.stringify(R.inputTypes))
console.log('\ncount chips — board:', JSON.stringify(R.chipsBoard.oilcount), 'edit week:', JSON.stringify(R.chipsEditWeek), 'view week:', JSON.stringify(R.chipsViewWeek))
console.log('sentinel pucks on the board:', JSON.stringify(R.chipsBoard.sentinelPucks, null, 1))
console.log('\nMUSTER A 10:00-14:00 holds ' + R.listA.length + ':', R.listA.join(' '))
console.log('\nMUSTER B 12:00-13:00 holds ' + R.listB.length + ':', R.listB.join(' '))
console.log('\ncase by case            A(10-14)  B(12-13)')
const cases = [['Ranger  VIPER 10:00-11:00 (working day 07:00-13:00)', 'Ranger'],
  ['Echo    VIPER back-seat', 'Echo'],
  ['Saber   MORNING JOB 09:00-11:00', 'Saber'],
  ['Blade   MIDDAY JOB 12:00-13:00', 'Blade'],
  ['Ratchet ground crew, named 08:00-17:00', 'Ratchet'],
  ['Dash    SDO desk 08:00-18:00', 'Dash'],
  ['Trident ATT B all day (may still work)', 'Trident'],
  ['Havoc   on leave all day', 'Havoc'],
  ['Comet   Meeting 16:00-17:00 (misses both)', 'Comet'],
  ['Kraken  overseas duty all day', 'Kraken'],
  ['Bolt    SANS, not planned', 'Bolt']]
cases.forEach(([lbl, n]) => console.log('  ' + lbl.padEnd(52) + inA(n) + '     ' + inB(n)))
console.log('\nin B but not in A:', R.listB.filter(n => !R.listA.includes(n)).join(' '))
console.log('in A but not in B:', R.listA.filter(n => !R.listB.includes(n)).join(' '))
console.log('errors', R.errors)
await browser.close()
