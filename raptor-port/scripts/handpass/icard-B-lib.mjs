// Walker B's library for the input-card walk (10 Oct 26). Reads state, drives only the app's own controls.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const BASE = process.env.LOOK_URL || 'http://localhost:4232/'
export const OUT = 'docs/img/handpass/2026-10-10-input-card-check/B'
export const DOC = join(OUT, 'sample-doc.png')
mkdirSync(OUT, { recursive: true })
// a 1x1 PNG (harmless sample document)
writeFileSync(DOC, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'))
export const DOC2 = join(OUT, 'sample-doc2.png')
writeFileSync(DOC2, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'))

export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const WIN = '[data-testid="win-inputedit"]'
export const DAYWIN = '[data-testid="win-inputsday"]'
export const errs = []
export const rows = []
export const PART = 'docs/handpass/parts/icard-B'

export async function launch() {
  return chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
}
export async function open(browser, viewport, who = 'ad', pass = 'a', touch = false, fresh = true) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: touch ? 2 : 1, acceptDownloads: true, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  await signIn(page, who, pass)
  return { ctx, page }
}
export async function signIn(page, who, pass) {
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
}
export const press = (touch, loc) => (touch ? loc.tap() : loc.click())
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const rec = (p, f) => p.evaluate(f => {
  const r = window.INPUTS.find(x => Object.keys(f).every(k => x[k] === f[k]))
  return r ? { iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, yr: r.yr, oil: r.oil || null, s: r.s, e: r.e, grp: r.grp || null, half: r.half || null, allday: r.allday, docs: (r.docIds || []).length + (r.docId ? 1 : 0), by: r.by, raw: r } : null
}, f).then(r => { if (r) delete r.raw; return r })
export const recs = (p, f) => p.evaluate(f => window.INPUTS.filter(x => Object.keys(f).every(k => x[k] === f[k])).map(r => ({ iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, s: r.s, e: r.e, oil: r.oil || null, grp: r.grp || null, half: r.half || null })), f)
export const recId = (p, iid) => rec(p, { iid })
export const raw = (p, iid) => p.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r ? JSON.parse(JSON.stringify(r)) : null }, iid)

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
  await closeAll(p)
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator('#inMemberMode[aria-selected="false"]').count()) await press(touch, p.locator('#inMemberMode'))
  if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inCalBtn'))
  await month(p, y, m, touch)
}
export async function closeAll(p) {
  for (let i = 0; i < 4; i++) {
    const open = await p.locator(`${WIN}, ${DAYWIN}, [data-testid="oilconf"], #docViewPop:not([hidden])`).count()
    if (!open) break
    await p.keyboard.press('Escape'); await p.waitForTimeout(250)
  }
}
export async function openDay(p, iso, touch, y, m) {
  await toCal(p, touch, y || +iso.slice(0, 4), m || +iso.slice(5, 7))
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await p.locator(DAYWIN).waitFor()
}
export async function toList(p, touch, all = true) {
  await closeAll(p)
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator('#inMemberMode[aria-selected="false"]').count()) await press(touch, p.locator('#inMemberMode'))
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inListBtn'))
  if (all) {
    if (!(await p.locator('#inRangePop').count())) await press(touch, p.locator('#inRangeBtn'))
    await press(touch, p.locator('#inRangeAll')); await p.waitForTimeout(300)
  }
}
/* the OIL question's own two forms */
export async function answerOil(p, touch, how) {
  const sheet = p.locator('[data-testid="oilconf"]')
  const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
  await press(touch, (await one.count()) ? one : many)
  await press(touch, sheet.locator('[data-testid="oilconf-save"]'))
}
/* press Save; if the OIL question comes up answer it (oil = 'yes'|'no'|undefined=>no) */
export async function saveWin(p, touch, oil) {
  await press(touch, p.locator('#inpEditSave'))
  const sheet = p.locator('[data-testid="oilconf"]')
  let asked = false
  if (await sheet.waitFor({ timeout: oil ? 4000 : 1200 }).then(() => true, () => false)) {
    asked = true
    await answerOil(p, touch, oil || 'no')
  }
  await p.waitForTimeout(450)
  return asked
}
/* tap a date in the window's calendar, scrolling the window if need be */
export async function tapDate(p, touch, iso) {
  const d = p.locator(`${WIN} #inpEdCal [data-cal="${iso}"]`)
  await d.scrollIntoViewIfNeeded()
  await press(touch, d)
}
export async function calRead(p) { return (await p.locator(`${WIN} .rc-read`).innerText().catch(() => '')).replace(/\s+/g, ' ').trim() }
/* the window's calendar goes to the month of iso (it shows one month at a time) */
export async function calMonth(p, touch, y, m) {
  for (let i = 0; i < 40; i++) {
    const head = (await p.locator(`${WIN} #inpEdCal`).innerText()).toLowerCase()
    const mm = head.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/)
    if (!mm) return
    const d = y * 12 + (m - 1) - (+mm[2] * 12 + MONTHS.findIndex(x => x.startsWith(mm[1])))
    if (!d) return
    await press(touch, p.locator(`${WIN} #inpEdCal [aria-label="${d > 0 ? 'Next month' : 'Previous month'}"]`))
  }
}
/* File an input through the opened day's "+ Input" (opens the day first when needed).
   o: {iso, type, who (person id | 'allavail' | 'all'), several [callsigns], from, to, title, rmk, dates:[iso,iso], half:'AM'|'PM', allday, oil, doc: path} */
export async function fileInput(p, touch, o) {
  const iso = o.iso || (o.dates ? o.dates[0] : '2026-07-20')
  await openDay(p, iso, touch)
  await press(touch, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
  if (o.type) await p.selectOption('#inpEditType', o.type)
  if (o.several) {
    await press(touch, p.locator(`${WIN} [data-testid="pp-several"]`))
    for (const cs of o.several) { const b = p.locator(`${WIN} [data-pp="${await csId(p, cs)}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(touch, b) }
    /* the picker starts with the filer himself lit: switch off anyone lit who was not asked for */
    const want = new Set(); for (const cs of o.several) want.add(await csId(p, cs))
    for (const b of await p.locator(`${WIN} [data-pp][aria-pressed="true"]`).all()) { const id = await b.getAttribute('data-pp'); if (!want.has(id)) await press(touch, b) }
  } else if (o.who) await p.selectOption('#inpEditPerson', o.who)
  if (o.dates) {
    /* the day the window was opened on is already the pending start; one tap on another day ends the range */
    if (o.dates[1] && o.dates[1] !== o.dates[0]) { await calMonth(p, touch, +o.dates[1].slice(0, 4), +o.dates[1].slice(5, 7)); await tapDate(p, touch, o.dates[1]) }
  }
  if (o.allday !== undefined && await p.locator('#inpEditAllday').count()) { const c = await p.locator('#inpEditAllday').isChecked(); if (c !== o.allday) await press(touch, p.locator('#inpEditAllday')) }
  if (o.from) await p.fill('#inpEditStart', o.from).catch(() => {})
  if (o.to) await p.fill('#inpEditEnd', o.to).catch(() => {})
  if (o.title) await p.fill('#inpEditOwnTitle', o.title)
  if (o.rmk) await p.fill('#inpEditRmk', o.rmk)
  if (o.doc) await attachDoc(p, o.doc)
  const asked = await saveWin(p, touch, o.oil === undefined ? 'no' : o.oil)
  return asked
}
export async function attachDoc(p, path) {
  const fi = p.locator(`${WIN} input[type=file]`)
  await fi.first().setInputFiles(path)
  await p.waitForTimeout(500)
}
export async function shot(p, name) { await p.screenshot({ path: join(OUT, name + '.png') }); return name + '.png' }

/* result rows */
export function say(num, size, role, verdict, saw, pics = []) {
  rows.push({ n: num, size, role, verdict, saw, pics })
  console.log(`== ${verdict}  #${num} (${size}, ${role}) — ${String(saw).slice(0, 900)}`)
}
export function save(tag) {
  mkdirSync('docs/handpass/parts', { recursive: true })
  const f = `docs/handpass/parts/icard-B-${process.env.TAG || tag}.part.json`
  writeFileSync(f, JSON.stringify({ rows, errs: [...new Set(errs)] }, null, 1))
  console.log('saved', f, rows.length, 'rows;', 'errors:', [...new Set(errs)].length)
}
export const sleep = ms => new Promise(r => setTimeout(r, ms))

/* a scenario: fn returns {ok: true|false|'NOT RUN', saw, pics}; an exception is reported as a FAIL naming the script miss risk */
export async function scn(num, size, role, fn) {
  if (process.env.ONLY && !process.env.ONLY.split(',').includes(String(num))) return
  try {
    const r = await fn()
    say(num, size, role, r.ok === 'NOT RUN' ? 'NOT RUN' : (r.ok ? 'PASS' : 'FAIL'), r.saw, r.pics || [])
  } catch (e) {
    say(num, size, role, 'ERROR(script)', String(e.message || e).split('\n').slice(0, 5).join(' | ').slice(0, 600), [])
  }
}
/* read the medical tab's text for the signed-in page (cards) */
export async function medText(p, touch) {
  await closeAll(p)
  await p.evaluate(() => window.go('inputs'))
  await press(touch, p.locator('#inMedBtn')); await p.waitForTimeout(500)
  const t = await p.evaluate(() => (document.querySelector('#inMedBtn[aria-pressed="true"]') ? document.body.innerText : document.body.innerText))
  return t
}
export const undo = async p => { await p.locator('#undoBtn').click(); await p.waitForTimeout(500) }
export const redo = async p => { await p.locator('#redoBtn').click(); await p.waitForTimeout(500) }
export const card = (p, root, tid) => p.locator(`${root} [data-testid^="${tid}-row-"]`)

/* every toast the app raises is collected (the toast element changes text in place) */
export async function watchToasts(p) {
  await p.evaluate(() => {
    if (window.__toasts) return
    window.__toasts = []
    const grab = () => { const t = document.getElementById('toastEl'); if (t && t.textContent && t.style.opacity !== '0') { const s = t.textContent.trim(); if (s && window.__toasts[window.__toasts.length - 1] !== s) window.__toasts.push(s) } }
    new MutationObserver(grab).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['style'] })
  })
}
export const toasts = p => p.evaluate(() => (window.__toasts || []).slice())
export const clearToasts = p => p.evaluate(() => { window.__toasts = [] })
/* pick a how-long segment in the open window: 'All day' | 'AM' | 'PM' | 'Custom' */
export async function setSpan(p, touch, name) {
  const b = p.locator(`${WIN} #inpEditSpan button`).filter({ hasText: new RegExp('^' + name + '$', 'i') })
  await b.scrollIntoViewIfNeeded(); await press(touch, b); await p.waitForTimeout(150)
}
export async function setTimes(p, from, to) {
  await p.fill('#inpEditStart', from); await p.locator('#inpEditStart').press('Tab')
  await p.fill('#inpEditEnd', to); await p.locator('#inpEditEnd').press('Tab')
}
/* open a saved input's window from the list (desktop row Name button / phone card) */
export async function openFromList(p, touch, iid) {
  await toList(p, touch)
  if (touch) { const c = p.locator(`#inList [data-testid="inl-row-${iid}"]`); await c.scrollIntoViewIfNeeded(); await c.locator('[data-testid="inl-who"]').first().tap() }
  else await p.locator(`#inBody tr[data-iid="${iid}"] [data-testid="in-open"]`).click()
  await p.locator(WIN).waitFor()
}
export const toastCount = async p => (await toasts(p)).length

/* what a card says, part by part */
export const cardFacts = (p, root, tid) => p.locator(`${root} [data-testid^="${tid}-row-"]`).evaluateAll((els, tid) => els.map(c => {
  const t = k => { const e = c.querySelector(`[data-testid="${tid}-${k}"]`); return e ? e.textContent : null }
  const b = c.getBoundingClientRect()
  return { iid: c.getAttribute('data-popiid') || c.getAttribute('data-iid') || c.getAttribute('data-testid').replace(/^.*-row-/, ''), who: t('who'), kind: t('kind'), when: t('when'), title: t('title'), rmk: t('rmk'), by: t('by'), late: !!c.querySelector(`[data-testid="${tid}-late"]`),
    h: Math.round(b.height), tone: c.className.includes(' red') ? 'red' : 'amb' }
}), tid)
const tidl = (p, id) => p.locator(`[data-testid="${id}"]`)
const HOL_MONTHS = MONTHS
async function holTap(p, touch, iso) {
  const at = async () => { const [m, y] = (await tidl(p, 'holcal-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + HOL_MONTHS.indexOf(m) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) await press(touch, tidl(p, 'holcal-next-month'))
  for (; d < 0; d++) await press(touch, tidl(p, 'holcal-prev-month'))
  await press(touch, tidl(p, `holcal-day-${iso}`))
}
/* declare a public holiday ('ph') or an Off day ('off') through the Inputs gear -> Calendar... -> Holidays -> Add */
export async function declareHoliday(p, touch, kind, iso, name) {
  await closeAll(p)
  await p.evaluate(() => window.go('inputs'))
  await press(touch, p.locator('#inGear')); await press(touch, tidl(p, 'iset-days'))
  await tidl(p, 'win-days').waitFor()
  if (await tidl(p, 'days-tabs').count()) await press(touch, tidl(p, 'days-tab-holidays'))
  await press(touch, tidl(p, 'hol-add'))
  await press(touch, tidl(p, `hol-kind-${kind}`))
  await tidl(p, 'hol-name').fill(name)
  await holTap(p, touch, iso)
  await press(touch, tidl(p, 'hol-save')); await p.waitForTimeout(600)
  const err = await tidl(p, 'hol-err').innerText().catch(() => '')
  for (let i = 0; i < 4; i++) { if (!(await p.locator('[data-testid="win-holiday"], [data-testid="win-days"], [data-testid="win-inputsettings"], .sset').count())) break; await p.keyboard.press('Escape'); await p.waitForTimeout(250) }
  return err
}
