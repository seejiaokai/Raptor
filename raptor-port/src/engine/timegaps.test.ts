/* [END-TIME-GUARD] — WHICH ITEMS OF A DAY ARE MISSING A TIME (his D2852, D2612, D2855, D2790; the plan
   docs/superpowers/plans/2026-11-27-end-time-guard-plan.md §R2). One case a row of the rule's table, both sides of each
   exception. The cases no ruling settles keep what the app does today — never refused — and a skipped test names the
   question put to him (the plan's §R5). */
import { afterEach, describe, expect, it } from 'vitest'
import { dayTimeGaps } from './timegaps'
import { INPUTS } from './inputs'

const fly = (f: any, wave: any = {}) => ({ waves: [{ label: 'WAVE 1', ...wave, formations: [{ cs: 'VL', msn: 'BFM', ...f }] }] })
const ac = (p = 'stiff', w = 'freak') => ({ p, w, area: '', rmks: '' })
const G = (d: any) => dayTimeGaps(d, 0)

describe('a flying or standby line', () => {
  it('crew on a line with no take-off: the take-off box is missing', () => {
    expect(G(fly({ to: '', ld: '14:10', aircraft: [ac()] }))).toEqual({ items: 1, boxes: ['ff:0.0.0.to'] })
  })
  it('a take-off and no landing: the landing box', () => {
    expect(G(fly({ to: '12:00', ld: '', aircraft: [ac()] })).boxes).toEqual(['ff:0.0.0.ld'])
  })
  it('a stored "TBD" landing, any case, counts as empty (D2855)', () => {
    expect(G(fly({ to: '12:00', ld: 'TBD', aircraft: [ac()] })).boxes).toEqual(['ff:0.0.0.ld'])
    expect(G(fly({ to: '12:00', ld: ' tbd ', aircraft: [ac()] })).boxes).toEqual(['ff:0.0.0.ld'])
  })
  it('crew and both times: nothing missing', () => {
    expect(G(fly({ to: '12:00', ld: '13:20', aircraft: [ac()] })).items).toBe(0)
  })
  it('no crew and a take-off typed: counted — a start needs its end, nobody on it too', () => {
    expect(G(fly({ to: '12:00', ld: '', aircraft: [ac('', '')] })).boxes).toEqual(['ff:0.0.0.ld'])
  })
  it('no crew and no times: a blank line stays plain', () => {
    expect(G(fly({ to: '', ld: '', aircraft: [ac('', '')] })).items).toBe(0)
  })
  it('a take-off typed on a line with no aircraft rows: counted by the start rule', () => {
    expect(G(fly({ to: '12:00', ld: '', aircraft: [] })).items).toBe(1)
  })
  it('the formation cancelled: left out; the cancellation taken back: counted at once', () => {
    const d: any = fly({ to: '12:00', ld: '', cx: true, aircraft: [ac()] })
    expect(G(d).items).toBe(0)
    delete d.waves[0].formations[0].cx
    expect(G(d).items).toBe(1)
  })
  it('one aircraft cancelled, the other crewed: counted', () => {
    expect(G(fly({ to: '12:00', ld: '', aircraft: [{ ...ac(), cx: true }, ac('bane', 'wolf')] })).items).toBe(1)
  })
  it('crew only on a cancelled aircraft, no times: nobody is on the line', () => {
    expect(G(fly({ to: '', ld: '', aircraft: [{ ...ac(), cx: true }, ac('', '')] })).items).toBe(0)
  })
  it.todo('every aircraft cancelled, the line not, a take-off and no landing — waits on his answer R7 (today: never refused)')
  it('an extra dropped under an aircraft is someone on the line', () => {
    expect(G(fly({ to: '', ld: '', aircraft: [{ ...ac('', ''), more: ['rocky'] }] })).boxes).toEqual(['ff:0.0.0.to', 'ff:0.0.0.ld'])
  })
  it('an SC MAIN with a man, START typed and END empty: the END box', () => {
    const d = fly({ to: '20:00', ld: '', aircraft: [ac('stiff', '')] }, { standalone: true, kind: 'sc' })
    expect(G(d).boxes).toEqual(['ff:0.0.0.ld'])
  })
  it('an SC SPARE alone with a man and no times: one item, both boxes', () => {
    const d = fly({ to: '', ld: '', msn: 'SPARE', aircraft: [ac('stiff', '')] }, { standalone: true, kind: 'sc' })
    expect(G(d)).toEqual({ items: 1, boxes: ['ff:0.0.0.to', 'ff:0.0.0.ld'] })
  })
  it('blank entries left by a delete are nobody (trimmed, non-empty only)', () => {
    expect(G(fly({ to: '', ld: '', aircraft: [{ p: '', w: '  ', more: ['', ''] }] })).items).toBe(0)
    expect(G(fly({ to: '', ld: '', aircraft: [{ p: '', w: '', more: ['', 'rocky'] }] })).items).toBe(1)
  })
})

describe('a duty desk', () => {
  const desk = (r: any) => ({ dutywaves: [{ label: '1st wave', rows: [{ role: 'SXO', ...r }] }] })
  it('a man and no times: one item, both boxes', () => {
    expect(G(desk({ id: 'razer', str: '', end: '' }))).toEqual({ items: 1, boxes: ['dr:0.0.0.str', 'dr:0.0.0.end'] })
  })
  it('the role alone: not counted', () => {
    expect(G(desk({ id: '', str: '', end: '' })).items).toBe(0)
  })
  it('a callsign typed that is not on the roster: counted (a callsign typed in its people box, D2852)', () => {
    expect(G(desk({ id: 'NEWGUY', str: '0800', end: '' })).items).toBe(1)
    expect(G(desk({ id: 'NEWGUY', str: '', end: '' })).items).toBe(1)
  })
  it('a template desk with START and no END, nobody on it: counted at once', () => {
    expect(G(desk({ id: '', str: '20:00', end: '' })).boxes).toEqual(['dr:0.0.0.end'])
  })
  it('a cancelled desk: left out', () => {
    expect(G(desk({ id: 'razer', str: '', end: '', cx: true })).items).toBe(0)
  })
  it('an extra under the desk is someone', () => {
    expect(G(desk({ id: '', more: ['yeti'], str: '0800', end: '1200' })).items).toBe(0)
    expect(G(desk({ id: '', more: ['yeti'], str: '0800', end: '' })).items).toBe(1)
  })
})

describe('a sim row', () => {
  const sims = (amt: any[], oft: any[] = []) => ({ sims: { amt, oft } })
  it('an OFT with a crew, END typed and START empty: the START box', () => {
    expect(G(sims([], [{ label: 'EP-4', str: '', end: '10:30', p: 'haowen', w: 'stiff' }])).boxes).toEqual(['sr:0.oft.0.str'])
  })
  it('a pax list only, no end: counted', () => {
    expect(G(sims([{ label: 'BOX', str: '11:30', end: '', pax: ['prowler', 'drill'] }])).boxes).toEqual(['sr:0.amt.0.end'])
  })
  it('the AMT block\'s BRIEF and DEBRIEF with nobody on them: left out', () => {
    const d = sims([{ label: 'BRIEF', str: '11:00', end: '' }, { label: 'BOX', str: '11:30', end: '12:30', pax: ['drill'] }, { label: 'DEBRIEF', str: '12:30', end: '' }])
    expect(G(d).items).toBe(0)
  })
  it('a man put on the BRIEF row: counted', () => {
    expect(G(sims([{ label: 'BRIEF', str: '11:00', end: '', p: 'stiff' }])).boxes).toEqual(['sr:0.amt.0.end'])
  })
  it('an OFT row labelled BRIEF with nobody on it is NOT the AMT block\'s: counted by the start rule', () => {
    expect(G(sims([], [{ label: 'BRIEF', str: '11:00', end: '' }])).items).toBe(1)
  })
  it.todo('an AMT row labelled "BOX — DEBRIEF PRACTICE", nobody on it, START typed — waits on his answer Q16 (today: never refused)')
  it('a cancelled sim: left out', () => {
    expect(G(sims([], [{ label: 'EP-4', str: '', end: '', p: 'haowen', cx: true }])).items).toBe(0)
  })
  it('the free-text label "EXT SQN" alone, no times: not counted until his answer R8 (today: never refused)', () => {
    expect(G(sims([], [{ label: 'SIMS (EXT SQN)', str: '', end: '', who: 'EXT SQN' }])).items).toBe(0)
  })
  it('the free-text label with its START typed and END empty: counted by the start rule', () => {
    expect(G(sims([], [{ label: 'SIMS (EXT SQN)', str: '13:30', end: '', who: 'EXT SQN' }])).items).toBe(1)
  })
  it.todo('the free-text label "EXT SQN" alone, no times — counted as someone? waits on his answer R8')
})

describe('a ground programme row', () => {
  const ground = (g: any) => ({ ground: [{ prog: 'SAFETY DAY', ...g }] })
  afterEach(() => { for (let i = INPUTS.length - 1; i >= 0; i--) if (String(INPUTS[i].iid || '').startsWith('tg-')) INPUTS.splice(i, 1) })
  it('a typed row with a man and both boxes empty: one item, two boxes — a typed row never gets all day (D2790)', () => {
    expect(G(ground({ who: 'dj', str: '', end: '' }))).toEqual({ items: 1, boxes: ['gr:0.0.str', 'gr:0.0.end'] })
  })
  it('the same row with its real hours typed: nothing missing', () => {
    expect(G(ground({ who: 'dj', str: '07:30', end: '17:00' })).items).toBe(0)
  })
  it('a row standing for an input with All day ticked: left out', () => {
    INPUTS.push({ iid: 'tg-1', person: 'dj', date: 'Jul 13', allday: true, type: 'Training', remarks: '' })
    expect(G(ground({ who: 'dj', str: '', end: '', src: 'tg-1' })).items).toBe(0)
  })
  it('a row standing for a timed input, its END empty: counted', () => {
    INPUTS.push({ iid: 'tg-2', person: 'dj', date: 'Jul 13', allday: false, s: 540, e: 600, type: 'Training', remarks: '' })
    expect(G(ground({ who: 'dj', str: '09:00', end: '', src: 'tg-2' })).items).toBe(1)
  })
  /* a row the input left behind (`kept` — a version load or a plan switch brought it back after the input moved off the
     day): no ruling says it stops being the All-day input's row, so it keeps today's behaviour, never refused (his D2611;
     the two Opus code reads' F1) — the plan's question R9 */
  it('a kept row whose input still has All day ticked: left out, as today (R9 open)', () => {
    INPUTS.push({ iid: 'tg-3', person: 'dj', date: 'Jul 13', allday: true, type: 'Training', remarks: '' })
    expect(G(ground({ who: 'dj', str: '', end: '', src: 'tg-3', kept: true })).items).toBe(0)
  })
  it('a kept row whose input is gone: left out, as today (R9 open — whether it was All day cannot be read)', () => {
    expect(G(ground({ who: 'dj', str: '', end: '', src: 'tg-gone', kept: true })).items).toBe(0)
  })
  it('a kept row of a timed input, its END empty: counted, as any timed input row', () => {
    INPUTS.push({ iid: 'tg-4', person: 'dj', date: 'Jul 13', allday: false, s: 540, e: 600, type: 'Training', remarks: '' })
    expect(G(ground({ who: 'dj', str: '09:00', end: '', src: 'tg-4', kept: true })).items).toBe(1)
  })
  it.todo('a kept All-day row — counted as the scheduler\'s typed row, or left out? waits on his answer R9 (today: never refused)')
  it('an information-only row: left out; the mark taken off: counted', () => {
    const d: any = ground({ who: 'dj', str: '09:00', end: '', info: true })
    expect(G(d).items).toBe(0)
    delete d.ground[0].info
    expect(G(d).items).toBe(1)
  })
  it('a blank row with nobody and no times: plain', () => {
    expect(G(ground({ who: '', str: '', end: '' })).items).toBe(0)
  })
  it('people boxes with blank entries are nobody', () => {
    expect(G(ground({ who: '  ', more: [''], str: '', end: '' })).items).toBe(0)
  })
  /* his D2862 (27 Nov 26, round 1's question 4): any time typed asks for the other */
  it('only the END typed and nobody on it: counted, the START box (D2862)', () => {
    expect(G(ground({ who: '', str: '', end: '17:00' }))).toEqual({ items: 1, boxes: ['gr:0.0.str'] })
  })
  it('a word, not a time, in the END box and nobody on it: plain — a word is no time typed (R2 unchanged)', () => {
    expect(G(ground({ who: '', str: '', end: 'late' })).items).toBe(0)
  })
})

describe('a Common Programme row', () => {
  const ap = (x: any) => ({ allhands: [{ prog: 'SQN PT', ...x }] })
  it('SODB with only its END typed, nobody on it: counted, the START box (D2862)', () => {
    expect(G({ allhands: [{ prog: 'SODB', who: '', str: '', end: '08:00' }] }).boxes).toEqual(['ap:0.0.str'])
  })
  it('a flying line with only its landing typed, nobody on it: counted, the take-off box (D2862)', () => {
    expect(G({ waves: [{ formations: [{ to: '', ld: '10:30', aircraft: [{ p: '', w: '' }] }] }] }).boxes).toEqual(['ff:0.0.0.to'])
  })
  it('ALL AVAIL with a start and no end: the END box', () => {
    expect(G(ap({ who: 'allavail', str: '15:00', end: '' })).boxes).toEqual(['ap:0.0.end'])
  })
  it('ALL with no times: both boxes', () => {
    expect(G(ap({ who: 'all', str: '', end: '' })).boxes).toEqual(['ap:0.0.str', 'ap:0.0.end'])
  })
  it('a list of people: someone', () => {
    expect(G(ap({ who: ['', 'stiff'], str: '', end: '' })).items).toBe(1)
    expect(G(ap({ who: [''], str: '', end: '' })).items).toBe(0)
    expect(G(ap({ who: [], str: '', end: '' })).items).toBe(0)
  })
  it('DINNER WITH CMD 18:30, nobody on it: the END box', () => {
    expect(G(ap({ prog: 'DINNER WITH CMD', str: '1830', end: '' })).boxes).toEqual(['ap:0.0.end'])
  })
  it('a cancelled row and an information-only row: left out', () => {
    expect(G(ap({ who: 'all', str: '', end: '', cx: true })).items).toBe(0)
    expect(G(ap({ who: 'all', str: '', end: '', info: true })).items).toBe(0)
  })
  it('nobody and no times: plain', () => {
    expect(G(ap({ str: '', end: '' })).items).toBe(0)
  })
})

describe('words in a time box, counting', () => {
  it('a word other than TBD keeps what the app does today: never a missing box, never a typed start', () => {
    expect(G(fly({ to: '12:00', ld: 'ASAP', aircraft: [ac()] })).items).toBe(0)
    expect(G({ allhands: [{ prog: 'X', str: 'ASAP', end: '' }] }).items).toBe(0)
  })
  it.todo('a word other than TBD ("ASAP") counts as empty — waits on his answer R2')
  it('items count items, boxes count boxes, across every section', () => {
    const d = {
      allhands: [{ prog: 'A', who: 'all', str: '', end: '' }, { prog: 'B', str: '1000', end: '' }],
      dutywaves: [{ label: 'x', rows: [{ role: 'SDO', id: 'mamba', str: '', end: '1300' }] }],
    }
    expect(G(d)).toEqual({ items: 3, boxes: ['ap:0.0.str', 'ap:0.0.end', 'ap:0.1.end', 'dr:0.0.0.str'] })
  })
  it('a day with no sections at all, or no day: nothing', () => {
    expect(G({})).toEqual({ items: 0, boxes: [] })
    expect(dayTimeGaps(null, 0)).toEqual({ items: 0, boxes: [] })
  })
})
