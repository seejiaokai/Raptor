// @vitest-environment jsdom
/* ADD A PERSON'S HOME SQUADRON CARRIES THROUGH THE WHOLE ADD (batch 1's second half, plan §4 item 7 — R-A3, PD1, D2094):
   Admin → Users' Add a person names the new man's home squadron (the page's by default, any squadron the adder is an
   admin of — every one for a master admin). His home row AND his first stint — the post-in date — are written to that
   squadron in the one command: through the war loaded when it is that squadron's, through the second store (that
   squadron's stored war, leavewar/state/foreign.ts) when it is not. The gate takes a second-store write in an add only
   for the man the command makes, and only his first window. Red first on the code before the change. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, worlds, ACCT, PID } from '../test-support/msq-world'
import { addPersonAndAccount, accountOfPid, accountsLoad, saveAccess } from './accounts'
import { addRosterPerson, putNewPerson, type NewPerson } from './roster-add'
import { putNewHome } from './units'
import { me } from './perms'
import { homeOn, todayIso, unitsLoad } from './units'
import { PEOPLE, nameToId } from '../engine/people'
import { getState } from '../leavewar/state/store'
import { readForeign, foreignWar } from '../leavewar/state/foreign'
import { commitPeopleSettingsIntent } from './people-settings-commit'
import { worldUnit } from '../leavewar/state/store'

useMsqWorld()

const WASP: NewPerson = { cs: 'WASP', ini: 'WSP', seat: 'FCP', cat: 'B' }
const POST_IN = '2026-07-20'
const pidOf = (cs: string): string | null => nameToId(cs) ?? null
/* every stored key of a squadron's war that names this man */
const warKeysOf = (unit: string, pid: string): string[] =>
  worlds[unit] ? [...worlds[unit]!.keys()].filter(k => (worlds[unit]!.read(k) ?? '').includes(`"${pid}"`) || k.includes(pid)) : []

describe('Add a person — the home squadron chosen carries through the whole add (R-A3)', () => {
  it('Saber, a master admin on 142\'s page, adds WASP to 149 with a sign-in: his home is 149 and his post-in is in 149\'s war only', () => {
    signInAs('saber')
    expect(worldUnit()).toBe('u142')
    expect(addPersonAndAccount('wasp@mail', WASP, 'main', POST_IN, 'u149')).toBeNull()
    const pid = pidOf('WASP')!
    expect(pid, 'WASP made').toBeTruthy()
    expect(homeOn(pid, todayIso())).toBe('u149')
    expect(accountOfPid(pid)?.name).toBe('wasp@mail')
    /* not in 142's war loaded */
    expect(getState().people.some(p => p.id === pid)).toBe(false)
    expect(warKeysOf('u142', pid)).toEqual([])
    /* in 149's stored war, from the post-in date */
    const post: any = readForeign(worlds.u149!, pid).post
    expect(post, '149\'s stored war holds his window').toBeTruthy()
    expect(post.from).toBe(POST_IN)
    expect(post.to ?? null).toBeNull()
  })
  it('the same without a sign-in (a roster-only man)', () => {
    signInAs('saber')
    expect(addRosterPerson(WASP, POST_IN, 'u149')).toBeNull()
    const pid = pidOf('WASP')!
    expect(homeOn(pid, todayIso())).toBe('u149')
    expect(accountOfPid(pid)).toBeFalsy()
    expect(getState().people.some(p => p.id === pid)).toBe(false)
    expect((readForeign(worlds.u149!, pid).post as any)?.from).toBe(POST_IN)
  })
  it('after a reload of both wars, the post-in date exists only in 149\'s', () => {
    signInAs('saber')
    expect(addPersonAndAccount('wasp@mail', WASP, 'main', POST_IN, 'u149')).toBeNull()
    const pid = pidOf('WASP')!
    accountsLoad(); unitsLoad()
    expect(homeOn(pid, todayIso())).toBe('u149')
    expect(warKeysOf('u142', pid)).toEqual([])
    expect((readForeign(worlds.u149!, pid).post as any)?.from).toBe(POST_IN)
  })
  it('with no squadron named, the page\'s own: Hunter adds WASP to 142 through the war loaded, as before', () => {
    signInAs('hunter')
    expect(addPersonAndAccount('wasp@mail', WASP, 'main', POST_IN)).toBeNull()
    const pid = pidOf('WASP')!
    expect(homeOn(pid, todayIso())).toBe('u142')
    expect(getState().people.find(p => p.id === pid)?.from).toBe(POST_IN)
    expect(readForeign(worlds.u149!, pid).post).toBeNull()
  })
  it('Hunter, 142\'s admin with no right in 149, is refused 149: no person, no account, no home, nothing in either war', () => {
    signInAs('hunter')
    expect(addPersonAndAccount('wasp@mail', WASP, 'main', POST_IN, 'u149')).toBe('Only an admin can add a person')
    expect(addRosterPerson(WASP, POST_IN, 'u149')).toBe('Only an admin can add someone')
    expect(pidOf('WASP')).toBeNull()
    expect(Object.values(PEOPLE).some((p: any) => p && p.cs === 'WASP')).toBe(false)
    expect(worlds.u149!.keys().filter(k => (worlds.u149!.read(k) ?? '').includes('WASP'))).toEqual([])
  })
  it('a squadron that is not there is refused, and nothing is made', () => {
    signInAs('saber')
    expect(addPersonAndAccount('wasp@mail', WASP, 'main', POST_IN, 'u999')).toBe('That did not save')
    expect(pidOf('WASP')).toBeNull()
  })
  it('Hunter holding Plan of 149 adds WASP to 149 while 142\'s war is loaded', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('hunter')
    expect(worldUnit()).toBe('u142')
    expect(addPersonAndAccount('wasp@mail', WASP, 'main', POST_IN, 'u149')).toBeNull()
    const pid = pidOf('WASP')!
    expect(homeOn(pid, todayIso())).toBe('u149')
    expect((readForeign(worlds.u149!, pid).post as any)?.from).toBe(POST_IN)
    expect(getState().people.some(p => p.id === pid)).toBe(false)
  })
})

describe('the gate takes a second-store write in an add only for the man it makes', () => {
  it('a forged person.add that also writes Kestrel\'s window in 149\'s stored war is refused', () => {
    signInAs('saber')
    const fw = foreignWar('u149')
    fw.load(PID.kestrel)
    const r = commitPeopleSettingsIntent('person.add', null, txn => {
      txn.enlist(fw)
      fw.setPost(PID.kestrel, { id: PID.kestrel, from: '2026-07-01', to: '2026-07-02' } as any)
    }) as any
    expect(r.ok).toBe(false)
    expect(readForeign(worlds.u149!, PID.kestrel).post).toBeNull()
  })
  /* a real add of a 149 man, with a forged window of Kestrel's beside his own: the new man's passes, Kestrel's does not */
  it('a real add of WASP to 149 that also writes Kestrel\'s window is refused whole', () => {
    signInAs('saber')
    const fw = foreignWar('u149')
    fw.load(PID.kestrel)
    const r = commitPeopleSettingsIntent('person.add', null, txn => {
      const pid = putNewPerson(WASP)
      putNewHome(pid, me(), 'u149')
      txn.enlist(fw)
      fw.setPost(pid, { id: pid, from: POST_IN, to: null } as any)
      fw.setPost(PID.kestrel, { id: PID.kestrel, from: '2026-07-01', to: '2026-07-02' } as any)
    }) as any
    expect(r.ok).toBe(false)
    expect(pidOf('WASP')).toBeNull()
    expect(readForeign(worlds.u149!, PID.kestrel).post).toBeNull()
  })
  /* a new man made 142's whose window is written into 149's stored war: the squadron his home names, and no other */
  it('a new 142 man whose first window is written into 149\'s stored war is refused', () => {
    signInAs('saber')
    const fw = foreignWar('u149')
    const r = commitPeopleSettingsIntent('person.add', null, txn => {
      const pid = putNewPerson(WASP)
      putNewHome(pid, me(), 'u142')
      txn.enlist(fw)
      fw.setPost(pid, { id: pid, from: POST_IN, to: null } as any)
    }) as any
    expect(r.ok).toBe(false)
    expect(pidOf('WASP')).toBeNull()
  })
})
