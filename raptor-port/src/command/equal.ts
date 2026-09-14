// src/command/equal.ts
/* Structural equality for record VALUES (which are JSON-shaped data, matching the
   storage contract that persists JSON strings). Used for no-op detection at the
   commit gate and for the derivation fixed-point check (spec §2.4). */
export function sameContent(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false
  const aArr = Array.isArray(a), bArr = Array.isArray(b)
  if (aArr !== bArr) return false
  if (aArr) {
    const x = a as unknown[], y = b as unknown[]
    if (x.length !== y.length) return false
    for (let i = 0; i < x.length; i++) if (!sameContent(x[i], y[i])) return false
    return true
  }
  const ao = a as Record<string, unknown>, bo = b as Record<string, unknown>
  const ka = Object.keys(ao), kb = Object.keys(bo)
  if (ka.length !== kb.length) return false
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(bo, k)) return false
    if (!sameContent(ao[k], bo[k])) return false
  }
  return true
}
