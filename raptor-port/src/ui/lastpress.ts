/* WHAT WAS PRESSED LAST — the control a question raised by a press elsewhere hangs from (owner D1627: the input window's
   "Open the other input and lose them?" hangs from the other input's bar or card, ui/AskCard.tsx). One listener for the
   app, taking the press as it lands, before any handler runs; a key that acts (Enter, Space, Delete, Backspace) counts
   the control that holds the keyboard. Read only at the moment a question is raised. */
let lastPress: HTMLElement | null = null
const PRESSABLE = 'button, [role="button"], a[href], [tabindex]:not([tabindex="-1"]), input, select, textarea'
function notePress(e: Event) {
  const t = e.target as HTMLElement | null
  if (!t || typeof t.closest !== 'function') return
  lastPress = (t.closest(PRESSABLE) as HTMLElement | null) || t
}
function noteKey(e: KeyboardEvent) {
  if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Delete' && e.key !== 'Backspace') return
  const a = document.activeElement as HTMLElement | null
  if (a && a !== document.body) lastPress = a
}
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', notePress, true)
  document.addEventListener('keydown', noteKey, true)
}
/** the control pressed last, while it is still on the page */
export function lastPressed(): HTMLElement | null {
  return lastPress && lastPress.isConnected ? lastPress : null
}
