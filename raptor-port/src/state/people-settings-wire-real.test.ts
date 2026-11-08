// @vitest-environment jsdom
/* [RD-LEFT-1108] — the people-and-settings save layer's wiring, proven through the app's REAL writers, REAL sign-ins and
   the REAL Undo (8 Nov 26). These close the three gaps Astra's scenarios named for the change that moved the layer's
   registration out to state/people-settings-wire.ts:

   1. Real values back on Undo / Redo. The first wiring tests proved only that memory was rebuilt (a fresh object, a
      bumped version) through a hand-made "undo" writing an empty list. Here a real admin changes a real value through
      each module's own writer, the top bar's Undo and Redo run as the app runs them, and both the stored row and the
      value a screen reads are checked after each.
   2. Real permission. The headless system actor skips the check that a command type was registered, so a refusal for a
      missing type only shows for a person signed in. Here a real member and a real admin run one command of every family
      the wire declares, and what each caller hands back to its screen is checked — some return the previous value or a
      plain false, so a refusal would never show as an error.
   3. A rollback is not a failed save. A command whose body changes real values (an account, a seen mark, a bell read
      mark, a flying-plan figure) and then throws must leave every value and every stored row as it was, queue nothing
      for the retry that a failed save (?savefail) uses, and leave the next ordinary change free to land.

   The changes window's and the bell's seen marks are never Undo steps (undo/timeline.ts NOT_STEPS), and their writers
   change memory only once their command is kept — so the layer's re-read of them matters when one of their writers runs
   INSIDE another command that then fails (the posting sheet's Undo post out calls the bell's forgetRead that way). Group 3
   is where those two loaders are proven; group 1 checks that an Undo of a real step leaves their marks as they are. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { ELOG, elogClear, logAction } from '../engine/editlog'
import { initStore, resetSession, notify } from './store'
import { _resetDisclosure } from './disclosure'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { resyncPeopleBaseline, commitSettingsIntent } from './people-settings-commit'
import {
  signIn, sessionFor, updateAccount, accountById, markBackSeen, ACCOUNT_PFX,
} from './accounts'
import * as accounts from './accounts'
import { isNewToMe, markSeen, SEEN_PFX } from './changes'
import { markNoticeRead, isUnread, unreadFor, hasRead, NOTICESEEN_PFX } from './noticeseen'
import { NOTICES, type Notice } from './notices'
import { openOwnWindow, lwSeenAt, LWSEEN_PFX } from './lwseen'
import { openApprovals, apprSeenAt, APPRSEEN_PFX } from './apprseen'
import { setFlyDays, getFlyPlan } from './flyplan'
import { Whiteboard } from '../storage/whiteboard'
import { settingsAdapter } from '../storage/adapters'
import { Postman } from '../storage/postman'
import { MemoryBackend } from '../storage/memory'
import { wireRows } from './persist'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
/* a sign-in as the sign-in card makes it (ad = Saber, admin, person stiff; us = Ranger, member, person bane) */
const signInAs = (name: string, pass: string) => { resetSession(sessionFor(signIn(name, pass) as any)); notify() }
/* a line written with no command running is kept at the end of the turn (changes.test.ts) */
const turnEnds = () => Promise.resolve()
/* a bell line for `to`, as the Inputs door makes one ("you were put in it") */
const bellLine = (id: string, to: string, at: number): Notice =>
  ({ id, to, by: 'stiff', at, iid: 'i-' + id, name: 'Training', day: '2026-07-15', what: [{ k: 'in' }] })
const ISO = '2026-07-20'
const role = (id: string) => accountById(id)?.role
const stored = (k: string) => store.get(k, null)

function bootWorld(): void {
  initStore()
  signInAs('ad', 'a')
  _resetDisclosure()
  _resetTimeline()
  installGlobalUndo()   // the REAL production wiring — the layer registered by state/store.ts wireStore
}

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  NOTICES.length = 0
  elogClear()
  bootWorld()
})
afterEach(() => { _resetTimeline(); resetSession(null); storeBackend.impl = null })

/* ---- 1. real values back on Undo / Redo --------------------------------------------------------------------------- */
describe('1 — a real change, the real Undo and Redo: the stored row and what the screen reads', () => {
  it('accounts: Ranger made an admin on Admin → Users, Undo makes him a member again, Redo an admin', () => {
    expect(role('acus')).toBe('main')
    expect(updateAccount('acus', { role: 'admin' })).toBe(null)
    expect(role('acus')).toBe('admin')
    expect((stored(ACCOUNT_PFX + 'acus') as any)?.role).toBe('admin')

    expect(globalUndo().ok).toBe(true)
    expect(role('acus'), 'Admin → Users reads him a member again').toBe('main')
    expect(accounts.ACCOUNTS_LIST.find(a => a.id === 'acus')?.role).toBe('main')
    /* the very first account write stored the seeded list; its Undo takes the rows away again — none says admin */
    expect((stored(ACCOUNT_PFX + 'acus') as any)?.role ?? 'main').toBe('main')

    expect(globalRedo().ok).toBe(true)
    expect(role('acus'), 'Redo makes him an admin again').toBe('admin')
    expect((stored(ACCOUNT_PFX + 'acus') as any)?.role).toBe('admin')
  })

  it('accounts: Hex suspended, Undo lets him sign in again, Redo suspends him again', () => {
    expect(updateAccount('achex', { on: false })).toBe(null)
    expect(accountById('achex')?.on).toBe(false)
    expect(signIn('hex', 'x')).toMatchObject({ kind: 'off' })
    expect(globalUndo().ok).toBe(true)
    expect(accountById('achex')?.on).toBe(true)
    expect(signIn('hex', 'x'), 'the sign-in screen lets him in').toMatchObject({ kind: 'ok' })
    expect(globalRedo().ok).toBe(true)
    expect(accountById('achex')?.on).toBe(false)
    expect((stored(ACCOUNT_PFX + 'achex') as any)?.on).toBe(false)
    expect(signIn('hex', 'x')).toMatchObject({ kind: 'off' })
  })

  it('the flying plan: 18 pilots required on one date, Undo takes the figure away, Redo puts it back', () => {
    expect(getFlyPlan().days[ISO]?.p).toBeUndefined()
    expect(setFlyDays([{ iso: ISO, p: 18 }]).ok).toBe(true)
    expect(getFlyPlan().days[ISO]?.p, 'the Leave War\'s Required row reads 18').toBe(18)
    expect((stored('flyday:' + ISO) as any)?.p).toBe(18)

    expect(globalUndo().ok).toBe(true)
    expect(stored('flyday:' + ISO)).toBe(null)
    expect(getFlyPlan().days[ISO]?.p, 'the Required row is empty again, not the cached 18').toBeUndefined()

    expect(globalRedo().ok).toBe(true)
    expect((stored('flyday:' + ISO) as any)?.p).toBe(18)
    expect(getFlyPlan().days[ISO]?.p, 'and 18 again after Redo').toBe(18)
  })

  it('the change history\'s and the bell\'s seen marks stay as he left them through an Undo and a Redo of another change', async () => {
    signInAs('us', 'us'); logAction(0, 'Ranger filed leave')
    await turnEnds()
    signInAs('ad', 'a')
    NOTICES.push(bellLine('n-keep', 'stiff', 100))
    expect(isNewToMe(ELOG.rows[0]!)).toBe(true)
    expect(unreadFor('stiff')).toBe(1)
    expect(markSeen([ELOG.rows[0]!])).toBe(true)
    expect(markNoticeRead('n-keep')).toBe(true)
    expect(updateAccount('acus', { role: 'admin' })).toBe(null)   // a real step after the marks
    const seenRow = JSON.stringify(stored(SEEN_PFX + 'stiff'))
    const bellRow = JSON.stringify(stored(NOTICESEEN_PFX + 'stiff'))
    for (const step of [globalUndo, globalRedo]) {
      expect(step().ok).toBe(true)
      expect(JSON.stringify(stored(SEEN_PFX + 'stiff'))).toBe(seenRow)
      expect(JSON.stringify(stored(NOTICESEEN_PFX + 'stiff'))).toBe(bellRow)
      expect(isNewToMe(ELOG.rows[0]!), 'the changes window keeps the line seen').toBe(false)
      expect(unreadFor('stiff'), 'the bell stays dark').toBe(0)
    }
  })
})

/* ---- 2. real permission ----------------------------------------------------------------------------------------- */
describe('2 — every family the wire declares runs for a real member and a real admin', () => {
  it('a member (Ranger): the changes window\'s seen, the bell\'s read, the Leave War\'s last visit and his welcome-back seen all land', async () => {
    signInAs('ad', 'a'); logAction(0, 'Saber moved a man')
    await turnEnds()
    NOTICES.push(bellLine('n-us', 'bane', 100))
    ;(PEOPLE as any).bane.back = { at: 1 }        // Restore's welcome note, as Admin → Users leaves it
    resyncPeopleBaseline()
    signInAs('us', 'us')

    /* the changes window — markSeen hands back true when it wrote */
    expect(isNewToMe(ELOG.rows[0]!)).toBe(true)
    expect(markSeen([ELOG.rows[0]!]), 'Mark all as seen is kept').toBe(true)
    expect(isNewToMe(ELOG.rows[0]!)).toBe(false)
    expect(stored(SEEN_PFX + 'bane')).not.toBe(null)

    /* the bell — markNoticeRead hands back true when it wrote */
    expect(isUnread(NOTICES[0]!)).toBe(true)
    expect(markNoticeRead('n-us'), 'the bell line is read').toBe(true)
    expect(isUnread(NOTICES[0]!)).toBe(false)
    expect(hasRead('bane', NOTICES[0]!)).toBe(true)

    /* the Leave War's person window — openOwnWindow hands back the PREVIOUS moment whatever happens, so only the stored
       row shows whether it was kept */
    expect(openOwnWindow('bane', 5000)).toBe(0)
    expect(lwSeenAt('bane'), 'his last visit is kept').toBe(5000)
    expect(stored(LWSEEN_PFX + 'bane')).toEqual({ at: 5000 })

    /* an account-family command a member may run — his own "welcome back" seen; null back means kept */
    expect(markBackSeen(), 'the welcome note is dismissed').toBe(null)
    expect((PEOPLE as any).bane.back).toBeUndefined()
  })

  it('a member (Ranger) may not mark the Leave War\'s Approvals seen — refused, and its caller still hands back the old moment', () => {
    signInAs('us', 'us')
    expect(openApprovals('bane', 7000)).toBe(0)
    expect(apprSeenAt('bane'), 'nothing stored for a member').toBe(0)
    expect(stored(APPRSEEN_PFX + 'bane')).toBe(null)
  })

  it('an admin (Saber): an account change, the Approvals seen and every seen mark land', async () => {
    signInAs('us', 'us'); logAction(0, 'Ranger filed leave')
    await turnEnds()
    signInAs('ad', 'a')
    NOTICES.push(bellLine('n-ad', 'stiff', 100))
    expect(updateAccount('acus', { role: 'admin' }), 'Admin → Users keeps the change').toBe(null)
    expect(role('acus')).toBe('admin')
    expect(openApprovals('stiff', 9000)).toBe(0)
    expect(apprSeenAt('stiff'), 'his Approvals visit is kept').toBe(9000)
    expect(markSeen([ELOG.rows[0]!])).toBe(true)
    expect(isNewToMe(ELOG.rows[0]!)).toBe(false)
    expect(markNoticeRead('n-ad')).toBe(true)
    expect(unreadFor('stiff')).toBe(0)
    expect(openOwnWindow('stiff', 9100)).toBe(0)
    expect(lwSeenAt('stiff')).toBe(9100)
  })
})

/* ---- 3. a rollback is not a failed save ------------------------------------------------------------------------- */
describe('3 — a command that changes real values and then throws leaves nothing behind, and the next change lands', () => {
  const be = () => new MemoryBackend()
  let wb: Whiteboard, pm: Postman, groups: number
  beforeEach(() => {
    /* the app's own storage path: the whiteboard every command writes in ONE group, the postman that sends each group
       and keeps a failed one for its retry (the ?savefail band reads its status) */
    Object.keys(mem).forEach(k => delete mem[k])
    wb = new Whiteboard()
    storeBackend.impl = settingsAdapter(wb)
    wireRows(wb)
    pm = new Postman(be())
    pm.attach(wb)
    groups = 0
    wb.subscribe(() => { groups++ })
    NOTICES.length = 0
    elogClear()
    bootWorld()
    groups = 0
  })
  afterEach(() => { pm.detach() })

  it('an account, the changes window\'s seen, the bell\'s read and a Required figure, all changed, then a throw: every one back', async () => {
    signInAs('us', 'us'); logAction(0, 'Ranger filed leave')
    await turnEnds()
    signInAs('ad', 'a')
    NOTICES.push(bellLine('n-rb', 'stiff', 100))
    const planBefore = getFlyPlan()
    expect(planBefore.days[ISO]).toBeUndefined()
    await pm.flush()                              // what the boot and the sign-ins wrote has gone out
    expect(pm.hasWork()).toBe(false)
    groups = 0

    let inside: Record<string, unknown> = {}
    let threw = false
    try {
      commitSettingsIntent('account.update', null, () => {
        expect(updateAccount('acus', { role: 'admin' })).toBe(null)
        expect(markSeen([ELOG.rows[0]!])).toBe(true)
        expect(markNoticeRead('n-rb')).toBe(true)
        expect(setFlyDays([{ iso: ISO, p: 18 }]).ok).toBe(true)
        /* each changed in memory before the throw — what a screen would read mid-command */
        inside = {
          role: role('acus'), seen: isNewToMe(ELOG.rows[0]!), unread: unreadFor('stiff'), p: getFlyPlan().days[ISO]?.p,
        }
        throw new Error('boom after the writes')
      })
    } catch { threw = true }
    expect(inside).toEqual({ role: 'admin', seen: false, unread: 0, p: 18 })
    expect(threw, 'the layer hands the refusal back, it does not throw').toBe(false)

    /* every value a screen reads is back */
    expect(role('acus'), 'Admin → Users: still a member').toBe('main')
    expect(isNewToMe(ELOG.rows[0]!), 'the changes window: the line still new').toBe(true)
    expect(unreadFor('stiff'), 'the bell: still lit').toBe(1)
    expect(getFlyPlan().days[ISO]?.p, 'the Required row: still empty').toBeUndefined()
    /* every stored row is back */
    for (const k of [ACCOUNT_PFX + 'acus', SEEN_PFX + 'stiff', NOTICESEEN_PFX + 'stiff', 'flyday:' + ISO]) {
      expect(stored(k), k).toBe(null)
    }
    /* nothing left for the save path: no group handed to the postman, nothing waiting or failed for its retry */
    expect(groups, 'no group was written').toBe(0)
    expect(pm.hasWork(), 'the postman holds nothing').toBe(false)
    expect(pm.status).toBe('saved')

    /* the next ordinary change, through the same writers, lands and goes out */
    expect(updateAccount('acus', { role: 'admin' })).toBe(null)
    expect(role('acus')).toBe('admin')
    expect(setFlyDays([{ iso: ISO, p: 18 }]).ok).toBe(true)
    expect(getFlyPlan().days[ISO]?.p).toBe(18)
    expect(markNoticeRead('n-rb')).toBe(true)
    expect(unreadFor('stiff')).toBe(0)
    expect(groups).toBeGreaterThan(0)
    await pm.flush()
    expect(pm.status).toBe('saved')
    expect(JSON.parse(String(wb.get('settings', ACCOUNT_PFX + 'acus'))).role).toBe('admin')
  })

  it('the seen moments the Leave War keeps (its person window, its Approvals) go back too, and land on the next open', async () => {
    await pm.flush()
    groups = 0
    try {
      commitSettingsIntent('account.update', null, () => {
        openOwnWindow('stiff', 4000)
        openApprovals('stiff', 4100)
        expect(lwSeenAt('stiff')).toBe(4000)
        throw new Error('boom')
      })
    } catch { /* refused */ }
    expect(lwSeenAt('stiff')).toBe(0)
    expect(apprSeenAt('stiff')).toBe(0)
    expect(groups).toBe(0)
    expect(pm.hasWork()).toBe(false)
    expect(openOwnWindow('stiff', 4200)).toBe(0)
    expect(lwSeenAt('stiff')).toBe(4200)
    expect(openApprovals('stiff', 4300)).toBe(0)
    expect(apprSeenAt('stiff')).toBe(4300)
  })
})
