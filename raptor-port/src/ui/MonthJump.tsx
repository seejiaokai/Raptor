/* THE MONTH'S TITLE THAT JUMPS — the Inputs and SANS calendars' "JUL 2027 ▾" ([CAL-MONTH-YEAR-JUMP]).

   Owner, D1560 (2 Nov 26): "can the inputs and sans calendar page have an option to click on for e.g July 2027 and this
   month and year box appears? For faster navigation". D1562, design A of the year designs
   (docs/superpowers/specs/2026-11-02-year-designs.md; the drawings docs/img/mock/2026-11-02-year/cal-1, cal-2, cal-3):
   the title wears the small cyan ▾ of Jump to a date's title, and a tap opens the app's own floating calendar
   (ui/DateBox.tsx's layer) straight on its month and year wheels:
     · the month on the page follows the wheels as they come to rest;
     · a tap outside, Escape, Enter or a second tap on the title closes the card (a second tap on the page's title lands
       on the veil over it, which closes it); the month stays where the wheels left it;
     · the card's Today icon goes to this month and closes it;
     · ‹ › and Today on the page stay as they are.
   While the card is up the title's words turn cyan and its ▾ is lit, as Jump to a date's title does.

   ONE PART FOR BOTH CALENDARS: they share one month (state/view.ts CALMONTH), and each hands in how it turns the page
   (`onMonth`) — a jump, so neither slides its month in as an arrow does.

   Its look: ui/scheduler/26-date-calendar.css (the `.mjt` block). */
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Layer, useTapPatch } from './DateBox'
import { MONTHS } from './daysfmt'

const pad2 = (n: number) => String(n).padStart(2, '0')

export function MonthJump(p: {
  y: number
  /** 1–12 */
  m: number
  /** the month's name cut to three letters ("JUL 2027") — a phone's title */
  short?: boolean
  /** the wheels came to rest on this month: turn the page to it */
  onMonth: (y: number, m: number) => void
  /** the page's own class for its title (`ic-mon`, `sc-month`), which sizes and sets its words */
  className: string
  testid?: string
  id?: string
}) {
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const { standPatch, dropPatch, patchNode } = useTapPatch()
  const name = MONTHS[p.m - 1]
  const words = `${p.short ? name.slice(0, 3) : name} ${p.y}`
  const close = (at?: { x: number; y: number } | null) => {
    setOpen(false)
    if (at) standPatch(at)
    const b = btn.current
    const kb = document.activeElement
    /* the keyboard returns to the title — unless he has already put it somewhere else on the page */
    if (b && (!kb || kb === document.body || !!(kb as HTMLElement).closest?.('.dcal-layer'))) b.focus({ preventScroll: true })
  }
  const today = new Date()
  return (
    <>
      <button
        type="button"
        ref={btn}
        id={p.id}
        className={`${p.className} mjt${open ? ' is-open' : ''}`}
        data-testid={p.testid}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-live="polite"
        aria-label={`${name} ${p.y} — choose the month and year`}
        onClick={e => { if (open) close(); else { setOpen(true); if (e.detail > 0) standPatch({ x: e.clientX, y: e.clientY }); else dropPatch() } }}
      >
        {/* data-fit on a desktop: the words' room is the widest month in the device's own font, so › stays put (D1122);
            the phone keeps its own fixed width (D705). The ▾ right after the words is the stylesheet's (`.mjt-t::after`),
            so the two stay together, centred in the room as the drawing has them, and the title's words stay the month's
            name alone; the room is measured with it (a no-break space and the ▾ after each name) */}
        <span className="mjt-w" data-fit={p.short ? undefined : MONTHS.map(n => `${n} ${p.y}\u00a0\u25be`).join('\n')}><span className="mjt-t">{words}</span></span>
      </button>
      {open && createPortal(
        <Layer
          label="Choose the month and year" name="" value="" box={btn.current}
          at={`${p.y}-${pad2(p.m)}-01`}
          onPick={() => {}}
          onClose={close}
          month={{
            onMonth: (y, m) => { if (y !== p.y || m !== p.m) p.onMonth(y, m) },
            onDone: () => close(),
            onToday: () => { p.onMonth(today.getFullYear(), today.getMonth() + 1); close() },
          }}
        />, document.body)}
      {patchNode}
    </>
  )
}
