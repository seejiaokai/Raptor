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
   bubbles on the board and the edit week). */
import { useFloatWin, phoneLayout, frontWin, raiseWin } from './floatwin'
import { useVersion } from './useStore'
import { notify } from '../state/store'
import { CHGWIN, CHGWIN_BOX, setChgWin, setChgWinBox, CHGFOLD, type ChgWin } from '../state/view'
import { linesFor, byWho, byWhere, dayCounts, type CLine } from './changesmodel'
import { weekDates, elogWhen } from '../engine/editlog'
import { CURWEEK } from '../engine/waves'
import { DAYS } from '../engine/data'
import { INPUTS, inpId, inputCoversDate } from '../engine/inputs'
import { posKey } from '../engine/rowids'
import { dayApproved, dayPendingItems, nextSeq } from '../engine/publish'
import { markSeen } from '../state/changes'
import { isMember, isAdmin } from '../state/perms'
import { pendListHTML, pendKeysFor } from './pendlist'
import { jumpToChange } from './interactions'
import { histJumpable, weekJumpable } from './histbubble'
import { SBDAY } from '../state/view'

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
    /* an accepted request: its row on the programme first (Astra DP-08), then its row under Unavailable */
    DAYS.forEach((d: any, di: number) => (d.ground || []).forEach((g: any, ri: number) => { if (g && g.src === l.iid) keys.push(`g:${di}.${ri}`) }))
    /* the day it goes to is a day its row is DRAWN on now — its programme row's day, or a day its dates cover (under
       Unavailable or Personal Inputs) — the chosen day only when it is one of them: a line shown on a day by the days the
       input LEFT goes to where it is now (Astra's read of the fixes, 03); drawn on no day of this week, the line is listed,
       not a button (Fable's final read, F5) */
    const on = new Set<number>()
    DAYS.forEach((d: any, di: number) => {
      if (di >= days.length) return
      if ((d.ground || []).some((g: any) => g && g.src === l.iid) || (d.dt && inputCoversDate(inp, d.dt))) on.add(di)
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

function Line({ l, onGo, go: may }: { l: CLine; onGo: (l: CLine) => void; go: boolean }) {
  const body = (
    <>
      <span className="cw-top">
        {l.fresh ? <span className="cw-dot" aria-label="new to you" /> : null}
        <b className="cw-what">{l.title}</b>
        <span className="cw-who">{l.who} · {elogWhen(l.t)}</span>
      </span>
      {l.text ? <span className="cw-txt">{l.text}</span> : null}
      {l.from || l.to ? <span className="cw-txt">{l.from ? <s>{l.from}</s> : null}{l.from && l.to ? ' → ' : ''}{l.to ? <b>{l.to}</b> : null}</span> : null}
    </>
  )
  return may
    ? <button className={'cw-l' + (l.fresh ? ' fresh' : '')} data-cwkey={l.key || undefined} onClick={() => onGo(l)} title="Go to this change">{body}</button>
    : <div className={'cw-l still' + (l.fresh ? ' fresh' : '')} data-cwkey={l.key || undefined} title="This change has no place on this page to go to">{body}</div>
}

export function ChangesWindow() {
  useVersion()
  const w = CHGWIN
  /* the phone's slim bar sits where the stylesheet puts it — at the bottom — whatever height the panel was dragged to:
     it is there so the change behind can be seen, so it hands the box back for the bar and takes it again when the
     panel comes back ([DRAFT-PENDING], Fable P8 — the bar floated mid-screen at the dragged panel's top) */
  const { el, onBarDown, onBarMove, onBarUp } = useFloatWin({
    open: !!w, getBox: () => (CHGWIN && CHGWIN.bar && phoneLayout() ? null : CHGWIN_BOX), setBox: setChgWinBox,
    deps: [w ? 'open' : 'shut'],
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

  const set = (patch: Partial<ChgWin>) => { setChgWin({ ...w, ...patch }); notify() }
  const close = () => { setChgWin(null); notify() }
  const go = (l: CLine) => {
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

  /* THE PHONE BAR — after a tap took the schedule to a change (D167 (2)); a tap brings the panel back */
  if (w.bar && phone) {
    return (
      <div className={'chgwin bar' + (frontWin() === 'chg' ? ' front' : '')} ref={el} role="dialog" aria-label="Changes">
        <button className="cw-barbtn" onClick={() => set({ bar: false })}>
          Changes{fresh.length ? ` · ${fresh.length} new` : ''} <span aria-hidden="true">▴</span>
        </button>
        <button className="win-x" onClick={close} title="Close" aria-label="Close">&#10005;</button>
      </div>
    )
  }

  const title = one ? `Changes · ${(DAYS as any)[di]?.dow || ''} ${dm(w.day)}` : `Changes · week of ${dm(days[0]!)}`
  const sub = one
    ? (published ? (pend ? `Published · ${pend} change${pend === 1 ? '' : 's'} waiting to go out as AL${nextSeq(di)}` : 'Published · nothing waiting to go out') : 'Not yet published')
    : `${lines.length} change${lines.length === 1 ? '' : 's'} this week`

  const shown = tab === 'new' ? fresh : lines
  const groups = w.group === 'where' ? byWhere(shown) : byWho(shown)
  const anyFresh = groups.some(g => g.fresh)
  const isOpen = (key: string, gFresh: boolean, i: number) => CHGFOLD.has(key) ? !!CHGFOLD.get(key) : (gFresh || (!anyFresh && i === 0) || tab === 'new')
  const fold = (key: string, open: boolean) => { CHGFOLD.set(key, !open); notify() }

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
        <button className="win-x" onClick={close} title="Close" aria-label="Close">&#10005;</button>
      </div>

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
          <button className={'cw-g-btn' + (w.group === 'who' ? ' on' : '')} onClick={() => set({ group: 'who' })}>Who</button>
          <button className={'cw-g-btn' + (w.group === 'where' ? ' on' : '')} onClick={() => set({ group: 'where' })}>Where</button>
        </div>
      ) : null}

      <div className="win-body cw-body">
        {tab === 'out' ? (
          one
            ? <div className="cw-out" onClick={onOut} dangerouslySetInnerHTML={{ __html: pendListHTML(di) }} />
            : <div className="cw-out" onClick={onOut}>
                {outDays.map(x => <button key={x.d} className="cw-outday" data-cwday={x.d}><b>{(DAYS as any)[x.i]?.dow}</b> {x.n ? `${x.n} waiting to go out as AL${nextSeq(x.i)}` : 'nothing waiting'}</button>)}
              </div>
        ) : !groups.length ? (
          <div className="cw-none">{tab === 'new'
            ? (one ? `Nothing new to you on ${(DAYS as any)[di]?.dow || 'this day'}.` : 'Nothing new to you this week.')
            : (one ? `No changes on ${(DAYS as any)[di]?.dow || 'this day'} yet.` : 'No changes this week yet.')}</div>
        ) : groups.map((g: any, i: number) => {
          const open = isOpen(g.key, g.fresh, i)
          const head = w.group === 'where'
            ? <>{g.label} · {g.lines.length} change{g.lines.length === 1 ? '' : 's'}</>
            : <>{g.who} · {g.lines.length} change{g.lines.length === 1 ? '' : 's'}</>
          const when = w.group === 'who' ? (g.from === g.to ? elogWhen(g.to) : `${elogWhen(g.from)}–${elogWhen(g.to).split(' ')[1]}`) : ''
          return (
            <div className="cw-g" key={g.key}>
              <button className="cw-gh" aria-expanded={open} onClick={() => fold(g.key, open)}>
                <span className="cw-caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
                <span className="cw-ghname">{head}</span>
                {g.fresh ? <span className="cw-new">NEW</span> : null}
                {when ? <span className="cw-ghwhen">{when}</span> : null}
              </button>
              {open ? <div className="cw-gl">{g.lines.map((l: CLine) => <Line key={l.seqs.join('.')} l={l} onGo={go} go={canGo(l, jumpOf(l, days, one ? w.day : null))} />)}</div> : null}
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
