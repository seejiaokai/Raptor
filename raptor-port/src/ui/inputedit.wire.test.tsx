// @vitest-environment jsdom
/* A HAND-OVER BY A MEMBER, THROUGH THE INPUT'S OWN WINDOW — refused IN WORDS (the break tests of the one-rule job's full
   check, 12 Oct 26: docs/handpass/parts/or-wires-3.md, wire 6; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md
   §4.9; owner D763: "who is in an input is changed only by whoever filed it or by a scheduler").

   The only named person of an input someone else filed for him may change it in full and may add people to it — but he
   never hands it to another person: he out, another in, in one save. The one-field save says so (commitInputEdit —
   held by leavewar/groupinput.test.ts); the input's own writer, commitInput, says the same sentence at its own door.
   With that door's refusal taken away on purpose no test went red: the check on what a member's command really changed
   (state/perms.ts) still rolled the save back, so nothing was handed over — but the window then said only "Not saved —
   that change is not yours to make", and nothing held the sentence that tells him who can. This case holds it.

   The harness is ui/groupeditor.test.tsx's, without the page: Saber (`stiff`) is the admin, Ranger (`bane`) the member. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { commitInput, draftOf } from './inputedit'
import { initStore, notify, setSession, writeInputs } from '../state/store'
import { setMe } from '../state/auth'
import { INPUTS, idsOf } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'

const seed = JSON.stringify(INPUTS)
const said: string[] = []
const realToast = HOOKS.toast
const admin = 'stiff', member = 'bane'
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers)
const others = () => crew().filter(id => id !== admin && id !== member)
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const T0 = new Date('2026-09-01T08:00:00.000Z').getTime()
const as = (who: 'admin' | 'member') => {
  if (who === 'admin') { setSession({ user: admin, role: 'admin' }); setMe(admin) } else { setSession({ user: member, role: 'main' }); setMe(member) }
  notify()
}
/* an input of ONE person as the app files it — its list of one — put in through the app's own door, by the admin */
const filedFor = (person: string) => {
  const row: any = { iid: 'wire6', type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'solo', mod: '2026-09-01', by: admin, at: T0 }
  row.people = [{ p: person, by: admin, at: T0 }]
  expect(writeInputs(() => { INPUTS.push(row) })).toBe(true)
  return live(row.iid)
}

beforeEach(() => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore()
  setSession({ user: admin, role: 'admin' }); setMe(admin)
  lwInitStore(memoryBackend()); lwSetRole('admin')
  said.length = 0; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
})
afterEach(() => { HOOKS.toast = realToast; storeBackend.impl = null })

describe('a member never hands an input to another person (D763; the plan §4.9)', () => {
  it('his own input, filed for him by an admin, saved in its window with himself out and another man in: refused, and the words say who can', () => {
    const [other] = others()
    const r = filedFor(member)
    const was = JSON.stringify(r)
    as('member')
    said.length = 0
    expect(commitInput(live(r.iid), draftOf(live(r.iid)), [other]), 'the save').toBe(false)
    expect(said.join(' | '), 'said as the one-field save says it').toContain('Only a scheduler can move an input to another person')
    expect(said.join(' | '), 'never the catch-all').not.toContain('not yours to make')
    expect(idsOf(live(r.iid)).map(String), 'still his').toEqual([member])
    expect(JSON.stringify(live(r.iid)), 'nothing of it changed').toBe(was)
  })
  it('…while adding that man beside himself is his to do, and so is taking himself out of what he then shares', () => {
    const [other] = others()
    const r = filedFor(member)
    as('member')
    expect(commitInput(live(r.iid), draftOf(live(r.iid)), [member, other]), `he adds a man: ${said.join(' | ')}`).toBe(true)
    expect(idsOf(live(r.iid)).map(String)).toEqual([member, other])
    expect(commitInput(live(r.iid), draftOf(live(r.iid)), [other]), `he takes himself out: ${said.join(' | ')}`).toBe(true)
    expect(idsOf(live(r.iid)).map(String)).toEqual([other])
  })
})
