/* THE UNAVAILABLE LIST'S ROWS KEEP THEIR ORDER THROUGH EVERY ORDER OF CUT-OUTS (the code reads of pull request 845,
   25 Nov 26 — the first finding of all three blind readers; the sweep is the fresh Fable reader's proof, lifted from its
   scratch folder as it asked). The first build of "a man cut out keeps his row" remembered a middle man's two
   neighbours: three men in any order held, and from four men on some orders did not (B, A, C: rows A, C, D, B), nor a
   man cut out again from his own input once a second man had been put into it, nor a man whose two neighbours had both
   been replaced by a dropped name. Engine calls only — the cut (inputown.ts ownInputOf, swapPerson, putPerson) and the
   list's one order (rowinput.ts unavailFaces); the doors are ui/sharedrow-walkfinds.test.tsx. */
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from './inputs'
import { ownInputOf, swapPerson, putPerson } from './inputown'
import { unavailFaces } from './rowinput'

const L = INPUTS as any[]
let n = 0
const mk = (ppl: string[]) => ({ iid: `ord-test-${++n}`, type: 'LL', date: 'Jul 13', allday: false, s: 480, e: 600, people: ppl.map(p => ({ p })) })
const perms = (xs: string[]): string[][] => xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map(p => [x, ...p]))
const rows = () => unavailFaces(L.slice()).map((f: any) => f.person).join(',')
const several = (who: string) => L.find(r => r.people.length > 1 && r.people.some((e: any) => e.p === who))
let kept: any[] = []
beforeEach(() => { kept = L.splice(0, L.length); return () => { L.splice(0, L.length, ...kept) } })

describe('every order of cut-outs leaves the rows where they stood', () => {
  for (const size of [3, 4, 5, 6]) {
    it(`${size} men, each cut out in every order, then each cut undone in turn`, () => {
      const names = 'ABCDEF'.slice(0, size).split(''), want = names.join(','), bad: string[] = []
      for (const seq of perms(names)) {
        L.splice(0, L.length, mk(names))
        const snaps: string[] = []; let done = ''
        for (const who of seq) {
          const src = several(who); if (!src) break
          snaps.push(JSON.stringify(L))
          ownInputOf(src, who); done += who
          if (rows() !== want) { bad.push(`${done} -> ${rows()}`); break }
        }
        /* Undo, a step at a time: the list as it stood before each cut, the same ids */
        for (let i = snaps.length - 1; i >= 0 && !bad.length; i--) {
          L.splice(0, L.length, ...JSON.parse(snaps[i]))
          if (rows() !== want) bad.push(`${done} undone to step ${i} -> ${rows()}`)
        }
        if (bad.length) break
      }
      expect(bad).toEqual([])
    })
  }
  it('with other inputs above and below the shared one on the list, they keep their own places', () => {
    L.splice(0, L.length, mk(['X']), mk(['A', 'B', 'C', 'D']), mk(['Y', 'Z']))
    for (const who of ['B', 'A', 'C']) ownInputOf(several(who), who)
    expect(rows()).toBe('X,A,B,C,D,Y,Z')
  })
})

describe('…and through a name dropped on a puck, and a man put in later', () => {
  it('the middle man cut out, then both his neighbours replaced: he still stands between the newcomers', () => {
    L.splice(0, L.length, mk(['A', 'B', 'C']))
    ownInputOf(several('B'), 'B')
    const S = several('A')
    expect(swapPerson(S, 'A', 'Y')).toBe(true); expect(swapPerson(S, 'C', 'Z')).toBe(true)
    expect(rows()).toBe('Y,B,Z')
  })
  it('a name dropped on the cut-out man\'s own puck takes his row', () => {
    L.splice(0, L.length, mk(['A', 'B', 'C']))
    const own = ownInputOf(several('B'), 'B')
    expect(swapPerson(own, 'B', 'W')).toBe(true)
    expect(rows()).toBe('A,W,C')
  })
  it('a second man put into the cut-out man\'s own input stands under him; either of the two cut out again stays put', () => {
    for (const again of ['B', 'X']) {
      L.splice(0, L.length, mk(['A', 'B', 'C']))
      const own = ownInputOf(several('B'), 'B')
      expect(putPerson(own, 'X')).toBe(true)
      expect(rows(), 'before the second cut').toBe('A,B,X,C')
      ownInputOf(own, again)
      expect(rows(), `${again} cut out again`).toBe('A,B,X,C')
    }
  })
  it('a man put into the SHARED input after a cut stands where the list has him — last of it', () => {
    L.splice(0, L.length, mk(['A', 'B', 'C']))
    ownInputOf(several('B'), 'B')
    expect(putPerson(several('A'), 'N')).toBe(true)
    expect(rows()).toBe('A,B,C,N')
  })
  it('on a day the shared input is not on, a cut-out is drawn where the list has it', () => {
    L.splice(0, L.length, mk(['A', 'B', 'C']))
    const own = ownInputOf(several('B'), 'B')
    expect(unavailFaces([own]).map((f: any) => f.person)).toEqual(['B'])
  })
})
