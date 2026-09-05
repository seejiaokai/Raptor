/* The toast — verbatim; wired into the engine's HOOKS.toast at app boot */
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
  if(toastT)clearTimeout(toastT); toastT=setTimeout(()=>t.style.opacity='0',tint?4200:2600);
}

