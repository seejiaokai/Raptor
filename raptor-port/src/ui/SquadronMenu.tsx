/* THE SCHEDULES MENU — the top bar's squadron number as a button, "142 ▾" (the second-half plan §3 items 1–3; his D2301,
   D2304, D2132; the approved drawing, option A — docs/mock/2026-11-22-msq-b1-screens/img/mA1-d.png, mA1-p.png, and with
   eight squadrons f5d-p.png).
   - Who has one: whoever may read two squadrons or more (state/perms.ts readableUnits); one squadron, the plain mark.
   - The list: "SCHEDULES", then a row per squadron — a tick on the one in view, the number, a short grey label ("Your
     squadron", "Full access", "View only" — perms.ts menuSquadrons), every row 38 high on a desktop and a phone alike
     (D2304). The panel in the app's own small menu's look (18-oil-board.css .sb-moremenu / .sb-moreitem), hung under
     the mark on a desktop; on a phone a sheet from the top bar, the full width, the page under it dimmed.
   - Its keys: Escape and an outside press close it, the arrows and Home / End move along the rows, focus goes back to
     the button (the Schedule Insights menu's way, ui/ScheduleInsightsMenu.tsx).
   - A pick is navigation, not a command: state/store.ts enterSquadron, the path sign-in and midnight take (an open Leave
     War window holds the war's step, state/typing-hold.ts) — nothing saved, Undo untouched (D148). */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { UNIT } from '../engine/unitview'
import { menuSquadrons } from '../state/perms'
import { pickSquadron } from '../state/pick'
import { TalonMark } from './icons'
import { escCloses } from './sheetfocus'
import { useVersion } from './useStore'

const PHONE = 820
const CHECK = <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4.5 12.5l4.8 4.8L19.5 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>

export function SquadronMenu({ num }: { num: string }) {
  useVersion()
  const rows = menuSquadrons()
  const [open, setOpen] = useState<null | { keyboard: boolean }>(null)
  const [phone, setPhone] = useState(() => window.innerWidth <= PHONE)
  const [at, setAt] = useState<{ left: number; top: number } | null>(null)
  const wrap = useRef<HTMLSpanElement>(null), btn = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDivElement>(null)
  /* a Tab is under way: the focus leaving now with nowhere to land is the keys going past the page's start, not the window
     losing the focus ([MSQ-TOPBAR-LIST-KEYS]) */
  const tabbing = useRef(false)
  const many = rows.length > 1
  const shown = many && !!open
  useEffect(() => {
    const resize = () => setPhone(window.innerWidth <= PHONE)
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])
  /* a right taken away while it is open (one row left): it closes, and stays closed should the right come back */
  if (open && !many) setOpen(null)
  /* where it hangs: under the mark on a desktop, from the bar's foot on a phone (the bar's height, --topbar-h) */
  useLayoutEffect(() => {
    if (!shown) { setAt(null); return }
    const bar = btn.current?.closest('.topbar')?.getBoundingClientRect()
    const mark = btn.current?.getBoundingClientRect()
    const foot = bar ? bar.bottom : (mark ? mark.bottom : 0)
    setAt({ left: Math.round(mark?.left ?? 0), top: Math.round(phone ? foot : foot + 12) })
  }, [shown, phone])
  /* opened by the keys: the row in view takes the focus — once the list is placed, for until then it is drawn hidden and a
     browser will not focus a hidden row: the focus stayed on the button ([MSQ-TOPBAR-LIST-KEYS], the re-walk of 23 Nov 26) */
  const placed = !!at
  useLayoutEffect(() => {
    if (!shown || !placed || !open?.keyboard) return
    const items = panel.current?.querySelectorAll<HTMLButtonElement>('.sqm-row')
    const cur = panel.current?.querySelector<HTMLButtonElement>('.sqm-row[aria-checked="true"]')
    ;(cur ?? items?.[0])?.focus()
  }, [shown, placed, open])
  useEffect(() => {
    if (!shown) return
    const outside = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(null) }
    const off = escCloses(() => panel.current, () => { setOpen(null); btn.current?.focus() }, btn.current)
    document.addEventListener('pointerdown', outside)
    return () => { document.removeEventListener('pointerdown', outside); off() }
  }, [shown])
  if (!many) return <TalonMark num={num} />
  const toggle = (keyboard: boolean) => setOpen(o => (o ? null : { keyboard }))
  /* the note of a refused pick hangs under this button (ui/guardnote.ts — `from: 'bar'`), the keys already back on it */
  const pick = (u: string) => { setOpen(null); btn.current?.focus(); void pickSquadron(u, { from: 'bar' }) }
  const move = (e: React.KeyboardEvent) => {
    const items = [...(panel.current?.querySelectorAll<HTMLButtonElement>('.sqm-row') ?? [])]
    if (!items.length) return
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    const to = e.key === 'ArrowDown' ? (i + 1) % items.length : e.key === 'ArrowUp' ? (i - 1 + items.length) % items.length
      : e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : -1
    if (to < 0) return
    e.preventDefault(); items[to]!.focus()
  }
  return (
    <span className="sqm-wrap" ref={wrap}
      onKeyDown={e => { tabbing.current = e.key === 'Tab' }} onKeyUp={() => { tabbing.current = false }}
      onBlur={e => {
        const out = e.relatedTarget ? !e.currentTarget.contains(e.relatedTarget as Node) : tabbing.current
        tabbing.current = false
        if (out) setOpen(null)
      }}>
      <button type="button" className={'sqm-btn' + (shown ? ' on' : '')} id="sqnMenuBtn" ref={btn}
        aria-haspopup="menu" aria-expanded={shown} aria-controls="sqnMenu" aria-label={`Squadron ${num} — pick a squadron's schedule`}
        onClick={e => toggle(e.detail === 0)}
        onKeyDown={e => { if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); setOpen({ keyboard: true }) } }}>
        <TalonMark num={num} menu />
      </button>
      {shown && phone && <span className="sqm-dim" style={at ? { top: at.top } : undefined} aria-hidden="true" />}
      {shown && <div className={'sb-moremenu sqm-panel' + (phone ? ' sheet' : '')} id="sqnMenu" role="menu" aria-label="Schedules"
        ref={panel} onKeyDown={move} style={at ? (phone ? { top: at.top } : { left: at.left, top: at.top }) : { visibility: 'hidden' }}>
        <h5 className="sqm-head">Schedules</h5>
        <SquadronRows rows={rows} pick={pick} />
      </div>}
    </span>
  )
}

/* THE LIST'S ROWS — one body for the top bar's list above and the ☰ menu's (ui/Drawer.tsx DrawerSquadron, his D2382):
   a tick on the squadron in view, its number, its short grey label */
export function SquadronRows({ rows, pick }: { rows: ReturnType<typeof menuSquadrons>; pick: (u: string) => void }) {
  return <>{rows.map(r => (
    <button key={r.id} type="button" className="sb-moreitem sqm-row" role="menuitemradio" aria-checked={r.id === UNIT}
      data-unit={r.id} onClick={() => pick(r.id)}>
      <span className="bi">{r.id === UNIT ? CHECK : null}</span>
      <span className="sqm-num">{r.num}</span>
      <span className="sqm-lbl">{r.label}</span>
    </button>
  ))}</>
}
