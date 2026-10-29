/* THE PERSON WINDOW — ONE MAN'S LEAVE FIGURES AND HIS LEAVE (the Leave War overhaul's M5a, jobs 1–2 — D1480, D1148, D1201,
   D1203, D1209, D1231, D1481, D1238–D1241, D1251–D1253, D1327, D1328, D1292, D1008, D1220; red-team fixes A1, A5, A10, B6,
   B12; the build spec docs/superpowers/plans/2026-10-28-lw-m5a-build-spec.md §2.1; readings 5, 6, 7, 15, 23).

   Built to its drawings of record (D1424, D1478): `full/m5a/m5a-p2-desk-drawn` (an admin, desktop, docked at the grid's
   right edge, locked for members), `m5a-p4-phone-own` (a member's own on a phone, his new lines dotted), `m5a-p5-phone-
   locked`, `m5a-p6-phone-other` (another man's, read only, no dots) and the tiles `m5a-c-approved` / `m5a-c-vs-20d` — their
   markup, sizes and colours are `docs/mock/lw-overhaul/full-m5a-person.mjs`'s own (round 20d's tiles), carried into
   `personwindow.css` under the drawing's class names. It replaces the old figures sheet and the breakdown a tap on the LVE
   figure beside a name opened (reading 15 — that tap opens this window now).

   THE FIGURES are the store's one engine (`leaveFiguresOf` — the spec §1.6), so this window, the Balances page, the grid's
   figure beside his name, My leave and Approvals cannot disagree. A BOX only where the viewer may type (`balanceProblem` —
   an admin any row, a member his own while unlocked; locked, a member's boxes go and an admin's stay — D1203, D1220, D1242);
   the box is the Balances page's own (FigBox — saved on Enter or leaving it, Escape back, one tap then typing replaces, the
   man and kind taken when it takes the keyboard: the scenario designer's ★17; a text keypad for a minus: ★20), saved through
   the page's one door (`saveTypedFigure` — a save of either LVE box writes the whole row afresh). OIL is never typed: its
   "0 ›" opens his OIL tracker (D1209, D1008).

   HIS LEAVE (ui/personleave.ts): one line a leave, no puck, led by its kind's box (D1327, D1328), the year picker over it
   (D1148 — this year and ahead, a past year from its list), a paperclip opening its papers (D1292), a tap taking the grid
   there with the ring (D1449, D860 — Approvals' own way). On HIS OWN window only, what someone else changed since he last
   opened it wears the dot and a muted "who, when" (D1231, D1481); the visit's moment is taken when it opens (Matrix —
   state/lwseen.ts `openOwnWindow`), so the dots go when he closes it and a reload keeps the moment.

   WHERE IT STANDS (A5, D641, D997): a window that does not block — on a desktop docked at the grid's right edge, dragged by
   its title, the grid working behind it; on a phone in the middle of the screen. Matrix portals it into the Leave War's own
   page, so it stands over the Balances and Approvals pages too (the grid card is hidden behind those).

   SPEED (docs/performance.md §E): everything here is its own; the grid's rows are not handed a thing that changes with it. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { FIGURES, memberToday, type Person } from '../engine'
import type { BalKind } from '../engine/leaveyear'
import { balanceProblem, balancesLocked, figureCtxOf, getState, leaveFiguresOf } from '../state/store'
import { FigBox, figWords, saveTypedFigure } from './BalancesPage'
import { LeaveLine } from './LeaveLine'
import { datesWords, inYear, pastYears, personLeave, type PwLine, type YearPick } from './personleave'
import { Sheet } from './Sheet'
import { usePhone } from './phone'
import { useVersion } from './useStore'
import './personwindow.css'

const OIL = FIGURES.find(f => f.id === 'oil')!
const OTHER: Exclude<BalKind, 'LVE'>[] = ['CCL', 'FCL', 'PL', 'EL', 'CL']

/* the kind's box as round 7 draws it (full-r7-person.mjs KIND — LVE wears LL's light amber) */
const KIND: Record<string, [string, string, number]> = {
  LVE: ['242,200,110', '#FFF1CF', 0.22], OIL: ['70,196,108', '#DDF8E6', 0.38], MED: ['236,104,140', '#FFD0DD', 0.26],
  CCL: ['138,150,255', '#DCE0FF', 0.32], FCL: ['138,150,255', '#DCE0FF', 0.32], PL: ['138,150,255', '#DCE0FF', 0.32],
  EL: ['138,150,255', '#DCE0FF', 0.32], CL: ['138,150,255', '#DCE0FF', 0.32],
}
function Kb({ k }: { k: string }) {
  const [h, ink, fill] = KIND[k]!
  return <span className="r7-kb appr" style={{ '--h': h, '--ink': ink, '--fill': fill } as CSSProperties}><b>{k}</b></span>
}
/* the drawing's own glyphs (full-propose.mjs LOCK_SVG; full-m5a-person.mjs CLIP) */
function Lock() {
  return (
    <svg viewBox="0 0 10 12" width="9" height="11" aria-hidden="true">
      <rect x="1.2" y="5.2" width="7.6" height="5.8" rx="1.3" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 5.2V3.6a2 2 0 0 1 4 0v1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
function Clip() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l7.9-7.9" />
    </svg>
  )
}

/** a figure read only (round 20d's `r17-box ro`) */
function Ro({ v, sm, testid }: { v: number; sm?: boolean; testid?: string }) {
  return <span className={`r17-box ro${sm ? ' sm' : ''}${v === 0 ? ' z' : ''}`} data-testid={testid}>{figWords(v)}</span>
}

const PANEL = () => document.querySelector<HTMLElement>('[data-testid="person-window"]')

/* WHERE IT DOCKS on a desktop (the drawing `full/m5a/m5a-p2-desk-drawn` — D1480, D1493): its right edge 8px inside the grid
   card's, its top 8px under the app's top bar, over the Leave War's tab row; 560 wide; as tall as what is in it down to
   10px off the screen's foot, so his leave lines stand in view. (The drawing script docked it 64 under the card's top
   clamped to the screen's — its page was scrolled, the card's top above the screen, so the window stood just under the
   bar; built from the formula on a page at rest, it stood 64 under the grid card at y 200 and its last lines ran below the
   screen's foot — his pick of 29 Oct 26 puts it where the picture has it.) The grid card is hidden behind the Balances
   and Approvals pages, so there the Leave War's page stands in for it. */
function dock(p: HTMLElement): void {
  const grid = document.querySelector('#page-leavewar .mx-outer')?.parentElement
  let r = grid?.getBoundingClientRect()
  if (!r || !r.width) r = document.getElementById('page-leavewar')?.getBoundingClientRect()
  if (!r || !r.width) return
  /* under whichever stands lower on screen: the app's top bar, or the Leave War's own row of tabs, View, My leave and ⚙ —
     the drawing's page was scrolled, its tab row out of sight; at rest, under the bar alone, the window covered My leave and
     ⚙ (the host's look at the fix, 29 Oct 26 — nothing sits over a control) */
  const appBar = document.querySelector('.topbar:not(.lw-top)')?.getBoundingClientRect().bottom ?? 0
  const lwRow = document.querySelector('#page-leavewar .lw-top')?.getBoundingClientRect()
  const bar = Math.max(appBar, lwRow && lwRow.height ? lwRow.bottom : 0)
  const w = Math.min(560, window.innerWidth - 24)
  const top = Math.round(bar + 8)
  p.style.left = `${Math.round(Math.max(12, Math.min(r.right, window.innerWidth) - 8 - w))}px`
  p.style.top = `${top}px`
  p.style.bottom = 'auto'
  /* its height is the stylesheet's, from this top (personwindow.css): down to 10px off the screen's foot — or, while
     Approvals' slim bar is up, above the bar, which can come up while the window stands (the walk's A-F6; the M5a browser
     tests, 29 Oct 26: docked, its foot ran across the bar) */
  p.style.setProperty('--pw-top', `${top}px`)
  p.style.maxHeight = ''
  /* it places itself: the shared window's keyboard follower leaves it alone while no keyboard is up (Sheet.tsx) */
  p.dataset.docked = '1'
}

export function PersonWindow({ person, since, hasRow, onClose, onOil, onGo }: {
  person: Person
  /** the moment he last opened his own window before this visit (0 — never); null where nothing is new: another man's */
  since: number | null
  /** he has a row on the grid — where a leave line can take the grid (a SANS man while SANS is off has none: B12) */
  hasRow: boolean
  onClose: () => void
  /** "0 ›" — his OIL tracker */
  onOil: (pid: string) => void
  /** a leave line tapped — the grid at that day, the ring on it */
  onGo: (pid: string, date: string) => void
}) {
  const version = useVersion()
  const phone = usePhone()
  const pid = person.id
  const admin = getState().role === 'admin'
  const locked = balancesLocked()
  const f = leaveFiguresOf(pid)
  /* a box only where he may type (D1203, D1242, D1220): the store's own rule, asked for a figure it would take */
  const boxes = balanceProblem(pid, 'CCL', 0) === null
  const thisYear = +memberToday().slice(0, 4)
  /* the picker holds "and ahead" or a past year, never this year's number: "<this year> and ahead" is read from the app's
     today at each draw, so a window left open across midnight into a new year lists that year and ahead, as its label
     says (walker D's FAIL 6, 29 Oct 26: the label turned to 2027 while the list kept 2026's leave) */
  const [picked, setPicked] = useState<'ahead' | number>('ahead')
  const pick: YearPick = picked === 'ahead' ? { year: thisYear, ahead: true } : { year: picked, ahead: false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const all = useMemo<PwLine[]>(() => personLeave(pid, since), [pid, since, version])
  const lines = all.filter(l => inYear(l, pick))
  const years = pastYears(all, thisYear)
  const oil = OIL.value(figureCtxOf(), pid)

  /* WHERE IT STANDS: docked on a desktop (redone when the screen changes size); a phone's is the stylesheet's */
  useLayoutEffect(() => {
    const p = PANEL()
    if (!p) return
    if (phone) { p.style.left = ''; p.style.top = ''; p.style.bottom = ''; p.style.maxHeight = ''; delete p.dataset.docked; return }
    dock(p)
    const re = () => dock(p)
    window.addEventListener('resize', re)
    return () => window.removeEventListener('resize', re)
  }, [phone])

  /* THE KEYBOARD (the design guide §3): it opens with the keyboard on the window, so Tab walks it; Escape in a box he has
     typed in puts the old figure back FIRST (the window's own Escape — Sheet.tsx, on the document's capture — is heard after
     this one, on the window's), and the next Escape closes it; closing gives the keyboard back to what opened it */
  const opener = useRef<HTMLElement | null>(null)
  if (opener.current === null && typeof document !== 'undefined') opener.current = (document.activeElement as HTMLElement | null) ?? document.body
  useEffect(() => {
    const p = PANEL()
    if (p) { p.tabIndex = -1; p.focus({ preventScroll: true }) }
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const a = document.activeElement
      if (!(a instanceof HTMLInputElement) || !PANEL()?.contains(a) || !a.dataset.dirty) return
      e.stopPropagation(); e.preventDefault()
      a.dispatchEvent(new Event('lw-revert'))
    }
    window.addEventListener('keydown', esc, true)
    const back = opener.current
    return () => {
      window.removeEventListener('keydown', esc, true)
      /* only where the keyboard was in the window, or nowhere — a tap on another name keeps the keyboard on that name */
      const at = document.activeElement
      const lost = !at || at === document.body || !at.isConnected || !!PANEL()?.contains(at)
      if (lost && back && back !== document.body && back.isConnected) back.focus({ preventScroll: true })
    }
  }, [])

  const save = (kind: BalKind, part?: 'cf') => (n: number) => saveTypedFigure(pid, kind, n, part)
  const name = person.callsign
  const L = f.kinds.LVE
  /* WAR BAL WHOLE INSIDE ITS TILE, ALWAYS (his iPhone picture, 29 Oct 26 — the agent's fault fix with D1519's job): spread
     across the tile on a phone (personwindow.css), a long War bal in wide letters — "−12.5" on GitHub's Linux machines, as on
     an iPhone, 5.9 over at 402 — still ran under OIL. As a figure box does (BalancesPage.tsx fitFigure, the M5a walk's A-F3),
     a War bal longer than its room is drawn smaller until it ends inside the tile; one that fits keeps the tile's letters.
     Measured when the figure changes and whenever the tile's own width does — the window settles its width after it opens
     (GitHub's run, 29 Oct 26: measured at the opening, "17.5" stood 1.2 past at 375), so the tile is watched, not the screen. */
  const warRef = useRef<HTMLSpanElement | null>(null)
  useLayoutEffect(() => {
    const w = warRef.current
    if (!w) return
    const fit = () => {
      w.style.fontSize = ''
      const t = w.closest<HTMLElement>('.r17-lve')
      if (!t || !w.getBoundingClientRect().width) return
      const edge = t.getBoundingClientRect().right - (parseFloat(getComputedStyle(t).paddingRight) || 0)
      let px = parseFloat(getComputedStyle(w).fontSize) || 20
      for (let i = 0; i < 16 && px > 12 && w.getBoundingClientRect().right > edge + 0.5; i++) { px -= 0.5; w.style.fontSize = `${px}px` }
    }
    fit()
    const tile = w.closest<HTMLElement>('.r17-lve')
    /* the tile's width, not the war figure's own: a change of the figure's letters must not set the watch off again */
    let lastW = -1
    const ro = typeof ResizeObserver === 'function' && tile
      ? new ResizeObserver(es => { const cw = es[0]?.contentRect.width ?? 0; if (Math.abs(cw - lastW) < 0.5) return; lastW = cw; fit() })
      : null
    if (ro && tile) ro.observe(tile)
    window.addEventListener('resize', fit)
    return () => { ro?.disconnect(); window.removeEventListener('resize', fit) }
  }, [L.war, phone])
  /* nothing pending reads "–", as the Balances page writes it (walker D's note, 29 Oct 26: the tile drew "0" beside the
     page's "–") */
  const pend = (n: number) => (n ? `−${figWords(n)}` : '–')
  const app = boxes
    ? <FigBox value={L.app} label={`${name} LVE App bal`} testid="pw-LVE" cls="r17-box" fit={16} save={save('LVE')} />
    : <Ro v={L.app} testid="pw-LVE" />
  const cf = boxes
    ? <FigBox value={L.cf} sm label={`${name} LVE carried forward`} testid="pw-LVE-cf" cls="r17-box sm" fit={10} save={save('LVE', 'cf')} />
    : <Ro v={L.cf} sm testid="pw-LVE-cf" />
  const till = f.cfTill ? (() => { const d = new Date(`${f.cfTill}T12:00:00`); return `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}` })() : ''
  const yearWords = (p: YearPick) => (p.ahead ? `${p.year} and ahead` : String(p.year))

  return (
    <Sheet testid="person-window" label={`${name}'s leave`} onClose={onClose} modal={false}>
      <div className="bidsheet-hd">
        <span className="who" data-testid="pw-name">{name}</span>
        <button className="x" data-testid="pw-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="m5-body">
        <div className="r7-hd zz-balhd">
          <span>Balances</span>
          {/* the padlock while locked (A10, D1220): an admin's boxes stay, a member's go */}
          {locked && <span className="r14-lk" data-testid="pw-lock"><Lock />{admin ? 'Locked for members' : 'Locked by admin'}</span>}
        </div>
        <div className="r17-bal zz-balgrid">
          {/* LVE: App bal · Pending · War bal on one line, the pending figure amber, the word grey (D1251, D1252) */}
          <div className="r17-t r17-lve" data-testid="pw-tile-LVE">
            <span className="k"><Kb k="LVE" /><span className="tk" data-testid="pw-taken">{figWords(f.lveTaken)} taken</span></span>
            <div className="r17-sum">
              <span className="h" style={{ gridColumn: 1 }}>App bal</span>
              <span className="h" style={{ gridColumn: 2 }}>Pending</span>
              <span className="h" style={{ gridColumn: 3 }}>War bal</span>
              <span className="v" style={{ gridColumn: 1 }}>{app}</span>
              <span className={`v${L.pending ? ' pd' : ''}`} style={{ gridColumn: 2 }} data-testid="pw-LVE-pend">{pend(L.pending)}</span>
              <span className="v war" ref={warRef} style={{ gridColumn: 3 }} data-testid="pw-LVE-war">{figWords(L.war)}</span>
            </div>
            {/* THE DATE ON A LINE OF ITS OWN ON A PHONE (his "a", D1520 — his picture: "till 31 Dec" ran into the OIL tile): the
                desktop keeps the approved one line, its " · till …" inside the carried line; a phone shows the line below it
                instead (personwindow.css). Only one of the two is ever shown, so a screen reader reads the date once */}
            <span className="r17-cf">incl. {cf} carried fwd{till ? <span className="r17-tw">{` · till ${till}`}</span> : null}</span>
            {till && <span className="r17-till" data-testid="pw-LVE-till">till {till}</span>}
          </div>
          {/* OIL: read only, "0 ›" his OIL tracker (D1209, D1008) — never a box */}
          <div className="r17-t" data-testid="pw-tile-OIL">
            <span className="k"><Kb k="OIL" /></span>
            <span className={`f${oil === 0 ? ' z' : ''}`}>
              <button type="button" className="r17-oil" data-testid="pw-oil" aria-label={`${name}'s OIL tracker: ${figWords(oil)}`} onClick={() => onOil(pid)}>
                {figWords(oil)}<span className="r17-go">›</span>
              </button>
            </span>
          </div>
          <div className="r17-t" data-testid="pw-tile-MED">
            <span className="k"><Kb k="MED" /></span>
            <span className={`f${f.medTaken === 0 ? ' z' : ''}`} data-testid="pw-med">{figWords(f.medTaken)}</span>
            <span className="s">days</span>
          </div>
          {/* the other kinds: their box and, only while something is pending, "Pending −1 / War bal 2" (D1253) */}
          {OTHER.map(k => {
            const K = f.kinds[k]
            return (
              <div key={k} className="r17-t r2 st" data-testid={`pw-tile-${k}`}>
                <span className="k"><Kb k={k} /></span>
                <span className="f">
                  {boxes
                    ? <FigBox value={K.app} label={`${name} ${k}`} testid={`pw-${k}`} cls="r17-box" fit={16} save={save(k)} />
                    : <Ro v={K.app} testid={`pw-${k}`} />}
                </span>
                {K.pending !== 0 && <>
                  <span className="ln a"><span>Pending</span><b className="pd" data-testid={`pw-${k}-pend`}>−{figWords(K.pending)}</b></span>
                  <span className="ln b"><span>War bal</span><b data-testid={`pw-${k}-war`}>{figWords(K.war)}</b></span>
                </>}
              </div>
            )
          })}
        </div>
        <div className="r7-hd lv">
          <span>Leave</span>
          {/* THE YEAR PICKER (D1148): this year and ahead, then each past year his leave touches */}
          <span className="m5-yrw">
            <select
              className="m5-yr"
              data-testid="pw-year"
              aria-label="Which year's leave"
              value={pick.ahead ? 'ahead' : String(pick.year)}
              onChange={e => setPicked(e.target.value === 'ahead' ? 'ahead' : +e.target.value)}
            >
              <option value="ahead">{thisYear} and ahead</option>
              {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </span>
        </div>
        <div className="m5-list" data-testid="pw-list">
          {lines.length === 0 && <div className="m5-none">No leave in {yearWords(pick)}.</div>}
          {lines.map(l => (
            <LeaveLine
              key={l.key}
              testid={`pw-line-${l.from}`}
              personId={pid}
              code={l.code}
              state={l.state}
              box={l.box}
              from={l.from}
              to={l.to}
              days={l.days}
              noPuck
              dates={datesWords(l.from, l.to, l.half)}
              dot={!!l.news}
              who={l.news?.words}
              clip={l.openDocs && (
                <button type="button" className="m5-clip" data-testid={`pw-clip-${l.from}`}
                  aria-label={l.docN === 1 ? 'View the document' : `View ${l.docN} documents`}
                  onClick={e => { e.stopPropagation(); l.openDocs!() }}>
                  <Clip />
                </button>
              )}
              /* a leave line takes the grid there — not a deleted one (nothing stands there), not a man with no row (★15) */
              onGo={hasRow && l.state !== 'deleted' ? () => onGo(pid, l.from) : undefined}
            />
          ))}
        </div>
      </div>
    </Sheet>
  )
}
