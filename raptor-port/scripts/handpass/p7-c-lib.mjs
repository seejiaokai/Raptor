/* [DB-READINESS] phase 7 walk — walker C's shared helpers (1 Oct 26). On top of p6-lib (the world at the fixed date),
   dbrA-lib (rows, reloadCompare) and dbrA-W1-lib (the board, the drag, sign and publish). Everything a step DOES goes
   through the app's own controls; window.* is read only to record what the app holds. */
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
export const TABLE = []
export const errorsAll = []
/* one row of the walker's table */
export function row(id, did, said, stored, verdict, pics = []) {
  TABLE.push({ id, did, said, stored, verdict, pics })
  console.log(`== ${verdict}  ${id} — ${did}\n     screen: ${String(said).slice(0, 400)}\n     stored: ${String(stored).slice(0, 400)}`)
}
/* the part file is shared by several scripts: each merges its own part under its name */
export function savePart(name, extra = {}) {
  const OUT = process.env.HP_OUT
  let all = {}
  if (existsSync(OUT)) { try { all = JSON.parse(readFileSync(OUT, 'utf8')) } catch { all = {} } }
  if (!all.parts) all = { parts: {} }
  all.parts[name] = { at: new Date().toISOString(), base: process.env.HP_URL, table: TABLE, ...extra }
  writeFileSync(OUT, JSON.stringify(all, null, 1))
  console.log(`saved part ${name} → ${OUT}`)
}
/* the toast, recorded as it is painted (text set or changed while it is not faded out) */
export async function toastSpy(p) {
  await p.evaluate(() => {
    if (window.__c7) return
    window.__c7 = []
    /* every toast() call sets the element's text afresh (a childList change on the toast itself), the same words or not */
    const hook = el => new MutationObserver(ms => { if (ms.some(m => m.type === 'childList')) window.__c7.push((el.textContent || '').trim()) }).observe(el, { childList: true })
    const el = document.getElementById('toastEl')
    if (el) hook(el)
    else { const o = new MutationObserver(() => { const e = document.getElementById('toastEl'); if (e) { o.disconnect(); window.__c7.push((e.textContent || '').trim()); hook(e) } }); o.observe(document.body, { childList: true }) }
  }).catch(() => {})
}
export async function toasts(p) { return p.evaluate(() => { const a = window.__c7 || []; window.__c7 = []; return a }).catch(() => []) }
/* the toast as it stands on screen now: its words and whether it is painted (opacity) */
export async function toastNow(p) {
  return p.evaluate(() => { const el = document.getElementById('toastEl'); if (!el) return null; const cs = getComputedStyle(el); return { text: (el.textContent || '').trim(), opacity: cs.opacity, shown: cs.opacity !== '0' && cs.visibility !== 'hidden' && el.offsetWidth > 0 } })
}
/* what the app holds about a set of seats, the day's pending state and the Undo list — read, never written */
export async function snap(p, di, keys) {
  return p.evaluate(([di, keys]) => {
    const vis = e => !!e && e.offsetParent !== null
    const where = h => h.closest('#schedBoard') ? 'board' : h.closest('#eWeek') ? 'eweek' : h.closest('#vWeek') ? 'vweek' : '?'
    const seats = {}
    for (const k of keys) {
      const hosts = [...document.querySelectorAll(`[data-slot="${k}"]`)].filter(vis)
      let val; try { val = window.slotVal(k) } catch (e) { val = 'ERR ' + e.message }
      seats[k] = { val: val == null ? '' : val, dom: hosts.map(h => where(h) + ':' + ([...h.querySelectorAll('[data-person]')].map(e => e.dataset.person).filter((x, i, a) => a.indexOf(x) === i).join('+') || '(empty) ' + (h.innerText || '').trim())) }
    }
    const S = window.SCHED || {}
    const pend = Object.keys(S.pending || {}).sort()
    const undo = ['#sbUndo', '#undoBtn'].map(s => { const b = document.querySelector(s); return b && vis(b) ? `${s}:${b.disabled ? 'off' : 'on'}:${b.title}` : null }).filter(Boolean)
    const b = document.querySelector('#schedBoard')
    const scope = b && b.offsetWidth ? b : document.querySelector(`#eWeek .day[data-day="${di}"]`)
    const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    const head = scope ? { tag: t(scope.querySelector('.verchip')), pending: t(scope.querySelector('.dpend')), signs: [...scope.querySelectorAll(`select[data-sign][data-signday="${di}"]`)].map(s => s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : ''), nys: t(scope.querySelector('.nysmark')) } : null
    return { seats, pending: pend, pendingDay: pend.filter(k => new RegExp('^([a-z]+:)?' + di + '\\.').test(k)), changes: JSON.stringify(S.changes || null).length, hist: { ix: window.HIST.ix, n: window.HIST.stack.length }, elog: (window.ELOG.rows || []).length, undo, head,
      marks: scope ? scope.querySelectorAll('[data-alp],[data-aln]').length : null }
  }, [di, keys])
}
/* two snaps compared: every difference named */
export function same(a, b) {
  const out = []
  const j = x => JSON.stringify(x)
  for (const k of Object.keys(a.seats)) if (j(a.seats[k]) !== j(b.seats[k])) out.push(`seat ${k}: ${j(a.seats[k])} → ${j(b.seats[k])}`)
  if (j(a.pending) !== j(b.pending)) out.push(`pending marks: ${a.pending.length} → ${b.pending.length} (${b.pending.filter(k => !a.pending.includes(k)).join(', ')})`)
  if (a.changes !== b.changes) out.push(`the day's changes list changed size ${a.changes} → ${b.changes}`)
  if (j(a.hist) !== j(b.hist)) out.push(`Undo list: ${j(a.hist)} → ${j(b.hist)}`)
  if (a.elog !== b.elog) out.push(`change history lines: ${a.elog} → ${b.elog}`)
  if (j(a.undo) !== j(b.undo)) out.push(`Undo button: ${j(a.undo)} → ${j(b.undo)}`)
  if (j(a.head) !== j(b.head)) out.push(`day head: ${j(a.head)} → ${j(b.head)}`)
  if (a.marks !== b.marks) out.push(`amendment marks drawn: ${a.marks} → ${b.marks}`)
  return out
}
/* the saved rows compared (nothing may be written by a refused gesture) */
export function rowsSame(L, r1, r2) {
  const d = L.diff(r1, r2)
  return [...d.put.map(k => 'put ' + k), ...d.del.map(k => 'del ' + k), ...d.newBatches.map(k => 'batch ' + k)]
}
