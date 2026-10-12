// one-rule walk, walker G - shared helpers (own browser per script run, worlds without ?fresh=1, clock set back)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const OUT = 'docs/img/handpass/2026-10-12-one-rule/G'
mkdirSync(OUT, { recursive: true })
export const BASE = 'http://localhost:4186/'
export const errs = []
export const DESK = { width: 1440, height: 900 }
export const WIN = '[data-testid="win-inputedit"]'
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const CLOCK = '2026-06-22T09:00:00'
export const DATA = 'docs/handpass/parts/or-G.json'
export const press = (touch, loc) => loc.click()
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export async function open(who = 'ad', pass = 'a', viewport = DESK, { clock = CLOCK } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  if (clock) await page.clock.setFixedTime(new Date(clock))
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.addInitScript(() => {
    window.__toasts = []
    const go = () => new MutationObserver(() => { const t = document.getElementById('toastEl'); if (t && t.style.opacity === '1') { const s = t.textContent; if (window.__toasts[window.__toasts.length - 1] !== s) window.__toasts.push(s) } }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true })
    if (document.documentElement) go(); else document.addEventListener('DOMContentLoaded', go)
  })
  await page.goto(BASE)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who, pass)
  return { ctx, page }
}
export async function login(page, who = 'ad', pass = 'a') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
}
export async function reload(page, who = 'ad', pass = 'a') {
  await page.reload()
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForSelector('#vWeek .day, #loginForm', { state: 'attached' })
  await page.waitForTimeout(500)
  if (await page.locator('#loginForm').isVisible().catch(() => false)) await login(page, who, pass)
}
export const toasts = p => p.evaluate(() => window.__toasts.slice())
export const toastMark = p => p.evaluate(() => window.__toasts.length)
export const toastsSince = (p, m) => p.evaluate(m => window.__toasts.slice(m).join(' || '), m)
export const shot = async (p, name, clip) => { await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); console.log('saved ' + name); return name + '.png' }
export const shotEl = async (loc, name) => { await loc.screenshot({ path: join(OUT, name + '.png') }); console.log('saved ' + name); return name + '.png' }

/* ---- file one input through the Inputs page's "+ Input" window (copy of gi-lib's, pointed at this build) ---- */
async function pick(p, iso) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click()
  }
  await p.locator(`#inpEdCal [data-cal="${iso}"]`).click()
}
export async function fileInput(p, spec) {
  await p.evaluate(() => window.go('inputs'))
  const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
  if (await p.locator(WIN).count()) { await p.locator('#inpEditCancel').click(); await p.waitForTimeout(150) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await p.locator('#inListBtn').click(); await p.waitForTimeout(200) }
  await p.locator('#inNew').click(); await p.locator(WIN).waitFor()
  if (spec.type) await p.selectOption('#inpEditType', spec.type)
  if (spec.person) await p.selectOption('#inpEditPerson', await csId(p, spec.person))
  if (spec.people) {
    await p.locator(`${WIN} [data-testid="pp-several"]`).click()
    const want = []
    for (const cs of spec.people) { const pid = await csId(p, cs); want.push(pid); const b = p.locator(`${WIN} [data-pp="${pid}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click() }
    if (spec.placeholder) { await p.locator(`${WIN} [data-ph="${spec.placeholder}"]`).first().click() }
    const pressed = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), WIN)
    for (const pid of pressed) if (!want.includes(pid) && pid !== spec.placeholder) await p.locator(`${WIN} [data-pp="${pid}"]`).click()
  }
  if (spec.from) await pick(p, spec.from)
  if (spec.to) await pick(p, spec.to)
  if (spec.timed) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await p.locator('#inpEditAllday').click()
    await p.fill('#inpEditStart', spec.timed[0]); await p.fill('#inpEditEnd', spec.timed[1])
  }
  if (spec.title != null) await p.fill('#inpEditOwnTitle', spec.title)
  if (spec.rmk != null) await p.fill('#inpEditRmk', spec.rmk)
  await p.locator('#inpEditSave').click()
  await p.waitForTimeout(350)
  for (let k = 0; k < 3; k++) {
    const sheet = p.locator('[data-testid="oilconf"]')
    if (await sheet.count()) {
      const how = spec.oil || 'no'
      const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
      await ((await one.count()) ? one : many).click()
      await sheet.locator('[data-testid="oilconf-save"]').click()
    } else if (await p.locator('[data-testid="docconf"]').count()) await p.locator('[data-testid="docconf-nodoc"]').click()
    else break
    await p.waitForTimeout(300)
  }
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  return p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, cs: window.PEOPLE[r.person]?.cs, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, grp: r.grp || null, people: r.people ? r.people.map(e => window.PEOPLE[e.p]?.cs || e.p) : null, cx: r.cx || null })), had)
}

/* ---- navigation ---- */
export async function toWeek(p) {
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.waitForTimeout(200)
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
}
export async function toBoard(p, di) {
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(300)
  await p.evaluate(d => window.openScheduler(d), di); await p.waitForTimeout(900)
}
export async function toView(p) {
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.waitForTimeout(200)
  await p.locator('a[data-page="viewsched"]').first().click(); await p.waitForTimeout(800)
}

/* ---- sign + publish through the board ---- */
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

/* ---- the counts (a)(b)(c)(d)(e) as the w3 lib reads them ---- */
const first = (s, re) => { const m = re.exec(s || ''); return m ? +m[1] : null }
export async function counts(p, di, { keepWin = false } = {}) {
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
  if (keepWin) return out
  await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
  return out
}

/* ---- read rows ---- */
export const readRows = (p, ts) => p.evaluate(ts => {
  ts = [].concat(ts).map(t => t.toLowerCase())
  const norm = s => (s || '').trim().toLowerCase()
  const names = r => [...r.querySelectorAll('.ppl .puck')].map(n => (n.querySelector('.nm')?.textContent || n.textContent || '').trim().replace(/\s+/g, ' '))
  const pick = (sel, name) => [...document.querySelectorAll(sel)].filter(r => ts.includes(norm(name(r)))).map(names)
  return {
    editWeek: pick('#eWeek .day:not(.peek) .sec-grnd .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
    viewWeek: pick('#vWeek .day:not(.peek) .sec-grnd .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
    board: pick('#schedBoard .sb-panel.grnd .sb-arow', r => r.querySelector('textarea.ain, input.ain')?.value),
  }
}, ts)

export const inputsRead = p => p.evaluate(() => window.INPUTS.map(r => ({ iid: r.iid, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, cx: r.cx || null, cxr: r.cxr || null, oil: r.oil ?? null, people: r.people ? r.people.map(e => (window.PEOPLE[e.p]?.cs || e.p) + (e.oil != null ? `(oil ${e.oil})` : '')) : [window.PEOPLE[r.person]?.cs || r.person], grp: r.grp || null })))

export function saveData(key, val) {
  let all = {}
  try { all = JSON.parse(readFileSync(DATA, 'utf8')) } catch {}
  all[key] = val
  writeFileSync(DATA, JSON.stringify(all, null, 1))
}
export async function pause() { await sleep(100) }

/* ---- a real mouse drag ---- */
export async function mouseDrag(p, from, to, { steps = 14 } = {}) {
  await p.mouse.move(from.x, from.y); await p.mouse.down()
  await p.waitForTimeout(120)
  await p.mouse.move(from.x + 6, from.y + 6, { steps: 3 })
  await p.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps })
  await p.mouse.move(to.x, to.y, { steps })
  await p.waitForTimeout(250)
  await p.mouse.move(to.x + 1, to.y + 1)
  await p.waitForTimeout(150)
  await p.mouse.up(); await p.waitForTimeout(700)
}
export const centre = b => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 })
export async function dragLocToLoc(p, src, tgt) {
  await tgt.scrollIntoViewIfNeeded()
  await p.waitForTimeout(200)
  const sb = await src.boundingBox(), tb = await tgt.boundingBox()
  if (!sb || !tb) throw new Error('drag: no box ' + !!sb + ' ' + !!tb)
  await mouseDrag(p, centre(sb), centre(tb))
}
export const rosterPuckOf = (p, id, where = 'week') => p.locator(`${where === 'board' ? '#sbRoster' : '#eRoster'} .rpuck[data-person="${id}"]`).first()
export const weekRow = (p, di, title) => p.locator(`#eWeek .day:not(.peek)`).nth(di).locator('.sec-grnd .pl-row', { hasText: title.toUpperCase() }).first()

/* ---- Leave War: a man's cell for a date, the OIL tracker's text ---- */
export async function lwCells(p, ids, iso = '2026-07-18') {
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.evaluate(() => window.go('leavewar')); await p.waitForTimeout(1300)
  const mon = p.locator(`[data-testid="month-${new Date(iso).toLocaleString('en', { month: 'short' }).toUpperCase()}"]`)
  if (await mon.count()) { await mon.first().click(); await p.waitForTimeout(1200) }
  return p.evaluate(([ids, d]) => {
    const out = {}
    for (const id of ids) {
      const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`)
      out[window.PEOPLE[id]?.cs || id] = c ? { text: (c.innerText || '').replace(/\s+/g, ' ').trim(), cls: c.className.slice(0, 60), title: c.getAttribute('title') || '' } : 'NO CELL'
    }
    return out
  }, [ids, iso])
}
export async function lwTracker(p) {
  const btn = p.locator('[data-testid="oil-tracker"]').first()
  await btn.click(); await p.waitForTimeout(1000)
  return p.evaluate(() => {
    const s = document.querySelector('[data-testid="oil-sheet"]') || [...document.querySelectorAll('.sheet')].find(e => e.offsetParent)
    if (!s) return { open: false }
    return { open: true, text: (s.innerText || '').replace(/\s+/g, ' ').slice(0, 3000), entries: [...s.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200)) }
  })
}
export async function lwCloseSheet(p) {
  const x = p.locator('[data-testid="oil-close"]').first()
  if (await x.count() && await x.isVisible()) { await x.click(); await p.waitForTimeout(400); return }
  await p.keyboard.press('Escape'); await p.waitForTimeout(400)
}
