/* [ARCH-STACK] Step 2 — the suppression-context registry (design §3.2 ph.9).

   Legacy side-effects (notify / HOOKS.histPush / module persist() / toast /
   logEdit / logAction / recordHistory) are LATCHED during a commit and released
   on success (discarded on rollback). Every latched/queued effect carries a
   SUPPRESSION-CONTEXT TOKEN — HIST.lock / LW-lock / SYNCING captured at raise
   time, re-applied for the duration of the released call — so a lock-wrapped
   forward batch (board sortDay) or any deferred histPush/recordHistory records
   EXACTLY as today (Codex R4-001 / Fable R4-2), keeping tfin.js 728/0.

   The core cannot import HIST.lock / the LW lock / SYNCING (layering), so each
   module REGISTERS how to capture and re-install its ambient suppression state.
   Phase-1 tests register a fake context to prove the mechanism.
*/

export interface EffectContext {
  key: string
  /* snapshot the ambient suppression state (e.g. HIST.lock's current value) */
  capture(): unknown
  /* set the ambient state to `snap` and return a restore() that puts it back */
  install(snap: unknown): () => void
}

const CONTEXTS: EffectContext[] = []

export function registerEffectContext(c: EffectContext): void {
  const dup = CONTEXTS.find(x => x.key === c.key)
  if (dup) return
  CONTEXTS.push(c)
}

/* snapshot every registered context — called when an effect is deferred */
export function captureContexts(): unknown[] {
  return CONTEXTS.map(c => c.capture())
}

/* install a captured set for the duration of a released effect; returns a
   single restore() that undoes them all in reverse order */
export function installContexts(snaps: unknown[]): () => void {
  const restores = CONTEXTS.map((c, i) => c.install(snaps[i]))
  return () => { for (let i = restores.length - 1; i >= 0; i--) restores[i]() }
}

/* test-only */
export function _resetEffectContexts(): void { CONTEXTS.length = 0 }
