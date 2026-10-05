/* D550–D556: the live editor's existing DOM order is the agreed B route.
   Collect at the gesture, so folds, row changes and section order stay current. */
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { canEditSched } from '../state/auth'
import { CURPAGE, SBDAY, DPREV, navGen } from '../state/view'
import { oilModeOn } from './oilmode'
import { windowOverSchedule } from './pops'

const WEEK_TEXT = '[data-txt],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]'
const BOARD_TEXT = '[data-bfld],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]'
const ALL_TEXT = `${WEEK_TEXT},${BOARD_TEXT}`
const CONTROL = 'button,input,textarea,select,a[href],[tabindex]'
type Scope = { root: HTMLElement; boundary: HTMLElement; di: number; board: boolean; nav: number }

function rendered(el: HTMLElement, seen?: Map<HTMLElement, boolean>): boolean {
  const known = seen?.get(el)
  if (known !== undefined) return known
  if (!el.isConnected) return false
  const style = getComputedStyle(el)
  const visible = !el.hidden && !el.hasAttribute('inert') && el.getAttribute('aria-hidden') !== 'true'
    && style.display !== 'none' && style.visibility !== 'hidden' && style.visibility !== 'collapse'
    && (!el.parentElement || rendered(el.parentElement, seen))
  seen?.set(el, visible)
  return visible
}
function textField(el: HTMLElement, seen?: Map<HTMLElement, boolean>): boolean {
  if (el.closest('[data-role-ui],[data-role-remarks],.pv-frozen,[role="dialog"]') || !rendered(el, seen)) return false
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
    return !el.disabled && !el.readOnly && (el instanceof HTMLTextAreaElement || ['text','search','tel','url','email','number'].includes(el.type))
  return el.getAttribute('contenteditable') === 'true'
}
function scopeOf(source: HTMLElement): Scope | null {
  if (CURPAGE !== 'editsched' || !canEditSched() || !HOOKS.editMode()) return null
  /* a window is over the schedule: its boxes are not a route to walk (W12) — the browser's own Tab applies */
  if (windowOverSchedule()) return null
  let root: HTMLElement | null, boundary: HTMLElement | null, di: number, board = SBDAY != null
  if (board) {
    root = document.getElementById('sbBoard'); boundary = document.getElementById('schedBoard'); di = +SBDAY
    if (!root || !boundary || !root.contains(source) || !rendered(boundary)) return null
  } else {
    root = source.closest('#eWeek > .day[data-day]') as HTMLElement | null
    boundary = root; di = Number(root?.dataset.day)
    if (!root || !rendered(root)) return null
  }
  if (!Number.isInteger(di) || di < 0 || !DAYS[di] || DPREV.has(di) || oilModeOn(di)) return null
  return { root, boundary: boundary!, di, board, nav: navGen() }
}
function sameScope(scope: Scope): boolean {
  return scope.root.isConnected && rendered(scope.boundary) && scope.nav === navGen()
    && CURPAGE === 'editsched' && canEditSched() && HOOKS.editMode()
    && !DPREV.has(scope.di) && !oilModeOn(scope.di)
    && (scope.board ? SBDAY === scope.di : SBDAY == null)
}
function ordinaryTarget(scope: Scope, source: HTMLElement, backwards: boolean): HTMLElement | undefined {
  const nodes = [...scope.boundary.querySelectorAll<HTMLElement>(CONTROL)].filter(el => {
    if (el.matches(ALL_TEXT) || el.closest('[role="dialog"],[data-role-ui],.pv-frozen') || !rendered(el) || el.tabIndex < 0) return false
    if ((el as HTMLInputElement).disabled || el.getAttribute('aria-disabled') === 'true') return false
    if (scope.board) {
      // Day tabs are navigation; a parked phone crew drawer is not surfaced.
      if (el.closest('#sbDays') || el.matches('[data-btab],[data-bprev],[data-bnext],[data-bweek]')) return false
      const roster = el.closest('#sbRoster')
      if (roster && !document.body.classList.contains('ros-open')) {
        const r = el.getBoundingClientRect()
        if (r.right <= 0 || r.left >= window.innerWidth || r.width === 0) return false
      }
    }
    const position = source.compareDocumentPosition(el)
    return !!(position & (backwards ? Node.DOCUMENT_POSITION_PRECEDING : Node.DOCUMENT_POSITION_FOLLOWING))
  })
  return backwards ? nodes.at(-1) : nodes[0]
}

export function routeScheduleTab(e: KeyboardEvent, refresh: (el: HTMLElement) => void): boolean {
  if (e.key !== 'Tab' || e.defaultPrevented || e.isComposing || e.ctrlKey || e.altKey || e.metaKey) return false
  const eventTarget = e.target
  if (!(eventTarget instanceof HTMLElement)) return false
  const source = eventTarget.closest<HTMLElement>(ALL_TEXT)
  if (!source || document.activeElement !== source || !textField(source)) return false
  const scope = scopeOf(source)
  if (!scope) return false
  // Share ancestor reads within this one gesture, discarded before any blur.
  const seen = new Map<HTMLElement, boolean>()
  const fields = [...scope.root.querySelectorAll<HTMLElement>(scope.board ? BOARD_TEXT : WEEK_TEXT)].filter(el => textField(el, seen))
  const index = fields.indexOf(source)
  if (index < 0) return false
  const next = fields[index + (e.shiftKey ? -1 : 1)]
  const destination = next || ordinaryTarget(scope, source, e.shiftKey)
  e.preventDefault()
  // Native blur/change remain the only save paths. Re-check after those handlers.
  source.blur()
  /* THE SAVE ASKED FOR A WINDOW (W12): a weekend duty request's time opens the OIL question, drawn a moment after this
     handler ends. Stop here — the caret must not land in a box behind it, where typing and further Tabs would go on
     editing the schedule unseen; the window takes the keyboard when it opens (ui/sheetfocus.ts). */
  if (windowOverSchedule()) return true
  if (!sameScope(scope) || !destination?.isConnected) return true
  // A blur handler can deliberately give a newly opened dialog its own caret.
  // Preserve that focus rather than overriding it with the collected successor.
  if (document.activeElement !== document.body && document.activeElement !== source) return true
  if (next) {
    if (!scope.root.contains(next) || !textField(next)) return true
    // A skipped repaint can leave derived or repeated boxes stale. Refresh only
    // the unfocused destination from its existing model reader, never a writer.
    refresh(next)
  } else if (!rendered(destination)) return true
  destination.focus()
  // Native focus can leave the box beneath the week arrows or sticky bars.
  // Reveal only a covered destination; nearest inline keeps unrelated day pan.
  const rect = destination.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) {
    const covered = () => {
      const r = destination.getBoundingClientRect()
      // Desktop layout on a phone can draw a box wider than the viewport.
      // Its visible portion must be reachable; its offscreen centre cannot be.
      const left = Math.max(0, r.left), right = Math.min(window.innerWidth, r.right)
      const top = Math.max(0, r.top), bottom = Math.min(window.innerHeight, r.bottom)
      const hit = right > left && bottom > top
        ? document.elementFromPoint((left + right) / 2, (top + bottom) / 2) : null
      return hit !== destination && !destination.contains(hit)
    }
    if (covered()) {
      destination.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })
      // The week's arrows themselves sit at viewport centre. Move the actual
      // vertical scroller a little further if centring still leaves an overlay.
      if (covered()) {
        let scroller = destination.parentElement
        while (scroller && !(scroller.scrollHeight > scroller.clientHeight
          && /auto|scroll/.test(getComputedStyle(scroller).overflowY))) scroller = scroller.parentElement
        const owner = scroller || document.scrollingElement
        owner?.scrollBy({ top: Math.min(window.innerHeight, owner.clientHeight) * 0.2, behavior: 'instant' })
      }
    }
  }
  return true
}
