// The two-line figure box (owner, 6 Sep 26): the figure's own number on top —
// a balance white, red with its minus below zero; a total red — and under it
// the days taken from that balance, LL amber and OL red on one line, no minus
// (the column title carries the minus and the colour says the rest). One
// component for the real cell, the phone's frozen copy and the drawer's boxes,
// so the three cannot drift. It fits today's 22px row: two 11px lines.
//
// The cell carries `figbox`, which is what the box's own styling hangs off:
// `td.bal` also reaches the manning rows' blank balance cell (their Rearrange
// eye lives there) and the event rows', and the box's top alignment, tight
// padding and 11px lines belong to the box alone.
//
// The FLASH: when the same figure's top number changes for this person — a
// leave entered, decided, or set — the box fades from the accent tint once
// (~700ms, matrix.css `lw-figflash`). Keyed by figure id so switching the
// column to another figure never flashes every row. The first render never
// flashes: there is nothing "changed" about a number just appearing.
import { memo, useEffect, useRef, useState, type MouseEvent } from 'react'
import type { Figure, FigureLines } from '../engine'

// Exported — Matrix's own title-tooltip text (PersonRow) reads a figure's
// top number the same way, and a second copy of this rounding rule would be
// a drift seam waiting to happen.
export const show = (n: number) => String(Math.round(n * 10) / 10)

/** The column at which a value stops fitting its box at the ordinary type size.
 *
 *  The spec's rule (§2): "a column never widens and a number never wraps — the
 *  rare over-wide value (a three-digit balance) drops one type size inside its
 *  box". Four characters is where it actually stops fitting: in the drawer's
 *  narrowest box — 28px on a phone, 26px of it usable — a `-100` on the top
 *  line, or an LVE used line of two two-digit numbers (`12 10`, about 27px at
 *  9.5px bold), runs past the edge and into the box beside it. Three characters
 *  (`100`, `-10`) still fit, so they are left at full size rather than shrunk
 *  for nothing. A box past this reads at one type size down (matrix.css `.wide`)
 *  and clips, so no value can spill however large the squadron's numbers get. */
const WIDE_CHARS = 4

/** How long the flash runs — `lw-figflash`'s own 700ms (matrix.css). Named on
 *  both sides of the same beat: the keyframes draw it, and the fallback below
 *  clears the class after it whether or not the animation ever ran. */
const FLASH_MS = 700

export const FigureCell = memo(function FigureCell({
  figure, lines, personId, testid, title, onClick, extraClass, dataFig, dataPerson, selected,
}: {
  figure: Figure
  lines: FigureLines
  personId: string
  testid?: string
  title?: string
  onClick?: (e: MouseEvent) => void
  /** Extra classes on the cell (`bal act`, `bal fig` …). */
  extraClass: string
  /** The drawer's own boxes (Task 4) address a cell by figure + person rather
   *  than a testid — harmless on the grid cell, which nobody reads by these. */
  dataFig?: string
  dataPerson?: string
  /** The committed selection (Matrix `figSel`) — rendered as `data-figsel` so
   *  the highlight survives this cell's own re-render. Mid-drag the gesture
   *  paints its OWN attribute (`data-figdrag`, select.ts) and never touches
   *  this one: React writes an attribute only when its prop CHANGED, so a mark
   *  cleared from outside would never come back. The two read as one highlight
   *  in the CSS. */
  selected?: boolean
}) {
  const prev = useRef<{ id: string; person: string; top: number } | null>(null)
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    const p = prev.current
    if (p && p.id === figure.id && p.person === personId && p.top !== lines.top) setFlash(true)
    prev.current = { id: figure.id, person: personId, top: lines.top }
  }, [figure.id, personId, lines.top])
  // The class comes off on `animationend` — except that under
  // `prefers-reduced-motion` there is no animation (matrix.css turns it off),
  // so that event never arrives and the class would sit on the cell for the
  // life of the row. Nothing shows, but a stale marker on the surface that
  // says "this just changed" is a lie the next reader would have no way to
  // spot. A timer of the animation's own length is the belt: whichever gets
  // there first clears it, and where the animation does run it has finished
  // by the same moment, so nothing is ever cut short.
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(false), FLASH_MS)
    return () => clearTimeout(t)
  }, [flash])
  const neg = lines.top < 0
  const shownUsed = lines.used.filter(u => u.value !== 0)
  const topText = show(lines.top)
  // The used line is measured as ONE run because that is how it is drawn — LL
  // and OL sit side by side on it, so `12` and `10` together are what has to
  // fit, not either of them alone.
  const usedChars = shownUsed.reduce((n, u) => n + show(u.value).length, 0)
  const wide = topText.length >= WIDE_CHARS || usedChars >= WIDE_CHARS
  return (
    <td
      className={`${extraClass} figbox${wide ? ' wide' : ''}${flash ? ' flash' : ''}`}
      data-testid={testid}
      data-fig={dataFig}
      data-person={dataPerson}
      data-figsel={selected ? '1' : undefined}
      title={title}
      onClick={onClick}
      onAnimationEnd={() => setFlash(false)}
    >
      <span className={`fb${figure.kind === 'tot' ? ' red' : neg ? ' neg' : ''}`}>{topText}</span>
      {shownUsed.length > 0 && (
        <span className="fu">
          {shownUsed.map(u => <b key={u.label} className={u.tone}>{show(u.value)}</b>)}
        </span>
      )}
    </td>
  )
})
