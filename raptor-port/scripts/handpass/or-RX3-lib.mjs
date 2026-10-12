// Walker RX3 helpers (one-rule second re-walk, 12 Oct 26). Copied in spirit from or-RW3-lib / or-F-lib / or-RW2-lib.
// Real controls only; window.INPUTS / PEOPLE / DAYS are READ only. Run from raptor-port/.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const BASE = 'http://localhost:4186/'
export const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-12-one-rule/RX3'
export const PARTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts'
mkdirSync(OUT, { recursive: true }); mkdirSync(PARTS, { recursive: true })
export const DESK = { width: 1440, height: 900 }
export const PHONE = { width: 390, height: 844 }
export const WIN = '[data-testid="win-inputedit"]'
export const ISO = '2026-07-15', DI = 2
export const errs = []
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

export async function wire(page, tag) {
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 300)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 300)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.addInitScript(() => {
    window.__toasts = []
    const go = () => new MutationObserver(ms => { const hit = ms.some(m => { const n = m.target; const el = n.nodeType === 1 ? n : n.parentElement; return (el && (el.id === 'toastEl' || el.closest('#toastEl'))) || [...m.addedNodes].some(x => x.id === 'toastEl') }); if (!hit) return; const t = document.getElementById('toastEl'); if (t && t.style.opacity === '1') window.__toasts.push({ text: t.textContent, at: performance.now() }) }).observe(document.documentElement, { subtree: true, childList: true, characterData: true })
    if (document.documentElement) go(); else document.addEventListener('DOMContentLoaded', go)
  })
}
/* a world: its own context, signed in, clock 3 weeks before the week. fresh=false by default (a reload keeps what was saved). */
export async function open(who = 'ad', pass = 'a', { clock = '2026-06-22T09:00:00', fresh = false, viewport = DESK, phone = false, storageState } = {}) {
  const opts = phone ? { viewport: PHONE, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport, deviceScaleFactor: 1 }
  if (storageState) opts.storageState = storageState
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  await wire(page, phone ? 'phone' : 'desk')
  if (clock) await page.clock.setFixedTime(new Date(clock))
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who, pass, phone)
  return { ctx, page }
}
export async function login(page, who = 'ad', pass = 'a', touch = false) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  if (touch) await page.locator('#loginForm button[type=submit]').tap(); else await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
}
export async function reload(page, who = 'ad', pass = 'a') {
  await page.reload()
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForSelector('#vWeek .day, #loginForm', { state: 'attached' })
  await page.waitForTimeout(600)
  let signedAgain = false
  if (await page.locator('#loginForm').isVisible().catch(() => false)) { await login(page, who, pass); signedAgain = true }
  return signedAgain
}
export const shot = async (p, name, clip) => { await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); console.log('saved ' + name); return name + '.png' }
export const shotEl = async (loc, name) => {
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  try { await loc.screenshot({ path: join(OUT, name + '.png'), timeout: 8000 }) }
  catch { await loc.page().screenshot({ path: join(OUT, name + '.png') }) }
  console.log('saved ' + name); return name + '.png'
}
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const toast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.innerText || t.textContent || '').replace(/\s+/g, ' ').trim() : '' })
export const toastMark = p => p.evaluate(() => (window.__toasts || []).length)
export const toastsSince = async (p, m) => (await p.evaluate(m => (window.__toasts || []).slice(m).map(t => t.text), m)).filter((t, i, a) => i === 0 || t !== a[i - 1]).join(' || ')
export const j = o => JSON.stringify(o)

/* ---------- filing through "+ Input" ---------- */
async function pick(p, iso, touch) {
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
    const pressed = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), WIN)
    for (const pid of pressed) if (!want.includes(pid)) await p.locator(`${WIN} [data-pp="${pid}"]`).click()
  }
  if (spec.from) await pick(p, spec.from)
  if (spec.to) await pick(p, spec.to)
  if (spec.timed) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await p.locator('#inpEditAllday').click()
    if (await p.locator(`${WIN} [data-span="custom"]`).count() && (await p.locator(`${WIN} [data-span="custom"]`).getAttribute('aria-pressed')) !== 'true') await p.locator(`${WIN} [data-span="custom"]`).click()
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
  return p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, cs: window.PEOPLE[r.person]?.cs, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, people: (r.people || []).map(e => window.PEOPLE[e.p]?.cs || e.p) })), had)
}
export const inputOf = (p, iid) => p.evaluate(id => { const r = window.INPUTS.find(x => x.iid === id); if (!r) return null; return { type: r.type, title: r.title || '', date: r.date, to: r.to || null, s: r.s, e: r.e, people: (r.people || []).map(e => window.PEOPLE[e.p]?.cs || e.p), by: r.by } }, iid)
export const allInputs = p => p.evaluate(() => window.INPUTS.map(r => ({ iid: r.iid.slice(-5), type: r.type, title: r.title || '', date: r.date, to: r.to || null, s: r.s, e: r.e, people: (r.people || []).map(e => window.PEOPLE[e.p]?.cs || e.p), by: window.PEOPLE[r.by]?.cs || r.by })))

/* ---------- navigation ---------- */
export async function toWeek(p) {
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.waitForTimeout(200)
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
}
export async function toBoard(p, di = DI) {
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(300)
  await p.evaluate(d => window.openScheduler(d), di); await p.waitForTimeout(900)
}
export async function toView(p) {
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.waitForTimeout(200)
  await p.evaluate(() => window.go('viewsched')); await p.waitForTimeout(900)
}
export const day = (p, di = DI) => p.locator('#eWeek .day:not(.peek)').nth(di)
export async function scrollToSec(p, key, di = DI) {
  await p.evaluate(([di, key]) => {
    const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
    d.scrollIntoView({ inline: 'start', block: 'nearest' })
    const sec = d.querySelector(`[data-secmove="${di}.${key}"]`)
    if (sec) { const y = sec.getBoundingClientRect().top + window.scrollY - 96; window.scrollTo(0, Math.max(0, y)) }
  }, [di, key])
  await p.waitForTimeout(300)
}
export async function openFold(p, surface = 'week', di = DI) {
  const rows = () => p.evaluate(sf => document.querySelectorAll(sf === 'board' ? '#schedBoard .pinp .sb-arow' : '#eWeek .day:not(.peek) .sec-inp .pl-row').length, surface)
  if (await rows()) return
  const sel = surface === 'board' ? `#schedBoard [data-pitog="${di}"]` : `#eWeek .day:not(.peek) [data-pitog="${di}"]`
  const f = p.locator(sel).first()
  if (await f.count()) { await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await f.click(); await p.waitForTimeout(450) }
}

/* ---------- publish ---------- */
export async function signAndPublish(p, di = DI) {
  await toBoard(p, di)
  const sels = p.locator(`#schedBoard [data-signday="${di}"]`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await p.waitForTimeout(150)
  }
  await p.waitForTimeout(300)
  const signRead = await readSignoffs(p, di)
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
  return { ok: true, label, version: ver, selects: n, signRead }
}
/* the four sign-off boxes on the board: [selected text each] */
export const readSignoffs = (p, di = DI) => p.evaluate(di => [...document.querySelectorAll(`#schedBoard [data-signday="${di}"]`)].map(s => { const o = s.selectedOptions[0]; return { key: s.getAttribute('data-sign') || s.id || s.name || '', value: s.value, text: o ? o.textContent.trim() : '' } }), di)
export async function boardSignoffs(p, di = DI, shotName = null) {
  await toBoard(p, di)
  const r = await readSignoffs(p, di)
  const head = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); const v = b?.querySelector('.verchip'); return { ver: v ? v.innerText.replace(/\s+/g, ' ').trim() : '', pend: (b?.querySelector('.dpend')?.textContent || '').trim() } })
  head.signedLine = await p.evaluate(() => { const els = [...document.querySelectorAll('#schedBoard *')].filter(e => /^\s*SIGNED/i.test(e.textContent) && e.textContent.length < 400); els.sort((a, b) => a.textContent.length - b.textContent.length); const e = els[els.length - 1]; return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(no signed line)' })
  head.toSign = await p.evaluate(() => { const els = [...document.querySelectorAll('#schedBoard *')].filter(e => /to sign/i.test(e.textContent) && e.textContent.length < 120 && !e.querySelector('*')); return els.map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' | ') })
  if (shotName) await shot(p, shotName)
  await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
  return { boxes: r, head }
}

/* ---------- the counts for one day ---------- */
const first = (s, re) => { const m = re.exec(s || ''); return m ? +m[1] : null }
export async function counts(p, { di = DI, keepWin = false, noBoard = false } = {}) {
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
  if (!noBoard) {
    await toBoard(p, di)
    out.b = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); const pend = b?.querySelector('.dpend'); return pend ? pend.textContent.trim() : 'no .dpend on board head' })
    await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
    await toWeek(p)
  }
  out.n = nums(out)
  out.agree = out.n.every(x => x === out.n[0])
  return out
}
export function nums(o) {
  const z = x => (x == null ? 0 : x)
  const a = z(first(o.a, /(\d+)\s*pending/i))
  const b = o.b == null ? a : z(first(o.b, /(\d+)\s*pending/i))
  const c = /No pending changes/i.test(o.c || '') ? 0 : z(first(o.c, /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*·\s*(\d+)\s*change/i) ?? first(o.c, /(\d+)\s+change/i))
  const d = z(first(o.d, /(\d+)\s+changes?\s+waiting/i))
  const e = z(first(o.e, /·\s*(\d+)\s+change/i) ?? first(o.tabLabel, /(\d+)\s*$/))
  return [a, b, c, d, e]
}
export const fmt = o => `chip: ${o.a.split('  [')[0]} | board: ${o.b} | Amendments box: ${o.c} | window title: ${o.d} | To go out head: ${o.e} [tab: ${o.tabLabel}] | lines: ${j(o.lines)} => ${j(o.n)} ${o.agree ? 'AGREE' : 'DISAGREE'}`

/* ---------- the changes window (History) ---------- */
export const winRead = p => p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return null; return { title: (w.querySelector('.win-ttl')?.innerText || '').replace(/\s+/g, ' ').trim(), tabs: [...w.querySelectorAll('.win-tab')].map(t => t.innerText.replace(/\s+/g, ' ').trim() + (t.classList.contains('on') ? ' [on]' : '')), lines: [...w.querySelectorAll('.cw-l, .cw-gh, .pl-item')].map(b => (b.className.toString().slice(0, 8)) + ' :: ' + (b.innerText || '').replace(/\s+/g, ' ').trim()) } })
export async function openHistoryAllChanges(p, dayLabel = 'Wed') {
  await toWeek(p)
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300)
  if (!(await p.locator('.chgwin:not([hidden])').count())) { await p.locator('#histBtn').click(); await p.waitForTimeout(800) }
  await p.locator('.chgwin .win-tab', { hasText: 'All changes' }).click(); await p.waitForTimeout(500)
  await p.locator('.chgwin .cw-day', { hasText: dayLabel }).click(); await p.waitForTimeout(500)
  return winRead(p)
}
/* what is ringed / flashed right now (the "where the ring lands" read) */
export const flash = p => p.evaluate(() => [...document.querySelectorAll('.lift-land, .chgflash, .hl-jump, .jumpflash, [class*=flash]')].filter(e => e.getClientRects().length).map(e => ({ cls: e.className.toString().slice(0, 50), puck: (e.closest('.puck') ? e.closest('.puck').innerText : (e.matches('.puck') ? e.innerText : '')).replace(/\s+/g, ' ').trim(), text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 60), row: (e.closest('.pl-row')?.innerText || '').replace(/\s+/g, ' ').slice(0, 60), fill: e.closest('[data-fill]')?.dataset.fill || null }))).catch(() => [])

/* ---------- mouse ---------- */
export async function drag(p, fromLoc, to, { steps = 14, wait = 150 } = {}) {
  await fromLoc.scrollIntoViewIfNeeded().catch(() => {})
  const fb = await fromLoc.boundingBox(); if (!fb) throw new Error('drag: no box for source')
  const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2
  let t
  if (to.x != null) t = { x: to.x, y: to.y }
  else { const tb = await to.boundingBox(); if (!tb) throw new Error('drag: no box for target'); t = { x: tb.x + tb.width / 2, y: tb.y + tb.height / 2 } }
  await p.mouse.move(fx, fy); await p.mouse.down()
  await p.mouse.move(fx + 6, fy + 6, { steps: 3 })
  await p.mouse.move(t.x, t.y, { steps })
  await p.waitForTimeout(wait)
  await p.mouse.move(t.x + 1, t.y + 1)
  await p.waitForTimeout(wait)
  await p.mouse.up()
  await p.waitForTimeout(700)
}
export const rosterPuck = async (p, cs, board) => p.locator(`${board ? '#sbRoster' : '#eRoster'} .rpuck[data-person="${await csId(p, cs)}"]:visible`).first()
/* ground row index on a day for an input */
export const rowIdx = (p, di, iid) => p.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [di, iid])

/* a real drag over a distance longer than the screen: button held down, the wheel turned while holding (as a person would), then dropped on the target */
export async function dragFar(p, fromLoc, toLoc, { steps = 25, wait = 250 } = {}) {
  await fromLoc.scrollIntoViewIfNeeded().catch(() => {})
  const fb = await fromLoc.boundingBox(); if (!fb) throw new Error('dragFar: no box for source')
  const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2
  await p.mouse.move(fx, fy); await p.mouse.down()
  await p.mouse.move(fx + 6, fy + 6, { steps: 3 })
  await p.mouse.move(fx + 20, Math.min(fy + 40, 600), { steps: 4 })
  for (let k = 0; k < 14; k++) {
    const tb = await toLoc.boundingBox(); if (!tb) break
    if (tb.y > 700) { await p.mouse.wheel(0, Math.min(500, tb.y - 450)); await p.waitForTimeout(250) }
    else if (tb.y < 150) { await p.mouse.wheel(0, -Math.min(500, 450 - tb.y)); await p.waitForTimeout(250) }
    else break
  }
  const tb = await toLoc.boundingBox(); if (!tb) { await p.mouse.up(); throw new Error('dragFar: target lost') }
  const t = { x: tb.x + tb.width / 2, y: tb.y + tb.height / 2 }
  await p.mouse.move(t.x, t.y, { steps })
  await p.waitForTimeout(wait)
  await p.mouse.move(t.x + 1, t.y + 1)
  await p.waitForTimeout(wait)
  await p.mouse.up()
  await p.waitForTimeout(800)
}

/* drag a roster man onto the "+ add" of an input's row on the week */
export async function addOntoRow(p, cs, iid, di = DI) {
  let t = ''
  for (let k = 0; k < 3 && !t; k++) {
    await toWeek(p)
    if (await p.locator('.chgwin:not([hidden])').count()) { await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300) }
    const ri = await rowIdx(p, di, iid)
    const d = day(p, di)
    await d.locator(`[data-fill="g:${di}.${ri}.+"]`).first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 120)); await p.waitForTimeout(300)
    const m = await toastMark(p)
    await drag(p, await rosterPuck(p, cs), d.locator(`[data-fill="g:${di}.${ri}.+"] .addz`).first())
    t = await toastsSince(p, m)
    if (!t) console.log('   (drag attempt ' + (k + 1) + ' gave no note - retrying like a person would)')
  }
  return t
}
/* right-click a man's puck off the input's row on the week */
export async function takeOffRow(p, cs, iid, di = DI) {
  await toWeek(p)
  const ri = await rowIdx(p, di, iid)
  const d = day(p, di)
  await d.locator(`[data-fill="g:${di}.${ri}.+"]`).first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 120)); await p.waitForTimeout(300)
  const m = await toastMark(p)
  await d.locator(`[data-fill="g:${di}.${ri}.+"] [data-person="${await csId(p, cs)}"]`).first().click({ button: 'right' }); await p.waitForTimeout(700)
  return toastsSince(p, m)
}
/* the row's pucks as drawn: [{who, cls}] */
export const rowPucks = (p, iid, di = DI) => p.evaluate(([iid, di]) => {
  const ri = (window.DAYS[di].ground || []).findIndex(g => g.src === iid)
  const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
  const f = d.querySelector(`[data-fill="g:${di}.${ri}.+"]`)
  const row = f ? (f.closest('.pl-row') || f.parentElement) : null
  if (!row) return null
  return [...row.querySelectorAll('.ppl .puck')].map(pk => ({ who: (pk.querySelector('.nm')?.textContent || pk.textContent).trim(), cls: pk.className.toString().replace(/\s+/g, ' ').slice(0, 90), tag: [...pk.querySelectorAll('*')].filter(e => /amd|tag|pend|hollow|mark/i.test(e.className.toString())).map(e => e.className.toString().slice(0, 30)).join(','), html: pk.innerHTML.replace(/\s+/g, ' ').slice(0, 220) }))
}, [iid, di])
export async function undoRedo(p, which) {
  const board = await p.evaluate(() => window.SBDAY != null && !!document.querySelector('#schedBoard'))
  const ids = board ? [which === 'undo' ? '#sbUndo' : '#sbRedo', which === 'undo' ? '#undoBtn' : '#redoBtn'] : [which === 'undo' ? '#undoBtn' : '#redoBtn']
  for (const id of ids) {
    const b = p.locator(id + ':visible').first()
    if (await b.count()) { if (await b.isDisabled()) return { used: id + ' (disabled)', ok: false }; await b.click(); await p.waitForTimeout(700); return { used: id, ok: true, toast: await toast(p) } }
  }
  return { used: 'none visible', ok: false }
}
/* open an input's own window from the Inputs list */
export async function openFromList(p, iid) {
  await p.evaluate(() => window.go('inputs'))
  await p.waitForTimeout(300)
  if (await p.locator(WIN).count()) { await p.locator('#inpEditCancel').click().catch(() => {}); await p.waitForTimeout(150) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await p.locator('#inListBtn').click(); await p.waitForTimeout(250) }
  const el = p.locator(`[data-popiid="${iid}"], [data-iid="${iid}"], [data-listiid="${iid}"]`).first()
  if (!(await el.count())) { await p.locator('#inRangeBtn').click(); await p.waitForTimeout(250); if (await p.locator('#inRangeAll').count()) await p.locator('#inRangeAll').click(); await p.waitForTimeout(350) }
  if (!(await el.count())) throw new Error('list row missing')
  await el.scrollIntoViewIfNeeded().catch(() => {})
  await el.click()
  await p.locator(WIN).waitFor()
  await p.waitForTimeout(250)
}
export const results = {}
export function saveRes(id, obj) { results[id] = obj; writeFileSync(join(PARTS, `or-RX3-${id}-raw.json`), JSON.stringify(obj, null, 1)) }

/* sign out / in within one page life */
export async function signOut(p) {
  const b = p.locator('#logout:visible').first()
  if (await b.count()) await b.click(); else await p.evaluate(() => document.getElementById('logout').click())
  await p.waitForSelector('#loginForm', { timeout: 6000 })
}
export async function signIn(p, u, pw) {
  await p.fill('#luser', u); await p.fill('#lpass', pw)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' })
  await p.waitForTimeout(600)
}
