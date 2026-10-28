// M5a walker C — helpers (copied from the host's probe, plus the person-window ones). Import AFTER setting LW_OUT / LW_TODAY.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/c'
process.env.LW_TODAY ||= '2026-01-25'
export const L = await import('./lw-m4-lib.mjs')
export const { T, rec, shot, press, step, vis, txt } = L

export const pwRead = page => page.evaluate(() => {
  const pw = document.querySelector('[data-testid="person-window"]')
  if (!pw || !pw.getBoundingClientRect().width) return null
  const q = id => pw.querySelector(`[data-testid="${id}"]`)
  const v = id => { const e = q(id); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim()) : null }
  const r = pw.getBoundingClientRect()
  const yr = q('pw-year')
  return {
    name: v('pw-name'), taken: v('pw-taken'), lve: v('pw-tile-LVE'), app: v('pw-LVE'), pend: v('pw-LVE-pend'), war: v('pw-LVE-war'), cf: v('pw-LVE-cf'),
    oil: v('pw-oil'), med: v('pw-med'), lock: v('pw-lock'),
    other: Object.fromEntries(['CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => [k, v(`pw-${k}`) + (q(`pw-${k}-pend`) ? ' pend ' + v(`pw-${k}-pend`) + ' war ' + v(`pw-${k}-war`) : '')])),
    boxes: pw.querySelectorAll('input').length,
    year: yr ? { value: yr.value, options: [...yr.options].map(o => o.textContent) } : null,
    lines: [...pw.querySelectorAll('[data-testid^="pw-line-"]')].filter(e => !/-(dot|who)$/.test(e.dataset.testid)).map(e => ({ id: e.dataset.testid, text: e.innerText.replace(/\s+/g, ' ').trim(), dot: !!e.querySelector('.m5-dot') || !!pw.querySelector(`[data-testid="${e.dataset.testid}-dot"]`), who: (pw.querySelector(`[data-testid="${e.dataset.testid}-who"]`)?.textContent || '').replace(/\s+/g, ' ').trim(), struck: getComputedStyle(e).textDecorationLine.includes('line-through') || !!e.querySelector('s,del,.struck') })),
    box: { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height) },
    vw: innerWidth, vh: innerHeight, closeY: Math.round(q('pw-close')?.getBoundingClientRect().top ?? -1),
  }
})
export const onScreen = pw => !!pw && pw.box.top >= 0 && pw.box.top < pw.vh - 40 && pw.box.bottom > 0 && pw.closeY > 0 && pw.closeY < pw.vh
export async function closePw(w) {
  const pw = await pwRead(w.page)
  if (!pw) return 'none open'
  if (onScreen(pw)) { await press(w, T('pw-close')); await w.page.waitForTimeout(400); return '✕' }
  await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(400); return 'Escape (✕ off the screen)'
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
export const balRow = (page, pid) => page.evaluate(pid => {
  const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
  if (!row) return null
  const val = id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim()) : null }
  return { app: val(`bal-LVE-${pid}`), cf: val(`bal-cf-${pid}`), pend: val(`bal-pend-${pid}`), war: val(`bal-war-${pid}`), oil: val(`bal-oil-${pid}`) }
}, pid)
export async function reloadAt(w, iso) {
  await w.page.reload()
  await w.page.waitForSelector('#luser, #vWeek .day', { state: 'attached', timeout: 15000 })
  const signedOut = await w.page.locator('#luser').isVisible().catch(() => false)
  await w.page.evaluate(t => window.lwSetMemberToday(t), iso)
  return signedOut
}
export const gridFigure = (page, pid) => page.evaluate(pid => { const e = document.querySelector(`[data-testid="bal-${pid}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }, pid)
/* the history: every line the changes window / bell says is not needed; the app's undo note */
export const note = page => page.evaluate(() => [...document.querySelectorAll('.toast, [role="status"], [role="alert"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean))
/* what is at the centre of an element: itself, inside it, or something else */
export const topAt = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return 'absent'; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !h ? 'nothing' : (e === h || e.contains(h)) ? 'itself' : 'covered by ' + (h.dataset?.testid || h.className || h.tagName) }, sel)
export const ids = (page, prefix) => page.evaluate(p => [...document.querySelectorAll(`[data-testid^="${p}"]`)].map(e => e.dataset.testid), prefix)
