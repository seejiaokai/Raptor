/* D — the pending list (section 4). REAL today: Saturday flight 08:00-16:00 (Ranger) published, then Default rally
   3h -> 2h50 on the Logic page (as rcb2-w2-s12.mjs CASE=B does); the day's "1 pending" list. DRAWN proposed: one added
   line, cloned from the list's own "Ranger · OIL as published…" row, with the proposal's first wording (cold-read
   corrected). usage: [PHONE=1] node d-pending.mjs */
import * as X from './ww-lib.mjs'
import { appendFileSync } from 'node:fs'
const w = await X.open({ phone: process.env.PHONE === '1' })
const { page, P } = w
const man = rec => appendFileSync(X.OUT + '/manifest.jsonl', JSON.stringify(rec) + '\n')
const size = w.phone ? '402x874 WebKit @3x' : '1536x864 Chromium @2x'
const SAT = 5
const LINE = 'Still a full day of OIL. It counts from 05:10, not 05:00.'
await X.board(w, SAT)
await X.flight(w, SAT, '08:00', '16:00')
X.say(P, 'publish', await X.publish(page, SAT))
await X.closeBoard(w)
X.say(P, 'set', await X.setKey(w, 'reportLead', '2h50'))
if (w.phone) await X.reload(w)
await X.board(w, SAT)
await X.press(w, '.dpendbtn:has-text("pending")'); await X.sleep(700)
const read = () => page.evaluate(() => {
  const o = [...document.querySelectorAll('.cw-out')].find(e => e.offsetWidth)
  return o ? [...o.querySelectorAll('.pl-head, .pl-item > .pl-where, .pl-sub')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim()) : null
})
async function shot(file) {
  await X.neutral(w)
  if (!w.phone) await page.mouse.move(5, 860)
  const c = await page.evaluate(() => {
    const o = [...document.querySelectorAll('.cw-out')].find(e => e.offsetWidth)
    let win = o; while (win.parentElement && !/fixed|absolute/.test(getComputedStyle(win).position)) win = win.parentElement
    const wr = win.getBoundingClientRect(), lr = o.querySelector('.pl-list').getBoundingClientRect()
    return { x: Math.max(0, wr.left), y: Math.max(0, wr.top), width: Math.min(innerWidth, wr.right) - Math.max(0, wr.left), height: Math.min(innerHeight, lr.bottom + 16) - Math.max(0, wr.top) }
  })
  await page.screenshot({ path: `${X.OUT}/${file}`, clip: c })
}
const t = await read()
X.say(P, 'D TODAY', t)
if (!t || !t.some(l => /OIL as published/.test(l))) throw new Error('pending list not on screen')
await shot(`d-pending-today-${P}.png`)
man({ file: `d-pending-today-${P}.png`, family: 'The pending list (a Logic change makes a published day pending through its OIL)', state: 'today', kind: 'real (Saturday published, then Default rally 3h→2h50)', size, rows: t })
const style = await page.evaluate(line => {
  const o = [...document.querySelectorAll('.cw-out')].find(e => e.offsetWidth)
  const src = [...o.querySelectorAll('.pl-sub')].find(e => /OIL as published/.test(e.innerText))
  const title = src.querySelector('.pl-where'), chg = src.querySelector('.pl-chg')
  const ts = getComputedStyle(title), cs = getComputedStyle(chg)
  const d = document.createElement('div'); d.setAttribute('data-ww', '1'); d.textContent = line
  Object.assign(d.style, { display: 'block', color: ts.color, fontWeight: '400', textDecoration: 'none', fontSize: cs.fontSize, lineHeight: cs.lineHeight, marginTop: '2px' })
  chg.after(d)
  return { color: ts.color, fontSize: cs.fontSize, inside: !!src.querySelector('[data-ww]') }
}, LINE)
X.say(P, 'D line style', style)
const p = await read()
if (!p.some(l => l.includes(LINE)) || p.filter(l => /OIL as published/.test(l)).length !== 1 || p.length !== t.length) throw new Error('drawn line wrong ' + JSON.stringify(p))
await shot(`d-pending-proposed-${P}.png`)
if (!(await read()).some(l => l.includes(LINE))) throw new Error('list redrawn before the picture')
man({ file: `d-pending-proposed-${P}.png`, family: 'The pending list (a Logic change makes a published day pending through its OIL)', state: 'proposed', kind: 'drawn: one plain line added inside the real "Ranger · OIL as published…" row, under its change line, in the row title\'s colour', size, rows: p,
  notes: 'redraw 2: the added third row removed; the line is "' + LINE + '" (the staged day: Ranger\'s 08:00–16:00 flight, its real figures 05:00→05:10)' })
await w.browser.close()
