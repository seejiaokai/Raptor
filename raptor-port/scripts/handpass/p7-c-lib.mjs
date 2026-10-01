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

/* wait until the last toast has faded, so a picture never shows an earlier step's words */
export async function toastGone(p, max = 14000) {
  const t0 = Date.now()
  while (Date.now() - t0 < max) { const t = await toastNow(p); if (!t || !t.shown) return true; await p.waitForTimeout(250) }
  return false
}
export const REASON = /cannot crew a jet; name the people flying it/
/* ONE DOOR ATTEMPT, judged the same way every time: the reason painted; the seats, the pending marks, the day head, the
   Undo list and button, the change history and every saved row as they were. `needReason:false` = a gesture the app does
   not treat as a placement at all (nothing may happen, and nothing need be said). */
export function makeAttempt({ L, p, di, keys }) {
  return async function attempt(id, did, fn, { needReason = true } = {}) {
    const mine = []
    await toastGone(p)
    const s1 = await snap(p, di, keys), r1 = await L.rows(p); await toasts(p)
    let err = null, ret = null
    try { ret = await fn(async n => { await L.shot(p, n); mine.push(n + '.png') }) } catch (e) { err = String(e && e.message || e).split('\n')[0].slice(0, 300) }
    const now = await toastNow(p)
    await L.shot(p, id); mine.push(id + '.png')
    await L.settle(p, 700)
    const ts = await toasts(p)
    const s2 = await snap(p, di, keys), r2 = await L.rows(p)
    const d = same(s1, s2), rd = rowsSame(L, r1, r2)
    const reason = ts.filter(t => REASON.test(t))
    const ok = !err && !d.length && !rd.length && (reason.length > 0 || !needReason)
    row(id, did,
      err ? 'GESTURE ERROR: ' + err : `toast: ${ts.map(t => '"' + t + '"').join(' · ') || '(none — the app did nothing)'}${now && now.shown && ts.length ? ' (painted in the picture)' : ''}${ret && ret.note ? ' · ' + ret.note : ''}`,
      d.length || rd.length ? `CHANGED: ${[...d, ...rd].join(' | ')}` : `seats as they were (${Object.entries(s2.seats).filter(([k]) => /^\d/.test(k)).map(([k, v]) => k + '=' + (v.val || 'empty')).join(', ')}); pending marks ${s2.pendingDay.length} = before; day head "${s2.head ? s2.head.tag + ' ' + s2.head.pending : ''}"; Undo list ${s2.hist.ix}/${s2.hist.n} = before; change history ${s2.elog} lines = before; no row written`,
      ok ? 'PASS' : 'FAIL', mine)
    await p.keyboard.press('Escape'); await L.sleep(200)
    return { ok, d, rd, ts, ret }
  }
}

/* ---------- the ALL AVAIL count chip and its window, as a person reads them (C34, C35) ---------- */
/* every count chip PAINTED inside a scope */
export async function chips(p, scope) {
  return p.evaluate(s => {
    const root = document.querySelector(s); if (!root) return []
    return [...root.querySelectorAll('.oilcount')].map(e => {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e)
      return { txt: (e.innerText || '').trim(), title: e.getAttribute('title') || '', ver: e.dataset.oilver || '', item: e.dataset.oilsent || '',
        painted: r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05 && e.offsetParent !== null }
    }).filter(c => c.painted)
  }, scope)
}
/* the open ALL AVAIL window */
export async function win(p) {
  return p.evaluate(() => {
    const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden && (x.offsetWidth || x.offsetHeight))
    if (!w) return { open: false }
    const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    const r = w.getBoundingClientRect()
    const men = [...w.querySelectorAll('[data-awp]')].map(x => { const seat = x.querySelector('.seat'); const why = x.querySelector('.rwhy'); const wr = why ? why.getBoundingClientRect() : null
      return { id: x.dataset.awp, cs: (window.PEOPLE[x.dataset.awp] || {}).cs || x.dataset.awp, cls: x.className.replace('rpuck', '').trim(), seatCls: seat ? seat.className : '', why: t(why),
        whyOnScreen: wr ? wr.width > 4 && wr.height > 4 : null } })
    return { open: true, title: t(w.querySelector('.win-ttl')), tabs: [...w.querySelectorAll('.win-tab')].map(x => t(x) + (x.classList.contains('on') ? ' [on]' : '')), one: t(w.querySelector('.win-one')),
      from: t(w.querySelector('.win-from')), foot: t(w.querySelector('.win-foot')), n: men.length, ids: men.map(m => m.id), men,
      flagged: men.filter(m => m.why || /clash|flag|warn/.test(m.cls)).map(m => m.cs + ': ' + m.why), earnControls: men.filter(m => /oilpk/.test(m.seatCls)).length,
      rect: { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height), viewport: innerWidth + 'x' + innerHeight } }
  })
}
export async function closeWin(p) { const x = p.locator('.availwin:not([hidden]) .win-x:visible').first(); if (await x.count()) { await x.click().catch(() => {}); await p.waitForTimeout(300) } }
/* tap the first painted chip inside a scope; returns the window */
export async function openChip(p, scope, { touch = false } = {}) {
  await closeWin(p)
  const c = p.locator(`${scope} .oilcount:visible`).first()
  if (!(await c.count())) return { open: false, why: 'NO CHIP to tap in ' + scope }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await p.waitForTimeout(300)
  try { if (touch) await c.tap({ timeout: 3000 }); else await c.click({ timeout: 3000 }) } catch (e) { const b = await c.boundingBox(); if (b) { if (touch) await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) } }
  await p.waitForTimeout(600)
  return win(p)
}
