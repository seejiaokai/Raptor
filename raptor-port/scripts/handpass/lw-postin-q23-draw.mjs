// Chat 208 — question 23: "Not typed" in four more places, and one new sentence. Drawn on the real app (laid over the
// live page, nothing saved by the drawing). Pelican: a man added on Admin → Users as posted in today, with a sign-in, his
// balance never typed — the demo's own never-typed men (Piston, Forge, Ledger, Ghost, Talisman, Cotter) have no sign-in,
// and My leave is only drawn for the man signed in. One pending LL bid on Tue 1 Dec (an admin's, Auto-approve off) so the
// places read −1 today. Each place pictured TODAY, then PROPOSED (the amber look already built on the Balances page:
// "Not typed" where the words fit, the amber "–" where they do not), at his iPhone's width (402) and a desktop (1536),
// both at 2x. Then the built red tag "Type the Official bal first" (no "before").
process.env.LW_OUT ||= '../../docs/img/handpass/2026-11-27-lw-postin-q23'
process.env.LW_TODAY ||= '2026-11-26'
process.env.PORT ||= '4757'
const L = await import('./lw-m4-lib.mjs')
const { T, getBrowser } = L
import path from 'node:path'
console.log('[lw-postin-q23-draw v2]')
L.clearOut()
const AMBER = '#F2C879'
const MARK = '#ff4fd8'
const log = (...a) => console.log(...a)

async function ctxFor(size, state) {
  const b = await getBrowser()
  const phone = size === 'phone'
  /* the phone without isMobile, so typing into a box never zooms the page (mockups-on-the-real-app.md Traps) */
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

/* the mark: an outline on the element (takes no room) and a numbered tag fixed on the page beside it, placed from the
   element's box just before the picture — the screen is still */
async function mark(P, sel, n, o = {}) {
  await P.evaluate(({ sel, n, MARK, side, off }) => {
    document.querySelectorAll('.q23-tag').forEach(t => t.remove())
    const els = [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0)
    const e = els[els.length - 1]
    if (!e) throw new Error('mark: nothing visible for ' + sel)
    e.style.outline = `2px solid ${MARK}`; e.style.outlineOffset = off
    const r = e.getBoundingClientRect()
    const left = side === 'right' ? r.right + 6 : side === 'top' ? r.right - 10 : Math.max(2, r.left - 26)
    const top = side === 'top' ? r.top - 22 : r.top + r.height / 2 - 10
    const t = document.createElement('div'); t.className = 'q23-tag'; t.textContent = n
    t.style.cssText = `position:fixed;z-index:99999;left:${left}px;top:${top}px;width:20px;height:20px;border-radius:10px;background:${MARK};color:#000;font:700 12px/20px system-ui;text-align:center;pointer-events:none`
    document.body.appendChild(t)
  }, { sel, n: String(n), MARK, side: o.side || 'left', off: o.off || '2px' })
}
async function clipShot(w, name, sel, pad = { l: 40, r: 40, t: 30, b: 30 }, extra = null) {
  const P = w.page
  const r = await P.evaluate(sel => {
    const els = [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0)
    const e = els[els.length - 1]; if (!e) return null
    const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }
  }, sel)
  if (!r) throw new Error('clipShot: nothing for ' + sel)
  let x = r.x - pad.l, y = r.y - pad.t, W = r.w + pad.l + pad.r, H = r.h + pad.t + pad.b
  if (extra) ({ x, y, W, H } = extra(r, { x, y, W, H }))
  const vw = P.viewportSize().width, vh = P.viewportSize().height
  x = Math.max(0, x); y = Math.max(0, y); W = Math.min(W, vw - x); H = Math.min(H, vh - y)
  await P.screenshot({ path: path.join(L.OUT, `${w.size}-${name}.png`), clip: { x, y, width: W, height: H }, scale: 'device' })
  log('pic', `${w.size}-${name}.png`, Math.round(W), 'x', Math.round(H))
}
const unmark = P => P.evaluate(() => { document.querySelectorAll('.q23-tag').forEach(t => t.remove()); document.querySelectorAll('[style*="outline"]').forEach(e => { e.style.outline = ''; e.style.outlineOffset = '' }) })
const neutral = async P => { await P.mouse.move(2, 2); await P.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur()) }

/* ---- the four places, each: premise asserted, today pictured, the proposal laid on, pictured ---- */
async function gridPlace(w, pid) {
  const P = w.page
  await click(w, T('lw-tab-grid')); await P.waitForTimeout(600)
  await P.locator(T(`row-${pid}`)).first().scrollIntoViewIfNeeded(); await P.waitForTimeout(500)
  await neutral(P)
  const before = await P.evaluate(pid => [...document.querySelectorAll(`[data-person="${pid}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ')), pid)
  log(w.size, 'grid figure today:', JSON.stringify(before))
  const sel = `[data-person="${pid}"]`
  const pad = { l: 8, r: 260, t: 50, b: 50 }
  const ext = (r, c) => ({ ...c, x: 0, W: r.x + r.w + (w.phone ? 140 : 300) })
  await mark(P, sel, 1, { side: 'right', off: '-2px' }); await clipShot(w, 'grid-today', sel, pad, ext); await unmark(P)
  /* PROPOSED: the War bal line beside his name reads the amber "–", its hover "Not typed"; the LL OL line under it stays */
  const n = await P.evaluate(({ pid, AMBER }) => {
    let k = 0
    for (const e of document.querySelectorAll(`[data-person="${pid}"]`)) {
      const leaves = [...e.querySelectorAll('*')].filter(x => x.childElementCount === 0 && /^[−-]?\d/.test(x.textContent.trim()))
      const top = leaves[0]
      if (top) { top.textContent = '–'; top.style.color = AMBER; top.style.fontWeight = '600'; top.classList.remove('neg'); k++ }
      e.title = e.title.replace(/LVE [^ ]+ left/, 'LVE Not typed')
    }
    return k
  }, { pid, AMBER })
  log(w.size, 'grid copies changed:', n)
  await neutral(P)
  await mark(P, sel, 1, { side: 'right', off: '-2px' }); await clipShot(w, 'grid-proposed', sel, pad, ext); await unmark(P)
}
async function approvalsPlace(w, pid) {
  const P = w.page
  await click(w, T('lw-tab-approvals')); await P.waitForSelector(T('approvals-page'), { state: 'visible' }); await P.waitForTimeout(600)
  const line = T(`appr-line-${pid}`)
  await P.locator(line).first().scrollIntoViewIfNeeded(); await P.waitForTimeout(300); await neutral(P)
  const sel = `${line} .appr-bal`
  log(w.size, 'approvals LVE BAL today:', await L.txt(P, sel))
  const pad = { l: 600, r: 600, t: 50, b: 20 }
  const lx = await P.evaluate(line => [...document.querySelectorAll(line)].filter(e => e.getBoundingClientRect().width > 0).pop().getBoundingClientRect().left, line)
  const ext = (r, c) => w.phone ? { ...c, x: 0, W: P.viewportSize().width } : { ...c, x: lx - 10, W: r.x + r.w + 330 - (lx - 10) }
  await mark(P, sel, 3); await clipShot(w, 'appr-today', sel, pad, ext); await unmark(P)
  /* PROPOSED: "Not typed" in amber if the column holds it, else the amber "–" — measured against the next column */
  const how = await P.evaluate(({ sel, AMBER }) => {
    const e = [...document.querySelectorAll(sel)].filter(x => x.getBoundingClientRect().width > 0).pop()
    e.classList.remove('neg')
    e.innerHTML = `<span style="color:${AMBER};font-weight:700;white-space:nowrap">Not typed</span>`
    const s = e.firstChild.getBoundingClientRect(), nx = e.nextElementSibling?.getBoundingClientRect()
    const fits = !nx || s.right <= nx.left - 4
    if (!fits) { e.innerHTML = `<span style="color:${AMBER};font-weight:600" title="Not typed">–</span>` }
    return { fits, right: Math.round(s.right), next: nx ? Math.round(nx.left) : null }
  }, { sel, AMBER })
  log(w.size, 'approvals proposal:', JSON.stringify(how))
  await neutral(P)
  await mark(P, sel, 3); await clipShot(w, 'appr-proposed', sel, pad, ext); await unmark(P)
  return how
}
async function buttonsPlace(w, pid, ntKinds) {
  const P = w.page
  await click(w, T('lw-tab-grid')); await P.waitForTimeout(500)
  await L.reachCell(w, pid, '2026-12-02')
  await click(w, T(L.cellId(pid, '2026-12-02'))); await P.waitForSelector(T('bid-picker'), { state: 'visible' }); await P.waitForTimeout(600)
  await neutral(P)
  const today = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-leave-grid"] button')].map(b => b.innerText.replace(/\s+/g, ' ')))
  log(w.size, 'leave buttons today:', JSON.stringify(today))
  const sel = T('bid-leave-grid')
  const pad = { l: 20, r: 20, t: 70, b: 16 }
  await mark(P, sel, 4); await clipShot(w, 'buttons-today', sel, pad); await unmark(P)
  /* PROPOSED: a kind never typed shows the amber "–" where its "left" stands, not dimmed (the below-zero question waits);
     OIL keeps its figure — it is counted from awards, never typed */
  const k = await P.evaluate(({ ntKinds, AMBER }) => {
    const map = { LL: 'LVE', OL: 'LVE' }
    let n = 0
    for (const b of document.querySelectorAll('[data-testid="bid-leave-grid"] button')) {
      const t = b.dataset.testid.replace(/^bid-/, '')
      const kind = map[t] || t
      if (!ntKinds.includes(kind)) continue
      const f = b.querySelector('.lv-fig'); if (!f) continue
      f.textContent = '–'; f.classList.remove('lv-neg'); f.style.color = AMBER; f.style.opacity = '1'; f.style.fontWeight = '600'
      b.classList.remove('lv-dim'); b.title = b.title + ' — Not typed'; n++
    }
    return n
  }, { ntKinds, AMBER })
  log(w.size, 'leave buttons changed:', k)
  await neutral(P)
  await mark(P, sel, 4); await clipShot(w, 'buttons-proposed', sel, pad); await unmark(P)
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
}
async function sentencePlace(w, pid) {
  const P = w.page
  await click(w, T('lw-tab-balances')); await P.waitForSelector(T('balances-page'), { state: 'visible' }); await P.waitForTimeout(600)
  const cf = T(`bal-cf-${pid}`)
  await P.locator(cf).first().scrollIntoViewIfNeeded()
  await P.locator(cf).first().click(); await P.waitForTimeout(150)
  await P.keyboard.press('Control+A'); await P.keyboard.type('3', { delay: 30 }); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
  await neutral(P)
  const tag = await P.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.childElementCount === 0 && e.textContent.trim() === 'Type the Official bal first' && e.getBoundingClientRect().width > 0).length)
  log(w.size, 'red tag shown:', tag)
  if (!tag) throw new Error('the red tag did not show')
  const row = T(`bal-row-${pid}`)
  await mark(P, cf, 5, { side: 'top' }); await clipShot(w, 'sentence', row, { l: 4, r: 4, t: 40, b: 50 }, (r, c) => ({ ...c, x: w.phone ? 0 : r.x - 10, W: w.phone ? 402 : 700 })); await unmark(P)
}
async function myLeavePlace(w) {
  const P = w.page
  await click(w, T('lw-tab-grid')); await P.waitForTimeout(500)
  await P.evaluate(() => window.scrollTo(0, 0)); await neutral(P)
  const sel = T('my-leave')
  log(w.size, 'my leave today:', await L.txt(P, sel))
  const pad = { l: 30, r: 16, t: 26, b: 14 }
  const ext = (r, c) => w.phone ? { ...c, x: 0, W: 402 } : { ...c, x: r.x - 420, W: 420 + r.w + 30 }
  await mark(P, sel, 2, { side: w.phone ? 'top' : 'left' }); await clipShot(w, 'myleave-today', sel, pad, ext); await unmark(P)
  /* PROPOSED: "LVE Not typed" in amber where the figure stands, if the strip holds it — else the amber "–" */
  /* the words first, pictured whatever the fit, so the choice is seen (cut with "…" where the strip gives way) */
  await P.evaluate(AMBER => { document.querySelector('[data-testid="my-leave-lve"]').innerHTML = `LVE <span style="color:${AMBER}">Not typed</span>` }, AMBER)
  await neutral(P); await mark(P, sel, 2, { side: w.phone ? 'top' : 'left' }); await clipShot(w, 'myleave-words', sel, pad, ext); await unmark(P)
  log(w.size, 'my leave with the words reads:', await P.evaluate(() => { const s = document.querySelector('[data-testid="my-leave"]'); return [...s.children].map(c => c.textContent + (c.scrollWidth > c.clientWidth + 1 ? ' [CUT]' : '')).join(' | ') }))
  const how = await P.evaluate(AMBER => {
    const b = document.querySelector('[data-testid="my-leave-lve"]')
    const strip = document.querySelector('[data-testid="my-leave"]')
    const w0 = strip.getBoundingClientRect().width, h0 = strip.getBoundingClientRect().height
    b.innerHTML = `LVE <span style="color:${AMBER}">Not typed</span>`
    const figs = b.parentElement, go = strip.querySelector('.ml-go')
    const fr = figs.getBoundingClientRect(), last = figs.lastElementChild.getBoundingClientRect()
    const over = strip.getBoundingClientRect().width > w0 + 1 || strip.getBoundingClientRect().height > h0 + 1 || (go && last.right > go.getBoundingClientRect().left - 2) || figs.scrollWidth > Math.ceil(fr.width) + 1
    if (over) b.innerHTML = `LVE <span style="color:${AMBER}" title="Not typed">–</span>`
    return { over, w0: Math.round(w0), w1: Math.round(strip.getBoundingClientRect().width), lastRight: Math.round(last.right), go: go ? Math.round(go.getBoundingClientRect().left) : null }
  }, AMBER)
  log(w.size, 'my leave proposal:', JSON.stringify(how))
  await neutral(P)
  await mark(P, sel, 2, { side: w.phone ? 'top' : 'left' }); await clipShot(w, 'myleave-proposed', sel, pad, ext); await unmark(P)
  return how
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
  const ntKinds = await d.page.evaluate(pid => {
    const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
    const ks = [...row.querySelectorAll('[data-testid^="bal-"]')].filter(e => e.classList.contains('nt') || e.querySelector('.nt')).map(e => e.dataset.testid.split('-')[1])
    return { nt: [...new Set(ks)], notTyped: !!row.querySelector('.bp-nt') }
  }, pid)
  log('Pelican', pid, JSON.stringify(ntKinds))
  if (!ntKinds.notTyped) throw new Error('Pelican is not "Not typed"')
  const kinds = ntKinds.nt.length ? ntKinds.nt.filter(k => k !== 'cf' && k !== 'oil' && k !== 'grade' && k !== 'name') : ['LVE']
  if (!kinds.includes('LVE')) kinds.push('LVE')
  out.kinds = kinds; log('kinds never typed:', kinds)
  /* one pending LL on Tue 1 Dec, Auto-approve off */
  await click(d, T('lw-tab-grid')); await d.page.waitForTimeout(500)
  await L.reachCell(d, pid, '2026-12-01')
  await click(d, T(L.cellId(pid, '2026-12-01'))); await d.page.waitForSelector(T('bid-picker'), { state: 'visible' })
  await L.approveWhatIEnter(d, false)
  await L.placeLeave(d, 'LL'); await d.page.waitForTimeout(600)
  log('approvals has his line:', await d.page.locator(T(`appr-line-${pid}`)).count(), '(before the tab is open)')
  const state = await d.ctx.storageState()
  await d.ctx.close()

  for (const size of ['desk', 'phone']) {
    const w = await ctxFor(size, state)
    await signInAs(w, 'ad', 'a', T('row-stiff'))
    await gridPlace(w, pid)
    out[size + 'Appr'] = await approvalsPlace(w, pid)
    await buttonsPlace(w, pid, kinds)
    await sentencePlace(w, pid)
    log(size, 'errors (admin):', w.errs.join(' | ') || 'none')
    await w.ctx.close()
    const m = await ctxFor(size, state)
    await signInAs(m, 'pelican@mail', 'x', T('my-leave'))
    out[size + 'My'] = await myLeavePlace(m)
    log(size, 'errors (Pelican):', m.errs.join(' | ') || 'none')
    await m.ctx.close()
  }
  log('RESULT', JSON.stringify(out))
} catch (e) {
  console.log('STOPPED:', e.message)
} finally { await L.closeBrowser() }
