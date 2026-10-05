// @vitest-environment jsdom
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { setSession } from '../state/auth'
import { HOOKS } from '../engine/hooks'
import { intimesInner, dayHTML } from './html'
import { boardHTML } from './board'
import { routeFocusOut,routeKeyDown,routeReportingInput } from './textedit'
import { anchorEl } from './highlights'
import { initStore } from '../state/store'
import { Shell } from './Shell'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { setPage } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;

const original=JSON.stringify(DAYS),book=JSON.stringify(SCHED);
const w=()=>DAYS[0].waves[0];
const draw=()=>{document.body.innerHTML=`<div class="intimes iedit" data-warnkey="it:0.0">${intimesInner(w(),'0|0')}</div>`};
const line=()=>document.querySelector('[data-itline="0|0|1"]') as HTMLElement;
const feedback=()=>document.querySelector('[data-reporting-feedback]')!;
const type=(text:string)=>{line().textContent=text;routeReportingInput({target:line()} as unknown as Event)};
beforeEach(()=>{
  DAYS.splice(0,DAYS.length,...JSON.parse(original));
  DAYS[0].waves=[{label:'WAVE',intimes:['09:00 IN TIME','10:00 RALLY'],formations:[{cs:'VL',to:'12:00',ld:'13:00',br:'10:00',aircraft:[{p:'ignite',w:'bane',opts:{},rmks:''}]}]}];
  setSession({user:'ad',role:'admin'});initStore();vi.spyOn(HOOKS,'editMode').mockReturnValue(true);draw();
});
afterEach(()=>{vi.restoreAllMocks();document.body.innerHTML='';DAYS.splice(0,DAYS.length,...JSON.parse(original));Object.keys(SCHED).forEach(k=>delete SCHED[k]);Object.assign(SCHED,JSON.parse(book));});

describe('RT7 D502 live reporting feedback at the existing week/board doors',()=>{
  it('shows concrete wrong pair while typing without writing raw text, marks or history',()=>{
    const before=JSON.stringify({d:DAYS,s:SCHED});type('10:15 RALLY');
    expect(feedback().textContent).toContain('VL: rally 10:15 is later than brief 10:00.');
    expect(JSON.stringify({d:DAYS,s:SCHED})).toBe(before);
    expect(anchorEl(document,'it:0.0')).toBeTruthy();
    type('10:00 RALLY');expect(feedback().textContent).toBe('');
  });
  it('Shell delegates the actual reporting input event to live feedback before commit',async()=>{
    document.body.innerHTML='<div id="rally-root"></div>';setPage('editsched');
    const root=createRoot(document.getElementById('rally-root')!);
    try{
      await act(async()=>{root.render(<Shell/>)});
      const editor=document.querySelector('#eWeek [data-itline="0|0|1"]') as HTMLElement;
      expect(editor).toBeTruthy();const before=JSON.stringify({d:DAYS,s:SCHED});
      await act(async()=>{editor.textContent='10:15 RALLY';editor.dispatchEvent(new Event('input',{bubbles:true}))});
      expect(document.querySelector('#eWeek [data-reporting-feedback]')?.textContent).toContain('VL: rally 10:15 is later than brief 10:00.');
      expect(JSON.stringify({d:DAYS,s:SCHED})).toBe(before);
    }finally{await act(async()=>root.unmount())}
  });
  it('commits the invalid draft without silently changing it, then updates on correction',()=>{
    type('10:15 RALLY');routeFocusOut({target:line()} as unknown as FocusEvent);
    expect(w().intimes[1]).toBe('10:15 RALLY');expect(feedback().textContent).toContain('later than brief');
    type('10:00 RALLY');routeFocusOut({target:line()} as unknown as FocusEvent);
    expect(w().intimes[1]).toBe('10:00 RALLY');expect(feedback().textContent).toBe('');
  });
  it('Escape/no-op blur removes the unsaved preview without an edit',()=>{
    type('10:15 RALLY');line().focus();
    line().addEventListener('focusout',routeFocusOut);
    // The route reads event.target, so use a real dispatched key for the delegated handler.
    document.addEventListener('keydown',routeKeyDown);
    line().dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    document.removeEventListener('keydown',routeKeyDown);
    expect(w().intimes[1]).toBe('10:00 RALLY');expect(feedback().textContent).toBe('');
  });
  it('clear/delete removes the stale conflict preview',()=>{
    type('10:15 RALLY');type('');routeFocusOut({target:line()} as unknown as FocusEvent);
    expect(w().intimes).toEqual(['09:00 IN TIME']);expect(feedback().textContent).toBe('');
  });
  it('both real renderers rename in place; read-only has no active-feedback/editor controls',()=>{
    const week=dayHTML(0,true),board=boardHTML(0);
    for(const html of [week,board]){
      expect(html).toContain('+ In-time / Rally');expect(html).toContain('data-reporting-feedback');
      expect(html).toContain('data-warnkey="it:0.0"');
    }
    expect(intimesInner(w())).not.toContain('data-reporting-feedback');
    expect(dayHTML(0,false)).not.toContain('data-itadd');
  });
  it('review E both headers and the view day state the previous day without changing raw text',()=>{
    w().intimes=['23:00 IN TIME'];Object.assign(w().formations[0],{to:'01:30',ld:'03:00',br:'23:10'});
    expect(boardHTML(0)).toContain('<span class="asd">In-time / Rally 23:00 (prev day)');
    expect(dayHTML(0,true)).toContain('In-time / Rally 23:00 (prev day)');
    expect(dayHTML(0,false)).toContain('In-time / Rally 23:00 (prev day)');
    expect(w().intimes).toEqual(['23:00 IN TIME']);
    expect(boardHTML(0)).not.toContain('In-time / Rally -1:00');
  });
});
