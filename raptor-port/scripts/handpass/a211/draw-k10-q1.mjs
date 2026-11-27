// draw-k10-q1 - section 1, K10, question Q1 (chat A211, 28 Nov 26): Ranger's leave, looked at on his old squadron's list
// after he has moved. Brief docs/superpowers/briefs/2026-11-28-msq-s1-k10-q1-draw-brief.md; the plan's §9.
// The BUILT app in dist, served at 4743; nothing here writes the app's code.
//   - Ranger's (bane) leave, LL Tue 14 - Sat 18 Jul, is filed through the app's own door: Hunter (142's admin), Inputs ->
//     List -> "+ Input", on Mon 29 Jun 2026 09:00 (Singapore), so it is not a late input.
//   - NO SCREEN SAVES A MOVE OF SQUADRON on this build (state/units.ts setHome has no caller; the Leave War's "Transfer to
//     Sqn" was left out, D2659): Ranger's move 142 -> 149 from Thu 16 Jul is written as SETUP into the browser's saved data
//     (his home rows), as draw-q30b and the walk libraries do it.
//   - Pictured on Fri 17 Jul 2026 09:00, Hunter signed in (142's admin; the script reads his squadron list to show he has
//     no right in 149).
// Desktop 1536x864 (his PC's 1920x1080 at 125%), Chromium, drawn at 2x. Teal dashed ring = the place he looks at.
//   node raptor-port/scripts/handpass/a211/draw-k10-q1.mjs            (FRESH=1 remakes the world)
import { mkdirSync, existsSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
const { chromium } = createRequire(resolve(ROOT, 'package.json'))('playwright')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const URL_ = 'http://localhost:4743/'
const OUT = resolve(ROOT, 'docs/mock/2026-11-28-msq-k10-q1')
const TMP = resolve(ROOT, '.tmp/a211-k10-q1'); mkdirSync(TMP, { recursive: true })
for (const d of [OUT]) { rmSync(d, { recursive: true, force: true }); mkdirSync(d, { recursive: true }) }
const TEAL = '#0D9488'
const SETUP_AT = '2026-06-29T09:00:00+08:00', SHOT_AT = '2026-07-17T09:00:00+08:00', MOVE_DAY = '2026-07-16'
const W = 1536, H = 864
const FACT = (k, v) => console.log(`FACT ${k}=${JSON.stringify(v)}`)
console.log('draw-k10-q1 v1 (28 Nov 26)')

let browser
async function mk(clock, storageState) {
  browser ??= await chromium.launch(LAUNCH)
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, timezoneId: 'Asia/Singapore', ...(storageState ? { storageState } : {}) })
  await ctx.clock.install({ time: new Date(clock) })
  const page = await ctx.newPage()
  const s = { ctx, page, errs: [] }
  page.on('pageerror', e => { const m = `PAGEERROR ${String(e).slice(0, 200)}`; console.log(m); s.errs.push(m) })
  page.on('console', m => { if (m.type() === 'error') { const t = `CONSOLE ${m.text().slice(0, 200)}`; console.log(t); s.errs.push(t) } })
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); d.dismiss().catch(() => {}) })
  return s
}
const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
const wait = (s, ms) => s.page.waitForTimeout(ms)
async function hit(s, l, ms = 400) {
  l = typeof l === 'string' ? vis(s, l).first() : l
  await l.scrollIntoViewIfNeeded().catch(() => {})
  await l.click({ timeout: 8000 }); await wait(s, ms)
}
async function signIn(s, u, p) {
  const { page } = s
  await page.goto(URL_); await page.waitForSelector('#luser', { timeout: 20000 })
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
  await page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' })
  await wait(s, 700)
}
const barSq = s => s.page.evaluate(() => {
  const m = [...document.querySelectorAll('.topbar .mark')].find(e => e.getBoundingClientRect().width > 1)
  return m ? m.textContent.replace(/\s+/g, ' ').trim() : null
})
const boxOf = (s, sel) => s.page.evaluate(sel => {
  const e = [...document.querySelectorAll(sel)].find(n => { const r = n.getBoundingClientRect(); return r.width > 1 && r.height > 1 })
  if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }
}, sel)
async function inputsList(s) {
  await hit(s, '#topnav a[data-page="inputs"]', 800)
  await hit(s, '#inListBtn', 600)
}
const rowsOf = s => s.page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].filter(e => e.getBoundingClientRect().height > 0)
  .map(e => ({ iid: e.dataset.iid, words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) })))
const winNow = s => s.page.evaluate(() => {
  const w = document.querySelector('[data-testid="win-inputedit"]'); const r = w?.getBoundingClientRect()
  const sv = document.querySelector('#inpEditSave'), del = document.querySelector('#inpEditDel')
  const boxes = w ? [...w.querySelectorAll('select, input:not([type=file]), textarea')].filter(e => e.getBoundingClientRect().width > 1).map(e => `${e.tagName.toLowerCase()}#${e.id}${e.disabled ? '(disabled)' : ''}`) : []
  return {
    open: !!w && r.width > 0,
    readOnlyLine: document.querySelector('[data-testid="inped-ro"]')?.textContent?.trim() ?? null,
    save: sv ? { words: sv.textContent.trim(), disabled: sv.disabled, inert: !!sv.closest('[inert]') } : null,
    del: del ? { words: del.textContent.trim(), disabled: del.disabled } : null,
    liveBoxes: boxes,
    words: (w?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 500),
  }
})
/* the place he looks at: a teal dashed ring laid on a still screen, with an optional plain-words tag */
const ring = (s, b, tag = '', side = 'above') => s.page.evaluate(([b, c, tag, side]) => {
  const d = document.createElement('div'); d.className = '__a211ring'
  Object.assign(d.style, { position: 'fixed', left: (b.x - 4) + 'px', top: (b.y - 4) + 'px', width: (b.w + 8) + 'px', height: (b.h + 8) + 'px', outline: `2px dashed ${c}`, zIndex: 2147483646, pointerEvents: 'none', boxSizing: 'border-box' })
  document.body.appendChild(d)
  let t = null
  if (tag) {
    t = document.createElement('div'); t.className = '__a211ring'; t.textContent = tag
    Object.assign(t.style, { position: 'fixed', zIndex: 2147483647, pointerEvents: 'none', background: c, color: '#fff', font: '600 13px/1.25 system-ui, -apple-system, Segoe UI, sans-serif', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap' })
    document.body.appendChild(t)
    const tb = t.getBoundingClientRect()
    const left = Math.max(4, Math.min(innerWidth - tb.width - 4, b.x - 4))
    const top = side === 'above' ? b.y - 8 - tb.height : b.y + b.h + 8
    Object.assign(t.style, { left: left + 'px', top: top + 'px' })
    const r = t.getBoundingClientRect(); t = { x: r.left, y: r.top, w: r.width, h: r.height }
  }
  return { ring: { x: b.x - 4, y: b.y - 4, w: b.w + 8, h: b.h + 8 }, tag: t }
}, [b, TEAL, tag, side])
const unring = s => s.page.evaluate(() => document.querySelectorAll('.__a211ring').forEach(e => e.remove()))
async function shot(s, name, rects, pad = 16) {
  await s.page.mouse.move(1, 1).catch(() => {}); await wait(s, 250)
  await s.page.screenshot({ path: `${TMP}/${name}-whole.png` })
  rects = rects.filter(Boolean)
  const L = Math.min(...rects.map(r => r.x)), T = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
  const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
  const clip = { x, y, width: Math.min(W, R + pad) - x, height: Math.min(H, B + pad) - y }
  await s.page.screenshot({ path: `${OUT}/${name}.png`, clip })
  FACT(`${name}.crop`, clip)
  console.log(`  picture ${name}.png`)
}

/* SETUP: a move of squadron as the walk libraries write it (no screen saves one) */
const writeHome = (s, m) => s.page.evaluate(m => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('raptor:settings/home:'))
  const has = keys.some(k => { try { return JSON.parse(localStorage.getItem(k)).pid === m.pid } catch { return false } })
  const id = n => 'h' + (Date.now() + n).toString(36) + Math.random().toString(36).slice(2, 6)
  const out = []
  if (!has) { const a = id(0); localStorage.setItem('raptor:settings/home:' + a, JSON.stringify({ id: a, pid: m.pid, unit: m.from, from: '2026-01-01' })); out.push(a) }
  const b = id(1); localStorage.setItem('raptor:settings/home:' + b, JSON.stringify({ id: b, pid: m.pid, unit: m.to, from: m.day })); out.push(b)
  return { hadRow: has, wrote: out }
}, m)

/* THE WORLD: Hunter files Ranger's LL 14-18 Jul through Inputs -> List -> + Input; then the move is written */
const WORLD = resolve(TMP, 'world.json')
let leaveIid = null
async function makeWorld() {
  const s = await mk(SETUP_AT)
  try {
    await signIn(s, 'ad2', 'a2')
    FACT('setup.bar', await barSq(s))
    await inputsList(s)
    const before = new Set((await s.page.evaluate(() => Object.keys(localStorage).filter(k => /inputs?\//.test(k)))))
    await hit(s, '#inNew', 800)
    await s.page.selectOption('#inpEditPerson', 'bane')
    await s.page.selectOption('#inpEditType', 'LL')
    await wait(s, 300)
    for (let i = 0; i < 2 && !(await vis(s, '[data-testid="inpEdCal-day-2026-07-14"]').count()); i++) await hit(s, '[data-testid="inpEdCal-next"]', 300)
    await hit(s, '[data-testid="inpEdCal-day-2026-07-14"]', 300)
    await hit(s, '[data-testid="inpEdCal-day-2026-07-18"]', 300)
    await s.page.fill('#inpEditRmk', 'Local leave')
    const pre = await s.page.evaluate(() => document.querySelector('[data-testid="win-inputedit"]')?.innerText.replace(/\s+/g, ' ').slice(0, 600))
    FACT('setup.windowBeforeAdd', pre)
    await s.page.screenshot({ path: `${TMP}/setup-before-add.png` })
    await hit(s, '#inpEditSave', 1200)
    /* an OIL or late question, if one stands: its own go-ahead */
    const sheets = await s.page.evaluate(() => [...document.querySelectorAll('.airpop, [role="dialog"]')].filter(e => !e.hidden && e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 200)))
    FACT('setup.afterAdd.sheets', sheets)
    /* the "No document" sheet the leave raises: file it without one (its own "No document") */
    const nd = vis(s, 'button').filter({ hasText: /^No document$/ })
    if (await nd.count()) { await hit(s, nd.first(), 1200); FACT('setup.noDoc', 'pressed') }
    const more = await s.page.evaluate(() => [...document.querySelectorAll('.airpop, [role="dialog"]')].filter(e => !e.hidden && e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 200)))
    FACT('setup.afterNoDoc.sheets', more)
    await s.page.screenshot({ path: `${TMP}/setup-after-add.png` })
    const after = Object.keys(await s.page.evaluate(() => ({ ...localStorage }))).filter(k => /inputs?\//.test(k) && !before.has(k))
    FACT('setup.newKeys', after)
    const rows = (await rowsOf(s)).filter(r => /Ranger/.test(r.words) && /LL/.test(r.words))
    FACT('setup.rangerLLRows', rows)
    if (!rows.length) throw new Error('Ranger\'s LL did not reach the list')
    await s.page.goto(URL_); await s.page.waitForSelector('#luser', { timeout: 20000 })
    FACT('setup.move', await writeHome(s, { pid: 'bane', from: 'u142', to: 'u149', day: MOVE_DAY }))
    writeFileSync(WORLD, JSON.stringify(await s.ctx.storageState()))
    FACT('setup.errs', s.errs)
  } finally { await s.ctx.close().catch(() => {}) }
}

try {
  if (!existsSync(WORLD) || process.env.FRESH) await makeWorld()
  const s = await mk(SHOT_AT, WORLD)
  try {
    await signIn(s, 'ad2', 'a2')
    FACT('shot.bar', await barSq(s))
    /* Hunter's squadron list: 149 must not be in it (no right in 149) */
    const picker = await s.page.locator('#sqnMenuBtn').count()
    let sq = 'no squadron picker drawn (one squadron only)'
    if (picker && await vis(s, '#sqnMenuBtn').count()) {
      await hit(s, '#sqnMenuBtn', 400)
      sq = await s.page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
      await s.page.keyboard.press('Escape'); await wait(s, 300)
    }
    FACT('shot.hunterSquadrons', sq)
    await inputsList(s)
    FACT('shot.range', await s.page.evaluate(() => document.querySelector('#inRangeBtn')?.textContent?.replace(/\s+/g, ' ').trim()))
    const rows = await rowsOf(s)
    FACT('shot.rows', rows.map(r => r.words))
    const mine = rows.filter(r => /Ranger/.test(r.words) && /\bLL\b/.test(r.words))
    FACT('shot.rangerLL', mine)
    if (mine.length !== 1) throw new Error(`expected one Ranger LL row on 142's list, found ${mine.length}`)
    const sel = `#inBody tr[data-iid="${mine[0].iid}"]`
    await s.page.locator(sel).scrollIntoViewIfNeeded(); await wait(s, 300)
    FACT('shot.rowCells', await s.page.evaluate(sel => [...document.querySelector(sel).querySelectorAll('td')].map(td => `${td.dataset.label || ''}: ${td.innerText.replace(/\s+/g, ' ').trim()}`), sel))
    /* PICTURE 1: 142's list, Ranger's row ringed; the bar's squadron mark and the list's heading in the cut */
    const rb = await boxOf(s, sel), head = await boxOf(s, '#inBody')
    const thead = await s.page.evaluate(() => { const t = document.querySelector('#inBody')?.closest('table')?.querySelector('thead'); if (!t) return null; const r = t.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } })
    const mark = await boxOf(s, '.topbar .mark')
    const r1 = await ring(s, rb, '')
    const rng = await boxOf(s, '#inRangeBtn')
    const tag1 = await s.page.evaluate(([b, c]) => {
      const t = document.createElement('div'); t.className = '__a211ring'
      t.textContent = 'Marked below: Ranger’s leave, 14–18 Jul — still on 142’s list on Fri 17 Jul, after his move to 149 on Thu 16 Jul'
      Object.assign(t.style, { position: 'fixed', zIndex: 2147483647, pointerEvents: 'none', background: c, color: '#fff', font: '600 13px/1.25 system-ui, -apple-system, Segoe UI, sans-serif', padding: '5px 9px', borderRadius: '4px', whiteSpace: 'nowrap' })
      document.body.appendChild(t)
      const tb = t.getBoundingClientRect()
      Object.assign(t.style, { left: (b.x + b.w + 20) + 'px', top: (b.y + b.h / 2 - tb.height / 2) + 'px' })
      const r = t.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }
    }, [rng, TEAL])
    const mr = await ring(s, mark, '')
    const rowsAround = await s.page.evaluate(sel => { const tr = document.querySelector(sel); const p = tr.previousElementSibling; const n = tr.nextElementSibling; const a = (p || tr).getBoundingClientRect(), b = (n || tr).getBoundingClientRect(); return { x: a.left, y: a.top, w: a.width, h: b.bottom - a.top } }, sel)
    void head
    await shot(s, 'q1-1-142-list-17jul', [mr.ring, thead, rowsAround, r1.ring, tag1])
    await unring(s)
    /* the press Hunter makes: the row */
    await hit(s, s.page.locator(sel).locator('td').nth(2), 1000)
    let w = await winNow(s); FACT('shot.windowToday', w)
    if (!w.open) {
      await hit(s, s.page.locator(sel).locator('button').first(), 1000)
      w = await winNow(s); FACT('shot.windowToday.byName', w)
    }
    if (!w.open) throw new Error('the row opened no window')
    /* TODAY (evidence, not put to him): the press opens the window EDITABLE - Save and Delete live */
    await s.page.mouse.move(1, 1); await wait(s, 250)
    await s.page.screenshot({ path: `${TMP}/today-window-editable-whole.png` })
    FACT('shot.todayWindow.readOnly', !!w.readOnlyLine)
    /* PICTURE 2 - CHOICE A, PROPOSED, drawn on this same window. ONE named transform, "the read-only window": what the
       built window itself does when its reader may not change an input (InputWindow.tsx `readOnly`): the form's body gets
       `inert` - the app's own stylesheet (14-input-editors.css, D364) then draws every locked field as its value, no box,
       no arrow, tick boxes and buttons dimmed; the saved input's Dates calendar is not drawn (`datesHere` is false when read
       only); Delete and Save are not drawn; Cancel reads "Close"; the app's own read-only line (.inped-ro) stands in the
       foot, its words a DRAFT (the app's present words, "Only Ranger or an admin can change this.", would be untrue for
       Hunter, who is an admin). Nothing is removed: parts are hidden, one line added with the app's own class. */
    const tf = await s.page.evaluate(() => {
      const w = document.querySelector('[data-testid="win-inputedit"]'); if (!w) return 'no window'
      const body = w.querySelector('.inped-body'); if (!body) return 'no body'
      body.setAttribute('inert', '')
      const dates = [...w.querySelectorAll('.inped-f')].find(f => /^dates$/i.test(f.querySelector('.inped-k')?.textContent?.trim() || ''))
      if (dates) dates.style.display = 'none'
      for (const e of w.querySelectorAll('.inped-pen, .inped-hint')) e.style.display = 'none'
      const del = w.querySelector('#inpEditDel'), sv = w.querySelector('#inpEditSave'), cn = w.querySelector('#inpEditCancel')
      if (del) del.style.display = 'none'; if (sv) sv.style.display = 'none'; if (cn) cn.textContent = 'Close'
      const spacer = [...cn.parentElement.children].find(e => e.tagName === 'SPAN' && e.style.flex.startsWith('1'))
      const ro = document.createElement('span'); ro.className = 'inped-ro'; ro.dataset.a211 = 'ro'
      ro.textContent = 'Ranger has moved to 149. Only Ranger, 149’s admins or a master admin can change this.'
      cn.parentElement.insertBefore(ro, spacer || cn)
      return { dates: !!dates, del: !!del, save: !!sv, spacer: !!spacer }
    })
    FACT('shot.transform', tf)
    await wait(s, 300)
    const after = await winNow(s); FACT('shot.windowProposed', after)
    const wb = await boxOf(s, '[data-testid="win-inputedit"]'), rob = await boxOf(s, '[data-a211="ro"]')
    const rw = await ring(s, wb, 'Proposed — choice A: the same window, read only. Everything shown, nothing to change.', 'above')
    const rr = await ring(s, rob, 'Draft words, to be settled', 'below')
    const rowB = await boxOf(s, sel)
    const mr2 = await ring(s, mark, '')
    await shot(s, 'q1-2-choiceA-read-only-proposed', [mr2.ring, rowB, rw.ring, rw.tag, rr.tag])
    await unring(s)
    FACT('shot.errs', s.errs)
  } finally { await s.ctx.close().catch(() => {}) }
} finally { await browser?.close() }
