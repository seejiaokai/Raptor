// Chat 208 — the re-walk of his D2823 (27 Nov 26, "No Not typed anywhere"): a balance never typed shows the words "Not
// typed" nowhere — an empty box he can type in keeps the amber dashed edge, a figure that only stands reads the amber "–"
// (beside his name on the grid, My leave, Approvals' LVE BAL, the leave buttons' "left" not dimmed, War bal in his window),
// and no pointing hint says "Not typed". The Balances page keeps D2820's empty amber outline (the host's reading, put to
// him). Built on the real app; Pelican added on Admin → Users with a sign-in, posted in today, nothing typed; one pending LL
// on Tue 1 Dec placed by the admin with Auto-approve off. Desktop 1536 and his iPhone's 402, both at 2x; admin and Pelican.
// Helpers copied from lw-postin-q23-draw.mjs (its drawing of question 23, the places this walks).
// Run from this folder: node lw-postin-d2823-walk.mjs   (PORT 4757, LW_TODAY 2026-11-26)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-11-27-lw-postin-d2823'
process.env.LW_TODAY ||= '2026-11-26'
process.env.PORT ||= '4757'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
const L = await import('./lw-m4-lib.mjs')
const { T, getBrowser } = L
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

console.log('[lw-postin-d2823-walk v1]')

/* ---- the re-walk: each place read on the built page, pictured, every check a PASS or FAIL line ---- */
const WALK = []
const ok = (w, c, m) => { const v = c ? 'PASS' : 'FAIL'; WALK.push([v, w.size + ' ' + w.who, m]); log(v, w.size, w.who, '—', m) }
const isAmber = c => c === 'rgb(242, 200, 121)'
/* "Not typed" on screen: in any shown text, or in any pointing hint (title) — a screen reader's name is not shown */
const wordsShown = P => P.evaluate(() => ({
  text: document.body.innerText.includes('Not typed'),
  hint: [...document.querySelectorAll('[title]')].filter(e => /not typed/i.test(e.getAttribute('title'))).map(e => e.tagName + '.' + e.className).slice(0, 4),
}))

async function gridCheck(w, pid) {
  const P = w.page
  await click(w, T('lw-tab-grid')); await P.waitForTimeout(500)
  await L.reachCell(w, pid, '2026-12-01'); await P.waitForTimeout(300); await neutral(P)
  const g = await P.evaluate(pid => [...document.querySelectorAll(`td.figbox[data-person="${pid}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => {
    const fb = e.querySelector('.fb'); const f = getComputedStyle(fb)
    return { text: fb.textContent, cls: fb.className, color: f.color, title: e.getAttribute('title') || '', used: e.querySelector('.fu')?.textContent || '' }
  }), pid)
  ok(w, g.length > 0 && g.every(x => x.text === '–' && isAmber(x.color) && !x.cls.includes('neg')), `the grid beside his name reads the amber "–" (${JSON.stringify(g)})`)
  ok(w, g.every(x => !/not typed/i.test(x.title) && !/LVE\s+[-−–\d]/.test(x.title)), `its hover names no figure and no words (${g.map(x => x.title).join(' | ')})`)
  await P.locator(`td.figbox[data-person="${pid}"]`).last().scrollIntoViewIfNeeded(); await P.waitForTimeout(300); await neutral(P)
  await mark(P, `td.figbox[data-person="${pid}"]`, 1, { side: 'right', off: '-2px' })
  await clipShot(w, `${w.who}-grid`, `td.figbox[data-person="${pid}"]`, { l: 8, r: 260, t: 50, b: 50 }, (r, c) => ({ ...c, x: 0, W: r.x + r.w + (w.phone ? 140 : 300) }))
  await unmark(P)
}
async function approvalsCheck(w, pid) {
  const P = w.page
  await click(w, T('lw-tab-approvals')); await P.waitForSelector(T('approvals-page'), { state: 'visible' }); await P.waitForTimeout(600)
  const line = T(`appr-line-${pid}`)
  await P.locator(line).first().scrollIntoViewIfNeeded(); await P.waitForTimeout(300); await neutral(P)
  const a = await P.evaluate(line => {
    const e = [...document.querySelectorAll(`${line} .appr-bal`)].filter(x => x.getBoundingClientRect().width > 0).pop()
    const nt = e?.querySelector('.nt')
    return e ? { text: e.textContent, cls: e.className, color: nt ? getComputedStyle(nt).color : null } : null
  }, line)
  ok(w, !!a && a.text === '–' && isAmber(a.color) && !a.cls.includes('neg'), `Approvals' LVE BAL reads the amber "–" (${JSON.stringify(a)})`)
  const lx = await P.evaluate(line => [...document.querySelectorAll(line)].filter(e => e.getBoundingClientRect().width > 0).pop().getBoundingClientRect().left, line)
  await mark(P, `${line} .appr-bal`, 3)
  await clipShot(w, `${w.who}-approvals`, `${line} .appr-bal`, { l: 600, r: 600, t: 50, b: 20 }, (r, c) => w.phone ? { ...c, x: 0, W: P.viewportSize().width } : { ...c, x: lx - 10, W: r.x + r.w + 330 - (lx - 10) })
  await unmark(P)
  const s = await wordsShown(P); ok(w, !s.text && !s.hint.length, `no "Not typed" on Approvals, shown or hovered (${JSON.stringify(s)})`)
}
async function buttonsCheck(w, pid) {
  const P = w.page
  await click(w, T('lw-tab-grid')); await P.waitForTimeout(500)
  await L.reachCell(w, pid, '2026-12-02')
  await click(w, T(L.cellId(pid, '2026-12-02'))); await P.waitForSelector(T('bid-picker'), { state: 'visible' }); await P.waitForTimeout(600)
  await neutral(P)
  const b = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-leave-grid"] button')].map(x => {
    const f = x.querySelector('.lv-fig')
    return { id: x.dataset.testid, fig: f?.textContent ?? null, nt: !!f?.classList.contains('lv-nt'), color: f ? getComputedStyle(f).color : null, dim: x.classList.contains('lv-dim'), op: getComputedStyle(x).opacity, title: x.title }
  }))
  const lve = b.filter(x => x.id === 'bid-LL' || x.id === 'bid-OL')
  const small = b.filter(x => ['bid-CCL', 'bid-FCL', 'bid-PL', 'bid-EL', 'bid-CL'].includes(x.id))
  ok(w, lve.length === 2 && lve.every(x => x.fig === '–' && x.nt && isAmber(x.color) && !x.dim && x.op === '1'), `LL and OL read the amber "–" for what is left, not dimmed (${JSON.stringify(lve)})`)
  ok(w, small.every(x => x.fig === '–' && x.nt && !x.dim), `the five small kinds, never typed, the same (${small.map(x => x.id + ':' + x.fig + (x.dim ? ' dim' : '')).join(' ')})`)
  ok(w, b.every(x => !/not typed/i.test(x.title)), 'no button hints "Not typed"')
  await mark(P, T('bid-leave-grid'), 4)
  await clipShot(w, `${w.who}-buttons`, T('bid-leave-grid'), { l: 20, r: 20, t: 70, b: 16 })
  await unmark(P)
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
}
async function windowCheck(w, pid) {
  const P = w.page
  await click(w, T('lw-tab-grid')); await P.waitForTimeout(400)
  await L.reachCell(w, pid, '2026-12-01')
  /* the box a finger meets: on a phone the frozen copy of the names lies over the real cell, so the last one drawn */
  const boxEl = P.locator(`td.figbox[data-person="${pid}"]`).last()
  await boxEl.scrollIntoViewIfNeeded(); await neutral(P)
  await boxEl.click(); await P.waitForSelector(T('person-window'), { state: 'visible' }); await P.waitForTimeout(500)
  await neutral(P)
  const pw = await P.evaluate(() => {
    const war = document.querySelector('[data-testid="pw-LVE-war"]'); const win = document.querySelector('[data-testid="person-window"]')
    const small = ['CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => { const e = document.querySelector(`[data-testid="pw-${k}"]`); return e ? { k, tag: e.tagName, val: e.value ?? e.textContent, nt: e.className.includes('nt') } : null })
    return { war: war.textContent, color: getComputedStyle(war).color, text: win.innerText.includes('Not typed'), hint: [...win.querySelectorAll('[title]')].filter(e => /not typed/i.test(e.title)).length, small }
  })
  ok(w, pw.war === '–' && isAmber(pw.color), `his window's War bal reads the amber "–" (${pw.war}, ${pw.color})`)
  ok(w, !pw.text && !pw.hint, `no "Not typed" in his window, shown or hovered (${JSON.stringify({ text: pw.text, hint: pw.hint })})`)
  ok(w, pw.small.every(s => s && s.nt), `the small kinds: an empty dashed box where he can type, else the amber "–" (${pw.small.map(s => s && s.k + ':' + s.tag + ':' + JSON.stringify(s.val)).join(' ')})`)
  await clipShot(w, `${w.who}-window`, T('person-window'), { l: 6, r: 6, t: 6, b: 6 })
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
}
async function balancesCheck(w, pid) {
  const P = w.page
  await click(w, T('lw-tab-balances')); await P.waitForSelector(T('balances-page'), { state: 'visible' }); await P.waitForTimeout(600)
  await P.locator(T(`bal-row-${pid}`)).first().scrollIntoViewIfNeeded(); await P.waitForTimeout(300); await neutral(P)
  const s = await wordsShown(P)
  const b = await P.evaluate(pid => { const r = document.querySelector(`[data-testid="bal-row-${pid}"]`); return { outline: !!r.querySelector('.bp-nto'), ro: r.querySelectorAll('.bp-ro.nt').length, boxes: r.querySelectorAll('input.bp-bx.nt').length } }, pid)
  ok(w, !s.text && !s.hint.length && b.outline, `the Balances page: no "Not typed", shown or hovered; War bal's empty outline kept (${JSON.stringify({ ...s, ...b })})`)
}
async function myLeaveCheck(w) {
  const P = w.page
  await click(w, T('lw-tab-grid')); await P.waitForTimeout(500)
  await P.evaluate(() => window.scrollTo(0, 0)); await neutral(P)
  const m = await P.evaluate(() => { const e = document.querySelector('[data-testid="my-leave-lve"]'); const nt = e.querySelector('.nt'); return { text: e.textContent, color: nt ? getComputedStyle(nt).color : null, figs: document.querySelector('[data-testid="my-leave"]').innerText.replace(/\s+/g, ' ') } })
  ok(w, m.text === 'LVE –' && isAmber(m.color), `My leave reads "LVE –", the dash amber (${JSON.stringify(m)})`)
  const over = await P.evaluate(() => { const s = document.querySelector('[data-testid="my-leave"]'), f = s.querySelector('.ml-figs'); return { strip: Math.round(s.getBoundingClientRect().width), figsScroll: f.scrollWidth, figsW: Math.ceil(f.getBoundingClientRect().width) } })
  ok(w, over.figsScroll <= over.figsW + 1, `My leave's figures fit their line (${JSON.stringify(over)})`)
  await mark(P, T('my-leave'), 2, { side: w.phone ? 'top' : 'left' })
  await clipShot(w, `${w.who}-myleave`, T('my-leave'), { l: 30, r: 16, t: 26, b: 14 }, (r, c) => w.phone ? { ...c, x: 0, W: 402 } : { ...c, x: r.x - 420, W: 420 + r.w + 30 })
  await unmark(P)
}

const out = {}
try {
  mkdirSync(L.OUT, { recursive: true })
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
  const premise = await d.page.evaluate(pid => !!document.querySelector(`[data-testid="bal-row-${pid}"] .bp-nto`), pid)
  if (!premise) throw new Error('Pelican is not never-typed (no War bal outline)')
  await click(d, T('lw-tab-grid')); await d.page.waitForTimeout(500)
  await L.reachCell(d, pid, '2026-12-01')
  await click(d, T(L.cellId(pid, '2026-12-01'))); await d.page.waitForSelector(T('bid-picker'), { state: 'visible' })
  await L.approveWhatIEnter(d, false)
  await L.placeLeave(d, 'LL'); await d.page.waitForTimeout(600)
  log('Pelican', pid, 'staged; errors:', d.errs.join(' | ') || 'none')
  const state = await d.ctx.storageState()
  await d.ctx.close()

  for (const size of ['desk', 'phone']) {
    const w = await ctxFor(size, state); w.who = 'admin'
    await signInAs(w, 'ad', 'a', T('row-stiff'))
    await gridCheck(w, pid)
    await approvalsCheck(w, pid)
    await buttonsCheck(w, pid)
    await windowCheck(w, pid)
    await balancesCheck(w, pid)
    ok(w, w.errs.length === 0, `no page or console errors (${w.errs.join(' | ') || 'none'})`)
    await w.ctx.close()
    const m = await ctxFor(size, state); m.who = 'pelican'
    await signInAs(m, 'pelican@mail', 'x', T('my-leave'))
    await myLeaveCheck(m)
    await gridCheck(m, pid)
    /* (no leave buttons for him: nothing is open for bidding, so a member's tap opens no bid window — D1177; the admin's
       run above reads them) */
    await windowCheck(m, pid)
    ok(m, m.errs.length === 0, `no page or console errors (${m.errs.join(' | ') || 'none'})`)
    await m.ctx.close()
  }
} catch (e) {
  console.log('STOPPED:', e.stack || e.message)
  WALK.push(['FAIL', 'run', 'STOPPED: ' + e.message])
} finally {
  writeFileSync(path.join(L.OUT, 'd2823-walk.json'), JSON.stringify(WALK, null, 1))
  log('TOTAL', WALK.filter(x => x[0] === 'PASS').length, 'PASS', WALK.filter(x => x[0] === 'FAIL').length, 'FAIL')
  await L.closeBrowser()
}
