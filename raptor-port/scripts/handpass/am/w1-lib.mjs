/* w1 — shared helpers for walker w1's scripts (marks, counts and publish buttons on a published day).
   Builds on am-lib.mjs. READS the app (and records toasts) — never writes through window.
   Every script prints one line per check: PASS / FAIL / NOTE, so re-running it after the host's
   fixes IS the re-walk (bug-check order §5). */
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
export * from './am-lib.mjs'
import { head, SHOTS } from './am-lib.mjs'

export const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-09-24-amendment-week.json'
export const WIDTHS = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } }
export const widthArg = () => (process.argv[2] && WIDTHS[process.argv[2]]) ? [process.argv[2]] : ['desktop', 'phone']

/** A per-run tally. check(id, ok, what, detail) prints PASS/FAIL; note() prints an observation. */
export function checker(tag) {
  const rows = []
  const out = (s) => console.log(`[${tag}] ${s}`.slice(0, 1400))
  return {
    rows,
    check(id, ok, what, detail = '') { rows.push({ id, ok: !!ok, what, detail }); out(`${ok ? 'PASS' : 'FAIL'} ${id} — ${what}${detail ? ' | ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`) },
    note(id, what, detail = '') { rows.push({ id, ok: null, what, detail }); out(`NOTE ${id} — ${what}${detail ? ' | ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`) },
    log(k, v) { out(`${String(k).padEnd(20)} ${typeof v === 'string' ? v : JSON.stringify(v)}`) },
    summary() { const f = rows.filter(r => r.ok === false); out(`SUMMARY ${rows.filter(r => r.ok).length} pass · ${f.length} fail · ${rows.filter(r => r.ok === null).length} notes${f.length ? ' · FAILS: ' + f.map(r => r.id).join(', ') : ''}`); return f.length },
  }
}

/** Record every toast the app raises from now on (the toast is one element that fades, never
    removed, so reading it once can return an OLD message). */
export async function toastSpy(page) {
  await page.evaluate(() => {
    if (window.__w1t) return
    window.__w1t = []
    /* each message arrives as a NEW text node inside #toastEl (textContent = msg); reading the added node's
       own text keeps a message that a second toast replaced in the same instant (a person never sees it,
       but it was raised — the report says so) */
    new MutationObserver(ms => { for (const m of ms) {
      if (m.target && m.target.id === 'toastEl') for (const n of m.addedNodes || []) if (n.nodeType === 3) window.__w1t.push(n.data)
    } }).observe(document.body, { childList: true, subtree: true })
  })
}
/** The toasts raised since the last call (and forget them). */
export async function toasts(page) {
  /* one message can be recorded twice (its text node is swapped, then its data set) — drop repeats
     that follow each other, keep a real second showing of the same message only if something else came between */
  return page.evaluate(() => { const a = window.__w1t || []; window.__w1t = []; return a.filter(Boolean).filter((t, i, x) => i === 0 || t !== x[i - 1]) })
}

/** The ⓘ day panel of day di, opened through its own button on the current surface (edit week,
    board or view page), read, and closed through its own Close. */
export async function dayInfo(page, di, where = 'auto') {
  const onBoard = where === 'board' || (where === 'auto' && await page.locator('#schedBoard:visible').count())
  const sel = onBoard ? `#schedBoard .dinfobtn[data-dayinfo="${di}"]:visible`
    : (await page.locator(`#eWeek:visible`).count()) ? `#eWeek .day[data-day="${di}"] .dinfobtn[data-dayinfo="${di}"]:visible`
    : `#vWeek .day[data-day="${di}"] [data-dayinfo="${di}"]:visible`
  const b = page.locator(sel).first()
  if (!(await b.count())) return { error: 'no ⓘ button: ' + sel }
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await b.click()
  await page.waitForTimeout(500)
  const r = await page.evaluate(() => {
    const p = document.querySelector('#dayPop:not([hidden])')
    if (!p) return { error: 'panel did not open' }
    return {
      stat: (p.querySelector('.dip-stat') || {}).innerText?.replace(/\s+/g, ' ').trim() || '',
      pend: (p.querySelector('.dip-pend') || {}).innerText || '',
      als: [...p.querySelectorAll('.dip-al')].map(e => e.innerText.replace(/\s+/g, ' ').trim() + ' [alc=' + e.getAttribute('data-alc') + ']'),
      none: (p.querySelector('.dip-none') || {}).innerText || '',
    }
  })
  return r
}
export async function closeDayInfo(page) {
  const c = page.locator('#dayPopClose:visible').first()
  if (await c.count()) { await c.click(); await page.waitForTimeout(300) }
}

/** The Amendments panel as a person reads it: the summary line, the Discard button's state, one row
    per publishable day with its button, and the issued-AL tags. */
export async function panel(page) {
  return page.evaluate(() => {
    const p = document.querySelector('#alPanel')
    if (!p) return { present: false }
    const vis = !!(p.offsetWidth || p.offsetHeight)
    const drop = p.querySelector('#alDrop')
    return {
      present: true, visible: vis,
      pend: (p.querySelector('.al-pend') || {}).innerText || '',
      discard: drop ? { disabled: drop.disabled } : null,
      days: [...p.querySelectorAll('.al-pubday')].map(r => ({ text: r.querySelector('.al-pd-lbl')?.innerText.replace(/\s+/g, ' ').trim(),
        btn: r.querySelector('button')?.innerText.trim(), disabled: !!r.querySelector('button')?.disabled })),
      tags: [...p.querySelectorAll('.al-tag')].map(t => t.innerText.replace(/\s+/g, ' ').trim()),
    }
  })
}

/** One line for the evidence table: the head as the person sees it. */
export async function headLine(page, di) {
  const h = await head(page, di)
  if (!h) return 'NO DAY'
  const b = x => x ? `${x.text}${x.disabled ? '(locked)' : ''}` : '-'
  const n = s => String(s || '').replace(/\s+/g, ' ').trim()
  return `tag=${h.tag}${h.tagAlc ? '/alc' + h.tagAlc : ''} pend="${n(h.pending)}" nys=${h.nys} beak=${b(h.beak)} alpub=${b(h.alpub)} unpub=${b(h.unpub)} sign="${n(h.signState)}" names=${h.signs.join('|')}`
}

/** Every amendment mark inside a container, reduced to what the person sees: which cells are dotted
    (pending, with the AL colour they preview) and which are solid (issued, with their AL). */
export async function markSummary(page, sel) {
  return page.evaluate(s => {
    const c = document.querySelector(s)
    if (!c) return null
    const vis = e => !!(e.offsetWidth || e.offsetHeight)
    const name = e => e.getAttribute('data-txt') || e.getAttribute('data-bfld') || e.getAttribute('data-slot') || e.getAttribute('data-key') || e.className.split(' ')[0]
    const val = e => (e.value != null && e.tagName !== 'DIV' && e.tagName !== 'SPAN' ? e.value : e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 24)
    return {
      dotted: [...c.querySelectorAll('[data-alp]')].filter(vis).map(e => `${name(e)}="${val(e)}"@AL${e.getAttribute('data-aln')}`),
      solid: [...c.querySelectorAll('[data-alc]')].filter(vis).filter(e => !e.classList.contains('verchip') && !e.classList.contains('al-tag') && !e.classList.contains('dip-al'))
        .map(e => `${name(e)}="${val(e)}"@AL${e.getAttribute('data-alc')}`),
    }
  }, sel)
}

/** The computed colour a mark or tag is painted in (its --alc), for the colour checks. */
export async function alcOf(page, sel) {
  return page.evaluate(s => { const e = document.querySelector(s); if (!e) return null
    const cs = getComputedStyle(e); return { alc: cs.getPropertyValue('--alc').trim(), bg: cs.backgroundColor, color: cs.color, outline: cs.outlineColor } }, sel)
}

/** The value of a time/text box on the edit week (a data-txt cell) or on the board (a data-bfld input). */
export async function cellValue(page, key) {
  return page.evaluate(k => {
    const vis = e => !!(e.offsetWidth || e.offsetHeight)
    const e = [...document.querySelectorAll(`#schedBoard [data-bfld="${k}"], #eWeek [data-txt="${k}"]`)].find(vis)
    if (!e) return null
    return (e.value != null && e.tagName === 'INPUT') ? e.value : e.innerText.trim()
  }, key)
}

/** Type into a board box (data-bfld) and commit it by blur — the board twin of am-lib's editText. */
export async function boardType(page, key, value) {
  const el = page.locator(`#schedBoard [data-bfld="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await el.click()
  await el.fill('')
  await el.type(String(value), { delay: 10 })
  await el.evaluate(e => e.blur())
  await page.waitForTimeout(600)
}

/** A picture of the part of the screen that matters: the visible element matching `sel`, widened to
    its closest `anc` ancestor (e.g. '.go' for a wave, '.day-head' for the head), scrolled into view the
    way a person scrolls, cropped to the window. Returns the file path, or null if not found. */
export async function shotBox(page, name, sel, anc = null, { block = 'center', pad = 6 } = {}) {
  const r = await page.evaluate(([s, a, blk]) => {
    const vis = e => !!(e.offsetWidth || e.offsetHeight)
    const e = [...document.querySelectorAll(s)].find(vis); if (!e) return null
    const t = a ? (e.closest(a) || e) : e
    t.scrollIntoView({ block: blk, inline: 'nearest' })
    const b = t.getBoundingClientRect()
    return { x: b.x, y: b.y, w: b.width, h: b.height, vw: window.innerWidth, vh: window.innerHeight }
  }, [sel, anc, block])
  if (!r) return null
  await page.waitForTimeout(250)
  const x = Math.max(0, r.x - pad), y = Math.max(0, r.y - pad)
  const clip = { x, y, width: Math.max(10, Math.min(r.vw - x, r.w + 2 * pad)), height: Math.max(10, Math.min(r.vh - y, r.h + 2 * pad)) }
  const file = `${SHOTS}/${name}.png`
  await page.screenshot({ path: file, clip })
  return file
}

/** A picture framing SEVERAL visible elements together (e.g. a day head and its sign strip). */
export async function shotUnion(page, name, sels, { pad = 6 } = {}) {
  const r = await page.evaluate((ss) => {
    const vis = e => !!(e.offsetWidth || e.offsetHeight)
    const els = ss.map(s => [...document.querySelectorAll(s)].find(vis)).filter(Boolean)
    if (!els.length) return null
    els[0].scrollIntoView({ block: 'center', inline: 'nearest' })
    const bs = els.map(e => e.getBoundingClientRect())
    const x0 = Math.min(...bs.map(b => b.left)), y0 = Math.min(...bs.map(b => b.top))
    const x1 = Math.max(...bs.map(b => b.right)), y1 = Math.max(...bs.map(b => b.bottom))
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, vw: window.innerWidth, vh: window.innerHeight }
  }, sels)
  if (!r) return null
  await page.waitForTimeout(250)
  const x = Math.max(0, r.x - pad), y = Math.max(0, r.y - pad)
  const clip = { x, y, width: Math.max(10, Math.min(r.vw - x, r.w + 2 * pad)), height: Math.max(10, Math.min(r.vh - y, r.h + 2 * pad)) }
  const file = `${SHOTS}/${name}.png`
  await page.screenshot({ path: file, clip })
  return file
}
/** Collapse every kind of space (the pending chip uses a no-break space) so text compares plainly. */
export const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim()
/** A day's head, with its texts normalised. */
export async function headN(page, di) {
  const h = await head(page, di)
  if (!h) return h
  return { ...h, pending: norm(h.pending), signState: norm(h.signState), selector: norm(h.selector) }
}

/** Drag a grip (a wave's ⠿, a row's ⠿) onto a target element with a real mouse, the way a person
    drags: press on the grip, move in steps, release over the target. */
export async function dragTo(page, gripLoc, targetLoc, { dy = 0 } = {}) {
  /* bring BOTH the grip and the drop point on screen first, the way a person scrolls before dragging:
     centre the midpoint of the two in the scroll box that holds them (the board scrolls its own box,
     the week scrolls the window). A drop point below the window never receives the pointer. */
  const gh = await gripLoc.elementHandle(), th = await targetLoc.elementHandle()
  if (!gh || !th) return 'no grip or target'
  /* the UPPER of the two goes to the top of its scroll box, so the lower one is as reachable as it can be */
  /* …and then 100px BELOW the top of that box: the app auto-scrolls while a held pointer sits in the top or
     bottom 72px of the box (rowdrag.ts EDGE), which would slide the target away mid-drag */
  await page.evaluate(([g, t]) => {
    const up = g.getBoundingClientRect().top <= t.getBoundingClientRect().top ? g : t
    up.scrollIntoView({ block: 'start' })
    let n = g, box = null
    while (n && n !== document.body) { const oy = getComputedStyle(n).overflowY
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 1) { box = n; break } n = n.parentElement }
    const top = box ? box.getBoundingClientRect().top : 0
    const d = up.getBoundingClientRect().top - (top + 100)
    if (box) box.scrollTop += d; else window.scrollBy(0, d)
  }, [gh, th])
  await page.waitForTimeout(250)
  /* a sticky bar may now cover the top of the box: nudge the content down until the grip is what a
     press at its centre actually lands on (checked with elementFromPoint, the way the browser decides) */
  for (let i = 0; i < 6; i++) {
    const onGrip = await page.evaluate(g => { const r = g.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!e && (e === g || g.contains(e)) }, gh)
    if (onGrip) break
    await page.evaluate(g => { let n = g; while (n && n !== document.body) { const oy = getComputedStyle(n).overflowY
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 1) { n.scrollTop -= 60; return } n = n.parentElement }
      window.scrollBy(0, -60) }, gh)
    await page.waitForTimeout(150)
  }
  const g = await gripLoc.boundingBox(); if (!g) return 'no grip box'
  const t = await targetLoc.boundingBox(); if (!t) return 'no target box'
  const vh = page.viewportSize().height
  const tx = t.x + Math.min(t.width / 2, 40), ty = t.y + Math.min(t.height / 2, 12) + dy
  const want = await targetLoc.evaluate(e => (e.closest('[data-move]') || e.closest('[data-secmove]') || e).dataset.move || '')
  await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2)
  await page.mouse.down()
  await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2 + 6, { steps: 3 })
  if (ty > 4 && ty < vh - 4) {
    await page.mouse.move(tx, ty, { steps: 12 })
  } else {
    /* still below (or above) the window: hold the pointer in the edge band so the app's own
       auto-scroll carries the target under it, as a finger would */
    const ey = ty >= vh - 4 ? vh - 20 : 20
    await page.mouse.move(tx, ey, { steps: 10 })
    for (let i = 0; i < 40; i++) {
      const lit = await page.evaluate(m => [...document.querySelectorAll('.rowdrop')].some(e => e.dataset.move === m), want)
      if (lit) break
      await page.waitForTimeout(100)
      await page.mouse.move(tx, ey + (i % 2 ? 1 : -1))
    }
  }
  await page.waitForTimeout(150)
  const lit = await page.evaluate(m => [...document.querySelectorAll('.rowdrop')].some(e => e.dataset.move === m), want)
  await page.mouse.up()
  await page.waitForTimeout(700)
  return lit ? 'dropped on target' : 'released with the target NOT lit'
}
