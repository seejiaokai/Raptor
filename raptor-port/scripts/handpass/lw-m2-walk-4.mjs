// M2's afternoon round (23 Oct 26), walked by the host: D1274 (a moved bid raises the bubble), D1277 (the note at the
// screen's foot when the Manning button is out of view, with Show), D1275 ("⇅ Done" in words on a phone, the − / +
// aside), D1278 (the phone's two top rows as low as the drawing) and the three letter-width fixes. Assertions of the RIGHT
// behaviour, so a re-run is the re-walk. Real taps and clicks on the built app; pictures to look2-pm/ (or WALK_OUT).
// Usage: WALK_PORT=4180 node scripts/handpass/lw-m2-walk-4.mjs [scenario numbers…]
import * as L from './lw-m2-walk-3-lib.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const { T, tap, vis, txt } = L
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-23-lw-m2-looks', process.env.WALK_OUT || 'pm')
mkdirSync(OUT, { recursive: true })
/* MARK=1: the pictures for his look carry a pink outline round what each is about (his D1222 — the place marked) */
const shot = async (w, name, opts = {}) => {
  const { mark, ...o } = opts
  if (process.env.MARK && mark) await w.page.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { e.dataset.lookMark = e.style.outline; e.style.outline = '3px solid #ff3d9a'; e.style.outlineOffset = '2px' } }, mark)
  await w.page.screenshot({ path: path.join(OUT, name + '.png'), ...o })
  if (process.env.MARK && mark) await w.page.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { e.style.outline = e.dataset.lookMark || ''; e.style.outlineOffset = '' } }, mark)
}
const only = process.argv.slice(2).map(Number)
const want = n => !only.length || only.includes(n)
const results = [], errsAll = []
const rec = (id, size, verdict, said, pics = []) => { results.push({ id, size, verdict, said, pics }); console.log(`${verdict}  #${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
async function run(n, fn) { if (!want(n)) return; try { await fn() } catch (e) { rec(n, '?', 'NOT RUN', 'script error: ' + String(e).slice(0, 300)) } }
const PLAIN = `http://localhost:${L.PORT}/`
const WIDE = '*, *::before, *::after { font-family: Verdana, "DejaVu Sans", sans-serif !important }'
async function signIn(w, who, { today, plain = false, wide = false } = {}) {
  const page = w.page
  if (wide) await page.addInitScript(css => { const add = () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s) }; if (document.head) add(); else document.addEventListener('DOMContentLoaded', add) }, WIDE)
  await page.goto(plain ? PLAIN : L.URL); await page.waitForSelector('#luser')
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (today !== undefined) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]')
  await page.waitForTimeout(900)
}
const manningOpen = w => w.page.evaluate(() => !!document.querySelector('[data-testid="fly-row-req-p"]'))
const bubble = w => w.page.evaluate(() => { const e = document.querySelector('[data-testid="manning-bubble"]'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null })
const foot = w => w.page.evaluate(() => { const e = document.querySelector('[data-testid="manning-bubble-foot"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { text: e.querySelector('[data-testid="manning-bubble-text"]').innerText.trim(), show: e.querySelector('[data-testid="manning-bubble-show"]').innerText.trim(), top: r.top, bottom: r.bottom, left: r.left, right: r.right, vh: innerHeight, vw: innerWidth } })
const btnInView = w => w.page.evaluate(() => { const b = document.querySelector('#page-leavewar [data-testid="counts-toggle"]'); const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1)); return r.bottom > 0 && r.top < innerHeight && !!h && b.contains(h) })
const pad = async (w, id, n) => { await tap(w, T(id)); await w.page.waitForTimeout(400); if (await vis(w.page, T('fly-edit-input'))) { await w.page.fill(T('fly-edit-input'), String(n)); await w.page.keyboard.press('Enter'); await w.page.waitForTimeout(500); return } for (const d of String(n)) await tap(w, T(`fly-pad-${d}`)); await tap(w, T('fly-pad-done')); await w.page.waitForTimeout(400) }
/* LL in the open window — tapped again where the window asks ("Tap the same leave again to go ahead") */
const placeLL = async w => { await tap(w, T('bid-LL')); await w.page.waitForTimeout(600); if (await vis(w.page, T('bid-picker'))) { await tap(w, T('bid-LL')); await w.page.waitForTimeout(700) } }
const availOf = async (w, iso) => +(await txt(w.page, T(`avail-p-${iso}`)))
/* B: Required set to what is free, so ONE more pilot's bid turns Available P red; F: harmless (no Required) */
const B = '2026-01-13', F = '2026-01-19'
async function fixture(w) {
  await signIn(w, 'admin', { plain: true })
  await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  if (!(await manningOpen(w))) { await tap(w, T('counts-toggle')); await w.page.waitForTimeout(500) }
  const avB = await availOf(w, B)
  await pad(w, `req-p-${B}`, avB)
  await w.page.waitForTimeout(1500)
  return avB
}
/* a PILOT's row (the IP and OPS P groups — Available P counts pilots) whose cell on `iso` is on screen and empty, below
   `minY` (the first walk bid on a WSO's row and nothing turned) */
const visibleEmptyCell = (w, iso, minY) => w.page.evaluate(([iso, minY]) => {
  const groupOf = tr => { for (let r = tr; r; r = r.previousElementSibling) { const t = r.getAttribute('data-testid') || ''; if (t.startsWith('group-')) return t.slice(6) } return '' }
  for (const td of document.querySelectorAll(`#page-leavewar td[data-testid^="cell-"][data-testid$="-${iso}"]`)) {
    const r = td.getBoundingClientRect()
    if (!['IP', 'OPSP'].includes(groupOf(td.closest('tr')))) continue
    if (r.top > minY && r.bottom < innerHeight - 90 && !td.querySelector('.c')) return td.dataset.testid
  }
  return null
}, [iso, minY])
/* scroll the page so the OPS P group's heading sits a third of the way down the screen — the Manning button far above */
const toPilots = async w => { await w.page.evaluate(() => { const g = document.querySelector('#page-leavewar [data-testid="group-OPSP"]'); window.scrollBy(0, g.getBoundingClientRect().top - innerHeight / 3) }); await w.page.waitForTimeout(600) }

/* 1 — phone, admin: scrolled down, a bid that turns Available P red: the note at the foot with Show; Show takes him up */
await run(1, async () => {
  const w = await L.newWorld('phone')
  const avB = await fixture(w)
  await signIn(w, 'admin', { plain: true }); await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  await toPilots(w)
  const inView0 = await btnInView(w)
  const cell = await visibleEmptyCell(w, B, 140)
  await shot(w, 'pm1-scrolled')
  if (!cell) { rec(1, 'phone390 admin', 'NOT RUN', 'no empty cell on screen on 13 Jan after scrolling'); await w.ctx.close(); return }
  const c = await w.page.locator(T(cell)).boundingBox()
  await L.finger(w, c.x + c.width / 2, c.y + c.height / 2); await w.page.waitForSelector(T('bid-picker'))
  await placeLL(w)
  const f = await foot(w), b = await bubble(w)
  await shot(w, 'pm1-foot-note', { mark: '[data-testid="manning-bubble-foot"]' })
  const onScreen = f && f.top >= 0 && f.bottom <= f.vh && f.left >= 0 && f.right <= f.vw
  // Show
  let after = null
  if (f) {
    await tap(w, T('manning-bubble-show')); await w.page.waitForTimeout(900)
    after = { inView: await btnInView(w), open: await manningOpen(w), foot: !!(await foot(w)), focused: await w.page.evaluate(() => document.activeElement?.getAttribute('data-testid')) }
    await shot(w, 'pm1-after-show', { mark: '[data-testid="counts-toggle"], [data-testid="avail-p-2026-01-13"]' })
  }
  const ok = !inView0 && f && /This bid turns Available P red\./.test(f.text) && f.show === 'Show ›' && !b && onScreen && after && after.inView && after.open && !after.foot && after.focused === 'counts-toggle'
  rec(1, 'phone390 admin', ok ? 'PASS' : 'FAIL', `Available P on 13 Jan free ${avB}, Required set to it; scrolled: Manning button in view=${inView0}; bid on ${cell}: foot note ${JSON.stringify(f)}, bubble under the button "${b}"; after Show: ${JSON.stringify(after)}`, ['pm1-scrolled.png', 'pm1-foot-note.png', 'pm1-after-show.png'])
  w.errs.forEach(x => errsAll.push('1: ' + x)); await w.ctx.close()
})

/* 2 — phone, member: the window's Move onto a day it turns red, staged and Confirmed: the bubble under the button */
await run(2, async () => {
  const w = await L.newWorld('phone')
  await fixture(w)
  await signIn(w, 'member', { today: '2026-01-05', plain: true }); await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  await L.bid(w, 'bane', F, 'LL')
  const b0 = await bubble(w)
  await w.page.mouse.click(5, 300); await w.page.waitForTimeout(300)
  await tap(w, T(L.cellId('bane', F))); await w.page.waitForSelector(T('bid-picker'))
  await tap(w, T('decide-shift')); await w.page.waitForTimeout(700)
  await tap(w, T(L.cellId('bane', B))); await w.page.waitForTimeout(700)
  const staged = await vis(w.page, T('move-confirm'))
  const bStaged = await bubble(w)
  if (staged) { await tap(w, T('move-confirm')); await w.page.waitForTimeout(900) }
  const moved = await L.has(w.page, `${T(L.cellId('bane', B))} .c`)
  const b = await bubble(w), open = await manningOpen(w), inView = await btnInView(w)
  await shot(w, 'pm2-move-bubble', { mark: '[data-testid="manning-bubble"]' })
  const ok = b0 === null && staged && bStaged === null && moved && /This bid turns Available P red\./.test(b || '') && open
  rec(2, 'phone390 member', ok ? 'PASS' : 'FAIL', `bid on 19 Jan (bubble then "${b0}"); Move, tap 13 Jan: staged=${staged} (bubble while staged "${bStaged}"); Confirm: moved=${moved}; bubble "${b}", Manning open=${open}, button in view=${inView}`, ['pm2-move-bubble.png'])
  w.errs.forEach(x => errsAll.push('2: ' + x)); await w.ctx.close()
})

/* 3 — desktop, member: Move with a click (no Confirm) — the bubble; then a move back off it (better) — nothing; then a
   move onto its own day — refused, nothing */
await run(3, async () => {
  const w = await L.newWorld('desk')
  await fixture(w)
  await signIn(w, 'member', { today: '2026-01-05', plain: true }); await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  await L.bid(w, 'bane', F, 'LL')
  await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(200)
  const moveTo = async (from, to) => {
    await tap(w, T(L.cellId('bane', from))); await w.page.waitForSelector(T('bid-picker'))
    await tap(w, T('decide-shift')); await w.page.waitForTimeout(700)
    await tap(w, T(L.cellId('bane', to))); await w.page.waitForTimeout(900)
  }
  await moveTo(F, B)
  const b1 = await bubble(w), f1 = await foot(w)
  await shot(w, 'pm3-desk-move-bubble')
  await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(300)
  await moveTo(B, F)
  const b2 = await bubble(w), f2 = await foot(w)
  await shot(w, 'pm3-desk-move-back')
  await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(300)
  await moveTo(F, F)
  const banner = await txt(w.page, T('move-banner'))
  const b3 = await bubble(w), f3 = await foot(w)
  await shot(w, 'pm3-desk-own-day')
  const ok = /Available P red/.test(b1 || '') && !f1 && !b2 && !f2 && !b3 && !f3
  rec(3, 'desk1536 member', ok ? 'PASS' : 'FAIL', `Move 19→13 Jan: bubble "${b1}" foot ${!!f1}; Move back 13→19 (better): bubble "${b2}" foot ${!!f2}; Move onto its own day: banner "${banner}", bubble "${b3}" foot ${!!f3}`, ['pm3-desk-move-bubble.png', 'pm3-desk-move-back.png', 'pm3-desk-own-day.png'])
  w.errs.forEach(x => errsAll.push('3: ' + x)); await w.ctx.close()
})

/* 4 — desktop, admin, by KEYBOARD: scrolled down, a bid: the note at the foot, centred; Tab reaches Show, Enter takes him up */
await run(4, async () => {
  const w = await L.newWorld('desk')
  await fixture(w)
  await signIn(w, 'admin', { plain: true }); await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  await toPilots(w)
  const inView0 = await btnInView(w)
  const cell = await visibleEmptyCell(w, B, 160)
  if (!cell) { rec(4, 'desk1536 admin', 'NOT RUN', 'no empty cell on screen on 13 Jan after scrolling'); await w.ctx.close(); return }
  await w.page.locator(T(cell)).click(); await w.page.waitForSelector(T('bid-picker'))
  await placeLL(w)
  const f = await foot(w)
  await shot(w, 'pm4-desk-foot-note', { mark: '[data-testid="manning-bubble-foot"]' })
  let tabs = 0, onShow = false
  for (; tabs < 60 && !onShow; tabs++) { await w.page.keyboard.press('Tab'); onShow = await w.page.evaluate(() => document.activeElement?.getAttribute('data-testid') === 'manning-bubble-show') }
  const stillUp = !!(await foot(w))
  await shot(w, 'pm4-desk-show-focused')
  if (onShow) { await w.page.keyboard.press('Enter'); await w.page.waitForTimeout(900) }
  const after = { inView: await btnInView(w), foot: !!(await foot(w)), focused: await w.page.evaluate(() => document.activeElement?.getAttribute('data-testid')) }
  await shot(w, 'pm4-desk-after-enter')
  const centred = f && Math.abs((f.left + f.right) / 2 - f.vw / 2) < 2 && f.bottom <= f.vh
  const ok = !inView0 && f && centred && onShow && stillUp && after.inView && !after.foot && after.focused === 'counts-toggle'
  rec(4, 'desk1536 admin', ok ? 'PASS' : 'FAIL', `scrolled: button in view=${inView0}; foot note ${JSON.stringify(f)} (centred=${centred}); Tab ×${tabs} reached Show=${onShow}, note still up=${stillUp}; Enter: ${JSON.stringify(after)}`, ['pm4-desk-foot-note.png', 'pm4-desk-show-focused.png', 'pm4-desk-after-enter.png'])
  w.errs.forEach(x => errsAll.push('4: ' + x)); await w.ctx.close()
})

/* 5 — phone: a tap elsewhere ends the foot note; and the bubble with the button IN view is still under the button */
await run(5, async () => {
  const w = await L.newWorld('phone')
  await fixture(w)
  await signIn(w, 'admin', { plain: true }); await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  // in view first: a bid on 13 Jan with the page at its top
  await w.page.evaluate(() => window.scrollTo(0, 0)); await w.page.waitForTimeout(300)
  const inView0 = await btnInView(w)
  const cellTop = await visibleEmptyCell(w, B, 0)
  const c0 = await w.page.locator(T(cellTop)).boundingBox()
  await L.finger(w, c0.x + c0.width / 2, c0.y + c0.height / 2); await w.page.waitForSelector(T('bid-picker'))
  await placeLL(w)
  const inView1 = await btnInView(w)
  const b = await bubble(w), f = await foot(w)
  await shot(w, 'pm5-in-view-bubble')
  rec('5a', 'phone390 admin', (b && !f) || (!inView1 && f && !b) ? 'PASS' : 'FAIL', `page at its top: button in view before=${inView0}, when raised=${inView1}; bubble under the button "${b}", foot note ${!!f} (in view → under the button; out of view → the foot)`, ['pm5-in-view-bubble.png'])
  await L.finger(w, 5, 400); await w.page.waitForTimeout(400)
  // out of view: Undo the bid, scroll, bid again, then tap elsewhere
  await L.undo(w); await w.page.waitForTimeout(400)
  await toPilots(w)
  const cell = await visibleEmptyCell(w, B, 140)
  const c = await w.page.locator(T(cell)).boundingBox()
  await L.finger(w, c.x + c.width / 2, c.y + c.height / 2); await w.page.waitForSelector(T('bid-picker'))
  await placeLL(w)
  const f2 = await foot(w)
  await L.finger(w, 200, 300); await w.page.waitForTimeout(400)
  const f3 = await foot(w)
  await shot(w, 'pm5-after-tap-elsewhere')
  rec('5b', 'phone390 admin', f2 && !f3 ? 'PASS' : 'FAIL', `scrolled, bid on ${cell}: foot note up=${!!f2}; a tap on the grid elsewhere: foot note up=${!!f3}`, ['pm5-after-tap-elsewhere.png'])
  w.errs.forEach(x => errsAll.push('5: ' + x)); await w.ctx.close()
})

/* 6 — phone 390 and 360, admin: Rearrange from ⚙ → "⇅ Done" in words, the − / + aside, the bar one line; Done → back */
await run(6, async () => {
  for (const width of [390, 360]) {
    const w = await L.newWorld('phone')
    await w.page.setViewportSize({ width, height: 844 })
    await signIn(w, 'admin')
    await tap(w, T('settings-open')); await w.page.waitForSelector(T('settings-rearrange'))
    await tap(w, T('settings-rearrange')); await w.page.waitForTimeout(600)
    const st = await w.page.evaluate(() => {
      const q = id => document.querySelector(`#page-leavewar [data-testid="${id}"]`)
      const mid = id => { const r = q(id)?.getBoundingClientRect(); return r && r.width ? Math.round(r.top + r.height / 2) : null }
      return { done: q('roster-arrange')?.innerText.replace(/\s+/g, ' ').trim(), zoomShown: !!q('lw-zoom') && getComputedStyle(q('lw-zoom')).display !== 'none', mids: ['counts-toggle', 'open-chip', 'roster-arrange', 'legend-open'].map(mid) }
    })
    await shot(w, `pm6-${width}-rearranging`, { clip: { x: 0, y: 0, width, height: 330 }, mark: '#page-leavewar [data-testid="roster-arrange"]' })
    await tap(w, T('roster-arrange')); await w.page.waitForTimeout(500)
    const back = await w.page.evaluate(() => { const z = document.querySelector('#page-leavewar [data-testid="lw-zoom"]'); return !!z && getComputedStyle(z).display !== 'none' && !document.querySelector('#page-leavewar [data-testid="roster-arrange"]') })
    await shot(w, `pm6-${width}-after-done`, { clip: { x: 0, y: 0, width, height: 330 } })
    const oneLine = st.mids.every(m => m !== null && Math.abs(m - st.mids[0]) < 4)
    rec(`6-${width}`, `phone${width} admin`, st.done === '⇅ Done' && !st.zoomShown && oneLine && back ? 'PASS' : 'FAIL', `rearranging: Done reads "${st.done}", − / + shown=${st.zoomShown}, bar middles ${JSON.stringify(st.mids)} (one line=${oneLine}); after Done: − / + back and Done gone=${back}`, [`pm6-${width}-rearranging.png`, `pm6-${width}-after-done.png`])
    w.errs.forEach(x => errsAll.push('6: ' + x)); await w.ctx.close()
  }
})

/* 7 — phone 390: the two top rows' heights against the drawing (D1278), admin and member, plain and wide letters */
await run(7, async () => {
  for (const who of ['admin', 'member']) for (const wide of [false, true]) {
    const w = await L.newWorld('phone')
    await signIn(w, who, { wide })
    const h = await w.page.evaluate(() => { const pg = document.querySelector('#page-leavewar'); const ht = s => Math.round(pg.querySelector(s).getBoundingClientRect().height * 10) / 10; return { tabs: ht(':scope > .lw-top'), view: ht(':scope > .lw-viewline'), myLeave: ht('[data-testid="my-leave"]'), pageOver: document.documentElement.scrollWidth - document.documentElement.clientWidth } })
    const name = `pm7-${who}${wide ? '-wide' : ''}`
    await shot(w, name, { clip: { x: 0, y: 0, width: 390, height: 300 }, mark: '#page-leavewar > .lw-top, #page-leavewar > .lw-viewline' })
    /* D1279: the green picker and My leave, one height on one centre line — the two boxes ringed */
    if (who === 'admin' && !wide) await shot(w, 'pm7-pair', { clip: { x: 0, y: 90, width: 390, height: 120 }, mark: '#page-leavewar [data-testid="war-picker"], #page-leavewar [data-testid="my-leave"]' })
    rec(`7-${who}${wide ? '-wide' : ''}`, `phone390 ${who}`, h.tabs <= 54 && h.view <= 43 && h.pageOver <= 1 ? 'PASS' : 'FAIL', `tab row ${h.tabs}px (drawing ~53), View line ${h.view}px (drawing ~42), My leave ${h.myLeave}px; sideways overflow ${h.pageOver}`, [name + '.png'])
    w.errs.forEach(x => errsAll.push('7: ' + x)); await w.ctx.close()
  }
})

/* 8 — desktop 701 and 768 with wide letters, viewed as Slipway: the one row apart, ⚙ on the screen */
await run(8, async () => {
  const w = await L.newWorld('desk')
  await signIn(w, 'admin', { wide: true })
  await w.page.evaluate(() => { window.raptorMe('slipway'); window.lwSetViewer('slipway') }); await w.page.waitForTimeout(400)
  for (const width of [768, 701]) {
    await w.page.setViewportSize({ width, height: 900 }); await w.page.waitForTimeout(400)
    const b = await w.page.evaluate(() => Object.fromEntries(['lw-tab-grid', 'oil-tracker', 'war-picker', 'my-leave', 'settings-open'].map(id => { const r = document.querySelector(`#page-leavewar [data-testid="${id}"]`).getBoundingClientRect(); return [id, [Math.round(r.left), Math.round(r.right)]] })))
    const vw = await w.page.evaluate(() => innerWidth)
    const apart = b['war-picker'][1] <= b['my-leave'][0] + 0.5 && b['my-leave'][1] <= b['settings-open'][0] + 0.5 && b['settings-open'][1] <= vw
    await shot(w, `pm8-${width}-wide`, { clip: { x: 0, y: 0, width, height: 220 } })
    rec(`8-${width}`, `desk${width} admin wide`, apart ? 'PASS' : 'FAIL', `boxes ${JSON.stringify(b)}, screen ${vw}`, [`pm8-${width}-wide.png`])
  }
  w.errs.forEach(x => errsAll.push('8: ' + x)); await w.ctx.close()
})

/* 9 — phone, admin, wide letters: events "Off day" and a long range closure on neighbouring days: the short forms whole, no
   day wider than before */
await run(9, async () => {
  const w = await L.newWorld('phone')
  await signIn(w, 'admin', { wide: true }); await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  const col = d => w.page.evaluate(d => document.querySelector(`[data-testid="head-${d}"]`).getBoundingClientRect().width, d)
  const days = [['2026-01-15', 'Off day', 'OFF'], ['2026-01-16', 'Range closure 0900-1400, live firing on the eastern ranges', 'RC0']]
  const before = []; for (const [d] of days) before.push(await col(d))
  for (const [d, text] of days) {
    await tap(w, T(`event-0-${d}`)); await w.page.waitForSelector(T('event-text'))
    await w.page.fill(T('event-text'), text); await tap(w, T('event-apply')); await w.page.waitForTimeout(500)
  }
  const after = []; for (const [d] of days) after.push(await col(d))
  const cells = await w.page.evaluate(ds => ds.map(d => { const td = document.querySelector(`[data-testid="event-0-${d}"]`); const s = td.querySelector('.evs'); return { text: td.innerText.trim(), cut: s ? s.scrollWidth > s.clientWidth + 0.5 : null } }), days.map(x => x[0]))
  const c = await L.centre(w, T('event-0-2026-01-15'))
  await shot(w, 'pm9-events-wide', { clip: { x: 0, y: Math.max(0, c.y - 150), width: 390, height: 260 } })
  const ok = days.every(([, , s], i) => cells[i].text === s && cells[i].cut === false && Math.abs(after[i] - before[i]) < 0.75)
  rec(9, 'phone390 admin wide', ok ? 'PASS' : 'FAIL', `day widths before ${JSON.stringify(before)} after ${JSON.stringify(after)}; cells ${JSON.stringify(cells)}`, ['pm9-events-wide.png'])
  w.errs.forEach(x => errsAll.push('9: ' + x)); await w.ctx.close()
})

/* 10, 11 — pictures for the questions put to him (MARK=1 only; not checks): the phone's grid bar on two lines with a red
   day ("Manning | 1 red ›"), and the two tabs, Grid and OIL, each half the row */
if (process.env.MARK) await run(10, async () => {
  const w = await L.newWorld('phone')
  await fixture(w)
  await signIn(w, 'admin', { plain: true }); await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  /* a pilot's bid on 13 Jan turns Available P red: the bar's Manning carries "1 red ›" */
  const cell = await visibleEmptyCell(w, B, 0)
  const c = await w.page.locator(T(cell)).boundingBox()
  await L.finger(w, c.x + c.width / 2, c.y + c.height / 2); await w.page.waitForSelector(T('bid-picker'))
  await placeLL(w); await L.finger(w, 5, 600); await w.page.waitForTimeout(300)
  await w.page.evaluate(() => window.scrollTo(0, 0)); await w.page.waitForTimeout(300)
  await shot(w, 'q-bar-two-lines', { clip: { x: 0, y: 0, width: 390, height: 360 }, mark: '#page-leavewar .card-hd .lw-gridbar' })
  await shot(w, 'q-tabs-wide', { clip: { x: 0, y: 0, width: 390, height: 300 }, mark: '#page-leavewar > .lw-top .lw-tabs' })
  rec(10, 'phone390 admin', 'PICTURES', 'for his questions', ['q-bar-two-lines.png', 'q-tabs-wide.png'])
  await w.ctx.close()
})

writeFileSync(path.join(OUT, 'walk4.out.json'), JSON.stringify({ results, errs: errsAll }, null, 1))
console.log('ERRORS', JSON.stringify(errsAll))
await L.closeBrowser()
