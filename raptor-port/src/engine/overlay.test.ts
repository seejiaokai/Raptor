/* [DB-READINESS] group A, phase 6 (d) — engine/overlay.ts on its own: which of a deleted man's rows a day read without
   him loses. The doors that apply it are pinned in state/p6d-deleteonread.test.ts. */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PEOPLE } from './people'
import { INPUTS } from './inputs'
import { overlayDeletedWeek } from './overlay'

const W = '20/07/2026'                                   // Mon 20 – Sun 26 Jul
let saved: any
beforeEach(() => { saved = { bane: { ...(PEOPLE as any).bane }, inputs: INPUTS.slice() } })
afterEach(() => { (PEOPLE as any).bane = saved.bane; INPUTS.length = 0; saved.inputs.forEach((r: any) => INPUTS.push(r)) })
const day = (ground: any[]) => ({ dow: 'Monday', dt: 'Jul 20', notes: [], allhands: [], waves: [], sims: {}, dutywaves: [], ground })

describe('the overlay: a landed row goes with its request\'s CURRENT holder, never the name the row last carried', () => {
  it('a request handed from him to another man since the row was saved: the row stays (Astra, finding 2)', () => {
    INPUTS.push({ iid: 'ov1', person: 'stiff', date: 'Jul 20', yr: 2026, allday: true, type: 'Meeting', mod: 'now' } as any)
    const days = [day([{ prog: 'MEETING', who: 'bane', src: 'ov1', str: '', end: '' }])]
    Object.assign((PEOPLE as any).bane, { deleted: true, deletedFrom: '2026-07-15' })
    overlayDeletedWeek(W, days)
    expect(days[0].ground.map((r: any) => r.src), 'the request is Stiff\'s now — its row is not Bane\'s to lose').toEqual(['ov1'])
  })
  it('his own request (still his, ended by the delete) on a day from his cutoff: the row goes', () => {
    INPUTS.push({ iid: 'ov2', person: 'bane', date: 'Jul 14', endDate: 'Jul 20', yr: 2026, allday: true, type: 'Meeting', mod: 'now' } as any)
    const days = [day([{ prog: 'MEETING', who: 'bane', src: 'ov2', str: '', end: '' }])]
    Object.assign((PEOPLE as any).bane, { deleted: true, deletedFrom: '2026-07-15' })
    overlayDeletedWeek(W, days)
    expect(days[0].ground, 'his row leaves the day to come').toEqual([])
  })
  it('a row whose request is gone (the delete removed it) goes by the name it carries', () => {
    const days = [day([{ prog: 'MEETING', who: 'bane', src: 'gone1', str: '', end: '' }, { prog: 'X', who: 'stiff', src: 'gone2', str: '', end: '' }])]
    Object.assign((PEOPLE as any).bane, { deleted: true, deletedFrom: '2026-07-15' })
    overlayDeletedWeek(W, days)
    expect(days[0].ground.map((r: any) => r.src), 'his goes; another man\'s orphan is not his to take').toEqual(['gone2'])
  })
  it('a day before his cutoff keeps everything', () => {
    const days = [day([{ prog: 'MEETING', who: 'bane', src: 'gone1', str: '', end: '' }])]
    Object.assign((PEOPLE as any).bane, { deleted: true, deletedFrom: '2026-07-21' })  // the 20th is before it
    overlayDeletedWeek(W, days)
    expect(days[0].ground.length).toBe(1)
  })
})
