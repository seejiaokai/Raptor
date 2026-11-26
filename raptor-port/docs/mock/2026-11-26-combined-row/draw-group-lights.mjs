// Chat 190, 26 Nov 26: "a group entry lights its other men" drawn on the REAL Leave War grid for his look.
// The problem: a "3·LL" count written inside a war box does not fit (a whole-day box about 20px wide, a half day half
// that). The proposal: nothing written in the box at rest; a tap on one man's box of a group entry lights the other men's
// boxes of the SAME input with the war's own cyan ring of a day brought into view (`td.lw-ring`, cellring.ts — held
// steady here, as the app draws it for a reader who asked for less motion), while the war's window opens; its held line
// names everyone and carries a clone of the window's own Document button, "Change for all 3 people".
// Staging (all through the Inputs page's own window, "Several people", its calendar, Save; each asserted on the grid):
//   LL for Cutter, Ghost, Dash, Wed 15 - Fri 17 Jul, whole day (as draw-combined-row.mjs stages it)
//   LL for Cutter, Ghost, Dash, Wed 22 Jul, PM only, and OIL for Ghost, Wed 22 Jul, AM only (the half-day case)
// Frames: g1 the grid at rest (today = proposed, nothing added); g2 a tap on Cutter's 15 Jul box, today and proposed;
// g3 the half-day case on 22 Jul: at rest, the "3·LL" attempt for contrast, the tap today, proposed (the cell's ring) and
// a variant ringing only the afternoon box.
// Marks: an outline on the element where it does not hide the drawn ring, and a tag laid on the still screen from its box.
// Nothing under raptor-port/src changes. Run from raptor-port/, one size a process, against an already-served build:
//   node docs/mock/2026-11-26-combined-row/draw-group-lights.mjs --size d --url http://127.0.0.1:4173/ --img docs/mock/2026-11-26-combined-row/img
//   node docs/mock/2026-11-26-combined-row/draw-group-lights.mjs --size p --url http://127.0.0.1:4173/ --img docs/mock/2026-11-26-combined-row/img
//   (add --detail to the desktop line for the 3x close-ups of the days alone, named …-desktop-closeup.png)
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
const VERSION = 'draw-group-lights v1.1 (26 Nov 26, chat 191: frame 4, "Change for Cutter only")'
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d }
const SIZE = arg('size', 'd'), URL = arg('url', 'http://127.0.0.1:4173/'), IMG = path.resolve(arg('img', 'docs/mock/2026-11-26-combined-row/img'))
const ONLY = arg('only', '1,2,3,4').split(',')
const PHONE = SIZE === 'p'
/* --detail: the desktop drawn at 3x (the same layout, its pixels three times finer) and each picture cut to the days in
   question, the rows named by a tag — a close-up beside the true-size 1x picture, never instead of it */
const DETAIL = process.argv.includes('--detail')
console.log(VERSION, '| size', PHONE ? 'phone 402x874 WebKit 3x' : DETAIL ? 'desktop 1536x864 Chromium 3x close-up' : 'desktop 1536x864 Chromium 1x', '| build', URL, '| pictures', IMG, '| frames', ONLY.join(','))
mkdirSync(IMG, { recursive: true })
const PW = createRequire(process.cwd() + '/package.json')('playwright')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const fact = (f, what, v) => console.log(`[${f}] ${what}:`, typeof v === 'string' ? v : JSON.stringify(v))

/* the people (PEOPLE keys) */
const CS = { psy: 'Cutter', riddler: 'Ghost', spaceman: 'Dash' }
const MEN = ['psy', 'riddler', 'spaceman']
const SPECS = {
  ll: { type: 'LL', people: MEN, from: '2026-07-15', to: '2026-07-17' },
  llpm: { type: 'LL', people: MEN, from: '2026-07-22', to: '2026-07-22', span: 'pm' },
  oilam: { type: 'OIL', people: ['riddler'], from: '2026-07-22', to: '2026-07-22', span: 'am' },
  /* frame 4's "after the press": Cutter on a leave of his own beside Ghost's and Dash's group leave, the same days */
  llgd: { type: 'LL', people: ['riddler', 'spaceman'], from: '2026-07-29', to: '2026-07-31' },
  llc: { type: 'LL', people: ['psy'], from: '2026-07-29', to: '2026-07-31' },
}
const IIDS = {}
/* the drafted words (for the fresh Fable's adjustment, D2441; "Change for Cutter only" kept by a fresh Fable, chat 191) */
const W = { names: 'Cutter, Ghost, Dash', all3: 'Change for all 3 people', one: 'Change for Cutter only', count: '3·LL', halfNote: 'The afternoon is LL · Cutter, Ghost, Dash' }
const CYAN = 'rgb(59, 198, 232)'

/* ---------------- driving ---------------- */
async function press(p, loc) {
  const l = typeof loc === 'string' ? p.locator(loc).first() : loc
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (PHONE) await l.tap(); else await l.click()
}
async function signIn(p, first) {
  if (first) await p.goto(URL, { timeout: 60000, waitUntil: 'commit' })
  await p.waitForSelector('#luser, #vWeek .day', { timeout: 60000 })
  if (await p.locator('#luser:visible').count()) {
    await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  }
  await p.waitForSelector('#vWeek .day', { timeout: 60000 }); await sleep(600)
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' + MARKCSS })
}
async function reset(p) { await p.reload({ waitUntil: 'commit', timeout: 60000 }); await signIn(p, false) }
async function toPage(p, name) {
  const re = new RegExp('^\\s*' + name + '\\s*$')
  const vis = p.locator('button:visible, a:visible').filter({ hasText: re })
  if (await vis.count()) { await press(p, vis.first()); await sleep(900); return }
  await press(p, p.locator('[aria-label="Menu"]:visible').first()); await sleep(500)
  await press(p, p.locator('button:visible, a:visible').filter({ hasText: re }).first()); await sleep(900)
}
async function fileInput(p, { type, people, from, to, title, span }) {
  if (!(await p.locator('#inListBtn:visible').count())) await toPage(p, 'Inputs')
  if (await p.locator('#inMemberMode:visible').count()) await press(p, '#inMemberMode')
  await press(p, '#inListBtn'); await sleep(500)
  const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  await press(p, '#inNew')
  await p.waitForSelector('#inpEditPop', { timeout: 8000 }); await sleep(300)
  await p.selectOption('#inpEditType', type); await sleep(300)
  if (people.length > 1) {
    await press(p, '[data-testid="pp-several"]'); await sleep(300)
    for (let i = 0; i < 3; i++) {
      const on = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop .pp-puck.on')].map(e => e.dataset.pp))
      const flip = [...on.filter(x => !people.includes(x)), ...people.filter(x => !on.includes(x))]
      if (!flip.length) break
      for (const id of flip) await press(p, `#inpEditPop .pp-puck[data-pp="${id}"]`)
      await sleep(200)
    }
  } else { await p.selectOption('#inpEditPerson', people[0]); await sleep(200) }
  if (title) await p.evaluate(t => { const e = document.getElementById('inpEditOwnTitle'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(e, t); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) }, title)
  await press(p, `[data-testid="inpEdCal-day-${from}"]`); await sleep(200)
  if (to !== from) { await press(p, `[data-testid="inpEdCal-day-${to}"]`); await sleep(200) }
  if (span) { await press(p, `#inpEditSpan .spanbtn[data-span="${span}"]`); await sleep(200) }
  await press(p, '#inpEditSave'); await sleep(900)
  const asked = []
  for (let i = 0; i < 4; i++) {
    const nd = p.locator('button:visible').filter({ hasText: /^(No document|Don't add)$/ })
    if (await nd.count()) { asked.push(await nd.first().innerText()); await press(p, nd.first()); await sleep(600) } else break
  }
  if (await p.locator('#inpEditPop:visible').count()) throw new Error('window still open after Save: ' + type)
  const after = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  const iid = after.filter(x => !before.includes(x))[0]
  if (!iid) throw new Error('nothing saved for ' + type)
  const rec = await p.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return { type: r.type, people: (r.people || []).map(x => x.p), date: r.date, endDate: r.endDate, allday: r.allday, half: r.half, s: r.s, e: r.e } }, iid)
  return { iid, rec, asked }
}

/* ---------------- marks and pictures ---------------- */
const MARKCSS = `.dcr-mk{outline:2px solid #FFC83D !important;outline-offset:1px}
.dcr-tag{position:fixed;z-index:2147483647;background:#FFC83D;color:#15171c;font:800 11px/17px system-ui,sans-serif;padding:0 6px;border-radius:9px;pointer-events:none;box-shadow:0 0 0 1px #15171c;white-space:nowrap}`
async function tags(p, list) {
  /* a close-up is of the days only: the window's tags would widen it to the window, so they stay off it */
  if (DETAIL && FIRST) list = [...list.filter(([s]) => !/^\.(bidsheet|dcr-newbtn)/.test(s)), ...nameTags(FIRST)]
  await p.evaluate(list => {
    document.querySelectorAll('.dcr-tag').forEach(t => t.remove())
    for (const [sel, text, side] of list) {
      const e = [...document.querySelectorAll(sel)].filter(x => x.getBoundingClientRect().width > 0).pop()
      if (!e) continue
      const r = e.getBoundingClientRect(), t = document.createElement('span')
      t.className = 'dcr-tag'; t.textContent = text; document.body.appendChild(t)
      const tw = t.getBoundingClientRect().width
      const x = side === 'r' ? r.right + 4 : side === 'a' ? r.left + r.width / 2 - tw / 2 : Math.max(2, r.left - tw - 4)
      t.style.left = x + 'px'; t.style.top = (side === 'a' ? Math.max(2, r.top - 19) : Math.max(2, r.top + Math.min(r.height, 30) / 2 - 8.5)) + 'px'
    }
  }, list)
}
async function unmark(p) { await p.evaluate(() => { document.querySelectorAll('.dcr-mk').forEach(e => e.classList.remove('dcr-mk')); document.querySelectorAll('.dcr-tag').forEach(t => t.remove()); document.querySelectorAll('[data-dcr-pic]').forEach(e => e.removeAttribute('data-dcr-pic')) }) }
async function shot(p, name, pad = 12) {
  await sleep(250)
  const box = await p.evaluate(pad => {
    const rs = [...document.querySelectorAll('[data-dcr-pic], .dcr-tag')].map(e => e.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0)
    if (!rs.length) return null
    const x = Math.max(0, Math.min(...rs.map(r => r.left)) - pad), y = Math.max(0, Math.min(...rs.map(r => r.top)) - pad)
    const x2 = Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + pad), y2 = Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)) + pad)
    return { x, y, width: x2 - x, height: y2 - y }
  }, pad)
  if (!box) throw new Error('nothing to picture: ' + name)
  const f = `${name}-${PHONE ? 'phone' : DETAIL ? 'desktop-closeup' : 'desktop'}.png`
  await p.screenshot({ path: path.join(IMG, f), clip: box })
  console.log('  picture', f, Math.round(box.width) + 'x' + Math.round(box.height))
}

/* ---------------- the war ---------------- */
async function warJuly(p) {
  await toPage(p, 'Leave War'); await sleep(2500)
  await press(p, p.locator('button:visible').filter({ hasText: /^JUL$/ }).first()); await sleep(1200)
}
const cellSel = (id, d) => `[data-testid="cell-${id}-2026-07-${d}"]`
async function centre(p, id, d, headDay = '15') {
  await p.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), cellSel(id, d)); await sleep(500)
  /* then the page scrolled (as the war's own jump scrolls it, cellring.ts) so the CAT C heading and Cutter's row stand just
     under the grid's frozen date heading — the dates and the three rows in one short picture */
  /* headDay: the day whose frozen date heading and Cutter's box set the scroll (frames 1-3 keep the 15th, frame 4b the 29th) */
  const moved = await p.evaluate(headDay => {
    /* the frozen heading is a fixed copy of the table's own (the original scrolls away with the page, a third copy stands
       far to the right): the one ON screen is the one seen */
    const onScreen = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth }
    const head = [...document.querySelectorAll(`th[data-d="2026-07-${headDay}"]`)].find(onScreen); const row = document.querySelector(`[data-testid="cell-psy-2026-07-${headDay}"]`).closest('tr')
    const by = row.getBoundingClientRect().top - head.getBoundingClientRect().bottom - 26
    window.scrollBy(0, by); return Math.round(by)
  }, headDay); await sleep(400)
  return moved
}
/* what each of the three men's boxes holds on the given days: its boxes' words, places and sizes */
async function readCells(p, days) {
  return p.evaluate(([MEN, days]) => {
    const out = {}
    for (const id of MEN) out[id] = days.map(d => {
      const c = document.querySelector(`[data-testid="cell-${id}-2026-07-${d}"]`); if (!c) return null
      const cr = c.getBoundingClientRect()
      return { d, cell: [Math.round(cr.width * 10) / 10, Math.round(cr.height * 10) / 10], sel: c.classList.contains('selcell'),
        boxes: [...c.querySelectorAll('span.c, span')].filter(s => s.textContent.trim() && s.children.length === 0).map(s => { const r = s.getBoundingClientRect(); return { t: s.textContent.trim(), cls: s.className, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 } }) }
    })
    return out
  }, [MEN, days])
}
/* the picture: the three men's rows (Cutter, Dash, Fable, Ghost stand in that order), from day a to day b */
const R12 = DETAIL ? ['14', '18'] : ['13', '19'], R3 = DETAIL ? ['21', '23'] : ['20', '24']
let FIRST = null
async function picRows(p, a, b) {
  FIRST = a
  await p.evaluate(([MEN, a, b, DETAIL]) => {
    for (const id of MEN) {
      const c = document.querySelector(`[data-testid="cell-${id}-2026-07-${a}"]`); if (!DETAIL) c.closest('tr').querySelector('td.who').setAttribute('data-dcr-pic', '')
      for (const d of [a, b]) document.querySelector(`[data-testid="cell-${id}-2026-07-${d}"]`)?.setAttribute('data-dcr-pic', '')
    }
    /* the dates over the days pictured (the frozen heading's own cells) */
    const onScreen = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth }
    for (const d of [a, b]) [...document.querySelectorAll(`th[data-d="2026-07-${d}"]`)].filter(onScreen).forEach(e => e.setAttribute('data-dcr-pic', ''))
  }, [MEN, a, b, DETAIL])
}
/* the close-up's row names, laid left of the first day pictured (labels on the picture, not the app's words) */
const nameTags = a => DETAIL ? MEN.map(id => [cellSel(id, a), CS[id]]) : []
/* the half day's note (bid-heldhalf — a half held by an input shows this note in place of the held line): its words give
   way to the half, the kind and everyone's names, then a clone of the window's own Document button */
async function heldHalf(p, words, btnWords) {
  return p.evaluate(([words, btnWords]) => {
    const line = [...document.querySelectorAll('.bidsheet [data-testid="bid-heldhalf"]')].find(e => e.getBoundingClientRect().width > 0)
    const was = line.textContent.replace(/\s+/g, ' ').trim(); const lr0 = line.getBoundingClientRect()
    line.textContent = words + ' '
    const src = document.querySelector('.bidsheet .abtn.docbtn'); const b = src.cloneNode(true)
    b.querySelectorAll('svg').forEach(s => s.style.display = 'none'); b.querySelector('span').textContent = btnWords; b.removeAttribute('title'); b.classList.add('dcr-newbtn')
    line.appendChild(b)
    const r = b.getBoundingClientRect(), lr = line.getBoundingClientRect()
    return { was, cls: line.className, btnH: Math.round(r.height), btnW: Math.round(r.width), lineH0: Math.round(lr0.height), lineH: Math.round(lr.height), fitsLine: r.right <= lr.right + 0.5 }
  }, [words, btnWords])
}
/* THE PROPOSAL'S LIGHT: the war's own "day brought into view" ring (td.lw-ring, cellring.ts — an inset 2px cyan, no fill),
   put on the other men's boxes of the same input. The app fades it at six seconds; here it is held steady, as the app
   draws it for a reader who asked for less motion, because it stays while the window is open (a design point, said so) */
async function light(p, ids, days) {
  return p.evaluate(([ids, days]) => ids.flatMap(id => days.map(d => {
    const c = document.querySelector(`[data-testid="cell-${id}-2026-07-${d}"]`); if (!c) return { id, d, err: 'no cell' }
    const before = c.getBoundingClientRect()
    c.classList.add('lw-ring'); c.style.animation = 'none'
    const after = c.getBoundingClientRect()
    return { id, d, shadow: getComputedStyle(c).boxShadow, sameBox: before.width === after.width && before.height === after.height }
  })), [ids, days])
}
/* the held line: its words give way to everyone's names, then a clone of the window's own Document button */
async function heldLine(p, words, btnWords) {
  return p.evaluate(([words, btnWords]) => {
    const line = [...document.querySelectorAll('.bidsheet [data-testid="bid-heldday"]')].find(e => e.getBoundingClientRect().width > 0)
    const html = line.outerHTML
    const lr0 = line.getBoundingClientRect()
    /* the text parts after the code box: the first carries the span words (Whole day / PM), the rest the tail */
    const parts = [...line.children].filter(c => !c.querySelector('.c') && !c.classList.contains('c') && c.textContent.trim())
    const kept = parts[0]
    const wasWords = kept ? kept.textContent : null
    if (kept) kept.textContent = words
    for (const s of parts.slice(1)) s.style.display = 'none'
    const src = document.querySelector('.bidsheet .abtn.docbtn'); const b = src.cloneNode(true)
    b.querySelectorAll('svg').forEach(s => s.style.display = 'none'); b.querySelector('span').textContent = btnWords; b.removeAttribute('title'); b.classList.add('dcr-newbtn')
    line.appendChild(b)
    const r = b.getBoundingClientRect(), lr = line.getBoundingClientRect(), dr = src.getBoundingClientRect()
    return { html, wasWords, hidden: parts.slice(1).map(s => s.textContent), btnH: Math.round(r.height), btnW: Math.round(r.width), docH: Math.round(dr.height), lineH0: Math.round(lr0.height), lineH: Math.round(lr.height), fitsLine: r.right <= lr.right + 0.5, oneRow: Math.abs(r.top + r.height / 2 - (kept ? kept.getBoundingClientRect().top + kept.getBoundingClientRect().height / 2 : r.top + r.height / 2)) < 6 }
  }, [words, btnWords])
}
async function picWin(p) { await p.evaluate(DETAIL => { const w = [...document.querySelectorAll('.bidsheet')].find(e => e.getBoundingClientRect().width > 0); if (!DETAIL) w.setAttribute('data-dcr-pic', ''); w.querySelector('[data-testid="bid-heldday"], [data-testid="bid-heldhalf"]').classList.add('dcr-mk') }, DETAIL) }
/* the sheet must not cover the rows it lights (a phone's sheet rises from the foot) */
async function rowsClear(p) {
  return p.evaluate(MEN => {
    const w = [...document.querySelectorAll('.bidsheet')].find(e => e.getBoundingClientRect().width > 0); const wr = w.getBoundingClientRect()
    return MEN.map(id => { const r = document.querySelector(`[data-testid="cell-${id}-2026-07-15"], [data-testid="cell-${id}-2026-07-22"]`).closest('tr').getBoundingClientRect(); return { id, rowBottom: Math.round(r.bottom), sheetTop: Math.round(wr.top), sheetLeft: Math.round(wr.left), clear: r.bottom <= wr.top || r.right <= wr.left } })
  }, MEN)
}

/* ---------------- the frames ---------------- */
async function f1(p) {
  await warJuly(p); await centre(p, 'riddler', '16')
  const cells = await readCells(p, ['15', '16', '17']); fact(1, 'the group leave on the grid, 15-17 Jul', cells)
  for (const id of MEN) if (!cells[id].every(c => c && c.boxes.some(b => b.t === 'LL'))) throw new Error('premise: ' + CS[id] + ' has no LL box 15-17')
  await picRows(p, ...R12)
  await tags(p, MEN.map(id => [cellSel(id, '17'), '1', 'r']))
  await shot(p, 'g1-grid-rest-today-and-proposed'); await unmark(p)
}

async function f2(p) {
  await warJuly(p); await centre(p, 'riddler', '16')
  await press(p, cellSel('psy', '15')); await sleep(1000)
  const held = await p.evaluate(() => [...document.querySelectorAll('.bidsheet [data-testid="bid-heldday"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent))
  fact(2, 'today: the window\'s held line', held)
  if (!held.length) throw new Error('premise: the window opened no held line')
  fact(2, 'today: the boxes with the window open', await readCells(p, ['15', '16', '17']))
  fact(2, 'the rows against the window', await rowsClear(p))
  await picRows(p, ...R12); await picWin(p)
  await tags(p, [['.bidsheet [data-testid="bid-heldday"]', '2']])
  await shot(p, 'g2-tap-cutter-today'); await unmark(p)
  /* proposed */
  const lit = await light(p, ['riddler', 'spaceman'], ['15', '16', '17']); fact(2, 'lit (the war\'s day-brought-into-view ring)', lit)
  if (!lit.every(l => l.shadow && l.shadow.includes(CYAN) && l.sameBox)) throw new Error('the ring did not paint, or moved a box')
  const hl = await heldLine(p, W.names, W.all3); fact(2, 'the held line, proposed', hl)
  await picRows(p, ...R12); await picWin(p)
  await tags(p, [['.bidsheet [data-testid="bid-heldday"]', '2b'], ['.dcr-newbtn', 'New', 'r'], [cellSel('riddler', '17'), '2a', 'r'], [cellSel('spaceman', '17'), '2a', 'r']])
  await shot(p, 'g2-tap-cutter-proposed'); await unmark(p)
}

async function f3(p) {
  await warJuly(p); await centre(p, 'riddler', '22')
  const cells = await readCells(p, ['22']); fact(3, 'the half-day case on 22 Jul at rest', cells)
  const ghost = cells.riddler[0]
  if (!ghost || !ghost.boxes.some(b => b.t === 'LL') || !ghost.boxes.some(b => /^OIL/.test(b.t))) throw new Error('premise: Ghost has not OIL and LL on 22 Jul')
  for (const id of ['psy', 'spaceman']) if (!cells[id][0].boxes.some(b => b.t === 'LL')) throw new Error('premise: ' + CS[id] + ' has no LL on 22 Jul')
  await picRows(p, ...R3)
  await tags(p, MEN.map(id => [cellSel(id, '22'), '3', 'r']))
  await shot(p, 'g3-half-rest-today'); await unmark(p)
  /* the "3·LL" attempt, for contrast: written into each afternoon box in the war's own step for a four-letter code */
  const att = await p.evaluate(([MEN, words]) => MEN.map(id => {
    const c = document.querySelector(`[data-testid="cell-${id}-2026-07-22"]`)
    const s = [...c.querySelectorAll('span')].find(x => x.textContent.trim() === 'LL' && x.children.length === 0)
    if (!s) return { id, err: 'no LL box' }
    s.dataset.dcrWas = s.textContent; s.textContent = words; s.classList.add('wide', 'w4')
    const r = s.getBoundingClientRect()
    return { id, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, font: getComputedStyle(s).fontSize, overflow: s.scrollWidth > s.clientWidth + 1, scrollW: s.scrollWidth, clientW: s.clientWidth }
  }), [MEN, W.count])
  fact(3, 'the "3·LL" attempt', att)
  await picRows(p, ...R3)
  await tags(p, MEN.map(id => [cellSel(id, '22'), '3', 'r']))
  await shot(p, 'g3-half-count-attempt'); await unmark(p)
  await p.evaluate(() => document.querySelectorAll('[data-dcr-was]').forEach(s => { s.textContent = s.dataset.dcrWas; s.classList.remove('wide', 'w4'); delete s.dataset.dcrWas }))
  /* the tap today */
  await press(p, cellSel('psy', '22')); await sleep(1000)
  /* a half held by an input: the window draws its note (bid-heldhalf), not the held line, and offers the other half */
  const held = await p.evaluate(() => [...document.querySelectorAll('.bidsheet [data-testid="bid-heldhalf"], .bidsheet [data-testid="bid-heldday"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid + ': ' + e.textContent.replace(/\s+/g, ' ').trim()))
  fact(3, 'today: the window\'s line for the held half', held)
  if (!held.some(h => /^bid-heldhalf/.test(h))) throw new Error('premise: the window drew no half-day note')
  fact(3, 'today: Cutter\'s 22 Jul box with the window open', await readCells(p, ['22']))
  fact(3, 'the rows against the window', await rowsClear(p))
  await picRows(p, ...R3); await picWin(p)
  await tags(p, [['.bidsheet [data-testid="bid-heldhalf"]', '3']])
  await shot(p, 'g3-half-tap-today'); await unmark(p)
  /* proposed: the cell's ring, as the war draws a day brought into view */
  const lit = await light(p, ['riddler', 'spaceman'], ['22']); fact(3, 'lit', lit)
  if (!lit.every(l => l.shadow && l.shadow.includes(CYAN) && l.sameBox)) throw new Error('the ring did not paint, or moved a box')
  const hl = await heldHalf(p, W.halfNote, W.all3); fact(3, 'the half-day note, proposed', hl)
  await picRows(p, ...R3); await picWin(p)
  await tags(p, [['.bidsheet [data-testid="bid-heldhalf"]', '3b'], ['.dcr-newbtn', 'New', 'r'], [cellSel('riddler', '22'), '3a', 'r'], [cellSel('spaceman', '22'), '3a', 'r']])
  await shot(p, 'g3-half-tap-proposed'); await unmark(p)
  /* variant: the same cyan ring on the afternoon box's own edge only, so Ghost's morning OIL stays unlit (a new place for
     the ring — drawn as a variant, said so) */
  const vb = await p.evaluate(([CYAN]) => ['riddler', 'spaceman'].map(id => {
    const c = document.querySelector(`[data-testid="cell-${id}-2026-07-22"]`); c.classList.remove('lw-ring'); c.style.animation = ''
    const s = [...c.querySelectorAll('span')].find(x => x.textContent.trim() === 'LL' && x.children.length === 0)
    const r0 = s.getBoundingClientRect(); s.style.boxShadow = `0 0 0 2px ${CYAN}`; const r1 = s.getBoundingClientRect()
    return { id, box: [Math.round(r1.width * 10) / 10, Math.round(r1.height * 10) / 10], sameBox: r0.width === r1.width && r0.height === r1.height, cls: s.className }
  }), [CYAN])
  fact(3, 'variant: the ring on the afternoon box', vb)
  await picRows(p, ...R3); await picWin(p)
  await tags(p, [['.bidsheet [data-testid="bid-heldhalf"]', '3b'], ['.dcr-newbtn', 'New', 'r'], [cellSel('riddler', '22'), '3c', 'r'], [cellSel('spaceman', '22'), '3c', 'r']])
  await shot(p, 'g3-half-tap-proposed-boxring'); await unmark(p)
}

/* Chat 191: his "Change Cutter's only" beside "Change for all 3 people" (the words a fresh Fable kept as the pair
   "Change for Cutter only", D2441). 4a: the tap, both buttons on the held line. 4b: after the press, Cutter's own leave
   (staged as a leave of his own beside Ghost's and Dash's, the same days, 29-31 Jul) with its own window, the Inputs
   page's real one cloned, over the war; Ghost and Dash unlit, untouched. */
async function f4(p) {
  await warJuly(p); await centre(p, 'riddler', '16')
  await press(p, cellSel('psy', '15')); await sleep(1000)
  const lit = await light(p, ['riddler', 'spaceman'], ['15', '16', '17'])
  if (!lit.every(l => l.shadow && l.shadow.includes(CYAN) && l.sameBox)) throw new Error('the ring did not paint, or moved a box')
  const hl = await heldLine(p, W.names, W.all3); fact(4, 'the held line with the first button', hl)
  const two = await p.evaluate(words => {
    const line = [...document.querySelectorAll('.bidsheet [data-testid="bid-heldday"]')].find(e => e.getBoundingClientRect().width > 0)
    const first = line.querySelector('.dcr-newbtn'); const b = first.cloneNode(true); b.querySelector('span').textContent = words
    b.classList.remove('dcr-newbtn'); b.classList.add('dcr-onebtn'); line.appendChild(b)
    const r = b.getBoundingClientRect(), fr = first.getBoundingClientRect(), lr = line.getBoundingClientRect()
    return { btnW: Math.round(r.width), btnH: Math.round(r.height), firstW: Math.round(fr.width), lineH: Math.round(lr.height), sameRow: Math.abs(r.top - fr.top) < 2, fitsLine: r.right <= lr.right + 0.5, lineW: Math.round(lr.width) }
  }, W.one)
  fact(4, 'the second button', two)
  await picRows(p, ...R12); await picWin(p)
  await tags(p, [['.bidsheet [data-testid="bid-heldday"]', '4a'], ['.dcr-onebtn', 'New', 'r'], [cellSel('riddler', '17'), '2a', 'r'], [cellSel('spaceman', '17'), '2a', 'r']])
  await shot(p, 'g4-two-buttons-proposed'); await unmark(p)
  /* 4b: Cutter's own leave's window, opened for real on the Inputs page, then laid over the war */
  await reset(p)
  await toPage(p, 'Inputs'); await sleep(500)
  if (await p.locator('#inMemberMode:visible').count()) await press(p, '#inMemberMode')
  await press(p, '#inCalBtn'); await sleep(600)
  for (let i = 0; i < 8 && !/JUL\w* 2026/i.test(await p.locator('[data-testid="ic-mon"]:visible').first().innerText()); i++) { await press(p, '#icPrev'); await sleep(350) }
  await press(p, `[data-testid="ib-bar-${IIDS.llc}"]:visible`); await sleep(900)
  if (!(await p.locator('[data-testid="win-inputedit"]:visible').count())) {
    await press(p, p.locator(':is(button,[role=button],div):visible').filter({ hasText: /^Cutter\b/ }).last()); await sleep(900)
  }
  const win = await p.evaluate(() => { const w = [...document.querySelectorAll('[data-testid="win-inputedit"]')].find(e => e.getBoundingClientRect().width > 0); if (!w) return null; return { html: w.outerHTML, sel: [...w.querySelectorAll('select')].map(s => s.value), text: w.innerText.replace(/\s+/g, ' ').slice(0, 200) } })
  fact(4, "Cutter's own leave's window (Inputs page)", win && win.text)
  if (!win) throw new Error("the input's own window did not open")
  /* its title names its people (the PERSON picker below lists the whole squadron, so only the title is read) */
  if (!/^\W*Cutter · 29 Jul/.test(win.text)) throw new Error("premise: the window opened is not Cutter's own leave")
  await p.keyboard.press('Escape'); await sleep(500)
  if (await p.locator('[data-testid="win-inputedit"]:visible').count()) await press(p, '#inpEditClose').catch(() => {})
  await warJuly(p); await centre(p, 'riddler', '30', '29')
  const cells = await readCells(p, ['29', '30', '31']); fact(4, 'after: the three men 29-31 Jul', cells)
  for (const id of MEN) if (!cells[id].every(c => c && c.boxes.some(b => b.t === 'LL'))) throw new Error('premise: ' + CS[id] + ' has no LL 29-31')
  /* no tap on Cutter's box here: the war's own window would sit behind with today's "change it on the Inputs page" line */
  const put = await p.evaluate(([html, sel]) => {
    const host = document.createElement('div'); host.innerHTML = html; const w = host.firstElementChild; w.classList.add('dcr-clonewin')
    document.getElementById('root').appendChild(w)
    /* a copy of a window's markup loses each list's picked value (PERSON read "Ace"): put the real window's back */
    w.querySelectorAll('select').forEach((s, i) => { s.value = sel[i] })
    const r = w.getBoundingClientRect(); return { box: [r.left, r.top, r.width, r.height].map(Math.round), sel: [...w.querySelectorAll('select')].map(s => s.value) }
  }, [win.html, win.sel])
  fact(4, 'the window put over the war', put)
  await picRows(p, ...(DETAIL ? ['28', '31'] : ['27', '31']))
  await p.evaluate(() => document.querySelector('.dcr-clonewin').setAttribute('data-dcr-pic', ''))
  /* on a phone the window covers the screen, as the app's windows do there: the row names would float over it */
  await tags(p, [['.dcr-clonewin', '4b'], ...(PHONE ? [] : MEN.map(id => [cellSel(id, '31'), CS[id], 'r']))])
  await shot(p, 'g4-after-press-proposed'); await unmark(p)
}

/* ---------------- run ---------------- */
const engine = PHONE ? PW.webkit : PW.chromium
const browser = await engine.launch()
const ctx = await browser.newContext(PHONE
  ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
  : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: DETAIL ? 3 : 1 })
const p = await ctx.newPage()
p.setDefaultTimeout(10000)
p.on('pageerror', e => console.log('PAGEERROR', e.message))
p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)) })
const failed = []
try {
  await signIn(p, true)
  for (const [k, spec] of Object.entries(SPECS)) {
    const r = await fileInput(p, spec)
    fact('stage', k, { ...r.rec, asked: r.asked }); IIDS[k] = r.iid
    if (JSON.stringify([...r.rec.people].sort()) !== JSON.stringify([...spec.people].sort()) || r.rec.type !== spec.type) throw new Error('staged wrong: ' + k)
  }
  const FR = { 1: f1, 2: f2, 3: f3, 4: f4 }
  for (const n of ONLY) {
    try { await reset(p); console.log('--- frame', n); await FR[n](p) } catch (e) { failed.push(n + ': ' + e.message.split('\n')[0]); console.log('FRAME FAILED', n, e.message.split('\n')[0]); await p.screenshot({ path: path.join(IMG, `gfail-${n}-${PHONE ? 'phone' : 'desktop'}.png`) }).catch(() => {}) }
  }
} finally {
  await browser.close()
}
console.log('DONE', VERSION, 'failed:', failed.length ? failed.join(' | ') : 'none')
