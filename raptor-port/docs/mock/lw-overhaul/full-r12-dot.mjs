// Round 12 (22 Oct 26): the "new" dot in Approvals, explained in five CROPPED pictures (D1222, lesson 32 — a picture
// shows only what the question is about, the change named in plain words on it). Nothing here is built.
// The design drawn: in the Approvals list (desktop, docked right) a small cyan dot — the bell's own unread dot — leads
// each request line that arrived since the admin last opened Approvals; lines he has seen have none; the Approvals
// BUTTON shows only its count, no dot; the dots clear when he closes Approvals; the grid shows no dots.
//   r12-dot-1-button   the desktop top row only: "Approvals 15", no dot
//   r12-dot-2-list     the Approvals window on "All", six lines: three new (dotted), three seen (plain)
//   r12-dot-3-next     the same crop the next time he opens it: no dots, "15 waiting"
//   r12-dot-4-grid     the grid round two of those requests' days: no dots
//   r12-dot-5-member   a member's "My leave" window (phone): two dotted decisions, two plain lines
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r12-dot.mjs      (R12_ONLY=1,4 for a few)
// The r7 scripts draw every scene when imported, so their helpers are READ from their files between named markers
// and run here, unchanged (as full-r9-open.mjs does): the Approvals window from full-r7-decide.mjs, the person window
// from full-r7-person.mjs. The labels are drawn here: pink word tags on a plain backdrop that blanks what the picture
// is not about, so a tag covers nothing (lesson 32).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, oneFold, mk, unmk, UNDER, MGMT } from './full-r7-one.mjs'
import { LOCK_SVG, CLIP_SVG } from './full-propose.mjs'
import { H as WH, fill as WFILL } from './full-win-a-lib.mjs'
const ONLY = (process.env.R12_ONLY || '').split(',').filter(Boolean)
const want = n => !ONLY.length || ONLY.includes(n)
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))

// ---- the r7 scripts' helpers, read from their files between two markers each
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const decideSrc = SRC('full-r7-decide.mjs'), personSrc = SRC('full-r7-person.mjs')
const DC = load(cut(decideSrc, '// ---------------------------------------------------------------- shared pieces', '// ---------------------------------------------------------------- scenes'),
  { oneStage, oneFold, mk, UNDER, q, newPage, signIn, shot, gridTo, browser, state },
  ['stage', 'apDesk', 'approvals', 'readFigs', 'REQ', 'DOT'])
const PR = load(cut(personSrc, 'const CHEV', '// ---------- r7-20'),
  { oneStage, mk, unmk, MGMT, LOCK_SVG, CLIP_SVG, H: WH, fill: WFILL, q, gridTo, shot, newPage, signIn, browser, state },
  ['stage', 'gridAsBuilt', 'openPerson', 'personHTML', 'placePhone', 'ME'])

// ---- the labels: pink word tags (the round's tag style), pink rings and leader lines, and a backdrop in the page's
// own colour that blanks what the picture is not about. Installed once a page; every rect is in viewport px.
const DECO = `window.__d = (() => {
  const PK = '#ff2d95', BG = '#0b0d10'
  const add = (st, html) => { const d = document.createElement('div'); d.className = 'zz-tag'; if (html) d.innerHTML = html; Object.assign(d.style, { position: 'fixed', zIndex: 2147483647, pointerEvents: 'none' }, st); document.body.appendChild(d); return d }
  const R = s => { const e = typeof s === 'string' ? document.querySelector(s) : s; const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height } }
  const tag = (html, o) => {
    const t = add({ background: PK, color: '#fff', font: o.font || '800 13px/1.25 system-ui,sans-serif', padding: '5px 9px', borderRadius: '10px', boxShadow: '0 0 0 2px ' + BG, whiteSpace: 'nowrap', left: '-900px', top: '-900px' }, html)
    const w = t.offsetWidth, h = t.offsetHeight
    const x = o.right != null ? o.right - w : o.cx != null ? o.cx - w / 2 : o.left
    const y = o.bottom != null ? o.bottom - h : o.cy != null ? o.cy - h / 2 : o.top
    Object.assign(t.style, { left: x + 'px', top: y + 'px' }); return R(t)
  }
  const ring = (r, off = 2, round) => add({ left: (r.left - off - 3) + 'px', top: (r.top - off - 3) + 'px', width: (r.width + 2 * off) + 'px', height: (r.height + 2 * off) + 'px', border: '3px solid ' + PK, borderRadius: round ? '50%' : '6px', boxSizing: 'content-box' })
  const vline = (x, y1, y2) => add({ left: (x - 1.5) + 'px', top: Math.min(y1, y2) + 'px', width: '3px', height: Math.abs(y2 - y1) + 'px', background: PK })
  const hline = (y, x1, x2) => add({ left: Math.min(x1, x2) + 'px', top: (y - 1.5) + 'px', width: Math.abs(x2 - x1) + 'px', height: '3px', background: PK })
  // the backdrop: a plain panel in the page's colour, under the thing kept (z) or over everything but the tags
  const back = (r, z = 2147483000) => add({ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', background: BG, zIndex: z })
  const dot = '<i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#3bc6e8;box-shadow:0 0 0 2px #0b0d10;vertical-align:1px;margin-right:6px"></i>'
  return { R, tag, ring, vline, hline, back, dot }
})()`
const deco = p => p.addScriptTag({ content: DECO })
const crop = (p, name, r) => p.evaluate(() => [scrollX, scrollY]).then(([sx, sy]) =>
  shot(p, name, { clip: { x: Math.round(r.left + sx), y: Math.round(r.top + sy), width: Math.round(r.width), height: Math.round(r.height) } }))

// ======================= 1 — the desktop top row: Approvals, its count only =======================
if (want('1')) {
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await DC.stage(p, false, {})
  await deco(p)
  const r = await p.evaluate(() => {
    const d = window.__d, v = d.R('[data-zk="viewlab"]'), a = d.R('[data-zk="appr"]')
    const row = d.R(document.querySelector('[data-zk="appr"]').closest('.zrow'))
    d.ring(a)
    const t = d.tag('Approvals: just the count — no dot here', { left: a.right + 34, cy: a.top + a.height / 2 })
    d.hline(a.top + a.height / 2, a.right + 5, t.left)
    return { left: v.left - 16, top: row.top - 14, width: t.right + 18 - (v.left - 16), height: row.height + 28 }
  })
  await crop(p, 'r12-dot-1-button', r)
  await ctx.close()
}

// ======================= 2, 3 — the Approvals window on "All": six lines, the newest three dotted =======================
let FIGS
if (want('2') || want('3')) {
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await DC.stage(p, false, {}); FIGS = await DC.readFigs(p); await ctx.close()
}
for (const v of ['2', '3']) {
  if (!want(v)) continue
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  if (await p.locator(q('figures-toggle')).count()) { await p.click(q('figures-toggle')); await p.waitForTimeout(400) }
  await gridTo(p, '2026-01-19', 'bane')
  await DC.stage(p, false, {})
  // the window as r7-15 draws it on "All", but its subtitle the short one: "15 waiting · 3 new" (the next time, "15 waiting")
  const html = DC.apDesk(FIGS, {}).replace(/15 waiting · 3 new since you last looked, Wed 7 Jan 16:40/, () => v === '2' ? '15 waiting · 3 new' : '15 waiting')
  console.log('approvals overflow', await DC.approvals(p, html, false))
  await deco(p)
  const r = await p.evaluate(v => {
    const d = window.__d, w = document.querySelector('.zapw'), list = w.querySelector('.list'), hdr = list.querySelector('.zz-cols')
    // the next time (3): nothing is new — the lines' dots gone, and the "New" choice has nothing in it (the agent's reading)
    if (v === '3') {
      w.querySelectorAll('.list .r .nd .zd').forEach(n => n.remove())
      const nc = w.querySelector('.zz-new3'); nc.innerHTML = 'New 0'; nc.classList.add('dim')
    }
    // the list scrolled to its foot (oldest first, so the newest three are the last): six whole lines under the headings
    Object.assign(hdr.style, { position: 'sticky', top: '0', background: '#161b22', zIndex: 2, marginTop: '0' })
    const lines = [...list.querySelectorAll('.r:not(.h)')]
    const lh = lines[0].getBoundingClientRect().height
    const hd = w.querySelector('.hd').getBoundingClientRect().height, fl = w.querySelector('.fl').getBoundingClientRect().height
    Object.assign(w.style, { bottom: 'auto', height: Math.ceil(hd + fl + hdr.getBoundingClientRect().height + 6 * lh + 2) + 'px' })
    list.scrollTop = list.scrollHeight
    const W = d.R(w)
    const shown = lines.slice(-6).map(l => d.R(l.querySelector('.nd')))
    const old = shown.slice(0, 3), nu = shown.slice(3)
    // blank everything round the window: the crop keeps a band on the left and one above, for the words
    const C = { left: W.left - 360, top: W.top - 58, right: W.right + 10, bottom: W.bottom + 12 }
    d.back({ left: C.left, top: C.top, width: C.right - C.left, height: C.bottom - C.top }, 84)
    const bx = W.left - 12 // the brackets stand just left of the window's edge
    const bracket = (rs, html) => {
      const cy = rs.map(r => r.top + r.height / 2)
      d.vline(bx, cy[0] - 1.5, cy[cy.length - 1] + 1.5)
      cy.forEach((y, i) => { d.hline(y, bx, rs[i].left - (v === '2' && rs === nu ? 7 : 2)) })
      const mid = (cy[0] + cy[cy.length - 1]) / 2
      const t = d.tag(html, { right: bx - 16, cy: mid })
      d.hline(mid, t.right, bx)
    }
    if (v === '2') {
      nu.forEach(r => d.ring({ left: r.left, top: r.top + r.height / 2 - 4.5, width: 9, height: 9 }, 2, true))
      bracket(nu, d.dot + 'new since you last opened<br>Approvals (Wed 7 Jan, 16:40)')
      bracket(old, 'no dot: you\'ve seen it before')
      const s = d.R('.zz-sub'); d.ring(s, 2)
      const t = d.tag('15 waiting · 3 new', { cx: s.left + s.width / 2, bottom: W.top - 14 })
      d.vline(s.left + s.width / 2, t.bottom, s.top - 5)
    } else {
      bracket(nu, 'after he closes Approvals,<br>the 3 are no longer new')
    }
    return { left: C.left, top: C.top, width: C.right - C.left, height: C.bottom - C.top }
  }, v)
  await p.mouse.move(2, 2)
  await crop(p, v === '2' ? 'r12-dot-2-list' : 'r12-dot-3-next', r)
  await ctx.close()
}

// ======================= 4 — the grid round two of those requests' days: no dots =======================
if (want('4')) {
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  if (await p.locator(q('figures-toggle')).count()) { await p.click(q('figures-toggle')); await p.waitForTimeout(400) }
  await gridTo(p, '2026-01-19', 'bane')
  await DC.stage(p, false, {})
  await deco(p)
  const r = await p.evaluate(() => {
    const d = window.__d
    const c = id => d.R(`[data-testid="cell-${id}"]`)
    const reaper = c('dice-2026-01-27'), ranger = c('bane-2026-01-29'), last = c('bane-2026-01-29')
    const outer = d.R('#page-leavewar .mx-outer')
    // the day headings' row: the smallest box on the page that reads "MON 19" over the 19 Jan column
    const x19 = c('bane-2026-01-19')
    const head = [...document.querySelectorAll('#page-leavewar *')]
      .filter(e => /^\s*MON\s*19\s*$/i.test(e.textContent))
      .map(e => d.R(e)).filter(h => h.width > 10 && h.width < 80 && Math.abs((h.left + h.right) / 2 - (x19.left + x19.right) / 2) < 12)
    // the crop's foot: the row under Ranger's (Saber's), so his row is not cut at the edge
    const sEl = [...document.querySelectorAll('[data-testid^="person-"]')].find(e => /^\s*Saber/.test(e.textContent))
    const saber = sEl ? d.R(sEl.closest('tr') || sEl) : null
    const top = head.length ? Math.min(...head.map(h => h.top)) : x19.top - 120
    const bottom = Math.max(ranger.bottom, saber && saber.height ? saber.bottom : 0) + 1
    const band = { left: last.right + 1, top: top - 1, width: 400, height: bottom - top + 1 }
    d.back(band)
    d.ring(reaper, 1); d.ring(ranger, 1)
    const vx = band.left + 14
    const ry = reaper.top + reaper.height / 2, gy = ranger.top + ranger.height / 2
    d.vline(vx, ry - 1.5, gy + 1.5)
    d.hline(ry, reaper.right + 4, vx); d.hline(gy, ranger.right + 4, vx)
    const mid = (ry + gy) / 2
    const t = d.tag('the grid shows no dots — it stays clean;<br>‘Show on grid’ in Approvals takes him to a request', { left: vx + 14, cy: mid })
    d.hline(mid, vx, t.left)
    return { left: outer.left, top: top - 1, width: t.right + 14 - outer.left, height: bottom - top + 1, head: head.length, saber: !!(saber && saber.height) }
  })
  console.log('grid crop', JSON.stringify(r))
  await p.mouse.move(2, 2)
  await crop(p, 'r12-dot-4-grid', r)
  await ctx.close()
}

// ======================= 5 — a member's "My leave" window on his phone: two dotted decisions, two plain lines =======================
if (want('5')) {
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
  await PR.stage(p, true, PR.ME.member); await PR.gridAsBuilt(p)
  await PR.openPerson(p, true, 'bane', PR.personHTML('bane', { edit: true, visit: true }))
  // r7-20's window, its invented deleted line left out: approved (new), two pending, refused (new)
  await p.evaluate(() => {
    document.querySelector('[data-zk="del"]')?.remove()
    const n = document.querySelector('.zz-new3'); if (n) n.innerHTML = n.innerHTML.replace('3 new', '2 new')
    // a request not yet decided is "pending" on the Leave War (D1217, ruled after r7-20 was drawn)
    document.querySelectorAll('.r7-ln .s.wait').forEach(s => { s.textContent = 'Pending' })
  })
  await PR.placePhone(p, 150)
  await deco(p)
  const r = await p.evaluate(() => {
    const d = window.__d, sh = [...document.querySelectorAll('.bidsheet')].filter(e => e.getBoundingClientRect().width).pop()
    const S = d.R(sh), yr = d.R('.zz-yr')
    const z = parseInt(getComputedStyle(sh).zIndex) || 50
    const C = { left: 0, top: yr.top - 5, right: innerWidth, bottom: S.bottom + 92 }
    d.back({ left: 0, top: 0, width: innerWidth, height: innerHeight }, z - 1)
    const dots = [...sh.querySelectorAll('.r7-ln > .zd:not(.off)')].map(e => d.R(e))
    const bx = 6
    dots.forEach(r => { d.ring(r, 2, true); d.hline(r.top + r.height / 2, bx, r.left - 5) })
    const ys = dots.map(r => r.top + r.height / 2)
    const t = d.tag('a member: dots on decisions about<br>his own leave since he last looked', { left: 16, top: S.bottom + 18 })
    const ty = t.top + t.height / 2
    d.vline(bx, ys[0] - 1.5, ty + 1.5); d.hline(ty, bx, t.left)
    return { left: C.left, top: C.top, width: C.right - C.left, height: Math.min(innerHeight, C.bottom) - C.top, n: dots.length }
  })
  console.log('member crop', JSON.stringify(r))
  await crop(p, 'r12-dot-5-member', r)
  await ctx.close()
}

await browser.close(); console.log('errors:', errs)
