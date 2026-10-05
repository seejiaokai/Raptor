/* D518/D525/D530/D531. Context v1 is saved format: change its tokenizer only with an explicit version policy.
   DS/RED prose is a reason to ask, never an interpretation of which unit supports whom. */
import { dayIso } from './verid'
import { isStandalone } from './waves'
export type MissionSide = 'blue' | 'red'
export type MissionSource = { msn?: unknown; aircraft?: Array<{ rmks?: unknown }> }
export type RoleIdentity = { weekKey: string; dayISO: string; formationRid: string; context: string }
export type RoleAnswer = RoleIdentity & { format: 1; contextVersion: 1; side: MissionSide }
export type RoleSeeds = {format:1;seeds:Array<{path:[number,number];context:string;side:MissionSide}>}
/** Template metadata sits outside its programme blob; mismatching/duplicate paths are inert. */
export function validRoleSeeds(value:unknown,blob:any): RoleSeeds | undefined {
  const v=value as any
  if (!v || v.format!==1 || !Array.isArray(v.seeds)) return undefined
  const seen=new Set<string>(), duplicates=new Set<string>()
  for(const s of v.seeds) if(Array.isArray(s?.path)) {const k=JSON.stringify(s.path);if(seen.has(k)) duplicates.add(k);seen.add(k)}
  const seeds:RoleSeeds['seeds']=[]
  for(const s of v.seeds) {
    if(!Array.isArray(s?.path)||s.path.length!==2||!s.path.every((n:unknown)=>Number.isSafeInteger(n)&&Number(n)>=0)||duplicates.has(JSON.stringify(s.path))||(s.side!=='blue'&&s.side!=='red')) continue
    const wave=blob?.waves?.[s.path[0]],f=wave?.formations?.[s.path[1]]
    if(isStandalone(wave))continue
    if(!f) continue
    const r=resolveMissionRole(f)
    if(r.conditional&&r.context===s.context) seeds.push({path:[s.path[0],s.path[1]],context:s.context,side:s.side})
  }
  return seeds.length ? {format:1,seeds} : undefined
}
const cue = /(^|[^A-Z])(DS|RED|REDAIR)(?=$|[^A-Z])/
const text = (v: unknown): string => typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').toUpperCase() : ''
/* A complete spelling alias only. REDAIR2 remains the entire conditional Mission/context, never exact Red. */
const normalize = (v: unknown): string => text(v).replace(/(^|[^A-Z0-9])RED(?:AIR|-AIR)(?=$|[^A-Z0-9])/g, '$1RED AIR')
export function missionContext(f: MissionSource): string {
  const clauses = new Set<string>()
  for (const a of Array.isArray(f?.aircraft) ? f.aircraft : []) {
    for (const raw of (typeof a?.rmks === 'string' ? a.rmks : '').split(/;|\/\//)) {
      const clause = normalize(raw)
      if (cue.test(clause)) clauses.add(clause)
    }
  }
  return JSON.stringify([1, normalize(f?.msn), [...clauses].sort()])
}
function validContext(context: unknown): context is string {
  if (typeof context !== 'string') return false
  try {
    const t = JSON.parse(context)
    return Array.isArray(t) && t.length === 3 && t[0] === 1 && typeof t[1] === 'string'
      && normalize(t[1]) === t[1] && Array.isArray(t[2])
      && t[2].every((c: unknown) => typeof c === 'string' && normalize(c) === c && cue.test(c))
      && JSON.stringify([1, t[1], [...new Set(t[2])].sort()]) === context
  } catch { return false }
}
function validIdentity(v: any): v is RoleIdentity {
  if (!v || typeof v !== 'object' || typeof v.weekKey !== 'string' || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v.weekKey)
    || typeof v.dayISO !== 'string' || typeof v.formationRid !== 'string' || !v.formationRid.trim() || !validContext(v.context)) return false
  const [d, m, y] = v.weekKey.split('/').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d || date.getUTCDay() !== 1) return false
  return Array.from({ length: 7 }, (_, di) => dayIso(v.weekKey, di)).includes(v.dayISO)
}
export function encodeRoleId(v: RoleIdentity): string {
  if (!validIdentity(v)) throw new Error('Invalid mission-role identity')
  return encodeURIComponent(JSON.stringify([1, v.weekKey, v.dayISO, v.formationRid, v.context]))
}
export function decodeRoleId(id: unknown): RoleIdentity | null {
  if (typeof id !== 'string') return null
  try {
    const t = JSON.parse(decodeURIComponent(id))
    if (!Array.isArray(t) || t.length !== 5 || t[0] !== 1) return null
    const v = { weekKey: t[1], dayISO: t[2], formationRid: t[3], context: t[4] }
    return validIdentity(v) && encodeRoleId(v) === id ? v : null
  } catch { return null }
}
export function validRoleAnswer(id: unknown, answer: unknown): answer is RoleAnswer {
  const v: any = answer, identity = decodeRoleId(id)
  return !!identity && !!v && !Array.isArray(v) && v.format === 1 && v.contextVersion === 1
    && (v.side === 'blue' || v.side === 'red')
    && Object.keys(identity).every(k => v[k] === identity[k as keyof RoleIdentity])
}
export function resolveMissionRole(f: MissionSource, read?: (context: string) => { id: string; answer: unknown } | null): { context: string; role: MissionSide | null; conditional: boolean } {
  const context = missionContext(f), [_, mission, clauses] = JSON.parse(context)
  if (['DS', 'RED', 'RED AIR'].includes(mission)) return { context, role: 'red', conditional: false }
  const conditional = cue.test(mission) || clauses.length > 0
  if (!conditional) return { context, role: 'blue', conditional: false }
  let role: MissionSide | null = null
  const found=read?.(context)
  if (found && validRoleAnswer(found.id,found.answer) && found.answer.context===context) role=found.answer.side
  return { context, role, conditional: true }
}
