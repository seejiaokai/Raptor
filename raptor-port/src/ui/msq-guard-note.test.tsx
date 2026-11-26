// @vitest-environment jsdom
/* THE GUARD'S NOTE — WHAT A REFUSAL SAYS, AND WHERE IT STANDS (the guard rail's plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §4.6, §4.7's paragraph on this file; step K3, chat 204; the
   words table of docs/superpowers/briefs/2026-11-26-msq-s1-k3-brief.md).

   jsdom draws nothing, so this file holds which control, which words and which place a made-up set of boxes gives — never
   the geometry of the running app, which is the browser tests' (step K12) and the drawing check's.
   - The door → place table, row by row; a press inside the ☰ menu → the foot; toastAt then a plain toast → the plain
     place again, toastAt's own toast never; the reader's region carries the words; the note wears the blocked face.
   - The words: every lead of the two tables raised by its REAL state — each opened by the very opener part A's tests use
     (ui/msq-guard-testkit.tsx, shared, never a second set) — joined to every ending, the whole sentence compared with the
     tables' own constants (a change of words moves no test).
   - "Words owed": each state that has no words of his yet is pinned to the plain words it says today, with a comment
     naming the words that wait for him.
   - The placing function, pure, with made-up boxes.
   No door calls the seam yet (K4–K6): the tests hand the seam a refusal themselves, as a door will.

   The world: three squadrons (test-support/msq-world.ts withThird — his D2630); Hunter, 142's admin with Plan of 149 and
   View of 150, opens the windows, as in ui/msq-guard-open.test.tsx. */
import { describe, it, expect, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act } from '@testing-library/react'
import { withThird, third } from '../test-support/msq-world'
import { setPage } from '../state/view'
import { setDaysWin, setOilList, setBellList } from './pops'
import { whatIsOpen, guardWords, guardLead, GUARD_LEADS, GUARD_ENDINGS, workSay, calendarOver, trackerBehindInfo, usersOutOfSight, type GuardWordsAt } from './guard'
import { refuse } from '../state/guard'
import { toast, toastAt, placeToast, placeNote, noteAtFoot, clearToast, NOTE_X, type NoteBox, type NotePlaceIn } from './toast'
import { noteAtFor, guardSay } from './guardnote'
import {
  $, C, OPEN, MM, app, doing, press, settle, tid, typeIn, goAdmin, goTracker, openTrkAsk,
  guardTeardown, phoneWidth, TRK_OPENERS, trkOpen, openHolidayNoLeave, openHolidayChanged,
} from './msq-guard-testkit'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()

afterEach(async () => {
  await guardTeardown()
  clearToast()
  document.getElementById('toastEl')?.remove()
  document.getElementById('srSay')?.remove()
  document.querySelectorAll('[data-k3-fake]').forEach(n => n.remove())
  ;(window as any).matchMedia = MM
})

/* the shell's own width for "a phone" (ui/floatwin.ts phoneLayout — 22-float-windows.css's 620px), as the toast's own place
   tests make it say so (toastplace.test.tsx asPhone) */
const asPhone = () => {
  ;(window as any).matchMedia = (q: string) => ({ matches: /max-width:\s*620px/.test(q), media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false })
}

/* the note of the row that refuses now, for a door and where it goes */
function words(door = 'pick', to = 'u149', at: GuardWordsAt = {}): string | null {
  const w = whatIsOpen()
  expect(w, 'the premise: something refuses').not.toBeNull()
  return guardWords(w!.reason, w!.row, door, to, at)
}
/* EVERY ENDING (D2590, D2627 A8): a pick of 149, a pick of 150, the switch both ways, a bell line, a tap on the lit bell */
const ENDS = (): Array<[string, string, string]> => [
  ['pick', 'u149', GUARD_ENDINGS.pick('149')],
  ['pick', third.u150, GUARD_ENDINGS.pick('150')],
  ['toMember', '', GUARD_ENDINGS.toMember],
  ['toAdmin', '', GUARD_ENDINGS.toAdmin],
  ['line', 'u149', GUARD_ENDINGS.line],
  ['bell', 'u149', GUARD_ENDINGS.bell],
]
/** the row that refuses now takes `lead`, and its note joined to every ending is the table's sentence */
function saysEvery(lead: string, id?: string, at: GuardWordsAt = {}) {
  if (id) expect(whatIsOpen()?.row.id, 'the row that refuses').toBe(id)
  for (const [door, to, end] of ENDS()) expect(words(door, to, at), `${door} ${to}`).toBe(`Blocked: ${lead}, then ${end}`)
}

describe('the words — each lead raised by its real state, joined to every ending', () => {
  it('a window open (the OIL list, drawn over every page): "close the open window"', async () => {
    await app('hunter')
    await OPEN.oilday!.open()
    saysEvery(GUARD_LEADS.window, 'oilday')
  })
  it('a door with no ending of his yet (a card, the page door, K8\'s Undo) says nothing — no words are drafted for it', async () => {
    await app('hunter')
    await OPEN.oilday!.open()
    for (const door of ['card', 'page', 'undo']) expect(words(door, 'u149'), door).toBeNull()
  })
  it('a Leave War window: in sight "close the open window"; behind the Inputs tab "…on the Leave War" (D2627 A7)', async () => {
    await app('hunter')
    await OPEN.lwsheet!.open()
    saysEvery(GUARD_LEADS.window, 'lwsheet')
    await doing(() => setPage('inputs'))
    saysEvery(GUARD_LEADS.windowOnLeaveWar, 'lwsheet')
  })
  it('a Tracker window (Show All): in sight "close the open window"; behind the Inputs tab "…on the Tracker" (D2627 A7)', async () => {
    await app('hunter')
    await OPEN.trk!.open()
    saysEvery(GUARD_LEADS.window, 'trk')
    await doing(() => setPage('inputs'))
    saysEvery(GUARD_LEADS.windowOnTracker, 'trk')
  })
  it('an opened Users row changed, an archived man\'s row changed, a squadron\'s move, a place being edited: "save or cancel the open row"', async () => {
    await app('hunter')
    await OPEN.userrow!.open()
    saysEvery(GUARD_LEADS.row, 'userrow')
    await guardTeardown(); await app('hunter')
    await OPEN.archrow!.open()
    saysEvery(GUARD_LEADS.row, 'archrow')
    await guardTeardown(); await app('hunter')
    await OPEN.sqnmove!.open()
    saysEvery(GUARD_LEADS.row, 'sqnmove')
    await guardTeardown(); await app('hunter')
    await OPEN.placeedit!.open()
    saysEvery(GUARD_LEADS.row, 'placeedit')
  })
  it('a Users row with another Admin section showing: the words "…on Users" when the section is handed in (read live: the review round\'s tests)', async () => {
    await app('hunter')
    await OPEN.userrow!.open()
    saysEvery(GUARD_LEADS.rowOnUsers, 'userrow', { usersOut: true })
  })
  it('Give access: "finish or cancel giving access"', async () => {
    await app('hunter')
    await OPEN.giveaccess!.open()
    saysEvery(GUARD_LEADS.giveAccess, 'giveaccess')
  })
  it('"+ New squadron" with a number typed: "save or cancel the new squadron"', async () => {
    await app('hunter')
    await OPEN.newsqn!.open()
    saysEvery(GUARD_LEADS.newSquadron, 'newsqn')
  })
  it('Add a person with a callsign typed: "add or cancel the new person"', async () => {
    await app('hunter')
    await OPEN.addperson!.open()
    saysEvery(GUARD_LEADS.addPerson, 'addperson')
  })
  it('words in Quals\' "Add qualification": "add or clear the new qualification"', async () => {
    await app('hunter')
    await OPEN.qualsnew!.open()
    saysEvery(GUARD_LEADS.newQual, 'qualsnew')
  })
  it('a new holiday with a name typed: "save or cancel the new holiday"', async () => {
    await app('hunter')
    await OPEN.holiday!.open()
    expect(workSay('holiday'), 'what the form hands over').toBe('new')
    saysEvery(GUARD_LEADS.holidayNew, 'holiday')
  })
  it('a holiday on the year\'s list opened and changed: "save or cancel the changed holiday"', async () => {
    await app('hunter')
    await openHolidayChanged()
    expect(workSay('holiday')).toBe('changed')
    saysEvery(GUARD_LEADS.holidayChanged, 'holiday')
  })
  it('a new holiday no leave period covers, refused and kept waiting: "cancel the new holiday, or create its leave period"', async () => {
    await app('hunter')
    await openHolidayNoLeave()
    expect(tid('hol-waiting'), 'the premise: kept waiting for a period').not.toBeNull()
    expect(workSay('holiday')).toBe('noleave')
    saysEvery(GUARD_LEADS.holidayNoLeave, 'holiday')
  })
  it('"Every Monday" with a choice pressed quotes its own weekday — and "Every Tuesday" its own', async () => {
    await app('hunter')
    await OPEN.everywd!.open()
    saysEvery(GUARD_LEADS.everyWeekday('Every Monday'), 'everywd')
    expect(GUARD_LEADS.everyWeekday('Every Monday')).toBe('save or cancel “Every Monday”')
    await guardTeardown(); await app('hunter')
    await doing(() => setDaysWin('2026-07-01'))
    await press(tid('days-wd-1'), 'Every Tuesday…')
    await press(tid('every-cls-day'), 'Day')
    expect(workSay('everywd'), 'the window hands over its own title').toBe('Every Tuesday')
    saysEvery(GUARD_LEADS.everyWeekday('Every Tuesday'), 'everywd')
  })
  it('a holiday sheet read in, not added: "add or cancel the sheet’s holidays"', async () => {
    await app('hunter')
    await OPEN.holimport!.open()
    saysEvery(GUARD_LEADS.sheetHolidays, 'holimport')
  })
  it('Inputs calendar settings changed, in sight (a desktop, the Calendar beside it): "save or cancel Inputs calendar settings"', async () => {
    await app('hunter')
    await OPEN.inputsset!.open()
    saysEvery(GUARD_LEADS.inputsSettings, 'inputsset')
    await press(tid('iset-days'), 'Calendar…')
    expect(calendarOver('inputsset'), 'a desktop: both in sight').toBe(false)
    saysEvery(GUARD_LEADS.inputsSettings, 'inputsset')
  })
  it('Inputs calendar settings changed, lying under the Calendar (a phone): "close the Calendar, save or cancel Inputs calendar settings" (D2729 Q3)', async () => {
    asPhone()
    await app('hunter')
    await OPEN.inputsset!.open()
    expect(calendarOver('inputsset'), 'no Calendar up: in sight').toBe(false)
    saysEvery(GUARD_LEADS.inputsSettings, 'inputsset')
    await press(tid('iset-days'), 'Calendar…')
    expect(calendarOver('inputsset'), 'the Calendar brought forward over it').toBe(true)
    saysEvery(GUARD_LEADS.inputsSettingsUnderCal, 'inputsset')
  })
  it('SANS calendar settings changed, in sight (a desktop): "save or cancel SANS calendar settings"', async () => {
    await app('hunter')
    await OPEN.sansset!.open()
    saysEvery(GUARD_LEADS.sansSettings, 'sansset')
    await press(tid('sset-days'), 'Calendar…')
    saysEvery(GUARD_LEADS.sansSettings, 'sansset')
  })
  it('SANS calendar settings changed, lying under the Calendar (a phone): "close the Calendar, save or cancel SANS calendar settings" (D2741, card 9)', async () => {
    asPhone()
    await app('hunter')
    await OPEN.sansset!.open()
    saysEvery(GUARD_LEADS.sansSettings, 'sansset')
    await press(tid('sset-days'), 'Calendar…')
    saysEvery(GUARD_LEADS.sansSettingsUnderCal, 'sansset')
  })
  it('a change not saved: "press Retry to save your changes" (D2627 A13)', async () => {
    await app('hunter')
    await OPEN.unsaved!.open()
    saysEvery(GUARD_LEADS.retry, 'unsaved')
  })
})

describe('two at once — named one at a time, in GUARD_ORDER (D2627 A10; D2729 Q4)', () => {
  it('a half-done holiday and changed Inputs settings: the holiday first; once cancelled, the settings', async () => {
    await app('hunter')
    await OPEN.inputsset!.open()
    await press(tid('iset-days'), 'Calendar…')
    await press(tid('hol-add'), 'Add a holiday')
    await typeIn('[data-testid="hol-name"]', 'Founders')
    saysEvery(GUARD_LEADS.holidayNew, 'holiday')
    await press(tid('hol-cancel'), 'the holiday\'s Cancel')
    saysEvery(GUARD_LEADS.inputsSettings, 'inputsset')
  })
  it('a window, a row and a failed save: the window first, then the row, then Retry', async () => {
    await app('hunter')
    await OPEN.userrow!.open()
    await OPEN.unsaved!.open()
    await OPEN.oilday!.open()
    saysEvery(GUARD_LEADS.window, 'oilday')
    await doing(() => setOilList(null))
    saysEvery(GUARD_LEADS.row, 'userrow')
    await press($('#accEdCancel'), 'the row\'s Cancel')
    saysEvery(GUARD_LEADS.retry, 'unsaved')
  })
})

describe('Words owed — each state with no words of his yet, pinned to the plain words it says today', () => {
  it('a Tracker window behind the phone\'s Flow chart tab (a lull pop-up holding a choice): "…on the Tracker" — the Info tab\'s lead waits for him', async () => {
    /* WAITS FOR HIM (question 19): "close the open window on the Tracker’s Info tab" — the reviewed draft, never drawn.
       Built with his A7 words, true there; the `behind` mark reaches the words (trackerBehindInfo), so his answer is a
       one-line change in ui/guard.ts guardLead */
    phoneWidth()
    await app('hunter')
    await goTracker()
    await press($('#viewtabs [data-view="info"]'), 'the Info tab')
    await TRK_OPENERS.lullPick!()
    await press($('#lullCal .day:not(.out)'), 'a first day of the period')
    await press($('#viewtabs [data-view="flow"]'), 'the Flow chart tab')
    expect(trkOpen('lullPick'), 'the premise: behind the Info tab').toMatchObject({ counts: 'window', behind: 'info' })
    expect(trackerBehindInfo()).toBe(true)
    saysEvery(GUARD_LEADS.windowOnTracker, 'trk')
    await press($('#viewtabs [data-view="info"]'), 'the Info tab again')
    expect(trackerBehindInfo(), 'in sight again').toBe(false)
    saysEvery(GUARD_LEADS.window, 'trk')
  })
  it('the Tracker\'s unsaved-edits question: "close the open window", never "…on the Tracker" — and no press reaches a door while it stands', async () => {
    /* WAITS FOR HIM (question 21): the note calls a question a "window" though its buttons read Stay, Discard them, Save
       them. Built with the plain lead. WHETHER A DOOR CAN BE REACHED WHILE IT STANDS: by the keys, no — the question takes
       them on its safe answer, Stay, and its Tab is held inside it (tracker/components/Modals.jsx trapTab): a Tab from its
       last button lands on its first, never on the picker, the badge or the bell behind it. By the pointer: its shade is
       a press on Stay, and the page it is drawn in covers the whole screen, top bar included, above it
       (tracker.css `#page-tracker.trk-askonly` — position:fixed, inset:0, z-index:700): a stylesheet rule jsdom does not
       load, so that half is the browser tests'. */
    await app('hunter')
    await openTrkAsk()
    expect(C.dlg, 'the premise: the question stands').toBeTruthy()
    expect(document.activeElement?.id, 'the keys on Stay').toBe('dlgCancel')
    saysEvery(GUARD_LEADS.window, 'trkask')
    const box = $('#dlgModal')!
    const keys = [...box.querySelectorAll<HTMLElement>('input, button, textarea, select, [tabindex]:not([tabindex="-1"])')].filter(b => !(b as HTMLButtonElement).disabled)
    const last = keys[keys.length - 1]!
    last.focus()
    let held = false
    await act(async () => { held = !last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })) })
    expect(held, 'a Tab from its last button is held').toBe(true)
    expect(box.contains(document.activeElement), 'the keys stay inside the question').toBe(true)
    expect(['sqnMenuBtn', 'roleBadge'].includes(document.activeElement?.id ?? ''), 'never on the picker or the badge').toBe(false)
    await act(async () => { $('#dlgOverlay')!.click() })
    await settle()
    expect(C.dlg, 'a press on its shade is Stay: the question gone, nothing else pressed').toBeFalsy()
  })
  it('a squadron\'s move or a place being edited, the Users section showing: "save or cancel the open row" — "…on Squadrons" waits for him', async () => {
    /* WAITS FOR HIM (question 20): "save or cancel the open row on Squadrons" — reviewed, never drawn */
    await app('hunter')
    await OPEN.sqnmove!.open()
    await goAdmin('Users')
    saysEvery(GUARD_LEADS.row, 'sqnmove')
    await guardTeardown(); await app('hunter')
    await OPEN.placeedit!.open()
    await goAdmin('Users')
    saysEvery(GUARD_LEADS.row, 'placeedit')
  })
  it('"+ New squadron" typed, the Users section showing: "save or cancel the new squadron" (no "on …")', async () => {
    await app('hunter')
    await OPEN.newsqn!.open()
    await goAdmin('Users')
    saysEvery(GUARD_LEADS.newSquadron, 'newsqn')
  })
  it('the Users section\'s report (the review round): in sight on Users, out of sight on Squadrons, nothing once Admin unmounts', async () => {
    await app('hunter')
    await goAdmin('Users')
    expect(usersOutOfSight(), 'Users shown').toBe(false)
    await goAdmin('Squadrons')
    expect(usersOutOfSight(), 'Squadrons shown').toBe(true)
    await doing(() => setPage('help'))
    expect(usersOutOfSight(), 'Admin left: nothing reported').toBe(false)
  })
  it('a Users row changed, then the Squadrons section shown: "save or cancel the open row on Users" (D2627 A6), read live (the review round); back on Users: the plain lead', async () => {
    await app('hunter')
    await OPEN.userrow!.open()
    saysEvery(GUARD_LEADS.row, 'userrow')
    await goAdmin('Squadrons')
    expect(whatIsOpen()?.row.id, 'still the row (D2627 A6)').toBe('userrow')
    saysEvery(GUARD_LEADS.rowOnUsers, 'userrow')
    await goAdmin('Users')
    saysEvery(GUARD_LEADS.row, 'userrow')
  })
  it('an archived man\'s row changed, then the Squadrons section shown: "…on Users" too', async () => {
    await app('hunter')
    await OPEN.archrow!.open()
    await goAdmin('Squadrons')
    saysEvery(GUARD_LEADS.rowOnUsers, 'archrow')
  })
  it('Add a person typed, or Give access changed, then the Squadrons section shown: still refused, with no "on Users" — none ruled for them', async () => {
    /* WAITS FOR HIM (question 22, "any row left on a page out of sight"): his "…on Users" (D2627 A6) is ruled for an open
       row; for the two forms nothing is ruled or drawn — "add or cancel the new person on Users", "finish or cancel giving
       access on Users" would be drafts. Built with their own plain leads, though the section shown is now read live
       (the review round) */
    await app('hunter')
    await OPEN.addperson!.open()
    await goAdmin('Squadrons')
    saysEvery(GUARD_LEADS.addPerson, 'addperson')
    await guardTeardown(); await app('hunter')
    await OPEN.giveaccess!.open()
    await goAdmin('Squadrons')
    saysEvery(GUARD_LEADS.giveAccess, 'giveaccess')
  })
  it('every row whose page is a page (not drawn over every page) — each opened, then the Help tab: none still counts but the Leave War\'s and the Tracker\'s, which have their words', async () => {
    /* found by this test: the Inputs, Quals and Admin pages unmount when their tab is left (ui/Shell.tsx draws each only
       while it shows), Plans is drawn only on Edit Schedule (ui/windrawn.ts draftsDrawn), and so none of their rows can
       count with another page showing — no state needs words of its own. A day on the Inputs calendar goes with the page;
       the Input window does not go: on another page it is the schedule's own Input window (`inputdlg`, drawn over every
       page — ui/InputWindow.tsx), in sight there, and "close the open window" is true of it. */
    const pageRows = ['inputedit', 'inputsday', 'oilrevise', 'qualsnew', 'drafts', 'userrow', 'archrow', 'giveaccess', 'addperson', 'newsqn', 'sqnmove', 'placeedit'] as const
    const found: Record<string, string | null> = {}
    for (const id of pageRows) {
      await app('hunter')
      await OPEN[id]!.open()
      expect(whatIsOpen()?.row.id, `the premise: ${id} refuses on its page`).toBe(id)
      await doing(() => setPage('help'))
      found[id] = whatIsOpen()?.row.id ?? null
      if (id === 'inputedit') saysEvery(GUARD_LEADS.window, 'inputdlg')
      await guardTeardown()
    }
    expect(found).toEqual({ ...Object.fromEntries(pageRows.map(id => [id, null])), inputedit: 'inputdlg' })
  })
})

describe('the door → place table (§4.6 — "which control", never the geometry)', () => {
  const fake = (html: string) => { const d = document.createElement('div'); d.dataset.k3Fake = '1'; d.innerHTML = html; document.body.append(d); return d }
  it('each door names its control, its edge and what it stands under', () => {
    fake('<div class="topbar"><button id="sqnMenuBtn"></button><span id="roleBadge"></span><button class="bellbtn" id="bellBtn"></button></div>'
      + '<div class="bell-list"><button data-testid="bell-line-n7"></button></div><button class="bellbtn" id="sbBell"></button>')
    const pick = noteAtFor('pick')
    expect([pick.under()?.id, pick.edge, pick.below]).toEqual(['sqnMenuBtn', 'left', 'bar'])
    for (const d of ['toMember', 'toAdmin']) {
      const n = noteAtFor(d)
      expect([n.under()?.id, n.edge, n.below], d).toEqual(['roleBadge', 'right', 'bar'])
    }
    const line = noteAtFor('line', { line: 'n7' })
    expect([line.under()?.dataset.testid, line.edge, line.below, line.inside?.()?.className]).toEqual(['bell-line-n7', 'left', 'self', 'bell-list'])
    /* the bell its list was opened under (the board's, say) — else the bell drawn (none in jsdom: none drawn) */
    setBellList(true, 'sbBell')
    const bell = noteAtFor('bell')
    expect([bell.under()?.id, bell.edge, bell.below]).toEqual(['sbBell', 'right', 'bar'])
    setBellList(false)
    expect(noteAtFor('bell').under(), 'no list open, no bell drawn').toBeNull()
    for (const d of ['card', 'page']) expect(noteAtFor(d).under(), d).toBeNull()
  })
  it('no import cycle (the review round): the words\' file never loads the note; the app\'s shell and the test world do, once each', () => {
    const src = (rel: string) => readFileSync(join(__dirname, '..', rel), 'utf8')
    const loads = (s: string) => (s.match(/^import ['"][./]+(ui\/)?guardnote['"]/gm) ?? []).length
    expect(loads(src('ui/guard.ts')), 'ui/guard.ts').toBe(0)
    expect(/from ['"]\.\/guardnote['"]|import ['"]\.\/guardnote['"]/.test(src('ui/guard.ts')), 'ui/guard.ts names it nowhere').toBe(false)
    expect(loads(src('ui/Shell.tsx')), 'ui/Shell.tsx').toBe(1)
    expect(loads(src('test-support/msq-world.ts')), 'test-support/msq-world.ts').toBe(1)
  })
  it('a press inside the ☰ menu goes to the foot; on a desktop a press on the bar does not, on an upright phone it does (D2627 A14)', () => {
    expect(noteAtFor('pick', { from: 'drawer' }).from).toBe('drawer')
    expect(noteAtFoot('drawer')).toBe(true)
    expect(noteAtFoot('bar')).toBe(false)
    asPhone()
    expect(noteAtFoot('bar')).toBe(true)
  })
})

describe('toastAt — the note by the control, then back to the ordinary place', () => {
  /* a made-up desktop bar, its picker drawn at a place of our choosing, and the note's own box — jsdom measures nothing */
  const box = (el: HTMLElement, r: { left: number; top: number; width: number; height: number }) => {
    el.getClientRects = (() => [r]) as any
    el.getBoundingClientRect = (() => ({ ...r, x: r.left, y: r.top, right: r.left + r.width, bottom: r.top + r.height, toJSON() {} })) as any
  }
  const scene = () => {
    const d = document.createElement('div'); d.dataset.k3Fake = '1'
    d.innerHTML = '<div class="topbar"><button id="sqnMenuBtn"></button></div>'
    document.body.append(d)
    box(d.querySelector('.topbar')!, { left: 0, top: 0, width: 1024, height: 72 })
    box(d.querySelector('#sqnMenuBtn')!, { left: 60, top: 14, width: 100, height: 44 })
    const t = document.createElement('div'); t.id = 'toastEl'; document.body.append(t)
    box(t, { left: 0, top: 0, width: 320, height: 40 })
    return t
  }
  const W = 'Blocked: close the open window, then pick 149.'
  it('toastAt stands the note 8px under the bar, its left edge on the picker\'s; it stays there when placed again; a plain toast goes back to the plain place', () => {
    const t = scene()
    toastAt(W, noteAtFor('pick'))
    expect(t.dataset.at).toBe('ctl')
    expect([t.style.top, t.style.left, t.style.bottom, t.style.transform]).toEqual(['80px', '60px', 'auto', 'none'])
    placeToast()
    expect(t.dataset.at, 'its own toast and a later placing (a shell window opening) keep it').toBe('ctl')
    toast('Saved', 'ok')
    expect(t.dataset.at, 'the next ordinary note').toBe('foot')
    expect([t.style.left, t.style.bottom, t.style.transform]).toEqual(['50%', '26px', 'translateX(-50%)'])
    placeToast()
    expect(t.dataset.at, 'and it stays ordinary').toBe('foot')
  })
  it('the rise-in: the note by the control drops into place with no sideways shift; the next ordinary note rises as before (the review round)', () => {
    const t = scene()
    const moves: any[] = []
    ;(t as any).animate = (frames: any[]) => { moves.push(frames[0].transform) }
    toastAt(W, noteAtFor('pick'))
    toast('Saved', 'ok')
    expect(moves).toEqual(['translateY(-8px)', 'translateX(-50%) translateY(8px)'])
  })
  it('a press inside the ☰ menu: the foot, though the picker is drawn', () => {
    const t = scene()
    toastAt(W, noteAtFor('pick', { from: 'drawer' }))
    expect(t.dataset.at).toBe('foot')
  })
  it('a control not drawn: the foot', () => {
    const t = document.createElement('div'); t.id = 'toastEl'; document.body.append(t)
    toastAt(W, noteAtFor('toMember'))
    expect(t.dataset.at).toBe('foot')
  })
  it('the blocked face, and the reader\'s region carries the words', async () => {
    toastAt(W, noteAtFor('pick'))
    const t = document.getElementById('toastEl')!
    expect(t.dataset.face).toBe('blocked')
    expect(t.querySelector('b')?.textContent).toBe('Blocked:')
    expect(t.textContent).toBe(W)
    await new Promise(r => setTimeout(r, 60))
    expect(document.getElementById('srSay')?.textContent).toBe(W)
  })
  it('through the seam: a refusal handed to it says the row\'s words, by the control of the door', async () => {
    await app('hunter')
    await OPEN.oilday!.open()
    expect(refuse('pick', 'u149', { from: 'bar' }), 'refused').toBe(true)
    const t = document.getElementById('toastEl')!
    expect(t.textContent).toBe(`Blocked: ${GUARD_LEADS.window}, then ${GUARD_ENDINGS.pick('149')}`)
    expect(t.dataset.face).toBe('blocked')
    /* and the seam's function is this file's */
    clearToast()
    guardSay({ reason: 'window', id: 'oilday', where: 'any' }, 'toAdmin', '', {})
    expect(t.textContent).toBe(`Blocked: ${GUARD_LEADS.window}, then ${GUARD_ENDINGS.toAdmin}`)
  })
  it('the names a lead hands the note are the controls its words point to', async () => {
    await app('hunter')
    await OPEN.holiday!.open()
    expect(guardLead(whatIsOpen()!.row).names).toContain('[data-testid="hol-save"]')
    expect(guardLead(whatIsOpen()!.row).names).toContain('[data-testid="hol-cancel"]')
  })
})

describe('placeNote — which place, from made-up boxes (§4.6)', () => {
  const B = (left: number, top: number, w: number, h: number): NoteBox => ({ left, top, right: left + w, bottom: top + h })
  /* a desktop, 1536×864, the top bar's foot at 72, the picker at its left */
  const desk = (o: Partial<NotePlaceIn> = {}): NotePlaceIn => ({
    w: 360, h: 40, wideH: 40, sw: 1536, sh: 864, foot: false, phone: false,
    ctl: B(60, 14, 100, 44), edge: 'left', below: 'bar', barFoot: 72, inside: null, xs: [], named: [], ...o,
  })
  /* an upright phone, 402×874 */
  const phone = (o: Partial<NotePlaceIn> = {}): NotePlaceIn => desk({ sw: 402, sh: 874, foot: true, phone: true, w: 300, h: 40, wideH: 60, ...o })
  it('under the control, with room: 8px under the bar\'s foot, its left edge on the control\'s', () => {
    expect(placeNote(desk())).toMatchObject({ at: 'ctl', top: 80, left: 60 })
  })
  it('the right edge on the badge\'s, held 8px inside the screen\'s right side', () => {
    expect(placeNote(desk({ ctl: B(1300, 14, 120, 44), edge: 'right' }))).toMatchObject({ at: 'ctl', left: 1420 - 360 })
    expect(placeNote(desk({ ctl: B(1300, 14, 236, 44), edge: 'right', w: 360 })).left, 'clamped').toBe(1536 - 8 - 360)
  })
  it('a window\'s ✕ in the way under the control: the next place, the foot', () => {
    expect(placeNote(desk({ xs: [B(380, 76, 36, 36)] }))).toMatchObject({ at: 'foot', top: 864 - 26 - 40 })
  })
  it('a ✕ at the foot too: the note rises to stand 8px above it, as above a control it names (the review round)', () => {
    const x = B(760, 810, 36, 36)
    const p = placeNote(desk({ xs: [B(380, 76, 36, 36), x] }))
    expect(p).toMatchObject({ at: 'foot', top: 810 - 8 - 40 })
  })
  it('rising above a ✕ checks again at the new place: a named control there too → above that', () => {
    const p = placeNote(phone({ xs: [B(346, 800, 44, 44)], named: [B(20, 730, 360, 30)] }))
    expect(p).toMatchObject({ at: 'foot', top: 730 - 8 - 60 })
  })
  it('the top only when rising leaves no room on the screen', () => {
    /* made-up boxes only: a ✕ or a named control in every band of the screen, so each rise meets the next until the note
       would stand less than 8px from the top */
    const bands = Array.from({ length: 12 }, (_, i) => B(20, 20 + i * 72, 360, 64))
    expect(placeNote(phone({ named: bands })).at).toBe('top')
    expect(placeNote(phone({ xs: bands })).at).toBe('top')
  })
  it('on an upright phone (noteAtFoot): the foot, 12px from each side', () => {
    expect(placeNote(phone())).toMatchObject({ at: 'foot', left: 12, w: 378, top: 874 - 26 - 60 })
  })
  it('a control it names under the foot: it rises to stand 8px above the highest it would cover, checked again at each new place', () => {
    /* the phone Calendar's holiday with no leave period (the drawing s1-cal-noleave-p): Cancel and Save at the form's foot,
       "Create the 2028 leave period" above them */
    const cancel = B(20, 806, 170, 40), save = B(210, 806, 170, 40), create = B(20, 752, 360, 40)
    const p = placeNote(phone({ named: [cancel, save, create] }))
    expect(p).toMatchObject({ at: 'foot', top: 752 - 8 - 60 })
    expect(p.top + p.h, '8px clear of the highest').toBe(create.top - 8)
  })
  it('the "Not saved" band up: under the band, never over the Retry it names', () => {
    const retry = B(300, 76, 64, 26)
    expect(placeNote(desk({ barFoot: 106, named: [retry] }))).toMatchObject({ at: 'ctl', top: 114 })
  })
  it('no control: the foot', () => {
    expect(placeNote(desk({ ctl: null }))).toMatchObject({ at: 'foot' })
  })
  it('a line inside the bell\'s list: under it where it fits, else 8px under the list, on its left edge', () => {
    const list = B(1100, 72, 420, 300)
    expect(placeNote(desk({ ctl: B(1110, 100, 400, 40), below: 'self', inside: list }))).toMatchObject({ at: 'ctl', top: 148, left: 1110 })
    expect(placeNote(desk({ ctl: B(1110, 320, 400, 40), below: 'self', inside: list }))).toMatchObject({ at: 'ctl', top: 380, left: 1100 })
  })
  it('the top is never taken in the cases of §4.6\'s table of sizes', () => {
    /* phone 402×874, the Input window open: its ✕ at its title strip — the foot (D2627 A15) */
    expect(placeNote(phone({ xs: [B(346, 96, 44, 44)] })).at).toBe('foot')
    /* phone, the Calendar (or Inputs settings) over the screen, its ✕ at its top: the foot */
    expect(placeNote(phone({ xs: [B(346, 24, 44, 44)] })).at).toBe('foot')
    /* a phone on its side, 874×402, the Input window under the picker, its ✕ at the window's top right: under the picker */
    expect(placeNote(desk({ sw: 874, sh: 402, w: 320, ctl: B(60, 10, 90, 40), barFoot: 60, xs: [B(800, 70, 40, 40)] })).at).toBe('ctl')
    /* tablet 768×1024 and desktop 1536×864, any window: under the control */
    expect(placeNote(desk({ sw: 768, sh: 1024 })).at).toBe('ctl')
    expect(placeNote(desk()).at).toBe('ctl')
  })
  it('the case K3 found reaching the top — a pick made inside ☰ on a desktop, a window dragged so its ✕ lies at the foot\'s centre — now stands 8px above that ✕ (the review round)', () => {
    expect(placeNote(desk({ foot: true, xs: [B(760, 812, 36, 36)] }))).toMatchObject({ at: 'foot', top: 812 - 8 - 40 })
  })
  it('the ✕ selectors are one constant', () => {
    expect(NOTE_X.split(',').map(s => s.trim())).toEqual(['.floatwin .win-x', '.airpop-head .x', '.modal-head .x', '.bidsheet-hd .x'])
  })
})
