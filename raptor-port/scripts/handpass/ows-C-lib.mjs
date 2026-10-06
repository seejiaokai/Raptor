/* [OIL-WORK-START] walker C — shared helpers (6 Oct 26). On top of stk-A-lib / rbl-D-lib / rbl-C-lib / dbrA-W3-lib / wh-b-lib.
   Every fixture goes through the app's own controls; window.* is read only (and to get to a place). */
import * as S from './stk-A-lib.mjs'
import * as R from './rbl-D-lib.mjs'
import * as RC from './rbl-C-lib.mjs'
import * as LW from './dbrA-W3-lib.mjs'
import * as WB from './wh-b-lib.mjs'
export { S, R, RC, LW, WB }
export const { world, reloadAs, pic, row, judge, savePart, TABLE, L, W, sleep, SAT, SUN } = S
export const PHONE = !!process.env.HP_PHONE
export const SATI = 5, SUNI = 6, MONI = 0, TUEI = 1
const letters = c => (/\b(HO|FO)\b/.exec((c && c.text) || '') || [])[1] || ((c && c.text) || '(' + String(c) + ')')

/* ---------- the OIL tracker's policy: forever (scenario file, shared setup) ---------- */
export async function expiryForever(p) {
  await S.lwOpenMonth(p, 'JUL')
  await p.locator('[data-testid="oil-tracker"]:visible').first().click(); await sleep(900)
  const g = p.locator('[data-testid="oil-settings"]:visible').first()
  let said = 'no gear'
  if (await g.count()) {
    await g.click(); await sleep(500)
    const f = p.locator('[data-testid="oil-exp-forever"]:visible').first()
    if (await f.count()) { const on = await f.evaluate(e => e.classList.contains('on')); if (!on) { await f.click(); await sleep(400) } said = 'forever' + (on ? ' (already)' : ' (set)') }
    const done = p.locator('[data-testid="oil-settings-done"]:visible').first(); if (await done.count()) { await done.click(); await sleep(300) }
  }
  await S.closeOil(p)
  return said
}

/* ---------- reading the three downstream numbers ---------- */
export const balOf = txt => { const m = /(-?\d+(?:\.\d+)?)\s*(?:left)?\s*$/.exec(txt || ''); return m ? m[1] : null }
/* the Leave War cell + the worked times (tracker row, and the day's sheet when the cell is opened) + the balance.
   `sheet:false` skips opening the cell. Returns { cell, letters, row, bal, sheet, pics } */
export async function oilOf(p, id, iso, name, { sheet = true, pics = true } = {}) {
  await S.lwOpenMonth(p, 'JUL')
  const cell = await S.lwCellOf(p, id, iso)
  await p.evaluate(([i, d]) => { const c = document.querySelector(`[data-testid="cell-${i}-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, [id, iso]); await sleep(300)
  const out = { cell, letters: letters(cell), pics: [] }
  if (pics) out.pics.push(await pic(p, name + '-cell'))
  if (sheet) {
    const t = await LW.tapCell(p, id, iso)
    out.sheet = { open: t.open, text: (t.text || '').slice(0, 700), lines: t.lines || [] }
    if (pics) out.pics.push(await pic(p, name + '-sheet'))
    await LW.closeSheets(p)
  }
  out.row = await S.oilRow(p, id)
  out.archived = false
  /* a used-up credit is filed in the archive column: open it and read the row again (the app's own toggle) */
  if (!/AUTO/.test(out.row)) {
    const arch = p.locator('[data-testid="oil-arch-' + id + '"]').first()
    const n = await arch.evaluate(e => (e.innerText || '').trim()).catch(() => '')
    if (/^\d+$/.test(n)) { await arch.click(); await sleep(700); out.archived = true; out.row = (await p.evaluate(i => { const e = document.querySelector('[data-testid="oil-row-' + i + '"]'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : 'NO ROW' }, id)) + ' [ARCHIVE OPENED]' }
  }
  out.bal = await p.evaluate(i => { const e = document.querySelector(`[data-testid="oil-bal-${i}"]`); return e ? e.innerText.trim() : null }, id)
  if (pics) out.pics.push(await pic(p, name + '-tracker'))
  /* the credit's stored worked spans (read only): a second reading of the same thing the sheet and the row print */
  out.rec = await p.evaluate(([i, d]) => { try { const st = window.lwState ? window.lwState() : null; const w = st && st.wars && st.wars[0]; const l = w && w.recs && w.recs[i] && w.recs[i][d]; return l ? l.filter(r => r.oil === 'auto').map(r => `${r.code} ${(r.spans || []).map(s => s.join('-')).join(',')}`).join(' | ') : '' } catch (e) { return 'n/a' } }, [id, iso])
  await S.closeOil(p)
  return out
}
/* just the tracker row line for a man's date: the part of his row text that names the date */
export const rowFor = (row, dateWord) => { const i = row.indexOf(dateWord); return i < 0 ? row.slice(0, 220) : row.slice(Math.max(0, i - 40), i + 140) }

/* the day: head, the WAITING-TO-GO-OUT chip only, the To go out list, the Amendments box */
export const pendOf = h => (/\d+/.exec((h && h.pending) || '') || ['0'])[0]
export async function dayState(p, di, name, { list = true, noPic = false } = {}) {
  await S.toWeek(p); await W.showDay(p, di)
  const head = await S.dayHead(p, di)
  head.pending = await p.evaluate(i => { const c = document.querySelector(`#eWeek .day[data-day="${i}"] .dpend:not(.dnew):not(.dchg)`); return c && c.offsetParent !== null ? c.innerText.replace(/\s+/g, ' ').trim() : '' }, di)
  const pics = noPic ? [] : [await pic(p, name + '-day')]
  let lst = ''
  if (list) {
    const chip = p.locator(`#eWeek .day[data-day="${di}"] .dpend:not(.dnew):not(.dchg)`).first()
    if (await chip.count() && await chip.isVisible()) {
      await chip.click(); await sleep(600)
      const tab = p.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first(); if (await tab.count()) { await tab.click(); await sleep(300) }
      lst = await p.evaluate(() => { const e = document.querySelector('.pl-list'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(no list drawn)' })
      if (!noPic) pics.push(await pic(p, name + '-togoout'))
      const x = p.locator('.chgwin:not([hidden]) .win-x').first()
      if (await x.count()) { await x.click().catch(() => {}); await sleep(300) } else { await p.keyboard.press('Escape'); await sleep(300) }
    }
  }
  return { head, list: lst, pics, signsEmpty: W.signsEmpty(head), signsFull: W.signsFull(head) }
}
export async function amendments(p) {
  await S.toWeek(p)
  return S.alPanel(p)
}

/* the Edit Schedule day's version tag */
export const tagOf = h => (h && h.tag) || ''

/* a toast, as the app spoke it (kept by a recorder in the page) */
export async function spyOn(p) { await W.toastSpy(p) }
export async function spoken(p) { return W.toasts(p) }

/* ---------- fixtures ---------- */
/* a duty desk row through the board's "+ Row" and its boxes, the man put in through the crew list */
export async function dutyRow(p, di, name, from, to, who) { return R.addRow(p, 'duty', di, name, from, to, who) }
/* a flying wave: callsign, take-off, landing, one man in the front seat; returns { wi, got } */
export async function flyWave(p, di, o) { return S.addFlyingWave(p, di, o) }
/* an In-time line typed through the wave's "+ In-time / Rally" and its box */
export async function inTime(p, di, wi, text) {
  await S.toBoard(p, di); await S.addItBtn(p, di, wi); await S.setItLine(p, di, wi, 0, text)
  return S.intimes(p, di, wi)
}
export async function inTimeChange(p, di, wi, ix, text) { await S.toBoard(p, di); await S.setItLine(p, di, wi, ix, text); return S.intimes(p, di, wi) }
export async function inTimeDel(p, di, wi, ix) { await WB.itDel(p, 'board', di, wi, ix); return S.intimes(p, di, wi) }
export const lines = (p, di, wi) => S.intimes(p, di, wi)

/* sign + publish helpers returning the head */
export async function pubOrig(p, di) { const r = await S.publishNew(p, di); await S.closeBoard(p); return r }
export async function pubAL(p, di) { const r = await S.publishAm(p, di); await S.closeBoard(p); return r }

/* Unpublish through the day's own button (two taps when it arms); returns what the app said (the toasts) */
export async function unpublish(p, di) {
  await S.toWeek(p); await W.showDay(p, di)
  await spyOn(p); await p.evaluate(() => { window.__w1toast = [] })
  const btn = p.locator(`#eWeek [data-unpub="${di}"]:visible`).first()
  if (!(await btn.count())) return { pressed: false, why: 'no Unpublish button', toasts: [] }
  const t0 = (await btn.innerText()).trim()
  await btn.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await btn.click(); await sleep(900)
  const t1 = await spoken(p)
  const armed = p.locator(`#eWeek [data-unpub="${di}"]:visible`).first()
  const label1 = (await armed.count()) ? (await armed.innerText()).trim() : ''
  let t2 = [], second = false
  if (/confirm|again|sure/i.test(label1) || (t1.join(' ') && /Tap again to confirm/i.test(t1.join(' ')))) {
    await armed.click(); await sleep(900); second = true; t2 = await spoken(p)
  }
  return { pressed: true, first: t0, afterFirst: label1, second, toasts: [...t1, ...t2], firstToasts: t1, secondToasts: t2 }
}

/* the Logic page's value (read) */
export const logic = p => S.logicGet(p)

/* the whole picture, in words, for one man and date: cell · row · balance · sheet · the day */
export function say(o, d) {
  return `cell "${o.cell && o.cell.text}" · tracker "${(o.row || '').slice(0, 150)}" · balance ${o.bal} · sheet "${((o.sheet && o.sheet.text) || '').slice(0, 200)}"` + (d ? ` · day tag "${d.head.tag}" chip "${d.head.pending}" signs [${(d.head.signs || []).join('|')}]${d.list ? ' · To go out: ' + d.list.slice(0, 400) : ''}` : '')
}
export function finish(browser, errors, name) {
  const e = errors.filter(x => !/favicon/i.test(x))
  console.log('ERRORS', JSON.stringify(e))
  savePart(name, { errors: e })
  return browser.close()
}
