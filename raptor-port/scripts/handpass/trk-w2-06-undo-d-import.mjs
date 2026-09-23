/* [HUMAN-RETEST] Tracker — walker w2, walk 6d: ↶ after an EXPORT and after
   an IMPORT (R110), desktop, admin.

   The OS pickers cannot be driven, so (as the brief says) the two picker
   functions are removed first and the app takes its other real path: Export
   downloads, Import opens a file input. The exported file goes to the
   driver's TMP folder, never the repo. */
import { resolve } from 'node:path'
import { open, shot, save, log, dlg, TMP, DESK } from './trk-lib.mjs'
import { sleep, tapBall, undoState, wedges } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
await page.evaluate(() => { window.showSaveFilePicker = undefined; window.showOpenFilePicker = undefined })
await tapBall(page, 'ST-01'); await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(500)
const u0 = await undoState(page)
/* Export (charts only, the current chart — the defaults) */
await page.click('#fileMenuBtn'); await page.waitForSelector('#exportBtn', { state: 'visible' }); await page.click('#exportBtn'); await sleep(350)
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#copyOk')])
const file = resolve(TMP, 'w2-export-' + Date.now() + '.json'); await dl.saveAs(file)
const ex = await dlg(page, { ok: true }).catch(() => ({ text: '(no message)' }))
const u1 = await undoState(page)
L.ok('1. an Export changes nothing, so ↶ still offers the mark', !u1.undo.off && u1.undo.t === u0.undo.t, JSON.stringify({ before: u0.undo.t, after: u1.undo.t, said: ex.text.replace(/\s+/g, ' ').slice(0, 120) }))
/* Import it back */
await page.click('#fileMenuBtn'); await page.waitForSelector('#importFileBtn', { state: 'visible' })
const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('#importFileBtn')])
await fc.setFiles(file); await sleep(700)
const q = await page.locator('#dlgMsg').innerText().catch(() => '(no question)')
await shot(page, 'w2-08-import-question')
if (await page.locator('#dlgModal').isVisible().catch(() => false)) await page.locator('#dlgModal button', { hasText: 'Replace it' }).click()
await sleep(900)
const fin = await dlg(page, { ok: true }).catch(() => ({ text: '(no closing message)' }))
const u2 = await undoState(page)
L.ok('2. after an Import, ↶ and ↷ are greyed (R110)', u2.undo.off && u2.redo.off, JSON.stringify({ asked: q.replace(/\s+/g, ' '), closing: fin.text.replace(/\s+/g, ' '), undo: u2 }))
L.ok('3. the charts-only Import left the mark alone', (await wedges(page, 'ST-01'))[0] === '#000000', JSON.stringify(await wedges(page, 'ST-01')))
await shot(page, 'w2-08-after-import-greyed')
save('w2-06-undo-d-import', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
