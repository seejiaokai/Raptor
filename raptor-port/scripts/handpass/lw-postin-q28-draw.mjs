// Chat 208 — question 28: on the Balances page a balance never typed shows NO words and no "–" (his "not typed seems abit
// excessive. can we do just maybe an amber dashed or amber outline dotted"). Drawn on the real app, laid over the live page,
// nothing saved by the drawing. Pelican: added on Admin → Users as posted in today, every balance never typed, LVE included.
// TODAY: an admin's row (empty dashed boxes, War bal "Not typed") and Ranger's read-only view of it (the amber "–").
// PROPOSED: each read-only figure's place and War bal's place an EMPTY amber outline the size of the box an admin sees in
// that column (measured off Pelican's own row); the empty boxes keep their place. A: the boxes' own dashed edge. B: dotted,
// the empty boxes dotted too (their rule edited in place in the page's stylesheet). Hover / screen-reader name "Not typed".
// His iPhone's width (402, pinched out until every column fits — the page's own pinch) and a desktop (1536), both at 2x.
// Same shape as lw-postin-q23-6-draw.mjs.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-11-27-lw-postin-q28'
process.env.LW_TODAY ||= '2026-11-26'
process.env.PORT ||= '4757'
const L = await import('./lw-m4-lib.mjs')
const { T, getBrowser } = L
import path from 'node:path'
import { writeFileSync } from 'node:fs'
console.log('[lw-postin-q28-draw v1]')
const MARK = '#ff4fd8'
const log = (...a) => console.log(...a)
const OUT = {}

async function ctxFor(size, state) {
  const b = await getBrowser()
  const phone = size === 'phone'
  const ctx = await b.newContext({ viewport: phone ? { width: 402, height: 874 } : { width: 1536, height: 860 }, deviceScaleFactor: 2, hasTouch: phone, storageState: state })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(`${size} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.text().startsWith('q28 ')) console.log(size, m.text()); if (m.type() === 'error') errs.push(`${size} console: ` + m.text().slice(0, 200)) })
  return { ctx, page, errs, size, phone }
}
async function signInAs(w, user, pass, waitSel) {
  const P = w.page
  await P.goto(L.PLAIN); await P.waitForSelector('#luser')
  await P.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), L.LW_TODAY)
  await P.fill('#luser', user); await P.fill('#lpass', pass)
  await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached', timeout: 15000 })
  await P.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), L.LW_TODAY)
  await P.evaluate(() => window.go('leavewar'))
  await P.waitForSelector(waitSel, { state: 'attached', timeout: 15000 }); await P.waitForTimeout(900)
}
const click = async (w, sel) => { await w.page.locator(sel).first().scrollIntoViewIfNeeded(); await w.page.locator(sel).first().click(); await w.page.waitForTimeout(400) }
const neutral = async P => { await P.mouse.move(2, 2); await P.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur()) }

/* the phone: two fingers pinched together over the figures, through the page's own pinch, until every column fits */
async function pinchOut(w) {
  const P = w.page, cdp = await w.ctx.newCDPSession(P)
  const r = await P.evaluate(() => { const b = document.querySelector('[data-testid="bal-scroll"]').getBoundingClientRect(); return { x: b.left + b.width * 0.62, y: b.top + Math.min(260, b.height / 2) } })
  for (let round = 0; round < 3; round++) {
    const pts = d => [{ x: r.x - d, y: r.y, id: 0 }, { x: r.x + d, y: r.y + 4, id: 1 }]
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(140) })
    for (let i = 1; i <= 14; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(140 - i * 9) }); await P.waitForTimeout(16) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await P.waitForTimeout(400)
  }
  const z = await P.evaluate(() => { const b = document.querySelector('[data-testid="balances-page"] .bp-zoom'); return { zoom: b.style.zoom || '1', fits: b.querySelector('.bp-cols').getBoundingClientRect().right <= document.querySelector('[data-testid="bal-scroll"]').getBoundingClientRect().right + 0.5 } })
  log(w.size, 'pinched:', JSON.stringify(z))
  if (z.zoom === '1') throw new Error('the pinch did not zoom the page')
  return z
}

/* his row under the column headings, with one row either side (a group line above counts as no row: one more is taken) */
async function frame(w, pid) {
  const P = w.page
  await P.evaluate(({ pid, phone }) => {
    const sc = document.querySelector('[data-testid="bal-scroll"]'), row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
    const hd = document.querySelector(phone ? '[data-testid="balances-page"] .bp-cols' : '[data-testid="balances-page"] thead tr.h1 th')
    /* his group is near the list's foot, so the list cannot scroll him up to the headings: an empty spacer after the list
       (below the picture, never in it) gives the scroll its room */
    if (!sc.querySelector('.q28-spacer')) { const sp = document.createElement('div'); sp.className = 'q28-spacer'; sp.style.cssText = 'height:900px;pointer-events:none'; sc.appendChild(sp) }
    const all = [...document.querySelectorAll('[data-testid="balances-page"] [data-testid^="bal-row-"]')], at = all.indexOf(row), prev = all[at - 1]
    row.scrollIntoView({ block: 'center' })
    const hdB = phone ? hd : document.querySelector('[data-testid="balances-page"] thead tr.h2 th')
    sc.scrollTop += prev.getBoundingClientRect().top - hdB.getBoundingClientRect().bottom - 3
    if (phone) sc.scrollLeft = 0
    console.log('q28 scroll', sc.scrollHeight, sc.clientHeight, sc.scrollTop, window.scrollY, document.scrollingElement.scrollHeight)
  }, { pid, phone: w.phone })
  await P.waitForTimeout(500); await neutral(P)
  return P.evaluate(({ pid, phone }) => {
    const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
    const hd = document.querySelector(phone ? '[data-testid="balances-page"] .bp-cols' : '[data-testid="balances-page"] thead tr.h1 th')
    const hdB = phone ? hd : document.querySelector('[data-testid="balances-page"] thead tr.h2 th')
    const all = [...document.querySelectorAll('[data-testid="balances-page"] [data-testid^="bal-row-"]')], at = all.indexOf(row), prev = all[at - 1]
    const next = all[at + 1]
    const R = e => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, r: b.right, b: b.bottom, h: b.height } }
    const cl = [...row.children].filter(c => c.querySelector('input,.bp-ro')).pop()
    const head = { ...R(hd), b: hdB.getBoundingClientRect().bottom, x: phone ? R(hd).x : document.querySelector('[data-testid="balances-page"] table').getBoundingClientRect().left }, rr = R(row), pv = R(prev), nx = R(next), last = R(cl)
    return { head, row: rr, prev: pv, next: nx, last, prevName: prev.textContent.trim().slice(0, 30), nextName: next.textContent.trim().slice(0, 30), covered: document.elementFromPoint(rr.x + 40, pv.y + 2)?.closest('thead,.bp-cols') ? 'prev row under headings' : 'ok' }
  }, { pid, phone: w.phone })
}

/* what the change must not move: each row's height and every cell's left and width, the headings' too */
const layout = (P, pid) => P.evaluate(pid => {
  const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
  const all = [...document.querySelectorAll('[data-testid="balances-page"] [data-testid^="bal-row-"]')], at = all.indexOf(row), rows = [all[at - 1], row, all[at + 1]]
  const R = e => { const b = e.getBoundingClientRect(); return [Math.round(b.left * 100) / 100, Math.round(b.width * 100) / 100, Math.round(b.height * 100) / 100] }
  const heads = [...document.querySelectorAll('[data-testid="balances-page"] thead tr.h2 th, [data-testid="balances-page"] .bp-cols > span')]
  return { rows: rows.map(r => [R(r), ...[...r.children].map(R)]), heads: heads.map(R) }
}, pid)
/* the largest change anywhere, and where: rows[r][0] is a row's own box, rows[r][c] its c-th cell; each [left, width, height] */
let lastWhere = []
function diff(a, b) {
  let max = 0; lastWhere = []
  const walk = (x, y, p) => { if (Array.isArray(x)) x.forEach((v, i) => walk(v, y?.[i], p + '/' + i)); else { const d = Math.abs(x - (y ?? 1e9)); if (d > 0.5) lastWhere.push(`${p}: ${x} -> ${y}`); max = Math.max(max, d) } }
  walk([a.rows, a.heads], [b.rows, b.heads], ''); return max
}

/* the boxes an admin sees on Pelican's own row: each column's size, radius and edge — read, never guessed */
const boxSizes = (P, pid) => P.evaluate(pid => {
  const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
  const cols = [...row.children]
  const out = {}
  cols.forEach((c, i) => { const b = c.querySelector('input.bp-bx'); if (b) { const f = getComputedStyle(b); out[i] = { w: b.offsetWidth, h: b.offsetHeight, rad: f.borderTopLeftRadius, edge: f.borderTopColor, style: f.borderTopStyle, nt: b.classList.contains('nt'), val: b.value } } })
  const cf = document.querySelector(`[data-testid="bal-cf-${pid}"]`)
  out.cfCol = cols.findIndex(c => c.contains(cf))
  out.warCol = cols.findIndex(c => c.matches(`[data-testid="bal-war-${pid}"]`) || c.querySelector(`[data-testid="bal-war-${pid}"]`))
  return out
}, pid)

/* the proposal, laid on the live page: A dashed, B dotted (B also edits the boxes' own rule in place) */
async function apply(P, mode, sizes) {
  return P.evaluate(({ mode, sizes }) => {
    const page = document.querySelector('[data-testid="balances-page"]')
    const any = Object.values(sizes).find(s => s && s.edge)
    const style = mode === 'A' ? 'dashed' : 'dotted'
    const edge = `1px ${style} ${any.edge}`
    const done = { ro: 0, war: 0, rule: 0 }
    for (const ro of page.querySelectorAll('.bp-ro.nt')) {
      const row = ro.closest('tr,.bp-row'); const i = [...row.children].findIndex(c => c.contains(ro))
      const s = sizes[i]; if (!s) throw new Error('no admin box measured for column ' + i)
      ro.dataset.q28 = '1'
      Object.assign(ro.style, { color: 'transparent', border: edge, borderRadius: s.rad, width: s.w + 'px', minWidth: s.w + 'px', height: s.h + 'px', boxSizing: 'border-box', background: 'transparent' })
      done.ro++
    }
    const cf = sizes[sizes.cfCol]
    for (const nt of page.querySelectorAll('.bp-nt')) {
      /* War bal's outline takes the carried-fwd box's size (the smaller box; LVE's 54 would not fit the phone's 50-wide
         column) — but never wider than the room inside its column: on a desktop that room is 40 (run v3: at 44 the column
         grew 4px and OIL and the small kinds moved 4px right) */
      const td = nt.parentElement.closest('td')
      let W = cf.w
      if (td) { const f = getComputedStyle(td); W = Math.min(W, Math.floor(td.clientWidth - parseFloat(f.paddingLeft) - parseFloat(f.paddingRight))) }
      done.warW = W
      nt.dataset.q28h = nt.style.display || '-'; nt.style.display = 'none'
      const s = document.createElement('span'); s.className = 'q28-ol'; s.title = 'Not typed'; s.setAttribute('role', 'img'); s.setAttribute('aria-label', 'Not typed')
      Object.assign(s.style, { display: 'inline-block', boxSizing: 'border-box', width: W + 'px', height: cf.h + 'px', border: edge, borderRadius: cf.rad, verticalAlign: 'middle' })
      nt.after(s); done.war++
    }
    if (mode === 'B') {
      const hits = []
      const walk = list => { for (const r of list) { if (r.cssRules && !r.selectorText) walk(r.cssRules); else if (r.selectorText && r.selectorText.includes('.bp-bx.nt:not(:focus)')) hits.push(r) } }
      for (const sh of document.styleSheets) { try { walk(sh.cssRules) } catch { } }
      if (hits.length !== 1) throw new Error('the empty boxes\' rule found ' + hits.length + ' times')
      window.__q28rule = { r: hits[0], was: hits[0].style.getPropertyValue('border-style') || '', wasB: hits[0].style.getPropertyValue('border') }
      hits[0].style.setProperty('border-style', 'dotted'); done.rule = 1
      done.ruleText = hits[0].cssText.slice(0, 160)
    }
    return done
  }, { mode, sizes })
}
const clear = P => P.evaluate(() => {
  document.querySelectorAll('.q28-ol').forEach(e => { e.style.display = 'none'; e.className = 'q28-gone' })
  document.querySelectorAll('[data-q28h]').forEach(e => { e.style.display = e.dataset.q28h === '-' ? '' : e.dataset.q28h; delete e.dataset.q28h })
  document.querySelectorAll('[data-q28]').forEach(e => { for (const p of ['color', 'border', 'borderRadius', 'width', 'minWidth', 'height', 'boxSizing', 'background']) e.style[p] = ''; delete e.dataset.q28 })
  if (window.__q28rule) { const { r, wasB } = window.__q28rule; r.style.removeProperty('border-style'); if (wasB) r.style.setProperty('border', wasB); window.__q28rule = null }
})

/* the row marked: a pink outline on the row itself (inside its edge, so no scroll box clips it) */
/* (run v4: on the phone the pinned name cell, drawn over the row, hid the outline's left part — its three edges are drawn
   on that cell too, as an inset shadow, which takes no room) */
const mark = (P, pid) => P.evaluate(({ pid, MARK }) => {
  const r = document.querySelector(`[data-testid="bal-row-${pid}"]`); r.style.outline = `2px solid ${MARK}`; r.style.outlineOffset = '-2px'
  const who = r.querySelector(':scope > .bp-who'); if (who) who.style.boxShadow = `inset 2px 0 0 ${MARK}, inset 0 2px 0 ${MARK}, inset 0 -2px 0 ${MARK}`
}, { pid, MARK })
const unmark = (P, pid) => P.evaluate(pid => { const r = document.querySelector(`[data-testid="bal-row-${pid}"]`); r.style.outline = ''; r.style.outlineOffset = ''; const who = r.querySelector(':scope > .bp-who'); if (who) who.style.boxShadow = '' }, pid)

/* the picture: the crop, then a gutter on its left holding the tag "28" level with his row (drawn onto the picture —
   the row starts at the screen's edge, so there is no room on the page for a tag) */
let composer = null
async function picture(w, name, f, pid) {
  const P = w.page
  const vw = P.viewportSize().width
  const x = Math.max(0, Math.floor(f.head.x) - (w.phone ? 0 : 6)), y = Math.floor(f.head.y) - 4
  const X1 = w.phone ? vw : Math.min(vw, Math.ceil(f.last.r) + 18), Y1 = Math.ceil(f.next.b) + 4
  const clip = { x, y, width: X1 - x, height: Y1 - y }
  const bg = await P.evaluate(pid => { let e = document.querySelector(`[data-testid="bal-row-${pid}"]`); while (e) { const c = getComputedStyle(e).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c; e = e.parentElement } return '#0b0d10' }, pid)
  await mark(P, pid)
  const buf = await P.screenshot({ clip, scale: 'device' })
  await unmark(P, pid)
  const G = 30, mid = (f.row.y + f.row.b) / 2 - y
  if (!composer) { const b = await getBrowser(); const c = await b.newContext({ deviceScaleFactor: 2, viewport: { width: 1700, height: 900 } }); composer = await c.newPage() }
  await composer.setContent(`<body style="margin:0;background:#000"><div id="c" style="position:relative;width:${clip.width + G}px;height:${clip.height}px;background:${bg}"><img src="data:image/png;base64,${buf.toString('base64')}" style="position:absolute;left:${G}px;top:0;width:${clip.width}px;height:${clip.height}px"><div style="position:absolute;left:${(G - 22) / 2}px;top:${mid - 11}px;width:22px;height:22px;border-radius:11px;background:${MARK};color:#000;font:700 12px/22px system-ui;text-align:center">28</div></div></body>`)
  await composer.waitForTimeout(150)
  await composer.locator('#c').screenshot({ path: path.join(L.OUT, `${w.size}-${name}.png`), scale: 'device' })
  log('pic', `${w.size}-${name}.png`, Math.round(clip.width + G), 'x', Math.round(clip.height), 'css px')
}

/* one role at one size: today, A, B — the premise asserted on screen first */
async function drawRole(w, pid, who, sizes) {
  const P = w.page
  await click(w, T('lw-tab-balances')); await P.waitForSelector(T('balances-page'), { state: 'visible' }); await P.waitForTimeout(600)
  if (w.phone) OUT[w.size + '-zoom'] = await pinchOut(w)
  const premise = await P.evaluate(pid => {
    const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
    return { inputs: row.querySelectorAll('input.bp-bx').length, ntInputs: [...row.querySelectorAll('input.bp-bx.nt')].filter(i => i.value === '').length, roNt: row.querySelectorAll('.bp-ro.nt').length, roNtText: [...row.querySelectorAll('.bp-ro.nt')].map(e => e.textContent + '|' + e.title).join(','), war: row.querySelector(`[data-testid="bal-war-${pid}"]`).textContent.trim() }
  }, pid)
  log(w.size, who, 'premise:', JSON.stringify(premise))
  if (premise.war !== 'Not typed') throw new Error('War bal does not read Not typed')
  if (who === 'admin' && premise.ntInputs !== 7) throw new Error('admin: not seven empty never-typed boxes')
  if (who === 'member' && (premise.inputs !== 0 || premise.roNt !== 7)) throw new Error('member: Pelican\'s row is not read only with seven amber dashes')
  if (who === 'admin') { sizes = await boxSizes(P, pid); log(w.size, 'admin boxes on his row:', JSON.stringify(sizes)) }
  const f = await frame(w, pid)
  log(w.size, who, 'frame:', JSON.stringify({ prev: f.prevName, next: f.nextName, covered: f.covered, rowH: f.row.h, headY: f.head.y, headB: f.head.b, prevY: f.prev.y, nextB: f.next.b }))
  const base = await layout(P, pid)
  await picture(w, `today-${who}`, f, pid)
  const res = { premise, rowH: f.row.h }
  /* he answered "A" before the drawing was done (27 Nov 26): only today and A are drawn; B's rule stays above, unused */
  for (const mode of ['A']) {
    const done = await apply(P, mode, sizes)
    await P.waitForTimeout(200)
    const lay = await layout(P, pid)
    const probe = await P.evaluate(pid => {
      const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
      const ol = row.querySelector('.q28-ol'), ro = row.querySelector('.bp-ro.nt'), bx = row.querySelector('input.bp-bx.nt')
      const S = e => e ? (() => { const f = getComputedStyle(e); return { w: e.offsetWidth, h: e.offsetHeight, edge: f.borderTopStyle + ' ' + f.borderTopColor, color: f.color, name: e.getAttribute('aria-label') || e.getAttribute('title') || '' } })() : null
      return { war: S(ol), ro: S(ro), box: S(bx), warWordsShown: [...row.querySelectorAll('.bp-nt')].some(e => e.offsetWidth > 0) }
    }, pid)
    const moved = diff(base, lay)
    log(w.size, who, mode, 'applied', JSON.stringify(done), 'measured', JSON.stringify(probe), 'moved at most', moved, 'px')
    if (moved > 0.5) log('  !! the outline moved the layout by', moved, '·', lastWhere.slice(0, 12).join(' | '))
    await neutral(P)
    await picture(w, `${mode}-${who}`, f, pid)
    await clear(P)
    const back = diff(base, await layout(P, pid))
    if (back > 0.5) throw new Error('clearing did not restore the layout: ' + back)
    res[mode] = { done, probe, moved }
  }
  res.sizes = sizes
  return res
}

try {
  /* ---- stage the world once, on a desktop: Pelican added on Admin → Users, posted in today, nothing typed ---- */
  const d = await ctxFor('desk')
  await signInAs(d, 'ad', 'a', T('row-stiff'))
  await d.page.evaluate(() => window.go('admin')); await d.page.waitForTimeout(800)
  await d.page.locator('#accAddBlock').scrollIntoViewIfNeeded()
  if (await d.page.locator('#accAddModeNew').count()) await d.page.click('#accAddModeNew')
  await d.page.fill('#accAddCs', 'Pelican'); await d.page.fill('#accAddIni', 'PN')
  await d.page.selectOption('#accAddSeat', 'FCP'); await d.page.selectOption('#accAddCat', 'OCU')
  await d.page.fill('#accAddName', 'pelican@mail')
  await d.page.click('#accAdd'); await d.page.waitForTimeout(900)
  await d.page.evaluate(() => window.go('leavewar')); await d.page.waitForTimeout(900)
  await click(d, T('lw-tab-balances')); await d.page.waitForSelector(T('balances-page'), { state: 'visible' }); await d.page.waitForTimeout(500)
  const pid = await d.page.evaluate(() => { for (const e of document.querySelectorAll('[data-testid^="bal-name-"]')) if (e.textContent.trim().startsWith('Pelican')) return e.dataset.testid.slice(9); return null })
  if (!pid) throw new Error('Pelican not on the Balances page')
  log('Pelican', pid, 'staged; errors:', d.errs.join(' | ') || 'none')
  const state = await d.ctx.storageState()
  await d.ctx.close()

  for (const size of ['desk', 'phone']) {
    const w = await ctxFor(size, state)
    await signInAs(w, 'ad', 'a', T('row-stiff'))
    const a = await drawRole(w, pid, 'admin')
    OUT[size + '-admin'] = a
    log(size, 'errors (admin):', w.errs.join(' | ') || 'none')
    await w.ctx.close()
    const m = await ctxFor(size, state)
    await signInAs(m, 'us', 'us', T('lw-tab-balances'))
    OUT[size + '-member'] = await drawRole(m, pid, 'member', a.sizes)
    log(size, 'errors (Ranger):', m.errs.join(' | ') || 'none')
    await m.ctx.close()
  }
  writeFileSync(path.join(L.OUT, 'q28-measures.json'), JSON.stringify(OUT, null, 1))
  log('RESULT written')
} catch (e) {
  console.log('STOPPED:', e.stack || e.message)
} finally { await L.closeBrowser() }
