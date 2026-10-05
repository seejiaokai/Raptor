/* THE ONE TEST FOR "A CLICK ON THE DARK SURROUND" ([MODAL-DRAG-CLOSE] — his report, 3 Oct 26, D538).
   A pop-up window closes on a click outside it (owner, 4 Sep 26). Each window used to ask only where the CLICK landed —
   but a press that begins inside the window (selecting a box's text by dragging) and is let go on the surround is
   reported by the browser as ONE click on the surround, the nearest thing the press and the release share. So the Duty
   templates window closed under a man who was selecting the text of a Role box, and every window with the same test
   did the same.
   The rule: the click must land on the surround AND the press that began it must have begun on the surround too. A
   click with no press recorded (a keyboard or assistive-technology activation, a test that dispatches a bare click)
   counts as an honest click. The press is remembered at the document, in the capture phase, so no window can miss it,
   and forgotten once its click has been delivered. */
let press: EventTarget | null = null
if (typeof document !== 'undefined') {
  const note = (e: Event) => { press = e.target }
  document.addEventListener('pointerdown', note, true)
  document.addEventListener('mousedown', note, true)
  document.addEventListener('click', () => { setTimeout(() => { press = null }, 0) }, true)
}
/** the same rule for a window whose surround is known by a CLASS, not an id (W10, the Codex stack check, 5 Oct 26 —
    the four confirmation windows: the OIL question, the upchit one, "covers other days", "no medical document". The
    3 Oct fix's roll-call was the windows that test an id, and its guard test looked only for that spelling) */
export function clickedSurround(e: { target: EventTarget | null }, cls: string): boolean {
  const t = e.target as HTMLElement | null
  return !!t && !!t.classList && t.classList.contains(cls) && (press == null || press === t)
}
/** true when this click is a click on the window's own surround (the element with `id`), begun there too */
export function clickedOutside(e: { target: EventTarget | null }, id: string): boolean {
  const t = e.target as HTMLElement | null
  return !!t && t.id === id && (press == null || press === t)
}
