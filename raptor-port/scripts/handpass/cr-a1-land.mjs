/* Walker A1 — where does an Undo LAND? (28 Sep 26). Register AM39b: "One Undo for the whole app that takes you to where
   the change was". Four cases, each asserting the changed day is ON SCREEN after the Undo (and, where the board was
   open, that the board still holds the day): (A) the top bar, same week, the change on Monday while Friday is in view;
   (B) the board, same week, the board on Friday; (C) the top bar, another week (the change on Monday of week A while
   Thursday of week B is in view); (D) the board, another week. Weeks and days are moved through the app's own
   calendar ("Jump to a date"). HP_W=390 for the phone. */
import { openA1, book, door, boardOn, boardOff, boardText, txt, PHONE } from './cr-a1-lib.mjs'

const { browser, page, errors } = await openA1('a')
const bk = book('land')
const wk = () => page.evaluate(() => window.CURWEEK)
async function toDate(iso) {
  await boardOff(page)
  if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') { await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500) }
  await page.evaluate(() => window.scrollTo(0, 0))
  const cal = page.locator(PHONE ? '.filt-cal:visible, .wknav-mbtn:visible' : '.wk-cal:visible, button[aria-label="Jump to a date"]:visible').first()
  if (PHONE) await cal.tap().catch(() => cal.click()); else await cal.click()
  await page.waitForTimeout(500)
  const d = page.locator(`[data-wcal="${iso}"]:visible`).first()
  if (!(await d.count())) return 'NO DAY ' + iso
  if (PHONE) await d.tap().catch(() => d.click()); else await d.click()
  await page.waitForTimeout(1200)
  return 'ok'
}
/* the days of the edit week whose card is at least half on screen, left to right */
const daysOnScreen = () => page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day]')].filter(d => {
  const r = d.getBoundingClientRect(); const vis = Math.min(r.right, innerWidth) - Math.max(r.left, 0); return vis > r.width / 2 }).map(d => +d.dataset.day))
/* is the day's first overall note (dn:di.0) actually on screen (inside the window, not covered)? */
const noteOnScreen = (di) => page.evaluate(i => {
  const e = [...document.querySelectorAll(`#eWeek [data-txt="dn:${i}.0"]`)][0]; if (!e) return 'not drawn'
  const r = e.getBoundingClientRect(); if (r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) return 'off screen'
  return 'on screen'
}, di)
const boardDay = () => page.evaluate(() => { const b = document.querySelector('#schedBoard'); return b && b.offsetWidth ? window.SBDAY : null })

/* (A) top bar, same week */
await toDate('2026-07-13')
await boardOn(page, 0); const a0 = await txt(page, 'dn:0.0'); await boardText(page, 'dn:0.0', 'LAND A'); await boardOff(page)
await toDate('2026-07-17')
const aBefore = await daysOnScreen()
const ua = await door(page, 'top', 'undo')
await page.waitForTimeout(800)
const aAfter = await daysOnScreen(), aNote = await noteOnScreen(0)
await page.evaluate(() => window.scrollTo(0, 0))
const pA = await bk.shot(page, 'A-top-same-week')
bk.ck('A', 'top bar, same week: the change on Monday, Friday in view → after Undo, Monday (where the change was) is on screen', (await txt(page, 'dn:0.0')) === a0 && aAfter.includes(0), { before: aBefore, after: aAfter, mondayNote: aNote, toast: ua.toasts }, pA)

/* (B) board, same week */
await boardOn(page, 0); await boardText(page, 'dn:0.0', 'LAND B')
await boardOn(page, 4)
const ub = await door(page, 'board', 'undo')
const bDay = await boardDay()
const pB = await bk.shot(page, 'B-board-same-week')
bk.ck('B', 'board, same week: the change on Monday, the board on Friday → after Undo the board is on Monday', (await txt(page, 'dn:0.0')) === a0 && bDay === 0, { boardDay: bDay, toast: ub.toasts }, pB)
await boardOff(page)

/* (C) top bar, another week */
await toDate('2026-07-13')
await boardOn(page, 0); await boardText(page, 'dn:0.0', 'LAND C'); await boardOff(page)
await toDate('2026-07-23')
const cBefore = { wk: await wk(), days: await daysOnScreen() }
const uc = await door(page, 'top', 'undo')
await page.waitForTimeout(900)
const cAfter = { wk: await wk(), days: await daysOnScreen(), note: await noteOnScreen(0) }
await page.evaluate(() => window.scrollTo(0, 0))
const pC = await bk.shot(page, 'C-top-other-week')
bk.ck('C', 'top bar, another week: the change on Monday 13 Jul, Thursday 23 Jul in view → after Undo, week of 13 Jul with Monday on screen', cAfter.wk === '13/07/2026' && (await txt(page, 'dn:0.0')) === a0 && cAfter.days.includes(0), { before: cBefore, after: cAfter, toast: uc.toasts }, pC)

/* (D) board, another week */
await boardOn(page, 0); await boardText(page, 'dn:0.0', 'LAND D'); await boardOff(page)
await toDate('2026-07-23')
await boardOn(page, 3)
const ud = await door(page, 'board', 'undo')
await page.waitForTimeout(900)
const dAfter = { wk: await wk(), board: await boardDay(), days: await daysOnScreen(), note: await noteOnScreen(0) }
await page.evaluate(() => window.scrollTo(0, 0))
const pD = await bk.shot(page, 'D-board-other-week')
bk.ck('D', 'board, another week: the change on Monday 13 Jul, the board on Thursday 23 Jul → after Undo, Monday 13 Jul on the board (or on screen)', dAfter.wk === '13/07/2026' && (await txt(page, 'dn:0.0')) === a0 && (dAfter.board === 0 || (dAfter.board == null && dAfter.days.includes(0))), { after: dAfter, toast: ud.toasts }, pD)
bk.note('D-door', { what: 'after the board\'s Undo crossed the week, is the board (and its Redo) still there?', boardOpen: dAfter.board != null, redo: await page.evaluate(() => { const b = [...document.querySelectorAll('#sbRedo, #redoBtn')].find(x => x.offsetParent); return b ? `${b.id} ${b.disabled ? 'off' : 'on'} "${b.title}"` : 'none visible' }) })

bk.save(errors)
await browser.close()
