/* [ARCH-STACK] Step 2 — the invariant harness (design §7, plan SEQ-001).

   Invariants are CLASSIFIED before any are coded (SEQ-001, high). Three classes:
   - HARD     — structural-integrity + authorization. Enforced UNCONDITIONALLY
                at the commit gate (a violation rolls the commit back).
   - ADVISORY — scheduling rules (crew rest, clashes...). These are
                INTENTIONALLY allowed-with-a-warning; the harness tests their
                detection/severity/exemptions/cross-consumer agreement, NEVER
                hard-refuses them. Recorded here, checked by the engine's own
                tests, never enforced at the gate.
   - FROZEN   — issued-record immutability + signature binding. Recorded now;
                its put-once ENFORCEMENT is Step 3 (design §3.4), not Step 2 —
                today's silent-undo-before-sent legitimately reverses a just-
                issued Original, so a hard gate here would reject a permitted
                undo.

   This module is the first invariant-harness increment; it grows one increment
   per architectural step. Domain invariants are registered by each module as it
   is adopted (phases 2-5).
*/
import type { CommitEnvelope } from './types'
import { LOGICAL_TO_BLOB } from './registry'

export type InvariantClass = 'hard' | 'advisory' | 'frozen'

export interface Invariant {
  id: string
  cls: InvariantClass
  /* returns null when satisfied, or a message when violated. Only `hard`
     invariants are run at the commit gate; advisory/frozen are for tests. */
  check: (env: CommitEnvelope) => string | null
}

const INVARIANTS: Invariant[] = []

export function defineInvariant(inv: Invariant): void {
  const dup = INVARIANTS.find(i => i.id === inv.id)
  if (dup) {
    if (dup.cls !== inv.cls) throw new Error(`invariant: conflicting re-register of ${inv.id}`)
    return
  }
  INVARIANTS.push(inv)
}
export function invariants(cls?: InvariantClass): readonly Invariant[] {
  return cls ? INVARIANTS.filter(i => i.cls === cls) : INVARIANTS
}

/* run every HARD invariant against an envelope; return the first violation
   message, or null. Called at commit phase 5. */
export function checkHardInvariants(env: CommitEnvelope): string | null {
  for (const inv of INVARIANTS) {
    if (inv.cls !== 'hard') continue
    const msg = inv.check(env)
    if (msg) return `${inv.id}: ${msg}`
  }
  return null
}

/* test-only */
export function _resetInvariants(): void { INVARIANTS.length = 0 }

/* ---- the Step-2 baseline HARD invariants (structural integrity) ---------- */
/* Registered once, here, so the core always enforces well-formed changes. */
export function installBaselineInvariants(): void {
  defineInvariant({
    id: 'change-well-formed',
    cls: 'hard',
    check: (env) => {
      for (const c of env.changes) {
        if (c.op !== 'put' && c.op !== 'delete') return `bad op ${c.op}`
        if (!c.collection || !(c.collection in LOGICAL_TO_BLOB)) return `unknown collection ${c.collection}`
        if (typeof c.id !== 'string' || c.id.length === 0) return `empty id in ${c.collection}`
        if (c.op === 'put' && c.after === undefined) return `put with no after in ${c.collection}/${c.id}`
      }
      return null
    },
  })
}
