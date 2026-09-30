// src/storage/tables.ts
/* WHICH TABLE OF THE DESIGN A STORED ROW BELONGS TO ([DB-READINESS] group A, phase 4.1 — plan §2.5's matrix,
   docs/data-model.md §5). Group A made every stored record one row of one table; this names the table from the row's
   key alone, so a change-log batch (`ChangeBatch.items`, §2.7) can say "Input i123 was put" and the adapter the IT team
   writes can route a row without knowing the app. Pure, no imports beyond the collection type.

   Ids are read by their PREFIX, and a schedule row's by its markers before its `#`: an issued version's id carries a
   `#` of its own (`<wk>:is:<iso>#<ver>~<n>`), so `:is:` / `:rx:` are tested first (P1-ISSUANCE-KEY, F3-09).
   The Tracker's rows are named by their key's grammar. Since phase 5b (D462) its lists are one row per thing
   (src/tracker/app/rows.js): a course `v3:master:course:<id>`, an enrolment `v3:<course>:<chart>:enr:<id>`, a chart
   `v3:master:chart:<id>`, a ball's typed details `v3:master:info:<chart>:<ball>` — read first, since a ball's code may
   spell any word the older checks look for. */
import type { Collection } from './backend'

const TRACKER = (id: string): string => {
  if (id.startsWith('v3:master:course:')) return 'Course'
  if (id.startsWith('v3:master:chart:')) return 'Syllabus'
  if (id.startsWith('v3:master:info:')) return 'TrainingEvent'
  const p = id.split(':'), last = p[p.length - 1], last2 = p[p.length - 2]
  if (last2 === 'enr' && p.length === 5) return 'Enrolment'
  if (last2 === 'm' || last2 === 'd' || last2 === 'pace' || last2 === 'lulls') return 'Enrolment'
  if (last === 'roster') return 'Enrolment'
  if (last === 'courses' || last === 'delcourses') return 'Course'
  if (last === 'syls' || last === 'syl' || last === 'sylcat' || last === 'sylorder' || last === 'sylhidden' || last === 'syltomb') return 'Syllabus'
  if (last === 'eventinfo') return 'TrainingEvent'
  if (last === 'plan') return 'CoursePlan'
  if (p.includes('lay')) return 'Layout'
  return 'Setting'
}

export function tableOf(collection: Collection, id: string): string {
  switch (collection) {
    case 'weeks':
      if (id.includes(':is:')) return 'Amendment'
      if (id.includes(':rx:')) return 'AmendmentRetraction'
      return id.includes('#') ? 'ScheduleDay' : 'ScheduleWeek'
    case 'inputs': return 'Input'
    case 'people': return 'Person'
    case 'plan': return id.startsWith('dm:') ? 'DayRemark' : 'PlanningPuck'
    case 'leavewar':
      if (id.startsWith('war:')) return 'LeaveWar'
      if (id.startsWith('rec:')) return 'LeaveBid'
      if (id.startsWith('ledger:')) return 'LeaveLedger'
      if (id.startsWith('opening:')) return 'LeaveOpening'
      if (id.startsWith('profile:')) return 'LeavePersonProfile'
      return 'Setting'
    case 'settings':
      if (id === 'schema') return 'SchemaVersion'
      if (id.startsWith('elog:')) return 'EditLog'
      if (id.startsWith('seen:')) return 'EditLogSeen'
      if (id.startsWith('account:')) return 'User'
      if (id.startsWith('accessreq:')) return 'AccessRequest'
      if (id.startsWith('reqseen:')) return 'AccessRequestSeen'
      return 'Setting'
    case 'tracker': return TRACKER(id)
    case 'changes': return 'ChangeBatch'
  }
}
