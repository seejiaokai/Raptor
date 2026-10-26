// Round 11 (22 Oct 26): Q9 put to him again as ONE before / after pair, because the first picture did not make it plain.
// A member's phone (Ranger, us/us, 390×844 at 3×), the final set's look (full-r7-one.mjs), the same day in view (from
// Tue 6 Jan, as r7-01), the same squadron, the page at its top. The two pictures differ in exactly two things:
//   r11-q9-before-phone   "as ruled": My leave on its own third line; Manning OPEN (Required P/W, Available P/W)
//   r11-q9-after-phone    "recommended": (a) My leave moved up into line 1's empty right half, so line 3 goes;
//                         (b) Manning opens FOLDED for a member (one tap opens it; the app remembers his choice)
// His own row is NOT moved in either: it stays in its group. Marks are short WORDS this time (he asked for the picture
// to say it plainly), plus "first name starts here" at the first person row and "N names on screen" (rows fully seen).
// "pending", counted in days, on My leave (D1217), as full-r10-lve.mjs draws it.
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r11-q9.mjs
// The r7 page script draws every scene when imported, so its helpers are READ from its file between named markers and
// run here, as full-r9-open.mjs does. Nothing here is built.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, oneFold, mk, unmk } from './full-r7-one.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))

const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const pageSrc = SRC('full-r7-page.mjs')
const pageCode = cut(pageSrc, 'const UP = ', '// ======================= r7-01') + cut(pageSrc, 'async function closedTap', "if (want('08'))")
const NAMES = ['setup', 'pastClosed']
const base = { browser, state, newPage, signIn, shot, q, errs, OUT, gridTo, mk, unmk, join }
// AFTER: the final set as drawn (a member's Manning folded, My leave on line 1)
const AFTER = load(pageCode, { ...base, oneStage, oneFold }, NAMES)
// BEFORE: the same stage, but Manning left open — the fold is skipped (the app's button is read as already shut while the
// shared stage runs, then put back), and nothing else of the stage changes
const keepOpen = async (p, o) => {
  const t = p.locator('[data-testid="counts-toggle"]')
  await t.evaluate(b => { b.dataset.zzWas = b.getAttribute('aria-expanded'); b.setAttribute('aria-expanded', 'false') })
  const r = await oneStage(p, o)
  await t.evaluate(b => { b.setAttribute('aria-expanded', b.dataset.zzWas); delete b.dataset.zzWas })
  return r
}
const BEFORE = load(pageCode, { ...base, oneStage: keepOpen, oneFold: async () => {} }, NAMES)

// both: "2 waiting" read as "2½ pending" (D1217 — days, not requests)
const pending = p => p.evaluate(() => {
  for (const b of document.querySelectorAll('[data-zk="ml"] .b, .zml[data-zk="ml"]'))
    for (const w of [...b.childNodes].filter(n => n.nodeType === 3 && /\d+ waiting/.test(n.textContent))) w.textContent = w.textContent.replace(/\d+ waiting/, () => '2½ pending')
})
// BEFORE: My leave on its own third line, as ruled — the same words and the same "● 3 new", in the admin phone's line-3 look
const ownLine = p => p.evaluate(() => {
  const ml = document.querySelector('#page-leavewar .zml2[data-zk="ml"]'); if (!ml) return 'no ml'
  const nw = ml.querySelector('.znw')?.outerHTML || ''
  ml.remove()
  const fil = document.querySelector('#page-leavewar .filters')
  const r3 = document.createElement('div'); r3.className = 'zrow3'
  r3.innerHTML = `<div class="zrow"><span class="zml" data-zk="ml"><span class="zlab">MY LEAVE</span><b>LVE 14.5</b> · OIL 0 · 2 waiting · next 19 Jan${nw}<span class="zsp"></span>›</span></div>`
  fil.after(r3)
  const z = r3.querySelector('.zml'); return z.scrollWidth - z.clientWidth
})

// the first person row and how many person rows stand whole on the screen
const measure = p => p.evaluate(() => {
  const rows = [...document.querySelectorAll('#page-leavewar tr[data-testid^="row-"]')].filter(tr => tr.getBoundingClientRect().height > 0)
  // the frozen copy of the rows (the names) is the one read; keep one row per person, the leftmost copy
  const seen = new Map()
  for (const tr of rows) { const id = tr.dataset.testid; const r = tr.getBoundingClientRect(); if (!seen.has(id) || r.left < seen.get(id).left) seen.set(id, r) }
  const all = [...seen.entries()].map(([id, r]) => ({ id, top: r.top, bottom: r.bottom })).sort((a, b) => a.top - b.top)
  const head = document.querySelector('#page-leavewar thead')?.getBoundingClientRect()
  const whole = all.filter(r => r.top >= (head ? head.bottom - 1 : 0) && r.bottom <= innerHeight + 0.5)
  const fly = ['req-p', 'avail-p', 'req-w', 'avail-w'].map(t => { const e = document.querySelector(`[data-testid="fly-row-${t}"]`); const r = e?.getBoundingClientRect(); return r && r.height ? [t, Math.round(r.top), Math.round(r.bottom)] : [t, 'hidden'] })
  return { first: all[0] && { id: all[0].id, top: Math.round(all[0].top) }, n: whole.length, last: whole.at(-1), ids: whole.map(r => r.id), fly, scrollY }
})

// a word tag in the pink style, set where it covers nothing (mk tries the places around the thing)
const word = (p, sel, text, o = {}) => mk(p, sel, text, o)
// a pink line along the top of the first person row, across the names, and its words
const firstLine = (p, id, y) => p.evaluate(([id, y]) => {
  const ln = document.createElement('div'); ln.className = 'zz-first'
  Object.assign(ln.style, { position: 'fixed', left: '0px', width: '100%', top: (y - 1.5) + 'px', height: '3px', background: '#ff2d95', zIndex: 2147483646, pointerEvents: 'none' })
  document.body.appendChild(ln)
}, [id, y])

async function scene(kind) {
  const S = kind === 'before' ? BEFORE : AFTER
  const { ctx, p } = await S.setup('phone', 'member')
  await S.pastClosed(p)
  if (kind === 'before') console.log('ml line overflow', await ownLine(p))
  await pending(p)
  await gridTo(p, '2026-01-06', 'bane')
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300)
  const m = await measure(p)
  console.log(kind, JSON.stringify(m))
  await shot(p, `r11-q9-${kind}-phone-clean`)
  return { ctx, p, m }
}

// The marks, in WORDS (his ask): pink tags in mk()'s style, each set by hand in empty space measured from the page —
// line 1's empty right half, the grid card's tool row right of the magnifiers, the gap under line 2, a group heading's
// empty cells, the empty day cells at the right. Rings and lines are pink, 3px, as mk() draws them.
const marks = (p, kind, m) => p.evaluate(([kind, m]) => {
  const PK = '#ff2d95'
  const R = s => document.querySelector(s)?.getBoundingClientRect()
  const add = (st, html) => { const d = document.createElement('div'); d.className = 'zz-tag'; if (html) d.innerHTML = html; Object.assign(d.style, { position: 'fixed', zIndex: 2147483647, pointerEvents: 'none' }, st); document.body.appendChild(d); return d }
  const tag = (html, o) => {
    const t = add({ background: PK, color: '#fff', font: o.font || '800 12px/1.2 system-ui,sans-serif', padding: '4px 8px', borderRadius: '10px', boxShadow: '0 0 0 2px #0b0d10', whiteSpace: 'nowrap', left: '-500px', top: '-500px' }, html)
    const w = t.offsetWidth, h = t.offsetHeight
    const x = o.right != null ? o.right - w : o.cx != null ? o.cx - w / 2 : o.left
    const y = o.bottom != null ? o.bottom - h : o.cy != null ? o.cy - h / 2 : o.top
    Object.assign(t.style, { left: x + 'px', top: y + 'px' }); return t.getBoundingClientRect()
  }
  const ring = (r, off = 2) => add({ left: (r.left - off - 3) + 'px', top: (r.top - off - 3) + 'px', width: (r.width + 2 * off) + 'px', height: (r.height + 2 * off) + 'px', border: '3px solid ' + PK, borderRadius: '6px', boxSizing: 'content-box' })
  const vline = (x, y1, y2) => add({ left: (x - 1.5) + 'px', top: y1 + 'px', width: '3px', height: (y2 - y1) + 'px', background: PK })
  const hline = (y, x1, x2) => add({ left: x1 + 'px', top: (y - 1.5) + 'px', width: (x2 - x1) + 'px', height: '3px', background: PK })
  const W = innerWidth, out = {}
  const ml = R('[data-zk="ml"]'), pick = R('[data-zk="pick"]'), under = R('[data-zk="under"]'), leg = R('[data-zk="legend"]')
  const zin = R('[data-testid="lw-zoom-in"]'), tog = R('[data-testid="counts-toggle"]')
  const lx = (under.right + leg.left) / 2 // the empty gap in line 2, for a leader line
  if (kind === 'before') {
    ring(ml)
    const t = tag('My leave: its own line', { left: pick.right + 14, cy: pick.top + pick.height / 2 })
    vline(lx, t.bottom, ml.top - 5)
    const a = R('[data-testid="fly-row-req-p"]'), b = R('[data-testid="fly-row-avail-w"]'), all = [a, b, R('[data-testid="fly-row-req-w"]'), R('[data-testid="fly-row-avail-p"]')]
    const top = Math.min(...all.map(r => r.top)), bot = Math.max(...all.map(r => r.bottom)), l = Math.min(...all.map(r => r.left))
    ring({ left: l + 2, top: top + 1, width: W - 6 - l - 2, height: bot - top - 2 }, 0)
    out.manning = tag('Manning open:<br>4 rows', { left: zin.right + 10, cy: zin.top + zin.height / 2 })
  } else {
    ring(ml)
    const t = tag('My leave moved up here', { right: W - 6, top: leg.bottom + 1 })
    vline(lx, ml.bottom + 5, t.top)
    ring(tog)
    out.manning = tag('Manning folded —<br>tap to open', { left: zin.right + 10, top: t.bottom + 3, font: '800 11px/1.15 system-ui,sans-serif' })
  }
  // the first person row: a line at its top, and its words in the group heading's empty cells above it
  hline(m.first.top - 2, 0, W) // drawn on the heading's foot, so the row's own figures stay clear
  out.first = tag('first name starts here', { right: W - 6, bottom: m.first.top - 5 })
  // the person rows fully on screen: a bracket down the right edge and the count
  const y1 = m.first.top - 3.5, y2 = m.last.bottom - 1, bx = W - 5
  add({ left: (bx - 8) + 'px', top: y1 + 'px', width: '8px', height: (y2 - y1) + 'px', borderTop: '3px solid ' + PK, borderRight: '3px solid ' + PK, borderBottom: '3px solid ' + PK, boxSizing: 'border-box' })
  out.count = tag(`${m.n} names on screen`, { right: bx - 12, cy: (y1 + y2) / 2 })
  out.W = W; out.zin = zin.right
  return JSON.parse(JSON.stringify(out))
}, [kind, m])

for (const kind of ['before', 'after']) {
  const { ctx, p, m } = await scene(kind)
  console.log(kind, 'marks', JSON.stringify(await marks(p, kind, m)))
  await shot(p, `r11-q9-${kind}-phone`)
  await ctx.close()
}

await browser.close(); console.log('errors:', errs)
