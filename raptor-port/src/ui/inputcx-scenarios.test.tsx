// @vitest-environment jsdom
/* A CANCELLED INPUT'S LOOK — THE SECOND SCENARIO PASS ([ALL-AVAIL-AS-MEMBER] step 5, 12 Oct 26; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.5, §8 Q2 and Q3, §10 "Step 5"). Written by a helper who did not
   write the build, beside the builder's own ui/inputcx.test.tsx — which holds the look itself; this file holds the
   cases that one does not reach. His rulings:
   D760 — a CX on a row that came from an input cancels the INPUT; "the Inputs calendar shows it cancelled with its
           reason" — it stays listed, it is not deleted; "it goes with the input if it moves; the red box and
           'information only' go with the input too, shown on the schedule only".
   D767 — on the card and the List's row a small red CX tag before the title, the title struck through, the reason
           after it in red; on the month's bar the words struck through and the bar faded, no tag; where there is no
           room for the reason it is left out. Readings: (1) names, hours, LATE and "By Saber" untouched, the remark
           follows the reason; (2) an input with no title of its own strikes its kind's name; (3) the schedule's own
           line under Personal Inputs wears the red CX tag and the struck name; (4) no reason typed — the tag alone.
   D768 — a cancelled input keeps its place in the day's order — never sorted last.
   D721, D723, D724, D727 — every name shown, "By Saber", the kind's pill on the desktop list — must still hold.
   D728 — "till 17 Jul" is said once. D737 — under Unavailable an input of several is one row a person.
   D741 — nothing the scheduler does on the schedule makes an input read late.

   PART ONE drives the Inputs pages on records as the one-rule build stores them (ui/inputcx.test.tsx's harness);
   PART TWO files and cancels by the board's real CX button on a real saved store (ui/inputmarks-scenarios.test.tsx's
   harness) and reads the schedule's own lines. Every input of part two carries the word MARK in its remark, by which
   its record, its row and its lines are found whatever its title is. A last block reads the STYLESHEET for what the
   classes do — the strike, the fade, the red — which no case that runs without a layout can see.

   ONE PRODUCT FAULT WAS SHOWN BY THIS FILE — fixed the same day, its two cases kept as the pin. As the helper wrote it:
   ONE PRODUCT FAULT IS SHOWN, NOT PINNED: the block "the 'To go out' line of an input cancelled on a published day"
   holds two cases left FAILING for the builder (ui/pendlist.ts inputWords). */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, commitInput, draftOf } from './inputedit'
import { dayEntries } from './InputsCal'
import { cardOf, cxSays } from './inputcard-model'
import { monthItems, barText } from './inputscal-model'
import { dayHTML } from './html'
import { boardMbtn, cxCommit, CXT, boardHTML } from './board'
import { peekDayHTML } from './peek'
import { pendListHTML } from './pendlist'
import { commitChipMove } from './caldrag'
import { rowMark } from './reqdoor'
import * as pops from './pops'
import { _resetFloatWins } from './FloatWindow'
import { initStore, notify, setSession, writeInputs, weekStashSnap, weekDirty, loadWeek } from '../state/store'
import { setInpMode, setInpView, setPage, setCalMonth, setBoardDay, setOilDay } from '../state/view'
import * as view from '../state/view'
import { setMe, DEFAULT_ME } from '../state/auth'
import { commitSetDayApproved, schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { hydrate, wirePersist } from '../state/persist'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { _resetDisclosure } from '../state/disclosure'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns, isScheduler } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { HOOKS, storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, setSign, dayPendingItems } from '../engine/publish'
import { ELOG } from '../engine/editlog'
import { ensureRowIds } from '../engine/rowids'
import { acceptInput, unacceptInput } from '../engine/slots'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { readSchedulerCss } from '../testing/scheduler-css'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const realToast = HOOKS.toast
const realMM = (window as any).matchMedia
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const cs = (id: any) => PEOPLE[id].cs as string
const az = (ids: string[]) => [...ids].sort((a, b) => cs(a).localeCompare(cs(b), undefined, { sensitivity: 'base' }))
const CX = { cx: true, cxr: 'WX' }
/* text a browser would run if a builder forgot to escape it */
const SHARP = '<b>WX</b> & "low" \'cloud\''
/* (a title holds forty letters at most — engine/inputs.ts TITLE_MAX — so this is as long as one gets) */
const LONG_TITLE = 'Range safety brief and weapons handling'
const LONG_WHY = 'WX below limits at the range and at the alternate, no divert available, moved to next week pending the met brief on Monday morning'

/* ============================== PART ONE — THE INPUTS PAGES ============================== */
describe('PART ONE — the Inputs pages', () => {
  let host: HTMLDivElement, root: Root | null = null
  const admin = 'stiff', member = 'bane'
  const others = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers && id !== admin && id !== member)
  const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
  const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
  let phoneNow = false
  const asPhone = (on: boolean) => {
    phoneNow = on
    ;(window as any).matchMedia = (q: string) => ({ get matches() { return phoneNow && /max-width:\s*820px/.test(q) },
      addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
  }
  const T = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).getTime()
  let n = 0
  /* one record with its people, as the one-rule build stores it (D756) */
  const file = async (over: any = {}, people?: string[]) => {
    const who = people || [others()[0]]
    const row = { iid: 'cs' + (++n), people: who.map(p => ({ p, by: admin, at: T(1, 9, 0) })), type: 'Training', title: 'Range brief', date: 'Oct 20', yr: 2026,
      allday: false, s: 540, e: 600, remarks: 'Bring your kit', mod: '2026-09-01', by: admin, at: T(1, 9, 0), ...over }
    await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
    return live(row.iid)
  }
  /* the mark put on, or taken off, a record already on the page */
  const mark = async (r: any, on: boolean, why = 'WX') => act(async () => {
    writeInputs(() => { const x = live(r.iid); if (on) { x.cx = true; x.cxr = why } else { x.cx = false; delete x.cxr } }); notify()
  })
  const allDates = async () => { if (!$('#inRangePop')) await click($('#inRangeBtn')); await click($('#inRangeAll')) }
  const mount = async (phone: boolean, v: 'table' | 'cal' = 'table') => {
    asPhone(phone)
    setInpView(v)
    if (v === 'cal') setCalMonth({ y: 2026, m: 10 })   // October — the month is counted from 1
    host = document.createElement('div'); document.body.append(host); root = createRoot(host)
    await act(async () => { root!.render(<><InputsPage /><InputEditor /></>) })
    if (v === 'table') await allDates()
    else await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
  }
  const unmount = async () => {
    if (root) await act(async () => { root!.unmount(); pops.setInpEdit(null) })
    root = null
    if (host) host.remove()
    _resetFloatWins()
  }
  const openDay = async (iso: string) => act(async () => { $(`[data-icday="${iso}"]`)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
  /* the three places an input is drawn on these pages */
  const lcard = (r: any) => $(`[data-testid="inl-row-${r.iid}"]`)!
  const lpart = (r: any, k: string) => lcard(r).querySelector(`[data-testid="inl-${k}"]`) as HTMLElement | null
  const dcard = (r: any) => $(`[data-testid="idy-row-${r.iid}"]`)!
  const dpart = (r: any, k: string) => dcard(r).querySelector(`[data-testid="idy-${k}"]`) as HTMLElement | null
  const tr = (r: any) => $(`#inBody tr[data-iid="${r.iid}"]`)!
  const cell = (r: any, label = 'Type') => tr(r).querySelector(`td[data-label="${label}"]`) as HTMLElement
  const bars = (r: any) => $$(`.ib-bar[data-iid="${r.iid}"]`)
  const F = { fType: 'all', fPerson: 'all', fSearch: '' } as any

  beforeEach(async () => {
    INPUTS.splice(0, INPUTS.length)
    const mem = new Map<string, string>()
    storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
    initStore(); INPUTS.splice(0, INPUTS.length)
    setSession({ user: admin, role: 'admin' }); setMe(admin); lwInitStore(memoryBackend()); lwSetRole('admin')
    setPage('inputs'); setInpMode('member'); setInpView('table')
    HOOKS.toast = (() => {}) as any
  })
  afterEach(async () => {
    await unmount()
    HOOKS.toast = realToast; (window as any).matchMedia = realMM
    INPUTS.splice(0, INPUTS.length, ...JSON.parse(ISNAP))
    setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null
  })

  describe('cancelled, LATE, shared by ten, with ALL AVAIL in it (D767 reading 1; D721, D724, D727, D729)', () => {
    const ten = () => others().slice(0, 10)
    const LATE = { type: 'Meeting', date: 'Oct 21', mod: '2026-10-20' }
    it('the phone list\'s card: every name A to Z and ALL AVAIL last, LATE, the hours and "By Saber" as on its not-cancelled twin — and the tag, the struck title, the reason', async () => {
      await mount(true)
      const twin = await file({ ...LATE }, [...ten(), 'allavail'])
      const r = await file({ ...LATE, ...CX }, [...ten(), 'allavail'])
      const names = [...az(ten()).map(cs), 'ALL AVAIL'].join(', ')
      expect(lpart(r, 'who')!.textContent, 'never "+N" (D721)').toBe(names)
      for (const k of ['who', 'kind', 'late', 'when', 'by', 'rmk']) {
        expect(lpart(r, k), k + ' is there').toBeTruthy()
        expect(lpart(r, k)!.textContent, k + ' reads as on the twin').toBe(lpart(twin, k)!.textContent)
        expect(lpart(r, k)!.classList.contains('is-cx'), k + ' is not struck').toBe(false)
      }
      expect(lpart(r, 'late')!.textContent).toBe('LATE')
      expect(lpart(r, 'by')!.textContent, 'several people: who filed it is always said (D724)').toBe(`By ${cs(admin)}`)
      expect(lpart(r, 'cx')!.textContent).toBe('CX')
      expect(lpart(r, 'title')!.classList.contains('is-cx')).toBe(true)
      expect(lpart(r, 'why')!.textContent).toBe('WX')
      expect(lpart(twin, 'cx'), 'the twin wears none').toBeNull()
    })
    it('what a screen reader is told, in order: who, the title, the kind, the hours, cancelled and why, late, who placed it', async () => {
      await mount(true)
      const r = await file({ ...LATE, ...CX }, [...ten(), 'allavail'])
      const names = [...az(ten()).map(cs), 'ALL AVAIL'].join(', ')
      expect(lpart(r, 'open')!.getAttribute('aria-label')).toBe(`${names}, Range brief, Meeting, 09:00–10:00, cancelled — WX, late, placed by ${cs(admin)}`)
    })
    it('the desktop row: the Name names everyone (D727), and every cell but Type reads as the twin\'s', async () => {
      await mount(false)
      const twin = await file({ ...LATE }, [...ten(), 'allavail'])
      const r = await file({ ...LATE, ...CX }, [...ten(), 'allavail'])
      expect(cell(r, 'Name').textContent).toContain([...az(ten()).map(cs), 'ALL AVAIL'].join(', '))
      const rest = (x: any) => [...tr(x).querySelectorAll('td')].filter(td => td.getAttribute('data-label') !== 'Type').map(td => td.textContent)
      expect(rest(r)).toEqual(rest(twin))
      expect(cell(r).querySelector('.intag')!.textContent, 'the kind keeps its pill, whole (D727)').toBe('Meeting')
    })
    it('the month\'s bar: the count words are what they were — "10 + ALL AVAIL · Range brief" — on a desktop and on a phone', async () => {
      const rec = (over: any = {}) => ({ iid: 'b10', people: [...ten().map(p => ({ p })), { p: 'allavail' }], type: 'Meeting', title: 'Range brief', date: 'Oct 21', yr: 2026, allday: false, s: 540, e: 600, ...over })
      const [was] = monthItems([rec()], F), [now] = monthItems([rec(CX)], F)
      for (const narrow of [false, true]) {
        expect(barText(now, narrow)).toBe('10 + ALL AVAIL · Range brief')
        expect(barText(now, narrow)).toBe(barText(was, narrow))
      }
      const { cx: _a, rows: _b, ...a } = was as any, { cx: _c, rows: _d, ...b } = now as any
      expect(b, 'nothing of the bar\'s item changes but the mark').toEqual(a)
      /* one named person beside ALL AVAIL keeps his callsign (the plan §4.5) — cancelled too */
      const one = (over: any = {}) => monthItems([{ ...rec(over), people: [{ p: ten()[0] }, { p: 'allavail' }] }], F)[0]
      expect(barText(one(CX), false)).toBe(`${cs(ten()[0])} + ALL AVAIL · Range brief`)
      expect(barText(one(CX), false)).toBe(barText(one(), false))
    })
  })

  describe('a very long title and a very long reason — nothing is cut (D719, D767)', () => {
    it('the card says both whole, each in its own part of the ONE words row, the tag still leading', async () => {
      await mount(true)
      const r = await file({ cx: true, cxr: LONG_WHY, title: LONG_TITLE })
      expect(lpart(r, 'title')!.textContent).toBe(LONG_TITLE)
      expect(lpart(r, 'why')!.textContent).toBe(LONG_WHY)
      const text = lcard(r).querySelector('.icard-text')!
      expect([...text.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid'))).toEqual(['inl-cx', 'inl-title', 'inl-why', 'inl-rmk'])
      expect([...text.children].every(c => c.parentElement === text), 'they are plain parts of the one row, which wraps').toBe(true)
      expect(lcard(r).querySelectorAll('.icard-words').length, 'ONE words row').toBe(1)
      expect(lcard(r).textContent).not.toContain('…')
    })
    it('the desktop row says both whole on the title\'s own line, the kind\'s pill outside it', async () => {
      await mount(false)
      const r = await file({ cx: true, cxr: LONG_WHY, title: LONG_TITLE })
      const line = cell(r).querySelector('.in-cxline')!
      expect(line.querySelector('[data-testid="in-title"]')!.textContent).toBe(LONG_TITLE)
      expect(line.querySelector('[data-testid="in-why"]')!.textContent).toBe(LONG_WHY)
      expect(line.querySelector('.intag'), 'the pill is not on the struck line').toBeNull()
      expect(cell(r).querySelector('.intag')!.textContent).toBe('Training')
    })
    it('the bar keeps its words whole in the page (the stylesheet clips, the markup does not) and its tooltip says the whole reason', async () => {
      await mount(false, 'cal')
      const r = await file({ cx: true, cxr: LONG_WHY, title: LONG_TITLE })
      expect(bars(r)[0].textContent).toBe(`${cs(others()[0])} · ${LONG_TITLE}`)
      expect(bars(r)[0].getAttribute('title')!.split('\n')).toContain(`Cancelled — ${LONG_WHY}`)
    })
  })

  describe('a reason and a title that hold markup, an ampersand and quotes are printed as text', () => {
    const NASTY = { cx: true, cxr: SHARP, title: '<i>Range</i> & "co"' }
    const clean = (el: Element) => { expect(el.querySelector('.icx-why b, .icx-why i, .is-cx i, .is-cx b'), 'no element was made of it').toBeNull() }
    it('the phone list\'s card and its screen-reader label', async () => {
      await mount(true)
      const r = await file(NASTY)
      expect(lpart(r, 'why')!.textContent).toBe(SHARP)
      expect(lpart(r, 'title')!.textContent).toBe('<i>Range</i> & "co"')
      clean(lcard(r))
      expect(lpart(r, 'open')!.getAttribute('aria-label')).toContain(`cancelled — ${SHARP}`)
    })
    it('the desktop row', async () => {
      await mount(false)
      const r = await file(NASTY)
      expect(cell(r).querySelector('[data-testid="in-why"]')!.textContent).toBe(SHARP)
      expect(cell(r).querySelector('[data-testid="in-title"]')!.textContent).toBe('<i>Range</i> & "co"')
      clean(cell(r))
    })
    it('the month\'s bar, its tooltip, and the opened day\'s card', async () => {
      await mount(false, 'cal')
      const r = await file(NASTY)
      expect(bars(r)[0].children.length, 'a bar is words alone').toBe(0)
      expect(bars(r)[0].textContent).toBe(`${cs(others()[0])} · <i>Range</i> & "co"`)
      expect(bars(r)[0].getAttribute('title')!.split('\n')).toContain(`Cancelled — ${SHARP}`)
      await openDay('2026-10-20')
      expect(dpart(r, 'why')!.textContent).toBe(SHARP)
      clean(dcard(r))
    })
  })

  describe('a cancelled input of several days (D760 — it stays listed, on every day; D728 — "till" said once)', () => {
    /* Thursday 22 to Tuesday 27 October: two weeks of the month, so two pieces of one bar */
    const RUN = { ...CX, type: 'Duty', allday: true, date: 'Oct 22', endDate: 'Oct 27', remarks: 'Range week till 27 Oct' }
    it('every piece of its bar is struck and faded, and each says what it said', async () => {
      await mount(false, 'cal')
      const r = await file(RUN)
      const twin = await file({ ...RUN, cx: undefined, cxr: undefined }, [others()[1]])
      expect(bars(r).length, 'one piece a week').toBe(2)
      for (const b of bars(r)) {
        expect(b.classList.contains('is-cx')).toBe(true)
        expect(b.textContent).toBe(`${cs(others()[0])} · Range brief`)
      }
      expect(bars(r).map(b => b.classList.contains('is-cont')), 'the first piece begins it, the second carries it on').toEqual([false, true])
      expect(bars(twin).map(b => b.className.replace(' is-cx', '')), 'the twin\'s pieces differ by the one class only').toEqual(bars(r).map(b => b.className.replace(' is-cx', '')))
      expect(bars(twin).some(b => b.classList.contains('is-cx'))).toBe(false)
    })
    it('the card under its first day, a middle day and its last day: cancelled on each; "till 27 Oct" once', async () => {
      await mount(false, 'cal')
      const r = await file(RUN)
      for (const iso of ['2026-10-22', '2026-10-24']) {
        await openDay(iso)
        expect(dpart(r, 'cx')!.textContent, iso).toBe('CX')
        expect(dpart(r, 'title')!.classList.contains('is-cx'), iso).toBe(true)
        expect(dpart(r, 'why')!.textContent, iso).toBe('WX')
        expect(dpart(r, 'when')!.textContent, iso).toBe('till 27 Oct')
        expect(dpart(r, 'rmk')!.textContent, iso).toBe('Range week')
        expect(dcard(r).textContent!.match(/till 27 Oct/g), iso + ': said once on the whole card').toHaveLength(1)
      }
      await openDay('2026-10-27')
      expect(dpart(r, 'cx')!.textContent, 'its last day').toBe('CX')
      expect(dpart(r, 'why')!.textContent).toBe('WX')
      expect(dpart(r, 'when')!.textContent).toBe('All day')
      expect(dpart(r, 'rmk')!.textContent, 'there the corner does not say the date, so the remark is whole').toBe('Range week till 27 Oct')
    })
    it('the phone list: ONE card, under its first day, cancelled, "till 27 Oct" once', async () => {
      await mount(true)
      const r = await file(RUN)
      expect($$(`[data-testid="inl-row-${r.iid}"]`)).toHaveLength(1)
      expect(lpart(r, 'cx')!.textContent).toBe('CX')
      expect(lpart(r, 'when')!.textContent).toBe('till 27 Oct')
      expect(lcard(r).textContent!.match(/till 27 Oct/g)).toHaveLength(1)
      expect($('[data-testid="inl-day"] b')!.textContent).toBe('Thu 22 Oct')
    })
  })

  describe('an input cancelled and then BROUGHT BACK reads as any other — with or without a reason left on the record', () => {
    const BACK = [{ cx: false }, { cx: false, cxr: 'WX' }]
    it('the phone list\'s card: no tag, no reason, nothing struck, no "cancelled" in its label — its words as the twin\'s', async () => {
      await mount(true)
      const twin = await file()
      for (const back of BACK) {
        const r = await file(back)
        expect(lpart(r, 'cx')).toBeNull(); expect(lpart(r, 'why')).toBeNull()
        expect(lcard(r).querySelector('.is-cx, .icx, .icx-why')).toBeNull()
        expect(lcard(r).querySelector('.icard-text')!.textContent).toBe(lcard(twin).querySelector('.icard-text')!.textContent)
        expect(lpart(r, 'open')!.getAttribute('aria-label')).toBe(lpart(twin, 'open')!.getAttribute('aria-label'))
      }
    })
    it('the desktop row\'s Type cell is the twin\'s, to the character', async () => {
      await mount(false)
      const twin = await file()
      for (const back of BACK) expect(cell(await file(back)).innerHTML).toBe(cell(twin).innerHTML)
    })
    it('the bar wears the twin\'s classes and its tooltip says nothing of a cancel; the opened day\'s card neither', async () => {
      await mount(false, 'cal')
      const twin = await file()
      const rs = [await file(BACK[0]), await file(BACK[1])]
      await openDay('2026-10-20')
      for (const r of rs) {
        expect(bars(r)[0].className).toBe(bars(twin)[0].className)
        expect(bars(r)[0].getAttribute('title')).not.toMatch(/cancel/i)
        expect(dcard(r).querySelector('.is-cx, .icx, .icx-why')).toBeNull()
      }
    })
    it('cancelled on the page and brought back on the page: the card goes there and comes back — the same one card', async () => {
      await mount(true)
      const r = await file()
      const before = lcard(r).outerHTML
      await mark(r, true)
      expect(lpart(r, 'cx')!.textContent).toBe('CX')
      await mark(r, false)
      expect(lcard(r).outerHTML).toBe(before)
    })
  })

  describe('an input whose title is its kind\'s own name goes by its kind (D767 reading 2)', () => {
    it('the card strikes the kind and has no title row; the desktop row strikes the pill; the bar says the kind once', async () => {
      await mount(true)
      const r = await file({ ...CX, title: 'training' })
      expect(lpart(r, 'title'), 'no title of its own').toBeNull()
      expect(lpart(r, 'kind')!.classList.contains('is-cx')).toBe(true)
      expect(lcard(r).querySelector('.icard-text')!.textContent).toBe('CXWX · Bring your kit')
      await unmount(); await mount(false)
      expect(cell(r).querySelector('[data-testid="in-title"]')).toBeNull()
      expect(cell(r).querySelector('.intag')!.classList.contains('is-cx')).toBe(true)
      expect(cell(r).querySelector('.intag')!.textContent).toBe('Training')
      expect(cell(r).querySelector('[data-testid="in-why"]')!.textContent).toBe('WX')
      expect(barText(monthItems([live(r.iid)], F)[0], false)).toBe(`${cs(others()[0])} · Training`)
    })
  })

  describe('an all-day cancelled input', () => {
    it('its corner still says "All day"; its bar is the heavier all-day bar, struck — a timed one the lighter, struck', async () => {
      await mount(false, 'cal')
      const whole = await file({ ...CX, type: 'Duty', allday: true })
      const timed = await file({ ...CX, type: 'Duty', date: 'Oct 21' }, [others()[1]])
      expect(bars(whole)[0].classList.contains('timed')).toBe(false)
      expect(bars(whole)[0].classList.contains('is-cx')).toBe(true)
      expect(bars(timed)[0].classList.contains('timed')).toBe(true)
      expect(bars(timed)[0].classList.contains('is-cx')).toBe(true)
      await openDay('2026-10-20')
      expect(dpart(whole, 'when')!.textContent).toBe('All day')
      expect(dpart(whole, 'cx')!.textContent).toBe('CX')
    })
  })

  describe('D760 — it stays listed: the person filter, the kind filter and the search still pass it', () => {
    it('by any of its people, by its placeholder, by its kind, by its title, a callsign or a word of its remark — exactly as its not-cancelled twin', () => {
      const [a, b, c] = others()
      const rec = (over: any = {}) => ({ iid: 'f1', people: [{ p: a }, { p: b }, { p: 'allavail' }], type: 'Meeting', title: 'Range brief', date: 'Oct 20', yr: 2026, allday: false, s: 540, e: 600, remarks: 'Bring your kit', ...over })
      const pass = [{ fPerson: a }, { fPerson: b }, { fPerson: 'ph:allavail' }, { fType: 'Meeting' }, { fSearch: 'range' }, { fSearch: cs(b).toLowerCase() }, { fSearch: 'kit' }]
      for (const f of pass) {
        const got = monthItems([rec(CX)], { ...F, ...f })
        expect(got.length, JSON.stringify(f)).toBe(1)
        expect(got[0].cx).toBe(true)
        expect(got.length).toBe(monthItems([rec()], { ...F, ...f }).length)
      }
      /* the controls: a filter that hides its twin hides it — the mark opens no door either */
      for (const f of [{ fPerson: c }, { fType: 'Duty' }, { fSearch: 'nowhere' }]) expect(monthItems([rec(CX)], { ...F, ...f }), JSON.stringify(f)).toHaveLength(0)
    })
    it('on the page: the desktop list filtered to one of its people, to its kind, and searched by its title still shows its row; the opened day lists it', async () => {
      await mount(false)
      const [a, b] = others()
      const r = await file({ ...CX, type: 'Meeting' }, [a, b])
      const other = await file({ type: 'Duty', title: 'Guard', remarks: '' }, [others()[2]])
      const person = $('#inFPerson') as HTMLSelectElement
      await act(async () => { person.value = b; person.dispatchEvent(new Event('change', { bubbles: true })) })
      expect(tr(r), 'filtered to one of its people').toBeTruthy(); expect($(`#inBody tr[data-iid="${other.iid}"]`)).toBeNull()
      await act(async () => { person.value = 'all'; person.dispatchEvent(new Event('change', { bubbles: true })) })
      const type = $('#inFType') as HTMLSelectElement
      await act(async () => { type.value = 'Meeting'; type.dispatchEvent(new Event('change', { bubbles: true })) })
      expect(tr(r), 'filtered to its kind').toBeTruthy(); expect($(`#inBody tr[data-iid="${other.iid}"]`)).toBeNull()
      await act(async () => { type.value = 'all'; type.dispatchEvent(new Event('change', { bubbles: true })) })
      const box = $('#inFSearch') as HTMLInputElement
      await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(box, 'range'); box.dispatchEvent(new Event('input', { bubbles: true })) })
      expect(tr(r), 'searched by its title').toBeTruthy(); expect($(`#inBody tr[data-iid="${other.iid}"]`)).toBeNull()
      for (const f of [{ fPerson: b }, { fType: 'Meeting' }, { fSearch: 'range' }])
        expect(dayEntries('2026-10-20', { ...F, ...f }).inputs.map((x: any) => x.iid), 'the opened day, ' + JSON.stringify(f)).toEqual([r.iid])
    })
    it('the month\'s date still counts it for a screen reader, and the phone list\'s heading too', async () => {
      await mount(false, 'cal')
      await file(CX)
      await file({ date: 'Oct 20' }, [others()[1]])
      expect($('[data-icday="2026-10-20"]')!.getAttribute('aria-label')).toMatch(/, 2 inputs$/)
    })
  })

  describe('D768 — it keeps its place: nothing on these pages orders by the mark', () => {
    const DAY = () => {
      const [a, b, c, d, e] = others()
      return [
        { type: 'LL', title: undefined, allday: true, remarks: '' , who: a },
        { type: 'Meeting', s: 480, e: 540, who: b },
        { type: 'Training', s: 540, e: 600, who: c },
        { type: 'Training', s: 540, e: 600, who: d },          // the same hour as the one above: the callsign decides
        { type: 'Duty', s: 600, e: 660, who: e },
      ]
    }
    const fileDay = async () => { const out: any[] = []; for (const x of DAY()) { const { who, ...over } = x as any; out.push(await file(over, [who])) } return out }
    it('the opened day\'s cards: cancelling any one of five moves none of them', async () => {
      await mount(false, 'cal')
      const rs = await fileDay()
      await openDay('2026-10-20')
      const order = () => $$('[data-testid^="idy-row-"]').map(el => el.getAttribute('data-testid'))
      const plain = order()
      expect(plain).toHaveLength(5)
      const model = () => dayEntries('2026-10-20', F).inputs.map((x: any) => x.iid)
      const plainModel = model()
      for (const r of rs) {
        await mark(r, true)
        expect(order(), `${r.type} of ${cs(r.people[0].p)} cancelled`).toEqual(plain)
        expect(model()).toEqual(plainModel)
        expect(bars(r)[0].classList.contains('is-cx'), 'the control: it IS drawn cancelled').toBe(true)
        await mark(r, false)
      }
    })
    it('the phone list\'s cards under their day: the same', async () => {
      await mount(true)
      const rs = await fileDay()
      const order = () => $$('[data-testid^="inl-row-"]').map(el => el.getAttribute('data-testid'))
      const plain = order()
      expect(plain).toHaveLength(5)
      for (const r of rs) { await mark(r, true); expect(order(), r.iid).toEqual(plain); await mark(r, false) }
    })
    it('the desktop list, sorted by each of its columns in turn: cancelling any row moves none', async () => {
      await mount(false)
      const rs = await fileDay()
      const order = () => $$('#inBody tr').map(x => x.getAttribute('data-iid'))
      const heads = $$('#intbl thead th[data-sort]').map(th => th.getAttribute('data-sort')!)
      expect(heads.length, 'the control: the list has columns to sort by').toBeGreaterThan(2)
      for (const key of heads) {
        await click($(`#intbl thead th[data-sort="${key}"]`))
        const plain = order()
        for (const r of rs) { await mark(r, true); expect(order(), `sorted by ${key}, ${r.iid} cancelled`).toEqual(plain); await mark(r, false) }
      }
    })
  })

  describe('the phone\'s card and the desktop\'s row say the same of one input (D767)', () => {
    it('titled with a reason; untitled with a reason; titled with no reason — the tag, the struck name and the reason agree', async () => {
      const said = (get: (k: string) => HTMLElement | null, struckKind: () => boolean) => ({
        tag: get('cx') ? get('cx')!.textContent : null, title: get('title') ? get('title')!.textContent : null,
        titleStruck: !!get('title') && get('title')!.classList.contains('is-cx'), kindStruck: struckKind(), why: get('why') ? get('why')!.textContent : null,
      })
      await mount(true)
      const rs = [await file(CX), await file({ ...CX, title: undefined }, [others()[1]]), await file({ cx: true }, [others()[2]])]
      const phone = rs.map(r => said(k => lpart(r, k), () => lpart(r, 'kind')!.classList.contains('is-cx')))
      await unmount(); await mount(false)
      const desk = rs.map(r => said(k => cell(r).querySelector(`[data-testid="in-${k}"]`) as HTMLElement | null, () => cell(r).querySelector('.intag')!.classList.contains('is-cx')))
      expect(desk).toEqual(phone)
      expect(phone).toEqual([
        { tag: 'CX', title: 'Range brief', titleStruck: true, kindStruck: false, why: 'WX' },
        { tag: 'CX', title: null, titleStruck: false, kindStruck: true, why: 'WX' },
        { tag: 'CX', title: 'Range brief', titleStruck: true, kindStruck: false, why: null },
      ])
    })
  })

  describe('a member and his own cancelled input (D760 reading 2 — only a scheduler cancels; the input is still his to open)', () => {
    const asMember = async () => act(async () => { setSession({ user: member, role: 'main' }); setMe(member); notify() })
    it('he sees it cancelled with its reason, his card\'s label says so, and a press still opens it', async () => {
      await mount(true)
      const mine = await file({ ...CX, by: member }, [member])
      await asMember()
      expect(lpart(mine, 'cx')!.textContent).toBe('CX')
      expect(lpart(mine, 'why')!.textContent).toBe('WX')
      expect(lpart(mine, 'by'), 'his own input: nobody else\'s name on it (D723)').toBeNull()
      expect(lpart(mine, 'open')!.getAttribute('aria-label')).toBe(`${cs(member)}, Range brief, Training, 09:00–10:00, cancelled — WX`)
      await click(lpart(mine, 'open'))
      expect(pops.INPEDIT && pops.INPEDIT.iid, 'the window opens on his input').toBe(mine.iid)
    })
    it('another person\'s cancelled input reads the same to him, and opens to read (D364)', async () => {
      await mount(true)
      const theirs = await file(CX)
      await asMember()
      expect(lpart(theirs, 'cx')!.textContent).toBe('CX')
      expect(lpart(theirs, 'why')!.textContent).toBe('WX')
      await click(lpart(theirs, 'open'))
      expect(pops.INPEDIT && pops.INPEDIT.iid).toBe(theirs.iid)
    })
  })

  describe('the red box and "information only" are shown on the schedule only (D760)', () => {
    it('neither changes a word of the card, the row or the bar — beside a CX or without one', async () => {
      const rec = (over: any = {}) => ({ iid: 'm1', people: [{ p: others()[0] }], type: 'Training', title: 'Range brief', date: 'Oct 20', yr: 2026, allday: false, s: 540, e: 600, remarks: 'Bring your kit', by: admin, ...over })
      const MARKS = { flag: true, info: true }
      expect(cardOf([rec(MARKS)])).toEqual(cardOf([rec()]))
      expect(cardOf([rec({ ...CX, ...MARKS })])).toEqual(cardOf([rec(CX)]))
      const bar = (r: any) => { const { rows: _r, ...it } = monthItems([r], F)[0] as any; return it }
      expect(bar(rec(MARKS))).toEqual(bar(rec()))
      expect(bar(rec({ ...CX, ...MARKS }))).toEqual(bar(rec(CX)))
      await mount(false)
      const a = await file(CX), b = await file({ ...CX, ...MARKS })
      expect(cell(b).innerHTML).toBe(cell(a).innerHTML)
    })
  })

  /* (RETIRED BY NAME — owner, D773, 12 Oct 26 — "I don't need an export to excel function for inputs. U can remove it.": "the Inputs export … writes a cancelled input's lines exactly as its not-cancelled
     twin's" pinned D772, which D773 replaced the same day — there is no export of inputs to mark or leave unmarked;
     ui/inputs.test.tsx pins that the page offers none.) */

  describe('SANS availability is on no bar, cancelled or not (D620) — and nothing here could cancel one', () => {
    it('a hand-made record carrying the mark is still on no bar', () => {
      expect(monthItems([{ iid: 's1', person: others()[0], type: 'SANS Availability', date: 'Oct 20', yr: 2026, allday: true, cx: true, cxr: 'WX' }], F)).toHaveLength(0)
    })
  })
})

/* ============================== PART TWO — THE SCHEDULE'S OWN LINES ============================== */
describe('PART TWO — the schedule\'s own lines, by the board\'s real CX button on a real saved store', () => {
  const W1 = '13/07/2026'
  const WED = 2, THU = 3, SAT = 5
  const ISO = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
  const LBL = ['Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19']
  const earning = HOOKS.oilEarningDay, sentinel = HOOKS.oilSentinel, dayISO = HOOKS.oilDayISO
  const MARK = 'zq7kit'
  const TITLE = 'Range safety brief'

  function resetWorld() {
    if (CURWEEK !== W1) loadWeek(W1)
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
    for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
    Object.assign(PEOPLE, JSON.parse(PSNAP))
    for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
    indexCallsigns()
    PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
    DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
    SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
    SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
    SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
    view.WARNOFF.clear(); view.disarmSlot(); setOilDay(null); view.PIOPEN.clear()
    pops.setInpEdit(null); pops.setOilAsk(null)
    stashClear()
  }
  const admin = () => { setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff') }      // Saber, a scheduler
  const member = (id: string) => { setSession({ user: 'us', role: 'main', name: 'us' }); setMe(id) }
  async function boot() {
    const be = new MemoryBackend()
    be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
    const p = bootStorage(be)
    await vi.advanceTimersByTimeAsync(be.latency)
    const { wb } = await p
    storeBackend.impl = settingsAdapter(wb)
    hydrate(wb)
    initStore()
    wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
    _resetDisclosure()
    _resetTimeline(); installGlobalUndo()
    admin()
    setPage('editsched'); setBoardDay(WED)
  }
  /* an earning day, stripped of the seed's own work */
  const oilOn = (earns: number[]) => {
    for (const di of earns) Object.assign(DAYS[di] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
    ensureRowIds(DAYS)
    HOOKS.oilDayISO = (di: number) => ISO[di] as string
    HOOKS.oilEarningDay = (di: number) => earns.includes(di)
    HOOKS.oilSentinel = () => []
  }
  /* THE input of a case — found by the word in its remark, whatever it is called */
  const the = (mark = MARK) => { const l = INPUTS.filter((x: any) => String(x.remarks || '').includes(mark)) as any[]; expect(l, 'ONE record').toHaveLength(1); return l[0] }
  const ground = (di = WED) => ((DAYS[di] as any).ground || []) as any[]
  const riOf = (di = WED, mark = MARK) => ground(di).findIndex((g: any) => g && g.src === String(inpId(the(mark))))
  const rowOf = (di = WED, mark = MARK) => ground(di)[riOf(di, mark)]
  const DRAFT = (di = WED, over: any = {}) => ({ ...draftOf({ person: 'bane', type: di >= SAT ? 'Duty' : 'Meeting', title: TITLE, date: LBL[di], yr: 2026, allday: false, s: 840, e: 900, remarks: 'Bring your ' + MARK }), ...over })
  const file = (ppl: string[], di = WED, over: any = {}, oil?: Record<string, number>) => expect(commitInput(null, DRAFT(di, over), ppl, oil ? { oil } : undefined), 'filed').toBe(true)
  /* the board's own buttons, as a scheduler presses them */
  const press = (data: Record<string, string>) => { const b = document.createElement('button'); b.className = 'mbtn'; Object.assign(b.dataset, data); document.body.appendChild(b); boardMbtn({ target: b } as any); b.remove() }
  const cx = (di = WED, reason = 'WX', mark = MARK) => { setBoardDay(di); press({ grcx: `${di}.${riOf(di, mark)}` }); expect(CXT, 'the reason is asked').toBeTruthy(); cxCommit(true, reason) }
  const uncx = (di = WED) => { setBoardDay(di); press({ grcx: `${di}.${riOf(di)}` }); cxCommit(false, '') }
  const redBox = (di = WED) => { setBoardDay(di); press({ grflag: `${di}.${riOf(di)}` }) }
  const infoOnly = (di = WED) => { setBoardDay(di); press({ grinfo: `${di}.${riOf(di)}` }) }
  const rowX = (di = WED, mark = MARK) => { setBoardDay(di); press({ grdel: `${di}.${riOf(di, mark)}` }) }
  /* "→ Unavail" on its line under Personal Inputs, once its row is off the programme */
  const toUnavail = (di = WED, mark = MARK) => { rowX(di, mark); schedWrite(SCHED_TYPES.mutate, () => { expect(acceptInput(di, the(mark), 'u'), '→ Unavail').toBe(true); view.afterSchedMutate() }); expect(the(mark).acc).toBe('u') }
  const sign = (di: number) => schedWrite(SCHED_TYPES.mutate, () => {
    const sk = Object.keys(PEOPLE).filter(isScheduler)
    setSign(di, 'cur', 'ignite'); setSign(di, 'sked', sk[0]); setSign(di, 'plan', sk[1]); setSign(di, 'appr', sk[2])
    view.afterSchedMutate()
  })
  const publish = (di: number) => { sign(di); commitSetDayApproved(di, true) }
  /* the lines, as each surface draws them */
  const dom = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
  const mine = (els: Element[], mark = MARK) => els.filter(r => r.outerHTML.includes(mark)) as HTMLElement[]
  const weekPI = (di = WED, mark = MARK) => { view.PIOPEN.add(di); return mine([...dom(dayHTML(di, true)).querySelectorAll('.sec-inp .pl-row')], mark) }
  const weekUnav = (di = WED, ed = true, mark = MARK) => mine([...dom(dayHTML(di, ed)).querySelectorAll('.sec-unav .pl-row')], mark)
  const boardPI = (di = WED, pv?: boolean, mark = MARK) => { view.PIOPEN.add(di); setBoardDay(di); return mine([...dom(boardHTML(di, pv)).querySelectorAll('.sb-panel.pinp .sb-arow, .sb-panel.pinp .sbi-row')], mark) }
  const boardUnav = (di = WED, pv?: boolean, mark = MARK) => { setBoardDay(di); return mine([...dom(boardHTML(di, pv)).querySelectorAll('.sb-panel.unav .sb-arow, .sb-panel.unav .sbi-row')], mark) }
  const kids = (r: HTMLElement) => [...r.children].map(c => c.className.split(' ')[0])
  /* THE REGISTER RULE of the board's row (ui/board-html.ts sbInpRow): the row's cells are its direct children, and the
     tag is never one of them — it rides inside the ONE item cell, with the name it leads */
  const oneCell = (line: HTMLElement, name: string, tagText = 'CX DUE WX') => {
    const tags = [...line.querySelectorAll('.cxtag')] as HTMLElement[]
    expect(tags.length, 'ONE tag on the line').toBe(1)
    const tag = tags[0]
    expect(tag.textContent).toBe(tagText)
    expect(tag.parentElement!.classList.contains('itemcell'), 'the tag sits IN the item cell').toBe(true)
    expect(tag.parentElement!.parentElement, 'and the item cell is the row\'s own cell').toBe(line)
    expect([...line.children].some(c => c.classList.contains('cxtag')), 'never a cell of its own').toBe(false)
    const struck = tag.parentElement!.querySelector('.inp-cx') as HTMLElement
    expect(struck, 'the name beside it is the struck one').toBeTruthy()
    expect(struck.textContent).toBe(name)
    expect(tag.compareDocumentPosition(struck) & Node.DOCUMENT_POSITION_FOLLOWING, 'the tag leads the name').toBeTruthy()
  }

  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0)); resetWorld(); HOOKS.toast = (() => {}) as any })
  afterEach(() => {
    HOOKS.toast = realToast; HOOKS.oilEarningDay = earning; HOOKS.oilSentinel = sentinel; HOOKS.oilDayISO = dayISO
    _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null; document.body.innerHTML = ''
  })

  describe('the Scheduler Board\'s row: the tag rides inside the ONE item cell in every branch (D767 reading 3)', () => {
    it('an UNTITLED input: its kind\'s name is the struck one, and the row has the cells it had', async () => {
      await boot()
      file(['bane'], WED, { title: '' })
      const before = kids(boardPI()[0])
      expect(boardPI()[0].querySelector('.itemcell'), 'the control: a plain untitled row has no wrapper').toBeNull()
      cx()
      const line = boardPI()[0]
      oneCell(line, 'Meeting')
      expect(kids(line).length, 'as many cells as before').toBe(before.length)
      expect(kids(line).map(k => (k === 'itemcell' ? 'x' : k)).slice(2), 'the cells after the item cell are the same cells').toEqual(before.slice(2))
    })
    it('a LATE, TITLED input: the tag, the name, the kind and the LATE chip share the one cell — the tag first', async () => {
      await boot()
      vi.setSystemTime(new Date(2026, 6, 14, 9, 0, 0))               // the day before: after any cut-off
      file(['bane', 'pike'])
      const was = boardPI()[0]
      expect(was.querySelector('.itemcell .latechip'), 'the control: it reads LATE').toBeTruthy()
      const before = kids(was)
      cx()
      const line = boardPI()[0]
      oneCell(line, TITLE)
      const cellKids = [...line.querySelector('.itemcell')!.children].map(c => c.className.split(' ')[0])
      expect(cellKids[0]).toBe('cxtag')
      expect(cellKids).toContain('nm-kind'); expect(cellKids).toContain('latechip')
      expect(kids(line)).toEqual(before)
      expect(line.querySelectorAll('.puck').length, 'both people still on it').toBe(2)
    })
    it('in OIL Earn: the name is the item\'s switch, struck, the tag before it in the same cell', async () => {
      oilOn([SAT]); await boot()
      file(['bane', 'pike'], SAT, {}, { [ISO[SAT] as string]: 0.5 })
      setBoardDay(SAT); setOilDay(SAT)
      const before = kids(boardPI(SAT)[0])
      expect(boardPI(SAT)[0].querySelector('.oilitem'), 'the control: the name is the OIL switch').toBeTruthy()
      cx(SAT, 'WX'); setOilDay(SAT)
      const line = boardPI(SAT)[0]
      oneCell(line, TITLE)
      expect(line.querySelector('.itemcell .oilitem.inp-cx'), 'the struck name is the item\'s own cell').toBeTruthy()
      expect(kids(line)).toEqual(before)
    })
    it('READ ONLY — a look at the board, and a member\'s board: the compact row, the same one cell', async () => {
      await boot()
      file(['bane'])
      const before = kids(boardPI(WED, true)[0])
      expect(boardPI(WED, true)[0].classList.contains('sbi-row'), 'the control: the read-only row').toBe(true)
      cx()
      const ro = boardPI(WED, true)[0]
      oneCell(ro, TITLE)
      expect(kids(ro)).toEqual(before)
      member('bane')
      const his = boardPI(WED)[0]
      expect(his.classList.contains('sbi-row'), 'a member\'s board is read only').toBe(true)
      oneCell(his, TITLE)
      expect(his.querySelector('button'), 'nothing on it is his to press').toBeNull()
    })
    it('READ ONLY, untitled: the wrapper stands where the bare name stood — as many cells', async () => {
      await boot()
      file(['bane'], WED, { title: '' })
      const before = kids(boardPI(WED, true)[0])
      cx(WED, '')
      const ro = boardPI(WED, true)[0]
      oneCell(ro, 'Meeting', 'CX')
      expect(kids(ro).length).toBe(before.length)
    })
  })

  describe('the Unavailable list\'s row of a cancelled input filed there (D767 reading 3; D737 — one row a person)', () => {
    it('Edit Schedule\'s week, View-only Sched and the board each draw a row a person, each with the tag and the struck name', async () => {
      await boot()
      file(['bane', 'pike', 'vinci'])
      file(['stuff'], WED, { remarks: 'ctl9 plain' })
      cx(WED, 'WX')
      toUnavail(WED); toUnavail(WED, 'ctl9')
      expect([the().acc, the().cx, the().cxr]).toEqual(['u', true, 'WX'])
      for (const ed of [true, false]) {
        const rows = weekUnav(WED, ed)
        expect(rows.length, `${ed ? 'Edit Schedule' : 'View-only Sched'}: three people, three rows`).toBe(3)
        for (const r of rows) {
          expect(r.querySelector('.nm .cxtag')!.textContent).toBe('CX DUE WX')
          expect(r.querySelector('.nm .inp-cx')!.textContent).toBe(TITLE)
          expect(r.querySelectorAll('.puck').length).toBe(1)
        }
        expect(rows[0].querySelector('.nm button') != null, 'the name opens the input on Edit Schedule only').toBe(ed)
        /* the control: the other input filed there, not cancelled, wears nothing */
        const plain = weekUnav(WED, ed, 'ctl9')
        expect(plain).toHaveLength(1)
        expect(plain[0].querySelector('.cxtag, .inp-cx')).toBeNull()
      }
      const live = boardUnav(WED), plainLive = boardUnav(WED, undefined, 'ctl9')
      expect(live.length).toBe(3)
      for (const r of live) { oneCell(r, TITLE); expect(kids(r).length, 'the row has the cells its not-cancelled neighbour has').toBe(kids(plainLive[0]).length) }
      const ro = boardUnav(WED, true), plainRo = boardUnav(WED, true, 'ctl9')
      expect(ro.length).toBe(3)
      for (const r of ro) { oneCell(r, TITLE); expect(kids(r).length).toBe(kids(plainRo[0]).length) }
    })
    it('there is no CX button on that list, and a way back all the same: its row carries Undo; out of Unavailable and accepted again, its row is back CANCELLED — and the row\'s own button brings it back', async () => {
      await boot()
      file(['bane'])
      cx(WED, 'WX'); toUnavail(WED)
      for (const line of [weekUnav(WED, true)[0], boardUnav(WED)[0]]) {
        expect(line.querySelector('[data-acc="x"]'), 'Undo, on the cancelled row').toBeTruthy()
        expect([...line.querySelectorAll('button')].filter(b => (b.textContent || '').trim() === 'CX'), 'no CX button there').toHaveLength(0)
      }
      schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(WED, the()); view.afterSchedMutate() })
      expect([the().acc, the().cx, the().cxr], 'back under Personal Inputs, still cancelled').toEqual(['r', true, 'WX'])
      expect(weekPI()[0].querySelector('.nm .cxtag')!.textContent).toBe('CX DUE WX')
      expect(weekUnav(WED, true)).toHaveLength(0)
      schedWrite(SCHED_TYPES.mutate, () => { expect(acceptInput(WED, the(), 'g'), 'Accept').toBe(true); view.afterSchedMutate() })
      expect([!!rowOf(WED).cx, rowOf(WED).cxr], 'its row is re-made from the input: cancelled').toEqual([true, 'WX'])
      uncx(WED)
      expect(the().cx).toBe(false)
      expect(weekPI()[0].querySelector('.cxtag, .inp-cx')).toBeNull()
    })
    it('a published day\'s face keeps drawing it cancelled — for a member reading View-only Sched too', async () => {
      await boot()
      file(['bane'])
      cx(WED, 'WX'); toUnavail(WED)
      publish(WED)
      expect(dayPendingItems(WED), 'nothing is waiting').toHaveLength(0)
      const face = weekUnav(WED, false)
      expect(face).toHaveLength(1)
      expect(face[0].querySelector('.nm .cxtag')!.textContent).toBe('CX DUE WX')
      member('pike')
      const his = weekUnav(WED, false)
      expect(his[0].querySelector('.nm .cxtag')!.textContent).toBe('CX DUE WX')
      expect(his[0].querySelector('.nm .inp-cx')!.textContent).toBe(TITLE)
    })
  })

  describe('a reason and a title holding markup, an ampersand and quotes — escaped on every string-built line', () => {
    const NASTY_TITLE = '<i>Range</i> & "co"'
    const clean = (line: HTMLElement) => {
      expect(line.querySelector('.cxtag b, .cxtag i, .inp-cx i, .inp-cx b, .cxwhy *'), 'no element was made of what he typed').toBeNull()
      const tag = line.querySelector('.cxtag') as HTMLElement
      expect(tag.textContent).toBe('CX DUE ' + SHARP)
      expect(tag.getAttribute('title'), 'its tooltip too').toBe('CX DUE ' + SHARP)
      expect(tag.querySelector('.cxwhy')!.textContent, 'the reason is a part of its own, so a place with no room drops it').toBe(' DUE ' + SHARP)
      expect(line.querySelector('.inp-cx')!.textContent).toBe(NASTY_TITLE)
    }
    it('Personal Inputs on the week and on the board (live and read only), and the row itself', async () => {
      await boot()
      file(['bane'], WED, { title: NASTY_TITLE })
      cx(WED, SHARP)
      expect(the().cxr).toBe(SHARP)
      clean(weekPI()[0]); clean(boardPI()[0]); clean(boardPI(WED, true)[0])
      const row = mine([...dom(boardHTML(WED)).querySelectorAll('.sb-panel.grnd .sb-arow')])[0]
      expect(row, 'its row on the Ground Programme').toBeTruthy()
      expect(row.querySelector('i, b.x'), 'no element of his there either').toBeNull()
    })
    it('the Unavailable list on the week (Edit and View-only) and on the board', async () => {
      await boot()
      file(['bane'], WED, { title: NASTY_TITLE })
      cx(WED, SHARP); toUnavail(WED)
      clean(weekUnav(WED, true)[0]); clean(weekUnav(WED, false)[0]); clean(boardUnav(WED)[0]); clean(boardUnav(WED, true)[0])
    })
    it('the changes window\'s "To go out" list on a published day names the input by its title, as text; the change history keeps the reason as he typed it', async () => {
      await boot()
      file(['bane'], WED, { title: NASTY_TITLE })
      publish(WED)
      cx(WED, SHARP)
      expect(dayPendingItems(WED), 'ONE change waiting (D736)').toHaveLength(1)
      const list = dom(pendListHTML(WED))
      expect(list.querySelector('.pl-where')!.textContent).toContain(NASTY_TITLE)
      expect(list.querySelector('i, b b, s b, .pl-where b'), 'and nothing was made of it').toBeNull()
      expect(JSON.stringify(ELOG.rows[ELOG.rows.length - 1]), 'the change history\'s own line').toContain('low')
    })
  })

  /* A PRODUCT FAULT WHEN THIS WAS WRITTEN — FIXED THE SAME DAY (12 Oct 26, ui/pendlist.ts inputWords now pairs the three
     marks); the two "an input for …" cases below are kept as its pin. As reported: they FAILED on the build as it stood
     and were left failing for the builder. D760 reading 3: "on a published day a CX put on or taken off reads as a change
     waiting, AS TODAY"; D99, D100: the list of what is waiting says "where, before → after, who and when". Until the
     marks became the input's (step 4) the line of a cancelled request row read as a cancelled row of the scheduler's
     own still does — "MAINT CONF @ ENG WING → MAINT CONF @ ENG WING · CX (WX)" (ui/pendlist.ts valueWords). Since then
     the line of a cancelled INPUT reads only "changed": the scheduler signing the amendment is not told it is a cancel,
     nor why. The red box and "information only" read "changed" the same way. The cause: ui/pendlist.ts inputWords
     pairs the people, the kind, the title, the hours and the remark of the issued record and the live one — and none
     of the three marks. */
  describe('the "To go out" line of an input cancelled on a published day says it is cancelled, and why (D760 reading 3; D99, D100)', () => {
    const lineOf = (text: string) => [...dom(pendListHTML(WED)).querySelectorAll('.pl-item')].find(x => (x.textContent || '').includes(text)) as HTMLElement
    it('THE CONTROL — a row of the scheduler\'s own, cancelled on a published day: "… → … · CX (OWNWX)"', async () => {
      await boot()
      publish(WED)
      const own = ground(WED).findIndex((g: any) => g && !g.src)
      expect(own, 'the demo Wednesday has a ground row nobody filed').toBeGreaterThanOrEqual(0)
      setBoardDay(WED); press({ grcx: `${WED}.${own}` }); cxCommit(true, 'OWNWX')
      expect(dayPendingItems(WED)).toHaveLength(1)
      const chg = dom(pendListHTML(WED)).querySelector('.pl-chg') as HTMLElement
      expect(chg.textContent).toMatch(/CX \(OWNWX\)$/)
    })
    for (const ppl of [['bane'], ['bane', 'pike']])
      it(`an input for ${ppl.length === 1 ? 'one person' : 'two people'}: the line says the cancel and the reason — not only "changed"`, async () => {
        await boot()
        file(ppl)
        publish(WED)
        cx(WED, 'ZZWX')
        expect(dayPendingItems(WED), 'ONE change waiting (D736)').toHaveLength(1)
        const chg = lineOf(TITLE).querySelector('.pl-chg') as HTMLElement
        expect(chg.textContent, 'what is going out').toMatch(/CX|cancel/i)
        expect(chg.textContent, 'and why').toContain('ZZWX')
      })
  })

  describe('a very long title and a very long reason on the schedule\'s lines', () => {
    it('both are in the page whole; the reason is the part a narrow place may drop, "CX" is not', async () => {
      await boot()
      file(['bane'], WED, { title: LONG_TITLE })
      cx(WED, LONG_WHY)
      for (const line of [weekPI()[0], boardPI()[0], boardPI(WED, true)[0]]) {
        const tag = line.querySelector('.cxtag') as HTMLElement
        expect(tag.textContent).toBe('CX DUE ' + LONG_WHY)
        expect(tag.childNodes[0].textContent, 'the tag\'s own word stands outside the droppable part').toBe('CX')
        expect(tag.querySelector('.cxwhy')!.textContent).toBe(' DUE ' + LONG_WHY)
        expect(line.querySelector('.inp-cx')!.textContent).toBe(LONG_TITLE)
      }
    })
  })

  describe('brought back, the schedule\'s lines are what they were — to the character', () => {
    it('cancel and un-cancel by the button: the record keeps no reason, and View-only Sched, Edit Schedule and the board draw the day as before', async () => {
      await boot()
      file(['bane', 'pike'])
      view.PIOPEN.add(WED)
      /* (the day's own count of changes made — "3 changes" — is its history, and rightly grew by two: left out) */
      const n = (h: string) => h.replace(/\d+(&nbsp;| )changes?/g, 'N changes')
      const snap = () => ({ view: n(dayHTML(WED, false)), edit: n(dayHTML(WED, true)), board: n(boardHTML(WED)), ro: n(boardHTML(WED, true)) })
      const before = snap()
      cx(WED, 'WX')
      expect(snap().edit, 'the control: cancelled, the day is drawn differently').not.toBe(before.edit)
      uncx(WED)
      expect(the().cx).toBe(false)
      expect('cxr' in the(), 'un-cancel leaves no reason behind').toBe(false)
      const after = snap()
      expect(after.view).toBe(before.view)
      expect(after.edit).toBe(before.edit)
      expect(after.board).toBe(before.board)
      expect(after.ro).toBe(before.ro)
    })
    it('a record that is NOT cancelled but still carries a reason (cx: false, cxr) draws no tag and strikes nothing, anywhere', async () => {
      await boot()
      file(['bane'])
      view.PIOPEN.add(WED)
      const before = { edit: dayHTML(WED, true), board: boardHTML(WED), ro: boardHTML(WED, true) }
      the().cx = false; the().cxr = 'STALE'
      expect(dayHTML(WED, true)).toBe(before.edit)
      expect(boardHTML(WED)).toBe(before.board)
      expect(boardHTML(WED, true)).toBe(before.ro)
      expect(cxSays(the())).toBe('')
      expect(cardOf([the()]).why).toBe('')
    })
  })

  describe('nothing of this reaches a line that is NOT cancelled', () => {
    it('the demo week, every day, on View-only Sched, Edit Schedule, the board and the read-only board: no tag, no struck name', async () => {
      await boot()
      for (let di = 0; di < 7; di++) {
        view.PIOPEN.add(di); setBoardDay(di)
        for (const html of [dayHTML(di, false), dayHTML(di, true), boardHTML(di), boardHTML(di, true)]) {
          expect(html, `day ${di}`).not.toContain('inp-cx')
          expect(html, `day ${di}`).not.toContain('cxwhy')
        }
      }
    })
    it('a cancelled input changes its OWN lines only: another input\'s line under Personal Inputs is the line it was', async () => {
      await boot()
      file(['bane'])
      file(['pike'], WED, { title: 'Guard brief', remarks: 'ctl9 other' })
      const other = () => [weekPI(WED, 'ctl9')[0].outerHTML, boardPI(WED, undefined, 'ctl9')[0].outerHTML, boardPI(WED, true, 'ctl9')[0].outerHTML]
      const before = other()
      cx(WED, 'WX')
      expect(other()).toEqual(before)
    })
  })

  describe('the real button and the Inputs pages\' own readers agree (D760 — the CX is the input\'s)', () => {
    it('cancelled on the board: the card\'s facts, the bar\'s item and the tooltip\'s words say so; brought back, none does', async () => {
      await boot()
      file(['bane', 'pike'])
      const F = { fType: 'all', fPerson: 'all', fSearch: '' } as any
      const bar = () => { const { cx: c, rows: _r, ...rest } = monthItems([the()], F)[0] as any; return { c, rest } }
      const plain = bar()
      cx(WED, 'WX')
      expect([cardOf([the()]).cx, cardOf([the()]).why]).toEqual([true, 'WX'])
      expect(bar().c).toBe(true)
      expect(bar().rest, 'nothing else of the bar moved').toEqual(plain.rest)
      expect(cxSays(the())).toBe('Cancelled — WX')
      uncx(WED)
      expect([cardOf([the()]).cx, cardOf([the()]).why, bar().c, cxSays(the())]).toEqual([false, '', false, ''])
    })
    it('the red box and "information only" pressed beside the CX: the line under Personal Inputs keeps its tag and struck name; the card says nothing more', async () => {
      await boot()
      file(['bane'])
      cx(WED, 'WX')
      const card = cardOf([the()])
      redBox(WED); infoOnly(WED)
      expect([the().cx, !!the().flag, !!the().info]).toEqual([true, true, true])
      expect(weekPI()[0].querySelector('.nm .cxtag')!.textContent).toBe('CX DUE WX')
      expect(weekPI()[0].querySelector('.nm .inp-cx')!.textContent).toBe(TITLE)
      oneCell(boardPI()[0], TITLE)
      expect(cardOf([the()]), 'shown on the schedule only (D760)').toEqual(card)
    })
  })

  describe('a cancelled bar dragged to another day on the Inputs calendar (D760 — "it goes with the input if it moves")', () => {
    it('a scheduler\'s drag: the input moves, still cancelled with its reason; its row is on the new day, cancelled, and nothing of it is left on the old', async () => {
      await boot()
      file(['bane', 'pike'])
      cx(WED, 'WX')
      expect(commitChipMove({ kind: 'input', iid: the().iid }, ISO[WED] as string, ISO[THU] as string)).toBe(true)
      expect([the().date, the().cx, the().cxr]).toEqual([LBL[THU], true, 'WX'])
      expect(riOf(WED), 'no row left on the Wednesday').toBe(-1)
      expect([!!rowOf(THU).cx, rowOf(THU).cxr]).toEqual([true, 'WX'])
      expect(weekPI(THU)[0].querySelector('.nm .cxtag')!.textContent).toBe('CX DUE WX')
      expect(weekPI(WED)).toHaveLength(0)
    })
    it('the member whose input it is drags his own cancelled input: it moves, and it is still cancelled', async () => {
      await boot()
      member('bane')
      expect(commitInput(null, DRAFT(WED), ['bane'])).toBe(true)
      admin(); cx(WED, 'WX')
      member('bane')
      expect(commitChipMove({ kind: 'input', iid: the().iid }, ISO[WED] as string, ISO[THU] as string)).toBe(true)
      expect([the().date, the().cx, the().cxr]).toEqual([LBL[THU], true, 'WX'])
    })
  })

  describe('the next-week peek draws no line of an input\'s own — its ROW there reads cancelled as any row does', () => {
    it('the cancelled input\'s row in the peek: the schedule\'s tag with its reason; no input line, no input tag', async () => {
      await boot()
      file(['bane'])
      cx(WED, 'WX')
      const d = dom(peekDayHTML(DAYS[WED], WED, false))
      const row = [...d.querySelectorAll('.pl-row')].find(r => (r.textContent || '').toUpperCase().includes(TITLE.toUpperCase())) as HTMLElement
      expect(row, 'its row').toBeTruthy()
      expect(row.classList.contains('cx')).toBe(true)
      expect(row.querySelector('.cxtag')!.textContent).toBe('CX DUE WX')
      expect(d.querySelector('.inp-cxtag, .inp-cx'), 'the peek has no Personal Inputs or Unavailable line').toBeNull()
    })
  })

  describe('only a request\'s ROW carries the CX button — an absence cannot be cancelled by any door here', () => {
    it('leave under Unavailable: no CX button on its line, on the week or the board; the marks door answers "none" for its address, and the record is untouched', async () => {
      await boot()
      expect(commitInput(null, draftOf({ person: 'bane', type: 'LL', date: LBL[WED], yr: 2026, allday: true, remarks: MARK + ' leave' }), ['bane']), 'filed').toBe(true)
      const lines = [weekUnav(WED, true)[0], boardUnav(WED)[0]]
      for (const line of lines) {
        expect(line, 'its line').toBeTruthy()
        expect([...line.querySelectorAll('button')].filter(b => (b.textContent || '').trim() === 'CX'), 'no CX button').toHaveLength(0)
        expect(line.querySelector('[data-grcx], [data-pcx], [data-dcx], [data-scx]')).toBeNull()
      }
      expect(rowMark('iu:' + the().iid, 'cx', true, 'WX')).toBe('none')
      expect(the().cx, 'nothing was written').toBeUndefined()
      expect(weekUnav(WED, true)[0].querySelector('.cxtag')).toBeNull()
    })
  })

  describe('a reader who is not shown the squadron\'s medical detail (state/perms.ts mayReadMedicalOf) learns nothing from a cancel', () => {
    it('a medical line he reads only as "Unavailable" shows no tag and no reason, even on a record that carries both', async () => {
      await boot()
      INPUTS.push({ iid: 'zmed1', person: 'bane', type: 'OML', date: LBL[WED], yr: 2026, allday: true, remarks: 'knee ' + MARK, cx: true, cxr: 'SECRETWX' } as any)
      setSession({ user: 'x', role: 'off', name: 'x' } as any)
      const html = dayHTML(WED, false)
      expect(html).toContain('sec-unav')
      expect(html, 'the reason').not.toContain('SECRETWX')
      expect(html, 'the remark').not.toContain('knee')
      const unav = dom(html).querySelector('.sec-unav')!
      expect(unav.querySelector('.cxtag, .inp-cx'), 'no tag, nothing struck').toBeNull()
      expect([...unav.querySelectorAll('.nm .ntx')].some(x => x.textContent === 'Unavailable'), 'the line is there, as "Unavailable"').toBe(true)
    })
  })
})

/* ============================== THE STYLESHEET'S PART OF THE LOOK ============================== */
/* jsdom lays nothing out and reads no stylesheet, so every case above pins a CLASS. What the class DOES is D767's own
   words — "strike through the title", "the reason … is red", the bar "faded" — and lives in the stylesheet; these are
   read from its source (testing/scheduler-css.ts), as ui/scheduler-css-order.test.ts reads it. */
describe('the stylesheet gives the classes D767\'s look', () => {
  const css = readSchedulerCss().replace(/\/\*[\s\S]*?\*\//g, '')
  /* every declaration the sheet gives one selector, whichever rules list it */
  const decl = (sel: string) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(m => m[1]!.split(',').map(x => x.trim()).includes(sel)).map(m => m[2]!.replace(/\s+/g, '')).join(';')
  it('the name an input goes by is struck through — the card\'s title and kind, the list\'s title and pill, the schedule\'s line, the bar', () => {
    for (const sel of ['.icard-title.is-cx', '.icard-kind.is-cx', '.intitle.is-cx', '.intag.is-cx', '.inp-cx', '.ib-bar.is-cx'])
      expect(decl(sel), sel).toContain('text-decoration:line-through')
  })
  it('the bar is faded and nothing else is; the tag and the reason are the schedule\'s own red, and the tag itself is never struck', () => {
    const fade = /opacity:(0?\.\d+)/.exec(decl('.ib-bar.is-cx'))
    expect(fade && +fade[1]!, 'the bar: faded, still readable').toBeGreaterThanOrEqual(0.4)
    expect(fade && +fade[1]!).toBeLessThan(1)
    for (const sel of ['.icard-title.is-cx', '.icard-kind.is-cx', '.intitle.is-cx', '.intag.is-cx', '.inp-cx', '.icx', '.icx-why'])
      expect(decl(sel), sel + ' is not faded or hidden').not.toMatch(/opacity:|display:none|visibility:hidden/)
    expect(decl('.icx')).toContain('background:var(--hard)')
    expect(decl('.icx'), 'the tag sits inside a struck name\'s row and must not take the strike').toContain('text-decoration:none')
    expect(decl('.icx-why')).toContain('color:var(--hard)')
    expect(/--hard:#F0555F/i.test(css), 'the app\'s red').toBe(true)
  })
  it('a long reason wraps where it is shown (D719); only a PHONE\'s board row drops it, and keeps "CX" (D767 — "no space to show reason")', () => {
    expect(decl('.icx-why')).toContain('overflow-wrap:anywhere')
    expect(decl('.in-cxline')).toContain('overflow-wrap:anywhere')
    expect(decl('.icx'), 'the tag is one word, never broken').toContain('white-space:nowrap')
    expect(decl('.inp-cxtag')).toContain('white-space:nowrap')
    const drops = [...css.matchAll(/@media\s*\(([^)]*)\)\s*\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)].filter(m => /\.cxwhy[^{}]*\{[^{}]*display:none/.test(m[2]!))
    expect(drops.length, 'one place drops the reason').toBe(1)
    expect(drops[0]![1]!.replace(/\s+/g, '')).toBe('max-width:820px')
    expect(drops[0]![2]!, 'the board\'s rows only — never the week\'s line, the card or the list').toMatch(/^\s*\.sb-arow \.inp-cxtag \.cxwhy,\s*\.sbi-row \.inp-cxtag \.cxwhy\{display:none\}\s*$/)
    expect(css.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*\s*\}/g, ''), 'outside that, nothing hides it').not.toMatch(/\.cxwhy[^{}]*\{[^{}]*display:none/)
  })
})
