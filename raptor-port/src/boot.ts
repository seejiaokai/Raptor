// src/boot.ts
/* THE BOOT, as one function ([DB-READINESS] group A, phase 5). Moved whole out of main.tsx, in the same order, so the
   tests drive the app's REAL boot instead of each re-typing its order (five of them did, and drifted) — main.tsx keeps
   what only a page has: the choice of backend and policy, the toast, the save indicator, the unload guard, the probe
   bridge and the render.

   THE BOOT (storage seam, 8 Sep 26 — docs/superpowers/specs/2026-09-08-
   storage-seam-design.md). The ONE place the app waits: fetch everything
   from the backend into the whiteboard, plug the three doors in, hydrate
   the live scheduler state, then run the boot sequence exactly as before
   the seam. Nothing below bootStorage ever waits on storage. */
import { initStore, histInit, weekStashSnap, weekDirty } from './state/store'
import { resyncSchedBaseline } from './state/sched-commit'
import { storeBackend, HOOKS } from './engine/hooks'
import { initStore as lwInitStore, lwHistInit } from './leavewar/state/store'
import { installDemoWorld } from './leavewar/state/demoworld'
import { wireLeaveWarSync } from './leavewar/sync'
import { validate } from './engine/validate'
import { bootStorage } from './storage/boot'
import { BrowserBackend } from './storage/browser'
import { idbDocStore } from './storage/docstore'
import { docBoot } from './state/docs'
import { settingsAdapter, leavewarAdapter, trackerTarget } from './storage/adapters'
import { useStorageImpl } from './tracker/storage.js'
import { hydrate, wirePersist, wireRows, leaveWarStarted } from './state/persist'
import { openBootGroup, storeInitialized } from './storage/schema'
import { resetSeedWorld } from './state/seeds'
import { PEOPLE, indexCallsigns } from './engine/people'
import { newId } from './engine/newid'
import { newPersonProblem, personRecord } from './state/roster-add'
import { firstAdminRow, storedAccountNamed, normName, MAX_SIGNIN } from './state/accounts'
import { installGlobalUndo } from './state/undo-wire'
import type { Backend } from './storage/backend'
import type { Whiteboard } from './storage/whiteboard'
import type { Postman } from './storage/postman'
import { DEMO_POLICY, type BootPolicy } from './bootpolicy'

export async function bootApp(backend: Backend, policy: BootPolicy = DEMO_POLICY): Promise<{ wb: Whiteboard; postman: Postman }> {
  const { wb, postman } = await bootStorage(backend)

  /* supporting documents get their OWN durable drawer (storage/docstore) —
     photos/PDFs are too big for the text seam — but only on the real browser
     backend; dev/tests/?fresh stay memory-only in lockstep with the seam.
     Awaited BEFORE initStore so the cache is warm when the hydrated-boot path
     SKIPS the demo re-seed (state/store.ts) and the viewer first renders. */
  await docBoot(
    backend instanceof BrowserBackend ? idbDocStore() : null,
    /* a dropped document write is rare (storage full/locked) but must not be
       silent — the file works this session but won't survive a reload */
    () => HOOKS.toast("Couldn't save that document — your browser storage may be full, so it may not be here after a reload.", 'warn'),
  )
  /* [DB-READINESS] group A, phase 5.2 — every boot starts from the seed its policy gives it (the demo's, frozen, or none),
     reset in place BEFORE anything reads storage, so no boot inherits another's (state/seeds.ts) */
  resetSeedWorld(policy.seedDemo)

  /* [DB-READINESS] group A, phase 0 (plan §2.8) — on a store that has not started yet, everything
     the boot writes below (the scheduler's seed, the Leave War's world) and the stamp's
     `initialized` reach storage as ONE group, sealed at the end of the boot (storage/schema.ts).
     A started store opens nothing. Opened AFTER the documents drawer's wait, so from here to the
     seal the boot is synchronous and nothing else can write inside the group. */
  const bootGroup = openBootGroup(wb)
  try {
    bootBody(wb, policy)
    bootGroup.seal()
  } catch (e) {
    /* nothing of a boot that failed reaches storage — its group is dropped whole */
    bootGroup.abort()
    throw e
  }
  return { wb, postman }
}

/* everything the boot does between opening its group and sealing it — synchronous, in the order it always ran */
function bootBody(wb: Whiteboard, policy: BootPolicy): void {
  /* the three doors (storage/adapters.ts): settings, Leave War, Tracker */
  storeBackend.impl = settingsAdapter(wb)
  useStorageImpl(trackerTarget(wb))

  /* inputs / roster / plan layer / stashed weeks: whiteboard → singletons,
     BEFORE initStore so its seeds know to stand down (state/persist.ts) */
  hydrate(wb)
  /* a shared store's first boot makes its first admin, before anything reads the roster or the accounts (phase 5.4) */
  bootstrapFirstAdmin(wb, policy)
  /* the stream consumer, before any command runs — the boot's own commands (the Leave War's boot sync below) save their
     rows like any other ([DB-READINESS] group A, phase 2 — state/persist.ts) */
  wireRows(wb)
  initStore({ seedDemo: policy.seedDemo })

  /* Leave War boots on the whiteboard too. installDemoWorld's flag is now
     REAL: a world that came back from storage keeps its wars, its OIL story
     and its inputs; only a first-ever boot gets the demo overlay. */
  const hadStoredWars = leaveWarStarted(wb)
  /* the war reads its rows on a started store, and stores the seed as rows on one that has not ([DB-READINESS] group A,
     phase 3 — leavewar/state/store.ts initStore) */
  lwInitStore(leavewarAdapter(wb), { started: hadStoredWars, seedDemo: policy.seedDemo })
  installDemoWorld(hadStoredWars, policy.seedDemo)
  /* [ARCH-STACK] step 4 — the demo world files its approved leave as INPUTS
     (raw, before any command). The scheduler's warnings were computed by
     initStore before those rows existed, so re-derive them now — else a day
     under a demo leave shows a stale issue count until the first edit (found by
     the perf gate's "a day-1 edit rewrites only day 1" check). The old boot got
     this for free from runOutbound's inputs write. */
  validate()

  /* [ARCH-STACK] follow-up #1 (R2-08): installDemoWorld pushed INPUTS raw (no
     command), so the scheduler baseline is now stale. Re-sync BEFORE the leave-war
     boot sync runs its writeInputsBatch command, or that command's envelope would
     absorb the demo rows as its own puts on a first-ever boot. */
  resyncSchedBaseline()

  /* same order as before the seam: the boot sync's writes are the world the
     session STARTS in, and both history baselines are taken after it */
  wireLeaveWarSync()
  /* AND AGAIN, BECAUSE THE WIRE IS WHAT TELLS THE ENGINE WHICH DAYS CAN EARN
     (owner, 22 Sep 26 — "could it be a real problem", of the speed check). It
     was, and it was not a speed problem. `wireLeaveWarSync` → `installAbsenceDoor`
     installs `oilEarningDay`, `oilDayISO`, `oilSentinel` and `oilNoPeriod`;
     until it runs they are the inert defaults, so `oilWouldEarn` answers FALSE
     for every weekend and the two advisories that depend on it —
     OIL_UNPUBLISHED ("this day is not published yet, so nobody earns their OIL
     for it", the warning the owner asked for on 20 Sep 26) and OIL_NO_PERIOD —
     are absent from the first paint. They appeared the moment anything else was
     edited, because that revalidate found the hooks: two untouched weekend days
     growing a warning box out of a weekday edit, which is exactly what the speed
     gate's "a day-1 edit rewrites only day 1" check was reporting.
     It reaches the squadron as the failure that warning exists to prevent — a
     weekend earning nobody anything and saying nothing about it.
     This is the SAME fault as the validate above, one layer out: that one was
     added when the demo world's inputs landed after the warnings were computed.
     Warnings are derived state, so re-deriving is cheap and idempotent, and both
     history baselines are still taken after it. */
  validate()
  histInit()
  lwHistInit()

  /* [GLOBAL-UNDO] §13 phase 2 — turn on the ONE global undo timeline (state/
     undo-wire.ts). AFTER both legacy baselines are taken (so the timeline's own
     seed/expectation state lines up with the world the session starts in) and
     BEFORE the probe bridge (whose w.undo/redo now point at globalUndo/Redo). This
     is the line that makes undo/redo, the Unpublish button and off-week undo live;
     with it absent the engine records but drives nothing. */
  installGlobalUndo()

  /* every history step, undo/redo and week swap now re-persists */
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
}

/* THE FIRST ADMIN OF A SHARED STORE ([DB-READINESS] group A, phase 5.4 — plan §8 P0-BOOTSTRAP; Astra R3-03 fixes 5–7).
   Only on a store whose stamp says it has NOT started, under the blank policy: a truly empty shared store has no
   Person and no User, and only an admin can add people, so nobody could ever sign in. From the build's configuration
   (src/bootpolicy.ts) it makes his person — or finds the one IT already made — and his admin account, written into the
   boot's one group, so the person, the account and the "started" stamp land together or not at all. Called after
   hydrate, before the scheduler's boot: the person's row is then written with the boot's seed rows (state/persist.ts
   writeSeedRows — on a blank store the only one), the account row here, and the accounts load him.
   - IDEMPOTENT: an account already stored under his sign-in name (a wipe keeps settings and people) → nothing is made;
   - FAILS CLOSED: no configuration, one that does not read, a person the app could not make, or a pre-made person
     not in the store → BootConfigError before anything is written (the boot drops its group; main.tsx says so). */
function bootstrapFirstAdmin(wb: Whiteboard, policy: BootPolicy): void {
  if (policy.seedDemo || storeInitialized(wb) !== false) return
  const b = policy.bootstrap
  if (!b) throw new BootConfigError('no first admin is configured (VITE_BOOTSTRAP_ADMIN) for this new shared store.')
  if (b === 'invalid') throw new BootConfigError('the first admin setting (VITE_BOOTSTRAP_ADMIN) could not be read — it must give a sign-in name ("principal") and either a person ("person") or a person already in the store ("personId").')
  const name = normName(b.principal)
  if (!name || name.length > MAX_SIGNIN) throw new BootConfigError(`the first admin's sign-in name must be 1 to ${MAX_SIGNIN} characters.`)
  if (storedAccountNamed(name)) return
  let pid: string
  if ('personId' in b) {
    const p = (PEOPLE as any)[b.personId]
    if (!p || p.special || p.deleted) throw new BootConfigError(`the first admin's person (${b.personId}) is not in the store.`)
    pid = b.personId
  } else {
    const bad = newPersonProblem(b.person)
    if (bad) throw new BootConfigError(`the first admin's person cannot be made: ${bad}.`)
    pid = newId('p')
    ;(PEOPLE as any)[pid] = personRecord(b.person)
    indexCallsigns()
  }
  const [key, row] = firstAdminRow(name, pid)
  wb.set('settings', key, JSON.stringify(row))
}

/* A shared store's first boot cannot start: its first admin is not configured, or not as one of the two forms, or not
   as a person the app can make (src/bootpolicy.ts). Thrown BEFORE anything is written; main.tsx says so and stops. */
export class BootConfigError extends Error {
  constructor(message: string) { super(message); this.name = 'BootConfigError' }
}
