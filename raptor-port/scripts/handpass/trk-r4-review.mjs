/* [HUMAN-RETEST] Tracker — re-walk of what the two code reads' fixes touched
   (23 Sep 26), through the app's own controls on the rebuilt preview.

   Fable F-A / Astra #1  a deleted built-in's typed details ride the whole backup;
                         ↺ Restore after the wipe brings them back (D127)
   Fable F-G / Astra #2  a ball switched between flight and lecture re-settles
                         Last Flown (D123)
   Fable F-B             the raw event list refuses a deleted-but-unsaved code
   Fable F-C             a built-in imported "as new" keeps its own wording
   Fable F-D             Logout reached by KEYBOARD mid-import waits for the answer
   Fable F-E             a half-typed year when DCO is pressed dates the flight today */
import { open, shot, save, log, dlg, reveal, login, toTracker, DESK } from './trk-lib.mjs'
import { sleep, ball, menu, pickSyl, sylLabels, arrangeOn, arrangeOff, tool, saveLit, dlgUp, dlgText,
  exportVia, importVia, tmp, showAllRow, showAllEdit } from './trk-w1-lib.mjs'
import { typeDate, currency, tapBall } from './trk-w2-lib.mjs'

const L = log()
const FILE = tmp('r4-all.json'), TXFILE = tmp('r4-tx.json')
const ls = async page => (await currency(page)).lastSyll
const grade = async (page, id, iso, g = 'DCO') => {
  await tapBall(page, id); if (iso) await typeDate(page, '#popDoneDate', iso)
  await page.locator('#pop button', { hasText: new RegExp('^\\s*' + g + '\\s*$') }).first().click(); await sleep(350)
}

/* ================= World A ================= */
const A = await open({ size: DESK, who: 'a' }); const pa = A.page
/* F-A: type a detail on 2024, delete 2024, export everything */
await pickSyl(pa, '2024'); await showAllEdit(pa, 'ST-01', { Name: 'DEL24 R4' })
await menu(pa, 'syl', 'delSyl'); await dlg(pa, {}); await sleep(900)
const all = await exportVia(pa, { tick: 'all', file: FILE })
L.ok('F-A: the whole backup carries the deleted 2024\'s typed details', JSON.stringify(((all.json.charts.eventInfoBySyl || {}).sb2024 || {})['ST-01'] || {}).includes('DEL24 R4'), JSON.stringify((all.json.charts.eventInfoBySyl || {}).sb2024 || null).slice(0, 120))
/* F-C: a Tx-only file for the "as new" import */
await pickSyl(pa, 'Tx 2026')
const txCrew = (await showAllRow(pa, 'BFM-3')).match(/Crew: (.+?) Prerequisites:/)
await exportVia(pa, { tick: 'as-opened', file: TXFILE })

/* F-G */
await pickSyl(pa, '2026')
await grade(pa, 'TR-2', '2026-09-20'); await grade(pa, 'TR-3', '2026-09-25')
const lf0 = await ls(pa)
await arrangeOn(pa); await tool(pa, 'Text'); await reveal(pa, 'TR-3'); await ball(pa, 'TR-3').click(); await sleep(400)
await pa.selectOption('#edType', 'acad'); await pa.click('#edSave'); await sleep(300)
await tool(pa, 'Move'); await arrangeOff(pa)
await pa.click('#saveChanges'); await sleep(700)
const lf1 = await ls(pa)
await shot(pa, 'r4-g-lastflown-after-type-change')
L.ok('F-G: TR-3 switched to a lecture pulls Last Flown back to 20/09', lf0 === '2026-09-25' && lf1 === '2026-09-20', `${lf0} → ${lf1}`)

/* F-B */
await grade(pa, 'ACG-04', null)
await arrangeOn(pa); await tool(pa, '🗑 Delete'); await reveal(pa, 'ACG-04'); await ball(pa, 'ACG-04').click(); await sleep(300)
await dlg(pa, {}); await tool(pa, 'Move')
await pa.click('#editSyl'); await pa.waitForSelector('#sylText')
const txt = JSON.parse(await pa.inputValue('#sylText')); txt.push({ id: 'ACG-04', type: 'acad' })
await pa.fill('#sylText', JSON.stringify(txt)); await pa.click('#sylSave'); await sleep(400)
const refused = (await pa.locator('#sylErr').innerText().catch(() => '')).trim()
await shot(pa, 'r4-b-list-refuses-deleted-code')
L.ok('F-B: the event list refuses the deleted-but-unsaved code', /not saved yet/.test(refused), refused)
await pa.click('#sylCancel'); await sleep(200)
await pa.click('#trUndoBtn'); await sleep(500)                     /* bring ACG-04 back */
await arrangeOff(pa); if (await saveLit(pa)) { await pa.click('#saveChanges'); await sleep(600) }

/* F-E */
await tapBall(pa, 'TR-4')
await pa.locator('#popDoneDate').click({ position: { x: 12, y: 12 } }); await sleep(100)   /* the day part… */
await pa.keyboard.press('ArrowRight'); await pa.keyboard.press('ArrowRight'); await sleep(100)   /* …then the year */
await pa.keyboard.type('2', { delay: 40 }); await sleep(200)
const half = await pa.inputValue('#popDoneDate')
await pa.locator('#pop button', { hasText: /^\s*DCO\s*$/ }).first().click(); await sleep(400)
await tapBall(pa, 'TR-4'); const dated = await pa.inputValue('#popDoneDate'); await pa.keyboard.press('Escape')
L.ok('F-E: DCO pressed with the year half-typed is dated a real day', /^20\d\d-/.test(dated), `box read "${half}" when DCO was pressed; the mark is dated ${dated}`)
await A.browser.close()

/* ================= World B — the wiped app ================= */
const B = await open({ size: DESK, who: 'a' }); const pb = B.page
/* F-D first: mid-import, reach Logout by KEYBOARD */
await pb.evaluate(() => { try { delete window.showOpenFilePicker } catch (_) {} window.showOpenFilePicker = undefined })
await pb.click('#fileMenuBtn'); await pb.waitForSelector('#importFileBtn', { state: 'visible' })
const [chooser] = await Promise.all([pb.waitForEvent('filechooser'), pb.click('#importFileBtn')])
await chooser.setFiles(FILE)
await dlgUp(pb, 8000); const q1 = await dlgText(pb)
await pb.evaluate(() => document.getElementById('logout').focus()); await pb.keyboard.press('Enter'); await sleep(800)
const stillIn = await pb.locator('#luser').count() === 0
const sameQ = (await dlgUp(pb, 500)) ? await dlgText(pb) : '(no question)'
await shot(pb, 'r4-d-logout-mid-import-waits')
L.ok('F-D: Logout by keyboard mid-import keeps the session and the question', stillIn && sameQ === q1, `before "${q1.slice(0, 60)}" after "${sameQ.slice(0, 60)}"; signed in ${stillIn}`)
/* answer the rest of the import: Replace everything */
for (let i = 0; i < 20; i++) {
  if (!(await dlgUp(pb, 3000))) break
  const m = await dlgText(pb); await pb.click('#dlgOk'); await sleep(450)
  if (/^Brought in|^Nothing was brought/.test(m)) break
}
L.ok('F-A: 2024 stays deleted after the import', !(await sylLabels(pb)).some(s => s.startsWith('2024')))
await menu(pb, 'syl', 'ordSyl'); await pb.waitForSelector('#ordModal')
await pb.locator('#ordHidden .ordrow').filter({ has: pb.locator('.onm', { hasText: '2024' }) }).locator('button').click(); await sleep(400)
await pb.click('#ordSave'); await sleep(500)
await pickSyl(pb, '2024')
const st01 = await showAllRow(pb, 'ST-01', { close: false }); await shot(pb, 'r4-a-restored-2024-details'); await pb.click('#saClose')
L.ok('F-A: ↺ Restore after the wipe brings back what was typed on it', /DEL24 R4/.test(st01), st01)
/* F-C: the Tx file brought in "as new" */
await importVia(pb, TXFILE, (msg, i, page) => (/already exists/.test(msg) ? 'alt' : 'ok'))
if (await dlgUp(pb, 1500)) { /* importVia answered the name prompt with OK and the offered name */ }
const labels = await sylLabels(pb)
const copy = labels.find(s => /Tx 2026 \(new\)/.test(s))
if (copy) await pickSyl(pb, copy.replace(/ ✎$/, ''))
const copyCrew = await showAllRow(pb, 'BFM-3')
L.ok('F-C: the "as new" copy keeps Tx\'s own crew wording', !!copy && txCrew && copyCrew.includes(txCrew[1].trim()), `copy "${copy}"; Tx crew "${txCrew && txCrew[1]}"; copy row: ${copyCrew.slice(0, 140)}`)
await shot(pb, 'r4-c-as-new-keeps-tx-wording')

save('r4-review', { rows: L.rows, errorsA: A.errors, errorsB: B.errors })
console.log(`errors A ${A.errors.length}: ${A.errors.slice(0, 4).join(' | ')}`)
console.log(`errors B ${B.errors.length}: ${B.errors.slice(0, 4).join(' | ')}`)
await B.browser.close()
