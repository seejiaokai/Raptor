/* Insights annotations have their own guarded records and never enlist the programme.
   Physical settings rows are written exclusively by the command-stream mapper. */
import { commit, commandStream, CmdRefused, revisionOf, registerGuardedStore, registerRecord, definePermission, anyone, cmdDeferEffect, isInReducer } from '../command'
import { PEOPLE } from '../engine/people'
import type { EnlistableStore, RecordEntry, CommitResult, Txn } from '../command'
import { DAYS } from '../engine/data'
import { CURWEEK, isStandalone } from '../engine/waves'
import { SCHED, dayCurVer, daySnapOf, protectedWeek } from '../engine/publish'
import { dayIso, verIdLabel } from '../engine/verid'
import { encodeRoleId, decodeRoleId, validRoleAnswer, resolveMissionRole } from '../engine/mission-role'
import { validRoleSeeds } from '../engine/mission-role'
import { ensureRowIds } from '../engine/rowids'
import type { RoleAnswer, MissionSide, RoleIdentity } from '../engine/mission-role'
import { missionTracking, missionTrackingEpoch } from '../engine/insights-config'
import { HOOKS } from '../engine/hooks'
import { SESSION, canEditSched } from './auth'
import { CURPAGE, SBDAY, DPREV, VIEW_RESET, navGen } from './view'
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))
let answers = new Map<string, unknown>()
let generation = 0
let copySourceRids:Set<string>|null=null
export const invalidateRoleTargets = () => { generation++ }
export const roleTargetGeneration = () => generation
export const readRole = (id: string): RoleAnswer | undefined => {
  const value = answers.get(id)
  return validRoleAnswer(id, value) ? clone(value) : undefined
}
export function roleReader(): (week: string, date: string, rid: string, context: string) => unknown {
  const index = new Map([...answers].map(([id,value])=>[id,clone(value)]))
  return (weekKey, dayISO, formationRid, context) => {
    try { return index.get(encodeRoleId({ weekKey, dayISO, formationRid, context })) } catch { return undefined }
  }
}
/** Unknown records stay stored, inert, and available to a later compatible build. */
export function hydrateRoles(rows: Iterable<[string, unknown]>): void {
  answers = new Map([...rows].map(([id, v]) => [id, clone(v)]))
  invalidateRoleTargets()
}
export const roleStore: EnlistableStore = {
  key: 'insights.roles',
  capture: () => JSON.stringify([...answers]),
  restore: snap => { answers = new Map(JSON.parse(snap as string)) },
  records: () => new Map([...answers].map(([id, value]) => [`insights.role/${id}`, {collection:'insights.role' as const,id,value:clone(value)}])),
  signature: () => JSON.stringify([...answers]),
  write(entries: RecordEntry[], opts?:{restore?:boolean}): void {
    if (!isInReducer()) throw new CmdRefused('Mission roles require a typed command')
    for (const e of entries) {
      if (e.collection !== 'insights.role' || !decodeRoleId(e.id)) throw new CmdRefused('Invalid mission-role record')
      if (e.op === 'delete') answers.delete(e.id)
      else { if (!opts?.restore && !validRoleAnswer(e.id,e.value)) throw new CmdRefused('Invalid mission-role answer'); answers.set(e.id,clone(e.value)) }
    }
    cmdDeferEffect(HOOKS.renderEditWeek)
  },
}
function latestIssuedKey(di: number): string | null {
  const ver = dayCurVer(di)
  if (!ver) return null
  let n=0
  for (const k of Object.keys(SCHED.retired || {})) if (k.startsWith(ver+'~')) n=Math.max(n,Number(k.slice(k.lastIndexOf('~')+1)) || 0)
  return `${ver}~${n}`
}
function face(di: number) {
  const ver=DPREV.get(di)
  if (ver == null) return {day:DAYS[di],origin:'working',label:'Working copy'}
  if (ver !== dayCurVer(di)) return null
  const snap=daySnapOf(di,ver)
  return snap?.d ? {day:snap.d,origin:latestIssuedKey(di)!,label:`Published · ${verIdLabel(ver)}`} : null
}
function formation(di: number, rid: string) {
  const shown=face(di)
  if (!shown) return null
  for (const w of shown.day?.waves || []) if (!isStandalone(w)) {
    const f=(w.formations || []).find((v:any)=>v.rid===rid)
    if (f && !f.cx && f.aircraft?.some((a:any)=>!a.cx)) return { ...shown, f }
  }
  return null
}
const viewStamp = () => JSON.stringify([CURPAGE,SBDAY,[...DPREV],navGen()])
export type RoleTarget = RoleIdentity & { id:string; di:number; origin:string; label:string; name:string; dayRevision:number; roleRevision:number; session:unknown; generation:number; trackingEpoch:number; view:string; formation:unknown }
/** Captured at the real focused Remarks field; authority re-resolves every fact on apply. */
export function roleTarget(di: number, rid: string): RoleTarget | null {
  const source=formation(di,rid)
  if (!source) return null
  const result=resolveMissionRole(source.f)
  if (!result.conditional) return null
  const identity={weekKey:CURWEEK,dayISO:dayIso(CURWEEK,di),formationRid:rid,context:result.context}
  let id:string
  try { id=encodeRoleId(identity) } catch { return null }
  return {...identity,id,di,origin:source.origin,label:source.label,name:String(source.f.cs || rid),dayRevision:revisionOf('days',`${CURWEEK}#${di}`),roleRevision:revisionOf('insights.role',id),session:SESSION,generation,trackingEpoch:missionTrackingEpoch(),view:viewStamp(),formation:source.f}
}
/** The same QUESTION, re-resolved (D535, 3 Oct 26): an unrelated edit on the day moves the day's revision and may
 * replace the formation object, and the open question must survive it. Everything that identifies the question is
 * still required — the same formation and wording (the id), the same face, sign-in, view and generation, tracking On,
 * and nobody's answer to it in between; only the day's own revision is allowed to have moved. Returns the fresh
 * target the question continues on, or null when it is a different question (or none). */
export function sameQuestion(t: RoleTarget): RoleTarget | null {
  const now=roleTarget(t.di,t.formationRid)
  return now && missionTracking() && canEditSched() && !protectedWeek() && CURPAGE==='editsched'
    && t.id===now.id && t.weekKey===CURWEEK && t.origin===now.origin && t.session===SESSION
    && t.generation===generation && t.trackingEpoch===missionTrackingEpoch() && t.view===viewStamp()
    && t.roleRevision===now.roleRevision ? now : null
}
export function targetIsCurrent(t: RoleTarget): boolean {
  const now=sameQuestion(t)
  return !!now && t.dayRevision===now.dayRevision && t.formation===now.formation
}
export function setMissionRole(t: RoleTarget, side: MissionSide): CommitResult {
  return commit({type:'insights.role.set',scope:{module:'insights',weekId:t.weekKey},expectedRevs:{['insights.role/'+t.id]:t.roleRevision},meta:{key:JSON.stringify({name:t.name,origin:t.label})},apply(txn){
    if(t.roleRevision!==revisionOf('insights.role',t.id)) {
      const writer=commandStream().slice().reverse().find(e=>e.changes.some(c=>c.collection==='insights.role'&&c.id===t.id))
      const name=writer?.actor.personId?PEOPLE[writer.actor.personId]?.cs:writer?.actor.principal
      throw new CmdRefused(`${name||'Someone else'} changed this mission role. Select Remarks to try again.`)
    }
    if ((side!=='blue' && side!=='red') || !targetIsCurrent(t)) throw new CmdRefused('That mission-role question is no longer current')
    if (readRole(t.id)?.side===side) return
    txn.enlist(roleStore)
    roleStore.write!([{collection:'insights.role',id:t.id,value:{format:1,contextVersion:1,weekKey:t.weekKey,dayISO:t.dayISO,formationRid:t.formationRid,context:t.context,side}}])
  }})
}
/** Only an enclosing structure command may copy validated seeds to fresh identities. */
function copyMissionRoles(destinations: Array<RoleIdentity & {side:MissionSide}>): CommitResult {
  if (!isInReducer() || !copySourceRids) throw new CmdRefused('Mission-role copies require a fresh-identity structure command')
  return commit({type:'insights.role.copy',scope:{module:'insights',weekId:CURWEEK},apply(txn){
    if (!canEditSched()) throw new CmdRefused('Only a scheduler can copy mission roles')
    if (!destinations.length) return
    const entries:RecordEntry[]=[]
    for (const d of destinations) {
      const id=encodeRoleId(d)
      if (d.weekKey!==CURWEEK || copySourceRids!.has(d.formationRid) || answers.has(id)) throw new CmdRefused('Mission-role copy identity collision')
      const di=Array.from({length:7},(_,i)=>dayIso(CURWEEK,i)).indexOf(d.dayISO)
      const src=formation(di,d.formationRid)
      if (!src || src.origin!=='working' || resolveMissionRole(src.f).context!==d.context || !resolveMissionRole(src.f).conditional) throw new CmdRefused('Mission-role seed no longer matches')
      const value={...d,format:1,contextVersion:1}
      if (!validRoleAnswer(id,value)) throw new CmdRefused('Invalid mission-role seed')
      entries.push({collection:'insights.role',id,value})
    }
    txn.enlist(roleStore); roleStore.write!(entries)
  }})
}
/** The sole fresh-row adapter. Enlist before mutation and retain the source identity set until seeds finish. */
export function withFreshMissionRoles<T>(txn:Txn,create:()=>T):T {
  if(!isInReducer() || copySourceRids || !canEditSched())throw new CmdRefused('Invalid mission-role creation scope')
  txn.enlist(roleStore)
  copySourceRids=new Set(DAYS.flatMap(d=>(d.waves||[]).flatMap((w:any)=>(w.formations||[]).map((f:any)=>f.rid).filter((rid:unknown):rid is string=>typeof rid==='string'&&!!rid))))
  try{return create()}finally{copySourceRids=null}
}
export function registerMissionRoles(): void {
  if (!VIEW_RESET.some(r=>r.name==='missionRoleTargets')) VIEW_RESET.push({name:'missionRoleTargets',scopes:['week','session'],reset:invalidateRoleTargets})
  definePermission('insights.role.set',anyone); definePermission('insights.role.copy',anyone)
  registerGuardedStore(roleStore)
  registerRecord({key:'settings:missionrole:<encoded-id>',cls:'record',collection:'insights.role',module:'insights'})
  HOOKS.missionRoleEnabled=missionTracking; HOOKS.missionRoleReader=roleReader
  HOOKS.captureMissionRoleSeeds=(di,blob)=>{
    const seeds:any[]=[]
    for(const [wi,w] of (DAYS[di]?.waves || []).entries()) if(!isStandalone(w)) for(const [fi,f] of (w.formations || []).entries()) {
      const context=resolveMissionRole(f).context
      if(!f.rid) continue
      const value=readRole(encodeRoleId({weekKey:CURWEEK,dayISO:dayIso(CURWEEK,di),formationRid:f.rid,context}))
      if(value) seeds.push({path:[wi,fi],context,side:value.side})
    }
    return validRoleSeeds({format:1,seeds},blob)
  }
  HOOKS.applyMissionRoleSeeds=(di,raw)=>{
    ensureRowIds(DAYS)
    const seeds=validRoleSeeds(raw,DAYS[di])
    if(seeds) {
      const result=copyMissionRoles(seeds.seeds.map(s=>({weekKey:CURWEEK,dayISO:dayIso(CURWEEK,di),formationRid:DAYS[di].waves[s.path[0]]!.formations[s.path[1]]!.rid!,context:s.context,side:s.side})))
      if('ok' in result && !result.ok) throw new CmdRefused('Mission-role copy was refused')
    }
  }
}
