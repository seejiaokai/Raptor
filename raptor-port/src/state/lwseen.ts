/* WHEN EACH PERSON LAST OPENED HIS OWN PERSON WINDOW ON THE LEAVE WAR (the overhaul's M5a — D1231, D1481; the build spec
   §3): a line of his leave someone else changed since then wears the cyan dot and a muted "who, when" under it.

     `settings/lwseen:<pid>` = { at: <ms> }

   One row a person, his own — M4's `apprseen:` pattern whole (state/apprseen.ts). WRITTEN WHEN HE OPENS his own window,
   an admin included; the PREVIOUS moment is what "new" counts from for that visit, kept by the window for as long as it
   is open. ONE command, `lw.seen`, which may write only the signed-in person's own row (state/perms.ts — the settings
   case of ownershipViolation, finding 10c; docs/data-model.md §11, together — D200), and is never an Undo step
   (undo/timeline.ts NOT_STEPS). */
import { store } from '../engine/hooks'
import { commitSettingsIntent } from './people-settings-commit'

export const LWSEEN_PFX = 'lwseen:'
/* its one command, declared to the command layer with the other own-row "seen" records (state/people-settings-commit.ts) */
export const LWSEEN_TYPES = ['lw.seen'] as const

/** when this person last opened his own person window (ms), or 0 — never */
export function lwSeenAt(pid: string | null | undefined): number {
  if (!pid) return 0
  const v: any = store.get(LWSEEN_PFX + pid, null)
  return v && Number.isFinite(v.at) && v.at > 0 ? +v.at : 0
}

/** he opens his own window now: the moment is written, and the PREVIOUS one returned */
export function openOwnWindow(pid: string | null | undefined, now: number = Date.now()): number {
  const prev = lwSeenAt(pid)
  if (!pid) return prev
  commitSettingsIntent('lw.seen', { owner: pid }, () => { store.set(LWSEEN_PFX + pid, { at: now }) })
  return prev
}
