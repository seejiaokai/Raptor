import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/* A QUESTION HANGS FROM THE CONTROL PRESSED (owner D1626, 3 Nov 26 — "if u want to close, you position your hand to reach
   it"; which questions, D1627 and D1628, 4 Nov 26). The card is the input window's ✕ card (`.inped-xask`) made to hang
   from any control: below it where there is room, else above it, its small pointer at the control's middle, kept inside
   the window or sheet the control sits in. It is drawn inside that window or sheet (so a press on it is a press inside,
   and a sheet that closes on a press outside stays up); `portal` draws it in the control's own window or page instead, for
   a question whose control lies outside the window that asks (the input window's "Open the other input and lose them?" —
   the press landed on the page behind it, or on a card of the opened day — ui/lastpress.ts names it). Position: fixed,
   recomputed on every scroll and resize while it is up; a sheet that is itself moved by a transform is the card's frame of reference, so the offset is measured, never assumed. */

const GAP = 9         // from the control's edge to the card's, the pointer in between
const EDGE = 8         // the card never comes nearer the screen's edge than this
const FRAME = '.floatwin, .bidsheet, [role="dialog"], dialog'
const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

export interface AskCardProps {
  /** the control pressed — the card hangs from it */
  at: HTMLElement | null | undefined
  /** the control lies outside the asking window: draw the card in the control's own window or page, over the rest */
  portal?: boolean
  testid: string
  label: string
  question: ReactNode
  /** a second line under the question, in the card's lighter grey */
  sub?: ReactNode
  /** the answers, right-aligned: the safe one last, filled, holding the keyboard */
  children: ReactNode
  onKeyDown?: (e: React.KeyboardEvent) => void
  /** Escape anywhere on the page answers the card so (its safe answer), wherever the keyboard is — for a card in a sheet
   *  that leaves Escape to it (the Leave War's Sheet does while a card stands in it) */
  onEscape?: () => void
}

export function AskCard({ at, portal, testid, label, question, sub, children, onKeyDown, onEscape }: AskCardProps) {
  const escRef = useRef(onEscape)
  useLayoutEffect(() => { escRef.current = onEscape })
  useEffect(() => {
    if (!onEscape) return
    const k = (e: KeyboardEvent) => { if (e.key !== 'Escape' || e.defaultPrevented) return; e.preventDefault(); escRef.current?.() }
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [!onEscape])  // eslint-disable-line react-hooks/exhaustive-deps -- armed once while a handler is given; the latest is read through escRef
  const card = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number; px: number; side: 'below' | 'above' } | null>(null)

  useLayoutEffect(() => {
    const n = card.current
    if (!n) return
    const place = () => {
      const c = card.current
      if (!c) return
      const vw = window.innerWidth, vh = window.innerHeight
      /* no control on the page (gone, or never known): the card stands at the top of its own window, as a plain question */
      const ctl = at && at.isConnected ? at : null
      const r = ctl ? ctl.getBoundingClientRect() : null
      /* the frame it keeps inside: the control's own window or sheet, where that is wide enough for the card */
      const fw = ctl ? ctl.closest(FRAME) as HTMLElement | null : null
      const fr = fw ? fw.getBoundingClientRect() : null
      const lo = fr && fr.width >= 316 ? Math.max(EDGE, fr.left + 4) : EDGE
      const hi = fr && fr.width >= 316 ? Math.min(vw - EDGE, fr.right - 4) : vw - EDGE
      const W = c.offsetWidth, H = c.offsetHeight
      let left: number, top: number, side: 'below' | 'above' = 'below'
      if (r) {
        const mid = (r.left + r.right) / 2
        const fmid = fr ? (fr.left + fr.right) / 2 : vw / 2
        left = mid > fmid ? r.right - W : r.left
        left = Math.min(Math.max(left, lo), Math.max(lo, hi - W))
        if (r.bottom + GAP + H <= vh - EDGE || r.top - GAP - H < EDGE) top = r.bottom + GAP
        else { top = r.top - GAP - H; side = 'above' }
      } else {
        const own = c.parentElement?.closest(FRAME) as HTMLElement | null
        const orr = own ? own.getBoundingClientRect() : { left: 0, top: 0, right: vw }
        left = Math.min(Math.max(orr.right - W - 8, EDGE), vw - W - EDGE); top = orr.top + 48
      }
      const px = r ? Math.min(Math.max((r.left + r.right) / 2 - left, 14), W - 14) : W - 22
      /* a sheet moved by a transform is the fixed card's frame of reference: where the card stands now, less the left and
         top it was given, is where (0, 0) lands — subtracted */
      const o = c.getBoundingClientRect()
      const ox = o.left - (parseFloat(c.style.left) || 0), oy = o.top - (parseFloat(c.style.top) || 0)
      const next = { left: Math.round(left - ox), top: Math.round(top - oy), px: Math.round(px), side }
      setPos(p => p && p.left === next.left && p.top === next.top && p.px === next.px && p.side === next.side ? p : next)
    }
    place()
    window.addEventListener('resize', place)
    document.addEventListener('scroll', place, true)
    return () => { window.removeEventListener('resize', place); document.removeEventListener('scroll', place, true) }
  }, [at])

  /* the keyboard goes back to the control the question hung from, once it is answered (the design guide §3) — only when
     the keyboard was in the card, and nothing else has taken it since */
  const hadFocus = useRef(false)
  /* what held the keyboard as the question came up (read while rendering, before the card's safe answer takes it) */
  const [before] = useState<Element | null>(() => (typeof document !== 'undefined' ? document.activeElement : null))
  useLayoutEffect(() => () => {
    if (!hadFocus.current || !at || !at.isConnected) return
    const n = card.current
    const a = document.activeElement
    /* what held the keyboard when it was asked, where that is the control or inside it (the card's own open control, after
       the Delete key); else the control itself, or the first thing in it that takes the keyboard */
    const was = before instanceof HTMLElement && before.isConnected && (before === at || at.contains(before)) ? before : null
    const back = was || (at.matches(FOCUSABLE) ? at : at.querySelector<HTMLElement>(FOCUSABLE))
    if (back && (!a || a === document.body || (n && n.contains(a)))) back.focus({ preventScroll: true })
  }, [at, before])

  const node = (
    /* eslint-disable-next-line react-doctor/prefer-html-dialog -- a question hanging from a control inside a window or sheet: it leaves the page behind working (D641) and moves with its control; a <dialog> would open in the top layer, cut from the control it points at */
    <div ref={card} role="alertdialog" aria-label={label} className={`askcard ${pos ? 'ac-' + pos.side : 'ac-measure'}${portal ? ' ac-over' : ''}`} data-testid={testid}
      onKeyDown={onKeyDown} onFocus={() => { hadFocus.current = true }}
      style={pos ? { left: pos.left, top: pos.top, ['--ac-px' as any]: pos.px + 'px' } : undefined}>
      <span className="askcard-q">{question}</span>
      {sub && <span className="askcard-sub">{sub}</span>}
      <span className="askcard-btns">{children}</span>
    </div>
  )
  /* drawn into the window, or else the page, the control sits in — never loose on the document — so a press on it is a
     press there, and the window keeps its place in front (on a phone the opened day stands over the asking window) */
  const into = portal ? ((at && (at.closest(FRAME) || at.closest('[id^="page-"]'))) as HTMLElement | null) || document.body : null
  return into ? createPortal(node, into) : node
}
