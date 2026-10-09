// Walker C helpers for the input-card walk (10 Oct 26). Everything is done through the app's own controls; the probe
// bridge (window.INPUTS, window.DAYS, window.PEOPLE) is only used to READ.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const BASE = process.env.LOOK_URL || 'http://localhost:4233/'
export const ROOT = 'C:/Users/User/projects/Raptor/raptor-port'
export const PICS = ROOT + '/docs/img/handpass/2026-10-10-input-card-check/C'
export const JSONF = ROOT + '/docs/handpass/parts/icard-C.json'
mkdirSync(PICS, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const sleep = ms => new Promise(r => setTimeout(r, ms))
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

export const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}
export const DAYWIN = '[data-testid="win-inputsday"]'
export const WIN = '[data-testid="win-inputedit"]'
export const win = p => p.locator(WIN)

export async function launch() { return chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) }

/** a clean world, signed in. who: 'ad' (Saber, admin) or 'us' (Ranger, member). */
export async function world(size = 'desk', who = 'ad', { fresh = true, browser = null, viewport = null } = {}) {
  const b = browser || await launch()
  const base = SIZES[size]
  const ctx = await b.newContext(viewport ? { ...base, viewport } : base)
  const page = await ctx.newPage()
  const errors = []
  page.setDefaultTimeout(10000)
  page.on('console', m => { if (m.type() === 'error') errors.push(`${size}/${who} console: ` + m.text().slice(0, 220)) })
  page.on('pageerror', e => errors.push(`${size}/${who} pageerror: ` + String(e).slice(0, 220)))
  page.on('response', r => { if (r.status() >= 400) errors.push(`${size}/${who} HTTP ` + r.status() + ' ' + r.url()) })
  page.on('dialog', d => { errors.push('NATIVE DIALOG ' + d.message()); d.dismiss().catch(() => {}) })
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  await signIn(page, who)
  return { browser: b, ctx, page, errors, size, touch: size === 'phone', who }
}
export async function signIn(page, who = 'ad') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(500)
}
export async function go(page, to) {
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p, to)
  await sleep(450)
}
export const press = (w, loc) => w.touch ? loc.tap() : loc.click()
export async function reload(w) {
  await w.page.reload(); await sleep(700)
  if (await w.page.locator('#luser').count()) await signIn(w.page, w.who)
  await w.page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(500)
}
/** sign out through the app's own Logout and sign in as someone else (same page, same stored world) */
export async function switchUser(w, who) {
  const p = w.page
  await closeWins(p)
  let out = p.locator('button:visible', { hasText: /^Logout$/ }).first()
  if (!(await out.count())) { await p.locator('#burger').click().catch(() => {}); await sleep(500); out = p.locator('button:visible', { hasText: /^Logout$/ }).first() }
  await out.click(); await sleep(900)
  await signIn(p, who); w.who = who
}

/* ---- the report rows ---- */
export const ROWS = []
export function row(n, size, role, verdict, said, pics = []) {
  const r = { n: String(n), size, role, verdict, said: String(said).slice(0, 5000), pics }
  ROWS.push(r)
  console.log(`[${n} ${size}/${role}] ${verdict} :: ${String(said).slice(0, 700)}`)
  return r
}
export function saveRows(extraErrors = []) {
  let cur = { rows: [], errors: [], extras: [] }
  try { cur = JSON.parse(readFileSync(JSONF, 'utf8')) } catch (e) {}
  const key = r => r.n + '|' + r.size
  const map = new Map(cur.rows.map(r => [key(r), r]))
  for (const r of ROWS) map.set(key(r), r)
  cur.rows = [...map.values()]
  cur.errors = [...new Set([...(cur.errors || []), ...extraErrors])]
  writeFileSync(JSONF, JSON.stringify(cur, null, 1))
  console.log('saved', ROWS.length, 'rows; total', cur.rows.length)
}
export function addExtra(text, pic) {
  let cur = { rows: [], errors: [], extras: [] }
  try { cur = JSON.parse(readFileSync(JSONF, 'utf8')) } catch (e) {}
  cur.extras = cur.extras || []
  cur.extras.push({ text, pic })
  writeFileSync(JSONF, JSON.stringify(cur, null, 1))
}
export async function pic(w, name) {
  const f = `${w.size}-${name}.png`
  await w.page.mouse.move(0, 0).catch(() => {})
  await w.page.screenshot({ path: join(PICS, f) }).catch(() => {})
  return f
}
export async function finish(w, errs = []) {
  saveRows([...(w.errors || []), ...errs])
  console.log('ERRORS:', JSON.stringify([...new Set(w.errors)].slice(0, 12)))
  await w.browser.close()
}

/* ---- Inputs calendar ---- */
export async function month(p, y, m) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await p.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  throw new Error('calendar never reached month')
}
export async function closeWins(p) {
  for (let i = 0; i < 5; i++) {
    const q = p.locator('[data-testid="oilconf"]:visible')
    if (await q.count()) { await p.keyboard.press('Escape'); await sleep(250); continue }
    const x = p.locator('.floatwin .win-x:visible').first()
    if (await x.count()) { await x.click().catch(() => {}); await sleep(250) } else break
  }
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await sleep(250) }
}
export async function toCal(w) {
  const p = w.page
  await go(p, 'inputs')
  const calBtn = p.locator('#inCalBtn[aria-pressed="false"]'); if (await calBtn.count()) { await press(w, calBtn); await sleep(250) }
  await closeWins(p)
}
/** open the day card (calendar) on iso */
export async function openDay(w, iso) {
  const p = w.page
  await toCal(w)
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await sleep(250) }
  const [y, m] = iso.split('-').map(Number)
  await month(p, y, m)
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (w.touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await p.locator(DAYWIN).waitFor(); await sleep(250)
}
/** the day's "+ Input", up to the open window */
export async function openNew(w, iso) {
  const p = w.page
  await openDay(w, iso)
  await press(w, p.locator('#icPopAdd'))
  await win(p).waitFor(); await sleep(200)
}
export async function showEveryone(w) {
  const p = w.page
  if (!(await p.locator('#inFPerson').isVisible().catch(() => false))) { await p.locator('#inFiltersBtn').click().catch(() => {}); await sleep(250) }
  await p.selectOption('#inFPerson', 'all'); await sleep(250)
}
/** the Inputs list, every date shown */
export async function toList(w) {
  const p = w.page
  await go(p, 'inputs')
  await closeWins(p)
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await press(w, p.locator('#inListBtn'))
  await sleep(250)
  if (!(await p.locator('#inRangePop').count())) await press(w, p.locator('#inRangeBtn'))
  await press(w, p.locator('#inRangeAll')); await sleep(350)
  await p.keyboard.press('Escape').catch(() => {})
}
/** open a saved input's window from the List (phone: its card; desktop: its row's Name) */
export async function openFromList(w, iid) {
  const p = w.page
  await toList(w)
  if (w.touch) {
    const c = p.locator(`#inList [data-testid="inl-row-${iid}"]`)
    await c.scrollIntoViewIfNeeded(); await c.locator('[data-testid="inl-open"]').tap().catch(async () => { await c.tap() })
  } else {
    const r = p.locator(`#inBody tr[data-iid="${iid}"] [data-testid="in-open"]`)
    await r.scrollIntoViewIfNeeded(); await r.click()
  }
  await win(p).waitFor(); await sleep(250)
}
export async function setTimes(p, s, e) {
  const ad = p.locator('#inpEditAllday')
  if (await ad.count() && await ad.isChecked().catch(() => false)) await ad.uncheck()
  const set = async (sel, v) => { const l = p.locator(sel).first(); if (await l.count()) { await l.fill(v); await l.blur() } }
  if (s != null) await set('#inpEditStart', s)
  if (e != null) await set('#inpEditEnd', e)
}
/** press Save; if the OIL question appears, read it and answer (oil: 'yes'|'no'|'cancel'|'none'=leave open) */
export async function saveWin(w, oil) {
  const p = w.page
  await p.locator('#inpEditSave').scrollIntoViewIfNeeded().catch(() => {})
  await press(w, p.locator('#inpEditSave'))
  const sheet = p.locator('[data-testid="oilconf"]')
  let head = '', asked = false
  if (await sheet.waitFor({ timeout: 1500 }).then(() => true, () => false)) {
    asked = true
    head = (await sheet.innerText()).replace(/\s+/g, ' ').trim()
    if (oil === 'yes' || oil === 'no') await answerOil(w, oil)
    else if (oil === 'cancel') await press(w, sheet.locator('.abtn.ghost').first())
  }
  await sleep(450)
  return { head, asked }
}
export async function answerOil(w, how) {
  const p = w.page
  const sheet = p.locator('[data-testid="oilconf"]')
  const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
  await press(w, (await one.count()) ? one : many)
  await press(w, sheet.locator('[data-testid="oilconf-save"]'))
  await sleep(450)
}
export const oilText = async p => { const s = p.locator('[data-testid="oilconf"]'); return (await s.count()) ? (await s.first().innerText()).replace(/\s+/g, ' ').trim() : null }
/** file a new input via the window. o: iso, type, person, title, s, e, rmk, oil, several (callsigns), allday */
export async function fileNew(w, o) {
  const p = w.page
  await openNew(w, o.iso)
  if (o.type) await p.selectOption('#inpEditType', o.type)
  if (o.several) {
    await press(w, p.locator(`${WIN} [data-testid="pp-several"]`))
    for (const cs of o.several) { const b = p.locator(`${WIN} [data-pp="${await pid(p, cs)}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(w, b) }
  } else if (o.person) await p.selectOption('#inpEditPerson', o.person)
  if (o.allday) { const ad = p.locator('#inpEditAllday'); if (await ad.count() && !(await ad.isChecked())) await ad.check() }
  if (o.s != null || o.e != null) await setTimes(p, o.s, o.e)
  if (o.title != null) await p.fill('#inpEditOwnTitle', o.title)
  if (o.rmk != null) await p.fill('#inpEditRmk', o.rmk)
  if (o.doc) await attachDoc(w, o.doc)
  const r = await saveWin(w, o.oil)
  if (o.docq && o.docq !== 'none') { /* a medical question after the save */ }
  await closeWins(p)
  return r
}
export const SAMPLE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/4fe0a868-4766-4a61-b47c-1e2d7bfe00d0/scratchpad/sample-doc.png'
export async function attachDoc(w, file = SAMPLE) {
  const p = w.page
  const btn = p.locator(`${WIN} .docbtn`).first()
  const [fc] = await Promise.all([p.waitForEvent('filechooser'), press(w, btn)])
  await fc.setFiles(file); await sleep(500)
}
export const REC = r => ({ iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, s: r.s, e: r.e, oil: r.oil || null, by: r.by, grp: r.grp || null, yr: r.yr, docId: r.docId || null })
export const recBy = (p, f) => p.evaluate(([f, src]) => { const r = window.INPUTS.find(x => Object.keys(f).every(k => x[k] === f[k])); return r ? { iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, s: r.s, e: r.e, oil: r.oil || null, by: r.by, grp: r.grp || null, yr: r.yr, docId: r.docId || null } : null }, [f, 0])
export const recAll = (p, f) => p.evaluate(f => window.INPUTS.filter(x => Object.keys(f).every(k => x[k] === f[k])).map(r => ({ iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, s: r.s, e: r.e, oil: r.oil || null, by: r.by, grp: r.grp || null })), f)
export const recId = (p, iid) => recBy(p, { iid })
export const pid = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)

/** what a card says, part by part */
export const cardFacts = (p, root, tid) => p.locator(`${root} [data-testid^="${tid}-row-"]`).evaluateAll((els, tid) => els.map(c => {
  const t = k => { const e = c.querySelector(`[data-testid="${tid}-${k}"]`); return e ? e.textContent : null }
  const b = c.getBoundingClientRect()
  return { tid: c.getAttribute('data-testid'), iid: c.getAttribute('data-popiid') || c.getAttribute('data-iid'), who: t('who'), kind: t('kind'), when: t('when'), title: t('title'), rmk: t('rmk'), by: t('by'), late: !!c.querySelector(`[data-testid="${tid}-late"]`), h: Math.round(b.height), pucks: c.querySelectorAll('.puck').length, tone: c.className.includes(' red') ? 'red' : 'amb' }
}), tid)

/* ---- the Calendar window: declare a public holiday through the Inputs gear -> Calendar... -> Holidays -> + Add ---- */
const HOL_MONTHS = MONTHS
const tid = (page, id) => page.locator(`[data-testid="${id}"]`)
async function holTap(w, iso) {
  const p = w.page
  const at = async () => { const [m, y] = (await tid(p, 'holcal-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + HOL_MONTHS.indexOf(m) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) await press(w, tid(p, 'holcal-next-month'))
  for (; d < 0; d++) await press(w, tid(p, 'holcal-prev-month'))
  await press(w, tid(p, `holcal-day-${iso}`))
}
export async function declareHoliday(w, iso, name = 'Test holiday', short = 'TH') {
  const p = w.page
  await go(p, 'inputs')
  await closeWins(p)
  await press(w, p.locator('[data-testid="in-gear"]')); await sleep(500)
  const calLink = p.locator('[data-testid="iset-days"], [data-testid="settings-days"]').first()
  if (!(await calLink.count())) {
    const alt = p.getByText(/Calendar/, { exact: false }).locator('visible=true').first()
    await press(w, alt)
  } else await press(w, calLink)
  await tid(p, 'win-days').waitFor(); await sleep(300)
  if (await tid(p, 'days-tabs').count()) await press(w, tid(p, 'days-tab-holidays'))
  await sleep(250)
  await press(w, tid(p, 'hol-add'))
  await tid(p, 'hol-name').fill(name)
  await tid(p, 'hol-short').fill(short)
  await holTap(w, iso)
  await press(w, tid(p, 'hol-save')); await sleep(600)
  const err = await p.locator('[data-testid="hol-err"], .hol-err, [data-testid="hol-wait"]').first().innerText().catch(() => '')
  return err
}

/* ---- publishing on Edit Schedule: the four sign-offs, then Publish ---- */
export async function showDay(p, di, surf = '#eWeek') {
  await p.evaluate(([s, i]) => {
    const d = document.querySelector(`${s} .day[data-day="${i}"]`)
    if (!d) return
    d.scrollIntoView({ block: 'start', inline: 'center' })
  }, [surf, di])
  await sleep(350)
}
export async function signDay(p, di, pick = 0) {
  const out = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = p.locator(`#eWeek select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { out[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[Math.min(pick, opts.length - 1)])
    await sleep(250)
    out[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  return out
}
export async function pressDay(p, attr, di) {
  const b = p.locator(`#eWeek [${attr}="${di}"]:visible`).first()
  if (!(await b.count())) return { pressed: false, why: 'absent' }
  if (await b.isDisabled()) return { pressed: false, why: 'disabled: ' + (await b.getAttribute('title')) }
  const label = (await b.innerText()).trim()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await b.click()
  await sleep(800)
  return { pressed: true, label }
}
export const publishDay = (p, di) => pressDay(p, 'data-beak', di)
export const publishAL = (p, di) => pressDay(p, 'data-alpub', di)
export async function head(p, di) {
  return p.evaluate(i => {
    const scope = document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!scope) return null
    const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    const q = s => scope.querySelector(s)
    return {
      tag: t(q('.verchip')), pending: t(q('.dpend')),
      beak: q(`[data-beak="${i}"]`) ? (q(`[data-beak="${i}"]`).disabled ? 'locked' : 'on') : 'none',
      alpub: t(q(`[data-alpub="${i}"]`)), unpub: t(q(`[data-unpub="${i}"]`)),
      signs: [...scope.querySelectorAll(`select[data-sign][data-signday="${i}"]`)].map(s => s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : ''),
      signed: t(q('.signedln')), nys: t(q('.nysmark')),
    }
  }, di)
}
/** go to the edit week that holds `iso` by loading the week the app itself offers (probe bridge loadWeek is NAVIGATION only) */
export async function undo(w) { const b = w.page.locator('#undoBtn'); if (await b.isDisabled()) return false; await press(w, b); await sleep(700); return true }
export async function redo(w) { const b = w.page.locator('#redoBtn'); if (await b.isDisabled()) return false; await press(w, b); await sleep(700); return true }
/** open a saved input's window from the List by a text on its card/row (phone: the card; desktop: the row's Name) */
export async function openByText(w, text) {
  const p = w.page
  await toList(w)
  if (w.who === 'us') await showEveryone(w)
  if (w.touch) {
    const c = p.locator('#inList [data-testid^="inl-row-"]').filter({ hasText: text }).first()
    await c.scrollIntoViewIfNeeded(); await c.tap()
  } else {
    const r = p.locator('#inBody tr').filter({ hasText: text }).first()
    await r.scrollIntoViewIfNeeded(); await r.locator('[data-testid="in-open"]').click()
  }
  await win(p).waitFor(); await sleep(250)
}
export const winFacts = p => p.locator(WIN).evaluate(w => ({ save: !!w.querySelector('#inpEditSave'), del: !!w.querySelector('#inpEditDel'), cal: !!w.querySelector('#inpEdCal'), revise: !!w.querySelector('[data-testid="oil-revise"]'), unanswered: !!w.querySelector('[data-testid="oil-unanswered"]'), answer: !!w.querySelector('[data-testid="oil-answer"]'), takeout: !!w.querySelector('[data-testid="inped-takeout"]'), docview: !!w.querySelector('[data-testid="inped-docview"]'), ro: ((w.querySelector('[data-testid="inped-ro"]') || {}).textContent || '').replace(/\s+/g, ' '), placed: ((w.querySelector('[data-testid="inped-placed"]') || {}).textContent || '').replace(/\s+/g, ' '), ttl: ((w.querySelector('.win-ttl') || {}).textContent || '').replace(/\s+/g, ' '), hint: ((w.querySelector('.inped-hint') || {}).textContent || '').replace(/\s+/g, ' '), text: w.innerText.replace(/\s+/g, ' ') }))
/* ---- the week of Edit Schedule / View-only Sched: the app's own week buttons ("Jul 20") ---- */
export async function weekTo(w, page, label) {
  const p = w.page
  await go(p, page)
  const b = p.getByRole('button', { name: label, exact: true })
  if (await b.count() && await b.first().isVisible().catch(() => false)) { await b.first().click(); await sleep(900); return }
  // a phone: the calendar button opens "Jump to a date"; a tap on a day goes to that day's week
  const day = String(+label.split(' ')[1])
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
  const jump = p.locator('button.wknav-mbtn:visible').first()
  await jump.tap(); await sleep(600)
  await p.locator('#weekCal button.rc-d').filter({ hasText: new RegExp('^' + day + '$') }).first().tap(); await sleep(900)
  if (await p.locator('#weekCal:visible').count()) { await p.keyboard.press('Escape'); await sleep(300) }
}
const unavText = (p, root, di) => p.evaluate(([root, di]) => { const d = document.querySelector(`${root} .day[data-day="${di}"]`); if (!d) return null; const u = d.querySelector('.sec-unav'); return u ? u.innerText.replace(/s+/g, ' ') + ' ## values: ' + [...u.querySelectorAll('input,textarea,[contenteditable]')].map(e => (e.value !== undefined && e.value !== '' ? e.value : e.textContent).trim()).filter(Boolean).join(' | ') : '(no unavailable section)' }, [root, di])
const reqRows = (p, root, di) => p.evaluate(([root, di]) => [...document.querySelectorAll(`${root} .day[data-day="${di}"] .pl-row.gr-frominput`)].map(r => ((r.querySelector(':scope > .nm .ntx') || {}).textContent || '').trim() + ' [' + (((r.querySelector(':scope > .nm .nm-kind') || {}).textContent) || r.innerText.split('\n')[0]) + '] ' + r.innerText.replace(/\s+/g, ' ').slice(0, 70)), [root, di])
export async function editDay(w, label, di) {
  const p = w.page
  await weekTo(w, 'editsched', label)
  await showDay(p, di)
  return { head: await head(p, di), rows: await reqRows(p, '#eWeek', di), unav: await unavText(p, '#eWeek', di), week: await p.evaluate(() => window.CURWEEK) }
}
export async function issuedDay(w, label, di) {
  const p = w.page
  await weekTo(w, 'viewsched', label)
  await p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (d) d.scrollIntoView({ block: 'start', inline: 'center' }) }, di)
  await sleep(300)
  return { rows: await reqRows(p, '#vWeek', di), unav: await unavText(p, '#vWeek', di), week: await p.evaluate(() => window.CURWEEK), tag: await p.evaluate(i => ((document.querySelector(`#vWeek .day[data-day="${i}"] .verchip`) || {}).innerText || ''), di) }
}
export async function signAndPublish(w, label, di) {
  const p = w.page
  await weekTo(w, 'editsched', label)
  await showDay(p, di)
  const signs = await signDay(p, di)
  const pub = await publishDay(p, di)
  return { signs, pub, head: await head(p, di) }
}
/** in the open input window, set dates through its calendar: one tap (a day) or two taps (start, end) */
export async function calTap(w, ...isos) {
  const p = w.page
  for (const iso of isos) {
    const d = p.locator(`${WIN} #inpEdCal [data-cal="${iso}"]`)
    await d.scrollIntoViewIfNeeded().catch(() => {})
    await press(w, d); await sleep(150)
  }
  return (await p.locator(`${WIN} .rc-read`).innerText().catch(() => '')).replace(/\s+/g, ' ')
}
/** the gear on the Inputs page: "Members may file duties and commitments for other people". Admin only. */
export async function setMemberFiling(w, on) {
  const p = w.page
  await toCal(w)
  await press(w, p.locator('[data-testid="in-gear"]')); await sleep(500)
  const cb = p.locator('[data-testid="iset-memberfile"]')
  const was = await cb.isChecked()
  if (was !== on) await cb.setChecked(on)
  await press(w, p.locator('[data-testid="iset-save"]')); await sleep(700)
  return { was, now: on }
}
/* ---- the Scheduler Board and its OIL Earn mode (copied from the earlier walkers' helper) ---- */
export async function closeBoard(p) {
  if (!(await p.locator('#schedBoard').count())) return
  const x = p.locator('#schedBoard').getByRole('button', { name: /Close|Done/ }).first()
  if (await x.count()) { await x.click(); await sleep(500) } else { await p.keyboard.press('Escape'); await sleep(400) }
}
export async function openBoard(w, di) {
  const p = w.page
  await closeBoard(p)
  await go(p, 'editsched')
  const d = p.locator(`#eWeek [data-sbday="${di}"]:visible`).first()
  try {
    await d.scrollIntoViewIfNeeded({ timeout: 4000 })
    if (w.touch) await d.tap({ timeout: 4000 }); else await d.click({ timeout: 4000 })
    await p.waitForSelector('#schedBoard', { timeout: 4000 })
  } catch (e) {
    const first = p.locator('#eWeek [data-sbday]:visible').first()
    await first.scrollIntoViewIfNeeded().catch(() => {})
    if (w.touch) await first.tap(); else await first.click()
    await p.waitForSelector('#schedBoard'); await sleep(500)
    for (let i = 0; i < 8; i++) {
      const cur = await p.evaluate(() => window.SBDAY)
      if (cur === di) break
      const arrow = p.locator(cur < di ? '#sbNextDay:visible, button[title="Next day"]:visible' : '#sbPrevDay:visible, button[title="Previous day"]:visible').first()
      if (w.touch) await arrow.tap(); else await arrow.click()
      await sleep(500)
    }
  }
  await p.waitForSelector('#schedBoard'); await sleep(600)
}
export async function oilMode(w, on = true) {
  const p = w.page
  const hit = l => press(w, l)
  const done = p.locator('#schedBoard button', { hasText: /OIL done/ }).first()
  const isOn = async () => (await done.count()) && await done.isVisible().catch(() => false)
  if (on && !(await isOn())) {
    const b = p.locator('#sbOil:visible').first()
    if (await b.count()) await hit(b)
    else { await hit(p.locator('#sbMore').first()); await sleep(450); await hit(p.locator('button:visible', { hasText: /^OIL Earn$/ }).first()) }
    await sleep(800)
  } else if (!on && (await isOn())) { await hit(done); await sleep(600) }
}
/** every "till <date>" and the words near Ranger in a day of a week surface ('#eWeek' or '#vWeek') — innerText and field values */
export const dayTill = (p, root, di) => p.evaluate(([root, di]) => { const d = document.querySelector(`${root} .day[data-day="${di}"]`); if (!d) return null; const t = d.innerText.replace(/\s+/g, ' ') + ' | ' + [...d.querySelectorAll('input,textarea')].map(e => e.value).join(' | '); return { till: (t.match(/till \d+ \w+/g) || []), ranger: (t.match(/.{0,30}Ranger.{0,60}/g) || []).slice(0, 3) } }, [root, di])
/** the Leave War grid cell text for one person on one day (what the issued schedule earned shows there as HO / FO) */
export async function lwCellText(w, cs, iso = '2026-07-18') {
  const p = w.page
  const id = await pid(p, cs)
  await go(p, 'leavewar')
  await sleep(1000)
  const mon = p.locator(`[data-testid="month-${new Date(iso).toLocaleString('en', { month: 'short' }).toUpperCase()}"]`)
  if (await mon.count()) { await mon.first().click(); await sleep(900) }
  return p.evaluate(([id, d]) => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); return c ? { text: (c.innerText || '').trim(), cls: c.className.slice(0, 60) } : 'NO CELL DRAWN' }, [id, iso])
}
