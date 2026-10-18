/* [SC-B-CHANGE-SAYS-BRIEF] (the D606 walk, 7 Oct 26): on an SC line the B box is the crew's in-time, not a brief (owner,
   24 Aug 26), and since D606 it moves OIL. A B typed or changed on a published day was listed as "SC · brief". Every
   place that names the box says "in-time" on an SC line — the change history's label (and so "To go out"), the changes
   window's detail and Undo — and "brief" everywhere else, AVALON and BB included. */
import { describe, it, expect, afterEach } from 'vitest'
import { DAYS } from '../engine/data'
import { makeStandalone } from '../engine/waves'
import { keyLabel } from '../engine/editlog'
import { itemOf } from './changesmodel'
import { textLabel } from '../undo/describe'

const TUE = 1
const added: number[] = []
afterEach(() => { while (added.length) { (DAYS[TUE] as any).waves.splice(added.pop()!, 1) } })
const addWave = (kind: string) => {
  const w: any = makeStandalone(kind); (DAYS[TUE] as any).waves.push(w)
  const gi = (DAYS[TUE] as any).waves.length - 1; added.push(gi); return gi
}
const words = (key: string) => [keyLabel(key), itemOf({ key, lbl: keyLabel(key), date: (DAYS[TUE] as any).date } as any).detail, textLabel(key)]

describe('the B box’s name in the change history, the changes window and Undo', () => {
  it('on an SC line it is the in-time', () => {
    const gi = addWave('sc')
    const [lbl, detail, undo] = words(`ff:${TUE}.${gi}.0.br`)
    expect(lbl).toMatch(/ · in-time$/)
    expect(detail).toBe('In-time')
    expect(undo).toBe('an in-time')
  })
  it('on a flying line it stays the brief', () => {
    const [lbl, detail, undo] = words(`ff:${TUE}.0.0.br`)
    expect(lbl).toMatch(/ · brief$/)
    expect(detail).toBe('Brief')
    expect(undo).toBe('a brief time')
  })
  for (const kind of ['avalon', 'bb']) {
    it(`on an ${kind.toUpperCase()} line it stays the brief`, () => {
      const gi = addWave(kind)
      const [lbl, detail, undo] = words(`ff:${TUE}.${gi}.0.br`)
      expect(lbl).toMatch(/ · brief$/)
      expect(detail).toBe('Brief')
      expect(undo).toBe('a brief time')
    })
  }
})
