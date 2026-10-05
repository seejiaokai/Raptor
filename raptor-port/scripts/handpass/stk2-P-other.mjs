/* Walker P re-walk: P4c-16 — the Tracker's dialogs and the Leave War's bid sheet keep their own keyboard handling after the schedule was edited with the keyboard.
   Each in a fresh world. */
import * as R from './stk2-P-run.mjs'
const { S, finish, nav, boxList, clickBox, caret, label, sleep, pic, scopeSel, snap, typeNow } = R
const PART = 'other' + (process.env.ONLY ? '-' + process.env.ONLY : '')
const where = page => page.evaluate(() => {
  const e = document.activeElement; if (!e || e === document.body) return { body: true, in: false, desc: 'BODY' }
  const d = e.closest('#dlgModal,.bidsheet,[role=dialog],dialog,.modal')
  const sched = !!e.closest('#eWeek,#schedBoard,#vWeek')
  return { body: false, in: !!d, sched, desc: e.tagName + (e.id ? '#' + e.id : '') + '.' + String(e.className).slice(0, 14) + ' "' + (e.innerText || e.value || '').toString().trim().slice(0, 14) + '"' }
})
const sched = page => page.evaluate(() => JSON.stringify([window.DAYS, window.INPUTS, window.SCHED]))
async function editSchedule(page) {
  await nav(page, 'editsched')
  const wk = scopeSel('week', 0)
  const list = await boxList(page, wk); const ix = list.findIndex(b => b.key === 'ff:0.0.0.cs'); await clickBox(page, wk, ix); await typeNow(page, 'ZED'); await page.keyboard.press('Tab'); await sleep(400); await page.keyboard.press('Tab'); await sleep(200)
  return page.evaluate(() => window.DAYS[0].waves[0].formations[0].cs)
}
async function tour(page, name, openFn, n = 24) {
  await openFn(); await sleep(600)
  const pics = [await pic(page, `P4c-16-${name}-open`)]
  const first = await where(page)
  const fwd = [], back = []
  for (let i = 0; i < n; i++) { await page.keyboard.press('Tab'); await sleep(50); fwd.push(await where(page)) }
  for (let i = 0; i < n; i++) { await page.keyboard.press('Shift+Tab'); await sleep(50); back.push(await where(page)) }
  pics.push(await pic(page, `P4c-16-${name}-after-tabs`))
  const all = [...fwd, ...back]
  return { first, fwd, back, leaks: all.filter(w => !w.in), toSched: all.filter(w => w.sched), pics }
}
const overlays = page => page.evaluate(() => [...document.querySelectorAll('#dlgModal,.modal,[role=dialog],dialog,.evpop,.popover,.evdlg,[class*=dialog],[class*=popup]')].filter(e => e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden').map(e => (e.id || '') + '.' + String(e.className).slice(0, 24) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)))

if (!process.env.ONLY) await S(PART, 'P4c-16-tracker-picker', 'Schedule edited by keyboard (callsign ZED, Tab); Tracker → "+ Add" student picker: Tab x24, Shift+Tab x24, typed zz + Enter, then Escape', {}, async page => {
  const cs = await editSchedule(page); const base = await sched(page)
  await nav(page, 'tracker'); await sleep(1200)
  const t = await tour(page, 'tracker-add', async () => { await page.locator('#addStu').click() })
  await page.locator('#dlgFilter').focus().catch(() => {}); await typeNow(page, 'zz'); await page.keyboard.press('Enter'); await sleep(500)
  const afterEnter = await page.locator('#dlgModal').isVisible().catch(() => false)
  await page.keyboard.press('Escape'); await sleep(500)
  const afterEsc = await page.locator('#dlgModal').isVisible().catch(() => false)
  const pics = [...t.pics, await pic(page, 'P4c-16-tracker-add-after-escape')]
  return { checks: [
    ['setup: the schedule was edited with the keyboard (callsign now ' + cs + ')', cs === 'ZED'],
    ['focus starts in the dialog and every Tab and Shift+Tab stop (48) stays inside the dialog', t.first.in && t.leaks.length === 0, { first: t.first.desc, leaks: t.leaks.slice(0, 3).map(l => l.desc) }],
    ['no stop ever lands in the schedule', t.toSched.length === 0],
    ['Enter after typing zz; Escape closes the dialog', afterEsc === false, { openAfterEnter: afterEnter, openAfterEscape: afterEsc }],
    ['the schedule is as the edit left it (nothing committed by Tab/Enter/Escape in the dialog)', (await sched(page)) === base],
  ], pics }
})
if (!process.env.ONLY) await S(PART, 'P4c-16-tracker-details', 'Schedule edited by keyboard; Tracker → ⓘ details: Tab x24, Shift+Tab x24, Escape', {}, async page => {
  await editSchedule(page); const base = await sched(page)
  await nav(page, 'tracker'); await sleep(1200)
  const t = await tour(page, 'tracker-details', async () => { await page.locator('#detailsBtn').click() })
  const open1 = await overlays(page)
  await page.keyboard.press('Escape'); await sleep(400)
  const open2 = await page.evaluate(() => [...document.querySelectorAll('#dlgModal,.modal,[role=dialog]')].filter(e => e.getBoundingClientRect().width > 0).length)
  return { checks: [
    ['what opened (for the record)', true, { first: t.first.desc, overlays: open1 }],
    ['no Tab / Shift+Tab stop (48) entered the schedule; how many left the dialog', t.toSched.length === 0, { outside: t.leaks.length, intoSchedule: t.toSched.length, sample: t.leaks.slice(0, 3).map(l => l.desc) }],
    ['Escape closes it', open2 === 0, open2],
    ['the schedule is as the edit left it', (await sched(page)) === base],
  ], pics: t.pics }
})
if (!process.env.ONLY || process.env.ONLY === 'event') await S(PART, 'P4c-16-tracker-event', 'Schedule edited by keyboard; Tracker → pressed the ST-01 event ball: Tab x24, Shift+Tab x24, Enter, Escape', {}, async page => {
  await editSchedule(page); const base = await sched(page)
  await nav(page, 'tracker'); await sleep(1200)
  const before = await overlays(page)
  const bb = await page.getByText('ST-01', { exact: true }).first().boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(900)
  const opened = await overlays(page)
  const popAfterPress = await page.locator('#pop').isVisible().catch(() => false)
  const pics = [await pic(page, 'P4c-16-tracker-event-open')]; const first = await where(page); const fwd = [], back = []
  for (let i = 0; i < 24; i++) { await page.keyboard.press('Tab'); await sleep(50); fwd.push(await where(page)) }
  for (let i = 0; i < 24; i++) { await page.keyboard.press('Shift+Tab'); await sleep(50); back.push(await where(page)) }
  pics.push(await pic(page, 'P4c-16-tracker-event-after-tabs'))
  const all = [...fwd, ...back]
  await page.keyboard.press('Enter'); await sleep(400)
  const afterEnter = await overlays(page)
  await page.keyboard.press('Escape'); await sleep(500)
  const afterEsc = await overlays(page)
  const popOpen = () => page.locator('#pop').isVisible().catch(() => false)
  return { checks: [
    ['the press on the ST-01 ball opened the event / student mark popup (#pop, "ST-01 · STUDENT A", Edit details)', popAfterPress, { overlays: opened, firstFocus: first.desc }],
    ['no Tab / Shift+Tab stop (48) ever landed in the schedule (the popup is not a trap: the stops go on through the Tracker\'s own controls — count outside the popup: ' + all.filter(w => !w.in).length + ')', all.filter(w => w.sched).length === 0, { intoSchedule: all.filter(w => w.sched).length }],
    ['Enter, then Escape: the popup state (Escape closes it)', await popOpen() === false, { afterEnterOverlays: afterEnter, popupAfterEscape: await popOpen() }],
    ['the schedule is as the edit left it', (await sched(page)) === base],
  ], pics }
})
if (!process.env.ONLY) await S(PART, 'P4c-16-lw-bidsheet', 'Schedule edited by keyboard; Leave War → clicked a cell of Saber\'s row (the bid sheet): Tab x24, Shift+Tab x24, Escape; reopened and pressed Tab then Enter on the first control', {}, async page => {
  await editSchedule(page); const base = await sched(page)
  await nav(page, 'leavewar'); await sleep(1500)
  const id = await page.evaluate(() => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === 'Saber')[0])
  const t = await tour(page, 'lw-sheet', async () => { const c = page.locator(`[data-testid^="cell-${id}-2026-08-1"]`).first(); await c.scrollIntoViewIfNeeded().catch(() => {}); await c.click({ force: true }) })
  const openA = await page.locator('.bidsheet').isVisible().catch(() => false)
  await page.keyboard.press('Escape'); await sleep(500)
  const closedByEsc = !(await page.locator('.bidsheet').isVisible().catch(() => false))
  const c = page.locator(`[data-testid^="cell-${id}-2026-08-1"]`).first(); await c.click({ force: true }); await sleep(600)
  await page.keyboard.press('Tab'); await sleep(100); const f1 = await where(page); await page.keyboard.press('Enter'); await sleep(500)
  const closedByEnter = !(await page.locator('.bidsheet').isVisible().catch(() => false))
  return { checks: [
    ['the sheet opens', openA, { first: t.first.desc }],
    ['no Tab / Shift+Tab stop of 48 entered the schedule; how many left the sheet', t.toSched.length === 0, { leftTheSheet: t.leaks.length, intoSchedule: t.toSched.length, sample: t.leaks.slice(0, 3).map(l => l.desc) }],
    ['Escape closes the sheet', closedByEsc, closedByEsc],
    ['Enter on the focused first control (' + f1.desc + ') closes it', closedByEnter, closedByEnter],
    ['the schedule is as the edit left it', (await sched(page)) === base],
  ], pics: t.pics }
})
await finish(PART)
