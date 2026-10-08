/* WALKER H (the Inputs / SANS calendar check, 8 Oct 26) — shared helpers for X-10 to X-18.
   Everything a step DOES goes through the app's own controls; window.* only gets to a place and READS state,
   and (X-10, X-14) swaps who is signed in, in place (the host's "second person" arrangement). */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

export const BASE = process.env.HP_URL || 'http://localhost:4214'
export const SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-08-inputs-sans-calendar-check/H'
export const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/cal-H.json'
mkdirSync(SHOTS, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export const SIZES = {
  desk: { width: 1440, height: 900 },
  phone: { width: 390, height: 844, isMobile: true, hasTouch: true },
  short: { width: 390, height: 568, isMobile: true, hasTouch: true },
  side: { width: 844, height: 390, isMobile: true, hasTouch: true },
  d1536: { width: 1536, height: 864 },
}

/* a fresh browser + context + page, errors collected; opens ?fresh=1 (or the plain address when plain:true) and signs in */
export async function world({ size = 'desk', who = 'ad', pass, plain = false, label = 'p', clock = null } = {}) {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const s = SIZES[size]
  const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, ...(s.isMobile ? { isMobile: true, hasTouch: true } : {}), acceptDownloads: true })
  const errors = []
  if (clock) await ctx.clock.install({ time: clock })
  const page = await ctx.newPage()
  page.setDefaultTimeout(20000)
  page.on('console', m => { if (m.type() === 'error') errors.push(`${label}: ${m.text()}`) })
  page.on('pageerror', e => errors.push(`${label}: PAGEERROR ${e.message}`))
  page.on('response', r => { if (r.status() >= 400) errors.push(`${label}: HTTP ${r.status()} ${r.url()}`) })
  page.on('dialog', d => { errors.push(`${label}: NATIVE DIALOG ${d.message()}`); d.dismiss().catch(() => {}) })
  await page.goto(BASE + (plain ? '/' : '/?fresh=1'))
  await signIn(page, who, pass)
  return { browser, ctx, page, errors, size }
}
export async function signIn(page, who = 'ad', pass) {
  const pw = pass ?? (who === 'ad' ? 'a' : who)
  await page.waitForSelector('#luser', { state: 'visible', timeout: 15000 })
  await page.fill('#luser', who); await page.fill('#lpass', pw)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await sleep(500)
}
export async function go(page, to) {
  await page.evaluate(x => window.go(x), to)
  await page.waitForFunction(x => window.CURPAGE === x, to)
  await sleep(500)
}
export async function signOut(page) {
  for (const sel of ['#logout', '#accOut', '#guestOut']) {
    const l = page.locator(sel)
    if (await l.count() && await l.first().isVisible()) { await l.first().click(); await sleep(500); break }
  }
  if (!(await page.locator('#luser:visible').count())) {
    const b = page.locator('#burger'); if (await b.count() && await b.isVisible()) { await b.click(); await sleep(300); await page.click('#drawerLogout'); await sleep(500) }
  }
  await page.waitForSelector('#luser', { timeout: 15000 })
}

/* ---------- the table ---------- */
export const TABLE = []
let NPIC = 0, TAG = 'x'
export const setTag = t => { TAG = t; NPIC = 0 }
export const picCount = () => NPIC
export async function pic(page, name, opts = {}) {
  const f = `${TAG}-${String(++NPIC).padStart(2, '0')}-${name}.png`
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.zIndex = '99999' }).catch(() => {})
  await page.screenshot({ path: `${SHOTS}/${f}`, ...opts }).catch(e => console.log('shot failed', f, e.message))
  return f
}
export function row(id, did, saw, verdict, pics = [], extra = {}) {
  TABLE.push({ id, did, saw, verdict, pics, ...extra })
  console.log(`== ${verdict}  ${id} — ${did}\n     saw: ${String(saw).slice(0, 900)}`)
}
export function judge(id, did, checks, pics = [], extra = {}) {
  const bad = checks.filter(c => !c[1])
  row(id, did, checks.map(c => `${c[1] ? 'ok' : 'NO'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])).slice(0, 220) + ']' : ''}`).join(' | '), bad.length ? 'FAIL' : 'PASS', pics, extra)
  return !bad.length
}
export function save(name, extra = {}) {
  let all = { parts: {} }
  if (existsSync(OUT)) { try { all = JSON.parse(readFileSync(OUT, 'utf8')) } catch { all = { parts: {} } } }
  if (!all.parts) all = { parts: {} }
  all.parts[name] = { at: new Date().toISOString(), base: BASE, table: TABLE.slice(), ...extra }
  writeFileSync(OUT, JSON.stringify(all, null, 1))
  console.log(`saved part ${name} -> ${OUT}`)
}

/* ---------- reading ---------- */
export const pidOf = (page, cs) => page.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c) || null, cs)
export const csOf = (page, id) => page.evaluate(i => (window.PEOPLE[i] || {}).cs || i, id)
export const inputsNow = page => page.evaluate(() => window.INPUTS.map(x => ({ iid: x.iid, person: x.person, type: x.type, date: x.date, endDate: x.endDate || '', remarks: x.remarks || '', grp: x.grp || '', grpBy: x.grpBy || '', placedBy: x.placedBy || x.by || '', oil: x.oil })))
export const toastText = page => page.evaluate(() => (document.getElementById('toastEl') || {}).textContent || '')

/* a toast spy (the app's own toast line) */
export async function toastSpy(page) {
  await page.evaluate(() => {
    if (window.__hT) return
    window.__hT = []
    new MutationObserver(() => { const el = document.getElementById('toastEl'); const t = el ? (el.textContent || '').trim() : ''; if (t && window.__hT[window.__hT.length - 1] !== t) window.__hT.push(t) }).observe(document.body, { childList: true, subtree: true, characterData: true })
  }).catch(() => {})
}
export const toasts = page => page.evaluate(() => { const a = window.__hT || []; window.__hT = []; return a }).catch(() => [])

/* ---------- the Inputs month ---------- */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function inputsMonth(page, y, m, { tab = true } = {}) {
  if ((await page.evaluate(() => window.CURPAGE)) !== 'inputs') await go(page, 'inputs')
  await page.waitForSelector('#inpCal .ic-mon', { timeout: 10000 })
  for (let i = 0; i < 80; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return true
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click(); await sleep(120)
  }
  return false
}
export const cell = (page, iso) => page.locator(`#inpCal [data-icday="${iso}"]`)

/* open the editor from a date's "+ Input" (day opened by a press at its corner) */
export async function openNewInput(page, iso) {
  const dx = page.locator('[data-testid="win-inputsday-x"]')
  if ((await dx.count()) && SIZES[page.__size || 'desk'].hasTouch) { await dx.first().tap().catch(() => {}); await sleep(400) }
  const c = cell(page, iso)
  await c.scrollIntoViewIfNeeded()
  const sz = SIZES[page.__size || 'desk']
  if (sz && sz.hasTouch) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
  await sleep(500)
  await page.locator('#icPopAdd').click(); await sleep(500)
  await page.waitForSelector('[data-testid="win-inputedit"]', { timeout: 6000 })
}
const pick = page => page.locator('#inpEditPop [data-testid="pp"]')
/* file ONE shared input through the editor window. who = callsigns (the first is the one the editor starts with if `first`), */
export async function fileShared(page, { iso, type = 'Meeting', people = [], remarks = '', answerOil = 'Yes', exclude = [], endIso = null }) {
  await openNewInput(page, iso)
  await page.selectOption('#inpEditType', type)
  await pick(page).locator('[data-testid="pp-several"]').click(); await sleep(250)
  for (const cs of people) {
    const pid = await pidOf(page, cs)
    const b = pick(page).locator(`[data-pp="${pid}"]`).first()
    if ((await b.getAttribute('aria-pressed')) !== 'true') { await b.scrollIntoViewIfNeeded(); await b.click(); await sleep(120) }
  }
  for (const cs of exclude) {
    const pid = await pidOf(page, cs)
    const b = pick(page).locator(`[data-pp="${pid}"]`).first()
    if ((await b.getAttribute('aria-pressed')) === 'true') { await b.scrollIntoViewIfNeeded(); await b.click(); await sleep(120) }
  }
  if (remarks) await page.fill('#inpEditRmk', remarks)
  await page.click('#inpEditSave'); await sleep(700)
  return answerOilIfAsked(page, answerOil)
}
/* file ONE single-person input through the same editor (the person it starts with: the signed-in man) */
export async function fileSolo(page, { iso, type = 'Appointment', remarks = '', answerOil = 'Yes', person = null }) {
  await openNewInput(page, iso)
  await page.selectOption('#inpEditType', type)
  if (person) { const pid = await pidOf(page, person); await page.selectOption('#inpEditPerson', pid).catch(() => {}) }
  if (remarks) await page.fill('#inpEditRmk', remarks)
  await page.click('#inpEditSave'); await sleep(700)
  return answerOilIfAsked(page, answerOil)
}
/* open an existing shared/solo bar by its words (e.g. "+2") on the month and return the window's title */
export async function openBar(page, textRe) {
  await page.locator('#inpCal .ib-bar').filter({ hasText: textRe }).first().click(); await sleep(600)
  const w = page.locator('[data-testid="win-inputedit"]')
  return (await w.count()) ? (await w.locator('.win-ttl').innerText()) : null
}
export async function answerOilIfAsked(page, ans = 'Yes') {
  const asked = []
  for (let i = 0; i < 3; i++) {
    const conf = page.locator('[data-testid="oilconf"]:visible')
    if (await conf.count()) {
      asked.push('oil')
      await conf.locator('button').filter({ hasText: new RegExp('^' + ans) }).first().click().catch(() => {})
      await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {})
      await sleep(700); continue
    }
    const nodoc = page.locator('[data-testid="docconf-nodoc"]:visible')
    if (await nodoc.count()) { asked.push('doc'); await nodoc.click(); await sleep(500); continue }
    break
  }
  return asked
}

/* ---------- publishing (the edit week) ---------- */
export async function showDay(page, di, surf = '#eWeek') {
  await page.evaluate(([s, i]) => {
    const d = document.querySelector(`${s} .day[data-day="${i}"]`)
    if (!d) return
    const sc = d.closest('.week') || d.parentElement
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = d.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0)
    window.scrollTo(0, 0)
  }, [surf, di])
  await sleep(350)
}
export async function toEdit(page) {
  if ((await page.locator('#schedBoard:visible').count())) { const x = page.locator('#sbDone:visible, #sbClose:visible').first(); if (await x.count()) await x.click(); else await page.keyboard.press('Escape'); await sleep(500) }
  if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') await go(page, 'editsched')
}
export async function signDay(page, di, pick = 0) {
  const r = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const out = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = page.locator(`${r} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { out[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[Math.min(pick, opts.length - 1)]); await sleep(250)
    out[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  return out
}
async function pressDay(page, attr, di) {
  const r = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const b = page.locator(`${r} [${attr}="${di}"]:visible`).first()
  if (!(await b.count())) return { pressed: false, why: 'absent' }
  if (await b.isDisabled()) return { pressed: false, why: 'disabled: ' + (await b.getAttribute('title')) }
  const label = (await b.innerText()).trim()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await b.click(); await sleep(900)
  return { pressed: true, label }
}
export const publishDay = (p, di) => pressDay(p, 'data-beak', di)
export const publishAL = (p, di) => pressDay(p, 'data-alpub', di)
export async function head(page, di) {
  return page.evaluate(i => {
    const b = document.querySelector('#schedBoard')
    const scope = b && b.offsetWidth ? b : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!scope) return null
    const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    const q = s => scope.querySelector(s)
    return { tag: t(q('.verchip')), pending: t(q('.dpend')), beak: q(`[data-beak="${i}"]`) ? (q(`[data-beak="${i}"]`).disabled ? 'locked' : 'on') : 'none',
      alpub: t(q(`[data-alpub="${i}"]`)), signs: [...scope.querySelectorAll(`select[data-sign][data-signday="${i}"]`)].map(s => s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : ''),
      signed: t(q('.signedln')), nys: t(q('.nysmark')) }
  }, di)
}
export async function door(page, dir = 'undo') {
  const b = page.locator(dir === 'undo' ? '#undoBtn:visible' : '#redoBtn:visible').first()
  if (!(await b.count())) return { present: false }
  const title = await b.getAttribute('title'), disabled = await b.isDisabled()
  if (disabled) return { present: true, title, disabled, pressed: false }
  await page.evaluate(() => { window.__hT = [] })
  await b.click(); await sleep(900)
  return { present: true, title, pressed: true, toasts: await toasts(page) }
}
export async function changesWin(page, di) {
  const c = page.locator(`#eWeek .day[data-day="${di}"] .dpend`).first()
  if (!(await c.count())) return null
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await c.click(); await sleep(600)
  return true
}
export async function changesRead(page) {
  return page.evaluate(() => {
    const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return null
    const tabs = [...w.querySelectorAll('.win-tab')].map(t => ({ t: t.innerText.replace(/\s+/g, ' ').trim(), on: t.getAttribute('aria-selected') === 'true' || t.classList.contains('on') }))
    const body = w.querySelector('.cw-list, .win-body, .cw-body') || w
    return { tabs, lines: body.innerText.split(/\n/).map(t => t.trim()).filter(Boolean).slice(0, 400) }
  })
}
export async function changesTab(page, name) {
  const t = page.locator('.chgwin:not([hidden]) .win-tab', { hasText: name }).first()
  if (await t.count()) { await t.click(); await sleep(350); return true }
  return false
}
export async function changesClose(page) {
  const x = page.locator('.chgwin:not([hidden]) .win-x').first()
  if (await x.count()) { await x.click().catch(() => {}); await sleep(300) }
}
