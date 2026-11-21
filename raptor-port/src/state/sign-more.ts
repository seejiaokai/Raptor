/* WHO ELSE THE SCHEDULER'S SIGN-OFF BOXES OFFER (the reshape plan §19b R8 — his D2245, 21 Nov 26: "As recommended").
   SKED CK, PLANNED BY and APPROVED BY — the three boxes that need the Scheduler tick — offer, AFTER that day's own people
   (engine/publish.ts signPeople, D2243 Q2), an admin holding Plan of the squadron while his Plan holds that day, and a
   master admin, each carrying the Scheduler tick. Plan gives full access as the squadron's own admins have, its
   schedule and publishing included (D2201, D2211), so a Plan holder who plans and publishes 149's day can sign it; a
   master admin acts as an admin of every squadron (D2191) — offered always (the agent's reading of D2245). CUR CK stays
   the day's own people. A View holder is never offered.

   The engine does not read accounts, so the answer is handed to it here, as this module loads (the way state/units.ts
   hands it the home handle): every person this module names, the engine keeps only those carrying the Scheduler tick,
   not a placeholder, not archived and not on the day's own list. Loaded by ui/html.ts, the boxes' builder. */
import { setSignMore } from '../engine/publish'
import { ACCOUNTS_LIST, adminsOf, isAdminAccount } from './accounts'
import { homeOn } from './units'

setSignMore((unit: string, iso: string): string[] => {
  const out = new Set<string>()
  /* adminsOf: the squadron's admins at home that day, and every non-master admin holding Plan of it that day (the
     reading rule, units-model.ts grantOn — his Plan ends at the start of his own move day, D2203, D2243 Q4) */
  for (const pid of adminsOf(unit, iso)) if (homeOn(pid, iso) !== unit) out.add(pid)
  /* a master admin who can sign in as one */
  for (const a of ACCOUNTS_LIST) if (a.master === true && isAdminAccount(a) && a.on && a.pid) out.add(String(a.pid))
  return [...out]
})
