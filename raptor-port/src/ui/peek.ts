/* THE NEXT-WEEK PREVIEW (owner ask — desktop continuous week display). The
   desktop week strip leaves trailing empty space past Sunday (fixed 552px
   day columns, a JS-sized tail spacer — pan.ts:setWeekTail). This fills that
   space with an INERT, read-only preview of next week's planned programme,
   so the trailing void becomes a look-ahead instead — and clicking a preview
   day loads that week, landing the same day at the same screen position.

   INERT BY CONSTRUCTION, not by convention: this file never touches DAYS,
   SCHED or WARN. It reads next week's days straight off `weekBundle`'s fresh
   copy (never live, never written back) and formats them with its own small
   renderers rather than reusing dayHTML's ed/PV-branching helpers — html.ts's
   `ted`/`alAttr`/`plRow`/`lSeat` all key off the SAME 0–6 day-index namespace
   the LIVE week uses (SCHED.changes/SCHED.pending are addressed by keys like
   `ff:0.0.0`), so calling them for a peek day would paint THIS week's amendment
   marks and warn rings onto NEXT week's preview. The few helpers reused below
   (dayCount, isStandalone, mColor, groundOrder, storesView, rowCls, cxTag,
   flagTag, plCols, areaText/atimeText, fmtT, lCell-with-no-fillKey, esc) are
   pure functions of the day/row object handed to them — verified by reading
   each one — so reusing them cannot leak live state either. No `data-slot`,
   `data-person`, `data-fill`, `contenteditable` or `draggable` is ever emitted:
   the markup carries nothing any existing click/drag/highlight delegate keys
   on (routeClick's slot/puck branches, highlights.ts's `.puck[data-person]`
   sweep), which is what makes "inert" true rather than merely intended.

   Cached per (desktop-ness × CURWEEK) — html.ts's rule for the dense strings
   applies here too: rebuild only when the loaded week changes, never on an
   ordinary repaint (perf-B). ViewWeek/EditWeek mount the cached markup as
   trailing children of the same `.week` container their own live-day diff
   loop never touches, so a one-day edit still rewrites only that day's node. */
import { PEOPLE, nameToId, QCHIP, QCLASS } from '../engine/people'
import { isStandalone, mColor, dayCount, CURWEEK } from '../engine/waves'
import { groundOrder } from '../engine/order'
import { whoArr } from '../engine/slots'
import { minus, parseHM } from '../engine/time'
import { VCONF } from '../engine/rules'
import { weekBundle } from '../engine/weeks-data'
import { stashDays, stashGenOf } from '../engine/weekstash'
import { shiftWeek } from './weeknav'
import { esc } from '../state/view'
import { fmtT, storesView, rowCls, cxTag, flagTag, plCols, areaText, atimeText, lCell, saRoleText } from './html'

/* a plain, non-interactive puck — the same visual identity (qual chip, RCP
   tint, SANS line) as html.ts's `puck()`, minus everything that function
   wears for WARN/selection (no tabindex, no data-person, no ring/chip/trace
   classes — a peek day is never validated, so there is nothing to ring). */
function peekPuck(id: any): string {
  const p = PEOPLE[id]; if (!p) return ''
  if (p.special) return `<span class="puck allavail sm"><span class="nm">${esc(p.cs)}</span></span>`
  const cls = ['puck', 'sm']; if (p.seat === 'RCP') cls.push('r'); if (p.pers) cls.push('pers')
  if (p.san) cls.push('san')
  const chipTxt = QCHIP[p.q], chipCls = QCLASS[p.q]
  const qchip = p.q ? `<span class="role ${chipCls}">${chipTxt}</span>` : ''
  return `<span class="${cls.join(' ')}" title="${esc(p.cs)}"><span class="nm">${esc(p.cs)}</span>${qchip}</span>`
}
function peekSeat(id: any): string {
  if (id && PEOPLE[id]) return `<span class="seat">${peekPuck(id)}</span>`
  return `<span class="seat"></span>`
}
/* the FCP/RCP pair on one flying line */
function peekPucks(a: any): string { return `<span class="pucks">${peekSeat(a.p)}${peekSeat(a.w)}</span>` }
/* a plain text row cell — plRow's shape (nm/time/time/people/rmk) without its
   `base`-keyed ted()/alAttr() calls, which is exactly what would reach into
   the live week's SCHED. `o` only supplies the cx/flag/src decoration, read
   straight off the object handed in (rowCls/cxTag/flagTag are pure). */
function peekRow(name: any, str: any, end: any, peopleHtml: string, rmks: any, o: any): string {
  const t = (v: any) => v ? esc(fmtT(v)) : ''
  return `<div class="pl-row${rowCls(o)}"><span class="nm">${cxTag(o)}${flagTag(o)}<span class="ntx">${esc(name || '')}</span></span>`
    + `<span class="t t-s">${t(str)}</span><span class="t t-e">${t(end)}</span>`
    + `${peopleHtml || '<div class="ppl one"></div>'}`
    + `<span class="rmk${rmks ? '' : ' rk-e'}"><span class="ntx">${esc(rmks || '')}</span></span></div>`
}
/* the crew cell for a duty/sim/ground row — its own seat(s) plus any overflow
   bodies (`row.more`), read straight off the row object itself rather than
   through moreSeats/rowRef (which resolve by walking the LIVE DAYS/SCHED by
   day index — exactly the kind of read this file exists to avoid). */
function peekCrewCell(ids: any[], fillKind: string): string {
  const inner = ids.filter(Boolean).map(id => PEOPLE[id] ? peekSeat(id) : `<span class="itxt">${esc(id)}</span>`).join('')
  return lCell(inner, null, false, ids.length === 1 ? 'one' : fillKind)
}

function peekFormation(w: any, f: any): string {
  const sa = isStandalone(w)
  const rows = (f.aircraft || []).length
  const brief = minus(f.to, VCONF.briefLead)
  const brShown = parseHM(f.br) != null ? f.br : brief
  const spans = `--gs:${rows}`
  let h = `<div class="form${rowCls(f)}">`
    + `<div class="fcell csmsn" style="${spans}">${cxTag(f)}${flagTag(f)}<b><span class="mdot" style="background:${sa ? 'var(--san)' : `var(--${mColor(f.msn)})`}"></span>${esc(f.cs || '')}</b>${f.msn ? `<i>${esc(f.msn)}</i>` : ''}</div>`
    + (sa
      ? `<div class="fcell bto" style="${spans}"><span>${esc(f.to || '')}</span></div>`
      : `<div class="fcell bto" style="${spans}"><b>${esc(brShown || '')}</b><span>${esc(f.to || '')}</span></div>`)
    + `<div class="fcell ld" style="${spans}">${esc(f.ld || '')}</div>`
  ;(f.aircraft || []).forEach((a: any, ai: number) => {
    const acx = (f.cx ? '' : rowCls(a)) + ((sa && a.spare) ? ' spare' : '')
    const stores = sa ? '' : storesView(a.opts || {})
    const rmkE = (!(a.rmks || '').trim() && !stores && !a.cx && !a.flag) ? ' rmk-e' : ''
    /* the preview keeps the role as compact fallback TEXT, not the live
       surfaces' .sarole badge — a peek column is inert and dimmed, and the
       one-line text keeps its DOM under the perf ceiling. Label body shared
       with saRoleHTML via saRoleText so the two spellings cannot drift. */
    const rmkTxt = a.rmks || (sa ? saRoleText(a) : '')
    h += `<div class="acrow${ai ? '' : ' r1'}${acx}" style="--gr:${ai + 1}">${peekPucks(a)}</div>`
      + `<div class="rmkcell${ai ? '' : ' r1'}${acx}${rmkE}" style="--gr:${ai + 1}">${cxTag(a)}${flagTag(a)}<span class="ntx">${esc(rmkTxt)}</span>${stores}</div>`
  })
  const areaTxt = areaText(f), timeTxt = atimeText(f)
  if (!sa && (areaTxt || timeTxt))
    h += `<div class="form-area" style="--ga:${rows + 1}"><span class="fa-lb">AREA</span><span class="areacell">${esc(areaTxt)}</span><span class="timecell">${esc(timeTxt)}</span></div>`
  h += `</div>`
  return h
}
function peekWave(w: any): string {
  const f0 = (w.formations || [])[0]
  const sa = isStandalone(w)
  const edge = sa ? 'var(--san)' : `var(--${mColor(f0 ? f0.msn : '')})`
  let h = `<div class="go ${w.night ? 'night' : ''} ${sa ? 'sa sa-' + (w.kind || 'x') : ''}" style="border-left-color:${sa ? 'var(--san)' : (w.night ? 'var(--hard)' : edge)}">`
    + `<div class="go-tab"><span class="asd">${esc(w.label || '')}${!sa && w.night && !/night/i.test(w.label || '') ? ' · NIGHT' : ''}`
    + `${sa ? `<span class="satag">standalone${w.noconf ? (w.kind === 'avalon' ? ' · availability check only' : ' · not cross-checked') : ''}</span>` : ''}</span></div>`
  h += sa
    ? `<div class="cols formcols"><span>${esc(w.label || '')}<br>SHIFT</span><span class="c-c">START</span><span class="c-c">END</span><span>FCP / RCP</span><span>RMKS</span></div>`
    : `<div class="cols formcols"><span>CS<br>MSN</span><span class="c-c">B<br>TO</span><span class="c-c">LD</span><span>FCP / RCP</span><span>RMKS</span></div>`
  ;(w.formations || []).forEach((f: any) => { h += peekFormation(w, f) })
  h += `</div>`
  return h
}
function peekCommon(d: any): string {
  const hasNotes = !!(d.notes && d.notes.length), hasAH = !!(d.allhands && d.allhands.length)
  if (!hasNotes && !hasAH) return ''
  let h = `<div class="allhands sec sec-prog"><div class="ah-h">Common Programme</div>`
  ;(d.notes || []).forEach((n: any) => { h += `<div class="ah-note">${esc(n)}</div>` })
  if (hasAH) {
    h += `<div class="ah-cols"><span>Name</span><span>Start</span><span>End</span><span>People</span><span>Rmks</span></div>`
    d.allhands.forEach((x: any) => {
      const ids = whoArr(x).map((nm: any) => nameToId(nm))
      const ppl = peekCrewCell(ids, '')
      h += `<div class="ah-row${rowCls(x)}"><span class="nm">${cxTag(x)}${flagTag(x)}<span class="ntx">${esc(x.prog || '')}</span>${x.sub ? `<span class="sub">${esc(x.sub)}</span>` : ''}</span>`
        + `<span class="t t-s">${x.str ? esc(fmtT(x.str)) : ''}</span><span class="t t-e">${x.end ? esc(fmtT(x.end)) : ''}</span>${ppl}`
        + `<span class="rmk${x.rmks ? '' : ' rk-e'}"><span class="ntx">${esc(x.rmks || '')}</span></span></div>`
    })
  }
  h += `</div>`
  return h
}
function peekDuties(d: any): string {
  if (!d.dutywaves || !d.dutywaves.length) return ''
  let h = `<div class="sub plist sec sec-duty"><div class="sub-h">Duties</div>` + plCols()
  d.dutywaves.forEach((dwv: any) => {
    h += `<div class="pl-sub">${esc(dwv.label || '')}</div>`
    ;(dwv.rows || []).forEach((r: any) => {
      const ppl = peekCrewCell([r.id, ...(r.more || [])], '')
      h += peekRow(r.role, r.str, r.end, ppl, r.rmks, r)
    })
  })
  h += `</div>`
  return h
}
function peekSims(d: any): string {
  const sims = d.sims || {}
  if (!(sims.amt && sims.amt.length) && !(sims.oft && sims.oft.length)) return ''
  let h = `<div class="sub plist sec sec-sim"><div class="sub-h">Sims</div>` + plCols()
  const blk = (title: string, rows: any[]) => {
    if (!rows || !rows.length) return ''
    let s = `<div class="pl-sub">${title}</div>`
    rows.forEach((r: any) => {
      const pax = Array.isArray(r.pax) ? r.pax : null
      /* mirrors html.ts's blk(): a crewed row shows its pax/seats; an
         uncrewed row with only a free-text `who` ("ALL PILOTS") shows that
         text in the people cell instead — never as a substitute remark. */
      const ids = pax ? pax : (r.p || r.w) ? [r.p, r.w] : (r.who ? [r.who] : [])
      const ppl = peekCrewCell([...ids, ...(r.more || [])], '')
      s += peekRow(r.label, r.str, r.end, ppl, r.rmks, r)
    })
    return s
  }
  h += blk('AMT', sims.amt) + blk('OFT', sims.oft)
  h += `</div>`
  return h
}
function peekGround(d: any): string {
  if (!d.ground || !d.ground.length) return ''
  let h = `<div class="sub plist one sec sec-grnd"><div class="sub-h">Ground Programme</div>` + plCols()
  groundOrder(d.ground, d.gman).forEach(({ row: x }: any) => {
    /* nameToId can come back undefined for a name it does not resolve — fall
       back to the raw text itself (peekCrewCell's own itxt path) rather than
       silently dropping the row's only crew mention, matching html.ts's own
       `x.who ? itxt(x.who) : ''` fallback. */
    const id = nameToId(x.who)
    const ppl = peekCrewCell([id != null ? id : x.who, ...(x.more || [])], '')
    h += peekRow(x.prog, x.str, x.end, ppl, x.rmks, x)
  })
  h += `</div>`
  return h
}
/* one preview day. `i` is 0..6 (Mon..Sun) — the SAME index the live day will
   take once loaded, so a click's landing math never has to translate between
   "which peek day" and "which live day". `data-peek-day`, never `data-day` —
   every existing `.day[data-day]` query (state/view.ts's weekLeftDay/
   scrollWeekToDay, highlights.ts, interactions.ts) already excludes this node
   by construction, with no per-site change needed. */
export function peekDayHTML(d: any, i: number, first: boolean): string {
  let h = `<section class="day peek" data-peek-day="${i}">`
  h += `<div class="day-head">${first ? `<span class="peek-nextwk">Next week — click a day to load it</span>` : ''}`
    + `<span class="dow">${esc(d.dow || '')}</span><span class="dt">${esc(d.dt || '')}</span>`
    + `<span class="badge">${esc(dayCount(d))}</span></div>`
  h += `<div class="day-body">`
  h += peekCommon(d)
  if (!d.waves || !d.waves.length) h += `<div class="nobox" style="background:rgba(138,150,163,.08);border-color:var(--edge);border-left-color:var(--edge-2);color:var(--ink-3)">No flying — ground day.</div>`
  ;(d.waves || []).forEach((w: any) => { h += peekWave(w) })
  h += peekDuties(d) + peekSims(d) + peekGround(d)
  h += `</div></section>`
  return h
}

/* ---- caching + mounting --------------------------------------------------
   perf-B: rebuild only when (desktop-ness × CURWEEK) changes, never on an
   ordinary repaint. `peekKey()` doubles as "should a peek even show" — '' on
   a phone, so callers can treat falsy as "no preview". */
let cacheKey = ''
let cacheHTML = ''
export function peekKey(): string {
  if (typeof window === 'undefined' || window.innerWidth <= 820) return ''
  /* the stash generation of NEXT week rides the key: an edited-and-left next
     week (the per-week session stash) must re-render the preview when we
     come back to this one — CURWEEK alone returns to the same value and
     would serve the pre-edit markup forever. Per-key generation, so ordinary
     edits to the LOADED week never touch the preview (perf-B). */
  return CURWEEK + '|' + stashGenOf(shiftWeek(CURWEEK, 1))
}
export function peekWeekHTML(): string {
  const key = peekKey()
  if (!key) return ''
  if (key === cacheKey) return cacheHTML
  /* the preview shows next week AS THE APP REMEMBERS IT — the session stash
     when the scheduler has edited that week (the same source the cross-week
     flag seeds read), the pure seed otherwise. A corrupt stash entry parses
     to null and degrades to the seed, matching weekctx's own fallback. */
  const nextWk = shiftWeek(CURWEEK, 1)
  const bundle = stashDays(nextWk) || weekBundle(nextWk)
  cacheHTML = bundle.days.map((d: any, i: number) => peekDayHTML(d, i, i === 0)).join('')
  cacheKey = key
  return cacheHTML
}
/* Sync the trailing peek nodes after the live-day diff has settled.
   `liveCount` is the number of real day sections at the FRONT of `root`
   (ViewWeek/EditWeek's own `html.length`) — the peek nodes are always
   everything after that, so the live-day diff loop (which only ever touches
   `root.children[0..liveCount)`) can never collide with this.
   Returns the new cache key to store in the caller's ref; a no-op (same key
   AND the DOM already matches the shape that key implies) touches no DOM at
   all — the perf-B guarantee an ordinary one-day edit relies on. A "whole"
   live rebuild (`root.innerHTML = ...`) wipes any trailing peek nodes as a
   side effect of replacing the parent's content; this self-heals that even
   when the key itself did not change, by checking the actual child count
   rather than trusting the cached key alone. */
export function mountPeek(root: HTMLElement, liveCount: number, prevKey: string): string {
  const key = peekKey()
  const hasPeek = root.children.length > liveCount
  if (key === prevKey && hasPeek === !!key) return prevKey
  while (root.children.length > liveCount) root.lastElementChild!.remove()
  if (key) root.insertAdjacentHTML('beforeend', peekWeekHTML())
  return key
}
