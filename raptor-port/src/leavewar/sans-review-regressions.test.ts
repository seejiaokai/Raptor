import {
  afterAll, afterEach, beforeAll, beforeEach,
  describe, expect, it, vi,
} from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOn } from '../engine/people'
import { INPUTS, idsOf, sansAvailOn } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, dayInputsFrozen } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import {
  initStore, notify, resetSession, writeInputsBatch,
} from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { afterSchedMutate } from '../state/view'
import { NOTICES, noticesFor, noticeWords } from '../state/notices'
import { markAllNoticesRead } from '../state/noticeseen'
import { updatePersonField } from '../state/quals-write'
import {
  commitInput, commitNewInput, draftOf,
} from '../ui/inputedit'
import { maySansAdd } from '../ui/sansadd'
import { sansSectionHTML } from '../ui/html'
import { sbSansPanel } from '../ui/board-html'
import { initStore as warInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import {
  postOut, runPoOutcomes, wireLeaveWarSync,
} from './sync'

const FRI = '2026-07-17'
const SAT = '2026-07-18'
const LATER = '2026-07-24'
let people0 = '', days0 = '', inputs0 = ''
const mem: Record<string, string> = {}
const oldToast = HOOKS.toast

const login = (name: string, pass = 'x') => {
  resetSession(sessionFor(signIn(name, pass)))
  notify()
}
const date = (day: number) =>
  vi.setSystemTime(new Date(2026, 6, day, 9))

const posting = (id: string, day = FRI) => {
  expect(postOut(id, day, 'sans')).toBe(true)
  notify()
}
const draft = (person = 'rocky', start = SAT) => ({
  _new: true, person, type: 'SANS Availability', start,
  allday: true, s: 360, e: 1080, sans: { f: true },
})
const offer = () =>
  expect(commitNewInput(draft())).toBe(true)

const backs = () =>
  noticesFor('rocky').filter(n => n.what[0]?.k === 'sansback')

/* (planned = in a flying seat or a sim, his D2564 of 24 Nov 26: this helper put him on a ground briefing, which the first
   build counted and his rule does not — an OFT's rear seat now; a ground row naming no day: sans-planned-r5.test.ts) */
const plan = (di: number) => {
  const d: any = DAYS[di]
  d.sims = d.sims || {}
  ;(d.sims.oft = d.sims.oft || []).push({
    label: 'SIM', str: '1600', end: '1700', p: '', w: 'rocky',
  })
  afterSchedMutate()
}

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  people0 = JSON.stringify(PEOPLE)
  days0 = JSON.stringify(DAYS)
  inputs0 = JSON.stringify(INPUTS)
})

beforeEach(() => {
  date(15)
  for (const k of Object.keys(mem)) delete mem[k]
  storeBackend.impl = {
    getItem: k => mem[k] ?? null,
    setItem: (k, v) => { mem[k] = v },
  }

  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, JSON.parse(people0))
  indexCallsigns()
  DAYS.length = 0
  DAYS.push(...JSON.parse(days0))
  INPUTS.length = 0
  INPUTS.push(...JSON.parse(inputs0))
  NOTICES.length = 0

  Object.assign(SCHED, {
    pending: {}, changes: {}, added: {}, als: [], al: 0,
    dayOK: {}, sign: {}, orig: {}, cur: {}, signBind: {},
    drafts: {}, curDraft: {}, retired: {}, correcting: {},
  })

  stashClear()
  warInit(memoryBackend())
  initStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  login('ad', 'a')
  HOOKS.toast = () => {}
})

afterEach(() => {
  HOOKS.toast = oldToast
  resetSession(null)
  vi.restoreAllMocks()
})

afterAll(() => {
  vi.useRealTimers()
  storeBackend.impl = null
})

describe('Independent SANS review regressions', () => {
  it('hides only Hex from a shared Saturday offer', () => {
    posting('rocky')
    posting('bane')
    expect(commitInput(null, draft(), ['rocky', 'bane'])).toBe(true)
    posting('rocky', LATER)

    expect(sansOn('rocky', SAT)).toBe(false)
    expect(sansAvailOn('rocky', (DAYS[5] as any).dt)).toBeNull()
    expect(sansSectionHTML(DAYS[5], 5, true))
      .not.toContain('data-person="rocky"')
    expect(sbSansPanel(DAYS[5], 5))
      .not.toContain('data-person="rocky"')

    const frozen = Object.values(dayInputsFrozen(5))
      .filter((r: any) => r.type === 'SANS Availability')
    expect(frozen.flatMap(idsOf)).not.toContain('rocky')
    expect(frozen.flatMap(idsOf)).toContain('bane')
  })

  it('refuses a new early day at the final save boundary', () => {
    posting('rocky')
    login('hex')

    const ok = writeInputsBatch(() => {
      INPUTS.unshift({
        iid: 'review-early',
        people: [{ p: 'rocky', by: 'rocky' }],
        by: 'rocky',
        type: 'SANS Availability',
        date: 'Jul 16', yr: 2026,
        allday: true, s: 360, e: 1080, sans: { f: true },
      })
    })

    expect(ok).toBe(false)
    expect(INPUTS.some(r => r.iid === 'review-early')).toBe(false)
  })

  it('rechecks a newly added man when a shared editor saves', () => {
    posting('rocky')
    posting('bane')
    expect(commitNewInput(draft('bane'))).toBe(true)

    const rec = INPUTS.find(r =>
      r.type === 'SANS Availability' && idsOf(r).includes('bane'))!
    const heldDraft = { ...draftOf(rec), sans: { f: true } }

    posting('rocky', LATER)
    expect(commitInput(rec, heldDraft, ['bane', 'rocky'])).toBe(false)
    expect(idsOf(rec)).not.toContain('rocky')
  })

  it('accepts a past SANS day after the current tick is removed', () => {
    posting('rocky')
    date(17)
    runPoOutcomes()
    notify()

    date(20)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
    notify()
    login('hex')

    expect(sansOn('rocky', SAT)).toBe(true)
    expect(maySansAdd(SAT)).toBe(true)
    expect(commitNewInput(draft())).toBe(true)
  })

  /* (Astra's #6 = the fresh Opus read's F5 = w9's R2 — what the take-back line strikes, [SANS-BACK-STRIKE-WHAT]; his D2391
     answers it: nothing is struck, the line says plainly what changed) */
  it('does not invent a struck reminder for hidden-only news', () => {
    posting('rocky')
    offer()
    posting('rocky', LATER)

    expect(backs()).toHaveLength(1)
    expect(noticeWords(backs()[0]!).nameStruck).not.toBe(true)
  })

  it('does not strike a newly added day Hex never read', () => {
    plan(5)
    posting('rocky')
    login('hex')
    expect(markAllNoticesRead()).toBe(true)

    login('ad', 'a')
    plan(6)
    notify()
    posting('rocky', LATER)

    expect(backs()).toHaveLength(1)
    const w = noticeWords(backs()[0]!)
    expect(w.nameStruck).not.toBe(true)
    expect(JSON.stringify(w)).not.toContain('Sun 19')
  })

  it('refuses erasing a take-back through an input command', () => {
    posting('rocky')
    offer()
    posting('rocky', LATER)

    const n = backs()[0]!
    expect(n).toBeTruthy()
    const ok = writeInputsBatch(() => {
      NOTICES.splice(NOTICES.findIndex(x => x.id === n.id), 1)
    })

    expect(ok).toBe(false)
    expect(backs()).toHaveLength(1)
  })
})
