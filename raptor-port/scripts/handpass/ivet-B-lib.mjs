// WALKER B's shared helpers for the design vet's walk (10 Oct 26). Copied from the host's own ivet-walk.mjs, with a
// per-scenario recorder: each scenario is a ROW (number, size, role) made of checks; one failed check makes the row FAIL.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const OUT = 'docs/img/handpass/2026-10-10-inputs-vet-check/B'
export const BASE = process.env.LOOK_URL || 'http://localhost:4232/'
mkdirSync(OUT, { recursive: true })
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const WIN = '[data-testid="win-inputedit"]', DAYWIN = '[data-testid="win-inputsday"]'
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const errs = []
export const DESK = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 }

export async function launch() { return chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) }

/* open a world: a fresh browser context, signed in. fresh=true -> ?fresh=1 (memory only); false -> a persisting world */
export async function open(browser, viewport, { who = 'ad', pass = 'a', touch = false, fresh = true, dsf = null } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dsf || (touch ? 2 : 1), ...(touch ? { isMobile: true, hasTouch: true } : {}) })
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

/* ---------- the recorder ---------- */
export const rows = []
let cur = null
export function scn(n, size, role, note = '') { cur = { n, size, role, status: 'PASS', said: [], pics: [], note }; rows.push(cur); console.log(`\n=== ${n} (${size}, ${role}) ${note}`); return cur }
export function chk(label, ok, said = '') {
  const s = said ? String(said).slice(0, 600) : ''
  cur.said.push(`${ok ? 'ok' : 'FAIL'}: ${label}${s ? ' — ' + s : ''}`)
  if (!ok && cur.status === 'PASS') cur.status = 'FAIL'
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${s ? ' — ' + s : ''}`)
  return ok
}
export function info(label, said) { cur.said.push(`${label}${said ? ' — ' + String(said).slice(0, 600) : ''}`); console.log(`  info ${label}${said ? ' — ' + String(said).slice(0, 400) : ''}`) }
export function notRun(label, why) { cur.said.push(`NOT RUN: ${label} — ${why}`); if (cur.status === 'PASS') cur.status = 'NOT RUN'; else if (cur.status === 'FAIL') {} ; cur.hasNotRun = true; console.log(`  NOT RUN ${label} — ${why}`) }
export async function guard(fn) { try { await fn() } catch (e) { chk('script step threw', false, String(e.message || e).split('\n').slice(0, 4).join(' ⏎ ')) } }
export async function shot(p, name) { const f = `${name}.png`; await p.screenshot({ path: join(OUT, f) }); cur.pics.push(f); return f }
export function save(key) {
  writeFileSync(join(OUT, `_rows-${key}.json`), JSON.stringify({ rows, errs }, null, 1))
  console.log(`\nSAVED ${rows.length} rows; errors seen: ${errs.length}`)
}

/* ---------- gestures & reads ---------- */
export const press = (touch, loc) => (touch ? loc.tap() : loc.click())
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const count = p => p.evaluate(() => window.INPUTS.length)
export const ids = p => p.evaluate(() => window.INPUTS.map(r => r.iid))
export const newest = (p, had) => p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, person: r.person, cs: window.PEOPLE[r.person]?.cs, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, allday: r.allday, half: r.half, s: r.s, e: r.e, oil: r.oil || null, grp: r.grp || null, by: r.by, byCs: window.PEOPLE[r.by]?.cs, docs: (r.docIds || []).length + (r.docId ? 1 : 0), docId: r.docId || null })), had)
export const toast = p => p.evaluate(() => (document.getElementById('toastEl')?.textContent || '').trim())
export const clearToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.textContent = '' })
export const hasSel = (p, sel) => p.locator(sel).count()

export async function month(p, y, m, touch) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await press(touch, p.locator(d > 0 ? '#icNext' : '#icPrev'))
  }
  throw new Error('the calendar never reached the month asked for')
}
export async function toMember(p) {
  if (await p.locator('#inMemberMode[aria-selected="false"]').count()) { await p.locator('#inMemberMode').evaluate(e => e.click()); await p.waitForTimeout(300) }
}
export async function toCal(p, touch, y = 2026, m = 7) {
  await p.evaluate(() => window.go('inputs'))
  await toMember(p)
  if (await p.locator(WIN).count()) { await press(touch, p.locator('#inpEditCancel')); await p.waitForTimeout(150) }
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inCalBtn'))
  await month(p, y, m, touch)
}
export async function toList(p, touch, all = true) {
  await p.evaluate(() => window.go('inputs'))
  await toMember(p)
  if (await p.locator(WIN).count()) { await press(touch, p.locator('#inpEditCancel')); await p.waitForTimeout(150) }
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inListBtn'))
  if (all) {
    if (!(await p.locator('#inRangePop').count())) await press(touch, p.locator('#inRangeBtn'))
    await press(touch, p.locator('#inRangeAll')); await p.waitForTimeout(250)
    if (await p.locator('#inRangePop').count()) await p.mouse.click(5, 5).catch(() => {})
  }
}
export async function openDay(p, iso, touch) {
  await toCal(p, touch, +iso.slice(0, 4), +iso.slice(5, 7))
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await p.locator(DAYWIN).waitFor()
}
/* "+ Input" on the List: the window comes up */
export async function plus(p, touch) {
  if (await p.locator(WIN).count()) { await press(touch, p.locator('#inpEditCancel')); await p.waitForTimeout(150) }
  await press(touch, p.locator('#inNew'))
  await p.locator(WIN).waitFor()
}
/* "+ Input" inside an opened day on the calendar */
export async function plusDay(p, touch) {
  await press(touch, p.locator('#icPopAdd'))
  await p.locator(WIN).waitFor()
}
/* a day on the window's own calendar, turning its months to reach it */
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
export const rowOf = (p, iid) => p.evaluate(iid => {
  const want = window.INPUTS.find(r => r.iid === iid); if (!want) return null
  const sel = '#inBody tr[data-iid], #inList [data-iid]'
  const el = [...document.querySelectorAll(sel)].find(e => { const r = window.INPUTS.find(x => x.iid === e.getAttribute('data-iid')); return r && (r.iid === iid || (want.grp && r.grp === want.grp)) })
  if (!el) return null
  const all = [...document.querySelectorAll(sel)]
  const b = el.getBoundingClientRect()
  return { at: all.indexOf(el), lit: el.classList.contains('innew'), text: el.textContent.replace(/\s+/g, ' ').trim(), name: el.querySelector('[data-label="Name"], [data-testid="inl-who"]')?.textContent || '',
    by: el.querySelector('.in-placed, [data-testid="inl-by"]')?.textContent || '', rmk: el.querySelector('[data-testid="inl-rmk"]')?.textContent ?? null, when: el.querySelector('[data-testid="inl-when"]')?.textContent ?? null,
    onScreen: b.top >= 0 && b.bottom <= innerHeight, h: Math.round(b.height) }
}, iid)

/* a tiny valid PDF written to my own folder, used for the Document control */
export function makePdf(name, tag = name) {
  const p = join(OUT, name)
  writeFileSync(p, `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 120]>>endobj\n% IVET-B ${tag}\ntrailer<</Root 1 0 R>>\n%%EOF`)
  return p
}
export async function attach(p, path) {
  await p.locator(`${WIN} .docfield input[type=file]`).first().setInputFiles(path)
  await p.waitForTimeout(700)
}

/* a real touch drag/hold over CDP */
export async function cdp(page) { return page.context().newCDPSession(page) }
export async function touchSeq(client, pts, { holdMs = 0, steps = 12 } = {}) {
  const [a, ...rest] = pts
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y }] })
  if (holdMs) await sleep(holdMs)
  let last = a
  for (const b of rest) {
    for (let i = 1; i <= steps; i++) {
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: last.x + (b.x - last.x) * i / steps, y: last.y + (b.y - last.y) * i / steps }] })
      await sleep(16)
    }
    last = b
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

/* the shared helpers of the month scenarios */
export const NINE = ['Ranger', 'Ace', 'Drifter', 'Vapor', 'Blade', 'Cinch', 'Echo', 'Wisp']
export async function fileInput(p, touch, o) {
  // o: {type, who:'Saber' default, people:[cs...], d1, d2, start, end, title, rmk, span, answerOil}
  const had = await ids(p)
  await plus(p, touch)
  await p.selectOption('#inpEditType', o.type)
  if (o.people?.length) {
    await press(touch, p.locator(`${WIN} [data-testid="pp-several"]`))
    for (const cs of o.people) { const b = p.locator(`${WIN} [data-pp="${await csId(p, cs)}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(touch, b) }
  }
  await pick(p, o.d1, touch); if (o.d2) await pick(p, o.d2, touch)
  if (o.span) await press(touch, p.locator(`#inpEditSpan [data-span="${o.span}"]`))
  if (o.allday && await p.locator('#inpEditAllday').count() && !(await p.locator('#inpEditAllday').isChecked())) await press(touch, p.locator('#inpEditAllday'))
  if (o.start) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await press(touch, p.locator('#inpEditAllday'))
    if (o.custom) await press(touch, p.locator('#inpEditSpan [data-span="custom"]'))
    await p.fill('#inpEditStart', o.start); await p.fill('#inpEditEnd', o.end)
  }
  if (o.title) await p.fill('#inpEditOwnTitle', o.title)
  if (o.rmk != null) await p.fill('#inpEditRmk', o.rmk)
  await press(touch, p.locator('#inpEditSave'))
  await p.waitForTimeout(400)
  if (await p.locator('[data-testid="docconf"]').count()) await press(touch, p.locator('[data-testid="docconf-nodoc"]'))
  await p.waitForTimeout(300)
  if (await p.locator('[data-testid="oilconf"]').count()) await answerOil(p, touch, 'no')
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  return newest(p, had)
}
/* every bar of an input (or of its whole group) on the month, with its words and its painting */
export const barsOf = (p, iids) => p.evaluate(iids => {
  const lum = c => { const v = (c.match(/[\d.]+/g) || []).map(Number); return { rgb: v.slice(0, 3).map(Math.round), a: v.length > 3 ? v[3] : 1 } }
  return [...document.querySelectorAll('.ib-bar')].filter(b => iids.includes(b.getAttribute('data-iid'))).map(b => {
    const cs = getComputedStyle(b), r = b.getBoundingClientRect()
    return { text: b.textContent.trim(), cls: b.className, timed: b.classList.contains('timed'), tone: b.classList.contains('red') ? 'red' : 'amb', bg: cs.backgroundColor, color: cs.color, shadow: cs.boxShadow, bl: cs.borderLeftWidth + ' ' + cs.borderLeftColor, left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), clipped: b.scrollWidth > b.clientWidth + 1, title: b.title || '' }
  })
}, iids)
export const grpIids = (p, grp, iid) => p.evaluate(({ grp, iid }) => grp ? window.INPUTS.filter(r => r.grp === grp).map(r => r.iid) : [iid], { grp, iid })
