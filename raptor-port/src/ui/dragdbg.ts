/* An OPTIONAL on-screen drag-state readout, for diagnosing a drag that fails
   on a browser with NO devtools — the MINDEF secured "SIS" browser, where the
   white box under a dragged puck lived (see drag.ts). It is OFF by default and
   attaches NOTHING to the page unless it is switched on, so it never reaches a
   normal user.

   Turn it on two ways (the second is for a locked-down browser whose address
   bar you cannot edit):
     • add ?dragdbg=1 (or #dragdbg) to the URL, or
     • tap the very top-left corner of the screen five times within ~2.5 s.

   The panel is `pointer-events:none` — LOAD-BEARING: a panel that caught the
   press would eat the very drag it measures. It LATCHES each drag's values and
   holds them until the next press, so you can let go and THEN photograph it (a
   live readout resets on the next touch and is unphotographable). Every field
   is written by a one-line DBG.* call at a point that already exists in
   drag.ts; each call is a no-op until the readout is armed.

   Reading it — one photo tells apart the four ways a drag can fail on SIS:
     • NAT ≥ 1  → the browser STILL starts its own drag though nothing on the
                  page is draggable. No page change can stop that — it goes to
                  the SIS / MINDEF admins.
     • PD ≥ 1, MV ≥ 1, ARM 1, but PU 0 → the release was swallowed; CAN or BLUR
                  says what ate it (that is the trigger to build the deferred
                  cancel/blur drop-recovery).
     • PU ≥ 1, DROP NONE, EFP BODY/HTML → the release coordinates arrive offset,
                  so elementFromPoint misses the drop zone.
     • PD never moves, or ARM never flips → events are not reaching the page, or
                  the 3 px arm threshold was never met (nothing to do with SIS).
*/

type Under = { closest?: any; tagName?: string; className?: any } | null

let ON = false
let panel: HTMLElement | null = null
let corner: ((e: PointerEvent) => void) | null = null

const S = {
  n: 0, ptype: '', pd: 0, pdxy: '', mv: 0, arm: 0,
  nat: 0, can: 0, blur: 0, pu: 0, puxy: '', efp: '', drop: '',
}

function wantsOn(): boolean {
  try {
    return /(?:^|[?&])dragdbg=1(?:&|$)/.test(location.search) || /(?:^|#)dragdbg\b/.test(location.hash)
  } catch (_) { return false }
}

function ensurePanel() {
  if (panel || typeof document === 'undefined') return
  const el = document.createElement('div')
  el.id = 'dragdbg'
  el.setAttribute('style', [
    'position:fixed', 'left:0', 'right:0', 'top:0', 'z-index:2147483647',
    'pointer-events:none', 'font:bold 13px/1.35 ui-monospace,Menlo,Consolas,monospace',
    'color:#7CFC00', 'background:rgba(0,0,0,.86)', 'padding:6px 8px',
    'white-space:pre-wrap', 'word-break:break-word',
  ].join(';'))
  document.body.appendChild(el)
  panel = el
}

function render() {
  if (!panel) return
  panel.textContent =
    `DRAG #${S.n}  ${S.ptype || '—'}\n` +
    `PD ${S.pd}${S.pdxy ? ' @' + S.pdxy : ''}   MV ${S.mv}   ARM ${S.arm}\n` +
    `NAT ${S.nat}   CAN ${S.can}   BLUR ${S.blur}\n` +
    `PU ${S.pu}${S.puxy ? ' @' + S.puxy : ''}   EFP ${S.efp || '—'}   DROP ${S.drop || '—'}`
}

/* switch the readout on and draw it; safe to call more than once */
function arm() {
  if (ON) return
  ON = true
  ensurePanel()
  render()
}

/* the five-tap corner fallback — a light listener that stays even while OFF, so
   a locked-address-bar browser can still turn the readout on by hand */
function wireCorner() {
  let taps = 0, first = 0
  corner = (e: PointerEvent) => {
    if (ON) return
    /* real taps only — a synthetic pointerdown from a test (isTrusted false)
       must never arm the readout and leak module state into the next test */
    if (!e.isTrusted) return
    if (e.clientX > 64 || e.clientY > 64) { taps = 0; return }
    const now = (e as any).timeStamp || 0
    if (!taps || now - first > 2500) { taps = 1; first = now } else { taps++ }
    if (taps >= 5) arm()
  }
  document.addEventListener('pointerdown', corner, { passive: true, capture: true })
}

/* the hooks drag.ts calls unconditionally; each is inert until armed */
export const DBG = {
  pd(x: number, y: number, ptype: string) {
    if (!ON) return
    S.n++; S.ptype = ptype; S.pd = 1; S.pdxy = `${x | 0},${y | 0}`
    S.mv = 0; S.arm = 0; S.nat = 0; S.can = 0; S.blur = 0; S.pu = 0; S.puxy = ''; S.efp = ''; S.drop = ''
    render()
  },
  mv() { if (!ON) return; S.mv++; render() },
  arm() { if (!ON) return; S.arm = 1; render() },
  nat(trusted: boolean) { if (!ON) return; if (trusted) { S.nat++; render() } },
  can() { if (!ON) return; S.can++; render() },
  blur() { if (!ON) return; S.blur++; render() },
  pu(x: number, y: number) { if (!ON) return; S.pu++; S.puxy = `${x | 0},${y | 0}`; render() },
  efp(el: Under) {
    if (!ON) return
    if (!el || !el.tagName) { S.efp = 'null' } else {
      const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : ''
      S.efp = el.tagName + cls
    }
    render()
  },
  drop(label: string) { if (!ON) return; S.drop = label; render() },
}

/* wired from initDrag(); returns a detach for its cleanup */
export function initDragDbg() {
  if (wantsOn()) arm()
  else wireCorner()
  return () => {
    if (corner) { document.removeEventListener('pointerdown', corner, { capture: true } as any); corner = null }
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel)
    panel = null; ON = false
  }
}
