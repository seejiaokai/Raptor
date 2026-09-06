// The two-line figure box (owner, 6 Sep 26): the figure's own number on top —
// a balance white, red with its minus below zero; a total red — and under it
// the days taken from that balance, LL amber and OL red on one line, no minus
// (the column title carries the minus and the colour says the rest). One
// component for the real cell, the phone's frozen copy and the drawer's boxes,
// so the three cannot drift. It fits today's 22px row: two 11px lines.
//
// The FLASH: when the same figure's top number changes for this person — a
// leave entered, decided, or set — the box fades from the accent tint once
// (~700ms, matrix.css `lw-figflash`). Keyed by figure id so switching the
// column to another figure never flashes every row. The first render never
// flashes: there is nothing "changed" about a number just appearing.
import { memo, useEffect, useRef, useState, type MouseEvent } from 'react'
import type { Figure, FigureLines } from '../engine'

const show = (n: number) => String(Math.round(n * 10) / 10)

export const FigureCell = memo(function FigureCell({
  figure, lines, personId, testid, title, onClick, extraClass, dataFig, dataPerson,
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
}) {
  const prev = useRef<{ id: string; person: string; top: number } | null>(null)
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    const p = prev.current
    if (p && p.id === figure.id && p.person === personId && p.top !== lines.top) setFlash(true)
    prev.current = { id: figure.id, person: personId, top: lines.top }
  }, [figure.id, personId, lines.top])
  const neg = lines.top < 0
  const shownUsed = lines.used.filter(u => u.value !== 0)
  return (
    <td
      className={`${extraClass}${flash ? ' flash' : ''}`}
      data-testid={testid}
      data-fig={dataFig}
      data-person={dataPerson}
      title={title}
      onClick={onClick}
      onAnimationEnd={() => setFlash(false)}
    >
      <span className={`fb${figure.kind === 'tot' ? ' red' : neg ? ' neg' : ''}`}>{show(lines.top)}</span>
      {shownUsed.length > 0 && (
        <span className="fu">
          {shownUsed.map(u => <b key={u.label} className={u.tone}>{show(u.value)}</b>)}
        </span>
      )}
    </td>
  )
})
