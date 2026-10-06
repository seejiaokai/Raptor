/* [OIL-WORK-START] walk — walker B's shared helpers (reporting lines and where the day starts).
   Everything a step DOES goes through the app's own controls; window.* is only READ. Stands on stk-A-lib. */
import * as S from './stk-A-lib.mjs'
import { handPut } from './seat-lib.mjs'
export * from './stk-A-lib.mjs'
export { handPut }
const { world, pic, judge, row, savePart, sleep, L, W } = S
export const DEBUG = !!process.env.OWS_DEBUG

/* a short label of one run (the table's "what I did") */
export const letters = c => (/\b(HO|FO)\b/.exec((c && c.text) || '') || [])[1] || ((c && c.text) || 'none').slice(0, 20) || 'none'
export const balOf = r => { const m = /^\S+\s+\S+\s+(-?[\d.]+)/.exec(r || ''); return m ? m[1] : null }
export const hrs = (h, n = 'Ranger') => h ? JSON.stringify({ [n]: h.hours[n], bar: h.hoursW && h.hoursW[n], tip: h.days && h.days[n] }) : null
export const worked = r => { const m = /((?:\d\d:\d\d.\d\d:\d\d[, ]*)+)/.exec(r || ''); return m ? m[1].trim() : null }

/* the Leave War cell, the tracker row (its worked times, its balance), pictured; the record as the war holds it */
export async function oilOf(p, id, iso, name, { pics = true } = {}) {
  await S.lwOpenMonth(p, 'JUL')
  const cell = await S.lwCellOf(p, id, iso)
  await p.evaluate(([i, d]) => { const c = document.querySelector(`[data-testid="cell-${i}-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, [id, iso]); await sleep(250)
  const picCell = pics ? await pic(p, name + '-cell') : null
  const rowTxt = await S.oilRow(p, id)
  const picRow = pics ? await pic(p, name + '-tracker') : null
  await S.closeOil(p)
  const rec = await p.evaluate(([i, d]) => { try { const st = window.lwState ? window.lwState() : null; const w = st && st.wars && st.wars[0]; const l = w && w.recs && w.recs[i] && w.recs[i][d]; return l ? l.filter(r => r.oil === 'auto').map(r => `${r.code} ${(r.spans || []).map(s => s.join('-')).join(',')}`).join(' | ') : '' } catch (e) { return 'n/a' } }, [id, iso])
  return { cell, letters: letters(cell), row: rowTxt, bal: balOf(rowTxt), worked: worked(rowTxt), rec, pics: [picCell, picRow].filter(Boolean) }
}
/* the baseline: the man's balance in the tracker BEFORE anything is published */
export async function baseline(p, id) {
  const r = await S.oilRow(p, id); await S.closeOil(p)
  return { row: r, bal: balOf(r) }
}

/* the pending chip (the waiting-to-go-out one only), the To go out list's words, the day head */
export async function dayState(p, di, name, { list = true } = {}) {
  await S.toWeek(p); await W.showDay(p, di)
  const head = await S.dayHead(p, di)
  head.pending = await p.evaluate(i => { const c = document.querySelector(`#eWeek .day[data-day="${i}"] .dpend:not(.dnew):not(.dchg)`); return c && c.offsetParent !== null ? c.innerText.replace(/\s+/g, ' ').trim() : '' }, di)
  const picHead = await pic(p, name + '-day')
  let lst = ''
  const pics = [picHead]
  const chip = p.locator(`#eWeek .day[data-day="${di}"] .dpend:not(.dnew):not(.dchg)`).first()
  if (list && await chip.count() && await chip.isVisible()) {
    await chip.click(); await sleep(600)
    lst = await p.evaluate(() => { const e = document.querySelector('.pl-list'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(no list drawn)' })
    pics.push(await pic(p, name + '-togoout'))
    const x = p.locator('[data-chgclose]:visible, .chgwin [aria-label="Close"]:visible, .chgwin .win-x:visible').first()
    if (await x.count()) { await x.click().catch(() => {}); await sleep(300) } else { await p.keyboard.press('Escape'); await sleep(300) }
  }
  return { head, list: lst, pics, pend: (/\d+/.exec(head.pending || '') || ['0'])[0] }
}
/* sign-offs: on a PUBLISHED day the signed line stands and a "Not yet signed" mark means they fell (the four selects are the next
   amendment's, empty either way); on an unpublished day the four selects themselves carry the names */
const isPub = h => !!h && /ORIG|AL\s*\d/.test(h.tag || '')
export const signsStand = h => isPub(h) ? !h.nys : S.W.signsFull(h)
export const signsFall = h => isPub(h) ? !!h.nys : S.W.signsEmpty(h)
export const signsWord = h => isPub(h) ? (h.nys ? 'fallen ("' + h.nys + '")' : 'stand (' + (h.signed || '').slice(0, 60) + ')') : (S.W.signsFull(h) ? 'four names' : S.W.signsEmpty(h) ? 'none' : 'some')

/* ---- the fixture, through the controls ---- */
/* a flying wave on the board with ONE line (callsign, take-off, landing) and a man seated through the crew list */
export async function flight(p, di, { cs = 'VIPER', to = '12:00', ld = '13:00', p1 = 'bane', w1 } = {}) {
  const w = await S.addFlyingWave(p, di, { cs, to, ld, p1, w1 })
  return w
}
/* + In-time / Rally, then the line's own text box (the board is up) */
export async function itLine(p, di, wi, text, { ix = 0, press = true } = {}) {
  if (press) await S.addItBtn(p, di, wi)
  const first = await S.intimes(p, di, wi)
  await S.setItLine(p, di, wi, ix, text)
  const after = await S.intimes(p, di, wi)
  return { first, after }
}
/* a second (third...) line of the last wave: + Line, then its own boxes and its seat */
export async function addLine(p, di, gi) {
  const b = p.locator(`#schedBoard [data-gline="${di}.${gi}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500)
}
export async function lineBoxes(p, di, gi, fi, { cs, to, ld, p1 }) {
  const t = (f, v) => W.boardText(p, `ff:${di}.${gi}.${fi}.${f}`, v)
  if (cs) await t('cs', cs); if (to) await t('to', to); if (ld) await t('ld', ld)
  if (p1) return handPut(p, `${di}.${gi}.${fi}.0.p`, p1)
}
/* what the box and the day say about the reporting lines, as painted (board up) */
export async function feedbackText(p, di, gi) {
  return p.evaluate(([d, g]) => [...document.querySelectorAll('#schedBoard [data-reporting-feedback]')].filter(e => e.offsetParent !== null).map(e => e.textContent.replace(/\s+/g, ' ').trim()), [di, gi])
}
/* the day's warning words about the reporting lines (read only) */
export async function warnWords(p, di) {
  return p.evaluate(i => ((window.WARN.byDay[i] || {}).warns || []).filter(w => /in-?time|rally|report/i.test(String(w.msg || '') + ' ' + String(w.code || ''))).map(w => `${w.sev}/${w.code}: ${String(w.msg).slice(0, 140)}`), di)
}
export const stamp = (...a) => a.filter(x => x != null && x !== '').join(' · ')

/* the table row for one oil read: cell, worked, balance, and the day */
export function sayOil(o, base) { return `cell ${o.letters} · worked ${o.worked || '—'} · balance ${o.bal}${base != null ? ` (was ${base})` : ''}` }
export { judge, row, savePart, sleep, pic, world, L, W }

/* ---- one fixture, start to finish: a fresh world, the wave, the reporting lines, publish, read ---- */
export async function addLines(p, di, wi, texts) {
  const trace = []
  for (let i = 0; i < texts.length; i++) {
    await S.addItBtn(p, di, wi)
    const lines = await S.intimes(p, di, wi)
    trace.push(lines.length)
    if (lines.length <= i) { trace.push('no new line after press ' + (i + 1)); continue }
    await S.setItLine(p, di, wi, i, texts[i])
  }
  return { trace, lines: await S.intimes(p, di, wi) }
}
/* spec: { to, ld, p1, w1, cs, di, iso, lines: [...], publish: true } -> everything the screen said */
export async function runCase(name, spec = {}) {
  const { to = '12:00', ld = '13:00', p1 = 'bane', w1, cs = 'VIPER', di = 5, iso = S.SAT, lines = [], pub = true, phone = false, keepWorld = false } = spec
  const wd = await world({ phone })
  const { p, errors, browser } = wd
  const out = { p, errors, browser, name, di, iso, p1 }
  out.base = await baseline(p, p1)
  await S.L.go(p, 'editsched'); await sleep(300)
  out.w = await flight(p, di, { cs, to, ld, p1, w1 })
  out.add = lines.length ? await addLines(p, di, out.w.wi, lines) : { trace: [], lines: [] }
  out.fb = await feedbackText(p, di, out.w.wi)
  out.warns = await warnWords(p, di)
  out.pre = await pic(p, name + '-board')
  if (pub) { out.pubr = await S.publishNew(p, di); await S.closeBoard(p); out.o = await oilOf(p, p1, iso, name + '-pub') ; out.d = await dayState(p, di, name + '-day', { list: false }) }
  else await S.closeBoard(p)
  if (!keepWorld) await browser.close()
  return out
}
