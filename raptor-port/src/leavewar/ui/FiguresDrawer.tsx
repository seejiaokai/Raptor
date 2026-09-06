// THE FIGURES DRAWER (owner, 6 Sep 26): every figure for everyone, popped out
// to the right of the names OVER the day columns, from the roster header
// down. The manning rows, the month strip and the top controls do not move;
// the days keep working beside it.
//
// It is an OVERLAY, drawn once, like the phone's frozen `.mxband` — a second
// table outside the sideways scroller (`.mx-wrap`), absolutely positioned in
// `.mx-outer`, never a set of extra cells in the real table (every real row
// keeps identical cells — the owner's iPhone is the gate). Its rows copy the
// real rows' MEASURED heights (`syncOverlayHeights` in Matrix.tsx), for the
// same reason the band does: two independently laid out tables agree on
// nothing you have not measured.
//
// Titles are sideways, one line per column — "+OIL −OIL" — each word in the
// colour of the number under it; LVE takes two lines. The title IS the legend.
// Tapping a title opens a small pop-up with what the column counts; tapping a
// box opens that person's breakdown of that figure.
import { Fragment, memo, useEffect, useState, type CSSProperties, type MouseEvent, type RefObject } from 'react'
import { figureLines, titleLines, type Figure, type FigureCtx, type Person } from '../engine'
import { FigureCell } from './FigureCell'
import { popAt } from './popat'

/** `.figpop`'s own max-width (matrix.css), which is what the clamp measures
 *  against, and a rough height for the flip. */
const POP_W = 260, POP_H = 84

/** The pop-up's element id, so the title that opened it can name it through
 *  `aria-controls`. One at a time — only one title's pop-up is ever up — so a
 *  constant is honest here and there is nothing to make unique. */
const POP_ID = 'lw-figpop'

/** The classes one drawer column's cell wears. The first column is the CLOSED
 *  column's width, so a box does not move when the drawer opens; the last
 *  carries the drawer's right edge.
 *
 *  Exported because the stuck header's frozen copy (Matrix.tsx `headerRow`)
 *  draws the same eight title cells and needs the same `first`/`last` — the
 *  recipe was hand-copied there, and two copies of a rule the CSS reads by
 *  name are a drift seam waiting for the day one of them gains a class. */
export const figClass = (figures: Figure[], id: string) =>
  `bal fig${id === figures[0]?.id ? ' first' : ''}${id === figures[figures.length - 1]?.id ? ' last' : ''}`

export type DrawerRow =
  | { kind: 'group'; key: string; folded: boolean }
  | { kind: 'catsub'; key: string }
  | { kind: 'person'; key: string; p: Person; me: boolean }
  | { kind: 'blank'; key: string }   // an event row: an empty box across the block

/** One column title, sideways and coloured — the legend the owner asked the
 *  titles themselves to carry. Exported because the stuck header's frozen copy
 *  draws the same titles while the drawer is open, and two hand-written copies
 *  of "+LVE over −LL −OL" would drift. With no `onClick` it is a plain span:
 *  that copy is aria-hidden decoration, and a button that opens nothing is
 *  worse than no button. */
export function FigureTitle({ figure, open, popId, onClick }: {
  figure: Figure
  open?: boolean
  /** The id of the pop-up this title owns, so a screen reader can follow the
   *  press to the panel it opened. Only the live drawer's titles have one. */
  popId?: string
  onClick?: (e: MouseEvent<HTMLElement>) => void
}) {
  const words = titleLines(figure).map((line, i) => (
    <span key={i} className="rot">
      {line.map((w, j) => (
        // The space is a text node BETWEEN the words, never inside one: each
        // `b` is exactly its own word, so the colour key reads word by word.
        <Fragment key={j}>{j ? ' ' : ''}<b className={w.tone}>{w.text}</b></Fragment>
      ))}
    </span>
  ))
  if (!onClick) return <span className="figtitle" aria-hidden="true">{words}</span>
  return (
    <button
      className="figtitle"
      aria-label={`${figure.label} — what this column counts`}
      aria-expanded={!!open}
      aria-controls={popId}
      onClick={onClick}
    >{words}</button>
  )
}

/** One person's row of boxes, memoised — `PersonRow`'s own lesson (3 Sep 26),
 *  which this drawer would otherwise undo: eight figures for sixty people is
 *  480 boxes, and each one reads that person's whole grid across every war. So
 *  opening a sheet, hovering a chip or dragging a row would re-read all of them
 *  for a change none of them saw. Every store change still repaints every row,
 *  because `ctx` is rebuilt from the store on each one and its identity is the
 *  dependency here. */
const DrawerPersonRow = memo(function DrawerPersonRow({ figures, ctx, p, me, onBox }: {
  figures: Figure[]
  ctx: FigureCtx
  p: Person
  me: boolean
  onBox: (personId: string, figureId: string) => void
}) {
  return (
    <tr data-drawer-key={`row-${p.id}`} className={me ? 'me' : undefined}>
      {figures.map(f => (
        // The SAME `<FigureCell>` as the real cell and the band's copy, so the
        // three cannot drift. No testid — the real cell keeps `bal-<id>`; the
        // drawer is addressed by figure + person.
        <FigureCell
          key={f.id}
          figure={f}
          lines={figureLines(f, ctx, p.id)}
          personId={p.id}
          extraClass={`${figClass(figures, f.id)} act`}
          dataFig={f.id}
          dataPerson={p.id}
          onClick={() => onBox(p.id, f.id)}
        />
      ))}
    </tr>
  )
})

export function FiguresDrawer({
  figures, ctx, rows, zoom, top, left, headH, rootRef, arranging, onBox,
}: {
  figures: Figure[]
  ctx: FigureCtx
  /** The rows to draw, in grid order, each keyed to the real row's testid
   *  (`row-<id>`, `group-<g>`, `subcat-<g>-<cat>`, `event-row-<n>`) so heights
   *  can be copied across. */
  rows: DrawerRow[]
  zoom: number
  /** The real header row's top and the names column's right edge, in `.mx-outer`
   *  pixels (measured by Matrix); null until laid out (jsdom: hidden). */
  top: number | null
  left: number
  /** The real header row's height in the TABLE's own units (the drawer's title
   *  row matches it; the table wears the grid's zoom, so Matrix divides the
   *  measured visual height back out before handing it over). */
  headH: number
  /** Matrix measures this box (its width and its column widths feed the stuck
   *  header's frozen copy) and writes its row heights straight onto the nodes. */
  rootRef: RefObject<HTMLDivElement | null>
  /** An admin is REARRANGING the roster. The drawer stands down to taps — it
   *  covers a wide strip beside the grip column, and a roster drag hit-tests
   *  with `elementFromPoint`, so an overlay that takes the pointer hides the
   *  very row being dragged over. `pointer-events: none` hands the point
   *  straight through to the real row underneath. The band's own answer to the
   *  same problem is to tear itself down; the drawer stays UP, because the
   *  figures are worth reading while the roster is being ordered and because
   *  nothing about it has to be re-measured or restored on the way out. It is
   *  the one property the band also drives inline (`onWrapScroll`). */
  arranging: boolean
  onBox: (personId: string, figureId: string) => void
}) {
  const [pop, setPop] = useState<{ id: string; x: number; y: number } | null>(null)
  // The title pop-up closes on an outside press or Escape (the app's click-open
  // popup rule, CLAUDE.md 4 Sep 26); a press on its own title toggles it, so
  // that press is "inside" and left to the button's own handler. Escape listens
  // on `window` — capture there runs ahead of the sheets' own document-capture
  // Escape, so the pop-up peels first — with the sheets' kept-mounted guard.
  //
  // It also closes on a SCROLL or a RESIZE, the other two thirds of the quals
  // popover's contract (Matrix.tsx): the box is screen-fixed and its corner was
  // read once from the title's rect, so the moment the grid scrolls sideways
  // under it — or the phone rotates — it is pointing at nothing. The scroll
  // listener captures, because `.mx-wrap`'s own sideways scroll does not bubble.
  useEffect(() => {
    if (!pop) return
    const close = () => setPop(null)
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      // "Inside" is the pop-up and the LIVE title that opened it — scoped to
      // `.mxdrawer` on purpose (6 Sep 26 review). The stuck header's frozen
      // copy draws the same `[data-fig] .figtitle` markup as a read-only span,
      // and without the scope a press on that copy matched here: the one press
      // that looks most like "I am done with this pop-up" was the one press
      // that left it open, a dead spot in the app's own outside-press rule.
      if (t?.closest('.figpop') || t?.closest(`.mxdrawer [data-fig="${pop.id}"] .figtitle`)) return
      setPop(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const pg = document.getElementById('page-leavewar')
      if (pg && !pg.classList.contains('on')) return
      e.stopPropagation()
      setPop(null)
    }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    document.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      document.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [pop])

  const popped = pop ? figures.find(f => f.id === pop.id) : undefined
  return (
    <div
      className="mxdrawer"
      data-testid="figdrawer"
      ref={rootRef}
      style={{
        top: top ?? 0,
        left,
        ...(top == null ? { visibility: 'hidden' as const } : null),
        ...(arranging ? { pointerEvents: 'none' as const } : null),
      }}
    >
      <table className="mx" style={zoom !== 1 ? ({ zoom, '--lwz': zoom } as CSSProperties) : undefined}>
        <tbody className="mxhead">
          {/* No `data-drawer-key`: the header row is the ONE row whose height is
              not copied from a twin — it is told, from the real header row's
              measured height, because the real header GROWS for these titles
              (`.mx-figures`, matrix.css) and a copy of a growing row would
              chase itself. */}
          <tr style={{ height: headH }}>
            {figures.map(f => (
              <th key={f.id} className={figClass(figures, f.id)} data-fig={f.id}>
                <FigureTitle
                  figure={f}
                  open={pop?.id === f.id}
                  popId={pop?.id === f.id ? POP_ID : undefined}
                  onClick={e => {
                    const at = popAt(e.currentTarget.getBoundingClientRect(), POP_W, POP_H)
                    setPop(p => (p?.id === f.id ? null : { id: f.id, ...at }))
                  }}
                />
              </th>
            ))}
          </tr>
        </tbody>
        <tbody className="mxbody">
          {rows.map(r => {
            // A group heading, a CAT sub-heading and an event line all show one
            // empty box across the block — there is no figure for a heading or
            // for a day's event. They keep the real row's CLASSES as well as its
            // key, so a heading band reads across the drawer and a sub-heading
            // that a phone hides here is hidden there too.
            if (r.kind !== 'person') return (
              <tr
                key={r.key}
                data-drawer-key={r.key}
                className={r.kind === 'group' ? `grp${r.folded ? ' folded' : ''}` : r.kind === 'catsub' ? 'catsub' : undefined}
              >
                <td className="figfill" colSpan={figures.length} />
              </tr>
            )
            return <DrawerPersonRow key={r.key} figures={figures} ctx={ctx} p={r.p} me={r.me} onBox={onBox} />
          })}
        </tbody>
      </table>
      {/* Screen-fixed (matrix.css) so the frozen columns cannot clip it, and
          placed off the title's own rect at the moment of the press.

          `dialog`, not `tooltip` (6 Sep 26 review): a tooltip is something a
          pointer or focus reveals and that describes the thing it hangs off.
          This is a panel a CLICK opens and a click, Escape or a scroll closes,
          and it is the answer to a question the reader asked — which is a
          dialog's contract, not a tooltip's. Named by its own figure, and
          pointed at from the title through `aria-expanded`/`aria-controls`, so
          a reader who cannot see it land is still told it opened and where. */}
      {pop && popped && (
        <div
          className="figpop"
          id={POP_ID}
          data-testid="figpop"
          role="dialog"
          aria-label={`${popped.label} — what this column counts`}
          style={{ left: pop.x, top: pop.y }}
        >
          <div className="figpop-hd">{popped.label}</div>
          <div className="figpop-t">{popped.desc}</div>
        </div>
      )}
    </div>
  )
}
