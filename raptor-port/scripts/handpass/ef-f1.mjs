/* F1 — WHO "ALL AVAIL" ACTUALLY STANDS FOR   (Fable S33, Codex 6)
   The everything-Saturday. FAMILY DAY 10:00-14:00 carries the ALL AVAIL puck.
   Does the count chip's list match the people the mode opens? Does plain ALL
   give the same list? Do two sentinel rows on one day empty each other? */
import { open, board, tap, type, put, shot, oilMode } from './lib.mjs'
import { modeRead, names, putSure, SAT } from './ef.mjs'

const STATE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat.json'
const di = 5
const R = {}
const { browser, page, errors } = await open({ state: STATE })
const NM = await names(page)
const { writeFileSync } = await import('node:fs')
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/ef-f1.json'
const save = t => { R._at = t; writeFileSync(OUT, JSON.stringify(R, null, 1)) }

/** every sentinel puck on the board with the count chip beside it */
const chips = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck.allavail')]
  .filter(e => !e.closest('#sbRoster'))
  .map(e => {
    const seat = e.closest('.seat') || e.parentElement
    const chip = seat && seat.querySelector('.oilcount')
    const row = e.closest('.sb-arow, .sb-row, tr, li')
    return {
      name: (e.innerText || '').trim(),
      row: row ? (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 46) : '',
      puckCls: e.className,
      puckTitle: e.getAttribute('title') || '',
      chip: chip ? { text: (chip.innerText || '').trim(), cls: chip.className, title: chip.getAttribute('title') || '', sent: chip.dataset.oilsent } : 'NO COUNT CHIP',
    }
  }))

/** tap a sentinel's count chip and read the list it puts on screen */
async function chipList(nth = 0) {
  const c = page.locator('#schedBoard .oilcount:visible').nth(nth)
  if (!(await c.count())) return 'NO CHIP TO TAP'
  await c.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(150)
  await c.click()
  await page.waitForTimeout(700)
  return page.evaluate(() => {
    const t = document.getElementById('toastEl')
    return t ? (t.innerText || '').replace(/\s+/g, ' ').trim() : 'NO LIST SHOWN'
  })
}

/** the real pucks the mode opens on a given programme row */
const modeOn = (rowWord) => page.evaluate(w => {
  const P = window.PEOPLE
  return [...document.querySelectorAll('#schedBoard [data-oilp]')].filter(e => {
    const row = e.closest('.sb-arow, .sb-row, tr, li')
    return row && new RegExp(w, 'i').test(row.innerText || '')
  }).map(e => {
    const pk = e.matches('[data-person]') ? e : e.querySelector('[data-person]')
    const id = pk ? pk.dataset.person : ''
    return ((P[id] || {}).cs || id) + '|' + (e.innerText || '').replace(/\s+/g, ' ').trim()
  })
}, rowWord)

await board(page, di)

/* ---- 1. the chip, its list, and the mode's own expansion --------------- */
R.chips = await chips()
R.chipList = await chipList(0)
await shot(page, 'EF-F1-01-familyday-chip-list')
await oilMode(page, true)
R.modeFamily = await modeOn('FAMILY DAY')
R.sentinelGoneInMode = await page.evaluate(() => !document.querySelector('#schedBoard .puck.allavail:not(#sbRoster *)'))
await shot(page, 'EF-F1-02-familyday-mode')
await oilMode(page, false)
save('chip-vs-mode')

/* ---- 2. swap ALL AVAIL for plain ALL on the same row ------------------- */
R.swapOff = await page.evaluate(() => {
  const pk = [...document.querySelectorAll('#schedBoard .puck.allavail')].find(e => {
    const row = e.closest('.sb-arow, .sb-row, tr, li'); return row && /FAMILY DAY/i.test(row.innerText || '')
  })
  if (!pk) return 'NOT FOUND'
  const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
  pk.dispatchEvent(ev)
  return 'right-clicked'
})
await page.waitForTimeout(600)
R.familyWhoAfterRemove = await page.evaluate(() => JSON.stringify(window.DAYS[5].allhands[0]))
R.putAll = await putSure(page, `[data-fill="a:${di}.0.+"]`, 'all', id => JSON.stringify(window.DAYS[5].allhands[0]).includes('"' + id + '"'))
R.familyWho = await page.evaluate(() => JSON.stringify(window.DAYS[5].allhands[0]))
R.chipsALL = await chips()
R.chipListALL = await chipList(0)
await shot(page, 'EF-F1-03-all-chip-list')
await oilMode(page, true)
R.modeFamilyALL = await modeOn('FAMILY DAY')
await oilMode(page, false)
save('all-vs-allavail')

/* ---- 3. a SECOND sentinel row on the same day -------------------------- */
await tap(page, `[data-padd="${di}"]`)
await page.waitForTimeout(400)
const pr = await page.evaluate(() => window.DAYS[5].allhands.length - 1)
await type(page, `[data-bfld="ap:${di}.${pr}.prog"]`, 'SECOND MUSTER')
await type(page, `[data-bfld="ap:${di}.${pr}.str"]`, '12:00')
await type(page, `[data-bfld="ap:${di}.${pr}.end"]`, '13:00')
R.put2 = await putSure(page, `[data-fill="a:${di}.${pr}.+"]`, 'allavail', id => JSON.stringify(window.DAYS[5].allhands[window.DAYS[5].allhands.length - 1]).includes('"' + id + '"'))
R.chipsTwo = await chips()
R.listRow1 = await chipList(0)
R.listRow2 = await chipList(1)
await shot(page, 'EF-F1-04-two-sentinels')
await oilMode(page, true)
R.modeRow1 = await modeOn('FAMILY DAY')
R.modeRow2 = await modeOn('SECOND MUSTER')
await shot(page, 'EF-F1-05-two-sentinels-mode')
await oilMode(page, false)
R.errors = errors.slice(0, 10)
save('done')

const list = s => String(s).replace(/^[^:]*:\s*/, '').split(/[,·]\s*/).map(x => x.trim()).filter(Boolean)
console.log('== 1. the FAMILY DAY sentinel, outside the mode ==')
console.log(JSON.stringify(R.chips, null, 1))
console.log('\n-- the list its chip shows:\n  ' + R.chipList)
console.log('\n-- the pucks the mode opens on that row (' + R.modeFamily.length + '):\n  ' + R.modeFamily.join('  '))
console.log('\n== 2. plain ALL on the same row ==')
console.log('  after taking the sentinel off:', R.familyWhoAfterRemove)
console.log('  put ALL:', R.putAll, '->', R.familyWho)
console.log(JSON.stringify(R.chipsALL, null, 1))
console.log('\n-- the list ALL shows:\n  ' + R.chipListALL)
console.log('\n-- the pucks the mode opens (' + R.modeFamilyALL.length + '):\n  ' + R.modeFamilyALL.join('  '))
console.log('\n== 3. two sentinel rows on one day ==')
console.log(JSON.stringify(R.chipsTwo, null, 1))
console.log('\n-- FAMILY DAY list:\n  ' + R.listRow1)
console.log('\n-- SECOND MUSTER list:\n  ' + R.listRow2)
console.log('\n-- mode, row 1 (' + R.modeRow1.length + '): ' + R.modeRow1.join('  '))
console.log('\n-- mode, row 2 (' + R.modeRow2.length + '): ' + R.modeRow2.join('  '))
console.log('\nerrors', R.errors)
await browser.close()
