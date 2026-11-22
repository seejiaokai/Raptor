/* WHOM MAY HE FILE THIS DRAFT FOR — 7c's who-rule as one body (the reshape plan §3.3 C6, §3.4): the gate, the picker
   and the save door ask the same question of the whole draft, so the picker never offers whom the save refuses. Ranger
   moves 142 → 149 from Thu 16 Jul; Hunter is 142's plain admin (his person `prowler`), Kestrel 149's, Saber the master. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, acrossMove, signInAs, PID } from '../test-support/msq-world'
import { inputWhoProblemNow } from './perms'

useMsqWorld()
const R = PID.ranger
const leave = (date: string, endDate?: string, extra: any = {}) =>
  ({ person: R, date, ...(endDate ? { endDate } : {}), allday: true, type: 'LL', yr: 2026, remarks: '', ...extra })

describe('a draft across Ranger\'s move', () => {
  it('Hunter (142\'s plain admin): Ranger on Tue 14 Jul alone passes; stretched to Fri 17 Jul it is refused, naming Ranger and 149', () => {
    acrossMove(R, 'u142', 'u149')
    signInAs('hunter')
    expect(inputWhoProblemNow(null, leave('Jul 14'))).toBeNull()
    expect(inputWhoProblemNow(null, leave('Jul 14', 'Jul 17'))).toMatchObject({ pid: R, unit: 'u149' })
  })
  it('Kestrel (149\'s admin) saving a change to that leave from 149\'s list is refused too, naming 142', () => {
    acrossMove(R, 'u142', 'u149')
    signInAs('kestrel')
    const was = leave('Jul 14', 'Jul 17')
    expect(inputWhoProblemNow(was, { ...was, remarks: 'changed' })).toMatchObject({ pid: R, unit: 'u142' })
  })
  it('Ranger\'s own leave across his move passes; so does the master admin\'s filing for him', () => {
    acrossMove(R, 'u142', 'u149')
    signInAs('ranger')
    expect(inputWhoProblemNow(null, leave('Jul 14', 'Jul 17'))).toBeNull()
    signInAs('saber')
    expect(inputWhoProblemNow(null, leave('Jul 14', 'Jul 17'))).toBeNull()
  })
  it('the picker\'s question and the save\'s agree for every span (actor × span)', () => {
    acrossMove(R, 'u142', 'u149')
    const spans: Array<[string, string | undefined]> = [['Jul 14', undefined], ['Jul 14', 'Jul 15'], ['Jul 15', 'Jul 16'], ['Jul 16', 'Jul 17'], ['Jul 14', 'Jul 17']]
    const table: Record<string, Array<string | null>> = {}
    for (const who of ['hunter', 'kestrel', 'saber'] as const) {
      signInAs(who)
      table[who] = spans.map(([a, b]) => inputWhoProblemNow(null, leave(a, b))?.unit ?? null)
    }
    expect(table).toEqual({
      hunter: [null, null, 'u149', 'u149', 'u149'],
      kestrel: ['u142', 'u142', 'u142', null, 'u142'],
      saber: [null, null, null, null, null],
    })
  })
  it('a draft whose dates cannot be read is judged on today, never let through', () => {
    acrossMove(R, 'u142', 'u149')
    signInAs('kestrel')
    expect(inputWhoProblemNow(null, { person: R, date: 'nonsense', type: 'LL' })).toMatchObject({ unit: 'u142' })
  })
})
