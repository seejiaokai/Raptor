/* Walker D, world 6: P4c-16 — the Tracker's dialogs and the Leave War's bid sheet keep their own keyboard handling after the schedule was edited. */
import * as H from './stk-D-lib.mjs'
const { open, nav, boxList, clickBox, caret, label, sleep, pic, row, savePart, scopeSel, snap } = H
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false, state: process.env.STK_STATE })
page.setDefaultTimeout(9000)
async function S(id, did, fn) {
  try {
    const r = await fn()
    const bad = r.checks.filter(c => !c[1])
    row(id, did, r.checks.map(c => `${c[1] ? '✓' : '✗'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])).slice(0, 500) + ']' : ''}`).join(' · '), r.verdict || (bad.length ? 'FAIL' : 'PASS'), r.pics || [])
  } catch (e) { row(id, did, 'ERROR ' + String(e.message || e).slice(0, 500), 'NOT WALKED (script error — re-run)', [await pic(page, 'ERR-' + id)]) }
  savePart('world6')
}
const where = () => page.evaluate(() => {
  const e = document.activeElement; if (!e || e === document.body) return { body: true, in: false, desc: 'BODY' }
  const d = e.closest('#dlgModal,.bidsheet,[role=dialog],dialog,.modal')
  const sched = !!e.closest('#eWeek,#schedBoard,#vWeek')
  return { body: false, in: !!d, sched, desc: e.tagName + (e.id ? '#' + e.id : '') + '.' + String(e.className).slice(0, 14) + ' "' + (e.innerText || e.value || '').toString().trim().slice(0, 14) + '"' }
})
const sched = () => page.evaluate(() => JSON.stringify([window.DAYS, window.INPUTS, window.SCHED]))
const typeNow = async txt => { await page.keyboard.press('Control+A'); await page.keyboard.type(txt, { delay: 6 }) }
// 1. edit the schedule through the keyboard (the schedule routing has been used)
await nav(page, 'editsched')
const wk = scopeSel('week', 0)
{ const list = await boxList(page, wk); const ix = list.findIndex(b => b.key === 'ff:0.0.0.cs'); await clickBox(page, wk, ix); await typeNow('ZED'); await page.keyboard.press('Tab'); await sleep(400); await page.keyboard.press('Tab'); await sleep(200) }
const afterEdit = await page.evaluate(() => window.DAYS[0].waves[0].formations[0].cs)
console.log('schedule edited, callsign now', afterEdit)
const base = await sched()

async function tour(name, openFn, { n = 24 } = {}) {
  await openFn(); await sleep(600)
  const pics = [await pic(page, `P4c-16-${name}-open`)]
  const first = await where()
  const fwd = [], back = []
  for (let i = 0; i < n; i++) { await page.keyboard.press('Tab'); await sleep(50); fwd.push(await where()) }
  for (let i = 0; i < n; i++) { await page.keyboard.press('Shift+Tab'); await sleep(50); back.push(await where()) }
  pics.push(await pic(page, `P4c-16-${name}-after-tabs`))
  const leaks = [...fwd, ...back].filter(w => !w.in)
  const toSched = [...fwd, ...back].filter(w => w.sched)
  return { first, fwd, back, leaks, toSched, pics }
}
await nav(page, 'tracker'); await sleep(1200)
await S('P4c-16-tracker-picker', 'After the schedule edit: Tracker → "+ Add" student picker: Tab ×24, Shift+Tab ×24, then typed zz + Enter, then Escape', async () => {
  const t = await tour('tracker-add', async () => { await page.locator('#addStu').click() })
  // Enter and Escape
  await page.locator('#dlgFilter').focus().catch(() => {}); await typeNow('zz'); await page.keyboard.press('Enter'); await sleep(500)
  const afterEnter = await page.locator('#dlgModal').isVisible().catch(() => false)
  await page.keyboard.press('Escape'); await sleep(500)
  const afterEsc = await page.locator('#dlgModal').isVisible().catch(() => false)
  const pics = [...t.pics, await pic(page, 'P4c-16-tracker-add-after-escape')]
  return { checks: [
    ['focus starts in the dialog (its filter box) and every Tab and Shift+Tab stop (48) stays inside the dialog', t.first.in && t.leaks.length === 0, { first: t.first.desc, leaks: t.leaks.slice(0, 3).map(l => l.desc) }],
    ['no stop ever lands in the schedule', t.toSched.length === 0],
    ['Enter after typing zz: dialog state (open?), Escape closes it', afterEsc === false, { openAfterEnter: afterEnter, openAfterEscape: afterEsc }],
    ['the schedule is as the edit left it (nothing committed by Tab/Enter/Escape in the dialog)', (await sched()) === base],
  ], pics }
})
await S('P4c-16-tracker-details', 'Tracker → ⓘ details: Tab ×24, Shift+Tab ×24, Escape', async () => {
  const t = await tour('tracker-details', async () => { await page.locator('#detailsBtn').click() })
  const open1 = await page.evaluate(() => [...document.querySelectorAll('#dlgModal,.modal,[role=dialog],.card.open,.pop')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.id || e.className.toString().slice(0, 20)))
  await page.keyboard.press('Escape'); await sleep(400)
  const open2 = await page.evaluate(() => [...document.querySelectorAll('#dlgModal,.modal,[role=dialog]')].filter(e => e.getBoundingClientRect().width > 0).length)
  return { checks: [
    ['what opened (for the record)', true, { first: t.first.desc, overlays: open1 }],
    ['the Tab and Shift+Tab stops: how many left the dialog / entered the schedule', t.toSched.length === 0, { outside: t.leaks.length, intoSchedule: t.toSched.length, sample: t.leaks.slice(0, 3).map(l => l.desc) }],
    ['Escape closes it', open2 === 0, open2],
    ['the schedule is as the edit left it', (await sched()) === base],
  ], pics: t.pics }
})
await S('P4c-16-tracker-event', 'Tracker → pressed the ST-01 event ball (mouse press on the chart): looked for the event dialog, Tab ×24, Shift+Tab ×24, Enter, Escape', async () => {
  const overlays = () => page.evaluate(() => [...document.querySelectorAll('#dlgModal,.modal,[role=dialog],dialog,.evpop,.popover,.evdlg,[class*=dialog],[class*=popup]')].filter(e => e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden').map(e => (e.id || '') + '.' + String(e.className).slice(0, 24) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)))
  const before = await overlays()
  const bb = await page.getByText('ST-01', { exact: true }).first().boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(900)
  const opened = await overlays()
  const t = await (async () => { const pics = [await pic(page, 'P4c-16-tracker-event-open')]; const first = await where(); const fwd = [], back = []; for (let i = 0; i < 24; i++) { await page.keyboard.press('Tab'); await sleep(50); fwd.push(await where()) } for (let i = 0; i < 24; i++) { await page.keyboard.press('Shift+Tab'); await sleep(50); back.push(await where()) } pics.push(await pic(page, 'P4c-16-tracker-event-after-tabs')); const all = [...fwd, ...back]; return { pics, first, leaks: all.filter(w => !w.in), toSched: all.filter(w => w.sched) } })()
  await page.keyboard.press('Enter'); await sleep(400)
  const afterEnter = await overlays()
  await page.keyboard.press('Escape'); await sleep(500)
  const afterEsc = await overlays()
  return { checks: [
    ['what the press opened (overlays before / after)', true, { before, opened, firstFocus: t.first.desc }],
    ['no Tab / Shift+Tab stop (48) ever landed in the schedule', t.toSched.length === 0, { outsideOverlay: t.leaks.length, intoSchedule: t.toSched.length }],
    ['after Enter and then Escape: overlays', true, { afterEnter, afterEsc }],
    ['the schedule is as the edit left it', (await sched()) === base],
  ], pics: t.pics }
})
await nav(page, 'leavewar'); await sleep(1500)
await S('P4c-16-lw-bidsheet', 'After the schedule edit: Leave War → clicked a cell of Saber\'s row (the bid sheet): Tab ×24, Shift+Tab ×24, Enter on the first control, Escape', async () => {
  const id = await page.evaluate(() => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === 'Saber')[0])
  const t = await tour('lw-sheet', async () => { const c = page.locator(`[data-testid^="cell-${id}-2026-08-1"]`).first(); await c.scrollIntoViewIfNeeded().catch(() => {}); await c.click({ force: true }) })
  const openA = await page.locator('.bidsheet').isVisible().catch(() => false)
  // Enter on the first control reached by Tab from a closed start: close button
  await page.keyboard.press('Escape'); await sleep(500)
  const closedByEsc = !(await page.locator('.bidsheet').isVisible().catch(() => false))
  // reopen and press Enter on the close button
  const c = page.locator(`[data-testid^="cell-${id}-2026-08-1"]`).first(); await c.click({ force: true }); await sleep(600)
  await page.keyboard.press('Tab'); await sleep(100); const f1 = await where(); await page.keyboard.press('Enter'); await sleep(500)
  const closedByEnter = !(await page.locator('.bidsheet').isVisible().catch(() => false))
  return { checks: [
    ['the sheet opens; first control reached by Tab (focus starts on the page body)', openA, { first: t.first.desc }],
    ['Tab / Shift+Tab stops that left the sheet (count of 48) and whether any entered the schedule', t.toSched.length === 0, { leftTheSheet: t.leaks.length, intoSchedule: t.toSched.length, sample: t.leaks.slice(0, 3).map(l => l.desc) }],
    ['Escape closes the sheet', closedByEsc, closedByEsc],
    ['Enter on the focused close button (' + f1.desc + ') closes it', closedByEnter, closedByEnter],
    ['the schedule is as the edit left it', (await sched()) === base],
  ], pics: t.pics }
})
console.log('ERRORS', JSON.stringify(errors))
row('ERRORS-world6', 'console / page errors / 4xx during world 6', errors.length ? errors.join(' || ') : 'none', errors.length ? 'FINDING' : 'PASS')
savePart('world6', { errors })
await browser.close()
