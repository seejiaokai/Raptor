/* [END-TIME-GUARD] — THE DEMO WEEKS FIT THE END-TIME RULE (his D2616: "We can remake it to fit our rules"; D2612, D2852).
   Before the remake, week 1 had seven rows the rule refuses (Monday's OPS SHARING + NAV SYS BRIEF, DINNER WITH CMD and
   CMD ENGAGEMENT; Tuesday's OPS BRIEFER / EP SUP and FLY W EXT SQN; Wednesday's NAV-SYS TRIAL PREP; Friday's MASS
   DEBRIEF + BEER CALL) and week 2 one (Friday's MASS DEBRIEF + BEER CALL); each was given the end the app had assumed,
   its start plus the Logic page's one hour. Every demo day can be signed and published. */
import { describe, expect, it } from 'vitest'
import { DAYS, WEEK1_DAYS_SNAP } from './data'
import { WEEK2_DAYS } from './week2'
import { week149Days } from './week149'
import { dayTimeGaps } from './timegaps'

const gapsOf = (days: any[]) => days.map((d: any, di: number) => [d.dow, dayTimeGaps(d, di).items]).filter(([, n]) => n)

describe('the demo weeks, as the app hands them out', () => {
  it('week 1 (the live seed and the clean copy the week selector reloads) has nothing missing', () => {
    expect(gapsOf(DAYS)).toEqual([])
    expect(gapsOf(JSON.parse(WEEK1_DAYS_SNAP))).toEqual([])
  })
  it('week 2 and squadron 149\'s week have nothing missing', () => {
    expect(gapsOf(WEEK2_DAYS)).toEqual([])
    expect(gapsOf(week149Days())).toEqual([])
  })
  it('each remade row has the end the app had assumed for it — its start plus one hour', () => {
    const ap = (di: number, prog: string) => DAYS[di].allhands.find((x: any) => x.prog === prog)
    const gr = (di: number, prog: string) => DAYS[di].ground.find((x: any) => x.prog === prog)
    expect([ap(0, 'OPS SHARING + NAV SYS BRIEF').end, ap(0, 'DINNER WITH CMD').end, ap(0, 'CMD ENGAGEMENT @ CREW ROOM (ALL)').end]).toEqual(['1855', '1930', '2230'])
    expect([gr(1, 'OPS BRIEFER / EP SUP').end, gr(1, 'FLY W EXT SQN').end, gr(2, 'NAV-SYS TRIAL PREP').end]).toEqual(['0600', '0945', '1500'])
    expect(ap(4, 'MASS DEBRIEF + BEER CALL').end).toBe('1800')
    expect(WEEK2_DAYS[4].allhands.find((x: any) => x.prog === 'MASS DEBRIEF + BEER CALL').end).toBe('1800')
  })
})
