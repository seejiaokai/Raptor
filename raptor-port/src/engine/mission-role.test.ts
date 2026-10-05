/* MIX2 MIX3 MIX10 — applicable behavioural watches; see Insights build register. */
import { describe, expect, it } from 'vitest'
import { missionContext, resolveMissionRole, encodeRoleId, decodeRoleId, validRoleAnswer, validRoleSeeds } from './mission-role'

const formation = (msn: string, remarks: string[] = []) => ({ msn, aircraft: remarks.map(rmks => ({ rmks })) })
describe('D518 D525 D531 — pinned context v1, cue without guessing', () => {
  it.each(['DS', 'RED', 'RED AIR', 'REDAIR', 'RED-AIR', ' red  air '])('%s is exact automatic Red, even with a contrary stored answer', msn => {
    expect(resolveMissionRole(formation(msn), () => ({ id: 'unused', answer: { side: 'blue' } }))).toMatchObject({ role: 'red', conditional: false })
  })
  it.each(['DS-2', 'DS2', 'RED AIR 2', 'REDAIR2', 'RED-AIR2', 'ACM/DS'])('%s is unresolved without an explicit answer', msn => {
    expect(resolveMissionRole(formation(msn))).toMatchObject({ role: null, conditional: true })
  })
  it.each(['CREDIBLE', 'REDS', 'REDSHIFT', 'DSFOR'])('%s is not a lexical cue', text => {
    expect(resolveMissionRole(formation(text, [text]))).toMatchObject({ role: 'blue', conditional: false })
  })
  it('pins house separators and preserves a slash, comma and undelimited number', () => {
    expect(missionContext(formation(' acm ', ['DS FOR VL // BRIEF 30 PRIOR']))).toBe('[1,"ACM",["DS FOR VL"]]')
    expect(missionContext(formation('ACM', ['DS FOR VL; REJOIN 1440']))).toBe('[1,"ACM",["DS FOR VL"]]')
    expect(missionContext(formation('ACM', ['DS FOR VL/RU // BRIEF 30 PRIOR']))).toBe('[1,"ACM",["DS FOR VL/RU"]]')
    expect(missionContext(formation('ACM', ['DS FOR VL, REJOIN 1430']))).toBe('[1,"ACM",["DS FOR VL, REJOIN 1430"]]')
    expect(missionContext(formation('ACM', ['DS FOR VL REJOIN 1430']))).not.toBe(missionContext(formation('ACM', ['DS FOR VL REJOIN 1440'])))
  })
  it('sorts unique cue clauses deterministically; includes cancelled aircraft wording and ignores crew/times', () => {
    const f: any = formation('ACM', ['RED FROM RU; DS FOR VL', 'DS FOR VL'])
    expect(missionContext(f)).toBe('[1,"ACM",["DS FOR VL","RED FROM RU"]]')
    f.aircraft[0].cx = true; f.aircraft[0].p = 'someone'; f.to = '15:00'
    f.aircraft.reverse()
    expect(missionContext(f)).toBe('[1,"ACM",["DS FOR VL","RED FROM RU"]]')
    expect(missionContext(formation('ACM', ['DS\nFROM RU']))).toBe('[1,"ACM",["DS FROM RU"]]')
    expect(missionContext(formation('ACM', ['REDAIR2 FROM RU']))).toBe('[1,"ACM",["REDAIR2 FROM RU"]]')
  })
})

describe('D530 — strict separate answer identity and supported format', () => {
  const context = '[1,"ACM",["DS FOR VL"]]'
  const identity = { weekKey: '13/07/2026', dayISO: '2026-07-14', formationRid: 'rid/#%🐦', context }
  const record = { format: 1, ...identity, contextVersion: 1, side: 'red' as const }
  it('pins collision-free tuple identity and reads only its matching record', () => {
    const id = encodeRoleId(identity)
    expect(id).toBe(encodeURIComponent(JSON.stringify([1, identity.weekKey, identity.dayISO, identity.formationRid, context])))
    expect(decodeRoleId(id)).toEqual(identity)
    expect(validRoleAnswer(id, record)).toBe(true)
    expect(resolveMissionRole(formation('ACM', ['DS FOR VL']), () => ({ id, answer: record }))).toMatchObject({ role: 'red', conditional: true })
    expect(resolveMissionRole(formation('ACM', ['DS FROM RU']), () => ({ id, answer: record })).role).toBe(null)
  })
  it('refuses malformed, unsupported, differently-bound and out-of-week records without mutating them', () => {
    const id = encodeRoleId(identity)
    for (const change of [{ format: 2 }, { contextVersion: 2 }, { side: 'RED' }, { formationRid: 'other' }, { context: '[2,"ACM",[]]' }]) {
      const bad = { ...record, ...change }; const bytes = JSON.stringify(bad)
      expect(validRoleAnswer(id, bad)).toBe(false)
      expect(resolveMissionRole(formation('ACM', ['DS FOR VL']), () => ({ id, answer: bad })).role).toBe(null)
      expect(JSON.stringify(bad)).toBe(bytes)
    }
    expect(decodeRoleId('%broken')).toBe(null)
    expect(decodeRoleId(encodeURIComponent(JSON.stringify([1, identity.weekKey, '2026-07-21', identity.formationRid, context])))).toBe(null)
  })
})
it('D529/D531 template seeds accept only unique matching conditional ordinary formations, never standby',()=>{
  const f=formation('ACM',['DS FOR VL']),context=missionContext(f),seed={path:[0,0],context,side:'red'}
  const blob={waves:[{formations:[f]}]}
  expect(validRoleSeeds({format:1,seeds:[seed]},blob)?.seeds).toEqual([seed])
  for(const raw of [{format:2,seeds:[seed]},{format:1,seeds:[seed,seed]},{format:1,seeds:[{...seed,side:'RED'}]},{format:1,seeds:[{...seed,path:[0,-1]}]},{format:1,seeds:[{...seed,context:missionContext(formation('ACM',['DS FROM RU']))}]}])expect(validRoleSeeds(raw,blob)).toBeUndefined()
  expect(validRoleSeeds({format:1,seeds:[seed]},{waves:[{standalone:'sc',formations:[f]}]})).toBeUndefined()
})
