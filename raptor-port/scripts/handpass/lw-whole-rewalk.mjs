// RE-WALK of [LW-WHOLE-LEAVE-WINDOW] after two fixes: (1) the window's manning line names no date over "No manning row is amber or red"
// on several days; (2) a ONE-DAY window beside a several-day leave acts on its one day only, even when the Remarks words match.
// Run from raptor-port/ against a build served on PORT (default 4184):  node scripts/handpass/lw-whole-rewalk.mjs   ONLY=R1,R2  SIZES=phone,desk
// Phone = WebKit iPhone 13 at 402 x 874; desktop = Chromium 1536 x 864 at 1.25. Pictures: docs/img/handpass/2026-10-28-lw-whole-leave/rewalk/
import { webkit, chromium, devices } from '@playwright/test'
import path from 'node:path'
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-28-lw-whole-leave/rewalk')
const RES = path.resolve(here, '../../docs/handpass/parts/lw-whole/rewalk-results.json')
mkdirSync(OUT, { recursive: true }); mkdirSync(path.dirname(RES), { recursive: true })
const PORT = process.env.PORT || 4184
const BASE = `http://localhost:${PORT}/`
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const SIZESET = process.env.SIZES ? process.env.SIZES.split(',') : null
console.log('lw-whole-rewalk v1 | port ' + PORT + ' | ONLY=' + (ONLY || 'all') + ' SIZES=' + (SIZESET || 'all'))
if (!ONLY) for (const f of readdirSync(OUT)) if (f.endsWith('.png')) unlinkSync(path.join(OUT, f))

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
async function signIn(S) {
  const page = S.page
  await page.waitForSelector('#luser')
  await page.evaluate(() => window.lwSetMemberToday('2026-01-02'))
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.lwSetMemberToday('2026-01-02'))
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(T('row-slipway'), { state: 'attached', timeout: 20000 })
  await sleep(page, 700)
  await page.evaluate(() => window.lwSetViewer(null))
  await sleep(page, 200)
}
async function makeWorld(size, id) {
  const phone = size === 'phone'
  const b = phone ? (wk ||= await webkit.launch()) : (cr ||= await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}))
  const vp = phone ? { width: 402, height: 874 } : { width: 1536, height: 864 }
  const ctx = await b.newContext(phone ? { ...devices['iPhone 13'], viewport: vp } : { viewport: vp, deviceScaleFactor: 1.25 })
  const page = await ctx.newPage()
  const S = { id, size, phone, ctx, page, errs: [], fails: [], notes: [], pics: [] }
  page.on('pageerror', e => S.errs.push('pageerror: ' + String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') S.errs.push('console error: ' + m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) S.errs.push(`http ${r.status()}: ` + r.url().slice(0, 120)) })
  await page.addInitScript(() => { window.__lwNoDemoCounters = true })
  S.init = async () => { await page.goto(BASE + '?fresh=1'); await signIn(S) }
  S.check = (cond, label, seen) => {
    console.log('     ' + `${cond ? 'ok  ' : 'FAIL'} ${label}` + (seen === undefined ? '' : ' | ' + JSON.stringify(seen)))
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
const winState = page => page.evaluate(() => {
  const s = document.querySelector('[data-testid="bid-picker"]'); if (!s) return null
  const q = x => s.querySelector(x)
  const t = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : null
  const bt = id => { const e = q(`[data-testid="${id}"]`); return e ? { t: t(e), p: e.getAttribute('aria-pressed'), dis: !!e.disabled } : null }
  const rm = q('[data-testid="bid-remarks"]')
  return { title: t(q('.bidsheet-hd .when')), all: bt('scope-all'), day: bt('scope-day'), span: bt('span-range'),
    approve: bt('decide-approve'), del: bt('bid-clear'), dayline: t(q('[data-testid="bid-dayline"]')), dayWhen: t(q('[data-testid="bid-dayline-when"]')),
    calm: t(q('[data-testid="bid-dayline-calm"]')), remarks: rm ? rm.value : null }
})
const cellsOf = (page, ds, p = P0) => page.evaluate(({ p, ds }) => ds.map(d => {
  const td = document.querySelector(`[data-testid="cell-${p}-${d}"]`)
  if (!td) return { d, st: '?missing' }
  const spans = [...td.querySelectorAll('span.c')].map(s => s.textContent.trim() + ':' + ((s.className.match(/\bs-(\w+)\b/) || [])[1] || '?'))
  return { d, sel: td.classList.contains('selcell'), st: spans.join('+') || 'empty', cls: [...td.querySelectorAll('span.c')].map(s => s.className.replace(/\s+/g, ' ')) }
}), { p, ds })
const stOf = cs => cs.map(c => c.st)
const cyan = page => page.evaluate(() => [...document.querySelectorAll('td.selcell')].map(td => td.dataset.testid.replace('cell-', '')))
async function place(page, ds, code = 'LL', p = P0) {
  const ok = await page.evaluate(({ p, ds, code }) => ds.map(d => window.lwSetCell(p, d, code)), { p, ds, code })
  if (ok.some(x => !x)) throw new Error('not placed ' + JSON.stringify(ok))
  await sleep(page, 200)
}
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
async function openDay(S, d, p = P0) {
  const page = S.page
  await page.locator(T('month-' + MON[Number(d.slice(5, 7)) - 1])).click(); await sleep(page, 600)
  const c = page.locator(T(`cell-${p}-${d}`))
  await c.waitFor({ state: 'attached', timeout: 10000 })
  await c.scrollIntoViewIfNeeded()
  await c.click()
  await page.waitForSelector(T('bid-picker'), { state: 'visible', timeout: 8000 })
  await sleep(page, 500)
}
const pickerOpen = async page => (await page.locator(T('bid-picker')).count()) > 0 && await page.locator(T('bid-picker')).first().isVisible()
async function waitClosed(page, ms = 3000) { try { await page.waitForSelector(T('bid-picker'), { state: 'detached', timeout: ms }); return true } catch { return false } }
// a press with NO blur first (an iPhone's tapped button takes no focus): the DOM click, focus left in the Remarks box
const pressNoBlur = (page, id) => page.evaluate(id => document.querySelector(`[data-testid="${id}"]`).click(), id)

async function run(id, sizes, fn) {
  if (ONLY && !ONLY.includes(id)) return
  for (const size of sizes) {
    if (SIZESET && !SIZESET.includes(size)) continue
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
const D4 = dates('2026-02-09', 4)
const FRI = '2026-02-13'
const D5 = [...D4, FRI]

/* R1 */
await run('R1', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init(); await place(page, D4)
  await openDay(S, '2026-02-10')
  let w = await winState(page)
  S.check(w.title === '9–12 Feb', 'title reads 9–12 Feb', w.title)
  S.check(w.all?.t === 'All 4 days' && w.all.p === 'true', 'scope-all "All 4 days" pressed', w.all)
  S.check(w.day?.t === 'Tue 10', 'scope-day reads "Tue 10"', w.day)
  S.check(!!w.dayline, 'the manning line (bid-dayline) is there', w.dayline)
  S.check(/No manning row is amber or red/.test(w.dayline || '') || /No manning row turns amber or red/.test(w.dayline || ''), 'the line reads the calm sentence', w.dayline)
  S.check(w.dayWhen === null, 'NO date line (bid-dayline-when) over the calm line', w.dayWhen)
  const cy = await cyan(page)
  S.check(cy.length === 4 && D4.every(d => cy.includes(P0 + '-' + d)), '4 cells td.selcell', cy)
  await S.shot('all', { dates: D4 })
  await page.locator(T('scope-day')).click()
  if (S.phone) { await sleep(page, 100); await S.shot('day-touch', { dates: D4 }) }
  await sleep(page, 500)
  w = await winState(page)
  S.check(w.title === 'Tue 10 Feb', 'after scope-day the title reads Tue 10 Feb', w.title)
  const cy2 = await cyan(page)
  S.check(cy2.length === 1 && cy2[0] === P0 + '-2026-02-10', '1 cyan cell (Tue 10)', cy2)
  await S.shot('day', { dates: D4 })
})

// R2 / R3 share the set-up: leave 9–12 Feb carrying "Wedding", a separate bid on Fri 13, then the one-day window on Fri 13
async function setupWedding(S) {
  const page = S.page
  await S.init(); await place(page, D4)
  await openDay(S, '2026-02-10')
  let w = await winState(page)
  S.check(w.all?.t === 'All 4 days' && w.all.p === 'true', 'set-up: Tue 10 opens All 4 days', w.all)
  const rm = page.locator(T('bid-remarks'))
  await rm.click(); await rm.fill('Wedding'); await page.keyboard.press('Tab'); await sleep(page, 500)
  await page.locator(T('bid-cancel')).click(); await sleep(page, 500)
  await place(page, [FRI])
  await openDay(S, '2026-02-10')
  w = await winState(page)
  S.note('re-open Tue 10: title=' + w.title + ' all=' + w.all?.t + ' remarks=' + JSON.stringify(w.remarks))
  S.check(w.remarks === 'Wedding', 'set-up: the leave 9–12 carries the words "Wedding" (read back)', w.remarks)
  S.check(w.all?.t === 'All 4 days', 'set-up: the separate bid on Fri 13 did not join the leave (still All 4 days)', [w.all, w.title])
  await page.locator(T('bid-cancel')).click(); await sleep(page, 500)
  const cs = await cellsOf(page, D5)
  S.check(stOf(cs).every(s => s === 'LL:w'), 'set-up: five pending LL (9–13)', stOf(cs))
  await openDay(S, FRI)
  w = await winState(page)
  S.check(w.title === 'Fri 13 Feb', 'one-day window title Fri 13 Feb', w.title)
  S.check(w.span?.t === 'Pick a range', '"Pick a range" shown', w.span)
  S.check(!w.all && !w.day, 'no scope chips', [w.all, w.day])
  const cy = await cyan(page)
  S.check(cy.length === 1 && cy[0] === P0 + '-' + FRI, 'one cyan cell (Fri 13)', cy)
  const rm2 = page.locator(T('bid-remarks'))
  await rm2.click(); await rm2.fill('Wedding')
  S.note('Fri 13 Remarks box value before the press: ' + JSON.stringify((await winState(page)).remarks) + ' ; focus: ' + (await page.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName)))
  await S.shot('before', { dates: D5 })
}

/* R2 */
await run('R2', ['phone', 'desk'], async S => {
  const page = S.page
  await setupWedding(S)
  await pressNoBlur(page, 'bid-clear'); await sleep(page, 500)
  if (await pickerOpen(page)) { S.note('window still open after the first Delete press (armed?): ' + JSON.stringify((await winState(page)).del)); await pressNoBlur(page, 'bid-clear'); await sleep(page, 700) }
  const cs = await cellsOf(page, D5)
  S.note('cells after: ' + JSON.stringify(stOf(cs)))
  S.check(cs[4].st === 'empty', 'the bid on Fri 13 is gone', cs[4].st)
  S.check(stOf(cs).slice(0, 4).every(s => s === 'LL:w'), '9–12 Feb still four pending LL', stOf(cs).slice(0, 4))
  S.check(cs.slice(0, 4).every(c => c.cls.every(k => /\bs-w\b/.test(k))), '9–12 drawn pending (dashed class s-w)', cs.slice(0, 4).map(c => c.cls))
  await S.shot('after', { dates: D5 })
})

/* R3 */
await run('R3', ['phone', 'desk'], async S => {
  const page = S.page
  await setupWedding(S)
  await pressNoBlur(page, 'decide-approve'); await sleep(page, 700)
  await waitClosed(page, 2000)
  await sleep(page, 400)
  const cs = await cellsOf(page, D5)
  S.note('cells after: ' + JSON.stringify(stOf(cs)))
  S.check(cs[4].st === 'LL:a', 'only Fri 13 approved (filled)', cs[4].st)
  S.check(stOf(cs).slice(0, 4).every(s => s === 'LL:w'), '9–12 Feb still pending', stOf(cs).slice(0, 4))
  await S.shot('after', { dates: D5 })
})

/* R4 */
await run('R4', ['phone', 'desk'], async S => {
  const page = S.page
  await S.init(); await place(page, ['2026-02-16'])
  await openDay(S, '2026-02-16')
  const w = await winState(page)
  S.check(w.span?.t === 'Pick a range', 'Pick a range present', w.span)
  S.check(!w.all && !w.day, 'no scope chips', [w.all, w.day])
  S.check(w.title === 'Mon 16 Feb', 'title Mon 16 Feb', w.title)
  const cy = await cyan(page)
  S.check(cy.length === 1 && cy[0] === P0 + '-2026-02-16', 'one cyan cell', cy)
  await S.shot('open', { dates: ['2026-02-16'] })
})

/* R5 desktop */
await run('R5', ['desk'], async S => {
  const page = S.page
  await S.init(); await place(page, D4)
  await openDay(S, '2026-02-10')
  await page.locator(T('decide-approve')).click()
  S.check(await waitClosed(page), 'window closes on Approve (All)', null)
  await sleep(page, 400)
  let cs = await cellsOf(page, D4)
  S.check(cs.every(c => c.st === 'LL:a'), 'all four approved', stOf(cs))
  await S.shot('approved', { dates: D4 })
  await page.locator('#undoBtn').click({ timeout: 5000 }); await sleep(page, 700)
  cs = await cellsOf(page, D4)
  S.check(cs.every(c => c.st === 'LL:w'), 'ONE Undo: all four pending again', stOf(cs))
  await S.shot('undo', { dates: D4 })
})

writeFileSync(RES, JSON.stringify(results, null, 1))
const nf = results.filter(r => r.verdict !== 'PASS').length
console.log(`\nDONE: ${results.length} runs, ${results.length - nf} PASS, ${nf} FAIL`)
if (wk) await wk.close()
if (cr) await cr.close()
