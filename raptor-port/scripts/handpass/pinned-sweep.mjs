// THE PINNED-PART SWEEP (his D1518, 29 Oct 26 — "nothing pinned on screen leaks"; [PINNED-LEAK-SWEEP]). Every part that
// stays put while what is under it scrolls — found by the browser itself (a computed position of sticky or fixed), never
// from a list kept by hand — is checked on every page, at several scroll places, on his iPhone's engine and at his PC's
// 125% with the browser zoomed in and out. Three checks at a grid of points inside each pinned part:
//   covered      — something that scrolls is drawn over the pinned part (it does not stand in front);
//   see-through  — no solid fill under the point, from the topmost thing there down to the pinned part (and any pinned
//                  part that carries it), so what scrolls behind shows through;
//   gap          — a pinned part that is stuck against another (a heading under the top bar), and a sliver of what
//                  scrolls shows between the two, 0.4px outside its edge.
// And the forced spill (§7.11 lesson 15): each inner scroll box let draw outside its edge and its content slid 120px up
// and left, the bars outside it asked again — a test browser clips what his iPhone, zoomed, sometimes does not.
// Hit-testing reads every element (pointer-events forced on for the probe only) and skips what is not painted.
//
//   node scripts/handpass/pinned-sweep.mjs <dist> <out-dir> [config,…] [state,…]
//   configs: phone (WebKit 402×874 ×3), desk (Chromium 1536×730 ×1.25 — his PC), deskin (his PC zoomed to 150%:
//            1024×487 ×1.875), deskout (zoomed to 67%: 2293×1090 ×0.8375)
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveDist, LAUNCH } from '../drawcheck/lib.mjs'
const require = createRequire(import.meta.url)
const { webkit, chromium } = require('@playwright/test')
const [, , DIST = 'dist', OUT = 'C:/pinned-sweep', ONLYC, ONLYS] = process.argv
mkdirSync(OUT, { recursive: true })
const CONFIGS = {
  phone: { eng: 'webkit', ctx: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true } },
  desk: { eng: 'chromium', ctx: { viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25 } },
  deskin: { eng: 'chromium', ctx: { viewport: { width: 1024, height: 487 }, deviceScaleFactor: 1.875 } },
  deskout: { eng: 'chromium', ctx: { viewport: { width: 2293, height: 1090 }, deviceScaleFactor: 0.8375 } },
}
/* each state: how to reach it from a signed-in admin, then the page it stands on */
const STATES = [
  ['viewsched', async p => { await go(p, 'viewsched') }],
  ['editsched', async p => { await go(p, 'editsched') }],
  ['board', async p => { await go(p, 'editsched'); await p.evaluate(() => window.openScheduler(2)); await p.waitForSelector('.schedboard .sb-days'); await p.waitForTimeout(500) }],
  ['inputs-cal', async p => { await go(p, 'inputs') }],
  ['inputs-list', async p => { await go(p, 'inputs'); await p.click('#inListBtn'); await p.waitForTimeout(500) }],
  ['quals', async p => { await go(p, 'quals') }],
  ['logic', async p => { await go(p, 'logic') }],
  ['help', async p => { await go(p, 'help') }],
  ['admin', async p => { await go(p, 'admin') }],
  ['lw-grid', async p => { await go(p, 'leavewar'); await p.waitForSelector('[data-testid="lw-tab-grid"]'); await p.waitForTimeout(800) }],
  ['lw-approvals', async p => { await go(p, 'leavewar'); await tap(p, '[data-testid="lw-tab-approvals"]'); await p.waitForTimeout(600) }],
  ['lw-balances', async p => { await go(p, 'leavewar'); await tap(p, '[data-testid="lw-tab-balances"]'); await p.waitForSelector('.bp-cols, .bp-table'); await p.waitForTimeout(600) }],
  ['lw-oil', async p => { await go(p, 'leavewar'); await tap(p, '[data-testid="oil-tracker"]'); await p.waitForTimeout(900) }],
  ['tracker', async p => { await go(p, 'tracker'); await p.waitForTimeout(2500) }],
]
async function go(p, page) {
  await p.evaluate(pg => window.go(pg), page)
  await p.waitForFunction(pg => window.CURPAGE === pg, page)
  await p.waitForTimeout(700)
}
async function tap(p, sel) {
  const l = p.locator(sel).first()
  await l.waitFor({ timeout: 15000 })
  if (p.__touch) await l.tap(); else await l.click()
}

/* the probe itself — runs in the page; `spill` names an inner scroll box (by its index in the list) to let draw outside */
const PROBE = async ({ spill }) => {
  const S = document.createElement('style')
  S.textContent = '*{pointer-events:auto!important}'
  document.head.appendChild(S)
  const cs = new Map(), css = e => { let c = cs.get(e); if (!c) { c = getComputedStyle(e); cs.set(e, c) } return c }
  const rc = e => { const q = e.getBoundingClientRect(); return [q.left, q.top, q.right, q.bottom].map(v => Math.round(v * 10) / 10).join(',') }
  const name = e => {
    if (!e || !e.tagName) return '-'
    const t = e.getAttribute && e.getAttribute('data-testid')
    return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.classList.length ? '.' + [...e.classList].slice(0, 3).join('.') : '') + (t ? `[${t}]` : '')
  }
  /* pinned: sticky or fixed by the stylesheet — or held in place by the app itself, found by MARK below (the Leave War's
     frozen columns on a phone are a copy the app keeps still: absolutely placed, moved back on every scroll) */
  /* …and pinned in a DIRECTION: a frozen column stays put sideways and moves up and down with its rows, so only what
     scrolls sideways under it can leak there. x, y or both, from its offsets, its own mark, and what carries it. */
  const axesOf = e => {
    const c = css(e)
    if (c.position === 'fixed') return 'xy'
    let a = ''
    if (c.position === 'sticky') { if (c.left !== 'auto' || c.right !== 'auto') a += 'x'; if (c.top !== 'auto' || c.bottom !== 'auto') a += 'y' }
    for (const ch of e.getAttribute('data-pinsweep') || '') if (!a.includes(ch)) a += ch
    return a
  }
  const isPos = e => axesOf(e) !== ''
  const pinAxes = e => { let a = ''; for (let x = e; x && x !== document.documentElement; x = x.parentElement) for (const ch of axesOf(x)) if (!a.includes(ch)) a += ch; return a }
  const holds = (h, need) => { const a = pinAxes(h); return [...need].every(ch => a.includes(ch)) }
  const pinnedOf = e => { for (let x = e; x && x !== document.documentElement; x = x.parentElement) if (isPos(x)) return x; return null }
  const opOf = e => { let o = 1; for (let x = e; x; x = x.parentElement) { const c = css(x); o *= +c.opacity; if (c.visibility === 'hidden' || c.display === 'none') return 0 } return o }
  const alpha = e => { const c = css(e); if (c.backgroundImage && c.backgroundImage !== 'none') return 1; const m = c.backgroundColor.match(/[\d.]+/g); return !m ? 0 : m.length >= 4 ? +m[3] : 1 }
  const scrollerOf = e => {
    for (let x = e.parentElement; x && x !== document.body && x !== document.documentElement; x = x.parentElement) {
      const c = css(x); if (/(auto|scroll|hidden|clip)/.test(c.overflowX + c.overflowY)) return x
    }
    return document.documentElement
  }
  /* does it move when something scrolls? Inside a scroll box that has room to scroll and not pinned within it — or, with
     no such box, on a page that scrolls and not pinned at all. A page's own fixed shade or cover over a list does not. */
  const canScroll = e => e.scrollHeight - e.clientHeight > 1 || e.scrollWidth - e.clientWidth > 1
  const scrolls = h => {
    for (let x = h; x && x !== document.documentElement; x = x.parentElement) {
      if (isPos(x)) return false
      const up = x.parentElement
      if (up && up !== document.body && up !== document.documentElement && /(auto|scroll|hidden)/.test(css(up).overflowX + css(up).overflowY) && canScroll(up)) return true
    }
    return canScroll(document.scrollingElement)
  }
  const page = document.querySelector('section.page.on') || document.body
  const inOff = e => { const s = e.closest('section.page'); return s && !s.classList.contains('on') }
  /* the topmost PAINTED element at a point */
  const topAt = (x, y) => { for (const h of document.elementsFromPoint(x, y)) if (opOf(h) > 0.02) return h; return null }
  const W = innerWidth, H = innerHeight
  const pins = [...document.querySelectorAll('body *')].filter(e => {
    if (!isPos(e) || inOff(e)) return false
    const q = e.getBoundingClientRect()
    if (q.width < 24 || q.height < 8 || q.bottom <= 0 || q.top >= H || q.right <= 0 || q.left >= W) return false
    return opOf(e) > 0.02
  })
  /* the inner scroll boxes of the page on screen (for the spill) */
  const boxes = [...page.querySelectorAll('*')].filter(e => {
    const c = css(e), q = e.getBoundingClientRect()
    if (!/(auto|scroll|hidden)/.test(c.overflowX + c.overflowY) || q.width < 160 || q.height < 120) return false
    return (e.scrollHeight - e.clientHeight > 40 || e.scrollWidth - e.clientWidth > 40) && q.bottom > 0 && q.top < H
  })
  let spilled = null, undo = null
  if (spill != null && boxes[spill]) {
    const b = boxes[spill], kid = b.firstElementChild
    spilled = b
    const was = [b.style.overflow, b.style.contain, kid && kid.style.translate]
    b.style.overflow = 'visible'; b.style.contain = 'none'
    if (kid) kid.style.translate = '-120px -120px'
    cs.clear()
    undo = () => { b.style.overflow = was[0]; b.style.contain = was[1]; if (kid) kid.style.translate = was[2] }
  }
  const leaks = [], seen = [], cands = []
  for (const P of pins) {
    if (spilled && spilled.contains(P)) continue
    const q = P.getBoundingClientRect()
    seen.push({ P: name(P), x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) })
    const xs = [0.04, 0.25, 0.5, 0.75, 0.96].map(f => q.left + Math.max(1, Math.min(q.width - 1, q.width * f)))
    const ys = [q.top + 0.6, q.top + q.height / 2, q.bottom - 0.6]
    for (const y of ys) for (const x of xs) {
      if (x < 0 || x >= W || y < 0 || y >= H) continue
      const h = topAt(x, y); if (!h) continue
      if (!(P === h || P.contains(h))) {
        if (!holds(h, pinAxes(P)) && scrolls(h)) cands.push({ P, h, l: { kind: 'covered', P: name(P), hit: name(h), pr: rc(P), hr: rc(h), x: Math.round(x), y: Math.round(y * 10) / 10 } })
        continue
      }
      /* the fill under the point: from the hit down to P, then on through any pinned part that carries P */
      let solid = false
      for (let e = h; e; e = e.parentElement) {
        if (alpha(e) >= 0.99) { solid = true; break }
        if (e === P || (!P.contains(e) && isPos(e))) {
          const up = e.parentElement
          if (!up || !pinnedOf(up)) break
        }
      }
      if (solid && opOf(P) < 0.99) solid = false
      if (!solid) leaks.push({ kind: 'see-through', P: name(P), hit: name(h), pr: rc(P), hr: rc(h), x: Math.round(x), y: Math.round(y * 10) / 10 })
    }
    /* the gap: only where P is stuck against another pinned part (it meets one within 3px on that side) */
    const c = css(P), sc = scrollerOf(P)
    const sides = [['top', q.top - 0.4, 'h'], ['bottom', q.bottom + 0.4, 'h'], ['left', q.left - 0.4, 'v'], ['right', q.right + 0.4, 'v']]
    for (const [side, at, dir] of sides) {
      if (c.position === 'sticky' && c[side] === 'auto') continue
      if (at < 0 || (dir === 'h' ? at >= H : at >= W)) continue
      const along = dir === 'h' ? xs : [q.top + 2, q.top + q.height / 2, q.bottom - 2]
      let abut = false
      for (const R of pins) {
        if (R === P || R.contains(P) || P.contains(R)) continue
        const r = R.getBoundingClientRect()
        const meet = side === 'top' ? r.bottom >= q.top - 3 && r.bottom <= q.top + 1 : side === 'bottom' ? r.top <= q.bottom + 3 && r.top >= q.bottom - 1 : side === 'left' ? r.right >= q.left - 3 && r.right <= q.left + 1 : r.left <= q.right + 3 && r.left >= q.right - 1
        const across = dir === 'h' ? r.left < q.right && r.right > q.left : r.top < q.bottom && r.bottom > q.top
        if (meet && across) { abut = true; break }
      }
      if (!abut) continue
      for (const a of along) {
        const [x, y] = dir === 'h' ? [a, at] : [at, a]
        if (x < 0 || x >= W || y < 0 || y >= H) continue
        const h = topAt(x, y)
        if (h && !holds(h, dir === 'h' ? 'y' : 'x') && scrolls(h) && (sc === document.documentElement || sc.contains(h))) cands.push({ P, h, l: { kind: 'gap', P: name(P) + ' ' + side, hit: name(h), pr: rc(P), hr: rc(h), x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 } })
      }
    }
  }
  /* a suspect is a leak only if it moves against the pinned part when something scrolls: each scroller nudged 30px, one
     direction at a time, the app's own scroll work let run, the two compared, the nudge put back */
  if (cands.length) {
    const frames = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 60))))
    const nudges = [], add = (e, dx, dy) => nudges.push([e, dx, dy])
    const se = document.scrollingElement
    const step = (pos, room) => pos + 30 <= room ? 30 : -30
    if (se.scrollHeight - se.clientHeight > 1) add(se, 0, step(se.scrollTop, se.scrollHeight - se.clientHeight))
    for (const e of [...page.querySelectorAll('*')].filter(e => /(auto|scroll)/.test(css(e).overflowX + css(e).overflowY)).slice(0, 40)) {
      if (e.scrollWidth - e.clientWidth > 1) add(e, step(e.scrollLeft, e.scrollWidth - e.clientWidth), 0)
      if (e.scrollHeight - e.clientHeight > 1) add(e, 0, step(e.scrollTop, e.scrollHeight - e.clientHeight))
    }
    const rel = c => { const a = c.P.getBoundingClientRect(), b = c.h.getBoundingClientRect(); return [b.left - a.left, b.top - a.top] }
    for (const [e, dx, dy] of nudges) {
      const before = cands.map(rel), t = e.scrollTop, l = e.scrollLeft
      e.scrollTop += dy; e.scrollLeft += dx
      await frames()
      cands.forEach((c, i) => { const r = rel(c); if (Math.abs(r[0] - before[i][0]) >= 1 || Math.abs(r[1] - before[i][1]) >= 1) c.real = true })
      e.scrollTop = t; e.scrollLeft = l
      await frames()
    }
    for (const c of cands) if (c.real) leaks.push(c.l)
  }
  if (undo) undo()
  S.remove()
  return { leaks, seen, boxes: boxes.map(name), scrollY: Math.round(scrollY), maxY: Math.round(document.scrollingElement.scrollHeight - innerHeight) }
}

/* D1518's own test of a pinned part — it stays put while what is under it scrolls: every absolutely placed element is
   measured, the page and each inner box scrolled 30px (back 30 where there is no room ahead), measured again after the
   app's own scroll work has run, and each one that did not move on screen is marked; then the scrolls are put back */
async function MARK(p) {
  await p.evaluate(() => {
    for (const e of document.querySelectorAll('[data-pinsweep]')) e.removeAttribute('data-pinsweep')
    window.__pr = []
    for (const e of document.querySelectorAll('body *')) if (getComputedStyle(e).position === 'absolute') { const q = e.getBoundingClientRect(); if (q.width && q.height) window.__pr.push([e, q.left, q.top]) }
    window.__ps = []
    const nudge = (e, doc) => {
      const roomY = e.scrollHeight - e.clientHeight, roomX = e.scrollWidth - e.clientWidth
      const dy = roomY > 1 ? (e.scrollTop + 30 <= roomY ? 30 : -30) : 0, dx = !doc && roomX > 1 ? (e.scrollLeft + 30 <= roomX ? 30 : -30) : 0
      if (!dy && !dx) return
      window.__ps.push([e, e.scrollTop, e.scrollLeft, dx, dy]); e.scrollTop += dy; e.scrollLeft += dx
    }
    nudge(document.scrollingElement, true)
    for (const e of document.querySelectorAll('section.page.on *')) { const c = getComputedStyle(e); if (/(auto|scroll)/.test(c.overflowX + c.overflowY)) nudge(e, false) }
  })
  await p.waitForTimeout(300)
  await p.evaluate(() => {
    /* only what sits in something that did scroll: on a page with nothing to scroll, nothing scrolls under anything */
    const inMoved = (e, k) => window.__ps.some(m => m[k] && (m[0] === document.scrollingElement || m[0].contains(e)))
    for (const [e, l, t] of window.__pr) {
      const q = e.getBoundingClientRect(); if (!q.width) continue
      const a = (inMoved(e, 3) && Math.abs(q.left - l) < 1 ? 'x' : '') + (inMoved(e, 4) && Math.abs(q.top - t) < 1 ? 'y' : '')
      if (a) e.setAttribute('data-pinsweep', a)
    }
    for (const [e, t, l] of window.__ps) { e.scrollTop = t; e.scrollLeft = l }
    window.__pr = window.__ps = null
  })
  await p.waitForTimeout(300)
}

const results = []
for (const [cname, cfg] of Object.entries(CONFIGS)) {
  if (ONLYC && !ONLYC.split(',').includes(cname)) continue
  const b = await (cfg.eng === 'webkit' ? webkit : chromium).launch(cfg.eng === 'chromium' ? LAUNCH : {})
  for (const [sname, reach] of STATES) {
    if (ONLYS && !ONLYS.split(',').includes(sname)) continue
    const ctx = await b.newContext({ ...cfg.ctx, timezoneId: 'Asia/Singapore' })
    const ORIGIN = 'http://localhost:4199'
    await serveDist(ctx, ORIGIN, DIST)
    const p = await ctx.newPage()
    p.__touch = !!cfg.ctx.hasTouch
    const errors = []
    p.on('pageerror', e => errors.push(String(e).slice(0, 160)))
    try {
      await p.goto(ORIGIN + '/')
      await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
      await p.waitForSelector('#vWeek .day', { timeout: 20000 })
      await reach(p)
      const max = await p.evaluate(() => document.scrollingElement.scrollHeight - innerHeight)
      const places = max > 40 ? [0, 0.3, 0.6, 0.97].map(f => Math.round(max * f)) : [0]
      for (const [i, y] of places.entries()) {
        await p.evaluate(yy => window.scrollTo(0, yy), y)
        await p.waitForTimeout(350)
        await MARK(p)
        const r = await p.evaluate(PROBE, { spill: null })
        results.push({ config: cname, state: sname, place: `y${y}`, ...r, errors: [...errors] })
        if (i === (places.length > 1 ? 1 : 0)) {
          /* the middle place: the inner boxes scrolled half-way too, each let spill in turn, and a picture of every pinned part */
          await p.evaluate(() => {
            for (const e of document.querySelectorAll('section.page.on *')) {
              const c = getComputedStyle(e)
              if (/(auto|scroll)/.test(c.overflowX + c.overflowY) && (e.scrollHeight - e.clientHeight > 40 || e.scrollWidth - e.clientWidth > 40)) {
                e.scrollTop = (e.scrollHeight - e.clientHeight) / 2; e.scrollLeft = (e.scrollWidth - e.clientWidth) / 2
              }
            }
          })
          await p.waitForTimeout(400)
          await MARK(p)
          const mid = await p.evaluate(PROBE, { spill: null })
          results.push({ config: cname, state: sname, place: `y${y}+inner`, ...mid, errors: [...errors] })
          for (let k = 0; k < Math.min(mid.boxes.length, 4); k++) {
            const s = await p.evaluate(PROBE, { spill: k })
            results.push({ config: cname, state: sname, place: `y${y}+spill:${mid.boxes[k]}`, ...s, seen: [], errors: [...errors] })
          }
          let n = 0
          for (const s of mid.seen) {
            if (n++ >= 10) break
            const vp = cfg.ctx.viewport
            const x = Math.max(0, s.x - 8), yy = Math.max(0, s.y - 8)
            const w = Math.min(vp.width - x, s.w + 16), h = Math.min(vp.height - yy, Math.min(s.h, 220) + 16)
            if (w > 4 && h > 4) await p.screenshot({ path: join(OUT, `${cname}-${sname}-${n}.png`), clip: { x, y: yy, width: w, height: h } }).catch(() => {})
          }
        }
      }
    } catch (e) { results.push({ config: cname, state: sname, place: 'ERR', error: String(e).slice(0, 300), leaks: [], seen: [] }) }
    await ctx.close()
  }
  await b.close()
}
writeFileSync(join(OUT, 'sweep.json'), JSON.stringify(results, null, 1))
/* one line for each distinct leak: where, what kind, the part, what showed, how many points */
const agg = new Map()
for (const r of results) for (const l of r.leaks) {
  const k = `${r.config} | ${r.state} | ${l.kind} | ${l.P} | ${l.hit}`
  const a = agg.get(k) || { n: 0, places: new Set(), at: `${l.x},${l.y} P[${l.pr}] hit[${l.hr}]` }
  a.n++; a.places.add(r.place); agg.set(k, a)
}
for (const r of results) if (r.place === 'ERR') console.log('ERROR', r.config, r.state, r.error)
for (const r of results) if (r.errors && r.errors.length && r.place === 'y0') console.log('PAGE ERRORS', r.config, r.state, r.errors.slice(0, 2).join(' / '))
console.log(`${agg.size} distinct leaks`)
for (const [k, a] of [...agg].sort()) console.log(`${k} | ${a.n} pts | ${[...a.places].slice(0, 3).join(' ')} | e.g. ${a.at}`)
const parts = new Set(results.flatMap(r => (r.seen || []).map(s => `${r.state} ${s.P}`)))
console.log(`${parts.size} pinned parts seen (by page)`)
console.log('DONE')
