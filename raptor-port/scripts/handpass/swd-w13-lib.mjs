// swd-w13-lib — walker w13's helpers (the SANS calendar's doors, the crew list, the plain-user round), 24 Nov 26, chat 156.
// Built on walkers w11/w12's passing helpers (swd-w12-lib → swd-w11-lib → sah-w8-lib, sah-w10-lib, asp-w2-lib, sud-w5-lib).
// window.* is only READ here (and window.go, the recipes' own page switch). Every staging step goes through the app's controls.
import './swd-w13-env.mjs'
import path from 'node:path'
const Z = await import('./swd-w12-lib.mjs')
export { Z }
export const { K, X, T, L, RANGER, HEX, D, WK1, WK2, need, asR, asS, post, tick, seen, filings, scene, sleep, warReady, plan } = Z
export const ISO = { ...Z.ISO, 13: '2026-07-13', 14: '2026-07-14', 31: '2026-07-31', a1: '2026-08-01', a2: '2026-08-02', 24: '2026-07-24' }
export const clean = s => String(s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
export const OUT = L.OUT
export const asH = (p, W) => T.as(p, W, 'hex', 'x')

/* every SANS availability record (read only): who, from, to, letters, times */
export const sansRecs = p => p.evaluate(() => (window.INPUTS || []).filter(r => /SANS/i.test(String(r.type))).map(r => ({ iid: r.iid, who: (r.people || [r.person]).map(x => x && (x.p || x)).join('+'), date: r.date, end: r.endDate || r.end || '', sans: r.sans ? Object.keys(r.sans).filter(k => r.sans[k]).join('') : '', allday: r.allday, s: r.s || r.start || '', e: r.e || '' })))
export const sayRecs = rs => rs.length ? rs.map(r => `${r.who} ${r.date}${r.end ? '→' + r.end : ''} [${r.sans}]${r.allday === false ? ' ' + r.s + '–' + r.e : ''}`).join(' ; ') : 'none'
/* the passing note at the foot, read a few times while it shows (a single-slot surface: what it is LEFT showing) */
export async function noteNow(p) {
  let said = ''
  for (let i = 0; i < 8 && !said; i++) { said = clean(await p.locator('#toastEl').first().textContent().catch(() => '')); if (!said) await sleep(120) }
  const shown = await p.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return false; const r = t.getBoundingClientRect(), cs = getComputedStyle(t); return r.width > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05 })
  return { said, shown }
}
/* Add pressed on the open input window; what it said and what it made (the ids before/after) */
export async function add(p, W, tag) {
  const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  await W.press(p, '#inpEditSave:visible', 'inp-save')
  const n = await noteNow(p)
  await sleep(400)
  const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click(); await sleep(400) }
  const stayed = !!(await p.locator('#inpEditPop:visible').count())
  const pic = await W.pic(p, tag + '-added')
  const made = await p.evaluate(b => (window.INPUTS || []).filter(r => !b.includes(r.iid)).map(r => ({ iid: r.iid, who: (r.people || [r.person]).map(x => x && (x.p || x)).join('+'), date: r.date, end: r.endDate || r.end || '', sans: r.sans ? Object.keys(r.sans).filter(k => r.sans[k]).join('') : '', allday: r.allday, s: r.s || '', e: r.e || '' })), before)
  return { said: n.said, shown: n.shown, stayed, made, pic }
}
/* the open window's calendar: which dates read picked, by every class the window's calendar uses */
export const winDates = p => p.evaluate(() => {
  const w = document.querySelector('#inpEditPop'); if (!w) return null
  const ds = [...w.querySelectorAll('[data-testid^="inpEdCal-day-"]')]
  const on = ds.filter(e => e.getAttribute('aria-pressed') === 'true' || /\bis-(on|in|start|end|sel|picked)\b/.test(e.className)).map(e => e.dataset.iso || e.dataset.testid.replace('inpEdCal-day-', ''))
  const read = (w.querySelector('.rc-read') || {}).textContent || ''
  return { on: on.map(x => x.slice(5)), read: read.replace(/\s+/g, ' ').trim(), sample: ds.slice(0, 1).map(e => e.outerHTML.slice(0, 200)) }
})
export const winDatesSay = d => d ? `picked ${d.on.join(',') || 'none'}${d.read ? ' · "' + d.read + '"' : ''}` : 'no window'
/* the SANS tab shown (the Inputs page → SANS) unless it already is */
export async function onSans(p, W) {
  if (!(await p.locator('[data-testid="sanscal"]:visible').count())) { await T.closeAll(p, W); await X.openSans(p, W) }
}
export async function sday(p, W, iso) { await onSans(p, W); return X.sansDay(p, W, iso) }
export async function drag(p, W, a, b) { await onSans(p, W); return X.dragDays(p, W, a, b) }
export async function keys(p, W, from, n, key = 'Enter') {
  await onSans(p, W)
  if (W.isPhone) await X.sansX(p, W)
  await X.sansGoto(p, W, from)
  await p.locator(`[data-testid="sc-day-${from}"]`).first().focus(); await sleep(150)
  for (let i = 0; i < Math.abs(n); i++) { await p.keyboard.press(n > 0 ? 'Shift+ArrowRight' : 'Shift+ArrowLeft'); await sleep(120) }
  const picked = await p.evaluate(() => [...document.querySelectorAll('.sc-day.is-picked')].map(e => e.dataset.icday.slice(8)))
  await p.keyboard.press(key); await sleep(700)
  return { picked, opened: !!(await p.locator('#inpEditPop:visible').count()), r: await X.inpRead(p) }
}
/* SANS day opened → + Commitment pressed; the window open (person as it came) */
export async function commitOpen(p, W, iso, tag) {
  const pg = await sday(p, W, iso)
  if (!pg.win) return { ok: false, why: 'no day window', pic: await W.pic(p, tag + '-nowin') }
  if (pg.win.add !== 'enabled') return { ok: false, greyed: true, why: `+ Commitment ${pg.win.add}: "${pg.win.addwhy}"`, pic: await W.pic(p, tag + '-greyed') }
  await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add')
  await p.waitForSelector('#inpEditPop', { timeout: 6000 }); await sleep(400)
  return { ok: true, r: await X.inpRead(p), pic: await W.pic(p, tag + '-opened') }
}
export { path }
