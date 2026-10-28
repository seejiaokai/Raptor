// The drawing check's comparing (D1494): one named part of the drawing against the same part of the build. Kept apart
// from check.mjs so its self-test (selftest.mjs) runs it without a browser.
const rgba = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1] }
const sameColour = (a, b) => {
  const A = rgba(a), B = rgba(b)
  if (!A || !B) return String(a) === String(b)
  if (A[3] < 0.04 && B[3] < 0.04) return true            // both see-through: the colour behind them shows
  return Math.abs(A[3] - B[3]) <= 0.08 && [0, 1, 2].every(i => Math.abs(A[i] - B[i]) <= 12)
}
const edgeOf = s => { const m = s.match(/^([\d.]+)px (\w+) (.+)$/); return m ? { w: +m[1], style: m[2], c: m[3] } : { w: 0, style: 'none', c: '' } }
const seen = e => e.w > 0.4 && e.style !== 'none' && e.style !== 'hidden' && (rgba(e.c)?.[3] ?? 1) > 0.04
const sameEdge = (a, b) => { const A = edgeOf(a), B = edgeOf(b); if (!seen(A) && !seen(B)) return true; return seen(A) === seen(B) && Math.abs(A.w - B.w) <= 0.5 && sameColour(A.c, B.c) }
const px = s => parseFloat(s) || 0
const mid = r => r && { x: r.x + r.w / 2, y: r.y + r.h / 2 }
const r1 = n => Math.round(n * 10) / 10
const fmt = n => (Math.round(n) === r1(n) ? String(Math.round(n)) : String(r1(n)))
const SIDE = ['top', 'right', 'bottom', 'left'], CORNER = ['top left', 'top right', 'bottom right', 'bottom left']
const plainEdge = e => { const x = edgeOf(e); return seen(x) ? `${fmt(x.w)}px ${x.c}` : 'none' }

// Each check returns [] or the differences it found, each { what, drawing, build, by }. Positions are of the page,
// or — with `rel` — measured from another part's box, so a part is judged inside what holds it.
export function compare(part, D, B, Drel, Brel, TOL = 2) {
  const out = [], tol = part.tol ?? TOL
  const at = (m, rel) => rel ? { x: m.box.x - rel.box.x, y: m.box.y - rel.box.y } : { x: m.box.x, y: m.box.y }
  for (const c of part.check) {
    if (c === 'place') {
      const d = at(D, Drel), b = at(B, Brel)
      for (const [k, word, more, less] of [['x', 'from the left', 'further right', 'further left'], ['y', 'from the top', 'lower', 'higher']]) {
        const dd = b[k] - d[k]
        if (Math.abs(dd) > tol) out.push({ check: 'place', what: `where it sits (${word}${part.rel ? ' of ' + part.rel : ''})`, drawing: fmt(d[k]), build: fmt(b[k]), by: `${fmt(Math.abs(dd))}px ${dd > 0 ? more : less}` })
      }
    } else if (c === 'size' || c === 'width' || c === 'height') {
      for (const [k, word] of [['w', 'width'], ['h', 'height']]) {
        if (c !== 'size' && c !== word) continue
        const dd = B.box[k] - D.box[k]
        if (Math.abs(dd) > tol) out.push({ check: word, what: `its ${word}`, drawing: fmt(D.box[k]), build: fmt(B.box[k]), by: `${fmt(Math.abs(dd))}px ${dd > 0 ? 'more' : 'less'}` })
      }
    } else if (c === 'words-x' || c === 'words-y') {
      // where its words sit: across it (left-set or centred), or on the line of `rel`'s words
      const k = c === 'words-x' ? 'x' : 'y'
      // the words' own place decides — never the setting alone: a drawing may set its words right by another rule (a
      // flex box), and a typed box's words are worked out from its value (lib.mjs). The settings are named beside it.
      const align = s => ({ start: 'left', end: 'right', '-webkit-left': 'left', '-webkit-right': 'right', '-webkit-center': 'center' }[s] || s)
      if (!D.ink || !B.ink) { if (!!D.ink !== !!B.ink) out.push({ check: c, what: 'its words', drawing: D.ink ? 'has words' : 'no words', build: B.ink ? 'has words' : 'no words', by: '' }); continue }
      let d, b, word
      // 'words-y' with `rel`: is it on the line of rel's words (their middles)? 'words-x' is always inside its own box
      if (k === 'y' && part.rel && Drel?.ink && Brel?.ink) { d = mid(D.ink).y - mid(Drel.ink).y; b = mid(B.ink).y - mid(Brel.ink).y; word = `the height of its words against ${part.rel}'s words` }
      else if (k === 'x') { d = D.ink.x - D.box.x; b = B.ink.x - B.box.x; word = 'where its words start inside it' }
      else { d = D.ink.y - D.box.y; b = B.ink.y - B.box.y; word = 'how far down inside it its words sit' }
      const dd = b - d
      const set = k === 'x' && align(D.look.align) !== align(B.look.align) ? ` (set ${align(D.look.align)} in the drawing, ${align(B.look.align)} built)` : ''
      if (Math.abs(dd) > tol) out.push({ check: c, what: word + set, drawing: fmt(d), build: fmt(b), by: `${fmt(Math.abs(dd))}px ${k === 'y' ? (dd > 0 ? 'lower' : 'higher') : (dd > 0 ? 'further right' : 'further left')}` })
    } else if (c === 'words-place') {
      // where its words are drawn on the screen — from `rel`'s box when it has one — whatever box holds them: a figure
      // with no box of its own is judged by its words, never by an invisible box's width
      if (!D.ink || !B.ink) { if (!!D.ink !== !!B.ink) out.push({ check: c, what: 'its words', drawing: D.ink ? 'has words' : 'no words', build: B.ink ? 'has words' : 'no words', by: '' }); continue }
      const o = r => r ? { x: r.box.x, y: r.box.y } : { x: 0, y: 0 }
      const d = { x: D.ink.x - o(Drel).x, y: D.ink.y - o(Drel).y, r: D.ink.x + D.ink.w - o(Drel).x }, b = { x: B.ink.x - o(Brel).x, y: B.ink.y - o(Brel).y, r: B.ink.x + B.ink.w - o(Brel).x }
      // set right, its words are judged by where they end; otherwise by where they start
      const right = /right|end/.test(D.look.align)
      const kx = right ? 'r' : 'x'
      for (const [k, word, more, less] of [[kx, right ? 'where its words end' : 'where its words start', 'further right', 'further left'], ['y', 'the height of its words', 'lower', 'higher']]) {
        const dd = b[k] - d[k]
        if (Math.abs(dd) > tol) out.push({ check: c, what: `${word}${part.rel ? ' (from ' + part.rel + ')' : ''}`, drawing: fmt(d[k]), build: fmt(b[k]), by: `${fmt(Math.abs(dd))}px ${dd > 0 ? more : less}` })
      }
    } else if (c === 'fill') {
      if (!sameColour(D.look.fill, B.look.fill)) out.push({ check: c, what: 'its fill colour', drawing: D.look.fill, build: B.look.fill, by: '' })
      if (D.look.image !== B.look.image) out.push({ check: c, what: 'its shading', drawing: D.look.image || 'none', build: B.look.image || 'none', by: '' })
    } else if (c === 'edge') {
      D.look.edge.forEach((e, i) => { if (!sameEdge(e, B.look.edge[i])) out.push({ check: c, what: `its ${SIDE[i]} edge`, drawing: plainEdge(e), build: plainEdge(B.look.edge[i]), by: '' }) })
    } else if (c === 'corners') {
      D.look.corners.forEach((e, i) => { if (Math.abs(px(e) - px(B.look.corners[i])) > 1) out.push({ check: c, what: `its ${CORNER[i]} corner's rounding`, drawing: e, build: B.look.corners[i], by: '' }) })
    } else if (c === 'shadow') {
      if ((D.look.shadow === 'none') !== (B.look.shadow === 'none')) out.push({ check: c, what: 'its shadow', drawing: D.look.shadow, build: B.look.shadow, by: '' })
    } else if (c === 'colour') {
      if (!sameColour(D.look.color, B.look.color)) out.push({ check: c, what: "its words' colour", drawing: D.look.color, build: B.look.color, by: '' })
    } else if (c === 'letters') {
      if (D.look.font !== B.look.font) out.push({ check: c, what: 'its letters (weight and size)', drawing: D.look.font, build: B.look.font, by: '' })
    } else if (c === 'text') {
      const norm = s => s.replace(/\s+/g, ' ').trim()
      if (norm(D.text) !== norm(B.text)) out.push({ check: c, what: 'its words', drawing: D.text, build: B.text, by: '' })
    } else throw new Error(`${part.name}: no such check "${c}"`)
  }
  return out
}

