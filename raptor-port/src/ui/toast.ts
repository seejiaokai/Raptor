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
    t.style.cssText='position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:540;pointer-events:none;background:var(--panel-2);border:1px solid var(--edge-2);color:var(--ink);padding:10px 16px;border-radius:10px;font-size:12.5px;box-shadow:0 20px 50px -20px rgba(0,0,0,.8)';document.body.appendChild(t);}
  t.textContent=msg; t.style.opacity='1';
  t.style.borderColor=kind==='warn'?'var(--adv)':'var(--edge-2)';
  t.style.color=kind==='warn'?'var(--adv)':'var(--ink)';
  if(toastT)clearTimeout(toastT); toastT=setTimeout(()=>t.style.opacity='0',kind==='warn'?4200:2600);
}

