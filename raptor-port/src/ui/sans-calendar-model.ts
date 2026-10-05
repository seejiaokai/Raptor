import { INPUTS, isSansAvail, inputCoversDate } from '../engine/inputs'
import { fmt } from './inputedit'
export type InputsMode = 'member' | 'sans'
export function inputsInMode(rows: any[], mode?: InputsMode): any[] {
  if (!mode) return rows
  return rows.filter(r => mode === 'sans' ? isSansAvail(r.type) : !isSansAvail(r.type))
}
/** Whole-day offer count ignores person/type/search filters and clock-window
 * coverage. The scheduler still validates actual times independently. */
export function activityPeopleOn(iso: string, rows: any[] = INPUTS): {f:string[],o:string[],a:string[]} {
  const date = fmt(iso)
  const sets = {f:new Set<string>(),o:new Set<string>(),a:new Set<string>()}
  for(const r of rows){
    if(!r?.person || !isSansAvail(r.type) || !inputCoversDate(r,date))continue
    for(const activity of ['f','o','a'] as const)if(r.sans?.[activity])sets[activity].add(String(r.person))
  }
  return {f:[...sets.f],o:[...sets.o],a:[...sets.a]}
}
export function flyingPeopleOn(iso: string, rows: any[] = INPUTS): string[] {
  return activityPeopleOn(iso,rows).f
}
