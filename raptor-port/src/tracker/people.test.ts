/* The people bridge (9 Sep 26, the person → Tracker link). Raptor pushes a
   projection of its PEOPLE into this module on every notify; the Tracker reads
   it when the + Add dialog opens and stamps `by` from whoami() on every mark.
   Three things pinned:
   · an unchanged list is a no-op — Raptor notifies on every keystroke, and the
     Tracker must not repaint its side panel for each one;
   · whoami() never throws and answers '' when nobody has told it who — a mark
     made before Raptor wired the bridge, or in the standalone app, still lands;
   · the module imports nothing, for the same reason role.js imports nothing:
     Raptor calls it before (and whether or not) the chart engine ever loads. */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getPeople, onPeople, setPeople, setWhoami, whoami } from './people.js'

const A = { id: 'a', cs: 'Alpha', seat: 'FCP', q: 'OCU', sxo: false }
const B = { id: 'b', cs: 'Bravo', seat: 'RCP', q: '', sxo: true }

describe('the people bridge (tracker/people.js)', () => {
  it('the same list twice notifies once, and the array handed out is stable while unchanged', () => {
    let n = 0
    const off = onPeople(() => { n++ })
    setPeople([A, B])
    expect(n).toBe(1)
    const first = getPeople()
    setPeople([{ ...A }, { ...B }])
    expect(n, 'same content, fresh objects: no notify').toBe(1)
    expect(getPeople(), 'and the same array, so a memoised render can skip').toBe(first)
    setPeople([A, { ...B, q: 'D' }])
    expect(n, 'a changed field notifies').toBe(2)
    expect(getPeople()).not.toBe(first)
    setPeople([A])
    expect(n, 'a dropped person notifies').toBe(3)
    off()
    setPeople([])
    expect(n, 'unsubscribed').toBe(3)
    expect(getPeople()).toEqual([])
  })

  it('a listener that throws does not stop the others', () => {
    let n = 0
    const off1 = onPeople(() => { throw new Error('boom') })
    const off2 = onPeople(() => { n++ })
    setPeople([A])
    expect(n).toBe(1)
    off1(); off2()
    setPeople([])
  })

  it('whoami answers the wired name, and "" when nobody is wired or the hook throws', () => {
    setWhoami(null)
    expect(whoami()).toBe('')
    setWhoami(() => 'Squadron member')
    expect(whoami()).toBe('Squadron member')
    setWhoami(() => { throw new Error('no session') })
    expect(whoami()).toBe('')
    setWhoami(() => undefined)
    expect(whoami()).toBe('')
    setWhoami(() => 42 as any)
    expect(whoami(), 'always a string').toBe('42')
    setWhoami(null)
  })

  it('imports nothing — Raptor reaches it without loading the chart engine', () => {
    const src = readFileSync(join(__dirname, 'people.js'), 'utf8')
    expect(src).not.toMatch(/^\s*import /m)
    expect(src).not.toMatch(/require\(/)
  })
})
