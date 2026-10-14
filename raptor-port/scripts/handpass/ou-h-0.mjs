/* The helper's own readers for the small OIL job walk (ou-h-<n>.mjs): the board's pending/sign-off state, the bells,
   the lists and a member sign-in. Built on ou-lib.mjs. Nothing here edits the app. */
export * from './ou-lib.mjs'
import { L, list, noteNow, board, closeBoard, file, mark, rowBtn, makeHoliday, closeWindows, fillForm, FRI, FRI_ISO } from './ou-lib.mjs'
import { publish } from './lib.mjs'
export { publish }
export const J = x => JSON.stringify(x)
export const undo = async p => { await p.evaluate(() => { const b = [...document.querySelectorAll('#sbUndo, #undoBtn')].find(e => e.getClientRects().length && !e.disabled); if (b) b.click() }); await L.sleep(650) }
export const redo = async p => { await p.evaluate(() => { const b = [...document.querySelectorAll('#sbRedo, #redoBtn')].find(e => e.getClientRects().length && !e.disabled); if (b) b.click() }); await L.sleep(650) }

/** the open Scheduler Board's day-head state: version chip, pending count/chip, publish button and sign-off selects */
export const bstate = p => p.evaluate(() => {
  const b = document.querySelector('#schedBoard'); if (!b || b.hidden) return null
  const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : null
  const beak = b.querySelector('[data-beak]'), alpub = b.querySelector('[data-alpub]')
  return { chip: t(b.querySelector('.verchip')), pend: t(b.querySelector('.dpend')), so: t(b.querySelector('.so-state')), nys: t(b.querySelector('.nysmark')), plan: t(b.querySelector('.psl')), beak: beak ? { t: t(beak), dis: beak.disabled } : null, alpub: alpub ? { t: t(alpub), dis: alpub.disabled } : null }
})
/** open the bell (the visible one) and read its lines; closes it again with Escape */
export async function bellLines(w, { keepOpen = false } = {}) {
  const p = w.page
  const sel = await p.evaluate(() => { const b = [...document.querySelectorAll('#sbBell, #notifyBell')].find(e => e.getClientRects().length); return b ? '#' + b.id : null })
  if (!sel) return { error: 'no visible bell' }
  const badge = await p.evaluate(s => { const e = document.querySelector(s); const d = e.querySelector('.bdot, .bcount, .badge, [class*=dot], [class*=count]'); return { text: (e.innerText || '').replace(/\s+/g, ' ').trim(), dot: !!d && d.getClientRects().length > 0, cls: String(e.className) } }, sel)
  await p.locator(sel).evaluate(e => e.click()); await L.sleep(500)
  const txt = await p.evaluate(() => { const e = document.querySelector('[data-testid="bell-list"]'); return e && e.getClientRects().length ? (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1500) : null })
  return { sel, badge, txt }
}
export async function closeBell(w) { await w.page.keyboard.press('Escape'); await L.sleep(250) }
/** the bell: its count badge and its lines */
export async function bell(p, open = true) {
  const info = await p.evaluate(() => {
    const b = document.querySelector('#bellBtn, [data-testid="bell"], .bell, #tbBell')
    return b ? { id: b.id, tid: b.getAttribute('data-testid'), cls: String(b.className).slice(0, 60), text: (b.innerText || '').replace(/\s+/g, ' ').trim() } : null
  })
  return info
}
/** sign out through the top bar's Logout, sign in as someone else in the same browser world */
export async function signAs(w, user, pass) {
  const p = w.page
  const lg = p.locator('#logoutBtn, [data-testid="logout"], button:has-text("Logout")').first()
  await lg.evaluate(e => e.click()).catch(() => {})
  await p.waitForSelector('#luser', { state: 'visible', timeout: 8000 })
  await p.fill('#luser', user); await p.fill('#lpass', pass)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await L.sleep(500)
}
/** how an input's title is drawn inside a scope: how many places, whether any is struck through / wears a CX tag */
export const faces = (p, scope, title) => p.evaluate(([scope, title]) => {
  const root = document.querySelector(scope); if (!root) return { error: 'no ' + scope }
  const hits = [...root.querySelectorAll('*')].filter(e => e.children.length === 0 && (e.textContent || '').toLowerCase().includes(title.toLowerCase()) && e.getClientRects().length)
  const struck = hits.filter(e => { let x = e; for (let i = 0; i < 4 && x; i++, x = x.parentElement) if (/line-through/.test(getComputedStyle(x).textDecorationLine)) return true; return false }).length
  const rows = hits.map(e => e.closest('tr, .grow, .gr, li, .ground-row, [class*=row]') || e.parentElement)
  const cx = rows.filter(r => r && (/\bcx\b/i.test(String(r.className)) || [...r.querySelectorAll('*')].some(c => /^CX$/.test((c.textContent || '').trim()) && /tag|chip|cx/i.test(String(c.className))))).length
  return { n: hits.length, struck, cxrows: cx, ctx: rows[0] ? (rows[0].innerText || '').replace(/\s+/g, ' ').slice(0, 120) : '' }
}, [scope, title])
/** open the day's pending-changes window from the board's "N pending" chip and read it */
export async function pendText(w) {
  const p = w.page
  const ok = await p.evaluate(() => { const b = document.querySelector('#schedBoard [data-pendlist]'); if (!b) return false; b.click(); return true })
  if (!ok) return { opened: false, txt: null }
  await L.sleep(600)
  const txt = await p.evaluate(() => {
    const c = [...document.querySelectorAll('*')].filter(e => e.getClientRects().length && /Waiting to go out/i.test(e.innerText || ''))
    c.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)
    let e = c[0]; for (let i = 0; e && i < 8 && !/Tap a change/.test(e.innerText || ''); i++) e = e.parentElement; return e ? (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 600) : null
  })
  return { opened: true, txt }
}
export async function closePend(w) { await w.page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(b => b.getClientRects().length && /^[✕×]$/.test((b.textContent || '').trim()) && b.closest('[class*=win], .airpop')); if (x) x.click() }); await L.sleep(300) }
import { inputsCal, openAdd } from './ou-lib.mjs'
/** open a day's window on the Inputs calendar and read one input's row (tags, strike, text); closes the window */
export async function cardOf(w, iso, id) {
  const p = w.page
  await inputsCal(w, iso.slice(0, 8) + '13')
  await p.locator(`[data-icday="${iso}"]`).focus(); await p.keyboard.press('Enter')
  await p.waitForSelector('[data-testid="win-inputsday"]'); await L.sleep(400)
  const r = await p.evaluate(id => {
    const row = document.querySelector(`[data-testid="idy-row-${id}"]`); if (!row) return null
    const t = (row.innerText || '').replace(/\s+/g, ' ').trim()
    const struck = [...row.querySelectorAll('*')].some(e => /line-through/.test(getComputedStyle(e).textDecorationLine))
    return { text: t, oilq: /OIL\s*\?/.test(t), cx: /\bCX\b/.test(t), struck }
  }, id)
  return r
}
export async function closeDay(w) { const x = w.page.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.first().evaluate(e => e.click()); await L.sleep(250) }
/** file a Training input for SEVERAL people (callsigns) as whoever is signed in; answers the OIL question where asked */
export async function fileSev(w, iso, names, title, { oil = 'yes', start = '09:00', end = '10:00' } = {}) {
  const p = w.page
  await inputsCal(w, iso.slice(0, 8) + '13')
  await openAdd(w, iso)
  await p.selectOption('#inpEditPop #inpEditType', 'Training')
  const sw = p.locator('#inpEditPop button.pp-sw'); if (!(await sw.evaluate(e => e.classList.contains('on')))) await w.press('#inpEditPop button.pp-sw')
  await L.sleep(300)
  for (const n of names) {
    const b = p.locator('#inpEditPop button.pp-puck').filter({ hasText: new RegExp('^' + n + '(?![a-z])') }).first()
    if (!(await b.evaluate(e => e.classList.contains('on')))) { await w.press(b); await L.sleep(150) }
  }
  const ad = p.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.click()
  await p.fill('#inpEditPop #inpEditStart', start); await p.fill('#inpEditPop #inpEditEnd', end)
  await p.fill('#inpEditPop #inpEditOwnTitle', title)
  const before = await p.evaluate(() => window.INPUTS.map(x => String(x.iid)))
  await w.press('#inpEditSave'); await L.sleep(800)
  let asked = false
  if (await p.locator('[data-testid="oilconf"]').count()) { asked = true; await w.press(`[data-testid="oil-${oil}"]`); await L.sleep(150); await w.press('[data-testid="oilconf-save"]'); await L.sleep(700) }
  const id = await p.evaluate(b => { const n = window.INPUTS.find(x => !b.includes(String(x.iid))); return n ? String(n.iid) : null }, before)
  await closeDay(w)
  return { id, asked }
}
/** a world on REAL storage (no "start fresh" address): a reload keeps what was saved. Same shape as L.world. */
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
export async function pworld(sizeKey, { who = ['ad', 'a'] } = {}) {
  const S = L.SIZES[sizeKey]
  const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
  const ctx = await browser.newContext({ viewport: { width: S.w, height: S.h }, deviceScaleFactor: S.dpr, ...(S.phone ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage(); const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  page.on('pageerror', e => errors.push(`PAGEERROR ${e.message}`))
  await page.goto(L.BASE + '/')
  await page.fill('#luser', who[0]); await page.fill('#lpass', who[1])
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await L.sleep(400)
  const press = async sel => { const l = typeof sel === 'string' ? page.locator(sel).first() : sel; if (S.phone) await l.tap(); else await l.click() }
  return { browser, ctx, page, errors, S, phone: S.phone, key: sizeKey, press }
}
/** the load's fixture on Friday 17 Jul, by the app's own controls (the designer's S24, trimmed to what the screens offer):
    A (Ranger, answered Yes in the holiday's list), B (three people, filed by Ranger), C (Nomad, Training), D (cancelled),
    E (an ALL AVAIL Event), F (leave); Friday published; Friday made a holiday; the list answered for A only ("Later"); then
    B, C and D taken off the board. Returns the ids and what each step showed. Ends signed in as the admin, board closed. */
export async function loadSetup(w) {
  const p = w.page, out = {}
  const sleep = L.sleep
  out.A = await file(w, FRI_ISO, 'bane', 'Range brief')
  await signAs(w, 'us', 'us')
  out.B = await fileSev(w, FRI_ISO, ['Ranger', 'Nomad', 'Ace'], 'Hangar brief', { start: '10:00', end: '11:00' })
  await signAs(w, 'ad', 'a')
  out.C = await file(w, FRI_ISO, 'pike', 'Engine brief', { start: '11:00', end: '12:00' })
  out.D = await file(w, FRI_ISO, 'dj', 'Range walk', { start: '13:00', end: '14:00' })
  await mark(w, FRI, out.D.id, 'cx')
  await inputsCal(w, '2026-07-13'); await openAdd(w, FRI_ISO)
  await p.selectOption('#inpEditPop #inpEditType', 'Event'); await sleep(200)
  await p.selectOption('#inpEditPop #inpEditPerson', { label: 'ALL AVAIL' }).catch(async () => { await p.selectOption('#inpEditPop #inpEditPerson', 'allavail') })
  const ad = p.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.click()
  await p.fill('#inpEditPop #inpEditStart', '14:00'); await p.fill('#inpEditPop #inpEditEnd', '15:00')
  if (await p.locator('#inpEditPop #inpEditOwnTitle').count()) await p.fill('#inpEditPop #inpEditOwnTitle', 'Crew briefing')
  const b4 = await p.evaluate(() => window.INPUTS.map(x => String(x.iid)))
  await w.press('#inpEditSave'); await sleep(800)
  out.E = { id: await p.evaluate(b => { const n = window.INPUTS.find(x => !b.includes(String(x.iid))); return n ? String(n.iid) : null }, b4) }
  await closeDay(w)
  await inputsCal(w, '2026-07-13'); await openAdd(w, FRI_ISO)
  await fillForm(w, { type: 'LL', person: 'bane', allday: true })
  const b5 = await p.evaluate(() => window.INPUTS.map(x => String(x.iid)))
  await w.press('#inpEditSave'); await sleep(800)
  out.F = { id: await p.evaluate(b => { const n = window.INPUTS.find(x => !b.includes(String(x.iid))); return n ? String(n.iid) : null }, b5) }
  await closeDay(w)
  await board(w, FRI)
  out.pub = await publish(p, FRI); await sleep(600)
  await closeBoard(w)
  out.hol = await makeHoliday(w, FRI_ISO)
  /* answer A in the list, the rest "Later" */
  if (out.hol.list) {
    await w.press(`[data-testid="odl-yes-${out.A.id}"]`); await sleep(150)
    await w.press('[data-testid="odl-save"]'); await sleep(600)
    if (await p.locator('[data-testid="win-oilday"]').count()) { await w.press('[data-testid="odl-later"]'); await sleep(300) }
  }
  await closeWindows(w)
  await board(w, FRI)
  for (const k of ['B', 'C', 'D']) { await rowBtn(w, FRI, out[k].id, 'grdel'); await sleep(300) }
  await closeBoard(w)
  return out
}
