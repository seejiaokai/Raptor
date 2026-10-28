// M5a walker A — helpers copied from the host's probe (lw-m5a-probe.mjs; not imported: importing it runs it) plus walker A's own.
// Set LW_OUT and LW_TODAY BEFORE importing this file (each on its own line), then `const A = await import('./lw-m5a-walk-a-lib.mjs')`.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/a'
process.env.LW_TODAY ||= '2026-01-25'
export const L = await import('./lw-m4-lib.mjs')
export const { T, rec, shot, press, step, vis, txt } = L
console.log('[lw-m5a-walk-a-lib v1]')

/* a picture at the DEVICE scale (1.25 on the desktop: 1920 wide, the size of the drawings) */
export const shotD = (w, name, opts = {}) => w.page.screenshot({ path: `${L.OUT}/${name}.png`, ...opts })

export const tabRow = page => page.evaluate(() => {
  const tabs = [...document.querySelectorAll('.lw-tabs [role="tab"]')].filter(e => e.getBoundingClientRect().width > 0)
  const out = tabs.map(t => {
    const lab = t.querySelector('.intab-t'), n = t.querySelector('.appr-tabn')
    const labW = lab ? lab.getBoundingClientRect().width : 0
    return { id: t.dataset.testid, label: labW > 1 ? lab.textContent.trim() : '(icon only)', n: n ? n.textContent.trim() : '', right: Math.round(t.getBoundingClientRect().right), sel: t.getAttribute('aria-selected') }
  })
  const g = document.querySelector('[data-testid="settings-open"]')
  const gr = g ? g.getBoundingClientRect() : null
  return { tabs: out, gear: gr && gr.width > 0 ? { left: Math.round(gr.left), right: Math.round(gr.right) } : null }
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
  return { name: v('pw-name'), lve: v('pw-tile-LVE'), pend: v('pw-LVE-pend'), war: v('pw-LVE-war'), cf: v('pw-LVE-cf'), box: { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom) }, vh: innerHeight }
})
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
    if (!url) return { ok: false, why: 'no store module among the loaded scripts' }
    const m = await import(url)
    const fns = Object.values(m).filter(f => typeof f === 'function')
    const setLock = fns.find(f => String(f).includes('lw.balLock'))
    if (!setLock) return { ok: false, why: 'no lock writer in ' + url }
    if (typeof window.lwSetRole !== 'function' || typeof window.raptorRole !== 'function') return { ok: false, why: 'the bridge role switches are missing' }
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
export const focusId = page => page.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName)
/* the notes the app shows (toast-like) */
export const notes = page => page.evaluate(() => [...document.querySelectorAll('.toast, [role="status"], [role="alert"], #note, .note')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean))
/* every Balances/Days-taken heading's words box against the figures under it, per line, in a given row set */
export const alignRead = (page, view) => page.evaluate(view => {
  const words = el => { if (!el) return null; const rg = document.createRange(); rg.selectNodeContents(el); const b = rg.getBoundingClientRect(); return b.width ? b : null }
  const tbl = document.querySelector('.bp-table')
  if (!tbl) return { err: 'no .bp-table (desktop table)' }
  const heads = [...tbl.querySelectorAll('thead tr.h2 th')]
  const rows = [...tbl.querySelectorAll('tbody tr')].filter(r => r.dataset.testid?.startsWith('bal-row-'))
  const out = []
  for (const [i, h] of heads.entries()) {
    const hb = words(h); if (!hb) continue
    const cs = getComputedStyle(h)
    let worst = 0, sample = '', n = 0
    for (const r of rows) {
      const c = r.children[i]; if (!c) continue
      // figure = input box, button, or ro span inside the cell
      const f = c.querySelector('input, button, .bp-ro, .bp-rogd, .bp-pend, .bp-war') || c
      const fb = f.tagName === 'INPUT' || f.tagName === 'BUTTON' ? f.getBoundingClientRect() : words(f)
      if (!fb || !fb.width) continue
      n++
      const hc = hb.left + hb.width / 2, fc = fb.left + fb.width / 2
      const gap = fc - hc
      if (Math.abs(gap) > Math.abs(worst)) { worst = gap; sample = (f.value ?? f.textContent ?? '').toString().replace(/\s+/g, ' ').slice(0, 14) }
    }
    out.push({ heading: h.textContent.trim(), align: cs.textAlign, centreGapWorst: Math.round(worst * 10) / 10, lines: n, sample })
  }
  return { rows: rows.length, heads: out }
}, view)
export const OUT = L.OUT
