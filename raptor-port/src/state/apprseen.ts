/* WHEN EACH ADMIN LAST OPENED THE LEAVE WAR'S APPROVALS (the overhaul's M4, 8.4 — D1231's reading: "New" is the admin
   side of "since your last visit"; the build spec §3).

     `settings/apprseen:<pid>` = { at: <ms> }

   One row an admin, his own (the access requests' `reqseen:` pattern — state/accounts.ts), so two admins never write the
   same record. WRITTEN WHEN HE OPENS the tab (not when he leaves it): a reload, or an iPhone dropping the page while he is
   on it, must not lose the moment (the fresh read of the spec, finding 8.4). A request placed after the PREVIOUS moment
   is "new" for the visit that is opening — the page keeps that previous moment for as long as he stays.
   ONE command, `lw.apprseen`, which may write only the signed-in person's own row (state/perms.ts, docs/data-model.md
   §11 — together, D200), and is never an Undo step (undo/timeline.ts NOT_STEPS): taking it back would bring dots back,
   not the squadron's record. */
import { store } from '../engine/hooks'
import { commitSettingsIntent } from './people-settings-commit'

export const APPRSEEN_PFX = 'apprseen:'
/* its one command, declared to the command layer with the other own-row "seen" records (state/people-settings-commit.ts) —
   a type the layer was never told of is refused whatever perms.ts says, and the moment was never saved (27 Oct 26) */
export const APPRSEEN_TYPES = ['lw.apprseen'] as const

/** when this admin last opened Approvals (ms), or 0 — never */
export function apprSeenAt(pid: string | null | undefined): number {
  if (!pid) return 0
  const v: any = store.get(APPRSEEN_PFX + pid, null)
  return v && Number.isFinite(v.at) && v.at > 0 ? +v.at : 0
}

/** he opens Approvals now: the moment is written, and the PREVIOUS one returned — what "new" counts from this visit */
export function openApprovals(pid: string | null | undefined, now: number = Date.now()): number {
  const prev = apprSeenAt(pid)
  if (!pid) return prev
  commitSettingsIntent('lw.apprseen', { owner: pid }, () => { store.set(APPRSEEN_PFX + pid, { at: now }) })
  return prev
}
