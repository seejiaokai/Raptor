// Chat 208 — question 23, item 6: the five smaller kinds (CCL, FCL, PL, EL, CL) for a man whose balance in them was never
// typed. Drawn on the real app (laid over the live page, nothing saved by the drawing). Pelican: added on Admin → Users as
// posted in today, his LVE typed (24) on the Balances page, the five small kinds never typed, one pending CCL on Tue 1 Dec
// (an admin's, Auto-approve off). TODAY: his person window's small tiles (the empty dashed amber box; the pending CCL's
// "War bal –"), and his Balances row — an admin's boxes, and Ranger's read-only view of it (the amber "–"). PROPOSED: the
// words "Not typed" in amber where they fit, measured, the amber "–" where they do not. His iPhone's width (402) and a
// desktop (1536), both at 2x. Same shape as lw-postin-q23-draw.mjs (items 1–5).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-11-27-lw-postin-q23'
process.env.LW_TODAY ||= '2026-11-26'
process.env.PORT ||= '4757'
const L = await import('./lw-m4-lib.mjs')
const { T, getBrowser } = L
import path from 'node:path'
console.log('[lw-postin-q23-6-draw v2]')
const AMBER = '#F2C879'
const MARK = '#ff4fd8'
const SMALL = ['CCL', 'FCL', 'PL', 'EL', 'CL']
const log = (...a) => console.log(...a)

async function ctxFor(size, state) {
  const b = await getBrowser()
  const phone = size === 'phone'
  const ctx = await b.newContext({ viewport: phone ? { width: 402, height: 874 } : { width: 1536, height: 860 }, deviceScaleFactor: 2, hasTouch: phone, storageState: state })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(`${size} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${size} console: ` + m.text().slice(0, 200)) })
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

/* the mark: outlines on the elements (they take no room) and ONE numbered tag, "6", left of the first */
async function mark(P, sels, o = {}) {
  await P.evaluate(({ sels, MARK, dx, top }) => {
    document.querySelectorAll('.q23-tag').forEach(t => t.remove())
    let first = null
    for (const sel of sels) {
      const e = [...document.querySelectorAll(sel)].filter(x => x.getBoundingClientRect().width > 0).pop()
      if (!e) throw new Error('mark: nothing visible for ' + sel)
      e.style.outline = `2px solid ${MARK}`; e.style.outlineOffset = '1px'; e.dataset.q23m = '1'
      first ||= e
    }
    const r = first.getBoundingClientRect()
    const t = document.createElement('div'); t.className = 'q23-tag'; t.textContent = '6'
    t.style.cssText = `position:fixed;z-index:99999;left:${top ? r.left - 4 : Math.max(2, r.left - dx)}px;top:${top ? r.top - 23 : r.top + r.height / 2 - 10}px;width:20px;height:20px;border-radius:10px;background:${MARK};color:#000;font:700 12px/20px system-ui;text-align:center;pointer-events:none`
    document.body.appendChild(t)
  }, { sels, MARK, dx: o.dx ?? 26, top: !!o.top })
}
const unmark = P => P.evaluate(() => { document.querySelectorAll('.q23-tag').forEach(t => t.remove()); document.querySelectorAll('[data-q23m]').forEach(e => { e.style.outline = ''; e.style.outlineOffset = ''; delete e.dataset.q23m }) })
async function clip(w, name, box) {
  const P = w.page, vw = P.viewportSize().width, vh = P.viewportSize().height
  let { x, y, W, H } = box
  x = Math.max(0, x); y = Math.max(0, y); W = Math.min(W, vw - x); H = Math.min(H, vh - y)
  await P.screenshot({ path: path.join(L.OUT, `${w.size}-${name}.png`), clip: { x, y, width: W, height: H }, scale: 'device' })
  log('pic', `${w.size}-${name}.png`, Math.round(W), 'x', Math.round(H))
}
const rectOf = (P, sel) => P.evaluate(sel => { const e = [...document.querySelectorAll(sel)].filter(x => x.getBoundingClientRect().width > 0).pop(); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, r: b.right, b: b.bottom } }, sel)

/* ---- the person window's tiles: today, then the words laid where they fit ---- */
async function personWindow(w, pid) {
  const P = w.page
  await click(w, T('lw-tab-balances')); await P.waitForSelector(T('balances-page'), { state: 'visible' }); await P.waitForTimeout(500)
  await click(w, T(`bal-name-${pid}`)); await P.waitForSelector(T('person-window'), { state: 'visible' }); await P.waitForTimeout(700)
  await neutral(P)
  const today = await P.evaluate(ks => ({
    lveWar: document.querySelector('[data-testid="pw-LVE-war"]')?.textContent,
    tiles: ks.map(k => { const t = document.querySelector(`[data-testid="pw-tile-${k}"]`); const box = t.querySelector(`[data-testid="pw-${k}"]`); return { k, text: t.innerText.replace(/\s+/g, ' '), box: box?.tagName, value: box?.value ?? box?.textContent, dashed: box ? getComputedStyle(box).borderStyle : null, w: Math.round(t.getBoundingClientRect().width) } }),
  }), SMALL)
  log(w.size, 'person window today:', JSON.stringify(today))
  if (today.lveWar.trim() !== '24') throw new Error('LVE War bal is not 24: ' + today.lveWar)
  if (!today.tiles[0].text.includes('Pending')) throw new Error('CCL shows no pending')
  const grid = '[data-testid="person-window"] .zz-balgrid'
  const g = await rectOf(P, grid), hd = await rectOf(P, '[data-testid="person-window"] .zz-balhd')
  const box = { x: g.x - 34, y: hd.y - 8, W: g.w + 34 + 12, H: g.b - hd.y + 16 }
  const sels = SMALL.map(k => T(`pw-tile-${k}`))
  await mark(P, sels); await clip(w, 'small-today', box); await unmark(P)
  /* PROPOSED: a tile never typed reads "Not typed" in amber under its box (the tile's third line, empty while nothing is
     pending — its height already kept, so nothing moves); while something is pending that line holds "Pending", and
     "War bal" reads "Not typed" if the words fit the tile, else the amber "–" stays (hover "Not typed") — measured */
  const how = await P.evaluate(({ ks, AMBER }) => {
    const out = {}
    for (const k of ks) {
      const t = document.querySelector(`[data-testid="pw-tile-${k}"]`)
      const cs = getComputedStyle(t), inner = t.getBoundingClientRect().right - parseFloat(cs.paddingRight)
      const lb = t.querySelector('.ln.b')
      if (lb) {
        const b = lb.querySelector('b'); const was = b.textContent
        b.textContent = 'Not typed'
        const fits = lb.scrollWidth <= lb.clientWidth + 0.5 && lb.getBoundingClientRect().right <= inner + 0.5
        out[k] = { pending: true, warWordsFit: fits, need: lb.scrollWidth, room: lb.clientWidth }
        if (!fits) b.textContent = was
      } else {
        const s = document.createElement('span'); s.className = 'ln a'; s.dataset.q23 = '1'
        /* the tile's word style (600 10px, as "Pending"), amber — bold 11px left 1px spare at 402 on the PC (run v1), and
           his iPhone's letters are wider */
        s.innerHTML = `<span style="color:${AMBER}">Not typed</span>`
        t.appendChild(s)
        const r = s.getBoundingClientRect()
        const fits = s.scrollWidth <= s.clientWidth + 0.5 && s.firstChild.getBoundingClientRect().right <= inner + 0.5
        out[k] = { pending: false, wordsFit: fits, need: Math.round(s.firstChild.getBoundingClientRect().width), room: Math.round(inner - r.left) }
        if (!fits) s.remove()
      }
    }
    return out
  }, { ks: SMALL, AMBER })
  log(w.size, 'person window proposal:', JSON.stringify(how))
  await neutral(P)
  await mark(P, sels); await clip(w, 'small-proposed', box); await unmark(P)
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  if (await L.vis(P, T('person-window'))) { await click(w, T('pw-close')) }
  return how
}

/* ---- his Balances row: the five small columns, as built, and whether the words would fit ---- */
async function balancesRow(w, pid, who) {
  const P = w.page
  await click(w, T('lw-tab-balances')); await P.waitForSelector(T('balances-page'), { state: 'visible' }); await P.waitForTimeout(500)
  /* his row just under the column headings; on a phone the figures slid to their right end, where the small kinds stand */
  await P.evaluate(({ pid, phone }) => {
    const sc = document.querySelector('[data-testid="bal-scroll"]'), row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
    const hd = document.querySelector(phone ? '[data-testid="balances-page"] .bp-cols' : '[data-testid="balances-page"] thead')
    row.scrollIntoView({ block: 'center' })
    if (sc && hd) sc.scrollTop += row.getBoundingClientRect().top - hd.getBoundingClientRect().bottom - 36
    /* (run v1 slid to the far end, and CCL went under the pinned names) — CCL just right of them */
    if (phone && sc) { const who = row.querySelector('.bp-who').getBoundingClientRect(), c0 = row.querySelector('.bp-oc').getBoundingClientRect(); sc.scrollLeft += c0.left - who.right - 2 }
  }, { pid, phone: w.phone })
  await P.waitForTimeout(500); await neutral(P)
  const cells = await P.evaluate(({ pid, ks, phone }) => {
    const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
    const cs = phone ? [...row.querySelectorAll('.bp-oc')] : [...row.children].slice(-6, -1)
    return cs.map((c, i) => {
      const inp = c.querySelector('input'), ro = c.querySelector('.bp-ro'), r = c.getBoundingClientRect()
      const el = inp || ro, f = el ? getComputedStyle(el) : null
      const cv = document.createElement('canvas').getContext('2d'); if (f) cv.font = `${f.fontWeight} ${f.fontSize} ${f.fontFamily}`
      const words = Math.ceil(cv.measureText('Not typed').width)
      const elw = el ? el.getBoundingClientRect().width - parseFloat(f.paddingLeft) - parseFloat(f.paddingRight) : 0
      return { k: ks[i], kind: inp ? 'box' : ro ? 'ro' : '?', shows: inp ? inp.value : ro?.textContent, pend: c.querySelector('.bp-opd')?.textContent || '', cellW: Math.round(r.width), elW: Math.round(elw), wordsW: words, wordsFitCell: words <= r.width - 6, wordsFitBox: words <= elw }
    })
  }, { pid, ks: SMALL, phone: w.phone })
  log(w.size, who, 'balances small columns:', JSON.stringify(cells))
  if (!cells.every(c => c.shows === '' || c.shows === '–')) throw new Error('a small column is not empty / dash: ' + JSON.stringify(cells))
  const row = await rectOf(P, T(`bal-row-${pid}`))
  const hd = await rectOf(P, w.phone ? '[data-testid="balances-page"] .bp-cols' : '[data-testid="balances-page"] thead')
  const sc = await rectOf(P, T('bal-scroll'))
  const cellSels = await P.evaluate(({ pid, phone }) => {
    const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
    const cs = phone ? [...row.querySelectorAll('.bp-oc')] : [...row.children].slice(-6, -1)
    cs.forEach((c, i) => { c.dataset.q23c = String(i) })
    return cs.map((c, i) => `[data-testid="bal-row-${pid}"] [data-q23c="${i}"]`)
  }, { pid, phone: w.phone })
  const c0 = await rectOf(P, cellSels[0]), c4 = await rectOf(P, cellSels[4])
  const box = w.phone ? { x: 0, y: hd.y - 6, W: 402, H: row.b - hd.y + 14 } : { x: row.x - 4, y: hd.y - 26, W: c4.r - row.x + 34, H: row.b - hd.y + 34 }
  /* the tag above the first cell: left of it stands OIL's figure (desktop) or his grade (phone) */
  await mark(P, cellSels, { top: true })
  await clip(w, `small-bal-${who}`, box); await unmark(P)
  return cells
}

const out = {}
try {
  /* ---- stage the world once, on a desktop ---- */
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
  /* his LVE typed, through the box itself: 24 */
  const lve = d.page.locator(T(`bal-LVE-${pid}`)).first()
  await lve.scrollIntoViewIfNeeded(); await lve.click(); await d.page.keyboard.press('Control+A'); await d.page.keyboard.type('24', { delay: 30 }); await d.page.keyboard.press('Enter'); await d.page.waitForTimeout(600)
  log('Pelican', pid, 'LVE Official bal now:', await lve.inputValue(), '· War bal:', await L.txt(d.page, T(`bal-war-${pid}`)))
  /* one pending CCL on Tue 1 Dec, Auto-approve off */
  await click(d, T('lw-tab-grid')); await d.page.waitForTimeout(500)
  await L.reachCell(d, pid, '2026-12-01')
  await click(d, T(L.cellId(pid, '2026-12-01'))); await d.page.waitForSelector(T('bid-picker'), { state: 'visible' })
  await L.approveWhatIEnter(d, false)
  await L.placeLeave(d, 'CCL'); await d.page.waitForTimeout(600)
  const state = await d.ctx.storageState()
  log('staging errors:', d.errs.join(' | ') || 'none')
  await d.ctx.close()

  for (const size of ['desk', 'phone']) {
    const w = await ctxFor(size, state)
    await signInAs(w, 'ad', 'a', T('row-stiff'))
    out[size + 'PW'] = await personWindow(w, pid)
    out[size + 'BalAdmin'] = await balancesRow(w, pid, 'admin')
    log(size, 'errors (admin):', w.errs.join(' | ') || 'none')
    await w.ctx.close()
    const m = await ctxFor(size, state)
    await signInAs(m, 'us', 'us', T('lw-tab-balances'))
    out[size + 'BalMember'] = await balancesRow(m, pid, 'member')
    log(size, 'errors (Ranger):', m.errs.join(' | ') || 'none')
    await m.ctx.close()
  }
  log('RESULT', JSON.stringify(out))
} catch (e) {
  console.log('STOPPED:', e.message)
} finally { await L.closeBrowser() }
