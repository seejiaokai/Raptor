// Walker B's helpers (copied from the host's probe lw-m5a-probe.mjs, plus phone gestures). Set LW_OUT / LW_TODAY BEFORE importing.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/b'
process.env.LW_TODAY ||= '2026-01-25'
export const L = await import('./lw-m4-lib.mjs')
export const { T, rec, shot, press, step, vis, txt } = L

export const tabRow = page => page.evaluate(() => {
  const tabs = [...document.querySelectorAll('.lw-tabs [role="tab"]')].filter(e => e.getBoundingClientRect().width > 0)
  const out = tabs.map(t => {
    const lab = t.querySelector('.intab-t'), n = t.querySelector('.appr-tabn'), ic = t.querySelector('svg')
    const labW = lab ? lab.getBoundingClientRect().width : 0
    const r = t.getBoundingClientRect()
    return { id: t.dataset.testid, label: labW > 1 ? lab.textContent.trim() : '(icon only)', icon: !!ic && ic.getBoundingClientRect().width > 0, n: n ? n.textContent.trim() : '', left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), h: Math.round(r.height), sel: t.getAttribute('aria-selected') }
  })
  const g = document.querySelector('[data-testid="settings-open"]')
  const gr = g ? g.getBoundingClientRect() : null
  return { tabs: out, gear: gr && gr.width > 0 ? { left: Math.round(gr.left), right: Math.round(gr.right), top: Math.round(gr.top) } : null, vw: innerWidth, sw: document.documentElement.scrollWidth }
})
export const balRow = (page, pid) => page.evaluate(pid => {
  const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
  if (!row) return null
  const val = id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim()) : null }
  const r = { app: val(`bal-LVE-${pid}`), cf: val(`bal-cf-${pid}`), pend: val(`bal-pend-${pid}`), war: val(`bal-war-${pid}`), oil: val(`bal-oil-${pid}`), grade: (row.querySelector(`[data-testid="bal-grade-${pid}"]`) || row.querySelector('.bp-rogd,.bp-gd'))?.textContent.replace(/\s+/g, ' ').trim() ?? null }
  for (const k of ['CCL', 'FCL', 'PL', 'EL', 'CL']) r[k] = val(`bal-${k}-${pid}`) + (val(`bal-opd-${k}-${pid}`) ? ' ' + val(`bal-opd-${k}-${pid}`) : '')
  r.boxes = row.querySelectorAll('input').length
  r.readOnly = [...row.querySelectorAll('.bp-ro')].map(e => e.textContent.trim())
  return r
}, pid)
export const pwRead = page => page.evaluate(() => {
  const pw = document.querySelector('[data-testid="person-window"]')
  if (!pw || !pw.getBoundingClientRect().width) return null
  const q = id => pw.querySelector(`[data-testid="${id}"]`)
  const v = id => { const e = q(id); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim()) : null }
  const r = pw.getBoundingClientRect()
  const yr = q('pw-year')
  return {
    name: v('pw-name'), taken: v('pw-taken'), lve: v('pw-tile-LVE'), pend: v('pw-LVE-pend'), war: v('pw-LVE-war'), cf: v('pw-LVE-cf'),
    oil: v('pw-oil'), med: v('pw-med'), lock: v('pw-lock'),
    other: Object.fromEntries(['CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => [k, v(`pw-${k}`)])),
    boxes: pw.querySelectorAll('input').length,
    year: yr ? { value: yr.value, options: [...yr.options].map(o => o.textContent) } : null,
    lines: [...pw.querySelectorAll('[data-testid^="pw-line-"]')].filter(e => !/-(dot|who)$/.test(e.dataset.testid)).map(e => ({ id: e.dataset.testid, text: e.innerText.replace(/\s+/g, ' ').trim(), dot: !!e.querySelector('.m5-dot'), who: (document.querySelector(`[data-testid="${e.dataset.testid}-who"]`)?.textContent || '').replace(/\s+/g, ' ').trim() })),
    box: { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width) },
    vh: innerHeight, vw: innerWidth, closeY: Math.round(q('pw-close')?.getBoundingClientRect().top ?? -1),
  }
})
export async function closePw(w) {
  const pw = await pwRead(w.page)
  if (pw && pw.closeY > 0 && pw.closeY < pw.vh) { await press(w, T('pw-close')); await w.page.waitForTimeout(400); return 'close button' }
  await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(400); return 'Escape'
}
export async function openBalances(w) {
  await press(w, T('lw-tab-balances'))
  await w.page.waitForSelector(T('balances-page'), { state: 'visible', timeout: 10000 })
  await w.page.waitForTimeout(500)
}
export async function typeInBox(w, sel, figure, enter = true) {
  await press(w, sel)
  await w.page.waitForTimeout(w.phone ? 650 : 150)
  await w.page.keyboard.press('Control+A')
  await w.page.keyboard.type(String(figure), { delay: 30 })
  if (enter) await w.page.keyboard.press('Enter')
  await w.page.waitForTimeout(500)
}
export const where = page => page.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); return { top: s ? Math.round(s.scrollTop) : null, left: s ? Math.round(s.scrollLeft) : null, win: Math.round(window.scrollY) } })
export async function lockViaBridge(w, on) {
  return w.page.evaluate(async on => {
    const url = performance.getEntriesByType('resource').map(e => e.name).find(n => /\/assets\/store-[^/]+\.js$/.test(n))
      || [...document.querySelectorAll('link[rel="modulepreload"]')].map(l => l.href).find(n => /\/assets\/store-[^/]+\.js$/.test(n))
    if (!url) return { ok: false, why: 'no store module' }
    const m = await import(url)
    const setLock = Object.values(m).filter(f => typeof f === 'function').find(f => String(f).includes('lw.balLock'))
    if (!setLock) return { ok: false, why: 'no lock writer' }
    if (typeof window.lwSetRole !== 'function' || typeof window.raptorRole !== 'function') return { ok: false, why: 'no bridge role switches' }
    window.raptorRole('admin'); window.lwSetRole('admin')
    let res
    try { res = setLock(on) } finally { window.lwSetRole('member'); window.raptorRole('member') }
    return { ok: true, wrote: res }
  }, on)
}
export async function reloadAt(w, iso) {
  await w.page.reload()
  await w.page.waitForSelector('#luser, #vWeek .day', { state: 'attached', timeout: 15000 })
  const signedOut = await w.page.locator('#luser').isVisible().catch(() => false)
  await w.page.evaluate(t => window.lwSetMemberToday(t), iso)
  return signedOut
}
/* ---- phone gestures through CDP touch (Chromium) */
const sleep = (w, ms) => w.page.waitForTimeout(ms)
export async function swipe(w, x0, y0, x1, y1, { steps = 8, dwell = 16, rest = 120 } = {}) {
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] })
  for (let i = 1; i <= steps; i++) {
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / steps, y: y0 + (y1 - y0) * i / steps }] })
    await sleep(w, dwell)
  }
  await sleep(w, rest)   // a finger rests before it lifts (walk-scripts section 4)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
export async function pinch(w, cx, cy, d0, d1, { steps = 10, dwell = 16, rest = 120 } = {}) {
  const pts = d => [{ x: cx - d / 2, y: cy, id: 1 }, { x: cx + d / 2, y: cy, id: 2 }]
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(d0) })
  for (let i = 1; i <= steps; i++) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(d0 + (d1 - d0) * i / steps) }); await sleep(w, dwell) }
  await sleep(w, rest)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
export const box = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) } }, sel)
export const errsOf = w => w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx'
