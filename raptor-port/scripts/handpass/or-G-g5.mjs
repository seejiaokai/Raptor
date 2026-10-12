// G5 (a member's face) - Thu 16 Jul: 'Range brief' Meeting for Ranger, Hex, Drifter + ALL AVAIL; 'Kit check' Training for Ranger and Tally, cancelled (WX) on the board; then Ranger's View-only Sched / Edit Schedule
import { open, fileInput, toWeek, toBoard, toView, shot, shotEl, browser, errs, readRows, inputsRead, sleep, csId, reload, saveData, mouseDrag, centre } from './or-G-lib.mjs'
const rec = {}
const DI = 3
const { ctx, page } = await open()
rec.f1 = await fileInput(page, { type: 'Meeting', people: ['Ranger', 'Hex', 'Drifter'], placeholder: 'allavail', from: '2026-07-16', to: '2026-07-16', timed: ['10:00', '11:00'], title: 'Range brief' })
rec.f2 = await fileInput(page, { type: 'Training', people: ['Ranger', 'Tally'], from: '2026-07-16', to: '2026-07-16', timed: ['14:00', '15:00'], title: 'Kit check', oil: 'no' })
console.log('f1', JSON.stringify(rec.f1)); console.log('f2', JSON.stringify(rec.f2))
const kit = rec.f2[0]
/* cancel it on the board with the row's CX button */
await toWeek(page)
const ri = await page.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [DI, kit.iid])
console.log('ri', ri)
await toBoard(page, DI)
const cx = page.locator(`#schedBoard [data-grcx="${DI}.${ri}"]:visible`).first()
await cx.scrollIntoViewIfNeeded(); await cx.click()
await page.waitForSelector('#cxSave', { timeout: 5000 })
const q = page.locator('#cxQuick [data-cxq="WX"]').first()
if (await q.count()) await q.click(); else await page.locator('#cxReason').fill('WX')
await page.locator('#cxSave').click(); await sleep(600)
await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await sleep(400)
rec.inputs = (await inputsRead(page)).filter(r => ['Range brief', 'Kit check'].includes(r.title))
console.log('inputs', JSON.stringify(rec.inputs))
/* Saber's own face for comparison */
await toWeek(page); rec.saberRows = await readRows(page, ['Range brief', 'Kit check'])
console.log('saber rows', JSON.stringify(rec.saberRows))

/* Ranger signs in */
await reload(page, 'us', 'us')
await toView(page)
await page.locator('#vWeek .day:not(.peek)').nth(DI).scrollIntoViewIfNeeded()
rec.vRows = await readRows(page, ['Range brief', 'Kit check']); console.log('Ranger view rows', JSON.stringify(rec.vRows.viewWeek))
rec.vDom = await page.evaluate(di => {
  const day = [...document.querySelectorAll('#vWeek .day:not(.peek)')][di]
  const secs = [...day.querySelectorAll('.sec')].map(s => s.className.replace(/\s+/g, ' ') + ' :: ' + s.innerText.replace(/\s+/g, ' ').slice(0, 260))
  const rows = [...day.querySelectorAll('.sec-grnd .pl-row, .sec-inp .pl-row')].map(r => ({ sec: r.closest('.sec').className.replace(/\s+/g, ' '), text: r.innerText.replace(/\s+/g, ' ').slice(0, 200), html: r.outerHTML.slice(0, 1200), editable: r.querySelectorAll('[contenteditable=true]').length, draggable: r.querySelectorAll('[data-drag],[draggable=true]').length, inputs: r.querySelectorAll('input,select,textarea,button').length, strike: (() => { const n = r.querySelector('.nm'); return n ? getComputedStyle(n.querySelector('.ntx') || n).textDecorationLine : '' })() }))
  return { secs, rows }
}, DI)
console.log('vDom rows', JSON.stringify(rec.vDom.rows.map(r => ({ sec: r.sec, text: r.text, editable: r.editable, draggable: r.draggable, inputs: r.inputs, strike: r.strike }))))
await shotEl(page.locator('#vWeek .day:not(.peek)').nth(DI), 'G5-ranger-view-thu')
/* hands: a drag of Hex's puck off the row, a right click, a click on a typed box */
const hexP = page.locator('#vWeek .day:not(.peek)').nth(DI).locator('.sec-grnd .pl-row', { hasText: 'RANGE BRIEF' }).locator('.puck', { hasText: 'Hex' }).first()
const hb = await hexP.boundingBox()
const before = JSON.stringify((await inputsRead(page)).filter(r => r.title === 'Range brief').map(r => r.people))
if (hb) { await mouseDrag(page, centre(hb), { x: 700, y: 700 }); await hexP.click({ button: 'right' }).catch(() => {}); await sleep(500) }
const after = JSON.stringify((await inputsRead(page)).filter(r => r.title === 'Range brief').map(r => r.people))
rec.hands = { before, after, hexPuckFound: !!hb, toast: (await page.evaluate(() => document.getElementById('toastEl')?.innerText || '')).replace(/\s+/g, ' ') }
console.log('hands', JSON.stringify(rec.hands))
/* a tap on his own input */
const tapTargets = [
  ['view row name (Range brief)', page.locator('#vWeek .day:not(.peek)').nth(DI).locator('.sec-grnd .pl-row', { hasText: 'RANGE BRIEF' }).locator('.nm').first()],
  ['view Personal Inputs line (Range brief)', page.locator('#vWeek .day:not(.peek)').nth(DI).locator('.sec-inp .pl-row', { hasText: /range brief/i }).first()],
  ['view Personal Inputs line (Kit check)', page.locator('#vWeek .day:not(.peek)').nth(DI).locator('.sec-inp .pl-row', { hasText: /kit check/i }).first()],
]
rec.taps = []
for (const [nm, loc] of tapTargets) {
  const n = await loc.count()
  let opened = false, text = ''
  if (n) {
    await loc.scrollIntoViewIfNeeded().catch(() => {})
    await loc.click().catch(() => {}); await sleep(700)
    opened = (await page.locator('[data-testid="win-inputedit"]').count()) > 0
    if (opened) { text = (await page.locator('[data-testid="win-inputedit"]').innerText()).replace(/\s+/g, ' ').slice(0, 500); await shot(page, 'G5-ranger-window-' + (rec.taps.length + 1)); const x = page.locator('#inpEditCancel, [data-testid="win-inputedit-x"]').first(); if (await x.count()) await x.click().catch(() => {}); else await page.keyboard.press('Escape'); await sleep(400) }
  }
  rec.taps.push({ nm, found: n, opened, text })
  console.log('tap', nm, n, opened, text)
}
/* Edit Schedule */
await page.evaluate(() => window.go('editsched')); await sleep(700)
rec.edit = await page.evaluate(() => ({ page: window.CURPAGE, navHas: !!document.querySelector('a[data-page="editsched"]'), text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 200) }))
console.log('edit', JSON.stringify(rec.edit))
await shot(page, 'G5-ranger-editsched-try')
saveData('G5', rec)
console.log('errs', JSON.stringify(errs))
await ctx.close(); await browser.close()
