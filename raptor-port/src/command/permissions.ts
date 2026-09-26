/* [ARCH-STACK] Step 2 — authorization at the gate (design §3.5).

   Every FORWARD command type declares a required permission (a predicate over
   the acting Actor). commit() authorizes cmd.type before applying; reject =>
   nothing applied. A command type MUST be registered before it can commit — an
   unregistered type is refused, which forces every adopted writer (phases 2-5)
   to declare its permission rather than defaulting open.

   A joined child's permission is the PARENT command's declared permission,
   never caller-selected (Fable R4-7): children run inside an already-authorized
   parent and are not re-authorized, so a member-permitted root can't smuggle an
   admin-only child (the composition is fixed in the parent's apply()).

   Undo/redo permission (inverse re-check vs the CURRENT effective actor) is a
   Step-3 rule (undo becomes stream-driven then); at Step 2 undo stays ungated
   exactly as today (design §0).

   Client gate = defense-in-depth; real auth at Step 5.
*/
import type { Actor } from './types'

export type PermCheck = (actor: Actor, meta?: any) => boolean

/* the system/headless actor (seed/projection/restore/loadWeek) always passes —
   it is the engine acting on its own behalf, never a user. */
export const anyone: PermCheck = () => true
export const adminOnly: PermCheck = (a) => a.role === 'admin'
/* a member may act on a record they own; an admin may act on any. `owner` is
   the personId the record belongs to, read from cmd.meta by the check the type
   registers. */
export function ownOrAdmin(ownerOf: (meta: any) => string | undefined): PermCheck {
  return (a, meta) => a.role === 'admin' || (a.personId != null && a.personId === ownerOf(meta))
}

const PERMS = new Map<string, PermCheck>()

/* [ACCOUNTS] D200 (3) — ONE place answers "may this person do this?". Once the app
   boots (state/store.ts initStore), `state/perms.ts` installs a resolver here and
   EVERY non-system authorization goes through it: its COMMAND_OPS table maps each
   registered type to a row of the permissions matrix that mirrors data-model.md §11
   (drift-tested). The check a module passed to definePermission is then only the
   declaration that the type exists — and the headless fallback for a unit test that
   never boots the store. A registered type the resolver does not know is REFUSED
   (fail closed); `perms.test.ts` proves every registered type has a row. */
type Resolver = (type: string, actor: Actor, meta?: any) => boolean
let RESOLVER: Resolver | null = null
export function setPermissionResolver(fn: Resolver | null): void { RESOLVER = fn }
/* every registered command type — read by the coverage test after every module
   has registered (scheduler, people/settings, undo, the Leave War, the Tracker) */
export function registeredTypes(): string[] { return [...PERMS.keys()] }

export function definePermission(type: string, check: PermCheck): void {
  const dup = PERMS.get(type)
  if (dup && dup !== check) throw new Error(`permission: conflicting re-register of ${type}`)
  PERMS.set(type, check)
}
export function hasPermission(type: string): boolean {
  return PERMS.has(type)
}

/* returns true iff `actor` may run `type`. System actor short-circuits (seed/
   projection/restore/loadWeek act as the engine). An unregistered type is
   refused. */
export function authorize(type: string, actor: Actor, meta?: any): boolean {
  if (actor.role === 'system') return true
  const check = PERMS.get(type)
  if (!check) return false
  if (RESOLVER) return RESOLVER(type, actor, meta)
  return check(actor, meta)
}

/* test-only: clear registered permissions between suites */
export function _resetPermissions(): void {
  PERMS.clear()
}
