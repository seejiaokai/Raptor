/* [OIL-SEATS-CAN-EARN] walk — SURFACES 3: THE EXPORT.
   The plan records this as a written NO-because ("flying seats only"). Take the
   door in the running app and write down what the file ACTUALLY contains about
   placeholders and counts. If it carries a placeholder as if it were a person,
   that is a finding. */
import { readFileSync } from 'node:fs'
import { open, go, board, tap, type, shot, STATE, SHOTS } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })

/* a placeholder on a new ground row — plus the one the day already carries on
   the Common Programme — so the export has something to get wrong */
await board(page, di)
await tap(page, `[data-gradd="${di}"]`)
await type(page, `[data-bfld="gr:${di}.5.prog"]`, 'EXPORT PROBE')
await type(page, `[data-bfld="gr:${di}.5.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.5.end"]`, '10:00')
await tap(page, `[data-fill="g:${di}.5.+"]`)
await page.waitForTimeout(200)
const p = page.locator(`#sbRoster .rpuck[data-person="allavail"]:visible`).first()
if (await p.count()) { await p.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(500) }
await page.keyboard.press('Escape'); await page.waitForTimeout(250)
await page.locator('#sbClose:visible').first().click().catch(() => {}); await page.waitForTimeout(900)

await go(page, 'editsched'); await page.waitForTimeout(800)
const doors = await page.evaluate(() => [...document.querySelectorAll('#exportSched,#exportPdf,[id*=xport],[title*=Export],[aria-label*=Export]')]
  .filter(e => e.getBoundingClientRect().width > 0)
  .map(e => ({ id: e.id, title: e.getAttribute('title') })))
console.log('the export doors on the week:', JSON.stringify(doors))

const dl = page.waitForEvent('download', { timeout: 15000 })
await page.locator('#exportSched').first().click()
let file = null
try {
  const d = await dl
  file = `${SHOTS}/142-schedule.csv`
  await d.saveAs(file)
  console.log('the file the app handed over:', d.suggestedFilename())
} catch (e) { console.log('no file arrived:', String(e.message).slice(0, 90)) }
const said = await page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.textContent || '').trim() : null })
console.log('the app said:', said)
await shot(page, 'SURF-24-export-door')

if (file) {
  const txt = readFileSync(file, 'utf8')
  const lines = txt.split(/\r?\n/)
  console.log('\n===== WHAT THE EXPORTED FILE CONTAINS =====')
  console.log(' rows:', lines.length)
  console.log(' header:', lines[0].slice(0, 230))
  const hits = lines.map((l, i) => ({ i, l })).filter(x => /ALL AVAIL|allavail/i.test(x.l))
  console.log(' lines naming a placeholder:', hits.length)
  for (const h of hits.slice(0, 6)) console.log('   line', h.i, ':', h.l.slice(0, 200))
  const counts = lines.filter(l => /earn|behind this puck/i.test(l))
  console.log(' lines mentioning a count or earning:', counts.length)
  const sat = lines.filter(l => /Saturday/i.test(l))
  console.log(' Saturday lines:', sat.length)
  for (const s of sat.slice(0, 5)) console.log('   ', s.slice(0, 215))
  const probe = lines.filter(l => /EXPORT PROBE|SODB|MASS BRIEF|STORES/i.test(l))
  console.log(' lines mentioning a ground or programme row at all:', probe.length, JSON.stringify(probe.slice(0, 3)))
}

const pdfDoor = await page.locator('#exportPdf').count()
console.log('\nthe print door:', pdfDoor ? 'present' : 'absent')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
