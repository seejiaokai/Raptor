/* [ARCH-STACK] Step 2 — small structural helpers for the command layer.

   Records are plain JSON-shaped data (the app's own idiom — histSnap uses
   JSON.stringify), so a structural clone and a key-order-insensitive deep-equal
   are all the change-derivation needs. deepEqual is key-order-insensitive on
   purpose: a reducer that REPLACES a record object with a fresh one of identical
   content must not read as a change. */

export function deepClone<T>(v: T): T {
  if (typeof (globalThis as any).structuredClone === 'function') {
    return (globalThis as any).structuredClone(v)
  }
  return JSON.parse(JSON.stringify(v))
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return a === b
  const ta = typeof a, tb = typeof b
  if (ta !== tb) return false
  if (ta !== 'object') return a === b
  const aa = Array.isArray(a), ba = Array.isArray(b)
  if (aa !== ba) return false
  if (aa) {
    const A = a as unknown[], B = b as unknown[]
    if (A.length !== B.length) return false
    for (let i = 0; i < A.length; i++) if (!deepEqual(A[i], B[i])) return false
    return true
  }
  const A = a as Record<string, unknown>, B = b as Record<string, unknown>
  const ka = Object.keys(A), kb = Object.keys(B)
  if (ka.length !== kb.length) return false
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(B, k)) return false
    if (!deepEqual(A[k], B[k])) return false
  }
  return true
}
