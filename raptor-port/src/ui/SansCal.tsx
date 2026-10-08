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
import { CALMONTH, INPREVEAL, SANSHL, clearInpReveal, setCalMonth, setSansHl } from '../state/view'
import { dayFacts, flyMonth, useWarFacts } from '../leavewar/sync'
import { isAdmin } from '../state/perms'
import { setSansSet } from './pops'
import { initCalPick } from './calpick'
import { MONTHS, WD, isoToday } from './daysfmt'
import { MoonIcon, SunIcon } from './icons'
import { monthCells } from './InputsCal'
import { SansDay } from './SansDay'
import { maySansAdd, openSansAdd } from './sansadd'
import { PEOPLE } from '../engine/people'
import { puck } from './html'
import { HlIcon } from './icons'
import { cutParts, dayWord, sansCell, sansMine, sansRoster, type SansCell } from './sanscal-model'
import { useMedia } from './usemedia'
import { useVersion } from './useStore'

/** "1–2", "3–4", "5+" — the three colours' ranges, from the figures as set */
const span = (from: number, below?: number): string => below === undefined ? `${from}+` : below - 1 <= from ? String(from) : `${from}–${below - 1}`
const KIND_SAY: Record<string, string> = { day: 'day flying', night: 'night flying', nf: 'no-fly day', none: 'no flying set' }

/** a date said whole, for a screen reader — the figures a sighted reader takes from the columns; with a man
 *  highlighted, what he offered there */
function say(c: SansCell, kind: 'ph' | 'off' | null, cls: string | null, covered: boolean, mine: { f: boolean; o: boolean; a: boolean } | null, who: string): string {
  const what = kind === 'ph' ? 'public holiday' : kind === 'off' ? 'Off day' : KIND_SAY[cls || 'none']
  const seat = (n: number | null, word: string) => n === null ? `no figure for ${word}` : `${n} ${word}`
  const need = c.need ? `Still needed: ${seat(c.need.p, 'pilots')}, ${seat(c.need.w, 'WSOs')}.`
    : covered ? 'No required figure.' : 'No leave period covers this date.'
  const his = mine ? ` ${who} committed: ${[mine.f ? 'fly' : '', mine.o ? 'OFT' : '', mine.a ? 'AMT' : ''].filter(Boolean).join(', ')}.` : ''
  return `${dayWord(c.iso)}, ${what}. ${need} SANS committed: fly ${c.f.p} and ${c.f.w}, OFT ${c.o.p} and ${c.o.w}, AMT ${c.a.p} and ${c.a.w}.${his}`
}

/* THE HIGHLIGHT PICKER (D619, D626; D647 / D649 — each man as the schedule's own puck with his CAT). A small menu, not a
   window: it closes on a pick, on Escape and on a press outside it (the standing rule for a menu — the plan §3.7 keeps
   it for "a small menu, picker or palette"). The button names the man picked, so the ring on the month is never a
   mystery. */
function Highlight({ people, hi }: { people: string[]; hi: string | null }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const outside = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault(); e.stopPropagation(); setOpen(false)
      if (btn.current?.isConnected) btn.current.focus()
    }
    document.addEventListener('pointerdown', outside, true)
    document.addEventListener('keydown', esc, true)
    return () => { document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', esc, true) }
  }, [open])
  const pick = (id: string | null) => { setSansHl(id); setOpen(false); notify() }
  return (
    <div className="sc-hlwrap" ref={wrap}>
      <button type="button" ref={btn} className={'abtn sc-hl' + (hi ? ' lit' : '')} data-testid="sc-hl" aria-haspopup="listbox" aria-expanded={open}
        title="Ring one SANS person’s days" onClick={() => setOpen(o => !o)}><HlIcon /><span className="sc-hl-t">{hi ? PEOPLE[hi].cs : 'Highlight'}</span></button>
      {open && (
        <div className="sc-hl-menu" data-testid="sc-hl-menu" role="listbox" aria-label="Highlight one SANS person">
          <button type="button" role="option" aria-selected={!hi} className={'sc-hl-item' + (!hi ? ' lit' : '')} data-testid="sc-hl-none" onClick={() => pick(null)}>No highlight</button>
          {people.map(id => (
            <button key={id} type="button" role="option" aria-selected={hi === id} aria-label={PEOPLE[id].cs} className={'sc-hl-item' + (hi === id ? ' lit' : '')}
              data-testid={'sc-hl-' + id} onClick={() => pick(id)}>
              <span className="sc-hl-puck" aria-hidden="true" dangerouslySetInnerHTML={{ __html: puck(id, false, true, false).replace(' tabindex="0"', '') }} />
            </button>
          ))}
          {!people.length && <p className="sc-hl-empty">No SANS aircrew on the roster.</p>}
        </div>
      )}
    </div>
  )
}

export function SansCal() {
  useVersion()
  useWarFacts()
  const gridRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  /* ON A PHONE THE MONTH'S NAME IS ITS FIRST THREE LETTERS — "OCT 2026", as the approved month is drawn — so the two
     arrows, Today, Highlight and the gear hold ONE line across 390px (found on the first look: with the name in full
     the last two dropped to a line of their own) */
  const narrow = useMedia('(max-width:820px)')
  const now = new Date()
  const cur = CALMONTH || { y: now.getFullYear(), m: now.getMonth() + 1 }
  const today = isoToday()

  const [dayIso, setDayIso] = useState<string | null>(null)
  /* "How this works" — folded away each time the calendar is opened: it is read once, not looked at daily */
  const [how, setHow] = useState(false)
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

  /* the man picked in Highlight — only while he is still SANS and on the roster; one who has left it is let go */
  const roster = sansRoster()
  const hi = SANSHL && roster.includes(SANSHL) ? SANSHL : null
  const stale = !!SANSHL && !hi
  useEffect(() => { if (stale) { setSansHl(null); notify() } }, [stale])
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
          <span className="sc-month" data-testid="sc-month" aria-live="polite" aria-label={`${MONTHS[cur.m - 1]} ${cur.y}`}>{narrow ? MONTHS[cur.m - 1].slice(0, 3) : MONTHS[cur.m - 1]} {cur.y}</span>
          <button type="button" className="abtn sc-nav" data-testid="sc-next" aria-label="Next month" onClick={() => step(1)}>&#8250;</button>
          <button type="button" className="abtn sc-today" data-testid="sc-today" onClick={goToday}>Today</button>
          <span className="sc-spring" />
          <Highlight people={roster} hi={hi} />
          {/* THE GEAR (D618, D635): the app's own cog — the Leave War's settings button — never a drawing with rays, which
              on this calendar would read as the day-flying sun beside it. Admins only; everyone has the line below. */}
          {isAdmin() && (
            <button type="button" className="abtn sc-gear" data-testid="sc-gear" title="SANS calendar settings — day colours, the late cut-off, the Calendar"
              aria-label="SANS calendar settings" onClick={() => { setSansSet(true); notify() }}>&#9881;</button>
          )}
        </div>
        <div className="sc-sub">
          <button type="button" className="sc-how" data-testid="sc-how" aria-expanded={how} aria-controls="scHowList" onClick={() => setHow(h => !h)}>
            <span className="sc-how-v" aria-hidden="true" />How this works
          </button>
          {/* ON A PHONE the key's words are the short ones (owner D697: "Compact words if need be") — the whole key then
              sits on the fold's own line, as the Inputs calendar's does; that the pair is pilots, then WSOs is line 2
              of the fold, and the full words stay on the key for a pointer and a screen reader. */}
          <span className="sc-legend" data-testid="sc-legend" role="group" title="Pilots · WSOs still needed to fly" aria-label="Pilots, then WSOs, still needed to fly">
            <span className="sc-legend-w">{narrow ? 'Still needed:' : 'Pilots · WSOs still needed:'}</span>
            <span className="sc-key t-yellow">{span(tones.yellowFrom, tones.amberFrom)}</span>
            <span className="sc-key t-amber">{span(tones.amberFrom, tones.redFrom)}</span>
            <span className="sc-key t-red">{span(tones.redFrom)}</span>
          </span>
        </div>
        {/* FIVE SHORT LINES (D646). The last states the late cut-off AS IT IS SET — from the setting, so it changes when the
            setting does (D628); the date a late commitment missed is said by its own LATE tag, in the opened day. */}
        {how && (
          <ol className="sc-how-list" id="scHowList" data-testid="sc-how-list">
            <li>Tap a day to see who has committed, and to add or change yours.</li>
            <li>The coloured pair is how many more are needed to fly: <b>pilots, then WSOs</b>.</li>
            <li><b>F</b> fly · <b>O</b> OFT · <b>A</b> AMT: the SANS who have committed.</li>
            <li><b>NF</b> is a no-fly day. Green is a public holiday. Grey is an Off day.</li>
            {/* the cut-off alone (owner D704, 9 Oct 26: "Remove one commitment a day each") */}
            <li><span data-testid="sc-how-cut">{(p => <>{p.before}<b>{p.cut}</b>{p.after}</>)(cutParts('sans'))}</span></li>
          </ol>
        )}
      </div>
      <div className="sc-dow" data-testid="sc-dow" aria-hidden="true">{WD.map((d, i) => <span key={d} className={i >= 5 ? 'is-we' : ''}>{d}</span>)}</div>
      <div className="sc-grid" data-testid="sc-grid" ref={gridRef}>
        {weeks.map((week, wi) => (
          <div key={wi} className="sc-week">
            {week.map((iso, ci) => {
              if (!iso) return <div key={'x' + ci} className="sc-x" />
              const a = answers[iso], facts = dayFacts(iso)
              const com = sansCommittedOn(iso)
              const c = sansCell(a, facts.short, com)
              const mine = sansMine(com, hi)
              const picked = !!run && iso >= run.a && iso <= run.b
              const cls = 'sc-day' + (c.tone !== 'none' ? ' t-' + c.tone : '') + (ci >= 5 ? ' is-we' : '') + (a.kind ? ' is-' + a.kind : '') +
                (c.tag && c.tag.kind === 'nf' ? ' is-nf' : '') + (iso === today ? ' is-today' : '') + (picked ? ' is-picked' : '') + (iso === dayIso ? ' is-open' : '') + (mine ? ' is-hi' : '')
              const row = (k: 'f' | 'o' | 'a', letter: string) => (
                <div className={'sc-row' + (mine && mine[k] ? ' is-mine' : '')} data-testid={`sc-${k}-${iso}`}>
                  <span className="sc-k">{letter}</span>
                  <span className={c[k].p ? '' : 'is-nil'}>{c[k].p}</span>
                  <span className={c[k].w ? '' : 'is-nil'}>{c[k].w}</span>
                </div>
              )
              return (
                <div key={iso} className={cls} data-icday={iso} data-testid={'sc-day-' + iso} role="button" tabIndex={iso === tabAt ? 0 : -1}
                  aria-label={say(c, a.kind, a.cls, facts.covered, mine, hi ? PEOPLE[hi].cs : '')} aria-pressed={iso === dayIso} onKeyDown={onKey(iso)} onFocus={() => setAt(iso)}>
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
      {dayIso && <SansDay iso={dayIso} hi={hi} onClose={() => showDay(null)} />}
    </div>
  )
}
