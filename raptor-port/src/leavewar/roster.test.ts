// The categorised roster (owner, 18 Aug 26): the display grouping and colours,
// the admin-gated order + personnel labels, the ground-crew manning carve-out,
// and the live re-projection that lands a body added on Raptor's Quals page.

import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { PEOPLE, SANS_IDS } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify } from '../state/store'
import {
  autoOrder,
  catClass,
  catText,
  countsFor,
  groupOf,
  GROUP_ORDER,
  opsCatOf,
  orderedPeople,
  ruleHave,
  type Person,
  type RuleCount,
} from './engine'
import {
  autoSortRoster,
  displayRoster,
  getState,
  initStore as lwInitStore,
  manningRowIds,
  moveManningRow,
  moveManningRowTo,
  moveRosterRow,
  orderedManningIds,
  personLabel,
  resetManning,
  setPeople,
  setPerson,
  setPostOut,
  setRole,
  setRosterOrder,
  setPersLabel,
  setShowSans,
  toggleManningRow,
} from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'

const person = (id: string, over: Partial<Person> = {}): Person => ({
  id, callsign: id.toUpperCase(), seat: 'pilot', band: 'ops', sxo: false, from: null, to: null, ...over,
})

const CREW: Person[] = [
  person('ins_p', { seat: 'pilot', band: 'instructor', q: 'IP' }),
  person('ops_a', { seat: 'pilot', band: 'ops', q: 'A' }),
  person('ops_c', { seat: 'pilot', band: 'ops', q: 'C' }),
  person('ops_d', { seat: 'pilot', band: 'ops', q: 'D' }),
  person('ins_w', { seat: 'wso', band: 'instructor', q: 'IW' }),
  person('ops_w_b', { seat: 'wso', band: 'ops', q: 'B' }),
  person('ocu_1', { seat: 'pilot', band: 'ops', q: 'OCU' }),
  person('sxo_1', { seat: 'pilot', band: 'instructor', q: 'IP', sxo: true }),
  person('gnd_1', { seat: 'gnd', band: 'ops', pers: true, label: 'Line' }),
]

describe('groupOf — the owner\'s seven groups', () => {
  it('places each person in the right group, SXO winning over category', () => {
    expect(groupOf(CREW[0])).toBe('IP')
    expect(groupOf(CREW[1])).toBe('OPSP')
    expect(groupOf(CREW[4])).toBe('IWSO')
    expect(groupOf(CREW[5])).toBe('OPSW')
    expect(groupOf(CREW[6])).toBe('OCU')
    expect(groupOf(CREW[7])).toBe('SXO')   // an SXO IP shows under SXO, once
    expect(groupOf(CREW[8])).toBe('PERS')
  })
})

describe('autoOrder — the categorised default', () => {
  it('orders groups top-to-bottom and ops crew A→D within them', () => {
    const ids = autoOrder(CREW)
    expect(ids).toEqual(['sxo_1', 'ins_p', 'ops_a', 'ops_c', 'ops_d', 'ins_w', 'ops_w_b', 'ocu_1', 'gnd_1'])
    // The group order is exactly GROUP_ORDER.
    const groupsSeen = ids.map(id => groupOf(CREW.find(p => p.id === id)!))
    const firstIndex = (g: (typeof GROUP_ORDER)[number]) => groupsSeen.indexOf(g)
    for (let i = 1; i < GROUP_ORDER.length; i++) {
      const a = firstIndex(GROUP_ORDER[i - 1]), b = firstIndex(GROUP_ORDER[i])
      if (a >= 0 && b >= 0) expect(a).toBeLessThan(b)
    }
  })

  /* Within a MIXED group (SXO holds every grade) the order is most-qualified
     first — FI, IR, IP, IW, then the ops grades A→D, then OCU (owner, 18 Aug
     26: "look at my list of hierarchy"). Before this IP and IW shared a rank
     and interleaved by callsign, which is the jumble the owner flagged. */
  it('a mixed group sorts most-qualified first: FI, IR, IP, IW, A→D, OCU', () => {
    const sxo = (id: string, q: string, over: Partial<Person> = {}) =>
      person(id, { sxo: true, band: 'instructor', q, ...over })
    const mixed = [
      sxo('s_a', 'A', { band: 'ops' }),
      sxo('s_iw', 'IW', { seat: 'wso' }),
      sxo('s_fi', 'FI'),
      sxo('s_ocu', 'OCU', { band: 'ops' }),
      sxo('s_ip', 'IP'),
      sxo('s_c', 'C', { band: 'ops' }),
      sxo('s_ir', 'IR'),
    ]
    expect(autoOrder(mixed)).toEqual(['s_fi', 's_ir', 's_ip', 's_iw', 's_a', 's_c', 's_ocu'])
  })
})

describe('catClass / catText — colours reuse Raptor\'s CAT palette', () => {
  it('colours ops crew by CAT letter, instructors and OCU and SXO their own', () => {
    expect(catClass(CREW[1])).toBe('q-a')       // ops A → red
    expect(catClass(CREW[5])).toBe('q-b')       // ops WSO B → amber
    expect(catClass(CREW[0])).toBe('q-ins')     // instructor → violet
    expect(catClass(CREW[6])).toBe('q-ocu')     // OCU → purple
    expect(catClass(CREW[7])).toBe('q-sxo')     // SXO → gold, whatever the CAT
    expect(catClass(CREW[8])).toBe('q-pers')    // ground crew → white
  })
  it('shows the CAT text, and the ops sub-heading only inside an ops group', () => {
    expect(catText(CREW[1])).toBe('A')
    expect(catText(CREW[8])).toBe('')           // ground crew show their label instead
    expect(opsCatOf(CREW[1])).toBe('A')
    expect(opsCatOf(CREW[0])).toBe('')          // instructor: no CAT sub-heading
    expect(opsCatOf(CREW[6])).toBe('')          // OCU is its own group, not a sub
  })
})

describe('orderedPeople — a saved order heals against a changed roster', () => {
  it('keeps the saved order, drops the departed, appends the newly arrived grouped', () => {
    const saved = ['ops_c', 'ins_p']            // a partial, hand order
    const out = orderedPeople(CREW, saved).map(p => p.id)
    expect(out.slice(0, 2)).toEqual(['ops_c', 'ins_p'])       // saved first
    expect(out).toHaveLength(CREW.length)                     // everyone present
    expect(out).toContain('gnd_1')                            // the rest appended
  })
  it('ignores an id that has left the roster', () => {
    const out = orderedPeople(CREW, ['ghost', 'ops_a']).map(p => p.id)
    expect(out[0]).toBe('ops_a')
    expect(out).not.toContain('ghost')
  })
})

describe('manning ignores ground crew entirely', () => {
  it('a personnel body counts toward no category, set or duty', () => {
    const grid = {}
    const withGnd = countsFor(CREW, grid, {}, '2026-02-02')
    const withoutGnd = countsFor(CREW.filter(p => !p.pers), grid, {}, '2026-02-02')
    expect(withGnd).toEqual(withoutGnd)
  })
})

describe('roster order + labels are admin-gated writers', () => {
  beforeEach(() => {
    lwInitStore(memoryBackend())
    setRole('admin')
    setPeople(CREW)
  })

  it('displayRoster falls back to the categorised order until one is set', () => {
    expect(displayRoster().map(p => p.id)).toEqual(autoOrder(CREW))
  })

  it('moveRosterRow reorders WITHIN a group and persists a hand order', () => {
    // ops_c and ops_a are both OPS P. Drag ops_c to sit before ops_a.
    moveRosterRow('ops_c', 'ops_a')
    const ids = displayRoster().map(p => p.id)
    expect(ids.indexOf('ops_c')).toBeLessThan(ids.indexOf('ops_a'))
    expect(getState().rosterOrder).toContain('ops_c')
  })

  it('a cross-group drag keeps a person in their own group (display is always grouped)', () => {
    // Drag ground crew up onto an SXO row: it does NOT leave the Personnel
    // group — the display groups by CAT, so a body cannot be dragged out of
    // the category its CAT puts it in.
    moveRosterRow('gnd_1', 'sxo_1')
    const roster = displayRoster()
    expect(groupOf(roster[0])).toBe('SXO')                  // SXO still leads
    expect(roster[roster.length - 1].id).toBe('gnd_1')      // ground crew still last
  })

  it('moveRosterRow: "before itself" is a no-op, and beforeId null moves to the end (review fix, 19 Aug 26)', () => {
    const before = displayRoster().map(p => p.id)
    // before-itself used to splice the row out, miss the indexOf, and silently
    // dump it at the END — the guard makes it the no-op it means
    moveRosterRow('ops_a', 'ops_a')
    expect(displayRoster().map(p => p.id)).toEqual(before)
    // null = the true end of the roster: the drag machine's "after the last
    // row" gesture resolves here (display grouping then holds it in its group)
    moveRosterRow('ops_a', null)
    const ids = displayRoster().map(p => p.id)
    expect(ids.indexOf('ops_a')).toBeGreaterThan(ids.indexOf('ops_c'))
  })

  it('autoSortRoster re-groups back to the categorised order', () => {
    setRosterOrder(['gnd_1', 'sxo_1'])
    autoSortRoster()
    expect(displayRoster().map(p => p.id)).toEqual(autoOrder(CREW))
  })

  it('a member cannot reorder or relabel', () => {
    setRole('member')
    moveRosterRow('gnd_1', 'sxo_1')
    expect(getState().rosterOrder).toEqual([])
    setPersLabel('gnd_1', 'Nope')
    expect(personLabel(getState().people.find(p => p.id === 'gnd_1')!)).toBe('Line')
  })

  it('a personnel label overrides the projected default, and clears back to it', () => {
    const gnd = () => getState().people.find(p => p.id === 'gnd_1')!
    setPersLabel('gnd_1', 'Avionics')
    expect(personLabel(gnd())).toBe('Avionics')
    setPersLabel('gnd_1', '')                    // empty clears the override
    expect(personLabel(gnd())).toBe('Line')
  })
})

describe('the manning count rows are admin-arrangeable and hideable', () => {
  beforeEach(() => {
    lwInitStore(memoryBackend())
    setRole('admin')
  })

  it('lists the seed manning rows in natural order until one is moved', () => {
    expect(manningRowIds()).toEqual(['sets', 'ip', 'iwso', 'instr', 'opsp', 'opsw', 'flp', 'wmp', 'sxo', 'scd', 'scn'])
    expect(orderedManningIds()).toEqual(manningRowIds())
  })

  it('moves a row and persists the hand order; the ends are clamped', () => {
    expect(moveManningRow('sxo', -1)).toBe(true)     // SXO up one, above WM P
    const ids = orderedManningIds()
    expect(ids.indexOf('sxo')).toBeLessThan(ids.indexOf('wmp'))
    expect(getState().manningOrder).toEqual(ids)
    expect(moveManningRow('sets', -1)).toBe(false)   // already first
  })

  it('hides and shows a row, and reset clears both order and hidden', () => {
    toggleManningRow('opsw')
    expect(getState().manningHidden).toContain('opsw')
    toggleManningRow('opsw')
    expect(getState().manningHidden).not.toContain('opsw')
    toggleManningRow('wmp')
    moveManningRow('sxo', -1)
    resetManning()
    expect(getState().manningHidden).toEqual([])
    expect(getState().manningOrder).toEqual([])
  })

  it('a member cannot reorder or hide a manning row', () => {
    setRole('member')
    expect(moveManningRow('sxo', -1)).toBe(false)
    toggleManningRow('opsw')
    expect(getState().manningOrder).toEqual([])
    expect(getState().manningHidden).toEqual([])
  })

  it('every row still appears after a partial reorder — none is dropped', () => {
    moveManningRow('sxo', -1)
    moveManningRow('flp', -1)
    // whatever the hand order, orderedManningIds is a permutation of the full set
    expect([...orderedManningIds()].sort()).toEqual([...manningRowIds()].sort())
  })

  // Drag-and-drop reorder (owner, 28 Aug 26 — replaced the ▲▼ arrows). Same
  // before-semantics as the roster's moveRosterRow.
  it('drag-moves a row before another and to the end; a member cannot', () => {
    moveManningRowTo('sxo', 'sets')                 // drop SXO before the top row
    expect(orderedManningIds()[0]).toBe('sxo')
    moveManningRowTo('sxo', null)                   // drop it at the very end
    expect(orderedManningIds().at(-1)).toBe('sxo')
    // nothing dropped — still a permutation of the full set
    expect([...orderedManningIds()].sort()).toEqual([...manningRowIds()].sort())
    // and a member is refused (the write is admin-gated)
    setRole('member')
    const before = orderedManningIds()
    moveManningRowTo('scd', 'sets')
    expect(orderedManningIds()).toEqual(before)
  })
})

describe('the roster stays a live projection of Raptor\'s PEOPLE', () => {
  const NEWID = 'zzz_test_gnd'
  const AIRID = 'zzz_test_ir'
  beforeEach(() => {
    raptorInitStore()
    lwInitStore(memoryBackend())
    setPeople(projectPeople())
    wireLeaveWarSync()
  })
  afterEach(() => { delete (PEOPLE as any)[NEWID]; delete (PEOPLE as any)[AIRID] })

  it('a body added on the Quals page appears in Leave War on the next notify', () => {
    expect(getState().people.some(p => p.id === NEWID)).toBe(false)
    // Add a ground-crew body the way the Quals page does, then let Raptor notify.
    ;(PEOPLE as any)[NEWID] = { cs: 'Newbie', seat: 'GND', pers: true, q: '', flight: 'Stores' }
    raptorNotify()
    const landed = getState().people.find(p => p.id === NEWID)
    expect(landed).toBeTruthy()
    expect(landed!.pers).toBe(true)
    expect(personLabel(landed!)).toBe('Stores')
    expect(groupOf(landed!)).toBe('PERS')
  })

  it('an in-session person edit is NOT reverted by the live re-projection', () => {
    // A deliberate setPerson override is recorded in state.personEdits and
    // re-applied over the fresh projection, so it survives the next Raptor
    // notify rather than snapping back to Raptor's projected value.
    setRole('admin')
    const someone = getState().people.find(p => !p.pers)!
    const flipped = someone.seat === 'pilot' ? 'wso' : 'pilot'
    setPerson(someone.id, { seat: flipped })
    raptorNotify()
    expect(getState().people.find(p => p.id === someone.id)!.seat).toBe(flipped)
  })

  it('an SXO marked in Quals reaches Leave War on the next notify (owner, 18 Aug 26)', () => {
    // An IR instructor pilot the way the Quals add-person path builds one — an
    // aircrew body with a CAT, no SXO yet.
    ;(PEOPLE as any)[AIRID] = { cs: 'Testir', seat: 'FCP', q: 'IR' }
    raptorNotify()
    const before = getState().people.find(p => p.id === AIRID)!
    expect(groupOf(before)).toBe('IP') // IR -> instructor band -> IP group

    // Mark SXO exactly as the fixed Quals tick now does: it sets the RAW p.sxo,
    // which is the flag the projection reads. Before the fix the tick set only
    // p.quals.sxo and this never propagated.
    ;(PEOPLE as any)[AIRID].sxo = true
    raptorNotify()
    const after = getState().people.find(p => p.id === AIRID)!
    expect(after.sxo).toBe(true)
    expect(groupOf(after)).toBe('SXO') // SXO wins over the flying category
  })

  /* The SC quals ride the same live projection (owner, 19 Aug 26 — "when I
     add or remove quals in the quals page, it will update the leave war"):
     an SC DAY / SC NIGHT tick is a change no other roster field carries, so
     the reprojection signature names them explicitly. */
  it('an SC DAY / SC NIGHT tick on the Quals page reaches Leave War on the next notify', () => {
    ;(PEOPLE as any)[AIRID] = { cs: 'Testir', seat: 'FCP', q: 'C', quals: {} }
    raptorNotify()
    expect(getState().people.find(p => p.id === AIRID)).toMatchObject({ scd: false, scn: false })
    // Tick SC DAY the way the Quals cell does — the raw quals flag.
    ;(PEOPLE as any)[AIRID].quals.scDay = true
    raptorNotify()
    expect(getState().people.find(p => p.id === AIRID)).toMatchObject({ scd: true, scn: false })
    // And untick it again — removal propagates the same way.
    ;(PEOPLE as any)[AIRID].quals.scDay = false
    raptorNotify()
    expect(getState().people.find(p => p.id === AIRID)).toMatchObject({ scd: false, scn: false })
  })

  /* The COUNT moves, not just the flag (owner, 19 Aug 26 — "it will update the
     leave war"): a manning counter filtering on the SC-day qualification reads
     one more the instant the Quals tick lands, end to end through the live
     projection. This is the whole point of the qual wiring — a field that
     propagated but never changed a count would be no use. */
  it('ticking SC DAY in Quals lifts an SC-day counter\'s count live', () => {
    const rc: RuleCount = { kind: 'people', filter: { quals: ['scDay'] } }
    const D = '2026-02-02'
    ;(PEOPLE as any)[AIRID] = { cs: 'Testir', seat: 'FCP', q: 'C', quals: {} }
    raptorNotify()
    const before = ruleHave(rc, getState().people, {}, {}, D)
    ;(PEOPLE as any)[AIRID].quals.scDay = true
    raptorNotify()
    const after = ruleHave(rc, getState().people, {}, {}, D)
    expect(after - before).toBe(1)
  })

  it('a Raptor CAT/seat change also propagates to an existing person', () => {
    ;(PEOPLE as any)[AIRID] = { cs: 'Testir', seat: 'FCP', q: 'IR' }
    raptorNotify()
    expect(groupOf(getState().people.find(p => p.id === AIRID)!)).toBe('IP')
    // Drop the CAT to an ops grade and move to the back seat.
    ;(PEOPLE as any)[AIRID].q = 'C'
    ;(PEOPLE as any)[AIRID].seat = 'RCP'
    raptorNotify()
    const after = getState().people.find(p => p.id === AIRID)!
    expect(after.seat).toBe('wso')
    expect(after.band).toBe('ops')
    expect(groupOf(after)).toBe('OPSW')
  })

  /* THE SANS ENABLE FUNCTION (owner, 18 Aug 26): hidden by default, and the
     admin switch puts them on the roster at once — the setShowSans write fires
     a Leave War notify, whose sync callback re-projects. */
  it('SANS are hidden by default, and the enable switch shows them at once', () => {
    for (const id of SANS_IDS) expect(getState().people.some(p => p.id === id)).toBe(false)
    expect(setShowSans(true), 'a member cannot flip it').toBe(false)
    setRole('admin')
    expect(setShowSans(true)).toBe(true)
    for (const id of SANS_IDS) expect(getState().people.some(p => p.id === id)).toBe(true)
    expect(getState().people.find(p => p.id === 'vinci')).toMatchObject({ seat: 'pilot', band: 'ops' })
    // and off again — the same switch is the hide
    expect(setShowSans(false)).toBe(true)
    for (const id of SANS_IDS) expect(getState().people.some(p => p.id === id)).toBe(false)
  })

  it('shown SANS survive a Raptor notify, and stay hidden after a re-hide', () => {
    setRole('admin')
    setShowSans(true)
    raptorNotify()
    expect(getState().people.some(p => p.id === 'vinci')).toBe(true)
    setShowSans(false)
    raptorNotify()
    expect(getState().people.some(p => p.id === 'vinci')).toBe(false)
  })

  it('archiving a person on the Quals page removes them from Leave War', () => {
    ;(PEOPLE as any)[AIRID] = { cs: 'Testir', seat: 'FCP', q: 'IR' }
    raptorNotify()
    expect(getState().people.some(p => p.id === AIRID)).toBe(true)
    // the Quals archive button sets p.archived; a body off Raptor's roster
    // must leave Leave War's too
    ;(PEOPLE as any)[AIRID].archived = true
    raptorNotify()
    expect(getState().people.some(p => p.id === AIRID)).toBe(false)
  })

  it('an archived body WITH a posting-out window is kept — the war still owns their history (19 Aug 26)', () => {
    ;(PEOPLE as any)[AIRID] = { cs: 'Testir', seat: 'FCP', q: 'IR' }
    raptorNotify()
    setRole('admin')
    setPostOut(AIRID, '2026-06-01', false)
    // The Quals ✕ (or the auto-archive pass) takes them out of the projection,
    // but a posted-out person's past months are still the war's record — the
    // month-window row filter is what hides them from the months after.
    ;(PEOPLE as any)[AIRID].archived = true
    raptorNotify()
    const kept = getState().people.find(p => p.id === AIRID)
    expect(kept).toBeTruthy()
    expect(kept!.to).toBe('2026-05-31')
    expect(kept!.poArchive).toBe(false)
  })

  it('posting-out survives a re-projection that rewrites the roster', () => {
    // Post one person out, then force a rewrite by changing a DIFFERENT person
    // in Raptor. The post-out window is Leave War's own and must be preserved.
    setRole('admin')
    ;(PEOPLE as any)[AIRID] = { cs: 'Testir', seat: 'FCP', q: 'IR' }
    raptorNotify()
    const other = getState().people.find(p => !p.pers && p.id !== AIRID)!
    setPostOut(other.id, '2026-06-01', false)
    expect(getState().people.find(p => p.id === other.id)!.to).toBe('2026-05-31')
    // a roster-visible change elsewhere forces reprojectRoster to write
    ;(PEOPLE as any)[AIRID].sxo = true
    raptorNotify()
    expect(getState().people.find(p => p.id === other.id)!.to).toBe('2026-05-31')
    // the archive choice is Leave War's own alongside the window — preserved too
    expect(getState().people.find(p => p.id === other.id)!.poArchive).toBe(false)
  })
})
