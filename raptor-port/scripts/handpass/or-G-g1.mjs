// G1 (the face keeps what went out) + G7 (publish, then reload). One world, no ?fresh=1.
import { open, fileInput, toWeek, toBoard, toView, shot, shotEl, browser, errs, readRows, inputsRead, signAndPublish, counts, sleep, toastMark, toastsSince, dragLocToLoc, rosterPuckOf, weekRow, lwCells, lwTracker, lwCloseSheet, csId, reload, saveData } from './or-G-lib.mjs'
const log = (...a) => console.log(...a)
const rec = {}
const { ctx, page } = await open()
const F = await fileInput(page, { type: 'Training', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'Range brief', oil: 'yes' })
log('filed', JSON.stringify(F))
const pub = await signAndPublish(page, 5); log('pub', JSON.stringify(pub)); rec.pub1 = pub
const R = await csId(page, 'Ranger'), T = await csId(page, 'Tally')
const mine = async () => (await inputsRead(page)).filter(r => r.title === 'Range brief')

async function viewFace(tag) {
  await toView(page)
  const rows = await readRows(page, 'Range brief')
  const day = page.locator('#vWeek .day:not(.peek)').nth(5)
  await day.locator('.sec-grnd').first().scrollIntoViewIfNeeded().catch(() => {})
  await day.scrollIntoViewIfNeeded().catch(() => {})
  await sleep(300)
  await shot(page, tag)
  return rows.viewWeek
}
async function lw(tag) {
  const c = await lwCells(page, [R, T]); const tr = await lwTracker(page)
  const rl = (tr.entries || []).filter(e => /18 Jul/.test(e))
  const t = tr.text || ''
  const iR = t.indexOf('Ranger IP'), iS = t.indexOf('Saber IP')
  const iT = t.indexOf('Tally'); const tallySeg = iT >= 0 ? t.slice(iT, iT + 160) : 'NO Tally in tracker text'
  await shot(page, tag); await lwCloseSheet(page)
  return { cells: c, rangerSeg: t.slice(iR, iS), tallySeg, jul18: rl }
}
async function earn(tag) {
  await toBoard(page, 5)
  await page.locator('#sbOil').click(); await sleep(900)
  await page.locator('#schedBoard .sb-panel.grnd').first().scrollIntoViewIfNeeded(); await sleep(300)
  const r = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .puck')].map(e => ({ who: window.PEOPLE[e.dataset.person]?.cs, cls: e.className.replace(/\s+/g, ' '), title: e.getAttribute('title') || '' })))
  const dayBar = await page.evaluate(() => (((document.querySelector('#schedBoard .sb-daybar, #schedBoard .sb-top') || {}).innerText) || '').replace(/[\r\n]+/g, ' | ').slice(0, 300))
  await shot(page, tag)
  await page.locator('#sbOil').click(); await sleep(400)
  await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await sleep(300)
  return { pucks: r, dayBar }
}

/* ---------------- stage A: published, Ranger alone ---------------- */
rec.A = {}
rec.A.inputs = await mine(); rec.A.counts = await counts(page, 5); rec.A.edit = (await readRows(page, 'Range brief')).editWeek
rec.A.viewSaber = await viewFace('G1-A-view-saber'); rec.A.lw = await lw('G1-A-lw'); rec.A.earn = await earn('G1-A-oilearn')
log('A', JSON.stringify(rec.A))
await toWeek(page); await weekRow(page, 5, 'Range brief').scrollIntoViewIfNeeded(); await shot(page, 'G1-A-edit-week')

/* ---------------- stage B: Tally dragged onto "+ add" ---------------- */
rec.B = {}
await toWeek(page)
let m = await toastMark(page)
await dragLocToLoc(page, rosterPuckOf(page, T), weekRow(page, 5, 'Range brief').locator('.addz'))
rec.B.toast = await toastsSince(page, m)
await shot(page, 'G1-B-edit-after-add')
rec.B.inputs = await mine(); rec.B.edit = (await readRows(page, 'Range brief')).editWeek; rec.B.counts = await counts(page, 5)
rec.B.viewSaber = await viewFace('G1-B-view-saber'); rec.B.lw = await lw('G1-B-lw'); rec.B.earn = await earn('G1-B-oilearn')
log('B', JSON.stringify(rec.B))
/* Undo at this stage */
await toWeek(page)
await page.locator('#undoBtn:visible').first().click(); await sleep(800)
rec.B.undoToast = (await page.evaluate(() => document.getElementById('toastEl')?.innerText || '')).replace(/\s+/g, ' ')
rec.B.undo = { inputs: await mine(), edit: (await readRows(page, 'Range brief')).editWeek, counts: await counts(page, 5) }
await shot(page, 'G1-B-after-undo')
await toWeek(page)
await page.locator('#redoBtn:visible').first().click(); await sleep(800)
rec.B.redo = { inputs: await mine(), edit: (await readRows(page, 'Range brief')).editWeek, counts: await counts(page, 5) }
log('B undo/redo', JSON.stringify({ u: rec.B.undo, r: rec.B.redo, t: rec.B.undoToast }))
/* Ranger signs in: his View-only Sched */
await reload(page, 'us', 'us')
rec.B.viewRanger = await viewFace('G1-B-view-ranger')
rec.B.rangerInputs = await mine()
log('B ranger view', JSON.stringify(rec.B.viewRanger))
await reload(page, 'ad', 'a')

/* ---------------- stage C: publish again (AL1) ---------------- */
rec.C = {}
const pub2 = await signAndPublish(page, 5); log('pub2', JSON.stringify(pub2)); rec.C.pub = pub2
rec.C.inputs = await mine(); rec.C.counts = await counts(page, 5); rec.C.edit = (await readRows(page, 'Range brief')).editWeek
rec.C.viewSaber = await viewFace('G1-C-view-saber'); rec.C.lw = await lw('G1-C-lw'); rec.C.earn = await earn('G1-C-oilearn')
log('C', JSON.stringify(rec.C))
/* Undo at this stage, then Redo */
await toWeek(page)
const ub = page.locator('#undoBtn:visible').first()
rec.C.undoDisabled = await ub.isDisabled()
if (!rec.C.undoDisabled) { await ub.click(); await sleep(800) }
rec.C.undoToast = (await page.evaluate(() => document.getElementById('toastEl')?.innerText || '')).replace(/\s+/g, ' ')
rec.C.undo = { inputs: await mine(), edit: (await readRows(page, 'Range brief')).editWeek, counts: await counts(page, 5) }
await shot(page, 'G1-C-after-undo')
await toWeek(page)
const rb = page.locator('#redoBtn:visible').first()
rec.C.redoDisabled = await rb.isDisabled()
if (!rec.C.redoDisabled) { await rb.click(); await sleep(800) }
rec.C.redo = { inputs: await mine(), edit: (await readRows(page, 'Range brief')).editWeek, counts: await counts(page, 5) }
log('C undo/redo', JSON.stringify({ u: rec.C.undo, r: rec.C.redo, t: rec.C.undoToast, ud: rec.C.undoDisabled, rd: rec.C.redoDisabled }))
await reload(page, 'us', 'us')
rec.C.viewRanger = await viewFace('G1-C-view-ranger')
await reload(page, 'ad', 'a')

/* ---------------- G7: reload as Saber ---------------- */
rec.G7 = {}
rec.G7.inputs = await mine(); rec.G7.counts = await counts(page, 5); rec.G7.edit = (await readRows(page, 'Range brief')).editWeek
rec.G7.viewSaber = await viewFace('G7-view-saber'); rec.G7.lw = await lw('G7-lw'); rec.G7.earn = await earn('G7-oilearn')
log('G7', JSON.stringify(rec.G7))
rec.errs = errs.slice()
saveData('G1_G7', rec)
log('errs', JSON.stringify(errs))
await ctx.close(); await browser.close()
