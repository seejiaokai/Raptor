// Walker J of the one-rule walk (12 Oct 26): shared helpers. Real controls only; the probe bridge is READ only.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const BASE = 'http://localhost:4186/'
export const OUT = 'docs/img/handpass/2026-10-12-one-rule/J'
export const PARTS = 'docs/handpass/parts'
mkdirSync(OUT, { recursive: true }); mkdirSync(PARTS, { recursive: true })
export const DESK = { width: 1440, height: 900 }
export const WIN = '[data-testid="win-inputedit"]'
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const errs = []
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

/* a world: its own context. fresh=true opens ?fresh=1 (memory only). clock: the browser's date set three weeks before the week. */
export async function open({ who = 'ad', pass = 'a', fresh = false, clock = '2026-06-22T09:00:00', viewport = DESK } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  if (clock) await page.clock.setFixedTime(new Date(clock))
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 260)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 260)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.addInitScript(() => {
    window.__toasts = []
    const go = () => new MutationObserver(ms => { const hit = ms.some(m => { const n = m.target; const el = n.nodeType === 1 ? n : n.parentElement; return (el && (el.id === 'toastEl' || el.closest('#toastEl'))) || [...m.addedNodes].some(x => x.id === 'toastEl') }); if (!hit) return; const t = document.getElementById('toastEl'); if (t && t.style.opacity === '1') window.__toasts.push({ text: t.textContent }) }).observe(document.documentElement, { subtree: true, childList: true, characterData: true })
    if (document.documentElement) go(); else document.addEventListener('DOMContentLoaded', go)
  })
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
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
export const shot = async (p, name, clip) => { await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); console.log('saved ' + name); return name + '.png' }
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const toastMark = p => p.evaluate(() => (window.__toasts || []).length)
export const toastsSince = async (p, m) => (await p.evaluate(m => (window.__toasts || []).slice(m).map(t => t.text), m)).filter((t, i, a) => i === 0 || t !== a[i - 1]).join(' || ')
export const toast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.innerText || t.textContent || '').replace(/\s+/g, ' ').trim() : '' })

/* ---------- filing through the Inputs page's "+ Input" ---------- */
async function pick(p, iso) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click()
  }
  await p.locator(`#inpEdCal [data-cal="${iso}"]`).click()
}
/* spec: {type, person, people:[cs…], from, to, title, rmk, timed:[s,e], oil, docs:'nodoc'|… , sick} */
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
    const pressed = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), WIN)
    for (const pid of pressed) if (!want.includes(pid)) await p.locator(`${WIN} [data-pp="${pid}"]`).click()
  }
  if (spec.from) await pick(p, spec.from)
  if (spec.to) await pick(p, spec.to)
  if (spec.timed) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await p.locator('#inpEditAllday').click()
    await p.fill('#inpEditStart', spec.timed[0]); await p.fill('#inpEditEnd', spec.timed[1])
  }
  if (spec.title != null) await p.fill('#inpEditOwnTitle', spec.title)
  if (spec.rmk != null) await p.fill('#inpEditRmk', spec.rmk)
  if (spec.beforeSave) await spec.beforeSave(p)
  await p.locator('#inpEditSave').click()
  await p.waitForTimeout(350)
  const log = []
  for (let k = 0; k < 4; k++) {
    const sheet = p.locator('[data-testid="oilconf"]')
    if (await sheet.count()) {
      const how = spec.oil || 'no'
      const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
      await ((await one.count()) ? one : many).click()
      await sheet.locator('[data-testid="oilconf-save"]').click(); log.push('oil:' + how)
    } else if (await p.locator('[data-testid="docconf"]').count()) { await p.locator('[data-testid="docconf-nodoc"]').click(); log.push('nodoc') }
    else break
    await p.waitForTimeout(300)
  }
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  const filed = await p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, cs: window.PEOPLE[r.person]?.cs, type: r.type, title: r.title, date: r.date, to: r.to, s: r.s, e: r.e, grp: r.grp || null, people: r.people ? r.people.map(e => window.PEOPLE[e.p]?.cs || e.p) : undefined, acc: r.acc || null })), had)
  filed.__dialogs = log
  return filed
}

/* what window.INPUTS says, compact */
export const inputsDump = (p, filter = null) => p.evaluate(f => window.INPUTS.filter(r => !f || (r.type === f || r.title === f)).map(r => ({ iid: r.iid, type: r.type, title: r.title || '', cs: window.PEOPLE[r.person]?.cs, people: r.people ? r.people.map(e => window.PEOPLE[e.p]?.cs || e.p) : undefined, date: r.date, to: r.to, s: r.s, e: r.e, rmk: r.remarks || r.rmk || '', cx: r.cx || undefined, grp: r.grp ? JSON.stringify(r.grp).slice(0, 80) : undefined })), filter)

/* ---------- navigation ---------- */
export async function toWeek(p) {
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.waitForTimeout(200)
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
}
export async function toBoard(p, di = 2) {
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(300)
  await p.evaluate(d => window.openScheduler(d), di); await p.waitForTimeout(900)
}
export const undoBtn = async p => ((await p.locator('#schedBoard #sbUndo:visible').count()) ? p.locator('#schedBoard #sbUndo').first() : p.locator('#undoBtn:visible').first())
export const redoBtn = async p => ((await p.locator('#schedBoard #sbRedo:visible').count()) ? p.locator('#schedBoard #sbRedo').first() : p.locator('#redoBtn:visible').first())
export async function undoOnce(p) {
  const b = await undoBtn(p)
  if (await b.isDisabled().catch(() => true)) return 'Undo disabled'
  const m = await toastMark(p)
  await b.click(); await p.waitForTimeout(800)
  return 'pressed Undo; note: ' + await toastsSince(p, m)
}
export async function redoOnce(p) {
  const b = await redoBtn(p)
  if (await b.isDisabled().catch(() => true)) return 'Redo disabled'
  const m = await toastMark(p)
  await b.click(); await p.waitForTimeout(800)
  return 'pressed Redo; note: ' + await toastsSince(p, m)
}
export async function mouseDrag(p, from, to) {
  await p.mouse.move(from.x, from.y); await p.mouse.down()
  await p.waitForTimeout(120)
  await p.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 12 })
  await p.mouse.move(to.x, to.y, { steps: 12 })
  await p.waitForTimeout(250)
  await p.mouse.up(); await p.waitForTimeout(800)
}
export const centre = b => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 })

/* ---------- results ---------- */
export const results = []
export function judge(id, row) { results.push({ id, ...row }); console.log(`[${id}] ${row.verdict}: ${(row.saw || '').slice(0, 300)}`) }
export function savePart(letter, extra = {}) {
  const f = join(PARTS, `or-${letter}.json`)
  let prev = {}
  try { prev = JSON.parse(readFileSync(f, 'utf8')) } catch {}
  const byId = { ...(prev.rows || {}) }
  for (const r of results) byId[r.id] = r
  writeFileSync(f, JSON.stringify({ rows: byId, errors: [...new Set([...(prev.errors || []), ...errs])], ...extra }, null, 1))
}

/* ---------- week reading and drags ---------- */
export const PID = { Drifter: 'slipway', Hex: 'rocky', Tally: 'nick', Grit: 'sufa', Hunter: 'prowler', Ranger: 'bane', Saber: 'stiff', Anvil: 'shaft', Blade: 'slash' }
/* bring an element to a place where the crew panel (right edge) does not cover it */
export async function reveal(loc) {
  await loc.evaluate(e => { const day = e.closest('.day'); if (day) day.scrollIntoView({ inline: 'start', block: 'nearest' }); e.scrollIntoView({ block: 'center', inline: 'nearest' }) })
  await loc.page().waitForTimeout(250)
  return loc.boundingBox()
}
/* the Unavailable rows of day di on the week: [{row text, who, iid tail}] */
export const unavRows = (p, di = 2) => p.evaluate(di => {
  const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
  return [...d.querySelectorAll('.sec-unav .pl-row')].map(r => ({ text: r.innerText.replace(/\s+/g, ' ').trim(), people: [...r.querySelectorAll('.ppl .puck .nm')].map(n => n.textContent.trim()), seat: [...r.querySelectorAll('[data-inpseat]')].map(s => s.dataset.inpseat) }))
}, di)
export const rosterPuck = (p, cs) => p.locator(`#eRoster .rpuck[data-person="${PID[cs]}"]`).first()
export const toWeekDay = async (p, di = 2) => { await toWeek(p); await p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; d.scrollIntoView({ inline: 'start', block: 'nearest' }) }, di); await p.waitForTimeout(300) }
/* the Inputs calendar: open a day's card (Enter on the focused date), return the cards' text */
export async function calDay(p, iso) {
  await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(400)
  if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) { await p.locator('#inCalBtn').click(); await p.waitForTimeout(300) }
  const mon = async () => { const [m, y] = (await p.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
  const [Y, M] = iso.split('-').map(Number)
  let d = Y * 12 + (M - 1) - await mon()
  for (; d > 0; d--) await p.locator('#icNext').click()
  for (; d < 0; d++) await p.locator('#icPrev').click()
  await p.waitForTimeout(250)
}
/* the landing flash: elements wearing the mark right now */
export const flashNow = p => p.evaluate(() => [...document.querySelectorAll('.lift-land')].filter(e => e.getClientRects().length).map(e => ({
  tag: e.tagName.toLowerCase(), cls: e.className.toString().replace(/\s+/g, ' ').slice(0, 60), text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 60),
  inpseat: e.dataset.inpseat || e.closest('[data-inpseat]')?.dataset.inpseat || null, inprow: e.dataset.inprow || e.closest('[data-inprow]')?.dataset.inprow || null,
  sec: e.closest('.sub')?.className.match(/sec-\w+/)?.[0] || null })))

/* ---------- the board, OIL Earn, publishing ---------- */
export async function openBoard(p, di) {
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(400)
  await p.evaluate(d => window.openScheduler(d), di); await p.waitForTimeout(900)
}
export async function oilOn(p, on = true) {
  const pressed = async () => (await p.locator('#sbOil').getAttribute('aria-pressed')) === 'true'
  if ((await pressed()) !== on) { await p.locator('#sbOil').click(); await p.waitForTimeout(700) }
}
export async function openCount(p, iid, nth = 0) { await p.locator(`#schedBoard .oilcount[data-oilsent="i:${iid}"]:visible`).nth(nth).click(); await p.waitForTimeout(500) }
export async function winState(p) {
  return p.evaluate(() => {
    const w = document.querySelector('.availwin'); if (!w) return null
    const seats = {}
    for (const s of w.querySelectorAll('.seat.oilpk')) seats[(window.PEOPLE[s.dataset.oilp]?.cs) || s.dataset.oilp] = ['on', 'off', 'inert'].find(k => s.classList.contains(k)) || '?'
    const tabs = [...w.querySelectorAll('.win-tab')].map(t => t.innerText.replace(/\s+/g, ' ').trim())
    const on = Object.values(seats).filter(v => v === 'on').length
    return { tabs, seats, on, off: Object.entries(seats).filter(([, v]) => v === 'off').map(([k]) => k), total: Object.keys(seats).length, text: w.innerText.replace(/\s+/g, ' ').slice(-300) }
  })
}
export async function closeWin(p) { const x = p.locator('.availwin .win-x'); if (await x.count()) { await x.first().click(); await p.waitForTimeout(300) } }
export async function signAndPublish(p, di) {
  await openBoard(p, di)
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
/* the Leave War cell of a man on a date */
export async function lwOpen(p, mon = 'jul') {
  await p.evaluate(() => window.go('leavewar')); await p.waitForTimeout(1200)
  const m = p.locator(`[data-testid="month-${mon}"], [data-testid="month-${mon.toUpperCase()}"]`); if (await m.count()) { await m.first().click(); await p.waitForTimeout(900) }
}
export const lwCellsOf = (p, ids, dates) => p.evaluate(([ids, dates]) => ids.map(id => (window.PEOPLE[id]?.cs || id) + ': ' + dates.map(d => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); return d.slice(5) + '=' + (c ? '"' + c.innerText.trim().replace(/\s+/g, ' ') + '"' : 'none') }).join(' ')).join('\n'), [ids, dates])
