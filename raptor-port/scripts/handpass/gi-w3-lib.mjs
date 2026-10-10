// [GROUP-INPUT-ONE-ROW] walker W3 — shared helpers (own context per world, NO ?fresh=1)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileInput, press, csId, WIN, DESK, PHONE } from './gi-lib.mjs'
export { fileInput, press, csId, WIN, DESK, PHONE }

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const OUT = 'docs/img/handpass/2026-10-11-group-input-one-row/w3'
mkdirSync(OUT, { recursive: true })
export const BASE = 'http://localhost:4180/'
export const errs = []
export const ISO = '2026-07-15', DI = 2
export const FOUR = ['Drifter', 'Hunter', 'Ranger', 'Tally']
export const TITLE = 'Range safety brief'

export async function open(viewport, who = 'ad', pass = 'a', touch = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE)
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
  await page.waitForSelector('#vWeek .day, #loginForm', { state: 'attached' })
  await page.waitForTimeout(500)
  if (await page.locator('#loginForm').count() && await page.locator('#luser').isVisible().catch(() => false)) await login(page, who, pass)
}
export const shot = async (p, name, clip) => { await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); console.log('saved ' + name); return name + '.png' }

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
export async function closeAny(p) {
  for (const sel of ['.chgwin .win-x']) { if (await p.locator(sel).count() && await p.locator(sel).first().isVisible()) { await p.locator(sel).first().click().catch(() => {}); await p.waitForTimeout(200) } }
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.waitForTimeout(300)
}

/* ---------- sign and publish Wed through the board's sign-off line ---------- */
export async function signAndPublish(p, di = DI, touch = false) {
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

/* ---------- the five counts ---------- */
const num = s => { const m = /(\d+)\s+(?:pending|change)/i.exec(s || ''); return m ? +m[1] : null }
export async function dayHead(p, di = DI) {
  await toWeek(p)
  return p.evaluate(di => {
    const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]
    if (!day) return 'NO DAY'
    return day.innerText.slice(0, 260).replace(/\s+/g, ' ')
  }, di)
}
export async function pendingText(p, di = DI) {
  // read the day-head "N pending" element on the Edit Schedule week
  return p.evaluate(di => {
    const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]
    if (!day) return null
    const c = [...day.querySelectorAll('*')].filter(e => /\d+\s+pending/i.test(e.textContent) && e.textContent.length < 40 && !e.querySelector('*'))
    const hit = c.length ? c[c.length - 1] : [...day.querySelectorAll('*')].filter(e => /\d+\s+pending/i.test(e.textContent) && e.textContent.length < 40).pop()
    return hit ? hit.textContent.trim() : 'none (no "N pending" on the head)'
  }, di)
}
export async function boardHead(p, di = DI) {
  await toBoard(p, di)
  const r = await p.evaluate(di => {
    const b = document.querySelector('#schedBoard')
    if (!b) return null
    const hits = [...b.querySelectorAll('*')].filter(e => /\d+\s+(pending|change)/i.test(e.textContent) && e.textContent.length < 50 && !e.querySelector('*')).map(e => e.textContent.trim())
    return hits.length ? hits.join(' | ') : 'none'
  }, di)
  return r
}
export async function amendBox(p) {
  await toWeek(p)
  return p.evaluate(() => {
    // the Amendments panel: find the element whose text starts with Amendments
    const cand = [...document.querySelectorAll('#page-editsched *')].filter(e => /^\s*Amendments/i.test(e.textContent) && e.textContent.length < 800)
    cand.sort((a, b) => b.textContent.length - a.textContent.length)
    const el = cand.length ? cand[cand.length - 1] : null
    // choose the biggest container that still begins with Amendments but is not the whole page
    const best = cand.find(e => e.textContent.length > 20) || el
    return best ? best.innerText.replace(/\s+/g, ' ').slice(0, 400) : 'NO AMENDMENTS BOX FOUND'
  })
}
export async function openChanges(p, di = DI, touch = false) {
  await toWeek(p)
  await p.evaluate(di => {
    const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]
    const c = [...day.querySelectorAll('*')].filter(e => /\d+\s+pending/i.test(e.textContent) && e.textContent.length < 40 && !e.querySelector('*'))
    const t = c.length ? c[c.length - 1] : [...day.querySelectorAll('*')].filter(e => /\d+\s+pending/i.test(e.textContent) && e.textContent.length < 40).pop()
    if (t) t.setAttribute('data-gi', 'pend')
  }, di)
  if (!(await p.locator('[data-gi="pend"]').count())) return false
  await press(touch, p.locator('[data-gi="pend"]').first()); await p.waitForTimeout(700)
  return !!(await p.locator('.chgwin:not([hidden])').count())
}
export async function chgTitle(p) {
  return p.evaluate(() => { const w = document.querySelector('.chgwin'); if (!w) return null; const t = w.querySelector('.win-title, .win-t, h2, h3, header') ; return t ? t.innerText.replace(/\s+/g, ' ').trim() : w.innerText.split('\n')[0] })
}

/* ---------- the row, its pucks, its tags ---------- */
export const WEEKDAY = (di = DI) => `#eWeek .day:not(.peek):nth-of-type(${di + 1})`
export async function rowInfo(p, where = 'week', di = DI) {
  return p.evaluate(([where, di, title]) => {
    const norm = s => (s || '').trim().toLowerCase()
    const out = []
    if (where === 'week' || where === 'vweek') {
      const root = where === 'week' ? '#eWeek' : '#vWeek'
      const day = [...document.querySelectorAll(`${root} .day:not(.peek)`)][di]
      if (!day) return 'NO DAY'
      for (const r of day.querySelectorAll('.sec-grnd .pl-row')) {
        const nm = r.querySelector('.nm .ntx')?.textContent
        if (norm(nm) !== title) continue
        out.push({ name: nm, times: [...r.querySelectorAll('.t')].map(e => e.textContent.trim()).filter(Boolean), pucks: [...r.querySelectorAll('.ppl .seat')].map(s => { const pk = s.querySelector('.puck'); return (pk?.querySelector('.nm')?.textContent || '').trim() + (s.dataset.alp || s.dataset.alc || s.dataset.aln ? ` [alp=${s.dataset.alp ?? ''} alc=${s.dataset.alc ?? ''} aln=${s.dataset.aln ?? ''} tag=${getComputedStyle(s, '::after').content}]` : '') }), nameTag: (() => { const n = r.querySelector('.nm'); return n ? { alp: n.dataset.alp, alc: n.dataset.alc, aln: n.dataset.aln, html: n.outerHTML.slice(0, 260) } : null })(), rowAttrs: { alp: r.dataset.alp, alc: r.dataset.alc, aln: r.dataset.aln }, controls: r.querySelectorAll('[contenteditable=true], button, select, input').length })
      }
    } else {
      const b = document.querySelector('#schedBoard')
      for (const r of b.querySelectorAll('.sb-panel.grnd .sb-arow')) {
        const nm = (r.querySelector('textarea.ain, input.ain'))?.value
        if (norm(nm) !== title) continue
        out.push({ name: nm, pucks: [...r.querySelectorAll('.ppl .seat')].map(s => (s.querySelector('.puck .nm')?.textContent || '').trim() + (s.dataset.alp ? ` [alp=${s.dataset.alp}]` : '')) })
      }
    }
    return out
  }, [where, di, TITLE.toLowerCase()])
}
export async function allTags(p) {
  return p.evaluate(() => [...document.querySelectorAll('#eWeek .day:not(.peek) [data-alp], #eWeek .day:not(.peek) [data-alc], #eWeek .day:not(.peek) [data-aln]')].map(e => `${e.tagName}.${(e.className || '').toString().slice(0, 24)} slot=${e.dataset.slot || e.dataset.txt || ''} alp=${e.dataset.alp ?? ''} alc=${e.dataset.alc ?? ''} aln=${e.dataset.aln ?? ''} tag=${getComputedStyle(e, '::after').content} who=${(e.querySelector('.nm')?.textContent || '').trim()}`))
}

/* ---------- Undo / Redo ---------- */
export const undoBtn = p => p.locator('#sbUndo:visible, #undoBtn:visible').first()
export const redoBtn = p => p.locator('#sbRedo:visible, #redoBtn:visible').first()
export async function undoOnce(p, touch = false) {
  if (!(await p.locator('#sbUndo:visible, #undoBtn:visible').count())) await toWeek(p)
  const b = undoBtn(p)
  const was = await b.isDisabled().catch(() => null)
  if (was) return 'Undo button is disabled (nothing to undo)'
  await press(touch, b); await p.waitForTimeout(700)
  return 'pressed Undo; note: ' + await toastText(p)
}
export async function redoOnce(p, touch = false) {
  if (!(await p.locator('#sbRedo:visible, #redoBtn:visible').count())) await toWeek(p)
  const b = redoBtn(p)
  const was = await b.isDisabled().catch(() => null)
  if (was) return 'Redo button is disabled (nothing to redo)'
  await press(touch, b); await p.waitForTimeout(700)
  return 'pressed Redo; note: ' + await toastText(p)
}
export const toastText = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) : '' })

/* ---------- the typed boxes on the week ---------- */
export async function rowIdx(p, di = DI, title = TITLE) {
  return p.evaluate(([di, t]) => {
    const day = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
    for (const r of day.querySelectorAll('.sec-grnd .pl-row')) {
      const n = r.querySelector('[data-txt$=".prog"]')
      if (n && n.textContent.trim().toLowerCase() === t.toLowerCase()) return n.dataset.txt.split('.')[1]
    }
    return null
  }, [di, title])
}
export async function typeBox(p, key, val, touch = false) {
  const box = p.locator(`#eWeek [data-txt="${key}"]`).first()
  await box.scrollIntoViewIfNeeded()
  await press(touch, box); await p.waitForTimeout(150)
  await p.keyboard.press('Control+A'); await p.keyboard.type(val); await p.keyboard.press('Tab')
  await p.waitForTimeout(700)
  return box.textContent()
}
export async function retime(p, val = '14:30', touch = false, di = DI) {
  await toWeek(p)
  const ri = await rowIdx(p, di)
  return typeBox(p, `gr:${di}.${ri}.str`, val, touch)
}

/* ---------- a mouse drag, as a person does it ---------- */
export async function boxOf(loc) { await loc.scrollIntoViewIfNeeded(); return loc.boundingBox() }
export async function mouseDrag(p, from, to) {
  await p.mouse.move(from.x, from.y); await p.mouse.down()
  await p.waitForTimeout(120)
  await p.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 12 })
  await p.mouse.move(to.x, to.y, { steps: 12 })
  await p.waitForTimeout(250)
  await p.mouse.up(); await p.waitForTimeout(700)
}
export const centre = b => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 })
/* a touch hold-drag through the browser's own touch input */
export async function touchDrag(p, from, to, hold = 650) {
  const cdp = await p.context().newCDPSession(p)
  const T = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] })
  await T('touchStart', from.x, from.y); await p.waitForTimeout(hold)
  const steps = 14
  for (let i = 1; i <= steps; i++) { await T('touchMove', from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps); await p.waitForTimeout(25) }
  await p.waitForTimeout(250)
  await T('touchEnd', to.x, to.y); await p.waitForTimeout(800)
  await cdp.detach().catch(() => {})
}
/* the crew-list puck of a named man */
export async function rosterPuck(p, cs, where = 'week') {
  const id = await csId(p, cs)
  const sel = where === 'board' ? '#sbRoster' : '#eRoster'
  return p.locator(`${sel} .rpuck[data-person="${id}"]`).first()
}
/* the row's own pucks, week */
export function rowPuck(p, cs_id, di = DI, where = 'week') {
  return p.locator(`${where === 'week' ? '#eWeek .day:not(.peek)' : '#schedBoard'} ${where === 'week' ? '' : ''}[data-person="${cs_id}"]`)
}

/* ---------- a world: its own context, G4 (+ S1) filed, Wednesday signed and published ---------- */
import { writeFileSync, mkdirSync as mk } from 'node:fs'
export const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/d8268a45-08f2-4d0c-9187-3bf6599ee27f/scratchpad'
mk(SCR, { recursive: true })
export const save = (name, obj) => writeFileSync(join(SCR, name + '.json'), JSON.stringify(obj, null, 1))
export async function world(viewport, touch = false, { g4 = true, s1 = true, publish = true } = {}) {
  const { ctx, page } = await open(viewport, 'ad', 'a', touch)
  if (g4) await fileInput(page, { type: 'Meeting', people: FOUR, from: ISO, to: ISO, timed: ['14:00', '15:00'], title: TITLE }, touch)
  if (s1) await fileInput(page, { type: 'Training', person: 'Anvil', from: ISO, to: ISO, timed: ['10:00', '11:00'], title: 'S1 training' }, touch)
  let pub = null
  if (publish) pub = await signAndPublish(page, DI, touch)
  await toWeek(page)
  return { ctx, page, pub }
}
export async function fileG4(page, touch = false) {
  return fileInput(page, { type: 'Meeting', people: FOUR, from: ISO, to: ISO, timed: ['14:00', '15:00'], title: TITLE }, touch)
}

/* ---------- the five counts ---------- */
export async function counts(p, { di = DI, touch = false, keepWin = false } = {}) {
  const out = {}
  await toWeek(p)
  out.a = await p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; const s = d?.querySelector('.dstat'); if (!s) return 'NO .dstat'; const pend = s.querySelector('.dpend'); return (pend ? pend.textContent : s.innerText).replace(/\s+/g, ' ').trim() + '  [dstat: ' + s.innerText.replace(/\s+/g, ' ').trim() + ']' }, di)
  out.c = await p.evaluate(() => {
    const els = [...document.querySelectorAll('#page-editsched *')].filter(e => /^\s*AMENDMENTS/i.test(e.textContent) && e.textContent.length < 600)
    if (!els.length) return 'NO AMENDMENTS BOX'
    els.sort((x, y) => x.textContent.length - y.textContent.length)
    // innermost element that still holds the whole panel text: take the biggest under 600 chars
    const big = els[els.length - 1]
    return big.innerText.replace(/\s+/g, ' ').trim()
  })
  // changes window (read only: DOM click on the day's own count button)
  const had = await p.locator('.chgwin:not([hidden])').count()
  if (!had) {
    const bb = p.locator('#eWeek .day:not(.peek)').nth(di).locator('.dstat .dpend').first()
    await bb.scrollIntoViewIfNeeded(); await press(touch, bb)
    await p.waitForTimeout(800)
  }
  out.d = await p.evaluate(() => { const w = document.querySelector('.chgwin'); return w ? w.querySelector('.win-ttl')?.innerText.replace(/\s+/g, ' ').trim() : 'NO CHANGES WINDOW' })
  const tab = p.locator('.chgwin .win-tab', { hasText: /To go out/ })
  out.tabLabel = (await tab.count()) ? (await tab.first().innerText()).replace(/\s+/g, ' ') : 'no To-go-out tab'
  if (await tab.count()) { await tab.first().click(); await p.waitForTimeout(450) }
  out.e = await p.evaluate(() => { const h = document.querySelector('.chgwin .cw-out .pl-head'); return h ? h.innerText.replace(/\s+/g, ' ').trim() : 'no head (To go out empty / absent)' })
  out.lines = await p.evaluate(() => [...document.querySelectorAll('.chgwin .cw-out .pl-item')].map(i => i.innerText.replace(/\s+/g, ' ').trim()))
  if (!keepWin) { await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300) }
  // the board's head
  await toBoard(p, di)
  out.b = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); const s = b?.querySelector('.dstat') || b; const pend = b?.querySelector('.dpend'); return pend ? pend.textContent.trim() + '  [' + (b.querySelector('.dstat')?.innerText || '').replace(/\s+/g, ' ').trim() + ']' : 'no .dpend on board head' })
  await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
  await toWeek(p)
  out.n = nums(out)
  out.agree = out.n.every(x => x === out.n[0])
  return out
}
const first = (s, re) => { const m = re.exec(s || ''); return m ? +m[1] : null }
export function nums(o) {
  const z = x => (x == null ? 0 : x)
  const a = z(first(o.a, /(\d+)\s*pending/i))
  const b = z(first(o.b, /(\d+)\s*pending/i))
  const c = /No pending changes/i.test(o.c || '') ? 0 : z(first(o.c, /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*·\s*(\d+)\s*change/i) ?? first(o.c, /(\d+)\s+change/i))
  const d = z(first(o.d, /(\d+)\s+changes?\s+waiting/i))
  const e = z(first(o.e, /·\s*(\d+)\s+change/i) ?? first(o.tabLabel, /(\d+)\s*$/))
  return [a, b, c, d, e]
}
export const fmt = o => `(a)${o.a.split('  [')[0]} | (b)${o.b.split('  [')[0]} | (c)${o.c} | (d)${o.d} | (e)${o.e}${o.tabLabel ? ' [tab: ' + o.tabLabel + ']' : ''} => ${JSON.stringify(o.n)} ${o.agree ? 'AGREE' : 'DISAGREE'}`

export async function toView(p) {
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.waitForTimeout(200)
  await p.locator('a[data-page="viewsched"]').first().click(); await p.waitForTimeout(800)
}

/* ---------- pictures of the row and the day head ---------- */
export async function shotSec(p, name, where = 'week', di = DI, sec = 'grnd') {
  const sel = where === 'board' ? `#schedBoard .sb-panel.${sec}` : `${where === 'vweek' ? '#vWeek' : '#eWeek'} .day:not(.peek)`
  const loc = where === 'board' ? p.locator(sel).first() : p.locator(sel).nth(di).locator(`.sec-${sec}`).first()
  await loc.scrollIntoViewIfNeeded(); await p.waitForTimeout(250)
  await p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' }).catch(() => {})
  await loc.screenshot({ path: join(OUT, name + '.png') }); console.log('saved ' + name)
  await p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' }).catch(() => {})
  return name + '.png'
}
export async function shotHead(p, name, where = 'week', di = DI, h = 150) {
  const root = where === 'vweek' ? '#vWeek' : '#eWeek'
  await p.evaluate(([root, di]) => { const d = [...document.querySelectorAll(root + ' .day:not(.peek)')][di]; d.scrollIntoView({ block: 'nearest', inline: 'start' }); window.scrollTo(0, 0) }, [root, di])
  await p.waitForTimeout(300)
  const loc = p.locator(root + ' .day:not(.peek)').nth(di)
  const b = await loc.locator('.day-head').first().boundingBox()
  const vw = p.viewportSize()
  const clip = { x: Math.max(0, b.x), y: Math.max(0, b.y - 4), width: Math.min(b.width, vw.width - Math.max(0, b.x)), height: h }
  await p.screenshot({ path: join(OUT, name + '.png'), clip }); console.log('saved ' + name)
  return name + '.png'
}
export async function shotWin(p, name) {
  const loc = p.locator('.chgwin:not([hidden])').first()
  await p.waitForTimeout(200)
  await loc.screenshot({ path: join(OUT, name + '.png') }); console.log('saved ' + name)
  return name + '.png'
}
export const ritual = async (p, touch, rec, log = console.log) => {
  rec.undo = await undoOnce(p, touch); const u = await counts(p, { touch }); rec.undoCounts = fmt(u); log('  UNDO ->', rec.undo, '|', rec.undoCounts)
  rec.redo = await redoOnce(p, touch); const r = await counts(p, { touch }); rec.redoCounts = fmt(r); log('  REDO ->', rec.redo, '|', rec.redoCounts)
  await reload(p); const x = await counts(p, { touch }); rec.reloadCounts = fmt(x); log('  RELOAD ->', rec.reloadCounts)
  return { u, r, x }
}

/* ---------- take a man off the one row by dragging his puck to empty page ---------- */
export async function findEmpty(p) {
  return p.evaluate(() => {
    const bad = '.day, #eRoster, .topbar, .chgwin, #schedBoard, button, a, input, select, textarea, [data-fill], [data-slot], .rpuck, .puck, nav, header'
    const W = innerWidth, H = innerHeight
    const tries = []
    for (let y = 120; y < H - 60; y += 20) for (let x = 6; x < W - 6; x += 6) tries.push([x, y])
    for (const [x, y] of tries) {
      const el = document.elementFromPoint(x, y)
      if (el && !el.closest(bad)) return { x, y, tag: el.tagName + '.' + (el.className || '').toString().slice(0, 30) + '#' + el.id }
    }
    return null
  })
}
export function rowPuckLoc(p, name, where = 'week', di = DI) {
  const root = where === 'board' ? '#schedBoard .sb-panel.grnd .sb-arow' : '#eWeek .day:not(.peek)'
  if (where === 'board') return p.locator(root).filter({ has: p.locator(`textarea.ain, input.ain`) }).filter({ hasText: '' }).locator('.puck', { hasText: name }).first()
  return p.locator(root).nth(di).locator('.sec-grnd .pl-row', { hasText: 'RANGE SAFETY BRIEF' }).locator('.puck', { hasText: name }).first()
}
export async function dragOffRow(p, name, touch = false) {
  const loc = rowPuckLoc(p, name)
  const b = await boxOf(loc)
  const e = await findEmpty(p)
  if (!e) return { ok: false, why: 'no empty spot found' }
  if (touch) await touchDrag(p, centre(b), e)
  else await mouseDrag(p, centre(b), e)
  return { ok: true, dropped: e }
}
export async function dragNameOnto(p, fromName, ontoLoc, touch = false) {
  const src = await rosterPuck(p, fromName)
  const tgt = typeof ontoLoc === 'string' ? rowPuckLoc(p, ontoLoc) : ontoLoc
  await tgt.scrollIntoViewIfNeeded()
  await src.scrollIntoViewIfNeeded().catch(() => {})
  await p.waitForTimeout(200)
  const sb = await src.boundingBox(), tb = await tgt.boundingBox()
  if (touch) await touchDrag(p, centre(sb), centre(tb)); else await mouseDrag(p, centre(sb), centre(tb))
}

/* ---------- the look at an issued version ---------- */
export async function lookAt(p, which = 'Original', di = DI) {
  await toWeek(p)
  await p.locator('[data-planmenu="' + di + '"]').first().scrollIntoViewIfNeeded()
  await p.locator('[data-planmenu="' + di + '"]').first().click(); await p.waitForTimeout(500)
  await p.locator('.wavemenu button', { hasText: new RegExp('^' + which) }).first().click(); await p.waitForTimeout(900)
}
export async function pressLoad(p) {
  const b = p.locator('.dprev-restore').first()
  const first = (await b.innerText()).replace(/\s+/g, ' ')
  await b.click(); await p.waitForTimeout(700)
  const after = await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null && /discard|load|already|nothing|keep/i.test(b.textContent)).map(b => b.className + ': ' + b.textContent.trim().slice(0, 80)))
  return { first, after, toast: await toastText(p) }
}
export async function dragAdd(p, name, touch = false) {
  await toWeek(p)
  await dragNameOnto(p, name, 'Hunter', touch)
  return toastText(p)
}

export async function shotAmend(p, name) {
  await toWeek(p)
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.waitForTimeout(300)
  const ok = await p.evaluate(() => {
    const els = [...document.querySelectorAll('#page-editsched *')].filter(e => /^\s*AMENDMENTS/i.test(e.textContent) && e.textContent.length < 600)
    if (!els.length) return false
    els.sort((x, y) => x.textContent.length - y.textContent.length)
    els[els.length - 1].setAttribute('data-gi', 'amend'); return true
  })
  if (!ok) return null
  await p.locator('[data-gi="amend"]').first().screenshot({ path: join(OUT, name + '.png') }); console.log('saved ' + name)
  return name + '.png'
}
