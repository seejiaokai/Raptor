/* ASTRA'S NARROW RE-READ OF CHAT 147'S TWO FIX ROUNDS (23 Nov 26 — D:/raptor-work/c147-astra-read2.md; the coordinator named the file
   astra-c147-reread.test.ts): R1, a real take-back carrying made-up struck days; R2, a no-row man archived then deleted. Copied
   as Astra wrote them. */
import {
  afterAll, afterEach, beforeAll, beforeEach, expect, it, vi,
} from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { validate } from '../engine/validate'
import { initStore, notify, resetSession } from '../state/store'
import { accountsLoad, sessionFor, signIn } from '../state/accounts'
import { afterSchedMutate } from '../state/view'
import { updatePersonField } from '../state/quals-write'
import { deletePerson } from '../state/person-delete'
import { NOTICES, noticesFor, noticeSansBack } from '../state/notices'
import { markAllNoticesRead } from '../state/noticeseen'
import { me } from '../state/perms'
import { commit } from '../command'
import {
  schedStore, resyncBeforeEnlist, schedApplyEnd,
} from '../state/sched-commit'
import {
  peopleStore, settingsStore, finishPeopleWrite,
} from '../state/people-settings-commit'
import {
  getState, initStore as initWar, setPeople, setShowSans,
  setPostOut, lwStore,
} from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import {
  archivePerson, availableFor, postOut, runPoOutcomes, wireLeaveWarSync,
} from './sync'

let people0 = '', days0 = '', inputs0 = ''
const mem: Record<string, string> = {}
const on = (day: number) =>
  vi.setSystemTime(new Date(2026, 6, day, 9))
const login = (name: string, pass = 'x') => {
  resetSession(sessionFor(signIn(name, pass)))
  notify()
}
const plan = (di: number) => {
  const d: any = DAYS[di]
  /* (planned = in a flying seat or a sim, his D2564 of 24 Nov 26: this put him on a ground briefing, which the first build
     counted and his rule does not — an OFT's rear seat now; sans-planned-r5.test.ts) */
  d.waves = []; d.dutywaves = []
  d.notes = []; d.allhands = []; d.ground = []
  d.sims = { oft: [{ label: 'SIM', str: '1600', end: '1700', p: '', w: 'rocky' }] }
  afterSchedMutate()
}

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  people0 = JSON.stringify(PEOPLE)
  days0 = JSON.stringify(DAYS)
  inputs0 = JSON.stringify(INPUTS)
})
beforeEach(() => {
  on(15)
  for (const k of Object.keys(mem)) delete mem[k]
  storeBackend.impl = {
    getItem: k => mem[k] ?? null,
    setItem: (k, v) => { mem[k] = v },
  }
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, JSON.parse(people0))
  indexCallsigns()
  DAYS.length = 0; DAYS.push(...JSON.parse(days0))
  INPUTS.length = 0; INPUTS.push(...JSON.parse(inputs0))
  NOTICES.length = 0
  Object.assign(SCHED, {
    pending: {}, changes: {}, added: {}, als: [], al: 0,
    dayOK: {}, sign: {}, orig: {}, cur: {}, signBind: {},
    drafts: {}, curDraft: {}, retired: {}, correcting: {},
  })
  stashClear()
  initWar(memoryBackend())
  initStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  login('ad', 'a')
})
afterEach(() => {
  resetSession(null)
  vi.restoreAllMocks()
})
afterAll(() => {
  vi.useRealTimers()
  storeBackend.impl = null
})

it('R1: a real take-back cannot substitute invented reminder days', () => {
  plan(5)
  expect(postOut('rocky', '2026-07-17', 'sans')).toBe(true)
  notify()
  on(17)
  runPoOutcomes()
  notify()
  const live = noticesFor('rocky').find(n => n.what[0]?.k === 'sansdue')
  expect(live).toBeTruthy()
  expect((live!.what[0] as any).days).toEqual(['2026-07-18'])
  login('hex')
  expect(markAllNoticesRead()).toBe(true)
  login('ad', 'a')

  const result: any = commit({
    type: 'lw.postout', scope: { module: 'people' }, meta: null,
    apply: txn => {
      resyncBeforeEnlist()
      txn.enlist(schedStore)
      txn.enlist(peopleStore)
      txn.enlist(settingsStore)
      txn.enlist(lwStore)
      expect(setPostOut('rocky', null)).toBe(true)
      expect(noticeSansBack(
        'rocky', me(), ['2099-01-05'], '2026-07-17',
      )).toBe(true)
      validate()
      finishPeopleWrite()
      schedApplyEnd()
    },
  })

  expect(result?.ok === false, 'the forged take-back must be refused')
    .toBe(true)
  expect(NOTICES.filter(n => n.what[0]?.k === 'sansback')).toEqual([])
})

it('R2: deleting an archived no-row man preserves his absence gap', () => {
  on(13)
  plan(1)
  plan(5)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(setShowSans(false)).toBe(true)
  notify()
  const crowd = (di: number, iso: string) =>
    availableFor(iso, [600, 660], DAYS[di] as any)

  expect(getState().people.some(p => p.id === 'rocky')).toBe(false)
  expect(crowd(1, '2026-07-14')).toContain('rocky')
  on(17)
  expect(archivePerson('rocky').bad).toBeNull()
  notify()
  expect(crowd(5, '2026-07-18')).not.toContain('rocky')

  on(20)
  expect(deletePerson('rocky')).toBeNull()
  notify()
  expect(crowd(1, '2026-07-14')).toContain('rocky')
  expect(crowd(5, '2026-07-18')).not.toContain('rocky')
})

/* ---- the builder's further cases for R2 (the coordinator's brief: before the archive, inside the gap, after the delete,
   and with "+ SANS" on) — Hex ticked SANS by hand Mon 13 Jul and named every day he is asked of; archived Wed 15, deleted
   Fri 17, never restored. The week is Mon 13 (index 0) to Sun 19 (index 6). */
const crowdOn = (di: number, iso: string) => availableFor(iso, [600, 660], DAYS[di] as any)
const archiveThenDelete = (showSans: boolean) => {
  on(13)
  for (const di of [1, 3, 5]) plan(di)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(setShowSans(showSans)).toBe(true)
  notify()
  expect(getState().people.some(p => p.id === 'rocky' && !p.gone)).toBe(showSans)
  on(15)
  expect(archivePerson('rocky').bad).toBeNull()
  notify()
  on(17)
  expect(deletePerson('rocky')).toBeNull()
  notify()
}

it('R2b: "+ SANS" off — before his archive he is in; inside the gap and after the delete he is out', () => {
  archiveThenDelete(false)
  expect(crowdOn(1, '2026-07-14'), 'Tue 14, before his archive').toContain('rocky')
  expect(crowdOn(3, '2026-07-16'), 'Thu 16, archived, not yet deleted').not.toContain('rocky')
  expect(crowdOn(5, '2026-07-18'), 'Sat 18, after the delete').not.toContain('rocky')
})

it('R2c: "+ SANS" on — the same days, the switch changing nothing', () => {
  archiveThenDelete(true)
  expect(crowdOn(1, '2026-07-14'), 'Tue 14, before his archive').toContain('rocky')
  expect(crowdOn(3, '2026-07-16'), 'Thu 16, archived, not yet deleted').not.toContain('rocky')
  expect(crowdOn(5, '2026-07-18'), 'Sat 18, after the delete').not.toContain('rocky')
})

it('R2d: a no-row man deleted without an archive first is read by the delete alone, as before', () => {
  on(13)
  for (const di of [1, 3, 5]) plan(di)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(setShowSans(false)).toBe(true)
  notify()
  on(17)
  expect(deletePerson('rocky')).toBeNull()
  notify()
  expect((PEOPLE as any).rocky.archivedOn, 'no archive date before the delete').toBeUndefined()
  expect(crowdOn(1, '2026-07-14')).toContain('rocky')
  expect(crowdOn(3, '2026-07-16'), 'Thu 16, before the delete: as he was').toContain('rocky')
  expect(crowdOn(5, '2026-07-18')).not.toContain('rocky')
})

it('R2e: archived Tue 14, deleted Sat 18 — the delete keeps the archive date it found him under', () => {
  on(13)
  for (const di of [1, 3, 5]) plan(di)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(setShowSans(false)).toBe(true)
  notify()
  on(14)
  expect(archivePerson('rocky').bad).toBeNull()
  notify()
  expect((PEOPLE as any).rocky.archivedOn).toBe('2026-07-14')
  on(18)
  expect(deletePerson('rocky')).toBeNull()
  notify()
  /* the delete keeps the archive date it found him under: the gap from Tue 14 on stays a gap */
  expect((PEOPLE as any).rocky.archivedOn).toBe('2026-07-14')
  expect(crowdOn(3, '2026-07-16')).not.toContain('rocky')
  expect(crowdOn(5, '2026-07-18')).not.toContain('rocky')
})
