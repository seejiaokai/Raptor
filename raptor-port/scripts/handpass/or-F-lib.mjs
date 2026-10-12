// walker F (one-rule walk, 12 Oct 26) - shared helpers; the app at http://localhost:4186/ ; own context per world
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const OUT = 'docs/img/handpass/2026-10-12-one-rule/F'
mkdirSync(OUT, { recursive: true })
mkdirSync('docs/handpass/parts', { recursive: true })
export const BASE = 'http://localhost:4186/'
export const errs = []
export const WIN = '[data-testid="win-inputedit"]'
export const DESK = { width: 1440, height: 900 }
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const press = (touch, loc) => (touch ? loc.tap() : loc.click())
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const TITLE = 'Range safety brief'

/* ---------- a world: its own context, clock three weeks before the week, NO ?fresh=1 ---------- */
export async function open(viewport = DESK, who = 'ad', pass = 'a') {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.clock.setFixedTime(new Date('2026-06-22T09:00:00'))
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE)
  await page.waitForSelector('#luser')
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
  return { ctx, page }
}
export const shot = async (p, name, clip) => { await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); console.log('saved ' + name); return name + '.png' }
export const toastText = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.innerText.replace(/\s+/g, ' ').trim().slice(0, 200) : '' })

/* ---------- filing an input through "+ Input" ---------- */
async function pick(p, iso, touch) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await press(touch, p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`))
  }
  await press(touch, p.locator(`#inpEdCal [data-cal="${iso}"]`))
}
/* spec: {type, person, people:[cs], ph:'allavail'|'all', from, to, title, rmk, timed:[s,e], oil:'yes'|'no'} */
export async function fileInput(p, spec, touch = false) {
  await p.evaluate(() => window.go('inputs'))
  const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
  if (await p.locator(WIN).count()) { await press(touch, p.locator('#inpEditCancel')); await p.waitForTimeout(150) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await press(touch, p.locator('#inListBtn')); await p.waitForTimeout(200) }
  await press(touch, p.locator('#inNew')); await p.locator(WIN).waitFor()
  if (spec.type) await p.selectOption('#inpEditType', spec.type)
  if (spec.person) await p.selectOption('#inpEditPerson', await csId(p, spec.person))
  if (spec.people) {
    await press(touch, p.locator(`${WIN} [data-testid="pp-several"]`))
    const want = []
    for (const cs of spec.people) { const pid = await csId(p, cs); want.push(pid); const b = p.locator(`${WIN} [data-pp="${pid}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(touch, b) }
    const pressed = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), WIN)
    for (const pid of pressed) if (!want.includes(pid)) await press(touch, p.locator(`${WIN} [data-pp="${pid}"]`))
    if (spec.ph) await press(touch, p.locator(`${WIN} [data-ph="${spec.ph}"]`))
  }
  if (spec.from) await pick(p, spec.from, touch)
  if (spec.to) await pick(p, spec.to, touch)
  if (spec.timed) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await press(touch, p.locator('#inpEditAllday'))
    await p.fill('#inpEditStart', spec.timed[0]); await p.fill('#inpEditEnd', spec.timed[1])
  }
  if (spec.title != null) await p.fill('#inpEditOwnTitle', spec.title)
  if (spec.rmk != null) await p.fill('#inpEditRmk', spec.rmk)
  await press(touch, p.locator('#inpEditSave'))
  await p.waitForTimeout(350)
  for (let k = 0; k < 3; k++) {
    const sheet = p.locator('[data-testid="oilconf"]')
    if (await sheet.count()) {
      const how = spec.oil || 'no'
      const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
      await press(touch, (await one.count()) ? one : many)
      await press(touch, sheet.locator('[data-testid="oilconf-save"]'))
    } else if (await p.locator('[data-testid="docconf"]').count()) await press(touch, p.locator('[data-testid="docconf-nodoc"]'))
    else break
    await p.waitForTimeout(300)
  }
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  return p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, cs: window.PEOPLE[r.person]?.cs, people: (r.people || []).map(e => e.p), type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, grp: r.grp || null, cx: !!r.cx, cxr: r.cxr || '' })), had)
}
/* read-only dump of the inputs saved */
export const inputsNow = p => p.evaluate(() => window.INPUTS.map(r => ({ iid: r.iid, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, days: r.days || null, to: r.to || null, people: (r.people || []).map(e => (window.PEOPLE[e.p]?.cs) || e.p), cx: !!r.cx, cxr: r.cxr || '', acc: r.acc || null, oil: r.oil ?? null })).filter(r => r.type && !/^(LL|OD)$/.test(r.type) || true))

/* ---------- navigation ---------- */
export async function toWeek(p) {
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.waitForTimeout(200)
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
}
export async function toBoard(p, di) {
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(300)
  await p.evaluate(d => window.openScheduler(d), di); await p.waitForTimeout(900)
}
/* ---------- sign four sign-offs and publish through the board ---------- */
export async function signAndPublish(p, di) {
  await toBoard(p, di)
  const sels = p.locator(`#schedBoard [data-signday="${di}"]`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await p.waitForTimeout(150)
  }
  await p.waitForTimeout(300)
  let btn = p.locator(`#schedBoard [data-beak="${di}"]`).first()
  if (!(await btn.count())) btn = p.locator(`#schedBoard [data-alpub="${di}"]`).first()
  if (!(await btn.count())) return { ok: false, why: 'no publish button', selects: n }
  const label = (await btn.innerText()).trim()
  if (await btn.isDisabled()) return { ok: false, why: 'disabled: ' + label, selects: n }
  await btn.evaluate(b => b.click()); await p.waitForTimeout(800)
  const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm|Issue)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.evaluate(b => b.click()); await p.waitForTimeout(900) }
  const ver = await p.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '')
  await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
  return { ok: true, label, version: ver, selects: n }
}

/* ---------- the counts for one day ---------- */
const first = (s, re) => { const m = re.exec(s || ''); return m ? +m[1] : null }
export async function counts(p, { di, keepWin = false } = {}) {
  const out = {}
  await toWeek(p)
  out.a = await p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; const s = d?.querySelector('.dstat'); if (!s) return 'NO .dstat'; const pend = s.querySelector('.dpend'); return (pend ? pend.textContent : s.innerText).replace(/\s+/g, ' ').trim() + '  [dstat: ' + s.innerText.replace(/\s+/g, ' ').trim() + ']' }, di)
  out.c = await p.evaluate(() => {
    const els = [...document.querySelectorAll('#page-editsched *')].filter(e => /^\s*AMENDMENTS/i.test(e.textContent) && e.textContent.length < 600)
    if (!els.length) return 'NO AMENDMENTS BOX'
    els.sort((x, y) => x.textContent.length - y.textContent.length)
    return els[els.length - 1].innerText.replace(/\s+/g, ' ').trim()
  })
  const had = await p.locator('.chgwin:not([hidden])').count()
  if (!had) {
    const bb = p.locator('#eWeek .day:not(.peek)').nth(di).locator('.dstat .dpend').first()
    if (await bb.count()) { await bb.scrollIntoViewIfNeeded(); await bb.click(); await p.waitForTimeout(800) }
  }
  out.d = await p.evaluate(() => { const w = document.querySelector('.chgwin'); return w ? w.querySelector('.win-ttl')?.innerText.replace(/\s+/g, ' ').trim() : 'NO CHANGES WINDOW' })
  const tab = p.locator('.chgwin .win-tab', { hasText: /To go out/ })
  out.tabLabel = (await tab.count()) ? (await tab.first().innerText()).replace(/\s+/g, ' ') : 'no To-go-out tab'
  if (await tab.count()) { await tab.first().click(); await p.waitForTimeout(450) }
  out.e = await p.evaluate(() => { const h = document.querySelector('.chgwin .cw-out .pl-head'); return h ? h.innerText.replace(/\s+/g, ' ').trim() : 'no head (To go out empty / absent)' })
  out.lines = await p.evaluate(() => [...document.querySelectorAll('.chgwin .cw-out .pl-item')].map(i => i.innerText.replace(/\s+/g, ' ').trim()))
  if (!keepWin) { await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300) }
  await toBoard(p, di)
  out.b = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); const pend = b?.querySelector('.dpend'); return pend ? pend.textContent.trim() : 'no .dpend on board head' })
  await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
  await toWeek(p)
  out.n = nums(out)
  out.agree = out.n.every(x => x === out.n[0])
  return out
}
export function nums(o) {
  const z = x => (x == null ? 0 : x)
  const a = z(first(o.a, /(\d+)\s*pending/i))
  const b = z(first(o.b, /(\d+)\s*pending/i))
  const c = /No pending changes/i.test(o.c || '') ? 0 : z(first(o.c, /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*·\s*(\d+)\s*change/i) ?? first(o.c, /(\d+)\s+change/i))
  const d = z(first(o.d, /(\d+)\s+changes?\s+waiting/i))
  const e = z(first(o.e, /·\s*(\d+)\s+change/i) ?? first(o.tabLabel, /(\d+)\s*$/))
  return [a, b, c, d, e]
}
export const fmt = o => `(a day) ${o.a.split('  [')[0]} | (b board) ${o.b} | (c Amendments) ${o.c} | (d window title) ${o.d} | (e To go out) ${o.e} [tab: ${o.tabLabel}] => ${JSON.stringify(o.n)} ${o.agree ? 'AGREE' : 'DISAGREE'}`

export async function shotWin(p, name) {
  const loc = p.locator('.chgwin:not([hidden])').first()
  await p.waitForTimeout(200)
  await loc.screenshot({ path: join(OUT, name + '.png') }); console.log('saved ' + name)
  return name + '.png'
}
export async function shotSec(p, name, di, sec = 'grnd') {
  const loc = p.locator('#eWeek .day:not(.peek)').nth(di).locator(`.sec-${sec}`).first()
  await loc.scrollIntoViewIfNeeded(); await p.waitForTimeout(250)
  await p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' }).catch(() => {})
  await loc.screenshot({ path: join(OUT, name + '.png') }); console.log('saved ' + name)
  await p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' }).catch(() => {})
  return name + '.png'
}
export async function shotAmend(p, name) {
  await toWeek(p)
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300)
  const ok = await p.evaluate(() => {
    const els = [...document.querySelectorAll('#page-editsched *')].filter(e => /^\s*AMENDMENTS/i.test(e.textContent) && e.textContent.length < 600)
    if (!els.length) return false
    els.sort((x, y) => x.textContent.length - y.textContent.length)
    els[els.length - 1].setAttribute('data-orf', 'amend'); return true
  })
  if (!ok) return null
  await p.locator('[data-orf="amend"]').first().screenshot({ path: join(OUT, name + '.png') }); console.log('saved ' + name)
  return name + '.png'
}
/* a day-head picture */
export async function shotHead(p, name, di, h = 150) {
  await p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; d.scrollIntoView({ block: 'nearest', inline: 'start' }); window.scrollTo(0, 0) }, di)
  await p.waitForTimeout(300)
  const loc = p.locator('#eWeek .day:not(.peek)').nth(di)
  const b = await loc.locator('.day-head').first().boundingBox()
  const vw = p.viewportSize()
  await p.screenshot({ path: join(OUT, name + '.png'), clip: { x: Math.max(0, b.x), y: Math.max(0, b.y - 4), width: Math.min(b.width, vw.width - Math.max(0, b.x)), height: h } }); console.log('saved ' + name)
  return name + '.png'
}

/* ---------- Undo / Redo ---------- */
export async function undoOnce(p) {
  if (!(await p.locator('#sbUndo:visible, #undoBtn:visible').count())) await toWeek(p)
  const b = (await p.locator('#schedBoard #sbUndo:visible').count()) ? p.locator('#schedBoard #sbUndo').first() : p.locator('#undoBtn:visible').first()
  if (await b.isDisabled().catch(() => null)) return 'Undo button is disabled (nothing to undo)'
  await b.click(); await p.waitForTimeout(700)
  return 'pressed Undo; note: ' + await toastText(p)
}
export async function redoOnce(p) {
  if (!(await p.locator('#sbRedo:visible, #redoBtn:visible').count())) await toWeek(p)
  const b = (await p.locator('#schedBoard #sbRedo:visible').count()) ? p.locator('#schedBoard #sbRedo').first() : p.locator('#redoBtn:visible').first()
  if (await b.isDisabled().catch(() => null)) return 'Redo button is disabled (nothing to redo)'
  await b.click(); await p.waitForTimeout(700)
  return 'pressed Redo; note: ' + await toastText(p)
}

/* ---------- real mouse drags ---------- */
export async function boxOf(loc) { await loc.scrollIntoViewIfNeeded(); return loc.boundingBox() }
export const centre = b => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 })
export async function mouseDrag(p, from, to) {
  await p.mouse.move(from.x, from.y); await p.mouse.down()
  await p.waitForTimeout(120)
  await p.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 12 })
  await p.mouse.move(to.x, to.y, { steps: 12 })
  await p.waitForTimeout(250)
  await p.mouse.up(); await p.waitForTimeout(700)
}
export async function rosterPuck(p, cs) {
  const id = await csId(p, cs)
  return p.locator(`#eRoster .rpuck[data-person="${id}"]`).first()
}
/* the ground-programme row of an input on the week, by its title (upper-cased on the page) */
export function rowLoc(p, di, title) {
  return p.locator('#eWeek .day:not(.peek)').nth(di).locator('.sec-grnd .pl-row').filter({ hasText: new RegExp(title, 'i') }).first()
}
/* read the row: [{name, times, pucks, classes}] on the week */
export async function rowInfo(p, di, title) {
  return p.evaluate(([di, t]) => {
    const day = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
    const out = []
    for (const r of day.querySelectorAll('.sec-grnd .pl-row')) {
      const nm = r.querySelector('.nm .ntx')?.textContent || r.querySelector('.nm')?.textContent
      if (!new RegExp(t, 'i').test(nm || '')) continue
      out.push({ name: (nm || '').trim(), cls: r.className, times: [...r.querySelectorAll('.t')].map(e => e.textContent.trim()).filter(Boolean), pucks: [...r.querySelectorAll('.ppl .seat')].map(s => (s.querySelector('.puck')?.innerText || s.innerText).replace(/\s+/g, ' ').trim()), slots: [...r.querySelectorAll('[data-slot]')].map(e => e.getAttribute('data-slot')) })
    }
    return out
  }, [di, title])
}
export const save = (name, obj) => writeFileSync(join('docs/handpass/parts', name), JSON.stringify(obj, null, 1))
export const load = name => { try { return JSON.parse(readFileSync(join('docs/handpass/parts', name), 'utf8')) } catch { return null } }
