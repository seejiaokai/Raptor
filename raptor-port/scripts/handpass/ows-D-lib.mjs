/* Walker D of the OIL-WORK-START walk — shared helpers. Every fixture goes through the app's own controls;
   window.* only to get to a place and to READ. Built on stk-A-lib / stk-B-lib / rbl-D-lib. */
import * as A from './stk-A-lib.mjs'
import * as R from './rbl-D-lib.mjs'
import * as O from './lib.mjs'
export { A, R, O }
const { world, L, W, pic, judge, row, TABLE, savePart, sleep } = A
export { world, L, W, pic, judge, row, TABLE, savePart, sleep }
export const SAT = 5, SUN = 6, MON = 0
export const ISO = { 5: '2026-07-18', 6: '2026-07-19', 0: '2026-07-13', 1: '2026-07-14', 2: '2026-07-15', 3: '2026-07-16', 4: '2026-07-17' }
export const PHONE = !!process.env.HP_PHONE
let CT = 0
export const pics = { saved: 0, opened: [] }
const origPic = pic
export async function P(p, name, opts) { const f = await origPic(p, name, opts); pics.saved++; return f }

/* ---- a Leave War cell + tracker row for a man and date (read-only) ---- */
export const letters = c => (/\b(HO|FO)\b/.exec((c && c.text) || '') || [])[1] || (c && c.text && c.text !== '' ? c.text : '(empty)')
export async function oilOf(p, id, iso, name) {
  await A.lwOpenMonth(p, 'JUL')
  const cell = await A.lwCellOf(p, id, iso)
  await p.evaluate(([i, d]) => { const c = document.querySelector(`[data-testid="cell-${i}-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, [id, iso]); await sleep(300)
  const picCell = await P(p, name + '-cell')
  const rowTxt = await A.oilRow(p, id)
  const picRow = await P(p, name + '-tracker')
  await A.closeOil(p)
  const rec = await p.evaluate(([i, d]) => { try { const st = window.lwState ? window.lwState() : null; const w = st && st.wars && st.wars[0]; const l = w && w.recs && w.recs[i] && w.recs[i][d]; return l ? l.filter(r => r.oil === 'auto').map(r => `${r.code} ${(r.spans || []).map(s => s.join('-')).join(',')}`).join(' | ') : '' } catch (e) { return 'n/a' } }, [id, iso])
  const bal = (/(-?[\d.]+)\s+left/.exec(rowTxt) || [])[1]
  return { cell, letters: letters(cell), row: rowTxt, rec, bal, pics: [picCell, picRow] }
}
/* the tracker row line that holds a given date (e.g. "18 Jul") — plain text of the row */
export const rowHas = (o, re) => re.test(o.row || '')

/* ---- the day: pending chip (the right read), sign-offs, version tag, and the To go out list ---- */
export async function dayState(p, di, name, { list = true } = {}) {
  await A.toWeek(p); await W.showDay(p, di)
  const head = await A.dayHead(p, di)
  head.pending = await p.evaluate(i => { const c = document.querySelector(`#eWeek .day[data-day="${i}"] .dpend:not(.dnew):not(.dchg)`); return c && c.offsetParent !== null ? c.innerText.replace(/\s+/g, ' ').trim() : '' }, di)
  const picHead = await P(p, name + '-day')
  let lst = ''
  const chip = p.locator(`#eWeek .day[data-day="${di}"] .dpend:not(.dnew):not(.dchg)`).first()
  if (list && await chip.count() && await chip.isVisible()) {
    await chip.click(); await sleep(600)
    const tab = p.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first()
    if (await tab.count()) { await tab.click(); await sleep(300) }
    lst = await p.evaluate(() => { const e = document.querySelector('.chgwin:not([hidden]) .pl-list') || document.querySelector('.pl-list'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(no list drawn)' })
    const picList = await P(p, name + '-togoout')
    const x = p.locator('.chgwin:not([hidden]) .win-x').first()
    if (await x.count()) { await x.click().catch(() => {}); await sleep(300) } else { await p.keyboard.press('Escape'); await sleep(300) }
    return { head, list: lst, pics: [picHead, picList] }
  }
  return { head, list: lst, pics: [picHead] }
}
export const pend = h => (/\d+/.exec((h && h.pending) || '') || ['0'])[0]
export const signsOf = h => (h && h.signs ? (W.signsEmpty(h) ? 'all four empty' : W.signsFull(h) ? 'all four standing' : 'some: ' + h.signs.join('|')) : '?')

/* ---- the published face (View-only Sched), the man's puck ---- */
export async function face(p, di, id) {
  await A.toWeek(p); await L.go(p, 'viewsched'); await sleep(500); await W.showDay(p, di, '#vWeek')
  const r = await p.evaluate(([i, who]) => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (!d) return null
    const pk = [...d.querySelectorAll(`[data-person="${who}"]`)].filter(e => e.offsetParent !== null)
    return { tag: (d.querySelector('.verchip') || {}).innerText || '', pucks: pk.map(e => (e.className.match(/oilbar-(fo|ho)/) || [])[0] || (e.className.includes('oilbar') ? 'oilbar' : 'none')) } }, [di, id])
  const f = await P(p, 'face-' + id)
  await L.go(p, 'editsched'); await sleep(300)
  return { ...r, pic: f }
}

/* ---- fixtures ---- */
/* an SC / AVALON / BB wave through + Wave and its menu */
export async function standbyWave(p, di, kind) { return R.addStandby(p, di, kind) }
export async function flyingWave(p, di, o) { return A.addFlyingWave(p, di, o) }
/* the OIL Earn mode's own button (#sbOil) */
export async function oilMode(p, on) { return O.oilMode(p, on) }
export async function switches(p) {
  return p.evaluate(() => [...document.querySelectorAll('#schedBoard .oilitem')].filter(e => e.offsetParent !== null).map(e => ({ txt: (e.innerText || '').trim().slice(0, 40), item: e.dataset.oilitem || '', who: e.dataset.oilp || '', cls: String(e.className).slice(0, 80), title: (e.getAttribute('title') || '').slice(0, 140) })))
}
/* the green edge of a man's pucks on the open board */
export async function boardBars(p, id) {
  return p.evaluate(who => [...document.querySelectorAll(`#schedBoard .puck[data-person="${who}"]`)].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => (e.className.match(/oilbar-(fo|ho)|oilbar\S*/g) || ['none']).join(' ') + (e.className.includes('oiloff') ? ' OFF' : '') + ' | ' + (e.getAttribute('title') || '').slice(0, 90)), id)
}
export async function pageText(p, sel = 'body') { return p.evaluate(s => (document.querySelector(s) || document.body).innerText.replace(/\s+/g, ' ').trim(), sel) }
export async function toast(p) { return p.evaluate(() => { const el = document.getElementById('toastEl'); return el && (el.textContent || '').trim() && getComputedStyle(el).opacity !== '0' ? el.textContent.trim() : null }) }

export const errs = []
export function cleanErr(errors) { return errors.filter(e => !/favicon/i.test(e)) }
