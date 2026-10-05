import { describe, expect, it } from 'vitest'
import { flyingPeopleOn, activityPeopleOn, inputsInMode } from './sans-calendar-model'
const row=(person:string,extra:Record<string,unknown>={})=>({person,type:'SANS Availability',date:'Oct 9',yr:2026,sans:{f:true},allday:true,...extra})

describe('SANS counts are unique flying offers, separate from filtered rows',()=>{
  it('counts unique people per activity, including multi-activity, duplicate and zero rows',()=>{
    const rows=[row('a',{sans:{f:true,o:true,a:true}}),row('a',{sans:{f:true,o:true,a:true}}),row('b',{sans:{o:true}}),row('c',{sans:{a:true}}),row('d',{sans:{f:true},allday:false,s:600,e:660}),row('ignore',{type:'Meeting',sans:{f:true,o:true,a:true}})]
    expect(activityPeopleOn('2026-10-09',rows)).toEqual({f:['a','d'],o:['a','b'],a:['a','c']})
    expect(activityPeopleOn('2026-10-10',rows)).toEqual({f:[],o:[],a:[]})
    expect(flyingPeopleOn('2026-10-09',rows)).toEqual(activityPeopleOn('2026-10-09',rows).f)
  })
  it('applies authored range, year, leap and overnight coverage to every activity',()=>{
    const rows=[row('all',{sans:{f:true,o:true,a:true},date:'Dec 31',endDate:'Jan 2 2027'}),row('old',{sans:{o:true},date:'Jan 1'}),row('night',{date:'Jan 1',yr:2027,allday:false,s:1320,e:120,sans:{o:true,a:true}}),row('leap',{date:'Feb 29',yr:2028,sans:{a:true}})]
    expect(activityPeopleOn('2027-01-01',rows)).toEqual({f:['all'],o:['all','night'],a:['all','night']})
    expect(activityPeopleOn('2027-01-02',rows)).toEqual({f:['all'],o:['all'],a:['all']})
    expect(activityPeopleOn('2028-02-29',rows)).toEqual({f:[],o:[],a:['leap']})
  })
  it('counts each Fly person once including short offers, ignoring other activities',()=>{
    const rows=[row('a'),row('a',{sans:{f:true,o:true,a:true}}),row('b',{allday:false,s:480,e:540}),row('c',{sans:{o:true,a:true}}),row('d',{type:'Meeting'})]
    expect(flyingPeopleOn('2026-10-09',rows)).toEqual(['a','b'])
  })
  it('uses real years and inclusive multi-day ranges without crediting overnight next day',()=>{
    const rows=[row('a'),row('b',{yr:2027}),row('c',{date:'Oct 8',endDate:'Oct 10'}),row('night',{allday:false,s:1320,e:120})]
    expect(flyingPeopleOn('2026-10-09',rows)).toEqual(['a','c','night'])
    expect(flyingPeopleOn('2026-10-10',rows)).toEqual(['c'])
    expect(flyingPeopleOn('2027-10-09',rows)).toEqual(['b'])
  })
  it('handles leap days and an explicit cross-year end',()=>{
    const rows=[row('leap',{date:'Feb 29',yr:2028}),row('cross',{date:'Dec 31',endDate:'Jan 2 2027'})]
    expect(flyingPeopleOn('2028-02-29',rows)).toEqual(['leap'])
    expect(flyingPeopleOn('2027-01-01',rows)).toEqual(['cross'])
  })
  it('keeps mode filtering separate and leaves legacy unscoped callers unchanged',()=>{
    const rows=[row('a'),row('b',{sans:{o:true}}),row('c',{type:'LL'})]
    expect(inputsInMode(rows,'sans')).toHaveLength(2)
    expect(inputsInMode(rows,'member')).toEqual([rows[2]])
    expect(inputsInMode(rows)).toEqual(rows)
    expect(flyingPeopleOn('2026-10-09',rows)).toEqual(['a'])
  })
})
