// Walker C's shared helpers for the design-vet walk (scenarios 32-49, 51). Copied from the host's ivet-walk.mjs.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const OUT = 'docs/img/handpass/2026-10-10-inputs-vet-check/C'
mkdirSync(OUT, { recursive: true })
export const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f8905bb1-d460-47fc-a30d-aaee0833c81f/scratchpad'
mkdirSync(SCR, { recursive: true })
export const BASE = process.env.LOOK_URL || 'http://localhost:4233/'
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const WIN = '[data-testid="win-inputedit"]', DAYWIN = '[data-testid="win-inputsday"]'
export const errs = []
export const rows = []
export const PHONE = { width: 390, height: 844 }, DESK = { width: 1440, height: 900 }

/* a verdict row; pics are file names under OUT */
export function rec(n, size, role, verdict, note, pics = []) {
  const r = { n, size, role, verdict, note, pics }
  rows.push(r)
  console.log(`[${verdict}] ${n} (${size}, ${role}) — ${note}`)
  return r
}
export function savePartial(key) { writeFileSync(join(SCR, `ivet-C-${key}.json`), JSON.stringify(rows, null, 1)); rows.length = 0 }

/* a browser context, signed in. fresh=true opens ?fresh=1 (memory-only world); otherwise the plain address (kept in localStorage) */
export async function open(viewport, who = 'ad', pass = 'a', touch = false, { fresh = true, storageState = null, signIn = true } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}), ...(storageState ? { storageState } : {}) })
  const page = await ctx.newPage()
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 220)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 220)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  if (signIn) {
    await page.fill('#luser', who); await page.fill('#lpass', pass)
    await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day')
  }
  return { ctx, page }
}
export async function signInAs(page, who, pass) {
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
}
export const shot = async (p, name) => { await p.screenshot({ path: join(OUT, name + '.png') }); return name + '.png' }
export const press = (touch, loc) => (touch ? loc.tap() : loc.click())
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const count = p => p.evaluate(() => window.INPUTS.length)
export const ids = p => p.evaluate(() => window.INPUTS.map(r => r.iid))
export const newest = (p, had) => p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, person: r.person, cs: window.PEOPLE[r.person]?.cs, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, allday: r.allday, half: r.half, s: r.s, e: r.e, oil: r.oil || null, grp: r.grp || null, by: r.by, byCs: window.PEOPLE[r.by]?.cs, docs: (r.docIds || []).length || (r.docId ? 1 : 0) })), had)
export const toast = p => p.evaluate(() => (document.getElementById('toastEl')?.textContent || '').trim())
export const clearToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.textContent = '' })
export async function month(p, y, m, touch) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await press(touch, p.locator(d > 0 ? '#icNext' : '#icPrev'))
  }
  throw new Error('the calendar never reached the month asked for')
}
export async function toCal(p, touch, y = 2026, m = 7) {
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator(WIN).count()) { await press(touch, p.locator('#inpEditCancel')); await p.waitForTimeout(150) }
  if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inCalBtn'))
  await month(p, y, m, touch)
}
export async function toList(p, touch, all = true) {
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inListBtn'))
  if (all) {
    if (!(await p.locator('#inRangePop').count())) await press(touch, p.locator('#inRangeBtn'))
    await press(touch, p.locator('#inRangeAll')); await p.waitForTimeout(250)
    if (await p.locator('#inRangePop').count()) { await p.mouse.click(5, 5).catch(() => {}); await p.waitForTimeout(100) }
  }
}
export async function openDay(p, iso, touch, y, m) {
  await toCal(p, touch, +iso.slice(0, 4), +iso.slice(5, 7))
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await p.locator(DAYWIN).waitFor()
  await p.waitForTimeout(200)
}
export async function plus(p, touch) {
  if (await p.locator(WIN).count()) { await press(touch, p.locator('#inpEditCancel')); await p.waitForTimeout(150) }
  await press(touch, p.locator('#inNew'))
  await p.locator(WIN).waitFor()
}
export async function pick(p, iso, touch) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await press(touch, p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`))
  }
  await press(touch, p.locator(`#inpEdCal [data-cal="${iso}"]`))
}
export async function answerOil(p, touch, how) {
  const sheet = p.locator('[data-testid="oilconf"]')
  const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
  await press(touch, (await one.count()) ? one : many)
  await press(touch, sheet.locator('[data-testid="oilconf-save"]'))
}
/* file one input through "+ Input" on the List. spec: {type, person (cs), people:[cs...] (several), from, to (iso), title, rmk, timed:[s,e], touch}
   returns {made, window state}. Handles the OIL question (answer 'no') if it comes. */
export async function fileInput(p, spec, touch) {
  const id = cs => csId(p, cs)
  const had = await ids(p)
  await plus(p, touch)
  if (spec.type) await p.selectOption('#inpEditType', spec.type)
  if (spec.person) await p.selectOption('#inpEditPerson', await id(spec.person))
  if (spec.people) {
    await press(touch, p.locator(`${WIN} [data-testid="pp-several"]`))
    const want = []
    for (const cs of spec.people) { const pid = await id(cs); want.push(pid); const b = p.locator(`${WIN} [data-pp="${pid}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(touch, b) }
    const pressed = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), WIN)
    for (const pid of pressed) if (!want.includes(pid)) await press(touch, p.locator(`${WIN} [data-pp="${pid}"]`))
  }
  if (spec.from) await pick(p, spec.from, touch)
  if (spec.to) await pick(p, spec.to, touch)
  if (spec.timed) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await press(touch, p.locator('#inpEditAllday'))
    await p.fill('#inpEditStart', spec.timed[0]); await p.fill('#inpEditEnd', spec.timed[1])
  }
  if (spec.title != null) await p.fill('#inpEditOwnTitle', spec.title)
  if (spec.rmk != null) await p.fill('#inpEditRmk', spec.rmk)
  if (spec.beforeSave) await spec.beforeSave()
  await press(touch, p.locator('#inpEditSave'))
  await p.waitForTimeout(350)
  for (let k = 0; k < 3; k++) {
    if (await p.locator('[data-testid="oilconf"]').count()) await answerOil(p, touch, 'no')
    else if (await p.locator('[data-testid="docconf"]').count()) await press(touch, p.locator('[data-testid="docconf-nodoc"]'))
    else break
    await p.waitForTimeout(300)
  }
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  return newest(p, had)
}
/* the desktop row of an input, read part by part */
export const deskRow = (p, iid) => p.evaluate(iid => {
  const want = window.INPUTS.find(r => r.iid === iid); if (!want) return null
  const trs = [...document.querySelectorAll('#inBody tr[data-iid]')]
  const tr = trs.find(t => { const r = window.INPUTS.find(x => x.iid === t.getAttribute('data-iid')); return r && (r.iid === iid || (want.grp && r.grp === want.grp)) })
  if (!tr) return null
  const cell = l => tr.querySelector(`[data-label="${l}"]`)
  const name = cell('Name'), rmk = cell('Remarks')
  const btn = name?.querySelector('.in-open, [data-testid="in-open"]')
  const b = tr.getBoundingClientRect()
  const rmkText = rmk ? [...rmk.childNodes].filter(n => !(n.nodeType === 1 && (n.classList.contains('in-placed')))).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim() : null
  return { at: trs.indexOf(tr), lit: tr.classList.contains('innew'), name: btn ? btn.textContent : name?.textContent, nameHtml: name?.innerText, pill: tr.querySelector('.intag')?.textContent ?? null, by: rmk?.querySelector('.in-placed')?.textContent ?? '', rmk: rmkText, rmkFull: rmk?.innerText.replace(/\s+/g, ' ').trim(), h: Math.round(b.height), cols: ['Name', 'Start', 'End', 'Type', 'Remarks', 'Changed'].map(l => cell(l)?.innerText.replace(/\s+/g, ' ').trim()) }
}, iid)
/* a phone card read part by part */
export const phoneCard = (p, iid) => p.evaluate(iid => {
  const want = window.INPUTS.find(r => r.iid === iid); if (!want) return null
  const cs = [...document.querySelectorAll('[data-testid^="inl-row-"]')]
  const c = cs.find(t => { const r = window.INPUTS.find(x => 'inl-row-' + x.iid === t.getAttribute('data-testid')); return r && (r.iid === iid || (want.grp && r.grp === want.grp)) })
  if (!c) return null
  const t = k => c.querySelector(`[data-testid="${k}"]`)?.textContent ?? null
  const b = c.getBoundingClientRect()
  const day = (() => { let e = c.previousElementSibling; while (e && e.getAttribute('data-testid') !== 'inl-day') e = e.previousElementSibling; return e?.textContent ?? null })()
  return { who: t('inl-who'), kind: t('inl-kind'), when: t('inl-when'), title: t('inl-title'), rmk: t('inl-rmk'), by: t('inl-by'), lit: c.classList.contains('innew'), day, text: c.textContent.replace(/\s+/g, ' ').trim(), h: Math.round(b.height) }
}, iid)
/* an opened day's card */
export const dayCard = (p, iid) => p.evaluate(iid => {
  const want = window.INPUTS.find(r => r.iid === iid); if (!want) return null
  const cs = [...document.querySelectorAll('[data-testid^="idy-row-"]')]
  const c = cs.find(t => { const r = window.INPUTS.find(x => 'idy-row-' + x.iid === t.getAttribute('data-testid')); return r && (r.iid === iid || (want.grp && r.grp === want.grp)) })
  if (!c) return null
  const t = k => c.querySelector(`[data-testid="${k}"]`)?.textContent ?? null
  return { who: t('idy-who'), when: t('idy-when'), rmk: t('idy-rmk'), by: t('idy-by'), text: c.textContent.replace(/\s+/g, ' ').trim() }
}, iid)
export const wideOK = p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)

/* sign out of the page (desktop: #logout; phone: the burger menu), then sign in as someone else in the SAME page (same world, same memory) */
export async function reSignIn(p, who, pass) {
  for (const sel of ['#logout', '#accOut']) {
    const l = p.locator(sel)
    if (await l.count() && await l.first().isVisible()) { await l.first().click(); await p.waitForTimeout(500); break }
  }
  if (!(await p.locator('#luser:visible').count())) {
    const b = p.locator('#burger'); if (await b.count() && await b.isVisible()) { await b.click(); await p.waitForTimeout(300); await p.click('#drawerLogout'); await p.waitForTimeout(500) }
  }
  await p.waitForSelector('#luser', { timeout: 15000 })
  await signInAs(p, who, pass)
}
/* the same world in a fresh context of another size / person (carries localStorage and IndexedDB) */
export async function twin(ctx, viewport, who, pass, touch) {
  const st = await ctx.storageState({ indexedDB: true })
  const c2 = await browser.newContext({ viewport, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}), storageState: st })
  const page = await c2.newPage()
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 220)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 220)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE)
  await page.waitForSelector('#luser')
  await signInAs(page, who, pass)
  return { ctx: c2, page }
}

export async function saveState(ctx, name) { await ctx.storageState({ path: join(SCR, `state-${name}.json`), indexedDB: true }) }
export async function openState(name, viewport, who, pass, touch) {
  const c2 = await browser.newContext({ viewport, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}), storageState: join(SCR, `state-${name}.json`) })
  const page = await c2.newPage()
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 220)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 220)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE)
  await page.waitForSelector('#luser')
  await signInAs(page, who, pass)
  return { ctx: c2, page }
}
export async function step(n, size, role, fn) {
  try { await fn() } catch (e) { rec(n, size, role, 'FAIL', 'script/step error (my script, to be checked): ' + String(e.message || e).split('\n').slice(0, 4).join(' | ').slice(0, 400)) }
}
