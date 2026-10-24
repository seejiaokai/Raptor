/* ROUND 3 OF THE BID WINDOWS AND THE DAY'S LIST ([LW-ROUND3-BUILD] — his D1311 direction, approved whole by D1332 and
   D1334, with D1302, D1307, D1308, D1313–D1315, D1326–D1331, D1333; drawn by scripts/handpass/lw-declutter-look.mjs,
   lw-declutter-mock.mjs, lw-twoday-look.mjs and lw-q6-half-am.mjs). Written before the build, red first.
   The one-day window: the row labels go; Approve · Refuse · Move · Delete on one row, Note gone; the dark Remarks box beside
   Document, shown on an approved leave too and saved onto the leave on the Inputs page; "Just this day" gone, "Pick a range"
   ending the Duration row; the day's own leave lit, and its half; no "now" in the title; the switch, remembered; the ⋯ in
   the fourth place of the row under the leaves. The drag window: Decide only over a bid, its dates short. The day's list:
   each entry led by its box, only its half and state beside it, one row of actions, Remarks and Document per entry. */
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { getState, initStore, rawState, setBidStates, setCell, setCellRange, setDayAward, setRole, setViewer } from '../state/store'
import { setMemberTodayForTests } from '../engine'
import { memoryBackend } from '../state/storage'
import { fileAbsence } from '../testkit'
import { Matrix } from './Matrix'
import { SelectSheet } from './SelectSheet'
import { compactSpan, readApprove } from './BidBits'

const ISNAP = JSON.stringify(INPUTS)
const P = 'dusk'
const D = '2026-02-11'
const cell = () => screen.getByTestId(`cell-${P}-${D}`)
const sheet = () => screen.getByTestId('bid-picker')
const rowOf = (el: Element) => el.closest('.bidsheet-row')!

beforeEach(() => {
  try { localStorage.clear() } catch { /* none */ }
  initStore(memoryBackend()); setRole('admin')
})
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

describe('round 3 — the one-day window', () => {
  it('carries no row labels; each row still has its name for a screen reader', () => {
    expect(setCell(P, D, 'LL')).toBe(true)
    render(<Matrix />)
    fireEvent.click(cell())
    const s = sheet()
    expect(s.querySelectorAll('.bidsheet-row > .lab')).toHaveLength(0)
    for (const w of ['Date', 'Decide', 'Selected', 'Which leave', 'Also']) expect(s.textContent).not.toContain(w)
    expect(rowOf(within(s).getByTestId('bid-LL')).getAttribute('aria-label')).toBe('Which leave')
    expect(rowOf(within(s).getByTestId('portion-full')).getAttribute('aria-label')).toBe('Duration')
    expect(rowOf(within(s).getByTestId('decide-approve')).getAttribute('aria-label')).toBe('Actions')
    expect(within(s).getByTestId('bid-remarks').getAttribute('aria-label')).toBe('Remarks')
  })

  it('puts Approve · Refuse · Move · Delete on one row, in that order, and has no Note', () => {
    setCell(P, D, 'LL')
    render(<Matrix />)
    fireEvent.click(cell())
    const row = within(sheet()).getByTestId('bid-actions')
    const ids = [...row.querySelectorAll('button')].map(b => b.getAttribute('data-testid'))
    expect(ids).toEqual(['decide-approve', 'decide-refuse', 'decide-shift', 'bid-clear'])
    expect(screen.queryByTestId('decide-note')).toBeNull()
  })

  it('on an empty day draws no row of actions', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    expect(within(sheet()).queryByTestId('bid-actions')).toBeNull()
  })

  it('orders its rows as drawn: the day line, the actions, Remarks and Document, Duration, the leave', () => {
    setCell(P, D, 'LL')
    render(<Matrix />)
    fireEvent.click(cell())
    const s = sheet()
    const order = [s.querySelector('[data-testid="bid-dayline"]'), within(s).getByTestId('bid-actions'), rowOf(within(s).getByTestId('bid-remarks')),
      rowOf(within(s).getByTestId('portion-full')), rowOf(within(s).getByTestId('bid-LL'))]
    for (let i = 1; i < order.length; i++) {
      expect(order[i - 1]!.compareDocumentPosition(order[i]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
  })

  it('has no "Just this day"; "Pick a range" ends the Duration row', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    const s = sheet()
    expect(within(s).queryByTestId('span-one')).toBeNull()
    expect(s.textContent).not.toContain('Just this day')
    const range = within(s).getByTestId('span-range')
    const dur = rowOf(within(s).getByTestId('portion-full'))
    expect(rowOf(range)).toBe(dur)
    expect(dur.lastElementChild).toBe(range)
  })

  it('a range picked back to the day tapped is the one day again', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('span-range'))
    expect(within(sheet()).getByTestId('span-range').getAttribute('aria-pressed')).toBe('false')
  })

  it('carries no "now" in the title: the name, the day, the switch and ✕', () => {
    setCell(P, D, 'LL')
    render(<Matrix />)
    fireEvent.click(cell())
    const hd = sheet().querySelector('.bidsheet-hd')!
    expect(hd.querySelector('.cur')).toBeNull()
    expect(hd.textContent!.toLowerCase()).not.toContain('now')
    expect([...hd.children].map(c => c.getAttribute('data-testid') || c.className)).toEqual(['who', 'dt', 'bid-approve-tick', 'bid-cancel'])
  })

  it('lights the day\'s own leave; an empty day lights none', () => {
    setCell(P, D, 'OL')
    const r = render(<Matrix />)
    fireEvent.click(cell())
    expect(within(sheet()).getByTestId('bid-OL').className).toContain('lit')
    expect(within(sheet()).getByTestId('bid-LL').className).not.toContain('lit')
    r.unmount()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-12`))
    expect(sheet().querySelectorAll('.tchip.lv.lit')).toHaveLength(0)
  })

  it('opens a half day with its half lit beside the lit leave (D1331); a whole day keeps Whole day', () => {
    setCell(P, D, '*LL')
    const r = render(<Matrix />)
    fireEvent.click(cell())
    expect(within(sheet()).getByTestId('portion-am').getAttribute('aria-pressed')).toBe('true')
    expect(within(sheet()).getByTestId('portion-full').getAttribute('aria-pressed')).toBe('false')
    expect(within(sheet()).getByTestId('bid-LL').className).toContain('lit')
    r.unmount()
    setCell(P, '2026-02-12', 'LL*')
    const r2 = render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-12`))
    expect(within(sheet()).getByTestId('portion-pm').getAttribute('aria-pressed')).toBe('true')
    r2.unmount()
    setCell(P, '2026-02-13', 'LL')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-13`))
    expect(within(sheet()).getByTestId('portion-full').getAttribute('aria-pressed')).toBe('true')
  })

  it('a leave changed from a half day\'s window keeps its half', () => {
    setCell(P, D, '*LL')
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('bid-approve-tick'))   // a pending bid, as before
    fireEvent.click(within(sheet()).getByTestId('bid-OL'))
    expect(getState().grid[P]?.[D]).toBe('*OL')
  })

  it('on a pending bid Approve is not lit; on an approved leave it is, and a second tap sends the leave back to waiting', () => {
    setCell(P, D, 'LL')
    const r = render(<Matrix />)
    fireEvent.click(cell())
    expect(within(sheet()).getByTestId('decide-approve').className).not.toContain('lit')
    r.unmount()
    INPUTS.length = 0
    const row = fileAbsence(P, 'LL', '2026-02-12', '2026-02-12', { lw: true })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-12`))
    const ap = within(sheet()).getByTestId('decide-approve')
    expect(ap.className).toContain('lit')
    expect(ap.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(ap)
    expect(INPUTS.some((x: any) => x.iid === row.iid)).toBe(false)
    expect(rawState().wars[0]!.recs[P]!['2026-02-12']!.find(x => x.kind === 'request')).toMatchObject({ code: 'LL', state: 'pending' })
  })

  it('shows an approved leave\'s Remarks and Document at once, and saves a remark and the till tick onto the leave', () => {
    INPUTS.length = 0
    const row = fileAbsence(P, 'LL', D, D, { lw: true, remarks: 'Bali' })
    render(<Matrix />)
    fireEvent.click(cell())
    expect(screen.queryByTestId('decide-note')).toBeNull()
    const box = within(sheet()).getByTestId('bid-remarks') as HTMLTextAreaElement
    expect(box.value).toBe('Bali')
    expect(within(sheet()).getByTestId('bid-doc-row')).toBeTruthy()
    fireEvent.change(box, { target: { value: 'Phuket instead' } })
    fireEvent.blur(box)
    expect(INPUTS.find((x: any) => x.iid === row.iid).remarks).toBe('Phuket instead')
    fireEvent.click(within(sheet()).getByTestId('bid-till'))
    expect(INPUTS.find((x: any) => x.iid === row.iid).till).toBe(false)
  })

  it('draws the Remarks box as a box that wraps — one line tall to start — and Enter saves it without a new line', () => {
    setCell(P, D, 'LL')
    render(<Matrix />)
    fireEvent.click(cell())
    const box = within(sheet()).getByTestId('bid-remarks') as HTMLTextAreaElement
    expect(box.tagName).toBe('TEXTAREA')
    expect(box.rows).toBe(1)
    expect(box.closest('.bp-rmk')!.className).toContain('dark')
    fireEvent.change(box, { target: { value: 'A long remark that runs past one line of the box on a phone held upright' } })
    fireEvent.keyDown(box, { key: 'Enter' })
    expect(box.value).not.toContain('\n')
    const rec = rawState().wars[0]!.recs[P]![D]!.find(x => x.kind === 'request') as any
    expect(rec.remarks).toBe('A long remark that runs past one line of the box on a phone held upright')
  })
})

describe('round 3 — "Approve what I enter" as a switch, remembered (D1302)', () => {
  it('is the app\'s switch, on to start', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    const sw = within(sheet()).getByTestId('bid-approve-tick')
    expect(sw.getAttribute('role')).toBe('switch')
    expect(sw.getAttribute('aria-checked')).toBe('true')
  })

  it('left off, stays off in the next window he opens — the drag window too — until he turns it on', () => {
    setViewer('saber')
    const r = render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('bid-approve-tick'))
    fireEvent.click(within(sheet()).getByTestId('bid-cancel'))
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-12`))
    expect(within(sheet()).getByTestId('bid-approve-tick').getAttribute('aria-checked')).toBe('false')
    expect(within(sheet()).getByTestId('bid-LL').className).toContain('s-w')
    r.unmount()
    const s = render(<SelectSheet sel={{ people: [P], from: D, to: D, cells: [{ personId: P, date: D }] } as any} people={id => id}
      role="admin" canDecide onDone={() => {}} onMove={() => {}} onClose={() => {}} />)
    expect(screen.getByTestId('sel-approve-tick').getAttribute('aria-checked')).toBe('false')
    fireEvent.click(screen.getByTestId('sel-approve-tick'))
    s.unmount()
    expect(readApprove()).toBe(true)
  })

  it('is one admin\'s own: another admin on the same device starts on', () => {
    setViewer('saber')
    const r = render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('bid-approve-tick'))
    r.unmount()
    act(() => { setViewer('dusk') })
    expect(readApprove()).toBe(true)
  })
})

describe('round 3 — the ⋯ in the row under the leaves (D1326)', () => {
  it('stands in the fourth place of the row under the leaves and opens Grant OIL, Post out and Post in', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    const s = sheet()
    expect(s.querySelector('.bidsheet-hd [data-testid="bid-more"]')).toBeNull()
    const more = within(s).getByTestId('bid-more')
    const row = within(s).getByTestId('bid-extra-row')
    expect(row.contains(more)).toBe(true)
    expect(rowOf(within(s).getByTestId('bid-LL')).compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(more.closest('.bp-more-wrap')!.className).toContain('col4')
    expect(within(s).queryByTestId('bid-oil')).toBeNull()
    fireEvent.click(more)
    const menu = within(s).getByTestId('bid-more-menu')
    expect([...menu.querySelectorAll('button')].map(b => b.textContent)).toEqual(['Grant OIL', 'Post out', 'Post in'])
    expect(within(menu).getByTestId('bid-oil').className).toContain('oil-give')
    fireEvent.click(within(menu).getByTestId('bid-postout'))
    expect(within(s).getByTestId('po-date')).toBeTruthy()
    expect(within(s).queryByTestId('bid-more-menu')).toBeNull()
  })

  it('Escape closes the menu first, then the window', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('bid-more'))
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape' })
    expect(screen.queryByTestId('bid-more-menu')).toBeNull()
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })

  it('a member has no switch and no ⋯', () => {
    setRole('member'); setViewer(P)
    render(<Matrix />)
    fireEvent.click(cell())
    const s = screen.queryByTestId('bid-picker')
    if (!s) return   // not open for him: the open dates' own tests cover it
    expect(within(s).queryByTestId('bid-approve-tick')).toBeNull()
    expect(within(s).queryByTestId('bid-more')).toBeNull()
  })
})

describe('round 3 — the drag window', () => {
  const two = { people: [P], from: D, to: '2026-02-12', cells: [{ personId: P, date: D }, { personId: P, date: '2026-02-12' }] }
  const mount = (sel: any = two) => render(<SelectSheet sel={sel} people={id => (id === P ? 'Dusk' : id)} role="admin" canDecide
    onDone={() => {}} onMove={() => {}} onClose={() => {}} onPostOut={() => undefined} />)

  it('draws Decide only where the days hold a bid', () => {
    const r = mount()
    expect(screen.queryByTestId('sel-approve')).toBeNull()
    r.unmount()
    setCell(P, D, 'LL')
    mount()
    expect(screen.getByTestId('sel-approve')).toBeTruthy()
    const ids = [...screen.getByTestId('sel-actions').querySelectorAll('button')].map(b => b.getAttribute('data-testid'))
    expect(ids).toEqual(['sel-approve', 'sel-refuse', 'sel-move', 'sel-delete'])
  })

  it('reads its dates short in the title', () => {
    mount()
    expect(screen.getByTestId('sel-span').textContent).toBe('11–12 Feb · 2 days')
    expect(compactSpan('2026-11-30', '2026-12-02')).toBe('30 Nov – 2 Dec')
    expect(compactSpan('2026-12-30', '2027-01-02')).toBe('30 Dec 26 – 2 Jan 27')
    expect(compactSpan('2026-11-09', '2026-11-09')).toBe('9 Nov')
  })

  it('keeps Post out behind its ⋯, and no row labels', () => {
    mount()
    const s = screen.getByTestId('select-sheet')
    expect(s.querySelectorAll('.bidsheet-row > .lab')).toHaveLength(0)
    expect(screen.queryByTestId('sel-postout')).toBeNull()
    fireEvent.click(screen.getByTestId('sel-more'))
    fireEvent.click(screen.getByTestId('sel-postout'))
    expect(screen.getByTestId('sel-po-date')).toBeTruthy()
  })
})

describe('round 3 — the day\'s list of a day with two entries (D1315, D1327–D1330)', () => {
  const twoDay = () => {
    INPUTS.length = 0
    const ll = fileAbsence(P, '*LL', D, D, { lw: true, remarks: 'Home' })
    const med = fileAbsence(P, 'ATTB*', D, D, { remarks: 'Clinic review' })
    return { ll, med }
  }

  it('leads each entry with its box as the grid draws it, and says only its half and state beside it', () => {
    const { ll, med } = twoDay()
    render(<Matrix />)
    fireEvent.click(cell())
    const a = screen.getByTestId(`dl-a-${ll.iid}`), b = screen.getByTestId(`dl-a-${med.iid}`)
    expect(a.querySelector('.leg-box .c')!.className).toMatch(/\bk-ll\b.*\bs-a\b.*\btop\b/)
    expect(b.querySelector('.leg-box .c')!.className).toMatch(/\bk-med\b.*\bbot\b.*\braptor\b/)
    expect(a.querySelector('.dl-main')!.textContent).toBe('Morning · approved')
    expect(b.querySelector('.dl-main')!.textContent).toBe('Afternoon · change it on the Inputs page')
    expect(screen.getByTestId('daylist').textContent).not.toContain('local leave')
    expect(screen.getByTestId('daylist').textContent).not.toContain('no flying but may still work')
  })

  it('gives the approved leave one row: Approve lit · Refuse · Move · Delete — no "Back to bid", no Note', () => {
    const { ll } = twoDay()
    render(<Matrix />)
    fireEvent.click(cell())
    const acts = screen.getByTestId(`dl-a-${ll.iid}`).querySelector('.dl-acts')!
    expect([...acts.querySelectorAll('button')].map(x => x.getAttribute('data-testid'))).toEqual(
      [`dl-approve-${ll.iid}`, `dl-refuse-${ll.iid}`, `dl-move-${ll.iid}`, `dl-remove-${ll.iid}`])
    expect(screen.getByTestId(`dl-approve-${ll.iid}`).className).toContain('lit')
    expect(screen.queryByTestId(`dl-unapprove-${ll.iid}`)).toBeNull()
    expect(screen.queryByTestId(`dl-note-${ll.iid}`)).toBeNull()
    fireEvent.click(screen.getByTestId(`dl-approve-${ll.iid}`))
    expect(INPUTS.some((x: any) => x.iid === ll.iid)).toBe(false)
    expect(rawState().wars[0]!.recs[P]![D]!.find(x => x.kind === 'request')).toMatchObject({ code: '*LL', state: 'pending' })
  })

  it('gives the leave its Remarks and Document, saved onto the leave; the Inputs-page entry its remarks read only', () => {
    const { ll, med } = twoDay()
    render(<Matrix />)
    fireEvent.click(cell())
    const box = within(screen.getByTestId(`dl-a-${ll.iid}`)).getByRole('textbox') as HTMLTextAreaElement
    expect(box.value).toBe('Home')
    fireEvent.change(box, { target: { value: 'Away up north' } })
    fireEvent.blur(box)
    expect(INPUTS.find((x: any) => x.iid === ll.iid).remarks).toBe('Away up north')
    const ro = screen.getByTestId(`dl-ro-${med.iid}`)
    expect(ro.textContent).toContain('Clinic review')
    expect(within(screen.getByTestId(`dl-a-${med.iid}`)).queryByRole('textbox')).toBeNull()
  })

  it('a pending bid in the list carries its own Remarks, saved onto the bid', () => {
    INPUTS.length = 0
    expect(setCell(P, D, '*LL')).toBe(true)
    fileAbsence(P, 'ATTB*', D, D, { remarks: 'Clinic review' })
    render(<Matrix />)
    fireEvent.click(cell())
    const rec = rawState().wars[0]!.recs[P]![D]!.find(x => x.kind === 'request')!
    const line = screen.getByTestId(`dl-r-${rec.id}`)
    expect(line.querySelector('.dl-main')!.textContent).toBe('Morning · pending')
    const box = within(line).getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(box, { target: { value: 'Waiting on the form' } })
    fireEvent.blur(box)
    expect((rawState().wars[0]!.recs[P]![D]!.find(x => x.id === rec.id) as any).remarks).toBe('Waiting on the form')
  })

  it('his own approved leave in the list: its Remarks to change, and no Approve or Refuse', () => {
    const { ll } = twoDay()
    setRole('member'); setViewer(P)
    render(<Matrix />)
    fireEvent.click(cell())
    const line = screen.getByTestId(`dl-a-${ll.iid}`)
    expect(within(line).queryByTestId(`dl-approve-${ll.iid}`)).toBeNull()
    expect(within(line).queryByTestId(`dl-refuse-${ll.iid}`)).toBeNull()
    const box = within(line).getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(box, { target: { value: 'Mine' } })
    fireEvent.blur(box)
    expect(INPUTS.find((x: any) => x.iid === ll.iid).remarks).toBe('Mine')
  })
})

/* ROUND 3's FULL CHECK (24 Oct 26 — the scenario designer's S15): words typed and the box NOT left, then an action pressed.
   An iPhone keeps the box focused when a button is tapped (a button takes no focus there), so no blur saves the words
   first — the tests press without one, as fireEvent does. Whatever the action, the words typed are never lost: they ride
   with the bid, onto the leave it becomes, or back onto the bid a leave becomes again. */
describe('round 3 — words typed, then an action, the box never left', () => {
  const reqAt = (d = D) => rawState().wars[0]!.recs[P]![d]!.find(x => x.kind === 'request') as any
  const leaveOf = () => INPUTS.find((x: any) => x.lw && ((x.people || []).some((p: any) => p.p === P) || x.person === P))
  const typeIn = (testid: string, text: string) => fireEvent.change(screen.getByTestId(testid), { target: { value: text } })
  const switchOff = () => { const t = within(sheet()).queryByTestId('bid-approve-tick'); if (t?.getAttribute('aria-checked') === 'true') fireEvent.click(t) }

  it('Approve: the words ride onto the approved leave', () => {
    setCell(P, D, 'LL')
    render(<Matrix />); fireEvent.click(cell())
    typeIn('bid-remarks', 'typed then approved')
    fireEvent.click(within(sheet()).getByTestId('decide-approve'))
    expect(leaveOf()?.remarks).toBe('typed then approved')
  })

  it('Refuse: the words stay on the refused bid', () => {
    setCell(P, D, 'LL')
    render(<Matrix />); fireEvent.click(cell())
    typeIn('bid-remarks', 'typed then refused')
    fireEvent.click(within(sheet()).getByTestId('decide-refuse'))
    expect(reqAt()).toMatchObject({ state: 'refused', remarks: 'typed then refused' })
  })

  it('another leave tapped (the bid re-typed): the words stay on the bid', () => {
    setCell(P, D, 'LL')
    render(<Matrix />); fireEvent.click(cell())
    switchOff()
    typeIn('bid-remarks', 'typed then re-typed')
    fireEvent.click(within(sheet()).getByTestId('bid-OL'))
    expect(reqAt()).toMatchObject({ code: 'OL', remarks: 'typed then re-typed' })
  })

  it('Move: the words are saved before the bid is picked up', () => {
    setCell(P, D, 'LL')
    render(<Matrix />); fireEvent.click(cell())
    typeIn('bid-remarks', 'typed then moved')
    fireEvent.click(within(sheet()).getByTestId('decide-shift'))
    expect(reqAt().remarks).toBe('typed then moved')
  })

  it('the lit Approve on an approved leave: the words typed go back with it onto the bid', () => {
    INPUTS.length = 0
    fileAbsence(P, 'LL', D, D, { lw: true, remarks: 'Bali' })
    render(<Matrix />); fireEvent.click(cell())
    typeIn('bid-remarks', 'Phuket instead')
    fireEvent.click(within(sheet()).getByTestId('decide-approve'))
    expect(reqAt()).toMatchObject({ state: 'pending', remarks: 'Phuket instead' })
  })

  it('the day\'s list: words typed on the approved leave, then its lit Approve — back on the bid with them', () => {
    INPUTS.length = 0
    const ll = fileAbsence(P, '*LL', D, D, { lw: true, remarks: 'Home' })
    fileAbsence(P, 'ATTB*', D, D, { remarks: 'Clinic review' })
    render(<Matrix />); fireEvent.click(cell())
    typeIn(`dl-${ll.iid}-remarks`, 'Away instead')
    fireEvent.click(screen.getByTestId(`dl-approve-${ll.iid}`))
    expect(reqAt()).toMatchObject({ state: 'pending', remarks: 'Away instead' })
  })

  it('the day\'s list: words typed on a pending bid, then its Approve — on the approved leave', () => {
    setCell(P, D, '*LL')
    setCell(P, D, 'OL*')
    render(<Matrix />); fireEvent.click(cell())
    const am = rawState().wars[0]!.recs[P]![D]!.filter(x => x.kind === 'request')[0]!
    typeIn(`dl-${am.id}-remarks`, 'morning words')
    fireEvent.click(screen.getByTestId(`dl-approve-${am.id}`))
    expect(leaveOf()?.remarks).toBe('morning words')
  })
})

/* ROUND 3's FULL CHECK (24 Oct 26) — three faults its walk found, each pinned here red first */
describe('round 3 — the walk’s finds', () => {
  it('the day’s list reads a waiting run’s "till" from the run’s last day, not the day opened (X6)', () => {
    setCellRange(P, '2026-02-10', '2026-02-12', 'LL')
    expect(setDayAward(P, '2026-02-11', 0.5, { note: 'half a day', givenBy: 'OC' })).toBeNull()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-11`))
    const req = rawState().wars[0]!.recs[P]!['2026-02-11']!.find(x => x.kind === 'request')!
    expect(screen.getByTestId(`dl-${req.id}-tilldate`).textContent).toMatch(/12 Feb/)
  })

  it('the day’s list keeps each entry in its place after an action — a quick second tap never lands on the other entry (X8)', () => {
    INPUTS.length = 0
    const am = fileAbsence(P, '*LL', D, D, { lw: true })
    fileAbsence(P, 'PL*', D, D, { lw: true })
    render(<Matrix />)
    fireEvent.click(cell())
    const order = () => [...screen.getByTestId('daylist').querySelectorAll(':scope > li .dl-main')].map(e => e.textContent ?? '')
    expect(order()[0]).toMatch(/^Morning/)
    fireEvent.click(screen.getByTestId(`dl-approve-${am.iid}`))
    expect(order()[0]).toMatch(/^Morning · pending/)
    expect(order()[1]).toMatch(/^Afternoon · approved/)
  })

  it('a tap outside the open ⋯ menu only closes it — it never presses what it lands on (X9)', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('bid-more'))
    expect(screen.getByTestId('bid-more-menu')).toBeTruthy()
    const ll = within(sheet()).getByTestId('bid-LL')
    fireEvent.pointerDown(ll)
    fireEvent.click(ll)
    expect(screen.queryByTestId('bid-more-menu')).toBeNull()
    expect(screen.queryByTestId('bid-picker'), 'nothing placed: the window still open').toBeTruthy()
    expect(cell().textContent).toBe('')
    /* the next tap is a tap again: LL places (approved, the switch on — the window closes) */
    fireEvent.pointerDown(ll)
    fireEvent.click(ll)
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(cell().textContent).toContain('LL')
  })
})

/* ROUND 3's FULL CHECK — a door the removed "Just this day" took with it: it closed the calendar. "Pick a range" now opens
   it and, tapped again, closes it (the range picked kept), so the calendar is never left open with only ✕ to shut it */
describe('round 3 — the calendar opened by "Pick a range" closes by it too', () => {
  it('a second tap on "Pick a range" closes the calendar', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('span-range'))
    expect(within(sheet()).queryByTestId('span-picker')).toBeTruthy()
    expect(within(sheet()).getByTestId('span-range').getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(within(sheet()).getByTestId('span-range'))
    expect(within(sheet()).queryByTestId('span-picker')).toBeNull()
    expect(within(sheet()).getByTestId('span-range').getAttribute('aria-expanded')).toBe('false')
  })
})

/* ROUND 3's FULL CHECK — the scenario designer's S1, seen by the re-walk (X1) at both sizes: a member's own REFUSED bid opened
   with its leave lit, as if the day held his leave. The window lit the day's leave from its code, excluding a refused bid only
   by the admin's decide state — which a member's window is never given. */
describe('round 3 — a member’s own refused bid lights no leave', () => {
  afterEach(() => setMemberTodayForTests(null))
  it('his window on it: no leave lit, Whole day lit — as the admin’s window on it', () => {
    setMemberTodayForTests('2026-01-01')
    setCell(P, D, 'LL')
    setBidStates([{ personId: P, date: D }], 'refused')
    setRole('member'); setViewer(P)
    render(<Matrix />)
    fireEvent.click(cell())
    const s = sheet()
    expect(s.querySelector('.tchip.lv.lit'), 'no leave lit on a refused bid').toBeNull()
    expect(within(s).getByTestId('portion-full').getAttribute('aria-pressed')).toBe('true')
  })
})
