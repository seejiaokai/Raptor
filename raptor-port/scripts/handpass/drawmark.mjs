// The one marking helper for drawings on the running app ([DRAW-MARK-HELPER], 14 Nov 26): every new drawing script
// imports it instead of writing its own ring-and-tag code. It keeps the rules of the mock-up method's step 3 and its
// traps (`.claude/skills/brainstorming/mockups-on-the-real-app.md`) by construction, because each was broken in silence
// by a script that "passed" — the picture alone showed the fault (skill notes 742, 820, 822, 848):
//   - a ring is an OUTLINE (it takes no room) and a TAG, a small element of the helper's own placed as the part's child
//     (beside it for a box that holds no children); nothing the helper does sets position, display, size or overflow on
//     the part — a `position:relative` on a fixed list once pulled the list out of its place (820);
//   - the part's box is measured before and after the mark, and a mark that moved or resized it is taken back and
//     refused (820) — this also catches a caller's own extra class (`addClass`) that moves the part;
//   - a tag not wholly inside every ancestor that clips it, and the window, is moved (above → inside → below) or, when
//     the caller pinned its place, refused (848);
//   - `hide()`, never a remove: a part the app drew and the script took away blanks the app at its next redraw (822);
//     `clear()` takes away only the helper's own tags and rings;
//   - the page's errors are printed to the run's log the moment they happen (822), and kept in `errors`;
//   - `shot()` checks every mark again just before the picture — still there, its part's box still where it was marked,
//     its tag still beside its part and still uncut — and refuses the picture on any fault (the method's first trap:
//     the app's own redraw wipes what was injected).
// The tag carries `data-drawmark-tag`, which the drawing check's measure skips (scripts/drawcheck/lib.mjs), so a tag
// drawn inside a part is never measured as the part's words; the outline is not measured at all (742).
//
//   import { drawMarks } from './drawmark.mjs'
//   const dm = await drawMarks(page, { logFile })        // watches errors at once
//   await dm.mark('.bellpanel', { tag: '1' })              // n-th VISIBLE match: { nth }; inside a surface: { within }
//   await dm.hide('.toast')
//   await dm.shot({ path: 'a.png' })                      // throws, no picture, when a mark is wrong
//
// Code sent into the page runs without this module: IN_PAGE declares every helper it calls inside itself (the
// method's second trap).
import { appendFileSync } from 'node:fs'

export const MARK_COLOUR = '#ff2d95'   // the drawings' marker colour — the drawing check leaves it out (compare.mjs)

// Everything the helper does inside the page, one function so page.evaluate carries it whole. `op` names the step.
function IN_PAGE({ op, sel, o, colour }) {
  const S = window.__drawmark || (window.__drawmark = { n: 0, marks: [] })
  // the helper's one stylesheet: the ring and the hiding hang from attributes the app never sets, so its own redraw of a
  // part's class or style leaves them; written again if a redraw took it away
  if (!document.getElementById('drawmark-style')) {
    const st = document.createElement('style'); st.id = 'drawmark-style'
    st.textContent = `[data-drawmark-ring]{outline:2px solid ${colour}!important;outline-offset:1px!important}`
      + '[data-drawmark-hidden]{display:none!important}'
      + `[data-drawmark-tag]{position:absolute!important;z-index:2147483000!important;margin:0!important;box-sizing:border-box!important;`
      + `background:${colour}!important;color:#fff!important;font:600 11px/15px system-ui,-apple-system,sans-serif!important;`
      + 'padding:0 5px!important;border-radius:3px!important;white-space:nowrap!important;pointer-events:none!important;'
      + 'width:auto!important;height:auto!important;transform:none!important;letter-spacing:0!important;text-transform:none!important}'
    document.head.appendChild(st)
  }
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) return false; const s = getComputedStyle(e); return s.visibility !== 'hidden' && s.display !== 'none' }
  const box = e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }
  const same = (a, b, t = 0.5) => Math.abs(a.x - b.x) <= t && Math.abs(a.y - b.y) <= t && Math.abs(a.w - b.w) <= t && Math.abs(a.h - b.h) <= t
  const f = n => Math.round(n * 10) / 10
  const say = b => `${f(b.x)},${f(b.y)} ${f(b.w)}×${f(b.h)}`
  // what can hold no child of ours, or would not draw one: the tag goes just after it (an svg part: after its <svg>)
  const host = el => {
    if (el instanceof SVGElement) { let s = el; while (s.parentElement instanceof SVGElement) s = s.parentElement; return { at: s, after: true } }
    return /^(INPUT|IMG|TEXTAREA|SELECT|BR|HR|IFRAME|VIDEO|CANVAS|OBJECT|EMBED|AUDIO|METER|PROGRESS)$/.test(el.tagName) ? { at: el, after: true } : { at: el, after: false }
  }
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
  // every ancestor that can cut the tag off: those its chain of positioning boxes passes through and that hide, clip or
  // scroll what overflows them — then the window itself
  const cutBy = tag => {
    const out = []
    for (let a = blockOf(tag); a && a !== document.documentElement; a = blockOf(a)) {
      const s = getComputedStyle(a)
      const cx = s.overflowX !== 'visible', cy = s.overflowY !== 'visible', cp = s.clipPath !== 'none' || /paint|strict|content/.test(s.contain)
      if (!cx && !cy && !cp) continue
      const r = a.getBoundingClientRect(), bl = parseFloat(s.borderLeftWidth) || 0, bt = parseFloat(s.borderTopWidth) || 0
      out.push({ who: a.tagName.toLowerCase() + (a.id ? '#' + a.id : '') + (typeof a.className === 'string' && a.className.trim() ? '.' + a.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
        cx: cx || cp, cy: cy || cp, l: r.left + bl, t: r.top + bt, r: r.left + bl + a.clientWidth, b: r.top + bt + a.clientHeight })
    }
    out.push({ who: 'the window', cx: true, cy: true, l: 0, t: 0, r: innerWidth, b: innerHeight })
    return out
  }
  const cutOff = tag => {
    const t = tag.getBoundingClientRect()
    for (const c of cutBy(tag)) {
      if ((c.cx && (t.left < c.l - 0.5 || t.right > c.r + 0.5)) || (c.cy && (t.top < c.t - 0.5 || t.bottom > c.b + 0.5))) return c.who
    }
    return ''
  }
  // where the tag stands, as a point to put its top-left on, by the part's box
  const want = (place, pb, tb) => place === 'above' ? { x: pb.x, y: pb.y - tb.h - 3 } : place === 'below' ? { x: pb.x, y: pb.y + pb.h + 3 } : { x: pb.x + 2, y: pb.y + 2 }
  // put the tag's top-left on a point, whatever box positions it — a zoomed box (the phone's grid at 0.8) moves it by
  // less than asked, so the move is measured and corrected once
  const put = (tag, pt) => {
    tag.style.left = '0px'; tag.style.top = '0px'
    const a = box(tag), dx = pt.x - a.x, dy = pt.y - a.y
    tag.style.left = dx + 'px'; tag.style.top = dy + 'px'
    const b = box(tag), kx = dx ? (b.x - a.x) / dx : 1, ky = dy ? (b.y - a.y) / dy : 1
    if (Math.abs(b.x - pt.x) > 0.5 && kx > 0.05) tag.style.left = (dx / kx) + 'px'
    if (Math.abs(b.y - pt.y) > 0.5 && ky > 0.05) tag.style.top = (dy / ky) + 'px'
    const c = box(tag); return Math.abs(c.x - pt.x) <= 1 && Math.abs(c.y - pt.y) <= 1
  }
  const find = (sel, o = {}) => {
    const root = o.within ? [...document.querySelectorAll(o.within)].filter(vis)[0] : document
    if (!root) return { why: `no visible ${o.within} to look inside` }
    const all = [...root.querySelectorAll(sel)].filter(vis), el = all[o.nth || 0]
    return el ? { el } : { why: `no visible match ${o.nth || 0} of ${sel} (${all.length} visible)` }
  }
  // one mark's faults now: gone, its part moved since it was marked, its tag cut off or no longer beside its part
  const faultsOf = m => {
    const out = [], name = `mark ${m.tagText ? '"' + m.tagText + '"' : m.id} on ${m.sel}`
    if (!m.el.isConnected || !m.el.hasAttribute('data-drawmark-ring')) { out.push(`${name}: its part was redrawn and the mark is gone — mark it again just before the picture`); return out }
    if (m.tag && !m.tag.isConnected) { out.push(`${name}: its tag was wiped by a redraw — mark it again just before the picture`); return out }
    const now = box(m.el)
    if (!same(now, m.box)) out.push(`${name}: its part moved or changed size since it was marked (${say(m.box)} → ${say(now)})`)
    if (m.tag) {
      const tb = box(m.tag), w = want(m.place, now, tb)
      if (Math.abs(tb.x - w.x) > 1.5 || Math.abs(tb.y - w.y) > 1.5) out.push(`${name}: its tag drifted off its part (${f(tb.x - w.x)},${f(tb.y - w.y)}px) — a layer that scrolls on its own?`)
      const c = cutOff(m.tag); if (c) out.push(`${name}: its tag is cut off by ${c}`)
    }
    return out
  }

  if (op === 'mark') {
    const { el, why } = find(sel, o)
    if (!el) return { ok: false, faults: [why] }
    const before = box(el)
    const id = String(++S.n)
    el.setAttribute('data-drawmark-ring', id)
    if (o.addClass) el.classList.add(...o.addClass.split(/\s+/).filter(Boolean))
    let tag = null, place = ''
    const undo = () => { el.removeAttribute('data-drawmark-ring'); if (o.addClass) el.classList.remove(...o.addClass.split(/\s+/).filter(Boolean)); if (tag) tag.remove() }   // the helper's own node only
    if (o.tag != null && o.tag !== '') {
      tag = document.createElement('span'); tag.setAttribute('data-drawmark-tag', id); tag.setAttribute('aria-hidden', 'true'); tag.textContent = String(o.tag)
      const h = host(el); if (h.after) h.at.after(tag); else h.at.appendChild(tag)
    }
    const after = box(el)
    if (!same(before, after)) { undo(); const back = box(el); return { ok: false, faults: [`marking ${sel} moved or resized it (${say(before)} → ${say(after)}) — the mark is taken back${same(back, before) ? '' : ' (and the part did not come back: ' + say(back) + ')'}`] } }
    if (tag) {
      const tries = o.place ? [o.place] : ['above', 'inside', 'below']
      const tried = []
      for (const p of tries) {
        const pb = box(el)
        if (!put(tag, want(p, pb, box(tag)))) { tried.push(`${p}: could not be placed there`); continue }
        const c = cutOff(tag)
        if (!c) { place = p; break }
        tried.push(`${p}: cut off by ${c}`)
      }
      if (!place) { undo(); return { ok: false, faults: [`the tag on ${sel} is not wholly visible anywhere it was tried — ${tried.join('; ')}`] } }
      if (!same(before, box(el))) { undo(); return { ok: false, faults: [`placing the tag on ${sel} moved its part — the mark is taken back`] } }
    }
    S.marks.push({ id, sel, el, tag, tagText: tag ? String(o.tag) : '', box: before, place })
    return { ok: true, id, place, box: before }
  }
  if (op === 'hide') {
    const all = [...(o.within ? document.querySelector(o.within) || document : document).querySelectorAll(sel)]
    const pick = o.all ? all : all.filter(vis).slice(o.nth || 0, (o.nth || 0) + 1)
    pick.forEach(e => e.setAttribute('data-drawmark-hidden', ''))
    return { ok: pick.length > 0, count: pick.length, faults: pick.length ? [] : [`nothing visible to hide for ${sel}`] }
  }
  if (op === 'show') {
    const all = [...document.querySelectorAll('[data-drawmark-hidden]')].filter(e => !sel || e.matches(sel))
    all.forEach(e => e.removeAttribute('data-drawmark-hidden'))
    return { ok: true, count: all.length }
  }
  if (op === 'check') return { ok: true, faults: S.marks.flatMap(faultsOf), count: S.marks.length }
  if (op === 'clear') {
    for (const m of S.marks) { if (m.el.isConnected) m.el.removeAttribute('data-drawmark-ring'); if (m.tag) m.tag.remove() }
    document.querySelectorAll('[data-drawmark-tag]').forEach(t => t.remove())
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
    // ring the n-th visible match of `sel` (inside `within`), with a tag when `tag` is given; `place` pins the tag
    // ('above' | 'inside' | 'below'), else the first of those it fits; `addClass` adds the caller's own look class,
    // which the box check holds to the same rule
    mark: (sel, opts = {}) => run('mark', sel, opts),
    // take a part the app drew out of the picture — hidden, never removed (822); `{ all: true }` for every match
    hide: (sel, opts = {}) => run('hide', sel, opts),
    show: (sel) => run('show', sel),
    // every mark's faults now, without a picture
    check: () => page.evaluate(IN_PAGE, { op: 'check', sel: '', o: {}, colour }),
    // the picture, only once every mark is checked again — a fault refuses it
    shot: async (shotOpts = {}) => {
      const r = await page.evaluate(IN_PAGE, { op: 'check', sel: '', o: {}, colour })
      if (r.faults.length) { for (const f of r.faults) logger.log(`[drawmark] picture refused: ${f}`); throw new Error(`drawmark: picture refused — ${r.faults.join(' | ')}`) }
      return page.screenshot(shotOpts)
    },
    // take away the helper's own tags and rings (between options — the method's "clear injected nodes" trap)
    clear: () => run('clear', ''),
  }
}
