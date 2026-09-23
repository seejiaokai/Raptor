/* [HUMAN-RETEST] Tracker — walk 1: THE ROUND TRIP (D120, owner 23 Sep 26).

   His route to the database: EXPORT his hand-drawn charts, WIPE the app, IMPORT
   the file into the Tracker. This walk does exactly that, through the app's own
   controls:

   World A (a browser with the charts drawn on it, desktop, admin):
     1. hand-draw on the 2026 chart in arrange mode — move a ball, draw a free
        line, connect a new prerequisite, add a ball and name it, edit a ball's
        crew and prerequisite note, change the font — then Save changes;
     2. edit an event's details through ⓘ (the Info window);
     3. duplicate the chart and move a ball on the copy; add an empty chart and
        give it a ball; rename a built-in; delete a built-in;
     4. Export, every chart ticked.
   World B (a FRESH browser — the wiped app): Import that file, answering the
   app's own questions the way he would ("Replace it" for a chart already there).
   Then every chart A drew is compared with B's: the list and order, every ball
   (id, position, label, font), every line, every event detail.

   Harness notes, stated so nobody reads more into them: the OS save/open
   dialogs cannot be driven by Playwright, so the native pickers are removed
   for this page and the app takes its OTHER real path — a normal download out,
   a file input in (the path his iPhone takes). The file's CONTENT is built by
   the same code either way. */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { open, shot, save, core, dlg, log, reveal, DESK, SHOTS } from './trk-lib.mjs'

const L = log()
const FILE = resolve(SHOTS, '..', '..', '..', 'handpass', 'parts', 'tracker', 'roundtrip-export.json')

const sleep = ms => new Promise(r => setTimeout(r, ms))
const ball = (page, id) => page.locator(`#flowSvg .ball[data-id="${id}"]`).first()

async function menu(page, which, item) {
  await page.click(`#${which}MenuBtn`)
  await page.waitForSelector(`#${item}`, { state: 'visible', timeout: 4000 })
  await page.click(`#${item}`)
  await sleep(250)
}
async function sylOptions(page) {
  return page.evaluate(() => [...document.querySelectorAll('#sylSel option')].map(o => ({ id: o.value, label: o.textContent })))
}
async function pickSylById(page, id) {
  await page.selectOption('#sylSel', id)
  await page.waitForFunction(i => document.querySelector('#sylSel').value === i, id)
  await page.waitForSelector('#flowSvg .ball', { timeout: 8000 }).catch(() => {})
  await sleep(600)
}
async function center(loc) { const b = await loc.boundingBox(); return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : null }
async function dragBy(page, id, dx, dy) {
  await reveal(page, id)
  const c = await center(ball(page, id)); if (!c) return false
  await page.mouse.move(c.x, c.y); await page.mouse.down()
  for (let i = 1; i <= 8; i++) await page.mouse.move(c.x + dx * i / 8, c.y + dy * i / 8)
  await page.mouse.up(); await sleep(300)
  return true
}
async function tool(page, label) {
  await page.locator('#arrTools button', { hasText: label }).first().click(); await sleep(150)
}

/* What a person SEES of one chart: every ball's id, position, label and font,
   and every line — read off the drawn chart, not the store. */
async function drawn(page) {
  return page.evaluate(() => {
    const svg = document.querySelector('#flowSvg')
    const balls = [...svg.querySelectorAll('.ball')].map(g => {
      const t = g.getAttribute('transform') || ''
      const txt = [...g.querySelectorAll('text')].map(x => x.textContent).join('|')
      const fs = [...g.querySelectorAll('text')].map(x => x.getAttribute('font-size')).join('|')
      return { id: g.dataset.id, t, txt, fs }
    }).sort((a, b) => a.id.localeCompare(b.id))
    /* every stroke that is not part of a ball: prerequisite arrows and free lines */
    const lines = [...svg.querySelectorAll('path, line, polyline')]
      .filter(p => !p.closest('.ball') && !/hit|handle/.test(p.getAttribute('class') || ''))
      .map(p => (p.getAttribute('d') || [p.getAttribute('x1'), p.getAttribute('y1'), p.getAttribute('x2'), p.getAttribute('y2')].join(',') || p.getAttribute('points') || ''))
      .sort()
    return { balls, lines, w: svg.getAttribute('width'), h: svg.getAttribute('height') }
  })
}

async function snapshotAll(page, tag) {
  const opts = await sylOptions(page)
  const charts = {}
  for (const o of opts) {
    await pickSylById(page, o.id)
    charts[o.id] = { label: o.label, ...(await drawn(page)) }
    await shot(page, `01-${tag}-${o.label.replace(/[^A-Za-z0-9]+/g, '_')}`)
  }
  const store = await core(page, c => c.collectCharts(c.sylsNow().map(e => e.id)))
  return { order: opts.map(o => o.label), charts, eventInfo: store.eventInfo, syllabi: store.syllabi }
}

/* ---------------- WORLD A ---------------- */
const A = await open({ size: DESK, who: 'a' })
let pa = A.page
await shot(pa, '01-A-start')
const startOpts = await sylOptions(pa)
L.note('A: charts on a fresh app', startOpts.map(o => o.label).join(' · '))
const id2026 = (startOpts.find(o => /^2026/.test(o.label)) || {}).id
await pickSylById(pa, id2026)

// 1. arrange mode — hand-draw on 2026
await menu(pa, 'syl', 'arrangeBtn')
L.ok('A: arrange mode on (Syllabus ✎ → Edit chart layout)', await pa.locator('#arrTools.on').count(), await pa.locator('#arrangeBtn').innerText().catch(() => ''))
await shot(pa, '01-A-arrange-on')

const before = await drawn(pa)
const moved = await dragBy(pa, 'ACG-03', 140, 30)
const afterMove = await drawn(pa)
const tBefore = (before.balls.find(b => b.id === 'ACG-03') || {}).t, tAfter = (afterMove.balls.find(b => b.id === 'ACG-03') || {}).t
L.ok('A: drag ACG-03 → it moves', moved && tBefore !== tAfter, `${tBefore} → ${tAfter}`)

// free line: click two empty points left of the flow
await reveal(pa, 'ACG-01')   // pan BEFORE picking Line: with Line on, a press on empty space starts a line
await tool(pa, 'Line')
const acg1 = await center(ball(pa, 'ACG-01'))
const p1 = { x: acg1.x - 220, y: acg1.y }, p2 = { x: acg1.x - 220, y: acg1.y + 160 }
await pa.mouse.click(p1.x, p1.y); await sleep(200); await pa.mouse.click(p2.x, p2.y); await sleep(300)
const afterLine = await drawn(pa)
L.ok('A: Line tool draws a free line', afterLine.lines.length > afterMove.lines.length, `${afterMove.lines.length} → ${afterLine.lines.length} strokes`)

// connect: ST-02 → ACG-05 (a new prerequisite)
await tool(pa, 'Move')
await reveal(pa, 'ST-02')
await tool(pa, 'Connect')
await reveal(pa, 'ST-02'); await ball(pa, 'ST-02').click(); await sleep(200); await reveal(pa, 'ACG-05'); await ball(pa, 'ACG-05').click(); await sleep(400)
const afterConnect = await drawn(pa)
await shot(pa, '01-A-after-connect')
L.note('A: after connect — arrange on? hint', (await pa.locator('#arrTools.on').count()) + ' | ' + (await pa.evaluate(() => (document.querySelector('.hintbar, .hint, #hint') || {}).textContent || '')))
L.ok('A: Connect ST-02 → ACG-05 redraws the prerequisite lines', afterConnect.lines.join('|') !== afterLine.lines.join('|'), `${afterLine.lines.length} → ${afterConnect.lines.length} strokes (a new link can join an existing run)`)

// add a ball, then name it with the Text tool
await tool(pa, 'Move')
await pa.locator('#arrTools button', { hasText: '+ Flight' }).click(); await sleep(400)
if (await pa.locator('#dlgModal').isVisible().catch(() => false)) { const q = await dlg(pa, { value: 'HAND-01' }); L.note('A: + Flight asked', q.text.replace(/\s+/g, ' ')) }
await sleep(500)
const afterAdd = await drawn(pa)
await shot(pa, '01-A-after-addflight')
L.note('A: after + Flight — arrange on? dlg?', (await pa.locator('#arrTools.on').count()) + ' | dlg ' + (await pa.locator('#dlgModal').count()) + ' ' + (await pa.locator('#dlgMsg').innerText().catch(() => '')))
const newIds = afterAdd.balls.map(b => b.id).filter(id => !afterConnect.balls.some(b => b.id === id))
L.ok('A: + Flight adds one ball', newIds.length === 1, newIds.join(','))
let handId = newIds[0]
if (handId) {
  await tool(pa, 'Text')
  await reveal(pa, handId); await ball(pa, handId).click(); await sleep(300)
  const ed = await pa.locator('#editModal').count()
  L.ok('A: Text tool opens the event box on the new ball', ed, '')
  if (ed) {
    await pa.fill('#edText', 'Hand one'); await sleep(100)
    await pa.click('#edSave'); await sleep(500)
    const err = await pa.locator('#edErr').innerText().catch(() => '')
    L.note('A: after Save in the event box', err || 'no error line')
    if (await pa.locator('#editModal').count()) { await pa.click('#edCancel').catch(() => {}) }
  }
  const afterText = await drawn(pa)
  const nb = afterText.balls.filter(b => !afterConnect.balls.some(x => x.id === b.id))
  L.note('A: the new ball now reads', JSON.stringify(nb))
  handId = (nb[0] || {}).id || handId
}

// double-click AVI-01: crew + prerequisite note
await tool(pa, 'Move')
await reveal(pa, 'AVI-01'); await ball(pa, 'AVI-01').dblclick(); await sleep(400)
if (await pa.locator('#editModal').count()) {
  await pa.fill('#edCrew', 'IP / UW, UP / IW (hand)')
  await pa.fill('#edPre', 'hand-written note')
  await pa.click('#edSave'); await sleep(400)
  L.ok('A: double-click AVI-01 → event box saved', !(await pa.locator('#editModal').count()), await pa.locator('#edErr').innerText().catch(() => ''))
} else L.ok('A: double-click AVI-01 opens the event box', false)

// font: Select all → 10
await pa.click('#selectAllBtn'); await sleep(200)
await pa.fill('#fontIn', '10'); await sleep(400)
const afterFont = await drawn(pa)
L.ok('A: Select all + Font 10 changes the labels', afterFont.balls.some(b => /10/.test(b.fs)), afterFont.balls.slice(0, 2).map(b => b.fs).join(' / '))
await pa.keyboard.press('Escape'); await sleep(150)

await shot(pa, '01-A-2026-drawn')
const saveBtn = await pa.locator('#saveChanges').count()
L.ok('A: "✓ Save changes" is offered after structure edits', saveBtn)
if (saveBtn) { await pa.click('#saveChanges'); await sleep(600) }
L.ok('A: Save changes clears the button', !(await pa.locator('#saveChanges').count()), await pa.locator('#saveStat').innerText().catch(() => ''))
await menu(pa, 'syl', 'arrangeBtn')   // Done editing

// 2. event details through ⓘ → tap a ball → Edit details
await pa.click('#detailsBtn'); await sleep(200)
await reveal(pa, 'ACG-01'); await ball(pa, 'ACG-01').click(); await sleep(400)
const bubbleEdit = pa.locator('text=Edit details').first()
if (await bubbleEdit.count()) {
  await bubbleEdit.click(); await sleep(300)
  await pa.fill('#ifFmt', 'Lecture (hand)'); await pa.fill('#ifHrs', '1.7 Hrs')
  await pa.click('#ifSave'); await sleep(400)
  L.ok('A: ⓘ → Edit details → Save closes the Info window', !(await pa.locator('#infoModal').count()))
} else {
  L.ok('A: ⓘ + tap shows an "Edit details" door', false, 'no Edit details found after tapping ACG-01 with ⓘ on')
  await shot(pa, '01-A-details-nodoor')
}
await pa.click('#detailsBtn').catch(() => {}); await sleep(200)
await pa.keyboard.press('Escape'); await sleep(150)

// 3. duplicate, move a ball on the copy
await menu(pa, 'syl', 'dupSyl')
await dlg(pa, { value: '2026 hand copy' })
await sleep(700)
L.ok('A: Duplicate → switched to the copy', /2026 hand copy/.test(await pa.locator('#sylSel option:checked').innerText()), await pa.locator('#sylSel option:checked').innerText())
await menu(pa, 'syl', 'arrangeBtn')
await dragBy(pa, 'ST-01', -120, 0)
if (await pa.locator('#saveChanges').count()) { await pa.click('#saveChanges'); await sleep(500) }
await menu(pa, 'syl', 'arrangeBtn')

// an empty chart with one ball
await menu(pa, 'syl', 'addSyl')
await dlg(pa, { value: 'Blank hand' })
await sleep(700)
await menu(pa, 'syl', 'arrangeBtn')
await pa.locator('#arrTools button', { hasText: '+ Sim' }).click(); await sleep(400)
if (await pa.locator('#dlgModal').isVisible().catch(() => false)) await dlg(pa, { value: 'BLANK-SIM' })
await sleep(500)
L.ok('A: + Sim on the empty chart adds a ball', await pa.locator('#flowSvg .ball').count(), '')
if (await pa.locator('#saveChanges').count()) { await pa.click('#saveChanges'); await sleep(500) }
await menu(pa, 'syl', 'arrangeBtn')

// rename a built-in, delete a built-in
const optsNow = await sylOptions(pa)
const idTx = (optsNow.find(o => /^Tx/.test(o.label)) || {}).id
const id2024 = (optsNow.find(o => /^2024/.test(o.label)) || {}).id
await pickSylById(pa, idTx)
await menu(pa, 'syl', 'renSyl'); await dlg(pa, { value: 'Tx mine' }); await sleep(500)
await pickSylById(pa, id2024)
await menu(pa, 'syl', 'delSyl'); const delQ = await dlg(pa, { ok: true }); await sleep(600)
L.note('A: delete 2024 asked', delQ.text.replace(/\s+/g, ' '))
await pickSylById(pa, id2026)

const snapA = await snapshotAll(pa, 'A')
L.note('A: charts before export', snapA.order.join(' · '))

// 4. Export, every chart ticked, through the download path
await pa.evaluate(() => { try { delete window.showSaveFilePicker } catch (_) {} window.showSaveFilePicker = undefined })
await menu(pa, 'file', 'exportBtn')
await pa.waitForSelector('#copyModal')
const exportOffers = await pa.locator('#copySylList label').allInnerTexts()
const tickedAtOpen = await pa.locator('#copySylList input:checked').count()
L.note('A: the Export window offers', exportOffers.map(s => s.trim()).join(' · ') + ` — ${tickedAtOpen} ticked when it opens`)
await shot(pa, '01-A-export-window')
for (const cb of await pa.locator('#copySylList input').all()) if (!(await cb.isChecked())) await cb.check()
const [dl] = await Promise.all([pa.waitForEvent('download', { timeout: 10000 }), pa.click('#copyOk')])
const dlPath = await dl.path()
const text = readFileSync(dlPath, 'utf8')
writeFileSync(FILE, text)
const conf = await dlg(pa, {}).catch(() => ({ text: '(no confirmation)' }))
L.note('A: export confirmation', conf.text.replace(/\s+/g, ' '))
const fileObj = JSON.parse(text)
L.note('A: the file holds charts', (fileObj.charts && fileObj.charts.order || []).join(', '))
await A.browser.close()

/* ---------------- WORLD B — the wiped app ---------------- */
const B = await open({ size: DESK, who: 'a' })
const pb = B.page
await shot(pb, '01-B-fresh')
await pb.evaluate(() => { try { delete window.showOpenFilePicker } catch (_) {} window.showOpenFilePicker = undefined })
await pb.click('#fileMenuBtn'); await pb.waitForSelector('#importFileBtn', { state: 'visible' })
const [chooser] = await Promise.all([pb.waitForEvent('filechooser', { timeout: 10000 }), pb.click('#importFileBtn')])
await chooser.setFiles(FILE)
const asked = []
for (let i = 0; i < 12; i++) {
  const up = await pb.locator('#dlgModal').isVisible().catch(() => false)
  if (!up) { await sleep(400); if (!(await pb.locator('#dlgModal').isVisible().catch(() => false))) break }
  const msg = (await pb.locator('#dlgMsg').innerText()).trim()
  asked.push(msg.replace(/\s+/g, ' '))
  if (/already exists/.test(msg)) await pb.click('#dlgOk')           // "Replace it"
  else await pb.click('#dlgOk')                                       // the final "Brought in …" alert
  await sleep(400)
}
L.note('B: the import asked', asked.join('  ||  '))
const snapB = await snapshotAll(pb, 'B')
L.note('B: charts after import', snapB.order.join(' · '))
await B.browser.close()

/* ---------------- compare ---------------- */
const byLabel = s => Object.fromEntries(Object.values(s.charts).map(c => [c.label.replace(/ ✎$/, ''), c]))
const ca = byLabel(snapA), cb = byLabel(snapB)
L.ok('ROUND TRIP: same charts, same order', JSON.stringify(snapA.order) === JSON.stringify(snapB.order), `A ${snapA.order.join(' · ')}  |  B ${snapB.order.join(' · ')}`)
for (const name of Object.keys(ca)) {
  const a = ca[name], b = cb[name]
  if (!b) { L.ok(`ROUND TRIP: "${name}" survives`, false, 'missing in B'); continue }
  const ballDiff = a.balls.filter(x => { const y = b.balls.find(z => z.id === x.id); return !y || y.t !== x.t || y.txt !== x.txt || y.fs !== x.fs })
  const extra = b.balls.filter(x => !a.balls.some(z => z.id === x.id))
  L.ok(`ROUND TRIP: "${name}" every ball (id, place, label, font)`, !ballDiff.length && !extra.length, `${a.balls.length} balls; differing ${ballDiff.length}${ballDiff.length ? ' e.g. ' + JSON.stringify(ballDiff[0]) + ' vs ' + JSON.stringify(b.balls.find(z => z.id === ballDiff[0].id) || null) : ''}; extra in B ${extra.length}`)
  const la = a.lines.join('\n'), lb = b.lines.join('\n')
  L.ok(`ROUND TRIP: "${name}" every line`, la === lb, `${a.lines.length} vs ${b.lines.length} strokes`)
}
for (const name of Object.keys(cb)) if (!ca[name]) L.note(`ROUND TRIP: B has a chart A did not`, name)
const infoKeys = Object.keys(snapA.eventInfo || {}).filter(k => JSON.stringify(snapA.eventInfo[k]) !== JSON.stringify((snapB.eventInfo || {})[k]))
L.ok('ROUND TRIP: every event detail', !infoKeys.length, infoKeys.slice(0, 5).join(', '))
save('01-roundtrip', { rows: L.rows, snapA, snapB, asked, errorsA: A.errors, errorsB: B.errors })
console.log(`\nerrors A ${A.errors.length}: ${A.errors.slice(0, 5).join(' | ')}`)
console.log(`errors B ${B.errors.length}: ${B.errors.slice(0, 5).join(' | ')}`)
