/* [HUMAN-RETEST] Tracker — walk 3: the round trip, second pass (D120).

   Walk 1 proved balls, lines and event details survive export → wipe → import.
   This pass takes the three things walk 1 could not see:
     A. the ORDER he puts his charts in (Syllabus ✎ → Reorder) — does it survive?
     B. FONTS — walk 1's font reading was blind (the size rides a style, not an
        attribute); read it properly and prove it survives;
     C. the chart editor's own ball box on the SHORT course (Tx), changing only
        a ball's text — does the long chart's same event change underneath?
        (Astra #4; the ⓘ details window was fixed for this, the ball box not.)
   Everything through the app's own controls; downloads/file-input for the file
   (see walk 1's harness note). */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { open, shot, save, core, dlg, log, reveal, DESK, OUT } from './trk-lib.mjs'

const L = log()
const FILE = resolve(OUT, 'roundtrip2-export.json')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ball = (page, id) => page.locator(`#flowSvg .ball[data-id="${id}"]`).first()
async function menu(page, which, item) {
  await page.click(`#${which}MenuBtn`)
  await page.waitForSelector(`#${item}`, { state: 'visible', timeout: 4000 })
  await page.click(`#${item}`); await sleep(250)
}
const sylOptions = page => page.evaluate(() => [...document.querySelectorAll('#sylSel option')].map(o => ({ id: o.value, label: o.textContent })))
async function pickSyl(page, re) {
  const o = (await sylOptions(page)).find(x => re.test(x.label)); if (!o) throw new Error('no chart ' + re)
  await page.selectOption('#sylSel', o.id); await sleep(700); return o
}
const fonts = page => page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball .core text')].map(t => t.style.fontSize))
/* the Details-mode bubble's text for one ball */
async function bubble(page, id) {
  await page.click('#detailsBtn'); await sleep(200)
  await reveal(page, id); await ball(page, id).click(); await sleep(400)
  const txt = await page.evaluate(() => { const b = document.getElementById('detailBubble'); return b && b.style.display !== 'none' ? b.innerText : '(no bubble)' })
  await page.click('#detailsBtn'); await sleep(200)
  return txt.replace(/\s+/g, ' ').trim()
}

/* ---------------- WORLD A ---------------- */
const A = await open({ size: DESK, who: 'a' })
const pa = A.page

// B/C first need the 2026 bubble BEFORE anything touched it
await pickSyl(pa, /^2026/)
const bfm3Before = await bubble(pa, 'BFM-3')
L.note('A: 2026 · BFM-3 details before anything', bfm3Before)

// C: on Tx, the chart editor's ball box — change ONLY the text
await pickSyl(pa, /^Tx/)
const bfm3Tx = await bubble(pa, 'BFM-3')
L.note('A: Tx · BFM-3 details (the short course\'s own)', bfm3Tx)
await menu(pa, 'syl', 'arrangeBtn')
await reveal(pa, 'BFM-3'); await ball(pa, 'BFM-3').dblclick(); await sleep(400)
const crewShown = await pa.inputValue('#edCrew').catch(() => '(no box)')
L.note('A: Tx · the ball box pre-fills Crew with', crewShown)
await pa.fill('#edText', 'BFM-3 t'); await pa.click('#edSave'); await sleep(500)
if (await pa.locator('#saveChanges').count()) { await pa.click('#saveChanges'); await sleep(500) }
await menu(pa, 'syl', 'arrangeBtn')
await pickSyl(pa, /^2026/)
const bfm3After = await bubble(pa, 'BFM-3')
L.ok('C: a text-only edit on Tx leaves 2026\'s BFM-3 details alone', bfm3After === bfm3Before, `before: "${bfm3Before}"  after: "${bfm3After}"`)
await shot(pa, '03-A-2026-bfm3-after-tx-edit')

// B: fonts on 2026 — Select all + 11.5, Save changes
await menu(pa, 'syl', 'arrangeBtn')
const f0 = await fonts(pa)
await pa.click('#selectAllBtn'); await sleep(200)
await pa.fill('#fontIn', '11.5'); await sleep(500)
const f1 = await fonts(pa)
L.ok('B: Select all + Font 11.5 sets every label to 11.5px', f1.length && f1.every(f => f === '11.5px'), `before ${[...new Set(f0)].join(',')} → after ${[...new Set(f1)].join(',')}`)
await pa.keyboard.press('Escape')
if (await pa.locator('#saveChanges').count()) { await pa.click('#saveChanges'); await sleep(500) }
await menu(pa, 'syl', 'arrangeBtn')

// A: two new charts and a distinctive order
await menu(pa, 'syl', 'dupSyl'); await dlg(pa, { value: 'Alpha copy' }); await sleep(700)
await menu(pa, 'syl', 'addSyl'); await dlg(pa, { value: 'Zulu blank' }); await sleep(700)
await menu(pa, 'syl', 'ordSyl'); await pa.waitForSelector('#ordModal')
const rowIdx = async name => (await pa.locator('#ordList .ordrow .onm').allInnerTexts()).findIndex(t => t.trim() === name)
for (let g = 0; g < 8 && (await rowIdx('Zulu blank')) > 0; g++) { await pa.locator('#ordList .ordrow').nth(await rowIdx('Zulu blank')).locator('button[title="Move up"]').click(); await sleep(120) }
for (let g = 0; g < 8; g++) { const i = await rowIdx('2026'); const n = await pa.locator('#ordList .ordrow').count(); if (i < 0 || i >= n - 1) break; await pa.locator('#ordList .ordrow').nth(i).locator('button[title="Move down"]').click(); await sleep(120) }
const wanted = (await pa.locator('#ordList .ordrow .onm').allInnerTexts()).map(s => s.trim())
await shot(pa, '03-A-order-window')
await pa.click('#ordSave'); await sleep(500)
const orderA = (await sylOptions(pa)).map(o => o.label.replace(/ ✎$/, ''))
L.ok('A: the dropdown follows the order set in the window', JSON.stringify(orderA) === JSON.stringify(wanted), orderA.join(' · '))
const marksA = (await sylOptions(pa)).map(o => o.label)

// export everything
await pa.evaluate(() => { window.showSaveFilePicker = undefined })
await menu(pa, 'file', 'exportBtn'); await pa.waitForSelector('#copyModal')
for (const cb of await pa.locator('#copySylList input').all()) if (!(await cb.isChecked())) await cb.check()
const [dl] = await Promise.all([pa.waitForEvent('download', { timeout: 10000 }), pa.click('#copyOk')])
writeFileSync(FILE, readFileSync(await dl.path(), 'utf8'))
await dlg(pa, {}).catch(() => {})
const file = JSON.parse(readFileSync(FILE, 'utf8'))
L.note('A: the file records the order', (file.charts.order || []).map(id => (file.charts.sylcat.find(e => e.id === id) || {}).name).join(' · '))
await A.browser.close()

/* ---------------- WORLD B — the wiped app ---------------- */
const B = await open({ size: DESK, who: 'a' })
const pb = B.page
await pb.evaluate(() => { window.showOpenFilePicker = undefined })
await pb.click('#fileMenuBtn'); await pb.waitForSelector('#importFileBtn', { state: 'visible' })
const [chooser] = await Promise.all([pb.waitForEvent('filechooser', { timeout: 10000 }), pb.click('#importFileBtn')])
await chooser.setFiles(FILE)
for (let i = 0; i < 14; i++) {
  if (!(await pb.locator('#dlgModal').isVisible().catch(() => false))) { await sleep(400); if (!(await pb.locator('#dlgModal').isVisible().catch(() => false))) break }
  await pb.click('#dlgOk'); await sleep(350)   // "Replace it" for every chart already here, then the result
}
const orderB = (await sylOptions(pb)).map(o => o.label.replace(/ ✎$/, ''))
const marksB = (await sylOptions(pb)).map(o => o.label)
L.ok('A→B: the chart ORDER survives export → wipe → import', JSON.stringify(orderB.filter(n => orderA.includes(n))) === JSON.stringify(orderA), `A ${orderA.join(' · ')}  |  B ${orderB.join(' · ')}`)
L.note('A→B: the "✎ edited" marks', `A ${marksA.join(' · ')}  |  B ${marksB.join(' · ')}`)
await shot(pb, '03-B-after-import')
await pickSyl(pb, /^2026/)
const fB = await fonts(pb)
L.ok('A→B: the 2026 fonts survive (11.5px everywhere)', fB.length && fB.every(f => f === '11.5px'), [...new Set(fB)].join(','))
const bfm3B = await bubble(pb, 'BFM-3')
L.note('B: 2026 · BFM-3 details after the import', bfm3B)
await shot(pb, '03-B-2026')
save('03-roundtrip-order', { rows: L.rows, orderA, orderB, marksA, marksB, errorsA: A.errors, errorsB: B.errors })
console.log(`errors A ${A.errors.length} ${A.errors.slice(0, 3).join(' | ')}; errors B ${B.errors.length} ${B.errors.slice(0, 3).join(' | ')}`)
await B.browser.close()
