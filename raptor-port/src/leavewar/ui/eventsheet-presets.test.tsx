// @vitest-environment jsdom
/* THE EVENT SHEET AS HE TOOK IT — Presets, an optional Name, "On grid", Kind only under "Other…" (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.12; owner D643, D644, D645).

   The old sheet showed two rows of near-identical chips — a saved word to insert, and a "Tag" to class what was
   typed — with nothing saying which did what. Now: a row of PRESETS (the squadron's own ready-made events, the picked
   one lit) and "Other…"; a Name, optional under a preset; "On grid", the short form the grid prints, suggested and
   his to type over; and a Kind row only under "Other…". Both readers' findings are pinned here:
     A — a preset is lit only when its NAME matches the text AND its kind is the event's real kind; opening an event
         never changes it, and a Save with nothing changed writes the same three values back;
     B — "Note" is "no tag", and no tag is NOT no kind: a name that matches a preset IS that preset.
   (The writers themselves — one command, one Undo step, the short form through a move — are ../eventshort-store.test.ts.) */
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Matrix } from './Matrix'
import { addEventBand, addEventType, getState, initStore, removeEventType, setDayEvent, setRole, updateEventType } from '../state/store'
import { memoryBackend } from '../state/storage'
import { dayEventShort, isNonWorkingDay, SHORT_RULE } from '../engine'

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })
afterEach(cleanup)

const D = '2026-05-12'   // a Tuesday, clear of the demo year's holidays
const day = (iso = D) => getState().period.days.find(d => d.date === iso)!
/* the three values of the event on a day's first line */
const three = (iso = D) => [day(iso).events[0], day(iso).eventKinds?.[0] ?? null, dayEventShort(day(iso), 0)]
const el = (tid: string) => screen.getByTestId(tid)
const val = (tid: string) => (el(tid) as HTMLInputElement).value
const lit = (tid: string) => el(tid).getAttribute('aria-pressed') === 'true'
const press = (tid: string) => fireEvent.click(el(tid))
const type = (tid: string, value: string) => fireEvent.change(el(tid), { target: { value } })
/* open the sheet on a cell: an empty one opens at once, a filled one through the small box's Edit */
const open = (tid = `event-0-${D}`) => {
  if (!screen.queryByTestId(tid)) render(<Matrix />)
  press(tid)
  const edit = screen.queryByTestId('event-peek-edit')
  if (edit) fireEvent.click(edit)
}
const save = () => press('event-apply')
const holiday = (iso = D) => isNonWorkingDay(iso, day(iso), getState().eventDefs, getState().period.bands)

describe('the first view', () => {
  it('a fresh cell: the presets, "Other…", nothing lit, no Kind row — and none of the old words', () => {
    open()
    for (const i of [0, 1, 2, 3]) expect(lit(`event-quick-${i}`)).toBe(false)
    expect(lit('event-other')).toBe(false)
    expect(screen.queryByTestId('event-kindrow')).toBeNull()
    expect(el('event-edit-types').textContent).toBe('Edit presets')
    const words = el('event-sheet').textContent!
    expect(words).toContain('Presets')
    expect(words).toContain('On grid')
    expect(words).not.toMatch(/\bTag\b/)
    expect(words).not.toMatch(/untagged/i)
  })
  it('Save with nothing picked and nothing typed asks for one, and saves nothing', () => {
    open(); save()
    expect(el('event-problem').textContent).toMatch(/pick a preset/i)
    expect(three()).toEqual(['', null, null])
  })
})

describe('picking a preset', () => {
  it('lights it, says what it means, and fills "On grid" — the Name stays empty', () => {
    open(); press('event-quick-0')
    expect(lit('event-quick-0')).toBe(true)
    expect(el('event-readout').textContent).toBe('Public holiday · work on it earns OIL')
    expect(val('event-text')).toBe('')
    expect(val('event-short')).toBe('PH')
  })
  it('each kind has its read-out', () => {
    open()
    press('event-quick-1'); expect(el('event-readout').textContent).toBe('Off day · no OIL')
    press('event-quick-2'); expect(el('event-readout').textContent).toBe('No leave · heads-up only')
    press('event-quick-3'); expect(el('event-readout').textContent).toBe('Working event')
  })
  it('saved with no name, the event is the preset’s own name — and it follows its preset, as a typed "PH" always did', () => {
    open(); press('event-quick-2'); save()
    expect(three()).toEqual(['No Leave', null, null])
    expect(screen.queryByTestId('event-sheet')).toBeNull()
    expect(el(`event-0-${D}`).textContent).toBe('NL')
  })
  it('a typed name keeps the preset’s kind, saved on the event itself — and the day is a holiday exactly as "PH" is', () => {
    open(); press('event-quick-0'); type('event-text', 'National Day')
    expect(lit('event-quick-0')).toBe(true)
    expect(val('event-short')).toBe('ND')
    save()
    expect(three()).toEqual(['National Day', 'off', null])
    expect(holiday()).toBe(true)
    expect(el(`event-0-${D}`).textContent).toBe('ND')
    /* the library is untouched: the name belongs to the event alone */
    expect(getState().eventDefs.some(d => d.name === 'National Day')).toBe(false)
  })
  it('"On grid" typed over is saved, kept when the Name is then changed, and after a visit to "Edit presets"', () => {
    open(); press('event-quick-0'); type('event-text', 'National Day'); type('event-short', 'nat')
    type('event-text', 'National Day 26')
    expect(val('event-short')).toBe('NAT')
    press('event-edit-types'); press('types-done')
    expect(val('event-short')).toBe('NAT')
    expect(val('event-text')).toBe('National Day 26')
    expect(lit('event-quick-0')).toBe(true)
    save()
    expect(three()).toEqual(['National Day 26', 'off', 'NAT'])
  })
  it('until it is typed, "On grid" follows the Name', () => {
    open(); press('event-quick-0')
    type('event-text', 'National Day'); expect(val('event-short')).toBe('ND')
    type('event-text', 'Labour Day'); expect(val('event-short')).toBe('LD')
    type('event-text', ''); expect(val('event-short')).toBe('PH')
  })
  it('a second preset pressed takes over', () => {
    open(); press('event-quick-0'); press('event-quick-1')
    expect(lit('event-quick-0')).toBe(false)
    expect(lit('event-quick-1')).toBe(true)
    expect(val('event-short')).toBe('OFF')
  })
})

describe('"Other…"', () => {
  it('shows the Kind row — Public holiday, Off day, No leave, Work, Note — with Note lit', () => {
    open(); press('event-other')
    expect(lit('event-other')).toBe(true)
    expect(el('event-kindrow').textContent).toBe('KindPublic holidayOff dayNo leaveWorkNote')
    expect(lit('event-tag-note')).toBe(true)
  })
  it('needs a name', () => {
    open(); press('event-other'); save()
    expect(el('event-problem').textContent).toMatch(/name/i)
    expect(el('event-sheet')).toBeTruthy()
    expect(three()).toEqual(['', null, null])
  })
  it('a name typed with nothing picked IS "Other…", a note', () => {
    open(); type('event-text', 'CO visit')
    expect(lit('event-other')).toBe(true)
    expect(lit('event-tag-note')).toBe(true)
    expect(val('event-short')).toBe('CV')
    save()
    expect(three()).toEqual(['CO visit', null, null])
  })
  it('a kind chosen there is saved on the event; pressed again it goes back to Note', () => {
    open(); type('event-text', 'Range closure'); press('event-tag-nolv')
    expect(lit('event-tag-nolv')).toBe(true)
    expect(el('event-readout').textContent).toBe('Heads-up only · never blocks a bid')
    press('event-tag-nolv')
    expect(lit('event-tag-note')).toBe(true)
    press('event-tag-nolv'); save()
    expect(three()).toEqual(['Range closure', 'nolv', null])
  })
  it('a name that matches a preset IS that preset: as it is typed the preset lights and "Other…" is left', () => {
    open(); press('event-other'); type('event-text', 'ph')
    expect(lit('event-quick-0')).toBe(true)
    expect(lit('event-other')).toBe(false)
    expect(screen.queryByTestId('event-kindrow')).toBeNull()
    /* and typing on past it lets go again — "Phase 2" is not a public holiday */
    type('event-text', 'Phase 2')
    expect(lit('event-quick-0')).toBe(false)
    expect(lit('event-other')).toBe(true)
    expect(lit('event-tag-note')).toBe(true)
  })
  it('"Note" cannot be paired with a preset’s name — the day stays the public holiday its name makes it', () => {
    open(); type('event-text', 'PH'); press('event-other')
    /* "Other…" on a preset's name carries that preset's kind in, lit */
    expect(lit('event-other')).toBe(true)
    expect(lit('event-tag-off')).toBe(true)
    press('event-tag-note')
    expect(lit('event-quick-0')).toBe(true)
    expect(lit('event-other')).toBe(false)
    save()
    expect(three()).toEqual(['PH', null, null])
    expect(holiday()).toBe(true)
  })
  it('…but another KIND can: a "PH" he tags Off day is an Off day', () => {
    open(); type('event-text', 'PH'); press('event-other'); press('event-tag-free'); save()
    expect(three()).toEqual(['PH', 'free', null])
    expect(holiday()).toBe(false)
  })
})

describe('what it refuses, with the sheet left open', () => {
  it('an "On grid" that is not one to three letters or digits', () => {
    open(); press('event-quick-0'); type('event-short', 'N D'); save()
    expect(el('event-problem').textContent).toBe(SHORT_RULE)
    expect(three()).toEqual(['', null, null])
  })
  it('a new name with no letter or digit, until "On grid" is typed', () => {
    open(); type('event-text', '!!!'); save()
    expect(el('event-problem').textContent).toMatch(/what the grid should print/i)
    type('event-short', 'x'); save()
    expect(three()).toEqual(['!!!', null, 'X'])
  })
})

describe('opening an event that exists never changes it', () => {
  /* open it, check what is lit, press Save untouched, and the three values are as they were */
  const untouched = (setup: () => void, expectLit: string, also?: () => void) => {
    setup()
    const was = three()
    open()
    expect(lit(expectLit)).toBe(true)
    also?.()
    save()
    expect(three()).toEqual(was)
  }
  it('an untagged "PH": the PH preset lit — and it stays untagged', () =>
    untouched(() => setDayEvent(D, 0, 'PH'), 'event-quick-0', () => expect(val('event-text')).toBe('PH')))
  it('a "PH" someone tagged Off day: "Other…" with Off day lit — never shown as a public holiday', () =>
    untouched(() => setDayEvent(D, 0, 'PH', 'free'), 'event-other', () => {
      expect(lit('event-tag-free')).toBe(true)
      expect(lit('event-quick-0')).toBe(false)
      expect(el('event-readout').textContent).not.toMatch(/earns OIL/)
    }))
  it('a name of its own under a kind: "Other…" with its real kind, its own short form shown', () =>
    untouched(() => setDayEvent(D, 0, 'National Day', 'off', 'NAT'), 'event-other', () => {
      expect(lit('event-tag-off')).toBe(true)
      expect(val('event-short')).toBe('NAT')
    }))
  it('two presets of one kind: only the one whose NAME matches', () =>
    untouched(() => { addEventType('Xmas', 'off', 'XM'); setDayEvent(D, 0, 'Xmas') }, 'event-quick-4', () => expect(lit('event-quick-0')).toBe(false)))
  it('a preset RENAMED since: "Other…" — a note now, as the grid already shows it', () =>
    untouched(() => { setDayEvent(D, 0, 'SC'); updateEventType(3, { name: 'Sqn Conf' }) }, 'event-other', () => expect(lit('event-tag-note')).toBe(true)))
  it('a preset RE-KINDED since: an untagged event follows it and lights it…', () =>
    untouched(() => { setDayEvent(D, 0, 'SC'); updateEventType(3, { kind: 'nolv' }) }, 'event-quick-3'))
  it('…a tagged one keeps its own kind and opens on "Other…"', () =>
    untouched(() => { setDayEvent(D, 0, 'SC', 'work'); updateEventType(3, { kind: 'nolv' }) }, 'event-other', () => expect(lit('event-tag-work')).toBe(true)))
  it('a preset DELETED since: "Other…"', () =>
    untouched(() => { setDayEvent(D, 0, 'No Leave', 'nolv'); removeEventType(2) }, 'event-other', () => expect(lit('event-tag-nolv')).toBe(true)))
  it('a merged band: the same rule, and Save leaves its text, kind and short form', () => {
    addEventBand(0, '2026-05-12', '2026-05-13', 'National Day', 'off', 'NAT')
    const was = getState().period.bands
    open('event-band-0-2026-05-12')
    expect(lit('event-other')).toBe(true)
    expect(lit('event-tag-off')).toBe(true)
    expect(val('event-short')).toBe('NAT')
    save()
    expect(getState().period.bands).toEqual(was)
  })
  it('a change of name alone keeps its kind; its own short form stays until he types over it', () => {
    setDayEvent(D, 0, 'National Day', 'off', 'NAT')
    open(); type('event-text', 'Natl Day'); save()
    expect(three()).toEqual(['Natl Day', 'off', 'NAT'])
  })
})

describe('"Edit presets"', () => {
  it('each preset shows its short form, changed there and refused when it breaks the rule', () => {
    open(); press('event-edit-types')
    expect(val('evtype-short-0')).toBe('PH')
    expect(val('evtype-short-2')).toBe('NL')
    type('evtype-short-0', 'hol'); fireEvent.blur(el('evtype-short-0'))
    expect(getState().eventDefs[0]).toEqual({ name: 'PH', kind: 'off', short: 'HOL' })
    type('evtype-short-1', 'O F'); fireEvent.blur(el('evtype-short-1'))
    expect(el('event-problem').textContent).toBe(SHORT_RULE)
    expect(getState().eventDefs[1]!.short).toBe('OFF')
  })
  it('a rename or a change of kind there leaves the short form', () => {
    open(); press('event-edit-types')
    type('evtype-name-1', 'Stand down'); fireEvent.blur(el('evtype-name-1'))
    press('evtype-kind-2-work')
    expect(getState().eventDefs[1]).toEqual({ name: 'Stand down', kind: 'free', short: 'OFF' })
    expect(getState().eventDefs[2]).toEqual({ name: 'No Leave', kind: 'work', short: 'NL' })
  })
  it('a new preset is added with its short form; Reset puts the four back with theirs', () => {
    open(); press('event-edit-types')
    type('evtype-add-name', 'National Day'); type('evtype-add-short', 'nat'); press('evtype-add-btn')
    expect(getState().eventDefs.at(-1)).toEqual({ name: 'National Day', kind: 'off', short: 'NAT' })
    press('types-reset')
    expect(getState().eventDefs.map(d => d.short)).toEqual(['PH', 'OFF', 'NL', 'SC'])
  })
  it('a preset changed there is the preset the first view offers', () => {
    open(); press('event-edit-types')
    type('evtype-short-0', 'hol'); fireEvent.blur(el('evtype-short-0'))
    press('types-done'); press('event-quick-0')
    expect(val('event-short')).toBe('HOL')
  })
})
