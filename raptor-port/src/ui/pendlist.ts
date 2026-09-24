/* THE PENDING LIST (owner, D99 + D100, 25 Sep 26 — "can u work on having a clickable pending button to show what
   is currently pending? so that the scheduler dont need to search everywhere. And if they click on that area, it
   brings the view to that pending area"; the mock-up docs/mock/pending-list.html, approved "look and function",
   with his addition that a long list scrolls inside the window).

   "N pending ▾" on a published day's head (the edit week and the scheduler board — html.ts dayStatHTML) opens this:
   what will go out as the day's next AL, one row per change — where, before → after, who and when — and a tap on a
   row takes the view to it (interactions.ts jumpToChange, the ONE "take me to this change", D107).

   ONE BODY: the rows ARE engine/publish.ts dayPendingItems — the same items "N pending" counts (D109), so the list
   and the number can never disagree. It is the NET difference from the published version (AM20): a change made and
   put back is not on it.

   WHO / WHEN (D104): the newest edit-log row for the change's own cells — the shared account the app records today
   ("Admin" / "Member"; a callsign waits for personal accounts at the database step) and its clock. The edit log is
   kept only while the page is open (CLAUDE.md §What actually persists), so a change whose cell has no row reads
   "earlier"; a change that has no single cell (a row added, removed or reordered, a request's filing, what the day
   earns) names no who at all rather than guess one.

   ONE element at body level, like the History bubble (histbubble.ts): the day heads are string-built and swapped
   by the per-block repaint, which would throw a list hung inside them away mid-read. */
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { INPUTS, inpId, inpLabel } from '../engine/inputs'
import { dayPendingItems, daySnapOf, dayCurVer, nextSeq, MOVE_LABELS } from '../engine/publish'
import type { PendItem } from '../engine/publish'
import { ELOG, elogWhen, keyLabel } from '../engine/editlog'
import { oilEvidence } from '../engine/oilev'
import { esc } from '../state/view'

let box: HTMLDivElement | null = null
let openDi: number | null = null
let items: PendItem[] = []
/* the per-row places of a multi-row line (several placeholders' crowds), by "item.row" — read by the click */
let targets: Record<string, string[]> = {}
let off: (() => void) | null = null
export function pendListOpen() { return openDi }

const U = '␟'
const cs = (v: any) => { const s = String(v == null ? '' : v); return !s ? '' : (PEOPLE[s] ? PEOPLE[s].cs : s) }
const names = (a: any[] | undefined) => (a || []).map(cs).filter(Boolean).join(', ')

/* the name of a place a man stands (a live, positional address) — the row's own name, not the log's "Duty · …"
   prefix, so a move reads the way he said it: "Warden: MET + NOTAM BRIEF → SODB" (D109) */
function placeName(addr: string, days: any[] = DAYS): string {
  const s = String(addr || ''), c = s.indexOf(':'), p = c < 0 ? '' : s.slice(0, c), a = (c < 0 ? s : s.slice(c + 1)).split('.')
  /* a desk's or a ground row's extras line, a sim's passengers — a place of their own (D109's counting) */
  const extra = /\.x\d+$/.test(s) ? ' · extras' : /\.pax\./.test(s) ? ' · passengers' : ''
  try {
    const d: any = days[+a[0]!]
    if (!p) return keyLabel(s, days)
    if (p === 'd' || p === 'dr') return (d.dutywaves[+a[1]!].rows[+a[2]!].role || 'duty row') + extra
    if (p === 'g' || p === 'gr') return (d.ground[+a[1]!].prog || 'ground item') + extra
    if (p === 'a' || p === 'ap') return d.allhands[+a[1]!].prog || 'programme item'
    if (p === 's' || p === 'sr') {
      const r = d.sims[a[1]!][+a[2]!], base = `${String(a[1]).toUpperCase()} ${r.label || ''}`.trim()
      return a[3] === 'p' ? `${base} · FCP` : a[3] === 'w' ? `${base} · RCP` : base + extra
    }
  } catch (_) {}
  return keyLabel(s, days)
}
/* the issued day as a day list, for naming a row the live day no longer has */
function issuedDays(di: number): any[] | null {
  const snap: any = daySnapOf(di, dayCurVer(di)); if (!snap || !snap.d) return null
  const arr: any[] = []; arr[di] = snap.d; return arr
}
/* a stored value as a reader says it. The record keeps a row's state on its name field as one composite
   (restore.ts dayKeys: "name␟cx␟…"), so a cancelled row or a flag is spelled out rather than shown raw. */
function valueWords(addr: string, v: any): string {
  const s = String(v == null ? '' : v)
  if (!s) return ''
  const c = addr.indexOf(':'), p = c < 0 ? '' : addr.slice(0, c), fld = addr.split('.').pop()
  if (s.indexOf(U) >= 0) {
    const x = s.split(U), on = (i: number) => x[i] === '1'
    const cx = (i: number, r: number) => on(i) ? ` · CX${x[r] ? ` (${x[r]})` : ''}` : ''
    if (p === 'ap') return x[0] + cx(1, 2) + (on(3) ? ' · flagged' : '') + (on(4) ? ' · info only' : '')
    if (p === 'dr') return x[0] + cx(1, 3) + (on(2) ? ' · flagged' : '')
    if (p === 'gr') return x[0] + cx(1, 4) + (on(2) ? ' · flagged' : '') + (on(3) ? ' · info only' : '')
    if (p === 'sr') return x[0] + (x[1] ? ` · ${x[1]}` : '') + cx(2, 4) + (on(3) ? ' · flagged' : '')
    if (p === 'fr') return (x[0] || '(no remarks)') + cx(1, 2) + (on(3) ? ' · flagged' : '') + (x[4] ? ` · ${x[4]}` : '') + (on(5) ? ' · SPARE' : '')
    if (p === 'ff' && fld === 'cs') return x[0] + cx(1, 3) + (x[2] ? ` · ${x[2]}` : '')
    if (p === 'wl') return x[0] + (on(1) ? ' · night' : '')
    if (p === 'dl') return x[0] + (x[1] ? ` · ${x[1]}` : '')
    return x.filter(t => t && t !== '0' && t !== '1').join(' · ')
  }
  /* the JSON-held values: an area, a store load, the in-times, the traffic */
  if (s[0] === '[' || s[0] === '{' || s === 'null' || s[0] === '"') {
    try {
      const j = JSON.parse(s)
      if (j == null) return ''
      if (typeof j === 'string') return j
      if (Array.isArray(j)) return p === 'it' ? `${j.length} in-time${j.length === 1 ? '' : 's'}` : p === 'tr' ? `${j.length} traffic` : j.filter(Boolean).join(', ')
      return Object.keys(j).filter(k => j[k]).map(k => j[k] === true ? k : `${k} ${j[k]}`).join(', ')
    } catch (_) {}
  }
  return s
}
const FIL: any = { '': 'not on the programme', g: 'on the programme', u: 'under Unavailable', r: 'taken off' }

type Words = { where: string; from: string; to: string; who: string; when: string; jump: boolean }
/* the newest edit-log row among a change's own cells */
function lastEdit(keys: string[]) {
  const set = new Set(keys.map(String))
  for (let i = ELOG.rows.length - 1; i >= 0; i--) { const r = ELOG.rows[i]!; if (r.key && set.has(r.key)) return r }
  return null
}
export function pendItemWords(di: number, it: PendItem): Words {
  const e: any = it.entry || {}
  const byLog = (): { who: string; when: string } => {
    const r = lastEdit(it.keys || [])
    return r ? { who: r.who, when: elogWhen(r.t) } : { who: 'earlier', when: '' }
  }
  const none = { who: '', when: '' }
  const jump = !!(it.jump && it.jump.length)
  if (it.kind === 'reseat') {
    /* out of a row removed since: named from the issued day, where it still stands */
    const iss = !it.from && it.fromIssued ? issuedDays(di) : null
    const from = it.from ? placeName(it.from) : iss ? placeName(it.fromIssued!, iss) + ' (removed)' : ''
    return { where: cs(it.token) || 'Someone', from, to: placeName(it.to || ''), ...byLog(), jump }
  }
  if (it.kind === 'people')
    return it.order
      ? { where: placeName(it.place || ''), from: '', to: 'order changed', ...byLog(), jump }
      : { where: placeName(it.place || ''), from: names(it.off), to: names(it.on) || (it.off && it.off.length ? 'taken off' : ''), ...byLog(), jump }
  if (it.kind === 'change')
    return { where: keyLabel(it.addr || e.addr), from: valueWords(e.addr, e.from), to: valueWords(e.addr, e.to), ...byLog(), jump }
  if (it.kind === 'add')
    return { where: keyLabel(it.addr || e.addr), from: '', to: 'added', ...none, jump }
  if (it.kind === 'delete') {
    /* the row is gone from the live day: name it from the version it was removed from */
    const arr = issuedDays(di)
    return { where: arr ? keyLabel(e.addr, arr) : 'An item', from: '', to: 'removed', ...none, jump: false }
  }
  if (it.kind === 'move') {
    const k = String(e.addr || '').split('.').pop() || ''
    return { where: 'Order changed', from: '', to: MOVE_LABELS[k] ? `${MOVE_LABELS[k]}s` : 'rows', ...none, jump: false }
  }
  if (it.kind === 'input') {
    const id = decodeURIComponent(String(e.addr || '').split('.').slice(1).join('.'))
    const inp = INPUTS.find((x: any) => inpId(x) === id)
    const who = inp ? cs(inp.person) : ''
    return { where: inp ? `${who ? who + ' · ' : ''}${inpLabel(inp)}` : 'A request', from: FIL[e.from || ''] || '', to: FIL[e.to || ''] || '', ...none, jump: false }
  }
  /* WHAT THE DAY EARNS — say WHO and WHERE when it is the crowd behind a placeholder that moved (walker B1, 25 Sep 26:
     "What this day earns · changed" named nobody and could not be tapped, so the scheduler still had to go looking —
     the very hunt D99 exists to end). The issued version froze who each ALL / ALL AVAIL puck stood for (D44); the
     live evidence says who it stands for now; the difference names the row and the men. A change in the scheduler's
     own earning decisions keeps the plain wording. */
  const crowd = crowdChange(di)
  if (crowd && crowd.length === 1) return { ...crowd[0]!, ...none, jump: crowd[0]!.keys.length > 0 }
  /* several placeholders' crowds moved: still ONE change (what the day earns is one item, D109's count), but each row
     is named and reachable on its own line (Astra's code read, 25 Sep 26 — "+ N more" hid the rest) */
  if (crowd && crowd.length > 1) return { where: `${crowd.length} placeholders · who they stand for`, from: '', to: '', ...none, jump: false, rows: crowd } as any
  return { where: 'What this day earns', from: '', to: 'changed', ...none, jump: false }
}
/* the rows whose placeholder crowd differs from what the day went out with: its name, who left, who joined, and the
   row's cells to jump to */
type CrowdRow = { where: string, from: string, to: string, keys: string[] }
function crowdChange(di: number): CrowdRow[] | null {
  const snap: any = daySnapOf(di, dayCurVer(di)); if (!snap || !snap.d) return null
  const was: any = (snap.d.oilev && snap.d.oilev.sent) || {}, now: any = oilEvidence(di).sent || {}
  const diff = [...new Set([...Object.keys(was), ...Object.keys(now)])].map(item => {
    const a = new Set<string>(was[item] || []), b = new Set<string>(now[item] || [])
    return { item, off: [...a].filter(x => !b.has(x)), on: [...b].filter(x => !a.has(x)) }
  }).filter(x => x.off.length || x.on.length)
  if (!diff.length) return null
  const d: any = DAYS[di]
  return diff.map(x => {
    const row = rowByItem(d, di, x.item)
    return { where: (row ? row.name : 'A placeholder') + ' · who it stands for', from: names(x.off),
      to: x.on.length ? names(x.on) : 'no longer free', keys: row ? row.keys : [] }
  })
}
/* an OIL item key (`r:<row id>`) back to its row on the live day: the row's name and its cells, puck first */
function rowByItem(d: any, di: number, item: string): { name: string, keys: string[] } | null {
  const rid = String(item).startsWith('r:') ? String(item).slice(2) : ''
  if (!rid || !d) return null
  let i = (d.ground || []).findIndex((r: any) => r && r.rid === rid)
  if (i >= 0) return { name: d.ground[i].prog || 'ground item', keys: [`g:${di}.${i}`, `gr:${di}.${i}.prog`] }
  i = (d.allhands || []).findIndex((r: any) => r && r.rid === rid)
  if (i >= 0) return { name: d.allhands[i].prog || 'programme item', keys: [`a:${di}.${i}.0`, `ap:${di}.${i}.prog`] }
  for (const [wi, b] of ((d.dutywaves || []) as any[]).entries()) {
    const ri = (b.rows || []).findIndex((r: any) => r && r.rid === rid)
    if (ri >= 0) return { name: b.rows[ri].role || 'duty row', keys: [`d:${di}.${wi}.${ri}`, `dr:${di}.${wi}.${ri}.role`] }
  }
  for (const k of Object.keys(d.sims || {})) {
    const si = (d.sims[k] || []).findIndex((r: any) => r && r.rid === rid)
    if (si >= 0) return { name: `${k.toUpperCase()} ${d.sims[k][si].label || ''}`.trim(), keys: [`s:${di}.${k}.${si}.x0`, `sr:${di}.${k}.${si}.label`] }
  }
  return null
}

/* the reading order: the day's own sections top to bottom, then what has no place on it */
const RANK = (it: PendItem) => {
  const a = String(it.addr || (it.entry && it.entry.addr) || ''), c = a.indexOf(':'), p = c < 0 ? '' : a.slice(0, c)
  if (it.kind === 'move') return 7
  if (it.kind === 'input') return 8
  if (it.kind === 'oil') return 9
  if (!p || ['ff', 'fr', 'wl', 'it', 'tr', 'st', 'ar', 'at', 'fa', 'ft', 'aa', 'au'].includes(p)) return 1
  if (p === 'a' || p === 'ap' || p === 'pn' || p === 'dn') return 2
  if (p === 's' || p === 'sr' || p === 'sn') return 3
  if (p === 'd' || p === 'dr' || p === 'dl' || p === 'dtn') return 4
  if (p === 'g' || p === 'gr' || p === 'gn') return 5
  return 6
}
export function pendListHTML(di: number): string {
  items = dayPendingItems(di).map((x, i) => ({ x, i })).sort((a, b) => (RANK(a.x) - RANK(b.x)) || (a.i - b.i)).map(o => o.x)
  const n = items.length, seq = nextSeq(di)
  const rows = items.map((it, i) => {
    const w = pendItemWords(di, it)
    /* a line that found its own place to go (the crowd behind a placeholder) carries it for the tap */
    if (w.jump && !(it.jump && it.jump.length) && (w as any).keys) items[i] = { ...it, jump: (w as any).keys }
    const chg = w.from || w.to
      ? `<span class="pl-chg">${w.from ? `<s>${esc(w.from)}</s>` : ''}${w.from && w.to ? ' → ' : ''}${w.to ? `<b>${esc(w.to)}</b>` : ''}</span>` : ''
    const who = w.who ? `<span class="pl-who">${esc(w.who)}${w.when ? `<br>${esc(w.when)}` : ''}</span>` : '<span class="pl-who"></span>'
    const body = `<span class="pl-where">${esc(w.where)}</span>${who}${chg}`
    const rows: CrowdRow[] | undefined = (w as any).rows
    if (rows && rows.length) {
      rows.forEach((r, j) => { targets[`${i}.${j}`] = r.keys })
      return `<div class="pl-item still pl-multi"><span class="pl-where">${esc(w.where)}</span><span class="pl-who"></span>`
        + rows.map((r, j) => `<button class="pl-sub" data-pltarget="${i}.${j}"${r.keys.length ? '' : ' disabled'} title="Go to this row">`
          + `<span class="pl-where">${esc(r.where)}</span><span class="pl-chg">${r.from ? `<s>${esc(r.from)}</s>` : ''}${r.from && r.to ? ' → ' : ''}${r.to ? `<b>${esc(r.to)}</b>` : ''}</span></button>`).join('')
        + `</div>`
    }
    return w.jump
      ? `<button class="pl-item" data-plix="${i}" title="Go to this change">${body}</button>`
      : `<div class="pl-item still" title="This change has no place of its own on the schedule to go to">${body}</div>`
  }).join('')
  return `<div class="pl-head">Waiting to go out as <span class="verchip" data-alc="${seq}">AL${seq}</span> · ${n} change${n === 1 ? '' : 's'}</div>`
    + `<div class="pl-list">${rows || '<div class="pl-none">Nothing is waiting to go out.</div>'}</div>`
    + `<div class="pl-foot">${items.some(x => x.jump && x.jump.length) ? 'Tap a change to go to it.' : ''}</div>`
}

export function closePendList() {
  if (off) { off(); off = null }
  if (box && box.isConnected) box.remove()
  box = null; openDi = null; items = []; targets = {}
}
/* anchored under the chip, clamped into the VISIBLE viewport (a phone keyboard or pinch-zoom moves it — the
   History bubble's rule) */
function place(b: HTMLElement, anchor: HTMLElement) {
  const r = anchor.getBoundingClientRect(), vv = (window as any).visualViewport
  const vx = vv ? vv.offsetLeft : 0, vy = vv ? vv.offsetTop : 0, vw = vv ? vv.width : window.innerWidth, vh = vv ? vv.height : window.innerHeight
  const w = b.offsetWidth
  b.style.left = Math.round(Math.max(vx + 8, Math.min(vx + vw - w - 8, r.left))) + 'px'
  const below = r.bottom + 6
  b.style.top = Math.round(Math.max(vy + 8, Math.min(below, vy + vh - 120))) + 'px'
  /* the list scrolls inside the window once it runs past the screen (D100) */
  b.style.maxHeight = Math.max(160, Math.round(vy + vh - parseFloat(b.style.top) - 10)) + 'px'
}
/* `go` is the ONE jump (interactions.ts jumpToChange), passed in so this leaf never imports the click router */
export function openPendList(di: number, anchor: HTMLElement, go: (keys: string[], di: number) => void) {
  if (openDi === di) { closePendList(); return }            // the chip toggles it
  closePendList()
  const b = document.createElement('div')
  b.className = 'pendlist'; b.id = 'pendList'
  b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', `What will go out on ${(DAYS[di] || {}).dow || 'this day'}`)
  b.innerHTML = pendListHTML(di)
  document.body.appendChild(b)
  box = b; openDi = di
  place(b, anchor)
  b.addEventListener('click', (e: any) => {
    const sub = (e.target as HTMLElement).closest('[data-pltarget]') as HTMLElement | null
    if (sub) { const k = targets[sub.dataset.pltarget!]; closePendList(); if (k && k.length) go(k, di); return }
    const hit = (e.target as HTMLElement).closest('[data-plix]') as HTMLElement | null
    if (!hit) return
    const it = items[+hit.dataset.plix!]
    closePendList()
    if (it) go(it.jump, di)
  })
  /* a click-open popup closes on a click outside it (CLAUDE.md §Standing UI rules) and on Escape; the chip that
     opened it is "inside" (it toggles). Capture, so a tap on the schedule behind closes it before it acts. */
  const down = (e: any) => {
    const t = e.target as HTMLElement
    if (!t || !t.closest) return
    if (t.closest('#pendList') || t.closest(`[data-pendlist="${di}"]`)) return
    closePendList()
  }
  const key = (e: any) => { if (e.key === 'Escape') closePendList() }
  /* the page scrolling under it leaves the list pointing at nothing (walker B3, 25 Sep 26) — it goes, as a menu does;
     its own list scrolling is not the page */
  const scroll = (e: any) => { const t = e.target as any; if (t && t.closest && t.closest('#pendList')) return; closePendList() }
  document.addEventListener('pointerdown', down, true)
  document.addEventListener('keydown', key, true)
  document.addEventListener('scroll', scroll, true)
  window.addEventListener('resize', closePendList)
  off = () => { document.removeEventListener('pointerdown', down, true); document.removeEventListener('keydown', key, true)
    document.removeEventListener('scroll', scroll, true); window.removeEventListener('resize', closePendList) }
}
