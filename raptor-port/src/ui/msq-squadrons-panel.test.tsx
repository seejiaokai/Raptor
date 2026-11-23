// @vitest-environment jsdom
/* ADMIN → SQUADRONS (batch 1's second half §6 — P2, PG1, D2196, D2298, D2306, D2308, D2336; pictures b1-3, b1-4, b1-9,
   b1-10, p7) and REQUEST ACCESS ASKS THE SQUADRON (§5 item 1 — D2094, D2111; picture b1-5), through the screens:
   - every admin sees the squadrons with their place and people, then the Places with each time zone for today;
   - "+ New squadron" is a master admin's only; its number, place ("+ New place…" opening the place's name and time zone
     in the same form) and first admin — the door's own list, no master admin, nobody moving tomorrow — saved as ONE
     command: one Undo leaves no squadron and no place; its line in D2306's words, the number typed filled in;
   - a squadron's row opens only for an admin of it: its Place list, the line "Saved at once. The new place applies from
     tomorrow.", the move counting from tomorrow;
   - a place's time zone where two squadrons sit: greyed for an admin of one only, with D2336's words; ordinary for an
     admin of both (Plan of 149) and for a master admin;
   - eight squadrons made through the door list in the panel;
   - Request access's first choice is the squadron, and the request lands with it: on 149's Waiting list, not 142's.
   Red first: before this job there was no Squadrons panel and the card asked no squadron. */
import { describe, it, expect, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { useMsqWorld, signInAs, moveMan, mem, PID, ACCT } from '../test-support/msq-world'
import { SquadronsPanel } from './SquadronsPanel'
import { AccessScreen } from './AccessScreen'
import { addUnit, units, unitRows, unitsLoad, todayIso, placeById, placeOfOn, setUnitSeeds } from '../state/units'
import { placeIdOn, moveFrom } from '../state/units-model'
import { saveAccess, waitingHere, ACCESS_REQS } from '../state/accounts'
import { globalUndo } from '../undo/timeline'

useMsqWorld()
afterEach(() => cleanup())

const BOTH = 'Only an admin of both 142 and 149 can change the time zone: both squadrons are here.'

function panel() {
  const page = render(<SquadronsPanel />)
  const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
  const $$ = (sel: string) => [...page.container.querySelectorAll<HTMLElement>(sel)]
  const click = async (sel: string) => { await act(async () => { fireEvent.click($(sel)!) }) }
  const set = async (sel: string, value: string) => { await act(async () => { fireEvent.change($(sel)!, { target: { value } }) }) }
  const rows = () => $$('#sqList [data-unit]').map(r => `${r.querySelector('.acc-name')!.textContent} | ${r.querySelector('.acc-sub')!.textContent}`)
  const places = () => $$('#sqPlaces [data-place]').map(r => `${r.querySelector('.acc-name')!.textContent} | ${r.querySelector('.acc-sub')!.textContent}`)
  const heads = () => $$('h4.adm-sub').map(h => h.textContent)
  return { $, $$, click, set, rows, places, heads }
}
const options = (el: HTMLElement | null) => [...(el as HTMLSelectElement).options].map(o => o.textContent)
const placeNamed = (name: string) => unitRows().places.find(p => p.name === name)

describe('the page — every admin (b1-3)', () => {
  it('Hunter (142\'s admin) sees both squadrons at Home base with their people, the Places list with Perth · GMT+8, and no "+ New squadron"', () => {
    signInAs('hunter')
    const p = panel()
    expect(p.heads()).toEqual(['Squadrons · 2', 'Places · 1'])
    expect(p.rows()[0]).toMatch(/^142 \| Home base · \d+ people$/)
    expect(p.rows()[1]).toMatch(/^149 \| Home base · \d+ people$/)
    expect(p.places()).toEqual(['Home base | 142 · 149 · Perth · GMT+8'])
    expect(p.$('#sqNew'), 'a plain admin sees no "+ New squadron"').toBeNull()
  })
  it('Saber, the master admin, sees "+ New squadron"', () => {
    signInAs('saber')
    expect(panel().$('#sqNew')?.textContent).toBe('+ New squadron')
  })
})

/* (p), his D2396: "The rows on Admin → Squadrons, which open the same way, get the same" — Escape closes an opened
   squadron's or place's row as its Cancel does, the keys back on the row. Red first: Escape did nothing. */
describe('Escape on an opened row (p)', () => {
  const esc = async () => { await act(async () => { fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' }) }) }
  it('a squadron\'s row: closes, nothing moved, the keys back on the row', async () => {
    signInAs('saber')
    const p = panel()
    await p.click('#sqList [data-unit="u149"] .acc-tap')
    expect(p.$('#sqPlace'), 'the premise: its row is open').not.toBeNull()
    const was = placeOfOn('u149', todayIso())?.id
    await esc()
    expect(p.$('#sqPlace'), 'the row closed').toBeNull()
    expect(placeOfOn('u149', todayIso())?.id).toBe(was)
    expect(document.activeElement).toBe(p.$('#sqList [data-unit="u149"] .acc-tap'))
  })
  it('a place\'s row: closes, its name unchanged', async () => {
    signInAs('saber')
    const p = panel()
    await p.click('#sqPlaces [data-place] .acc-tap')
    const box = p.$('#plName') as HTMLInputElement
    const was = box.value
    box.focus()
    await p.set('#plName', 'Typed name')
    await esc()
    expect(p.$('#plName'), 'the row closed').toBeNull()
    expect(p.places()[0]).toContain(was)
    expect(document.activeElement).toBe(p.$('#sqPlaces [data-place] .acc-tap'))
  })
  it('the Squadrons page not on his screen: an opened row takes no Escape', async () => {
    signInAs('saber')
    const page = render(<SquadronsPanel shown={false} />)
    await act(async () => { fireEvent.click(page.container.querySelector('#sqList [data-unit="u149"] .acc-tap')!) })
    await esc()
    expect(page.container.querySelector('#sqPlace'), 'still open behind the page in view').not.toBeNull()
  })
})

describe('"+ New squadron" (b1-9, b1-10; D2308, D2298, D2306)', () => {
  it('the form: a faded 150, the places then "+ New place…", the first admins the door would take, the line in D2306\'s words', async () => {
    signInAs('saber')
    const p = panel()
    await p.click('#sqNew')
    expect(p.$('#sqNew'), 'the button gives way to the form').toBeNull()
    expect((p.$('#sqNewNum') as HTMLInputElement).placeholder).toBe('150')
    expect(options(p.$('#sqNewPlace'))).toEqual(['Home base', '+ New place…'])
    expect(options(p.$('#sqNewAdmin'))).toEqual(['Pick an admin…', 'Hunter · 142', 'Kestrel · 149'])
    expect(p.$('#sqNewNote')!.textContent).toBe('The first admin gets Plan of 150, full access to it, so 150 starts with an admin.')
    await p.set('#sqNewNum', '151')
    await p.set('#sqNewAdmin', ACCT.kestrel)
    expect(p.$('#sqNewNote')!.textContent).toBe('Kestrel gets Plan of 151, full access to it, so 151 starts with an admin.')
  })
  it('a man moving squadron tomorrow is not offered as the first admin (the door would refuse him — §15 D14)', async () => {
    moveMan(PID.hunter, 'u149')
    signInAs('saber')
    const p = panel()
    await p.click('#sqNew')
    expect(options(p.$('#sqNewAdmin'))).toEqual(['Pick an admin…', 'Kestrel · 149'])
  })
  it('Saber makes 150 at a new place, Hunter its first admin; it lists at once; ONE Undo leaves no squadron and no place', async () => {
    signInAs('saber')
    const p = panel()
    await p.click('#sqNew')
    await p.set('#sqNewNum', '150')
    await p.set('#sqNewPlace', '+new')
    expect(p.$('#sqNewPlaceName'), 'the new place\'s name opens in the same form').not.toBeNull()
    await p.set('#sqNewPlaceName', 'North base')
    await p.set('#sqNewTz', 'Asia/Tokyo')
    await p.set('#sqNewAdmin', ACCT.hunter)
    expect(p.$('#sqNewNote')!.textContent).toBe('Saved together: 150 and its new place, North base. Hunter gets Plan of 150, full access to it, so 150 starts with an admin.')
    await p.click('#sqNewSave')
    unitsLoad()
    expect(units().map(u => u.num).sort()).toEqual(['142', '149', '150'])
    expect(placeNamed('North base')?.tz).toBe('Asia/Tokyo')
    expect(p.$('#sqNewNum'), 'the form closes').toBeNull()
    expect(p.rows()[2]).toBe('150 | North base · 0 people')
    expect(p.places()).toContain('North base | 150 · Tokyo · GMT+9')
    await act(async () => { expect(globalUndo().ok).toBe(true) })
    unitsLoad()
    expect(units().map(u => u.num).sort(), 'one Undo: no 150').toEqual(['142', '149'])
    expect(placeNamed('North base'), 'one Undo: no new place').toBeUndefined()
    expect(p.rows()).toHaveLength(2)
  })
  it('a refused save says why and keeps the form (no first admin picked)', async () => {
    signInAs('saber')
    const p = panel()
    await p.click('#sqNew')
    await p.set('#sqNewNum', '150')
    await p.click('#sqNewSave')
    unitsLoad()
    expect(units()).toHaveLength(2)
    expect(p.$('#sqNewNum'), 'the form stays open').not.toBeNull()
  })
})

describe('a squadron\'s place (b1-4; D2306, D2119)', () => {
  it('Kestrel opens 149: its Place list ending "+ New place…", the drawn line; a move onto a new place counts from tomorrow', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.click('#sqList [data-unit="u149"] .acc-tap')
    expect(options(p.$('#sqPlace'))).toEqual(['Home base', '+ New place…'])
    expect(p.$('#sqMoveNote')!.textContent).toBe('Saved at once. The new place applies from tomorrow.')
    await p.set('#sqPlace', '+new')
    await p.set('#sqPlaceName', 'North base')
    await p.set('#sqPlaceTz', 'Australia/Darwin')
    await p.click('#sqMoveSave')
    unitsLoad()
    const north = placeNamed('North base')!
    expect(north.tz).toBe('Australia/Darwin')
    expect(placeIdOn(unitRows(), 'u149', todayIso()), 'today it is still at Home base').toBe('p1')
    expect(placeIdOn(unitRows(), 'u149', moveFrom(todayIso())), 'from tomorrow at the new place').toBe(north.id)
    expect(p.places()).toContain('North base | 149 · Darwin · GMT+9:30')
    await act(async () => { expect(globalUndo().ok).toBe(true) })
    unitsLoad()
    expect(placeNamed('North base'), 'one Undo takes the move and its new place back').toBeUndefined()
  })
  it('Hunter (142 only) cannot open 149\'s row; he can open 142\'s', async () => {
    signInAs('hunter')
    const p = panel()
    expect((p.$('#sqList [data-unit="u149"] .acc-tap') as HTMLButtonElement).disabled).toBe(true)
    expect((p.$('#sqList [data-unit="u142"] .acc-tap') as HTMLButtonElement).disabled).toBe(false)
  })
})

describe('a place\'s time zone where both squadrons sit (p7; D2196, D2336)', () => {
  const openHome = async (p: ReturnType<typeof panel>) => { await p.click('#sqPlaces [data-place="p1"] .acc-tap') }
  it('Hunter (142 only): greyed, with D2336\'s words', async () => {
    signInAs('hunter')
    const p = panel()
    await openHome(p)
    expect((p.$('#plTz') as HTMLSelectElement).disabled).toBe(true)
    expect((p.$('#plName') as HTMLInputElement).disabled).toBe(true)
    expect((p.$('#plSave') as HTMLButtonElement).disabled).toBe(true)
    expect(p.$('#plWhy')!.textContent).toBe(BOTH)
    expect((p.$('#plTz') as HTMLSelectElement).value).toBe('Australia/Perth')
  })
  it('Hunter with Plan of 149 may change it; so may Saber', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('hunter')
    const p = panel()
    await openHome(p)
    expect((p.$('#plTz') as HTMLSelectElement).disabled).toBe(false)
    expect(p.$('#plWhy')).toBeNull()
    await p.set('#plTz', 'Australia/Darwin')
    await p.click('#plSave')
    unitsLoad()
    expect(placeById('p1')?.tz).toBe('Australia/Darwin')
    cleanup()
    signInAs('saber')
    const q = panel()
    await openHome(q)
    expect((q.$('#plTz') as HTMLSelectElement).disabled).toBe(false)
    expect(q.$('#plWhy')).toBeNull()
  })
})

describe('eight squadrons (§11)', () => {
  it('six more made through the door list in the panel, by number', () => {
    signInAs('saber')
    for (const n of ['150', '151', '152', '153', '154', '155']) expect(addUnit(n, 'p1', ACCT.hunter)).toMatchObject({ ok: true })
    unitsLoad()
    const p = panel()
    expect(p.heads()[0]).toBe('Squadrons · 8')
    expect(p.rows().map(r => r.split(' | ')[0])).toEqual(['142', '149', '150', '151', '152', '153', '154', '155'])
    expect(p.places()[0]).toBe('Home base | 142 · 149 · 150 · 151 · 152 · 153 · 154 · 155 · Perth · GMT+8')
  })
})

describe('Request access asks the squadron (b1-5; D2094, D2111)', () => {
  /* HIS D2396 (f), D2400 — the drawing docs/mock/2026-11-24-msq-new-words/img/f1-*.png, f2-*.png: the box starts on "Pick…",
     as the two under it do, and Request access sends nothing until he has chosen, saying "Pick your squadron" in the
     card's own error line. Kite, leaving it on 142 by not looking, asked the wrong squadron's admins. Red first. */
  it('starts on "Pick…"; Request access with nothing chosen says "Pick your squadron" and sends nothing; choosing clears it', async () => {
    signInAs('kite@mail')
    const page = render(<AccessScreen />)
    const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement
    expect(options($('#accSqn'))).toEqual(['Pick…', '142', '149'])
    expect(($('#accSqn') as HTMLSelectElement).value).toBe('')
    await act(async () => { fireEvent.change($('#accCs'), { target: { value: 'Kite' } }) })
    await act(async () => { fireEvent.change($('#accSeat'), { target: { value: 'GND' } }) })
    await act(async () => { fireEvent.submit($('#accForm')) })
    expect($('#accErr').textContent).toBe('Pick your squadron')
    expect(ACCESS_REQS.find(r => r.name === 'kite@mail'), 'nothing sent').toBeUndefined()
    expect($('#accForm'), 'still on the card').toBeTruthy()
    await act(async () => { fireEvent.change($('#accSqn'), { target: { value: 'u149' } }) })
    expect($('#accErr').textContent, 'choosing takes the words away').toBe('')
    await act(async () => { fireEvent.submit($('#accForm')) })
    expect(ACCESS_REQS.find(r => r.name === 'kite@mail')?.unit).toBe('u149')
  })
  /* its pin: with one squadron in the app the card has no Squadron box and asks nothing more — the request goes to that
     squadron, as it always did (the row laid straight in the memory: the store takes a unit row only by its command) */
  it('one squadron: no Squadron box, and Request access sends straight to it', async () => {
    setUnitSeeds(false); mem['sqn142_unit:u142'] = JSON.stringify({ id: 'u142', num: '142', kind: 'sqn' }); unitsLoad()
    signInAs('onesqn@mail')
    expect(units().map(u => u.num), 'the premise: one squadron').toEqual(['142'])
    const page = render(<AccessScreen />)
    const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement
    expect($('#accSqn')).toBeNull()
    await act(async () => { fireEvent.change($('#accCs'), { target: { value: 'Solo' } }) })
    await act(async () => { fireEvent.change($('#accSeat'), { target: { value: 'GND' } }) })
    await act(async () => { fireEvent.submit($('#accForm')) })
    expect($('#accErr')?.textContent ?? '', 'no word about a squadron').not.toContain('squadron')
    expect(ACCESS_REQS.find(r => r.name === 'onesqn@mail')?.unit).toBe('u142')
  })
  it('"Squadron" is the card\'s first choice; a request to 149 lands with 149, on 149\'s Waiting list, not 142\'s', async () => {
    signInAs('joinreq@mail')
    const page = render(<AccessScreen />)
    const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement
    const labels = [...page.container.querySelectorAll('#accForm label')].map(l => l.textContent)
    expect(labels[0]).toBe('Squadron')
    await act(async () => { fireEvent.change($('#accSqn'), { target: { value: 'u149' } }) })
    await act(async () => { fireEvent.change($('#accCs'), { target: { value: 'Joiner' } }) })
    await act(async () => { fireEvent.change($('#accSeat'), { target: { value: 'GND' } }) })
    await act(async () => { fireEvent.submit($('#accForm')) })
    const req = ACCESS_REQS.find(r => r.name === 'joinreq@mail')
    expect(req?.unit).toBe('u149')
    cleanup()
    signInAs('kestrel')
    expect(waitingHere().map(r => r.name)).toContain('joinreq@mail')
    signInAs('hunter')
    expect(waitingHere().map(r => r.name)).not.toContain('joinreq@mail')
  })
})
