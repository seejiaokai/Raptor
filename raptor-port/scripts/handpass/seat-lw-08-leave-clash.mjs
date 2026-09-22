/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 6: the clash.
   One of the crowd behind the placeholder files LEAVE for the Saturday that
   has already gone out. D44 promises the issued day keeps paying the men it
   went out with; D44's mark promises the day then reads as having something
   pending. This drives the squadron's own door for an absence — the
   Unavailable panel's "+ Add", which is where leave, medical and overseas
   duty are filed (the Ground "+ Inputs" door offers ground types only). */
import { open, board, tap, shot, go, closeBoard } from './lib.mjs'
import { toast } from './seat-lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const SAT = 5
const WHO = 'shaft'   // Anvil IP — in the SAT DESK crowd, nothing else on that day
const { browser, page, errors } = await open({ state: OUT + '/state-lw-published.json' })

await board(page, SAT)
await tap(page, `[data-inpadd="${SAT}.u"]`)
await page.waitForTimeout(800)
const dlg = await page.evaluate(() => {
  const e = document.querySelector('#inpEditPop')
  if (!e || e.hidden) return 'DIALOG NOT OPEN'
  return { title: (document.querySelector('#inpEditTitle') || {}).innerText || '',
    text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 320),
    person: (() => { const s = e.querySelector('#inpEditPerson'); return s ? { val: s.value, n: s.options.length } : null })(),
    type: (() => { const s = e.querySelector('#inpEditType'); return s ? { val: s.value, opts: [...s.options].map(o => o.value) } : null })(),
    buttons: [...e.querySelectorAll('button')].map(b => (b.innerText || '').trim()).filter(Boolean) }
})
console.log('THE UNAVAILABLE DIALOG as it opens:', JSON.stringify(dlg).slice(0, 260))
await shot(page, 'LW-14-unavailable-dialog')

/* Leave (LL), all day, for one man inside the placeholder's crowd, on the
   Saturday that has already gone out. */
await page.selectOption('#inpEditPerson', WHO)
await page.waitForTimeout(300)
await page.selectOption('#inpEditType', 'LL')
await page.waitForTimeout(300)
const beforeSave = await page.evaluate(() => (document.querySelector('#inpEditPop') || {}).innerText.replace(/\s+/g, ' ').slice(0, 300))
console.log('the dialog now reads:', beforeSave)
await shot(page, 'LW-15-leave-filled-in')
await page.click('#inpEditSave')
await page.waitForTimeout(1200)
console.log('the app said:', await toast(page))
const stillOpen = await page.evaluate(() => { const e = document.querySelector('#inpEditPop'); return e && !e.hidden ? (e.innerText || '').replace(/\s+/g, ' ').slice(0, 400) : null })
console.log('dialog still open?', stillOpen ? 'YES — ' + stillOpen : 'no, it closed')
/* a refusal or a confirm sheet may be sitting on top */
const sheets = await page.evaluate(() => [...document.querySelectorAll('.sheet, .airpop, [role=dialog]')]
  .filter(e => e.offsetParent !== null && !e.hidden).map(e => ({ id: e.id, cls: e.className.slice(0, 40), t: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 260) })))
console.log('what is on screen now:', JSON.stringify(sheets, null, 1).slice(0, 1200))
await shot(page, 'LW-16-after-save')

const filed = await page.evaluate(w => (window.INPUTS || []).filter(i => i.person === w)
  .map(i => ({ type: i.type, date: i.date, endDate: i.endDate, acc: i.acc, allday: i.allday, rmk: (i.remarks || '').slice(0, 50) })), WHO)
console.log('what the app now holds for this man:', JSON.stringify(filed))

const day = await page.evaluate(i => ({ chip: (document.querySelector('#schedBoard .verchip') || {}).innerText || '',
  sign: (document.querySelector('#sbSignBar .so-state') || {}).innerText || '',
  alBtn: (() => { const b = document.querySelector(`#sbSignBar [data-alpub="${i}"]`); return b ? b.innerText.trim() + (b.disabled ? ' (locked)' : '') : null })() }), SAT)
console.log('the published day now reads:', JSON.stringify(day))
await shot(page, 'LW-17-day-after-leave-filed')
await closeBoard(page)

await go(page, 'leavewar')
await page.waitForTimeout(2000)
const cell = await page.evaluate(w => {
  const c = document.querySelector(`[data-testid="cell-${w}-2026-07-18"]`)
  const row = document.querySelector(`[data-testid="row-${w}"]`)
  return { cell: c ? { txt: (c.innerText || '').replace(/\s+/g, ' ').trim(), cls: c.className.slice(0, 80), title: (c.getAttribute('title') || '').slice(0, 120) } : 'NO CELL',
    neighbours: row ? [...row.querySelectorAll('td')].slice(0, 4).map(t => (t.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30)) : null }
}, WHO)
console.log('\nHIS LEAVE WAR CELL on 18 Jul:', JSON.stringify(cell))
await shot(page, 'LW-18-war-cell-with-leave')

/* the day list — the war's own strip for a date holding more than one record */
await page.evaluate(w => { const c = document.querySelector(`[data-testid="cell-${w}-2026-07-18"]`); if (c) c.click() }, WHO)
await page.waitForTimeout(1000)
const opened = await page.evaluate(() => [...document.querySelectorAll('.sheet, [role=dialog], .lw-sheet')]
  .filter(e => e.offsetParent !== null).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 500)))
console.log('tapping that cell opens:', JSON.stringify(opened, null, 1).slice(0, 1200))
await shot(page, 'LW-19-cell-tapped')
await page.keyboard.press('Escape'); await page.waitForTimeout(500)

await page.click('[data-testid="oil-tracker"]')
await page.waitForTimeout(1400)
const mine = await page.evaluate(w => {
  const r = document.querySelector(`[data-oilrow="${w}"]`)
  if (!r) return 'NO ROW'
  const b = r.querySelector(`[data-testid="oil-bal-${w}"]`)
  return { bal: b ? b.textContent.trim() : null,
    ents: [...r.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) }
}, WHO)
console.log('HIS OIL FIGURE after filing leave:', JSON.stringify(mine))
await shot(page, 'LW-20-oil-after-leave')
console.log('\nerrors:', errors.slice(0, 8))
await page.context().storageState({ path: OUT + '/state-lw-leave.json' })
await browser.close()
