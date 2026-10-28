// FULL bug-check walk of [LW-WHOLE-LEAVE-WINDOW] (his D1448, D1461): a tap on any day of a leave of several days opens the
// bid window on the WHOLE leave; "All <n> days" / the day tapped choose what Approve, Refuse, Move and Delete act on.
// Run from raptor-port/ against a build served on PORT (default 4183):
//   node scripts/handpass/lw-whole-walk.mjs            (everything)   ONLY=W1,W2  SIZES=phone,desk  to filter
// Phone = WebKit, iPhone 13 profile at 402 x 874 (W13 also 360 x 780); desktop = Chromium 1536 x 864 at 1.25.
import { webkit, chromium, devices } from '@playwright/test'
import path from 'node:path'
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-28-lw-whole-leave/walk')
const RES = path.resolve(here, '../../docs/handpass/parts/lw-whole/walk-results.json')
mkdirSync(OUT, { recursive: true }); mkdirSync(path.dirname(RES), { recursive: true })
const PORT = process.env.PORT || 4183
const BASE = `http://localhost:${PORT}/`
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const SIZESET = process.env.SIZES ? process.env.SIZES.split(',') : null
console.log('lw-whole-walk v1 | port ' + PORT + ' | ONLY=' + (ONLY || 'all') + ' SIZES=' + (SIZESET || 'all'))
if (!ONLY) for (const f of readdirSync(OUT)) if (f.endsWith('.png') && !f.startsWith('_')) unlinkSync(path.join(OUT, f))

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
let wk = null, cr = null
const T = id => `[data-testid="${id}"]`
const P0 = 'slipway'
const dates = (from, n) => Array.from({ length: n }, (_, i) => { const d = new Date(from + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10) })
const sleep = (page, ms) => page.waitForTimeout(ms)

const results = []
function rec(id, size, verdict, notes, pics, fails) {
  results.push({ id, size, verdict, notes, pics, fails })
  console.log(`${verdict}  ${id} [${size}]  ${fails.length ? 'FAILS: ' + fails.join(' || ') : ''}`)
  for (const n of notes) console.log('     . ' + n)
  console.log('     pics: ' + pics.join(', '))
}

async function signIn(S, who) {
  const page = S.page
  await page.waitForSelector('#luser')
  await page.evaluate(() => window.lwSetMemberToday('2026-01-02'))
  await page.fill('#luser', who === 'admin' ? 'ad' : 'us'); await page.fill('#lpass', who === 'admin' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.lwSetMemberToday('2026-01-02'))
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(T(who === 'admin' ? 'row-slipway' : 'row-bane'), { state: 'attached', timeout: 20000 })
  await sleep(page, 700)
  if (who === 'admin') await page.evaluate(() => window.lwSetViewer(null))
  await sleep(page, 200)
}

async function makeWorld(size, id) {
  const phone = size.startsWith('phone')
  const b = phone ? (wk ||= await webkit.launch()) : (cr ||= await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}))
  const vp = size === 'phone' ? { width: 402, height: 874 } : size === 'phone360' ? { width: 360, height: 780 } : { width: 1536, height: 864 }
  const ctx = await b.newContext(phone ? { ...devices['iPhone 13'], viewport: vp } : { viewport: vp, deviceScaleFactor: 1.25 })
  const page = await ctx.newPage()
  const S = { id, size, phone, ctx, page, errs: [], fails: [], notes: [], pics: [] }
  page.on('pageerror', e => S.errs.push('pageerror: ' + String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') S.errs.push('console error: ' + m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) S.errs.push(`http ${r.status()}: ` + r.url().slice(0, 120)) })
  await page.addInitScript(() => { window.__lwNoDemoCounters = true })
  S.init = async (who = 'admin', real = false) => {
    await page.goto(real ? BASE : BASE + '?fresh=1')
    await signIn(S, who)
  }
  S.check = (cond, label, seen) => {
    const line = `${cond ? 'ok  ' : 'FAIL'} ${label}` + (seen === undefined ? '' : ' | ' + JSON.stringify(seen))
    console.log('     ' + line)
    if (!cond) S.fails.push(label + ' — saw ' + JSON.stringify(seen))
  }
  S.note = t => { S.notes.push(t); console.log('     note: ' + t) }
  S.shot = async (name, opts = {}) => {
    const p = opts.p || P0, ds = opts.dates || []
    const r = await page.evaluate(({ p, ds, full }) => {
      const vw = innerWidth, vh = innerHeight
      const rs = []
      const sh = document.querySelector('[data-testid="bid-picker"], [data-testid="daylist"]')
      if (sh && !full) rs.push(sh.getBoundingClientRect())
      if (!full) {
        for (const d of ds) { const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`); if (c) { const q = c.getBoundingClientRect(); if (q.bottom > 0 && q.top < vh && q.right > 0 && q.left < vw) rs.push(q) } }
        const row = document.querySelector(`[data-testid="row-${p}"]`)
        if (row && ds.length) { const q = row.firstElementChild?.getBoundingClientRect(); if (q && q.bottom > 0 && q.top < vh) rs.push(q) }
      }
      if (!rs.length) return { x: 0, y: 0, width: vw, height: vh }
      const l = Math.max(0, Math.min(...rs.map(q => q.left)) - 8), t = Math.max(0, Math.min(...rs.map(q => q.top)) - 30)
      const rr = Math.min(vw, Math.max(...rs.map(q => q.right)) + 8), bb = Math.min(vh, Math.max(...rs.map(q => q.bottom)) + 8)
      return { x: l, y: t, width: rr - l, height: bb - t }
    }, { p, ds, full: !!opts.full })
    const file = `${id}-${size}-${name}.png`
    await page.screenshot({ path: path.join(OUT, file), clip: r, scale: 'css' })
    S.pics.push(file)
    return file
  }
  return S
}

/* ---- readers ---- */
const winState = page => page.evaluate(() => {
  const s = document.querySelector('[data-testid="bid-picker"]'); if (!s) return null
  const q = x => s.querySelector(x)
  const t = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : null
  const bt = id => { const e = q(`[data-testid="${id}"]`); return e ? { t: t(e), p: e.getAttribute('aria-pressed'), dis: !!e.disabled } : null }
  const tk = q('[data-testid="bid-approve-tick"]')
  return { title: t(q('.bidsheet-hd .when')), head: t(q('.bidsheet-hd')), all: bt('scope-all'), day: bt('scope-day'), span: bt('span-range'),
    approve: bt('decide-approve'), refuse: bt('decide-refuse'), move: bt('decide-shift'), del: bt('bid-clear'), tick: tk ? tk.getAttribute('aria-checked') : null, text: t(s) }
})
const cellsOf = (page, ds, p = P0) => page.evaluate(({ p, ds }) => ds.map(d => {
  const td = document.querySelector(`[data-testid="cell-${p}-${d}"]`)
  if (!td) return { d, missing: true, st: '?missing' }
  const spans = [...td.querySelectorAll('span.c')].map(s => s.textContent.trim() + ':' + ((s.className.match(/\bs-(\w+)\b/) || [])[1] || '?'))
  return { d, sel: td.classList.contains('selcell'), ring: td.classList.contains('lw-ring'), st: spans.join('+') || 'empty', cls: [...td.querySelectorAll('span.c')].map(s => s.className.replace(/\s+/g, ' ')) }
}), { p, ds })
const stOf = cs => cs.map(c => c.st)
const cyan = page => page.evaluate(() => [...document.querySelectorAll('td.selcell')].map(td => td.dataset.testid.replace('cell-', '')))
const durRow = page => page.locator(`${T('bid-picker')} .bp-dur`).evaluate(row => {
  const sheet = row.closest('[data-testid="bid-picker"]').getBoundingClientRect()
  const bs = [...row.querySelectorAll('button')]
  return { tops: [...new Set(bs.map(b => Math.round(b.getBoundingClientRect().top)))], n: bs.length,
    clipped: bs.filter(b => b.scrollWidth > b.clientWidth + 1).map(b => b.textContent), pastEdge: bs.some(b => b.getBoundingClientRect().right > sheet.right - 4),
    leftEdge: bs.some(b => b.getBoundingClientRect().left < sheet.left + 4), height: Math.round(row.getBoundingClientRect().height) }
})
async function place(page, ds, code = 'LL', p = P0) {
  const ok = await page.evaluate(({ p, ds, code }) => ds.map(d => window.lwSetCell(p, d, code)), { p, ds, code })
  if (ok.some(x => !x)) throw new Error('not placed ' + JSON.stringify(ok))
  await sleep(page, 200)
}
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
async function gotoMonth(page, mon) { await page.locator(T('month-' + mon)).click(); await sleep(page, 600) }
async function openDay(S, d, p = P0, expectPicker = true) {
  const page = S.page
  await gotoMonth(page, MON[Number(d.slice(5, 7)) - 1])
  const c = page.locator(T(`cell-${p}-${d}`))
  await c.waitFor({ state: 'attached', timeout: 10000 })
  await c.scrollIntoViewIfNeeded()
  await c.click()
  if (expectPicker) await page.waitForSelector(T('bid-picker'), { state: 'visible', timeout: 8000 })
  await sleep(page, 500)
}
const pickerOpen = async page => (await page.locator(T('bid-picker')).count()) > 0 && await page.locator(T('bid-picker')).first().isVisible()
async function waitClosed(page, ms = 3000) { try { await page.waitForSelector(T('bid-picker'), { state: 'detached', timeout: ms }); return true } catch { return false } }
async function topbar(S, id) {
  try { await S.page.locator(id).click({ timeout: 5000 }); await sleep(S.page, 700); return true } catch (e) { S.note(`${id} not pressable: ` + String(e.message).split('\n')[0].slice(0, 160)); return false }
}
async function deleteTwice(S) {
  const page = S.page
  await page.locator(T('bid-clear')).click(); await sleep(page, 400)
  let armed = null
  if (await pickerOpen(page)) { armed = (await winState(page)).del; await page.locator(T('bid-clear')).click(); await sleep(page, 600) }
  return armed
}
async function pressLeave(S, code) {
  const page = S.page
  await page.locator(T('bid-' + code)).click(); await sleep(page, 600)
  if (await pickerOpen(page)) { S.note('second tap on ' + code + ' (below-zero confirm?)'); await page.locator(T('bid-' + code)).click(); await sleep(page, 700) }
}
async function apprLines(page) {
  return page.$$eval('[data-testid="approvals-page"] [data-testid^="appr-line-"]', els => els.map(e => ({ id: e.dataset.testid, text: e.innerText.replace(/\s+/g, ' ').trim(), cls: e.className.replace(/\s+/g, ' ') })))
}
async function urState(page) {
  return page.evaluate(() => ['undoBtn', 'redoBtn'].map(id => { const b = document.getElementById(id); if (!b) return id + ': absent'; const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return `${id}: disabled=${b.disabled} aria-disabled=${b.getAttribute('aria-disabled')} title=${b.title} box=${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}x${Math.round(r.height)} top=${h ? (h === b || b.contains(h) ? 'self' : (h.id || h.className || h.tagName)) : 'none'}` }))
}
async function activeDesc(page) {
  return page.evaluate(() => { const a = document.activeElement; return a ? { tag: a.tagName, tid: a.dataset?.testid || '', id: a.id || '', cls: String(a.className).slice(0, 40), text: (a.innerText || '').slice(0, 20).replace(/\s+/g, ' '), fv: a.matches?.(':focus-visible') } : null })
}

async function run(id, sizes, fn) {
  if (ONLY && !ONLY.includes(id)) return
  for (const size of sizes) {
    if (SIZESET && !SIZESET.includes(size) && !(size === 'phone360' && SIZESET.includes('phone'))) continue
    const S = await makeWorld(size, id)
    try { await fn(S) } catch (e) {
      S.fails.push('SCRIPT/STEP ERROR: ' + String(e.message).split('\n').slice(0, 3).join(' / ').slice(0, 400))
      try { await S.shot('error-state', { full: true }) } catch { /* nothing */ }
    }
    for (const e of S.errs) S.fails.push('PAGE/CONSOLE ERROR: ' + e)
    rec(id, size, S.fails.length ? 'FAIL' : 'PASS', S.notes, S.pics, S.fails)
    await S.ctx.close()
  }
}

const D4 = dates('2026-02-09', 4) // Mon 9 .. Thu 12 Feb 2026

/* ================= W1 ================= */
await run('W1', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init(); await place(page, D4)
  await openDay(S, '2026-02-10')
  let w = await winState(page)
  S.check(w.title === '9–12 Feb', 'title reads 9–12 Feb', w.title)
  S.check(w.all?.t === 'All 4 days' && w.all.p === 'true', 'scope-all "All 4 days" pressed', w.all)
  S.check(w.day?.t === 'Tue 10' && w.day.p === 'false', 'scope-day "Tue 10" not pressed', w.day)
  S.check(!w.span, 'no span-range chip', w.span)
  const cy = await cyan(page)
  S.check(cy.length === 4 && D4.every(d => cy.includes(P0 + '-' + d)), 'exactly the 4 cells cyan', cy)
  const cs = await cellsOf(page, D4)
  S.check(cs.every(c => c.st === 'LL:w'), 'each cell shows its own LL box (pending)', stOf(cs))
  const dr = await durRow(page)
  S.check(dr.tops.length === 1 && dr.n === 5, 'Whole day · AM · PM · two chips on ONE line', dr)
  S.check(dr.clipped.length === 0 && !dr.pastEdge && !dr.leftEdge, 'words inside edges, row inside the window', dr)
  await S.shot('all', { dates: D4 })
  await page.locator(T('scope-day')).click()
  if (S.phone) { await sleep(page, 100); await S.shot('day-touch', { dates: D4 }) }
  await sleep(page, 500)
  w = await winState(page)
  S.check(w.title === 'Tue 10 Feb', 'after scope-day the title reads Tue 10 Feb', w.title)
  S.check(w.day.p === 'true' && w.all.p === 'false', 'scope-day pressed, scope-all not', [w.all, w.day])
  const cy2 = await cyan(page)
  S.check(cy2.length === 1 && cy2[0] === P0 + '-2026-02-10', 'only Tue 10 cyan', cy2)
  await S.shot('day', { dates: D4 })
  await page.locator(T('bid-cancel')).click(); await sleep(page, 500)
  S.check(!(await pickerOpen(page)), 'window closed by the cross', null)
  const cy3 = await cyan(page)
  S.check(cy3.length === 0, 'no cyan cell after ✕', cy3)
  await S.shot('closed', { dates: D4, full: false })
})

/* ================= W2 ================= */
await run('W2', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init(); await place(page, D4)
  await openDay(S, '2026-02-10')
  await page.locator(T('decide-approve')).click()
  const closed = await waitClosed(page)
  await sleep(page, 400)
  S.check(closed, 'window closes on Approve (All)', null)
  let cs = await cellsOf(page, D4)
  S.check(cs.every(c => c.st === 'LL:a'), 'all four approved', stOf(cs))
  S.note('approved cell classes: ' + JSON.stringify(cs.map(c => c.cls[0])))
  await S.shot('approved', { dates: D4 })
  S.check(await topbar(S, '#undoBtn'), 'Undo pressed', null)
  cs = await cellsOf(page, D4)
  S.check(cs.every(c => c.st === 'LL:w'), 'ONE Undo: all four back to pending', stOf(cs))
  await S.shot('undo', { dates: D4 })
  await topbar(S, '#redoBtn')
  cs = await cellsOf(page, D4)
  S.check(cs.every(c => c.st === 'LL:a'), 'Redo: approved again', stOf(cs))
  await S.shot('redo', { dates: D4 })
  await openDay(S, '2026-02-10')
  let w = await winState(page)
  S.check(w.approve?.t === 'Approved', 'Approve reads "Approved"', w.approve)
  S.note('Approve aria-pressed=' + w.approve?.p)
  S.check(w.title === '9–12 Feb', 'title 9–12 Feb on the approved leave', w.title)
  await S.shot('open-approved', { dates: D4 })
  const armed = await deleteTwice(S)
  S.note('Delete first press read: ' + armed)
  cs = await cellsOf(page, D4)
  S.check(cs.every(c => c.st === 'empty'), 'Delete on All: gone on all four days', stOf(cs))
  await S.shot('deleted', { dates: D4 })
  await topbar(S, '#undoBtn')
  cs = await cellsOf(page, D4)
  S.check(cs.every(c => c.st === 'LL:a'), 'Undo of the delete: back (approved)', stOf(cs))
  await S.shot('undo-delete', { dates: D4 })
})

/* ================= W3 (desktop) ================= */
await run('W3', ['desk'], async S => {
  const page = S.page
  await S.init('admin', true)
  await place(page, D4, 'LL', 'bane')
  await openDay(S, '2026-02-10', 'bane')
  const w = await winState(page)
  S.note('window for bane: title=' + w.title + ' all=' + w.all?.t)
  await page.locator(T('decide-approve')).click(); await waitClosed(page); await sleep(page, 500)
  const cs = await cellsOf(page, D4, 'bane')
  S.check(cs.every(c => c.st === 'LL:a'), 'bane four days approved by Saber', stOf(cs))
  await S.shot('admin-approved', { dates: D4, p: 'bane' })
  await page.locator('#logout').click()
  await page.waitForSelector('#luser', { timeout: 15000 })
  await signIn(S, 'member')
  await page.locator('#notifyBell').click(); await sleep(page, 700)
  const lines = await page.$$eval('[data-testid="bell-list"] [data-testid^="bell-line-"]', els => els.map(e => e.innerText.replace(/\s+/g, ' ').trim()))
  S.note('bell lines (' + lines.length + '): ' + JSON.stringify(lines))
  const dec = lines.filter(l => /Saber/.test(l) && /LL/.test(l))
  S.check(dec.length === 1, 'ONE bell line for the decision naming Saber and the leave', dec)
  await S.shot('bell', { full: true })
  try { await page.locator(T('bell-list')).screenshot({ path: path.join(OUT, 'W3-desk-bell-list.png') }); S.pics.push('W3-desk-bell-list.png') } catch (e) { S.note('bell-list element picture failed') }
})

/* ================= W4 ================= */
await run('W4', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init(); await place(page, D4)
  await openDay(S, '2026-02-11')
  await page.locator(T('scope-day')).click(); await sleep(page, 300)
  await page.locator(T('bid-oil')).click(); await sleep(page, 400)
  await page.locator(T('oil-pick-ho')).click(); await sleep(page, 300)
  await page.locator(T('oil-give')).click(); await sleep(page, 800)
  if (await pickerOpen(page)) { S.note('window stayed open after Give; closing it'); await page.locator(T('bid-cancel')).click(); await sleep(page, 500) }
  let cs = await cellsOf(page, D4)
  S.note('after OIL: ' + JSON.stringify(stOf(cs)))
  S.check(cs[2].st.includes('LL:w') && /H[O]/.test(cs[2].st), 'Wed 11 holds two entries (LL + HO)', cs[2].st)
  await gotoMonth(page, 'FEB')
  const c = page.locator(T('cell-slipway-2026-02-11')); await c.scrollIntoViewIfNeeded(); await c.click(); await sleep(page, 700)
  const dl = (await page.locator(T('daylist')).count()) > 0 && await page.locator(T('daylist')).first().isVisible()
  S.check(dl && !(await pickerOpen(page)), 'a day with two entries opens the day list, not the bid window', { daylist: dl, picker: await pickerOpen(page) })
  await S.shot('daylist', { dates: D4 })
  if (dl) { await page.locator(T('daylist-close')).click().catch(() => {}); await sleep(page, 500) }
  await openDay(S, '2026-02-10')
  const w = await winState(page)
  S.check(w.all?.t === 'All 4 days', 'Tue 10 opens "All 4 days"', [w.all, w.title])
  await S.shot('tue-open', { dates: D4 })
  const armed = await deleteTwice(S)
  S.note('Delete first press read: ' + armed)
  cs = await cellsOf(page, D4)
  S.note('after Delete: ' + JSON.stringify(stOf(cs)))
  S.check(cs[0].st === 'empty' && cs[1].st === 'empty' && cs[3].st === 'empty' && !cs[2].st.includes('LL') && /HO/.test(cs[2].st), 'LL gone on all four, HO still on Wed 11', stOf(cs))
  await S.shot('after-delete', { dates: D4 })
})

/* ================= W5 ================= */
await run('W5', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init(); await place(page, D4)
  await openDay(S, '2026-02-10')
  let w = await winState(page)
  S.note('Auto-approve at open: ' + w.tick)
  if (w.tick === 'true') { await page.locator(T('bid-approve-tick')).click(); await sleep(page, 300) }
  w = await winState(page)
  S.check(w.tick === 'false', 'Auto-approve OFF', w.tick)
  S.check(w.all?.t === 'All 4 days', 'on All', w.all)
  await S.shot('off', { dates: D4 })
  await page.locator(T('bid-LL')).click(); await sleep(page, 800)
  const closed = !(await pickerOpen(page))
  S.check(closed, 'window closes on the lit LL button (positive proof the press landed)', null)
  let cs = await cellsOf(page, D4)
  S.check(cs.every(c => c.st === 'LL:w'), 'nothing changes: four still pending', stOf(cs))
  const body = await page.evaluate(() => document.body.innerText)
  S.check(!/could not be written/i.test(body), 'no "could not be written" note', body.match(/.{0,40}could not be written.{0,40}/i)?.[0] || null)
  await S.shot('after-lit-press', { dates: D4 })
  await openDay(S, '2026-02-10')
  w = await winState(page)
  S.note('Auto-approve on reopen (remembered?): ' + w.tick)
  if (w.tick !== 'true') { await page.locator(T('bid-approve-tick')).click(); await sleep(page, 300) }
  w = await winState(page)
  S.check(w.tick === 'true' && w.all?.p === 'true', 'Auto-approve ON, All', [w.tick, w.all])
  await pressLeave(S, 'LL')
  cs = await cellsOf(page, D4)
  S.check(cs.every(c => c.st === 'LL:a'), 'tap LL with Auto-approve ON: all four approved', stOf(cs))
  await S.shot('approved', { dates: D4 })
  await topbar(S, '#undoBtn')
  cs = await cellsOf(page, D4)
  S.check(cs.every(c => c.st === 'LL:w'), 'one Undo: all four pending', stOf(cs))
  await S.shot('undo', { dates: D4 })
})

/* ================= W6 ================= */
await run('W6', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init(); await place(page, D4)
  const po = await page.evaluate(() => window.lwSetPostOut('slipway', '2026-02-11'))
  S.note('lwSetPostOut returned ' + JSON.stringify(po))
  await openDay(S, '2026-02-09')
  let w = await winState(page)
  S.note('window: title=' + w.title + ' all=' + w.all?.t + ' tick=' + w.tick)
  await S.shot('before', { dates: D4 })
  await page.locator(T('decide-approve')).click(); await sleep(page, 900)
  const open = await pickerOpen(page)
  S.check(open, 'window stays open on the refusal', open)
  const cs = await cellsOf(page, D4)
  S.check(cs.every(c => c.st === 'LL:w'), 'nothing approved on any day', stOf(cs))
  w = await winState(page)
  const note = await page.evaluate(() => {
    const s = document.querySelector('[data-testid="bid-picker"]'); if (!s) return null
    const el = [...s.querySelectorAll('*')].filter(e => /Nothing was decided/.test(e.textContent)).pop()
    if (!el) return null
    const cs = getComputedStyle(el)
    return { text: el.innerText.replace(/\s+/g, ' ').trim(), color: cs.color, cls: String(el.className), role: el.getAttribute('role') }
  })
  S.note('refusal note: ' + JSON.stringify(note))
  S.check(!!note && /^Nothing was decided\./.test(note.text), 'red note starting "Nothing was decided."', note)
  if (note) { const m = note.color.match(/\d+/g).map(Number); S.check(m[0] > 150 && m[1] < 140, 'note is red-ish', note.color) }
  await S.shot('refused-note', { dates: D4 })
})

/* ================= W7 ================= */
await run('W7', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init(); await place(page, D4)
  await openDay(S, '2026-02-11')
  await page.locator(T('scope-day')).click(); await sleep(page, 300)
  let w = await winState(page)
  S.check(w.title === 'Wed 11 Feb', 'day chip: title Wed 11 Feb', w.title)
  await page.locator(T('decide-approve')).click(); await waitClosed(page); await sleep(page, 500)
  let cs = await cellsOf(page, D4)
  S.check(stOf(cs).join() === 'LL:w,LL:w,LL:a,LL:w', 'only Wed 11 approved', stOf(cs))
  await S.shot('wed-approved', { dates: D4 })
  await openDay(S, '2026-02-09')
  w = await winState(page)
  S.check(w.all?.t === 'All 2 days' && w.title === '9–10 Feb', 'Mon 9 opens "All 2 days", title 9–10 Feb', [w.all, w.title])
  S.check((await cyan(page)).length === 2, 'two cells cyan', await cyan(page))
  await S.shot('mon-open', { dates: D4 })
  await page.locator(T('bid-cancel')).click(); await sleep(page, 400)
  await page.locator(T('lw-tab-approvals')).click(); await page.waitForSelector(T('approvals-page'), { state: 'visible' }); await sleep(page, 700)
  const lines = (await apprLines(page)).filter(l => /Drifter/.test(l.text))
  S.note('Approvals Drifter lines: ' + JSON.stringify(lines.map(l => l.text)))
  S.check(lines.some(l => /\b9\s*[–-]\s*(Tue )?10 Feb/.test(l.text)), 'a line for Drifter 9–10 Feb (a desktop writes "Mon 9 – Tue 10 Feb")', lines.map(l => l.text))
  S.check(lines.some(l => /(^|[^\d–-])12 Feb/.test(l.text.replace(/9\s*[–-]\s*10 Feb/, ''))), 'a line for Drifter 12 Feb', lines.map(l => l.text))
  await S.shot('approvals', { full: true })
  await page.locator(T('lw-tab-grid')).click(); await sleep(page, 700)
  await openDay(S, '2026-02-12')
  w = await winState(page)
  S.check(!w.all && !w.day, 'Thu 12 alone: no chips', [w.all, w.day])
  await page.locator(T('decide-refuse')).click(); await sleep(page, 700)
  cs = await cellsOf(page, D4)
  S.note('after Refuse: ' + JSON.stringify(stOf(cs)))
  S.check(cs[3].st !== 'LL:w' && cs[3].st !== 'LL:a', 'Thu 12 refused', cs[3].st)
  await S.shot('thu-refused', { dates: D4 })
  if (!(await pickerOpen(page))) await openDay(S, '2026-02-12')
  w = await winState(page)
  S.note('Refuse button now: ' + JSON.stringify(w.refuse))
  await page.locator(T('decide-refuse')).click(); await sleep(page, 700)
  cs = await cellsOf(page, D4)
  S.check(cs[3].st === 'LL:w', 'second tap on lit Refuse: back to pending', cs[3].st)
  await S.shot('thu-back', { dates: D4 })
})

/* ================= W8 (desktop) ================= */
await run('W8', ['desk'], async S => {
  const page = S.page
  await S.init(); await place(page, D4)
  await page.locator(T('lw-tab-approvals')).click(); await page.waitForSelector(T('approvals-page'), { state: 'visible' }); await sleep(page, 700)
  const before = (await apprLines(page)).filter(l => /Drifter/.test(l.text))
  S.note('line before: ' + JSON.stringify(before.map(l => l.text)))
  await page.locator(`${T('appr-line-slipway')} ${T('appr-dates')}`).first().click()
  await page.waitForSelector('td.lw-ring', { timeout: 8000 }); await sleep(page, 700)
  const back = (await page.locator(T('appr-back')).count()) > 0 && await page.locator(T('appr-back')).isVisible()
  S.check(back, 'the slim Back bar is shown', back)
  const ringId = await page.evaluate(() => document.querySelector('td.lw-ring').dataset.testid)
  S.note('ringed cell: ' + ringId)
  await S.shot('ring-and-bar', { full: true })
  await page.locator('td.lw-ring').first().click()
  await page.waitForSelector(T('bid-picker'), { state: 'visible', timeout: 8000 }); await sleep(page, 600)
  const w = await winState(page)
  S.check(w.all?.t === 'All 4 days', 'window on All 4 days', [w.all, w.title])
  const both = await page.locator('td.lw-ring.selcell').count()
  S.note('td.lw-ring.selcell count: ' + both + ' ; ring classes still on: ' + await page.locator('td.lw-ring').count())
  await S.shot('ringed-cyan', { dates: D4 })
  await page.locator(T('decide-approve')).click(); await waitClosed(page); await sleep(page, 600)
  const cs = await cellsOf(page, D4)
  S.check(cs.every(c => c.st === 'LL:a'), 'the grid shows the four days approved', stOf(cs))
  await S.shot('approved-on-grid', { dates: D4, full: true })
  await page.locator(T('appr-back')).click(); await page.waitForSelector(T('approvals-page'), { state: 'visible' }); await sleep(page, 800)
  const after = (await apprLines(page)).filter(l => /Drifter/.test(l.text))
  S.note('line after Back: ' + JSON.stringify(after.map(l => ({ text: l.text, cls: l.cls }))))
  await S.shot('back-approvals', { full: true })
})

/* ================= W9 ================= */
await run('W9', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init()
  for (const d of D4) await place(page, [d])
  await openDay(S, '2026-02-09')
  let w = await winState(page)
  S.check(w.all?.t === 'All 4 days', 'opens All 4 days', w.all)
  await S.shot('open4', { dates: D4 })
  S.note('with window open: ' + (await urState(page)).join(' || '))
  const ok = await topbar(S, '#undoBtn')
  S.note('Undo with the window open: pressable=' + ok)
  if (ok) {
    const open = await pickerOpen(page)
    S.note('window still open after Undo: ' + open + ' ; cells ' + JSON.stringify(stOf(await cellsOf(page, D4))) + ' ; ' + (await urState(page)).join(' || '))
    if (open) {
      w = await winState(page)
      S.check(w.all?.t === 'All 3 days', 'chip reads All 3 days', [w.all, w.title])
      const cy = await cyan(page); S.check(cy.length === 3, '3 cells cyan', cy)
      const cs = await cellsOf(page, D4); S.check(cs[3].st === 'empty', 'Thu 12 gone', stOf(cs))
    } else {
      S.check(false, 'window stays open after Undo and reads All 3 days (seen: window closed; the cells now)', stOf(await cellsOf(page, D4)))
      await S.shot('undo-open', { dates: D4 })
      /* second press: now the window is shut — does Undo take Thu 12 away? */
      const ok2 = await topbar(S, '#undoBtn')
      const cs2 = await cellsOf(page, D4)
      S.note('SECOND Undo (window shut): pressable=' + ok2 + ' cells ' + JSON.stringify(stOf(cs2)))
      await S.shot('second-undo', { dates: D4 })
      await topbar(S, '#redoBtn')
      S.note('Redo: cells ' + JSON.stringify(stOf(await cellsOf(page, D4))))
      await openDay(S, '2026-02-09')
      w = await winState(page)
      S.note('reopened after Redo: ' + JSON.stringify([w.all, w.title]) + ' cyan ' + (await cyan(page)).length)
      await S.shot('redo-open', { dates: D4 })
      await page.locator(T('bid-cancel')).click(); await sleep(page, 400)
    }
  } else {
    /* desktop: the scrim stands over the top bar — what does the keyboard do? */
    await page.keyboard.press('Control+z'); await sleep(page, 700)
    const cs3 = await cellsOf(page, D4)
    S.note('Ctrl+Z with the window open: window open=' + (await pickerOpen(page)) + ' cells ' + JSON.stringify(stOf(cs3)))
    if (await pickerOpen(page)) { w = await winState(page); S.note('chip after Ctrl+Z: ' + JSON.stringify([w.all, w.title]) + ' cyan ' + (await cyan(page)).length) }
    await S.shot('after-ctrl-z', { dates: D4 })
    /* the only route: close, Undo, reopen */
    if (await pickerOpen(page)) { await page.locator(T('bid-cancel')).click(); await sleep(page, 500) }
    const okU = await topbar(S, '#undoBtn')
    const cs4 = await cellsOf(page, D4)
    S.note('close, then Undo: pressable=' + okU + ' cells ' + JSON.stringify(stOf(cs4)))
    await openDay(S, '2026-02-09')
    w = await winState(page)
    S.check(w.all?.t === 'All 3 days', 'reopened after Undo: All 3 days', [w.all, w.title])
    S.check((await cyan(page)).length === 3, '3 cyan after reopening', await cyan(page))
    await S.shot('reopen-after-undo', { dates: D4 })
    await page.locator(T('bid-cancel')).click(); await sleep(page, 400)
    await topbar(S, '#redoBtn')
    await openDay(S, '2026-02-09')
    w = await winState(page)
    S.check(w.all?.t === 'All 4 days', 'Redo, reopened: All 4 days', [w.all, w.title])
    await S.shot('reopen-after-redo', { dates: D4 })
  }
})

/* ================= W9b (SUPPLEMENTAL, planted data: the leave changes under an OPEN window) ================= */
await run('W9b', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init()
  for (const d of D4) await place(page, [d])
  await openDay(S, '2026-02-09')
  let w = await winState(page)
  S.check(w.all?.t === 'All 4 days', 'opens All 4 days', w.all)
  await page.evaluate(() => window.lwSetCell('slipway', '2026-02-12', '')); await sleep(page, 700)
  const open = await pickerOpen(page)
  S.note('after the planted removal of Thu 12: window open=' + open + ' cells ' + JSON.stringify(stOf(await cellsOf(page, D4))))
  if (open) {
    w = await winState(page)
    S.check(w.all?.t === 'All 3 days' && w.title === '9–11 Feb', 'chip reads All 3 days, title 9–11 Feb', [w.all, w.title])
    S.check((await cyan(page)).length === 3, '3 cells cyan', await cyan(page))
  } else S.check(false, 'the window should still be open', open)
  await S.shot('removed-under-open', { dates: D4 })
  if (open) {
    await page.evaluate(() => window.lwSetCell('slipway', '2026-02-12', 'LL')); await sleep(page, 700)
    w = await winState(page)
    S.check(!!w && w.all?.t === 'All 4 days', 'put back: All 4 days', w && [w.all, w.title])
    if (w) S.check((await cyan(page)).length === 4, '4 cyan again', await cyan(page))
    await S.shot('put-back-under-open', { dates: D4 })
  }
})

/* ================= W10 (member) ================= */
await run('W10', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init('member')
  const placed = await page.evaluate(ds => ds.map(d => window.lwSetCell('bane', d, 'LL')), D4)
  S.note('member lwSetCell results: ' + JSON.stringify(placed))
  if (placed.some(x => !x)) throw new Error('member could not place his leave by lwSetCell')
  await sleep(page, 300)
  await openDay(S, '2026-02-10', 'bane')
  let w = await winState(page)
  S.check(w.all?.t === 'All 4 days' && !!w.day, 'member sees the chips', [w.all, w.day, w.title])
  S.check(!w.approve && !w.refuse, 'no Approve / Refuse for a member', [w.approve, w.refuse])
  await S.shot('open', { dates: D4, p: 'bane' })
  await page.locator(T('decide-shift')).click()
  await page.waitForSelector(T('move-banner'), { state: 'visible', timeout: 5000 }); await sleep(page, 600)
  const banner = await page.locator(T('move-banner')).innerText()
  S.note('move banner: ' + banner.replace(/\s+/g, ' '))
  S.check(/4/.test(banner), 'banner says it moves 4 entries', banner.replace(/\s+/g, ' '))
  await S.shot('move-banner', { dates: D4, p: 'bane', full: S.phone })
  await sleep(page, 450)
  const tgt = page.locator(T('cell-bane-2026-02-16'))
  await tgt.scrollIntoViewIfNeeded(); await tgt.click(); await sleep(page, 500)
  if (await page.locator(T('move-confirm')).isVisible().catch(() => false)) { await S.shot('move-confirm', { dates: [...D4, '2026-02-16'], p: 'bane', full: true }); await page.locator(T('move-confirm')).click() }
  await page.waitForSelector(T('move-banner'), { state: 'detached', timeout: 5000 }).catch(() => S.note('banner did not go away'))
  await sleep(page, 700)
  const D4b = dates('2026-02-16', 4)
  let cs = await cellsOf(page, D4, 'bane'), cs2 = await cellsOf(page, D4b, 'bane')
  S.check(cs.every(c => c.st === 'empty'), '9–12 empty', stOf(cs))
  S.check(cs2.every(c => c.st === 'LL:w'), 'LL now on 16–19 Feb', stOf(cs2))
  await S.shot('moved', { dates: [...D4, ...D4b], p: 'bane' })
  await openDay(S, '2026-02-17', 'bane')
  w = await winState(page)
  S.check(w.all?.t === 'All 4 days', 'open on the moved leave: All 4 days', [w.all, w.title])
  const armed = await deleteTwice(S)
  S.note('Delete first press read: ' + armed)
  cs2 = await cellsOf(page, D4b, 'bane')
  S.check(cs2.every(c => c.st === 'empty'), 'Delete on All: all four gone', stOf(cs2))
  await S.shot('deleted', { dates: D4b, p: 'bane' })
})

/* ================= W11 ================= */
await run('W11', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init()
  const ds = ['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02']
  const placed = await page.evaluate(ds => ds.map(d => window.lwSetCell('slipway', d, 'LL')), ds)
  S.note('placed: ' + JSON.stringify(placed))
  if (placed.some(x => !x)) throw new Error('fixture did not land ' + JSON.stringify(placed))
  await openDay(S, '2026-12-31')
  let w = await winState(page)
  S.check(w.all?.t === 'All 2 days' && w.title === '30–31 Dec', 'Thu 31 Dec: All 2 days, title 30–31 Dec', [w.all, w.title])
  await S.shot('open', { dates: ds.slice(0, 2) })
  await page.locator(T('decide-approve')).click(); await waitClosed(page); await sleep(page, 600)
  let cs = await cellsOf(page, ds.slice(0, 2))
  S.check(cs.every(c => c.st === 'LL:a'), 'Dec 30–31 approved', stOf(cs))
  await S.shot('approved', { dates: ds.slice(0, 2) })
  await page.locator(T('lw-tab-approvals')).click(); await page.waitForSelector(T('approvals-page'), { state: 'visible' }); await sleep(page, 700)
  const el = page.locator(T('appr-elsewhere'))
  S.note('appr-elsewhere present: ' + (await el.count()) + ' text: ' + ((await el.count()) ? (await el.first().innerText()).replace(/\s+/g, ' ') : ''))
  if (await el.count()) { await el.first().click(); await sleep(page, 800) }
  const lines = (await apprLines(page)).filter(l => /Drifter/.test(l.text))
  S.note('Approvals (Drifter) in the other period: ' + JSON.stringify(lines.map(l => l.text)))
  S.check(lines.length >= 1 && lines.every(l => !/Approved/i.test(l.cls + l.text.slice(0, 0))), 'January days still listed as pending in JAN – DEC 27', lines)
  await S.shot('approvals-27', { full: true })
  await page.locator(T('lw-tab-grid')).click(); await sleep(page, 800)
  S.note('period label: ' + (await page.locator(T('period-label')).innerText().catch(() => '?')).replace(/\s+/g, ' '))
  await gotoMonth(page, 'JAN')
  cs = await cellsOf(page, ds.slice(2))
  S.check(cs.every(c => c.st === 'LL:w'), 'Jan 1–2 2027 still pending', stOf(cs))
  await S.shot('jan', { dates: ds.slice(2) })
})

/* ================= W12 ================= */
await run('W12', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init()
  const r = await page.evaluate(() => [window.lwSetCell('slipway', '2026-02-09', '*LL'), window.lwSetCell('slipway', '2026-02-10', '*LL'), window.lwSetCell('slipway', '2026-02-11', '*LL'), window.lwSetCell('slipway', '2026-02-10', 'OL*')])
  S.note('placed: ' + JSON.stringify(r))
  if (r.some(x => !x)) throw new Error('fixture did not land ' + JSON.stringify(r))
  const D3 = D4.slice(0, 3)
  let cs = await cellsOf(page, D3)
  S.note('cells before: ' + JSON.stringify(stOf(cs)))
  await openDay(S, '2026-02-09')
  let w = await winState(page)
  S.check(w.all?.t === 'All 3 days', 'Mon 9: All 3 days', [w.all, w.title])
  const cy = await cyan(page)
  S.check(cy.length === 3, 'three cells cyan', cy)
  await S.shot('open', { dates: D3 })
  const armed = await deleteTwice(S)
  S.note('Delete first press read: ' + armed)
  cs = await cellsOf(page, D3)
  S.note('cells after: ' + JSON.stringify(stOf(cs)))
  S.check(cs[0].st === 'empty' && cs[2].st === 'empty' && /OL/.test(cs[1].st) && !/LL/.test(cs[1].st), 'three mornings gone, OL* afternoon on Tue 10 still there', stOf(cs))
  await S.shot('after-delete', { dates: D3 })
})

/* ================= W13 ================= */
await run('W13', ['phone', 'phone360', 'desk'], async S => {
  const page = S.page
  await S.init()
  const D14 = dates('2026-09-17', 14)
  await place(page, D14)
  await openDay(S, '2026-09-30')
  const w = await winState(page)
  S.check(w.all?.t === 'All 14 days' && w.day?.t === 'Wed 30', 'labels All 14 days / Wed 30', [w.all, w.day])
  S.check(w.title === '17–30 Sep', 'title 17–30 Sep', w.title)
  const dr = await durRow(page)
  S.check(dr.tops.length === 1 && dr.clipped.length === 0 && !dr.pastEdge && !dr.leftEdge, 'one line, words inside edges, inside the window', dr)
  const hd = await page.evaluate(() => {
    const s = document.querySelector('[data-testid="bid-picker"]'), h = s.querySelector('.bidsheet-hd'), wh = h.querySelector('.when'), tk = h.querySelector('[data-testid="bid-approve-tick"]')
    const hr = h.getBoundingClientRect(), wr = wh.getBoundingClientRect(), tr = tk?.getBoundingClientRect()
    const kids = [...h.children].map(e => { const q = e.getBoundingClientRect(); return { c: String(e.className).slice(0, 14) || e.tagName, l: Math.round(q.left), r: Math.round(q.right) } })
    return { hdL: Math.round(hr.left), hdR: Math.round(hr.right), whenL: Math.round(wr.left), whenR: Math.round(wr.right), tickL: tr ? Math.round(tr.left) : null, whenClip: wh.scrollWidth > wh.clientWidth + 1, hdClip: h.scrollWidth > h.clientWidth + 1, kids }
  })
  S.note('head geometry: ' + JSON.stringify(hd))
  S.check(hd.whenR <= hd.hdR && (hd.tickL == null || hd.whenR <= hd.tickL + 1) && !hd.whenClip && !hd.hdClip, 'title inside the bar, clear of the Auto-approve switch', hd)
  const ov = await page.evaluate(() => { const s = document.querySelector('[data-testid="bid-picker"]').getBoundingClientRect(); return { sl: Math.round(s.left), sr: Math.round(s.right), vw: innerWidth, docW: document.documentElement.scrollWidth } })
  S.check(ov.sl >= 0 && ov.sr <= ov.vw + 1, 'window inside the screen', ov)
  await S.shot('open', { dates: D14 })
  const dur = page.locator(`${T('bid-picker')} .bp-dur`)
  await dur.screenshot({ path: path.join(OUT, `W13-${S.size}-duration-row.png`) }); S.pics.push(`W13-${S.size}-duration-row.png`)
  await page.locator(`${T('bid-picker')} .bidsheet-hd`).screenshot({ path: path.join(OUT, `W13-${S.size}-title-bar.png`) }); S.pics.push(`W13-${S.size}-title-bar.png`)
})

/* ================= W14 (desktop keyboard) ================= */
await run('W14', ['desk'], async S => {
  const page = S.page
  await S.init(); await place(page, D4)
  await openDay(S, '2026-02-10')
  let w = await winState(page)
  S.check(w.all?.t === 'All 4 days', 'opened on All', w.all)
  S.note('focus right after open: ' + JSON.stringify(await activeDesc(page)))
  const seen = []; let found = false
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab')
    const a = await activeDesc(page)
    seen.push(a ? (a.tid || a.id || a.tag) : '-')
    if (a && a.tid === 'scope-day') { found = true; break }
  }
  S.note('Tab path (' + seen.length + '): ' + seen.join(' > '))
  S.check(found, 'Tab reaches scope-day', seen.length)
  if (found) {
    await page.keyboard.press('Enter'); await sleep(page, 500)
    w = await winState(page)
    S.check(w.title === 'Tue 10 Feb' && w.day?.p === 'true', 'Enter: title Tue 10 Feb, scope-day pressed', [w.title, w.day])
    const a = await activeDesc(page)
    S.note('focus after Enter: ' + JSON.stringify(a))
    S.check(a?.tid === 'scope-day' && a.fv, 'focus stays visible on scope-day', a)
    await S.shot('focus', { dates: D4 })
    await page.keyboard.press('Escape'); await sleep(page, 700)
    S.check(!(await pickerOpen(page)), 'Escape closes the window', await pickerOpen(page))
    S.note('focus after Escape: ' + JSON.stringify(await activeDesc(page)))
    await S.shot('escaped', { dates: D4 })
  }
})

/* ================= W15 ================= */
await run('W15', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init(); await place(page, ['2026-02-16'])
  await openDay(S, '2026-02-16')
  const w = await winState(page)
  S.check(w.span?.t === 'Pick a range', 'Pick a range present', w.span)
  S.check(!w.all && !w.day, 'no scope chips', [w.all, w.day])
  S.check(w.title === 'Mon 16 Feb', 'title Mon 16 Feb', w.title)
  const cy = await cyan(page)
  S.check(cy.length === 1 && cy[0] === P0 + '-2026-02-16', 'that one cell cyan', cy)
  await S.shot('open', { dates: ['2026-02-16'] })
})

writeFileSync(RES, JSON.stringify(results, null, 1))
const nf = results.filter(r => r.verdict !== 'PASS').length
console.log(`\nDONE: ${results.length} runs, ${results.length - nf} PASS, ${nf} FAIL`)
if (wk) await wk.close()
if (cr) await cr.close()
