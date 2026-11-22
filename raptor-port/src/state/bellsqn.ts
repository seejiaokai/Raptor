/* THE BELL'S "SHOW 142 149" SWITCH — WHICH SQUADRONS' LINES A PERSON'S BELL SHOWS (batch 1's second half, the plan
   docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md §7 item 3, §15 D6, §16 D5′ / D6′; his D2198, D2202).

     `settings/bellsqn:<pid>` = { <unit id>: true | false, … }

   ONLY HIS OWN CHOICES, SQUADRON BY SQUADRON (R-O12): a squadron he never switched takes the default, so a Plan given
   later starts on. The default (bellDefault): his home on; a squadron he holds Plan of on (D2202: "on by default"); a
   master admin's squadrons other than his home off (D2198) — but those he held Plan of when he was made one, kept on his
   account (`kept`, §16 D1′a), on; any other squadron a line reaches him from, on.
   READ IN ONE PLACE — state/notices.ts noticeLive, the one body behind the bell's list, its unread count, the lit bell and
   the seen mark (§15 D6): a line of a squadron switched off neither lights the bell nor is marked read by "Mark all read";
   switched on, it shows as he left it. Asked only of a line not about him (notices.ts noticeAboutHim — his own leave, his
   own posting, an input he is named in stay whatever the switch says, §16 D5′). Lines switched off are kept, never
   deleted.
   WRITTEN BY HIM ALONE — ONE command, `bell.squadrons`, which may write only the signed-in person's own row, for any role
   (state/perms.ts bellSqnRowViolation; docs/data-model.md §11 — together, D200), and is never an Undo step
   (undo/timeline.ts NOT_STEPS). The buttons that write it are drawn on his bell (ui/topbits.tsx BellList, the "Show"
   row — the approved pictures p3a, p3c, f5a; built night job 4, 23 Nov 26), one per squadron of bellSquadrons below. */
import { store } from '../engine/hooks'
import { commitSettingsIntent } from './people-settings-commit'
import { me } from './perms'
import { homeOn, todayIso, units, unitRowsBefore } from './units'
import { accountOfPid, adminLineAudience } from './accounts'

export const BELLSQN_PFX = 'bellsqn:'
export const BELLSQN_TYPES = ['bell.squadrons'] as const

/** his own choices as saved — squadron id → on / off; a row that does not read as one is none */
export function bellChoices(pid: string | null | undefined): Readonly<Record<string, boolean>> {
  if (!pid) return {}
  const v: any = store.get(BELLSQN_PFX + pid, null)
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  const out: Record<string, boolean> = {}
  for (const [k, x] of Object.entries(v)) if (k && typeof x === 'boolean') out[k] = x
  return out
}
/** the switch where he never set it (above) */
export function bellDefault(pid: string, unit: string, iso: string = todayIso()): boolean {
  const home = homeOn(pid, iso)
  if (!home || unit === home) return true
  const a: any = accountOfPid(pid)
  if (a && a.master === true) return !!(a.kept && typeof a.kept === 'object' && Object.prototype.hasOwnProperty.call(a.kept, unit))
  return true
}
/** does his bell show that squadron's lines? — his own choice, else the default */
export function bellShows(pid: string, unit: string, iso: string = todayIso()): boolean {
  const c = bellChoices(pid)
  return Object.prototype.hasOwnProperty.call(c, unit) ? c[unit]! : bellDefault(pid, unit, iso)
}
/** THE SQUADRONS HIS BELL MAY SHOW — one "Show" button each (ui/topbits.tsx BellList; D2198, D2202, D2321): his home, and
 *  every squadron whose admin lines reach him, read from the ONE audience those lines are written to
 *  (accounts.ts adminLineAudience — a master admin every squadron, an admin holding Plan his Plan squadrons; a View
 *  holder never, D2191: "never its bell"). By number, as the Schedules menu lists them (perms.ts readableUnits).
 *  Fewer than two: no row. */
export function bellSquadrons(pid: string, iso: string = todayIso()): { id: string; num: string }[] {
  const home = homeOn(pid, iso)
  const out: { id: string; num: string }[] = []
  for (const u of units()) {
    const told = new Set(adminLineAudience(u.id, iso))
    if (u.id === home || told.has(pid)) out.push({ id: u.id, num: String(u.num) })
  }
  return out.sort((a, b) => a.num.localeCompare(b.num, undefined, { numeric: true }))
}
/** a press of one of his bell's squadron buttons: that squadron on or off, saved as his own choice. True when it saved. */
export function setBellSquadron(unit: string, on: boolean): boolean {
  const pid = me()
  if (!pid || !unit) return false
  const p = String(pid)
  if (bellShows(p, unit) === on && Object.prototype.hasOwnProperty.call(bellChoices(p), unit)) return false
  /* ONLY SQUADRONS STILL IN THE STORE (the second half's final reads, R1): a choice for a squadron since undone away — "+ New
     squadron" taken back by an Undo, which a bell switch is not — is dropped, read from the stored rows as the gate reads
     them (perms.ts bellSqnRowViolation refuses an id not there); carried over, it made every later press refused */
  const live = new Set(unitRowsBefore([]).units.map(u => u.id))
  const next: Record<string, boolean> = {}
  for (const [k, v] of Object.entries(bellChoices(p))) if (live.has(k)) next[k] = v
  next[unit] = on
  const res: any = commitSettingsIntent('bell.squadrons', { owner: p }, () => { store.set(BELLSQN_PFX + p, next) })
  return !!res && res.ok !== false
}
