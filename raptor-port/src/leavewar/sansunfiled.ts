/* HIS SANS DAYS WITH NOTHING FILED — THE LINE HIS OWN BELL WORKS OUT (owner D2338, 22 Nov 26 — "Should we tell the user
   too": yes; "on that date his bell tells him the planned days with nothing filed, a tap opening the SANS calendar"; built
   without a drawing first on his D2339).

   A man posted out as SANS from a date ahead can be named on our programme for days past that date before it comes (D2329),
   and nobody can file his SANS availability until it does: who may be filed for SANS goes by who is SANS today (D2327). So
   on the posting's date — once the posting has run and he is SANS — his bell lists the days he is planned with us and has
   filed nothing for, a tap opening the SANS calendar on the first of them (ui/topstate.ts openNotice).

   THE AGENT'S READINGS, TOLD TO HIM (D2338's row): the man himself only, never an admin's bell; not before the posting's
   date; one line naming the days. And the build's (his to change): the days are those from the posting's date on, today
   on — a day gone by is no longer one to file — of the weeks the app holds (the week loaded and the saved weeks of his own
   squadron); "planned with us" is ALL AVAIL's own SANS read, named anywhere on that day's programme (engine/avail.ts
   dayEngaged); the line is worked out from the schedule as it stands, never stored — the "off the manpower" line's way
   (leavewar/sync.ts postedLines, D1690, D1696) — so it shrinks as he files and goes once every day is filed, and goes with
   the posting if it is taken back or his SANS is taken off. Its id is steady (the man and the posting's date), so once read
   it stays read while its days change.

   A NEW FILE, NOT sync.ts (the night of 22–23 Nov 26: another chat's work was changing sync.ts heavily) — the war's half
   is read only here, through its own store; the one line in sync.ts is the bell's list gaining this one. */
import { PEOPLE, sansOnP } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { UNIT } from '../engine/unitview'
import { stashKeys, stashDays } from '../engine/weekstash'
import { dayIso } from '../engine/verid'
import { dayEngaged } from '../engine/avail'
import { sansAvailOn } from '../engine/inputs'
import { homeUnitOf } from '../engine/roster'
import { getVersion as raptorVersion } from '../state/store'
import { effectiveToday } from '../state/person-delete'
import type { Notice } from '../state/notices'
import { getState } from './state/store'
import { addDays, outcomeOf } from './engine'

/* the first day of HIS SANS posting that has RUN, or null (sync.ts savedSansRun's test — a posting taken back, gone or of
   another outcome is no longer his SANS posting) */
function sansRunFrom(pid: string): string | null {
  let w: any
  try { w = getState().postOuts[pid] } catch { return null }
  return w && !w.gone && outcomeOf(w) === 'sans' && w.to !== null && w.poDone === addDays(w.to, 1) ? addDays(w.to, 1) : null
}

/* The days, first first. Worked out once a change of the app (the store's version, the war's state, the date), never once
   a reading: the bell asks for it on every draw, and only the one man it concerns gets past the first questions. */
let CACHE_VER = -1, CACHE_LW: unknown = null, CACHE_DAY = ''
const CACHE = new Map<string, string[]>()
export function sansUnfiledDays(pid: string): string[] {
  const today = effectiveToday()
  let lw: unknown = null
  try { lw = getState() } catch { lw = null }
  const ver = raptorVersion()
  if (ver !== CACHE_VER || lw !== CACHE_LW || today !== CACHE_DAY) { CACHE.clear(); CACHE_VER = ver; CACHE_LW = lw; CACHE_DAY = today }
  const hit = CACHE.get(pid)
  if (hit) return hit
  const out = unfiledNow(pid, today)
  CACHE.set(pid, out)
  return out
}
function unfiledNow(pid: string, today: string): string[] {
  const p: any = (PEOPLE as any)[pid]
  /* he can be filed for only while SANS today (D2327), and the line is for a man his SANS posting made SANS */
  if (!p || p.special || p.deleted || p.archived || !p.san) return []
  const from = sansRunFrom(pid)
  if (!from || from > today) return []
  /* the days of his OWN squadron's schedule — the inputs read are the schedule in view's (engine/inputs.ts inputsOn), so a
     squadron in view other than his own answers nothing rather than something wrong */
  if (homeUnitOf(pid, today) !== UNIT) return []
  const start = from > today ? from : today
  const days: string[] = []
  const look = (wk: string, list: any[] | null | undefined) => {
    (list || []).forEach((d: any, di: number) => {
      if (!d) return
      const iso = dayIso(wk, di)
      if (iso < start || !sansOnP(p, iso)) return
      if (!dayEngaged(d).has(pid) || sansAvailOn(pid, d.dt)) return
      days.push(iso)
    })
  }
  look(String(CURWEEK), DAYS as any[])
  for (const k of stashKeys()) {
    if (k === String(CURWEEK)) continue
    /* (a saved week that cannot be read holds nothing to name — stashDays answers null) */
    look(k, stashDays(k)?.days)
  }
  return [...new Set(days)].sort()
}

/** HIS BELL'S LINE (state/notices.ts setDerivedNotices, through leavewar/sync.ts): one, or none */
export function sansUnfiledLines(pid: string): Notice[] {
  const days = sansUnfiledDays(pid)
  if (!days.length) return []
  const from = sansRunFrom(pid)!
  /* dated the posting's own midnight, as the posting's line is (sync.ts postedLinesOf) */
  const at = new Date(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10)).getTime()
  return [{ id: `sansdue:${pid}:${from}`, to: pid, by: null, at, iid: '', name: 'Your SANS availability', day: days[0]!, what: [{ k: 'sansdue', days }] }]
}
