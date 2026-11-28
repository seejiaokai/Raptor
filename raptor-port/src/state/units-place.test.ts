// @vitest-environment jsdom
/* ADMIN → SQUADRONS' DOORS (batch 1's second half, plan §6 — P2, PG1, D2196, D2298, D2336, D2308; §15 D13, §16 D13′):
   "+ New squadron" with a new place, and a squadron's move onto a new place, are each ONE command — one Undo step; a
   place's time zone is changed only by an admin of every squadron at it, today or from a later day (a move saved for
   tomorrow counts), a master admin always; a place no squadron is at, and a new place row on its own, are a master
   admin's; a squadron's first admin is never a master admin (D14). Door and gate. Red first on the code before. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import { addUnit, moveUnit, setPlace, unitsLoad, units, unitRows, placeById, todayIso } from './units'
import { saveAccess } from './accounts'
import { commitSettingsIntent } from './people-settings-commit'
import { store } from '../engine/hooks'
import { PLACE_PFX, placeIdOn, moveFrom } from './units-model'
import { globalUndo } from '../undo/timeline'

useMsqWorld()

const BOTH = 'Only an admin of both 142 and 149 can change the time zone: both squadrons are here.'
const NORTH = { name: 'North base', tz: 'Asia/Tokyo' }
const placeNamed = (name: string) => unitRows().places.find(p => p.name === name)
const unitNum = (num: string) => units().find(u => u.num === num)

describe('"+ New squadron" with a new place — one command, one Undo step', () => {
  it('Saber makes 150 at a new place; one Undo leaves neither the squadron nor the place', () => {
    signInAs('saber')
    const r = addUnit('150', NORTH, ACCT.hunter)
    expect(r).toMatchObject({ ok: true })
    unitsLoad()
    const u150 = unitNum('150')!, p = placeNamed('North base')!
    expect(p.tz).toBe('Asia/Tokyo')
    expect(placeIdOn(unitRows(), u150.id, todayIso())).toBe(p.id)
    expect(globalUndo().ok).toBe(true)
    unitsLoad()
    expect(unitNum('150')).toBeUndefined()
    expect(placeNamed('North base')).toBeUndefined()
  })
  it('a new place with no name, or no time zone, is refused and nothing is made', () => {
    signInAs('saber')
    expect(addUnit('150', { name: '', tz: 'Asia/Tokyo' }, ACCT.hunter)).toMatchObject({ ok: false })
    expect(addUnit('150', { name: 'North base', tz: 'Nowhere/Never' }, ACCT.hunter)).toMatchObject({ ok: false })
    unitsLoad()
    expect(unitNum('150')).toBeUndefined()
    expect(placeNamed('North base')).toBeUndefined()
  })
  it('a master admin is never named the first admin (D14)', () => {
    signInAs('kestrel')
    signInAs('saber')
    expect(addUnit('150', 'p1', ACCT.saber)).toMatchObject({ ok: false })
    unitsLoad()
    expect(unitNum('150')).toBeUndefined()
  })
  it('a plain admin cannot make a squadron, with or without a new place', () => {
    signInAs('hunter')
    expect(addUnit('150', NORTH, ACCT.kestrel)).toMatchObject({ ok: false })
    unitsLoad()
    expect(unitNum('150')).toBeUndefined()
    expect(placeNamed('North base')).toBeUndefined()
  })
})

describe('a squadron moved onto a new place — one command, one Undo step', () => {
  it('Kestrel moves 149 to a new place from tomorrow; one Undo leaves neither the move nor the place', () => {
    signInAs('kestrel')
    expect(moveUnit('u149', NORTH)).toMatchObject({ ok: true })
    unitsLoad()
    const p = placeNamed('North base')!
    expect(placeIdOn(unitRows(), 'u149', moveFrom(todayIso()))).toBe(p.id)
    expect(placeIdOn(unitRows(), 'u149', todayIso())).toBe('p1')
    expect(globalUndo().ok).toBe(true)
    unitsLoad()
    expect(placeNamed('North base')).toBeUndefined()
    expect(placeIdOn(unitRows(), 'u149', moveFrom(todayIso()))).toBe('p1')
  })
  it('Hunter (142 only) cannot move 149', () => {
    signInAs('hunter')
    expect(moveUnit('u149', NORTH)).toMatchObject({ ok: false })
    unitsLoad()
    expect(placeNamed('North base')).toBeUndefined()
  })
})

describe('a place\'s time zone — an admin of every squadron at it (D2336, PG1; D13)', () => {
  it('Hunter (142 only) is refused Home base\'s time zone in the drawn words; with Plan of 149 he may; Saber may', () => {
    signInAs('hunter')
    expect(setPlace({ id: 'p1', name: 'Home base', tz: 'Asia/Tokyo' })).toMatchObject({ ok: false, message: BOTH })
    expect(placeById('p1')!.tz).toBe('Australia/Perth')
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('hunter')
    expect(setPlace({ id: 'p1', name: 'Home base', tz: 'Asia/Tokyo' })).toEqual({ ok: true, id: 'p1' })
    signInAs('saber')
    expect(setPlace({ id: 'p1', name: 'Home base', tz: 'Australia/Perth' })).toMatchObject({ ok: true })
  })
  it('a move saved for tomorrow counts: with 149 moving to 150\'s place, Kestrel alone may not change its time zone', () => {
    signInAs('saber')
    expect(addUnit('150', NORTH, ACCT.hunter)).toMatchObject({ ok: true })
    unitsLoad()
    const p = placeNamed('North base')!
    signInAs('kestrel')
    expect(moveUnit('u149', p.id)).toMatchObject({ ok: true })
    unitsLoad()
    expect(setPlace({ id: p.id, name: 'North base', tz: 'Asia/Seoul' })).toMatchObject({
      ok: false, message: 'Only an admin of both 149 and 150 can change the time zone: both squadrons are here.',
    })
    /* Hunter, 150's first admin, has no right in 149 */
    signInAs('hunter')
    expect(setPlace({ id: p.id, name: 'North base', tz: 'Asia/Seoul' })).toMatchObject({ ok: false })
    signInAs('saber')
    expect(setPlace({ id: p.id, name: 'North base', tz: 'Asia/Seoul' })).toMatchObject({ ok: true })
  })
  it('three squadrons at a place: the words name all three', () => {
    signInAs('saber')
    expect(addUnit('150', 'p1', ACCT.hunter)).toMatchObject({ ok: true })
    unitsLoad()
    signInAs('kestrel')
    expect(setPlace({ id: 'p1', name: 'Home base', tz: 'Asia/Tokyo' })).toMatchObject({
      ok: false, message: 'Only an admin of 142, 149 and 150 can change the time zone: all three squadrons are here.',
    })
  })
  it('a place no squadron is at, and a new place on its own, are a master admin\'s (D13′)', () => {
    signInAs('hunter')
    expect(setPlace({ name: 'South base', tz: 'Asia/Tokyo' })).toMatchObject({ ok: false })
    signInAs('saber')
    const r = setPlace({ name: 'South base', tz: 'Asia/Tokyo' }) as any
    expect(r).toMatchObject({ ok: true })
    signInAs('hunter')
    expect(setPlace({ id: r.id, name: 'South base', tz: 'Asia/Seoul' })).toMatchObject({ ok: false })
  })
})

describe('the gate holds the same (D13, D13′)', () => {
  it('a forged change of Home base\'s time zone by Hunter (142 only) is refused', () => {
    signInAs('hunter')
    const r = commitSettingsIntent('place.set', null, () => { store.set(PLACE_PFX + 'p1', { id: 'p1', name: 'Home base', tz: 'Asia/Tokyo' }) }) as any
    expect(r.ok).toBe(false)
    unitsLoad()
    expect(placeById('p1')!.tz).toBe('Australia/Perth')
  })
  it('a forged new place on its own by Hunter is refused', () => {
    signInAs('hunter')
    const r = commitSettingsIntent('place.set', null, () => { store.set(PLACE_PFX + 'pforge', { id: 'pforge', name: 'Forge', tz: 'Asia/Tokyo' }) }) as any
    expect(r.ok).toBe(false)
  })
})
