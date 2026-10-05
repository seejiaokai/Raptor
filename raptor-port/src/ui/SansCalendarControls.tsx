import { useEffect, useRef, useState } from 'react'
import { HOOKS } from '../engine/hooks'
import { isAdmin } from '../state/perms'
import { notify } from '../state/store'
import { INPEDIT } from './pops'
import { getSansDay, getSansCutoffs, saveSansDay, saveSansCutoffs, type FlyingPeriod, type SansSaveResult } from '../state/sans-calendar'

export function FlyingIcons({period}:{period:FlyingPeriod}) {
  return <span className="sans-period">
    {(period==='day'||period==='both') && <svg viewBox="0 0 24 24" aria-label="Day flying" role="img"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>}
    {(period==='night'||period==='both') && <svg viewBox="0 0 24 24" aria-label="Night flying" role="img"><path d="M20 15.4A9 9 0 0 1 8.6 4a9 9 0 1 0 11.4 11.4Z"/></svg>}
  </span>
}
async function settled(r:SansSaveResult):Promise<SansSaveResult> { return r.pending ? settled(await r.pending) : r }
export function SansDayControls({iso}:{iso:string}) {
  const live=getSansDay(iso)
  const [required,setRequired]=useState(live.required===null?'':String(live.required))
  const [flying,setFlying]=useState<FlyingPeriod>(live.flying)
  const [message,setMessage]=useState(''), [busy,setBusy]=useState(false)
  if(!isAdmin()) return null
  return <form className="sans-admin" onSubmit={async e=>{
    e.preventDefault();setBusy(true);setMessage('')
    const r=await settled(saveSansDay(iso,{required:required.trim()===''?null:Number(required),flying}))
    setBusy(false)
    if(!r.ok){setMessage(r.message||'Could not save.');return}
    HOOKS.toast('SANS requirements saved','ok');notify()
  }}>
    <label htmlFor="sansRequired">Flying SANS required</label>
    <input id="sansRequired" type="number" min="0" step="1" inputMode="numeric" value={required} onChange={e=>setRequired(e.target.value)} />
    <p>Leave blank if no target has been set. Enter 0 when none are required.</p>
    <label htmlFor="sansFlying">Flying period</label>
    <select id="sansFlying" value={flying} onChange={e=>setFlying(e.target.value as FlyingPeriod)}>
      <option value="unset">Not set</option><option value="day">Day flying</option><option value="night">Night flying</option><option value="both">Day and night flying</option>
    </select>
    {message && <p role="alert">{message}</p>}
    <button className="abtn primary" id="sansDaySave" disabled={busy}>{busy?'Saving…':'Save day settings'}</button>
  </form>
}
export function SansColourControls() {
  const [open,setOpen]=useState(false)
  const wrapper=useRef<HTMLDivElement>(null), opener=useRef<HTMLButtonElement>(null)
  const admin=isAdmin()
  const live=getSansCutoffs()
  const [amber,setAmber]=useState(String(live.amberFrom)),[red,setRed]=useState(String(live.redFrom))
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false)
  useEffect(()=>{
    if(!admin){setOpen(false);return}
    if(!open)return
    const outside=(e:PointerEvent)=>{if(!wrapper.current?.contains(e.target as Node))setOpen(false)}
    const escape=(e:KeyboardEvent)=>{
      if(e.key!=='Escape'||INPEDIT)return
      e.preventDefault();e.stopImmediatePropagation();setOpen(false)
      if(opener.current?.isConnected)opener.current.focus()
    }
    document.addEventListener('pointerdown',outside,true)
    document.addEventListener('keydown',escape,true)
    return ()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',escape,true)}
  },[open,admin])
  if(!admin) return null
  return <div className="sans-colour-control" ref={wrapper}>
    <button type="button" className="abtn" id="sansColours" ref={opener} aria-expanded={open} aria-controls="sansColourForm" onClick={()=>{setAmber(String(live.amberFrom));setRed(String(live.redFrom));setMessage('');setOpen(!open)}}>Colour settings</button>
    {open && <form className="sans-colours" id="sansColourForm" onSubmit={async e=>{e.preventDefault();setBusy(true);const r=await settled(saveSansCutoffs({amberFrom:Number(amber),redFrom:Number(red)}));setBusy(false);if(!r.ok){setMessage(r.message||'Could not save.');return}setOpen(false);HOOKS.toast('Shortage colours saved','ok');notify()}}>
      <strong>Colour days by how many more people are needed</strong>
      <label htmlFor="sansAmber">Amber from</label><input id="sansAmber" type="number" min="1" step="1" value={amber} onChange={e=>setAmber(e.target.value)} />
      <label htmlFor="sansRed">Red from</label><input id="sansRed" type="number" min="2" step="1" value={red} onChange={e=>setRed(e.target.value)} />
      <p>Red takes priority. Counts include everyone, even when filtered.</p>
      {message && <p role="alert">{message}</p>}
      <div><button className="abtn primary" id="sansColourSave" disabled={busy}>Save colours</button><button type="button" className="abtn" onClick={()=>setOpen(false)}>Cancel</button></div>
    </form>}
  </div>
}
