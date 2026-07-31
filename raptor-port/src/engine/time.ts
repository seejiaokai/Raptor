import { VCONF } from './rules'
export const toMin=(t:any)=>{const[h,m]=t.split(':').map(Number);return h*60+m};
export const fromMin=(m:any)=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
export const minus=(t:any,n:any)=>fromMin(toMin(t)-n);
export function hhmm(m:any){return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
/* A window whose end reads EARLIER than its start has crossed midnight — an
   overnight duty, a night sortie landing after 00:00. Left as-is the interval
   is inverted and `overlap` can never match it, which silently switched every
   check off for that leg. Roll the end into the next day instead.
   `openEnd` covers a row with a start and no end at all: those used to produce
   no event whatsoever, so an open-ended meeting sitting on top of a take-off
   went unflagged. */
export function win(st:any,en:any,openEnd?:any){
  if(st==null)return null;
  let e=(en==null)?st+(openEnd||VCONF.openEnd):en;
  if(e<st)e+=1440;
  return [st,e];
}
/* land + 2h on a night wave, or T/O − 3h before dawn, can run past midnight in
   either direction — wrap so the clock never prints 25:10 or -1:40. */
export const hm24=(m:any)=>hhmm(((Math.round(m)%1440)+1440)%1440);
export function parseHM(s:any){ if(s==null||s==='')return null; const t=String(s).replace(/[hH]$/,'').replace(':',''); if(!/^\d{3,4}$/.test(t))return null; const n=+t; return Math.floor(n/100)*60+(n%100); }
export const overlap=(a1:any,a2:any,b1:any,b2:any)=>a1<b2&&b1<a2;
/* 720 → 12h · 140 → 2h20 · 30 → 30 min */
export function lgT(m:any){const h=Math.floor(m/60),x=m%60;
  return h&&x?`${h}h${String(x).padStart(2,'0')}`:h?`${h}h`:`${x} min`;}
