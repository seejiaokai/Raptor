// @vitest-environment jsdom
/* THE CREW LIST, NOTHING PICKED, FOR A COMMITMENT UNDER UNAVAILABLE (the walk of the M3 code read's Q2, 25 Oct 26).
   On the Ground Programme a course's row faded its man in the crew list as "already tasked today". Under Unavailable
   (his D1372 — and any commitment a scheduler moves → Unavail, D1357) there is no row: an all-day one now crosses him
   out (engine/inputs.ts isAway, unavaway.test.ts), but the walk found a course filed on the Inputs page opens with
   hours (06:00–18:00), and with nothing picked the list crosses out only a whole-day absence — so he stood in full
   colour as free. A commitment under Unavailable with hours now fades him as already tasked, as its row on the Ground
   Programme did; picking a seat still judges him by its hours (slotBar). A cancelled one does neither. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { validate } from '../engine/validate'
import { availByWave } from '../engine/avail'
import { paletteHTML } from './palette-html'

const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS)
beforeEach(() => { DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d)); validate() })
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

const puckClass = (di: number, id: string) => {
  const box = document.createElement('div'); box.innerHTML = paletteHTML(di)
  const e = box.querySelector(`.rpuck[data-person="${id}"]`) as HTMLElement | null
  return e ? [...e.classList].filter(c => c !== 'rpuck' && c !== 'haswhy').join(' ') : null
}
/* a man free and untasked on Tuesday, with nothing of his own that day */
function freeTue(): string {
  const a = availByWave(DAYS[1])
  const who = a.anyWave.find((id: string) => !INPUTS.some((i: any) => i.person === id && i.date === 'Jul 14') && puckClass(1, id) === '')
  expect(who, 'nobody free on Tuesday in the seed').toBeTruthy()
  return who as string
}
const timed = (who: string, type: string, extra: any = {}) =>
  ({ iid: 'cu-' + type + '-' + who, person: who, date: 'Jul 14', allday: false, s: 360, e: 1080, type, remarks: '', mod: '', ...extra })

describe('the crew list with nothing picked: a commitment under Unavailable', () => {
  it('with hours (a course filed on the Inputs page) fades him as already tasked, as its Ground row did', () => {
    const who = freeTue()
    INPUTS.push(timed(who, 'CSE', { acc: 'u' })); validate()
    expect(puckClass(1, who)).toBe('busy')
  })

  it('all day crosses him out', () => {
    const who = freeTue()
    INPUTS.push(timed(who, 'Training', { acc: 'u', allday: true, s: undefined, e: undefined })); validate()
    expect(puckClass(1, who)).toBe('no')
  })

  it('cancelled, or still only in Personal Inputs (rejected): free, as before', () => {
    const who = freeTue()
    INPUTS.push(timed(who, 'CSE', { acc: 'u', cx: 'cancelled' })); validate()
    expect(puckClass(1, who)).toBe('')
    INPUTS.pop(); INPUTS.push(timed(who, 'CSE', { acc: 'r' })); validate()
    expect(puckClass(1, who)).toBe('')
  })

  it('a part-day leave keeps its look (free with nothing picked) — only commitments read as tasked', () => {
    const who = freeTue()
    INPUTS.push(timed(who, 'LL', { half: 'am', s: 240, e: 720 })); validate()
    expect(puckClass(1, who)).toBe('')
  })
})
