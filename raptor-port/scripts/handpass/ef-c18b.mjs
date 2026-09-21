/* C18, part 2 — archiving a man who already holds an ISSUED credit, and
   restoring him. The everything-Saturday, published. Fable holds the SDO desk
   08:00-18:00, so he is issued a full day. */
import { open, board, shot, publish, go } from './lib.mjs'
import { tracker, closeTracker, closeSheets, leaveWar, SAT } from './ef.mjs'
const STATE='C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat.json'
const R={}, WHO='plasma'
const { browser, page, errors } = await open({ state: STATE })
const grid = async () => { await leaveWar(page); await closeSheets(page); return page.evaluate(id=>{
  const row=document.querySelector(`[data-testid="row-${id}"]`), cell=document.querySelector(`[data-testid="cell-${id}-2026-07-18"]`)
  return { row: !!row, cell: cell?(cell.innerText||'').trim():'NO CELL' } }, WHO) }
const trk = async () => { const t=await tracker(page,[WHO]); await closeTracker(page); return t[WHO].found?t[WHO].text.slice(0,180):'no row in the tracker' }

await board(page,5)
R.publish = await publish(page,5)
await page.waitForTimeout(800)
R.before = await grid(); R.trkBefore = await trk()

await go(page,'quals'); await page.waitForTimeout(900)
await page.locator('#qViewA:visible').first().click(); await page.waitForTimeout(700)
R.archBefore = await page.locator('[data-arch]').count()
const ed = page.locator('#qEdit:visible').first()
R.editBtn = await ed.count() ? (await ed.innerText()).trim() : 'NO EDIT BUTTON'
if (await ed.count()) { await ed.click(); await page.waitForTimeout(800) }
R.archAfter = await page.locator('[data-arch]').count()
const a = page.locator(`[data-arch="${WHO}"]:visible`).first()
R.door = await a.count() ? 'the ✕ on his row (only after Enable editing)' : 'STILL NO ARCHIVE CONTROL'
if (await a.count()) { await a.click(); await page.waitForTimeout(600)
  const c = page.getByRole('button', { name: /Archive|Yes|Confirm|OK/ }).first()
  if (await c.count() && await c.isVisible()) { await c.click(); await page.waitForTimeout(800) }
  if (await page.locator(`[data-arch="${WHO}"]:visible`).count()) { await page.locator(`[data-arch="${WHO}"]:visible`).first().click(); await page.waitForTimeout(800) } }
R.archivedFlag = await page.evaluate(id=>!!window.PEOPLE[id].archived, WHO)
await shot(page,'EF-C18B-01-archived')
R.afterArchive = await grid(); R.trkAfter = await trk()

await go(page,'quals'); await page.waitForTimeout(900)
await page.locator('#qViewA:visible').first().click(); await page.waitForTimeout(700)
R.restoreList = await page.evaluate(() => [...document.querySelectorAll('#page-quals p, #page-quals .note, #page-quals h3, #page-quals button')].map(e=>(e.innerText||'').trim()).filter(t=>/archiv|posted out|restore/i.test(t)).slice(0,8))

const more = page.locator('button').filter({ hasText: /Posted out|archived|Show archived/i }).first()
if (await more.count()) { await more.click(); await page.waitForTimeout(700) }
const r = page.locator(`[data-restore="${WHO}"]`).first()
R.restoreDoor = await r.count() ? 'Restore button in the posted-out list' : 'NO RESTORE CONTROL'
if (await r.count()) { await r.scrollIntoViewIfNeeded(); await r.click(); await page.waitForTimeout(1000) }
R.restoredFlag = await page.evaluate(id=>!!window.PEOPLE[id].archived, WHO)
await shot(page,'EF-C18B-02-restored')
R.afterRestore = await grid(); R.trkRestore = await trk()
R.errors = errors.slice(0,8)
const { writeFileSync } = await import('node:fs')
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/ef-c18b.json', JSON.stringify(R,null,1))
console.log('publish:',JSON.stringify(R.publish))
console.log('before archive  grid:',JSON.stringify(R.before),' tracker:',R.trkBefore)
console.log('archive ✕ before Enable editing:',R.archBefore,' after:',R.archAfter,' | edit button:',R.editBtn)
console.log('door:',R.door,' archived flag:',R.archivedFlag)
console.log('after archive   grid:',JSON.stringify(R.afterArchive),' tracker:',R.trkAfter)
console.log('restore list says:',JSON.stringify(R.restoreList))
console.log('restore door:',R.restoreDoor,' archived flag:',R.restoredFlag)
console.log('after restore   grid:',JSON.stringify(R.afterRestore),' tracker:',R.trkRestore)
console.log('errors',R.errors)
await browser.close()
