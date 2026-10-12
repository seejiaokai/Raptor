// Walker A: A7, A8, A9 (OIL unanswered / closed / No) — each in its own new world. node or-A-oil.mjs <7|8|9>
import { launch, openWorld, fileInput, shot, signOut, signIn, reload, inpBrief, rowOf, toastMark, toastsSince, toastNow, csId, SAT, errs, OUT } from './or-A-lib.mjs'
import { drag } from './or-A-drag.mjs'
import { openBoard, closeBoard, toWeek, weekDayLoc, oilRead, oilOn, oilOff } from './or-A-read.mjs'
import { flow } from './or-A-flow.mjs'
import { declareHoliday } from './or-A-hol.mjs'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const WHICH = process.argv[2]
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/1fb32070-5ddc-4f68-a0ca-107059b0daf5/scratchpad'
const R = {}
const say = (k, o) => { R[k] = Object.assign(R[k] || {}, o); console.log('## ' + k + ' ' + JSON.stringify(o).slice(0, 2600)) }
const SAT_DI = 5
const HOL = WHICH === '7' || WHICH === '8'   // the form cannot be saved unanswered, so a weekday Training is filed first and the day is then declared a holiday
const ISO = HOL ? '2026-07-17' : SAT, DI = HOL ? 4 : SAT_DI
const browser = await launch()
const { page } = await openWorld(browser, 'A' + WHICH, { who: 'us', pass: 'us' })
const F = flow(page, `A${WHICH}-`, DI, ISO)
const oil = WHICH === '9' ? 'no' : 'yes'
const f = await fileInput(page, { type: 'Training', person: 'Ranger', from: ISO, to: ISO, timed: ['09:00', '12:00'], title: '', oil })
say('file', { sheet: f.sheetText, closed: f.closed, new: f.new })
let iid
if (f.new[0]) iid = f.new[0].iid
else {
  say('file', { note: 'NOT saved by Ranger when the question is closed unanswered' })
  await browser.close(); process.exit(0)
}
await signOut(page); await signIn(page, 'ad', 'a')
if (HOL) { const h = await declareHoliday(page, ISO); say('holiday', h); say('afterHoliday', { inputs: await inpBrief(page, iid) }) }
let b = await F.bundle('0-before', iid, { oil: true }); say('before', F.pickLines(b))
await toWeek(page)
const wd = weekDayLoc(page, DI)
const dialogs = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"], .airpop, [role="dialog"], .upconf-pop, .modal, .sheet')].filter(e => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none').map(e => (e.getAttribute('data-testid') || e.className) + ': ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 100)))
let m = await toastMark(page)
await drag(page, page.locator('#eRoster .rpuck[data-person="nick"]').first(), wd.locator('.sec-grnd .pl-row.gr-frominput .addz').first())
await page.waitForTimeout(500)
const sheet = page.locator('[data-testid="oilconf"]')
const opened = await sheet.count()
const sheetInfo = opened ? await page.evaluate(() => { const s = document.querySelector('[data-testid="oilconf"]'); return { text: s.innerText.replace(/\s+/g, ' ').slice(0, 420), buttons: [...s.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid')) } }) : null
say('drop', { toast: await toastsSince(page, m), questionOpened: opened, sheet: sheetInfo, inputs: await inpBrief(page, iid) })
if (opened) { await shot(page, `A${WHICH}-question`); F.pics.push(`A${WHICH}-question.png`) }
if (WHICH === '7' && opened) {
  const yes = sheet.locator('[data-testid="oil-yes"]'), all = sheet.locator('[data-testid="oil-all"]')
  await ((await yes.count()) ? yes : all).click()
  await sheet.locator('[data-testid="oilconf-save"]').click(); await page.waitForTimeout(600)
  say('answered', { toast: await toastNow(page), dialogsAfter: await dialogs() })
} else if (WHICH === '8' && opened) {
  await sheet.locator('button.x[aria-label="Close"]').click(); await page.waitForTimeout(600)
  say('closed', { dialogsAfter: await dialogs(), toast: await toastNow(page), inputs: await inpBrief(page, iid) })
  await shot(page, 'A8-after-close'); F.pics.push('A8-after-close.png')
}
b = await F.bundle('1-after', iid); say('after', F.pickLines(b))
/* OIL Earn text for the row: the item's own tooltip, and what the pucks say */
await openBoard(page, DI); await oilOn(page)
const items = await page.evaluate(iid => [...document.querySelectorAll(`#schedBoard [data-oilitem="i:${iid}"]`)].filter(e => e.offsetParent).map(e => (e.getAttribute('data-oilp') ? 'puck ' + e.getAttribute('data-oilp') : 'item') + ' ' + (/\bon\b/.test(e.className) ? 'ON' : 'off') + ' | ' + (e.getAttribute('title') || '') + ' | ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 60)), iid)
const chip = await page.evaluate(() => { const o = document.querySelector('#schedBoard .oilbar-head, #schedBoard [class*="oilmode"], #schedBoard .sb-oil'); return (document.body.innerText.match(/OIL EARN[\s\S]{0,260}/) || [''])[0].replace(/\s+/g, ' ') })
say('oilearn', { items, chip })
await page.screenshot({ path: join(OUT, `A${WHICH}-oilearn.png`) }); F.pics.push(`A${WHICH}-oilearn.png`)
if (WHICH === '9') {
  /* Saber switches Tally ON in OIL Earn */
  const pk = page.locator(`#schedBoard [data-oilitem="i:${iid}"][data-oilp="nick"]:visible`).first()
  m = await toastMark(page)
  await pk.click(); await page.waitForTimeout(700)
  say('switchTallyOn', { toast: await toastsSince(page, m), oil: await oilRead(page, iid) })
  await page.screenshot({ path: join(OUT, 'A9-tally-on.png') }); F.pics.push('A9-tally-on.png')
  await oilOff(page)
  let u = await F.U('undo'); b = await F.bundle('2-undo', iid); say('undo', { ...u, ...F.pickLines(b) })
  u = await F.U('redo'); b = await F.bundle('3-redo', iid); say('redo', { ...u, ...F.pickLines(b) })
  await reload(page, 'ad', 'a'); b = await F.bundle('4-reload', iid); say('reload', F.pickLines(b))
} else if (WHICH === '7') {
  await oilOff(page)
  let u = await F.U('undo'); b = await F.bundle('2-undo', iid); say('undo', { ...u, dialogs: await dialogs(), ...F.pickLines(b) })
  u = await F.U('redo'); b = await F.bundle('3-redo', iid); say('redo', { ...u, dialogs: await dialogs(), ...F.pickLines(b) })
  const u1 = await F.U('undo'); const u2 = await F.U('undo'); b = await F.bundle('4-undo2', iid); say('undo-twice', { u1, u2, ...F.pickLines(b) })
  const r1 = await F.U('redo'); const r2 = await F.U('redo'); b = await F.bundle('5-redo2', iid); say('redo-twice', { r1, r2, ...F.pickLines(b) })
} else {
  await oilOff(page)
  /* Ranger's bell */
  await closeBoard(page)
  await signOut(page); await signIn(page, 'us', 'us'); await page.waitForTimeout(400)
  const bell = await page.evaluate(() => { const b = document.querySelector('#notifyBell'); return b ? { lit: b.classList.contains('on'), vis: !!b.offsetParent } : null })
  say('rangerBell', bell)
  await shot(page, 'A8-ranger-top'); F.pics.push('A8-ranger-top.png')
  await page.locator('#notifyBell').click(); await page.waitForTimeout(700)
  say('rangerBellTap', { toast: await toastNow(page), questionOpen: await page.locator('[data-testid="oilconf"]').count(), listOpen: await page.locator('.bell-list').count(), sheet: await page.evaluate(() => { const s = document.querySelector('[data-testid="oilconf"]'); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 300) : null }) })
  await shot(page, 'A8-ranger-tap'); F.pics.push('A8-ranger-tap.png')
  /* and Saber's own bell (he closed the question) */
  await signOut(page); await signIn(page, 'ad', 'a'); await page.waitForTimeout(400)
  const sb = await page.evaluate(() => { const b = document.querySelector('#notifyBell'); return b ? { lit: b.classList.contains('on'), vis: !!b.offsetParent } : null })
  await page.locator('#notifyBell').click(); await page.waitForTimeout(700)
  say('saberBellTap', { bell: sb, toast: await toastNow(page), questionOpen: await page.locator('[data-testid="oilconf"]').count(), listOpen: await page.locator('.bell-list').count(), lines: await page.evaluate(() => [...document.querySelectorAll('.bell-list .bl-line')].map(e => e.innerText.replace(/s+/g, ' '))) })
  await shot(page, 'A8-saber-tap'); F.pics.push('A8-saber-tap.png')
}
writeFileSync(join(SCR, `A${WHICH}.json`), JSON.stringify({ R, pics: F.pics }, null, 1))
console.log('PICS ' + JSON.stringify(F.pics))
console.log(JSON.stringify(errs))
await browser.close()
