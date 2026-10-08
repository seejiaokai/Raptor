/* THE SANS CALENDAR — THE MONTH (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.5).

   Owner, D617 (7 Oct 26): "each SANS calendar date shows, as pilots / WSOs, how many more are still needed to fly and
   how many SANS have committed to F, O and A." D626 / D630: the date with lined-up columns, pilots left and WSOs right,
   in the first mock-ups' own colours — a soft wash over the day, the still-needed pair in that colour. D627: a no-fly
   day says NF; a public holiday (green) and an Off day (grey) show from the Leave War's one record; the sun and the
   moon are day and night flying, here only. D618: three colours, and a line saying what they mean, for everyone.
   D620: no filters and no list — SANS availability is filed here and nowhere else. D664: on a phone the month takes
   the full screen and is never a box scrolled inside the page.

   THE MONTH WORKS NOTHING OUT. A day's class, its required figures, how many more are needed and its colour are the
   ONE resolver's answer (leavewar/sync.ts flyMonth → state/flyplan-model.ts planFor); who has committed is
   state/flyplan.ts sansCommittedOn; how that is read onto a date is ui/sanscal-model.ts sansCell. It HEARS BOTH STORES
   — the scheduler's signal (a commitment, a plan row, the three colours) and the war's (`useWarFacts`: a holiday, a
   bid, a count row, a period) — so a change made in the window in front of it, or on another page, is on the month at
   once, with no reload.

   WHAT A PRESS DOES is ui/calpick.ts (one machine, shared with the Inputs month in step 5): a tap opens the day; a
   mouse drag, or a finger held and then dragged, picks several days for "+ Commitment" (D621, D626 — the "Select dates"
   button is gone); a finger slid sideways turns the month. The keyboard has the same reach (D621): arrows move from
   date to date and turn the month at its ends, Shift and arrows stretch a run, Enter opens the day or files for the
   run, Escape lets a run go and then closes the open day.

   THE DAY OPENS IN A WINDOW (ui/SansDay.tsx, on the windows shell — D641): the month behind it still works, so a tap
   on another date re-points the same window.

   THE SAVED-ROW REVEAL (state/view.ts INPREVEAL — kept whole from the first calendar): a commitment just saved, or
   brought back by Undo, opens its own day on its own month, ONCE; closing that day, opening another or leaving the
   calendar spends it, so a second visit does not open it again (Opus's read of the first build, step 0). */
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { INPUTS, isSansAvail } from '../engine/inputs'
import { getTones, sansCommittedOn } from '../state/flyplan'
import { addDays } from '../state/flyplan-model'
import { notify } from '../state/store'
import { CALMONTH, INPREVEAL, clearInpReveal, setCalMonth } from '../state/view'
import { dayFacts, flyMonth, useWarFacts } from '../leavewar/sync'
import { initCalPick } from './calpick'
import { MONTHS, WD, isoToday } from './daysfmt'
import { MoonIcon, SunIcon } from './icons'
import { monthCells } from './InputsCal'
import { SansDay } from './SansDay'
import { maySansAdd, openSansAdd } from './sansadd'
import { dayWord, sansCell, type SansCell } from './sanscal-model'
import { useVersion } from './useStore'

/** "1–2", "3–4", "5+" — the three colours' ranges, from the figures as set */
const span = (from: number, below?: number): string => below === undefined ? `${from}+` : below - 1 <= from ? String(from) : `${from}–${below - 1}`
const KIND_SAY: Record<string, string> = { day: 'day flying', night: 'night flying', nf: 'no-fly day', none: 'no flying set' }

/** a date said whole, for a screen reader — the figures a sighted reader takes from the columns */
function say(c: SansCell, kind: 'ph' | 'off' | null, cls: string | null, covered: boolean): string {
  const what = kind === 'ph' ? 'public holiday' : kind === 'off' ? 'Off day' : KIND_SAY[cls || 'none']
  const seat = (n: number | null, word: string) => n === null ? `no figure for ${word}` : `${n} ${word}`
  const need = c.need ? `Still needed: ${seat(c.need.p, 'pilots')}, ${seat(c.need.w, 'WSOs')}.`
    : covered ? 'No required figure.' : 'No leave period covers this date.'
  return `${dayWord(c.iso)}, ${what}. ${need} SANS committed: fly ${c.f.p} and ${c.f.w}, OFT ${c.o.p} and ${c.o.w}, AMT ${c.a.p} and ${c.a.w}.`
}

export function SansCal() {
  useVersion()
  useWarFacts()
  const gridRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const now = new Date()
  const cur = CALMONTH || { y: now.getFullYear(), m: now.getMonth() + 1 }
  const today = isoToday()

  const [dayIso, setDayIso] = useState<string | null>(null)
  /* a run being drawn by the pointer, and one stretched by the keyboard — first day first */
  const [drawn, setDrawn] = useState<{ a: string; b: string } | null>(null)
  const [kb, setKb] = useState<{ anchor: string; end: string } | null>(null)
  /* the date the keyboard is on (one tab stop for the whole month), and a date to focus once it is drawn */
  const [at, setAt] = useState<string | null>(null)
  const wantFocus = useRef<string | null>(null)
  const slide = useRef(0)

  /* ---- the reveal: spent once its day has been shown and left --------------------------------------------------- */
  const shown = useRef<typeof INPREVEAL>(null)
  const spendReveal = () => { if (shown.current && INPREVEAL === shown.current) clearInpReveal(); shown.current = null }
  const showDay = (iso: string | null) => { if (shown.current && iso !== shown.current.iso) spendReveal(); setDayIso(iso) }
  const reveal = INPREVEAL
  useLayoutEffect(() => {
    if (!reveal || reveal.mode !== 'sans') return
    if (!INPUTS.some((r: any) => r.iid === reveal.iid && isSansAvail(r.type))) return
    setCalMonth({ y: +reveal.iso.slice(0, 4), m: +reveal.iso.slice(5, 7) })
    setDayIso(reveal.iso); shown.current = reveal
    notify()
  }, [reveal])
  useEffect(() => () => spendReveal(), [])

  /* ---- the month ------------------------------------------------------------------------------------------------- */
  const goTo = (y: number, m: number, dir: number) => { slide.current = dir; setCalMonth({ y, m }); notify() }
  const step = (n: number) => { const k = cur.y * 12 + (cur.m - 1) + n; goTo(Math.floor(k / 12), (k % 12) + 1, n) }
  const stepRef = useRef(step)
  stepRef.current = step
  const goToday = () => { const k = (now.getFullYear() * 12 + now.getMonth()) - (cur.y * 12 + cur.m - 1); goTo(now.getFullYear(), now.getMonth() + 1, k < 0 ? -1 : k > 0 ? 1 : 0) }
  /* the new month comes in from the side the page turned (owner, 22 Aug 26 — the first calendar's own slide) */
  useLayoutEffect(() => {
    const dir = slide.current
    slide.current = 0
    const el = gridRef.current
    if (!dir || !el || typeof el.animate !== 'function') return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.animate([{ transform: `translateX(${dir > 0 ? 28 : -28}px)`, opacity: 0.25 }, { transform: 'translateX(0)', opacity: 1 }],
      { duration: 240, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur.y, cur.m])

  /* ---- the pointer: one machine, wired once; it reads the latest handlers through a ref -------------------------- */
  const live = useRef({ showDay, step })
  live.current = { showDay, step }
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    return initCalPick(el, {
      canPick: maySansAdd,
      onTap: iso => { setKb(null); setAt(iso); live.current.showDay(iso) },
      onPicking: setDrawn,
      onRange: (a, b) => { setKb(null); openSansAdd(a, b) },
      onSwipe: dir => live.current.step(dir),
    })
  }, [])

  /* ---- the keyboard ---------------------------------------------------------------------------------------------- */
  useLayoutEffect(() => {
    const iso = wantFocus.current
    if (!iso) return
    const el = gridRef.current?.querySelector<HTMLElement>(`[data-icday="${iso}"]`)
    if (el) { wantFocus.current = null; el.focus({ preventScroll: false }) }
  })
  const moveTo = (iso: string) => {
    const y = +iso.slice(0, 4), m = +iso.slice(5, 7)
    setAt(iso); wantFocus.current = iso
    if (y !== cur.y || m !== cur.m) goTo(y, m, y * 12 + m > cur.y * 12 + cur.m ? 1 : -1)
  }
  const ARROWS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
  const onKey = (iso: string) => (e: ReactKeyboardEvent) => {
    if (e.target !== e.currentTarget) return
    const by = ARROWS[e.key]
    if (by !== undefined) {
      e.preventDefault()
      const to = addDays(iso, by)
      if (e.shiftKey) { if (maySansAdd()) setKb(k => ({ anchor: k ? k.anchor : iso, end: to })) }
      else setKb(null)
      moveTo(to)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (kb) { const [a, b] = kb.anchor <= kb.end ? [kb.anchor, kb.end] : [kb.end, kb.anchor]; setKb(null); openSansAdd(a, b) }
      else showDay(iso)
    } else if (e.key === 'Escape') {
      if (kb) { e.preventDefault(); e.stopPropagation(); setKb(null) }
      else if (dayIso) { e.preventDefault(); e.stopPropagation(); showDay(null) }
    }
  }

  /* ---- ON A PHONE THE MONTH TAKES THE FULL SCREEN (D664): the week rows share the height from under the top rows to the
     foot of the screen — measured from what the browser really shows, and measured again when that changes (its own
     bars sliding away, a turn of the phone, the fold above opening). It is a FLOOR, never a limit: a six-week month or
     a short screen makes the month taller than the screen and the WHOLE PAGE scrolls — the month has no scroll of its
     own. ---- */
  useLayoutEffect(() => {
    const el = gridRef.current
    if (!el) return
    const fit = () => {
      const vv = window.visualViewport
      const h = vv ? vv.height : window.innerHeight
      const top = el.getBoundingClientRect().top + (window.scrollY || 0)
      el.style.setProperty('--sc-fill', Math.max(0, Math.floor(h - top - 12)) + 'px')
    }
    fit()
    window.addEventListener('resize', fit)
    window.visualViewport?.addEventListener('resize', fit)
    const ro = typeof ResizeObserver !== 'undefined' && topRef.current ? new ResizeObserver(fit) : null
    if (ro && topRef.current) ro.observe(topRef.current)
    return () => { window.removeEventListener('resize', fit); window.visualViewport?.removeEventListener('resize', fit); ro?.disconnect() }
  }, [])

  const answers = flyMonth(cur.y, cur.m)
  const tones = getTones()
  const cells = monthCells(cur.y, cur.m)
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  const first = cells.find(Boolean) as string
  /* the month's one tab stop: where the keyboard last was, else today, else the 1st */
  const tabAt = at && at.slice(0, 7) === first.slice(0, 7) ? at : today.slice(0, 7) === first.slice(0, 7) ? today : first
  const run = drawn || (kb ? (kb.anchor <= kb.end ? { a: kb.anchor, b: kb.end } : { a: kb.end, b: kb.anchor }) : null)

  return (
    <div className="sanscal" id="sansCal" data-testid="sanscal">
      <div className="sc-top" ref={topRef}>
        <div className="sc-head">
          <button type="button" className="abtn sc-nav" data-testid="sc-prev" aria-label="Previous month" onClick={() => step(-1)}>&#8249;</button>
          <span className="sc-month" data-testid="sc-month" aria-live="polite">{MONTHS[cur.m - 1]} {cur.y}</span>
          <button type="button" className="abtn sc-nav" data-testid="sc-next" aria-label="Next month" onClick={() => step(1)}>&#8250;</button>
          <button type="button" className="abtn" data-testid="sc-today" onClick={goToday}>Today</button>
        </div>
        <div className="sc-sub">
          <span className="sc-legend" data-testid="sc-legend">
            <span className="sc-legend-w">Pilots · WSOs still needed:</span>
            <span className="sc-key t-yellow">{span(tones.yellowFrom, tones.amberFrom)}</span>
            <span className="sc-key t-amber">{span(tones.amberFrom, tones.redFrom)}</span>
            <span className="sc-key t-red">{span(tones.redFrom)}</span>
          </span>
        </div>
      </div>
      <div className="sc-dow" data-testid="sc-dow" aria-hidden="true">{WD.map((d, i) => <span key={d} className={i >= 5 ? 'is-we' : ''}>{d}</span>)}</div>
      <div className="sc-grid" data-testid="sc-grid" ref={gridRef}>
        {weeks.map((week, wi) => (
          <div key={wi} className="sc-week">
            {week.map((iso, ci) => {
              if (!iso) return <div key={'x' + ci} className="sc-x" />
              const a = answers[iso], facts = dayFacts(iso)
              const c = sansCell(a, facts.short, sansCommittedOn(iso))
              const picked = !!run && iso >= run.a && iso <= run.b
              const cls = 'sc-day' + (c.tone !== 'none' ? ' t-' + c.tone : '') + (ci >= 5 ? ' is-we' : '') + (a.kind ? ' is-' + a.kind : '') +
                (c.tag && c.tag.kind === 'nf' ? ' is-nf' : '') + (iso === today ? ' is-today' : '') + (picked ? ' is-picked' : '') + (iso === dayIso ? ' is-open' : '')
              const row = (k: 'f' | 'o' | 'a', letter: string) => (
                <div className="sc-row" data-testid={`sc-${k}-${iso}`}>
                  <span className="sc-k">{letter}</span>
                  <span className={c[k].p ? '' : 'is-nil'}>{c[k].p}</span>
                  <span className={c[k].w ? '' : 'is-nil'}>{c[k].w}</span>
                </div>
              )
              return (
                <div key={iso} className={cls} data-icday={iso} data-testid={'sc-day-' + iso} role="button" tabIndex={iso === tabAt ? 0 : -1}
                  aria-label={say(c, a.kind, a.cls, facts.covered)} aria-pressed={iso === dayIso} onKeyDown={onKey(iso)} onFocus={() => setAt(iso)}>
                  <div className="sc-date">
                    <span className="sc-num">{+iso.slice(8, 10)}</span>
                    {c.icon === 'day' && <span className="sc-icon c-day" data-icon="day"><SunIcon /></span>}
                    {c.icon === 'night' && <span className="sc-icon c-night" data-icon="night"><MoonIcon /></span>}
                    {c.tag && <span className={'sc-tag k-' + c.tag.kind} data-testid={'sc-tag-' + iso}>{c.tag.text}</span>}
                  </div>
                  <div className="sc-figs">
                    <div className={'sc-row sc-need' + (c.need && !(c.need.p || c.need.w) ? ' is-zero' : '')} data-testid={'sc-need-' + iso}>
                      {c.need ? <><span className="sc-k" /><b>{c.need.p === null ? '–' : c.need.p}</b><b>{c.need.w === null ? '–' : c.need.w}</b></>
                        : <span className="sc-dash">–</span>}
                    </div>
                    {row('f', 'F')}{row('o', 'O')}{row('a', 'A')}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {dayIso && <SansDay iso={dayIso} hi={null} onClose={() => showDay(null)} />}
    </div>
  )
}
