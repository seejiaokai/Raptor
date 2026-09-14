// src/command/equal.ts
/* Structural equality + cloning for record VALUES (JSON-shaped data, matching the
   storage contract that persists JSON strings). Used for no-op detection at the
   commit gate and the derivation fixed-point check (spec §2.4). */

/** True for a plain JSON container (object literal or array) or a primitive; false
    for Date/Map/Set/class instances — those are NOT valid record values and must
    not be treated as content-equal just because they share no enumerable keys
    (review F4). A primitive returns true here (handled by the caller). */
function isPlain(v: object): boolean {
  if (Array.isArray(v)) return true
  const proto = Object.getPrototypeOf(v)
  return proto === Object.prototype || proto === null
}

export function sameContent(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false
  // Non-plain objects (Date/Map/Set/instances) are not valid JSON record values;
  // never report two of them equal by "both have zero own keys".
  if (!isPlain(a) || !isPlain(b)) return false
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

/** Deep copy of a JSON-shaped record value, so the store never holds a caller's
    live reference and never hands one back (review F3). Primitives pass through;
    structuredClone throws on functions/symbols — a loud signal of a non-JSON value. */
export function clone<T>(v: T): T {
  return v === null || typeof v !== 'object' ? v : structuredClone(v)
}
