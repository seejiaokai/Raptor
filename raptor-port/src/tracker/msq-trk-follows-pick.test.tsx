// @vitest-environment jsdom
/* THE TRACKER FOLLOWS THE SQUADRON PICKED (his D2395, 23 Nov 26 — [MSQ-TRK-FOLLOWS-PICK]; it replaces D2318's "keeps the
   squadron it opened with until sign-out"). With Plan of 149, or as a master admin, picking 149 shows and edits 149's
   Tracker; picking 142 brings 142's back, with no sign-out. These records are a squadron's training records: one
   squadron's chart, marks or students landing in another's is the worst fault this job can have, so every test here reads
   the STORED records of both squadrons through the real door (storage/adapters.ts trackerTarget over one whiteboard, as
   src/boot.ts wires it), not only what the screen holds.
   Red first: before this change the door kept the squadron it loaded for the life of the page. */
import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useMsqWorld, signInAs, ACCT, PID, moveMan, pastMidnight } from '../test-support/msq-world'
import * as core from './app/core.js'
import * as st from './storage.js'
import { getPeople } from './people.js'
import { Whiteboard } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'
import { saveAccess, signIn, sessionFor } from '../state/accounts'
import { setSession, SESSION } from '../state/auth'
import { addUnit, setGrant, todayIso, units } from '../state/units'
import { pageUnit, setTrkUnitProbe } from '../state/perms'
import { notify, switchRoleView } from '../state/store'
import { pickSquadron, pickWillAsk } from '../state/pick'
import { trackerBand, trackerCover } from '../state/typing-hold'
import { trackerUndoApi } from './undo-bridge.js'
import { trackerMayLogOut } from './role.js'
import { wireTrackerPeople } from './peoplewire'
import { openNotice } from '../ui/topstate'
import { UNIT } from '../engine/unitview'
import type { Notice } from '../state/notices'

const C: any = core
const S: any = st
const wb = new Whiteboard()
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 800; i++) { if (f()) return; await tick() } throw new Error('timed out waiting') }
/* every run of the follow, and every load behind it, finished */
const settle = async () => { for (let i = 0; i < 4; i++) { await C.whenUnitSettled?.(); await C.whenLoaded(); await tick() } }
const pick = async (u: string) => { await act(async () => { await pickSquadron(u); await settle() }) }
/* each stored record of one squadron's Tracker, by its full key */
const recordsOf = (unit: string): Record<string, unknown> =>
  Object.fromEntries(wb.keys('tracker').filter(k => k.startsWith(unit + '@')).sort().map(k => [k, wb.get('tracker', k)]))
/* is an event in a stored chart DEFINITION of that squadron — never its layout, where a ball's place is saved at the drop */
const storedHas = (unit: string, needle: string) => Object.entries(recordsOf(unit))
  .some(([k, v]) => !k.includes(':lay') && String(v).includes(needle))

let board: HTMLElement | null = null
beforeAll(() => {
  S.setStorageMaker((u: string) => trackerTarget(wb, u), () => pageUnit('own', todayIso()))
  setTrkUnitProbe(() => S.storageUnit())
})
useMsqWorld()
afterAll(() => { board?.remove(); setTrkUnitProbe(null); S.setStorageMaker(null, null); S.setStorageImpl(null) })

function plan(level: 'plan' | 'view' = 'plan') {
  signInAs('saber')
  expect(saveAccess(ACCT.hunter, { grants: { u149: level } }), `${level} of 149 given`).toBeNull()
}
beforeEach(async () => {
  plan()
  signInAs('hunter')
  if (!board) {
    board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
    wireTrackerPeople()
    await C.init(); await C.whenLoaded()
  }
  await act(async () => { await settle() })
  if (C.sylDirty) await C.saveChangesClick()
  if (C.arrangeMode) C.toggleArrange()
  expect(S.storageUnit(), 'each test starts on 142\'s Tracker').toBe('u142')
})

/* an unsaved chart edit: a new event in Edit chart layout, the editor left */
async function editChart(name: string) {
  if (!C.arrangeMode) C.toggleArrange()
  const p = C.addModule('acad'); await until(() => C.dlg); C.dlgClose(name); await p
  C.toggleArrange()
  expect(C.sylDirty, 'the premise: an unsaved chart edit').toBe(true)
}
async function grade(ev: string, g: string) { C.openPop(ev, { clientX: 5, clientY: 5 }); await C.popGrade(g); await C.whenLoaded() }
function fromAnotherDevice(f: () => unknown): void {
  const mine = SESSION
  setSession(sessionFor(signIn('ad', 'a')))
  f()
  setSession(mine)
}

describe('a pick moves every read and write to the squadron picked', () => {
  it('Hunter (Plan of 149): edit and save on 149; 142 is exactly as it was; 149 again has the edit', async () => {
    const was142 = recordsOf('u142')
    await pick('u149')
    expect(S.storageUnit(), 'the Tracker is 149\'s').toBe('u149')
    await editChart('F149A'); await C.saveChangesClick()
    expect(storedHas('u149', 'F149A'), 'saved in 149\'s').toBe(true)
    expect(recordsOf('u142'), 'nothing of 142\'s changed').toEqual(was142)

    await pick('u142')
    expect(S.storageUnit()).toBe('u142')
    expect(C.byid.F149A, '149\'s ball is not on 142\'s chart').toBeFalsy()
    expect(recordsOf('u142'), 'still exactly as it was').toEqual(was142)

    await pick('u149')
    expect(C.byid.F149A, 'the edit is there').toBeTruthy()
  })

  it('an edit saved on 142 stays out of 149\'s, and the other way', async () => {
    await editChart('F142B'); await C.saveChangesClick()
    expect(storedHas('u142', 'F142B')).toBe(true)
    await pick('u149')
    expect(C.byid.F142B, 'nothing of 142\'s drawn as 149\'s').toBeFalsy()
    expect(storedHas('u149', 'F142B'), 'nothing of 142\'s stored in 149\'s').toBe(false)
  })

  it('the marks and the students are the squadron\'s own: a mark on 149 is not on 142', async () => {
    await pick('u149')
    const ev = C.SYL[0].id, who = C.active
    expect(who, 'the premise: 149 has a student').toBeTruthy()
    await grade(ev, 'dco')
    const key149 = Object.keys(recordsOf('u149')).filter(k => k.includes(':m:'))
    expect(key149.length).toBeGreaterThan(0)
    await pick('u142')
    expect(C.active, '142\'s own student').not.toBe(who)
    expect(C.marks[who], 'his marks are not held in 142\'s memory').toBeUndefined()
  })

  it('+ Add offers the squadron picked: its people cross with it', async () => {
    const before = getPeople().map((p: any) => p.id)
    await pick('u149')
    const after = getPeople().map((p: any) => p.id)
    expect(after).toContain(PID.kestrel)
    expect(after).not.toEqual(before)
  })

  it('his place on each squadron is kept: the course he was on in 142 comes back after a visit to 149', async () => {
    const start = C.course
    const add = C.addCourse(); await until(() => C.dlg); C.dlgClose('PLACE142'); await add; await C.whenLoaded()
    const mine = C.COURSES.find((c: any) => c.name === 'PLACE142').id
    await C.loadCourse(mine)
    expect(C.course).toBe(mine)
    await pick('u149')
    expect(C.COURSES.some((c: any) => c.id === mine), 'not a course of 149\'s').toBe(false)
    await pick('u142')
    expect(C.course, 'back on the course he was on').toBe(mine)
    await C.loadCourse(start)
  })

  it('a reload lands on his own squadron\'s Tracker, with both squadrons as saved', async () => {
    await pick('u149')
    await editChart('F149R'); await C.saveChangesClick()
    await pick('u142')
    vi.resetModules()
    const st2: any = await import('./storage.js')
    st2.setStorageMaker((u: string) => trackerTarget(wb, u), () => 'u142')
    const C2: any = await import('./app/core.js')
    await C2.init(); await C2.whenLoaded()
    expect(st2.storageUnit()).toBe('u142')
    expect(C2.byid.F149R, '142 reads as 142').toBeFalsy()
    const st3Reload = await reload('u149')
    expect(st3Reload.byid.F149R, '149 still has it').toBeTruthy()
  })

  it('a pick while the Tracker is still on its first load: that load finishes on its own squadron, then it moves', async () => {
    await pick('u149'); await pick('u142')   /* both squadrons have their records */
    const was142 = recordsOf('u142'), was149 = recordsOf('u149')
    vi.resetModules()
    const st2: any = await import('./storage.js')
    let whose = 'u142'
    st2.setStorageMaker((u: string) => trackerTarget(wb, u), () => whose)
    const C2: any = await import('./app/core.js')
    const booting = C2.init()                 /* running, not awaited */
    whose = 'u149'
    expect(st2.rebindStorageUnit('u149'), 'the pick, during the first load').toBe('moved')
    await booting; await C2.whenUnitSettled(); await C2.whenLoaded()
    expect(st2.storageUnit()).toBe('u149')
    expect(C2.ready).toBe(true)
    expect(recordsOf('u142'), '142\'s records untouched').toEqual(was142)
    expect(recordsOf('u149'), '149\'s records untouched').toEqual(was149)
    const on149 = JSON.stringify(Object.keys(recordsOf('u149')))
    for (const c of C2.COURSES) expect(on149, `course ${c.name} is one of 149's`).toContain(c.id)
  })
})
async function reload(unit: string) {
  vi.resetModules()
  const st2: any = await import('./storage.js')
  st2.setStorageMaker((u: string) => trackerTarget(wb, u), () => unit)
  const C2: any = await import('./app/core.js')
  await C2.init(); await C2.whenLoaded()
  return C2
}

describe('nothing in flight lands in the other squadron', () => {
  it('a question open on 142 at the pick is gone, and its job writes nothing into 149', async () => {
    await pick('u149'); await pick('u142')
    const was149 = recordsOf('u149')
    const job = C.addCourse(); await until(() => C.dlg)
    await pick('u149')
    expect(C.dlg, 'no question of 142\'s over 149\'s Tracker').toBeNull()
    await job
    expect(recordsOf('u149'), '149\'s records untouched').toEqual(was149)
  })

  it('a load of 142 still running at the pick does not land in 149', async () => {
    await pick('u149'); await pick('u142')
    const was149 = recordsOf('u149'), course142 = C.course
    const running = C.loadCourse(C.course)
    await pick('u149'); await running
    expect(C.course, '149\'s own course').not.toBe(course142)
    expect(recordsOf('u149')).toEqual(was149)
  })

  it('an import running at the pick stops: nothing of its file lands in 149', async () => {
    await pick('u149'); await pick('u142')
    const was149 = recordsOf('u149')
    const file = await C.collectCharts([C.curSylId()])
    file.sylcat = file.sylcat.map((e: any) => ({ ...e, id: e.id, name: 'FROM FILE' }))
    ;(window as any).__pickOpenForTests = async () => ({ text: JSON.stringify({ format: 'nope' }) })
    const job = C.importClick()
    await until(() => C.dlg)
    await pick('u149')
    await job
    delete (window as any).__pickOpenForTests
    expect(recordsOf('u149')).toEqual(was149)
    expect(C.dlg).toBeNull()
  })

  it('a mark pressed in the same moment as the pick is saved in 142 alone', async () => {
    await pick('u149'); await pick('u142')
    const was149 = recordsOf('u149'), ev = C.SYL[3].id, who = C.active, was = C.gradeOf(who, ev)
    C.openPop(ev, { clientX: 5, clientY: 5 })
    const g = was === 'dco' ? 'marg' : 'dco'
    const pressed = C.popGrade(g)
    await act(async () => { void pickSquadron('u149'); await pressed; await settle() })
    expect(S.storageUnit()).toBe('u149')
    expect(recordsOf('u149'), 'nothing of it in 149\'s').toEqual(was149)
    await pick('u142')
    expect(C.active).toBe(who)
    expect(C.gradeOf(who, ev), 'it is in 142\'s').toBe(g)
  })

  it('picking on, before the first move has finished: lands on the last one picked', async () => {
    await act(async () => { void pickSquadron('u149'); void pickSquadron('u142'); await settle() })
    expect(S.storageUnit()).toBe('u142')
    expect(UNIT).toBe('u142')
  })
})

describe('Undo and Redo never cross squadrons', () => {
  it('a step on 142 waits while 149 is in view, and works again back on 142', async () => {
    const ev = C.SYL[2].id, who = C.active, was = C.gradeOf(who, ev)
    await grade(ev, was === 'dco' ? 'marg' : 'dco')
    expect(C.canUndo(), 'the premise: a step to take back').toBe(true)
    await pick('u149')
    const was149 = recordsOf('u149')
    expect(C.canUndo(), '142\'s step is not offered on 149').toBe(false)
    await trackerUndoApi().doUndo()
    expect(recordsOf('u149'), 'nothing of 149\'s changed').toEqual(was149)
    await pick('u142')
    expect(C.canUndo(), 'it waited').toBe(true)
    await trackerUndoApi().doUndo()
    expect(C.gradeOf(who, ev), 'taken back on 142').toBe(was)
  })
  it('149\'s own step is 149\'s: undone there, and not on 142', async () => {
    await pick('u149')
    const ev = C.SYL[1].id, who = C.active, was = C.gradeOf(who, ev)
    await grade(ev, was === 'marg' ? 'dco' : 'marg')
    await pick('u142')
    expect(C.canUndo()).toBe(false)
    await pick('u149')
    expect(C.canUndo()).toBe(true)
    await C.doUndo()
    expect(C.gradeOf(who, ev)).toBe(was)
  })
})

describe('the other doors in', () => {
  const lineOf149 = () => ({ id: 'tl9', to: PID.hunter, by: null, at: Date.now(), iid: '', name: '', day: '2026-07-15',
    what: [{ k: 'po', who: PID.osprey, o: 'none' }], u: 'u149' } as unknown as Notice)

  it('a bell tap that enters 149 is a pick: the Tracker follows', async () => {
    await act(async () => { openNotice(lineOf149()); await settle() })
    expect(UNIT).toBe('u149')
    expect(S.storageUnit()).toBe('u149')
    expect(trackerCover()).toBeNull()
  })

  it('a bell tap with unsaved edits asks first; after Discard it follows', async () => {
    await editChart('F142C')
    await act(async () => { openNotice(lineOf149()); await until(() => C.dlg); C.dlgClose('__alt__'); await settle() })
    expect(S.storageUnit()).toBe('u149')
    expect(C.byid.F142C, 'discarded, and 142\'s ball is not drawn on 149').toBeFalsy()
    expect(storedHas('u149', 'F142C')).toBe(false)
  })

  it('the two bands are gone: nothing covers the Tracker after a pick', async () => {
    await pick('u149')
    expect(trackerCover()).toBeNull()
    await pick('u142')
    expect(trackerCover()).toBeNull()
  })

  it('a pick of a squadron he only views keeps his own Tracker, not offered there (D2381)', async () => {
    plan('view'); signInAs('hunter')
    await act(async () => { await settle() })
    await pick('u149')
    expect(UNIT).toBe('u149')
    expect(S.storageUnit(), 'his own, never 149\'s').toBe('u142')
    expect(trackerCover()).toBeNull()
  })
})

describe('his own move at midnight (D2243)', () => {
  it('the chart editor open at midnight keeps its band and its squadron; Close, and the Tracker follows', async () => {
    moveMan(PID.ranger, 'u149'); signInAs('ranger')
    await act(async () => { await settle() })
    C.toggleArrange()
    await act(async () => { pastMidnight(); notify(); await settle() })
    expect(trackerBand()?.lead).toBe("You are 149's from today.")
    expect(S.storageUnit(), 'held under the band').toBe('u142')
    await act(async () => { C.toggleArrange(); await settle() })
    expect(S.storageUnit(), 'the editor closed: it follows').toBe('u149')
    expect(trackerBand()).toBeNull()
  })

  it('no editor open: the Tracker simply follows him at midnight', async () => {
    moveMan(PID.ranger, 'u149'); signInAs('ranger')
    await act(async () => { await settle() })
    await act(async () => { pastMidnight(); notify(); await settle() })
    expect(S.storageUnit()).toBe('u149')
    expect(trackerCover()).toBeNull()
  })

  it('unsaved edits at midnight stay held, unsaved in either squadron, until he drops them', async () => {
    moveMan(PID.ranger, 'u149'); signInAs('ranger')
    await act(async () => { await settle() })
    await editChart('F-MIDNIGHT')
    await act(async () => { pastMidnight(); notify(); await settle() })
    expect(S.storageUnit()).toBe('u142')
    expect(C.byid['F-MIDNIGHT'], 'his draft is kept').toBeTruthy()
    expect(storedHas('u142', 'F-MIDNIGHT')).toBe(false)
    expect(storedHas('u149', 'F-MIDNIGHT')).toBe(false)
    /* the sign-out's question is the door he has here: Discard them */
    let out: any
    await act(async () => { out = trackerMayLogOut(); await until(() => C.dlg); C.dlgClose('__alt__'); await out; await settle() })
    expect(S.storageUnit(), 'dropped: it follows').toBe('u149')
  })
})

describe('the member view', () => {
  it('unsaved edits on 149 at the switch: the Tracker keeps them, its band says how to get back, and back it is whole', async () => {
    await pick('u149')
    await editChart('F-MEMBER')
    await act(async () => { switchRoleView(); await settle() })
    expect(S.storageUnit(), 'the draft is not thrown away').toBe('u149')
    expect(trackerCover()?.lead).toBe("This is 149's Tracker.")
    expect(trackerCover()?.rest).toBe('Leave the member view to open it.')
    await act(async () => { switchRoleView(); await settle() })
    expect(trackerCover()).toBeNull()
    expect(C.byid['F-MEMBER'], 'his edit is still there').toBeTruthy()
    await C.saveChangesClick()
    await act(async () => { await settle() })
    expect(storedHas('u149', 'F-MEMBER')).toBe(true)
    expect(S.storageUnit(), 'back on 149 and saved: the hold is over and the door stays on the squadron his pages are on').toBe('u149')
  })

  it('nothing unsaved: the member view on 149 puts the Tracker on his own squadron, and back follows the pick', async () => {
    await pick('u149')
    await act(async () => { switchRoleView(); await settle() })
    expect(S.storageUnit()).toBe('u142')
    expect(trackerCover()).toBeNull()
    await act(async () => { switchRoleView(); await settle() })
    expect(S.storageUnit()).toBe('u149')
  })

  it('held on 149 in the member view, a pick of 142 asks about the edits first', async () => {
    await pick('u149')
    await editChart('F-MEMBER2')
    await act(async () => { switchRoleView(); await settle() })
    expect(pickWillAsk('u142'), 'the question comes first').toBe(true)
    let done: any
    await act(async () => { done = pickSquadron('u142'); await until(() => C.dlg) })
    expect(C.dlg.msg).toContain('Save them before switching to 142?')
    await act(async () => { C.dlgClose('__alt__'); await done; await settle() })
    expect(UNIT).toBe('u142')
    expect(S.storageUnit(), 'dropped, it follows').toBe('u142')
    expect(storedHas('u149', 'F-MEMBER2')).toBe(false)
  })
})

describe('a right taken away while its squadron is in view', () => {
  it('never another squadron\'s chart, never a write: the Tracker goes home, and the draft is said not saved', async () => {
    await pick('u149')
    await editChart('F-LOST')
    const was149 = recordsOf('u149')
    await act(async () => {
      fromAnotherDevice(() => expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)).toMatchObject({ ok: true }))
      notify(); await settle()
    })
    expect(UNIT, 'the pick goes home or stays only as View').toBeDefined()
    expect(S.storageUnit(), 'his own squadron\'s Tracker').toBe('u142')
    expect(trackerCover()).toBeNull()
    expect(C.byid['F-LOST'], 'nothing of 149\'s kept on screen').toBeFalsy()
    expect(recordsOf('u149'), 'nothing written into 149\'s').toEqual(was149)
    expect(storedHas('u142', 'F-LOST')).toBe(false)
    expect(C.saveWords().text, 'the draft is said not saved, in the words the app already has').toContain(C.NOT_SAVED)
  })
})

describe('a master admin going through his squadrons', () => {
  it('a squadron with no Tracker data yet opens empty and saves as its own; eight squadrons, each its own', async () => {
    signInAs('saber')
    await act(async () => { await settle() })
    C.setTrackerSeedDemo(false)
    try {
      const nums = ['151', '152', '153', '154', '155', '156']
      const made: string[] = []
      for (const n of nums) {
        const r: any = addUnit(n, { name: 'Place ' + n, tz: 'Asia/Singapore' }, ACCT.hunter)
        expect(r, `squadron ${n} made`).toMatchObject({ ok: true })
        made.push(units().find((x: any) => x.num === n)!.id)
      }
      const was142 = recordsOf('u142')
      for (const u of made) {
        await pick(u)
        expect(S.storageUnit(), `on ${u}`).toBe(u)
        expect(C.COURSES, `${u} has no course yet`).toEqual([])
      }
      /* the first course of one of them is its own */
      const u = made[2]!
      await pick(u)
      const add = C.addCourse(); await until(() => C.dlg); C.dlgClose('NEW153'); await add; await C.whenLoaded()
      expect(storedHas(u, 'NEW153'), 'saved in its own').toBe(true)
      for (const o of made) if (o !== u) expect(storedHas(o, 'NEW153'), `not in ${o}`).toBe(false)
      expect(storedHas('u142', 'NEW153')).toBe(false)
      await pick('u142')
      expect(C.COURSES.some((c: any) => c.name === 'NEW153'), 'not on 142\'s list').toBe(false)
      expect(recordsOf('u142')).toEqual(was142)
      await pick(u)
      expect(C.COURSES.map((c: any) => c.name)).toEqual(['NEW153'])
    } finally { C.setTrackerSeedDemo(true) }
  })
})

describe('nothing of the old squadron stays live over the new one', () => {
  it('the chart editor, its dialogs, the marking pop-up and every open window close at the pick', async () => {
    C.toggleArrange()
    await pick('u149')
    expect(C.arrangeMode, 'Edit chart layout').toBe(false)
    await pick('u142')
    C.openPop(C.SYL[0].id, { clientX: 5, clientY: 5 })
    expect(C.pop).toBeTruthy()
    await pick('u149')
    expect(C.pop, 'the marking pop-up').toBeNull()
    await pick('u142')
    C.openShowAll()
    await pick('u149')
    expect(C.showAllOpen).toBe(false)
    expect(C.editId).toBeNull()
    expect(C.sylModalOpen).toBe(false)
    expect(C.copyOpen).toBe(false)
    expect(C.ordMode).toBeNull()
  })
})
