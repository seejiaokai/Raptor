// THE PINNED-PART PROBE (his D1518, 29 Oct 26 — "nothing pinned on screen leaks"; [PINNED-LEAK-SWEEP]), shared by the sweep
// (pinned-sweep.mjs — every page at four sizes) and the pinch walk (pinned-pinch.mjs — mid-pinch and after the lift). What it
// checks and how it was calibrated: the sweep's header and docs/handpass/2026-10-30-scroll-pinned.md.
/* the probe itself — runs in the page; `spill` names an inner scroll box (by its index in the list) to let draw outside */
export const PROBE = async ({ spill, keep }) => {
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
    /* sticky pins only along an axis its scroll box can scroll: Quals' real heading row is sticky top:0 inside a box that
       scrolls only sideways, so it pins nothing up and down (QualsPage's own comment) — counted, it made the rows under the
       pinned copy read as a gap between two pinned parts (the first sweep, 30 Oct 26) */
    if (c.position === 'sticky') {
      const sc = stickyBox(e)
      const roomX = sc === document.documentElement ? true : sc.scrollWidth - sc.clientWidth > 1
      const roomY = sc === document.documentElement ? true : sc.scrollHeight - sc.clientHeight > 1
      if ((c.left !== 'auto' || c.right !== 'auto') && roomX) a += 'x'
      if ((c.top !== 'auto' || c.bottom !== 'auto') && roomY) a += 'y'
    }
    for (const ch of e.getAttribute('data-pinsweep') || '') if (!a.includes(ch)) a += ch
    return a
  }
  const isPos = e => axesOf(e) !== ''
  /* the box a sticky part sticks in: its nearest ancestor that clips or scrolls, else the page */
  function stickyBox(e) {
    for (let x = e.parentElement; x && x !== document.body && x !== document.documentElement; x = x.parentElement) {
      const c = css(x); if (/(auto|scroll|hidden|clip)/.test(c.overflowX + c.overflowY)) return x
    }
    return document.documentElement
  }
  /* WHAT OF A PART IS DRAWN: its box cut by every ancestor that clips it (a heading cell past its table's scroll box is not
     drawn there, and what shows at that point is rightly the page — the first sweep's Quals "covered" headings), and a
     point in a rounded corner is outside its shape (the week's ‹ › and the crew rail answered "covered" at their corners) */
  const visRect = e => {
    const q = e.getBoundingClientRect()
    let l = q.left, t = q.top, r = q.right, b = q.bottom
    if (css(e).position !== 'fixed') for (let x = e.parentElement; x && x !== document.documentElement; x = x.parentElement) {
      const c = css(x), a = x.getBoundingClientRect()
      const clipX = c.overflowX !== 'visible' || /paint/.test(c.contain), clipY = c.overflowY !== 'visible' || /paint/.test(c.contain)
      if (clipX) { l = Math.max(l, a.left); r = Math.min(r, a.right) }
      if (clipY) { t = Math.max(t, a.top); b = Math.min(b, a.bottom) }
      if (c.position === 'fixed') break
    }
    l = Math.max(l, 0); t = Math.max(t, 0); r = Math.min(r, innerWidth); b = Math.min(b, innerHeight)
    return { left: l, top: t, right: r, bottom: b, width: r - l, height: b - t }
  }
  const inShape = (e, x, y) => {
    const q = e.getBoundingClientRect(), c = css(e)
    const rad = v => parseFloat(v) || 0
    const corners = [[rad(c.borderTopLeftRadius), q.left, q.top, 1, 1], [rad(c.borderTopRightRadius), q.right, q.top, -1, 1],
      [rad(c.borderBottomLeftRadius), q.left, q.bottom, 1, -1], [rad(c.borderBottomRightRadius), q.right, q.bottom, -1, -1]]
    for (const [r, cx, cy, sx, sy] of corners) {
      if (r <= 0) continue
      const ox = cx + sx * r, oy = cy + sy * r
      if ((x - ox) * sx < 0 && (y - oy) * sy < 0 && (x - ox) ** 2 + (y - oy) ** 2 > (r - 0.5) ** 2) return false
    }
    return true
  }
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
    /* the desktop week's ‹ › arrows stay see-through on purpose (his D1522, 30 Oct 26) */
    if (e.classList.contains('week-nav')) return false
    const q = visRect(e)
    if (q.width < 24 || q.height < 8 || q.bottom <= 0 || q.top >= H || q.right <= 0 || q.left >= W) return false
    /* a shade over the whole screen behind a window (the OIL tracker's scrim) is see-through by design: it dims, it is
       not a bar */
    if (q.width >= W * 0.9 && q.height >= H * 0.9 && alpha(e) < 0.99) return false
    return opOf(e) > 0.02
  })
  /* the inner scroll boxes of the page on screen (for the spill) */
  const boxes = [...page.querySelectorAll('*')].filter(e => {
    const c = css(e), q = e.getBoundingClientRect()
    if (!/(auto|scroll)/.test(c.overflowX + c.overflowY) || q.width < 160 || q.height < 120) return false  /* a box that clips but does not scroll (a window, a card) is no list: nothing scrolls under what stands beside it */
    return (e.scrollHeight - e.clientHeight > 40 || e.scrollWidth - e.clientWidth > 40) && q.bottom > 0 && q.top < H
  })
  let spilled = null, undo = null
  const leaks = [], seen = [], cands = []
  if (spill != null && boxes[spill]) {
    const b = boxes[spill], kid = b.firstElementChild
    spilled = b
    /* THE BAND AROUND THE BOX (calibrated 30 Oct 26 on the build before D1519's fix): a part that stands beside an inner
       scroll box — the Balances page's bar over its list — stays put while the list scrolls under its edge, whatever its
       own position is, so it is never found as sticky or fixed. Before the spill, note what is painted in a band above
       and left of the box (only a separate part: never the box's own ancestors, whose fill is the box's surroundings);
       after it, the list let draw past its edge must not answer there, on top or through a part with no fill of its own */
    const bq = b.getBoundingClientRect()
    const band = []
    /* only along an axis the box scrolls: a list that scrolls only sideways (Quals' table, the page scrolling it up and
       down with what is above it) never has rows under the part above it */
    const upDown = b.scrollHeight - b.clientHeight > 1, sideways = b.scrollWidth - b.clientWidth > 1
    for (const d of [0.6, 2, 6, 20, 60, 110]) {
      if (upDown) for (const f of [0.04, 0.25, 0.5, 0.75, 0.96]) band.push([bq.left + bq.width * f, bq.top - d, 'top'])
      if (sideways) for (const f of [0.1, 0.5, 0.9]) band.push([bq.left - d, bq.top + bq.height * f, 'left'])
    }
    const pre = band.map(([x, y, side]) => {
      if (x < 0 || x >= W || y < 0 || y >= H) return null
      const h = topAt(x, y)
      if (!h || h.contains(b) || b.contains(h)) return null
      return { x, y, side, h }
    })
    /* …AND THE STRIP BETWEEN THE BOX AND THE PART BESIDE IT. Where a part stands a few pixels off the list (a tools row's
       margin), the strip between them is the surroundings' own fill — an ancestor, skipped above — and a list drawn past
       its edge shows there as plainly as through a bar: every point of the band closer to the box than the nearest part
       beside it, within 12px, is asked too */
    const STRIP = 12
    for (const [i, [x, y, side]] of band.entries()) {
      if (pre[i] || x < 0 || x >= W || y < 0 || y >= H) continue
      /* only where the box's surroundings show now: a point its own content already answers (a seam where two boxes meet on
         one screen pixel — the Tracker head over its chart) is no strip */
      { const h0 = topAt(x, y); if (!h0 || !h0.contains(b) || h0 === b) continue }
      const d = side === 'top' ? bq.top - y : bq.left - x
      if (d > STRIP) continue
      /* a part beside the box within 14px, looked for in 1px steps outwards from this point */
      let part = null
      for (let k = Math.ceil(d) + 1; k <= STRIP + 2 && !part; k++) {
        const yy = side === 'top' ? bq.top - k : y, xx = side === 'top' ? x : bq.left - k
        if (xx < 0 || yy < 0) break
        const h = topAt(xx, yy)
        if (h && !h.contains(b) && !b.contains(h)) part = h
      }
      if (part) pre[i] = { x, y, side: side + '-strip', h: part }
    }
    const was = [b.style.overflow, b.style.contain, kid && kid.style.translate]
    b.style.overflow = 'visible'; b.style.contain = 'none'
    if (kid) kid.style.translate = '-120px -120px'
    cs.clear()
    undo = () => { b.style.overflow = was[0]; b.style.contain = was[1]; if (kid) kid.style.translate = was[2] }
    window.__spillUndo = undo
    for (const s of pre) {
      if (!s) continue
      for (const e of document.elementsFromPoint(s.x, s.y)) {
        if (opOf(e) <= 0.02) continue
        if (b.contains(e) && e !== b) { leaks.push({ kind: 'spill-' + s.side, P: name(s.h), hit: name(e), pr: rc(s.h), hr: rc(e), x: Math.round(s.x), y: Math.round(s.y * 10) / 10 }); break }
        if (alpha(e) >= 0.99) break
      }
    }
  }
  for (const P of pins) {
    if (spilled && spilled.contains(P)) continue
    const q = visRect(P)
    seen.push({ P: name(P), x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) })
    const xs = [0.04, 0.25, 0.5, 0.75, 0.96].map(f => q.left + Math.max(1, Math.min(q.width - 1, q.width * f)))
    const ys = [q.top + 0.6, q.top + q.height / 2, q.bottom - 0.6]
    for (const y of ys) for (const x of xs) {
      if (x < 0 || x >= W || y < 0 || y >= H) continue
      if (!inShape(P, x, y)) continue
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
      /* sampled only along the stretch where the two parts meet (the first sweep: the Leave War's frozen date bar met
         the frozen names column at its left end, and the rows under the bar's whole length were counted as a gap) */
      const spans = []
      for (const R of pins) {
        if (R === P || R.contains(P) || P.contains(R)) continue
        if (spilled && spilled.contains(R)) continue
        const r = visRect(R)
        const meet = side === 'top' ? r.bottom >= q.top - 3 && r.bottom <= q.top + 1 : side === 'bottom' ? r.top <= q.bottom + 3 && r.top >= q.bottom - 1 : side === 'left' ? r.right >= q.left - 3 && r.right <= q.left + 1 : r.left <= q.right + 3 && r.left >= q.right - 1
        const across = dir === 'h' ? r.left < q.right && r.right > q.left : r.top < q.bottom && r.bottom > q.top
        if (meet && across) spans.push(dir === 'h' ? [Math.max(r.left, q.left), Math.min(r.right, q.right)] : [Math.max(r.top, q.top), Math.min(r.bottom, q.bottom)])
      }
      if (!spans.length) continue
      const along = spans.flatMap(([a0, a1]) => [0.1, 0.5, 0.9].map(t => a0 + (a1 - a0) * t))
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
  if (undo && !keep) undo()
  S.remove()
  const sb = spilled && spilled.getBoundingClientRect()
  return { leaks, seen, boxes: boxes.map(name), spillBox: sb && { x: sb.left, y: sb.top, w: sb.width, h: sb.height }, scrollY: Math.round(scrollY), maxY: Math.round(document.scrollingElement.scrollHeight - innerHeight) }
}

/* D1518's own test of a pinned part — it stays put while what is under it scrolls: every absolutely placed element is
   measured, the page and each inner box scrolled 30px (back 30 where there is no room ahead), measured again after the
   app's own scroll work has run, and each one that did not move on screen is marked; then the scrolls are put back */
export async function MARK(p) {
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
