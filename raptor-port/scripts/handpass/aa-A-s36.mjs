// S36 — List search, sorting and export keep the placeholder's identity (admin, desktop). The export is the app's own CSV, captured into the scratch folder.
import { closeWins, world, closeAll, toInputs, fileInput, listAll, listSearch, pic, T, sleep, readInputs, setPerson } from './aa-A-lib.mjs'
import { readFileSync, mkdirSync } from 'node:fs'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/5be0e123-6cd9-4081-8796-605c27ebd4b5/scratchpad'
mkdirSync(SCR, { recursive: true })
const w = await world({ who: 'ad', size: 'd' })
const page = w.page
await toInputs(page)
await fileInput(page, { iso: '2026-07-16', type: 'Event', person: 'all', remarks: 'walkS36 rem-ALL', start: '09:00', end: '12:00' })
await fileInput(page, { iso: '2026-07-16', type: 'Event', person: 'allavail', remarks: 'walkS36 rem-ALLAVAIL', start: '09:00', end: '12:00' })
await fileInput(page, { iso: '2026-07-16', type: 'Event', person: 'dj', remarks: 'walkS36 rem-ACE', start: '09:00', end: '12:00' })
await closeWins(page)
await listAll(page)
const names = async () => page.evaluate(() => [...document.querySelectorAll('tr[data-iid]')].filter(r => /walkS36/.test(r.innerText)).map(r => r.querySelector('td').innerText.trim() + '|' + r.querySelector('[data-label="Type"]').innerText.trim() + '|' + (r.querySelector('[data-label="Remarks"]').innerText.match(/rem-\w+/) || [''])[0]))
await listSearch(page, 'walkS36')
console.log('all three, default order:', JSON.stringify(await names()))
for (const q of ['ALL AVAIL', 'ALL', 'allavail']) {
  await listSearch(page, q)
  const nm = await page.evaluate(() => [...document.querySelectorAll('tr[data-iid]')].filter(r => /walkS36/.test(r.innerText)).map(r => r.querySelector('td').innerText.trim()))
  console.log('search', JSON.stringify(q), '->', JSON.stringify(nm))
  await pic(page, `s36-1-search-${q.replace(/\W+/g, '_')}`)
}
await listSearch(page, 'walkS36')
// sorting by person (NAME) and kind (TYPE)
for (const head of ['NAME', 'TYPE', 'NAME']) {
  await page.locator('#intbl thead th').filter({ hasText: new RegExp('^' + head, 'i') }).first().click(); await sleep(400)
  console.log('sorted by', head, '->', JSON.stringify(await names()))
}
await pic(page, 's36-2-sorted')
await listSearch(page, '')
// export
const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#inExport').click()])
const f = SCR + '/aaA-142-inputs.csv'
await dl.saveAs(f)
const csv = readFileSync(f, 'utf8')
const lines = csv.split(/\r?\n/)
console.log('export file name:', dl.suggestedFilename(), '| lines', lines.length, '| header:', lines[0])
const mine = lines.filter(l => /walkS36/.test(l))
console.log('exported walkS36 rows:'); mine.forEach(l => console.log('  ', l))
console.log('any raw internal id (allavail/all as person) in the person column:', mine.some(l => /^"?(allavail|all)"?,/.test(l)))
console.log('demo ALL AVAIL row also exported:', lines.filter(l => /ALL AVAIL/.test(l)).length)
await pic(page, 's36-3-after-export')
console.log('errs', JSON.stringify(w.errs))
await closeAll()
