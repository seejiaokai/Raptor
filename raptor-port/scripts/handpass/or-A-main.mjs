// Walker A: A1-A6, one world (Ranger files, Saber works, Ranger reads his bell). node or-A-main.mjs [stopAfter]
import { launch, openWorld, fileInput, shot, signOut, signIn, reload, inpBrief, inp, rowOf, toastMark, toastsSince, toastNow, csId, SAT, SAT_DI, errs, OUT } from './or-A-lib.mjs'
import { drag } from './or-A-drag.mjs'
import { readWeek, readBoard, openBoard, closeBoard, toWeek, weekDayLoc, oilRead, oilOn, oilOff, readInputsPage, winSay } from './or-A-read.mjs'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const STOP = Number(process.argv[2] || 99)
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/1fb32070-5ddc-4f68-a0ca-107059b0daf5/scratchpad'
const R = {}
const say = (k, o) => { R[k] = Object.assign(R[k] || {}, o); console.log('## ' + k + ' ' + JSON.stringify(o).slice(0, 2500)) }
const done = () => writeFileSync(join(SCR, 'A-main.json'), JSON.stringify(R, null, 1))
const browser = await launch()
const { ctx, page } = await openWorld(browser, 'A', { who: 'us', pass: 'us' })
import { flow } from './or-A-flow.mjs'
const F = flow(page, '', SAT_DI, SAT)
const { bundle, pickLines, U, pics } = F
const picPage = F.picPage

/* ---------------- A1 ---------------- */
const f = await fileInput(page, { type: 'Training', person: 'Ranger', from: SAT, to: SAT, timed: ['09:00', '12:00'], title: '', oil: 'yes' })
const iid = f.new[0].iid
say('A1-file', { oilSheet: f.sheetText, new: f.new })
await signOut(page); await signIn(page, 'ad', 'a')
let b = await bundle('A1', iid)
say('A1', pickLines(b))
done(); if (STOP <= 1) { console.log(JSON.stringify(errs)); await browser.close(); process.exit(0) }

/* ---------------- A2 ---------------- */
await toWeek(page)
const wd = weekDayLoc(page, SAT_DI)
await wd.scrollIntoViewIfNeeded()
const tally = await csId(page, 'Tally')
let m = await toastMark(page)
await drag(page, page.locator(`#eRoster .rpuck[data-person="${tally}"]`).first(), wd.locator('.sec-grnd .pl-row .addz').first())
const a2toast = await toastsSince(page, m)
const oilQ = await page.locator('[data-testid="oilconf"]').count()
b = await bundle('A2', iid)
say('A2', { toast: a2toast, oilQuestionOpened: oilQ, ...pickLines(b) })
let u = await U('undo'); b = await bundle('A2-undo', iid); say('A2-undo', { ...u, ...pickLines(b) })
u = await U('redo'); b = await bundle('A2-redo', iid); say('A2-redo', { ...u, ...pickLines(b) })
done(); if (STOP <= 2) { console.log(JSON.stringify(errs)); await browser.close(); process.exit(0) }

/* ---------------- A3 ---------------- */
await toWeek(page)
const row = weekDayLoc(page, SAT_DI).locator('.sec-grnd .pl-row').first()
m = await toastMark(page)
await drag(page, page.locator('#eRoster [data-person="allavail"]').first(), row.locator('.ppl'))
const a3toast = await toastsSince(page, m)
b = await bundle('A3', iid)
say('A3', { toast: a3toast, ...pickLines(b) })
u = await U('undo'); b = await bundle('A3-undo', iid); say('A3-undo', { ...u, ...pickLines(b) })
u = await U('redo'); b = await bundle('A3-redo', iid); say('A3-redo', { ...u, ...pickLines(b) })
/* OIL Earn: the counter's window; switch one man off */
await openBoard(page, SAT_DI); await oilOn(page)
await page.locator('#schedBoard .oilcount:visible').first().click(); await page.waitForTimeout(800)
const winFacts = () => page.evaluate(() => { const w = document.querySelector('.availwin'); if (!w) return null; return { head: (w.querySelector('.win-head, .win-title, header') || w).innerText.replace(/\s+/g, ' ').slice(0, 160), names: [...w.querySelectorAll('.rpuck')].map(e => ({ n: e.textContent.trim().replace(/\s+/g, ' '), off: /off|dim|out/.test(e.className) || e.querySelector('.puck') && !/oilglow/.test(e.querySelector('.puck').className) })), n: w.querySelectorAll('.rpuck').length } })
const w1 = await winFacts()
say('A3-window', { head: w1.head, n: w1.n, hasRanger: w1.names.some(x => x.n.startsWith('Ranger')), hasTally: w1.names.some(x => x.n.startsWith('Tally')) })
await page.locator('.availwin').screenshot({ path: join(OUT, 'A3-aa-window.png') }); pics.push('A3-aa-window.png')
const off1 = await page.locator('.availwin .rpuck').nth(2)
const offName = (await off1.textContent()).trim().replace(/\s+/g, ' ')
await off1.click(); await page.waitForTimeout(700)
const w2 = await winFacts()
say('A3-switch', { switchedOff: offName, headAfter: w2.head, note: await toastNow(page), counterAfter: await page.locator('#schedBoard .oilcount:visible').first().textContent() })
await page.locator('.availwin').screenshot({ path: join(OUT, 'A3-aa-window-after.png') }); pics.push('A3-aa-window-after.png')
await page.locator('.availwin [title="Close"], .availwin .win-x, .availwin button[aria-label*="lose"]').first().click().catch(async () => { await page.keyboard.press('Escape') })
await page.waitForTimeout(300)
const a3oil = await oilRead(page, iid)
say('A3-oil-after', { oil: a3oil })
await oilOff(page)
done(); if (STOP <= 3) { console.log(JSON.stringify(errs)); await browser.close(); process.exit(0) }

/* ---------------- A4 ---------------- */
async function emptyPoint() {
  return page.evaluate(() => {
    const cands = [[1425, 300], [1425, 600], [6, 600], [6, 300], [720, 880]]
    for (const [x, y] of cands) { const e = document.elementFromPoint(x, y); if (e && !e.closest('[data-slot],[data-fill],[data-txt],.addz,#eRoster,.rpuck,input,textarea,button,select,.availwin,.pl-row')) return { x, y, tag: e.tagName + '.' + e.className } }
    return null
  })
}
const aaWin = async () => {
  await openBoard(page, SAT_DI); await oilOn(page)
  await page.locator('#schedBoard .oilcount:visible').first().click(); await page.waitForTimeout(800)
  const f = await page.evaluate(() => { const w = document.querySelector('.availwin'); return w ? { head: w.innerText.replace(/\s+/g, ' ').slice(0, 170), blade: (w.innerText.replace(/\s+/g, ' ').match(/Blade\s*\S+/) || [''])[0], n: w.querySelectorAll('.rpuck').length } : null })
  return f
}
const aaClose = async () => { await page.locator('.availwin [title="Close"], .availwin .win-x').first().click().catch(async () => { await page.keyboard.press('Escape') }); await page.waitForTimeout(300); await oilOff(page) }
await toWeek(page)
const row4 = weekDayLoc(page, SAT_DI).locator('.sec-grnd .pl-row').first()
const ep = await emptyPoint()
m = await toastMark(page)
const dinfo = await drag(page, row4.locator('.puck[data-person="bane"]').first(), { x: ep.x, y: ep.y })
const a4toast = await toastsSince(page, m)
b = await bundle('A4', iid)
say('A4', { emptyPoint: ep, drag: dinfo, toast: a4toast, ...pickLines(b) })
let aw = await aaWin(); say('A4-window', aw)
await page.locator('.availwin').screenshot({ path: join(OUT, 'A4-aa-window.png') }); pics.push('A4-aa-window.png')
await aaClose()
u = await U('undo'); b = await bundle('A4-undo', iid); say('A4-undo', { ...u, ...pickLines(b) })
u = await U('redo'); b = await bundle('A4-redo', iid); say('A4-redo', { ...u, ...pickLines(b) })
done(); if (STOP <= 4) { console.log(JSON.stringify(errs)); await browser.close(); process.exit(0) }

/* ---------------- A5 ---------------- */
const typeInto = async (loc, text) => { await loc.scrollIntoViewIfNeeded(); await loc.click(); await page.keyboard.press('Control+a'); await page.keyboard.type(text); await page.keyboard.press('Tab'); await page.waitForTimeout(700) }
let ri = (await rowOf(page, SAT_DI, iid)).ri
await toWeek(page)
m = await toastMark(page)
await typeInto(weekDayLoc(page, SAT_DI).locator(`[data-txt="gr:${SAT_DI}.${ri}.str"]`), '10:00')
const a5t1 = await toastsSince(page, m)
b = await bundle('A5-time', iid); say('A5-time', { toast: a5t1, ...pickLines(b) })
u = await U('undo'); b = await bundle('A5-time-undo', iid); say('A5-time-undo', { ...u, ...pickLines(b) })
u = await U('redo'); b = await bundle('A5-time-redo', iid); say('A5-time-redo', { ...u, ...pickLines(b) })
/* remark typed on the BOARD's row */
await openBoard(page, SAT_DI)
m = await toastMark(page)
const brow = page.locator('#schedBoard .sb-panel.grnd .sb-arow:visible').first()
await typeInto(brow.locator('input:visible, textarea:visible').nth(3), 'Bring ID')
const a5t2 = await toastsSince(page, m)
b = await bundle('A5-rmk', iid); say('A5-rmk', { toast: a5t2, ...pickLines(b) })
u = await U('undo'); b = await bundle('A5-rmk-undo', iid); say('A5-rmk-undo', { ...u, ...pickLines(b) })
u = await U('redo'); b = await bundle('A5-rmk-redo', iid); say('A5-rmk-redo', { ...u, ...pickLines(b) })
/* the title on the row (week) */
await toWeek(page)
m = await toastMark(page)
await typeInto(weekDayLoc(page, SAT_DI).locator(`[data-txt="gr:${SAT_DI}.${ri}.prog"]`), 'Range brief')
const a5t3 = await toastsSince(page, m)
b = await bundle('A5-title', iid); say('A5-title', { toast: a5t3, ...pickLines(b) })
u = await U('undo'); b = await bundle('A5-title-undo', iid); say('A5-title-undo', { ...u, ...pickLines(b) })
u = await U('redo'); b = await bundle('A5-title-redo', iid); say('A5-title-redo', { ...u, ...pickLines(b) })
await reload(page, 'ad', 'a')
b = await bundle('A5-reload', iid); say('A5-reload', pickLines(b))
done(); if (STOP <= 5) { console.log(JSON.stringify(errs)); await browser.close(); process.exit(0) }

/* ---------------- A6 ---------------- */
await signOut(page); await signIn(page, 'us', 'us')
await page.waitForTimeout(400)
const bellState = () => page.evaluate(() => { const b = document.querySelector('#notifyBell'); return b ? { lit: b.classList.contains('on'), open: b.getAttribute('aria-expanded'), vis: !!b.offsetParent } : null })
const listFacts = () => page.evaluate(() => { const l = document.querySelector('.bell-list'); if (!l) return null; return { lines: [...l.querySelectorAll('.bl-line')].map(e => ({ unread: e.classList.contains('unread'), name: e.querySelector('.bl-name').textContent, day: e.querySelector('.bl-day').textContent, what: e.querySelector('.bl-what').textContent, ago: e.querySelector('.bl-ago').textContent })), empty: (l.querySelector('.bl-empty') || {}).textContent || null } })
say('A6-bell', await bellState())
await shot(page, 'A6-ranger-top'); pics.push('A6-ranger-top.png')
await page.locator('#notifyBell').click(); await page.waitForTimeout(500)
const lf = await listFacts()
say('A6-list', { toast: await toastNow(page), state: await bellState(), ...lf })
await shot(page, 'A6-list'); pics.push('A6-list.png')
if (lf && lf.lines.length) {
  await page.locator('.bell-list .bl-line').first().click(); await page.waitForTimeout(700)
  say('A6-tap', { win: await page.locator('#inpEditPop:visible').count(), title: await page.locator('#inpEditPop #inpEditOwnTitle').first().inputValue().catch(() => null), toast: await toastNow(page), text: await winSay(page) })
  await shot(page, 'A6-tap'); pics.push('A6-tap.png')
}
done()
console.log('PICS ' + JSON.stringify(pics))
console.log(JSON.stringify(errs))
await browser.close()
