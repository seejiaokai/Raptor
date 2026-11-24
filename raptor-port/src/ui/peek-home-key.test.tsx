// @vitest-environment jsdom
/* THE NEXT-WEEK PREVIEW AND A MAN'S SQUADRON MOVE (round 4's reads, chat 169, 24 Nov 26 — the fresh Opus read's R4-O1 and
   Astra's "older — next-week preview retains the stale-home gap"). The preview's drawing is kept by a key (ui/peek.ts
   peekKey). The key named the men deleted, the requests and the loaded week's request rows, but not whose week a request
   lands on — each named man's home squadron on its first day (engine/inputs.ts inputOnDay). So a man moved to another
   squadron went on being drawn, with his request, on his old squadron's preview of next week, until something else in
   the key changed. Round 3 made one signature of everything the landing reads, the homes included (engine/overlay.ts
   landingSig), and gave it only to the SANS reminder; the preview keys on it now too.
   Fixture: test-support/msq-world.ts (Wed 15 Jul 26, 142 and the week of 13 Jul on screen). Hex = `rocky`. */
import { describe, expect, it, beforeEach } from 'vitest'
import { dayEngaged } from '../engine/avail'
import { weekBundle } from '../engine/weeks-data'
import { viewOfWeek } from '../engine/overlay'
import { notify } from '../state/store'
import { setHome, homeOn } from '../state/units'
import { globalUndo } from '../undo'
import { commitNewInput } from './inputedit'
import { peekKey, peekWeekHTML } from './peek'
import { useMsqWorld, signInAs } from '../test-support/msq-world'

useMsqWorld()
beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true, writable: true })
  signInAs('saber')
})

/* next week (20 Jul) has no saved copy, so the preview works it out from the demo week, as ui/peek.ts does — here worked
   out afresh, by no kept drawing: does 142's Tue 21 Jul hold Hex? */
const fresh = (): boolean => {
  const b = weekBundle('20/07/2026')
  viewOfWeek('20/07/2026', b.days, { loaded: false, issued: () => null })
  return (dayEngaged(b.days[1]) as Set<string>).has('rocky')
}
// any: a draft as the input sheet hands it over
const meeting = (remarks: string) => commitNewInput({ person: 'rocky', type: 'Meeting', start: '2026-07-21', allday: false, sTime: '09:00', eTime: '10:00', remarks } as any)

describe('R4-O1 — the next-week preview after Hex is moved to 149', () => {
  it('control: Hex\'s Meeting on Tue 21 Jul shows in 142\'s preview of next week', () => {
    expect(meeting('R4PEEK')).toBe(true); notify()
    expect(peekWeekHTML()).toContain('R4PEEK')
    expect(fresh()).toBe(true)
  })
  it('control: with nothing changed the key stands, so the kept drawing is used (no rebuild on an ordinary repaint)', () => {
    expect(meeting('R4PEEK')).toBe(true); notify()
    const k1 = peekKey(), h1 = peekWeekHTML()
    notify()
    expect(peekKey()).toBe(k1)
    expect(peekWeekHTML()).toBe(h1)
  })
  it('Hex moved to 149 from Thu 16 Jul: the preview no longer shows his Meeting', () => {
    expect(meeting('R4PEEK')).toBe(true); notify()
    const k1 = peekKey()
    expect(peekWeekHTML()).toContain('R4PEEK')
    expect(setHome('rocky', 'u149')).toMatchObject({ ok: true }); notify()
    expect(homeOn('rocky', '2026-07-21')).toBe('u149')
    /* (worked out afresh, 142's next week no longer holds him) */
    expect(fresh()).toBe(false)
    expect(peekKey()).not.toBe(k1)
    expect(peekWeekHTML()).not.toContain('R4PEEK')
  })
  it('…and the Undo of the move brings it back (Astra\'s case, with its fresh reading)', () => {
    expect(meeting('astra-peek-home')).toBe(true); notify()
    expect(peekWeekHTML()).toContain('astra-peek-home')
    expect(setHome('rocky', 'u149')).toMatchObject({ ok: true }); notify()
    const b = weekBundle('20/07/2026')
    viewOfWeek('20/07/2026', b.days, { loaded: false, issued: () => null })
    expect(JSON.stringify(b.days)).not.toContain('astra-peek-home')
    expect(peekWeekHTML().includes('astra-peek-home')).toBe(false)
    expect(globalUndo().ok).toBe(true); notify()
    expect(homeOn('rocky', '2026-07-21')).toBe('u142')
    expect(peekWeekHTML()).toContain('astra-peek-home')
  })
})
