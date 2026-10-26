// D1265's drawing (23 Oct 26) — "the admin is shown which open dates are already past for members". Drawn on the real app
// (served on http://localhost:4253/, the D1264 build), the phone 390 x 844, the admin, the clock held at 23 Oct 2026 (the
// developer bridge), the demo year's 1 Jan – 31 Mar open — all of it past. Frames: (1) today's chip and window, real; (2) the
// proposal, drawn in by ONE named transform: the months wholly before today take the grid's own closed-day look (opacity
// .45 and the same small padlock, matrix.css `.mx .mxhead th.locked` / `th.day.locked::after`) and cannot be pressed; a
// stretch wholly past reads "past" in place of its day count, at the same dim; the chip counts from today, as a member's
// does — "Bidding closed" here. Everything drawn in is said so on the pictures. Pictures: docs/img/mock/lw-d1265/.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'
import { newPhone, signIn, tapSel, T, getBrowser } from './lw-m1-rewalk-b-lib.mjs'
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/mock/lw-d1265')
mkdirSync(OUT, { recursive: true })
const TODAY = '2026-10-23'
const { ctx, page, cdp } = await newPhone()
await signIn(page, 'admin', TODAY)
await page.waitForTimeout(500)
const shotTop = name => page.screenshot({ path: path.join(OUT, name + '.png'), clip: { x: 0, y: 0, width: 390, height: 300 } })
const shotWin = name => page.screenshot({ path: path.join(OUT, name + '.png'), clip: { x: 0, y: 0, width: 390, height: 420 } })
const label = (sel, text, dy = 0) => page.evaluate(([s, t, d]) => {
  const el = document.querySelector(s); if (!el) throw new Error('no ' + s)
  const r = el.getBoundingClientRect()
  const ring = document.createElement('div'); ring.className = 'mock-ring'
  Object.assign(ring.style, { position: 'fixed', left: r.left - 4 + 'px', top: r.top - 4 + 'px', width: r.width + 8 + 'px', height: r.height + 8 + 'px', border: '3px solid #f5b042', borderRadius: '10px', zIndex: 9999, pointerEvents: 'none' })
  const tag = document.createElement('div'); tag.className = 'mock-ring'; tag.textContent = t
  Object.assign(tag.style, { position: 'fixed', left: Math.max(4, r.left) + 'px', top: r.bottom + 6 + d + 'px', background: 'rgba(20,24,30,.94)', color: '#f5b042', font: '700 13px system-ui', padding: '3px 8px', borderRadius: '6px', zIndex: 9999, pointerEvents: 'none' })
  document.body.append(ring, tag)
}, [sel, text, dy])
const clearMarks = () => page.evaluate(() => document.querySelectorAll('.mock-ring').forEach(n => n.remove()))

/* 1 — today, real */
await shotTop('1a-today-admin-chip')
await tapSel(cdp, page, T('open-chip')); await page.waitForSelector(T('open-dates')); await page.waitForTimeout(400)
await shotWin('1b-today-admin-window')
const premise = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="od-line-"]')].map(n => n.innerText.replace(/\s+/g, ' ').trim()))
console.log('open lines (real):', JSON.stringify(premise))

/* 2 — the proposal, drawn in */
await page.evaluate(today => {
  const css = document.createElement('style'); css.id = 'mock-d1265'
  css.textContent = `#page-leavewar .bidsheet .od-m.mock-past { opacity: .45; position: relative; cursor: default; }
  #page-leavewar .bidsheet .od-m.mock-past::after { content: ''; position: absolute; top: 4px; right: 5px; width: 8px; height: 9px;
    background: no-repeat center / contain url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 16'%3E%3Cpath d='M3.5 7V5a3.5 3.5 0 0 1 7 0v2' fill='none' stroke='%23AEB7C2' stroke-width='1.8'/%3E%3Crect x='1' y='7' width='12' height='8.5' rx='1.6' fill='%23AEB7C2'/%3E%3C/svg%3E"); }
  #page-leavewar .bidsheet .od-line.mock-past { opacity: .45; }`
  document.head.append(css)
  const ym = today.slice(0, 7)
  for (const b of document.querySelectorAll('[data-testid="od-months"] [data-month-ix]')) {
    const key = b.getAttribute('data-month') || ''
    const ix = +b.getAttribute('data-month-ix')
    const monthKey = key || `2026-${String(ix + 1).padStart(2, '0')}`
    if (monthKey < ym) { b.classList.add('mock-past'); b.setAttribute('disabled', '') }
  }
  for (const l of document.querySelectorAll('[data-testid^="od-line-"]')) {
    const to = l.querySelector('.od-span')?.textContent || ''
    l.classList.add('mock-past')
    const d = l.querySelector('.od-days'); if (d) d.textContent = 'past'
    void to
  }
}, TODAY)
const pastCount = await page.evaluate(() => document.querySelectorAll('.od-m.mock-past').length)
if (pastCount !== 9) throw new Error('premise: 9 past months expected, got ' + pastCount)
await label('[data-testid="od-months"]', 'Drawn in: JAN–SEP are past — dimmed, locked, cannot be pressed', 150)
await label('[data-testid^="od-line-"]', 'Drawn in: a stretch wholly past reads "past"', 46)
await shotWin('2b-proposed-admin-window')
await clearMarks()
await tapSel(cdp, page, T('open-dates-close')); await page.waitForTimeout(400)
await page.evaluate(() => {
  const c = document.querySelector('[data-testid="open-chip"]')
  c.classList.remove('open-on'); c.textContent = 'Bidding closed'
})
await label('[data-testid="open-chip"]', 'Drawn in: counts from today, as a member sees it')
await shotTop('2a-proposed-admin-chip')
await ctx.close(); await (await getBrowser()).close()
console.log('done')
