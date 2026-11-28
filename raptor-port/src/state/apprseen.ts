/* WHEN EACH ADMIN LAST OPENED THE LEAVE WAR'S APPROVALS (the overhaul's M4, 8.4 — D1231's reading: "New" is the admin
   side of "since your last visit"; the build spec §3).

     `settings/<unit>@apprseen:<pid>` = { at: <ms> }

   One row an admin, his own (the access requests' `reqseen:` pattern — state/accounts.ts), so two admins never write the
   same record. WRITTEN WHEN HE OPENS the tab (not when he leaves it): a reload, or an iPhone dropping the page while he is
   on it, must not lose the moment (the fresh read of the spec, finding 8.4). A request placed after the PREVIOUS moment
   is "new" for the visit that is opening — the page keeps that previous moment for as long as he stays.
   ONE PER SQUADRON (batch 1's second half §3 item 7 — R2, §15 D14): a row of the war's own squadron, named with it
   (storage/unitid.ts qualify; storage/keyowner.ts UNIT_SETTING_PREFIXES), so opening 142's Approvals leaves 149's
   requests "New". The squadron is always named by the caller — the war the page shows (leavewar/ui/ApprovalsPage.tsx,
   leavewar/state/store.ts worldUnit), never the schedule picked: a View holder of 149 with 149 picked opens his own war.
   ONE command, `lw.apprseen`, which may write only the signed-in person's own row (state/perms.ts — 7e reads the name with
   the squadron split off; docs/data-model.md §11 — together, D200), and is never an Undo step (undo/timeline.ts
   NOT_STEPS): taking it back would bring dots back, not the squadron's record. */
import { store } from '../engine/hooks'
import { qualify } from '../storage/unitid'
import { commitSettingsIntent } from './people-settings-commit'

export const APPRSEEN_PFX = 'apprseen:'
/* its one command, declared to the command layer with the other own-row "seen" records (state/people-settings-commit.ts) —
   a type the layer was never told of is refused whatever perms.ts says, and the moment was never saved (27 Oct 26) */
export const APPRSEEN_TYPES = ['lw.apprseen'] as const

const keyOf = (pid: string, unit: string): string => qualify(unit, APPRSEEN_PFX + pid)

/** when this admin last opened that squadron's Approvals (ms), or 0 — never */
export function apprSeenAt(pid: string | null | undefined, unit: string): number {
  if (!pid || !unit) return 0
  const v: any = store.get(keyOf(pid, unit), null)
  return v && Number.isFinite(v.at) && v.at > 0 ? +v.at : 0
}

/** he opens that squadron's Approvals now: the moment is written, and the PREVIOUS one returned — what "new" counts from
 *  this visit */
export function openApprovals(pid: string | null | undefined, unit: string, now: number = Date.now()): number {
  const prev = apprSeenAt(pid, unit)
  if (!pid || !unit) return prev
  commitSettingsIntent('lw.apprseen', { owner: pid }, () => { store.set(keyOf(pid, unit), { at: now }) })
  return prev
}
