/* [PO-MOVE-DATE-DELETE-ASK] (raised 13 Oct 26 by the read of [ONE-DATE-CALENDAR]; owner D1102, 21 Oct 26).
   On the Leave War's Post out sheet a date picked is saved at once. A posting whose outcome is already Delete, its date
   moved to today or earlier, used to delete the man at that ONE tap — with no second ask, where the Delete chip itself
   asks twice (D287 (3)). D1102: the date that sets a delete off asks the same tap-twice question before it is saved; a
   date still to come deletes no one at once and is saved as before; backing out leaves the posting and its date as they
   were. Driven through the real sheet in the wired world (the sync's posting pass carries the delete out). */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../../engine/hooks'
import { PEOPLE, indexCallsigns } from '../../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../../state/store'
import { accountsLoad, signIn, sessionFor } from '../../state/accounts'
import { getState, initStore as lwInitStore, setPeople } from '../state/store'
import { memoryBackend } from '../state/storage'
import { projectPeople } from '../state/raptorRoster'
import { postOut, undoPostOut, wireLeaveWarSync } from '../sync'
import { setLwOnScreen } from '../state/screen'
import { boxValue, pickDate } from '../../ui/datecal-testkit'
import { Matrix } from './Matrix'
import { SelectSheet } from './SelectSheet'

const TODAY = '2026-07-15'
const LATER = '2026-07-20'          // the posting's date, still to come
const STRUCK = '2026-07-25'         // a day after it — the cell an admin taps to manage the posting
const mem: Record<string, string> = {}
let PEOPLE0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const war = (id: string) => getState().people.find(p => p.id === id)

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  PEOPLE0 = JSON.stringify(PEOPLE)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  resetSession(sessionFor(signIn('ad', 'a'))); raptorNotify()
  setLwOnScreen(true)
  /* Hex is posted out on a date still to come, the posting a Delete: nothing has run yet */
  expect(postOut('rocky', LATER, 'delete')).toBe(true)
  expect(P('rocky').deleted).toBeFalsy()
})
afterEach(() => { resetSession(null); vi.restoreAllMocks() })

const openSheet = () => {
  render(<Matrix />)
  fireEvent.click(screen.getByTestId(`cell-rocky-${STRUCK}`))
  expect(screen.getByTestId('postout-sheet')).toBeTruthy()
  expect(boxValue(screen.getByTestId('postout-date'))).toBe(LATER)
}

describe('[PO-MOVE-DATE-DELETE-ASK] a Delete posting\'s date moved to today asks twice (D1102)', () => {
  it('the first tap on today asks — "Tap again to delete Hex" — and saves nothing; the second deletes him', () => {
    openSheet()
    pickDate(screen.getByTestId('postout-date'), TODAY)
    expect(P('rocky').deleted, 'not deleted at one tap').toBeFalsy()
    expect(war('rocky')!.to, 'the date is not saved yet').toBe('2026-07-19')
    const go = screen.getByTestId('postout-delete-go')
    expect(go.textContent).toBe('Tap again to delete Hex')
    expect(boxValue(screen.getByTestId('postout-date')), 'the box shows the date he is asked about').toBe(TODAY)
    expect(screen.getByTestId('postout-line').textContent).toMatch(/15 Jul/)
    fireEvent.click(go)
    expect(P('rocky').deleted, 'the second tap deletes him').toBe(true)
    expect(P('rocky').deletedFrom).toBe(TODAY)
  })
  it('an earlier day asks the same', () => {
    openSheet()
    pickDate(screen.getByTestId('postout-date'), '2026-07-10')
    expect(P('rocky').deleted).toBeFalsy()
    expect(screen.getByTestId('postout-delete-go').textContent).toBe('Tap again to delete Hex')
  })
  it('a date still to come is saved at once, with no ask', () => {
    openSheet()
    pickDate(screen.getByTestId('postout-date'), '2026-07-28')
    expect(screen.queryByTestId('postout-delete-go')).toBeNull()
    expect(war('rocky')!.to).toBe('2026-07-27')
    expect(P('rocky').deleted).toBeFalsy()
  })
  it('backing out — a chip tapped instead — leaves the posting and its date as they were', () => {
    openSheet()
    pickDate(screen.getByTestId('postout-date'), TODAY)
    fireEvent.click(screen.getByTestId('postout-delete'))   // the lit Delete chip: "not that after all"
    expect(screen.queryByTestId('postout-delete-go')).toBeNull()
    expect(boxValue(screen.getByTestId('postout-date')), 'the box is back on the date that stands').toBe(LATER)
    expect(war('rocky')!.to).toBe('2026-07-19')
    expect(war('rocky')!.poOutcome).toBe('delete')
    expect(P('rocky').deleted).toBeFalsy()
  })
  it('backing out — the sheet closed — leaves them as they were', () => {
    openSheet()
    pickDate(screen.getByTestId('postout-date'), TODAY)
    fireEvent.click(screen.getByTestId('postout-cancel'))
    expect(war('rocky')!.to).toBe('2026-07-19')
    expect(P('rocky').deleted).toBeFalsy()
    fireEvent.click(screen.getByTestId(`cell-rocky-${STRUCK}`))
    expect(boxValue(screen.getByTestId('postout-date')), 'opened again, it shows the date that stands').toBe(LATER)
    expect(screen.queryByTestId('postout-delete-go')).toBeNull()
  })
  it('asked, then a date still to come picked instead: saved at once, the ask gone', () => {
    openSheet()
    pickDate(screen.getByTestId('postout-date'), TODAY)
    pickDate(screen.getByTestId('postout-date'), '2026-07-28')
    expect(screen.queryByTestId('postout-delete-go')).toBeNull()
    expect(war('rocky')!.to).toBe('2026-07-27')
    expect(P('rocky').deleted).toBeFalsy()
  })
  it('a posting that is not a Delete still saves a past date at once (only a delete asks)', () => {
    expect(postOut('rocky', LATER, 'none')).toBe(true)
    openSheet()
    pickDate(screen.getByTestId('postout-date'), TODAY)
    expect(screen.queryByTestId('postout-delete-go')).toBeNull()
    expect(war('rocky')!.to).toBe('2026-07-14')
  })
  it('leaving the Leave War while asked takes the question back — one tap on coming back deletes no one', () => {
    openSheet()
    pickDate(screen.getByTestId('postout-date'), TODAY)
    expect(screen.getByTestId('postout-delete-go')).toBeTruthy()
    act(() => setLwOnScreen(false))
    act(() => setLwOnScreen(true))
    expect(screen.queryByTestId('postout-delete-go')).toBeNull()
    expect(boxValue(screen.getByTestId('postout-date'))).toBe(LATER)
    expect(P('rocky').deleted).toBeFalsy()
  })
  it('the posting changed under the question (taken back elsewhere, then a Delete again): the question goes', () => {
    openSheet()
    pickDate(screen.getByTestId('postout-date'), TODAY)
    expect(screen.getByTestId('postout-delete-go')).toBeTruthy()
    act(() => { expect(postOut('rocky', '2026-07-22', 'delete')).toBe(true) })   // another tab moves it to the 22nd
    expect(screen.queryByTestId('postout-delete-go'), 'no question about a posting that no longer stands').toBeNull()
    expect(boxValue(screen.getByTestId('postout-date'))).toBe('2026-07-22')
    expect(P('rocky').deleted).toBeFalsy()
  })
})

/* the other two doors that ask "Tap again to delete" (D287 (3)) — the bid sheet's PO and the drag selection's PO — take
   an armed question back when the Leave War leaves the screen, as the Post out sheet's does */
describe('an armed "Tap again to delete" on the other posting doors is taken back on leaving the Leave War', () => {
  it('the bid sheet PO', () => {
    expect(undoPostOut('rocky')).toBe(true)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-rocky-${STRUCK}`))
    fireEvent.click(screen.getByTestId('bid-postout'))
    fireEvent.click(screen.getByTestId('po-delete'))
    fireEvent.click(screen.getByTestId('po-confirm'))
    expect(screen.getByTestId('po-confirm').textContent).toBe('Tap again to delete Hex')
    act(() => setLwOnScreen(false))
    act(() => setLwOnScreen(true))
    expect(screen.getByTestId('po-confirm').textContent).toBe('Post out')
    expect(P('rocky').deleted).toBeFalsy()
  })
  it('the drag selection PO', () => {
    const posted: string[] = []
    const sel = { people: ['rocky'], from: STRUCK, to: STRUCK, cells: [{ personId: 'rocky', date: STRUCK }] }
    render(<SelectSheet sel={sel} people={() => 'Hex'} role="admin" canDecide={true} onDone={() => {}} onMove={() => {}}
      onPostOut={(_id, d, o) => { posted.push(`${d}:${o}`) }} onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('sel-postout'))
    fireEvent.click(screen.getByTestId('sel-po-delete'))
    fireEvent.click(screen.getByTestId('sel-po-confirm'))
    expect(screen.getByTestId('sel-po-confirm').textContent).toBe('Tap again to delete Hex')
    act(() => setLwOnScreen(false))
    act(() => setLwOnScreen(true))
    expect(screen.getByTestId('sel-po-confirm').textContent).toBe('Post out')
    expect(posted).toEqual([])
  })
})
