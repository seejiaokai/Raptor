/* D558: phone week chrome only. Native blur remains the schedule's sole writer. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CURWEEK } from '../engine/waves'
import { SESSION } from '../state/auth'
import { CURPAGE, SBDAY, BOARDREV } from '../state/view'
import { notify } from '../state/store'
import { DRAWER, INSIGHTS, WEEKCAL, setInsights } from './pops'
import { useBoardVersion, useVersion } from './useStore'

type Scope = { page: string; week: string; session: unknown; board: number }
const currentScope = (): Scope => ({page:CURPAGE,week:CURWEEK,session:SESSION,board:BOARDREV})
const sameScope = (a: Scope, b: Scope) => a.page===b.page && a.week===b.week && a.session===b.session && a.board===b.board
const focusable = (el: HTMLElement | null) => !!el?.isConnected && el.getClientRects().length>0

export function ScheduleInsightsMenu({page,id}: {page:'editsched'|'viewsched';id:string}) {
  useVersion(); useBoardVersion()
  const [phone,setPhone]=useState(()=>window.innerWidth<=820)
  const [opened,setOpened]=useState<null | {scope:Scope;keyboard:boolean}>(null)
  const wrapper=useRef<HTMLSpanElement>(null), opener=useRef<HTMLButtonElement>(null), item=useRef<HTMLButtonElement>(null)
  const modalReturn=useRef<null | {scope:Scope;entered:boolean}>(null)
  const scope=currentScope()
  const eligible=phone && CURPAGE===page && SBDAY==null && !DRAWER && !WEEKCAL && !INSIGHTS
  const open=!!opened && eligible && sameScope(opened.scope,scope)
  useEffect(()=>{
    const resize=()=>setPhone(window.innerWidth<=820)
    window.addEventListener('resize',resize)
    return ()=>window.removeEventListener('resize',resize)
  },[])
  // Suppress stale popup synchronously in render, then discard it permanently.
  useLayoutEffect(()=>{if(opened && !open)setOpened(null)},[opened,open])
  useLayoutEffect(()=>{if(open && opened?.keyboard)item.current?.focus()},[open,opened])
  useLayoutEffect(()=>{
    const pending=modalReturn.current
    if(!pending)return
    if(!phone || !sameScope(pending.scope,scope) || DRAWER || SBDAY!=null){modalReturn.current=null;return}
    const active=document.activeElement
    const modal=document.getElementById('insightModal')
    if(INSIGHTS && !pending.entered){
      pending.entered=true
      if(active===document.body || active===opener.current || active===item.current || !active?.isConnected)
        document.getElementById('insightClose')?.focus()
    }else if(!INSIGHTS && pending.entered){
      modalReturn.current=null
      if((active===document.body || !!modal?.contains(active)) && focusable(opener.current))opener.current!.focus()
    }
  })
  useEffect(()=>{
    if(!open)return
    const outside=(e:PointerEvent)=>{if(!wrapper.current?.contains(e.target as Node))setOpened(null)}
    const escape=(e:KeyboardEvent)=>{
      if(e.key!=='Escape')return
      e.preventDefault(); e.stopPropagation(); setOpened(null)
      if(focusable(opener.current))opener.current!.focus()
    }
    document.addEventListener('pointerdown',outside)
    document.addEventListener('keydown',escape,true)
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape,true)}
  },[open])
  if(!phone)return null
  const show=(keyboard:boolean)=>{if(eligible)setOpened({scope:currentScope(),keyboard})}
  const select=()=>{
    if(!open)return
    modalReturn.current={scope:currentScope(),entered:false}
    setOpened(null); setInsights(true); notify()
  }
  return <span className="schedule-morewrap" ref={wrapper}
    onBlur={e=>{if(e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node))setOpened(null)}}>
    <button type="button" className={'abtn schedule-more'+(open?' on':'')} id={`${id}More`} ref={opener}
      aria-label="More schedule options" title="More schedule options" aria-haspopup="menu"
      aria-expanded={open} aria-controls={`${id}MoreMenu`}
      onClick={e=>open?setOpened(null):show(e.detail===0)}
      onKeyDown={e=>{if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();show(true)}}}>⋯</button>
    {open && <span className="schedule-moremenu" id={`${id}MoreMenu`} role="menu" aria-label="Schedule options">
      <button type="button" className="schedule-moreitem" id={`${id}MoreInsights`} role="menuitem" ref={item}
        onClick={select} onKeyDown={e=>{if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();item.current?.focus()}}}>Insights</button>
    </span>}
  </span>
}
