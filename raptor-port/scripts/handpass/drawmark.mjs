// The one marking helper for drawings on the running app ([DRAW-MARK-HELPER], 14 Nov 26): every new drawing script
// imports it instead of writing its own ring-and-tag code. It keeps the rules of the mock-up method's step 3 and its
// traps (`.claude/skills/brainstorming/mockups-on-the-real-app.md`) by construction, because each was broken in silence
// by a script that "passed" — the picture alone showed the fault (skill notes 742, 820, 822, 848):
//   - a ring is an OUTLINE (it takes no room) hung from an attribute the app never styles; a TAG is a small element of
//     the helper's own in ONE layer of its own outside the app's tree (a child of <html>, after <body>), placed over the
//     part — never a child of the part, so no rule of the app (`:last-child`, `:empty`, `:has(`) reads it, and nothing
//     the helper does sets position, display, size or overflow on the part — a `position:relative` on a fixed list once
//     pulled the list out of its place (820). (The fix round of 14 Nov 26 moved the tag there: as the part's child it
//     turned a list's last row black and took an empty cell's dash, both accepted.)
//   - the part's box is measured before and after the mark, and a mark that moved or resized it is taken back and
//     refused (820) — this also catches a caller's own extra class (`addClass`) that moves the part; only the classes
//     the mark itself added are ever taken off again;
//   - a tag not wholly inside the window and every ancestor that clips the PART — measured on the screen, so a scaled
//     or zoomed panel is judged by the size it is drawn — is moved (above → inside → below) or, when the caller pinned
//     its place, refused (848): a tag standing where its part's surface is cut off would point at nothing;
//   - one mark a part: a second mark on a part already marked is refused before it touches anything;
//   - `hide()`, never a remove: a part the app drew and the script took away blanks the app at its next redraw (822);
//     `clear()` takes away only the helper's own tags, rings and added classes;
//   - the page's errors are printed to the run's log the moment they happen (822), and kept in `errors`;
//   - `check()` and `shot()` check every mark again — still there, still shown (not hidden, not see-through, an
//     ancestor's opacity counted), its part's box still where it was marked, its tag still on its part and still
//     uncut — and `shot()` refuses the picture on any fault (the method's first trap: the app's own redraw wipes what
//     was injected).
// The drawing check's measure (scripts/drawcheck/lib.mjs) records whether a part wears the helper's ring, so the
// marker colour is excused only on a part the drawing actually marked (742); the outline is not measured at all.
//
//   import { drawMarks } from './drawmark.mjs'
//   const dm = await drawMarks(page, { logFile })        // watches errors at once
//   await dm.mark('.bellpanel', { tag: '1' })              // n-th SHOWN match: { nth }; inside a surface: { within }
//   await dm.hide('.toast')
//   await dm.shot({ path: 'a.png' })                      // throws, no picture, when a mark is wrong
//
// Code sent into the page runs without this module: IN_PAGE declares every helper it calls inside itself (the
// method's second trap).
import { appendFileSync } from 'node:fs'

export const MARK_COLOUR = '#ff2d95'   // the drawings' marker colour — the drawing check excuses it on a marked part (compare.mjs)

// Everything the helper does inside the page, one function so page.evaluate carries it whole. `op` names the step.
function IN_PAGE({ op, sel, o, colour }) {
  const S = window.__drawmark || (window.__drawmark = { n: 0, marks: [] })
  // the helper's one stylesheet: the ring and the hiding hang from attributes the app never sets, so its own redraw of a
  // part's class or style leaves them; written again if a redraw took it away
  if (!document.getElementById('drawmark-style')) {
    const st = document.createElement('style'); st.id = 'drawmark-style'
    st.textContent = `[data-drawmark-ring]{outline:2px solid ${colour}!important;outline-offset:1px!important}`
      + '[data-drawmark-hidden]{display:none!important}'
      // the layer: placed at the page's top-left, taking no room, drawn over everything, never in the way of a tap
      + '[data-drawmark-layer]{position:absolute!important;left:0!important;top:0!important;width:0!important;height:0!important;'
      + 'margin:0!important;padding:0!important;border:0!important;overflow:visible!important;transform:none!important;zoom:1!important;'
      + 'display:block!important;visibility:visible!important;opacity:1!important;z-index:2147483000!important;pointer-events:none!important}'
      + `[data-drawmark-tag]{position:absolute!important;margin:0!important;box-sizing:border-box!important;display:block!important;`
      + `background:${colour}!important;color:#fff!important;font:600 11px/15px system-ui,-apple-system,sans-serif!important;`
      + 'padding:0 5px!important;border-radius:3px!important;white-space:nowrap!important;pointer-events:none!important;'
      + 'width:auto!important;height:auto!important;transform:none!important;letter-spacing:0!important;text-transform:none!important}'
    document.head.appendChild(st)
  }
  const layer = () => {
    let L = document.querySelector('[data-drawmark-layer]')
    if (!L) { L = document.createElement('div'); L.setAttribute('data-drawmark-layer', ''); L.setAttribute('aria-hidden', 'true'); document.documentElement.appendChild(L) }
    return L
  }
  // the ONE test of "shown": a box wider and taller than nothing, not hidden, and not see-through — its own opacity and
  // every ancestor's multiplied (a panel faded to 0 shows none of its parts)
  const shown = e => {
    const r = e.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) return false
    const s = getComputedStyle(e); if (s.visibility !== 'hidden' && s.display !== 'none') { /* go on */ } else return false
    let op = 1; for (let a = e; a && a.nodeType === 1; a = a.parentElement) op *= +getComputedStyle(a).opacity
    return op > 0.02
  }
  const box = e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }
  const same = (a, b, t = 0.5) => Math.abs(a.x - b.x) <= t && Math.abs(a.y - b.y) <= t && Math.abs(a.w - b.w) <= t && Math.abs(a.h - b.h) <= t
  const f = n => Math.round(n * 10) / 10
  const say = b => `${f(b.x)},${f(b.y)} ${f(b.w)}×${f(b.h)}`
  const name = a => a.tagName.toLowerCase() + (a.id ? '#' + a.id : '') + (typeof a.className === 'string' && a.className.trim() ? '.' + a.className.trim().split(/\s+/).slice(0, 2).join('.') : '')
  // the box that positions an element: a fixed one escapes every ancestor but a transformed (or filtered, contained)
  // one; an absolute one every ancestor but a positioned one; anything else sits in its parent
  const makesBlock = (s, forFixed) => (!forFixed && s.position !== 'static') || s.transform !== 'none' || s.perspective !== 'none'
    || s.filter !== 'none' || /paint|layout|strict|content/.test(s.contain) || /transform|perspective|filter/.test(s.willChange)
  const blockOf = el => {
    const p = getComputedStyle(el).position
    if (p !== 'absolute' && p !== 'fixed') return el.parentElement
    for (let a = el.parentElement; a; a = a.parentElement) if (makesBlock(getComputedStyle(a), p === 'fixed')) return a
    return null   // the window
  }
  // where an ancestor that cuts off what overflows it lets things show, ON THE SCREEN: its inner box (inside its edges),
  // scaled by however much it is drawn larger or smaller than its own size — a transform's scale, a zoom
  const clipOf = a => {
    const s = getComputedStyle(a)
    const cx = s.overflowX !== 'visible', cy = s.overflowY !== 'visible', cp = s.clipPath !== 'none' || /paint|strict|content/.test(s.contain)
    if (!cx && !cy && !cp) return null
    const r = a.getBoundingClientRect()
    const kx = a.offsetWidth ? r.width / a.offsetWidth : 1, ky = a.offsetHeight ? r.height / a.offsetHeight : 1
    const l = r.left + (parseFloat(s.borderLeftWidth) || 0) * kx, t = r.top + (parseFloat(s.borderTopWidth) || 0) * ky
    return { who: name(a), cx: cx || cp, cy: cy || cp, l, t, r: l + a.clientWidth * kx, b: t + a.clientHeight * ky }
  }
  // what can cut the part's surface off: the ancestors its chain of positioning boxes passes through that clip (and,
  // for a tag drawn inside it, the part itself), then the window
  const cutBy = (el, inside) => {
    const out = []
    if (inside) { const c = clipOf(el); if (c) out.push(c) }
    for (let a = blockOf(el); a && a !== document.documentElement; a = blockOf(a)) { const c = clipOf(a); if (c) out.push(c) }
    out.push({ who: 'the window', cx: true, cy: true, l: 0, t: 0, r: innerWidth, b: innerHeight })
    return out
  }
  const cutOff = (tag, el, inside) => {
    const t = tag.getBoundingClientRect()
    for (const c of cutBy(el, inside)) {
      if ((c.cx && (t.left < c.l - 0.5 || t.right > c.r + 0.5)) || (c.cy && (t.top < c.t - 0.5 || t.bottom > c.b + 0.5))) return c.who
    }
    return ''
  }
  // where the tag stands, as a point to put its top-left on, by the part's box
  const want = (place, pb, tb) => place === 'above' ? { x: pb.x, y: pb.y - tb.h - 3 } : place === 'below' ? { x: pb.x, y: pb.y + pb.h + 3 } : { x: pb.x + 2, y: pb.y + 2 }
  // put the tag's top-left on a screen point: the layer sits at the page's top-left, so the move is measured and, where
  // the page itself is scaled (a zoom on <html>), corrected once
  const put = (tag, pt) => {
    tag.style.left = '0px'; tag.style.top = '0px'
    const a = box(tag), dx = pt.x - a.x, dy = pt.y - a.y
    tag.style.left = dx + 'px'; tag.style.top = dy + 'px'
    const b = box(tag), kx = dx ? (b.x - a.x) / dx : 1, ky = dy ? (b.y - a.y) / dy : 1
    if (Math.abs(b.x - pt.x) > 0.5 && kx > 0.05) tag.style.left = (dx / kx) + 'px'
    if (Math.abs(b.y - pt.y) > 0.5 && ky > 0.05) tag.style.top = (dy / ky) + 'px'
    const c = box(tag); return Math.abs(c.x - pt.x) <= 1 && Math.abs(c.y - pt.y) <= 1
  }
  // the surface a step looks inside — `within`, its first shown match — or the page; a `within` that matches nothing
  // shown is a refusal, never the whole page (mark and hide alike)
  const rootOf = o => {
    if (!o.within) return { root: document }
    const root = [...document.querySelectorAll(o.within)].filter(shown)[0]
    return root ? { root } : { why: `no shown ${o.within} to look inside` }
  }
  const find = (sel, o = {}) => {
    const { root, why } = rootOf(o); if (!root) return { why }
    const all = [...root.querySelectorAll(sel)].filter(shown), el = all[o.nth || 0]
    return el ? { el } : { why: `no shown match ${o.nth || 0} of ${sel} (${all.length} shown)` }
  }
  // one mark's faults now: gone, no longer shown, its part moved since it was marked, its tag cut off or off its part
  const faultsOf = m => {
    const out = [], who = `mark ${m.tagText ? '"' + m.tagText + '"' : m.id} on ${m.sel}`
    if (!m.el.isConnected || m.el.getAttribute('data-drawmark-ring') !== m.id) { out.push(`${who}: its part was redrawn and the mark is gone — mark it again just before the picture`); return out }
    if (m.tag && !m.tag.isConnected) { out.push(`${who}: its tag was wiped — mark it again just before the picture`); return out }
    if (!shown(m.el)) out.push(`${who}: its part is no longer shown (hidden, see-through or of no size)`)
    if (m.tag && !shown(m.tag)) out.push(`${who}: its tag is no longer shown`)
    const now = box(m.el)
    if (!same(now, m.box)) out.push(`${who}: its part moved or changed size since it was marked (${say(m.box)} → ${say(now)})`)
    if (m.tag) {
      const tb = box(m.tag), w = want(m.place, now, tb)
      if (Math.abs(tb.x - w.x) > 1.5 || Math.abs(tb.y - w.y) > 1.5) out.push(`${who}: its tag is no longer on its part (${f(tb.x - w.x)},${f(tb.y - w.y)}px) — the page or a panel scrolled since?`)
      const c = cutOff(m.tag, m.el, m.place === 'inside'); if (c) out.push(`${who}: its tag stands where ${c} cuts its part off`)
    }
    return out
  }

  if (op === 'mark') {
    const { el, why } = find(sel, o)
    if (!el) return { ok: false, faults: [why] }
    // one mark a part: refused before anything is touched, so the first mark stays whole
    const had = el.getAttribute('data-drawmark-ring')
    if (had != null) return { ok: false, faults: [`${sel} is already marked (mark ${had}) — one mark a part; clear() first to mark it again`] }
    const before = box(el)
    const id = String(++S.n)
    el.setAttribute('data-drawmark-ring', id)
    // only the classes this mark adds are ever taken off again — a class the part already had is the app's
    const added = o.addClass ? [...new Set(o.addClass.split(/\s+/).filter(Boolean))].filter(c => !el.classList.contains(c)) : []
    if (added.length) el.classList.add(...added)
    let tag = null, place = ''
    const undo = () => { el.removeAttribute('data-drawmark-ring'); if (added.length) el.classList.remove(...added); if (tag) tag.remove() }   // the helper's own only
    const after = box(el)
    if (!same(before, after)) { undo(); const back = box(el); return { ok: false, faults: [`marking ${sel} moved or resized it (${say(before)} → ${say(after)}) — the mark is taken back${same(back, before) ? '' : ' (and the part did not come back: ' + say(back) + ')'}`] } }
    if (o.tag != null && o.tag !== '') {
      tag = document.createElement('span'); tag.setAttribute('data-drawmark-tag', id); tag.textContent = String(o.tag)
      layer().appendChild(tag)
      const tries = o.place ? [o.place] : ['above', 'inside', 'below']
      const tried = []
      for (const p of tries) {
        const pb = box(el)
        if (!put(tag, want(p, pb, box(tag)))) { tried.push(`${p}: could not be placed there`); continue }
        const c = cutOff(tag, el, p === 'inside')
        if (!c) { place = p; break }
        tried.push(`${p}: ${c} cuts its part off there`)
      }
      if (!place) { undo(); return { ok: false, faults: [`the tag on ${sel} is not wholly where its part shows anywhere it was tried — ${tried.join('; ')}`] } }
      if (!same(before, box(el))) { undo(); return { ok: false, faults: [`placing the tag on ${sel} moved its part — the mark is taken back`] } }
    }
    S.marks.push({ id, sel, el, tag, added, tagText: tag ? String(o.tag) : '', box: before, place })
    return { ok: true, id, place, box: before }
  }
  if (op === 'hide') {
    const { root, why } = rootOf(o); if (!root) return { ok: false, count: 0, faults: [why + ' — nothing hidden'] }
    const all = [...root.querySelectorAll(sel)]
    const pick = o.all ? all : all.filter(shown).slice(o.nth || 0, (o.nth || 0) + 1)
    pick.forEach(e => e.setAttribute('data-drawmark-hidden', ''))
    return { ok: pick.length > 0, count: pick.length, faults: pick.length ? [] : [`nothing shown to hide for ${sel}`] }
  }
  if (op === 'show') {
    const all = [...document.querySelectorAll('[data-drawmark-hidden]')].filter(e => !sel || e.matches(sel))
    all.forEach(e => e.removeAttribute('data-drawmark-hidden'))
    return { ok: true, count: all.length }
  }
  if (op === 'check') return { ok: true, faults: S.marks.flatMap(faultsOf), count: S.marks.length }
  if (op === 'clear') {
    for (const m of S.marks) {
      if (m.el.isConnected && m.el.getAttribute('data-drawmark-ring') === m.id) m.el.removeAttribute('data-drawmark-ring')
      if (m.el.isConnected && m.added.length) m.el.classList.remove(...m.added)
      if (m.tag) m.tag.remove()
    }
    document.querySelectorAll('[data-drawmark-layer]').forEach(t => t.remove())
    document.querySelectorAll('[data-drawmark-ring]').forEach(e => e.removeAttribute('data-drawmark-ring'))
    const n = S.marks.length; S.marks = []; return { ok: true, count: n }
  }
  return { ok: false, faults: ['unknown step ' + op] }
}

// The run's log: the console, and a file when one is named, written the moment a line comes — a run that dies keeps it.
function makeLog(o) {
  const lines = []
  const log = s => { lines.push(s); (o.log || console.log)(s); if (o.logFile) try { appendFileSync(o.logFile, s + '\n') } catch { /* the console still has it */ } }
  return { log, lines }
}

// Watch a page's own errors and print each as it happens (822). Called by drawMarks; usable alone.
export function watchErrors(page, o = {}) {
  const { log } = o.logger || makeLog(o)
  const errors = []
  const stamp = () => new Date().toISOString().slice(11, 23)
  page.on('pageerror', e => { const s = `[${stamp()}] [page error] ${e.message}`; errors.push(s); log(s) })
  page.on('console', m => { if (m.type() === 'error') { const s = `[${stamp()}] [console error] ${m.text()}`; errors.push(s); log(s) } })
  page.on('response', r => { if (r.status() >= 400) { const s = `[${stamp()}] [${r.status()}] ${r.url()}`; errors.push(s); log(s) } })
  page.on('crash', () => { const s = `[${stamp()}] [page crashed]`; errors.push(s); log(s) })
  return errors
}

// The helper bound to one page. Every step that finds a fault throws (`strict`, the default) — a drawing script stops
// on a wrong mark rather than shoot a wrong picture; `{ strict: false }` returns the faults instead.
export async function drawMarks(page, o = {}) {
  const logger = makeLog(o)
  const errors = watchErrors(page, { logger })
  const strict = o.strict !== false, colour = o.colour || MARK_COLOUR
  const run = async (op, sel, opts = {}) => {
    const r = await page.evaluate(IN_PAGE, { op, sel, o: opts, colour })
    if (r.faults?.length) { for (const f of r.faults) logger.log(`[drawmark] ${f}`); if (strict) throw new Error(`drawmark ${op}: ${r.faults.join(' | ')}`) }
    return r
  }
  return {
    errors, log: logger.log,
    // ring the n-th shown match of `sel` (inside `within`), with a tag when `tag` is given; `place` pins the tag
    // ('above' | 'inside' | 'below'), else the first of those it fits; `addClass` adds the caller's own look class,
    // which the box check holds to the same rule
    mark: (sel, opts = {}) => run('mark', sel, opts),
    // take a part the app drew out of the picture — hidden, never removed (822); `{ all: true }` for every match
    hide: (sel, opts = {}) => run('hide', sel, opts),
    show: (sel) => run('show', sel),
    // every mark's faults now, without a picture — the same check the picture makes, strict or not
    check: () => run('check', ''),
    // the picture, only once every mark is checked again — a fault refuses it, whatever `strict` says
    shot: async (shotOpts = {}) => {
      const r = await page.evaluate(IN_PAGE, { op: 'check', sel: '', o: {}, colour })
      if (r.faults.length) { for (const f of r.faults) logger.log(`[drawmark] picture refused: ${f}`); throw new Error(`drawmark: picture refused — ${r.faults.join(' | ')}`) }
      return page.screenshot(shotOpts)
    },
    // take away the helper's own tags, rings and added classes (between options — the method's "clear injected nodes" trap)
    clear: () => run('clear', ''),
  }
}
