/* THE ONE CHANGES WINDOW ([DRAFT-PENDING], 28 Sep 26).

   HIS WORDS: D168 — "One changes window makes sense": it replaces the published day's pending list (D99, D100), the
   unpublished day's list (D118) and the Edit history list (D116, D117). D167 — "an adjustable window that can be
   resized and moved around and the admin can still work on the schedule while referring to the changes … when the admin
   clicks on the item, it brings the background view to that area of change but keeps the window open … for the phone
   … see what u can forgo or keep". D170 — no Hand over button: a change someone else made is NEW TO YOU until you press
   "Mark all as seen"; the app groups changes by person and sitting on its own; every line says who and when. D169 (with
   D211) — members read it too, read only, medical changes in full. D171 — the doors (the day's count for everyone; the
   admin's top-bar clock with the week's count). D119 — "To go out" newest first. The design of record:
   docs/mock/changes-window.html, option A.

   The ALL AVAIL window's pattern (ui/floatwin.ts — where it sits, the grip, the corner, the phone's bottom panel): a
   third kind of surface, neither a Sheet nor a popup — it never closes on a tap outside it; it closes on ✕, a page
   change, a week change and a sign-in or sign-out (state/view.ts CHGWIN). While it is open, History mode is on (the
   bubbles on the board and the edit week).

   [CHG-BY-ITEM] / [HIST-PHONE-HIDE] (28 Sep 26 — D339, D340, D344, D345; the approved mock-ups
   docs/img/handpass/2026-09-28-draft-pending/byitem/ and …/histphone/): "Group by: Item / Who", Item first and the default
   — one group per item, the latest-changed on top, every line item-first; every group open until folded. On a phone
   "Hide ▾" beside ✕ sends the panel to the slim bar ("History on · N changes" · "Show ▴"), and where History draws its
   dots the panel says so in his words: "History on: Tap a gold dot on the schedule". */
import { useFloatWin, phoneLayout, frontWin, raiseWin, BOARD_BAR } from './floatwin'
import { useVersion } from './useStore'
import { HOOKS } from '../engine/hooks'
import { notify } from '../state/store'
import { CHGWIN, CHGWIN_BOX, setChgWin, setChgWinBox, CHGFOLD, type ChgWin } from '../state/view'
import { linesFor, byWho, byItem, whoEntry, dayCounts, weekRows, type CLine, type Entry } from './changesmodel'
import { weekDates, elogWhen } from '../engine/editlog'
import { CURWEEK } from '../engine/waves'
import { DAYS } from '../engine/data'
import { INPUTS, inpId, inputCoversDate } from '../engine/inputs'
import { posKey } from '../engine/rowids'
import { standsOn } from '../engine/overlay'
import { dayApproved, dayPendingItems, nextSeq } from '../engine/publish'
import { markSeen } from '../state/changes'
import { isMember, isAdmin } from '../state/perms'
import { pendListHTML, pendKeysFor } from './pendlist'
import { jumpToChange } from './interactions'
import { histJumpable, weekJumpable } from './histbubble'
import { SBDAY, CURPAGE, DPREV } from '../state/view'
import { useEffect, useState } from 'react'

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const dm = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${d}/${m}` }

export { openChanges } from './changesopen'

/* where a tap on a line takes the schedule, and on which day of the loaded week — null when it has nowhere to go */
export function jumpOf(l: CLine, days: string[], pick: string | null): { keys: string[]; di: number } | null {
  const inWeek = (d: string | null | undefined) => d != null && days.includes(d)
  const di0 = pick && days.includes(pick) ? days.indexOf(pick) : days.findIndex(d => l.rows.some(r => r.date === d || (r.date && r.end && r.date <= d && d <= r.end)))
  if (l.iid) {
    const inp: any = INPUTS.find((x: any) => inpId(x) === l.iid)
    if (!inp) return null
    const keys: string[] = []
    /* an accepted request: its row on the programme first (Astra DP-08), then its row under Unavailable. Its STANDING row
       only — a dead kept row (a version's row on a day the request no longer covers, D363) carries its id but is not its
       row, and a line never goes there ([DB-READINESS] phase 6 (c), the FULL check: Astra's scenario design §3 C) */
    DAYS.forEach((d: any, di: number) => { const g = standsOn(d, l.iid, inp); const ri = g ? (d.ground || []).indexOf(g) : -1; if (ri >= 0) keys.push(`g:${di}.${ri}`) })
    /* the day it goes to is a day its row is DRAWN on now — its programme row's day, or a day its dates cover (under
       Unavailable or Personal Inputs) — the chosen day only when it is one of them: a line shown on a day by the days the
       input LEFT goes to where it is now (Astra's read of the fixes, 03); drawn on no day of this week, the line is listed,
       not a button (Fable's final read, F5) */
    const on = new Set<number>()
    DAYS.forEach((d: any, di: number) => {
      if (di >= days.length) return
      if (standsOn(d, l.iid, inp) || (d.dt && inputCoversDate(inp, d.dt))) on.add(di)
    })
    if (!on.size) return null
    keys.push(`iu:${l.iid}`)
    const pi = pick ? days.indexOf(pick) : -1
    const di = on.has(pi) ? pi : on.has(di0) ? di0 : Math.min(...on)
    return { keys, di }
  }
  if (!l.key || !inWeek(l.date)) return null
  const pk = posKey(l.key, DAYS)
  return { keys: [String(pk == null ? l.key : pk)], di: days.indexOf(l.date!) }
}

/* a line with nowhere to go on THIS page is listed but is not a button (the old list's rule, kept — a tap that does
   nothing reads as a tap that did not register): no key and no input; a detail the board does not draw, while on the
   board (the area strip, the in-times, the traffic, the wave's title); the traffic on the week */
function canGo(l: CLine, j: { keys: string[] } | null): boolean {
  if (!j) return false
  if (l.iid) return true
  return SBDAY != null ? histJumpable(l.key) : weekJumpable(l.key)
}

/* an entry's line under its item — a jump goes to ITS place (a move's "moved out" entry to where he left) */
const lineOf = (e: Entry): CLine => ({ ...e.line, key: e.key, date: e.date, ...(e.iid ? { iid: e.iid } : {}) })

/* ONE ENTRY, item-first (D340): with `title` — a whole line, the item in bold over its change; without — a sub-line under
   its item's header, the change beside who and when. A detail (a seat, a field) is a tag before the change. */
function EntryLine({ e, title, onGo, go: may }: { e: Entry; title?: string; onGo: (e: Entry) => void; go: boolean }) {
  const who = <span className="cw-who">{e.line.who} · {elogWhen(e.t)}</span>
  const change = (
    <>
      {e.detail ? <span className="cw-det">{e.detail}</span> : null}
      {e.text}
      {/* a line with its own words AND a from → to (a warning hidden, [WARN-HIDE-KEPT]) keeps a gap between the two */}
      {e.text && (e.from || e.to) ? ' ' : null}
      {e.from || e.to ? <>{e.from ? <s>{e.from}</s> : null}{e.from && e.to ? ' → ' : ''}{e.to ? <b>{e.to}</b> : null}</> : null}
    </>
  )
  const dot = e.fresh ? <span className="cw-dot" aria-label="new to you" /> : null
  /* the men of one filing, listed once under its line (D663 — ui/changesmodel.ts mergeFiled) */
  const names = e.names ? <span className="cw-names" data-testid="cw-names">{e.names.join(' · ')}</span> : null
  const body = title != null
    ? <><span className="cw-top">{dot}<b className="cw-what">{title}</b>{who}</span><span className="cw-txt">{change}</span>{names}</>
    : <><span className="cw-top cw-sub">{dot}<span className="cw-txt">{change}</span>{who}</span>{names}</>
  const cls = 'cw-l' + (e.fresh ? ' fresh' : '')
  return may
    ? <button className={cls} data-cwkey={e.key || undefined} onClick={() => onGo(e)} title="Go to this change">{body}</button>
    : <div className={cls + ' still'} data-cwkey={e.key || undefined} title="This change has no place on this page to go to">{body}</div>
}

/* THE LAYOUT FOLLOWS THE SCREEN, NOT ONLY THE DATA. Hide, the phone bar and the hint are read from the screen's width,
   and nothing in the app's data moves when a phone is turned sideways or a window is narrowed — so the window listens
   for the two widths it reads (the phone layout, and a tap raising a bubble) and redraws the moment either is crossed
   (Astra's final read, FR-02: Hide stayed missing, or the bar stayed, until some other change redrew). Re-armed when the
   window opens, so it listens to the screen as it is then. */
function useLayoutWatch(open: boolean) {
  const [, bump] = useState(0)
  useEffect(() => {
    if (!open || typeof window === 'undefined' || !window.matchMedia) return
    const qs = ['(max-width:620px)', '(max-width:820px)'].map(q => window.matchMedia(q))
    const on = () => bump(n => n + 1)
    qs.forEach(m => m.addEventListener ? m.addEventListener('change', on) : (m as any).addListener(on))
    return () => qs.forEach(m => m.removeEventListener ? m.removeEventListener('change', on) : (m as any).removeListener(on))
  }, [open])
}

export function ChangesWindow() {
  useVersion()
  const w = CHGWIN
  useLayoutWatch(!!w)
  /* the phone's slim bar sits where the stylesheet puts it — at the bottom — whatever height the panel was dragged to:
     it is there so the change behind can be seen, so it hands the box back for the bar and takes it again when the
     panel comes back ([DRAFT-PENDING], Fable P8 — the bar floated mid-screen at the dragged panel's top) */
  const { el, onBarDown, onBarMove, onBarUp } = useFloatWin({
    open: !!w, getBox: () => (CHGWIN && CHGWIN.bar && phoneLayout() ? null : CHGWIN_BOX), setBox: setChgWinBox,
    deps: [w ? 'open' : 'shut'],
    closeSel: '.win-x, .win-hide',            // a press on Hide never starts a drag of the panel
    ...BOARD_BAR,                             // never over the board's preview bar ([AVAILWIN-PREVIEW-BAR])
  })
  if (!w || !isMember()) return <div className="chgwin" hidden />

  const days = weekDates(CURWEEK)
  const one = w.day !== 'week' && days.includes(w.day)
  const di = one ? days.indexOf(w.day) : -1
  const pick = one ? [w.day] : days
  const lines = linesFor(pick)
  const fresh = lines.filter(l => l.fresh)
  const dots = dayCounts()   // the picker's gold dots, one pass for the seven days (Fable F6)
  const published = one && dayApproved(di)
  const pend = published ? dayPendingItems(di).length : 0
  const outDays = days.map((d, i) => ({ d, i, n: dayApproved(i) ? dayPendingItems(i).length : 0 })).filter(x => dayApproved(x.i))
  const hasOut = one ? published : outDays.length > 0
  const tab = w.tab === 'out' && !hasOut ? 'all' : w.tab
  const phone = phoneLayout()
  const member = !isAdmin()
  /* where History draws its dots and answers a tap — the edit week and the live board (D116, D338 (3)). View-only draws
     none, and neither does the board while it shows an issued version (a look wears no dots — Astra's final read FR-05,
     Fable's F3): there the hidden bar reads "Changes", not "History on" */
  const histHere = CURPAGE === 'editsched' && (SBDAY == null || !DPREV.has(SBDAY))
  /* the hint promises gold dots, so only where there can be some: a change on this week that has a place on the schedule
     (a seat, a box, an input's row) — a week of publishes and day lines alone has none (Fable's final read, F3) */
  const anyDots = histHere && weekRows().some((r: any) => r.key || r.iid)

  const set = (patch: Partial<ChgWin>) => { setChgWin({ ...w, ...patch }); notify() }
  const close = () => { setChgWin(null); notify() }
  const go = (e: Entry) => {
    const l = lineOf(e)
    const j = jumpOf(l, days, one ? w.day : null)
    if (!j) return
    /* the window STAYS OPEN (D167); on a phone it shrinks to a slim bar so the change can be seen (D167 (2)) */
    if (phone) setChgWin({ ...w, bar: true })
    jumpToChange(j.keys, j.di)
  }
  const onOut = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement
    const pd = t.closest('[data-cwday]') as HTMLElement | null
    if (pd) { set({ day: pd.dataset.cwday!, tab: 'out' }); return }
    const keys = pendKeysFor(t)
    if (!keys) return
    if (phone) setChgWin({ ...w, bar: true })
    jumpToChange(keys, di)
  }

  /* THE PHONE BAR — after Hide ([HIST-PHONE-HIDE], D339, D345) or a tap that took the schedule to a change (D167 (2)): at
     the bottom, "History on · N changes" where History draws its dots ("Changes · N changes" where it draws none — View-only
     Sched), and "Show ▴" — the whole of it one button that brings the panel back; ✕ closes the window, History with it.
     A press on it raises it over the ALL AVAIL window (Astra 07). */
  if (w.bar && phone) {
    const n = lines.length
    return (
      <div className={'chgwin bar' + (frontWin() === 'chg' ? ' front' : '')} ref={el} role="dialog" aria-label="Changes"
        onPointerDownCapture={() => { if (raiseWin('chg')) notify() }}>
        <button className="cw-barbtn" onClick={() => set({ bar: false })} aria-label={`Show the changes — ${n} change${n === 1 ? '' : 's'}`}>
          <span className="cw-barl">{histHere ? 'History on' : 'Changes'}</span><span className="cw-barn">{' · '}{n} change{n === 1 ? '' : 's'}</span>
          <span className="cw-show">Show ▴</span>
        </button>
        <button className="win-x" onClick={close} title="Close — History off" aria-label="Close">&#10005;</button>
      </div>
    )
  }

  const title = one ? `Changes · ${(DAYS as any)[di]?.dow || ''} ${dm(w.day)}` : `Changes · week of ${dm(days[0]!)}`
  const sub = one
    ? (published ? (pend ? `Published · ${pend} change${pend === 1 ? '' : 's'} waiting to go out as AL${nextSeq(di)}` : 'Published · nothing waiting to go out') : 'Not yet published')
    : `${lines.length} change${lines.length === 1 ? '' : 's'} this week`

  const shown = tab === 'new' ? fresh : lines
  const byItems = w.group !== 'who'
  const items = byItems ? byItem(shown, !one, pick) : []
  const whos = byItems ? [] : byWho(shown)
  /* EVERY GROUP OPEN until he folds it (D345 — "every group open by default"; the later word over D167 (4)'s "new opens,
     the rest fold", for Item and Who alike — Astra's plan read 06); a fold holds while the window is open */
  const isOpen = (key: string) => CHGFOLD.has(key) ? !!CHGFOLD.get(key) : true
  const fold = (key: string, open: boolean) => { CHGFOLD.set(key, !open); notify() }
  const may = (e: Entry) => canGo(lineOf(e), jumpOf(lineOf(e), days, one ? w.day : null))
  const hm = (t: number) => elogWhen(t).split(' ')[1]

  return (
    <div
      className={'chgwin' + (frontWin() === 'chg' ? ' front' : '')}
      ref={el}
      role="dialog"
      aria-label={title}
      onPointerDownCapture={() => { if (raiseWin('chg')) notify() }}
    >
      <div className="win-bar" onPointerDown={onBarDown} onPointerMove={onBarMove} onPointerUp={onBarUp} onPointerCancel={onBarUp}>
        {/* D40 — the app's own six-dot grip, "drag me" */}
        <span className="win-grip" aria-hidden="true">&#10303;</span>
        <span className="win-ttl">{title}<small>{sub}</small></span>
        {/* HIDE — the phone only (D345): the panel goes to the slim bar at the bottom, History stays on, the schedule shows */}
        {phone ? <button className="win-hide" onClick={() => set({ bar: true })} title="Hide the list — see the schedule" aria-label="Hide the list">Hide ▾</button> : null}
        <button className="win-x" onClick={close} title="Close" aria-label="Close">&#10005;</button>
      </div>
      {/* the hint, in his words (D344), where a TAP raises a bubble on a dotted detail (the bubble's own gesture test —
          Fable F5) and there are dots to tap */}
      {HOOKS.isPhone() && anyDots ? <div className="cw-hint">History on: Tap a gold dot on the schedule</div> : null}

      <div className="win-tabs" role="tablist">
        <button className={'win-tab' + (tab === 'new' ? ' on' : '')} role="tab" aria-selected={tab === 'new'} onClick={() => set({ tab: 'new' })}>
          New to you <span className="c">{fresh.length}</span>
        </button>
        <button className={'win-tab' + (tab === 'all' ? ' on' : '')} role="tab" aria-selected={tab === 'all'} onClick={() => set({ tab: 'all' })}>
          All changes <span className="c">{lines.length}</span>
        </button>
        {hasOut ? (
          <button className={'win-tab' + (tab === 'out' ? ' on' : '')} role="tab" aria-selected={tab === 'out'} onClick={() => set({ tab: 'out' })}>
            To go out{one ? ` · AL${nextSeq(di)}` : ''} <span className="c">{one ? pend : outDays.reduce((a, x) => a + x.n, 0)}</span>
          </button>
        ) : null}
      </div>

      <div className="cw-days" role="group" aria-label="Which day">
        <button className={'cw-day' + (!one ? ' on' : '')} onClick={() => set({ day: 'week' })}>Week</button>
        {days.map((d, i) => {
          const n = (dots[d]?.fresh || 0) > 0
          return <button key={d} className={'cw-day' + (w.day === d ? ' on' : '') + (n ? ' nd' : '')} onClick={() => set({ day: d })} title={n ? 'Something new to you' : undefined}>{DOW[i]}</button>
        })}
      </div>

      {tab !== 'out' ? (
        <div className="cw-grp">
          <span className="cw-grpl">Group by</span>
          <button className={'cw-g-btn' + (byItems ? ' on' : '')} onClick={() => set({ group: 'item' })}>Item</button>
          <button className={'cw-g-btn' + (!byItems ? ' on' : '')} onClick={() => set({ group: 'who' })}>Who</button>
        </div>
      ) : null}

      <div className="win-body cw-body">
        {tab === 'out' ? (
          one
            ? <div className="cw-out" onClick={onOut} dangerouslySetInnerHTML={{ __html: pendListHTML(di) }} />
            : <div className="cw-out" onClick={onOut}>
                {outDays.map(x => <button key={x.d} className="cw-outday" data-cwday={x.d}><b>{(DAYS as any)[x.i]?.dow}</b> {x.n ? `${x.n} waiting to go out as AL${nextSeq(x.i)}` : 'nothing waiting'}</button>)}
              </div>
        ) : !(byItems ? items.length : whos.length) ? (
          <div className="cw-none">{tab === 'new'
            ? (one ? `Nothing new to you on ${(DAYS as any)[di]?.dow || 'this day'}.` : 'Nothing new to you this week.')
            : (one ? `No changes on ${(DAYS as any)[di]?.dow || 'this day'} yet.` : 'No changes this week yet.')}</div>
        ) : byItems ? items.map(g => {
          /* an item changed once is ONE line; more, a header and a line per change, newest first (D345) */
          if (g.one) return <div className="cw-g cw-one" key={g.key}><EntryLine e={g.entries[0]!} title={g.title} onGo={go} go={may(g.entries[0]!)} /></div>
          const open = isOpen(g.key)
          return (
            <div className="cw-g" key={g.key}>
              <button className="cw-gh" aria-expanded={open} onClick={() => fold(g.key, open)}>
                <span className="cw-caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
                <span className="cw-ghname">{g.title} <span className="cw-ghn">· {g.entries.length}</span></span>
                {g.fresh ? <span className="cw-new">NEW</span> : null}
                <span className="cw-ghwhen">{hm(g.t)}</span>
              </button>
              {open ? <div className="cw-gl">{g.entries.map(e => <EntryLine key={`${e.seq}.${e.move || ''}`} e={e} onGo={go} go={may(e)} />)}</div> : null}
            </div>
          )
        }) : whos.map(g => {
          const open = isOpen(g.key)
          const when = g.from === g.to ? elogWhen(g.to) : `${elogWhen(g.from)}–${hm(g.to)}`
          return (
            <div className="cw-g" key={g.key}>
              <button className="cw-gh" aria-expanded={open} onClick={() => fold(g.key, open)}>
                <span className="cw-caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
                <span className="cw-ghname">{g.who} · {g.lines.length} change{g.lines.length === 1 ? '' : 's'}</span>
                {g.fresh ? <span className="cw-new">NEW</span> : null}
                <span className="cw-ghwhen">{when}</span>
              </button>
              {/* Who keeps its sittings, its lines item-first — a move once, under the item he reached (D345) */}
              {open ? <div className="cw-gl">{g.lines.map((l: CLine) => { const e = whoEntry(l, !one, pick); return <EntryLine key={l.seqs.join('.')} e={e} title={e.title} onGo={go} go={may(e)} /> })}</div> : null}
            </div>
          )
        })}
      </div>

      <div className="win-foot cw-foot">
        {tab === 'new' ? (
          <button className="cw-seen" disabled={!fresh.length} onClick={() => { markSeen(fresh.flatMap(l => l.rows)); notify() }}>
            ✓ Mark all as seen
          </button>
        ) : member ? (
          <span className="hint">Read only — every change and who made it, for everyone to see.</span>
        ) : (
          <span className="hint">{tab === 'out' ? 'Tap a change to go to it.' : 'Tap a change to go to it — the window stays open.'}</span>
        )}
      </div>
    </div>
  )
}
