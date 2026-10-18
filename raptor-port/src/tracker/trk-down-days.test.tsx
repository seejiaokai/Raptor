// @vitest-environment jsdom
/* THE TRACKER'S DOWN DAYS, WORKED OUT FROM THE INPUTS (owner D1002, D1003, D1005, D1018 — 18 Oct 26; approved "as
   recommended" on the pictures docs/img/handpass/2026-10-18-trk-down-days/). Written before the code, each seen red first.
   - the Info panel's "Upchit Date" box and the typed "No. of Down Days" box are gone (D1002, D1005);
   - a COURSE START per student, kept with his pace (per course, whatever the chart): set in "+ Add" (today by default, the
     box above the list) and changed in the Info panel, where the Upchit box was (D1003, D1018);
   - the number is every medical day of his (HL, OML, ATT C, ATT B) from the course start to today: a half day counts ½,
     an input still running counts to today, only inputs that overlap that span count; "—" and one line before a course
     start; "—" for a student who is no man on the roster;
   - a tap on the number opens a window, cloned from the Failures list: one row per input, its days, the cut line only
     where the input keeps the end it was filed with (D999's firstEnd); it only shows — Escape, a tap outside or ✕ close
     it and the keyboard goes back to the number;
   - the medical days cross from Raptor on the people bridge's third channel (people.js, no imports), worked out on
     Raptor's side into plain ISO dates (peoplewire.ts) — the Tracker never reads Raptor's store. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import * as core from './app/core.js'
import { storage } from './storage.js'
import { setPeople, setMedInputs, getMedInputs, onMedInputs } from './people.js'
import { medForTracker, wireTrackerPeople } from './peoplewire'
import { initStore, resetSession } from '../state/store'
import { INPUTS } from '../engine/inputs'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const C: any = core
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 800; i++) { if (f()) return; await tick() } throw new Error('timed out waiting for the app') }
const press = (el: Element) => act(async () => { (el as HTMLElement).click(); await tick() })
const key = (el: Element, k: string) => act(async () => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })) })

/* ISO days, written here apart from core.js (UTC, so no device clock moves them) */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const ms = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))
const add = (iso: string, n: number) => new Date(ms(iso) + n * 864e5).toISOString().slice(0, 10)
const dm = (iso: string) => `${+iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]}`
const dmy = (iso: string) => `${dm(iso)} ${iso.slice(0, 4)}`
const span = (a: string, b: string) => a === b ? dm(a)
  : a.slice(0, 7) === b.slice(0, 7) ? `${+a.slice(8, 10)}–${dm(b)}`
  : a.slice(0, 4) === b.slice(0, 4) ? `${dm(a)} – ${dm(b)}`
  : `${dmy(a)} – ${dmy(b)}`

const T = () => C.isoToday()
const PID = 'pZen'
/* his medical inputs, relative to today; the course start 60 days ago */
const medRows = () => {
  const t = T()
  return [
    { iid: 'm1', type: 'ATT B', startIso: add(t, -70), endIso: add(t, -58), half: '' },          /* straddles the start: 3 */
    { iid: 'm2', type: 'HL', startIso: add(t, -40), endIso: add(t, -39), half: '' },             /* 2 */
    { iid: 'm3', type: 'OML', startIso: add(t, -30), endIso: add(t, -30), half: 'am' },          /* ½ */
    { iid: 'm4', type: 'ATT C', startIso: add(t, -20), endIso: add(t, -19), half: '', firstEnd: add(t, -15), cutOn: add(t, -18) }, /* 2, cut */
    { iid: 'm5', type: 'ATT B', startIso: add(t, -3), endIso: add(t, 5), half: '' },             /* still running: 4 */
    { iid: 'm6', type: 'HL', startIso: add(t, -90), endIso: add(t, -80), half: '' },             /* before the start: none */
    { iid: 'm7', type: 'OML', startIso: add(t, 2), endIso: add(t, 4), half: '' },                /* not yet: none */
  ]
}

let host: HTMLElement, root: any
beforeAll(async () => {
  initStore()
  resetSession({ user: 'ad', role: 'admin' })
  const { default: App } = await import('./App.jsx')
  host = document.createElement('div')
  host.innerHTML = '<section class="page on" id="page-tracker"></section>'
  document.body.appendChild(host)
  root = createRoot(host.querySelector('#page-tracker')!)
  await act(async () => { root.render(<App active={true} />) })
  await act(async () => { await C.whenLoaded(); await new Promise(r => setTimeout(r, 50)) })
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })

describe('the people bridge\'s third channel — each man\'s medical days (people.js)', () => {
  it('the same days twice notify once; a changed day notifies', () => {
    let n = 0
    const off = onMedInputs(() => { n++ })
    setMedInputs({ a: [{ iid: 'x', type: 'HL', startIso: '2026-01-01', endIso: '2026-01-02', half: '' }] })
    expect(n).toBe(1)
    const first = getMedInputs()
    setMedInputs({ a: [{ iid: 'x', type: 'HL', startIso: '2026-01-01', endIso: '2026-01-02', half: '' }] })
    expect(n, 'same content, a fresh copy: nobody told').toBe(1)
    expect(getMedInputs()).toBe(first)
    setMedInputs({ a: [{ iid: 'x', type: 'HL', startIso: '2026-01-01', endIso: '2026-01-03', half: '' }] })
    expect(n, 'a changed end notifies').toBe(2)
    off(); setMedInputs({})
    expect(getMedInputs()).toEqual({})
  })
})

describe('Raptor\'s side: each man\'s downchits as plain ISO days (peoplewire.ts medForTracker)', () => {
  it('HL, OML, ATT C and ATT B count; anything else does not; dates resolved through the row\'s own year', () => {
    const out = medForTracker([
      { iid: 'a', person: 'p1', type: 'ATT B', date: 'Jun 15', endDate: 'Jun 19', yr: 2026, allday: true },
      { iid: 'b', person: 'p1', type: 'OML', date: 'Sep 7', yr: 2026, allday: false, half: 'am' },
      { iid: 'c', person: 'p1', type: 'Upchit', date: 'Jun 20', yr: 2026, allday: true },
      { iid: 'd', person: 'p1', type: 'Leave', date: 'Jul 1', endDate: 'Jul 3', yr: 2026, allday: true },
      { iid: 'e', person: 'p2', type: 'HL', date: 'Dec 30', endDate: 'Jan 2 2027', yr: 2026, allday: true },
      { iid: 'f', person: 'p2', type: 'att c', date: 'Feb 3', yr: 2027, allday: true },
    ])
    expect(Object.keys(out).sort()).toEqual(['p1', 'p2'])
    expect(out.p1).toEqual([
      { iid: 'a', type: 'ATT B', startIso: '2026-06-15', endIso: '2026-06-19', half: '' },
      { iid: 'b', type: 'OML', startIso: '2026-09-07', endIso: '2026-09-07', half: 'am' },
    ])
    expect(out.p2.map((r: any) => [r.type, r.startIso, r.endIso])).toEqual([['HL', '2026-12-30', '2027-01-02'], ['ATT C', '2027-02-03', '2027-02-03']])
  })
  it('a half day is only one that is not all day; an unreadable date is left out, never guessed', () => {
    const out = medForTracker([
      { iid: 'a', person: 'p1', type: 'OML', date: 'Sep 7', yr: 2026, allday: true, half: 'pm' },
      { iid: 'b', person: 'p1', type: 'HL', date: 'Smarch 4', yr: 2026, allday: true },
    ])
    expect(out.p1).toEqual([{ iid: 'a', type: 'OML', startIso: '2026-09-07', endIso: '2026-09-07', half: '' }])
  })
  it('an input an upchit cut keeps the end it was filed with (D999): the cut day and that first end cross with it', () => {
    const out = medForTracker([
      { iid: 'a', person: 'p1', type: 'ATT C', date: 'Sep 21', endDate: 'Sep 22', firstEnd: '2026-09-25', yr: 2026, allday: true },
      { iid: 'u', person: 'p1', type: 'Upchit', date: 'Sep 23', yr: 2026, allday: true },
      { iid: 'b', person: 'p1', type: 'HL', date: 'Oct 1', endDate: 'Oct 2', yr: 2026, allday: true },
    ])
    expect(out.p1[0]).toEqual({ iid: 'a', type: 'ATT C', startIso: '2026-09-21', endIso: '2026-09-22', half: '', firstEnd: '2026-09-25', cutOn: '2026-09-23' })
    expect(out.p1[1], 'no first end kept: no cut').toEqual({ iid: 'b', type: 'HL', startIso: '2026-10-01', endIso: '2026-10-02', half: '' })
  })
  it('the demo world\'s own man: Zenith\'s ATT B in June crosses as plain days', () => {
    const z = medForTracker(INPUTS).vinci || []
    expect(z.some((r: any) => r.type === 'ATT B' && r.startIso === '2026-06-15' && r.endIso === '2026-06-19'), JSON.stringify(z)).toBe(true)
  })
})

describe('D1003, D1018 — the course start, set in "+ Add"', () => {
  it('"+ Add" shows a Course start box ABOVE the list, today by default; the day picked there is his course start, kept with his pace', async () => {
    setPeople([{ id: PID, cs: 'ZEN', seat: 'FCP', q: 'OCU', sxo: false }])
    await act(async () => { C.addStudent(); await tick() })
    await until(() => $('#dlgModal'))
    const box = $('#dlgModal #dlgDate')
    expect(box, 'a date box in the add box').toBeTruthy()
    expect(box!.tagName).toBe('BUTTON')
    expect(box!.getAttribute('data-value'), 'today by default').toBe(T())
    expect(box!.closest('.field')!.querySelector('label')!.textContent).toBe('Course start')
    /* above the list: a tap on a name adds him at once */
    const list = $('#dlgModal #dlgList')!
    expect(box!.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING, 'the box comes before the list').toBeTruthy()
    const start = add(T(), -60)
    await act(async () => { C.setDlgDate(start); await tick() })
    expect($('#dlgModal #dlgDate')!.getAttribute('data-value')).toBe(start)
    await act(async () => { C.dlgClose({ pick: PID }); await tick() })
    await until(() => C.roster.some((r: any) => r.pid === PID))
    const s = C.roster.find((r: any) => r.pid === PID).id
    expect(C.active).toBe(s)
    expect(C.paceOf(s).courseStart).toBe(start)
    await until(async () => true)
    const kept = await storage.get('v3:' + C.course + ':pace:' + s)
    expect(JSON.parse(kept!.value).courseStart, 'saved with his pace').toBe(start)
    expect(C.paceOf(s).epw, 'the pace keeps its default').toBe(2)
  })

  it('a student typed with no roster gets the same box, today by default', async () => {
    setPeople([])
    await act(async () => { C.addStudent(); await tick() })
    await until(() => $('#dlgModal'))
    expect($('#dlgModal #dlgDate')!.getAttribute('data-value')).toBe(T())
    await act(async () => { C.dlgClose(null); await tick() })
    setPeople([{ id: PID, cs: 'ZEN', seat: 'FCP', q: 'OCU', sxo: false }])
  })
})

describe('D1002, D1005, D1018 — the Info panel', () => {
  const zen = () => C.roster.find((r: any) => r.pid === PID).id
  it('the Upchit Date box and the typed down-days box are gone; Course start sits where Upchit was, then the number', async () => {
    await act(async () => { C.setActive(zen()); await tick() })
    expect($('#upchit'), 'no Upchit box').toBeNull()
    expect($('input#downDays'), 'no typed box').toBeNull()
    const f = [...document.querySelectorAll('.c-curr .curGrid > .field')].map(x => x.querySelector('label')!.textContent)
    expect(f).toEqual(['Last Flown (Syllabus)', 'Last Flown (Currency)', 'Course start', 'No. of Down Days'])
    const cs = $('#courseStart')!
    expect(cs.tagName).toBe('BUTTON')
    expect(cs.getAttribute('data-value')).toBe(add(T(), -60))
    expect(cs.parentElement!.querySelector('.trdate-x'), 'set once, changed by picking another day — nothing to take off').toBeNull()
  })

  it('a course start changed in the Info panel is saved with his pace and is one undo step', async () => {
    const s = zen(), was = C.paceOf(s).courseStart
    expect(await C.setCourseStart(s, add(T(), -61)) || '').toBe('')
    expect(C.paceOf(s).courseStart).toBe(add(T(), -61))
    expect(C.undoWhat()).toBe('the course start for ZEN')
    await act(async () => { await C.doUndo() })
    expect(C.paceOf(s).courseStart).toBe(was)
  })

  it('the number: every medical day since the course start to today — a half day ½, a running one to today, only those that overlap', async () => {
    setMedInputs({ [PID]: medRows() })
    const d = C.downDaysOf(zen())
    expect(d.total).toBe(11.5)
    expect(d.rows.map((r: any) => [r.iid, r.days])).toEqual([['m1', 3], ['m2', 2], ['m3', 0.5], ['m4', 2], ['m5', 4]])
    await act(async () => { await tick() })
    const n = $('#downDays')!
    expect(n.tagName).toBe('BUTTON')
    expect(n.querySelector('.datebox-txt')!.textContent).toBe('11½ days')
    expect(n.querySelector('.datebox-v')!.textContent).toBe('›')
    expect(n.getAttribute('aria-label')).toBe('No. of Down Days: 11½ days — show each medical input')
    expect(n.closest('.trdatebox')!.querySelector('.datewarn'), 'nothing to prompt').toBeNull()
  })

  it('the words for a count: ½ day, 1 day, 0 days, 14½ days', () => {
    expect([0.5, 1, 0, 14.5, 2].map(C.sayDays)).toEqual(['½ day', '1 day', '0 days', '14½ days', '2 days'])
  })

  it('a tap opens the window: one row per input, its days, the cut line and the running line, and the footer', async () => {
    await press($('#downDays')!)
    const w = $('#downLog')!
    expect(w, 'the window').toBeTruthy()
    expect(w.querySelector('.lullhd b')!.textContent).toBe('Down days — ZEN')
    expect(w.querySelector('.lullhd .failtot')!.textContent).toBe('11½ days')
    const rows = [...w.querySelectorAll('.frow')] as HTMLElement[]
    const r = medRows()
    expect(rows.map(x => x.querySelector('.chip')!.textContent)).toEqual(['ATT B', 'HL', 'OML', 'ATT C', 'ATT B'])
    expect(rows.map(x => x.querySelector('.dd-when')!.textContent)).toEqual([
      span(r[0].startIso, r[0].endIso), span(r[1].startIso, r[1].endIso), span(r[2].startIso, r[2].endIso) + ' (AM)',
      span(r[3].startIso, r[3].endIso), span(r[4].startIso, r[4].endIso)])
    expect(rows.map(x => x.querySelector('.dd-days')!.textContent)).toEqual(['3 days', '2 days', '½ day', '2 days', '4 days'])
    expect(rows[3].querySelector('.mini')!.textContent).toBe(`cut by an upchit on ${dm(r[3].cutOn!)} · filed to ${dm(r[3].firstEnd!)}`)
    expect(rows[3].querySelector('.mini s')!.textContent, 'the first end struck').toBe(dm(r[3].firstEnd!))
    expect(rows[4].querySelector('.mini')!.textContent).toBe('still running · counted to today')
    for (const i of [0, 1, 2]) expect(rows[i].querySelector('.mini'), 'no line under a plain row').toBeNull()
    expect(w.querySelector(':scope > .mini')!.textContent).toBe(`Since the course start, ${dmy(add(T(), -60))}. Medical inputs are changed on the Inputs page.`)
    expect(w.querySelector('input, button.datebox'), 'it only shows — nothing to change in it').toBeNull()
  })

  it('Escape closes it and the keyboard goes back to the number', async () => {
    expect($('#downLog')).toBeTruthy()
    await key(document.activeElement || document.body, 'Escape')
    await act(async () => { await tick() })
    expect($('#downLog')).toBeNull()
    expect(document.activeElement).toBe($('#downDays'))
  })

  it('✕ and a tap outside close it too', async () => {
    await press($('#downDays')!)
    await press($('#downLogClose')!)
    expect($('#downLog')).toBeNull()
    expect(document.activeElement).toBe($('#downDays'))
    await press($('#downDays')!)
    await press($('#side > .lullback')!)
    expect($('#downLog')).toBeNull()
  })

  it('before a course start: "—" and the one-line prompt; the number opens nothing', async () => {
    const s = zen(), was = C.paceOf(s).courseStart
    await act(async () => { await C.setCourseStart(s, ''); await tick() })
    expect(C.downDaysOf(s).total).toBeNull()
    const n = $('#downDays')!
    expect(n.querySelector('.datebox-txt')!.textContent).toBe('—')
    expect(n.closest('.trdatebox')!.querySelector('.datewarn')!.textContent).toBe('Set the course start to count them.')
    await press(n)
    expect($('#downLog')).toBeNull()
    await act(async () => { await C.setCourseStart(s, was); await tick() })
  })

  it('a student who is no man on the roster shows "—" and no prompt', async () => {
    const typed = C.roster.find((r: any) => !r.pid)
    expect(typed, 'the premise: a typed student on the course').toBeTruthy()
    await act(async () => { await C.setCourseStart(typed.id, add(T(), -10)); C.setActive(typed.id); await tick() })
    expect(C.downDaysOf(typed.id).total).toBeNull()
    expect($('#downDays')!.querySelector('.datebox-txt')!.textContent).toBe('—')
    expect($('#downDays')!.closest('.trdatebox')!.querySelector('.datewarn')).toBeNull()
  })

  it('a course start after today counts nothing yet; a man with no medical days reads 0 days', async () => {
    const s = zen(), was = C.paceOf(s).courseStart
    await act(async () => { C.setActive(s); await C.setCourseStart(s, add(T(), 3)); await tick() })
    expect(C.downDaysOf(s)).toMatchObject({ total: 0, rows: [] })
    await act(async () => { await C.setCourseStart(s, was); setMedInputs({}); await tick() })
    expect($('#downDays')!.querySelector('.datebox-txt')!.textContent).toBe('0 days')
    await press($('#downDays')!)
    expect($('#downLog .mini')!.textContent).toBe('No medical inputs since the course start.')
    await key(document.body, 'Escape')
    setMedInputs({ [PID]: medRows() })
  })

  it('a stored record from before keeps loading: an old upchit and typed down days are left where they are, unread (D56)', async () => {
    const s = zen()
    ;(C.dates as any)[s].upchit = '2026-01-01'; (C.dates as any)[s].downDays = '7'
    await act(async () => { C.setActive(s); await tick() })
    expect(C.downDaysOf(s).total, 'the typed figure counts for nothing').toBe(11.5)
    expect($('#downDays')!.querySelector('.datebox-txt')!.textContent).toBe('11½ days')
    delete (C.dates as any)[s].upchit; delete (C.dates as any)[s].downDays
  })
})

describe('the course start travels in a backup, as part of his pace', () => {
  it('Export carries it; the record it reads back is the one written', async () => {
    const s = C.roster.find((r: any) => r.pid === PID).id
    let text = ''
    ;(window as any).__pickSaveForTests = async (name: string) => ({ name, createWritable: async () => ({ write: async (t: string) => { text = t }, close: async () => {} }) })
    C.openCopy(); C.setCopyOpt('students', true)
    const p: Promise<any> = C.saveCopyClick()
    await until(() => C.dlg || text)
    if (C.dlg) C.dlgClose(true)
    await p
    const f = JSON.parse(text)
    const block = f.students.byCourse[C.course]
    expect(block.pace[s].courseStart).toBe(C.paceOf(s).courseStart)
    delete (window as any).__pickSaveForTests
  })
})

describe('the wire: Raptor pushes the medical days on every change (peoplewire.ts)', () => {
  it('wired, the bridge carries the demo man\'s downchits', () => {
    wireTrackerPeople()
    expect((getMedInputs() as any).vinci?.some((r: any) => r.type === 'ATT B' && r.startIso === '2026-06-15'), 'Zenith\'s June ATT B').toBe(true)
  })
})
