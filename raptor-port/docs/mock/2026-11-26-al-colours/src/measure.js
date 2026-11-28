/* THE CLEARANCE MEASURE (for shoot.mjs on the real app and test.mjs on the built page; never part of the page itself).
   For every amendment mark that draws a line, inside `rootSel`: where the line's lower edge is, and how far below it the
   nearest other thing starts. "Thing" is (1) any box that is not the mark, its ancestor or its descendant, that paints
   something (a fill, an edge, its own letters, a form box), overlaps the line sideways and starts below the middle of the
   mark's last line of letters; and (2) the lower inside edge of every ancestor that has an edge to touch: a bottom border,
   (gap). A neighbour that is only letters starts at its letters' ink. Separately (cut): the room left before the nearest
   ancestor that cuts off what overflows it; that draws nothing, so the line need only not be cut. A negative figure means
   the line crosses the thing.   Returns one row a mark: { place, state, gap, to, cut }. */
window.ALXmeasure = rootSel => {
  const root = document.querySelector(rootSel); if (!root) return []
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const px = v => parseFloat(v) || 0
  const clear = c => !c || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c)
  const PLACE = { ap: 'Common Programme', ff: 'flying line: callsign, mission, times', fr: 'flight remark (over its stores chips)', wl: 'wave label', dl: 'duty block label', dr: 'duty desk', gr: 'Ground Programme', dn: 'day note' }
  const placeOf = e => {
    const k = e.getAttribute('data-txt') || e.getAttribute('data-bfld') || ''
    if (k.startsWith('sr:')) return (/\.amt\./.test(k) ? 'sim: AMT block' : 'sim: OFT / SIMS row') + (/\.who$/.test(k) ? ', free-text crew' : /\.(str|end)$/.test(k) ? ', time' : /\.rmks$/.test(k) ? ', remark' : ', name')
    if (k && PLACE[k.slice(0, 2)]) return PLACE[k.slice(0, 2)] + (/^(dr|ap|gr):/.test(k) ? (/\.(str|end)$/.test(k) ? ', time' : /\.rmks$/.test(k) ? ', remark' : ', name') : '')
    if (e.classList.contains('areacell')) return 'area'
    if (e.classList.contains('timecell')) return 'area time'
    if (e.classList.contains('intimes') || e.closest('.intimes')) return 'in-time line'
    /* View-only Sched carries no keys: name the place from the row it sits in */
    const row = e.closest('.pl-row, .ah-row'), sub = row && (() => { let s = row.previousElementSibling; while (s && !s.classList.contains('pl-sub')) s = s.previousElementSibling; return s && s.textContent.trim() })()
    const col = e.classList.contains('t') ? ', time' : e.closest('.rmk') ? ', remark' : ', name'
    if (row && sub) return (/AMT/.test(sub) ? 'sim: AMT block' : /OFT|SIM/.test(sub) ? 'sim: OFT / SIMS row' : sub) + col
    if (row) return (row.classList.contains('ah-row') ? 'Common Programme' : 'duty desk / Ground Programme') + col
    if (e.closest('.form')) return e.closest('.rmkcell, .sb-rcell') ? 'flight remark (over its stores chips)' : 'flying line: callsign, mission, times'
    return (e.className && String(e.className).split(' ')[0]) || e.tagName.toLowerCase()
  }
  const paints = (e, cs) => !clear(cs.backgroundColor) || cs.backgroundImage !== 'none' || ['Top', 'Bottom', 'Left', 'Right'].some(s => px(cs['border' + s + 'Width']) > 0 && !clear(cs['border' + s + 'Color'])) ||
    /^(INPUT|TEXTAREA|SELECT|BUTTON|IMG|SVG)$/i.test(e.tagName) || [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())
  const all = [...root.querySelectorAll('*')].filter(vis)
  const rows = [], ctx = document.createElement('canvas').getContext('2d')
  for (const e of root.querySelectorAll('[data-alc],[data-aln]')) {
    if (!vis(e) || e.matches('.seat,.verchip,.alx-k,.rmkcell,.sb-rcell') || e.closest('.alpanel')) continue
    const cs = getComputedStyle(e), state = e.hasAttribute('data-aln') ? 'waiting' : 'out'
    let lineBottom, left, right, mid
    if (/^(INPUT|TEXTAREA)$/.test(e.tagName)) {
      if (cs.backgroundImage === 'none') { /* the app's own look: the line is the box's outline, on its edge */
        if (cs.outlineStyle === 'none') continue
        const r = e.getBoundingClientRect(); lineBottom = r.bottom; left = r.left; right = r.right; mid = r.top + r.height / 2
      } else {
        const r = e.getBoundingClientRect(), m = cs.backgroundPositionY.match(/calc\(100% - ([\d.]+)px\)/), up = m ? +m[1] : 0
        lineBottom = r.bottom - px(cs.borderBottomWidth) - up; left = r.left; right = r.right; mid = r.top + r.height / 2
        /* inside its own box: the gap is to the box's own inner edge */
        rows.push({ place: placeOf(e) + ' (board box)', state, gap: Math.round((r.bottom - px(cs.borderBottomWidth) - lineBottom) * 10) / 10, to: 'its own box’s foot' }); continue
      }
    } else {
      if (!/underline/.test(cs.textDecorationLine)) continue
      const rs = [...e.getClientRects()].filter(r => r.width > 0); if (!rs.length) continue
      const last = rs[rs.length - 1]
      const probe = document.createElement('span'); probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
      e.appendChild(probe); const base = probe.getBoundingClientRect().bottom; probe.remove()
      const off = cs.textUnderlineOffset === 'auto' ? 1 : px(cs.textUnderlineOffset), th = cs.textDecorationThickness === 'auto' || cs.textDecorationThickness === 'from-font' ? 1 : px(cs.textDecorationThickness)
      lineBottom = base + off + th; left = last.left; right = last.right; mid = last.top + last.height / 2
    }
    let gap = 1e9, to = '', cut = 1e9
    for (const o of all) {
      if (o === e || o.contains(e) || e.contains(o)) continue
      const r = o.getBoundingClientRect(); if (r.right <= left + 0.5 || r.left >= right - 0.5 || r.top < mid || r.top - lineBottom >= gap) continue
      const oc = getComputedStyle(o); if (oc.visibility === 'hidden' || +oc.opacity === 0 || !paints(o, oc)) continue
      /* a neighbour that paints only its own letters starts where its letters' ink starts, not where its line box does */
      let top = r.top
      if (clear(oc.backgroundColor) && oc.backgroundImage === 'none' && !/^(INPUT|TEXTAREA|SELECT|BUTTON|IMG|SVG)$/i.test(o.tagName) && !['Top', 'Bottom', 'Left', 'Right'].some(s => px(oc['border' + s + 'Width']) > 0 && !clear(oc['border' + s + 'Color']))) {
        const pr = document.createElement('span'); pr.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'; o.insertBefore(pr, o.firstChild); const ob = pr.getBoundingClientRect().bottom; pr.remove()
        ctx.font = oc.font; top = ob - ctx.measureText(o.textContent.trim().slice(0, 40) || 'H').actualBoundingBoxAscent
      }
      if (top - lineBottom >= gap) continue
      gap = top - lineBottom; to = (o.className && String(o.className).split(' ').slice(0, 2).join('.')) || o.tagName.toLowerCase()
    }
    for (let a = e.parentElement; a && a !== root.parentElement; a = a.parentElement) {
      const ac = getComputedStyle(a), r = a.getBoundingClientRect(), edge = px(ac.borderBottomWidth) > 0 && !clear(ac.borderBottomColor), clip = /hidden|clip/.test(ac.overflowY)
      const g = r.bottom - px(ac.borderBottomWidth) - lineBottom
      /* a box that only cuts off what overflows it draws nothing at its foot: the line must not be CUT by it (cut), which
         is a different thing from standing 2px clear of something drawn (gap); a list that scrolls is not an edge at all */
      if (clip && Math.abs(g) < 30 && g < cut) cut = g   // a far-off figure is a box the mark does not really sit in (a scrolled list's frame)
      if (edge && g < gap) { gap = g; to = 'the line at the foot of ' + ((a.className && String(a.className).split(' ').slice(0, 2).join('.')) || a.tagName.toLowerCase()) }
    }
    rows.push({ place: placeOf(e), state, gap: Math.round(gap * 10) / 10, to, cut: cut > 1e8 ? null : Math.round(cut * 10) / 10 })
  }
  return rows
}
