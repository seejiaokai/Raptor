// @vitest-environment jsdom
/* THE SCHEDULE SIDE'S OPEN WINDOWS AT MIDNIGHT OF A MAN'S OWN MOVE (the walk of 21 Nov 26 — walker W3's W3-06a/b/c, findings
   W3-F2 and W3-F3; his D2243 Q7: a window open across the change is held, the band says so, nothing saved into the new
   squadron; the reshape plan §3.2 A-iv "Typed work at the swap": never saved into the new squadron, never dropped without
   a word). Only the Leave War's windows and the Tracker's editor were held (state/typing-hold.ts).
   Hunter, 142's admin, is 149's from Thu 16 Jul (moved on Wed 15 Jul).
   - W3-F3: "+ Input" on Inputs open at 23:57: at midnight its Person list turned 149's with no band, and Add saved.
   - W3-F2: text typed into an Edit Schedule box across midnight was dropped on leaving the box with no word (the row he
     typed in is not in 149's week) — and, where 149's week has a box at the same place, it is the gate alone that keeps a
     142 man's words out of it. */
import { useMsqWorld, signInAs, moveMan, pastMidnight, PID, on } from '../test-support/msq-world'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputEditor } from './InputWindow'
import { newInputSeed } from './inputedit'
import { INPEDIT, setInpEdit } from './pops'
import { notify } from '../state/store'
import { setPage, setInpView } from '../state/view'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { UNIT } from '../engine/unitview'
import { HOOKS } from '../engine/hooks'
import { stashDays } from '../engine/weekstash'
import { routeFocusIn, routeFocusOut } from './textedit'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

useMsqWorld()

const GENERIC = 'This change could not be saved.'
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const said = () => (HOOKS.toast as any).mock.calls.map((c: any[]) => String(c[0]))
const hunterMovesTonight = () => { on(15, 23, 57); signInAs('saber'); expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true }); signInAs('hunter') }

describe('W3-F3 — the input window open on Inputs across Hunter\'s midnight', () => {
  let host: HTMLDivElement, root: Root
  const options = () => [...document.querySelectorAll('#inpEditPerson option')].map(o => (o as HTMLOptionElement).value)
  beforeEach(async () => {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  })
  afterEach(async () => {
    await act(async () => { root.unmount(); setInpEdit(null) })
    host.remove()
  })
  /* Add, and the leave's document question answered "No document" where it is asked (an OL with none attached) */
  const add = async () => {
    await act(async () => { $('#inpEditSave')!.click() })
    const noDoc = [...document.querySelectorAll('button')].find(b => b.textContent === 'No document')
    if (noDoc) await act(async () => { noDoc.click() })
  }
  const openNew = async () => {
    setPage('inputs'); setInpView('cal')
    await act(async () => { root.render(<InputEditor />) })
    await act(async () => { setInpEdit({ ...newInputSeed('2026-07-20'), remarks: 'W3MIDB' }); notify() })
  }

  it('the window stays with the band, its Person list stays 142\'s, and Add saves nothing; Close closes it', async () => {
    hunterMovesTonight()
    await openNew()
    expect(options(), 'at 23:57 the list is 142\'s').toContain('glass')
    expect(options()).not.toContain('kes9')
    expect($('[data-testid="inped-moveband"]'), 'no band before midnight').toBeNull()
    const n = INPUTS.length
    await act(async () => { pastMidnight() })
    expect($('#inpEditSave'), 'the window stays open').toBeTruthy()
    const band = $('[data-testid="inped-moveband"]')
    expect(band, 'the band').toBeTruthy()
    expect(band!.textContent).toContain(GENERIC)
    expect(options(), 'the list he was choosing from stays').toContain('glass')
    expect(options(), 'never 149\'s people under his typing').not.toContain('kes9')
    await add()
    expect(INPUTS.length, 'nothing saved').toBe(n)
    expect(INPUTS.some((x: any) => x.remarks === 'W3MIDB')).toBe(false)
    expect(INPEDIT, 'still open after Add').toBeTruthy()
    await act(async () => { (band!.querySelector('button') as HTMLElement).click() })
    expect(INPEDIT, 'Close closes the window').toBeNull()
  })
  it('(control) with no move the same window across midnight has no band and Add saves', async () => {
    on(15, 23, 57); signInAs('hunter')
    await openNew()
    const n = INPUTS.length
    await act(async () => { pastMidnight() })
    expect($('[data-testid="inped-moveband"]')).toBeNull()
    await add()
    expect([INPUTS.length, said()]).toEqual([n + 1, ['Input added']])
  })
  it('(control) a window opened after midnight on 149\'s page has no band', async () => {
    hunterMovesTonight()
    setPage('inputs'); setInpView('cal')
    await act(async () => { root.render(<InputEditor />) })
    await act(async () => { pastMidnight() })
    await act(async () => { setInpEdit(newInputSeed('2026-07-20')); notify() })
    expect($('[data-testid="inped-moveband"]')).toBeNull()
    expect(options(), 'his own page\'s list now (a man who moves arrives a member: his own name)').not.toContain('glass')
  })
})

describe('W3-F2 — text typed into an Edit Schedule box across midnight', () => {
  let box: HTMLElement
  const typeAcross = (path: string, text: string) => {
    setPage('editsched')
    box = document.createElement('span'); box.dataset.txt = path; box.setAttribute('contenteditable', 'true')
    document.body.append(box)
    routeFocusIn({ target: box } as any)
    box.textContent = text
    pastMidnight()
    routeFocusOut({ target: box, relatedTarget: null } as any)
  }
  afterEach(() => box?.remove())

  it('Hunter\'s Common Programme words (Thu 16, 142\'s) are refused in words — never dropped silently', () => {
    hunterMovesTonight()
    expect(DAYS[3].allhands[1].prog).toBe('HQ ENGAGEMENT')
    typeAcross('ap:3.1.prog', 'W3MIDA TYPED')
    expect(UNIT, 'the page is 149\'s now').toBe('u149')
    expect(said()).toContain(GENERIC)
    expect(JSON.stringify(DAYS), 'nothing of it in 149\'s week').not.toContain('W3MIDA')
    expect(JSON.stringify(stashDays('u142@13/07/2026') ?? ''), 'nor in 142\'s').not.toContain('W3MIDA')
  })
  it('where 149\'s week has a box at the same place (a line\'s remarks), his words never land in it', () => {
    hunterMovesTonight()
    typeAcross('fr:3.0.0.0', 'W3MIDA REMARK')
    expect(DAYS[3].waves[0].formations[0].aircraft[0].rmks).toBe('1B: BFM-4')
    expect(said()).toEqual([GENERIC])
  })
  it('a box merely held across midnight, nothing typed, says nothing', () => {
    hunterMovesTonight()
    typeAcross('ap:3.1.prog', 'HQ ENGAGEMENT')
    expect(said()).toEqual([])
  })
  it('(control) with no move, words typed across midnight are saved', () => {
    on(15, 23, 57); signInAs('hunter')
    typeAcross('ap:3.1.prog', 'KEPT WORDS')
    expect(DAYS[3].allhands[1].prog).toBe('KEPT WORDS')
    expect(said()).toEqual([])
  })
})
