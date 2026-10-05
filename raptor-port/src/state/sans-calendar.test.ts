// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { setSession, setEffectiveRole } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalUndo, globalRedo, undoState } from '../undo'
import { initStore } from './store'
import { commandStream, setConflictChecker } from '../command'
import { SETTINGS_ROW_PREFIXES } from './people-settings-commit'
import { getSansDay, getSansCutoffs, saveSansDay, saveSansCutoffs, sansShortage } from './sans-calendar'

const mem = new Map<string, string>()
beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => { if(v==='null') mem.delete(k); else mem.set(k,v) }, keys: () => [...mem.keys()] }
  initStore()
  setSession({ user:'admin-test', role:'admin' })
  _resetTimeline();installGlobalUndo()
})
afterEach(() => { setConflictChecker(null); setSession(null); storeBackend.impl = null;_resetTimeline();vi.restoreAllMocks() })

describe('SANS flying demand and editable deficit baselines (D570–D572/D580)', () => {
  it('distinguishes unset, zero, enough and over-target without negative deficits', () => {
    expect(sansShortage(2,null)).toMatchObject({tone:'none',needed:0,state:'unset'})
    expect(sansShortage(2,0)).toMatchObject({tone:'none',needed:0,state:'zero'})
    expect(sansShortage(2,2)).toMatchObject({tone:'none',needed:0,state:'enough'})
    expect(sansShortage(8,3)).toMatchObject({tone:'none',needed:0,state:'enough'})
  })
  it('uses inclusive amber1/red3 and displays deficits below an edited amber cutoff', () => {
    expect(sansShortage(3,4)).toMatchObject({tone:'amber',needed:1})
    expect(sansShortage(2,4)).toMatchObject({tone:'amber',needed:2})
    expect(sansShortage(1,4)).toMatchObject({tone:'red',needed:3})
    expect(sansShortage(0,4)).toMatchObject({tone:'red',needed:4})
    expect(sansShortage(4,5,{amberFrom:2,redFrom:4})).toMatchObject({tone:'none',needed:1,state:'short'})
  })
  it('reads delegated defaults and resets malformed older settings safely', () => {
    expect(getSansCutoffs()).toEqual({amberFrom:1,redFrom:3})
    mem.set('sqn142_sanscalendar',JSON.stringify({amberFrom:-1,redFrom:'bad'}))
    expect(getSansCutoffs()).toEqual({amberFrom:1,redFrom:3})
    mem.set('sqn142_sansday:2026-10-09',JSON.stringify({required:-2,flying:'weather'}))
    expect(getSansDay('2026-10-09')).toEqual({required:null,flying:'unset'})
  })
})

describe('typed admin settings use the existing settings record/command route', () => {
  it('writes one real-date row and keeps a second row untouched', () => {
    expect(SETTINGS_ROW_PREFIXES).toContain('sansday:')
    expect(saveSansDay('2026-10-09',{required:5,flying:'day'}).ok).toBe(true)
    expect(saveSansDay('2027-10-09',{required:0,flying:'night'}).ok).toBe(true)
    expect(getSansDay('2026-10-09')).toEqual({required:5,flying:'day'})
    expect(getSansDay('2027-10-09')).toEqual({required:0,flying:'night'})
    const env=commandStream().at(-1)!
    expect(env.type).toBe('sans.day.set')
    expect(env.changes.filter(c=>c.collection==='settings').map(c=>c.id)).toEqual(['sansday:2027-10-09'])
  })
  it('clears a target while preserving period; deletes an explicitly empty row', () => {
    saveSansDay('2026-10-09',{required:5,flying:'both'})
    saveSansDay('2026-10-09',{required:null,flying:'both'})
    expect(getSansDay('2026-10-09')).toEqual({required:null,flying:'both'})
    saveSansDay('2026-10-09',{required:null,flying:'unset'})
    expect(store.get('sansday:2026-10-09',null)).toBeNull()
  })
  it('saves thresholds atomically and rejects invalid values without replacing valid settings', () => {
    expect(saveSansCutoffs({amberFrom:2,redFrom:4}).ok).toBe(true)
    for(const value of [{amberFrom:0,redFrom:3},{amberFrom:3,redFrom:3},{amberFrom:1.5,redFrom:3},{amberFrom:1,redFrom:Infinity}]) {
      expect(saveSansCutoffs(value).ok).toBe(false)
      expect(getSansCutoffs()).toEqual({amberFrom:2,redFrom:4})
    }
  })
  it('rejects invalid dates, fractional/negative counts and unknown fields at the write path', () => {
    for(const iso of ['2026-02-29','2026-13-01','bad','2026-2-01']) expect(saveSansDay(iso,{required:5,flying:'day'}).ok).toBe(false)
    for(const value of [{required:-1,flying:'day'},{required:1.5,flying:'day'},{required:Infinity,flying:'day'},{required:5,flying:'sunrise'},{required:5,flying:'day',extra:true}]) {
      expect(saveSansDay('2026-10-09',value as any).ok).toBe(false)
    }
    expect(getSansDay('2026-10-09')).toEqual({required:null,flying:'unset'})
  })
  it('refuses a member and an admin acting in member view at the command boundary', () => {
    setSession({user:'member-test',role:'member'})
    expect(saveSansDay('2026-10-09',{required:5,flying:'night'}).ok).toBe(false)
    expect(saveSansCutoffs({amberFrom:2,redFrom:4}).ok).toBe(false)
    expect(getSansDay('2026-10-09').required).toBeNull()
    setSession({user:'admin-test',role:'admin'});setEffectiveRole('main')
    expect(saveSansDay('2026-10-09',{required:5,flying:'night'}).ok).toBe(false)
  })
  it('rejects naked date/config writes while allowing typed commands', () => {
    expect(()=>store.set('sansday:2026-10-09',{required:9,flying:'day'})).toThrow()
    expect(()=>store.set('sanscalendar',{amberFrom:2,redFrom:4})).toThrow()
    expect(saveSansDay('2026-10-09',{required:5,flying:'day'}).ok).toBe(true)
  })
  it('rolls a refused update back to its exact before-image', () => {
    saveSansDay('2026-10-09',{required:5,flying:'day'})
    setConflictChecker(changes=>changes.some(c=>c.id==='sansday:2026-10-09')?'test conflict':null)
    expect(saveSansDay('2026-10-09',{required:8,flying:'night'}).ok).toBe(false)
    expect(getSansDay('2026-10-09')).toEqual({required:5,flying:'day'})
  })
  it('uses real global Undo/Redo for a date row and global cutoffs, with meaningful labels',()=>{
    saveSansDay('2026-10-09',{required:5,flying:'night'})
    expect(undoState().undoLabel).toContain('SANS requirements')
    expect(globalUndo().ok).toBe(true);expect(getSansDay('2026-10-09')).toEqual({required:null,flying:'unset'})
    expect(globalRedo().ok).toBe(true);expect(getSansDay('2026-10-09')).toEqual({required:5,flying:'night'})
    saveSansCutoffs({amberFrom:2,redFrom:4})
    expect(globalUndo().ok).toBe(true);expect(getSansCutoffs()).toEqual({amberFrom:1,redFrom:3})
    expect(globalRedo().ok).toBe(true);expect(getSansCutoffs()).toEqual({amberFrom:2,redFrom:4})
  })
  it('refuses a swallowed legacy storage error and retains the before image',()=>{
    saveSansDay('2026-10-09',{required:5,flying:'day'})
    const original=storeBackend.impl!
    storeBackend.impl={...original,setItem:()=>{throw new Error('storage unavailable')}}
    vi.spyOn(console,'error').mockImplementation(()=>{})
    expect(saveSansDay('2026-10-09',{required:8,flying:'night'}).ok).toBe(false)
    expect(getSansDay('2026-10-09')).toEqual({required:5,flying:'day'})
  })
})
