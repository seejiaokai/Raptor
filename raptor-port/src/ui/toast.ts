/* The toast — verbatim; wired into the engine's HOOKS.toast at app boot */
import { VIEW_RESET } from '../state/view'
const $=(id:any)=>document.getElementById(id)
export let toastT:any=null;
/* kind==='warn' tints the toast amber — used when something was allowed but is
   not right, e.g. dropping crew who are not current for the shift. */
export function toast(msg:any,kind:any){
  let t=$('toastEl'); if(!t){t=document.createElement('div');t.id='toastEl';
    /* above the scheduler board (400) and the drag ghost (520) — a toast raised
   from inside the board used to render behind it */
    /* pointer-events:none — a toast is never clicked, and it is only FADED, never
       removed, so at opacity 0 it went on swallowing every drop that landed on the
       bottom-centre of the screen: applyDrop got the toast, matched nothing, and
       returned silently. The dead rectangle even changed size with the last message,
       which is what made it feel random. */
    /* transition:opacity — part of the 25 Aug 26 motion set: the show fades
       in and the timeout's opacity='0' fades out instead of snapping. The
       blanket reduced-motion rule in scheduler.css kills it (its !important
       beats an inline style), so no JS gate is needed for this half. */
    t.style.cssText='position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:540;pointer-events:none;background:var(--panel-2);border:1px solid var(--edge-2);color:var(--ink);padding:10px 16px;border-radius:10px;font-size:12.5px;box-shadow:0 20px 50px -20px rgba(0,0,0,.8);transition:opacity .22s ease';document.body.appendChild(t);}
  t.textContent=msg; t.style.opacity='1';
  /* 'hard' (5 Sep 26) — the drop delta's colour for a breach the validator
     raised at hard severity: same red as the puck's own ring, same hold as
     a warn toast. Anything else keeps the plain face. */
  const tint=kind==='hard'?'var(--hard)':kind==='warn'?'var(--adv)':null;
  t.style.borderColor=tint||'var(--edge-2)';
  t.style.color=tint||'var(--ink)';
  /* the pop — a WAAPI rise, because the element's position is inline style,
     not a class a keyframe could target cleanly. Same guard idiom as
     InputsCal's month slide: no animate() in jsdom, and reduced-motion
     opts out (WAAPI is the one motion the CSS blanket cannot reach). The
     keyframes carry the base translateX(-50%) — dropping it would walk the
     toast off-centre for the length of the animation. */
  try{
    if(typeof (t as any).animate==='function'&&!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches))
      (t as any).animate(
        [{transform:'translateX(-50%) translateY(8px)'},{transform:'translateX(-50%)'}],
        {duration:200,easing:'cubic-bezier(.22,.61,.36,1)'})
  }catch(_){/* motion is decoration — a throw here must never eat the toast */}
  /* HOW LONG IT HOLDS — long enough to READ (owner, 21 Sep 26: "the inputs
     bubble warning timing is a bit too short as well to read it. Maybe
     increase the timing a bit if conflicts are recognised").
     It was a flat 2.6s plain / 4.2s tinted, which is fine for "Saved" and far
     too quick for the clash notes, which are whole sentences and sometimes
     several of them joined end to end — the longer the message, the more it
     mattered and the less time there was. So the hold now GROWS with the
     message: the flat time as a floor, then reading time on top, capped so a
     runaway message cannot park a toast on screen for ever. */
  const hold=Math.min(12000,Math.max(tint?4200:2600,String(msg).length*60+1200));
  if(toastT)clearTimeout(toastT); toastT=setTimeout(()=>t.style.opacity='0',hold);
}
/* A SIGN-IN OR SIGN-OUT TAKES THE TOAST DOWN ([ACCOUNTS], 26 Sep 26 — found by the walk):
   a message raised by one person ("viper@mail can sign in now") held for its full
   reading time and was still on screen when the next person signed in on the same
   browser. Every other transient already ends at the session reset (VIEW_RESET
   'session', ui/pops.ts); the toast joins them. */
export function clearToast(){ if(toastT){clearTimeout(toastT);toastT=null} if(typeof document==='undefined')return; const t=$('toastEl'); if(t)t.style.opacity='0' }   // no DOM in the node tests that sign in and out
VIEW_RESET.push({ name: 'TOAST', scopes: ['session'], reset: clearToast })
