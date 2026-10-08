import { describe, expect, it } from 'vitest'
import { inputsInMode } from './sans-calendar-model'
const row=(person:string,extra:Record<string,unknown>={})=>({person,type:'SANS Availability',date:'Oct 9',yr:2026,sans:{f:true},allday:true,...extra})

/* The counting tests that stood here (activityPeopleOn / flyingPeopleOn — unique people per activity, ranges, years,
   leap days) went with the functions on 8 Oct 26: the SANS calendar counts with state/flyplan.ts sansCommittedOn, and
   the same cases are pinned on it in state/sansfly.test.ts. */
describe('the Inputs tab and the SANS tab each take their own inputs',()=>{
  it('keeps mode filtering separate and leaves legacy unscoped callers unchanged',()=>{
    const rows=[row('a'),row('b',{sans:{o:true}}),row('c',{type:'LL'})]
    expect(inputsInMode(rows,'sans')).toHaveLength(2)
    expect(inputsInMode(rows,'member')).toEqual([rows[2]])
    expect(inputsInMode(rows)).toEqual(rows)
  })
})
