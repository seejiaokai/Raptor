/* Is this svg drawn with exactly these shapes? — for the tests of round 4's drawn marks ([UI-CONSISTENCY-LOOK], D1703–D1707):
   the shapes are parsed into a scratch svg by the same parser the app's svg went through, and the two compared. A typed
   mark left in place has no svg; a different drawing has different shapes. */
export function drawnAs(svg: Element | null | undefined, inner: string): boolean {
  if (!svg) return false
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  t.innerHTML = inner
  const norm = (e: Element) => e.innerHTML.replace(/\s+/g, ' ').trim()
  return norm(svg) === norm(t)
}
