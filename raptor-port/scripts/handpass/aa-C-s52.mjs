// S52 - printing and exporting do not silently substitute the working face (desktop, admin)
const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go, fileInput, pubSat, closeBoard, editWeek, face, fs, cr, crS, signDay, pidOf, changeEnd, openSaved, closeWins, inputsPage } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const SAT = '2026-07-18'
const w = await world(); const { page } = w
const ranger = await pidOf(page, 'Ranger'), saber = await pidOf(page, 'Saber')
// the flying line: Friday (day 4) has flying; Saturday carries the two inputs
await fileInput(page, { iso: SAT, kind: 'Event', person: ranger, s: '10:00', e: '12:00', rmk: 'S52 named event', oil: 'yes' })
await fileInput(page, { iso: SAT, kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: 'S52 placeholder duty', oil: 'yes' })
// issue Friday (flying) and Saturday
await go(page, 'editsched'); say('1 publish Fri', await pubSat(page, 4)); await closeBoard(page)
await go(page, 'editsched'); say('1 publish Sat', await pubSat(page, 5)); await closeBoard(page)
say('1 faces', [fs(await face(page, 4)), fs(await face(page, 5))])
// change the working copy after issue: the named Event's time and person, the placeholder's remark
await changeEnd(page, SAT, 'S52 named event', '13:00', 'yes')
await openSaved(page, SAT, 'S52 named event'); await page.fill('#inpEditRmk', 'S52 named event EDITED'); await page.locator('#inpEditSave').click(); await sleep(500); await closeWins(page)
await openSaved(page, SAT, 'S52 placeholder duty'); await page.fill('#inpEditRmk', 'S52 placeholder duty EDITED'); await page.locator('#inpEditSave').click(); await sleep(500); await closeWins(page)
await go(page, 'editsched'); say('2 Sat face (pending expected)', fs(await face(page, 5)))
// schedule export (CSV)
await go(page, 'editsched'); await sleep(500)
const dl = async (sel) => { const [d] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), page.locator(sel).click()]); if (!d) return null
  const chunks = []; for await (const c of await d.createReadStream()) chunks.push(c); return { name: d.suggestedFilename(), text: Buffer.concat(chunks).toString('utf8') } }
const csv = await dl('#exportSched')
say('3 schedule CSV file', csv ? { name: csv.name, bytes: csv.text.length } : 'no download')
if (csv) {
  const lines = csv.text.split(/\r?\n/)
  say('3 CSV lines mentioning Event / ALL AVAIL / S52 / flying wave', lines.filter(l => /S52|ALL AVAIL|Event|EVENT/i.test(l)).slice(0, 12))
  say('3 CSV first lines', lines.slice(0, 6)); say('3 CSV line count', lines.length)
}
// print/PDF
await go(page, 'editsched'); await sleep(300)
await page.locator('#exportPdf').click(); await sleep(1200)
const pr = await page.evaluate(() => { const f = [...document.querySelectorAll('iframe')].filter(x => x.contentDocument); const d = f.length ? f[f.length - 1].contentDocument : null
  return d ? { n: f.length, len: d.body.innerText.length, hits: d.body.innerText.split('\n').filter(l => /S52|ALL AVAIL|EVENT|Event/i.test(l)).slice(0, 10), head: d.body.innerText.slice(0, 300).replace(/\s+/g, ' ') } : { n: 0 } })
say('4 print iframe', pr)
// inputs list export
await inputsPage(page); await page.locator('#inListBtn').click(); await sleep(500)
const inCsv = await dl('#inExport')
say('5 list export', inCsv ? { name: inCsv.name } : 'no download')
if (inCsv) { const L = inCsv.text.split(/\r?\n/); say('5 header', L[0]); say('5 rows mentioning S52', L.filter(l => /S52/.test(l))) }
await shot(page, 'S52-01-list')
await go(page, 'editsched'); await shot(page, 'S52-02-week')
say('errors', w.errors); await w.browser.close()
