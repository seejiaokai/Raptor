// src/bootpolicy.ts
/* THE BOOT POLICY ([DB-READINESS] group A, phase 5 — plan §3 phase 5, Astra R2-09, R3-03; P0-BOOTSTRAP).
   Chosen ONCE, in main.tsx (the composition root), from the build's own configuration, and handed separately to each
   part of the app that could put something into an empty store: the scheduler, the accounts, the Leave War and the
   Tracker (src/boot.ts). The storage `Backend` stays persistence-only — it never knows whether a store is a demo.

   - `seedDemo`  — true: an empty store starts with the demo world, as every test, the dev server, the e2e suite and his
                   Vercel preview always have (unchanged for him). false: a SHARED store — nothing demo ever reaches it:
                   no demo requests, roster, weeks, accounts, Leave War world, Tracker course or students.
                   The policy decides only what an UNSTARTED store gets at its first boot, and which authored demo weeks
                   an unsaved week falls back to; a started store is read as it stands under either policy.
   - `bootstrap` — the first admin of a shared store (the answer to IT's "who is the first admin?", `[IT-QUESTIONS]`).
                   A truly empty shared store has no Person and no User, and only an admin can add people, so the first
                   boot of one makes this person and his admin account, together with the "started" stamp, in ONE
                   saved group — or nothing at all (src/boot.ts bootstrapFirstAdmin). Two forms (Astra R3-03 fix 5):
                     { principal, person: { cs, ini, seat, cat } } — the person is made from this definition;
                     { principal, personId }                       — the person is already in the store (IT made it).
                   `principal` is the sign-in name (the defence mail address, D165). Ignored on a started store, and
                   under the demo policy (a demo store has its own seeded admin).

   Where it comes from: two build settings — `VITE_SEED_DEMO` ("false" or "0" → a shared store) and
   `VITE_BOOTSTRAP_ADMIN` (the JSON above). Where IT keeps them is their answer to come (`[IT-QUESTIONS]` 1 and 26); only
   this reader changes when they say. A setting that cannot be read is kept as `invalid`, never guessed at: the boot of
   an unstarted shared store then refuses to start (fail closed), and says so. */
import type { NewPerson } from './state/roster-add'

export type BootstrapAdmin =
  | { principal: string; person: NewPerson }
  | { principal: string; personId: string }
export type BootPolicy = {
  seedDemo: boolean
  /* null — none configured; 'invalid' — configured, but not readable as one of the two forms */
  bootstrap: BootstrapAdmin | 'invalid' | null
}

/** every test, the dev server, the e2e suite and his preview */
export const DEMO_POLICY: BootPolicy = Object.freeze({ seedDemo: true, bootstrap: null }) as BootPolicy

const str = (x: unknown): x is string => typeof x === 'string' && x.trim() !== ''

/** the first admin's configuration, read — the two forms only; anything else is `invalid` */
export function readBootstrap(raw: unknown): BootstrapAdmin | 'invalid' | null {
  if (raw == null || (typeof raw === 'string' && raw.trim() === '')) return null
  let v: unknown = raw
  if (typeof raw === 'string') { try { v = JSON.parse(raw) } catch { return 'invalid' } }
  if (!v || typeof v !== 'object' || Array.isArray(v)) return 'invalid'
  const o = v as Record<string, unknown>
  if (!str(o.principal)) return 'invalid'
  const principal = o.principal.trim()
  if (str(o.personId) && o.person == null) return { principal, personId: o.personId.trim() }
  if (o.person && typeof o.person === 'object' && !Array.isArray(o.person) && o.personId == null) {
    const p = o.person as Record<string, unknown>
    return { principal, person: { cs: String(p.cs ?? ''), ini: String(p.ini ?? ''), seat: String(p.seat ?? ''), cat: String(p.cat ?? '') } }
  }
  return 'invalid'
}

/** the policy, from the build's settings (main.tsx passes `import.meta.env`) */
export function bootPolicyFrom(env: Record<string, any>): BootPolicy {
  const sd = String(env.VITE_SEED_DEMO ?? '').trim().toLowerCase()
  const seedDemo = !(sd === 'false' || sd === '0' || sd === 'no')
  return { seedDemo, bootstrap: readBootstrap(env.VITE_BOOTSTRAP_ADMIN) }
}
