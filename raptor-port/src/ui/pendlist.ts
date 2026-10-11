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

   WHO / WHEN: the newest edit-log row for the change's own cells — since [ACCOUNTS] (D166 (5), 26 Sep 26; D104's
   "the shared account until the database" replaced) the signed-in person's CALLSIGN — and its clock. The edit log is
   kept only while the page is open (CLAUDE.md §What actually persists), so a change whose cell has no row reads
   "earlier"; a change that has no single cell (a row added, removed or reordered, a request's filing, what the day
   earns) names no who at all rather than guess one.

   ONE element at body level, like the History bubble (histbubble.ts): the day heads are string-built and swapped
   by the per-block repaint, which would throw a list hung inside them away mid-read. */
import { DAYS } from '../engine/data'
import { REPORTING_LABEL } from '../engine/reporting'
import { PEOPLE, whoId, isSpecial } from '../engine/people'
import { INPUTS, inpId, inpLabel, goneRequestName, titleOf, inputCoversDate } from '../engine/inputs'
import { officialSliceNow } from '../engine/validate'
import { dayPendingItems, daySnapOf, dayCurVer, nextSeq, MOVE_LABELS, requestRow, warnMsgKey, warnCallsigns, peopleAttrsNow, faceRuleVals, faceRuleValsCompared, hidePending } from '../engine/publish'
import type { PendItem } from '../engine/publish'
import { ELOG, elogWhen, elogWho, keyLabel, rowTouches, weekDates } from '../engine/editlog'
import { CURWEEK } from '../engine/waves'
import { oilEvidence, oilKeptVals, oilRuleShift } from '../engine/oilev'
import { oilRuleValsNow } from '../engine/oil'
import { RULE_SPEC, ruleFmt } from '../engine/rules'
import { standsOn } from '../engine/overlay'
import { esc } from '../state/view'

let items: PendItem[] = []
/* the per-row places of a multi-row line (several placeholders' crowds), by "item.row" — read by the click */
let targets: Record<string, string[]> = {}

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
export function valueWords(addr: string, v: any): string {
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
      if (Array.isArray(j)) return p === 'it' ? `${j.length} ${REPORTING_LABEL} line${j.length === 1 ? '' : 's'}` : p === 'tr' ? `${j.length} traffic` : j.filter(Boolean).join(', ')
      return Object.keys(j).filter(k => j[k]).map(k => j[k] === true ? k : `${k} ${j[k]}`).join(', ')
    } catch (_) {}
  }
  return s
}
const FIL: any = { '': 'not on the programme', g: 'on the programme', u: 'under Unavailable', r: 'taken off' }

type Words = { where: string; from: string; to: string; who: string; when: string; jump: boolean; edited?: boolean }
/* a request's filing entry in words: whose request, what it is, where it stood → where it stands. A request DELETED on
   the Inputs page is no longer there to name — its row, when the change has one, still carries whose and what (the
   landing mints the row from the request: who, the type, the remarks), so the line names it from the row and says it was
   deleted (the D114 check, 25 Sep 26: the one paired line read only "A request · on the programme → not on the
   programme") */
/* …and a request that had NO row (one filed "→ Unavail", 'u') is named from the ISSUED version's own record of it
   ([REQ-DOOR-WORDS] 3, 28 Sep 26 — Fable's D176 read F2): it read "A request · under Unavailable → deleted". The issued
   copy (`snap.inp`, a published day's frozen record) says whose and what — the same source inputWords names a deleted
   leave from — never the change history's wording (Astra 11). `was`: the pending item's own record, or that copy. */
function requestWords(e: any, row?: any, was?: any): { where: string, from: string, to: string } {
  const id = decodeURIComponent(String(e.addr || '').split('.').slice(1).join('.'))
  const inp = INPUTS.find((x: any) => inpId(x) === id)
  const from = FIL[e.from || ''] || ''
  if (!inp) return { where: row ? requestName(null, row) : was ? requestName(was) : requestName(null), from, to: 'deleted' }
  return { where: requestName(inp), from, to: FIL[e.to || ''] || '' }
}
/* whose · what — from the request while it exists, from its row once it is gone (the row carries who, the type and the
   remarks). ONE body for every line that names a request, so they cannot word it two ways. */
function requestName(inp: any, row?: any): string {
  if (inp) { const who = cs(inp.person); return `${who ? who + ' · ' : ''}${inpLabel(inp)}` }
  const who = row ? cs(row.who) : '', what = row ? goneRequestName(row) : ''
  return what ? `${who ? who + ' · ' : ''}${what}` : 'A request'
}
const rowRequestName = (row: any) => requestName(INPUTS.find((x: any) => inpId(x) === row.src), row)
/* the newest edit-log row among a change's own cells */
function lastEdit(keys: string[]) {
  const set = new Set(keys.map(String))
  for (let i = ELOG.rows.length - 1; i >= 0; i--) { const r = ELOG.rows[i]!; if (r.key && set.has(r.key)) return r }
  return null
}
/* THE ONE ANSWER TO "WHO MADE THIS PENDING CHANGE, AND WHEN" — for the words and for the order alike, so the two cannot
   disagree. An INPUT's change (its details, its filing, a request's row with its filing) has no cells of its own: it is
   found by the input's id, which the change history keeps on every absence line (state/changelines.ts), preferring a
   line that touches this day; a cell change keeps its own cells' newest line (Astra's final read, ASTRA-DP-FINAL-02 —
   a leave filed after publishing named nobody and sorted below older work). */
function inputIdOf(it: PendItem): string | null {
  for (const e of [it.val, it.inp, (it.kind === 'input' ? it.entry : null)] as any[]) {
    const a = String((e && e.addr) || ''); if (!/^in[pv]:/.test(a)) continue
    const id = decodeURIComponent(a.split('.').slice(1).join('.')); if (id) return id
  }
  return null
}
function editRowOf(di: number, it: PendItem) {
  const id = inputIdOf(it)
  if (id) {
    const iso = weekDates(CURWEEK)[di]
    let any: any = null
    for (let i = ELOG.rows.length - 1; i >= 0; i--) {
      const r = ELOG.rows[i]!; if (r.iid !== id && !(r.iids && r.iids.includes(id))) continue
      if (!iso || rowTouches(r, iso)) return r
      if (!any) any = r
    }
    if (any) return any
    /* (a war move re-files the moved days as a new record; its line keeps the record it left too — `iids` — so it is
       found above by id: Fable FF4, Astra R3-02 — never by guessing from the man, which would borrow an unrelated edit) */
  }
  return lastEdit(it.keys || [])
}
const whoWhen = (r: any): { who: string; when: string } => r ? { who: elogWho(r), when: elogWhen(r.t) } : { who: '', when: '' }
/* AN INPUT CHANGED SINCE THE DAY WAS ISSUED ([LEAVE-LATE-PUBLISHED], owner D178 — every member input change after
   publishing is pending for the admin): whose and what, then what moved — "Hunter · OL (leave) — filed under
   Unavailable", "… all day → 09:00–12:00", "… Bane → Hunter", "… deleted", "… moved off this day". The issued copy
   (the version's own, snap.inp) says what it was; the live record what it is — so a deleted leave is still named. */
const hm = (m: any) => { const n = +m; if (!isFinite(n)) return ''; const x = ((n % 1440) + 1440) % 1440; return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}` }
const winWords = (r: any) => r.half === 'am' ? 'AM' : r.half === 'pm' ? 'PM' : r.allday ? 'all day' : (r.s != null && r.e != null ? `${hm(r.s)}–${hm(r.e)}` : 'no times')
const clip = (t: any) => { const s = String(t || ''); return s.length > 40 ? s.slice(0, 39) + '…' : s }
function inputWords(di: number, it: PendItem): Words {
  const e: any = it.val || {}, id = String(e.addr || '').split('.').slice(1).join('.')
  /* the two records the comparison paired — the live one may be another record of the same man's (a medical takeover's
     tail, Fable F2), so it comes off the item before the record by this id */
  const snap: any = daySnapOf(di, dayCurVer(di)), was = it.was || (snap && snap.inp && snap.inp[id]) || null
  const now = it.now || INPUTS.find((x: any) => inpId(x) === id) || null
  const here = !!now && !!DAYS[di] && inputCoversDate(now, (DAYS[di] as any).dt)
  /* a line whose input re-landed a row on this day takes the view to it (Fable F4); a leave with no row stays still */
  const none = { ...whoWhen(editRowOf(di, it)), jump: !!(it.jump && it.jump.length) }
  const name = requestName(here ? now : (was || now))
  if (!was) {
    const f: any = it.inp || (it.entry && String((it.entry as any).addr || '').startsWith('inp:') ? it.entry : null)
    return { where: name, from: '', to: f && f.to === 'u' ? 'filed under Unavailable' : f && f.to === 'g' ? 'filed — on the programme' : 'filed', ...none }
  }
  if (!here) return { where: name, from: '', to: now ? 'moved off this day' : 'deleted', ...none }
  const from: string[] = [], to: string[] = []
  const pair = (a: string, b: string) => { if (a !== b) { from.push(a); to.push(b) } }
  pair(cs(was.person), cs(now.person))
  pair(String(was.type || ''), String(now.type || ''))
  /* its own title (D715): "Event → Sports day" — compared by itself, the title each side stores (Astra's read of the
     code, 1: said only where the kind stood still, a kind and a title changed together lost the title). Two untitled
     kinds are the line above alone. */
  if (titleOf(was.type, was.title) !== titleOf(now.type, now.title)) pair(inpLabel(was), inpLabel(now))
  /* no dates: whether it covers this day is filed / moved off; its far end is another day's business (Fable F1) */
  pair(winWords(was), winWords(now))
  if (String(was.remarks || '') !== String(now.remarks || '')) { from.push(`“${clip(was.remarks)}”`); to.push(`“${clip(now.remarks)}”`) }
  const earns = it.oilFold ? ' · what the day earns changes with it' : ''
  if (!from.length) return { where: name, from: '', to: 'changed' + earns, ...none, edited: true } as Words
  return { where: name, from: from.join(' · '), to: to.join(' · ') + earns, ...none, edited: true } as Words
}
/* WHAT THE PUBLISHED DAY SHOWS, judged today, against what it went out with ([LEAVE-LATE-PUBLISHED], owner D179 — "freeze
   everything for now"): its warnings that freeze, a man's CAT / seat / posting as his puck draws it, the brief lead a
   blank line prints — anything that is not the day's own content or inputs. (What stays live — the next-day crew-rest
   mark, D183; a crew-rest breach, the 7-day run and a lapsed qualification, D184/D185 — is in neither side, so it never
   reads here.) ONE change; each thing
   that moved is a line of its own, named (Astra's code read #4). Warnings are matched with the men's callsigns keyed out,
   so a rename (a label) never reads as a warning cleared and another new (#3); a cleared one is worded with today's
   callsign. */
const CATW: any = { q: 'CAT', seat: 'seat', pers: 'ground crew', san: 'SANS', sxo: 'SXO', archived: 'posted out' }
/* WHO changed a man's detail since the day went out, and WHEN: the newest Quals line about HIM (by his id) and THAT
   detail, from the change history ([DRAFT-PENDING] — review log F5, "the To go out tab's line takes who/when from it";
   Fable P6 found it unbuilt). Matched by the ids the line keeps (state/changelines.ts personLines — sub, fld), never by
   its words: a rename since, or his old callsign given to someone else, must not lose or borrow the name (Astra's final
   read, 03). */
/* …and "posted out" or "SANS" made BY A POSTING: inside the posting's command those Quals lines are left unsaid (one act,
   one line — state/changelines.ts personLines), so the posting's own line is who and when — found by the man and that it
   is a posting (`sub`, `fld 'posting'`, [CHG-BY-ITEM]; Astra's final read FR-01) */
const BY_POSTING = new Set(['archived', 'san'])
function qualsLine(id: any, f: string) {
  for (let i = ELOG.rows.length - 1; i >= 0; i--) {
    const r = ELOG.rows[i]!
    if (r.sub !== String(id)) continue
    if (r.sect === 'quals' && r.fld === f) return r
    if (r.fld === 'posting' && BY_POSTING.has(f)) return r
  }
  return null
}
function faceWords(di: number): Words & { rows?: CrowdRow[] } {
  const snap: any = daySnapOf(di, dayCurVer(di)), w: any = snap && snap.w
  const was: any[] = (w && w.byDay && w.byDay.warns) || []
  const nowSlice: any = officialSliceNow(di), now: any[] = (nowSlice.byDay && nowSlice.byDay.warns) || []
  const namesWas = (w && w.cs) || warnCallsigns(w), namesNow = warnCallsigns(nowSlice)
  const k = (x: any, names: any) => `${x.code}|${warnMsgKey(x.msg, names)}`
  const a = new Set(was.map((x: any) => k(x, namesWas))), b = new Set(now.map((x: any) => k(x, namesNow)))
  const reword = (m: any) => { let t = String(m || ''); Object.keys(namesWas || {}).forEach((id: any) => { const c = cs(id); if (c && namesWas[id] && c !== namesWas[id]) t = t.split(String(namesWas[id])).join(c) }); return t }
  const rows: CrowdRow[] = []
  let by: any = null                                   // the newest Quals line behind a man's change (qualsLine)
  /* the same warning on the same men, re-worded — a rule change moved its time or its figure (the Logic walker, 26 Sep
     26: a brief-lead change read each "No time for the flight brief" twice, cleared and new) — is ONE line, "changed",
     in today's words */
  const who = (x: any) => `${x.code}|${[...(x.who || [])].map(String).sort().join(',')}`
  const added = now.filter((x: any) => !a.has(k(x, namesNow))), gone = was.filter((x: any) => !b.has(k(x, namesWas)))
  added.forEach((x: any) => {
    const j = gone.findIndex((y: any) => who(y) === who(x))
    if (j >= 0) { gone.splice(j, 1); rows.push({ where: String(x.msg || x.code || 'A warning'), from: '', to: 'changed', keys: [] }) }
    else rows.push({ where: String(x.msg || x.code || 'A warning'), from: '', to: 'new', keys: [] })
  })
  gone.forEach((x: any) => rows.push({ where: reword(x.msg || x.code || 'A warning'), from: '', to: 'cleared', keys: [] }))
  /* the men as their pucks draw them */
  if (snap && snap.pa) {
    const nowPa: any = peopleAttrsNow(snap.pa)
    Object.keys(snap.pa).forEach((id: any) => {
      const o = snap.pa[id], n = nowPa[id]; if (!o) return
      /* a man deleted from the roster outright: his puck has nothing left to draw */
      if (!n) { rows.push({ where: `${cs(id) || id} · no longer on the roster`, from: '', to: 'removed', keys: [] }); return }
      Object.keys(CATW).forEach((f: any) => {
        const x = o[f] ?? null, y = n[f] ?? null
        if (JSON.stringify(x) === JSON.stringify(y)) return
        const v = (z: any) => typeof z === 'boolean' ? (z ? 'yes' : 'no') : (z == null || z === '' ? '—' : String(z))
        rows.push({ where: `${cs(id)} · ${CATW[f]}`, from: v(x), to: v(y), keys: [] })
        const l = qualsLine(id, f); if (l && (!by || l.seq > by.seq)) by = l
      })
    })
  }
  /* the brief lead a blank line prints */
  if (snap && snap.rv && snap.rv.briefLead != null && faceRuleValsCompared(snap.d)) {
    const nb = (faceRuleVals(snap.d) || {}).briefLead
    if (nb != null && +nb !== +snap.rv.briefLead) rows.push({ where: 'A blank brief — its suggested lead', from: `${snap.rv.briefLead} min`, to: `${nb} min`, keys: [] })
  }
  const none = by ? { who: elogWho(by), when: elogWhen(by.t), jump: false } : { who: '', when: '', jump: false }
  if (!rows.length) return { where: 'What this day shows', from: '', to: 'changed', ...none }
  if (rows.length === 1) return { where: rows[0]!.where, from: rows[0]!.from, to: rows[0]!.to, ...none }
  return { where: 'What this day shows', from: '', to: '', ...none, rows }
}
/* A SHARED INPUT'S ONE LINE (owner D736 — "one line, naming its people"; D663's words in the changes window; the plan
   2026-10-10-group-input-one-row-plan.md §4.8). The item stands for every record of the entry that the same act
   reached (engine/entryfold.ts — `mates`, `people`): it is led by the INPUT — "Range safety brief · 4 people" — its
   people named under it A to Z (`names`, drawn as `pl-names`), and then says what changed in the first man's own
   words, which are every man's: the act is the same. No man's name stands in front of it. Who and when, and the tap
   (to the one row), are the first's. */
function foldedWords(di: number, it: PendItem): Words & { names: string[] } {
  const w = pendItemWords(di, { ...it, mates: undefined, people: undefined } as PendItem)
  const ids = it.people && it.people.length ? it.people : []
  const names = ids.map(cs).filter(Boolean).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  return { ...w, where: `${entryName(di, it)} · ${names.length || (it.mates!.length + 1)} people`, names }
}
/* what a shared input is called on its one line: its own name (title, else kind) — from the live record, else the copy
   the issued version froze, else the row that carried it */
function entryName(di: number, it: PendItem): string {
  const snap: any = daySnapOf(di, dayCurVer(di))
  const id = inputIdOf(it)
  const rec = id ? (INPUTS.find((x: any) => inpId(x) === id) || (snap && snap.inp && snap.inp[id])) : null
  if (rec) return inpLabel(rec)
  const row = requestRow(it, it.kind === 'delete' ? (issuedDays(di) || [])[di] : DAYS[di])
  if (!row) return 'A shared input'
  const live = INPUTS.find((x: any) => inpId(x) === row.src) || (snap && snap.inp && snap.inp[row.src])
  return live ? inpLabel(live) : goneRequestName(row) || 'A shared input'
}
/* THE PUCK THAT WENT WITH A MAN (owner D745): the placeholders that stood on the row the issued day held for him */
const wentWith = (row: any): string => { const p = ((row && row.more) || []).map((v: any) => whoId(v)).filter((x: any) => x && isSpecial(x)).map(cs); return p.length ? ` · ${p.join(', ')} came off with him` : '' }
export function pendItemWords(di: number, it: PendItem): Words {
  if (it.mates && it.mates.length) return foldedWords(di, it)
  const e: any = it.entry || {}
  if (it.val) {
    /* a request whose filing moved too — filed, taken off, deleted — keeps the request's own words below ("on the
       programme → deleted"); the details words speak where the record itself was edited, or where it has no filing */
    const w = inputWords(di, it), fil = !!it.inp || String(e.addr || '').startsWith('inp:')
    if (!fil || (w as any).edited) return w
  }
  if (it.kind === 'warn') return faceWords(di)
  /* a warning hidden, or flagged again, since the day went out ([WARN-HIDE-KEPT], D471): the line is led by its item
     — the warning, in its own words — with what happened to it under it; a tap goes to the warning's own line, where
     it has one */
  if (it.kind === 'hide') {
    const x = hidePending(di).find(h => h.entry.addr === e.addr)
    const nm = x ? x.who.map((id: string) => cs(id)).filter(Boolean).join(', ') : ''
    const where = x ? `Warning · ${nm}${nm ? ' — ' : ''}${x.msg}` : 'A warning'
    /* who hid it, and when — "where the app knows" (D99), and it does: the change history has the line under these very
       words (state/changelines.ts; Fable's final read F2 — this line was blank beside the All changes tab naming him).
       The newest one for this day; a man renamed since leaves the stored words behind and the line simply says nothing. */
    let who = '', when = ''
    for (let i = ELOG.rows.length - 1; i >= 0; i--) {
      const r: any = ELOG.rows[i]
      if (r && r.di === di && r.sect === 'day' && r.lbl === where) { who = elogWho(r); when = elogWhen(r.t); break }
    }
    return { where, from: e.to === 'hidden' ? 'flagged' : 'hidden', to: e.to === 'hidden' ? 'hidden' : 'flagged again',
      who, when, jump: !!(it.jump && it.jump.length) }
  }
  const byLog = (): { who: string; when: string } => {
    const r = lastEdit(it.keys || [])
    return r ? { who: elogWho(r), when: elogWhen(r.t) } : { who: 'earlier', when: '' }
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
  /* a request's row and its filing, one act (D114): name the request — whose, what — and where it now stands */
  if ((it.kind === 'add' || it.kind === 'delete') && it.inp) {
    /* the row this request stood on: in the issued day for a removal, the live day for an addition */
    const row = it.kind === 'delete' ? requestRow(it, (issuedDays(di) || [])[di]) : requestRow(it, DAYS[di])
    /* ONE MAN TAKEN OUT OF A SHARED INPUT THAT GOES ON (owner D734, D736 — "one man taken off its row … is one change
       each"): his record is gone, but the input was not deleted — he was taken out of it. Named from the copy the
       issued version froze (whose, and the input's own name), and the puck that stood on his place is named with him
       (D745: "ALL AVAIL came off with him") — one act, one line. */
    if (it.kind === 'delete' && row && row.srcg && !INPUTS.some((x: any) => inpId(x) === row.src)) {
      const snap: any = daySnapOf(di, dayCurVer(di)), was = (it as any).was || (snap && snap.inp && snap.inp[row.src]) || null
      const earns = it.oilFold && !wentWith(row) ? ' · what the day earns changes with it' : ''
      return { where: was ? requestName(was) : requestName(null, row), from: 'on the programme', to: `taken out${wentWith(row)}${earns}`, ...whoWhen(editRowOf(di, it)), jump: false }
    }
    { const w = requestWords(it.inp, row)
      /* …and ✕ on a request's row that carried a placeholder: the puck went with the row (D745, the same act) */
      if (it.kind === 'delete' && row && wentWith(row)) w.to += wentWith(row)
      return { ...w, ...whoWhen(editRowOf(di, it)), jump: it.kind === 'add' && jump } }
  }
  /* A REQUEST'S ROW WITH NO FILING CHANGE BESIDE IT — the request moved to another day's programme (✕ here, Accept
     there), or a load left this day's copy out because it stands elsewhere (D175): name whose and what, and where it
     stands now, not "Ground · MEETING · item → removed" (Fable's code read F3, 25 Sep 26 — the list is where a scheduler
     looks after the load's sentence has gone, D99) */
  if (it.kind === 'add') {
    const row = requestRow(it, DAYS[di])
    if (row && row.src) return { where: rowRequestName(row), from: '', to: 'on the programme', ...none, jump }
    return { where: keyLabel(it.addr || e.addr), from: '', to: 'added', ...none, jump }
  }
  if (it.kind === 'delete') {
    /* the row is gone from the live day: name it from the version it was removed from */
    const arr = issuedDays(di)
    const row = requestRow(it, (arr || [])[di])
    if (row && row.src) {
      const dj = DAYS.findIndex((d: any, j: number) => j !== di && !!standsOn(d, row.src))   // where it STANDS now (overlay.ts)
      return { where: rowRequestName(row), from: 'on the programme', to: dj >= 0 ? `on ${DAYS[dj].dow}'s programme` : 'removed', ...none, jump: false }
    }
    return { where: arr ? keyLabel(e.addr, arr) : 'An item', from: '', to: 'removed', ...none, jump: false }
  }
  if (it.kind === 'move') {
    const k = String(e.addr || '').split('.').pop() || ''
    return { where: 'Order changed', from: '', to: MOVE_LABELS[k] ? `${MOVE_LABELS[k]}s` : 'rows', ...none, jump: false }
  }
  if (it.kind === 'input') {
    /* a filing on its own: a deleted request is named from a row that still carries it — on this day as it stands (a
       load put the version's row back) or as it was issued */
    const id = decodeURIComponent(String(e.addr || '').split('.').slice(1).join('.'))
    const bySrc = (d: any) => ((d && d.ground) || []).find((g: any) => g && g.src === id)
    const snap: any = daySnapOf(di, dayCurVer(di)), was = (it as any).was || (snap && snap.inp && snap.inp[id]) || null
    return { ...requestWords(e, bySrc(DAYS[di]) || bySrc((issuedDays(di) || [])[di]), was), ...whoWhen(editRowOf(di, it)), jump: false }
  }
  /* WHAT THE DAY EARNS — say WHO and WHERE when it is the crowd behind a placeholder that moved (walker B1, 25 Sep 26:
     "What this day earns · changed" named nobody and could not be tapped, so the scheduler still had to go looking —
     the very hunt D99 exists to end). The issued version froze who each ALL / ALL AVAIL puck stood for (D44); the
     live evidence says who it stands for now; the difference names the row and the men. A change in the scheduler's
     own earning decisions keeps the plain wording. */
  if (String(e.addr || '').startsWith('oilrv:')) return oilRuleWords(di)
  const crowd = crowdChange(di)
  if (crowd && crowd.length === 1) return { ...crowd[0]!, ...none, jump: crowd[0]!.keys.length > 0 }
  /* several placeholders' crowds moved: still ONE change (what the day earns is one item, D109's count), but each row
     is named and reachable on its own line (Astra's code read, 25 Sep 26 — "+ N more" hid the rest) */
  if (crowd && crowd.length > 1) return { where: `${crowd.length} placeholders · who they stand for`, from: '', to: '', ...none, jump: false, rows: crowd } as any
  return { where: 'What this day earns', from: '', to: 'changed', ...none, jump: false }
}
/* THE DAY'S OIL, WORKED OUT AGAIN WITH TODAY'S LOGIC VALUES ([OIL-WORK-START] — owner, D592 (4), 5 Oct 26: "a published
   day keeps the OIL it went out with"; engine/publish.ts oilRuleDelta). The version keeps the three values its OIL was
   worked out from, and a change to one that WOULD move somebody's OIL on this day reads as this ONE change — so the line
   says which value moved, by the name its box carries on the Logic page (rules.ts RULE_SPEC, the one source — less its
   bracketed note), and each man whose OIL record would move, in words: full day, half day or nothing, with the worked
   times the record carries — so a change that leaves his day a full day and moves only "worked until" still reads as
   what it is. A man whose record stays as it is is not named. No place on the schedule to go to: the value lives on the
   Logic page.
   EACH MAN'S LINE SAYS WHAT IT COMPARES (the walk, 6 Oct 26 — walker D, S38): his PUBLISHED OIL, against the same
   published day worked out with today's values. With another change also waiting — his flight switched off, an in-time
   typed — "Ranger · OIL  full day → full day …15:30" read as what the amendment would give him, which it is not: the
   other change has its own line, and what the day WILL earn is the working copy's own figure in OIL Earn. */
const OIL_VALS = ['reportLead', 'debrief', 'oilFullMin'] as const
const oilRecWords = (r: { amt: number, spans: Array<[number, number]> } | null) => !r ? 'nothing'
  : `${r.amt === 1 ? 'full day' : 'half day'}${r.spans.length ? ` · ${r.spans.map(([a, b]) => `${hm(a)}–${hm(b)}`).join(', ')}` : ''}`
function oilRuleWords(di: number): Words & { rows: CrowdRow[] } {
  const snap: any = daySnapOf(di, dayCurVer(di)), d: any = snap && snap.d, ev: any = d && d.oilev
  const kept = oilKeptVals(ev), now = oilRuleValsNow()
  const rows: CrowdRow[] = []
  if (kept) OIL_VALS.forEach(k => { if (kept[k] !== now[k])
    rows.push({ where: `Logic · ${String(RULE_SPEC[k].t).replace(/\s*\(.*\)\s*$/, '')}`, from: String(ruleFmt(k, kept[k])), to: String(ruleFmt(k, now[k])), keys: [] }) })
  oilRuleShift(d, ev).forEach(r => rows.push({ where: `${cs(r.person)} · OIL as published, under today's values`, from: oilRecWords(r.was), to: oilRecWords(r.now), keys: [] }))
  return { where: 'OIL on this day · Logic values changed since it was published', from: '', to: '', who: '', when: '', jump: false, rows }
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
    /* A PUCK THAT IS GONE WITH ITS REQUEST'S ROW (owner D745): the live day has no row for it, so it is named from the
       row the issued day held — whose place it stood on — and said as what happened: it came off with him. Never "A
       placeholder … no longer free", which names nothing and reads as if the men had become busy. */
    if (!row && String(x.item).startsWith('i:') && !x.on.length) {
      const was = ((snap.d.ground || []) as any[]).find((r: any) => r && String(r.src || '') === String(x.item).slice(2))
      if (was) return { where: `${was.prog || 'A request'} · the puck on ${cs(was.who) || 'its'} place`, from: names(x.off), to: `came off with ${cs(was.who) || 'its row'}`, keys: [] }
    }
    return { where: (row ? row.name : 'A placeholder') + ' · who it stands for', from: names(x.off),
      to: x.on.length ? names(x.on) : 'no longer free', keys: row ? row.keys : [] }
  })
}
/* an OIL item key (`r:<row id>`) back to its row on the live day: the row's name and its cells, puck first */
function rowByItem(d: any, di: number, item: string): { name: string, keys: string[] } | null {
  /* A REQUEST's row is addressed by its request (`i:<request id>`), not by a row id ([DB-READINESS] phase 7, Fable's final
     read F3): its crowd change read "A placeholder · who it stands for" — no row named, nothing to tap. Its row on the
     live day, never a `kept` one (a version's row whose request cannot stand there is not the request's row). */
  if (d && String(item).startsWith('i:')) {
    const src = String(item).slice(2)
    const gi = (d.ground || []).findIndex((r: any) => r && String(r.src || '') === src && !r.kept)
    return gi >= 0 ? { name: d.ground[gi].prog || 'request', keys: [`g:${di}.${gi}`, `gr:${di}.${gi}.prog`] } : null
  }
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
  if (it.kind === 'oil' || it.kind === 'warn' || it.kind === 'hide') return 9
  if (!p || ['ff', 'fr', 'wl', 'it', 'tr', 'st', 'ar', 'at', 'fa', 'ft', 'aa', 'au'].includes(p)) return 1
  if (p === 'a' || p === 'ap' || p === 'pn' || p === 'dn') return 2
  if (p === 's' || p === 'sr' || p === 'sn') return 3
  if (p === 'd' || p === 'dr' || p === 'dl' || p === 'dtn') return 4
  if (p === 'g' || p === 'gr' || p === 'gn') return 5
  return 6
}
export function pendListHTML(di: number): string {
  /* NEWEST FIRST (the owner's D119, 25 Sep 26 — "Shouldn't the latest change for pending be at the top? Just like
     history list"): by when each change was last made (the edit record's time); a change the record has no time for
     ("earlier", what the day earns, a filing) goes below the timed ones, in the day's own order (the old RANK) */
  const tOf = (it: PendItem) => { const r = editRowOf(di, it); return r ? r.t : -1 }
  items = dayPendingItems(di).map((x, i) => ({ x, i, t: tOf(x) }))
    .sort((a, b) => (b.t - a.t) || (RANK(a.x) - RANK(b.x)) || (a.i - b.i)).map(o => o.x)
  const n = items.length, seq = nextSeq(di)
  const rows = items.map((it, i) => {
    const w = pendItemWords(di, it)
    /* a line that found its own place to go (the crowd behind a placeholder) carries it for the tap */
    if (w.jump && !(it.jump && it.jump.length) && (w as any).keys) items[i] = { ...it, jump: (w as any).keys }
    const chg = w.from || w.to
      ? `<span class="pl-chg">${w.from ? `<s>${esc(w.from)}</s>` : ''}${w.from && w.to ? ' → ' : ''}${w.to ? `<b>${esc(w.to)}</b>` : ''}</span>` : ''
    const who = w.who ? `<span class="pl-who">${esc(w.who)}${w.when ? `<br>${esc(w.when)}` : ''}</span>` : '<span class="pl-who"></span>'
    /* a shared input's line names its people under it, A to Z (D736; the changes window's `cw-names` is its twin) */
    const ppl: string[] | undefined = (w as any).names
    const body = `<span class="pl-where">${esc(w.where)}</span>${who}${ppl && ppl.length ? `<span class="pl-names">${esc(ppl.join(', '))}</span>` : ''}${chg}`
    const rows: CrowdRow[] | undefined = (w as any).rows
    if (rows && rows.length) {
      rows.forEach((r, j) => { targets[`${i}.${j}`] = r.keys })
      return `<div class="pl-item still pl-multi"><span class="pl-where">${esc(w.where)}</span>${who}`
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

/* THE POP-UP UNDER THE CHIP IS GONE ([DRAFT-PENDING], 28 Sep 26 — the owner's D168: one changes window replaces the
   pending list). The list above is the window's "To go out" tab (ui/ChangesWindow.tsx); a tap on one of its lines is
   resolved here to the places it takes the schedule to. closePendList stays as the jump's no-op for anything that still
   calls it. */
export function closePendList() { /* nothing floats any more */ }
/* the keys a tap on a To go out line (or one of its sub-lines) takes the schedule to — null when it has none */
export function pendKeysFor(el: HTMLElement): string[] | null {
  const sub = el.closest('[data-pltarget]') as HTMLElement | null
  if (sub) { const k = targets[sub.dataset.pltarget!]; return k && k.length ? k : null }
  const hit = el.closest('[data-plix]') as HTMLElement | null
  if (!hit) return null
  const it = items[+hit.dataset.plix!]
  return it && it.jump && it.jump.length ? it.jump : null
}
